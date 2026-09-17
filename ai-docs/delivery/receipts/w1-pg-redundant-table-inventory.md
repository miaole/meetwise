# W1 formal inventory receipt — read-only（≠ DROP list · ≠ W1b authorize）

**Status**: **`post_prove_dual_pass`** · formal inventory receipt（promoted from provisional draft）  
**Date**: 2026-09-17 (~01:35 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite** · **Ban DROP/TRUNCATE** · Dual PASS on W1 **≠** authorize W1b deletes / merge-retire  
**Knife SHA (dual)**: **`675269c`** (`675269c0999bf1887b3c527f7fc85420e72fd3de`)  
**Parent W0**: **`post_prove_dual_pass`** at close **`5c2bf9a`** · dual on `0c95883` · PG+pgvector+PostgresSaver retained · MySQL/Qdrant cutover **STOPPED**  
**Sources (read-only skim)**: `packages/db/migrations/` (~133) · `packages/db/sql/` (~25) · `packages/db/src/` (incl. `retrieval-legacy.ts`) · table-name extract from CREATE TABLE / createTable  
**Not**: live DB introspection · full call-graph prove · destructive SQL · MySQL/Qdrant cutover · **any DROP / table delete**

**Prior draft**: `receipts/w1-pg-redundant-table-inventory.draft.md`（superseded as formal status; content retained as provenance · still ≠ DROP list）

---

## Dual receipts (pre-exec · archived · Ban self-approve)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `../reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` | **pass** |

Dual PASS closes **W1 inventory docs gate only**. **≠** authorize W1b deletes / merge-retire migrations · **≠** approved DROP backlog · **≠** coding · **≠** HA/suite · `releaseEvidence=false`.

---

## Hard retain (do **not** candidate for delete · **non-DROP-able**)

| Object / class | Why |
|----------------|-----|
| `checkpoints`, `checkpoint_blobs`, `checkpoint_writes`, `checkpoint_migrations`, `checkpoint_thread_enrollment` | PostgresSaver / LangGraph durability |
| Active pgvector paths / generation-scoped **qbank+rag** serving | Retained vector truth (W0) · **HARD RETAIN · not DROP-able** |
| Privacy / erasure sinks still required (`privacy_*`, memory deletion targets, etc.) | Privacy hard gates |
| Hot business: `interview*`, commerce/payment, `job_route_*`, `user_account`, RLS principal surfaces | Production paths |

**Ban**: marking HARD RETAIN / qbank generation / pgvector truth tables as DROP-able / `drop-now` / deletable candidates.

---

## Candidate rows（hypothesis only · ≠ deletion approval · for *later* W1b REQUEST only）

| ID | Object / signal | Category | Evidence (skim) | usage_signal | proposed_next |
|----|-----------------|----------|-----------------|--------------|---------------|
| D-01 | `packages/db/src/retrieval-legacy.ts` · `annSearchLegacy` on `vector_chunk` | legacy-compat | File header: compatibility-only raw vector search · independent of immutable generation retrieval | compat-only | document-only · candidate-for-W1b-review |
| D-02 | `vector_chunk` vs generation-scoped qbank/rag tables | duplicate-or-compat | Legacy ANN + newer `qbank_*` / `rag_*` generation tables coexist | compat-only + hot (generation path) | keep generation path · inventory legacy role |
| D-03 | CTX03+ vs older conversation event shapes | obsolete-successor | Mig 0108+ recreates `conversation_event*` with DROP IF EXISTS recreate pattern | migration-only pattern | document successor · **no live DROP from W1** |
| D-04 | Memory governance recreate patterns (0093/0099/0105) | obsolete-successor | Historical `DROP TABLE IF EXISTS` inside migrate-up recreate | migration-only pattern | document · Ban treating mig DROP as W1 delete auth |
| D-05 | RAG `legacy_untrusted` / retired generation trust_state (0073+) | legacy-state | Trust state machine · not unused table | active control plane | keep · document-only |
| D-06 | `packages/db-mysql` / mysql compose | out-of-scope historical | W0 STOPPED MySQL cutover | historical | keep history · **not** W1 PG delete |
| D-07 | Unreferenced-looking names from CREATE extract (needs full usage trace) | unknown-needs-trace | Name list only · no call-site prove this turn | unknown-needs-trace | keep until coding knife traces · **no DROP** |

**Honesty**: D-01…D-07 = **hypotheses / candidates for a *later* W1b REQUEST only** · **not** an approved deletion list · `proposed_next` **never** `drop-now` · Dual PASS **≠** W1b authorize.

---

## Artifact plan reminder (later coding knife · still Ban DROP unless W1b separately authorized)

Emit markdown/JSON rows with: `table`/`column` · `category` · `evidence` · `usage_signal` · `proposed_next∈{keep,document-only,candidate-for-W1b-review}` · explicit `ban: no-drop-in-w1`.

---

## Non-claims

- Not an approved delete list · not W1b authorize · not HA · not suite · not R4 closed · not MySQL/Qdrant cutover · **zero DROP executed** · Dual PASS ≠ authorize deletes · HARD RETAIN remains non-deletable · Ban self-approve · `releaseEvidence=false`

---

*Formal inventory receipt · W1 · 2026-09-17 (~01:35 PT) · post_prove_dual_pass · dual on 675269c (e2e-ha+rag) · ZERO deletes · Ban DROP · Dual PASS ≠ authorize W1b · draft hypotheses ≠ deletion approval · HARD RETAIN non-DROP-able · releaseEvidence=false · ≠HA*
