/**
 * 记忆治理（MEM-00）的纯域原语：MEM 自己的 sink registry + span/digest 规范化。
 *
 * 这里**不重实现** PrivacyAuthorizationIssuer——签发/验签/目标集 digest 全部复用
 * packages/domain/privacy-authorization.ts（ECDSA P-256/ES256）。本模块只提供 MEM 域
 * 自己的两样东西，且与 INT-TRANSCRIPT 域**刻意不可互认**：
 *
 *   1. `MEMORY_AUTHZ_SINK_KINDS`：MEM 删除目标的 sink 枚举（记忆工件/摘要/事实/向量/缓存/
 *      snapshot/trace），与 INT-TRANSCRIPT 的 `PRIVACY_AUTHZ_SINK_KINDS`（checkpoint_rows/
 *      interview_job_payload/event/report/vector/redis/oss/langfuse）是两套不相交的值集。
 *      issuer 的 sign 侧把两套并集作为合法 kind 白名单（见 privacy-authorization.ts），但
 *      **claim/解析侧的 sink 归属校验由各域自己负责**：INT claim 只认 interview_data scope，
 *      MEM claim 只认 account_data scope + 本枚举内的 sink，跨域 claim 一律 fail-closed。
 *
 *   2. span/digest 规范化：`spanLocator` 固定为 UTF-8 byte offset 或 Unicode code-point
 *      offset 二选一；JS 的 UTF-16 下标**绝不进入持久化契约**（emoji/中文/代理对会让
 *      UTF-16 偏移在不同平台/语言间漂移）。digest 永远对 UTF-8 字节计算，保证“中文/emoji/
 *      NFC/NFD/代码块”在跨层（TS↔SQL）下 byte-for-byte 一致。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { createHash } from 'node:crypto';

/** MEM 删除目标 sink 枚举（MEM 自己的 sink registry，与 INT-TRANSCRIPT 不可互认）。 */
export const MEMORY_AUTHZ_SINK_KINDS = [
  'memory_event',            // 记忆工件（自由对话 event 的派生源，MEM-00 尚未建表，属未知 locator）
  'memory_summary',          // 摘要树（summary 摘要，MEM-00 尚未建表，属未知 locator）
  'memory_fact',             // 长期事实（memory_fact 表）
  'memory_embedding',        // 向量/索引 generation（memory_index_generation）。vector_chunk.kind=memory 是独立物理表，归 0125 memory_vector_chunk，不在本枚举。
  'memory_cache',            // 检索缓存（MEM-00 尚未建表，属未知 locator）
  'memory_context_snapshot', // 冻结上下文快照（memory_context_snapshot 表）
  'memory_trace',            // 观测 trace（MEM-00 尚未建表，属未知 locator）
] as const;

/** span 偏移坐标系：UTF-8 字节 或 Unicode code-point，二选一；**绝无 UTF-16**。 */
export type MemorySpanOffsetKind = 'utf8_byte' | 'unicode_codepoint';

/** 持久化的 span locator：显式声明坐标系 + 半开区间 [start, end)。 */
export interface MemorySpanLocator {
  offsetKind: MemorySpanOffsetKind;
  start: number;
  end: number;
}

/** 非法 span 统一失败出口：错误名即 code（上层按 code 分支）。 */
const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

/**
 * span 规范化：`offsetKind:start:end` 的确定性字符串。坐标必须是非负整数且 start<=end，
 * offsetKind 必须是两选一（UTF-16 直接拒绝）。规范化字符串进入 source 摘要计算，保证
 * 同一 span 在任意调用方写出完全相同的持久化坐标。
 */
export function canonicalMemorySpan(span: MemorySpanLocator): string {
  if (!span || typeof span !== 'object') fail('memory_span_invalid');
  if (span.offsetKind !== 'utf8_byte' && span.offsetKind !== 'unicode_codepoint') fail('memory_span_offset_kind_invalid');
  if (!Number.isSafeInteger(span.start) || !Number.isSafeInteger(span.end) || span.start < 0 || span.end < span.start)
    fail('memory_span_range_invalid');
  return `${span.offsetKind}:${span.start}:${span.end}`;
}

/** 内容摘要：对 UTF-8 字节做 sha256（64-hex）。与 memory_fact.content_digest 校验对齐。 */
export function memoryContentDigest(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * 来源工件摘要：sha256(UTF-8(sourceText) || '\n' || canonicalSpan)。把“内容字节 + 指定
 * span 的坐标系”钉在一起，水合时重算比对即可发现“内容被修订 / span 漂移 / 坐标被篡改”。
 * '\n' 是内容与 span 的分隔符；canonicalMemorySpan 不含 '\n'（只含数字/冒号/字母），
 * 故不会产生歧义碰撞。
 */
export function memorySourceDigest(sourceText: string, span: MemorySpanLocator): string {
  return createHash('sha256').update(sourceText, 'utf8').update('\n').update(canonicalMemorySpan(span), 'utf8').digest('hex');
}

// PII 业务护栏（“双校验”的第二道：schema 之后、business 之前）。记忆内容必须是派生摘要，
// 绝不带手机/邮箱/证件号等可识别 PII；schema 层在 contracts（MemoryFactWrite），本函数只
// 管“内容语义安全”，fail-closed（命中即拒，宁缺勿滥）。正则与 packages/domain 顶层
// ingestResume 的 PII 判定同源，但刻意独立——记忆内容与简历原文是两类输入，允许各自演进。
const MEMORY_PII_RES = [
  /(?:\+?86[-\s]?)1[3-9]\d{9}(?!\d)|(?<!\d)1[3-9]\d{9}(?!\d)/g, // 手机
  /[^\s@]+@[^\s@]+\.[^\s@]+/g,                                   // 邮箱
  /(?<!\d)(?:\d{17}[\dXx]|\d{15})(?!\d)/g,                       // 证件（18 位末位可 X / 15 位旧号）
];
/** 记忆内容业务护栏：非空、长度上限、无 PII。违反抛错（error.code = 具体原因）。 */
export function assertMemoryFactContentSafe(content: string): void {
  if (typeof content !== 'string' || content.length === 0) fail('memory_content_empty');
  if (content.length > 8000) fail('memory_content_too_long');
  for (const re of MEMORY_PII_RES) if (re.test(content)) fail('memory_content_pii');
}
