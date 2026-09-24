# UC-E2E-018 COVERED-CRITERION · prove receipt (fix-round 5b)

**Status**: `executed:awaiting_post_prove_dual`
**Date**: 9/23/2026, 9:13:27 PM PT
**Runner commit**: `22790a8` / full `22790a8dfb23604c4f47574b91d178e737f946a5`
**Command**: `pnpm uc018:covered-criterion:prove` EXIT=0
**Porcelain**: clean (`.tmp/` only during prove)

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| `pnpm uc018:covered-criterion:prove` | **0** ×2 |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |

## Fix round 5b

- Fixtures **FX-DUAL-UNTERMINATED-FENCE** / **FX-DUAL-HTML-ML**: expected `canHonestlyFlip=false` + `MISSING-DUAL` · got same (ok)
- Unterminated ```/~~~ fence ⇒ null (like unclosed `<!--`)
- Removed no-op `stripMarkdownNonProse`
- Mutation **423/423** · invariant flip↔reasons OK
- Real verdict: `canHonestlyFlip=false`

## Known limit (not blocker)

git-author role check can be spoofed with `git -c user.name/user.email`; path-suffix + author is tamper-evident only in review, not cryptographic.

## Missing range SHAs (disclose)

| SHA | Line |
|-----|------|
| `fc8429c` | C |
| `41cffea` | B |

Plus prior C-RANGE-PRODUCT: `994e83a` / `9e55109` / `3c4847a` / `8602cea` (+ g7). Line A = individual commits only.

## Pins

coveredCount=8 · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · Ban invent covered · Ban flip §1.1
