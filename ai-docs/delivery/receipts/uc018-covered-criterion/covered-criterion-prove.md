# UC-E2E-018 COVERED-CRITERION · prove receipt (fix-round 5)

**Status**: `executed:awaiting_post_prove_dual`
**Date**: 9/23/2026, 9:10:25 PM PT
**Runner commit**: `476d1fd` / full `476d1fd259c4ba80a378d441b28626d44b0be4c2`
**Command**: `pnpm uc018:covered-criterion:prove` EXIT=0
**Porcelain**: clean (`.tmp/` only during prove)

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| `pnpm uc018:covered-criterion:prove` | **0** ×2 |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** (cite script tip `e09d56e`) |

## Parser (round 5)

- Last non-empty line must match `/^(\*\*)?Verdict: (PASS|FAIL)(\*\*)?$/` (balanced bold)
- HTML comment defense: unclosed `<!--` or `Verdict:` inside comment ⇒ null
- Removed fence/quote/indent strip path
- Mutation **423/423**

## Pins

coveredCount=8 · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained
