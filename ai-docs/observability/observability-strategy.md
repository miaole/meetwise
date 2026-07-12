---
id: observability_strategy
name: 可观测性策略（SLO·降级·恢复·脱敏落地）
description: Meetwise 三支柱(logs/metrics/traces)落地、关联键、按构造脱敏、关键路径 SLO 与错误预算、各故障模式的优雅降级与快速恢复 runbook、告警分层。把"零业务数据丢失·优雅降级·快速恢复"做成可执行规范。
type: reference
scope: shared
level: spec
status: active
owner: observability
version: 1
related:
  - ./README.md
  - ./langfuse-tracing.md
  - ../architecture/backend/module-boundaries.md
  - ../architecture/backend/data-model.md
  - ../rules/global/status-machine.md
  - ../architecture/ai/agent-runtime.md
---

# 可观测性策略（SLO · 降级 · 恢复 · 脱敏落地）

> 本文是「生产高可用」目标的可执行落地：目标校准为**零业务数据丢失 + 优雅降级 + 快速恢复**（非字面 uptime）。
> 分工：[`README.md`](./README.md) 持有指标目录；[`langfuse-tracing.md`](./langfuse-tracing.md) 持有 AI/Graph 链路追踪集成；**本文持有策略**——三支柱落地、关联键、按构造脱敏、SLO/错误预算、降级+恢复 runbook、告警。一个结论一个地方。

---

## 0. 核心立场：系统**因设计而可观测**，不是事后补日志

Meetwise 的状态全部落持久层（`interview` 状态机、`interview_event` 有序账本、`ai_graph_run` checkpoint、`ai_invocation_trace`、`consumption_record`/结算 outbox）。**可观测性读这些已持久的事实,自己不持有业务状态**——与「SSE 不拥有业务状态」同一原则。

推论：**事件账本即审计线索即恢复源**。任何"出了什么事/现在到哪了/怎么续上"的问题,答案都在持久状态里,可重放,不依赖进程内存或日志是否恰好打了。这是"快速恢复"的地基。

---

## 1. 三支柱与唯一关联键

| 支柱 | 用途 | 工具 |
|---|---|---|
| **Logs** | 离散事件/错误,结构化 JSON | `pino`（`@meetwise/observability`,脱敏 by construction,见 §2） |
| **Metrics** | 聚合趋势/SLO/告警 | OpenTelemetry metrics → Prometheus/云监控（指标目录见 README） |
| **Traces** | 跨服务/跨节点因果链 + AI 成本 | OTel traces（系统）+ Langfuse（Graph/模型,见 langfuse-tracing）。**成本/token 真相已落自库**：`ai_invocation_trace` 现带 `service/input_tokens/output_tokens/latency_ms` 列，`invoke` 关口每次调用写入——**即便 Langfuse 关闭，成本源头真相仍在自库可查**，Langfuse 是其上的分析/看板层 |

**唯一关联键（每条 log/metric exemplar/trace/SSE 事件都带,可一键 join）：**

| 键 | 含义 | 贯穿 |
|---|---|---|
| `traceId` | 一次请求/一次 graph 推进 | HTTP→service→graph node→model call |
| `threadId` | 一次面试 = `interviewResult.resultId` = LangGraph `thread_id` | `interview` / `interview_event.stream_key` / `ai_graph_run` / SSE / checkpoint |
| `graphRunId` | 一次图运行 | `ai_graph_run` / Langfuse trace |
| `principalId` | 主体（**标量,绝不带名字/简历**） | 全链路,RLS 绑定键 |
| `idempotencyKey` | 幂等作用域 | `ai_invocation_trace` / `consumption_record` |

> `threadId` 是黄金键:出问题时凭它能把"用户看到的 SSE 事件 ↔ 事件账本 ↔ checkpoint ↔ 模型 trace ↔ 结算记录"全串起来。这正是源项目内存 session 给不出的能力。

---

## 2. 按构造脱敏（不是"记得脱敏",是"传不进去"）

隐私硬规则（与 CLAUDE.md 一致）:**绝不记录**简历原文、用户答案全文、PII(身份证/手机/邮箱)、密钥/令牌/支付密文、完整模型 prompt。

**落地方式 = 类型边界,不是自觉**。`@meetwise/observability` 的 logger **只暴露接收标量/白名单字段的方法**,把简历原文这类 `string` 当"非结构化大文本"在类型层拒绝:

```ts
// @meetwise/observability —— 只能传标量与白名单结构,原文进不来
log.event('answer_evaluated', { threadId, principalId, score, latencyMs });   // ✓
log.event('answer_evaluated', { answerText });                                 // ✗ 类型错误:不在允许字段集
```

三道纵深防御:① logger 类型边界(传不进);② `observability` 是 leaf,**只收标量 `principalId`,不 import identity 类型**(见 module-boundaries,防互依成环、也防顺手把用户对象整个塞进去);③ CI 加 **禁词扫描**(日志调用点出现 `resumeText/answerText/prompt` 原文字段名即 fail)+ gitleaks(密钥)。需要排查内容时,用 `threadId` 去**受 RLS 保护的业务表**按需取,而非从日志捞。

---

## 3. 关键路径 SLO 与错误预算

SLO 围绕**目标校准的三件事**设,不是堆"99.9% uptime"。

| 关键路径 | SLI（怎么量） | SLO | 错误预算耗尽时 |
|---|---|---|---|
| **零业务数据丢失·结算** | `settlement_proposed` 事件数 − 已落账数 的滞留量 & 时长（对账 sweeper 量） | 滞留 > 5min 的笔数 = **0** | 冻结发布,先查 outbox/对账 |
| **零丢失·额度幂等** | 同 `idempotencyKey` 重复扣减次数 | = **0**（唯一约束保证,指标兜底验证） | 视为数据完整性事故,page |
| **可恢复·checkpoint 持久** | 进入 `waiting_user` 却无对应 checkpoint 的 `ai_graph_run` 数 | = **0** | page:可恢复性被破坏 |
| **优雅降级·押题/评估可用** | 模型调用最终成功率（含重试+降级路径） | ≥ 99%(单次裸成功率不设 SLO,**降级算成功**) | 检查模型供给/区域门/预算闸 |
| **快速恢复·面试续跑** | 进程重启后凭 `threadId` 恢复到正确 `waiting_user` 的成功率 | ≥ 99.9% | 查 checkpointer/lease |
| **用户感知延迟** | `question_ready`/`answer_evaluated` SSE 事件 P95 端到端时延 | P95 < 设定阈 | 容量/队列积压排查 |

> 注意 SLO 的取舍:**模型"单次"失败不进 SLO**——因为架构允许重试/降级/可解释报错。计入 SLO 的是"用户最终有没有拿到可用结果或一个诚实的降级",这才对齐"优雅降级"。

---

## 4. 降级 × 恢复 runbook（每个故障模式:怎么降、怎么恢、什么信号）

**原则:失败一律 fail-closed 到不丢数据的一侧,绝不静默吞**。降级必须**可解释**(用户看到诚实状态,不是假装成功)。

| 故障模式 | 优雅降级（保不丢 + 可解释） | 快速恢复（MTTR 杠杆） | 触发信号 |
|---|---|---|---|
| **模型瞬时失败/超时** | invoke 内重试封顶 → 仍失败则标 `degraded` 可解释报错,**不落假结果** | 自动:下次推进重试;`threadId` 状态不变,可续 | schema/transient 失败率、重试计数突增 |
| **模型确定性拒绝/越界** | router 便宜模型前置拦 → 直接拒,**不重试**(重试确定性错误是浪费且危险) | 无需恢复;事件记 `route_decided=reject` | reject 率、安全 golden 命中 |
| **模型产出幻觉简历事实** | 业务校验(factuality 歪曲门)拦截 → 要求重生成或降级,**不入库** | 重生成;`ai_invocation_trace` 留证 | 业务校验失败率 |
| **DB 不可用** | 请求 fail-closed 报错,**绝不旁路写**(无 RLS 即拒,见原语①) | DB 恢复后:无脏写可清;事件账本完好 | DB 探针、错误率 |
| **Redis 不可用**（限流/AI 前闸/锁） | AI 前闸 **fail-closed**(宁可拒新调用也不放过量打爆模型/超预算) | Redis 恢复即自愈;无业务状态在 Redis | Redis 探针、前闸拒绝率 |
| **checkpoint 续跑失败/损坏** | 显式报错 + 停在持久 `waiting_user`,**不伪造进度** | 从 `interview_event` 账本重放重建运行态(账本是真相) | §3 checkpoint SLO 告警 |
| **worker 崩溃/裂脑** | lease 持有者崩溃 → 租约**到期可被另一 worker 抢占**;CAS 保证只有一个推进 | 自动:lease 过期 + `threadId` 恢复 | lease 抢占率、stuck 运行 |
| **结算回调丢失/乱序** | outbox + `settlement_proposed` 事件,落账走对账 sweeper 兜底 | sweeper 周期补偿;坏账走 refund-uncollectible | §3 结算滞留 SLO |
| **报告生成失败** | 报告是**子图/后台 job,不阻塞面试主链路**;失败可独立重算 | 重跑 report 子图,面试结果不受影响 | report 失败率 |

> 横向读这张表,会发现"降级"和"恢复"都不是新机制——它们是**已建原语的可观测投影**:CAS/幂等/RLS fail-closed/事件账本/lease/outbox 对账。可观测性的职责是**把这些机制的健康度量出来、异常时报出来**,而不是另造一套。

---

## 5. 告警分层

| 级别 | 含义 | 触发例 | 响应 |
|---|---|---|---|
| **Page（呼叫）** | 触碰"零丢失/可恢复"红线 | 结算滞留>5min;幂等重复扣减>0;waiting_user 无 checkpoint | 立即,带 `threadId`/`traceId` 直达上下文 |
| **Ticket（工单）** | 降级在发生但未丢数据 | 模型降级率升高;重试计数升;报告失败率升 | 工作时间排查供给/容量 |
| **Trend（趋势）** | 产品/质量观察 | 押题完成率、复训率、token 成本漂移 | 周期复盘,不打扰 on-call |

告警必须可**一键下钻**:每条带 `threadId`/`traceId`,点开即到 Langfuse trace + 事件账本 + 状态机当前态。无法下钻的告警 = 噪音。

---

## 6. 与已建结构的接线（落地清单）

- `@meetwise/observability` 包(leaf,只收标量):pino 脱敏 logger + OTel 初始化;**API/worker 在组合根注入,业务模块只调类型化方法**。
- AI/Graph 链路 + 成本 → 走 [`langfuse-tracing.md`](./langfuse-tracing.md)(`ai_invocation_trace`/`ai_prompt_versions` 为业务侧真相,Langfuse 为分析侧)。**成本埋点已接线**：`invoke` 关口每次调用把 `service/input_tokens/output_tokens/latency_ms` 写入 `ai_invocation_trace`(migration 0011 补列),自库即成本源头真相,不依赖 Langfuse 是否开启。
- 指标埋点位:invoke 关口(延迟/重试/降级/token,**已接线**)、事件账本写入(seq/类型)、状态机迁移(audit)、结算 outbox/对账(**reconciler 已接线常驻**)、checkpoint 存取、SSE 事件发出。
- CI:加**日志禁词扫描**(原文字段名)与**告警可下钻校验**(样例告警必带 `threadId`)。这两条进 `ci-cd.md` 门禁清单。

> 待 `apps/`、`packages/` 进一步落地后,把本文 §6 的埋点位逐条挂到 `production-backlog` 对应 S 阶段(可观测性随功能同生,不事后补)。
