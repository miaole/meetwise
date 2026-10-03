# UC-018 UI failure backfill — re-run evidence @ recorded SHA `e88d386` (Line E · machine-emitted)

**Status**: prove re-run **EXIT 0** at the recorded SHA · **NEW EVIDENCE, NOT a backfill overwrite** · `waitingUser=POST-PROVE-DUAL` (post-prove dual by independent reviewer is the next step; this receipt does not self-nail)
**Recorded SHA**: `e88d386ea946918668d8e073edc7f33521fe33d9`（`feat(e2e): UC018 UI abandon (GAP-UC018-UI)`）
**Prove CMD**: `pnpm uc018:ui:prove`（unmodified）
**Worktree**: independent **detached per-SHA worktree** at `e88d386`（not the coding worktree, not tip）
**Date**: 2026-10-02 (~22:10 PT)

## Relationship to the historical failure (honest)

- The historical machine backfill `ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json` records **EXIT=1 / `E2E_FAILURE class=frontend code=web_not_ready`**（no `.next` production build）with `evidenceOfRecord=true`. **That receipt is untouched and still says exit=1.** Nothing was retuned.
- The older harness text that claims `pnpm uc018:ui:prove` EXIT=0 at `e88d386` was **not** rewritten either.
- This directory adds a **new** run on top: the historical exit stays 1; the EXIT=0 below is only valid as **new evidence at the same SHA**, never as "the historical exit was actually 0".

## Path chosen (harness Goal option 1, not a tip re-run)

`ai-docs/delivery/harness/uc018-ui-failure-backfill.md` Goal option 1: make `pnpm uc018:ui:prove` **EXIT 0 at the recorded SHA** in a clean worktree, the missing `.next` build being the recorded blocker. That is exactly what was done. No tip re-run, no silent substitution (`runnerCommitSha == targetSha == gitSha == e88d386…`).

## Environment repair (disclosed, minimal)

1. **The added build step** `pnpm -C apps/web build`（= `next build`）. The SHA's own runner `scripts/run-e2e-ui.mjs` deliberately does not build（"需已 `pnpm -C apps/web build` 出 .next——本脚本不重新构建，构建太慢"）and starts web via production `next start`. Harness Prove-plan step 2 explicitly authorizes adding only this missing build step without retuning the old exit. No product/runner code was edited at that SHA.
2. **Disposable PG image**: `registry-1.docker.io` unreachable from this machine (`Head "https://registry-1.docker.io/v2/pgvector/pgvector/manifests/pg16": context deadline exceeded`). `pgvector/pgvector:pg16` was pulled via pull-through mirror `docker.m.daocloud.io` and tagged `pgvector/pgvector:pg16`. Digest recorded from **live** `docker image inspect`: `sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a`（arm64）. The legacy-track fixture banner `R5-MARKED-RED … NOT sole-stack truth` appeared in the prove log as always.
3. **Playwright browsers**: chromium-1228（playwright 1.61.1）not in local cache（had 1217/1243）→ `playwright install chromium` EXIT 0.
4. **Node version drift**: this run used node **v22.22.3**（original 2026-09-24 backfill wave used v20.19.2）; pnpm resolved to **10.18.0** by `packageManager`, same as the original wave. Disclosed, not normalized.
5. **`.env`**: copied from the local developer checkout into the per-SHA worktree（untracked; `.env` is gitignored at that SHA）to provide `MODEL_API_KEY` etc., mirroring the original run's environment. **Never committed**; runner's `E2E_ISOLATED=1` path strips DB/Redis/OSS secrets from the child env as designed.

## Attempts（append-only · no retry-to-green wash）

`attempts.jsonl` records **every** attempt, in order:

| # | installExit | buildExit | proveExit | outcome | wrapperSha |
|---|-------------|-----------|-----------|---------|------------|
| 1 | 0 | 0 | **0** | passed | `b31ad54` |
| 2 | 0 | 0 | **0** | passed | `257c073` |

- Attempt 1 was already green; attempt 2 is **not** a retry after failure — only the emitter was changed between the two runs（attempt 1 receipt embedded absolute machine log paths; attempt 2 records repo-relative paths）. Both attempts are retained; nothing was deleted or overwritten.
- `UI-rerun.json` reflects the **last** attempt; `attempts.jsonl` is the full history.

## Digest verification

```bash
shasum -a 256 ai-docs/delivery/receipts/uc018-ui-backfill-rerun/logs/attempt2-prove.log
# → cc3213f9653214141b3887af435026db455e8de4f931a045cc3c959b0edce284  == UI-rerun.json .stdoutDigest
```

Emitter: `scripts/uc018-ui-backfill-rerun.mjs`（wrapperSha = tip commit of the emitter code that wrote each JSON; Line A emitter/guard/facts untouched）.

## Prove result (attempt 2 log excerpt)

```
E2E isolated PostgreSQL: meetwise-e2e-46562-1791004097282 on 127.0.0.1:64839
migrations: applied=134 skipped=0 …
E2E-UI: 启 web(production next start, :26688)…
✓  1 [chromium] › e2e-ui/uc018-abandon.spec.ts:68:1 › UC018-UI-abandon: in-interview 放弃 → abandoned+released · irreversible · same HTTP contract (8.9s)
1 passed (12.3s)
```

## Non-claims（pins retained）

- EXIT=0 ≠ UC-E2E-018 **covered**；UI alone ≠ covered；matrix §1.1 stays **partial**；coveredCount stays **8**（this knife did not edit the coverage matrix / gap backlog / execution checklist）.
- haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · PG-retained legacy fixture（R5 marked-red）· public DELETE stays **503** · ms3EqualsR4Closed=**false** · gR45Closed=**true**.
- EOR@targetSha ≠ proven at tip（code drift）· capacityRepresentative=false · local green ≠ HA.
- Known disclosed limit carried over from Line A: HMAC-free JSON+log digest pair is forgeable（GAP-BACKFILL-EMITTER-UNAUTHENTICATED）— applies to this emitter too.
