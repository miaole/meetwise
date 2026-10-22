executed:awaiting_post_prove_dual

# 撤权后题干和报告正文仍写入调用账本

基线 `5ec6a101ebb60e5accd43458b712d4a520f9b117`。本步只新增这一份说明，不改产品代码。

## §0 锚

基线 `5ec6a101ebb60e5accd43458b712d4a520f9b117`。行号是在这棵树上打开文件看到的。

### 0.1 出题：预派发围栏只做一次，返回后整份 `{ q, refs }` 落账

`apps/worker/src/adaptive-interview-service.ts` 的 `AskSchema`（:24）是 `{ q, refs }`。`q` 是题干，最短 1、最长 2000。

`retrieveAndGenerate`（:457）里的 `generate`（:635）调用 `invoke`（:636-658）：

- :638 带了 `threadId` 和 `privacyInterviewId: d.threadId`。
- 没有 `storeOutput`，也没有 `redactOutput`。
- :640 schema 是 `AskSchema`。校验通过后，落账的就是模型返回的那份值，里面有 `q`。

预派发围栏在 `packages/ai-runtime/src/invoke.ts` 的 `invokeReserveAndDispatchPhase`（:919-928）。只有 `spec.privacyInterviewId` 有值才查 `isInterviewPrivacyActive`。查的是派发之前。模型返回之后，这条路径没有第二次核对。

`invokeExecuteAndSettlePhase`（:984）在 :992 等到模型返回。校验通过后 :1144-1146：没有 `storeOutput`、也没有 `redactOutput` 时，`stored` 就是整份值。:1161 把这份 `stored` 交给 `completeModelInvocation`，写入 `ai_model_invocation.output`。:1171 在结清事务提交之后，`persistTraceBestEffort` 用同一份 `stored` 写入 `ai_invocation_trace.output`。:1146 到 :1171 之间没有围栏核对。

`:0` 初诊键在 :541：`rollSeq === 0` 时是 `${threadId}:ask:t${turn}:0`。`scenario` 且本地和网页都空时，:583-588 走模板，不调用模型。`fundamental` 会调用模型。评分证明 :111-115 已经用空的 `localRetrieve` / `webExplore` 打到 `interviewer.ask`。

### 0.2 报告：围栏在 invoke 之前，正文先进入两列输出

`apps/worker/src/interview-service.ts` 的 `reportGenerator`（:346）。`ReportSchema`（:60-62）只有 `sections[].title` 和 `sections[].body`。`body` 是报告正文。`overall` 不在模型值里，:363 才由调用方拼上。

:350-360 的 `invoke` 没有 `privacyInterviewId`，没有 `storeOutput`，也没有 `redactOutput`。校验通过后，落账的是 `{ sections }`，正文在 `sections[].body`。

`apps/worker/src/main.ts:179` 已经把 `s.interviewId` 当作进度流键传进第五个参数。`packages/ai-graphs/src/report.ts:17` 的 `InterviewSummary.interviewId` 是必填。报告调用自己拿得到这场面试的标识，只是没放进现有的 `invoke` 参数。

`apps/worker/src/report-worker.ts` 的 `drainReportsOnce`（:152）在 :163-164 核对围栏，然后 :170 才跑报告图。那次核对在 `invoke` 之前。模型返回、账本写完，才回到 :181 的 `markReportReady`。

`packages/db/src/report/report.ts:44-49` 的 `markReportReady` 把正文写进 `ai_report.content`。`packages/db/migrations/0059_interview_privacy_projection_fence.sql:106-109` 的 `ai_report_privacy_projection_write_guard` 在插入或更新前调用 `assert_interview_privacy_active`。已经撤权时，这行写不进去。挡不住的是更早的两列：`ai_model_invocation.output` 和 `ai_invocation_trace.output`。不要把 `ai_report.content` 说成仍会写入正文。

### 0.3 结清函数只校验状态机

`packages/db/migrations/0174_ag06_settled_failed_usage_source.sql` 的 `ai_model_terminalize_scoped`（:37-99）核对属主、键长、状态、错误码、token、`usage_source`，然后做状态迁移。函数体不调用 `interview_privacy_active`。

成功行不能是空输出。:66-67：`succeeded` 且 `p_output IS NULL` 时抛 `ai_model_terminalize_success_invalid`。:69-70：`failed` 或 `unknown` 必须有错误码，而且 `p_output` 必须是 NULL，否则抛 `ai_model_terminalize_failure_invalid`。

`packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql:176-177` 的状态机守卫同样拒绝成功行上的 SQL NULL 输出（`ai_model_invocation_success_shape_invalid`）。:179-180 拒绝失败行上的非空输出。

`packages/db/src/model-op/model-invocation.ts:185-196` 的 `completeModelInvocation`：成功时把 `JSON.stringify(input.output)` 交给 `$5::jsonb`；失败时输出参数是 SQL NULL。`JSON.stringify(undefined)` 是 JavaScript `undefined`，驱动会把它收成 SQL NULL，成功结清会被上面的检查拒绝。`JSON.stringify(null)` 是 jsonb 的 `null`，账本列收得下，但 trace 那条插入若拿到 JavaScript `null`，会变成 SQL NULL。

`packages/db/sql/01_schema.sql:87` 的 `ai_invocation_trace.output` 是 `jsonb NOT NULL`。`packages/ai-runtime/src/invoke.ts:490-512` 的 `persistTrace` 把 `stored` 原样放进这个参数。:497 写明这列只存校验通过的成功输出。

`packages/db/migrations/0130_model_invocation_same_key_claim_join.sql:171-176`：成功且 `replayable` 时，同键再领把 `output` 当缓存交回；`replayable` 为 false 时不交回输出，错误码是已有的 `sensitive_result_replay_requires_artifact`。`invoke.ts:794` 缓存命中直接 `return { value: claim.output }`，不再跑 schema。

### 0.4 trace 没有隐私写触发器

`interview_privacy_active` 在 `packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql:88-111`。面试行不存在返回 false（:99-102）。存在撤权请求且状态落在 :109 那组里，也返回 false。`packages/db/src/checkpoint/checkpoint-privacy.ts:34-38` 的 `isInterviewPrivacyActive` 只读这个布尔，不抛错。

`packages/db/migrations/0058_interview_privacy_queue_fence.sql:111-113` 的 `interview_question_privacy_active_write_guard` 会挡住 `interview_question` 的插入和更新。已经撤权时，题干写不进这张表。不要把 `interview_question` 说成仍会写入题干。

在 `packages/db/migrations` 和 `packages/db/sql/01_schema.sql` 里，`ai_invocation_trace` 只有建表、加列、索引和授权，没有写触发器。

### 0.5 评分落库不是这次要修的

`apps/worker/src/interview-service.ts:185` 的评分调用带了 `storeOutput`。:119-124 的 `persistedEvaluation` 经 :110-112 的 `toEvidenceRecord` 只留 `start`、`end` 和 `quoteSha256`，不留 quote 原文。`apps/worker/src/score-writer.ts:93-98` 写卡只写 `span` 和 `spanDigest`。评分证明 :68-72 已经钉住 trace 里没有候选人原文。这次不要改这条。

`planCompetencies`（:330-337）也没有 `storeOutput` / `redactOutput`，并且带了 `privacyInterviewId`。它落的是能力名列表，不是题干，也不是报告正文。下面的核对会连它一起挡住原样落账。不要为它单写一条分支。

## §1 修法

只做这一件：模型已经返回、写入两列输出之前，再核对这场面试的围栏。已经撤权，就不把题干或报告正文写进 `ai_model_invocation.output` 和 `ai_invocation_trace.output`。

### 1.1 落账前再核对一次

核对放在 `invokeExecuteAndSettlePhase` 的成功结清事务里，`settleAiTextCost`（:1150-1154）之后、`completeModelInvocation`（:1161）之前。和 :919-923 一样，用 `isInterviewPrivacyActive`，不要用会抛错的 `assertInterviewPrivacyActive`。抛错会中止当前事务，落到 :1185 的 catch，把这次调用收成 `unknown`，钱也收成 `unknown`。那不是这次要的结清。

条件同时满足才替换输出：

- `spec.privacyInterviewId` 有值。
- 没有 `storeOutput`，也没有 `redactOutput`。评分的 span 记录和已经脱敏的输出保持原样。
- `validated.ok`。失败行本来就写 NULL 输出，而且不写 trace（:1171 有 `!error`）。不要把失败行改成成功。

围栏仍有效：`stored` 和 `replayable` 保持现在的算法（:1146、:1162）。未撤权时，题干和报告正文仍在两列里。

围栏已经失效：`stored` 改成 JavaScript 对象 `{}`。这是现有函数收得下的最小占位。`JSON.stringify({})` 是 `"{}"`，不是 SQL NULL，过得了 :66-67 和 :176-177。trace 的参数也不是 SQL NULL，过得了 :87 的 NOT NULL。不要传 `undefined`，也不要传 JavaScript `null`。不要为了空输出去改 SQL，不要新表，不要新迁移。

同一次还要把 `replayable` 设为 false。占位不是 `{ q, refs }`，也不是报告的 `sections`。若仍为 true，:171-173 和 :794 会把 `{}` 当成成功值交回。出题上层会把它看成出题失败再换键重打模型。false 沿用 :175 已有的 `sensitive_result_replay_requires_artifact`，不要新造错误码。

这次调用的内存返回值仍是 :1210 的 `{ value: value! }`，也就是校验通过的原文。不要改成错误。出题和报告的当前这次调用仍按成功往下走，不会因为这次核对再打一次模型。`interview_question` 和 `ai_report.content` 仍由已有触发器挡住，这次不要改那两个触发器。

有费用策略时，仍按现在的 token 调用 `settleAiTextCost`，不改金额，不走拒绝，不退款。没有费用策略时，不要为了这次去接一条价格。两列里的占位不参与计价。

`persistTraceBestEffort`（:1171）必须使用替换后的同一份 `stored`。两列要么都是原文，要么都是 `{}`。

### 1.2 报告把已有的面试标识传进现有参数

`reportGenerator` 的 `invoke`（:350）加上 `privacyInterviewId: s.interviewId`。用 `InterviewSummary` 上已经有的字段。不要新造 `invoke` 字段，不要新造数据库列，也不要只靠可选的 `progressStream`。`apps/worker/test/scoring-report-integrity.proof.ts:331` 和 `apps/worker/test/interview.proof.ts:354` 都没传第五个参数，但 `s.interviewId` 都有。

这个参数一传，:919 的预派发核对也会生效。撤权若发生在派发之前，仍走现有的 `privacy_fenced_pre_dispatch`，那时还没占费用，不要为此加退款。派发前面试行必须存在且属主相同，否则 :99-102 会把缺行收成未激活。这是现有参数的行为，不要为了绕开它再做一个只在返回后核对的新参数。

## §1.3 否决

- 否决把成功行改成 `failed` 或 `unknown` 来躲开非空输出。那会改结清，也会让出题换键重打。
- 否决在结清事务里调用 `assertInterviewPrivacyActive`。
- 否决因为这次去改价格、额度或产品，也否决改 229 与 271 两张表、能力项完成 33、半成 2、未收 14。
- 否决改 `storeOutput` 的评分形状，或改 `score-writer.ts` 的 span / `spanDigest`。
- 否决把 `interview_question` 或 `ai_report.content` 说成撤权后仍会写入正文。触发器已经会挡。
- 否决为规划单写分支，也否决顺手改规划的提示、schema 或能力名规则。
- 否决新表、新迁移、新证明文件、新的 `invoke` 字段。
- 否决改 `scripts/ai-docs/public-text-policy.mjs`。上限保持 2328。本步只加这一份说明。
- 否决改 `apps/api/src/modules/profile/profile.service.ts`、`packages/db/src/recruiting/recruiter.ts`、`apps/web/app/jobs/page.tsx`、`gateway_b_qualitative_projection`。
- 否决拿掉 `apps/worker/test/checkpoint-privacy-erasure.proof.ts:112` 的提前返回。那份证明的 `invoke`（:229）在公开入口暂停时跑不到，不能靠它做这次的活证明。

## §2 门

执行时要跑下面这些已有命令。脚本名对过根 `package.json`。

会改到的既有证明，就地改，不新建文件：

1. `pnpm scoring-integrity:prove`。根 `package.json:507`，隔离入口转到 `apps/worker/test/scoring-report-integrity.proof.ts`。这份证明已经走生产 `invoke`：出题经 `buildAdaptiveDeps` 的 `retrieveAndGenerate`，报告经 `reportGenerator`，结清是生产的 `completeModelInvocation`。:68-72 已经在读 `ai_invocation_trace`。不要新开证明文件。证明里禁止自己 `INSERT` 进 `ai_model_invocation` 或 `ai_invocation_trace`。撤权行沿 `apps/worker/test/commerce-reconcile.proof.ts:47-58` 的三张表夹具，用本证明的池提交。不要调用已经暂停的公开入口。

   `packages/ai-runtime/src/validators/index.ts:20` 的 `businessValidate` 是同步的，来不及在返回前提交围栏。撤权放在模型 `complete` 的最后一步：先提交围栏事务，再返回正文。派发前的核对（`invoke.ts:919`）那时已经通过。返回值到达 `invoke` 时围栏已生效，`completeModelInvocation` 还没跑。

   先给每条臂插入属于该属主的 `interview` 行，否则派发前就会被拒，模型不会跑。出题用 `fundamental`、空检索、`attempt` 为 0、`turn` 为 0，初诊键是 `${threadId}:ask:t0:0`。题面用这份证明 :97 已经能过 critique 的那种句子。不要用 `scenario` 且两边检索都空。

   - 撤权臂：内存里的返回值仍带题干，报告的返回值仍带正文。按幂等键读到的 `ai_model_invocation.output` 和 `ai_invocation_trace.output` 都是 `{}`，两列都没有题干，也都没有报告正文。状态是 `succeeded`，`error_code` 为空，`replayable` 为 false。模型只调用一次。同一 `deps`、同一 `turn` 再叫一次 `retrieveAndGenerate`，以及用同一报告键再叫一次 `reportGenerator`，都不得再打模型。
   - 未撤权臂：另一场没有撤权行的面试。两列输出里仍有题干，报告那列仍有正文。`replayable` 仍为 true。状态仍是 `succeeded`。

   :326-331 现有的报告调用用的面试标识是 `report-integrity`，这棵树上没有对应的 `interview` 行。在那次调用前给同一 `owner` 补上这行，否则新的派发前核对会让 `overall === 75` 失败。已有断言不要改口径。

2. `pnpm s4b-token-stream:prove`。根 `package.json:555`。`apps/worker/test/token-stream.proof.ts:214` 的报告标识没有 `interview` 行（:230 的插入是后面的自适应标识）。在这次 `reportGenerator` 之前补上属于 `OWNER` 的 `interview` 行。断言不要改。

3. `pnpm tokenstream:prove`。根 `package.json:551`。`apps/worker/test/tokenstream-progress.proof.ts:252` 的报告标识同样没有 `interview` 行。补上这行，让原来的 schema 失败仍然打到模型。断言不要改。

只复跑、不改文件：

- `pnpm interview:prove`。根 `package.json:283`。`interview.proof.ts` 里的报告面试行已经在。派发前核对应通过。
- `pnpm stress:prove`。根 `package.json:287`。`context-stress.proof.ts` 的 `largeInterview` 已经在。

另外必跑：

- `pnpm docs:check`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

lint 警告上限保持：根 5242（根 `package.json:8`）、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0。0 errors。低于上限可以通过。不许把这些上限改大，也不要改对应 `package.json` 里的 `--max-warnings`。

不写迁移唯一性门。本修法没有新迁移。

## §8

executed:awaiting_post_prove_dual
executed:awaiting_post_prove_dual

以上三处状态相同。产品代码本步不改。

## §9-EXEC

改过的文件：

- packages/ai-runtime/src/invoke.ts
- apps/worker/src/interview-service.ts
- apps/worker/test/scoring-report-integrity.proof.ts
- apps/worker/test/token-stream.proof.ts
- apps/worker/test/tokenstream-progress.proof.ts

命令退出：

- pnpm scoring-integrity:prove EXIT:0
- pnpm s4b-token-stream:prove EXIT:0
- pnpm tokenstream:prove EXIT:0
- pnpm interview:prove EXIT:0
- pnpm stress:prove EXIT:0
- pnpm docs:check EXIT:0
- pnpm turbo typecheck --force EXIT:0
- pnpm turbo lint EXIT:0

三处状态都已是 executed:awaiting_post_prove_dual。
