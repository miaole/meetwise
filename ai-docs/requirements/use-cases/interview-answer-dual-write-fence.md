---
id: requirements_uc_interview_answer_dual_write_fence
name: UC-INT-ANSWER-DUAL-WRITE-FENCE · 答题双写互斥围栏
description: 在 INT-TRANSCRIPT-01 仍 blocked 时，禁止 legacy 明文 job payload 与 ledger artifact 对同一答题事实并行落库；并禁止 interview_event 再收原文。不是 01 完成声明。
type: requirement
scope: shared
level: must
status: active
owner: architecture
version: 1
tags:
  - interview
  - transcript
  - fence
related:
  - ./expert-long-interview-runtime.md
  - ./UC-interview-submit-answer.md
  - ./interview-answer-preview-submit.md
  - ../../architecture/backend/interview-answer-dual-write-cutover.md
  - ../../architecture/current-runtime-truth.md
  - ../../rules/global/production-invariants.md
---

# UC-INT-ANSWER-DUAL-WRITE-FENCE · 答题双写互斥围栏

## 0. 状态与不能误称的事实

这是 **INT-P0-RAW-QUEUE 的围栏/切换图前置**，不是 `INT-TRANSCRIPT-01`。真实用户 HTTP 仍走 legacy `POST /interview/:id/turn`，仍把明文 `answer` 写入 `interview_job.payload`。ledger 写入（`submitInterviewAnswer` → 加密 artifact）在预览下可由 `POST /interview/:id/answers` 调用（`UC-INT-TRANSCRIPT-PREVIEW-SUBMIT`），仍不是 01 生产 HTTP 路由。本用例禁止两条路径对同一答题身份并行落同一答题事实，并禁止 `interview_event` 新增顶层原文键。

不得把本围栏说成：canonical transcript 已上线、删后 read=0 已闭合、plaintext queue 已停用、或 01 真实 write route 已开放。不得把“任意 `kind=answer` 行与 artifact 不能同表存在”说成本用例后置——无 `answer` 键的 answer job 可以与 artifact 并存。

## UC-INT-ANSWER-DUAL-WRITE-FENCE

- **角色 Actor：** 面试 API、面试 worker、隔离 proof、未来 01 rehearsal 写入器。
- **前置 Precondition：** `interview_job` 与 `interview_answer_artifact` 均已存在；公开删除入口仍 503；01 双门未过。
- **触发 Trigger：** 任一路径尝试写入答题正文（`interview_job.payload` 顶层 `answer` 键，或 ledger artifact），或尝试把顶层 `answer` 键写入 `interview_event`。
- **主流程 Main：**
  1. 写入前对**整场面试**取同一把事务 advisory 锁（残缺身份与完整三元组必须同锁）。
  2. Legacy 明文 writer：payload 含顶层 `answer` 键即进入互斥（含 `""` / JSON `null`，**不看 kind**）。仅当该身份尚无未物理删除的 ledger artifact（`EXISTS` 不滤 `status`），才允许写入。
  3. Ledger writer：仅当该面试不存在占用行，才允许插入 artifact。占用行 = `kind=answer` 的 `interview_job`（含已剥离 `answer` 的终态行），或任意 `kind` 且带 `answer` 键。无 `questionId`（trim 后空）的占用行对整场 fail-closed；有题无合法 `stateVersion` 的占用行对该题所有 version fail-closed。
  4. `interview_event` 的 INSERT/UPDATE 若 payload 含顶层 `answer` 键（object）或数组元素 `'answer'`，一律拒绝。嵌套键不拦。
  5. 同路径重放（同 seq 明文 job / 同 submission key ledger）不改对方路径，也不把围栏当成第二份事实。
- **备选流 Alternate：** 不同 `questionId` 可各走自己的路径；无 `answer` 键的 job（含无正文的 `kind=start`）不触发明文互斥；事件继续可带 `answerId`/`answerHash`/`question`。
- **异常流 Exception：**
  - **E1 重复：** 同路径幂等重放只回已有 job/receipt；不因重放打开对向路径。
  - **E2 并发：** 20 路对向写入（完整身份、无 `questionId`、有题无 version）串行后恰一族赢家；禁止 artifact 与**明文** job 并存。
  - **E3 越权：** HTTP/仓储跨 owner 不得返回围栏码作存在性。本用例**不**声称 `assert_*` SECURITY DEFINER 函数本身无 oracle（`app_role` 可直接 `EXECUTE`）。
  - **E4 失败回滚：** 对向写入被拒时本事务无新 artifact/无新明文 payload。
  - **E5 降级：** 表触发器是安全边界；job/artifact 断言为 SECURITY DEFINER，事件触发器是普通函数、只查 `payload ? 'answer'`。仓储先拒不能替代触发器。
  - **E6 断线/恢复：** 终态 job 已 `payload-'answer'` 仍算占用行，ledger 不得补写猜测原文。
- **后置 Postcondition：** 同一答题身份至多一种**正文**落点家族（legacy 顶层 `answer` 键 **或** ledger artifact）。无 `answer` 键的 `kind=answer` job 可以与 artifact 同身份存在，但仍挡住再写 ledger。事件账本无顶层原文。`INT-TRANSCRIPT-01` 状态仍为 blocked。
- **验收 Acceptance：**
  - 仅 legacy：明文 job 可入队，artifact=0。
  - 仅 ledger rehearsal：artifact 可插入，匹配明文 job=0。
  - 对向写入 → `interview_answer_legacy_plaintext_fenced` 或 `interview_answer_ledger_dual_write_fenced`，对向表增量=0。
  - 事件带顶层 `answer` → `interview_event_raw_answer_fenced`；现有 `answer_evaluated`（`answerId`/`answerHash`）仍可插入。
  - 20 并发对向写入后明文与 artifact 不同时>0。
  - 验证命令：`pnpm int-answer-dual-write-fence:prove`（隔离 PostgreSQL，`releaseEvidence=false`）。
- **关联：** 四原语（CAS/advisory 锁、幂等键、RLS、事件账本）；`INT-P0-RAW-QUEUE`；切换图 `architecture/backend/interview-answer-dual-write-cutover.md`。
- **七类覆盖：** 正/异/特/逃/并/复/刁。

### 七类测试矩阵

| 类别 | TC | 必测断言 | 机制 |
| --- | --- | --- | --- |
| 正常 | `TC-INT-ANSWER-DUAL-WRITE-main` | 无 ledger 时 legacy 明文 job 入队成功；无匹配占用行时 ledger artifact 插入成功；明文与 artifact 不同时存在。 | 面试级 advisory 锁 + SECURITY DEFINER 断言 |
| 特殊 | `TC-INT-ANSWER-DUAL-WRITE-S1` | 无正文 start、无 `answer` 键的 answer job、不同 question 互不误伤；空白/`01` 与规范身份重叠；事件可含 `answerHash`。 | 键存在性 + trim/`^[0-9]+$`，不猜测 |
| 异常 | `TC-INT-ANSWER-DUAL-WRITE-E1` | 同路径重放不打开对向路径；对向写入失败回滚，对向表=0。 | 幂等 / 事务回滚 |
| 逃逸通道 | `TC-INT-ANSWER-DUAL-WRITE-E3` | 原始 SQL 对向 INSERT 被触发器拒绝；`UPDATE` 搬 `interview_id` / 补 `answer` 键被拒；跨 owner 仓储路径不回围栏码。 | DB 触发器 + RLS |
| 高并发 | `TC-INT-ANSWER-DUAL-WRITE-E2` | 完整身份、无 `questionId`、有题无 version 各 20 路后明文与 artifact 不同时>0。 | 面试级 advisory 锁 |
| 复杂 | `TC-INT-ANSWER-DUAL-WRITE-M1` | 终态剥离 `answer` 后 ledger 仍拒；无 `questionId` / 无 `stateVersion` fail-closed；`start` 带 `answer` 占用；`""`/`null` 键仍算明文；`fenced`/`erased` 墓碑仍占位。 | 不猜测原文；不按 status 放行 |
| 刁钻 | `TC-INT-ANSWER-DUAL-WRITE-T1` | `{...TurnDto}` 风格事件（含顶层 `answer`）拒绝；数组元素 `'answer'` 拒绝；`answerId` 不被误判为原文；嵌套 `answer` 不拦。 | 仅禁顶层 / `jsonb ?` |
