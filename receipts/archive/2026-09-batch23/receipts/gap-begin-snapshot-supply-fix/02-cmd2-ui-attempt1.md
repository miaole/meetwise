# Receipt 02 — CMD2 `pnpm e2e:ui:isolated`（attempt 1 · G7S EXEC · 修复面绿 + 红①残留如实记）

**Line**: G7S · **实跑 code SHA**: `fd569a606aa711e81ec9a1eb094c2370d9b160ee` · **Date**: 2026-10-07（UTC 2026-10-07T19:34–19:36）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm e2e:ui:isolated`（wiring `package.json:279` @blob `0afb3bd2` · = `node scripts/run-e2e-isolated.mjs e2e:ui`） |
| EXIT | **1**（`.tmp/02.exit`=1 · playwright 计分 **12 passed / 2 failed / 10 skipped (2.0m)** · skipped=voice/OCR capability skip=0 调用 ≠ green） |
| 时间戳（UTC） | start `2026-10-07T19:34:12Z` → end `2026-10-07T19:36:55Z` |
| 实跑 SHA | `fd569a60` |
| Key presence（name-only） | `envModelApiKey=set` · `profile=dashscope-cn-beijing model=qwen-plus`（`.tmp/02.key-presence.txt`）· 五个 `.env*` 全 **ABSENT**（`.tmp/02.env-presence.txt`） |
| 关键输出 | **`uc018-abandon.spec.ts` 双 project（chromium+mobile）PASS——G7S 修复面（F-F 甄别红的 uc018 通用 begin 面）由红转绿，断言零触碰**；失败=**red① recruiting-bound ×2 project**（`recruiting-bound.spec.ts:56` · 35.5s/33.4s=30s `waitForURL` 超时签名 · 页快照 `apps/web/test-results/recruiting-bound-C→B-…-{chromium,mobile}/error-context.md`（未入 git · 引用如实披露）「出错了 · 错误标识:1817280189」双 project 同 digest=server action 错误边界，与 G7K/G7R 红①同形）· `migrations: applied=142` ✓ |
| 预算 | ai_model_invocation 账本（sidecar 末次快照，fresh DB 累计=本 CMD 全量）：**5 行**（classify succeeded ×2 · null-service succeeded ×1 · dispatching ×1 · failed(schema_validation_failed) ×1）· `ai_invocation_trace`=3 · est ≤8 次尝试 · **远低于 ≤200** · `actualSpendCny=null` |

## C-MO-Q2 扩查定谳（授权三查询 · sidecar 末次快照 @19:36:54.601Z · fresh DB）

| 查询 | 读数 | 定谳 |
|---|---|---|
| `job_route_decision` | **`route_unresolved` / `attempt_outcome=validation_rejected` ×2** | 红①根因=**classify 模型调用成功（HTTP 200 · ledger `job.route-classify.v1` succeeded ×2）但输出未过 `validateModelRouteOutput`** → sticky `route_unresolved`（永不自动重试）→ 无 route_decided revision → `bindApplicationRoute` 不落 binding → recruiter 启动 `interview_ineligible_route` 409（`recruiter.ts:410` fail-closed 如设计）→ start server action throw → 错误边界 → `waitForURL` 30s 超时。**「begin 时序竞态」假说被数据否定**（决策行存在且为 unresolved 终态，重绑重试无对象）；F-F 遗留「classify succeeded ×2 vs 仍红」张力就此闭合：succeeded 指**调用**，非**输出有效** |
| `route_consumption_event` | **0 行** | 消费链（binding/snapshot 事件）从未启动——与无 route_decided 一致 |
| `interview_route_snapshot` | **0 行** | recruiter 面 snapshot 生产者（`recruiter.ts:428`）无输入——**零回归**（其 409 fail-closed 先于 snapshot，行为与 G7K 基线同形） |
| （G7S 新表对照）`candidate_profile_route_decision`/`_snapshot` | **2/2** | 通用 begin 面供给正确落行 ×2 project（修复面绿的 DB 佐证） |

**红①归因（C-MO-Q2 履行）**：route 侧 classify **输出质量/校准**问题（qwen-plus strict-enum 输出被服务端双重校验拒）→ 属性 model-op/route 侧另刀；**非 begin 供给面、非本刀触碰面、非夹具面**。recruiter-flow 面零回归成立（其 fail-closed 行为与既有基线同形）。
