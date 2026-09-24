# Slice — **UC-E2E-050–052 privacy erasure**（Line B · r2 · `GAP-PRIV-ERASURE-CLOSURE` · **`draft:awaiting_pre_exec_dual`** · Dual **`mw-privacy-int` + `mw-e2e-ha`** · Ban open DELETE · Ban invent covered · Ban Line A · Ban shared SSOT this tip · Ban apply Step 0 now）

**Line**: **B** · **Revision**: **r2**  
**Status**: **`draft:awaiting_pre_exec_dual`**（r2 · awaits dual re-review after privacy-int FAIL `2bbebff` · e2e-ha PASS `dc3e17a` CONDITIONS folded · Ban自批 · Dual PASS ≠ coding ≠ open DELETE ≠ UC covered · **≠ coding** · **≠ prove** · **≠ Step 0 apply**）  
**Date**: 2026-09-23 (~20:20 PT)  
**Base / parent tip**: **`f07663a`** / full `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379` · L0 `cd5a4de` · dual `dc3e17a`/`2bbebff` · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）  
**Authority**: meetwise — docs REQUEST r2 only · Ban secrets / `.env*` · Meridian banned · Ban Cloud Agent · Ban invent covered · Ban open DELETE · Ban coding until dual+authorize · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained  
**Experts**: `mw-privacy-int` + `mw-e2e-ha` · r2 re-review pending · Ban自批  
**Critical stack pin**: `adr-postgres-retained.md` · Ban cite `run-e2e-isolated.mjs:1606` MySQL+Qdrant banner as truth（**GAP-E2E-ISO-BANNER-PG-RETAINED**）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/uc-e2e-050-052-privacy-erasure.slice.md` |
| Harness（SSOT inventory + Step 0 + knife + NHP） | `ai-docs/delivery/harness/uc-e2e-050-052-privacy-erasure.md` |
| Prior 503 pin | `harness/privacy-erasure-http-503-pin.md` |
| Dual · privacy-int | `reviews/…-mw-privacy-int.md` · FAIL `2bbebff`（not edited） |
| Dual · e2e-ha | `reviews/…-mw-e2e-ha.md` · PASS `dc3e17a`（not edited） |

## One-line scope

Line B r2 docs：authz baseline **RED**（EXIT=1 `privacy_authorization_target_drift`）→ **Step 0** = PR #104 fixture-only `packages/db/test/privacy-authorization.proof.ts` · hard gate authz EXIT=0 before erasure code · first knife = internal authorized UC-052 deletion · happy terminal **`pending_external`**（Ban `completed`）· prove **`pnpm uc052:internal-erasure:prove`** · C1–C6 + e2e-ha Cx mapped · N1 = named gap not Step 0 · public DELETE 503 · pins retained · STOP.

## Revision log（brief）

B1 Step 0 PR #104 · B2 `pending_external` + 0096/0091 cites · B3 rename prove · C1–C6 + e2e-ha Cx in success criteria/NHP · N1 named gap · audit retention gap named.

## Step 0（plan · Ban apply now）

PR **#104** exact file：**`packages/db/test/privacy-authorization.proof.ts`** only · EXIT=0 gate · Ban product/migration/HTTP · Ban now.

## First knife（brief）

Internal issuer/0091 · `purpose=interview_data` · local PG sinks purge · externals `retention_pending` · request **`pending_external`** · Ban trim digest · Ban new HTTP · Ban re-GRANT app_role · **UC-052 deletion yes** · export/050/051 **no**.

## NHP list（plan）

FAULT-01 partial · FAULT-02 idempotency · FAULT-03 fence-revive · FAULT-04 epoch/digest drift · FAULT-05 already-erased · NEG-02 unauthorized（C2）· NEG-03 DB/claim cross-tenant（C5）· BOUND-01 lease+concurrent（C6）· NEG-01 503 pin · HP-050-01 happy last（`pending_external`）.

## Prove CMD（plan）

**`pnpm uc052:internal-erasure:prove`** · Ban wash `privacy-erasure:prove` · EXIT=0 iff all NHP + C-CASECOUNT + admin per-sink SQL · PG only.

## Condition→criterion map（brief）

| Cond | Criterion / NHP |
|------|-----------------|
| C1 | no HTTP route · no app_role re-GRANT |
| C2 | JWS before consume · NEG-02 subcases |
| C3 / C-SQL-PER-SINK | admin SELECT read=0 per sink |
| C4 | FAULT-03 / FAULT-04 |
| C5 | NEG-03 DB/claim |
| C6 / C-BOUND-HARDEN | BOUND-01 lease |
| C-CASECOUNT | requiredCaseIds fail-closed |
| C-ALREADY-ERASED | FAULT-05 |
| C-UNCOMMITTED | receipt git SHA |
| C-SCRIPT-NAME | `uc052:internal-erasure:prove` |
| C-MATRIX-NAIL | nail only 052 deletion / NHP-050-* |
| C-NON-PG | externals never erased |
| Audit | GAP-PRIV-AUDIT-RETENTION |
| N1 | GAP-E2E-ISO-BANNER-PG-RETAINED · not Step 0 |

## Stays gap

Public DELETE 503 · OSS/Redis/Langfuse confirm · backups · user_memory · trace · export · UC covered · HA · INT-01 · N1 banner · audit retention.

## Hard pins

Line **B** · r2 · base **`f07663a`** · status **`draft:awaiting_pre_exec_dual`** · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained · DELETE **503** · terminal **`pending_external`**.

## Lifecycle

L0 r2 current → dual re-review →（authorize）Step 0 →（authorize）erasure coding · STOP after push.
