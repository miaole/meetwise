---
id: architecture_ai_rag_funnel_routing
name: 题库 metadata、岗位意图分类与受控检索
description: 从摄取时层级 metadata，到岗位自动路由、面试快照、按叶节点检索、clean no-result 的同桶 LLM 出题、缓存和证据二次验证的统一边界；分类器不授予数据能力。
type: architecture
scope: shared
level: must
status: target
owner: architecture
related:
  - ../../requirements/use-cases/rag-funnel-intent-routing.md
  - ./classifier-router-tier.md
  - ./rag-corpus-lifecycle.md
  - ./model-operation-routing.md
  - ../current-runtime-truth.md
---

# 题库 metadata、岗位意图分类与受控检索

## 1. 正确的依赖方向

题库中的 Node.js、Java、Go、Python、前端、测试和 AI 题不能凭向量相似混合。边界首先存在于内容进入题库时，而不是由岗位界面事后补标签：每个可检索 question/chunk projection 在 embedding 前必须具备审核过的层级 `servingScopeId`。岗位分类器的职责只是在这些已存在的叶节点之间自动决定范围；它不能创造 scope、扩大 corpus 或授予读取权限。

```text
来源 hint -> 结构切块 -> 审核 metadata/servingScopeId -> artifact hash
       -> canonical provider input -> recipe-bound embedding compute cache
       -> question-aware generation projection/embedding
                                                        |
岗位 title + description + competencies -----------------+
                                                        v
                         rules -> small strict classifier -> JobRouteDecision
                                                        |
                                     route_decided only v
          ApplicationRouteBinding -> InterviewRouteSnapshot(leaf allocations)
                                                        |
                   deterministic scheduler selects one leaf per turn
                                                        |
        RetrievalPlan -> leaf-local ANN / lexical / RRF / cache -> evidence recheck
                              | clean no-result                 | eligible evidence
                              v                                 v
               QuestionPlan -> same-leaf LLM issue       qbank evidence issue
                              |
                    generated provenance + score exclusion
```

当前事实仍与完整目标不同：Worker 固定传入“技术岗”；没有 `JobRouteDecision`、application binding 或 snapshot；generation/retrieval/cache/evidence 没有 track 条件。当前局部无命中还会混入 Web/普通 LLM 出题，且没有 clean no-result 判定、QuestionPlan、同桶约束、rubric 或 B 端评分隔离。

`0086`、`0087` 与 `0089` 完成了这张图最前端的控制面基础：v1 taxonomy、executor annotation/hash、release leaf 校验。`RAG-FUNNEL-01A` 已把 `qbank_control_definer` 依赖闭包扩到 **31 函数 + 15 表 + 2 视图**（含 bounded reader、`qbank_retrieval_candidate` / `qbank_visible_ref`、词法 helper、pool/cache/epoch trigger），由 `principal.ts` 启动门禁与 `0094` + `provisionQbankControlDefiner` 强制同一 owner/ACL/RLS/fixed-`search_path`。`qbank_curator`、`qbank_cache_epoch`、`qbank_visible_ref` 是清单中刻意允许的 request 只读面；不得靠补回 raw-table GRANT 打通其余底表。本地 `qbank-handoff-closure:prove` 证明移交前 42501、移交后非 42501、raw-read=0 与 lane(b) 撤销；`0124_rag_retrieval_acl_fail_closed.sql` 把 generic RAG 空/空白 principal 的 bind/resolve/search/evidence 收成 `rag_acl_principal_missing`（`0124` 已在 main；本 PR 只新增 `0125_memory_vector_chunk_erasure.sql`）。域 ACL 谓词未接线，不得写成双层已闭合。`releaseEvidence=false`，本机 Docker 不可用时当前树没有新的标准部署回执。executor annotation 仍不是人工 `MetadataReviewReceipt` serving。本地 03–07 合同 proof 不是生产 Worker 接线。因此这张图对 routed 出题仍是目标态，不能据此称题域隔离已经 serving。

## 2. 五道不可互相替代的防线

| 防线 | 受控输入 | 强制位置 | 失败语义 |
| --- | --- | --- | --- |
| 内容 metadata | artifact、chunk、canonical leaf、hash、taxonomy version | QBank 审核/控制面/generation builder | 缺 metadata/冲突/未审核 projection=不发布、不 embedding。 |
| 岗位意图路由 | title/description/competencies 的 immutable revision | job route worker + 分类 operation | low-confidence/unknown/过宽=job `interview_ineligible_route`，不能启动。 |
| 检索 | snapshot allocation、单一 leaf、generation、competency、difficulty | PostgreSQL scope projection、ANN/词法/RRF/distance/cache | track 不符=0 行；不允许先全局 Top-K。 |
| evidence/issue | leaf、artifact hash、generation、RLS、epoch、route digest | evidence reader、question persistence/outbox | 任一复核失败=不 prompt、不发题、plan voided。 |
| clean no-result fallback | completed eligibility verdict、QuestionPlan、已批准 blueprint/rubric | model operation、question projection、评分资格门 | 仅本 leaf 真的无 eligible QBank question 才可模型出题；degraded/denied/unknown=零外发。 |

`servingScopeId`、job route 和 snapshot 都不是 C/B、tenant、project、purpose、consent 或 privacy epoch 的替代品；这些授权条件在候选检索和 evidence 水合时仍须各验证一次。

## 3. 题库 metadata 先于模型和岗位

### 3.1 taxonomy 与继承

- taxonomy 是版本化树。v1 至少包含 `backend/nodejs`、`backend/java`、`backend/go`、`backend/python`、`backend/general`、`frontend/web`、`qa/quality_engineering`、`ai_ml/applied`。
- source 的标签只是 hint；mixed document 的各 chunk 必须独立审核。没有“source=backend，所以每个 chunk 都是 backend”的继承规则。
- artifact 有一个 canonical leaf 和受控 secondary facets（competency、technology、difficulty、seniority、kind、language）。可路由 metadata 进入 artifact hash。
- raw chunk 可以被不同题目使用。generation 应形成 `(generation, artifact/question, ref, servingScopeId)` projection；不能给 `qbank_chunk.ref_id` 写一个全局 track。
- `backend/general` 是独立审核叶节点。它仅按 taxonomy manifest 允许的目标生成 projection，永远不是 Node.js/Java/Go/Python 的隐式并集。
- 历史未标注或冲突工件为 `legacy_unrouted`，不能由批量模型猜标签后直接 serving；应审核、重建 generation 或隔离。

### 3.2 检索和 provenance

一次 `RetrievalPlan` 冻结：

```text
snapshotId, routeScopeDigest, leafTrackId, taxonomyVersion,
competencyId, difficulty, seniority, questionKind,
generationId, recipeId, policyVersion
```

cache key、singleflight key、ANN/lexical/RRF/distance、evidence reader、metrics 和 question provenance 都使用同一个 route scope。任何 cache 命中在变成模型材料前，都必须验证：

```text
snapshot leaf == plan leaf == artifact metadata leaf == generation projection leaf
AND generation/source/RLS/purpose/consent/privacy predicates hold
AND artifact/content metadata hashes match
```

失败就不写 `question_ready`，也不扩大到同父节点的语言 sibling 或全库。

### 3.3 embedding computation cache 不等于检索缓存

目标态的 generation builder embedding compute cache 位于 metadata 审核之后、projection 写入之前。当前不存在此 Redis/Tair cache：现有 Redis 只缓存 retrieval hits，Worker 仅有进程内 `Map` 优化 seam。compute cache 只可复用相同计算的无主浮点数，不能决定一个 chunk 是否属于某 leaf、是否对某主体可见，或一个 generation 是否可激活。

首个 QBank 切片只允许 `global-approved-qbank` scope。key 是 `HMAC(scope + exactRecipeDigest + SHA-256(actualCanonicalProviderInputBytes))`；`exactRecipeDigest` 必须包含实际 provider/deployment、model/revision、dimension、normalization、document transform/chunker、metadata input profile 和 codec/schema。`generationId`、route、owner、tenant、raw content 或截断 hash 均不能作 cache identity。value 只含 schema、recipe/input digest、dimension、float32 向量、checksum 与独立 HMAC，任何验签/维度/有限数校验失败都是污染，不是 miss。

目标态的 compute cache miss 必须先以同一 opaque identity 写 PostgreSQL durable fill intent、成本预留和 dispatch slot；Redis 锁仅合并并发。只有仍可证明未派发的 fill 才能一次受控直连 provider；`dispatching` 的 response-loss/timeout 为 `unknown`，`provider` 成功但 Redis 写失败为 `succeeded_uncached`，两者均不得自动新建 fill 或再次收费。cache hit 仍要在本 generation 写独立 projection，并经过 metadata、source、epoch、RLS、撤回和 generation validation；Redis 不能恢复、激活或授权任何 vector row。

私有/组织语料不可因“缓存的是浮点数”自动获得跨租户复用资格。只有 future policy 明确定义 tenant、visibility、consent、region/egress 和删除 receipt 后才可能允许；在此之前 read/write 均为 0。

## 4. 自动岗位意图分类器

### 4.1 输入、输出和状态

分类器的业务输入只有岗位语义版本：title、description、competencies 的 canonical digest/HMAC。它不读取简历、面试回答、其他租户数据或任意 QBank 正文。创建/编辑岗位时自动写 `JobSemanticRevision -> route_pending`；用户没有 `trackId`、weight、confidence 或 override 字段可提交。

分类按下列漏斗自动运行：

| 阶段 | 调用次数 | 结果 |
| --- | :---: | --- |
| 规则 | 0 | 唯一 leaf 时直接 `route_decided`。 |
| 小模型 `job_route_classify` | 最多 1 | 严格 enum leaves、allocations、confidence/margin 与原因码。 |
| 服务端验证 | 0 | taxonomy/facet/校准/max-leaf/min-allocation 全部通过才 `route_decided`。 |
| 未决 | 0 | `route_unresolved` 和 `interview_ineligible_route`；只提示补充岗位信息。 |

模型输出的多叶 allocation 权重以 basis points 表达并总和=10,000。数量、最小权重、置信度阈值和 margin 属于冻结 calibration policy；超出即未决。分类器不能让“全栈”展开为所有语言桶：只有该语义被自动解析为少量、允许的 leaves 时才成功；技术栈不足的全栈描述只落到显式 general leaves 或 `route_unresolved`。

状态机为：

```text
semantic_revision -> route_pending
  -> rule_decided -> route_decided
  -> model_prepared -> result_validated -> route_decided
                    -> known_not_sent | dispatched_unknown -> route_unresolved
  -> invalid/low-confidence/too-broad/conflict -> route_unresolved

route_decided -> application_bound -> interview_snapshotted
```

同一 `(job, semantic revision, taxonomy, policy)` 最多一次外发。`dispatched_unknown` 永远不自动重发；只有 title、description 或 competencies 变更形成的新 revision 可再次分类。分类 operation 必须遵从 `MODEL-OP-00/01` 的 typed binding、预算、attempt、secret 和 unknown 语义。

### 4.2 application、snapshot 与图

申请/受邀事务只可绑定 `route_decided` 的版本；面试启动事务复制 `ApplicationRouteBinding` 到 immutable `InterviewRouteSnapshot`。岗位后来编辑不会改变旧 application/interview。

图内 planner 不能再以自由 `role` 决定能力或桶。它的输出必须是 `{leafTrackId, competencyId, difficulty}`，由服务端校验属于 snapshot。每轮由确定性 weighted-deficit scheduler 选择一个 leaf；多桶岗位是“按轮配额”，不是一次混合检索。

## 5. 已冻结 leaf 无题时的 LLM fallback

`no_eligible_in_scope` 不是“相似度低”或“请求报错”的别名。它只在如下条件同时为真时产生：scope-bound retrieval 正常完成、generation/recipe 仍 active、RLS/授权/隐私围栏通过、evidence 二次校验完成，而候选集确实为零。缓存/embedding/数据库故障、generation stale、来源撤销、ACL 拒绝、超时、预算拒绝与派发 unknown 分别保留其错误语义，模型/Web 外发为零。

对 clean no-result，Worker 创建不可变 `QuestionPlan`，冻结：`snapshotId`、route-scope/taxonomy digest、唯一 leaf、competency/difficulty、generation、eligibility verdict digest、blueprint、rubric/score policy、prompt/schema/model policy 和 idempotency digest。一个 plan 最多派发一次 `interviewer.ask.qbank_miss`。它只接收上述受控字段与已发题 digest avoid set；不接收 raw job 描述、简历、回答、QBank 正文、跨桶候选或 Web 内容。

模型只可输出结构化题文和 blueprint focus。服务端验证 leaf 语言、长度、非引导、去重和 schema，并绑定已有版本化 rubric/score policy；模型不能创建 tag、rubric、source 或权限。题目以 `origin=llm_qbank_miss` 落账，记录脱敏 plan/scope/generation/eligibility/prompt/schema/rubric/score-policy/attempt/cost digest，且 `refs=[]` 不得被展示为题库证据。

已派发后 unknown 永不自动重发或换题。模型已知失败时，才可走已批准同 leaf 确定性模板或 `generation_unavailable`。生成题不自动进入 QBank、向量或 generation；希望复用时必须重新走策展审核、artifact revision 和 generation 发布。当前评分合同未校准，因此首期 generated fallback 必须 `review_required/score_excluded`：它不能驱动 B 端 overall、排名、录用或完成门。

## 6. 运行与发布标准

| 指标/断言 | 含义 |
| --- | --- |
| `wrong_track_count = 0` | planner、dense、lexical、RRF、cache、evidence、question ledger 全部为零。 |
| `unrouted_artifact_served = 0` | 历史/未标注/冲突工件没有进候选或 prompt。 |
| `unresolved_route_start_count = 0` | 未决岗位绝不启动题库面试。 |
| `qbank_miss_misfire_count = 0` | eligibility 为 degraded/denied/stale/unknown 或已有同桶题时，LLM/Web fallback=0。 |
| generated fallback 评分影响=0 | 在 scorecard 校准完成前，`llm_qbank_miss` 不能改变 B 端 overall/rank/completion。 |
| compute-cache 错误复用=0 | recipe/input/HMAC/dimension 不符、非 global approved scope、unknown 或撤回中的 cache value 不写 projection、不激活 generation、不触发第二次 provider send。 |
| 规则命中率、模型升级率、未决率 | 防止每个岗位都产生付费调用或被错误路由。 |
| 每 leaf Recall@K/nDCG/no-answer | 题域收窄后分别校准检索质量。 |
| route/fallback P95、每千岗位成本、unknown 率 | 分类和无题 fallback 不会吞掉招聘流程成本与延迟。 |

发布验证需要完整迁移 PostgreSQL、真实 Worker 组合根、受控模型 transport，覆盖 Node.js/Java/Go/Python sibling、混合 source、共享 chunk、多叶岗位、模糊全栈、低置信/unknown、岗位编辑并发、旧 snapshot/cache、撤权/epoch。内存相似度、全局 Top-K mock 或只显示 UI 标签不是数据面证据。

## 7. 渐进交付与回滚

1. 先发布 taxonomy、artifact/chunk metadata 和 immutable receipt；无 `servingScopeId` 的工件不进入新 generation。
2. 再建立 question-aware scope projection 与 recipe-bound embedding compute cache；只有已审核 global QBank input 可复用数值，SQL/evidence/result cache 继续做 scope 硬过滤，隔离历史未标注 generation。
3. 然后实现自动 `JobRouteDecision`、application binding、interview snapshot 和 typed planner/scheduler；删除固定“技术岗”输入。
4. 接入 eligibility verdict、`QuestionPlan`、同桶 LLM fallback、独立 provenance 与评分隔离；在这之前保留“无可信题即不可用”，不复用当前 generic fallback。
5. 最后才为其他自由文本入口复用同一分类 operation；没有可靠 metadata 或未决 route 时始终零检索。

回滚只影响新的 job semantic revision、taxonomy/policy 或 generation pointer。已绑定 application/interview 继续读其历史 snapshot，除非授权/隐私围栏撤销；回滚不能将范围扩大到全库。
