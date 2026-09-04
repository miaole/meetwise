/**
 * 记忆向量块（vector_chunk kind=memory）删除 sink 注册表。
 *
 * MEM-00（0093）的 `memory_embedding` 只物理删除 `memory_index_generation`，
 * **不**覆盖 `vector_chunk`。INT-TRANSCRIPT 的 `vector` sink 无 interview 作用域键，
 * 面试删除诚实拒建 target。本模块是账户删除轨道上该物理表的**唯一域侧扩展点**：
 * 只登记 `memory_vector_chunk`，供 `privacy-authorization.ts` 的
 * `ALL_PRIVACY_AUTHZ_SINK_KINDS` 并集追加，与 SQL 侧 0124 迁移的
 * `privacy_deletion_target.sink` CHECK 增量双向 pin（漂移即证明失败）。
 *
 * 语义（如实登记，不伪删）：
 *   - 只覆盖 `vector_chunk.kind='memory'` 的 owner 行。
 *   - `kind='qbank'` 是共享题库（系统 owner），本 sink **永不**建 target、永不 DELETE。
 *   - 表无 fenced/purged 列 → begin 不改行状态；围栏靠写触发器拒迟到 INSERT/UPDATE；
 *     purge = 纯物理 DELETE + 残留=0。
 *   - `user_memory`、`ai_invocation_trace`、OSS/Redis/Langfuse/备份仍是未闭合缺口，
 *     见 `ai-docs/architecture/ai/privacy-deletion-sink-inventory.md`。
 *
 * 这里**不重实现**删除根（begin/claim/purge 的密码学与账本冻结在 privacy-authorization.ts +
 * 0047/0091；本模块零 IO、零模型、零 db）。
 */
export const MEMORY_VECTOR_CHUNK_DELETION_SINKS = ['memory_vector_chunk'] as const;
export type MemoryVectorChunkDeletionSink = (typeof MEMORY_VECTOR_CHUNK_DELETION_SINKS)[number];
