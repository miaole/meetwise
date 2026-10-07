# Receipt 03 — CMD3 `pnpm verify:e2e-performance`（attempt 1 · G7S EXEC · build/migrate 过 · HTTP 面红如实记）

**Line**: G7S · **实跑 code SHA**: `fd569a606aa711e81ec9a1eb094c2370d9b160ee` · **Date**: 2026-10-07（UTC 2026-10-07T19:39–19:40）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm verify:e2e-performance`（wiring `package.json:282` @blob `0afb3bd2` · = `node scripts/run-e2e-performance-suite.mjs`） |
| EXIT | **1**（`.tmp/03.exit`=1 · 步序：web production build ✓（`Compiled successfully` 27/27）→ `migrate:prove` ✓（「迁移运行器 全部通过」）→ **HTTP full E2E EXIT=1 → 后续步短路 not_run**（与 G7R CMD3 同形序）· 内层 machine receipt `.tmp/e2e-receipts/2026-10-07T19-40-17-580Z-…json` outcome=failed exitCode=1 failureClass=api durationMs=37887 assertionCount=null · 顶层错误 `e2e_performance_suite_failed:HTTP full E2E:exit=1`） |
| 时间戳（UTC） | start `2026-10-07T19:39:11Z` → end `2026-10-07T19:40:17Z` |
| 实跑 SHA | `fd569a60` |
| Key presence（name-only） | `envModelApiKey=set` · `profile=dashscope-cn-beijing model=qwen-plus`（`.tmp/03.key-presence.txt`）· 五个 `.env*` 全 **ABSENT**（`.tmp/03.env-presence.txt`） |
| 关键输出 | 内层 fresh DB（container `meetwise-e2e-29395-1791401979691`）：`migrations applied=142` ✓；**`interview_job`：start done ×2 + answer done ×4（attempts=1 · last_error 全空）**；**`interview`：completed ×1 + abandoned ×1**（主驱动面试**完整跑完**、uc018 正常 abandon——G7K 基线该面 0 题秒败）；`candidate_profile_route_decision/snapshot` ×2 ✓；`E2E_FAILURE_CLASS class=api` · reviewLedger=[image_ocr_unavailable, voice_unavailable]（同形） |
| 预算 | ai_model_invocation **7 行**（succeeded ×5 · failed(schema_validation_failed) ×2）· `ai_invocation_trace`=5 · est ≤10 次尝试 · **远低于 ≤200** · `actualSpendCny=null` |

## 判读

与 diag-01/CMD1 同面：class=api fail-fast 无 summary，✗ 原文被 withhold 契约扣留（`13dbfc43` 冻结零触碰）；diag-01（同 tip · wrapper-free · 可见 ✗）指认最一致候选=`full.e2e.ts:203` 出处审查断言（澄清重发 identity 计数 vs 零澄清假设 · live 模型行为面 · **非 G7S diff 触碰面**）。**`adaptive_role_route_missing` 全 run 零命中**（q1 last_error 全空 + 供给表落行 + interview completed）——本刀修复目标面确证消失。live 计入预算：见 SUMMARY 账本。

**Ban 声明**：本 attempt 原值保留；未重跑（各 CMD 恰好一次 · Ban retry-to-green）。
