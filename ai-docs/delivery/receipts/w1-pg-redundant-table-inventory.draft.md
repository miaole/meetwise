# W1 provisional inventory draft — **SUPERSEDED**（provenance only）

**Status**: **superseded** by formal receipt `receipts/w1-pg-redundant-table-inventory.md` · **`post_prove_dual_pass`**  
**Date (original draft)**: 2026-09-17 (~01:20 PT) · **Promoted**: 2026-09-17 (~01:35 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite** · **Ban DROP/TRUNCATE** · Dual PASS on W1 **≠** authorize deletes  
**Sources (read-only skim)**: `packages/db/migrations/` (~133) · `packages/db/sql/` (~25) · `packages/db/src/` (incl. `retrieval-legacy.ts`) · table-name extract from CREATE TABLE / createTable  
**Not**: live DB introspection · full call-graph prove · destructive SQL · MySQL/Qdrant cutover

> **Use the formal receipt.** This draft is retained only as provenance. D-01…D-07 remain **hypotheses** · **≠** deletion approval list · **≠** W1b authorize.

---

## Hard retain (do not candidate for delete)

| Object / class | Why |
|----------------|-----|
| `checkpoints`, `checkpoint_blobs`, `checkpoint_writes`, `checkpoint_migrations`, `checkpoint_thread_enrollment` | PostgresSaver / LangGraph durability |
| Active pgvector paths / generation-scoped qbank+rag serving | Retained vector truth (W0) · **HARD RETAIN · not DROP-able** |
| Privacy / erasure sinks still required (`privacy_*`, memory deletion targets, etc.) | Privacy hard gates |
| Hot business: `interview*`, commerce/payment, `job_route_*`, `user_account`, RLS principal surfaces | Production paths |

---

## Provisional candidate rows（hypothesis · proposed_next never drop-now）

| ID | Object / signal | Category | Evidence (skim) | usage_signal | proposed_next |
|----|-----------------|----------|-----------------|--------------|---------------|
| D-01 | `packages/db/src/retrieval-legacy.ts` · `annSearchLegacy` on `vector_chunk` | legacy-compat | File header: compatibility-only raw vector search · independent of immutable generation retrieval | compat-only | document-only · candidate-for-W1b-review |
| D-02 | `vector_chunk` vs generation-scoped qbank/rag tables | duplicate-or-compat | Legacy ANN + newer `qbank_*` / `rag_*` generation tables coexist | compat-only + hot (generation path) | keep generation path · inventory legacy role |
| D-03 | CTX03+ vs older conversation event shapes | obsolete-successor | Mig 0108+ recreates `conversation_event*` with DROP IF EXISTS recreate pattern | migration-only pattern | document successor · **no live DROP from W1** |
| D-04 | Memory governance recreate patterns (0093/0099/0105) | obsolete-successor | Historical `DROP TABLE IF EXISTS` inside migrate-up recreate | migration-only pattern | document · Ban treating mig DROP as W1 delete auth |
| D-05 | RAG `legacy_untrusted` / retired generation trust_state (0073+) | legacy-state | Trust state machine · not unused table | active control plane | keep · document-only |
| D-06 | `packages/db-mysql` / mysql compose | out-of-scope historical | W0 STOPPED MySQL cutover | historical | keep history · **not** W1 PG delete |
| D-07 | Unreferenced-looking names from CREATE extract (needs full usage trace) | unknown-needs-trace | Name list only · no call-site prove this turn | unknown-needs-trace | keep until coding knife traces · **no DROP** |

---

## Non-claims

- Not an approved delete list · not W1b authorize · not HA · not suite · not R4 closed · not MySQL/Qdrant cutover · zero DROP executed · see formal receipt for dual PASS record

---

*Draft (superseded) · W1 · 2026-09-17 · provisional provenance · ZERO deletes · Ban DROP · Dual PASS ≠ authorize W1b · releaseEvidence=false*
