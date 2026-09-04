---
id: architecture_backend_worker_dispatch_fairness
name: 面试 Worker 公平调度与领取围栏
description: 记录面试作业队列当前已接线的公平轮转、每 owner 领取 cap 与幂等围栏；区分进程内预算和未交付的集群全局锁。
type: architecture
scope: shared
level: reference
status: active
owner: architecture
version: 2
related:
  - ../current-runtime-truth.md
  - ../../requirements/use-cases/worker-event-driven-dispatch.md
  - ../../rules/global/status-machine.md
  - ../../rules/global/production-invariants.md
---

# 面试 Worker 公平调度与领取围栏

本文只描述**当前代码**。目标态若与实现冲突，以 `current-runtime-truth.md` 和本文件的“未交付”清单为准。

## 1. 要消灭的故障

`WORKER-DISPATCH-001` 把发现等待改成提交后 `wake`。面试 tick 仍曾对 gateway 返回的每个 owner 调用 `drainOwnerJobs`，把该 owner 的全部可领作业顺序抽干。一个 owner 的多条长模型作业会挡住后续 owner（head-of-line）。

领取本身已有 `FOR UPDATE SKIP LOCKED`、同面试 running 守卫和 lease CAS。缺口是**调度顺序**和**每 owner 并发 cap**，不是再造一条通知队列。

## 2. 当前接线

| 机制 | 代码位置 | 实际保证 | 不保证 |
| --- | --- | --- | --- |
| Owner 枚举排序 | `gateway_dispatch_owners('interview')`（迁移 `0128`） | 只返回 owner id；按该 owner 最老可领取/过期 running 行的 `created_at`、再按 owner id 排序。`0124` RAG ACL 与 `0125` memory_vector_chunk 已在 main；`0126`–`0127` 仍由并行切片占用，本切片不改号 | 不是公平锁、不是容量预留 |
| 量子轮转 | `fairDrainInterviewOwners` | 每次启动对一个 owner 至多一个 `drainOnce`；`pickNext` 在仍有配额的 owner 间轮转。`globalInflight>1` 时多个 owner 的切片可以重叠；某一 owner 的上一片结束后，可以在他人未结束前再拿一片 | 不是“全世界同时只有一个切片”；也不是抽干单个 owner 才轮转 |
| `idle` / `retry` | `drainInterviewJobOnce` 返回值 | **`idle` 只表示本次 claim 为 null**。隐私围栏后归还、丢租约、graph fence 未取得、`graph_fence_lost` 归还、`markDone` CAS=0 都返回 `retry`，owner 留在本拍轮转里 | `retry` 不是新的作业状态 |
| 切片失败隔离 | `fairDrainInterviewOwners` | 单个 `drainOnce` 拒绝不会拆掉其他 in-flight 切片；函数先等全部 running 结束再抛出第一个错误 | 不是跨 tick 的补偿事务 |
| 每拍 launch cap | `DEFAULT_INTERVIEW_OWNER_LAUNCH_CAP`（32） | 同一 `fairDrain` 调用里每个 owner 最多启动 32 次，防止 `retry` 活锁本拍 | 不是跨拍配额 |
| Reap 隔离 | `interviewDispatchTick` | 单个 owner 的 reaper 失败只记错误码，**该 owner 本拍不再进入 fair drain**；后续 owner 仍 reap/drain | 不保证失败 owner 已收割；下一拍再试 |
| 每 owner cap | `claimNextInterviewJob` 的 running 计数 + owner advisory xact lock | 同一 owner **未过期** `running` 数 < `perOwnerInflight`（默认 1）；跨副本生效，因为计数在表上 | 过期 running 不计入 cap，以便回收领取 |
| 进程内 global cap | `WORKER_INTERVIEW_GLOBAL_INFLIGHT`（默认 4） | **一个 Worker 进程**同时执行的面试 `drainOnce` 上限 | 多副本之和可以更大 |
| 同面试保序 | 既有 `NOT EXISTS` 未过期 running / failed 兄弟 | 同一 `interview_id` 至多一条未过期 running；failed 后面不再领 | 不改变 seq 语义 |
| 入队幂等 | `UNIQUE (owner, interview, kind, seq)` | 重复提交不新建；世代冲突抛错 | 不是跨面试去重 |
| 终态/归还 | `markDone` / `markFailed` / `requeue` 带 `lease_owner` | CAS=0 则本副本不得写业务终态；`markDone` CAS=0 对调度层是 `retry` 而不是成功 | 丢租约后的恢复仍靠 reaper |

押题、诊断、报告消费者**没有**接入上述轮转，仍按 owner 抽干。`drainOwnerJobs` 只留给测试/维护，生产 tick 必须走公平轮转。

## 3. 状态机

作业状态仍是 `queued → running → done|failed`。本切片不增加状态值，不把通知、cursor、预算行或 `retry` 写成业务真相。`retry` 只是一次 drain 切片的进程内结果。

非法 `WORKER_INTERVIEW_PER_OWNER_INFLIGHT` / `WORKER_INTERVIEW_GLOBAL_INFLIGHT`（非 `^[1-9]\d*$` 正整数、越界、或 per-owner > global）使 Worker **在任何消费循环启动前**失败，不回退到“无上限抽干”。

Cap 计数刻意只含未过期 `running`。同一拍先 reap 再 claim：过期行应被收割或变为可回收；若把过期 running 算进 cap，owner 会卡在上限直到所有副本 sweep 成功。因此“过期但仍在执行的旧 worker”理论上可与新领取短暂重叠，直到旧心跳停、新租约 CAS 或 reaper 收口。这是回收路径，不是“任意 running 都占槽”。

## 4. 未交付（禁止对外写成已完成）

- 跨 Worker 副本的集群全局 inflight 锁或 slot 表。
- 押题 / 诊断 / 报告的公平轮转。
- 把即时 wakeup 说成繁忙状态下的端到端延迟或容量 SLO。
- 用模型 operation 预算替代本队列 cap，或反过来。
- 把隔离 PostgreSQL 证明写成发布、云多副本或延迟验收。

## 5. 验证

`fairDrainInterviewOwners` 返回的 `claimed` 计入 `start`/`answer`/`failed`，不计 `idle`/`retry`。

- 确定性：`pnpm interview-dispatch:unit:prove`（无数据库）。per-push CI `verify` 跑这一条。
- 远程 PostgreSQL：`pnpm interview-dispatch:prove` 只走 `E2E_CLOUD_ISOLATED=1` 的远端库。禁止本地 Docker / loopback。缺远程配置则失败关闭，不得改起本地库。`releaseEvidence=false`。不在 per-push CI。
