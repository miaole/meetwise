# HA-1 REDUNDANCY EXEC REQUEST — R-17 单机单副本→单机多副本（北星门 2 首刀·haStatus 翻转本体·任务书起草·docs-only 零码动）

**Status**: **`draft:awaiting_dual`**（起草席产出·docs-only 零码动·双审未启动·**Dual PASS ≠ 开工**（§8 三条款缺一不得动码）· Ban self-approve · alone≠dual）
**Date**: 2026-10-10
**Base**: 主线 `feat/mysql-schema-skeleton` @`df12a054`（本席 `git log` 亲证主线 tip；工作树 `meetwise-ha1` 分支 `line/ha-1-redundancy`）——本档全部 file:line 为**@`df12a054` 实树逐文件亲读**（禁臆测）
**蓝本**: LEDGER「refactor-backlog HA 簇」表（`ai-docs/delivery/harness/product-campaign-LEDGER.md:126-136`·R-17 行 :128）+ `ai-docs/delivery/north-star-ha.md`（:67 haStatus 现值）+ `ai-docs/delivery/harness/w2-resource-sizing-receipts.md`（W2 资源核算）+ 既有 HA 工具轨 `harness/ha-track.multi-instance.md`
**席位**: ha1-draft（北星门 2 首刀起草席）

---

## §0 立靶（R-17 是什么·凭什么是本刀）

### 0.1 现状一句话

生产拓扑=**单机单副本**：api×1 / worker×1 / web×1，**无任何 LB 服务**（唯一代理=宿主 nginx 单 upstream〖rev2-勘误②→§9-5：应读「proxy_pass 直连单后端（无 upstream{} 块）」·ops/deploy/nginx.conf:20-23 实证〗），任一进程崩溃虽能靠 `restart: unless-stopped` 拉起，但拉起窗口内该组件**全瘫**；宿主机整体=全栈 SPOF。LEDGER:128 定级 **R-17 P0「单机单副本（1×api/worker/web 无冗余无 LB）→ haStatus 翻转本体」**——本刀=HA 簇的第一刀，交付多副本拓扑本体+haStatus 翻转判据与证据链契约。

### 0.2 授权链

1. LEDGER:125-134 HA 簇表=北星门 2「Production 100% HA」专属工作面（refactor-backlog 对账后未被产品链吸收项）。
2. LEDGER:136 执行裁定：HA 簇「**在 P0 四断链+批1 收口后启动**」——主线 tip `df12a054` 已载「P0 四链全通宣告」，批1 收口状态由**协调方开工时点亲证**（§8 开工条款①）。
3. north-star-ha.md:29 目标「生产环境 100% 高可用（可复现证据：多实例 / 故障注入 / prove+EXIT / CI）。**当前 ≠HA**」；:67「默认 / stub / 本地 compose 一律 `haStatus: NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`」=本刀起点的钉。
4. 既有 HA 工具轨（C1 真 compose / C2 双 livez / C3 shared / C3b Nest session / C4 fault-inject 本地路径已落，`harness/ha-track.multi-instance.md:45-50`）——全部 **NOT_HA**（:52「retain haStatus=NOT_HA」）。本刀在其之上落**生产拓扑多副本**，工具轨零弱化。

### 0.3 诚实边界（先写死再设计）

本刀交付=**单机内进程级冗余**（多副本+健康检查+重启自愈+LB）。**单机宿主仍是 SPOF**——宿主级冗余/多 AZ/云托管归 S15 买云（§4 范围外）。`claimProductionHA=true` 是否要求宿主冗余=EXEC 双审终裁点（§2.3 判据 B-7〖rev2-R2 勘误→§9-7：「判据 B-7」系悬空引用·应读「判据 B4」〗）。Ban 把单机多副本叙事成「生产 100% HA 已达成」。

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
| **LB** | **全仓 compose 零 LB 服务**（nginx/haproxy/traefik 均无——rg 实证仅注释引宿主 nginx）；唯一代理=**宿主** nginx 单 upstream `127.0.0.1:3000`〖rev2-勘误②→§9-5：「单 upstream」应读「proxy_pass 直连单后端（无 upstream{} 块）」〗 | `ops/deploy/nginx.conf:20-23`；compose.prod.yml:252/:362 注释（funnel→nginx:80→web:3000） |
| 宿主 nginx SSE 面 | `proxy_buffering off` + `proxy_read_timeout 3600s`（单 web·LB 化时须对齐） | ops/deploy/nginx.conf:12-22 |
| 资源信封 | 单机 4G 预览（compose.prod.yml:254 注释）；现占 api512m+worker1g+web512m=**2G**；翻倍+LB≈4.1G+ **超 2c4g 信封** | compose.prod.yml:254-257/:332-333/:365-366；`harness/w2-resource-sizing-receipts.md:32`（2c4g vs 4c8g 对照·sizing≠HA） |
| compose.prod 治理 | 受治理稳定契约——原地改需「successor 记录+多重 digest 重算」重仪式；运行时旋钮走**非治理叠加层**先例 | `docker/compose.prod.override.yml:1-6` |

### 1.2 haStatus 判定面现状

| 面 | 现值 | 锚 |
|---|---|---|
| 判定面形态 | **无计算面**——haStatus 为全仓约 30 处**硬编码常量** `NOT_HA`（scripts/ha/*·proofs·镜像 label），无任何脚本按拓扑实况推导 | `scripts/ha/probe.multi.mjs:340-354`；`docker/Dockerfile.ha-dual:21`（label NOT_HA） |
| fail-closed 现值 | `--require-evidence` **恒 EXIT=1**（「local evidence seen but production topology/CI/review missing — refuse HA」） | probe.multi.mjs:14-18 / :340-354 |
| 现值钉 | `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` | north-star-ha.md:67；LEDGER:136 |
| 既有 dual 工具轨 | api-a/api-b 双 `/livez` compose（**dev bind-mount·`restart: "no"`·无 LB·非生产拓扑**）；INSTANCE_ID 命名先例 | `docker/compose.ha-dual.yml:36-92`（restart :65·INSTANCE_ID :75/:87〖rev2-勘误①→§9-5：实锚 :75/:88·:87 系笔误〗·hc /livez :53-64） |
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

1. **api×2**：显式双 service `api-a`/`api-b`（命名与 INSTANCE_ID 沿 compose.ha-dual.yml:75/:87 先例〖rev2-勘误①→§9-5：实锚 :75/:88〗，机械可判优于 `replicas` 隐式扩缩）；各自 healthcheck `/readyz/api`+`restart: unless-stopped` 沿用 compose.prod.yml:258-263 形；宿主端口回环绑定改 `127.0.0.1:8787/8788` 或全收容器网（保持「api 不 0.0.0.0 暴露」铁律·compose.prod.yml:250-253 注释同口径）。
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
| B2 | 阶 D 三件：ha:probe 类证明 EXIT=0 + CI 绿 + 独立审 ≥2 域 | north-star-ha.md:43〖rev2-R3 锚位注记→§9-8：「≥2 域」限定词锚在 :47/:52（:43 阶 D 行仅载「独立审」）〗 |
| B3 | HA 簇配套收口：R-18/19 优雅停机+R-22 DB 韧性+R-26 备份+R-47 告警 | LEDGER:129-133 |
| B4 | **终裁点**：claimProductionHA=true 是否要求宿主级冗余（S15 买云）。起草席推荐=进程级冗余+故障注入齐⇒haStatus 本体齐；宿主冗余与 claimProductionHA=true 门绑定 S15 | §0.3·LEDGER:136 |
| B5 | releaseEvidence=false 恒约束至 B1-B4 齐〖rev2-R1 勘误→§9-6：「至 B1-B4 齐」应读「至 B1-B4+G7 收据齐」·并增 B6 判据〗+协调方裁定；翻转执行=簇收口刀凭收据，**非本刀** | LEDGER:136 |
| B6 | **翻转前置含 G7**：claimProductionHA=true/releaseEvidence=true 须 **G7 全量本地套件 CMD+EXIT 收据**齐（**追加·rev2-R1**）——G7 已生效≠套件已绿·pins g7SuiteGreen=false 零翻转 | north-star-ha.md:46/:55（硬闸 7「无 G7 全量 CMD+EXIT 收据套件 → forbid 宣称 100% HA」） |

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

## §9 rev2 双审处方落卷（席1 PASS + 席2 FAIL 窄面·append-only·原文零改·改正处附 〖rev2-*〗 勘误注记）

**双席裁决**：**席1 PASS**（RX-1 硬前置+RX-2/3/4）+ **席2 FAIL 窄面**（硬项 R1/R2·建议 R3/R4/R5）——合并落卷=本节+正文 〖rev2-*〗 注记（原文零改·append-only·照 entpay rev2 先例）。席2 转 PASS 条件（R1 判据补 B6+R2 悬空引用勘误）已随卷落。落卷席全部新增锚点实物亲证（grep/sed 实测·base 同 `79285325` 树）：`docker/compose.ha-dual.yml:75/:88`、`ops/deploy/nginx.conf:20-23`、`ai-docs/delivery/north-star-ha.md:43/:46/:47/:52/:55`。

### §9-1（RX-1·席1·硬前置·EXEC 开工条款）
原 api/worker/web **停用机制写死**：compose -f 合载下新增 api-a/api-b/web-a/web-b/worker-a/worker-b **不移除原三 service**（compose.prod.yml 原 `api`/`worker`/`web` 定义仍生效——端口冲突 `up` 必败，或改绑端口后静默 3× 拓扑假绿）。EXEC 实现 `docker/compose.ha.yml` 时须：override 内 profiles 覆盖或等价物停用原三 service **+** ha-status.mjs 副本计数按**显式服务名清单**（api-a/api-b/web-a/web-b/worker-a/worker-b/LB）并附「**原三 service 不在 running**」排除断言（§2.2 判定器输出与 A1-A3 计数不得被旧 service 污染）。

### §9-2（RX-2·席1·EXEC 开工条款）
web-a/web-b 须自带 `HOSTNAME: "0.0.0.0"`（override env 按 service 名合并·**新 service 名不继承**原 `web` 的 env——否则复踩「容器 ID 当监听地址→healthcheck 恒 unhealthy」坑）。EXEC 落 compose.ha.yml 时逐 service 显式写。

### §9-3（RX-3·席1·EXEC 开工条款）
api-a/api-b 注 INSTANCE_ID（**A4/V4 分流观测通道**——响应/日志可辨命中后端·先例 `docker/compose.ha-dual.yml:88`〖勘误①后实锚〗）。

### §9-4（RX-4·席1·可选）
V6 增「**接管后旧 owner 终态写入 CAS 拒 rowCount=0**」断言（双活窗写侧防线实证——worker-a 恢复后对已被 worker-b 接管 job 的终态写必须被 lease_owner CAS 拒·`packages/db/src/report/report.ts:26-35` 同口径）。可选项：EXEC 双审可裁撤·裁撤须落卷理由。

### §9-5（勘误两条·席1·append-only）
- **勘误①**：INSTANCE_ID 实锚 **:75/:88**（本席实物亲证 `docker/compose.ha-dual.yml:75`=api-a·:88=api-b；原文 :75/:87 之 :87 系起草笔误·见 §1.2/§2.1 两处 〖rev2-勘误①〗 注记）。原文零改。
- **勘误②**：「宿主 nginx 单 upstream」应读「宿主 nginx `proxy_pass` 直连单后端（**无 upstream{} 块**）」（本席实物亲证 `ops/deploy/nginx.conf:20-23`=location / 内 `proxy_pass http://127.0.0.1:3000`·全文件无 upstream{} 定义·见 §0.1/§1.1 两处 〖rev2-勘误②〗 注记）。§2.1-3「nginx.conf upstream 升双后端」据此应读「改写为双后端 upstream{}（现无此块·属新增非升级）」。原文零改。

### §9-6（R1·席2·硬·证据链修正）
§2.3 证据链增 **B6**（已随卷入表）：claimProductionHA=true/releaseEvidence=true 翻转前置**含 G7 全量本地套件 CMD+EXIT 收据**（锚 `ai-docs/delivery/north-star-ha.md:46`「不宣称 HA/`releaseEvidence=true`…直至收据齐（**含 G7 全量本地套件收据**）」+ :55 硬闸 7「无 G7 全量 CMD+EXIT 收据套件 → **forbid** 宣称 100% HA」）。B5 措辞勘误（正文 〖rev2-R1〗 注记已附）：「至 B1-B4 齐」应读「至 **B1-B4+G7 收据**齐」。G7 已生效≠套件已绿（north-star-ha.md:48 同口径）·§6 pins g7SuiteGreen=false 零翻转。

### §9-7（R2·席2·硬·悬空引用勘误）
§0.3「（§2.3 判据 B-7）」系**悬空引用**（§2.3 判据编号为 A1-A6/B1-B5（+B6 追加）·无 B-7）→ 应读「（§2.3 判据 **B4**）」（宿主冗余终裁点即 B4）。照 entpay rev2-R4 悬空引用先例·正文以 〖rev2-R2〗 注记承载·原文零改。

### §9-8（R3·席2·建议·B2 锚位注记）
B2 锚「north-star-ha.md:43」：阶 D 行仅载「ha:probe 类证明 + CI 绿 + 独立审」·「≥2 域」限定词锚在 `north-star-ha.md:47`（「关键切片双域对抗」）/:52（硬闸 4「分域独立审·双域对抗」）——B2 锚位读作 :43+:47/:52（正文 〖rev2-R3〗 注记已附）。

### §9-9（R4·席2·建议·EXEC 收据补限流逐流稀释表）
EXEC 收据（§2.2 `receipts/ha1/`）补**限流逐流稀释表**：rate-limit 单实例内存桶（rate-limit.service.ts:4-28·本刀零改）在 ×2 副本下逐流有效上限=2×（signup/report-retry 等逐流列明现值→多副本有效值）——使安全控制强度变化入账·归 R-20/21/23 配套后刀时精确继承（§4-3「只登记不改」缺口按流粒度留痕）。

### §9-10（R5·席2·建议·叠加层诚实注记）
compose.ha.yml 非治理叠加层（§2.1 治理先例 compose.prod.override.yml:1-6）诚实注记：**「惯例无仪式·日后升格治理契约另行裁定」**——本刀叠加层沿既有惯例·不构成治理契约先例扩张；若日后叠加层面扩大·须另立治理裁定。

### §9-11（状态行·处方 11）
尾部 append 状态行（见本档末行）：`draft_rev2:awaiting_dual（席1 PASS+席2 FAIL 窄面处方 11 条落卷·待复审确认后协调方行使 EXEC 授权）`——头部 Status 行（draft:awaiting_dual）为起草时点快照·原文零改。

---

*HA-1 REDUNDANCY REQUEST（起草） · 2026-10-10 · ha1-draft 席 · base `feat/mysql-schema-skeleton` @`df12a054`（主线 tip 亲证） · R-17 P0 haStatus 翻转本体=单机多副本+健康检查+重启自愈+LB+判定面+证据链契约 · 全锚 @df12a054 亲读 · 翻转不归本刀（B5） · est live=0 · pins 十一值零翻转 · markers=0 · ⛔push ⛔动主线仓 ⛔触其他工作树 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*

draft_rev2:awaiting_dual（席1 PASS+席2 FAIL 窄面处方 11 条落卷·待复审确认后协调方行使 EXEC 授权）

executed:awaiting_post_prove_dual（EXEC 续做席 ha1-exec2 落卷 2026-10-10：rev2 处方 11 条全落实（RX-1 profiles 停用+排除断言/RX-2 HOSTNAME/RX-3 INSTANCE_ID/RX-4 CAS 拒 rowCount=0/R4 限流逐流稀释表）·rebase 主线 `049f19e1` 零冲突（分支 tip `c5300f73`）·净栈单遍 V1-V6 全绿+ha-status=**HA_TOPOLOGY_LOCAL_ELIGIBLE**（A1-A6 全绿·rx1Exclusion PASS）·pins 十一值零翻转（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false 维持）·markers=0·est live=0·沙箱已 down 全灭；crash 注入忠实化（引擎 29.1.3 docker kill=manual stop 绕过策略→host-PID-ns SIGKILL）/V6 冻结编舞（假 Key 秒败活窗不可捕捉·接管+CAS 为真产品机械）/V5 composed（驱动窗 attach 停滞·harness 登记）等产品面预存红（VoiceCallPanel.tsx:566 幽灵 lint 规则）等限度与登记详见 `receipts/ha-1/exec-inventory.md` + `verification-matrix.md`·待 post-prove 双审）

rev2-勘误三（HA-1 rev2 勘误落卷席 2026-10-10·双席分歧取严·引席2 FAIL 裁决：`receipts/ha-1/verification-matrix.md` 三处叙述读数 append-only 勘误对齐卷内 JSON（**JSON 为准**·原文零改·〖勘误〗行注承载照 rev2-勘误①②「原文零改·注记承载」先例）——V2 heal 6s/0s/6s→**6s/3s/5s**（v2-kill-heal.receipt.json healSeconds=6/3/5·via docker-health/app-probe/app-probe）/V3 crash 窗 38s→**37s**（v3-failover.receipt.json windowSeconds=37·ha-status.receipt.json:117 判定器步注「failures=0 window=37s」自证）/V6 接管 14s→**15s**（v6-lease.receipt.json takeoverSeconds=15·ha-status.receipt.json:127「takeover=worker-b in 15s」同）；另 verification-matrix.md:7 补「migrate applied=159」与「RestartCount 增量」读数溯源注记（实测产物在 `.tmp/ha-sandbox/` 未入卷·他人重跑路径=ha-status.mjs+ha-sandbox.mjs CMD 行）·零码动·markers=0·⛔push）

---

## nail 落卷（2026-10-10 · post-prove 双席 PASS+勘误确认·附条件收口）

**双审结果**：席1（拓扑/判定器语义）PASS（RX-1 假绿通道独立复现实证结构性封死：profiles 双面反证+判定器显式清单+先置排除断言+fail-closed 实跑 NOT_ELIGIBLE EXIT=1·判定器 A1-A6 对表合格·诚实边界不弱化判定）+席2（编排/治理）FAIL 窄面勘误级（三处叙述读数 vs 卷内 JSON 不一致）→ rev2 勘误落卷 @1339de27（三处对齐 6/3/5·37s·15s+溯源注记·原文零改注记承载）→ 席2 确认「HA-1 可 nail」（md5 字节级证明原文零改·三查全过·无残余）。**双席分歧取严流程闭环**。merge 落主线 @b4b756b4。

**V 矩阵（勘误后读数）**：V1 九 service 拓扑 healthy（migrate 159·RX-1 双面反证）·V2 kill 自愈 **6/3/5s**·V3 failover **37s** 窗 22 探零失败·V4 分流 INSTANCE_ID+X-HA-Upstream 双证·V5 跨副本 SSE 重放恰 ['2'] 零丢失（pg_notify 零 redis 零粘性实证）·V6 接管 **15s**+RX-4 CAS rowCount=0。判定=**HA_TOPOLOGY_LOCAL_ELIGIBLE**（A1-A6 全绿·fail-closed 可复跑）。

**诚实边界（随卷）**：单机进程级冗余·宿主仍 SPOF（B4/S15 终裁留位）·haStatus=NOT_HA 维持（翻转不归本刀·需 G7 收据前置 B6+簇收口 B3+B4 终裁）·V6 行冻结模拟/V5 composed/crash 形态忠实化三登记·资源裁决 A_4c8g（4160MiB·B4/S15 前置入继承面）·叙述数漂移三处以收据 JSON 为准。

**Status**: `nail:closed`（post-prove 双席 PASS+勘误确认·merge 落主线 @b4b756b4·R-17 单机进程级冗余拓扑+判定器正式落主线·HA_TOPOLOGY_LOCAL_ELIGIBLE 可复现判定器在卷·宿主 SPOF 边界与翻转前置如实·markers=0·est live=0）。
