# POST-PROVE · UC-E2E-025 NHP NEG · mw-e2e-ha

**角色**: adversarial E2E evidence-honesty。不代签 mw-rag-route。不改产品。不把红洗绿。
**日期**: 2026-10-02（PT）
**本 PASS**: 只表示红结果被诚实记成 gap。≠ covered · ≠ nail · ≠ HA · alone≠dual

## 声称

| 项 | 声称 | 核对 |
|----|------|------|
| 代码 | `0271ee4` | 在 origin 上（`0271ee4649b1b94b833587f2f900b22f80863f32`） |
| 收据 | `f47f155` | 在 origin 上（`f47f15562a6645caab6ad44a0f95a5c2d59e5baa`）。只新增 `receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md` |
| 命令 | `pnpm uc025:nhp-neg:prove` | `package.json` 指向 `node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（静态读源，不启隔离 PG） |
| EXIT | 1 | 收据写 **EXIT: 1**。未写成 0 |
| 缺口 | GAP-UC025-NEG-01 | 收据与脚本一致：begin 不收 quiz artifact，也不抛 stale-quiz HttpException |
| 行 | 仍 gap | 矩阵首列仍是 **gap / gap / gap / blind**。未计 covered |

核对时 origin 尖端为 `e09a39fd83f9c2e66da7f9c137b1821033571b3a`。两枚声称 SHA 仍是祖先。`feat/mysql-schema-skeleton` 正被 `/workspace/meetwise-lineH` 检出，本审查以 detached HEAD 提交。

## 失败断言（为何是 1）

`apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` 只在 `acceptsQuiz && realStaleReject` 同时为真时 `process.exit(0)`。否则打印 `GAP-UC025-NEG-01` 并 `process.exit(1)`。

- `acceptsQuiz`：controller 与 service 的 `begin(...)` 签名里是否出现 `quiz-id|quizId|sourceQuiz|source_quiz`。新鲜跑为 **false**（begin 不收 quiz artifact）。
- `realStaleReject`（收据里的 realStaleReject）：`begin(principal)` 起 4500 字内是否 `throw new HttpException` 且 `error` 为 `stale_quiz|quiz_expired|quiz_stale|quiz_artifact_expired|expired_quiz_input`。新鲜跑为 **false**（没有这条拒绝）。

因此走 gap 分支，不是产品拒绝。旁证 `resume_quiz_expiry_column=false`、`contracts_stale_token=false` 不单独决定退出码。旧命令 `pnpm uc025:stale-quiz-expiry:prove` 的 mark-red EXIT 0 不是本次，也不是 covered。

## 018 / 052 与 SSOT

`git show --stat 0271ee4` 只动 `harness/uc-e2e-025-nhp.md`、`uc-e2e-025-nhp.slice.md`、`apps/api/package.json`、`apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`、`package.json`。`git diff --name-only 0271ee4^ 0271ee4` 对 `*018*`、`*052*`、覆盖矩阵、`gap-bug-backlog.md`、`execution-master-checklist.md` 为空。`f47f155` 只加本收据。UC-E2E-018 / UC-E2E-052 行未被这把刀改写。当前 origin 上 UC-E2E-025 仍 **gap**，coveredCount 仍 **8**。gatherer/SSOT 没有把它当成 covered。

## 新鲜复跑

干净 worktree `/workspace/mw-rv-uc025`，detached `0271ee4649b1b94b833587f2f900b22f80863f32`。一次，未重试。

| CMD | EXIT |
|-----|------|
| `pnpm install --frozen-lockfile` | 0 |
| `pnpm uc025:nhp-neg:prove` | **1** |

窗口 2026-10-02 21:29:05 PT（同一秒结束）。stdout：`inventory acceptsQuiz=false realStaleReject=false`，随后 `GAP  GAP-UC025-NEG-01`、`ROW_STILL_GAP`、`CMD=pnpm uc025:nhp-neg:prove EXIT=1`，pnpm `ELIFECYCLE` 因脚本退出 1。与收据 EXIT 1 一致，没有洗成绿。

命令不经过 `run-e2e-isolated`，本次未启 Postgres。跑前跑后容器名单无新增。`git status --porcelain --untracked-files=no` 为空。worktree 已删除。未碰 `.env*` 与 Meridian。

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

无 honesty 阻断。条件仍在：NEG 列仍是 gap，不是 covered，不是 HA，不是 nail；EXIT 1 不得改写成 0；FAULT/BOUND/ADV 未跑；018/052 行保持不动；本 PASS ≠ covered ≠ nail；alone≠dual；不代签 mw-rag-route；public DELETE 保持 503。

Verdict: PASS
