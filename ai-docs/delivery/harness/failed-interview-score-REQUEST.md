executed:awaiting_post_prove_dual

# 失败或放弃的面试仍返回可练习分数

基线 `5ec6a101ebb60e5accd43458b712d4a520f9b117`。这一步只新增这份说明，不改产品代码。

## §0 锚

基线 `5ec6a101ebb60e5accd43458b712d4a520f9b117`。行号是在这棵树上打开文件看到的。

### 0.1 转写把可练习卡的总分放进每回合

`GET /interview/:id/transcript` 在 `apps/api/src/modules/interview/interview.controller.ts:200-202`，进 `interview.service.ts:781-782` 的 `transcript`，再进 `transcriptView`（`apps/api/src/modules/interview/interview-report.ts:59`）。

- :62 已经在读这场面试：`SELECT questions FROM interview WHERE id=$1`。选出的列没有 `status`。
- :82 `listScorableScoreCards(c, id)`。
- :83 用 `deterministicTotal` 按 `questionId` 建表。
- :90 `turns[].score` 取这张表，没有卡才是 `null`。不读事件里的 `score`。

`listScorableScoreCards` 在 `packages/db/src/scoring/scoring-aggregation.ts:98-103`，只执行 `scoring_list_scorable_score_cards($1)`。现行函数在 `packages/db/migrations/0161_practice_only_read_narrowing.sql:48-67`。`:66-67` 只按主人、`interview_id` 和 `status = 'practice_eligible'` 过滤，不读 `interview.status`。`0103` 里的旧函数已被这次替换盖住，不要改 `0103`。

### 0.2 评估在有可练习卡时返回总分和维度分

`GET /interview/:id/assessment` 在 `interview.controller.ts:212-214`，进 `interview.service.ts:791-792` 的 `getAssessment`，再进 `getAssessmentFor`（`apps/api/src/modules/interview/interview-assessment.ts:61`）。

- :64 读的是 `assessment_report` 的 `status, dimensions, overall`。这里的 `status` 是报告行的状态，不是面试状态。
- 没有报告行仍走 :69 的 404。
- 有报告行就进 :66 `requireCurrentScorableCards`。`:36-38` 调用 `aggregateInterviewScores`。可评分卡数不是 0 才把 :70 的整行返回，里面带 `overall` 和 `dimensions`。

`aggregateInterviewScores` 在 `packages/db/src/scoring/scoring-aggregation.ts:84-86`，只执行 `scoring_aggregate_interview_scores($1)`。现行函数在同一迁移 `:19-41`。`:39-41` 只按主人和 `interview_id` 读 `score_card`，可评分态是 `practice_eligible`，不读 `interview.status`。所以 `failed` 和 `abandoned` 不会被排除。

这两个读函数的签名都是 `(c, interviewId)`，本身不收面试状态。调用它们的 TypeScript 已经拿着同一事务里的连接，能读 `interview` 行。不要为了这个去替换 SQL 函数。

### 0.3 报告页不看面试状态，会把数字画出来

`apps/web/app/report/[id]/page.tsx` 的父级 :41-46 读了面试，但 :207 的 `AssessmentSection` 只收到 `id` 和 `resumeId`。`:248-253` 再请求上面两个接口。`:255-256` 取出维度和转写。`:273-274` 把 `d.score` 交给 `AbilityBar`。`:293` 把回合分交给 `AnnotationCard`。

`apps/web/components/AbilityBar.tsx:6` 在分数不是有限数字时画成 0。缺分和 0 分不是一回事。`AnnotationCard`（`apps/web/components/AnnotationCard.tsx:40-42`）只在 `score != null` 时画数字。`projectTurnAnnotations`（`apps/web/lib/report/turn-annotations.ts:35`）只在 `turn.score` 是数字时留下分数。

页头分数环 :59 和 :90-92 用的是报告正文里的 `overall`，不是这两条读路径。本说明不改报告生成。

`apps/web/app/interview/[resultId]/page.tsx:22` 只读 `GET /interview/:id`。它不取转写，也不取评估。不能把它当成已经不返回分数。

### 0.4 出题失败提交之后仍会写入可练习卡

`apps/worker/src/adaptive-lifecycle.ts` 的投影事务里，出题失败且这一答有分数时：`:516-521` 先写 `answer_evaluated`，`:528` 再 `writeGenerationUnavailable`。后者在 `:75` 调用 `failInterviewAndRelease`。`packages/db/src/commerce/commerce.ts:421-424` 把面试写成 `failed`（原先是 `created`、`waiting_user`、`migrating` 或 `paused`）。事务提交之后，`:583-593` 仍在 `generationFailed` 判断（`:596`）之前调用 `writeScoreCardAfterProjectionFenceTolerant`。条件只看租约、这一答不是未评分、不是澄清、以及分数是数字，不看面试状态。

`writeScoreCardAfterProjection`（`apps/worker/src/score-writer.ts:63`）不读 `interview.status`。`:102-107` 固定以 `targetStatus: 'practice_eligible'` 调用 `writeFinalScoreCard`。放弃走 `abandonInterviewAndRelease`（`commerce.ts:500`，`:532-534` 写成 `abandoned`）。写卡函数对 `abandoned` 同样不看状态，所以面试已经是这两种状态时仍可能新写可练习卡。

已写上的卡留在表里。读路径不看面试状态，就会把这些分数返回去。写入和读出是同一件事。

## §1 修法

只挡住 `failed` 和 `abandoned`。`completed`、`created`、`waiting_user` 以及其他不是这两种的状态，读和写都保持原样。

### 1.1 两条生产读路径不返回这张卡的分数

在现有 TypeScript 里用面试状态过滤。不新写迁移，不替换 `scoring_list_scorable_score_cards` 或 `scoring_aggregate_interview_scores`。

转写：`:62` 那条已经在读的查询补上 `status`。状态是 `failed` 或 `abandoned` 时，每个 `turns[].score` 都是 `null`，响应里不出现这张卡的 `deterministicTotal`。题面、判据和 outcome 仍返回。不要改去读事件里的 `score`。其他状态仍用 `:90` 的现有取值。

评估：在 `getAssessmentFor` 同一次 `asPrincipal` 里读 `interview.status`。没有报告行时，404 保持原样。状态是 `failed` 或 `abandoned` 且报告行还在时，仍成功返回，但不返回数字形式的 `overall`，也不返回任何带数字 `score` 的维度。不要改成 404，也不要借 `no_scorable_cards` 假装没有卡。其他状态仍走现有的 `requireCurrentScorableCards`，有卡时 `overall` 和 `dimensions` 原样返回。

### 1.2 已经是这两种状态时不再新写可练习卡

在 `writeScoreCardAfterProjection` 里、`claimScoreRequest` 和 `writeFinalScoreCard` 之前，用这个函数已经打开的主人连接读 `interview.status`。状态是 `failed` 或 `abandoned` 时直接跳过：不领取请求，不调用 `scoring_write_final_score_card`，不插入新的 `practice_eligible` 卡。不更新已有卡的状态，不删除卡，也不改卡的枚举。

不改出题失败之后写终态、退还额度和删除检查点的先后。调用点可以仍在事务提交之后；挡住新写的是写卡函数自己。

### 1.3 报告页没有数字就不画分数

接口不再给数字时，`apps/web/app/report/[id]/page.tsx` 不要再画这个分数。不新加路由，也不在页面上改按面试状态隐藏。

维度条只在 `d.score` 是有限数字时交给 `AbilityBar`。缺分不能落到该组件的 0。回合分不是有限数字时不画分数。`projectTurnAnnotations`、再练入口和「去练」的现有字面保持，`apps/web/test/web-logic.proof.ts` 已经钉住这些字面。

## §1.3 否决

- 不把 `failed` 或 `abandoned` 的分数改成 0，也不把缺分画成 0。
- 不修改、不删除已经写上的卡，不改卡的状态枚举。
- 不替换 `scoring_list_scorable_score_cards`、`scoring_aggregate_interview_scores`、`scoring_write_final_score_card`。不新写迁移，不改 `0103` 或 `0161`。
- 不改 `apps/api/src/modules/profile/profile.service.ts`。那里正在改近期平均和成长答题次数。
- 不改 `packages/ai-runtime/src/invoke.ts`。不改 `apps/worker/src/adaptive-interview-service.ts` 的出题。不改 `apps/worker/src/interview-service.ts` 的报告生成。那里正在改调用账本。
- 不改 `apps/worker/src/main.ts` 里报告摘要对可练习卡的读取，不改 `packages/db/src/growth-generation.ts`。
- 不改 `packages/db/src/recruiting/recruiter.ts`、`apps/web/app/jobs/page.tsx`、`gateway_b_qualitative_projection`。
- 不改价格、额度、商品。不改 229 与 271 那两张表。不改能力项 33、2、14。
- 不改 `scripts/ai-docs/public-text-policy.mjs`。受管文件上限保持 2328。本说明只加这 1 份。
- 不改 `GET /interview/:id` 的结果页。它本来就不取分。
- 不改分享页，不新加路由，不改评估的生成入口，不改职业路径和学习计划。
- 不用隐私围栏代替 `failed` 和 `abandoned`。
- 证明不新开文件。不在测试里复制 SQL。不改 `apps/api/test/neg-interview.proof.ts` 里那份自建函数。不改既有种子的数字来凑结果。

## §2

读路径扩展 `apps/api/test/validate.ts`。它已经用 `createApp()` 请求生产的 `GET /interview/:id/transcript` 和 `GET /interview/:id/assessment`，会进 `transcriptView` 和 `getAssessmentFor`。命令是根脚本 `pnpm api:validate`（`package.json` 里这条走隔离库，并设置预迁移）。不要改去直连开发库。

断言只通过这两个生产接口，不要在测试里另写一份查询来判断「返回了没有」：

- 既有 `ASMT` 保持 `completed`，种子数字 80、40、60 不动。`GET /interview/ASMT/assessment` 的 `overall` 仍是 60。`GET /interview/ASMT/transcript` 的两回合分数仍是 80 和 40。
- 另建一场 `failed`、一场 `abandoned`。各自带已有的 `practice_eligible` 卡、报告行和能对上的转写。不要改 `ASMT` 或 `EVDEL` 的行。这两场的转写回合分是 `null`，不是 0，也不是卡上的总分。评估响应里没有数字 `overall`，也没有带数字 `score` 的维度。卡行还在，状态仍是 `practice_eligible`。
- 再另建一场不是 `failed`、也不是 `abandoned` 的面试（`created` 或 `waiting_user`），用新的 id 和自己的卡。转写和评估仍返回数字。用来证明不是只放行 `completed`。

写路径不新开文件。扩展 `apps/worker/test/interview.proof.ts`。它已经调用生产的 `writeScoreCardAfterProjection`。命令是根脚本 `pnpm interview:prove`。既有 `IID2` 仍是 `created`，既有四张卡和分数断言不动。用新的面试 id：状态已经是 `failed` 或 `abandoned` 时，调用这个生产函数不得新写卡；若事先有一张 `practice_eligible` 卡，它的状态和行数保持不变。`created` 的既有路径仍写入。

另外必跑：

- `pnpm docs:check`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

lint 警告上限保持：根 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0。0 errors。低于上限可以通过。不许放宽这些上限，也不要改对应 `package.json` 里的 `--max-warnings`。

## §8

executed:awaiting_post_prove_dual
executed:awaiting_post_prove_dual

这一步只新增这份说明，不改产品代码。

## §9-EXEC

产品改动已在 `13ea7c4ac2ec5c97176b5e2bd79d518d06461414`。失败或放弃时，转写和评估成功不再带上数字，报告页没有有限数字就不画维度条和回合分。这两种状态也不再新写可练习卡。已有的卡不改写、不删除。上面 §0 到 §8 除三处状态外没有改写。

改过的文件：

- apps/api/src/modules/interview/interview-assessment.ts
- apps/api/src/modules/interview/interview-report.ts
- apps/api/test/validate.ts
- apps/web/app/report/[id]/page.tsx
- apps/worker/src/score-writer.ts
- apps/worker/test/interview.proof.ts

三处状态都已是 executed:awaiting_post_prove_dual。五条命令的退出码待跑完再补。

## §9-EXEC

产品改动已在 `13ea7c4ac2ec5c97176b5e2bd79d518d06461414`。失败或放弃时，转写和评估成功不再带上数字，报告页没有有限数字就不画维度条和回合分。这两种状态也不再新写可练习卡。已有的卡不改写、不删除。上面 §0 到 §8 除三处状态外没有改写。

改过的文件：

- apps/api/src/modules/interview/interview-assessment.ts
- apps/api/src/modules/interview/interview-report.ts
- apps/api/test/validate.ts
- apps/web/app/report/[id]/page.tsx
- apps/worker/src/score-writer.ts
- apps/worker/test/interview.proof.ts

三处状态都已是 executed:awaiting_post_prove_dual。五条命令的退出码待跑完再补。
