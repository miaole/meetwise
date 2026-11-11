/**
 * Fail-closed question generation: a provider miss must not become interview
 * content.  Callers persist provenance; they never invent a stem to keep the
 * graph moving.
 */
export const QUESTION_GENERATION_ERROR_CODES = [
  'provider_not_configured',
  'provider_timeout',
  'provider_malformed',
  'external_outcome_unknown',
  'schema_invalid',
  'business_invalid',
  'duplicate_question',
  'attempt_replay_forbidden',
  'generation_unavailable',
] as const;

export type QuestionGenerationErrorCode = (typeof QUESTION_GENERATION_ERROR_CODES)[number];

/**
 * AG-F(刀F)裁决④(a·可调):确定性出题失败族=有界 re-roll+耗尽换 competency 面共用的族边界。
 * 入族=schema 违例/provider malformed（含刀 B deterministic_output_*）/business 闸拒绝/
 * external_outcome_unknown（LANDING-INDEX 四类文面含 unknown）。族外原判死零位移:
 * provider_timeout(瞬态非确定,不入族——裁决④附带项)、provider_not_configured(重掷必败)、
 * duplicate_question(判重 re-roll 既有终面,g7fix4 钉死)、attempt_replay_forbidden、
 * generation_unavailable(兜底)。Ban re-roll 出族外(EXPERT §七 :65/Ban 列表)。
 */
export const QUESTION_GENERATION_REROLL_FAMILY: readonly QuestionGenerationErrorCode[] = [
  'schema_invalid',
  'provider_malformed',
  'business_invalid',
  'external_outcome_unknown',
];

/**
 * G2(FIX-G2-dup-question-fallback):换 competency 臂的族边界=re-roll 族 + duplicate_question。
 * duplicate_question 仍**不进** re-roll 族(seam 内判重 re-roll 有独立上限 MAX_DUPLICATE_REROLL,
 * g7fix4 钉死),但 seam 判重耗尽后交图节点换下一 competency 重试(帽 MAX_COMPETENCY_EXHAUST_SWITCH
 * 与 AG-F 共用),而不是首个能力项耗尽即整场 failClosed。
 */
export const QUESTION_GENERATION_COMPETENCY_SWITCH_FAMILY: readonly QuestionGenerationErrorCode[] = [
  ...QUESTION_GENERATION_REROLL_FAMILY,
  'duplicate_question',
];

/**
 * G2:判重耗尽后的降级候选来源(审计元数据)。
 * - `cross_session_repeat`:seam 本 turn 已生成且过全部确定性闸(schema/verbatim/引文/critique 含
 *   **本场** asked 判重)、仅与**历史场次**题面重复的模型题——允许跨场重复、当场不重复。
 * - `approved_template`:所有模型候选都没过本场闸时,用既有 grounded 无事实固定模板文案兜底
 *   (同样须过本场 critique)。零额外模型调用、零新幂等键。
 */
export const QUESTION_DUPLICATE_FALLBACKS = ['cross_session_repeat', 'approved_template'] as const;
export type QuestionDuplicateFallback = (typeof QUESTION_DUPLICATE_FALLBACKS)[number];

export const QUESTION_GENERATION_ORIGINS = ['model', 'approved_template', 'unavailable'] as const;
export type QuestionGenerationOrigin = (typeof QUESTION_GENERATION_ORIGINS)[number];

/** Audit-safe generation receipt. Never holds prompts, keys, résumé text or raw model output. */
export interface QuestionGenerationProvenance {
  readonly origin: QuestionGenerationOrigin;
  readonly operationId?: string;
  readonly idempotencyKey?: string;
  readonly errorCode?: QuestionGenerationErrorCode;
  /** Stable invoke/adapter error token (ASCII). Must not contain secrets or user content. */
  readonly invokeError?: string;
  /** G7FIX-4R bounded duplicate re-roll trajectory: how many replacement rolls
   *  this turn consumed before the recorded outcome. Absent when the turn never
   *  re-rolled. Audit metadata only — never secrets or user content. */
  readonly reroll?: number;
  /** G2:本题经判重耗尽降级臂出面时的降级来源;正常出题缺席。仅审计元数据。 */
  readonly duplicateFallback?: QuestionDuplicateFallback;
}

/** G2:判重耗尽失败形携带的降级候选(只在 seam 内产生;图节点仅在无 competency 可换时采用)。 */
export interface QuestionDuplicateFallbackCandidate {
  readonly question: string;
  readonly sources: string[];
  readonly provenance: QuestionGenerationProvenance;
}

export type QuestionGenerationResult =
  | {
      ok: true; question: string; sources: string[]; provenance: QuestionGenerationProvenance;
      /**
       * AG-37(检索 weighted-deficit 归零·修法③·additive 可选出参):worker 检索闭包本题更新后的
       * weighted-deficit（纯数字数组·C14 边界;null=本题为非检索路径/缺省臂,值经此回流 genQuestion
       * 写图 state 位 `weightedDeficit`,下一题读取——跨题 DRR 配额持久化,不再每 claim 归零）。
       * 仅 success 形携带;失败形不携带（节点失败臂不写 state 位·通道原值保留）。旧 scripted deps/
       * 直接调用缺省 undefined=键缺席,normalize passthrough 原样·节点不写（现状字节零改）。
       */
      weightedDeficit?: number[] | null;
    }
  | {
      ok: false; error: QuestionGenerationErrorCode; provenance: QuestionGenerationProvenance;
      /** G2:仅 error='duplicate_question' 时可能携带;缺席=无可用降级候选(既有 failClosed 原样)。 */
      duplicateFallback?: QuestionDuplicateFallbackCandidate;
    };

const NOT_CONFIGURED = /not_configured|policy_required|known_not_executed|provider_rejected|deterministic_refusal|admission|project_missing|project_disabled|operation_unknown|operation_blocked|prepare_failed|operation_policy/;
const TIMEOUT = /timeout|timed_out|deadline_exceeded/;
// AG-F(刀F·刀 B 落主线重 pin 吸收):deterministic_output_invalid/truncated（AG-06 known_executed
// 确定性输出失败码,HTTP 200+usage 在手）归 provider_malformed 族——它们正是「确定性坏输出」本体,
// invoke 侧已注明「允许换 revision 重试·不重试同 key」;不吸收则它们落 generation_unavailable 兜底,
// 四类 re-roll 族边界（§1-修法①/裁决④a）对刀 B 主交付面失明。
const MALFORMED = /schema_validation_failed|malformed|json_invalid|parse_error|empty_content|no_audio|usage_invalid|deterministic_output_/;

export function classifyQuestionGenerationError(invokeError: string): QuestionGenerationErrorCode {
  if (typeof invokeError !== 'string' || invokeError.length < 1 || invokeError.length > 200) {
    return 'generation_unavailable';
  }
  if (invokeError.startsWith('business:')) return 'business_invalid';
  if (invokeError === 'schema_validation_failed') return 'schema_invalid';
  if (invokeError === 'external_outcome_unknown') return 'external_outcome_unknown';
  if (TIMEOUT.test(invokeError)) return 'provider_timeout';
  if (NOT_CONFIGURED.test(invokeError)) return 'provider_not_configured';
  if (MALFORMED.test(invokeError)) return 'provider_malformed';
  return 'generation_unavailable';
}

export function unavailableGeneration(
  error: QuestionGenerationErrorCode,
  extra: Omit<QuestionGenerationProvenance, 'origin' | 'errorCode'> = {},
): QuestionGenerationResult {
  return {
    ok: false,
    error,
    provenance: { origin: 'unavailable', errorCode: error, ...extra },
  };
}

/** G2:判重耗尽失败形 + 可选降级候选。失败语义(error/provenance)与 unavailableGeneration 逐字节同形。 */
export function duplicateExhaustedGeneration(
  extra: Omit<QuestionGenerationProvenance, 'origin' | 'errorCode'>,
  fallback: QuestionDuplicateFallbackCandidate | null,
): QuestionGenerationResult {
  const base = unavailableGeneration('duplicate_question', extra);
  return fallback && !base.ok ? { ...base, duplicateFallback: fallback } : base;
}

/** G2:把判重降级候选还原为 success 形(图节点无序可换时采用;本场 critique 仍由节点再过一次)。 */
export function acceptDuplicateFallback(candidate: QuestionDuplicateFallbackCandidate): Extract<QuestionGenerationResult, { ok: true }> {
  return { ok: true, question: candidate.question, sources: [...candidate.sources], provenance: candidate.provenance };
}

export function approvedTemplateGeneration(
  question: string,
  // S2-B3(RESUME-GROUNDING):可选 extra——耗尽回退轨迹(哪个独立重试键耗尽)随 provenance 可审计;
  // 缺省逐字节同旧形(既有调用零改)。
  extra: Omit<QuestionGenerationProvenance, 'origin' | 'errorCode'> = {},
): QuestionGenerationResult {
  return {
    ok: true,
    question,
    sources: [],
    provenance: { origin: 'approved_template', ...extra },
  };
}

export function modelGeneration(question: string, sources: string[], extra: Omit<QuestionGenerationProvenance, 'origin'> = {}): QuestionGenerationResult {
  return { ok: true, question, sources, provenance: { origin: 'model', ...extra } };
}

/** Graph test seams may still return the legacy `{question,sources}` shape. */
export function normalizeQuestionGenerationResult(
  raw: QuestionGenerationResult | { question: string; sources?: string[] },
): QuestionGenerationResult {
  if ('ok' in raw) return raw;
  if (typeof raw.question !== 'string' || raw.question.trim().length < 1) {
    return unavailableGeneration('generation_unavailable');
  }
  return modelGeneration(raw.question, Array.isArray(raw.sources) ? raw.sources : []);
}

export function isQuestionGenerationFailure(result: QuestionGenerationResult): result is Extract<QuestionGenerationResult, { ok: false }> {
  return result.ok === false;
}

export type CitedSourcesResolution =
  | { ok: true; sources: string[] }
  | { ok: false; reason: 'unknown_retrieval_reference' };

/**
 * Citations are provenance, not free text.
 * With retrieval evidence, every cited ref must be in this turn's known set.
 * With no material (scenario/behavioral), leftover citations are stripped —
 * they must not fail-close a valid stem.
 */
export function resolveCitedSources(
  knownRefs: readonly string[],
  citedRefs: readonly string[],
): CitedSourcesResolution {
  if (knownRefs.length === 0) return { ok: true, sources: [] };
  if (citedRefs.some((ref) => !knownRefs.includes(ref))) {
    return { ok: false, reason: 'unknown_retrieval_reference' };
  }
  return { ok: true, sources: [...citedRefs] };
}
