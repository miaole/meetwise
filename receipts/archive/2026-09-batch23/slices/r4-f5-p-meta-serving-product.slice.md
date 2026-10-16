# Slice — Knife **F5** · **P-META serving product remaining**

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~00:30 PT)  
**Authority**: meetwise — F4 **`post_prove_dual_pass`**（honesty only · G-R4-3 STILL OPEN · no flip）· F3 **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · G-R4-5 STILL OPEN）· F5 pre-exec dual **PASS** + authorize coding+prove · prove **EXIT=0** · **post-prove dual PASS**（expert re-run prove EXIT=0 both domains）· **MS1–MS3 still false** · **Ban forge serving**  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ suite green** · **sole 恰 5** · **MS1–MS3 still false · G-R4-5/P-META serving STILL OPEN** · **G-R4-3 STILL OPEN**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**no** model-op）· post-prove dual **PASS**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/r4-f5-p-meta-serving-product.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-f5-p-meta-serving-product.md` |
| Eval | `ai-docs/delivery/eval/r4-f5-p-meta-serving-product.eval.md` |
| Prove | `pnpm r4-p-meta-serving-product:prove` · **EXIT=0**（implementer ~00:22–00:26 PT · expert dual ~00:28 PT） |
| Helper | `apps/worker/src/r4-p-meta-serving-product-remaining.ts` |
| Proof | `apps/worker/test/r4-p-meta-serving-product.proof.ts` |
| REQUEST · e2e-ha（pre-exec） | `reviews/REQUEST-2026-09-17-r4-f5-p-meta-serving-product-mw-e2e-ha.md` → review **pass** |
| REQUEST · rag-route（pre-exec） | `reviews/REQUEST-2026-09-17-r4-f5-p-meta-serving-product-mw-rag-route.md` → review **pass** |
| post-prove · e2e-ha | `reviews/2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-e2e-ha.md` · **pass** · expert prove=0 |
| post-prove · rag-route | `reviews/2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-rag-route.md` · **pass** · expert prove=0 |
| Parent status | `harness/r4-domain-isolation-status.md` §13 · **G-R4-5** |
| Inventory | `harness/r4-domain-isolation.md` §2 / §6c.3 · P-META |
| Prior F4 | `r4-f4-p-r1-fail-closed.slice.md` · **`post_prove_dual_pass`** · G-R4-3 **STILL OPEN** |
| Prior F3 | `r4-f3-p-meta-serving.slice.md` · **`post_prove_dual_pass`** · MS1–MS3 **still false** |
| Prior F2 | `r4-f2-p-meta-p-r1.slice.md` · **`post_prove_dual_pass`** |
| Sibling F1 | `r4-f1-wrong-track-prod-surface.slice.md` · **`post_prove_dual_pass`** |
| Next F6 | `r4-f6-p-meta-ms1-product-wire.slice.md` · **`REQUEST-ready / not_run:pre_dual`** |
| Parallel | `g7-ui-live-rerun-after-chromium.slice.md` · **does not block F5** |

## One-line scope

**P-META serving product remaining**（routed `MetadataReviewReceipt` / facets / deploy · **G-R4-5** / MS1–MS3）after F3 honesty dual + F4 P-R1 fail-closed dual. Prove **EXIT=0** · post-prove dual **PASS** · **≠** FUNNEL-01/R4/R1 closed · **≠** forge serving · **MS1–MS3 still false** · **G-R4-5 STILL OPEN**.

## Hard pins

- ≠ R4 closed · ≠ 题域已隔离 · 01A ≠ 01 · F3 dual ≠ FUNNEL-01 closed · F4 dual ≠ R1 closed · ≠ flip without authorize  
- MAIN / NHP-ADV / F1 / F2 / F3 / F4 / **F5** dual **done** · MS1–MS3 **still false** · G-R4-5 **STILL OPEN** · G-R4-3 **STILL OPEN**（parallel）  
- EXIT=0 ≠ FUNNEL-01/R4/R1 closed ≠ HA ≠ suite green ≠ knife product-done ≠ G-R4-5 closed ≠ forge OK  
- `releaseEvidence=false` · ≠ HA · sole **恰 5** · no self-approve · no flip default · Ban forge serving · Ban R4/FUNNEL/R1 closed  
- **next** = F6 MS1 product wire（G-R4-5 / MS1）· ≠ FUNNEL-01/R4 closed · ≠ forge · ≠ flip without authorize  
- Parallel UI Live re-run **does not block** this knife

## CMD+EXIT（实现方 + 专家复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r4-p-meta-serving-product:prove` | **0**（implementer ~00:22–00:26 · expert e2e-ha ~00:28 · expert rag-route ~00:28） |
| spawn `pnpm r4-p-meta-serving:prove` | **0** · **≠ FUNNEL-01 closed** |

---

*Slice · F5 · 2026-09-17 ~00:30 PT · post_prove_dual_pass · prove EXIT=0 · F4=`post_prove_dual_pass` · F3=`post_prove_dual_pass` · MS1–MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · sole 恰 5 · Ban R4 closed · Ban FUNNEL-01 closed · Ban forge · next=F6*
