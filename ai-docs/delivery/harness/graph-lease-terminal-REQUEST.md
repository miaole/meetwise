executed:awaiting_post_prove_dual

# 终态图运行不被迟到作业重新激活

行号取自提交 `c93c119228ed9b2248c1c4d7a967ace054c2156a` 的文件原文。

## §0 读到的语句

### 获取租约

`packages/db/src/interview/interview-graph-lease.ts` 的 `withInterviewGraphFence`：

- `:27-:29` 读取最近一行并 `FOR UPDATE`。选择列是 `run_id,version,lease_owner,lease_expires_at`，没有 `status`。条件只有 `graph_name`、`thread_id`、`owner_user_id`，`ORDER BY version DESC LIMIT 1`。
- `:40` 只在 `lease_owner` 非空、不是当前持有者、且未过期时放弃取得。`lease_owner` 为空时这个判断不成立，继续往下写。
- `:42-:43` 把 `status` 设为 `active`，并写上 `lease_owner`、`lease_expires_at`，`version` 加一。`WHERE` 只有 `run_id=$1 AND owner_user_id=$2 AND version=$3`，没有状态条件。
- `:46` 更新不到一行就当作没取得，这里不会再插入一行。

因此，只要版本对得上，终态行也会被写成 `active`。放弃会清掉 `lease_owner`（`packages/db/src/commerce/commerce.ts:456`），`:40` 挡不住迟到作业：它锁住的就是刚收成终态的那一行，接着 `:42-:43` 把它写回 `active`。

数据库侧的例外不在这条 `WHERE` 里。`packages/db/migrations/0194_money_consistency_graph_run_terminal.sql:66-:71` 的 `ai_graph_run_terminal_guard` 只在 `OLD.status = 'completed'` 且新状态不同时拒绝（`:69-:70`）。`failed`、`succeeded`、`safely_terminated`、`safe_terminating` 不在这句里，迟到作业会把它们写回 `active`。`completed` 不会静默改回去，触发器抛出 `23514`，整段事务失败。`:12-:21` 写明冻结集只有 `completed`。该文件已应用，字节不动。

哪些状态还活着，现有两句已经写明，不必另造一份：

- `packages/db/src/interview/graph-run-observability.ts:11`：`created`、`active`、`waiting_user`、`migrating`、`paused`、`quarantined`。
- `packages/db/src/commerce/commerce.ts:458` 放弃收口用同一组六值，其余状态不动。

`apps/api/src/modules/interview/interview.service.ts:856-:858` 是另一张图的开始语句，`WHERE` 同样没有状态条件。0194 `:16-:18` 把那一处留作失败之后再次开始。本改法不动那一处。也不动 `interview-graph-lease.ts:80-:85` 的释放：释放要求 `lease_owner` 与 `version` 同时命中，放弃时这两项已经对不上，不会把终态写成 `waiting_user`。

### 迁移 0194

只读。函数在 `:58-:64`，触发器在 `:66-:71`。条件句只有 `OLD.status = 'completed'`。不改这个文件，也不新加迁移去扩大这句。

### 放弃

`packages/db/src/commerce/commerce.ts:484-:491` 的 `finishAbandon` 只做两件事：`:487` 调用 `safelyTerminateAiGraphRunsOnAbandon`，`:490` 调用 `cancelOpenInterviewQuestion`。没有更新 `interview_job`。

`cancelOpenInterviewQuestion`（`packages/db/src/interview/interview-question.ts:139-:144`）只把 `interview_question` 里 `issued` 或 `queued` 写成 `cancelled`。`interview_job` 没有 `cancelled` 这个词：`packages/db/migrations/0001_baseline.sql:260` 与 `packages/db/sql/05_interview_jobs.sql:14` 都是 `status IN ('queued','running','done','failed')`。

领取语句 `packages/db/src/interview/interview-jobs.ts:165-:167` 已经规定：同一面试只要有一行 `failed`，就不再领取后面的作业。把仍是 `queued` 的作业写成 `failed`，用的是已有检查约束里的词，不必新迁移。

对账冲突时会绕过 `finishAbandon`。`apps/worker/src/commerce-reconcile.ts:80-:86` 只在 `:86` 补了题目取消，同样没有取消仍排队的作业。

只改 `status` 和租约列，不会走到只监听 `payload`、`kind`、`interview_id` 的触发器（`packages/db/migrations/0126_interview_answer_dual_write_fence.sql:151-:152`），也不会走到只监听引用列的触发器（`packages/db/migrations/0054_resume_reference_write_gate.sql:60-:62`）。

## §1 修法

只改现有 TypeScript。不新增迁移，不改 0194，不改任何已应用迁移的字节。

1. 获取租约时不得把终态运行改回 `active`。在 `interview-graph-lease.ts:43` 的 `WHERE` 加上与 `commerce.ts:458`、`graph-run-observability.ts:11` 相同的六值：`status IN ('created','active','waiting_user','migrating','paused','quarantined')`。不在这六值里的行更新不到。`:46` 保持「不到一行即未取得」。禁止在更新不到时改走 `:32-:36` 的 `INSERT` 再开一条 `active`。终态行的 `status` 与 `version` 保持原值。`SELECT … FOR UPDATE` 仍是最近一行且 `LIMIT 1`。事务级咨询锁的两个参数不变。
2. 放弃时取消该面试仍排队的作业。在 `interview-jobs.ts` 已有的 `markJobFailed`（`:269`）旁增加一条更新，只命中 `owner_user_id`、`interview_id` 且 `status='queued'` 的行：`status` 写成 `failed`，`lease_owner` 与 `lease_expires_at` 置空，`version` 加一，`last_error` 写成固定字面 `abandoned`，并去掉 `payload` 的 `answer` 键（与 `:269` 同一写法）。不改 `running`、`done`、已经是 `failed` 的行。`finishAbandon` 在 `:490` 旁、同一事务里调用。`commerce-reconcile.ts:86` 旁同样调用，避免冲突那条路漏掉排队作业。没有 `queued` 行时为零行，再次进入仍安全。
3. `packages/db/src/index.ts:134-:138` 的现有导出清单加上这个函数，供对账文件调用。`commerce.ts` 直接引用 `interview-jobs.ts`，不经过 `index.ts` 再引回来。
4. 改 `commerce.ts:473` 那半句。它现在写着成功后的运行仍可由租约语句写回 `active`。改完后这句不再成立。`:471-:472` 关于释放因持有者与版本对不上而为零行，仍然成立，保留。不改 `succeedAiGraphRunsOnInterviewComplete` 的写入。不改 0194 里的旧注释。
5. 行为断言写进已有证明文件，不新增文件。终态不被写回 `active`：`apps/worker/test/graph-fence-write.proof.ts`、`packages/db/test/uc-e2e-002-cross-device-lease.proof.ts`。放弃后当时仍排队的作业变为 `failed` 且不能再被领取：`packages/db/test/uc-e2e-018-user-abandon.proof.ts`、`packages/db/test/uc-e2e-018-graph-safely-terminated.proof.ts`。冲突兜底同一结果：`apps/worker/test/commerce-reconcile.proof.ts`。

放弃当时还没有的作业不在这条更新里。当时一行 `queued` 都没有，就不会留下 `failed` 行，之后新入队的作业仍可能被领取；领取后再取租约会因终态而失败，运行不会被写回 `active`。不为这个窗口去改领取语句。

## §1.3 否决

1. 不改已应用迁移的字节。0194 的 `WHEN` 继续只认 `completed`。不把 `cancelled` 加进 `interview_job` 的检查约束，也不改 `0001_baseline.sql` 或 `sql/05_interview_jobs.sql`。
2. 不扩大锁范围。不改 `pg_advisory_xact_lock` 的参数，不拿掉 `LIMIT 1`，不对同一线程的全部运行行加锁，不对 `interview_job` 做表级锁。取消排队作业只用命中行自己的更新。
3. 不新增文件。不新增迁移，不新增模块，不新增证明文件。

## §2 现有证明脚本

根 `package.json` 里与租约或放弃直接相关的脚本名：

- `graph-fence-write:prove`
- `uc002:lease:prove`
- `adaptive-consumer:prove`
- `uc018:abandon:prove`
- `uc018:abandon:http:prove`
- `uc018:graph:prove`
- `uc018:ttl:prove`
- `commerce-reconcile:prove`

以及：

`node scripts/ai-docs/check-docs.mjs`

## §8

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

获取租约时，把状态写成 active 的更新只命中 created、active、waiting_user、migrating、paused、quarantined。不在这六值里的行更新不到，仍当作未取得，不另插一行。该行的 status 与 version 保持原值。

放弃收口，以及绕过收口的对账冲突路径，把该面试仍为 queued 的作业写成 failed。last_error 为 abandoned，lease_owner 与 lease_expires_at 清空，version 加一，并去掉 payload 的 answer。running、done、已经是 failed 的行不改。没有 queued 行时为零行，再次进入仍安全。

没有新迁移，也没有改已经应用的迁移字节。

图运行证明里，原夹具写入的事件种类不在检查约束中，面试状态 active 也不再能被放弃语句接住。夹具改为 question_ready，面试改为 waiting_user。图运行仍从 active 收到 safely_terminated。

点名的证明脚本退出码都是 0。文档扫描数仍是 2282。
