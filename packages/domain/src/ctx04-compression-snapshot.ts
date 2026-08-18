/**
 * 可验证压缩快照（CTX-04）纯域原语：显式 enum（非布尔汤）+ 确定性 source_artifact_digest
 * 派生 + claim→来源 span 回溯校验（零模型补全契约）+ 状态机白名单。
 *
 * 与迁移 0115_ctx04_verifiable_compression_snapshot.sql 的 CHECK 约束与单向 guard 逐值一致
 * （漂移即证明失败）。这里**不重实现**：
 *   - 删除根（fenced→purged 的实际 begin/claim/purge resolver 归 CTX-06，本模块只声明状态）；
 *   - MEM-02 的 summary 本体 / MEM-03 树 / MEM-14 memory_context_snapshot（不同对象）；
 *   - 真实 tokenizer（MODEL-OP，估算用保守 tokenizer + 注释披露）、真实模型摘要。
 * 本模块只提供：
 *   - `COMPRESSION_SNAPSHOT_STATUSES`（draft/active/superseded/fenced/purged，SQL CHECK 钉死）。
 *   - `COMPRESSION_SNAPSHOT_LEGAL_TRANSITIONS` / `isLegalCompressionSnapshotTransition`：单向白名单。
 *   - `deriveCompressionSnapshotSourceArtifactDigest`：原文 sha256（claim 回溯的字节级指纹）。
 *   - `traceCompressionSnapshotClaims`：claim→来源 span 回溯校验。span 越界 / 原文 digest 逐字节
 *     失配 → 整条摘要 traceable=false（丢弃），**绝不 call 模型补全**（backfill seam 永不调用）。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { createHash } from 'node:crypto';
import { assertSummaryClaimSpan, SUMMARY_SPAN_OFFSET_KIND } from './memory-summary.ts';
import type { SummaryClaim } from './memory-summary.ts';

/** 压缩快照状态机（显式 enum，单向）：draft→active→superseded/fenced→purged。 */
export const COMPRESSION_SNAPSHOT_STATUSES = [
  'draft', 'active', 'superseded', 'fenced', 'purged',
] as const;
export type CompressionSnapshotStatus = (typeof COMPRESSION_SNAPSHOT_STATUSES)[number];

/**
 * 单向状态机白名单（与 0115 assert_context_compression_snapshot_status_oneway 逐值一致，漂移即证明失败）。
 * draft 只能进 active/fenced；active 只能进 superseded/fenced；superseded 只能进 fenced；
 * fenced 只能进 purged。一切回退（purged/fenced/superseded → 更前状态）非法。
 */
export const COMPRESSION_SNAPSHOT_LEGAL_TRANSITIONS: ReadonlyArray<readonly [CompressionSnapshotStatus, CompressionSnapshotStatus]> = [
  ['draft', 'active'], ['draft', 'fenced'],
  ['active', 'superseded'], ['active', 'fenced'],
  ['superseded', 'fenced'],
  ['fenced', 'purged'],
];

/** 单向跃迁合法性（与 0115 触发器同源，供 proof 交叉校验）。 */
export function isLegalCompressionSnapshotTransition(from: CompressionSnapshotStatus, to: CompressionSnapshotStatus): boolean {
  if (from === to) return true;
  return COMPRESSION_SNAPSHOT_LEGAL_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/**
 * 原文 artifact digest（sha256 拼接正文，与 claim 回溯的字节级指纹一致）。服务端/调用方重算，
 * 绝不采信自报指纹。拼接方式（如 `\n`）由调用方在冻结范围时决定，本函数只做字节级哈希。
 */
export function deriveCompressionSnapshotSourceArtifactDigest(sourceText: string): string {
  if (typeof sourceText !== 'string' || sourceText.length === 0) {
    throw Object.assign(new Error('ctx04_source_text_empty'), { code: 'ctx04_source_text_empty' });
  }
  return sha256(sourceText);
}

/** claim→来源 span 回溯结果（失败原因用稳定 code，上层按 code 分支，不散播正文）。 */
export interface CompressionSnapshotClaimTraceResult {
  /** 是否可回溯（全部 claim span 落在 source 内 + 原文 digest 逐字节匹配）。 */
  traceable: boolean;
  /** 无法回溯的 claim 下标（span 越界）；digest/长度失配时也会标记为不可回溯但无具体 claim。 */
  droppedClaimIndices: number[];
  /** 失败原因 code（traceable=true 时为 null）。 */
  reason: 'source_digest_mismatch' | 'source_length_mismatch' | 'claim_span_out_of_bounds' | null;
  /** 服务端重算的原文 digest 与 UTF-8 字节长（供 proof 交叉 pin，不采信输入）。 */
  recomputedSourceArtifactDigest: string;
  recomputedSourceUtf8ByteLength: number;
}

export interface CompressionSnapshotClaimTraceInput {
  /** 被摘要覆盖的原文拼接正文（用于逐字节重算 digest + span 上界）。 */
  sourceText: string;
  /** 调用方自报原文 digest（必须与服务端重算逐字节一致，否则 fail-closed 丢弃）。 */
  sourceArtifactDigest: string;
  /** 调用方自报 UTF-8 字节长（必须与服务端重算一致）。 */
  sourceUtf8ByteLength: number;
  /** 待回溯的 claims（每 claim 带 utf8_byte span）。 */
  claims: SummaryClaim[];
  /**
   * 模型补全 seam——**永不调用**（任何路径）。存在只为让 proof 注入计数替身，证明「claim 无法
   * 回溯 → 零模型调用」是硬契约而非约定：若未来有人在此补全摘要，计数替身会立刻把证明打红。
   */
  backfill?: () => string;
}

const utf8Len = (s: string) => new TextEncoder().encode(s).length;

/**
 * claim→来源 span 回溯校验（fail-closed）：
 *   1. 逐字节重算原文 artifact digest 与 UTF-8 字节长，与调用方自报逐字节比较；失配 → traceable=false。
 *   2. 每个 claim span：offsetKind 固定 utf8_byte、0 <= start < end <= 字节长；越界 → 标记 dropped。
 *   3. 任何一条不可回溯 → 整条摘要 traceable=false（整条不可成为上下文），**绝不 call 模型补全**
 *      （backfill seam 永不引用；proof 正对照证明丢弃路径真走且零模型调用）。
 */
export function traceCompressionSnapshotClaims(input: CompressionSnapshotClaimTraceInput): CompressionSnapshotClaimTraceResult {
  // 刻意不引用 input.backfill——「绝不 call 模型补全」由「函数体内零 backfill 引用」承重，
  // 而非运行时分叉。proof 用计数替身证明该 seam 在丢弃路径与合法路径都是 0 调用。
  const recomputedSourceArtifactDigest = sha256(input.sourceText);
  const recomputedSourceUtf8ByteLength = utf8Len(input.sourceText);

  if (recomputedSourceArtifactDigest !== input.sourceArtifactDigest) {
    return {
      traceable: false, droppedClaimIndices: [], reason: 'source_digest_mismatch',
      recomputedSourceArtifactDigest, recomputedSourceUtf8ByteLength,
    };
  }
  if (recomputedSourceUtf8ByteLength !== input.sourceUtf8ByteLength) {
    return {
      traceable: false, droppedClaimIndices: [], reason: 'source_length_mismatch',
      recomputedSourceArtifactDigest, recomputedSourceUtf8ByteLength,
    };
  }

  const droppedClaimIndices: number[] = [];
  (input.claims ?? []).forEach((claim, index) => {
    try {
      assertSummaryClaimSpan(claim.span);
      if (claim.span.end > recomputedSourceUtf8ByteLength) {
        droppedClaimIndices.push(index);
      }
    } catch {
      droppedClaimIndices.push(index);
    }
  });

  if (droppedClaimIndices.length > 0) {
    return {
      traceable: false, droppedClaimIndices, reason: 'claim_span_out_of_bounds',
      recomputedSourceArtifactDigest, recomputedSourceUtf8ByteLength,
    };
  }
  return {
    traceable: true, droppedClaimIndices: [], reason: null,
    recomputedSourceArtifactDigest, recomputedSourceUtf8ByteLength,
  };
}
