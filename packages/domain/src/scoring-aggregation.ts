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
import { GAP, type Assessment } from './assessment.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/** span 单一坐标系：UTF-8 字节（与 PostgreSQL octet_length 对齐；复用 memory-admission 的坐标系）。 */
export const SCORE_SPAN_OFFSET_KIND = 'utf8_byte' as const;
export type ScoreSpanOffsetKind = typeof SCORE_SPAN_OFFSET_KIND;

export const DISPOSITION_BANDS = ['below', 'meets', 'exceeds'] as const;
export type DispositionBand = (typeof DISPOSITION_BANDS)[number];

/** 判定档位 → 确定性分量（below:0 / meets:1 / exceeds:2）。per-criterion score = 50×band。 */
export const DISPOSITION_BAND_VALUE: Record<DispositionBand, number> = { below: 0, meets: 1, exceeds: 2 };

/**
 * 0103 契约证据的 worker 侧形状（#52 v6 起）：模型只直出 criterionId+quote+disposition，
 * quote→span/digest 的派生在本域单源完成（scoreDispositionFromCodeUnitSpan），跨 checkpoint/
 * 写卡消费。sourceAnswerId/answerVersion 由写卡侧从 score_request 补齐（contracts ScoreEvidenceShape）。
 */
export interface ScoredCriterionDisposition {
  criterionId: string;
  disposition: DispositionBand;
  span: ScoreSpan;
  spanDigest: string;
}

/**
 * 把「答案内 UTF-16 code unit 区间」换算为 0103 契约证据（UTF-8 字节 span + sha256 字节 digest）。
 * #52 v6：模型 quote 经 evaluate 侧 toEvidenceRecord 得 code-unit span 后，唯一经本函数派生
 * score-writer 证据——明文答案只在 drain 内存态存活，span/digest 是派生物（非答案原文）。
 * 越界/倒序/非整数 span 一律 fail-closed（绝不静默截断）。
 */
export function scoreDispositionFromCodeUnitSpan(
  answerText: string, criterionId: string, disposition: DispositionBand, start: number, end: number,
): ScoredCriterionDisposition {
  if (typeof criterionId !== 'string' || criterionId.length === 0) fail('score_criterion_invalid');
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || end > answerText.length)
    fail('score_span_range_invalid');
  const span: ScoreSpan = {
    offsetKind: SCORE_SPAN_OFFSET_KIND,
    start: utf8ByteLength(answerText.slice(0, start)),
    end: utf8ByteLength(answerText.slice(0, end)),
  };
  return { criterionId, disposition, span, spanDigest: scoreSpanDigest(answerText, span) };
}

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

/**
 * D5 legacy-parity 适配（EXTREV-1 SCORE-WRITER S2·rev2 三钉）：ScoreCard 输入 → legacy
 * `Assessment` 形状（{overall, dimensions:[{dimension,score,gap,evidence}], weaknesses}），
 * 供 generateAssessmentFor 在 **INSERT 前**派生（D5(iii)）并按冻结形状落 assessment_report
 * （D5(ii)：interview.service 的 weaknesses 过滤 d.gap 与 web 消费零改动）。
 * 三钉落位：(i) gap 判定唯一经 GAP 单源（本文件顶部 import，禁字面量散布）；
 * (ii) 返回形状 = legacy Assessment 逐字段同形（evidence 文案 legacy parity）；
 * (iii) 纯域函数，调用方先派生后 INSERT。空可评集 fail-closed（score_aggregate_empty→409
 * 信封由调用方翻译），非评分态卡不进聚合（isScoreCardScorable 门，同 deriveScoreCardAssessment）。
 */
export function deriveScoreCardAssessmentLegacy(cards: readonly ScoreCardAssessmentInput[]): Assessment {
  const eligible = (cards ?? []).filter((c) => c && isScoreCardScorable(c.status));
  if (eligible.length === 0) fail('score_aggregate_empty');
  const groups = new Map<string, number[]>();
  for (const c of eligible) {
    const dim = (typeof c.competency === 'string' && c.competency.trim()) ? c.competency.trim() : c.questionId.slice(0, 40);
    const arr = groups.get(dim) ?? [];
    arr.push(c.deterministicTotal);
    groups.set(dim, arr);
  }
  const dimensions: Assessment['dimensions'] = [...groups.entries()].map(([dimension, ss]) => {
    const score = Math.round(ss.reduce((a, s) => a + s, 0) / ss.length);
    const gap = score < GAP;
    return { dimension, score, gap, evidence: gap ? '低于达标线，需加强' : '达标' };
  });
  const overall = aggregateScoreCards(eligible.map((c) => c.deterministicTotal));
  const weaknesses = dimensions.filter((d) => d.gap).map((d) => d.dimension);
  return { overall, dimensions, weaknesses };
}
