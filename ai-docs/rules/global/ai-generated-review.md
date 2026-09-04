---
id: rule_global_ai_generated_review
name: AI 产物必须审核并验证
description: P0：AI 生成的代码与输出不得默认信任，必须经过审核和验证；鼓励自动化、多轮门禁。禁止密钥与敏感数据入库。
type: rule
scope: global
level: must
status: active
owner: architecture
version: 1
tags:
  - p0
  - review
  - verification
related:
  - ../ai/structured-output-and-safety.md
  - ../../testing/strategy/test-strategy.md
  - ../../skills/testing/SKILL.md
  - ../../meta/task-sop.md
---

# AI 产物必须审核并验证（P0）

**不得默认信任**任何 AI 生成的代码、测试、文档、补丁或产品侧模型输出。生成不等于完成。必须先**审核**、再**验证**，两步都过才能写“已完成 / 已验证”。

这与产品侧「模型输出双校验」是同一条不信任原则的两端：模型 JSON 进业务前要 schema + 业务校验（见 [structured-output-and-safety](../ai/structured-output-and-safety.md)）；agent 写出的代码和文档进仓库前要审核 + 门禁。

## 审核（review）

对照来源证据、用例、契约、状态机和本仓库规则读 diff。L2+ 先过专家 agent 审计（见 `meta/task-sop.md`），禁止把“看起来合理”或 AI 自评当审核。

审核要能回答：这段改动抓的是哪条需求、会破坏哪条不变量、缺了哪条负向断言。答不出 → 未审核。

## 验证（verification）

用可复跑命令证明，不靠聊天结论。分层与命令见 [test-strategy](../../testing/strategy/test-strategy.md) 与 [测试技能](../../skills/testing/SKILL.md)。

## 鼓励自动化，且必须多轮门禁

优先脚本化门禁，不要用口头 LGTM 替代。一轮绿不够：生成 → 审核 → 跑门 → 修 → **再跑受影响的门**，直到该改动要求的各层都过。

最低轮次（按触达面裁剪，不得跳过已触达的层）：

1. 静态 / 文档：`pnpm docs:check`（以及本次改到的契约/架构门）
2. 确定性 prove：行走骨架或触达面的隔离 prove
3. 业务全链路：有 Key 时 `pnpm e2e:isolated`（HTTP fetch/SSE 主层）
4. 浏览器：仅当改到 cookie / 页面 / middleware 时 `pnpm e2e:ui:isolated`
5. 模型质量：仅当改到评分/题面/报告时走 golden-tasks / eval，禁止 fake 冒充

缺 Key 记 `not_run`，禁止 skip-as-pass。本地回执 `releaseEvidence=false`，不能写成发布通过。

## 禁止

- 默认信任 AI 代码或输出（“模型写的所以对”“AI 说测试过了”）。
- 用 AI 自评、只断言 200、只开页面、只 happy path 代替验证。
- 把一轮门禁绿写成所有层都过。
- 提交或记录真实 `.env`、密钥、token、简历原文、面试录音、完整 prompt、支付秘密。文档和示例只用 `*.env.example` 与占位符。
