# RE-PRE-EXEC · mw-model-op · GAP-UC011-REFUND-CALLBACK product mouth（Line Z · B-1）

**Verdict**: **PASS**（B-1 **关闭** · docs-only · **不**授权 coding · **不**授权 prove · alone ≠ dual · **≠** covered · **≠** 产品口已落）  
**Role**: `mw-model-op`  
**Date**: 2026-10-06 ~00:20 CST（Asia/Shanghai · UTC+8）  
**Tip**: `54b20583fdc828ca43f2c9dbbc9e35060dce7dff`  
**Git parent**: `fbd47ac8076d2ccd0a948b88630cb397789e3ef7`（match harness）  
**PRIOR REQUEST**: `bb1721bd6b3fdf76d5195a463543a9c3bf841d18`  
**Prior FAIL**: `bbde3100649d27a056a43ff64f0c7c3c13a28183`（B-1 Path A C-1）  
**Line V C-1**: PRE `587b9e0` · POST `0421e5a`  
**Branch**: `feat/mysql-schema-skeleton`  
**Kind**: static docs re-pre-exec · Ban live · **未**跑 prove  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

**Coding authorized**: **no** · **Prove authorized**: **no**

---

## 1. Docs-only

`git show --stat 54b2058`：**4 markdown**（harness + slice + 2 re-PRE stubs），**无** code / script / package.json。

相对 `bb1721b` 的更宽历史含他线 docs（AC/NHP-001/025 等），**本 tip 自身**仅 Line Z B-1 四文件。

## 2. B-1 closure — each B1_PIN

Source: `harness/gap-uc011-refund-callback-product-mouth.md` B-1/C-1 pins 表（约 :54–66）+ Ban（约 :67–69, :107）+ slice 摘要表。

| B1_PIN | Doc | Ruling |
|--------|-----|--------|
| **403 `bad_signature`**（错签/垃圾签/验签失败） | harness 表行「错签…」→ **403** / **`bad_signature`** · 零副作用 | **CLOSED** · 对齐 `commerce.service.ts` payWebhook + UC014 C1 + Line V C-1 |
| **400 `invalid_callback`**（缺字段/畸形） | 表行「缺字段」→ **400** / **`invalid_callback`** | **CLOSED** |
| **404 `order_not_found`** ≠ 口缺失 404 | 表行明文「**≠** H4/H5 口缺失 404」·「口已挂载后的验签后查单失败」；HTTP 口合同改为「口已挂载」非「非 404」 | **CLOSED** · route-404（`Cannot POST`）不得记为 `order_not_found` 证据 |
| **金额 DISCLOSED** | 「结构性无金额通道」· body=`{providerTxn,sig}` · Ban 假称金额复核 · 日后有字段须另钉码 | **CLOSED as honest gap** · **≠** covered · 对齐 UC014 C3 |
| **M1** → **200** `{ result: 'refunded' }` + paid→refunded CAS / 权益红冲一次 | 表行 M1 | **CLOSED**（合同钉码 · 非已实现宣称） |
| **M2** → **200** `{ result: 'already' }` + **无双退** DB | 表行 M2 · EXIT0 门槛含零双退快照 | **CLOSED** |
| **Ban any-non-404-4xx-as-sig-evidence** | 专段 + Ban 列表 + EXIT0 门槛「不是任意非-404」· 拒签须机检 **403 `bad_signature`**（或缺字段 **400 `invalid_callback`**） | **CLOSED** · 关闭 Line V C-1 defer |

**expired sig**：表未单列「expired」行；验签失败归入 **403 `bad_signature`**（与现 pay HMAC fail-closed 一致）。**Condition C-exp**（非 blocker）：若产品日后引入独立 expiry 语义，须另钉具名码后再认绿。

**Align payWebhook**：树内 `apps/api/.../commerce.service.ts` 确有 `invalid_callback` / `bad_signature` / `order_not_found`；pins **复用同名**，非发明。

## 3. Other rulings

| Point | Ruling |
|-------|--------|
| Path B ADR | **PASS** · 仍 Ban 无 ADR 假关 / ADR 洗 covered |
| EXIT0 ≠ covered · coveredCount=8 | **PASS** · UC-011 stays partial · ADV stays gap/case-only · Ban wash ADV |
| Line V EXIT1/404 honesty | **PASS** · 不改写 V nail · 口绿 ≠ ADV covered ≠ 关 `GAP-UC011-ADV-01` |
| Ledger | **PASS** · payment_order / entitlement / Consumption CAS · **≠** G7 NDJSON / reconciler |
| Pins exact | **PASS** |
| Forbidden HA/R1/G7/A3/MODEL-OP-00 | **PASS** · 无此类宣称 |
| Scenarios cite | **PASS** · 已改为 `:248-258`（修先前 `:238` 漂移） |

## Blockers

无（相对 prior FAIL `bbde310` 的 B-1）。

## Conditions（later coding / prove · Dual PASS 仍不够）

1. **C-auth**：本 PASS ≠ coding ≠ prove；须 mw-e2e-ha re-PRE 同 tip PASS + 协调方授权后才可 Path A 实现。  
2. **C-impl**：实现须机检上表全部适用行；口未挂载 → EXIT1；Ban 用 route-404 冒充 `order_not_found`。  
3. **C-amount**：金额保持 DISCLOSED 直至另钉码。  
4. **C-exp**：独立 expiry 码若需要则另钉。  
5. **C-dual**：alone ≠ dual · EXIT0 ≠ covered · Ban invent covered · Ban wash ADV · Ban 互借关 `GAP-UC011-ADV-01`。

## Non-claims

Not coding auth · not prove auth · not 产品口已落 · not covered · not ADV green · not HA · not MODEL-OP-00 · B-1 关闭 ≠ 实现完成

---

Verdict: PASS
