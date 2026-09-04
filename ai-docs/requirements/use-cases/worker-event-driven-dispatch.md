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

> 实施状态：源码已将四类队列接到提交后静态 `wake`、专用 `LISTEN` 会话和 5 秒有界 reconciliation（对账扫描）；本地生命周期合同通过。真实 PostgreSQL 的 commit/rollback、多副本、RLS 与重连数据面验收不得称为发布或端到端低延迟证据（`releaseEvidence=false`）。
>
> `UC-WORKER-002` 已把**面试** tick 从按 owner 抽干改为量子轮转，并加上每 owner 数据库未过期 running cap、进程内 global inflight、`idle`/`retry` 轮转语义和切片/reap 隔离。押题/诊断/报告仍抽干；进程内 global cap 不是集群锁。
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

## UC-WORKER-002 · 面试队列公平轮转与领取幂等围栏

- **角色 Actor：** 求职者、API、Worker 副本、PostgreSQL。
- **前置 Precondition：** `UC-WORKER-001` 的 wakeup、gateway owner 枚举、`asPrincipal` 领取、lease/reaper 与同面试 `queued → running` CAS 已存在；`interview_job` 以 `(owner, interview, kind, seq)` 唯一键去重。
- **触发 Trigger：** 面试 tick 发现至少两个 owner 有可领取作业，或同一 owner 在多个副本上同时被领取。
- **主流程 Main：**
  1. Gateway 只返回有可领取或过期 running 作业的 owner id，面试队列按该 owner 最老可领取行的 `created_at`、再按 owner id 稳定排序；载荷仍不含作业或主体业务数据。
  2. Tick 先对每个 owner **隔离** reap（单个失败不中断后续 owner，且该失败 owner 本拍不再 drain），再进入公平 drain：每次启动对一个 owner 至多一个 `drainOnce`，并在仍有配额的 owner 间轮转，而不是把单个 owner 抽干。`WORKER_INTERVIEW_GLOBAL_INFLIGHT>1` 时多个 owner 可重叠。`idle` 只在 claim 为 null 时出现；`retry`（隐私围栏后归还、丢租约、graph fence 未取得、`markDone` CAS=0）不把 owner 踢出本拍。同一 `fairDrain` 调用里每个 owner 最多启动 32 次。
  3. 领取仍在 `asPrincipal` 事务内：owner 级 advisory lock + `FOR UPDATE SKIP LOCKED` + 同面试未过期 `running` 守卫 + 同面试 `failed` 兄弟守卫 + **每 owner 未过期 running 数 < per-owner cap**（默认 1）。过期 running 不计入 cap，以便回收领取。
  4. 同一进程内同时处理的面试作业数不超过 `WORKER_INTERVIEW_GLOBAL_INFLIGHT`（默认 4，范围 1–64）。该上限是**进程内**预算，不是跨副本集群锁。非法预算在任何消费循环启动前失败关闭。
  5. 同一面试的后续 seq 在前一条未过期 `running` 时不得被领取；入队冲突返回已存在且同 v64 世代的 job id，不新建。
- **备选流 Alternate：** 只有一个 owner 时仍按 quantum=1 循环到 idle，行为与“抽干该 owner”等价，但不改变领取 CAS。
- **异常流 Exception：**
  - **E1 重复入队/重放：** 同 `(owner, interview, kind, seq)` 第二次入队不新增行，返回已有 id；重复 drain 对已 `running`/`done` 行 CAS=0。机制：唯一键 + CAS。
  - **E2 并发双领：** 两副本同时 claim 同一 owner 的两条可领作业且 cap=1 时，恰一个 `queued → running`，另一场保持 `queued`。机制：`FOR UPDATE SKIP LOCKED` + owner advisory lock + 未过期 running 计数。
  - **E3 越权：** `SET LOCAL ROLE app_role` 且不绑定 principal 时读/领为 0 行或 RLS 拒绝，受害行仍 `queued`；跨 owner claim=0；gateway 仍只返回 owner id。机制：RLS。
  - **E4 失败/丢租约：** `markDone`/`markFailed`/`requeue` 必须带本机 `lease_owner`；CAS=0 时不得发假终态或退他人预留；`markDone` CAS=0 对调度层返回 `retry` 而不是成功。机制：lease CAS。
  - **E5 预算耗尽/非法配置：** per-owner 已达 cap 时该 owner 新作业保持 `queued`，不改同步外呼、不跳过 RLS；非法 `WORKER_INTERVIEW_*`（含 `1e1`/`1.0`）使 worker 在循环启动前失败。机制：显式预算 + fail-closed。
  - **E6 同面试保序/中途停止：** 同面试 seq 不得并行（后序保持 `queued`）；单个 drain 切片拒绝时其他 in-flight 切片先结束；stop 等当前 tick（含在飞并行切片）结束后才退出。机制：同面试 running 守卫 + drain loop 排空。
- **后置 Postcondition：** 每个 `interview_job` 至多一个未过期 `running` lease；同一面试至多一条未过期 `running`；一 owner 未过期 running 数不超过 per-owner cap；未被领取的作业保持可恢复 `queued` 或过期 `running`。不新增业务状态，不写简历/答案到调度元数据。
- **验收 Acceptance：** 两 owner（A 三条、B 一条）且 gateway 按最老等待排序时，领取顺序是 `A,B,A,A` 而不是 `A,A,A,B`；两连接对同一 owner 两条作业在 cap=1 时恰一个 `running`；同面试后序在前序 running 时 enqueue 成功且 claim=null、seq1 保持 `queued`；跨 owner / 无 principal 为 0 行；非法预算启动失败；重复 enqueue 行数不增加。不据此宣称集群全局 cap、端到端延迟 SLO 或押题/诊断/报告已公平。
- **关联：** `apps/worker/src/interview-dispatch-fairness.ts`、`apps/worker/src/interview-consumer.ts`、`packages/db/src/interview-jobs.ts`、`packages/db/migrations/0124_interview_dispatch_fairness.sql`、`ai-docs/architecture/backend/worker-dispatch-fairness.md`；状态机仍是 `queued → running → done|failed`；原语为 CAS、幂等键、RLS、lease。
- **七类覆盖：** 正（轮转）、异（丢租约不双处理）、特（单 owner / 空队列）、逃（非法预算 fail-closed / cap 耗尽保持 queued）、并（双副本恰一赢）、复（reap 后公平 drain + 同面试保序）、刁（跨 owner=0 / 通知仍无业务数据）。

### 测试用例

| ID | 层 | 场景 | 关键断言 |
| --- | --- | --- | --- |
| `TC-WORKER-002-main` | 确定性单元 + 隔离 PostgreSQL | A 三条、B 一条；gateway 按最老等待给出 `[A,B]` | 单元与隔离领取顺序都是 `A,B,A,A`，不是 `A,A,A,B`。 |
| `TC-WORKER-002-E1` | 隔离 PostgreSQL | 同 key 重复 enqueue | 行数不增加，返回同一 id。 |
| `TC-WORKER-002-E2` | 隔离 PostgreSQL | 两连接、同一 owner 两场面试、cap=1 并发 claim | 恰一个 `running`，另一场保持 `queued`。 |
| `TC-WORKER-002-E3` | 隔离 PostgreSQL | 跨 owner claim；`SET LOCAL ROLE app_role` 且不绑定 principal | 跨 owner=0；无 principal 读 0 行或 RLS 拒绝，受害行仍 `queued`。 |
| `TC-WORKER-002-E4` | 隔离 PostgreSQL | 非持租 `markDone`/`markFailed`/`requeue` | CAS=0，作业状态与他人 lease 不变。 |
| `TC-WORKER-002-E5` | 确定性单元 + 隔离 PostgreSQL | cap=1 时同 owner 第二场仍 queued；`0`/`1e1`/`1.0`/倒置预算 | 第二场保持 `queued`；非法 env 抛 `*_invalid`，不静默放大。 |
| `TC-WORKER-002-E6` | 隔离 PostgreSQL + 确定性单元 | 同面试 seq0 running 时入队并 claim seq1；切片拒绝 | enqueue 成功、claim=null、seq1 保持 `queued`；拒绝的切片等其他 in-flight 结束后再抛出。 |

## 已知后续项

- `WORKER-DISPATCH-002` 的**面试**切片已接线：owner 量子轮转、每 owner 数据库未过期 running cap、进程内 global inflight、`idle`/`retry` 与切片/reap 隔离。押题、诊断、报告仍按 owner 抽干，不在本用例宣称公平。
- 进程内 `WORKER_INTERVIEW_GLOBAL_INFLIGHT` **不是**跨 Worker 副本的集群全局锁。多副本时集群同时 running 数可以超过该值；跨副本硬 cap 属于后续项，不得写成已交付。
- 模型 operation 预算仍是既有 `invoke` / registry / `MODEL_*` 路径，本用例不改派发后模型身份或费用账本。
- 真实多副本、真实 commit/rollback 数据面与发布级延迟测量仍为 `releaseEvidence=false`，不得因本用例通过而宣称端到端低延迟或容量保证。
