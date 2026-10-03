# POST-PROVE · UC-018 UI tip rerun · mw-e2e-ha

**角色**: adversarial E2E evidence-honesty。不代签 mw-rag-route。不改产品。不改历史收据。
**日期**: 2026-10-02（PT）
**本 PASS**: ≠ covered · ≠ nail · ≠ next knife · alone≠dual · 不把 `e88d386` 抬成 pass

## 声称

| 项 | 声称 | 核对 |
|----|------|------|
| 代码 | `057701c` | 在 `origin/feat/mysql-schema-skeleton` 上（`057701c42c5e263aabf95a18a13bfd9a5249a0cd`） |
| 新收据 | `52815fb` | 在 origin 上（`52815fb1b81b2401dc01b88d700101283d2f137b`）。只新增 `uc018-ui-tip-rerun/UI.json` 与 `logs/UI-057701c.log` |
| 命令 | `pnpm uc018:ui:prove` | 与 `package.json` 及新收据 `cmd` 一致 |
| 新收据 exit | 0 | `UI.json` `exit=0`，`cmds`/`exits` 同为 0。`historical.exit=1`，`historical.unchanged=true` |
| 历史 | `e88d386` 仍 exit 1 | 见下。未被改写成 0 |
| covered | 保持 8 | 新收据 `coveredCountRetained=8`。矩阵 UC-E2E-018 仍 **partial** |

核对时 origin 尖端为 `269bcad0ef107733e28bd603f2d1e875f9becfa3`（证明期间从 `b118390` 前进；两枚声称 SHA 仍是祖先）。`feat/mysql-schema-skeleton` 正被 `/workspace/meetwise-lineH` 检出，本审查以 detached HEAD 提交。

## 历史记录（未改写）

`ai-docs/delivery/receipts/uc018-receipt-backfill/UI.json` 在 `11fac99`、`e9ccfbe`、`2673960` 与当前 origin 尖端均为 `exit=1`，`targetSha`/`runnerCommitSha`/`gitSha`=`e88d386ea946918668d8e073edc7f33521fe33d9`，`coveredCountRetained=8`。`52815fb..origin` 没有再改这个文件。`057701c` 只改 `scripts/run-e2e-ui.mjs`（缺 `BUILD_ID` 时先 `next build`），`52815fb` 只加新收据。

历史日志 `logs/UI-e88d386.log:53` 与 `:59` 仍是 `E2E_FAILURE class=frontend code=web_not_ready`。矩阵五行仍写：`UI@e88d386` is a failed backfill (exit=1, web_not_ready), not counted。§1.1 / UC-E2E-018 保持 **partial**。gatherer 与 coveredCount **没有**翻成 covered。UI alone ≠ UC-E2E-018 covered。

## 新鲜复跑

干净 worktree `/workspace/mw-rv-ui`，detached `057701c42c5e263aabf95a18a13bfd9a5249a0cd`。

| CMD | EXIT |
|-----|------|
| `pnpm install --frozen-lockfile` | 0 |
| `pnpm uc018:ui:prove` | **0** |

一次，未重试。窗口 2026-10-02 21:26:25 PT → 21:27:28 PT。隔离 PG `meetwise-e2e-1442348-1791001585689` @ `127.0.0.1:32797`（`pgvector/pgvector:pg16`，PG-retained，runner 结束时自行拆除）。日志：无 `.next/BUILD_ID` → `next build` → `next start` → Playwright chromium `UC018-UI-abandon` **1 passed**。与声称 EXIT 0 一致，且写在新 SHA 上，不是改写 `e88d386`。

跑后 `git status --porcelain` 为空（无已跟踪改动）。worktree 已 `git worktree remove --force`。未删除他人容器 `meetwise-e2e-1439611-1791001556534`。未碰 `.env*` 与 Meridian。

## Pins

| Pin | Value |
|-----|-------|
| haStatus | NOT_HA |
| releaseEvidence | false |
| claimProductionHA | false |
| gR45Closed | true |
| coveredCount | 8 |
| ms3EqualsR4Closed | false |
| Stack | PG-retained |
| Public DELETE | 503 |

## 条件与阻断

无 honesty 阻断。条件仍在：本绿只是 tip 重跑的新证据；历史 `e88d386` 保持 exit 1 / `web_not_ready`；coveredCount 保持 8；UC-E2E-018 保持 partial；本 PASS ≠ covered ≠ nail；alone≠dual；不代签 mw-rag-route；public DELETE 保持 503；不是生产 HA。

Verdict: PASS
