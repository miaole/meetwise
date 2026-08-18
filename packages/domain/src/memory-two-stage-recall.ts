/**
 * 两阶段召回 + 派发前复核（MEM-14）的纯域原语：授权/范围版本 digest + 渲染 digest。
 * 零 IO、零模型、零 db，可被 packages/db 与 proof 引用。
 *
 * 与 MEM-11（memory-index-generation.ts 的 manifest digest / recipe digest）同一 UTF-8 字节
 * 摘要纪律：digest 永远对 UTF-8 字节计算。本域只提供两个「冻结侧」摘要派生：
 *   - deriveAuthorizationVersion：冻结 ContextSnapshot 的「授权/范围版本」（consent revision +
 *     privacy epoch + 范围/用途/数据分类），是 freeze/dispatch 复核对齐的观察锚。
 *   - deriveRenderDigest：冻结「渲染 digest」（renderer version + 被选来源卡片）。这是 E1
 *     「同 snapshot_key 幂等回放字节等价」的承重：渲染器计算一次存入 snapshot，重放返回同 id
 *     同 render_digest，不随后续 index 分数/active generation 漂移而变化。
 *
 * 显式 enum（rejection reason / snapshot status）以 packages/contracts 的
 * `MemoryRecallRejectionReason` / `MemoryRecallContextSnapshotStatus` 为单一真相源（跨层单一
 * 事实源难同步，不在此维护一份会漂移的常量——同 memory-index-generation.ts LOW-1 诚实说明）。
 */

import { createHash } from 'node:crypto';

/** 授权/范围版本输入（freeze 时观察到的 live 授权快照，dispatch 时复核对齐）。 */
export interface MemoryAuthorizationVersionInput {
  controllerScope: string;
  purpose: string;
  consentRevision: number;
  privacyEpoch: number;
  allowedDataClasses: readonly string[];
}

/**
 * 授权/范围版本 digest：sha256 对固定键序字段拼接。
 * canonical = `${controllerScope}:${purpose}:${consentRevision}:${privacyEpoch}:${sorted allowedDataClasses}`。
 * 只含 text/int 字段（跨层 byte-for-byte 一致），不落 PII。
 */
export function deriveAuthorizationVersion(input: MemoryAuthorizationVersionInput): string {
  const canonical = [
    input.controllerScope,
    input.purpose,
    String(input.consentRevision),
    String(input.privacyEpoch),
    [...input.allowedDataClasses].sort().join(','),
  ].join(':');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/** 被选来源卡片（渲染 digest 输入；spanLocator 是 provenance，冻结进渲染输入但只在 TS 侧序列化）。 */
export interface MemoryRenderSourceCard {
  factId: string;
  factKey: string;
  contentDigest: string;
  sourceEntityId: string | null;
  immutableSourceVersion: string | null;
  sourceArtifactDigest: string | null;
  spanLocator: unknown;
  allowedDataClass: string;
  factVersion: number;
}

/**
 * 渲染 digest：sha256(rendererVersion + '\n' + 按 factId 排序的卡片固定键序 JSON)。
 * 卡片按 factId 排序（确定性），每张卡片固定键序 JSON 序列化——渲染器计算一次存入 snapshot，
 * E1 重放断言同 render_digest（字节等价）。spanLocator 进渲染输入（provenance 冻结），但因
 * jsonb 无跨层唯一规范序列化，**仅**在 TS 侧序列化、SQL 侧只存不重算（见 0105 头注释）。
 */
export function deriveRenderDigest(rendererVersion: string, cards: readonly MemoryRenderSourceCard[]): string {
  const canonical = [...cards]
    .sort((a, b) => (a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0))
    .map((c) => JSON.stringify({
      factId: c.factId,
      factKey: c.factKey,
      contentDigest: c.contentDigest,
      sourceEntityId: c.sourceEntityId ?? null,
      immutableSourceVersion: c.immutableSourceVersion ?? null,
      sourceArtifactDigest: c.sourceArtifactDigest ?? null,
      spanLocator: c.spanLocator ?? null,
      allowedDataClass: c.allowedDataClass,
      factVersion: c.factVersion,
    }))
    .join('\n');
  return createHash('sha256').update(rendererVersion + '\n' + canonical, 'utf8').digest('hex');
}
