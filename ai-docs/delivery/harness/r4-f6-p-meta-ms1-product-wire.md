# Harness — Knife **F6** · **MS1 MetadataReviewReceipt product wire**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~00:55 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · coding+prove **executed** · prove **EXIT=0** · post-prove dual **PASS** · expert re-run prove **EXIT=0** both domains · HEAD `2c06d6a`）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5 / MS1**  
**Slice**: `../r4-f6-p-meta-ms1-product-wire.slice.md`  
**Eval**: `../eval/r4-f6-p-meta-ms1-product-wire.eval.md`  
**Authority**: meetwise — F5 = **`post_prove_dual_pass`**（honesty only · product contract/plan/checklist **named**）· F6 pre-exec dual **PASS** + authorize coding+prove · **MS1 product consumer WIRED**（`routedServingProductConsumerWired=true` · contract.wired=true · ≠ forge）· prove **EXIT=0** · **post-prove dual PASS**（e2e-ha + rag-route · expert EXIT=0 · HEAD `2c06d6a`）→ harness **`post_prove_dual_pass`** · **MS2/MS3 still false** · **G-R4-5 STILL OPEN** · wiring MS1 alone **≠** FUNNEL-01/R4/R1 closed ≠ HA ≠ suite green ≠ G-R4-5 closed · **releaseEvidence=false** · **Ban forge serving** · **Ban claiming R4/FUNNEL/R1 closed** · **Ban flip without authorize** · **Ban self-approve**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Wire a **real** routed `MetadataReviewReceipt` product serving consumer（MS1 / G-R4-5）after F5 named the product contract but left consumer unwired |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not FUNNEL-01 closed · not R1 closed · not MS2 facets path · not MS3 deploy handoff · not P-R1 fail-closed flip · not MODEL-OP · **not** forge serving · **not** self-approve |
| **Why F6 = MS1 product wire** | F5 closed product-remaining **honesty** with `productServingContractNamed=true` · left `routedServingProductConsumerWired=false` — clearest actionable remaining = **wire real product consumer（MS1）** |
| **MS1 after this knife** | **`routedServingProductConsumerWired=true`** · contract.wired=true · admit path live · **≠ forge** |
| **MS2/MS3** | **still false** · facetsServedOnProductPath=[] · standardDeployProductHandoff=false |
| **G-R4-5** | **STILL OPEN**（needs MS2/MS3）· wiring MS1 alone **≠** FUNNEL-01/R4 closed |
| **G-R4-3** | **STILL OPEN**（parallel · not preferred · Ban flip without authorize） |
| **01A ≠ 01** | 01A seal + MS1 wire **still ≠** FUNNEL-01 closed |
| **Prior F5** | F5 = **`post_prove_dual_pass`** · honesty only · named contract |
| **Prior F4** | F4 = **`post_prove_dual_pass`** · G-R4-3 **STILL OPEN** · no flip |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | Coding+prove **executed** · `pnpm r4-p-meta-ms1-product-wire:prove` **EXIT=0** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · **MS1 wired** · **MS2/MS3 still false** · **G-R4-5 STILL OPEN** · **next** = **F7 MS2 facets on product path** |
| **Parallel（do not block）** | chromium → UI Live re-run may exist separately · **not** this F6 gate |

---

## 1. Scope（G-R4-5 / MS1）

| ID | Gap class | Intent this knife | Close R4 alone? |
|----|-----------|-------------------|-----------------|
| **MS1** | Routed `MetadataReviewReceipt` product serving consumer | **Wire real product consumer**（≠ forge · ≠ claim FUNNEL-01 closed） | **否**（G-R4-5 still needs MS2/MS3；R4 still open） |
| **MS1-P** | Hard pins | 01A ≠ 01 · MS1 alone ≠ FUNNEL-01/R4/R1 closed · `releaseEvidence=false` · sole 恰 5 · Ban forge · Ban flip without authorize · G-R4-3 parallel | n/a |

**Out of scope this knife**: MS2 full facets served-on-path · MS3 standard deploy handoff · P-R1 fail-closed flip（G-R4-3 · needs authorize）· F1 wrong_track · sole allowlist · Live Key · forge serving · claiming FUNNEL-01/R4/R1 closed · self-approve post-prove.

**Sibling still open**: MS2 / MS3 · **G-R4-3 / P-R1**（parallel · not preferred next）.

---

## 2. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names MS1 product wire（G-R4-5） | **met** |
| **M2** | Hard pins incl. Ban forge · `releaseEvidence=false` · sole 恰 5 · Ban flip without authorize · MS1 alone ≠ FUNNEL | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · **executed** · EXIT=0 · expert re-run EXIT=0 | **met**（implementer ~00:45 PT · expert dual ~00:48–00:50 PT · HEAD `2c06d6a`） |
| **M5** | Coding gate: F1–F5 dual-closed · F6 pre-exec dual PASS + authorize | **met** |
| **M6** | Post-prove dual · no self-approve · **post-prove dual PASS** | **met** → **`post_prove_dual_pass`** |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-ms1-product-wire:prove`** | MS1 product wire prove | **EXIT=0** · MS1 wired · MS2/MS3 still false · ≠ FUNNEL-01/R4/G-R4-5 closed · expert dual EXIT=0 |
| Prior `pnpm r4-p-meta-serving-product:prove` | F5 product remaining 旁证（spawned） | **EXIT=0** · MS1 now true · MS2/MS3 still false |
| Prior `pnpm r4-p-meta-serving:prove` | F3 honesty 旁证 | **EXIT=0** · MS1 now true · MS2/MS3 still false |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-17-r4-f6-p-meta-ms1-product-wire-post-prove-mw-e2e-ha.md` | **pass** · expert prove **EXIT=0** · HEAD `2c06d6a` |
| post-prove | `mw-rag-route` | `reviews/2026-09-17-r4-f6-p-meta-ms1-product-wire-post-prove-mw-rag-route.md` | **pass** · expert prove **EXIT=0** · HEAD `2c06d6a` |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01）  
- **MS1 wired ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed** · **MS2/MS3 still false** · **G-R4-5 STILL OPEN**  
- **Wiring MS1 alone ≠ FUNNEL-01 closed ≠ R4 closed**（MS2/MS3 remain）  
- **`releaseEvidence=false`** · ≠HA · sole **恰 5** · no self-approve · no flip default · no open DELETE  
- **Ban forging MetadataReviewReceipt serving** · **Ban claiming R4/FUNNEL-01/R1 closed** · **Ban flip without authorize**  
- no `mw-model-op` · Parallel UI Live **does not block** F6  
- **post_prove_dual_pass** · still ≠ FUNNEL-01/R4/G-R4-5 closed · MS2/MS3 remain  
- G-R4-3 fail-closed flip = **parallel alternative · not preferred**
- **next** = **F7 MS2 facets on product path**（`facetsServedOnProductPath` still `[]`）

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-ms1-product-wire.ts` | **F6 MS1 real product serving consumer**（admit path） |
| `apps/worker/test/r4-p-meta-ms1-product-wire.proof.ts` | **this knife prove** · EXIT=0 |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | F5 classifiers · MS1 now true · MS2/MS3 false |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 serving honesty · MS1 now true |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 remaining · routedServingWired now true |
| `packages/db/src/principal.ts` | 01A `qbank_metadata_review_receipt` |
| `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md` | 01A ≠ 01 pin |

---

## 6. Implementer + expert prove record

| CMD | EXIT | Read |
|-----|------|------|
| `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | MS1 wired · MS2/MS3 still false · F5 spawn EXIT=0 · ≠ FUNNEL-01/R4/G-R4-5 closed · expert dual ~00:48–00:50 PT EXIT=0 · HEAD `2c06d6a` |

**Honest flags**: `routedServingProductConsumerWired=true` · `METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT.wired=true` · `facetsServedOnProductPath=[]` · `standardDeployProductHandoff=false` · **G-R4-5 STILL OPEN** · G-R4-3 parallel **STILL OPEN**.

**Next knife（F7）**: clearest = **MS2 facets on product path**（serve required facets on product path · still `facetsServedOnProductPath=[]`）— docs `REQUEST-ready / not_run:pre_dual` · zero coding this turn · Ban forge · Ban R4/FUNNEL/G-R4-5 closed · Ban flip without authorize. MS3 standard deploy handoff + G-R4-3 fail-closed flip remain **parallel**（not preferred next）.

---

*Harness · F6 MS1 MetadataReviewReceipt product wire · 2026-09-17 ~00:55 PT · post_prove_dual_pass · prove EXIT=0 · expert dual PASS · HEAD=2c06d6a · MS1 wired · MS2/MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ FUNNEL-01 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve · next=F7 MS2 facets product path*
