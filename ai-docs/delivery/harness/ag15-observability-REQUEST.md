# AG15-OBSERVABILITY REQUEST — AG-15 图运行时可观测小刀（issues-final :213/LG-20「ai_graph_run 三列 additive + thread 卡死检测」·0205 迁移三列+写入点最小面+卡死检测 observer 只观测非修复·零行为位移·ag15-observability 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工·开工须协调方明示授权·本 commit 不预 claim 任何 post-commit EXIT·⛔push⛔merge 主线）

**席位**：meetwise 战役「AG-15 图运行时可观测小刀」起草席（AG 盘点 Top3 候选·唯一同时卡 E2E/HA/BUG 三门禁的 P2·协调方派单 brief 2026-10-16·工序=fetch 建支线→读码定稿四项→起草 REQUEST→markers+docs:check 自检落卷 commit）。
**基线**：`main` @ `112e6d26`（=origin tip·本席 `git fetch` 后 `git rev-parse origin/main`=112e6d26fc2705e18c70e9175c6607144eb1185e 亲证·派单下界「origin tip≥fe4079a0」成立亲证=`git merge-base --is-ancestor fe4079a0 origin/main` EXIT=0（fe4079a0=line/context-budget-wire 起草线 tip⊆origin main tip）·主线链头 0204 与派单「迁移链头现 0204→本刀 0205」恒等）· 分支 `line/ag15-observability`（主仓 `git worktree add ../meetwise-ag15 -b line/ag15-observability origin/main` 本起草席亲立·HEAD 落 `112e6d26` 亲证）· 工作树 `meetwise-ag15`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`ai-docs/delivery/ai-capability-review/issues-final.md` **:27** 汇总行+**:213-219** AG-15 详情节（逐字）「AG-15【P2·编排运行时】图运行时可观测性不足：没有"thread 停在非 interrupt、非 END 节点"的卡死检测；ai_graph_run 没有 current_node/last_error/checkpoint_id」·源编号=LG-20·file:line 列=`packages/ai-graphs/src/adaptive-interview/graph.ts:19-29（observer 只记节点名/turn/耗时）；packages/db/src/interview-graph-lease.ts（没有错误字段）；apps/worker/src/interview-consumer.ts:156-169`·修法列原文（CSV :16 逐字）「ai_graph_run 增加 current_node/last_error_code/last_checkpoint_id；周期扫描 next 非空、没有 interrupt、N 分钟没有 job 的 thread，打指标并**自动 invoke(null)**」——**本刀取三列+打指标观测半·「自动 invoke(null)」修复半否决归后继（§1.3 候选甲）**；②协调方派单 brief（2026-10-16·ag15-observability 战役·三列列名钉=**current_node/last_error/checkpoint_id**（较 issues 原文 last_error_code/last_checkpoint_id 收敛为本刀正名·§0.2-2 如实登记）+卡死检测语义=「非 interrupt/非 END 超阈值→可观测事件非自动修复·修复归后继·本刀只观测」）；③AG 盘点 Top3 登记（AG-15=唯一同时卡 E2E/HA/BUG 三门禁的 P2）——本卷不翻盘点行·翻面权归协调方。

**必读清单（EXEC 开工前逐件亲读·显式路径）**：`AGENTS.md`（总则+生成前门禁）·本卷·`ai-docs/delivery/ai-capability-review/issues-final.md` :27+:213-219·`packages/db/src/interview/interview-graph-lease.ts` 全文（87L）·`apps/worker/src/adaptive-lifecycle.ts` 触点段（:15/:46-49/:243-247/:293-346/:354-401）·`packages/ai-runtime/src/langfuse-v5.ts` :15-35（GraphObserver 接口面·本刀零触）·`packages/ai-runtime/src/metrics.ts` :72-119+:121-135·`packages/db/src/index.ts` :55-70+:149-150·`packages/db/migrations/0001_baseline.sql` :26-37·`packages/db/migrations/0149_money_status_constraints.sql` :66-72+:83·`packages/db/migrations/0194_money_consistency_graph_run_terminal.sql`（写点实测节）·`packages/db/migrations/0186_qbank_org_owner_columns.sql`（additive 幂等形先例）·`packages/db/sql/01_schema.sql` :25-36·`apps/worker/src/interview-consumer.ts` :147-169+:595-620·`scripts/schema-drift-check.mjs` 头注·`ai-docs/skills/testing/sop.md`+`ai-docs/skills/testing/fail-closed-gate.md`（P0 测试门）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`112e6d26`·**EXEC 立项照本节对届时 tip 全量重 pin**——基线漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）

### 0.0 防重双对表 + 在飞交叠复核

- `git worktree list | grep -c ag15`=**1**（建后恰本树）；`git branch --list "line/ag15*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep ag15` 建前零命中→落卷后唯一同名卷=本卷。
- **迁移号全 ref 防撞扫描（本席亲跑）**：全 branch/remote-ref（含 worktree remote `ccl/*` 全集）逐 ref `git ls-tree --name-only <ref> -- packages/db/migrations/ | grep 0205` **零命中**→0205 未被任何 ref 占用·本刀认领 0205 合规（认领号对链顶亲数顺延·Ban 抢号）。
- **在飞交叠全支线扫描（本席亲跑 2026-10-16·判据=非 origin/main 祖先分支对本刀八触面末触日期≥2026-10-08）**：唯一实触面=**本地 `feat/mysql-schema-skeleton`@`93b3db5a`（2026-10-17 LEDGER 对账并线 tip·含 origin/main 为祖先·is-ancestor 亲证=origin/main⊆93b3db5a）对本刀两触面有实 content 分歧**：`apps/worker/src/adaptive-lifecycle.ts`（+15/−2·SFC submit-flow-competency-wire `gInitial`/`plannerSequence` 重建块 @:358-364 区·本席 `git diff origin/main 93b3db5a` 亲证·hunk 在 answer impl **构图区**·与本刀触面（:325 后/:388 后观测挂点+文件头 import 区）**零 hunk 交叠**·git 自并零冲突）+`packages/ai-runtime/src/metrics.ts`（+4·UC-028 `aiTracePersistAttempts` @METRIC :107 区+:163 区 registerBaselineMetrics 各一行·本刀 METRIC 增项落 const **尾槽**（`modelInvocationPromptVersionTotal` 行后 `} as const;` 前）·registerBaselineMetrics 增行落其后邻区——**同名文件不同 hunk·git 自并零冲突**）。届时 skeleton 树值预记=adaptive-lifecycle `3b4f05e1`（622L）/metrics `a34c585d`（186L）（本席对 93b3db5a `git hash-object` 亲算）——**若 EXEC 并线该系（任一方向）→对 §0.1 两锚重 pin（非停·ag20/sse-api-family 并线序先例同形）·零 hunk 交叠预证在卷**。余 `backup/*`/`codex/*`/`chore/*` 残枝（末触 2026-08~09-23）+`ccl` 系（=meetwise-ccl 工作树镜像 remote·内容同 93b3db5a 系）全数基线日前残枝/同系镜像→零新在飞触面。**EXEC 立项日必做复核**：对届时全支线重跑本扫描（判据=八触面支线顶新增提交晚于届时基线方计作在飞触面），任一新命中→触停止条件「现场漂移」停手上报。
- **本刀基线选择登记（如实）**：origin tip（默认分支 `main`@`112e6d26`）为基线；本地 `feat/mysql-schema-skeleton`@`93b3db5a` 系**本地未推 in-flight 线**非 origin tip·本刀不落其上（§0.0 上条已登记其两触面分歧与并线序协议）——EXEC 并线方向与时机归协调方。

### 0.1 blob 锚表（`git hash-object` 前 8 位亲算 @`112e6d26`）

| # | 文件 | blob | 行数 | 关键行锚（亲读） |
|---|---|---|---|---|
| 1 | `packages/db/migrations/0001_baseline.sql` | （表 DDL 锚·:26-37） | — | **`:26-35` ai_graph_run 建表八列**（run_id uuid PK·graph_name/thread_id/owner_user_id/status 四 NOT NULL·version int NOT NULL DEFAULT 0·lease_owner/lease_expires_at 双可空）·**:36-37 uq_active_run partial unique** `WHERE status IN ('created','active','waiting_user','migrating','paused')`（五值基线词表） |
| 2 | `packages/db/migrations/0149_money_status_constraints.sql` | （CHECK 锚·:66-72+:83） | — | **`:67-71` ck_ai_graph_run_status** 词表 **11 值**（'created','active','waiting_user','migrating','paused','quarantined','safe_terminating','safely_terminated','succeeded','completed','failed'）NOT VALID·`:83` VALIDATE——本刀零触（词表/约束/号零改） |
| 3 | `packages/db/migrations/0143_db_id_v7_unify.sql` | （:71 锚） | — | `:71` `ALTER TABLE ONLY public.ai_graph_run ALTER COLUMN run_id SET DEFAULT public.uuidv7();`（PK 列名 run_id=N1 点名唯一异名表·零触） |
| 4 | `packages/db/migrations/0194_money_consistency_graph_run_terminal.sql` | `e514427b` | — | 写点实测节原文「interview.service.ts:827-836 career-path latest 行 FOR UPDATE 任意前态→active·interview-graph-lease.ts:42 adaptive-interview 同构」+终态冻结集=「'completed' 单值」——**本刀 UPDATE 面零触终态冻结语义**（观测列写不触 status·触发器 `assert_ai_graph_run_terminal_frozen` 对 NEW 三观测列无谓词零影响亲证） |
| 5 | `packages/db/migrations/0186_qbank_org_owner_columns.sql` | `bba0666c` | — | additive 幂等形先例：`:41`「幂等形：ADD COLUMN IF NOT EXISTS + DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT + CREATE INDEX IF NOT EXISTS」·`:48-49` `ALTER TABLE qbank_source ADD COLUMN IF NOT EXISTS owner_kind text NOT NULL DEFAULT 'platform';`/`org_id text;` 双形（带 DEFAULT 语义列/纯可空列）·「历史迁移 0001-0185 零字节」镜像纪律——件① 形制范本 |
| 6 | `packages/db/sql/01_schema.sql` | `5ae54c19` | 185 | **`:25-34` ai_graph_run CREATE TABLE 八列镜像**（与 0001 同构）·`:35-36` uq_active_run 五值——件② 镜像对齐位（0149 联动先例「packages/db/sql/01_schema.sql fixture 同刀对齐」·drift 方向=sql/ 有迁移缺才红·迁移独有不算·本刀同刀对齐保镜像诚实） |
| 7 | `packages/db/src/interview/interview-graph-lease.ts` | `d30a4048` | 87 | adaptive-interview 图 fence 唯一装配：`:10` `GRAPH_NAME='adaptive-interview'`·**:33-36 INSERT**（status='active'·version=1·lease 载入）·**:42-45 UPDATE 接管臂**（status='active'+version+1·无 status 过滤=0194 实测面）·`:73-78` renewInterviewGraphFence 续租（仅 lease_expires_at）·`:83-86` release 臂（status='waiting_user'）·issues-final :214 触发例子原文「没有错误字段」=本刀三列修复本体·本刀对其**字节零触**（观测写走新 db 模块非 fence 层——fence version 是 fence 语义·观测 UPDATE 零触 version） |
| 8 | `packages/db/src/index.ts` | `3c210e21` | 642 | `:55-70` acquire/releaseLease（mock-interview kernel 两 UPDATE :63/:69）·**:149-150 interview-graph-lease 导出块**（四函数+一 type）=件④ additive 导出插入锚区 |
| 9 | `apps/api/src/modules/interview/interview.service.ts` | `42cf316e` | 887 | career-path 图 ledger 面零改只锚：`:821-838` begin（advisory_xact_lock+latest FOR UPDATE+INSERT :829/UPDATE :833）·`:839-849` commitSuccess（:847 status='succeeded'）·**:851-856 markFailed（:853 status='failed'·形参 `run` 无 error 载体）**——career-path last_error 缺写如实登记归后继（§3-4·ledger seam 签名变更越界）·本刀对 api 面字节零触 |
| 10 | `packages/db/src/commerce/commerce.ts` | `daa07b41` | 641 | `:445-459` safelyTerminateAiGraphRunsOnAbandon 两步 CAS（safe_terminating→safely_terminated·非终态集六值=0149 词表前六）——abandon 面零触（观测列随行保留=历史观测诚实留痕·零清除零回填） |
| 11 | `apps/worker/src/adaptive-lifecycle.ts` | `1e6129ed`（届时 skeleton 并线重 pin `3b4f05e1`/622L） | 609 | **`:15` `import type { ModelClient, GraphObserver } from '@meetwise/ai-runtime';`（件⑥ (a) 扩值导入位）·`:5-12` @meetwise/db import 块（件⑥ (a) 扩 db 导入位）·`:46-49 pendingQuestion`（concluded/generationFailure 早退→`snap.values?.pending ?? snap.tasks?.[0]?.interrupts?.[0]?.value`）·`:140 graphObserver?` 字段（vendor OTel 观测 seam·本刀零触）·**:243-247 runGraph**（graphObserver.runGraph 包装·phase 'start'/'answer'）·`:293 startAdaptiveInterviewImpl`·**:318-326 start snap 块**（:318 初读→:319 pending 早退→:321/:323 invoke(null/{}/`{}` 二分)→:325 `snap = await g.getState(cfg);` 刷新=**件⑥ (d)-1 挂点（:325 行后）**）·`:354 submitAdaptiveAnswerImpl`·**:377-389 answer snap 三路**（:377 纯重放 snap=before 零观测·:385 resume invoke 后·:388 invoke(null) 后=**件⑥ (d)-2 挂点（:389 else-if 块闭后 :390 transcript 读前）**）·`:398-401` next/done 读算·`:424/:506` generationFailureOf 两读算点（观测分类器独立重算不触） |
| 12 | `packages/ai-runtime/src/langfuse-v5.ts` | `63d5466c` | 199 | GraphObserver 契约（**:32-35 runGraph/runNode**）+`:23-29` GraphNodeObservation node 六值枚举（'plan'/'decide'/'genQuestion'/'awaitAnswer'/'evalAnswer'/'conclude'）——**vendor OTel 观测面本刀零触**（件⑥ db 观测独立于 GraphObserver·经 runGraph 包装层外围·零依赖零组合根改） |
| 13 | `packages/ai-graphs/src/adaptive-interview/graph.ts` | `6cdcc122` | 66 | issues-final :214 锚原文「observer 只记节点名/turn/耗时」本体=**:17-31 observed 包装器**（runNode 六节点）+拓扑注释 :10「plan → decide → genQuestion → (pending ? awaitAnswer(interrupt) : conclude) → evalAnswer → decide*」+`:7` `import { END, START, StateGraph … } from '@langchain/langgraph'`（END 哨兵名源）——**本刀字节零触**（ai-graphs 包全零触） |
| 14 | `packages/ai-runtime/src/metrics.ts` | `c5a3d39e`（届时 skeleton 并线重 pin `a34c585d`/186L） | 183 | `:20-59 createMetrics`（counter/histogram/gauge+Prom text）·`:60-61` setMetrics/getMetrics·**:72-118 METRIC const**（snake_case `*_total` 族·:75 注「label 只放低基数维度…绝不放 owner/PII/原文」·**:117 `modelInvocationPromptVersionTotal: 'model_invocation_prompt_version_total',` 尾项+:118 `} as const;`**=件⑤ 增项插入位）·**:121-135 registerBaselineMetrics**（预注册基线 0 序列族·`:129-131` inc(_,undefined,0) 形=件⑤ 基线行插入位） |
| 15 | `apps/worker/src/interview-consumer.ts` | `27ddbcf1` | 657 | issues-final :214 第三锚（**:147-169 terminalizeUnsettledInterview**——'job_failed'/'worker_died'/'retry_exhausted' 三 reason·failInterviewAndRelease+assessment_unavailable/interview_unavailable 事件·**对 ai_graph_run 零写**=「监控看不到信号」消费面本体）·`:360` 心跳续租注·`:595-620` reaper worker_died 面本刀零触（last_error 消费面写归后继·§3-4·本刀 last_error 供源=观测分类器 generation 形） |
| 16 | `apps/worker/test/adaptive-consumer.proof.ts` | `2eb0703e` | 470 | AG-04 刀终形（blob 与其卷 §9 记录恒等·470L）·`:19` `const A = (n,c)=>{…}` 断言助手（`A(` 直数 33+动态臂·ag04 卷 §9 记 runner **35/35** 权威）——邻面门 adapt位·本刀零触 |
| 17 | `apps/worker/package.json` | `e69420d4` | 180 | `:11-25` prove 注册块（:24 `prove:ag-d-admission`·:25 `prove:bill1-topic-fields`…）·`:56` `prove:adaptive-consumer`——件⑧ 新 prove 注册插入位=block 内邻区 |

**门基线锚（对届时实测）**：docs:check cap **2184**（`scripts/ai-docs/public-text-policy.mjs` **:98** `const MAX_FILES = 2_184`·本席亲读·**main 系 cap≠skeleton 系 2200**——两系 cap 分叉如实登记·cap sanction 权归协调方·Ban 自升）·起草树 scanned **2166**（本席 `node scripts/ai-docs/check-docs.mjs` EXIT=0 亲跑·余 18；落卷后 2167·EXEC +3 新码文件+收据 ≈2170-2171 仍 ≤2184）·迁移链 **204 文件头 0204_ai_cost_cached_input_price.sql**（本刀 0205 认领·§0.3）·uniqueness `files=204 violations=0`（届时 205 对实跑）·adaptive-consumer runner **35 PASS**（`2eb0703e` 权威=ag04 卷 §9 记录·直数 33+动态臂·对届时实跑）·interview.proof `A('` 直数 45/adaptive-lifecycle.proof 在场（邻面族对届时实跑）·metrics METRIC 项数 43（`:72-118` 分号项亲数·届时 +1=44 对实测）。

### 0.2 读码定稿三登记（结论零变·如实钉形）

1. **ai_graph_run 现列清单定谳（a 项）**：八列=`run_id uuid PK DEFAULT gen_random_uuid()→uuidv7()（0143:71）`·`graph_name text NOT NULL`·`thread_id text NOT NULL`·`owner_user_id text NOT NULL`·`status text NOT NULL`（0149 :67-71 CHECK 11 值 NOT VALID→:83 VALIDATED）·`version int NOT NULL DEFAULT 0`（fence 语义）·`lease_owner text`·`lease_expires_at timestamptz`；+uq_active_run partial unique（0001 :36-37·五值谓词）；RLS=0059 :51-53 p_owner + :101-104 写护栏触发器 `enforce_interview_projection_privacy_active('thread_id')`（BEFORE INSERT OR UPDATE·观测 UPDATE 走 owner principal 同 lease 写路=同过触发器·零新豁免）。**生产写入点全集（rg 亲证五处）**：interview-graph-lease.ts :33/:42/:73/:83（adaptive-interview 四臂）·interview.service.ts :829/:833/:847/:853（career-path 四臂）·commerce.ts :449/:456（abandon 两步 CAS）·db/src/index.ts :63/:69（mock-interview kernel 两臂）·测试/proof 直插面（runtime-kernel.proof :43 等=夹具非生产）。**三列零现状**：全 migrations 对 ai_graph_run 无任何 ADD COLUMN（rg 亲证·唯 0149 约束操作+0143 DEFAULT）——issues-final :213 缺口成立。
2. **三列列名定谳**：派单钉名=**current_node/last_error/checkpoint_id**（较 issues-final 原文 `last_error_code/last_checkpoint_id` 去 `_code`/`_checkpoint` 中缀——列名收敛非语义收窄：last_error 存标量错误码/reason 串（interview_job.last_error `text` 命名先例·0001 :262 区）·checkpoint_id 存 LangGraph checkpoint 标量 id（0043 checkpoints 表 `checkpoint_id text` 同名同型先例·:7-10）——两先例在树·正名如实登记·EXEC 不得再改列名）。
3. **checkpoint_id 供源定谳**：LangGraph `StateSnapshot.config.configurable.checkpoint_id`（PostgresSaver put 返回形先例=`packages/db/test/uc052-checkpoint-physical.proof.ts` :137-151 `next.configurable?.checkpoint_id ?? checkpoint.id` 亲证）——观测分类器读 `snap.config?.configurable?.checkpoint_id ?? null`·缺省臂=旧 checkpoint/空线程 NULL（缺席≠零铁律：NULL=「尚无观测」非「无 checkpoint」）。

### 0.3 迁移号登记（认领 0205）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`（=派单「迁移链头现 0204」恒等）。
- 本刀认领 **0205**（`0205_ai_graph_run_observability_columns.sql`）·全 ref 防撞扫描零命中（§0.0）·additive 单文件三语句（§1-修法件①）·镜像同刀对齐（件②·0149 联动先例）。EXEC 期若实测产生非预期第二迁移→停（越界需要类）上报。

## §1 红事实与读码定稿（机制链全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 可观测缺口机制链（四环·逐环 file:line 亲证）

1. **列缺口**：ai_graph_run 八列（§0.2-1）无一承载「图执行到哪/错在哪/checkpoint 何处」——issues-final :213 前半成立；fence 层（d30a4048）四臂全部只写 status/lease/version 三族=「没有错误字段」原文逐字兑现。
2. **观测断层（vendor 有·DB 无）**：graph.ts :17-31 observed 包装器把六节点喂给 `deps.graphObserver.runNode`（turn/stateVersion 只有内存标量）·langfuse-v5（63d5466c）把 run/node span 导出 OTel——但 **ai_graph_run 行自 INSERT（:33 status='active'）后直到 lease release（:83 waiting_user）或 abandon CAS（commerce :445-459）或 career-path 终态（svc :847/:853）再无任何「图内位置/错误」落库**；adaptive-interview run 无生产终态写点（:83 臂只到 waiting_user）——AG-05 形卡死（checkpoint 停 `next=[genQuestion]` 无 interrupt）期间该 run 行 status='waiting_user'/'active' 与正常等题行**逐字节不可分**。
3. **消费面盲区**：interview-consumer.ts :147-169 terminalizeUnsettledInterview 三 reason（job_failed/worker_died/retry_exhausted）全部走 interview/interview_event 面·对 ai_graph_run 零写（:657 全文件 rg 亲证零 `ai_graph_run` 字样）——issues-final :214「监控上看不到任何信号，只能等用户投诉」消费侧本体。
4. **AG-05/AG-26 修复面已收窄卡死存量但检测面仍零**：adaptive-lifecycle :318-326（start：next 非空→invoke(null) 续跑）+:386-389（answer：alreadyApplied∧next 非空∧无 pending→invoke(null) 续跑）两修复在树=**覆盖「重投时可续跑」面**；残余卡死面=续跑失败/无 job 可投/thread 孤悬（reaper 三臂 :595-620 只管 interview_job 行）——该残余面对本刀三列+observer 恰为可观测面（**修复仍归后继·本刀只观测**）。

### 1.2 卡死检测语义定谳（c 项·观测-only）

- **卡死形状谓词（定稿）**：对 thread 快照 snap——`done = (snap.next?.length ?? 0) === 0`；`pending = pendingQuestion(snap)`（:46-49 既有助手复用）；`failure = generationFailureOf(snap)`（:27-44 既有助手复用）。**卡死形状=`!done && !pending && !failure`**（next 非空=非 END ∧ 无 interrupt 挂起 ∧ 非生成失败退场）——即 AG-05/AG-26 注释原语「next 非空且无 pending interrupt」（:320/:386 守卫同款谓词·零新原语）。
- **current_node 列值域（定稿）**：`'END'`（done 臂·failure 退场臂同落 END+last_error）∪ `'interrupt:<node>'`（pending 臂·`<node>`=snap.next[0]·正常等题）∪ **裸节点名**（卡死形状·如 `genQuestion`）∪ `NULL`（尚无观测·含全部存量行——零回填）。
- **「超阈值」定谳（无墙钟·零新列）**：观测点=runGraph 边界（start :325 后/answer :389 后）·每次观测**先读后写**（readGraphRunObservation 读旧 current_node→recordGraphRunObservation 写新值）——**阈值命中=卡死形状被重复观测：`position.stuck && previous?.currentNode === position.currentNode && previous != null`**（同名裸节点跨两次边界观测=至少跨一个完整 job 投递周期仍停留——真卡死面恰由 reaper 重排重投（AG-05 形）供给第二次观测·墙钟 N 分钟阈值归读侧/告警轨后继·本刀零墙钟零新列）。命中动作=**仅两件可观测物**：`getMetrics().inc(METRIC.graphRunStuckObserved)`（counter·零 label 低基数纪律）+`console.error('graph_run_stuck_observed', {interviewId, node})` 结构化行。**零 invoke(null) 零重排零终态化零业务投影**——修复半否决承（§1.3）。
- **首观测语义**：卡死形状首次观测只落列（current_node=裸节点名·可查询持久痕）不 emit——durable 列使「线程停摆」对 SQL/监控可查询；「N 分钟没有 job 的 thread 周期扫描」半归可观测轨后继（§1.3 候选丙·本刀零 sweep 零 worker 循环零 main.ts 触）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（否决·Ban）=「自动 invoke(null)」修复半**（issues-final 修法列原文后半）：①adaptive-lifecycle :321/:323/:384/:387 四个既有 invoke(null/`{}`/resume) 位=AG-05/AG-26 已修面·在观测点再 invoke=与 fence/version 竞态重入（0194 冻结触发器+lease 竞争面）·行为位移不可界；②卡死残余面成因未定谳（续跑失败/无 job/孤悬三形）·盲修=对未知根因自动写库；③派单 brief 明钉「非自动修复——修复归后继·本刀只观测」。**观测与修复分刀=本战役裁决。**
- **候选乙（否决·Ban）=告警外呼/周期扫描循环**（issues-final「周期扫描…打指标」整半）：sweep 循环需 main.ts 接线+worker 循环+阈值墙钟列——三面全出本刀最小面；告警外呼（webhook/PagerDuty 形）零在树先例。指标 emit（counter）+durable 列=本刀观测载体·读侧告警归可观测轨后继。
- **候选丙（否决·Ban）=大表重构/新表**（graph_run_event append 流水表/时间戳列组）：三列派单钉死 additive 零新表零新列（含零 updated_at——「超阈值」已按 §1.2 重复观测语义消解墙钟需求）·`ALTER TYPE`/词表改零触。
- **候选丁（否决·Ban）=fence 层顺带写观测列**（interview-graph-lease 四臂内联）：fence version 是接管裁判（:40-46）·观测 UPDATE 若触 version=接管语义漂移；即便零触 version·fence 层无 snap 在手（checkpoint_id/current_node 不可得）·伪挂点。观测走独立 db 模块=件③。
- **候选戊（否决·Ban）=GraphObserver 接口扩形**（langfuse-v5 增方法/GraphNodeObservation 扩字段）：vendor 观测面=全服务共享契约（ai-graphs 零供应商依赖纪律 :31 注原文）·扩形=包级面扩大；本刀 db 观测独立于该接口（零组合根改零依赖改）。

## §1-修法（恰 8 码/test/doc 路径：3 新 5 改·迁移认领 0205·**以下定稿文本 ⛔ 不得更改——EXEC 逐字节照抄·Ban 自由发挥**）

- **编辑顺序纪律**：件①→②→③→④→⑤→⑥→⑦→⑧ 依序；或内容锚 rg 定位套用·禁按卷面行号盲套（并线后行号漂移以内容锚为准）。
- **件①（新建 `packages/db/migrations/0205_ai_graph_run_observability_columns.sql` 全文）**：
```sql
-- 0205_ai_graph_run_observability_columns.sql — AG-15 图运行时可观测三列 additive（issues-final :213/LG-20 修法半）。
--
-- REQUEST：ai-docs/delivery/harness/ag15-observability-REQUEST.md（pre-exec 双审+协调方开工授权后 EXEC）。
-- 列语义（§1.2 定稿）：current_node ∈ {'END'} ∪ {'interrupt:<node>'} ∪ {裸节点名} ∪ NULL（尚无观测）；
--   last_error=最近一次边界观测的错误标量（generation_* reason 族·无失败=NULL·interview_job.last_error
--   text 命名先例）；checkpoint_id=LangGraph StateSnapshot.config.configurable.checkpoint_id（0043
--   checkpoints.checkpoint_id text 同名同型先例·缺省 NULL）。
-- additive 形制（0186 :41/:48-49 幂等形先例）：三列全可空零 DEFAULT 零回填（存量行 NULL=「尚无观测」
--   诚实语义·缺席≠零）·零约束零索引零词表触（0149 十一值 CHECK 零改）·零 RLS/授权触（0059 p_owner
--   表级策略自然覆盖·写者=既有 owner principal 写路）·历史迁移 0001-0204 零字节（镜像纪律只加新迁移）。
-- @migration-mode multi-statement

ALTER TABLE ai_graph_run ADD COLUMN IF NOT EXISTS current_node text;
ALTER TABLE ai_graph_run ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE ai_graph_run ADD COLUMN IF NOT EXISTS checkpoint_id text;
```
- **件②（`packages/db/sql/01_schema.sql` :25-34 镜像对齐·0149 联动先例「fixture 同刀对齐」）**：CREATE TABLE ai_graph_run 的 `lease_expires_at timestamptz` 行后插一行 `  current_node text,                                           -- AG-15:最近观测图位置(END/interrupt:<node>/裸节点/NULL=尚无观测)`、`  last_error text,                                             -- AG-15:最近观测错误标量(无失败=NULL)`、`  checkpoint_id text                                           -- AG-15:最近观测 LangGraph checkpoint id`（**尾行无逗号**·镜像与迁移零漂——drift 门对届时亲跑）。
- **件③（新建 `packages/db/src/interview/graph-run-observability.ts` 全文）**：
```ts
/**
 * AG-15 图运行时可观测（issues-final :213/LG-20）：ai_graph_run 三观测列（current_node/last_error/
 * checkpoint_id）的哑读写面。只观测零修复：本模块零业务语义零终态化零 fence 触——UPDATE 恒零触
 * version/lease/status（version=fence 接管裁判·0194 冻结触发器面零触），行谓词=uq_active_run 活行集
 * （0001 :36-37 词表+0149 前六值·终态行不写=历史观测诚实留痕）。
 */
import type { Client } from '../principal.ts';

/** 活行集=uq_active_run partial unique 谓词词表（终态 succeeded/completed/failed/safe_terminating/
 *  safely_terminated 行不写——观测只对在飞 run 落痕）。 */
const LIVE_RUN_STATUSES = "('created','active','waiting_user','migrating','paused','quarantined')";

export interface GraphRunObservationRecord {
  graphName: string;
  threadId: string;
  owner: string;
  currentNode: string | null;
  checkpointId: string | null;
  lastError: string | null;
}

/** 读最近活行观测值（无活行=NULL·读侧供卡死阈值比对）。 */
export async function readGraphRunObservation(
  c: Client, graphName: string, threadId: string, owner: string,
): Promise<{ currentNode: string | null } | null> {
  const r = await c.query<{ current_node: string | null }>(
    `SELECT current_node FROM ai_graph_run
      WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 AND status IN ${LIVE_RUN_STATUSES}
      ORDER BY version DESC LIMIT 1`,
    [graphName, threadId, owner],
  );
  const row = r.rows[0];
  return row ? { currentNode: row.current_node ?? null } : null;
}

/** 写三观测列（零触 version/lease/status·rowCount 返回供 fail-soft 观测·零业务分支）。 */
export async function recordGraphRunObservation(c: Client, rec: GraphRunObservationRecord): Promise<number> {
  const r = await c.query(
    `UPDATE ai_graph_run SET current_node=$4, last_error=$5, checkpoint_id=$6
      WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 AND status IN ${LIVE_RUN_STATUSES}`,
    [rec.graphName, rec.threadId, rec.owner, rec.currentNode, rec.lastError, rec.checkpointId],
  );
  return r.rowCount ?? 0;
}

/** 卡死形状列侧谓词（§1.2 值域定稿）：裸节点名=非 END 非 interrupt: 前缀的非空值。 */
export function graphRunPositionIsStuck(currentNode: string | null): boolean {
  return currentNode !== null && currentNode !== 'END' && !currentNode.startsWith('interrupt:');
}
```
- **件④（`packages/db/src/index.ts` :150 后邻区）**：`export type { InterviewGraphFence } from './interview/interview-graph-lease.ts';` 行后插 `export { readGraphRunObservation, recordGraphRunObservation, graphRunPositionIsStuck, type GraphRunObservationRecord } from './interview/graph-run-observability.ts';`
- **件⑤（`packages/ai-runtime/src/metrics.ts`）**：(a) METRIC const 尾项 `modelInvocationPromptVersionTotal: 'model_invocation_prompt_version_total',` 行后、`} as const;` 行前插：
```ts
  // AG-15 卡死检测（只观测非修复·issues-final :213）：thread 停在非 interrupt/非 END 形状被重复观测
  // （同名裸节点跨两次 runGraph 边界观测=跨一个完整 job 投递周期仍停留）计数。零 label（低基数纪律）。
  // 稳态=0，>0 即有 thread 卡在中间节点——修复面归后继刀，本指标只承载「可见性」（AG-05 盲区消解半）。
  graphRunStuckObserved: 'graph_run_stuck_observed_total',
```
  (b) registerBaselineMetrics 内 `m.inc(METRIC.aiTracePersistFailures, undefined, 0);` 行后邻区插 `m.inc(METRIC.graphRunStuckObserved, undefined, 0);`
- **件⑥（`apps/worker/src/adaptive-lifecycle.ts`）**：(a) `:15` 扩为 `import { getMetrics, METRIC, type ModelClient, type GraphObserver } from '@meetwise/ai-runtime';`（interview-consumer.ts :8 同形先例）·@meetwise/db import 块（:5-12）`writeTopicShadowMeter,` 后增 `readGraphRunObservation, recordGraphRunObservation, graphRunPositionIsStuck,`；(b) `pendingQuestion`（:46-49）定义后插两函数：
```ts
/** AG-15 卡死检测（§1.2 语义定稿·纯函数零 IO）：done→'END'；pending→'interrupt:<next[0]>'；
 *  其余（next 非空∧无 interrupt∧非 failure）→裸节点名=卡死形状。failure 臂 lastError 带 generation_* reason。 */
export function classifyAdaptiveRunPosition(snap: any): { currentNode: string; stuck: boolean; lastError: string | null } {
  const failure = generationFailureOf(snap);
  const lastError = failure ? failure.reason : null;
  if ((snap.next?.length ?? 0) === 0) return { currentNode: 'END', stuck: false, lastError };
  const pending = pendingQuestion(snap);
  if (pending) return { currentNode: `interrupt:${String(snap.next[0] ?? 'awaitAnswer')}`, stuck: false, lastError };
  const node = String(snap.next[0] ?? 'unknown');
  return { currentNode: node, stuck: true, lastError };
}

/** AG-15 卡死阈值（§1.2 定稿）：卡死形状被重复观测（前次观测已写同名裸节点）=超阈值。 */
export function graphRunStuckThresholdCrossed(previous: { currentNode: string | null } | null, position: { currentNode: string; stuck: boolean }): boolean {
  return position.stuck && previous != null && previous.currentNode === position.currentNode;
}
```
  (c) `runGraph`（:243-247）定义后插 fail-soft 观测器：
```ts
/* ───────── AG-15 图运行时可观测（issues-final :213·只观测非修复）─────────
 * 挂点=runGraph 边界 snap 终读后（start :325 后/answer :389 后两处·投影事务之外）·fail-soft 沿
 * writeShadowMeterSoft 先例（:93-97·写失败仅 stderr 观测零业务阻断）。零触 fence/version/status
 * （db 模块行谓词面）·零修复（Ban invoke(null)/重排/终态化——§1.3 候选甲否决承）·观测失败零上抛。 */
async function observeGraphRunPosition(d: AdaptiveLifecycleDeps, snap: unknown): Promise<void> {
  try {
    const position = classifyAdaptiveRunPosition(snap);
    const checkpointId = (snap as { config?: { configurable?: { checkpoint_id?: unknown } } } | null | undefined)
      ?.config?.configurable?.checkpoint_id;
    await asPrincipal(d.pool, d.owner, async (c) => {
      const previous = await readGraphRunObservation(c, 'adaptive-interview', d.interviewId, d.owner);
      await recordGraphRunObservation(c, {
        graphName: 'adaptive-interview', threadId: d.interviewId, owner: d.owner,
        currentNode: position.currentNode, checkpointId: typeof checkpointId === 'string' ? checkpointId : null,
        lastError: position.lastError,
      });
      if (graphRunStuckThresholdCrossed(previous, position) && graphRunPositionIsStuck(position.currentNode)) {
        getMetrics().inc(METRIC.graphRunStuckObserved);
        console.error('graph_run_stuck_observed', { interviewId: d.interviewId, node: position.currentNode });
      }
    });
  } catch (error: unknown) {
    console.warn('graph_run_observability_write_failed', { interviewId: d.interviewId, error: String((error as Error)?.message ?? error) });
  }
}
```
  (d) 两挂点：start impl `:325` `    snap = await g.getState(cfg);` 行后插 `    await observeGraphRunPosition(d, snap);`（:319 pending 早退重放臂零观测=零图迁移零观测·如实口径）；answer impl `:386-389` else-if 块闭 `  }` 后、`:390` transcript 读前插 `  await observeGraphRunPosition(d, snap);`（:377 纯重放臂同上零观测口径·两挂点均在投影事务 `:403 asPrincipal` 之外=零事务内触）。
- **件⑦（新建 `apps/worker/test/graph-run-observability.proof.ts`+注册）**：纯函数+stub 客户端+静态锚四组臂（零 DB 零外呼零 env·`tsx` 直跑·**免 runner 注册**——沿 ag20 件⑩ 先例），约 18 臂 4 组：**组A classifyAdaptiveRunPosition 纯分类**（A1 done snap→'END'/stuck=false；A2 pending snap（tasks[0].interrupts[0].value 形）→'interrupt:awaitAnswer'/stuck=false；A3 next=['genQuestion'] 无 pending 无 failure→裸节点/stuck=true；A4 degraded conclude（generationProvenance.origin='unavailable'+next 空）→'END'+lastError 带 generation_ 前缀；A5 同 snap 双调恒等（确定性））。**组B 阈值谓词**（B1 首观测 previous=null→false；B2 前后同名裸节点→true；B3 前后异名→false；B4 前次 interrupt: 形→false；B5 stuck=false→false）。**组C db 模块 stub 客户端**（C1 recordGraphRunObservation SQL 含 `SET current_node=$4, last_error=$5, checkpoint_id=$6` 且**零 `version` 字样零 `status='`** 赋值（stub 记 SQL 串断言）+LIVE_RUN_STATUSES 六值在 WHERE；C2 readGraphRunObservation 返回 {currentNode}；C3 graphRunPositionIsStuck 五值域（'genQuestion'true/'END'false/'interrupt:awaitAnswer'false/null false/''false）；C4 stub 拒绝 query→recordGraphRunObservation 上抛（本模块诚实上抛·fail-soft 归 observeGraphRunPosition 层——静态锚 C5 承）；C5 adaptive-lifecycle.ts 静态锚（readFileSync：observeGraphRunPosition 含 try/catch+`console.warn('graph_run_observability_write_failed'`·两挂点 `await observeGraphRunPosition(d, snap);` 恰 2 处·零 `invoke(null` 新增（卡死臂零修复静态证）·metrics.ts 含 `graphRunStuckObserved: 'graph_run_stuck_observed_total'`·index.ts 含 graph-run-observability 导出·0205 迁移三 ADD COLUMN·01_schema 镜像三列））。注册=`apps/worker/package.json` :25 后邻区加 `    "prove:graph-run-observability": "tsx test/graph-run-observability.proof.ts",`。
- **守恒断言**：`packages/db/src/interview/interview-graph-lease.ts`（`d30a4048`）/`packages/ai-runtime/src/langfuse-v5.ts`（`63d5466c`）/`packages/ai-graphs/src/adaptive-interview/graph.ts`（`6cdcc122`）/`apps/worker/src/interview-consumer.ts`（`27ddbcf1`）/`packages/db/src/commerce/commerce.ts`（`daa07b41`）/`apps/api` 全包/0149 词表面 **零字节零触**（机械保证=各 blob 门机检）·diff 面恰 8 码/test/doc 路径（3 新 5 改·件①②③④⑤⑥⑦⑧）+本卷 .md。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·**数字口径以实跑实测为准+偏差熔断**·命令原样可复制）

0. **改前基线 run（必做·恰 1 次）**：基线树 `git fetch`+重 pin 后·`git hash-object apps/worker/src/adaptive-lifecycle.ts` 对 `1e6129ed` 前缀亲证·`ls packages/db/migrations | wc -l`=204 头 0204 亲证·`node scripts/ai-docs/check-docs.mjs` EXIT=0（scanned≤2184）。
1. **新 prove**：`pnpm -C apps/worker prove:graph-run-observability` EXIT=0（臂数对届时实测·构成=件⑦ 四组·组B B2 阈值臂+组C C1 零 version 触臂+组C5 零新增 invoke(null) 静态臂必须 PASS）。
2. **migrate 链 205**：`pnpm migrate:prove` EXIT=0·链头实测=**0205**（=204+件①·多出 0206+ 即停·越界需要类）。
3. **drift+uniqueness**：`pnpm drift:prove` EXIT=0 零漂移（件② 镜像同刀对齐亲证）·`node scripts/check-migration-version-uniqueness.mjs`→`files=205 violations=0`（exemptions 沿届时现值如实记）。
4. **adaptive-consumer 邻面**：`pnpm adaptive-consumer:prove` EXIT=0 **35 PASS**（`2eb0703e` 权威=ag04 卷 §9·对届时实跑·≠35 停如实归因）。
5. **图行为邻面三族**：`pnpm adaptive-life:prove` + `pnpm adaptive-flow:prove` + `node scripts/run-e2e-isolated.mjs reaper:prove:raw` 全 EXIT=0（臂数对届时实测·对基线零回退口径·scripted deps 观测挂点 fail-soft 零位移实证）。
6. **neg 门**：`pnpm neg:all` EXIT=0（段值对届时实测·总臂差≠0 如实登记归因）。
7. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8 successful, 8 total·0 cached）。
8. **lint 贴边**：`pnpm turbo lint` 全任务 0 errors·五值恰等贴边（root/web/api/worker/ai-runtime 对届时实测·零第六红·出现即停）。
9. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**scanned≤cap 2184**（预期 ≈2170-2171=2166+本卷 1+件①③⑦ 三新+收据·**>2184 红停上报**·cap sanction 权归协调方·Ban 自升）。
10. **markers 五类零命中**：本刀改动集（本卷 1 .md+件①-⑧ 8 路径+收据目录）五类标记词（词族=`scripts/i6-239-gates.proof.mjs:151-163` 运行时组装四词+冲突标记对·**词面本卷不复抄防自匹配**）grep 零命中（命令与回执入收据）。
11. **diff 面机检**：`git diff --numstat <base>`（`<base>` 钉明=届时 origin tip·EXEC 并线 merge 第二亲）恰 **9 tracked** 路径=件①③⑦ 3 新+件②④⑤⑥⑧ 5 改+本卷 .md（多任何 tracked 路径即停·越界需要类）·收据目录 untracked·typecheck 副产 tsbuildinfo `git checkout` 回滚（negbend §9 同款处置）。
12. **零行为位移双证**：组C1 SQL 断言（零 version 触）+组C5 零新增 invoke(null) 静态锚（§1.3 候选甲否决机械证）·全门矩阵收据七字段（门矩阵全表+EXIT 原值+臂数+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）落 `ai-docs/delivery/receipts/ag15-observability/00-exec.md`。

## §3 范围外（边界清单·越界即 FAIL）

1. **fence/vendor/图包零触**：interview-graph-lease.ts（`d30a4048`）·langfuse-v5.ts（`63d5466c`）·graph.ts（`6cdcc122`）全零字节（候选丁/戊否决承·blob 门机检）。
2. **修复面零触**：零 invoke(null/`{}`/resume) 新增（组C5 静态锚）·interview-consumer.ts（`27ddbcf1`）零字节（terminalizeUnsettled/reaper 面 last_error 消费写归后继）·零终态化零重排。
3. **api/career-path 面零触**：apps/api 全包零字节——career-path markFailed（svc :851-856）不写 last_error 如实登记（ledger seam `markFailed(run)` 无 error 载体·签名变更越界·归后继）·career-path run 观测零挂（其图无 runGraph 边界观测器·如实登记）。
4. **DB 面 additive 最小**：零新表零新列（三列外）零索引零约束零词表触（0149 十一值零改）零回填零 RLS/授权改零触发器（0194 冻结面零触）·sweep 循环/墙钟列零建（候选乙/丙承）。
5. **共享 SSOT 零改**：LEDGER/checklist/issues-master/issues-final/AG 盘点行只读引用——AG-15 行翻面权归协调方。
6. **零依赖升级零 CI/wrapper/runner 注册改**（件⑦ 免隔离注册·零 scripts/run-e2e-isolated.mjs 触）·零 `.env*`/secrets 触面·零 cap 自升（§2-9）。

## §4 依赖

**①上游已满足**：issues-final AG-15 登记（:27/:213-219 在树 blob 亲证）=立项授权面；AG-05/AG-26 修复（:318-326/:386-389 在树）=卡死残余面收窄前提（§1.1-4）；0186 幂等形/0149 词表/0194 冻结器/0043 checkpoint 表=三列形制先例族（全在链）。**②同文件在飞**：§0.0 唯一实触=skeleton 系 93b3db5a 两触面（零 hunk 交叠预证·并线序自由·先并则重 pin 非停）；EXEC 日重扫必做。**③迁移号**：0205 已认领（§0.3 全 ref 零撞）。**④下游**：门矩阵全绿→pre-exec 双审→EXEC→post 双审→nail；告警轨/sweep/career-path 观测/修复面归后继刀排程（协调方裁量）·AG-15 行翻面归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门矩阵任一 prove 恰 1 次·红不重跑冲销·改前基线 run 恰 1 次）；Ban 触 §3 边界面（fence/vendor/图包/interview-consumer/apps api/0149 词表/SSOT 五卷）；**Ban 自动修复**（观测链路内零 invoke(null)/零重排/零终态化/零业务投影——候选甲否决承·组C5 静态锚恒在）；**Ban 告警外呼/sweep 循环**（候选乙承）；Ban 大表重构/新表/第四列/墙钟列（候选丙承）；Ban fence 层内联观测写/version 触（候选丁承·组C1 SQL 断言恒在）；Ban GraphObserver 接口扩形（候选戊承）；Ban 迁移越界（0205 外任何 DDL→停上报）；Ban 自由发挥定稿文本（§1-修法 ⛔ 条款）；Ban 列名再议（三列名派单钉死·§0.2-2）；Ban cap 自升（§2-9·>2184 即停上报）；Ban 就地归因邻面新红（§2 任一邻门红→如实登记升级·Ban 借机修）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（docs-only 落卷 turn）。EXEC 期：件⑦ proof 零 DB 零外呼零 env（纯函数+stub+静态锚·tsx 直跑）；邻面门（migrate/drift/adaptive-consumer/adaptive-life/flow/reaper/neg）全隔离容器+确定性 stub·零模型外呼——§2 承。

## §7 markers=0（卫生声明）

本刀起草改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面沿 `scripts/i6-239-gates.proof.mjs:151-163` 运行时组装口径·不复抄卷内防自匹配——沿 ag20/ag04 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 红事实/读码定稿、§1.3 裁决（候选甲-戊否决面）与 §5 Ban/pins 与 §1-修法 八件定稿面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞复核必做·skeleton 并线两锚重 pin 非停承）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（八列清单/0149 词表/写入点五处/uq_active_run 谓词漂移·adaptive-lifecycle 挂点区 :318-326/:377-389 被改写·迁移链头≠届时实测账·全 ref 扫描出 0205 新撞·§0.0 复扫出新非残枝在飞触面）→停·重 pin 回炉。
- **机制不满足**：件⑦ 组A 分类臂对真实 snap 形（pendingQuestion/generationFailureOf 实现面）推定不符·或三列 UPDATE 对 0059 写护栏/0194 冻结器触发非预期拒绝（23514/42501 类）→证伪诊断→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法 八路径面（需触 fence/vendor/图包/consumer/api/词表/新表新列/迁移第二文件/SSOT）→停·另刀或协调方裁决（§1.3 候选甲-戊否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 第六红/docs:check>2184/migrate 链漂/drift 红）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*AG15-OBSERVABILITY REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`（§8 三条款待满足·pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工）** · base `main` @`112e6d26`（=origin tip·下界 tip≥fe4079a0 成立亲证·起草时 docs:check EXIT=0 scanned 2166≤cap 2184 本席亲跑）· 分支 `line/ag15-observability` · 工作树 `meetwise-ag15`（本起草席立·建前 branch+worktree 双查不存在·全 ref 0205 零撞亲证）· 立项出处=issues-final :27/:213-219 AG-15 行（LG-20·P2·编排运行时·AG 盘点 Top3 唯一同时卡 E2E/HA/BUG 三门禁）+协调方派单 brief（三列名钉+只观测语义钉）· 读码定稿四项=（a）ai_graph_run 八列清单+生产写入点五处亲证（lease 四臂/career-path 四臂/commerce CAS/kernel 两臂·三列零现状）+（b）0186 幂等 additive 形+0149 联动镜像先例+（c）卡死检测语义定谳（卡死形状=`!done&&!pending&&!failure`·阈值=同名裸节点重复观测跨一 job 周期·零墙钟零新列·命中只 emit counter+stderr 零修复）+（d）lifecycle observer 挂点定谳（start :325 后/answer :389 后两挂点·投影事务外·fail-soft·零 fence/version/status 触零 GraphObserver 接口触零行为位移）· 修法=八路径 3 新 5 改（0205 三列 additive+sql 镜像对齐+db 哑读写模块+index 导出+METRIC additive+两挂点观测器+纯 proof 免隔离+注册）· §1.3 五候选否决在卷（甲=自动 invoke(null) 修复半·乙=告警外呼/sweep·丙=大表重构·丁=fence 内联·戊=GraphObserver 扩形）· 门矩阵十二门（新 prove+migrate 205 头+drift+uniqueness+adaptive-consumer 35+图邻面三族+neg+typecheck 8/8+lint 五值+docs:check≤2184 红停+markers 五类+diff 恰 9 tracked）· 迁移认领 0205 · est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push⛔merge 主线 · STOP*
