# Line C Step 3 — G7 FreeTier live receipt (SSOT)

**SSOT path**: `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`  
**docs/delivery copy**: pointer only (see `docs/delivery/line-c-step3-g7-freetier-live-receipt.md`).

## Pins (full)

| Pin | Value |
|-----|-------|
| haStatus | NOT_HA |
| releaseEvidence | false |
| claimProductionHA | false |
| gR45Closed | true |
| coveredCount | 8 |
| ms3EqualsR4Closed | false |
| pgRetained | true |
| r1Closed | false |
| techRoleFailClosedOptOutG7Only | true |
| freeTierOnlyResidualClosed | true (quota-403 root cause removed; **≠ G7 green / nail**) |
| trio | OPEN 1/1/1 |
| C-C | OPEN (separated; perf provenance; SLO unconfirmed) |
| nail | **false** (mw-model-op `d70cb58` FAIL still stands until post-prove of this fix) |

## Disclosure-1

G7 ran with `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` (e2e-only when `G7_FREETIER_REPROVE=1` and unset). Non-production role path — **not** evidence of production role behavior; **never** counts toward R1.

## Spend

- `consoleSpendReadCny=0` at `2026-09-24T04:28Z` (usageRowsVisible=false)
- `actualSpendCny=null` (pending lagged console usage; **not** written as 0)

## FreeTierOnly residual

**CLOSED** because the quota-403 FreeTierOnly root cause was removed on the guarded text path. Trio stays OPEN. C-C stays OPEN. **No wording claims G7 is green.** SSOT/ledger nail deferred.

## UI-409

`apps/web/app/jobs/actions.ts` now embeds the API `error` subclass in `application_start_failed_<status>:<subclass>` and logs it. Offline prove: `pnpm -C apps/web prove:application-start-error`. Gap remains open until live 409 root cause is fixed.

## Live log digests

See JSON `liveLogDigests` (sha256 + retained `.tmp/g7-step3/*` paths; secret-scanned; key fingerprint only in receipt).

## Code tip (offline fix round)

`57b78fc` / `57b78fc86e57186ab65669f315fb90c5f0a74eb0` — offline proves EXIT 0 at this SHA.

## Stop

Authorized offline fix round only — no live trio re-run in this round.
