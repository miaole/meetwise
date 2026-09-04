/**
 * Versioned model-operation registry (MODEL-OP-00 node identity + MODEL-OP-02
 * admission partition + MODEL-OP-03 capability matrix).
 *
 * The registry is the server-side authority for three facts a caller must not
 * control:
 *  1. which logical node identity an invocation belongs to (derived from a
 *     frozen operation id plus an explicit business revision — a caller cannot
 *     invent, reuse or widen a node by passing arbitrary key text);
 *  2. which admission partition (provider account + region + model/recipe +
 *     operation) the dispatch consumes;
 *  3. which capability tier and deterministic fallback each operation has.
 *
 * Operations marked `wired: false` exist only as frozen contracts: resolving
 * them for dispatch fails closed until MODEL-OP-01 wires the real adapter.
 * Deterministic graph nodes are enumerated explicitly and must never appear
 * here — their model-dispatch count is zero by construction.
 */
import { createHash } from 'node:crypto';
import type { ModelOperationInputKind } from './model-operation-binding.ts';

export const MODEL_OPERATION_REGISTRY_VERSION = 'model-op-registry-v1';

export type ModelOperationCapability =
  | 'text-small'
  | 'text-quality'
  | 'vision'
  | 'embedding'
  | 'rerank'
  | 'asr'
  | 'tts'
  | 'signed-download';

export type ModelOperationMeter =
  | 'text-tokens'
  | 'image-pages'
  | 'embedding-vectors'
  | 'rerank-candidates'
  | 'audio-seconds'
  | 'tts-characters'
  | 'download-bytes';

export interface ModelOperationDefinition {
  readonly operationId: string;
  readonly inputKind: ModelOperationInputKind;
  readonly capability: ModelOperationCapability;
  /** v1 freezes exactly one irrevocable provider dispatch per logical node. */
  readonly maxDispatches: 1;
  /** Provider egress is allowed only for wired operations; others fail closed. */
  readonly wired: boolean;
  /** MODEL-OP-02 admission partition; never caller-supplied. */
  readonly admission: Readonly<{ providerAccount: string; region: string; modelOrRecipe: string }>;
  readonly meter: ModelOperationMeter;
  /** Deterministic business projection when admission or dispatch is refused. */
  readonly fallbackAction: string;
}

/**
 * Currently wired text operations (the six invoke() call surfaces named by
 * UC-MODEL-ROUTE-02).
 */
const WIRED_TEXT_OPERATIONS: readonly ModelOperationDefinition[] = [
  {
    operationId: 'interview.competency-planning.v1', inputKind: 'chat', capability: 'text-small', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'planner' },
    meter: 'text-tokens', fallbackAction: 'conservative_default_plan',
  },
  {
    operationId: 'interview.question-generation.v1', inputKind: 'chat', capability: 'text-quality', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'questioner' },
    meter: 'text-tokens', fallbackAction: 'approved_template_question',
  },
  {
    operationId: 'interview.answer-scoring.v1', inputKind: 'chat', capability: 'text-small', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'scorer' },
    meter: 'text-tokens', fallbackAction: 'unscored_review_required',
  },
  {
    operationId: 'interview.quiz-generation.v1', inputKind: 'chat', capability: 'text-quality', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'quiz' },
    meter: 'text-tokens', fallbackAction: 'quiz_unavailable',
  },
  {
    operationId: 'resume.diagnosis.v1', inputKind: 'chat', capability: 'text-quality', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'diagnosis' },
    meter: 'text-tokens', fallbackAction: 'diagnosis_failed_refund',
  },
  {
    operationId: 'report.narrative.v1', inputKind: 'chat', capability: 'text-quality', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-main', region: 'cn-beijing', modelOrRecipe: 'report' },
    meter: 'text-tokens', fallbackAction: 'report_unavailable',
  },
];

/**
 * MODEL-OP-01 OCR 窄切片：`visionOcr` 先经 `bindResumeOcr` 解析冻结 binding，
 * 再以 registry 派生的 `resume.ocr.v1` node identity 进入 invoke()。
 * `wired: true` 表示 registry 授权该节点身份与 binding；预览双旗可派发，
 * 生产/enforce 组合根仍 fail-closed。视觉 token ledger（MODEL-OP-02）未做。
 */
const WIRED_VISION_OPERATIONS: readonly ModelOperationDefinition[] = [
  {
    operationId: 'resume.ocr.v1', inputKind: 'vision-ocr', capability: 'vision', maxDispatches: 1,
    wired: true, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'vision-ocr' },
    meter: 'image-pages', fallbackAction: 'manual_text_entry',
  },
];

/**
 * Frozen contracts for capabilities whose adapters remain direct (they bypass
 * invoke() and are not cost-governed yet).  MODEL-OP-01 gives them a typed
 * binding + fixed endpoint profile, but dispatch authorization stays blocked
 * until MODEL-OP-02 (admission/ledger) and MODEL-OP-04 (gateway) land.
 */
const UNWIRED_OPERATIONS: readonly ModelOperationDefinition[] = [
  {
    operationId: 'qbank.embedding-build.v1', inputKind: 'embedding-build', capability: 'embedding', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'embedding-build' },
    meter: 'embedding-vectors', fallbackAction: 'no_rag',
  },
  {
    operationId: 'qbank.embedding-query.v1', inputKind: 'embedding-query', capability: 'embedding', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'embedding-query' },
    meter: 'embedding-vectors', fallbackAction: 'no_rag',
  },
  {
    operationId: 'qbank.rerank.v1', inputKind: 'rerank', capability: 'rerank', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'rerank' },
    meter: 'rerank-candidates', fallbackAction: 'keep_retrieval_order',
  },
  {
    operationId: 'voice.asr.v1', inputKind: 'asr', capability: 'asr', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'asr' },
    meter: 'audio-seconds', fallbackAction: 'text_input',
  },
  {
    operationId: 'voice.asr-stream.v1', inputKind: 'asr-stream', capability: 'asr', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'asr-stream' },
    meter: 'audio-seconds', fallbackAction: 'text_input',
  },
  {
    operationId: 'voice.tts.v1', inputKind: 'tts', capability: 'tts', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'tts' },
    meter: 'tts-characters', fallbackAction: 'text_display',
  },
  {
    operationId: 'voice.tts-stream.v1', inputKind: 'tts-stream', capability: 'tts', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'tts-stream' },
    meter: 'tts-characters', fallbackAction: 'text_display',
  },
  {
    operationId: 'voice.signed-download.v1', inputKind: 'signed-download', capability: 'signed-download', maxDispatches: 1,
    wired: false, admission: { providerAccount: 'dashscope-native', region: 'cn-beijing', modelOrRecipe: 'tts-audio' },
    meter: 'download-bytes', fallbackAction: 'skip_audio_download',
  },
];

export const MODEL_OPERATION_REGISTRY: readonly ModelOperationDefinition[] = Object.freeze(
  [...WIRED_TEXT_OPERATIONS, ...WIRED_VISION_OPERATIONS, ...UNWIRED_OPERATIONS].map((definition) => Object.freeze({
    ...definition,
    admission: Object.freeze({ ...definition.admission }),
  })),
);

/**
 * Deterministic graph nodes (MODEL-OP-03 matrix): authorization, state
 * transitions, route allocation, hybrid retrieval, RRF, metadata filtering and
 * memory admission never obtain a model operation.  Their dispatch count is
 * zero by construction — an operation id here is a registry corruption.
 */
export const DETERMINISTIC_NODE_MATRIX: readonly string[] = [
  'adaptive.plan',
  'adaptive.decide',
  'adaptive.await-answer',
  'adaptive.conclude',
  'retrieval.bm25-fts',
  'retrieval.rrf-fusion',
  'retrieval.scope-filter',
  'memory.metadata-filter',
  'memory.conflict-expiry-gate',
  'billing.ledger-transition',
];

const REGISTRY_INDEX = new Map(MODEL_OPERATION_REGISTRY.map((definition) => [definition.operationId, definition] as const));
const OPERATION_ID_PATTERN = /^[a-z0-9][a-z0-9.-]{2,127}\.v[0-9]{1,3}$/;
const BUSINESS_REVISION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/;

export function lookupModelOperation(operationId: string): ModelOperationDefinition | undefined {
  const definition = REGISTRY_INDEX.get(operationId);
  return definition && OPERATION_ID_PATTERN.test(operationId) ? definition : undefined;
}

/**
 * MODEL-OP-02 admission partition key, derived server-side from the frozen
 * definition.  Single join helper shared by `resolveModelOperation` and the
 * MODEL-OP-01 typed binding resolver so the partition identity can never drift
 * between the dispatch path and the binding path.
 */
export function modelOperationAdmissionKey(definition: ModelOperationDefinition): string {
  return [
    definition.admission.providerAccount,
    definition.admission.region,
    definition.admission.modelOrRecipe,
    definition.operationId,
  ].join('|');
}

export type ModelOperationResolution =
  | {
    ok: true;
    definition: ModelOperationDefinition;
    /** Server-derived canonical logical-node key; callers never supply node text. */
    logicalNodeKey: string;
    /** MODEL-OP-02 admission partition key for this dispatch. */
    admissionKey: string;
  }
  | { ok: false; error: 'model_operation_unknown' | 'model_operation_not_wired' | 'model_operation_revision_invalid' };

/**
 * Resolve one operation for dispatch.  The logical-node key embeds the frozen
 * registry version, the operation id and the caller's *explicit* business
 * revision: re-running the same revision re-reads the same durable header,
 * while any retry requires a new revision and therefore a new, auditable node.
 */
export function resolveModelOperation(operationId: string, businessRevision: string): ModelOperationResolution {
  const definition = lookupModelOperation(operationId);
  if (!definition) return { ok: false, error: 'model_operation_unknown' };
  if (!BUSINESS_REVISION_PATTERN.test(businessRevision ?? '')) return { ok: false, error: 'model_operation_revision_invalid' };
  if (!definition.wired) return { ok: false, error: 'model_operation_not_wired' };
  return {
    ok: true,
    definition,
    logicalNodeKey: `${MODEL_OPERATION_REGISTRY_VERSION}:${definition.operationId}:${businessRevision}`,
    admissionKey: modelOperationAdmissionKey(definition),
  };
}

export function isRegistryLogicalNodeKey(key: string): boolean {
  const prefix = `${MODEL_OPERATION_REGISTRY_VERSION}:`;
  if (!key.startsWith(prefix)) return false;
  // The business revision may itself contain ':' (e.g. `${threadId}:ask:t3`),
  // so the operation id is the segment up to the first ':' and everything after
  // it is the revision — never assume exactly three ':'-separated parts.
  const rest = key.slice(prefix.length);
  const sep = rest.indexOf(':');
  if (sep === -1) return false;
  return OPERATION_ID_PATTERN.test(rest.slice(0, sep))
    && BUSINESS_REVISION_PATTERN.test(rest.slice(sep + 1));
}

export function registryLogicalNodeKeyDigest(key: string): string {
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

/**
 * Static invariant gate for the matrix itself: unique ids, complete admission
 * partitions, frozen single dispatch, non-empty deterministic fallbacks, and
 * zero overlap between operations and deterministic nodes.
 */
export function validateModelOperationRegistry(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const definition of MODEL_OPERATION_REGISTRY) {
    if (ids.has(definition.operationId)) problems.push(`duplicate_operation:${definition.operationId}`);
    ids.add(definition.operationId);
    if (!OPERATION_ID_PATTERN.test(definition.operationId)) problems.push(`operation_id_invalid:${definition.operationId}`);
    if (definition.maxDispatches !== 1) problems.push(`dispatch_policy_invalid:${definition.operationId}`);
    if (!definition.admission.providerAccount || !definition.admission.region || !definition.admission.modelOrRecipe)
      problems.push(`admission_incomplete:${definition.operationId}`);
    if (!definition.fallbackAction) problems.push(`fallback_missing:${definition.operationId}`);
  }
  for (const node of DETERMINISTIC_NODE_MATRIX) {
    if (ids.has(node)) problems.push(`deterministic_node_has_operation:${node}`);
  }
  return problems;
}
