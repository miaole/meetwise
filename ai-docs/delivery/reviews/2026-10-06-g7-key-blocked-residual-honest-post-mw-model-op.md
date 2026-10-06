# POST review — Line AD G7 Key-blocked residual honest receipts · mw-model-op

**Reviewer**: `mw-model-op` · independent · Ban self-approve · Ban nail · alone ≠ dual · 不代签 peer `mw-e2e-ha`
**Date**: 2026-10-06 Asia/Shanghai (UTC+8)
**Kind**: POST · Branch A + B′ · Ban live · Ban `g7SuiteGreen=true` · Ban nail
**REQUEST**: `f32f56d8f602b9bf9aaa9f708ddbb59d7cef973f`
**PRE dual**: mw-e2e-ha `f2154387df654b4600b74b4c8a52c1d35f5986b2` + mw-model-op `2d422c14e585c544a162f536cc9b3058a7d14e30` (C-MO-AD-1..9)
**Implementer exec HEAD**: `880f14408dda9a9cb03737b811b6005d94c3a2dc`
**PROVE_TIP (receipts)**: `f4981cb6f75d5710039915b47e063e9192248da0`
**Stubs tip**: `2e4a825bc1c77d5428bdab281dba4c4aaf6104f2` (descendant of f4981cb; only cites PROVE_TIP in SUMMARY + adds POST stubs)
**Reviewer re-run HEAD**: `f4981cb6f75d5710039915b47e063e9192248da0` · porcelain 0 before/after · worktree `/workspace/meetwise-mwmodelop-lineAD-post`

## Diff classification

| Range | Non-`ai-docs` | `ai-docs` |
|-------|---------------|-----------|
| `2d422c1..f4981cb` | **empty** | Line AD: harness additive addendum (L92+, P1–P5 rename; earlier lines unchanged) + 9 receipts under `receipts/g7-key-blocked-residual-honest/` · siblings (out of scope): Line AE/AF/AG/AH REQUEST/review/receipt docs |
| `f32f56d..2e4a825` | **empty** | as above + SUMMARY PROVE_TIP cite + 2 POST stubs |
| `880f144..f4981cb` | **empty** | docs only |

No code / script / package / lockfile / workflow change; no reconciler / spend ledger / MODEL-OP-00 touch.
Code identity vs Line AC: `run-e2e.mjs` blob `c655235c…`, `run-e2e-ui.mjs` `aa86fb3f…`, `with-docker-session.sh` `0130fb46…` are **identical** to `160c30c`. `run-e2e-isolated.mjs` `9dcbbda3…`→`2e78877c…` (+39/−3: allowlist/receipt-source entries for Lines V/W/Z/AB; trio + Key gate path unchanged). Migrations 135→136 (`0136_payment_order_refund_provider_txn.sql`, Line Z).
Line AC receipts: only change after `7c818c5` is the authorized Line AC NAIL `3922b48` (2026-10-06 00:29 CST, lifecycle/nail additive); **Line AD made zero edits** to `receipts/g7-env-gap-honest-fix/`; nail still NAILED TO `7c818c5`.
package.json G7 scripts @ `f4981cb`: `:260` e2e:isolated · `:261` e2e:ui:isolated · `:264` verify:e2e-performance — matches receipts.

## Offline-safety check before re-run
`run-e2e.mjs:15–19` auto-loads `ROOT/.env` if it exists — that could have supplied a key. Presence-only check (file **not** read): `.env`, `.env.local`, `apps/api/.env` **absent**. All `*_API_KEY` / `MODEL_BASE_URL` unset in the shell, plus `env -u MODEL_API_KEY -u MODEL_BASE_URL` per CMD. Key gate `:43` precedes any provider/network work.

## CMD / EXIT (reviewer re-run · each ×1 · `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL …` · no sudo · CST 2026-10-06)

| # | CMD | Start→End | EXIT | Key lines |
|---|-----|-----------|------|-----------|
| 1 | `pnpm e2e:isolated` | 13:14:13→13:14:25 | **1** | `migrations: applied=136` · no `database_not_ready` · machine receipt `outcome=failed exitCode=1 assertionCount=null releaseEvidence=false` (child stderr withheld, `run-e2e-isolated.mjs:1916-1917`) |
| 2 | `pnpm e2e:ui:isolated` | 13:14:25→13:14:35 | **1** | migrate 136 · `E2E_FAILURE class=provider code=live_provider_key_missing` at `run-e2e-ui.mjs:48:52` |
| 3 | `pnpm verify:e2e-performance` | 13:14:35→13:15:45 | **1** | web build ✓ · `✓ 迁移运行器 全部通过` (migrate:prove) · HTTP full E2E migrate 136 then Key-blocked · `e2e_performance_suite_failed:HTTP full E2E:exit=1` |
| 4 | probe A `env E2E_ISOLATED=1 node scripts/run-e2e.mjs` | 13:15:45 | **1** | `live_provider_key_missing` at `run-e2e.mjs:43:52` |
| 5 | probe B `env E2E_ISOLATED=1 pnpm e2e:prove` (exact child of `run-e2e-isolated.mjs:2162`) | 13:15:45→13:15:46 | **1** | same, frame `run-e2e.mjs:43:52` |

Trio **1/1/1**; class Key-blocked on all three; matches implementer (13:05–13:07 CST @ `880f144`). Model calls **0**; `actualSpendCny` unwritten (**null**).

## C-MO-AD-3 evidence (e2e:isolated Key-blocked, not inferred from EXIT)
Static: `scripts/run-e2e.mjs:43` `if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider','live_provider_key_missing')` (blob `c655235c`). Direct: my probes A+B show stack frame `run-e2e.mjs:43:52` with keys stripped. The implementer receipt `P3-direct-probe-e2e-isolated.md` did the same (PROBE-A/B, EXIT 1/1, frame `:43:52`; L3 "Ban inferring class from EXIT alone"); its stderr-withheld cite `run-e2e-isolated.mjs:1916-1917` and child cite `:2162` are accurate. **Satisfied.**

## Rulings (receipt cites in `receipts/g7-key-blocked-residual-honest/`)

1. **EXIT claims match** — PASS. SUMMARY L23–27 1/1/1 = my re-run.
2. **assertionCount=null ≠ 0 failures** — PASS. P2 L19–20 (unknown/null; Ban "0 failures"), P3-re-attest-e2e-isolated L40, SUMMARY L67. The "0 FAIL" strings in P1 L47–48 belong to the guard-proof scripts (CITE_EXIT 0/0, labelled "≠ e2e pass" at P1 L50), not to trio business asserts.
3. **g7SuiteGreen=false; `=true` only in Ban wording** — PASS (sole hit SUMMARY L3, Ban list).
4. **P1–P5 rename; no "R1 done"** — PASS. Harness addendum; P1 L3 "P1-product ≠ gate R1 … 'P1 done' ≠ 'R1 closed'"; SUMMARY L17; P2 L3. No "R1 done" phrasing.
5. **Disclosure-1 / R1 OPEN; TECH_ROLE=0 not counted** — PASS. SUMMARY L49–50, P2 L32.
6. **0 model calls · actualSpendCny=null · no key fingerprint** — PASS. SUMMARY L53; P3 files L40/45/54; P3-gate-probes L24 presence-only.
7. **Erratum** — PASS. SUMMARY L59; P4 L25–30. Forbidden shorthand only as Ban.
8. **AC receipts nailed to 7c818c5, not rewritten by AD** — PASS (see diff classification).
9. **Line numbers re-pinned** — PASS (`:260/:261/:264`; AC historic `:251/:252/:255` retained).
10. **Unlock ledger ≠ authorization** — PASS. P4 L1–3 "Listing a condition here authorizes nothing"; U1–U4 all not provided/not opened/not given.
11. **Pins exact** — PASS. SUMMARY L51–52: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained.
12. **No HA / R1 / G7 green / A3 / MODEL-OP-00 closed claims** — PASS; only negations (SUMMARY L67; P4 L34).

## C-MO-AD-1..9

| Cond | Status |
|------|--------|
| 1 Ban live, keys stripped, spend null, no fingerprint | **met** |
| 2 Key-blocked = FAIL; business-assert null; g7SuiteGreen=false | **met** |
| 3 e2e:isolated direct evidence | **met** (static :43 + direct probes, implementer + reviewer) |
| 4 No Key-gate bypass | **met** (gate blobs identical to 160c30c; no fake key/flags) |
| 5 Unlock ledger ≠ authorization | **met** |
| 6 Disclosure-1/R1 OPEN; R-label clash resolved | **met** (P1–P5) |
| 7 Erratum verbatim | **met** |
| 8 Re-pin lines; AC nailed to 7c818c5 | **met** |
| 9 No reconciler/MODEL-OP-00; Ban cloud/Meridian/secrets/force/SSOT | **met** (SUMMARY "SSOT zero touch") |

## Blockers
**None.**

## Non-blockers
1. `run-e2e.mjs:15–19` silently loads `ROOT/.env` when present. Any future keys-stripped re-attest must check `.env` absence (presence only, never read), otherwise a local `.env` key could bypass `env -u` and turn the run live. The implementer recorded "no `.env*` on disk" (SUMMARY gate-probes line); keep that as a required probe.
2. The PROVE_TIP `f4981cb` is a rebased receipts commit; the actual run HEAD is `880f144` (disclosed in SUMMARY). Code-identical (non-docs diff empty), so no evidence gap.

## Pins (restate)
haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · `g7SuiteGreen=false` · Disclosure-1 OPEN · R1 OPEN · trio OPEN 1/1/1

## Explicit non-claims
≠ nail · ≠ suite green · ≠ trio green · ≠ G7 green/closed · ≠ R1 closed · ≠ Disclosure-1 closed · ≠ HA · ≠ A3 closed · ≠ MODEL-OP-00 closed · ≠ covered · ≠ live · ≠ Key provisioning · Key-blocked ≠ pass · assertionCount=null ≠ 0 failures

PASS ≠ nail ≠ suite green · alone ≠ dual

Verdict: PASS
