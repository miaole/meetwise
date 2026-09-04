---
id: skills_index
name: 工作方法索引
description: Agent 执行任务时先读的技能入口；测试与变更后回归从 testing/ 开始。
type: skill
scope: shared
level: guide
status: active
owner: qa
version: 1
---

# 工作方法（skills）

`ai-docs/skills/` 放**可执行配方**，不放产品定义。长期产品目标仍在 `product/`，硬约束在 `rules/`。

| 目录 | 何时读 |
| --- | --- |
| [testing/SKILL.md](./testing/SKILL.md) | 任何功能改动之后：审核 → 选层 → 跑门 → 回归 → 出处检查 |

空目录不表示能力已交付。当前只登记了测试技能；`ai/`、`shared/` 在有真实配方前不要占位。
