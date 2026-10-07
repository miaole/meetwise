# Receipt 01 — CMD1 `pnpm e2e:isolated`（attempt 1 · G7S EXEC · real red 如实记）

**Line**: G7S · **实跑 code SHA**: `fd569a606aa711e81ec9a1eb094c2370d9b160ee`（branch `line/g7s-snapshot-supply` · parent `91f1c751`=origin/feat/mysql-schema-skeleton tip · EXEC 全程零码面变更）· **Date**: 2026-10-07（UTC 2026-10-07T19:20–19:21）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm e2e:isolated`（wiring `package.json:278` @blob `0afb3bd2` · = `node scripts/run-e2e-isolated.mjs e2e:prove`） |
| EXIT | **1**（`.tmp/01.exit`=1 · machine receipt `.tmp/e2e-receipts/2026-10-07T19-21-30-390Z-23472-d81731f1-9559-43e8-aeef-2dbb204428c2.json` outcome=failed exitCode=1 failureClass=api durationMs=38428 assertionCount=null） |
| 时间戳（UTC） | start `2026-10-07T19:20:51Z` → end `2026-10-07T19:21:30Z` |
| 实跑 SHA | `fd569a60`（HEAD；实现 commit，含 DDL `0142` + api/worker/domain/db 变更） |
| Key presence（name-only） | `envModelApiKey=set` · `profile=dashscope-cn-beijing model=qwen-plus`（`.tmp/01.key-presence.txt`）· `.env`/`.env.local`/`.env.development`/`apps/web/.env`/`apps/web/.env.local` 全 **ABSENT**（`.tmp/01.env-presence.txt`） |
| 关键输出 | `migrations: applied=142 skipped=0`（0142 随全量落库 ✓）· `E2E_FAILURE_CLASS class=api` · `ISOLATED_POSTGRES_OUTPUT_WITHHELD container=meetwise-e2e-23472-1791400851961` · `LOCAL_E2E_RECEIPT …release_evidence=false` · reviewLedger=[capability:image_ocr_unavailable, capability:voice_unavailable]（与 G7K/G7R 同形）· 断言 ✗ 原文经 wrapper withhold 契约不可回读（`runFullE2E` stdout 仅内存判定 · blob `13dbfc43` 冻结零触碰） |
| 预算 | live 直接观测缺失（sidecar v1 依赖 wrapper stdout 端口行，pnpm 管道缓冲致未及采样——**仪器缺口如实登记**，v2 已改 `docker ps` 发现）；按 e2e 有效时长 ≤~13s 估 ≤5 次调用（est-not-counter）· `actualSpendCny=null` |

## 判读（与 diag-01 交叉）

fail-fast class=api 且 assertionCount=null（✗ 后无 summary）。同 tip wrapper-free 诊断 **diag-01**（`.tmp/g7s-diag-01-e2e.log` · 独立记账 · 非本 CMD attempt）显示同套件可运行至主驱动：**uc018 全断言 PASS（本刀修复面）**、start job `done`（`candidate_profile_route_snapshot` 落行 `backend/general`），首个 api 类 ✗ = `full.e2e.ts:203` 出处审查断言（`identities=4 ≠ questions=2`——澄清重发（clarification_needed ×2 亦计 server-issued identity） vs 断言零澄清假设；live 模型行为面，**非 G7S diff 触碰面**——本刀只改角色供给）。CMD1 的具体 ✗ 落点不可回读，与 diag-01 的 :203 同类不能排除亦不能确认；**两者均非 `adaptive_role_route_missing`（修复目标面已消失）**。live 计入预算：见 SUMMARY 账本。

**Ban 声明**：本 attempt 原值保留；未重跑 CMD1（各 CMD 恰好一次 · Ban retry-to-green）。
