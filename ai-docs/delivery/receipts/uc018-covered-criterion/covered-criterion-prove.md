# UC-E2E-018 COVERED-CRITERION · prove receipt (fix-round 4)

**Status**: `executed:awaiting_post_prove_dual`
**Date**: 9/23/2026, 9:03:34 PM PT
**Runner commit**: `b97de26` / full `b97de26e25f71bef357585ed98153897d31f1af3`
**Command**: `pnpm uc018:covered-criterion:prove` EXIT=0
**Porcelain at prove**: clean (evidence under gitignored `.tmp/` only)

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| `pnpm uc018:covered-criterion:prove` | **0** (×2 · no DIRTY_TREE) |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |

## Round 4 highlights

- flip↔reasons invariant · section11.status must be `covered` · openGaps absent → OPEN-GAP-UNKNOWN
- dual: fence/quote stripped · role↔git author enforced (distinct mw-e2e-ha / mw-rag-route)
- verifiedSha bound to gitSha · allPass alone ≠ EXIT 0
- leaf-mutation **423/423** · allowlist 4
- lift-reassess: tmp-only + dirty refuse

## Pins

coveredCount=8 · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained

*Tracked copy committed in receipts commit.*
