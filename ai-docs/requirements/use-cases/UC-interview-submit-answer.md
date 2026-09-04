---
id: requirements_uc_interview_submit_answer
name: UC-interview-submit-answer · 提交面试答案
description: 范例业务用例——异常流逐条落到生产不变量原语，并对应到已有验证 gate 的断言。
type: reference
scope: shared
level: spec
status: active
owner: product
related:
  - ../use-case-conventions.md
  - ../../testing/conventions/test-authoring.md
  - ../../rules/global/production-invariants.md
---

# UC-interview-submit-answer · 提交面试答案

- **角色**：求职者
- **前置**：存在属于该用户、状态 `waiting_user` 的面试 `Interview(id=threadId)`；持有有效权益。
- **触发**：用户对当前问题提交一份答案（带客户端 `idempotency-key`）。

## 主流程 Main
1. 鉴权解析 principal；以 principal 上下文进入请求（RLS 生效）。
2. 校验该 Interview 属于此 principal 且处于 `waiting_user`。
3. 以 `idempotency-key` 占用一次消费（`ConsumptionRecord` reserved）。
4. worker 图按 `questionId/stateVersion/turn` 评估答案：确定性 identity/注入/长度门 → 受限模型判定 → schema 与业务校验。当前评分只可作为练习反馈；未完成版本化 rubric 和校准前不产生可比较的 B 端分数。
5. 追加事件 `answer_evaluated`（事件账本，单调 seq）；`Interview` 经 CAS 迁移 `waiting_user→active`（继续）或 `→completed`。
6. `ConsumptionRecord` reserved→confirmed。

## 异常流 Exception（每条落到机制 + 对应测试）
| flow | 场景 | 落到的原语/机制 | 后置 | 对应已有 gate 断言 |
|---|---|---|---|---|
| **E1** | 重复请求（双击/断线重发，同 key） | 幂等键唯一约束 `ON CONFLICT DO NOTHING` | 只评一次、只记一次 | `api:validate`「重复幂等键→duplicate_ignored」「answer_evaluated 仅1条」；`runtime:prove`「invoke 幂等 eval 仅调1次」 |
| **E2** | 同 thread 并发提交 | thread 租约 CAS / 状态 CAS | 仅一个推进，另一个被拒 | `runtime:prove`「租约拒并发」「CAS 陈旧落败=0行」 |
| **E3** | 越权（非属主提交/读取） | RLS principal 绑定 fail-closed | 0 行 → 404，不泄露存在性 | `api:validate`「userB 越权提交 R1→404」「userB GET R1→404」；`db:prove`「越权=0行」 |
| **E4** | 评估输出幻觉/歪曲简历事实 | 业务校验（factuality 歪曲门），deterministic 不盲目重试 | 标记+不入库+要求重生成或降级 | `runtime:prove`「幻觉被业务校验拦截」；`pipeline:prove`「幻觉Go题被拒」 |
| **E5** | schema 失败 / 模型瞬时失败 | 重试分类：transient 重试、确定性拒绝不重试 | 重试或可解释降级 | `runtime:prove`「schema失败触发重试」「确定性拒绝不重试」 |
| **E6** | 断线重连 | 事件账本 + SSE `Last-Event-ID` 重放 | 不丢不重，从断点续推 | `api:validate`「SSE 全量重放」「Last-Event-ID 只重放 seq>1」 |

## 后置 Postcondition
`Interview` ∈ {`active`,`completed`}；写入：`interview_event(answer_evaluated, seq)`、`consumption_record(confirmed)`、`ai_invocation_trace`（成本/幂等）。

## 验收标准 Acceptance（驱动测试）
- 同 key 提交两次 → 恰一条 `answer_evaluated`、一次扣费。
- 非属主提交/读取 → 404 且账本无变化。
- 并发提交 → 恰一个推进。
- 幻觉答案评估 → 不入库。
- 断线 `Last-Event-ID=N` → 仅重放 seq>N。

## 关联
契约：`POST /interview/:id/turn`、`GET /interview/:id/events`。遗留 `POST /interview/:id/answer` 固定返回 `410 legacy_endpoint_disabled`，见 `UC-SCOR-00`。状态机：Interview、ConsumptionRecord。原语：CAS / 幂等键 / RLS / 事件日志（全四条）。安全：用户答案为不可信输入（factuality 歪曲门 + 注入处理）。生产 `/turn` 仍把明文 `answer` 写入 `interview_job.payload`（`INT-P0-RAW-QUEUE` 仍 open）；`interview_event` 禁止顶层 `answer`。互斥与切换不在本页，见 `UC-INT-ANSWER-DUAL-WRITE-FENCE` 与 `architecture/backend/interview-answer-dual-write-cutover.md`。

> 这条用例把当前 `api:validate`/`runtime:prove`/`pipeline:prove` 的相关断言全部挂上了具体业务流——即"测试用例 ↔ 业务用例 ↔ 代码"闭合。其余 capability 按 [use-case-conventions](../use-case-conventions.md) 同样先补用例再写代码。
