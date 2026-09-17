# Slice — Knife **F7** · **MS2 facets on product path**

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~01:00 PT)  
**Authority**: meetwise — F6 **`post_prove_dual_pass`** · F7 pre-exec dual **PASS** + authorize · **MS2 facets SERVED** · prove **EXIT=0** · **MS1 true** · **MS3 still false** · **G-R4-5 STILL OPEN** · Ban forge · Ban flip without authorize · Ban self-approve  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ suite green** · **sole 恰 5** · **MS1 wired · MS2 served · MS3 still false · G-R4-5/P-META serving STILL OPEN** · **G-R4-3 STILL OPEN**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**no** model-op）· post-prove REQUEST drafted · **Ban self-approve**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/r4-f7-p-meta-ms2-facets-product.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-f7-p-meta-ms2-facets-product.md` |
| Eval | `ai-docs/delivery/eval/r4-f7-p-meta-ms2-facets-product.eval.md` |
| Prove | `pnpm r4-p-meta-ms2-facets-product:prove` · **EXIT=0** |
| Src | `apps/worker/src/r4-p-meta-ms2-facets-product.ts` |
| Proof | `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` |
| REQUEST · e2e-ha（post-prove） | `reviews/REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-e2e-ha.md` |
| REQUEST · rag-route（post-prove） | `reviews/REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md` |
| Parent status | `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2** |
| Prior F6 | `r4-f6-p-meta-ms1-product-wire.slice.md` · **`post_prove_dual_pass`** · MS1 wired |

## One-line scope

**MS2 facets on product path** — required secondary facets **served** on product MetadataReviewReceipt path（**G-R4-5 / MS2**）· **MS1 stays true** · **MS3 stays false** · **≠** FUNNEL-01/R4/R1/G-R4-5 closed · **≠** forge · prove **EXIT=0** · await post-prove dual.

## Hard pins

- ≠ R4 closed · ≠ 题域已隔离 · 01A ≠ 01 · MS2 alone ≠ FUNNEL-01/G-R4-5 closed · ≠ flip without authorize  
- `releaseEvidence=false` · ≠ HA · ≠ suite green · sole **恰 5** · no self-approve · Ban forge · Ban R4/FUNNEL/R1/G-R4-5 closed  
- MS2 alone **≠** FUNNEL-01 closed（MS3 remain）· **Ban self-approve `post_prove_dual_pass`**

## CMD

| CMD | Status |
|-----|--------|
| `pnpm r4-p-meta-ms2-facets-product:prove` | **EXIT=0** · MS1 true · MS2 served · MS3 false |

---

*Slice · F7 · 2026-09-17 ~01:00 PT · executed:awaiting_post_prove_dual · prove EXIT=0 · MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · sole 恰 5 · Ban R4 closed · Ban FUNNEL-01 closed · Ban forge · Ban flip without authorize · Ban self-approve*
