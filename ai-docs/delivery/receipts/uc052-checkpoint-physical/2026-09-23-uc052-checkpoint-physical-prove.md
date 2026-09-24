# UC052 checkpoint physical prove receipt (Line B)

**Knife**: GAP-PRIV-CHECKPOINT-FENCE-ONLY
**CMD**: pnpm uc052:checkpoint-physical:prove
**EXIT**: 0
**Runner SHA**: 3b9ab17 / 3b9ab17a5d2a4d28336524308fa1e7d577276050
**Code tips**: 775710f (feat) · 3b9ab17 (tsc fix)
**Date**: 2026-09-23 (~21:20 PT)

## Cases

All REQUIRED pass: FAULT-01/02/03 · NEG-01/02/03 · BOUND-01 · ZERO · RACE · HP-052-CKPT-01 · C-CASECOUNT.

## Gates

| Gate | Result |
|------|--------|
| Three-table admin COUNT=0 | PASS (HP + FAULT-02/03/RACE) |
| NEG-02 cross-tenant before/after | PASS |
| Public DELETE 503 | PASS (NEG-03) |
| app_role begin GRANT | false |
| Request terminal | pending_external (Ban completed) |
| tsc -p packages/db --noEmit | 6 = baseline · zero new |
| uc052:internal-erasure:prove | EXIT=0 |
| privacy-authorization:prove | EXIT=0 |
| porcelain at prove | clean |

## Pins retained

NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503 · Ban invent covered · Ban SSOT edit this tip

STOP after receipts · no messaging.
