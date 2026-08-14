import { createHash } from 'node:crypto';

export const EVALUATION_SOURCE_POLICIES = ['synthetic', 'public_licensed', 'consented_deidentified'] as const;
export type EvaluationSourcePolicy = (typeof EVALUATION_SOURCE_POLICIES)[number];
export const EVALUATION_DATASETS = ['contract-regression', 'golden-dev', 'release-holdout', 'judge-calibration'] as const;
export type EvaluationDatasetKind = (typeof EVALUATION_DATASETS)[number];

export interface EvaluationCase {
  caseId: string;
  caseVersion: string;
  dataset: EvaluationDatasetKind;
  sourcePolicy: EvaluationSourcePolicy;
  groupId: string;
  feature: 'agent' | 'rag' | 'scoring' | 'voice' | 'memory' | 'observability';
  coverage: 'normal' | 'abnormal' | 'regression';
  expectedAction: 'answer' | 'clarify' | 'abstain' | 'reject' | 'review';
  input: Record<string, unknown>;
  expectedOutput: Record<string, unknown>;
  forbiddenDisclosures: string[];
  versions: { policy: string; rubric?: string; corpus?: string };
  labels: { raterCount: number; adjudicated: boolean };
}

export interface EvaluationManifest {
  name: string;
  revision: string;
  description: string;
  cases: readonly EvaluationCase[];
}

/** Stable hosted dataset names. They are test-project resources, never user data. */
export const LANGFUSE_DATASET_NAMES: Record<EvaluationDatasetKind, string> = {
  'contract-regression': 'meetwise-contract-regression',
  'golden-dev': 'meetwise-golden-dev',
  'release-holdout': 'meetwise-release-holdout',
  'judge-calibration': 'meetwise-judge-calibration-holdout',
};

/** The only Dataset item shape that the sync/verification tools are allowed to handle. */
export function langfuseDatasetExpectedOutput(entry: EvaluationCase): Record<string, unknown> {
  return {
    expectedAction: entry.expectedAction,
    expected: entry.expectedOutput,
    forbiddenDisclosures: entry.forbiddenDisclosures,
  };
}

export function langfuseDatasetMetadata(entry: EvaluationCase): Record<string, unknown> {
  return {
    caseId: entry.caseId,
    caseVersion: entry.caseVersion,
    feature: entry.feature,
    coverage: entry.coverage,
    sourcePolicy: entry.sourcePolicy,
    policyVersion: entry.versions.policy,
  };
}

/** Raw sensitive values must never enter a manifest. This guards common failures, not a replacement for human review. */
const disallowedText = [
  /\bsk-[A-Za-z0-9._-]+\b/i,
  /\bpk-[A-Za-z0-9._-]+\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?<!\d)1[3-9]\d{9}(?!\d)/,
  /(?<!\d)\d{17}[\dXx](?!\d)/,
];
const disallowedField = /(^|_)(owner|thread|idempotency|answer_hash|raw_answer|resume_raw|secret|token|password)(_|$)/i;

function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const row = value as Record<string, unknown>;
  return `{${Object.keys(row).sort().map((key) => `${JSON.stringify(key)}:${canonical(row[key])}`).join(',')}}`;
}

function assertSafe(value: unknown, path = '$'): void {
  if (typeof value === 'string') {
    if (disallowedText.some((pattern) => pattern.test(value))) {
      throw Object.assign(new Error('evaluation_manifest_sensitive_value'), { code: 'evaluation_manifest_sensitive_value', path });
    }
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) { value.forEach((entry, index) => assertSafe(entry, `${path}[${index}]`)); return; }
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (disallowedField.test(key)) throw Object.assign(new Error('evaluation_manifest_sensitive_field'), { code: 'evaluation_manifest_sensitive_field', path: `${path}.${key}` });
    assertSafe(entry, `${path}.${key}`);
  }
}

export function validateEvaluationManifest(manifest: EvaluationManifest): void {
  if (!/^[a-z0-9][a-z0-9._-]{2,127}$/.test(manifest.name)) throw new Error('evaluation_manifest_name_invalid');
  if (!/^v\d+(?:\.\d+){0,2}$/.test(manifest.revision)) throw new Error('evaluation_manifest_revision_invalid');
  if (!manifest.description || manifest.description.length > 512) throw new Error('evaluation_manifest_description_invalid');
  assertSafe(manifest.description, '$.description');
  if (!manifest.cases.length) throw new Error('evaluation_manifest_empty');
  const ids = new Set<string>();
  for (const entry of manifest.cases) {
    const key = `${entry.caseId}@${entry.caseVersion}`;
    if (!/^[A-Z0-9-]{5,96}$/.test(entry.caseId) || !/^v\d+(?:\.\d+){0,2}$/.test(entry.caseVersion) || ids.has(key)) {
      throw new Error('evaluation_manifest_case_identity_invalid');
    }
    ids.add(key);
    if (!(EVALUATION_DATASETS as readonly string[]).includes(entry.dataset)
      || !(EVALUATION_SOURCE_POLICIES as readonly string[]).includes(entry.sourcePolicy)
      || !/^[a-z0-9][a-z0-9._-]{2,127}$/i.test(entry.groupId)
      || !/^[a-z0-9][a-z0-9._/-]{2,127}$/i.test(entry.versions.policy)
      || !Number.isInteger(entry.labels.raterCount) || entry.labels.raterCount < 0
      || !['normal', 'abnormal', 'regression'].includes(entry.coverage)) {
      throw new Error('evaluation_manifest_case_contract_invalid');
    }
    // Contract cases are deterministic and must never pretend to have human labels.
    if (entry.dataset === 'contract-regression' && (entry.labels.raterCount !== 0 || entry.labels.adjudicated)) {
      throw new Error('evaluation_manifest_contract_label_invalid');
    }
    // Sync exports the input, expected output, disclosure list and selected
    // metadata.  Validate the entire case instead of leaving a second path
    // (policy version, future metadata, disclosure text) outside the PII and
    // secret scanner.
    assertSafe(entry, entry.caseId);
  }
}

/** Enforces the agreed v1 offline mix instead of leaving it as a document-only target. */
export function validateOfflineEvaluationCatalog(manifest: EvaluationManifest): void {
  validateEvaluationManifest(manifest);
  if (manifest.cases.length !== 120) throw new Error('offline_evaluation_catalog_size_invalid');
  const counts = manifest.cases.reduce<Record<EvaluationCase['coverage'], number>>((acc, entry) => {
    acc[entry.coverage] += 1;
    return acc;
  }, { normal: 0, abnormal: 0, regression: 0 });
  if (counts.normal !== 24 || counts.abnormal !== 72 || counts.regression !== 24) {
    throw new Error('offline_evaluation_catalog_mix_invalid');
  }
  // A derived source group may appear in exactly one partition.  Including
  // `dataset` in this key would accidentally allow the same user/document
  // derivative to be tuned on `golden-dev` and then claimed in a release
  // holdout, which invalidates every holdout metric.
  const split = new Set(manifest.cases.map((entry) => entry.groupId));
  if (split.size !== manifest.cases.length) throw new Error('offline_evaluation_catalog_group_collision');
  for (const feature of ['agent', 'rag', 'scoring', 'voice', 'memory', 'observability'] as const) {
    if (!manifest.cases.some((entry) => entry.feature === feature && entry.coverage === 'normal')
      || !manifest.cases.some((entry) => entry.feature === feature && entry.coverage === 'abnormal')) {
      throw new Error('offline_evaluation_catalog_feature_coverage_invalid');
    }
  }
}

export function evaluationManifestDigest(manifest: EvaluationManifest): string {
  validateEvaluationManifest(manifest);
  return createHash('sha256').update(canonical(manifest), 'utf8').digest('hex');
}

/**
 * The first frozen regression batch contains only synthetic contracts for defects actually found in this audit.
 * It deliberately contains no user text, trace reference or answer hash.
 */
const regressionScenarios: ReadonlyArray<readonly [string, EvaluationCase['feature'], string, Record<string, unknown>]> = [
  ['LF-SEC-001', 'observability', 'payload_sensitive_markers', { rawMarkers: false, externalIds: 'hmac_only' }],
  ['LF-SEC-002', 'observability', 'raw_identity_not_exported', { rawOwner: false, rawThread: false, rawIdempotency: false }],
  ['LF-CFG-001', 'observability', 'tracing_disabled', { networkSends: 0 }],
  ['LF-CFG-002', 'observability', 'missing_or_conflicting_config', { attach: 'rejected', businessMode: 'unaffected' }],
  ['LF-INGEST-001', 'observability', 'official_v5_otel_required', { hierarchy: 'root_node_generation' }],
  ['LF-OBS-001', 'observability', 'graph_node_versions', { required: ['graphRun', 'node', 'policyVersion'] }],
  ['LF-ISO-001', 'observability', 'langfuse_env_stripped', { remainingLangfuseVariables: 0 }],
  ['LF-FB-001', 'observability', 'feedback_comment_not_exported', { rawCommentExported: false }],
  ['EVAL-ONLINE-001', 'agent', 'strict_ten_percent_cap', { formula: 'sampled<=floor(eligible/10)' }],
  ['EVAL-ONLINE-002', 'agent', 'online_judge_business_isolation', { businessMutations: 0 }],
  ['EVAL-PROMOTE-001', 'agent', 'approval_required_before_freeze', { unadjudicatedFrozenCases: 0 }],
  ['GRAPH-PRIV-001', 'memory', 'checkpoint_raw_answer_erasure', { historicalMarkerHitsAfterTerminal: 0 }],
  ['GRAPH-CFG-001', 'agent', 'unsafe_legacy_fallback', { productionStartup: 'rejected' }],
  ['GRAPH-RLS-001', 'memory', 'checkpoint_cross_tenant_read', { unauthorizedRows: 0 }],
  ['GRAPH-ROLE-001', 'memory', 'checkpoint_runtime_role', { ownerOrBypassRlsLogin: false }],
  ['GRAPH-MEM-001', 'memory', 'unbounded_context_rejected', { rawFactCheckpoint: false }],
  ['GRAPH-MEM-002', 'memory', 'memory_episode_exactly_once', { duplicateEpisodes: 0 }],
  ['RAG-CACHE-001', 'rag', 'redis_required_for_hot_cache', { postgresCacheFallback: false }],
  ['RAG-VERSION-001', 'rag', 'corpus_version_fence', { staleGenerationServed: false }],
  ['SCORE-STATE-001', 'scoring', 'unscored_not_completed', { completedFromUnscored: false }],
  ['VOICE-DUPLEX-001', 'voice', 'asr_tts_turn_fence', { duplicateTurnApplied: false }],
  ['E2E-TARGET-001', 'observability', 'isolated_target_guard', { remoteTargetWrites: 0 }],
  ['MIGRATION-001', 'agent', 'empty_target_migration_required', { schemaVersionVerified: true }],
  ['CLOUD-CONFIG-001', 'observability', 'cloud_credentials_not_silent_fallback', { localFallback: false }],
];

function syntheticCase(
  caseId: string, feature: EvaluationCase['feature'], coverage: EvaluationCase['coverage'], dataset: EvaluationDatasetKind,
  scenario: string, expectedAction: EvaluationCase['expectedAction'], expectedOutput: Record<string, unknown>,
): EvaluationCase {
  return {
    caseId, caseVersion: 'v1', dataset, sourcePolicy: 'synthetic',
    groupId: `synthetic-${caseId}`, feature, coverage, expectedAction,
    input: { scenario, synthetic: true, languageGroup: 'mixed', modality: feature === 'voice' ? 'asr' : 'text' },
    expectedOutput,
    forbiddenDisclosures: ['raw_user_content', 'raw_identifier', 'answer_hash', 'api_key'],
    versions: { policy: 'agent-observability-evaluation/v1' },
    labels: { raterCount: 0, adjudicated: false },
  };
}

const features: readonly EvaluationCase['feature'][] = ['agent', 'rag', 'scoring', 'voice', 'memory', 'observability'];
const normalCases = features.flatMap((feature, featureIndex) => Array.from({ length: 4 }, (_, offset) =>
  syntheticCase(
    `OFFLINE-NORMAL-${String(featureIndex * 4 + offset + 1).padStart(3, '0')}`,
    feature, 'normal', offset < 2 ? 'golden-dev' : 'release-holdout',
    `${feature}_normal_contract_${offset + 1}`, 'answer', { contractSatisfied: true, expectedTerminal: 'safe' },
  ),
));
const abnormalActions: readonly EvaluationCase['expectedAction'][] = ['clarify', 'reject', 'abstain', 'review'];
const abnormalCases = features.flatMap((feature, featureIndex) => Array.from({ length: 12 }, (_, offset) =>
  syntheticCase(
    `OFFLINE-ABNORMAL-${String(featureIndex * 12 + offset + 1).padStart(3, '0')}`,
    feature, 'abnormal', offset < 6 ? 'golden-dev' : offset < 11 ? 'release-holdout' : 'judge-calibration',
    `${feature}_adversarial_contract_${offset + 1}`,
    abnormalActions[offset % abnormalActions.length]!,
    { contractSatisfied: true, unsafeSideEffects: 0, riskBucket: ['anaphora', 'injection_handled', 'low_evidence'][offset % 3] },
  ),
));
const regressionCases = regressionScenarios.map(([caseId, feature, scenario, expectedOutput]) =>
  syntheticCase(caseId, feature, 'regression', 'contract-regression', scenario, 'reject', expectedOutput),
);

/**
 * 120 synthetic contracts are a minimum executable safety corpus, not a claim
 * that quality is human-labelled. Real licensed/consented quality samples must
 * go through the approval workflow before entering a release holdout.
 */
export const OFFLINE_EVALUATION_CATALOG_V1: EvaluationManifest = {
  name: 'meetwise-offline-evaluation-catalog',
  revision: 'v1',
  description: '120 synthetic offline contracts: 20 percent normal, 60 percent abnormal, 20 percent verified regressions.',
  cases: [...normalCases, ...abnormalCases, ...regressionCases],
};

/** Backward-compatible view for the deterministic defect corpus only. */
export const LANGFUSE_CONTRACT_REGRESSION_V1: EvaluationManifest = {
  name: 'meetwise-contract-regression', revision: 'v1',
  description: 'Synthetic, deterministic Agent observability and evaluation safety regressions.',
  cases: regressionCases,
};
