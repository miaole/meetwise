---
id: rule_global_status_machine
name: 状态机规则
description: 所有带状态流转的业务对象必须显式定义状态和合法转换。
type: rule
scope: global
level: policy
status: active
owner: architecture
version: 1
tags:
  - status
  - state-machine
related:
  - ./production-invariants.md
  - ../../architecture/backend/data-model.md
---

# 状态机规则

- 状态必须是显式枚举，不用多个布尔值拼状态。
- 每个状态转换必须明确触发者、前置状态、后置状态和失败原因。
- 前端只做预校验，后端必须再次校验状态转换。
- 测试必须覆盖合法流转、非法流转、重复操作和并发。
- 状态变化必须记录审计字段：操作人、时间、原因、关联请求。
- **每一次转换都是一次 CAS 写**（见 [生产不变量](./production-invariants.md) 原语 1）：`UPDATE … SET status=$to, version=version+1 WHERE id=$id AND status=$from AND version=$v`。返回 0 行 = 输了竞争 → 回查重判，绝不盲写。

> 命名口径：聚合根以 `architecture/backend/data-model.md` 为准——业务面试聚合是 **`Interview`（id = threadId）**，旧称 `InterviewResult` 已并入，不再使用。`AiGraphRun` 是其运行时记录，两者分离（业务事实 vs 运行态）。

## 转换表（from / to / 触发 / 守卫 / 失败动作）

### Interview（面试聚合，id = threadId）

枚举：`created · active · waiting_user · completed · abandoned · failed`

| from | to | 触发 | 守卫 | 失败动作 |
| --- | --- | --- | --- | --- |
| created | active | 开始面试 | 上下文就绪（简历/JD 已解析） | 失败 → failed + 可解释错误 |
| active | waiting_user | 题目就绪、等待作答 | 已发 `question_ready` 事件且持有 thread lease | — |
| waiting_user | active | 提交答案 | **答案幂等键**未见过 + 持有 lease | 重复键 → 忽略（幂等） |
| active | completed | 到达结束 | 题量达标 / 收尾完成 | — |
| active·waiting_user | abandoned | 超时 / 用户中止 | 超过会话 TTL | — |
| 任意非终态 | failed | 不可恢复错误 | — | 业务事实保全，会话安全终止 |

编排：`completed` → 入队 `AssessmentReport`；`completed` → `ConsumptionRecord` 由 reserved 转 confirmed；`failed/abandoned` → `ConsumptionRecord` released（退还权益）。

### InterviewQA（题目账本，物理表 `interview_question`）

枚举：`issued · queued · answered · cancelled`。写路径与合法边以 [qbank-generation-lifecycle](../../requirements/use-cases/qbank-generation-lifecycle.md) 为准（`issued → queued → answered` 或 `issued/queued → cancelled`，不可原地换题）。

C 端进度是只读投影，不在本对象上发明转换：`issued_turns`=`status<>'cancelled'`，`answered_turns`/`Overview.answered`=`status='answered'`。见 [cend-overview-progress](../../requirements/use-cases/cend-overview-progress.md)。

### AssessmentReport（报告，子图/后台 job）

枚举：`pending · generating · completed · failed`

| from | to | 触发 | 守卫 | 失败动作 |
| --- | --- | --- | --- | --- |
| pending | generating | 报告 job 领取 | 面试已 completed | — |
| generating | completed | schema+业务校验通过并持久化 | 校验通过 | 校验失败 → failed |
| generating | failed | 不可恢复 / 超重试 | — | 用户可见降级态 + 可重试（pending） |
| failed | pending | 用户/系统重试 | 重试预算内 | — |

报告失败**绝不阻塞面试主链路**（子图舱壁）。

### PaymentOrder（支付单，钱路径用 SERIALIZABLE）

枚举：`created · paid · fulfilled · fulfill_failed · refunding · refunded · expired`

| from | to | 触发 | 守卫 | 失败动作 |
| --- | --- | --- | --- | --- |
| created | paid | 异步支付通知 | **通知幂等键** + 服务端金额复核 + 乱序守卫 | 金额不符 → 告警 + 不入账 |
| paid | fulfilled | 发放权益 | 权益发放 CAS 成功 | CAS 失败 → fulfill_failed |
| fulfill_failed | fulfilled | 重试履约 | 幂等键保证不重复发 | 超重试 → refunding |
| paid·fulfilled | refunding | 退款发起 | — | — |
| refunding | refunded | 退款完成 | 权益回收 CAS | — |
| created | expired | 超时未付 | 超过支付 TTL | — |

**AI 图绝不直接改支付/权益**；图只发「建议扣减」事件，commerce 服务校验后落账。

### ConsumptionRecord（权益消费，reserve→confirm→release saga）

枚举：`reserved · confirmed · released`

| from | to | 触发 | 守卫 | 失败动作 |
| --- | --- | --- | --- | --- |
| —(insert) | reserved | 面试启动占用权益 | 可用额度 CAS 扣减成功 + `idempotency_key` UNIQUE | 额度不足 → 拒绝启动 |
| reserved | confirmed | 面试 completed | 幂等键未确认过 | — |
| reserved | released | 面试 failed/abandoned / 退款 | — | 额度 CAS 回补 |

`idempotency_key UNIQUE` + `INSERT … ON CONFLICT DO NOTHING`，保证「占用」exactly-once。

### AiGraphRun（图执行运行时记录，演进的脊柱）

枚举：`created · active · waiting_user · migrating · paused · quarantined · safe_terminating · safely_terminated · completed · failed`

| from | to | 触发 | 守卫 | 失败动作 |
| --- | --- | --- | --- | --- |
| created | active | 图启动 | 抢到 thread lease | lease 冲突 → 拒绝 |
| active | waiting_user | interrupt 等待用户 | 持久化 waiting 状态 | — |
| waiting_user | migrating | resume 命中版本变更 | 目标 manifest 存在 | — |
| migrating | active | 懒迁移成功 | 目标 schema/业务再校验通过 | — |
| migrating | quarantined | 迁移函数抛错/校验失败 | — | 原 checkpoint 不改写，DLQ 待补重放 |
| 任意 | safe_terminating | 不可迁移 / 低于 min_resumable_ver | — | 业务事实独立保全 |
| safe_terminating | safely_terminated | 安全终止完成 | — | — |
| active | paused | 批量迁移让位 / kill-switch | — | — |
| active·waiting_user | completed/failed | 正常结束 / 不可恢复 | — | — |

详见 `architecture/ai/runtime-migration.md`（迁移 spec，待 land）。

### ManualReview（人工复核案件，TARGET）

> 当前没有运行时表/API/UI；本转换表是后续实现唯一口径，详见 `architecture/ai/human-review-design.md`。题库内容的 `qbank_source` 审批状态机不迁入这里。

枚举：`open · claimed · evidence_frozen · awaiting_second_review · decided · applying · applied · withdrawn · expired · voided`

| from | to | 触发 | 守卫 | 失败动作 |
| --- | --- | --- | --- | --- |
| —(insert) | open | 申诉/风险 policy/抽检创建 | subject + purpose + idempotency key 唯一；冻结最小证据版本 | 重复请求返回同一案件 |
| open | claimed | 审核员领取 | tenant/purpose capability、无利益冲突、CAS + lease | 已领取 → 409 / 回查 |
| claimed | evidence_frozen | 受控读取确认 | consent、对象版本、assignment lease 均有效 | 失效 → voided |
| evidence_frozen | awaiting_second_review | 四眼 policy 命中 | owner/reviewer/管线身份互异 | 不满足 → 不得决定 |
| evidence_frozen·awaiting_second_review | decided | 追加 `ReviewDecision` | expected subject version、决定幂等键；必要时独立二审通过 | 陈旧/重复 → 0 effect |
| decided | applying | 领取 `ReviewEffect` | outbox effect key 唯一 | — |
| applying | applied | 领域效果成功 | 目标聚合 expected version CAS 成功 | 可重试 → decided；版本失配 → voided |
| open·claimed·evidence_frozen | withdrawn/expired/voided | 用户撤回、到期、同意或 snapshot 失效 | 不得再读原文或应用效果 | 新版本需求另开案件 |

候选人可见的 `upheld` / `overturned` 是 `ReviewDecision.outcome_code` 的映射，不是案件 `status`。人工改判追加新 `AssessmentVersion` / `DecisionRecord` / ledger event，禁止覆盖原记录。

---

以上五张表是 [生产不变量](./production-invariants.md) 原语 1（CAS）的直接落点；每次转换服务端再校验、写审计、并发用版本号守卫。**测试必须覆盖：合法流转、非法流转（断言 0 行）、重复操作（幂等）、并发（断言恰一个赢）。**

## 状态机增量（来自用例评审，逐步补全转换表）

来源 [待拍板决策](../../requirements/open-decisions.md) B 组——用例暴露的新态与新承重对象。每个都遵守同一约束：显式 enum + CAS 迁移 + 服务端再校验 + 审计 + 测试覆盖（合法/非法/重复/并发）。

**既有对象扩展**：
- `Interview` 增 `waiting_system`（等系统侧，如报告/研究异步）、`paused`（用户暂停/kill-switch），终态 `safety_hold`，会话级 `risk_held`（安全护栏命中冻结）。
- `ConsumptionRecord` 增 `partial_confirmed`（部分完成计费，待 A 组口径）、`refunded`（`confirmed→refunded`）。
- `AiGraphRun` 增 `canceling`、`canceled`、`timeout`。

**新增承重状态对象**（纳入"状态对象清单"，各待补独立转换表）：
- `VoiceTurn`（语音回合：录音/转写/评估的态 + 降级到文本）
- `CompensationJob`（补偿任务，配 DLQ + reconciliation sweeper）
- `AnswerEval`（答案评估结果态）
- `GuardrailHit`（护栏命中事件态：拦截/放行/升级人工）
- `ManualReview`（人审案件：`open→claimed→evidence_frozen→[awaiting_second_review]→decided→applying→applied`；终止 `withdrawn/expired/voided`；决定结果独立存储）
- commerce 五表：`PaymentOrder`(+`pending`/`closed`)、`EntitlementAccount`、`RefundOrder`、`Subscription`、`Invoice`

### 审计修复（H13–H15）：补死胡同出边 + 常态 resume + 退款回补

- **H14 常态 resume**（之前 `waiting_user` 唯一出边是→migrating）：新增 **`waiting_user → active`**，守卫 = 版本一致 + 抢到 lease；**仅版本变更才分流 `migrating`**。否则普通续答无合法转换。
- **H13 死胡同补出边**（`paused`/`quarantined` 之前只有入边）：
  - `paused → active`（重抢 lease 恢复） / `paused → safe_terminating`（超 retire/kill）。
  - `quarantined → migrating`（补函数重放且校验通过） / `quarantined → safe_terminating`（不可救）。每条带守卫 + 审计。
- **H15 completed 后退款回补**（之前 `confirmed→refunded` 只在增量、且权益已消费时 `refunding→refunded` 的"权益回收 CAS"必 0 行无失败动作）：
  - `ConsumptionRecord`：`confirmed → refunded`（回收成功）；权益**已耗尽无法回收**时 → 明确分支 **`refunded_uncollectible`（负账/坏账/转人工审核 `ManualReview`）**，不静默卡死。
  - `PaymentOrder.refunding → refunded` 的守卫"权益回收 CAS"补失败动作：0 行 → 进 `refunded_uncollectible` 分支，不假装成功。

> 注：完整转换表随各对象用例定稿补全；补全后同步 `scripts/ai-docs/check-docs.mjs` 的 requiredTerms，使治理与文档不脱节。
