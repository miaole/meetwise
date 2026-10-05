# REQUEST — **GAP-UC011-ADV-01 · main mouth wiring + ADV** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT 契约焦点）

Line V · `GAP-UC011-ADV-01` 主口真接线 + ADV 证据（协调方优先级 #1）。Z 线 `a356d66` 只钉了 Path A mouth（CODE `bf1fdb2` · EXIT0≠covered）；主口 `POST /payment/refund-callback` 仍 404（本树读码 = 路由缺失，无 `/payment` 控制器 · 非 guard 关闭）；ADV INV 过时（Line V proof `:86-94`）。请审：

1. **主口接线合同**：薄 controller 适配 + 委托 `refundWebhook` 既有管道（400/403/404/CAS/409/200 单管道）；**推荐共用管道、否决各自守卫**——两入口关系交你裁；body 携带 `{orderId, providerTxn, sig}`（无 path id 契约差异 · Ban 从 providerTxn 反查单弱化签名绑定）；无登录态 + HMAC fail-closed + owner-gateway（Ban 挂 PrincipalGuard 冒充接线）；**Ban 借口改其他 commerce 路径**冒充主口。
2. **ADV 七类 + 回归**：A1 403 `bad_signature` / A2 400 `invalid_callback` / A3 夹带金额 DISCLOSED 结构断言 / A4 同单重放 `refunded`→`already` 无双退 / A5 跨订单 409 `order_conflict` / A6 并发恰一次 / A7 未知单 404 `order_not_found`（≠ mouth-missing）；拟 CMD `uc011:refund-callback-adv:prove` 隔离壳三层（同 `uc014:webhook-adv:prove` 先例）；**Z mouth 回归** `uc011:refund-callback:prove` 须保持 EXIT 0（Path A 不回退 · Ban 修其断言迁就）。
3. **EXIT 契约与诚实失败路径**：EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 `GAP-UC011-ADV-01`；EXIT1 保留 OPEN · attempts 全记录 · **Ban retry-to-green** · Ban 把 EXIT1 记成 flake；审计 residual（GuardrailHit absent）沿 K/UC014 口径 **disclosed-not-blocking** · 不作 EXIT 门槛 · Ban 假称已接。
4. **历史证据边界**：Line V honesty-of-red nail（tip `79825b2`）与 Line Z mouth nail（tip `244b812`）历史保留原样 · Ban 重写/删除 · Ban 宣称被推翻；**禁把 Z mouth EXIT0 洗成 covered**；新鲜 INV 取代过时 old-INV 作证据，不碰旧文件。
5. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004/014/026/002；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · `GAP-UC011-ADV-01` stays **OPEN**（本刀不预 claim 关闭）· Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
