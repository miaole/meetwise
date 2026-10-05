# REQUEST — **GAP-UC011-ADV-01 · main mouth wiring + ADV** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`（commerce/支付域）
**Knife**: `harness/gap-uc011-adv-main-mouth-wiring.md` · slice `gap-uc011-adv-main-mouth-wiring.slice.md`
**Parent tip**: `6b878da`（full `6b878dad09ac77c8b248dd27c13cb38a670f4dad` · feat/mysql-schema-skeleton = origin tip）
**Date**: 2026-10-05

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-model-op · 计费/回调/支付域 · 零模型调用边界）

Line V · `GAP-UC011-ADV-01` 主口真接线 + ADV 证据（协调方优先级 #1）。Z 线 `a356d66` 只钉了 Path A mouth（CODE `bf1fdb2` · EXIT0≠covered）；主口 `POST /payment/refund-callback` 仍 404（本树读码 = 路由缺失 · 非 guard 关闭）；ADV INV 过时。请审：

1. **管道共用与安全模型（支付域焦点）**：主口薄适配 + 委托 `refundWebhook` **同一管道**（HMAC `${id}:${txn}:refunded` fail-closed · `gateway_payment_order_owner` owner-gateway · `markOrderRefunded` CAS + `refund_provider_txn` NOT EXISTS + 23505→409 + FIFO 红冲）——推荐共用管道、否决各自守卫（复制 HMAC/owner/CAS = 安全关键重复面），交你裁；Ban 挂 PrincipalGuard；Ban 从 providerTxn 反查单弱化签名↔订单绑定；Ban 改 payWebhook/payCallback/refundWebhook 既有语义；Ban 借口改其他 commerce 路径。
2. **七类 ADV 攻击面覆盖**：403/400/DISCLOSED/`already` 无双退/409 跨订单/并发恰一次/404 未知单——断言须机检 exact status + named code + DB before/after 快照（含红冲恰一次、`refund_provider_txn` 恰 1 行）；A3 夹带金额须如实 DISCLOSED（无金额通道 = 结构性，Ban 改口「已实现金额复核」）。
3. **EXIT0 ≠ covered**：EXIT0 ≠ ADV 翻行 ≠ 关 `GAP-UC011-ADV-01` ≠ §1.1 covered；EXIT1 保留 OPEN · attempts 全记录 · Ban retry-to-green；审计 residual（GuardrailHit absent）disclosed-not-blocking（K/UC014 口径）。
4. **历史证据边界**：Line V（`79825b2`）/ Line Z（`244b812`）nail 历史保留 · Ban 重写；**禁把 Z mouth EXIT0 洗成 covered**；Z mouth 回归须保持 EXIT 0。
5. **零模型调用**：本刀为支付回调主口接线 + ADV prove，实现/prove 不调 live 模型；model-op 审预算面零影响 + **Ban 借刀改 model-client**；计费域关注 paid→refunded CAS / exactly-once / 无双退不因主口第二入口破坏（两入口打到同一 CAS 键）。
6. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004/014/026/002；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · `GAP-UC011-ADV-01` stays **OPEN**（本刀不预 claim 关闭）· Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
