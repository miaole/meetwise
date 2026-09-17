# Harness — Knife **F7** · **MS2 facets on product path**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:07 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · coding+prove **executed** · prove **EXIT=0** · post-prove dual **PASS** · expert re-run prove **EXIT=0** both domains · HEAD `cedda0d`）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2**  
**Slice**: `../r4-f7-p-meta-ms2-facets-product.slice.md`  
**Eval**: `../eval/r4-f7-p-meta-ms2-facets-product.eval.md`  
**Authority**: meetwise — F6 = **`post_prove_dual_pass`**（MS1 wired）· F7 pre-exec dual **PASS** + authorize coding+prove · **MS2 product facets SERVED**（`facetsServedOnProductPath` = required set · `fullFacetsServed=true` · ≠ forge）· prove **EXIT=0** · **post-prove dual PASS**（e2e-ha + rag-route · expert EXIT=0 · HEAD `cedda0d`）→ harness **`post_prove_dual_pass`** · **MS1 stays true** · **MS3 still false** · **G-R4-5 STILL OPEN** · MS2 alone **≠** FUNNEL-01/R4/G-R4-5 closed · **releaseEvidence=false** · **Ban forge serving** · **Ban claiming R4/FUNNEL/R1/G-R4-5 closed** · **Ban flip without authorize** · **Ban self-approve**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Serve required secondary facets on the **product** MetadataReviewReceipt path（MS2 / G-R4-5）after F6 wired MS1 consumer but left `facetsServedOnProductPath=[]` |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not FUNNEL-01 closed · not R1 closed · not MS1 re-wire · not MS3 deploy handoff · not P-R1 fail-closed flip · not MODEL-OP · **not** forge serving · **not** self-approve |
| **Why F7 = MS2 facets** | F6 closed MS1 product wire · left facets served-on-product-path **empty** — clearest remaining G-R4-5 gap = **MS2 facets on product path**（MS3 deploy handoff = sibling · opened as F8） |
| **MS1 pin** | **`routedServingProductConsumerWired=true`** MUST remain true（F6 dual-closed）· ≠ flip back |
| **MS2 after this knife** | Required facets **served** on product path（competency/technology/difficulty/seniority/kind/language）· **≠ forge** · **≠ claim FUNNEL-01 closed** |
| **MS3** | **still false** · `standardDeployProductHandoff=false`（out of scope this knife · **next = F8**） |
| **G-R4-5** | **STILL OPEN**（needs MS3 even after MS2）· MS2 alone **≠** FUNNEL-01/R4 closed |
| **G-R4-3** | **STILL OPEN**（parallel · not preferred · Ban flip without authorize） |
| **01A ≠ 01** | 01A seal + MS1 wire + MS2 facets **still ≠** FUNNEL-01 closed without MS3 |
| **Prior F6** | F6 = **`post_prove_dual_pass`** · MS1 wired · HEAD prove `2c06d6a` |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | Coding+prove **executed** · `pnpm r4-p-meta-ms2-facets-product:prove` **EXIT=0** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · **MS1 true · MS2 served · MS3 still false** · **G-R4-5 STILL OPEN** · **next** = **F8 MS3 standard deploy product handoff** |
| **Parallel（do not block）** | chromium → UI Live · G-R4-3 flip · **not** this F7 gate |

---

## 1. Scope（G-R4-5 / MS2）

| ID | Gap class | Intent this knife | Close R4 alone? |
|----|-----------|-------------------|-----------------|
| **MS2** | Full facets served on product path | Serve required facets on product path（≠ forge · ≠ claim FUNNEL-01 closed） | **否**（G-R4-5 still needs MS3；R4 still open） |
| **MS2-P** | Hard pins | MS1 stays true · MS3 stays false · 01A ≠ 01 · MS2 alone ≠ FUNNEL-01/R4/G-R4-5 closed · `releaseEvidence=false` · sole 恰 5 · Ban forge · Ban flip without authorize · G-R4-3 parallel | n/a |

**Out of scope this knife**: MS3 standard deploy handoff · P-R1 fail-closed flip（G-R4-3）· F1 wrong_track · sole allowlist · Live Key · forge serving · claiming FUNNEL-01/R4/R1/G-R4-5 closed · self-approve.

**Sibling still open**: **MS3（F8）** · **G-R4-3 / P-R1**（parallel · not preferred next）.

---

## 2. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names MS2 facets on product path（G-R4-5） | **met** |
| **M2** | Hard pins incl. Ban forge · `releaseEvidence=false` · sole 恰 5 · MS1 true · MS3 false · MS2 alone ≠ FUNNEL | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · **executed** · EXIT=0 · expert re-run EXIT=0 | **met**（implementer ~01:00 PT · expert dual ~01:03 PT · HEAD `cedda0d`） |
| **M5** | Coding gate: F1–F6 dual-closed · F7 pre-exec dual + authorize | **met** · coding+prove executed |
| **M6** | Post-prove dual · no self-approve · **post-prove dual PASS** | **met** → **`post_prove_dual_pass`** |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-ms2-facets-product:prove`** | MS2 facets product prove | **EXIT=0** · MS1 true · MS2 served · MS3 false · ≠ FUNNEL-01/R4/G-R4-5 closed · expert dual EXIT=0 |
| Prior `pnpm r4-p-meta-ms1-product-wire:prove` | F6 MS1 旁证（spawned） | **EXIT=0** · MS1 true · MS2 now true · MS3 false |
| Prior `pnpm r4-p-meta-serving-product:prove` | F5 product remaining 旁证 | **EXIT=0** · MS1/MS2 true · MS3 false |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-e2e-ha.md` | **pass** · expert prove **EXIT=0** · HEAD `cedda0d` |
| post-prove | `mw-rag-route` | `reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md` | **pass** · expert prove **EXIT=0** · HEAD `cedda0d` |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01）  
- **MS1=`routedServingProductConsumerWired` true** · **MS2 served** · **MS3 still false** · **G-R4-5 STILL OPEN**  
- **MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed**（MS3 remain）  
- **`releaseEvidence=false`** · ≠HA · sole **恰 5** · no self-approve · no flip default · no open DELETE  
- **Ban forging MetadataReviewReceipt serving** · **Ban claiming R4/FUNNEL-01/R1/G-R4-5 closed** · **Ban flip without authorize**  
- no `mw-model-op` · Parallel UI Live / G-R4-3 **do not block** F7  
- **post_prove_dual_pass** · still ≠ FUNNEL-01/R4/G-R4-5 closed · MS3 remain  
- **next** = **F8 MS3 standard deploy product handoff**（`standardDeployProductHandoff` still `false`）

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-ms1-product-wire.ts` | F6 MS1 consumer（must stay wired） |
| `apps/worker/src/r4-p-meta-ms2-facets-product.ts` | **F7** · real MS2 product-path facet serve |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 classifiers · MS2 served · MS3 false |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 serving honesty · `fullFacetsServed=true` |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 · `fullFacetsServed=true` · MS3 false |
| `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` | **F7 prove** · EXIT=0 |
| `apps/worker/test/r4-p-meta-ms1-product-wire.proof.ts` | F6 prove 旁证（MS2 now true） |

---

## 6. Implementer + expert prove record

| CMD | EXIT | Read |
|-----|------|------|
| `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | MS1 true · MS2 served · MS3 still false · F6/F5/F3 spawn EXIT=0 · ≠ FUNNEL-01/R4/G-R4-5 closed · expert dual ~01:03 PT EXIT=0 · HEAD `cedda0d` |

**Honest flags**: `routedServingProductConsumerWired=true` · `facetsServedOnProductPath=[competency,technology,difficulty,seniority,kind,language]` · `fullFacetsServed=true` · `standardDeployProductHandoff=false` · **G-R4-5 STILL OPEN** · G-R4-3 parallel **STILL OPEN**.

**Next knife（F8）**: clearest = **MS3 standard deploy product handoff**（`standardDeployProductHandoff=false`）— docs `REQUEST-ready / not_run:pre_dual` · zero coding this turn · Ban forge · Ban R4/FUNNEL/G-R4-5 closed · Ban flip without authorize · Dual PASS ≠ authorize coding. G-R4-3 fail-closed flip remain **parallel**（not preferred next）.

---

*Harness · F7 MS2 facets on product path · 2026-09-17 (~01:07 PT) · post_prove_dual_pass · prove EXIT=0 · expert dual PASS · HEAD=cedda0d · MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ FUNNEL-01 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve · next=F8 MS3 deploy product handoff*
