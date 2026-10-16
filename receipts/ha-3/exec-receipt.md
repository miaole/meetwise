# HA-3 · R-22 DB 断连韧性 EXEC 收据（executed:awaiting_post_prove_dual）

EXEC 席 ha3-exec · 2026-10-10 · 分支 line/ha-3-db-resilience（rebase 主线 tip 后）· est live=0（全沙箱·零生产操作·零模型外呼）· pins 十一值零翻转 · ⛔push

## 一、rebase 与逐锚重定位（漂移表）

- `git rebase feat/mysql-schema-skeleton` → **"Current branch line/ha-3-db-resilience is up to date." EXIT=0 零冲突**。主线 tip 亲证=9f6edf8f（与 merge-base 相同；任务书所称 9f6edf8f 后的 G1/G3/G2/HA-2/ENTPAY 片2 等实测均已在 9f6edf8f 及其祖先落卷，主线分支引用未再前移——如实登记）。
- 逐锚重定位：**零漂移**。REQUEST 全部 file:line 锚在本树逐一亲证在位：principal.ts :845(POOL_PURPOSE)/:854(poolErrorTotal)/:857-858(readPoolErrorTotal)/:861-903(observePoolError)/:906(createPool 定义)/:914-918(已落四参)/:928-931(connect/error 监听) · db.service.ts:7 · sse-notify.service.ts:151/:208 · worker/main.ts:133/:237-246/:242-245(metrics)/:427-428/:498/:658 · privacy:31 · rag:35 · migrate-cli:6/:42/:62/:81-84 · migrate.ts:2-5/:208-211 · cost-configure:12 · health.service.ts:17-19 · metrics.controller.ts:9-15 · app.module.ts:39 · all-exceptions.filter.ts:39 · sse-pump.ts:105-106 · job-wakeup-listener.ts:73-126 · drain-loop.ts:40-51/:70-74 · compose.prod.yml:223-233/:231/:232/:247-248 · fence-reflow-repair.ts:25-26/:174 · checkpoint-principal.ts:131（注释引用）。
- pg@8.22.0 驱动锚实测吻合：client.js:95-96（`keepAlive: c.keepAlive || false`/`keepAliveInitialDelayMillis: … || 0`）·client.js:660（`config.query_timeout || this.connectionParameters.query_timeout`）·connection.js:24-25（`_keepAlive`/`_keepAliveInitialDelayMillis` 存储）·:47-48（`stream.setKeepAlive(true, …)` 消费）·connection-parameters.js:132-140（keepalives/keepalives_idle 映射面·idle=/1000——A1 Ban 面照卷）·pg-pool index.js:69（`this.options = Object.assign({}, options)`——pool.options 断言面实证）。
- **ci.yml 三 pin 勘误值亲证**：:95（「远程 PostgreSQL 证明不在 per-push CI（需 E2E_CLOUD_ISOLATED=1；不得改起本地 Docker）」注释）·:137（`pnpm db:up`）·:148（`pnpm db:prove`）。零改零触。
- 全仓 createPool 普查（census proof 断言）：恰 14 处=9 生产+3 附带（migrate-cli :43/:64 子池·cost-configure:12）+1 显式零改动点（fence-reflow-repair.ts:174 无 purpose 零触）+1 定义点（principal.ts）——「点数不符即 FAIL」闭环 PASS。

## 二、W1-W4 逐条落码（file:line）

| 件 | 落点 | 内容 |
|---|---|---|
| **W1（C1）** | `packages/db/src/principal.ts:919-934` | `keepAlive: true` 直钉 + `keepAliveInitialDelayMillis: Number(process.env.PG_KEEPALIVE_INITIAL_DELAY_MS ?? 10000)` + `query_timeout: Number(process.env.PG_QUERY_TIMEOUT_MS ?? 15000)`；双层超时语义注记与 OS 层不可达边界注记入码。已落四参（现 :915-919）零改。health.service.ts:18 注释落码后自动转真·零字改（照 REQUEST W1 起草席推荐） |
| **W2（C2/C3）** | 九生产点+3 附带点 | `db.service.ts:7`→'api' · `sse-notify.service.ts:151`→'sse-listen' · `main.ts:134`→'checkpoint' · `main.ts:428`→'worker' · `main.ts:499`→'qbank-control' · `main.ts:659`→'job-wakeup' · `privacy-worker-runtime.ts:31`→'privacy-worker' · `rag-control-runtime.ts:35`→'rag-control' · `migrate-cli.ts:6`→'migrate'；附带：migrate-cli 子池 'qbank-control'/'rag-control'、`cost-configure.ts:12`→'migrate'（同 compose job 链）。DI 缝型 additive 放宽（privacy/rag `purpose?: string`）。**purpose 注册表**（principal.ts :869-876 `readRegisteredPoolPurposes`）+**渲染行**（:878-895 `renderPoolErrorsTotalLines`·逐已注册 purpose·0 预注册·# TYPE counter·脱敏同 :882-884 纪律）。两面接线零新端点：worker `main.ts:244-250` / api `metrics.controller.ts:15-19`（getMetrics().render()+renderPoolErrorsTotalLines()） |
| **W2③ 裁决** | 落卷=**择 A** | 理由：① 既有 api `GET /metrics` 在位（metrics.controller.ts:9-15+app.module.ts:39·rev2 勘误在卷），追加同形行仍零新端点；② api/sse-listen 两 purpose 归因出表闭环（本刀 B 矩阵实录 api 面 purpose=api/sse-listen 计数事故窗抬升可见）；③ R-47 告警边界不动（行只是数据面·不入 ai-runtime METRIC 名单·零 alerts-lint 面触碰）。B 不取理由：api 仅日志会让 api 进程断连频度对 ops 继续不可见（rev2 勘误后 B 的立论只剩「延后归 R-47」，而 A 以零新端点成本即闭环）；/readyz 零改与 candidate B 边界两案皆不动，选 A 不改变任何边界 |
| **W3（C4）** | `packages/db/src/migrate-connect-retry.ts`（新）+`migrate-cli.ts`（:17-21/:59-64/:81-86 warm-up 三处）+`cost-configure.ts:12-18` | `classifyConnectError`（ECONNREFUSED/ETIMEDOUT/ECONNRESET/57P01/53300+pg teardown message 族→'connect'；DDL/事务/checksum/逻辑→'fatal' 零重试）+`withConnectRetry`（base `MIGRATE_CONNECT_RETRY_BASE_MS` 默认 1000·cap 15000·总窗 `MIGRATE_CONNECT_BUDGET_MS` 默认 30000·deadline 钳制无无界 await·超窗原样上抛→main().catch→exit 1 fail-loud）+`warmUpPool`。runMigrations/advisory lock/DDL **零碰**（census proof 结构断言：runMigrations 调用原样在·migrate-cli 零 withConnectRetry 直用·恰 3 处 warm-up）。compose.prod.yml 治理面零改（restart:"no"/service_completed_successfully 结构断言在卷） |
| **W4（零改验证件）** | 零码改 | SSE/worker 三长连接面（sse-notify/sse-pump/job-wakeup-listener/drain-loop）零行触碰——B1/B2/B6/B7 实录见 §四。注意：drain-loop.ts:32 间隔计时器 unref 系主线预存（W4 Ban 面未触） |

**W2③=A 已按 rev2 §4-A.4 兑现 api 侧渲染断言**（apps/api/test/ha3-metrics-pool-errors.proof.ts）。

## 三、A 矩阵（注入式·全绿 EXIT=0）

| 件 | 载体 | 结果 |
|---|---|---|
| A1 | `packages/db/test/ha3-pool-resilience.proof.ts` | **29 PASS**：断言面按 rev2 钉 `pool.options`（pg-pool index.js:69 实证）+驱动源码锚三处逐行读数；keepAlive=true/initial=10000/query_timeout=15000 默认+env 覆写（2500/3000）双路径；已落四参零改断言（15000/15000/5000/30000/max20）；ConnectionParameters 映射面零断言（Ban 照守）。**A1-live**（HA3_LIVE_PG_URL 闸·沙箱真连接）：`client.connection._keepAlive===true`+`_keepAliveInitialDelayMillis===10000` 存储面 PASS |
| A2 | `packages/db/test/ha3-purpose-census.proof.ts` | **28 PASS**：14 点普查点数闭合+逐点标签表（内容匹配）+显式零改动点无 purpose 断言+W3 结构边界（runMigrations 零包裹/恰 3 warm-up/compose 治理面零改）+非法标签拒（dynamic 同卷） |
| A3 | `packages/db/test/ha3-migrate-connect-retry.proof.ts` | **19 PASS**：分类表九态（五命名+teardown 族 vs DDL 42601/checksum/23505/非 Error）；退避序 [1000,2000] 注入 clock；DDL 零重试立即抛；超预算 fail-loud+attempt 有界+钳制断言（500ms 尾钳） |
| A4 | db 渲染面（A1 卷内 10 断言）+`apps/api/test/ha3-metrics-pool-errors.proof.ts` +`apps/worker/test/ha3-metrics-pool-errors.proof.ts` | db：TYPE 恰一/0 预注册/计数抬升/同 error 对象重发去重=恰一次/行无连接串凭据 SQL。api：api+sse-listen 两行（进程集合）·断连注入后 api=2·worker 集合标签不冒现·零新端点。worker：六行集合（checkpoint/worker/qbank-control/job-wakeup/privacy-worker/rag-control）·api 标签不冒现·HTTP text/plain 0.0.4 形制不变 |

## 四、B 矩阵（C6 载体 `docker/compose.ha-3-proof.yml`·闸 MEETWISE_HA3_PROOF_AUTHORIZED=1·CMD+EXIT 逐条 receipts/ha-3/b*.log）

沙箱：pgvector/pgvector:pg16 tmpfs @54340 + api-proof(28788)/worker-proof(29091)（本地 runtime-shell 镜像 meetwise-backend:ha-dual-local·bind-mount·restart:"no"）+migrate-proof。宿主 migrate applied=160。**注**：bind-mount 容器需 linux-arm64 原生绑定，沿 ha-2 先例外科式补 4 包入 gitignore 的 node_modules（@oxc-resolver/binding-linux-arm64-gnu@11.21.3·@swc/core-linux-arm64-gnu@1.15.43·@napi-rs/canvas-linux-arm64-gnu@0.1.80·@esbuild/linux-arm64@0.28.1·宿主 darwin 绑定共存·其后宿主 proves 全绿验证零破坏）。

| 件 | CMD 形 | 结果 |
|---|---|---|
| **B1** | `pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='meetwise' AND pid<>pg_backend_pid()`（7 后端全灭·PG 本体存活） | **api PASS**：RestartCount=0·PID/StartedAt 不变·uncaughtException=0·readyz 恢复（复测窗 +27ms 内 200）·db_pool_error 结构化行 1·`meetwise_db_pool_errors_total{purpose="api"}` 0→1 实时可见。**worker 发现（如实·三次复现：B1/B2 窗/B7）**：进程干净 exit 0（非 crash·零 uncaughtException）——机理=主线预存「全部存续句柄 unref」（drain-loop.ts:32 间隔计时器 unref+main.ts:264 metrics server unref+main.ts:480 flush unref+job-wakeup-listener.ts:80 重试 unref），DB socket 是唯一 ref 句柄，全灭窗零 ref 句柄→node 静默退出。**本刀 diff 零涉该路径**（W4 三面 Ban 未触·purposes/metrics 行为无关），属断连注入实录**新暴露的预存韧性缺口**，归协调方裁决后续刀，本刀不修（W4 零改边界） |
| **B2/B3** | `docker stop` 全断窗→`docker start` | **PASS**：在飞业务请求（GET /interview/IV_HA3B6/events）于停窗收到 **500 `{"error":"internal_error"}` 耗时 75ms**（≪connectionTimeout 5s 有界·非悬挂·信封=all-exceptions.filter.ts:39 契约）；/livez 窗内恒 200（api 进程存活）；/readyz/api 503；池错误计数抬升（api 3/sse-listen 4 事故窗可见）；恢复 pg_isready +829ms·readyz/api 200 +862ms；uncaughtException=0。**沙箱属性如实**：tmpfs PGDATA 在 stop 时即灭（start=全新簇）——「stop 即灭」与「down 即灭」同族设计属性落卷；恢复断言（连通性/翻转时延）不依赖业务数据故不受影响；库随后全量重建（applied=160+runtime login provisioned·receipts/ha-3/b7-rebuild.log） |
| **B4** | 主证=A1 参数+存储面+源码锚；佐证裁撤 | 裁撤落卷：iptables DROP 半开模拟需沙箱 pg 容器 NET_ADMIN（沙箱零权能纪律·ha-1 LB cap 冲突先例）且 OS 层 per-probe 间隔（tcp_keepalive_*）进程内不可达（REQUEST §2-7）——EXEC 裁撤可选佐证；**Ban 宣称「keepAlive 灭绝半开死连」照卷**（receipts/ha-3/b4-keepalive-boundary.log） |
| **B5** | 择 rev2 (a)：api 容器钉 PG_QUERY_TIMEOUT_MS=3000（statement_timeout 保持 15000 对照）+宿主侧双形态注入 `SELECT pg_sleep(30)` | **PASS**：driver 形态 `Query read timeout` @3018ms（client.js:660 路径）vs server 形态 `canceling statement due to statement timeout`/SQLSTATE 57014 @1519ms——两形态均触发·message 可区分·排序确定（(a) 钉小+双形态记录兼得 (b) 的裁决性断言）。stub 说明：宿主侧直连池零 HTTP 面·零限流/并发外溢·零模型外呼（est live=0 不破） |
| **B6** | SSE hold（curl -N last-event-id=3）→目标化杀 LISTEN 后端（谓词=该客户端末查询 `pg_trigger` trigger 实证 SELECT·pg_stat_activity 显示末查询非 LISTEN 本身·如实注记）→账本注入 seq4→重连观测→seq5 | **PASS**：`SSE_NOTIFY_DEGRADED reason=listen_down fallback=legacy_2s_poll` 恰一行/每窗（3 窗恰 3 行·同原因不重复刷屏）；降级窗 seq4 COMMIT 后 **+644ms 经账本+2s 拍送达**（Last-Event-ID 连续·零丢）；退避重连回 healthy（LISTEN 后端在场观测）；seq5 重连后送达；`meetwise_db_pool_errors_total{purpose="sse-listen"}` 0→1。**勘误如实**：v3/v4 首跑注入漏 COMMIT（psql 会话终=回滚）→ 送达断言落空系 EXEC 操作误非系统缺陷，v5 修正后全绿（全账留痕 b6-sse-degrade.log） |
| **B7** | 杀全部 app 后端（worker+api NAT 共源 172.21.0.1·client_addr=容器 IP 谓词落空如实记账）| worker 面：uncaughtException=0·exit=0（B1 预存发现第三次复现·不修如上）；**ready() 翻脸面已在缺角色窗活体展示**（沙箱重建前 drain tick error 流+consecutiveFailures 累积→/readyz/worker 503→库重建后 200·drain 容忍循环语义零改实证）；容器重启后 ready 200 +6.4s。「PG 回归后下一拍 job 正常领取」未在本载体展开（需全业务 begin 流程种子·归 uc002/uc017 既有隔离 prove 面覆盖·如实记账） |
| **B8** | migrate-proof 容器实录两对照（--no-deps·首跑 compose 自动拉起依赖被识别后修正·全账留痕） | **(a) PASS**：PG 停窗起 migrate→退避重试日志 5 连（`attempt=1..5 class=connect backoff_ms=1000/2000/4000/8000/15000`·cap 15000 生效）→PG +25.2s 回归→连接成功→`applied=160 skipped=0`+cost-configure observe→**EXIT=0**（33.5s）。**(b) PASS**：PG 常灭·budget 5s→attempts=4·尾次钳制 1978ms 可见→`budget_exhausted budget_ms=5000 attempts=4`→**EXIT=1 fail-loud 非假绿**（6.4s） |

## 五、B9 零回归全账

| 门/proof | 跑/未跑 | 结果 | 备注 |
|---|---|---|---|
| rebase 主线 | 跑 | EXIT=0 up to date | 零冲突 |
| pnpm arch（depcruise 边界/DAG） | 跑 | EXIT=13 **预存红零新增**：after/before 错误集合逐条 diff **全等**（13=13·uc052 proofs→apps 等主线预存·ha-1 卷同类预存先例） | stash 前后对账 |
| pnpm db:up + db:prove（CI per-push 门） | 跑 | 双 EXIT=0 | 「四原语证明全部通过」 |
| pnpm migrate:prove（隔离 runner·CI 门） | 跑 | EXIT=0 | 覆盖 migrate.proof 语义（run-e2e-isolated 隔离目标） |
| pnpm migrate-cli:prove（隔离 runner） | 跑 | EXIT=0 | migrate-cli.ts（W3 触面）契约全绿 |
| packages/db prove:principal-config | 跑 | EXIT=0 | principal.ts 触面 |
| prove:migrate / prove:migrate-cli 直调 | 未跑通=设计性 fail-closed | assertIsolatedTestEnvironment 拒绝非隔离目标 | 非红：直调被隔离闸拒（设计）；语义由上两行隔离 runner 覆盖 |
| ha3 五 proof（db 三+api/worker 两面） | 跑 | 全 EXIT=0 | A 组 |
| worker prove:ha2-drain（drain-loop 触面 sanity·零改面） | 跑 | EXIT=0 PASS=39 FAIL=0 | |
| apps/api·apps/worker tsc --noEmit | 跑 | 触面文件**零 error**（grep 集合证明）；api 30/worker 41/db 20 条**预存**严格模式报错全在无关文件（主线基线同在·db 面 before/after 集合 diff 证明） | |
| 其余既有 prove 矩阵（api neg:all/uc 系/worker adaptive 系等） | 未跑 | 如实列账：需全服务矩阵/长窗·归 CI per-push+nightly 常态覆盖；本刀触面（C1/C3/C4/W2DI 缝）已由上述隔离/注入 proof 直覆盖 | Ban skip-as-pass 不适用（未宣称作绿） |

## 六、停止条件核查 / 边界自检

- 锚点重定位：零失败（零漂移）·prove 新增红：零（arch/tsc 红均预存·集合对账在卷）——**未触发停止条件**。
- 已落四参零改 ✓（A1 断言在卷）·candidate B/C 零触 ✓·PgBouncer/RDS/备份/告警零触 ✓·SSE/worker 容忍面零行改 ✓（W4 零改件·git diff 可证）·compose 治理面零改 ✓（census proof 结构断言）·零 secrets（收据/日志脱敏·占位假凭据同 compose 先例）·pins 十一值零翻转 ✓·markers=0（新增行 `rg "TODO|FIXME|XXX|TBD|待补|占位|<MARKER>"` 零命中；main.ts:88「占位」系主线预存注释·diff 零涉）·est live=0 ✓（沙箱即灭·零生产宿主操作·零模型外呼）。
- 新增文件仅 C5/C6 清单内：migrate-connect-retry.ts + 三 db proof + api/worker proof + compose.ha-3-proof.yml（载体唯一）+ receipts/ha-3/。**零清单外载体**（B 矩阵驱动=bash exec 逐条记账·未私造驱动脚本）。
- `.tmp/ha3/b5-query-timeout.mjs` 为 B5 临时脚本（.tmp/ gitignore·不入卷）。

## 七、上报事项（非本刀范围·请裁决）

1. **worker 全断窗静默退出（exit 0）**：主线预存「全句柄 unref」设计在 DB 全断窗使 worker 进程静默消失（无 crash 无日志级异常）——候选后续刀（如 worker 保活 ref 句柄或 liveness 外科），本刀 W4 Ban 未触。
2. compose.tmpfs 沙箱 PG 的 stop/start=数据即灭属载体设计属性（与 ha-1「down 即灭」同族）——后续 B 类矩阵如需跨 stop 数据存续应改 named volume 或显式重播种子。
