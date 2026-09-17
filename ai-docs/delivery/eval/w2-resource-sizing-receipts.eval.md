# Eval — **W2** · Resource sizing receipts（**`REQUEST-ready / not_run:pre_dual`**）

**Date**: 2026-09-17 (~01:21 PT)  
**run-status**: **`REQUEST-ready / not_run:pre_dual`** · **zero coding · zero prove** · await pre-exec dual · **Dual PASS ≠ authorize coding**  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ capacity proof** · **≠ MySQL/Qdrant cutover**  
**Harness**: `ai-docs/delivery/harness/w2-resource-sizing-receipts.md`  
**Slice**: `ai-docs/delivery/w2-resource-sizing-receipts.slice.md`  
**Dual**: pre-exec REQUEST **drafted** · **not yet dual-sent** · no self-approve

---

## 1. Purpose

Expert **pre-exec** checklist for W2 sizing receipts docs gate.  
**Ban**: treating Dual PASS as coding authorize · claiming HA/suite/capacity · MySQL/Qdrant cutover revival · blocking F8/W1 · inventing prove EXIT.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| W0 parent sizing §2 | referenced | **referenced** | pg-retained harness §2 |
| Host classes | 2c4g vs 4c8g | **scoped** | harness §0–§2 |
| Stack | PG+pgvector+PostgresSaver | **fixed** | retained path |
| Local/doc sim OK | yes | **yes** | ≠ measured HA |
| Retest after W1b | noted · not authorized | **noted** | Dual ≠ W1b |
| F8 / W1 parallel | noted | **noted** | neither blocked |
| Coding / prove | none | **none** | `not_run:pre_dual` |
| Pre-exec dual | await | **REQUEST drafted · await** | Ban self-approve |

---

## 3. Eval cases

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree W2 = baseline sizing receipts under PG(+pgvector+PostgresSaver) only | docs agree |
| E2 | Agree compare **2c4g vs 4c8g** · local/doc simulation OK · ≠HA | harness scope |
| E3 | Agree parent W0 §2 is the retained sizing envelope to deepen | reference present |
| E4 | Agree Dual PASS ≠ authorize coding · Ban self-approve · zero coding this prep | hard pin |
| E5 | Agree may retest after W1b · Dual PASS ≠ authorize W1b | hard pin |
| E6 | Agree MySQL/Qdrant cutover remains STOPPED · F8/W1 parallel OK | PG-retained + SSOT |
| E7 | Agree `releaseEvidence=false` · ≠suite · ≠ capacity proof · Ban secrets | hard pins |

---

## 4. Fake-green checklist（pre-exec · for experts）

- [ ] Did not claim HA / suite green / releaseEvidence / capacity proof  
- [ ] Did not authorize coding / prove from Dual PASS  
- [ ] Did not revive MySQL or Qdrant cutover  
- [ ] Did not treat 2c4g/4c8g sketches as multi-AZ HA evidence  
- [ ] Did not authorize W1b deletes / migrations  
- [ ] Did not block or falsely close F8 / W1  
- [ ] Did not invent prove EXIT / self-approve  

---

## 5. Non-claims

Not pass · not coding · not HA · not suite · not capacity · not cutover · Dual PASS ≠ authorize coding

---

*Eval · W2 · 2026-09-17 (~01:21 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · zero coding*
