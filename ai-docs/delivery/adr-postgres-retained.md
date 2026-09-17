# ADR — Postgres retained (+pgvector + PostgresSaver)

**Status**: **accepted (direction pin)** · **2026-09-17 (~01:15 PT)** · **releaseEvidence=false** · ≠HA · ≠suite green  
**Supersedes (partial)**: `adr-mysql-qdrant-local.md` — **relational** sole-MySQL claims · **vector** sole-Qdrant / replace-pgvector claims  
**Does not cancel**: Redis wake / queue selection as a **separate eval** (orthogonal)

## Decision (hard · meetwise 2026-09-17)

1. **Relational DB**: keep **Postgres** (business tables, RLS, migrations including **0043** path). **NO** business DB migration to MySQL.
2. **LangGraph checkpoint**: keep **`PostgresSaver`** / Postgres checkpointer path. Do not replace with MySQL for checkpoint durability.
3. **Vector / RAG storage**: keep **Postgres pgvector**. **NO** vector cutover to Qdrant as required sole vector truth.
4. **Not sole cutover targets**: `packages/db-mysql`, `docker/compose.mysql-local.yml`, `@meetwise/qdrant-store` prototypes — historical/experimental only; Ban treating them as sole relational or sole vector truth.
5. **Redis wake**: still **separately evaluable** (user did not reject); not authorized or canceled by this ADR.
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
- R1–R4 product RAG / domain-isolation gates remain open as product work — they are **not** authorized as MySQL/Qdrant cutover.
- F8 MS3 / commerce / egress / R4 meta knives remain on their own tracks (untouched by this ADR).
- Docs knife: `pg-retained-checkpoint-postgres-saver` (`REQUEST-ready / not_run:pre_dual`, zero coding).

## Non-claims

- Not HA · not suite green · not releaseEvidence · not Redis wake cutover authorized · not deleting historical MySQL/Qdrant artifacts · not abandoning RLS · not inventing false prior ADR acceptance.

---

*ADR · Postgres retained · 2026-09-17 (~01:15 PT) · releaseEvidence=false · ≠HA · ≠suite green · supersedes mysql-qdrant relational+vector sole claims · Redis wake orthogonal*
