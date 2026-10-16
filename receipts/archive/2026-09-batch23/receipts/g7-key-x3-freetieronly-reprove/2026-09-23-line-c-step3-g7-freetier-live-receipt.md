# Line C Step 3 — G7 FreeTier receipt (SSOT) · fix-round 2

**SSOT**: `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`  
**docs/delivery**: pointer only.

## Pins
NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · r1Closed=false · techRoleFailClosedOptOutG7Only=true · nail=false · g7SuiteGreen=false · public DELETE=503

## Parent / tip
- Parent fix-round-1 code: `82981ff1f5798f44a40b564031d532f94c842e4d` (`git rev-parse` verified)
- This fix-round-2 code tip: `b1d7b22b8773c9a826ae5e15e000465be3d61720` (`b1d7b22`) — offline proves were re-run at this SHA (code commit). The receipt commit is not the prove SHA.

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


## Prove-tip honesty
6045a4b and 315870e set tipSha / offlineProvesAtCodeSha to 3b7ea46 without a re-run. The runs those commits recorded were at 05cb79f. 05cb79f vs 3b7ea46 is not the same product tree: `git diff 05cb79f 3b7ea46` excluding ai-docs and docs is 7 files, +201/−26 (privacy checkpoint principal, UC052 pool-role-leak proof, UC018 gatherer/backfill, run-e2e-isolated). FR2 patch-id may match; the trees are not identical. mw-e2e-ha re-ran FR2 offline at 3b7ea46 with EXIT 0; that re-run is not denied. This receipt's pointer is only the SHA actually run here: `b1d7b22b8773c9a826ae5e15e000465be3d61720`.

Runtime still throws `g7_path_disabled:<capability>`. Receipt token `g7_hard_disabled` is the mapped label for those not_run rows. This round did not emit `g7_hard_disabled` from the outbound disable path.

Dispatch assertion tautology `res.ok === false || true` was removed in `b1d7b22` before this re-run. nhp-r4-adv-covered EXIT 1 stays PINNED EXPECTED-FAIL COVERED_PATH_GAP.

## STOP
Offline only · no live trio · no nail yet.
