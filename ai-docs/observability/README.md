---
id: observability_readme
name: 可观测性入口
description: Meetwise 系统、AI、Graph、Prompt、成本和质量观测入口。
type: reference
scope: shared
level: guide
status: active
owner: observability
version: 1
tags:
  - observability
---

# 可观测性入口

Meetwise 需要同时观察系统质量和 AI 质量。

## 子文档

- `observability-strategy.md`：**策略主文**——三支柱(logs/metrics/traces)落地、唯一关联键、按构造脱敏、关键路径 SLO 与错误预算、各故障模式的优雅降级与快速恢复 runbook、告警分层。把"零业务数据丢失·优雅降级·快速恢复"做成可执行规范。
- `langfuse-tracing.md`：用 Langfuse 为 LangGraph 编排和模型调用做链路追踪、成本统计和合规脱敏的集成规范。

> 分工：本 README 持有**指标目录**(下方系统/AI/产品/Prompt 指标清单)；`observability-strategy.md` 持有**策略**(SLO/降级/恢复/告警)；`langfuse-tracing.md` 持有 **AI 链路追踪集成**。

## 系统指标

- API latency
- API error rate
- DB query latency
- worker queue latency
- payment callback success/failure
- entitlement consistency

## AI 指标

- graph run count
- graph run success/failure
- checkpoint restore count
- model call latency
- token usage（**已落自库**：`ai_invocation_trace.input_tokens/output_tokens`，`invoke` 关口每调用写入）
- estimated cost（源头真相在 `ai_invocation_trace`，不依赖 Langfuse；Langfuse 为分析层）
- schema validation failure rate
- report generation failure rate
- retry/fallback count

## 产品指标

- 简历上传成功率
- 押题完成率
- 模拟面试开始率
- 模拟面试完成率
- 报告查看率
- 用户复训率
- 权益购买/消耗转化

## Prompt 质量

需要记录：

- promptVersion
- schemaVersion
- graphName
- nodeName
- golden task pass/fail
- 用户反馈
- 人工标注问题

## 隐私规则

长期观测报告不得保存简历原文、面试全文、密钥、支付信息或未脱敏 PII。

