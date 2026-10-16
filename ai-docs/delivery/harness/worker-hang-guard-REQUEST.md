# WORKER-HANG-GUARD REQUEST — worker 单侧停摆自愈刀（drain-loop tick 级 watchdog 甲案 · G7W 新红诊断席修复建议②产品码独立刀 · 诊断+起草席落卷 · **STOP=`executed:awaiting_post_prove_dual`**[EXEC 席翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录]）

> 战役 meetwise · 支线 `line/worker-hang-guard` · 工作树 `meetwise-whg` · 起草基线 @origin/feat/mysql-schema-skeleton=`d5dc0726`（派单下界「fetch 后 origin tip≥最新」以等号成立亲证=fetch 后 `origin/feat/mysql-schema-skeleton` tip·`origin/main`=`112e6d26` 为其祖先亲证 `git merge-base --is-ancestor` EXIT=0）· ⛔push ⛔merge 主线（push/翻面权归协调方）。主仓 worktree 建支线：`git worktree add ../meetwise-whg -b line/worker-hang-guard origin/feat/mysql-schema-skeleton`。

## §0 现状锚（停摆面双向锚·起草席亲读+blob 亲算 @`d5dc0726`·**EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

> **EXEC 重 pin 记（2026-10-16·@origin tip `5c8e122c` 树=merge 落点 `4c20f12b` 第二亲·EXEC 席亲算）**：§0.1+§9.3 十八 blob 全量亲算=**15 恒等+3 漂移**——漂移恰 `main.ts`→`61692bbb`/`interview-consumer.ts`→`265798df`/`report-worker.ts`→`245c9ac5`（漂移面逐行亲读=AG-20 askCostPolicy 同源注入接线+quarantine eventKey 幂等键，与本刀锚面语义无涉=**停止条件①不触发**）；行号漂移两处=`interview-consumer.ts` 心跳 `:364`→`:366`/reaper `:635`→`:638`，`commerce-reconcile` 调用点 `:136`→`:139`，其余行锚恒等亲证（drain-loop.ts/ha-2-drain.proof.ts/job-heartbeat.ts/interview-dispatch-fairness.ts/principal.ts/interview-jobs.ts/invoke.ts/model-client.ts/timeout.ts/g7-freetier-reprove-guard.ts/token-stream.ts/owner-queue-drain.ts/quiz-consumer.ts/diagnosis-consumer.ts 全 blob 恒等）。下表 blob 单元格已就位更新（旧值史录在 rev 前文）。

### 0.1 blob 锚表（`git rev-parse d5dc0726:<path>` 亲算）

| 文件 | blob @`d5dc0726` | 本刀触面 |
|---|---|---|
| `apps/worker/src/drain-loop.ts` | `ba51dd17` | **件① 触（唯一产品码改面）** |
| `apps/worker/test/drain-loop.proof.ts` | `2b401be2` | **件② 触（watchdog 臂组）** |
| `apps/worker/test/ha-2-drain.proof.ts` | `9079347b` | 零字节 Ban（门 1 邻面 58 臂·源级断言回归锚） |
| `apps/worker/src/job-heartbeat.ts` | `ebca2fe1` | **零字节 Ban**（丙核锚·已接线在案） |
| `apps/worker/src/main.ts` | `61692bbb` | **零字节 Ban**（main.ts 调用点零改=第三参可选向后兼容·blob @`5c8e122c` 树 EXEC 重 pin·旧值 `6fa1e374`） |
| `apps/worker/src/interview-consumer.ts` | `265798df` | 零字节 Ban（reaper 同 loop 耦合+心跳接线锚 :366·blob @`5c8e122c` 树 EXEC 重 pin·旧值 `27ddbcf1`） |
| `apps/worker/src/interview-dispatch-fairness.ts` | `34f0144f` | 零字节 Ban（合法 tick 墙钟算术锚） |
| `packages/db/src/principal.ts` | `c31cbac0` | **零字节 Ban**（乙核锚 :947-950+:964 池四参既成事实） |
| `packages/db/src/interview/interview-jobs.ts` | `c69c03a3` | 零字节 Ban（租约/心跳/reaper 锚） |
| `packages/ai-runtime/src/invoke.ts` | `44340f39` | **零字节 Ban**（丙核锚 :374-376+:782） |
| `packages/ai-runtime/src/model-client.ts` | `61471ed4` | 零字节 Ban（传输 30s 形锚） |
| `packages/ai-runtime/src/timeout.ts` | `a5a4e46d` | 零字节 Ban（withAbortTimeout 缓释锚） |
| `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` | `4e75fae7` | 零字节 Ban（G7 账本 reserve/release+文件锁 5s 锚） |
| `apps/worker/src/token-stream.ts` | `3f601319` | 零字节 Ban（丙核锚·:38-48 启动哨兵+:55 leaseSeconds:60） |

### 0.2 停摆面事实（file:line 亲证 @`d5dc0726`）

- **结构面（主定谳承认）**：`drain-loop.ts:41-46` `while (!stopped) { … try { await tick(); … } catch { consecutiveFailures++ } }`——tick **reject 有兜底**（:50-53 记数不停循环）、tick **挂起无兜底**：`await tick()` 永不 resolve 则该 loop 永久静默而进程健康。同体 loop 共用 ~13 处（`main.ts:746` gauge·report/interview/quiz/diagnosis/route-classify 四消费+`commerce-reconcile`/`model-invocation-reconcile`/`usage-calibration-reconcile`/`usage-calibration-retention`/`qbank-release-sweep`/privacy eraser×2）。
- **现有防护面=shutdown 专用**：`drainWithDeadline`（`drain-loop.ts:111-154`·两相 loop 21s/deps 9s·:143 败者计时器纪律）仅在 `main.ts:829` SIGTERM/SIGINT 排水链行使（`WORKER_DRAIN_TIMEOUT_MS` 缺省 30s·:830 `worker_drain_timeout` 日志）——**运行时零信号路径无任何 watchdog**。`ready()`（:72-77）=观测面（`lastSuccessAt` 陈旧窗/3 连败翻 false）非自愈面，且挂死 tick 不进 catch、`consecutiveFailures` 不增，仅陈旧窗一肢可达。
- **DB 池面（派单前提勘误①·亲证）**：运行时池**已带**会话级超时——`principal.ts:947-948` `statement_timeout:15000`+`idle_in_transaction_session_timeout:15000`（env `PG_STATEMENT_TIMEOUT_MS`/`PG_IDLE_TX_TIMEOUT_MS`）、:949 `connectionTimeoutMillis:5000`、:964 `query_timeout:15000`（R-22 客户端双层注释 :957-963）；全部 `createPool` 产出池（worker/checkpoint/sse-listen/job-wakeup/privacy-worker/rag-control/qbank-control/api）同承。裸 `new Pool` 仅 smoke/test 面（`cloud-smoke-runner.ts:48`/`cloud-test-serial.ts:185` 自带 `statement_timeout:10_000`）非生产 tick 面。`packages/db/test/ha3-pool-resilience.proof.ts:58-59` A1 臂在案钉值。**残面**：四参 env 值 `Number()` 裸转换零校验——`0`=静默禁用该层超时、负数/NaN 同样静默生效（§1-修法乙残·留独立槽）。
- **模型面三层有界（挂起候选排除清单·外部调用类）**：invoke deadline 三元 `invoke.ts:374-376`（execution 35_000/transport 30_000≤execution/wait 35_000·`boundedEnvIntegerFrom` 有界校验）→ `timeout.ts:20-28` `withAbortTimeout`（到点 abort 真断+caller 有界弃等·「non-cooperative adapter may still settle later」=弃 promise 泄漏面文档自认 :16-18）→ `model-client.ts` `dispatchOnce`=`fetchJsonWithTimeout`（transport 30s 整交换含 body）；流式通道 idle watchdog 10s+总闸 execution（`resolveModelStreamDeadlineConfig`）；G7 账本文件锁 5s bounded（`g7-freetier-reprove-guard.ts` `withG7LedgerLock` EEXIST 自旋→`g7_cost_ledger_lock_timeout`）；429 退避 ≤3 轮×≤2s（`bounded429BackoffMs` :280-289 exhaust 即返）；web-explore 整链 `AbortSignal.timeout`（`web-explore.ts:226`）；RAG Redis connect/socket timeout 1-10s（`rag-redis-cache.ts:123-124,156-158`）。
- **租约面（派单前提勘误②·亲证）**：job 族租约 `LEASE_SECONDS=120`（`interview-jobs.ts:11`/`quiz-jobs.ts:7`/`diagnosis-jobs.ts:8`/`report.ts:8`）非 60s；心跳已接线三消费者（`job-heartbeat.ts:9-22` setInterval 30s 续租 TTL 120s=4x 余量·`interview-consumer.ts:366`[EXEC 重 pin·旧值 :364]/`quiz-consumer.ts:28`/`diagnosis-consumer.ts:28`）——report 无心跳但单 invoke ≤35s≪120s 算术安全（披露）。`ai_model_invocation` claim 租约 `leaseSeconds:60`（`invoke.ts:782`）无运行时续租；缺省 execution 35s<60s 余 25s 亲证安全；>60s 配置窗=**既有裁决已缓释**（`token-stream.ts:38-48` 启动哨兵 `token_stream_single_writer_window_open` 结构化 warn+web 侧 max-seq (attemptKey,seq) 幂等吸收·`token-stream.proof.ts:295` 静态臂钉死单写者前提声明）。
- **锁等待面**：三租约族全 lease 形 CAS（`UPDATE…WHERE lease_expires_at<now()`·`interview-jobs.ts:154-179`）非阻塞锁；advisory xact lock（:152 入队/派单 owner 键）等待发生在语句执行内→被 `statement_timeout=15s` 罩住；PG 行锁死锁由 `deadlock_timeout` 兜底。**真候选=看护者与被看护者同 loop 耦合**：reaper（`sweepStuck*Jobs`）住在各消费 tick 内（`interview-consumer.ts:638`[EXEC 重 pin·旧值 :635]/`quiz-consumer.ts:98`/`diagnosis-consumer.ts:96`/report sweep 同拍 `report-worker.ts:234`）——tick 挂死=reaper 同死；在飞 job 心跳独立存活持续续租→租约永不过期→**「心跳养僵尸」：即便他 loop 代跑收割亦无从重领**；同面试 `NOT EXISTS(running 未过期)` 谓词（:164）阻塞该面试全部后续 job=队列死锁。
- **放大器**：13 loop 共享池（max 20）——挂死 tick 若停在 `asPrincipal` 事务内（`principal.ts` fn 未 settle）则 client 不 release→池耗尽级联（他 loop `pool.connect()` 5s 超时连败→readiness 全翻红）。

## §1 归因（LIVE 判别实测转录·G7W 新红诊断席定谳·本席结构复核亲证）

- **LIVE 三事实（派单转录）**：账本末模型活动后 **6min03s** 零模型零帧零终局；**两笔精确 30.0s reserve→release 无 call**（=`MODEL_TIMEOUT_MS` 缺省 30s 传输超时形·G7 账本对 `reserveG7CallOnSharedLedger`/`releaseG7ReservationOnSharedLedger` 载体）；**多 job 并发在飞交叠**（同毫秒启动双笔=per-owner inflight/多 owner 并发在飞）。
- **结构归因链**：传输超时两笔本身有界且正确（30.0s 到点 abort+release=G7 纪律·非根因）→根因在其后**收尾/调度链中某 settle-less await**（非 DB 非 fetch 族·静态读码不可钉死单锚=诚实登记·DB 族已被池四参 15s 界住故真无限等候选必在非 DB await 族）→该 tick 挂死→**reaper 同 loop 同死**+**心跳独立存活续租**（僵尸租约永不过期·重领机制结构性失效）→同面试后续 job 全阻塞→账本静默而进程健康=**无人看管的无限等待**。
- **前提勘误两件（如实·不推翻主定谳）**：①「运行时 DB 池无 statement_timeout（仅 migrate.ts 会话级）」不成立（§0.2 池面亲证·`migrate.ts:472-490` 会话级 set_config 是**另一层**迁移专用面）；②「claim lease 60s 而单 job 墙钟 30s 传输超时可破 60s」——job 族实为 120s+心跳已接线；60s 系 invocation claim 租约且缺省算术安全。**主定谳维持**：tick 挂起→worker 单侧永久静默停摆且进程健康+watchdog 缺位=结构事实成立（`drain-loop.ts:41-46` 亲证）。

## §1-修法（组合案定稿·甲主刀入码+乙丙核面披露随卷）

### 1.0 组合案裁决

**裁决=甲（tick 级 watchdog）主刀入码；乙/丙主体均系「既成事实/已接线」核面披露不入本刀 diff；乙残（池 env 校验）与丙残（fail-loud 对齐守卫）分别否决/留槽（§1.3）。** 理由：LIVE 停摆形的直接断点是「loop 永挂无中断」——甲一刀断之；乙主体已在（修之=伪命题）、丙主体已接线+缺省算术安全+>60s 窗已有双缓释（修之=翻既有裁决）；最小面纪律（恰 2 码文件·worker 单包）。

### 1.1 甲案两件

- **件① `drain-loop.ts`（唯一产品码改面·零迁移零 env 闸零行为位移于正常拍）**：`runDrainLoop(tick, intervalMs = 5000, opts?: { tickWatchdogMs?: number })`——新增导出常量 `TICK_WATCHDOG_DEFAULT_MS = 600_000`（缺省 10min：真挂必触；合法深队列 tick 墙钟上界=launch cap 32/owner×多 owner÷globalInflight 4×单 job ≤~90s 可达分钟级·600s 不误伤·`interview-dispatch-fairness.ts:10-16` 算术锚）。tick 体改 `Promise.race([tick(), watchdog])`：watchdog 到点以具名错 `tick_watchdog_timeout` reject→流入既有 catch 臂（`consecutiveFailures++`·`lastSuccessAt` 不置）→`ready()` 经 3 连败/陈旧窗翻 false（观测+自愈双面）+结构化 `console.error(JSON {event:'worker_tick_watchdog', hungMs, consecutiveFailures})`→`waitForWakeOrInterval` 照常→**下一拍重试=loop 自愈**（reaper/gauge/调度全责复活）。纪律三桩：①败者计时器清理（`clearTimeout`·`drainWithDeadline:143` 同形）②`stopped` 短路（stop 后 watchdog 不再触发·排水语义 :2-3 零触）③drain-loop 纯注入形保持（零 env 读零 IO·proof 注入短值确定性证明·13 调用点零改=第三参可选向后兼容）。
- **件② `drain-loop.proof.ts` 新增 watchdog 臂组（预期 ≥8 臂·EXEC 期定值）**：正形=挂 tick→注入短 watchdog 到点中断→下一拍继续跑/`snapshot().consecutiveFailures` 计入/`ready()` 翻 false/结构化日志字段在；负形=正常拍零误触发（多拍稳态 watchdog 触发计数 0·计时器清理无泄漏）/`stop()` 后挂 tick 不再触发 watchdog 臂（排水路径零行为位移）；泄漏面披露臂=被弃 tick 后迟 settle→无二次中断无崩溃 loop 稳定。既有 14 臂零改零删（签名向后兼容活体证）。

### 1.2 泄漏面核（甲案被弃 promise 资源面·诚实登记）

被弃 tick promise 继续在跑：①其 DB 面（claim/心跳/markDone/账本）全被池四参 15s 界住**终将 settle**——settle 后 markDone/markFailed/租约 CAS 幂等照走（crash-safe 语义即重领安全网·correctness 保持）；②settle-less 非 DB await 则闭包驻留（内存）+其在飞 job 心跳若存活则「僵尸租约窗」持续至进程重启——甲把「loop 永久静默（全责停摆）」降为「单 tick 僵尸（loop 侧全责复活）」；僵尸收尾（heartbeat 续租上限/租约强收）=独立域**留槽不混刀**（§1.3 丁）。

## §1.3 修法候选淘汰登记（防 EXEC 期重开）

- **纯乙案（运行时池补 statement_timeout）**：伪命题否决——`principal.ts:947-948+:964` 已在（§1 勘误①亲证·ha3-pool-resilience A1 臂钉值）。
- **纯丙案（claim lease 与墙钟对齐+心跳接线）**：心跳已接线三消费者=伪命题（§0.2 租约面亲证）；缺省算术 35s<60s 余 25s 安全。
- **丙残（execution>lease fail-loud 启动守卫）**：**否决**——翻 TOKENSTREAM S4b 既有二择一裁决（配置上界声明+`token_stream_single_writer_window_open` 启动哨兵+web max-seq 幂等吸收·`token-stream.proof.ts:295` 静态臂在案）=越权；>60s 窗已有双缓释非裸奔。
- **乙残（createPool 四参 env 值 fail-loud 校验）**：不入本刀留独立小刀槽——`createPool` 构造点遍布 api/worker/test 面广·0=显式禁用语义去留需独立 survey（本刀登记：`0`/负/NaN 现状静默生效=配置性自废武功窗·真实残面如实披露）。
- **job 级 watchdog（三 consumer per-drainOnce 中断+心跳停）**：跨三 consumer+租约交互面大·僵尸窗已由甲降级为可观测窗·留槽。
- **进程级 self-heal（watchdog 触发即 process.exit 靠容器重启）**：违本文件优雅排空纪律（:2-3 stop() 等在飞 tick 收尾）与 HA 北极星「快速恢复/优雅降级」；重启面归编排层。
- **丁案（僵尸租约收尾刀：heartbeat 续租上限/租约强收/多 loop 收割互备）**：独立域留槽（本刀 §1.2 ②披露的闭环面）。
- **env 旋钮案（WORKER_TICK_WATCHDOG_MS 经 main.ts 13 调用点注入）**：否决——机械扩散越最小面；`opts` 参数形已留运维口（缺省 600s 定值·后续需要时单刀接线 env）。

## §2 验收断言（门矩阵·起草席亲跑实测 @支线树基线·EXEC 期重跑为准）

- 门 1 **`pnpm -C apps/worker prove:ha2-drain` 58/58 EXIT=0**（起草席基线亲跑在案 `PASS=58 FAIL=0`·含 `:169` 源级两相化断言=drain-loop.ts 触面回归锚·EXEC 重跑为准）。
- 门 2 **`pnpm -C apps/worker prove:drain` 既有 14 臂+新增 watchdog 臂组（≥8·EXEC 定值）全绿 EXIT=0**——正形（挂 tick 到点中断+自愈+计数+ready 翻红+日志字段）与负形（正常拍零误触发/stop 后零触发）双向·neg 判别臂在组内。
- 门 3 邻面：**`pnpm -C packages/db prove:ha3-pool-resilience` EXIT=0**（离线形·A1-live SKIP 形·起草席亲跑）+**`pnpm -C apps/worker prove:token-stream` 隔离形 EXEC 面**（`:295` 静态臂=丙核锚·不在改动集恰等；起草席无 DB 目标未跑=如实登记）+reaper/requeue-backoff 隔离形 EXEC 面（租约语义邻面）。
- 门 4 `turbo typecheck --force` **8/8 EXIT=0（0 cached）**（起草席亲跑 20.9s）。
- 门 5 `turbo lint --force` **12/12 EXIT=0（0 cached·root 5235 warnings 0 errors）**（起草席亲跑 18.3s）。
- 门 6 `docs:check` EXIT=0（基线 2193≤cap 2200·+1 本 REQUEST=2194·EXEC 实跑回填）。
- 门 7 markers：本刀改动集全部新增行五类标记词（词表沿 `scripts/i6-239-gates.proof.mjs:154` 四词+冲突对·词面不誊防自指）直扫零命中+全树行首冲突标记 `git grep` 锚形扫 EXIT=1 零命中（起草席实扫 104 新增行零命中·EXEC 期全量重扫为准）。
- 门 8 diff 面：**恰 5 tracked=2 码（`drain-loop.ts`+`drain-loop.proof.ts`）+3 docs（本 REQUEST 新+LEDGER 刀位图行+checklist 段）**·零多零少·Ban 面（§0.1 其余 12 锚）零触亲证。
- 卫生：`pnpm install --frozen-lockfile` 零 lockfile 改·`apps/web/tsconfig.tsbuildinfo` 门副产 checkout 回滚·est live=0·`actualSpendCny=null`·零迁移零 DDL 零 env 闸（watchdog 缺省常量形非 env 闸）。

## §5 Ban 列表 + pins

- Ban：`packages/db/src/principal.ts`（`c31cbac0`·乙残留槽）·`packages/ai-runtime/src/invoke.ts`（`44340f39`·丙残留槽）·`packages/ai-runtime/src/model-client.ts`（`61471ed4`）·`packages/ai-runtime/src/timeout.ts`（`a5a4e46d`）·`packages/ai-runtime/src/g7-freetier-reprove-guard.ts`（`4e75fae7`）·`apps/worker/src/job-heartbeat.ts`（`ebca2fe1`·丙核锚零字节）·`apps/worker/src/main.ts`（`6fa1e374`·调用点零改零字节）·`apps/worker/src/interview-consumer.ts`（`27ddbcf1`）·`apps/worker/src/interview-dispatch-fairness.ts`（`34f0144f`）·`packages/db/src/interview/interview-jobs.ts`（`c69c03a3`）·`apps/worker/src/token-stream.ts`（既有裁决载体零字节）·`apps/worker/test/ha-2-drain.proof.ts`（`9079347b`·门 1 邻面臂账恰等）·全部迁移/CI/门脚本。
- pins：基线 tip=`d5dc0726`（EXEC 并线后=@origin tip `5c8e122c`·merge 落点 `4c20f12b` 第二亲·§0 EXEC 重 pin 记）·§0.1 十四 blob 锚+§9.3 四 rev 锚（EXEC 重 pin 后值）·门 1 基线 58/58·门 2 基线 14 臂·`TICK_WATCHDOG_DEFAULT_MS=600_000`·`SERIAL_DRAIN_TICK_WATCHDOG_MS=1_800_000`（§9.1 修订② EXEC 落值）·typecheck 8/8·lint 12/12（root 5235·worker 954）·docs cap **2208**（[双审席2 P3-1·EXEC 落]cap-sanction-2208 sanction 后值·`public-text-policy.mjs` `MAX_FILES=2_208` 亲证·旧值 2200 史录）。
- ⛔push（origin 任何 ref）·⛔merge 主线（`feat/mysql-schema-skeleton`）·⛔force push·⛔pull --rebase。

## §8 est live / 预算 + STOP

- est live=0（watchdog 纯调度面+proof 注入形·EXEC 期全门=本地 tsx/turbo/eslint+静态源读·零模型外呼零 DB 外呼零容器零 Key 加载零 secrets 读用零生产操作）· 0 Key 值 · `actualSpendCny=null` · 零迁移 · 零模型外呼。
- **STOP=`executed:awaiting_post_prove_dual`（EXEC 席翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录·三处同值翻面=本 REQUEST §8+LEDGER 管线「worker-hang-guard 起草」行+execution-master-checklist「Line worker-hang-guard」段·post-prove 双审两独立外席待派·alone≠dual）**。
- **波序注记[双审席1 R3·EXEC 落]（append 形·上文零洗）**：本刀与 **G7W-DIAG-NEEDLES 串行排程**——`interview-consumer.ts`/`interview-jobs.ts` 系两刀触面交集（本刀 §0.1 零字节 Ban 锚·彼刀诊断针面）·**平行触改必熔断**；并入顺序归协调方裁，后并线刀 §0 对届时 tip 再重 pin（blob 漂移语义不变只更行号·语义变回炉）。
- 开工条款：pre-exec 双审 BOTH PASS 后 EXEC 席按 §0 对届时 tip 重 pin 开工；若基线漂移致 §0.2 行号位移，结论不变则只更行号并如实登记。
- 停止条件：①重 pin 时 blob 漂移且语义变（→回炉起草）②门 1/门 2 基线臂账被他刀改动（→熔断呈报·禁 retry-to-green）③门 3 邻面任一非恰等（→熔断呈报）。
- **起草卷后主线漂移登记（2026-10-16·append 注记形·上文零洗）**：本卷落卷后主线 tip 漂移 `d5dc0726`→`f7caa206`（他席 UUID-ID-CHECK nail 推进·reflog `update by push` 亲证·fastforward 线 `merge-base --is-ancestor` EXIT=0 亲证）——漂移面恰 5 files（`apps/api/src/modules/privacy/privacy.service.ts`+`apps/api/src/platform/uuid.ts`+3 docs）与本刀 §0.1 十四 blob 锚**零交集**亲证（`git diff --name-only d5dc0726..origin/feat/mysql-schema-skeleton` 逐名核对）；与 SSOT docs（checklist+LEDGER）同文件 append 位相交=EXEC 期并线沿**并集解**先例（ai-graphs nail 波同款）；派单下界「fetch 后 origin tip≥最新」以 fetch 时点等号成立亲证（`d5dc0726`=fetch 时 tip）·EXEC 开工按 §0 对届时 tip 重 pin 不受影响。

## §9 rev 修订注记（pre-exec 双审席1 FAIL P1×1 修法算术回路·rev 席落卷 2026-10-16·**append 注记形·上文 §0-§8 零洗**·本节为 EXEC 期对前文对应句的权威修正与增补）

> 席1 FAIL 定谳（rev 席逐位亲证成立）：`TICK_WATCHDOG_DEFAULT_MS=600_000`「不误伤」算术**只对 interview 成立且引用错位**——interview 真护栏=enqueue 帽 3/owner+requeue 退避 2^attempts 封顶 300s（非 launch cap 32）；quiz/diagnosis/report 三 loop 经 `owner-queue-drain.ts:19-21+:30-38` **严格串行无帽抽干**（深首 owner 占拍至 idle·`A,A,A,B` 形）——report 单 job 实测 31s（generate 图+成长链·enqueue 无背压帽）→积压 ≥15-20 单即 tick>600s **必误触**，且停摆恢复窗（本刀目标场景）正是积压最深处。误触后果链：叠跑 drain（每 watchdog 周期 +1 在飞僵尸）+告警噪音淹没真挂信号+ready() 持续噪红。rev 五条修订如次·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值（§9.7）。

### §9.1 修订①（P1 核心裁量·EXEC 前定稿）——分组定值案

**裁决：600s 缺省只保留给「结构性有界」loop；三串行抽干 loop 显式更大定值。** 全量 `runDrainLoop` 调用点勘补枚举=**14 处**（原 §0.2「~13 处」漏登 stub（`main.ts:758`）一处+route-classify 已在「四消费」列名但被错标计数吞没·EXEC 勘记如实补登[双审席1 R2]）：interview 1（`interview-consumer.ts:659`·EXEC 重 pin[双审席2 P3-2]）+串行抽干显式组 3+缺省组 10（gauge `main.ts:746`+stub `main.ts:758` stub 模式专用+route-classify `route-classify-consumer.ts:63`+commerce-reconcile `:139`[EXEC 重 pin·旧值 :136]+model-invocation-reconcile `:144`+usage-calibration-reconcile `:114`+usage-calibration-retention `:83`+qbank-release-sweep `:106`+privacy eraser×2 `privacy-erasure-worker.ts:38+:59`）。1+3+10=14 恰等。

- **A 组（保 600s 缺省=10 处缺省组+interview）·interview 600s 判据修正（引用错位修正）**：真护栏=①入队帽 `MAX_INTERVIEW_PER_OWNER_QUEUED=3`（`interview-jobs.ts:25`·同事务闸 `:89-91`·advisory lock 串行收紧形 `:79`）②requeue 指数退避 `2^attempts` 封顶 300s（`INTERVIEW_RETRY_BACKOFF_CAP_SECONDS=300` `:18`·写入 `:280`·claim 时闸 `:162`）③attempts≤5 reaper 终界（`:15`）——同 owner queued 深度结构性 ≤3+重入速率被退避节流→单 owner 每拍工作量小常数。launch cap 32/owner÷globalInflight 4（`interview-dispatch-fairness.ts:15-16+:10-13`）系**并发量子/livelock 防护非深度护栏**——原 §1.1 件①「launch cap 32 算术不误伤」引用错位·以此节为准。残余披露：跨 owner 极端满队（N≥7 owner 同时满队 ~4 job×90s 单 job 界÷inflight 4≈630s>600s）理论可触——产品量级罕见+误触后果非灾难（§9.4 承接）→维持 600s。**route-classify 结构披露（rev 亲证追加·席1 清单未列）**：`route-classify-consumer.ts:53-58` tick 亦系 `drainOwnersInListedOrder`（`:57`）串行抽干形——其队列=`job_semantic_revision.route_pending` 内部重分类（非用户动作队列·revision churn 量级）·单 job=1 classify invoke ≤35s+DB 界→内部量级判据下 600s 维持；产品化放量→独立刀槽（防隐没登记）。
- **B 组（显式更大定值·经 `opts.tickWatchdogMs`）=quiz/diagnosis/report 三串行抽干 loop**：`drain-loop.ts` 新增导出常量 **`SERIAL_DRAIN_TICK_WATCHDOG_MS = 1_800_000`**（与 `TICK_WATCHDOG_DEFAULT_MS=600_000` 并列）；三 runner **体内** `runDrainLoop` 调用处显式第三参 `{ tickWatchdogMs: SERIAL_DRAIN_TICK_WATCHDOG_MS }`（`quiz-consumer.ts:108`/`diagnosis-consumer.ts:106`/`report-worker.ts:243` @`c3f1708e` 各恰 1 行）。runner 对外签名不变→**main.ts 调用点零改保持为真**。
- **三 loop 定值算术行（rev 席各自亲算）**：
  - **report=1_800_000（30min）**：单 job 实测 31s（LIVE 派单转录=generate 图 1 站 `report-worker.ts:170`+成长链 3 站 `:108/:132/:141`·共 4 模型站·每站 invoke execution 帽 35s `invoke.ts:374-376`→单 job 上界 140s）×目标深积压 30 job（停摆恢复窗量级=600s 缺省误触阈 600÷31≈19 job 的 ×1.5）=**930s**→裕度 ×2=1860s→定值 1_800_000 落 600s×3 运维网格（实裕度 1800÷930≈×1.94·等价吸收 ≈58 job@31s）。残余：report enqueue 无深度帽（`report.ts:13` 起 enqueueReport 零 count 闸亲证）→>58 job 积压仍可触=非灾难后果（§9.4）+入队背压独立域留槽（沿 QUEUE-ENQUEUE-BP 先例）。**上界基残余披露[双审席1 R1·EXEC 落]**：若四模型站**各贴** 35s execution 帽（非实测均值形·上界基算术）=**140s/job**→定值 1800s 于积压 **≥13 单**（1800÷140≈12.86）即误触——同 §9.4 非灾难承接（叠跑僵尸幂等照走+结构化日志每触必登·非静默），如实登记不以实测 31s 形掩盖上界窗。
  - **quiz=1_800_000（30min）**：单 job=押题图 1 模型站（`quiz-lifecycle.ts:48` graph.invoke·parse→generate→validate→make_report 单 invoke）+DB 界链（claim/解密读/markDone 各 ≤15s 语句界 `principal.ts:947-950+:964`）→**单 job 保守墙钟界 60s**（35s invoke 上界+25s DB 链不叠满取整）；典型域派生 ~15s（report 31s÷4 站≈8s/站+同形 DB 链·**派生非实测·如实登记**）。目标深积压 30 job×保守界 60s=**1800s**→定值 1_800_000（保守界内嵌 per-job 余量→等效裕度 ≥×2；典型域 30×15=450s→×4）。**语句级叠满界披露[双审席2 P2-1·EXEC 落]**：单 job DB 语句链（claim/解密读/markDone/账本族）**语句级叠满**最坏 ≈**95-125s**（各语句各贴 `statement_timeout` 15s 上界叠满形+invoke 35s 帽）→定值 1800s 吸收 ≈**15-19 job**——现「60s 保守界」对语句超时叠满形**非保守**·如实登记（>15-19 job 深积压仍可触=§9.4 非灾难承接·背压留槽）。**裁量披露**：按典型 ×2 法则=900s 罩不住保守界（恢复窗模型变慢域 30 job 必误触·而恢复窗恰本刀目标场景）→择保守界定值·代价=真挂检测时延上限 30min（≪永久静默·可接受）。
  - **diagnosis=1_800_000（30min）**：同 quiz 形（诊断图 1 模型站 `diagnosis-lifecycle.ts:52`+同形 DB 界链）→同法定值 1_800_000·同裁量披露·**同语句级叠满界披露[双审席2 P2-1·EXEC 落]**（单 job 语句级叠满最坏 ≈95-125s→1800s 吸收 ≈15-19 job·「60s 保守界」对语句超时叠满非保守·如实登记）。
- **「13 调用点零改」表述修正**：收窄为「**main.ts** 调用点零改」（runner 签名不变为真）；三串行 loop 的传参载体=runner 体内调用处显式第三参恰 3 行——原「13 调用点零改=零改面向后兼容」表述以此节为准。
- **「零行为位移于正常拍」限定语修正**：修正为「**正常短拍+合法深队列长拍（tick 墙钟 ≤watchdog 定值）零位移**——合法深队列拍=watchdog 设计保护对象非误伤面；超值长拍=设计内到点中断（非灾难后果·§9.4）」。原 §1.1 件①「零 env 闸零行为位移于正常拍」句以此限定语为准。
- **diff 面随之修正**：§2 门 8「恰 5 tracked=2 码+3 docs」→「**恰 8 tracked=5 码**（`drain-loop.ts`+`drain-loop.proof.ts`+`quiz-consumer.ts`+`diagnosis-consumer.ts`+`report-worker.ts`）**+3 docs**」；§1.1 件①「唯一产品码改面」→「恰 5 码面·worker 单包保持」；§5 pins 增 `SERIAL_DRAIN_TICK_WATCHDOG_MS=1_800_000`。

### §9.2 修订②——门 2 臂清单补误伤判别臂

门 2 watchdog 臂组（≥8 臂）增补：**误伤判别臂=注入多 job 慢 tick（墙钟>注入 watchdog 值）→正判别**（watchdog 到点具名中断·证明超值长拍确被覆盖）**+叠跑/计数/恢复行为确定性断言**（弃 tick 迟 settle 幂等照走+`consecutiveFailures++`+下一拍续跑+无崩溃）——与既有负形臂（正常拍零触发·stop 后零触发）合组=双向判别完备。EXEC 定值臂时以注入短值承载同形。

### §9.3 修订③——§0.1 锚表 rev 增补行（blob @`c3f1708e`=草稿 tip·草稿零码面故=d5dc0726 同值亲证）

| 文件 | blob | rev 定性 |
|---|---|---|
| `apps/worker/src/owner-queue-drain.ts` | `2ce26c6c` | **触面邻锚**（三 runner 串行抽干 tick 墙钟语义承载·`:19-21` 深首 owner 占拍+`:30-38` 抽干循环） |
| `apps/worker/src/quiz-consumer.ts` | `477f09e8` | **rev 后触面**（B 组显式传参 `:108` 恰 1 行） |
| `apps/worker/src/diagnosis-consumer.ts` | `14a7b39c` | **rev 后触面**（B 组显式传参 `:106` 恰 1 行） |
| `apps/worker/src/report-worker.ts` | `245c9ac5` | **rev 后触面**（B 组显式传参 `:243` 恰 1 行·blob @`5c8e122c` 树 EXEC 重 pin[双审席2 P3-2]·旧值 `a6a1f6c2`=漂移面 quarantine eventKey 幂等键与本刀锚面语义无涉亲读） |

引用如实登记：席1 FAIL 引 enqueue 帽「`interview-jobs.ts:79`」——`:79` 实系同闸 advisory lock 行·深度判定在 `:89`（@`d5dc0726` 亲证）——定值判据以 `:25+:79+:89-91` 为准。EXEC 期重 pin 沿 §0 规则（结论不变只更行号）。

### §9.4 修订④（P2）——§1.2 堆叠语义扩登+门 2 堆叠披露臂

watchdog **每次触发=弃当前 tick promise→+1 在飞僵尸**（DB 面 15s 终 settle 幂等照走/settle-less 闭包驻留至进程重启·§1.2 ①②承接）；**触发速率上界 ≤1/watchdog 值/loop**（B 组 ≤1/1800s·缺省组 ≤1/600s）；**误触恢复窗内可达多叠**（深积压跨 watchdog 周期持续→每周期 +1·如 30 job×90s 界≈2700s 域可达 1-2 叠）——叠跑僵尸各自幂等照走=重领安全网承接·**非静默**（`worker_tick_watchdog` 结构化日志每触必登·误触噪音即观测代价如实披露）。门 2 增**重复触发堆叠披露臂**：连续两慢 tick→两具名中断·在飞僵尸计数 2·loop 稳定无崩溃。

### §9.5 修订⑤（P2/P3）——ready() 归因对齐+计数勘误

- **§1.1 ready() 归因对齐**：挂死 tick 翻红**本由既有陈旧窗承载**（`max(intervalMs×3,5s)`=15s@缺省 intervalMs 5000·`drain-loop.ts:76`·§0.2「仅陈旧窗一肢可达」已亲证≈15s 即红）——watchdog 增量=①到点具名中断（摆脱永挂）②下一拍自愈（reaper/gauge/调度全责复活）③`consecutiveFailures++` 信号增强（入 3 连败臂）。原 §1.1「ready() 经 3 连败/陈旧窗翻 false（观测+自愈双面）」的**watchdog 增量归因**修正为「翻红由既有陈旧窗/3 连败臂承载·watchdog 供中断+自愈+计数增强」。
- **计数勘误（P3）**：门 7/起草 commit「新增行 104」→**实测 103**（`git diff --numstat d5dc0726..c3f1708e`=10+1+92 亲证）——104→103 勘误·markers 直扫结论不变（rev 席增量行复扫见 §9.6）。

### §9.6 门矩阵 rev 后口径（rev 席亲跑）

- 门 6：`docs:check` EXIT=0 **2194≤cap 2200**（rev 席亲跑·文件计数制·本 rev 恰 1 doc 改零新增文件→计数不变）。
- 门 7：rev 增量行 markers 直扫零命中（五类标记词+冲突对·词面不誊）+全树行首冲突标记 EXIT=1 零命中（rev 席亲扫）。
- 门 2/门 8：沿 §9.1/§9.2/§9.4 rev 口径（B 组显式传参 3 行入 diff 面·误伤判别臂+堆叠披露臂入臂组）——EXEC 期全门重跑为准。
- 卫生随承：`apps/web/tsconfig.tsbuildinfo` 门副产 checkout 回滚纪律保持。

### §9.7 rev 后 STOP 状态

**STOP=`draft:awaiting_pre_exec_dual` 三处同值维持**（本 REQUEST §8+LEDGER 管线「worker-hang-guard 起草」行+execution-master-checklist「Line worker-hang-guard」段·零改）。rev 落卷后待**窄域复审确认**五条修订落点（§9.1-§9.5）→**重派 pre-exec 双审两席**；开工权归协调方·⛔push ⛔merge 主线 ⛔改码面（本 rev 恰 1 doc 零码面）。

### §9.8 EXEC 记录（EXEC 席落卷 2026-10-16·七字段+双审落卷义务清单逐项落点·STOP→`executed:awaiting_post_prove_dual`）

**授权链**：起草落卷 `c3f1708e`→rev 落卷 `a479fdc2`（席1 FAIL P1×1 修法算术回路五条修订）→pre-exec 双审**重派会签 PASS×2**（席1 `agent_32506ecd`+席2 `agent_5b8c541d`·「双审会签完成·可授权 EXEC」·落卷义务清单八件 R1-R4+P2-1/P2-2/P3-1/P3-2 随 EXEC 全落）→协调方授权 EXEC（派单令·STOP→executed:awaiting_post_prove_dual）→EXEC 本卷（merge `4c20f12b` --no-ff 并 `origin/feat/mysql-schema-skeleton@5c8e122c`·派单下界「届时 tip≥5c8e122c」等号成立亲证·merge-base `d5dc0726`=起草基线亲证·SSOT 两 docs 同位 append 冲突沿并集解先例=checklist+LEDGER 双段双保·冲突标记行首全树零残留·⛔pull --rebase 未用）。

**① 门矩阵十二门全表**（并线树 `4c20f12b` 基·交付 commit 前亲跑）：

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 1 | ha-2-drain | 58/58 恰等基线 | 58 PASS/0 FAIL（`:169` 源级两相化断言在组·`LOOP_PHASE_SHARE`/`depsShare` 锚零触） | 0 | 绿 |
| 2 | drain proof | 既有 14 臂零改+watchdog 新臂 ≥8 全绿 | **30 PASS/0 FAIL=既有 14 零改+新增 16 臂**·3 连跑 EXIT=0 稳定（正形 W2-W3+判别 W6+负形 W4-W5+泄漏双形 W6-W7+堆叠 W8+日志 W9+源级 W10+W1/W11 收尾） | 0 | 绿 |
| 3 | 邻面 | ha3-pool-resilience EXIT=0+token-stream/reaper/requeue-backoff 隔离形 | ha3 **EXIT=0**（A1-live SKIP 形·离线绿）；token-stream/reaper/requeue-backoff 三证 `database_target_missing` fail-loud 于模块装载期（**零臂执行·环境无 DB 目标**·沿起草席「无 DB 目标未跑如实登记」先例·§8 est live=0 纪律含零 DB 外呼故不接线本地 dev 库·非臂账非恰等） | 0/1 | 绿/如实登记 |
| 4 | typecheck | 8/8·0 cached | 8 successful, 8 total·Cached: 0（12.7s·proof 终稿后复跑） | 0 | 绿 |
| 5 | lint | 12/12·0 cached·五值恰等 | Tasks: 12 successful, 12 total·0 cached（13.8s）·root **5235** 0 errors 恰等+worker **954** 恰等（中途 +1 红自纠=proof W3 臂 `redCalls` 未读 no-unused-vars·臂数并入断言后复跑归 954·非语义冲销系臂自增强） | 0 | 绿 |
| 6 | docs:check | EXIT=0·≤cap 2208 | `ai-docs check passed: 80 required files verified; public text policy scanned **2203** managed worktree files`≤2208·余 5（=并线树 2202+本卷 REQUEST 恰 1·§9.8 落卷后终树复跑值） | 0 | 绿 |
| 7 | markers | 改动集新增行五类词+冲突对零命中+全树行首冲突标记零命中 | 本刀 5 码+3 docs 本席手迹新增行直扫四标记词+行首冲突标记对**零命中**（词表沿 `scripts/i6-239-gates.proof.mjs:154` 运行时组装·词面不誊防自匹配·回执见 §9.8 ⑦）；全树行首冲突标记 `git grep` EXIT=1 零命中 | 0 | 绿 |
| 8 | diff 面 | 恰 8 tracked=5 码+3 docs·零新受管文件 | `git diff --numstat d5dc0726`（三亲基）恰 **8 tracked**=5 码（`drain-loop.ts`+`drain-loop.proof.ts`+`quiz-consumer.ts`+`diagnosis-consumer.ts`+`report-worker.ts`）+3 docs（本 REQUEST+LEDGER 行+checklist 段）·零新增文件·§0.1 Ban 面 12 锚+§9.3 owner-queue-drain/quiz-consumer/diagnosis-consumer 两锚零触亲证 | 0 | 绿 |
| 卫生 | frozen-lockfile+tsbuildinfo+est live | lockfile 零改·门副产回滚·est live=0 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`apps/web/tsconfig.tsbuildinfo` 门副产 checkout 回滚·est live=0（纯调度面+proof 注入形·零模型外呼零 DB 外呼零容器零 Key 零 secrets）·`actualSpendCny=null`·零迁移零 DDL 零 env 闸（watchdog 定值常量形非 env 闸） | 0 | 绿 |

**② 机制证（新臂账·件② 落码账）**：watchdog 新增 **16 臂**（≥8 判据恰等两倍）——W1 定值常量 pin（600_000/1_800_000 双导出落源）；W2 挂 tick 到点具名中断+下一拍续跑自愈+结构化日志字段（event/hungMs=注入值/consecutiveFailures≥1）+自愈拍计数归零+ready 翻绿；W3 连续挂死 3 拍 ready 翻红（3 连败臂承接·臂数并入断言）；W4 正常短拍多拍稳态零误触发（负形）；W5 stop() 后挂 tick 零触发（负形·stopped 短路回调内查·排水零位移）；W6 误伤判别正形（慢 tick 墙钟>注入 watchdog 到点被中断·下一拍先行续跑）+弃 tick 迟-RESOLVE 吸收形（race 内建成员 handler 吸收·零 unhandledRejection）；W7 弃 tick 迟-REJECT 吸收形[双审席2 P2-2]（同吸收断言·resolve/reject 两形各一臂）；W8 重复触发堆叠披露[§9.4]（连续慢拍→≥2 具名中断·在飞弃 tick 随触累加·loop 稳定续拍）；W9 日志逐事件字段完备（每触必登）；W10 B 组三 runner 显式传参源级机检（SERIAL 常量各恰 2 处=import+调用·`tickWatchdogMs:` 传参形在源）；W11 全程零 unhandledRejection 收尾。件① 落码=第三参 `opts?.tickWatchdogMs ?? TICK_WATCHDOG_DEFAULT_MS`+`raceWithTickWatchdog`（Promise.race 具名错 `tick_watchdog_timeout`→既有 catch 臂 consecutiveFailures++→结构化 `worker_tick_watchdog` 日志+败者计时器 finally 清理+stopped 短路回调内查+unref 计时器）。既有 14 臂逐字节零改亲证（append 形）。

**③ diff numstat（恰 8 tracked 两口径）**：**EXEC 手迹账（对并线落点 `4c20f12b`）**=5 码：drain-loop.ts +60/−2（件① 全部）/drain-loop.proof.ts +95/−1（件② 16 臂）/quiz-consumer.ts +2/−2（恰 import+调用各 1 行）/diagnosis-consumer.ts +2/−2（同形）/report-worker.ts +2/−2（同形）；3 docs：本 REQUEST +55/−12/LEDGER 行 +1/−1/checklist 段 +6/−5。**终树账（对三亲基 `d5dc0726`·含 merge 携入 origin 侧内容）**=8 tracked：checklist +64/−0/LEDGER +16/−3/REQUEST +188/−0/report-worker.ts +3/−3（携入=quarantine eventKey 幂等键 +1/−1·§0 P3-2 已 pin `245c9ac5`）·零新增文件·零删文件。

**④ 重 pin 全表**：§0 EXEC 重 pin 记（十八 blob=15 恒等+3 漂移·漂移面语义无涉亲读=停止条件①不触发）+行号三处（:366/:638/:139）+interview 调用点 :659 新 pin——详 §0 头 EXEC 重 pin 记与 §0.1/§0.2/§9.1/§9.3 内联标注。

**⑤ 偏离清单**：理想零。登记两条非偏离如实注记=①门 3 三证（token-stream/reaper/requeue-backoff）无 DB 目标 fail-loud 零臂执行（沿起草席先例如实登记·est live=0 零 DB 外呼纪律不接线）；②门 5 中途 +1 warning 红自纠（proof 新臂变量未读·臂数并入断言=臂自增强非语义冲销·终值 954 恰等基线）。

**⑥ pins 零翻声明+停止条件判定**：§5 pins 全值对届树复验恰等（常量双值/门 1 58/门 2 14 臂/typecheck 8/8/lint 12/12 root 5235 worker 954/docs cap 2208 sanction 后值·基线 tip 翻至 `5c8e122c`=并线落点如实翻非违约）；停止条件三类逐条判定=①blob 漂移且语义变——**未触发**（3 漂移面 AG-20/quarantine 语义无涉亲读）②门 1/门 2 基线臂账被他刀改动——**未触发**（58/14 恰等）③门 3 邻面非恰等——**未触发**（ha3 离线绿恰等·三 DB 目标证零臂执行同起草席登记形）。

**⑦ markers 扫描命令与回执**：改动集=本刀 5 码+3 docs 对三亲基**本席手迹**新增行，词表沿 `scripts/i6-239-gates.proof.mjs:154` 运行时组装（四标记词+行首冲突标记对·词面运行时拼装不誊入卷防自匹配）逐文件直扫**零命中**（merge 自 origin 侧携入行不在本席手迹集·其内唯一词面命中系 ai-graphs 卷门表 grep 词引用串=uuid-id-check nail 先例已裁非冲突标记）；全树行首冲突标记 `git grep -nE` 行首锚形扫 EXIT=1 零命中；docs:check 终树复跑 **2203**≤cap 2208 EXIT=0（§9.8 本节落卷后）。

**双审落卷义务清单逐项落点（八件全落）**：
- **R1**（席1·report 上界基残余披露）→ §9.1 report 算术行 append「上界基残余披露」句（四站各贴 35s=140s/job→1800s 于积压 ≥13 单即误触·§9.4 非灾难承接）。
- **R2**（席1·调用点句勘记）→ §9.1 枚举句括注改为「漏登 stub（`main.ts:758`）一处+route-classify 已在『四消费』列名但被错标计数吞没」。
- **R3**（席1·波序）→ §8 append「波序注记」句（与 G7W-DIAG-NEEDLES 串行排程·interview-consumer.ts/interview-jobs.ts 系 §0.1 零字节 Ban 锚交集·平行触改必熔断）。
- **R4**（席1+席2·3-docs face 刷新）→ LEDGER 「worker-hang-guard 起草」行+checklist「Line worker-hang-guard」段用语刷新至 §9 权威口径（恰 5 码/8 tracked/main.ts 调用点零改收窄语·本节为权威源）。
- **P2-1**（席2·quiz/diagnosis 语句级叠满界）→ §9.1 quiz+diagnosis 两算术行各 append「语句级叠满界披露」句（≈95-125s/job→吸收 ≈15-19 job·「60s 保守界」对语句超时叠满非保守·如实登记）。
- **P2-2**（席2·迟-REJECT 形断言）→ 件② W7 臂（弃 tick 迟-REJECT 吸收形·race 成员内建 handler 吸收=无 unhandledRejection）+W6 迟-RESOLVE 形各一臂+W11 全程零 unhandledRejection 收尾臂。
- **P3-1**（席2·docs cap）→ §5 pins docs cap 2200→**2208**（sanction 后值·`MAX_FILES=2_208` 亲证）。
- **P3-2**（席2·三锚 blob+两行号）→ §0.1 main.ts `61692bbb`/interview-consumer `265798df`+§9.3 report-worker `245c9ac5`（origin tip 现值亲算恰等）+commerce-reconcile `:139`/interview 调用点 `:659`（§9.1 枚举内联 pin）。
