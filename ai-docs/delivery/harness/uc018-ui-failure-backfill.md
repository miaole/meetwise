# Harness — **UC-018 UI failure backfill @ e88d386**（recorded `E2E_FAILURE class=frontend code=web_not_ready` · no `.next` build · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · EXIT 0 at recorded SHA **or** honest tip re-run disclosure · Ban flip covered · Ban edit Line A files）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove-as-acceptance · Ban invent covered · Dual PASS ≠ coding · Dual PASS ≠ UC covered · matrix §1.1 UC-E2E-018 **partial** retained）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **UC-018 UI failure backfill · target `e88d386`**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · **≠ UC-E2E-018 covered** · Ban假绿 · Ban flip §1.1 · Ban retune a nonzero historical exit into 0
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · Ban coding until dual+authorize
**Honesty**: The older UI harness text says `pnpm uc018:ui:prove` EXIT=0 at `e88d386`. The machine backfill does **not**. This REQUEST does not rewrite that history and does not flip covered.

---

## Recorded failure（do not retune）

| Field | Value |
|-------|-------|
| CMD | `pnpm uc018:ui:prove` |
| Recorded SHA | **`e88d386`** / `e88d386ea946918668d8e073edc7f33521fe33d9` |
| Receipt | `ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json` · `exit=1` · `evidenceOfRecord=true` |
| Log | `ai-docs/delivery/receipts/uc018-receipt-backfill/logs/UI-e88d386.log` |
| Class | `E2E_FAILURE class=frontend code=web_not_ready` |
| Cause | Next.js production start: could not find a production build in `.next`（no `next build` before `next start`） |

## Goal

After authorize, either:

1. Make `pnpm uc018:ui:prove` **EXIT 0 at the recorded SHA** `e88d386ea946918668d8e073edc7f33521fe33d9` in a clean worktree（the missing `.next` build is the recorded blocker）, **or**
2. Honestly disclose that EXIT 0 at that SHA is not available and a **tip re-run** is the evidence instead. The disclosure must name the tip SHA actually run and must not claim the historical exit was 0.

Ban silent tip substitution. Ban flipping UC-018 / §1.1 to covered. UI alone ≠ covered.

## Ban（Line A）

This REQUEST does not edit, and the later knife should touch as little as possible:

- `ai-docs/delivery/receipts/uc018-receipt-backfill/**`
- `scripts/uc018-receipt-backfill-emit.mjs`
- `scripts/lib/uc018-receipt-backfill-facts.mjs`
- `scripts/uc-e2e-018-receipt-backfill.proof.mjs`
- `scripts/lib/uc-covered-evaluator.mjs`

Do not edit the coverage matrix, gap backlog, or execution checklist. Do not edit UC-018 or UC-052 matrix rows.

## NHP

| Order | Item |
|-------|------|
| 1 NEG | Claiming historical EXIT 0 while UI.json says 1 → fail |
| 2 FAULT | `web_not_ready` / missing `.next` recorded, not swallowed |
| 3 BOUND | Worktree SHA ≠ `e88d386` without an explicit tip-rerun disclosure → fail |
| 4 ADV | Hand-edited UI.json to show exit 0 → Ban |
| 5 PERF | Not a capacity prove |
| 6 LOAD | Not a load prove |
| HP last | EXIT 0 at the recorded SHA, or a disclosed tip re-run with its own receipt |

## Prove plan（after authorize · not this open）

1. Clean worktree at `e88d386ea946918668d8e073edc7f33521fe33d9`
2. `pnpm uc018:ui:prove` · if it still dies on missing `.next`, record that and either add only the build step that the SHA's runner lacks **without** retuning the old exit, or stop and disclose a tip re-run
3. Do not flip covered

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-uc018-ui-failure-backfill-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-02-uc018-ui-failure-backfill-mw-rag-route.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push

*Harness · UC-018 UI failure backfill · e88d386 · web_not_ready · draft:awaiting_pre_exec_dual · Ban flip covered · STOP*
