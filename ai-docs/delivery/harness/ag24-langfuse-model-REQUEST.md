# AG-24 — 成本与观测小项汇总刀：Langfuse model 真名+cached/cost 上报 · RAG 预留 0083 revision 绑定 · G7 回退估算数组修·进程内限流/熔断残留清理（EXEC REQUEST）

**Status**: `draft:awaiting_pre_exec_dual`（起草席落卷即停·docs-only 恰 1 .md 零码动 · 预执行双审两外席 PASS + 协调方明示授权方可开工 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：meetwise 战役 AG-24 起草席（AI 能力复审 P3·成本面·观测修正+残留清理四合一小项汇总刀）。
**基线**：`feat/mysql-schema-skeleton` @ `849a0f19517b`（开工 tip 实测·`git log -1` 全长亲证=docs(ssot) BILL3 话题结算 nail 收官登记笔·2026-10-13）。分支 `line/ag24-langfuse-model` · 工作树 `meetwise-ag24`（`git worktree add ../meetwise-ag24 -b line/ag24-langfuse-model 849a0f19517b2ec90621d43c858118f660fd08a5` 仓根同级·本起草席已立·建前亲证：`git worktree list` 25 树零 ag24；`git branch -a | grep -iE "ag24"` 零同名）。
**防重对表（亲证）**：`rg -il "ag24" ai-docs/delivery/harness/` → **EXIT=1 零命中**；`ls ai-docs/delivery/harness/ | grep -iE "ag24|langfuse"` → 零同名刀卷。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-24（总览 **:36** · 条目 **:312-320**·复核结论 **:314「部分成立——已核实各子项；"embedder 注释写 1024"一项不成立」**·交叉印证 ai-cost-context **:315**·源编号 AC-F22/AC-F13 **:315**·file:line **:316**·触发例子 **:317「在 Langfuse 里按模型统计成本，看到的全是 service 名」**·用户影响 **:318「成本归因不准；价格切换时 RAG 账本会被"隐式改价"」**·修法 **:319「上报真实 model 与 cached/cost；RAG 预留改为 0083 风格的 revision 绑定；删除残留实现」=本刀修法权威**·关联审计总表编号 #72/#172/#210 **:320**）②同目录 `EXPERT-REVIEWS.md` **§六 :54 EG-B4**（「RAG embedding 走旧 reserveAiCost（latest-price·无 revision 绑定）与 0083 原则双轨」=子项③独立专家印证）+ **§七 :67 成本轨**（#48 cached_tokens 观测系成本轨①·已落·本刀=其 Langfuse 挂面后继）+ **:73 缓存结论补强**（「字段缺席≠零」）③同目录 `review-log.md` **AC-F22 :88**（P2/P3→P3·部分成立·「embedder 注释写 1024」不成立定谳）+ **AC-F13 :79**（P3 成立·「model-client.ts:400，只影响 G7 测试路径」）④`ag-cost1-bleed-observe-REQUEST.md`（**cachedInputTokensOf 观测面已落基线**·其 §8 裁决②行使明示「Langfuse usageDetails.cached **不增挂**·AG-24 model 名面仍归后继」=本刀授权面）+ `ag19-prompt-version-REQUEST.md`（形制蓝本·其 §3-3/§4 明示 AG-24 面另刀互认·基线已含 promptVersion 观测面）。

## §0 现状锚（起草席亲读·base `849a0f19517b`·file:line/blob 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 blob 锚表（@`849a0f19517b`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/langfuse-v5.ts` | `a69be298f306` | **子项①②主触面**：:168-179 tracer.record——**:173 `model: safeName(span.service, 'unknown')`=Langfuse model 字段填 service 名（AG-24 面根锚）**/ :174 `usageDetails: { input: span.inputTokens ?? 0, output: span.outputTokens ?? 0 }` **仅两键·无 cached 无 cost** / :67-84 langfuseSafeModelMetadata 标量集（inputTokens/outputTokens 在·**无 cachedInputTokens 无成本位**；:76-77 promptVersion=AG-19 已落行·零触）/ :61-64 safeName 归一（非 [a-zA-Z0-9_.-]→'_'·截 96） |
| 2 | `packages/ai-runtime/src/trace.ts` | `8f07dc7372a3` | **span 无 model 位无 cached 位**：:15-29 `ModelCallSpan`（service/promptVersion/owner/idempotencyKey/threadId/retrieval/attempt/outcome/latencyMs/sources/inputTokens/outputTokens）/ :4 脱敏铁律原文「span 只带标量…绝不带 prompt 原文/简历/答案」 |
| 3 | `packages/ai-runtime/src/invoke.ts` | `23a6d071c4c6` | **真实模型名已在管道·span 未带**：:668-671 span 闭包 `tracer.record({…service, promptVersion, inputTokens: usage?.inputTokens, outputTokens: usage?.outputTokens})`——**无 model 无 cachedInputTokens** / :703-708 claim 相位 `model: plan.cost?.model` **已落库**（ai_model_invocation.model=受控策略模型名）/ :78 `ModelResult` `actualModel?: string`（G7 供应商回显位在）/ :844 文本路径 `priceRevision: policy.priceRevision` **已绑 revision（0083 面·对照 RAG 双轨）** |
| 4 | `packages/ai-runtime/src/model-client.ts` | `c4827e8d72f8` | **子项④触面+cost1 面在案**：:198-200 `renderPrompt` userContent——**req.images?.length 非空时=对象数组** `[{type:'text'…}, …images.map(image_url)]`·无图时=字符串 / **:650 G7 回退估算 `Math.max(64, Math.ceil((rendered.system.length + rendered.userContent.length) / 4))`——图片数组形下 userContent.length=数组元素数非字符数**（估算塌缩到 64 下限·AC-F13 定谳「只影响 G7 测试路径」）/ :674-681 reserveFor(G7 预留消费方) / :524-528 `cachedInputTokensOf`（cost1 已落·三端点取值序）/ :713/:935/:1025 cachedInputTokens 三解析面（cost1 已落·零触） |
| 5 | `apps/worker/src/rag-cost-governance.ts` | `85f477e23ea4` | **子项③主触面（双轨根源）**：:51 `priceRevision: required(env.RAG_EMBED_PRICE_REVISION,…)` **配置已解析 revision** / :66-77 `configureRagCostGovernance` 把 (provider,model,region,revision,input 单价,source_url) 写入 ai_cost_price_book（:75-77 stored 对表断言）/ **:110-113 `reserveAiCost(c, { scopeId, requestOwner, idempotencyKey, provider, model, region, maxInputTokens })` 7 参——priceRevision 在手却不传·预留走无绑定过程** / :116-142 dispatched/release/settle/unknown 四件（本刀零触·settle=按预留行捕获价结算） |
| 6 | `packages/db/src/model-op/ai-cost-governance.ts` | `1efb8d969cf3` | **双轨对照面**：:31-39 `reserveAiCost`→`ai_cost_reserve_scoped($1…$7)`（7 参无 revision=0035 旧口）/ :41-49 `reserveAiTextCost`→`ai_cost_reserve_text_scoped($1…$9)`（**含 priceRevision=0083 新口**·:26 注释原文「Caller-selected immutable price row; the database must never choose latest.」）/ :56-66 settle 两口（input-only 4 参 ‖ text 5 参）/ :51-53 markAiCostDispatched |
| 7 | `packages/db/migrations/0035_ai_cost_principal_scope.sql` | `93be6aece880` | **latest-price 根源**：:68 `ORDER BY effective_at DESC, revision DESC LIMIT 1`（7 参 ai_cost_reserve 隐式选最新价行=「价格切换时 RAG 账本被隐式改价」机制）/ :49-51 7 参 scoped 口 GRANT app_role 在案 |
| 8 | `packages/db/migrations/0083_ai_text_cost_price_revision_binding.sql` | `fe6d5de12862` | **子项③形制蓝本**：:8-12 9 参 `ai_cost_reserve_text`（p_price_revision）/ :31 revision 形校验 `^[A-Za-z0-9._:-]{1,80}$` / :53-56 replay 换 revision→`binding_mismatch` / :66-72 revision 精确查价+`effective_at <= clock_timestamp()`·无行→`price_missing` / :101-123 `ai_cost_text_price_binding_matches_scoped` 启动期对表 / :128-130 旧 latest-price 签名 REVOKE fail-closed / :134-146 scoped 9 参口 GRANT app_role **在案（子项③裁决③(a) 零新迁移依据）** |
| 9 | `packages/ai-runtime/src/rate-limit-model.ts` | `00f406521a20` | **子项④残留件一（163 行整删）**：进程内并发/RPM 限流器（rateLimitedModel·:31-36 resolveModelRateLimitConfig 读 `MODEL_MAX_CONCURRENT`/`MODEL_RPM`·waiters 队列/nextStartAt 全进程内变量）/ :2-5 注释自称「Model concurrency/RPM admission」 |
| 10 | `packages/ai-runtime/src/circuit-breaker.ts` | `90c3720a54f6` | **子项④残留件二（131 行整删）**：进程内熔断器（threshold 5/cooldown 30s/:20-24 halfOpenProbeHeld 注释原文自认「This lease is intentionally **process-local**, like this breaker itself」/ :34 emit METRIC.circuitBreakerOpen）——**复核快照只点名本文件；rate-limit-model.ts 系同族残留（MODEL-OP-02 收编同批对象）·本刀一并删（issues-final :319「删除残留实现」修法权威面内）** |
| 11 | `packages/ai-runtime/src/index.ts` | `621c83ff9a5d` | :196-197 circuitBreaker/BreakerOpts/BreakerPhase 导出 + :198/:200-201 rateLimitedModel/resolveModelRateLimitConfig/RateLimitOpts/RateLimitedClient/ModelRateLimitConfig 导出——**六行随删** |
| 12 | `packages/ai-runtime/src/metrics.ts` | `ddca34ad57e6` | :66 注释「emit 在 circuit-breaker.ts 相位翻到 open 时」/ :74 `circuitBreakerOpen: 'model_circuit_breaker_open_total'` / :122-123 registerBaselineMetrics 按 {dep:'model'/'fast_model'} 播种基线 0——**随删（§1-④·metrics.proof 适配如实登记）** |
| 13 | `docker/monitoring/alert.rules.yml` | `9af72c994f3f` | :102-105 熔断告警 `sum(increase(model_circuit_breaker_open_total[15m])) > 0`——**死告警**：生产零 emit 源（残留件未接线）·基线恒 0→increase>0 恒假 |
| 14 | `scripts/alerts-lint.mjs` | `b397fa9a588d` | :28-29 白名单行 `"model_circuit_breaker_open_total"`——随告警同删 |
| 15 | `packages/ai-runtime/test/breaker.proof.ts` | `f69205921ff1` | 残留件专属 proof 整卷·随删；gate `breaker:prove`（根 package.json :447 + ai-runtime package.json :18）随删 |
| 16 | `packages/ai-runtime/test/metrics.proof.ts` | `ee24598b8aa6` | breaker 断言臂 :11/:17/:26/:33-35/:50/:54——随删适配·**如实登记不洗** |
| 17 | `packages/ai-runtime/test/model-cost-governance.proof.ts` | `ac1819920b12` | :10 import rateLimitedModel + :120-133 rateLimitedClient 准入臂——随删适配·如实登记 |
| 18 | `docker/compose.prod.yml` | `e16bf1c68a5a` | :36-37 `MODEL_MAX_CONCURRENT: ${…:-4}` / `MODEL_RPM: ${…:-0}` 死 env（main.ts 已不读·见 #19）——清理=裁决项④ |
| 19 | `docker/env/worker.env.example` | `530f13a73cff` | :119-121 注释+`MODEL_MAX_CONCURRENT=4`+`MODEL_RPM=0` 死 env 样例——清理=裁决项④；`apps/worker/src/main.ts:433-434` 与 `apps/api/src/main.ts:111-112` 注释原文「MODEL-OP-02：全局 MODEL_MAX_CONCURRENT/MODEL_RPM 限流已废弃（per-adapter 限流移除）·并发/断路器改由共享权威（迁移 0120 的 ai_model_admission_acquire_scoped）在 invoke() 内裁决」=**废弃已官宣·残留未清干净** |
| 20 | `ai-docs/architecture/current-runtime-truth.md` | `22a16e7045df` | :118 仍把 `MODEL_MAX_CONCURRENT`/`MODEL_RPM` 记为启动校验活旋钮 / :125「当前的 default/fast 文本 client 各自使用进程内 admission」——**SSOT 陈旧引用**·子项④随批更新（docs:check 绿门要求·措辞最小）；`ai-docs/requirements/use-cases/model-invocation-reliability.md:35` 与 `interview-question-bank-reliability-security.md:195/:333` 同族文件引用随批更新 |

### 0.2 漂移登记（复核快照=issues-final :316 所引行号 → 现树 `849a0f19517b`·全亲读重 pin）

| 复核快照锚（issues-final :316） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| langfuse-v5.ts :169-171（model 填 service 名） | :168-179（**:173 `model: safeName(span.service, 'unknown')` 原文恒等**·:174 usageDetails 仅 input/output 两键） | 微漂（AG-19 metadata.promptVersion :76-77 插行+record 块整体在）·**「model=service 名+无 cached+无 cost」结论不变** |
| rag-cost-governance.ts :110-113（旧预留不绑 revision） | :110-113（7 参 reserveAiCost·priceRevision :51 在手不传） | 恒等·零漂 |
| model-client.ts :400（G7 回退对图片数组取 .length） | **:650** 回退估算行（:198-200 userContent 数组形·:674-681 reserveFor 消费） | 行漂（TOKSTREAM S4a 段+G7 块插入致下移 250 行）·**「数组 .length 语义」结论不变·AC-F13 :79「只影响 G7 测试路径」定谳在案** |
| circuit-breaker.ts（进程内残留） | 131 行全在（:20-24 process-local 自认注释）+ **同族 rate-limit-model.ts 163 行**（快照未点名·MAINs :433-434/:111-112 已官宣废弃） | 面扩大·**残留仍在·MODEL-OP-02 收编后零接线** |
| EXPERT EG-B4（RAG 走旧 reserveAiCost 双轨） | :110-113（7 参口）对照 invoke.ts :844（文本 9 参口已绑） | 恒等·双轨在案 |

### 0.3 现势并发登记（强制）

1. **迁移号**：主线迁移实测 **183 件·末位=0181**（`0181_ag19_prompt_version_column.sql`·AG-19 已落）——**本刀仅裁决项③(b) 才占用 0182**（③(a) 零迁移）；EXEC 立项时主线+全 worktree 全场重证，撞则改号照 0179→0180 勘误形登记。
2. **并线亲证**：AG-19（prompt_version 0181）/ag-cost1（cachedInputTokensOf）/ag-cost2（0177）/AG-B/C/D/E/F/bill3/ag37 全部已 merge 入基线（`git branch --merged HEAD` 25 分支亲证清单）——本刀四子项触面（langfuse-v5/trace/invoke span 行/rag-cost-governance/model-client :650/index/metrics breaker 面/两残留件/告警面）**无任何在飞同面刀**；AG-19 §3-3「AG-24 面（Langfuse model 字段/cached/cost 上报）零触」与本刀 §3-5「AG-19 promptVersion 面零触」互认成立（基线 langfuse-v5 :76-77 promptVersion 行在案即证）。
3. **AG-01/AG-08 面（另刀）**：共享准入/熔断权威本体（0120 `ai_model_admission_acquire_scoped`/`model-admission.ts`/invoke admit 相位）本刀**零字节零触**——本刀④只删「已被 0120 收编取代的进程内残留实现」，权威本体演进（熔断键按端点=成本轨⑤·准入拒绝去终态化=AG-01）归各自刀面（§3-1）。
4. 起草窗口内主线 tip=`849a0f19517b`（建树时点）·本卷全部 blob/行号即 @该 tip 实取。

## §1 红事实 + 修法

### 红事实 A：Langfuse model 字段=service 名·cached/cost 双缺（现 pin @`849a0f19517b` 全亲证）

langfuse-v5.ts :173 `model: safeName(span.service, 'unknown')`——Langfuse generation 的 model 字段被填成 **service 名**（job.route-classify 等逻辑服务名·非供应商模型名），Langfuse 按 model 维度的成本看板/定价归因全空转（issues-final :317 触发例子逐字在案）；:174 usageDetails 仅 `{input, output}` 两键——**cached 未挂**（cost1 裁决②明示归后继=本刀）；**cost 未报**（metadata :67-84 标量集亦无成本位）。而真实模型名管道上游**现成**：claim 相位 invoke.ts :706 `model: plan.cost?.model`（受控策略模型名·已落 ai_model_invocation）+ G7 臂 `ModelResult.actualModel`（:78·供应商回显）——**数据在手·只差 span 一位**。

### 红事实 B：RAG 预留 latest-price 双轨（EG-B4·「隐式改价」机制根）

rag-cost-governance.ts :51 priceRevision 已强制解析 + :66-77 已把该 revision 精确写入价格本——**但 :110-113 预留走 7 参 `ai_cost_reserve_scoped`（0035 口），revision 不传**：0035:68 `ORDER BY effective_at DESC, revision DESC LIMIT 1` 隐式选最新价行→**换 revision 发版瞬间，在途 RAG 预留/结算按新价入账**（issues-final :318「价格切换时 RAG 账本会被隐式改价」机制全链亲证）；对照文本路径 invoke.ts :844 已绑 `policy.priceRevision`（0083 口）——同仓双轨·RAG 是唯一漏绑面（EG-B4 :54 独立印证）。settleAiCost（:56-58）按预留行捕获单价结算·**预留绑死后结算自动随行·四件（dispatched/release/settle/unknown）零触**。

### 红事实 C：G7 回退估算对图片数组取 .length（AC-F13）

model-client.ts :198-200：带图时 `rendered.userContent` 是**数组**（text 段+N 个 image_url 段）；:650 G7 回退估算 `Math.ceil((rendered.system.length + rendered.userContent.length) / 4)` 把**数组元素数**当**字符长度**——带图请求回退估算塌缩到 `Math.max(64, …)` 下限，G7 预留（:674-681 reserveFor）系统性低估。`context?.ok === true` 主路径走 plan.inputTokens 不受影响；该回退仅在 costPolicy 缺席时生效——**AC-F13 :79 定谳「只影响 G7 测试路径」·故定 P3 小项**。修法=数组形取拼接字符量（如对 userContent 各段 text/URL 字段求字符和·或复用 :259 imageDescriptorTokens 形）·无图字符串形 `.length` 恒等（零位移负证臂）。

### 红事实 D：进程内限流/熔断残留（MODEL-OP-02 收编后的死代码+死告警+死 env+陈旧 SSOT）

0120 已把并发/熔断收编为 invoke() 内共享权威（0.1 #19 两 main.ts 官宣注释），但残留五层未清：**①代码两件**（rate-limit-model.ts 163 行+circuit-breaker.ts 131 行·生产零接线亲证：`rg "circuitBreaker\(|rateLimitedModel\("` 非 test 命中=零·仅 index.ts 导出与 interview-service.ts :205-206/:216-217 注释）**②metric 面**（metrics.ts :66/:74/:122-123 breaker 键+基线播种）**③死告警**（alert.rules.yml :102-105 watch 一个生产恒 0 的序列·increase>0 恒假=永不触发也不该触发）**④死 env**（compose.prod.yml :36-37+worker.env.example :119-121·main 已不读）**⑤陈旧 SSOT**（current-runtime-truth.md :118 把死 env 记为活旋钮/:125「各自使用进程内 admission」+两 use-case 文件引用）。breaker.proof.ts 整卷与 model-cost-governance.proof.ts rateLimited 臂/ metrics.proof breaker 臂为残留专属测试。**零行为影响确认**：删除集全部为「生产不可达面」（无接线→无运行时行为）+「恒假告警」+「死配置样例」；共享权威决策码（`model_circuit_open`/`model_circuit_half_open`·errors/invoke :240）属 0120 面**零触**。

### §1-修法（issues-final :319 原文为修法权威：「上报真实 model 与 cached/cost；RAG 预留改为 0083 风格的 revision 绑定；删除残留实现」——四件）

**① Langfuse model 字段改真实 model 名**（红事实 A）：

- `ModelCallSpan.model?: string` additive（trace.ts :15-29·沿 promptVersion 同形可选标量位·脱敏铁律不破——受控模型名是标量非内容）；
- invoke.ts span 闭包（:668-671）增 `model` 位：**源优先序=裁决项①**——(a) provider 回显 `actualModel`（G7 臂在手）优先，缺省 `plan.cost?.model`（与 claim :706 同源同值·受控 profile 域），再缺省 undefined（cached/prepare 拒绝等无模型名臂）——**推荐**（归因最真·值域受控）(b) 仅 `plan.cost?.model`（跳过回显·实现最简）；
- langfuse-v5.ts :173 改 `model: safeName(span.model ?? span.service, 'unknown')`——**span.model 缺省臂 fallback service 名=现状降级路径保留（幂等命中/拒绝臂零回归）**；:172 span **名称**（`meetwise.model.<service>`）零字节零触（看板分组键稳定·§3-7）。

**② cached/cost 字段 additive**（沿 cost1 `cachedInputTokensOf` 已落观测面·缺席≠零铁律）：

- `ModelCallSpan.cachedInputTokens?: number` additive+span 闭包透传 `usage?.cachedInputTokens`（ModelUsage 位 cost1 已落·invoke.ts :59-66）；
- langfuse-v5.ts :174 usageDetails 增挂 **`input_cached`** 键（键名沿 @langfuse/core 5.10.0 SDK PricingTierCondition 文档原文例证「input_cached」·Langfuse 缓存 token 约定键）——**仅 span.cachedInputTokens !== undefined 时挂**（undefined=字段缺席→键不出现；显式 0=挂 0——两态分开沿 cost1 铁律·Ban 静默归零）；
- **成本上报形=裁决项②**：(a) metadata 增 `settledCostMicroCny` 标量（invoke 账本结算权威值·:942-:969 settledCost 在终局 span 发射前已就绪·零汇率换算·**推荐**）(b) Langfuse costDetails/calculatedTotalCost 显式成本（USD 语义+价格表引入·重）(c) 不显式报成本·仅靠 ① 真模型名让 Langfuse 侧定价自算（本仓零码但依赖外部配置）；
- **脱敏面零扩**：新增两标量皆数值/受控名·metadata 白名单形制（:67-84）原样 additive。

**③ RAG 预留改 0083 风格 revision 绑定**（红事实 B）：

- **绑定过程选型=裁决项③**：(a) **复用 0083 现成 9 参口**（`ai_cost_reserve_text_scoped`·GRANT app_role 在案 0083:146）——budgetedQbankEmbedding 预留切 `reserveAiTextCost`，`maxOutputTokens=0`（embedding 无输出·0083:35 校验 `p_input_tokens+p_output_tokens≥1` 容忍 output=0）+结算切 text settle（actual output=0）·**零新迁移·推荐**（0083 形制全文复用·binding_mismatch/price_missing 语义白得）(b) 新建 0083 风格 embedding 专属预留函数（迁移 0182·五件套同 0083 形——input-only 语义更显式但新触面新迁移）；
- `AiCostReservationInput` 侧：reserveAiCost 7 参旧口**零动零删**（历史迁移兼容面·0083 :128-130 已示范 REVOKE 纪律归后继另议·本刀只切 RAG 调用方）；
- **决策映射**：`binding_mismatch`→`RagCostError('rag_cost_binding_mismatch')` 确定性拒绝（同 invocationId 换 revision=配置漂移·fail-closed 拒重放·**绝不静默按新价放行**——正是本刀要封死面）；`price_missing`→启动期 configureRagCostGovernance :75-77 对表断言已保正常路径零新增拒绝面·运行期仍兜 RagCostError 确定性码（如实登记臂）；
- **settle 金额恒等约束**：绑 revision 后同输入同 revision 同价——结算数值语义零变化（Ban 计费语义改动·§5）；observe 模式（:106-109）零触。

**④ 进程内限流/熔断残留清理**（红事实 D·零行为影响确认在案）：

- **删两件**：rate-limit-model.ts（163 行）+circuit-breaker.ts（131 行）整文件；index.ts :196-201 六导出行；metrics.ts :66 注释/:74 METRIC 键/:122-123 基线播种两行；
- **删专属测试+gate**：breaker.proof.ts 整卷+gate `breaker:prove`（根 :447+ai-runtime :18 两行）+model-cost-governance.proof.ts rateLimited 臂（:10 import+:120-133）+metrics.proof.ts breaker 断言臂（:11/:17/:26/:33-35/:50/:54）——**断言适配如实登记不洗**；
- **删死告警+白名单行**：alert.rules.yml :102-105+alerts-lint.mjs :28-29 注释行与白名单行（alerts-lint 自身门重跑原值）；
- **死 env 清理幅度=裁决项④**：(a) compose.prod.yml :36-37+worker.env.example :119-121 一并删（残留清干净·**推荐**）(b) 留 env 样例只删代码（保守·但死样例继续误导部署）；
- **SSOT 随批更新（docs:check 绿门要求·措辞最小）**：current-runtime-truth.md :118 删 MODEL_MAX_CONCURRENT/MODEL_RPM 活旋钮表述+:125 「进程内 admission」句改共享权威事实；model-invocation-reliability.md :35/interview-question-bank-reliability-security.md :195/:333 文件引用随批改指（共享权威/历史归档）；interview-service.ts :205-206/:216-217 注释零字节保留（禁令语义仍真——模块既删禁令自满足·**不改注释免扩触面**）；errors/index.ts :5 注释零字节（历史沿革叙述非引用）；
- **共享权威零触**：0120/model-admission.ts/invoke admit 相位/`model_circuit_open` 系决策码全零字节（§3-1）。

**零计费语义改动总纲**：settle/release/dispatched/unknown 四件管道、价格本写入（:66-77）、预算检查、结算金额计算全零字节——③只把「选哪行价」从隐式 latest 显式为配置 revision，同输入同 revision 分币不变。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **新 proof（`prove:ag24-langfuse-model`·scripted tracer/recordingTracer+fixture·隔离 PG 仅裁决③臂需·est live=0）**：
   - **model 真名断言**：带 costPolicy 的 invoke→span.model=受控模型名（=plan.cost?.model 对表）→langfuse generation `model` 字段=真名（**≠service 名负证**）；G7 臂 actualModel 在手时=回显值（裁决①(a)）；cached/prepare 拒绝臂→span.model undefined→generation model=service fallback（现状降级零回归臂）；
   - **cached 三态断言**：usage.cachedInputTokens=值→usageDetails.input_cached=值；显式 0→挂 0；undefined→**键不存在**（≠0·cost1 铁律钉）；metadata 无 prompt 原文/答案键（脱敏负证）+promptVersion 行原值（AG-19 面零位移）；
   - **cost 标量断言**（裁决②(a)）：终局 ok span metadata.settledCostMicroCny=账本结算值对表；中间 outcome 臂=缺省不挂；
   - **RAG revision 绑定断言**（隔离 PG·0083 口）：enforce 预留后 ai_cost_reservation.price_revision=cfg.priceRevision（**≠NULL 负证**）；同键换 revision replay→binding_mismatch→RagCostError 确定性拒绝；价格本缺行→price_missing 臂；**结算金额恒等对照臂**（同输入同 revision·绑前后 reserved/settled microCny 逐分相等）；observe 模式零触臂；
   - **G7 回退估算断言**：图片数组形→回退估算=拼接字符量/4（**≠数组元素数负证**·塌缩 64 下限负证）；无图字符串形→修正前后恒等（零位移）；reserveFor 消费值随动对表；
   - **残留删除断言**：全场 `rg "rateLimitedModel|circuitBreaker"` 生产面零命中（docs/历史卷引用豁免名单如实登记）；metrics `render()` 无 `model_circuit_breaker_open_total` 序列；alerts-lint 白名单对表无该行且门绿；gate 清单无 breaker:prove。
2. **既有门回归**：`model-usage-cache-observe`（cost1 面·:524-528/:713/:935/:1025 零触原值）+`model:prove`（runtime-kernel·span 键集 additive 适配如实登记）+`model-op02:prove`（共享权威原值）+`rag-cost:prove`（db ai-cost）+`rag-cost-config:prove`+`rag-cost-runtime:prove`+worker `prove:model-cost`（rateLimited 臂删后原值臂全绿）全 EXIT 原值；`metrics:prove` 适配臂如实登记不洗；`prove:model-cost-metrics`（worker）基线同红承登纪律照 ag19 §9-2-3 先例（qbank-release-sweep b20ee350 既存面·blob `89913f128d13` 恒等亲证·非本刀面零字节）如实重跑登记不修。
3. **迁移门**：裁决③(b) → `migrate:prove`+`drift:prove`（链含 0182·零漂移）；③(a) → 链原值零新迁移。
4. **docs:check** EXIT=0（SSOT 随批更新后恒绿）+ **typecheck** `turbo typecheck` 全绿。

## §3 范围外（边界清单·越界即 FAIL）

1. **共享准入/熔断权威本体零触**：0120 迁移/model-admission.ts/invoke admit 相位/`model_circuit_open|model_circuit_half_open` 决策码——AG-01（准入拒绝去终态化）与成本轨⑤ AG-08（熔断键按端点）另刀面；本刀④只删被收编的进程内残留。
2. **byteEstimate/估算器本体零触**：G7 :650 只修 userContent 数组 `.length` 一处语义——AG-12 CJK 加权估算器/AG-11 估算结算对齐（EG-B2）零触。
3. **ai_model_fee_ledger 对账/unknown 清算**（EG-B3/EG-B1）另议；reserveAiCost 7 参旧口不 REVOKE 不删（历史迁移兼容·0083 REVOKE 纪律推广归后继）。
4. **计费语义零触**：settle 金额管道/价格本写入/预算检查零字节（§1-③ 恒等约束）。
5. **AG-19 promptVersion 面零触**：langfuse-v5 :76-77/invoke registryPromptVersion/model-invocation.prompt_version 全零字节。
6. **Langfuse 侧外部操作零触**：模型定价表配置/看板搭建=Langfuse 项目设置（非本仓交付物）；trace span **名称**（`meetwise.model.<service>`）零字节。
7. **est live=0**：零真实模型外呼·零生产操作·零 secrets（§6）。

## §4 依赖

- **零硬前置刀**：四子项全部就地可修。上游已落并在基线：AG-19（promptVersion 面·互认零触）/ag-cost1（cachedInputTokensOf 观测面·本刀②沿其出席性语义）/MODEL-OP-02（0120 共享权威·本刀④前提）。正交面：AG-01/AG-08（共享权威演进·零文件交点）·成本轨②③④（0177 面+估算器·零交点）·先落后落互不阻·照 §0 重 pin。
- **下游**：成本轨⑤（AG-08 熔断键按端点）以共享权威为面·与本刀残留删除正交（删的是死代码非权威）；Langfuse 成本看板消费本刀真名+cached+cost 数据·为数据消费面非交付物；EG-B4 双轨封死后·RAG 与文本两账面同遵 0083 原则。

## §5 Ban 列表 + pins（沿 ag19/ag-cost1 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 动共享准入/熔断权威本体（0120/model-admission.ts/invoke admit 相位/决策码零字节·§3-1）；Ban 把 cachedInputTokens 缺席记 0/usageDetails 缺席挂 0（缺席≠零沿 cost1·undefined=键不挂）；Ban usageDetails 自由键名（cached 键=SDK 约定 `input_cached`·禁自造）；Ban span 带自由字符串 model（值域⊆受控策略模型名∪G7 供应商回显∪service fallback·禁调用方注入）；Ban metadata 增非标量（脱敏铁律 :4·prompt 原文/简历/答案绝不外流）；Ban 改 RAG 结算/release/dispatched/unknown 语义与金额管道（③只绑预留·结算数值恒等约束）；Ban binding_mismatch 静默按新价放行（换 revision replay 必须 fail-closed 确定性拒绝）；Ban 顺手修 byteEstimate/CJK/AG-11/AG-14 口径（§3-2）；Ban 动 trace span 名称与 AG-19 promptVersion 面（§3-5/§3-6）；Ban 删共享权威断言或放松 model-op02 门（残留删除只删残留专属臂·权威面臂原值）；Ban 真实模型外呼（est live=0·scripted+隔离 PG 形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/隔离真迁移 PG·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=scripted model/recordingTracer+fixture usage 载荷+隔离真迁移 PG（仅③绑定臂·`assertIsolatedTestTarget` 护栏沿 0119/ag19 先例门形）；回归门=既有 prove 原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag24-langfuse-model-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag19/ag-cost1 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（若裁决③(b)·迁移号 0182 全场空闲重证随立项核验）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①span.model 源优先序**：(a) G7 `actualModel`（供应商回显）优先→缺省 `plan.cost?.model`（与 claim :706 同源）→再缺省 undefined→Langfuse fallback service 名（归因最真·值域受控·**推荐**）(b) 仅 `plan.cost?.model`（实现最简·G7 回显不进 span）。
- **②成本上报形**：(a) metadata 标量 `settledCostMicroCny`（账本权威值·零汇率换算·终局 span 发射前 settledCost 已就绪 invoke :942-:969 亲证·**推荐**）(b) Langfuse costDetails/calculatedTotalCost 显式 USD 成本（价格表+汇率语义引入·重）(c) 不显式报成本·靠 ① 真模型名让 Langfuse 侧定价自算（本仓零码·依赖外部配置非闭环）。
- **③RAG 绑定过程选型**：(a) 复用 0083 现成 9 参 `ai_cost_reserve_text_scoped`+text settle（maxOutputTokens=0·GRANT 在案 0083:146·零新迁移·binding_mismatch/price_missing 语义白得·**推荐**）(b) 新建 0083 风格 embedding 专属预留函数（迁移 0182·input-only 语义显式·新触面新迁移）。
- **④死 env 清理幅度**：(a) compose.prod.yml :36-37+worker.env.example :119-121 随码一并删（残留清干净·防死样例误导部署·**推荐**）(b) 只删代码留样例（保守）。
- **⑤cached 臂（幂等命中）model 缺省**：(a) fallback service 名如实登记（零新查询·降级路径现状保留·**推荐**）(b) cached 臂回读 ai_model_invocation.model 回填（归因全但加一次读）。

---

*AG-24 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`849a0f19517b` · 分支 `line/ag24-langfuse-model` · 工作树 `meetwise-ag24` · 蓝本=issues-final AG-24 :36/:312-320（:314 部分成立定谳·:319 修法权威·#72/#172/#210）+ EXPERT-REVIEWS §六 :54 EG-B4+§七 :67+:73 + review-log AC-F22 :88/AC-F13 :79 + ag-cost1 卷（cachedInputTokensOf 已落·裁决②「AG-24 归后继」授权面）· 范围=①Langfuse model 真名②cached/cost additive③RAG 预留 0083 revision 绑定④进程内限流/熔断残留清理（零行为影响确认在案）· 零共享权威触面·零计费语义改动·est live=0 · pins 十一值照抄 · markers=0 · ⛔push 待 pre-exec 双审两外席（Ban self-approve · alone≠dual · Dual PASS ≠ 开工）*
