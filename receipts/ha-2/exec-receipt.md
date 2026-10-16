# HA-2 EXEC 收据 · 优雅停机双面（R-18/R-19）

**席**: `ha2-exec` · **分支**: `line/ha-2-graceful`（本提交=EXEC 落卷） · **任务书**: `ai-docs/delivery/harness/ha-2-graceful-REQUEST.md`（rev2·W1-W4 + §3 C1-C8 + §4 八组 + §9 处方 7 条）
**Base**: rebase 后 `feat/mysql-schema-skeleton` @`46ff2290`（主线 tip·docs-only 双提交 `4983042d`+`46ff2290`）· 分叉点 `df12a054` → **rebase 干净零冲突**（分支两 docs 提交与主线零文件重叠）
**日期**: 2026-10-10 · **markers=0** · **est live=0**（零 Key 零外呼零模型调用·零生产操作）· **pins 十一值零翻转**（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · actualSpendCny=null 等·照抄未动）

---

## 一、rebase 重定位漂移表（逐锚）

| 锚 | REQUEST 记载（base df12a054 树） | rebase 后实物（46ff2290 树·本提交前） | 判 |
|---|---|---|---|
| `apps/api/src/main.ts` bootstrap | :123-129 | :123-129（bootstrap:123 / listen:127 / executed 闸:136-141） | 零漂 |
| `apps/api/src/platform/sse-pump.ts` | :53-97（pump:53/safeWrite:59/while:74/end:96） | 逐一亲点全对齐（:53/:59/:74/:96） | 零漂 |
| `apps/api/src/platform/sse-notify.service.ts` | :262-268 | SseNotifyLifecycle :264/:265 | 零漂（±2 注记行） |
| `apps/api/src/modules/health/health.controller.ts` | :20 `@Get(['readyz/api','health'])` | :20 逐字对齐 | 零漂 |
| `apps/worker/src/main.ts` | :737 SIGTERM 链 / :710 vectorPlaneErasureLoop / :487 reconcile interval | :737 / :710 / :487 | 零漂 |
| `docker/compose.prod.yml` | api restart :256 / worker restart :332 / PID1 command :269 | :256 / :332 / :269 | 零漂 |
| `docker/compose.ha-dual.pg.yml:33-34` / `scripts/ha/prepare-nest-pg.mjs` | 既有授权原语 | 实物在位（postgres 服务 + MEETWISE_HA_NEST_PG_AUTHORIZED 闸） | 零漂 |
| 分支提交 hash | aab9c449 / f051e624 | ba23ce14 / 6eb73b60 | rebase 重写（内容逐字节同） |

## 二、W1-W4 落码对账（file:line·全亲测）

| 件 | 落点 |
|---|---|
| **C1** SSE 注册表（新增） | `apps/api/src/platform/sse-registry.ts`（82 行·register/unregister/drainAll():number/count()/isDraining/beginDrain + 进程单例 getSseRegistry()；**R1 口径：drainAll 只同步置旗·零 end 调用**·proof 断言剥注释后 `\.end\(` 零命中） |
| **C2** 泵接入 | `apps/api/src/platform/sse-pump.ts`：:45-47 `registry?` 注入缝（沿 notify? 形）·:64 `draining` 旗·:66 `wakeOnClose` 上移·:69-72 safeWrite 同读旗（排水后写侧即刻失效）·:73-75 registryEntry{requestDrain=置旗+wake}+register·:77 晚到连接即持旗·:89 while 增 `!draining`·:101 帧边界 break·:107 取数窗 break（禁 emit）·:113 unregister 单点（全退出路径）·:116 `reply.raw.end()` **泵内单点恰一次** |
| **C3** API 关闭链 | `apps/api/src/main.ts`：:38-50 HEALTH_PROBE_PATHS(livez/readyz/api/health)+drainGateHook（503 service_unavailable_draining + connection: close·信封沿 AllExceptionsFilter 形制·健康探针豁免）·:57-100 createApiShutdownChain（beginDrain→drainAll→等注册表归零→await app.close()→exit 0；API_SHUTDOWN_TIMEOUT_MS 默认 10s deadline 计时器**不 unref**→api_drain_timeout+exit 0；双信号幂等闸）·:194 bootstrap 挂门（createApp 复用面零感）·:200-209 listen 后接链·:208-209 SIGTERM/SIGINT 同 handler。**R2：全仓零 `enableShutdownHooks(` 调用**（唯一命中=main.ts:64 注记） |
| **C4** readiness 翻脸 | `apps/api/src/modules/health/health.controller.ts`：:29 `getSseRegistry().isDraining()` 先于 DB 探测 → HttpException 503 `{status:'draining'}`；`/readyz/api` 与 `/health`（:20 同 handler）天然同翻；`/livez` 零改 |
| **C5** worker 排水 | `apps/worker/src/drain-loop.ts`：+60 行 `drainWithDeadline(stops,timeoutMs,onTimeout):'drained'\|'timeout'`（allSettled 与 deadline 竞速·败者 clearTimeout·timeout 回调收在飞名）+`wireSignalShutdown`（on 注入）。`apps/worker/src/main.ts`：:759-776 drainStops **16 具名项**（10 loop.stop+ragCache.close+3 pool.end+langfuse.shutdown·**含补漏 `vector-plane-erasure` :768**·env-gated stub-tick 条件展开 :776）·:779-796 shutdownWorker（幂等闸·listener 停→drainWithDeadline(boundedIntEnv('WORKER_DRAIN_TIMEOUT_MS',30_000,…))→worker_drain_timeout 含 signal+in_flight→metricsServer.close() 2s 上限 race await→exit 0）·:797 SIGTERM/SIGINT 同 handler |
| **C6** compose 钉值 | `docker/compose.prod.yml`：api :261-262 `stop_grace_period: 15s`+`stop_signal: SIGTERM`·worker :342-343 `stop_grace_period: 40s`+`stop_signal: SIGTERM`（rev2-③ 可选钉照钉·零改其余字段） |
| **C7** proof 面 | `apps/api/test/ha-2-drain.proof.ts`（311 行·47 断言）+`apps/worker/test/ha-2-drain.proof.ts`（112 行·39 断言）+两 package.json `prove:ha2-drain`（api=node+swc-register 形·worker=tsx 形·随仓惯例） |
| **C8** 载体 compose（新增） | `docker/compose.ha-2-proof.yml`（84 行）：api-proof/worker-proof 两服务·stop_grace_period api 15s/worker 40s+stop_signal（与 C6 同钉同值）·本地镜像形制（meetwise-backend:ha-dual-local·bind repo·零生产 registry）·**真 PG**（host.docker.internal:54339·meetwise_ha_runtime·沿 pg overlay 形制·**废弃 127.0.0.1:1 placeholder**）·auth 闸注记 MEETWISE_HA2_PROOF_AUTHORIZED=1 |

## 三、八组 EXIT 实录表（§4 矩阵）

| # | 组 | 命令 | 结果 | 关键读数 |
|---|---|---|---|---|
| A1 | API 拒新放旧+关闭链时序 | `pnpm -C apps/api prove:ha2-drain` | **EXIT=0**（47/47 PASS） | 真 fastify inject：排水期普通路由 503+`service_unavailable_draining`+connection:close；/livez 恒 200；C4 handler 503 draining；createApiShutdownChain 注入：close 完成 ≥ 在飞 handler resolve；deadline 40ms 注入→api_drain_timeout+exit 0；双信号幂等 |
| A2 | SSE 不发半截+干净收口 | 同上（47 内） | **PASS** | drain 落等待臂：全部帧尾 `\n\n`·end 恰一次·end 后 write=0（R1 封死）·count()=0；drain 落取数窗：新行不 emit；断开/终态/取数失败/晚到连接四路径全注销 |
| A3 | worker deadline race | `pnpm -C apps/worker prove:ha2-drain` | **EXIT=0**（39/39 PASS） | 自然完退 outcome=drained（29ms≪2000）；挂死→timeout（81ms≈80 上限·非真睡 30s）·onTimeout 收 [hang-loop]·reject 视为 settle |
| A4 | 双信号同链+清单防漏 | 同上（39 内） | **PASS** | wireSignalShutdown 注入：两信号同一 handler 引用；源级断言 16 具名项（含 vector-plane-erasure 实接线）+stub env-gated+metricsServer close 2s 上限+exit(0)+R2 零 enableShutdownHooks+R1 end 泵内单点 |
| B5 | api 容器 SIGTERM | compose.ha-2-proof up api-proof→真 PG 种子→SSE+在飞请求→`docker stop`（宽限 15s） | **PASS**（11 attempts 全账·见 §五） | exit_code=**0**·OOMKilled=false·耗时 0.29-3.5s **<15s**；SSE for-await **clean end**·末帧完整（尾 `…data: {"q":1,"pct":30}\n\n`·3 帧）；在飞普通请求完整 200；新连接 **503 service_unavailable_draining+connection:close**（attempt 1 宿主窗+attempt 9 容器内探针 +317ms 双捕获）；/livez 排水窗 200；readiness 容器内 503 捕获为 10 跑竞速未中（窗口亚秒·信号线级行同旗·C4 单元已钉·如实记账） |
| B6 | worker 短 tick drain | up worker-proof（MEETWISE_HA2_STUB_TICK_MODE=pg-roundtrip）→`docker stop`（宽限 40s） | **PASS** | `ha2_stub_tick_done`（真 PG select 1 往返）13:07:39.582Z **先于** `drained (drained), exiting` 13:07:39.668Z；exit_code=**0**；stop elapsed **0.26s ≪40s**（SIGKILL 未发生）。stub 为 PG 往返 tick 非真实 job markDone（R4：真实 markDone 需真租约 job→模型管线违 est live=0·记账如实） |
| B7 | worker 挂死 deadline | up（…=hang）→`docker stop` | **PASS** | `worker_drain_timeout signal=SIGTERM in_flight=stub-tick` @30.0s→`drained (timeout), exiting`；exit_code=**0**；elapsed **30s**（=WORKER_DRAIN_TIMEOUT_MS·**<40s 宽限**·SIGKILL 未发生）；租约/reaper 收敛面=reaper.proof 隔离环**全绿复跑**（心跳防误收/双边界/僵尸守卫/已结算不误终态·`LOCAL_ISOLATED_PROOF_RECEIPT .tmp/isolated-proof-receipts/2026-10-10T13-12-30-*.json`·stub 无真租约故容器内重领演示由既有断言面承担·R4 记账如实）；B7 总时长记账：设计收敛窗（30s drain+≤120s TTL+≤5s sweep）·本次容器件实测 30s（deadline 面）·reaper 面由隔离环实证 |
| B8 | compose config | stub 全部 `:?` 必填变量（**85 distinct/137 处引用**·perl 亲证与 rev2-③ 逐字吻合）→`docker compose -f docker/compose.prod.yml config` | **EXIT=0** | api `stop_grace_period: 15s`+`stop_signal: SIGTERM`（:106-107）/worker `40s`+`SIGTERM`（:410-411）·归属服务 awk 亲点；载体 compose 自身 config EXIT=0 |

**既有零回归抽查（§4.9·按仓现状如实）**：worker `prove:drain`（drain-loop.ts 本刀延面）✓ EXIT=0 · api `prove:last-event-id` ✓ EXIT=0 · api `smoke:contract`（真 createApp 含新门装配）✓ EXIT=0 · worker `prove:reaper`（隔离环·真 PG）✓ EXIT=0 · api `env-schema:prove`（隔离环）✓ EXIT=0（22 断言）。api/worker tsc：**本刀涉面零误差**（main.ts/sse-pump/sse-registry/health.controller/两 proof/worker main/drain-loop 全净）；仓内预存测试族 tsc 误差（api 42 行/worker 52 行·全在非本刀 proof 文件）=基线对账非本刀引入。

## 四、§9 双席处方兑现

| 处方 | 兑现 |
|---|---|
| **R1**（drain 置旗不 end·写后关封死） | 注册表条目持旗（requestDrain 句柄）·safeWrite :69-72 与 while :89 同读·`raw.end()` 泵内 :116 单点恰一次·A2 增补「end 后 write=0」断言 PASS·注册表模块 `\.end\(` 零命中断言 PASS |
| **R2**（禁 enableShutdownHooks） | 全仓零调用（grep 唯一命中=注释）·createApiShutdownChain 单路·proof 源级断言钉死 |
| **R3**（清点 15→16 勘误兑现） | drainStops 16 具名项+stub 条件项·proof 逐项断言（16 名单+实接线双查） |
| **R4**（env-gated stub 绝不触模型·时长如实记账） | MEETWISE_HA2_STUB_TICK_MODE 两态（pg-roundtrip/hang）·未设零行为零成本·stub 块零 `.invoke(`/零 model 引用断言·B7 30s 实测+150-180s 收敛窗如实落账 |
| **席2-①**（载体真 PG） | B5/B6/B7 全走 prepare-nest-pg（NEST_PG_READY：migrate+provisionRuntimeLogin meetwise_ha_runtime）+host.docker.internal:54339；placeholder 死端口零使用 |
| **席2-②**（C8 收编） | docker/compose.ha-2-proof.yml 入本提交·EXEC 未私造清单外载体文件（B 组台本/容器内探针均在 repo 外 /tmp 与 gitignore 的 .tmp/·不产面） |
| **席2-③**（三钉） | C4 `/health` 别名同 handler 同翻（同 handler 天然+proof 断言）·B8 stub 85/137 亲证吻合后 config EXIT=0·C6 stop_signal SIGTERM 两块显钉 |

## 五、attempts 全账（Ban retry-to-green·逐次如实）

- **A1-A4**：api proof 3 次迭代至绿（①resolveNext 形状错 ②fallback 时序设计错 ③poll 挂死=fake exit 不真退·修=断言后注销 stuck 条目）·worker proof 2 次（①root 路径错 ②indexed-access 严格性）——全部为实现侧测试缺陷修复·非判据放水。
- **真 PG prepare**：attempt1 migrate ECONNRESET（瞬态）→attempt2 NEST_PG_READY EXIT=0。
- **B5**：11 attempts 全账（①宿主探针捕窗成功·readyz 早于翻转 30ms ②进程 300ms 自退探针扑空 ③④Desktop 信号投递延迟方差·探针语义修正 ⑤-⑧容器内 exec 探针排障：init-p 竞态→ALIVE 握手 ⑨**gate 503 容器内捕获** ⑩⑪并行环两态）——exit 0/SSE clean end/拒新 503/<15s 每一 attempt 稳定复现；readyz 容器内 503 捕获=亚秒窗竞速未中·如实记账（C4 同旗单单元 47 断言已钉）。
- **容器 linux 原生绑定**：宿主 darwin node_modules 缺 linux 变体——容器内整树 pnpm install 被 NO_TTY 保险正确拦下（防铲 darwin 绑定·未采）；改外科式补 3 包（@oxc-resolver/binding-linux-arm64-gnu@11.21.3·@swc/core-linux-arm64-gnu@1.13.5·@napi-rs/canvas-linux-arm64-gnu@0.1.80）进 gitignore 的 node_modules（宿主 darwin 绑定共存·其后宿主 proofs 全绿验证无破坏）。
- **env-schema 初跑红**：误用裸 DATABASE_URL 直跑→识别为隔离 attestation 族→走 `run-e2e-isolated.mjs` 正轨→22 断言全绿（前置错·非产品红）。

## 六、停止条件核查

- 沙箱容器起不来：**否**（docker 29.1.3+compose v5·api/worker/postgres 全部起停实录）。
- 排水时序断言不可构造：**否**（A3/A4 fake 计时确定性读数·B6/B7 容器实录时序断言全落）。
- prove 新增红：**否**（新增两 proof 全绿 47+39·既有抽查 5 项全绿·tsc 涉面零新增误差）。

## 七、边界与 Non-claims

⛔push（本提交仅在本工作树本分支）·主线零触（rebase 只重写本分支）·其他工作树零触（R-17 拓扑/HA-1 面零碰·compose.ha-dual*.yml 零改）·R-22 DB 韧性后刀（池参数零改·grep 实证）·零 secrets 入库（compose 占位符=仓内既有 local-dev 形制·与 ha-dual.pg 同级）·markers=0·est live=0·actualSpendCny=null。本刀≠HA≠零停机发布≠零丢请求新保证（503 排水窗=设计行为·SSE 零丢靠既有账本重放+客户端韧性）。prove EXIT=0 ≠ DONE（claimDone=false·完成判定走双审+nail）。
