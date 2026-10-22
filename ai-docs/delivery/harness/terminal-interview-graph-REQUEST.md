draft:awaiting_pre_exec_dual

# 终态面试仍会开图

基线 `7cbc4209fe8e972c91456a29f89c59fdb1700862`。分支 `line/terminal-interview-graph-draft`。工作树 `/Users/miaole/.zcode/workspace/default/meetwise-termgraph`。这一步只新增这份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0 锚

### 0.1 零行只在面试恰好 failed 时不插入

`packages/db/src/interview/interview-graph-lease.ts` 的 `withInterviewGraphFence`（:18-20）在 :24 的短事务里判定。

:26-30 读最近一行图并锁定。:31 在 `current.rowCount === 0` 时进入零行分支。:33-36 读 `SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`。:37 只在恰好一行且 `status === 'failed'` 时返回空，不执行 :38-42 的 `INSERT`。

读不到行，或状态不是 `failed`，:38-43 仍插入 `status='active'`、`version` 为 1，并返回围栏。围栏非空时 :63 不返回，:66 给出取得。`completed` 和 `abandoned` 今天走的就是这条插入，并当作取得。

### 0.2 已有图行时，租约可拿之后只在面试恰好 failed 时不更新

:45 取出当前行。:46 只在租约仍被别人持有且未过期时返回空。:48-51 再读一次面试状态。:52 只在恰好一行且 `status === 'failed'` 时返回空，不执行后面的更新。

其它情况下 :54-60 把命中行写成 `status='active'`，条件含 `status IN ('created','active','waiting_user','migrating','paused','quarantined')`。:61 更新到一行就返回围栏，否则返回空。`INSERT` 只写在 :31 的零行分支里，更新不到一行时不会改走插入。

因此面试是 `completed` 或 `abandoned`，且图行状态落在这六个值里时，今天仍会更新成 `active` 并取得。图行已经是终态时，六个值对不上，更新不到一行，行保持原样，也不另插一行。

### 0.3 0194 只拒绝图行旧状态已是 completed 的状态更新

`packages/db/migrations/0194_money_consistency_graph_run_terminal.sql:66-71` 的 `ai_graph_run_terminal_guard` 是 `BEFORE UPDATE OF status`。:69-70 只在 `OLD.status` 与 `NEW.status` 不同且 `OLD.status = 'completed'` 时拒绝。它不挂 `INSERT`，函数体 :58-64 也不读 `interview.status`。这次不改这个文件。

### 0.4 返回未取得之后，释放不会跑到新插入的行上

:63 在围栏为空时直接返回 `{ acquired: false }`，这行在 :64 的 `try` 之前。:67-70 的释放只在已经取得之后才调用。写出 `waiting_user` 的语句在 :95-100 的 `releaseInterviewGraphFence`：它要求 `lease_owner` 与 `version` 同时命中，把刚拿到的那一行写成 `waiting_user`。

未取得的返回走不到 :95。不要把「返回后仍是 active」写成断言。取得之后，调用返回时这一行已经是 `waiting_user`，不是仍停在 `active`。

### 0.5 未取得走现有的次数用尽收口

`apps/worker/src/interview-consumer.ts:476` 调用 `withInterviewGraphFence`。:589-591 在 `fenced.acquired` 为假时返回现有的 `requeueOrTerminalizeExhausted`，错误码仍是 `interview_graph_fence_unavailable`。

`requeueOrTerminalizeExhausted`（:285-304）在 `job.attempts >= MAX_INTERVIEW_JOB_ATTEMPTS` 时不再排队。常量在 `packages/db/src/interview/interview-jobs.ts:15`，值是 5。:294 调用 `terminalizeUnsettledInterview`，原因是 `retry_exhausted`。

`terminalizeUnsettledInterview`（:154-173）先调用 `failInterviewAndRelease`。:161-162 在错误码是 `interview_failure_terminal_conflict` 且状态是 `completed` 或 `abandoned` 时返回 `settled`。这个返回在 :171 的 `interview_unavailable` 之前，因此不发 `interview_unavailable`。

`failInterviewAndRelease`（`packages/db/src/commerce/commerce.ts:421-424`）只把 `created`、`waiting_user`、`migrating`、`paused` 改成 `failed`。`completed` 和 `abandoned` 不在这句里，不会被改写。对不上时 :436-438 抛出 `interview_failure_terminal_conflict`，并带上当前状态。

面试 `failed` 今天已经在 :37 或 :52 返回未取得。所以这次不改 `interview-consumer.ts`，不新写终态，不退款。

### 0.6 已有四组断言

证明文件是 `apps/worker/test/graph-fence-write.proof.ts`。根 `package.json:548` 的脚本名是 `graph-fence-write:prove`。下面四组的口径一句都不改。

1. 图行终态五值未取得且不抛错。:363 的五值是 `failed`、`succeeded`、`safely_terminated`、`safe_terminating`、`completed`，这是图行状态，不是面试状态。:375 断言未取得且未抛错。:376-377 断言仍一行，且状态与 `version` 保持原值。整段是 :349-378。
2. 面试 `failed` 且无图行仍是 0 行。:382 把面试直接插成 `failed`，调用前不插图行。:394 断言未取得且未抛错。:395 断言 `ai_graph_run` 仍是 0 行。整段是 :379-395。
3. 面试 `failed` 且已有 `paused` 仍是一行、`paused`、`version` 不变。:421 断言未取得、未抛错且回调未执行。:422-427 断言仍一行，状态与 `version` 保持调用前，仍是 `paused` 与 4。整段是 :396-427。
4. 六值活状态仍取得并写成 `active`。:428 的六值是 `created`、`active`、`waiting_user`、`migrating`、`paused`、`quarantined`。:431-433 在回调里面读行，释放还没跑。:435-436 断言仍可取得并写成 `active`，`version` 为 5，且不另插一行。整段是 :428-437。

## §1 修法

只扩大两处拒绝，从仅 `failed` 扩到 `failed`、`completed`、`abandoned`。不新增迁移。执行时允许改的产品文件只有 `packages/db/src/interview/interview-graph-lease.ts`。允许改的证明只有 `apps/worker/test/graph-fence-write.proof.ts`。这一步两处都不改。

### 1.1 零行：这三种状态不插入

仍在 :31 的零行分支里。:33-36 的读取不动。:37 从只认 `failed` 改为：恰好一行，且 `status` 是 `failed`、`completed`、`abandoned` 之一，就不执行 :38-42 的 `INSERT`，返回空。:63 给出未取得，回调不跑。

读不到面试行，或其他状态，仍按 :38-43 插入 `status='active'`、`version` 为 1，并取得。

### 1.2 已有图行：这三种状态在更新之前返回未取得

仍在 :46 的租约判断之后、:54 的 `UPDATE` 之前。别人还持有未过期租约时，继续按 :46 返回空。

:48-51 的读取不动。:52 从只认 `failed` 改为：恰好一行，且 `status` 是 `failed`、`completed`、`abandoned` 之一，就不执行 :54-60。返回空。不拿掉六个值的 `WHERE`。更新不到一行时仍返回空，不改走 :38 的插入。

读不到面试行，或其他面试状态，仍按现在的 :54-61 更新。:14 的租约秒数、:25 的锁、:75 的 `assertInterviewGraphFence`、:85 的 `renewInterviewGraphFence`、:95 的 `releaseInterviewGraphFence` 都不改。

:32 与 :47 旁边的说明句改成这三种都会拒绝。不要留下「只认 failed」的句子。

### 证明只追加新臂

不新增测试文件。四组原句保持 :349-437 的口径。新臂放在 :437 之后、:439 之前。新臂都用新的面试标识，不调用 :102-104 的 `seedInterview`，不调用 `reserveEntitlement`，也不调用 :355-362 的 `plantRun`。面试行用与 :382 相同的三列直接插入。

- `gf-iv-status-completed`：面试直接写成 `completed`，调用前不插图行。断言未取得且未抛错，调用后 `ai_graph_run` 仍是 0 行。
- `gf-iv-status-abandoned`：面试直接写成 `abandoned`，调用前不插图行。断言未取得且未抛错，调用后仍是 0 行。
- `gf-iv-completed-paused`：面试直接写成 `completed`，再按 :400-403 的列插入一条图行，`status` 为 `paused`，`version` 为 4，`lease_owner` 与 `lease_expires_at` 都为空。断言未取得且未抛错，回调不执行。调用后仍是一行，仍是 `paused`，`version` 仍是 4。
- `gf-iv-abandoned-paused`：面试直接写成 `abandoned`，图行同样是租约已空的 `paused`、`version` 为 4。断言与上一条相同：未取得，仍是一行，仍是 `paused`，`version` 不变。
- `gf-iv-status-created`：面试直接写成 `created`。这不是 `failed`、`completed`、`abandoned`。调用前不插图行。断言取得。不要断言返回后仍是 `active`。取得之后 :95-100 会把刚拿到的行写成 `waiting_user`，所以也不要把它断言成 0 行。

## §1.3 否决

- 不改 `invoke.ts`。
- 不改 `interview-service.ts` 的报告生成。
- 不改 `adaptive-interview-service.ts`。
- 不改 `profile.service.ts`。
- 不改 `recruiter.ts`。
- 不改 `jobs/page.tsx`。
- 不改定性投影。
- 不改 `validate.ts`。
- 不改 `score-writer.ts`。
- 不改 `i2b.proof.ts`。
- 不改 `interview-consumer.ts`。不新写终态，不退款。
- 不改 `0194_money_consistency_graph_run_terminal.sql`。不新增迁移。
- 不改价格。
- 不改 `scripts/ai-docs/public-text-policy.mjs`。上限保持 2328。
- 这一步只加这一份说明。
- 不改 229/271。不改能力项 33、2、14。
- 不拿掉六个图行状态的 `WHERE`，不在更新不到一行时改走插入。
- 不改 :349-437 四组断言的口径。

## §2 门

执行时跑这些已有命令。不跑出站清单，不跑迁移唯一性。本步没有新的模型调用，也没有迁移。

1. `pnpm graph-fence-write:prove`（根 `package.json:548`，经 `scripts/run-e2e-isolated.mjs:2455-2456` 跑到 `apps/worker/package.json:62` 的 `prove:graph-fence-write`，目标文件 `apps/worker/test/graph-fence-write.proof.ts`）。只许改 `interview-graph-lease.ts` 的两处拒绝，以及这个证明里新增的五臂。:363-378、:379-395、:396-427、:428-437 不得改口径。

2. `pnpm docs:check`（根 `package.json:9`，即 `node scripts/ai-docs/check-docs.mjs`）。上限在 `scripts/ai-docs/public-text-policy.mjs:132-133`，值是 2328。本步新增一个受管文件，扫描数加 1。必须通过，不得超过 2328，也不要把上限改大。

3. `pnpm turbo typecheck --force`。

4. `pnpm turbo lint`。0 errors。警告不得超过各包现有 `--max-warnings`：根 `package.json:8` 为 5242，`apps/api/package.json:7` 为 1423，`packages/domain/package.json:10` 为 115，`packages/ai-runtime/package.json:14` 为 628，`apps/worker/package.json:7` 为 959，`packages/db/package.json:11` 为 1042，`apps/web/package.json:7` 为 601，`packages/qdrant-store/package.json:11` 为 27，`packages/ai-graphs/package.json:10` 为 47，`packages/contracts/package.json:12` 为 265，`packages/config/package.json:8` 为 0，`packages/db-mysql/package.json:8` 为 0。低于上限可以通过。不许把上限改大。

## §8

draft:awaiting_pre_exec_dual
draft:awaiting_pre_exec_dual

这一步只新增这份说明，不改产品代码。
