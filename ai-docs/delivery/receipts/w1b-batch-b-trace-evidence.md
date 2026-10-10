# W1b Batch B — trace-first evidence（D-01 / D-02 / D-07）

**Status**: **Batch B trace evidence recorded**（**ZERO DROP** · keep unless proven dead）  
**Date**: 2026-09-17 (~01:46 PT)  
**Knife**: W1b · REQUEST SHA **`e9731cf`** · pre-exec dual **PASS** · standing auth · trace execute  
**releaseEvidence=false** · **≠HA** · **≠suite** · **Ban DROP/TRUNCATE** · **no delete batch** · Ban guessed deletes · Ban invent DROP targets · Ban self-approve · Ban self-write `post_prove_dual_pass`  
**Method**: `git grep` static call-site scan · **not** live DB · **not** DROP  
**Parent W1**: `receipts/w1-pg-redundant-table-inventory.md` · dual on **`675269c`**

---

## Hard pins

- Trace-first only · **still no DROP**
- HARD RETAIN (qbank generation / pgvector / checkpoints / privacy / hot) **FORBIDDEN** in any delete batch
- `proposed_next` **never** `drop-now`
- Later retire only via separate prove + authorize · flag at most `candidate-for-W1b-delete-REQUEST`
- Zero TS hits **≠** proven dead when SQL/definer/migration usage exists

---

## D-01 — `annSearchLegacy` / `retrieval-legacy` / `vector_chunk` ANN callers

### CMD

```bash
git grep -n "annSearchLegacy" -- '*.ts' '*.tsx' ':!**/node_modules/**'
git grep -n "retrieval-legacy" -- '*.ts' '*.tsx' ':!**/node_modules/**'
git grep -n "FROM vector_chunk\|INSERT INTO vector_chunk" -- 'packages/db/src/*.ts'
```

### Hits — `annSearchLegacy`（file:line）

| file:line | role |
|-----------|------|
| `packages/db/src/retrieval-legacy.ts:11` | **definition** |
| `packages/db/src/retrieval-legacy.ts:26,35,41` | SQL `FROM vector_chunk` |
| `packages/db/src/retrieval-store.ts:12,14` | import + re-export |
| `packages/db/src/retrieval-store.ts:57,65` | comment + fallback call |
| `packages/db/src/index.ts:143` | package export |
| `packages/db/src/qbank-generation-retrieval.ts:113` | comment: legacy must use `annSearchLegacy` |
| `packages/db/src/qbank-generation-retrieval.ts:231-232` | dynamic import + call (compat) |
| `packages/db/src/principal.ts:421` | comment: no resurrect via legacy ANN |
| `packages/db/test/vectorstore.proof.ts:16,73,78,92,95` | proof callers |
| `apps/worker/smoke/rag-adversarial-pg-eval.ts:19,146,154` | smoke legacy path |
| `apps/worker/smoke/rag-demo.ts:2,9,61` | demo non-serving legacy |
| `packages/qdrant-store/src/product-vectorstore-bridge.ts:71` | comment: hit-shape mirror（Qdrant cutover STOPPED） |

### Hits — `retrieval-legacy` import

| file:line |
|-----------|
| `packages/db/src/retrieval-store.ts:12,14` |
| `packages/db/src/qbank-generation-retrieval.ts:231` |

### D-01 ruling

| Field | Value |
|-------|-------|
| usage_signal | **live callers** (store fallback · generation compat · proofs · smokes) |
| `proposed_next` | document-only · keep · **never** `drop-now` |
| delete? | **NO** |

---

## D-02 — generation-scoped qbank/rag vs legacy `vector_chunk`

### CMD

```bash
git grep -nE "CREATE TABLE (IF NOT EXISTS )?(qbank_chunk|qbank_vector_generation|qbank_active_generation|rag_embedding_generation|rag_active_generation|vector_chunk)" -- 'packages/db/migrations/*.sql'
git grep -n "hybridQbankSearch\|qbank_generation_ann_search\|FROM vector_chunk\|INSERT INTO vector_chunk" -- 'packages/db/src/*.ts'
```

### Generation-scoped（HARD RETAIN）

| Object | CREATE pointer |
|--------|----------------|
| `qbank_chunk` | `0029_qbank_generation_hybrid_retrieval.sql:30` |
| `qbank_vector_generation` | `0029_qbank_generation_hybrid_retrieval.sql:101` |
| `qbank_active_generation` | `0029_qbank_generation_hybrid_retrieval.sql:125` |
| `rag_embedding_generation` | `0032_rag_corpus_version_control.sql:170` |
| `rag_active_generation` | `0032_rag_corpus_version_control.sql:219` |

### Legacy coexistence

| file:line | role |
|-----------|------|
| `packages/db/migrations/0001_baseline.sql:285` | `CREATE TABLE vector_chunk` |
| `packages/db/src/retrieval-legacy.ts:26,35,41` | legacy ANN reads |
| `packages/db/src/retrieval-store.ts:23` | `INSERT INTO vector_chunk` |
| `packages/db/src/qbank-generation-retrieval.ts:221,240` | `hybridQbankSearch` / `qbank_generation_ann_search` |
| `packages/db/src/retrieval-store.ts:62` | generation ANN when active |

### D-02 ruling

| Path | Ruling |
|------|--------|
| Generation qbank/rag + active pgvector | **HARD RETAIN · non-DROP-able** |
| Legacy `vector_chunk` + `annSearchLegacy` | compat coexistence · **keep** |
| `proposed_next` | keep generation · inventory legacy · **never** `drop-now` |
| delete batch? | **none** |

---

## D-07 — hypothesized low-reference names（keep unless proven dead）

### CMD

```bash
git grep -n --fixed-string "<name>" -- ':!**/node_modules/**'
```

### Zero-`*.ts` candidates examined（**not** proven dead）

| name | Non-TS usage | ruling | `candidate-for-W1b-delete-REQUEST`? |
|------|--------------|--------|-------------------------------------|
| `checkpoint_migrations` | `0043_langgraph_checkpoint_least_privilege.sql:6` · HARD RETAIN | **HARD RETAIN · keep** | **NO**（forbidden） |
| `interview_answer_artifact_target` | `0092_int_transcript_answer_fact_root.sql:121` (+ RLS/purge SQL) | **keep** | **NO**（not proven dead） |
| `memory_reindex_task` | `0107_memory_control_surface.sql:179` (+ PL/pgSQL) | **keep** | **NO** |
| `online_judge_budget_daily` | `0050_online_judge_control_plane.sql:107` | **keep** | **NO** |
| `online_judge_stratum_cursor` | `0050_online_judge_control_plane.sql:45` | **keep** | **NO** |
| `online_judge_subject_daily` | `0050_online_judge_control_plane.sql:121` | **keep** | **NO** |
| `privacy_preview_sink_line` | `0129_privacy_erasure_preview_path.sql:30` | **keep** | **NO** |

**Honesty**: Zero TS refs ≠ unused · all have SQL/definer usage · **no proven-dead** → **no** delete-REQUEST flags this turn · Ban guessed deletes.

---

## Batch B summary

| ID | usage_signal | `proposed_next` | delete? |
|----|--------------|-----------------|---------|
| D-01 | live legacy ANN callers | document-only · keep · never drop-now | **NO** |
| D-02 | hot generation + compat legacy | keep generation · inventory legacy | **NO** |
| D-07 | traced-as-kept（SQL-live） | keep · no DELETE REQUEST flag | **NO** |

---

## Non-claims

Not DROP · not delete batch · not proven-dead deletes · not HA · not suite · not MySQL/Qdrant cutover · not `post_prove_dual_pass` · Dual PASS on W1b (later) ≠ DROP · HARD RETAIN non-deletable · `releaseEvidence=false`

---

*Receipt · W1b Batch B · 2026-09-17 (~01:46 PT) · trace evidence recorded · ZERO DROP · no candidate-for-W1b-delete-REQUEST this turn · releaseEvidence=false*
