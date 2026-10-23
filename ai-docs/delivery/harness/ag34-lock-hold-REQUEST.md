# AG34-LOCK-HOLD REQUEST（AG-34 在飞 job 锁连接占用余面收口刀——围栏注释纠偏+派发预算对池上限结构闸·锁 pin 机制半已由 db-hotspot 件② 落地移除·本卷只收真余面·零迁移零模型调用·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草 2026-10-22 落卷即停·pre-exec 双审两独立外席待派→Dual PASS→协调方授权 EXEC·est live=0·Ban self-approve·alone≠dual·⛔push ⛔merge 主线·翻面权归协调方）。

**席位**：AG 能力复核台账下一刀起草席（派单自数 done 33/half 2/open 14·P1 无可派（AG-40 已修复移出）·P2 唯 AG-13 挂起（需线上数据）·P3 已落待翻 7 项（AG-22/23/27/28/30/31/33）走翻面笔非新刀·AG-32/36 前置未修·AG-25/29 为残面另刀 → 选标 **AG-34**=P3 编排运行时最小真未动号；上列计数系协调方派单 brief 自数·本席未独立全量复数 43 项·AG-34 余面码面亲证见 §0.2）。
**基线**：`origin/main` @ `65a9c40f`（分支 `line/ag34-lock-hold-draft`·工作树 `meetwise-ag34` 本席亲立·`git status` 干树亲证）。
**立项出处（不自建 SSOT 行——issues-final AG-34 行翻面与 LEDGER 刀位图翻面权归协调方）**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-34 总览 `:46`+详情 `:427-436`（P3·编排运行时·判词「每个在飞 job 在整个 invoke 期间（几十秒）都独占一条锁连接，投影和心跳还要从同一个池取连接」·修法「锁会话用独立的小池，并限制并发 ≤ 锁池 max」·关联 #9）；②`issues-final.csv:35` 同条；③邻刀对照（勿重做红线）：db-hotspot（`f6c3a735`·计 #9 名下·件② session 锁→事务级锁）+provision-lock-release（`4b1962f2`/`d57adfc2`·AG-29 前半）+graph-lease 族（`9017081d`/`eed23a00`/`5f720f12`/`d7dbe9db`·租约终态/失败面试）+interview-job 滞留 payload 清理（`aab8aecd`·码面 `interview-jobs.ts:379-393`）。

## §0 现状锚（起草席亲读·base `65a9c40f`·file:line/blob 逐条 Read/grep/git rev-parse 实测·**EXEC 立项照届时 tip 全量重 pin——结论不变只更行号·定性翻案即停**）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list` 建 **9 树**实测（本席 meetwise-ag34 唯一 ag34 树·余为主仓/land-102-cap/land-106/cap2338/iss249/iss73/nextfix/wssport）。
- `git branch -a | grep ag34` 恰 `line/ag34-lock-hold-draft` 一条；`ls ai-docs/delivery/harness/ | grep -i "ag34|lock-hold"` EXIT=1——**零同名刀卷**；`git log --all --oneline --grep="AG-34"` **0 笔**——零在飞同题支线。→ 停止条件未触发·可落卷。
- 在飞交叠：iss249/iss73 两线恰 `=65a9c40f` 零越基 commit（diff vs 基线 0 文件亲证）；wssport=`acf046db` 系基线祖先；land-102-cap/land-106 触面（interview.service.ts/0218 迁移/public-text-policy 等 12+5 文件·`git diff --name-only` 亲证）与本刀触面（interview-consumer.ts:474+interview-dispatch-fairness.ts+worker package.json+新 proof+本卷）**零交集**。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·@`65a9c40f`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `apps/worker/src/interview-consumer.ts` | `b608da1a16295566cbc03d22136e8d616c09c1cf` | **`:474` 注释「P0: advisory lock 覆盖 invoke 全程，ai_graph_run lease/version 是可审计 fence；第二 worker 不得并发 Command(resume)。」=本刀件① 触·与 interview-graph-lease.ts:4-6 头注直接矛盾（现行 xact 锁只覆盖 begin 竞态窗）=误导性活文档**；`:476` `withInterviewGraphFence(...)` 调用面（零触）；`:384-391` 心跳=startHeartbeat 闭包内 asPrincipal 每拍短检入（renewInterviewJobLease+renewInterviewGraphFence·跨 invoke 零持连）；`:594` markJobDone 经 asPrincipal 短事务 |
| `apps/worker/src/interview-dispatch-fairness.ts` | `34f0144f8e9776f6a06b7c126aef8c10e5ceb863` | `:10-13` DEFAULT budget {perOwnerInflight:1, globalInflight:4}·`:18-25` `readInterviewDispatchBudget`（`:21` perOwner env 界 1..32·**:22** globalInflight env 界 1..64·`:23` 互检 throw `interview_dispatch_budget_invalid`）=**件② 触：globalInflight 对 PGPOOL_MAX 零结构关系=台账修法「限制并发 ≤ 锁池 max」未落地载体**；`:99` 函数内复检 |
| `packages/db/src/interview/interview-graph-lease.ts` | `bb5bf73acbc208d35a11a24efd945942b09f7265` | 零字节 Ban：`:4-6` 头注（xact 锁只覆盖 begin 竞态窗·COMMIT 即释放不再独占池连接·PgBouncer 事务池语义成立）·`:24-25` asPrincipal 短事务内 `pg_advisory_xact_lock`（**锁获取点·随 COMMIT 自动释放**）·`:21-23` 注释（fn/模型 RPC 在事务外运行）·`:66-73` finally 让出 durable lease（**租约释放点**·独立短事务）·`:87-95` renewInterviewGraphFence（invoke 期续租·短事务） |
| `packages/db/src/interview/interview-jobs.ts` | `c34863305b777b6814b7e0b005c69fcde3989376` | 零字节 Ban：`:79` 入队 xact 锁·`:152` claim xact 锁（均随事务 COMMIT 释放·非在飞跨度）·`:307-315` renewInterviewJobLease 单 UPDATE（心跳载体）·`:379-393` purgeStaleInterviewJobPayloads（滞留清理邻刀已落） |
| `packages/db/src/principal.ts` | `cbdf3a818ed956676392a896d0a8f7b9390f92b0` | 零字节 Ban：**:959** `max: Number(o.max ?? process.env.PGPOOL_MAX ?? 20)`（池上限真相源=件② 缺省 20 依据）·`:1004-1013` asPrincipal BEGIN→COMMIT→release（短事务载体）·`:296-298`+`:554-568` provision session 锁+解锁失败丢连接不出池（AG-29 前半邻刀已落·勿重做）·其余 session 锁仅 `migrate.ts:413/:597`（迁移期专用连接·非在飞 job 跨度） |
| `apps/worker/src/job-heartbeat.ts` | `ebca2fe10c4bd7bef642a241dee01517b44f0886` | 零字节 Ban：`:9-22` 30s tick·续租闭包独立短事务·`:14` 失租即停 |
| `apps/worker/src/main.ts` | `03bca62015076011d666daba5d710c1d3f1ac0b2` | 零字节 Ban：`:531-534`「Fail closed before any consumer loop starts…」`readInterviewDispatchBudget(process.env)` 启动位（件② fail-closed 落点依据）·`:659` dispatchBudget 单一生产注入位 |
| `apps/worker/package.json` | `5ab5427d8d425f9657575bbbf9e22e2063340c98` | `:6` lint 帽 959·`:51` `prove:interview-dispatch`（纯 proof·run-e2e-isolated 零注册·grep 亲证先例）·`:53` `prove:interview-dispatch-pg`（remote PG·`assertInterviewDispatchRemotePostgres` fairness-pg.proof.ts:16）=件④ 注册位 |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `7bf0f03d00db44959af7c1983e7926d25d67e514` | AG-34 总览 `:46`+详情 `:427-436`（只读蓝本·零触） |
| `scripts/ai-docs/public-text-policy.mjs` | `f3b183ee0491f7c854b8548fe1e8953eded1f8d5` | `:135` `MAX_FILES = 2_338`（docs:check cap） |

### 0.2 判词复核定谳（起草席亲证·机制半已被邻刀移除·余面两件成立）

1. **触发机制（session 锁独占 invoke 全程）已不在现树**：台账锚 `packages/db/src/interview-graph-lease.ts:18,55-56` 系复核快照 `2fab7946` 树——`git show 2fab7946:…` 亲证 `:18` `const lock = await pool.connect();`（session 锁连接检入跨 fn 全程）+`:56-57` finally unlock/release（与 db-hotspot 卷 §0.1 旧 blob `d30a4048` 恒等）；现树该机制由 **`f6c3a735`**（db-hotspot 件②·计 #9 名下）移除：xact 锁于单短事务内·COMMIT 即释放·fn（模型 RPC）在事务外——**AG-34 判词「锁连接独占几十秒」半按码面已不成立（诚实登记：非本刀收口·系 db-hotspot 顺带移除·台账行未翻·本卷不复重做）**。
2. **余面①=误导性活注释在位**：interview-consumer.ts:474 仍宣称「advisory lock 覆盖 invoke 全程」，与 `:476` 调用的现行实现（xact 短事务）矛盾——未来编辑者据此注释可能重引长持锁或误判互斥来源（第二 worker 互斥真源=ai_graph_run lease CAS+interview_job claim 谓词·非会话锁）。
3. **余面②=预算-池结构闸未落地**：readInterviewDispatchBudget 许 globalInflight 至 64（`:22`）而 PGPOOL_MAX 缺省 20（principal.ts:959）·两者零结构关系——台账修法「限制并发 ≤ 锁池 max」后半逐字未实现；锁 pin 移除后心跳饿死级联概率大降（心跳每拍短检入不持跨 invoke·§0.1 consumer 行亲证）·但 globalInflight>池 max 时在飞 job 的 claim/checkpoint 写/投影/心跳瞬态并发仍叠加争池·具名 fail-closed 闸=最小防线·零缺省行为。
4. **未被顺带覆盖**：db-hotspot 只改锁机制未触 `:474` 注释与预算闸；provision-lock-release 只及 qbank provision 部署期锁（非在飞 job 跨度）；graph-lease 族只及租约终态/失败面试语义。→ 选标有效·停止条件「标的已修复」不触发（余面两件真实在位）。
5. **行号漂移登记（注记级）**：台账引 `packages/db/src/interview-graph-lease.ts`（无 interview/ 子目录）系 `1cd46ea7` domain move 前旧径+快照行号；现径/现行号随 §0.1·判词零变。

## §1 修法（余面最小面·零迁移·零模型调用·零行为变更缺省面逐件申明）

### 件① 注释纠偏（零行为）

`apps/worker/src/interview-consumer.ts:474` 单行替换：「P0: advisory lock 覆盖 invoke 全程…」→ 按现行实现如实陈述：事务级 advisory xact lock 仅覆盖 begin 竞态窗（COMMIT 即释放·interview-graph-lease.ts:21-25）；invoke 全程互斥由 ai_graph_run durable lease（lease_owner/version/lease_expires_at·TTL 120s）+interview_job lease 承接；第二 worker 不得并发 Command(resume) 的保证源=lease CAS 与 claim 谓词·非会话锁。零语义零行为。

### 件② 预算-池结构闸（fail-closed·缺省零行为）

`apps/worker/src/interview-dispatch-fairness.ts` `readInterviewDispatchBudget` 内 additive：同 env 记录读 `PGPOOL_MAX`（沿 principal.ts:959 同名同缺省 20·严格 `/^[1-9]\d*$/` 整形校验·违例 throw `PGPOOL_MAX_invalid`·不设人工上限=不发明新约束）；`globalInflight > poolMax` → throw 具名错 `interview_dispatch_budget_exceeds_pool_max`。落点即 main.ts:534 启动读——消费环启动前 fail-closed（`:531-533` 既有注释设计意图原样）。**零行为申明**：缺省 4≤20 与一切 globalInflight≤PGPOOL_MAX 配置零变化；唯一新拒面=操作者把并发显式调超池上限（台账修法所禁形态）。deps 注入预算（interview-consumer.ts:313/:675 `d.dispatchBudget ??`）不在本刀面：生产唯一构造位 main.ts:534 亲证·测试显式注入非 env 面。

### 件③ 新 proof：`apps/worker/test/ag34-lock-hold.proof.ts`（纯静态+纯函数·tsx·零 PG 零模型·est live=0）四臂

- **A 预算闸**：缺省 {1,4}/池 20 过；globalInflight>poolMax 具名拒；等界过；perOwner≤globalInflight 既有互检原值；PGPOOL_MAX 非法整形具名拒。
- **B 机械钉（锁 pin 回归即红）**：静态读 interview-graph-lease.ts 源——`pg_try_advisory_lock`/`pg_advisory_unlock`/`pool.connect(` 零命中+`pg_advisory_xact_lock` 在位（uc-e2e-002-cross-device-lease.proof.ts:222-223 同形先例）。
- **C 机械钉（注释回归即红）**：静态读 interview-consumer.ts 源——旧短语「覆盖 invoke 全程」零命中+件① 替换注释在位。
- **D 原值回归**：DEFAULT_INTERVIEW_DISPATCH_BUDGET {1,4} 字节原值。

### 件④ 注册 additive 一行

`apps/worker/package.json` +`"prove:ag34-lock-hold": "tsx test/ag34-lock-hold.proof.ts"`（纯 proof 沿 `prove:interview-dispatch` 先例·run-e2e-isolated 零注册·零迁移白名单触）。

### §1.2 触面矩阵

恰 **5 tracked**：interview-consumer.ts 1+interview-dispatch-fairness.ts 1+新 proof 1+worker package.json 1+本卷 1。**零迁移**（链顶 0218·0216/0217 刻意空缺不补·0219 不占用）·零 env 新增（PGPOOL_MAX 既有键只读）·零 db 面·零模型调用。

### §1.3 否决（六面）

- **甲=台账修法前半「锁会话用独立的小池」本刀不行使**：锁 pin 已由 `f6c3a735` 移除（§0.2-1）·第二池零现役持有者·净增池生命周期/连线面·违最小面；留翻面时随协调方裁。
- **乙=协调方示例修法一「advisory xact lock 改短事务 claim+租约令牌续租」作为新工行使**：恰为 `f6c3a735` 已落形态（短事务+xact 锁+renewInterviewGraphFence 续租）·重做触「邻刀已落勿重做」红线——本卷采其为既落基线而非新工（此即「择一」结论：两示例修法均不作为本卷新工）。
- **丙=示例修法二变体「恢复 session 锁整程+锁连接归池/独立锁池」**：与 interview-graph-lease.ts:4-6 PgBouncer 事务池语义及 0037 durable-claim 先例（长模型调用不由事务锁承重）相逆·且同等回退 db-hotspot 件②·Ban。
- **丁=调低 WORKER_INTERVIEW_GLOBAL_INFLIGHT env 上限（64→池 max）或静默 clamp**：改操作者可见行为包络/掩盖误配·具名 fail-closed 保留显式性（沿 `interview_dispatch_budget_invalid` 形制）·Ban。
- **戊=心跳专用常驻连接/独立心跳池**：每在飞 job 一条常驻连接=AG-34 病灶本体换形复辟·Ban。
- **己=直改 issues-final/LEDGER 行**：翻面权归协调方·本刀零 SSOT 触。

## §2 门矩阵（EXEC 届树亲跑·预申明九门）

①`pnpm -C apps/worker prove:ag34-lock-hold` EXIT=0（四臂·零 PG 零模型零 DNS·est live=0）；②`pnpm -C apps/worker prove:interview-dispatch` EXIT=0 原值（fairness 纯回归）；③`pnpm -C apps/worker prove:interview-dispatch-pg` EXIT=0 原值（remote PG·`assertInterviewDispatchRemotePostgres` 门·E2E_CLOUD_ISOLATED=1 前置）；④`pnpm -C apps/worker prove:drain` EXIT=0 原值（drain 邻面回归）；⑤`turbo typecheck --force` 全绿 0 cached；⑥`turbo lint --force` 全绿·worker 计数 ≤959 帽（apps/worker/package.json:6 亲证·现值 EXEC 届测如实录·新 proof 零新增警告为义务·超帽自修沿 ag17 D2 先例·帽值零改）；⑦`node scripts/ai-docs/check-docs.mjs` EXIT=0 届值 **2332 ≤ 2338**（起草树亲跑现值 2331+本卷 1·余 6）；⑧markers 五类标记词+行首冲突标记改动集 0 命中（亲跑）；⑨`git diff --stat` 恰 5 tracked·零迁移故无 uniqueness/migrate 门。**无模型调用·出站两门（模型 Key/live 花费）不适用——如实申明·est live=0·`actualSpendCny=null`**。

## §3 裁决项（三件·两案并陈处标推荐）

1. **件① 行文形态**：**推荐=单行替换**（最小面）；协裁=扩块注释并引本卷 §0 锚（增行 ≤4）。
2. **件② 违例处置**：**推荐=启动 fail-closed 具名拒**（沿 main.ts:531-533 既有设计意图）；协裁=warn+clamp（行为面更大·不推荐·掩盖误配）。
3. **AG-34 翻面口径**：**推荐=「机制半由 db-hotspot（#9 名下）移除+余面（注释/闸）本刀收口后翻全闭」**；协裁=翻 half 留「独立小池」否决登记随 §1.3-甲。

## §5 Ban 面

migrations 0001-0218 零字节·零新迁移（0219 不占用）；interview-graph-lease.ts/interview-jobs.ts/principal.ts/job-heartbeat.ts/main.ts 零字节（§0.1 零触锚）；结算/账本/幂等链路零触；既有 env 键零改值零新增键；SSOT 四卷+issues-final 零触；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类：现场漂移超注记级/机制不满足/越界需要/验收红不可修——**起草期均未触发**（§0.2-1 机制半移除系邻刀已落事实·余面两件真实在位=选标有效·§0.0 防重三查零撞）。
- **本卷 STOP=`draft:awaiting_pre_exec_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审两独立外席待派·Dual PASS→协调方授权 EXEC 落码·alone≠dual·Ban self-approve。
- **est live=0**（proof 纯静态+纯函数·零模型外呼零 DNS 零 PG 零 Key·`actualSpendCny=null`）·零 env 闸零新增。
- **STOP=`draft:awaiting_pre_exec_dual`**（与 Status 头/§8 同值第三处）·起草落卷即停·⛔push。

卷尾注：STOP=`draft:awaiting_pre_exec_dual` 三处同值（Status 头/§8/本注）·起草 2026-10-22 落卷·基线 `65a9c40f`·est live=0·翻面权归协调方·alone≠dual·Ban self-approve·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。
