# Eval — Knife **F8** · **MS3 standard deploy product handoff**（**`executed:awaiting_post_prove_dual`**）

**Date**: 2026-09-17 (~01:17 PT)  
**run-status**: **`executed:awaiting_post_prove_dual`** · coding+prove **executed** · prove **EXIT=0** · post-prove REQUEST drafted · **Ban self-approve `post_prove_dual_pass`**  
**releaseEvidence=false** · **Not HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ suite green** · **sole 恰 5** · **MS1 wired · MS2 served · MS3 true** · product FUNNEL classifier **true** · **G-R4-5 / FUNNEL dual-claim STILL OPEN** · **G-R4-3 STILL OPEN** · **≠ flip default**  
**Harness**: `ai-docs/delivery/harness/r4-f8-p-meta-ms3-deploy-product.md`  
**Slice**: `ai-docs/delivery/r4-f8-p-meta-ms3-deploy-product.slice.md`  
**Parent**: `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS3**  
**Prior F7**: **`post_prove_dual_pass`**（MS2 served · HEAD `cedda0d`）  
**Prior F6**: **`post_prove_dual_pass`**（MS1 wired）  
**Dual**: pre-exec **PASS** · post-prove REQUEST **drafted** · Ban self-approve

---

## 1. Purpose

Expert **post-prove** checklist for **MS3 standard deploy product handoff**（G-R4-5 / MS3）after coding+prove EXIT=0.  
**Ban**: treating EXIT=0 as R4/题域/HA closed · self-approve `post_prove_dual_pass` · forging handoff · claiming FUNNEL/G-R4-5 dual-closed without dual · P-R1 flip · MySQL/Qdrant cutover.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Prior F7 post-prove dual | pass | **pass** · F7=`post_prove_dual_pass` | MS2 served · HEAD `cedda0d` |
| F8 pre-exec dual | pass | **pass** | e2e-ha + rag-route |
| meetwise authorize coding+prove | authorized | **authorized** | F8 coding+prove |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | EXIT=0 | **EXIT=0** | MS1/MS2/MS3 true · ≠ R4/HA |
| spawn F7 MS2 prove | EXIT=0 | **EXIT=0** | MS3 now true |
| Implementer self-sign pass | **ban** | **not done** | experts write reviews/ |
| Post-prove dual | await | **REQUEST drafted · await** | Ban self-approve |

---

## 3. Eval cases ↔ harness

| ID | Eval point | Close R4? | Dual-claim FUNNEL/G-R4-5? |
|----|------------|-----------|---------------------------|
| E1 / MS3 | Standard deploy product handoff evidence · ≠ forge · MS1/MS2 stay true · MS3 true | 否 | 否（await dual · other gates may remain） |
| E2 / MS3-P | MS3 alone ≠ R4/题域 · G-R4-5/FUNNEL dual-claim STILL OPEN · sole 恰 5 | 否 | 否 |
| E3 | Experts = e2e-ha + rag-route only（no model-op） | 否 | n/a |
| E4 | CMD EXIT=0 · Ban self-approve `post_prove_dual_pass` | 否 | n/a |
| E5 | `releaseEvidence=false` · sole 恰 5 · ≠ HA · ≠ suite green · Ban flip · Ban forge | 否 | n/a |
| E6 | G-R4-3 flip = parallel alt · **not preferred** · Ban flip without authorize | 否 | n/a |

---

## 4. Fake-green checklist（post-prove · for experts）

- [ ] Did not treat EXIT=0 as R4 closed / 题域已隔离 / HA / suite green / knife dual-done  
- [ ] Did not self-approve `post_prove_dual_pass`  
- [ ] Did not forge deploy handoff / invent releaseEvidence  
- [ ] Agree MS1 true · MS2 fullFacetsServed=true · MS3 `standardDeployProductHandoff=true`  
- [ ] Agree product FUNNEL classifier true · **G-R4-5 / FUNNEL dual-claim STILL OPEN**（await dual · other gates may remain）  
- [ ] Agree MS3 alone ≠ R4/题域 closed · Ban claiming FUNNEL/G-R4-5 dual-closed without dual  
- [ ] Agree G-R4-3 / P-R1 remains parallel open（Ban flip without authorize）  
- [ ] Agree parallel UI Live re-run does **not** block / substitute this F8 knife  
- [ ] `releaseEvidence=false` · sole 恰 5 · no model-op · no MySQL/Qdrant cutover

---

## 5. Expert confirm（post-prove · awaiting）

1. Independently re-run `pnpm r4-p-meta-ms3-deploy-product:prove` — CMD+EXIT?  
2. MS3 honest handoff（`standardDeployProductHandoff=true` · checklist · ≠ forge）· MS1/MS2 true?  
3. EXIT=0 still pins **≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ HA / ≠ suite green**?  
4. Product FUNNEL classifier true · still Ban claiming FUNNEL/G-R4-5 dual-closed without dual?  
5. harness/status/eval incorrectly claim `post_prove_dual_pass` / R4 closed?（expect：**否**）  
6. sole 恰 5？`releaseEvidence=false`？no flip？no model-op？  
7. G-R4-3 still STILL OPEN？MS3 alone ≠ R4 closed？

---

## 6. Next

Await expert post-prove dual **PASS** → coordinator may advance harness to `post_prove_dual_pass`（**Ban self-approve**）.  
Even after dual: **≠ R4 closed ≠ 题域已隔离** · G-R4-3 parallel open · **no flip without authorize**.

Parallel（do not block）：`g7-ui-live-rerun-after-chromium` · G-R4-3 flip may proceed separately later.

---

*Eval · F8 MS3 standard deploy product handoff · 2026-09-17 (~01:17 PT) · executed:awaiting_post_prove_dual · prove EXIT=0 · MS1 true · MS2 fullFacetsServed=true · MS3 true · product FUNNEL classifier true · G-R4-5/FUNNEL dual-claim STILL OPEN · G-R4-3 STILL OPEN · releaseEvidence=false · ≠HA · ≠ R4 closed · sole 恰 5 · Ban forge · Ban flip without authorize · Ban self-approve*
