# 生产检索向量在扣费前复用进程内缓存（`executed:awaiting_post_prove_dual`）

## 状态

**状态**: `executed:awaiting_post_prove_dual`

本文只说明修法。不改产品源码，不改测试，不新增代码文件。

## 现状

行号以当前工作树为准，基线 `f46d9e1cab47a2c462202f1e1d41ce90f84794e8`。

`apps/worker/src/main.ts:539` 构造 `rawEmbedder = dashscopeEmbedder()`。`:540` 用 `cachingEmbedder(rawEmbedder, inMemoryEmbeddingStore())` 得到包装后的 `embedder`。包装器自己的 `id` 是内层 `id` 再接 `+cache`（`packages/ai-runtime/src/embedder-cache.ts:55`）。真正写入进程内存储的键不用这个包装 `id`，而是 `` `${inner.id}:${inner.dim}:${sha256(text)}` ``（同文件 `:25`），`inner` 就是 `rawEmbedder`。

生产 `enforce` 下，检索的两处嵌入都不走这个包装器：

- `:570`，`trackLocal` 工厂里的 `embed`
- `:594`，`localRetrieve` 里的 `embed`

两处都是 `budgetedQbankEmbedding(pool, owner, ragCost.mode === 'enforce' ? rawEmbedder : embedder, ragCost)`。因此 `enforce` 把 `rawEmbedder` 交给检索，`:540` 造出的进程内 `cachingEmbedder` 不在这条查询路径上。`observe` 才传入包装器。

`apps/worker/src/rag-cost-governance.ts:102` 的 `budgetedQbankEmbedding` 在 `enforce` 下先预留再嵌入。`:106-:108` 的 `observe` 分支直接 `embedder.embed`，不预留。`enforce` 从 `:117` 调用 `reserveAiTextCost`，`:124` 标记已派发，然后才在 `:132-:134` 调用 `embedWithUsage` 或 `embed`。`:44` 把缺省输入上限定为 `16_000`。`:135` 用 `result.inputTokens ?? cfg.maxInputTokens` 结算，`:139` 写入结算。

若把缓存留在这次预留之后才查，命中仍然已经扣了预留。全命中时，`embedder-cache.ts:38-:53` 的 `embedWithUsage` 不会带回 `inputTokens`（`sawUsage` 保持为假）。`:135` 于是按缺省 `16_000` 结算。

Redis 结果缓存挡在嵌入之前。命中时 `packages/db/src/qbank/qbank-retrieval-cache.ts:314-:317` 直接返回，不调用 `embed`。未命中才在 `:342` 嵌入查询文本。默认存活时间是 `apps/worker/src/main.ts:595` 的 `RAG_QBANK_CACHE_TTL_SECONDS`，缺省 `120` 秒（库内缺省同为 `qbank-retrieval-cache.ts:27` 的 `120`）。过期后，同一段查询文本会再次进入付费嵌入。查询文本含能力与难度：`apps/worker/src/qbank-track-local-retrieve.ts:83` 的旧两段是能力加「难度」加难度值，`:84` 可再带岗位与技术栈。

`enforce` 启动时 `:800-:801` 只激活已有题库读模型，不在 `:805` 走文档重建。因此这份进程内存储在生产查询路径上今天既不读也不写，挡不住 Redis 过期后的再次付费。

## 修法

只改已有的两个源码文件，并把断言补进已有证明，不落别的文件。

1. `apps/worker/src/rag-cost-governance.ts` 的 `budgetedQbankEmbedding` 在现有四个参数之后增加可选的进程内存储（`getMany` / `putMany`，形状与 `embedder-cache.ts:10-:13` 相同）。未传入时，`enforce` 仍是今天的先预留再嵌入，已有调用点不必改签。
2. `apps/worker/src/main.ts` 把 `:540` 已经要造的那一个 `inMemoryEmbeddingStore()` 先赋给一个绑定，再交给 `cachingEmbedder`。不要再调用第二次。这个绑定造在进程启动处，不要放进按 owner 调用的工厂，否则每个 owner 各有一份。
3. `:570` 与 `:594` 两处调用把同一个绑定传进去。`enforce` 的第三个参数仍是 `rawEmbedder`，不是包装器。`observe` 的第三个参数仍是包装后的 `embedder`。
4. 仅当 `enforce` 且调用方传入了存储时，在 `reserveAiTextCost`（`:117`）之前按现有缓存键查询。键与 `embedder-cache.ts:25` 相同：模型 `id`、维度、文本的 sha256 十六进制摘要，编码与该行一致。模型 `id` 用传入的 `rawEmbedder.id`。不要用 `id+"+cache"`，那是包装器 `:55` 的自身标识，不是存储键。空槽判断与 `:30` 相同。存储里只放向量，不放查询原文。
5. 全部命中：按输入顺序返回向量。不调用 `reserveAiTextCost`，不外呼 `embed` / `embedWithUsage`，不调用 `markAiCostDispatched`、`settleAiCost`、`releaseAiCost`、`markAiCostUnknown`。不写账本。
6. 只要有未命中：仍走现有预留与派发（实参不改，仍绑定 `cfg.priceRevision`，`maxOutputTokens` 仍为 0）。只把未命中文本交给 `rawEmbedder`（有 `embedWithUsage` 就用它，否则用 `embed`）。向量个数必须与未命中条数一致，再按原下标写回存储并拼回完整顺序。结算、释放、派发失败与 `unknown` 仍走 `:124-:149` 的现有分支。结算式不改：仍是这次未命中调用返回的 `inputTokens`，缺省才是 `cfg.maxInputTokens`。供应商返回了用量时，结算量只覆盖缺失段；供应商没返回用量时，缺省仍是配置上限（默认 `16_000`），不另写一套结算。
7. `observe` 分支保持 `:106-:108`，先返回 `embedder.embed`，不读新增的存储参数。

断言只补进已有 `apps/worker/test/rag-cost-governance.proof.ts`，放在现有 `process.exit` 之前，仍以失败数决定退出码。不新建证明文件。证明不连数据库、不连 Redis、不访问外网，这样现有 `pnpm -C apps/worker prove:rag-cost` 可以离线跑完。至少覆盖：

- `enforce` 且全部按 `rawEmbedder.id` 命中：返回保序向量；连接池 `connect` 次数为 0；`embed` 与 `embedWithUsage` 次数为 0。
- 同一文本只按 `id+"+cache"` 写入时不得当成命中：不得提前返回缓存向量；必须碰到预留（连接被调用或在预留处失败）；失败前不得外呼。
- 读 `rag-cost-governance.ts`：`observe` 的提前返回仍在存储查询之前；`getMany` 在 `reserveAiTextCost` 之前；只有未命中文本进入 `embedWithUsage` 或 `embed`；`putMany` 在 `settleAiCost` 之前；结算实参仍是 `inputTokens` 缺省 `cfg.maxInputTokens`。
- 读 `main.ts`：`inMemoryEmbeddingStore()` 只出现一次；该绑定同时交给 `cachingEmbedder` 与两处 `budgetedQbankEmbedding`；两处三元仍是 `enforce` 选 `rawEmbedder`、否则选 `embedder`；`dashscopeEmbedder(` 仍直接出现在这个文件里。

## 否决

- 不许把 `rawEmbedder` 换成 `cachingEmbedder` 当作修复。包装器的缓存发生在 `embed` 内部，而 `embed` 在 `:132`，已经晚于 `:117` 的预留。全命中又不带回 `inputTokens`，会按默认 `16_000` 结算。
- 不改 Redis 结果缓存，不改它的键版本，不改默认存活时间，不改 `observe` 分支。键版本包括 `qbank-retrieval-cache.ts:24` 的 `qbank-retrieval-cache:v6`，以及 `apps/worker/src/rag-redis-cache.ts:128` 的 `rag:qcache:v3:`。默认 `120` 秒包括 `:595` 与 `qbank-retrieval-cache.ts:27`。`:567` 与 `:586` 的 `embedderVersion` 含包装器 `id`，属于结果缓存身份，不要改。
- 不改价格修订绑定，以及结算、释放、派发、`unknown`。`:59-:88` 的价格本写入与修订冲突检查不改。`:117-:121` 的预留字段不改。`:128` 的释放、`:124` 的派发、`:139` 的结算、`:146-:148` 的 `unknown` 不改语义。
- 不改文档向量那条 durable cache。`apps/worker/src/qbank-embedding-compute-seams.ts:24` 的 `rag:embed-compute:v1:`，以及 `:805` 在非 `enforce` 时把包装器传入文档读模型的路径，都不改。`:546` 的配方不改。
- 不新建代码文件，不新建证明文件。不改 `packages/ai-runtime/src/embedder-cache.ts`。不改 `apps/worker/test/rag-cost-runtime.int.ts`。不改出口清单 `ai-docs/architecture/ai/provider-egress-inventory.json` 与 `scripts/provider-egress-policy.mjs`。`main.ts` 必须继续直接调用 `dashscopeEmbedder(`，以免已登记的生产调用方对不上。
- 不改采样温度，不改路由分类。不改 `packages/ai-runtime/src/model-client.ts` 的温度。`main.ts` 允许改动的只有 `:540` 附近的那一个存储绑定，以及 `:570` 与 `:594` 的嵌入实参。不改 `:665` 的路由分类消费者，也不改其分类实现。

## 门

按这个顺序跑。改动落在嵌入调用路径上，后两门缺一不可。

1. 现有 `pnpm -C apps/worker prove:rag-cost`。
2. `node scripts/ai-docs/check-docs.mjs`。
3. `pnpm provider-egress:inventory`。
4. `pnpm provider-egress:prove`。

出口策略把 `dashscopeEmbedder` 标在 `packages/ai-runtime/src/embedder.ts`，操作是嵌入构建与嵌入查询；清单里 `apps/worker/src/main.ts` 已是该适配器的生产调用方。直接调用若从 `main.ts` 消失，或清单被改去掩盖调用，这两门都不应算通过。

允许日后改动的文件只有：

- `apps/worker/src/rag-cost-governance.ts`
- `apps/worker/src/main.ts`
- `apps/worker/test/rag-cost-governance.proof.ts`

本文自身不是那次改动的一部分。

`executed:awaiting_post_prove_dual`

## §9-EXEC

`budgetedQbankEmbedding` 在原有参数后接受可选的进程内存储。只有 `enforce` 且传入了存储时，才在预留前按模型 id、维度和文本 sha256 查询。键使用传入嵌入器的 id，不使用包装后的 id。存储里只放向量。

全部命中按输入顺序返回向量，不预留、不外呼、不派发、不结算、不释放、不标 unknown、不写账本。有未命中时仍走原来的预留和派发，只把未命中文本交给嵌入；向量个数必须与未命中条数一致，再写回存储并按原下标拼回。带回的用量只结算这次未命中调用。用量缺失仍只在 `inputTokens === undefined` 时按段 `cjkWeightedEstimate`，并在范围检查前截到上限；已经带回的用量不截断。空值、小数、负数和超过上限的实量仍拒绝。未传存储时，`enforce` 仍先预留再嵌入。`observe` 仍直接 `embedder.embed`，不读这份存储。

`main.ts` 在进程启动处只调用一次 `inMemoryEmbeddingStore()`。同一个绑定交给 `cachingEmbedder`，也传给检索两处 `budgetedQbankEmbedding`。`enforce` 的嵌入器参数仍是 `rawEmbedder`，`observe` 仍是包装后的 `embedder`。生产嵌入工厂的直接调用仍留在 `main.ts`。Redis 结果缓存、键版本、默认 120 秒、价格修订和路由分类没有改。

退出码：

- `pnpm -C apps/worker prove:rag-cost` 0
- `node scripts/ai-docs/check-docs.mjs` 0，scanned 2294
- `pnpm provider-egress:inventory` 0，adapters=5，operations=10，registered_consumer_source_pairs=54
- `pnpm provider-egress:prove` 0

开头、状态行和文末三处都是 `executed:awaiting_post_prove_dual`。
