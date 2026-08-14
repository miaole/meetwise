---
id: architecture_backend_domain_events_catalog
name: 领域事件目录
description: 10 模块解耦的唯一契约面——统一事件信封、每个领域事件的生产/消费方/载荷/版本/幂等键登记、outbox 拓扑决策。事件 schema 进 packages/contracts。修架构审计致命 #4 + 高 #17/#18。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./module-boundaries.md
  - ./commerce-saga.md
  - ../../rules/global/production-invariants.md
---

# 领域事件目录

> 模块间**唯一解耦契约是领域事件**（`packages/contracts` 的 HTTP 契约只覆盖对外 wire，不覆盖模块间）。本目录是事件的单一真相：事件名/生产方/消费方/载荷/版本/幂等键。新增模块间交互**必须先在此登记事件**再实现。修架构审计致命 #4。

## 1. 统一事件信封（#17）

各文档曾各自发明（eventSeq / 订单号+流水 / runId:subTaskId）。统一为 `packages/contracts` 的 `EventEnvelope<T>`：

```ts
type EventEnvelope<T> = {
  eventId: string;        // ULID，默认幂等键
  type: string;           // <domain>.<object>.<action>
  version: number;        // 载荷 schema 版本
  occurredAt: string;     // ISO8601 UTC
  ownerPrincipal: { userId?: string; tenantId?: string }; // 恰一非空
  streamKey: string;      // 排序/路由键（如 interviewId）
  seq?: number;           // 有序流内单调（InterviewEvent 用）
  dedupeKey?: string;     // 业务级幂等键（可选，登记在本目录）
  payload: T;             // 按 type 的 Zod schema
};
```

- **默认幂等键 = `eventId`**；需要业务级去重的（如结算）用 `dedupeKey`，每个事件在下表显式登记其 `dedupeKey` 构成。

## 2. 事件登记表（节选承重事件）

> **简写 ↔ 规范 type 映射**（修闭合验证 #7）：他文正文用简写（`settlement_proposed`/`refund_uncollectible`/`needs_review`/`review_decided`），本表的 dotted `type`（`interview.settlement.proposed` 等）是**规范真相**，落 `packages/contracts` 的 `type` 字符串以本表为准，简写仅正文可读性。

| 事件 type | 生产方 | 消费方 | 载荷要点 | dedupeKey |
| --- | --- | --- | --- | --- |
| `interview.settlement.proposed` | interview(worker, outbox) | commerce | interviewId, serviceType, transition | `(interviewId, transition)` |
| `commerce.entitlement.reserved` | commerce | interview | consumptionId, interviewId | eventId |
| `commerce.entitlement.confirmed` | commerce | interview, assessment | consumptionId | eventId |
| `commerce.entitlement.released` | commerce | interview | consumptionId, reason | eventId |
| `commerce.refund.uncollectible` | commerce | admin(ManualReview) | orderId, consumptionId | eventId |
| `assessment.report.requested` | interview | assessment(子图/后台) | interviewId | `(interviewId, graphVersion)` |
| `assessment.report.ready` | assessment | interview, learning | reportId, interviewId | eventId |
| `<domain>.needs_review` | 任意业务模块 | admin | objectType, objectId, reason | `(objectType, objectId)` |
| `admin.review.decided` | admin | 来源业务模块 | objectType, objectId, decision | eventId |
| `data.egress.blocked` | ai-runtime | observability(审计) | principal, target | eventId |

> SSE 业务事件（`question_ready`/`answer_evaluated`/`waiting_user`/`report_ready`，及**终态** `report_unavailable`/`interview_unavailable` 等）是 `InterviewEvent` 有序流（带 `seq`），由 worker 写、api SSE 网关订阅转发（见 langgraph-blueprint Worker→Api 通道）。`assistant_message_chunk`（原 message_delta）非承载事实、不进业务校验、不进本目录的业务事件登记。
>
> **`interview_unavailable`（终态，已接线）**：面试 job 终态失败（job-death/reap 超 MAX_ATTEMPTS）或中途弃（对账回收孤儿预留）时发出，前端据此优雅降级不转圈（无静默死胡同，对称 `report_unavailable`）。发出方 = `interview-consumer` / `reaper` / `commerce-reconcile`，均同时把 `Interview` 置终态（`failed`/`abandoned`，避免 create() 复用尸体的 reuse-trap）。

## 3. outbox 拓扑（ADR #18）

**决定：每个 owning 模块各自一张 outbox，与业务写同库同事务；统一 relay 层投递。** 否决全局 `domain_events` 单表（归属/RLS/订阅耦合）。

- 写：业务 CAS 与 outbox INSERT 同事务（原语 1+2 同事务，见生产不变量）。
- 投递：relay 轮询/CDC，at-least-once；消费方按 `eventId`/`dedupeKey` 幂等。
- 消费失败 → 重试 → DLQ；对账 sweeper 兜孤儿（见 commerce-saga §2）。**对账 sweeper 已接线常驻**：commerce outbox 的 `settleOutbox` + 孤儿预留回收由 `runCommerceReconciler`（worker，30s 一拍）驱动，非纸面 spec。

## 4. 三类回流强制走事件（断环，#9）

`admin 人审`、`commerce 权益`、`所有跨聚合最终一致` **一律走事件，禁同步互调**——这是 `module-boundaries.md` 断环的机制底座。admin/commerce 禁直接 import 业务模块。
