# Prove receipt — UC-E2E-018 UI abandon · GAP-UC018-UI

**Date**: 2026-09-23 (~17:40–17:45 PT)  
**Branch**: `feat/mysql-schema-skeleton`  
**Knife**: UC-E2E-018 UI abandon · §1b #5 only · `GAP-UC018-UI`  
**Status after prove**: `executed:awaiting_post_prove_dual` · **Ban self-nail** · **≠ post_prove_dual_pass**  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false**  
**Matrix**: stays **partial** · **≠ UC-E2E-018 covered** · **UI alone ≠ covered** · §1b #6 sole-stack **OPEN**  
**Ban wash**: HTTP/`uc018:abandon:*` / FULL-E2E/`c36b032` / GRAPH/`08650ea` / TTL/`d698282` / D2b/`7fddebe` / HA / liveGhaRunUrl into UI closed / UC covered

## Pre-exec dual (retained)

| Expert | Tip | Verdict |
|--------|-----|---------|
| mw-e2e-ha | `ca57ece` | PASS |
| mw-rag-route | `136ff14` | PASS |
| REQUEST tip | `3da44b8` | dual BOTH PASS before coding |

## Product change

1. Next proxy `POST /api/interview/:id/abandon` → API abandon（same HTTP contract）
2. `InterviewPanel` in-interview 「放弃」→ confirm → abandoned+released · irreversible · redirect /interviews
3. `startInterviewAction` fail-closed on begin non-2xx（no empty unreserved session）
4. Dedicated Playwright `e2e-ui/uc018-abandon.spec.ts` + `pnpm uc018:ui:prove`
5. `E2E_UI_SKIP_WORKER=1` opt-in on `run-e2e-ui.mjs` so UI abandon prove is not raced by worker fail-closed（default e2e:ui still starts worker）

## CMD + EXIT (honest)

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | `pnpm uc018:ui:prove` | **0** | dedicated UI 「放弃」→ abandoned+released · closes `GAP-UC018-UI` only · **UI alone ≠ covered** · R5 |
| 2 | `pnpm uc018:abandon:prove` | **0** | retained db · ≠ covered · R5 |
| 3 | `pnpm uc018:abandon:http:prove` | **0** | retained HTTP · ≠ covered · ≠ UI · R5 |
| 4 | `pnpm uc018:abandon:full-e2e:prove` | **0** | retained FULL-E2E · already CLOSED · ≠ covered · ≠ UI |
| 5 | `pnpm uc018:graph:prove` | **0** | retained GRAPH · already CLOSED · ≠ covered · ≠ UI |
| 6 | `pnpm uc018:ttl:prove` | **0** | retained TTL · already CLOSED · ≠ covered · ≠ UI |
| 7 | `pnpm eval-harness-matrix-cite:prove` | **0** | cite honesty · UC-E2E-018 **partial** not covered |

## Local receipts (releaseEvidence=false)

- UI: see `.tmp/uc018-ui-prove-logs/ui-prove-5.log` （Playwright 1 passed · skip worker）
- retained db/http/graph/ttl/full-e2e: `.tmp/isolated-proof-receipts/` + `.tmp/e2e-receipts/` latest after this run

## Deliverables

1. UI 「放弃」→ same HTTP abandon contract
2. `pnpm uc018:ui:prove` dedicated
3. Parent harness/eval/matrix honesty: close **`GAP-UC018-UI` only** · matrix **partial** · UI alone ≠ covered · #6 OPEN
4. Knife harness+slice → `executed:awaiting_post_prove_dual`

## Non-claims

- Ban claim UC-E2E-018 covered / matrix covered / full suite covered
- Ban close §1b #6 this knife · Ban UI alone = covered
- Ban Meridian · Cloud Agent · self-nail · D3 / cloud buy
- Ban secrets / `.env*` / test-results staged
- Ban wash abandon/http/full-e2e/graph/ttl EXIT=0 alone into UI closed
