# Review — Knife **F7** · **MS2 facets on product path** **post-prove** · mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~01:03 PT；对抗独立审 · **不采信**实现方自报 EXIT；实现方禁止自批）  
**结论**：**pass**（限：post-prove honesty — **MS1=true** · **MS2 served=true** · **MS3=false** · 专家独立复跑 EXIT=0 · **MS2=true does NOT close G-R4-5 / FUNNEL-01** · **G-R4-5 / FUNNEL STILL OPEN（EXPECTED · correct）** · `releaseEvidence=false` · ≠HA · sole 恰 5 · Ban forge · no P-R1 flip · ≠ R4/FUNNEL/题域/R1 closed · ≠ suite green）  
**硬钉**：**EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ R1 closed ≠ HA ≠ suite green ≠ knife product-done ≠ G-R4-5 closed** · **MS2=true does NOT close G-R4-5 / FUNNEL-01** · **MS3 still false** · **G-R4-5 / P-META serving STILL OPEN** · **G-R4-3 / P-R1 parallel open** · **Ban forge serving** · **no flip default** · **no Live Key×3** · **no self-approve** · **omit model-op** · HEAD `cedda0d` · Key **unset**（本审 unset）· 未读 `.env*` · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed**  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代改 harness（coordinator 可在双域齐后 → `post_prove_dual_pass` · 仍 ≠ FUNNEL-01/R4/G-R4-5 closed · MS3 still false · G-R4-5 STILL OPEN · Ban forge）

覆盖 REQUEST：`REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md`  
对照：`harness/r4-f7-p-meta-ms2-facets-product.md` · `eval/r4-f7-p-meta-ms2-facets-product.eval.md` · `r4-f7-p-meta-ms2-facets-product.slice.md` · status §13 · **G-R4-5 / MS2** · `harness/r4-domain-isolation.md` §2 / §6c.3 · `apps/worker/src/r4-p-meta-ms2-facets-product.ts` · `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` · `apps/worker/src/r4-p-meta-serving-product-remaining.ts` · `apps/worker/src/r4-p-meta-serving-remaining.ts` · Prior F6 **`post_prove_dual_pass`** · Prior F5 **`post_prove_dual_pass`** · Prior F4 **`post_prove_dual_pass`** · 前序 pre-exec `2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`（pass） · SOLE 恰 5

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — NOT close FUNNEL-01 / R4 / 题域已隔离 / R1 / G-R4-5 · NOT forge OK · NOT knife product-done |
| Implementer self-approve | **rejected** |
| `pnpm r4-p-meta-ms2-facets-product:prove`（expert re-run） | **EXIT=0** |
| `:prove:raw` | **n/a**（harness：no PG） |
| MS1 / MS2 / MS3 | **MS1=true** · **MS2=true（served）** · **MS3=false** |
| G-R4-5 / P-META serving product | **STILL OPEN**（MS2 alone ≠ close · **EXPECTED · correct** · MS3 remain） |
| G-R4-3 / P-R1 | **parallel open** · not this F7 · Ban flip without authorize |
| F6 `post_prove_dual_pass` | named prior MS1 wire · F7 now serves facets · **still ≠** FUNNEL-01 / G-R4-5 closed |
| F5 / F4 `post_prove_dual_pass` | F5 ≠ G-R4-5/FUNNEL closed · F4 ≠ R1 closed / ≠ flip · G-R4-3 STILL OPEN |
| harness/eval/status | still `executed:awaiting_post_prove_dual` · **did not** claim FUNNEL-01/R4/G-R4-5 closed / post_prove_dual_pass |
| `releaseEvidence` | **false** |
| sole | **恰 5 未翻** |
| omit `mw-model-op` | **still correct** |
| Blockers（this domain） | **none**（pair independent） |

---

## 1. Independent re-run（~01:03 PT · HEAD `cedda0d`）

| CMD | EXIT | Read |
|-----|------|------|
| **`pnpm r4-p-meta-ms2-facets-product:prove`** | **0** | MS2 served · MS1 true · MS3 still false · ≠ FUNNEL-01/R4/G-R4-5 closed · F6 spawn EXIT=0 |
| `:prove:raw` | n/a | harness does not require |

**Banner**：`OK  r4-p-meta-ms2-facets-product prove (MS2 served; MS1 true; MS3 still false; ≠ FUNNEL-01/R4/G-R4-5 closed; releaseEvidence=false)`

**Receipt highlights**

- MS1：`MS1_METADATA_REVIEW_RECEIPT_PRODUCT_SERVING_CONSUMER_WIRED=true` · `routedServingProductConsumerWired=true` · `METADATA_REVIEW_RECEIPT_SERVING_PRODUCT_CONTRACT.wired=true` · F3 `routedServingConsumerWired=true` · F2 `routedServingWired=true` · pin **stays true**（≠ flip back）· F6 harness `post_prove_dual_pass`
- MS2：`MS2_PRODUCT_FACETS_SERVED_ON_PRODUCT_PATH_WIRED=true` · serve id `r4-p-meta-ms2-facets-product:serveRequiredSecondaryFacetsOnProductPath` · plan = served = `[competency,technology,difficulty,seniority,kind,language]` · `facetsServedOnProductPath` = required set · F3 `fullFacetsServed=true` · F2 `fullFacetsServed=true` · admitted+valid → served · `standardDeployHandoff=false` · non-admitted / invalid payload → fail-closed · **≠ forge DB rows** · only allowed worker src files name MetadataReviewReceipt · inventory/status P-META / G-R4-5 open
- MS3：`productDeployHandoffChecklistNamed=true` · **`standardDeployProductHandoff=false`** · `local01AHandoffProveExists=true` · F3/F2 `standardDeployHandoff=false` · local handoff prove **≠** standard/cloud deploy
- MS4：`isProductFunnel01Closed=false`（MS3 remain）· `isProduct01ANotEqual01=true` · `productAlignsWithF3Serving=true` · F3 `isServingFunnel01Closed=false` · F2 `isRagFunnel01Closed=false` · `gR43PR1ParallelOpen=true` · harness pins ≠ R4 / ≠ FUNNEL-01 / ≠ R1 / 01A ≠ 01 / `releaseEvidence=false` / ≠HA / sole 恰 5 · Ban forge · MS2 alone ≠ FUNNEL · omit model-op · F6/F5/F4=`post_prove_dual_pass` · status 题域隔离 NOT closed · **G-R4-5 STILL OPEN · MS3 remain** · SOLE 恰 5 · F7 NOT on allowlist · no invent `MODEL_API_KEY` · no P-R1 flip · P-R1 fail-closed still OFF
- F6 spawn：`pnpm r4-p-meta-ms1-product-wire:prove` **EXIT=0**（旁证 · MS2 now true · MS3 false · ≠ FUNNEL-01/G-R4-5 closed）
- F5/F3 cascade（via F6）：`pnpm r4-p-meta-serving-product:prove` / `pnpm r4-p-meta-serving:prove` **EXIT=0** · classifiers align MS2 served · MS3 false

**Key**：本审 unset `MODEL_API_KEY` · no invent · no `.env*` read · no Live Key×3

**Sole spot**：5 items (`wiring` / `ping` / `qdrant-backed` / `vectorstore-adapter` / `vectorstore-qdrant`) · no `p-meta-ms2` / F7

**HEAD**：`cedda0d9acca5279475476908df1d434c8a5e641`（`cedda0d` · `feat(r4): F7 MS2 facets on product path (prove EXIT=0)`）

---

## 2. REQUEST Q1–Q7（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | Independent re-run prove + EXIT？ | **Done** — `pnpm r4-p-meta-ms2-facets-product:prove` **EXIT=0**（~01:03 PT · HEAD `cedda0d`）；`:raw` n/a；banner OK · MS2 served · MS1 true · MS3 still false |
| **2** | MS2 facets 诚实 served on product path（plan = served · ≠ forge）· MS1 true · MS3 false？ | **Agree** — `serveRequiredSecondaryFacetsOnProductPath` real serve · marker/classifiers **true** · plan = served（6 facets）· **≠ forge DB** · MS1 pin stays true · **`standardDeployProductHandoff=false`** · `isProductFunnel01Closed=false` |
| **3** | EXIT=0 still pins ≠ FUNNEL-01 / ≠ R4 / ≠ 题域已隔离 / ≠ R1 / ≠ G-R4-5 closed / ≠ HA / ≠ suite green？ | **Yes（hard）** — also ≠ knife product-done · status/harness/eval/prove summary all pin |
| **4** | Classifiers（F2/F3/F5）与 MS2 wire 对齐且仍钉 FUNNEL open（MS3 false）？ | **Yes** — F5 `facetsServedOnProductPath=required` · F3/F2 `fullFacetsServed=true` · all three `standardDeploy*Handoff=false` · `isProductFunnel01Closed=false` / `isServingFunnel01Closed=false` / `isRagFunnel01Closed=false` · `productAlignsWithF3Serving=true` · `servingAlignsWithF2Remaining=true` |
| **5** | harness/status/eval wrongly claim FUNNEL-01/R4/G-R4-5 closed / post_prove_dual_pass？ | **No** — still `executed:awaiting_post_prove_dual`；explicit MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN · Ban forge · Ban self-approve |
| **6** | sole 恰 5 · `releaseEvidence=false` · no model-op · Ban flip without authorize？ | **Yes** — SOLE 5 · F7 not listed · `releaseEvidence=false` · omit model-op **correct** · no P-R1 flip |
| **7** | G-R4-5 / G-R4-3 仍 STILL OPEN？MS2 alone ≠ FUNNEL/G-R4-5 closed？ | **Yes（hard）** — **MS2=true ≠ G-R4-5/FUNNEL closed（EXPECTED · correct）** · MS3 remain → FUNNEL-01 / G-R4-5 **STILL OPEN** · G-R4-3 parallel open · F4 honesty only · **≠** R1 closed · **≠** flip · Ban flip without authorize |

---

## 3. RAG / metadata · FUNNEL focus（post-prove）

| Point | Ruling |
|-------|--------|
| **MS2 real product-path facet serve（G-R4-5 / MS2）** | `serveRequiredSecondaryFacetsOnProductPath` + marker true · classifiers honest（`facetsServedOnProductPath=required` · `fullFacetsServed=true`）· fail-closed reject paths · **≠ forge** |
| **MS2=true ≠ G-R4-5 / FUNNEL closed** | **EXPECTED · correct** — MS3 `standardDeployProductHandoff=false` → `isProductFunnel01Closed=false` · **G-R4-5 STILL OPEN** · **FUNNEL STILL OPEN** |
| **MS1 pin** | stays **true**（F6 dual-closed · ≠ flip back） |
| **MS3 deploy** | Checklist named · local 01A handoff prove **旁证** · **≠** standard/cloud deploy · still false |
| **01A ≠ 01** | 01A seal + MS1 wire + MS2 facets **still ≠** FUNNEL-01 closed without MS3 |
| **Relative F6** | F6=`post_prove_dual_pass` MS1 wire · left facets empty；F7 serves facets · **still does not close** 01 / G-R4-5 |
| **Relative F5/F4** | F5 dual ≠ G-R4-5/FUNNEL closed；F4 dual ≠ R1 closed / flip · G-R4-3 STILL OPEN · **not** this F7 |
| **Layering** | F7 prove EXIT=0 → await post-prove dual →（later）`post_prove_dual_pass` **still ≠** FUNNEL-01/R4/G-R4-5 / 题域已隔离 · MS3 still false · Ban forge |

---

## 4. Fake-green bans（this review）

- Ban：EXIT=0 / MS2=true → FUNNEL-01 closed / R4 closed / 题域已隔离 / R1 closed / HA / suite green / knife product-done / **G-R4-5 closed**  
- Ban：MS2 facets serve → claim MS3 wired / forge MetadataReviewReceipt serving  
- Ban：01A seal / F6 MS1 wire / F7 MS2 facets → FUNNEL-01 closed  
- Ban：F4 dual → R1 closed / flip · F5/F6 dual → G-R4-5 / FUNNEL closed  
- Ban：implementer REQUEST = expert pass · self-approve · claim `post_prove_dual_pass` without dual  
- Ban：flip P-R1 default · open DELETE · sole expand · invent Live Key×3 · forge serving  
- Ban：missing model-op as blocker（omit **correct**）  
- Ban：single-domain pass = dual-complete without pair · Ban claiming R4 closed · Ban claiming FUNNEL-01 closed · Ban claiming G-R4-5 closed

---

## 5. Approve / do-not-approve

**Approve**：post-prove honesty that `pnpm r4-p-meta-ms2-facets-product:prove` independently EXIT=0 documents **real MS2 product-path facet serve**；plan = served（6 secondary facets）· classifiers honest · **≠ forge** · **MS1=true** · **MS2=true** · **MS3=false** · 01A ≠ 01 · **MS2=true ≠ FUNNEL-01 / ≠ G-R4-5 closed（EXPECTED · correct）** · G-R4-5 **STILL OPEN** · FUNNEL **STILL OPEN** · G-R4-3 parallel open · `releaseEvidence=false` · ≠HA · sole 恰 5 · no flip · no model-op · no Live×3 · no self-approve.

**Do not approve**：RAG-FUNNEL-01 closed · R4 closed · 题域已隔离 · R1 closed · **G-R4-5 closed** · HA · suite green · `releaseEvidence=true` · sole cutover · flip default · open DELETE · forge MetadataReviewReceipt serving · claiming MS2=true closed G-R4-5 / FUNNEL-01 · treating this single-domain pass as dual-complete without pair · Ban claiming R4 closed · Ban claiming FUNNEL-01 closed · Ban claiming G-R4-5 closed.

---

## 6. Receipt

- Expert：`mw-rag-route`
- Cover：`REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md`
- Conclusion：`ai-docs/delivery/reviews/2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md`
- Expert EXIT：`pnpm r4-p-meta-ms2-facets-product:prove` → **EXIT=0**（~01:03 PT · HEAD `cedda0d`）
- Confirm：MS1=true · MS2=true（served）· MS3=false · G-R4-5 STILL OPEN（EXPECTED）· FUNNEL STILL OPEN · 01A ≠ 01 · ≠ forge · EXIT=0 ≠ FUNNEL-01/R4/R1/题域/HA/suite/knife-product-done/G-R4-5 closed · sole 恰 5 · `releaseEvidence=false` · no P-R1 flip · no Live×3 · Key unset · 未读 `.env*` · omit model-op · 拒绝自批 · 配对独立 · **Ban R4 closed** · **Ban FUNNEL-01 closed** · **Ban G-R4-5 closed** · **Ban forge serving** · **本审不代改 harness**

---

*Review · mw-rag-route · F7 MS2 facets on product path post-prove · 2026-09-17 ~01:03 PT · pass（honesty only）· expert EXIT=0 · HEAD=cedda0d · releaseEvidence=false · ≠HA · ≠R4 closed · ≠FUNNEL-01 closed · MS1=true · MS2=true · MS3=false · G-R4-5 STILL OPEN（EXPECTED）· FUNNEL STILL OPEN · MS2=true ≠ close G-R4-5/FUNNEL · sole 恰 5 · Ban forge · no self-approve · Ban R4/FUNNEL/G-R4-5 closed*
