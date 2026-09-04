---
id: skills_testing_run_gates
name: 测试门禁目录
description: 隔离 prove、HTTP E2E、浏览器 E2E、性能门的真实命令、依赖和失败语义。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./regression-selection.md
---

# 怎么跑门禁

这是 [变更后 SOP](./sop.md) 第 3 步的命令真相。命令清单只维护在本文件；顺序与停步只维护在 SOP。所有会重建 schema 的命令必须走 `scripts/run-e2e-isolated.mjs`（临时 `meetwise-e2e-*` 容器）。不要对开发库跑这些目标。

`package.json` 别名：`pnpm regression:core` = `pnpm regression --core`；`pnpm regression:live` = `pnpm regression --live`。支持 `--core` / `--live` / `--dry-run`。`--claim-done` / `--ready` / `--done` 会 `regression_claim_done_forbidden`。其它 flag 会 `regression_unknown_flag`。

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

默认 **always-on**（`scripts/run-post-change-regression.mjs` 的 `ALWAYS_ON_REQUIRED`）：`docs:check`、`generation-trust:prove`、`golden-tasks:check`、`golden-tasks:prove`、`e2e-platform:check`、`e2e-platform:prove`、`e2e-platform:layout:prove`、`e2e-helpers:prove`、`e2e-receipt:prove`、`e2e-runner:prove`、`e2e-static-guards:check`、`e2e-static-guards:prove`、`e2e-parity:check`、`e2e-parity:prove`、`arch`、`api:smoke`。其中任一条在 `package.json` 缺失 → 非零退出（fail-closed）。`generation-trust:prove` 只证明政策仍写在审核清单与回归入口，不证明 diff 已人工审完。`golden-tasks:prove` 证明登记检查本身 fail-closed，不把 `planned` / `partial` 升成 `mapped`。`e2e-platform:check` 锁 helpers / 场景 / `run-e2e*` 目录；`e2e-platform:prove` 是 5 条命名静态守卫；`e2e-platform:layout:prove` 证明目录检查对种植违规非零，三者不可对调。`e2e-static-guards:check` / `prove` 锁假服务列表、密钥扫描失败即关、以及 unverified AI path 拒绝合同。删除 `e2e/` 用例、削弱 `expect` / `A(...)` 或下调 floors 会在 `e2e-parity:check` 红；合法削减见 [`testing/e2e-parity-baseline.md`](../../testing/e2e-parity-baseline.md)。AI 改过的测试 diff 在 parity + 审核完成前默认不可信。

若 `package.json` 里还有这些脚本，会自动接上（没有则跳过，不记通过）：`public-text-policy:prove`、`quality:traceability:prove`、`provider-egress:prove`、`public-preview-write:prove`、`public-preview-write-gate:prove`、`interview-answer-submission:prove`、`adaptive-length:prove`、`scor-00-honesty:prove`、`model-op01:prove`。`quality:governance:check` 仍是 EXEC-00 静态治理门，不挂进 always-on：历史记录引用已删除路径时它会红，不能当成变更后烟雾。入口自身的契约用 `pnpm regression:prove` 验证，不挂进 always-on，避免自举循环。

这**不是** [回归矩阵](./regression-selection.md) 的「必须」列，也不含 `interview:prove` / `commerce:prove` 等业务 prove。缺 Docker 不能假装隔离 prove 已跑。

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

`--core` 在 always-on **之后**再跑 `CORE`：`db:prove`、`runtime:prove`、`graph:prove`、`pipeline:prove`、`api:validate`。它仍不是业务 prove 全集。

CI `verify` 与 always-on **不是同一集合**。`.github/workflows/ci.yml` 的 `verify` 含目录三入口、静态守卫、parity、公开文案、provider-egress、`arch`，以及后续隔离 prove；**不含** `generation-trust:prove`、`golden-tasks:*`、`e2e-helpers:prove`、`e2e-receipt:prove`、`e2e-runner:prove`。合并阻断以 CI 列表为准；变更后最小集仍是本文件的 always-on。CI 绿 ≠ `pnpm regression` 绿。不另加云部署 job。

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
# 或（先 always-on，再 HTTP E2E）
pnpm regression --live
```

硬条件（`scripts/run-e2e.mjs`）：

- `E2E_ISOLATED=1`（由 isolated 包装器注入）
- `MODEL_API_KEY` 存在且非空白
- `VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` / `ASR_FAKE` / `TTS_FAKE` / `EMBED_FAKE` / `RERANK_FAKE` / `MODEL_TEST_TRANSPORT_OVERRIDES` / `DASHSCOPE_TEST_TRANSPORT_OVERRIDES` 未开启（`scripts/e2e-fake-service-flags.mjs`）

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

失败必须带封闭分类，禁止只报一句 `E2E 失败` / `e2e failed`。helpers 与 runner 写出一行：

`E2E_FAILURE class=<class> code=<code>`

`class` 只有这 7 个（常见 E2E 平台的分层归属，不是产品错误码）：

| class | 何时用 |
| --- | --- |
| `api` | HTTP API 进程/请求处理 |
| `worker` | 后台 worker / 图执行 / 终态超时 |
| `db` | 库未就绪、迁移失败、连接 |
| `provider` | 缺 live Key、假服务开关、第三方语音/视觉 |
| `capability` | 隔离门未开等 harness 能力不足 |
| `data_or_permission` | 鉴权、额度、RLS、缺失服务端身份 |
| `frontend` | 浏览器 / Playwright / web 未就绪 |

`code` 是 `[a-z][a-z0-9_]{0,79}` 标识符，禁止 `e2e_failed` / `failed` / `unknown`。行里不写密钥、prompt、答案或连接串。隔离 HTTP 回执在失败时可带 `failureClass`（同上 7 值）；这与 isolated prove 的 `proofSummary.failureClass` 不是同一套词表。

AI/系统终态（`report_unavailable`、`assessment_unavailable`、押题/诊断 `*_unavailable`、以及对应的 `*_ready`）必须另写：

`E2E_REVIEW class=<class> code=<code>`

收口一行 `E2E_REVIEW_SUMMARY count=N`（N≥1）。**缺 review 摘要的 exit 0 是 opaque pass，隔离包装器按 `capability/opaque_pass` 失败。** 回执的 `reviewLedger` 只存 `{class,code}`，不存原文。`report_unavailable` 仍可以是断言通过（舱壁），但必须可复核，不能只当绿。

- `E2E_FAILURE class=provider code=live_provider_key_missing` 或 `live_provider_key_missing`：没有 Key。记 `not_run`，不要改 runner 去 skip-as-pass。`pnpm regression --live` 在此码上非零退出。
- `regression_unknown_flag`：未知 flag，退出码 2。
- `regression_required_script_missing`：必跑脚本不在 `package.json`。
- `E2E_FAILURE class=provider code=fake_service_mode_forbidden` 或 `fake_service_mode_forbidden`：有人打开了假服务开关。关掉再跑，不要删这条守卫。`pnpm e2e-static-guards:check` 会静态核对 runner 仍拒绝同一份列表，并对证据/日志 helper 做密钥扫描（失败即关，不回显命中值）。同一守卫拒绝信任 unverified AI path（本地造题号、客户端评分、无证据写成 0 分）；允许多轮核对（multi-round verify），不得用对话摘要代替退出码与回执。
- `E2E_FAILURE class=capability code=e2e_isolation_required`：直接跑了 `pnpm e2e:prove`。必须用 `e2e:isolated`。Runner 抛长码；`classifyE2EFailure` 入账时可能写成短码 `isolation_required`（legacy alias），不要把短码当 runner 合同。
- 子进程 stdout/stderr 默认不进回执。失败时只看退出码、分类行、断言行和 `E2E_PROCESS_OUTPUT_WITHHELD` 字节计数。
