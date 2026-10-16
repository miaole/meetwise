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

---

# RE-PRE-EXEC dual · GAP-UC011-REFUND-CALLBACK · product mouth · B-1 fix · mw-e2e-ha（docs gate only · Ban coding · Ban prove · Ban wash ADV→covered · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-model-op`）
**Review date**: 2026-10-06 ~00:16 CST（Asia/Shanghai · UTC+8）
**被审 tip**: `54b2058`（`54b20583fdc828ca43f2c9dbbc9e35060dce7dff` · docs-only B-1 pins · parent `fbd47ac`）
**Parent cited**: `fbd47ac`（`fbd47ac8076d2ccd0a948b88630cb397789e3ef7`）· **match**
**PRIOR REQUEST**: `bb1721b` · **PRE FAIL**: `bbde310`（mw-model-op · Path A missing C-1 named status/error codes）
**Prior e2e PASS on PRIOR tip**: `67bfd1e`（**不**代签本 tip · alone ≠ dual）
**Peer**: `mw-model-op` re-pre stub PENDING · alone ≠ dual · 不代签
**本审未跑**: 零 product coding · 零 prove · 零 live · 零 `.env*` · 零 SSOT edit · 零 git config · 零 force-push

## Docs-only

`git show --stat 54b2058`：**4 markdown**，+136/−20，无代码 / migration / script / package.json。

| Path |
|------|
| `ai-docs/delivery/harness/gap-uc011-refund-callback-product-mouth.md` |
| `ai-docs/delivery/gap-uc011-refund-callback-product-mouth.slice.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-06-gap-uc011-refund-callback-product-mouth-re-pre-mw-e2e-ha.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-06-gap-uc011-refund-callback-product-mouth-re-pre-mw-model-op.md` |

## B1_PINS 核（相对 FAIL `bbde310` · Path A C-1 补钉）

PRIOR `bb1721b` harness：**无**具名 `bad_signature` / `invalid_callback` / `order_not_found` · EXIT0 可读成「任意非-404」。本 tip harness §B-1 / C-1 pins 表（:54–70）+ Ban 段（:107）**关闭该 defer**：

| B1_PIN | Required | Harness | Ruling |
|--------|----------|---------|--------|
| signature → 403 `bad_signature` | 错签/垃圾签/缺签验签失败 | :61 **403** + **`bad_signature`** · 零副作用 | ✓ |
| missing fields → 400 `invalid_callback` | 缺 `sig`/`providerTxn`/空 body | :60 **400** + **`invalid_callback`** | ✓ |
| unknown order → 404 `order_not_found` | ≠ mouth-missing 404 | :62 **404** + **`order_not_found`** · 明示 ≠ H4/H5 口缺失 404 | ✓ |
| amount mismatch → DISCLOSED | 无金额通道 · 对齐 UC014 C3 | :63 **DISCLOSED** · body=`{providerTxn,sig}` only · Ban 假称已复核 | ✓ |
| M1 → 200 `{ result: 'refunded' }` | 合法首次退 | :64 **200** + **`{ result: 'refunded' }`** + paid→refunded CAS | ✓ |
| M2 → 200 `{ result: 'already' }` | 同键重放 · 无双退 | :65 **200** + **`{ result: 'already' }`** · 无双退快照 | ✓ |
| Ban any-non-404-4xx-as-sig-evidence | 拒签须机检具名码 | :68 / :70 / :107 明文；EXIT0= pins 表全命中 · **不是**「任意非-404」 | ✓ |

Slice B-1 表（:15–26）与 harness 对齐。Align payWebhook / UC014 C1/C2/C7 / Line V C-1 `587b9e0`/`0421e5a` 已写。

## 检查表

1. **B-1 / Path A C-1**：上表全命中 · Ban any-non-404-4xx-as-sig-evidence 明文 · EXIT0 机检门槛改为 pins 表全命中。相对 `bbde310` blocker **已关**。✓
2. **Path A vs Path B**：仍清晰两选一（:44–80）；未授权前只 REQUEST；双 path EXIT0≠covered · UC-011 stays partial。✓
3. **与 Line V / ADV 边界**：不重开 ADV prove；Ban wash ADV into covered；Ban 互借关 `GAP-UC011-ADV-01`；口绿 ≠ ADV covered；ADV stays gap/case-only。✓
4. **EXIT0 ≠ covered**：绿也不翻 §1.1 covered；UC-011 stays **partial**；coveredCount=**8**；Ban invent covered。✓
5. **Pins 原值**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503。无漂移。✓
6. **alone ≠ dual** · Ban coding · Ban prove · Ban live · Ban self-approve · Ban self-nail · prior `67bfd1e` 不代签本 tip。✓

## Blockers

无（相对 `bbde310` B-1 Path A C-1 · 本 tip 已补钉）。

## Conditions

- **C-1**：alone ≠ dual；不代签 peer（`mw-model-op` re-pre stub PENDING）。
- **C-2**：pins 冻结；UC-011 stays partial · ADV stays gap/case-only · coveredCount=8 · Ban invent covered · Ban wash ADV→covered。
- **C-3**：本 PASS ≠ coding ≠ prove ≠ nail ≠ HA；写码/prove 须双签齐 + 协调方授权。
- **C-4**：Ban any-non-404-4xx-as-sig-evidence 保留为 prove 硬门槛；拒签真证据 = 403 `bad_signature`（或缺字段 400 `invalid_callback`）。
- **C-5**：EXIT0 ≠ covered ≠ 独立 covered-lift；Path B ADR 仍 ≠ covered；Ban 互借关 `GAP-UC011-ADV-01`。
- **C-6**：范围锁本刀产品口（Path A 或 B）；Ban UC-018/052/025/004；Ban live/SSOT/HA/假绿/retry-to-green/self-nail。
- **C-7**：M1 body「或等价具名成功体」须在实现/prove 钉死同形 `{ result: 'refunded' }`——合同已钉首选形 · 非 blocker。

## 中文三行摘要

1. tip `54b2058` docs-only 补钉关闭 `bbde310` B-1：Path A 具名码全钉（403 bad_signature · 400 invalid_callback · 404 order_not_found · 金额 DISCLOSED · M1 200 refunded · M2 200 already）+ Ban any-non-404-4xx-as-sig-evidence。
2. Path A/B 两选一仍清晰；Line V ADV 隔离硬钉；EXIT0≠covered · UC-011 stays partial · coveredCount=8 · Ban wash ADV→covered。
3. Blockers 无。本 PASS = docs 半签；alone≠dual（peer PENDING）；≠ coding ≠ prove ≠ nail ≠ HA。

Verdict: PASS
