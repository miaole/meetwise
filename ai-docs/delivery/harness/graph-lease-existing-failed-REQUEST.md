executed:awaiting_post_prove_dual

# 失败面试已有图行时不再续租

基线 `a19fa63d2a7f991a11106fd79b09a2fa68bbd10d`。本步只新增这一份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0 锚

### 0.1 零行分支已经在面试失败时不插入

`packages/db/src/interview/interview-graph-lease.ts` 的 `withInterviewGraphFence`（:18-20）在 :24 的 `asPrincipal` 回调里做完判定。`packages/db/src/principal.ts:995-1004` 对这个回调是一次 `BEGIN` 到 `COMMIT`。

- :25 只对图名和 `owner:interviewId` 取事务级咨询锁。
- :26-30 读 `ai_graph_run` 最近一行并 `FOR UPDATE`。选择列没有面试状态。
- :31 `current.rowCount === 0` 时，:33-36 读取 `SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`。:37 在恰好一行且 `status === 'failed'` 时返回空，不执行 :38-42 的 `INSERT`。:57 因此是未取得，:59 的回调不跑。
- 读不到行，或状态不是 `failed` 时，:38-43 仍插入 `status='active'`、`version` 为 1，并取得。

这条零行分支本说明不改。

### 0.2 已有图行的更新路径不读面试状态

:45 取出当前行。:46 只在租约仍被别人持有且未过期时返回空。:48-54 的 `UPDATE` 把命中行写成 `status='active'`，租约交给本次 `leaseOwner`，`version=version+1`。`WHERE` 还要求 `run_id`、`owner_user_id`、`version` 匹配，并且 `status IN ('created','active','waiting_user','migrating','paused','quarantined')`。:55 更新到一行就返回围栏，否则返回空。

这整段不读 `interview`。图行属于上面六个值且 :46 的租约可拿时，`UPDATE` 命中即取得。

:69-76 的 `assertInterviewGraphFence`、:79-87 的 `renewInterviewGraphFence`、:89-95 的 `releaseInterviewGraphFence` 本说明不改。:14 的租约秒数不改。

### 0.3 取得之后才会出题，然后标记作业完成

`apps/worker/src/interview-consumer.ts:476` 调用 `withInterviewGraphFence`。回调里面 :584 是 `startAdaptiveInterview`，:586 是 `submitAdaptiveAnswer`。租赁函数只有在 :57 拿到围栏时才执行 :59 的回调。

:589-591 在 `fenced.acquired` 为假时立刻返回 `requeueOrTerminalizeExhausted`，错误码仍是已有的 `interview_graph_fence_unavailable`。:594 的 `markJobDone` 在这次返回之后，到不了。

`packages/db/src/interview/interview-jobs.ts:261-266` 的 `markJobDone` 只执行一条更新：`status='done'`，条件是作业 `id`、`owner_user_id`、`status='running'` 且 `lease_owner` 匹配。它不读 `interview.status`。

### 0.4 未取得今天仍把作业写回排队

`requeueOrTerminalizeExhausted`（`interview-consumer.ts:285-304`）在 `job.attempts >= MAX_INTERVIEW_JOB_ATTEMPTS` 时走 :288-300 的 `markJobFailed`。常量在 `interview-jobs.ts:15`，值是 5。未达上限时 :302 调用 `requeueInterviewJob`。

`requeueInterviewJob`（`interview-jobs.ts:288-296`）把作业写成 `status='queued'`，条件只是作业仍为 `running` 且 `lease_owner` 匹配。它不读 `interview.status`。面试已经是 `failed` 时，这条语句仍写回 `queued`，不是写成 `failed`。

`claimNextInterviewJob`（:143-188）的领取语句不读 `interview.status`。:167 只排除已有 `interview_job.status='failed'` 的兄弟作业。`sweepStuckInterviewJobs`（:320-343）按作业自己的 `running` / `queued` 与次数处理，不读 `interview.status`。这三处本说明都不改。

### 0.5 已有证明里失败且还没有图行的那一臂

`apps/worker/test/graph-fence-write.proof.ts:379-395`：:382 把面试直接插成 `failed`，调用前不插图行。:387 调用生产 `withInterviewGraphFence`。:394 断言未取得且未抛错，:395 断言 `ai_graph_run` 仍是 0 行。这一臂的插入、调用和断言保持原样。

:349-378 是图行自身已终态。:363 的五态是图行 `status`，不是 `interview.status`。:375-377 断言未取得且该行状态与 `version` 仍是 4。不要改。

:396-405 用 :355-362 的 `plantRun`。`plantRun` 经 :102-104 的 `seedInterview` 把面试插成 `created`，再插入 `version` 为 4、租约空的图行。:396 的六值是 `created`、`active`、`waiting_user`、`migrating`、`paused`、`quarantined`。:403-404 断言仍可取得并写成 `active`，`version` 为 5，且不另插一行。不要改。这条臂证明的是面试仍为 `created` 时的更新路径。

生产函数已在证明文件 :28 引入。

## §1 修法

只改 `withInterviewGraphFence` 的已有图行更新路径，并只扩一份已有证明。不改零行分支。本步不改代码。

### 1.1 更新路径在更新前读面试状态

仍在 :24 这次短事务里，零行分支 :31-43 整段保持不动。更新路径在 :48 的 `UPDATE` 之前读取面试状态。读取放在 :46 的租约判断之后、:48 之前：租约仍被别人持有且未过期时，继续按 :46 返回空，不去更新。

读取语句与 :34 相同，单独再执行一次，不把 :33-37 抽出去共用：

`SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`

参数用本函数已有的 `interviewId` 与 `owner`。

- 读到恰好一行，且 `status` 恰好是 `failed`：不执行 :48-54 的 `UPDATE`。像 :46 一样返回空。:57 给出 `{ acquired: false }`。:59 的回调不跑，因此 :584 与 :586 都不跑。图行的 `status` 与 `version` 保持调用前的值。不新增返回字段，不抛新的错误串。
- 读不到面试行，或 `status` 不是 `failed`：不进入上面的返回。:48-54 的 `UPDATE` 与 :55 的一行判定保持今天的语句，包括六个图行状态名单、租约秒数和返回的围栏对象。面试状态 `created`、`active`、`abandoned`、`completed` 以及其他非 `failed` 值都走这条，不要扩大拒绝范围。

### 1.2 未取得时的作业去向不在本说明里改

:589-591 保持提前返回。未取得今天仍进入 `requeueOrTerminalizeExhausted`，未达 5 次时仍调用 `requeueInterviewJob`。本说明不改 :476、:584、:586、:589-594，不改 `claimNextInterviewJob`、`sweepStuckInterviewJobs`、`requeueInterviewJob`、`markJobDone`。

因此执行的前提是：基线上的 `requeueInterviewJob` 已经在面试 `status` 恰好是 `failed` 时把作业写成 `failed`，而不是写回 `queued`。

本基线 `a19fa63d2a7f991a11106fd79b09a2fa68bbd10d` 上，:288-296 仍一律写成 `queued`，这个前提不在。执行时若所见基线上的该函数仍是这样，就停止：不要改图租约。本份说明不包含那个函数的改法，不要把它一起改掉。

### 证明

不新增测试文件，不新增迁移。只在 `apps/worker/test/graph-fence-write.proof.ts` 里、:395 之后、:396 之前追加一臂。不改 :379-395 的断言，不改 :349-378，不改 :396-405。

- 面试行用与 :382 相同的三列插入，`status` 直接写成 `failed`。不要调用 :102-104 的 `seedInterview`。那条会写成 `created`，并调用额度预留。
- 再插入一条已有图行。列与 :358-360 相同：`version` 为 4，`lease_owner` 与 `lease_expires_at` 都是空，这样 :46 认为租约可拿。图行 `status` 取六个活状态之一；本臂指定 `paused`。标识不要与 :381 的 `gf-iv-status-failed` 或 :397 的 `gf-live-paused` 相撞。
- 调用前用 :351 的 `readRun` 记下该行的 `status` 与 `version`。
- 调用证明文件 :28 已引入的生产 `withInterviewGraphFence`。回调里先把一个标志设为已执行。断言未取得、未抛错、标志仍为未执行。
- 调用后再 `readRun`。断言仍是一行，且 `status` 与 `version` 与调用前相同，仍是 `paused` 与 4。

## §1.3 否决

- 不改零行分支。:31-43 保持今天的不插入行为，不把读取抽成两边共用。
- 不改消费者。不改 :476 的调用，不把 :584 或 :586 搬出回调，不改 :589-594 的未取得返回和 `markJobDone` 位置。
- 不改作业清扫。不改 `sweepStuckInterviewJobs`（:320-343）。
- 不新造错误串。未取得仍是现有的 `{ acquired: false }`，消费者仍用已有的 `interview_graph_fence_unavailable`。不新增返回字段。
- 不新加文件。不新增测试文件，不新增迁移。证明只扩 `graph-fence-write.proof.ts` 的新臂。
- 前提未满足就不动手。基线上的 `requeueInterviewJob` 若仍在面试已经 `failed` 时写回 `queued`，就停止。不要把那个函数一起改掉，也不要改 `claimNextInterviewJob` 或 `markJobDone` 来补这个前提。
- 不改 `releaseInterviewGraphFence`、`renewInterviewGraphFence`、`assertInterviewGraphFence`。
- 不改计费，不改额度，不发明天数或锁池大小。不改 :14 的租约秒数，不改 :25 的锁。证明新臂不调用 `reserveEntitlement`。
- 不把面试的 `created`、`active`、`abandoned`、`completed` 或其他非 `failed` 算进这次拒绝。

## §2 门

执行时跑这些已有命令。脚本名对过根 `package.json` 与各包 `package.json`。不列出站清单门，本步没有新的模型调用。不列迁移唯一性，本步没有迁移。

1. `pnpm graph-fence-write:prove`（根 `package.json:548`，经 `scripts/run-e2e-isolated.mjs:2455-2456` 跑到 `apps/worker/package.json:62` 的 `prove:graph-fence-write`，目标文件 `apps/worker/test/graph-fence-write.proof.ts`）。只许改 `interview-graph-lease.ts` 更新路径在 `UPDATE` 之前的那次读取，以及这个证明里新增的那一臂。:379-395 的失败且无图行断言、:349-378 的终态断言、:396-405 的活状态断言不得改口径。

2. `node scripts/ai-docs/check-docs.mjs`。受管文件上限在 `scripts/ai-docs/public-text-policy.mjs:132`，值是 2320。本步只新增这一份说明。扫描必须通过，不得超过 2320，也不要改这个上限。

3. `pnpm turbo typecheck --force`。

4. `pnpm turbo lint`。0 errors。警告不得超过各包现有 `--max-warnings`：根 `package.json:8` 为 5242，`apps/api/package.json:7` 为 1423，`packages/domain/package.json:10` 为 115，`packages/ai-runtime/package.json:14` 为 628，`apps/worker/package.json:7` 为 959，`packages/db/package.json:11` 为 1042，`apps/web/package.json:7` 为 601，`packages/qdrant-store/package.json:11` 为 27，`packages/ai-graphs/package.json:10` 为 47，`packages/contracts/package.json:12` 为 265，`packages/config/package.json:8` 为 0，`packages/db-mysql/package.json:8` 为 0。低于上限可以通过。不许放宽这些数。

## §8

executed:awaiting_post_prove_dual

以上三处状态相同。本步只新增这一份说明，不改产品代码。前提不在基线上就停止，不在这里改作业写回。

executed:awaiting_post_prove_dual

## §9-rev

本节补上已有图行且面试恰好失败时的行为，不回改上文。要修的就是下面这一段今天仍会发生的事。

已有图行，并且 :46 判定租约可拿时，面试 `status` 恰好是 `failed`，`packages/db/src/interview/interview-graph-lease.ts` :45-55 的更新仍会命中并返回围栏。:57-59 仍会跑回调。`apps/worker/src/interview-consumer.ts` :476 传入的回调里，:584 的 `startAdaptiveInterview` 与 :586 的 `submitAdaptiveAnswer` 因此仍会跑。

对照零行分支 :31-37：面试恰好是 `failed` 时返回空，回调不跑。已有图行这条没有同样停住。这就是要修的行为。

修法保持 §1.1，不另起一套。仍在别人持有租约的检查之后、更新之前，再读一次面试状态。读取仍是单独再执行 `SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`，参数仍是本函数已有的 `interviewId` 与 `owner`。读到恰好一行且 `status` 恰好是 `failed`：不更新，不跑回调，图行的 `status` 与 `version` 保持调用前的值。其它状态，或没有面试行，仍走今天的更新。

零行分支不改。`releaseInterviewGraphFence`、`renewInterviewGraphFence`、`assertInterviewGraphFence` 不改。消费者不改。`claimNextInterviewJob`、`sweepStuckInterviewJobs`、`requeueInterviewJob`、`markJobDone` 不改。

执行前提保持 §1.2。执行所依据的基线里，若 `requeueInterviewJob` 在面试已经是 `failed` 时仍把作业写回排队，就停止。不要在这一步改那个函数，也不要改图租约。

本节不把本步写成已经执行。不改产品代码。文首与 §8 里的三处状态保持原文，且彼此相同。

## §9-EXEC

改动文件：

- `packages/db/src/interview/interview-graph-lease.ts`：`withInterviewGraphFence` 的已有图行路径，在别人持有且未过期的租约检查之后、`UPDATE` 之前，再执行 `SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2`。参数是本函数已有的 `interviewId` 与 `owner`。恰好一行且 `status` 是 `failed` 时不更新，返回未取得，回调不跑。读不到行，或状态不是 `failed`，仍执行原来的 `UPDATE`。零行分支未改。
- `apps/worker/test/graph-fence-write.proof.ts`：失败且无图行那一臂之后、活状态那一臂之前追加一臂。面试用三列直接插成 `failed`，不调用 `seedInterview`，不调用 `reserveEntitlement`。再插入已有图行，`version` 为 4，租约两列为空，图行 `status` 为 `paused`。回调标志保持未执行。断言未取得、未抛错，之后仍是一行且仍是 `paused`、`version` 4。前后原有断言未改口径。
- `ai-docs/delivery/harness/graph-lease-existing-failed-REQUEST.md`：文件首行、§8 内、§8 之后三处状态改为 `executed:awaiting_post_prove_dual`。

命令与退出码：

1. `pnpm graph-fence-write:prove` EXIT=0
2. `node scripts/ai-docs/check-docs.mjs` EXIT=0（扫描 2318，未超过 2320）
3. `pnpm turbo typecheck --force` EXIT=0
4. `pnpm turbo lint` EXIT=0（0 errors；根 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0，未放宽上限）
