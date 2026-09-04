---
id: meta_directory_boundaries
name: 目录职责边界
description: 定义 Meetwise ai-docs 一级目录职责，避免文档重复和落位混乱。
type: rule
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - meta
  - boundaries
---

# 目录职责边界

## 总原则

- 一个结论只维护一处。
- 业务语义、实现规则、执行脚本不要混在同一篇文档里。
- 需求说明和长期产品共识分开：本次做什么写 `requirements`，长期是什么写 `product`。
- 单次执行工单放 `.tmp`，不要提交到 `ai-docs`。

## 一级目录

| 目录 | 回答的问题 | 不放什么 |
| --- | --- | --- |
| `meta` | 这套知识怎么找、怎么用 | 业务正文、实现细节 |
| `product` | 业务是什么，为什么存在 | 单次迭代清单、DDL |
| `requirements` | 这次具体做什么 | 长期工程规则 |
| `architecture` | 技术上如何长期组织 | 本次任务 todo |
| `rules` | 长期稳定约束是什么 | 一次性讨论 |
| `skills` | 这类工作怎么做。测试仪式在 `skills/testing/sop.md` | 产品定义、测试策略正文 |
| `testing` | 怎么验证（策略、golden tasks、证据） | 实现正文、变更后操作步骤 |
| `delivery` | 怎么发布和复盘 | 需求原文 |
| `observability` | 怎么观察 AI 和系统质量 | 用户敏感数据 |
