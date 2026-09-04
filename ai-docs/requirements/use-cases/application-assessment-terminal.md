---
id: requirements_uc_application_assessment_terminal
name: 用例 · 岗位绑定面试的无分终态收口
description: 在 ScoreCard、校准与人工复核尚未验收前，岗位绑定面试如何安全完成、计费、恢复并保持 B 端无数值分。
type: reference
scope: shared
level: spec
status: active
owner: product-architecture
related:
  - ./interview-scoring-measurement.md
  - ../use-case-conventions.md
  - ../../rules/global/status-machine.md
  - ../../testing/conventions/test-authoring.md
---

# 岗位绑定面试的无分终态收口

> **当前边界。** 本文替代早期“任一 `answer_evaluated` 数字事件即可完成岗位申请并写入分数”的规则。该规则已被迁移 `0082_b_side_score_calibration_hold.sql` 取代：在 `SCOR-01`、`SCOR-02`、`SCOR-07` 的 ScoreCard、校准和人工复核门均通过前，任何岗位绑定面试都只能以 `job_application.status=assessment_unavailable`、`score=NULL` 收口。事件中的 `score` 只是当前 C 端练习链的未校准信号，不是岗位评分事实，也不能解锁报告、人才库排序、通知、导出或自动决策。

## UC-ASSESSMENT-001 · 岗位面试安全收尾（当前无分模式）

- **七类覆盖**：正常 ✓；异常 ✓；特殊 ✓；逃逸通道 ✓；高并发 ✓；复杂 ✓；刁钻 ✓。
- **角色**：候选人、招聘方、面试图、报告后台任务。
- **前置**：候选人已启动一条 `job_application.status=in_progress` 的岗位绑定面试；申请、面试、岗位、简历和 attempt（尝试序号）四元绑定一致。
- **触发**：面试图到达收尾点，或评分/证据依赖已使本次面试不能继续。`answer_evaluated` 的整数、旧 event、模型 trace 或报告都不是岗位数值评分的授权根。

### 主流程

1. 图在持有 graph fence（图并发栅栏）后，以稳定 question identity 写入有序事件账本；这些事件仅支持当前 C 端交互恢复和练习反馈，不能作为 B 端评分投影来源。
2. 收尾事务以 application attempt、面试/简历/岗位绑定和消费状态为准完成或失败面试；旧 worker、旧事件和迟到报告不得覆盖新 attempt。
3. 面试正常完成时，消费从 `reserved` 到 `confirmed`；数据库将绑定申请原子置为 `assessment_unavailable`、`score=NULL`。是否存在历史数字事件不改变该 B 端终态。
4. 面试因 `unscored`、证据/隐私围栏或依赖失败而失败时，消费按既有状态机释放；绑定申请同样收口为 `assessment_unavailable`、`score=NULL`。
5. 招聘方仅看见无分评估不可用状态；候选人可以显式开始下一个 attempt。旧 completed/failed interview 永不复活、永不写分、永不覆盖新 attempt。

### 备选流

- **A1 C 端练习报告**：普通 C 端面试可按独立 C 端规则异步生成练习报告；该报告不改变任何岗位申请状态或分数。岗位绑定会话的报告即使存在，也不能使申请完成、写分或恢复 B 端用途。
- **A2 未来经批准的 ScoreCard**：只有 `SCOR-01/02` 已建立不可变 rubric、ScoreCard、证据 verifier 与资格门，且 `SCOR-05/06/07` 另有精确 `CalibrationRelease + ReviewCase` 时，才允许新增一个版本化 B 端辅助用途用例。它不得通过修改本用例或恢复 event 均值实现。

### 异常流

| 流程 | 场景 | 机制 | 后置 |
|---|---|---|---|
| E1 幂等重放 | worker 或浏览器重放收尾 | 事件键 + 条件更新 + 当前 attempt 绑定 | 终态最多一次；申请保持无分，不重复计费。 |
| E2 并发 | 两个 worker 同时收尾或候选人同时开始重试 | graph fence、申请状态 CAS、`application_attempt` 围栏 | 恰一个收口；新 attempt 不被旧 worker 覆盖。 |
| E3 越权/旁路 | 其他主体、旧 event 或 runtime 原始 SQL 尝试写数值 | RLS、principal 绑定、数据库 trigger；当前 `0082` 的 score hold | 申请状态/分数不变；任何数字分数读取为 0 个可用 B 端投影。 |
| E4 计费边界 | 面试完成但评分尚未校准 | 状态机：正常完成仅确认一次；B 端用途与计费分离 | 不退款，不生成岗位分数或数值完成。 |
| E5 评分依赖失败 | `unscored`、证据失败、privacy fence 或 provider unknown | 失败/释放状态机 + 无分申请终态 | `score=NULL`；不以 0 或模型猜测补分。 |
| E6 断线/迟到 worker | 终态后才收到旧回调、event 或报告 | attempt 比较、事件幂等键、数据库状态守卫 | 不产生新的 B 端 score、状态、报告用途或事件投影。 |

### 后置

- 正常完成的绑定面试：`Interview=completed`、`Consumption=confirmed`、`JobApplication=assessment_unavailable`、`score=NULL`。
- 失败的绑定面试：`Interview=failed`、消费按既有释放规则收口、`JobApplication=assessment_unavailable`、`score=NULL`。
- 两种情形下：岗位列表、人才库、导出、通知和任何 recruiter API 都不消费或显示可比较的数值分。招聘方申请状态页（`/recruiter/jobs/:id/applications/:applicationId`）只读该无分状态；C 端「我的投递」也不再渲染申请分数。该 UI 消费门见 `bend-recruiter-architecture-surface.md`，不替代本用例的数据库 hold。

### 验收标准

1. 有/无/伪造任意 `answer_evaluated` 数字事件的真实岗位会话，收尾后申请均不再停在 `in_progress`，均为 `assessment_unavailable`，且 `score IS NULL`。
2. 20 路并发收尾和 20 路重试：前者只形成一个无分终态投影；后者只创建 attempt+1 的一个新 interview。
3. 直接将绑定申请改为 `completed` 或设置任意 numeric `score` 必须被数据库拒绝；旧 event、trace 或 report 不得绕过该门。
4. 正常完成后报告失败或迟到不改变申请/消费终态，更不能恢复数值分。
5. 真实隔离 HTTP E2E 走到该终态后，`POST /applications/:id/finalize` 返回确定性的 scoreless 结果，招聘方不能读取伪造或历史数值分。

### 关联

- 当前状态机与代码门：`packages/db/migrations/0082_b_side_score_calibration_hold.sql`、`packages/db/src/recruiter.ts`。
- 未来测量事实与用途门：`interview-scoring-measurement.md` 的 `SCOR-01…08`。
- 原语：CAS（比较并交换）、幂等键、RLS、持久有序事件日志。
- 测试：`packages/db/test/recruiter-depth.proof.ts`、`apps/worker/test/adaptive-lifecycle.proof.ts`、`e2e/full.e2e.ts`；它们需要在真实隔离数据库中验证，不能以静态或 fixture 代替。
