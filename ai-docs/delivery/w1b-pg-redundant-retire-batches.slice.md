# Slice — **W1b** · PG redundant retire/trace batches（ZERO DROP）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:40 PT)  
**Authority**: meetwise — W0 PG retained → W1 inventory **`post_prove_dual_pass`** (dual on `675269c`) → **W1b** batched REQUEST（docs/trace only · **ZERO DROP**) → later retire coding only after prove + separate authorize · W2…W8 not opened by this open  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban DROP/TRUNCATE · Ban guessed deletes · Ban inventing DROP targets not in W1 receipt · Dual PASS on W1 ≠ auto-auth W1b coding · Ban self-approve  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · dual **pending** · not yet dual-sent  
**Honesty**: Most D-rows = document / keep / trace · **NOT** delete · **no delete batch authorized** · `proposed_next` never `drop-now`

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
| REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-e2e-ha.md` |
| REQUEST · rag-route | `reviews/REQUEST-2026-09-17-w1b-pg-redundant-retire-batches-mw-rag-route.md` |

## One-line scope

Open W1b REQUEST knife: batch W1 D-01…D-07 into **Batch A docs-only** + **Batch B trace-first** — **ZERO DROP**; no delete batch; Dual PASS on W1 ≠ coding auth.

## Batch summary

| Batch | IDs | Work |
|-------|-----|------|
| **A · docs-only** | D-03, D-04, D-05, D-06 | Document successor/mig patterns · keep historical MySQL artifacts · keep trust_state honesty |
| **B · trace-first** | D-01, D-02, D-07 | Usage/call-site prove **before** any retire proposal · still **no DROP** |
| **Delete** | — | **Not authorized** by this REQUEST |

## Hard pins

- ZERO DROP · ZERO guessed deletes · no delete batch · HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **FORBIDDEN** in any delete batch · `proposed_next` never `drop-now` · Ban inventing DROP targets not in W1 receipt · Dual PASS on W1 ≠ auto-auth W1b coding · Dual PASS on W1b ≠ DROP/coding · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · zero migrations/coding · Ban self-approve  

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`REQUEST-ready / not_run:pre_dual`** · no prove · zero coding · zero DROP |

---

*Slice · W1b · 2026-09-17 (~01:40 PT) · REQUEST-ready / not_run:pre_dual · parent W1 dual on 675269c · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · Dual PASS on W1 ≠ coding · zero coding*
