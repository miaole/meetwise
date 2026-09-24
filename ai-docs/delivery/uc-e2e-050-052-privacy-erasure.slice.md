# Slice — **UC-E2E-050–052 privacy erasure**（Line B · `GAP-PRIV-ERASURE-CLOSURE` · public DELETE=503 ≠ deletion closure · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Dual **`mw-privacy-int` + `mw-e2e-ha`** · **Ban** open public DELETE · **Ban** invent covered · **Ban** cite Line A · **Ban** edit shared SSOT this tip）

**Line**: **B**  
**Status**: **`draft:awaiting_pre_exec_dual`**（实现方预写 · **not yet dual-sent** · Ban自批 · Dual PASS ≠ coding ≠ open DELETE ≠ UC covered · **≠ coding** · **≠ prove**）  
**Date**: 2026-09-23 (~20:11 PT)  
**Base / parent tip**: **`f07663a`** / full `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379` · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）  
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Meridian banned · Ban Cloud Agent · Ban invent covered · Ban open DELETE · Ban coding until dual+authorize · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained  
**Experts**: `mw-privacy-int` + `mw-e2e-ha` · dual not yet run · Ban自批  
**Critical stack pin**: `adr-postgres-retained.md` · Postgres (+pgvector + PostgresSaver) · Ban MySQL/Qdrant-as-required · Ban MemorySaver as closure evidence

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/uc-e2e-050-052-privacy-erasure.slice.md` |
| Harness（inventory + knife + NHP + prove plan） | `ai-docs/delivery/harness/uc-e2e-050-052-privacy-erasure.md` |
| Prior 503 pin（retained · ≠ closure） | `harness/privacy-erasure-http-503-pin.md` |
| INT freeze（retained） | `harness/w3-int-transcript-delete-503-freeze.md` |
| Sink inventory | `architecture/ai/privacy-deletion-sink-inventory.md` |
| Dual stub · privacy-int | `reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-privacy-int.md` · **PENDING** |
| Dual stub · e2e-ha | `reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-e2e-ha.md` · **PENDING** |

## One-line scope

Line B L0 docs REQUEST: inventory DELETE=503 + INT/authz/sinks + quote matrix UC-E2E-050–052 · first knife = **internal authorized erasure** across in-scope PG sinks + per-sink ledger receipts · targets **UC-E2E-052 deletion** only · public DELETE stays 503 · NHP FAULT/idempotency/unauth/cross-tenant/concurrent + happy last · prove `pnpm privacy:erasure:prove` via run-e2e-isolated on real PG · SSOT deltas deferred to nail · pins NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed=true / coveredCount=8 / ms3EqualsR4Closed=false · Ban Line A touch · STOP after push.

## Matrix quote（SSOT · not edited here）

§1.0: `| UC-E2E-050–052 | **partial** | **gap** | **blind** | **blind** | DELETE=503 honesty-pin ≠ 删除闭环 |`  
§1.1: `| UC-E2E-050–052 | … | **partial** / **blocked** | DELETE 必须 503（GAP-PRIV-02）；本绿≠产品删除闭环；导出/完整擦除未放行；非 covered |`

## First knife（brief）

Internal authorized erasure（issuer/0091 · not public DELETE）· one subject · in-scope PG sinks with real resolvers · per-sink receipts · partial-fail honesty · **UC-052 deletion yes** · export/050/051 **no**.

## NHP list（plan）

NHP-050-FAULT-01 · FAULT-02 idempotency · NEG-02 unauthorized · NEG-03 cross-tenant · BOUND-01 concurrent · NEG-01 retained 503 pin · HP-050-01 happy last.

## Prove CMD（plan）

`pnpm privacy:erasure:prove` · EXIT=0 iff all NHP hold · DB asserts per sink · no MemorySaver/MySQL/Qdrant fixtures · retained `privacy-erasure:http:prove` still 503.

## Stays gap

Public DELETE 503 · OSS/Redis/Langfuse/backups/`user_memory`/trace · export · UC covered · HA · INT-01 cutover.

## Planned SSOT deltas（nail only）

matrix / gap-bug-backlog / NHP matrix / covered-path-backlog / checklist — **to be applied at nail** · Ban edit this REQUEST.

## Hard pins

- Line **B** · base **`f07663a`** · status **`draft:awaiting_pre_exec_dual`**
- `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained
- Ban invent covered · Ban open DELETE · Ban coding/prove this open · Ban Line A files · Ban shared SSOT edit this tip · Dual PASS ≠ next knife

## Dual receipts（named · not pre-filled）

| Expert | Receipt path | Status |
|--------|--------------|--------|
| `mw-privacy-int` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-privacy-int.md` | **PENDING / draft:awaiting_pre_exec_dual** |
| `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-e2e-ha.md` | **PENDING / draft:awaiting_pre_exec_dual** |

## Lifecycle

| Phase | This open |
|-------|-----------|
| **L0** | REQUEST open · **current** |
| **L1** | Pre-exec dual awaiting |
| **L2+** | coding only after BOTH PASS + authorize |

STOP after push.
