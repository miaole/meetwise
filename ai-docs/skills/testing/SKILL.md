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
- [E2E 平台 SOP](./e2e-platform/README.md)（draft / NOT_READY；`pnpm e2e-platform:check` / `prove` / `layout:prove` 可跑，不表示 live E2E READY）

总入口命令（**必跑顺序固定**，flag 可组合，省略的车道记 `not_run`，禁止 skip-as-pass）：

1. **always-on**（默认）：无 Key、无 Docker 的文档 / helper / 回执 / 架构 / api smoke，以及 `package.json` 里已存在的静态守卫
2. **`--core`**：行走骨架隔离门（需要 Docker / 临时 Postgres）
3. **`--live`**：真供应商 HTTP E2E；缺或空白 `MODEL_API_KEY` 必须非零退出

```bash
pnpm regression                 # 只跑 always-on
pnpm regression --core          # always-on 之后再跑行走骨架
pnpm regression --live          # always-on 之后再跑 HTTP E2E
pnpm regression --core --live   # 仍按 always-on → core → live
pnpm regression --dry-run       # 只打印计划，不执行
```

浏览器层不在本入口内：需先 `pnpm -C apps/web build` 再 `pnpm e2e:ui:isolated`。

## review/verify gate

`pnpm regression` is automation. **automation does not trust AI outputs.** A green command is not “the model said it is fine.”

- **review**: walk [post-change-review.md](./post-change-review.md). Unchecked items cannot be claimed reviewed.
- **verify**: exit codes and receipts only (schema then business validators). Not AI self-report, not a chat summary.
- **multi-round allowed**: review → verify → review again is allowed. A later failing gate reopens review; do not treat the first green as final.
- **fail-closed**: missing review/verify language, missing Key on `--live`, or a failed step exits non-zero.
- **no secrets**: do not print keys, résumés, answers, or prompts.
- **unverified AI path**: `pnpm e2e-static-guards:check` / `prove` refuse trusting unverified AI paths. A green static check is not provenance.

## 改本技能时

改配方、E2E harness 或 golden-tasks 仍走 `AGENTS.md` 生成前门禁。升格 `active` 的条件只写在 [SOP](./sop.md)。e2e-platform 保持 **draft / NOT_READY**，不随本页升格而变成 READY。不把 `relatedCommands` 或 `scoring:eval` 写成 covering；不把 planned golden-task 标成已通过。失败分类账本由 `pnpm e2e-helpers:prove` 覆盖，绿结果缺 `E2E_REVIEW_SUMMARY` 记 `opaque_pass`。

## 铁律（先读再跑）

- **不得默认信任** AI 写出的代码、测试或结论。先审核、再验证；鼓励自动化，必须多轮门禁（见 [ai-generated-review](../../rules/global/ai-generated-review.md)）。不提交密钥或敏感数据。
- 控制器/页面绿了不算业务完成。断言状态机落点、账本、隔离、终态事件。
- HTTP 全链路 E2E 是 **主层**：`e2e/full.e2e.ts` + `scripts/run-e2e.mjs`（fetch / SSE），入口 `pnpm e2e:isolated`。Playwright 是 **次层**，只覆盖 `pnpm e2e:ui:isolated` 的浏览器 cookie / 页面流。分层结论在 [test-strategy](../../testing/strategy/test-strategy.md) 与 [test-authoring](../../testing/conventions/test-authoring.md)。
- `run-e2e.mjs` 在 `E2E_ISOLATED=1` 且存在 `MODEL_API_KEY` 时才启动；假服务开关（`VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` / `ASR_FAKE` / `TTS_FAKE` / `EMBED_FAKE` / `RERANK_FAKE` / `MODEL_TEST_TRANSPORT_OVERRIDES` / `DASHSCOPE_TEST_TRANSPORT_OVERRIDES`）直接失败。静态守卫 `pnpm e2e-static-guards:check` 禁止 runner 漏掉该断言，并对证据/日志 helper（含 `e2e/helpers/` 自动发现）做密钥扫描（失败即关，报告只含路径和规则名，不回显命中值）。同一守卫拒绝信任 unverified AI path：核对 HTTP E2E 固定清单上的可执行合同（服务端 `questionIdentity` 必 throw、`await driveInterviewToTerminal(`、无证据不得写成 0 分）。通过 ≠ 出处已验证。允许多轮核对（multi-round verify），不得用对话摘要代替退出码与回执。
- 回执恒为 `releaseEvidence=false`。没有受信 runner、不可变对象存储和独立验签，就不能写发布通过。
- golden-tasks 第一批已建档；未映射到可跑门的条目状态必须是 `planned` 或 `unmapped`，禁止标 `passed`。附近 prove（`relatedCommands`）不是 covering；`scoring:eval` 不得写入 `mappedCommands`。`subject=ai-output`（GT-01..04）禁止 `mapped`。
- `pnpm generation-trust:prove` 检查本政策仍写在审核清单与回归入口；绿了也不等于「已完成」。
- **P0 fail-closed（文档门）：** 不默认信任 AI 代码或 AI 输出。审核与验证缺一即阻断；作者不得自签审核；多轮修改必须重开本门。禁止提交密钥。`gate: closed` ≠ runner 绿。
