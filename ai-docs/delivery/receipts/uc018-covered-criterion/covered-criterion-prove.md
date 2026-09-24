# UC-E2E-018 COVERED-CRITERION · prove receipt (fix-round C-GATHERER-REAL-INPUT)

**Status**: `executed:awaiting_post_prove_dual`
**Date**: 9/23/2026, 8:32:02 PM PT
**Runner commit**: `ca1c8a5` / full `ca1c8a5b6848e0237a5f405113fc1dc4ed526e5d`
**Command**: `pnpm uc018:covered-criterion:prove` EXIT=0
**Porcelain at prove**: empty (Line A shared checkout; only Line A files)

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| `pnpm uc018:covered-criterion:prove` | **0** |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |
| `pnpm uc018:perf-load:prove` | SKIPPED (heavy · not required) |

## Literals removed → now-read source

| Was (literal) | Now reads |
|---------------|-----------|
| `targetEnv='docker-isolated'` | receipt `targetEnv`/`envClass`/`caps.method` (docker→docker-isolated); never invent non-local |
| `capacityRepresentative=false` | receipt `capacityRepresentative`/`capacity.representative` (absent≠true) |
| `exit ?? (nhpRow?0:null)` | receipt `exit`/`exitCode`/`exits[cmd]`/`allPass`; harness CMD|EXIT only if receipt absent |
| `committed:true` / `shaMatchesCommitted:true` | `git cat-file -e` + `merge-base --is-ancestor`; implementer-only forced uncommitted |
| `stack:{postgres:true,…}` | receipt `stack` / `soleStack` parse; absent→undefined→STUB-STACK |
| `present:true` | `receipt!=null` |
| gitSha `bdc5993`/`b29c191` literals | receipt gitSha fields || harness Prove tip citation |

## Real UC-018 computed verdict

- `canHonestlyFlip=false`
- reasons: ["STATUS-NOT-COVERED","UNCOMMITTED-RUNNER","MISSING-DUAL","CASE-ONLY","PROVE-FAIL","MISSING-RECEIPT","IMPL-ONLY","PERF-LOCAL-ONLY","OPEN-GAP"]
- businessPathMet: **true** (CLOSED-before-id / 已关 fix)
- PERF/LOAD: IMPL-ONLY + PERF-LOCAL-ONLY (implementer receipts + docker-isolated)

## Real-input negative tests

| Test | expect | ok |
|------|--------|----|
| drop-ADV-exit | PROVE-FAIL | true |
| nonexistent-ADV-sha | UNCOMMITTED-RUNNER | true |

## Guards

- b29c191 constant-FALSE trips: **YES**
- constant-TRUE: PASS
- anti-tautology: PASS
- gatherer-literal: PASS

## Pins

coveredCount=8 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · no UC-018/§1.1 flip · no `covered` written

Ban invent covered · Ban self-nail · Ban secrets/.env* · Ban Meridian · Ban Cloud Agent · STOP after push
