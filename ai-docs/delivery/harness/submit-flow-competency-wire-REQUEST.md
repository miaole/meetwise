# SUBMIT-FLOW-COMPETENCY-WIRE REQUEST（submit 流向 competency 供给修复刀 · 修法一件=submit 形图 deps 沿 checkpoint mind 序补供 · 恰 1 产品文件 · 零迁移零 DDL 零 SSOT 行零图包触）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷 2026-10-14·docs-only 恰 1 .md·产品码零触·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · ⛔push⛔merge 主线） · base = 主线 `feat/mysql-schema-skeleton` @ `0ff55592`（全 hex `0ff55592`·fetch 后 origin tip 亲证恒等·cap sanction 2184 卷 tip 同指） · 分支 `line/submit-flow-competency-wire` · 工作树 `meetwise-sfc`（`git worktree add ../meetwise-sfc -b line/submit-flow-competency-wire 0ff55592` 本起草席已立·`git worktree list` 恰一本树在册）。

**席位**：meetwise 战役「SUBMIT-FLOW-COMPETENCY-WIRE submit 流向 competency 供给修复刀」诊断+起草席（**G7K 红真正翻面的关键后继刀·QGEN post 席2 关键定性转达立项** · 协调方派单 brief：QGEN-CRITIQUE-RESILIENCE post 席2 定谳「submit 侧图 deps `competencies=[]` 系架构事实·G7K 红在 submit 流向不因 QGEN 单独翻面」→ 本刀承接诊断定稿+修法裁决+起草落卷 · docs-only · ⛔push · ⛔改产品码）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：① 协调方派单令（SUBMIT-FLOW-COMPETENCY-WIRE 诊断+起草席·G7K 后继刀排程）；② **QGEN-CRITIQUE-RESILIENCE post 席2 定谳转录**（qgen 卷 `:286` 字段⑦-3 原文：「submit 侧 planner 序空位架构事实登记：lifecycle submit 形图 deps `competencies=[]`（planner 序仅 start 注入）→turn≥1 族失败/批判拒在该流向无序可换（单发终场保留）——件①/件② 的帽内换序接管面=start 流向+直接 deps 注入面……登记供 post-prove 双审与**后继刀（如需 mid-interview 换序可另刀立题）**」——本刀即该邀约后继刀）；③ 先例形三钉=`b29d861d`（AG-F 刀F EXEC·换序臂本体=generate-question `nextCompetencyAfter(deps.competencies,…)`+MAX_COMPETENCY_EXHAUST_SWITCH=2 帽）+`2af10f74`（AG-F nail·五裁决在卷）+QGEN EXEC `22112950`（件①模板旁路闭合+件②批判门帽内可恢复·两件在 qcr 支线未并主线）——本刀修法全沿既有持久化面（checkpoint mind）与既有换序臂语义行使，零新机制发明。

---

## §0 现状锚（起草席亲读·base `0ff55592`·file:line 逐条 Read/rg/git ls-tree 实测·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（起草前实测）

- `git worktree list`：恰 `meetwise-sfc` 一本树在册（本席建树后实测·38+1 树无第二 sfc）；`git branch --list line/submit-flow-competency-wire`：恰本席分支一条。
- `ls ai-docs/delivery/harness/ | grep -i submit-flow`：**零命中**（建卷前实测）——**零同名卷**。→ 停止条件未触发·可落卷。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`0ff55592`）

| # | 文件 | blob（全 hex） | 关键行锚 |
|---|---|---|---|
| 1 | `apps/worker/src/adaptive-lifecycle.ts`（609 行·**修法落点**） | `1e6129edf4258362d8032837791f1f1895648128` | `:116-154` AdaptiveLifecycleDeps；`:161-180` makeDeps（**第 2 形参 competencies** 直通 `buildAdaptiveDeps`）；`:293` startAdaptiveInterviewImpl；`:305` `planCompetencies(...)`（planner 序唯一生产点·快模型 invoke `${threadId}:plan`）；`:307` **start 形** `makeDeps(d, competencies, resumeProfileAvailable, undefined, grounding.pool, focus)`；`:344-346` startAdaptiveInterview 导出；`:354` submitAdaptiveAnswerImpl；`:357` enrollCheckpointThread；`:360` loadInterviewResumeGrounding；**:361** **submit 形** `makeDeps(d, [], grounding.available, input, grounding.pool)`——**competencies 字面空数组=本刀红根**；`:363-365` `before=await g.getState(cfg)`+beforeTranscript+alreadyApplied；`:377-389` stale 门/claim 门/invoke(Command resume)/alreadyApplied invoke(null) 三路；`:424-440` generationFailed→writeGenerationUnavailable（事务内诚实终态·QGEN 件①收据消费面）；`:506-515` 事务外 degraded 返回（done:true） |
| 2 | `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`（181 行·**零触·换序臂消费锚**） | `8a97f9c94077be24b4723ad1d40eba5fb6ab6a73` | `:21` MAX_COMPETENCY_EXHAUST_SWITCH=2；`:24-29` nextCompetencyAfter（**`:25` `sequence.map(names)`→`:26` indexOf→末位/缺席=null**·`deps.competencies` 为 answer 相唯一活消费点 `:101`）；`:93-114` AG-F 族失败换序臂（`:100` 族+帽判定·`:103-110` 换序返回形·`:113` failClosed 无序可换真终场）；`:115-127` critique 图级终闸（failClosed 原形·QGEN 件② 改形见 §0.3）；`:173-174` 成功归零 |
| 3 | `packages/ai-graphs/src/adaptive-interview/state.ts`（237 行·**零触·通道锚**） | `411e700e513567a3d865a410af07e6c98b260d0c` | `:106` AdaptiveDeps.competencies；`:195-235` AdaptiveInterviewState——`:196` **mind 通道**（`Annotation<InterviewMind>`·default `initMind([])`·**全量 checkpoint 持久化**）；`:213` degraded；`:222` competencyExhaustions；`:232` weightedDeficit（AG-37 三控制字段先例同族） |
| 4 | `packages/ai-graphs/src/adaptive-interview/nodes/plan.ts`（10 行·**零触·分野锚**） | `2cc9b649b68608e6e8fd5634154829184c66cda5` | `:8` `mind: initMind(deps.competencies, deps.maxTurns, deps.absoluteMaxTurns, deps.focusWeaknesses)`——**deps.competencies 唯二消费点之二·仅 start 流向可达**（submit 流向 plan 不可达·§1 红事实 B-④ 机证） |
| 5 | `packages/ai-graphs/src/adaptive-interview/graph.ts`（66 行·**零触**） | `6cdcc122a7992d38f54fd24f32ed0c5927044236` | `:17-66` buildAdaptiveInterviewGraph=**纯构造零 IO**（StateGraph compile+checkpointer·零观察者零外呼）——submit 形「读 checkpoint 后重建图实例」实现形的可行性机证；`:43-54` genQuestion 条件边（换序回环既有） |
| 6 | `packages/domain/src/adaptive-interview.ts`（**零触·单源锚**） | `b4c5fb161b5022dd27ba1c4084b06ca246260353` | `:67` **`InterviewMind.competencies: Competency[]`**（name/confidence/depthProbed/evidence/core/behavioral）；`:188-207` initMind=**保序映射**（`competencies.map(toSpec).map(...)`·start 时 deps 序原序落 mind）；`:219` ingestAssessment 保序 map（只改匹配项 confidence/depth）；`:464` decideNext `[...probeable].sort(...)`=**拷贝排序不重排 mind.competencies**——**mind 序全程稳定=本刀补供源的保序机证** |
| 7 | `apps/worker/src/adaptive-interview-service.ts`（753 行·**零触**） | `373c403283e47342e884465666e390e9de57d1a4` | `:320-345` planCompetencies（`:338-344` 规划失败默认集三件套·`:330-332` biasByPastWeakness 弱项前移**在返回前已完成**→mind 序=含偏置终序）；`:31/:43` MAX_DUPLICATE_REROLL/MAX_ERROR_REROLL=2；`:432-444` grounded 无事实模板早退块（QGEN 件①改形前原位）；`:599-612` AG-F 族内 re-roll 环；`:613-622` error 分类判死臂；`:623-633` business_invalid failure 形（provenance 三键）——族内 failure 经图节点 `:100` 臂交换序判定=**本刀补供的受益通道** |
| 8 | `apps/worker/src/interview-consumer.ts`（**零触·调用方锚**） | `27ddbcf1b0e93f254a5c7be9acb0950828c85364` | `:556` `startAdaptiveInterview(life, role, …, focus, jobPlannerContext)`；`:558` `submitAdaptiveAnswer(life, answerPayload as any)`——两流向同一 `life` deps 载体·consumer 不持 competencies 跨 job（makeDeps 每 invocation 闭包） |
| 9 | `apps/worker/test/adaptive-lifecycle.proof.ts`（332 行·**测试件载体锚**） | `81ebcafb45862eb5a12adaa55e11aed94b0a1fe8` | adaptive-life **43 臂**（b29d861d 门全表值）——本刀新臂载体（lifecycle 全链 scripted 先例形） |
| 10 | `apps/worker/test/ag-f-reroll.proof.ts`（427 行）/`packages/ai-graphs/test/adaptive-interview.proof.ts`（240 行）（**邻面测试锚·零触**） | `866b4108fac36031f1cd7aa3bb99beab64aa7452` / `7d1d140ea3bcca54e726fb0bfe0fd17d142807ad` | 本 base（QGEN 未并）：47 臂/27 臂；QGEN 并线后：**61 臂/34 臂**（QGEN §9-EXEC 字段① 收据值）——§2 门矩阵两态登记依据 |

### 0.2 漂移登记

无（本卷首版·全部行号 @`0ff55592` 实测·无先行同域卷可勘。QGEN 卷对同族文件的 post-EXEC 行漂（generate-question `:116-127`→39 行块等）在 §0.3 两态登记，EXEC 重 pin 以届时树为准）。

### 0.3 现势并发登记（强制）

1. **QGEN-CRITIQUE-RESILIENCE（`line/qgen-critique-resilience`@`22112950`·STOP=executed:awaiting_post_prove_dual·未并主线）**：改 `adaptive-interview-service.ts`（`373c4032`→`3dcc366f`·+17/−0）+`generate-question.ts`（`8a97f9c9`→`c4f88f74`·+27/−0）+两测试件（ag-f 47→61/adaptive-graph 27→34）。**与本刀零文件交点亲证**：本刀修法落点=adaptive-lifecycle.ts+adaptive-lifecycle.proof.ts——与 QGEN 两产品文件+两测试件四件全无交集。QGEN 并线与否仅影响 §2 邻面门基线值（两态登记），不影响本刀修法语义（本刀补供的 `deps.competencies` 消费点 `nextCompetencyAfter` 在 QGEN 件② 前后签名/语义零变）。**本刀+QGEN 合成语义**：QGEN 件① 使模板判重拒绝走族内 failure 形→图族臂；本刀使该族臂在 submit 流向真有序可换——「环境链路死→模板→同文重发→终场」原死链在 submit 流向变帽内可恢复（§1-修法合成项）。
2. **主线 tip 前移处置**：起草窗口主线 tip=`0ff55592`（建树时点亲证）；EXEC 立项时若主线再前移（含 QGEN 并线）照 §8-① 协议并线重 pin。
3. **docs cap**：主线 cap=2184（`0ff55592` sanction 卷·docs:check 2165≤2184 本席亲跑 EXIT=0）；本卷落卷后本树 2166≤2184。

---

## §1 归因链（诊断三约定稿·全 @`0ff55592` 起草席码面逐行亲证）

### 红事实 A：submit 流向换序臂死链（逐段 file:line）

| 段 | 现链（逐段亲证） |
|---|---|
| **① start/submit 形分野** | start 形 `:307`：`makeDeps(d, competencies, …)`——competencies=`:305` planCompetencies 产出（planner invoke·3-5 名·弱项偏置终序）。submit 形 `:361`：`makeDeps(d, [], …)`——**字面空数组**。空的历史合法性：写入该形时 `deps.competencies` 唯一消费点是 plan 节点 `initMind`（§0.1-4 `:8`·仅 start 可达），submit 自 checkpoint 恢复不重跑 plan，空数组行为中性。**`b29d861d`（AG-F 刀F）引入 `:101` `nextCompetencyAfter(deps.competencies, route.competency)` 后中性破缺**——该消费点在 answer 相 genQuestion 重入时活触发，submit 形从此带着空序跑换序臂 |
| **② 环境链路死→族内 failure**（鉴别刀定谳链转录+本席补链） | submit 流向 turn≥1 genQuestion 重入（answer 投影后 decide 路由）→ 环境链路死（provider/检索/Key）→ seam `:599-612` 族内 re-roll（MAX_ERROR_REROLL=2）耗尽 → `:613-633` 族内 failure 形（schema_invalid/provider_malformed/business_invalid/external_outcome_unknown·provenance 三键）→ 图节点 `:93-114` 族臂 |
| **③ 换序臂空转→单发终场** | 图节点 `:100` 族+帽判定通过（帽=competencyExhaustions<2·首次必过）→ `:101` `nextCompetencyAfter([], route.competency)`：`:25` `names=[]`→`:26` `indexOf`=-1→**返回 null**→`:113` `failClosed(...)`（concluded:true）→ `:424-440` writeGenerationUnavailable → `assessment_unavailable` 单发终场。**对照 start 形**：同一失败同点位 `nextCompetencyAfter(planner 序, …)` 命中下一 competency→`:103-110` 换序返回形→`:43-54` 条件边回环重出题（帽内接管）——**同码异命，分野唯在 `:361` 空数组**。QGEN 件①（模板判重拒绝改走族内 failure）与件②（图级 critique 拒帽内可恢复）两件落地后，submit 流向的族臂仍空转——**G7K 红在 submit 流向不因 QGEN 单独翻面**（post 席2 定谳·转录 §立项出处②） |
| **④ plan 节点 submit 流向不可达（负证）** | submit 形三路全不触 plan：i) `alreadyApplied=false` 路必过 `:380-381` stale 门（pending identity 三元组匹配）→图已停在 awaitAnswer interrupt·resume 从 awaitAnswer 重放；ii) `alreadyApplied` 且 next 非空路 `:386-388` `invoke(null)` 续跑挂起任务（genQuestion）；iii) 纯重放路零图执行。图恒已过 START → `initMind` 不重跑 → **补供 competencies 无 plan 节点副作用面**（机证：§0.1-4/5） |

### 红事实 B：submit 流向 competency 合法来源四路评估（诊断约定稿②）

| 路 | 评估 | 裁决 |
|---|---|---|
| **① checkpoint `state.mind.competencies`** | `:363` `before=await g.getState(cfg)` 已在读——mind 为必存 checkpoint 通道（§0.1-3 `:196`·default `initMind([])`），initMind `:188-207` 对 start 时 deps.competencies **保序映射**落 mind（弱项偏置在 planCompetencies 返回前已完成→mind 序=终序）；序稳定机证：ingestAssessment `:219` 保序 map、decideNext `:464` 拷贝排序（domain 单源两处全查）→**mind.competencies 名序≡start 时 planner 序**。旧 checkpoint：mind 键通道自图创始即存，正常开场面必非空；空/缺→缺省臂（§1-修法） | **采纳（唯一正源）** |
| ② interview_question ledger/transcript 投影恢复 | 只含**已问** competency 名（投影时点落行）——未问后缀的 planner 序不可恢复（有损投影） | 否决（有损） |
| ③ submit 时重跑 planCompetencies | 同键 `${threadId}:plan` 或撞 invoke 缓存回放（缓存缺失/过期即 submit 时点真发 planner 模型调用——恰在环境链路死场景必死→`:338-344` 默认集三件套=**与 start 时序漂移的异序**）；弱项偏置按 submit 时点记忆面重派=二次漂移 | 否决（漂移+死链放大） |
| ④ consumer resume 重挂载持序 | `:556/:558` 同一 `life` deps 载体但 competencies 仅在 start job invocation 内闭包存活；consumer 无跨 job competency 持久面 | 否决（无面） |

---

## §1-修法（候选三裁·以实测定谳·修法一件定稿·EXEC 照抄施工）

**候选清册**：

- **甲=submit 形 deps 补 competency 供给**（来源=checkpoint mind.competencies·沿既有持久化面零新持久化）：§1 红事实 B-① 采纳路。answer 相唯一活消费点 `nextCompetencyAfter` 只读名序——mind 序≡start planner 序（保序双机证），补供后 submit 流向换序臂与 start 流向**同码同命**（帽内接管·帽满/全序耗尽真终场原形）。
- **乙=start/submit 统一 deps 工厂**：两形合一工厂内部按相分流（start 现算 planner/submit 读 checkpoint）。行为上与甲在 submit 流向全同，但重排两调用形结构、波及 start 形回归面与两处测试件，diff 面放大数倍而行为增益=零（start 形现状即正确）。**否决**（§1.3-①）。
- **丙=行勘误不修码**（submit 流向模板拒收后直接终场诚实化=现状已是）：QGEN 件① 收据诚实性不疑，但 AG-F 裁决②a「耗尽换 competency 不终场」接管面在 submit 流向**结构性缺席**=设计面半边失效；修法甲零迁移零图包触零新键、缺省臂保形，严格优于登记不动。**否决**（§1.3-②·事实登记面保留在卷）。

**裁决=甲。**

**定稿实现形（`adaptive-lifecycle.ts` `:360-363` 现块 4 行→定稿块 13 行·+10/−1·单 hunk）**——现码（@`0ff55592` 逐字）：

```ts
  const grounding = await loadInterviewResumeGrounding(d);
  const g = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, [], grounding.available, input, grounding.pool));
  const cfg = { configurable: { thread_id: d.interviewId } };
  const before = await g.getState(cfg);
```

定稿：

```ts
  const grounding = await loadInterviewResumeGrounding(d);
  const gInitial = buildAdaptiveInterviewGraph(d.cp, makeDeps(d, [], grounding.available, input, grounding.pool));
  const cfg = { configurable: { thread_id: d.interviewId } };
  const before = await gInitial.getState(cfg);
  // SFC(SUBMIT-FLOW-COMPETENCY-WIRE):submit 流向 competency 补供——start 形 planCompetencies 序经
  // initMind 保序映射落 checkpoint mind.competencies(domain initMind :188 保序+decideNext 拷贝排序
  // 不重排=序全程稳定),此处读回即 start 时 planner 终序(含弱项偏置)。genQuestion 换序臂
  // (nextCompetencyAfter)是 answer 相唯一 deps.competencies 活消费点;plan 节点在本流向不可达
  // (submit 必过 pending identity 门,图恒已过 START)。缺省臂:空/缺 mind(旧 checkpoint)→不重建
  // →空序→既有单发终场逐字节原样。重建=纯构造零 IO(graph.ts buildAdaptiveInterviewGraph 无外呼)。
  const plannerSequence = ((before.values?.mind?.competencies ?? []) as Array<{ name?: string }>)
    .map((c) => (typeof c?.name === 'string' && c.name.length > 0 ? c.name : ''))
    .filter((name) => name.length > 0);
  const g = plannerSequence.length > 0
    ? buildAdaptiveInterviewGraph(d.cp, makeDeps(d, plannerSequence, grounding.available, input, grounding.pool))
    : gInitial;
```

**语义定稿**：i) `before` 读法/时点零变（`:363` 原 getState 原位·alreadyApplied/stale/claim 三路全零触）；ii) 补供仅换 `g` 的 deps 闭包——`nextCompetencyAfter` 名序面语义=start 流向恒等（`sequence.map(names)` 对 string 项恒等）；iii) 缺省臂（空 mind/全空名）=不重建→空序→`:113` failClosed 单发终场**逐字节原样**（旧行为保形臂）；iv) start 形 `:293-346` **零字节零触**；v) 图包/域包/seam/consumer **零触**（消费点签名不变·本刀纯 worker lifecycle 投影层单文件）；vi) 零新 checkpoint 键零迁移零 SSOT——旧 checkpoint/旧消费者忽略新形仍正确（wire/checkpoint 契约义务：mind 键既有通道原键读回·不写回·不回填）。

**量级估计（实测定谳）**：产品 1 文件 +10/−1（±6 行窗）；测试件 1 文件 adaptive-lifecycle.proof.ts 新臂 est 4-6 臂（+80/−0 ±40 窗·§2 载体钉死）；零迁移零 package.json 零锁文件零 SSOT 四卷；EXEC 总 diff=2 tracked 码面+本卷 1 .md+收据目录。**小刀**（对表：约 QGEN 件② 单件量级）。

**合成项登记**：本刀与 QGEN 件①/件② 合成=「环境链路死→seam re-roll 耗尽→族内 failure→**帽内换 competency 重出题**」在 submit 流向全链可达；族外失败（provider_timeout/not_configured/**duplicate_question**/attempt_replay_forbidden/generation_unavailable）与帽满/全序耗尽的单发真终场**全保留零弱化**（§2-neg 断言面）。

## §1.3 否决（两裁·EXEC/双审不得复活）

1. **乙（统一 deps 工厂）=否决**：行为增益零·回归面放大（start 形+两调用点+双测试件）——AG-A/AG-F 历刀均以最小触面落码（「恰 N 产品文件」纪律），本刀沿纪律。EXEC 不得借机重构两调用形。
2. **丙（行勘误不修码）=否决**：诚实终场不等于接管面存在——AG-F 裁决②a 修法②原文「耗尽→不 failClosed 整场→顺延 planner 序下一 competency」在 submit 流向结构性空转=设计面半边失效；甲修法缺省臂严格保形、无回退风险，登记不动劣于小修。丙的事实登记价值已由 QGEN `:286` 字段⑦-3 承载，本卷 §1 归因链转录接续，零信息丢失。
3. **附 Ban**：Ban 触图包（`packages/ai-graphs/**` 零字节——消费点 `:101` 语义零改·本刀只补 deps 供给侧）；Ban 触 seam（adaptive-interview-service.ts 零字节·QGEN 领地）；Ban 新持久化（mind 键既有通道读回·零写回零回填零新键）；Ban 动 start 形（`:293-346` 零字节）；Ban 动 `competencyExhaustions` 帽值/`MAX_COMPETENCY_EXHAUST_SWITCH`（AG-F 裁决②a 可调值·本刀零翻）；Ban focus/quizQuestions/routeLeaf 等 planner 输入面恢复（Non-claims·该面不参与换序语义）。

---

## §2 门矩阵（EXEC 落码后全表行使·本席 docs-only 起草卷零施工·基线值系先例门跑值非静态可推导·EXEC 以届时树实测为准）

| 门 | 键 | 基线（先例值） | EXEC 预期 |
|---|---|---|---|
| 受影响 prove | `prove:adaptive-life`（adaptive-lifecycle.proof.ts·**修法落点包唯一既有门**） | 43 PASS EXIT=0（b29d861d/QGEN 门全表双先例） | EXIT=0 且 PASS ≥43（新臂另计） |
| 邻面 prove | `prove:interview` | 57 PASS EXIT=0（ag-d `6ca9f361`/QGEN 字段① 双先例值） | 原值 EXIT=0 |
| 邻面 prove（两态·§0.3-1） | `prove:ag-f-reroll` | QGEN 未并=47 / 已并=**61**（QGEN §9-EXEC 字段① 收据值·派单 brief 钉 61 为先例口径） | EXIT=0 且 PASS ≥届时先例值（两态如实登记） |
| 邻面 prove（两态·§0.3-1） | `prove:adaptive-graph`（pnpm -C packages/ai-graphs） | QGEN 未并=27 / 已并=**34**（同上） | 同上 |
| 邻面 prove | `prove:g7fix4-reroll` / `prove:adaptive-flow` / `prove:adaptive-degrade` / `prove:adaptive-signals` / `prove:resume-grounding` | 25 / 5 / 11 / 10 / 39 PASS（b29d861d+QGEN 门全表） | 原值 EXIT=0 |
| 新臂 prove（测试件） | 载体钉死=**adaptive-lifecycle.proof.ts**（worker lifecycle 全链 scripted 先例形·零新 proof 文件）：a) **换序接管臂**：submit 流向 turn≥1 族内 failure（scripted）→route 顺延 mind 序下一 competency∧concluded 未置∧零终态事件（帽内）；b) **缺省臂保形**：空 mind（合成 checkpoint）→单发终场原形（assessment_unavailable 收据逐字节）；c) **序保真臂**：换序落点名=checkpoint mind 序恒等断言（弱项偏置终序）；d) **plan 不可达负证臂**：submit 流向 mind.turn 不归零（initMind 不重跑）；e) **neg 臂**：duplicate_question/族外/帽满仍真终场原形∧alreadyApplied 纯重放路零触 | 无（新断言） | 全绿·归测试件（不占产品文件额） |
| neg 零弱化 | 族外失败原形判死（timeout/not_configured/duplicate_question/attempt_replay_forbidden/generation_unavailable）；帽满/全序耗尽真终场；start 形 `:293-346` 零字节；stale/claim/alreadyApplied 三门零位移；competencyExhaustions 帽语义零翻；旧 checkpoint 缺省容错（空 mind→现状字节） | ag-f §A-E+adaptive-life 既有断言 | 全部原值保持 |
| typecheck | `turbo typecheck --force` | 8/8 0 cached EXIT=0（QGEN 字段① 先例） | EXIT=0 零新增 |
| lint | turbo 12/12+root 直跑五值 | root 5235/web 601/api 1421/worker 954/ai-runtime 628 恰等贴线（ai-graphs 47 恒等·本刀零图包触） | 恒等 EXIT=0 |
| neg:all | `pnpm neg:all` 六段 | **687/687**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·QGEN 字段① 先例值） | 原值 EXIT=0 |
| docs:check | `pnpm docs:check` | EXIT=0·本卷落卷后 **2166 ≤ cap 2184**（余 18·本席亲跑在卷） | EXIT=0·届时实数≤届时 cap |
| markers | 改动集五类标记词直扫（四标记词+冲突标记·`scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·**词面不复抄卷内防自指**） | 零命中 | 零命中亲证 |
| diff 面 | `git diff --numstat` 对 base | — | **恰 1 产品文件**（adaptive-lifecycle.ts +10/−1·±6 窗）+测试件 1（adaptive-lifecycle.proof.ts·+80/−0 ±40 窗）+本卷 1 .md+收据目录；零迁移零 package.json 零锁文件零 SSOT 四卷（LEDGER/checklist/issues-master/ai-capability-review）零图包零 seam 零 start 形 |

**STOP=`draft:awaiting_pre_exec_dual`**（本卷第一处·起草席 2026-10-14 终态·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve）——起草席写完即停零码动（本刀恰 1 .md）·⛔push ⛔merge 主线 ⛔force push 未用。

## §3 范围外（零触清单）

start 流向全链（`:293-346` 零字节）；图包/域包/seam/consumer 零字节；QGEN 两件领地（模板旁路块/图级 critique 门——qcr 支线在飞·本刀零触零重键）；`competencyExhaustions`/`MAX_COMPETENCY_EXHAUST_SWITCH` 帽值族（AG-F 裁决②a 可调面·零翻）；`0046` 混合 unscored 放松（AG-F STILL OPEN 既有）；planner 输入面恢复（focus/quizQuestions/routeLeaf——Non-claims）；billing/账本/结算面零触；SSOT 四卷+INDEX 零触（行翻面权归协调方·本卷不自建 SSOT 行）。

## §5 pins（十一值照抄零翻·沿 g7fix4/AG-F/QGEN 卷形）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false —— 脚注：actualSpendCny=null（est live=0：全 scripted/隔离容器零外呼·零 Key 值接触）。

## §8 停止条件

1. **基线漂移**：`0ff55592` 后主线前移（含 QGEN 并线→§2 两态门值按届时树实测重钉·blob 锚 §0.1-2/7 随 QGEN 形漂移如实改锚）→ EXEC 工序1 并线重 pin（merge-tree 预演+实跑·§0 锚逐条复测·结论不变只更行号·漂移如实登记）。
2. **受影响门基线红**：§2 任一基线门在 EXEC 树 EXIT≠0 且非本刀 hunk 所致 → 停·报协调方（非本刀红根不就地修·沿先例承登）。
3. **修法面破约束**：落码 diff 超「恰 1 产品文件+1 测试件」或行漂出 ±窗、或 mind 序保序机证面（domain initMind/decideNext 单源）在 EXEC 时点被他刀改形（序稳定前提破缺）→ 停·rev 重审归因链。
4. **双审否决**：pre-exec 双审任一席 FAIL → 停·按处方 rev（append-only 勘误·零洗卷）。

**STOP=`draft:awaiting_pre_exec_dual`**（本卷第二处=§2 尾·第三处=本行·起草席终态维持·pre-exec 双审会签+协调方授权后方推进 EXEC·alone≠dual·Ban self-approve·Dual PASS ≠ 开工）。

## Non-claims

本卷 ≠ 施工（docs-only·产品码零触·恰 1 .md）≠ QGEN 两件翻面或复核（qcr 支线在飞·本卷仅转录其 post 席2 定谳与字段⑦-3 登记）≠ mind 序≠start planner 序的**对象级**恒等承诺（仅名序恒等——Competency 附加字段 confidence/depthProbed 为会话内活投影·换序语义只读名）；≠ focus/quiz 押题/planner 输入面恢复承诺（该面禁入 checkpoint·不在本刀域）；≠ submit 流向族外失败（duplicate_question 等）可恢复化（族外终场全保留）；≠ 单发终场废除（帽满/全序耗尽/缺省臂终场全保留）；≠ start 形任何行为变更；≠ G7K 全红翻面（本刀翻 submit 流向一族臂·环境链路死根因归 iso-dotenv 刀域）；≠ g7SuiteGreen 翻转 ≠ trio 翻绿。≠ 换序成功路族失败收据（generationProvenance）终态事件面持续可见之承诺（沿 QGEN rev1 P2-④ 同形：mid-graph 换序成功路收据仅存 checkpoint 历史·终场面才完整入事件 payload·零新增可见性承诺）。alone ≠ dual。
