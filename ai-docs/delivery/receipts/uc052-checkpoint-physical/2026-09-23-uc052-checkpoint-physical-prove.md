# UC052 checkpoint physical prove receipt (Line B) — saver fix round

**Knife**: GAP-PRIV-CHECKPOINT-FENCE-ONLY
**CMD**: pnpm uc052:checkpoint-physical:prove
**EXIT**: 0
**Runner SHA**: 69de818 / 69de8180f5f2aa059191f67c32dad89d07bbcbed
**Code tips**: 3e42d16 (real PostgresSaver seed+race) · 69de818 (saver pool isolation)
**Date**: 2026-09-23 (~21:25 PT)

## Revive

getTuple=empty · put=refused · three-table COUNT=0 (FAULT-02 / RACE / HP). Not REVIVED.

## Race interleaving

FOR UPDATE barrier on checkpoints + checkpoint_blobs + checkpoint_writes holds purge DELETEs;
concurrent real PostgresSaver.put/putWrites runs while purge is blocked; then COMMIT hold;
purge completes. Extra case NHP-052-CKPT-RACE-TRIGGER retains fence-trigger INSERT race.

## Disclosure 2 (seal after begin)

- begin does not set privacy_epoch/target_set_digest: 0096 L147-218
- 0091 claim requires them + live digest match: 0091 L369-383
- sealCheckpointErasureAuthz + signed.targetSetDigest === sealed.targetSetDigest (C-DIGEST-JWS PASS)

## Cases

All REQUIRED pass including C-DIGEST-JWS · RACE · RACE-TRIGGER · HP.

## Gates

tsc 6=baseline · internal-erasure EXIT=0 · privacy-authorization EXIT=0 · porcelain clean · releaseEvidence=false

STOP after receipts · no messaging.
