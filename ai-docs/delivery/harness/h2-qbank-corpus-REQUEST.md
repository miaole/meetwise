# H2 QBANK-CORPUS REQUEST（题库语料大块 EXEC 任务书 · 批2 · L 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工）

**席位**：H2 QBANK-CORPUS EXEC 任务书起草席（北星 loop · 批2 · L 体量 · 题库语料大块）。
**基线**：`feat/mysql-schema-skeleton` @ `20186718`（主线最新 tip·`git log -1` 实测·H3 LEVEL-SCHEME nail 卷即本 tip）。分支 `line/h2-qbank-corpus`·工作树 `meetwise-h2q`（`git -C meetwise worktree add ../meetwise-h2q -b line/h2-qbank-corpus 20186718` 本起草席已立）。
**蓝本**：①批残留清点 `batch-residual-plan.md`（meetwise-line-entpay 树 @`ab02d499`）H2 组行 `:97` + 批2 残余表 `:54`（#75-#79 = QBANK-CORPUS 刀：题库导入工具+1-5 难度+检索过滤+近重复·#75 P1 题库贫瘠为本批最大缺口）②审计 issues-master 全行（**更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md`·#75:202 / #76:336 / #77:337 / #78:469 / #79:338 / #202:347·**修法列逐字誊录见 §2**）③H7 挂账行 `batch-residual-plan.md:102`（#200/#201/#202/#213 为 AI 质量面·**建议 H2/H4 立项时顺手收编**——本刀收编 #202·#200/#201/#213 仍挂账）④TASK-SOP-v2 `:59`（QBANK-CORPUS=导入工具+1-5 难度+检索过滤+近重复）。

## §0 任务一句话

按 issues-master 更正版 #75-79 修法列逐条固化：**题库导入工具与审核流程（#75）+ 逐题 rubric/追问数据面（#76）+ 难度 1-5 谱扩展与检索 difficulty 过滤参数（#77）+ 导入时近重复检测与人工复核（#78·非向量形）+ 检索面扩展 scenario 等题型/查询带岗位技术栈/排除已问题（#79）**，并顺手收编 **#202：C 端检索面从旧 recruiter snapshot 表切候选人路由（candidate-route）**。生产题库从「33 条种子 / 难度仅 3-4 两档 / fundamental 单题型 / 旧快照表直读」→「多 scope 导入供给 / 逐题 rubric / 1-5 全谱 + 池级难度过滤 / 候选人路由检索」。**RAG 决策面与 embedding 计算零触（§4）·est live=0。**

## §1 现状盘点（起草席亲读·base `20186718`·file:line 实测）

### 1.1 题库语料（#75 症状面）

| 面 | 实测 |
|---|---|
| 种子量 | `apps/worker/src/qbank-seed.ts:9-56` `QBANK_SEED_SOURCE` 实数 **33 条** refId（`sed -n '9,56p' | grep -c 'refId:'`=33·起草席实数非转抄） |
| scope 覆盖 | `qbank-seed.ts:64-69` `bootstrapScope` 仅三值：`backend/general`·`backend/java`（jvm/concur 前缀）·`ai_ml/applied`（rag 前缀）——与 issues-master #75「仅覆盖后端/Java/AI 应用三个 scope」逐字吻合 |
| 导入工具 | **零 operator 消费者**：`ingestQbank`（`packages/db/src/qbank/qbank-ingest.ts:148`）与 `ingestQuestionBankArtifacts`（`:332`）为库函数·`scripts/`·`ops/`·`apps/api/src` 全仓 grep 零命中；唯一生产写路径=worker boot 种子对账 `apps/worker/src/main.ts:285-292`（seedFacts<seedChunkRefs 时 `ingestQuestionBankArtifacts`）·调用点 `main.ts:751` |
| 治理路径（已具备） | `qbank-ingest.ts:4` 头注：`findSourceByHash/propose → qbank_source(kind,content_hash 去重)→ approve → promoteToPool`·`QBANK_OWNER='__system_qbank__'`（:46）·`QBANK_ANNOTATION_SOURCES=['curator_reviewed','seed_v1_reviewed']`（:49） |

### 1.2 难度谱（#77 症状面）

| 面 | 实测 |
|---|---|
| 种子难度 | `qbank-seed.ts:170` `difficulty: prefix === 'rag' || prefix === 'design' ? 4 : 3`——**仅 3/4 两档**；实分布=4 档 5 题（design×4+rag×1）·3 档 28 题·**1/2/5 档零题** |
| DB 约束（非瓶颈） | `migrations/0031_qbank_question_artifact_rag.sql:13`（CHECK difficulty BETWEEN 1 AND 5）·`0094:79`·`0106:311`·`0110:55/:113` 同形——schema 全谱已就绪，窄在数据与检索面 |
| 入库校验（已接） | `qbank-ingest.ts:302` `difficulty < 1 || > 5 → qbank_question_invalid_difficulty` |
| 池级过滤（缺失） | `packages/db/src` 全 rg `AND difficulty`/`difficulty = ` **零命中**（唯一命中 `scoring-wire.ts:100` 为评分换算非检索）——difficulty 只冻结进 `qbank_retrieval_plan`（`packages/db/src/qbank/qbank-track-local-retrieval.ts:108-116` freezePlan 第 8 参）与查询文本，**ANN 候选无难度谓词** |

### 1.3 检索面（#77/#79 症状面）

| 面 | 实测 |
|---|---|
| 单题型接地 | `apps/worker/src/adaptive-interview-service.ts:269` `const useRetrieval = kind === 'fundamental'`——**scenario/behavioral 与简历/题库解耦（空素材、空来源）**（同行注释原话） |
| 查询构造 | `adaptive-interview-service.ts:272` `cragRetrieve(\`${competency} 难度${difficulty}\`, ...)`——**查询仅「能力 难度N」单串**；不带岗位/技术栈/已问题 |
| 解析协议 | `apps/worker/src/qbank-track-local-retrieve.ts:86-92` `parseCragPlannerQuery` 正则 `/^(.*)\s+难度([1-5])\s*$/u`——只解析 competency+difficulty 两段·1-5 已收但池里只有 3/4 |
| 已问排除（缺失） | `packages/db/src/qbank/`·`apps/worker/src/qbank-*.ts` 全 rg `已问/excludeRef/askedRef/servedRef` **零命中**——无任何已问题排除机制 |
| 岗位透传先例（可复用） | `apps/worker/src/interview-consumer.ts:382-385` `#259: 用户显式岗位(payload->>'targetRole',begin 头透传)置最高优先源`——查询带岗位的现成供给线 |

### 1.4 rubric 粒度与去重（#76/#78 症状面）

| 面 | 实测 |
|---|---|
| 共享 rubric | `qbank-seed.ts:84-155` `COACHING` 14 个能力域组各一段 `{rubric, followUp, antiPattern}`；`qbank-seed.ts:162-181` `QBANK_ARTIFACTS` 逐题产四 chunk（prompt/rubric/follow_up/anti_pattern）但**后三角色文本按前缀整组复制**——同能力域 N 题共享同一段·与 #76「非逐题撰写」吻合 |
| 数据模型（capable） | `QbankQuestionArtifact`（`qbank-ingest.ts:91`）逐题 chunks 已支持任意粒度；`:314` `prompt!==1 || rubric<1 → qbank_question_requires_exact_prompt_and_rubric`——**瓶颈在数据非模型** |
| 去重现状 | 仅精确：`qbank-ingest.ts:102` `hashOf`=sha256 截 32；`:219-226` content_hash 去重+refId 不可变守卫（同 refId 异 hash=改版 fail-loud）——**零语义近重复检测**（#78） |
| 种子自带近重复 | `qbank-seed.ts:13` `seed:limit-3`（秒杀防超卖）vs `:32` `seed:design-2`（秒杀防超卖）——同题面异 refId 双题在库·#78「种子自身即有近重复题」实录 |

### 1.5 C 端检索面 vs 候选人面（#202 症状面·收编项）

| 面 | 实测 |
|---|---|
| 检索面（旧表直读） | `apps/worker/src/interview-consumer.ts:278-280` `routeSnapForRetrieve = getInterviewRouteSnapshot(...)` → `packages/db/src/routing/job-route-decision.ts:355-372` 直读 **`interview_route_snapshot`（旧 recruiter/job 快照表）** |
| 候选人面（已切新） | begin 供给面已双轨：旧表优先→fallback `candidate_profile_route_snapshot`（0142 新结构）——`interview-consumer.ts:368-374` 注释逐字：「**检索面（routeSnapForRetrieve / G-R2-5）维持旧表直读不动**——candidate 面 retrieval 走既有 degradedRetrieval('route_snapshot_missing') 语义」 |
| 缺口后果链 | 候选人无快照 → `:273-275` G-R2-5 fail-closed → `degradedRetrieval('route_snapshot_missing')`（`packages/domain/src/crag.ts:24-26`）→ `gradeRetrieval` 见 degraded 即 **`deny_external`**（`crag.ts:34` `local_retrieval_degraded:*`）→ fundamental 无题库素材且禁外探 |
| 候选面适配器（现成·被禁用于检索） | `packages/db/src/routing/candidate-route.ts:113-134` `getInterviewRouteSnapshotForAdaptiveRole`——适配 `InterviewRouteSnapshotView` 形（单 leaf allocation·`jobId=''`·`revision=CANDIDATE_ROUTE_REVISION`·`routeDigest=input_digest`）；其头注 `:110-112` 逐字：「消费方（角色门）只读 allocations[0].leafTrackId；**检索面（G-R2-5）不走本函数（维持旧表直读）**」——本刀即解禁/扩形此缝 |

### 1.6 域归属现状（DIR-B2）

- `packages/db/src/qbank/` **已归域**（DIR-B2 落卷）：`dir-b2-domain.md:138` 亲读=qbank-curation/qbank-embedding-compute-cache/qbank-generation-projection/qbank-generation-retrieval/qbank-ingest/qbank-miss/qbank-provider-input/qbank-retrieval-cache/qbank-route-scope-cache/qbank-track-local-retrieval 十件（#78 旧锚 `packages/db/src/qbank-ingest.ts` 已漂至 `packages/db/src/qbank/qbank-ingest.ts`）。
- worker 侧检索面六件仍在 `apps/worker/src/` 根（qbank-seed/qbank-generation/qbank-planner-retrieval-plan/qbank-retrieve-scope/qbank-track-local-retrieve/qbank-embedding-compute-seams）——DIR-B2 范围=db src·worker 侧不在其表，**本刀不搬文件**。

## §2 修法清单（issues-master 更正版 · 蓝本逐字+修法列 · 禁改写）

| # | 位置 | 原文（严重度·类别·旅程） | 建议修复方式（修法列·逐字） | 本刀落点 |
|---|---|---|---|---|
| #75 | issues-master :202 | P1·AI能力缺口·面试中：「生产题库实质只有 33 条手写种子，仅覆盖后端/Java/AI 应用三个 scope，无导入工具」（证据列 `apps/worker/src/qbank-seed.ts:9-56`·`apps/worker/src/main.ts:274-279,310-311`） | 「建题库导入工具与审核流程，按岗位/难度 1–5 补题」 | §3-① |
| #76 | :336 | P2·AI能力缺口·面试中：「同能力域题目共享同一段 rubric/followUp/antiPattern，非逐题撰写」（证据列 `apps/worker/src/qbank-seed.ts:84-155,162-178`） | 「题库数据模型改为逐题 rubric/追问，导入时校验去重」 | §3-② |
| #77 | :337 | P2·AI能力缺口·面试中：「题库难度只有 3/4 两档，检索不按难度过滤（只拼进查询文本），『更基础/更难』无题支撑」（证据列 `apps/worker/src/qbank-seed.ts:170`·`apps/worker/src/adaptive-interview-service.ts:120`） | 「补 1–5 难度题，检索接口增加 difficulty 过滤参数」 | §3-③ |
| #78 | :469 | P3·AI能力缺口·面试中：「题库去重只有精确哈希/refId，无语义近重复检测，种子自身即有近重复题」（证据列 `packages/db/src/qbank-ingest.ts:102,221-225,310`·`apps/worker/src/qbank-seed.ts:13,32`） | 「导入时做向量近重复检测（cosine 阈值）并人工复核」 | §3-④（**裁决注记**：向量 cosine 依赖 embedding 计算=§4 范围外；本刀落非向量近重复门·向量 cosine 留 seam 后刀升级——修法列的「人工复核」半全落） |
| #79 | :338 | P2·AI能力缺口·面试中：「检索只服务 fundamental 题型，查询仅『能力 难度N』，不带岗位/技术栈/已问题目」（证据列 `apps/worker/src/adaptive-interview-service.ts:118-122`） | 「扩展检索到 scenario 等题型，查询加入岗位/技术栈并排除已问题」 | §3-⑤ |
| #202（收编） | :347 | P2·AI能力缺口·面试中：「C 端面试检索面仍直读旧 snapshot 表，候选人无快照 → route_snapshot_missing → CRAG deny_external，fundamental/scenario 题无题库素材」（证据列 `apps/worker/src/interview-consumer.ts:254-258,344-352`·`packages/domain/src/crag.ts:24-35,70-78`） | 「检索面改读候选人路由（candidate-route）；无素材时显式降级提示」 | §3-⑥（收编依据=H7 挂账行 `batch-residual-plan.md:102`「建议 H2/H4 立项时顺手收编」·蓝本 §0 ③） |

## §3 改动清单（六项·file:line 实锚·EXEC 立项重 pin）

### ① 题库导入工具+审核流程（#75）

- **导入命令面**：新建 operator 导入脚本/CLI（落点 EXEC 裁决：`scripts/` 独立脚本或 `apps/worker/src/` 子命令·建议前者零 worker boot 耦合），复用既有治理路径 `ingestQbank`（`packages/db/src/qbank/qbank-ingest.ts:148`：propose→qbank_source 审核行→approve→promoteToPool）——**零新库表**（qbank_source/vector_chunk/qbank_question_artifact 全在）。
- **输入形态**：结构化题库文件（逐题 refId/text/competency/difficulty 1-5/kind/scope/rubric/followUp/antiPattern）→ `QbankQuestionArtifact` 形（`qbank-ingest.ts:91` 校验全接：`:300-317`）。
- **种子语料扩容（按岗位/难度 1–5 补题）**：`qbank-seed.ts` 新增自撰种子（头注 `:1-3` 版权先例逐字沿用：**自撰通用能力题·自有措辞·非抄录任何站点**；导入件须授权证据入 qbank_source 元数据）·scope 从三值扩多值沿 `QBANK_TAXONOMY_V1`（`qbank-ingest.ts:48`）叶子表·`annotationSource` 走 `curator_reviewed`/`seed_v1_reviewed` 白名单（`:49`）。
- **审核流程**：approve 步骤=人工复核位（qbank_source 状态机已承载·导入工具输出待审清单·**不自动 approve**——除 `seed_v1_reviewed` 既有种子通道语义保持）。

### ② 逐题 rubric/追问（#76）

- 数据面改写：新种子/导入件 rubric/follow_up/anti_pattern **逐题撰写**（禁前缀共享复制）；`COACHING`（`qbank-seed.ts:84-155`）共享块仅作为旧种子兼容保留或随扩容退役（EXEC 裁决·退役须逐 chunk 对账）。
- 「导入时校验去重」：与 ④ 近重复门同拍（导入件批内+对库双查）。
- 数据模型零改（§1.4 已证 capable）；若 EXEC 判需增列（如逐题 rubric 版本）→ 迁移从 **0161 起 claim**（0160 已双号：`0160_b_qualitative_projection.sql`+`0160_level_policy_version.sql`·ls 亲证·撞号治理=TASK-SOP-v2 §〇.4 先登记者为准·后到者重编号回注）。

### ③ 难度 1-5 谱扩展+检索 difficulty 过滤参数（#77）

- **谱扩展**：种子/导入件难度覆盖 1-5 全谱（现 3×28+4×5→五档各有供给）；`qbank-seed.ts:170` 三元退役→逐题显式 difficulty。
- **过滤参数**：检索接口增加 difficulty 过滤——落点 EXEC 重 pin（候选：`packages/db/src/qbank/qbank-track-local-retrieval.ts` serving/候选选择 SQL 加 difficulty 谓词·或 `qbank-generation-retrieval.ts` 候选池过滤·或 recheck 前置过滤）；**语义=池级过滤（候选不含非目标难度题）·非仅查询文本拼接**——修法列「检索不按难度过滤（只拼进查询文本）」的反面即本条。过滤参数经 `parseCragPlannerQuery`（`qbank-track-local-retrieve.ts:86-92`）协议扩展·fail-closed 解析语义保持（illegal → null → degraded·零发明）。
- 相邻档放宽（如 ±1 容差）与否=EXEC 裁决项（谱满后先严格相等·留 ADR 注记）。

### ④ 导入时近重复检测+人工复核（#78·非向量形）

- **非向量近重复门**：规范化（Unicode NFKC+空白/标点折叠+小写）→ 精确 hash 命中（既有 `:102`/`:219-226`）→ **n-gram/shingle Jaccard 阈值近重复**（阈值 EXEC 定·建议 0.8 起步+ADR 注记）；命中 → 进人工复核队列（approve 流程 ① 的输入）·**不静默拒不静默灌**。
- **种子近重复对处置**：`qbank-seed.ts:13`（seed:limit-3）vs `:32`（seed:design-2）门落卷时如实登记命中·处置（合并/保留双题打注记）=EXEC 裁决项。
- **向量 cosine 留 seam**：接口形留 `nearDuplicate?(normalizedText): {score, hitRefId}[]` seam·本刀零 embedding 实现（§4）。

### ⑤ 检索面扩展（#79）

- **scenario 等题型接检索**：`adaptive-interview-service.ts:269` `useRetrieval = kind === 'fundamental'` → scenario 也走检索（kind 白名单 EXEC 定·behavioral 是否纳入留裁决）——scenario 无素材时**显式降级提示**沿 `approvedTemplateGeneration` 既有回退形（`:247-257` grounded 无事实先例）·零 fail 硬死。
- **查询带岗位/技术栈**：查询构造 `:272` 扩段——岗位=`requestContext.targetRole` 供给线（`interview-consumer.ts:382-385` 已透传·消费者闭包已有）·技术栈=resume facts 池既有面（`selectGroundedFacts` 同源）；`parseCragPlannerQuery` 协议同步扩（三段+可选段·向后兼容单/双段旧形·fail-closed 保持）。
- **排除已问题**：同 interview 已 served 题排除——落点 EXEC 裁决（候选：`qbank_retrieval_plan` served 行按 interview 维度回查·或 interview events 已发题面回查）；排除集进候选过滤与 ③ 同位。**零已问机制现状**（§1.3 实测）故为新建面·最小形=refId 集合过滤。

### ⑥ C 端检索面切候选人路由（#202·收编）

- **切面**：`interview-consumer.ts:278-280` `routeSnapForRetrieve` 读源从 `getInterviewRouteSnapshot`（旧 `interview_route_snapshot` 表·`job-route-decision.ts:355-372`）切 candidate-route——**建议双轨序沿角色门先例**（`candidate-route.ts:113-118`：旧表优先→缺行 fallback `candidate_profile_route_snapshot`·B 端岗位面试零回归·C 端无岗位简历面试解锁）·纯切（去旧表）与否=EXEC 裁决项（纯切须先清点 B 端面依赖）。
- **形状适配**：候选面单 leaf allocation·`jobId=''`·`revision=1`·`routeDigest=input_digest`（`candidate-route.ts:122-133` 适配先例）——检索面消费 allocations 数组（weighted-deficit·`interview-consumer.ts:283-289`）·单 allocation 形下 deficit 数组长度=1·语义如实登记（**非缺陷·如实**：候选面本就单叶）。
- **门语义零弱化**：缺行/缺叶仍 `route_snapshot_missing`→degraded→`deny_external`（`crag.ts:24-26/:34` 逐字节零改）·**永不 unscoped**（G-R2-5 语义零改·`interview-consumer.ts:273` 注释语义保持）。
- **无素材显式降级提示**：候选人检索命中空/降级时，出题面提示形态沿 ⑤ 回退先例——**「显式降级提示」≠ 伪造素材 ≠ 静默通用题**（修法列原意）。

## §4 范围外（边界清单·越界即 FAIL）

1. **RAG 决策面归 rag 刀**：`packages/domain/src/crag.ts` 全文件零触（阈值/grading/deny_external 语义·§3-⑥ 只切检索的**读源**不动决策）；web 探索/research boundary/qdrant 后端/ann 索引形态（rag03/rag03c/rag06 族）零触。
2. **embedding 计算归后刀**：`qbank-embedding-compute-seams.ts`/durable compute cache wiring/recipe 形变/向量 cosine 近重复实现（#78 修法列的向量半）零触；导入件 re-embed 沿既有 `ensureActiveQbankGeneration` 路径（`main.ts:295-316`）零改语义。
3. **#40 族评分卡面非本刀**：rubric 发布合同（issueQuestionContract）/发题 contract/写卡聚合=P0-1 40a/40b/40c 在飞面——本刀逐题 rubric 为**数据供给面**·发布合同面零触。
4. **LEVEL-SCHEME 已落主线零回归**：difficulty 1-5 谱为题库供给面；级别判定/五档读面（0160+contracts+career.ts）零触（H3 卷即基线 tip `20186718`）。
5. **#200/#201/#213 仍挂账**：押题题作 planner 输入/planner 上限/诊断虚构处置——H7 挂账行仅建议收编 #202·余三条不进本刀。
6. **worker 侧文件不搬域**：DIR-B2 已收 db src·`apps/worker/src/qbank-*.ts` 平移非本刀事项。
7. **est live=0**：隔离 PG 即用即灭·零生产操作·零模型外呼（prove 用 mock embedder/定面向量·种子为离线数据非模型生成）·零 secrets·Key name-only 不适用面如实登记。

## §5 Prove（pre-exec 双审核对单）

1. **锚复现**（EXEC 立项重跑·期望命中·@`20186718` 起草席已验）：`sed -n '9,56p' apps/worker/src/qbank-seed.ts | grep -c "refId:"` → 33；`rg -n "difficulty: prefix" apps/worker/src/qbank-seed.ts` → 170；`rg -n "useRetrieval = kind" apps/worker/src/adaptive-interview-service.ts` → 269；`rg -n "难度\$\{difficulty\}" apps/worker/src/adaptive-interview-service.ts` → 272；`rg -n "routeSnapForRetrieve" apps/worker/src/interview-consumer.ts` → 278,280,283,287 等（多命中·以行号集合为准）；`rg -n "interview_route_snapshot" packages/db/src/routing/job-route-decision.ts` → 360；`rg -n "candidate_profile_route_snapshot" packages/db/src/routing/candidate-route.ts` → 42,118；`rg -n "deny_external" packages/domain/src/crag.ts` → 18,34,62,75。
2. **导入 prove**：导入件全链路（propose→复核→approve→promote）隔离 PG 断言；非法输入拒面（`qbank-ingest.ts:300-317` 全校验逐条触发）；`seed_v1_reviewed` 既有通道语义不回归。
3. **难度谱 prove**：1-5 全谱导入件入库存真（DB CHECK 既有）+ difficulty 过滤谓词断言（候选池过滤后零非目标难度命中·空池→degraded 非发明）。
4. **近重复门 prove**：规范化+shingle 阈值命中断言（含 seed:limit-3/seed:design-2 对如实命中）+复核队列不静默断言+零 embedding 依赖断言。
5. **检索扩展 prove**：scenario 面素材接入断言（有素材/无素材双分支）+查询三段解析向后兼容断言（旧单/双段不破）+已问排除断言（同 interview 二轮不重现 refId）。
6. **#202 切面 prove**：候选人路由读断言（有 candidate snapshot→命中·无→`route_snapshot_missing` 逐字）+G-R2-5 永不 unscoped 断言+`crag.ts` 零 diff+`deny_external` 链路零变+B 端岗位面回归（旧表优先轨）零翻。
7. **回归面随改随核**：`rag03-route:prove`/`rag04-track-local:prove`/`rag05-qbank-miss:prove`/`interview:prove`/`uc040-043:batch-qbank-seat:prove` EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）。
8. markers=0（五类标记词 grep 门·命令留 prove 回执·卷内不复抄避免自匹配）；est live=0（§4-7 口径）。

## §6 Ban 列表

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§7 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（§4-1）；Ban 动 embedding 计算面（§4-2·qbank-embedding-compute-seams 语义/recipe）；Ban 触 #40 族发布合同面（§4-3）；Ban 伪造题库量与「已补齐/已富化」宣称（数量如实·逐条可数）；Ban 题面抄录（自撰先例 `qbank-seed.ts:1-3` 逐字沿用·导入件无授权证据不入）；Ban 静默 approve（复核位必经·种子通道除外）；Ban 静默丢弃近重复命中（登记+复核）；Ban 门语义弱化（route_snapshot_missing/deny_external/G-R2-5 永不 unscoped）；Ban 难度/competency 字面散布（沿 `QBANK_TAXONOMY_V1` 单源）；Ban 迁移越权（如需迁移 0161 起 claim·0160 双号先例如实登记）；Ban 伪造已问排除来源（零机制现状新建·不假称既有）；Ban 触其他工作树；Ban LEVEL-SCHEME 落卷面回归（§4-4）。

## §7 pins（十一值照抄·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

## §8 Non-claims

本任务书 ≠ EXEC 实施 ≠ #75-79 收口 ≠ 题库已富 ≠ 难度谱已校准 ≠ 检索质量已提升（提升与否归评测面·本刀只证供给与过滤机械面）≠ 向量近重复已建（cosine 归后刀·本刀非向量形）。种子扩容后仍为「起步+导入供给」形态·「真正策展/授权题库由运营离线灌」（`qbank-seed.ts:2-3` 原话）的产品终态不在本刀。行号系 `20186718` 实测·base 漂移须重 pin（§1 为起抄面·EXEC 立项照 §5.1 重跑）；更正版上游在仓库外（`~/Documents/Meetwise产品审计-更正版/issues-master.md`）·行号以亲读记录为准（#75:202/#76:336/#77:337/#78:469/#79:338/#202:347）；issues-master 证据列旧锚与 `20186718` 实测的漂移已全量入 §1（#77 `adaptive-interview-service.ts:120`→`:272`·#78 `packages/db/src/qbank-ingest.ts`→`packages/db/src/qbank/qbank-ingest.ts`（DIR-B2 平移）·#79 `:118-122`→`:269-272`·#202 `interview-consumer.ts:254-258,344-352`→`:272-280,:366-374`·`crag.ts:24-35,70-78`→`:24-26,:34` 区域实测）。

## §9 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）；预执行双审两外席 PASS + meetwise 明示授权后，EXEC 方可依本任务书 §3 改动清单立项实施（立项时重 pin §5.1 全锚+迁移编号 claim）。本刀 L 体量·六项可拆片执行（片序建议：④近重复门→①②导入+谱→③⑤检索参数→⑥切面·每片独立 REQUEST-EXEC-nail 循环沿 b271 总档先例）——拆片与否=协调方裁定。

---

*H2 QBANK-CORPUS EXEC REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`20186718` · 分支 `line/h2-qbank-corpus` · 工作树 `meetwise-h2q` · 蓝本=batch-residual-plan H2 组（entpay 树 @`ab02d499` :97/:54/:102）+ 更正版 issues-master #75-79+收编 #202（:202/:336/:337/:469/:338/:347 修法列逐字）· 六项=①导入工具+审核流程②逐题 rubric③难度 1-5 谱+过滤参数④非向量近重复+复核⑤检索扩 scenario/岗位技术栈/已问排除⑥C 端检索面切 candidate-route · RAG 面归 rag 刀·embedding 计算归后刀·est live=0 · pins 十一值照抄 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
