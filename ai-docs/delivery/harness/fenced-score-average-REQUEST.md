executed:awaiting_post_prove_dual

# 撤权后近期平均和成长答题次数仍计入围栏场次

基线 `c2da2eae0a0c775526296a83b475c616fe44cc8a`。分支 `line/fenced-score-average-draft`。工作树 `meetwise-fenceavg`。本步只新增这一份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0 已核对

### 0.1 总览先取围栏名单，场次和已答题数都排除它

`apps/api/src/modules/profile/profile.service.ts` 的 `overview`（:48）在 :58 执行 `SELECT thread_id FROM interview_privacy_fenced_targets()`，得到本事务内的围栏名单。

:59 的面试场次计数是 `SELECT status, count(*)::int n FROM interview i WHERE i.id != ALL($1::text[]) GROUP BY status`。参数就是这份名单。

:67-69 的已答题数来自 `interview_question`，条件是 `iq.status='answered'`，并且 `iq.interview_id != ALL($2::text[])`。第二个参数是同一份名单。

### 0.2 近期平均没有排除围栏面试

同一函数 :62 的近期平均是：

`SELECT avg(deterministic_total) avg FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')`

这句没有 `interview_id` 条件，也没有围栏名单。:74 把 `avg` 四舍五入后放进 `avgScore`。

### 0.3 成长评估做了围栏反连接，答题次数没有

`growth`（:85）在 :94 再取一次 `interview_privacy_fenced_targets()`。

:95-97 对 `assessment_report` 做了反连接：`status='ready'`，并且 `assessment_report.interview_id != ALL($2::text[])`。

答题次数是另一条语句，:100：

`SELECT count(*)::int n FROM score_card WHERE status IN ('practice_eligible','b_review_eligible')`

这句同样不带面试条件。:101 把这个数交给 `deriveGrowth`。响应里的答题次数是 `totals.answered`（`packages/domain/src/growth.ts:87`；契约说明在 `packages/contracts/src/index.ts:419-420`）。

### 0.4 卡上有面试列；读策略只限主人；撤权不改已经可练习的卡

`packages/db/migrations/0100_scoring_fact_root.sql:160`：`score_card.interview_id text NOT NULL`。

:267-270 的 `score_card_app_role` 是 `FOR SELECT TO app_role`，`USING` 只有 `owner_user_id = current_setting('app.principal_user', true)`。没有 `interview_privacy_active`。之后的迁移没有再建这条策略。

:223 给 `app_role` 的是 `SELECT`。这条角色不能自己改卡。

撤权走 `packages/db/migrations/0096_int_transcript_remaining_sinks.sql:323` 的 `interview_projection_begin_erasure`。它把 `interview_question.answer_hash` 清掉（:382-385），把仍有效的 checkpoint enrollment 标成撤销（:391-394），再为 `event`、`ai_graph_run`、`report` 和 `checkpoint_rows` 建目标（:398-428）。函数体没有 `score_card`。已经是 `practice_eligible` 的卡不会被这步改掉。

`0100:749-751` 的 `scoring_fence_score_request` 只把 `score_request` 里 `pending`、`claimed`、`dispatched` 改成 `fenced`，也不更新 `score_card`。

### 0.5 招聘方定性接口仍返回能力档

这是另一件事。`apps/api/src/modules/recruiter/recruiter.service.ts:125` 仍调用 `gateway_b_qualitative_projection`。:135-146 把 `strong_count`、`mid_count`、`weak_count`、`insufficient_count` 映射成能力档。函数在 `packages/db/migrations/0160_b_qualitative_projection.sql:91-111`：按 `owner_user_id` 和 `interview_id` 读卡，只排除状态 `superseded` 和 `fenced` 的卡，没有 `interview_privacy_active`。本说明不改这个接口，也不改这个函数。

### 0.6 不改账，不改上限

不新增迁移。不改价格、额度单位、产品。

批表仍是 229/271。能力项完成 33、半成 2、未收 14 维持。依据是台账管线末行 `ai-docs/delivery/harness/product-campaign-LEDGER.md:694`，以及 `ai-docs/delivery/execution-master-checklist.md:4312`。这一项不新计能力项，也不计入 271。本说明不改这两份台账。

受管文件上限已是 2328。`scripts/ai-docs/public-text-policy.mjs:132` 写明从 2320 加到 2328，:133 的 `MAX_FILES` 是 `2_328`。本说明会使扫描数加 1。不得再改这个上限。

## §1 修法

只改这两条读语句。平均和成长答题次数都排除 `interview_id` 属于这次已经取到的围栏名单的卡。

- 总览 :62：在现有 `status IN ('practice_eligible','b_review_eligible')` 上增加 `AND interview_id != ALL($1::text[])`。参数用 :58 已经取到的 `fenced`。不要为这句再查一次围栏函数。
- 成长 :100：同样增加 `AND interview_id != ALL($1::text[])`。参数用 :94 已经取到的 `fenced`。

空名单行为与现在一致。`interview_id` 是 `NOT NULL`（`0100:160`）。`!= ALL` 遇到空数组时不排除任何行，选出的卡和现在没有这句时相同。名单为空时不要改走另一条 SQL，也不要改成按 `interview_privacy_active` 逐行过滤。

:59 的场次计数、:67-69 的已答题数、:95-97 的评估反连接保持原句。

### 证明

总览这条读路径已经有证明：`apps/api/test/validate.ts`。:112-115 给 `userA` 的面试 `ASMT` 插入两张 `practice_eligible` 卡，`deterministic_total` 分别是 80 和 40。:547-563 请求生产 `GET /profile/overview`。只扩展这一份，不新开证明文件。

成长答题次数没有一份证明在调用生产 `growth` 的同时断言这条 `score_card` 计数。最近的档案证明是 `packages/db/test/growth.proof.ts`：:99-105 复制了与 :100 相同的计数，但 :102 的 `assessment_report` 查询没有生产 :96 的反连接，也不调用 `ProfileService.growth`。`apps/api/test/unstube-erase.proof.ts:217-240` 会调用生产 `GET /profile/growth`，围栏后只断言响应里不再出现那场面试的标识，不断言 `totals.answered`，也不插入 `score_card`。这两份都不要改，也不要另起脚本名。

扩展落在 `validate.ts` 的 :563 之后、:564 的设置回归之前。:547-563 已有断言不要改。:112-115 那两张卡的状态和分数不要改。

- 加卡之前，`userA` 的围栏名单应为空。此时总览 `avgScore` 应为 60，成长 `totals.answered` 应为 2。这就是空名单与现在一致。若名单不是空的，或这两个数不是 60 和 2，停手上报，不要改既有种子来凑数。
- 按 :96-115 的插入形状，再造一场只属于 `userA` 的新面试，以及一张 `practice_eligible` 卡，`deterministic_total` 为 0。主键和 `question_id` 用新的，不要复用 :82-95 已经占用的值。
- 围栏前再读：总览 `avgScore` 为 40，成长 `totals.answered` 为 3。
- 只用已经存在的 `POST /privacy/erasure-preview`（`apps/api/src/modules/privacy/privacy.controller.ts:41-48`）把这一场放进围栏，`scope` 为 `interview_data`。不要 `UPDATE score_card`。
- 围栏后这张新卡的 `status` 仍是 `practice_eligible`。总览 `avgScore` 回到 60，成长 `totals.answered` 回到 2。这场新面试不要插入已答题目，以免碰动总览题目账本的已答题数。

## §1.3 否决

- 不改写卡，不把已经 `practice_eligible` 的卡改成别的状态。
- 不改 `score_card_app_role`，不改 RLS，不往策略里加 `interview_privacy_active`。
- 不改 `gateway_b_qualitative_projection`，不改招聘方定性接口。
- 不新增迁移。不改价格、额度单位、产品。
- 不改 :59、:67-69、:95-97。
- 不新开证明文件。不改 `packages/db/test/growth.proof.ts`，不改 `apps/api/test/unstube-erase.proof.ts`，不改 `apps/worker/test/interview.proof.ts`。后者 :460-475 是另一份复制的读句，评估条件用的是 `interview_privacy_active`，不是这次已经取到的名单。
- 不改受管文件上限。不改批表 229/271。能力项完成 33、半成 2、未收 14 维持。
- 不把空名单改成另一条查询。

## §2 门

执行时跑这些已有命令。不跑出站清单，不跑迁移唯一性。本步没有新的模型调用，也没有迁移。

1. `pnpm api:validate`（根 `package.json:99`，经 `scripts/run-e2e-isolated.mjs:2691-2692` 跑到 `apps/api/package.json:10` 的 `validate`，目标文件 `apps/api/test/validate.ts`）。只许改 `profile.service.ts` 的那两条读语句，以及这个证明里新增的那一臂。

2. `pnpm docs:check`（根 `package.json:9`，即 `node scripts/ai-docs/check-docs.mjs`）。上限在 `scripts/ai-docs/public-text-policy.mjs:133`，值是 2328。本步新增一个受管文件，扫描数加 1。必须通过，不得超过 2328，也不要改这个上限。

3. `pnpm turbo typecheck --force`。

4. `pnpm turbo lint`。0 errors。警告不得超过各包现有 `--max-warnings`：根 `package.json:8` 为 5242，`apps/api/package.json:7` 为 1423，`packages/domain/package.json:10` 为 115，`packages/ai-runtime/package.json:14` 为 628，`apps/worker/package.json:7` 为 959，`packages/db/package.json:11` 为 1042，`apps/web/package.json:7` 为 601，`packages/qdrant-store/package.json:11` 为 27，`packages/ai-graphs/package.json:10` 为 47，`packages/contracts/package.json:12` 为 265，`packages/config/package.json:8` 为 0，`packages/db-mysql/package.json:8` 为 0。低于上限可以通过。不许放宽这些数。

est live=0。`actualSpendCny=null`。

## §8
executed:awaiting_post_prove_dual
executed:awaiting_post_prove_dual

以上三处相同。本步只新增这一份说明，不改产品代码。

## §9-EXEC

- 总览近期平均：`apps/api/src/modules/profile/profile.service.ts` 的 `overview` 在既有 `status IN ('practice_eligible','b_review_eligible')` 上增加 `AND interview_id != ALL($1::text[])`。参数是该函数已经取到的 `fenced`，没有再查围栏函数。
- 成长答题次数：同一文件的 `growth` 在同样的状态条件上增加 `AND interview_id != ALL($1::text[])`。参数是该函数已经取到的 `fenced`。空名单仍走这两句。
- 证明臂在 `apps/api/test/validate.ts`，打生产 `GET /profile/overview` 与 `GET /profile/growth`。空名单时均分 60、答题次数 2。新面试只属于 userA，一张 `deterministic_total` 为 0 的 `practice_eligible` 卡，未插入已答题目。围栏前均分 40、答题次数 3。`POST /privacy/erasure-preview`（`scope=interview_data`）之后，卡状态仍是 `practice_eligible`，均分回到 60，答题次数回到 2。
- 四条门退出码：`pnpm api:validate` 0；`pnpm docs:check` 0；`pnpm turbo typecheck --force` 0（Cached 0）；`pnpm turbo lint` 0。lint 0 errors，警告数 api 1423、根 5242，其余包未超过既有上限。
