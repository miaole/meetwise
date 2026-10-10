# Slice — **W1b** · PG redundant retire/trace batches（ZERO DROP）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:56 PT)  
**Authority**: meetwise — W0 PG retained → W1 inventory **`post_prove_dual_pass`** (dual on `675269c`) → **W1b** batched docs/trace (**`post_prove_dual_pass`** · dual on `c378943` · **ZERO DROP**) → later retire coding only after prove + separate authorize · W2…W8 not opened by this close  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban DROP/TRUNCATE · Ban guessed deletes · Ban inventing DROP targets not in W1 receipt · Dual PASS on W1 ≠ auto-auth W1b coding · Dual PASS on W1b ≠ DROP/coding/delete-table · Ban self-approve beyond authorized docs close  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · pre-exec dual **PASS** · post-prove dual **PASS** on **`c378943`**  
**Honesty**: Most D-rows = document / keep / trace · **NOT** delete · **no delete batch authorized** · HARD RETAIN **intact** · `proposed_next` never `drop-now`

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/w1b-pg-redundant-retire-batches.slice.md` |
| Harness | `ai-docs/delivery/harness/w1b-pg-redundant-retire-batches.md` |
| Eval | `ai-docs/delivery/eval/w1b-pg-redundant-retire-batches.eval.md` |
| Parent W1 formal receipt | `ai-docs/delivery/receipts/w1-pg-redundant-table-inventory.md` |
| Parent W1 harness | `ai-docs/delivery/harness/w1-pg-redundant-table-inventory.md` |
| Workflow SSOT | `ai-docs/delivery/w0-w8-workflow-status.md` |
| Batch A receipt | `ai-docs/delivery/receipts/w1b-batch-a-docs-finalize.md` |
| Batch B receipt | `ai-docs/delivery/receipts/w1b-batch-b-trace-evidence.md` |
| Post-prove · e2e-ha | `reviews/2026-09-17-w1b-batch-ab-post-prove-mw-e2e-ha.md` |
| Post-prove · rag-route | `reviews/2026-09-17-w1b-batch-ab-post-prove-mw-rag-route.md` |

## One-line scope

Close W1b docs/trace knife: Batch A docs-only + Batch B trace-first on W1 D-01…D-07 — **ZERO DROP**; no delete batch; Dual PASS ≠ DROP/coding/delete-table; HARD RETAIN intact.

## Batch summary

| Batch | IDs | Work |
|-------|-----|------|
| **A · docs-only** | D-03, D-04, D-05, D-06 | Document successor/mig patterns · keep historical MySQL artifacts · keep trust_state honesty |
| **B · trace-first** | D-01, D-02, D-07 | Usage/call-site prove **before** any retire proposal · still **no DROP** |
| **Delete** | — | **Not authorized** by this knife |
| **A result** | D-03…D-06 | **done** · `receipts/w1b-batch-a-docs-finalize.md` |
| **B result** | D-01/D-02/D-07 | **done** · `receipts/w1b-batch-b-trace-evidence.md` · keep · no DELETE REQUEST flags |
| **Post-prove dual** | e2e-ha + rag | **PASS** on `c378943` · archived |

## Hard pins

- ZERO DROP · ZERO guessed deletes · no delete batch · Dual ≠ delete-table authorize · HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **FORBIDDEN** in any delete batch · **intact** · `proposed_next` never `drop-now` · Ban inventing DROP targets not in W1 receipt · Dual PASS on W1 ≠ auto-auth W1b coding · Dual PASS on W1b ≠ DROP/coding · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · zero migrations/coding · Ban self-approve beyond docs close  

## CMD

| CMD | Status |
|-----|--------|
| docs/trace dual | **`post_prove_dual_pass`** · dual on `c378943` · Batch A+B done · zero DROP |

---

*Slice · W1b · 2026-09-17 (~01:56 PT) · `post_prove_dual_pass` · dual on c378943 · parent W1 dual on 675269c · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · Dual ≠ DROP/delete-table · HARD RETAIN intact · zero coding*
