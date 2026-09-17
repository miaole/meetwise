# Harness — Knife **F5** · **P-META serving product remaining**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~00:30 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · coding+prove **executed** · prove **EXIT=0** · post-prove dual **PASS** · expert re-run prove **EXIT=0** both domains）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5**  
**Slice**: `../r4-f5-p-meta-serving-product.slice.md`  
**Eval**: `../eval/r4-f5-p-meta-serving-product.eval.md`  
**Authority**: meetwise — F4 = **`post_prove_dual_pass`**（honesty only · PR1-A true · PR1-B/C false · **G-R4-3/P-R1 STILL OPEN** · no flip）· F3 = **`post_prove_dual_pass`**（honesty only · **MS1–MS3 still false** · G-R4-5 **STILL OPEN**）· F5 pre-exec dual **PASS** + authorize coding+prove · prove **EXIT=0** · **post-prove dual PASS**（e2e-ha + rag-route · expert EXIT=0）→ harness **`post_prove_dual_pass`** · **MS1–MS3 still false**（honest product progress only · **Ban forge serving**）· **EXIT=0 ≠ FUNNEL-01/R4/R1 closed ≠ HA ≠ suite green ≠ knife product-done ≠ G-R4-5 closed** · **G-R4-5 STILL OPEN** · **releaseEvidence=false** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming R1 closed** · **Ban forge serving** · **Ban flip without authorize**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Honest **product remaining** progress toward P-META serving（MS1–MS3 / **G-R4-5**）：product contract / facet plan / deploy checklist **named** · MS1–MS3 **still false** · **≠** forge · **≠** claim FUNNEL-01 closed |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not R1 closed · not FUNNEL-01 closed · not F3 honesty re-run alone · not P-R1 flip · not MODEL-OP · **not** forged receipt serving · **not** product surface done · **not** G-R4-5 closed |
| **Why F5 = P-META serving product** | F3 closed **serving honesty** only（MS1–MS3 still false）· F4 closed **P-R1 fail-closed honesty**（G-R4-3 still open）· clearest still-open product remaining then = **MS1–MS3 / G-R4-5** |
| **01A ≠ 01** | F2/F3 sealed 01A honesty · **still ≠** independent routed serving + full facets + standard deploy handoff |
| **Prior F4** | F4 = **`post_prove_dual_pass`** · EXIT=0 ≠ R1/R4 closed · **G-R4-3 STILL OPEN** · no flip |
| **Prior F3** | F3 = **`post_prove_dual_pass`** · EXIT=0 ≠ FUNNEL-01/R4 closed · **MS1–MS3 still false** · G-R4-5 **STILL OPEN** |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | Coding+prove **executed** · `pnpm r4-p-meta-serving-product:prove` **EXIT=0** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · **MS1–MS3 still false** · **G-R4-5 STILL OPEN** · **next** = **F6 MS1 product wire**（routed MetadataReviewReceipt product consumer） |
| **Parallel（do not block）** | chromium → UI Live re-run may exist separately · **not** this F5 gate |

---

## 1. Scope（G-R4-5）

| ID | Gap class | Intent this knife | Close R4 alone? |
|----|-----------|-------------------|-----------------|
| **MS1** | Routed `MetadataReviewReceipt` serving product | Contract **named** · consumer **still unwired**（≠ forge） | **否**（**STILL OPEN** · still false） |
| **MS2** | Full facets served product | Facet plan **pinned** · served-on-path **still empty** | **否**（**STILL OPEN** · still false） |
| **MS3** | Standard deploy handoff product | Deploy checklist **named** · local 01A ≠ standard/cloud evidence | **否**（**STILL OPEN** · still false） |
| **MS4** | Hard pins | 01A ≠ 01 · ≠ FUNNEL-01/R4/R1 closed · `releaseEvidence=false` · sole 恰 5 · Ban forge · no P-R1 flip · G-R4-3 parallel | n/a |

**Out of scope**: P-R1 flip product path（G-R4-3 parallel）· F1 wrong_track · sole allowlist · Live Key · forge serving · claiming FUNNEL-01/R4/R1 closed.

---

## 2. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names P-META serving product remaining（MS1–MS3） | **met** |
| **M2** | Hard pins incl. Ban forge · `releaseEvidence=false` · sole 恰 5 | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · **executed** · EXIT=0 · expert re-run EXIT=0 | **met**（implementer ~00:22–00:26 PT · expert dual ~00:28 PT） |
| **M5** | Coding gate: F1–F4 dual-closed · F5 pre-exec dual + authorize | **satisfied** |
| **M6** | Dual REQUEST · no self-approve · **post-prove dual PASS** | **met** → **`post_prove_dual_pass`** |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-serving-product:prove`** | Product remaining prove（MS1–MS4） | **EXIT=0** · **MS1–MS3 still false** · ≠ FUNNEL-01/R4 closed |
| Prior `pnpm r4-p-meta-serving:prove` | F3 honesty 旁证（spawned） | **EXIT=0** · MS1–MS3 still false |
| Prior `pnpm r4-p-r1-fail-closed:prove` | F4 honesty 旁证 | **EXIT=0** · ≠ R1 closed |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-17-r4-f5-p-meta-serving-product-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-17-r4-f5-p-meta-serving-product-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-e2e-ha.md` | **pass** · expert prove **EXIT=0** |
| post-prove | `mw-rag-route` | `reviews/2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-rag-route.md` | **pass** · expert prove **EXIT=0** |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01）  
- **EXIT=0 ≠ FUNNEL-01/R4 closed ≠ HA ≠ suite green ≠ knife product-done ≠ forge OK ≠ G-R4-5 closed**  
- **MS1–MS3 still false** · **G-R4-5 STILL OPEN** · **G-R4-3 STILL OPEN**（parallel）  
- `releaseEvidence=false` · ≠HA · sole **恰 5** · no self-approve · no flip default · no open DELETE  
- **Ban forging MetadataReviewReceipt serving** · **Ban claiming R4/FUNNEL-01/R1 closed** · **Ban flip without authorize**  
- no `mw-model-op` · Parallel UI Live **does not block** F5  
- **next** = **F6 MS1 product wire**（routed MetadataReviewReceipt product serving consumer · G-R4-5 / MS1）· **≠** FUNNEL-01/R4 closed · **≠** forge · **≠** flip without authorize

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 MS1–MS3 serving honesty（still false） |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 honesty（serving/facets/deploy false） |
| `apps/worker/test/r4-p-meta-serving.proof.ts` | F3 prove 旁证 |
| `packages/db/src/principal.ts` | 01A `qbank_metadata_review_receipt` |
| `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md` | 01A ≠ 01 pin |
| `packages/db/test/qbank-handoff-closure.proof.ts` | local 01A旁证 ≠ standard deploy |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | **this knife** product remaining classifiers |
| `apps/worker/test/r4-p-meta-serving-product.proof.ts` | **this knife prove** · EXIT=0 · Ban forge |

---

## 6. Implementer + expert prove record

| CMD | EXIT | Read |
|-----|------|------|
| `pnpm r4-p-meta-serving-product:prove` | **0** | MS1–MS4 · product progress named · **MS1–MS3 still false** · F3 spawn EXIT=0 · expert dual ~00:28 PT EXIT=0 |

**Honest gaps remaining**: routed product consumer **unwired**（`routedServingProductConsumerWired=false`）· facets served-on-product-path **empty** · standard deploy product handoff evidence **missing** · **G-R4-5 STILL OPEN** · G-R4-3 parallel **STILL OPEN**.

**Next knife（F6）**: clearest = **wire real MetadataReviewReceipt product serving consumer（MS1）** — docs `REQUEST-ready / not_run:pre_dual` · zero coding this turn · Ban forge · Ban R4/FUNNEL closed · Ban flip without authorize. G-R4-3 fail-closed flip authorize path remains **parallel**（not preferred next）.

---

*Harness · F5 P-META serving product remaining · 2026-09-17 ~00:30 PT · post_prove_dual_pass · prove EXIT=0 · expert dual PASS · F4=`post_prove_dual_pass` · F3=`post_prove_dual_pass` · MS1–MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ FUNNEL-01 closed · ≠ R1 closed · sole 恰 5 · Ban forge serving · next=F6 MS1 product wire*
