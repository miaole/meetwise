# UC-E2E-018 COVERED-CRITERION · prove receipt

**Status**: `executed:awaiting_post_prove_dual`
**Date**: 9/23/2026, 8:15:35 PM PT
**Runner commit**: `1cae8f6` / full `1cae8f6a738a5424ba2f79e11d5457667c7ab0a9`
**Command**: `pnpm uc018:covered-criterion:prove` EXIT=0

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| `pnpm uc018:covered-criterion:prove` | **0** |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |
| `pnpm uc018:perf-load:prove` | SKIPPED (heavy · not required) |

## Real UC-018 computed verdict

- `canHonestlyFlip=false`
- reasons: ["STATUS-NOT-COVERED","CASE-ONLY","PERF-LOCAL-ONLY","OPEN-GAP","S11-NOT-MET"]
- BOUND pin: `waiting_user-CAS` (NHP matrix has no NHP-018-BOUND-* · CAS waiting_user)
- PERF/LOAD: **PERF-LOCAL-ONLY** (docker-isolated · cite W2 sizing ~:32 · W0 pg-retained §2)

## Pins

- no UC-018 / §1.1 flip · no `covered` written
- coveredCount=8 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false
- gR45Closed=true · ms3EqualsR4Closed=false · PG-retained

## Guards

- b29c191 constant-FALSE trips: **YES** (canHonestlyFlip initialised false with no true/computed assignment (b29c191 ~196); unconditional refuseReasons.push('reassess-knife-refuses-…'))
- constant-TRUE: PASS
- anti-tautology: PASS
- reassess not constant-false: PASS

Ban invent covered · Ban self-nail · Ban secrets / .env* · Ban Meridian · Ban Cloud Agent
