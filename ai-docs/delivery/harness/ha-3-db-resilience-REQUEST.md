# HA-3 · DB 断连韧性（R-22 · HA 簇高优先 · EXEC REQUEST 起草 · docs-only 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha3-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工** · alone≠dual）
**Date**: 2026-10-10
**审计项**: LEDGER HA 簇 R-22 P1（`ai-docs/delivery/harness/product-campaign-LEDGER.md:130`「DB 断连/切换未设计（无 keepAlive/query_timeout）」·HA 门映射「DB 韧性」·优先「高」）·R-17 已解（HA-1 nail @9f6edf8f）·R-18/19 已解（HA-2 merge @ed0505a6）·R-26 备份另刀（:131）·R-20/21 配套后刀（:134）
**Base**: `feat/mysql-schema-skeleton` @`9f6edf8f`（主线 tip 本席 `git log -1` 亲证=HA-1 nail 落卷提交）· 分支 `line/ha-3-db-resilience`（新立工作树 `meetwise-ha3`：`git -C ../meetwise worktree add ../meetwise-ha3 -b line/ha-3-db-resilience 9f6edf8f` · 与 ha-1/ha-2 分叉点后继·互不触碰）
**Honesty**: 蓝本与全部涉案码 file:line 起草席亲读（本章 §0 全录，含 **@`9f6edf8f` 实树对 LEDGER R-22 一句话的勘正**）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（沙箱 PG+注入式 proof，零生产操作·零真实流量·零模型外呼）。

---

## §0 立靶（蓝本勘正+码面亲读 · file:line 全录）

### 0.1 蓝本勘正（R-22 一句话在 @`9f6edf8f` 实树已部分失准·诚实优先于蓝本字面）

LEDGER:130 写「无 keepAlive/query_timeout」。亲读实树：**四项池超时参数与池 error 双面监听已落**（§0.2 逐行实证）——R-22 的**剩余真缺口**为五件：① TCP keepalive 未配（pg 驱动默认关）；② driver 级 `query_timeout` 未配（且 `health.service.ts:18` 注释**声称已配**=注释与码面漂移）；③ 池错误计数 purpose 维度全仓零消费+零出口；④ migrate 单发零断连重试；⑤ 断连注入/池自愈/降级路径**零实证**。本刀=剩余收口+验证矩阵落卷；蓝本已落面只登记零改。

### 0.2 现状盘点（亲读 @`9f6edf8f` · 全锚实测）

| 面 | 锚（亲读） | 现状（誊录+实证） |
|---|---|---|
| **池参数·已落** | `packages/db/src/principal.ts:909-919`（`createPool`） | `max`（`PGPOOL_MAX` 默认 20）:914 · **`statement_timeout`**（`PG_STATEMENT_TIMEOUT_MS` 默认 15000）:915 · **`idle_in_transaction_session_timeout`**（`PG_IDLE_TX_TIMEOUT_MS` 默认 15000）:916 · **`connectionTimeoutMillis`**（`PG_CONN_TIMEOUT_MS` 默认 5000）:917 · **`idleTimeoutMillis`**（`PG_IDLE_TIMEOUT_MS` 默认 30000）:918 ——四参齐且 env 可调；**零改只登记** |
| **keepAlive·缺** | `principal.ts:909-919`（无此键）+ pg@8.22.0 `node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/client.js:95-96`（`keepAlive: c.keepAlive || false`·`keepAliveInitialDelayMillis: … \|\| 0`） | **TCP keepalive 关**（仓内全仓 `keepAlive` 零配置，rg 亲证仅一处无关测试变量）→ 云 LB/防火墙/NAT 静默掐空闲连接后，池内 idle client 持半开死 socket 直到取用才炸——LEDGER R-22 命名缺口①实锤 |
| **query_timeout·缺** | `principal.ts:909-919`（无此键）+ pg@8.22.0 `client.js:660`（`config.query_timeout \|\| this.connectionParameters.query_timeout` 均空=driver 级查询定时器未挂） | **driver 级超时未设**（server 级 `statement_timeout` 已有=两超时语义不同层，§1-W1）；**注释漂移实锤**：`apps/api/src/modules/health/health.service.ts:18`「连接池已有 `PG_CONN_TIMEOUT_MS`、`PG_STATEMENT_TIMEOUT_MS` 与 `query_timeout` 的有界配置」——`query_timeout` 三字今日不实（亲证仅此一处声明、零一处配置），本刀落码后注释方为真 |
| **池 error 监听·已落（candidate B）** | `principal.ts:861-903`（`GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`·WeakSet 去重 :869-891·`observePoolError` :886-903）+ `:928-931`（`pool.on('connect')` 逐 client 挂 listener 补 checked-out 盲区 + `pool.on('error')` 兜 idle 再发路径） | **不崩进程已落**（C'' FI-1 crash 路径封死·先例卷 `ai-docs/delivery/gap-principal-pool-error-listener-fix.slice.md`+`receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md`）；结构化日志 `db_pool_error`（:896 JSON 行）。**边界原文**（:872-884）：observability-only——「never reconnects, rebuilds the pool, retries, or flips any health/degraded flag」（candidate C 被双审否决的裁定在卷）——**本刀 Ban 翻此边界**（§5） |
| **purpose 维度·零消费** | 标签闸 `POOL_PURPOSE=/^[a-z0-9_-]{1,64}$/` `principal.ts:845`（:907 拒非法）·计数 `poolErrorTotal` Map :854 + 只读导出 `readPoolErrorTotal` :857-858 | 生产 `createPool` 调用点 **9 处全部零传 `purpose`**（逐一亲证）：`apps/api/src/platform/db.service.ts:7` · `apps/api/src/platform/sse-notify.service.ts:151` · `apps/worker/src/main.ts:133`（LangGraph PostgresSaver 池）/:427/:498/:658 · `apps/worker/src/privacy-worker-runtime.ts:31` · `apps/worker/src/rag-control-runtime.ts:35` · `packages/db/src/migrate-cli.ts:6`（:42/:62 临时池同缺）→ 计数维度塌缩 `'default'`，断连归因不可分 |
| **计数出口·零接线** | `readPoolErrorTotal` :857-858 导出；worker `/metrics` 文本端点 `apps/worker/src/main.ts:237-245`（`startMetricsExposition`·:9091·text/plain 0.0.4 形制）；api 面无 metrics 端点（rg 亲证） | 计数器只在进程内可读（测试/运维需入进程），**零任何 scrape 面**——断连频度对 ops 不可见（R-47 告警的前置盲点，但告警闭环本身归 R-47 不归本刀） |
| **请求面断连行为** | 在飞 query 被 pg 自身 reject（`principal.ts:863-868` 注释原文：「`Client._handleErrorEvent` always `emit('error')` on the client after rejecting the in-flight queries」）→ `apps/api/src/platform/all-exceptions.filter.ts:39` mask 500 `internal_error`；断连窗新请求 `pool.connect()` 走 `connectionTimeoutMillis` 5s 后拒；`/readyz/api`=`SELECT 1` catch→false→503（`health.service.ts:21-28`+`health.controller.ts` readiness 别名 `/health` 同 handler） | 应用不挂死不假死；**但零断连注入实证**（今天的行为全是推断+单测级，无容器实录） |
| **SSE LISTEN 面（自愈已在位·零改）** | `apps/api/src/platform/sse-notify.service.ts:143-158`（ensureStarted 失败→`degrade('listen_down')`+`scheduleReconnect`）·:160-173（指数退避+jitter·cap `reconnectMaxMs`）·:190-199（client error/end→`loseClient`→degrade→重连）·:201-214（`SSE_NOTIFY_DEGRADED reason=… fallback=legacy_2s_poll` 结构化降级日志 :208） | **沿 SSE-RESILIENCE 已落降级语义**：LISTEN 断连→降级 2s 兜底轮询+退避重连自愈，行为在码——缺断连注入实录 |
| **SSE 泵断连路径（零改）** | `apps/api/src/platform/sse-pump.ts:105-106`（`fetchMore(...).catch(() => null)` → `null` 即 break 收尾）+ 泵尾 `raw.end()` 单点（HA-2 R1 落卷锚）| DB 断连窗泵取数失败=干净收口交客户端重连（干净 end 不计失败、凭 Last-Event-ID 重连——SSE-RESILIENCE 契约），**零改入验证矩阵** |
| **worker 长连接面（自愈已在位·零改）** | `apps/worker/src/job-wakeup-listener.ts:73-90`（退避重连调度+disconnect 处理）·:92-122（establish+LISTEN+失败计数）·:126（`ready()`=`connected \|\| consecutiveFailures<3`）+ `apps/worker/src/drain-loop.ts:47-51`（tick 抛不停循环：`consecutiveFailures++`+日志+下一拍重试）·:70-74（`ready()` 3 连败或 stale 翻脸） | worker 两条 DB 面（wakeup LISTEN+drain tick）均既有容忍自愈语义——缺注入实录 |
| **migrate·断连零重试** | `packages/db/src/migrate-cli.ts:6-10`（单发 `createPool`→`runMigrations`）·:81-84（`main().catch`→`console.error`→`process.exit(1)`）·`packages/db/src/migrate.ts:211`（`pg_advisory_lock` 串行化）·`docker/compose.prod.yml:223-233`（migrate 一次性 job·`restart: "no"` :232）+:247-248（api `depends_on: service_completed_successfully`） | PG 瞬断窗内部署=migrate exit 1=**api/worker 整批不起**，需人工重跑 compose；无连接级退避（部署窗 DB 抖动=整窗失败）。advisory lock+「只跑待应用·各自事务·幂等重跑」铁律（migrate.ts:2-5）=重试只敢做**连接获取层**、不敢做 DDL 层（§1-W3 口径依据） |
| **沙箱/载体先例** | `docker/compose.ha.sandbox.yml:22-31`（pgvector/pgvector:pg16 材质·tmpfs 隔离）·`docker/compose.ha-dual.pg.yml:33-34`（postgres 服务）+`scripts/ha/prepare-nest-pg.mjs:8/:45`（授权闸 `MEETWISE_HA_NEST_PG_AUTHORIZED=1`→迁移+runtime 登录）·`docker/compose.ha-2-proof.yml:7-18/:64/:83`（ha-2 真 PG proof 载体·`restart: "no"`·host-published 54339） | 断连注入载体有现成授权原语与材质，**零生产库依赖**；授权闸系沿 ha-1/ha-2 先例 |

### 0.3 靶心一句话

四项池超时+池 error 不崩进程+SSE/worker 双 LISTEN 自愈均已在前刀落主线，但 **R-22 命名的 keepAlive/query_timeout 两参数至今缺席、断连归因维度（purpose）全仓零消费零出口、migrate 连接层零重试、且「断连注入→在飞行为→池自愈→降级续推」全链零容器实录**——本刀=五件剩余收口+验证矩阵落卷，Ban 把已落面重做一遍冒功。

### 0.4 授权链

1. LEDGER:125-136 HA 簇表=北星门 2 专属工作面；:130 R-22 P1「DB 韧性」映射本刀；:136「在 P0 四断链+批1 收口后启动」——HA-1（R-17 @9f6edf8f nail）与 HA-2（R-18/19 merge @ed0505a6·nail 卷同主线）已按序落卷，批1 收口状态由**协调方开工时点亲证**（§8 开工条款①）。
2. north-star-ha.md:67「默认 / stub / 本地 compose 一律 `haStatus: NOT_HA`」=本刀起点钉；R-22 收口属 B3「HA 簇配套收口」项（ha-1 REQUEST §2.3-B3 引 LEDGER:129-133）——**本刀收口≠haStatus 翻转**（§7 Non-claims）。
3. 池 error 面 candidate B 裁定在卷（`gap-principal-pool-error-listener-fix.slice.md`：「candidate C reconstruction/degrade linkage rejected by both pre-exec reviewers」·`principal.ts:872-884` 边界原文）——本刀在该裁定之上做剩余面，Ban 借刀翻案。

---

## §1 范围（四件 · EXEC 依此实现 · W4 为零改验证件）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 池参数补齐（R-22 命名缺口本体）** | `packages/db/src/principal.ts:909-919` | `new Pool({...})` 内补两键：① **`keepAlive: true`** 直钉（起草席推荐=断连韧性本体非调优项、关=历史行为倒退无收益；EXEC 双审若裁 env 化〔形如 `PG_KEEPALIVE`〕须落卷理由）+ **`keepAliveInitialDelayMillis`**：`Number(process.env.PG_KEEPALIVE_INITIAL_DELAY_MS ?? 10000)`（OS 层后续探测间隔不可达面=内核 `tcp_keepalive_*`，照实注记非本刀可调）；② **`query_timeout`**：`Number(process.env.PG_QUERY_TIMEOUT_MS ?? 15000)`（与 `statement_timeout` :915 同默认对齐；语义注记入码：driver 级=客户端 socket 定时器〔pg `client.js:660` 路径〕，server 级 `statement_timeout`=服务端 GUC，双层并存各兜其面）。已落四参（:914-918）零改。**同步修正 `health.service.ts:18` 注释漂移**（落码后该注释方为真——若 EXEC 裁不改注释则须落卷说明为何保留失准注释，起草席推荐：W1 落地后注释自动转真，`health.service.ts` 本刀零字改） |
| **W2 purpose 标签补全 + 计数出表（断连归因可观测）** | §0.2 九调用点 + `apps/worker/src/main.ts:242-245` | ① 九处生产 `createPool` 调用点补 `purpose`（标签全过 `POOL_PURPOSE` :845 正则）：`db.service.ts:7`→`'api'` · `sse-notify.service.ts:151`→`'sse-listen'` · `worker/main.ts:133`→`'checkpoint'` · `:427`→`'worker'` · `:498`→`'qbank-control'` · `:658`→`'job-wakeup'` · `privacy-worker-runtime.ts:31`→`'privacy-worker'` · `rag-control-runtime.ts:35`→`'rag-control'` · `migrate-cli.ts:6`（:42/:62 临时池与 `apps/worker/src/cost-configure.ts:12` 同 job 链）→`'migrate'`/`'qbank-control'`/`'rag-control'`（`apps/worker/smoke/*` 非生产运行时零改）；② worker `/metrics` 文本块（main.ts:242-245）新增 `meetwise_db_pool_errors_total{purpose="<label>"} <readPoolErrorTotal(label)>` 行（逐已注册 purpose 输出·0 序列也预注册·沿 :428 注释「预注册基线序列」既有形制）；③ **api 面零新增 metrics 端点**（结构化日志 `db_pool_error` :896 已够；Ban 为 api 新开 scrape 面=scope discipline，双审可裁反转但须落卷）；④ 语义注记照抄 `principal.ts:850-853` 原文：「an observability gauge, not a health signal: a rising count records faults, it does not describe recovery」——`/readyz` 零改（candidate B 边界·§5） |
| **W3 migrate 连接层退避重试（部署窗抖动韧性）** | `packages/db/src/migrate-cli.ts:6-10`（+`:42`/:62 两临时池与 `cost-configure.ts:12` 同形） | 新增**连接获取级**小函数（可单测·注入式 clock/connect 缝）：首次 `pool.query`（连接获取+advisory lock 前）遇**连接级失败**（`ECONNREFUSED`/`ETIMEDOUT`/`ECONNRESET`/PG `57P01`/`53300` 类·错误分类函数 EXEC 落码并对表 prove）→ 指数退避重试（`MIGRATE_CONNECT_RETRY_BASE_MS` 默认 1000 · cap 15000 · 总窗 `MIGRATE_CONNECT_BUDGET_MS` 默认 30000）→ 超窗 `exit(1)` fail-loud（维持 :81-84 一次性 job 语义）。**硬边界**：① 重试只覆盖「连不上」——`runMigrations` 内部（`migrate.ts:208-302`·advisory lock :211/事务/checksum）**零碰零重试**，DDL 失败=立即 exit 1；② `compose.prod.yml:223-233` 治理面（`restart: "no"` :232）零改——进程内重试吸收秒级抖动，跨重启恢复交 `service_completed_successfully` 门（:247-248）+部署编排既有语义；③ 幂等铁律（migrate.ts:5「重跑=已应用跳过」）是本刀敢做连接层重试的它证基础，零依赖新增 |
| **W4 SSE/长连接 DB 断连降级路径（零改·验证件）** | §0.2 SSE LISTEN/泵/worker 三行锚 | **零码改**。本刀以 B 组断连注入实录实证既有降级语义（SSE-RESILIENCE 已落）：LISTEN 断→`SSE_NOTIFY_DEGRADED`→2s 兜底轮询续推→重连回 healthy；泵取数失败（:105-106）→干净 end→客户端 Last-Event-ID 重连重放；worker wakeup 断→退避重连+tick 容忍。Ban 借「顺手加固」动这三面任何一行 |

## §2 非范围（全列 · 越界即废）

1. **R-20/R-21/R-23 等 HA 配套簇**（连接预算/PgBouncer/RDS·云托管切换/多实例状态/队列指标）——LEDGER :134 全列不在本刀；「切换」面（主备 failover 编排）归 R-20/21 后刀。
2. **R-26 备份/PITR**（LEDGER :131）——另刀。
3. **`observePoolError` 恢复化**（重连/重建池/翻 health 旗=candidate C）——前刀双审已否决（§0.4-3），本刀 Ban 翻案；池自愈语义=pg-pool 原生移除坏连接+按需新建，本刀只**实证**不**改造**。
4. **SSE 业务语义零改**：泵 10min deadline、ping/fallback 节奏、Last-Event-ID 重放语义、三控制器前置、`sse-notify`/`job-wakeup-listener`/`drain-loop` 三面全部零改（W4=纯验证）。
5. **compose.prod.yml 治理契约零改**（migrate `restart: "no"` :232、api/worker 既有块）；本刀载体=新增独立 proof compose（C6），Ban 原地改任何既有 compose（`compose.prod*.yml`/`compose.ha*.yml`/`compose.ha-dual*.yml` 全列）。
6. **R-47 告警常驻闭环**：`meetwise_db_pool_errors_total` 出表是数据面非告警面——Prometheus 抓取/告警规则/常驻化全归 R-47。
7. **OS 层 TCP keepalive 内核参数**（`net.ipv4.tcp_keepalive_time` 等）：容器 sysctl 面不在本刀（`keepAliveInitialDelayMillis` 只控首探，如实注记）。
8. **生产宿主/生产库任何操作**：验证面全在本地沙箱（隔离容器 PG），**est live=0**。
9. 顺带非范围：`RESOURCE-HYGIENE.md` 簿记（本刀 nail 后工作树照制度删·归协调方）、`gap-bug-backlog.md` 行状态（SSOT 只读引用，nail 时才改）。

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `packages/db/src/principal.ts:909-919` | Pool 构造四参（:914-918）零改 → 增 `keepAlive: true` + `keepAliveInitialDelayMillis`（`PG_KEEPALIVE_INITIAL_DELAY_MS` 默认 10000）+ `query_timeout`（`PG_QUERY_TIMEOUT_MS` 默认 15000）；双层超时语义注记入码（W1 ②） |
| C2 | §1-W2 九调用点（逐一列锚） | 零 `purpose` → 按 W2 标签表补传（全过 :845 正则）；smoke/* 零改 |
| C3 | `apps/worker/src/main.ts:242-245` | `/metrics` 文本块无池错误行 → 增 `meetwise_db_pool_errors_total{purpose}` 逐标签行（`readPoolErrorTotal` :857 消费·0 预注册·照 :428 基线形制）；api 零新端点 |
| C4 | `packages/db/src/migrate-cli.ts:6-10`（+:42/:62·`cost-configure.ts:12` 同形） | 单发零重试 → W3 连接层退避小函数（注入 clock/connect 缝·连接级错误分类·超窗 exit 1）；`runMigrations`/advisory lock 零碰 |
| C5 | `packages/db/test/` + `apps/worker/test/` 证明面 | 新增 prove（形制沿仓内注入式 proof 惯例·包脚本名 EXEC 随仓惯例定）：A1-A4 断言面（§4-A）+ C4 重试分类单测 |
| C6 | `docker/compose.ha-3-proof.yml`（新增·名字 EXEC 可随仓惯例定） | B 组矩阵载体：沙箱 PG（沿 `compose.ha.sandbox.yml:22-31` pgvector 材质 tmpfs 形制或 `compose.ha-dual.pg.yml:33-34`+`prepare-nest-pg.mjs` 授权闸原语·二择一 EXEC 裁并落卷）+ api/worker 容器（本地镜像形态沿 `compose.ha-2-proof.yml:7-18` 先例·`restart: "no"`）——**EXEC 不得私造清单外载体文件** |

## §4 prove 判据（验证矩阵 · EXEC 必须全过 · 全沙箱 est live=0 · CMD+EXIT 收据 · Ban retry-to-green）

**A. 注入式确定性 proof（无真 IO·沿仓 proof 形制）**

1. **A1 池参数生效**：注入式断言 `createPool()` 产物——client 连接参数含 `keepAlive===true`+`keepAliveInitialDelayMillis===10000`+`query_timeout===15000`（pg@8.22.0 生效路径 `client.js:95-96/:660` 源码锚随卷）；env 覆写路径同断言。
2. **A2 purpose 闸与标签表**：非法标签拒（`database_pool_purpose_invalid`·:907 既有）；九调用点逐点断言传入标签=W2 表值（防漏点——九点清单断言，点数不符即 FAIL）。
3. **A3 migrate 重试分类**：注入 fake connect/clock——连接级错误→退避 N 次→成功完成（预算内）；DDL/事务失败→**零重试**立即 exit 1；连接级超窗→exit 1；`runMigrations` 内部抛错不进重试路径（边界断言）。
4. **A4 metrics 文本**：注入 `readPoolErrorTotal` 读数→`/metrics` 文本含 `meetwise_db_pool_errors_total{purpose="api"}` 等行·0 值预注册序列在。

**B. 隔离容器断连注入 prove（载体 C6·授权闸沿 ha 先例系 `MEETWISE_HA_*_AUTHORIZED=1` 由协调方设·不得默认可跑）**

5. **B1 目标化断连（池自愈主证）**：沙箱 PG 起齐→api/worker 连接就绪→`SELECT pg_terminate_backend(pid)` 杀请求池全部后端（PG 本体存活）→断言：无 uncaughtException、进程 exit code 不变（candidate B 封死路径复绿）；PG 恢复面（本件 PG 未死，恢复=池按需新建）后新请求 ≤5s 成功、`/readyz/api` 全程按 `connectionTimeoutMillis` 有界快速翻转（503 窗→200 回归）——**池原生自愈实录**（`pg_pool` 丢坏连接建新连接）。
6. **B2 全断恢复（PG 死活窗）**：`docker stop`（沙箱 PG）→断言在飞 query reject→500 `internal_error` 非挂死（B3 同窗合并断言）→`docker start` 回归后：新请求成功时限、`/readyz/api` 503→200、worker `ready()` 翻脸→回归、job 续消费零卡死（reaper/sweep 既有断言面复绿）——预期时长含 PG 重启窗 ~10-30s，EXEC 记账如实（Ban 以「超时异常」粉饰，学 ha-2 R4 口径）。
7. **B3 在飞请求行为**：B1/B2 断连窗内发出的在飞请求→断言收到 500 `internal_error` 信封（`all-exceptions.filter.ts:39` 既有契约）、**非悬挂**（响应时限≤`connectionTimeoutMillis`/`statement_timeout` 有界）、api 进程存活（后续 `/livez` 恒 200）。
8. **B4 keepAlive 行为佐证（诚实边界注记）**：TCP 半开死连无法本地快速天然复现——主证=A1 参数生效+驱动源码锚；佐证（EXEC 裁可选，裁撤须落卷）=容器网 iptables DROP（不回 RST）模拟静默丢包窗后，keepAlive 钉死配置下 idle 池连接死连被 OS 探测回收的时序读数；**Ban 宣称「keepAlive 灭绝半开死连」**（OS 参数不可达面照实·§2-7）。
9. **B5 query_timeout 行为**：注入 `SELECT pg_sleep(<N>s)`（N>15s 默认值）→断言 driver 层超时错误返回（错误来源形态与 server 端 `statement_timeout` 报错可区分·随卷记录两者 message 形态）；注：本件须 stub 化限流/并发面防外溢，stub 不触模型（est live=0）。
10. **B6 SSE LISTEN 断连降级（零改实证）**：SSE 客户端在流→`pg_terminate_backend` 杀 LISTEN 连接→断言：`SSE_NOTIFY_DEGRADED reason=listen_down` 日志一行（:205-208 恰一次语义）、降级窗内新事件经 legacy 2s 轮询**继续到达**、退避重连后回 healthy（`health()` 翻真）；客户端视角：断连窗事件经 `interview_event` 账本+Last-Event-ID 重放零丢（既有契约）。
11. **B7 worker 长连接面**：杀 worker 全部 PG 连接→断言：`drain tick error` 日志+`consecutiveFailures` 增（drain-loop.ts:49-50）、job-wakeup `ready()` 翻脸路径（:126）、PG 回归后两 `ready()` 回归+下一拍 job 正常领取（SKIP LOCKED 既有断言面复绿）。
12. **B8 migrate 断连重试（W3 容器实录）**：沙箱 PG 停窗内起 migrate job→断言：连接级失败退避重试日志（含 attempt 序号与错误分类）、PG 回归后完成 EXIT=0 输出 `applied/skipped` 清单；超预算窗对照组→exit 1 fail-loud 非假绿。
13. **B9 零回归**：`@meetwise/db`/api/worker 既有 prove 矩阵按仓内现状全量如实记账（跑/未跑列账）；红项逐条基线对账禁 skip-as-pass；C1/C3/C4 触面 tsc/零新增误差记录；全部收据（EXIT、读数、attempt 账）入 EXEC 记账+`receipts/ha-3/`。

## §5 Ban

Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 翻 `observePoolError` candidate B 边界**（观察者内加重连/重建池/翻 health 旗——`principal.ts:872-884` 边界原文与前刀双审裁定在卷·池自愈只实证不改造）· **Ban 碰已落四参**（:914-918 零改）· **Ban 碰 SSE/worker 三长连接面任何一行**（W4 零改件·`sse-notify`/`sse-pump`/`job-wakeup-listener`/`drain-loop`）· Ban 触 `runMigrations`/advisory lock/checksum 本体（W3 只连接层）· Ban 原地改任何既有 compose（载体只新增 C6）· Ban 无 deadline 的 await（新增重试/退避必须带上限）· Ban 生产宿主/生产库操作（est live=0）· Ban secrets/Key/连接串入日志与收据（沿 `observePoolError` :882-884 脱敏纪律）· Ban 翻 pins · Ban 把「池参数补齐+断连自愈实证」宣称为「DB HA」或「RDS 切换就绪」（R-20/21 归后刀）· Ban SSOT 无关触碰（LEDGER/backlog 只读引用·nail 时才改）。

## §6 pins（十一值照抄 `harness/entpay-slice2-REQUEST.md:139` · EXEC/审查不得改口 · 本刀零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ DB 高可用 ≠ 主备/区域切换 ≠ PgBouncer/连接预算（R-20/21）≠ 备份/PITR（R-26）≠ 告警闭环（R-47）≠ 零断连（断连窗 500 `internal_error` 与 SSE 降级轮询是**设计行为**非缺陷非 HA 证明）≠ `haStatus` 翻转（HA 簇 B3 配套项之一收口·翻转前置 B1-B6 与 ha-1 证据链照旧）· keepAlive 钉死 ≠ 半开死连全灭（OS 层参数不可达面照实·B4 诚实注记）· W3 连接层重试 ≠ migrate 任意重试（DDL 失败恒 fail-loud）· prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）· 沙箱 PG 行为 ≠ 生产 RDS 行为（云托管断连形态差异如实·不外推）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码/compose、未跑 prove、无实现自批资格。开工三条款（缺一保持本状态零码动）：① **协调方开工授权**（LEDGER:136 HA 簇解锁时点亲证·批1 收口状态确认）；② **本档预执行双审 BOTH PASS**（落 `reviews/REQUEST-2026-10-10-ha-3-db-resilience-*-mw-*.md`）——EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审；③ **沙箱授权**：C6 载体拉起与断连注入 `MEETWISE_HA_*_AUTHORIZED` 系由协调方设（沿 ha-1/ha-2 先例闸形），不得默认可跑。任何越 §2 非范围冲动（顺手修 R-20/21/26、翻 candidate B、动 SSE 三面）=停手上报，不借机修。

---

*HA-3 DB-RESILIENCE REQUEST（起草） · 2026-10-10 · ha3-draft 席 · base `feat/mysql-schema-skeleton` @`9f6edf8f`（主线 tip 亲证） · R-22 P1 DB 韧性=keepAlive/query_timeout 补齐+purpose 归因出表+migrate 连接层退避+SSE/长连接降级零改实证+断连注入矩阵 · 蓝本勘正（已落四参+candidate B 监听如实登记零冒功）· 全锚 @9f6edf8f 亲读 · est live=0 · pins 十一值零翻转 · markers=0 · ⛔push ⛔动主线仓 ⛔触其他工作树 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*
