# REQUEST — **W1b** · PG redundant retire/trace batches（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS on W1 ≠ auto-auth W1b coding**；**Dual PASS on W1b ≠ authorize DROP / coding**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:40 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ DROP** · **≠ delete batch** · **≠ MySQL/Qdrant cutover** · **≠ W8** · **≠ coding**  
**Pair**: `REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md`  
**Hard**: meetwise W0→W1→**W1b**→W2…W8 SSOT · W1b = batched REQUEST from W1 formal receipt D-01…D-07 · **ZERO DROP / ZERO guessed deletes** · **no delete batch authorized** · Batch A docs-only · Batch B trace-first · HARD RETAIN forbidden in any delete batch · `proposed_next` never `drop-now` · Ban inventing DROP targets not in receipt · Dual PASS on W1 ≠ coding · zero migrations / zero coding · Ban self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/w1b-pg-redundant-retire-batches.md` | Canonical harness（batches · pins · Ban DROP） |
| `w1b-pg-redundant-retire-batches.slice.md` | Slice index |
| `eval/w1b-pg-redundant-retire-batches.eval.md` | Pre-exec eval |
| Parent W1 formal receipt | `receipts/w1-pg-redundant-table-inventory.md` · D-01…D-07 · dual on `675269c` |
| Parent W1 harness | `harness/w1-pg-redundant-table-inventory.md` · `post_prove_dual_pass` |
| Workflow SSOT | `w0-w8-workflow-status.md` |
| Parallel **untouched / not blocked** | F8 · W2–W5 closed docs · W6…W8 not open |

---

## Stance（E2E-HA）

1. Open W1b as **batched REQUEST** from W1 hypotheses — **docs/trace only**  
2. **Batch A** (D-03, D-04, D-05, D-06) = docs-only · document successor/mig/history · **not** delete  
3. **Batch B** (D-01, D-02, D-07) = trace-first · usage/call-site prove **before** any retire proposal · still **no DROP**  
4. **No delete batch authorized** · future retire needs prove + separate authorize  
5. Dual PASS on **W1 ≠** auto-auth W1b coding · Dual PASS on **W1b ≠** DROP/coding  
6. **`not_run:pre_dual`** · zero coding · zero migrations · zero DROP  

---

## Please answer

1. Agree W1b scope = batched REQUEST from W1 D-01…D-07 · **ZERO DROP** · **no delete batch** · Ban guessed deletes?  
2. Agree Batch A (D-03…D-06) = docs-only document/keep · **not** authorize DROP?  
3. Agree Batch B (D-01, D-02, D-07) = trace-first · prove usage before any retire proposal · still **no DROP** this REQUEST?  
4. Agree Dual PASS on **W1 ≠** auto-authorize W1b coding / DROP?  
5. Agree Dual PASS on **W1b ≠** authorize DROP / merge-retire migrations / coding · separate prove+authorize later?  
6. Agree HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **FORBIDDEN** in any delete batch · `proposed_next` never `drop-now` · Ban inventing DROP targets not in W1 receipt · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w1b-pg-redundant-retire-batches-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not DROP authorized · not delete batch · not coding · not migrations · not HA · not suite · Dual PASS on W1 ≠ W1b coding · Dual PASS on W1b ≠ DROP

---

*REQUEST · mw-e2e-ha · W1b · 2026-09-17 (~01:40 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · Dual PASS on W1 ≠ coding · zero coding · Ban self-approve*
