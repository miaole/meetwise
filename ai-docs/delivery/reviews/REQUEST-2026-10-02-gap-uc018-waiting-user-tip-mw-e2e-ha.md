# REQUEST — GAP-UC018-WAITING-USER tip run · pre-exec · mw-e2e-ha

**Status**: pre-exec **PASS**（有条件）· `draft:awaiting_pre_exec_dual` · 不代签 `mw-rag-route` · alone≠dual
**Expert**: `mw-e2e-ha`
**REQUEST**: `23f56415dc041b2563c96b1b1dee22aa7b4fa424`（`23f5641`）
**Docs-only**: `git show --stat 23f5641` 仅 4 个 markdown（slice / harness / 两份 stub）。无产品代码、无 emitter、无 backfill JSON。该 SHA 是 tip `5cd6cbc` 的祖先，且在 `origin/feat/mysql-schema-skeleton` 上。
**Knife**: `ai-docs/delivery/harness/gap-uc018-waiting-user-tip.md` · `ai-docs/delivery/gap-uc018-waiting-user-tip.slice.md`
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ coding 授权（超出本 REQUEST 的范围一律不算）· ≠ covered · ≠ nail · ≠ next knife · alone≠dual

## Pins（保留）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（保持） |

## 对照旧裁定

`C-WAITING-USER-RULE`（`ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:119`，提交 `0d42e2c` / 预执行 `2f87800`）：waiting_user 不能当历史回填。要么（i）在**当时的当前 tip** 新鲜跑、标成 **new evidence ≠ backfill**，要么（ii）继续 gap/未记录。禁止从 2026-09-10 散文造 SHA。同文件 `:76` 行是 **not-found**、**no recorded prove tip SHA**。收据字段 `waitingUser=MISSING-EVIDENCE`（`UI.json:114` 等同批回填）。

## 计划是否符合

| 要求 | 判定 | 依据 |
|------|------|------|
| 在执行时的当前 tip 新鲜跑 | 符合 | harness `:23–26`：两道 CMD 钉「branch tip at execution」，禁止在 REQUEST 里钉历史 SHA；`:63` 记录 `git rev-parse HEAD`，禁止 checkout 祖先 prove tip。slice `:12` 同。 |
| 标成 NEW evidence，不是 backfill | 符合 | harness `:7`「new tip run」；`:28–30` 新目录 `receipts/uc018-waiting-user-tip/`，明确不是 `uc018-receipt-backfill/**`；schema `historicalTip: false`（`:33`）。`evidenceOfRecord` 保持 false 直到 post-prove（`:33`、`:36`），没有把这次开档写成证据归档。 |
| 不改 emitter / backfill JSON | 符合 | harness `:40–47` 与 slice `:12` 禁止改 backfill 目录、`uc018-receipt-backfill-emit.mjs`、facts、proof、evaluator、矩阵。本提交 diff 不含这些文件。 |
| 不回填历史 SHA | 符合 | harness `:17` 点名禁止复用 `85d36c7` / `f06dcba` / `549da9c` / `e88d386` / `23f98d3` / `bdc5993` / `b29c191`。`:26` 从历史挑 SHA → dual fail-closed。 |

未发现回填历史 SHA，也未改 emitter。不触发 FAIL。

## 条件（不升格为已执行）

1. 机器收据必须记下**实际 checkout 的 HEAD**。草图字段名是 `gitSha`（harness `:33`），没有字面量 `runnerCommitSha`。执行时 `runnerCommitSha` 与 `gitSha` 都必须等于该 HEAD。缺一或写成任何历史 SHA → 事后 FAIL。这与 `C-WORKTREE-HYGIENE`（同旧评 `:97`、`:153`）一致。
2. 草图里的 `"exit": 0` 只是形状，不是预填结果。非 0 必须原样记录，禁止回炉（harness `:26`、`:54`）。
3. 禁止手写 JSON（`:36`、`:56`）。禁止把收据丢进 backfill 目录。
4. coveredCount 保持 **8**。UC-018 / §1.1 保持 **partial**。本 PASS 不授权改产品面试行为，也不授权在 dual 之前开跑。

不代签 rag-route。不改 `REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md`。

Verdict: PASS
