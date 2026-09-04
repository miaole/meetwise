---
id: uc_rag_funnel_intent_routing
name: 题库 metadata 与岗位意图漏斗路由
description: 将后端、前端、测试、AI 等题库在摄取时切为受控层级 metadata；岗位意图分类器自动决定已有叶节点，Worker 只在冻结范围内检索，且仅在该范围确认无合格题时受控地由 LLM 生成一题。
type: requirement
scope: shared
level: must
status: blocked
owner: architecture
related:
  - ../../architecture/ai/rag-funnel-routing.md
  - ../../architecture/ai/classifier-router-tier.md
  - ../../architecture/current-runtime-truth.md
  - ./interview-question-bank-agent-rag.md
  - ./model-operation-routing.md
  - ../../delivery/production-readiness-remediation-register.md
---

# 题库 metadata 与岗位意图漏斗路由

> **当前事实：** 生产 Worker 以固定“技术岗”启动自适应面试；岗位的 `title`、`description`、`competencies` 没有自动分类决策，启动事务没有 route snapshot，图内能力规划也没有题域约束。`0086/0087` 已在摄取控制面写入 v1 taxonomy 与受控 executor metadata receipt，但它不是可核验的人工 `MetadataReviewReceipt`，也未进入 generation、检索 SQL、缓存或 evidence 的 scope 条件。当前的 generic retrieve-and-generate 会把局部未命中混同于 Web fallback 或普通模型出题，既无 bucket 约束，也没有 `qbank_miss` provenance、rubric 或评分隔离。因此当前不能宣称“岗位自动识别题域、各题域不交叉、桶内无题时安全生成”的出题已经实现。

> **本需求的方向：** metadata-first；job-classifier-driven。题库先在摄取/切块时形成可信的可检索叶节点范围，岗位意图分类器再从这些已有范围中自动决定桶。招聘方不手选桶；分类失败只要求补充岗位信息，不能退为全库检索。

## 1. 受控 taxonomy 与领域对象

### 1.1 初始层级 metadata

| 可分配叶节点 `trackId` | 题目范围 | 明确不包含 |
| --- | --- | --- |
| `backend/nodejs` | Node.js 运行时、服务端框架、异步/性能、依赖治理 | Java、Go、Python 语言实现细节；页面和浏览器问题 |
| `backend/java` | Java/JVM、服务端框架、并发、构建与性能 | Node.js、Go、Python 语言实现细节 |
| `backend/go` | Go runtime、并发、服务端、模块与性能 | Node.js、Java、Python 语言实现细节 |
| `backend/python` | Python runtime、服务端、并发、打包与性能 | Node.js、Java、Go 语言实现细节 |
| `backend/general` | 明确审核为语言无关的 API、数据库、分布式、缓存、消息与可观测性题 | 任何实际绑定某语言/框架的题 |
| `frontend/web` | Web UI、浏览器、交互、性能、可访问性与前端工程 | 服务端架构、数据库治理、模型训练 |
| `qa/quality_engineering` | 测试设计、质量工程、自动化、发布验证与缺陷分析 | 用泛泛测试词替代其他专业能力 |
| `ai_ml/applied` | 模型、RAG、评测、数据/提示词与 AI 运行时 | 将所有技术题归入 AI |

`backend` 是 taxonomy 父节点，不能直接作为内容标签。`backend/general` 也不是所有语言后端题的别名：只有 taxonomy release 的 manifest 显式允许时，才可被投影到指定语言叶节点。新增、合并、弃用叶节点必须发布新 taxonomy 版本，不能重写旧版本的语义。

“全栈”也不是全库开关。岗位分类器可自动生成多个叶节点及 allocation（配额），但一次出题只进入其中一个叶节点；不能把 Node.js、Java、Go、Python 混为一个检索池。

### 1.2 领域对象

| 对象 | 不可变/受控字段 | 责任 |
| --- | --- | --- |
| `TrackTaxonomy` | `version`、tree path、allowlisted leaf、状态、允许的 general projection | 唯一可检索题域词表。 |
| `SourceMetadataHint` | provenance、license/ACL、可选候选 scope、标注来源 | 仅辅助审核；绝不让整份 mixed source 自动继承 serving scope。 |
| `QuestionArtifactMetadata` | leaf track、taxonomy version、受控 competency/technology facets、difficulty、seniority、question kind、language | 在摄取/切块时校验并进入 artifact hash。 |
| `ChunkServingMetadata` | question/artifact、ref、已解析的 leaf `servingScopeId`、taxonomy version、metadata/content hash | 每个可检索 projection 在 embedding 前必须拥有；缺失/冲突只能进审核队列。 |
| `MetadataReviewReceipt` | projection/content hash、taxonomy/leaf/facets、reviewer 或受控 issuer、policy version、时间、状态、撤销 receipt | routed projection 的唯一审核事实；当前 executor annotation 不能冒充此对象。 |
| `GenerationQuestionChunkProjection` | generation、question/artifact、ref、leaf `servingScopeId`、metadata/content hash | 让 ANN/词法从题目和叶节点维度检索，不给 raw chunk 贴可污染的全局标签。 |
| `JobSemanticRevision` | job、不可变 semantic revision、title/description/competencies digest、input HMAC | 岗位意图分类器的唯一输入版本；不复制原文到日志。 |
| `JobRouteDecision` | semantic revision、taxonomy/policy/normalizer/prompt/model/calibration versions、叶节点 allocations、confidence/margin、decision hash、attempt outcome | 自动分类的业务事实；分类结果不能直接授予读库权。 |
| `ApplicationRouteBinding` | application、`JobRouteDecision`、job semantic revision、route digest、授权/隐私版本 | 候选申请/受邀时绑定当时自动决策，隔离后续岗位编辑。 |
| `InterviewRouteSnapshot` | interview、application binding、叶节点 allocations、taxonomy/job revision、route digest | Worker、恢复、重领的唯一题域输入，不再读取当前 job 或重新分类。 |
| `RetrievalPlan` | route-scope digest、单一 leaf track、competency、difficulty、generation、policy 版本 | 一次出题的受控检索输入，不能携带自由 SQL 条件。 |
| `QuestionPlan` | interview snapshot、turn、单一 leaf、competency/difficulty、generation、eligibility verdict、blueprint/rubric/score policy、prompt/model policy 版本、scope digest | 将“检索无题”与一次模型外发冻结为业务事实；不是 graph checkpoint 或自由 prompt。 |
| `QuestionIssueProvenance` | origin、`RetrievalPlan` 或 `QuestionPlan`、证据或 no-result verdict、track、generation、artifact/prompt/rubric/score-policy digests | 区分 `qbank_evidence`、`llm_qbank_miss`、`template_in_bucket` 与不可用；不能把空 refs 假称题库证据。 |

### 1.3 明确不做

- 不要求招聘方或候选人手选题域桶；正常路径由岗位意图分类器自动决定。
- 不从原始文本或向量相似度猜题域后立即发布；metadata 未审核、未进入 hash，或 projection 未在 embedding 前获得 `servingScopeId` 时，一律不可检索。
- 不在每个图节点、每轮追问或每次检索前调用分类模型；已启动面试只读取 snapshot。
- 不允许分类器输出 owner、tenant、SQL 条件、工具权限或“全库”权限；它只能从 taxonomy 已发布的 leaf 中缩小范围。
- 不在全局 ANN Top-K 后由应用层过滤题域；不得把 CRAG 分数、研究外发护栏或未接线 `classify()` 骨架称为岗位意图分类器。
- 不将历史未标注题目、低置信岗位或 `dispatched_unknown` 静默猜测到新轨道；它们只能隔离、保持 `interview_ineligible` 或走无题库业务降级。
- 不把 ACL/RLS 拒绝、generation/recipe 不一致、embedding/缓存故障、超时或 `unknown` 伪装为“桶内无题”而追加模型或 Web 外发。
- 不把模型生成题自动写回 QBank、embedding 或 generation；策展入库必须是独立审核、artifact revision 与新 generation 流程。

## 2. 状态机和硬不变量

### 2.1 `JobRouteDecision`：自动决定，而非人工选择

```text
JobSemanticRevision.created
          |
          v
     route_pending
      |          \
      |           -> model_prepared -> known_not_sent -> route_unresolved
      |                            \
      |                             -> dispatched_unknown -> route_unresolved
      v
 rule_decided -----------------------> result_validated -> route_decided
                                                      |
                                      application_bound |
                                                      v
                                      interview_snapshotted

rule/model low-confidence, too-broad, conflict, invalid-schema -> route_unresolved
```

- 输入固定为 `title + description + competencies` 的 `JobSemanticRevision`；任一字段语义变更只会创建新 revision，再自动发起新路由。
- 规则唯一命中时直接 `rule_decided -> route_decided`，模型调用数为 0；否则以 `job_route_classify` operation 调用一个严格 schema 的小模型。
- 输出是一个或多个**已有 leaf** 的 allocation，权重以 basis points 表示、总和为 10,000，数量和最小占比由冻结的 calibration policy 限制。多桶并不产生 union/global ANN 查询。
- 分类结果先经 taxonomy、置信度阈值、margin、最大 leaf 数和技术 facet 兼容性验证，才可 `route_decided`。模型自报的 confidence 不是事实，必须由冻结评测校准。
- 低置信、候选过宽、冲突、无效 schema、超时、预算/容量拒绝或派发 unknown 时，岗位保持可编辑但为 `interview_ineligible_route`；产品只提示补充标题、职责、技术栈或能力要求，然后产生新 semantic revision。**不显示桶选择器，也不全库降级。**
- `route_decided` 只能被 application binding 消费；已绑定 application 和已启动 interview 永远读取当时版本，不受岗位之后编辑影响。

### 2.2 题库与检索

```text
artifact: draft -> reviewed -> published -> retired | revoked
projection: pending -> embedded -> validated -> serving | quarantined
retrieval plan: pending -> frozen -> consumed | voided
question plan: planned -> dispatching -> issued | failed | unknown
```

- 已发布题目的 leaf track、taxonomy、technology facets、difficulty、seniority、question kind 和 artifact hash 不可更新；变更任一可路由 metadata 必须生成新 artifact revision。
- embedding compute cache 只复用同一 immutable recipe 与实际 canonical provider-input digest 的无主数值；它不是 projection、授权、generation 或检索结果。每个 approved projection 仍写自己的 vector row，并在激活/evidence 时重新验证 metadata、generation、RLS 与撤回状态。
- planner 的输出不是自由文本能力词，而是经 snapshot 验证的 `{ leafTrackId, competencyId, difficulty }`；每一轮由确定性 weighted-deficit scheduler 根据 allocations 选择一个 leaf，再建一个 leaf-local `RetrievalPlan`。
- `frozen` plan 的 route scope、generation、evidence 和 cache identity 必须一致；generation、授权、来源或隐私围栏改变时只能 `voided`。
- 只有已完成 SQL/evidence eligibility 判定的 `no_eligible_in_scope` 才能创建 `QuestionPlan` 并进入 `dispatching`；`qbank_degraded`、`policy_denied`、`generation_stale`、`known_not_sent` 和 `unknown` 永远不能走该边。

### 2.3 生产不变量

1. 摄取 metadata 是可检索范围的第一性事实；job classifier 只选择已有范围。它从不替代 C/B、tenant、project、purpose、consent、privacy epoch 或 RLS。
2. 每个 dense、lexical、RRF、cache 和完整题目 evidence 查询都带同一个 allowlisted leaf `trackId`；`wrong_track = 0` 是数据面硬断言。
3. 已发题只能引用与 `InterviewRouteSnapshot` 同叶节点的工件。缓存命中、迟到 worker 和恢复投影都二次验证 route-scope digest。
4. 同一 `(job, semantic revision, taxonomy, policy)` 最多一次分类派发；`dispatched_unknown` 不自动重试。只有新的 semantic revision 才允许新的 attempt。
5. 任何 route 未决时，没有题库检索、证据水合、模型 prompt 或 `question_ready`。

## 3. 契约、数据库与部署影响（目标态，尚未实施）

| 面 | 目标变更 | 当前状态 |
| --- | --- | --- |
| 题库摄取/切块 | `QbankQuestionArtifact` 携带完整 `QuestionArtifactMetadata`；每个可检索 mapping 有 `ChunkServingMetadata` 与 `MetadataReviewReceipt`，并在 embedding 前被审核 | **局部实现。** `RAG-FUNNEL-01A` 源码闭包已密封：31 函数 + 15 表 + 2 视图（含 bounded reader、`qbank_retrieval_candidate`/`qbank_visible_ref`、词法 helper、cache/pool trigger）在同一 owner/ACL/RLS/fixed-`search_path` 清单内；`qbank_curator`/`qbank_cache_epoch`/`qbank_visible_ref` 是 request 只读例外。本地 `qbank-handoff-closure:prove` 证明移交前 42501 与 raw-read=0；`0124_rag_retrieval_acl_fail_closed.sql` 空 principal → `rag_acl_principal_missing`（并行未合入的 `memory_vector_chunk` 擦除占用 `0125`，本切片保持 `0124`）。`releaseEvidence=false`，不是云部署回执。`MetadataReviewReceipt` 表存在但未进入 routed serving。technology/seniority/kind/language 完整 facets 与标准部署 handoff 仍归 `RAG-FUNNEL-01`。 |
| generation 构建 | 只为已有 serving metadata 的 question/artifact 构建 question-aware projection/embedding；禁止 source 默认继承 | 未实施；当前 generation 只按 raw `ref_id` 建向量行，没有 scope projection。 |
| embedding compute cache | 以 data-class/region/visibility scope、exact recipe digest、actual canonical provider-input digest、dimension、transform/chunker 与 schema 组成不透明 key；仅未命中才经持久 attempt/cost 发送 provider；Redis value 只保存有界向量数值、checksum 与完整 HMAC | 未实施；当前只在单 Worker 进程内 `Map` 缓存，Redis/Tair 只缓存 query retrieval hits。 |
| 岗位创建/编辑 | 创建或修改 `title/description/competencies` 后写 `JobSemanticRevision` 和 route pending；自动路由完成后才具备面试资格 | 未实施；当前创建幂等只覆盖原始字段，没有分类状态。 |
| 申请/面试启动 | application 事务绑定有效 `JobRouteDecision`；interview 同事务复制 `InterviewRouteSnapshot`，route 未决则拒绝启动 | 未实施；当前只绑定 job/resume，Worker 传固定“技术岗”。 |
| 图能力规划 | `planCompetencies` 只可输出 snapshot allowlist 内的 typed leaf/competency/difficulty；turn scheduler 确定性选 leaf | 未实施；当前 planner 可自由返回能力。 |
| 检索数据面 | ANN、词法、RRF、distance、evidence reader 和 cache key 同时接收 route scope | 未实施；当前无 SQL metadata 条件，cache key 无 route digest。 |
| 桶内无题 fallback | eligibility reader 将 clean `no_eligible_in_scope` 与 degraded/denied/unknown 分开；前者才写 `QuestionPlan`，调用一次 `interviewer.ask.qbank_miss` 并落独立 provenance | 未实施；当前局部未命中会混入 Web/generic 出题，最多多次模型调用。 |
| 题目/评分投影 | `interview_question`、event、outbox 持久化 track、origin、question/rubric/score-policy contract 和 plan/attempt digest；B 端首期排除 generated fallback | 未实施；当前 ledger 只有题文/能力/题型，生成题会与证据题同等聚合。 |
| 路由 operation | `job_route_classify` 的类型化 binding、预算、attempt、unknown/降级与可观测性 | 未实施；受 `MODEL-OP-00/01` 前置约束。 |
| 历史数据 | 未标注 artifact 与已有 interview 均为 `legacy_unrouted`；不能批量模型猜测后直接 serving | 未实施。 |

目标迁移先人工审核每一个 question artifact 和可检索 chunk projection，建立层级 manifest；再在新 generation 验证后激活。没有 leaf metadata、metadata/hash/manifest 不一致或 RLS/过滤不可验证的工件从所有 routed retrieval 中隔离。

## 4. 业务用例

### UC-RAG-FUNNEL-01 · 策展者在摄取/切块时冻结层级 metadata

- **角色 Actor：** 题库策展者、QBank 控制执行器、审核者、generation builder。
- **前置 Precondition：** 当前 taxonomy 可读；来源、正文 hash、chunk role 已通过既有治理；每道题提供唯一 leaf track 和受控 facets。进入 routed projection 前还必须有不可变 `MetadataReviewReceipt`；当前 executor annotation 只可作为待审核输入，不能作为 serving 审核结论。任何 control-definer handoff 还须先冻结完整的目录依赖闭包：写 trigger、控制 helper、bounded retrieval reader、其 invoked helper、security-definer view 与 cache/epoch trigger 均有唯一 owner、精确 ACL、固定 `search_path` 和受测 RLS 条件；不能只转写表或只转四个 writer。
- **触发 Trigger：** 摄取、修订或发布题目 artifact 及其 chunk。
- **主流程 Main：**
  1. 摄取 API 接收 artifact、source/chunk hash 和 `QuestionArtifactMetadata`；服务端解析 canonical leaf，例如 `backend/nodejs`，验证 language/technology facets 一致。source hint 不能跳过逐 projection 审核。
  2. 控制面验证 metadata、正文、chunk roles 和 receipt；每个可检索 question/chunk mapping 写经审核的 `ChunkServingMetadata` 与不可变 `MetadataReviewReceipt`，并把 canonical metadata/mapping 写入 artifact hash。
  3. builder 只为带 serving metadata 的 mapping 创建 question-aware generation projection/embedding；候选同时携带 artifact、ref、leaf track 和 metadata/content hash。
  4. 审核通过后 artifact 才 `draft -> published`；缺 metadata 的旧题不能加入 routed generation。
- **备选流 Alternate：** 一个 raw chunk 被两个已审核问题复用时，产生独立 projection；`backend/general` 仅在 manifest 明确允许时投影到指定后端叶节点。
- **异常流 Exception：**
  - **E1 重复：** 相同 artifact/metadata/taxonomy/logical key 返回同一 receipt/projection。机制：artifact hash + 幂等读取。
  - **E2 并发：** 两个策展者对同一 artifact/ref/taxonomy 并发时只有一个 canonical receipt/projection 可发布。机制：唯一约束 + CAS。
  - **E3 越权：** 普通 app role、伪造 curator、父节点直标、未知 leaf 或不相容 facet 均零写入。机制：专用控制执行器、RLS、taxonomy allowlist。
  - **E4 失败回滚：** metadata/mapping/manifest 任一失败，artifact 不发布、generation 不激活。机制：事务与 generation 状态机。
  - **E5 降级：** 标注不唯一、taxonomy 失效或审核未完成时进 review queue；不使用 generic 或全库标签。机制：fail-to-curation。
  - **E6 超时/断线：** 中断只恢复相同 receipt；未知 embedding/构建不激活旧/无标签 projection。机制：lease/attempt。
- **部署闭包约束：** handoff 后任一 bounded reader、view、lexical helper 或 pool/cache trigger 的 owner/ACL/RLS/search-path 不完整时，control 摄取和 app retrieval 都 fail-closed；不得通过补回 app raw-table grant、恢复 migration owner 或放宽 PUBLIC ACL 暂时打通。机制：`principal.ts` 31/15/2 sealed manifest + `assertQbankControlDefinerOwnership` + `qbank-handoff-closure:prove`。该约束属于 `RAG-FUNNEL-01A`（源码已密封，云回执仍归 01）。
- **后置 Postcondition：** 所有 published/serving 投影都有 hash 固化 leaf metadata；未标注内容不可检索。
- **验收标准 Acceptance：** Node.js/Java/Go/Python 互相误入=0；父节点直标、未知 tag、hash 不符、未审核 `servingScopeId`、source 默认误继承和共享 chunk 错继承全部拒绝。handoff 后 provisioned control login 的完整 artifact ingest/pool promotion 与 provisioned app login 的 active metadata、dense、lexical、distance、evidence、question evidence、cache epoch 读取均可用；app raw relation/view read=0，任何 closure owner/ACL/search-path drift 均在启动前拒绝。
- **关联：** QBank artifact/generation、不可变 receipt、CAS/RLS。

### UC-RAG-FUNNEL-01A · 密封检索 ACL，跨租户/会话不得泄漏，缺 ACL/provenance fail-closed

- **角色 Actor：** 请求运行时、QBank/RAG definer、隔离 proof。
- **前置 Precondition：** `qbank_control_definer` 与 `rag_runtime_definer` 已 provision；request 只经 bounded reader / `rag_resolve_query_binding`。
- **触发 Trigger：** 启动 catalog 检查、低权 ingest/retrieval、或 generic RAG resolve/search/evidence。
- **主流程 Main：**
  1. 启动门禁核对 31 函数 + 15 表 + 2 视图的 owner/ACL/RLS/fixed-`search_path`；漂移抛 `qbank_control_definer_ownership_invalid`。
  2. 已 provision 的 app login 调用 active-metadata、dense、lexical、distance、evidence、question-evidence、cache-epoch；不得 raw-read 密封底表。
  3. generic RAG resolve/search 要求非空 `app.principal_user`；同租户只见本人私有行 + 已批准 global。
- **备选流 Alternate：** 二次 `provisionQbankControlDefiner` 重入成功，gate 仍接受。
- **异常流 Exception：**
  - **E1 重复：** 二次 provision 不改变 owner，不重新开放 GRANT。机制：幂等 provision + catalog gate。
  - **E2 并发：** 两请求同 binding 并发 resolve，属主谓词不变，不会放出他租户行。机制：RLS + `owner_user_id=principal`。SQL 不校验 session/sticky；跨会话 replay 不是本项数据面承诺。
  - **E3 越权：** 租户 B 用 A 的 binding → `rag_binding_unavailable`；B 读 A 私有 chunk=0。机制：RLS principal。
  - **E4 失败回滚：** 移交前非超级用户 owner 时 bounded reader 为 42501；gate 拒绝分裂 owner。机制：FORCE RLS + catalog fail-closed。
  - **E5 降级：** 空/空白 principal → `rag_acl_principal_missing`（42501），不得无范围 bind/检索。机制：`0124_rag_retrieval_acl_fail_closed.sql` 入口。
  - **E6 超时/断线：** 中断恢复仍走同一 sealed 函数，不改走 raw SELECT。机制：无旁路入口。
- **后置 Postcondition：** 密封对象保持单一 definer owner；request raw-read=0（除刻意只读面）；缺 ACL 的检索不返回行。
- **验收标准 Acceptance：** 移交前 42501 且移交后非 42501；raw relation/view read=0；跨租户 binding/私有行=0；空 principal 抛 `rag_acl_principal_missing`；global 无批准 provenance=0 行。`releaseEvidence=false`。
- **关联：** `TC-RAG-FUNNEL-01-*`、`principal.ts`、`0124_rag_retrieval_acl_fail_closed.sql`、`rag-retrieval-acl.ts`、RLS。
- **七类覆盖标注：** 正/异/特/逃/并/复/刁。

### UC-RAG-FUNNEL-02 · 已审核 artifact 建立受 recipe 约束的 generation projection 与 embedding compute cache

- **角色 Actor：** QBank 控制执行器、generation builder、embedding operation、Redis/Tair、审核者。
- **前置 Precondition：** artifact/chunk mapping 已按 UC-RAG-FUNNEL-01 审核并冻结 `servingScopeId`、content/metadata hash 与 taxonomy version；对应 embedding recipe、价格/attempt policy 和 generation snapshot 有效。
- **触发 Trigger：** 为新 generation 构建或补齐一个已审核 artifact projection。
- **主流程 Main：**
  1. builder 用唯一 canonicalizer 生成**实际** provider-input UTF-8 bytes；为每个 chunk 计算完整 input digest 和 `HMAC(global-approved-qbank, recipe digest, input digest)`。recipe 必须覆盖实际 provider/deployment、model/revision、dimension、normalization、document transform/chunker、metadata input profile 与 codec；key 绝不含 raw text、owner、route、tenant、简历或答案。
  2. 先读取 compute cache；命中时严格验证 schema、recipe/input digest、dimension、向量长度、finite 数值、payload checksum 和 value HMAC。命中只复用 global approved QBank 的无主浮点数，不能跳过 projection 的 metadata/hash、generation、RLS 或撤回检查。
  3. 未命中时先在 PostgreSQL 写同一 compute key 的 durable fill intent/cost reservation；只有 claim/slot 进入 `dispatching` 后才调用 embedding provider。返回向量经 recipe/dimension/finite/checksum 校验后，以 fenced且签名的 Redis 写入；Redis 写入失败则当前 delivery 只能记录 `succeeded_uncached`，不能把已成功派发伪装为新的 miss。每个 approved `(generation, artifact/question, ref, servingScopeId)` 都独立写入 vector projection。
  4. generation validation 同时验证 projection metadata、content hash、recipe 和 vector count；所有检查通过才进入 `serving`。Redis value 从不单独激活 generation，也不成为回滚或授权事实。
- **备选流 Alternate：** 首期只在 global approved QBank 内复用同 recipe 的 canonical input；同 recipe 新 generation 仍须各写其 vector row。私有/组织语料一律不用此 cache，直至 tenant、visibility、consent、region/egress policy 与删除账本已有独立合同；不同 recipe、endpoint/deployment、dimension、normalization、chunker、input profile 或 cache schema 必为 cache miss/new key space。
- **异常流 Exception：**
  - **E1 重复：** 相同 compute key/generation replay 复用同一 durable fill 或已验证 value；provider dispatch 增量最多 1。机制：content-addressed key + fill intent/slot + idempotent projection key。
  - **E2 并发：** 20 个 builder/worker 同时 miss 时只有一个持久 intent/dispatch winner；Redis lock 只做合并，不能替代 PG attempt/cost fence。机制：唯一约束 + CAS + fenced publish。
  - **E3 越权：** 伪造 recipe/input digest/dimension/value HMAC、未审核 metadata、非 global approved scope、cache key 或过期/revoked source 均不能写 projection 或把 value 用作 serving evidence。机制：控制执行器、RLS、snapshot/hash 复核。
  - **E4 失败回滚：** known-not-sent/校验失败不填 cache、不写 projection、不激活 generation；Redis/value 故障不是可无账本外发的 miss。只有 durable fill 明确仍未派发时，才可用同一 fill 一次受控直连；已成功 provider 但 Redis 写入失败= `succeeded_uncached`，不自动二次收费。机制：attempt 状态机 + generation `failed`。
  - **E5 降级：** recipe/value/schema/Redis/成本/撤回不确定时 generation 为 `failed/degraded/unknown`，不复用旧 recipe、不切模型、不以全库向量凑结果。`unknown` 或 `succeeded_uncached` 永远不自动新建 fill。机制：fail-closed + immutable recipe。
  - **E6 超时/断线：** 已派发 response-loss/timeout 标为 `unknown`；恢复只读相同 intent/对账，不能换 key 或自动再次 embedding。机制：durable invocation/attempt。
- **后置 Postcondition：** 已 serving 的 generation 中每一行同时有经审核 scope projection 与相同 recipe 的向量；compute cache 仅降低重复计算，不承载业务可见性。
- **验收标准 Acceptance：** 同 recipe/input 的跨实例构建 provider dispatch/slot/cost reservation=1、各 projection 行仍独立；endpoint/deployment/revision/model/dim/chunker/normalization/input profile/codec 任一变化=0 旧值复用；未审核/撤销/非 global approved scope/越权=0 projection；Redis 故障、value HMAC 损坏和 dispatch unknown 均不产生第二次外发；cache key/value/日志/指标不含 raw text/owner/route。
- **关联：** `EmbeddingRecipe`、`EmbeddingComputeKey`、fill intent/cost ledger、generation state machine、CAS/RLS，以及本用例表中明确列出的 Main/E1–E6 leaf。

### UC-RAG-FUNNEL-03 · 岗位意图分类器自动生成并冻结路由

- **角色 Actor：** 招聘方、岗位服务、规则路由器、`job_route_classify` operation、分类 Worker、候选人。
- **前置 Precondition：** 岗位有 title/description/competencies；taxonomy 已有 serving leaf；分类 policy、校准阈值、预算和 operation binding 已发布。
- **触发 Trigger：** 创建或编辑会改变岗位语义的字段。
- **主流程 Main：**
  1. 服务端建立 `JobSemanticRevision`，按 canonical 内容计算 HMAC/digest，route 置 `route_pending`；不接受 caller 提供的 bucket、weight、confidence 或 model 结果。
  2. 规则词典先自动决定唯一 leaf；若不唯一，则分类 Worker 以固定 schema、temperature=0 和一次 operation attempt 从 title/description/competencies 得到候选 leaf allocations。
  3. 服务端按 taxonomy、facet、最大叶数、最小 allocation、confidence/margin 和校准 release 验证结果；通过后自动写 `route_decided`。多叶结果总 allocation=10,000，并保持 leaf 不可变顺序。
  4. 候选申请/受邀时，以 application 事务绑定此 `JobRouteDecision`；开始面试时复制为 immutable `InterviewRouteSnapshot`。之后 job 编辑只影响新 semantic revision，不能改旧绑定。
- **备选流 Alternate：** 规则唯一命中不调用模型；多叶岗位自动产生 allocation，后续由确定性 scheduler 分轮分配，不产生混合检索。
- **异常流 Exception：**
  - **E1 重复：** 相同 `(job, semantic revision, taxonomy, policy)` 的 20 次调用复用同一 decision/attempt。机制：唯一 key + 幂等读取。
  - **E2 并发：** 岗位编辑、分类回写、申请/启动并发时，只有与 exact semantic revision 对齐的 route 可绑定。机制：job version + CAS/行锁。
  - **E3 越权：** caller 伪造 bucket、allocation、taxonomy、job、tenant 或模型输出均不能影响 route 或检索，外发/读库为 0。机制：服务端 input digest、typed binding、RLS。
  - **E4 失败回滚：** decision/route binding/snapshot 事务失败时没有 application/interview 可消费半成品 route。机制：事务 + outbox/CAS。
  - **E5 降级：** 低置信、过宽、冲突、无效 schema、预算不足、known-not-sent 或 unknown 时写 `route_unresolved` / `interview_ineligible_route`；提示补充岗位描述，不能选桶、不能全库 fallback。机制：fail-to-enrichment。
  - **E6 超时/断线：** 派发后 `dispatched_unknown` 不自动重发；同 revision 恢复只读现状态，语义字段变更才产生新 revision/attempt。机制：attempt 状态机。
- **后置 Postcondition：** 每个可启动岗位绑定一个可审计的自动 route；未决岗位无法启动题库面试。
- **验收标准 Acceptance：** 正常岗位不出现手选桶 API/UI；规则唯一命中模型调用=0；每个通过 route 的 allocations 合法且总和=10,000；route 未决时 Worker/检索/发题=0。
- **关联：** `JobSemanticRevision`、`JobRouteDecision`、`ApplicationRouteBinding`、`InterviewRouteSnapshot`、`UC-MODEL-ROUTE-01`、CAS/RLS/幂等/attempt。

### UC-RAG-FUNNEL-04 · Worker 按自动快照逐轮选择一个 leaf 并受控检索出题

- **角色 Actor：** 候选人、面试 Worker、QBank generation、Redis/Tair 缓存、题库审核者。
- **前置 Precondition：** interview 有 route snapshot；其 allocations 只引用 published serving leaves；generation/recipe、授权、来源、隐私围栏有效。
- **触发 Trigger：** 图要为 competency/difficulty 请求 grounded question。
- **主流程 Main：**
  1. 确定性 weighted-deficit scheduler 根据 snapshot allocation 选择本轮一个 leaf。图 planner 只可返回经 snapshot/taxonomy 校验的 `{leafTrackId, competencyId, difficulty}`，不能自由选桶。
  2. Worker 建 `RetrievalPlan`，冻结单一 leaf、competency、difficulty、taxonomy、generation 和 policy；ANN、lexical、RRF/cache 从数据库候选阶段按此 leaf 过滤。
  3. evidence 水合再次校验 route leaf、artifact metadata、generation projection、hash、来源、RLS 和隐私围栏；通过后才允许 CRAG 使用同 leaf 材料和持久化 `qbank_evidence` provenance。
- **备选流 Alternate：** 只有该 retrieval/evidence 链完整成功并返回 `no_eligible_in_scope` 时，进入 UC-RAG-FUNNEL-05，在**同一 leaf** 由 LLM 生成一题；不扩大到同父节点的语言 sibling、全库或 Web。
- **异常流 Exception：**
  - **E1 重复：** 同一 plan/generation/graph fence 只消费既有候选/发题结果。机制：冻结 plan、singleflight、question identity。
  - **E2 并发：** generation 切换、来源撤销、双 Worker 或 graph resume 时旧 plan 不能提交。机制：epoch CAS + graph fence。
  - **E3 越权：** 伪造 leaf、tenant/project、artifact 或 cache key 时 candidate/evidence/business question/prompt=0。机制：SQL/RLS 硬过滤 + 二次验证。
  - **E4 失败回滚：** evidence/provenance 写失败不发 `question_ready`，plan `voided`。机制：事务 projection/outbox。
  - **E5 降级：** clean 无题进入 UC-RAG-FUNNEL-05；cache/embedding/ACL/recipe/generation 不可用、撤销或 unknown 为 `qbank_degraded`/`policy_denied`，LLM/Web=0。模型 fallback 的已知失败才可使用已批准同 leaf 模板或 `generation_unavailable`。机制：typed eligibility verdict + attempt 状态机。
  - **E6 超时/断线：** 检索/模型派发 unknown 不重发同一 plan；恢复读取冻结 plan/issue。机制：lease/attempt/graph fence。
- **后置 Postcondition：** 每道题可证明其自动 job route、snapshot leaf、generation 与 `qbank_evidence` 或 `llm_qbank_miss` 的精确 origin；二者绝不混称。
- **验收标准 Acceptance：** planner/dense/lexical/RRF/cache/evidence/question ledger 七个面 `wrong_track=0`；job 修改、旧 checkpoint、缓存回放和全局 ANN mock 都不能跨 leaf 出题；degraded/denied/unknown 时模型和 Web 外发=0。
- **关联：** `RetrievalPlan`、`QuestionIssueProvenance`、generation projection、RLS/CAS/outbox/graph fence。

### UC-RAG-FUNNEL-05 · 已冻结 leaf 确认无合格题时由 LLM 生成同桶题

- **角色 Actor：** 候选人、面试 Worker、QBank eligibility reader、`interviewer.ask.qbank_miss` operation、模型网关/运行时、评分服务。
- **前置 Precondition：** `InterviewRouteSnapshot`、单 leaf `RetrievalPlan`、generation、授权/RLS/隐私围栏均已通过；eligibility reader 的终态是 `no_eligible_in_scope`；对应 leaf 已发布 question blueprint、`rubricTemplateId/version`、score policy 与模型 operation binding。
- **触发 Trigger：** 当前 leaf 在**正常、已授权、active generation** 的检索和 evidence 二次校验后没有任何 eligible QBank question。
- **主流程 Main：**
  1. Worker 在同一 graph fence 下写 immutable `QuestionPlan`：snapshot/route-scope digest、leaf、taxonomy、competency、difficulty、generation、`no_eligible_in_scope` verdict digest、question blueprint、rubric/score policy、prompt/schema/model policy 版本和 idempotency digest。它不保存原始 job 描述、简历事实、作答或检索正文。
  2. 仅 `QuestionPlan.planned` 可以派发一次 `interviewer.ask.qbank_miss`。类型化 binding 只提供冻结 leaf、能力、难度、已批准 blueprint/rubric template 标识、已发题 digest 的 avoid set 与语言规则；不提供 raw job/resume/answer、跨桶材料、QBank 正文、自由 URL 或 Web。
  3. 模型只返回结构化题文和 blueprint focus；服务端用 schema、leaf/语言/长度/非引导/去重校验，并绑定**既有** rubric/score policy。模型不得新建 track、rubric、来源或权限；`refs` 必为空。
  4. 在同一 projection/outbox 事务内写 `interview_question`、`question_ready` 和 `QuestionIssueProvenance(origin=llm_qbank_miss)`。provenance 仅保留 plan、scope/taxonomy/generation、eligibility、prompt/schema/rubric/score policy、model operation/attempt、成本与 question hash 的脱敏 digest；候选 API/SSE 不返回 rubric 或内部 provenance。
  5. 首期 generated fallback 标记 `review_required` / `score_excluded`：不得自动进入 B 端 overall、排名、录用或完成门，直至 `SCOR-01…08` 的 rubric、校准和人工复核契约完整上线。
- **备选流 Alternate：** 已批准的同 leaf 确定性模板只可在模型已知未派发、schema 无效或明确失败后使用，并记录 `template_in_bucket`；若无模板则 `generation_unavailable`。两者都不跨 leaf，也不伪造 QBank evidence。
- **异常流 Exception：**
  - **E1 重复：** 同 `QuestionPlan` 的 20 次恢复/调用只读取同一 invocation/result；模型派发≤1。机制：question-plan 唯一键、durable invocation、question identity。
  - **E2 并发：** 双 Worker/graph resume 只允许一个 plan/issue 写入；route、generation 或 privacy epoch 已变则旧 plan void，模型=0。机制：fence + CAS + outbox。
  - **E3 越权：** 伪造 leaf、tenant/project、plan、rubric、generation 或 raw prompt 时 QBank/模型/question=0。机制：snapshot/RLS/typed binding/服务端字段白名单。
  - **E4 失败回滚：** 模型成功而 question/provenance/outbox 事务失败时没有 `question_ready`；恢复只读 durable outcome，不重新生成不同题。机制：result outbox + exact-once projection。
  - **E5 降级：** `qbank_degraded`、`policy_denied`、`generation_stale`、timeout、dispatch unknown 或预算拒绝不进入模型 fallback；已派发 unknown 不重发。仅已知失败可用同 leaf 模板/不可用态。机制：eligibility/attempt 分类。
  - **E6 污染与评分：** 生成题不能自动写回 QBank/vector；没有已批准 rubric、origin 或 score policy 的题不能被评分/报告/B 端聚合消费。机制：控制面审核、数据库约束、资格聚合门。
- **后置 Postcondition：** clean 无题时用户仍可得到同桶题或明确不可用态；题目可追溯为 `llm_qbank_miss`，但不被伪装为题库证据题，也不污染 QBank。
- **验收标准 Acceptance：** 同桶命中时模型=0；clean no-result 时模型=1且 scope/rubric/provenance 完整；degraded/ACL/recipe/撤销/unknown 时模型/Web=0；20 并发、恢复和 crash 不重复派发；generated fallback 对 B 端 score/rank/completion 影响=0；QBank 自动新增/embedding=0。
- **关联：** `QuestionPlan`、`QuestionIssueProvenance`、`MODEL-OP-00…03`、`SCOR-01…08`、durable invocation/outbox/CAS/RLS。

### UC-RAG-FUNNEL-06 · route-scope 缓存、provenance 与撤销不跨桶回放

- **角色 Actor：** 面试 Worker、QBank retrieval/evidence reader、Redis/Tair、generation/revocation 控制面、候选人。
- **前置 Precondition：** 已实现的 retrieval plan 已冻结 route scope、taxonomy、generation、recipe、授权与 privacy epoch；任何 compute cache 只可为已验证 projection 提供数值，不能成为 serving 可见性来源。
- **触发 Trigger：** 对同一 leaf 的 retrieval/evidence、negative result、QuestionPlan 或撤回事件发生。
- **主流程 Main：**
  1. retrieval-result、singleflight、negative-result、source hydration 和 QuestionPlan provenance key 均包含 route-scope/taxonomy/generation/recipe/ACL/privacy digest；embedding compute cache 只使用 recipe/content key，且其输出先回到受 scope 约束的 projection。
  2. 每个 retrieval cache hit 都重新读取 generation/epoch 与 evidence；命中只返回 ref/distance，不返回正文或向量。水合阶段再次验证 snapshot leaf、projection metadata、source 状态、RLS、purpose/consent 和 privacy epoch。
  3. source/artifact/route/authorization/privacy 变更时控制面使相关 result/negative/hydration cache 与 plans 失效；delete/revoke request 枚举 compute-cache purge target 并记录终态 receipt。TTL 仅是容量策略，不是撤回/删除完成证据。
- **备选流 Alternate：** cache hit 只在 epoch/route/evidence 都一致时复用；若 clean `no_eligible_in_scope` 可沿用 UC-RAG-FUNNEL-05，任何 cache dependency/schema/epoch/ACL/unknown 都返回 degraded/denied，不发模型/Web。
- **异常流 Exception：**
  - **E1 重复：** 相同 plan/cache identity 重放读取相同结果或既有 negative verdict，不重复 embedding/模型外发。机制：HMAC key + durable fill/plan idempotency。
  - **E2 并发：** generation flip、revoke、双 worker 和 Redis lock 竞争时，旧 epoch/route producer 不能 publish 或 issue question。机制：epoch CAS + token fencing + graph fence。
  - **E3 越权：** 伪造 scope/owner/tenant/privacy/cache key 或直接 Redis 读取均不能得到可用 evidence/question。机制：opaque key、RLS、evidence re-authorization。
  - **E4 失败回滚：** cache/purge/provenance 写入失败时不声明撤回完成、不派发 fallback；generation/QuestionPlan 保持 voided/failed/unknown。机制：deletion receipt + outbox/CAS。
  - **E5 降级：** Redis/Tair unavailable、value 损坏、compute cache 不确定或 ACL/epoch mismatch 不是 miss；只走 `qbank_degraded`/`policy_denied`，embedding/LLM/Web=0。机制：fail-closed dependency port。
  - **E6 超时/断线：** fill/purge 已派发未知时不能自动重新计算、复活或标完成；恢复只读 attempt/receipt。机制：durable attempt/receipt.
- **后置 Postcondition：** 任一可出题 evidence 可证明 route/generation/authorization 的当前有效性；被撤回内容不从 result、compute、negative、hydration cache 或迟到 worker 回放。
- **验收标准 Acceptance：** route/generation/revoke/epoch/privacy 变化后 wrong-track/withdrawn replay=0；伪造 cache identity=0 evidence；Redis 故障/损坏/unknown 时 embedding/LLM/Web=0；每个 delete/revoke cache target 都有终态 receipt。
- **关联：** retrieval-result cache、embedding compute cache、`QuestionPlan`、tombstone/deletion receipt、RLS/CAS/graph fence，以及本用例表中明确列出的 Main/E1–E6 leaf。

### UC-RAG-FUNNEL-07 · 自由文本专项训练复用同一自动路由，不扩大权限

- **角色 Actor：** 候选人或招聘方、API、路由 Worker、模型操作路由器、题库 Worker。
- **前置 Precondition：** 产品批准该自由文本入口；taxonomy/policy、预算和 `MODEL-OP-00/01` 已可用。
- **触发 Trigger：** 专项训练目标或未来受限多语料请求需要自动选已有题域。
- **主流程 Main：**
  1. 建立 scope-bound semantic revision；规则→小模型按 UC-RAG-FUNNEL-03 自动产生 `JobRouteDecision` 等价的 typed decision。
  2. 只有 `route_decided` 才可创建 snapshot/plan；分类结果没有数据读取能力。
- **备选流 Alternate：** 规则唯一命中零模型调用。
- **后置 Postcondition：** 自动路由可审计、不可越权且不扩大 corpus。
- **验收标准 Acceptance：** 低置信/unknown/越权=0 检索；prompt、日志、cache、事件不含未授权原文；误路由和外发越界=0。
- **关联：** `JobRouteDecision` 的同构范围、`ModelOperationBinding`、RLS/幂等/成本账本。

### UC-RAG-FUNNEL-08 · production-equivalent 路由、缓存与生成题评测

- **角色 Actor：** 质量负责人、题库策展者、RAG/模型平台、隐私/安全审阅者。
- **前置 Precondition：** UC-RAG-FUNNEL-01…07 已有版本化 implementation；测试集、taxonomy、generation、recipe、route/calibration policy 和数据分类已冻结；真实环境凭据与审计回执受控。
- **触发 Trigger：** 新 taxonomy、embedding recipe/generation、route policy、cache schema、QuestionPlan policy 或模型 binding 申请发布。
- **主流程 Main：**
  1. 在脱敏、双标、冻结的多语言/多叶 holdout 上分别报告各 leaf 的 Recall@K、nDCG、no-answer、wrong-track、metadata rejection、compute/result cache hit/miss、P95、成本与 unknown 率；不以全局平均掩盖 Node/Java/Go/Python sibling 错误。
  2. 在完整 Worker/API/数据库和真实受控 Redis/Tair 环境运行 route mutation、generation flip、revoke/delete、双 worker、provider timeout/unknown、cache corruption/eviction 与 QuestionPlan no-result 对抗集；每次回执绑定数据集/policy/recipe/环境 digest。
  3. 只有所有 hard-zero 安全断言与预注册阈值通过，才可按 generation/route policy 的 CAS 灰度；不满足则保持/回滚到兼容已验证版本。
- **备选流 Alternate：** 无真实云或人工标注时只可输出 `not_run`/`inconclusive`，不能借本地 fake、demo、benchmark 或单一缓存命中标为 passed。
- **异常流 Exception：**
  - **E1 重复：** 同 dataset/policy digest 重跑只追加审计样本，不改变 release decision。机制：release receipt idempotency。
  - **E2 并发：** 两个 promotion/rollback 竞争时最多一个 active pointer/route policy 成功。机制：CAS。
  - **E3 越权：** 非质量/控制角色无法读取 holdout、cache 原文或批准阈值。机制：RLS/least privilege。
  - **E4 失败回滚：** 任一验证/receipt 不完整，promotion 不发生或 CAS 回滚。机制：release state machine/outbox。
  - **E5 降级：** provider/Tair/网络故障样本单独计入，不用缓存命中掩盖；阈值不通过即暂停。机制：pre-registered threshold.
  - **E6 超时/断线：** 测试执行中断不产生通过结论；恢复需有同一 run receipt 和完整样本。机制：run lease/attestation。
- **后置 Postcondition：** 所有可发布结论均能回溯到 exact dataset、policy、recipe、环境与审计回执；否则状态为 blocked/inconclusive。
- **验收标准 Acceptance：** 每 leaf hard-zero 越界、撤回回放、unknown 重派发与无审批数据使用；所有质量/成本/P95 阈值预注册且可重放；本地/云/人工证据边界不混称。
- **关联：** `TC-RAG-FUNNEL-08`、RAG release policy、MODEL-OP、cloud test matrix、审计/回执状态机。

## 5. 测试计划与逐项勾选

| 交付项 | 已发现 | 已实现 | 已验证 | 已关闭 | 关键验收 |
| --- | :---: | :---: | :---: | :---: | --- |
| RAG-FUNNEL-01A 密封依赖闭包与检索 ACL | ☑ | ☑ | ◐ | ☐ | 源码 31/15/2 manifest + `0094` + 启动门禁已密封。QBank 本地 `qbank-handoff-closure:prove`：移交 42501、raw-read=0。Generic RAG 本地 `rag-corpus-version.proof.ts`：跨租户 binding=`rag_binding_unavailable`、空 principal=`rag_acl_principal_missing`/42501。域 `prove:rag-retrieval-acl` 只证纯合同，不是 SQL 抛码。`releaseEvidence=false`。 |
| RAG-FUNNEL-01 摄取/切块 metadata taxonomy | ☑ | ◐ | ☐ | ☐ | taxonomy/annotation 与 01A 闭包已在源码；`MetadataReviewReceipt` 表在清单内但未进入 routed serving。完整 facets、标准部署 handoff 回执与七类 serving 验收未关闭。Node/Java/Go/Python 不互混尚不能作为 serving 结论。 |
| RAG-FUNNEL-02A projection 与 canonical embedding recipe | ☑ | ☐ | ☐ | ☐ | 先建立 immutable `(generation, artifact/question, ref, scope)` projection、实际 provider-input canonicalizer 和完整 deployment/region/model/revision recipe；未标注/哈希不符不入 generation。 |
| RAG-FUNNEL-02B / RAG-EMBED-CACHE-01 durable embedding compute cache | ☑ | ☐ | ☐ | ☐ | 与 retrieval-result Redis cache 分离；同 recipe/input 跨实例仅一个 fill intent/slot/cost dispatch，unknown 与 `succeeded_uncached` 不自动重算。 |
| RAG-FUNNEL-03 自动岗位意图分类与 route binding | ☑ | ☐ | ☐ | ☐ | title/description/competencies 自动决定合法 allocation；低置信=interview ineligible，不出现手选桶。 |
| RAG-FUNNEL-04 snapshot、planner 和 leaf-local retrieval | ☑ | ☐ | ☐ | ☐ | scheduler/planner/SQL/ANN/lexical/RRF/evidence 全面 wrong-track=0。 |
| RAG-FUNNEL-05 clean no-result 的同桶 LLM fallback | ☑ | ☐ | ☐ | ☐ | 只由 `no_eligible_in_scope` 触发一次 LLM；同 leaf/rubric/provenance 完整；B 端 score/rank/completion 与 QBank 自动入库均为 0。 |
| RAG-FUNNEL-06 cache、provenance 与撤销 | ☑ | ☐ | ☐ | ☐ | route digest 隔离；撤销/epoch/generation 竞态后不出题或不派发 fallback。 |
| RAG-FUNNEL-07 自由文本自动漏斗与成本/unknown | ☑ | ☐ | ☐ | ☐ | 规则优先；低置信=需补充；20 并发一次 attempt；unknown 零检索。 |
| RAG-FUNNEL-08 生产等价评测与发布 | ☑ | ☐ | ☐ | ☐ | 多语言/全栈/歧义/注入、各 leaf Recall@K、wrong-track=0、fallback P95/成本阈值冻结。 |

### 测试用例

| TC | 层级 | 断言 |
| --- | --- | --- |
| `TC-RAG-FUNNEL-01-main`<br>`TC-RAG-FUNNEL-01-E1`<br>`TC-RAG-FUNNEL-01-E2`<br>`TC-RAG-FUNNEL-01-E3`<br>`TC-RAG-FUNNEL-01-E4`<br>`TC-RAG-FUNNEL-01-E5`<br>`TC-RAG-FUNNEL-01-E6` | 域单元 + 完整迁移 PostgreSQL（本地隔离） + provisioned control/app plane | 01A 源码密封复用本行既有 leaf：域合同七类码（未接线，`prove:rag-retrieval-acl`）；QBank handoff 前 42501 / 后非 42501 且 raw-read=0；generic RAG 跨租户 binding=`rag_binding_unavailable`、空 principal=`rag_acl_principal_missing`/`42501`。完整 facets / 审核 receipt serving / 20 并发仍归 01，不得勾选已验证。 |
| `TC-RAG-FUNNEL-02-main`<br>`TC-RAG-FUNNEL-02-E1`<br>`TC-RAG-FUNNEL-02-E2`<br>`TC-RAG-FUNNEL-02-E3`<br>`TC-RAG-FUNNEL-02-E4`<br>`TC-RAG-FUNNEL-02-E5`<br>`TC-RAG-FUNNEL-02-E6` | 完整迁移 PostgreSQL + control plane + controlled embedding transport | artifact-to-generation projection 只消费已审核 metadata；canonicalizer/recipe 含实际 deployment，20 并发只有一个 provider dispatch；未标注、hash/recipe/dimension/HMAC 不符、共享 chunk 错继承、Redis 损坏/unknown、撤销或跨域伪造均不可 serving。 |
| `TC-RAG-FUNNEL-03-main`<br>`TC-RAG-FUNNEL-03-E1`<br>`TC-RAG-FUNNEL-03-E2`<br>`TC-RAG-FUNNEL-03-E3`<br>`TC-RAG-FUNNEL-03-E4`<br>`TC-RAG-FUNNEL-03-E5`<br>`TC-RAG-FUNNEL-03-E6` | PostgreSQL + API + controlled model transport | job title/description/competencies 自动产生合法 single/multi leaf allocation；幂等、编辑/申请并发、伪造、事务失败、low-confidence/unknown 与断线时未决 route 的检索/出题=0；没有手选 bucket 字段。 |
| `TC-RAG-FUNNEL-04-main`<br>`TC-RAG-FUNNEL-04-E1`<br>`TC-RAG-FUNNEL-04-E2`<br>`TC-RAG-FUNNEL-04-E3`<br>`TC-RAG-FUNNEL-04-E4`<br>`TC-RAG-FUNNEL-04-E5`<br>`TC-RAG-FUNNEL-04-E6` | full migration + Worker/graph | immutable route snapshot、deterministic allocation scheduler、每个 query path 硬过滤、plan 重放、撤销、越权、失败、降级与 unknown；全部 `wrong_track=0`。 |
| `TC-RAG-FUNNEL-05-main`<br>`TC-RAG-FUNNEL-05-E1`<br>`TC-RAG-FUNNEL-05-E2`<br>`TC-RAG-FUNNEL-05-E3`<br>`TC-RAG-FUNNEL-05-E4`<br>`TC-RAG-FUNNEL-05-E5`<br>`TC-RAG-FUNNEL-05-E6` | full migration + Worker + controlled model transport | clean no-result→一次同桶模型题；命中/degraded/ACL/unknown=0 外发；重放/并发/崩溃不重复；无 QBank 污染且 B 端 score/rank/completion=0。 |
| `TC-RAG-FUNNEL-06-main`<br>`TC-RAG-FUNNEL-06-E1`<br>`TC-RAG-FUNNEL-06-E2`<br>`TC-RAG-FUNNEL-06-E3`<br>`TC-RAG-FUNNEL-06-E4`<br>`TC-RAG-FUNNEL-06-E5`<br>`TC-RAG-FUNNEL-06-E6` | full migration + cache/evidence | route digest、撤销、generation/epoch/隐私围栏和 negative-result cache 的隔离。 |
| `TC-RAG-FUNNEL-07-main`<br>`TC-RAG-FUNNEL-07-E1`<br>`TC-RAG-FUNNEL-07-E2`<br>`TC-RAG-FUNNEL-07-E3`<br>`TC-RAG-FUNNEL-07-E4`<br>`TC-RAG-FUNNEL-07-E5`<br>`TC-RAG-FUNNEL-07-E6` | controlled model + security | 自由文本自动 decision 的范围隔离、预算、unknown 与零副作用。 |
| `TC-RAG-FUNNEL-08` | offline + production-equivalent | 多语言、全栈、歧义、注入、过宽岗位、缺技术栈、各 leaf 召回/误路由/fallback 成本/P95。 |

七类（正常、异常、特殊、逃逸通道、高并发、复杂、刁钻）均在 Main、E1–E6 和生产等价集落地；没有完整迁移/RLS/Worker/operation 路径的绿灯不得勾选“已验证”。

## 6. 实现门禁结论

**Routed serving 仍不得当作生产已接线。** `RAG-FUNNEL-01A` 源码依赖闭包已密封（31 函数 + 15 表 + 2 视图 + 检索 ACL fail-closed）；本地 isolation/abuse proof 存在，`releaseEvidence=false`。`RAG-FUNNEL-01` 仍须补 `MetadataReviewReceipt` serving、完整 facets 与真实组合根部署回执。其后才是 `02A canonical projection/recipe` → `02B / RAG-EMBED-CACHE-01` → `03` → `04` → `05` → `06` → `07` → `08`。本地 03–07 合同 proof 不是生产 Worker 接线：没有自动 job decision/snapshot 时，Worker 不得从当前 job 或固定“技术岗”猜桶；没有 eligibility、QuestionPlan、rubric/score contract 和评分隔离时，不得把 generic LLM 出题冒充同桶 fallback。
