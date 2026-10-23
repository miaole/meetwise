executed:awaiting_post_prove_dual

# 投递流拉取失败不再当成没有新消息

## §0 现场

`apps/api/src/platform/sse-pump.ts` 第 195 行现在是：

`const more = await o.fetchMore(lastSeq).catch(() => null);`

第 196 行紧接着 `if (more === null) break;`，行尾注释把这写成取数失败就收尾。`fetchMore` 一旦抛错，会被收成 `null`，走进这次 `break`。循环结束后，第 201–204 行仍注销等待者和登记，第 207 行在连接未断开时执行 `reply.raw.end()`。`pumpSseEvents` 正常返回。调用方看不见这次抛错。对端看到的是正常结束，表现成没有新消息、流已经结束，而不是失败。

第 198–199 行是另一条路：有行才写出事件；`rows` 为空则写 `: ping`，并继续循环。这才是正常的「没有更多」。空结果不是异常，也不走第 196 行。

第 52–53 行的类型允许 `fetchMore` 返回 `{ rows }` 或 `null`。这里的 `null` 是调用方主动返回的值。主动返回的 `null` 与抛错被吞掉之后变成的 `null`，今天在第 196 行无法区分。

同一文件里已经处理过、这次不得重新打开的相邻行为：

- 第 76–81、91–92、106–119、171 行：连接上未落盘字节超过阈值后，用自有旗在帧边界断开。该旗与关闭旗、排水旗分开。阈值内仍把帧写出并推进游标。
- 第 90、121–125、188、197 行：停机排水只在帧边界停取。等在取数窗里时不再把新行写出去。晚到的连接在排水已开始时直接收尾。
- 第 137–145、190–194 行：只有增量环里有帧、且这次不是通知唤醒时，才跳过 `fetchMore`。通知唤醒、计时器唤醒、对端断开唤醒，仍走取数。
- 第 70–71、172–174 行：通道健康时用长间隔兜底；退化时用短轮询。生产钉值与注入缝都不改。
- 第 23–25、126–127、169–170 行：每轮先登记等待者，再写已有行。重放仍是序号大于上次游标的同一形状。
- 第 135 行：单条连接封顶十分钟。
- 第 136 行：对端断开即把本轮等待叫醒。
- 第 199 行：成功取回空结果时写心跳。写失败才退出。
- 第 205–207 行：正常退出只有一处 `reply.raw.end()`。

主动返回 `null` 的收尾也已经有证明，不改语义：`apps/api/test/ha-2-drain.proof.ts` 第 169–171 行把取数完成值设为 `null`，断言结束一次且登记归零。`apps/api/test/sse-push-notify.proof.ts` 第 603 行让 `fetchMore` 返回 `null`，第 611 行断言泵因此在帧边界结束。

鉴权留在泵外，行号如下，不改：`apps/api/src/modules/interview/interview.controller.ts` 第 265 行、`apps/api/src/modules/quiz/quiz.controller.ts` 第 60 行、`apps/api/src/modules/diagnosis/diagnosis.controller.ts` 第 58 行，初次取数为 `null` 时直接回 404，不会进入泵。`apps/api/src/modules/quiz/quiz.service.ts` 第 131–137 行、`apps/api/src/modules/diagnosis/diagnosis.service.ts` 第 104–110 行在记录不存在时返回 `null`。`apps/api/src/modules/interview/interview.service.ts` 第 901–908 行成功时返回 `{ lastId, rows }`，库失败会抛错。三个控制器的 `await pumpSseEvents` 在面试第 268 行、押题第 62 行、诊断第 60 行；槽位释放在对应的 `finally`（第 278、70、68 行）。

## §1 修法

只改两个现有文件：`apps/api/src/platform/sse-pump.ts`，以及扩展 `apps/api/test/sse-push-notify.proof.ts`。不新增文件。

第 195 行去掉 `.catch(() => null)`，让 `fetchMore` 的拒绝留在泵里。抛错时：

1. 不要把拒绝收成 `null`，也不要落入第 196 行那种收尾。
2. 先走第 201–204 行已有的清理：`wait.dispose()`、增量订阅若存在则 `dispose`、`registry.unregister`。不另写一套注销。
3. 不要调用第 207 行的 `reply.raw.end()`。改为 `reply.raw.destroy?.(err)`。问号调用与第 104 行 `reply.raw.on?.` 相同，没有该方法的假对象不会再抛第二次。对端看到的是中断，不是正常结束，也不是第 199 行的心跳。
4. 然后把原来的错误从 `pumpSseEvents` 抛出。上面三个控制器已有的 `await` 因此看见拒绝。不要给控制器加 `catch`，控制器文件不改。

正常的「没有更多」仍是成功的空结果：`fetchMore` 兑现且 `rows` 为空时，继续走第 199 行，泵不因此拒绝。

调用方主动返回的 `null` 仍走第 196 行，再走第 207 行那一处正常结束。第 52 行注释改成只描述这种主动返回的 `null`。第 196 行注释同样只保留主动 `null`。两处都不要再写成「抛错也收尾重连」。

`apps/api/test/ha-2-drain.proof.ts` 第 277 行要求源码里 `reply.raw.end()` 恰一处。抛错路径用 `destroy`，不得再写一处 `end()`。第 281 行的 `while` 条件整行不改。

扩展 `apps/api/test/sse-push-notify.proof.ts` 时只加两臂，放在该文件已有的泵驱动旁边：

- 抛错臂：`fetchMore` 拒绝。断言 `pumpSseEvents` 以同一个错误拒绝；注入的登记计数回到 0；`end` 次数为 0；`destroy` 被调用。该文件已从 `sse-registry` 引入 `createSseRegistry`，直接用，不新增测试文件。
- 空结果臂：`fetchMore` 返回 `{ rows: [] }`。断言这次泵不因空结果拒绝，写出里仍有 `: ping`。

同文件第 603 与 611 行返回 `null` 的那一臂一字不改。

## §1.3 否决

- 不改鉴权。不改初次取数为 `null` 时的 404，不改领槽与过多连接时的 429，不改服务层「记录不存在则返回 `null`」，不改谁可以读这条流。
- 不新增迁移。
- 不新增文件。产品与证明都只改上面两个现有文件。
- 不改已经单独收口的其他推送行为：未落盘超阈值后的断开、停机排水、增量帧在非通知唤醒时跳过取数、健康兜底与退化轮询、游标之后的重放、十分钟封顶、对端断开即醒、空结果心跳、主动返回 `null` 后的正常收尾。也不要写一条名为 `error` 的业务帧来冒充可见失败；现有终态集合会把这种帧当成这场推送结束。

## §2 现有证明

执行时只扩展现有证明，不新增文件。需要加断言的只有 `apps/api/test/sse-push-notify.proof.ts`。其余脚本保持原样，避免把已收口的臂再打开。

现有脚本：

- `apps/api/test/sse-push-notify.proof.ts`
- `apps/api/test/sse-delta-arm.proof.ts`
- `apps/api/test/sse-listen-probe.proof.ts`
- `apps/api/test/sse-principal-slot.proof.ts`
- `apps/api/test/last-event-id.proof.ts`
- `apps/api/test/ha-2-drain.proof.ts`
- `apps/api/test/uc-e2e-010-sse-resume.proof.ts`
- `apps/web/test/sse-idle-watchdog.proof.ts`

文档检查命令：`node scripts/ai-docs/check-docs.mjs`

## §8

executed:awaiting_post_prove_dual

## 文末

executed:awaiting_post_prove_dual

## §9-rev

执行时以本节更正后的行为为准。

`apps/api/src/platform/sse-pump.ts` 第 170 行是 `if (!draining) emit(o.initial.rows);`。这一行是已有行写出，不是背压帧边界。带 `!bpTripped` 的 `while` 在第 171 行。未落盘超阈值后置自有旗，仍在第 106–119 行；第 171 行的 `while` 读到该旗就不再进入下一轮。不改背压。

短轮询 `: DEGRADED_POLL_MS` 在第 174 行，就在第 172–174 行这段间隔选择里。第 175 行不是短轮询。第 70–71 行两个常量维持不变。

第 126–127 行只是 `lastSeq` 和 `done` 的初始化。登记等待者在第 169 行和第 189 行。已有行写出在第 170 行。

对端断开不会继续取数。第 136 行把 `closed` 置上并叫醒，第 188 行在 `fetchMore` 之前就 `break`。计时器唤醒只有增量环为空时才取数。环里有帧且不是通知唤醒时，第 190–194 行跳过 `fetchMore`。

修法不变。`fetchMore` 抛错不能再被 `.catch(() => null)` 收成正常结束。成功的空结果仍心跳。主动返回的 `null` 仍正常结束。不改鉴权，不改背压，不新增文件或迁移。

executed:awaiting_post_prove_dual

## §9-EXEC

`apps/api/src/platform/sse-pump.ts`：去掉 `fetchMore` 的 `.catch(() => null)`。抛错时先走原有清理：`wait.dispose()`、增量订阅若存在则 `dispose`、`registry.unregister`。不调用 `reply.raw.end()`。改为 `reply.raw.destroy?.(err)`，再把原来的错误抛出。`rows` 为空仍写 `: ping`，泵不因此拒绝。调用方主动返回的 `null` 仍正常 `end()`。类型注释与 `null` 分支注释只描述这种主动返回。`reply.raw.end()` 仍恰一处。`while` 条件那一行的文字未改；为保存抛错，在它前面增加了两个局部量，条件现位于其后。

`apps/api/test/sse-push-notify.proof.ts`：在已有泵驱动旁加两臂。抛错臂：`fetchMore` 拒绝，`pumpSseEvents` 以同一个错误拒绝，登记计数回到 0，`end` 次数为 0，`destroy` 被调用。空结果臂：`fetchMore` 返回 `{ rows: [] }`，泵不因空结果拒绝，写出里仍有 `: ping`。同文件返回 `null` 的那一臂未改。

三条门退出码：`pnpm sse-push:notify:prove` 为 0；`pnpm -C apps/api prove:ha2-drain` 为 0；`node scripts/ai-docs/check-docs.mjs` 为 0，扫描 2282，不超过 2288。
