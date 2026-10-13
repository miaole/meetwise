# GAP-BACKFILL-EMITTER-UNAUTHENTICATED prove · Line G

**Date**: 2026-10-02 (~21:25 PT)
**Code / prove SHA**: `a19b6cf` / `a19b6cf178bfe264fe2e2e7894b64a2021c07b00`
**REQUEST**: `11f1016` · dual PASS `b80506a` (mw-rag-route) + `b3bb4a0` (mw-e2e-ha)
**Not a nail**. Not covered. UC-018 status not touched.

`pull --rebase` replayed the code commit onto origin/feat/mysql-schema-skeleton (`119d358`). The prove below was re-run at that rewritten SHA. Scripts match `a19b6cf`.

## CMD | EXIT

| CMD | EXIT | SHA |
|-----|------|-----|
| `pnpm uc018:receipt-backfill:prove` | **0** | `a19b6cf` |

Log: `logs/uc018-receipt-backfill-prove-a19b6cf.log`

Cases include the historical backfill checks plus missing tag fail, bad tag fail, truncated tag fail, missing key fail, mutated JSON fail, mutated log fail, JSON+log rewrite without the key fail, and legacy unsigned is not signed.

## Legacy receipts

On-disk `uc018-receipt-backfill/{ADV,FULL-E2E,GRAPH,PERF-LOAD,SOLE,TTL,UI}.json` were not rewritten. They have no `emitterHmac`. The guard classifies them `unsigned-historical` (`signed: false`). They stay readable. They do not count as signed.

## Key

No HMAC key is in the tree. No default key. Emitter and guard do not read `.env*`. The prove sets `MEETWISE_UC018_BACKFILL_HMAC_KEY` in the process environment only (random bytes, not printed, not written).

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE **503** · STOP for post-prove · no nail
