# WORKER-HANG-GUARD REQUEST — worker 单侧停摆自愈刀（drain-loop tick 级 watchdog 甲案 · G7W 新红诊断席修复建议②产品码独立刀 · 诊断+起草席落卷 · STOP=`draft:awaiting_pre_exec_dual` 三处）

> 战役 meetwise · 支线 `line/worker-hang-guard` · 工作树 `meetwise-whg` · 起草基线 @origin/feat/mysql-schema-skeleton=`d5dc0726`（派单下界「fetch 后 origin tip≥最新」以等号成立亲证=fetch 后 `origin/feat/mysql-schema-skeleton` tip·`origin/main`=`112e6d26` 为其祖先亲证 `git merge-base --is-ancestor` EXIT=0）· ⛔push ⛔merge 主线（push/翻面权归协调方）。主仓 worktree 建支线：`git worktree add ../meetwise-whg -b line/worker-hang-guard origin/feat/mysql-schema-skeleton`。

## §0 现状锚（停摆面双向锚·起草席亲读+blob 亲算 @`d5dc0726`·**EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.1 blob 锚表（`git rev-parse d5dc0726:<path>` 亲算）

| 文件 | blob @`d5dc0726` | 本刀触面 |
|---|---|---|
| `apps/worker/src/drain-loop.ts` | `ba51dd17` | **件① 触（唯一产品码改面）** |
| `apps/worker/test/drain-loop.proof.ts` | `2b401be2` | **件② 触（watchdog 臂组）** |
| `apps/worker/test/ha-2-drain.proof.ts` | `9079347b` | 零字节 Ban（门 1 邻面 58 臂·源级断言回归锚） |
| `apps/worker/src/job-heartbeat.ts` | `ebca2fe1` | **零字节 Ban**（丙核锚·已接线在案） |
| `apps/worker/src/main.ts` | `6fa1e374` | **零字节 Ban**（13 调用点零改=第三参可选向后兼容） |
| `apps/worker/src/interview-consumer.ts` | `27ddbcf1` | 零字节 Ban（reaper 同 loop 耦合+心跳接线锚 :364） |
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
- **租约面（派单前提勘误②·亲证）**：job 族租约 `LEASE_SECONDS=120`（`interview-jobs.ts:11`/`quiz-jobs.ts:7`/`diagnosis-jobs.ts:8`/`report.ts:8`）非 60s；心跳已接线三消费者（`job-heartbeat.ts:9-22` setInterval 30s 续租 TTL 120s=4x 余量·`interview-consumer.ts:364`/`quiz-consumer.ts:28`/`diagnosis-consumer.ts:28`）——report 无心跳但单 invoke ≤35s≪120s 算术安全（披露）。`ai_model_invocation` claim 租约 `leaseSeconds:60`（`invoke.ts:782`）无运行时续租；缺省 execution 35s<60s 余 25s 亲证安全；>60s 配置窗=**既有裁决已缓释**（`token-stream.ts:38-48` 启动哨兵 `token_stream_single_writer_window_open` 结构化 warn+web 侧 max-seq (attemptKey,seq) 幂等吸收·`token-stream.proof.ts:295` 静态臂钉死单写者前提声明）。
- **锁等待面**：三租约族全 lease 形 CAS（`UPDATE…WHERE lease_expires_at<now()`·`interview-jobs.ts:154-179`）非阻塞锁；advisory xact lock（:152 入队/派单 owner 键）等待发生在语句执行内→被 `statement_timeout=15s` 罩住；PG 行锁死锁由 `deadlock_timeout` 兜底。**真候选=看护者与被看护者同 loop 耦合**：reaper（`sweepStuck*Jobs`）住在各消费 tick 内（`interview-consumer.ts:635`/`quiz-consumer.ts:98`/`diagnosis-consumer.ts:96`/report sweep 同拍 `report-worker.ts:234`）——tick 挂死=reaper 同死；在飞 job 心跳独立存活持续续租→租约永不过期→**「心跳养僵尸」：即便他 loop 代跑收割亦无从重领**；同面试 `NOT EXISTS(running 未过期)` 谓词（:164）阻塞该面试全部后续 job=队列死锁。
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
- pins：基线 tip=`d5dc0726`·§0.1 十四 blob 锚·门 1 基线 58/58·门 2 基线 14 臂·`TICK_WATCHDOG_DEFAULT_MS=600_000`·typecheck 8/8·lint 12/12（root 5235）·docs cap 2200。
- ⛔push（origin 任何 ref）·⛔merge 主线（`feat/mysql-schema-skeleton`）·⛔force push·⛔pull --rebase。

## §8 est live / 预算 + STOP

- est live=0（watchdog 纯调度面+proof 注入形·EXEC 期全门=本地 tsx/turbo/eslint+静态源读·零模型外呼零 DB 外呼零容器零 Key 加载零 secrets 读用零生产操作）· 0 Key 值 · `actualSpendCny=null` · 零迁移 · 零模型外呼。
- **STOP=`draft:awaiting_pre_exec_dual`（三处同值：本 REQUEST §8 + LEDGER 管线「worker-hang-guard 起草」行 + execution-master-checklist「Line worker-hang-guard」段）**。
- 开工条款：pre-exec 双审 BOTH PASS 后 EXEC 席按 §0 对届时 tip 重 pin 开工；若基线漂移致 §0.2 行号位移，结论不变则只更行号并如实登记。
- 停止条件：①重 pin 时 blob 漂移且语义变（→回炉起草）②门 1/门 2 基线臂账被他刀改动（→熔断呈报·禁 retry-to-green）③门 3 邻面任一非恰等（→熔断呈报）。
- **起草卷后主线漂移登记（2026-10-16·append 注记形·上文零洗）**：本卷落卷后主线 tip 漂移 `d5dc0726`→`f7caa206`（他席 UUID-ID-CHECK nail 推进·reflog `update by push` 亲证·fastforward 线 `merge-base --is-ancestor` EXIT=0 亲证）——漂移面恰 5 files（`apps/api/src/modules/privacy/privacy.service.ts`+`apps/api/src/platform/uuid.ts`+3 docs）与本刀 §0.1 十四 blob 锚**零交集**亲证（`git diff --name-only d5dc0726..origin/feat/mysql-schema-skeleton` 逐名核对）；与 SSOT docs（checklist+LEDGER）同文件 append 位相交=EXEC 期并线沿**并集解**先例（ai-graphs nail 波同款）；派单下界「fetch 后 origin tip≥最新」以 fetch 时点等号成立亲证（`d5dc0726`=fetch 时 tip）·EXEC 开工按 §0 对届时 tip 重 pin 不受影响。
