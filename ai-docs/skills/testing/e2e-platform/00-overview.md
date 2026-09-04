# 00 · 总览

Meetwise 的 E2E **主路径**是隔离 Node 客户端：`e2e/full.e2e.ts` + `scripts/run-e2e.mjs`，入口 `pnpm e2e:isolated`。它用 fetch 和 SSE 打真 api、真 worker、隔离 Postgres、真供应商。假服务开关必须使 runner 失败：母线三旗标（`VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL`）仍内联检查，完整禁止列表在 `scripts/e2e-fake-service-flags.mjs`（另含 ASR/TTS/embed/rerank/transport overrides）。命令语义只维护在 [`../run-gates.md`](../run-gates.md)。

Playwright 只覆盖浏览器层：`apps/web/e2e-ui/`，入口 `pnpm e2e:ui:isolated`。它证明 cookie、middleware、页面流，**不能**单独充当全链路支付 webhook / 报告舱壁证据。

| 层 | 命令 | 证明 | 不证明 |
| --- | --- | --- | --- |
| HTTP 全链路 | `pnpm e2e:isolated` | 鉴权、简历、交易、面试循环、B 端 RLS | 浏览器 cookie、模型质量校准 |
| 浏览器 | `pnpm e2e:ui:isolated` | cookie / middleware / 页面 | 支付 HMAC、报告隔离注入 |
| 无 Key 回归 | `pnpm regression` | always-on（文档 / golden / 平台三入口 / helpers / 回执 / 静态守卫 / parity / 架构 / api smoke；完整名单只维护在 [run-gates](../run-gates.md)） | 真供应商终态 |
| 行走骨架 | `pnpm regression --core` | db/runtime/graph/pipeline/api:validate | live 模型 |

## 硬边界

- helpers（`e2e/helpers/`）是共享 harness，场景编排留在 `e2e/full.e2e.ts`。helpers 不得 import `apps/web` 或页面组件。
- 缺 `MODEL_API_KEY` 记 `not_run` / 非零退出，禁止 skip-as-pass。
- 回执恒 `releaseEvidence=false`。
- 本 SOP 是 **draft**。PASS_WITH_GAPS 可以写，READY 不行。
