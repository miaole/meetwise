# REQUEST — Knife **F8** · **MS3 standard deploy product handoff**（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:07 PT)（after F7 `post_prove_dual_pass`）  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ full E2E suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-rag-route.md`  
**Hard**: F7 = **`post_prove_dual_pass`**（MS2 served · `fullFacetsServed=true` · HEAD `cedda0d` · **MS1 true** · **MS3 still false** · **G-R4-5 STILL OPEN** · ≠ FUNNEL-01/R4 closed · Ban forge）· F8 coding still needs **own pre-exec dual + authorize** · **Dual PASS ≠ authorize coding** · **MS1/MS2 stay true** · **MS3 stays false until authorized** · **G-R4-5 STILL OPEN until MS3 done** · even after MS3 **may still not close FUNNEL alone** if other gates remain · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ G-R4-5 closed from docs** · **≠ forge serving** · **≠ flip without authorize** · **no** model-op REQUEST · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban forge serving** · **Ban self-approve of F8**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f8-p-meta-ms3-deploy-product.md` | Canonical harness（this knife） |
| `r4-f8-p-meta-ms3-deploy-product.slice.md` | Slice index |
| `eval/r4-f8-p-meta-ms3-deploy-product.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS3** | F7 dual-closed · F8 REQUEST-ready · MS3 still open |
| `m4-rag-hard-gates.md` §R4 / GAP-RAG / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · other gates may remain |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 · `standardDeployProductHandoff=false` · checklist named |
| Prior F7 | `harness/r4-f7-p-meta-ms2-facets-product.md` · **`post_prove_dual_pass`** · MS2 served · G-R4-5 STILL OPEN · HEAD `cedda0d` |
| Prior F6 | `harness/r4-f6-p-meta-ms1-product-wire.md` · **`post_prove_dual_pass`** · MS1 wired |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Parallel | `g7-ui-live-rerun-after-chromium` · separate · **does not block** |

---

## Stance（E2E-HA）

This knife **drafts** acceptance for **MS3 standard deploy product handoff**（F7 leftover · **G-R4-5 / MS3**）:

1. **MS3** = land standard / combo-root **product** deploy handoff evidence（still `standardDeployProductHandoff=false` after F7）  
2. Experts = e2e-ha + rag-route only — **no** `mw-model-op`  
3. **≠ R4 closed · ≠ 题域已隔离 · ≠ FUNNEL-01 closed · ≠ R1 closed · ≠ G-R4-5 closed from docs** · F7 dual ≠ product close of G-R4-5  
4. **G-R4-5 STILL OPEN until MS3 done** · after MS3 product surface may close · **FUNNEL may still remain open** if other gates remain  
5. **MS1/MS2 pins** stay true · **MS3** stays false until authorized  
6. **Coding gate**：MAIN + NHP-ADV + F1–**F7 dual done**；F8 still needs **own pre-exec dual + authorize** · **Dual PASS ≠ authorize coding**  
7. CMD planned · **`not_run:pre_dual`** · **not implemented**  
8. **G-R4-3** remain parallel open — **not preferred** this knife · **Ban flip without authorize**  
9. Parallel UI Live re-run **does not block** this F8 knife

This prep: **zero prove · zero coding · zero flip · zero Live · zero self-approve**.

---

## Please answer

1. Agree F8 = **MS3 standard deploy product handoff**（G-R4-5 / MS3；≠ MS1/MS2 re-wire · ≠ P-R1 flip knife）?  
2. Agree ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ 题域已隔离 · ≠ R1 closed · ≠ G-R4-5 closed from docs · ≠ forge serving · ≠ flip without authorize?  
3. Agree **MS1 true** · **MS2 fullFacetsServed=true** · **MS3 still false until authorized** · G-R4-5 STILL OPEN until MS3 · even after MS3 FUNNEL may still have other gates?  
4. Agree **no** `mw-model-op` REQUEST is correct for this harness?  
5. Agree F7 = `post_prove_dual_pass` satisfies prior gate，but F8 coding still needs **F8 pre-exec dual + authorize** · **Dual PASS ≠ authorize coding**?  
6. Agree CMD `not_run:pre_dual` · no prove this turn · no coding · no self-approve · `releaseEvidence=false` · ≠ HA · sole 恰 5 · **Ban claiming R4/FUNNEL/G-R4-5 closed** · **Ban forge** · **Ban flip without authorize**?  
7. Agree G-R4-3 remain parallel open（not preferred F8 scope）· Ban flip without authorize · parallel UI Live does not block F8?

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not FUNNEL-01 closed · not R4 closed · not 题域已隔离 · not R1 closed · not G-R4-5 closed · not HA · not F8 coding authorized · not Dual PASS = coding authorize · not flip authorized · not forge serving

---

*REQUEST · mw-e2e-ha · F8 MS3 deploy product · 2026-09-17 (~01:07 PT) · REQUEST-ready / not_run:pre_dual · F7=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ G-R4-5 closed · MS1 true · MS2 fullFacetsServed=true · MS3 still false · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Dual PASS ≠ authorize coding · Ban R4/FUNNEL/G-R4-5 closed · Ban forge · Ban flip without authorize · Ban self-approve*
