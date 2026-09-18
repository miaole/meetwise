# Eval — **W2** · Resource sizing receipts（**`post_prove_dual_pass`**）

**Date**: 2026-09-17 (~01:35 PT)  
**run-status**: **`post_prove_dual_pass`** · **zero coding · zero prove** · pre-exec dual **PASS** · **Dual PASS ≠ authorize coding** · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity**  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ capacity proof** · **≠ MySQL/Qdrant cutover** · **≠ coding authorized**  
**Harness**: `ai-docs/delivery/harness/w2-resource-sizing-receipts.md`  
**Slice**: `ai-docs/delivery/w2-resource-sizing-receipts.slice.md`  
**Dual**: `reviews/2026-09-17-w2-resource-sizing-receipts-mw-e2e-ha.md` + `…-mw-rag-route.md` → **pass** · dual SHA **`3463e9e`** · no self-approve

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
| Coding / prove | none | **none** | docs-only close |
| Pre-exec dual | PASS both domains | **`post_prove_dual_pass`** · receipts archived · dual SHA `3463e9e` | Ban self-approve · Dual PASS ≠ coding · sizing ≠ HA/capacity |

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

Docs close **`post_prove_dual_pass` only** · not coding · not HA · not suite · not capacity · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity** · not cutover · Dual PASS ≠ authorize coding · `releaseEvidence=false`

---

*Eval · W2 · 2026-09-17 (~01:35 PT) · post_prove_dual_pass · dual on 3463e9e · releaseEvidence=false · ≠HA · ≠suite · ≠capacity · sizing≠HA · Dual PASS≠fake capacity · 2c4g vs 4c8g · PG+pgvector+PostgresSaver · zero coding*
