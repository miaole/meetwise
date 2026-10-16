# Harness — **GAP-UC018-WAITING-USER tip run**（new tip · `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` · machine receipt · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban historical prove tip · Ban invent covered · Ban edits to backfill JSON / emitter）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove-as-acceptance · Ban invent covered · Dual PASS ≠ coding · Dual PASS ≠ UC covered · matrix §1.1 UC-E2E-018 **partial** retained）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **GAP-UC018-WAITING-USER · new tip run**（own dual knife · run the waiting_user proves at the **branch tip at execution time** in a clean worktree · emit one machine receipt · Ban pick a historical SHA）
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · **≠ UC-E2E-018 covered** · Ban假绿 · Ban flip §1.1 · Dual PASS ≠ coding
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · coordinator dispatches）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban Cloud Agent · Ban Meridian · Ban force-push · Ban invent covered · Ban coding until dual+authorize
**Honesty**: L0 docs only · dedicated prove tip was **not-found** in the receipt-backfill table · gatherer constant `WAITING_USER_BACKFILL_STATUS=MISSING-EVIDENCE` stays until an authorized run · this open does **not** flip UC-018 / §1.1 · STOP after push

---

## Goal

`GAP-UC018-WAITING-USER` was closed in the early abandon wave without a dedicated prove tip. Receipt-backfill recorded the row as **not-found** and the gatherer keeps `MISSING-EVIDENCE`. This knife asks for a **new tip run** plus a machine receipt. It does **not** reuse FULL-E2E `85d36c7`, GRAPH `f06dcba`, TTL `549da9c`, UI `e88d386`, SOLE `23f98d3`, ADV `bdc5993`, PERF/LOAD `b29c191`, or any other historical SHA.

## Prove target（Ban historical tip）

| Prove | CMD | Target |
|-------|-----|--------|
| waiting_user db | `pnpm uc018:abandon:prove` | **branch tip at execution**（clean worktree of `feat/mysql-schema-skeleton` HEAD when authorized） |
| waiting_user HTTP | `pnpm uc018:abandon:http:prove` | **same tip** |

Do not pin a SHA in this REQUEST. The receipt records the SHA that was actually checked out. SHA chosen from history → dual fail-closed. Nonzero exit → record, do not retune.

## Receipt（new path · Ban backfill dir）

After authorize, emit one machine receipt under a **new** directory `ai-docs/delivery/receipts/uc018-waiting-user-tip/`（not `ai-docs/delivery/receipts/uc018-receipt-backfill/**`）. Schema:

```json
{ "gitSha": "<HEAD at run>", "exit": 0, "cmds": ["uc018:abandon:prove", "uc018:abandon:http:prove"], "stack": {}, "caps": {}, "evidenceOfRecord": false, "runAt": "<ISO PT>", "historicalTip": false }
```

`evidenceOfRecord` stays false until dual post-prove. Ban hand-writing JSON from prose.

## Ban（Line A / SSOT）

Do **not** edit:

- `ai-docs/delivery/receipts/uc018-receipt-backfill/**`
- `scripts/uc018-receipt-backfill-emit.mjs`
- `scripts/lib/uc018-receipt-backfill-facts.mjs`
- `scripts/uc-e2e-018-receipt-backfill.proof.mjs`
- `scripts/lib/uc-covered-evaluator.mjs`
- coverage matrix, gap backlog, execution checklist

## NHP（neg/fault first · HP last）

| Order | Item |
|-------|------|
| 1 NEG | Dirty tree or a historical SHA selected → fail closed · Ban invent PASS |
| 2 FAULT | Nonzero exit recorded · Ban retune |
| 3 BOUND | Receipt missing gitSha/exit/cmds → fail closed |
| 4 ADV | Hand-written JSON or a receipt dropped into the backfill directory · Ban |
| 5 PERF | This run is not a capacity prove · Ban elevate |
| 6 LOAD | Same |
| HP last | Both CMDs at the new tip · one machine receipt · dual agrees the tip was not historical |

## Prove plan（after authorize · not this open）

1. Clean worktree at then-current `origin/feat/mysql-schema-skeleton` · record `git rev-parse HEAD` · Ban checkout of an ancestor prove tip
2. Run the two CMDs · capture exits
3. Emit the receipt under `ai-docs/delivery/receipts/uc018-waiting-user-tip/`
4. Dual post-prove · still Ban invent covered / Ban §1.1 flip / Ban evaluator edits

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-gap-uc018-waiting-user-tip-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-02-gap-uc018-waiting-user-tip-mw-rag-route.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push

*Harness · GAP-UC018-WAITING-USER tip run · draft:awaiting_pre_exec_dual · series base 315870e · Ban historical tip · Ban invent covered · STOP*
