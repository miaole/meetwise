---
id: skills_testing_fail_closed_gate
name: AI 产物默认不可信（fail-closed）
description: P0 文档门。AI 写出的重构、测试、UI、文档默认不可信。必须审核且验证都通过才可收束；缺一即阻断。允许多轮。禁止密钥。非 runner 门。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./sop.md
  - ./post-change-review.md
  - ./honesty-rules.md
  - ../../rules/ai/structured-output-and-safety.md
---

# AI 产物默认不可信（fail-closed）

**P0 文档门，不是 runner 门。** 必须先走完 [SOP](./sop.md) 第 1–4 步；本文件只做第 5 步收束，不能代替选层或回归矩阵。`pnpm docs:check` / `pnpm regression` / `pnpm generation-trust:prove` 绿了、填完模板，都不等于本门关闭。`generation-trust:prove` 只证明政策仍写在技能与回归入口，不证明 diff 已审完。机械执行仍走 SOP 与 [门禁目录](./run-gates.md)。重构 / 测试 / UI / 回归必须自动化跑命令。

**P0 行为约束 ≠ skill `active`。** 本目录 `status: draft` 只限制宣称「测试流程已生产就绪」，不减免本门公式。

运行时模型输出的 schema / 业务双校验只维护在 [`structured-output-and-safety.md`](../../rules/ai/structured-output-and-safety.md)。命令、回归语义、诚实模板正文只维护在 SOP / run-gates / honesty-rules。本文件只维护：**默认态、公式、谁能签审核、禁止清单**。

默认态是 **`UNTRUSTED`**。本会话或本 PR 里任何 AI 生成/改写的重构、测试、UI、文档、脚本，在本门关闭前不得写成「本轮局部验证完成」。更不得单独写「已验证 / 可合并 / 发布」。

## 门公式（缺一即阻断）

```text
gate: closed  = 审核通过 ∧ 验证通过 ∧ 无密钥 ∧（若触达模型/评分/题面/报告：出处已核）
gate: blocked = 其余一切
```

关闭后只允许写成：**本轮局部验证完成（`releaseEvidence: false`，非 CI `verify`，非发布）**。禁止不带限定语的「已验证」「可合并」。`aiTrust` 即使 `gate: closed` 也不得写 `trusted`。

缺审核、缺验证、带密钥，都是 **fail-closed**：`gate: blocked`。不得把缺口改写成 `skipped` / `not_run` 当通过。`not_run:<reason>` 只用于「没发起该命令」，不能顶替 `gate: closed`。

## 审核通过（禁止作者自签）

对照真实 diff 勾 [变更后审核](./post-change-review.md)。「我写的所以没问题」不算。

必须满足其一，否则 `review: blocked:author_only`：

1. **非作者**：人工，或**不同 run / 不同 bcId** 的 agent，逐项勾完。记录 `review: passed:<reviewerId>`。
2. **同 run 第二镜头**：作者会话不得写 `review: passed`。必须派出对抗式审核（`expert-audit` 或同等），留下 fix-list（可在 `.tmp`，不进 `ai-docs`）；致命/高项闭合后才可写 `review: passed_adversarial`，并写 fix-list 路径。

同 orchestrator 自派子 agent 后立刻自填 `passed` = `blocked:author_only`。作者只可填 `UNTRUSTED`、待审清单、`blocked:author_only` 或（有留痕时）`passed_adversarial`。

## 验证通过（必须跑命令）

验证 = SOP 第 2–3 步的**实跑**，不是读 diff。四条面不能不跑（命令仍只在 run-gates / 回归矩阵）：

| 面 | 不能不跑 | 仍不可信 |
| --- | --- | --- |
| 重构 | 有 diff 就按所选层跑 | 「只是重构」免测 |
| 测试 | AI 新写/改过的测试必须被执行；失败先修 | 测试文件在、或 AI 说会过 |
| UI | 触达 `apps/web`：必须 `web:prove`，加上 `e2e:ui:isolated` **或** 真实浏览器点路径；两者都没跑则 `verification: blocked:ui` 或 `not_run:<reason>`，不得 `passed` | 单张截图 |
| 回归 | 默认 `pnpm regression` + 矩阵必须列 | 默认回归绿 = live / 发布 |

`verification` 只允许 `commands_ok`（须附 `commands` + 逐条 `exit`，含矩阵必须列）或 `blocked:<gap>`。禁止单独写 `verification: passed`。AI 新/改测试须在审核里写明断言意图；用这些测试自己证明自己不够，还要跑该触达面既有 prove。

触达模型 / 评分 / 题面 / 报告时，[出处检查](./ai-provenance.md) 未核 → `blocked:provenance`。

无 Key 时不要发起 `--live` / `e2e:isolated`。

## `aiAuthored` 怎么填

- 本会话或本 PR 出现过 AI 生成 diff → 至少 `mixed`；全是 AI 写的 → `yes`。
- 只有 `no` 且能指出非 AI 证据（人工提交说明）才允许 `aiAuthored: no`。否则 `BLOCK`。

## 多轮

任何新 diff → 回到 `UNTRUSTED`。上一轮勾选和退出码作废。多轮是预期路径。

收束字段（模板正文在 [诚实规则](./honesty-rules.md)）：`aiAuthored`、`aiTrust`、`review`、`verification`、`rounds`、`secrets`。

`aiTrust` 在关闭前只能是 `untrusted` 或 `blocked:<gap>`。

## 密钥

真实 `.env`、API Key、token、支付密钥、简历/录音原文出现在 diff、日志、回执或诚实模板里 → `secrets: leaked` → `BLOCK`。模板的 `commands` / `receipts` 只写占位名与退出码，不粘贴值。

## 禁止

1. 默认把 AI 代码、测试、UI 或书面结论当成正确。
2. 用「测试绿了」代替审核，或用「我审过了」代替跑命令。
3. 作者自签 `review: passed`，或不经第二镜头写 `passed_adversarial`。
4. 用 AI 给自己的报告 / 测试 / UI 打分当作验证。
5. 新 diff 之后沿用旧轮次通过记录。
6. 为绿删测试、关守卫、提交密钥、或把失败改写成 skip-as-pass。
7. 把 `gate: closed` 或默认 `pnpm regression` 绿写成 CI `verify`、发布证据或 `aiTrust: trusted`。
8. 同会话自签 `review: passed`（无 `<reviewerId>` 或无 adversarial 留痕）。
