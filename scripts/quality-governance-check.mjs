/**
 * Static L2+/L3 governance validator.
 *
 * This module reads only versioned local files. It deliberately does not read
 * Git state, environment variables, or network resources; it does not execute
 * verification commands, accept runtime attestations, or decide releases.
 */
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectDocumentedTraceability,
  traceabilityInventory,
} from './quality-traceability-check.mjs';

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const TASK_ID_PATTERN = /^[a-z][a-z0-9-]{2,95}$/;
const FINDING_ID_PATTERN = /^GOV-[A-Z0-9-]{3,96}$/;
const TC_ID_PATTERN = /^TC-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+$/;
const RISK_LEVELS = new Set(['L0', 'L1', 'L2', 'L3', 'L4']);
const TASK_STATUSES = new Set(['draft', 'blocked', 'approved_for_spike', 'approved_to_implement', 'done']);
const FINDING_SEVERITIES = new Set(['P0', 'P1', 'P2']);
const FINDING_STATUSES = new Set(['open', 'blocked', 'closed']);
const REVIEW_DECISIONS = new Set(['self_checked', 'approved', 'blocked']);
const STATE_BINDINGS = Object.freeze({
  blocked: Object.freeze({ authorizationConclusion: 'blocked', complexAuditDecision: 'blocked', simpleAuditDecision: 'blocked' }),
  approved_for_spike: Object.freeze({ authorizationConclusion: 'approved_for_spike', complexAuditDecision: 'approved', simpleAuditDecision: 'self_checked' }),
  approved_to_implement: Object.freeze({ authorizationConclusion: 'approved_to_implement', complexAuditDecision: 'approved', simpleAuditDecision: 'self_checked' }),
  done: Object.freeze({ authorizationConclusion: 'done', complexAuditDecision: 'approved', simpleAuditDecision: 'self_checked' }),
});
const ALLOWED_COMMAND_IDS = new Set([
  'public-text-policy:prove',
  'quality:governance:check',
  'quality:governance:history:prove',
  'quality:governance:prove',
  'quality:traceability:prove',
  'quality:traceability:inventory',
]);
const RECORD_KEYS = new Set([
  'taskId', 'scopeId', 'revision', 'riskLevel', 'status', 'governedPaths', 'governedPathDigest',
  'harness', 'harnessDigest', 'audit', 'findings', 'adrPath', 'verificationCommands',
  'successorOf', 'baselineChange', 'recordDigest',
]);
const HARNESS_KEYS = new Set([
  'scope', 'sourceEvidenceIds', 'outOfScope', 'domainObjects', 'stateMachineEffects',
  'contractEffects', 'dataEffects', 'privacySecurityEffects', 'testPlanIds',
  'verificationCommands', 'authorizationConclusion',
]);
const AUDIT_KEYS = new Set([
  'lenses', 'reviewerIds', 'summary', 'summaryDigest', 'decision', 'reviewScopeDigest',
  'reviewedFindingIds', 'selfCheckReason',
]);
const FINDING_KEYS = new Set(['findingId', 'severity', 'status', 'disposition', 'closureEvidence']);
const BASELINE_CHANGE_KEYS = new Set([
  'previousAllowedUnmappedLeafTcIdsDigest', 'resultingAllowedUnmappedLeafTcIdsDigest',
  'addedUnmappedLeafTcIds', 'expansionJustification',
]);
const BASELINE_EXPANSION_KEYS = new Set([
  'changeRecordTaskId', 'previousAllowedUnmappedLeafTcIdsDigest',
  'resultingAllowedUnmappedLeafTcIdsDigest', 'addedUnmappedLeafTcIds',
  'expansionJustification',
]);
const INDEX_KEYS = new Set(['schemaVersion', 'releaseEvidence', 'traceabilityBaselineAnchorDigest', 'records']);
const BASELINE_KEYS = new Set([
  'schemaVersion', 'releaseEvidence', 'sourceManifestPath', 'frozenUnmappedLeafTcIds',
  'frozenUnmappedLeafTcIdsDigest', 'expansions',
]);
const GOVERNED_PATH_PREFIXES = [
  'ai-docs/',
  'scripts/',
  'ops/',
  '.github/',
  'package.json',
  'pnpm-lock.yaml',
];
const INDEX_PATH = 'ai-docs/testing/governance-audit-index.json';
const BASELINE_PATH = 'ai-docs/testing/traceability-baseline.json';
const MANIFEST_PATH = 'ai-docs/testing/traceability-manifest.json';
const ADR_PREFIX = 'ai-docs/architecture/adr/';
const MAX_RECORDS = 256;
const MAX_PATHS_PER_RECORD = 256;
const MAX_BASELINE_IDS = 20_000;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function hasExactKeys(value, keys) {
  return isPlainObject(value) && Object.keys(value).every((key) => keys.has(key));
}

function addError(errors, code, detail) {
  errors.push(`${code}:${detail}`);
}

/** Stable, locale-independent JSON encoding for all digest inputs. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

export function objectDigest(value) {
  return sha256(canonicalJson(value));
}

function normalizedRelativePath(repoRoot, candidate) {
  if (!nonEmptyString(candidate) || isAbsolute(candidate) || candidate.includes('\0') || candidate.includes('://')) return undefined;
  const normalizedInput = candidate.split('\\').join('/');
  if (normalizedInput.startsWith('./') || normalizedInput.includes('/../') || normalizedInput.startsWith('../') || normalizedInput.endsWith('/..')) return undefined;
  const absolute = resolve(repoRoot, normalizedInput);
  if (!existsSync(absolute)) return undefined;
  let stat;
  try { stat = lstatSync(absolute); }
  catch { return undefined; }
  if (!stat.isFile() || stat.isSymbolicLink()) return undefined;
  let realRoot;
  let realCandidate;
  try {
    realRoot = realpathSync(repoRoot);
    realCandidate = realpathSync(absolute);
  } catch { return undefined; }
  const rel = relative(realRoot, realCandidate);
  if (rel === '' || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return undefined;
  return rel.split(sep).join('/');
}

function isAllowedGovernedPath(path) {
  return GOVERNED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

function isSafeGovernedPathDeclaration(path) {
  if (!nonEmptyString(path) || isAbsolute(path) || path.includes('\0') || path.includes('://') || path.includes(':')) return false;
  const normalized = path.split('\\').join('/');
  if (normalized !== path || normalized.startsWith('./') || normalized.includes('/../') || normalized.startsWith('../') || normalized.endsWith('/..')) return false;
  return isAllowedGovernedPath(path);
}

export function governedPathDigest(repoRoot, paths) {
  const chunks = [];
  for (const path of paths) {
    const normalized = normalizedRelativePath(repoRoot, path);
    if (!normalized) throw new Error(`governed_path_invalid:${path}`);
    chunks.push(normalized, '\0', readFileSync(resolve(repoRoot, normalized)), '\0');
  }
  return sha256(Buffer.concat(chunks.map((chunk) => (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))));
}

function validateStringArray(value, errors, code, detail, { allowEmpty = false, pattern } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    addError(errors, code, detail);
    return [];
  }
  if (value.some((item) => !nonEmptyString(item) || (pattern && !pattern.test(item)))
    || new Set(value).size !== value.length || value.join('\n') !== [...value].sort().join('\n')) {
    addError(errors, code, detail);
  }
  return value;
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

function validateHarness(record, manifest, documented, errors, { verifyCurrent = false } = {}) {
  const harness = record.harness;
  if (!hasExactKeys(harness, HARNESS_KEYS)) addError(errors, 'harness_fields_invalid', record.taskId);
  if (!isPlainObject(harness)) return;
  for (const key of [
    'scope', 'sourceEvidenceIds', 'outOfScope', 'domainObjects', 'stateMachineEffects',
    'contractEffects', 'dataEffects', 'privacySecurityEffects', 'testPlanIds',
    'verificationCommands', 'authorizationConclusion',
  ]) {
    if (!(key in harness)) addError(errors, 'harness_field_missing', `${record.taskId}:${key}`);
  }
  if (!nonEmptyString(harness.scope)) addError(errors, 'harness_scope_invalid', record.taskId);
  for (const field of ['sourceEvidenceIds', 'outOfScope', 'domainObjects', 'stateMachineEffects', 'contractEffects', 'dataEffects', 'privacySecurityEffects', 'testPlanIds']) {
    validateStringArray(harness[field], errors, 'harness_list_invalid', `${record.taskId}:${field}`, { pattern: field === 'testPlanIds' ? TC_ID_PATTERN : undefined });
  }
  if (verifyCurrent) {
    const requiredLeafTcIds = new Set(manifest?.requiredLeafTcIds ?? []);
    const documentedLeaves = documented?.leaves ?? new Set();
    for (const tcId of harness.testPlanIds ?? []) {
      if (!requiredLeafTcIds.has(tcId) || !documentedLeaves.has(tcId)) {
        addError(errors, 'harness_test_plan_unmapped', `${record.taskId}:${tcId}`);
      }
    }
  }
  const harnessCommands = validateStringArray(harness.verificationCommands, errors, 'harness_commands_invalid', record.taskId);
  if (harnessCommands.some((command) => !ALLOWED_COMMAND_IDS.has(command))) addError(errors, 'harness_command_unallowlisted', record.taskId);
  if (!TASK_STATUSES.has(harness.authorizationConclusion)) addError(errors, 'harness_authorization_invalid', record.taskId);
  if (JSON.stringify(harnessCommands) !== JSON.stringify(record.verificationCommands)) addError(errors, 'harness_commands_mismatch', record.taskId);
  if (!SHA256_PATTERN.test(record.harnessDigest) || record.harnessDigest !== objectDigest(harness)) addError(errors, 'harness_digest_mismatch', record.taskId);
}

function validateAudit(record, errors) {
  const audit = record.audit;
  if (!hasExactKeys(audit, AUDIT_KEYS)) addError(errors, 'audit_fields_invalid', record.taskId);
  if (!isPlainObject(audit)) return;
  const lenses = validateStringArray(audit.lenses, errors, 'audit_lenses_invalid', record.taskId);
  const reviewerIds = validateStringArray(audit.reviewerIds, errors, 'audit_reviewer_ids_invalid', record.taskId, { pattern: TASK_ID_PATTERN });
  const findingIds = validateStringArray(audit.reviewedFindingIds, errors, 'audit_finding_ids_invalid', record.taskId, { allowEmpty: true, pattern: FINDING_ID_PATTERN });
  if (!REVIEW_DECISIONS.has(audit.decision)) addError(errors, 'audit_decision_invalid', record.taskId);
  if (!nonEmptyString(audit.summary)) addError(errors, 'audit_summary_invalid', record.taskId);
  if (!SHA256_PATTERN.test(audit.summaryDigest) || audit.summaryDigest !== objectDigest(audit.summary)) {
    addError(errors, 'audit_summary_digest_mismatch', record.taskId);
  }
  if (!SHA256_PATTERN.test(audit.reviewScopeDigest) || audit.reviewScopeDigest !== reviewScopeDigest(record)) {
    addError(errors, 'audit_scope_digest_mismatch', record.taskId);
  }
  const listedFindings = (record.findings ?? []).map((finding) => finding?.findingId).sort();
  if (JSON.stringify(findingIds) !== JSON.stringify(listedFindings)) addError(errors, 'audit_finding_ids_mismatch', record.taskId);
  const complex = ['L2', 'L3', 'L4'].includes(record.riskLevel);
  if (complex && (lenses.length < 2 || reviewerIds.length === 0 || audit.decision === 'self_checked' || nonEmptyString(audit.selfCheckReason))) {
    addError(errors, 'complex_audit_invalid', record.taskId);
  }
  if (!complex && record.status !== 'blocked' && (audit.decision !== 'self_checked' || !nonEmptyString(audit.selfCheckReason))) {
    addError(errors, 'self_check_invalid', record.taskId);
  }
}

function validateStateBinding(record, errors) {
  const binding = STATE_BINDINGS[record.status];
  if (!binding) return;
  const expectedAuditDecision = ['L2', 'L3', 'L4'].includes(record.riskLevel)
    ? binding.complexAuditDecision
    : binding.simpleAuditDecision;
  if (record.harness?.authorizationConclusion !== binding.authorizationConclusion
    || record.audit?.decision !== expectedAuditDecision) {
    addError(
      errors,
      'state_binding_invalid',
      `${record.taskId}:${record.status}:${String(record.harness?.authorizationConclusion)}:${String(record.audit?.decision)}`,
    );
  }
}

function validateFindings(record, errors) {
  const findings = record.findings;
  if (!Array.isArray(findings)) {
    addError(errors, 'findings_invalid', record.taskId);
    return;
  }
  const ids = new Set();
  for (const finding of findings) {
    if (!hasExactKeys(finding, FINDING_KEYS) || !FINDING_ID_PATTERN.test(finding.findingId ?? '')) {
      addError(errors, 'finding_fields_invalid', record.taskId);
      continue;
    }
    if (ids.has(finding.findingId)) addError(errors, 'finding_duplicate', `${record.taskId}:${finding.findingId}`);
    ids.add(finding.findingId);
    if (!FINDING_SEVERITIES.has(finding.severity)) addError(errors, 'finding_severity_invalid', finding.findingId);
    if (!FINDING_STATUSES.has(finding.status)) addError(errors, 'finding_status_invalid', finding.findingId);
    if (!nonEmptyString(finding.disposition)) addError(errors, 'finding_disposition_invalid', finding.findingId);
    if (finding.status !== 'closed' && finding.closureEvidence !== undefined && finding.closureEvidence !== null) {
      addError(errors, 'finding_closure_evidence_unexpected', finding.findingId);
    }
    if (['P0', 'P1'].includes(finding.severity)) {
      if (record.status !== 'blocked' && finding.status !== 'closed') addError(errors, 'finding_unresolved', finding.findingId);
    }
    if (record.status !== 'blocked' && ['open', 'blocked'].includes(finding.status)) addError(errors, 'finding_blocked_task_active', finding.findingId);
  }
}

function validateSuccessorFindingContinuity(successor, predecessor, errors) {
  for (const path of predecessor.governedPaths ?? []) {
    if (!(successor.governedPaths ?? []).includes(path)) addError(errors, 'successor_governed_path_missing', `${successor.taskId}:${path}`);
  }
  const successorFindings = new Map((successor.findings ?? []).map((finding) => [finding?.findingId, finding]));
  for (const finding of predecessor.findings ?? []) {
    if (!['P0', 'P1'].includes(finding?.severity)) continue;
    const carried = successorFindings.get(finding.findingId);
    if (!carried) {
      addError(errors, 'successor_finding_missing', `${successor.taskId}:${finding.findingId}`);
      continue;
    }
    if (carried.severity !== finding.severity) addError(errors, 'successor_finding_severity_changed', `${successor.taskId}:${finding.findingId}`);
    if (finding.status === 'closed' && carried.status !== 'closed') {
      addError(errors, 'successor_finding_reopened', `${successor.taskId}:${finding.findingId}`);
    }
    if (finding.status !== 'closed' && carried.status === 'closed' && !nonEmptyString(carried.closureEvidence)) {
      addError(errors, 'successor_finding_closure_evidence_missing', `${successor.taskId}:${finding.findingId}`);
    }
  }
}

function validateBaselineChange(record, errors) {
  if (record.baselineChange === null) return;
  const change = record.baselineChange;
  if (!hasExactKeys(change, BASELINE_CHANGE_KEYS)) addError(errors, 'baseline_change_fields_invalid', record.taskId);
  if (!isPlainObject(change)) return;
  for (const key of ['previousAllowedUnmappedLeafTcIdsDigest', 'resultingAllowedUnmappedLeafTcIdsDigest']) {
    if (!SHA256_PATTERN.test(change[key])) addError(errors, 'baseline_change_digest_invalid', `${record.taskId}:${key}`);
  }
  validateStringArray(change.addedUnmappedLeafTcIds, errors, 'baseline_change_ids_invalid', record.taskId, { allowEmpty: false, pattern: TC_ID_PATTERN });
  if (!nonEmptyString(change.expansionJustification)) addError(errors, 'baseline_change_justification_invalid', record.taskId);
  if (!record.governedPaths.includes(BASELINE_PATH)) addError(errors, 'baseline_change_path_missing', record.taskId);
  if (record.revision <= 1 || !TASK_ID_PATTERN.test(record.successorOf ?? '')) {
    addError(errors, 'baseline_change_successor_required', record.taskId);
  }
}

function validateGovernedPaths(record, repoRoot, errors, { verifyCurrent = false } = {}) {
  const paths = validateStringArray(record.governedPaths, errors, 'governed_paths_invalid', record.taskId);
  if (paths.length > MAX_PATHS_PER_RECORD) addError(errors, 'governed_path_limit_exceeded', record.taskId);
  for (const path of paths) {
    if (!isSafeGovernedPathDeclaration(path) || path === INDEX_PATH) {
      addError(errors, 'governed_path_invalid', `${record.taskId}:${path}`);
    }
  }
  if (!SHA256_PATTERN.test(record.governedPathDigest)) addError(errors, 'governed_path_digest_invalid', record.taskId);
  if (!verifyCurrent) return;
  try {
    for (const path of paths) {
      if (normalizedRelativePath(repoRoot, path) !== path) addError(errors, 'governed_path_invalid', `${record.taskId}:${path}`);
    }
    if (record.governedPathDigest !== governedPathDigest(repoRoot, paths)) {
      addError(errors, 'governed_path_digest_mismatch', record.taskId);
    }
  } catch {
    addError(errors, 'governed_path_digest_unreadable', record.taskId);
  }
}

function validateRecord(record, repoRoot, manifest, documented, errors, { verifyCurrent = false } = {}) {
  if (!hasExactKeys(record, RECORD_KEYS) || !TASK_ID_PATTERN.test(record?.taskId ?? '') || !TASK_ID_PATTERN.test(record?.scopeId ?? '')) {
    addError(errors, 'record_fields_invalid', String(record?.taskId ?? 'unknown'));
    return;
  }
  if (!Number.isInteger(record.revision) || record.revision < 1) addError(errors, 'record_revision_invalid', record.taskId);
  if (!RISK_LEVELS.has(record.riskLevel)) addError(errors, 'record_risk_invalid', record.taskId);
  if (!TASK_STATUSES.has(record.status) || record.status === 'draft') addError(errors, 'record_status_invalid', record.taskId);
  if (!(record.successorOf === null || TASK_ID_PATTERN.test(record.successorOf))) addError(errors, 'record_successor_invalid', record.taskId);
  if (record.revision === 1 && record.successorOf !== null) addError(errors, 'initial_record_successor_forbidden', record.taskId);
  if (record.revision > 1 && record.successorOf === null) addError(errors, 'successor_required', record.taskId);
  const commands = validateStringArray(record.verificationCommands, errors, 'record_commands_invalid', record.taskId);
  if (commands.some((command) => !ALLOWED_COMMAND_IDS.has(command))) addError(errors, 'record_command_unallowlisted', record.taskId);
  validateGovernedPaths(record, repoRoot, errors, { verifyCurrent });
  validateHarness(record, manifest, documented, errors, { verifyCurrent });
  validateFindings(record, errors);
  validateBaselineChange(record, errors);
  validateAudit(record, errors);
  validateStateBinding(record, errors);
  if (record.riskLevel === 'L3' || record.riskLevel === 'L4') {
    if (!isSafeGovernedPathDeclaration(record.adrPath) || !record.adrPath.startsWith(ADR_PREFIX) || !record.governedPaths.includes(record.adrPath)) {
      addError(errors, 'adr_required_or_invalid', record.taskId);
    }
    if (verifyCurrent && normalizedRelativePath(repoRoot, record.adrPath) !== record.adrPath) addError(errors, 'adr_required_or_invalid', record.taskId);
  } else if (record.adrPath !== null) addError(errors, 'adr_unexpected', record.taskId);
  if (!SHA256_PATTERN.test(record.recordDigest) || record.recordDigest !== recordDigest(record)) addError(errors, 'record_digest_mismatch', record.taskId);
}

export function validateTraceabilityBaseline(baseline, manifest, documented, governanceIndex) {
  const errors = [];
  if (!hasExactKeys(baseline, BASELINE_KEYS)) addError(errors, 'baseline_fields_invalid', 'top_level');
  if (!isPlainObject(baseline)) return { valid: false, errors: ['baseline_not_object'], stats: {} };
  if (baseline.schemaVersion !== 2) addError(errors, 'baseline_schema_invalid', String(baseline.schemaVersion));
  if (baseline.releaseEvidence !== false) addError(errors, 'baseline_release_evidence_forbidden', 'true');
  if (baseline.sourceManifestPath !== MANIFEST_PATH) addError(errors, 'baseline_manifest_path_invalid', String(baseline.sourceManifestPath));
  const frozen = validateStringArray(baseline.frozenUnmappedLeafTcIds, errors, 'baseline_ids_invalid', 'frozenUnmappedLeafTcIds', { allowEmpty: true, pattern: TC_ID_PATTERN });
  if (frozen.length > MAX_BASELINE_IDS) addError(errors, 'baseline_id_limit_exceeded', String(frozen.length));
  if (!SHA256_PATTERN.test(baseline.frozenUnmappedLeafTcIdsDigest) || baseline.frozenUnmappedLeafTcIdsDigest !== objectDigest(frozen)) {
    addError(errors, 'baseline_digest_mismatch', 'frozenUnmappedLeafTcIds');
  }
  if (!isPlainObject(governanceIndex) || !SHA256_PATTERN.test(governanceIndex.traceabilityBaselineAnchorDigest)
    || governanceIndex.traceabilityBaselineAnchorDigest !== baseline.frozenUnmappedLeafTcIdsDigest) {
    addError(errors, 'baseline_anchor_mismatch', 'frozenUnmappedLeafTcIds');
  }
  if (!Array.isArray(baseline.expansions)) addError(errors, 'baseline_expansions_invalid', 'expansions');
  const expansionRecords = new Map((governanceIndex?.records ?? [])
    .filter((record) => TASK_ID_PATTERN.test(record?.taskId ?? ''))
    .map((record) => [record.taskId, record]));
  const consumedChangeRecords = new Set();
  let allowed = [...frozen];
  let previousDigest = objectDigest(allowed);
  for (const expansion of baseline.expansions ?? []) {
    if (!hasExactKeys(expansion, BASELINE_EXPANSION_KEYS) || !isPlainObject(expansion)) {
      addError(errors, 'baseline_expansion_fields_invalid', String(expansion?.changeRecordTaskId ?? 'unknown'));
      continue;
    }
    const changeRecordTaskId = expansion.changeRecordTaskId;
    if (!TASK_ID_PATTERN.test(changeRecordTaskId)) addError(errors, 'baseline_expansion_record_invalid', String(changeRecordTaskId));
    if (consumedChangeRecords.has(changeRecordTaskId)) addError(errors, 'baseline_expansion_record_duplicate', changeRecordTaskId);
    consumedChangeRecords.add(changeRecordTaskId);
    if (!SHA256_PATTERN.test(expansion.previousAllowedUnmappedLeafTcIdsDigest)
      || expansion.previousAllowedUnmappedLeafTcIdsDigest !== previousDigest) {
      addError(errors, 'baseline_expansion_predecessor_mismatch', String(changeRecordTaskId));
    }
    const added = validateStringArray(expansion.addedUnmappedLeafTcIds, errors, 'baseline_expansion_ids_invalid', String(changeRecordTaskId), { allowEmpty: false, pattern: TC_ID_PATTERN });
    if (added.some((tcId) => allowed.includes(tcId))) addError(errors, 'baseline_expansion_replays_existing', String(changeRecordTaskId));
    if (!nonEmptyString(expansion.expansionJustification)) addError(errors, 'baseline_expansion_justification_invalid', String(changeRecordTaskId));
    const record = expansionRecords.get(changeRecordTaskId);
    if (!record) {
      addError(errors, 'baseline_expansion_record_missing', String(changeRecordTaskId));
    } else if (!record.baselineChange
      || record.baselineChange.previousAllowedUnmappedLeafTcIdsDigest !== expansion.previousAllowedUnmappedLeafTcIdsDigest
      || record.baselineChange.resultingAllowedUnmappedLeafTcIdsDigest !== expansion.resultingAllowedUnmappedLeafTcIdsDigest
      || JSON.stringify(record.baselineChange.addedUnmappedLeafTcIds) !== JSON.stringify(added)
      || record.baselineChange.expansionJustification !== expansion.expansionJustification) {
      addError(errors, 'baseline_expansion_record_binding_mismatch', String(changeRecordTaskId));
    }
    allowed = sortedUnique([...allowed, ...added]);
    const resultingDigest = objectDigest(allowed);
    if (!SHA256_PATTERN.test(expansion.resultingAllowedUnmappedLeafTcIdsDigest)
      || expansion.resultingAllowedUnmappedLeafTcIdsDigest !== resultingDigest) {
      addError(errors, 'baseline_expansion_result_mismatch', String(changeRecordTaskId));
    }
    previousDigest = resultingDigest;
  }
  for (const record of expansionRecords.values()) {
    if (record.baselineChange !== null && !consumedChangeRecords.has(record.taskId)) {
      addError(errors, 'baseline_change_orphan', record.taskId);
    }
  }
  if (allowed.length > MAX_BASELINE_IDS) addError(errors, 'baseline_id_limit_exceeded', String(allowed.length));
  const inventory = traceabilityInventory(manifest, documented);
  const allowedSet = new Set(allowed);
  const knownLeaves = documented.leaves ?? new Set();
  for (const tcId of allowed) {
    if (!knownLeaves.has(tcId)) addError(errors, 'baseline_historical_id_unknown', tcId);
  }
  const unexpected = inventory.unmappedLeaves.filter((tcId) => !allowedSet.has(tcId));
  if (unexpected.length) addError(errors, 'traceability_gap_expanded', unexpected.slice(0, 20).join(','));
  return {
    valid: errors.length === 0,
    errors: sortedUnique(errors),
    stats: {
      baselineUnmappedLeafCount: allowed.length,
      currentUnmappedLeafCount: inventory.unmappedLeafCount,
      resolvedHistoricalGapCount: allowed.length - inventory.unmappedLeafCount,
    },
  };
}

export function validateGovernanceAuditIndex(index, { repoRoot, manifest, documented, baseline } = {}) {
  const errors = [];
  if (!isPlainObject(index)) return { valid: false, errors: ['index_not_object'], stats: {} };
  if (!hasExactKeys(index, INDEX_KEYS)) addError(errors, 'index_fields_invalid', 'top_level');
  if (index.schemaVersion !== 2) addError(errors, 'index_schema_invalid', String(index.schemaVersion));
  if (index.releaseEvidence !== false) addError(errors, 'index_release_evidence_forbidden', 'true');
  if (!SHA256_PATTERN.test(index.traceabilityBaselineAnchorDigest)
    || (baseline && index.traceabilityBaselineAnchorDigest !== baseline.frozenUnmappedLeafTcIdsDigest)) {
    addError(errors, 'index_baseline_anchor_invalid', 'traceabilityBaselineAnchorDigest');
  }
  if (!Array.isArray(index.records) || index.records.length === 0 || index.records.length > MAX_RECORDS) {
    addError(errors, 'index_records_invalid', String(index.records?.length ?? 'missing'));
  }
  const records = Array.isArray(index.records) ? index.records : [];
  const byTaskId = new Map();
  const byScopeRiskRevision = new Map();
  const latestByScopeRisk = new Map();
  const successorCounts = new Map();
  for (const record of records) {
    validateRecord(record, repoRoot, manifest, documented, errors);
    if (!TASK_ID_PATTERN.test(record?.taskId ?? '')) continue;
    if (byTaskId.has(record.taskId)) addError(errors, 'record_duplicate', record.taskId);
    byTaskId.set(record.taskId, record);
    if (TASK_ID_PATTERN.test(record?.scopeId ?? '') && RISK_LEVELS.has(record?.riskLevel)
      && Number.isInteger(record?.revision) && record.revision >= 1) {
      const scopeRevisionKey = `${record.scopeId}\u0000${record.riskLevel}\u0000${record.revision}`;
      if (byScopeRiskRevision.has(scopeRevisionKey)) {
        addError(errors, 'scope_risk_revision_duplicate', `${record.scopeId}:${record.riskLevel}:${record.revision}`);
      }
      byScopeRiskRevision.set(scopeRevisionKey, record.taskId);
      const scopeRiskKey = `${record.scopeId}\u0000${record.riskLevel}`;
      const latest = latestByScopeRisk.get(scopeRiskKey);
      if (!latest || record.revision > latest.revision) latestByScopeRisk.set(scopeRiskKey, record);
    }
    if (TASK_ID_PATTERN.test(record?.successorOf ?? '')) {
      successorCounts.set(record.successorOf, (successorCounts.get(record.successorOf) ?? 0) + 1);
    }
  }
  for (const record of byTaskId.values()) {
    if (record.revision <= 1) continue;
    const predecessor = byTaskId.get(record.successorOf);
    if (!predecessor || predecessor.taskId === record.taskId || predecessor.scopeId !== record.scopeId
      || predecessor.riskLevel !== record.riskLevel || record.revision !== predecessor.revision + 1) {
      addError(errors, 'successor_chain_invalid', record.taskId);
    } else {
      validateSuccessorFindingContinuity(record, predecessor, errors);
    }
  }
  for (const [predecessorTaskId, count] of successorCounts) {
    if (count > 1) addError(errors, 'successor_fork', predecessorTaskId);
  }
  for (const record of latestByScopeRisk.values()) {
    validateRecord(record, repoRoot, manifest, documented, errors, { verifyCurrent: true });
  }
  return {
    valid: errors.length === 0,
    errors: sortedUnique(errors),
    stats: {
      recordCount: records.length,
      governedRecordCount: records.filter((record) => ['L2', 'L3', 'L4'].includes(record?.riskLevel)).length,
      staticPreflightOnly: true,
      releaseEvidence: false,
    },
  };
}

function main() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const index = JSON.parse(readFileSync(resolve(repoRoot, INDEX_PATH), 'utf8'));
  const baseline = JSON.parse(readFileSync(resolve(repoRoot, BASELINE_PATH), 'utf8'));
  const manifest = JSON.parse(readFileSync(resolve(repoRoot, MANIFEST_PATH), 'utf8'));
  const documented = collectDocumentedTraceability(repoRoot);
  const governance = validateGovernanceAuditIndex(index, { repoRoot, manifest, documented, baseline });
  const traceabilityBaseline = validateTraceabilityBaseline(baseline, manifest, documented, index);
  console.log(JSON.stringify({
    kind: 'static_governance_preflight',
    governance,
    traceabilityBaseline,
    releaseEvidence: false,
  }, null, 2));
  if (!governance.valid || !traceabilityBaseline.valid) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
