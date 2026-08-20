/**
 * Append-only governance history guard for CI.
 *
 * Unlike quality-governance-check.mjs, this dedicated guard reads two explicit
 * Git commits supplied by CI. The base SHA must come from the GitHub event,
 * not from either JSON artifact. It compares the committed objects directly;
 * it never treats a digest recalculated in the proposed tree as historical
 * evidence. This is a static merge preflight only, never release evidence.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { canonicalJson, objectDigest } from './quality-governance-check.mjs';

const COMMIT_PATTERN = /^[a-f0-9]{40}$/;
const INDEX_PATH = 'ai-docs/testing/governance-audit-index.json';
const BASELINE_PATH = 'ai-docs/testing/traceability-baseline.json';
const TASK_ID_PATTERN = /^[a-z][a-z0-9-]{2,95}$/;
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const GOVERNED_PATH_PREFIXES = ['ai-docs/', 'scripts/', '.github/', 'package.json', 'pnpm-lock.yaml'];
const TASK_STATUSES = new Set(['draft', 'blocked', 'approved_for_spike', 'approved_to_implement', 'done']);
const FINDING_SEVERITIES = new Set(['P0', 'P1', 'P2']);
const FINDING_STATUSES = new Set(['open', 'blocked', 'closed']);
const STATE_BINDINGS = Object.freeze({
  blocked: Object.freeze({ authorizationConclusion: 'blocked', auditDecision: 'blocked' }),
  approved_for_spike: Object.freeze({ authorizationConclusion: 'approved_for_spike', auditDecision: 'approved' }),
  approved_to_implement: Object.freeze({ authorizationConclusion: 'approved_to_implement', auditDecision: 'approved' }),
  done: Object.freeze({ authorizationConclusion: 'done', auditDecision: 'approved' }),
});

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function addError(errors, code, detail) {
  errors.push(`${code}:${detail}`);
}

function sameJson(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function recordsByTaskId(index, source, errors) {
  const records = Array.isArray(index?.records) ? index.records : [];
  if (!isPlainObject(index) || !Array.isArray(index.records)) {
    addError(errors, 'history_index_invalid', source);
    return new Map();
  }
  const recordsById = new Map();
  for (const record of records) {
    if (!TASK_ID_PATTERN.test(record?.taskId ?? '')) {
      addError(errors, 'history_record_id_invalid', `${source}:${String(record?.taskId ?? 'unknown')}`);
      continue;
    }
    if (recordsById.has(record.taskId)) addError(errors, 'history_record_duplicate', `${source}:${record.taskId}`);
    recordsById.set(record.taskId, record);
  }
  return recordsById;
}

function validateCurrentChain(currentRecords, errors) {
  const scopeRiskRevisions = new Map();
  const successorsByPredecessor = new Map();
  for (const record of currentRecords.values()) {
    if (typeof record.scopeId !== 'string' || typeof record.riskLevel !== 'string' || !Number.isInteger(record.revision) || record.revision < 1) {
      addError(errors, 'history_record_chain_shape_invalid', record.taskId);
      continue;
    }
    if (record.revision === 1 && record.successorOf !== null) addError(errors, 'history_initial_successor_forbidden', record.taskId);
    if (record.revision > 1 && !TASK_ID_PATTERN.test(record.successorOf ?? '')) addError(errors, 'history_successor_required', record.taskId);
    const scopeRiskRevision = `${record.scopeId}\u0000${record.riskLevel}\u0000${record.revision}`;
    if (scopeRiskRevisions.has(scopeRiskRevision)) {
      addError(errors, 'history_scope_risk_revision_duplicate', `${record.scopeId}:${record.riskLevel}:${record.revision}`);
    }
    scopeRiskRevisions.set(scopeRiskRevision, record.taskId);
    if (record.successorOf !== null && TASK_ID_PATTERN.test(record.successorOf ?? '')) {
      const successors = successorsByPredecessor.get(record.successorOf) ?? [];
      successors.push(record);
      successorsByPredecessor.set(record.successorOf, successors);
    }
  }
  for (const [predecessorId, successors] of successorsByPredecessor) {
    if (successors.length > 1) addError(errors, 'history_successor_fork', predecessorId);
    const predecessor = currentRecords.get(predecessorId);
    for (const successor of successors) {
      if (!predecessor || successor.scopeId !== predecessor.scopeId || successor.riskLevel !== predecessor.riskLevel
        || successor.revision !== predecessor.revision + 1) {
        addError(errors, 'history_successor_chain_invalid', successor.taskId);
      } else {
        validateSuccessorFindingContinuity(successor, predecessor, errors);
      }
    }
  }
}

function terminalBaselineState(baseline, errors, source) {
  if (!isPlainObject(baseline) || !Array.isArray(baseline.frozenUnmappedLeafTcIds) || !Array.isArray(baseline.expansions)) {
    addError(errors, 'history_baseline_invalid', source);
    return undefined;
  }
  let allowed = [...baseline.frozenUnmappedLeafTcIds];
  let previousDigest = objectDigest(allowed);
  for (const expansion of baseline.expansions) {
    if (!isPlainObject(expansion) || expansion.previousAllowedUnmappedLeafTcIdsDigest !== previousDigest
      || !Array.isArray(expansion.addedUnmappedLeafTcIds)) {
      addError(errors, 'history_baseline_expansion_invalid', `${source}:${String(expansion?.changeRecordTaskId ?? 'unknown')}`);
      return undefined;
    }
    allowed = sortedUnique([...allowed, ...expansion.addedUnmappedLeafTcIds]);
    previousDigest = objectDigest(allowed);
    if (expansion.resultingAllowedUnmappedLeafTcIdsDigest !== previousDigest) {
      addError(errors, 'history_baseline_expansion_digest_invalid', `${source}:${String(expansion.changeRecordTaskId)}`);
      return undefined;
    }
  }
  return { allowed, digest: previousDigest };
}

function sameBaselineChange(record, expansion) {
  return isPlainObject(record?.baselineChange)
    && record.baselineChange.previousAllowedUnmappedLeafTcIdsDigest === expansion.previousAllowedUnmappedLeafTcIdsDigest
    && record.baselineChange.resultingAllowedUnmappedLeafTcIdsDigest === expansion.resultingAllowedUnmappedLeafTcIdsDigest
    && sameJson(record.baselineChange.addedUnmappedLeafTcIds, expansion.addedUnmappedLeafTcIds)
    && record.baselineChange.expansionJustification === expansion.expansionJustification;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sortedUniqueStrings(value) {
  return Array.isArray(value)
    && value.length > 0
    && value.every(nonEmptyString)
    && new Set(value).size === value.length
    && value.join('\n') === [...value].sort().join('\n');
}

function reviewScopeDigest(record) {
  return objectDigest({
    taskId: record.taskId,
    scopeId: record.scopeId,
    revision: record.revision,
    riskLevel: record.riskLevel,
    governedPathDigest: record.governedPathDigest,
    harnessDigest: record.harnessDigest,
    reviewerIds: [...(record.audit?.reviewerIds ?? [])].sort(),
    summaryDigest: record.audit?.summaryDigest,
    reviewedFindingIds: [...(record.audit?.reviewedFindingIds ?? [])].sort(),
  });
}

function recordDigest(record) {
  const { recordDigest: ignored, ...withoutDigest } = record;
  return objectDigest(withoutDigest);
}

function isSafeGovernedPath(path) {
  if (!nonEmptyString(path) || path.includes('\0') || path.includes(':') || path.startsWith('/') || path.startsWith('./')
    || path.startsWith('../') || path.includes('/../') || path.endsWith('/..') || path.includes('\\')) return false;
  return GOVERNED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

/**
 * Validate immutable record metadata plus path snapshots resolved by a trusted
 * caller. The caller supplies the record's introduction tree; no candidate
 * checker participates in this comparison.
 */
export function validateGovernanceRecordSnapshots(index, snapshotDigestForRecord) {
  const errors = [];
  if (!isPlainObject(index) || !Array.isArray(index.records)) return { valid: false, errors: ['history_snapshot_index_invalid'], stats: {} };
  let verified = 0;
  for (const record of index.records) {
    if (!TASK_ID_PATTERN.test(record?.taskId ?? '')) continue;
    if (!SHA256_PATTERN.test(record.governedPathDigest)) addError(errors, 'history_snapshot_digest_invalid', record.taskId);
    if (!Array.isArray(record.governedPaths) || record.governedPaths.some((path) => !isSafeGovernedPath(path))) {
      addError(errors, 'history_snapshot_paths_invalid', record.taskId);
      continue;
    }
    if (record.harnessDigest !== objectDigest(record.harness)) addError(errors, 'history_snapshot_harness_digest_mismatch', record.taskId);
    if (record.audit?.summaryDigest !== objectDigest(record.audit?.summary)) addError(errors, 'history_snapshot_summary_digest_mismatch', record.taskId);
    if (record.audit?.reviewScopeDigest !== reviewScopeDigest(record)) addError(errors, 'history_snapshot_review_digest_mismatch', record.taskId);
    if (record.recordDigest !== recordDigest(record)) addError(errors, 'history_snapshot_record_digest_mismatch', record.taskId);
    let snapshotDigest;
    try {
      snapshotDigest = snapshotDigestForRecord(record);
    } catch {
      addError(errors, 'history_snapshot_unreadable', record.taskId);
      continue;
    }
    if (snapshotDigest !== record.governedPathDigest) addError(errors, 'history_snapshot_path_digest_mismatch', record.taskId);
    verified += 1;
  }
  return { valid: errors.length === 0, errors: sortedUnique(errors), stats: { verifiedRecordCount: verified } };
}

function validateSuccessorFindingContinuity(successor, predecessor, errors) {
  for (const path of predecessor.governedPaths ?? []) {
    if (!(successor.governedPaths ?? []).includes(path)) addError(errors, 'history_successor_governed_path_missing', `${successor.taskId}:${path}`);
  }
  const successorFindings = new Map((successor.findings ?? []).map((finding) => [finding?.findingId, finding]));
  for (const finding of predecessor.findings ?? []) {
    if (!['P0', 'P1'].includes(finding?.severity)) continue;
    const carried = successorFindings.get(finding.findingId);
    if (!carried) {
      addError(errors, 'history_successor_finding_missing', `${successor.taskId}:${finding.findingId}`);
      continue;
    }
    if (carried.severity !== finding.severity) addError(errors, 'history_successor_finding_severity_changed', `${successor.taskId}:${finding.findingId}`);
    if (finding.status === 'closed' && carried.status !== 'closed') {
      addError(errors, 'history_successor_finding_reopened', `${successor.taskId}:${finding.findingId}`);
    }
    if (finding.status !== 'closed' && carried.status === 'closed' && !nonEmptyString(carried.closureEvidence)) {
      addError(errors, 'history_successor_finding_closure_evidence_missing', `${successor.taskId}:${finding.findingId}`);
    }
  }
}

/**
 * This is intentionally self-contained: the trusted base workflow must not
 * execute any candidate checker. It applies the minimum L2+ state/audit and
 * finding rules to newly appended records before their digests can be trusted.
 */
function validateNewRecordSemantics(record, errors) {
  if (!TASK_STATUSES.has(record?.status) || record.status === 'draft') {
    addError(errors, 'history_record_status_invalid', String(record?.taskId ?? 'unknown'));
    return;
  }
  const complex = ['L2', 'L3', 'L4'].includes(record.riskLevel);
  if (!complex) return;
  const binding = STATE_BINDINGS[record.status];
  if (!binding
    || record.harness?.authorizationConclusion !== binding.authorizationConclusion
    || record.audit?.decision !== binding.auditDecision) {
    addError(errors, 'history_state_binding_invalid', String(record.taskId));
  }
  if (!sortedUniqueStrings(record.audit?.lenses) || record.audit.lenses.length < 2) {
    addError(errors, 'history_audit_lenses_invalid', String(record.taskId));
  }
  if (!sortedUniqueStrings(record.audit?.reviewerIds)) {
    addError(errors, 'history_audit_reviewer_ids_invalid', String(record.taskId));
  }
  if (!nonEmptyString(record.audit?.summary)) {
    addError(errors, 'history_audit_summary_invalid', String(record.taskId));
  }
  if (record.audit?.summaryDigest !== objectDigest(record.audit?.summary)
    || record.audit?.reviewScopeDigest !== reviewScopeDigest(record)
    || record.recordDigest !== recordDigest(record)) {
    addError(errors, 'history_record_digest_invalid', String(record.taskId));
  }
  if (!Array.isArray(record.findings)) {
    addError(errors, 'history_findings_invalid', String(record.taskId));
    return;
  }
  const findingIds = new Set();
  for (const finding of record.findings) {
    if (!nonEmptyString(finding?.findingId) || findingIds.has(finding.findingId)
      || !FINDING_SEVERITIES.has(finding.severity) || !FINDING_STATUSES.has(finding.status)
      || !nonEmptyString(finding.disposition)) {
      addError(errors, 'history_finding_invalid', `${record.taskId}:${String(finding?.findingId ?? 'unknown')}`);
      continue;
    }
    findingIds.add(finding.findingId);
    if (['P0', 'P1'].includes(finding.severity) && record.status !== 'blocked' && finding.status !== 'closed') {
      addError(errors, 'history_finding_unresolved', `${record.taskId}:${finding.findingId}`);
    }
    if (finding.status === 'closed' && !nonEmptyString(finding.closureEvidence)) {
      addError(errors, 'history_finding_closure_evidence_missing', `${record.taskId}:${finding.findingId}`);
    }
  }
  const reviewed = record.audit?.reviewedFindingIds;
  if (!Array.isArray(reviewed) || JSON.stringify([...reviewed].sort()) !== JSON.stringify([...findingIds].sort())) {
    addError(errors, 'history_audit_finding_ids_invalid', String(record.taskId));
  }
}

/**
 * Compare a proposed governance tree with its trusted committed base.
 * This function is pure so proof fixtures need no Git repository or process.
 */
export function validateGovernanceHistoryBase({ baseIndex, currentIndex, baseBaseline, currentBaseline }) {
  const errors = [];
  const baseMissing = baseIndex === undefined && baseBaseline === undefined;
  if ((baseIndex === undefined) !== (baseBaseline === undefined)) {
    addError(errors, 'history_base_artifact_pair_mismatch', 'index-baseline');
  }
  if ((currentIndex === undefined) !== (currentBaseline === undefined)) {
    addError(errors, 'history_current_artifact_pair_mismatch', 'index-baseline');
  }
  if (currentIndex === undefined || currentBaseline === undefined) {
    addError(errors, 'history_current_artifacts_missing', 'governance');
  }
  if (baseMissing) {
    addError(errors, 'history_base_artifacts_missing', 'governance');
    return {
      valid: false,
      errors: sortedUnique(errors),
      stats: { mode: 'blocked_missing_base', baseRecordCount: 0, newRecordCount: Array.isArray(currentIndex?.records) ? currentIndex.records.length : 0, baseExpansionCount: 0, newExpansionCount: Array.isArray(currentBaseline?.expansions) ? currentBaseline.expansions.length : 0 },
    };
  }
  if (!isPlainObject(baseIndex) || !isPlainObject(currentIndex) || !isPlainObject(baseBaseline) || !isPlainObject(currentBaseline)) {
    addError(errors, 'history_artifact_not_object', 'governance');
    return { valid: false, errors: sortedUnique(errors), stats: {} };
  }

  for (const key of ['schemaVersion', 'releaseEvidence', 'traceabilityBaselineAnchorDigest']) {
    if (!sameJson(baseIndex[key], currentIndex[key])) addError(errors, 'history_index_metadata_mutated', key);
  }
  for (const key of ['schemaVersion', 'releaseEvidence', 'sourceManifestPath', 'frozenUnmappedLeafTcIds', 'frozenUnmappedLeafTcIdsDigest']) {
    if (!sameJson(baseBaseline[key], currentBaseline[key])) addError(errors, 'history_baseline_immutable_field_mutated', key);
  }
  if (!SHA256_PATTERN.test(baseIndex.traceabilityBaselineAnchorDigest)
    || baseIndex.traceabilityBaselineAnchorDigest !== baseBaseline.frozenUnmappedLeafTcIdsDigest) {
    addError(errors, 'history_base_anchor_invalid', 'traceabilityBaselineAnchorDigest');
  }
  if (!Array.isArray(baseBaseline.frozenUnmappedLeafTcIds)
    || baseBaseline.frozenUnmappedLeafTcIdsDigest !== objectDigest(baseBaseline.frozenUnmappedLeafTcIds)) {
    addError(errors, 'history_base_frozen_digest_invalid', 'frozenUnmappedLeafTcIds');
  }
  if (currentIndex.traceabilityBaselineAnchorDigest !== currentBaseline.frozenUnmappedLeafTcIdsDigest) {
    addError(errors, 'history_current_anchor_invalid', 'traceabilityBaselineAnchorDigest');
  }
  if (!Array.isArray(currentBaseline.frozenUnmappedLeafTcIds)
    || currentBaseline.frozenUnmappedLeafTcIdsDigest !== objectDigest(currentBaseline.frozenUnmappedLeafTcIds)) {
    addError(errors, 'history_current_frozen_digest_invalid', 'frozenUnmappedLeafTcIds');
  }

  const baseRecords = recordsByTaskId(baseIndex, 'base', errors);
  const currentRecords = recordsByTaskId(currentIndex, 'current', errors);
  const baseRecordList = Array.isArray(baseIndex.records) ? baseIndex.records : [];
  const currentRecordList = Array.isArray(currentIndex.records) ? currentIndex.records : [];
  if (currentRecordList.length < baseRecordList.length) addError(errors, 'history_record_removed', 'length');
  for (let index = 0; index < baseRecordList.length; index += 1) {
    if (!sameJson(baseRecordList[index], currentRecordList[index])) addError(errors, 'history_records_not_append_only', String(index));
  }
  validateCurrentChain(currentRecords, errors);
  for (const record of currentRecordList.slice(baseRecordList.length)) {
    validateNewRecordSemantics(record, errors);
  }
  for (const [taskId, baseRecord] of baseRecords) {
    const currentRecord = currentRecords.get(taskId);
    if (!currentRecord) addError(errors, 'history_record_removed', taskId);
    else if (!sameJson(baseRecord, currentRecord)) addError(errors, 'history_record_mutated', taskId);
  }

  const baseExpansions = Array.isArray(baseBaseline.expansions) ? baseBaseline.expansions : [];
  const currentExpansions = Array.isArray(currentBaseline.expansions) ? currentBaseline.expansions : [];
  if (currentExpansions.length < baseExpansions.length) addError(errors, 'history_baseline_expansion_removed', 'length');
  for (let index = 0; index < baseExpansions.length; index += 1) {
    if (!sameJson(baseExpansions[index], currentExpansions[index])) addError(errors, 'history_baseline_expansion_mutated', String(index));
  }
  let baselineState = terminalBaselineState({ ...baseBaseline, expansions: baseExpansions }, errors, 'base');
  const consumedExpansionRecords = new Set(baseExpansions.map((expansion) => expansion?.changeRecordTaskId));
  for (const expansion of currentExpansions.slice(baseExpansions.length)) {
    const taskId = expansion?.changeRecordTaskId;
    if (!TASK_ID_PATTERN.test(taskId ?? '')) {
      addError(errors, 'history_new_expansion_record_invalid', String(taskId));
      continue;
    }
    if (consumedExpansionRecords.has(taskId)) addError(errors, 'history_new_expansion_record_reused', taskId);
    consumedExpansionRecords.add(taskId);
    if (expansion.previousAllowedUnmappedLeafTcIdsDigest !== baselineState?.digest) {
      addError(errors, 'history_new_expansion_base_digest_mismatch', taskId);
    }
    const record = currentRecords.get(taskId);
    if (!record || baseRecords.has(taskId)) {
      addError(errors, 'history_new_expansion_successor_missing', taskId);
    } else if (record.revision <= 1 || !TASK_ID_PATTERN.test(record.successorOf ?? '') || !currentRecords.has(record.successorOf)
      || !sameBaselineChange(record, expansion)) {
      addError(errors, 'history_new_expansion_successor_invalid', taskId);
    }
    if (!Array.isArray(expansion.addedUnmappedLeafTcIds)) {
      addError(errors, 'history_new_expansion_ids_invalid', taskId);
      continue;
    }
    if (!baselineState) continue;
    if (expansion.addedUnmappedLeafTcIds.some((tcId) => baselineState.allowed.includes(tcId))) {
      addError(errors, 'history_new_expansion_replays_existing', taskId);
    }
    baselineState = {
      allowed: sortedUnique([...baselineState.allowed, ...expansion.addedUnmappedLeafTcIds]),
      digest: objectDigest(sortedUnique([...baselineState.allowed, ...expansion.addedUnmappedLeafTcIds])),
    };
    if (expansion.resultingAllowedUnmappedLeafTcIdsDigest !== baselineState.digest) {
      addError(errors, 'history_new_expansion_result_digest_invalid', taskId);
    }
  }
  for (const [taskId, record] of currentRecords) {
    if (baseRecords.has(taskId) || record?.baselineChange === null || record?.baselineChange === undefined) continue;
    if (!consumedExpansionRecords.has(taskId)) addError(errors, 'history_new_baseline_change_orphan', taskId);
  }

  return {
    valid: errors.length === 0,
    errors: sortedUnique(errors),
    stats: {
      mode: 'append_only',
      baseRecordCount: baseRecords.size,
      newRecordCount: [...currentRecords.keys()].filter((taskId) => !baseRecords.has(taskId)).length,
      baseExpansionCount: baseExpansions.length,
      newExpansionCount: Math.max(0, currentExpansions.length - baseExpansions.length),
    },
  };
}

/**
 * The protected base is the immutable historical anchor. Revalidate only
 * candidate-added records plus the terminal record of every current chain
 * against the exact candidate head tree. Terminal coverage makes a governed
 * blob change without a successor fail, while avoiding impossible replay of
 * legacy bulk-import introduction commits.
 */
export function candidateSnapshotRecords(baseIndex, currentIndex) {
  const baseTaskIds = new Set((baseIndex?.records ?? []).map((record) => record?.taskId));
  const hasSuccessor = new Set((currentIndex?.records ?? [])
    .map((record) => record?.successorOf)
    .filter((taskId) => TASK_ID_PATTERN.test(taskId ?? '')));
  return (currentIndex?.records ?? []).filter((record) =>
    !baseTaskIds.has(record?.taskId) || !hasSuccessor.has(record?.taskId));
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function resolveCommit(value, label) {
  if (!COMMIT_PATTERN.test(value ?? '')) throw new Error(`history_${label}_sha_invalid`);
  const resolved = runGit(['rev-parse', '--verify', `${value}^{commit}`]);
  if (!COMMIT_PATTERN.test(resolved)) throw new Error(`history_${label}_sha_unresolved`);
  return resolved;
}

function readJsonAtCommit(commit, path) {
  try {
    return JSON.parse(runGit(['show', `${commit}:${path}`]));
  } catch (error) {
    const message = String(error?.stderr ?? error?.message ?? '');
    if (message.includes(`Path '${path}' does not exist`) || message.includes(`exists on disk, but not in`)) return undefined;
    throw new Error(`history_git_read_failed:${path}`);
  }
}

function readBlobAtCommit(commit, path) {
  return execFileSync('git', ['show', `${commit}:${path}`], { stdio: ['ignore', 'pipe', 'pipe'] });
}

function governedPathDigestAtCommit(commit, paths) {
  const chunks = [];
  for (const path of paths) {
    if (!isSafeGovernedPath(path)) throw new Error('history_snapshot_path_invalid');
    chunks.push(Buffer.from(path), Buffer.from('\0'), readBlobAtCommit(commit, path), Buffer.from('\0'));
  }
  return `sha256:${createHash('sha256').update(Buffer.concat(chunks)).digest('hex')}`;
}

function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!['--base', '--head'].includes(flag) || !value || values.has(flag)) throw new Error('history_arguments_invalid');
    values.set(flag, value);
  }
  if (values.size !== 2) throw new Error('history_arguments_invalid');
  return { base: values.get('--base'), head: values.get('--head') };
}

function main() {
  const { base: requestedBase, head: requestedHead } = parseArgs(process.argv.slice(2));
  const base = resolveCommit(requestedBase, 'base');
  const head = resolveCommit(requestedHead, 'head');
  try {
    runGit(['merge-base', '--is-ancestor', base, head]);
  } catch {
    throw new Error('history_base_not_ancestor');
  }
  const result = validateGovernanceHistoryBase({
    baseIndex: readJsonAtCommit(base, INDEX_PATH),
    currentIndex: readJsonAtCommit(head, INDEX_PATH),
    baseBaseline: readJsonAtCommit(base, BASELINE_PATH),
    currentBaseline: readJsonAtCommit(head, BASELINE_PATH),
  });
  const baseIndex = readJsonAtCommit(base, INDEX_PATH);
  const currentIndex = readJsonAtCommit(head, INDEX_PATH);
  const snapshotIndex = { records: candidateSnapshotRecords(baseIndex, currentIndex) };
  const snapshots = result.valid
    ? validateGovernanceRecordSnapshots(snapshotIndex, (record) => governedPathDigestAtCommit(head, record.governedPaths))
    : { valid: false, errors: ['history_snapshot_skipped_invalid_history'], stats: { verifiedRecordCount: 0 } };
  console.log(JSON.stringify({ kind: 'static_governance_history_preflight', base, head, history: result, snapshots, releaseEvidence: false }, null, 2));
  if (!result.valid || !snapshots.valid) process.exitCode = 1;
}

const scriptPath = resolve(fileURLToPath(import.meta.url));
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) main();
