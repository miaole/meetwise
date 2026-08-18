---
id: uc_worker_event_driven_dispatch
name: Worker 事件唤醒调度
description: 将用户可见作业从固定频率轮询改为提交后事件唤醒，并保留有界对账恢复的业务与测试契约。
type: requirement
scope: shared
level: must
status: partial
owner: architecture
---

# Worker 事件唤醒调度

> 实施状态：源码已将四类队列接到提交后静态 `wake`、专用 `LISTEN` 会话和 5 秒有界 reconciliation（对账扫描）；本地生命周期合同通过。真实 PostgreSQL 的 commit/rollback、多副本、RLS 与重连数据面验收尚未运行：本机 Docker 存储空间不足，故 `releaseEvidence=false`，不得称为发布或端到端低延迟证据。
>
> 改造前事实：面试、押题、诊断消费者每 1.5 秒扫描一次，报告消费者每 2 秒扫描一次。API 会先返回已受理，用户随后等待下一次扫描领取。目标是把**正常已提交作业**的领取触发改为提交后即时唤醒；PostgreSQL 作业表、领取 CAS、租约、RLS 与持久事件账本仍是唯一事实源。通知不是队列、不是授权通道，也不承载业务数据。

## UC-WORKER-001 · 已提交作业即时唤醒并可靠恢复

- **角色 Actor：** 求职者、API、Worker 副本、PostgreSQL、运维人员。
- **前置 Precondition：** `interview_job`、`quiz_job`、`diagnosis_job` 或 `ai_report` 的状态机和 RLS 已存在；Worker 具有独占的监听连接；每个作业领取仍由现有 `FOR UPDATE SKIP LOCKED` / 条件更新和 lease（租约）完成。
- **触发 Trigger：** 作业在业务事务中首次进入 `queued`，或者报告从 `failed` 被合法重排为 `queued`。
- **主流程 Main：**
  1. API 或 Worker 在同一数据库事务内写入/转换作业状态；只有事务提交后，数据库才发布固定常量 `wake` 的 wakeup（唤醒）信号。
  2. 任一已连接 Worker 收到信号，只合并唤醒用户可见队列的单线程 drain loop（排空循环）；它不读取通知中的任何业务标识，也不直接把通知当作作业。
  3. 消费者通过 gateway（网关）只枚举 owner（主体标识），再在 `asPrincipal` 事务内领取并处理作业；多副本同时被唤醒时，恰一个副本取得每条作业。
  4. 当队列为空时 loop 等待下一个信号；周期性 reconciliation（对账扫描）只用于启动窗口、监听断线、通知丢失和过期 lease 的恢复。
  5. Worker 停止时先停止监听、拒绝新的唤醒，再等待当前 tick 完成；已领取作业继续由 lease/reaper（收割器）恢复，不因停止丢失。
- **备选流 Alternate：** 监听连接重连成功后立即对全部用户可见队列做一次 drain；没有可领取行时安全返回，不产生模型调用或业务事件。
- **异常流 Exception：**
  - **E1 重复通知/重放：** 同一作业的重复提交、重排或多个通知只会合并为一次或多次无害 drain；领取和业务副作用仍由唯一键、CAS、lease 保证至多一次。机制：幂等键 + CAS。
  - **E2 多副本并发：** 多个 Worker 同时收到同一 wakeup，只有一个可以将同一作业从 `queued` 领取到 `running`；其余副本读取到空队列。机制：`FOR UPDATE SKIP LOCKED` + lease。
  - **E3 越权/旁路：** notification payload（通知载荷）只能是固定常量 `wake`，不含队列类别、owner、job id、答案、简历、报告或凭据；收到信号后仍须经 gateway owner 枚举和 `asPrincipal` / RLS 领取。机制：RLS + 最小数据事件。
  - **E4 事务回滚与通知丢失：** 回滚事务不得唤醒消费者；监听断线、进程启动竞态或 PostgreSQL 通知队列异常不得丢失作业，监听恢复时立即排空，且有界对账扫描最终重新发现队列表真相。机制：事务提交通知 + 持久队列表 + lease/reaper。
  - **E5 依赖降级：** 监听不可用时 Worker 进入 `wakeup_degraded`，但保留有界对账扫描和现有领取路径；不得因为通知失败把已受理请求改为同步跑模型、跨租户扫描或跳过费用/隐私围栏。机制：显式健康状态 + 确定性 fallback。
  - **E6 停止/断线竞态：** stop（停止）、连接 error（错误）和迟到 notification 不得启动新的 tick 或并行 tick；已在运行的 tick 排空后退出，重启由 lease/reaper 处理。机制：单飞 loop 状态机 + lease。
- **后置 Postcondition：** 已提交作业要么被某一 Worker 领取，要么保留为可恢复的 `queued` / 过期 `running` 行；通知不新增业务状态、不包含敏感数据，也不改变 RLS 或费用语义。
- **验收 Acceptance：** 正常路径不再等待固定 1.5/2 秒扫描：提交后的 committed wakeup 可使对应 loop 立即开始一次 drain；回滚通知数为 0；20 个并发通知不造成同一 loop 并行 tick 或同一作业双领；非法 payload 和跨主体作业读取为 0；监听断线后重连立即 drain，且周期 fallback（上限 5 秒）能恢复未收到的作业；stop 后新 tick 数为 0。常态 commit-to-claim 的目标为 ≤250 毫秒，但必须在真实数据面测量后才能宣称达标。
- **关联：** `apps/worker/src/drain-loop.ts`、`apps/worker/src/*-consumer.ts`、`apps/worker/src/report-worker.ts`、`packages/db/src/*-jobs.ts`、`packages/db/src/report.ts`；状态机为既有 job `queued → running → done|failed`；原语为 CAS、幂等键、RLS、持久事件账本。
- **七类覆盖：** 正常、异常、特殊（报告重排）、逃逸通道（监听降级）、高并发、复杂（事务/多副本/恢复）、刁钻（回滚、重连、停止竞态）均覆盖。

### 测试用例

| ID | 层 | 场景 | 关键断言 |
| --- | --- | --- | --- |
| `TC-WORKER-001-main` | 隔离 PostgreSQL + Worker 集成 | 四类队列提交并 commit | 对应 loop 在 wakeup 后立即开始 drain；payload 只等于静态常量 `wake`。 |
| `TC-WORKER-001-E1` | 确定性单元 + 隔离 PostgreSQL | 重复通知、重复 enqueue、报告重排 | 单飞 tick；同一作业最终只有一次领取和业务副作用。 |
| `TC-WORKER-001-E2` | 隔离 PostgreSQL 集成 | 两个 Worker、20 个同队列 wakeup | 每条作业恰一个 `running` lease；非赢家零业务副作用。 |
| `TC-WORKER-001-E3` | 隔离 PostgreSQL 集成 | 非法 payload、跨主体和无 principal | wakeup 不泄露主体；跨主体领取/读取均为 0。 |
| `TC-WORKER-001-E4` | 隔离 PostgreSQL 集成 | rollback、监听断线、重连前后提交 | rollback 无通知；重连 immediate drain；fallback scan 最终领取未通知行。 |
| `TC-WORKER-001-E5` | 确定性运行时 | 监听建立/重连连续失败 | Worker 标记 wakeup degraded，仍按有界周期恢复，不同步外呼。 |
| `TC-WORKER-001-E6` | 确定性运行时 + 集成 | tick 中 stop、迟到通知、listener error | 无并行/停后 tick；在飞 job 仅由 lease/reaper 接管。 |

## 明确不做

- 不将 PostgreSQL `LISTEN/NOTIFY` 描述为持久消息队列、delivery receipt（投递回执）或授权边界。
- 不在通知中传队列类别、owner、job id、答案、简历、报告、模型输入、令牌或任何可识别数据。
- 不删除 lease、reaper、RLS、gateway owner 枚举或低频对账扫描。
- 不在 API 请求内直接执行图、模型、报告或付费外呼来掩盖调度延迟。

## 已知后续项

- 事件唤醒只消除空闲时的发现等待。当前单个 owner 的多个长模型作业仍会被一个 `drainOwner*` 调用顺序抽干，其他 owner 可能发生 head-of-line（队首阻塞）等待。该公平性和每 owner/global 并发预算属于 `WORKER-DISPATCH-002`，不得因本用例通过而宣称端到端低延迟或容量保证。
