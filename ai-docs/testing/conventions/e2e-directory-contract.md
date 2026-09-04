---
id: testing_conventions_e2e_directory_contract
name: E2E 目录契约（helpers / 场景 / run-e2e*）
description: Meetwise HTTP E2E 的目录职责：共享 harness 只放可复用原语，一次性业务叙事只放场景，启栈与隔离只放 scripts/run-e2e*。静态门禁 fail-closed，不是 live E2E 或发布证据。
type: rule
scope: global
level: must
status: active
owner: qa
related:
  - ../strategy/test-strategy.md
  - ./test-authoring.md
  - ../../skills/testing/SKILL.md
---

# E2E 目录契约

Meetwise 的 HTTP 端到端（E2E）客户端已经拆成 **helpers**、**场景** 和 **运行器**。本契约只锁定这一棵树，**禁止**再抄其他产品的领域目录（例如 `booking/`、`catalog/`、`checkout/`）。

本文件不证明真供应商链路，也不构成发布证据。`releaseEvidence=false`。

## 三层，各写各的

| 层 | 路径 | 放什么 | 不放什么 |
| --- | --- | --- | --- |
| 共享 harness | `e2e/helpers/*.ts` | 可复用 HTTP / 鉴权 / SSE / 面试循环 / 交易签名 / 断言 | `*.e2e.ts`、`async function main`、一场场景的简历原文 / JD / 固定答词 |
| 夹具 | `e2e/*-fixture.ts` | 二进制或哨兵样本（如 OCR PNG） | 启栈、答题编排 |
| 场景 | `e2e/*.e2e.ts` | 一场业务旅程（报名→简历→交易→面试→终态，或 API 突发） | 通用 parse / HMAC / SSE 解码 |
| 运行器 | `scripts/run-e2e*.mjs`、`scripts/run-performance-e2e.mjs` | 隔离、派生端口、假服务拒绝、拉起 api/worker、再 **spawn** 场景文件 | 简历正文、面试答词、把全链路写成运行器内联脚本 |
| 浏览器层 | `apps/web/e2e-ui/` | Playwright 页面流 | 不要当成 HTTP 全链路的唯一实现 |

`e2e/` 根下只允许目录 `helpers/`。新的 HTTP 场景加 `e2e/<name>.e2e.ts`，不要新建 `e2e/interview/`、`e2e/commerce/` 这类领域树。

## 当前锁定的文件

**Helpers（可增补 `.ts`，不可变成场景）：** `assert.ts`、`auth.ts`、`commerce.ts`、`http.ts`、`interview.ts`、`sse.ts`、`voice.ts`，以及无网络证明 `e2e-helpers.proof.ts`。

**场景：** `e2e/full.e2e.ts`（真 HTTP 主链路）、`e2e/performance.e2e.ts`（本机 API 突发）。

**夹具：** `e2e/ocr-fixture.ts`。

**运行器：** `scripts/run-e2e.mjs`、`scripts/run-e2e-isolated.mjs`、`scripts/run-e2e-ui.mjs`、`scripts/run-e2e-performance-suite.mjs`、`scripts/run-performance-e2e.mjs`。

运行器必须引用场景路径（例如 `e2e/full.e2e.ts`），而不是把那场旅程抄进 `scripts/`。

## 共享 harness 不得内嵌一次性业务叙事

一次性叙事属于场景，例如具体简历段落、具体口播题、具体答词。Helpers 可以有协议默认值（澄清「跳过」、过期身份重放的固定探测句），那不是一场用户故事。

`e2e/helpers/*.proof.ts` 是 helpers 的合同证明，可以用短输入测哈希 / 解析；它仍不是场景。

## 门禁（fail-closed）

```bash
pnpm e2e-platform:check          # 目录契约 + 核心边界；缺文件或叙事泄漏 → 非零退出
pnpm e2e-platform:prove          # 证明检查能失败：种植违规必须非零，禁止 skip-as-pass
pnpm e2e-platform:check --skip-core-boundaries   # 只跑目录契约；不能跳过目录契约本身
```

`scripts/e2e-platform/` 只服务 Meetwise 这棵树。它不引入其他产品的模块地图，也不替代 `pnpm e2e:isolated`。

挂到无 Key 的事后回归：`pnpm regression` 的 always-on 列表。绿了只说明布局没漂，**不是** live E2E，更不是发布通过。
