# Slice — **UC-E2E-050–052 privacy erasure**（Line B · r3 · `GAP-PRIV-ERASURE-CLOSURE` · **`draft:awaiting_pre_exec_dual`** · Dual **`mw-privacy-int` + `mw-e2e-ha`** · Ban open DELETE · Ban invent covered · Ban Line A · Ban shared SSOT this tip · Ban apply Step 0 now · Ban expect request `partial_failed`）

**Line**: **B** · **Revision**: **r3**  
**Status**: **`draft:awaiting_pre_exec_dual`**（r3 · privacy-int r2 FAIL `bfa1189` — B1/B2/B3 CLOSED · **B4** fixed here · e2e-ha PASS retained · Ban自批 · Dual PASS ≠ coding ≠ open DELETE ≠ UC covered · **≠ coding** · **≠ prove** · **≠ Step 0 apply**）  
**Date**: 2026-09-23 (~20:30 PT)  
**Base / parent tip**: **`f07663a`** / full `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379` · L0 `cd5a4de` · r2 `8fecc3d` · dual `dc3e17a`/`79d9191` / `2bbebff`/`bfa1189` · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）  
**Authority**: meetwise — docs REQUEST r3 only · Ban secrets / `.env*` · Meridian banned · Ban Cloud Agent · Ban invent covered · Ban open DELETE · Ban coding until dual+authorize · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained  
**Experts**: `mw-privacy-int` + `mw-e2e-ha` · r3 re-review pending · Ban自批  
**Critical stack pin**: `adr-postgres-retained.md` · Ban cite `run-e2e-isolated.mjs:1606` MySQL+Qdrant banner（**GAP-E2E-ISO-BANNER-PG-RETAINED**）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/uc-e2e-050-052-privacy-erasure.slice.md` |
| Harness | `ai-docs/delivery/harness/uc-e2e-050-052-privacy-erasure.md` |
| Dual · privacy-int | `reviews/…-mw-privacy-int.md` · r2 FAIL `bfa1189`（not edited） |
| Dual · e2e-ha | `reviews/…-mw-e2e-ha.md` · PASS（not edited） |

## One-line scope

Line B r3 docs：Step 0 source = PR #104 commit **`f0f52bd`**（`packages/db/test/privacy-authorization.proof.ts` +5/−0 · not yet on branch）· first knife UC-052 internal erasure · request terminal **`pending_external`** · Ban `completed` · Ban expect reachable **`partial_failed`**（0096 CASE `retention_pending` before `failed`）· FAULT-01 = target `failed` + request `pending_external` + other locals read=0 + retry re-claim · gap **`GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL`** · prove **`uc052:internal-erasure:prove`** · STOP.

## Revision log（brief）

- r2: B1/B2/B3 CLOSED · C1–C6 / e2e-ha Cx · N1 named gap  
- **r3**: **B4** FAULT-01/§3.1(5)/C-SQL-PER-SINK/FAULT-04/05 aligned to 0096 L576–583 CASE · Step 0 records **`f0f52bd`** · register `GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL` · Ban `partial_failed` as expected request status

## Step 0（plan · Ban apply now）

PR **#104** commit **`f0f52bd`** / `f0f52bd337d1e3876d9432f55fa67c0f4dec9bba` · exact file：**`packages/db/test/privacy-authorization.proof.ts`** only · EXIT=0 gate · Ban now.

## First knife（brief）

Internal issuer/0091 · `purpose=interview_data` · local PG purge · externals `retention_pending` · request **`pending_external`** · Ban `completed` · Ban expect `partial_failed` · Ban trim digest · Ban new HTTP · Ban re-GRANT app_role · **UC-052 deletion yes**.

## CASE pin（B4）

`0096_int_transcript_remaining_sinks.sql` **L576–583** order: purging ← pending/leased · **pending_external** ← external_pending receipt · **pending_external** ← **retention_pending** target · partial_failed ← failed_cleanup · partial_failed ← failed · ELSE completed. Begin seeds oss/redis/langfuse `retention_pending`（L207–215）⇒ request **`partial_failed` unreachable**.

## NHP list（plan）

| ID | Request status expectation |
|----|----------------------------|
| FAULT-01 | failing target `failed` · request **`pending_external`**（≠ completed）· Ban `partial_failed` · other locals read=0 · retry → target erased · request stays `pending_external` |
| FAULT-02 | idempotency · no double effects |
| FAULT-03 | fence-revive refuse · read=0 |
| FAULT-04 | drift refuse · request ≠ completed（stays `pending_external`）· Ban `partial_failed` |
| FAULT-05 | already-erased · request stays `pending_external` if present · Ban `completed`/`partial_failed` |
| NEG-02 / NEG-03 / BOUND-01 / NEG-01 | unchanged intent |
| HP-050-01 | request **`pending_external`** · Ban `completed`/`partial_failed` |

## Prove CMD（plan）

**`pnpm uc052:internal-erasure:prove`** · Ban wash `privacy-erasure:prove`.

## Condition→criterion map（brief）

C1 no HTTP/no app_role re-GRANT · C2 JWS+NEG-02 · C3/C-SQL-PER-SINK admin read=0 + FAULT-01 `pending_external` · C4 FAULT-03/04 · C5 NEG-03 DB · C6 BOUND-01 lease · C-CASECOUNT · C-ALREADY-ERASED FAULT-05 · C-UNCOMMITTED · C-SCRIPT-NAME · C-MATRIX-NAIL · C-NON-PG · audit GAP · N1 GAP · **B4** `GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL`.

## Stays gap

Public DELETE 503 · OSS/Redis/Langfuse confirm · backups · user_memory · trace · export · UC covered · HA · INT-01 · N1 banner · audit retention · **GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL**.

## Hard pins

Line **B** · r3 · base **`f07663a`** · status **`draft:awaiting_pre_exec_dual`** · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained · DELETE **503** · request terminal **`pending_external`** · Ban expect reachable request **`partial_failed`**.

## Lifecycle

L0 r3 current → dual re-review →（authorize）Step 0 `f0f52bd` →（authorize）erasure coding · STOP after push.
