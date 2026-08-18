/**
 * @meetwise/domain · 评分确定性聚合（SCOR-02）纯域原语（零 IO、零模型、零 db）。
 *
 * 这是「模型不是总分权威」的算分侧纯逻辑：模型只输出 criterionId + span + digest + disposition，
 * 总分在此按确定性公式算（与迁移 0103 的 DB 函数逐值一致，跨侧 proof pin 兜底）。span/digest
 * 的文本级复验也在此（DB 只做绑定级复验——答案正文是 ciphertext，DB 无明文，故「span 在当前
 * 答案版本内 + sha256(span 覆盖的 UTF-8 字节)==digest」只能由持有明文的 domain 侧做）。
 *
 * 边界：多来源冲突/uncertainty 语义（SCOR-03）不在此；missing_reason/conflict_reason 只预留、
 * 本域不产出。
 */
import { createHash } from 'node:crypto';
import { isScoreCardScorable, type ScoreCardStatus } from './scoring-fact-root.ts';
import { utf8ByteLength } from './memory-admission.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/** span 单一坐标系：UTF-8 字节（与 PostgreSQL octet_length 对齐；复用 memory-admission 的坐标系）。 */
export const SCORE_SPAN_OFFSET_KIND = 'utf8_byte' as const;
export type ScoreSpanOffsetKind = typeof SCORE_SPAN_OFFSET_KIND;

export const DISPOSITION_BANDS = ['below', 'meets', 'exceeds'] as const;
export type DispositionBand = (typeof DISPOSITION_BANDS)[number];

/** 判定档位 → 确定性分量（below:0 / meets:1 / exceeds:2）。per-criterion score = 50×band。 */
export const DISPOSITION_BAND_VALUE: Record<DispositionBand, number> = { below: 0, meets: 1, exceeds: 2 };

export interface ScoreSpan {
  offsetKind: ScoreSpanOffsetKind;
  start: number;
  end: number;
}

/** 规范化 span：只认 UTF-8 字节坐标系 + 半开区间 [start,end)，end >= start。 */
export function canonicalScoreSpan(span: ScoreSpan): string {
  if (!span || typeof span !== 'object') fail('score_span_invalid');
  if (span.offsetKind !== SCORE_SPAN_OFFSET_KIND) fail('score_span_offset_kind_invalid');
  if (!Number.isSafeInteger(span.start) || !Number.isSafeInteger(span.end) || span.start < 0 || span.end < span.start)
    fail('score_span_range_invalid');
  return `${SCORE_SPAN_OFFSET_KIND}:${span.start}:${span.end}`;
}

/** span digest = sha256(span 覆盖的 UTF-8 字节) hex。确定性，非模型。 */
export function scoreSpanDigest(answerText: string, span: ScoreSpan): string {
  canonicalScoreSpan(span);
  const slice = new TextEncoder().encode(answerText).slice(span.start, span.end);
  return createHash('sha256').update(slice).digest('hex');
}

/** 文本级复验：span 在当前答案版本内 + digest 匹配。失败 → false（自由文字不能代替 criterionId）。 */
export function reverifyScoreEvidenceSpan(answerText: string, span: ScoreSpan, spanDigest: string): boolean {
  try { canonicalScoreSpan(span); } catch { return false; }
  if (span.end > utf8ByteLength(answerText)) return false;
  return scoreSpanDigest(answerText, span) === spanDigest;
}

export interface DeterministicCriterion {
  criterionId: string;
  disposition: DispositionBand;
  weight: number;
}

/**
 * 确定性总分：round( Σ(weight×band×50) / Σ(weight) ) = round(100×Σ(weight×band)/(2×Σ(weight)))。
 * 0..100 整数；空集/重复 criterionId/非法档位/非法权重一律抛错（fail-closed，非 0 分）。
 */
export function computeDeterministicTotal(items: readonly DeterministicCriterion[]): number {
  if (!Array.isArray(items) || items.length === 0) fail('score_deterministic_total_empty');
  let numerator = 0;
  let denominator = 0;
  const seen = new Set<string>();
  for (const it of items) {
    if (!it || typeof it.criterionId !== 'string' || it.criterionId.length === 0) fail('score_criterion_invalid');
    if (seen.has(it.criterionId)) fail('score_duplicate_criterion');
    seen.add(it.criterionId);
    // 显式档位 → 分量（避免 Record 索引在 noUncheckedIndexedAccess 下的 undefined/any 收窄问题）。
    const bandVal: number = it.disposition === 'below' ? 0
      : it.disposition === 'meets' ? 1
      : it.disposition === 'exceeds' ? 2
      : fail('score_disposition_invalid');
    if (!(typeof it.weight === 'number' && Number.isFinite(it.weight) && it.weight > 0)) fail('score_weight_invalid');
    numerator += it.weight * bandVal * 50;
    denominator += it.weight;
  }
  const total = Math.round(numerator / denominator);
  if (!Number.isInteger(total) || total < 0 || total > 100) fail('score_deterministic_total_out_of_range');
  return total;
}

/** 证据覆盖度（SCOR-02 全部 rubric 分项必须有证据，故可评分态卡恒 1.0）。 */
export function computeCoverage(scoredCount: number, requiredCount: number): number {
  if (!Number.isSafeInteger(requiredCount) || requiredCount <= 0) fail('score_coverage_invalid');
  if (!Number.isSafeInteger(scoredCount) || scoredCount < 0 || scoredCount > requiredCount) fail('score_coverage_invalid');
  return scoredCount / requiredCount;
}

/** 多卡均值聚合（C 端）：空集抛错（无分 ≠ 0 分），逐项 0..100 整数。 */
export function aggregateScoreCards(totals: readonly number[]): number {
  if (!Array.isArray(totals) || totals.length === 0) fail('score_aggregate_empty');
  if (totals.some((t) => !Number.isInteger(t) || t < 0 || t > 100)) fail('score_aggregate_invalid_input');
  return Math.round(totals.reduce((s, t) => s + t, 0) / totals.length);
}

export interface ScoreCardAssessmentInput {
  questionId: string;
  competency: string;
  deterministicTotal: number;
  status: ScoreCardStatus;
}

export interface ScoreCardAssessment {
  /** null = 无有效评分证据（scoreless）；非 null = 确定性总分（0..100 整数）。 */
  overall: number | null;
  dimensions: Array<{ dimension: string; score: number }>;
  eligibleCount: number;
  nonScorableCount: number;
}

/**
 * C 端能力评估消费面（ScoreCard 路径）：只聚合可评分态卡（isScoreCardScorable），
 * 非评分态不进入 overall/dimensions、只计入 nonScorableCount。与 legacy `deriveAssessment`
 * （模型 0..100 整数）刻意分离——legacy 事件结构性不再走此路径。
 */
export function deriveScoreCardAssessment(cards: readonly ScoreCardAssessmentInput[]): ScoreCardAssessment {
  const eligible = (cards ?? []).filter((c) => c && isScoreCardScorable(c.status));
  const nonScorable = (cards ?? []).length - eligible.length;
  if (eligible.length === 0) {
    return { overall: null, dimensions: [], eligibleCount: 0, nonScorableCount: nonScorable };
  }
  const groups = new Map<string, number[]>();
  for (const c of eligible) {
    const dim = (typeof c.competency === 'string' && c.competency.trim()) ? c.competency.trim() : c.questionId.slice(0, 40);
    const arr = groups.get(dim) ?? [];
    arr.push(c.deterministicTotal);
    groups.set(dim, arr);
  }
  const dimensions = [...groups.entries()].map(([dimension, ss]) => ({
    dimension,
    score: Math.round(ss.reduce((a, s) => a + s, 0) / ss.length),
  }));
  return {
    overall: aggregateScoreCards(eligible.map((c) => c.deterministicTotal)),
    dimensions,
    eligibleCount: eligible.length,
    nonScorableCount: nonScorable,
  };
}
