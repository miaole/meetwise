# Independent review — PR #270 ha-2-drain proof alignment (mw-model-op)

- Reviewer: mw-model-op (review only: no product edits, no merge, no approve, no push; no `git stash`; one detached worktree; `node_modules` symlinked from donor; no `pnpm install`)
- PR: https://github.com/miaole/meetwise/pull/270
- Branch: `fix/ha2-drain-proof`
- Head: `5a0e9df3d1721e2163fcd4726922b319fbf406db` (resolved via `gh pr view 270 --json headRefOid,files,statusCheckRollup`; short `5a0e9df3d`)
- Base: `main` `80f2c758e16691dca8b9d7883239a0db323f80d2` (short `80f2c758e`; ancestor of head)
- Diff vs base: **only** `apps/worker/test/ha-2-drain.proof.ts` (+5/−5). `apps/worker/src/main.ts` and `interview-event-retention.ts` are identical on base and head.
- Method: static (`gh pr view` read-only, `git fetch`, `git show` / `git diff`) + four `pnpm -C apps/worker prove:ha2-drain` arms in own worktree `/workspace/meetwise-mwmodelop-pr270` at head, donor `/workspace/mw-b1-n14` (lock `ff14b7cb4ccce98a97815ac95743a20869bf3f61`, same as head; donor untouched). Pre-fix wrote the base proof into this worktree only via `git show`; mutations wrote `main.ts` in this worktree only; all restored with `git checkout HEAD -- <path>` (blob hashes matched HEAD). Keys unset; `.env` / `.env.local` / `apps/api/.env` / `apps/worker/.env` ABSENT before each run. Proof is source/unit (`tsx test/ha-2-drain.proof.ts`); no isolated PG / no Docker started by this review. Foreign containers left untouched; no volume prune.
- Pins: **NOT_HA · releaseEvidence=false**
- Times are Asia/Shanghai (CST, UTC+8).

## CI (read-only `gh pr view 270 --repo miaole/meetwise` / check-runs)

State OPEN. Title still awaiting mw-model-op; do not merge. Checks 3/3 SUCCESS:

| Check | Workflow | Completed (Asia/Shanghai) | Conclusion |
|---|---|---|---|
| secrets-scan | ci | 2026-11-11 17:47:18 CST | SUCCESS |
| audit | deps-audit | 2026-11-11 17:47:18 CST | SUCCESS |
| verify | ci | 2026-11-11 17:57:57 CST | SUCCESS |

## Inodes / worktree / cleanup

Start `df -i /`: 2026-11-11 17:59:50 CST — IUsed 1836791 / IFree 211209 / 90% (gate 150k cleared; runs allowed). Worktree add 18:00:38 CST; after add 18:00:39 CST — IUsed 1848184 / IFree 199816 / 91%. After unlink of this worktree’s `node_modules` symlinks + `git worktree remove --force` 18:01:42 CST — IUsed 1844033 / IFree 203967 / 91%. Mid-review dip to IFree 197183 is partly other agents; not claimed as leftover from this worktree. Donor `/workspace/mw-b1-n14` intact. Foreign `meetwise-e2e-731813` (`a5218de457ea`, already up ~1h at snapshot) left untouched. Snapshot also saw `9e886c9e51cf` / `meetwise-e2e-1405217` Up 3s (other agent); it was gone by cleanup; this review did not `docker rm` it.

## CMD / EXIT

| CMD | Start (CST) | End (CST) | EXIT | Asserts |
|---|---|---|---|---|
| Arm B post-fix HEAD: `pnpm -C apps/worker prove:ha2-drain` | 2026-11-11 18:00:44 | 2026-11-11 18:00:45 | 0 | 61 PASS / 0 FAIL. Matches claim. |
| Arm A pre-fix: `git show 80f2c758e:apps/worker/test/ha-2-drain.proof.ts > …` (main.ts already identical to base), then same prove, then `git checkout HEAD -- apps/worker/test/ha-2-drain.proof.ts` | 2026-11-11 18:00:52 | 2026-11-11 18:00:53 | 1 | 58 PASS / 2 FAIL: drain-block `{ name: '` 为 21·实数 22; loop 相恰 16 处（实得 17）. Matches claim. |
| Arm C mutation: deleted only the `interview-event-retention` `drainStops` line from worktree `main.ts`, then prove, then `git checkout HEAD -- apps/worker/src/main.ts` | 2026-11-11 18:01:00 | 2026-11-11 18:01:00 | 1 | 58 PASS / 3 FAIL: 清单项在位：interview-event-retention; drain-block 为 22·实数 21; loop 相恰 17 处（实得 16）. Claim said EXIT 1 (did not specify fail count); the extra FAIL is the required-name presence check, expected when that line is removed. |
| Arm D P2 hypothesis: inserted `const p2OrphanLoop = runDrainLoop(async () => {}, 86_400_000);` after `interviewEventRetentionLoop` (no drainStops / no `phase: 'loop'` / no `{ name: '`), then prove, then restored `main.ts` | 2026-11-11 18:01:08 | 2026-11-11 18:01:08 | 0 | 61 PASS / 0 FAIL. Proof stays green when a loop is started but not drained. |

Worktree product files restored (HEAD blobs `b8e268629bb13f9c69cf9c02fae1c81aac23a263` proof, `6962c0a6aebfc30fd30c12962e1d0d5d70d21928` main.ts) before worktree remove.

## Rulings

### 1. Legit addition, not a missing drain — PASS

At base `main` (`80f2c758e`, identical to head for this file) the interview-event-retention loop is both started and registered in `drainStops`:

- Start: `main.ts:756-759` — `resolveInterviewEventRetentionConfig()` then `interviewEventRetentionLoop = interviewEventRetentionControl.enabled ? runInterviewEventRetention(pool, interviewEventRetentionControl) : undefined`.
- Drain: `main.ts:846` — `{ name: 'interview-event-retention', stop: () => interviewEventRetentionLoop?.stop() ?? Promise.resolve(), phase: 'loop' }`, immediately after `commerce-outbox-retention` (`:845`). Same optional-stop / `phase: 'loop'` pattern as the sibling retention loops (`:843-845`). `drainWithDeadline(drainStops, …)` is awaited on SIGTERM/SIGINT via `wireSignalShutdown` (`:859-868`).

Commit `8a79c0b4613828f5fd4001e02d9cb2f28eae428c` (2026-10-26, ancestor of current main) is the intentional add: new `apps/worker/src/interview-event-retention.ts`, `main.ts` import + env-gated mount + named drain entry, and comments already updated to 21 static / 22 names / loop 17. The proof was not updated in that commit; this PR only catches the proof up. Default `INTERVIEW_EVENT_RETENTION_ENABLED=false` (`boundedBoolean(..., false, …)` in `resolveInterviewEventRetentionConfig`) skips *starting* the loop, not drain registration. When disabled, `interviewEventRetentionLoop` is `undefined` and the stop is `?.stop() ?? Promise.resolve()` — a no-op, safe, same as usage-calibration / commerce-outbox retention. Illegal env still fails startup (no silent fallback).

### 2. Expectations not loosened — PASS

Line-by-line `git diff 80f2c758e 5a0e9df3d -- apps/worker/test/ha-2-drain.proof.ts`: comments 20→21 / 21→22; required list inserts `'interview-event-retention'` after `'commerce-outbox-retention'` (`ha-2-drain.proof.ts:82`); drain-block count assert 21→22 (`:90`); loop-label assert 16→17 (`:173`). No assertion removed or weakened. The +1 / +1 exactly match the one drain-block `{ name: '` entry and one `phase: 'loop'` already present on main from `8a79c0b46` (`main.ts:846`). Pre-fix 58/2 → post-fix 61/0 is those two previously-red count asserts now passing, plus one new required-name presence assert (20→21 required names).

### 3. Required list is presence-only vs closed set of *starts* — PASS (with P2)

How the proof works (`ha-2-drain.proof.ts:74-90, 171-173`):

- Presence-only walk of a hardcoded `required` array (`:79-88`): each name must match `/{ name: '<name>', stop:/` somewhere in `main.ts` (tested against full `src`, not only the drain slice).
- Exact count of `{ name: '` inside the `const drainStops` … `let workerShuttingDown` slice must be 22, and the env-gated stub-tick spread must be present (`:89-90`).
- Exact count of `phase: 'loop'` in all of `main.ts` must be 17 (`:171-173`); `phase: 'deps'` must be 5.

This catches a drainStops entry that is removed (arm C: presence + both counts go red) or an extra entry added without updating the caps. It does **not** enumerate loop *starts* (`runInterviewEventRetention` / `runDrainLoop` / `runX(...)` assignments, listeners) and cross-check them against `drainStops`. A future loop started in `main.ts` but omitted from `drainStops` does not change the drain-block `{ name: '` count or the `phase: 'loop'` count, so the proof can stay green. Arm D confirmed: dummy `runDrainLoop` start not in `drainStops` → EXIT 0, 61/0.

## Blockers

None.

## Non-blockers / P2

- **P2 (closed-set start↔drain):** add a source check that every started loop/listener in `main.ts` (assignments to `runDrainLoop` / `runXLoop` / `runXRetention` / `startXListener` and similar) appears in `drainStops` or is explicitly stopped in `shutdownWorker` (the existing `jobWakeupListener` / `jobWakeupRedisListener` stops at `main.ts:863-865` are already outside `drainStops` and must remain accepted), and vice versa (every drainStops name has a start site). Presence-only required list + exact drain-block count is not sufficient for “started but not drained.” Not a blocker for this alignment PR: the one added required name is already started and drained on main.

## Pins

NOT_HA · releaseEvidence=false

Verdict: PASS
