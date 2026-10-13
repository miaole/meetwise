# AG-37 — 检索 weighted-deficit 归零·持久化到图 state（REQUEST）

**Status**: `executed:awaiting_post_prove_dual`（EXEC 施工落卷·预执行双审 BOTH PASS+协调方常设 loop 授权已行使·§9 随翻 append 保史·⛔push·待 post 席双审。Ban self-approve · alone≠dual · Dual PASS ≠ merge）

**席位**：meetwise 战役 AG-37（检索 weighted-deficit 归零）REQUEST 起草席（docs-only·零码动·单文件落卷）。
**基线**：主线 tip `aeaf4141ec95`（`git log -1` 开工实测·2026-10-13·docs(ssot) 刀位图计费 P2 行翻面笔）。分支 `line/ag37-deficit-persist` · 工作树 `../meetwise-ag37`（仓根同级·本起草席已立：`git worktree add ../meetwise-ag37 -b line/ag37-deficit-persist aeaf4141`·建前亲证 `worktree list` 24 树零 ag37·`branch -a` 零同名）。
**防重对表（亲证）**：`rg -n "ag37|ag-37-deficit|deficit-persist" ai-docs/delivery/harness/` → **零命中**；`ls ai-docs/delivery/harness/ | grep -i "ag37|deficit"` → **零同名刀卷**；`branch -a` → 仅本刀新建线。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-37（总览 **:49**·条目 **:455-464**·复核结论 **:457**「成立（本次新增，已核实）」·file:line **:460**·触发例子 **:461**（backend 6000bps / ai_app 4000bps 每题检索恒落 backend 叶）·**修法 :463**「把 deficit 持久化到图 state 或 interview 表，每题更新」·关联 **:464**=#197、#202）②同目录 `review-log.md` 补盲阅读记录（**:145** interview-consumer 通读·AG-37 deficit 每次 claim 归零 :257-273 / **:148** qbank-*.ts 补读新增 AG-37 / **:168** 抽检重证「每次 claim 把 deficit 初始化为全 0」）③同目录 `LANDING-INDEX.md` **§十一 :86 附带**「AG-37 pin 漂移（:257-273→~:340）机制仍成立·同批修 pin」——本卷 §0.2 即该「修 pin」履约④`ai-docs/delivery/execution-master-checklist.md` **:2470**「AG-37 pin 修」STILL OPEN 登记⑤`ai-docs/delivery/harness/product-campaign-LEDGER.md` 刀位图 qbank 小刀行 STILL OPEN「AG-37」（:418）——本刀系其独立摘出另立⑥形制沿 `ag-f-reroll-REQUEST.md`（§0-§8 形制·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `aeaf4141`·file:line/blob 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 blob 锚表（@`aeaf4141`·`git ls-tree` 实测·12 位短 blob）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `apps/worker/src/interview-consumer.ts` | `ee3a3028db0d` | **deficit 归零区（本刀主触面）**：:398 注释原文「Weighted-deficit across rag.retrieve calls **within this job claim**」/ :399 `let trackLocalDeficit = routeSnapForRetrieve?.allocations?.map(() => 0) ?? []`（**每次 claim 全 0 初始化**）/ :405-415 `retrieveViaDispatchTrackLocal` 闭包（:410 deficit 入参·:413 `trackLocalDeficit = out.deficit` 局部回写）/ :420-424 productionRequiresTrackLocal fail-closed+compat seam（零触背景）/ :426-427 注释「每次 claim 都新建固定 skill 目录…**一个 job 只推进一个 pending question，RAG/深检索各至多一次**」/ :428-435 research skills（:434 `maxCallsPerSkill { 'rag.retrieve': 1, … }`）/ :444 `localRetrieve: research.retrieve` 入 life deps |
| 2 | `packages/domain/src/job-route-classifier.ts` | `79ceded84977` | **weighted-deficit 选择器（零算法改动·纯消费面）**：:201-203 DRR 注释「每轮给每个 leaf 累加其 allocationBps，选 deficit 最大者…多桶岗位按轮配额收敛」/ :204-216 `nextWeightedDeficitLeaf`（:211 累加+:213-214 argmax+减总权重·并列取最小下标）/ :219-227 `planWeightedDeficitRounds`（proof 纯函数·确认配额比例）/ :231-272 `planInterviewTurn`（:244 deficit 入参·:255-257 长度闸+选择·:272 返回 `deficit: step.deficit`） |
| 3 | `apps/worker/src/qbank-track-local-retrieve.ts` | `18e6152a594b` | **检索 dispatch 面（deficit 消费+回传）**：:446-454 `retrieveViaDispatchTrackLocal` 签名（:453 `deficit: number[]`）/ :456-462 `finish`（deficit 伴 refs 回传）/ :493-496 **deficit 归一化兜底**（长度≠allocations → 回退全 0）/ :498-510 `assembleValidatedRetrievalPlan`（:503 deficit 消费）/ :532 / :573 / :582 各 finish 臂 deficit 原样回传 |
| 4 | `packages/domain/src/qbank-track-local-retrieval.ts` | `10f2ae7320ea` | :181 result 类型（`deficit`/`leafIndex` 出参）/ :192-262 `assembleValidatedRetrievalPlan`（:227-230 归一化兜底同形 / :232-238 `planInterviewTurn` / :260-261 返回 planned.deficit+leafIndex）——纯函数零算法改动 |
| 5 | `packages/ai-graphs/src/adaptive-interview/state.ts` | `1c780343739a` | **additive 先例双柱**：:187-217 `AdaptiveInterviewState` / :196-201 `topicMainQuestionId`（「纯标识符·C14 边界可 checkpoint」·旧 checkpoint 缺省 null=additive 兼容零回填——**本刀 state 位直接同形先例**）/ :209-214 `competencyExhaustions`（AG-F 刀 F「纯数字控制字段 checkpoint 安全」先例）/ 两字段 reducer 同形 `(_, b) => b` |
| 6 | `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `c55e828f4c52` | **seam 调用+state 写位（图侧接线面）**：:79 asked 集 / :84-86 `deps.retrieveAndGenerate(route.competency, route.difficulty, 0, turn, [], effectiveKind, asked)`（**第 7 additive 参=asked·刀 F 先例**）/ :74-77 clarify 分支**零 seam 调用**（deficit 原样继承面）/ :141-167 节点返回（:162 `topicMainQuestionId` 写位 / :166 `competencyExhaustions` 归零写位——**本刀 deficit 写位同形落点**） |
| 7 | `packages/ai-graphs/src/adaptive-interview/graph.ts` | `5d52705a121a` | :14 拓扑注释「plan → decide → genQuestion → (pending ? awaitAnswer(interrupt) : conclude) → evalAnswer → decide*」/ :32-36 节点注册 / :40-41 decide 条件边——跨题持久化的 checkpoint 恢复序（每 claim 从 checkpoint 重放·state 跨 claim 存续=本刀成立前提） |
| 8 | `apps/worker/src/adaptive-interview-service.ts` | `7d7a087348cd` | :385 `async retrieveAndGenerate(competency, difficulty, attempt, turn, _legacyFacts, kind, asked)`——**worker seam 实现面**（asked 第 7 参已落·本刀第 8 参/出参扩位落点·EXEC 细化） |
| 9 | `packages/domain/src/question-generation.ts` | `8f0faa8e0ee0` | QuestionGenerationResult 类型+`normalizeQuestionGenerationResult`——seam 返回 additive 出参字段的透传面（EXEC 细化·零既有字段改动） |

### 0.2 漂移登记（复核快照（review-log :145/:168·issues-final :460 pin `:257-273`）→ 现树 `aeaf4141` 全亲读重 pin）

| 蓝本锚（补盲时点） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| interview-consumer.ts :257-273（deficit 归零区） | **:397-399** 归零初始化（:397 routeLeafTrackId/:398 注释/:399 全 0）+ **:405-415** 闭包回写 | **大漂**（AG-C requeue 白名单 :240-292+H2 #202 双轨读 :380-392 增量插入前推）·**结论不变**——LANDING-INDEX §十一 :86 预判「~:340」（`270a863c` 时点）现树再漂至 :397·**本卷即「同批修 pin」履约**（execution-master-checklist :2470 登记项） |
| job-route-classifier.ts :204-216（nextWeightedDeficitLeaf） | :204-216 | **零漂**（逐位亲证） |
| qbank-track-local-retrieve.ts :405-470 | :446-532（:446-454 签名+:493-496 归一化+:498-510 assemble 消费） | 微漂·结论不变 |

### 0.3 现势并发登记（强制）

1. **失败语义轨六刀 A-F 全收官并主线**（LEDGER 刀位图行·F=`74ca131c`）——state.ts `competencyExhaustions`（:209-214）+seam `asked` 第 7 参（:136-141/:385）即刀 F 收官面·**已在基线内·非在途依赖**；本刀 state additive 新位/第 8 additive 参沿同形制·**其语义零触**（§5 Ban）。
2. **qbank 控制面安全小刀（0176·`d31be795` 收官）**卷面 Ban「触 AG-39/AG-37 面」——本刀系 AG-37 独立摘出另立（蓝本⑤）·与其触面（db 迁移/控制函数）**零交点亲证**。
3. 起草窗口主线 tip=`aeaf4141`（工作树建树时点）·本卷全部 blob/行号即 @该 tip 实取。

## §1 红事实 + 修法

### 红事实 A：deficit 每次 claim 归零→多叶子岗位恒落权重最大叶（现 pin @`aeaf4141` 全亲证·机制链五段）

1. **归零位**：interview-consumer.ts :398-399——`trackLocalDeficit` 是 **claim 闭包局部量**·初值恒全 0·注释自证作用域「within this job claim」。
2. **一 job 一题·每题恰一次检索**：:426-427 注释「一个 job 只推进一个 pending question，RAG/深检索各至多一次」+:434 `rag.retrieve: 1`——deficit 在作用域内至多更新一次（:413）即随 claim 结束丢弃·**跨题零存续**。
3. **选择器从 0 起跑恒偏最大权重叶**：job-route-classifier.ts :204-216——`nextWeightedDeficitLeaf` 从全 0 起跑时 `next[i]=allocationBps[i]`·argmax 恒中最大权重叶（并列取最小下标=不可变序）。蓝本触发例子（issues-final :461）：backend 6000bps / ai_app 4000bps → **每一题 fundamental 检索恒落 backend 叶题库**·ai_app 叶零命中。
4. **DRR 配额语义被 claim 边界切断**：:201-203 注释原文「多桶岗位按轮配额收敛，而非一次混合检索」——按轮配额的「轮」=题目轮次·而 deficit 跨轮累积要求状态跨题存续；现状态生命期=单 claim·**按轮配额从不收敛**（issues-final :455 红事实原文）。纵深归零面：qbank-track-local-retrieve.ts :493-496 / qbank-track-local-retrieval.ts :227-230 长度不配兜底亦回全 0（本刀零触·兼容面）。
5. **图 state 无承载位**：state.ts :187-217 全字段无 deficit——deficit 是 worker 闭包局部量·checkpoint 不持久化·图节点不可见·下一题（下一 claim·graph.ts :14 每题从 checkpoint 重放）无从读取。

**用户影响**（issues-final :462）：多方向岗位题目覆盖偏科；与 #197「planner 只取 allocations[0]」症状相同根因不同（#197=硬取 primary leaf·已由 QBANK-PLANNER-HONESTY #200/#201 修——interview-consumer.ts :393-397 routeLeaf 相关性闸在场·本刀零触）。

### §1-修法（蓝本修法 :463 原文为修法权威：「把 deficit 持久化到图 state 或 interview 表，每题更新」·本卷取**图 state 位**·零迁移）

**① state additive 位（载体）**：state.ts `AdaptiveInterviewState` 新增 `trackLocalDeficit: Annotation<number[] | null>`（reducer `(_, b) => b`·default null）——**沿 `topicMainQuestionId` 先例（:196-201）同形制**：纯数字数组控制字段·C14 边界 checkpoint 安全（与 `competencyExhaustions` :209-214 同族）；旧 checkpoint 缺省 null=首题从全 0 起跑·**零回填零发明·additive 兼容**。

**② 每题更新**：每题恰一次更新——rag.retrieve 发生在 genQuestion（模型 skill 调用·seam 内）·更新值经 seam 出参回流 genQuestion 节点写入 `trackLocalDeficit` state 位→checkpoint 持久化。任务书原句「每题 eval 后更新」与「genQuestion 返回即写」在 checkpoint 面语义等价（下一题读到的恒为上一题终值·每题恰一次）·**写位 superstep 终形=裁决项③**。clarify 分支（generate-question.ts :74-77）零 seam 调用→deficit 原样继承零改。

**③ 下一题读持久化值**：下一 claim 从 checkpoint 恢复 state→genQuestion 把 `state.trackLocalDeficit ?? 全 0` 经 seam additive 入参（**第 8 additive 参·沿 `asked` 第 7 参刀 F 先例** :136-141/:385 形制）传入 worker 闭包→interview-consumer.ts :399 初始化改读该参（零参/旧 checkpoint 缺省=全 0·**现状字节保留为缺省臂**）→:413 更新值经 seam 返回（additive 可选出参·question-generation.ts 透传面 :9）→节点写 state。**收敛效果**：6000/4000 两叶·跨题 leaf 序列 `0,1,0,1,0`——恰 5 题一 DRR 周期·周期内配额 **3:2=allocationBps 占比**·周期末 deficit 回 `[0,0]`（`planWeightedDeficitRounds` :219-227 既有纯函数可直证·零新算法）。

**④ 快照漂移承登（如实登记）**：面试中途路由快照变更（allocations 长度变）→持久化 deficit 长度不配→既有归一化兜底（:493-496/:227-230）回全 0=**降化重置·现状字节零改**·如实承登非新行为。

**⑤ 接线面清单（EXEC 立项照 §0 重 pin·零算法改动）**：state.ts（additive 位+AdaptiveDeps 签名第 8 参）+ generate-question.ts（:84-86 调用带参+:141-167 返回写位）+ question-generation.ts（result additive 出参字段+normalize 透传）+ adaptive-interview-service.ts（:385 seam 实现扩位）+ interview-consumer.ts（:399 缺省臂+:410/:413 出参回流）——**五文件全 additive·选择器/归一化/降级语义零字节改**。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **新 proof（apps/worker·`prove:ag37-deficit-persist`·沿 ag-f-reroll.proof 形制——scripted 模型+真迁移隔离 PG·est live=0）**：
   - **多叶子岗位跨题臂（核心）**：6000/4000 两叶快照·题 1 从 0 起跑选中叶 0（backend）→ 题 2 读持久化 deficit 选中叶 1（ai_app）→ 题 3 回叶 0——逐题 leaf 序列 `[0,1,0]`；5 题周期臂 `[0,1,0,1,0]`·周期末 `trackLocalDeficit=[0,0]` 回零·**周期配额恰 3:2**；
   - **deficit 逐题递减/累积断言**：state 值链 `[0,0]→[-4000,4000]→[2000,-2000]→[-2000,2000]→[4000,-4000]→[0,0]`（逐题按 DRR 公式精确断言·非归零）；
   - **红面复现对照臂**：无持久化（现状形·每 claim 全 0）→ 恒 leaf 0——证本刀前红面真实存在·修后消失；
   - **持久化臂**：genQuestion 写 state 位→模拟 claim 边界（checkpoint 恢复）→下一题读到前题 deficit（非全 0）；
   - **兼容臂**：旧 checkpoint 缺字段→null→全 0 起跑（现状字节·零回填）；单叶岗位（allocations 长 1）行为零变；clarify 重发臂 deficit 原样继承；deficit 长度不配→既有归一化兜底回全 0（:493-496/:227-230 零位移）；
   - **保守面零位移（真迁移 PG）**：`route_snapshot_missing`/`planner_query_invalid`/`generation_unavailable` 降级形状原样·G-R2-5 永不 unscoped·#201 routeLeaf 闸（:393-397）原样·`no_eligible_in_scope` 负缓存臂原样。
2. **既有门回归**：`prove:qbank-corpus-retrieve`（track-local 检索门）+ `prove:r4-real-wire-impl`（consumer retrieve 真接线门·:397-415 最近门）+ `prove:adaptive-flow`（图流门）+ domain `prove:r4-p-planner-unit`（选择器纯函数门）全绿 **EXIT 原值**·基线同红如实登记不洗。
3. **typecheck**：`pnpm turbo typecheck` 全绿（基线口径·CI 权威形 `--force`）。

## §3 范围外（边界清单·越界即 FAIL）

1. **AG-39 私有题库/私有优先**=产品大刀挂用户排期（LEDGER 刀位图行）——零触。
2. **AG-40 检索快照 C 端双轨**=已由 `634eb645` 修（LANDING-INDEX §十一 :84 定谳「不成立（现状）·历史成立」）——零触。
3. **AG-13 CRAG 阈值**（crag.ts 0.7/0.3/0.5·review-log :171 抽检锚）——零触（零阈值改动·零检索评分改动）。
4. **#197 planner 相关性闸**=QBANK-PLANNER-HONESTY 已修（:393-397 routeLeaf）——零触。
5. **检索算法/选择器本体**（nextWeightedDeficitLeaf/planInterviewTurn/assembleValidatedRetrievalPlan/planWeightedDeficitRounds 字节零改）+检索排序/serving_scope 过滤/负缓存/dispatch-recheck——零触·**纯状态传递刀**。
6. **interview 表持久化路线**（蓝本修法②选型「或 interview 表」）=不取（图 state 位已足·零迁移）；若 EXEC 证明 checkpoint 面不足须改表=**回炉重审非本卷可裁量**。
7. **est live=0**：零真实模型外呼·零生产操作·零 secrets（§6）。

## §4 依赖

- **零依赖**：无前置刀——失败语义轨六刀已收官并主线（additive 先例在基线内·§0.3-1）·qbank 安全小刀收官（零交点·§0.3-2）·无在途并发刀触本刀五文件接线面。
- **下游**：execution-master-checklist :2470「AG-37 pin 修」登记项随本卷 §0.2 履约（nail 时由收尾席翻面）；LEDGER 刀位图新增行/统计=**协调方专权**（本刀零触 SSOT）；issues-final/review-log 蓝本卷只读零改。
- EXEC 若并线（主线前移）→ 照 §0 协议重 pin（漂则重锚·结论不变则只更行号·沿 ag-f §9.0 先例）。

## §5 Ban 列表 + pins（沿 ag-f/authz 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件行与统计只读引用·刀位行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改检索算法/选择器本体（§3-5 四函数字节零改——「零检索算法改动」铁律）；Ban 改 CRAG 阈值与降级语义（crag.ts/qbank-retrieve-scope 零字节·`route_snapshot_missing`/G-R2-5 永不 unscoped 形状不变）；Ban 迁移（零迁移——interview 表路线已范围外 §3-6）；Ban 触失败语义六刀收官面（`competencyExhaustions`/`asked` 第 7 参/unscored 臂语义零改——state.ts 只 additive 新位·既有字段/签名位零字节）；Ban 触 #201 相关性闸（routeLeaf :393-397 零字节）；Ban 触 AG-39/AG-40/AG-13 面；Ban 把题面/答案/事实类内容塞入 deficit 字段（**纯数字数组·C14 边界**·checkpoint 安全纪律沿 state.ts 投影条款）；Ban 无 checkpoint 持久化的伪持久化（内存/单例/进程级缓存不入——跨 claim 存续唯一合法通道=图 state checkpoint）；Ban 真实模型外呼（est live=0·scripted+隔离 PG 形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/隔离真迁移 PG·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=scripted 模型+真迁移隔离 PG（沿 ag-f-reroll.proof 先例·护栏+每门独立一次性容器）；回归门=既有 prove 原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag37-deficit-persist-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag-f/ag-cost1 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md·⛔push·零其他文件）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①持久化载体终形**：(a) 图 state additive 位（**推荐**·零迁移·沿 topicMainQuestionId/competencyExhaustions 双先例·checkpoint 跨 claim 存续天然承载）(b) interview 表列（蓝本修法②选型·需迁移·跨 checkpoint 系统面强一致——仅当 (a) 被双审否决才重开）。
- **②seam 传递通道**：(a) 第 8 additive 参入+result additive 出参（沿 asked 第 7 参刀 F 先例·**推荐**·五文件全 additive）(b) deps 闭包对象扩位（签名零改但图节点可见性弱·须证 checkpoint 面等价）。
- **③更新写位 superstep**：(a) genQuestion 返回即写（rag.retrieve 一出·更新值当场落 checkpoint·间隙最小·**推荐**）(b) evalAnswer 后写（任务书原句「每题 eval 后更新」字面·需跨节点携带终值）。两形 checkpoint 面终值等价（每题恰一次·下一题读上题终值）·差异仅更新 superstep 时点·EXEC 择一行使并如实登记。
- **④收敛验证窗口形**：(a) 5 题整周期对照 `planWeightedDeficitRounds`（确定性·`[0,1,0,1,0]`+周期回零+配额 3:2·**推荐**）(b) 3 题前缀断言 `[0,1,0]`（最短证伪窗）+ 周期臂可选。(b) 为 (a) 子集·不冲突可并行。
- **⑤新 proof 命名/注册位**：(a) `prove:ag37-deficit-persist`（沿本卷 §2-1·worker package.json+runner 注册 additive·**推荐**）(b) 并入既有 qbank-corpus-retrieve proof 扩臂（注册面零增但既有门断言面混载）。

---

*AG-37 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · 基线主线 tip `aeaf4141` · 分支 `line/ag37-deficit-persist` · 工作树 `../meetwise-ag37` · 蓝本=issues-final AG-37 :49/:455-464 + review-log :145/:148/:168 + LANDING-INDEX §十一 :86（pin 漂移·同批修）+ execution-master-checklist :2470 + LEDGER 刀位图 qbank 行 · 范围=deficit 持久化到图 state（additive 位沿 topicMainQuestionId 先例·每题更新·下一题读持久化值）· 五文件全 additive·零检索算法改动·零 CRAG 阈值改动·零迁移·纯状态传递 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push 待 pre-exec 双审两外席（Ban self-approve · alone≠dual）*

## §9 EXEC 落卷随翻（2026-10-13 · append 保史·§0-§8 原文零改）

**授权链**：预执行双审两外席 BOTH PASS 落卷 + 协调方常设 loop 授权（EXEC 任务序五项：并线重 pin/施工修法 a-d/断言门 §2/REQUEST 随翻/commit 回报）→ 本席按卷施工。

**§9.0 并线重 pin（任务序①）**：`git merge feat/mysql-schema-skeleton` → **Already up to date**（EXIT=0·零冲突·主线 tip 实测 `aeaf4141`=本支父·任务书口径「主线 378b96e8+」系起草时点快照·`merge-base --is-ancestor` 亲证 378b96e8 ∈ aeaf4141 谱系·零新并线面）。§0 九 blob 锚 @开工树逐条 `git ls-tree` 复算：**九锚全零漂**（ee3a3028/79ceded8/18e6152a/10f2ae73/1c780343/c55e828f/5d52705a/7d7a0873/8f0faa8e 逐位亲证）。§0.2 勘误登记生效核对：interview-consumer 归零区现位 **:398 注释+:399 全 0 初始化 + :405-415 闭包（:410 deficit 入参+:413 回写）**——与本卷 §0.2「:397-399+:405-415」勘误登记一致·零再漂·**本节即「同批修 pin」履约完结**（execution-master-checklist :2470 登记项·nail 翻面权归协调方）。

**§9.1 施工落点（任务序②·六文件全 additive·零算法改动）**：

1. `packages/ai-graphs/src/adaptive-interview/state.ts`：:138-149 `AdaptiveDeps.retrieveAndGenerate` 第 8 additive 参 `weightedDeficit?: number[] | null`（:149·沿 asked 第 7 参先例·缺省 undefined=旧 scripted deps 零改）+ :223-232 state additive 位 `weightedDeficit: Annotation<number[] | null>({ reducer: (_, b) => b, default: () => null })`（:232·沿 topicMainQuestionId/competencyExhaustions 双先例同形制·旧 checkpoint 缺省 null 零回填）。
2. `packages/domain/src/question-generation.ts`：:52-64 success 形 additive 可选出参 `weightedDeficit?: number[] | null`（:62·纯数字数组·仅 success 形）；`normalizeQuestionGenerationResult` passthrough 原样零改（键在场随透传·legacy 形键缺席）。
3. `apps/worker/src/adaptive-interview-service.ts`：:243-250 `AdaptiveServiceDeps.trackLocalDeficitRef?`（per-claim 临时 seed/ref 导管·**非持久化通道**——跨 claim 唯一合法通道=图 state checkpoint）+ :394 seam 签名第 8 参 + :396-401 seed（undefined 不 seed·现状字节）+ :402-407 `withDeficitOut`（success 形 attach holder 现值·失败形/无 holder 原样）+ :446 grounded 模板臂/:461 progress 包装两处出参回流单点化。
4. `apps/worker/src/adaptive-lifecycle.ts`：:130-136 `AdaptiveLifecycleDeps.trackLocalDeficitRef?` + :156 `makeDeps` 透传一行（**纯透传·零逻辑**·见 §9.3 承登②）。
5. `apps/worker/src/interview-consumer.ts`：:398-405 注释+per-claim holder `trackLocalDeficitRef`（:405）+ :416 缺省臂 `trackLocalDeficitRef.current ?? routeSnapForRetrieve?.allocations?.map(() => 0) ?? []`（**既有全 0 表达式字节保留为缺省臂**）+ :419 回写 `trackLocalDeficitRef.current = out.deficit`（原 `let trackLocalDeficit` claim 局部量移除）+ :459 life 注入。**不归零**:下一题经 seam 第 8 参读上一题写下的 state 位值。
6. `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`：:76 `weightedDeficitOut` + :91 seam 调用带第 8 参 `state.weightedDeficit ?? null` + :133 成功形取值 + :178 条件写位 `...(weightedDeficitOut !== undefined ? { weightedDeficit: weightedDeficitOut } : {})`（键缺席=通道继承不写·沿 topicMainQuestionId「继承不写」同形语义）。**evaluate-answer.ts 零字节**（§9.2 裁决③a）。

**§9.2 裁决行使（§8 五项·全按推荐）**：①(a) 图 state additive 位（零迁移）✅；②(a) 第 8 additive 参入+result additive 出参 ✅；③(a) **genQuestion 返回即写**（rag.retrieve 一出·更新值当场落 checkpoint·间隙最小）✅——evaluate-answer 节点零字节：节点部分返回语义下未提键通道经 checkpoint 原值保留（同节点 topicMainQuestionId probe/clarify 继承先例），任务序②d「generate-question/evaluate-answer 节点收口写回」之 evaluate-answer 侧以零改动兑现收口（通道继承即写回语义的等价零字节形·如实登记）；④(a) 5 题整周期对照 `planWeightedDeficitRounds`（[0,1,0,1,0]+周期回零+配额 3:2）✅；⑤(a) `prove:ag37-deficit-persist` 新门（worker package.json+runner 三注册面 additive：package.json script/:raw sources+allowed/:raw isolatedCommand）✅。

**§9.3 如实承登（两处偏差·语义零变）**：① **state 位名**：§1-修法① 原文 `trackLocalDeficit` → 实落 `weightedDeficit`（协调方 EXEC 任务书命名·本席随卷行使·类型/reducer/缺省语义与 §1① 逐位一致·零回填零发明）；② **接线面第六文件**：§1-修法⑤ 五文件清单 → 实落+`adaptive-lifecycle.ts` 纯透传 2 处（§9.1-4）——seam 第 8 参自图节点物理抵达 consumer 闭包的必经导管（makeDeps 显式字面量构造·无 spread 旁路）·零逻辑零行为。两处均不触 §3 范围外与 §5 Ban/pins（改 §1 修法清单之字面细节由授权任务书承载·修法本体=additive 位+每题更新+下一题读持久化值·零变）。

**§9.4 断言门 EXIT 全表（任务序③）**：

| 门 | 落卷后 | 基线对照（`git stash` 后 3b47df9a 洁树亲跑） |
|---|---|---|
| `prove:ag37-deficit-persist`（新·隔离 PG 真迁移） | **EXIT=0**（PASS 35/Fail 0·A() 断言恰 35 亲数·回执落盘 .tmp/isolated-proof-receipts） | —（本卷新增） |
| `prove:qbank-corpus-retrieve` | EXIT=1（恰 1 FAIL:「fundamental 检索仍接通」business_invalid/question_critique_failed·scripted 题面 6 字符 too_short 族） | **EXIT=1 同红亲证**（同 1 FAIL 同形状·idempotencyKey 随机段差异仅 fixture UUID） |
| `prove:r4-real-wire-impl` | EXIT=1（恰 5 FAIL·全 harness .md 存在性/文案面·**consumer/helper/main 源码断言全 PASS**） | **EXIT=1 同红亲证**（5 FAIL 逐条相同） |
| `prove:adaptive-flow` | **EXIT=0**（全绿·真 deps 端到端） | 绿 |
| `prove:r4-p-planner-unit` | EXIT=1（恰 2 FAIL·T7 harness .md 文案面·选择器纯函数断言全 PASS） | **EXIT=1 同红亲证**（2 FAIL 逐条相同） |
| `pnpm turbo typecheck --force` | **EXIT=0**（3/3·0 cached·基线口径） | EXIT=0 |

三处基线同红如实登记不洗（harness .md 文件未随本线落树/文案过期系在途 SSOT 面·非本刀改动集·零回归引入）。

**§9.5 断言力要点（§2 全兑现）**：跨题臂真图真 seam 真节点真 checkpoint（MemorySaver 每 invoke 独立=claim 边界·`g.getState` 逐题读 cp）·值链 [-4000,4000]→[2000,-2000]→[-2000,2000]→[4000,-4000]→[0,0] 逐位精确+leaf 序列 [0,1,0,1,0]+leafTrackId 落叶可观察+配额 3:2；红面复现对照双臂（纯函数现状形恒 [0,0,0,0,0]+真图流 legacy 恒 [0,0]）；四兼容臂全过（旧 checkpoint null 起跑/单叶零变/clarify 继承真澄清臂（v6 合法 relevant=false 形·澄清题零检索零写位·通道 [-4000,4000] 原样）/长度不配既有兜底回全 0）；保守面三降级臂 deficit 原样穿透（[7,7] 逐位）+P-FAKEPLAN+G-R2-5。est live=0 口径：全 scripted model+隔离 PG 真迁移·零真实模型外呼·零 secrets。

**§9.6 十三条件自检（任务序⑤回报单）**：①零检索算法改动=job-route-classifier/qbank-track-local-retrieve/qbank-track-local-retrieval 三文件**零字节改**（选择器四函数 nextWeightedDeficitLeaf/planInterviewTurn/assembleValidatedRetrievalPlan/planWeightedDeficitRounds 原样·git diff 亲证不在改动集）；②零 CRAG 阈值改动=crag.ts/qbank-retrieve-scope 零字节（G-R2-5/降级形状三臂原样穿透断言）；③零迁移=改动集零 .sql/零 runner 迁移面（图 state checkpoint 承载）；④pure state=deficit 纯数字数组·C14 边界·无题面/答案/事实内容（Ban 塞内容条兑现）；⑤additive=六文件全 additive（缺省臂=现状字节·legacy 7 参/无 holder 双断言）；⑥跨题持久化=唯一通道图 state checkpoint（holder 仅 claim 内导管·无内存/单例跨 claim 伪持久化）；⑦既有门回归=六门全表 §9.4（三基线同红亲证零回归·三绿维持）；⑧typecheck=EXIT=0 3/3；⑨pins 十一值照抄零翻（haStatus=NOT_HA/releaseEvidence=false/claimProductionHA=false/gR45Closed=true/coveredCount=8/ms3EqualsR4Closed=false/PG-retained/公开 DELETE=503/g7SuiteGreen=false/r1Closed=false/actualSpendCny=null）；⑩状态行=draft→executed:awaiting_post_prove_dual 随翻零洗史；⑪回滚=single commit `git revert` 即净（零迁移零共享 SSOT 触碰）；⑫停止条件=零触发（blob 九锚零漂/防重零撞/主线零触碰/⛔push 遵守）；⑬markers=0（改动集 TODO/FIXME/XXX/HACK 扫描零残留·唯一 'marker' 命中系既有 SSE 语义注释非本刀）。
