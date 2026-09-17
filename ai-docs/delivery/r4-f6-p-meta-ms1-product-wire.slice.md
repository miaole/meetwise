# Slice — Knife **F6** · **MS1 MetadataReviewReceipt product wire**

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~00:45 PT)  
**Authority**: meetwise — F5 **`post_prove_dual_pass`** · F6 pre-exec dual **PASS** + authorize coding+prove · **MS1 product consumer WIRED** · **MS2/MS3 still false** · **G-R4-5 STILL OPEN** · Ban forge · Ban flip without authorize · Ban self-approve  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ suite green** · **sole 恰 5** · **MS1 wired · MS2/MS3 still false · G-R4-5/P-META serving STILL OPEN** · **G-R4-3 STILL OPEN**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**no** model-op）· pre-exec dual **PASS** · post-prove REQUEST drafted · **await post-prove dual**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/r4-f6-p-meta-ms1-product-wire.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-f6-p-meta-ms1-product-wire.md` |
| Eval | `ai-docs/delivery/eval/r4-f6-p-meta-ms1-product-wire.eval.md` |
| Prove | `pnpm r4-p-meta-ms1-product-wire:prove` · **EXIT=0** · await post-prove dual |
| Consumer | `apps/worker/src/r4-p-meta-ms1-product-wire.ts` |
| Proof | `apps/worker/test/r4-p-meta-ms1-product-wire.proof.ts` |
| REQUEST · e2e-ha（post-prove） | `reviews/REQUEST-2026-09-17-r4-f6-p-meta-ms1-product-wire-post-prove-mw-e2e-ha.md` |
| REQUEST · rag-route（post-prove） | `reviews/REQUEST-2026-09-17-r4-f6-p-meta-ms1-product-wire-post-prove-mw-rag-route.md` |
| Parent status | `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS1** |
| Inventory | `harness/r4-domain-isolation.md` §2 / §6c.3 · P-META |
| Prior F5 | `r4-f5-p-meta-serving-product.slice.md` · **`post_prove_dual_pass`** |
| Prior F4 | `r4-f4-p-r1-fail-closed.slice.md` · **`post_prove_dual_pass`** · G-R4-3 **STILL OPEN** |
| Parallel | `g7-ui-live-rerun-after-chromium.slice.md` · **does not block F6** |

## One-line scope

**MS1 product wire** — real routed `MetadataReviewReceipt` product serving consumer（**G-R4-5 / MS1**）wired · `routedServingProductConsumerWired=true` · **MS2/MS3 still false** · **≠** FUNNEL-01/R4/R1/G-R4-5 closed · **≠** forge · await post-prove dual.

## Hard pins

- ≠ R4 closed · ≠ 题域已隔离 · 01A ≠ 01 · MS1 alone ≠ FUNNEL-01/G-R4-5 closed · F4 dual ≠ R1 closed · ≠ flip without authorize  
- MAIN / NHP-ADV / F1–F5 dual **done** · F6 pre-exec **PASS** · coding+prove **executed** · **MS1 wired** · **MS2/MS3 still false** · G-R4-5 **STILL OPEN** · G-R4-3 **STILL OPEN**  
- `releaseEvidence=false` · ≠ HA · ≠ suite green · sole **恰 5** · no self-approve · Ban forge · Ban R4/FUNNEL/R1 closed · Ban flip without authorize  
- Wiring MS1 alone **≠** FUNNEL-01 closed（MS2/MS3 remain）· Parallel UI Live **does not block**

## CMD

| CMD | Status |
|-----|--------|
| `pnpm r4-p-meta-ms1-product-wire:prove` | **EXIT=0** · **`executed:awaiting_post_prove_dual`** |

---

*Slice · F6 · 2026-09-17 ~00:45 PT · executed:awaiting_post_prove_dual · prove EXIT=0 · MS1 wired · MS2/MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · sole 恰 5 · Ban R4 closed · Ban FUNNEL-01 closed · Ban forge · Ban flip without authorize · Ban self-approve · await post-prove dual*
