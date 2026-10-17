# GRAPH-FENCE REQUEST（checkpoint 写围栏小刀起草 · LangGraph checkpoint 写世代围栏 · 总表 #7 残件 · infra/graph 域 P2）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev2 史录·双审会签 PASS×2+协调方授权 EXEC 后落码=1 新 src+1 接线+1 新 proof+3 注册改+§9-exec append·post-prove 双审两独立外席待派·Ban self-approve · alone≠dual · est live=0 · ⛔push⛔merge主线）

**席位**：批5 残件 #7「GRAPH-FENCE checkpoint 写围栏小刀」起草席（协调方派单·独立刀）。
**基线**：`feat/mysql-schema-skeleton` @ `4124c803`（fetch 后 origin tip 亲证·`git rev-parse origin/feat/mysql-schema-skeleton`=`4124c803` 全串·派单下界 tip≥最新**等号成立**·本卷全锚对该 tip 亲算）。分支 `line/graph-fence`·工作树 `meetwise-gf`（`git worktree add ../meetwise-gf -b line/graph-fence origin/feat/mysql-schema-skeleton` 本起草席已立·建前 branch 双查无同名·HEAD 落 `4124c803` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `3dd7a7e4`）`:545` 总表 #7 行：「checkpoint 写不受图版本 fence 保护｜LG-11、LR-F4｜路数 2｜成立：fence 只在投影侧，saver 写只靠 advisory lock｜维持」（P2·infra/graph 域）；②同目录 `review-log.md`（blob `ea66a06e`）`:30`（LG-11 P2 成立·关联 #7）+`:46`（LR-F4 P2 成立·关联 #7）；③批5 盘点 A 区 #7 派单令（协调方）。

## §0 现状锚（起草席亲读·base `4124c803`·file:line/blob 逐条 rg/Read/git ls-tree 实测·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 实测：本席树 `meetwise-gf`（`line/graph-fence`）恰一支·**无他席 graph-fence 树**；同 tip `4124c803` 邻席（`meetwise-dbh2`/`meetwise-rrf2`/`meetwise-sef`/`meetwise-trc` 系 db-hotspot/reserve-renew/smoke-env/trace-recon 各刀）不同面不同域·零触。
- `ls ai-docs/delivery/harness/ | grep -i fence` 零命中——**无同名卷**；`grep -rln "graph-fence" ai-docs/` 零命中。同词异域消歧：`apps/worker/test/fence-reflow-repair.proof.ts`（worker `prove:fence-reflow-repair` :33）系**隐私擦除围栏**修复 ops 面（0076 v2 `privacy_erasure_request`），与本刀**图 fence**（`ai_graph_run`·interview-graph-lease.ts）不同域不同面。→ 停止条件未触发。

### 0.1 checkpoint 写路径现形（a·亲读定谳）

1. **生产 checkpointer=PostgresSaver**：`apps/worker/src/main.ts`（blob `d5e8ff2b`）`createCheckpointer` `:123`（`new PostgresSaver(...)` `:137`·内部自持池·禁 `fromConnString`）·组合根 `:482`（`createCheckpointer(undefined, true)`=PrincipalBoundCheckpointPool 运行角色形）·注入消费循环 `:656`（`runInterviewConsumer({ pool, cp, ... })`）。
2. **图装配=checkpointer 注入**：`packages/ai-graphs/src/adaptive-interview/graph.ts`（blob `6cdcc122`）`:17`（`buildAdaptiveInterviewGraph(checkpointer, deps)` 形参）→ `:65` `.compile({ checkpointer })`；图包纯拓扑纪律 `packages/ai-graphs/src/index.ts`（blob `7f75dc6d`）`:2`（「模型/checkpointer 经注入」·不引 db/contracts 运行时）。
3. **写发生缝**：worker 侧**零显式 put 调用点**——checkpoint 写全部发生在 `g.invoke`/`g.getState` 内部 LangGraph superstep 边界（装版 1.4.7 `checkpointer.put`/`putWrites`·AG-16 卷 `b6545c09` §9-rev4.3 装版亲读链 `loop.js :379` 先例）。
4. **生命周期锁面（双层）**：`packages/db/src/interview/interview-graph-lease.ts`（blob `d30a4048`）头部注释 `:2-5`（「advisory lock 覆盖整个 graph invoke（真正串行化 checkpoint 写）；ai_graph_run 的 lease/version 留下可审计 fence」）——①session advisory lock `pg_try_advisory_lock` `:22`（`withInterviewGraphFence` `:15-58`·worker `interview-consumer.ts` `:451-453` 取得）②durable lease/version（TTL 120s `:11`·接管判据 `:40`·version CAS `:41-46`·assert `:61-68`·renew `:71-79`·release `:81-87`）。
5. **心跳**：`interview-consumer.ts`（blob `265798df`）`:366-373`（`startHeartbeat`·`job-heartbeat.ts` blob `ebca2fe1` `:9` `intervalMs = 30_000`）同拍续 job lease+graph lease（`:371` `renewInterviewGraphFence`）——续 graph 失败即停心跳。
6. **fence 消费面=只在投影侧**：`apps/worker/src/adaptive-lifecycle.ts`（blob `246657b1`）`requireCurrentFence` `:158-161`（→`assertInterviewGraphFence`）恰三处消费——出题投影 `:255`/answer 投影 `:420`/收尾块 `:535`；**checkpoint 写（invoke 内部 put）零 fence 消费点**——此即总表 #7「fence 只在投影侧」的码面实形。

### 0.2 锁丢窗口语义（b·旧世代写覆盖新世代）

- **窗口①（lease 接管）**：invoke 在飞（模型调用可 >120s TTL·心跳 30s 周期续）期间 TTL 过期 → 新 worker 经 `withInterviewGraphFence` `:40` 判据接管（lease_owner 变+version+1=**新世代**）→ 新旧两 worker 并发对同 thread_id 推进。
- **窗口②（advisory lock 会话丢）**：session 级锁绑 PG 会话——网络闪断/PG restart/failover 使会话消失即服务端解锁，旧 worker 进程未死照常推进；新 worker 随即可取得锁+接管 lease。两窗口下，旧 worker in-flight superstep 的 put 落库时**零校验**（saver 写只靠 advisory lock=总表 #7 复核结论原话）。
- **后果**：PostgresSaver 每 superstep put 插新 checkpoint 行、读取取最新——旧世代迟到 put 会成为「最新」checkpoint：新世代 resume 读到旧世代状态（transcript 回退/已评答案复活/pending 回退），与投影侧 alreadyApplied/ledger 单 winner CAS 不变量错位，且投影侧 fence（只查 `ai_graph_run` 行）对该错位不可见。
- **现行缓解面如实盘点**：①advisory lock 串行化窗口②之外的常态双跑 ②心跳停 → 后续投影被 `requireCurrentFence` 拒（但 in-flight invoke 的 put 不受影响）③`interview-consumer.ts` `:261-266` `TRANSIENT_INTERVIEW_JOB_ERROR_CODES` 已纳 `'graph_fence_lost'`（`:262`）=transient requeue 族——**写缝抛同码可直接复用既有分类器零新增分类**（AG-04 刀C 白名单·`:574-577` 注释链）。

### 0.3 blob 锚表（`git ls-tree HEAD` 亲算·全 @`4124c803`·EXEC 重 pin）

| 文件 | blob（8 hex） | 关键锚 |
|---|---|---|
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `3dd7a7e4` | 总表 #7 行 `:545`（立项①） |
| `ai-docs/delivery/ai-capability-review/review-log.md` | `ea66a06e` | LG-11 `:30`/LR-F4 `:46`（立项②） |
| `ai-docs/delivery/harness/ag16-resume-proof-REQUEST.md` | `b6545c09` | 世代判据先例卷·§9-rev3.1 拦截形/§9-rev4.1 两臂对准纪律 |
| `packages/db/src/interview/interview-graph-lease.ts` | `d30a4048` | `:2-5`/`:11`/`:15-58`/`:22`/`:40`/`:41-46`/`:61-68`/`:71-79`/`:81-87`（**零改**） |
| `apps/worker/src/interview-consumer.ts` | `265798df` | 白名单 `:261-266`（graph_fence_lost `:262`）·心跳 `:366-373`（`:371`）·`P0` 注释 `:451`·取 fence `:452-453`·`:564-567`·`:574-577` |
| `apps/worker/src/adaptive-lifecycle.ts` | `246657b1` | requireCurrentFence `:158-161`·投影消费三处 `:255`/`:420`/`:535`·装配 `:309-311` |
| `apps/worker/src/checkpoint-principal.ts` | `fc354f0b` | withCheckpointAccess `:25`·**PrincipalBoundCheckpointPool `:128`（façade 先例形）** |
| `apps/worker/src/main.ts` | `d5e8ff2b` | `:123`/`:137`/`:482`/`:656` |
| `apps/worker/src/job-heartbeat.ts` | `ebca2fe1` | `:9` intervalMs=30_000 |
| `packages/ai-graphs/src/adaptive-interview/graph.ts` | `6cdcc122` | `:17`/`:65` |
| `packages/ai-graphs/src/index.ts` | `7f75dc6d` | `:2` 纯图拓扑注入纪律（**零触**） |
| `apps/worker/test/adaptive-lifecycle.proof.ts` | `4a6123fb` | `:31-43` LegacyEmptyMindReadSaver（读缝先例·零触） |
| `apps/worker/test/adaptive-legacy-checkpoint.proof.ts` | `571a23c8` | `:3-5`/`:91-92`/`:135` 世代判据形（AG-16 件①·邻面零触） |
| `package.json`（root） | `002b6f2a` | `:8` lint 5235·`:9` docs:check·`:120` neg:all·`:531-538` adaptive 门区 |
| `apps/worker/package.json` | `d83fbde4` | `:7` lint 954·`:54-76` prove 注册区 |
| `packages/ai-graphs/package.json` | `b2b3e93f` | lint 47（六包零新增判据面） |
| `scripts/run-e2e-isolated.mjs` | `10c25270` | `:330-339` source 注册形·`:2137`/`:2148` whitelist·`:2351-2353` 命令映射·`:3107` 预迁移名单 |
| `scripts/ai-docs/public-text-policy.mjs` | `05f48933` | `:110` MAX_FILES=2_232（**Ban 自升**） |
| `pnpm-workspace.yaml` | `f14e7fc2` | `:16` langgraph 1.4.7·`:17` checkpoint-postgres 1.0.4（catalog 钉版零触） |
| `turbo.json` | `2e183d4f` | `:4-5`/`:8`/`:10` typecheck/lint 任务面 |

### 0.4 docs:check cap 账（本席亲跑）

base 树 `node scripts/ai-docs/check-docs.mjs` EXIT=0 **scanned 2223 ≤ cap 2232（余 9）**。本卷起草 +1 → **2224（余 8）**；EXEC 届树预期 ≈ 2224+件①（1 src）+件③（1 proof）+EXEC 收据（若落 tracked 面 `ai-docs/delivery/receipts/`）≈ **2227 ≤ 2232 余 5**——**无需 cap sanction**；cap 随届 tip 上游步进如实跟读（届 cap/实测值一律 fetch 亲证为准），超届 cap 红停上报非自升（Ban 自升）。

## §1 红事实与修法

### 1.1 红事实

checkpoint 写（invoke 内部 superstep put）是全链唯一**零 fence 消费**的持久化写面：投影侧三处 `requireCurrentFence`（§0.1-6）管不住 in-flight invoke 的写缝；advisory lock 只在会话存续时串行化（§0.2 窗口①②）——锁丢窗口内旧世代 put 迟到落库即覆盖新世代 checkpoint 头，且该错位对投影侧 fence 不可见、对 resume 语义（AG-16 件①所证的「读什么续什么」确定性）是静默破坏。总表 #7 定谳「成立」维持 P2。

### 1-修法（写缝拦截形·裁量定稿：最小面=1 新 src+1 接线行+1 新 proof+3 注册 additive·零迁移零 schema 触）

- **裁量定谳**：两候选（写前 fence 校验/put 缝拦截）在实现缝上**同点收敛**=checkpointer 写缝——定稿取**put 缝拦截形**承载写前 fence 世代校验（checkpoint.id 世代判据沿 AG-16 `b6545c09` §9-rev3.1/rev4 先例形：获 fence 时锚定世代基点=`ai_graph_run.version`+当时头 checkpoint id，写前复核 lease_owner/version/未过期三项仍现行，id 世代可区分供 proof 断言）；读缝（getTuple）不纳——本红面是写覆盖，新世代自身读写合法，读缝拦截不闭合本面。校验谓词**复用 `assertInterviewGraphFence` 既有函数零改**（interview-graph-lease.ts `:61-68`）。
- **件①（产品码·新文件）**：`apps/worker/src/checkpoint-fence.ts`——FenceCheckpointSaver 最小 façade（沿 `PrincipalBoundCheckpointPool` `:128` 同族「Pool 兼容 façade」先例形）：包装内层 saver，`put`/`putWrites` 写前执行 fence 世代校验（闭包持 `InterviewGraphFence`+pool+owner）·失守 → 抛 `graph_fence_lost`（`Object.assign(new Error(...), { code: ... })` 惯例形·直接落入 `:262` 既有 transient 白名单=requeue+退避，下一持有者从最后被围栏 checkpoint 续跑）·其余方法（getTuple/getList 等）**零触直通**。住地 worker src——图包纯拓扑纪律（`7f75dc6d :2`）零触。
- **件②（接线·additive）**：`interview-consumer.ts` life 组装（`:457-476` 一带）`cp` 以 `new FenceCheckpointSaver(d.cp, fence, ...)` 包装一行 additive（fence 即 `:453` 已取得值）——住地微调（lifecycle 侧等价最小缝）归 EXEC 落码定稿（§8 裁决项①）。
- **件③（新 proof）**：`apps/worker/test/graph-fence-write.proof.ts`——沿 ag16-legacy 形制（MemorySaver 底座+隔离 PG 投影面+脚本模型假体+固定 UUID 入参纪律·禁随机两遍异值假红）四面臂：
  - **面1 接管失守拦截（主红面）**：旧 worker 取 fence 后，新 worker `withInterviewGraphFence` 接管（version+1）→ 旧 worker 包装 saver put → 断言抛 `graph_fence_lost`+checkpoint 落库行数**零增**（旧世代写未落）。
  - **面2 现行放行正对照（证零过拦）**：fence 现行（version 未变未过期）→ put 透传落库·与裸 MemorySaver 行为等价·读缝零触。
  - **面3 失守谓词逐项臂**：lease 过期/owner 错/version 错三失守项逐一抛 `graph_fence_lost`（对准 `:61-68` 三谓词）。
  - **面4 全链对准臂**：包装 cp 注入 start/submit 全链——失守臂断言**写缝先拒**（graph_fence_lost）先于投影侧 `requireCurrentFence` 拒（层级对准）+`TRANSIENT_INTERVIEW_JOB_ERROR_CODES.has('graph_fence_lost')===true` 亲证（既有分类器零新增）。
- **件④（注册·3 文件 additive）**：worker `package.json` 增 `prove:graph-fence-write`；root `package.json` 增 `graph-fence-write:prove`（run-e2e-isolated 隔离形·沿 `adaptive-legacy-checkpoint:prove` `:536` 同形）；`scripts/run-e2e-isolated.mjs` 四处 additive（source/whitelist/命令映射/预迁移名单·沿 `ag16-legacy:prove:raw` `:330-339` 同形·source 清单含本刀触面 src 三件+lease 一件）。

### §1.3 否决（越界即 FAIL）

1. **否决 checkpointer 替换**（PostgresSaver → 他实现/自研 saver）：0043 vendor schema+0047/0126 隐私面+UC052 PrincipalBoundCheckpointPool/RLS/checkpoint_epoch GUC 全绑现有 saver——替换=基础设施重做，越最小面授权。
2. **否决存储后端改造**（checkpoint 表加 fence 列/新迁移/触发器）：迁移面越权，且写缝拦截已闭合本红面——零迁移是本刀边界。
3. **否决 AG-15 监控面出手**（`ai_graph_run` current_node/last_error/checkpoint_id 观测列）：AG-15 领地（沿 AG-16 §1.3-2 先例）——本刀不加观测列。
4. **否决既有 proof 既有臂改写**：ag16 两 proof/adaptive 系邻面臂零触——本刀只增新文件。
5. **否决 cap 自升**：`public-text-policy.mjs` MAX_FILES 零触（§0.4 无需 sanction）。

## §2 验收门矩阵（pre-exec 双审核对单基面·对届时实测·预期值随 §0 锚）

| # | 门 | 预期 |
|---|---|---|
| 1 | 新件③ `graph-fence-write:prove`（隔离库） | EXIT=0·四面臂全 PASS（臂数 EXEC 定稿入收据·≥8） |
| 2 | 邻面 AG-16 两 proof：`adaptive-legacy-checkpoint:prove`+`adaptive-compile-contract:prove` | 各 EXIT=0·届时实测值入收据（AG-16 EXEC 收据 43/43+18/18 口径·臂零改） |
| 3 | adaptive-* 邻面：`adaptive-resume`/`adaptive-life`/`adaptive-flow`/`adaptive-degrade`/`adaptive-chaos`/`adaptive-consumer`/`adaptive-grounding` | 各 EXIT=0 原值（届时实测值入收据） |
| 4 | `neg:all` | EXIT=0·届树实测值入收据（承卷 692 系 `79d83617` 口径·漂移如实登记非红） |
| 5 | `turbo typecheck --force` | EXIT=0 8/8（届实测） |
| 6 | `turbo lint` | EXIT=0 六值恰等零新增（root 5235/web 601/api 1421/db 1042/worker 954/ai-graphs 47·届实测） |
| 7 | `docs:check` | EXIT=0·届树实测 ≤届 cap（起草树 2223≤2232 余 9 本席亲跑·起草后 2224·§0.4 账·超届 cap 红停上报非自升） |
| 8 | markers 五类 | 本刀改动集运行时组装扫描 0/0（`i6-239-gates.proof.mjs` §2-7 口径·词面不复抄卷内） |
| 9 | diff 面 | 起草 turn=恰 **1 tracked**（本卷 .md）；EXEC 面预期=1 新 src（件①）+1 改接线（件②）+1 新 proof（件③）+3 注册改（件④）+本卷 REQUEST+EXEC 收据（若落 tracked 面如实另计）——**产品码触面恰件①②两文件**·图包/账本/迁移/共享 SSOT 零字节 |
| 10 | 迁移面 | 零新迁移（migrations 目录零增） |

## §5 Ban 列表 + pins

**Ban 列表**：Ban push；Ban merge 主线；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（LEDGER/checklist/issues-master/issues-final 四件——总表 #7 行翻面权归协调方）；Ban 触其他工作树（同 tip 邻席 `meetwise-dbh2`/`meetwise-rrf2`/`meetwise-sef`/`meetwise-trc` 等零触）；Ban 伪造已问/已验来源。**本刀增补**：Ban 动 `packages/db/src`（assertInterviewGraphFence/withInterviewGraphFence 等既有函数零改·零迁移）；Ban 动 `packages/ai-graphs/src`（纯图拓扑纪律·图包零字节）；Ban 动既有迁移（0043/0047/0126 系零触）；Ban 动既有 proof 既有臂（邻面零触）；Ban 动 `public-text-policy.mjs` cap（Ban 自升·§0.4）；Ban AG-15 监控面出手（§1.3-3）；Ban checkpointer 替换/存储后端改造（§1.3-1/2）；Ban 顺带升级依赖包（DEPS-AUDIT 域·catalog 钉版 1.4.7/1.0.4 零触）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全 MemorySaver 假体+隔离库+脚本模型·零模型外呼·零消耗）。

## §6 est live=0

零生产操作：件③=隔离库+脚本模型假体（沿 `prove:adaptive-legacy-checkpoint` 既有形）·件①②=进程内 façade+一行接线·门=本地门——零真实 provider 外呼·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草 turn=恰 1 .md）**五类标记词零命中**（起草席亲跑·五类词沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·**词面不复抄卷内防自匹配**——沿 AG-16 卷 §7 同形制）·全树行首冲突标记零命中。

## §8 STOP · `executed:awaiting_post_prove_dual`

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual。** 起草席写完即停零码动（起草 turn 恰 1 .md·EXEC 落码=§9-exec）。开工三条款：①pre-exec 双审两独立外席 **BOTH PASS 落卷**（双审会签 PASS×2=席1 agent_173d5fc1+席2 agent_7a9e4e6c·rev2 修订清单落点确认随会签）；②**协调方明示授权**（已行使=EXEC 派单令随卷·P2 修订落法六点随派单令）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin=§9-exec 已行使）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：①§0 锚漂（§9-exec 重 pin 零漂·两 blob 漂移件如实改记）②邻面新红（门 2-4/6 届实跑全绿）③验收红不可修（Ban 借机修·lint 贴边红自纠一件如实登记）④届树 docs:check>届 cap 且协调方未裁（届实跑 2237≤2240 未触发）。**post-prove 双审两独立外席待派。**

**待双审/EXEC 裁决项**：①件② 接线住地（推荐=consumer life 组装一行 additive vs adaptive-lifecycle 等价最小缝——以最小 diff+产品码触面恰两件定）；②件① 校验节奏（推荐=每 put/putWrites 均校验——superstep 约 5 次/invoke 量级开销可忽略·窗口紧闭合 vs 心跳内存旗标形——30s 心跳期窗口残留·不荐）；③件③ 住地/门名（推荐=`apps/worker/test/graph-fence-write.proof.ts`+`prove:graph-fence-write`+root `graph-fence-write:prove` 沿 ag16-legacy 同形）；④件③ 面4 隔离库全链臂是否入刀（推荐=入——「写缝先于投影侧」层级对准唯一行为级证据 vs 纯 saver 单元三臂）；⑤件① 透传机制（rev2.1 增补·**EXEC 定稿落卷**）=**显式枚举胜出**——Object.create 裸委托对 this 依赖方法 TypeError 机制不成立（席2 意见采纳），显式枚举+extends 下 abstract 漏件由 typecheck 强制响（getTuple/list/put/putWrites/deleteThread 全枚举+serde 经 super 构造委托+setup/end 有则绑内层沿 checkpoint-principal `:128`/`:165` façade 惯例·落码=§9-exec 件①）。

## §9-rev2 rev2 修订注记（pre-exec 双审席1 PASS 附 P1 cap 账一件+席2 FAIL P1-A/B 写缝判据歧义→rev 回路·两席合并定谳+协调方裁决随卷·文面修订零码面 · rev2 席落卷 2026-10-16 · **append 注记形 · 上文 §0-§8+卷尾注零洗** · 本节为 EXEC 期对前文对应句的最新权威修正与增补·与前文冲突处以本节为准）

> **双审定谳（rev2 席逐位亲证成立）**：席1 **PASS** 附 P1 一件（cap 账：届 tip 树 docs:check 实测 2232=cap 恰等零余量·EXEC 投影必越）；席2 **FAIL** P1-A/B（写缝判据歧义=checkpoint.id 世代判据是否入放行门+fence 缺失臂 fail-open 面）+P2×3+P3×1。两席合并定谳+协调方裁决：P1-A 写缝判据钉死三条款（§9-rev2.1·最高优先）·席1 P1 cap 账改记（§9-rev2.2）·席1 P2 批量四件（§9-rev2.3）·席2 P2 批量三项（§9-rev2.4-2.6）+P3 一件（§9-rev2.7）。rev2 修订如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9-rev2.8）。

### §9-rev2.1 修订①（P1-A·席2·协调方裁决·最高优先）——写缝放行判据钉死三条款：三谓词唯判据·checkpoint.id 零入门

- **条款①（门=唯三谓词）**：put/putWrites 写前校验的放行判据=**唯三谓词**（`lease_owner`/`version`/`lease_expires_at`·沿 `assertInterviewGraphFence` interview-graph-lease.ts **`:61-68`** 复用零改——`lease_owner=$4 AND version=$5 AND lease_expires_at >= now()` 三项 rev2 席亲读）——**checkpoint.id 不参与放行判定**（id 仅两用：获 fence 时锚定世代基点=当时头 checkpoint id 记录+proof 断言区分新旧世代落行）；**id 缺失/undefined 时三谓词判定不受影响=零 fail-open 面**。
- **条款②（putWrites 缝=id 零依·先例形限定）**：putWrites 缝无 checkpoint.id 可依=**三谓词即全部判据**；§1-修法裁量句「checkpoint.id 世代判据沿 AG-16 `b6545c09` §9-rev3.1/rev4 先例形」**限定为 proof 断言形不入门**（放行判定零 id 等值项）——防 id 等值误入写缝门=**每 invoke 必炸**（LangGraph 每 superstep put 落新 id·id 等值判据恒失守=生产写路径全断）。AG-16 rev3.1 世代判据系**读缝**（getTuple 剥字段）先例形，与写缝门判据不同面——只取其「世代可区分供 proof 断言」形。
- **条款③（fence 缺失=构造期拒 fail-closed）**：FenceCheckpointSaver 构造期 fence 不可缺省/不可空——缺失即**构造期拒**（**禁沿 requireCurrentFence `d.fence &&` 短路形**=现 tip blob `081f09c0` **`:177`** 亲读·fence 未注入静默放行系投影侧可容忍形·写缝门禁用此形）；assert 查询异常（PG 错误等）**原样上抛**（异常≠放行·不吞不改码）。
- **透传机制钉**：内层 saver 透传=**Object.create 原型委托或全接口显式枚举**（getTuple/getList/deleteThread/setup/end/serde 全量）**二择一 EXEC 落码定稿**（§8 裁决项增补⑤）；**面2 增直通完备臂**（正对照除 put 落库等价外，增 getTuple/getList/deleteThread/end 直通断言=透传完备性行为级证据）。
- **件① 实现钉（席1 P2 承接）**：FenceCheckpointSaver **extends BaseCheckpointSaver**+serde 委托——graph.ts **`:17` 形参类型位所迫**（`buildAdaptiveInterviewGraph(checkpointer, deps)` 形参位·blob `6cdcc122` 恒等零漂亲证）；getTuple/getList/deleteThread/end 直通（`end` 系 façade 先例形 surface·checkpoint-principal.ts `:128`/`:165` 同族亲读）。

### §9-rev2.2 修订②（P1·席1 cap 账·协调方裁决）——§0.4+门7 改记：届 tip 树恰等零余量→cap sanction=EXEC 硬前置

- **定稿（协调方裁决·原文零洗以此为准）**：§0.4 账+门7 预期改记为——**「届 tip `67cdf153` 树 docs:check 实测 2232=cap 恰等零余量→EXEC 投影 ≈2236 越届 cap→cap sanction 为 EXEC 硬前置（协调方沿先例行使·届值届时 fetch 再证·超届红停上报非自升）」**。
- rev2 席亲证：fetch 后 `origin/feat/mysql-schema-skeleton`=`67cdf15309427b5acac023737593cef154eb451f`；届 tip 树 docs:check 本席**只读临时 worktree @`67cdf1530` 亲跑 EXIT=0「scanned 2232」=cap `2232`（public-text-policy.mjs blob `05f48933` 恒等零漂·MAX_FILES `:110`）恰等零余量**（run 后即拆·零触他树）；EXEC 投影=2232+REQUEST 1+件① 1+件③ 1+EXEC 收据 1（若落 tracked 面）≈**2236>2232 必越**；先例形=policy 注记 cap 2144→2152「本刀树 2144=cap 恰等零余量·协调方预 sanction」同款（亲读在卷）。**§1.3-5/§5「Ban cap 自升」维持**——sanction 权在协调方，EXEC 届时 fetch 再证届值。

### §9-rev2.3 修订③（P2·席1 批量四件）——锚重 pin+窗口②表述修正+面1 接管前置步+残余窗口披露

- **(a) 锚重 pin（§0.1-6/§0.3 表两行改记·AG-15 并线漂移·rev2 席逐位亲读）**：`apps/worker/src/adaptive-lifecycle.ts` blob `246657b1`→**`081f09c0`**（AG-15 observability 并线落码·+48/−1 numstat 亲证）——requireCurrentFence `:158-161`→**`:176-179`**（`d.fence &&` 短路形 **`:177`**）·投影消费三处 `:255`/`:420`/`:535`→**`:300`/`:467`/`:582`**（出题/answer/收尾）·装配 `:309-311`→**`:354-355`/`:410`/`:424`**（start 链 `buildAdaptiveInterviewGraph` `:355`+`gInitial` `:410`+plannerSequence 分支 `:424`）。`apps/worker/package.json` blob `d83fbde4`→**`ba0c157c`**（AG-15 `prove:graph-run-observability` `:28` 增一行）。**其余 pin blob 对届 tip 恒等零漂亲证**：interview-graph-lease.ts `d30a4048`/interview-consumer.ts `265798df`/main.ts `d5e8ff2b`/checkpoint-principal.ts `fc354f0b`/job-heartbeat.ts `ebca2fe1`/adaptive-interview/graph.ts `6cdcc122`/adaptive-lifecycle.proof.ts `4a6123fb`/adaptive-legacy-checkpoint.proof.ts `571a23c8`/public-text-policy.mjs `05f48933`（行号零位移）。
- **(b) 窗口②表述修正（§0.2·原文零洗以此为准）**：「新 worker 随即可取得锁+接管 lease」改记——**「随即取得锁；lease 接管仍受 `:40` TTL 门禁 ≤120s 后经 version+1 材料化」**。
- **(c) 面1 臂钉（件③面1）**：接管前置步=**隔离库确定性 UPDATE `ai_graph_run` 强制旧 lease 过期**（`lease_expires_at` 置过去形·EXEC 落码定稿）——**LEASE_SECONDS 系模块级 const `:11`（120）不可注入**，禁 sleep 真等 120s（确定性臂零时钟依赖零长眠）。
- **(d) 残余窗口披露段（§6 后增补·沿 honest-boundary 先例）**：写缝门校验=assert 查询（`:61-68`）→内层 saver INSERT 的 **check-then-act 毫秒级残缝**——Ban 面内（零改 packages/db/src·零迁移·零 checkpointer 替换）**不可再收窄**（事务化/锁化修复越 Ban 面）；暴露定量=**每 takeover 至多在飞 ~5 拍**（superstep ≈5 次/invoke 量级·与 §8 裁决项② 同源）暴露窗；如实披露不声称闭合——EXEC 收据须登记本披露。

### §9-rev2.4 修订④（P2-1·席2）——窗口①成因链更正：TTL 过期单独不产生并发 put

- §0.2 窗口① 叙事改记（原文零洗以此为准）：TTL 过期**单独不产生并发 put**——旧 worker 会话存续期间 `pg_try_advisory_lock`（`:22`）仍被旧 worker 持有，新 worker **先被 advisory lock 挡**（接管不发生=零并发 put）；**真实并发 put 窗=窗口②（会话丢/failover）**——会话丢后新 worker 取得锁+（经 `:40` TTL 门禁）接管，旧 worker 进程未死照常推进 in-flight put。**两窗口均覆盖·结论不变·成因链更正**——红面定性（旧世代写覆盖新世代·写缝零校验）与修法（写缝拦截形）零触。

### §9-rev2.5 修订⑤（P2-2·席2·与席1(d) 合并）——TOCTOU 残缝如实声明

- 席2 P2-2 与席1 残余窗口披露**同源合并**（以 §9-rev2.3(d) 为准）：写缝校验 check-then-act 毫秒级残缝如实声明·Ban 面内不可再收窄·每 takeover 至多在飞 ~5 拍暴露·沿 honest-boundary 先例——EXEC 收据披露登记·不声称闭合。

### §9-rev2.6 修订⑥（P2-3·席2）——AG-15 并线三项登记

- ① `adaptive-lifecycle.ts` blob `081f09c0` 重 pin（§9-rev2.3(a)）；② worker `package.json` blob `ba0c157c` 重 pin（`prove:graph-run-observability` `:28` 增行）；③ `apps/worker/test/graph-run-observability.proof.ts`（blob `17218e8f` @届 tip 亲证）**已落届树·本刀零触登记**——AG-15 领地（§1.3-3 否决维持）·本刀件④ 注册 additive 落点与 AG-15 注册行零交叠（EXEC 届时 additive 亲证）。

### §9-rev2.7 修订⑦（P3·席2）——mock-interview.ts:28 同形红面不同域登记

- `packages/ai-graphs/src/mock-interview.ts`（blob `b4ed2228`·base=tip 恒等零漂亲证）**`:28` `.compile({ checkpointer })`**=本红面同形（compile 缝 checkpoint 写零 fence）**不同域**（mock 图域·非 adaptive-interview 生产图）——登记不触·本刀范围外（图包纯拓扑纪律 `7f75dc6d :2` 零触·Ban 动 packages/ai-graphs/src 维持）。

### §9-rev2.8 rev2 后门矩阵口径（rev2 席亲跑）+STOP

- **docs:check**：届 tip 树亲跑 EXIT=0 **2232=cap 2232 恰等零余量**（@`67cdf1530` 只读临时 worktree·run 后即拆·零触他树）；本 rev 树亲跑 EXIT=0 **scanned 2224**（append 零新增文件→计数不变·越 cap 改记以 §9-rev2.2 为准）。
- **markers**：本 rev 改动集（恰 1 .md）五类标记词+行首冲突标记直扫零命中（词族运行时组装不誊卷·沿 §7 同形制·i6-239 §2-7 口径）。
- **diff 面**：本 rev 恰 1 tracked=本卷 .md 纯 append 零删改·零码面；门 1-10 沿 §2 判据·cap/锚漂移值随 §9-rev2.2/§9-rev2.3 修正读。
- **STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（Status 头/§8/卷尾注零字洗）——rev2 落卷后待两席修订清单落点确认（或协调方裁定）→**重派 pre-exec 双审两独立外席**（rev2 后重审·alone≠dual·Ban self-approve·Dual PASS ≠ 开工·开工权归协调方）·est live=0（rev turn 全只读+1 doc append·届树亲跑系只读临时 worktree）·actualSpendCny=null ·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase ⛔改码面（本 rev 恰 1 doc 零码面）。

## §9-exec EXEC 记录（EXEC 席落卷 2026-10-17·七字段+P2 修订落点逐条+裁决项⑤誊入 §8+残余窗口收据披露·STOP→`executed:awaiting_post_prove_dual`）

**授权链**：起草落卷→pre-exec 双审（席1 PASS 附 P1 cap 账+席2 FAIL P1-A/B）→rev2 回路（§9-rev2 文面修订零码面）→rev2 后双审会签 **PASS×2**（席1 `agent_173d5fc1`+席2 `agent_7a9e4e6c`）→协调方明示授权 EXEC（P2 修订落法六点随派单令：透传机制=显式枚举胜出+锚重 pin+面1 臂钉 UPDATE 强制过期+public-text-policy pin 漂移改记+残余窗口披露段+list 实名/putWrites config checkpoint_id 措辞松驰）→EXEC 本卷（fetch 亲证 origin/feat/mysql-schema-skeleton=`ce4bfd1d091dbdf3d6b808b587d72f6113dd535e`·派单届 tip≥最新等号成立→**merge `50558480d`** --no-ff 双亲 9ae4657b4+ce4bfd1d·merge-tree --write-tree 预演 EXIT=0 零冲突·interview-consumer `:458` 接线区与 RESERVE `:359-373` 区零 hunk 交叠双向预演成立·SSOT 并集解**未触发**·⛔pull --rebase 未用·⛔force push 未用）。

**七字段**：①工作区 `meetwise-gf`·分支 `line/graph-fence`·EXEC 基线=merge `50558480d`；②§0 全量重 pin 对届树（merge 后）亲算=**20 blob 十八恒等零漂+两漂移件如实改记**——恒等：interview-graph-lease `d30a4048`/interview-consumer `265798df`/adaptive-lifecycle `081f09c0`（rev2.3(a) 承）:74/:176-179（短路形 `:177`）/:300/:467/:582+消费点第四处 `:74`（原 `:56` 届漂）+装配 :355/:410/:424 逐位亲读/checkpoint-principal `fc354f0b` :25/:128/:165/main `d5e8ff2b` :123/:137/:482/:656/job-heartbeat `ebca2fe1` :9/graph `6cdcc122` :17/:65/index `7f75dc6d` :2/adaptive-lifecycle.proof `4a6123fb` :31-43/adaptive-legacy-checkpoint.proof `571a23c8` :3-5/:91-92/:135/root package.json `002b6f2a` :8/:9/:120/:531-538/worker package.json `ba0c157c`（rev2.6 承）:28/:58/ai-graphs package.json `b2b3e93f` lint 47/runner `10c25270` :330-339/whitelist/命令映射/预迁移名单/pnpm-workspace `f14e7fc2` :16-17/turbo `2e183d4f`/review-log `ea66a06e` :30/:46/ag16 卷 `b6545c09`——漂移两件：`issues-final.md` `3dd7a7e4`→**`695c755a`**（总表 #7 行 `:545`→**:548**）+`public-text-policy.mjs` `05f48933`→**`f9fcbbf5`**（MAX_FILES `:110`→**:112**·cap 2232→**:2240** 上游 dfcedc3a「文档帽 2240 步进」随届承·非本刀触发非自升）；③落码恰 **2 新+3 注册改+1 接线**=件① `apps/worker/src/checkpoint-fence.ts`（新·FenceCheckpointSaver extends BaseCheckpointSaver<number>+显式枚举 getTuple/list(实名 AsyncGenerator 直通)/put/putWrites 拦截件/deleteThread 直通+serde super 构造委托+setup/end 有则绑内层（checkpoint-principal :128/:165 façade 同族）+构造期拒 fail-closed 三码（checkpoint_fence_inner_required/pool_required/fence_required）+assert 查询异常原样上抛+失守抛 `graph_fence_lost` 既有白名单码）+件② `interview-consumer.ts` life.cp 组装位一行包装（import +1·:458 区 life `cp: new FenceCheckpointSaver(d.cp, d.pool, fence)`·fence 即 ：453 已取得值·触面恰此一件产品码）+件③ `apps/worker/test/graph-fence-write.proof.ts`（新·**38 臂全 PASS EXIT=0**：面0 构造期拒四臂+面1 接管拦截六臂（强制过期 UPDATE 前置→version+1 材料化→旧 put/putWrites 双缝拒+落库零增+新世代头未被覆盖）+面2 现行放行+直通完备九臂（put/putWrites 落库+getTuple/list 实名 AsyncGenerator+serde 恒等+deleteThread+end/setup 有则绑无则零触）+面3 三谓词逐项十臂（每项先现行正对照再单项失守·隔离库确定性 UPDATE）+面4 全链层级六臂（现行 start 直通投影在案→强制过期+接管 v2→stale submit invoke 内写缝先拒 graph_fence_lost+checkpoint 头不动+ledger 零行+TRANSIENT has=true+收口 unhandledRejection 记录面全为 graph_fence_lost））+件④ 注册三件 additive=worker package.json（prove:graph-fence-write :59 增行）+root package.json（graph-fence-write:prove :537 增行）+runner 四处（source 清单/whitelist/命令映射/预迁移名单·沿 ag16-legacy 同形·source 含本刀触面 src 三件+lease 一件）+本卷 §9-exec append·**零迁移零 lockfile 零图包零 db/src 触**；④门矩阵全表=门1 件③ 38/0 EXIT=0（隔离库真迁移链 205 applied）·门2 AG-16 两 proof adaptive-legacy-checkpoint **43/43**+adaptive-compile-contract **18/18** 各 EXIT=0（臂零改·AG-16 EXEC 收据口径恰等）·门3 adaptive 七门 resume 36/life 49/flow 5/degrade 11/chaos 4/consumer 37（runner ISOLATED_PROOF_SUMMARY pass_count）/grounding 7 全 EXIT=0·门4 neg:all EXIT=0 **692**（auth 90+commerce 90+resume 91+interview 107+bend 179+input 135·承卷 79d83617 口径恰等零漂）·门5 turbo typecheck --force EXIT=0 **8/8**·门6 turbo lint EXIT=0 12/12 六值**恰等帽零新增**（root 5235/web 601/api 1421/db 1042/worker 954/ai-graphs 47·lint-cap-step 刀并行在飞届值如实登记·本刀贴边红自纠一件见⑥）·门7 docs:check EXIT=0 **2237≤2240 余 3**（届 cap=f9fcbbf5 :112 恰等零余量前提已被上游步进解·零 sanction 需要·本 append 后复跑值）·门8 markers 六文件改动集五类词+行首冲突标记直扫 **0/0**·门9 diff 面=2 新（件①③）+1 接线（件②）+3 注册改（件④）+本卷 REQUEST·**产品码触面恰件①②两文件**·图包/账本/迁移/共享 SSOT 零字节·门10 零迁移（migrations 目录零增）；⑤裁决项落法：§8 五裁决项全落=①接线住地=consumer life `:458` 区一行（fence 即 ：453 取得值·最小 diff+产品码触面恰两件）②校验节奏=每 put/putWrites 均校验（无内存旗标）③门名=prove:graph-fence-write 沿 ag16-legacy 同形④面4 全链臂入刀（层级对准唯一行为级证据）⑤**透传机制=显式枚举胜出誊入 §8**（Object.create 裸委托 this 依赖方法 TypeError 机制不成立·显式枚举+extends 下 abstract 漏件 typecheck 强制响）；⑥偏离三条如实登记=（a）面0 inner 缺失臂初版经 `super(inner.serde)` 先抛 TypeError 错误码不达——修正为 `super()` 先行+守卫后 `this.serde=inner.serde` 委托（fail-closed 语义不变·错误码精确化 checkpoint_fence_inner_required）（b）lint 贴边红自纠一件=proof 初版 5 warnings（unused import/const+三 snake_case 字面键）削零（帽 954 恰等零放宽·计算键形沿 ag16 先例）（c）面1/面3 standing lease 以行级 UPDATE（forgeLease/forceExpire）复原「旧 worker 持 lease 在飞」窗②形态=proof 专用确定性假体·零 schema 零 db/src 改动·沿 asPrincipal RLS 纪律；⑦STOP=`executed:awaiting_post_prove_dual` 三处同值翻面（Status 头/§8/卷尾注·前值 `draft:awaiting_pre_exec_dual` 史录零字洗）·est live=0（全隔离库+MemorySaver 底座+脚本模型假体·零模型外呼零 secrets 零消耗）·actualSpendCny=null·pins 十一值零翻转·LEDGER/checklist/issues-final/issues-master 翻面权归协调方（本刀零触共享 SSOT）·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push。

**P2 修订落点逐条（派单令六点）**：①透传机制=显式枚举胜出→件① 全枚举落码（§8 裁决项⑤誊入）；②锚重 pin→②字段（adaptive-lifecycle `081f09c0` 七处+消费点第四处 `:56`→`:74`+policy `f9fcbbf5` :112 cap 2240+issues-final `695c755a` :548）；③面1 臂钉 UPDATE 强制过期→件③ 面1/面3（forceExpire `now()-interval '1 second'` 置过去形·LEASE_SECONDS 模块级 const :11=120 不可注入零 sleep 真等）；④public-text-policy pin 漂移改记→②字段；⑤glList 实名→件① `list` 实名（非 getList）+件③ 面2 实名 AsyncGenerator 直通臂；⑥putWrites config checkpoint_id 措辞松驰→件① 头注（「putWrites 缝的 config 是否携带 checkpoint_id 依装版而异且两形都不读它」）+件③ 面2 标签（写缝门零读 checkpoint_id·仅 MemorySaver 自身寻址需之）。

**残余窗口收据披露（§9-rev2.3(d)/rev2.5 义务）**：写缝门校验（assert 查询 `:61-68`）→内层 saver INSERT=毫秒级 check-then-act 残缝·Ban 面内（零改 packages/db/src·零迁移·零 checkpointer 替换·零触 LangGraph 装版）**不可再收窄**·每 takeover 至多在飞 ~5 superstep 拍暴露·如实披露不声称闭合。**装版 1.4.7 拒斥传播双面性如实披露（EXEC 期亲读 loop.js :164-172/:334-339/:379/:1108/:1117+proof 行为级亲证）**：写缝拒斥经 detached-tracked promise（`_trackCheckpointerPromise` 再抛形）interim 一次性暴露为 unhandledRejection·invoke 收尾经 `Promise.all(checkpointerPromises)` 重 throw→**invoke 拒必达**（面4 行为级亲证：submit 抛 graph_fence_lost+投影零行+头不动）→既有 transient 白名单 requeue+退避可用；若 Node 默认 unhandledRejection=throw 在 invoke 收尾前先触发则进程 fail-closed 停机（写未落·lease TTL/reaper 路径重排队）——**两表面均保「旧世代写零落库」不变量**·proof 收口臂断言记录面全部为 graph_fence_lost（非预期面即红）·本披露随收据登记·不声称闭合。

---

*GRAPH-FENCE REQUEST · 2026-10-16 起草 · STOP=`executed:awaiting_post_prove_dual`[EXEC 席翻面 2026-10-17·前值 `draft:awaiting_pre_exec_dual`=起草+rev2 史录] · base `feat/mysql-schema-skeleton` @`4124c803`（起草 origin tip 亲证）· EXEC 基线=merge `50558480d`（--no-ff 并届 tip `ce4bfd1d`）· 分支 `line/graph-fence` · 工作树 `meetwise-gf`（本起草席立）· 立项出处=issues-final 总表 #7 `:548`（届漂 ：545→:548·blob `695c755a`）+review-log LG-11 `:30`/LR-F4 `:46`+批5 盘点 A 区 #7 派单令 · 红面=checkpoint 写零 fence 消费·锁丢窗口旧世代写覆盖新世代（投影侧四处 fence 管不住写缝·advisory lock 会话丢即串行化失效）· 修法=put 缝拦截形 FenceCheckpointSaver façade（写前三谓词校验·checkpoint.id 零入门·失守抛既有 `graph_fence_lost` 白名单码）+隔离库 38 臂 proof+注册三件 additive · EXEC 落码=38/0 全绿+门矩阵十行届实跑全绿 · est live=0 · pins 十一值零翻转 · markers=0 · docs:check 届实跑 2237≤2240 余 3 · ⛔push⛔merge主线 · Ban self-approve · alone≠dual · post-prove 双审待派 · **STOP***
