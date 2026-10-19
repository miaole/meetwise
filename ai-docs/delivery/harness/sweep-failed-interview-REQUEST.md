draft:awaiting_pre_exec_dual

# 失败面试上过期的运行作业不再回到排队

基线 `2af55cce96efdc12e358fd0e3c8e870d690022ac`。本步只写说明，不改产品代码，不改测试。

## §0 锚

基线 `2af55cce96efdc12e358fd0e3c8e870d690022ac`。下面的行号是在这棵树上打开文件看到的。

### 0.1 改回排队的语句不读面试状态

`packages/db/src/interview/interview-jobs.ts` 的 `sweepStuckInterviewJobs`（`:320-343`）。未达次数上限、租约已过期的 running 作业由 `:327-330` 这一条更新写回 queued：

```sql
UPDATE interview_job SET status='queued', lease_owner=NULL, lease_expires_at=NULL, version=version+1
 WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2
```

参数是 `[owner, maxAttempts]`（`:330`）。谓词里没有 `interview.status`。面试行已经是 `failed` 时，这条作业仍回到 queued。

同一函数里另外两条更新本说明不动：

- `:323-326`：`status='running' AND lease_expires_at < now() AND attempts >= $2` 写成 `failed`，`last_error='reaped:worker_died'`。
- `:332-335`：`status='queued' AND attempts >= $2` 写成 `failed`，`last_error='reaped:retry_exhausted'`。

返回对象在 `:337-342`：`requeued` 是 `:327-330` 的 `rowCount`，`failed` / `failedInterviews` 只来自 `:323-326`。`:331` 的 `reaper_takeover` 日志仍看这条语句的 `rowCount`。这三处都不改。

### 0.2 领取条件也不读面试状态

同文件 `claimNextInterviewJob`（`:143-188`）。领取谓词在 `:156-167`：作业自己是 queued（可带 `next_attempt_at`）或 running 且租约已过期且 `attempts < $4`（`:162-163`）。`:167` 只排除「同一面试已有 `interview_job.status='failed'` 的兄弟行」，不读 `interview.status`。本说明禁止改这条 SQL，包括 `:153-179` 的整段更新。

`interview_privacy_active`（`packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql:88-112`）只判断面试行在不在、以及擦除请求，不读 `interview.status`。不要改这个函数。

### 0.3 放弃只更新仍 queued 的作业

同文件 `failQueuedInterviewJobsOnAbandon`（`:273-281`）。`:277` 把 `last_error` 写成已有字面量 `abandoned`。`:279` 的 WHERE 是 `owner_user_id=$1 AND interview_id=$2 AND status='queued'`。running 不在这句里。本说明禁止改这个 WHERE，也禁止把清 `payload` 的动作搬进收割语句。

### 0.4 押题收割是另一条语句

`packages/db/src/jobs/quiz-jobs.ts` 的 `sweepStuckQuizJobs`（`:84-97`）。改回排队的是 `:91-94`，对象是 `quiz_job`。本说明禁止改它。

### 0.5 既有证明夹具的面试不是 failed

`packages/db/test/authz5a2-stale-payload-ttl.proof.ts:61` 插入的面试 `status` 是 `active`。`:76-78` 两行 running 的 `attempts=1`，小于 `MAX_INTERVIEW_JOB_ATTEMPTS`（`interview-jobs.ts:15`，值是 5）。`:100-102` 断言 `requeued === 2`、`failed === 0`。`:105` 断言刚过期的那行扫完是 queued。面试不是 `failed`，这些预期计数不要改，这个证明文件不要改。

`apps/worker/test/reaper.proof.ts:61` 的两场面试 `status` 是 `created`。`:86-88` 续租后租约未过期，`sweepStuckInterviewJobs` 的 `requeued` 与 `failed` 都是 0，作业仍是 running。`:91-97` 在 `attempts = MAX_INTERVIEW_JOB_ATTEMPTS - 1` 时经 `reapStuckInterviewJobs` 回到 queued，次数不增。`:100-104` 在次数已达上限时收成 failed。`:110-121` 是押题。这些断言保持原样。

## §1 修法

只改 `sweepStuckInterviewJobs` 里 `:327-330` 那一条「改回 queued」的 UPDATE。不改函数签名，不改另外两条 UPDATE，不改 `:331` 与 `:337-342`，不改调用方 `apps/worker/src/interview-consumer.ts` 的 `reapStuckInterviewJobs`（`:631-653`）。

WHERE 保持现在这四项，命中的行集不变：`owner_user_id=$1`、`status='running'`、`lease_expires_at < now()`、`attempts < $2`。没有面试行的作业仍在这个行集里。不要用内连接把这种行滤掉。

SET 仍把 `lease_owner` 与 `lease_expires_at` 写成 NULL，`version` 加 1。不改 `payload`，不写 `next_attempt_at`。`status` 与 `last_error` 按同一条语句里读到的面试状态分支：

- 相关子查询：`interview.id = interview_job.interview_id` 且 `interview.owner_user_id = interview_job.owner_user_id`。读到的 `status` 恰好是 `failed` 时，作业 `status='failed'`，`last_error='abandoned'`。这个字符串就是 `:277` 已有的 `abandoned`，不要新造。
- 读不到面试行，或 `status` 不是 `failed`（含 `created`、`active`、`abandoned`、`completed`）：`status='queued'`，`last_error` 保持原值。行为与现在相同。

次数已达上限的 running 作业仍先走 `:323-326`，`last_error` 仍是 `reaped:worker_died`，即使面试已经是 `failed` 也不改成 `abandoned`。租约未过期的 running 作业仍然不匹配本 WHERE，不动。

`requeued` 仍是本条语句的 `rowCount`。面试已是 `failed` 而被写成 failed 的行算在这个 `rowCount` 里，不进入 `failed` 或 `failedInterviews`。因此 `reapStuckInterviewJobs`（`:634-640`）不会为这些行再调用 `terminalizeUnsettledInterview`，不会再发终态事件，也不会再退预留。不要为了把计数拆开去改返回对象。

## §1.3 否决

- 否决改领取 SQL：`claimNextInterviewJob` 的 `:153-179` 保持原样，不在领取条件里加 `interview.status`。
- 否决改 `failQueuedInterviewJobsOnAbandon`：`:279` 的 WHERE 仍只含 `status='queued'`。running 仍不由这个函数更新。
- 否决改押题收割：`sweepStuckQuizJobs` 的 `:91-94` 不改。诊断作业的收割也不改。
- 否决新增迁移。不新增表、列、约束或函数。
- 否决新增测试文件。不新开 npm script。证明只扩 `apps/worker/test/reaper.proof.ts`。
- 否决失败面试仍回到 queued：面试行 `status` 恰好是 `failed` 时，本条命中的作业不得写成 queued。
- 同时否决：新造 `last_error` 字符串；改 `:323-326` 与 `:332-335` 的语义；改 `:337-342` 把这些行放进 `failedInterviews`；改 `packages/db/test/authz5a2-stale-payload-ttl.proof.ts` 的预期计数；把租约未过期的 running 作业一并收掉。

## §2 门

执行时只改 `interview-jobs.ts` 的那一条 UPDATE，并只在 `apps/worker/test/reaper.proof.ts` 末尾、`:158` 的心跳节之后、`:160` 的汇总日志之前，加一节。前面①到⑦的断言不改。新节直接调用生产函数 `sweepStuckInterviewJobs`，不经过 `reapStuckInterviewJobs`。

沿用本证明已摄取的简历与 `resumeEpoch`。新插两场面试，都不调用 `reserveEntitlement`。`packages/db/migrations/0144_db_trigfam_unify.sql:400` 会调用 `tf_interview_consumption_terminal_pair`；`0173_tf_interview_consumption_terminal_pair.sql:46-48` 在没有消费行时直接返回，`:55-57` 则要求已有消费行在 `failed` 时必须是 `released`。所以失败那场在插入时 `status` 就是 `failed`，且没有消费行。另一场 `status` 用与 `:61` 相同的 `created`。

两场都 `enqueueInterviewJob` 一条 start，再写成 running：租约所有者取现有孤儿夹具那种已死租约，`lease_expires_at` 比现在早 5 分钟，`attempts` 为 `MAX_INTERVIEW_JOB_ATTEMPTS - 1`。然后 `asPrincipal` 调用 `sweepStuckInterviewJobs(c, OWNER)`，使用默认次数上限。

扫完后的断言：

- `failed` 那场的作业：`status` 是 `failed`，`last_error` 是 `abandoned`，不是 queued。
- `created` 那场的作业：`status` 是 `queued`，`lease_owner` 与 `lease_expires_at` 都是 NULL，`attempts` 仍是 `MAX_INTERVIEW_JOB_ATTEMPTS - 1`，`last_error` 不是 `abandoned`。
- 随后 `claimNextInterviewJob(c, OWNER, 'reaper-1')` 领到的是 `created` 那场，领不到 `failed` 那场。

不要把 `requeued === 0` 或 `failed === 1` 写成这一节的断言。本条语句的 `rowCount` 仍计入被写成 failed 的那一行。

`authz5a2-stale-payload-ttl.proof.ts` 不改。它的面试是 `active`，修完后 `:101-102` 的 `requeued === 2` 与 `failed === 0` 仍然成立。

必跑：

- `pnpm reaper:prove`（根 `package.json:292` 转到 `node scripts/run-e2e-isolated.mjs reaper:prove:raw`；`scripts/run-e2e-isolated.mjs:2497-2498` 再转到 `pnpm -C apps/worker prove:reaper`；`apps/worker/package.json:24` 是 `tsx test/reaper.proof.ts`）
- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`pnpm turbo lint` 必须是 0 errors。警告上限恰为各包现有的 `eslint --max-warnings`：root 5242（根 `package.json:8`）、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0。低于上限可以通过，等于上限也可以。不许把任一上限改大。

## §8

draft:awaiting_pre_exec_dual

以上说明的产品代码本步不改。

draft:awaiting_pre_exec_dual
