# ADR — Postgres retained (+pgvector + PostgresSaver)

**Status**: **accepted (direction pin)** · **2026-09-17 (~01:31 PT)** · docs knife **`post_prove_dual_pass`** · **releaseEvidence=false** · ≠HA · ≠suite green  
**Supersedes (partial)**: `adr-mysql-qdrant-local.md` — **relational** sole-MySQL claims · **vector** sole-Qdrant / replace-pgvector claims  
**Wake note (provisional)**: production preference is to continue **Postgres LISTEN/NOTIFY**. Redis wake evaluation is deferred per coordinator suggestion only, **pending a user hard sentence**; this is **not a user hard pin**, and Redis wake / queue selection remains separately evaluable (orthogonal, not canceled).

## Decision (hard · meetwise 2026-09-17)

1. **Relational DB**: keep **Postgres** (business tables, RLS, migrations including **0043** path). **NO** business DB migration to MySQL.
2. **LangGraph checkpoint**: keep **`PostgresSaver`** / Postgres checkpointer path. Do not replace with MySQL for checkpoint durability.
3. **Vector / RAG storage**: keep **Postgres pgvector**. **NO** vector cutover to Qdrant as required sole vector truth.
4. **Not sole cutover targets**: `packages/db-mysql`, `docker/compose.mysql-local.yml`, `@meetwise/qdrant-store` prototypes — historical/experimental only; Ban treating them as sole relational or sole vector truth.
5. **Wake path (provisional)**: continue **Postgres LISTEN/NOTIFY** for production as a coordinator suggestion; defer Redis wake evaluation pending a user hard sentence. This is **not a user hard pin**, does not claim user hard-pinned Redis rejection, and does not stop Redis wake knives.
6. **Honesty**: `releaseEvidence=false` · Ban claiming HA / full E2E suite green / controlPlaneClosed from this pin · Dual PASS ≠ authorize coding · Ban implementing MySQL or Qdrant cutover from docs dual alone.

## Background

Delivery docs previously framed **MySQL + Qdrant + Redis** as sole stack (`adr-mysql-qdrant-local.md`, M0–M5, R5 retirement toward sole). On **2026-09-17** meetwise ruled:

- No business DB migration to MySQL.
- Vector stays on Postgres pgvector (not Qdrant).
- Branch name `feat/mysql-schema-skeleton` is **historical** and must **not** justify MySQL cutover.

Architecture ADR-0001 / ADR-0003 / ADR-0007 already point at Postgres + checkpointer + RLS; this delivery ADR re-aligns delivery sole-stack narrative with that retained path.

## Consequences

- MySQL schema / sole-relational cutover knives → **STOPPED / superseded** (history kept).
- Qdrant replace-pgvector / sole-vector cutover knives → **STOPPED / superseded** (history kept).
- Redis wake knives → **not STOPPED**; Redis evaluation is deferred provisionally while the production preference remains Postgres LISTEN/NOTIFY pending a user hard sentence.
- R1–R4 product RAG / domain-isolation gates remain open as product work — they are **not** authorized as MySQL/Qdrant cutover.
- F8 MS3 / commerce / egress / R4 meta knives remain on their own tracks (untouched by this ADR).
- Docs knife: `pg-retained-checkpoint-postgres-saver` (**`post_prove_dual_pass`**, zero coding · dual on `0c95883` · wake provisional overlay after dual · Dual PASS ≠ authorize coding).
- Next workflow knife (**W1**, docs only): PG redundant/obsolete table inventory — **ZERO deletes** · `harness/w1-pg-redundant-table-inventory.md` · Dual PASS ≠ authorize W1b deletes · W2…W8 not opened.

## Non-claims

- Not HA · not suite green · not releaseEvidence · not Redis wake cutover authorized or rejected · provisional LISTEN/NOTIFY preference is not a user hard pin · not deleting historical MySQL/Qdrant artifacts · not abandoning RLS · not inventing false prior ADR acceptance.

---

*ADR · Postgres retained · 2026-09-17 (~01:31 PT) · docs knife post_prove_dual_pass · dual on 0c95883 · wake = provisional overlay after dual (not user hard pin · no wake re-dual) · releaseEvidence=false · ≠HA · ≠suite green · supersedes mysql-qdrant relational+vector sole claims · Redis eval deferred pending user hard sentence · Redis not STOPPED · Dual PASS ≠ coding*
