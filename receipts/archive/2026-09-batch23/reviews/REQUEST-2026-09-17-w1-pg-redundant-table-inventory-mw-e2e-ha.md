# REQUEST — **W1** · PG redundant/obsolete table inventory（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize W1b deletes**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:20 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ DROP** · **≠ MySQL/Qdrant cutover** · **≠ W8**  
**Pair**: `REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md`  
**Hard**: meetwise W0→W1→(later W1b)→W2…W8 SSOT · **W1 = inventory ZERO deletes** · Ban DROP/TRUNCATE/destructive migrate · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · F8 parallel OK · **zero coding / zero prove** · Dual PASS ≠ authorize W1b · Ban self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/w1-pg-redundant-table-inventory.md` | Canonical harness（W0–W8 · artifact plan · Ban DROP） |
| `w1-pg-redundant-table-inventory.slice.md` | Slice index |
| `eval/w1-pg-redundant-table-inventory.eval.md` | Pre-exec eval |
| `receipts/w1-pg-redundant-table-inventory.draft.md` | Provisional read-only draft · ≠ DROP list |
| Parent W0 | `harness/pg-retained-checkpoint-postgres-saver.md` · `adr-postgres-retained.md` |
| Parallel **untouched / not blocked** | F8 MS3 · commerce · egress · R4 meta product |

---

## Stance（E2E-HA）

1. Docs-only inventory gate for redundant/obsolete/duplicate/legacy PG tables & columns  
2. **ZERO deletes** this knife · Ban DROP/TRUNCATE  
3. Dual PASS ≠ authorize W1b merge/retire migrations / deletes  
4. W2…W8 noted only · **not opened**  
5. MySQL/Qdrant cutover remains STOPPED  
6. **`not_run:pre_dual`** · zero coding · F8 may run parallel  

---

## Please answer

1. Agree W1 scope = inventory only · ZERO deletes · Ban DROP/TRUNCATE/destructive migrate?  
2. Agree Dual PASS ≠ authorize W1b deletes / batch retire · separate authorize required later?  
3. Agree harness artifact plan (§3) + method (§4) are enough for this docs gate?  
4. Agree provisional buckets / draft receipt are hypothesis only · ≠ approved delete backlog?  
5. Agree checkpoint + pgvector + PostgresSaver + hot business paths are HARD RETAIN?  
6. Agree W0–W8 order note is honest · W2–W8 not opened · F8 parallel OK · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · Ban self-approve · zero coding?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not DROP authorized · not W1b authorized · not HA · not suite · not MySQL/Qdrant cutover · not W8 · Dual PASS ≠ authorize deletes

---

*REQUEST · mw-e2e-ha · W1 · 2026-09-17 (~01:20 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ZERO deletes · Dual PASS ≠ authorize W1b · zero coding · Ban self-approve*
