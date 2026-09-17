# Harness — Knife **F8** · **MS3 standard deploy product handoff**（**`executed:awaiting_post_prove_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~01:17 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ FUNNEL-01 dual-closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · coding+prove **executed** · post-prove REQUEST drafted · **Ban self-approve `post_prove_dual_pass`**）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-5 / MS3**  
**Slice**: `../r4-f8-p-meta-ms3-deploy-product.slice.md`  
**Eval**: `../eval/r4-f8-p-meta-ms3-deploy-product.eval.md`  
**Authority**: meetwise — F7 = **`post_prove_dual_pass`**（MS2 facets served · HEAD `cedda0d`）· F8 pre-exec dual **PASS** + authorize coding+prove · **MS3 standard deploy product handoff LANDED**（`standardDeployProductHandoff=true` · ≠ forge）· prove **EXIT=0** · **MS1/MS2 stay true** · product FUNNEL classifier **true**（MS1+MS2+MS3）· **G-R4-5 / FUNNEL dual-claim STILL OPEN**（await post-prove dual · other gates may remain · Ban claiming closed）· **≠ R4 closed** · **releaseEvidence=false** · **Ban forge serving** · **Ban claiming R4/FUNNEL/R1/G-R4-5 dual-closed** · **Ban flip without authorize** · **Ban self-approve**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Land **standard / combo-root product deploy handoff** evidence（MS3 / G-R4-5）after F7 served MS2 facets but left `standardDeployProductHandoff=false` |
| **What this knife is not** | Not R4 close · not 题域已隔离 · not HA · not suite green · not P-R1 fail-closed flip · not MODEL-OP · **not** forge serving · **not** self-approve `post_prove_dual_pass` · **not** MySQL/Qdrant cutover |
| **Why F8 = MS3 deploy** | F7 closed MS2 facets · left `standardDeployProductHandoff=false` — clearest remaining G-R4-5 gap = **MS3 standard deploy product handoff** |
| **MS1 pin** | **`routedServingProductConsumerWired=true`** MUST remain true（F6 dual-closed）· ≠ flip back |
| **MS2 pin** | **`fullFacetsServed=true`** · `facetsServedOnProductPath` = required set（F7 dual-closed）· ≠ flip back |
| **MS3 after this knife** | `standardDeployProductHandoff=true` via real handoff receipt（checklist：`local_01A_handoff_prove` · `combo_root_receipt` · `standard_or_cloud_deploy_receipt`）· **≠ forge** · **≠ claim R4 closed** |
| **G-R4-5 / FUNNEL** | Product MS surfaces complete · product FUNNEL classifier **true** · **dual-claim STILL OPEN**（await post-prove dual · other gates may remain · Ban claiming closed）· MS3 alone ≠ R4/题域 closed |
| **G-R4-3** | **STILL OPEN**（parallel · not preferred · Ban flip without authorize） |
| **01A / product surfaces** | 01A seal + MS1 + MS2 + MS3 product surfaces → product FUNNEL classifier true · **still ≠** claim whole R4 / 题域已隔离 without other gates |
| **Prior F7** | F7 = **`post_prove_dual_pass`** · MS2 served · HEAD `cedda0d` |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | Coding+prove **executed** · `pnpm r4-p-meta-ms3-deploy-product:prove` **EXIT=0** · status **`executed:awaiting_post_prove_dual`** · **MS1 true · MS2 served · MS3 true** · **Ban self-approve** |
| **Parallel（do not block）** | chromium → UI Live · G-R4-3 flip · **not** this F8 gate |

---

## 1. Scope（G-R4-5 / MS3）

| ID | Gap class | Intent this knife | Close R4 alone? |
|----|-----------|-------------------|-----------------|
| **MS3** | Standard deploy / combo-root **product** handoff | Land real product handoff evidence（≠ forge · ≠ claim R4 closed alone） | **否**（R4 / 题域 / other gates may remain；FUNNEL dual-claim await dual） |
| **MS3-P** | Hard pins | MS1/MS2 stay true · MS3 true after wire · MS3 alone ≠ R4/题域 closed · `releaseEvidence=false` · sole 恰 5 · Ban forge · Ban flip · Ban self-approve · G-R4-3 parallel | n/a |

**Out of scope this knife**: P-R1 fail-closed flip（G-R4-3）· F1 wrong_track · sole allowlist · Live Key · forge serving · claiming R4/题域/HA closed · MySQL/Qdrant cutover · self-approve `post_prove_dual_pass`.

**Sibling still open**: **G-R4-3 / P-R1**（parallel · not preferred）.

---

## 2. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names MS3 standard deploy product handoff（G-R4-5） | **met** |
| **M2** | Hard pins incl. Ban forge · `releaseEvidence=false` · sole 恰 5 · MS1/MS2 true · Ban dual-claim without dual · Ban self-approve | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · EXIT=0 | **met** · prove **EXIT=0** |
| **M5** | Coding gate: F1–F7 dual-closed · F8 pre-exec dual + authorize | **met** · coding+prove executed |
| **M6** | Dual REQUEST · no self-approve · post-prove await | **post-prove REQUEST drafted** · Ban self-approve |

### CMD（executed）

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-meta-ms3-deploy-product:prove`** | MS3 deploy product prove | **EXIT=0** · MS1 true · MS2 served · MS3 true · ≠ R4/HA · Ban dual-claim |
| Prior `pnpm r4-p-meta-ms2-facets-product:prove` | F7 MS2 旁证（spawned） | **EXIT=0** · MS1/MS2 true · MS3 now true |
| Prior `pnpm r4-p-meta-ms1-product-wire:prove` | F6 MS1 旁证 | **EXIT=0** · MS1 true |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-e2e-ha.md` | **PASS** · `2026-09-17-r4-f8-…-mw-e2e-ha.md` |
| pre-exec | `mw-rag-route` | `reviews/REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-rag-route.md` | **PASS** · `2026-09-17-r4-f8-…-mw-rag-route.md` |
| model-op | — | — | **omitted** |
| post-prove | `mw-e2e-ha` | `reviews/REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-post-prove-mw-e2e-ha.md` | **REQUEST drafted** · await |
| post-prove | `mw-rag-route` | `reviews/REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-post-prove-mw-rag-route.md` | **REQUEST drafted** · await |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ FUNNEL-01 dual-closed** · **≠ HA** · **≠ suite green**  
- **MS1 true** · **MS2 `fullFacetsServed=true`** · **MS3 `standardDeployProductHandoff=true`**  
- Product FUNNEL classifier **true**（MS1+MS2+MS3）· **G-R4-5 / FUNNEL dual-claim STILL OPEN**（await dual · other gates may remain · Ban claiming closed）  
- **MS3 alone ≠ R4/题域 closed**  
- **`releaseEvidence=false`** · ≠HA · sole **恰 5** · no self-approve · no flip default · no open DELETE  
- **Ban forging MetadataReviewReceipt / deploy handoff** · **Ban claiming R4/FUNNEL/R1/G-R4-5 dual-closed** · **Ban flip without authorize**  
- no `mw-model-op` · Parallel UI Live / G-R4-3 **do not block** F8  
- **Ban self-approve of `post_prove_dual_pass`** · **Ban MySQL/Qdrant cutover this knife**

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/r4-p-meta-ms1-product-wire.ts` | F6 MS1 consumer（must stay wired） |
| `apps/worker/src/r4-p-meta-ms2-facets-product.ts` | F7 MS2 facets（must stay served） |
| `apps/worker/src/r4-p-meta-ms3-deploy-product.ts` | **F8** · real MS3 standard deploy product handoff |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 classifiers · MS3 true |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 · `standardDeployHandoff=true` |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 · `standardDeployHandoff=true` |
| `apps/worker/test/r4-p-meta-ms3-deploy-product.proof.ts` | **F8 prove** |
| `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` | F7 prove 旁证（MS3 now true） |

---

## 6. Exec record

| Action | Status |
|--------|--------|
| F7 `post_prove_dual_pass` | **landed** · MS2 served · HEAD `cedda0d` |
| F8 pre-exec dual | **PASS**（e2e-ha + rag-route） |
| meetwise authorize coding+prove | **authorized** |
| Implement MS3 deploy product handoff | **landed** · `emitStandardDeployProductHandoff` |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | **EXIT=0**（~01:17 PT） |
| Honest flags | MS1 true · MS2 served · MS3 true · product FUNNEL classifier true · G-R4-5/FUNNEL dual-claim STILL OPEN · ≠ R4 closed |
| Post-prove dual | **REQUEST drafted** · **Ban self-approve** |

**Honest flags**: `routedServingProductConsumerWired=true` · `facetsServedOnProductPath=[competency,technology,difficulty,seniority,kind,language]` · `fullFacetsServed=true` · `standardDeployProductHandoff=true` · product FUNNEL classifier **true** · **G-R4-5 / FUNNEL dual-claim STILL OPEN** · G-R4-3 parallel **STILL OPEN** · **≠ R4 closed**.

**Next**: expert post-prove dual（e2e-ha + rag-route）· **Ban self-approve `post_prove_dual_pass`** · **≠ claim R4/题域/HA closed**.

---

*Harness · F8 MS3 standard deploy product handoff · 2026-09-17 ~01:17 PT · executed:awaiting_post_prove_dual · prove EXIT=0 · MS1 true · MS2 served · MS3 true · product FUNNEL classifier true · G-R4-5/FUNNEL dual-claim STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve*
