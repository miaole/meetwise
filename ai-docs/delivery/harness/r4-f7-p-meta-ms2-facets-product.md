# Harness — Knife **F7** · **MS2 facets on product path**（**`REQUEST-ready / not_run:pre_dual`**）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~00:55 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec REQUEST pair · **not yet dual-sent** · **zero coding / zero prove** · **Ban self-approve**）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2**  
**Slice**: `../r4-f7-p-meta-ms2-facets-product.slice.md`  
**Eval**: `../eval/r4-f7-p-meta-ms2-facets-product.eval.md`  
**Authority**: meetwise — F6 = **`post_prove_dual_pass`**（MS1 wired · `routedServingProductConsumerWired=true` · **MS2/MS3 still false** · **G-R4-5 STILL OPEN** · ≠ FUNNEL-01/R4 closed · Ban forge）· F7 = **MS2 facets on product path**（still `facetsServedOnProductPath=[]`）· **docs only this turn** · **MS1 remains true** · **MS3 still false** · **G-R4-5 STILL OPEN** · MS2 alone ≠ FUNNEL-01/R4/G-R4-5 closed · **releaseEvidence=false** · **Ban forge serving** · **Ban claiming R4/FUNNEL/R1/G-R4-5 closed** · **Ban flip without authorize** · **Ban self-approve** · **Ban forge/flip status**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Serve required secondary facets on the **product** MetadataReviewReceipt path（MS2 / G-R4-5）after F6 wired MS1 consumer but left `facetsServedOnProductPath=[]` |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not FUNNEL-01 closed · not R1 closed · not MS1 re-wire · not MS3 deploy handoff · not P-R1 fail-closed flip · not MODEL-OP · **not** forge serving · **not** coding this turn · **not** self-approve |
| **Why F7 = MS2 facets** | F6 closed MS1 product wire · left facets served-on-product-path **empty** — clearest remaining G-R4-5 gap = **MS2 facets on product path**（MS3 deploy handoff = sibling · not preferred this knife） |
| **MS1 pin** | **`routedServingProductConsumerWired=true`** MUST remain true（F6 dual-closed）· ≠ flip back |
| **MS2 after this knife（target）** | Serve required facets on product path（plan already pinned：competency/technology/difficulty/seniority/kind/language）· **≠ forge** · **≠ claim FUNNEL-01 closed** |
| **MS3** | **still false** · `standardDeployProductHandoff=false`（out of scope this knife） |
| **G-R4-5** | **STILL OPEN**（needs MS3 even after MS2）· MS2 alone **≠** FUNNEL-01/R4 closed |
| **G-R4-3** | **STILL OPEN**（parallel · not preferred · Ban flip without authorize） |
| **01A ≠ 01** | 01A seal + MS1 wire + MS2 facets **still ≠** FUNNEL-01 closed without MS3 |
| **Prior F6** | F6 = **`post_prove_dual_pass`** · MS1 wired · MS2/MS3 still false · HEAD prove `2c06d6a` |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | **docs only** · status **`REQUEST-ready / not_run:pre_dual`** · **zero coding · zero prove** · await pre-exec dual |
| **Parallel（do not block）** | chromium → UI Live · MS3 deploy · G-R4-3 flip · **not** this F7 gate |

---

## 1. Scope（G-R4-5 / MS2）

| ID | Gap class | Intent this knife | Close R4 alone? |
|----|-----------|-------------------|-----------------|
| **MS2** | Full facets served on product path | Serve required facets on product path（≠ forge · ≠ claim FUNNEL-01 closed） | **否**（G-R4-5 still needs MS3；R4 still open） |
| **MS2-P** | Hard pins | MS1 stays true · MS3 stays false · 01A ≠ 01 · MS2 alone ≠ FUNNEL-01/R4/G-R4-5 closed · `releaseEvidence=false` · sole 恰 5 · Ban forge · Ban flip without authorize · G-R4-3 parallel | n/a |

**Out of scope this knife**: MS3 standard deploy handoff · P-R1 fail-closed flip（G-R4-3）· F1 wrong_track · sole allowlist · Live Key · forge serving · claiming FUNNEL-01/R4/R1/G-R4-5 closed · coding/prove this turn · self-approve.

**Sibling still open**: MS3 · **G-R4-3 / P-R1**（parallel · not preferred next）.

---

## 2. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names MS2 facets on product path（G-R4-5） | **met**（docs） |
| **M2** | Hard pins incl. Ban forge · `releaseEvidence=false` · sole 恰 5 · MS1 true · MS3 false · MS2 alone ≠ FUNNEL | **met**（docs） |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · **not_run:pre_dual** | **stub** · not executed |
| **M5** | Coding gate: F1–F6 dual-closed · F7 pre-exec dual + authorize | **await** pre-exec dual |
| **M6** | Dual REQUEST · no self-approve · not yet dual-sent | **REQUEST drafted** |

### CMD（planned · not run）

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-ms2-facets-product:prove`** | MS2 facets product prove（planned） | **`not_run:pre_dual`** · not implemented |
| Prior `pnpm r4-p-meta-ms1-product-wire:prove` | F6 MS1 旁证 | **EXIT=0** · MS1 true · MS2/MS3 false · post-prove dual PASS |
| Prior `pnpm r4-p-meta-serving-product:prove` | F5 product remaining 旁证 | **EXIT=0** · MS1 true · MS2/MS3 false |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md` | **REQUEST-ready** · await |
| pre-exec | `mw-rag-route` | `reviews/REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md` | **REQUEST-ready** · await |
| model-op | — | — | **omitted** |
| post-prove | — | — | **n/a**（no coding yet） |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01）  
- **MS1=`routedServingProductConsumerWired` true** · **MS2 still open** · **MS3 still false** · **G-R4-5 STILL OPEN**  
- **MS2 alone ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ R4 closed**（MS3 remain）  
- **`releaseEvidence=false`** · ≠HA · sole **恰 5** · no self-approve · no flip default · no open DELETE  
- **Ban forging MetadataReviewReceipt serving** · **Ban claiming R4/FUNNEL-01/R1/G-R4-5 closed** · **Ban flip without authorize**  
- no `mw-model-op` · Parallel UI Live / MS3 / G-R4-3 **do not block** F7 REQUEST  
- **zero coding / zero prove this turn** · **Ban self-approve of F7**

---

## 5. Code anchors（read-only this turn）

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-ms1-product-wire.ts` | F6 MS1 consumer（must stay wired） |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 classifiers · `facetsServedOnProductPath=[]` |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 serving honesty · `fullFacetsServed=false` |
| `apps/worker/test/r4-p-meta-ms1-product-wire.proof.ts` | F6 prove 旁证 |
| （planned）`apps/worker/src/r4-p-meta-ms2-facets-product.ts` | **F7 target** · not created this turn |
| （planned）`apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` | **F7 prove** · not created this turn |

---

## 6. Prep record

| Action | Status |
|--------|--------|
| F6 `post_prove_dual_pass` | **landed** · expert dual PASS · MS1 true · MS2/MS3 false |
| F7 harness/slice/eval/REQUEST | **drafted** · `REQUEST-ready / not_run:pre_dual` |
| Coding / prove | **banned this turn** |
| Self-approve | **banned** |

**Next**: expert pre-exec dual（e2e-ha + rag-route）· then meetwise authorize coding+prove · **Ban self-approve** · **≠ claim FUNNEL-01/R4/G-R4-5 closed**.

---

*Harness · F7 MS2 facets on product path · 2026-09-17 ~00:55 PT · REQUEST-ready / not_run:pre_dual · F6=`post_prove_dual_pass` · MS1 true · MS2/MS3 still open as scoped · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ FUNNEL-01 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve · zero coding*
