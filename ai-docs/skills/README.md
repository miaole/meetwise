---
id: skills_index
name: 工作方法索引
description: Agent 执行任务时先读的技能入口；测试与变更后回归从 testing/ 开始。
type: skill
scope: shared
level: guide
status: draft
owner: qa
version: 1
---

# 工作方法（skills）

`ai-docs/skills/` 放**可执行配方**，不放产品定义。长期产品目标仍在 `product/`，硬约束在 `rules/`。测试技能整目录 `status: draft`，升格条件见 [testing/sop.md](./testing/sop.md)。

| 目录 | 何时读 |
| --- | --- |
| [testing/sop.md](./testing/sop.md) | 任何功能改动之后必须逐步执行的审核 → 测试 → 回归仪式（draft） |
| [testing/SKILL.md](./testing/SKILL.md) | 概述与铁律；不能替代 SOP |
| [testing/e2e-platform/README.md](./testing/e2e-platform/README.md) | HTTP E2E 平台 SOP（draft / PASS_WITH_GAPS）：目录合同、脱敏、失败分类、`pnpm e2e-platform:prove` |

空目录不表示能力已交付。当前只登记了测试技能；`ai/`、`shared/` 在有真实配方前不要占位。
