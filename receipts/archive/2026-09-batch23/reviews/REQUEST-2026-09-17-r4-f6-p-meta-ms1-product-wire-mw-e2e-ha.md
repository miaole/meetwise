# REQUEST — Knife **F6** · **MS1 MetadataReviewReceipt product wire**（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:30 PT)（after F5 `post_prove_dual_pass`）  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ full E2E suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-rag-route.md`  
**Hard**: F5 = **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · `routedServingProductConsumerWired=false` · G-R4-5 **STILL OPEN** · ≠ FUNNEL-01 closed · Ban forge）· F4 = **`post_prove_dual_pass`**（honesty only · PR1-A true · PR1-B/C false · G-R4-3 **STILL OPEN** · ≠ R1 closed · ≠ flip）· F6 coding still needs **own pre-exec dual + authorize** · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ forge serving** · **≠ flip without authorize** · **no** model-op REQUEST · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban forge serving**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f6-p-meta-ms1-product-wire.md` | Canonical harness（this knife） |
| `r4-f6-p-meta-ms1-product-wire.slice.md` | Slice index |
| `eval/r4-f6-p-meta-ms1-product-wire.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS1** | F5 dual-closed · F6 REQUEST-ready · MS1 still open |
| `m4-rag-hard-gates.md` §R4 / GAP-RAG / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | F5 MS1–MS3 · `routedServingProductConsumerWired=false` |
| Prior F5 | `harness/r4-f5-p-meta-serving-product.md` · **`post_prove_dual_pass`** · G-R4-5 STILL OPEN |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`** · MS1–MS3 still false |
| Parallel | `g7-ui-live-rerun-after-chromium` · separate · **does not block** |

---

## Stance（E2E-HA）

This knife **drafts** acceptance for **MS1 MetadataReviewReceipt product wire**（F5 leftover · **G-R4-5 / MS1**）:

1. **MS1** = wire real routed `MetadataReviewReceipt` product serving consumer（still `routedServingProductConsumerWired=false` after F5 honesty）  
2. Experts = e2e-ha + rag-route only — **no** `mw-model-op`  
3. **≠ R4 closed · ≠ 题域已隔离 · ≠ FUNNEL-01 closed · ≠ R1 closed** · F5 dual ≠ product close of G-R4-5 · F4 dual ≠ R1 closed  
4. Wiring MS1 alone **≠** FUNNEL-01 closed（MS2/MS3 remain）· **≠** R4 closed  
5. **Coding gate**：MAIN + NHP-ADV + F1–**F5 dual done**；F6 still needs **own pre-exec dual + authorize**  
6. CMD planned · **`not_run:pre_dual`** · **not implemented**  
7. **G-R4-3 / P-R1** remains parallel open after F4 — fail-closed flip = **not preferred** · **Ban flip without authorize**  
8. Parallel UI Live re-run **does not block** this F6 knife

This prep: **zero prove · zero coding · zero flip · zero Live · zero self-approve**.

---

## Please answer

1. Agree F6 = **MS1 MetadataReviewReceipt product wire**（G-R4-5 / MS1；≠ F5 honesty re-run alone · ≠ P-R1 flip knife）?  
2. Agree ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ 题域已隔离 · ≠ R1 closed · ≠ forge serving · ≠ flip without authorize?  
3. Agree **no** `mw-model-op` REQUEST is correct for this harness?  
4. Agree F5 = `post_prove_dual_pass` + F4 = `post_prove_dual_pass` satisfy prior gate，but F6 coding still needs **F6 pre-exec dual + authorize**?  
5. Agree CMD `not_run:pre_dual` · no prove this turn · no coding · no self-approve · `releaseEvidence=false` · ≠ HA · sole 恰 5 · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban forge** · **Ban flip without authorize**?  
6. Agree G-R4-3 / P-R1 remains parallel open（not preferred F6 scope）· Ban flip without authorize · parallel UI Live does not block F6?

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not FUNNEL-01 closed · not R4 closed · not 题域已隔离 · not R1 closed · not HA · not F6 coding authorized · not flip authorized · not forge serving

---

*REQUEST · mw-e2e-ha · F6 MS1 product wire · 2026-09-17 ~00:30 PT · REQUEST-ready / not_run:pre_dual · F5=`post_prove_dual_pass` · F4=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ R1 closed · MS1 still false · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Ban R4 closed · Ban FUNNEL-01 closed · Ban forge · Ban flip without authorize*
