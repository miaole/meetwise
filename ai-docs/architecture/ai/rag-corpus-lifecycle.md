---
id: architecture_ai_rag_corpus_lifecycle
name: RAG 物料更新与语料生命周期方案
description: 语料写入/更新/删除/被遗忘权、向量作为可重建派生物的生命周期、换 embedding 模型的代际蓝绿迁移、检索隔离与过滤式 ANN、双指针一致性模型与失败模式。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./runtime-migration.md
  - ../backend/rls-isolation.md
  - ../../rules/global/production-invariants.md
---

# RAG 物料更新与语料生命周期方案

> 总纲：**事实源 = Postgres，向量 = 派生物。** 任何「只活在向量库、丢了找不回」的状态都判定为设计缺陷。向量库可在任意时刻从 Postgres 全量重建，重建是常规操作而非灾难恢复。
> 阅读标注：【地基】= demo/骨架期即需；【规模化】= 多代际/多租户规模后才启用，demo 期可空载但 schema 预留。

> **实现状态（对齐代码，勿把 schema 蓝图当已运营的语料库）**：本文是语料生命周期的**目标设计**，主体多为【规模化】阶段（多代际蓝绿迁移、影子比对、被遗忘权 SLA 编排等**均未实例化**）。代码现状：
> - ✅ **已接线运行**：单代际 pgvector 检索 + RLS 隔离 + embedder 缓存；面试图 CRAG 自纠检索（本地 ANN 召回 fail-soft）。
> - 🟠 **toy 种子，非策展语料**：当前 qbank 只是 **~33 条自撰种子题**（`worker/qbank-seed.ts`，开机 `ingestQbank` 灌入），**不是大规模真实策展题库**——本文的「差量复用/被遗忘权/代际迁移」是这套语料真正运营后才生效的目标，勿据此宣称已有大型真实题库。
> - 🟢 **默认开启**：web 探索抓取（§ CRAG fallback 提及的 `webExplore`，SSRF 安全 fetch）`DEFAULT_WEB_ALLOWLIST` 含 6 个官方文档源作外呼；env `WEB_ALLOWLIST` 显式空串才关（只用本地题库）。未建的是策展题库源表 + 审核门。
> - ⬜ **未建**：多代际 `embedding_generation`/`rag_active_generation`/`rebuild_run`/蓝绿迁移/影子池/被遗忘权执行器等【规模化】表与编排。按 §11 分阶段落地。

## 0. 双指针模型与边界

### 0.1 两个正交的指针维度（最易混淆处）

「全局代际指针」与「文档级内容版本指针」是两套正交指针，**`corpus_document` 上不冗余任何代际列**（冗余即不一致源）：

| 维度 | 载体 | 谁翻 | 粒度 | 触发 |
|---|---|---|---|---|
| **全局代际指针** | `rag_active_generation` 单行 | 平台编排 | 原子翻一行 | 换 embedding 模型（蓝绿） |
| **文档内容版本指针** | `corpus_document.current_content_version` | 业务写路径 | 按文档翻一行 | 内容更新（简历/JD 改动） |

检索读路径解析 = **「全局活跃代际」选物理表/索引/模型空间** ∩ **各文档 `current_content_version` 生效的 chunk**。两维从不互相赋值；换模型时**绝不** UPDATE 千万行文档（全局 cutover 落到 document 行不可能原子）。

### 0.2 与 agent 迁移文档的边界

摄取/回填是 **worker 纯任务编排，不是第 5 张 LangGraph 图**（编排图只有 resume-quiz/mock-interview/career-path/report 四张，不扩）。面试会话的「代际冻结」是 mock-interview 的 graph state 字段（§9），但语料生命周期本身归 worker。`runtime-migration.md` 负责 agent 行为/提示词/工具版本迁移；本文只在「会话代际冻结」这一接缝给契约，两份不重复。

## 1. 数据模型

### 1.1 `corpus_document`【地基】
`doc_id` PK、`tenant_id`（global 用 sentinel）、`principal_type`/`principal_id`、`visibility`(private/org/shared/global)、`org_id`、`source_kind`(resume/jd/knowledge/manual)、`current_content_version`、`doc_content_hash`（对账锚点）、`status`(draft/active/updating/soft_deleted/hard_deleted)、`row_version`（乐观锁 CAS）、`retained_until`。**不存任何 active_index_generation。**

### 1.2 `corpus_chunk`【地基】
`chunk_id` PK、`doc_id`、`tenant_id`、`visibility`（冗余下推便于向量表 RLS）、`ordinal`、`content_hash`（差量复用键）、`content_version`（单调递增，CAS 仲裁）、`status`(building/active/superseded/tombstoned/purged)、`superseded_by`、`row_version`。唯一约束 `(doc_id, ordinal, content_version)`。

### 1.3 `embedding_generation`（代际元数据）【规模化】
`generation_id` PK、`embedding_model_version`（一个代际=一个向量空间）、`dim`（随代际固定）、`space_kind`(default/pii_domestic)、`physical_table`(`corpus_vector_g{N}`)、`state`(building/backfilling/shadow/gated/active/deprecated/retired/aborted)。

### 1.4 `corpus_vector_g{N}`（逻辑模板，按代际物理分表）【地基:单代际/规模化:多代际】
每代际一张物理表，维度建表时固定，**声明式 hash 分区 by tenant**。列含 `chunk_id`、`doc_id`、`tenant_id`、`principal_*`、`visibility`、`org_id`、`embedding vector(<dim>)`、`source_content_version`（回填 CAS 仲裁键）、`generation_id`（字面量 N）。主键 `(chunk_id, generation_id)`（幂等唯一键）。

**索引要点**：部分索引谓词是建索引时的**字面量**，不能用运行期 `:active`。每代际分区表各自建固定字面量 HNSW（按 visibility 子索引）；「活跃代际」在**查询路由层选表**时解析，绝不进 SQL 动态谓词。

### 1.5 `rag_active_generation`（全局单行指针）【规模化】
单行约束。`active_generation_id`、`pii_active_generation_id`（PII 兜底空间活跃代际）、`switched_at`、`row_version`。换模型 = 原子翻这一行（一次 UPDATE + CAS），绝不半旧半新。

### 1.6 `corpus_tombstone`（共享、代际感知）【地基】
`chunk_id` PK、`doc_id`、`tenant_id`、`reason`(delete/erasure/supersede)、`priority`(erasure=100/delete=50/supersede=10)、`content_version`、`applies_to_generations`(默认 ALL)。**所有写向量的路径（在线双写、回填、shadow 建表）落库前必须先查 tombstone，命中即跳过/删除，不得复活。** erasure 最高优先级，阻断一切回填。

### 1.7 `rebuild_run`（迁移编排，带租约）【规模化】
`run_id`、`target_generation_id`、`status`(pending/running/paused/succeeded/aborted/orphaned)、`lease_owner`/`lease_expires_at`/`heartbeat_at`（孤儿检测）、`deadline_at`（SLA）、`pause_budget_sec`/`paused_total_sec`、`cursor`（断点续作）、`row_version`。

### 1.8 其余地基表
`ingest_task`（heartbeat+孤儿回收，幂等）、`rag_citation`（绑不可变 `(doc_id,content_version,chunk_id,snapshot_hash)`）、`corpus_outbox`（事务性发件箱）、`erasure_request`（被遗忘权工单）、`embedding_cache(content_hash,model_version,generation_id,embedding)`（跨租户共享的**计算结果**缓存，数值非行）、`shadow_eval`/`golden_set`【规模化】。

## 2. 摄取与差量复用【地基】

流程：解析 → 分块 → 算 `content_hash` → 查 `embedding_cache`（命中复用数值、跳过重算）→ 未命中调境内 embedding → 写 `corpus_vector_g{active}`（按 chunk 各插行）→ 同事务写 `corpus_outbox`。

**复用的是向量数值，不是向量行**：幂等键 `(chunk_id, generation_id)` 每租户各一行带各自归属；`content_hash` 仅用于命中 cache 跳过重复**计算**（A、B 租户相同 JD 套话复用同段数值，但各写各的 vector 行）。跨租户共享的只有「无主的浮点数组」，归属永远落在各自 vector 行——隔离不破。复用率可观测，是成本叙事核心指标。

## 3. 内容更新（文档版本维度）【地基】

更新 = 翻**文档内容版本指针**，不碰全局代际。一个事务内：新内容 chunk 写入(`status=building`) → `content_version+1`、chunk 同步 → `document.current_content_version` CAS 自增 → 旧 chunk 置 `superseded` 并写 `tombstone(reason=supersede)` → 新向量写活跃代际表 → 同事务写 outbox。旧向量 **24h** 后清理任务物删（保留窗用于在途检索/会话）。

**citation 不断链、不静默改写**：`rag_citation` 绑不可变快照，呈现「基于历史版本 vX」；旧 chunk/向量保留至「无 citation 引用且超 24h」才物删。grounding 完整性无缺口。

## 4. 删除与被遗忘权（代际感知）【地基】

软删 → 保留期 → 硬删：`status=soft_deleted` 设 `retained_until`，保留期内可恢复；到期硬删 → 向量物删 → 写擦除证明（仅留 hash）→ 残留断言=0；citation 标 `invalidated`（保留快照作审计）。

**被遗忘权 72h SLA（代际感知）**：迁移期同时存在 active/building/shadow/deprecated 多代际表 + 在途回填，单线擦除保不了 72h。协议：①`erasure_request` 落库 → 写 `tombstone(reason=erasure, priority=100, applies_to_generations=ALL)`；②擦除执行器遍历 `embedding_generation` 全表，对每个代际物理表删该 principal 全部向量+chunk+S3 原件+cache+citation；③**阻断在途回填**：回填消费者每批落库前强制查 tombstone，命中 erasure 即跳过——根除「回填把已擦除数据重新嵌进新代际」的复活路径（PIPL 违约级事故）；④终态校验所有代际残留=0 → `certified` 留 hash；⑤72h 内 certified，超时告警升级。状态机 `requested→propagating→verified→certified`（失败→`failed` 人工介入）。

## 5. 换 embedding 模型：代际蓝绿迁移

总路径（可辩护的唯一解）：**并行建第二套 → 全量回填 → 影子比对 → 闸门 → 翻指针 → 观察期 → 退役**。回滚 = 翻指针，不重建。

**5.2 双写+回填的定序仲裁（核心致命修复）**：经典竞态——回填读旧内容算新向量期间，在线把 chunk 更新/删除，回填后到覆盖回旧值/已删向量（silent corruption + 复活）。规则：**在线写永远赢，回填不得覆盖更新值**。G2 写入带 `source_content_version`，CAS 落库：

```sql
INSERT INTO corpus_vector_g{N+1}(chunk_id,generation_id,embedding,source_content_version,...)
VALUES (:cid, N+1, :emb, :ver_at_read, ...)
ON CONFLICT (chunk_id, generation_id) DO UPDATE
  SET embedding=EXCLUDED.embedding, source_content_version=EXCLUDED.source_content_version
  WHERE EXCLUDED.source_content_version > corpus_vector_g{N+1}.source_content_version;
```

回填落库前两道闸：①重读 chunk 状态，`superseded/tombstoned/purged` → 跳过（算向量期间可能已变，落库前再查一次收窄窗口）；②查 tombstone，命中 delete/erasure → 跳过，绝不复活。

**5.3 影子比对走独立池**（不打在线池，消除与背压自相矛盾），采样比对 G1/G2 在 golden_set 上的 recall@k 与排序一致性。

**5.4 闸门→翻指针→观察→退役**：三项 gate（recall@k 降幅/P95 延迟/成本）通过 → `gated`；**原子翻 `rag_active_generation` 一行**；G1 置 `deprecated` 保留 ≥ 最长会话寿命 + buffer（默认 7 天，保在途会话与回滚）；观察期过且无在途引用 → `retired` drop 表。

**5.5 SLA/背压/退出**：`rebuild_run` 租约+心跳+孤儿回收（`lease_expires_at<now()`→`orphaned`，据 cursor 续作，worker 全挂可接管）；在线 P95 超阈 → `paused`+降速，但有 `pause_budget_sec`，超预算或超 deadline → 告警升级人工决策；显式退出：放弃 → `aborted` + 停双写 + drop G2，全局指针不变（避免双写常驻、观察期永不开始）。

**5.6 成本测算**：`机时 = chunk 总数 × 平均 token/chunk ÷ 模型吞吐 ÷ 并发 worker`。canary 分阶段 1%→10%→50%→100%，每阶段过三 gate 才放量。文档给方法不写占位默认值。

## 6. 检索隔离与过滤式 ANN

**6.1 RLS 完整版（致命 bug 修复）**：原策略 `tenant_id = current_setting('app.tenant_id')` 会把 global 语料全过滤掉。global 行用固定 **sentinel tenant UUID**（全零）承载 `NOT NULL`。策略显式带 global 分支：

```sql
CREATE POLICY corpus_vector_read ON corpus_vector_g{N} USING (
  visibility='global'
  OR (tenant_id = current_setting('app.tenant_id')::uuid AND (
       visibility='shared'
    OR (visibility='org'     AND org_id     = current_setting('app.org_id')::uuid)
    OR (visibility='private' AND principal_type='user'
                             AND principal_id = current_setting('app.user_id')::uuid)))
);
-- WITH CHECK 镜像同一谓词，禁止跨租户/越权 visibility 写入
```

隔离纵深：RLS + 应用强制谓词双层 + CI 越权探针（断言越权召回=0）+ 事后断言。越权即告警。与 `rls-isolation.md` 的全局机制一致。

**6.2 过滤式 ANN 召回坍塌的真实方案**：pgvector HNSW 对 `WHERE tenant/visibility` 是图遍历后过滤（post-filter），高选择性下召回坍塌/为凑 k 过度遍历致延迟爆炸。方案：①物理分层——private/org/shared 按 tenant 声明式 hash 分区各自独立 HNSW，global 单独表+独立 HNSW；②**检索=双路 ANN+应用层归并**（当前租户私有分区 top-k 与 global 表 top-k 分别 ANN 再 rerank，各自过滤选择性都不高，HNSW 不坍塌）；③per-visibility 固定字面量 partial index；④代际选表在路由层（"active" 不进 SQL 谓词）；⑤索引膨胀 ≈ `行数 × dim × 4B × ~1.5`，线性增长，分区数与单分区召回质量需实测权衡。

**6.3 PII 境内模型与代际单模型的裁决**：主方案——境内模型是**默认 embedding 模型的境内合规部署**（同架构同向量空间，仅部署境内、数据不出境），是合规问题非空间问题，PII 与非 PII 同代际同空间可比。合规兜底——若厂商无法保证同空间，PII 语料属独立代际/独立物理空间(`space_kind=pii_domestic`)，永不与非 PII 同 ANN 检索，检索层按敏感级路由。原则：**一个代际 = 一个向量空间**。

**6.4 事后断言失败的正确反应**：**不冻结整代际分片**（那是自伤式全站宕机、可被 DoS）。单次断言失败 → 丢弃该结果 + 拒响应该次检索 + 告警 + 记录；仅连续/批量失败超阈值才人工介入。

## 7. 一致性：事务性发件箱

同事务写 outbox + 至少一次投递 + 幂等消费 + 每日对账。**不靠开发者自律**：`corpus_chunk`/`corpus_document` 上 AFTER INSERT/UPDATE/DELETE **DB 触发器**自动写 outbox，或逻辑解码 CDC 兜底——新增写路径忘写 outbox 也不漏。每日对账重算 `doc_content_hash` 比对向量库 vs 事实源，作事后补偿兜底（重解析成本高，非主防线）。

## 8. 读路径代际解析

```
resolve_read(query, ctx):
  gen = ctx.frozen_generation_id or rag_active_generation.active   # 会话内冻结优先
  table = embedding_generation[gen].physical_table
  对「当前租户私有分区」与「global 表」分别 ANN top-k → 应用层归并 rerank
  仅返回各文档 current_content_version 生效、且 RLS 谓词通过的 chunk
```

## 9. 会话代际冻结（与 mock-interview 的接缝）

mock-interview 会话启动时把当前 `rag_active_generation` 快照进 graph state 的 `frozen_generation_id`；整场面试的检索都用冻结代际。这样会话进行中发生 embedding 蓝绿迁移**不会改变候选人的检索空间**（同一把尺子，与 `runtime-migration.md` 的 pin 同精神）。被弃代际 G1 必须保留 ≥ 最长会话寿命 + buffer（§5.4 的 7 天），保证在途会话仍可读。

## 10. 失败模式表

| 失败 | 检测 | 处置 |
|---|---|---|
| 回填覆盖在线更新值 / 复活已删 | `source_content_version` CAS + 落库前两道闸 | 在线写永远赢；命中 tombstone 跳过 |
| 回填把已擦除数据嵌进新代际 | 回填每批查 erasure tombstone | 跳过；根除复活路径 |
| 过滤式 ANN 召回坍塌 | recall@k 实测 | 物理分区 + 双路 ANN 归并 |
| RLS 把 global 语料过滤掉 | 越权探针 + global 召回回归 | 策略显式 global 分支 + sentinel tenant |
| PII 与非 PII 混检 | 路由层敏感级判定 | 同空间合规部署，或独立 pii 代际隔离检索 |
| 事后断言失败 | 单次比对失败 | 丢结果+拒响应+告警；不冻结分片 |
| outbox 写遗漏 | DB 触发器/CDC + 每日对账 | 机制强制，非自律 |
| `rebuild_run` 孤儿（worker 死） | 租约过期 | `orphaned` + cursor 续作 |
| citation 指向已改/已删 chunk | 不可变快照绑定 | 呈现历史版本；保留至无引用+24h |
| 代际 cutover 非原子 | 全局单行指针 | 一次 CAS 翻一行，绝不半旧半新 |

## 11. 分阶段落地

- **Phase 0（地基）**：单代际 `corpus_vector_g1` + document/chunk 版本指针 + tombstone + RLS（含 global 分支）+ outbox 触发器 + 软删/硬删/被遗忘权。够支撑单代际下的摄取/更新/删除/隔离检索。
- **Phase 1**：双路 ANN 归并 + per-visibility 子索引 + 差量复用 cache + citation 快照。
- **Phase 2（规模化）**：多代际 + 蓝绿迁移（rebuild_run/shadow/gate/翻指针）+ 影子比对独立池 + 背压。

每阶段 DoD：可演示、隔离越权=0 进 CI、向量可从 Postgres 全量重建冒烟。
