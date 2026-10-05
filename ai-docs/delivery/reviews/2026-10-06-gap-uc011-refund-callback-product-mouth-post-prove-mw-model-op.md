# Line Z · GAP-UC011-REFUND-CALLBACK Path A · POST-PROVE · mw-model-op

**Role**: independent reviewer `mw-model-op` (alone ≠ dual · peer e2e POST-PROVE `938adee` observed, not reused as own ruling)
**Date**: 2026-10-06 ~00:38 CST (Asia/Shanghai · UTC+8)
**Branch**: `feat/mysql-schema-skeleton`
**Worktree**: `/workspace/meetwise-mwmodelop-linez-pp` (fresh · keys unset · `sg docker` · Ban live · Ban `.env*` · Ban Meridian · Ban sudo)
**Prior**: RE-PRE-EXEC PASS receipt `76edbc66ea4a7f4950f33ae62b327b5053ed4162` · tip then `54b20583fdc828ca43f2c9dbbc9e35060dce7dff` · B1_PINS · peer e2e re-PRE `cffaf8e8adac653a6f417f6b7fadbffe1eb0ee6c`
**Implementer prove receipt**: `ai-docs/delivery/receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md` @ PROVE tip `244b81248d33bb85110a5304fff1f3d56de8563a`
**Claim under review**: CODE `bf1fdb2` · PROVE tip `244b812` · EXIT=0 · 41/41 · B-1 pins machine-checked
**Ban**: nail · covered · invent covered · wash ADV · HA/R1/G7 green/A3/MODEL-OP-00 · PASS ≠ nail ≠ covered · alone ≠ dual

## SHAs (full)

| Ref | Full SHA |
|-----|----------|
| RE-PRE tip (B1_PINS) | `54b20583fdc828ca43f2c9dbbc9e35060dce7dff` |
| CODE | `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f` |
| PROVE tip (receipt cite) | `244b81248d33bb85110a5304fff1f3d56de8563a` |
| Prior model-op RE-PRE | `76edbc66ea4a7f4950f33ae62b327b5053ed4162` |
| Peer e2e re-PRE | `cffaf8e8adac653a6f417f6b7fadbffe1eb0ee6c` |
| Peer e2e POST-PROVE (observed) | `938adee524e9d927cecbc2e9ea84614e94d582e3` |
| Review base at write | `c674cb543fa93f849d84224074c5a69fb68a741e` (= `origin/feat/mysql-schema-skeleton` at fetch) |

Prove re-run tree = CODE `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f` (ancestor of tip).

## 1. Diff classification

### `bf1fdb2` alone (Path A product — in scope)

| Class | Paths |
|-------|-------|
| product code | `apps/api/src/modules/commerce/commerce-webhook.controller.ts` · `commerce.service.ts` |
| migration / SQL | `packages/db/migrations/0136_payment_order_refund_provider_txn.sql` · `packages/db/sql/11_commerce.sql` |
| db API | `packages/db/src/payment.ts` · `packages/db/src/index.ts` |
| tests / proves | `apps/api/test/uc-e2e-011-refund-callback-mouth.proof.ts` (new) · `uc-e2e-011-report-refund-http.proof.ts` (H4/H5 honesty) · `packages/db/test/uc-e2e-011-report-refund.proof.ts` |
| package.json / scripts | root `package.json` · `apps/api/package.json` · `scripts/run-e2e-isolated.mjs` (register target) |
| lockfile / deps | **none** (no pnpm-lock / package-lock change) |
| G7 / reconciler / MODEL-OP / ai-runtime | **none** |

### `bf1fdb2..244b812`

| Class | Paths |
|-------|-------|
| docs / receipt only | `ai-docs/delivery/receipts/2026-10-06-gap-uc011-refund-callback-product-mouth-prove.md` |

### Broader `54b2058..bf1fdb2` (flag · not CODE commit)

Also lands Line AC G7 env-gap receipts/reviews + `scripts/with-docker-session.sh` + REQUEST stub edits — **out of refund-callback product scope**; not authored by `bf1fdb2`. No G7/reconciler/MODEL-OP product touch inside CODE commit. Payment ledger here = commerce `payment_order` / entitlement clawback ≠ G7 spend-ledger.

**Scope ruling**: CODE commit in-scope for Path A mouth; no out-of-scope product blocker in `bf1fdb2`.

## 2. Product code review (file:line)

### Mouth

- `POST /commerce/webhook/refund/:id` — `commerce-webhook.controller.ts:18–22` → `CommerceService.refundWebhook`.

### Signature · fail-closed · order of ops

- Missing `providerTxn` / `sig` → **400 `{error:'invalid_callback'}`** before HMAC — `commerce.service.ts:80`.
- Secret = `process.env.PAY_PROVIDER_SECRET ?? ''` — **not hard-coded**; empty secret fail-closed — `:81–84`.
- HMAC-SHA256 over `` `${id}:${providerTxn}:refunded` ``; compare via `timingSafeEqual` with equal-length gate — `:82–84` (**constant-time** when lengths match; length mismatch → reject without `timingSafeEqual`).
- Wrong / garbage / wrong-order / **pay-tag** sig → **403 `bad_signature`** — **before** owner DB lookup (`:84` then `:85–88`).
- No secret logged in this path (service throws HttpException only).
- No `SKIP_SIG` / test-mode / NODE_ENV signature bypass in commerce module (rg clean) → **no prod-reachable bypass**.

### Named codes · route-404 distinction

- Unknown order (valid sig) → **404 `order_not_found`** — `:88`, `:90` — body `{error:'order_not_found'}` ≠ Nest route 404 `Cannot POST …`.
- Conflict → **409 `order_conflict`** — `:91`.
- Amount: body typed `{providerTxn?, sig?}` only — **DISCLOSED** no amount channel / no fake amount-validation claim — comment `:75` + AMT prove class.

### M1 / M2 · DB idempotency / race

`markOrderRefunded` — `packages/db/src/payment.ts:104–165`:

- Savepoint wraps CAS + clawback — `:106`.
- Atomic CAS: `UPDATE … status='refunded' … WHERE status='paid' AND NOT EXISTS (refund_provider_txn=$3)` — `:110–117`.
- Partial **UNIQUE** `uq_payment_order_refund_provider_txn` — migration `0136:27–28`; `23505` → `conflict` — `:119–123`.
- First success → entitlement clawback once; insufficient avail rolls back savepoint → `conflict` — `:149–153`.
- Replay same txn on already-refunded order → `already` with **no second clawback** — `:163`.
- Concurrent double-callback: same-order same-txn → one CAS winner + other `already`; same-order different-txn → one winner + other `conflict` (status no longer paid); cross-order same-txn → UNIQUE / NOT EXISTS → one `refunded` + one `conflict`. **DB-level guarantee**, not in-memory only.

### Expired sig

No timestamp/nonce in HMAC payload → no separate `expired` code; expiry folds into wrong-sig → `bad_signature`. **Non-blocker** (aligned RE-PRE Condition; not claimed as implemented).

### H4/H5 honesty

H4/H5 updated PREREQ-6: mouth landed (403 bad_signature probe) · wallet/balance-ui still GAP · **EXIT0≠covered** · ADV not washed. Not a covered-lift.

## 3. Prove review (re-run)

### CMD / EXIT table

| CMD | Tree | EXIT | Asserts | Notes |
|-----|------|------|---------|-------|
| `pnpm uc011:refund-callback:prove` (= `run-e2e-isolated.mjs uc011:refund-callback:prove:raw` → `apps/api prove:uc011-refund-callback-mouth`) | `bf1fdb22674d10fc5ab7fb827a7da11def97fd1f` | **0** | **41/41** (0 FAIL) | keys unset · `sg docker` · isolated PG · `releaseEvidence=false` · receipt `.tmp/isolated-proof-receipts/2026-10-05T16-37-15-420Z-513413-395abe40-73f2-4311-8d56-741db267ec0c.json` |
| `pnpm uc011:adv:prove` (Line V) | same CODE tree | **1** | 18 total · **8 FAIL** | V harness **not** weakened · see below |

Prior env-gap attempts (missing workspace `node_modules` → host SQL probe fail → `isolated_postgres_database_not_ready:boot`) discarded; not attributed to product.

### Per-pin rulings (B1_PINS · mouth prove)

| Pin | Ruling | Cite |
|-----|--------|------|
| 403 `bad_signature` (wrong/garbage/cross-order/pay-tag) + Ban any-non-404-4xx-as-sig-evidence | **PASS** | prove `SIG` lines 120–130 · service `:84` · asserts require `status===403 && body.error==='bad_signature'` |
| 400 `invalid_callback` (missing fields) | **PASS** | prove `INV` 101–109 · service `:80` |
| 404 `order_not_found` ≠ Nest route-404 | **PASS** | prove `NF` 141–148 · body `error==='order_not_found'` + mouth-alive 403旁证 |
| Amount DISCLOSED (no fake amount validation) | **PASS** | prove `AMT` 151–163 · console DISCLOSED · structural ignore of smuggled amount fields |
| M1 `200 {result:'refunded'}` + CAS + clawback once | **PASS** | prove `M1` 171–178 · `payment.ts:125–156` |
| M2 `200 {result:'already'}` + DB side-effect unchanged | **PASS** | prove `M2` 186–195 · avail/units/`refund_provider_txn` count unchanged after replay · `:163` |
| Cross-txn uniqueness (M2x) | **PASS** (bonus vs B1) | prove `M2x` 203–211 · 409 `order_conflict` · UNIQUE index |

### Hard-wire check

By inspection: SIG asserts demand exact `403`+`bad_signature`. If HMAC guard removed, forged/pay-tag bodies would reach CAS and return `200 refunded` → SIG class FAIL → EXIT 1. Prove is **not** hard-wired to green without the guard.

### Line V `uc011:adv:prove` re-run

- **EXIT=1** (honest · not washed).
- **What changed vs pre-mouth**: surface probe on `POST /commerce/webhook/refund/:id` now **HTTP 403 `{error:'bad_signature'}`** (named code hit on equiv mouth). Primary `POST /payment/refund-callback` still Nest **404** `Cannot POST…`.
- A1: webhook-equiv PASS (non-404 4xx); primary still FAIL (404). A2 still probes **primary only** → dual 404 → FAIL (Ban wash 404=pass still enforced).
- Static INV still asserts *absence* of `markOrderRefunded` / refund webhook → now FAIL because mouth **exists** (stale inventory narrative; harness not updated in `bf1fdb2` — **ADV prove file not in CODE commit**).
- C-1 disclosure text in ADV still says named codes “未预填”; mouth prove (not ADV) carries named-code pins. ADV still accepts any non-404 4xx via `isExplainableRejectNotGap` — **not tightened**, but also **not weakened**.
- **Ruling**: V harness not washed green; ADV stays gap/case-only · `GAP-UC011-ADV-01` stays OPEN · Path A mouth EXIT0 ≠ ADV close.

## 4. Covered / ledger / pins / tsc

- **coveredCount stays 8** · EXIT0 ≠ covered · UC-011 stays **partial** · no separate covered gate in this knife.
- ADV **not** washed.
- Payment ledger = commerce order/entitlement path ≠ G7/reconciler spend-ledger.
- Pins exact: **NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **gR45Closed=true** · **coveredCount=8** · **ms3EqualsR4Closed=false** · **PG-retained**.
- No HA / R1 closed / G7 suite green / A3 / MODEL-OP-00 claims.
- Cheap `tsc --noEmit`: packages/db + apps/api show pre-existing / cross-package noise; **no new error attributed to** `uc-e2e-011-refund-callback-mouth.proof.ts` / `commerce.service.ts` / `payment.ts` mouth surface. `uc-e2e-011-report-refund-http.proof.ts` retains untyped-call TS noise (pre-style) — **non-blocker**.

## 5. Blockers / non-blockers

### Blockers

**None.**

### Non-blockers

1. No separate **expired-signature** code (folds into `bad_signature`) — disclosed / not claimed.
2. Literal `POST /payment/refund-callback` still 404; Path A delivered **equiv webhook** (harness-aligned). ADV EXIT1 until primary or ADV harness retarget — separate knife.
3. Line V static INV stale post-mouth; ADV not updated in CODE — honest EXIT1, not wash.
4. Broader `54b2058..bf1fdb2` includes Line AC / `with-docker-session.sh` — out of CODE commit scope.
5. Prove M2 is sequential replay; concurrency covered by DB CAS+UNIQUE (inspection), not a live parallel stress harness.
6. tsc baseline noise unrelated to mouth.

## Honesty footer

PASS ≠ nail ≠ covered · alone ≠ dual · EXIT0 ≠ UC-011 covered · ADV stays OPEN · Ban invent covered · Ban self-nail · Ban Meridian · Ban live

Verdict: PASS
