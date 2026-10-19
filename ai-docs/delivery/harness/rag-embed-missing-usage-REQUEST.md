# 嵌入结果缺少用量时按文本估算结算

**Status**: `executed:awaiting_post_prove_dual`

## §0 锚

行号取自工作树 `meetwise-rag14`、分支 `line/rag-embed-usage-draft`、`HEAD` `c93c119228ed9b2248c1c4d7a967ace054c2156a`。下面是本次打开这些文件时读到的位置和当前行为。

### 结算

`apps/worker/src/rag-cost-governance.ts`

- `:44`：`boundedPositive(env.RAG_EMBED_MAX_INPUT_TOKENS, 'max_input_tokens', 16_000)`。未设置该环境变量时，输入上限缺省为 16000。
- `:11`：从 `@meetwise/ai-runtime` 导入 `getMetrics`、`METRIC` 和 `Embedder`。还没有导入文本估算。
- `:106-:108`：`observe` 直接调用 `embedder.embed`，不预留、不结算。
- `:120`：enforce 预留把 `cfg.maxInputTokens` 交给 `reserveAiTextCost`，`maxOutputTokens` 为 0。预留额度就是上限。
- `:132-:134`：有 `embedWithUsage` 就用它；没有则只调用 `embed`，结果对象只有 `vectors`，没有 `inputTokens`。
- `:135`：`const actualTokens = result.inputTokens ?? cfg.maxInputTokens`。字段缺失时（`undefined` 或 `null`）记成上限。缺省上限是 16000，所以缺用量会被记满 16000。
- `:136-:138`：不是整数、小于 0、或大于 `cfg.maxInputTokens` 时抛 `provider_usage_out_of_reserved_range`。
- `:139`：用这个 `actualTokens` 调用 `settleAiCost`。
- `:142-:149`：上面的抛错和其他派发后失败一样，把该次记成 unknown，原因码落在允许字符集内则保留，否则为 `external_outcome_unknown`。

现有结算函数不改：`packages/db/migrations/0034_ai_cost_governance_function_fix.sql:47` 拒绝 `null` 和小于 0，允许 0；`:52-:53` 按预留行单价向上取整，实付大于预留金额则拒绝。因此 0 可以结算；不超过上限的结算量也不会越过按上限做出的预留。

### 嵌入实现省略 `inputTokens` 的位置

`packages/ai-runtime/src/embedder.ts`

- `:14-:15`：`embedWithUsage` 的返回类型里 `inputTokens` 可选。注释写明：供应商省略 usage 时该字段为 undefined，调用方必须另行结算。
- `:34-:35` 与 `:67-:68`：按批累加 `usage.prompt_tokens ?? usage.input_tokens ?? usage.total_tokens`。只有有限且不小于 0 的数字才把 `sawUsage` 设为 true。
- `:70`：`return { vectors: out, ...(sawUsage ? { inputTokens } : {}) }`。没有任何一批给出用量时，返回对象不带 `inputTokens`。
- `:88-:91`：`fakeEmbedder` 总是返回 `inputTokens: 0`。0 是在场的合法实量，不是省略。

`packages/ai-runtime/src/embedder-cache.ts:46-:53`：内层结果的 `inputTokens` 不是 `undefined` 才累加；否则返回同样不带该字段。结算侧看到的仍是缺失。

### 已导出的 `cjkWeightedEstimate`

- `packages/ai-runtime/src/model-client.ts:216-:229`：`export function cjkWeightedEstimate(value: string): number`。`:217` 空串返回 0。非空按码点累加：落在 `:201-:205` 三个区段内的码点计 1，其余按该码点 UTF-8 字节数除以 3；`:227` 对总和 `ceil`；`:228` 非空结果至少为 1。
- `packages/ai-runtime/src/index.ts:32`：包入口已经导出 `cjkWeightedEstimate`。外部从 `@meetwise/ai-runtime` 导入，不深链 `model-client.ts`。
- `apps/worker/test/estimator-v2-cjk.proof.ts:37` 空串为 0；`:38`「中文测试」为 4；`:39`「abc」为 1。单字符「a」按同一函数是 `ceil(1/3)=1`。两段「a」分别估算再相加为 2；拼成一段「aa」再估算是 `ceil(2/3)=1`。两者不同，所以必须逐段求和，不能先拼接。

### 现有测试

`apps/worker/test/rag-cost-runtime.int.ts`

- `:18-:22`：`RAG_EMBED_MAX_INPUT_TOKENS` 为 `1000`，`RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION` 为 `1000000`。此单价下 `settled_micro_cny` 等于结算 token 数。
- `:26-:29`：成功臂的 `embedWithUsage` 返回 `inputTokens: 200`。
- `:34-:35`：断言状态为 `settled` 且 `settled_micro_cny === 200`。这条保持不变。
- 本文件没有「省略 `inputTokens`」的结算臂。按 `:135` 的现状，这种调用会记成夹具上限 1000，而不是文本估算。

`apps/worker/test/rag-cost-governance.proof.ts:11` 断言开发缺省 `maxInputTokens === 16_000`。`:14-:22` 断言生产在显式传入 `16000` 且价格与预算齐全时进入 enforce，上限仍是 16000。这是上限，不是缺用量的结算量。不改这个文件。

### 已经收口的调用折叠（不要再改）

- `packages/ai-runtime/src/invoke.ts:470-:474`：`validUsage` 在 usage 整体缺失时直接返回 `undefined`，不再按上限多记。注释写明字段缺失的补齐在解析层完成。
- `packages/ai-runtime/src/model-client.ts:794-:809`：usage 对象在场但 `prompt_tokens` 或 `completion_tokens` 缺失时，缺失字段按 policy 上限补齐，并打上 `usageSource: 'usage_missing'`；usage 整体缺失则保持 `undefined`。

用量整体缺失和缺字段的折叠已经收过。本次不改 `invoke.ts`，也不改这段补齐。

## §1 修法

只改两个现有文件：

- `apps/worker/src/rag-cost-governance.ts`
- `apps/worker/test/rag-cost-runtime.int.ts`

不新增代码文件，不新增证明文件，不改其他文件。

在 `budgetedQbankEmbedding` 拿到嵌入结果之后、调用 `settleAiCost` 之前，替换 `:135` 的缺用量回落：

1. `result.inputTokens` 不是 `undefined`，并且通过现有合法性检查（`Number.isInteger`、大于等于 0、小于等于 `cfg.maxInputTokens`）时，结算量照旧用这个实量。`0` 合法，记 0，不得改成文本估算。
2. `result.inputTokens` 为 `undefined` 时，结算量等于各段文本 `cjkWeightedEstimate` 之和，再与 `cfg.maxInputTokens` 取较小值。这覆盖三处省略：`embedder.ts:70`、`embedder-cache.ts:53`，以及 `:132-:134` 只有 `embed` 的结果对象。空列表之和为 0，记 0。禁止再把缺失记成 `cfg.maxInputTokens`，也禁止在缺省配置下记成 16000。
3. 字段在场但不合法（非整数、负数、大于上限，以及 `null`）仍抛现有 `provider_usage_out_of_reserved_range`，随后仍走 `:142-:149` 的 unknown。不得把不合法实量改记成估算，也不得把大于上限的供应商实量截成上限。判断缺失只用 `=== undefined`，不要再用 `??` 把 `null` 当成缺失。
4. 只有估算值需要截断，而且必须截在范围检查之前。截断后的估算值总能通过 `:136-:138`，所以缺用量会结算成功，不会因为估算超过上限而变成 unknown。供应商实量仍先走范围检查，不截断。
5. 从 `@meetwise/ai-runtime` 的现有导入补上已导出的 `cjkWeightedEstimate`。不新写估算函数，不深链 `model-client.ts`。
6. `:44` 的缺省 16000 保持为上限。`:120` 的预留额度保持 `cfg.maxInputTokens`。`:106-:108` 的 `observe` 不结算，不改。

在 `rag-cost-runtime.int.ts` 的同一夹具里追加断言。原有 `inputTokens: 200` 得到 `settled_micro_cny === 200` 的断言保留。追加：

- `embedWithUsage` 返回向量但不带 `inputTokens`，文本为 `['中文测试']`：`status` 为 `settled`，`settled_micro_cny` 为 4。不是 1000，也不是 16000。
- 同样省略字段，文本为 `['a','a']`：结算量为 2。不是先拼接得到的 1，也不是 1000。
- 同样省略字段，文本为一段 1001 个「中」：估算为 1001，结算量截为 1000，`status` 为 `settled`，不是 unknown。
- `inputTokens: 0`，文本仍为 `['中文测试']`：结算量为 0，不是 4。
- `inputTokens: 1001`（大于本夹具上限 1000）：仍进入 unknown，不结算成 1000，也不结算成文本估算。
- enforce 下只有 `embed`、没有 `embedWithUsage`，文本为 `['中文测试']`：结算量为 4，`status` 为 `settled`。

`rag-cost-governance.proof.ts` 不改。它继续证明上限缺省是 16000。

## §1.3 否决

1. 不改动已经收口的调用折叠。不改 `packages/ai-runtime/src/invoke.ts`，也不改 `packages/ai-runtime/src/model-client.ts:794-:809` 的缺字段补齐。
2. 不提高 16000 上限，也不把缺省上限改成别的数。16000 仍只作为 `RAG_EMBED_MAX_INPUT_TOKENS` 的缺省上限。
3. 不新增迁移，不改 `ai_cost_settle` 及其 scoped 包装。
4. 不改供应商协议。不改 `embedder.ts` 的请求体、所读的 usage 字段，以及 `:70` 省略字段的返回形；不改 `embedder-cache.ts:53` 的同样返回形；不改 `fakeEmbedder` 的 `inputTokens: 0`。

一并否决：新写估算函数、深链 `model-client.ts`、新增代码文件或证明文件、改预留额度、让 `observe` 开始结算、把不合法实量吞成估算。

## §2 门

执行时只跑下面三条已有命令。不涉及模型供应商环境，不列站点清单。

1. `pnpm -C apps/worker prove:rag-cost`  
   `@meetwise/worker` 的 `apps/worker/package.json` 里脚本名是 `prove:rag-cost`，命令为 `tsx test/rag-cost-governance.proof.ts`。上限缺省 16000 的启动门必须仍通过。
2. `pnpm -C apps/worker prove:rag-cost-runtime`  
   同一 `package.json` 里脚本名是 `prove:rag-cost-runtime`，命令为 `tsx test/rag-cost-runtime.int.ts`。这是嵌入结算的现有集成测试，使用文件内的假 `Embedder`。
3. `node scripts/ai-docs/check-docs.mjs`  
   必须通过，且受管文件扫描数不超过 2288。

## §8

`executed:awaiting_post_prove_dual`

与文首状态行、文末状态相同。本文件只说明改法。不改产品代码，不新增代码文件。

---

*嵌入缺用量结算改法 · `executed:awaiting_post_prove_dual`*

## §9-rev

§1 的产品行为不改。本节只改 `apps/worker/test/rag-cost-runtime.int.ts` 里六条新断言的预算安排。开头状态、§8、文末状态行三处都仍是 `draft:awaiting_pre_exec_dual`。不因此改产品代码。

§1 列出的六条预期保留。「在同一夹具里按该列表顺序追加」不再照做。测试安排以本节为准。

### 原作用域按原顺序放不下

`:19-:22` 把 `RAG_EMBED_MAX_INPUT_TOKENS` 设为 `1000`，`RAG_EMBED_INPUT_MICRO_CNY_PER_MILLION` 设为 `1000000`（1 micro/token），`RAG_EMBED_MONTHLY_BUDGET_MICRO_CNY` 设为 `3000`。enforce 每次按上限预留 1000。结算成功后，月账把这 1000 从 reserved 换成实结。进入 unknown 后，这 1000 留在 reserved，不释放。月账闸门是 `reserved_micro_cny + settled_micro_cny + reserve_cost > limit`；超过才拒绝。`budget_exhausted` 从 `reserveAiTextCost` 返回，`budgetedQbankEmbedding` 在调用嵌入器之前抛 `rag_cost_budget_exhausted`，到不了用量范围检查。

现有用例跑完后，同一 `scope`、同一 UTC 月：`unknown-${suffix}` 冻结 1000，`ok-${suffix}` 与 `ident-${suffix}` 各实结 200。已用 1400，剩余 1600。换 revision 的绑定不一致、缺价行都不占预算。observe 不落账。

若仍在这个作用域上按 §1 的顺序追加，两条小额（4 与 2）之后再实结「1001 个中」的 1000，已用变为 2406，剩余 594。下一条无论是 `inputTokens: 0` 还是 `inputTokens: 1001`，都要再预留 1000。594 < 1000，预留直接 `budget_exhausted`。`inputTokens: 1001` 不会调用嵌入器，也不会进入 `provider_usage_out_of_reserved_range`。这一臂若先通过并冻住 1000，再加上那笔 1000 实结、两条小额和原有 1400，已用至少 3406，超过 3000。后面的「只有 embed」还要再预留 1000，同样进不去。

换到新作用域、月预算仍是 3000 时，§1 的原顺序仍不够：小额 4+2 之后实结 1000，已用 1006；`inputTokens: 0` 预留后再释放，已用仍是 1006；超上限冻结 1000 后已用 2006；最后的「只有 embed」要 2006+1000=3006，超过 3000。所以只换作用域、不改顺序，被挡住的会变成「只有 embed」那一臂。超上限那一臂必须放在该作用域的最后一次 enforce 调用。

### 新作用域与顺序

六条仍只写在 `rag-cost-runtime.int.ts`。不新增文件。原有 `inputTokens: 200` 得到 `settled_micro_cny === 200` 的断言留在原作用域，不搬。`:19-:22` 的上限 1000、单价 `1000000`、月预算 `3000` 三个数都不改。

六条用新的预算作用域，月账从 0 起算。沿用已经解析的 `cfg`，只把 `scopeId` 换成 `rag-cost-runtime-usage-${suffix}`，再调用一次 `configureRagCostGovernance`。六条的 `budgetedQbankEmbedding` 必须传入这个新配置，不能沿用原 `cfg`。每条使用各自的 `invocationId`，避免命中已有行而在预留阶段直接返回、不再调用嵌入器。省略用量时，返回对象不带 `inputTokens`（值是 `undefined`，不是 `null`）。

顺序如下。第 6 条之后，这个作用域上不再发 enforce 调用。

1. 省略 `inputTokens`，文本 `['中文测试']`：`status` 为 `settled`，`settled_micro_cny` 为 4。不是 1000，也不是 16000。这条证明缺用量记的是估算，不是记满上限。
2. 同样省略，文本 `['a','a']`：`settled`，结算量为 2。不是先拼接得到的 1，也不是 1000。
3. `inputTokens: 0`，文本仍为 `['中文测试']`：`settled`，结算量为 0，不是 4。合法实量含 0，照旧，不改走估算。断言要看 `status === 'settled'` 且实结为 0。unknown 行的 `settled_micro_cny` 是空值，`Number` 转换也会得到 0，不能只用这个转换来判断。
4. 只有 `embed`、没有 `embedWithUsage`，文本 `['中文测试']`：`settled`，结算量为 4。
5. 省略 `inputTokens`，文本为一段 1001 个「中」：估算 1001，与上限取较小值后结算量 1000，`status` 为 `settled`，不是 unknown。
6. `inputTokens: 1001`，文本 `['中文测试']`：嵌入器被调用恰好一次；拒绝码是 `external_outcome_unknown`，不是 `rag_cost_budget_exhausted`；行状态为 `unknown`；`settled_micro_cny` 为空，不是 1000，也不是 4。范围错误是 `new Error('provider_usage_out_of_reserved_range')`，没有 `.code`。现有捕获只在 `.code` 落在允许字符集内时保留原因，否则写成 `external_outcome_unknown`。不要为了让行上的原因码变成 `provider_usage_out_of_reserved_range` 而去改这处抛错。

新作用域上的占用量（每次预留 1000；成功结算只留下实结；第 3 条实结 0，预留额退回；第 6 条冻结 1000）：

- 第 1 条：预留前已用 0，0+1000≤3000，落账后 4。
- 第 2 条：预留前 4，落账后 6。
- 第 3 条：预留前 6，实结 0，落账后仍是 6。
- 第 4 条：预留前 6，落账后 10。
- 第 5 条：预留前 10，10+1000≤3000，落账后 1010。
- 第 6 条：预留前 1010，1010+1000=2010≤3000，预留成功，然后才因实量大于上限进入 unknown。落账后已用 2010。剩余 990，不够再预留一次 1000，所以它必须是最后一条。

### 1001 个「中」不能单独当证明

第 5 条的实结是 1000，和改前「缺用量记满上限」的金额相同。只有这一条时，旧的 `result.inputTokens ?? cfg.maxInputTokens` 也会实结 1000，分不出两条路径。缺用量记估算，要靠第 1 条的 4 和第 2 条的 2，两者都严格小于夹具上限 1000。第 5 条只证明估算超过上限时先截断再结算，不会变成 unknown。第 1、2 条和第 5 条合在一起，才同时盖住「不是记满上限」和「超上限的估算仍然结算」。

第 6 条的实量在场且大于上限。不把供应商实量截成 1000，也不改记成文本估算 4。它和缺用量不是同一条路径。

### 不改的行为

- 合法 `inputTokens`（含 0）照旧用实量结算。
- 缺失只在 `inputTokens === undefined` 时，按段调用已导出的 `cjkWeightedEstimate`，再与 `cfg.maxInputTokens` 取较小值。`null`、非整数、负数、大于上限仍走现有范围检查后进入 unknown，不改记估算。只有估算值在范围检查之前截断。
- 不把 16000 提高，不把夹具上限从 1000 抬高，不新增代码文件或证明文件，不改 `packages/ai-runtime/src/invoke.ts`，不改预留额度，不改 `observe`。`rag-cost-governance.proof.ts` 不改。
- §2 的三条命令不增不减。

## §9-EXEC

实际改动：

- `apps/worker/src/rag-cost-governance.ts` 从 `@meetwise/ai-runtime` 补导入已导出的 `cjkWeightedEstimate`。`inputTokens === undefined` 时，结算量是各段 `cjkWeightedEstimate` 之和再与 `cfg.maxInputTokens` 取较小值；空列表为 0。实量 `0` 仍记 0，不改成文本估算。`null`、非整数、负数、大于上限仍抛 `provider_usage_out_of_reserved_range`，随后走 unknown，不改记估算，也不把大于上限的实量截成上限。只有估算值在范围检查之前截断。缺省上限 16000、预留额度和 `observe` 未改。
- `apps/worker/test/rag-cost-runtime.int.ts` 保留原作用域里 `inputTokens: 200` 得到 `settled_micro_cny === 200` 的断言。六条新断言使用作用域 `rag-cost-runtime-usage-${suffix}`，沿用已解析的配置只换 `scopeId`，再 `configureRagCostGovernance` 一次，并把该配置传入 `budgetedQbankEmbedding`。每条各自的 `invocationId`。顺序按 §9-rev：省略中文测试实结 4、省略两段 `a` 实结 2、实量 0 实结 0、只有 `embed` 实结 4、1001 个「中」截断后实结 1000、实量 1001 进入 unknown。第 6 条是该作用域最后一次 enforce。

三条门退出码：

1. `pnpm -C apps/worker prove:rag-cost` EXIT=0
2. `pnpm -C apps/worker prove:rag-cost-runtime` EXIT=0
3. `node scripts/ai-docs/check-docs.mjs` EXIT=0，受管文件扫描数 2282，不超过 2288
