---
id: rules_global_production_invariants
name: 生产不变量（四个承重原语）
description: 所有改状态的路径都必须落在这四个原语上——CAS 条件更新、幂等键、RLS principal 绑定、持久有序事件日志。绝大多数「漏钱 / 泄露 / 丢失」都是缺其一的投影。修原语，不修症状。
type: rule
scope: global
level: must
status: active
owner: architecture
version: 1
tags:
  - reliability
  - concurrency
  - security
  - invariants
related:
  - ./status-machine.md
  - ../../architecture/backend/data-model.md
  - ../../architecture/ai/agent-runtime.md
---

# 生产不变量：四个承重原语

> 这个项目里几乎所有「会漏钱 / 会泄露 / 会丢数据」的故障，最终都塌缩成**缺了下面四个原语之一**。它们不是「最佳实践建议」，是**硬约束**：任何改状态的代码路径若不落在这四个原语上，视为缺陷，不予合并。**修原语，不修症状。**

源头病根（反面教材）是「read-then-write + 内存 session + 裸 JSON + 散落脱敏」。下面每个原语都对应消灭其中一种崩法。

---

## 原语 1：CAS 条件更新（compare-and-swap）

**绝不 read-then-write。** 所有状态迁移用一条带前态与版本号守卫的条件 UPDATE 完成：

```sql
UPDATE <table>
   SET status = $to,
       version = version + 1,
       updated_at = now()
 WHERE id = $id
   AND status = $from        -- 前态守卫：杜绝非法迁移
   AND version = $expected   -- 乐观锁：杜绝并发覆盖
RETURNING *;
```

- **返回 0 行 = 输了竞争**（前态已变 / 版本已被人推进）→ **回查重判**，绝不盲目重试覆盖。
- 五个状态对象都带 `version int` 列：`Interview`、`AssessmentReport`、`PaymentOrder`、`ConsumptionRecord`、`AiGraphRun`。
- 序列化冲突 `40001` / 死锁 `40P01` → **有界抖动退避**重试（如 3 次，20–150ms jitter），破 convoy；超界则失败上抛，不无限重试。
- 默认 `READ COMMITTED`；**只有涉及钱的多步不变量**（权益结算、支付履约）用 `SERIALIZABLE` 或显式 `SELECT … FOR UPDATE` 行锁。

**落点**：权益 reserve→confirm→release、支付异步通知履约、消费记账、每一次状态机迁移、同 thread 并发 resume 抢占。

**怎么测**：并发双写同一行，断言「恰一个成功、另一个读到 0 行并回查」，不是「最后写赢」。

---

## 原语 2：幂等键（idempotency key）

**exactly-once = 幂等 + 去重，不是「但愿只跑一次」。** 每个外部触发的写操作都带一个幂等键，靠唯一约束去重：

```sql
-- 消费记账：同一幂等键只记一次
ALTER TABLE consumption_record ADD CONSTRAINT uq_consumption_idem UNIQUE (idempotency_key);
INSERT INTO consumption_record (..., idempotency_key)
VALUES (..., $key)
ON CONFLICT (idempotency_key) DO NOTHING;   -- 0 行受影响 = 重复请求，安全忽略
```

幂等键来源（按场景）：

| 场景 | 幂等键 | 防的故障 |
| --- | --- | --- |
| 提交答案 | 客户端生成（每答案一个） | 双击 / 断线重发 → 双扣费、重复评估 |
| 支付异步通知 | 支付单号 + 通知流水 | 通知乱序 / 重复回调 |
| 模型调用 invoke | turn 级 `idempotencyKey` | 重试 / 重放重复计费、重复 emit |
| 子 agent 执行 | `(runId, subTaskId, attempt)` | 扇出重试重复落账 |

**落点**：答案提交、支付通知、`invoke` 管线、子 agent 重试、所有「客户端可能重发」的写。

**怎么测**：同键发两次，断言副作用只发生一次（一条记账、一次扣费、一个事件）。

### 原语 1+2 必须同事务（exactly-once 的真正难点）

exactly-once 不是"幂等键挡重复"这么简单。**幂等记录写入 与 CAS 状态迁移/记账，必须在同一个 DB 事务里原子提交。** 否则经典漏履约：

```
naive：先 INSERT 幂等键 → 提交 → 再 CAS 扣费/迁移
故障：插了幂等键后、CAS 前崩溃 → 重试命中幂等键 → "0 行=安全忽略" → 扣费/履约永不发生 = 漏钱
```

正确：

- 幂等键 INSERT 与业务 CAS **同一事务**，要么都成功要么都回滚。
- 冲突（重复请求）时**不是 `DO NOTHING` 就完事**——要**读回首条记录、重放首次的结果**返回给调用方（幂等 = 同样输入返回同样的"首次结果"，不是"静默吞掉")。
- 跨进程/跨存储（如 trace 在另一连接 autocommit）破坏原子性：去重要么做成 DB 侧 `INSERT…ON CONFLICT…RETURNING` 抢占（抢不到读已有），要么纳入调用方事务。
- **怎么测**：在幂等键写入与 CAS 之间注入崩溃，断言重试后履约恰好发生一次、不漏不重。

---

## 原语 3：RLS principal 上下文绑定

**隔离是 DB 强制的，不是应用自觉。** 每个查询都带 principal；DB 行级安全策略 fail-closed：没有 principal 上下文 → 返回 0 行，而不是返回全表。

- 事务内 `SET LOCAL app.principal = $principal`（随事务结束自动清，**必须配事务模式连接池**，否则连接复用会串号——这是经典脚枪）。
- 谓词 = `owner_principal 类型判别（owner_user_id / owner_tenant_id 恰一非空）` + B 端 `Membership EXISTS`。
- 应用 DB 角色**不得有 `BYPASSRLS`**；无 principal 即空集（fail-closed）。
- **全路径注入**，一个都不能漏：HTTP 请求、worker 队列任务、LangGraph checkpointer 读写、缓存键（带 principal）、trace、后台批量 job。任何「忘了带 principal」的路径都是越权泄露入口。

完整谓词 SQL、GUC 协议、连接池配置见 `architecture/backend/rls-isolation.md`（P0，待补）。

**落点**：所有读写用户 / 租户数据的路径。B/C 两产品线物理隔离是生死线。

**怎么测**：多角色越权用例当门禁——A 租户上下文查 B 的数据断言 0 行；无 principal 断言 0 行；后台任务路径同样断言带 principal。**0 行越权是发布前置条件。**

---

## 原语 4：持久有序事件日志

**业务事件落持久 append-only 表，不寄生在 checkpoint。**

- `InterviewEvent`：Postgres append-only，**每流单调 `seq`**。
- SSE 断线重连用 `Last-Event-ID` 从账本**重放**，不靠内存连接、不靠 checkpoint。
- 提供 snapshot 端点：重连先取快照再增量重放。

这条同时解决：断线重连、事件去重、崩溃恢复、双扣费——**四个问题一个机制**。

**关键纠偏（双写裂脑）**：checkpoint 与事件账本是两个存储，**不假设它们跨存储同事务**。规则：

- **业务表是唯一真相**；checkpoint 只承载运行时态。
- 业务事实在业务事务内用原语 1/2 落定；事件由提交派生（事务性 outbox）。
- 恢复时以**事件账本对账重放**，副作用靠原语 2 幂等——既不重复发事件，也不丢事件。

**落点**：面试事件、审计事件、成本账本。

**怎么测**：流中途 kill，重连后断言「事件不重不漏、seq 连续、不双扣费」。

---

## 为什么是这四个

把生产就绪审计里上百条「会漏钱 / 会泄露 / 会丢失」的发现归并，几乎每一条都是这四个原语之一的缺失投影：

| 症状 | 缺的原语 |
| --- | --- |
| 并发把状态写花 / 权益超发 / 重复履约 | 1 CAS |
| 双击双扣费 / 通知重放重复记账 | 2 幂等键 |
| 跨租户读到别人数据 / 后台任务越权 | 3 RLS 绑定 |
| 断线丢事件 / 崩溃后状态对不上 / 重连双扣 | 4 事件日志 |

所以代码评审与测试的第一问永远是：**这条改状态的路径，四个原语落齐了吗？** 落不齐就是缺陷，无论功能看起来对不对。
