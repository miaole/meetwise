# Receipt 01 — CMD2 `pnpm e2e:ui:isolated`（G7T EXEC · attempt 1/2 · v2 修复面待证 · 红①残留如实记）

**Line**: G7T · **Date**: 2026-10-07（UTC start 20:50:54Z）· **实跑 code SHA**: `430d4c84`（v2 + sealed p.v2 + 测试钉 · committed 树 · porcelain 干净）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm e2e:ui:isolated`（wiring `package.json:279` @`0afb3bd2` · = `node scripts/run-e2e-isolated.mjs e2e:ui`） |
| EXIT | **1**（playwright 计分 **12 passed / 2 failed / 10 skipped (2.0m)** · 与 G7S 基线同形；runner 失败分类 `E2E_FAILURE class=frontend code=client_exited` = playwright 用例级 FAIL 的客户端退出码，非 infra crash） |
| 时间戳（UTC） | start `2026-10-07T20:50:54Z` → teardown 完成（本 attempt 末） |
| 实跑 SHA | `430d4c84` |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader 进程环境 · name-only · 零 Key 值读取）· `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` · `MODEL_NAME=qwen-plus` · 五个 `.env*` ABSENT（未创建） |
| 关键输出 | 失败 = **红① recruiting-bound ×2 project**（`recruiting-bound.spec.ts:56` · 35.8s/33.9s · `:96:14` 30s `waitForURL` 超时签名 · 错误边界「出错了 · 错误标识:3363855294」页快照在卷 `apps/web/test-results/…/error-context.md`）· 其余 12 用例 PASS（含 uc018 双 project）· `migrations: applied=142` |
| 预算 | live 调用：classify ×2（双 project 各 1 · 未设 sidecar 无直接账本读数 · 按 job_route_decision 行数推估）· 累计（诊断 11 + 本 attempt ≈2 + 面试面模型调用）**远低于 ≤200** · `actualSpendCny=null` |

## OB-2（本 attempt 仪表缺口 · 如实登记）

本 attempt **未布 sidecar**（读取面板扩查缺位——本席 EXEC 准备疏漏，非工具限制）：runner 拆除临时容器（`ISOLATED_POSTGRES_OUTPUT_WITHHELD state_bytes=217`），`job_route_decision` 行随之销毁，**本 attempt 无法判别 classify 面读数**。红①签名（错误横幅 + 30s 超时 + :96:14）与 G7S 同形，但「classify 仍拒 vs 时序面」不可判——此缺口是 attempt 2（布 sidecar）的直接动因。**Ban 以本 attempt 读数定谳任何归因**。

## Non-claims

attempt 1 ≠ 定谳 · 无 DB 读数 · 12P/2F 与 G7S 基线同形 ≠ 面未变 · EXIT=1 原值如实 · alone ≠ dual

---
*Receipt 01 · G7T CMD2 attempt 1/2 · 2026-10-07 · EXIT=1 · 12P/2F/10S · 红①签名同形 · sidecar 缺位 OB-2 · STOP*
