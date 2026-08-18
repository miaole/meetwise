/**
 * 撤回、过期和删除（CTX-06）纯域原语：压缩轨道的删除 sink 注册表。
 *
 * 这是 CTX-04（0115 压缩快照）/ CTX-05（0117 压缩派发）两处删除孤儿的**唯一域侧扩展点**：
 * 只登记删除 sink 集合，供 `privacy-authorization.ts` 的 `ALL_PRIVACY_AUTHZ_SINK_KINDS` 并集
 * 追加（sign 只保证 kind 属于某个已登记 registry，不判断域归属），与 SQL 侧 0118 迁移的
 * `privacy_deletion_target.sink` CHECK 增量双向 pin（漂移即证明失败）。
 *
 * 两条 sink 语义（如实登记，不伪删）：
 *   - `context_compression_snapshot`：owner 级、含明文 `summary_claims.text` 派生摘要 claim
 *     文本（可含 PII）。有 fenced/purged 状态 → 删除走完整 fence→purge→物理 DELETE。
 *   - `context_compression_dispatch`：无 PII，只存 range/digest/version/lease/snapshot_id/版本串。
 *     **无 fenced/purged 状态** → 删除不 fence、purge=纯物理 DELETE（诚实披露，非空函数假装闭合）。
 *
 * 这里**不重实现**删除根（begin/claim/purge 的密码学与账本冻结在 privacy-authorization.ts +
 * 0047/0091 迁移；本模块零 IO、零模型、零 db）。
 */
export const COMPRESSION_DELETION_SINKS = [
  'context_compression_snapshot',
  'context_compression_dispatch',
] as const;
export type CompressionDeletionSink = (typeof COMPRESSION_DELETION_SINKS)[number];
