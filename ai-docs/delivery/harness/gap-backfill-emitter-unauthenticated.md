# Harness — **GAP-BACKFILL-EMITTER-UNAUTHENTICATED**（HMAC or signature so a JSON+log pair cannot be forged · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · this open does not edit emitter / guard / prove）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Dual PASS ≠ coding · Dual PASS ≠ covered）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **GAP-BACKFILL-EMITTER-UNAUTHENTICATED**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · UC-018 stays **partial** · Ban invent covered
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · Ban coding until dual+authorize
**Honesty**: Today's guard is HMAC-free. SHA-256 of the log file does not authenticate the emitter. This REQUEST does not change that code.

---

## Gap

`scripts/lib/uc018-receipt-backfill-guard.mjs` binds a receipt to `sha256(log file)`. `scripts/uc018-receipt-backfill-emit.mjs` discloses `GAP-BACKFILL-EMITTER-UNAUTHENTICATED: HMAC-free JSON+log digest pair is forgeable.` Anyone who can write both the JSON and the log can produce a matching pair. That is not an emitter signature.

## Goal（after authorize · not this open）

Add an HMAC or signature so a JSON+log pair cannot be forged by rewriting both files. Implementation may touch **only**:

- `scripts/uc018-receipt-backfill-emit.mjs`（emitter）
- `scripts/lib/uc018-receipt-backfill-guard.mjs`（guard）
- `scripts/uc-e2e-018-receipt-backfill.proof.mjs`（prove）

Ban this knife from editing `scripts/lib/uc018-receipt-backfill-facts.mjs`, `scripts/lib/uc-covered-evaluator.mjs`, receipt JSON already on disk, the coverage matrix, the gap backlog, and the execution checklist. **This REQUEST does not edit the emitter, guard, or prove.**

Key rule: no secret in git. The HMAC key comes from the process environment at run time. Ban reading `.env*`. A prove may set a fixture key in-process. Ban logging the key.

## NHP

| Order | Item |
|-------|------|
| 1 NEG | Receipt with a valid log digest but no HMAC/signature → reject |
| 2 FAULT | Truncated signature → reject |
| 3 BOUND | Key missing → fail closed · Ban a default key in the repo |
| 4 ADV | Attacker rewrites JSON and log together without the key → reject |
| 5 PERF | Not a capacity prove |
| 6 LOAD | Not a load prove |
| HP last | Emitter output verifies · forged pair does not · still ≠ UC covered |

## Prove plan（after authorize · not this open）

1. Dual agrees the three-file allowlist
2. Offline prove: genuine emit verifies; mutated JSON fails; mutated log fails; both mutated without the key fails
3. No live services · no SSOT edits

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-gap-backfill-emitter-unauthenticated-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-02-gap-backfill-emitter-unauthenticated-mw-rag-route.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push

*Harness · GAP-BACKFILL-EMITTER-UNAUTHENTICATED · draft:awaiting_pre_exec_dual · no code this open · STOP*
