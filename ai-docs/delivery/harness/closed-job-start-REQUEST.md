executed:awaiting_post_prove_dual

# 职位关闭后已有申请仍能开始

基线 `c2da2eae0a0c775526296a83b475c616fe44cc8a`，分支 `line/closed-job-start-draft`。本说明只记录改法。本步不改产品代码。行号是在这棵树上打开文件看到的。

## §0 锚

### 0.1 关闭职位只改职位行

`packages/db/src/recruiting/recruiter.ts` 的 `closeJob`（第 193–196 行）：

```
export async function closeJob(c: Client, owner: string, id: string): Promise<boolean> {
  await assertPrincipal(c, owner);
  const r = await c.query("UPDATE job_posting SET status='closed', version=version+1 WHERE id=$1 AND status='open'", [id]);
  return (r.rowCount ?? 0) > 0;
}
```

SET 只有 `job_posting.status` 和 `version`。条件是这个 id 而且当前是 `open`。语句里没有 `job_application`。已有申请的状态、绑定面试、简历都不改。不要改这个函数。

`job_posting.status` 的检查只允许 `open` 和 `closed`，在 `packages/db/migrations/0004_recruiter.sql` 第 9 行。

### 0.2 新申请已经拒绝非 open，这不是要修的点

同一文件 `applyToJob` 第 249–253 行：

```
export async function applyToJob(c: Client, candidate: string, jobId: string): Promise<{ applicationId: string } | null> {
  const owner = requireOwnerUserId(candidate, 'recruiter.applyToJob');   // PRIV01-C 第二层 E1
  await assertPrincipal(c, owner);
  const job = await c.query("SELECT owner_user_id, title FROM job_posting WHERE id=$1 AND status='open'", [jobId]);  // 公开读
  if (job.rowCount === 0) return null;
```

职位不是 `open` 时这一读是 0 行，函数返回 `null`，不会插入新申请。`packages/db/test/recruiter-depth.proof.ts` 第 262–263 行已经断言关闭后再投递得到 `null`。不要改 `applyToJob`，也不要改这则断言。

### 0.3 开始面试在插入前不读职位状态

同一文件 `startApplicationInterview` 从第 498 行开始。插入新面试在第 594–598 行。从第 501 行读到的是 `job_application`，没有 `job_posting.status`。

第 506 行：申请行不存在就 `{ status: 'noop' }`。第 508 行：`declined` 和 `completed` 也是 `{ status: 'noop' }`。这两处都不插入。

第 510–523 行：申请是 `in_progress` 而且绑定面试仍是 `created` 或 `active` 时，第 523 行返回 `{ status: 'reused', interviewId, resumeId }`。这一返回不读职位状态。

第 525–546 行：绑定面试是 `failed` 时，第 545 行调用 `markApplicationAssessmentUnavailable`，然后落到下面的插入。第 579–585 行会先 `bindApplicationRoute`。第 590 行没有绑定时返回 `interview_ineligible_route`，也不插入。

第 558–565 行：`assessment_unavailable` 且绑定面试是 `completed` 时返回 `application_held_not_retryable`，不插入。绑定面试是 `failed` 的 `assessment_unavailable` 不走这里，会落到第 594 行插入。

这些在职位仍是 `open` 时保持原样。不要改第 506、508、523、565 行的返回，也不要改第 594–606 行的插入和回写语句。

### 0.4 我的投递不读职位状态，广场只显示 open

同一文件 `listMyApplications` 第 277–286 行。选择的是申请列，加上按绑定面试派生的 `terminalKind`。`FROM job_application a LEFT JOIN interview i`。没有 `job_posting`，没有职位状态。

`apps/web/app/jobs/page.tsx` 第 55–57 行用 `MyApplications.safeParse` 收下 `/applications`。第 141 行是「我的投递」。第 158–159 行：

```
            const startable = app.status === 'invited' || app.status === 'in_progress'
              || (app.status === 'assessment_unavailable' && app.terminalKind === 'failed');
```

申请仍是 `invited` 时 `startable` 为真。第 175–182 行的选择简历表单和「开始面试」按钮仍渲染。第 182 行：`invited` 时按钮文案是「开始面试」，否则是「继续岗位面试」。第 187–189 行的「婉拒」写在这个 `startable` 块里面。

广场不是这条。第 47 行仍向 `/jobs` 取列表。`listOpenJobs` 第 243–245 行是 `WHERE status='open'`。关闭后的职位不会出现在广场。不要改 `listOpenJobs`，也不要改广场这张卡片。

候选人读 `job_posting` 时，`packages/db/migrations/0005_job_application.sql` 第 11–12 行的 `p_read` 只放行 `status = 'open'` 或本人是属主。申请行仍指向该职位：`packages/db/migrations/0046_application_assessment_recovery.sql` 第 52–56 行的外键是 `(job_id, recruiter_user_id)` → `job_posting(id, owner_user_id)`。候选人不是属主时，已关闭的职位读出来是 0 行，不是字符串 `closed`。不要为了看见这个字符串去改策略，也不要新迁移。

`packages/contracts/src/index.ts` 第 517–522 行的 `MyApplications` 没有职位状态。对象默认会丢掉未声明的字段。第 55–57 行的解析因此看不到查询里多出来的列。这是「我的投递」要带上已有状态时必须一起改的契约，不是新接口。

## §1 修法

只许两处。

### 1.1 `startApplicationInterview`

在会插入新面试的路径上，于任何为了新面试而做的写入之前读职位。读取是：

```
SELECT status FROM job_posting WHERE id=$1
```

参数是这一申请的 `job_id`。

- 读到一行且 `status` 是 `open`：后面的原有路径一字不改。
- 读到一行且 `status` 不是 `open`：不要标记申请，不要绑定路由，不要插入面试。返回 `{ status: 这一行的 status }`。检查约束下这个值只可能是 `closed`。
- 0 行：候选人看不见该职位。按上面的 `p_read`，这就是「不是 open，且调用者不是属主」。申请外键仍要求职位行在。不要插入。返回 `{ status: 'closed' }`。

`closed` 是 `job_posting.status` 已有的值。把它加进第 487–492 行已有的 `StartApplicationResult`。不要新造 `job_closed`、`not_open` 之类的名字。不要返回 `noop`。不要抛 `application_start_conflict`，也不要抛别的笼统错误。

读取的位置：

- 第 523 行的复用返回保持在这次读取之前。`created` 或 `active` 的进行中面试，职位已经关闭也要返回原来的 `interviewId`。不要把人关在外面。
- 第 525–538 行里，简历不符或失败绑定对不上而返回 `binding_invalid` 的，保持原样。对得上、下一行就要在第 545 行标记申请时：先做上面的读取。不是 `open` 就返回 `{ status: 'closed' }`，不要调用 `markApplicationAssessmentUnavailable`。
- 申请本来就不是 `in_progress`、会落到第 594 行插入的路径：第 565 行的 `application_held_not_retryable` 保持在前面。held 不改成 `closed`。过了 held 之后、第 579 行 `bindApplicationRoute` 之前再读一次。不是 `open` 就返回 `{ status: 'closed' }`。这样从 `invited` 首启，以及 `assessment_unavailable` 且绑定面试为 `failed` 的另开一场，都不会插入，也不会先发出消费事件。

职位仍是 `open` 时：`declined` 与 `completed` 仍是 `noop`；进行中且绑定面试仍是 `created` 或 `active` 仍复用；绑定面试是 `failed` 时仍可按现在的标记再插入新的一场。

不要改 `apps/api/src/modules/jobs/applications.service.ts`。第 85–86 行对没有单独分支的状态仍会抛 `application_start_unexpected`。不要为了换掉这句去改服务层，也不要为此再造一个错误名。页面不再对已关闭职位提交首启或失败后的新开一场。

### 1.2 我的投递

让 `listMyApplications` 第 277–286 行的现有查询带上已经存在的 `job_posting.status`。左连接 `job_posting`，选出 `j.status AS job_status`。不要改 `terminalKind` 的 CASE，不要改 `WHERE`。不要新增表，不要新增迁移，不要改 `p_read`。

候选人会话里，职位仍 `open` 时 `job_status` 是 `open`。职位已 `closed` 时连接被策略藏掉，`job_status` 是 `null`，不是字符串 `closed`。页面把 `job_status === 'open'` 当成仍开放，其余（含 `null`）当成已关闭。

`MyApplications` 第 517–522 行加上可空的 `job_status`，让第 55–57 行的解析留住这一列。不要新路由。`applications.service.ts` 的 `mine` 已经原样返回这个查询，不要为了加列去改它。

`apps/web/app/jobs/page.tsx` 的「我的投递」：

- 职位仍开放时，第 158–159 行的三个条件保持原样。第 182 行的两个按钮文案不改。
- 职位不是开放，且申请是 `invited`：不要渲染开始表单，也不要渲染「开始面试」。另起一句：`该职位已关闭，不能再开始面试。`
- 职位不是开放，且申请是 `assessment_unavailable` 并且 `terminalKind === 'failed'`：同样不要渲染重试表单，并写同一句。
- 职位不是开放，但申请是 `in_progress`：开始条件仍为真，按钮仍是「继续岗位面试」。这样还能回到那场 `created` 或 `active` 的面试。不要用上面那句换掉这个按钮。
- 「婉拒」仍只在 `invited` 时出现。不要因为开始条件变假就把它拿掉。第 190–192 行「本场由企业支付，不消耗你的额度」仍留在开始块里，不单拆出去。
- held 那句「本场面试已完成；评分校准完成后与结果一起提供，不提供重试。」不改。

广场列表继续只来自 `/jobs`，也就是只含 `open`。不要改第 244 行。

## §1.3 否决

- 不改 `closeJob`。不在关闭时改写已有申请。
- 不改 `applyToJob`。不把「拒绝新申请」当成这次的修法。
- 不改 `listOpenJobs`，不把已关闭职位放进广场。
- 不改第 506、508、523、565 行已有的返回。职位仍 `open` 时，失败后另开新一场的原路径不改。
- 不把复用 `created` 或 `active` 的进行中面试挡在关闭职位之外。
- held 仍返回 `application_held_not_retryable`，不改成 `closed`。
- 不改 `applications.service.ts`，不改 `apps/web/lib/jobs/application-start-error.ts`。
- 不新增表，不新增迁移，不改 `p_read`，不新增受控函数。
- 不新建证明文件，不新增脚本名。
- 不改价格，不改额度。
- 不改 `ai-docs/delivery/harness/product-campaign-LEDGER.md`。第 694 行已是合计 229/271，能力项完成 33、半成 2、未收 14。这三个数维持，这项不记成新的完成。
- 不改 `scripts/ai-docs/public-text-policy.mjs` 第 133 行。上限已是 `2_328`。本说明只新增这一份，不得再改上限。

## §2 门

证明只扩展这两份已经存在的文件。

招聘证明：`packages/db/test/recruiter-depth.proof.ts`。命令是根 `package.json` 第 222 行的 `pnpm recruiter:prove`。它走 `node scripts/run-e2e-isolated.mjs recruiter:prove:raw`，第 223 行才到 `pnpm -C packages/db recruiter`，`packages/db/package.json` 第 22 行是 `tsx test/recruiter-depth.proof.ts`。文件第 39 行调用 `assertIsolatedTestTarget`。`packages/db/src/isolated-test-target.ts` 第 70–71 行：`E2E_ISOLATED !== '1'` 时抛 `destructive_proof_requires_e2e_isolated`，设置了 `DATABASE_URL` 时抛 `destructive_proof_database_url_forbidden`。禁止把证明指向 `127.0.0.1:54329`，禁止设置 `DATABASE_URL` 后直接跑 `tsx`。那种跑法不算通过。

新段落放在第 346 行汇总输出之前。用新的职位、新的候选人和新的简历，不要关闭 `jobA`，不要复用第 258–263 行已经关闭的 `jobCId`。路由行按第 46–56 行的插法写成 `route_decided`，不要调用模型。已有断言的原文都不改。

清理只追加新行的删除。第 352 行仍然只删 `jobA` 和 `jobB` 的申请。新职位的申请、路由行和职位行要在删职位前删掉，新简历也要删。新面试 id 放进已有的 `createdInterviewIds`。

新段落必须调用生产函数 `createJob`、`inviteCandidate`、`startApplicationInterview`、`closeJob`、`listMyApplications`、`failInterviewAndRelease`、`markApplicationAssessmentUnavailable`、`getJob`。断言：

- 关闭前，候选人的 `listMyApplications` 上这一行 `job_status` 是 `open`。`invited` 首启返回 `started`，该申请恰有 1 场面试，申请变为 `in_progress`。
- `closeJob` 为真。属主 `getJob` 的 `status` 是 `closed`。申请状态仍是 `in_progress`。候选人列表上的 `job_status` 是 `null`，不是字符串 `closed`。再调用 `startApplicationInterview` 返回 `reused`，还是原来的 `interviewId`，面试仍是 1 场。
- 另一名候选人在职位仍 `open` 时被邀请，关闭后再首启。返回 `{ status: 'closed' }`。申请仍是 `invited`。该申请的面试是 0 场。
- 第三名候选人首启后，只用 `failInterviewAndRelease` 把绑定面试写成 `failed`，不要先标记申请。关闭后再调用开始。返回 `{ status: 'closed' }`。面试仍是 1 场。申请仍是 `in_progress`，不是 `assessment_unavailable`。
- 第四名候选人在职位仍 `open` 时首启，`failInterviewAndRelease` 之后调用 `markApplicationAssessmentUnavailable`，再关闭，再开始。返回 `{ status: 'closed' }`。面试仍是 1 场。申请仍是 `assessment_unavailable`。
- 把一名已邀请的申请婉拒后，职位已关闭时再开始，仍返回 `noop`，不返回 `closed`，也不插入面试。
- 关闭后的职位上 `applyToJob` 仍返回 `null`。这只是钉住第 0.2 节，不是新修法。

页面证明：`apps/web/test/web-logic.proof.ts`。命令是根 `package.json` 第 274 行的 `pnpm web:prove`，`apps/web/package.json` 第 8 行是 `tsx test/web-logic.proof.ts`。第 1678–1680 行已有的 `I2-2a` 以及其后的 `I2-2b` 到 `I2-2g` 原文都不改。在 `I2-2e` 之后追加对 `app/jobs/page.tsx` 的读文件断言：文件含有 `该职位已关闭，不能再开始面试。`；仍含有 `invited ? '开始面试' : '继续岗位面试'`；仍含有向 `/jobs` 取广场列表；「婉拒」不依赖开始条件。开始条件在 `job_status === 'open'` 时仍覆盖 `invited`、`in_progress` 和 `terminalKind === 'failed'` 的重试；`job_status` 不是 `open` 时，`invited` 与失败重试不再使开始表单渲染，`in_progress` 仍渲染「继续岗位面试」。

另外三道：

- `pnpm docs:check`（根 `package.json` 第 9 行，即 `node scripts/ai-docs/check-docs.mjs`）。扫描必须通过，不得超过 2328，也不要改这个上限。
- `pnpm turbo typecheck --force`。
- `pnpm turbo lint`。0 errors。警告上限不得提高：根 `package.json` 第 8 行 5242，`apps/api/package.json` 第 7 行 1423，`packages/domain/package.json` 第 10 行 115，`packages/ai-runtime/package.json` 第 14 行 628，`apps/worker/package.json` 第 7 行 959，`packages/db/package.json` 第 11 行 1042，`apps/web/package.json` 第 7 行 601，`packages/qdrant-store/package.json` 第 11 行 27，`packages/ai-graphs/package.json` 第 10 行 47，`packages/contracts/package.json` 第 12 行 265，`packages/config/package.json` 第 8 行 0，`packages/db-mysql/package.json` 第 8 行 0。低于上限可以通过。未点名的包维持各自现有 lint 脚本，不得放宽。

不跑出站清单。不写迁移唯一性门。不调用模型。本说明是这一步唯一新增的文件。

## §8
executed:awaiting_post_prove_dual
executed:awaiting_post_prove_dual

## §9-rev

本段只追加在文末，取代下面点名的句子。§0、§1、§1.3、§2、§8 的原文不动。文首和 §8 已有的三处标记不动，本段不再写那句标记。不改 `closeJob`、`applyToJob`、`applications.service.ts`、价格、迁移、`p_read`。上限仍是 2328。`ai-docs/delivery/harness/product-campaign-LEDGER.md` 第 694 行仍是合计 229/271，能力项完成 33、半成 2、未收 14。

### 9.1 关闭后，绑定面试已失败的进行中申请不再提交开始

取代 §1.2 这一句：「职位不是开放，但申请是 `in_progress`：开始条件仍为真，按钮仍是「继续岗位面试」。这样还能回到那场 `created` 或 `active` 的面试。不要用上面那句换掉这个按钮。」

同时取代 §2 页面证明这一句：「`job_status` 不是 `open` 时，`invited` 与失败重试不再使开始表单渲染，`in_progress` 仍渲染「继续岗位面试」。」

§1.2「不要改 `terminalKind` 的 CASE，不要改 `WHERE`」仍然有效。`listMyApplications` 第 277–286 行已经 `LEFT JOIN interview i`。第 280–282 行的 CASE 只有申请已是 `assessment_unavailable` 才不是 NULL：绑定面试 `completed` 得到 `held`，`failed` 得到 `failed`。申请仍是 `in_progress`、绑定面试已经 `failed` 时，`terminalKind` 与仍可复用的 `created`/`active` 一样是 NULL。页面因此分不开这两种。第 158–159 行的 `in_progress` 一律 `startable`，第 178 行的表单仍会提交开始。

同一条 SELECT 再选出已经连接上的 `i.status AS bound_interview_status`。不要新增连接，不要改 CASE 的原文，不要改 `WHERE`。`listMyApplications` 的返回类型加上 `job_status: string | null` 与 `bound_interview_status: string | null`。`terminalKind` 的类型不改。`applications.service.ts` 第 24–26 行的 `mine` 原样返回这个查询，不要为了加列去改它。

页面只改「职位不是开放」时的 `in_progress`。缺失和 `null` 都不是 `open`。

- `bound_interview_status` 是 `created` 或 `active`：开始条件仍为真，按钮仍是「继续岗位面试」。不要用关闭句换掉这个按钮。生产函数第 510–523 行的复用返回仍在读职位状态之前，关闭后继续返回原来的 `interviewId`。
- `bound_interview_status` 是 `failed`，或是任何不是 `created`/`active` 的值（含缺失和 `null`）：不要渲染开始表单，不要提交开始，显示「该职位已关闭，不能再开始面试。」不要只判断 `=== null` 而让缺键掉回旧的 `in_progress` 开始条件。

职位仍是 `open` 时，第 158–159 行的三个条件保持原样。这时 `in_progress` 且绑定面试已 `failed` 仍提交开始，不显示关闭句。`invited` 的关闭句、`assessment_unavailable` 且 `terminalKind === 'failed'` 的关闭句、held 那句，都按 §1.2 原样。「婉拒」仍只在 `invited` 时出现。`declined` 仍是 `noop`（第 508 行），不是 `closed`。held 仍返回 `application_held_not_retryable`（第 565 行），不改成 `closed`。

`apps/api/src/modules/jobs/applications.service.ts` 第 85–86 行在状态不是 `started` 或 `reused` 时抛 `application_start_unexpected`。`{ status: 'closed' }` 走这里。不要改这个服务，不要新造错误名。上面这一支由页面不提交来避开。

招聘证明已有断言的原文不改，只追加两则：关闭后复用的那一行，`bound_interview_status` 是 `created`（第 595 行插入的状态），`terminalKind` 仍是 `null`。第三名候选人（绑定面试已 `failed`、申请仍是 `in_progress`、职位已关闭）的列表行，`bound_interview_status` 是 `failed`，`terminalKind` 仍是 `null`。服务侧仍返回 `{ status: 'closed' }`，申请仍不是 `assessment_unavailable`。

页面证明改为读文件：`job_status === 'open'` 时开始条件仍覆盖 `invited`、`in_progress` 和 `terminalKind === 'failed'`。`job_status` 不是 `open` 时，`in_progress` 只有 `bound_interview_status` 为 `created` 或 `active` 才渲染「继续岗位面试」；`failed` 以及其他值不渲染开始表单。文件仍含「该职位已关闭，不能再开始面试。」，仍含 `invited ? '开始面试' : '继续岗位面试'`。

### 9.2 `job_status` 和 `bound_interview_status` 都可缺省

取代 §1.2 这一句：「`MyApplications` 第 517–522 行加上可空的 `job_status`，让第 55–57 行的解析留住这一列。」

`packages/contracts` 里只写 `.nullable()` 时，键仍是必填。值可以是 `null`，缺键不能通过。`apps/api/test/resume-display.proof.ts` 第 26 行解析的对象没有这两个键：

```
MyApplications.parse({ applications: [{ id: 'a', job_id: 'j', interview_id: null, resume_id: null, status: 'invited', score: null }] })
```

不要改那份简历证明。这一行必须继续通过，`job_title` 仍是「岗位信息同步中」。

两个字段都放进第 518–522 行那个申请对象，与第 520 行 `terminalKind` 一样写成 `z.string().nullable().optional()`。缺失或 `null` 都通过。不要只写 `.nullable()`。不要加 `.default(...)`，避免缺键被填成 `open` 或 `created`。查询真返回 `null`（职位已关闭被策略藏掉，或没有绑定面试）也必须通过。

### 9.3 清理按外键先删快照和绑定，再删路由行

取代 §2 这一句中的「新职位的申请、路由行和职位行要在删职位前删掉」。被取代的整句是：「清理只追加新行的删除。第 352 行仍然只删 `jobA` 和 `jobB` 的申请。新职位的申请、路由行和职位行要在删职位前删掉，新简历也要删。新面试 id 放进已有的 `createdInterviewIds`。」

同句里这三截仍然有效：第 352 行仍然只删 `jobA` 和 `jobB` 的申请；新简历也要删；新面试 id 放进已有的 `createdInterviewIds`。不要复用已经关闭的 `jobCId`（第 31 行声明，第 259–263 行已经关闭）。新职位只用 `createJob` 返回的新 id。不要把它写进 `jobCId` 或 `jobDId`，不要放进第 354–357 行的 `if (jobCId && jobDId)`，也不要加进第 359 行那个 `job_posting` 数组。那一条数组语句只要有一行外键失败就整句不删，`jobA` 和 `jobB` 会和新职位一起留下。

`inviteCandidate` 第 483 行调用 `bindApplicationRoute`，插入 `application_route_binding`（`packages/db/src/routing/job-route-decision.ts` 第 316 行）。`startApplicationInterview` 第 579 行也会插入绑定，第 608 行的 `snapshotInterviewRoute` 再插入 `interview_route_snapshot`（同文件第 349 行）。这两张表的外键都没有级联：`packages/db/migrations/0104_job_route_decision.sql` 里没有 `ON DELETE`。现有 `cleanup` 不删它们。若先删路由行，绑定的外键会让那条删除失败。`cleanup` 是顺序 `await`，任一条抛错函数就返回；第 369 行只记下异常，后面的删除不再执行，新职位就留下。

下面五步放在第 351 行之后、第 365 行删简历之前，用与第 350 行相同的 `pool.query`。不要用 `asPrincipal`。`0104` 第 208–209 行对绑定和快照只 `GRANT SELECT, INSERT`，没有 `DELETE`。五步都按这个新职位的 `job_id` 删除。每步单独捕获错误并继续，不把异常抛出 `cleanup`。不要包进同一个会在第一条失败时回滚的事务。删快照失败也必须执行到最后一步，不能把新职位留下来。

新面试 id 必须已经在 `createdInterviewIds` 里，让第 350–351 行先删掉面试。否则 `packages/db/migrations/0028_application_bound_interview.sql` 第 23–24 行 `fk_interview_application_binding`（`interview.application_id` → `job_application(id)`，`DEFERRABLE INITIALLY DEFERRED`，无级联）和第 27–28 行 `fk_interview_job_binding`（`interview.job_id` → `job_posting(id)`，同样无级联）会让删申请或删职位失败，职位同样留下。`0163_qbank_plan_snapshot_interview_fk.sql` 已把 `qbank_retrieval_plan` 与 `question_plan` 的 `snapshot_id` 改挂到 `interview(id)`，这两张表不再挡住删快照。

1. 先删 `interview_route_snapshot`。外键是 `0104` 第 172 行：`FOREIGN KEY (application_id) REFERENCES application_route_binding(application_id)`。
2. 再删 `application_route_binding`。外键是 `0104` 第 152–153 行：`(job_id, revision)` → `job_semantic_revision(job_id, revision)`，以及 `decision_id` → `job_route_decision(id)`。绑定没有指向 `job_application` 的外键，删申请不会把它带走。只被邀请、还没有快照的申请也有绑定，同样要删。
3. 再删这次新插入的路由行。内部顺序与第 355–357 行相同：先 `job_route_event`（`0104` 第 123–134 行没有外键；`createJob` 经 `createJobSemanticRevision` 会插入），再 `job_route_decision`（`0104` 第 81 行 `(job_id, revision)` → `job_semantic_revision`），最后 `job_semantic_revision`。按第 46–56 行插入的 `route_decided` 也在这三张表里一起删。不删 `jobCId` 或 `jobDId` 的行。
4. 再删这个新职位的 `job_application`。不改第 352 行。外键是 `packages/db/migrations/0046_application_assessment_recovery.sql` 第 53–56 行 `fk_job_application_job_recruiter`：`(job_id, recruiter_user_id)` → `job_posting(id, owner_user_id)`，`DEFERRABLE INITIALLY IMMEDIATE`，无级联。
5. 最后才用单独一条语句删这个新职位的 `job_posting`。

`route_consumption_event`（`0104` 第 179–191 行）没有外键。开始会写它，但它挡不住上面任何一步。不要把它插进这个顺序，本段也不要求另删它。

新简历仍在面试和申请都删掉之后删，沿用第 365 行的位置。

## §9-EXEC

改过的文件：

- apps/web/app/jobs/page.tsx
- apps/web/test/web-logic.proof.ts
- packages/contracts/src/index.ts
- packages/db/src/recruiting/recruiter.ts
- packages/db/test/recruiter-depth.proof.ts

命令退出：

- pnpm recruiter:prove EXIT:0
- pnpm web:prove EXIT:0
- pnpm docs:check EXIT:0
- pnpm turbo typecheck --force EXIT:0
- pnpm turbo lint EXIT:0

三处状态都已是 executed:awaiting_post_prove_dual。
