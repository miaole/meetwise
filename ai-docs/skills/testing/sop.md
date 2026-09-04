---
id: skills_testing_sop
name: 变更后审核→测试→回归 SOP
description: 功能落地后、声称已验证前必须走完的仪式。status 保持 draft，直到有非文档改动的实跑记录且无过度声明。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ./SKILL.md
  - ./post-change-review.md
  - ./layer-selection.md
  - ./run-gates.md
  - ./regression-selection.md
  - ./honesty-rules.md
  - ./fail-closed-gate.md
  - ./e2e-platform/README.md
  - ../../testing/strategy/test-strategy.md
  - ../../meta/task-sop.md
---

# 变更后仪式：审核 → 测试 → 回归

**状态：`draft`。** draft 只限制对外宣称「测试流程已生产就绪」，**不减免任何步骤**。步骤可照做；本仪式尚未被一次非文档功能改动完整实跑证明。不得把「读过本文」或「`pnpm regression` 绿了」写成发布证据。

**生成物默认不可信。** 自动化重构 / 测试 / UI / 回归可以跑；未审核的生成代码或模型输出不得当成完成。**skip-as-pass 禁止。** 没有受信回执前 `releaseEvidence` 必须为 `false`。未走完审核第 0 节，**不得声称完成**，也不得标 READY。

**P0 收束公式**（不是另一套前置仪式）：走完下表后用 [fail-closed 门](./fail-closed-gate.md) 判定能不能写「本轮局部验证完成」。缺审核或缺验证即 `BLOCK`。多轮修改重开本门。本门是文档门；`pnpm generation-trust:prove` 只证明政策仍写在技能里，不是审核通过。

层定义、MVP 路径和伪验收禁令只维护在 [`testing/strategy/test-strategy.md`](../../testing/strategy/test-strategy.md)。命令与失败语义只维护在 [门禁目录](./run-gates.md)。触达面「必须跑哪些门」只维护在 [回归矩阵](./regression-selection.md)。HTTP harness 目录合同、脱敏与失败分类只维护在 [e2e-platform](./e2e-platform/README.md)（draft / NOT_READY）。本文件只规定**顺序、停步和记录**。

生成前的用例/测试门禁是另一条技能（仓库内 `spec-gate`）；本 SOP 是**改完之后**的仪式，二者不可互相替代。任务总流程仍看 [`meta/task-sop.md`](../../meta/task-sop.md) 的验证门。

## 何时启动

功能、契约、图、数据库、测试 harness，或会声称「已验证」的文档落地之后、写验证结论之前。

| 改动类型 | 怎么走 |
| --- | --- |
| 错别字且不声称重跑门 | 可记 `skipped:docs-typo`；仍不得写 E2E / prove 通过 |
| 实质性文档（策略、矩阵、技能、契约说明） | 至少跑默认 `pnpm regression`（含 `docs:check`）；禁止写 E2E / 业务 prove 已重跑 |
| 代码 / 契约 / 图 / 库 / harness | 下表 1–5 步；第 5 步用 [fail-closed 门](./fail-closed-gate.md) 收束 |

## 不可跳过的顺序

| 步 | 动作 | 详单（不在此重复） | 停步条件 |
| --- | --- | --- | --- |
| 1 审核 | 先勾「生成物默认不可信」，再勾范围 / 状态机 / AI / 隐私 / 选层 / 结论边界 | [变更后审核](./post-change-review.md) | 第 0 节或任一项「未查」→ 不得声称审核通过，也不得声称完成 |
| 2 选层 | 按改动性质选 unit / contract / prove / HTTP E2E / UI | [选测试层](./layer-selection.md) | 选错层冒充验收 → 本仪式失败 |
| 3 执行 | 先默认 `pnpm regression`（**仅 always-on 子集**），再按 diff 跑矩阵「必须」列；按需 `--core` / `--live` / UI | [门禁目录](./run-gates.md) + [回归矩阵](./regression-selection.md) | 见下方「执行停步」 |
| 4 出处 | 仅当碰到模型 / 评分 / 题面 / 报告 | [出处检查](./ai-provenance.md) | 答不出 operation 绑定时写「绑定未完成」 |
| 5 记录 | 用诚实模板写结论，并用 fail-closed 公式收束 | [诚实规则](./honesty-rules.md) + [fail-closed 门](./fail-closed-gate.md) | 缺 `commands` / `exit` / `liveE2E` / `review` / `verification`，裸 `review: passed`，或 `aiTrust=trusted`，或把绿回归写成发布 → `gate: blocked` |

入口命令只在 [概述](./SKILL.md) 与 [门禁目录](./run-gates.md) 维护。默认 `pnpm regression` **不等于**矩阵「必须」列，也不等于 CI `verify`。

## 执行停步

- **无 Docker / 临时 Postgres**：可跑默认 always-on；`--core`、隔离 prove、HTTP/UI E2E 记 `blocked:docker`，不得声称已跑。
- **无 `MODEL_API_KEY`**：不要执行 `pnpm regression --live` 或 `e2e:isolated`（脚本会非零退出）。记 `not_run:live_provider_key_missing`。`not_run` = **没发起** live 命令，不是 live 失败当通过。
- **有 Key 且触达 `apps/web`**：`--live` 只跑 HTTP `e2e:isolated`。浏览器层另跑 `pnpm -C apps/web build` + `pnpm e2e:ui:isolated`；未跑不得写 UI / cookie / 页面流通过。
- **`--core` 不是业务 prove 全集**：它只追加行走骨架（`db` / `runtime` / `graph` / `pipeline` / `api:validate`）。`interview:prove`、`commerce:prove` 等永远按矩阵追加。
- **命令非零**：修代码或记 `blocked`，不改 runner、不删假服务守卫、不当 skip-as-pass。
- **本地绿 ≠ CI 绿**：合并阻断以 `.github/workflows/ci.yml` 的 `verify` 列表为准。
- **任何「已验证」声明**必须附带诚实模板字段和实际命令列表。禁止只写「regression 绿了」。`releaseEvidence` 必须为 `false`。`pnpm regression --claim-done` / `--ready` 会 `regression_claim_done_forbidden`。

## 最低记录（写进任务说明，不进 `ai-docs`）

用诚实规则里的模板。至少包含：`commands`、逐条 `exit`、`liveE2E: ran | not_run:<reason>`、`releaseEvidence: false`。

## 本技能何时可以摘 draft

同时满足才允许把 **`ai-docs/skills/testing/` 下全部 skill 文档**（含本文件与 `SKILL.md`）的 frontmatter 同步改为 `active`，禁止只改一篇：

1. 一次**非纯文档**功能改动按上表走完，并留下命令与退出码。
2. 默认 `pnpm regression` **以及**该 diff 触达面的矩阵「必须」列退出 0；live 若未跑，说明里是 `not_run` 而不是通过。
3. 对抗式专家审计已闭合致命/高项（见 `meta/task-sop.md` §5）。
4. 没有把隔离回执、浏览器层或 planned golden-task 写成发布证据。

未满足前保持 `status: draft`。
