# 嵌入结果缺少用量时按文本估算结算

**Status**: `draft:awaiting_pre_exec_dual`

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

`draft:awaiting_pre_exec_dual`

与文首状态行、文末状态相同。本文件只说明改法。不改产品代码，不新增代码文件。

---

*嵌入缺用量结算改法 · `draft:awaiting_pre_exec_dual`*
