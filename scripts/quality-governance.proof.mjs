import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  governedPathDigest,
  objectDigest,
  validateGovernanceAuditIndex,
  validateTraceabilityBaseline,
} from './quality-governance-check.mjs';
import { collectDocumentedTraceability } from './quality-traceability-check.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = JSON.parse(readFileSync(resolve(repoRoot, 'ai-docs/testing/governance-audit-index.json'), 'utf8'));
const baseline = JSON.parse(readFileSync(resolve(repoRoot, 'ai-docs/testing/traceability-baseline.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(repoRoot, 'ai-docs/testing/traceability-manifest.json'), 'utf8'));
const documented = collectDocumentedTraceability(repoRoot);
const governanceScopeId = 'quality-governance-control-plane';
const governanceRiskLevel = 'L3';

function terminalRecord(records, scopeId, riskLevel) {
  return records
    .filter((record) => record.scopeId === scopeId && record.riskLevel === riskLevel)
    .toSorted((left, right) => left.revision - right.revision)
    .at(-1);
}

const governanceTerminal = terminalRecord(index.records, governanceScopeId, governanceRiskLevel);
const governanceNextRevision = governanceTerminal.revision + 1;
const governanceNextTaskId = `${governanceScopeId}-v${governanceNextRevision}`;

function governanceSuccessor(candidateIndex) {
  const successor = clone(candidateIndex.records.find((record) => record.taskId === governanceTerminal.taskId));
  successor.taskId = governanceNextTaskId;
  successor.revision = governanceNextRevision;
  successor.successorOf = governanceTerminal.taskId;
  return successor;
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findingFor(record, findingId = 'GOV-QG-001') {
  const finding = record.findings?.find((item) => item.findingId === findingId);
  assert.ok(finding, `missing fixture finding:${findingId}`);
  return finding;
}

function closeOpenP0P1Findings(record, evidence = 'independent-review-declaration:fixture') {
  for (const finding of record.findings ?? []) {
    if (['P0', 'P1'].includes(finding.severity) && finding.status !== 'closed') {
      finding.status = 'closed';
      finding.closureEvidence = evidence;
    }
  }
}

function refreshRecord(record) {
  record.harnessDigest = objectDigest(record.harness);
  record.governedPathDigest = governedPathDigest(repoRoot, record.governedPaths);
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

function governanceResult(candidate, candidateBaseline = baseline) {
  return validateGovernanceAuditIndex(candidate, { repoRoot, manifest, documented, baseline: candidateBaseline });
}

function baselineResult(candidate, docs = documented, candidateIndex = index) {
  return validateTraceabilityBaseline(candidate, manifest, docs, candidateIndex);
}

function expectGovernanceError(candidate, prefix) {
  const result = governanceResult(candidate);
  assert.equal(result.valid, false, `expected ${prefix} to fail`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

function expectBaselineError(candidate, prefix, docs = documented) {
  const result = baselineResult(candidate, docs);
  assert.equal(result.valid, false, `expected ${prefix} to fail`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

const checks = {
  'TC-quality-03-main': () => {
    const governance = governanceResult(index);
    const traceabilityBaseline = baselineResult(baseline);
    assert.equal(governance.valid, true, governance.errors.join('\n'));
    assert.equal(traceabilityBaseline.valid, true, traceabilityBaseline.errors.join('\n'));
    assert.equal(governance.stats.staticPreflightOnly, true);
    assert.equal(governance.stats.releaseEvidence, false);
    assert.equal(governance.stats.recordCount, index.records.length);
    assert.ok(index.records.some((record) => record.taskId === 'quality-governance-control-plane-v4'));
    assert.ok(index.records.some((record) => record.taskId === 'public-text-policy-control-plane-v4'));
    assert.equal(traceabilityBaseline.stats.currentUnmappedLeafCount <= traceabilityBaseline.stats.baselineUnmappedLeafCount, true);
    const source = readFileSync(resolve(repoRoot, 'scripts/quality-governance-check.mjs'), 'utf8');
    assert.doesNotMatch(source, /process\.env|child_process|execSync|spawnSync|https?:\/\//);
  },
  'TC-quality-03-E1': () => {
    const candidate = clone(index);
    candidate.records.push(clone(candidate.records[0]));
    expectGovernanceError(candidate, 'record_duplicate:quality-governance-control-plane-v1');
  },
  'TC-quality-03-E2': () => {
    const candidate = clone(index);
    const successor = governanceSuccessor(candidate);
    successor.successorOf = null;
    candidate.records.push(successor);
    expectGovernanceError(candidate, `successor_required:${governanceNextTaskId}`);
    const wrongScope = clone(index);
    const wrongScopeSuccessor = governanceSuccessor(wrongScope);
    wrongScopeSuccessor.scopeId = 'different-governance-scope';
    wrongScope.records.push(wrongScopeSuccessor);
    expectGovernanceError(wrongScope, `successor_chain_invalid:${governanceNextTaskId}`);
    const validSuccessor = clone(index);
    const validSuccessorRecord = governanceSuccessor(validSuccessor);
    refreshRecord(validSuccessorRecord);
    validSuccessor.records.push(validSuccessorRecord);
    assert.equal(governanceResult(validSuccessor).valid, true, governanceResult(validSuccessor).errors.join('\n'));
    const staleHistory = clone(index);
    staleHistory.records[0].governedPathDigest = `sha256:${'0'.repeat(64)}`;
    staleHistory.records[0].audit.reviewScopeDigest = objectDigest({
      taskId: staleHistory.records[0].taskId,
      scopeId: staleHistory.records[0].scopeId,
      revision: staleHistory.records[0].revision,
      riskLevel: staleHistory.records[0].riskLevel,
      governedPathDigest: staleHistory.records[0].governedPathDigest,
      harnessDigest: staleHistory.records[0].harnessDigest,
      reviewerIds: [...staleHistory.records[0].audit.reviewerIds].sort(),
      summaryDigest: staleHistory.records[0].audit.summaryDigest,
      reviewedFindingIds: [...staleHistory.records[0].audit.reviewedFindingIds].sort(),
    });
    const { recordDigest: staleDigest, ...staleWithoutDigest } = staleHistory.records[0];
    staleHistory.records[0].recordDigest = objectDigest(staleWithoutDigest);
    const terminalSuccessor = governanceSuccessor(index);
    refreshRecord(terminalSuccessor);
    staleHistory.records.push(terminalSuccessor);
    assert.equal(governanceResult(staleHistory).valid, true, governanceResult(staleHistory).errors.join('\n'));
    const clearedFindings = clone(index);
    const clearSuccessor = governanceSuccessor(index);
    clearSuccessor.status = 'approved_for_spike';
    clearSuccessor.harness.authorizationConclusion = 'approved_for_spike';
    clearSuccessor.audit.decision = 'approved';
    clearSuccessor.findings = [];
    clearSuccessor.audit.reviewedFindingIds = [];
    refreshRecord(clearSuccessor);
    clearedFindings.records.push(clearSuccessor);
    expectGovernanceError(clearedFindings, `successor_finding_missing:${governanceNextTaskId}:GOV-QG-001`);
    const downgradedFinding = clone(index);
    const downgradeSuccessor = governanceSuccessor(index);
    findingFor(downgradeSuccessor).severity = 'P2';
    refreshRecord(downgradeSuccessor);
    downgradedFinding.records.push(downgradeSuccessor);
    expectGovernanceError(downgradedFinding, `successor_finding_severity_changed:${governanceNextTaskId}:GOV-QG-001`);
    const closureWithoutEvidence = clone(index);
    const closureFixtureDescendants = successorDescendantTaskIds(
      closureWithoutEvidence.records,
      'quality-governance-control-plane-v3',
    );
    closureWithoutEvidence.records = closureWithoutEvidence.records.filter((record) => !closureFixtureDescendants.has(record.taskId));
    const closeSuccessor = clone(index.records.find((record) => record.taskId === 'quality-governance-control-plane-v2'));
    closeSuccessor.taskId = 'quality-governance-control-plane-v3';
    closeSuccessor.revision = 3;
    closeSuccessor.successorOf = 'quality-governance-control-plane-v2';
    closeSuccessor.status = 'approved_for_spike';
    closeSuccessor.harness.authorizationConclusion = 'approved_for_spike';
    closeSuccessor.audit.decision = 'approved';
    findingFor(closeSuccessor).status = 'closed';
    refreshRecord(closeSuccessor);
    closureWithoutEvidence.records.push(closeSuccessor);
    expectGovernanceError(closureWithoutEvidence, 'successor_finding_closure_evidence_missing:quality-governance-control-plane-v3:GOV-QG-001');
    const closureWithEvidence = clone(closureWithoutEvidence);
    const evidenceSuccessor = closureWithEvidence.records.at(-1);
    findingFor(evidenceSuccessor).closureEvidence = 'independent-review-declaration:pending-example';
    refreshRecord(evidenceSuccessor);
    assert.equal(governanceResult(closureWithEvidence).valid, true, governanceResult(closureWithEvidence).errors.join('\n'));
    const laterTerminalFixture = clone(index);
    const laterTerminal = governanceSuccessor(laterTerminalFixture);
    refreshRecord(laterTerminal);
    laterTerminalFixture.records.push(laterTerminal);
    const laterDescendants = successorDescendantTaskIds(
      laterTerminalFixture.records,
      'quality-governance-control-plane-v3',
    );
    laterTerminalFixture.records = laterTerminalFixture.records.filter((record) => !laterDescendants.has(record.taskId));
    const laterClosure = clone(index.records.find((record) => record.taskId === 'quality-governance-control-plane-v2'));
    laterClosure.taskId = 'quality-governance-control-plane-v3';
    laterClosure.revision = 3;
    laterClosure.successorOf = 'quality-governance-control-plane-v2';
    laterClosure.status = 'approved_for_spike';
    laterClosure.harness.authorizationConclusion = 'approved_for_spike';
    laterClosure.audit.decision = 'approved';
    findingFor(laterClosure).status = 'closed';
    findingFor(laterClosure).closureEvidence = 'independent-review-declaration:later-terminal-fixture';
    refreshRecord(laterClosure);
    laterTerminalFixture.records.push(laterClosure);
    const laterClosureResult = governanceResult(laterTerminalFixture);
    assert.equal(laterClosureResult.valid, true, laterClosureResult.errors.join('\n'));
    const narrowedScope = clone(index);
    const narrowSuccessor = governanceSuccessor(index);
    narrowSuccessor.governedPaths.pop();
    refreshRecord(narrowSuccessor);
    narrowedScope.records.push(narrowSuccessor);
    expectGovernanceError(narrowedScope, `successor_governed_path_missing:${governanceNextTaskId}:${governanceTerminal.governedPaths.at(-1)}`);
    const fork = clone(index);
    const firstFork = governanceSuccessor(fork);
    refreshRecord(firstFork);
    const secondFork = clone(firstFork);
    secondFork.taskId = `${governanceScopeId}-alt-v${governanceNextRevision}`;
    refreshRecord(secondFork);
    fork.records.push(firstFork, secondFork);
    expectGovernanceError(fork, `successor_fork:${governanceTerminal.taskId}`);
    expectGovernanceError(fork, `scope_risk_revision_duplicate:${governanceScopeId}:${governanceRiskLevel}:${governanceNextRevision}`);
  },
  'TC-quality-03-E3': () => {
    const candidate = clone(index);
    candidate.records[0].governedPaths[0] = '../outside.md';
    expectGovernanceError(candidate, 'governed_path_invalid:quality-governance-control-plane-v1:../outside.md');
  },
  'TC-quality-03-E4': () => {
    const missingAdr = clone(index);
    missingAdr.records.find((record) => record.taskId === governanceTerminal.taskId).adrPath = null;
    expectGovernanceError(missingAdr, `adr_required_or_invalid:${governanceTerminal.taskId}`);
    const unresolved = clone(index);
    const unresolvedTerminal = unresolved.records.find((record) => record.taskId === governanceTerminal.taskId);
    unresolvedTerminal.status = 'approved_to_implement';
    unresolvedTerminal.harness.authorizationConclusion = 'approved_to_implement';
    unresolvedTerminal.audit.decision = 'approved';
    closeOpenP0P1Findings(unresolvedTerminal);
    findingFor(unresolvedTerminal).status = 'open';
    delete findingFor(unresolvedTerminal).closureEvidence;
    refreshRecord(unresolvedTerminal);
    expectGovernanceError(unresolved, 'finding_unresolved:GOV-QG-001');
    const mismatchedBlocked = clone(index);
    const mismatchedTerminal = mismatchedBlocked.records.find((record) => record.taskId === governanceTerminal.taskId);
    mismatchedTerminal.status = 'approved_to_implement';
    mismatchedTerminal.harness.authorizationConclusion = 'blocked';
    mismatchedTerminal.audit.decision = 'approved';
    refreshRecord(mismatchedTerminal);
    expectGovernanceError(mismatchedBlocked, `state_binding_invalid:${governanceTerminal.taskId}:approved_to_implement:blocked:approved`);
    const noReviewer = clone(index);
    const noReviewerTerminal = noReviewer.records.find((record) => record.taskId === governanceTerminal.taskId);
    noReviewerTerminal.audit.reviewerIds = [];
    refreshRecord(noReviewerTerminal);
    expectGovernanceError(noReviewer, `audit_reviewer_ids_invalid:${governanceTerminal.taskId}`);
    const spike = clone(index);
    const spikeTerminal = spike.records.find((record) => record.taskId === governanceTerminal.taskId);
    spikeTerminal.status = 'approved_for_spike';
    spikeTerminal.harness.authorizationConclusion = 'approved_for_spike';
    spikeTerminal.audit.decision = 'approved';
    closeOpenP0P1Findings(spikeTerminal);
    refreshRecord(spikeTerminal);
    assert.equal(governanceResult(spike).valid, true, governanceResult(spike).errors.join('\n'));
    for (const status of ['approved_to_implement', 'done']) {
      const active = clone(index);
      const activeTerminal = active.records.find((record) => record.taskId === governanceTerminal.taskId);
      activeTerminal.status = status;
      activeTerminal.harness.authorizationConclusion = status;
      activeTerminal.audit.decision = 'approved';
      closeOpenP0P1Findings(activeTerminal);
      refreshRecord(activeTerminal);
      assert.equal(governanceResult(active).valid, true, governanceResult(active).errors.join('\n'));
    }
  },
  'TC-quality-03-E5': () => {
    const releaseClaim = clone(index);
    releaseClaim.releaseEvidence = true;
    expectGovernanceError(releaseClaim, 'index_release_evidence_forbidden:true');
    const baselineReleaseClaim = clone(baseline);
    baselineReleaseClaim.releaseEvidence = true;
    expectBaselineError(baselineReleaseClaim, 'baseline_release_evidence_forbidden:true');
  },
  'TC-quality-03-E6': () => {
    const scopeDrift = clone(index);
    scopeDrift.records[0].harness.scope = '范围已经变化但没有重新计算摘要。';
    expectGovernanceError(scopeDrift, 'harness_digest_mismatch:quality-governance-control-plane-v1');
    const unmappedPlan = clone(index);
    const unmappedTerminal = unmappedPlan.records.find((record) => record.taskId === governanceTerminal.taskId);
    unmappedTerminal.harness.testPlanIds[0] = 'TC-quality-99-main';
    refreshRecord(unmappedTerminal);
    expectGovernanceError(unmappedPlan, `harness_test_plan_unmapped:${governanceTerminal.taskId}:TC-quality-99-main`);
    const expandedDocs = {
      ...documented,
      tcIds: new Set([...documented.tcIds, 'TC-quality-99-main']),
      leaves: new Set([...documented.leaves, 'TC-quality-99-main']),
    };
    expectBaselineError(baseline, 'traceability_gap_expanded:TC-quality-99-main', expandedDocs);
    const inventedHistory = clone(baseline);
    inventedHistory.frozenUnmappedLeafTcIds.push('TC-quality-99-main');
    inventedHistory.frozenUnmappedLeafTcIds.sort();
    inventedHistory.frozenUnmappedLeafTcIdsDigest = objectDigest(inventedHistory.frozenUnmappedLeafTcIds);
    expectBaselineError(inventedHistory, 'baseline_anchor_mismatch:frozenUnmappedLeafTcIds');
    const unrecordedExpansion = clone(baseline);
    let currentlyAllowed = [...unrecordedExpansion.frozenUnmappedLeafTcIds];
    for (const expansion of unrecordedExpansion.expansions) {
      currentlyAllowed = [...new Set([...currentlyAllowed, ...expansion.addedUnmappedLeafTcIds])].sort();
    }
    const previousDigest = objectDigest(currentlyAllowed);
    const expandedIds = [...currentlyAllowed, 'TC-quality-99-main'].sort();
    unrecordedExpansion.expansions.push({
      changeRecordTaskId: 'missing-baseline-change-v1',
      previousAllowedUnmappedLeafTcIdsDigest: previousDigest,
      resultingAllowedUnmappedLeafTcIdsDigest: objectDigest(expandedIds),
      addedUnmappedLeafTcIds: ['TC-quality-99-main'],
      expansionJustification: 'A new governed historical item needs an explicit review record.',
    });
    expectBaselineError(unrecordedExpansion, 'baseline_expansion_record_missing:missing-baseline-change-v1', expandedDocs);
    const recordedExpansion = clone(baseline);
    const changeRecordIndex = clone(index);
    const changeRecord = governanceSuccessor(changeRecordIndex);
    changeRecord.baselineChange = {
      previousAllowedUnmappedLeafTcIdsDigest: previousDigest,
      resultingAllowedUnmappedLeafTcIdsDigest: objectDigest(expandedIds),
      addedUnmappedLeafTcIds: ['TC-quality-99-main'],
      expansionJustification: 'A reviewed historical gap expansion is recorded before the baseline changes.',
    };
    refreshRecord(changeRecord);
    changeRecordIndex.records.push(changeRecord);
    recordedExpansion.expansions.push({
      changeRecordTaskId: changeRecord.taskId,
      ...changeRecord.baselineChange,
    });
    assert.equal(baselineResult(recordedExpansion, expandedDocs, changeRecordIndex).valid, true,
      baselineResult(recordedExpansion, expandedDocs, changeRecordIndex).errors.join('\n'));
  },
};

const selectedIndex = process.argv.indexOf('--case');
const selected = selectedIndex >= 0 ? process.argv[selectedIndex + 1] : undefined;
const selectedChecks = selected ? [[selected, checks[selected]]] : Object.entries(checks);
if (selected && !checks[selected]) throw new Error(`unknown_governance_case:${selected}`);

for (const [tcId, check] of selectedChecks) {
  check();
  console.log(`✓ ${tcId}`);
}
console.log(`static_preflight_valid: selected=${selectedChecks.length}/${Object.keys(checks).length}; releaseEvidence=false`);
