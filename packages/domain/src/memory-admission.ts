/**
 * 记忆准入元标签门（MEM-12）的纯域原语。
 *
 * 与 MEM-00 的 memory-governance.ts 刻意分开：MEM-00 是「存储 + 召回 + 删除」的数据面，
 * 本模块是「跨会话写入**之前**的准入门」——三身份拆分、完整元标签集、spanLocator 单一坐标
 * 系、六分量分离，全部在此收敛为可被 contracts + db + proof 复用的纯函数。
 *
 * 本模块只落地两样东西，其余交给 db/contracts：
 *
 *  1. **spanLocator 坐标系固定为 UTF-8 字节偏移**（全系统统一，见下方 rationale）。JS 的
 *     UTF-16 下标（emoji/中文/代理对会在跨平台漂移）**绝不进入持久化契约**；Unicode code-point
 *     也不再是合法坐标（NFC/NFD 同一段文本的 code-point 计数不同，会造成「内容没变、span 漂移」
 *     的跨层误拒）。UTF-8 字节偏移与 PostgreSQL 的 `octet_length()`（UTF-8 字节数）逐字节对齐，
 *     digest 也永远对 UTF-8 字节计算，保证「中文/emoji/NFC/NFD」在 TS↔SQL 下 byte-for-byte 一致。
 *
 *  2. **六分量分离守护**：sourceTrust / extractionConfidence / verificationState /
 *     freshness·expiresAt / salience / retrievalScore 是六条互不推导的独立轴。本模块只守护
 *     「retrievalScore 不可覆盖 sourceTrust」与「模型输出只能 candidate、不能升 active」这两条
 *     承重不变式（完整冲突/激活状态机属 MEM-13，本模块不建）。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */

/** spanLocator 单一坐标系：UTF-8 字节偏移（MEM-12 全系统统一，绝无 UTF-16 / code-point）。 */
export const ADMISSION_SPAN_OFFSET_KIND = 'utf8_byte' as const;
export type AdmissionSpanOffsetKind = typeof ADMISSION_SPAN_OFFSET_KIND;

/** 准入 span locator：半开区间 [start, end)，单位 = UTF-8 字节。 */
export interface AdmissionSpanLocator {
  offsetKind: AdmissionSpanOffsetKind;
  start: number;
  end: number;
}

/** 非法准入元数据统一失败出口：错误名即 code（上层按 code 分支）。 */
const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

/**
 * UTF-8 字节长度（TextEncoder 编码后计数）。与 PostgreSQL `octet_length()` 完全一致——两者
 * 都是「UTF-8 字节数」，不是 JS string.length（UTF-16 code unit 数）。中文/emoji 多字节下
 * 二者差异是 span 校验的关键承重点（UTF-16 下标必然错位、越界）。
 */
export function utf8ByteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

/**
 * 准入 span 规范化：`utf8_byte:start:end`。offsetKind 必须是固定的 'utf8_byte'（任何其它值，
 * 含 'unicode_codepoint' 与 UTF-16，一律 fail-closed）；start/end 必须是非负安全整数且
 * start<=end。规范化字符串进入 source 摘要计算，保证同一 span 在任意调用方写出完全相同的
 * 持久化坐标。
 */
export function canonicalAdmissionSpan(span: AdmissionSpanLocator): string {
  if (!span || typeof span !== 'object') fail('memory_admission_span_invalid');
  if (span.offsetKind !== ADMISSION_SPAN_OFFSET_KIND) fail('memory_admission_span_offset_kind_invalid');
  if (!Number.isSafeInteger(span.start) || !Number.isSafeInteger(span.end) || span.start < 0 || span.end < span.start)
    fail('memory_admission_span_range_invalid');
  return `${ADMISSION_SPAN_OFFSET_KIND}:${span.start}:${span.end}`;
}

/** 模型生产方集合：summarizer / fact_extractor / classifier（产出只能是 candidate）。 */
export const ADMISSION_MODEL_PRODUCERS = ['summarizer', 'fact_extractor', 'classifier'] as const;

/** 服务端派生 sourceTrust：只由 source 类型决定（business_fact/user_confirmation → trusted，其余 → untrusted）。 */
export function deriveAdmissionSourceTrust(sourceType: string): 'trusted' | 'untrusted' {
  return sourceType === 'business_fact' || sourceType === 'user_confirmation' ? 'trusted' : 'untrusted';
}

/**
 * 六分量分离守护（fail-closed）：
 *  - retrievalScore 准入期必须为空（它只在**召回时**排序候选，绝不可在准入时被写入，更不可
 *    用来提升 sourceTrust）——任何非空 retrievalScore 一律拒绝。
 *  - status 准入期只能是 'candidate'（激活 candidate→active 是 MEM-13 的确认状态机，本门不产
 *    生 active；模型输出只能 candidate）。
 *  - producerClass 非法一律拒绝（模型生产方集合是封闭的）。
 * 这守护的是「检索分数不可覆盖 sourceTrust」+「模型输出不可升 active」两条承重不变式，不建
 * 完整冲突判定（属 MEM-13）。
 */
export function assertAdmissionTrustSeparation(meta: { producerClass: string; status?: string; retrievalScore?: number | null }): void {
  if (meta.retrievalScore !== undefined && meta.retrievalScore !== null) fail('admission_retrieval_score_forbidden');
  if (meta.status === 'active') fail('admission_activation_forbidden');
  if (meta.status !== undefined && meta.status !== 'candidate') fail('admission_status_forbidden');
  if (meta.producerClass !== 'summarizer' && meta.producerClass !== 'fact_extractor' && meta.producerClass !== 'classifier'
      && meta.producerClass !== 'business_validator' && meta.producerClass !== 'user') fail('admission_producer_invalid');
}
