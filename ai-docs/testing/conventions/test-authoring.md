---
id: testing_conventions_test_authoring
name: 测试用例编写规范（先用例后测试后代码）
description: 每条业务用例的主流程 + 每条异常流都要对应测试用例；层映射、强制负向用例、fixtures/fake-model、golden eval、gate 语义、UC↔TC↔code 可追溯。
type: rule
scope: global
level: must
status: active
owner: qa
related:
  - ../strategy/test-strategy.md
  - ../../requirements/use-case-conventions.md
  - ../../skills/testing/SKILL.md
  - ../golden-tasks/README.md
---

# 测试用例编写规范

> 顺序：**用例 → 测试用例 → 代码**。测试用例从业务用例的 Acceptance + 每条异常流派生，**先于实现代码存在**。已写的实现若没有对应 TC，视为未完成。

## 1. 覆盖规则

- 每条用例的**主流程**至少 1 个 TC；**每条异常流（E1–E6）各至少 1 个 TC**。只测 happy path = 不合格。
- 强制负向用例集（缺一不可，对应 test-strategy「禁止假验收」）：
  - 失败回滚/退款、重复请求幂等、并发 CAS（断言恰一个赢）、越权 RLS=0 行、schema 校验失败、幻觉/歪曲拦截、断线重连不丢不重、依赖失效降级、超时。
- 断言"业务事实"而非仅 HTTP 200：状态机落点、账本写入、计数、隔离边界。

## 2. 层映射（用例 → 测试层）

| 用例性质 | 测试层 | 工具 |
|---|---|---|
| 纯逻辑/校验/状态机迁移 | 单元 | Vitest/Jest |
| 对外 API 形状 | 契约 | zod4 schema-diff（contracts 包导出对比） |
| 跨模块 + DB + RLS/CAS/幂等 | 集成 | Supertest + Testcontainers / 真 Postgres |
| 图编排、interrupt/resume、节点决策 | graph | 确定性 fixture + **fake model** |
| 端到端关键路径（鉴权→简历→交易→面试→报告→B 端） | e2e HTTP | `pnpm e2e:isolated`：`e2e/full.e2e.ts` fetch/SSE，真供应商，**不是** Playwright |
| 浏览器 cookie / 页面流 | e2e UI | Playwright：`pnpm e2e:ui:isolated`（`apps/web/e2e-ui/`） |
| 模型质量/安全 | ai-eval | golden 任务登记在 `testing/golden-tasks/`；对**真实境内模型**跑的条目不得用 fake 冒充 |

## 3. 命名与可追溯

- TC ID：`TC-<UC-id>-<flow>`，如 `TC-interview-submit-answer-E1`（对应该用例异常流 E1）。
- 每个 TC 头部注明所验证的 `UC-id` 与 flow；用例文档反向列出其 TC。
- 实现代码的每个分支应能追到一个 TC。

## 4. fixtures 与 fake model

- **fake model 必须确定性**：固定输入→固定输出，可制造"schema 失败一次再成功""确定性拒绝""幻觉事实"等轨迹，用于覆盖异常流。生产模型质量另由 ai-eval 验证，二者不混。
- graph 测试用黄金 checkpoint fixture；迁移测试用 before/after fixture。

## 5. Gate 语义（接 CI）

- 阻断合并的 TC：契约、单元、集成（含 RLS 越权=0/CAS 并发/幂等）、graph fixture、隔离 prove。HTTP/浏览器 live E2E **不是** per-push 阻断门（需 Key；见测试技能）。
- 变更后命令：`pnpm regression`；触达面加跑见 `ai-docs/skills/testing/regression-selection.md`。
- ai-eval 质量回归掉线 = 阻断发布（release-gate）。
- CI 工作流见 `.github/workflows/ci.yml`；每新增 gate 必须挂在某条 UC 的 Acceptance 上。

## 6. 倒挂已有验证

当前已存在 5 个可复跑 gate（`db:prove / runtime:prove / graph:prove / api:validate / pipeline`，共 52 断言）。按本规范，它们的每条断言必须**回挂到一条业务用例的某条 flow**；未挂上的断言要么补用例，要么删除。范例见 [UC-interview-submit-answer](../../requirements/use-cases/UC-interview-submit-answer.md)。
