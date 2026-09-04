---
id: UC-INT-TRANSCRIPT-PREVIEW-SUBMIT
name: 预览版答题账本提交
description: 在公开预览（MEETWISE_PUBLIC_PREVIEW=1）下，把作答写入既有 INT-TRANSCRIPT rehearsal 账本（submitInterviewAnswer），不开放 INT-TRANSCRIPT-01 生产 cutover，也不重开 legacy /turn 明文队列。
type: requirement
scope: interview
level: must
status: active
owner: product
related:
  - ./expert-long-interview-runtime.md
  - ./public-preview-write-gate.md
  - ./UC-interview-submit-answer.md
  - ./interview-answer-dual-write-fence.md
  - ../../architecture/current-runtime-truth.md
  - ../../architecture/backend/public-preview-write-inventory.md
  - ../../rules/global/production-invariants.md
---

# UC-INT-TRANSCRIPT-PREVIEW-SUBMIT · 预览版答题账本提交

这是本迭代范围，不是 `INT-TRANSCRIPT-01`。目标：在「预览版」让答案落到已有 0092 账本（加密 artifact + submission receipt + ref-only job），使预览可演示受控写入。非预览环境不得把该 HTTP 写成生产 canonical write；legacy `POST /interview/:id/turn` 在预览外仍是 `INT-P0-RAW-QUEUE`。

- **角色 Actor：** 预览部署中的候选人、面试 API、公开预览写门。
- **前置 Precondition：** 运行时精确 `MEETWISE_PUBLIC_PREVIEW=1`；面试属该 principal、隐私未围栏、已 begin、当前题在题目账本为 `issued` 且 `stateVersion` 匹配；0092 rehearsal 表已安装。客户端不得自报 owner、privacy epoch、artifact 状态或密文。公开预览 Web 仍只读且无 `/api/interview/:id/answers` 代理；演示需已 begin 的种子场次并直打 API，不是访客在展示站交卷。
- **触发 Trigger：** 候选人对当前题提交一份答案（`clientSubmissionKey` + 正文）。
- **明确不做：** 不宣称 01 生产 cutover；不登记进 `apiContract` / OpenAPI；不写 plaintext `interview_job.payload.answer`；不调用 `claimInterviewAnswer` / 评分 / 模型 / RAG / memory / B 端投影；不开放公开删除；不新增迁移（`0126`/`0127`/`0128`/`0129`/`0130` 已在 main；不占用 0131）；`0129` 预览删除是另一条账本，公开预览下仍 503；`0130` 是 #72 same-key claim join，不是本切片；`INT-LEVEL-SIGNAL-01` 不改本写面；Web 公开展示站保持只读（本包不加 `/api/interview/:id/answers` 代理）。不跑 `pnpm db:up`。

## 主流程 Main

1. 预览 HTTP 入站门放行 `POST /interview/:id/answers`；其它 mutating 方法仍 `503 public_preview_read_only`。
2. 鉴权解析 principal；契约 `InterviewAnswerPreviewSubmitDto` 校验（strict，无 epoch/owner）。
3. 服务层确认预览模式（非预览 → 固定 `404 not_found_or_forbidden`，不暴露该写面）。
4. 同一 `asPrincipal` 事务：隐私 fence、可答状态、题目 `issued`+`stateVersion` 绑定；`privacyEpoch` 由服务端取 1（未围栏面试）。
5. 调用既有 `submitInterviewAnswer`（内含已落地的 `0126` ledger 断言）：同键同体回放、同键异体冲突；正文只进加密 artifact。
6. 返回冻结的 `InterviewAnswerSubmitResult`（`accepted_unscored`，无明文、无 ciphertext）。

## 备选流 Alternate

- A1. 同 `clientSubmissionKey` + 同正文重放 → `replayed=true`，不新增 artifact/submission。
- A2. 非预览：未登录 `401`；已登录 `404 not_found_or_forbidden`。未知预览值启动 fail-closed。`/turn` 保持其既有语义。
- A3. 题目已被 legacy `/turn` 占用（`queued`/`answered`）→ `409 stale_question`。同身份已有占用行时，`0126` 再拒 ledger → `409 interview_answer_ledger_dual_write_fenced`。对向明文写入被 `0126` 拒为 `interview_answer_legacy_plaintext_fenced`。
- A4. 同题已有 active artifact 时，另一把 `clientSubmissionKey` → `409 stale_question`（同题一 winner）。同 key 回放仍成功，即使题目行后来不再是 `issued`。

## 异常流 Exception

| flow | 场景 | 机制 | 后置 |
| --- | --- | --- | --- |
| E1 重复 | 同 key/同体重放 | 幂等键 `UNIQUE(owner, client_submission_key)` | 回放同一 receipt，artifact 计数不增 |
| E2 并发 | 同题两把 key / 同 key 异体 / 对向 `/turn` | 题目行 `FOR UPDATE` + 已有 artifact 拒绝第二 key；`0126` 互斥 | 同题恰一正文家族；异体 `409 interview_answer_submission_conflict`；对向 `409 interview_answer_ledger_dual_write_fenced` |
| E3 越权 | 他属主、非预览探测、伪造路径 | RLS + 非预览 404 + 入站方法门 | 跨 owner 0 行；已登录非预览 404；`/turn` 预览仍 503 |
| E4 失败回滚 | 隐私围栏、未 begin、题未发、0126 占用 | 状态机 + privacy fence + 0126 | 不写 submission/artifact；围栏 → 410；占用 → 409 |
| E5 降级 | 预览关闭、加密/HMAC 前置失败、非法 env | fail-closed | 非预览 404；未知 env 拒启动；不退回 plaintext `/turn` |
| E6 断线 | 响应丢失后同 key 重试 | 持久 receipt | 只回放，不第二份正文 |

## 后置 Postcondition

- 预览成功路径：`interview_answer_submission.status=accepted_unscored`，对应 `interview_answer_artifact.status=active`（密文），ref-only `interview_answer_job`；`interview_job` 无 `kind=answer` 明文 payload。
- 面试/评分其它写面仍被预览门 503。
- `INT-TRANSCRIPT-01` 仍 blocked。`releaseEvidence=false`。

## 验收 Acceptance

- 预览 `POST /interview/:id/answers` 可过入站门；预览 `POST /interview/:id/turn` 仍 503。
- 非预览同一路径 `404 not_found_or_forbidden`，账本增量为 0。
- 同 key 同体 → 一 submission；同 key 异体 → 冲突且第二份 artifact=0。
- 跨 owner 读/写 = 0；响应 JSON 无作答明文。
- 清单登记 `preview-controlled-write`；`releaseEvidence` 保持 false。

## 关联

- 契约：请求 `InterviewAnswerPreviewSubmitDto`；响应 `InterviewAnswerSubmitResult`。二者**不**进 `apiContract`。
- 状态机：`InterviewAnswerSubmission` `accepted_unscored`；artifact `active`。
- 原语：幂等键、RLS、题目行锁、隐私 fence、`0126` 双写互斥。
- 测试：`TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-*`（见下）。治理分母仍 planned/unmapped。账本 HTTP 须远程 Postgres，禁止 `pnpm db:up`；无回执不是发布证据。

## 七类覆盖

| 类 | TC | 层 | 能失败的断言 |
| --- | --- | --- | --- |
| 正 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-main` | HTTP inject + 隔离 HTTP/DB | 预览提交后 submission=1、artifact 密文、响应 `accepted_unscored` 且无明文；`/turn` 仍 503 |
| 特 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-S1` | 契约 + HTTP | 空/超长/多余 `privacyEpoch` 字段 400；CJK 正文可被 DTO 接受 |
| 异 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-E1` | 隔离 HTTP/DB 或服务+账本 | 同 key 重放不新增 submission |
| 逃 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-E5` | HTTP inject | 非预览 404 且 `asPrincipal` 不计；未知预览值仍 fail-closed |
| 并 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-E2` | 隔离 HTTP/DB | 同 key 异体冲突；并发预览 `/turn` 仍全部 503 |
| 复 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-E4` | HTTP/服务 | 未发题/已占用/围栏不落账本 |
| 刁 | `TC-INT-TRANSCRIPT-PREVIEW-SUBMIT-T1` | 契约 + HTTP | 响应/契约拒绝明文键；跨 owner 404；路径变体 `/answer` 仍 503 |

层映射：`逃`/`并`/`刁` 落在 Fastify inject 或隔离 HTTP，不只堆单元。账本 HTTP/DB 须远程 Postgres 环境变量，禁止 `pnpm db:up`；未注入时不得填写通过回执。
