---
id: architecture_backend_interview_answer_dual_write_cutover
name: 面试答题双写切换图
description: 盘点 legacy 事件/明文 job payload 与 ledger 路径，并冻结在 INT-TRANSCRIPT-01 仍 blocked 时已落地的围栏与后续切换顺序。
type: architecture
scope: shared
level: reference
status: active
owner: architecture
version: 1
related:
  - ../current-runtime-truth.md
  - ../../requirements/use-cases/expert-long-interview-runtime.md
  - ../../requirements/use-cases/interview-answer-dual-write-fence.md
  - ../../requirements/use-cases/interview-answer-preview-submit.md
  - ./domain-events-catalog.md
---

# 面试答题双写切换图

本文是**当前落点盘点 + 切换顺序**，不是 `INT-TRANSCRIPT-01` 完成证明。目标文档若把 plaintext queue 写成已关闭，以 [运行时事实矩阵](../current-runtime-truth.md) 和本页为准。本页冻结的是 **答题双写互斥** 围栏与后续切换顺序。

用例：`requirements/use-cases/interview-answer-dual-write-fence.md`。证明：`pnpm int-answer-dual-write-fence:prove`（隔离 PostgreSQL，`releaseEvidence=false`）。

## 1. 盘点（与当前源码对齐）

| 路径 | 写什么 | 谁写 | 是否生产 HTTP | 是否原文 | 状态 |
| --- | --- | --- | --- | --- | --- |
| Legacy `/turn` → `claimInterviewAnswer` | `interview_question.answer_id` + 裸 SHA-256 `answer_hash` | `apps/api/src/modules/interview/interview.service.ts` | 是 | 否（低熵指纹） | 现行身份账本；删除流会清 hash |
| Legacy `/turn` → `enqueueInterviewJob` | `interview_job.payload` 含 TurnDto **明文 `answer`** | 同上 + `packages/db/src/interview-jobs.ts` | 是 | 是，至 job 终态 | `INT-P0-RAW-QUEUE` 仍 open |
| Worker hydrate | `loadClaimedInterviewAnswerPayload` 读明文 | `apps/worker/src/interview-consumer.ts` | 是 | 是，lease 内 | 图 checkpoint 只留 `answerId` |
| Job 终态 | `payload-'answer'` | `markJobDone` / `markJobFailed` | 是 | 剥离明文，保留 identity 字段 | 不是删除 receipt |
| Event / SSE | `answer_evaluated` 等：`answerId`/`answerHash`/题面/hint 分 | `apps/worker/src/adaptive-lifecycle.ts` → `appendEvent` | 是 | 否（源码无 `answer` 键） | 0126 禁止再写入**顶层** `answer`；嵌套键不拦 |
| Ledger rehearsal | `interview_answer_submission` + 加密 `interview_answer_artifact` + ref-only `interview_answer_job` | `packages/db/src/int-transcript.ts` `submitInterviewAnswer`；预览 HTTP 经 `InterviewService.submitPreviewAnswer` | 预览 `POST /interview/:id/answers`（`MEETWISE_PUBLIC_PREVIEW=1`）；非预览 404。**不是** 01 生产 write | 密文 + keyed HMAC | 受 0126 围栏；见 `UC-INT-TRANSCRIPT-PREVIEW-SUBMIT`。proof / SCOR rehearsal 仍可直调 |
| Transcript GET | 拼 event + ScoreCard | `interview.service.ts` `transcript()` | 读 | 无原文 | 不能当 canonical 回放 |

两条**正文家族**：

1. **Legacy plaintext family：** `interview_job.payload` 顶层 `answer` 键（短暂明文；`kind` 不豁免，`start` 带该键也算）+ question/event 上的裸 SHA-256。
2. **Ledger family：** 加密 artifact + HMAC 回执 + ref-only `interview_answer_job`（**不是** `interview_job`）。

危险点不是“生产路径已经双写”，而是没有机械互斥时，把 `/turn` 接到 `submitInterviewAnswer`、或把 TurnDto 展开进 event，会让同一答题事实出现两份正文。

## 2. 本轮已落地的安全围栏（不是 01）

迁移 `packages/db/migrations/0126_interview_answer_dual_write_fence.sql`，仓储 `packages/db/src/interview-answer-dual-write.ts`。触发器是安全边界；`enqueueInterviewJob` / `submitInterviewAnswer` / `appendEvent` 再调同一断言或先拒，错误码与 raw SQL 一致。编号：`0124`/`0125`/`0126`/`0127`/`0128`/`0129` 已在 `main`。预览 `/answers` 走 ledger 断言，不得改 0126 号，也不占用 0130。`0129` 是另一条隐私预览擦除账本，公开预览下 `/privacy/erasure-preview` 仍 503。

| 机制 | 代码 | 错误码 | 行为 |
| --- | --- | --- | --- |
| Legacy 明文断言 | `assert_interview_answer_legacy_plaintext_allowed`；仓储在 payload **含顶层 `answer` 键**（含 `""` / JSON `null`）时先调，**不看 kind**；触发器 `interview_job_answer_dual_write_guard`（`INSERT OR UPDATE OF payload, kind, interview_id`） | `interview_answer_legacy_plaintext_fenced` | 同身份已有**未物理删除**的 `interview_answer_artifact` 行则拒（`EXISTS` 不滤 `status`；`fenced`/`erased` 墓碑仍占位）。无 `questionId`（trim 后空）→ 该面试任意 artifact 即拒；有题无合法 `stateVersion` → 该题任意 version 即拒 |
| Ledger 断言 | `assert_interview_answer_ledger_write_allowed`；`submitInterviewAnswer` 先调；触发器 `interview_answer_artifact_dual_write_guard`（`INSERT OR UPDATE OF interview_id, question_id, state_version`） | `interview_answer_ledger_dual_write_fenced` | 已有**占用行**则拒：`kind=answer` 的 `interview_job`（含已剥明文仍带 `questionId` 的行），或任意 `kind` 且 payload 含 `answer` 键。无 `questionId` 的占用行对整场面试 fail-closed；有题无合法 `stateVersion` 的占用行对该题所有 version fail-closed。`questionId`/`stateVersion` 与对向写入同一套 trim + `^[0-9]+$` 数值比较 |
| 事件原文 | `appendEvent` 拒顶层 `answer` 键（object）或数组元素 `'answer'`（对齐 `jsonb ?`）；触发器 `interview_event_no_raw_answer_guard`（普通函数，不是 SECURITY DEFINER） | `interview_event_raw_answer_fenced` | `answerId` / `answerHash` 仍合法。嵌套 `{ turn: { answer } }` 不拦 |
| 并发 | 两断言对**整场面试**取同一把 `pg_advisory_xact_lock(hashtext('meetwise:interview_answer_writer:' \|\| interview))` | 同上 | 残缺身份与完整三元组同锁后再 `EXISTS`，禁止对向并发各过 |

**不掉现行生产路径：** `/turn` 在无 ledger 时继续写明文 payload。不把 job 改成 ref-only，不宣称 queue 已合规。无 `answer` 键的 `interview_job` 在已有 artifact 时仍可插入（不是明文双写）；该行若 `kind=answer` 仍会挡住**再写 ledger**。

证明只覆盖互斥与事件禁原文，不证明删除授权、删后 read=0、submission 跨浏览器回执或 01 HTTP。仓储路径跨 owner 不得用围栏码当存在 oracle；断言函数本身对 `app_role` 可 `EXECUTE`，**不**声称函数无 oracle。

## 3. 明确不做 / 禁止的宣称

- 不启用 01 真实用户 write route。
- 不把 ledger rehearsal 接到 `/turn`。
- 不把 plaintext job 当 canonical artifact，也不把它当 01 回退。
- 不在本轮删除 `answer_hash` 或停发 `answer_evaluated.answerHash`。
- 不重开删除入口，不改 00/01 双门。
- 不把“任意 `kind=answer` 行与 artifact 不能同表存在”写成事实（无 `answer` 键的 answer job 可以与 artifact 并存）。

## 4. 后续切换顺序（须另开任务）

```text
现在
  └─ 双写互斥 + 事件禁原文（0126，本页）
       └─ INT-TRANSCRIPT-00 组合根：独立 issuer / 逐 sink receipt
            └─ INT-TRANSCRIPT-01 同部署迁移：artifact/draft/item/ref-only-job/view + 删后 read=0
                 └─ 切断 /turn 明文 payload（不再写 answer 键）
                      └─ 只对**新题**打开 01 HTTP；历史 queued/running 明文走单独 legacy fence，不复制、不猜测
                           └─ 退役本互斥中“占用行存在则拒 ledger”的一侧（仅当 /turn 已不再写同身份 job）
```

每一步都要独立证明。跳步把 `/turn` 接到 ledger 会重新制造本围栏要挡住的双写。

## 5. 历史 queued/running 明文

已在队列里的 `payload.answer` **保持原样**。本围栏不回填、不升级、不猜测 question 身份。无 `questionId` 的明文占用行只产生“该面试不得再开 ledger”的 fail-closed；有题无合法 `stateVersion` 的占用行只产生“该题不得再开 ledger”。都不生成 artifact。
