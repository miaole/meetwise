# Harness — Knife **F8** · **MS3 standard deploy product handoff**（**`REQUEST-ready / not_run:pre_dual`**）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:07 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec REQUEST pair · **not yet dual-sent** · **zero coding / zero prove** · **Ban self-approve** · **Dual PASS ≠ authorize coding**）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5 / MS3**  
**Slice**: `../r4-f8-p-meta-ms3-deploy-product.slice.md`  
**Eval**: `../eval/r4-f8-p-meta-ms3-deploy-product.eval.md`  
**Authority**: meetwise — F7 = **`post_prove_dual_pass`**（MS2 facets served · `fullFacetsServed=true` · HEAD `cedda0d` · **MS1 true** · **MS3 still false** · **G-R4-5 STILL OPEN** · ≠ FUNNEL-01/R4 closed · Ban forge）· F8 = **MS3 standard deploy product handoff**（`standardDeployProductHandoff=false`）· **docs only this turn** · **MS1/MS2 remain true** · **MS3 still false until authorized** · **G-R4-5 STILL OPEN until MS3 done** · even after MS3 **may still not close FUNNEL alone** if other gates remain · **releaseEvidence=false** · **Ban forge serving** · **Ban claiming R4/FUNNEL/R1/G-R4-5 closed** · **Ban flip without authorize** · **Ban self-approve** · **Ban forge/flip status** · **Dual PASS ≠ authorize coding**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Land **standard / combo-root product deploy handoff** evidence（MS3 / G-R4-5）after F7 served MS2 facets but left `standardDeployProductHandoff=false` |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not automatic FUNNEL-01 closed · not R1 closed · not MS1/MS2 re-wire · not P-R1 fail-closed flip · not MODEL-OP · **not** forge serving · **not** coding this turn · **not** self-approve · **not** Dual PASS = coding authorize |
| **Why F8 = MS3 deploy** | F7 closed MS2 facets · left `standardDeployProductHandoff=false` — clearest remaining G-R4-5 gap = **MS3 standard deploy product handoff**（G-R4-3 flip = sibling · not preferred this knife） |
| **MS1 pin** | **`routedServingProductConsumerWired=true`** MUST remain true（F6 dual-closed）· ≠ flip back |
| **MS2 pin** | **`fullFacetsServed=true`** · `facetsServedOnProductPath` = required set（F7 dual-closed）· ≠ flip back |
| **MS3 after this knife（target）** | `standardDeployProductHandoff=true` via real handoff receipt（checklist：`local_01A_handoff_prove` · `combo_root_receipt` · `standard_or_cloud_deploy_receipt`）· **≠ forge** · **≠ claim R4 closed** |
| **MS3 now** | **still false** · until authorized coding+prove |
| **G-R4-5** | **STILL OPEN until MS3 done** · after MS3 may close G-R4-5 product surface · **FUNNEL-01 may still remain open** if other gates remain（wrong_track / R1 / production · be honest） |
| **G-R4-3** | **STILL OPEN**（parallel · not preferred · Ban flip without authorize） |
| **01A ≠ 01** | 01A seal + MS1 + MS2 + MS3 product surfaces may close product FUNNEL classifier · **still ≠** claim whole R4 / 题域已隔离 without other gates |
| **Prior F7** | F7 = **`post_prove_dual_pass`** · MS2 served · HEAD `cedda0d` |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | **docs only** · status **`REQUEST-ready / not_run:pre_dual`** · **zero coding · zero prove** · await pre-exec dual · **Dual PASS ≠ authorize coding** |
| **Parallel（do not block）** | chromium → UI Live · G-R4-3 flip · **not** this F8 gate |

---

## 1. Scope（G-R4-5 / MS3）

| ID | Gap class | Intent this knife | Close R4 alone? |
|----|-----------|-------------------|-----------------|
| **MS3** | Standard deploy / combo-root **product** handoff | Land real product handoff evidence（≠ forge · ≠ claim FUNNEL/R4 closed alone） | **否**（R4 / 题域 / other gates may remain；FUNNEL may still have non-MS gates） |
| **MS3-P** | Hard pins | MS1/MS2 stay true · MS3 false until authorized · 01A ≠ 01 · MS3 alone may not close FUNNEL if other gates remain · `releaseEvidence=false` · sole 恰 5 · Ban forge · Ban flip · Dual PASS ≠ coding authorize · G-R4-3 parallel | n/a |

**Out of scope this knife**: P-R1 fail-closed flip（G-R4-3）· F1 wrong_track · sole allowlist · Live Key · forge serving · claiming FUNNEL-01/R4/R1 closed from docs alone · coding/prove this turn · self-approve · treating Dual PASS as coding authorize.

**Sibling still open**: **G-R4-3 / P-R1**（parallel · not preferred next）.

---

## 2. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names MS3 standard deploy product handoff（G-R4-5） | **met**（docs） |
| **M2** | Hard pins incl. Ban forge · `releaseEvidence=false` · sole 恰 5 · MS1/MS2 true · MS3 false · Dual PASS ≠ coding · MS3 alone may ≠ FUNNEL alone | **met**（docs） |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · **not_run:pre_dual** | **stub** · not executed |
| **M5** | Coding gate: F1–F7 dual-closed · F8 pre-exec dual + authorize | **await** pre-exec dual · Dual PASS ≠ authorize |
| **M6** | Dual REQUEST · no self-approve · not yet dual-sent | **REQUEST drafted** |

### CMD（planned · not run）

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-ms3-deploy-product:prove`** | MS3 deploy product prove（planned） | **`not_run:pre_dual`** · not implemented |
| Prior `pnpm r4-p-meta-ms2-facets-product:prove` | F7 MS2 旁证 | **EXIT=0** · MS1/MS2 true · MS3 false · post-prove dual PASS · HEAD `cedda0d` |
| Prior `pnpm r4-p-meta-ms1-product-wire:prove` | F6 MS1 旁证 | **EXIT=0** · MS1 true |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-e2e-ha.md` | **REQUEST-ready** · await |
| pre-exec | `mw-rag-route` | `reviews/REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-rag-route.md` | **REQUEST-ready** · await |
| model-op | — | — | **omitted** |
| post-prove | — | — | **n/a**（no coding yet） |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01；other gates may remain even after MS3）  
- **MS1 true** · **MS2 `fullFacetsServed=true`** · **MS3 still false until authorized** · **G-R4-5 STILL OPEN until MS3 done**  
- **MS3 alone may still ≠ FUNNEL-01 closed** if other gates remain · **≠** claim R4 closed from MS3 alone  
- **`releaseEvidence=false`** · ≠HA · sole **恰 5** · no self-approve · no flip default · no open DELETE  
- **Ban forging MetadataReviewReceipt / deploy handoff** · **Ban claiming R4/FUNNEL-01/R1/G-R4-5 closed** · **Ban flip without authorize**  
- no `mw-model-op` · Parallel UI Live / G-R4-3 **do not block** F8 REQUEST  
- **zero coding / zero prove this turn** · **Ban self-approve of F8** · **Dual PASS ≠ authorize coding**

---

## 5. Code anchors（read-only this turn）

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-ms1-product-wire.ts` | F6 MS1 consumer（must stay wired） |
| `apps/worker/src/r4-p-meta-ms2-facets-product.ts` | F7 MS2 facets（must stay served） |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 classifiers · `standardDeployProductHandoff=false` · checklist named |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 serving honesty · `standardDeployHandoff=false` |
| `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` | F7 prove 旁证 |
| （planned）`apps/worker/src/r4-p-meta-ms3-deploy-product.ts` | **F8 target** · not created this turn |
| （planned）`apps/worker/test/r4-p-meta-ms3-deploy-product.proof.ts` | **F8 prove** · not created this turn |

---

## 6. Prep record

| Action | Status |
|--------|--------|
| F7 `post_prove_dual_pass` | **landed** · expert dual PASS · MS1 true · MS2 served · MS3 false · HEAD `cedda0d` |
| F8 harness/slice/eval/REQUEST | **drafted** · `REQUEST-ready / not_run:pre_dual` |
| Coding / prove | **banned this turn** |
| Self-approve | **banned** |
| Dual PASS as coding authorize | **banned**（needs separate meetwise authorize） |

**Next**: expert pre-exec dual（e2e-ha + rag-route）· then meetwise authorize coding+prove · **Ban self-approve** · **Dual PASS ≠ authorize coding** · **≠ claim FUNNEL-01/R4/G-R4-5 closed from docs**.

---

*Harness · F8 MS3 standard deploy product handoff · 2026-09-17 (~01:07 PT) · REQUEST-ready / not_run:pre_dual · F7=`post_prove_dual_pass` · MS1 true · MS2 fullFacetsServed=true · MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ FUNNEL-01 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve · Dual PASS ≠ authorize coding · zero coding*
