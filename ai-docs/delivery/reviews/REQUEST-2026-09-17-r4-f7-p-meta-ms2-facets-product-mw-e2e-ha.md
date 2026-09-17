# REQUEST — Knife **F7** · **MS2 facets on product path**（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:55 PT)（after F6 `post_prove_dual_pass`）  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ full E2E suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`  
**Hard**: F6 = **`post_prove_dual_pass`**（MS1 wired · `routedServingProductConsumerWired=true` · **MS2/MS3 still false** · **G-R4-5 STILL OPEN** · ≠ FUNNEL-01/R4 closed · Ban forge）· F7 coding still needs **own pre-exec dual + authorize** · **MS1 stays true** · **MS3 stays false** · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ G-R4-5 closed** · **≠ forge serving** · **≠ flip without authorize** · **no** model-op REQUEST · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban forge serving** · **Ban self-approve of F7**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f7-p-meta-ms2-facets-product.md` | Canonical harness（this knife） |
| `r4-f7-p-meta-ms2-facets-product.slice.md` | Slice index |
| `eval/r4-f7-p-meta-ms2-facets-product.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2** | F6 dual-closed · F7 REQUEST-ready · MS2 still open |
| `m4-rag-hard-gates.md` §R4 / GAP-RAG / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 · `facetsServedOnProductPath=[]` |
| Prior F6 | `harness/r4-f6-p-meta-ms1-product-wire.md` · **`post_prove_dual_pass`** · MS1 wired · G-R4-5 STILL OPEN |
| Prior F5 | `harness/r4-f5-p-meta-serving-product.md` · **`post_prove_dual_pass`** |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Parallel | `g7-ui-live-rerun-after-chromium` · separate · **does not block** |

---

## Stance（E2E-HA）

This knife **drafts** acceptance for **MS2 facets on product path**（F6 leftover · **G-R4-5 / MS2**）:

1. **MS2** = serve required secondary facets on product MetadataReviewReceipt path（still `facetsServedOnProductPath=[]` after F6）  
2. Experts = e2e-ha + rag-route only — **no** `mw-model-op`  
3. **≠ R4 closed · ≠ 题域已隔离 · ≠ FUNNEL-01 closed · ≠ R1 closed · ≠ G-R4-5 closed** · F6 dual ≠ product close of G-R4-5  
4. Serving MS2 alone **≠** FUNNEL-01 closed（MS3 remain）· **≠** R4 closed  
5. **MS1 pin**: `routedServingProductConsumerWired=true` **must stay true**  
6. **Coding gate**：MAIN + NHP-ADV + F1–**F6 dual done**；F7 still needs **own pre-exec dual + authorize**  
7. CMD planned · **`not_run:pre_dual`** · **not implemented**  
8. **MS3 / G-R4-3** remain parallel open — **not preferred** this knife · **Ban flip without authorize**  
9. Parallel UI Live re-run **does not block** this F7 knife

This prep: **zero prove · zero coding · zero flip · zero Live · zero self-approve**.

---

## Please answer

1. Agree F7 = **MS2 facets on product path**（G-R4-5 / MS2；≠ MS1 re-wire · ≠ MS3 deploy · ≠ P-R1 flip knife）?  
2. Agree ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ 题域已隔离 · ≠ R1 closed · ≠ G-R4-5 closed · ≠ forge serving · ≠ flip without authorize?  
3. Agree **MS1 stays true** · **MS3 stays false** · MS2 alone ≠ FUNNEL-01/G-R4-5 closed?  
4. Agree **no** `mw-model-op` REQUEST is correct for this harness?  
5. Agree F6 = `post_prove_dual_pass` satisfies prior gate，but F7 coding still needs **F7 pre-exec dual + authorize**?  
6. Agree CMD `not_run:pre_dual` · no prove this turn · no coding · no self-approve · `releaseEvidence=false` · ≠ HA · sole 恰 5 · **Ban claiming R4/FUNNEL/G-R4-5 closed** · **Ban forge** · **Ban flip without authorize**?  
7. Agree MS3 / G-R4-3 remain parallel open（not preferred F7 scope）· Ban flip without authorize · parallel UI Live does not block F7?

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not FUNNEL-01 closed · not R4 closed · not 题域已隔离 · not R1 closed · not G-R4-5 closed · not HA · not F7 coding authorized · not flip authorized · not forge serving

---

*REQUEST · mw-e2e-ha · F7 MS2 facets product · 2026-09-17 ~00:55 PT · REQUEST-ready / not_run:pre_dual · F6=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ G-R4-5 closed · MS1 true · MS2/MS3 still open as scoped · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Ban R4/FUNNEL/G-R4-5 closed · Ban forge · Ban flip without authorize · Ban self-approve*
