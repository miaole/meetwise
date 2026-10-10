# Slice — **W1** · PG redundant/obsolete table inventory（ZERO deletes）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:35 PT)  
**Authority**: meetwise — W0 PG retained (`post_prove_dual_pass` · **`5c2bf9a`**) → **W1 inventory ZERO deletes** (`post_prove_dual_pass`) → later W1b (not open) → W2…W8 (not opened by this close) · docs only · Dual PASS ≠ authorize W1b deletes · zero coding · zero DROP  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban MySQL/Qdrant cutover revival · Ban claiming W8 · Ban self-approve  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · dual **PASS** · knife SHA **`675269c`**  
**Honesty**: Formal inventory receipt promoted · D-01…D-07 = hypothesis only · **≠** deletion approval · HARD RETAIN non-DROP-able · Dual PASS ≠ W1b

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/w1-pg-redundant-table-inventory.slice.md` |
| Harness | `ai-docs/delivery/harness/w1-pg-redundant-table-inventory.md` |
| Eval | `ai-docs/delivery/eval/w1-pg-redundant-table-inventory.eval.md` |
| Formal receipt | `ai-docs/delivery/receipts/w1-pg-redundant-table-inventory.md` |
| Draft (superseded provenance) | `ai-docs/delivery/receipts/w1-pg-redundant-table-inventory.draft.md` |
| Parent W0 | `harness/pg-retained-checkpoint-postgres-saver.md` · `adr-postgres-retained.md` · **`post_prove_dual_pass`** @ **`5c2bf9a`** |
| Dual · e2e-ha | `reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md` (**pass**) |
| Dual · rag-route | `reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` (**pass**) |
| REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md` |
| REQUEST · rag-route | `reviews/REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` |

## One-line scope

Docs-gate inventory of Postgres business schema for redundant/obsolete/duplicate/legacy tables & columns — **ZERO deletes**; formal inventory receipt; Ban DROP/TRUNCATE/destructive migrate; Dual PASS ≠ W1b.

## Hard pins

- ZERO deletes · Ban DROP/TRUNCATE · Dual PASS ≠ authorize W1b · draft/formal hypotheses ≠ deletion approval · HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **non-DROP-able** · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · F8 parallel OK · zero coding · Ban self-approve  

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`post_prove_dual_pass`** · dual on **`675269c`** · no prove · zero coding · zero DROP |

---

*Slice · W1 · 2026-09-17 (~01:35 PT) · post_prove_dual_pass · dual on 675269c · W0 post_prove_dual_pass at 5c2bf9a · releaseEvidence=false · ≠HA · ≠suite · ZERO deletes · Dual PASS ≠ authorize W1b · zero coding*
