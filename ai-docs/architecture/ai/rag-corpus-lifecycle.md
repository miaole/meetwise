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

> **实现状态（2026-08-10，必须与代码一起读）**：0029 已把共享 qbank 从原地 `vector_chunk` 重嵌改为 generation（检索世代）构建/切换模型：`qbank_chunk`（受审核、可重建正文）→ `qbank_embedding_recipe`（model/revision/dim/chunker/normalization receipt）→ 每 generation 一个 `qbank_generation_chunk` 分区与 partial HNSW → `qbank_active_generation` 单行指针。0065 已把已发布题目工件和“任一映射块缺失即不返回整题”下推到数据库；0066 将写入、构建和切换权限移到独立控制执行器；0067 撤掉请求路径对原始题库表的读取，把活动世代元数据、检索和 evidence（证据）绑定为受限 SQL 函数；0068 对新写入补上 source/pool/chunk 的数据库 UTF-8（统一字符编码）正文摘要校验，将 pool/chunk 收紧为 append-only（仅追加）事实，并在**同一迁移提交**中把数据平面改为“正文摘要精确复核，不可证即零”的候选视图；因此 0068 已提交而 0069 尚未开始时，旧脏链也不会再进入 ANN（近似最近邻）/词法/evidence。0069 再扫描旧 INSERT-only（仅插入）触发器窗口，把无法证明的历史 source（来源）写入无正文 quarantine（隔离）账本并原子撤销。0070–0072 让 generation（检索世代）、题目工件写入和完整题目证据读取器的九个 `SECURITY DEFINER`（安全定义者）函数，在 FORCE RLS（强制行级安全）下拥有仅限七张控制关系的行可见性；worker（后台任务进程）在启用控制连接时还会拒绝函数/表 owner（所有者）不一致、可登录、可继承、超级用户、可绕过行级安全、缺失 `public` schema（模式）的 CREATE（创建）权限，或任何角色成员关系的部署形态。generation builder（构建器）不再依赖在低权限 owner 下为空的候选 view（视图），而是使用同一正文摘要 predicate（谓词）冻结 approved source/pool/chunk 事实；控制执行器不再拥有 pool/chunk 的 UPDATE（更新）/DELETE（删除）权限，表所有者形态的直接篡改仍会被触发器拒绝；内容改版只能走新 ref/source/generation。`pnpm rag-generation:prove`（28/28）覆盖新写入、20 路并发和篡改，`pnpm qbank-integrity-upgrade:prove`（18/18）从真实 0067 前缀分别提交 0068、0069、0070、0071、0072，并以无超级权限、不可绕过行级安全的函数/表所有者执行完整 `building → validated → active`、低权限完整题目证据包读取、真实 worker（后台任务进程）构建 catch（捕获）失败和不完整构建的 `building → failed`，覆盖全部 7 类历史完整性原因码；低权限越权和 owner（所有者）目录反证使用 `pnpm qbank-control-role:prove`（8/8）。所有回执均非云发布证据，不能据此声称真实云数据已扫描或发布完成。
> - ✅ **当前可运行**：新 recipe 只写未激活分区；完整行数与 `qbank_corpus_epoch` 一致后才原子翻 active 指针；回滚只是翻回 retired generation，且仅当正文语料 epoch 未变。query recipe 不匹配、active generation 缺失、向量非 512 维均 fail closed，worker 将本地 RAG 交给既有 CRAG 降级，不比较旧空间。
> - ✅ **当前可运行**：approved source 的撤销会在所有 retained generation 把 `visible=false`，ANN 由 `visible` partial HNSW 候选池取过采样候选、再与 approved candidate 二次求交；pending proposal 不再递增全局 cache epoch。生成过程逐条写入不会制造 epoch storm；active flip/revoke 各自只失效一次。
> - ✅ **当前可运行**：active qbank 默认使用 dense（稠密向量）检索；仅在显式 `RAG_QBANK_RETRIEVAL_MODE=rrf`（倒数排名融合）时加入受治理词法候选。RRF 只决定排序，返回的信号仍是实际 cosine distance（余弦距离），绝不把倒数秩伪装成模型置信度。
> - ✅ **当前可运行**：cache 命中后不会把 `ref_id` 当作“接地内容”塞进模型；它会再以 active generation、`visible` 和 approved source 取回每条最多 600 字符的 evidence excerpt。撤销在排序与 evidence 两处复核；excerpt 始终包入 `UNTRUSTED_RAG_EVIDENCE` 数据围栏，不能获得 system/tool 权限。
> - 🟠 **toy 种子，非策展语料**：当前 qbank 仍只是 **~33 条自撰种子题**（`apps/worker/src/qbank-seed.ts`），不是大型真实语料；后文的多租户文档、擦除 SLA、影子量化 gate 仍是目标态，不能据此宣称运营能力。
> - 🟡 **控制面身份已做本地隔离验证**：0066/0067 引入独立 `qbank_control_executor`（题库控制执行器）数据库角色、成员关系白名单和活动世代受限读接口；request runtime（请求运行时）即使伪造 `app.principal_user`（应用主体会话变量）也不能写入或读取来源、原文、recipe（检索配方）、generation（检索世代）和题目映射，误挂 runtime（运行时）、管理员或带残留角色成员关系的连接都会在 worker（后台任务进程）启动时拒绝。0070–0072 还要求 generation（检索世代）与题目工件的八个写入函数、一个完整题目证据读取器和七张控制关系由同一个无登录、无成员、非超级用户、不可绕过行级安全的 owner（所有者）持有；启动还要求该 owner 持有建立 generation 分区所需的 `public` schema（模式）USAGE（使用）与 CREATE（创建）权限。这是对受 provision（配置）的应用登录的边界，不把 PostgreSQL 管理员或对象所有者误写成普通业务角色。`pnpm qbank-control-role:prove` 的 8/8 回执仍是 `releaseEvidence=false`；真实云密钥挂载、审核员后台、工单与人工运营闭环尚未实现，不能称生产审核能力。
> - 🟡 **通用版本控制面身份隔离已在本地验证，发布仍阻断**：0073 将 0032 的可伪造 `app.principal_user='__system_rag__'`（应用主体会话变量）控制授权切换为 provisioned control login（配置生成的控制登录）→ `rag_control_executor`（控制执行器）→ 双 security definer（安全定义者），并隔离旧 `rag_vector_*` 物理表与 global（全局）来源；0074 令 rebuild lease 只接受成功 `rebuild_create` request 关联的 run；0079 收紧 `rag_control` schema 与控制函数的直接 ACL allowlist，0080 则同时收回已知错误的 executor 成员资格，并以完整成员闭包阻断 gateway/privacy/qbank 或任意非 control login 的 `SET ROLE` 越权；0081 将同一 dispatch request 的并发恢复收敛为一个可外发 winner 和只读 follower，禁止第二次 provider send。`pnpm rag-control-role:prove`（19/19）、`pnpm rag-control-upgrade:prove`（4/4）、`pnpm rag-control-dispatch:prove`（6/6）和 `pnpm rag-corpus-version:prove`（20/20）仅证明当前工作树的隔离 PostgreSQL（关系型数据库）合同，所有回执均 `release_evidence=false`。真实 embedding（向量嵌入）worker/outbox（外发箱）、失败 receipt（失败回执）、审批/eval（评测）receipt、全格式摄取、云身份与故障演练仍未实现或未验证，不能称通用全格式 RAG 已可发布。
> - 🟡 **已实现但尚未接到候选人/B 端请求热路径**：通用 query binding 可按稳定 key 固定到 active/canary generation，并提供受绑定授权的 search/evidence/citation API；现有面试图仍只消费 qbank RAG。因此它是可证明的控制面，不是已完成的全格式线上 serving。
> - ⬜ **仍未建**：真实全格式 parser/OCR/ASR 入库 worker、组织级 tenant/org ACL、生产 query router 对 binding 的接线、生产语料 shadow/canary 指标采集、自动 orphan 回收/退役、对象存储擦除执行器。不能把 3-chunk proof 或 ~33 条 qbank 种子扩大为运营规模、真实 Recall/P95/HA 结论。

## 0.0 0032/0073–0074/0079–0081 通用控制面：实际数据库契约与发布边界

0029 是共享题库专用 generation；0032 不取代它，而是给 PDF、Excel、PPT、图文、音视频等全格式语料提供可复建的版本控制底座。实际表名带 `rag_` 前缀，避免与既有题库和业务对象混淆：

| 版本层 | 实现表/函数 | 不变量 |
| --- | --- | --- |
| 事实与内容 | `rag_corpus_document` → `rag_corpus_content_version` → `rag_corpus_chunk` | 文本、解析 recipe、清洗 recipe、chunk recipe 和 locator 写入后不可改；更新只新增版本。 |
| 向量空间 | `rag_embedding_recipe` → `rag_embedding_generation` → 每 generation 一个 `rag_vector_*` 物理表 | recipe 记录 provider/model/revision/dimension/transform manifest；同 generation 不混维度、不原地重嵌。 |
| 构建快照 | `rag_generation_member`、`rag_corpus_epoch`、`rag_validate_generation` | 构建开始冻结 chunk 清单和 epoch；行数、源状态或 epoch 有一项变化即拒绝进入 shadow。 |
| 发布 | `rag_release_policy`、`rag_shadow_evaluation`、`rag_generation_rollout`、`rag_promote_generation` | 评测未通过不能 gated；灰度只能 `1→10→50→100`；只有 `100%` 且 active pointer CAS 成功才切流。 |
| 读取与引用 | `rag_query_binding`、`rag_search_bound`、`rag_evidence_bound`、`rag_citation` | 会话绑定包含 generation/recipe；检索和 evidence 再做 owner/global 授权；citation 固定 content version、hash、locator。 |
| 删除 | `rag_corpus_tombstone`、`rag_runtime.rag_tombstone_private_document` | delete/erasure 遍历所有 retained physical generations 删除向量，并将关联 citation 标为 `invalidated`；新 generation 写入前检查 tombstone。 |

控制面现有的可证明状态机是：

```text
content: active → superseded → tombstoned → purged
generation: building → shadow → gated → active → deprecated → retired
                              └────────────→ failed / aborted
rebuild run: pending → running ↔ paused → succeeded / failed / orphaned / aborted
binding: active → expired / revoked
```

**冻结与新会话的不同语义**：已创建的 `rag_query_binding` 可继续读其 retained `deprecated` generation，以避免同一会话在迁移中换检索空间；文档内容 epoch 改变后，新的 binding 会 fail closed，直到新 generation 通过发布门。这是临时的“正确性优先于可用性”策略，必须由后续在线双写/增量回填替换，不能长期拿作可用性承诺。

**灰度的诚实边界**：控制面能以 stable key 决定 active 或 gated candidate 并永久记录 binding；只有应用查询入口调用 `bindRagQuery`，该灰度才是实际流量灰度。当前入口尚未接线，故 `1/10/50/100` 仅是经过状态机验证的发布控制，不是用户流量比例证据。

**权限边界**：当前真实 principal 模型是 `private + global`；私有 runtime（运行时）函数仅将 `app.principal_user` 用作 private 行路由，不能进入控制面。0073 后只有 provisioned control login（配置生成的控制登录）可 `SET LOCAL ROLE rag_control_executor`，再调用由 `rag_control_definer`（控制安全定义者）拥有的固定函数来建 recipe/generation、写 global corpus 与推进发布；0074 进一步拒绝没有成功 control request 的 rebuild claim/heartbeat。组织级 `org/shared` 必须先接入现有 B 端组织授权模型，再允许 schema/策略扩展；不得用字符串约定伪造 org 隔离。

## 0. qbank 当前代际契约、上线禁令与遗留数据处理

`vector_chunk` 仍服务于私有 memory 和**只为未应用 0029 的兼容测试库**保留的旧 qbank 路径；production migration 存在后，qbank 检索只读 active generation。`qbankEmbeddingRecipe()` 的 receipt 覆盖 provider、model、显式 provider revision、512 dimension、NFC/trim 规则、document/query prefix 和 chunker version。`RAG_REQUIRE_EMBED_REVISION=1` 时缺少 `EMBED_MODEL_REVISION` 拒绝启动；未开启时会登记为 `unverified`，不是假装 provider 浮动模型可复现。

**硬边界**：当前 physical schema 是 `vector(512)`。任何其它维度在 builder 入口直接拒绝；不允许截断、补零或与 512 混表。真正换维度必须先交付新的受控物理 schema/migration、全量重建、shadow gate 与回滚方案。

**遗留向量禁令**：以前只保存 `ref_id + hash + vector` 的可见 qbank 无法从 hash 安全重建。worker 会枚举缺 `qbank_chunk` 正文事实的 legacy ref；非零即**阻止 activation 并使本地 RAG fail closed**，保留旧行供审计，要求运营重新提供、审核并导入原始事实。绝不为了“保持有结果”以错误模型/猜测文本重嵌。

**发布不变量（可自动证明）**：任意一次读只会命中一个 active generation；G2 写入期间 G1 不变；未 validated 的 generation 不能 active；recipe mismatch 返回确定性错误；撤销后的 ref 不从 ANN、RRF、二次距离查或 epoch-matched cache 返回；pending-source flood 不增加 epoch；active flip 或 revoke 各只增加一次 cache epoch。见 `apps/worker/test/qbank-generation.proof.ts`。

**尚未自动证明的规模承诺**：该 proof 是 3 chunk 的状态机/安全性证明，不能给出 100k 文档下的 Recall、P95、索引大小或 HA 数字。当前 `apps/worker/smoke/rag-adversarial-pg-eval.ts` 的 24-chunk 发布夹具实际计划为 `uses HNSW=no`；它证明不能把“建了索引”说成“生产查询走 HNSW”。新 partial-HNSW query 必须以 production-sized、脱敏标注语料执行 `EXPLAIN (ANALYZE, BUFFERS)` 和 brute-force 对照后才可给性能发布门。

## 0. 双指针模型与边界

### 0.1 两个正交的指针维度（最易混淆处）

「全局代际指针」与「文档级内容版本指针」是两套正交指针，**`corpus_document` 上不冗余任何代际列**（冗余即不一致源）：

| 维度 | 载体 | 谁翻 | 粒度 | 触发 |
|---|---|---|---|---|
| **全局代际指针** | `rag_active_generation` 单行 | 平台编排 | 原子翻一行 | 换 embedding 模型（蓝绿） |
| **文档内容版本指针** | `rag_corpus_document.current_content_version` | 业务写路径 | 按文档翻一行 | 内容更新（简历/JD 改动） |

检索读路径解析 = **「全局活跃代际」选物理表/索引/模型空间** ∩ **各文档 `current_content_version` 生效的 chunk**。两维从不互相赋值；换模型时**绝不** UPDATE 千万行文档（全局 cutover 落到 document 行不可能原子）。

### 0.2 与 agent 迁移文档的边界

摄取/回填是 **worker 纯任务编排，不是第 5 张 LangGraph 图**（编排图只有 resume-quiz/mock-interview/career-path/report 四张，不扩）。面试会话的「代际冻结」是 mock-interview 的 graph state 字段（§9），但语料生命周期本身归 worker。`runtime-migration.md` 负责 agent 行为/提示词/工具版本迁移；本文只在「会话代际冻结」这一接缝给契约，两份不重复。

## 1. 数据模型

### 1.1 `corpus_document`【地基】
`doc_id` PK、`tenant_id`（global 用 sentinel）、`principal_type`/`principal_id`、`visibility`(private/org/shared/global)、`org_id`、`source_kind`(resume/jd/knowledge/manual)、`current_content_version`、`doc_content_hash`（对账锚点）、`status`(draft/active/updating/soft_deleted/hard_deleted)、`row_version`（乐观锁 CAS）、`retained_until`。**不存任何 active_index_generation。**

### 1.2 `corpus_chunk`【地基】
`chunk_id` PK、`doc_id`、`tenant_id`、`visibility`（冗余下推便于向量表 RLS）、`ordinal`、`content_hash`（差量复用键）、`content_version`（单调递增，CAS 仲裁）、`chunker_recipe_version`（分隔符、窗口、overlap、清洗/语言策略的不可变 manifest hash）、`status`(building/active/superseded/tombstoned/purged)、`superseded_by`、`row_version`。唯一约束 `(doc_id, ordinal, content_version)`。

### 1.3 `embedding_generation`（代际元数据）【规模化】
`generation_id` PK、`embedding_recipe_version`（provider、model snapshot、dimension、normalization、tokenizer、query/document transform 的不可变 manifest hash；一个代际=一个向量空间）、`dim`（随代际固定）、`space_kind`(default/pii_domestic)、`physical_table`(`corpus_vector_g{N}`)、`state`(building/backfilling/shadow/gated/active/deprecated/retired/aborted)。只记录 `embedding_model_version` 不够：相同模型名配不同清洗、归一化或 tokenization 仍是不可比较的空间。

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
`ingest_task`（heartbeat+孤儿回收，幂等）、`rag_citation`（绑不可变 `(doc_id,content_version,chunk_id,snapshot_hash)`）、`corpus_outbox`（事务性发件箱）、`erasure_request`（被遗忘权工单）、`embedding_compute_cache`（只复用**计算结果数值**，不保存向量行或授权；identity=`data_class/region/visibility scope + exact embedding recipe digest + SHA-256(actual canonical provider-input bytes)`，Redis value 还带 schema/dimension/checksum/HMAC；`generation_id` 绝不属于 cache identity）、`embedding_fill_intent`（claim/dispatching/succeeded/succeeded_uncached/unknown 的费用与派发事实）、`shadow_eval`/`golden_set`【规模化】。

## 2. 摄取与差量复用【地基】

流程：解析 → 分块 → 用唯一 canonicalizer 生成实际 provider-input bytes → 算完整 input digest/recipe digest → 查并验证 `embedding_compute_cache`（命中复用数值、跳过重算）→ 未命中先写 `embedding_fill_intent`/成本预留再调境内 embedding → 校验并写 cache 或 `succeeded_uncached` → 写 `corpus_vector_g{active}`（按 chunk 各插行）→ 同事务写 `corpus_outbox`。

**复用的是向量数值，不是向量行**：幂等键 `(chunk_id, generation_id)` 每租户各一行带各自归属；cache 命中只跳过重复**计算**，不跳过 RLS、visibility、content version、tombstone、generation 或 evidence 验证。跨租户复用不是默认能力：只有 data class、region、visibility、consent/egress policy 与删除合同明确允许时，才可复用同一无主浮点数；首个 QBank 切片只限 global approved scope。任何 Redis/cache HMAC、recipe、dimension 或 input digest 不符均是污染而非 miss；provider 已派发后的 unknown/succeeded_uncached 不能自动再次收费。复用率可观测，是成本叙事核心指标。

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
