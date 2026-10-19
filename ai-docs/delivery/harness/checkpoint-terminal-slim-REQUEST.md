executed:awaiting_post_prove_dual

# 终态面试后只保留最后一份检查点

本说明只记录改法。不改产品代码。按下面的权限约束，这一条做不到，又不新造保留期限。需要用户决定。

## §0 锚

行号在本工作树亲读。下面引用的是该行原文。

### 0.1 对话记录的归约是拼接，每一轮再写一版检查点

`packages/ai-graphs/src/adaptive-interview/state.ts`

- 第 269 行：

```
  transcript: Annotation<Turn[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
```

对话记录用 `a.concat(b)` 拼接。检索包不是这条归约。它在第 306 行与第 309 行，归约是覆盖，缺省 null：

```
   * 出题续跑检索包。覆盖通道：归约 `(_, b) => b`，旧检查点缺省 null，不回填。
```

```
  retrievalPacket: Annotation<QuestionRetrievalPacket | null>({ reducer: (_, b) => b, default: () => null }),
```

`packages/ai-graphs/src/adaptive-interview/graph.ts` 第 65 行：

```
    .compile({ checkpointer });
```

图带着检查点编译。`apps/worker/src/checkpoint-fence.ts` 第 4 行写明 invoke 内部的 superstep 会 put：

```
 * 红面：checkpoint 写（invoke 内部 superstep put/putWrites）是全链唯一零 fence 消费的持久化写面
```

同文件第 9 行：put 落下新的检查点标识。

```
 * checkpoint.id 不参与放行判定——put 缝落新 id、putWrites 缝的 config 是否携带 checkpoint_id
```

同文件第 79 行把 put 交给内层：

```
    return this.inner.put(config, checkpoint, metadata, newVersions);
```

`packages/db/migrations/0043_langgraph_checkpoint_least_privilege.sql` 第 9–10 行：主键含 `checkpoint_id`，并保留父标识。新标识是新行，插入不删旧行。

```
  parent_checkpoint_id text, type text, checkpoint jsonb NOT NULL, metadata jsonb NOT NULL DEFAULT '{}',
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
```

`apps/worker/src/adaptive-lifecycle.ts` 第 446 行，每一轮回答再 invoke 一次：

```
    await g.invoke(new Command({ resume: { answerId: input.answerId } }), cfg);
```

因此每一轮都会再写一版检查点。新版里的对话记录是拼接结果，旧版行还在。

### 0.2 检查点行的删除只出现在隐私擦除

`packages/db/migrations/0048_checkpoint_physical_erasure.sql` 第 429–433 行。其中第 429、431、433 行是 DELETE，中间两行是行计数：

```
  DELETE FROM checkpoint_writes WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_writes = ROW_COUNT;
  DELETE FROM checkpoint_blobs WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_blobs = ROW_COUNT;
  DELETE FROM checkpoints WHERE thread_id=target_row.thread_id;
```

同文件第 74 行把这三张表的 DELETE 授给 `privacy_worker_owner`：

```
GRANT SELECT, DELETE ON checkpoints, checkpoint_blobs, checkpoint_writes TO privacy_worker_owner;
```

同文件第 485–486 行与第 490 行：清除函数不给 `app_role`，应用角色也不是隐私执行者。

```
REVOKE ALL ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) TO privacy_worker_executor;
```

```
REVOKE privacy_worker_executor FROM app_role;
```

`packages/db/migrations/0078_privacy_worker_parent_request_guard.sql` 第 133–137 行是后写的同一组删除，运行时函数体以这里为准。第 133、135、137 行是 DELETE：

```
  DELETE FROM checkpoint_writes WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_writes = ROW_COUNT;
  DELETE FROM checkpoint_blobs WHERE thread_id=target_row.thread_id;
  GET DIAGNOSTICS removed_blobs = ROW_COUNT;
  DELETE FROM checkpoints WHERE thread_id=target_row.thread_id;
```

同文件第 144 行：删完必须没有剩余行。

```
  IF remaining <> 0 THEN
```

同文件第 188 行把函数属主留给 `privacy_worker_owner`。第 189 行撤销的是 schema 上的 CREATE，不是这三张表：

```
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;
```

第 192–193 行撤销 `app_role` 的执行权，并只授给 `privacy_worker_executor`：

```
ALTER FUNCTION privacy_purge_checkpoint_target(uuid,uuid) OWNER TO privacy_worker_owner;
```

```
REVOKE ALL ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_purge_checkpoint_target(uuid,uuid) TO privacy_worker_executor;
```

这三句删除按整个 `thread_id` 删光，不会留下最后一份。

`packages/db/migrations/0096_int_transcript_remaining_sinks.sql` 第 227 行撤销应用角色开始这条擦除的执行权：

```
REVOKE EXECUTE ON FUNCTION privacy_begin_checkpoint_erasure(text,text) FROM app_role;
```

`packages/db/migrations/0144_db_trigfam_unify.sql` 第 862 行注明替换时权限自动保留。第 863–877 行重声明函数，其中没有 GRANT，没有把执行权授回 `app_role`。第 862 行与第 876–877 行：

```
-- 薄壳（逐字重声明 SD + SET · owner=privacy_api_owner 与 ACL={privacy_api_owner} 自动保留）。
```

```
  RETURN QUERY SELECT * FROM public.tf_checkpoint_erasure(target_thread, request_key_hash);
END $$;
```

### 0.3 终态不清历史版本

`packages/ai-graphs/src/adaptive-interview/nodes/conclude.ts` 第 5–6 行只置终态标记，不删行：

```
    concluded: true,
    concludeReason: state.concludeReason ?? state.mind.lastDecision ?? null,
```

`packages/ai-graphs/src/adaptive-interview/graph.ts` 第 61 行把收尾接到结束：

```
    .addEdge('conclude', END)
```

`apps/worker/src/adaptive-lifecycle.ts` 第 581 行起的收口事务是应用角色。`packages/db/src/principal.ts` 第 999 行：

```
    await c.query('SET LOCAL ROLE app_role');
```

`apps/worker/src/adaptive-lifecycle.ts` 第 617 行在完成臂调用结算，不碰检查点表：

```
        await completeInterviewAndConfirm(c, d.owner, d.interviewId);
```

`packages/db/src/commerce/commerce.ts` 第 379 行把面试标成 completed，第 422 行的失败臂标成 failed。两句都不写检查点表：

```
    `UPDATE interview SET status='completed', version=version+1
```

```
    `UPDATE interview SET status='failed', version=version+1
```

`apps/worker/src/checkpoint-fence.ts` 第 87–88 行只把 `deleteThread` 传给内层：

```
  override async deleteThread(threadId: string): Promise<void> {
    return this.inner.deleteThread(threadId);
```

`apps/worker/src` 里没有调用 `deleteThread`。终态面试不会因为结束而清掉历史版本。

### 0.4 保留期限仍待确认，应用角色直接删表被否决

`ai-docs/requirements/open-decisions.md` 第 67 行把 checkpoint retention TTL 放在待确认锁定里，没有天数、小时数或次数：

```
- 数值默认（待确认锁定）：支付 TTL `PIN=15min`、reserveTTL `PIN=72h`、补单窗口 `PIN=24h`、时钟漂移 `PIN=±5min`、退款自动审批阈值 `PIN=≤20000分且未消耗100%`、checkpoint retention TTL、FE 运行页 JS `PIN≤180KB`/LCP `PIN≤2.5s`。
```

`packages/db/migrations/0043_langgraph_checkpoint_least_privilege.sql` 第 24 行已经把表级 DELETE 授给 `app_role`：

```
GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_migrations, checkpoints, checkpoint_blobs, checkpoint_writes TO app_role;
```

`packages/db/migrations/0047_checkpoint_privacy_fence.sql` 第 154 行的策略是 FOR ALL，包含 DELETE：

```
CREATE POLICY checkpoints_owner ON checkpoints FOR ALL TO app_role
```

`packages/db/migrations/0048_checkpoint_physical_erasure.sql` 第 4–5 行写明新增的破坏能力不把通用 DELETE 交给 `app_role`。第 294 行在登记仍有效且世代匹配时，对 DELETE 返回 OLD。表级授权还在，直接 DELETE 的口子没有被收掉：

```
-- destructive capability needed to remove a revoked thread without handing
-- app_role a generic DELETE privilege.  API callers can only create/fence a
```

```
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
```

## §1 修法

只允许这一条：面试进入终态之后，异步处理该线程，二选一。

1. 收成最后一份检查点：留下最后一行，删掉更早的检查点行。
2. 或者删掉该线程在 `checkpoints`、`checkpoint_blobs`、`checkpoint_writes` 上的行。

必须沿用现有删除权限。不能让应用角色新增直接删表的能力。不能扩大谁可以擦除。

现有会执行这三句 DELETE 的过程是 `privacy_purge_checkpoint_target`。它要求隐私目标仍在租约内，按整个线程删光，剩余不是 0 就失败。它不留下最后一份。执行者只有 `privacy_worker_executor`。`app_role` 不能执行它，也不能执行 `privacy_begin_checkpoint_erasure`。面试终态事务是 `SET LOCAL ROLE app_role`，然后 `completeInterviewAndConfirm`。这条路径没有隐私租约。

让终态去创建隐私目标，或去调用上述过程，擦除就不再只从现有隐私路径发起。谁可以擦除就被扩大了。收成最后一份也没有现成过程：现有过程必须删光。

因此在不发明保留期限、不新增应用角色直接删表能力、不扩大谁可以擦除的前提下，这一条做不到。需要用户决定。不假装能做。不写按天、按小时或按次数的保留期限，也不写定时清扫。

## §1.3 否决

- 否决新造保留天数，也否决新造保留小时数或保留次数。`ai-docs/requirements/open-decisions.md` 第 67 行的 checkpoint retention TTL 仍是待确认，本说明不补一个数。
- 否决定时清扫。终态之后的那一次异步处理若做不到，不能改成周期任务。
- 否决应用角色直接 DELETE。`packages/db/migrations/0043_langgraph_checkpoint_least_privilege.sql` 第 24 行的表级 DELETE、`packages/db/migrations/0047_checkpoint_privacy_fence.sql` 第 154 行的 FOR ALL、`packages/db/migrations/0048_checkpoint_physical_erasure.sql` 第 294 行对有效登记返回 OLD，都不是这条改法要走的口子，也不再新增授权。
- 否决把 `privacy_begin_checkpoint_erasure` 或 `privacy_purge_checkpoint_target` 重新授给 `app_role`。
- 否决让面试终态成为新的擦除发起者。

## §2 门

不新增命令，不新增脚本，不新增定时任务。这次不调用模型，下面也不列入模型出站检查。

将来只有在用户决定、并且改动仍沿用现有删除权限时，才跑已经存在的命令：

- `node scripts/ai-docs/check-docs.mjs`。根 `package.json` 第 9 行把它写成 `docs:check`。`.github/workflows/ci.yml` 第 49 行已经执行 `pnpm docs:check`。
- `pnpm -C packages/db prove:uc052-checkpoint-physical`。`packages/db/package.json` 第 53 行已有，对应 `tsx test/uc052-checkpoint-physical.proof.ts`。
- `pnpm -C apps/worker prove:checkpoint-privacy-erasure`。`apps/worker/package.json` 第 105 行已有，对应 `tsx test/checkpoint-privacy-erasure.proof.ts`。
- `pnpm -C apps/worker prove:adaptive-life`。`apps/worker/package.json` 第 59 行已有，对应 `tsx test/adaptive-lifecycle.proof.ts`。终态收口在这条路径上。

这些都不是新入口。用户决定之前，不改产品代码，也不另起命令。

## §8 状态

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-rev

上文文首与 §1 写明这一条做不到，需要用户决定。那两处句子保留，不改。本节更正该结论：路走得通。面试终态的事务提交成功之后，用现有围栏检查点器对该 thread 调用已有的 `deleteThread`，删掉该线程全部检查点行。不新造保留天数、小时数或条数。不新授 DELETE。不新迁移。不调用隐私擦除函数。不要求隐私租约。未终态的线程不删。删除失败不回滚已经完成的终态。

### 9.1 生产检查点器已经是应用角色，并带上线程与世代

`apps/worker/src/main.ts` 第 484 行，生产检查点器是：

```
  const cp = createCheckpointer(undefined, true);
```

同文件第 125–139 行：`useRuntimeRole` 为真时，连接参数加上 `-c role=app_role`，返回的池是 `PrincipalBoundCheckpointPool`。

`apps/worker/src/checkpoint-principal.ts` 第 144 行在取出的连接上执行 `SET ROLE app_role`。第 146–148 行写入 `app.principal_user`、`app.checkpoint_thread_id`、`app.checkpoint_epoch`。不写隐私目标，不写隐私租约：

```
      await client.query('SET ROLE app_role');
      await client.query(
        `SELECT set_config('app.principal_user', $1, false),
                set_config('app.checkpoint_thread_id', $2, false),
                set_config('app.checkpoint_epoch', $3, false)`,
```

第 13–16 行与第 142 行：没有这份访问上下文就拒绝取连接。

### 9.2 表级 DELETE 已授给应用角色，之后没有收回

`packages/db/migrations/0043_langgraph_checkpoint_least_privilege.sql` 第 24 行：

```
GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_migrations, checkpoints, checkpoint_blobs, checkpoint_writes TO app_role;
```

`packages/db/migrations/0045_checkpoint_thread_rls.sql` 第 72 行只收回迁移记账表：

```
REVOKE ALL ON checkpoint_migrations FROM app_role;
```

此后的迁移没有收回 `checkpoints`、`checkpoint_blobs`、`checkpoint_writes` 上 `app_role` 的 DELETE。`packages/db/migrations/0048_checkpoint_physical_erasure.sql` 第 74 行是另授给 `privacy_worker_owner`，不是收回应用角色。沿用第 24 行，不是新授权。

`packages/db/migrations/0045_checkpoint_thread_rls.sql` 第 21–26 行对这三张表打开并强制行级安全。`packages/db/migrations/0047_checkpoint_privacy_fence.sql` 第 154 行的策略是 `FOR ALL`，包含 DELETE。第 155–160 行在登记仍为 `active`、线程参数等于该行 `thread_id`、世代参数等于 `fence_epoch` 时放行：

```
CREATE POLICY checkpoints_owner ON checkpoints FOR ALL TO app_role
  USING (EXISTS (SELECT 1 FROM checkpoint_thread_enrollment e
    WHERE e.thread_id=checkpoints.thread_id
      AND e.owner_user_id=current_setting('app.principal_user', true)
      AND e.access_state='active'
      AND current_setting('app.checkpoint_thread_id', true)=checkpoints.thread_id
      AND current_setting('app.checkpoint_epoch', true)=e.fence_epoch::text))
```

同文件第 169 行是 `checkpoint_blobs`，第 184 行是 `checkpoint_writes`，谓词相同。此后没有再替换这三条给 `app_role` 的策略。

`packages/db/migrations/0048_checkpoint_physical_erasure.sql` 第 257 行起替换触发器函数，此后没有再替换。第 264–282 行只在 `app.privacy_target_id` 与 `app.privacy_lease_token` 都有值时走隐私租约。应用角色这条池子不设置这两个参数，于是落到第 283–289 行：仍要求登记为 `active` 且世代匹配。第 294 行：

```
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
```

该条件下删除继续。这条不看隐私租约。第 298 行撤销的是函数执行权，不取消这三张表上已有的删除触发器。

### 9.3 围栏把 deleteThread 原样交给内层，内层按线程删光

`apps/worker/src/checkpoint-fence.ts` 第 77–84 行只在 `put` 与 `putWrites` 前复核图租约。第 87–88 行的 `deleteThread` 不走那次复核，原样交给内层：

```
  override async deleteThread(threadId: string): Promise<void> {
    return this.inner.deleteThread(threadId);
```

内层是 `@langchain/langgraph-checkpoint-postgres` 1.0.4，版本在 `pnpm-workspace.yaml` 第 17 行。`apps/worker/node_modules/@langchain/langgraph-checkpoint-postgres/dist/index.js` 第 376–383 行另起事务，按传入的 `threadId` 删除三张表，然后提交。失败只回滚这三句：

```
	async deleteThread(threadId) {
		const client = await this.pool.connect();
		try {
			await client.query("BEGIN");
			await client.query(this.SQL_STATEMENTS.DELETE_CHECKPOINT_BLOBS_SQL, [threadId]);
			await client.query(this.SQL_STATEMENTS.DELETE_CHECKPOINTS_SQL, [threadId]);
			await client.query(this.SQL_STATEMENTS.DELETE_CHECKPOINT_WRITES_SQL, [threadId]);
			await client.query("COMMIT");
```

同包 `dist/sql.js` 第 73–75 行，三句都是 `WHERE thread_id = $1`：

```
		DELETE_CHECKPOINTS_SQL: `DELETE FROM ${SCHEMA_TABLES.checkpoints} WHERE thread_id = $1`,
		DELETE_CHECKPOINT_BLOBS_SQL: `DELETE FROM ${SCHEMA_TABLES.checkpoint_blobs} WHERE thread_id = $1`,
		DELETE_CHECKPOINT_WRITES_SQL: `DELETE FROM ${SCHEMA_TABLES.checkpoint_writes} WHERE thread_id = $1`
```

删掉的是该线程在 `checkpoint_blobs`、`checkpoints`、`checkpoint_writes` 上的全部行，不是只留最后一份。

### 9.4 终态只改面试状态，不撤回登记

`packages/db/src/commerce/commerce.ts` 第 379 行把面试标成 `completed`。第 422 行把失败臂标成 `failed`。两句都不写 `checkpoint_thread_enrollment`。第 475–482 行在完成臂把 `ai_graph_run` 标成 `succeeded` 并清掉图租约，仍不改登记。

登记写在 `packages/db/src/checkpoint/checkpoint-thread.ts` 第 13–18 行。已有登记在第 31–33 行：仍为 `active` 才交回原来的 `fence_epoch`。终态事务不调用撤回。因此终态提交之后，同一登记仍是 `active`，世代不变。第 9.2 节的策略与第 294 行继续放行删除。图租约被清掉也不挡住这次删除，因为 `deleteThread` 不调用 `assertWriteFence`。

`packages/db/src/principal.ts` 第 1002 行在 `asPrincipal` 的回调成功返回后 `COMMIT`。第 1004 行只在回调抛错时 `ROLLBACK`。删除放在这次提交之后，就不在这句回滚的范围内。

### 9.5 接下来的产品修法

只此范围。产品代码以后再改。本说明现在只记录修法。

面试进入终态，并且包住该终态的 `asPrincipal` 已经提交成功之后，用这次作业里已经造好的围栏检查点器，对该 thread 调用已有的 `deleteThread`。检查点器是 `apps/worker/src/interview-consumer.ts` 第 480 行的 `FenceCheckpointSaver`。调用必须留在第 473 行 `withCheckpointAccess` 的回调内。`startAdaptiveInterview` 与 `submitAdaptiveAnswer` 在第 581 行和第 583 行，仍在该回调内。线程标识用这场面试已有的 thread，也就是 `interviewId`。

三处都在终态事务返回之后再删，不放进该事务内部：

- 开始路径出题失败：`apps/worker/src/adaptive-lifecycle.ts` 第 383 行 `emitGenerationUnavailable` 返回之后。其第 102 行的 `asPrincipal` 提交后，面试已是 `failed`。
- 回答路径出题失败：第 466–545 行的投影事务在第 501 行写入失败终态，并在该回调返回时提交。第 569 行返回之前删除。
- 回答路径收尾：第 581–653 行的 `asPrincipal` 返回之后。完成臂是第 617 行与第 627 行的 `completeInterviewAndConfirm`。失败臂是第 648 行的 `failInterviewAndRelease`。

效果是删掉该线程全部检查点行。不留最后一份。不新造保留天数、小时数或条数。不新授 DELETE。不新迁移。不调用 `privacy_purge_checkpoint_target`。不调用 `privacy_begin_checkpoint_erasure`。不设置隐私租约。

未终态不删。还有下一题、仍在澄清、或终态事务抛错并回滚时，不调用 `deleteThread`。

删除失败不得回滚已经完成的面试终态。三句删除在检查点器自己的事务里（`dist/index.js` 第 379 行与第 383–386 行）。调用放在终态 `COMMIT` 之后，捕获错误并且不向外抛。这样不会进入 `apps/worker/src/interview-consumer.ts` 第 233 行的作业失败收口，也不会把已提交的 `completed` 或 `failed` 改回去。

证明只扩展已有 `apps/worker/test/adaptive-lifecycle.proof.ts`。命令仍是 `apps/worker/package.json` 第 59 行已有的 `prove:adaptive-life`。不新建证明文件，不新建第二个受管文件。本说明仍是唯一新增受管文件。

上文「需要用户决定」的句子保留。以本节为准。

## §9-EXEC

产品改动只在 `apps/worker/src/adaptive-lifecycle.ts`。终态事务提交成功之后，用调用方已经注入的检查点器对该面试的 `interviewId` 调用已有的 `deleteThread`。生产调用方在 `interview-consumer.ts` 的 `withCheckpointAccess` 回调里把围栏检查点器放进依赖，所以上面三次调用仍发生在这个回调返回之前，且不在还会回滚的事务里。

三处：

- 开始路径出题失败：`emitGenerationUnavailable` 返回之后。
- 回答路径出题失败：投影事务提交之后、该失败返回之前。
- 回答路径收尾：包住完成或失败终态的 `asPrincipal` 返回之后。

未终态不删。还有下一题、仍在澄清、或终态事务抛错回滚时，不调用 `deleteThread`。删除失败被捕获并且不向外抛，已经提交的 `completed` 或 `failed` 保持原样。

没有新造保留天数、小时数或条数。没有新授 DELETE。没有新迁移。没有调用 `privacy_purge_checkpoint_target`。没有调用 `privacy_begin_checkpoint_erasure`。没有设置隐私租约。证明只扩展 `apps/worker/test/adaptive-lifecycle.proof.ts`。

`pnpm -C apps/worker prove:adaptive-life` EXIT=0。终态前三张表计数为 checkpoints=6、blobs=21、writes=17；该线程终态提交成功后三张表行数都是 0。

类型检查本步没跑。lint 本步没跑。

`node scripts/ai-docs/check-docs.mjs` EXIT=0。
