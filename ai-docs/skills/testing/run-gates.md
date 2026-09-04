---
name: run-gates
description: 隔离 prove、HTTP E2E、浏览器 E2E、性能门的真实命令、依赖和失败语义。
---

# 怎么跑门禁

所有会重建 schema 的命令必须走 `scripts/run-e2e-isolated.mjs`（临时 `meetwise-e2e-*` 容器）。不要对开发库跑这些目标。

## 0. 三车道与必跑顺序

**review/verify** gate: `pnpm regression` is automation; **automation does not trust AI outputs**. **multi-round allowed**. Missing this language, a missing Key on `--live`, or a failed step is fail-closed. No secrets in command output.

`pnpm regression` 只有三条车道，**顺序固定**：

1. **always-on**（默认，无 Key、无 Docker）
2. **`--core`**（行走骨架；需要 Docker / 临时 Postgres）
3. **`--live`**（真供应商 HTTP E2E）

flag 可组合：`pnpm regression --core --live` 仍按 always-on → core → live。省略某车道只表示没跑（`not_run`），不能写成该车道通过。

`--core` 不是另一套入口：它**先跑完 always-on**，再跑行走骨架 prove。  
`--live` 同样先跑完 always-on（若带了 `--core` 则先跑 core），再跑 `e2e:isolated`。  
缺或空白 `MODEL_API_KEY` 时 `--live` 立即非零退出（`live_provider_key_missing`），禁止 skip-as-pass。未知 flag 退出码 2。`pnpm regression --dry-run` 只打印计划。

浏览器 UI 从不进本入口。

## 1. 无供应商 Key 的 always-on

```bash
pnpm regression
# 查看将跑哪些步：
pnpm regression --dry-run
```

必跑：`docs:check`、`golden-tasks:check`、`e2e-helpers:prove`、`e2e-receipt:prove`、`e2e-runner:prove`、`arch`、`api:smoke`。其中任一条在 `package.json` 缺失 → 非零退出（fail-closed）。

若 `package.json` 里还有这些脚本，会自动接上（没有则跳过，不记通过）：`public-text-policy:prove`、`quality:traceability:prove`、`provider-egress:prove`。`quality:governance:check` 仍是 EXEC-00 静态治理门，不挂进 always-on：历史记录引用已删除路径时它会红，不能当成变更后烟雾。入口自身的契约用 `pnpm regression:prove` 验证，不挂进 always-on，避免自举循环。

缺 Docker 不能假装隔离 prove 已跑。

行走骨架（本地有 Docker 时；**先跑完 always-on**）：

```bash
pnpm regression --core
# always-on 之后追加：
pnpm db:prove
pnpm runtime:prove
pnpm graph:prove
pnpm pipeline:prove
pnpm api:validate
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
| `pnpm turn-idempotency:prove` | 同答案 HTTP 重放只落一个 job | 不同答案的业务冲突策略全表 |
| `pnpm web:prove` | SSE 解码、契约客户端、`report_unavailable` 不转圈 | 真浏览器 |
| `pnpm performance:e2e:isolated` | 本机 health/products/signup/resume 突发预算 | 线上容量 |

## 3. 真供应商 HTTP E2E

```bash
pnpm e2e:isolated
# 或（先 always-on，再 HTTP E2E）
pnpm regression --live
```

硬条件（`scripts/run-e2e.mjs`）：

- `E2E_ISOLATED=1`（由 isolated 包装器注入）
- `MODEL_API_KEY` 存在且非空白
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

- `live_provider_key_missing`：没有 Key。记 `not_run`，不要改 runner 去 skip-as-pass。`pnpm regression --live` 在此码上非零退出。
- `regression_unknown_flag`：未知 flag，退出码 2。
- `regression_required_script_missing`：必跑脚本不在 `package.json`。
- `fake_service_mode_forbidden`：有人打开了假服务开关。关掉再跑，不要删这条守卫。
- `e2e_isolation_required`：直接跑了 `pnpm e2e:prove`。必须用 `e2e:isolated`。
- 子进程 stdout/stderr 默认不进回执。失败时只看退出码、断言行和 `E2E_PROCESS_OUTPUT_WITHHELD` 字节计数。
