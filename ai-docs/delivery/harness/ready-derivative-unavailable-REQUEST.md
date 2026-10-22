executed:awaiting_post_prove_dual

# 已就绪的押题和诊断不再报不可用

基线 `a19fa63d2a7f991a11106fd79b09a2fa68bbd10d`。本步只新增这一份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0 锚

### 0.1 成功路径：先确认消耗并写成 ready，之后才标记作业完成

`apps/worker/src/quiz-lifecycle.ts` 的 `runQuiz` 在 :53-74 用一个事务交付。:59 `confirmConsumption(c, owner, quizId, 1)`。:60-61 只接受 `confirmed` 或 `partial_confirmed`。:66 才 `UPDATE resume_quiz SET status='ready'`，且 :67 要求当时仍是 `generating`。:70 零行就抛 `quiz_status_conflict`，整段回滚。事务返回之后，`apps/worker/src/quiz-consumer.ts` 的 `drainQuizJobOnce` 才在 :35 调用 `markQuizJobDone`，:36 返回 `generate`。

诊断同形。`apps/worker/src/diagnosis-lifecycle.ts` 的 `runDiagnosis`：:63 先 `confirmConsumption(c, owner, diagnosisId, 1)`，:64-65 同样只接受这两种结算，:68 才 `UPDATE resume_diagnosis SET status='ready'`。事务返回之后，`apps/worker/src/diagnosis-consumer.ts:34` 才 `markDiagnosisJobDone`，:35 返回 `generate`。

两处文件头注释把顺序写成先 ready 再确认。代码不是那样。以 :59 然后 :66、:63 然后 :68 为准。两次写入在同一个事务里一起提交，提交点都在标记作业完成之前。

### 0.2 失败路径：不把 ready 倒退，但仍发出不可用并调用释放

`drainQuizJobOnce` 的 catch 在 :37-63。:42 用 `errCode` 认出遗留简历引用。遗留走 :47-52 那条把作业标成 `failed` 并清掉 payload 的更新；其余走 :53 `markQuizJobFailed`。:54 租约已丢则从回调返回，不发事件、不释放、不加失败计数。租约仍在时 :55 `getMetrics().inc(METRIC.jobsFailed, { queue: 'quiz_job' })`。:57 把父行标成 `failed`，谓词是 `status NOT IN ('ready')`，所以已经 ready 的行不会被改成 failed。紧接着 :59 仍然 `appendEvent(..., 'quiz_unavailable', ...)`，:61 仍然 `releaseConsumption(c, owner, job.quizId)`。:63 外层返回 `failed`。

诊断 catch 在 `diagnosis-consumer.ts:36-62`。:44 同样先认遗留引用。遗留走 :45-50 那条把作业标成 `failed` 并清掉 payload 的更新；其余走 :51 `markDiagnosisJobFailed`。:52 租约已丢则返回。:53 对 `diagnosis_job` 增加 `jobsFailed`。:55 父行 `NOT IN ('ready')`。:57 仍然追加 `diagnosis_unavailable`。:59 仍然 `releaseConsumption`。:61 外层返回 `failed`。

`packages/db/src/commerce/commerce.ts` 的 `releaseConsumption`（:282-301）在 :290 看到 `confirmed` 或 `partial_confirmed` 时直接返回 `{ status: 'error', reason: 'already_confirmed' }`。退回预留的更新在 :292 之后，这条返回走不到。已确认的消耗不退款。消费者把这个返回值丢掉，`.catch` 只吞抛错。

### 0.3 前端：不可用事件盖住已经就绪的阶段

`apps/web/lib/stream/quiz-state.ts` 的 `applyQuizEvent` 在 :95 遇到 `quiz_unavailable` 就把 `phase` 设为 `quiz_unavailable`，并把 `degraded` 设为 true。不看原来是不是 `ready`。`quizDisplay` 在 :153 按阶段分支；:162-165 的「押题完成」因此不再显示，:166-167 显示「押题暂不可用」。

`apps/web/lib/stream/diagnosis-state.ts` 的 `applyDiagnosisEvent` 在 :85 把阶段改成 `diagnosis_unavailable`。`diagnosisDisplay` 的 :147-149 是「诊断完成」，:151-152 是「诊断暂不可用」。同样是后来的事件盖住已经就绪的内容。

### 0.4 收割路径已经躲开已确认

`reapStuckQuizJobs`（`quiz-consumer.ts:75-89`）只处理 `sweepStuckQuizJobs` 返回的 `failedQuizzes`。:80 先 `releaseConsumption`。:82 `alreadySettled` 为真的条件是 `status === 'error'` 且 `reason === 'already_confirmed'`。:83-86 在这个条件成立时既不改父行，也不发 `quiz_unavailable`。

`reapStuckDiagnosisJobs`（`diagnosis-consumer.ts:73-87`）同形。:78 先释放，:80 判断 `already_confirmed`，:81-84 为真时不发 `diagnosis_unavailable`。

达上限才会进入这个循环。`packages/db/src/jobs/quiz-jobs.ts:9` 的 `MAX_QUIZ_JOB_ATTEMPTS` 是 5。`sweepStuckQuizJobs`（:84-96）里 :87-90 只把 `attempts >= 上限` 的过期 running 标成 failed 并返回 quiz id；:91-94 把 `attempts < 上限` 的过期 running 重新入队为 `queued`，不放进 `failedQuizzes`。诊断是 `diagnosis-jobs.ts:10` 与 :75-87，:82-85 为未达上限的重新入队。

### 0.5 未达上限重新入队之后的再领取

领取 SQL 不看父行状态。`claimNextQuizJob`（`quiz-jobs.ts:36-47`）只要求作业是 `queued`，或 running 且租约过期且 `attempts` 未达上限。`claimNextDiagnosisJob`（`diagnosis-jobs.ts:28-39`）一样。

父行已经 ready 时，再跑生命周期会在改写题目之前抛错。`runQuiz` 的 :31-33 把父行改成 `generating` 的条件是 `status='created'`。不是 created（已经是 ready）则 :37 抛 `quiz_resume_reference_conflict`。`graph.invoke` 在 :48，抛错在它之前，题目不会重写。`runDiagnosis` 更早：:21-27 的读取就要求 `status='created'`，不是就抛 `diagnosis_resume_reference_conflict`。图在 :52。:34-42 的 generating 更新也要求 created。

这次抛错仍进 §0.2 的 catch。租约是刚领到的，标记失败会成功，父行因为 ready 而不倒退，但不可用事件照发，`releaseConsumption` 对已确认消耗返回 `already_confirmed` 且不退款，`jobsFailed` 仍增加，作业变成 failed 而不是 done。收割那条 `already_confirmed` 短路覆盖不到这条，因为未达上限时 id 不会出现在失败列表里。

## §1 修法

只改两处消费者 catch：`quiz-consumer.ts` 的 `drainQuizJobOnce`（:37-63）和 `diagnosis-consumer.ts` 的 `drainDiagnosisJobOnce`（:36-62）。

遗留简历引用保持今天的行为。`isLegacyReference` 为真时，仍走现在的终态更新（押题 :47-52，诊断 :45-50），租约仍在就仍增加 `jobsFailed`、仍按 `NOT IN ('ready')` 更新父行、仍追加不可用事件（原因仍是 `legacy_reference_unresolved`）、仍调用 `releaseConsumption`。不要因为父行碰巧是 ready 就改这条。

不是遗留引用时，先在同一次 `asPrincipal` 回调里读父行 `status`。恰好是 `ready` 才走下面这条，不要先 `markQuizJobFailed` / `markDiagnosisJobFailed` 再标记完成：

- 持有租约的判断就是生产函数自己的 CAS。押题调用 `markQuizJobDone(c, owner, job.id, d.leaseOwner)`，诊断调用 `markDiagnosisJobDone(c, owner, job.id, d.leaseOwner)`。
- 返回 true：不追加 `quiz_unavailable` 或 `diagnosis_unavailable`，不调用 `releaseConsumption`，不增加 `jobsFailed`，不改父行。外层返回 `generate`。
- 返回 false（租约已丢）：同样不发事件、不退款、不增加失败计数、不改父行，也不要把作业标成 failed。外层不要返回 `generate`。回调结束后仍用今天 :63 / :61 的 `failed` 返回，表示这一拍没有完成交付。不要另加第四种返回值。

父行不是 `ready`（含 `generating`、`created`、`failed`，或行不存在）时，保持今天的失败路径：标记作业失败、租约仍在才增加 `jobsFailed`、父行仍只在 `NOT IN ('ready')` 时写成 failed、仍追加不可用事件、仍 `releaseConsumption`。空事实、空题目、空报告、结算失败这些还没交付的失败，继续报不可用并释放预留。

## §1.2 证明

只扩展 `apps/worker/test/uc-e2e-016-nhp-fault.proof.ts`。不要新增受管文件，也不要新增 npm script。

这份证明已经在调用消费者和作业函数。:50 的 `quizDispatchTick` 进入 `quiz-consumer.ts:93-103`，里面会调用 `drainQuizJobOnce`。:51 的 `diagnosisDispatchTick` 进入 `diagnosis-consumer.ts:91-101`。:44 已经导入并在 :237、:254 调用 `sweepStuckQuizJobs` 与 `sweepStuckDiagnosisJobs`。:155-163 的 PC 已经用生产调度把押题和诊断跑到父行 `ready`、作业 `done`、消耗已结算。

插在 :278 那条 N1 台账断言之后、:280 的 F6 收据之前。不要改 `QUIZ_FLOWS`、`DIAG_FLOWS`、`SETTLED_FLOWS`、`EXPECTED_FINAL_AVAIL`，不要改 :222-246 的达上限收割，也不要把新断言放到 :278 之前。PC 的消耗已经算进 confirmed = 6。新断言不得再预留或确认一笔，也不得把这笔改成 released。

对 `QID('PC')` 与 `DID('PC')` 各做一遍，两遍都调用生产函数：

1. 记下父行仍是 `ready`、`entitlement_consumption.status` 仍是 `confirmed`（幂等键就是这个押题 id 或诊断 id）、`quiz_unavailable` 或 `diagnosis_unavailable` 的条数是 0、押题的 `questions` 与 `report`（诊断是 `report`）的当前内容，以及 `getMetrics().render()` 里 `worker_jobs_failed_total{queue="quiz_job"}` 或 `{queue="diagnosis_job"}` 的当前值。序列还不存在就当作 0。渲染格式来自 `packages/ai-runtime/src/metrics.ts:18` 与 :42，标签是 `queue="quiz_job"` / `queue="diagnosis_job"`。
2. 只改作业行，把该作业放回 `running`、租约所有者不是即将领取的那一个、`lease_expires_at` 已过期。`attempts` 保持小于 5，不要写成 `MAX_QUIZ_JOB_ATTEMPTS` 或 `MAX_DIAGNOSIS_JOB_ATTEMPTS`。不要改父行，不要改消耗。
3. 调用生产的 `sweepStuckQuizJobs` 或 `sweepStuckDiagnosisJobs`。断言 `requeued === 1` 且 `failed === 0`。此时还没有不可用事件。
4. 再调用生产的 `drainQuizJobOnce` 或 `drainDiagnosisJobOnce`。模型用 `complete` 一被调用就抛错的客户端，不能靠它重新生成题目或报告。租约所有者用这一拍自己的新值。

断言：

- 返回值是 `generate`。
- 不可用事件仍然是 0 条。
- 父行仍是 `ready`，题目或报告与再领取前相同。
- 消耗状态仍是 `confirmed`，可用额度与这一拍之前相同。
- 对应队列的 `worker_jobs_failed_total` 不增加。
- 作业状态是 `done`，不是 `failed`。
- 模型的 `complete` 没有被调用。

`apps/worker/test/resume-derivative-reference.proof.ts` 已经直接调用这两个 drain，但 :117-135 的 `PRES006` 是遗留引用，必须继续失败、继续有不可用事件、继续退回预留。不要改那条断言，也不要在那份证明里混进 ready 分支。

## §1.3 不改

- 不改 `reapStuckQuizJobs` / `reapStuckDiagnosisJobs` 里 `already_confirmed` 的判断，也不改达上限才发事件的条件。
- 不把已经 ready 的父行倒退成 failed，也不删掉失败路径和收割路径上 `NOT IN ('ready')` 这个谓词。
- 不改遗留简历引用那条路径的终态、清 payload、事件原因和释放。
- 不改 `releaseConsumption`。已确认仍返回 `already_confirmed`，仍不退款。
- 不改 `runQuiz` / `runDiagnosis` 的提交顺序：仍是先确认消耗，再写成 ready，再由消费者标记作业完成。
- 不改 `quiz-state.ts` 与 `diagnosis-state.ts` 的归约。网页收到不可用事件仍会把阶段改成不可用；修的是已就绪之后不再发这个事件。
- 不改 `claimNextQuizJob` / `claimNextDiagnosisJob` 的领取 SQL。
- 不改 `sweepStuckQuizJobs` / `sweepStuckDiagnosisJobs` 的重新入队 SQL，也不改两个上限常量。
- 不新增迁移，不改 `owner-queue-drain.ts`。

## §2 门

按这个顺序：

1. `pnpm uc016:nhp-fault:prove`。根 `package.json:131`，转到 `apps/worker/package.json:38` 的 `prove:uc016-nhp-fault`。就是 §1.2 那一份现有证明。
2. `node scripts/ai-docs/check-docs.mjs`。受管文件上限 2320。本说明是唯一新增文件。开工前扫描 2316，加上本说明后是 2317，必须 ≤ 2320。
3. `pnpm turbo typecheck --force`。
4. `pnpm turbo lint`。必须 0 errors。警告上限保持原样，低于上限可以通过，不许提高，也不要改这些 `--max-warnings`：root `package.json:8` 的 5242、`apps/api/package.json:7` 的 1423、`packages/domain/package.json:10` 的 115、`packages/ai-runtime/package.json:14` 的 628、`apps/worker/package.json:7` 的 959、`packages/db/package.json:11` 的 1042、`apps/web/package.json:7` 的 601、`packages/qdrant-store/package.json:11` 的 27、`packages/ai-graphs/package.json:10` 的 47、`packages/contracts/package.json:12` 的 265。

不要加出站门。不要加迁移唯一性门。

## §8

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

三处状态改为 `executed:awaiting_post_prove_dual`。

`drainQuizJobOnce` 与 `drainDiagnosisJobOnce`：不是遗留简历引用时，先读父行。父行恰好是 `ready` 时调用 `markQuizJobDone` 或 `markDiagnosisJobDone`，不先标记失败。返回 true 时外层返回 `generate`。返回 false 时不发事件、不释放、不增加失败计数、不改父行，外层返回 `failed`。遗留引用仍清 payload、发事件并释放。父行不是 `ready` 时失败路径不变，父行更新仍带 `NOT IN ('ready')`。

证明加在 `apps/worker/test/uc-e2e-016-nhp-fault.proof.ts` 台账断言之后、收据之前。PC 押题和诊断已由生产调度到 `ready` 且消耗已确认，再放回过期 `running`，然后调用 `sweepStuckQuizJobs`、`sweepStuckDiagnosisJobs`、`drainQuizJobOnce`、`drainDiagnosisJobOnce`。断言没有不可用事件，父行仍是 `ready`，消耗仍是确认，失败计数不增加，作业变成完成，模型 `complete` 未被调用。

1. `pnpm uc016:nhp-fault:prove` 退出码 0。
2. `node scripts/ai-docs/check-docs.mjs` 退出码 0，扫描 2317，不超过 2320。
3. `pnpm turbo typecheck --force` 退出码 0，8 个任务成功。
4. `pnpm turbo lint` 退出码 0，0 errors。警告为根 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0。未提高上限。
