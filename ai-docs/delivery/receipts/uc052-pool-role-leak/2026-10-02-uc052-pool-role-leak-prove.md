# UC052 pool-role-leak prove receipts · Line B

**Date**: 2026-10-02 ~20:55 PT  
**Prove SHA**: `9b39a20` / `9b39a20d6b53d10ac95be880037a3e716126f715`  
**Mechanism tip**: `71ec253` SET ROLE NONE on release (retained)  
**Status claim**: mitigated / cause-unknown for authz flake (Ban "fixed") · pool leak product fix proven

## CMD | EXIT

| CMD | EXIT | Notes |
|-----|------|-------|
| `pnpm uc052:pool-role-leak:prove` | **0** | @`9b39a20` · C-CASECOUNT exact · NEG/FAULT/HP |
| mutation-control (scratch @913f21d + same prove) | **≠0 (1)** | NHP-POOL-NEG-01 bleed · FAULT-ABORT · FAULT-RESET-DESTROY fail |
| `pnpm uc052:checkpoint-physical:prove` | **0** | unsealed NEG epoch/digest/both + sealed HP |
| `pnpm uc052:internal-erasure:prove` | **0** | |
| `pnpm privacy-authorization:prove` | **0** | first-run this tip · see ledger |
| `pnpm eval-harness-matrix-cite:prove` | **0** | |

## Mutation control

Scratch worktree base `913f21d` (pre-fix leaky `PrincipalBoundCheckpointPool`) + same prove → EXIT=1. Bleed retained `app_role` + 3 GUCs on same pid. Test not worthless.

## tsc

| Project | Baseline (pre type-only) | After | Cap |
|---------|--------------------------|-------|-----|
| `packages/db` | 7 (incl. releaseAsync) → fixed | **6** | ≤6 |
| `apps/worker` | 44 | **39** | ≤ baseline |

## Authz flake ledger (20-run)

See `privacy-authorization-flake-ledger.jsonl` + `logs/`.  
v1 @`71ec253`: cold#5 EXIT=1 ECONNREFUSED; warm#2 EXIT=1. Status **mitigated/cause-unknown**.  
v2 @`3d0c71e`: cold_v2 10/10 EXIT=0; warm_v2 10/10 EXIT=0. Ban delete failed first-wave rows. Ban claim fixed.

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503
