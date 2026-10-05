# REQUEST — **GAP-UC011-REFUND-CALLBACK · product mouth · B-1 re-PRE** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc011-refund-callback-product-mouth.md` · slice `gap-uc011-refund-callback-product-mouth.slice.md`
**Parent tip**: `fbd47ac`（full `fbd47ac8076d2ccd0a948b88630cb397789e3ef7` · origin/feat/mysql-schema-skeleton）
**PRIOR REQUEST**: `bb1721bd6b3fdf76d5195a463543a9c3bf841d18`
**PRE FAIL**: `bbde3100649d27a056a43ff64f0c7c3c13a28183`（mw-model-op · B-1 Path A C-1）
**Prior e2e PASS on PRIOR tip**: `67bfd1e`（docs gate · **不**代签本 tip · alone ≠ dual）
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

## 请审什么（mw-e2e-ha · re-PRE · B-1 pins 焦点）

Line Z · `GAP-UC011-REFUND-CALLBACK` 产品口 · **B-1 docs-only 补钉**（PRIOR `bb1721b` · FAIL `bbde310`）。请审：

1. **B-1 / Path A C-1 pins**：harness 是否在 coding dual 前钉死 exact **HTTP status + named error code** —— 错签 **403 `bad_signature`** · 缺字段 **400 `invalid_callback`** · 未知单 **404 `order_not_found`** · 金额 **DISCLOSED**（无金额通道）· M1 **200 `refunded`** · M2 **200 `already`**；对齐 payWebhook / UC014 / Line V C-1 `587b9e0`/`0421e5a`。
2. **Ban any-non-404-4xx-as-sig-evidence**：是否明文禁止把「任意非-404 4xx」当验签真证据；EXIT0 机检门槛是否改为 pins 表全命中（非「任意非-404」）。
3. **不 regress 既有 PASS 点**：Path B ADR · Line V honesty-red 边界 · ledger 边界 · EXIT0≠covered · pins 原值 · forbidden claims · alone≠dual。
4. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）；Ban invent covered；Ban wash ADV into covered。
5. **docs-only**：本 tip 仅 harness/slice/re-PRE stubs · 零产品码。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert re-pre-exec dual · B-1 · STOP*
