# Receipt — GAP-E2E-ISO-BANNER-PG-RETAINED residual · banner-string align（Line AL · prove · 2026-10-06）

**Status**: `coding_prove_done:awaiting_post_prove_dual` · banner string only · zero behavior change · gap **OPEN**
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · external=`retention_pending`
**REQUEST**: `27c2e99` / `27c2e9943eae4d27bd6ba0b62f02ca3dd481c6f4`
**PRE dual BOTH PASS**: mw-e2e-ha `899fef2` · mw-privacy-int `3915e32`
**Base**: `origin/feat/mysql-schema-skeleton` `6a35c47`
**Harness / slice**: `harness/gap-e2e-iso-banner-pg-retained-residual.md` §6 · `gap-e2e-iso-banner-pg-retained-residual.slice.md`
**Line N**: NAIL `a778255` identity untouched（old harness/slice read-only）

## CMD

```
cd /workspace/meetwise-lineAL
node --check scripts/run-e2e-isolated.mjs
```

- START: 2026-10-06T14:27:46+08:00
- END: 2026-10-06T14:27:46+08:00
- **EXIT: 0**
- Zero e2e run · no docker · no network

## Diff scope

`scripts/run-e2e-isolated.mjs` `:1765-1768`（line numbers unchanged · re-verified）· R5-MARKED-RED `console.warn` template string only.

### Before（@ `6a35c47`）
```js
    `[R5-MARKED-RED] E2E_ISOLATION_STACK=${isolationStack} (dual-track; intended sole default=${SOLE_STACK}) ` +
    `E2E_PG_IMAGE=${image} is a legacy pgvector isolation fixture — NOT sole-stack truth ` +
    `(sole stack = MySQL+Qdrant+Redis). Local green ≠ RAG migrated. ` +
    `releaseEvidence=false · Not HA · 本绿≠已迁 · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.`,
```

### After
```js
    `[R5-MARKED-RED] E2E_ISOLATION_STACK=${isolationStack} (dual-track; SOLE_STACK=${SOLE_STACK} is a dual-track code-path label ≠ product stack truth) ` +
    `E2E_PG_IMAGE=${image} is a legacy pgvector isolation fixture — isolated test infra narration, NOT stack truth / NOT cutover evidence ` +
    `(product stack pin = ai-docs/delivery/adr-postgres-retained.md: Postgres · PostgresSaver · pgvector). Local green ≠ RAG migrated. ` +
    `releaseEvidence=false · Not HA · 本绿≠已迁 · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.`,
```

- Removed: `intended sole default=${SOLE_STACK}` · `NOT sole-stack truth` · `(sole stack = MySQL+Qdrant+Redis)`
- Added: `SOLE_STACK=${SOLE_STACK} is a dual-track code-path label ≠ product stack truth` · `isolated test infra narration, NOT stack truth / NOT cutover evidence` · `product stack pin = ai-docs/delivery/adr-postgres-retained.md: Postgres · PostgresSaver · pgvector`
- Retained: `[R5-MARKED-RED]` · dual-track · legacy pgvector isolation fixture · `Local green ≠ RAG migrated` · `releaseEvidence=false · Not HA · 本绿≠已迁 · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence`

## Untouched（verified by diff）

`const SOLE_STACK = 'mysql-qdrant-redis'`（`:1674`）· `SOLE_WIRING_ALLOWLIST` · dual-track branching · LEGACY_STACK marked-red gate（not deleted）· `E2E_ISO_STACK_NOTE`（`:2141`）· header comment `:5` · erasure / migrations / `principal.ts` / `checkpoint-principal.ts` · matrix / backlog / checklist · ADR Decision body

## Gap

`GAP-E2E-ISO-BANNER-PG-RETAINED`（`gap-bug-backlog.md:63`）stays **OPEN** · row untouched · banner string aligned · residual status for nail/SSOT（header comment `:5` + `SOLE_STACK` const = separate package）.

## Ban

Ban cutover（any direction）· Ban 改 `SOLE_STACK` / allowlist / dual-track / erasure / migration / principal · Ban delete marked-red · Ban claim gap CLOSED · Ban claim covered · Ban matrix/backlog/checklist edit · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban AG / `nhp-001-adv*` · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban wash Y/AB/018/052/025 · Ban citing banner as stack truth（stack truth = `adr-postgres-retained.md`）

## Non-claims

Not HA · not releaseEvidence · not cutover · not gap closed · not nail · not POST dual · `node --check` EXIT 0 = syntax only

*Receipt · Line AL · banner-string align · 2026-10-06 +08:00 · awaiting POST dual · gap OPEN · STOP*
