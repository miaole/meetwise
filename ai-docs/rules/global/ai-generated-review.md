---
id: rule_global_ai_generated_review
name: AI 产物必须审核并验证
description: 长期规则指针。P0 收束公式只维护在 skills/testing/fail-closed-gate.md。AI 生成的代码与输出不得默认信任；必须审核和验证；鼓励自动化、多轮门禁。禁止密钥与敏感数据入库。
type: rule
scope: global
level: must
status: active
owner: architecture
version: 2
tags:
  - p0
  - review
  - verification
related:
  - ../../skills/testing/fail-closed-gate.md
  - ../../skills/testing/sop.md
  - ../ai/structured-output-and-safety.md
  - ../../testing/strategy/test-strategy.md
  - ../../skills/testing/SKILL.md
  - ../../meta/task-sop.md
---

# AI 产物必须审核并验证

**不得默认信任**任何 AI 生成的代码、测试、文档、补丁或产品侧模型输出。生成不等于完成。必须先**审核**、再**验证**。

本文件是长期规则指针，**不是**第二套收束公式。关闭条件、作者不得自签、`UNTRUSTED` / `aiTrust` / `releaseEvidence` 只维护在 [`skills/testing/fail-closed-gate.md`](../../skills/testing/fail-closed-gate.md)。变更后步骤只走 [`skills/testing/sop.md`](../../skills/testing/sop.md)。

这与产品侧「模型输出双校验」是同一条不信任原则的两端：模型 JSON 进业务前要 schema + 业务校验（见 [structured-output-and-safety](../ai/structured-output-and-safety.md)）；agent 写出的代码和文档进仓库前要审核 + 门禁。

## 审核（review）

对照来源证据、用例、契约、状态机和本仓库规则读 diff。L2+ 先过专家 agent 审计（见 `meta/task-sop.md`），禁止把“看起来合理”或 AI 自评当审核。

## 验证（verification）

用可复跑命令证明，不靠聊天结论。分层与命令见 [test-strategy](../../testing/strategy/test-strategy.md) 与 [测试技能](../../skills/testing/SKILL.md)。

## 鼓励自动化，且必须多轮门禁

优先脚本化门禁，不要用口头 LGTM 替代。一轮绿不够：生成 → 审核 → 跑门 → 修 → **再跑受影响的门**，直到该改动要求的各层都过。

缺 Key 记 `not_run`，禁止 skip-as-pass。本地回执 `releaseEvidence=false`，不能写成发布通过。禁止提交或记录真实 `.env`、密钥、token、简历原文、面试录音、完整 prompt、支付秘密。
