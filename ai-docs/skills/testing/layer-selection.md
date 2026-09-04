---
id: skills_testing_layer_selection
name: 测试层选择
description: 按改动性质选择 unit、contract、隔离 prove、HTTP E2E 或浏览器 E2E，禁止用错层冒充验收。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./run-gates.md
  - ../../testing/strategy/test-strategy.md
---

# 如何选择测试层

这是 [变更后 SOP](./sop.md) 的第 2 步。一层只证明该层能证明的事。选层错误等于假验收。选完按 SOP 第 3 步执行（always-on + 矩阵必须列）。

| 改动性质 | 先跑 | 不要用它证明 |
| --- | --- | --- |
| 纯函数、validator、domain policy、确定性聚合 | 包内 `prove` / Vitest | 模型“理解了答案” |
| 请求/响应形状、zod 字段 | `pnpm` 契约 smoke / `openapi:prove` | 数据库隔离 |
| 跨模块 + 真 Postgres + RLS/CAS/幂等 | `run-e2e-isolated.mjs` 上的 `*:prove` | 真模型质量 |
| 图分支、interrupt/resume、假模型轨迹 | `graph:prove` / `pipeline:prove` / adaptive-graph | 境内模型分数有效 |
| 真 HTTP + 真 worker + 真供应商主链路 | `pnpm e2e:isolated`（需 `MODEL_API_KEY`） | 浏览器 cookie / 移动布局 |
| 真浏览器 cookie、middleware、SSE 渲染 | `pnpm e2e:ui:isolated`（Playwright，需 Key + 已构建 `.next`） | API 并发容量 |
| 本机读/写突发预算 | `pnpm performance:e2e:isolated` | 线上 SLO |
| 模型质量、相对序、跑题 | golden-tasks + `scoring:eval` / nightly | 用 fixture 绿代替质量 |

## 决策规则

1. **能用确定性 prove 抓住的，不要先上 live E2E。** 例如 quote 不在答案内 → `pnpm scoring-integrity:prove`；同答案重放 → `pnpm turn-idempotency:prove`。
2. **钱、多租户、终态无死胡同** 在隔离 prove 绿了之后，有 Key 再跑 HTTP E2E。
3. **只改了 web 组件/RSC/middleware** → `pnpm web:prove`，再视情况 `e2e:ui:isolated`。未改 API 不必付一次完整面试模型账单。这是 [fail-closed 门](./fail-closed-gate.md) 的 UI 面，单张截图不算验证。
4. **只改了文档** → `pnpm docs:check` + `pnpm golden-tasks:check` + `pnpm golden-tasks:prove`。不要声称 E2E 已重跑。
5. **策略里写 Playwright 的地方** 仅指浏览器**次层**。业务全链路**主层**是 `e2e/full.e2e.ts` 的 fetch/SSE 客户端（`pnpm e2e:isolated`）。

## 与 CI 的关系

`.github/workflows/ci.yml` 的 `verify` 作业跑隔离 prove 与契约/架构门，**不**跑 `e2e:isolated`。注释写明：缺 Key 会 `live_provider_key_missing`；配 skip 会变成假绿。真模型层在 `nightly`，且当前 nightly **没有**挂上全栈 HTTP E2E。
