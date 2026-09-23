# REQUEST — **G-R4-5 EG6 true-evidence / impl** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-23 (~05:16 PT) · post-prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **G-R4-5 STILL OPEN** · **题域 STILL OPEN** · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · **EG1 STILL OPEN** · **EG2 STILL OPEN** · **EG3 STILL OPEN** · **EG4 STILL OPEN** · **EG5 STILL OPEN** · **EG6 STILL OPEN** · **≠ dual-claim closed** · **≠ wrong_track product closed** · **≠ 题域已隔离** · **product SSOT NOT flipped** · Ban假关 · Ban invent coveredCount · Ban forge · Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone · Ban claim closed from EXIT=0 alone · **Ban idle re-prove of EG1/EG2/EG3/EG4/EG5 CMDs as fake EG6 close** · **Ban idle re-run of the same 5×meta prove as fake close** · Ban wash EG5 nail / prove tip  
**Pair**: `REQUEST-2026-09-23-g-r4-5-eg6-true-evidence-impl-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after pre-exec dual on REQUEST tip **`b777ff8`** · EG6-specific prove EXIT=0 ≠ EG6 closed ≠ MS3=R4 closed ≠ R4 closed from MS3 ≠ R4/FUNNEL product closed · Ban self-approve · Ban secrets · No force · **≠ EG5 wash** `e099276`/`6058462` · **≠ EG4 wash** `3cefebf`/`ec90b6d` · **≠ EG3 wash** `62c0e2f`/`c18e28f` · **≠ EG1+EG2 wash** `08f7499`/`ffb2a9b` · **≠ residual honesty wash** `e23c5fd`/`04c6ed1` · **≠ evidence-close wash** `b4a8ede`/`ae99258` · **≠ residual honesty wash** `a6d733d`/`e919ddf` · **≠ L4 wash** `cc0d913`/`1a8b1e9` · **≠ honesty rem** `42f77c1`/`669bca4` · **≠ real-close** `105b264`/`d994c36`  
**Knife**: `harness/g-r4-5-eg6-true-evidence-impl.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`** · product SSOT **NOT** flipped · **MS3 ≠ R4 closed**

---

## Contra

| File | Role |
|------|------|
| `harness/g-r4-5-eg6-true-evidence-impl.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-23-g-r4-5-eg6-true-evidence-prove.md` | CMD+EXIT table |
| `receipts/2026-09-23-g-r4-5-eg6-ms3-ne-r4-evidence.json` | EG6 MS3≠R4 pin retention honesty evidence |
| `harness/g-r4-5-eg5-true-evidence-impl.md` | EG5 prior · ≠ this · `e099276`/`6058462` · retained OPEN · Ban wash |
| `harness/g-r4-5-eg4-true-evidence-impl.md` | EG4 prior · ≠ this · `3cefebf`/`ec90b6d` · retained OPEN |
| `harness/g-r4-5-eg3-true-evidence-impl.md` | EG3 prior · ≠ this · `62c0e2f`/`c18e28f` · retained OPEN |
| `harness/g-r4-5-eg1-eg2-true-evidence-impl.md` | EG1+EG2 prior · ≠ this · `08f7499`/`ffb2a9b` · retained OPEN |
| `harness/g-r4-5-eg1-eg6-residual-true-evidence.md` | Residual prior · ≠ this · `e23c5fd`/`04c6ed1` · retained OPEN |
| `harness/g-r4-5-evidence-close.md` | Evidence-close prior · ≠ this · `b4a8ede`/`ae99258` · retained OPEN |
| Pre-exec dual | `REQUEST-2026-09-23-g-r4-5-eg6-true-evidence-impl-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass** on `b777ff8` |

---

## Stance（mw-e2e-ha）

1. Standing authorize coding+prove after pre-exec dual on `b777ff8`.  
2. EG6-specific prove EXIT **1×0** under authorize · MS3≠R4 pin retention honesty evidence emitted · **≠** EG6 / MS3=R4 / R4 closed from MS3 / G-R4-5 / dual-claim / 题域 / R4/FUNNEL product closed.  
3. **Ban idle re-prove of EG1/EG2/EG3/EG4/EG5 CMDs as fake EG6 close** · **Ban idle re-run of the same 5×meta prove as fake close** — those were **not** re-run as close this execute.  
4. Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone · product SSOT **NOT flipped** · **MS3 ≠ R4 closed** · L5 waits post-prove dual + explicit authorize.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-eg6-ms3-ne-r4:prove` | **0** | EG6 evidence emitted · ≠ EG6/MS3=R4/R4/G-R4-5/题域 closed · Ban forge · Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone |

Prior EG1/EG2/EG3/EG4/EG5 proves + 5×meta (tip `ae99258` · EXIT 5×0) **retained as ceiling · not re-run as fake EG6 close**.

---

## Please answer

1. 请抽查/复跑至少 `pnpm r4-eg6-ms3-ne-r4:prove`，附 CMD+EXIT；确认 EG6 json 诚实（`eg6ProductClosed=false` · `ms3EqualsR4Closed=false` · `productSsotFlipped=false` · `priorEgEvidenceAloneDoesNotClose=true` · `metaProveAloneDoesNotClose=true` · `releaseEvidence=false`）。  
2. 是否同意 **≠ EG5 wash** `e099276`/`6058462` · **≠ EG4 wash** `3cefebf`/`ec90b6d` · **≠ EG3 wash** `62c0e2f`/`c18e28f` · **≠ EG1+EG2 wash** `08f7499`/`ffb2a9b` · **≠ residual wash** `e23c5fd`/`04c6ed1` · **≠ evidence-close wash** `b4a8ede`/`ae99258` · **Ban idle re-prove EG1/EG2/EG3/EG4/EG5 as fake EG6 close** · **Ban idle re-run of same 5×meta as fake close** · Ban claim R4 closed from MS3 · Ban wash EG5 nail / prove tip · 本刀 = EG6 true-evidence path？  
3. **G-R4-5 STILL OPEN** / **题域 STILL OPEN** / **R4/FUNNEL product STILL OPEN** / **MS3 ≠ R4 closed** / EG1–EG6 STILL OPEN / Ban invent coveredCount / Ban forge / **SSOT NOT flipped** 是否仍硬钉？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）· EXIT=0 ≠ EG6/MS3=R4/R4 closed？  
5. 是否引入 secrets / `.env*` / Meridian / force-push / Cloud Agent / HA/suite/`releaseEvidence=true` / 假关 / invent coveredCount / forge / claim R4 closed from MS3？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-23-g-r4-5-eg6-true-evidence-impl-post-prove-mw-e2e-ha.md`）。**Ban** implementer writing pass.

---

*REQUEST · mw-e2e-ha · G-R4-5 EG6 true-evidence / impl post-prove · 2026-09-23 ~05:16 PT · REQUEST/待审 · Ban自批 · Ban self-nail post_prove_dual_pass · Ban claim R4 closed from MS3 · G-R4-5 STILL OPEN · 题域 STILL OPEN · EG6 STILL OPEN · MS3 ≠ R4 closed · product SSOT NOT flipped · releaseEvidence=false · ≠HA*
