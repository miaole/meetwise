---
id: privacy_deletion_sink_inventory
name: 隐私删除 sink 清单
description: 版本化枚举当前仓库必须出现在删除回执中的数据落点；只作盘点与围栏，不构成完整删除或发布证据。
type: architecture
scope: shared
level: guide
status: active
owner: architecture
version: 1
related:
  - ./memory-context-design.md
  - ../current-runtime-truth.md
  - ../../requirements/use-cases/privacy-deletion-sink-inventory.md
  - ../../requirements/use-cases/resume-erasure-lifecycle.md
  - ../../requirements/use-cases/checkpoint-privacy-erasure.md
tags:
  - privacy
  - deletion
  - inventory
  - vector_chunk
  - memory
---

# 隐私删除 sink 清单

> 本文是删除回执的**盘点真相**。它枚举当前代码里的 `privacy_deletion_target.sink`（隐私删除目标落点）与相邻物理表，并写明每个落点有没有 resolver（解析器）、物理 purge（清除）和删后残留=0。它**不是**完整删除权、不是公开删除入口、也不是发布证据。公开 `DELETE /privacy/*` 在清单未齐前保持 HTTP 503 fail-closed（故障关闭）。

机器可读对照：

- 域侧签发并集：`packages/domain/src/privacy-authorization.ts` 的 `ALL_PRIVACY_AUTHZ_SINK_KINDS`
- SQL 侧枚举：最新迁移对 `privacy_deletion_target.sink` 的 CHECK（当前为 `0124_memory_vector_chunk_erasure.sql`）
- 本迭代闭合：`memory_vector_chunk`（`vector_chunk.kind='memory'`）

验证（隔离 PostgreSQL 需要容器运行时；无容器时只跑域/静态 pin）：

```bash
pnpm -C packages/domain prove:memory-vector-chunk-deletion
pnpm memory-vector-chunk-erasure:prove
pnpm privacy-erasure:http:prove
pnpm docs:check
```

固定输出 `releaseEvidence=false`（不可作为发布证据）。

## 1. 本清单能与不能证明什么

它会拒绝：新增含用户内容的持久表或 `privacy_deletion_target.sink` 值却不登记；把 INT 的 `vector` 说成已删除 `vector_chunk`；把 `memory_embedding` 说成已覆盖向量块；在外部/备份/观测 sink 未齐时把公开删除写成已完成。

它**不会**删除备份、云对象存储、Redis/Tair、Langfuse 或供应商侧副本，也不会重开公开删除入口。

## 2. 公开删除入口（必须保持 fail-closed）

| 入口 | 当前代码 | 回执 |
| --- | --- | --- |
| `DELETE /privacy/resume-data` | `PrivacyService.deleteResumeData` 固定 HTTP 503，`resume_erasure_migration_in_progress` | 无 request / target |
| `DELETE /privacy/interview-data/:id` | `PrivacyService.eraseInterviewData` 固定 HTTP 503，`interview_erasure_authorization_not_available` | 无 request / target |
| `DELETE /resume/:id` | 同步硬删除已退役，同样 fail-closed | 无 |

在 §3 必收录执列与 §4.2 未闭合缺口全部有真实组合根回执之前，**禁止**把上述入口改成 202/204 或 `completed`。

## 3. `privacy_deletion_target.sink` 当前枚举（0124）

签发侧合法 kind = 五套 registry 的并集（`PRIVACY_AUTHZ_SINK_KINDS` ∪ `MEMORY_AUTHZ_SINK_KINDS` ∪ `CONVERSATION_EVENT_SINKS` ∪ `COMPRESSION_DELETION_SINKS` ∪ `MEMORY_VECTOR_CHUNK_DELETION_SINKS`）。域归属由各轨道 claim 函数强制，跨域 claim fail-closed。

0124 `privacy_deletion_target_sink_check` 全集（与迁移字面量一致；增删任一值必须同 PR 改本文与域 registry）：

`checkpoint_rows`, `interview_job_payload`, `event`, `report`, `vector`, `redis`, `oss`, `langfuse`, `interview_answer_artifact`, `memory_event`, `memory_summary`, `memory_fact`, `memory_embedding`, `memory_cache`, `memory_context_snapshot`, `memory_trace`, `ai_graph_run`, `conversation_event`, `conversation_event_artifact`, `context_compression_snapshot`, `context_compression_dispatch`, `memory_vector_chunk`。

CHECK 能插入 ≠ 已有 resolver。占位 sink（`memory_event` / `memory_cache` / `memory_trace` / INT `vector`）诚实不建 target。

### 3.1 面试轨道（INT-TRANSCRIPT，`purpose=interview_data_erasure`）

| sink | 物理面 | resolver / purge | 回执状态 | 说明 |
| --- | --- | --- | --- | --- |
| `checkpoint_rows` | LangGraph checkpoint 行/blob | 0048/0058 有 | 本地可 erased；公开入口 503 | 授权签发器未对公开 HTTP 接线 |
| `interview_job_payload` | `interview_job.payload` | 0058 有 | 同上 | 终态前仍可能含明文答案，见 `INT-P0-RAW-QUEUE` |
| `event` | `interview_event` | 0096 有，删后 read=0 | 面试 sweep 可 erased | 只删本面试 `stream_key` |
| `report` | `ai_report` 等 6 张投影表 | 0096 有，删后 read=0 | 面试 sweep 可 erased | 不含 B 端完整撤销 |
| `ai_graph_run` | `ai_graph_run`（`thread_id`=面试 id） | 0096 有，删后 read=0 | 面试 sweep 可 erased | 0059 已有写围栏 |
| `interview_answer_artifact` | 加密答案正文 | 0092 有 | 面试 sweep 可 erased | 真实用户写路径仍 disabled |
| `vector` | **无 interview 作用域键** | **不建 target** | 诚实拒删 | **不是** `vector_chunk` 删除。面试删除不得误删向量行 |
| `redis` / `oss` / `langfuse` | 外部 | 0058 落 `retention_pending` | `pending_external`，禁止伪 completed | 无异步确认执行器 |

### 3.2 记忆 / 账户轨道（MEM / CTX，`purpose=account_data_erasure`）

各 sweep 使用不同 `idempotency_key_hash` 命名空间，**一份 request completed 不等于账户删除完成**。

| sink | 物理面 | 谁枚举 | 回执状态 | 说明 |
| --- | --- | --- | --- | --- |
| `memory_fact` | `memory_fact` | `memory_begin_account_erasure`（0093） | 该 sweep 可 erased | 0093 只枚举 3 个可解析 MEM sink |
| `memory_embedding` | `memory_index_generation`（及 0107 控制面的 generation 子表） | 0093 / 0107 | 该 sweep 可 erased | **不**删除 `vector_chunk` |
| `memory_context_snapshot` | `memory_context_snapshot` | 0093 | 该 sweep 可 erased | 与 CTX 压缩 snapshot 不是同一张表 |
| `memory_summary` | `memory_summary` | `memory_summary_begin_erasure`（0112） | 该 sweep 可 erased | 独立账本 |
| `memory_vector_chunk` | `vector_chunk` 且 `kind='memory'` | `memory_vector_chunk_begin_erasure`（0124） | **本迭代闭合**：target + 写围栏 + 物理 DELETE + 残留=0 | 永不删 `kind='qbank'` |
| `memory_event` / `memory_cache` / `memory_trace` | 枚举占位 | 0093 **不建** target | 未知 locator，fail-closed | 不得伪装已删除 |
| `conversation_event` / `conversation_event_artifact` | 0108 事件源 | `conversation_event_begin_erasure`（0111） | 该 sweep 可 erased | 独立账本 |
| `context_compression_snapshot` / `context_compression_dispatch` | 0115 / 0117 | `context_compression_begin_erasure`（0118） | 该 sweep 可 erased | dispatch 无 fence 态，read=0 由 DELETE 承重 |

0107 `memory_deletion_target.sink` 仍是命令层 7 值 CHECK，**不含** `memory_vector_chunk`。控制面完成态不得被写成已覆盖向量块。

## 4. 相邻落点：已进回执 vs 仍未闭合

清单优先于“已经删干净”的表述。`kind='memory'` 向量块已有命名 sink；下列其余面仍无对应 `privacy_deletion_target` 回执或只有外部 pending。

### 4.1 已进账户回执（禁止误称）

| 落点 | 为何必须进回执 | 当前处理 | 禁止 |
| --- | --- | --- | --- |
| `vector_chunk` `kind='memory'` | owner 级用户向量，可召回正文 ref | **0124 已进账户回执**（`memory_vector_chunk`，见 §3.2 / §5） | 面试删除不得代删；不得称 MEM-00/0093 已覆盖；本 sweep `completed` ≠ 账户删除完成 |
| `vector_chunk` `kind='qbank'` | 共享题库，系统或题库控制面 owner | 合法拒删（RLS DELETE 要求 `kind='memory'`） | 不得当作用户删除成功 |

### 4.2 仍未闭合

| 落点 | 为何必须进回执 | 当前处理 | 禁止 |
| --- | --- | --- | --- |
| `user_memory` | 长期/情景记忆正文（`getMemoriesByRefIds` 按 `vector_chunk.ref_id` 回表） | **无 sink、无 purge** | 不得因向量块已删而声称记忆正文已删 |
| `ai_invocation_trace.output` | 模型输出 jsonb，可能含用户内容；无持久 interview 列 | 面试删除诚实不建 target；账户轨道亦无 sink | 不得伪删、不得标 completed |
| 备份 / PITR | 历史副本 | 无 target | 本地行删除 ≠ 备份消失 |
| Redis/Tair 热缓存 | 检索/会话缓存 | `retention_pending` | 无外部确认不得 completed |
| OSS/MinIO 原文 | 简历/录音对象 | `retention_pending` | 同上 |
| Langfuse / 供应商侧 | 观测与模型副本 | `retention_pending` | 同上 |
| `qbank_route_scope_negative_result` | owner 级路由负结果缓存；0113 声明 content-free、无 PII | 合法不建含用户内容的删除 sink | 不得借此宣称账户删除完成；也不得伪删 |

## 5. 本迭代闭合的围栏（不是完整删除）

`0124_memory_vector_chunk_erasure.sql` 只做一件可证明的事：让 `vector_chunk.kind='memory'` **必须**作为账户删除 target 出现，并在该 target 未 erased 或残留>0 时不能把“向量块已删”写成事实。

| 围栏 | 机制 | 负向验收 |
| --- | --- | --- |
| 枚举 | begin 固定插入 `sink='memory_vector_chunk'` | 0093 的 3-sink begin 仍不含此 sink；向量行仍在 |
| 写围栏 | `kind='memory'` 的 INSERT/UPDATE 在本 sink 账本处于 `fenced` / `purging` / `pending_external` / `completed` / `partial_failed` 时拒绝。0124 **无**撤销函数，故 `completed` 后对该 owner 的 memory 写入是永久拒绝。触发器不拦 DELETE：`app_role` 仍可能自删 memory 行，收据与真实删除者可能脱节（已知缺口）。Worker DELETE RLS 只要求 principal + `kind='memory'` + `privacy_target_id` 非空，**不**绑定 `lease_token`（弱于 0048 checkpoint） | 围栏后迟到 INSERT/UPDATE=0；`kind='qbank'` 仍可走题库控制面；不得把本围栏写成可撤销或 lease-bound 物理删 |
| 物理清除 | worker 仅 DELETE `owner=principal AND kind='memory'`，残留≠0 fail-closed | 跨 owner 行=原数；qbank 行=原数 |
| 公开入口 | 简历/面试 DELETE 保持 503 | 无新 request/target |
| 完成语义 | 本 sweep 的 request 可 `completed`；**不等于**账户删除完成 | `user_memory` / trace / 外部 sink 仍在清单缺口中 |

## 6. 维护规则

新增或改动含用户内容的表、embedding 缓存、transcript/checkpoint/trace、或 `privacy_deletion_target.sink` 时，必须在同一变更中：

1. 更新本文 §3/§4 的状态，而不是另写一份“已删除”声明；
2. 更新域侧 registry 与最新迁移 CHECK，并跑对应 pin 证明；
3. 公开删除入口保持 503，直到 §3 必收录执列与 §4.2 未闭合缺口都有真实组合根回执；
4. 保持 `releaseEvidence=false`，直到独立复审关闭登记册对应行。
