# Harness — **NOTE-CKPT-UNSEALED-CLAIM-NEG**（NULL epoch · NULL digest · both · sealed positive control · DB-layer refusal · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · coding only after Line B pool-role-leak is nailed · Ban edit principal in parallel with B）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding this open · Dual PASS ≠ coding · Dual PASS ≠ covered · public DELETE stays **503**）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **NOTE-CKPT-UNSEALED-CLAIM-NEG**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · UC-052 **≠ covered** · Ban open DELETE · Ban invent covered
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（stubs PENDING · Ban self-approve）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · **No coding is authorized** · coding is the next knife **after** Line B `GAP-UC052-POOL-ROLE-LEAK` is nailed
**Honesty**: `0091` L369–374 already raises. A prove sketch may already exist on the branch inside Line B's checkpoint proof. This REQUEST does not edit it and does not treat that sketch as a nail.

---

## Goal

Explicit negatives, refusal **at the DB layer**, concrete **SQLSTATE**, **no writes**, plus a sealed positive control.

| Case | Setup | Expected refusal |
|------|-------|------------------|
| NULL epoch | begin, then `privacy_epoch` NULL before claim | `RAISE privacy_authorization_epoch_mismatch` · **ERRCODE `42501`** · request/target rows unchanged |
| NULL digest | begin+seal, then `target_set_digest` NULL before claim | `RAISE privacy_authorization_digest_mismatch` · **ERRCODE `42501`** · no writes |
| both NULL | begin leaves both NULL（0091 checks epoch **before** digest, L369 then L372） | same **`42501`** / `privacy_authorization_epoch_mismatch` · Ban invent a third SQLSTATE |
| Sealed positive control | seal then claim | claim returns a lease · not a refusal |

Source: `packages/db/migrations/0091_privacy_authorization_issuer.sql` L369–374. App-layer catch without SQLSTATE ≠ pass. A successful claim on any NULL case ≠ pass.

## Sequencing

- Line B（pool-role-leak）is in flight. **Do not edit** `apps/worker` checkpoint principal / pool release files in parallel with B, including `apps/worker/src/checkpoint-principal.ts`.
- Do not edit `packages/db/test/uc052-checkpoint-physical.proof.ts` in this REQUEST.
- Coding/prove for this note starts only after Line B is nailed.

## Ban SSOT

Do not edit the coverage matrix, gap backlog, or execution checklist. Do not edit UC-018 or UC-052 matrix rows. Do not flip covered. Public DELETE stays 503.

## NHP

| Order | Item |
|-------|------|
| 1 NEG | NULL epoch refused `42501` · no writes |
| 2 NEG | NULL digest refused `42501` · no writes |
| 3 NEG | both NULL refused `42501` epoch message · no writes |
| 4 FAULT | Wrong SQLSTATE or a written row → fail |
| 5 BOUND | Sealed positive control must succeed or the negatives are uninterpretable |
| 6 ADV | Forged app-layer exception without DB ERRCODE → fail |
| HP last | Three negatives + sealed control recorded · still ≠ UC-052 covered · DELETE stays 503 |

## Prove plan（after Line B nail + authorize · not this open）

1. Wait until `GAP-UC052-POOL-ROLE-LEAK` is nailed
2. Prove the four cases against 0091 · assert SQLSTATE `42501` and unchanged rows on the negatives
3. Do not touch the principal file unless a later dual says the refusal cannot be shown without it（default: DB prove only）

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-02-note-ckpt-unsealed-claim-neg-mw-privacy-int.md` | **PENDING** |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-note-ckpt-unsealed-claim-neg-mw-e2e-ha.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push

*Harness · NOTE-CKPT-UNSEALED-CLAIM-NEG · draft:awaiting_pre_exec_dual · SQLSTATE 42501 · Ban parallel principal edit · STOP*
