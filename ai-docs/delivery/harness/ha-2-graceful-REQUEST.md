# HA-2 · 优雅停机双面（R-18 API 无优雅停机掐断 SSE + R-19 worker 停机等待无上限+无 stop_grace_period · HA 簇高优先 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha2-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工**）
**Date**: 2026-10-10
**审计项**: LEDGER HA 簇 R-18/R-19 P1（`ai-docs/delivery/harness/product-campaign-LEDGER.md:129`「API 无优雅停机掐断 SSE；worker 停机等待无上限+无 stop_grace_period」·HA 门映射「优雅停机双面」·优先「高」）·R-17 归 HA-1（:128）·R-22 DB 韧性后刀（:130）
**Base**: `feat/mysql-schema-skeleton` @`df12a054` · 分支 `line/ha-2-graceful`（新立工作树 `meetwise-ha2`：`git worktree add ../meetwise-ha2 -b line/ha-2-graceful df12a054` · 与 `meetwise-ha1`/`line/ha-1-redundancy` 同点分叉互不触碰）
**Honesty**: 蓝本与全部涉案码 file:line 起草席亲读（本章 §0 全录）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（纯停机路径+compose 字段，零 Key 零外呼零模型调用）。

---

## §0 立靶（蓝本+码面亲读 · file:line 全录）

蓝本锚 `product-campaign-LEDGER.md:129`（HA 簇表第 2 行）零漂。逐面亲读实证：

| 面 | 锚（亲读） | 现状（誊录+实证） |
|---|---|---|
| **R-18 API 关闭链** | `apps/api/src/main.ts:123-129`（bootstrap） | `await app.listen(port, host)` 后**函数即返回**——全文件 0 处 `enableShutdownHooks`/`process.on('SIGTERM'|'SIGINT')`/`app.close()`（rg 亲证零命中）。SIGTERM 落下 = Node 默认处置**立即终止**：在飞 HTTP 响应半截掐断、SSE 连接 TCP RST，客户端只见断流 |
| **R-18 SSE 面** | `apps/api/src/platform/sse-pump.ts:53-97` | 泵单源化收口三控制器（interview:254 / quiz:51 / diagnosis:51 `@Get(':id/events')`）：:56 `reply.hijack()` 接管底层 socket（**Fastify close 不再跟踪 hijack 连接**）、:69 `deadline=+10min` 封顶、:71 `reqRaw.on('close')` 断开侦测、:96 干净 `raw.end()`。**进程级无任何在册 SSE 连接注册表**（rg `reply.raw` 写出面全在泵内）——停机时无从枚举、无从排空 |
| **R-18 既有兜底（不成立）** | `apps/api/src/platform/sse-notify.service.ts:262-268` | `SseNotifyLifecycle implements OnApplicationShutdown` 收 LISTEN 池——但 `onApplicationShutdown` **只在 `app.close()` 触发**，而 bootstrap 从不调 `app.close()`（无信号处理）→ 该钩子今天**死代码**，pool 随进程硬死 |
| **R-18 客户端接管（已落·可依赖）** | `line/sse-resilience` 已 nail（merge @8cea67fb · REQUEST `sse-resilience-REQUEST.md` §W3） | 客户端**干净 end 不计失败**、Last-Event-ID 重连语义在位（`apps/web/lib/stream/sse-cursor.ts:59-69` 合法游标头 + 三驱动消费）；服务端账本重放（`interview_event` seq>lastSeq）保证断连窗事件零丢 → **服务端停机只需「不发半截帧 + 干净 close」**，重连续推交给客户端既有韧性 |
| **R-19 worker 关闭链** | `apps/worker/src/main.ts:737` | SIGTERM 一行链：`await` 三 listener stop → `Promise.allSettled([…11 个 loop.stop()/池 close…])` → `metricsServer.close()` → `process.exit(0)`。**三缺**：① 无 drain 上限——`stop()` 等当前 tick 跑完（`drain-loop.ts:62-68` awaits 循环 promise），tick 内在飞 job（报告/面试图=分钟级模型调用）**挂多久等多久**，永不上限；② 无 `SIGINT` 处理（本地 Ctrl+C=默认即死）；③ **漏 `vectorPlaneErasureLoop.stop()`**（:710 建立 · :737 清点缺位）——该循环停机时无人等、池已 end 下 tick 必异常 |
| **R-19 compose 面** | `docker/compose.prod.yml:265-339`（worker 块）·rg 全仓 | 全仓 `docker/*.yml` **0 处 `stop_grace_period`/`stop_signal`**（rg 亲证）→ docker stop 默认 **10s 到点 SIGKILL**。worker「优雅排空」意图被容器先杀：SIGTERM→排水启动→10s 一到 SIGKILL→job 租约被弃→等 reaper。`restart: unless-stopped`（:332）·healthcheck readyz :9091（:335）·Node 直跑 PID1（`docker/compose.prod.yml:269` `command: node …`，无 init/tini） |
| **R-19 租约兜底（crash-safe 已它证）** | `apps/worker/src/job-heartbeat.ts:1-30`（TTL 120s·~30s 续租·`renew()=false` 即停不抢他人租约）·`packages/db/src/report/report.ts:8`（report `DEFAULT_LEASE_SECONDS=120`）·`packages/db/src/commerce/commerce.ts:32`（commerce 1800）·claim/fence（`interview-consumer.ts:180` tx1 claim-commit） | worker 进程消亡 → 心跳停 → 租约按 TTL 过期 → reaper/sweep 重领（`sweepStuckInterviewJobs`/`sweepReports`）。租约互斥保证**强制退出不会双跑同一 job**——这是本刀敢设「到期强制退出」的它证基础（行为已存在：今天 docker 10s SIGKILL 就在走这条路） |

**靶心一句话**：api 收到 SIGTERM 即暴毙（SSE 半截、HTTP 断流、`SseNotifyLifecycle` 永不触发）；worker 想优雅却两头堵——容器 10s 就 SIGKILL，而进程内 drain 又无上限可被单个挂死 tick 拖到永不出——三件事（SIGTERM 链上限、SSE 干净收口、compose 宽限钉值）共同缺失。

## §1 范围（双面四件 · EXEC 依此实现）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 API SIGTERM 排水链（R-18 主件）** | `apps/api/src/main.ts:123-129` | bootstrap 内落完整关闭链：① `process.on('SIGTERM'/'SIGINT')` → 置 `draining=true`（模块级单源旗）；② **拒新请求**：`onRequest` 最前钩子（public-preview 门之后、路由之前）读 draining 旗 → 非健康探针路由即刻 `503 service_unavailable_draining`（信封沿 `AllExceptionsFilter` 形制 + `connection: close`）；`/livez` 保持 200（进程还活着）、`/readyz/api` 翻 503（编排方摘流量的既有依据，compose healthcheck :259 即读它）——**摘流量靠 readyz 翻脸，拒客靠 503 门，两信号分工不得混**；③ **SSE 注册表+排空**（W2）完成后 `await app.close()`（此一举同时点亮 `SseNotifyLifecycle:265` 既有钩子——LISTEN 池首次被真正收掉）；④ **关闭硬上限**：`API_SHUTDOWN_TIMEOUT_MS`（默认 10_000）deadline 计时器（**不 unref**），到点 `console.error('api_drain_timeout')` + `process.exit(0)`——内部上限 < 容器宽限（W4 钉 15s），正常路径永远是进程自退、SIGKILL 兜不到 |
| **W2 SSE 连接注册表 + 干净排空（R-18 SSE 面）** | `apps/api/src/platform/sse-pump.ts:53-97` | 泵内加进程级注册表：`pumpSseEvents` 入口注册 `streamKey→Set<reply.raw>`，`finally`（:95 收尾路径）注销（幂等，断开/终态/deadline 全路径覆盖，防泄漏）；导出 `drainSseConnections()`：对每条在册流**帧边界处**（写循环 :74 每轮检查新增 draining 旗，不在半帧中断）停止取数、`reply.raw.end()` **干净收口**——不发半截帧由两条既有性质保证：`emit`（:62-68）按完整帧字符串单次 `write`，收口只发生在帧间。客户端（SSE-RESILIENCE 已落）见干净 end **不计失败**、携 Last-Event-ID 即刻重连 → 由存活 api-b 从 `interview_event` 账本重放续推，事件零丢（既有账本语义，非本刀新建）。注册表计数经 `SseNotifyService.waitingCount()` 同款形制暴露（ops 断言「排空后在册=0」） |
| **W3 worker drain 上限 + 补漏 + SIGINT（R-19 主件）** | `apps/worker/src/main.ts:737` · `apps/worker/src/drain-loop.ts:62-68` | ① SIGTERM 链改**race 上限**：`WORKER_DRAIN_TIMEOUT_MS`（默认 30_000）deadline 与 `Promise.allSettled` 竞速，胜者先行——到点 `console.error('worker_drain_timeout in_flight=<loop 列表>')` + `process.exit(0)`，在飞 job 走租约过期→reaper 重领（§0 租约兜底，不双跑）；deadline 计时器不 unref；② **补漏**：allSettled 清单补 `vectorPlaneErasureLoop?.stop()`（:710/:737 对账）；③ 补 `SIGINT` 同链（复用同一 handler，本地 Ctrl+C 与容器 SIGTERM 同语义）；④ 排水不领新 job 由既有语义承担：`stop()` 置 `stopped=true`（drain-loop.ts:64）→ 当前 tick 跑完即不再起新 tick（:40/:52 while 条件）——**当前 job 完成或超限释放，两态皆可、由 deadline 裁决**；⑤ `metricsServer.close()` 补 await（诚实收口，非阻断） |
| **W4 compose stop_grace_period（R-19 compose 面）** | `docker/compose.prod.yml:236-339`（api :256 / worker :332 两个 `restart: unless-stopped` 块） | api/worker 两服务各钉 `stop_grace_period`：**worker 40s**（> 内部上限 30s + 续租心跳 30s 窗余量）、**api 15s**（> 内部上限 10s）——钉值原则：**内部上限 < 容器宽限**，进程自退恒先于 SIGKILL，`exit 0`（非 137）成为可断言事实。零改镜像零改 Dockerfile（Node PID1 现状保留，信号可达性由本刀 prove 实证）。`compose.ha-dual*.yml` 为 api-only 拓扑（本刀非范围，见 §2.5）；`Dockerfile.ha-dual`/根 `Dockerfile` 零触 |

## §2 非范围（全列 · 越界即废）

1. **R-17 单机单副本/LB/双 api 拓扑**——归 HA-1 线（LEDGER :128）。本刀只管「停机停得干净」，不管「停一台还有一台接客」的拓扑面（prove 的重连续推场景用既有 `compose.ha-dual` api-a/api-b 做隔离容器观测，不宣称生产 HA）。
2. **R-22 DB 断连/keepAlive/query_timeout**——后刀（LEDGER :130）。本刀不碰任何池参数（`createPool` 调用零改）。
3. **R-20/R-21/R-23/R-24/R-36/R-37/R-44/R-50/R-51 HA 配套簇**（连接预算/PgBouncer/多实例状态/队列指标等）——LEDGER :134 全列不在本刀。
4. **SSE 业务语义**：泵 10min deadline（sse-pump.ts:69）、ping/fallback 节奏、Last-Event-ID 重放语义、三控制器 404/429 前置——零改；web 侧三驱动三代理（#66 首包超时族）零触。
5. **`compose.ha-dual*.yml` 与 HA 镜像构建链**——api-only 拓扑文档性 compose（非生产），不加 stop_grace_period（避免给 Not-HA 叠加 HA 叙事；若协调方要求同钉属 REQUEST 漂移须补审）。
6. 顺带非范围：`docker/compose.prod.override.yml`、`Dockerfile` 根文件、init/tini 引入、Nest `app.shutdownHooks` 重构、journal/告警链（R-47）。

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `apps/api/src/platform/sse-registry.ts`（新增） | 进程级 SSE 连接注册表纯模块：`register(streamKey, raw)/unregister(...)/drainAll():number/count():number`——注册表与泵解耦可单测；drainAll 返回排空条数（记账+prove 断言） |
| C2 | `apps/api/src/platform/sse-pump.ts:53-97` | 入口/finally 接 C1 注册注销；while 条件增 `!draining`；新增可选注入参 `registry?`（默认 C1 进程单例；proof 注入独立实例——沿 `SsePumpOptions.notify?` :45 既有注入形制） |
| C3 | `apps/api/src/main.ts:123-129` | bootstrap 落 W1 全链：SIGTERM/SIGINT handler、draining 旗、onRequest 503 门（健康探针豁免）、`await app.close()`、`API_SHUTDOWN_TIMEOUT_MS` deadline 强退；`bootstrap()` 复用面（E2E 导入 `createApp` 者零感——旗/handler 只在直执行模块 :136 分支内挂） |
| C4 | `apps/api/src/modules/health/health.controller.ts` | `/readyz/api` 读 draining 旗翻 503（摘流量信号）；`/livez` 零改 |
| C5 | `apps/worker/src/main.ts:737` | W3 全件：deadline race、补 `vectorPlaneErasureLoop?.stop()`、SIGINT 同链、`metricsServer.close()` await、`worker_drain_timeout` 结构化日志 |
| C6 | `docker/compose.prod.yml`（api/worker 两块） | W4：`stop_grace_period: 40s`（worker）/`15s`（api）；零改其余字段 |
| C7 | `apps/api/test/`·`apps/worker/test/` 证明面 | 新增 prove 脚本（形制沿 `drain-loop.proof.ts`/`web-logic.proof.ts` 的注入式+section 断言）：API 关闭链 proof + worker drain-deadline proof + 泵注册表排空 proof；包脚本名 EXEC 定（`package.json` 免 `pnpm X:prove` 形制冲突，名字随仓惯例） |

## §4 prove 判据（验证矩阵 · EXEC 必须全过）

**A. 注入式确定性 proof（无 IO，沿 drain-loop.proof.ts 形制）**

1. **API 拒新+放旧**：注入 fake server/registry——draining 置位后 onRequest 门对普通路由断言 503 `service_unavailable_draining`、`/livez` 恒 200、`/readyz/api` 翻 503；在飞 fake 请求 handler 完成后才 close（时序断言：close 完成 ≥ handler resolve）。
2. **SSE 不发半截+干净收口**：注入泵 `registry` 独立实例 + drain 旗——drain 触发点必落帧间（末次 `write` 为完整帧尾 `\n\n` 断言）、`raw.end()` 恰一次、注册表 `count()===0`（泄漏断言：断开/终态/deadline 三路径全注销）。
3. **worker deadline race**：注入可挂死 tick——`stop()` 与 30s deadline 竞速：tick 2s 内自然完→stop 先 resolve（正常排水）；tick 挂死→deadline 到点触发强退回调且日志含在飞 loop 名（fake 计时器确定性读数，不真睡 30s）。
4. **SIGINT/SIGTERM 同链**：两信号触发同一 handler（handler 提取为可单测函数，注入触发断言等价）；`vectorPlaneErasureLoop.stop()` 在清单（清单逐项断言，防再漏）。

**B. 隔离容器时序 prove（可测矩阵 · EXEC 以 docker compose 单服务起停实录）**

5. **api 容器 SIGTERM**：起 api（隔离容器，placeholder DB 沿 ha-dual 形制）→ 打一条在飞普通请求 + 一条 SSE → `docker stop`（宽限 15s）→ 断言：在飞响应完整收到、SSE 末帧完整且 `raw.end()`（客户端 for-await 正常完成）、新连接 503、进程 `exit code 0`（非 137）、总耗时 < 15s。
6. **worker 容器 SIGTERM（短 job）**：注入短 tick job 在飞 → `docker stop`（宽限 40s）→ 断言：job markDone 落库后进程自退 `exit 0`、耗时 < 40s（SIGKILL 未发生）。
7. **worker 容器 SIGTERM（长 job 挂死）**：注入挂死 tick（>30s）→ 断言：≈30s 处 `worker_drain_timeout` 日志 + `exit 0`、租约 TTL 过期后 reaper/第二 worker 重领完成、**无孤儿无双跑**（事件 gate/CAS 既有断言面复绿）、重启后 sweep 零卡死残留。
8. **compose config 断言**：`docker compose -f docker/compose.prod.yml config` 输出含 api 15s / worker 40s 两字段（静态断言，防 compose 漂移）。
9. **既有零回归**：api/worker/web 各 prove 矩阵按仓内现状全量如实记账（跑/未跑列账）；红项逐条基线对账禁 skip-as-pass；全部收据（EXIT、PASS/FAIL、exit code、耗时读数）入 EXEC 记账 + receipts，Ban retry-to-green。

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 触碰 R-17 拓扑面**（LB/多实例宣称——`haStatus=NOT_HA` 铁律，本刀不翻转）· **Ban 触碰 R-22 DB 韧性面**（池参数零改）· Ban 碰 SSE 业务语义（deadline/ping/重放/控制器前置零改）· Ban 碰 web 三驱动三代理 · Ban 翻 pins · Ban 把「优雅停机」宣称为「HA」或「零丢请求」（排水期新请求 503 是**设计行为**，不是缺陷也不是 HA 证明）· Ban 无 deadline 的 await（本刀落点内新增长等待必须带上限）· Ban secrets/Key 入库 · Ban SSOT 无关触碰（LEDGER/backlog 只读引用，nail 时才改）· Ban `compose.ha-dual*.yml` 越界加字段（§2.5）。

## §6 pins（十一值照抄 · EXEC/审查不得改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ HA ≠ 冗余 ≠ LB（R-17 归 HA-1）≠ DB 韧性（R-22 后刀）≠ 零停机发布（排水期 503 是显式降级窗口）≠ 零事件丢失新保证（SSE 零丢靠**既有**账本重放+客户端韧性，本刀只保证服务端不发半截+干净 close）≠ 强制退出零代价（超限 job 走租约过期+reaper，有至多一个租约 TTL 的收敛延迟——这是 crash-safe 既有语义非本刀新发明）· 内部上限 < 容器宽限 ≠ SIGKILL 不可能（配置漂移/外部 kill -9 仍可发生，prove 只钉配置内路径）· prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码/compose、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。任何越 §2 非范围冲动（顺手修 R-17/R-22、加 LB、动 ha-dual compose）= 停手上报，不借机修。
