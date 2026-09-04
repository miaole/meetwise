---
id: delivery_production_readiness_remediation_register
name: 生产可用性整改登记册
description: 集中登记测试、评测、演示或目标态代码与真实生产路径之间的差距；每项必须以代码和验收关闭，不能以文档或绿灯截图关闭。
type: plan
scope: shared
level: guide
status: active
owner: architecture
version: 1
related:
  - ./production-backlog.md
  - ../architecture/current-runtime-truth.md
  - ../testing/strategy/test-strategy.md
  - ../testing/e2e-performance-evidence.md
  - ../requirements/use-cases/quality-assurance-traceability.md
  - ../requirements/use-cases/memory-governance-and-recall.md
  - ../requirements/use-cases/model-operation-routing.md
---

# 生产可用性整改登记册

> 这是“测试存在，但不能据此说生产可用”的统一整改入口。它登记本轮全局静态调用链审计确认的全部高置信项；未来发现的新项必须追加，不得靠修改旧行抹去历史。它不替代当前运行时事实矩阵，也不把本地 proof、mock、演示、离线评测或云能力探针计为发布证据。

## 1. 使用方法与关闭纪律

| 阶段 | 勾选条件 | 不足以勾选的内容 |
| --- | --- | --- |
| `发现` | 已有代码/调用链/文档证据，登记原因码和影响 | 单个 grep 命中、猜测、口头结论。 |
| `已实现` | 整改代码、契约与必要迁移已合并到当前路径 | 仅写设计、仅改文案、只保留旧兼容代码。 |
| `已验证` | 对应验收在正确层级通过：公开 API 要真 HTTP，数据路径要真数据库，外部依赖要真实或明确的受控替身 | mock 计数、HTTP 200、单 happy path、旧迁移回执。 |
| `已关闭` | 复审确认运行时、文档与验收一致；若属于发布面，还须满足其独立发布证据要求 | `releaseEvidence=false` 的本地回执、静态检查或本登记册本身。 |

关闭时保留原 ID、代码路径、验收命令/场景、运行环境和回执范围；未达关闭条件的项目保持未勾选。优先级表示当前风险，不等同功能排期。

## 2. 当前整改总表

| ID | 优先级 | 已发现 | 已实现 | 已验证 | 已关闭 | 事实与影响 | 最小整改与关闭验收 |
| --- | --- | :---: | :---: | :---: | :---: | --- | --- |
| PRD-TEST-001 | P0 | ☑ | ☑ | ☑ | ☐ | 公开 `POST /interview/:id/answer` 曾不读取答案而写死 `answer_evaluated.score=68`；报告、能力评估和 B 端申请评分都会聚合该事件。当前工作树已返回统一 `410`、移除公开契约，C 端消费要求与题目/答案 ledger 对齐，迁移 `0082` 暂停 B 端数值分。`2026-08-13` 的 `pnpm scor-00:http:prove` 在完整 87 个迁移、独立低权 runtime login 的 Nest/Fastify 组合根中验证 C/B、重放、并发、跨主体调用与全部受检副作用增量为 0。 | 本地组合根验收已完成，但回执 `releaseEvidence=false`；独立复审与发布级环境证据前不勾“已关闭”。原始 event 写权限隔离、rubric/measurement 版本和可比评分仍留在 PRD-TEST-015 的评分卡整改。 |
| PRD-TEST-002 | P1 | ☑ | ☑ | ☐ | ☐ | `buildBm25`、内存 dense、weighted RRF、rerank、多查询组合在 `ai-runtime/search.ts` 自称生产检索管线，但没有 API/Worker 生产调用者。 | 选择其一：改为“离线实验工具”并删除生产表述；或经受治理的 QBank request path、成本/隐私/缓存/发布门真正接线。验收必须从 Worker 组合根追到真实调用，而非只测试导出函数。 |
| PRD-TEST-003 | P1 | ☑ | ☑ | ☐ | ☐ | QBank holdout 的 lexical/RRF 评测曾用自写 `buildBm25`；实际 RRF 路径使用 PostgreSQL FTS，两者分词、排序、语料过滤不等价。`2026-08-16` 已迁到 `apps/worker/test/qbank-retrieval-eval-pg.proof.ts`（`qbank-retrieval-eval:prove:raw`）：91 迁移隔离 PG 上用真实 `hybridQbankSearch`（dense + rrf）+ `qbankQuestionResultsForHits` 完整聚合重跑 35 条 holdout。真实路径暴露旧近似看不见的事实：`qbank_generation_lexical_search` 用 `plainto_tsquery` 对查询全部 term（中文 bigram + ASCII 整词）取 AND，35 条长自然问句全部命中 0 条候选、rrf≡dense；短精确 term 探测（`限流`）返回候选证明词法函数真实可用。dense 通道默认用确定性词袋（显式 `QBANK_EVAL_REAL_EMBED=1` 才解析真 embedding，防 shell 遗留 key 静默走真付费模型），本 run `releaseEvidence=false`，只证明机械管道。 | 已把评测迁到完整迁移库的真实 `hybridQbankSearch`（覆盖 dense 与显式 rrf）+ 完整 question artifact 聚合，并暴露 PG FTS 词法 AND 语义对长问句 0 命中。关闭验收：(a) 注入 `DASHSCOPE_EMBED_API_KEY` 且显式 `QBANK_EVAL_REAL_EMBED=1` 后以真实 512-d embedding 重跑本评测产出语义召回；(b) 词法 AND→OR/部分匹配的取舍单列为 `PRD-TEST-003a` 并经专家审计后，再决定 RRF 是否发布；(c) FINDING：云 PG 专用测试实例 vs 继续 Docker 隔离需用户决策并登记独立 FINDING（对照 PRD-TEST-008 云缺口口径）；三者完成前不勾已验证/已关闭。 |
| PRD-TEST-004 | P1 | ☑ | ☑ | ☐ | ☐ | `rag-adversarial-pg-eval` 自建旧 `vector_chunk`、可见视图和 ANN 查询，却命名为生产检索路径；当前 Worker 使用 generation/recipe/active-pointer 和题目工件二次校验。 | 改名为 legacy compatibility eval，或重建为当前 generation schema、实际检索函数和题目工件读取的评测。验收应证明旧路径无法被误写为当前生产质量。 |
| PRD-TEST-005 | P1 | ☑ | ☐ | ☐ | ☐ | 通用/全格式 RAG 具有控制面与本地 PostgreSQL proof，但没有 rebuild/outbox worker 或 C/B 请求热路径；控制凭据挂载只做启动检查。 | 看板与路线图保持“控制面本地合同，不是 serving 能力”；若交付该能力，新增受限 worker、请求绑定、外送账本、删除/撤权和端到端测试。关闭要求真实请求进入受治理 serving path。 |
| PRD-TEST-006 | P1 | ☑ | ☑ | ☐ | ☐ | `runVoiceAdaptiveInterview` 只由 fake streaming ASR/TTS proof 调用；真实用户路径是批量 ASR、普通/流式 TTS。流式 ASR、服务端 turn-taking 与真实抢话全链未接线。 | 文档只称 Alpha 单轨语音；若要交付全双工/抢话，接入真实 same-origin 流式 ASR、取消/费用/删除边界和浏览器→API→供应商 E2E。关闭要求每一段外送与中止都有实际回执。 |
| PRD-TEST-007 | P1 | ☑ | ☐ | ☐ | ☐ | 在线 Judge 与 120 条离线评测目录是控制面/合成合同；没有生产 scheduler、执行器、人工标注闭环或质量发布接收器。 | 保持 `control-plane only`；若启用，建立受控调度、样本治理、双盲/人工复核、结果封存与发布阈值。关闭不得以 synthetic catalog 或静态 gate 代替线上质量证据。 |
| PRD-TEST-008 | P1 | ☑ | ◐ | ☐ | ☐ | 串行执行器现在有本地 `attempt`/fence、确定计划资源名、intent/OID、终态失败回执、系统 TLS 与证书 pin 的静态合同；只允许最小 database-local case，迁移/vector suite 被运行时拒绝。仍无真实 PostgreSQL 的中断/并发/foreign-sentinel 回归，也无法以 socket 证明控制台实例/VPC，旧 migration/vector happy-path 记录已降为历史。它不能替代 Docker 全套隔离测试。 | 先以受控 profile/TargetGrant 完成实例身份证明、控制库 ACL、真实事务/CAS、强杀恢复、foreign-resource 零删除和清理失败终态；然后在项目独占且可重置 RDS 上连续验证，再逐套迁移 Docker 数据面。 |
| PRD-TEST-009 | P2 | ☑ | ☑ | ☐ | ☐ | 模型 catalog 仍是 `stub:deterministic` 骨架，且未被 invoke 主链消费；它不是模型、区域、提示词版本的生产授权根。 | 标为实验骨架，或让 invoke/网关只从受控 catalog 解析 binding。关闭要求生产模型调用无法绕过 catalog。 |
| PRD-TEST-010 | P2 | ☑ | ☑ | ☐ | ☐ | `rag-demo`、retrieval benchmark 和对抗评测会读本地配置、使用演示/临时结构或离线数据；它们可以提供研究信号，不能证明生产路径、规模或权限。 | 统一命名为 demo/eval/benchmark；若有生产等价目标，单列到 PRD-TEST-003/004/005 的受治理验收，不复用这些脚本的结果作为关闭证据。 |
| PRD-TEST-011 | P1 | ☑ | ☐ | ☐ | ☐ | 记忆主链目前只接入 L3 `episode` 的跨会话精确题面去重，以及 L4 从 ready `assessment_report` 读取弱项维度并做软排序。`user_memory` 虽预留多个 kind 和读取函数，但没有 embedding、语义 Top-K recall、冻结 snapshot、用户确认事实、TTL/撤回或删除闭环；不能称为“长期语义记忆”。 | 若仅交付现状，继续明确称 lean memory；若交付 L5，先定义受控事实来源、purpose/consent、source version、状态/过期、owner RLS、snapshot、向量/缓存撤回与删除 target。验收包含跨 owner=0、撤回后 recall=0、过期不命中、事实 precision/recall 与错误记忆影响评测。 |
| PRD-TEST-012 | P1 | ☑ | ☐ | ☐ | ☐ | 当前上下文管理是任务隔离和按 service 的字符上限：当前题答、检索材料等超限后头部截断并附标记；没有 tokenizer 精确预算、版本化语义摘要、`firstKeptEventId` 或可重放的压缩边界。它不是“上下文记忆压缩”。 | 若产品需要长自由对话，新增可重放的压缩节点：真实 usage/tokenizer 预算、受控摘要、source checksum、CAS 边界、失败降级与删除传播。验收包含事实保留率、错误摘要率、重放一致性、压缩后任务成功率、P95 延迟及撤回残留=0。 |
| PRD-TEST-013 | P0 前置 | ☑ | ☐ | ☐ | ☐ | 记忆没有独立管理控制面：当前 consent 不能撤回/限定 scope，删除 target 不枚举事件、摘要、事实、索引世代、snapshot 和缓存；也没有用户管理命令、最小权限角色、批量重建或审计状态机。 | 先完成 memory control-plane 用例、命令授权、独立状态机、逐 sink deletion receipt 和管理验收；在它完成前，L5 全量会话、摘要、事实和向量索引均保持禁用。 |
| PRD-TEST-014 | P0 | ☑ | ◐ | ☐ | ☐ | 当前模型调用仍按 default/fast 和各适配器分散组合。文本适配器有局部 max-output/budget/price binding；工作树候选 `0088` 已撤销 invocation 直写、加入 deterministic header upsert 和 permit 状态机；`pnpm model-op00:prove` 已于 2026-08-16 在隔离 PostgreSQL 跑绿（89 迁移、exit 0、`releaseEvidence=false`），direct INSERT/非法 terminal/identity mutation/reservation mismatch 被真实低权 SQL 拒绝，且 DB-state 已独立复审关闭（2026-08-16，回执 sha256 与审计文件一致）；六个文本调用面已切 registry operation（scoring/quiz/diagnosis/report/plan/question）；`resume.ocr.v1` 已切 registry 身份并经 `bindResumeOcr` typed binding + 密封 provenance（身份封印，非 host pin；面试 `admitInterviewResume` fail-closed），但 `invoke` 边界仍接受 legacy `logicalNodeKey`；原生 endpoint/key override 与 API/Worker broad native secret 仍可绕过 operation 控制。OCR production kill switch 在 typed binding 存在后仍关，不是非生产或 native adapter 的治理，也不等于 MODEL-OP-01 整项关闭。 | 先验证并独立复审 `MODEL-OP-00-DB-STATE-001`、header concurrent upsert、reservation 的 provider/model/region/revision binding 与真实低权组合根；再完成 01…03 的 typed registry、所有适配器、endpoint allowlist、operation-level secret isolation、账号/区域/模型/租户/项目/operation 共享准入与未登记出口 fail-closed。正例必须全部恰为 1、拒绝例均为 0；随后才按 UC-MODEL-002 建唯一网关。 |
| PRD-TEST-015 | P0 | ☑ | ☐ | ☐ | ☐ | 自适应题目会随作答改变难度，但现有评分是题目均分；没有冻结 rubric、难度/cohort、题目版本、模型版本或 calibration release。现有答案只短暂存在 job payload，题目发出时答案尚不存在，因此不能用单一“已发题合同”冻结 answer；现有 event/question 又可被 runtime 写入并被 C 端多个消费者聚合。即使伪评分入口关闭，也不能把候选人的分数作为同尺度排名。 | 先完成 `INT-TRANSCRIPT-00/01` 的 canonical artifact、删除授权、逐 sink receipt 与删后 read=0；再按 `SCOR-01…08` 建 issue-stage `IssuedQuestionContract`、提交后 `AnswerVersion/ScoreRequest`、delete-wins permit、专用 score-writer、确定性资格/覆盖聚合、金标与人工校准，并同包切除所有 legacy event 消费。INT-TRANSCRIPT-01 诚实登记无 interview 作用域 resolver 的缺口（不伪删、不假称已闭合）：`vector_chunk` kind='memory' 是 owner 级用户内容、归账户轨道；0125 已用独立 sink `memory_vector_chunk` 进账户回执（不改 0093 三 sink 形状，不删 kind='qbank'）。MEM-00（0093）仍只枚举 memory_fact/memory_embedding/memory_context_snapshot。仍未进回执：`user_memory` 正文、`ai_invocation_trace.output`（模型输出 jsonb，无持久 interview 列）。公开 DELETE 保持 503。盘点见 `architecture/ai/privacy-deletion-sink-inventory.md`。`0124` 在 main 是 `0124_rag_retrieval_acl_fail_closed.sql`，不是本 sink。在独立 calibration release 和人工复核前，B 端保持 `assessment_unavailable`、无数值排序、无自动决策。 |
| PRD-TEST-016 | P0 | ☑ | ◐ | ☐ | ☐ | `RAG-FUNNEL-01A` 源码闭包已密封：`qbank_control_definer` 31 函数 + 15 表 + 2 视图（含 bounded reader、security-definer view、词法 helper、pool/cache/epoch trigger）在同一 owner/ACL/RLS/fixed-`search_path` manifest 内；`0094` + `provisionQbankControlDefiner` + 启动目录门禁强制移交。仅 `qbank_curator`、`qbank_cache_epoch`、`qbank_visible_ref` 可由 request 只读。本地 `qbank-handoff-closure:prove` 覆盖移交前 42501、移交后非 42501、raw-read=0、lane(b) 撤销；`0124_rag_retrieval_acl_fail_closed.sql` 与 `0125_memory_vector_chunk_erasure.sql` 已在 main，空 principal → `rag_acl_principal_missing`。本切片新增 `0127_resume_ocr_binding_provenance.sql`（不占用 0124–0126；0126 仍属并行 #74）。`releaseEvidence=false`，不能称云部署可用。该路径更不是独立 `MetadataReviewReceipt` serving。Worker 仍固定以“技术岗”启动；生产 generation/ANN/lexical/RRF/cache/evidence 没有题域硬过滤。岗位 title/description/competencies 也没有生产 route snapshot。相似度无法证明题域不交叉，当前不能宣称岗位能力驱动出题。 | `RAG-FUNNEL-01A` 源码密封已完成（本地 proof，非发布）。保持 `RAG-FUNNEL-01` 未关闭：补审核 receipt serving、完整 facets、经真实组合根验证的标准部署 handoff 回执及七类验证；再实施 `RAG-FUNNEL-02A` canonical projection/实际 provider-input recipe，随后 `RAG-FUNNEL-02B / RAG-EMBED-CACHE-01` durable fill/leader/cost/unknown compute cache；最后进入自动 `JobRouteDecision`、application binding、immutable route snapshot、track-local retrieval/evidence、clean miss 的一次 `QuestionPlan`、检索 cache/provenance/撤销。关闭验收：所有读面 `wrong_track=0`；伪造/缺失 metadata、分类未知、岗位并发修改、旧 checkpoint、generation/撤权竞态、compute/retrieval cache 回放均零跨域出题。 RAG-06（0113）`qbank_route_scope_negative_result` 为 owner 级行、content-free 无 PII 无泄露，但 `privacy_deletion_target.sink` 无本表 sink、账户删除成孤儿，如实登记已知缺口（低严重度，不伪删，参照 0125 `memory_vector_chunk` 与 0096 `ai_invocation_trace` 先例）。 |
| PRD-TEST-017 | P1 | ☑ | ☐ | ☐ | ☐ | 没有生产 RAG 语义/LLM 意图分类器。CRAG 是检索后证据分支，`researchBoundary` 是外发护栏，未接线 `classify()` 骨架不是运行时 router。多题域自由文本未来需要受控建议，但不能替代 PRD-TEST-016 的题域硬过滤。 | 在 `RAG-FUNNEL-07/08` 条件满足后实施规则→轻量模型严格枚举→人工澄清的漏斗；分类结果只建议 allowlisted track，不授予读取/工具权限。关闭验收：规则直达模型调用=0；低置信/unknown/越权=0 检索；同 scope 并发至多一次 attempt；误路由、P95 和成本阈值经生产等价评测冻结。 |
| PRD-TEST-018 | P1 | ☑ | ☐ | ☐ | ☐ | 当前 fundamental 检索未命中会混入 CRAG Web fallback 或普通模型出题，且图可多次 billable ask；没有区分“同桶正常但无合格题”和 degraded/ACL/stale/unknown，也没有 QuestionPlan、同桶 prompt 边界、独立 provenance/rubric/score policy。生成题会与 QBank 证据题一样进入当前评分聚合。 | 实施 `RAG-FUNNEL-05`：仅 clean `no_eligible_in_scope` 可一次派发 `interviewer.ask.qbank_miss`；固定 leaf/blueprint/rubric/score contract，派发后 unknown 不重试；degraded/denied/stale/unknown 的模型与 Web 外发=0；生成题不得自动入 QBank/vector，且在评分校准前 B 端 rank/overall/completion 影响=0。 |

### PRD-TEST-003a · 词法 AND→OR 取舍

> 生产 lexical 通道（`qbank_generation_lexical_search` → `plainto_tsquery('simple')`）对查询全部 term（中文 bigram + ASCII 整词）取 AND，导致长自然问句 0 命中、RRF 对 natural-language paraphrase 无 lexical lift。AND→OR/部分匹配是检索/产品设计决策，本次只登记不擅改；须单独立项并经专家审计后再决定 RRF 是否发布。

| 子项 | 已发现 | 已实现 | 已验证 | 已关闭 | 交付与验收 |
| --- | :---: | :---: | :---: | :---: | --- |
| LEX-01 AND→OR 取舍 | ☑ | ☐ | ☐ | ☐ | 独立评估 `plainto_tsquery` AND 语义对短 term / 改写问句 / 长自然问句的命中行为，明确 OR/部分匹配的目标语义、召回与精度影响，经专家审计后决定是否改生产 SQL；未决前 RRF 的 lexical lift 结论保持 `0 命中、rrf≡dense`，不据此发布 RRF。 |

### PRD-TEST-012 · 超长上下文处理拆分

> 当前自适应面试保持“当前题答 + 覆盖/证据政策收口 + 软预算可上调 + 平台绝对杀开关（默认 120）”的有界模型，不把它改造成无界聊天。固定 8/16 轮产品硬顶已废除；120 是 runaway 护栏，不是质量政策，也不等于 `INT-LONG-INTERVIEW-01`。下表仅在产品确实需要长自由对话时执行；每个子项均须单独完成、验证和关闭，不能只做模型摘要就宣称完成。

| 子项 | 已发现 | 已实现 | 已验证 | 已关闭 | 交付与验收 |
| --- | :---: | :---: | :---: | :---: | --- |
| CTX-01 输入分流 | ☑ | ☐ | ☐ | ☐ | 面试路径继续拒绝或分段处理超长作答，不把摘要用于评分证据；自由对话才进入新的上下文链路。验证超长输入不会改变评分事实。 |
| CTX-02 派发前预算器 | ☑ | ☐ | ☐ | ☐ | 用每模型、每 service 的 `contextWindow`、`maxOutput`、工具 reserve、安全余量计算系统提示、权限快照、schema、工具、RAG、recent turns 和摘要的总预算；请求显式带输出上限。缺权威 tokenizer 时采用保守估算并用返回 usage 校准，预算不足则确定性降级或拒绝。 |
| CTX-03 不可变会话事件源 | ☑ | ☑ | ☑ | ☑ | 为自由对话创建 owner RLS、加密、按 thread/version 追加的业务事件源；checkpoint 只保留事件引用，绝不把 checkpoint 或 trace 反作聊天历史。验证跨 owner=0、恢复不依赖进程内存。删除 sink 闭合（0111）：`conversation_event`+`conversation_event_artifact` 进 `privacy_deletion_target.sink` 枚举；`conversation_event_begin_erasure`/`claim`/`purge` 使状态真达 `active→privacy_fenced→purged` 并物理 DELETE，删后 replay/range_ref/raw SELECT 均 read=0；`conversation_event_transition_status` 接线 `version+1`+`WHERE version=expected` 乐观 CAS（并发单赢家）；`conversation_event_dispatch_replay` 补偿控制（派发/回放前复核 consent/epoch，围栏先赢→voided，防复活）。复用冻结 PrivacyAuthorizationIssuer（0091）与四原语，不重实现删除根。 |
| CTX-04 可验证压缩快照 | ☑ | ☐ | ☐ | ☐ | 每个 snapshot 固化事件范围、原始 checksum、策略/提示词/模型/tokenizer 版本、摘要 hash、claim 到来源 span、`firstKeptEventId` 和状态；原事件不可改写。任何 claim 无法回溯时丢弃摘要，不以模型补全。已知缺口如实登记：本表 owner 级、含明文 `summary_claims.text` 派生摘要 claim 文本（可含 PII）、`privacy_deletion_target.sink` 无本表、账户删除成孤儿，正式删除归 CTX-06（本行下方），参照 RAG-06「已知缺口如实登记」先例（MEDIUM 严重度，不伪删）。 |
| CTX-05 并发与故障恢复 | ☑ | ☐ | ☐ | ☐ | 压缩前保护系统和授权快照、最近完整 turn、完整 tool 调用对；中段才可压缩。以 `(owner, thread, version)` lease/CAS 提交，CAS 失败即丢弃结果；派发后 unknown 不自动重发。 |
| CTX-06 撤回、过期和删除 | ☑ | ☐ | ☐ | ☐ | 摘要、snapshot、向量、缓存和观测索引均有同一 subject/epoch 的撤回与删除 target；删除后新读取/召回为 0，并有每个 sink 的回执。现有完整删除链路未闭合前，不写跨会话摘要或语义记忆。 |
| CTX-07 生产等价验收 | ☑ | ☐ | ☐ | ☐ | 覆盖 8k/32k/128k、中文/emoji、工具结果、RAG、注入、双 resume、provider 返回与 CAS 之间崩溃、unknown、跨 owner 与删除竞态；量化事实保留率、错误摘要率、超窗数、P95 首 token、压缩成本和重放一致性。 |

### PRD-TEST-011 · 全量受控事件、分层摘要与语义召回拆分

> “全量”只指在明确 purpose、consent 和保留期内可追溯地保存业务会话事件；不等于无限期保存，不包含模型内部推理，也不允许把所有原文直接写入向量索引。当前完整删除与授权能力尚未闭合，因此以下项目均不得实现为跨会话生产写入。

| 子项 | 已发现 | 已实现 | 已验证 | 已关闭 | 交付与验收 |
| --- | :---: | :---: | :---: | :---: | --- |
| MEM-00 删除与授权前置 | ☑ | ☐ | ☐ | ☐ | 先闭合不可伪造的删除授权、逐 sink target 和回执；原文工件、摘要、事实、向量、缓存、snapshot、trace 均受同一 privacy epoch 围栏。删除提交后新 recall=0。 |
| MEM-01 全量事件事实源 | ☑ | ☐ | ☐ | ☐ | 建 owner RLS、追加写、按 `(thread, sequence)` 有序的 `conversation_event`；正文为加密工件引用，关系库保存类别、hash、来源、retention、consent/purpose 和 privacy epoch。checkpoint 只保存引用。 |
| MEM-02 单轮与区间摘要 | ☑ | ☐ | ☐ | ☐ | 对连续完整 turn 生成不可变 summary version，保存 source range、原文 digest、prompt/model/tokenizer/policy 版本、摘要 hash 与 claim→source span；摘要校验不通过不得成为上下文。 |
| MEM-03 多层会话摘要 | ☑ | ☐ | ☐ | ☐ | 形成 `turn → segment → session episode` 的摘要树，父节点只引用已验证子节点或事件范围；仅追加新版本，可 supersede/invalidated，禁止原地覆盖。验证能从任一摘要回溯到完整来源。 |
| MEM-04 长期事实治理 | ☑ | ☐ | ☐ | ☐ | 将用户确认、系统可验证观察、模型候选分开；候选不可直接 active。事实含有效期、置信度、冲突/替代关系和来源 span，防止模型自我强化画像。 |
| MEM-05 向量索引与召回 | ☑ | ☐ | ☐ | ☐ | 向量只作候选召回，不是真相源；先以 owner、purpose、consent、privacy epoch、状态、时间窗过滤，再做 hybrid Top-K/MMR。命中必须回水合经授权的来源卡片及 provenance，不能只把 embedding 命中直接塞进 prompt。 |
| MEM-06 冻结 ContextSnapshot | ☑ | ☐ | ☐ | ☐ | 每次模型请求冻结选择到的 event/summary/fact 版本、检索策略、预算和渲染 digest；同轮恢复复用同一 snapshot，下一轮才可看见新的活状态。 |
| MEM-07 注入、冲突与并发 | ☑ | ☐ | ☐ | ☐ | 原文、摘要和召回片段统一作为不可信数据包裹；压缩按 `(owner,thread,range,version)` lease/CAS，重叠范围或过期写入拒绝。验证 provider unknown 不自动重发。 |
| MEM-08 质量与隐私验收 | ☑ | ☐ | ☐ | ☐ | 用人工标注集测 fact precision/recall、错误召回影响、冲突处理和上下文任务成功率；验证跨 owner=0、过期/撤回/删除后 recall=0、每层派生物物理清理有回执。 |
| MEM-09 生命周期触发策略 | ☑ | ☐ | ☐ | ☐ | 将事件落库、候选摘要、强制压缩、长期事实写入、embedding 和 recall 分为独立触发器；强制压缩只在派发前总预算超限时运行，长期事实只由用户确认或受信业务事实激活。验证半 turn、未知工具、撤回后、预算不足和 provider unknown 均不产生错误派生物或重发。 |
| MEM-10 管理控制面 | ☑ | ☐ | ☐ | ☐ | 定义用户查看/确认/纠正/暂停采集/单条遗忘/会话删除/导出，以及运营策略发布、受控原文访问、批量 reindex、过期与删除任务的命令、角色、状态机和审计。不提供通用管理员直读或直改入口。 |
| MEM-11 索引 generation 与缓存治理 | ☑ | ☐ | ☐ | ☐ | embedding/reindex 从冻结且仍授权的 source manifest 构建独立 generation，经验证后 CAS 切换；撤回/删除使相关 generation、检索缓存、来源水合缓存与 snapshot 同步失效。验证旧索引和缓存不能恢复已撤回内容。 |
| MEM-12 准入、来源与范围元标签门 | ☑ | ☐ | ☐ | ☐ | 在任何跨会话写入前，服务端验证 `dataSubject/controllerScope/accessPrincipalContext/thread-project boundary`、purpose、consent revision、privacy epoch、保留期、来源不可变版本/digest/span、数据分类和 producer/recipe；当前 `user_memory` 不具这些字段，不能扩写后直接上线。验证伪造 owner/purpose/project/sourceId/factKey、C/B 混用、Unicode span/digest 不符均零写入。 |
| MEM-13 冲突、时效与长期事实判定 | ☑ | ☐ | ☐ | ☐ | 为长期事实定义稳定 `factKey`、分类、单/多值规则、`contradicts/supersedes`、有效期和状态机；将 `sourceTrust`、抽取置信、人工确认、freshness、salience 与 retrieval score 保持独立。模型只能写 candidate；过期、冲突或未确认内容不得 active。验证 100 并发确认/纠正/撤回后至多一个单值 active。 |
| MEM-14 两阶段召回与派发前复核 | ☑ | ☐ | ☐ | ☐ | 第一段在数据库按 scope、purpose、consent、privacy、状态、时效、数据分类和 generation 作硬过滤后才检索；第二段水合来源并重验 digest/span/RLS/授权/冲突/预算，随后冻结 ContextSnapshot。验证 vector/cache 命中后撤回、删除、过期、成员变化或来源修订时模型输入与派发均为 0；不得全局 Top-K 后应用层过滤。 |

### PRD-TEST-014 · 模型操作路由、成本与降级拆分

> 先让现有调用**可解释、可限额、可降级**，再建唯一模型网关。单一供应商 Key 不是安全边界，也不能替代 operation registry、授权快照、共享容量或派发后的未知结果治理。

| 子项 | 已发现 | 已实现 | 已验证 | 已关闭 | 交付与验收 |
| --- | :---: | :---: | :---: | :---: | --- |
| MODEL-OP-00 真实预算与账本一致性 | ☑ | ◐ | ◐ | ☐ | 文本适配器已将批准且不可变成本策略的最大输出下传到供应商，并拒绝请求模型/策略模型错配；受管文本端点在 claim/预留/HTTP 前对实际 rendered system/user、图片 descriptor/reserve 与结构化输出 reserve 做保守窗口预算。请求摘要、启动低权断言及文本费用 reserve 精确绑定 provider/model/region/price revision，旧“取最新价格”的运行时入口已撤权。`0085` 的历史 header/slot 只保护一条更新；`0088` 的完整状态机候选已于 2026-08-16 经真实低权 PostgreSQL 回归跑绿（`pnpm model-op00:prove`，89 迁移、exit 0、`releaseEvidence=false`）。RAG 与 tool reserve 已由类型化 component ledger（`planContextBudget`/`ContextBudgetPlan` 预算器分解）独立分账，`toolReserve` 计入 `availableInput` 公式；snapshot、recent、summary 属 L5 未接线，仍只要进入渲染字段即被总量覆盖。真实 tokenizer 校准仍未完成（estimate 穿线 + 纯版本化校准模块 + 低估 flag 已建，异步 reconciler 未接线）；registry 对 node identity 的服务端重算、所有 provider 适配器与共享准入仍未完成。所有本地回执均 `releaseEvidence=false`。 |
| MODEL-OP-01 统一 operation binding | ☑ | ◐ | ◐ | ☐ | **OCR 窄切片已接线（非关闭整项）**：`resume.ocr.v1` 经 `bindResumeOcr`/`visionOcr` 取得冻结 Beijing **identity** + 密封 provenance（身份封印，非 host pin / 非哈希链）；面试 `admitInterviewResume` 在图片源缺 binding 时 fail-closed；worker/面试图零 `visionOcr`。生产 OCR 组合根仍 `OCR_ENABLED` kill-switch（binding 存在也不开）。chat 六个文本面走 registry operation，但 `invoke` 仍接受 legacy `logicalNodeKey`。ASR/TTS/embedding/rerank/signed-download 仍 unwired；媒体预算、删除、脱敏视觉回执、共享准入未完成。禁止 raw prompt / provider URL / 未知字段已在 binding 层证明。`pnpm model-op01:prove` 为本地静态证据，`releaseEvidence=false`。 |
| MODEL-OP-02 共享容量与费用准入 | ☑ | ☐ | ☐ | ☐ | 默认/快/视觉/语音/embedding 的准入按账号、区域、模型或 recipe、tenant/project、operation 汇总，而非每进程独立桶；并发压力下总许可不超限，拒绝与冻结均可观察。 |
| MODEL-OP-03 节点矩阵与业务降级 | ☑ | ☐ | ☐ | ☐ | 确定性节点模型调用=0；每个逻辑节点有总派发次数；评分、题目、OCR、语音、RAG 和记忆候选分别走已定义降级，派发后 unknown 自动重发=0。 |
| MODEL-OP-04 唯一模型网关 | ☑ | ☐ | ☐ | ☐ | 仅在 UC-MODEL-002 的授权 snapshot、outbox、attempt、删除/保留、流会话、独立凭据与网络出口全部完成后实施；API/Worker 不再持供应商 Key。 |

### PRD-TEST-014a · 百炼非生产配置与真实调用边界

> 该清单只解决“以小额度、非敏感输入验证已批准 operation 的供应商兼容性”。它不能替代 `MODEL-OP-00…04`，也不能把测试 Key 变成生产网关凭据。

| 子项 | 已发现 | 已实现 | 已验证 | 已关闭 | 交付与验收 |
| --- | :---: | :---: | :---: | :---: | --- |
| BAILIAN-00 工作空间边界 | ☑ | ☑ | ◑ | ☐ | 已有项目专用非生产空间的控制台核验；默认测试空间 Key 仅可作本机一次性 smoke，不可据此宣称子空间隔离。 |
| BAILIAN-01 模型/区域/价格 revision | ☑ | ☐ | ☐ | ☐ | 每个候选模型的可用性、区域、计量单位与价格 revision 必须由控制台核对并写入受控非密配置。 |
| BAILIAN-02 预算与告警 | ☑ | ☐ | ☐ | ☐ | 测试总额、单日/单 run 上限和告警必须先于扩大模型能力；额度不足保持 `not_run`。 |
| BAILIAN-03 Key 保存边界 | ☑ | ☑ | ◑ | ☐ | 本机一次性测试 Key 仅保存于受控钥匙串；它不进入 API/Worker、CI、镜像、回执或受管文档。需在轮换后复验无旧 Key 残留。 |
| BAILIAN-04 endpoint/TLS/区域 | ☑ | ☐ | ☐ | ☐ | endpoint 由受控部署配置提供；拒绝 URL query、片段、任意备用 URL 和跨区域 endpoint。 |
| BAILIAN-05 最小文本 smoke | ☑ | ☑ | ◑ | ☐ | 固定非敏感三档文本和受控客户端调用已有脱敏回执；单次兼容性不证明子空间、统一网关、生产容量或费用封顶。 |
| BAILIAN-06 专用能力 smoke | ☑ | ☐ | ☐ | ☐ | 视觉、embedding、ASR、TTS、流式能力逐项单独验证；未获准或无对应 operation/隐私/计量契约的能力保持关闭。 |
| BAILIAN-07 轮换与撤销 | ☑ | ☐ | ☐ | ☐ | 旧 Key 失效即 fail-closed；轮换后无旧 Key 残留。任何真实模型 smoke 均 `releaseEvidence=false`。 |

## 3. 证据索引

| ID | 主要代码证据 | 当前事实来源 |
| --- | --- | --- |
| PRD-TEST-001 | `apps/api/src/modules/interview/interview.controller.ts`、`apps/api/src/modules/interview/interview.service.ts`、`apps/worker/src/main.ts`、`packages/db/src/recruiter.ts` | 当前运行时事实矩阵与本登记册；该问题发现后，在修复前不允许把旧 `/answer` 作为生产作答接口。 |
| PRD-TEST-002 | `packages/ai-runtime/src/search.ts`、`packages/ai-runtime/src/retrieval.ts` | `architecture/ai/rag-corpus-lifecycle.md`、RAG 检索评测基线。 |
| PRD-TEST-003 | `apps/worker/test/qbank-retrieval-eval-pg.proof.ts`、`apps/worker/smoke/qbank-retrieval-eval.ts`(旧近似)、`packages/db/src/qbank-generation-retrieval.ts` | `architecture/current-runtime-truth.md` 的题库检索行；`.tmp/isolated-proof-receipts/` 的 `qbank-retrieval-eval:prove:raw` 回执。 |
| PRD-TEST-004 | `apps/worker/smoke/rag-adversarial-pg-eval.ts`、`apps/worker/src/main.ts` | `architecture/ai/rag-corpus-lifecycle.md`。 |
| PRD-TEST-005 | `apps/worker/src/main.ts`、`packages/db/src/rag-corpus-versioning.ts` | `architecture/ai/rag-corpus-lifecycle.md`。 |
| PRD-TEST-006 | `apps/worker/src/voice-adaptive.ts`、`apps/worker/test/voice-adaptive.proof.ts`、API voice composition root | `architecture/ai/voice-capability-boundary.md`。 |
| PRD-TEST-007 | `packages/ai-runtime/src/evaluation-manifest.ts`、offline evaluation runner、online-judge control proof | `architecture/ai/agent-observability-evaluation-runtime.md`。 |
| PRD-TEST-008 | `apps/worker/src/cloud-test-run-ledger.ts`、`apps/worker/src/cloud-test-serial.ts` | 云运行时迁移用例与云测试矩阵。 |
| PRD-TEST-009 | `packages/ai-runtime/src/catalog/index.ts`、`packages/ai-runtime/src/invoke.ts` | `architecture/ai/agent-runtime.md`。 |
| PRD-TEST-010 | `apps/worker/smoke/rag-demo.ts`、`apps/worker/smoke/retrieval-benchmark.ts`、`apps/worker/smoke/rag-adversarial-eval.ts` | RAG 检索评测基线。 |
| PRD-TEST-011 | `apps/worker/src/memory-service.ts`、`packages/db/src/memory-store.ts`、`apps/worker/src/adaptive-interview-service.ts` | `architecture/ai/memory-context-design.md`、`architecture/ai/tool-skill-memory-runtime-design.md`。 |
| PRD-TEST-012 | `packages/ai-runtime/src/model-client.ts`、`apps/worker/test/context-window.proof.ts` | `architecture/ai/memory-context-design.md`、`architecture/ai/agent-runtime.md`。 |
| PRD-TEST-013 / MEM-12…14 | `packages/db/src/memory-store.ts`、`apps/api/src/modules/privacy/privacy.service.ts`、当前 RLS/principal 路径 | `requirements/use-cases/memory-governance-and-recall.md`、`architecture/ai/memory-context-design.md`。 |
| PRD-TEST-014 / MODEL-OP-00…04 | `packages/ai-runtime/src/model-client.ts`、`invoke.ts`、`catalog/index.ts`、`apps/worker/src/interview-service.ts`、API OCR/voice composition roots | `requirements/use-cases/model-operation-routing.md`、`architecture/ai/model-operation-routing.md`、`requirements/use-cases/model-invocation-reliability.md`。 |
| PRD-TEST-015 / SCOR-01…08 | `apps/worker/src/adaptive-lifecycle.ts`、`packages/domain/src/assessment.ts`、`packages/db/src/interview-question.ts`、`packages/db/src/recruiter.ts` | `requirements/use-cases/interview-scoring-measurement.md`、`architecture/ai/scoring-measurement-runtime.md`。 |
| PRD-TEST-016 / RAG-FUNNEL-01…06 | `apps/worker/src/main.ts`、`apps/worker/src/qbank-generation.ts`、`packages/ai-runtime/src/embedder-cache.ts`、`apps/worker/src/interview-consumer.ts`、`apps/worker/src/adaptive-interview-service.ts`、`packages/db/src/qbank-generation-retrieval.ts` | `requirements/use-cases/rag-funnel-intent-routing.md`、`architecture/ai/rag-funnel-routing.md`、`architecture/ai/rag-corpus-lifecycle.md`、当前运行时事实矩阵。 |
| PRD-TEST-017 / RAG-FUNNEL-07…08 | `packages/domain/src/crag.ts`、`packages/domain/src/research-policy.ts`、`packages/ai-runtime/src/router/index.ts` | `architecture/ai/classifier-router-tier.md`、`requirements/use-cases/rag-funnel-intent-routing.md`。 |
| PRD-TEST-018 / RAG-FUNNEL-05 | `apps/worker/src/adaptive-interview-service.ts`、`packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`、`packages/db/src/interview-question.ts`、`packages/db/src/recruiter.ts` | `requirements/use-cases/rag-funnel-intent-routing.md`、`architecture/ai/rag-funnel-routing.md`、评分运行时设计。 |

## 4. 执行顺序

1. **先止血：** PRD-TEST-001。它是公开 API 可写入虚假业务评分的 P0；未修复前，B 端评分与报告不可信。
2. **先建立答案/删除事实根，再建立评分测量与校准：** `INT-TRANSCRIPT-00/01` 是 PRD-TEST-015 及其 `SCOR-01` 至 `SCOR-08` 的 P0 前置；在此之前不创建 ScoreCard 写路径。B 端继续保持数值评分暂停和人工复核，不用题目均分排名。
3. **再校正生产口径与测试等价性：** PRD-TEST-002、003、004、006、009、010。优先去除“生产”命名和错误发布依据；不以重命名替代真实接线。
4. **先建立记忆治理前置：** PRD-TEST-013 及其 `MEM-00`、`MEM-10` 至 `MEM-14`。删除授权、范围/来源准入、冲突/时效、两阶段召回与管理控制面未闭合前，不得开启 L5 生产写入。
5. **再收敛模型出口与成本：** PRD-TEST-014 及其 `MODEL-OP-00` 至 `MODEL-OP-03`。先把当前每一种可达调用纳入统一操作契约；网关 `MODEL-OP-04` 只有在授权、删除和运行时恢复闭合后才开始。
6. **最后建设能力：** PRD-TEST-005、007、008、011、012、016、017、018。题域 metadata、快照和 SQL 硬过滤先于同桶无题模型生成；同桶生成的 provenance/rubric/评分隔离先于自由文本分类。它们需要新的运行时、数据面或云故障验收，不应借现有 proof 直接打钩。

## 5. 每次整改的提交要求

- 先在本登记册对应 ID 下补充设计链接、变更范围与验收场景；P0/P1 还必须经过对抗审计。
- 实现完成后只勾选“已实现”；运行时验收与复审通过后才能继续勾选。
- 如果一项被拆分，保留原 ID，并追加子项（如 `PRD-TEST-003a`）；不得删除或降级旧风险。
- `current-runtime-truth.md`、backlog、路线图、ADR 与本登记册发生冲突时，先以代码和运行回执校正，再更新所有文字。
- 每次能力状态变化同步更新：运行事实矩阵、相关架构/用例/验收文档，以及对应面试题材料。过程型深问、反例和口述答案写入 `.tmp/qa-bank/`；只有稳定、可复核且不泄露内部策略的内容才进入正式 `ai-docs` 面试题库。未接线能力必须在两类材料中均标明边界。
