# Slice — Knife **F4** · **P-R1 fail-closed remaining**

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~00:08 PT)  
**Authority**: meetwise — F3 **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · G-R4-5 STILL OPEN）· F4 pre-exec dual **PASS** + authorize coding+prove · prove **EXIT=0** · **post-prove dual PASS**（expert re-run prove EXIT=0 both domains）  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ suite green** · **sole 恰 5** · **P-R1 / G-R4-3 STILL OPEN** · **PR1-A true · PR1-B/C false**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**no** model-op）· post-prove dual **PASS**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/r4-f4-p-r1-fail-closed.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-f4-p-r1-fail-closed.md` |
| Eval | `ai-docs/delivery/eval/r4-f4-p-r1-fail-closed.eval.md` |
| Prove | `pnpm r4-p-r1-fail-closed:prove` · **EXIT=0**（implementer ~23:59 PT · expert dual ~00:04 PT） |
| Helper | `apps/worker/src/r4-p-r1-fail-closed-remaining.ts` |
| Proof | `apps/worker/test/r4-p-r1-fail-closed.proof.ts` |
| REQUEST · e2e-ha（pre-exec） | `reviews/REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md` → review **pass** |
| REQUEST · rag-route（pre-exec） | `reviews/REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md` → review **pass** |
| post-prove · e2e-ha | `reviews/2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-e2e-ha.md` · **pass** · expert prove=0 |
| post-prove · rag-route | `reviews/2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md` · **pass** · expert prove=0 |
| Parent status | `harness/r4-domain-isolation-status.md` §13 · **G-R4-3** |
| Inventory | `harness/r4-domain-isolation.md` §2 / §6c.3 · P-R1 |
| Prior F3 | `r4-f3-p-meta-serving.slice.md` · **`post_prove_dual_pass`** · serving gaps **STILL OPEN** |
| Prior F2 | `r4-f2-p-meta-p-r1.slice.md` · **`post_prove_dual_pass`** · P-R1 **STILL OPEN** |
| Sibling F1 | `r4-f1-wrong-track-prod-surface.slice.md` · **`post_prove_dual_pass`** |
| Next F5 | `r4-f5-p-meta-serving-product.slice.md` · **`REQUEST-ready / not_run:pre_dual`** |

## One-line scope

**P-R1 fail-closed remaining** honesty（legacy tech-role default-on / fail-closed evidence · **G-R4-3**）after F3 serving honesty dual. Prove **EXIT=0** · post-prove dual **PASS** · **≠** R1 closed · **≠** flip default · **≠** R4 closed · **G-R4-3 STILL OPEN**.

## Hard pins

- ≠ R4 closed · ≠ 题域已隔离 · ≠ R1 closed · r1 prove ≠ R1 closed · F3 dual ≠ FUNNEL-01 closed · 01A ≠ 01  
- MAIN / NHP-ADV / F1 / F2 / F3 / **F4** dual **done** · P-R1 **STILL OPEN** · G-R4-5 **STILL OPEN**（→ **F5**）  
- EXIT=0 ≠ R1 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ flip authorized  
- PR1-A true · PR1-B/C false · `releaseEvidence=false` · ≠ HA · sole **恰 5** · no self-approve · **no flip default** · Ban R4 closed · Ban R1 closed  
- **next** = F5 P-META serving product remaining（MS1–MS3 / G-R4-5）· ≠ FUNNEL-01/R4 closed · ≠ forge serving

## CMD+EXIT（实现方 + 专家复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r4-p-r1-fail-closed:prove` | **0**（implementer ~23:59 · expert e2e-ha ~00:04 · expert rag-route ~00:04） |
| spawn `pnpm r1-tech-role-fail-closed:prove` | **0** · **≠ R1 closed** |

---

*Slice · F4 · 2026-09-17 ~00:08 PT · post_prove_dual_pass · prove EXIT=0 · F3=`post_prove_dual_pass` · releaseEvidence=false · ≠ R1 closed · ≠ flip default · PR1-A true · PR1-B/C false · G-R4-3 STILL OPEN · sole 恰 5 · Ban R4 closed · next=F5*
