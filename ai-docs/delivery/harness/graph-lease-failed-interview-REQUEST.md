executed:awaiting_post_prove_dual

# 失败的面试不再新建图运行

基线 `2af55cce96efdc12e358fd0e3c8e870d690022ac`。本步只新增这一份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0 锚

### 0.1 零行时直接插入运行中的图，不读面试状态

`packages/db/src/interview/interview-graph-lease.ts` 的 `withInterviewGraphFence`（:18-20）：

- :25 只对图名和 `owner:interviewId` 取事务级咨询锁。
- :26-30 读 `ai_graph_run` 最近一行并 `FOR UPDATE`。选择列是 `run_id,version,lease_owner,lease_expires_at`，没有面试状态。条件只有 `graph_name`、`thread_id`、`owner_user_id`。
- :31 `current.rowCount === 0` 时走 :32-36 的 `INSERT`。写入的 `status` 字面就是 `active`，`version` 为 1。这条语句不读 `interview`。
- :37 把刚插入的版本交回，外层 :51-54 因此当成已取得并调用回调。
- :39-49 是已有图行的更新。:40 只在租约仍被别人持有且未过期时放弃。:43-45 的 `UPDATE` 只命中六值 `created`、`active`、`waiting_user`、`migrating`、`paused`、`quarantined`。:49 更新不到一行就返回空，:51 当成未取得。这条路径不插入。

### 0.2 已有终态图行的证明不是本缺陷

`apps/worker/test/graph-fence-write.proof.ts:349-378` 先插入一行终态图（:355-361，`version` 为 4，租约空），再调用生产 `withInterviewGraphFence`（:368）。:363 的五态是 `failed`、`succeeded`、`safely_terminated`、`safe_terminating`、`completed`。:375 断言未取得，:376-377 断言仍是一行且状态与版本不变。图行的 `failed` 是 `ai_graph_run.status`，不是 `interview.status`。这一臂走的是 :39-49 的更新路径。必须原样保留。:379-388 的六值活状态仍可取得，也不要改。

同文件 :102-104 的 `seedInterview` 把面试插成 `created`。现有各臂在这种状态下零行插入并取得，修完后仍须如此。

### 0.3 调用方在取图之前不读面试状态

`apps/worker/src/interview-consumer.ts` 在 :476 调用 `withInterviewGraphFence` 之前没有读取 `interview.status`。:323 只调用 `assertInterviewPrivacyActive`。

`packages/db/src/checkpoint/checkpoint-privacy.ts:24-26` 只执行 `assert_interview_privacy_active`。现行函数体在 `packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql:88-111`：:99-102 只确认面试行属于当前主体，:104-110 只查擦除请求的状态集。没有 `interview.status` 条件，因此 `failed` 不会被这句拒绝。

`packages/db/migrations/0059_interview_privacy_projection_fence.sql:101-104` 的 `ai_graph_run` 触发器是 `BEFORE INSERT OR UPDATE`，函数 :30 仍调用上面的擦除断言，同样不看面试状态。

### 0.4 终态触发器不拦插入

`packages/db/migrations/0194_money_consistency_graph_run_terminal.sql:66-71` 的 `ai_graph_run_terminal_guard` 是 `BEFORE UPDATE OF status`。:69-70 只在旧状态为 `completed` 且新状态不同时拒绝。它不在 `INSERT` 上触发，挡不住 :32-36 新建一行 `active`。

### 0.5 未取得时现在做什么

出题在取得回调里面：`interview-consumer.ts:584` 的 `startAdaptiveInterview` 与 :586 的 `submitAdaptiveAnswer` 都写在 :476 传入的回调里。`interview-graph-lease.ts:51-54` 只有拿到围栏才调用回调。

`interview-consumer.ts:589-591` 在 `fenced.acquired` 为 false 时立刻返回 `requeueOrTerminalizeExhausted`，传的错误码是已有的 `interview_graph_fence_unavailable`。:594 的完成标记在这次返回之后，到不了。

`requeueOrTerminalizeExhausted`（:285-303）不是无界重试：

- :288 用 `job.attempts >= MAX_INTERVIEW_JOB_ATTEMPTS`。常量在 `packages/db/src/interview/interview-jobs.ts:15`，值是 5。
- 未达上限时 :302 调用 `requeueInterviewJob`，作业回到 `queued`（`interview-jobs.ts:288-295`），退避后还能再领。
- 达到上限时 :290 调用 `markJobFailed`。`last_error` 是现拼的 `retry_exhausted:` 加上该错误码，不是字面 `abandoned`。

领取语句 `interview-jobs.ts:153-167` 不读 `interview.status`。:162 的排队臂没有次数条件；次数停点在调用方 :288，第五次领到之后不再放回排队。因此这不是无界重试。

字面 `abandoned` 已在 `interview-jobs.ts:277`，属于 `failQueuedInterviewJobsOnAbandon`（:274-281）。那条更新的 `WHERE` 只要 `status='queued'`，不改 `running`。本次作业正在 `running`，这条函数碰不到它。

## §1 修法

只改 `withInterviewGraphFence` 的零行分支，并只扩一份已有证明。不改已有图行的更新路径。

### 1.1 零行且面试已失败：不插入

只在 `interview-graph-lease.ts:31` 的 `current.rowCount === 0` 分支里、:32 的 `INSERT` 之前，读这场面试的状态：

`SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`

参数用本函数已有的 `interviewId` 与 `owner`。读语句放在 :25 之后的同一个短事务里。

- 读到的 `status` 恰好是 `failed`：不要执行 :32-36 的 `INSERT`。像 :49 一样返回空，让 :51 给出 `{ acquired: false }`。回调不得运行。`ai_graph_run` 保持 0 行。
- 读不到行，或 `status` 不是 `failed`：零行插入与 :32-37 现在相同，包括 `status='active'`、`version` 为 1、租约秒数与返回的围栏对象。`created`、`abandoned`、`completed` 以及其他非 `failed` 值都走这条，不要扩大拒绝范围。

不改 :26-30 的选列与 `LIMIT 1`。不改 :25 的锁参数。不改 :39-49 的更新、六值名单和「不到一行即未取得」。不在更新不到时改走 `INSERT`。

### 1.2 未取得时不得再出题

出题保持只在取得回调里。:584 与 :586 不得搬到 `withInterviewGraphFence` 之前，也不得在 `acquired` 为 false 时继续往下执行到 :594。

:589-591 现在的提前返回已经到不了这两次出题。重试有 :15 的上限 5，不是无界，所以本修法不把这次 `running` 作业改写成 `last_error` 为 `abandoned`，不新增错误串，也不改 `claimNextInterviewJob` 的 SQL（:153-179）。`retry_exhausted:` 与 `interview_graph_fence_unavailable` 这两段已有拼法保持不动，不要再添一个码。

不改 `sweepStuckInterviewJobs`（:320-342）。不改 `failQueuedInterviewJobsOnAbandon`（:274-281）。不把 `abandoned` 从那条只处理排队行的更新里挪用到本次运行中的作业上。

### 证明

不新增测试文件。只在 `apps/worker/test/graph-fence-write.proof.ts` 里、:378 之后、:379 之前追加一臂：

- 面试行用与 :103 相同的三列插入，但 `status` 写成 `failed`。不要先插成 `created` 再依赖零行插入。不要调用 :355-361 那种图行插入。调用前 `ai_graph_run` 是 0 行。
- 调用本文件 :28 已经引入的生产 `withInterviewGraphFence`。
- 断言未取得，且该面试的 `ai_graph_run` 仍是 0 行。回调不得留下图行。
- :349-378 的终态行断言与 :379-388 的活状态断言保持原样。

## §1.3 否决

- 不改 `claimNextInterviewJob` 的 SQL，不用领取条件去滤 `interview.status`。
- 不改 `sweepStuckInterviewJobs`。
- 不改 `failQueuedInterviewJobsOnAbandon`。那条函数只动 `queued`，`last_error` 字面 `abandoned` 留在原处。
- 不新增迁移，不改 0194，不改 0076，不改 0059。
- 不新增测试文件，不改 `packages/db/test/uc-e2e-002-cross-device-lease.proof.ts`。那份证明的终态臂也是先插入图行再调用，属于更新路径。
- 面试已经是 `failed` 且还没有图行时，不得仍插入 `active`。
- 不把 `abandoned`、`completed` 或其他非 `failed` 的面试状态算进这次拒绝。
- 不把未取得改成用 `abandoned` 收本次 `running` 作业。重试到 5 次为止，不是无界；出题已经在回调之内。
- 不新造错误串。

## §2 门

执行时跑这些已有命令。脚本名对过根 `package.json` 与各包 `package.json`。

1. `pnpm graph-fence-write:prove`（根 `package.json:548`）。它跑 `apps/worker/test/graph-fence-write.proof.ts`。只许改这个证明文件里新增的那一臂，以及 `interview-graph-lease.ts` 的零行分支。终态行与活状态断言不得改口径。

2. `node scripts/ai-docs/check-docs.mjs`。受管文件上限在 `scripts/ai-docs/public-text-policy.mjs:132`，值是 2320。本步新增一个受管文件。扫描必须通过，不得超过 2320，也不要改这个上限。

3. `pnpm turbo typecheck --force`。

4. `pnpm turbo lint`。0 errors。警告上限按各包现有 `--max-warnings`：根 `package.json:8` 为 5242，`apps/api/package.json:7` 为 1423，`packages/domain/package.json:10` 为 115，`packages/ai-runtime/package.json:14` 为 628，`apps/worker/package.json:7` 为 959，`packages/db/package.json:11` 为 1042，`apps/web/package.json:7` 为 601，`packages/qdrant-store/package.json:11` 为 27，`packages/ai-graphs/package.json:10` 为 47，`packages/contracts/package.json:12` 为 265，`packages/config/package.json:8` 为 0，`packages/db-mysql/package.json:8` 为 0。低于上限可以通过。不许放宽这些数。

## §8

executed:awaiting_post_prove_dual

以上三处状态相同。本步只新增这一份说明，不改产品代码。

executed:awaiting_post_prove_dual

## §9-EXEC

改动文件：

- `packages/db/src/interview/interview-graph-lease.ts`：`withInterviewGraphFence` 的零行分支在插入 `ai_graph_run` 之前，于同一短事务读取 `SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`。读到的状态恰好是 `failed` 时不插入并返回空。读不到行，或状态不是 `failed`，仍插入 `status='active'`、`version` 为 1。
- `apps/worker/test/graph-fence-write.proof.ts`：终态图行那一臂之后、活状态那一臂之前追加一臂。面试行按已有三列插法直接写成 `failed`，调用前不插图行。断言未取得，且该面试的 `ai_graph_run` 仍是 0 行。终态行与活状态两臂未改口径。
- `ai-docs/delivery/harness/graph-lease-failed-interview-REQUEST.md`：文件首行、§8、文末三处状态改为 `executed:awaiting_post_prove_dual`。

命令与退出码：

1. `pnpm graph-fence-write:prove` EXIT=0
2. `node scripts/ai-docs/check-docs.mjs` EXIT=0
3. `pnpm turbo typecheck --force` EXIT=0
4. `pnpm turbo lint` EXIT=0（0 errors；根警告 5242，未放宽上限）
