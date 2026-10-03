# Line C Step 3 — G7 FreeTier receipt (SSOT) · fix-round 2

**SSOT**: `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`  
**docs/delivery**: pointer only.

## Pins
NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · r1Closed=false · techRoleFailClosedOptOutG7Only=true · nail=false · g7SuiteGreen=false

## Parent / tip
- Parent fix-round-1 code: `82981ff1f5798f44a40b564031d532f94c842e4d` (`git rev-parse` verified)
- This fix-round-2 code tip: `3b7ea46e7eecccabbf40e58a880e97e61877eb0f` (`3b7ea46`) — offline proves at this SHA

## Disclosure-1
G7 e2e `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` — non-production role path; never counts toward R1.

## Spend
consoleSpendReadCny=0 · readAt=2026-09-24T04:28Z · usageRowsVisible=false · actualSpendCny=null

## FreeTierOnly residual
CLOSED (quota-403 removed) · trio OPEN 1/1/1 · C-C OPEN · ≠ G7 green

## G7 hard-disable → trio accounting
embed / rerank / asr / tts / asr_stream / tts_stream = **not_run** (`g7_hard_disabled`) — never pass.

## Calibration
`assertCalibrationModelMatch` on **real** `planContextBudget` (`model-client.ts`) used by `openAICompatibleClient`.

## Gap evidence
Committed raw+redacted under `gap-evidence/` via `scripts/g7-freetier/redact-gap-evidence.mjs` (idempotent; digests in JSON).

## nhp-r4-adv-covered
PINNED EXPECTED-FAIL: COVERED_PATH_GAP refuse in-memory fake-green; requires E2E_ISOLATED/run-e2e-isolated — **not** reduced to "needs PG".

## STOP
Offline only · no live trio · no nail yet.
