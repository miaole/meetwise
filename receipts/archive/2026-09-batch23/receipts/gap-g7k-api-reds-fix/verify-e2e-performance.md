# Receipt — G7R F-A-1 · **CMD3 `pnpm verify:e2e-performance`**（Line G7R EXEC · ×1 · EXIT **1** · `executed:awaiting_post_prove_dual`）

**Line**: G7R · **Knife**: GAP-G7K-API-REDS 修复刀 · F-A-1 配对实测
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-g7r` · `line/g7r-api-reds-fix`
**实跑 code SHA**: **`3767f783863c8dc2bb8743e4ff02654948f1c34c`**（perf machine receipt `gitHead` 字段自证同值）
**F-A-1 配对值**: `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` + `MODEL_NAME=qwen-plus`

## 逐 attempt 记录（七字段 · 本 CMD 恰一次 · 无重跑）

| 字段 | 值 |
|------|-----|
| 1. CMD 原文 | `pnpm verify:e2e-performance`（= `node scripts/run-e2e-performance-suite.mjs` · wiring `package.json:282` @`3767f783` 实测 · C-HA-1 重钉） |
| 2. EXIT | **1**（原始退出码 · 未洗 · 短路点 `e2e_performance_suite_failed:HTTP full E2E:exit=1` @ `run-e2e-performance-suite.mjs:100`） |
| 3. 时间戳 | start 2026-10-08 00:17:14 +0800 · end（suite receipt `startedAt=2026-10-07T16:19:32.519Z` / `finishedAt=16:20:14.506Z` = 00:19:32→00:20:14 +0800 · 03.end.txt 为准） |
| 4. 实跑 code SHA | `3767f783863c8dc2bb8743e4ff02654948f1c34c` |
| 5. 关键输出 | **web production build EXIT=0（22490ms）** → **migrate/deploy evolution EXIT=0（4670ms）** → **HTTP full E2E EXIT=1（14826ms · class=api · 与 CMD1 同源同形）** → suite 契约短路，后续 R5-MARKED-RED pgvector-legacy 族等步 **not_run（≠ pass）** · `live_provider_key_missing` 0 hit · `FreeTierOnly/AllocationQuota` 0 hit · R5 banner 双处在案（log :81/:191） |
| 6. envModelApiKey | **set**（loader 进程环境 · name-only）+ F-A-1 两枚值 name-only；`.env`/`.env.local`/`apps/api/.env` 三文件 ABSENT |
| 7. 预算消耗计数 | 结构估计 **< 10 次 live 调用**（HTTP E2E 复跑同 CMD1 面 · 全 fast-fail）· 上限 200 未超 |

**machine receipts**: suite 级 `.tmp/e2e-receipts/2026-10-07T16-19-32-517Z-94598.json`（`outcome=failed` · `failure=e2e_performance_suite_failed:HTTP full E2E:exit=1` · `gitHead` 自证）+ 内层 HTTP 步 `.tmp/e2e-receipts/2026-10-07T16-20-14-446Z-95020-d84e1a81-aa93-4ff9-b8da-37c98a53ccee.json`（`durationMs=14581` · `failureClass=api` · ledger=[capability:image_ocr_unavailable, capability:voice_unavailable] · `schemaMigrationManifest.count=141`）
**原始 log**: `.tmp/g7r-fa1-20261007/03-verify-e2e-performance.log`（gitignored 不入树）

## F-A-1 判读

HTTP 步与 CMD1 同源同形（class=api · fast-fail · ledger 同）→ **F-A-1 不解除红③**；build/migrate PASS ≠ suite green（短路契约 · not_run ≠ pass）；R5-MARKED-RED pgvector-legacy 披露原样（≠ stack truth ≠ cutover ≠ G6 closed）。provider 状态 401 vs 4xx withhold 不可判读（同 CMD1）。

## 状态

**EXIT=1 · 红如实收** · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · awaiting post-prove dual

---

*Receipt · G7R F-A-1 CMD3 verify:e2e-performance · 2026-10-08 · ×1 · EXIT 1 · build 22490ms EXIT0 + migrate 4670ms EXIT0 + HTTP 14826ms EXIT1 class=api → 短路 · R5 披露原样 · 预算结构估 <10/上限 200 · actualSpendCny=null · g7SuiteGreen=false · STOP*
