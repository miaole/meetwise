# Slice — **GAP-UC011-ADV-01 · 主口真接线 + ADV 证据**（Line V · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · alone ≠ dual · pre-exec 双审 PASS 后由协调方授权 coding）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base**: `feat/mysql-schema-skeleton` · `6b878dad09ac77c8b248dd27c13cb38a670f4dad`（= origin tip · fetch EXIT=0 无新对象）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-v` · branch `line/v-uc011-adv-main-mouth`
**Authority**: meetwise — L0 docs only · Ban coding product · Ban prove 执行 · Ban self-approve · Ban invent covered · Ban wash · Ban 顺手洗绿

## One-line

`GAP-UC011-ADV-01`（协调方优先级 #1）：Z 线（`a356d66` NAIL）只钉了 Path A mouth `POST /commerce/webhook/refund/:id`（CODE `bf1fdb2` · EXIT0 41/41 · **EXIT0≠covered**）；scenarios 契约主口 **`POST /payment/refund-callback` 仍 404**（本树读码 = **路由缺失**：全仓无 `/payment` 控制器，非 guard 关闭）；**ADV INV 过时**（Line V proof `:86-94` 三条「无 refund 面」INV 在 `bf1fdb2` 后不再成立）。本刀（Line V）求：**主口真接线**（薄 controller 适配 + 委托 `refundWebhook` 既有 HMAC fail-closed + owner-gateway + exactly-once CAS 单管道 · 与 Z mouth 关系交双审裁）+ **主口 ADV 七类真证据**（403/400/DISCLOSED/already/409/恰一次/404）+ **Z mouth 回归**（Path A 不回退）+ **新鲜 INV**（不改 Line V/Z 历史证据）。**EXIT0 ≠ covered** · UC-011 stays **partial** · **GAP-UC011-ADV-01 stays OPEN（本刀不预 claim 关闭）** · Ban 互借关 · Ban wash。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc011-adv-main-mouth-wiring.md` |
| Dual PRE stub `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-uc011-adv-main-mouth-wiring-mw-e2e-ha.md` |
| Dual PRE stub `mw-model-op` | `reviews/REQUEST-2026-10-05-gap-uc011-adv-main-mouth-wiring-mw-model-op.md` |

## Scope / Not

只做主口 `POST /payment/refund-callback` 真接线 + 主口 ADV 七类 prove（拟 CMD `uc011:refund-callback-adv:prove` · 隔离壳三层同 `uc014:webhook-adv:prove` 先例）+ Z mouth 回归 的 docs REQUEST。Not covered-lift · Not ADV 列翻行 · Not balance-ui · Not wallet · Not SSOT flip · **Not coding product（本 commit）** · Not UC-018/052/025/004/014/026/002 · Not PERF/LOAD。验收锚 scenarios E3/A3/契约 `:253` + UC014 七类先例 + Line Z B-1 pins · Ban 发明验收。

## Ban

Ban coding product · Ban prove 执行 · Ban push · Ban covered · Ban invent covered · **禁把 Z mouth EXIT0 洗成 covered** · Ban 翻 SSOT 行（零矩阵/backlog/checklist diff）· Ban flip UC-011（stays partial · coveredCount=8）· Ban 借口改其他 commerce 路径冒充主口 · Ban 第三等价路径 · Ban 挂 PrincipalGuard 冒充接线 · Ban 从 providerTxn 反查单弱化签名绑定 · Ban 复制守卫未裁先写 · Ban 改 Line V/Z 历史 proof 与既有 neg-commerce/full.e2e 断言 · Ban 改 payWebhook/payCallback/refundWebhook 既有语义 · Ban 新迁移 · Ban 互借关 `GAP-UC011-ADV-01` · Ban audit residual 假称已接（absent = disclosed-not-blocking · K 线口径）· Ban Meridian · Ban HA cloud buy · Ban secrets/`.env*` · Ban retry-to-green（attempts 全记录 · EXIT1 保留 OPEN）· Ban self-approve（alone ≠ dual）· Ban self-nail。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503.

---

*Slice · GAP-UC011-ADV-01 · Line V · main mouth wiring · 2026-10-05 · draft:awaiting_pre_exec_dual · Ban coding · Ban prove · Ban push · EXIT0≠covered · ADV stays OPEN · releaseEvidence=false · STOP*
