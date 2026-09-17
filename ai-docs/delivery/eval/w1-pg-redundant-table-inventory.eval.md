# Eval — **W1** · PG redundant/obsolete table inventory（**`REQUEST-ready / not_run:pre_dual`**）

**Date**: 2026-09-17 (~01:20 PT)  
**run-status**: **`REQUEST-ready / not_run:pre_dual`** · **zero coding · zero DROP · zero prove** · await pre-exec dual · **Dual PASS ≠ authorize W1b deletes**  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ DROP** · **≠ MySQL/Qdrant cutover** · **≠ W8**  
**Harness**: `ai-docs/delivery/harness/w1-pg-redundant-table-inventory.md`  
**Slice**: `ai-docs/delivery/w1-pg-redundant-table-inventory.slice.md`  
**Dual**: pre-exec REQUEST **drafted** · **not yet dual-sent** · no self-approve

---

## 1. Purpose

Expert **pre-exec** checklist for W1 inventory docs gate.  
**Ban**: DROP/TRUNCATE · treating Dual PASS as W1b delete authorize · MySQL/Qdrant cutover revival · claiming HA/suite/W8 · blocking or closing F8 · inventing prove EXIT.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| W0 parent pointer | present | **present** | pg-retained + adr-postgres-retained |
| W0–W8 order note | brief in harness §1 | **present** | W2–W8 not opened |
| Inventory artifact plan | present | **present** | harness §3 |
| Provisional draft | optional read-only | **drafted** | `receipts/w1-pg-redundant-table-inventory.draft.md` · ≠ DROP list |
| DROP / destructive migrate | none | **none** | Ban explicit |
| F8 | parallel · not blocked | **noted** | MS3 may run parallel |
| Coding / prove | none | **none** | `not_run:pre_dual` |
| Pre-exec dual | await | **REQUEST drafted · await** | Ban self-approve |

---

## 3. Eval cases

| ID | Eval point | Pass means |
|----|------------|------------|
| E1 | Agree W1 = inventory only · ZERO deletes · Ban DROP/TRUNCATE | docs agree |
| E2 | Agree Dual PASS ≠ authorize W1b merge/retire / deletes · separate authorize + batch prove later | hard pin |
| E3 | Agree inventory method (migrations + packages/db + usage refs) is sufficient for docs gate | harness §4 |
| E4 | Agree provisional buckets A–F are hypothesis only · ≠ DROP backlog | harness §5 · draft receipt |
| E5 | Agree checkpoint + pgvector + Saver + active hot paths are HARD RETAIN | no retire candidates without separate prove |
| E6 | Agree MySQL/Qdrant cutover remains STOPPED · W1 does not revive | PG-retained parent |
| E7 | Agree F8 MS3 parallel OK · neither blocks the other · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding | hard pins |

---

## 4. Fake-green checklist（pre-exec · for experts）

- [ ] Did not authorize DROP / TRUNCATE / destructive migrate  
- [ ] Did not treat Dual PASS as W1b delete / migration-retire authorize  
- [ ] Did not claim HA / suite green / releaseEvidence / W8  
- [ ] Did not revive MySQL or Qdrant cutover  
- [ ] Did not mark provisional draft rows as approved deletes  
- [ ] Did not block or falsely close F8  
- [ ] Did not invent prove EXIT / self-approve  

---

## 5. Non-claims

Not pass · not coding · not DROP · not W1b · not HA · not suite · not cutover · Dual PASS ≠ authorize deletes

---

*Eval · W1 · 2026-09-17 (~01:20 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ZERO deletes · zero coding*
