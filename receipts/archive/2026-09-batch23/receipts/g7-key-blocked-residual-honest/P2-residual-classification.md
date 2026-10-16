# P2 — Residual classification table（Line AD · G7 trio · Ban `assertionCount=null` as 0-fail / green）

> **Naming**: P2-product ≠ gate R2. Gate **R1 OPEN** · **Disclosure-1 OPEN**.

**Inputs**: Line AC receipts `receipts/g7-env-gap-honest-fix/`（prove tip **NAILED TO** `7c818c5` · code `160c30c` · EXIT 1/1/1）+ Line AD Branch B′ re-attest ×1 @ `880f144`（this dir · EXIT 1/1/1）+ P1 static cite + direct probe.

## Four-way classification（per CMD）

| CMD | env-gap | Key-blocked | business-assert | not_run | Line AC EXIT（`7c818c5`） | Line AD EXIT（`880f144`） |
|-----|---------|-------------|-----------------|---------|---------------------------|---------------------------|
| `pnpm e2e:isolated` | **cleared @ AC**（Path A `with-docker-session.sh`; re-confirmed: DB boot + migrate 136 + pre-prove ready） | **OPEN** — `provider/live_provider_key_missing` @ `run-e2e.mjs:43`（direct probe stack frame `:43:52`） | **unreached → UNKNOWN**（`assertionCount=null`; case ledger never started） | `e2e/full.e2e.ts` cases: all **not_run** | **1** | **1** |
| `pnpm e2e:ui:isolated` | **cleared @ AC**（re-confirmed: DB + migrate 136） | **OPEN** — same code @ `run-e2e-ui.mjs:48`（stderr verbatim, frame `:48:52`） | **unreached → UNKNOWN**（null） | Playwright cases: all **not_run** | **1** | **1** |
| `pnpm verify:e2e-performance` | **cleared @ AC**（re-confirmed: web build 0 · `migrate:prove` 0） | **OPEN（cascaded）** at step 3 `HTTP full E2E` → same `run-e2e.mjs:43` gate | **unreached → UNKNOWN**（step-3 `assertionCount=null`） | suite steps 4–27（`run-e2e-performance-suite.mjs:21–44`）**not_run** · no PERF data | **1** | **1** |

## Counting rules（binding for this knife）

| Quantity | Value | Ban |
|----------|-------|-----|
| Business assertions executed | **unknown（null）** per CMD | Ban writing `0` / "0 failures" / "all passed" |
| Business assertions failed | **unknown（null）** | Ban "0 fail" |
| Trio EXIT | **1 / 1 / 1** | Ban retry-to-green · Ban keeping only a green attempt |
| Trio status | **OPEN 1/1/1** | Ban trio/suite/family green |
| `g7SuiteGreen` | **false** | Ban true |
| Key-blocked | **FAIL / blocked**（constraint-impassable under Ban live） | Ban pass / skip-as-pass / not_run-as-pass / "env limitation counts as pass" |

## Class drift check（B′ purpose）

Class at `880f144` == class at `7c818c5`: **Key-blocked** on all three; **no drift**（no return to env-gap · no new class）. Non-class drift recorded honestly: migrations 135 → 136（Line Z `0136_payment_order_refund_provider_txn.sql`）; `run-e2e-isolated.mjs` blob `9dcbbda3636f` → `2e78877ca3f2`（allowlist / receipt additions; gate path unchanged）; `package.json` lines `:251/:252/:255` → `:260/:261/:264`.

## Retained disclosures

Disclosure-1 **OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` e2e default = non-production role path · never counts toward R1）· R1 **OPEN**（`r1Closed=false`）· R5-MARKED-RED pgvector-legacy fixture · G6 OPEN · BUG-E2E-ISO not closed.

*P2 · Line AD · residual classification · trio OPEN 1/1/1 · business-assert unknown(null) · STOP*
