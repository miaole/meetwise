---
id: observability_langfuse_tracing
name: Langfuse v5 脱敏链路追踪
description: 使用 Langfuse v5 OpenTelemetry 对 Agent 图做根、节点、模型三级脱敏观测；观测不参与业务决策。
type: reference
scope: shared
level: guide
status: active
owner: observability
version: 2
related:
  - ../architecture/ai/agent-observability-evaluation-runtime.md
  - ../requirements/use-cases/agent-observability-evaluation.md
  - ../rules/ai/structured-output-and-safety.md
---

# Langfuse v5 脱敏链路追踪

## 已实现边界

运行时位于 `packages/ai-runtime/src/langfuse-v5.ts`，使用 `@langfuse/otel` 和 OpenTelemetry（开放遥测）SDK，不再使用旧的 `trace-create/generation-create` batch ingestion（批量写入协议）。Worker（后台执行进程）只在 `LANGFUSE_TRACING_ENABLED=true` 且下列配置完整时加载它：

```bash
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_BASE_URL=https://cloud.langfuse.com
LANGFUSE_CORRELATION_SECRET=   # 至少 32 随机字节，专用于 HMAC（带密钥哈希）伪名化
LANGFUSE_TRACING_ENABLED=true
```

`LANGFUSE_HOST` 仅为历史兼容别名；它和 `LANGFUSE_BASE_URL` 同时存在却不一致会拒绝启动。地址必须是 HTTPS（安全超文本传输协议），缺少任一凭据、开关值非法或缺少关联密钥时均 fail-closed（拒绝观测器初始化），不会伪装成“已经连接”。关闭开关时业务走 no-op（空操作）观察器，网络发送为 0。

## 可外送字段

一个自适应面试图使用如下层级：

```text
meetwise.graph.adaptive-interview (agent)
└─ meetwise.node.plan | decide | genQuestion | awaitAnswer | evalAnswer | conclude (span)
   └─ meetwise.model.<service> (generation)
```

根节点只写 `phase/release/graphRunRef/ownerRef/threadRef`；节点只写 graph、node、turn、stateVersion、release 和 outcome；模型节点只写 service、outcome、attempt、latencyMs、inputTokens、outputTokens、sourceCount、retrievalCount、topRetrievalScore 及三类 HMAC 伪名。`graphRunRef`、`ownerRef`、`threadRef` 和 `invocationRef` 都来自 `LANGFUSE_CORRELATION_SECRET`，不是业务原始标识。

绝不外送：问题、答案、简历、音频/转写、完整 prompt（提示词）、评论、来源原文、原始 owner/thread/idempotency key（幂等键）、答案 SHA-256（安全散列）、PII（个人可识别信息）或密钥。导出器仅允许 `meetwise.*` span，禁止意外把第三方库的上下文导出；媒体上传关闭。

## 故障与指标

观测是旁路：它不能改变扣点、评分、招聘排序、报告、SSE（服务器推送事件）或图路由。启动后暴露下列低基数 Prometheus（普罗米修斯监控系统）指标：

| 指标 | 标签 | 含义 |
| --- | --- | --- |
| `langfuse_tracing_state` | `state=disabled|enabled|flush_failed` | 配置和最近一次排空状态 |
| `langfuse_export_failures_total` | `operation=flush` | 明确捕获到的排空失败次数 |

Worker 每 5 秒排空一次，收到 SIGTERM（终止信号）时与消费者一起优雅排空。排空失败只增加指标；不会终止用户业务。需要注意：外部平台可用性仍需真实项目 smoke（冒烟测试）和告警演练验证，不能只依赖单元测试声明已送达。

## 隔离与真实验证

所有 isolated E2E（端到端）包装器会删除 **所有** `LANGFUSE_*` 环境变量；因此测试不可能污染真实项目。真实 Langfuse 项目只允许由受保护分支的合成数据任务写入。建议的最小验收顺序：

1. 运行 `pnpm langfuse-eval:prove`，检查配置、120 条离线目录与在线 10% 上限。
2. 运行 `pnpm langfuse:datasets:verify`，只读确认四个托管合成数据集的 120 个 item（条目）与冻结 manifest（清单）逐项一致。它只证明传输/版本一致性，不会创建 Experiment（实验）或质量分数。
3. 设置本地忽略的关联密钥后，运行 `LANGFUSE_SYNTHETIC_TRACE_SMOKE_APPLY=1 pnpm langfuse:synthetic-trace:smoke`。它以固定合成标记写入、按 trace ID（追踪标识）读回 `root → node → generation`，确认原始标记命中为 0，再删除自己的 trace；不输出标识、端点或服务端诊断。
4. 故意使测试项目地址不可达，确认业务断言不变而 `langfuse_export_failures_total` 增长。
5. 任何真实 trace 发现的问题，先走脱敏、双盲标注、仲裁，再进入冻结回归集；不能直接把 trace 原文存入数据集。

离线与在线质量评测的切分、数据集版本、10% 分层抽样和人工晋升流程见 [Agent 观测、评测与回归运行时](../architecture/ai/agent-observability-evaluation-runtime.md)。
