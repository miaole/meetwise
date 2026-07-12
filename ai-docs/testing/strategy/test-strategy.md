---
id: testing_strategy
name: 测试策略
description: Meetwise 的单元、契约、集成、E2E 和 AI 评测策略。
type: testing
scope: shared
level: policy
status: active
owner: qa
version: 1
tags:
  - testing
  - strategy
---

# 测试策略

## 分层

| 层 | 工具 | 目标 |
| --- | --- | --- |
| unit | Vitest/Jest | 纯函数、node、validator、domain policy |
| contract | 共享 zod4 schema + schema tests | 前后端接口不漂移 |
| integration | Supertest + Testcontainers | API + DB + Redis |
| graph | deterministic fixtures + fake model | LangGraph 状态、分支、恢复 |
| e2e | Playwright | 用户主链路 |
| ai eval | golden tasks | 模型输出质量、结构、事实一致性 |
| security | 静态扫描 + 日志检查 | 密钥、PII、XSS、越权 |

## MVP 必测路径

- 登录 demo 用户。
- 上传/选择简历。
- 输入岗位/JD。
- 生成押题。
- 查看押题报告。
- 开始模拟面试。
- 回答一轮。
- 暂停/恢复。
- 结束并生成报告。
- 重启服务后恢复未完成会话。
- 权益扣减和失败退款。

## AI Golden Tasks

第一批 golden tasks：

1. 前端开发岗位 + 有项目简历 -> 生成 8-12 个问题，包含项目深挖。
2. 回答过短 -> 报告应指出表达不足，而不是给高分。
3. JD 要求 React/Next.js，简历缺 Next.js -> 能力差距必须出现 Next.js。
4. 用户回答“不会” -> 追问策略应转为引导，不应幻觉用户掌握。
5. 模型输出非法 JSON -> validator 拒绝并重试。

## 禁止伪验收

- 只断言 HTTP 200。
- 只打开页面不走流程。
- 只用 mock model 证明生产模型质量。
- 只凭 AI 自评说报告合理。
- 只测 happy path 不测失败退款和重复请求。

