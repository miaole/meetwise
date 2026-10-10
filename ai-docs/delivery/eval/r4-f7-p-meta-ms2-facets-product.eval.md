# Eval — Knife **F7** · **MS2 facets on product path**（**`post_prove_dual_pass`**）

**Date**: 2026-09-17 (~01:07 PT)  
**run-status**: **`post_prove_dual_pass`** · prove **EXIT=0** · post-prove dual **PASS** · expert re-run **EXIT=0** both domains · HEAD `cedda0d`  
**releaseEvidence=false** · **Not HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ suite green** · **sole 恰 5** · **MS1 wired · MS2 served · MS3 still false · G-R4-5/P-META serving STILL OPEN** · **G-R4-3 STILL OPEN** · **≠ flip default**  
**Harness**: `ai-docs/delivery/harness/r4-f7-p-meta-ms2-facets-product.md`  
**Slice**: `ai-docs/delivery/r4-f7-p-meta-ms2-facets-product.slice.md`  
**Parent**: `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2**  
**Prior F6**: **`post_prove_dual_pass`**（MS1 wired）  
**Dual**: pre-exec **PASS** · coding+prove **executed** · post-prove dual **PASS** · no self-approve

---

## 1. Purpose

Expert **post-prove** checklist for **MS2 facets on product path**（G-R4-5 / MS2）after honest wire + prove EXIT=0 + independent dual PASS.  
**Ban**: treating MS2 as FUNNEL-01/R4/G-R4-5 closed · forging serving · claiming 题域已隔离 / HA / suite green · P-R1 flip without authorize · self-approve · inventing prove EXIT.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Prior F6 post-prove dual | pass | **pass** · F6=`post_prove_dual_pass` | MS1 wired |
| F7 pre-exec dual | pass | **pass** · e2e-ha + rag-route | docs gate · Dual PASS ≠ coding authorize（separate authorize landed） |
| Implement MS2 facets product | wire + proof | **landed** | `r4-p-meta-ms2-facets-product.ts` + proof |
| `pnpm r4-p-meta-ms2-facets-product:prove` | EXIT=0 | **EXIT=0**（~01:00 PT） | MS1 true · MS2 served · MS3 false · ≠ FUNNEL/R4/G-R4-5 closed |
| spawn F6 `r4-p-meta-ms1-product-wire:prove` | EXIT=0 | **EXIT=0** | MS2 now true · MS3 false |
| Implementer self-sign pass | **ban** | **not done** | experts write reviews/ |
| Post-prove dual | pass | **PASS** · e2e-ha ~01:03 PT EXIT=0 · rag-route ~01:03 PT EXIT=0 · HEAD `cedda0d` | Ban self-approve |

---

## 3. Eval cases ↔ harness

| ID | Eval point | Close R4? | Close FUNNEL-01? |
|----|------------|-----------|------------------|
| E1 / MS2 | Required facets served on product path · ≠ forge · MS1 stays true · MS3 stays false | 否 | 否（MS3 remain · **STILL OPEN**） |
| E2 / MS2-P | 01A ≠ 01 · MS2 alone ≠ FUNNEL-01/G-R4-5 closed · ≠ R4 closed · sole 恰 5 | 否 | 否 |
| E3 | Experts = e2e-ha + rag-route only（no model-op） | 否 | n/a |
| E4 | CMD EXIT=0 · post-prove dual PASS · no self-approve | 否 | n/a |
| E5 | `releaseEvidence=false` · sole 恰 5 · ≠ HA · ≠ suite green · Ban flip · Ban R4/FUNNEL/R1/G-R4-5 closed · Ban forge | 否 | n/a |
| E6 | MS3 deploy + G-R4-3 flip = parallel alt · **F8 = MS3 preferred next** · Ban flip without authorize | 否 | n/a |

---

## 4. Fake-green checklist（post-prove · experts confirmed）

- [x] Did not treat F7 EXIT=0 as FUNNEL-01 closed / R4 closed / G-R4-5 closed / MS product-done / forge OK  
- [x] Did not treat MS2 served as FUNNEL-01/G-R4-5 closed（MS3 remain）  
- [x] Did not self-approve `post_prove_dual_pass` before dual  
- [x] Did not invent prove EXIT / claim HA / suite green  
- [x] Did not forge MetadataReviewReceipt serving / claim MS3 wired  
- [x] Did not claim flip default / open DELETE / sole expand  
- [x] `releaseEvidence=false` · sole 恰 5 · no model-op unless domain need proven  
- [x] Agree MS1 stays true · MS2 served · MS3 still false · G-R4-5 STILL OPEN  
- [x] Agree G-R4-3 / P-R1 remains parallel open（Ban flip without authorize）  
- [x] Agree parallel UI Live re-run does **not** block / substitute this F7 knife  
- [x] Independently re-ran `pnpm r4-p-meta-ms2-facets-product:prove` and recorded EXIT=0（both domains · HEAD `cedda0d`）

---

## 5. Expert confirm（post-prove · **PASS**）

1. Independently re-run `pnpm r4-p-meta-ms2-facets-product:prove` — **EXIT=0** both domains（~01:03 PT · HEAD `cedda0d`）  
2. MS2 honestly served（`facetsServedOnProductPath` = required · `fullFacetsServed=true` · ≠ forge）· MS1 true · MS3 false — **yes**  
3. EXIT=0 still pins **≠ FUNNEL-01 / ≠ R4 / ≠ 题域已隔离 / ≠ R1 / ≠ G-R4-5 closed / ≠ HA / ≠ suite green** — **yes**  
4. MS2 alone ≠ FUNNEL-01/G-R4-5 closed（MS3 remain）· Ban forge · Ban flip without authorize — **yes**  
5. sole 恰 5 · `releaseEvidence=false` · no model-op · G-R4-3 STILL OPEN — **yes**  
6. harness advanced to `post_prove_dual_pass` only after dual · Ban implementer self-approve — **yes**

---

## 6. Next

**`post_prove_dual_pass`** landed · **still ≠** FUNNEL-01/R4 closed without MS3 · **still ≠** forge · G-R4-3 parallel open · **no flip without authorize**.  
**Next knife（F8）**: **MS3 standard deploy product handoff** — `REQUEST-ready / not_run:pre_dual` · zero coding · Ban self-approve of F8 · Dual PASS ≠ authorize coding.

---

*Eval · F7 MS2 facets on product path · 2026-09-17 (~01:07 PT) · post_prove_dual_pass · prove EXIT=0 · expert dual PASS · HEAD=cedda0d · MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve · next=F8 MS3*
