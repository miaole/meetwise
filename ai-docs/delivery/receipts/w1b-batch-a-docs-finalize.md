# W1b Batch A — docs-only finalize（D-03…D-06）

**Status**: **Batch A done**（docs-only · **ZERO DROP**）  
**Date**: 2026-09-17 (~01:46 PT)  
**Knife**: W1b · REQUEST SHA **`e9731cf`** · pre-exec dual **PASS** · standing auth · docs/trace execute  
**releaseEvidence=false** · **≠HA** · **≠suite** · **Ban DROP/TRUNCATE** · **no delete batch** · Ban self-approve · Ban self-write `post_prove_dual_pass`  
**Parent W1**: `receipts/w1-pg-redundant-table-inventory.md` · dual on **`675269c`**

---

## Ruling

| ID | Object | Batch A outcome | `proposed_next` |
|----|--------|-----------------|-----------------|
| D-03 | CTX03+ vs older `conversation_event*` shapes | **document successor** · mig recreate pattern only | document-only · **no live DROP** |
| D-04 | Memory governance recreate (0093/0099/0105) | **document** mig `DROP IF EXISTS` recreate · Ban treating as delete auth | document-only · **no DROP** |
| D-05 | RAG `legacy_untrusted` / trust_state (0073+) | **keep** · control-plane honesty docs | keep · document-only |
| D-06 | `packages/db-mysql` / mysql compose | **keep historical** · W0 MySQL cutover **STOPPED** | keep history · **not** PG delete |

**Explicit**: Batch A = docs finalize only · **≠** delete batch · **≠** migrations coding · **≠** DROP.

---

## Evidence pointers（read-only）

### D-03 — successor / recreate（0108）

| Pointer | Note |
|---------|------|
| `packages/db/migrations/0108_ctx03_immutable_session_event_source.sql:57-58` | `DROP TABLE IF EXISTS conversation_event_artifact` → `CREATE TABLE conversation_event_artifact` |
| `packages/db/migrations/0108_ctx03_immutable_session_event_source.sql:86-87` | `DROP TABLE IF EXISTS conversation_event` → `CREATE TABLE conversation_event` |

**Honesty**: Historical migrate-up recreate **≠** auth to DROP live tables now · **no live DROP from W1b**.

### D-04 — memory governance recreate（0093 / 0099 / 0105）

| Pointer | Note |
|---------|------|
| `packages/db/migrations/0093_memory_governance.sql:53,106,130,153,177` | recreate: `memory_fact` · `memory_consent` · `memory_context_snapshot` · `memory_index_generation` · `memory_audit_event` |
| `packages/db/migrations/0099_memory_fact_adjudication.sql:49,105` | recreate: `memory_fact_adjudication` · `memory_fact_relationship` |
| `packages/db/migrations/0105_memory_two_stage_recall.sql:61` | recreate: `memory_recall_context_snapshot` |

**Honesty**: Ban treating migration-internal `DROP TABLE IF EXISTS` as W1b delete authorization.

### D-05 — trust_state / `legacy_untrusted`（0073+）

| Pointer | Note |
|---------|------|
| `packages/db/migrations/0073_rag_control_plane_identity_isolation.sql:52-53` | `control_trust_state` DEFAULT `'legacy_untrusted'` · CHECK `(controlled, legacy_untrusted, quarantined)` |
| `packages/db/migrations/0073_rag_control_plane_identity_isolation.sql:137` | provenance `trust_state` ∈ `{approved, legacy_untrusted, revoked}` |
| `packages/db/migrations/0073_rag_control_plane_identity_isolation.sql:184,197,266` | backfill / set `legacy_untrusted` · legacy vectors must not serve as trusted generation |

**Honesty**: Active control-plane state machine · **not** unused-table DROP backlog · **keep · document-only**.

### D-06 — MySQL historical keep

| Pointer | Note |
|---------|------|
| `packages/db-mysql/README.md` | skeleton only · **≠** PG port · cutover not claimed · `releaseEvidence=false` |
| `packages/db-mysql/migrations/` · `packages/db-mysql/package.json` | historical / local skeleton retained |
| `docker/compose.mysql-local.yml` | local mysql skeleton · **not** production · **not** HA |
| W0 ADR / SSOT | MySQL/Qdrant cutover remains **STOPPED** · PG+pgvector+PostgresSaver retained |

**Honesty**: Keep history · **not** a PG delete target · Ban revive cutover from W1b.

---

## Non-claims

Not DROP · not delete batch · not coding migrations · not HA · not suite · not `post_prove_dual_pass` · Dual PASS on W1 ≠ coding · Batch A done ≠ Batch B retire · `releaseEvidence=false`

---

*Receipt · W1b Batch A · 2026-09-17 (~01:46 PT) · docs-only done · ZERO DROP · releaseEvidence=false*
