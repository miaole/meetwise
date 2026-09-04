---
id: skills_testing_overview
name: 测试技能概述
description: 功能改动后必须先执行 sop.md 的审核→测试→回归。默认 pnpm regression 只是 always-on 子集。禁止把本地绿写成发布证据。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./post-change-review.md
  - ./layer-selection.md
  - ./run-gates.md
  - ./regression-selection.md
  - ./ai-provenance.md
  - ./honesty-rules.md
  - ./fail-closed-gate.md
  - ./e2e-platform/README.md
  - ../../testing/strategy/test-strategy.md
---

# 测试技能 · 概述

**状态：`draft`。** draft 只限制对外宣称流程已生产就绪，**不减免步骤**。必须先读完并逐步执行 [变更后 SOP](./sop.md)，第 5 步用 [fail-closed 门](./fail-closed-gate.md) 收束。不得只跑 `pnpm regression`，不得默认信任 AI 产物，不得写不带限定语的「已验证」。

**生成物默认不可信。** 重构、测试、UI、回归可以自动化；生成代码与模型输出必须先审正确性、安全、出处，禁止伪造分数/进度。**skip-as-pass 禁止。** 没有受信回执前 `releaseEvidence` 必须为 `false`。未审核生成物不得标 READY。

子清单按 SOP 表格打开，不要在本页另开一套步骤：

- [变更后审核](./post-change-review.md)（SOP 1）
- [选测试层](./layer-selection.md)（SOP 2）
- [门禁目录](./run-gates.md) / [回归矩阵](./regression-selection.md)（SOP 3）
- [出处检查](./ai-provenance.md)（SOP 4，按需）
- [诚实规则](./honesty-rules.md) + [fail-closed 门](./fail-closed-gate.md)（SOP 5 收束）
- [E2E 平台 SOP](./e2e-platform/README.md)（draft / NOT_READY；`pnpm e2e-platform:prove` 可跑，不表示 live E2E READY）

入口命令（与 [门禁目录](./run-gates.md) 同步；默认项**不是**触达面必须列）：

```bash
pnpm regression          # always-on：文档 + helper + 回执/运行器 + arch + api:smoke
pnpm regression --core   # 再加行走骨架隔离门（需要 Docker / 临时 Postgres）；不是 interview/commerce 全集
pnpm regression --live   # 仅真供应商 HTTP E2E；无 MODEL_API_KEY 不要跑（会非零）。浏览器层另见 SOP
```

## 改本技能时

改配方、E2E harness 或 golden-tasks 仍走 `AGENTS.md` 生成前门禁。升格 `active` 的条件只写在 [SOP](./sop.md)。e2e-platform 保持 **draft / NOT_READY**，不随本页升格而变成 READY。

## 铁律（先读再跑）

- 控制器/页面绿了不算业务完成。断言状态机落点、账本、隔离、终态事件。
- HTTP 全链路 E2E 是 `e2e/full.e2e.ts` + `scripts/run-e2e.mjs`（fetch / SSE），**不是** Playwright。Playwright 只覆盖 `pnpm e2e:ui:isolated` 的浏览器层。
- `run-e2e.mjs` 在 `E2E_ISOLATED=1` 且存在 `MODEL_API_KEY` 时才启动；`VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` 直接失败。
- 回执恒为 `releaseEvidence=false`。没有受信 runner、不可变对象存储和独立验签，就不能写发布通过。
- golden-tasks 第一批已建档；未映射到可跑门的条目状态必须是 `planned` 或 `unmapped`，禁止标 `passed`。
- `pnpm generation-trust:prove` 检查本政策仍写在审核清单与回归入口；绿了也不等于「已完成」。
- **P0 fail-closed（文档门）：** 不默认信任 AI 代码或 AI 输出。审核与验证缺一即阻断；作者不得自签审核；多轮修改必须重开本门。禁止提交密钥。`gate: closed` ≠ runner 绿。
