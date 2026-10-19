# 图调用时传入递归上限

draft:awaiting_pre_exec_dual

## §0 现状

行号对应当前工作树，父提交 `c93c119228ed9b2248c1c4d7a967ace054c2156a`。本次不改这些代码。

### §0.1 `g.invoke`

文件 `apps/worker/src/adaptive-lifecycle.ts`。`g.invoke` 共 4 处。第二参都是 `cfg`。两处 `cfg` 都只有 `configurable.thread_id`，没有递归上限。

开始路径第 356 行：

`const cfg = { configurable: { thread_id: d.interviewId } };`

- 第 366 行 `g.getState(cfg)`。
- 第 367–372 行：没有待投影问题时，若 `snap.next` 非空，第 369 行 `await g.invoke(null, cfg)`；否则第 371 行 `await g.invoke({}, cfg)`。只有线程还没有待执行节点时才传入空对象。
- 第 373 行再次 `g.getState(cfg)`。

作答路径第 411 行：

`const cfg = { configurable: { thread_id: d.interviewId } };`

- 第 412 行 `gInitial.getState(cfg)`。
- 第 446 行 `await g.invoke(new Command({ resume: { answerId: input.answerId } }), cfg)`。
- 第 447 行 `g.getState(cfg)`。
- 第 448–451 行：本题已经写入、`next` 非空、且没有挂起问题时，第 449 行 `await g.invoke(null, cfg)`，第 450 行再读快照。

`invoke(null)` 在本文件共 5 处字面：第 274、363、434 行是注释，第 369、449 行是续跑。续跑保留。第 367–372 行的起始守卫不改。

### §0.2 `compile()`

自适应图的 `compile()` 在 `packages/ai-graphs/src/adaptive-interview/graph.ts` 第 65 行，实参是 `.compile({ checkpointer })`。第 62–63 行写明编译选项没有 `recursionLimit` 形参。现行代码没有把递归上限放回 `compile`。

装版 `@langchain/langgraph` 为 1.4.7（`pnpm-workspace.yaml` 第 16 行）。`dist/graph/state.js` 全文没有 `recursionLimit`。第 432 行 `compile` 只解构 `checkpointer, store, cache, interruptBefore, interruptAfter, name, description, transformers`。写在 `compile` 上的该键会被忽略。

缺省在 `dist/pregel/utils/config.js`：第 17 行配置键名含 `recursionLimit`，第 36 行 `DEFAULT_RECURSION_LIMIT = 25`，第 139 行组装调用配置时先填这个缺省，第 157–171 行若调用方传入同名键则覆盖。历史有效值是调用时传入 64。旧编译曾写 `recursionLimit: Math.min(64, DEFAULT_ABSOLUTE_MAX_TURNS)`；`packages/domain/src/adaptive-interview.ts` 第 100 行该常量为 120，所以数值是 64。该写法落在编译选项上，1.4.7 不生效。

`packages/ai-graphs/test/adaptive-compile-contract.proof.ts` 第 33–39 行锁住编译实参恰为 `{ checkpointer }`；第 42–45 行锁住图包源码不得出现 `recursionLimit:` 键形；第 77–80 行锁住库缺省 25，并确认调用配置键名存在。

## §1 修法

只改现有文件。在两处 `cfg` 写入 `recursionLimit: 64`，四处 `g.invoke` 继续把这份 `cfg` 作为第二参。不放回 `compile`。

- `apps/worker/src/adaptive-lifecycle.ts` 第 356 行
- 同文件第 411 行

目标字面：

`const cfg = { configurable: { thread_id: d.interviewId }, recursionLimit: 64 };`

不改 `packages/ai-graphs/src/adaptive-interview/graph.ts`。不改第 369、371、446、449 行的调用形态。`invoke(null)` 续跑仍在。第 367–372 行仍是只有全新线程才 `invoke({})`。

同一 `cfg` 也传给 `getState`（第 366、373、412、447、450 行）。`recursionLimit` 是调用预算键，不替换 `configurable.thread_id`。

现有证明锁不住这份调用配置。编译契约证明只锁编译实参、图包源码键形和库缺省 25，不读本文件。`apps/worker/test/graph-run-observability.proof.ts` 组 D（第 103–115 行）已经读入本文件全文，但只数 `invoke(null)`：`await g.invoke(null` 恰 2，`invoke(null` 恰 5，不读第二参字段。行为证明自行构造只有 `thread_id` 的配置，不经过这里的 `cfg`。执行阶段仍不新增文件，用现有证明断言配置对象：扩展 `apps/worker/test/graph-run-observability.proof.ts` 组 D，断言 `recursionLimit: 64` 恰出现在上述两处 `cfg`，且 4 处 `g.invoke` 的第二参仍是 `cfg`。原有 `invoke(null)` 计数保持不变。不新建证明文件。不改编译契约证明，以免把「键形为零」扩到本文件后与新键冲突。不改 `apps/worker/package.json`，不新登记脚本。

### §1.3 否决

- 不改 `compile` 签名以外的图结构。节点、边、条件路由不动。编译调用维持第 65 行 `.compile({ checkpointer })`。
- 不动产品门控的另一项「D3」。不改本文件第 161–165 行 `scoreWriterLeaseOwner`。不改 `apps/worker/src/score-writer.ts` 第 32 行与第 69 行的 D3 围栏序。
- 不新增迁移。

## §2 执行时要跑的脚本

名称以 `apps/worker/package.json` 为准。在 `apps/worker` 目录执行已有脚本，不改脚本表：

- `prove:adaptive-flow`（第 58 行，`tsx test/adaptive-flow.proof.ts`）
- `prove:adaptive-life`（第 59 行，`tsx test/adaptive-lifecycle.proof.ts`）
- `prove:adaptive-resume`（第 60 行，`tsx test/adaptive-resume.proof.ts`）
- `prove:adaptive-legacy-checkpoint`（第 61 行，`tsx test/adaptive-legacy-checkpoint.proof.ts`）
- `prove:adaptive-consumer`（第 64 行，`tsx test/adaptive-consumer.proof.ts`）
- `prove:voice-adaptive`（第 65 行，`tsx test/voice-adaptive.proof.ts`）
- `prove:adaptive-degrade`（第 75 行，`tsx test/adaptive-degrade.proof.ts`）
- `prove:adaptive-grounding`（第 77 行，`tsx test/adaptive-grounding.proof.ts`）
- `prove:adaptive-offtopic`（第 79 行，`tsx test/adaptive-offtopic.proof.ts`）
- `prove:adaptive-chaos`（第 80 行，`tsx test/adaptive-chaos-sequences.proof.ts`）
- `prove:adaptive-latency`（第 81 行，`tsx test/adaptive-latency.proof.ts`）
- `prove:graph-run-observability`（第 28 行，`tsx test/graph-run-observability.proof.ts`；配置断言落在这份已有证明上，扩展后必跑）

以及仓库根目录：

`node scripts/ai-docs/check-docs.mjs`

## §8 状态

draft:awaiting_pre_exec_dual

本文只记录改法。产品代码、证明与迁移都不在这次提交里改。

draft:awaiting_pre_exec_dual
