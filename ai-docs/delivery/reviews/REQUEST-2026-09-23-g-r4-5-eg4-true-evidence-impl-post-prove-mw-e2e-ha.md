# REQUEST — **G-R4-5 EG4 true-evidence / impl** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-23 (~04:38 PT) · post-prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · **EG1 STILL OPEN** · **EG2 STILL OPEN** · **EG3 STILL OPEN** · **EG4 STILL OPEN** · EG5–EG6 **deferred** · **≠ dual-claim closed** · **≠ wrong_track product closed** · **≠ 题域已隔离** · **product SSOT NOT flipped** · Ban假关 · Ban invent coveredCount · Ban forge · Ban claim from covered-path / meta prove alone · Ban claim closed from EXIT=0 alone · **Ban idle re-prove of EG1/EG2/EG3 CMDs as fake EG4 close** · **Ban idle re-run of the same 5×meta prove as fake close**  
**Pair**: `REQUEST-2026-09-23-g-r4-5-eg4-true-evidence-impl-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST tip **`cf469c3`** · EG4-specific prove EXIT=0 ≠ EG4 closed ≠ wrong_track product closed ≠ R4/FUNNEL product closed · Ban self-approve · Ban secrets · No force · **≠ EG3 wash** `62c0e2f`/`c18e28f` · **≠ EG1+EG2 wash** `08f7499`/`ffb2a9b` · **≠ residual honesty wash** `e23c5fd`/`04c6ed1` · **≠ evidence-close wash** `b4a8ede`/`ae99258` · **≠ residual honesty wash** `a6d733d`/`e919ddf` · **≠ L4 wash** `cc0d913`/`1a8b1e9` · **≠ honesty rem** `42f77c1`/`669bca4` · **≠ real-close** `105b264`/`d994c36`  
**Knife**: `harness/g-r4-5-eg4-true-evidence-impl.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`** · product SSOT **NOT** flipped

---

## Contra

| File | Role |
|------|------|
| `harness/g-r4-5-eg4-true-evidence-impl.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-23-g-r4-5-eg4-true-evidence-prove.md` | CMD+EXIT table |
| `receipts/2026-09-23-g-r4-5-eg4-wrong-track-product-evidence.json` | EG4 wrong_track production honesty evidence |
| `harness/g-r4-5-eg3-true-evidence-impl.md` | EG3 prior · ≠ this · `62c0e2f`/`c18e28f` · retained OPEN |
| `harness/g-r4-5-eg1-eg2-true-evidence-impl.md` | EG1+EG2 prior · ≠ this · `08f7499`/`ffb2a9b` · retained OPEN |
| `harness/g-r4-5-eg1-eg6-residual-true-evidence.md` | Residual prior · ≠ this · `e23c5fd`/`04c6ed1` · retained OPEN |
| `harness/g-r4-5-evidence-close.md` | Evidence-close prior · ≠ this · `b4a8ede`/`ae99258` · retained OPEN |
| Pre-exec dual | `REQUEST-2026-09-23-g-r4-5-eg4-true-evidence-impl-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass** on `cf469c3` |

---

## Stance（mw-e2e-ha）

1. Standing authorize coding+prove after pre-exec dual on `cf469c3`.  
2. EG4-specific prove EXIT **1×0** under authorize · wrong_track production honesty evidence emitted · **≠** EG4 / wrong_track / G-R4-5 / dual-claim / 题域 / R4/FUNNEL product closed.  
3. **Ban idle re-prove of EG1/EG2/EG3 CMDs as fake EG4 close** · **Ban idle re-run of the same 5×meta prove as fake close** — those were **not** re-run as close this execute.  
4. Ban claim from covered-path / meta prove alone · product SSOT **NOT flipped** · L5 waits post-prove dual + explicit authorize.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-eg4-wrong-track-product:prove` | **0** | EG4 evidence emitted · ≠ EG4/wrong_track/G-R4-5/R4/题域 closed · Ban forge · Ban claim from covered-path / meta prove alone |

Prior EG1/EG2/EG3 proves + 5×meta (tip `ae99258` · EXIT 5×0) **retained as ceiling · not re-run as fake EG4 close**.

---

## Please answer

1. 请抽查/复跑至少 `pnpm r4-eg4-wrong-track-product:prove`，附 CMD+EXIT；确认 EG4 json 诚实（`eg4ProductClosed=false` · `wrongTrackProductClosed=false` · `coveredPathAloneDoesNotClose=true` · `metaProveAloneDoesNotClose=true` · `releaseEvidence=false`）。  
2. 是否同意 **≠ EG3 wash** `62c0e2f`/`c18e28f` · **≠ EG1+EG2 wash** `08f7499`/`ffb2a9b` · **≠ residual wash** `e23c5fd`/`04c6ed1` · **≠ evidence-close wash** `b4a8ede`/`ae99258` · **Ban idle re-prove EG1/EG2/EG3 as fake EG4 close** · **Ban idle re-run of same 5×meta as fake close** · Ban claim from covered-path / meta prove alone · 本刀 = EG4 true-evidence path？  
3. **G-R4-5 STILL OPEN** / **题域 STILL OPEN** / **R4/FUNNEL product STILL OPEN** / **MS3 ≠ R4 closed** / EG1 STILL OPEN / EG2 STILL OPEN / EG3 STILL OPEN / EG4 STILL OPEN / EG5–EG6 deferred / Ban invent coveredCount / Ban forge / **SSOT NOT flipped** 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）· EXIT=0 ≠ EG4/wrong_track 已关？  
5. 是否引入 secrets / `.env*` / Meridian / force-push / Cloud Agent / HA/suite/`releaseEvidence=true` / 假关 / invent coveredCount / forge？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-23-g-r4-5-eg4-true-evidence-impl-post-prove-mw-e2e-ha.md`）。**Ban** implementer writing pass.

---

*REQUEST · mw-e2e-ha · G-R4-5 EG4 true-evidence / impl post-prove · 2026-09-23 ~04:38 PT · REQUEST/待审 · Ban自批 · Ban self-nail post_prove_dual_pass · G-R4-5 STILL OPEN · 题域 STILL OPEN · EG4 STILL OPEN · releaseEvidence=false · ≠HA*
