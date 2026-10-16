# REQUEST — **GAP-UC011-REFUND-CALLBACK · product mouth** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`
**Knife**: `harness/gap-uc011-refund-callback-product-mouth.md` · slice `gap-uc011-refund-callback-product-mouth.slice.md`
**Parent tip**: `f43bea1`（full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91` · origin/feat/mysql-schema-skeleton）
**Date**: 2026-10-06

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

## 请审什么（mw-model-op · 计费/回调域 · 零模型调用边界）

Line Z · `GAP-UC011-REFUND-CALLBACK` 产品口。矩阵 `:117` 缺 refund-callback · partial≠covered；backlog `:463-468` Line V nail 明示两 gap stay OPEN · product mouths = other knife；H4/H5 三口 **404**；scenarios E3/A3 + §1b#1。请审：

1. **一刀一产品口**：Path A = 可测口落地（非 404 + `markOrderRefunded`/CAS/幂等 · M1/M2）**或** Path B = 诚实 ADR 降级；口径锚定 scenarios E3/A3 + §1b#1 · Ban 发明验收。
2. **与 Line V / ADV 隔离**：**Ban wash ADV into covered via this REQUEST**；口绿 ≠ ADV covered ≠ 关 `GAP-UC011-ADV-01`；Ban 互借关闭。
3. **EXIT0 ≠ covered**：绿也不自动翻 §1.1 covered；UC-011 stays **partial** 直至独立 covered-lift；coveredCount=8；Ban invent covered。
4. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。
5. **零模型调用：本刀为支付回调产品口，prove/实现不调 live 模型；model-op 审预算面零影响 + Ban 借刀改 model-client** · 计费域关注 paid→refunded CAS / 幂等 exactly-once / 无双退。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
