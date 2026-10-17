# GRAPH-FENCE REQUEST（checkpoint 写围栏小刀起草 · LangGraph checkpoint 写世代围栏 · 总表 #7 残件 · infra/graph 域 P2）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷 2026-10-16·零码动·起草 turn 恰 1 .md·pre-exec 双审两独立外席待派·Ban self-approve · alone≠dual · est live=0 · ⛔push⛔merge主线）

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

## §8 STOP · `draft:awaiting_pre_exec_dual`

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（起草 turn 恰 1 .md）。开工三条款：①pre-exec 双审两独立外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：①§0 锚漂（blob/行号漂·结论不变则只更行号如实登记）②邻面新红（门 2-4/6 届实跑）③验收红不可修（Ban 借机修）④届树 docs:check>届 cap 且协调方未裁。**post-prove 双审两独立外席待派。**

**待双审/EXEC 裁决项**：①件② 接线住地（推荐=consumer life 组装一行 additive vs adaptive-lifecycle 等价最小缝——以最小 diff+产品码触面恰两件定）；②件① 校验节奏（推荐=每 put/putWrites 均校验——superstep 约 5 次/invoke 量级开销可忽略·窗口紧闭合 vs 心跳内存旗标形——30s 心跳期窗口残留·不荐）；③件③ 住地/门名（推荐=`apps/worker/test/graph-fence-write.proof.ts`+`prove:graph-fence-write`+root `graph-fence-write:prove` 沿 ag16-legacy 同形）；④件③ 面4 隔离库全链臂是否入刀（推荐=入——「写缝先于投影侧」层级对准唯一行为级证据 vs 纯 saver 单元三臂）。

---

*GRAPH-FENCE REQUEST · 2026-10-16 起草 · STOP=`draft:awaiting_pre_exec_dual` · base `feat/mysql-schema-skeleton` @`4124c803`（fetch 后 origin tip 亲证）· 分支 `line/graph-fence` · 工作树 `meetwise-gf`（本起草席立）· 立项出处=issues-final 总表 #7 `:545`+review-log LG-11 `:30`/LR-F4 `:46`+批5 盘点 A 区 #7 派单令 · 红面=checkpoint 写零 fence 消费·锁丢窗口旧世代写覆盖新世代（投影侧三处 fence 管不住写缝·advisory lock 会话丢即串行化失效）· 修法=put 缝拦截形 FenceCheckpointSaver façade（写前 fence 世代校验·checkpoint.id 世代判据沿 AG-16 rev3.1/rev4 先例形·失守抛既有 `graph_fence_lost` 白名单码）+隔离库四面臂 proof+注册三件 additive · est live=0 · pins 十一值零翻转 · markers=0 · docs:check 2223≤2232 余 9（起草树亲跑·起草后 2224）· ⛔push⛔merge主线 · Ban self-approve · alone≠dual · pre-exec 双审待派 · **STOP***
