# REQUEST — **G7 Key-blocked residual honest receipts**（Line AD · Branch A + B′）· POST-PROVE · mw-model-op

**Status**: **`draft:awaiting_post_prove`**（stub only · implementer-authored · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false`
**Expert**: `mw-model-op`
**Line**: **AD** · Date 2026-10-06（Asia/Shanghai）
**REQUEST（pre）**: `f32f56d8f602b9bf9aaa9f708ddbb59d7cef973f`
**PRE dual BOTH PASS**: mw-e2e-ha `f2154387df654b4600b74b4c8a52c1d35f5986b2` + mw-model-op `2d422c14e585c544a162f536cc9b3058a7d14e30`
**CODE_SHA**: **none**（docs-only）
**Exec HEAD（re-attest run）**: `880f14408dda9a9cb03737b811b6005d94c3a2dc`
**PROVE_TIP（receipts commit）**: `f4981cb6f75d5710039915b47e063e9192248da0`
**Receipts**: `ai-docs/delivery/receipts/g7-key-blocked-residual-honest/`（SUMMARY + P1 · P2 · P3×5 · P4）
**Harness**: `ai-docs/delivery/harness/g7-key-blocked-residual-honest.md`（+ execution addendum · P1–P5 rename）
**Prior nail（read-only）**: Line AC `3922b48` · prove tip NAILED TO `7c818c5` · code `160c30c`

## Implementer claim（to be verified · not self-approved）

| CMD | Start (CST) | End (CST) | EXIT | Class |
|-----|-------------|-----------|------|-------|
| `pnpm e2e:isolated` | 13:05:31 | 13:05:42 | **1** | Key-blocked（direct probe） |
| `pnpm e2e:ui:isolated` | 13:05:53 | 13:06:03 | **1** | Key-blocked（stderr verbatim） |
| `pnpm verify:e2e-performance` | 13:06:08 | 13:07:15 | **1** | Key-blocked cascaded（build 0 · migrate:prove 0 · HTTP 1） |

Direct probe EXIT 1/1 · CITE_EXIT 0/0（guard proofs · ≠ e2e pass）· 0 model calls · `actualSpendCny=null`.

## 请审什么（mw-model-op · Ban live 首责 · Key-blocked 诚实）

1. **Ban live（C-MO-AD-1）**：ambient `MODEL_API_KEY` 存在 → 每条 CMD/probe 均 `env -u MODEL_API_KEY -u MODEL_BASE_URL`；`P3-gate-probes.md` 仅录 presence（set→unset）· 值从未打印 · 无 fingerprint · 无 `.env*`（仅按文件名确认不存在）· 0 model calls · `actualSpendCny=null`。
2. **Key-blocked = FAIL/blocked（C-MO-AD-2）**：trio EXIT 1/1/1 · business-assert unknown（null）· `g7SuiteGreen=false`。
3. **直接证据（C-MO-AD-3）**：`P3-direct-probe-e2e-isolated.md` stack frame `run-e2e.mjs:43:52`。
4. **Ban 绕门（C-MO-AD-4）**：零代码改动（CODE_SHA none）· 未改 `run-e2e*.mjs` · 无假 Key / fake-model / 假服务开关。
5. **Unlock ledger（C-MO-AD-5）**：`P4-unlock-ledger.md` 仅列条件 ≠ 授权；Line C `7eb1a7e` ≠ trio；FIX FreeTierOnly ≠ 本刀。
6. **Disclosure-1/R1 OPEN + 命名（C-MO-AD-6）**：P1–P5 命名 · P1-product ≠ gate R1。
7. **ERRATUM（C-MO-AD-7）**：observe=`3424dc1` · removal=`82981ff` · Ban `quota-403=82981ff` · Ban `b1d7b22`@09-23。
8. **Re-pin（C-MO-AD-8）**：package.json `:260/:261/:264` @ `880f144`；AC 收据 NAILED TO `7c818c5` 未改。
9. **C-MO-AD-9**：无 reconciler / spend ledger / MODEL-OP-00 触碰 · Ban buy cloud / Meridian / secrets / force-push / SSOT flip。

## State frozen

Trio **OPEN 1/1/1** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN** · coveredCount=**8** · Key-blocked ≠ pass · zero SSOT flip · Line AC receipts untouched · sibling AE/AF/AG/AH untouched.

本 stub 不授权 nail / SSOT flip / live / `g7SuiteGreen=true`；POST dual BOTH PASS 后由协调方决定是否另开 nail；implementer 不自批。

---

*Stub · Line AD · awaiting mw-model-op post-prove review · STOP*
