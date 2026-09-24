# REQUEST — **G-R4-3 PR1-B/C true-evidence / impl** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-23 (~04:08 PT) · post-prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **G-R4-3 STILL OPEN** · **PR1-B STILL OPEN** · **PR1-C STILL OPEN** · **≠ R1 product closed** · **fail-closed default still 0** · Ban假关 · Ban forge PR1-B/C · Ban silent flip default · Ban claim closed from EXIT=0 alone · **Ban idle re-run of the same 3×prove as fake close**  
**Pair**: `REQUEST-2026-09-17-g-r4-3-pr1-bc-true-evidence-impl-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST tip **`2faa8cc`** · PR1-B/C-specific prove EXIT=0 ≠ PR1-B/C closed ≠ G-R4-3 closed ≠ R1 product closed · Ban self-approve · Ban secrets · No force · **≠ residual honesty wash** `a011bc7`/`da8e5c8` · **≠ evidence-close wash** `2df17ed`/`7fc5f90` · **≠ residual honesty wash** `5e05909`/`4cd0ecd` · **≠ R1 L5 wash** `9e9b6ff`/`ebd4117`  
**Knife**: `harness/g-r4-3-pr1-bc-true-evidence-impl.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`** · product SSOT **NOT** flipped · default **NOT** flipped

---

## Contra

| File | Role |
|------|------|
| `harness/g-r4-3-pr1-bc-true-evidence-impl.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-g-r4-3-pr1-bc-true-evidence-prove.md` | CMD+EXIT table |
| `receipts/2026-09-17-g-r4-3-pr1b-combo-root-flag-on-evidence.json` | PR1-B combo-root / flag-on production evidence |
| `receipts/2026-09-17-g-r4-3-pr1c-default-on-no-legacy-evidence.json` | PR1-C default-on / no-legacy path evidence |
| `harness/g-r4-3-pr1-bc-residual-true-evidence.md` | Residual prior · ≠ this · `a011bc7`/`da8e5c8` · retained OPEN |
| `harness/g-r4-3-evidence-close.md` | Evidence-close prior · ≠ this · `2df17ed`/`7fc5f90` · retained OPEN |
| Pre-exec dual | `2026-09-17-g-r4-3-pr1-bc-true-evidence-impl-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass** on `2faa8cc` |

---

## Stance（mw-e2e-ha）

1. Standing authorize coding+prove after pre-exec dual on `2faa8cc`.  
2. PR1-B/C-specific prove EXIT **2×0** under authorize · PR1-B combo-root / flag-on production evidence emitted · PR1-C default-on / no-legacy path evidence emitted (`failClosedDefaultStill0=true` · `defaultFlipped=false`) · **≠** PR1-B/C / G-R4-3 / R1 product closed.  
3. **Ban idle re-run of the same 3×prove as fake close** — those three were **not** re-run as close this execute.  
4. Fail-closed default **NOT flipped** · product SSOT **NOT flipped** · L5 waits post-prove dual + explicit authorize.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-pr1b-combo-root:prove` | **0** | PR1-B evidence emitted · ≠ PR1-B/G-R4-3/R1 closed · Ban forge |
| `pnpm r4-pr1c-no-legacy:prove` | **0** | PR1-C evidence emitted · default still 0 · ≠ PR1-C/G-R4-3/R1 closed · Ban silent flip |

Prior 3×prove (tip `7fc5f90` · EXIT 3×0) **retained as ceiling · not re-run as fake close**.

---

## Please answer

1. 请抽查/复跑至少 `pnpm r4-pr1b-combo-root:prove` + `pnpm r4-pr1c-no-legacy:prove`，附 CMD+EXIT；确认 PR1-B/C json 诚实（`gR43Closed=false` · `failClosedDefaultStill0=true` · `defaultFlipped=false`）。  
2. 是否同意 **≠ residual honesty wash** `a011bc7`/`da8e5c8` · **≠ evidence-close wash** `2df17ed`/`7fc5f90` · **Ban idle re-run of same 3×prove as fake close** · 本刀 = PR1-B/C true-evidence path？  
3. **G-R4-3 STILL OPEN** / **PR1-B STILL OPEN** / **PR1-C STILL OPEN** / **≠ R1 product closed** / Ban forge / Ban flip default / **default still 0** / **SSOT NOT flipped** 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）· EXIT=0 ≠ PR1-B/C 已关？  
5. 是否引入 secrets / `.env*` / Meridian / force-push / Cloud Agent / HA/suite/`releaseEvidence=true` / 假关 / forge / silent flip？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-g-r4-3-pr1-bc-true-evidence-impl-post-prove-mw-e2e-ha.md`）。**Ban** implementer writing pass.

---

*REQUEST · mw-e2e-ha · G-R4-3 PR1-B/C true-evidence / impl post-prove · 2026-09-23 ~04:08 PT · REQUEST/待审 · Ban自批 · Ban self-nail post_prove_dual_pass · G-R4-3 STILL OPEN · PR1-B STILL OPEN · PR1-C STILL OPEN · releaseEvidence=false · ≠HA*
