executed:awaiting_post_prove_dual

# 路由分类改用快模型，并在启动时拒绝供应商与模型名不一致

基线 `1a3fb08b4676cdea22698be56169c193ecb76eb1`。本步只新增这一份说明，不改产品代码。

## §0 锚

基线 `1a3fb08b4676cdea22698be56169c193ecb76eb1`。行号是在这棵树上打开文件看到的。

### 0.1 路由分类仍传入主力模型

`apps/worker/src/main.ts` 的 `bootstrap`（:437）里，快模型已经构造好，路由分类却仍传主力模型：

- :530 `const model = defaultModelClient({ primary: modelCost.policies.primary, backup: modelCost.policies.backup })`
- :531 `const fastModel = fastModelClient({ primary: modelCost.policies.fastPrimary, backup: modelCost.policies.fastBackup })`
- :535 报告 `reportWorkerDeps(pool, model)`，用主力 `model`
- :658 面试 `runInterviewConsumer({ pool, cp, model, fastModel, ... })`，主力与快模型都传了，这行不要改
- :661 押题 `runQuizConsumer({ pool, model, leaseOwner })`，用主力 `model`
- :663 诊断 `runDiagnosisConsumer({ pool, model, leaseOwner })`，用主力 `model`
- :665 `runRouteClassifyConsumer({ pool, model }, jobReconcileIntervalMs)`，只传主力 `model`，没有用 :531 的 `fastModel`

`apps/worker/src/route-classify-consumer.ts:22-25` 的依赖字段名就是 `model`。`:37` 把 `d.model` 交给 `createJobRouteModelClassify`。要改的是 :665 传入的值，不是这个字段名。

`apps/worker/src/interview-service.ts:232-235`：`defaultModelClient` 不另传模型名；`fastModelClient` 把 `process.env.MODEL_FAST_NAME ?? 'qwen-turbo'` 当作主端模型名，备用名是 `process.env.MODEL_FAST_BACKUP_NAME ?? process.env.MODEL_BACKUP_NAME`。

### 0.2 路由分类温度已经是 0

`packages/ai-runtime/src/model-client.ts:188-196` 是 `SERVICE_TEMPERATURE`。`:193` 为 `'job.route-classify.v1': 0`。这张表不要改。

### 0.3 缺省档与缺省模型名

`packages/ai-runtime/src/text-endpoint-config.ts`：

- :22 文本档只有 `deepseek-cn-public` 与 `dashscope-cn-beijing`
- :37-40 注册表只有两行：`deepseek-cn-public` 的 host 是 `api.deepseek.com`、basePath 为空；`dashscope-cn-beijing` 的 host 是 `dashscope.aliyuncs.com`、basePath 是 `/compatible-mode/v1`
- :67 主配置缺省模型名是 `env.MODEL_NAME?.trim() || 'qwen-plus'`
- :77 主档缺省是 `env.MODEL_ENDPOINT_PROFILE?.trim() || 'deepseek-cn-public'`
- :92 备用档缺省是 `dashscope-cn-beijing`
- :99 备用模型名缺省回退到 `qwen-plus`
- :118-121 `rejectTextTransportOverride` 只在 `NODE_ENV==='test'` 且 `MODEL_TEST_TRANSPORT_OVERRIDES==='1'` 时放行运输覆盖

样例 `docker/env/worker.env.example:45-48` 把主档写成 `deepseek-cn-public`，同时 `MODEL_NAME=qwen-plus`、`MODEL_FAST_NAME=qwen-turbo`。备用 `:173-177` 已是 `dashscope-cn-beijing` 配 `qwen-plus` / `qwen-turbo`。

### 0.4 构造客户端时没有档与模型名的启动拒绝

`packages/ai-runtime/src/model-client.ts` 的 `openAICompatibleClient`（:630）在 :662-664 解析端点，:674 取 `const model = cfg.model ?? resolved.model`，:676 计算测试运输缝是否打开。:694-695 仅在费用策略模型名与这个 `model` 不一致、且不在 G7 注入路径时抛 `model_cost_policy_model_mismatch`。:674 到 :695 之间没有「profile 与模型名是否匹配」的抛错。这个文件里也没有这类错误码。

## §1 修法

只做两件事。

### 1.1 路由分类改用已经构造好的 fastModel

把 `apps/worker/src/main.ts:665` 改成把 :531 的 `fastModel` 传进 `runRouteClassifyConsumer` 的 `model` 字段：`{ pool, model: fastModel }`。押题 :661、诊断 :663、报告 :535 继续用主力 `model`。面试 :658 不动。不改消费者的字段名，也不改这三处的模型实参。

### 1.2 启动时拒绝档与模型名不匹配

在 `openAICompatibleClient` 里，:674 的有效模型名取定之后、任何派发之前，用刚解析到的 `resolved.profile` 做拒绝。规则从 :37-40 的注册表读出后写死，闭集只有两档：

- `deepseek-cn-public`（DeepSeek，host `api.deepseek.com`）只接受以小写前缀 `deepseek` 开头的模型名。
- `dashscope-cn-beijing`（百炼，host `dashscope.aliyuncs.com`）只接受以小写前缀 `qwen` 开头的模型名。

前缀按字节比较，不折叠大小写。空模型名同样拒绝。不匹配抛稳定错误码 `text_endpoint_profile_model_mismatch`。不要另起一个码，也不要只打日志。

`resolved.profile` 不属于这两档时（视觉端点）不要套这条，以免误伤视觉模型。

判定只用已经在手上的 `resolved.profile` 和 :674 的有效 `model`。不要在 `model-client.ts` 里新写出 `MODEL_ENDPOINT_PROFILE`、`MODEL_NAME` 或 `MODEL_FAST_NAME`。快模型的有效名来自 `interview-service.ts:235` 传入的 `cfg.model`（缺省 `qwen-turbo`），不能只拿解析结果里的主模型名去做比较。主文本与备用文本两条构造都走同一条拒绝。

测试运输缝打开时整段跳过。条件与 :676 相同：`process.env.NODE_ENV === 'test'` 且 `process.env.MODEL_TEST_TRANSPORT_OVERRIDES === '1'`。只满足其中一个不要跳过。缝开着是为了已经在用本地回环的证明不被误伤，那些证明里的模型名可以不是 `deepseek` 或 `qwen` 前缀。不要放宽成所有 `NODE_ENV=test` 都跳过。

不要改 :67 和 :77 的缺省字符串。缺省档 `deepseek-cn-public` 配缺省模型名 `qwen-plus`，构造客户端时必须失败。温度表 :188-196 不动，`:193` 保持 0。

样例会跟着改，否则照抄样例会在启动时被自己拒绝。只改 `docker/env/worker.env.example:45` 的赋值为 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing`。`:47` 的 `MODEL_NAME=qwen-plus` 与 `:48` 的 `MODEL_FAST_NAME=qwen-turbo` 保持不动，使主模型与快模型都落在百炼档。`:173-177` 备用已经匹配，不要改。不要把 `MODEL_NAME` 改成 `deepseek-v4-pro`（样例 :51-53 写明不要把缺省模型名写成它）。compose 里未设变量时仍缺省 `deepseek-cn-public`，这行不要改：未设档配上 qwen 名，构造时就该失败。`scripts/deploy-check.mjs` 钉着这条 compose 缺省。

## §1.3 否决

- 不改押题、诊断、报告的模型实参。
- 不改温度表。路由分类已经是 0。
- 不新建证明文件。需要改的断言写回已有证明。
- 不改迁移。
- 不新增第二个受管文件。
- 不放宽成只打日志。不匹配必须抛 `text_endpoint_profile_model_mismatch`。

## §2 门

执行时要跑下面这些已有命令。脚本名对过根 `package.json`、`packages/ai-runtime/package.json` 和 `apps/worker/package.json`。

会改到的既有证明，就地改，不新建文件：

1. `pnpm -C packages/ai-runtime prove:model-client-dispatch`。证明在缝关闭时删掉 `MODEL_ENDPOINT_PROFILE`、把 `MODEL_NAME` 设为 `qwen-plus`，并钉死派发 URL 为 `https://api.deepseek.com/chat/completions`（该证明 :72-73）。快乐路径把模型名改成 `deepseek-v4-flash`，档保持缺省，URL 钉留下。另加一条：缝关闭、缺省档、`MODEL_NAME=qwen-plus` 时，构造抛 `text_endpoint_profile_model_mismatch`。不要用 `deepseek-v4-pro`。

2. `pnpm -C packages/ai-runtime prove:model-client-stream`。同样是缝关闭且 `MODEL_NAME=qwen-plus`，并钉死同一条 deepseek URL（该证明 :278-280）。快乐路径同样改成 `deepseek-v4-flash`，不要改成百炼档，否则 URL 钉会断。

3. `pnpm -C packages/ai-runtime prove:model-usage-cache-observe`。缝关闭，`MODEL_NAME=qwen-plus`（该证明 :86-88），不钉 deepseek URL。就地设置 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing`，模型名保持 `qwen-plus`。

4. `pnpm -C packages/ai-runtime prove:ag24-langfuse-model`。缝关闭，`MODEL_NAME=qwen-plus`（该证明 :83-86），响应体也写着 `qwen-plus`。设置百炼档，模型名不动。

5. `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client`。缝关闭，档已是 `dashscope-cn-beijing`。`deepseek-v4-pro` 与 `gpt-4o-mini` 会在构造期被拦住，不能再期待 `complete()` 里的 G7 错误码。`deepseek-v4-pro` 那条把档改成 `deepseek-cn-public`（名字与 DeepSeek 档匹配），`complete()` 仍应抛 `g7_model_banned_without_approval`。`gpt-4o-mini` 那条改成百炼档接受、但不在 G7 声明名单里的 `qwen` 前缀名 `qwen-proof-undeclared`，`complete()` 仍应抛 `g7_model_undeclared`。`qwen3.8-flash` 与 `qwen-plus` 两条已经匹配，行为不要改。

6. `pnpm model-op02-endpoint-partition:prove`。根 `package.json` 有这条。证明 :160-162 用 `openAICompatibleClient({ env: {} })`，文本档仍读进程环境。构造前设置 `MODEL_NAME=deepseek-v4-flash`（主档保持缺省 deepseek），并设置 `MODEL_BACKUP_NAME=qwen-plus`（备用档保持缺省百炼）。不要只改主模型名：备用名会回退到主模型名，百炼档会拒绝 `deepseek` 前缀。视觉构造不套这条拒绝。主档与备用档仍须不相等。

7. `pnpm s4b-invoke-delta:prove`。根 `package.json` 有这条。`packages/ai-runtime/test/invoke-model-delta.proof.ts` 没有打开运输缝，且 :226 传入 `model: 'qwen-turbo'`。构造前设置 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing`，`MODEL_NAME` 用 `qwen-plus` 或 `qwen-turbo`。不要为了过关去打开运输缝。

只复跑、预期不改文件：

- `pnpm r2-p-worker-route-classify:prove`
- `pnpm r2-p-loop-route-classify:prove`
- `pnpm r2-p-start-route-classify:prove`
- `pnpm r2-p-fake-route-classify:prove`。这四条只钉 `runRouteClassifyConsumer` 与 `routeClassifyLoop` 符号，不钉 `model` 实参。实参换成 `fastModel` 后符号仍在。
- `pnpm -C packages/ai-runtime prove:text-endpoint-config`。缺省档与缺省模型名字符串不改，解析证明应仍通过。
- `pnpm -C packages/ai-runtime prove:g7-freetier-fix-round2`。已是百炼档配 `qwen3.8-flash`，缝关闭，应仍通过。
- `pnpm model-output-limit:prove`。根脚本。该证明自己打开运输缝，回环用的模型名不得被这条拒绝误伤。
- `pnpm ag18-sampling-temperature:prove:raw`。温度表不改，该证明运输缝开着，应仍通过。
- `pnpm -C apps/worker prove:deploy-worker-env`。不构造文本客户端。compose 缺省不改，应仍通过。

另外必跑：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`
- `pnpm provider-egress:inventory`
- `pnpm provider-egress:prove`

出站清单方面，`scripts/provider-egress-inventory.proof.mjs` 把适配器钉死为 5、操作钉死为 10、适配器与来源文件的登记对钉死为 54。环境引用数等于清单数组长度，证明里没有另一份写死的环境引用数。本修法不新增环境变量名，不在 `model-client.ts` 新出现上面三个模型变量标识符，不新增适配器来源文件，样例只改已有键的值。硬计数预期不变。计数没变时，不要改清单，也不要改证明，也不要改 `ai-docs/architecture/ai/provider-egress-inventory.md` 里的计数句子。

若执行时硬计数变了，清单 JSON、证明里写死的 5、10、54，以及那份架构说明里的计数句子，必须在同一次变更里一起改。不要只改一边。

## §8

executed:awaiting_post_prove_dual

以上三处状态相同。产品代码本步不改。

executed:awaiting_post_prove_dual

## 补充

行号是在基线 `1a3fb08b4676cdea22698be56169c193ecb76eb1` 上打开文件看到的。这一节只补三件事。路由分类仍只改 `apps/worker/src/main.ts` 里把 `fastModel` 传入 `runRouteClassifyConsumer` 的那一处。押题、诊断、报告、面试循环的模型实参不动。温度表不动。错误码仍只有 `text_endpoint_profile_model_mismatch`。

### 1. deepseek 档必须带连字符

§1.2 写的是 `deepseek-cn-public` 只接受以小写前缀 `deepseek` 开头。这里改为：必须以小写字节 `deepseek-` 开头（带连字符）。比较按字节，不折叠大小写。空模型名仍拒绝。不匹配仍抛 `text_endpoint_profile_model_mismatch`，不要另起一个码。

`deepseek-v4-flash` 与 `deepseek-v4-pro` 仍算匹配。`packages/ai-runtime/src/g7-freetier-reprove-guard.ts:30` 是 `deepseek-v4-flash`，`:47` 价格表是同一个名字；`:31` 是 `deepseek-v4-pro`，`:46` 价格表是同一个名字。样例 `docker/env/worker.env.example:51-53` 也写着这两个名字。单纯以小写 `deepseek` 开头、但下一字节不是连字符的名字要拒绝。

qwen 档维持上文「以小写 `qwen` 开头」，不要改成必须带连字符。同文件 `:23` 的 `qwen3.8-flash` 没有 `qwen-` 前缀；`:24` `qwen3.8-max`、`:25` `qwen3.8-27b`、`:26` `qwen3.8-omni-flash`、`:27` `qwen3.7-flash` 也没有。这些名字仍须被 `dashscope-cn-beijing` 接受。`qwen-plus` 与 `qwen-turbo` 已经以 `qwen` 开头，继续匹配。

### 2. 不新建环境文件，不新建 compose 文件

不新建环境文件，不新建 compose 文件。只改已有 `docker/env/worker.env.example:45` 那一行已有赋值，把 `MODEL_ENDPOINT_PROFILE=deepseek-cn-public` 改成 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing`。`:47` 的 `MODEL_NAME=qwen-plus` 与 `:48` 的 `MODEL_FAST_NAME=qwen-turbo` 不动。不要在 `docker/env/` 再增加样例文件。已有 `docker/compose.ha.yml:211`、`:275` 与 `docker/compose.prod.yml:279` 的 `${MODEL_ENDPOINT_PROFILE:-deepseek-cn-public}` 不要改，也不要另写一份 compose 把这行搬过去。`scripts/deploy-check.mjs:105` 仍钉着这条 compose 缺省。

### 3. 还会在构造期被拒绝的现有证明

上文 §2 已经点名的证明不重复改口径。下面这些上文没有点名。运输缝关着，模型名是 qwen 前缀，档是缺省 `deepseek-cn-public`（`packages/ai-runtime/src/text-endpoint-config.ts:77`）。修法与上文第 3 条相同：只补 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing`，其余断言不动。不要打开运输缝，不要新建证明文件。

1. `pnpm -C apps/worker prove:session-summary`（`apps/worker/package.json:18`）。`apps/worker/test/session-summary.proof.ts`：`:156` `NODE_ENV=test`，`:157` 删掉 `MODEL_TEST_TRANSPORT_OVERRIDES`，`:159` 删掉 `MODEL_ENDPOINT_PROFILE`，`:161` `MODEL_NAME=qwen-plus`，`:166` `openAICompatibleClient()`。模型名保持 `qwen-plus`。

2. `pnpm -C apps/worker prove:resume-grounding`（`apps/worker/package.json:78`）。`apps/worker/test/resume-grounding.proof.ts`：`:150` `NODE_ENV=test`，`:151` 删掉 `MODEL_TEST_TRANSPORT_OVERRIDES`，`:153` 删掉 `MODEL_ENDPOINT_PROFILE`，`:155` `MODEL_NAME=qwen-plus`，`:160` `openAICompatibleClient()`。模型名保持 `qwen-plus`。

3. `pnpm scoring:eval`（根 `package.json:518`，转到 `:519` 的 `scoring:eval:raw`）。`apps/worker/smoke/scoring-eval.ts:39` 调用 `fastModelClient()`。快模型名是 `apps/worker/src/interview-service.ts:235` 的 `process.env.MODEL_FAST_NAME ?? 'qwen-turbo'`。该脚本不设置档；`scripts/run-e2e-isolated.mjs` 跑这条时也不钉档。档留空就是缺省 `deepseek-cn-public`，构造期会被拒绝。在 `:39` 之前补上 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing`。不要改 `:235` 的缺省模型名。

除此以外，没有别的未点名文件会在缝关闭时用 qwen 前缀模型名配上缺省 deepseek 档去构造文本客户端。

## §9-EXEC

三处状态已是 `executed:awaiting_post_prove_dual`。上文未删。

改过的文件：

- `apps/worker/src/main.ts`：只有路由分类那一处改为 `{ pool, model: fastModel }`。押题、诊断、报告、面试循环的模型实参未动。
- `packages/ai-runtime/src/model-client.ts`：有效模型名取定之后、派发之前，按档拒绝不匹配的模型名。错误码只有 `text_endpoint_profile_model_mismatch`。`deepseek-cn-public` 只接受小写字节前缀 `deepseek-`。`dashscope-cn-beijing` 只接受小写前缀 `qwen`。视觉构造不套这条。整段跳过仅当 `NODE_ENV===test` 且 `MODEL_TEST_TRANSPORT_OVERRIDES===1`。此文件没有新写 `MODEL_ENDPOINT_PROFILE`、`MODEL_NAME`、`MODEL_FAST_NAME`。温度表未改。
- `docker/env/worker.env.example`：只把已有 `MODEL_ENDPOINT_PROFILE` 改成 `dashscope-cn-beijing`。`MODEL_NAME=qwen-plus` 与 `MODEL_FAST_NAME=qwen-turbo` 未动。compose 与 `scripts/deploy-check.mjs` 未改。
- 已有证明：`model-client-dispatch.proof.ts`、`model-client-stream.proof.ts`、`model-client-output-limit.proof.ts`、`model-usage-cache-observe.proof.ts`、`ag24-langfuse-model.proof.ts`、`g7-freetier-reprove-client.proof.ts`、`model-op02-endpoint-partition.proof.ts`、`invoke-model-delta.proof.ts`、`session-summary.proof.ts`、`resume-grounding.proof.ts`、`apps/worker/smoke/scoring-eval.ts`。没有新建证明文件。
- `ai-docs/architecture/ai/provider-egress-inventory.json`：只补了两条已有环境名的来源登记。`scoring-eval.ts` 的 class 是 `manual-live-smoke`，`invoke-model-delta.proof.ts` 的 class 是 `test-fixture`。适配器 5、操作 10、登记对 54 没变，所以没有改 `scripts/provider-egress-inventory.proof.mjs`，也没有改架构说明里的计数句子。环境引用数由 333 变为 335。不登记这两处的话，出站清点会因未登记引用而失败。

行号漂移（相对本说明里的基线行号）：

- `main.ts` 路由分类仍在 665，行号未漂，只换了实参。
- `model-client.ts` 有效模型名仍在 674，运输缝仍在 676。拒绝块在 679–684。`model_cost_policy_model_mismatch` 从 694–695 漂到 702–703（+8）。`job.route-classify.v1` 仍在 193，温度仍是 0。
- `worker.env.example` 档赋值仍在 45，模型名仍在 47 与 48。
- `scoring-eval.ts`：档赋值在 39，`fastModelClient()` 从 39 漂到 40。
- `session-summary.proof.ts` 159 改为赋值 `dashscope-cn-beijing`，不再删除该变量。
- `resume-grounding.proof.ts` 153 同样改为赋值。
- `model-client-dispatch.proof.ts`：52–54 是缺省档且 `MODEL_NAME=qwen-plus` 时构造抛 `text_endpoint_profile_model_mismatch`。58 的模型名是 `deepseek-v4-flash`。77 的 URL 断言仍是 `https://api.deepseek.com/chat/completions`。
- `model-client-stream.proof.ts`：242 为 `deepseek-v4-flash`。280 的 URL 断言未动。415–416 的模型名改为 `deepseek-` 前缀。
- `model-client-output-limit.proof.ts`：74、228、237 只给模型名加上 `deepseek-` 前缀，行号未漂。
- `g7-freetier-reprove-client.proof.ts`：72–73 为 `deepseek-cn-public` 配 `deepseek-v4-pro`。83–84 为 `dashscope-cn-beijing` 配 `qwen-proof-undeclared`。
- `model-op02-endpoint-partition.proof.ts`：160–161 在三处构造前设置 `MODEL_NAME=deepseek-v4-flash` 与 `MODEL_BACKUP_NAME=qwen-plus`。没有删除档变量。
- `invoke-model-delta.proof.ts`：105–106。`model-usage-cache-observe.proof.ts`：89。`ag24-langfuse-model.proof.ts`：87。

日志目录 `.../implementer`，名前缀 `gate-route-exec-`。退出码：

- `pnpm provider-egress:inventory` → `gate-route-exec-inventory.log`：0。`adapters=5; operations=10; registered_consumer_source_pairs=54; environment_references=335`。
- `pnpm provider-egress:prove` → `gate-route-exec-egress.log`：0。`selected=7/7`。
- `pnpm turbo typecheck --force` → `gate-route-exec-typecheck.log`：0。范围内 13 个包，实际 typecheck 任务 8/8，缓存旁路，路径是本工作树。
- `pnpm turbo lint` → `gate-route-exec-lint.log`：0。0 errors。警告数：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601，均未超过上限。worker、ai-runtime、root 在本工作树重新执行；其余包命中缓存。
- 说明 §2 里改过的证明：dispatch、stream、usage-cache、ag24、g7 client、text-endpoint、g7 round2、op02、s4b、session-summary、resume-grounding、deploy-worker-env、output-limit 的日志均为通过。`scoring:eval` 因没有注入供应商密钥而跳过，进程退出码 0。`ag18-sampling-temperature:prove:raw` 因缺少数据库目标而失败；隔离父命令 `ag18-sampling-temperature:prove` 退出码 0。四条 r2 证明因本树缺少既有说明文件而失败，符号检查里路由分类接线仍在；没有为它们新增文件。
- `node scripts/ai-docs/check-docs.mjs` → `gate-route-exec-docs.log`：0。扫描 2286 个受管文件，未超过 2296。

