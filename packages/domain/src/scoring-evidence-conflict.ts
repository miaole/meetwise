/**
 * @meetwise/domain · 评分证据冲突与多来源 uncertainty（SCOR-03）纯域原语（零 IO、零模型、零 db）。
 *
 * 这是「证据必须针对当前答案版本复验」「required coverage」「多来源 uncertainty 独立保存」
 * 「冲突 → review_required / unscored（非 0 分）」的纯逻辑侧。span/digest 的文本级复验只能由
 * 持有明文的 domain 做（DB 存的是 ciphertext，见 0092/0103 的两层复验设计）：这里针对 canonical
 * answer artifact 重算 span/digest，不一致即冲突（自由文字不能代替 criterionId）。
 *
 * 铁律（对齐 interview-scoring-measurement.md §2/§3/§5）：
 *   - uncertainty 是 8 个**独立**来源字段（证据 coverage / 来源完整性 / 语音质量 / 模型分歧 /
 *     适用语言 / rubric 难度 / calibration release / 人工复核状态），各自 enum/boolean，禁布尔汤、
 *     禁 JSON 合并。模型自报 confidence 不在本列集——只作观察信号，绝不单独解锁用途。
 *   - 冲突/低 coverage/低语音/分歧/来源不完整/语言不适用/高影响 → review_required；
 *     干净且低影响 → practice_eligible。判定由 DB `scoring_adjudicate_score_card` 权威执行，
 *     本模块 `resolveScoreCardAdjudication` 与之逐值一致，靠跨侧 proof 逐值 pin 兜底
 *     （两侧是两份手写真相，漂移不会在运行期被自动拒绝）。
 */
import { reverifyScoreEvidenceSpan, canonicalScoreSpan, type ScoreSpan, type DispositionBand } from './scoring-aggregation.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/* ── ① span/digest 证据集复验（针对当前答案版本重算；不一致 → 冲突）────────────── */
export interface ScoreEvidenceReverifyInput {
  criterionId: string;
  span: ScoreSpan;
  spanDigest: string;
}

export interface ScoreEvidenceReverifyResult {
  criterionId: string;
  /** true = 域级复验通过（span 界内 + digest 匹配当前答案版本）；false = 冲突。 */
  reverified: boolean;
  /** 冲突固定码（非自由文字，不进 DB 的 PII 面）。 */
  conflictReason: 'span_digest_mismatch' | null;
}

/** 对一组证据逐条做文本级复验：span 界内 + sha256(span 覆盖 UTF-8 字节) == digest。 */
export function reverifyScoreEvidenceSet(
  answerText: string,
  items: readonly ScoreEvidenceReverifyInput[],
): ScoreEvidenceReverifyResult[] {
  if (typeof answerText !== 'string') fail('score_answer_text_invalid');
  if (!Array.isArray(items) || items.length === 0) fail('score_evidence_set_empty');
  return items.map((it) => {
    if (!it || typeof it.criterionId !== 'string' || it.criterionId.length === 0) fail('score_criterion_invalid');
    const ok = reverifyScoreEvidenceSpan(answerText, it.span, it.spanDigest);
    return { criterionId: it.criterionId, reverified: ok, conflictReason: ok ? null : 'span_digest_mismatch' };
  });
}

/* ── ② 多来源 uncertainty（8 个独立字段，禁单布尔/单分数/JSON 合并）────────────── */
export const UNCERTAINTY_EVIDENCE_COVERAGE_VALUES = ['complete', 'partial', 'missing'] as const;
export const UNCERTAINTY_SOURCE_INTEGRITY_VALUES = ['verified', 'stale', 'mismatch'] as const;
export const UNCERTAINTY_VOICE_QUALITY_VALUES = ['ok', 'low', 'unavailable'] as const;
export const UNCERTAINTY_RUBRIC_DIFFICULTY_VALUES = ['low', 'mid', 'high', 'unknown'] as const;
export const UNCERTAINTY_HUMAN_REVIEW_VALUES = ['none', 'pending', 'resolved'] as const;

export type UncertaintyEvidenceCoverage = (typeof UNCERTAINTY_EVIDENCE_COVERAGE_VALUES)[number];
export type UncertaintySourceIntegrity = (typeof UNCERTAINTY_SOURCE_INTEGRITY_VALUES)[number];
export type UncertaintyVoiceQuality = (typeof UNCERTAINTY_VOICE_QUALITY_VALUES)[number];
export type UncertaintyRubricDifficulty = (typeof UNCERTAINTY_RUBRIC_DIFFICULTY_VALUES)[number];
export type UncertaintyHumanReview = (typeof UNCERTAINTY_HUMAN_REVIEW_VALUES)[number];

/** 8 个独立来源（与迁移 0109 的 score_card 8 列逐值一致；顺序即 §112 的来源清单）。 */
export interface ScoreUncertainty {
  evidenceCoverage: UncertaintyEvidenceCoverage;
  sourceIntegrity: UncertaintySourceIntegrity;
  voiceQuality: UncertaintyVoiceQuality;
  modelDisagreement: boolean;
  languageApplicable: boolean;
  rubricDifficulty: UncertaintyRubricDifficulty;
  calibrationRelease: boolean;
  humanReview: UncertaintyHumanReview;
}

export const SCORE_UNCERTAINTY_SOURCE_COUNT = 8;

/** 中性 uncertainty（SCOR-02 既有 writer 不写这些列时 DB 缺省值与此逐值一致）。 */
export function defaultScoreUncertainty(): ScoreUncertainty {
  return {
    evidenceCoverage: 'complete',
    sourceIntegrity: 'verified',
    voiceQuality: 'ok',
    modelDisagreement: false,
    languageApplicable: true,
    rubricDifficulty: 'unknown',
    calibrationRelease: false,
    humanReview: 'none',
  };
}

const SETS = {
  evidenceCoverage: UNCERTAINTY_EVIDENCE_COVERAGE_VALUES,
  sourceIntegrity: UNCERTAINTY_SOURCE_INTEGRITY_VALUES,
  voiceQuality: UNCERTAINTY_VOICE_QUALITY_VALUES,
  rubricDifficulty: UNCERTAINTY_RUBRIC_DIFFICULTY_VALUES,
  humanReview: UNCERTAINTY_HUMAN_REVIEW_VALUES,
} as const;

/** 8 来源分离守护：逐字段校验 enum + 布尔，非法值 fail-closed（与 DB CHECK 约束逐值一致）。 */
export function assertScoreUncertaintySeparation(u: ScoreUncertainty): void {
  if (!u || typeof u !== 'object') fail('score_uncertainty_invalid');
  for (const key of Object.keys(SETS) as Array<keyof typeof SETS>) {
    const allowed = SETS[key] as readonly string[];
    if (!allowed.includes(u[key] as string)) fail(`score_uncertainty_${key}_invalid`);
  }
  if (typeof u.modelDisagreement !== 'boolean') fail('score_uncertainty_model_disagreement_invalid');
  if (typeof u.languageApplicable !== 'boolean') fail('score_uncertainty_language_applicable_invalid');
  if (typeof u.calibrationRelease !== 'boolean') fail('score_uncertainty_calibration_release_invalid');
}

/* ── ③ 裁决（与 DB scoring_adjudicate_score_card 逐值一致，跨侧 proof pin）───────── */
export interface ScoreCardAdjudicationInput {
  /** 域级复验失败的证据条数（conflict）。 */
  conflictCount: number;
  /** 缺失的 required 分项数。 */
  missingRequiredCount: number;
  uncertainty: ScoreUncertainty;
  /** B 端高影响用途（spec §83：高影响用途进入 review）。 */
  highImpact: boolean;
}

export type ScoreCardAdjudicationStatus = 'practice_eligible' | 'review_required';

/**
 * 冲突/低 coverage/低语音/模型分歧/来源不完整/语言不适用/高影响 → review_required；
 * 干净且低影响 → practice_eligible。与 DB 函数决策规则逐值一致。
 * 注意：voiceQuality='unavailable' 表示「无语音」而非「低语音质量」，不单独触发 review
 * （文字作答本就无语音）；只有 'low'（低语音质量）触发 review。
 */
export function resolveScoreCardAdjudication(input: ScoreCardAdjudicationInput): ScoreCardAdjudicationStatus {
  if (!input || typeof input !== 'object') fail('score_adjudication_invalid');
  const u = input.uncertainty;
  assertScoreUncertaintySeparation(u);
  if (!Number.isSafeInteger(input.conflictCount) || input.conflictCount < 0) fail('score_adjudication_conflict_invalid');
  if (!Number.isSafeInteger(input.missingRequiredCount) || input.missingRequiredCount < 0) fail('score_adjudication_missing_invalid');
  if (typeof input.highImpact !== 'boolean') fail('score_adjudication_high_impact_invalid');
  const review = input.conflictCount > 0
    || input.missingRequiredCount > 0
    || u.modelDisagreement
    || u.voiceQuality === 'low'
    || u.sourceIntegrity !== 'verified'
    || u.languageApplicable === false
    || input.highImpact;
  return review ? 'review_required' : 'practice_eligible';
}

/* ── ④ required coverage（复用 SCOR-02 的 computeCoverage；这里提供缺失分项派生）──── */
export interface MissingRequiredCriterion {
  criterionId: string;
  reason: 'missing_required';
}

/** 从 required 分项集与已给出证据的 criterionId 集派生缺失分项（固定 reason，无自由文字）。 */
export function deriveMissingRequiredCriteria(
  requiredCriterionIds: readonly string[],
  scoredCriterionIds: readonly string[],
): MissingRequiredCriterion[] {
  const scored = new Set(scoredCriterionIds);
  const missing = requiredCriterionIds.filter((id) => !scored.has(id));
  return missing.map((criterionId) => ({ criterionId, reason: 'missing_required' as const }));
}

/* re-export span 相关类型供 proof 便捷使用（不重实现，仅转发 SCOR-02 原语）。 */
export type { ScoreSpan, DispositionBand };
export { canonicalScoreSpan };
