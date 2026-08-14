---
id: architecture_backend_commerce_saga
name: 权益/支付 Saga 与结算边界
description: Interview 完成 → 权益结算的跨模块 saga（事务边界、幂等键、outbox、对账 sweeper、AI 图只发提议、退款与权益回收解耦的合法组合矩阵）。修架构审计致命 #3/#5/#16。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ../../rules/global/production-invariants.md
  - ../../rules/global/status-machine.md
  - ./domain-events-catalog.md
  - ./module-boundaries.md
---

# 权益/支付 Saga 与结算边界

> 解架构审计致命 #3（completed→confirm 跨 interview/commerce 无事务边界/无幂等键/无补偿）、#5（"AI 图只发建议、commerce 落账"三文档三套机制矛盾）、#16（退款跨聚合补偿死结）。
> 铁律：**一个 DB 事务不跨模块边界**（[生产不变量](../../rules/global/production-invariants.md)）；跨聚合用 saga + 补偿，不用分布式长事务。**AI 图绝不直接改权益/支付**。

## 1. Interview 完成 → 权益结算（saga，单一机制）

跨 `interview` 与 `commerce` 两个模块，**不可同事务**。定为 saga：

```
[interview 事务]  Interview.status CAS active→completed
                  + 同事务写 outbox 事件 settlement_proposed{interviewId, ownerPrincipal, serviceType, transition}
        │ (事务性 outbox relay 投递，at-least-once)
        ▼
[commerce 消费]   ConsumptionRecord CAS reserved→confirmed
                  幂等键 = (interviewId, transition)   ← 来源表必须显式列此键
                  幂等：ON CONFLICT(owner_user_id, idempotency_key) DO NOTHING + 读回首条重放
```

- **AI 图不参与结算**：图只在 worker 内推进 Interview 状态并写 outbox `settlement_proposed`（统一命名，删除 multi-agent 的"supervisor 校验后落账"、删除 mock-interview 的"outbox 结算指令"别名——三处统一指向本文）。commerce 是唯一落账方。
- **幂等键登记**：`(interviewId, transition)` 必须写进 `ConsumptionRecord` 来源契约，不能临时拼。
- 权益**预留**发生在面试**启动**时（reserve），结算只是 reserve→confirm；失败/中止 → release（见 status-machine ConsumptionRecord）。

> **实现状态（已 code-validated）**：本 saga 的核心已实装于 `packages/db`（`entitlement_bucket`/`entitlement_consumption`/`commerce_outbox` + `reserveEntitlement`/`confirmConsumption`/`releaseConsumption`/`reconcile`），`pnpm commerce:prove` 对真 Postgres 37/37,**经对抗审计**修复三处真金白银洞:① 多桶降级分账用**大余数法**(逐桶 consume 之和严格 === 权威 settled,杜绝逐桶独立四舍五入的分币泄漏);② confirm/release 桶 UPDATE 校验 rowCount;③ owner 必须 === 已绑定 principal。并发不超卖靠 `FOR UPDATE`+READ COMMITTED EvalPlanQual 重判+available-CAS,DB `ck_bucket_capacity` 兜底。
>
> **已补实（原 STUB 已落成真,经二次对抗审计）**：(a) **outbox 真实结算消费者** `settleOutbox` 已实装——`FOR UPDATE OF o SKIP LOCKED` 取 pending,入 `settlement_ledger`(`UNIQUE(consumption_id)` + `ON CONFLICT DO NOTHING`),at-least-once + 重跑 = **exactly-once 入账**;入账与标 relayed 同事务(崩溃则整体回滚、重跑补处理)。(b) **lease 心跳续约**已实装:`reserveEntitlement` 置 `lease_expires_at`,`renewReservationLease` 心跳,`sweepExpiredReservations` 只回收**租约过期**(=进程崩了)的孤儿——根治 backstop-TTL 误扫进行中长会话。二次审计逮到 heartbeat-vs-sweep 的 **TOCTOU**(无锁选中→释放只复核 status),已修为**单条原子 `UPDATE … WHERE status='reserved' AND lease_expires_at < now()` 行锁下复核 lease**;并发 续约vs回收 测试证明"续约成功⟹绝不被扫"。
>
> **已接线运行（原「built-but-not-called」已消除）**：上述 `settleOutbox` / `sweepExpiredReservations` / `renewReservationLease` **不再是零调用方**——`apps/worker/src/commerce-reconcile.ts` 的 `runCommerceReconciler(pool)` 已在 worker 主循环启动(`main.ts`,30s 一拍,远短于 1800s 预留租约),每拍枚举有待回收工作的 owner → 逐 owner `reconcile()`(回收孤儿预留 + 结算入账);心跳续约由 `interview-consumer.ts` 每轮 job + 心跳调 `renewReservationLease`。对账由专门 gate `pnpm -C apps/worker prove:commerce-reconcile`（`test/commerce-reconcile.proof.ts`）覆盖：中途弃回收退额度 + 发 `interview_unavailable`、活会话续约免误杀、重跑/并发不重发。**旧口径「outbox 结算是 STUB / reclaim 未接线」已 STALE,现为 WIRED**。

## 2. 对账 sweeper（补偿，闭合孤儿）

outbox at-least-once + 消费可能滞后/丢失 → 必有"Interview 已 completed 但 ConsumptionRecord 仍 reserved"的孤儿。**周期性 reconciliation sweeper**：

- 扫 `Interview.completed` 且对应 `ConsumptionRecord.status='reserved'` 超过窗口（如 24h）的孤儿。
- 重投 `settlement_proposed`（幂等键保证不重复 confirm）。
- 超长无法结算 → 告警 + 转人工。这是 saga 的兜底，不是可选。

> **实现状态（WIRED）**：本 sweeper 已接线常驻运行——`runCommerceReconciler`（worker 主循环，30s 一拍）除回收租约过期的孤儿预留（退额度回池、零泄漏）外，对被回收的 `mock_interview` 孤儿**把 `Interview` 置终态 `abandoned` + 补发 `interview_unavailable` 终态事件**（无静默死胡同；避免 create() 复用"未终态尸体"的 reuse-trap），并同拍 `settleOutbox` 把 confirm 投的 outbox 真实入结算账本。整拍不抛、多实例安全（行锁 + `SKIP LOCKED`，幂等）。

## 3. 退款 × 权益回收解耦（解死结 #16）

权益已消费时"权益回收 CAS"必 0 行——不能让它阻塞对客退款。**两件事解耦**：

| 对客退款 PaymentOrder | 权益回收 ConsumptionRecord | 合法？处置 |
| --- | --- | --- |
| refunding→refunded | reserved→released（未消费） | ✅ 正常退 + 收回 |
| refunding→refunded | 已 confirmed（已消费） | ✅ **照退钱**；权益回收失败 → ConsumptionRecord `refunded_uncollectible` + 转 `ManualReview`（坏账），**不阻塞退款** |
| 卡住不退 | 不收回 | ❌ **禁止**："钱没退且权益没收回且无人跟进"是非法终态，sweeper + ManualReview 杜绝 |

原则：**先保证对客 `PaymentOrder→refunded` 不被权益回收阻塞**；坏账走 `ManualReview`，永远有人跟进，绝不静默死胡同。

## 4. 与不变量/状态机的对齐

- 每一步状态迁移走 CAS（原语 1）；跨模块用 outbox 事件（原语 4）+ 消费幂等（原语 2）。
- `settlement_proposed` / `entitlement_*` 事件的载荷与幂等键登记进 [领域事件目录](./domain-events-catalog.md)。
- ConsumptionRecord 新增 `refunded_uncollectible` 终态见 `status-machine.md`。
