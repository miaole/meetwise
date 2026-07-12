---
id: template_task_harness
name: Task Harness 模板
description: AI 生成代码前用于锁定需求、证据、边界、契约和验证的任务执行单。
type: template
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - template
  - harness
---

# Task Harness: <任务名称>

## 0. 基本信息

| 项 | 内容 |
| --- | --- |
| task_id | <task-id> |
| 创建时间 | <YYYY-MM-DD HH:mm> |
| 工作区 | <repo/path> |
| 任务类型 | product / frontend / backend / ai-graph / db / test / devops |
| 当前状态 | draft / blocked / approved_to_implement / done |

## 1. 来源证据

| source_id | 来源 | 结论 | 证据等级 |
| --- | --- | --- | --- |
| SRC-001 | 用户原话/PRD/代码/接口/设计 | <结论> | E0/E1/E2/E3 |

## 2. 明确范围

本次做：

- <item>

本次不做：

- <item>

禁止改动：

- <item>

## 3. 领域对象和状态

| 对象 | 影响 | 状态变化 |
| --- | --- | --- |
| <domain> | <create/update/read/delete> | <none/state transition> |

## 4. 接口契约

| 接口 | 方法 | 请求 | 响应 | 错误码 |
| --- | --- | --- | --- | --- |
| `/api/...` | POST | <schema> | <schema> | <codes> |

## 5. 数据库影响

| 表 | 变化 | 索引/约束 | 回滚 |
| --- | --- | --- | --- |
| <table> | <none/create/update> | <constraints> | <rollback> |

## 6. AI Graph 影响

| graph | node | state | output schema | fallback |
| --- | --- | --- | --- | --- |
| <graph> | <node> | <state> | <schema> | <strategy> |

## 7. 测试计划

| 层 | 用例 | 断言 |
| --- | --- | --- |
| unit | <case> | <assertion> |
| contract | <case> | <assertion> |
| e2e | <case> | <assertion> |
| ai eval | <case> | <assertion> |

## 8. 验证命令

```bash
<command>
```

## 9. 阻塞问题

| 问题 | 影响 | 需要谁确认 |
| --- | --- | --- |
| <question> | <impact> | <owner> |

## 10. 执行授权

| 结论 | 原因 |
| --- | --- |
| blocked / approved_for_spike / approved_to_implement | <reason> |

