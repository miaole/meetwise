# Harness — **MODEL-OP spend-ledger docs + offline prove plan**（docs REQUEST · **`draft:awaiting_pre_exec_dual`** · until Line C is nailed: harness, gap notes, offline plan only · Ban live model calls · Ban outbound main-chain edits）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban live calls · Dual PASS ≠ coding · Dual PASS ≠ MODEL-OP closed）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **MODEL-OP spend-ledger offline**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · **≠ MODEL-OP closed** · **≠ SLO** · Ban假绿
**Experts**: `mw-model-op` + `mw-e2e-ha`（stubs PENDING · Ban self-approve）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · **No live model calls** · No coding until Line C is nailed and a later dual authorizes an offline prove only
**Honesty**: Estimate, cap, and console actual are three different numbers. This open does not fill `actualSpendCny`.

---

## What exists（cite only · do not edit）

- `buildG7ReceiptFields` in `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` sets `actualSpendCny: null` and `estimatedCostCny` from the in-process cap state. `priceBookCitation` is a citation, not a console invoice.
- Cross-process cap is an NDJSON file at `G7_RUN_COST_LEDGER_PATH`（`readG7SharedLedger`）. A writable file is not an authenticated spend ledger.
- `invoke.ts` binds `priceRevision` on the dispatch plan. That file is on Line C's outbound chain. **Do not change it in this knife.**
- Prior G7 harness: per-run ceiling **¥5.00** cited as a doc ceiling; actual spend is entered from the user/console; forging it is banned. This REQUEST does not re-run that live trio.

## Gap notes（this file only · Ban SSOT backlog edit）

| Note | Fact |
|------|------|
| GN-SPEND-ACTUAL-NULL | Process receipt writes `actualSpendCny: null`. Estimated running cost ≠ console actual. |
| GN-SPEND-LEDGER-FILE | NDJSON ledger has no HMAC. A rewritten file can move the cap. |
| GN-SPEND-PRICE-REV | `priceRevision` lives on the invoke path Line C is editing. Offline plan must not retune it. |

## Offline prove plan（after Line C nail · not this open）

No live model calls. No network. No Key. The later prove, if authorized, is a pure function/fixture test in a **new** offline script, not a change to:

- `packages/ai-runtime/src/g7-outbound-interceptor.ts`
- `packages/ai-runtime/src/model-client.ts`
- `packages/ai-runtime/src/invoke.ts`
- `packages/ai-runtime/src/g7-bootstrap.ts`
- `apps/api/src/main.ts`
- `apps/worker/src/main.ts`

Plan checks: missing ledger path fails closed; a fixture ledger over cap refuses another estimated call; `actualSpendCny` cannot be set by the estimator; a forged actual figure without a console citation is rejected. Ban treating EXIT 0 as MODEL-OP closed.

## NHP

| Order | Item |
|-------|------|
| 1 NEG | Missing ledger path → refuse |
| 2 FAULT | Over-cap estimate → refuse another call · no live retry |
| 3 BOUND | `actualSpendCny` stays null unless a cited console figure is supplied out of band |
| 4 ADV | Rewritten NDJSON without a signature → not evidence |
| 5 PERF | Not a capacity prove |
| 6 LOAD | Not a load prove |
| HP last | Offline plan only · still ≠ spend reconciled · ≠ MODEL-OP closed |

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-model-op` | `reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-mw-model-op.md` | **PENDING** |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-mw-e2e-ha.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push

*Harness · MODEL-OP spend-ledger offline · draft:awaiting_pre_exec_dual · Ban live · STOP*
