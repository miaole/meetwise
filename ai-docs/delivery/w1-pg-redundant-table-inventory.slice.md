# Slice — **W1** · PG redundant/obsolete table inventory（ZERO deletes）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:20 PT)  
**Authority**: meetwise — W0 PG retained → **W1 inventory ZERO deletes** → dual → later W1b (not open) → W2…W8 (not open) · docs only · Dual PASS ≠ authorize W1b deletes · zero coding · zero DROP  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban MySQL/Qdrant cutover revival · Ban claiming W8  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · REQUEST drafted · **not yet dual-sent**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/w1-pg-redundant-table-inventory.slice.md` |
| Harness | `ai-docs/delivery/harness/w1-pg-redundant-table-inventory.md` |
| Eval | `ai-docs/delivery/eval/w1-pg-redundant-table-inventory.eval.md` |
| Provisional draft (read-only) | `ai-docs/delivery/receipts/w1-pg-redundant-table-inventory.draft.md` |
| Parent W0 | `harness/pg-retained-checkpoint-postgres-saver.md` · `adr-postgres-retained.md` |
| REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md` |
| REQUEST · rag-route | `reviews/REQUEST-2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` |

## One-line scope

Docs-gate inventory of Postgres business schema for redundant/obsolete/duplicate/legacy tables & columns — **ZERO deletes**; plan the later inventory artifact; Ban DROP/TRUNCATE/destructive migrate.

## Hard pins

- ZERO deletes · Ban DROP/TRUNCATE · Dual PASS ≠ authorize W1b · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · F8 parallel OK · zero coding  

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · no prove · zero coding · zero DROP |

---

*Slice · W1 · 2026-09-17 (~01:20 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ZERO deletes · Dual PASS ≠ authorize W1b · zero coding*
