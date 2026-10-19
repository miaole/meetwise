draft:awaiting_pre_exec_dual

# 绑定申请失败时仍排队的作业一并失败

本说明只记录改法。本步不改产品代码。

## §0 锚

行号是在分支 `line/fail-queued-job-draft`、提交 `8ece8ea08982d9f3de8b4634b88b4c1900860f14` 上打开文件看到的。下面是打开时的原文，不是估计。

### 0.1 绑定申请的预留回收只失败面试，不失败仍排队的作业

`apps/worker/src/commerce-reconcile.ts` 第 59–68 行。`application_id` 非空走这条臂：

```
        if (iv.rows[0]?.application_id) {
          // `reconcile` already changed reserved→released in this transaction.
          // Reuse the terminal helper so the DB-level failed↔released pairing is
          // checked rather than trusting this dispatcher.  B-bound sessions may
          // not become abandoned: they must expose a scoreless, restartable
          // application terminal state.
          await failInterviewAndRelease(c, owner, s.idempotencyKey);
          const marked = await markApplicationAssessmentUnavailable(c, owner, s.idempotencyKey);
          if (marked !== 'updated' && marked !== 'replayed') throw Object.assign(new Error(`reconcile_application_recovery_${marked}`), { code: 'reconcile_application_recovery_conflict' });
          await appendEvent(c, owner, s.idempotencyKey, 'assessment_unavailable', { reason: 'reservation_expired' }, 'assessment_unavailable:reservation_expired');
```

第 65 行调用 `failInterviewAndRelease`。这一臂没有调用 `failQueuedInterviewJobsOnAbandon`。

### 0.2 用户放弃臂在冲突兜底之后已经调用，这次不要改它

同一文件第 74–88 行。`application_id` 为空走放弃。冲突兜底之后：

```
          await cancelOpenInterviewQuestion(c, owner, s.idempotencyKey);
          // 主臂已把仍 queued 的作业写成 failed；冲突臂绕过主臂，这里再写一次。没有 queued 时为零行。
          await failQueuedInterviewJobsOnAbandon(c, owner, s.idempotencyKey);
```

第 88 行这次调用保留，不挪、不删、不改参数。主臂 `abandonInterviewAndRelease` 进入 `finishAbandon` 时，`packages/db/src/commerce/commerce.ts` 第 492 行已经调用过同名函数。第 492 行也不要改。

### 0.3 写成面试失败终态时不动 interview_job

`packages/db/src/commerce/commerce.ts` 的 `failInterviewAndRelease` 从第 406 行到第 435 行。面试行的更新在第 421–425 行：

```
  const updated = await c.query(
    `UPDATE interview SET status='failed', version=version+1
      WHERE id=$1 AND owner_user_id=$2 AND status IN ('created','waiting_user','migrating','paused')
      RETURNING status`, [interviewId, owner]);
  if (updated.rowCount === 1) return { status: 'failed', released: terminalReleasedOf(release) };
```

SET 列表只有 `interview.status` 和 `version`。没有 `interview_job`。第 428–429 行的 `already_failed` 只读当前状态后返回。第 432–434 行抛错，让外层事务回滚。这个函数现在不调用 `failQueuedInterviewJobsOnAbandon`。同文件第 24 行已经导入它，第 492 行只给放弃收口用。

### 0.4 已有函数只改仍 queued 的作业

`packages/db/src/interview/interview-jobs.ts` 第 273–281 行：

```
/** 放弃时只把仍 queued 的作业写成 failed。running、done、已经 failed 的行不改。没有 queued 时为零行。 */
export async function failQueuedInterviewJobsOnAbandon(c: Client, owner: string, interviewId: string): Promise<void> {
  await c.query(
    `UPDATE interview_job
        SET status='failed', last_error='abandoned', lease_owner=NULL, lease_expires_at=NULL,
            payload=payload-'answer', version=version+1
      WHERE owner_user_id=$1 AND interview_id=$2 AND status='queued'`,
    [owner, interviewId],
  );
}
```

`last_error` 固定是 `abandoned`。没有 queued 行时更新为零行。不要改这段 SQL，也不要另写一条失败作业的语句。

### 0.5 领取不看面试已经 failed

同一文件 `claimNextInterviewJob` 第 143–188 行。领取更新的是 `interview_job`。内层选择在第 156–167 行：

```
         SELECT j.id FROM interview_job j
          WHERE j.owner_user_id=$1
            AND interview_privacy_active(j.interview_id)
            AND ((j.status='queued' AND (j.next_attempt_at IS NULL OR j.next_attempt_at <= now()))
                 OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM interview_job r WHERE r.interview_id=j.interview_id AND r.status='running' AND r.lease_expires_at >= now())
            AND NOT EXISTS (SELECT 1 FROM interview_job f WHERE f.interview_id=j.interview_id AND f.status='failed')
```

可领的是仍 `queued`（退避时间已到或为空）或租约过期且未超次数的 `running`。没有 `FROM interview`，没有 `JOIN interview`，谓词里没有 `interview.status`。`interview_privacy_active` 只是围栏布尔，不是面试终态。

第 167 行只在同面试已经有一条 `failed` 作业时才不领。它不把仍 `queued` 的行写成 `failed`。绑定申请臂可以在每一条作业都还是 `queued` 时把面试写成 `failed`。那时没有 `failed` 兄弟，这条领取仍会把排队作业领走。不要改这段 SQL。

### 0.6 围栏跳过是零写入

`apps/worker/src/commerce-reconcile.ts` 第 50–56 行：

```
        const fence = await c.query<{ active: boolean }>('SELECT interview_privacy_active($1) AS active', [s.idempotencyKey]);
        if (fence.rows[0] && fence.rows[0].active === false) {
          // F3(iii)：围栏行零 DML——已围栏面试不 abandon/fail/不改应用态/不发任何事件
          //（interview_event 增量=0;interview 保持非终态;B 端 application 零翻转）。释放已由 sweep 先行完成且不回滚。
          fencedSkipped++;
          continue;   // F3(iv)：正常出口,不计失败
        }
```

`interview_privacy_active` 为 false 时在第 55 行 `continue`。这条路径不调用 `failInterviewAndRelease`，也不调用 `failQueuedInterviewJobsOnAbandon`。必须保持零写入，不要给它补失败作业。

### 0.7 adaptive-lifecycle.ts 的两处都还没写失败作业

`apps/worker/src/adaptive-lifecycle.ts` 全文没有 `failQueuedInterviewJobsOnAbandon`。

第 74–75 行，`writeGenerationUnavailable`：

```
  await requireCurrentFence(c, d);
  await failInterviewAndRelease(c, d.owner, d.interviewId);
```

后面只标记申请并追加事件，到第 99 行结束。两个调用方都在同一条 `asPrincipal` 事务里：第 102 行 `emitGenerationUnavailable`，以及第 493 行开始的作答投影事务在第 528 行进入这个函数。两条事务都没有把仍 `queued` 的作业写成 `failed`。

第 672–679 行，有效分不足的失败臂，同一条第 493 行事务：

```
      } else {
        await failInterviewAndRelease(c, d.owner, d.interviewId);
        const mark = await markApplicationAssessmentUnavailable(c, d.owner, d.interviewId);
        if (mark !== 'stale')
          await appendEvent(c, d.owner, d.interviewId, 'assessment_unavailable', { reason: 'evaluation_unscored' }, 'assessment_unavailable:evaluation_unscored');
      }
```

第 676 行之后也没有失败排队作业。这两处都是缺口。

### 0.8 interview-consumer.ts 只失败当前运行行，不失败仍排队的行

`apps/worker/src/interview-consumer.ts` 全文没有 `failQueuedInterviewJobsOnAbandon`。唯一的 `failInterviewAndRelease` 在第 154–165 行的 `terminalizeUnsettledInterview`：

```
  try {
    await failInterviewAndRelease(c, owner, interviewId);
  } catch (raw: unknown) {
    const error = asErr(raw);
    if (error?.reason === 'already_confirmed' || (error?.code === 'interview_failure_terminal_conflict' && (error?.status === 'completed' || error?.status === 'abandoned'))) {
      return 'settled';
    }
    throw raw;
  }
```

三个调用都在调用方自己的 `asPrincipal` 事务里，事务内都没有把全部仍 `queued` 的作业写成 `failed`：

- 第 236–241 行 `failClaimedInterviewJob`：先 `markJobFailed` 再 `terminalizeUnsettledInterview`。`markJobFailed` 在 `packages/db/src/interview/interview-jobs.ts` 第 268–270 行，`WHERE` 是这一条作业的 `id` 且 `status='running'` 且租约属主匹配。其它仍 `queued` 的行不动。
- 第 288–294 行 `requeueOrTerminalizeExhausted` 的次数耗尽臂：同样只 `markJobFailed` 当前这一条，再进入 `terminalizeUnsettledInterview`。
- 第 632–645 行 `reapStuckInterviewJobs`：先 `sweepStuckInterviewJobs`，再对 `failedInterviews` 与 `retryExhaustedInterviews` 调用 `terminalizeUnsettledInterview`。`sweepStuckInterviewJobs` 第 332–335 行只把 `status='queued' AND attempts >= $2` 的行写成 `failed`。次数未达上限的 `queued` 行留在 `queued`。第 327–329 行还会把未达上限的过期 `running` 改回 `queued`。这些仍排队的行随后不会被写成 `failed`。

所以这三处都是缺口。`markJobFailed` 和收割里那条超限更新都不是本说明要的那次调用。

## §1 修法

只改 `packages/db/src/commerce/commerce.ts` 的 `failInterviewAndRelease`。在第 421–424 行把面试写成 `failed` 且 `updated.rowCount === 1` 之后、第 425 行 `return` 之前，调用已经存在的函数：

```
await failQueuedInterviewJobsOnAbandon(c, owner, interviewId);
```

用第 24 行已有的导入。不要新加导入。不要改第 274–281 行的 SQL。`last_error` 仍是 `abandoned`。没有排队作业时这一调用为零行，允许。`running`、`done`、已经 `failed` 的行保持原样。

这一次调用和面试失败终态在同一条事务里，调用方提交前才会一起落地。它盖住下面这些已经在同一事务里调用 `failInterviewAndRelease` 的缺口，所以不要在那些调用点再写一次：

- `apps/worker/src/commerce-reconcile.ts` 第 65 行。绑定申请臂继续只调用 `failInterviewAndRelease`。不要在第 65 行后面加第二次调用。
- `apps/worker/src/adaptive-lifecycle.ts` 第 75 行和第 676 行。不改这个文件。
- `apps/worker/src/interview-consumer.ts` 第 158 行，以及第 241、294、636、645 行进入它的事务。不改这个文件。收割若先把未达上限的运行作业改回 `queued`，随后同事务里的这次调用会把当时仍是 `queued` 的行写成 `failed`。不要改收割 SQL，也不要调换 `reapStuckInterviewJobs` 的顺序。

不要在第 428–429 行 `already_failed` 返回前调用。那次返回没有在本事务里把面试写成失败。不要在第 432–434 行抛错前调用。抛错会回滚，包括前面的释放。

不要改 `apps/worker/src/commerce-reconcile.ts` 第 88 行。不要改 `finishAbandon` 第 492 行。围栏跳过保持第 51–56 行的 `continue`，不要在那里调用。

产品代码改动文件只有 `packages/db/src/commerce/commerce.ts`。

## §1.3 否决

- 不改 `claimNextInterviewJob`。不让领取 SQL 连接 `interview`。不加 `interview.status` 谓词。
- 不在围栏跳过路径写作业。`interview_privacy_active` 为 false 的那条保持零写入。
- 不改评分、路由叶子、简历联系行。
- 不新迁移。不新状态。不改 `failQueuedInterviewJobsOnAbandon` 的 SQL。
- 不改放弃臂第 88 行已经有的那次调用，也不改第 492 行已经有的那次调用。
- 不在 `adaptive-lifecycle.ts` 或 `interview-consumer.ts` 再补一次调用。
- 不新建证明文件，不新增 npm script。

## §2 门

执行时只扩展已有 `apps/worker/test/commerce-reconcile.proof.ts`。第 ① 节到第 ⑨ 节已有断言的原文都不改。第 ⑦ 节（第 168–210 行）是绑定申请、没有排队作业的失败，保持原样，用来留住零行仍能把面试写成 `failed`。不要往第 ⑦ 节插作业。

新段落放在第 358 行汇总输出之前，用新的 owner，不要复用 `bound`、`fence`、`evkey-term`。面试要走第 ⑦ 节那种绑定申请：`createJob`、`classifyJobRoute`、`inviteCandidate`、`startApplicationInterview`，并且 `application_id` 非空。在对账拍之前，按第 324–333 行的 `asPrincipal` 插入方式加两行作业，不要用超级用户直插：

- `seq=0`，`status='queued'`，`version=4`，带 `answer` 与 `turn`，租约留在未来。
- `seq=2`，`status='done'`，`version=3`，payload 保持原样。

然后 `reserveEntitlement`、`expireLease`、`commerceReconcileTick`。新断言：

- 面试是 `failed`，不是 `abandoned`。申请是 `assessment_unavailable`，`assessment_unavailable` 事件恰 1 条。这样钉住走的是第 65 行，不是第 88 行。
- 当时 `queued` 的那行变为 `failed`，`last_error` 是 `abandoned`，`lease_owner` 与 `lease_expires_at` 为空，`version` 为 5，`answer` 被去掉，`turn` 还在，`attempts` 仍是 0。
- `done` 那行的状态、`version`、payload、`last_error` 都不变。
- `claimNextInterviewJob` 返回 `null`。文件第 12 行已经导入它，不要新开导入路径。

第 ⑧ 节原有断言一字不改。在第 266 行 B 端围栏拍之前，给那场已围栏且 `application_id` 非空的面试按同样方式插入一行 `queued` 作业。拍后这行仍是 `queued`，`version`、payload、`last_error` 都不变。围栏面试仍不是 `failed`。这行用来钉住第 51–56 行没有补失败作业。

证明必须走 `pnpm commerce-reconcile:prove`。根 `package.json` 第 226 行是 `node scripts/run-e2e-isolated.mjs commerce-reconcile:prove:raw`，第 227 行派到 `pnpm -C apps/worker prove:commerce-reconcile`，`apps/worker/package.json` 第 33 行才是 `tsx test/commerce-reconcile.proof.ts`。证明第 67 行调用 `assertIsolatedTestTarget`。`packages/db/src/isolated-test-target.ts` 第 70–71 行：`E2E_ISOLATED !== '1'` 时抛 `destructive_proof_requires_e2e_isolated`，设置了 `DATABASE_URL` 时抛 `destructive_proof_database_url_forbidden`。禁止把证明指向 `127.0.0.1:54329`，禁止设置 `DATABASE_URL` 后直接跑 `tsx`。那种跑法不算通过。

本修法不改 `adaptive-lifecycle.ts`，也不改 `interview-consumer.ts`，所以不把它们已有的证明列入必跑。根 `package.json` 第 545 行的 `adaptive-life:prove` 与第 549 行的 `adaptive-consumer:prove` 这次不跑。

另外三道：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`turbo.json` 第 8 行有 `typecheck`，第 10 行有 `lint`。`pnpm turbo lint` 必须 0 errors。警告上限不得提高：root 5242（根 `package.json` 第 8 行）、api 1423（`apps/api/package.json` 第 7 行）、domain 115（`packages/domain/package.json` 第 10 行）、ai-runtime 628（`packages/ai-runtime/package.json` 第 14 行）、worker 959（`apps/worker/package.json` 第 7 行）、db 1042（`packages/db/package.json` 第 11 行）、web 601（`apps/web/package.json` 第 7 行）、qdrant 27（`packages/qdrant-store/package.json` 第 11 行）、ai-graphs 47（`packages/ai-graphs/package.json` 第 10 行）、contracts 265（`packages/contracts/package.json` 第 12 行）。低于上限可以通过。未点名的包维持各自现有 lint 脚本，不得放宽。

不跑出站清单。不写迁移唯一性门。本说明是这一步唯一新增的文件。

## §8
draft:awaiting_pre_exec_dual
draft:awaiting_pre_exec_dual
