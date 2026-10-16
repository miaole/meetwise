# HA-1 验证矩阵 V1-V6 收据账（净栈单遍 + V5 composed · ha1-exec2 · 2026-10-10）

净栈：`down -v` 全灭 → `up` 重建 → 按序 v4→v2→v3→v5→v6（v4 先行：upstream{} 配置期解析，crash 换 IP 前完成分流实证；heal 后 reloadLb 恢复均衡）→ ha-status。授权闸：`MEETWISE_HA_SANDBOX_AUTHORIZED=1`（缺省拒跑 EXIT=1 实证）。

| # | 验证 | 结果 | CMD（EXIT 见收据 CMD 行） | 关键证据 |
|---|---|---|---|---|
| V1 | 多副本起得来 | **PASS** V1_TOPOLOGY_UP | `MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/ha/ha-sandbox.mjs up` EXIT=0 | compose config 静态门 EXIT=0；migrate applied=159；9 service（7 拓扑+2 infra）全 healthy；RX-1 原三不在 ps〖溯源注记：「migrate applied=159」与本表 V2/V5 行「RestartCount 增量」读数系沙箱实测·实测产物在 `.tmp/ha-sandbox/`（未入卷）·他人重跑路径=本表 CMD 列 ha-status.mjs+ha-sandbox.mjs 各 CMD 行〗 |
| V2 | kill 单副本自愈 | **PASS** V2_KILL_HEAL_OK | `… ha-sandbox.mjs v2` EXIT=0 | api-a/web-a/worker-a host-PID-ns SIGKILL×3：crashConfirmed=true×3（RestartCount 增量）·policyRestarted=true×3·heal 6s/0s/6s（compose 同形 readiness 探针）；heal 后 reloadLb〖勘误：heal 6s/0s/6s 原值被收据值取代→6s/3s/5s（v2-kill-heal.receipt.json healSeconds=6/3/5·via docker-health/app-probe/app-probe）〗 |
| V3 | 故障切换 | **PASS** V3_FAILOVER_OK | `… ha-sandbox.mjs v3` EXIT=0 | api-a crash 窗 38s×22 探（readiness+GET /profile 经 LB）failureCount=0（proxy_next_upstream 转交）；heal 回归〖勘误：38s 原值被收据值取代→37s（v3-failover.receipt.json windowSeconds=37·ha-status.receipt.json:117 判定器步注「failures=0 window=37s」自证）〗 |
| V4 | LB 分流 | **PASS** V4_SPLIT_OK | `… ha-sandbox.mjs v4` EXIT=0 | 24 请求 ≥2 upstream（X-HA-Upstream+INSTANCE_ID printenv 双证）；stop api-a 后 20 请求零失败；start+healthy 回归 |
| V5 | SSE 跨副本 | **PASS（composed）** | `bash /tmp/ha1-v5-compose.sh`（逐步 CMD 在 v5-sse.receipt.json） | 跨副本 attach 对（api-a .5/api-b .4）→seq=1 双达（pg_notify 广播·零 redis 零粘性）→SIGKILL 持有后端（RestartCount 2→3）→resume 头 in-band 显示 LB 转交（.5→.4）→Last-Event-ID 重放恰 ['2'] 零丢失 |
| V6 | worker 租约接管+RX-4 | **PASS** V6_LEASE_OK | `… ha-sandbox.mjs v6` EXIT=0 | pin-B→worker-a 独占领取（attempts=1·pin 归因）→行冻结持有者死亡形态（declared）→worker-b 租约过期接管 14s（attempts 1→2）→RX-4 旧 owner CAS 拒 rowCount=0→双 worker 复原 healthy〖勘误：14s 原值被收据值取代→15s（v6-lease.receipt.json takeoverSeconds=15·ha-status.receipt.json:127「takeover=worker-b in 15s」同）〗 |
| 判定 | ha-status | **HA_TOPOLOGY_LOCAL_ELIGIBLE** | `node scripts/ha/ha-status.mjs --sandbox` EXIT=0 | A1-A6 全绿·criteria {A1:true,A2:true,A3:true,A4:true,A5:true,A6:true}·rx1Exclusion PASS·**haStatus=NOT_HA 维持（pin 零翻转）** |

辅助收据：resource-budget.json（选①4c8g·4160MiB·B4/S15 前置）·rate-limit-dilution.json（§9-9 R4）·v1-v6 各 receipt JSON（CMD+EXIT+步骤逐条）·ha-status.receipt.json。

## 登记项（限度·不影响上述 PASS 判据的既录事实）

1. V2/V3/V5/V6 crash 注入形态偏离 REQUEST「docker kill」字面——引擎 29.1.3 kill=manual stop 绕过策略；忠实化详见 exec-inventory.md §二-3。
2. V6 持有者死亡=行冻结模拟（假 Key 秒败使活租约窗不可捕捉·last_error=score_aggregate_empty）；接管/CAS=真产品机械；worker 真实 crash 由 V2 另证。
3. V5 composed 运行（驱动窗 SSE attach 停滞·harness 登记待归账）；产品 SSE 路径直连探针 45-104ms 恒康。
4. web 沙箱构建 --no-lint：产品面预存 lint 红（VoiceCallPanel.tsx:566 幽灵规则·自 initial commit 在）——零改产品码零改 config。
5. ha-status.mjs A4 宿主 nginx 上游≥2 读取 ops/deploy/nginx.conf web_pool（本刀 M 新增·宿主未应用——est live=0，宿主应用另行授权）。

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · est live=0 · markers=0
