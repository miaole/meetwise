## §0 锚

行号取自基线 `0cebd82b625cbf1b514eb161e34a18cbb3447a53` 的工作树原文。下面引用的是打开文件时读到的句子，不是估计。

`buildMockInterviewRunner` 已不在。`apps/worker/src/main.ts:141-142` 只剩注释，原文写着「buildMockInterviewRunner 已删」和「不经此 mock runner」。该文件这一段没有函数定义。不要把这个函数写回去。

模拟图还在，两份测试也还在。

`packages/ai-graphs/src/mock-interview.ts:15` 仍导出 `buildMockInterviewGraph`。`:20` 原文是 `const answer = interrupt({ question });`。`:21` 原文是 `return { questions: [question], answers: [String(answer)], idx: i + 1 };`。interrupt 的返回值被 `String(answer)` 写进 `answers`。这就是原始作答文本进状态的位置。

`packages/ai-graphs/src/index.ts:11` 仍导出该函数：`export { buildMockInterviewGraph } from './mock-interview.ts';`。

`apps/worker/test/voice.proof.ts:6` 导入 `buildMockInterviewGraph`。`:22` 与 `:33` 各建一次图。`:41` 原文是 `语音转写即答案,与文本路径逐字相同`，并把 `snapV.values.answers` 与作答原文数组比较。

`apps/worker/test/resume.int.ts:8` 导入同一函数。`:16` 原文是 `const build = (cp: any) => buildMockInterviewGraph(cp, QUESTIONS);`。`:33` 与 `:40` 用 `Command({ resume })` 喂入两句作答原文。`:36` 与 `:42` 只断言 `answers` 的条数，没有断言原文缺席。

`packages/db/src/index.ts:61-65` 的 `acquireLease` 仍执行这条只按 `thread_id` 的更新，原文是 `WHERE thread_id=$1 AND (lease_owner IS NULL OR lease_expires_at < now())`。`:68-69` 的 `releaseLease` 仍执行 `UPDATE ai_graph_run SET lease_owner=NULL WHERE thread_id=$1 AND lease_owner=$2`。两处都没有先抛错。

`packages/ai-runtime/test/runtime-kernel.proof.ts:10` 仍导入这两个函数。`:48` 断言抢占成功。`:59` 调用释放。`:62` 断言另一持有者抢占成功。`:63` 断言并发抢占失败。这四次都按「更新会执行」来写，不是按拒绝来写。

`ai_graph_run.graph_name` 已经有了，不必再加列。`packages/db/sql/01_schema.sql:27` 原文是 `graph_name text NOT NULL,`。`packages/db/migrations/0001_baseline.sql:28` 是同一句。全仓迁移里没有一份是为了补上这个列而待写的空文件。本改法不使用这列去改写那两条 `UPDATE`，也不新加迁移。

## §1 修法

保留 `buildMockInterviewGraph` 的导出、`interrupt({ question })`、`START` 到 `ask` 的边，以及按 `idx` 与题目条数决定继续或结束的条件边。不删图，不改 `packages/ai-graphs/src/index.ts` 的这行导出。

`answers` 不再保存原始作答文本。`interrupt` 的返回值不得再经 `String(answer)` 或任何拷贝进入返回状态。每一问仍往 `answers` 追加一项，该项是固定标记 `answer_omitted`。这个标记是字面常量，不取自作答，不是作答长度，不是作答的子串，也不是作答的哈希。`questions` 仍只追加当前题目，`idx` 仍加一。这样题序和条数都还在，状态里没有原文字节。

`apps/worker/test/voice.proof.ts` 与 `apps/worker/test/resume.int.ts` 都保留。语音适配器自己的转写返回值可以继续断言。图状态改为断言 `getState` 的 `values`：题目顺序仍是该文件里的 `QUESTIONS`，`answers` 的条数仍与已答轮数一致，且每一项都是 `answer_omitted`。该文件里已经写死的作答原文字节不得出现在 `values` 里。不得再断言 `answers` 与原始转写逐字相同。`resume.int.ts` 仍用新图实例和原来的 `thread_id` 续跑，仍断言下一题与结束后没有残留 interrupt。喂给 `resume` 的原文只作为 interrupt 的入参，不得写回 `answers`。不断言 checkpoint 任务日志，也不改 checkpointer。

`acquireLease` 与 `releaseLease` 改为一调用就抛出稳定错误码 `thread_only_lease_refused`。用现有的 `AppError`，`code` 与默认 `message` 都是这个字符串。抛出必须发生在任何 `c.query` 之前，因此 `:63-64` 与 `:69` 那两条只按 `thread_id` 的 `UPDATE` 都不再执行。函数仍是 async，三个参数的个数、顺序和类型不变；不得为了消掉未使用参数而删参数，也不得把参数再拼进 SQL。`index.ts:7` 与 `:60` 两句还在说「过期可抢占」和「空或已过期才能抢」的注释必须改掉，不得继续描述那条 `UPDATE` 会执行。不改 `withInterviewGraphFence` 及其他租约函数。

`packages/ai-runtime/test/runtime-kernel.proof.ts` 保留。`:48`、`:59`、`:62`、`:63` 改为断言抛出的 `errCode` 是 `thread_only_lease_refused`。`asPrincipal` 会把原错误重新抛出，断言放在调用外侧即可。同一条预先插入的 `ai_graph_run` 行，调用前后 `lease_owner`、`lease_expires_at`、`version` 都不变。不得再断言抢占成功，不得改成用别的 `UPDATE` 把租约抢下来，也不得删掉文件里其余的 CAS、事件和 invoke 断言。同脚本后面的另外三份证明文件不动。

不要新增 `graph_name` 列。不要新迁移。不要新权限。不要 `DELETE`。

## §1.3 否决

否决：删除 `buildMockInterviewGraph`；删除 `voice.proof.ts` 或 `resume.int.ts`；恢复已删除的 runner；为了兼容让租约函数继续只按 `thread_id` 更新；新增迁移；把原始答案改成哈希后仍可反推原文。

## §2 门

脚本名以当前 `package.json` 为准。

- 语音证明 `apps/worker/test/voice.proof.ts`：根脚本 `voice:prove`（`package.json:278`，`pnpm -C apps/worker prove:voice`）；worker 脚本 `prove:voice`（`apps/worker/package.json:16`，`tsx test/voice.proof.ts`）。
- 续跑证明 `apps/worker/test/resume.int.ts`：根脚本 `graph:prove`（`package.json:97`，`pnpm -C apps/worker prove:resume`）；worker 脚本 `prove:resume`（`apps/worker/package.json:11`，`tsx test/resume.int.ts`）。根上的 `resume:prove` 不是这份测试，不得拿它代替。
- 内核证明 `packages/ai-runtime/test/runtime-kernel.proof.ts`：根脚本 `runtime:prove`（`package.json:85`，`pnpm -C packages/ai-runtime prove`）；包脚本 `prove`（`packages/ai-runtime/package.json:15`，第一项就是 `tsx test/runtime-kernel.proof.ts`）。

还必须通过 `pnpm turbo typecheck --force` 和 `pnpm turbo lint`。lint 上限恰为 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。这些数字就是现有脚本里的 `--max-warnings`：根 `package.json:8`、`apps/api/package.json:7`、`packages/domain/package.json:10`、`packages/ai-runtime/package.json:14`、`apps/worker/package.json:7`、`packages/db/package.json:11`、`apps/web/package.json:7`、`packages/qdrant-store/package.json:11`、`packages/ai-graphs/package.json:10`、`packages/contracts/package.json:12`。0 errors。警告数低于上限算过。不得改这些上限。

再跑 `node scripts/ai-docs/check-docs.mjs`。

本改动不调用模型，也不新增供应商环境变量，因此不跑 `pnpm provider-egress:inventory` 与 `pnpm provider-egress:prove`。

不新增迁移，不要写迁移唯一性门。

只扩展已有测试文件 `voice.proof.ts`、`resume.int.ts`、`runtime-kernel.proof.ts`。允许改动的已有产品文件只有 `packages/ai-graphs/src/mock-interview.ts` 与 `packages/db/src/index.ts`。本说明是唯一允许新增的受管文件。

## §8

executed:awaiting_post_prove_dual

产品代码本步不改。本步只新增本说明，不改模拟图，不改两份测试，不改租约函数，不改内核证明，不改迁移，也不改 worker 入口。

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

实际改动的已有文件：

- `packages/ai-graphs/src/mock-interview.ts`：仍导出 `buildMockInterviewGraph`。`interrupt({ question })`、`START` 到 `ask`、按 `idx` 与题目条数决定继续或结束的条件边未改。`answers` 每一项改为字面常量 `answer_omitted`。不再经 `String(answer)` 保存原文、长度、子串或哈希。`questions` 仍只追加当前题目，`idx` 仍加一。
- `packages/db/src/index.ts`：`acquireLease` 与 `releaseLease` 仍是 async，三个参数的个数、顺序、类型未改。两函数在任何 `c.query` 之前抛出 `AppError`，`code` 与默认 `message` 都是 `thread_only_lease_refused`。参数不进入 SQL。文件头与函数注释里的「过期可抢占」「空或已过期才能抢」已改为说明调用即拒绝，不查询也不更新。未改 `withInterviewGraphFence` 及其他租约函数。
- `apps/worker/test/voice.proof.ts`：文件保留。语音适配器自己的转写返回值断言保留。图状态改为断言 `getState` 的 `values`：题目顺序仍是该文件的 `QUESTIONS`，`answers` 条数与已答轮数一致，且每一项都是 `answer_omitted`。该文件里的作答原文字节不得出现在 `values`。不再断言 `answers` 与原始转写逐字相同。两条路径最终图状态一致，且都没有残留 interrupt。
- `apps/worker/test/resume.int.ts`：文件保留。仍用新图实例和原来的 `thread_id` 续跑，仍断言下一题，结束后没有残留 interrupt。喂给 `resume` 的原文只作为 interrupt 入参。断言题目顺序、条数，以及每一项都是 `answer_omitted`，原文字节不出现在 `values`。
- `packages/ai-runtime/test/runtime-kernel.proof.ts`：对 `acquireLease` 与 `releaseLease` 的断言改为抛出的 `errCode` 是 `thread_only_lease_refused`。同一条预先插入的 `ai_graph_run` 行，调用前后 `lease_owner`、`lease_expires_at`、`version` 都不变。不再断言抢占成功。CAS、事件和 invoke 断言保留。同脚本后面的另外三份证明文件未改。

证明断言变成：拒绝码 `thread_only_lease_refused`；租约行三列不变；图状态作答固定为 `answer_omitted`，原文不进入 `values`。

退出码：

1. `pnpm -C apps/worker prove:voice` EXIT=0
2. `pnpm -C apps/worker prove:resume` EXIT=0
3. `pnpm -C packages/ai-runtime prove` EXIT=0
4. `pnpm turbo typecheck --force` EXIT=0
5. `pnpm turbo lint` EXIT=0
6. `node scripts/ai-docs/check-docs.mjs` EXIT=0
