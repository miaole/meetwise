# Slice — **NOTE-CKPT-UNSEALED-CLAIM-NEG**（docs-only rewrite · implementation knife retired · **`draft:awaiting_re_pre_exec`**）

**Status**: **`draft:awaiting_re_pre_exec`**
**Reviewers**: `mw-privacy-int` and `mw-e2e-ha`
**Supersedes**: implementation scope of `a1a06ab`
**Authority**: meetwise — documentation only; no product code, no prove run, no nail
**Knife disposition**: retire `NOTE-CKPT-UNSEALED-CLAIM-NEG` as an implementation knife. Do not authorize a second implementation.

## Existing four cases

All four cases are already in `uc052:checkpoint-physical`; the remaining scope is to document them, not to implement or rerun them.

- NULL epoch — `packages/db/test/uc052-checkpoint-physical.proof.ts:763–766` (`NHP-CKPT-UNSEALED-NEG-EPOCH`)
- NULL digest — `packages/db/test/uc052-checkpoint-physical.proof.ts:768–771` (`NHP-CKPT-UNSEALED-NEG-DIGEST`)
- both NULL — `packages/db/test/uc052-checkpoint-physical.proof.ts:773–776` (`NHP-CKPT-UNSEALED-NEG-BOTH`)
- sealed positive control — `packages/db/test/uc052-checkpoint-physical.proof.ts:780–804` (`HP-CKPT-SEALED-CLAIM`)

The shared refusal/no-write assertion, including SQLSTATE `42501`, is already at `packages/db/test/uc052-checkpoint-physical.proof.ts:750–758`.

## Pins and prohibitions

- External retention: **`retention_pending`**.
- Do not edit `apps/worker/src/checkpoint-principal.ts`.
- Do not edit `packages/db/test/uc052-checkpoint-physical.proof.ts`.
- Do not edit the coverage matrix, gap backlog, or execution checklist.
- Public DELETE stays **503**.

**Pins**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · external retention **`retention_pending`** · public DELETE **503**.

Existing review stubs are left unchanged. Await re-pre-exec by `mw-privacy-int` and `mw-e2e-ha`.

*Slice · NOTE-CKPT-UNSEALED-CLAIM-NEG · draft:awaiting_re_pre_exec · docs-only · STOP*
