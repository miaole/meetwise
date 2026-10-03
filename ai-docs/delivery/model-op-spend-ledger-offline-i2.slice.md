# Slice — **MODEL-OP spend-ledger offline I2**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**
**Base**: `origin/feat/mysql-schema-skeleton` · `60cb927`
**Authority**: meetwise — L0 docs only · Ban product implementation · Ban live calls

## Pins

`NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `coveredCount=8` · public DELETE=`503` · **PG-retained** · `actualSpendCny` stays **null** · **no live**

## One-line

Open I2 as a docs-only offline prove plan. Name the existing mocked package commands and one future fixture command without adding it. Do not edit C outbound paths or the production ledger; do not edit SSOT matrix, backlog, or checklist.

The prior model-op review near `dfd8443` says zero named proves is not coding authorization. I2 names commands for review clarity only; it does not authorize code, prove execution, or a live call.

## Named proves

| Type | Command | State |
|---|---|---|
| Existing package script | `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | offline/mocked; not run in this REQUEST |
| Existing package script | `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | mocked transport; not run in this REQUEST |
| Existing package script | `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | offline/mocked; not run in this REQUEST |
| Future fixture-only command | `pnpm model-op-spend-ledger-offline-i2:prove` | does not exist yet; this REQUEST does not add it |

The future fixture command is intended to cover missing-path fail-closed, over-cap refusal, `actualSpendCny` remaining null, and rejection of an uncited actual figure. These remain unproven plan items.

## Products

| Role | Path |
|---|---|
| Harness | `harness/model-op-spend-ledger-offline-i2.md` |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-i2-mw-model-op.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-model-op-spend-ledger-offline-i2-mw-e2e-ha.md` |

## Bans

- Do not edit `packages/ai-runtime/src/g7-outbound-interceptor.ts`, `packages/ai-runtime/src/model-client.ts`, `packages/ai-runtime/src/invoke.ts`, `packages/ai-runtime/src/g7-bootstrap.ts`, `apps/api/src/main.ts`, or `apps/worker/src/main.ts`.
- **Ban C outbound edits. Ban ledger product changes in this REQUEST.**
- No live, network, Key, paid, or console spend activity.
- No matrix, backlog, or checklist edits.

*Slice · MODEL-OP spend-ledger offline I2 · `draft:awaiting_pre_exec_dual` · STOP*
