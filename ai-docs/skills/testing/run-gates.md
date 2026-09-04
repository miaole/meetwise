---
name: run-gates
description: 隔离 prove、HTTP E2E、浏览器 E2E、性能门的真实命令、依赖和失败语义。
---

# 怎么跑门禁

所有会重建 schema 的命令必须走 `scripts/run-e2e-isolated.mjs`（临时 `meetwise-e2e-*` 容器）。不要对开发库跑这些目标。

## 1. 无供应商 Key 的总是门

```bash
pnpm regression
```

默认包含：`docs:check`、`golden-tasks:check`、`golden-tasks:prove`、`e2e-helpers:prove`、`e2e-receipt:prove`、`e2e-runner:prove`、`arch`、`api:smoke`。缺 Docker 不能假装隔离 prove 已跑。

行走骨架（本地有 Docker 时）：

```bash
pnpm regression --core
# 等价于依次：
pnpm docs:check
pnpm arch
pnpm db:prove
pnpm runtime:prove
pnpm graph:prove
pnpm pipeline:prove
pnpm api:validate
pnpm api:smoke
```

CI `verify` 比这更长，见 `.github/workflows/ci.yml`。合并阻断以 CI 列表为准，不要用本文件的短列表替代。

## 2. 隔离业务 prove（仍不需要 live 模型质量）

按 [回归矩阵](./regression-selection.md) 挑选，不要每次全跑 CI 副本。常用：

| 命令 | 证明什么 | 不证明什么 |
| --- | --- | --- |
| `pnpm interview:prove` | 自适应 consumer + 图到 ledger/结算 | HTTP begin、真模型质量 |
| `pnpm commerce:prove` | 额度 FIFO / 并发不超卖 | 真实支付服务商 |
| `pnpm resume:prove` | 加密、PII 剥离、注入门 | 真视觉 OCR 供应商 |
| `pnpm scoring-integrity:prove` | quote 失败 → unscored；报告忽略模型 overall | 评分官校准 |
| `pnpm turn-idempotency:prove` | 同答案 HTTP 重放只落一个 job | 评分层缓存 / 不重打模型 |
| `pnpm neg:interview` | 同题不同 answer hash → 409，不覆盖 | 评分幂等键在 invoke 层的缓存 |
| `pnpm adaptive-offtopic:prove` | 非作答 → clarify / pivot，不并入掌握分 | 报告文案「掌握 X」或引导话术质量 |
| `pnpm model-op00-usage-reconciler:prove` | schema 失败 → `schema_validation_failed` | 供应商标量非法 JSON 文本（走 unknown） |
| `pnpm golden-tasks:check` | 第一批登记诚实：status / 命令 / 文档对齐 | 被映射门本身已跑过 |
| `pnpm golden-tasks:prove` | 负向夹具：假绿 status / planned 声称命令 / 文档漂移会失败 | 被映射门本身已跑过 |
| `pnpm web:prove` | SSE 解码、契约客户端、`report_unavailable` 不转圈 | 真浏览器 |
| `pnpm performance:e2e:isolated` | 本机 health/products/signup/resume 突发预算 | 线上容量 |

## 3. 真供应商 HTTP E2E

```bash
pnpm e2e:isolated
# 或
pnpm regression --live
```

硬条件（`scripts/run-e2e.mjs`）：

- `E2E_ISOLATED=1`（由 isolated 包装器注入）
- `MODEL_API_KEY` 存在
- `VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` 未开启

客户端是 `e2e/full.e2e.ts`（helpers 在 `e2e/helpers/`），用 fetch + SSE，不是 Playwright。完整面试存活预算 **420 秒**，只证明链路能到终态，不是接口 P95。

隔离 worker 当前设置 `E2E_REPORT_FAIL_ALL=1`：报告在取得真模型响应后注入故障，用来证明舱壁。因此主面试终态经常是 `report_unavailable`，**不能**把一次绿的 HTTP E2E 写成 `report_ready` 已稳定。OCR / TTS / ASR 断言仍在客户端里；若运行时组合根关闭了这些 operation，该门会失败而不是 skip-as-pass。`MODEL_API_KEY` 不足以单独证明视觉或语音已接线。

回执写在 `.tmp/e2e-receipts/`，`releaseEvidence=false`。缺最终摘要或回执写入失败 → 非零退出。

## 4. 真浏览器 E2E（Playwright）

```bash
pnpm -C apps/web build          # run-e2e-ui.mjs 不代构建
pnpm e2e:ui:isolated
```

依赖 production `next start`、Chromium + Pixel 5、同一套隔离库和 live Key。用例在 `apps/web/e2e-ui/`。这是 cookie / middleware / 页面流证据，不能替代 HTTP 全链路里的支付 webhook 与报告舱壁断言。

## 5. 性能与长上下文

```bash
pnpm performance:e2e:isolated   # API 突发
pnpm e2e:ui:isolated            # 浏览器流式窗口（另有 web:prove 的合成 SSE）
pnpm stress:prove               # 上下文封顶；本地 echo 模型，非质量
pnpm verify:e2e-performance     # 本地全量子集；含 live HTTP/UI，需要 Key 与时间
```

## 6. 失败怎么读

- `live_provider_key_missing`：没有 Key。记 `not_run`，不要改 runner 去 skip-as-pass。
- `fake_service_mode_forbidden`：有人打开了假服务开关。关掉再跑，不要删这条守卫。
- `e2e_isolation_required`：直接跑了 `pnpm e2e:prove`。必须用 `e2e:isolated`。
- 子进程 stdout/stderr 默认不进回执。失败时只看退出码、断言行和 `E2E_PROCESS_OUTPUT_WITHHELD` 字节计数。
