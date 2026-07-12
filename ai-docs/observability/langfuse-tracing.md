---
id: observability_langfuse_tracing
name: Langfuse 链路追踪集成方案
description: 用 Langfuse 为 LangGraph 面试编排、模型调用和报告生成做可追踪、可降级、合规脱敏的 tracing。
type: reference
scope: shared
level: guide
status: active
owner: observability
version: 1
tags:
  - observability
  - langfuse
  - tracing
  - langgraph
related:
  - ./README.md
  - ../architecture/ai/langgraph-blueprint.md
  - ../rules/ai/structured-output-and-safety.md
---

# Langfuse 链路追踪集成方案

> 说明（状态已更新）：`apps/` 与 `packages/` **已建立**。成本/token/延迟的**自库落地已接线**——`packages/ai-runtime` 的 `invoke` 关口每次调用把 `service/input_tokens/output_tokens/latency_ms` 写入 `ai_invocation_trace`(见 §「与业务追踪表的关系」)，且已有 `tracer-langfuse.ts` 把同一批标量转发 Langfuse generation（含 usage/latency）。**尚未接线**：本文 CallbackHandler(`@langfuse/langchain`) 形态的 graph 级 span 嵌套、`maskTraceIO()`、`compose.observability.yml` 自托管 Langfuse——这些属可选分析栈，见文末落地清单。SDK 用法已对照 Langfuse 官方文档（v3 JS SDK），实现前仍须按 `.claude/skills/langfuse` 的「文档先行」原则复核最新文档，不凭记忆写代码。

## 目标

在不改变现有架构约束的前提下，为 Meetwise 提供：

- 每次 graph run、节点、模型调用的可追踪链路。
- 自动成本、token、延迟统计。
- 失败、重试、降级、schema 校验失败的可观测信号。
- 会话级（一次模拟面试）聚合视图。
- 全程满足本仓库隐私红线，不泄露简历原文、面试全文、PII、密钥。

## 选型与依赖

| 选择 | 取值 | 原因 |
| --- | --- | --- |
| SDK | `@langfuse/core` + `@langfuse/langchain` | LangGraphJS 走 LangChain CallbackHandler，集成自动捕获 model/token/observation type，比手写埋点少代码、信息更全 |
| 接入点 | `packages/ai-graphs` 调用 graph 时注入 `CallbackHandler` | graph 是所有模型调用的唯一出口（见 `langgraph-blueprint.md`） |
| 部署 | `architecture/devops/local-demo-deployment.md` 的 `compose.observability.yml`（Langfuse 自托管或 hosted 二选一） | 与 OTel/Prometheus 并列为可选观测栈 |
| 开关 | `ai-runtime` 配置项，缺省可关闭 | Langfuse 不可用时不能阻断面试主链路（可降级原则） |

环境变量（只进 `*.env.example`，禁止提交真实密钥）：

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com   # 自托管或 us.cloud.langfuse.com 按需
LANGFUSE_TRACING_ENABLED=true                  # 缺省 false，可降级开关
```

## 接入方式（CallbackHandler）

LangGraph 调用时通过 `callbacks` 注入 handler，并用 `runName` / `tags` / `metadata` 写入业务维度。**不要把 handler 作为全局单例埋进 model-router 之外的地方**，trace 的拥有者是 graph run。

```typescript
import { CallbackHandler } from "@langfuse/langchain";

// 每次 graph run 构造一个 handler，绑定本次运行的业务维度
const langfuseHandler = new CallbackHandler();

await graph.invoke(input, {
  callbacks: [langfuseHandler],
  runName: `meetwise.${state.serviceType}`,        // 见下方命名约定
  tags: [state.serviceType, `graph:${graphName}`], // 可过滤维度
  metadata: {
    langfuseSessionId: state.threadId,             // = interviewResult.resultId
    langfuseUserId: state.userId,
    graphRunId: state.runtime.graphRunId,
    promptVersions: state.runtime.promptVersions,
  },
  configurable: { thread_id: state.threadId },     // LangGraph 恢复键，保持与 trace 一致
});

// 脚本/worker job 结束前必须 flush，否则事件可能丢失
await langfuseHandler.flushAsync();
```

要点：

- `sessionId = threadId = interviewResult.resultId`，让一次模拟面试的多轮 graph run 在 Sessions 视图聚合。这与 `langgraph-blueprint.md` 的 `threadId` 约定严格对齐。
- `thread_id`（LangGraph 恢复键）与 `langfuseSessionId`（trace 聚合键）来自同一个值，二者必须一致，便于「从 trace 跳回可恢复会话」。
- worker / 后台 report job 属于短生命周期进程，**退出前必须 `flushAsync()`**（见常见错误表）。

## 基线要求（每条 trace 必须满足）

| 要求 | 落地方式 |
| --- | --- |
| 模型名 | CallbackHandler 自动捕获 |
| token / 成本 | CallbackHandler 自动捕获；与 `state.runtime.costCentsEstimate` 交叉校验 |
| 可读 trace 名 | 用 `runName` 业务命名，禁止 `trace-1` 之类 |
| span 层级 | 每个 graph node 形成嵌套 span，定位慢/失败节点 |
| observation 类型 | 模型调用标记为 generation（集成自动处理） |
| 敏感数据脱敏 | 见下节，**这是硬约束** |
| 有意义的 input/output | 只记录用户消息、问题、评分结构，不把全部函数入参塞进 trace |

## 命名约定

| 维度 | 取值 |
| --- | --- |
| `runName` | `meetwise.resume_quiz` / `meetwise.special_interview` / `meetwise.behavior_interview` / `meetwise.career_path` / `meetwise.report` |
| span 名 | 与 graph node 同名：`parse_resume`、`generate_question`、`evaluate_answer`、`generate_report` 等 |
| `tags` | `serviceType`、`graph:<name>`、可选 `feature:<name>` |
| `metadata` | `langfuseSessionId`、`langfuseUserId`、`graphRunId`、`promptVersions`、`schemaVersion` |

## 隐私与脱敏（硬约束，优先级最高）

本节服从 `rules/ai/structured-output-and-safety.md` 与 `observability/README.md` 的隐私规则。Langfuse 会持久化 trace input/output，因此默认采集即视为可能落库，必须在进入 handler 前脱敏。

**禁止进入 Langfuse 的内容：**

- 简历原文、面试回答全文。
- 身份证、手机号、邮箱等 PII。
- API key、token、支付密钥。
- 完整 prompt（除非本地调试且已脱敏）。

**允许进入 Langfuse 的内容：**

- 输入 hash、长度、来源、敏感级别。
- `promptVersion`、`schemaVersion`、`graphName`、`nodeName`。
- model、token、cost、延迟。
- schema 校验结果、retry/fallback 次数。
- 脱敏后的错误摘要。
- 评分结构（分数、维度、枚举），但不含可定位个人的原文。

**落地手段：** 在 `packages/ai-graphs/shared` 提供 `maskTraceIO()`，统一对进入 trace 的 input/output 做脱敏；node 输出在交给 Langfuse 前先过 mask，再过业务 validator。生产环境关闭原文采集，仅本地调试可临时开启脱敏后的 prompt 记录。

## 与业务追踪表的关系

Langfuse 是观测层，不是事实来源。业务事实仍落 `ai_invocation_traces`、`ai_prompt_versions`、`ai_graph_runs`（见 `system-blueprint.md`）。**成本/token 已落自库并接线**：`ai_invocation_trace` 现带 `service/input_tokens/output_tokens/latency_ms` 列（migration 0011），`invoke` 每次调用写入——**成本源头真相在自库，Langfuse 关闭也不丢**，Langfuse 仅作分析/看板层。

- `graphRunId` 同时写入 Langfuse metadata 和 `ai_graph_runs`，作为两侧关联键。
- Langfuse 宕机或被关闭时，业务追踪表仍须独立可用——**Langfuse 不得成为业务链路的强依赖**。

## 失败与降级

- `LANGFUSE_TRACING_ENABLED=false` 或 handler 初始化失败时，graph 正常运行，仅丢观测。
- handler 异常不得向上抛断面试主链路；捕获并记脱敏告警。
- SSE 事件流（`question_ready`、`waiting_user`、`report_ready` 等）与 Langfuse 解耦，trace 失败不影响前端协议。

## 常见错误（来自 Langfuse 官方 skill）

| 错误 | 后果 | 修正 |
| --- | --- | --- |
| 脚本/worker 退出前不 `flushAsync()` | 事件丢失 | job 结束前必须 flush |
| 扁平 trace | 看不出哪个节点失败 | 每个 node 用嵌套 span |
| 泛化 trace 名 | 无法过滤 | 用 `meetwise.<serviceType>` |
| 记录敏感数据 | 隐私泄露 | 进 handler 前 `maskTraceIO()` |
| 不显式设置 input | 全部入参（含密钥/配置）进 trace | 只设相关 input |
| 在加载 env 前 import/初始化 | 凭证缺失 | 加载环境变量后再初始化 handler |

## 落地清单（待 `apps/`、`packages/` 建立后执行）

1. `packages/ai-graphs`：`pnpm add @langfuse/core @langfuse/langchain`。
2. `shared/`：实现 `createLangfuseHandler(state)` 与 `maskTraceIO()`。
3. 在 4 个 graph 的 invoke/stream 注入 handler，写入 runName/tags/metadata。
4. worker / report job 退出前 `flushAsync()`。
5. `ai-runtime`：接 `LANGFUSE_TRACING_ENABLED` 降级开关。
6. `compose.observability.yml`：接入 Langfuse（自托管或 hosted）。
7. golden task / graph 测试：断言「敏感字段不出现在 trace payload」。
8. 在 `*.env.example` 补 Langfuse 变量。
