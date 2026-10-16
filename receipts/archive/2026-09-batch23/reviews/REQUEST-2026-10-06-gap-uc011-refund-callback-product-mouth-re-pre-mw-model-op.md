# REQUEST — **GAP-UC011-REFUND-CALLBACK · product mouth · B-1 re-PRE** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`
**Knife**: `harness/gap-uc011-refund-callback-product-mouth.md` · slice `gap-uc011-refund-callback-product-mouth.slice.md`
**Parent tip**: `fbd47ac`（full `fbd47ac8076d2ccd0a948b88630cb397789e3ef7` · origin/feat/mysql-schema-skeleton）
**PRIOR REQUEST**: `bb1721bd6b3fdf76d5195a463543a9c3bf841d18`
**PRE FAIL**: `bbde3100649d27a056a43ff64f0c7c3c13a28183`（本审 B-1 · Path A 缺具名 status/error codes）
**Line V C-1**: PRE `587b9e0` · POST `0421e5a`
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

## 请审什么（mw-model-op · re-PRE · 关闭 B-1 / C-1 defer）

Line Z · `GAP-UC011-REFUND-CALLBACK` 产品口 · **B-1 docs-only 补钉**。请审（对照本审 FAIL `bbde310`）：

1. **B-1 blocker 关闭**：Path A 是否已钉 —— (1) 错签/缺签 → **403 `bad_signature`**（缺字段 → **400 `invalid_callback`**）(2) 未知 order → **404 `order_not_found`**（≠ 口缺失 404）(3) 金额 → **DISCLOSED** 无通道（UC014 C3）(4) M1 → **200 `refunded`** + DB (5) M2 → **200 `already`** + 无双退 (6) 明文 **Ban any-non-404-4xx-as-sig-evidence**。
2. **与 Line V C-1 对齐**：`587b9e0`/`0421e5a`「口落地后再钉具名码」——本 tip 是否作为产品口刀 **关闭 defer**（合同钉码 · 非已落地宣称）。
3. **对齐既有 commerce 模式**：pins 是否与 `payWebhook`/`payCallback` + UC014 C1/C2/C7 同名码一致（非发明新码）。
4. **不 regress**：Path B · Line V honesty-red · ledger（支付账 ≠ G7 NDJSON）· EXIT0≠covered · pins · forbidden claims。
5. **零模型调用** · Ban 借刀改 model-client · Ban coding product/prove 本 stub · Ban self-approve（alone ≠ dual）· Ban invent covered · Ban wash ADV。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert re-pre-exec dual · B-1 · STOP*
