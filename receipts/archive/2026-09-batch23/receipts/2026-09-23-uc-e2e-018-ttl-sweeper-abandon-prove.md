# Prove receipt — UC-E2E-018 TTL sweeper abandon · GAP-UC018-TTL

**Date**: 2026-09-23 (~17:07–17:08 PDT)  
**Branch**: `feat/mysql-schema-skeleton`  
**Knife**: UC-E2E-018 TTL sweeper abandon · §1b #3 only · `GAP-UC018-TTL`  
**Status after prove**: `executed:awaiting_post_prove_dual` · **Ban self-nail** · **≠ post_prove_dual_pass**  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false**  
**Matrix**: stays **partial** · **≠ UC-E2E-018 covered** · §1b #5 UI / #6 sole-stack **remain OPEN**  
**Ban wash**: commerce-reconcile:prove / GRAPH/`08650ea` / FULL-E2E/`c36b032` / D2b/`7fddebe` / HA / liveGhaRunUrl / prior `uc018:abandon:*` EXIT=0 into UC covered

## Pre-exec dual (retained)

| Expert | Tip | Verdict |
|--------|-----|---------|
| mw-e2e-ha | `4e497b2` | PASS |
| mw-rag-route | `f190c2b` | PASS |
| REQUEST tip | `334cca0` | dual BOTH PASS before coding |

## Product change

`apps/worker/src/commerce-reconcile.ts` non-application `mock_interview` lease-expired orphan path:
1. After reconcile sweep (reserved→released), call `abandonInterviewAndRelease` (same terminal口径 as user abandon)
2. → Interview=`abandoned` + entitlement already `released` + AiGraphRun `safe_terminating`→`safely_terminated`
3. Retain `interview_unavailable` event append
4. Soft-fallback on `interview_abandon_conflict` / `interview_release_failed` so create() cannot reuse corpse

## CMD + EXIT (honest)

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | `pnpm uc018:ttl:prove` | **0** | dedicated T1–T4 TTL terminal + graph + in-progress + live-lease · closes `GAP-UC018-TTL` only · ≠ covered · R5 |
| 2 | `pnpm uc018:abandon:prove` | **0** | retained db regression · ≠ covered · R5 |
| 3 | `pnpm uc018:abandon:http:prove` | **0** | retained HTTP regression · ≠ covered · R5 |
| 4 | `pnpm uc018:abandon:full-e2e:prove` | **0** | retained full.e2e abandon · FULL-E2E already CLOSED · ≠ covered · R5 |
| 5 | `pnpm uc018:graph:prove` | **0** | retained graph · GRAPH already CLOSED · ≠ covered · R5 |
| 6 | `pnpm eval-harness-matrix-cite:prove` | **0** | cite honesty · UC-E2E-018 **partial** not covered |

## Local receipts (release_evidence=false)

- ttl: `.tmp/isolated-proof-receipts/2026-09-24T00-07-25-065Z-1193730-984d0ca8-bd96-4717-81fd-83a8f137f9e9.json`
- db abandon: `.tmp/isolated-proof-receipts/2026-09-24T00-07-38-786Z-1194393-8cefd8f8-2d36-4975-b455-acb7214f6e13.json`
- http: `.tmp/isolated-proof-receipts/2026-09-24T00-07-46-970Z-1194979-490d53a2-9bda-4b41-ac78-a05eb1d068ec.json`
- graph: `.tmp/isolated-proof-receipts/2026-09-24T00-07-56-976Z-1195434-d3022443-d0b8-4624-8ee6-53b8810db4c5.json`
- full-e2e: `.tmp/e2e-receipts/2026-09-24T00-08-14-070Z-1195995-e9e15774-b2b5-4c95-bb4b-26aa2f16c99f.json`

## Deliverables

1. Product: TTL sweeper → `abandonInterviewAndRelease` same terminal口径 as user abandon
2. Script `pnpm uc018:ttl:prove` (+ isolated migrate gate + worker `prove:uc018-ttl`)
3. Parent harness/eval/matrix/backlog honesty: close **`GAP-UC018-TTL` only** · matrix **partial**
4. Knife harness+slice → `executed:awaiting_post_prove_dual`

## Non-claims

- Ban claim UC-E2E-018 covered / matrix covered / full suite covered
- Ban close §1b #5/#6 this knife
- Ban Meridian · Cloud Agent · self-nail · D3 / cloud buy
- Ban secrets / `.env*` / test-results staged
- Ban wash commerce-reconcile:prove alone into TTL closed
