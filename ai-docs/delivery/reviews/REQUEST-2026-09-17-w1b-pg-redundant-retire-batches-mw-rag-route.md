# REQUEST — **W1b** · PG redundant retire/trace batches（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS on W1 ≠ auto-auth W1b coding**；**Dual PASS on W1b ≠ authorize DROP / coding**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~01:40 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ DROP** · **≠ delete batch** · **≠ Qdrant cutover** · **≠ R4 closed** · **≠ W8** · **≠ coding**  
**Pair**: `REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-e2e-ha.md`  
**Hard**: vector stays **pgvector** · Ban Qdrant-required sole vector · Ban DROP of RAG/qbank/memory/vector / generation-scoped serving · Batch B (D-01, D-02, D-07) = legacy-compat **trace** not delete · Batch A includes D-05 trust_state **document-only** · HARD RETAIN (qbank/pgvector) **FORBIDDEN** in any delete batch · Dual PASS on W1 ≠ coding · R1–R4 / FUNNEL **not** closed by this REQUEST · zero migrations / zero coding · Ban self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/w1b-pg-redundant-retire-batches.md` | Canonical harness（Batch B RAG/legacy · HARD RETAIN） |
| `w1b-pg-redundant-retire-batches.slice.md` | Slice index |
| `eval/w1b-pg-redundant-retire-batches.eval.md` | Pre-exec eval |
| Parent W1 formal receipt | `receipts/w1-pg-redundant-table-inventory.md` · D-01/D-02/D-05/D-07 RAG signals |
| Parent W1 harness | `harness/w1-pg-redundant-table-inventory.md` |
| `m4-rag-hard-gates.md` | R1–R4 remain；Qdrant-required claims superseded |
| Parallel **untouched** | F8 · R4 meta product knives · W2–W5 docs closes |

---

## Stance（rag-route）

1. W1b batches RAG-adjacent hypotheses for **docs/trace only** — **Ban** DROP of pgvector / active qbank serving / memory vector erasure sinks  
2. **D-01 / D-02** (`retrieval-legacy` / `vector_chunk` vs generation path) = Batch B **trace-first** · not delete-now  
3. **D-05** (`legacy_untrusted` trust_state) = Batch A **document-only** · state-machine honesty · ≠ table DROP  
4. **D-07** unknown names = Batch B keep-until-trace · **no DROP**  
5. Does **not** close R1/R2/R3/R4 / FUNNEL-01  
6. Qdrant cutover remains STOPPED · Dual PASS on W1 ≠ W1b coding · Dual PASS on W1b ≠ DROP  

---

## Please answer

1. Agree vector truth stays **Postgres pgvector** · W1b must not authorize DROP of active vector/qbank/memory sinks / generation-scoped serving?  
2. Agree Batch B D-01/D-02 = legacy-compat **trace-first** · usage prove before any retire proposal · **not** delete-now?  
3. Agree Batch A D-05 = document-only trust_state honesty · ≠ table DROP backlog?  
4. Agree D-07 remains keep-until-trace · Ban inventing DROP targets · HARD RETAIN forbidden in any delete batch?  
5. Agree this knife **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green · Qdrant STOPPED?  
6. Agree Dual PASS on **W1 ≠** auto-auth W1b coding · Dual PASS on **W1b ≠** DROP/coding · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not R4/FUNNEL closed · not DROP · not delete batch · not coding · not Qdrant cutover · not HA · not suite · Dual PASS on W1 ≠ W1b coding · Dual PASS on W1b ≠ DROP

---

*REQUEST · mw-rag-route · W1b · 2026-09-17 (~01:40 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ≠R4 closed · ZERO DROP · no delete batch · Dual PASS on W1 ≠ coding · zero coding · Ban self-approve*
