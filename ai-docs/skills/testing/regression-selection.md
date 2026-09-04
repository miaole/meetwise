---
id: skills_testing_regression_selection
name: 回归选择矩阵
description: 按触达面选择必须重跑的隔离 prove 与 E2E，避免只跑无关门或漏掉面试/API/web/db。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./run-gates.md
---

# 回归选择矩阵

这是 [变更后 SOP](./sop.md) 第 3 步里的触达面清单。顺序与停步只看 SOP。默认 `pnpm regression` 只覆盖 always-on，**必须再按实际 diff 触达的目录加跑下表「必须」列**，不要凭感觉跳过面试/支付。

`必须` = 该面改动后没有回执不得合并到自己的完成声明。`建议` = 强相关但可用更小 prove 代替 live。`有 Key` = 本地/nightly，CI per-push 不跑。

| 触达路径 | 必须（无 Key） | 有 Key 时再跑 | 明确不够 |
| --- | --- | --- | --- |
| `e2e/`、`scripts/run-e2e*.mjs`、`scripts/local-e2e-receipt*` | `pnpm e2e-helpers:prove` `pnpm e2e-receipt:prove` `pnpm e2e-runner:prove` | `pnpm e2e:isolated` | 只改注释却声称全链路重跑 |
| `packages/db`、`packages/db/migrations` | `pnpm db:prove` `pnpm migrate:prove` `pnpm drift:prove`；相关业务 prove | 当前 schema 上重跑 `e2e:isolated` | 旧迁移回执（迁移数已变） |
| `apps/api` | `pnpm api:validate` `pnpm api:smoke` + 对应 `neg:*` | `e2e:isolated` | 只 `livez` 200 |
| `apps/worker`、`packages/ai-graphs` | `pnpm graph:prove` `pnpm interview:prove` 或被改图的 prove | `e2e:isolated` | 单测假模型质量 |
| `packages/ai-runtime` | `pnpm runtime:prove` 以及被改的 breaker/failover/invoke prove | `model:smoke` / nightly | 把 schema 失败当质量通过 |
| `apps/web` | `pnpm web:prove` | `pnpm e2e:ui:isolated`（需 `.next`） | 只打开落地页 |
| 面试 / 评分 / 报告 | `pnpm interview:prove` `pnpm scoring-integrity:prove` `pnpm report:prove` `pnpm turn-idempotency:prove` | HTTP E2E 主面试 + 岗位绑定会话 | 客户端自报分数 |
| 交易 / 额度 / OCR 计费 | `pnpm commerce:prove` `pnpm ocr:prove` `pnpm neg:commerce` | HTTP E2E 的下单/webhook/OCR 扣费段 | mock PSP |
| 简历 / 隐私 | `pnpm resume:prove` 及 erasure 相关 prove | HTTP E2E 文本+图片简历 | 把影子 `sql/` fixture 当生产 schema |
| B 端 / 投递 | `pnpm recruiter:prove` `pnpm neg:bend` | HTTP E2E 的 RLS + finalize 段 | 长度断言代替 candidate id |
| RAG / 题库 | 对应 `rag*:` / `qbank*:` prove | `retrieval:benchmark` 单独记账 | 把 fixture 覆盖率写成 Recall |

有 Key 且触达面试 / API / db 时再跑 `pnpm regression --live`（仅 HTTP）。触达 `apps/web` 时浏览器门是 `e2e:ui:isolated`，不包含在 `--live` 里。无 Key 不要发起 `--live`，写 `not_run:live_provider_key_missing`。

## 与 `verify:e2e-performance` 的区别

`pnpm verify:e2e-performance` 是本机全量子集（含 live HTTP/UI、性能、一长串 RAG prove）。它慢、要 Key、回执仍是 `releaseEvidence=false`。日常改动用本矩阵，不要默认复制那条长命令来假装更严格。
