# Harness — **NOTE-CKPT-UNSEALED-CLAIM-NEG**（docs-only rewrite · implementation knife retired · **`draft:awaiting_re_pre_exec`**）

**Status**: **`draft:awaiting_re_pre_exec`**（REQUEST rewrite only · no product code · no prove run · no nail）
**Date**: 2026-10-02 (PT)
**Reviewers**: `mw-privacy-int` and `mw-e2e-ha`
**Supersedes**: implementation scope of `a1a06ab`
**Knife disposition**: `NOTE-CKPT-UNSEALED-CLAIM-NEG` is retired as an implementation knife. The four cases are already present in `uc052:checkpoint-physical`; this rewrite authorizes no second implementation and no second prove.

## Scope and existing proof

The four cases already exist in `packages/db/test/uc052-checkpoint-physical.proof.ts`. The remaining scope is documentation-only: record the existing cases and their DB-layer contract.

| Case | Existing case and file:line | Contract |
|---|---|---|
| NULL epoch | `packages/db/test/uc052-checkpoint-physical.proof.ts:763–766` (`NHP-CKPT-UNSEALED-NEG-EPOCH`) | refusal, unchanged rows |
| NULL digest | `packages/db/test/uc052-checkpoint-physical.proof.ts:768–771` (`NHP-CKPT-UNSEALED-NEG-DIGEST`) | refusal, unchanged rows |
| both NULL | `packages/db/test/uc052-checkpoint-physical.proof.ts:773–776` (`NHP-CKPT-UNSEALED-NEG-BOTH`) | refusal, unchanged rows; epoch is checked first |
| sealed positive control | `packages/db/test/uc052-checkpoint-physical.proof.ts:780–804` (`HP-CKPT-SEALED-CLAIM`) | claim returns a lease |

The shared existing assertion records `sqlState === '42501'`, the expected refusal message, and unchanged state at `packages/db/test/uc052-checkpoint-physical.proof.ts:750–758`. These citations are documentary only; do not rerun or extend the proof.

`NOTE-CKPT-UNSEALED-CLAIM-NEG` is therefore not an implementation authorization. No product code, migration, route, test, prove run, or nail is in scope.

## Required pins and bans

- External retention state is **`retention_pending`**. This is a pin, not completion evidence.
- Keep `apps/worker/src/checkpoint-principal.ts` unchanged.
- Keep `packages/db/test/uc052-checkpoint-physical.proof.ts` unchanged.
- Do not edit the coverage matrix, gap backlog, or execution checklist; do not flip coverage or invent a covered result.
- Public DELETE stays **503**.

**Pins**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · external retention **`retention_pending`** · public DELETE **503**.

Existing review stubs remain untouched. Await dual re-pre-exec by `mw-privacy-int` and `mw-e2e-ha`; this document does not self-approve or authorize coding.

*Harness · NOTE-CKPT-UNSEALED-CLAIM-NEG · draft:awaiting_re_pre_exec · docs-only · no prove · no nail · STOP*
