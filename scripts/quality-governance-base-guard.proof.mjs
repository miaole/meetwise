import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { objectDigest } from './quality-governance-check.mjs';
import {
  validateGovernanceHistoryBase,
  validateGovernanceRecordMetadata,
  validateGovernanceRecordSnapshots,
  validateNewGovernanceRecordSnapshots,
} from './quality-governance-base-guard.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(readFileSync(resolve(repoRoot, 'ai-docs/testing/governance-audit-index.json'), 'utf8'));
const baseline = JSON.parse(readFileSync(resolve(repoRoot, 'ai-docs/testing/traceability-baseline.json'), 'utf8'));
const governanceScopeId = 'quality-governance-control-plane';
const governanceRiskLevel = 'L3';

const governanceTerminal = index.records
  .filter((record) => record.scopeId === governanceScopeId && record.riskLevel === governanceRiskLevel)
  .toSorted((left, right) => left.revision - right.revision)
  .at(-1);
const governanceNextRevision = governanceTerminal.revision + 1;
const governanceNextTaskId = `${governanceScopeId}-v${governanceNextRevision}`;

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function governedPathDigest(path, content) {
  return `sha256:${createHash('sha256').update(Buffer.concat([
    Buffer.from(path),
    Buffer.from('\0'),
    Buffer.from(content),
    Buffer.from('\0'),
  ])).digest('hex')}`;
}

function minimalRecord({ taskId, scopeId, governedPaths, governedPathDigest: pathDigest }) {
  const record = {
    taskId,
    scopeId,
    riskLevel: 'L1',
    status: 'blocked',
    revision: 1,
    successorOf: null,
    governedPaths,
    governedPathDigest: pathDigest,
    harness: { scope: taskId },
    harnessDigest: '',
    audit: {
      lenses: [],
      reviewerIds: [],
      summary: `${taskId} metadata fixture`,
      summaryDigest: '',
      decision: 'blocked',
      reviewScopeDigest: '',
      reviewedFindingIds: [],
      selfCheckReason: 'fixture',
    },
    findings: [],
    baselineChange: null,
    recordDigest: '',
  };
  refreshRecordDigest(record);
  return record;
}

function minimalBaseline() {
  const frozenUnmappedLeafTcIds = [];
  return {
    schemaVersion: 1,
    releaseEvidence: false,
    sourceManifestPath: 'ai-docs/testing/traceability-manifest.json',
    frozenUnmappedLeafTcIds,
    frozenUnmappedLeafTcIdsDigest: objectDigest(frozenUnmappedLeafTcIds),
    expansions: [],
  };
}

function minimalIndex(records, baseline) {
  return {
    schemaVersion: 1,
    releaseEvidence: false,
    traceabilityBaselineAnchorDigest: baseline.frozenUnmappedLeafTcIdsDigest,
    records,
  };
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findingFor(record, findingId = 'GOV-QG-001') {
  const finding = record.findings?.find((item) => item.findingId === findingId);
  assert.ok(finding, `missing fixture finding:${findingId}`);
  return finding;
}

function successorDescendantTaskIds(records, predecessorTaskId) {
  const descendants = new Set([predecessorTaskId]);
  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const record of records) {
      if (descendants.has(record.successorOf) && !descendants.has(record.taskId)) {
        descendants.add(record.taskId);
        expanded = true;
      }
    }
  }
  return descendants;
}

function resultFor(values = {}) {
  return validateGovernanceHistoryBase({
    baseIndex: Object.hasOwn(values, 'baseIndex') ? values.baseIndex : index,
    currentIndex: Object.hasOwn(values, 'currentIndex') ? values.currentIndex : index,
    baseBaseline: Object.hasOwn(values, 'baseBaseline') ? values.baseBaseline : baseline,
    currentBaseline: Object.hasOwn(values, 'currentBaseline') ? values.currentBaseline : baseline,
  });
}

function expectError(candidate, prefix) {
  const result = resultFor(candidate);
  assert.equal(result.valid, false, `expected ${prefix} to fail`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

function successorRecord(taskId, parentTaskId, baselineChange = null) {
  const record = clone(index.records.find((item) => item.taskId === governanceTerminal.taskId));
  record.taskId = taskId;
  record.revision = governanceNextRevision;
  record.successorOf = parentTaskId;
  record.baselineChange = baselineChange;
  refreshRecordDigest(record);
  return record;
}

function refreshRecordDigest(record) {
  record.harnessDigest = objectDigest(record.harness);
  record.audit.summaryDigest = objectDigest(record.audit.summary);
  record.audit.reviewScopeDigest = objectDigest({
    taskId: record.taskId,
    scopeId: record.scopeId,
    revision: record.revision,
    riskLevel: record.riskLevel,
    governedPathDigest: record.governedPathDigest,
    harnessDigest: record.harnessDigest,
    reviewerIds: [...record.audit.reviewerIds].sort(),
    summaryDigest: record.audit.summaryDigest,
    reviewedFindingIds: [...record.audit.reviewedFindingIds].sort(),
  });
  const { recordDigest: ignored, ...withoutDigest } = record;
  record.recordDigest = objectDigest(withoutDigest);
}

function expansionFor(taskId, baseLine = baseline) {
  let allowed = [...baseLine.frozenUnmappedLeafTcIds];
  for (const expansion of baseLine.expansions) {
    allowed = [...new Set([...allowed, ...expansion.addedUnmappedLeafTcIds])].sort();
  }
  const previousAllowedUnmappedLeafTcIdsDigest = objectDigest(allowed);
  const addedUnmappedLeafTcIds = ['TC-quality-99-main'];
  const resultingAllowedUnmappedLeafTcIdsDigest = objectDigest([
    ...allowed,
    ...addedUnmappedLeafTcIds,
  ].sort());
  return {
    changeRecordTaskId: taskId,
    previousAllowedUnmappedLeafTcIdsDigest,
    resultingAllowedUnmappedLeafTcIdsDigest,
    addedUnmappedLeafTcIds,
    expansionJustification: 'A newly documented historical leaf must be explicitly governed before it expands the permitted gap.',
  };
}

const checks = {
  append_only_current_tree: () => {
    const result = resultFor();
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.stats.mode, 'append_only');
  },
  bootstrap_requires_artifact_pair: () => {
    const result = resultFor({ baseIndex: undefined, baseBaseline: undefined });
    assert.equal(result.valid, false, 'a missing base must never bootstrap itself');
    assert.ok(result.errors.includes('history_base_artifacts_missing:index-baseline'));
    expectError({ baseIndex: undefined, baseBaseline: baseline }, 'history_base_artifact_pair_mismatch:index-baseline');
  },
  rejects_recomputed_history_rewrite: () => {
    const currentIndex = clone(index);
    currentIndex.records[0].findings[0].status = 'closed';
    currentIndex.records[0].recordDigest = objectDigest({
      ...currentIndex.records[0],
      recordDigest: undefined,
    });
    expectError({ currentIndex }, 'history_record_mutated:quality-governance-control-plane-v1');
    expectError({ currentIndex }, 'history_records_not_append_only:0');
  },
  rejects_removal_or_reorder: () => {
    const removed = clone(index);
    removed.records.shift();
    expectError({ currentIndex: removed }, 'history_record_removed:quality-governance-control-plane-v1');
    const reordered = clone(index);
    reordered.records.reverse();
    expectError({ currentIndex: reordered }, 'history_records_not_append_only:0');
  },
  accepts_single_successor_and_rejects_fork: () => {
    const currentIndex = clone(index);
    currentIndex.records.push(successorRecord(governanceNextTaskId, governanceTerminal.taskId));
    const valid = resultFor({ currentIndex });
    assert.equal(valid.valid, true, valid.errors.join('\n'));
    currentIndex.records.push(successorRecord(`${governanceScopeId}-alt-v${governanceNextRevision}`, governanceTerminal.taskId));
    expectError({ currentIndex }, `history_successor_fork:${governanceTerminal.taskId}`);
    expectError({ currentIndex }, `history_scope_risk_revision_duplicate:${governanceScopeId}:${governanceRiskLevel}:${governanceNextRevision}`);
  },
  rejects_successor_finding_erasure_or_downgrade: () => {
    const erased = clone(index);
    const eraseSuccessor = successorRecord(governanceNextTaskId, governanceTerminal.taskId);
    eraseSuccessor.findings = [];
    eraseSuccessor.audit.reviewedFindingIds = [];
    erased.records.push(eraseSuccessor);
    expectError({ currentIndex: erased }, `history_successor_finding_missing:${governanceNextTaskId}:GOV-QG-001`);
    const downgraded = clone(index);
    const downgradeSuccessor = successorRecord(governanceNextTaskId, governanceTerminal.taskId);
    findingFor(downgradeSuccessor).severity = 'P2';
    downgraded.records.push(downgradeSuccessor);
    expectError({ currentIndex: downgraded }, `history_successor_finding_severity_changed:${governanceNextTaskId}:GOV-QG-001`);
    const closedWithoutEvidence = clone(index);
    const closureFixtureDescendants = successorDescendantTaskIds(
      closedWithoutEvidence.records,
      'quality-governance-control-plane-v3',
    );
    closedWithoutEvidence.records = closedWithoutEvidence.records.filter((record) => !closureFixtureDescendants.has(record.taskId));
    const closeSuccessor = clone(index.records.find((record) => record.taskId === 'quality-governance-control-plane-v2'));
    closeSuccessor.taskId = 'quality-governance-control-plane-v3';
    closeSuccessor.revision = 3;
    closeSuccessor.successorOf = 'quality-governance-control-plane-v2';
    findingFor(closeSuccessor).status = 'closed';
    closedWithoutEvidence.records.push(closeSuccessor);
    expectError({ currentIndex: closedWithoutEvidence }, 'history_successor_finding_closure_evidence_missing:quality-governance-control-plane-v3:GOV-QG-001');
  },
  rejects_non_successor_revision: () => {
    const currentIndex = clone(index);
    const invalid = successorRecord(governanceNextTaskId, governanceTerminal.taskId);
    invalid.successorOf = null;
    currentIndex.records.push(invalid);
    expectError({ currentIndex }, `history_successor_required:${governanceNextTaskId}`);
  },
  rejects_new_l3_record_without_valid_audit_semantics: () => {
    const baseIndex = clone(index);
    baseIndex.records.pop();
    const currentIndex = clone(index);
    const forged = currentIndex.records.at(-1);
    forged.status = 'done';
    forged.harness.authorizationConclusion = 'done';
    forged.audit.decision = 'approved';
    forged.audit.reviewerIds = [];
    forged.audit.summary = '';
    refreshRecordDigest(forged);
    expectError({ baseIndex, currentIndex }, `history_audit_reviewer_ids_invalid:${forged.taskId}`);
    expectError({ baseIndex, currentIndex }, `history_audit_summary_invalid:${forged.taskId}`);
  },
  rejects_frozen_baseline_rewrite: () => {
    const currentBaseline = clone(baseline);
    currentBaseline.frozenUnmappedLeafTcIds.push('TC-quality-99-main');
    currentBaseline.frozenUnmappedLeafTcIds.sort();
    currentBaseline.frozenUnmappedLeafTcIdsDigest = objectDigest(currentBaseline.frozenUnmappedLeafTcIds);
    const currentIndex = clone(index);
    currentIndex.traceabilityBaselineAnchorDigest = currentBaseline.frozenUnmappedLeafTcIdsDigest;
    expectError({ currentIndex, currentBaseline }, 'history_baseline_immutable_field_mutated:frozenUnmappedLeafTcIds');
  },
  rejects_corrupt_base_frozen_digest: () => {
    const baseBaseline = clone(baseline);
    baseBaseline.frozenUnmappedLeafTcIdsDigest = `sha256:${'0'.repeat(64)}`;
    const baseIndex = clone(index);
    baseIndex.traceabilityBaselineAnchorDigest = baseBaseline.frozenUnmappedLeafTcIdsDigest;
    const currentBaseline = clone(baseBaseline);
    const currentIndex = clone(baseIndex);
    expectError({ baseIndex, currentIndex, baseBaseline, currentBaseline }, 'history_base_frozen_digest_invalid:frozenUnmappedLeafTcIds');
  },
  expansion_must_append_with_a_successor: () => {
    const changeRecordTaskId = governanceNextTaskId;
    const expansion = expansionFor(changeRecordTaskId);
    const validIndex = clone(index);
    validIndex.records.push(successorRecord(changeRecordTaskId, governanceTerminal.taskId, {
      previousAllowedUnmappedLeafTcIdsDigest: expansion.previousAllowedUnmappedLeafTcIdsDigest,
      resultingAllowedUnmappedLeafTcIdsDigest: expansion.resultingAllowedUnmappedLeafTcIdsDigest,
      addedUnmappedLeafTcIds: expansion.addedUnmappedLeafTcIds,
      expansionJustification: expansion.expansionJustification,
    }));
    const validBaseline = clone(baseline);
    validBaseline.expansions.push(expansion);
    const valid = resultFor({ currentIndex: validIndex, currentBaseline: validBaseline });
    assert.equal(valid.valid, true, valid.errors.join('\n'));
    const missingRecordIndex = clone(index);
    expectError({ currentIndex: missingRecordIndex, currentBaseline: validBaseline }, `history_new_expansion_successor_missing:${changeRecordTaskId}`);
    const initialRecordIndex = clone(validIndex);
    initialRecordIndex.records.at(-1).revision = 1;
    initialRecordIndex.records.at(-1).successorOf = null;
    expectError({ currentIndex: initialRecordIndex, currentBaseline: validBaseline }, `history_new_expansion_successor_invalid:${changeRecordTaskId}`);
  },
  rejects_existing_expansion_rewrite: () => {
    const firstTaskId = governanceNextTaskId;
    const firstExpansion = expansionFor(firstTaskId);
    const baseIndex = clone(index);
    baseIndex.records.push(successorRecord(firstTaskId, governanceTerminal.taskId, {
      previousAllowedUnmappedLeafTcIdsDigest: firstExpansion.previousAllowedUnmappedLeafTcIdsDigest,
      resultingAllowedUnmappedLeafTcIdsDigest: firstExpansion.resultingAllowedUnmappedLeafTcIdsDigest,
      addedUnmappedLeafTcIds: firstExpansion.addedUnmappedLeafTcIds,
      expansionJustification: firstExpansion.expansionJustification,
    }));
    const baseBaseline = clone(baseline);
    baseBaseline.expansions.push(firstExpansion);
    const currentBaseline = clone(baseBaseline);
    currentBaseline.expansions[0].expansionJustification = 'Rewritten after it was part of the trusted base.';
    expectError({ baseIndex, currentIndex: clone(baseIndex), baseBaseline, currentBaseline }, 'history_baseline_expansion_mutated:0');
  },
  validates_immutable_snapshot_metadata: () => {
    const valid = validateGovernanceRecordSnapshots(index, (record) => record.governedPathDigest);
    assert.equal(valid.valid, true, valid.errors.join('\n'));
    const forged = clone(index);
    forged.records[0].governedPathDigest = `sha256:${'0'.repeat(64)}`;
    forged.records[0].audit.reviewScopeDigest = objectDigest({
      taskId: forged.records[0].taskId,
      scopeId: forged.records[0].scopeId,
      revision: forged.records[0].revision,
      riskLevel: forged.records[0].riskLevel,
      governedPathDigest: forged.records[0].governedPathDigest,
      harnessDigest: forged.records[0].harnessDigest,
      reviewerIds: [...forged.records[0].audit.reviewerIds].sort(),
      summaryDigest: forged.records[0].audit.summaryDigest,
      reviewedFindingIds: [...forged.records[0].audit.reviewedFindingIds].sort(),
    });
    const { recordDigest: ignored, ...withoutDigest } = forged.records[0];
    forged.records[0].recordDigest = objectDigest(withoutDigest);
    const result = validateGovernanceRecordSnapshots(forged, (record) => index.records.find((item) => item.taskId === record.taskId).governedPathDigest);
    assert.equal(result.valid, false, 'forged path digest must fail against the trusted snapshot tree');
    assert.ok(result.errors.some((error) => error.startsWith('history_snapshot_path_digest_mismatch:quality-governance-control-plane-v1')));
  },
  validates_protected_base_metadata_without_replaying_paths: () => {
    const result = validateGovernanceRecordMetadata(index);
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.stats.recordCount, index.records.length);
  },
  validates_only_new_records_against_their_introduction_tree: () => {
    const baseIndex = clone(index);
    baseIndex.records.pop();
    const currentIndex = clone(index);
    const introduced = currentIndex.records.at(-1);
    const introductions = new Map([[introduced.taskId, { commit: 'a'.repeat(40), record: clone(introduced) }]]);
    const result = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions,
      snapshotDigestForIntroduction: (_commit, paths) => {
        assert.deepEqual(paths, introduced.governedPaths);
        return introduced.governedPathDigest;
      },
    });
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.deepEqual(result.stats, { newRecordCount: 1, verifiedRecordCount: 1 });
  },
  rejects_new_record_mutated_after_introduction: () => {
    const baseIndex = clone(index);
    baseIndex.records.pop();
    const currentIndex = clone(index);
    const introduced = currentIndex.records.at(-1);
    const introductionRecord = clone(introduced);
    introduced.governedPaths.push('scripts/quality-governance-bootstrap-fixture.mjs');
    refreshRecordDigest(introduced);
    const result = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions: new Map([[introduced.taskId, { commit: 'b'.repeat(40), record: introductionRecord }]]),
      snapshotDigestForIntroduction: () => introduced.governedPathDigest,
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes(`history_new_record_mutated_after_introduction:${introduced.taskId}`));
  },
  rejects_new_record_missing_or_mismatched_introduction_snapshot: () => {
    const baseIndex = clone(index);
    baseIndex.records.pop();
    const currentIndex = clone(index);
    const introduced = currentIndex.records.at(-1);
    const missing = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions: new Map(),
      snapshotDigestForIntroduction: () => introduced.governedPathDigest,
    });
    assert.ok(missing.errors.includes(`history_new_snapshot_introduction_missing:${introduced.taskId}`));
    const unreadable = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions: new Map([[introduced.taskId, { commit: 'c'.repeat(40), record: clone(introduced) }]]),
      snapshotDigestForIntroduction: () => { throw new Error('missing path in introduction tree'); },
    });
    assert.ok(unreadable.errors.includes(`history_new_record_snapshot_unreadable:${introduced.taskId}`));
    const mismatch = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions: new Map([[introduced.taskId, { commit: 'd'.repeat(40), record: clone(introduced) }]]),
      snapshotDigestForIntroduction: () => `sha256:${'0'.repeat(64)}`,
    });
    assert.ok(mismatch.errors.includes(`history_new_record_path_digest_mismatch:${introduced.taskId}`));
  },
  rejects_forged_l1_metadata_before_path_snapshot: () => {
    const baseIndex = clone(index);
    const currentIndex = clone(baseIndex);
    const introduced = clone(index.records.at(-1));
    introduced.taskId = 'governance-bootstrap-l1';
    introduced.scopeId = 'governance-bootstrap-l1';
    introduced.riskLevel = 'L1';
    introduced.revision = 1;
    introduced.successorOf = null;
    introduced.findings = [];
    introduced.audit.reviewedFindingIds = [];
    refreshRecordDigest(introduced);
    introduced.harnessDigest = `sha256:${'0'.repeat(64)}`;
    currentIndex.records.push(introduced);
    const result = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions: new Map([[introduced.taskId, { commit: 'a'.repeat(40), record: clone(introduced) }]]),
      snapshotDigestForIntroduction: () => introduced.governedPathDigest,
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes(`history_metadata_harness_digest_mismatch:${introduced.taskId}`));
  },
  validates_distinct_introduction_commits_for_multiple_new_records: () => {
    const baseIndex = clone(index);
    baseIndex.records.splice(-2);
    const currentIndex = clone(index);
    const first = currentIndex.records.at(-2);
    const second = currentIndex.records.at(-1);
    const introductions = new Map([
      [first.taskId, { commit: 'e'.repeat(40), record: clone(first) }],
      [second.taskId, { commit: 'f'.repeat(40), record: clone(second) }],
    ]);
    const result = validateNewGovernanceRecordSnapshots({
      baseIndex,
      currentIndex,
      introductions,
      snapshotDigestForIntroduction: (commit, paths) => {
        assert.ok(['e'.repeat(40), 'f'.repeat(40)].includes(commit));
        const record = [first, second].find((item) => item.governedPaths === paths || JSON.stringify(item.governedPaths) === JSON.stringify(paths));
        return record.governedPathDigest;
      },
    });
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.deepEqual(result.stats, { newRecordCount: 2, verifiedRecordCount: 2 });
  },
  exercises_real_git_base_to_head_introduction_resolution: () => {
    const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'meetwise-governance-history-'));
    try {
      git(fixtureRoot, ['init', '--quiet']);
      git(fixtureRoot, ['config', 'user.email', 'fixture@example.invalid']);
      git(fixtureRoot, ['config', 'user.name', 'Governance Fixture']);
      mkdirSync(resolve(fixtureRoot, 'ai-docs/testing'), { recursive: true });
      mkdirSync(resolve(fixtureRoot, 'scripts'), { recursive: true });
      const baseline = minimalBaseline();
      const baseRecord = minimalRecord({
        taskId: 'fixture-base-record',
        scopeId: 'fixture-base',
        governedPaths: ['scripts/not-present-in-public-import.mjs'],
        governedPathDigest: `sha256:${'1'.repeat(64)}`,
      });
      writeJson(resolve(fixtureRoot, 'ai-docs/testing/governance-audit-index.json'), minimalIndex([baseRecord], baseline));
      writeJson(resolve(fixtureRoot, 'ai-docs/testing/traceability-baseline.json'), baseline);
      git(fixtureRoot, ['add', '.']);
      git(fixtureRoot, ['commit', '--quiet', '-m', 'base metadata anchor']);
      const base = git(fixtureRoot, ['rev-parse', 'HEAD']);

      const newPath = 'scripts/new-record.mjs';
      const newContent = 'export const introduced = true;\n';
      writeFileSync(resolve(fixtureRoot, newPath), newContent);
      const newRecord = minimalRecord({
        taskId: 'fixture-new-record',
        scopeId: 'fixture-new',
        governedPaths: [newPath],
        governedPathDigest: governedPathDigest(newPath, newContent),
      });
      writeJson(resolve(fixtureRoot, 'ai-docs/testing/governance-audit-index.json'), minimalIndex([baseRecord, newRecord], baseline));
      git(fixtureRoot, ['add', '.']);
      git(fixtureRoot, ['commit', '--quiet', '-m', 'introduce governed record']);
      const introduction = git(fixtureRoot, ['rev-parse', 'HEAD']);

      const guardPath = resolve(repoRoot, 'scripts/quality-governance-base-guard.mjs');
      const successful = JSON.parse(execFileSync(process.execPath, [guardPath, '--base', base, '--head', introduction], {
        cwd: fixtureRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }));
      assert.equal(successful.history.valid, true);
      assert.deepEqual(successful.baseMetadataIntegrity.stats, { recordCount: 1 });
      assert.deepEqual(successful.newRecordSnapshotVerification.stats, { newRecordCount: 1, verifiedRecordCount: 1 });

      newRecord.harness.scope = 'mutated after introduction';
      refreshRecordDigest(newRecord);
      writeJson(resolve(fixtureRoot, 'ai-docs/testing/governance-audit-index.json'), minimalIndex([baseRecord, newRecord], baseline));
      git(fixtureRoot, ['add', '.']);
      git(fixtureRoot, ['commit', '--quiet', '-m', 'mutate introduced record']);
      const mutatedHead = git(fixtureRoot, ['rev-parse', 'HEAD']);
      let failedOutput = '';
      try {
        execFileSync(process.execPath, [guardPath, '--base', base, '--head', mutatedHead], {
          cwd: fixtureRoot,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
      } catch (error) {
        failedOutput = String(error.stdout ?? '');
      }
      const failed = JSON.parse(failedOutput);
      assert.equal(failed.newRecordSnapshotVerification.valid, false);
      assert.ok(failed.newRecordSnapshotVerification.errors.includes('history_new_record_mutated_after_introduction:fixture-new-record'));
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  },
};

for (const [name, check] of Object.entries(checks)) {
  check();
  console.log(`✓ ${name}`);
}
console.log(`static_preflight_valid: selected=${Object.keys(checks).length}/${Object.keys(checks).length}; releaseEvidence=false`);
