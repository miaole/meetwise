# REQUEST — **W1** · PG redundant/obsolete table inventory（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize W1b deletes**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~01:20 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ DROP** · **≠ Qdrant cutover** · **≠ R4 closed** · **≠ W8**  
**Pair**: `REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md`  
**Hard**: vector stays **pgvector** · Ban Qdrant-required sole vector · Ban DROP of RAG/qbank/memory/vector tables in W1 · legacy-compat retrieve (`retrieval-legacy` / `vector_chunk`) = inventory candidate **not** delete · R1–R4 product gates **not** closed by this inventory · F8 parallel OK · **zero coding / zero prove** · Dual PASS ≠ authorize W1b · Ban self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/w1-pg-redundant-table-inventory.md` | Canonical harness（buckets A/C · HARD RETAIN pgvector） |
| `w1-pg-redundant-table-inventory.slice.md` | Slice index |
| `eval/w1-pg-redundant-table-inventory.eval.md` | Pre-exec eval |
| `receipts/w1-pg-redundant-table-inventory.draft.md` | Provisional draft · RAG/legacy signals |
| Parent W0 | `adr-postgres-retained.md` · pg-retained harness |
| `m4-rag-hard-gates.md` | R1–R4 remain；stack/Qdrant-required claims superseded |
| Parallel **untouched** | F8 MS3 · R4 meta product knives |

---

## Stance（rag-route）

1. Docs-only inventory · may flag legacy-compat retrieve / dual RAG tables as **candidates for later review**  
2. **Ban** DROP of pgvector / active qbank serving / memory vector erasure sinks in W1  
3. Does **not** close R1/R2/R3/R4 / FUNNEL-01  
4. Qdrant cutover remains STOPPED  
5. **`not_run:pre_dual`** · Dual PASS ≠ authorize W1b deletes  

---

## Please answer

1. Agree vector truth stays **Postgres pgvector** · W1 inventory must not authorize DROP of active vector/qbank/memory sinks?  
2. Agree `retrieval-legacy` / `vector_chunk` compat path is inventory/legacy-compat · **not** delete-now?  
3. Agree provisional RAG/control `legacy_untrusted` signals are state-machine honesty · ≠ table DROP backlog?  
4. Agree this knife **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green?  
5. Agree Dual PASS ≠ authorize W1b deletes · Qdrant cutover stays STOPPED · F8 untouched/not blocked?  
6. Agree `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not R4/FUNNEL closed · not DROP · not W1b · not Qdrant cutover · not HA · not suite · Dual PASS ≠ authorize deletes

---

*REQUEST · mw-rag-route · W1 · 2026-09-17 (~01:20 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ≠R4 closed · ZERO deletes · Dual PASS ≠ authorize W1b · zero coding · Ban self-approve*
