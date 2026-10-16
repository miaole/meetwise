# SUBMIT-FLOW-COMPETENCY-WIRE REQUEST（submit 流向 competency 供给修复刀 · 修法一件=submit 形图 deps 沿 checkpoint mind 序补供 · 恰 1 产品文件 · 零迁移零 DDL 零 SSOT 行零图包触）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席 2026-10-14 落码+门矩阵全绿·修法+6 新臂+wave94 微扩面三臂改写在树·§9-EXEC 七字段+§9-补 裁决处置记录卷尾·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push） · 起草席原态=`draft:awaiting_pre_exec_dual`（2026-10-14·docs-only 恰 1 .md·pre-exec 双审会签 PASS 席1 agent_3befd22c+席2 agent_d3b05119 后协调方授权 EXEC） · base = 主线 `feat/mysql-schema-skeleton` @ `0ff55592`（全 hex `0ff55592`·fetch 后 origin tip 亲证恒等·cap sanction 2184 卷 tip 同指） · 分支 `line/submit-flow-competency-wire` · 工作树 `meetwise-sfc`（`git worktree add ../meetwise-sfc -b line/submit-flow-competency-wire 0ff55592` 本起草席已立·`git worktree list` 恰一本树在册）。

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
**[EXEC 2026-10-14 本处终态更替]** `executed:halted:awaiting_coordinator`（§9-EXEC ⑤ 唯一红=ag-f-reroll §F 三臂·救济面在本刀 diff 面外·§8-② 同形停·报协调方）。
**[wave94 裁决后终态更替]** `executed:awaiting_post_prove_dual`（微扩面授权已执行·ag-f 63/63 绿·§9-补 裁决处置记录·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve）。

## §3 范围外（零触清单）

start 流向全链（`:293-346` 零字节）；图包/域包/seam/consumer 零字节；QGEN 两件领地（模板旁路块/图级 critique 门——qcr 支线在飞·本刀零触零重键）；`competencyExhaustions`/`MAX_COMPETENCY_EXHAUST_SWITCH` 帽值族（AG-F 裁决②a 可调面·零翻）；`0046` 混合 unscored 放松（AG-F STILL OPEN 既有）；planner 输入面恢复（focus/quizQuestions/routeLeaf——Non-claims）；billing/账本/结算面零触；SSOT 四卷+INDEX 零触（行翻面权归协调方·本卷不自建 SSOT 行）。
**[wave94 协调方微扩面授权 2026-10-14·EXEC 席执行]** `apps/worker/test/ag-f-reroll.proof.ts` §F F3a 三臂移入本刀授权面（恰此一件·仅三臂期望随 §1-合成项 语义升级改写·QGEN 件① 拒收收据三键断言面零弱化保形·fixture 与 :517-521 两臂及全文件其余字节零触）——原「QGEN 测试件在面外」限定就此收窄；§5 pins 十一值照抄零翻未触。

## §5 pins（十一值照抄零翻·沿 g7fix4/AG-F/QGEN 卷形）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false —— 脚注：actualSpendCny=null（est live=0：全 scripted/隔离容器零外呼·零 Key 值接触）。

## §8 停止条件

1. **基线漂移**：`0ff55592` 后主线前移（含 QGEN 并线→§2 两态门值按届时树实测重钉·blob 锚 §0.1-2/7 随 QGEN 形漂移如实改锚）→ EXEC 工序1 并线重 pin（merge-tree 预演+实跑·§0 锚逐条复测·结论不变只更行号·漂移如实登记）。
2. **受影响门基线红**：§2 任一基线门在 EXEC 树 EXIT≠0 且非本刀 hunk 所致 → 停·报协调方（非本刀红根不就地修·沿先例承登）。
3. **修法面破约束**：落码 diff 超「恰 1 产品文件+1 测试件」或行漂出 ±窗、或 mind 序保序机证面（domain initMind/decideNext 单源）在 EXEC 时点被他刀改形（序稳定前提破缺）→ 停·rev 重审归因链。
4. **双审否决**：pre-exec 双审任一席 FAIL → 停·按处方 rev（append-only 勘误·零洗卷）。

**STOP=`draft:awaiting_pre_exec_dual`**（本卷第二处=§2 尾·第三处=本行·起草席终态维持·pre-exec 双审会签+协调方授权后方推进 EXEC·alone≠dual·Ban self-approve·Dual PASS ≠ 开工）。
**[EXEC 2026-10-14 本处终态更替]** `executed:halted:awaiting_coordinator`（§9-EXEC 卷尾七字段·post-prove 双审未达·协调方裁决后方推进）。
**[wave94 裁决后终态更替]** `executed:awaiting_post_prove_dual`（§9-补 裁决处置记录·全门矩阵绿·post-prove 双审两独立外席待派）。

## Non-claims

本卷 ≠ 施工（docs-only·产品码零触·恰 1 .md）≠ QGEN 两件翻面或复核（qcr 支线在飞·本卷仅转录其 post 席2 定谳与字段⑦-3 登记）≠ mind 序≠start planner 序的**对象级**恒等承诺（仅名序恒等——Competency 附加字段 confidence/depthProbed 为会话内活投影·换序语义只读名）；≠ focus/quiz 押题/planner 输入面恢复承诺（该面禁入 checkpoint·不在本刀域）；≠ submit 流向族外失败（duplicate_question 等）可恢复化（族外终场全保留）；≠ 单发终场废除（帽满/全序耗尽/缺省臂终场全保留）；≠ start 形任何行为变更；≠ G7K 全红翻面（本刀翻 submit 流向一族臂·环境链路死根因归 iso-dotenv 刀域）；≠ g7SuiteGreen 翻转 ≠ trio 翻绿。≠ 换序成功路族失败收据（generationProvenance）终态事件面持续可见之承诺（沿 QGEN rev1 P2-④ 同形：mid-graph 换序成功路收据仅存 checkpoint 历史·终场面才完整入事件 payload·零新增可见性承诺）。alone ≠ dual。

---

## §9 EXEC 记录（2026-10-14·EXEC 席·pre-exec 双审会签 PASS 席1 agent_3befd22c+席2 agent_d3b05119·协调方 EXEC 授权·**终态=halted:awaiting_coordinator**）

**状态=HALTED（停手纪律：「验收红且口径内修不了/需越界才能继续」·§8-② 同形停·报协调方·非 post-prove 双审 STOP）**——修法+新臂已落码、本刀直触面门全绿；唯一红=ag-f-reroll §F 三臂（QGEN 件① F3a 生命周期臂）与本卷 §1-合成项 的预见语义正面冲突，救济面=QGEN 测试件（本卷恰 1 测试件 diff 面之外）→ 依纪律停手。

**① 并线**：`git merge --no-ff origin/feat/mysql-schema-skeleton`·届时 tip=`7e8ada73`=dcw nail 恰等派单下界·ort 零冲突 12 files +1058/−17（QGEN qgen nail `79a95bb2` 已含·`22112950` 两件随并携入）·merge=`0c1703b4`。

**② §0 全量重 pin（届时树实测）**：`adaptive-lifecycle.ts`=`1e6129ed` 零漂 609 行（:293/:305/:307/:344-346/:354/:357/:360/:361/:363-365/:377-389 行锚全恰等·结论不变只承锚）；QGEN 形漂承载——`generate-question.ts` `8a97f9c9`→`c4f88f74`（181→209 行·:21 MAX=2/:24-29 nextCompetencyAfter/**:102+:142 双活消费点**/:202 成功归零）+`adaptive-interview-service.ts` `373c4032`→`3dcc366f`（753→770 行·:31/:43 帽值/:320 planCompetencies/件① 模板旁路块 ~:443-458）；邻面测试 `ag-f` `866b4108`→`b40d0a28`（568 行）+`adaptive-graph` `7d1d140e`→`5dbd3a35`（360 行）；零漂 blob（state `411e700e`/plan `2cc9b649`/graph `6cdcc122`/domain `b4c5fb16`/consumer `27ddbcf1`/测试载体 `81ebcafb` 332 行）按 hash 恒等承锚。

**③ 修法落点（§1-定稿逐字节+P2-A 注释措辞）**：`adaptive-lifecycle.ts` :360-363 现块 4→17 行·numstat **+15/−2**（P2-B 实测重钉·非双审预估 +14/−2·差一名=P2-A 措辞换行排出 7 行注释）·gInitial 建图→:363 既有 getState 读形零位→plannerSequence 保序读回（`typeof c?.name==='string'` 守卫逐项滤除）→非空重建图闭包（graph 纯构造零 IO）/空走 gInitial 缺省臂（既有单发终场字节原形）。start 形 :293-346 零字节·图包/域包/seam/consumer 零触·零新键零迁移零写回（旧 checkpoint 忽略新形仍正确——mind 键既有通道原键读回）。

**④ 新臂账（adaptive-lifecycle.proof.ts +114/−1·43→49 臂·§2 载体窗 +80±40 内）**：a 换序接管（submit 流向 turn≥1 族内失败 schema 违例经 seam MAX_ERROR_REROLL=2 耗尽→帽内换序重出题·首答 identity accepted·下一题=缓存·done=false·零终态事件）/b 缺省臂保形（`LegacyEmptyMindReadSaver` 恰一次读形接缝合成旧 checkpoint·空 mind→不重建→`interview_unavailable:terminal`·reason=`generation_*`·provenance origin=unavailable·failed+released·零第二题）/c 序保真（checkpoint mind 序≡plan 序含 `协作与沟通` behavioral 尾槽·换序落点=mind 序后继恒等）/d plan 不可达负证（换序后 mind.turn=1 不归零·initMind 不重跑）/e1 neg 族外（补供在场仍真终场·ask t1 恰 1 键零 re-roll）/e2 neg 纯重放（alreadyApplied 零重评·answer_evaluated 恒 1·nextQuestion 恒等）。

**⑤ 门矩阵（届时树实测）**：adaptive-life **49/49 EXIT=0**（43 基线+6 新臂）·adaptive-graph **34/34 EXIT=0**（=79a95bb2 已并先例值·P2-C 承载）·interview **57/57 EXIT=0**·resume-grounding **39/39 EXIT=0**·neg:all **687/687 EXIT=0**（90/90/91/102/179/135）·typecheck turbo --force **8/8 0 cached EXIT=0**·lint turbo **12/12 EXIT=0** 五值恰等贴线（root 5235/web 601/api 1421/worker 954/ai-runtime 628）·docs:check **2170≤cap 2184 EXIT=0**·markers 五类改动集 **0 命中**·diff 面=恰 1 产品+1 测试+本卷（tsbuildinfo 副产 checkout 回滚不入面）。**唯一红：ag-f-reroll 58/61 EXIT=1**——§F F3a 三臂（「turn1 同文模板拒收→无序可换单发终场」/「同文模板零二次发射」/「终场收据诚实可审计」）。**根因定谳（对照实验在卷）**：stash 本刀改动后同树对照跑=**61/61 EXIT=0**（基线漂零嫌疑排除）→ 红系本刀语义所致且系本卷 §1-合成项 预见面：该臂注释原文自证其锚=「submit 侧图 deps 系 planner 序空位（既有架构事实…族臂在该流向无序可换）→既有单发终场原形收场」——恰=本刀归因红事实 A-① 与修法所翻之面；落码后该链（unscored 0 分继续→同文模板拒收 business_invalid∈族→帽内换序）在 submit 流向真达缓存新题继续。**救济=改写 QGEN 测试件三臂期望（done=false·换序缓存·零终态收据→帽内换序收据）→ 落在本卷恰 1 测试件 diff 面之外（§2 diff 面 pin+§8-③ 破约束）→ 非本刀可就地修面 → 停手报协调方**（裁决路径：a 授权后继刀/扩面改写 QGEN §F 三臂·或 b 协调方另裁）。

**⑥ P2 承载落点**：P2-A=§③ 注释（「唯一」→「族内失败换序消费点（deps.competencies；QGEN 件② 批判门为第二换序形·同序消费·本刀补供同覆盖）」·已验 c4f88f74 :102+:142 双消费点·本刀补供同覆盖两形）；P2-B=§③（实测 +15/−2）+§⑤（门值按届时树实测重钉）；P2-C=§⑤（79a95bb2 态 61/34 先例值采纳·34 恒等亲证·61 因本刀语义红非基线漂·对照实验定谳）。

**⑦ 偏离清单（理想零·实二·皆纪律内整理）**：其一 新臂 lint 零增量整理——worker 帽 954 恰等贴线（§2 lint「恒等」pin）·新臂初稿 `(r: any)` 显式注解×4+`thread_id` 字面键 naming 共 +5 warnings 超 帽→去显式注解（上下文型 `(r)`）+`['thread_id']` 计算键形→worker 954 恒等恢复；其二 tsbuildinfo 副产回滚（f731f02a 先例形）。∥**确切命令行**：`git fetch`+`git merge --no-ff origin/feat/mysql-schema-skeleton`（tip 7e8ada73 亲证）·`pnpm adaptive-life:prove`/`pnpm ag-f-reroll:prove`（+stash 对照跑）/`pnpm interview:prove`/`pnpm adaptive-graph:prove`·`node scripts/run-e2e-isolated.mjs resume-grounding:prove:raw`·`pnpm neg:all`·`pnpm exec turbo typecheck --force`·`pnpm exec turbo lint --force`（+worker/root 直跑）·`pnpm docs:check`·markers 五类运行时组装直扫（i6-239 §2-7 口径）∥est live=0（全 scripted/隔离容器零外呼·零 Key 值接触）·actualSpendCny=null∥**STOP=`executed:halted:awaiting_coordinator`（三处 Status/§2 尾/§8 尾同步更替·协调方裁决后方推进·alone≠dual·Ban self-approve）·⛔push ⛔force push 未用**。

### §9-补 wave94 裁决处置记录（2026-10-14·EXEC 席·协调方微扩面授权执行·append 不洗）

**裁决链**：EXEC 停手报协调方（§9-⑦ 唯一红=ag-f-reroll §F F3a 三臂·stash 对照实验亲证红 100% 系本刀补供语义非基线漂）→ **协调方裁决令（wave94）：授权微扩面**——沿 rev3/D7 窄域先例形，特授权扩面恰 1 测试文件 `apps/worker/test/ag-f-reroll.proof.ts`·定性=**语义升级非弱化**（「planner 序自 checkpoint mind 补供→帽内换序缓存继续→终场仅帽满/全序耗尽」正是 G7K 红翻面语义本身·旧期望「deps planner 序空位→无序可换→单发终场」所描述场景已被补供消灭）。

**三臂改写落点（§F F3a·fixture 与 :517-521 两臂及全文件其余字节零触）**：臂一 `:502`「无序可换单发终场:done 收场」→「帽内换序缓存继续：零分收据保持（score=0 unscored 轨迹）·新题 interrupt（done=false·nextQuestionId 在场）」；臂二 `:506`「question_ready 恰 1」→「同文并发模板零二次发射保留∧换序落点=缓存授权模板（question_ready 恰 2·`[1].competency='缓存'`·`[1].question=tmplAuthorized('缓存')`）」；臂三 `:511`「终场收据诚实可审计（interview_unavailable·failed）」→「终场仅帽满/全序耗尽（interview 仍未终场 created·零终态事件·question_ready 恰 2）」+**新增两保留臂**：拒收收据三键零弱化（origin=unavailable·errorCode=business_invalid·invokeError=question_critique_failed——换序成功路收据被成功臂 `generationProvenance: provenance`(approved_template/model) 覆写·转存 checkpoint 历史·经 `getStateHistory` 历史面断言=Non-claims「仅存 checkpoint 历史」形的可审计兑现）+成功归零断言（`competencyExhaustions===0`·「连续」帽只跨失败链·帽未锁死可再换）。C 端 interview 行无 in_progress 迁移（created→completed/failed/abandoned 三终态）·mid-flight=created（首版误写 in_progress 已当场修正）。

**复跑终值**：ag-f-reroll **63/63 EXIT=0**（61−3 旧臂+3 改写臂+2 保留新臂=63·超集绿·非 61 整值如实登记）·adaptive-life **49/49 EXIT=0** 维持·adaptive-graph **34/34 EXIT=0** 维持·typecheck **8/8 0 cached EXIT=0**·lint **12/12 EXIT=0** 五值恰等贴线（root 5235/web 601/api 1421/worker 954/ai-runtime 628·ag-f 编辑零 warning 增量）·docs:check 2170≤cap 2184 EXIT=0·markers 五类改动集 0 命中。

**触面清单更新**：`ag-f-reroll.proof.ts` 移入本刀授权面（§3 append 注记·恰此一件仅 §F F3a 三臂·收据三键断言面零弱化）；§5 pins 十一值照抄零翻未触。

**STOP=`executed:awaiting_post_prove_dual`**（三处 Status/§2 尾/§8 尾同步更替·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push ⛔force push 未用）。

---

## §10 post P2 勘误随卷（nail 期随卷·2026-10-16·append 勘误注记形·§0-§9-补 上文原文零字节改·⛔触码面⛔push）

**裁前案由**：post-prove 双审会签 **PASS**（席1 agent_a935142b+席2 agent_5082222b·两独立外席·窗内复跑收据面见本节 P2-C）·三 P2 本席（nail）逐项复核第一手证据成立·全部 docs-only 注记落卷·零码面零门语义改。**本节系 append 勘误注记形：§0-§9-补 原文零字节改留档，operative 口径以本节注记值为准**（沿 dbacl2 §11/gitleaks §9-POST 同形制·落卷即停）。

**三项逐项落点**：

1. **P2-A（a）tsbuildinfo 外部再生 dirty 处置注记（checkout 归位）**：nail 序1 并线前 `git status` 实测 `apps/web/tsconfig.tsbuildinfo` modified×1——系窗内 typecheck/prove 门跑外部再生副产（非本刀 hunk·§9-⑦ 偏离二同源·`f731f02a` 先例形）·处置=`git checkout -- apps/web/tsconfig.tsbuildinfo` 归位（归位后 porcelain 0 行亲证方并线）→ `git merge --no-ff origin/feat/mysql-schema-skeleton@5b53dd41`=merge `5cf9b6a5`（ort 零冲突 4 files +153/−0）·该文件系构建副产不入任何交付 diff 面·窗内再现同处置不另登记。
2. **P2-B（b）§2/§3 起草期预估值与 §9 实测并存存档注记**：§1-量级行（产品 +10/−1 ±6 窗/测试 4-6 臂 +80±40 窗）与 §2 门矩阵（ag-f 两态 47/61·adaptive-graph 两态 27/34 等）系**起草期预估值**——EXEC/wave94 实测（§9-③ +15/−2·§9-④ +114/−1 43→49 臂·§9-⑤ ag-f 58/61 红→§9-补 63/63 绿·§3 wave94 扩面注记）与之**并存存档**：预估值原文零字节改留档（append-only），operative 门值/diff 面口径以 §9/§9-补 实测值为准（量级定性「小刀·恰 1 产品文件」两态恒等零漂）。
3. **P2-C（c）收据目录勘记（§1 量级行沿 append-only 不动）**：§1 量级行「EXEC 总 diff=2 tracked 码面+本卷 1 .md+**收据目录**」之「收据目录」实测=`.tmp/isolated-proof-receipts/`（`.gitignore:15` `.tmp/` 忽略·**不入树不入 tracked diff 面**）·本刀窗内在册 **11 件**收据 JSON（schema=`local_untrusted_isolated_proof_receipt`：ag-f-reroll ×7（2 failed=§9-⑤ 红窗与改写前对照如实留痕+5 passed）+interview ×2 passed+resume-grounding ×2 passed·终件 ag-f-reroll EXIT=0 `finishedAt=2026-10-16T03:45:35Z`）——**§1 量级行沿 append-only 不动**，本注记为该词唯一通行口径（收据=会话期本地不信任工件·非 tracked 交付物·沿 .tmp 会话隔离纪律）。

**维持面**：§1-修法定稿块+§1.3 否决/Ban+§2 门矩阵语义+§3 边界+§5 pins 十一值+Non-claims——零改零翻转。STOP 三处承 `executed:awaiting_post_prove_dual` 终态·post 双审会签已 PASS·值翻面权归协调方（本 nail 非翻面·沿 gitleaks nail 口径）。

*post P2 勘误随卷 2026-10-16·席1 agent_a935142b+席2 agent_5082222b 双审会签 PASS 授权·本席（nail）随卷笔录·est live=0·actualSpendCny=null·⛔push*
