/**
 * 单轮与区间摘要（MEM-02）纯域原语：显式 enum（非布尔汤）+ 确定性 content_digest /
 * claim span 规范化 + 状态机白名单。
 *
 * 与迁移 0112_memory_summary.sql 的 CHECK 约束与 digest 算法逐值一致（漂移即证明失败）。
 *
 * 这里**不重实现**：
 *   - 删除根（冻结在 privacy-authorization.ts 的 issuer + 0093/0112 的 erasure）；
 *   - MEM-03 摘要树（parent/child 只留 FK 列，树逻辑不在此）；
 *   - CTX-04 compression snapshot、真实 embedding、真实模型摘要（归 MODEL-OP）。
 * 本模块只提供：
 *   - kind/status/purpose/retention/source_type/producer_class 的显式 enum 常量（SQL 侧 CHECK 钉死）。
 *   - `deriveSummaryContentDigest`：与 SQL `encode(digest(content,'sha256'),'hex')` 逐字节一致。
 *   - `deriveSummaryRangeDigest`：与 SQL `conversation_event_range_ref` 聚合逐字节一致（复用
 *     ctx03-event-source.ts 的 deriveRangeDigest——source_range_digest 就是冻结范围 digest）。
 *   - `assertSummaryClaimSpan` / `canonicalSummaryClaimSpan`：spanLocator 单一坐标系 UTF-8 字节
 *     偏移（沿用 0095 offsetKind='utf8_byte'，拒绝 UTF-16/code-point）。
 *   - `assertSummaryWriteSeparation`：summarizer 只能写 draft、模型输出绝不 direct active。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { createHash } from 'node:crypto';
import { deriveRangeDigest } from './ctx03-event-source.ts';

/** 摘要类别（显式 enum，最小集）：单轮摘要 / 区间摘要。 */
export const SUMMARY_KINDS = ['turn_summary', 'segment_summary'] as const;
export type SummaryKind = (typeof SUMMARY_KINDS)[number];

/** 摘要状态机（显式 enum，单向）：draft→verified→active→superseded/invalidated/fenced→purged。 */
export const SUMMARY_STATUSES = [
  'draft', 'verified', 'active', 'superseded', 'invalidated', 'fenced', 'purged',
] as const;
export type SummaryStatus = (typeof SUMMARY_STATUSES)[number];

/** 服务用途（显式 enum）：本摘要源仅服务「自由对话」派生（继承来源事件 consent_purpose）。 */
export const SUMMARY_PURPOSES = ['free_conversation'] as const;
export type SummaryPurpose = (typeof SUMMARY_PURPOSES)[number];

/** 保留策略类别（显式 enum）：session/account/derived（摘要固定 derived）。 */
export const SUMMARY_RETENTION_CLASSES = ['session', 'account', 'derived'] as const;
export type SummaryRetentionClass = (typeof SUMMARY_RETENTION_CLASSES)[number];

/** 来源类型（显式 enum）：摘要来源固定 conversation_event。 */
export const SUMMARY_SOURCE_TYPES = ['conversation_event'] as const;
export type SummarySourceType = (typeof SUMMARY_SOURCE_TYPES)[number];

/** 模型生产方（显式 enum）：摘要生产方固定 summarizer。 */
export const SUMMARY_PRODUCER_CLASSES = ['summarizer'] as const;
export type SummaryProducerClass = (typeof SUMMARY_PRODUCER_CLASSES)[number];

/** spanLocator 单一坐标系：UTF-8 字节偏移（沿用 0095，绝无 UTF-16 / code-point）。 */
export const SUMMARY_SPAN_OFFSET_KIND = 'utf8_byte' as const;
export type SummarySpanOffsetKind = typeof SUMMARY_SPAN_OFFSET_KIND;

/** 账户删除 sink（与 0112 迁移的 privacy_deletion_target.sink CHECK 双向 pin，0093/0111 已含）。 */
export const SUMMARY_SINK = 'memory_summary' as const;

/** 单向状态机白名单（与 0112 assert_memory_summary_status_oneway 逐值一致，漂移即证明失败）。 */
export const SUMMARY_LEGAL_TRANSITIONS: ReadonlyArray<readonly [SummaryStatus, SummaryStatus]> = [
  ['draft', 'verified'], ['draft', 'invalidated'], ['draft', 'fenced'],
  ['verified', 'active'], ['verified', 'invalidated'], ['verified', 'fenced'],
  ['active', 'superseded'], ['active', 'invalidated'], ['active', 'fenced'],
  ['superseded', 'fenced'],
  ['invalidated', 'fenced'],
  ['fenced', 'purged'],
];

/** claim 的 source span locator：半开区间 [start, end)，单位 = UTF-8 字节。 */
export interface SummaryClaimSpan {
  offsetKind: SummarySpanOffsetKind;
  start: number;
  end: number;
}

/** 结构化 claim：摘要断言 + 指向来源原文的 UTF-8 字节 span。 */
export interface SummaryClaim {
  text: string;
  span: SummaryClaimSpan;
}

/** 非法摘要输入统一失败出口：错误名即 code（上层按 code 分支）。 */
const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/**
 * 摘要正文 digest（与 0112 SQL `encode(digest(content,'sha256'),'hex')` 逐字节一致）。
 * 服务端重算，绝不采信调用方自报指纹。
 */
export function deriveSummaryContentDigest(content: string): string {
  if (typeof content !== 'string' || content.length === 0) fail('memory_summary_content_empty');
  return sha256(content);
}

/** checkpoint/摘要持有的来源范围 digest（复用 CTX-03 的 deriveRangeDigest，与 SQL 同公式）。 */
export function deriveSummaryRangeDigest(input: {
  threadId: string;
  fromSequence: number;
  toSequence: number;
  entries: Array<{ sequence: number; eventDigest: string }>;
}): string {
  return deriveRangeDigest(input);
}

/**
 * claim span 校验 + 规范化：`utf8_byte:start:end`。offsetKind 必须固定 'utf8_byte'（任何其它值
 * 一律 fail-closed）；start/end 必须是非负安全整数且 start < end（半开区间，空 span 不合法）。
 * 与 0112 SQL 的 span 校验逐值一致。
 */
export function assertSummaryClaimSpan(span: SummaryClaimSpan): void {
  if (!span || typeof span !== 'object') fail('memory_summary_span_invalid');
  if (span.offsetKind !== SUMMARY_SPAN_OFFSET_KIND) fail('memory_summary_span_offset_kind_invalid');
  if (!Number.isSafeInteger(span.start) || !Number.isSafeInteger(span.end)
      || span.start < 0 || span.end <= span.start) fail('memory_summary_span_range_invalid');
}

export function canonicalSummaryClaimSpan(span: SummaryClaimSpan): string {
  assertSummaryClaimSpan(span);
  return `${SUMMARY_SPAN_OFFSET_KIND}:${span.start}:${span.end}`;
}

/**
 * 写入侧状态分离守护（fail-closed）：摘要写入（draft 函数）只能 producerClass='summarizer' 且
 * status='draft'；任何把模型输出直接写成 verified/active 的企图一律拒绝（激活必须走受控
 * verify/activate 命令，模型输出绝不 direct active）。守护「summarizer 只能 draft」承重不变式。
 */
export function assertSummaryWriteSeparation(meta: { producerClass?: string; status?: string }): void {
  if (meta.producerClass !== undefined && meta.producerClass !== 'summarizer') fail('summary_producer_invalid');
  if (meta.status !== undefined && meta.status !== 'draft') fail('summary_activation_forbidden');
}

/** 单向跃迁合法性（与 0112 触发器同源，供 proof 侧交叉校验；不建完整冲突判定，属 MEM-03）。 */
export function isLegalSummaryTransition(from: SummaryStatus, to: SummaryStatus): boolean {
  if (from === to) return true;
  return SUMMARY_LEGAL_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
