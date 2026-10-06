# REQUEST — **G7 Key-blocked residual honest receipts**（Line AD · Branch A + B′）· POST-PROVE · mw-e2e-ha

**Status**: **`draft:awaiting_post_prove`**（stub only · implementer-authored · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false`
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha · EXIT 诚实 / 残余分类 / 独立重跑可选）

1. **Trio EXIT 1/1/1 诚实**：`P3-re-attest-*.md` 各恰一次（13:05:31 / 13:05:53 / 13:06:08 CST）· CMD 形式 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <cmd>` · Ban retry-to-green；可独立重跑 ×1 复核。
2. **e2e:isolated 直接证据（AUTHORIZE cond. 3 / C-MO-AD-3）**：`P3-direct-probe-e2e-isolated.md` PROBE-A `E2E_ISOLATED=1 node scripts/run-e2e.mjs` + PROBE-B `pnpm e2e:prove`（keys stripped · 同 wrapper）→ EXIT 1 · `E2E_FAILURE class=provider code=live_provider_key_missing` @ `run-e2e.mjs:43:52`；静态 cite `run-e2e.mjs:43` blob `c655235cd3d7`；**非** 仅凭 EXIT 推断。
3. **残余分类（P2）**：env-gap cleared @ AC（再确认 DB+migrate 136）/ Key-blocked OPEN / business-assert **unknown（null）** / not_run（perf 步 4–27）；Ban `assertionCount=null` 当 0 失败。
4. **Class drift**：`880f144` vs AC `7c818c5` 无 class 漂移；非 class 漂移（migrations 135→136 · `run-e2e-isolated.mjs` blob · package.json 行号）如实入账。
5. **P1–P5 命名**：harness R1–R5 → P1–P5（addendum · P1-product ≠ gate R1）。
6. **CITE_EXIT 0/0**（guard proofs）≠ e2e pass。

## State frozen

Trio **OPEN 1/1/1** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN** · coveredCount=**8** · Key-blocked ≠ pass · zero SSOT flip · Line AC receipts untouched · sibling AE/AF/AG/AH untouched.

本 stub 不授权 nail / SSOT flip / live / `g7SuiteGreen=true`；POST dual BOTH PASS 后由协调方决定是否另开 nail；implementer 不自批。

---

*Stub · Line AD · awaiting mw-e2e-ha post-prove review · STOP*
