# Harness — **UC-018 flip-ban honesty**（docs REQUEST · **`draft:awaiting_pre_exec_dual`** · flip still banned）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban self-approve · Ban a flip · Ban editing the evaluator · this commit is not coding authorization）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~22:00 PT)
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`58c0031`** / full `58c003156c3fc69505ecb3daa2e3dad25f4a6dfc`
**Knife**: **UC-018 flip-ban honesty**
**Row**: **`UC-E2E-018`** stays **partial** · §1.1 stays **partial**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — honesty docs only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban flip

## Recorded blockers（quoted · flip still banned）

From `e2e-requirement-coverage-matrix.md` §1.0.1 `UC-E2E-018`, the covered-criterion harness, and the Line D / Line E nails already on this branch:

- A flip is still banned. `canHonestlyFlip=false`. UC-018 and §1.1 stay **partial**. coveredCount=**8**. Ban invent covered.
- `canHonestlyFlip@b29c191` is a constant-false no-flip guard, **not** an assessment. Ban 「assessed, cannot flip」. `harness/uc-e2e-018-covered-criterion.md` records the carried condition: a later flip knife must use a **real computable six-column evaluator** that can return `true`, with a written criterion, and must pass dual; otherwise that knife fails. The criterion nail says `b29c191` constant-false is retired and reassess calls the evaluator, and the real UC-018 result remains `canHonestlyFlip=false`. This REQUEST does not edit `scripts/lib/uc-covered-evaluator.mjs` and does not authorize a flip.
- Local PERF/LOAD cannot cover UC-018 alone. `NHP-018-PERF-01` and `NHP-018-LOAD-01` are **partial**. `GAP-UC018-PERF-LOAD` is CLOSED as that partial, not as a row flip. `workerCapEnforced=false`. Local cap is not production capacity and not HA.
- waiting_user: tip receipts exist and `evidenceOfRecord=false`. The tip run is not evidence of record. waiting_user stays MISSING-EVIDENCE. Do not pick a historical tip.
- Historical `ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json` stays exit 1 at `e88d386` (`web_not_ready`) and was not rewritten. The later tip receipt `receipts/uc018-ui-tip-rerun/UI.json` EXIT 0 at `057701c` is tip-only and itself has `evidenceOfRecord=false`.
- Do not flip UC-052. UC-052 stays **partial**.

## Ban

- This REQUEST does not authorize a flip.
- This REQUEST does not edit the evaluator.
- Ban SSOT edits: matrix, backlog, checklist.
- Do not write covered as a status of UC-018.

## Review stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-uc018-flip-ban-honesty-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-02-uc018-flip-ban-honesty-mw-rag-route.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · flip banned · STOP

*Harness · UC-018 flip-ban honesty · draft:awaiting_pre_exec_dual · STOP*
