# HA-2 · 优雅停机双面（R-18 API 无优雅停机掐断 SSE + R-19 worker 停机等待无上限+无 stop_grace_period · HA 簇高优先 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha2-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工**）〖rev2 落卷：本文档现行状态行见文尾 `draft_rev2:pre_exec_dual`（append-only·本行原文零改）〗
**Date**: 2026-10-10
**审计项**: LEDGER HA 簇 R-18/R-19 P1（`ai-docs/delivery/harness/product-campaign-LEDGER.md:129`「API 无优雅停机掐断 SSE；worker 停机等待无上限+无 stop_grace_period」·HA 门映射「优雅停机双面」·优先「高」）·R-17 归 HA-1（:128）·R-22 DB 韧性后刀（:130）
**Base**: `feat/mysql-schema-skeleton` @`df12a054` · 分支 `line/ha-2-graceful`（新立工作树 `meetwise-ha2`：`git worktree add ../meetwise-ha2 -b line/ha-2-graceful df12a054` · 与 `meetwise-ha1`/`line/ha-1-redundancy` 同点分叉互不触碰）
**Honesty**: 蓝本与全部涉案码 file:line 起草席亲读（本章 §0 全录）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（纯停机路径+compose 字段，零 Key 零外呼零模型调用）。

---

## §0 立靶（蓝本+码面亲读 · file:line 全录）

蓝本锚 `product-campaign-LEDGER.md:129`（HA 簇表第 2 行）零漂。逐面亲读实证：

| 面 | 锚（亲读） | 现状（誊录+实证） |
|---|---|---|
| **R-18 API 关闭链** | `apps/api/src/main.ts:123-129`（bootstrap） | `await app.listen(port, host)` 后**函数即返回**——全文件 0 处 `enableShutdownHooks`/`process.on('SIGTERM'|'SIGINT')`/`app.close()`（rg 亲证零命中）。SIGTERM 落下 = Node 默认处置**立即终止**：在飞 HTTP 响应半截掐断、SSE 连接 TCP RST，客户端只见断流〖rev2-R3 勘误（PID1 形态）：本句在本仓容器形态下不准确——`docker/compose.prod.yml:269` Node 直跑 PID1（无 init/tini），无 handler 时内核对 PID namespace init 抑制信号默认处置（signal(7) 语义）→ 实况=SIGTERM 被忽略·进程静默存活+docker stop 10s 宽限到点 runtime 发 SIGKILL（exit 137）·非「立即终止」。B 组 prove 语境（容器 PID1）以实况为准〗 |
| **R-18 SSE 面** | `apps/api/src/platform/sse-pump.ts:53-97` | 泵单源化收口三控制器（interview:254 / quiz:51 / diagnosis:51 `@Get(':id/events')`）：:56 `reply.hijack()` 接管底层 socket（**Fastify close 不再跟踪 hijack 连接**）、:69 `deadline=+10min` 封顶、:71 `reqRaw.on('close')` 断开侦测、:96 干净 `raw.end()`。**进程级无任何在册 SSE 连接注册表**（rg `reply.raw` 写出面全在泵内）——停机时无从枚举、无从排空 |
| **R-18 既有兜底（不成立）** | `apps/api/src/platform/sse-notify.service.ts:262-268` | `SseNotifyLifecycle implements OnApplicationShutdown` 收 LISTEN 池——但 `onApplicationShutdown` **只在 `app.close()` 触发**，而 bootstrap 从不调 `app.close()`（无信号处理）→ 该钩子今天**死代码**，pool 随进程硬死 |
| **R-18 客户端接管（已落·可依赖）** | `line/sse-resilience` 已 nail（merge @8cea67fb · REQUEST `sse-resilience-REQUEST.md` §W3） | 客户端**干净 end 不计失败**、Last-Event-ID 重连语义在位（`apps/web/lib/stream/sse-cursor.ts:59-69` 合法游标头 + 三驱动消费）；服务端账本重放（`interview_event` seq>lastSeq）保证断连窗事件零丢 → **服务端停机只需「不发半截帧 + 干净 close」**，重连续推交给客户端既有韧性 |
| **R-19 worker 关闭链** | `apps/worker/src/main.ts:737` | SIGTERM 一行链：`await` 三 listener stop → `Promise.allSettled([…11 个 loop.stop()/池 close…])` → `metricsServer.close()` → `process.exit(0)`。**三缺**：① 无 drain 上限——`stop()` 等当前 tick 跑完（`drain-loop.ts:62-68` awaits 循环 promise），tick 内在飞 job（报告/面试图=分钟级模型调用）**挂多久等多久**，永不上限；② 无 `SIGINT` 处理（本地 Ctrl+C=默认即死）；③ **漏 `vectorPlaneErasureLoop.stop()`**（:710 建立 · :737 清点缺位）——该循环停机时无人等、池已 end 下 tick 必异常〖rev2-R3 勘误（清点实数）：「11 个 loop.stop()/池 close」误计——`main.ts:737` allSettled 逐项亲点实数 **15**（10 loop.stop：report/interview/quiz/diagnosis/route-classify/commerce/modelInvocationReconcile/usageCalibrationReconcile/privacyErasure/gauge + `ragCache.close()` + 3 pool.end：privacy/qbankControl/ragControl + `langfuse.shutdown()`）；W3 ② 补 `vectorPlaneErasureLoop.stop()` 后 **16**〗 |
| **R-19 compose 面** | `docker/compose.prod.yml:265-339`（worker 块）·rg 全仓 | 全仓 `docker/*.yml` **0 处 `stop_grace_period`/`stop_signal`**（rg 亲证）→ docker stop 默认 **10s 到点 SIGKILL**。worker「优雅排空」意图被容器先杀：SIGTERM→排水启动→10s 一到 SIGKILL→job 租约被弃→等 reaper。`restart: unless-stopped`（:332）·healthcheck readyz :9091（:335）·Node 直跑 PID1（`docker/compose.prod.yml:269` `command: node …`，无 init/tini） |
| **R-19 租约兜底（crash-safe 已它证）** | `apps/worker/src/job-heartbeat.ts:1-30`（TTL 120s·~30s 续租·`renew()=false` 即停不抢他人租约）·`packages/db/src/report/report.ts:8`（report `DEFAULT_LEASE_SECONDS=120`）·`packages/db/src/commerce/commerce.ts:32`（commerce 1800）·claim/fence（`interview-consumer.ts:180` tx1 claim-commit） | worker 进程消亡 → 心跳停 → 租约按 TTL 过期 → reaper/sweep 重领（`sweepStuckInterviewJobs`/`sweepReports`）。租约互斥保证**强制退出不会双跑同一 job**——这是本刀敢设「到期强制退出」的它证基础（行为已存在：今天 docker 10s SIGKILL 就在走这条路） |

**靶心一句话**：api 收到 SIGTERM 即暴毙（SSE 半截、HTTP 断流、`SseNotifyLifecycle` 永不触发）；worker 想优雅却两头堵——容器 10s 就 SIGKILL，而进程内 drain 又无上限可被单个挂死 tick 拖到永不出——三件事（SIGTERM 链上限、SSE 干净收口、compose 宽限钉值）共同缺失。

## §1 范围（双面四件 · EXEC 依此实现）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 API SIGTERM 排水链（R-18 主件）** | `apps/api/src/main.ts:123-129` | bootstrap 内落完整关闭链：① `process.on('SIGTERM'/'SIGINT')` → 置 `draining=true`（模块级单源旗）；② **拒新请求**：`onRequest` 最前钩子（public-preview 门之后、路由之前）读 draining 旗 → 非健康探针路由即刻 `503 service_unavailable_draining`（信封沿 `AllExceptionsFilter` 形制 + `connection: close`）；`/livez` 保持 200（进程还活着）、`/readyz/api` 翻 503（编排方摘流量的既有依据，compose healthcheck :259 即读它）——**摘流量靠 readyz 翻脸，拒客靠 503 门，两信号分工不得混**；③ **SSE 注册表+排空**（W2）完成后 `await app.close()`（此一举同时点亮 `SseNotifyLifecycle:265` 既有钩子——LISTEN 池首次被真正收掉）；④ **关闭硬上限**：`API_SHUTDOWN_TIMEOUT_MS`（默认 10_000）deadline 计时器（**不 unref**），到点 `console.error('api_drain_timeout')` + `process.exit(0)`——内部上限 < 容器宽限（W4 钉 15s），正常路径永远是进程自退、SIGKILL 兜不到〖rev2-R2（席1·EXEC 禁调 enableShutdownHooks）：本关闭链禁调 `app.enableShutdownHooks()`——Nest 自注册 SIGTERM 监听与自定义 handler 并存=同信号双路各触发 `app.close()`（亲证 @nestjs/core 11.1.27 `nest-application-context.js:126-132` close 链/:168-182 enableShutdownHooks→:197 listenToShutdownSignals）——自定义 handler 单路触发为唯一口径，见 §9-5〗 |
| **W2 SSE 连接注册表 + 干净排空（R-18 SSE 面）** | `apps/api/src/platform/sse-pump.ts:53-97` | 泵内加进程级注册表：`pumpSseEvents` 入口注册 `streamKey→Set<reply.raw>`，`finally`（:95 收尾路径）注销（幂等，断开/终态/deadline 全路径覆盖，防泄漏）；导出 `drainSseConnections()`：对每条在册流**帧边界处**（写循环 :74 每轮检查新增 draining 旗，不在半帧中断）停止取数、`reply.raw.end()` **干净收口**——不发半截帧由两条既有性质保证：`emit`（:62-68）按完整帧字符串单次 `write`，收口只发生在帧间。客户端（SSE-RESILIENCE 已落）见干净 end **不计失败**、携 Last-Event-ID 即刻重连 → 由存活 api-b 从 `interview_event` 账本重放续推，事件零丢（既有账本语义，非本刀新建）。注册表计数经 `SseNotifyService.waitingCount()` 同款形制暴露（ops 断言「排空后在册=0」）〖rev2-R1（席1·写后关封死·修法口径细化）：drain 置位**只同步置旗、不直接 end**——registry 条目持旗（泵注册置旗句柄），`safeWrite`（sse-pump.ts:59）与 while 条件（:74）同读同旗、写侧即刻失效；`reply.raw.end()` 保持泵内既有单点（:96），仅由泵自身在帧边界触发。否则 degraded 态（取数失败 break/断开竞态窗）drain 先 end 而泵续 write ⇒ ERR_STREAM_WRITE_AFTER_END（socket 未捕获 error 即进程非零退）——直接威胁 B5「exit 0」断言，见 §9-4〗 |
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
| C2 | `apps/api/src/platform/sse-pump.ts:53-97` | 入口/finally 接 C1 注册注销；while 条件增 `!draining`；新增可选注入参 `registry?`（默认 C1 进程单例；proof 注入独立实例——沿 `SsePumpOptions.notify?` :45 既有注入形制）〖rev2-R1→§9-4：drain 只置旗不 end·`raw.end()` 保持泵内单点〗 |
| C3 | `apps/api/src/main.ts:123-129` | bootstrap 落 W1 全链：SIGTERM/SIGINT handler、draining 旗、onRequest 503 门（健康探针豁免）、`await app.close()`、`API_SHUTDOWN_TIMEOUT_MS` deadline 强退；`bootstrap()` 复用面（E2E 导入 `createApp` 者零感——旗/handler 只在直执行模块 :136 分支内挂）〖rev2-R2→§9-5：禁调 `enableShutdownHooks()`（Nest 自注册 SIGTERM 与自定义 handler 双触发 `app.close()`）〗 |
| C4 | `apps/api/src/modules/health/health.controller.ts` | `/readyz/api` 读 draining 旗翻 503（摘流量信号）；`/livez` 零改〖rev2-③（席2）：`/health` 别名同钉——health.controller.ts:20 `@Get(['readyz/api','health'])` 同 handler（:9 注记：旧 `/health`=readiness 别名·已有编排器消费）→ draining 时 `/health` 与 `/readyz/api` 同翻 503（同 handler 天然同翻·此钉防 EXEC 只改 readyz 语义漏别名面）〗 |
| C5 | `apps/worker/src/main.ts:737` | W3 全件：deadline race、补 `vectorPlaneErasureLoop?.stop()`、SIGINT 同链、`metricsServer.close()` await、`worker_drain_timeout` 结构化日志 |
| C6 | `docker/compose.prod.yml`（api/worker 两块） | W4：`stop_grace_period: 40s`（worker）/`15s`（api）；零改其余字段〖rev2-③（可选钉·防漂移）：同两块显式 `stop_signal: SIGTERM`（docker 默认即 SIGTERM·显式化防 base image/runtime 漂移改默认）〗 |
| C7 | `apps/api/test/`·`apps/worker/test/` 证明面 | 新增 prove 脚本（形制沿 `drain-loop.proof.ts`/`web-logic.proof.ts` 的注入式+section 断言）：API 关闭链 proof + worker drain-deadline proof + 泵注册表排空 proof；包脚本名 EXEC 定（`package.json` 免 `pnpm X:prove` 形制冲突，名字随仓惯例）〖rev2-②→C8：B 组载体 compose 文件一并进清单（原 C1-C7 无它=漂移风险点·显式收编）〗 |
| C8（**追加·rev2-②·席2**） | `docker/compose.ha-2-proof.yml`（新增·名字 EXEC 可随仓惯例定） | B 组矩阵载体 compose：api/worker 两服务·带 `stop_grace_period`（api 15s/worker 40s·与 C6 同钉同值）+本地镜像形态（沿 `docker/Dockerfile.ha-dual`+`scripts/ha/build-backend-image.mjs` 本地构建形制·零生产 registry 依赖）+挂真 PG（载体改真 PG 见 §9-1）——EXEC 不得私造清单外载体文件 |

## §4 prove 判据（验证矩阵 · EXEC 必须全过）

**A. 注入式确定性 proof（无 IO，沿 drain-loop.proof.ts 形制）**

1. **API 拒新+放旧**：注入 fake server/registry——draining 置位后 onRequest 门对普通路由断言 503 `service_unavailable_draining`、`/livez` 恒 200、`/readyz/api` 翻 503；在飞 fake 请求 handler 完成后才 close（时序断言：close 完成 ≥ handler resolve）。
2. **SSE 不发半截+干净收口**：注入泵 `registry` 独立实例 + drain 旗——drain 触发点必落帧间（末次 `write` 为完整帧尾 `\n\n` 断言）、`raw.end()` 恰一次、注册表 `count()===0`（泄漏断言：断开/终态/deadline 三路径全注销）。〖rev2-R1 增补断言：drain 触发后 end 后 write 计数=0（写后关封死·degraded 态注入式可断·防 ERR_STREAM_WRITE_AFTER_END）〗
3. **worker deadline race**：注入可挂死 tick——`stop()` 与 30s deadline 竞速：tick 2s 内自然完→stop 先 resolve（正常排水）；tick 挂死→deadline 到点触发强退回调且日志含在飞 loop 名（fake 计时器确定性读数，不真睡 30s）。
4. **SIGINT/SIGTERM 同链**：两信号触发同一 handler（handler 提取为可单测函数，注入触发断言等价）；`vectorPlaneErasureLoop.stop()` 在清单（清单逐项断言，防再漏）。

**B. 隔离容器时序 prove（可测矩阵 · EXEC 以 docker compose 单服务起停实录）**

5. **api 容器 SIGTERM**：起 api（隔离容器，placeholder DB 沿 ha-dual 形制〖rev2-①（席2·硬项）：placeholder DB **废弃**——载体改真 PG，沿既有授权原语 `docker/compose.ha-dual.pg.yml:33-34`（`postgres:`/`image: pgvector/pgvector:pg16`）+`scripts/ha/prepare-nest-pg.mjs`（授权闸 `MEETWISE_HA_NEST_PG_AUTHORIZED=1`→迁移+`provisionRuntimeLogin meetwise_ha_runtime`·全文见 §9-1）。理由：placeholder=`127.0.0.1:1` 死端口→`/readyz/api` 读库恒 503、SSE 打开即失败（泵 `fetchMore` 走 `interview_event` 账本必触库）——与 B5 自身断言（在飞 SSE 末帧完整）物理矛盾〔席1 佐证：B5 容器形制可依托——api-a/api-b 实存（`docker/compose.ha-dual.yml:68/:81`·处方标签 :51/:76 为锚块环境变量行·服务定义实锚 :68/:81 行号漂移·本落卷席 grep 亲证改正）·唯 DB 必须真〕〗）→ 打一条在飞普通请求 + 一条 SSE → `docker stop`（宽限 15s）→ 断言：在飞响应完整收到、SSE 末帧完整且 `raw.end()`（客户端 for-await 正常完成）、新连接 503、进程 `exit code 0`（非 137）、总耗时 < 15s。
6. **worker 容器 SIGTERM（短 job）**：注入短 tick job 在飞〖rev2-R4（席1）：「注入 tick」=**env-gated stub**（环境变量名 EXEC 定·仓内命名惯例）·stub 路径绝不触发真实模型调用——守 est live=0 与 §6 pins 脚注 `actualSpendCny=null`〔rev2-①：载体同 §9-1 改真 PG（markDone 落库断言非真库不可断）〕〗 → `docker stop`（宽限 40s）→ 断言：job markDone 落库后进程自退 `exit 0`、耗时 < 40s（SIGKILL 未发生）。
7. **worker 容器 SIGTERM（长 job 挂死）**：注入挂死 tick（>30s〖rev2-R4：挂死=sleep 挂起 stub·非模型重试·env-gated 同 B6〗）→ 断言：≈30s 处 `worker_drain_timeout` 日志 + `exit 0`、租约 TTL 过期后 reaper/第二 worker 重领完成、**无孤儿无双跑**（事件 gate/CAS 既有断言面复绿）、重启后 sweep 零卡死残留〖rev2-R4（席1·时长记账如实）：本件预期总时长 **~150-180s**（30s drain 上限 + 租约 TTL ≤120s〔`DEFAULT_LEASE_SECONDS=120`·report.ts:8〕+ sweep 下一拍 ≤5s〔`WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5_000·`apps/worker/src/main.ts:487` 亲证〕）——设计内收敛窗·EXEC 记账不得以「超时异常」粉饰〔rev2-①：reaper/sweep 重领断言（租约/事件账本皆在 PG）同理需真库·载体 §9-1〕〗。
8. **compose config 断言**：`docker compose -f docker/compose.prod.yml config` 输出含 api 15s / worker 40s 两字段（静态断言，防 compose 漂移）。〖rev2-③（席2）：断言前须 stub 全部 `:?` 必填变量——compose 遇 `${VAR:?…}` 缺值即报 error、「绿」无意义；实数 **85** 个不同变量/137 处引用（本落卷席 perl 逐字亲证 `docker/compose.prod.yml`·仓内无 `.env`【gitignore 未物化】〔勘误：处方「约 50」为低估·以实物为准〕）〗
9. **既有零回归**：api/worker/web 各 prove 矩阵按仓内现状全量如实记账（跑/未跑列账）；红项逐条基线对账禁 skip-as-pass；全部收据（EXIT、PASS/FAIL、exit code、耗时读数）入 EXEC 记账 + receipts，Ban retry-to-green。

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 触碰 R-17 拓扑面**（LB/多实例宣称——`haStatus=NOT_HA` 铁律，本刀不翻转）· **Ban 触碰 R-22 DB 韧性面**（池参数零改）· Ban 碰 SSE 业务语义（deadline/ping/重放/控制器前置零改）· Ban 碰 web 三驱动三代理 · Ban 翻 pins · Ban 把「优雅停机」宣称为「HA」或「零丢请求」（排水期新请求 503 是**设计行为**，不是缺陷也不是 HA 证明）· Ban 无 deadline 的 await（本刀落点内新增长等待必须带上限）· Ban secrets/Key 入库 · Ban SSOT 无关触碰（LEDGER/backlog 只读引用，nail 时才改）· Ban `compose.ha-dual*.yml` 越界加字段（§2.5）。

## §6 pins（十一值照抄 · EXEC/审查不得改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ HA ≠ 冗余 ≠ LB（R-17 归 HA-1）≠ DB 韧性（R-22 后刀）≠ 零停机发布（排水期 503 是显式降级窗口）≠ 零事件丢失新保证（SSE 零丢靠**既有**账本重放+客户端韧性，本刀只保证服务端不发半截+干净 close）≠ 强制退出零代价（超限 job 走租约过期+reaper，有至多一个租约 TTL 的收敛延迟——这是 crash-safe 既有语义非本刀新发明）· 内部上限 < 容器宽限 ≠ SIGKILL 不可能（配置漂移/外部 kill -9 仍可发生，prove 只钉配置内路径）· prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码/compose、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。任何越 §2 非范围冲动（顺手修 R-17/R-22、加 LB、动 ha-dual compose）= 停手上报，不借机修。

## §9 rev2 双席处方落卷（HA-2 rev2 · append-only · 落卷席 `ha2-rev2` · docs-only 零码动）

**双席裁决**：pre-exec 双审 **席1 PASS**（EXEC 执行加固 R1-R4）+ **席2 FAIL 窄面**（B 组矩阵载体修正硬项 ①②③）——合并落卷=本节+正文 〖rev2-*〗 注记（原文零改·append-only·改正处附勘误注记）。席2 转 PASS 条件（①载体真 PG+②proof compose 收编 C8）已随卷落；R1 为 W2 修法口径细化（EXEC 必须依细化口径实现·非可选项）。本席落卷时全部新增锚点实物亲证（grep/sed/perl 实测·base 同 `f051e624` 树）。

- **§9-1（①·席2·硬项·B5/B6/B7 载体改真 PG）**：B 组三件载体一律真 PG，废弃 placeholder DB。既有授权原语照用：`docker/compose.ha-dual.pg.yml:33-34`（`postgres:` 服务 / `image: pgvector/pgvector:pg16`）+ `scripts/ha/prepare-nest-pg.mjs`（授权闸 `MEETWISE_HA_NEST_PG_AUTHORIZED=1` → 起 postgres → 迁移〔migrator=POSTGRES_USER〕→ `provisionRuntimeLogin meetwise_ha_runtime` → 证据落 `.tmp/ha-evidence/nest-pg-prepare.json`；本刀 proof compose（C8）api/worker 容器经 host-published 54339 挂该库·沿 pg overlay `DATABASE_URL=meetwise_ha_runtime@host.docker.internal:54339` 形制）。废弃理由：placeholder=`127.0.0.1:1` 死端口（`compose.ha-dual.yml` 环境亲证）→ `/readyz/api` 读库恒 503、SSE 打开即失败（泵 `fetchMore` 走 `interview_event` 账本必触库）——与 B5 自身断言（在飞 SSE 末帧完整）物理矛盾；B6 `markDone` 落库、B7 reaper/sweep 重领断言（租约/事件账本皆在 PG）同理非真库不可断。**席1 佐证**：B5 容器形制可依托——api-a/api-b 实存（`docker/compose.ha-dual.yml:68/:81`〖勘误：处方标签 :51/:76 为锚块环境变量行·服务定义实锚 :68/:81·本落卷席 grep 亲证改正〗）·唯 DB 必须真。§2.5 Ban 零触（不动 `compose.ha-dual*.yml` 既有文件·载体=C8 新 proof compose）。
- **§9-2（②·席2·硬项·B 组载体 compose 进改动清单）**：新增 proof compose 文件（建议名 `docker/compose.ha-2-proof.yml`·EXEC 可随仓惯例定名）**入 §3 清单为 C8**：api/worker 两服务、带 `stop_grace_period`（api 15s/worker 40s·与 C6 同钉同值）、本地镜像形态（沿 `docker/Dockerfile.ha-dual`+`scripts/ha/build-backend-image.mjs` 本地构建形制·零生产 registry 依赖）、挂 §9-1 真 PG。原 C1-C7 无它 ⇒ B 组五项 prove 无载体=漂移风险点·显式收编（EXEC 不得私造清单外载体文件）。
- **§9-3（③·席2·小口径三钉）**：① **C4 钉 `/health` 别名**：`health.controller.ts:20` `@Get(['readyz/api', 'health'])` 同 handler（`:9` 注记：旧 `/health`=readiness 别名·已有编排器消费）→ draining 时 `/health` 与 `/readyz/api` 同翻 503（同 handler 天然同翻·此钉防 EXEC 只改 readyz 语义漏别名面）；② **B8 注明 stub 变量**：`docker compose -f docker/compose.prod.yml config` 遇 `${VAR:?…}` 缺值即报 error、「绿」无意义——须 stub 全部必填变量后方为有效断言（实数 **85** 个不同变量/137 处引用·本席 perl 逐字亲证；仓内无 `.env`【gitignore 未物化】〖勘误：处方「约 50」低估·以实物为准〗）；③ **（可选钉）** C6 两服务块显式 `stop_signal: SIGTERM`（docker 默认即 SIGTERM·显式化防 base/runtime 漂移改默认）。
- **§9-4（R1·席1·SSE 写后关封死·W2 口径细化）**：见正文 W2 〖rev2-R1〗 注记全文——drain 置旗不 end、registry 条目持旗、`safeWrite`/while 同读、`end()` 泵内单点（`sse-pump.ts:96`）。威胁面亲证：现泵 tail `if (!closed) end()`（:96）不识 drain 旗，W2 原文「drainSseConnections() …`reply.raw.end()` 干净收口」若照字面实现=drain 侧直接 end ⇒ 与泵写循环（:74/:59）竞态出 ERR_STREAM_WRITE_AFTER_END·威胁 B5 exit 0 断言。EXEC 按 R1 口径实现；prove 判据 A.2 增补「end 后 write 计数=0」断言（已随卷落 §4）。
- **§9-5（R2·席1·EXEC 禁调 enableShutdownHooks）**：见正文 W1 〖rev2-R2〗 注记——亲证 @nestjs/core 11.1.27（`apps/api/package.json:81` `^11.1.27`·pnpm 实装 11.1.27）`nest-application-context.js:126-132`（`close(signal)`：destroy→beforeShutdown→dispose→shutdown→unsubscribe）/`:168-182`（`enableShutdownHooks`→`listenToShutdownSignals` :197 进程信号自注册）——双路并存=同信号双触发 `app.close()`。C3 实现口径：只自定义 handler 单路。
- **§9-6（R3·席1·§0 两处勘误）**：① 「SIGTERM 落下=默认处置立即终止」在 PID1 形态下不准确（见 §0 R-18 〖rev2-R3〗：无 handler 时内核抑制默认处置→实况忽略+10s SIGKILL）——B 组 prove 语境（容器 PID1）以实况为准；② 「清点 11 个」实数 15、补漏后 16（见 §0 R-19 〖rev2-R3〗·本席 `main.ts:737` 逐项亲点）。append-only·原文零改。
- **§9-7（R4·席1·B6/B7 注入 stub+时长记账）**：① B6/B7「注入 tick」=**env-gated stub**（环境变量名 EXEC 定·仓内命名惯例），stub 路径**绝不触发真实模型调用**——守 est live=0 与 §6 pins 脚注 `actualSpendCny=null`；短/挂死两态均 stub 语义（挂死=sleep 挂起非模型重试）；② B7 预期时长 **~150-180s** EXEC 记账如实：30s drain 上限（W3 ①默认）+ 租约 TTL ≤120s（`DEFAULT_LEASE_SECONDS=120`·`report.ts:8`）+ sweep 下一拍 ≤5s（`WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5_000·`apps/worker/src/main.ts:487` 亲证）——设计内收敛窗·记账不得以「超时异常」粉饰。

---

*`draft_rev2:pre_exec_dual`（席1 PASS+席2 FAIL 窄面处方 7 条落卷·待复审确认后协调方行使 EXEC 授权）*
