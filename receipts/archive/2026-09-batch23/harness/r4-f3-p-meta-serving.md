# Harness — Knife **F3** · **P-META serving remaining**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-16 (~23:51 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · coding+prove **executed** · post-prove dual **PASS** · expert re-run prove **EXIT=0**）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5**  
**Slice**: `../r4-f3-p-meta-serving.slice.md`  
**Eval**: `../eval/r4-f3-p-meta-serving.eval.md`  
**Authority**: meetwise — F2 = **`post_prove_dual_pass`**（honesty only · P-META/P-R1 gaps **STILL OPEN**）· F3 pre-exec dual **PASS** + authorize coding+prove · prove **EXIT=0** · **post-prove dual PASS** → harness **`post_prove_dual_pass`** · **EXIT=0 ≠ FUNNEL-01/R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ knife done** · **01A ≠ 01** · **sole 恰 5** · **MS1–MS3 still false · G-R4-5/P-META serving STILL OPEN** · **releaseEvidence=false** · **Ban claiming R4 closed**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Honesty / remaining-gap prove for **P-META serving** after F2 honesty dual: **routed `MetadataReviewReceipt` serving** + facets/deploy honesty toward RAG-FUNNEL-01（**G-R4-5** · MS1–MS3） |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not R1 closed · not FUNNEL-01 closed · not F2 re-run · not P-R1 default-on product flip · not MODEL-OP · **not** forged receipt serving · **not** knife product-done |
| **Why F3 = P-META serving** | F2 dual left `routedServingWired=false` · `fullFacetsServed=false` · `standardDeployHandoff=false` · G-R4-5 still open · clearest actionable remaining vs P-R1 fail-closed default-on（parallel → **F4**） |
| **01A ≠ 01** | F2 sealed 01A honesty · **still ≠** independent routed serving + full facets + standard deploy handoff |
| **Prior F2** | F2 = **`post_prove_dual_pass`** · EXIT=0 ≠ R1/FUNNEL-01/R4 closed · **product gaps STILL OPEN** |
| **Prior F1** | F1 = **`post_prove_dual_pass`** · ≠ R4 closed ≠ prod fully closed · NHP covered ≠ F1 alone |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | Coding+prove **executed** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · **MS1–MS3 still false** · **G-R4-5 / P-META serving STILL OPEN** · next follow = **F4 P-R1 fail-closed remaining** |

---

## 1. Scope（P-META serving remaining · G-R4-5）

| ID | Gap class | Intent this knife（honesty） | Close R4 alone? |
|----|-----------|------------------------------|-----------------|
| **MS1** | Routed `MetadataReviewReceipt` serving | Honesty: no product routed serving consumer（≠ forge · ≠ 01A seal alone） | **否**（**STILL OPEN**） |
| **MS2** | Full facets served | Honesty: required secondary facets inventory named · served-on-path empty | **否**（**STILL OPEN**） |
| **MS3** | Standard deploy handoff | Honesty: local 01A handoff prove ≠ standard/cloud deploy receipt | **否**（**STILL OPEN**） |
| **MS4** | Hard pins | 01A ≠ 01 · F2 dual ≠ FUNNEL-01 closed · ≠ R4 closed · `releaseEvidence=false` · sole 恰 5 · no P-R1 flip | n/a |

**Out of scope this knife**: P-R1 default-on / flag flip product path（→ **F4**）· F1 wrong_track · sole allowlist · Live Key · forge receipt serving · claiming FUNNEL-01/R4 closed.

**Sibling still open**: **P-R1** / G-R4-3（F2 honesty only · product still open）— next = **F4**.

---

## 2. Acceptance（M1–M6 · met for honesty dual）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names P-META serving remaining（MS1–MS3）from G-R4-5 / F2 leftover | **met** |
| **M2** | Hard pins: ≠ R4 closed · ≠ 题域已隔离 · ≠ FUNNEL-01 closed · 01A ≠ 01 · `releaseEvidence=false` · ≠ HA · sole 恰 5 | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · executed · EXIT=0 · expert re-run EXIT=0 | **met** |
| **M5** | Coding gate: F1+F2 dual-closed · F3 pre-exec dual + authorize | **satisfied** |
| **M6** | Dual REQUEST pair · no self-approve · **post-prove dual PASS** | **met** → **`post_prove_dual_pass`** |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-serving:prove`** | Honesty / remaining-gap prove for P-META serving（MS1–MS4） | **EXIT=0**（implementer ~23:50 PT · expert re-run both domains ~23:50 PT） |
| Prior `pnpm r4-p-meta-p-r1:prove` | F2 honesty 旁证 | **EXIT=0** · **≠** FUNNEL-01 closed · **≠** this knife alone |
| `pnpm qbank-handoff-closure:prove` | 01A local旁证（static pin · not re-run） | **≠** RAG-FUNNEL-01 closed · **≠** standard deploy |

**Note**: harness does **not** require `:prove:raw` / isolated PG（serving honesty；no PG）. EXIT=0 **≠** FUNNEL-01/R4 closed · **≠** knife done as product close.

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-16-r4-f3-p-meta-serving-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-16-r4-f3-p-meta-serving-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted**（no MODEL-OP domain need） |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-f3-p-meta-serving-post-prove-mw-e2e-ha.md` | **pass** · expert prove **EXIT=0** |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-f3-p-meta-serving-post-prove-mw-rag-route.md` | **pass** · expert prove **EXIT=0** |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离**  
- **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01）  
- **F2 `post_prove_dual_pass` ≠ FUNNEL-01 closed ≠ R4 closed**  
- **EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ knife done**  
- **MS1–MS3 still false** · **P-META serving product gaps STILL OPEN**（**G-R4-5 still open**）  
- **≠ HA** · `releaseEvidence=false` · no self-approve  
- **MAIN sole∩scor-00 / NHP-ADV / F1 / F2 all `post_prove_dual_pass`（done）** · F3 post-prove dual **PASS**  
- sole allowlist **恰 5 未翻** · ≠ R5 retired ≠ sole cutover ≠ G1 flip · no flip default · no open DELETE  
- no `mw-model-op` REQUEST unless domain need proven  
- **Ban forging MetadataReviewReceipt serving** · **Ban claiming R4 closed**  
- **next** = **F4 P-R1 fail-closed remaining**（G-R4-3 · docs `REQUEST-ready / not_run:pre_dual`）· **≠** R1 closed · **≠** flip default without authorize

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | **this knife** MS1–MS3 serving honesty classifiers |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 honesty classifiers（aligned · serving/facets/deploy **false**） |
| `apps/worker/test/r4-p-meta-serving.proof.ts` | **this knife prove** |
| `packages/db/src/principal.ts` | 01A `qbank_metadata_review_receipt` manifest |
| `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md` | 01A ≠ 01 pin |
| `packages/db/test/qbank-handoff-closure.proof.ts` | local 01A旁证 ≠ standard deploy |

---

*Harness · F3 P-META serving remaining · 2026-09-16 ~23:51 PT · post_prove_dual_pass · prove EXIT=0 · expert dual PASS · MS1–MS3 still false · G-R4-5 STILL OPEN · F2=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ FUNNEL-01 closed · sole 恰 5 · next=F4 · no model-op*
