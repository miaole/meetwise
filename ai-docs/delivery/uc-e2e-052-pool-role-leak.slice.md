# Slice — **GAP-UC052-POOL-ROLE-LEAK**（Line B · **`draft:awaiting_pre_exec_dual`** · Dual **`mw-privacy-int` + `mw-e2e-ha`**）

**Line**: **B** · **Revision**: **r0**  
**Status**: **`draft:awaiting_pre_exec_dual`**  
**Date**: 2026-09-23 (~21:40 PT)  
**Base**: **`913f21d`** / `913f21d34a427df8cfa85bd73ddaf19f4c7c604b` · prior nail UC-052 checkpoint physical  
**Authority**: docs REQUEST only · pins NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503  
**Harness**: `harness/uc-e2e-052-pool-role-leak.md`

## One-line scope

Product-fix `PrincipalBoundCheckpointPool` session SET ROLE leak（L51–54）+ explicit unsealed-claim NEG + root-cause `privacy-authorization:prove` first-run flake（Ban retry-to-green）.

## NHP

POOL-NEG-01 · POOL-FAULT-01 · UNSEALED-NEG-01 · AUTHZ-FLAKE-01 · HP-POOL-01 last.

## Prove

`pnpm uc052:pool-role-leak:prove`（planned unique）+ regress checkpoint-physical + privacy-authorization（attempt log）.

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.

STOP.
