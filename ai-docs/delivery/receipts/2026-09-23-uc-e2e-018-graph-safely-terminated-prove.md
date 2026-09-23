# Prove receipt — UC-E2E-018 AiGraphRun safely_terminated · GAP-UC018-GRAPH

**Date**: 2026-09-23 (~16:43–16:44 PDT)  
**Branch**: `feat/mysql-schema-skeleton`  
**Knife**: UC-E2E-018 AiGraphRun safely_terminated · §1b #2 only · `GAP-UC018-GRAPH`  
**Status after prove**: `executed:awaiting_post_prove_dual` · **Ban self-nail** · **≠ post_prove_dual_pass**  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false**  
**Matrix**: stays **partial** · **≠ UC-E2E-018 covered** · §1b #3 TTL / #5 UI / #6 sole-stack **remain OPEN**  
**Ban wash**: FULL-E2E/`c36b032` / D2b/`7fddebe` / HA / liveGhaRunUrl / prior `uc018:abandon:*` EXIT=0 into UC covered

## Pre-exec dual (retained)

| Expert | Tip | Verdict |
|--------|-----|---------|
| mw-e2e-ha | `dc0e1fd` | PASS |
| mw-rag-route | `d1f1f69` | PASS |
| REQUEST tip | `25d1900` | dual BOTH PASS before coding |

## Product change

`packages/db/src/commerce.ts` `abandonInterviewAndRelease` on successful abandon (incl. already_abandoned):
1. non-terminal AiGraphRun → `safe_terminating` (clear lease)
2. `safe_terminating` → `safely_terminated`
Business facts retained: `interview_event` / `interview_question` / `interview` rows not deleted.

## CMD + EXIT (honest)

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | `pnpm uc018:graph:prove` | **0** | dedicated G1–G5 graph terminal + fact retention · closes `GAP-UC018-GRAPH` only · ≠ covered · R5 |
| 2 | `pnpm uc018:abandon:prove` | **0** | retained db regression · ≠ covered · R5 |
| 3 | `pnpm uc018:abandon:http:prove` | **0** | retained HTTP regression · ≠ covered · R5 |
| 4 | `pnpm uc018:abandon:full-e2e:prove` | **0** | retained full.e2e abandon · FULL-E2E already CLOSED · ≠ covered · R5 |

## Local receipts (release_evidence=false)

- graph: `.tmp/isolated-proof-receipts/2026-09-23T23-43-32-710Z-1148868-d7a3c9f0-51bc-4f76-8095-2bc8af21daf4.json`
- db abandon: `.tmp/isolated-proof-receipts/2026-09-23T23-43-45-726Z-1149554-04b96d89-7dba-4812-936a-ac5f4e433c8e.json`
- http: `.tmp/isolated-proof-receipts/2026-09-23T23-43-53-871Z-1150094-d9d148d3-5bba-4cd5-94c9-06559f2405fc.json`
- full-e2e: `.tmp/e2e-receipts/2026-09-23T23-44-13-844Z-1150677-faac71f5-83f2-4dc3-be38-caecff20ccb7.json`

## Deliverables

1. Product: abandon → AiGraphRun `safe_terminating`→`safely_terminated` + business-fact retention
2. Script `pnpm uc018:graph:prove` (+ isolated migrate gate + db `prove:uc018-graph`)
3. Parent harness/eval/matrix/backlog honesty: close **`GAP-UC018-GRAPH` only** · matrix **partial**
4. Knife harness+slice → `executed:awaiting_post_prove_dual`

## Non-claims

- Ban claim UC-E2E-018 covered / matrix covered / full suite covered
- Ban close §1b #3/#5/#6 this knife
- Ban Meridian · Cloud Agent · self-nail · D3 / cloud buy
- Ban secrets / `.env*` / test-results staged
