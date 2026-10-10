# HA-1 REDUNDANCY EXEC REQUEST — R-17 单机单副本→单机多副本（北星门 2 首刀·haStatus 翻转本体·任务书起草·docs-only 零码动）

**Status**: **`draft:awaiting_dual`**（起草席产出·docs-only 零码动·双审未启动·**Dual PASS ≠ 开工**（§8 三条款缺一不得动码）· Ban self-approve · alone≠dual）
**Date**: 2026-10-10
**Base**: 主线 `feat/mysql-schema-skeleton` @`df12a054`（本席 `git log` 亲证主线 tip；工作树 `meetwise-ha1` 分支 `line/ha-1-redundancy`）——本档全部 file:line 为**@`df12a054` 实树逐文件亲读**（禁臆测）
**蓝本**: LEDGER「refactor-backlog HA 簇」表（`ai-docs/delivery/harness/product-campaign-LEDGER.md:126-136`·R-17 行 :128）+ `ai-docs/delivery/north-star-ha.md`（:67 haStatus 现值）+ `ai-docs/delivery/harness/w2-resource-sizing-receipts.md`（W2 资源核算）+ 既有 HA 工具轨 `harness/ha-track.multi-instance.md`
**席位**: ha1-draft（北星门 2 首刀起草席）

---

## §0 立靶（R-17 是什么·凭什么是本刀）

### 0.1 现状一句话

生产拓扑=**单机单副本**：api×1 / worker×1 / web×1，**无任何 LB 服务**（唯一代理=宿主 nginx 单 upstream），任一进程崩溃虽能靠 `restart: unless-stopped` 拉起，但拉起窗口内该组件**全瘫**；宿主机整体=全栈 SPOF。LEDGER:128 定级 **R-17 P0「单机单副本（1×api/worker/web 无冗余无 LB）→ haStatus 翻转本体」**——本刀=HA 簇的第一刀，交付多副本拓扑本体+haStatus 翻转判据与证据链契约。

### 0.2 授权链

1. LEDGER:125-134 HA 簇表=北星门 2「Production 100% HA」专属工作面（refactor-backlog 对账后未被产品链吸收项）。
2. LEDGER:136 执行裁定：HA 簇「**在 P0 四断链+批1 收口后启动**」——主线 tip `df12a054` 已载「P0 四链全通宣告」，批1 收口状态由**协调方开工时点亲证**（§8 开工条款①）。
3. north-star-ha.md:29 目标「生产环境 100% 高可用（可复现证据：多实例 / 故障注入 / prove+EXIT / CI）。**当前 ≠HA**」；:67「默认 / stub / 本地 compose 一律 `haStatus: NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`」=本刀起点的钉。
4. 既有 HA 工具轨（C1 真 compose / C2 双 livez / C3 shared / C3b Nest session / C4 fault-inject 本地路径已落，`harness/ha-track.multi-instance.md:45-50`）——全部 **NOT_HA**（:52「retain haStatus=NOT_HA」）。本刀在其之上落**生产拓扑多副本**，工具轨零弱化。

### 0.3 诚实边界（先写死再设计）

本刀交付=**单机内进程级冗余**（多副本+健康检查+重启自愈+LB）。**单机宿主仍是 SPOF**——宿主级冗余/多 AZ/云托管归 S15 买云（§4 范围外）。`claimProductionHA=true` 是否要求宿主冗余=EXEC 双审终裁点（§2.3 判据 B-7）。Ban 把单机多副本叙事成「生产 100% HA 已达成」。

---

## §1 现状盘点（亲读 @`df12a054`·file:line 全锚）

### 1.1 拓扑现状

| 面 | 现值 | 锚（@df12a054 实测） |
|---|---|---|
| api 副本数 | **1** | `docker/compose.prod.yml:236-263`（单 service `api`） |
| api 自愈/资源/健康 | `restart: unless-stopped`·`mem_limit: 512m`·healthcheck `/readyz/api`（DB 可达+envSchema，:10s×12 retries）·宿主回环 `127.0.0.1:8787` | compose.prod.yml:256 / :257 / :258-263 / :253 |
| worker 副本数 | **1** | compose.prod.yml:265-339（单 service `worker`） |
| worker 自愈/资源/健康 | `restart: unless-stopped`·`mem_limit: 1g`·healthcheck `/readyz/worker`（:334-339）·`expose 9091` 仅容器网（:330-331） | compose.prod.yml:332 / :333 |
| web 副本数 | **1** | compose.prod.yml:341-372（单 service `web`） |
| web 自愈/资源/健康 | `restart: unless-stopped`·`mem_limit: 512m`·healthcheck `/login`（:367-372）·宿主回环 `127.0.0.1:3000`（:364） | compose.prod.yml:365 / :366 |
| migrate | 一次性 job，`restart: "no"` | compose.prod.yml:223-234（:232） |
| **LB** | **全仓 compose 零 LB 服务**（nginx/haproxy/traefik 均无——rg 实证仅注释引宿主 nginx）；唯一代理=**宿主** nginx 单 upstream `127.0.0.1:3000` | `ops/deploy/nginx.conf:20-23`；compose.prod.yml:252/:362 注释（funnel→nginx:80→web:3000） |
| 宿主 nginx SSE 面 | `proxy_buffering off` + `proxy_read_timeout 3600s`（单 web·LB 化时须对齐） | ops/deploy/nginx.conf:12-22 |
| 资源信封 | 单机 4G 预览（compose.prod.yml:254 注释）；现占 api512m+worker1g+web512m=**2G**；翻倍+LB≈4.1G+ **超 2c4g 信封** | compose.prod.yml:254-257/:332-333/:365-366；`harness/w2-resource-sizing-receipts.md:32`（2c4g vs 4c8g 对照·sizing≠HA） |
| compose.prod 治理 | 受治理稳定契约——原地改需「successor 记录+多重 digest 重算」重仪式；运行时旋钮走**非治理叠加层**先例 | `docker/compose.prod.override.yml:1-6` |

### 1.2 haStatus 判定面现状

| 面 | 现值 | 锚 |
|---|---|---|
| 判定面形态 | **无计算面**——haStatus 为全仓约 30 处**硬编码常量** `NOT_HA`（scripts/ha/*·proofs·镜像 label），无任何脚本按拓扑实况推导 | `scripts/ha/probe.multi.mjs:340-354`；`docker/Dockerfile.ha-dual:21`（label NOT_HA） |
| fail-closed 现值 | `--require-evidence` **恒 EXIT=1**（「local evidence seen but production topology/CI/review missing — refuse HA」） | probe.multi.mjs:14-18 / :340-354 |
| 现值钉 | `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` | north-star-ha.md:67；LEDGER:136 |
| 既有 dual 工具轨 | api-a/api-b 双 `/livez` compose（**dev bind-mount·`restart: "no"`·无 LB·非生产拓扑**）；INSTANCE_ID 命名先例 | `docker/compose.ha-dual.yml:36-92`（restart :65·INSTANCE_ID :75/:87·hc /livez :53-64） |
| 故障注入 | `docker stop api-a` + B `/livez` 探活；需 `MEETWISE_HA_FAULT_AUTHORIZED` | `scripts/ha/fault-inject.mjs:5-27` |

### 1.3 多副本适配面亲读（设计依据）

| 面 | 现值 | 多副本结论 | 锚 |
|---|---|---|---|
| SSE 通知 | interview_event INSERT 触发器（迁移 0143）`pg_notify` 广播→**每 API 进程恰一条**专用 LISTEN 连接（max:1 池）+进程内 router 按 streamKey 分发；**兜底 legacy 2s DB 轮询**；降级打 `SSE_NOTIFY_DEGRADED` | **非内存单例事实源**：pg_notify 天然广播到每副本 LISTEN；事件事实在 DB（seq 重放）。**无需 redis adapter、无需粘性** | `apps/api/src/platform/sse-notify.service.ts:1-38`（:7-10 广播机制·:15-17 兜底轮询） |
| SSE 断线续传 | `Last-Event-ID` fail-closed 解析（正则拒 Infinity/小数）→ DB `seq>lastSeq` 重放 | 客户端重连到**另一副本**仍可续传（事实在 DB） | `apps/api/src/platform/last-event-id.ts:5-18` |
| web SSE 代理 | web 容器内同源代理→`API_BASE_INTERNAL=http://api:8787`（单 api 名） | web×2+api×2 后 API_BASE_INTERNAL 须指向 **LB 服务名** | `apps/web/app/api/interview/[id]/events/route.ts:9`；compose.prod.yml:347-350 |
| worker 租约互斥 | **已有**：report/interview-jobs/quiz-jobs/diagnosis-jobs 四消费面 claim 均 `FOR UPDATE SKIP LOCKED`+CAS `lease_owner`+`lease_expires_at`（崩溃后租约过期他副本可再领·attempts 上限）；leaseOwner=`hostname()#pid` 每进程唯一；pg LISTEN 唤醒广播+SKIP LOCKED 兜底 | **worker×2 无需新互斥码**——租约互斥既有，验证矩阵补实证即可 | `packages/db/src/report/report.ts:24-39`（:26-35 SQL）；`packages/db/src/interview/interview-jobs.ts:143`；`packages/db/src/jobs/quiz-jobs.ts:40`；`packages/db/src/jobs/diagnosis-jobs.ts:38`；`apps/worker/src/main.ts:482` |
| API 优雅停机 | **无** `enableShutdownHooks`/SIGTERM 处理（kill=连接被掐） | R-18 归后刀；本刀 drain 语义=LB 探活摘除（§3-V6） | `apps/api/src/main.ts:123-128`（bootstrap 无关停钩子） |
| 限流/并发槽 | **单实例内存**令牌桶+并发槽（源码注释自证「多实例生产换 Redis 共享桶(seam:同 allow 接口)」） | 多副本下限流=每副本独立计数（有效上限×N）——**已知缺口，本刀只登记不改**（归 R-20/21 配套后刀） | `apps/api/src/platform/rate-limit.service.ts:4-28`（:4-6 注释） |
| 健康端点 | `/livez` 进程存活；`/readyz/api`=DB 可达+envSchema（任一失败 503）；worker `9091/readyz/worker` | healthcheck 判据面已齐 | `apps/api/src/modules/health/health.controller.ts:6-20`；`apps/worker/src/main.ts:238-252` |

---

## §2 R-17 翻转本体设计（EXEC 落地面·本档写死判据与边界）

### 2.1 多副本拓扑（候选甲=起草席推荐·EXEC 双审可裁候选乙）

**原则：compose.prod.yml 零原地改**（:1-6 治理先例）——新增非治理叠加层 `docker/compose.ha.yml`（与 compose.prod.yml `-f` 合载），宿主 nginx 改造走 ops/ 面。

1. **api×2**：显式双 service `api-a`/`api-b`（命名与 INSTANCE_ID 沿 compose.ha-dual.yml:75/:87 先例，机械可判优于 `replicas` 隐式扩缩）；各自 healthcheck `/readyz/api`+`restart: unless-stopped` 沿用 compose.prod.yml:258-263 形；宿主端口回环绑定改 `127.0.0.1:8787/8788` 或全收容器网（保持「api 不 0.0.0.0 暴露」铁律·compose.prod.yml:250-253 注释同口径）。
2. **compose 内 LB（api 入口）**：新增 nginx service（容器网 `expose`，不落宿主端口），upstream={api-a:8787, api-b:8787}；**SSE 路径** `proxy_buffering off`+`proxy_read_timeout ≥3600s`（对齐 ops/deploy/nginx.conf:12-22 既有面）；web 的 `API_BASE_INTERNAL` 指向 LB 服务名。
3. **web×2**：`web-a`/`web-b`，宿主回环 `127.0.0.1:3000/3001`；宿主 ops/deploy/nginx.conf upstream 升双后端+探活摘除（被动 `max_fails` 起步，主动 health 路线 EXEC 裁）。
4. **worker×2**：`worker-a`/`worker-b`；租约互斥既有（§1.3），零新互斥码；healthcheck+restart 同 compose.prod.yml:332-339 形。
5. **migrate 一次性 job 零改**（compose.prod.yml:223-234）。
6. **内存预算重算（W2 锚·Ban 静默超售）**：现占 2G（api512+worker1g+web512），翻倍+LB≈4.1G+ 超单机 4G 信封。EXEC 双审二择一并落卷：①宿主升 **4c8g**（`harness/w2-resource-sizing-receipts.md:32` 信封对照）②减半 per-replica `mem_limit`（附 OOM 风险注记）。任一路线须在收据登记最终预算表。

### 2.2 haStatus 判定面（本刀新增交付）

- 新增 **`scripts/ha/ha-status.mjs` 机械判定器**：读 compose config+`docker compose ps`（health 实况）+LB upstream 分流实测+自愈收据 → 输出机器可读收据 `{apiReplicas, webReplicas, workerReplicas, lbPresent, allHealthy, selfHealProven, haStatus}`。
- haStatus 值域：`NOT_HA` / `HA_TOPOLOGY_LOCAL`（§2.3 本体判据 A1-A6 全绿时）——是否引入中间值或保持二值，归 EXEC 双审终裁；**诚实注记**：`HA_TOPOLOGY_LOCAL` 语义=单机进程级冗余，≠宿主 HA（§0.3）。
- **全仓既有 NOT_HA 常量钉零改**（append-only 精神：判定面是新增面，不改写任何既有收据/proof/label 的 NOT_HA）；`probe.multi.mjs --require-evidence` fail-closed（:340-354）语义零弱化。
- 收据落 `receipts/ha1/`（CMD+EXIT 逐条留痕·他人可复跑）。

### 2.3 翻转判据草案（写死·EXEC 双审终裁后生效）

**本体判据（A 组——拓扑级 HA 最低集·全机械可判）**：

| # | 判据 | 机械判定 |
|---|---|---|
| A1 | api ≥2 副本且每副本 `/readyz/api` healthy | ha-status.mjs 读 compose ps health |
| A2 | web ≥2 副本且每副本 healthcheck healthy | 同上 |
| A3 | worker ≥2 副本且每副本 `/readyz/worker` healthy | 同上 |
| A4 | LB 在位：api 入口与 web 入口各有 upstream ≥2 且**分流实证**（≥2 后端被命中） | 分流计数收据 |
| A5 | 重启自愈实证：kill 任一副本→restart 策略自动拉起→healthy 回归 | kill+heal 双收据（§3-V2） |
| A6 | 故障切换实证：单副本 down 窗口内其余副本继续服务（readiness 200+业务探针 PASS） | §3-V3 收据 |

**claimProductionHA=true 证据链（B 组——翻转动作要求·本刀不执行翻转）**：

| # | 要求 | 锚 |
|---|---|---|
| B1 | A1-A6 全绿+判定面收据**可复现**（CMD+EXIT 留痕·异机可复跑） | §2.2 |
| B2 | 阶 D 三件：ha:probe 类证明 EXIT=0 + CI 绿 + 独立审 ≥2 域 | north-star-ha.md:43 |
| B3 | HA 簇配套收口：R-18/19 优雅停机+R-22 DB 韧性+R-26 备份+R-47 告警 | LEDGER:129-133 |
| B4 | **终裁点**：claimProductionHA=true 是否要求宿主级冗余（S15 买云）。起草席推荐=进程级冗余+故障注入齐⇒haStatus 本体齐；宿主冗余与 claimProductionHA=true 门绑定 S15 | §0.3·LEDGER:136 |
| B5 | releaseEvidence=false 恒约束至 B1-B4 齐+协调方裁定；翻转执行=簇收口刀凭收据，**非本刀** | LEDGER:136 |

---

## §3 验证矩阵（全本地/沙箱·est live=0·每项 CMD+EXIT+收据·Ban retry-to-green）

| # | 验证 | 判据（PASS 语义） |
|---|---|---|
| V1 | 多副本 compose 起得来 | `docker compose -f docker/compose.prod.yml -f docker/compose.ha.yml config` EXIT=0；up 后 api-a/api-b/web-a/web-b/worker-a/worker-b/LB 全 healthy；判定器收据 replicas=2×3+lbPresent=true |
| V2 | kill 单副本自愈 | 逐组件 `docker kill`（非优雅）api-a→重启→`/readyz/api` 200；web-a/worker-a 同测；kill+heal 收据成对；heal 时长入收据 |
| V3 | 故障切换 | api-a down 窗口内 LB 摘除、api-b 持续 readiness 200+业务探针（login/profile 级）PASS；零手工干预 |
| V4 | LB 分流 | N≥20 请求命中 ≥2 upstream（INSTANCE_ID/日志区分）；stop 单后端→后续请求零失败（探活摘除） |
| V5 | SSE 多副本下游 | ①SSE 客户端挂 api-a，事件源触发后经 pg_notify 广播到达（无 redis adapter、无粘性依赖的实证）；②kill api-a→客户端带 `Last-Event-ID` 重连 api-b→`seq>lastSeq` DB 重放零丢失；③LB nginx SSE 路径零缓冲（流式即时下发实证） |
| V6 | worker×2 租约互斥+接管 | 双 worker 同跑：同一 job 恰一领取（SKIP LOCKED）；kill worker-a→其活租约 `lease_expires_at` 过期后由 worker-b 再领（attempts 预算内） |
| V7 | drain 语义（本刀边界） | 本刀 drain=**LB 探活摘除**（新连接不进死副本）+SSE 客户端 Last-Event-ID 重连恢复；**SIGTERM in-flight 排空不在矩阵**（R-18/19）——V2/V5 已按「kill 非优雅+cursor 兜底」口径覆盖 |

---

## §4 非范围（写死）

1. **R-18/R-19**（API 优雅停机 SIGTERM 掐断 SSE 排空·worker stop_grace_period）→ 后刀。
2. **R-22**（DB keepAlive/query_timeout 断连韧性）/ **R-26**（备份/PITR）/ **R-47**（告警常驻闭环）→ 后刀。
3. **R-20/21/23/24/36/37/44/50/51 配套**（连接预算/PgBouncer/队列指标/登录锁定/scrypt/索引等）→ 后刀；本刀仅登记 rate-limit 单实例内存缺口（rate-limit.service.ts:4-6），**零改**。
4. **宿主级冗余/多 AZ/云厂商托管（S15 买云）**→ 本刀外；单机宿主=SPOF 照实登记。
5. **生产宿主实机切换**：本刀验证面=本地/沙箱 compose；生产宿主应用新拓扑=另行协调方授权，**est live=0**（零生产操作·零真实流量·零模型外呼）。
6. 既有 NOT_HA 常量钉/proof 收据面/`probe.multi.mjs` fail-closed：零改零弱化。

---

## §5 Ban

1. Ban 原地改 `docker/compose.prod.yml`（治理契约·compose.prod.override.yml:1-6 先例）；Ban 改动绕过 base-guard。
2. Ban api/宿主端口 0.0.0.0 暴露（compose.prod.yml:250-253/:362-364 铁律·funnel/edge-close 旁路）。
3. Ban 把单机多副本 EXIT=0 写成生产 HA / `releaseEvidence=true` / `claimProductionHA=true`（本刀不翻转任何 pin）；Ban 假绿（north-star-ha.md:45-56 七条硬闸全文不降级）。
4. Ban 静默超售内存信封（§2.1-6 二择一必须落卷）。
5. Ban 碰 worker 租约/wakeup 通道本体语义（sse-notify.service.ts:20-21「只复制不共享」先例同口径）；本刀只验证不改互斥面。
6. Ban 触碰 SSE 触发器（0143）/LISTEN 通道语义；多副本适配零改产品码为基线——若 EXEC 实证必须改码（预期为零），须双审增补处方。
7. Ban 自批/自审；alone≠dual；Dual PASS ≠ 开工。

---

## §6 pins（十一值照抄 `harness/entpay-slice2-REQUEST.md:139`·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（interview-data 行按 UNSTUB-ERASE supersession 现值照抄·interview-data 面仍 503 关闭·原值行代码块内零改） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

---

## §7 Non-claims

本刀 ≠ 生产 100% HA ≠ 宿主冗余 ≠ `releaseEvidence=true` ≠ pins 翻转 ≠ HA 簇收口（R-18/19/22/26/47 未落）。单机多副本判据全绿=**进程级冗余本体齐**，宿主 SPOF 照实存在；「100% 高可用」叙事仍被 north-star-ha.md:37-56 证据阶梯与七硬闸约束。验证矩阵 PASS ≠ 生产容量（`harness/w2-resource-sizing-receipts.md:5` sizing≠HA/capacity 同口径）≠ 性能负载绿（G6 另证）。

---

## §8 STOP（开工三条款·缺一不得动码）

1. **协调方开工授权**：LEDGER:128「🔒产品链后」解锁裁定亲证（P0 四链已全通宣告 @df12a054·批1 收口状态由协调方确认）。
2. **本档双审 BOTH PASS**（mw-e2e-ha 主审+第二域对抗·`reviews/REQUEST-2026-10-10-ha-1-redundancy-*-mw-*.md` 落卷）+ §2.3 终裁点（B4 宿主冗余边界）有裁定。
3. **沙箱授权**（沿用工具轨授权闸形）：`MEETWISE_HA_*_AUTHORIZED` 系=1 由协调方设——多副本 compose 拉起与故障注入不得默认可跑。

任一缺失 → 保持 `draft:awaiting_dual`，零码动。

---

*HA-1 REDUNDANCY REQUEST（起草） · 2026-10-10 · ha1-draft 席 · base `feat/mysql-schema-skeleton` @`df12a054`（主线 tip 亲证） · R-17 P0 haStatus 翻转本体=单机多副本+健康检查+重启自愈+LB+判定面+证据链契约 · 全锚 @df12a054 亲读 · 翻转不归本刀（B5） · est live=0 · pins 十一值零翻转 · markers=0 · ⛔push ⛔动主线仓 ⛔触其他工作树 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*
