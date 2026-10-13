# Receipt 03 — CMD3 `pnpm verify:e2e-performance`（G7U EXEC · attempt-1/1 · EXIT=1 · api 面红经 HTTP full E2E 短路）

**Line**: G7U · **Date**: 2026-10-07（UTC）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7u` · branch `line/g7u-timing-face`

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run verify:e2e-performance`（wiring `package.json:282` @`0afb3bd2` · = `node scripts/run-e2e-performance-suite.mjs`） |
| EXIT | **1**（`G7U-cmd3-perf-EXIT=1` · suite error `e2e_performance_suite_failed:HTTP full E2E:exit=1`） |
| 时间戳（UTC） | suite receipt `.tmp/e2e-receipts/2026-10-07T22-46-46-171Z-93015.json`：started 22:46:46Z → finished 22:47:51Z（steps：web production build EXIT=0 22601ms → schema migration/deploy evolution EXIT=0 4877ms → **HTTP full E2E EXIT=1 38162ms**） |
| 实跑 SHA | **suite receipt `gitHead=dbed8a6f`**（suite 自证 · 与 commit 内容同一） |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader source）· `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` · `MODEL_NAME=qwen-plus` · `.env*` 全 ABSENT |
| 关键输出 | web build ✓（27/27 静态页）· `PASS schema_migrations 记 2 条` · `PASS 0046 → 岗位申请可显式评分不可用…` · `✓ 迁移运行器 全部通过` · HTTP full E2E 内层 receipt `.tmp/e2e-receipts/2026-10-07T22-47-51-753Z-93601-…json`：**failureClass=api · durationMs=37904** |
| 预算 | live：HTTP full E2E 旅程 1 次，est ≤10（est-not-counter）· `actualSpendCny=null` |

## 五分类判读（如实 · 不定谳）

- HTTP full E2E 短路面 = **class=api · 37.9s**——与 CMD1 attempt-2（40.6s）及 G7S CMD1（38.4s）三者同形同量级 → **G7S 既有 retained api 红面**（G7R/G7S 口径：断言原文经 withhold 不可回读）。**CMD1/CMD3 retained 1/1/1 待真测的答复：真测完成，仍 EXIT=1，api 面在 G7S 供给面修复后未见消失**（协调方预判「api 红面可能已变」的核对结论：形状未变——duration 同量级、class 同 api；精确拒因甄别留 post-dual/另刀，Ban 黏连归咎本刀）。
- 非 CMD3 独有面：perf suite 的 HTTP E2E 阶段即 CMD1 同体（`pnpm e2e:isolated`），EXIT 序列 build✓→migration✓→HTTP✗ 与 G7K/G7R CMD3 短路形态同构。
- sidecar：9 tick 全 `tick-timeout` 后随 suite 结束被收——**无有效 DB 时间线**（仪器缺口同 CMD2，如实登记）。

---
*Receipt 03 · G7U CMD3 · 2026-10-07 · EXIT=1 · build✓/migration✓/HTTP full E2E ✗（class=api · 37.9s · G7S 同形）· gitHead=dbed8a6f suite 自证 · retained api 面真测结论=未消失 · sidecar 缺口如实 · 预算 est ≤10 · `actualSpendCny=null` · STOP*
