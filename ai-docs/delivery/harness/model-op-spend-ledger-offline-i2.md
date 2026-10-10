# Harness — **MODEL-OP spend-ledger offline I2**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs only · Ban product implementation · Ban live calls）
**Date**: 2026-10-02 (PT)
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` · `52815fb1b81b2401dc01b88d700101283d2f137b`
**Knife**: **MODEL-OP spend-ledger offline I2**
**Experts**: `mw-model-op` + `mw-e2e-ha`（stubs PENDING · Ban self-approve）

## Pins

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `coveredCount=8` · public DELETE=`503` · **PG-retained** · `actualSpendCny` stays **null** · **no live**

## Scope and bans

This is a docs-only REQUEST. Do not implement product code. Do not edit the outbound interceptor, model-client, invoke, g7-bootstrap, `apps/api/src/main.ts`, or `apps/worker/src/main.ts`. **Ban C outbound edits. Ban ledger product changes in this REQUEST.**

No live model calls, no network, no Key, no paid run, and no console spend entry. No SSOT edits: do not edit a matrix, backlog, or checklist. A future proof EXIT 0 is not MODEL-OP closure, production HA, release evidence, or permission to change the outbound chain.

The prior model-op review near `dfd8443` correctly recorded that **zero named proves is not coding authorization**. I2 names concrete offline commands below; naming them is still not coding authorization and this REQUEST does not run them.

## Offline prove commands

These existing package scripts are the named offline/mocked commands for a later, separately authorized prove. They are not run by this REQUEST:

| Command | Existing script / intended evidence |
|---|---|
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | Existing package script; offline guard/NHP checks, including fail-closed cap and missing-input behavior. |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | Existing package script; mocked transport only, no network or live spend, with ledger/cap assertions. |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | Existing package script; offline/mocked path, reservation, cap, and calibration assertions. |

The following future command is named for the remaining I2 fixture contract and **does not exist yet**. This REQUEST does not add it, does not edit `package.json`, and does not add a script:

```text
pnpm model-op-spend-ledger-offline-i2:prove
```

If separately authorized and later implemented, that fixture-only command must prove: missing ledger path fails closed; an over-cap fixture refuses the next estimated call; the estimator cannot set `actualSpendCny`; and an actual figure without an explicit console citation is rejected. It must remain offline, with no Key and no network. Until then those are plan assertions, not evidence.

No command above authorizes edits to the outbound interceptor, model-client, invoke, g7-bootstrap, API/worker main, or the production ledger. `actualSpendCny` stays null in this REQUEST.

## Review stubs

| Expert | Stub |
|---|---|
| `mw-model-op` | `reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-i2-mw-model-op.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-i2-mw-e2e-ha.md` |

**Pre-exec dual is pending. No coding, prove execution, or ledger change is authorized by this REQUEST.**

*Harness · MODEL-OP spend-ledger offline I2 · `draft:awaiting_pre_exec_dual` · STOP*
