# REQUEST — UC-018 UI failure backfill @ e88d386 · pre-exec · mw-e2e-ha

**Status**: pre-exec **PASS**（有条件）· `draft:awaiting_pre_exec_dual` · 不代签 `mw-rag-route` · alone≠dual
**Expert**: `mw-e2e-ha`
**REQUEST**: `2448dfe23f370b1d90f5eaa0ae5be5e7e90552c6`（`2448dfe`）
**Docs-only**: `git show --stat 2448dfe` 仅 4 个 markdown。无产品代码、无收据改写。该 SHA 是 tip `5cd6cbc` 的祖先，且在 `origin/feat/mysql-schema-skeleton` 上。
**Knife**: `ai-docs/delivery/harness/uc018-ui-failure-backfill.md` · `ai-docs/delivery/uc018-ui-failure-backfill.slice.md`
**Date**: 2026-10-02（PT）
**本 PASS**: ≠ coding 授权（超出本 REQUEST 的范围一律不算）· ≠ covered · ≠ nail · ≠ next knife · alone≠dual · **不把 e88d386 抬成 pass**

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

## 历史记录（不许改）

`ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json:7–12`：`targetSha` / `runnerCommitSha` / `gitSha` = `e88d386ea946918668d8e073edc7f33521fe33d9`，`exit=1`。`:111` `evidenceOfRecord=true`。日志 `logs/UI-e88d386.log:53` 与 `:58–59`：`E2E_FAILURE class=frontend code=web_not_ready`，原因是 `.next` 里没有 production build。这是诚实 FAIL，**不计入 covered**。coveredCount 保持 8（harness `:4`、`:8`、`:74`；slice `:4`、`:8`、`:12`）。

## 计划

| 检查 | 判定 | 依据 |
|------|------|------|
| 不把旧收据改成 exit 0 | 符合 | harness `:8` Ban retune 历史非 0 为 0；`:11` 不改写那段历史；`:51` 声称历史 EXIT 0 而 UI.json 是 1 → fail；`:54` 手改 UI.json 为 exit 0 → Ban。`:39–45` 禁止编辑 backfill 目录与 emitter。本提交未碰这些文件。 |
| 不翻 covered | 符合 | slice `:12`；harness `:3`、`:8`、`:33`、`:63`。§1.1 UC-E2E-018 保持 **partial**。UI alone ≠ covered（`:33`）。 |
| 诚实修复 / 重建路径 | 有条件符合 | 目标二选一（harness `:28–31`）：在记录 SHA 上把 prove 跑到 EXIT 0，**或**承认该 SHA 拿不到 EXIT 0，改做 tip 重跑并点名实际 SHA，且不得声称历史 exit 曾是 0。`:62` 缺 `.next` 时只补 runner 缺少的 build 步、**不回写旧 exit**，否则停下来披露 tip 重跑。 |

未发现改写旧收据或翻转 coveredCount。不触发 FAIL。

## 条件

1. `e88d386` 的历史收据保持 **exit 1** / `web_not_ready`。任何 EXIT 0 都是**新收据、新证据**，不是把旧状态抬成 pass。
2. 若走 tip 重跑，必须是**新 SHA** 上的新跑，收据写实际 `runnerCommitSha`。禁止静默替换（harness `:33`、`:53`）。
3. 若仍在 `e88d386` 工作树里补 `next build` 再跑，那次结果也是新证据；不得覆盖 `UI.json` 的 exit。补 build 若变成改产品行为或改 Line A 文件，超出本 REQUEST，本 PASS 不授权。
4. coveredCount 保持 **8**。本 PASS ≠ covered ≠ nail ≠ next knife。不代签 rag-route。

不改 `REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md`，也不改任何 Line B/C 收据。

Verdict: PASS
