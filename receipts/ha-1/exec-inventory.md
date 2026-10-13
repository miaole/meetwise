# HA-1 EXEC 续做席收据 — 盘点表 · RX 落实 · 补完清单（ha1-exec2 · 2026-10-10）

前席（卡死 160 分钟被停）留半成品实现卷；本席续做：盘点→rebase→补完→验证矩阵→收据→commit。
base：rebase 后 `line/ha-1-redundancy` tip `c5300f73`（rev2 落卷重放于主线 `049f19e1` 之上·主线 8 提交全不触本刀文件面·rebase 零冲突）。

## 一、前席卷盘点（已完/半完/缺）

| 面 | 前席状态 | 本席处置 |
|---|---|---|
| docker/compose.ha.yml 七 service（api-a/api-b/worker-a/worker-b/web-a/web-b/lb） | **已完**（RX-1 profiles 停用原三·RX-2 HOSTNAME·RX-3 INSTANCE_ID·资源裁决选①头注·web-b 端口旋钮·§9-10 诚实注记） | LB 镜像换 `nginxinc/nginx-unprivileged:1.27-alpine@sha256:65e3e85d…`（官方镜像 master 需 CHOWN/SETUID 与 cap_drop ALL 锚冲突·chown EPERM emerg 实证；unprivileged 零权能·安全锚零弱化） |
| docker/lb.nginx.conf（api_pool 双后端+X-HA-Upstream+被动探活+SSE 对齐） | **已完** | 零改 |
| ops/deploy/nginx.conf（upstream web_pool 新增·勘误②口径） | **已完**（M） | 零改 |
| docker/compose.ha.sandbox.yml（ha-pg/ha-redis 一次性+migrate 改绑+七 service 沙箱材质） | **半完**（三处沙箱材质缺陷致 up 必败） | ①ha-pg 镜像→`pgvector/pgvector:pg16`（0001_baseline.sql:282 CREATE EXTENSION vector 必需）②成本治理 observe 逐 service 覆写（model-cost-governance.ts:122 开发态设计默认·compose.ha.yml 生产锚 enforce 不动）③web 材质弃 next dev（dev 双副本共写 .next 腐化+进程自灭实证）改 standalone 生产同形（`node apps/web/server.js`·RX-2 HOSTNAME 契约由此被真实检验） |
| scripts/ha/ha-status.mjs（A1-A6 判定器） | **半完**（compose ps 少 `compose` 子命令——`unknown flag: --env-file`） | 修复 |
| scripts/ha/ha-sandbox.mjs（up/v2-v6/down 驱动） | **半完**（5 处运行必败点） | 见下「补完清单」 |
| receipts/ha-1/ | **缺**（从未产出） | 全部落卷（本目录） |
| 本地镜像 meetwise-backend:ha-dual-local | 已构建 | 复用 |
| .npmrc（supported-architectures darwin/linux+arm64） | 已建·未装效 | `pnpm install --frozen-lockfile --force` 补齐 linux-arm64 平台二进制（esbuild/@swc/core/@next/swc/sharp 等 18 包·lockfile 零变更）；**按文件内自注不 commit**（沙箱本机 helper） |

## 二、本席补完清单（码面全部限于 scripts/ha/ha-sandbox.mjs · scripts/ha/ha-status.mjs · docker/compose.ha.sandbox.yml · docker/compose.ha.yml lb 镜像行·产品码零改）

1. **v5/v6 隐私触发器契约**：0059/0062 BEFORE INSERT/UPDATE 触发器要求 `current_setting('app.principal_user')`=owner——新增 `psqlOwner()`（`set_config` 与产品路径 principal.ts:950 同形·首行剥离）；v5 interview_event 两插、v6 ai_report 插+RX-4 CAS 全部走 it。
2. **psql `-q`**：psql 16 `-c` 模式把命令标签（INSERT 0 1）混入 stdout——等值断言必败（前席从未跑到此的潜伏点）。
3. **crash 注入忠实化**：docker kill API 在引擎 29.1.3 记 manual stop——unless-stopped 策略被绕过（三副本实证 RestartCount=0）；容器内 kill -9 1 对 PID1 无效（内核丢弃 ns 内终止信号·实证）。改 `--pid=host` 助手容器对 `.State.Pid` 发 SIGKILL（chaos 标准形态·dockerd 未参与→引擎分类 crash→真实策略重启·实证 restarts+1）；死亡观测=RestartCount 增量（Running=false 窗仅 ~100ms 必漏）。
4. **heal 双通道判定**：docker .Health 为主；引擎停摆形态（kill 系遗留·探针日志冻结而 app 已 ready·未杀对照组持续探针）以 compose 同形命令 app 探针 2/2 记真实自愈点+纠偏 docker restart 恢复记账（收据记录 engineFrozen/engineCorrectiveRestart）。
5. **v6 确定性编舞**：假 Key 秒败（last_error=score_aggregate_empty·模型调用前本地失败）使活租约窗不可捕捉——改为 pin-B（落行前停 worker-b）→worker-a 独占领取（归属必然）→行冻结为持有者死亡后形态（declared simulation）→仅 worker-b 在场→真·租约过期接管（attempts 1→2·14s）→真·RX-4 CAS 拒（rowCount=0）→双 worker 复原。接管/CAS 响应=纯产品机械；worker 真实 crash 自愈由 V2 另证。
6. **v5 探针修复**：X-HA-Upstream 剥端口（ipToService）；helper 头到达即落盘（attach 归属不依赖首事件）；零缓冲判据读 firstEventMs（atMs 系绝对时间戳）；attach 对短命 6-15s+轮间零重叠（interview SSE 槽 per-key=5·重叠轮 429 实证）；signup 429 退避重试（signup:ip 桶 LB 后同源共享）。
7. **LB 均衡运维缓解**：upstream{} 配置期一次性解析副本 IP——heal 后 `nginx -s reload` 重解析（动态 resolver 方案弃用：变量 proxy_pass 无 upstream 块即无被动探活，削弱 V3 零失败窗）。

## 三、RX 落实对账（rev2 §9 十一条）

| RX | 要求 | 落实 |
|---|---|---|
| §9-1 RX-1 | 原三 service 停用机制+判定器显式清单+排除断言 | compose.ha.yml profiles:["ha-disabled"]（默认排除实证：merged config 无原三·`--profile ha-disabled` 反证现形 3）；ha-status/sandbox 显式清单 api-a/api-b/web-a/web-b/worker-a/worker-b/lb + 「原三不在 running」断言（RUN PASS） |
| §9-2 RX-2 | web-a/web-b 逐 service HOSTNAME=0.0.0.0 | ✓ 且沙箱 standalone 运行形态使契约被真实检验（docker 注 HOSTNAME=容器 ID·缺显式覆盖即绑容器 ID） |
| §9-3 RX-3 | api-a/api-b 注 INSTANCE_ID | ✓（printenv 收据 v4.receipt instanceIds；worker-a/b 亦注） |
| §9-4 RX-4 | V6 接管后旧 owner CAS 拒 rowCount=0 | ✓ 已实现未裁撤（v6-lease.receipt rx4CasRowCount=0） |
| §9-5 勘误①② | 锚位勘误 | rev2 卷内已落（前席） |
| §9-6 R1 | 证据链增 B6（G7 全量收据前置） | rev2 卷内已落；本刀不翻转任何 pin |
| §9-7 R2 | 判据 B-7 悬空引用勘误→B4 | rev2 卷内已落 |
| §9-8 R3 | B2 锚位注记 | rev2 卷内已落 |
| §9-9 R4 | EXEC 收据补限流逐流稀释表 | rate-limit-dilution.json（13 流现值→×2 有效值·逐锚） |
| §9-10 R5 | 叠加层诚实注记 | compose.ha.yml 头注（前席） |
| §9-11 | 状态行 | 本 REQUEST 尾部 append executed:awaiting_post_prove_dual |

## 四、资源裁决（§2.1-6 二择一·落卷）

**选①宿主升 4c8g**。per-replica mem_limit 与 compose.prod.yml 现值逐项相同（api 512m×2/worker 1g×2/web 512m×2）+lb 64m=4160MiB：超现 2c4g/4G 预览信封、入 W2 对照 4c8g 档。理由：减半把 OOM 可用性风险永久烘进 HA 工件（恰是要修的面）；本刀 est live=0 不落生产宿主故不构成静默超售。**前置：任何生产应用/翻转前必须先完成宿主升 4c8g**（resource-budget.json·B4/S15 继承面）。

## 五、验证限度与登记（诚实边界）

1. **V2/V3/V5/V6 crash 语义偏离 REQUEST 字面**：docker kill API 在引擎 29.1.3 = manual stop（策略绕过）——忠实 crash 以 host-PID-ns SIGKILL 承载（V2/V3）与行冻结模拟（V6·接管/CAS 为真产品机械）；真实 worker crash+策略重启另由 V2 全链证。
2. **V5 为 composed 运行**（驱动窗内 SSE attach 间歇停滞：无响应头·窗外秒回·reload/settle 不解·直连两副本 45-104ms 恒康——harness 形态登记待归账；产品 SSE 路径由直连探针与 composed 全链证）。证据链：跨副本 attach 对（.5/.4 互异）→seq=1 双达（pg_notify 广播·零 redis 零粘性）→SIGKILL 持有后端→LB proxy_next_upstream 转交（resume 头 in-band 实证）→Last-Event-ID 重放恰 ['2'] 零丢失。
3. **web 沙箱构建 `--no-lint`**：构建期 lint 预存红（VoiceCallPanel.tsx:566 inline disable 引用 repo 从未安装的 react-hooks/exhaustive-deps·自 initial commit 9c92826e 即在·生产镜像构建同撞）——产品面预存红登记待归账，零改产品码零改 next.config。
4. **单机宿主 SPOF 照实存在**；haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false 全程零翻转；est live=0（零生产操作·零真实流量·零模型计费外呼——沙箱假 Key·报告任务模型调用前本地失败）。

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · markers=0 · est live=0
