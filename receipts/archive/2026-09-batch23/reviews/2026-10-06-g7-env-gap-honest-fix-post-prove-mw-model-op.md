# POST-PROVE dual review — Line AC G7 env-gap honest fix Path A · mw-model-op

**Reviewer**: `mw-model-op` · independent · Ban self-approve · Ban nail · alone ≠ dual · 不代签 peer
**Date**: 2026-10-06 Asia/Shanghai (UTC+8)
**Kind**: POST-PROVE · Path A · Ban live · Ban `g7SuiteGreen=true` · Ban nail
**REQUEST**: `94a8b2aead1b7087115a0ac1af9f790ef2a8f177`
**PRE-EXEC (this expert)**: `7b068de6234e05929c99d447a031871051cddc6d` · conditions C-MO-AC-1..9
**CODE_SHA**: `160c30cac7a0a05106120949f337847b782647b7`
**PROVE_TIP**: `7c818c5fe2249cdac686aa2a0e58748b3c5dea68`
**Re-run HEAD**: `160c30cac7a0a05106120949f337847b782647b7` (code SHA; receipt tip cites prove docs only)
**Worktree**: `/workspace/meetwise-mwmodelop-lineAC-pp`

## Diff classification

| Range | Product / scripts | Receipts / docs |
|-------|-------------------|-----------------|
| `94a8b2a..160c30c` non-ai-docs | **only** `scripts/with-docker-session.sh` (Path A session-group activator) | parallel Line Z/AA/AB docs + peer PRE appends (out of Line AC code scope) |
| `160c30c` vs parent | `scripts/with-docker-session.sh` only | — |
| `160c30c..7c818c5` | **empty** product | `ai-docs/delivery/receipts/g7-env-gap-honest-fix/{SUMMARY,e2e-isolated,e2e-ui-isolated,verify-e2e-performance}.md` |

**Reconciler / spend-ledger / MODEL-OP-00**: zero touch (`git diff --name-only` no `packages/ai-runtime`, no usageCalibration / model-invocation-reconcile).  
**package.json**: unchanged vs REQUEST; scripts still `:251` `e2e:isolated` · `:252` `e2e:ui:isolated` · `:255` `verify:e2e-performance` (C-MO-AC-8 re-pin). No new script additions.

## CMD / EXIT table (this reviewer re-run · keys unset · no sudo · via `scripts/with-docker-session.sh`)

| # | CMD | EXIT | Observed (CST 2026-10-06) |
|---|-----|------|---------------------------|
| 1 | `bash scripts/with-docker-session.sh pnpm e2e:isolated` | **1** | 00:21:52→00:22:04 · wrapper `sg docker` · `E2E_POSTGRES_READY` · **migrations applied=135** · ≠ `database_not_ready` · machine receipt `outcome=failed` `exitCode=1` `assertionCount=null` (top-level throw; isolated withholds child stderr by design) |
| 2 | `bash scripts/with-docker-session.sh pnpm e2e:ui:isolated` | **1** | 00:22:17→00:22:28 · DB ready · migrate 135 · **`E2E_FAILURE class=provider code=live_provider_key_missing`** @ `scripts/run-e2e-ui.mjs:48` |
| 3 | `bash scripts/with-docker-session.sh pnpm verify:e2e-performance` | **1** | 00:22:32→00:23:56 · web build ran · **schema migration/deploy evolution PASS** (`prove:migrate`) · HTTP full E2E then Key-blocked cascade · `e2e_performance_suite_failed:HTTP full E2E:exit=1` · ≠ Line U migrate EXIT1 |

**Direct guard probes (no Docker; Ban live)**:  
`E2E_ISOLATED=1 node scripts/run-e2e.mjs` → EXIT **1** · `live_provider_key_missing` @ `run-e2e.mjs:43`  
`E2E_ISOLATED=1 node scripts/run-e2e-ui.mjs` → EXIT **1** · same @ `run-e2e-ui.mjs:48`  
Both throw **before** any provider/network dispatch.

**Model calls**: **0** (keys unset; guard aborts pre-dispatch). **`actualSpendCny`**: stays **null** (ledger builder `run-e2e-isolated.mjs:82` hard-null; no write path exercised). **`g7SuiteGreen`**: remains **false** (receipts + Ban; never flipped true).

## Rulings

1. **Env-gap cleared (Path A) — PASS**: All three CMDs reach ready PG + migrate 135 / migrate:prove PASS under `with-docker-session` (`sg docker` only when `/etc/group` already lists `box` in docker; Ban sudo/chmod/usermod — script L8–15, L46–51). Dominant FAIL class flipped from Line U `database_not_ready` to Key-blocked.
2. **Key-blocked real guard — PASS**: Unconditional `if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider','live_provider_key_missing')` in `run-e2e.mjs:43` / `run-e2e-ui.mjs:48` after isolation + fake-flag checks, **before** FreeTier/G7 ledger setup or browser/API work. Missing key → EXIT 1 always in probes; cannot EXIT 0.
3. **Ban live / spend — PASS**: Keys unset in reviewer shell + child inherits; 0 outbound model calls; `actualSpendCny=null`; no invented spend; no reconciler/MODEL-OP-00 close.
4. **g7SuiteGreen / Disclosure-1 / R1 — PASS**: Prove receipts keep `g7SuiteGreen=false`; `g7SuiteGreen=true` only in Ban wording; Disclosure-1 OPEN (`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` never counts toward R1); R1 OPEN (`r1Closed=false`) — SUMMARY L52–55.
5. **Erratum — PASS**: observe=`3424dc1` · removal=`82981ff` · Ban shorthand `quota-403=82981ff` in all four prove receipts.
6. **Pins — PASS**: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained. No HA / R1 closed / G7 green / A3 closed / MODEL-OP-00 closed claims.
7. **Scope — PASS**: Sole code file `scripts/with-docker-session.sh`; honesty bounds Ban privilege self-grant; ≠ suite green (script L15).

## C-MO-AC-1..9 status

| Cond | Status |
|------|--------|
| C-MO-AC-1 Ban live / spend null | **met** (re-run + static) |
| C-MO-AC-2 g7SuiteGreen stays false | **met** |
| C-MO-AC-3 Key-blocked ≠ pass | **met** (EXIT 1/1/1) |
| C-MO-AC-4 Disclosure-1 / R1 OPEN | **met** |
| C-MO-AC-5 no reconciler / MODEL-OP-00 | **met** |
| C-MO-AC-6 erratum | **met** |
| C-MO-AC-7 Path A falsifiable · one-shot | **met** (DB crossed + Key-blocked) |
| C-MO-AC-8 re-pin script lines | **met** (:251/:252/:255) |
| C-MO-AC-9 Ban cloud/Meridian/secrets/force | **met** (sg only) |

## Blockers
**None.**

## Non-blockers
1. `e2e:isolated` isolated runner withholds child stderr (`ISOLATED_POSTGRES_OUTPUT_WITHHELD`); Key-blocked class proven via direct `run-e2e.mjs` probe + UI stderr + assertionCount=null pattern (same as implementer SUMMARY).
2. Trio still OPEN 1/1/1 — Path A success ≠ suite green (expected).

## Pins (restate)
haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · `g7SuiteGreen=false` · Disclosure-1 OPEN · R1 OPEN · trio OPEN 1/1/1

## Explicit non-claims
≠ nail · ≠ suite green · ≠ G7 green · ≠ R1 closed · ≠ Disclosure-1 closed · ≠ HA · ≠ A3 closed · ≠ MODEL-OP-00 closed · ≠ covered · ≠ live · Key-blocked ≠ pass

PASS ≠ nail ≠ suite green · alone ≠ dual

## Verdict rationale
Re-ran trio at CODE `160c30c` offline with keys unset via `with-docker-session` (no sudo): EXIT **1/1/1**; env-gap cleared (DB+migrate green); fail-closed `live_provider_key_missing` before provider dispatch; spend null; pins + C-MO-AC-1..9 hold; code scope = docker session activator only. Does not authorize nail or `g7SuiteGreen=true`.

Verdict: PASS
