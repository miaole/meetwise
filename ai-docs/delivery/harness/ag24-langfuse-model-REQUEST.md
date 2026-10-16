# AG-24 — 成本与观测小项汇总刀：Langfuse model 真名+cached/cost 上报 · RAG 预留 0083 revision 绑定 · G7 回退估算数组修·进程内限流/熔断残留清理（EXEC REQUEST）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line AG-24 nail」段 :2548 已载 post FAIL findings 22 项全数处置 BOTH PASS+nail merge @`9ea52bc0`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

**rev2**（2026-10-13）：pre-exec 双审两外席均 FAIL·本卷按 findings 全数修订（两席共识 blocking 2+席1 独有 9+席2 独有 11=22 项逐条处置·1 项复测否证如实上报）·STOP=`draft:awaiting_pre_exec_dual` 维持·§0-§8 除 findings 指明处零改·基线/blob 零动·逐条处置表见卷尾「rev2 勘误席处置摘要」。

**席位**：meetwise 战役 AG-24 起草席（AI 能力复审 P3·成本面·观测修正+残留清理四合一小项汇总刀）。
**基线**：`feat/mysql-schema-skeleton` @ `849a0f19517b`（开工 tip 实测·`git log -1` 全长亲证=docs(ssot) BILL3 话题结算 nail 收官登记笔·2026-10-13）。分支 `line/ag24-langfuse-model` · 工作树 `meetwise-ag24`（`git worktree add ../meetwise-ag24 -b line/ag24-langfuse-model 849a0f19517b2ec90621d43c858118f660fd08a5` 仓根同级·本起草席已立·建前亲证：`git worktree list` 25 树零 ag24；`git branch -a | grep -iE "ag24"` 零同名）。
**防重对表（亲证）**：`rg -il "ag24" ai-docs/delivery/harness/` → **EXIT=1 零命中**；`ls ai-docs/delivery/harness/ | grep -iE "ag24|langfuse"` → 零同名刀卷。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-24（总览 **:36** · 条目 **:312-320**·复核结论 **:314「部分成立——已核实各子项；"embedder 注释写 1024"一项不成立」**·交叉印证 ai-cost-context **:315**·源编号 AC-F22/AC-F13 **:315**·file:line **:316**·触发例子 **:317「在 Langfuse 里按模型统计成本，看到的全是 service 名」**·用户影响 **:318「成本归因不准；价格切换时 RAG 账本会被"隐式改价"」**·修法 **:319「上报真实 model 与 cached/cost；RAG 预留改为 0083 风格的 revision 绑定；删除残留实现」=本刀修法权威**·关联审计总表编号 #72/#172/#210 **:320**）②同目录 `EXPERT-REVIEWS.md` **§六 :54 EG-B4**（「RAG embedding 走旧 reserveAiCost（latest-price·无 revision 绑定）与 0083 原则双轨」=子项③独立专家印证）+ **§七 :67 成本轨**（#48 cached_tokens 观测系成本轨①·已落·本刀=其 Langfuse 挂面后继）+ **:73 缓存结论补强**（「字段缺席≠零」）③同目录 `review-log.md` **AC-F22 :88**（P2/P3→P3·部分成立·「embedder 注释写 1024」不成立定谳）+ **AC-F13 :79**（P3 成立·「model-client.ts:400，只影响 G7 测试路径」）④`ag-cost1-bleed-observe-REQUEST.md`（**cachedInputTokensOf 观测面已落基线**·其 §8 裁决②行使明示「Langfuse usageDetails.cached **不增挂**·AG-24 model 名面仍归后继」=本刀授权面）+ `ag19-prompt-version-REQUEST.md`（形制蓝本·其 §3-3/§4 明示 AG-24 面另刀互认·基线已含 promptVersion 观测面）。

## §0 现状锚（起草席亲读·base `849a0f19517b`·file:line/blob 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 blob 锚表（@`849a0f19517b`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/langfuse-v5.ts` | `a69be298f306` | **子项①②主触面**：:168-179 tracer.record——**:173 `model: safeName(span.service, 'unknown')`=Langfuse model 字段填 service 名（AG-24 面根锚）**/ :174 `usageDetails: { input: span.inputTokens ?? 0, output: span.outputTokens ?? 0 }` **仅两键·无 cached 无 cost** / :67-84 langfuseSafeModelMetadata 标量集（inputTokens/outputTokens 在·**无 cachedInputTokens 无成本位**；:76-77 promptVersion=AG-19 已落行·零触）/ :61-64 safeName 归一（非 [a-zA-Z0-9_.-]→'_'·截 96·rev2 N1 注记见 §1-①） |
| 2 | `packages/ai-runtime/src/trace.ts` | `8f07dc7372a3` | **span 无 model 位无 cached 位**：:15-29 `ModelCallSpan`（service/promptVersion/owner/idempotencyKey/threadId/retrieval/attempt/outcome/latencyMs/sources/inputTokens/outputTokens）/ :4 脱敏铁律原文「span 只带标量…绝不带 prompt 原文/简历/答案」 |
| 3 | `packages/ai-runtime/src/invoke.ts` | `23a6d071c4c6` | **真实模型名已在管道·span 未带**：:668-671 span 闭包 `tracer.record({…service, promptVersion, inputTokens: usage?.inputTokens, outputTokens: usage?.outputTokens})`——**无 model 无 cachedInputTokens** / :703-708 claim 相位 `model: plan.cost?.model` **已落库**（ai_model_invocation.model=受控策略模型名）/ :78 `ModelResult` `actualModel?: string`（G7 供应商回显位在）/ :844 文本路径 `priceRevision: policy.priceRevision` **已绑 revision（0083 面·对照 RAG 双轨）** |
| 4 | `packages/ai-runtime/src/model-client.ts` | `c4827e8d72f8` | **子项④触面+cost1 面在案**：:198-200 `renderPrompt` userContent——**req.images?.length 非空时=对象数组** `[{type:'text'…}, …images.map(image_url)]`·无图时=字符串 / **:650 G7 回退估算 `Math.max(64, Math.ceil((rendered.system.length + rendered.userContent.length) / 4))`——图片数组形下 userContent.length=数组元素数非字符数**（估算塌缩到 64 下限·AC-F13 定谳「只影响 G7 测试路径」·rev2 补：第三消费点=:710 usage 缺席 fallback inputTokens 见 §2-1）/ :674-681 reserveFor(G7 预留消费方) / :524-528 `cachedInputTokensOf`（cost1 已落·三端点取值序）/ :713/:935/:1025 cachedInputTokens 三解析面（cost1 已落·零触） |
| 5 | `apps/worker/src/rag-cost-governance.ts` | `85f477e23ea4` | **子项③主触面（双轨根源）**：:51 `priceRevision: required(env.RAG_EMBED_PRICE_REVISION,…)` **配置已解析 revision** / :66-77 `configureRagCostGovernance` 把 (provider,model,region,revision,input 单价,source_url) 写入 ai_cost_price_book（:75-77 stored 对表断言）/ **:110-113 `reserveAiCost(c, { scopeId, requestOwner, idempotencyKey, provider, model, region, maxInputTokens })` 7 参——priceRevision 在手却不传·预留走无绑定过程** / :116-142 dispatched/release/settle/unknown 四件（本刀零触·settle=按预留行捕获价结算·:59 注释自证「old reservations keep their captured rate」=rev2 红事实 B 机制句勘误实证） |
| 6 | `packages/db/src/model-op/ai-cost-governance.ts` | `1efb8d969cf3` | **双轨对照面**：:31-39 `reserveAiCost`→`ai_cost_reserve_scoped($1…$7)`（7 参无 revision=0035 旧口）/ :41-49 `reserveAiTextCost`→`ai_cost_reserve_text_scoped($1…$9)`（**含 priceRevision=0083 新口**·:26 注释原文「Caller-selected immutable price row; the database must never choose latest.」）/ :56-66 settle 两口（input-only 4 参 :56-59 ‖ text 5 参 :61-66）/ :51-53 markAiCostDispatched |
| 7 | `packages/db/migrations/0035_ai_cost_principal_scope.sql` | `93be6aece880` | **latest-price 根源（rev2 B1 双 pin 勘误：0035 全文 54 行·原引 :68 不存在·ORDER BY 在 0034/0033）**：scoped 口 0035:14-21 `ai_cost_reserve_scoped` 委托 `ai_cost_reserve`（:19 `RETURN QUERY SELECT * FROM ai_cost_reserve(…)`）·**现行函数体=0034:29 `ORDER BY effective_at DESC,revision DESC LIMIT 1`**（0034 CREATE OR REPLACE 取代 0033·0034:1-3 头注自证「增量替换函数，绝不改写已发布迁移」）·**原件=0033:115 同句 ORDER BY**（选价块 0033:113-115）——隐式选最新价行=「新预留按 latest 入账·与配置 revision 脱钩」机制（rev2 机制句勘误详见 §1 红事实 B）/ **:50** 7 参 scoped 口 GRANT app_role 在案（原引 :49-51 勘误） |
| 8 | `packages/db/migrations/0083_ai_text_cost_price_revision_binding.sql` | `fe6d5de12862` | **子项③形制蓝本**：:8-12 9 参 `ai_cost_reserve_text`（p_price_revision）/ :31 revision 形校验 `^[A-Za-z0-9._:-]{1,80}$` / :53-56 replay 换 revision→`binding_mismatch`（:52-55 条件·:56 返回）/ **:67-68 revision 精确查价+`effective_at <= clock_timestamp()`·:69-72 无行→`price_missing`**（块 :66-72·rev2 E7 微差校正）/ **:103-123 `ai_cost_text_price_binding_matches_scoped` 启动期对表**（:101-102 注释·rev2 E7 微差校正）/ :128-130 旧 latest-price 签名 REVOKE fail-closed / :134-146 scoped 9 参口 GRANT app_role **在案（子项③裁决③(a) 零新迁移依据·GRANT 恰在 :146）** |
| 9 | `packages/ai-runtime/src/rate-limit-model.ts` | `00f406521a20` | **子项④残留件一（162 行整删·rev2 E1 勘误：原记 163）**：进程内并发/RPM 限流器（rateLimitedModel·:31-36 resolveModelRateLimitConfig 读 `MODEL_MAX_CONCURRENT`/`MODEL_RPM`·waiters 队列/nextStartAt 全进程内变量）/ :2-5 注释自称「Model concurrency/RPM admission」 |
| 10 | `packages/ai-runtime/src/circuit-breaker.ts` | `90c3720a54f6` | **子项④残留件二（131 行整删）**：进程内熔断器（threshold 5/cooldown 30s/:20-24 halfOpenProbeHeld 注释原文自认「This lease is intentionally **process-local**, like this breaker itself」/ :34 emit METRIC.circuitBreakerOpen）——**复核快照只点名本文件；rate-limit-model.ts 系同族残留（MODEL-OP-02 收编同批对象）·本刀一并删（issues-final :319「删除残留实现」修法权威面内）** |
| 11 | `packages/ai-runtime/src/index.ts` | `621c83ff9a5d` | :196-201 六行中**删 5 行=:196 `circuitBreaker`/:197 `BreakerOpts,BreakerPhase`/:198 `rateLimitedModel`/:200 `resolveModelRateLimitConfig`/:201 `RateLimitOpts,RateLimitedClient,ModelRateLimitConfig`**——**:199 `export { failoverModel } from './failover-model.ts'` 生产活导出·零字节零触（rev2 共识勘误：interview-service.ts:9 import+interview-service.ts:227 `failoverModel([primary, backup])` 主链+model-cost-governance.proof.ts:10 消费·删则 import 丢名编译红·Ban 见 §5）** |
| 12 | `packages/ai-runtime/src/metrics.ts` | `ddca34ad57e6` | :66 注释「emit 在 circuit-breaker.ts 相位翻到 open 时」/ :74 `circuitBreakerOpen: 'model_circuit_breaker_open_total'` / :122-123 registerBaselineMetrics 按 {dep:'model'/'fast_model'} 播种基线 0——**随删（§1-④·metrics.proof 适配如实登记）** |
| 13 | `docker/monitoring/alert.rules.yml` | `9af72c994f3f` | :102-105 熔断告警 `sum(increase(model_circuit_breaker_open_total[15m])) > 0`——**死告警**：生产零 emit 源（残留件未接线）·基线恒 0→increase>0 恒假 |
| 14 | `scripts/alerts-lint.mjs` | `b397fa9a588d` | :28-29 白名单行 `"model_circuit_breaker_open_total"`——随告警同删 |
| 15 | `packages/ai-runtime/test/breaker.proof.ts` | `f69205921ff1` | 残留件专属 proof 整卷·随删；gate 两行随删（**rev2 E2 勘误·两名分写勿混**）：根 package.json :447 `breaker:prove` + packages/ai-runtime/package.json :18 `prove:breaker` |
| 16 | `packages/ai-runtime/test/metrics.proof.ts` | `ee24598b8aa6` | breaker 断言面（**rev2 B4 行号勘误·非整臂皆删·逐行亲证**）：:11 `setGauge('circuit_breaker_open',…)`+:17 断言=**legacy gauge 字面量键（非 METRIC.circuitBreakerOpen）·零触勿删** / :25-31（:26 起）METRIC 常量对表混排断言（breaker+refund/jobs 同式）**原位编辑·保 refund/jobs 部分只去 breaker** / :32-33 registerBaselineMetrics 预注册混排（breaker 0 序列+refund 0）**原位编辑** / :34-35 `inc(METRIC.circuitBreakerOpen)` 两行纯 breaker **随删** / :50 累加断言混排（breaker 2+refund 1）**原位编辑** / :53-54 TYPE 头混排（breaker+refund+jobs gauge）**原位编辑**——适配如实登记不洗 |
| 17 | `packages/ai-runtime/test/model-cost-governance.proof.ts` | `ac1819920b12` | :10 import rateLimitedModel（**同行并 import failoverModel——:199 保留后该名照常可得·零触**）+ :120-133 rateLimitedClient 准入臂——随删适配·如实登记 |
| 18 | `docker/compose.prod.yml` | `e16bf1c68a5a` | :36-37 `MODEL_MAX_CONCURRENT: ${…:-4}` / `MODEL_RPM: ${…:-0}` 死 env（main.ts 已不读·见 #19）——清理=裁决项④ |
| 19 | `docker/env/worker.env.example` | `530f13a73cff` | :119-121 注释+`MODEL_MAX_CONCURRENT=4`+`MODEL_RPM=0` 死 env 样例——清理=裁决项④（**rev2 E6 复测恒等收窄：:119 注释/:120-121 键值/:122 空行·:118=`WORKER_INTERVIEW_GLOBAL_INFLIGHT` 活旋钮勿误删**）；`apps/worker/src/main.ts:433-434` 与 `apps/api/src/main.ts:111-112` 注释原文「MODEL-OP-02：全局 MODEL_MAX_CONCURRENT/MODEL_RPM 限流已废弃（per-adapter 限流移除）·并发/断路器改由共享权威（迁移 0120 的 ai_model_admission_acquire_scoped）在 invoke() 内裁决」=**废弃已官宣·残留未清干净** |
| 20 | `ai-docs/architecture/current-runtime-truth.md` | `22a16e7045df` | **:118 后半句簇**仍把 `MODEL_MAX_CONCURRENT`/`MODEL_RPM` 记为启动校验活旋钮+限流 admission 叙述 / **「当前模型路由边界」段（:123 标题）:125 两句**：「当前的 default/fast 文本 client 各自使用进程内 admission」+「因此 `MODEL_MAX_CONCURRENT`/`MODEL_RPM` 不是所有百炼能力共享的全局上限」——**SSOT 陈旧句簇=:118 后半+:123-125 段·一并纳入更新范围（rev2 N5 圈界·防 EXEC 自由发挥·docs:check 绿门要求·措辞最小）**；`ai-docs/requirements/use-cases/model-invocation-reliability.md:35` 与 `interview-question-bank-reliability-security.md:195/:333` 同族文件引用随批更新 |
| 21 | `docker/compose.ha.yml` | `cea9c4d30ae0` | **（rev2 增锚）**:69-70 `MODEL_MAX_CONCURRENT: ${…:-4}`/`MODEL_RPM: ${…:-0}` 死 env 同族——裁决项④选项文件清单内 |
| 22 | `docker/env/api.env.example` | `c303ddb08320` | **（rev2 增锚）**:48-49 `MODEL_MAX_CONCURRENT=4`/`MODEL_RPM=0` 死 env 同族——裁决项④选项文件清单内 |

### 0.2 漂移登记（复核快照=issues-final :316 所引行号 → 现树 `849a0f19517b`·全亲读重 pin）

| 复核快照锚（issues-final :316） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| langfuse-v5.ts :169-171（model 填 service 名） | :168-179（**:173 `model: safeName(span.service, 'unknown')` 原文恒等**·:174 usageDetails 仅 input/output 两键） | 微漂（AG-19 metadata.promptVersion :76-77 插行+record 块整体在）·**「model=service 名+无 cached+无 cost」结论不变** |
| rag-cost-governance.ts :110-113（旧预留不绑 revision） | :110-113（7 参 reserveAiCost·priceRevision :51 在手不传） | 恒等·零漂 |
| model-client.ts :400（G7 回退对图片数组取 .length） | **:650** 回退估算行（:198-200 userContent 数组形·:674-681 reserveFor 消费·:710 第三消费点） | 行漂（TOKSTREAM S4a 段+G7 块插入致下移 250 行）·**「数组 .length 语义」结论不变·AC-F13 :79「只影响 G7 测试路径」定谳在案** |
| circuit-breaker.ts（进程内残留） | 131 行全在（:20-24 process-local 自认注释）+ **同族 rate-limit-model.ts 162 行（rev2 E1 勘误）**（快照未点名·MAINs :433-434/:111-112 已官宣废弃） | 面扩大·**残留仍在·MODEL-OP-02 收编后零接线** |
| EXPERT EG-B4（RAG 走旧 reserveAiCost 双轨） | :110-113（7 参口）对照 invoke.ts :844（文本 9 参口已绑） | 恒等·双轨在案 |

### 0.3 现势并发登记（强制）

1. **迁移号**：主线迁移实测 **183 件·末位=0181**（`0181_ag19_prompt_version_column.sql`·AG-19 已落）——**本刀仅裁决项③(b) 才占用 0182**（③(a) 零迁移）；EXEC 立项时主线+全 worktree 全场重证，撞则改号照 0179→0180 勘误形登记。
2. **并线亲证**：AG-19（prompt_version 0181）/ag-cost1（cachedInputTokensOf）/ag-cost2（0177）/AG-B/C/D/E/F/bill3/ag37 全部已 merge 入基线（`git branch --merged HEAD` 25 分支亲证清单）——本刀四子项触面（langfuse-v5/trace/invoke span 行/rag-cost-governance/model-client :650/index/metrics breaker 面/两残留件/告警面）**无任何在飞同面刀**；AG-19 §3-3「AG-24 面（Langfuse model 字段/cached/cost 上报）零触」与本刀 §3-5「AG-19 promptVersion 面零触」互认成立（基线 langfuse-v5 :76-77 promptVersion 行在案即证）。
3. **AG-01/AG-08 面（另刀）**：共享准入/熔断权威本体（0120 `ai_model_admission_acquire_scoped`/`model-admission.ts`/invoke admit 相位）本刀**零字节零触**——本刀④只删「已被 0120 收编取代的进程内残留实现」，权威本体演进（熔断键按端点=成本轨⑤·准入拒绝去终态化=AG-01）归各自刀面（§3-1）。
4. 起草窗口内主线 tip=`849a0f19517b`（建树时点）·本卷全部 blob/行号即 @该 tip 实取。

## §1 红事实 + 修法

### 红事实 A：Langfuse model 字段=service 名·cached/cost 双缺（现 pin @`849a0f19517b` 全亲证）

langfuse-v5.ts :173 `model: safeName(span.service, 'unknown')`——Langfuse generation 的 model 字段被填成 **service 名**（job.route-classify 等逻辑服务名·非供应商模型名），Langfuse 按 model 维度的成本看板/定价归因全空转（issues-final :317 触发例子逐字在案）；:174 usageDetails 仅 `{input, output}` 两键——**cached 未挂**（cost1 裁决②明示归后继=本刀）；**cost 未报**（metadata :67-84 标量集亦无成本位）。而真实模型名管道上游**现成**：claim 相位 invoke.ts :706 `model: plan.cost?.model`（受控策略模型名·已落 ai_model_invocation）+ G7 臂 `ModelResult.actualModel`（:78·供应商回显）——**数据在手·只差 span 一位**。

### 红事实 B：RAG 预留 latest-price 双轨（EG-B4·「隐式改价」机制根·rev2 机制句全段改写）

rag-cost-governance.ts :51 priceRevision 已强制解析 + :66-77 已把该 revision 精确写入价格本——**但 :110-113 预留走 7 参 `ai_cost_reserve_scoped`（0035 口），revision 不传**：预留链 0035:14-21 scoped 口（GRANT :50）委托 `ai_cost_reserve`·现行体按 latest **隐式选价行（0034:29·0033:114-115 原件同句）**——**真实缺陷=新预留的入账 revision 与配置 priceRevision 脱钩**：换 revision 发版后到达的新预留按「时点最新价行」捕获入账（0033:133-134 将所选 price.revision+input 单价写入预留行）而非 cfg 指定 revision·入账价语义由「配置指定」漂为「时点最新」（issues-final :318「价格切换时 RAG 账本会被隐式改价」在本口径下成立·EG-B4 :54 独立印证）；**在途预留/结算不受换价影响（rev2 勘误：原「在途预留/结算按新价入账」不成立）**——预留时捕获单价（0033:113-134）·结算读捕获值（**0033:161** `r.input_micro_cny_per_million`·rag-cost-governance.ts **:59** 注释自证「old reservations keep their captured rate」）；对照文本路径 invoke.ts :844 已绑 `policy.priceRevision`（0083 口）——同仓双轨·RAG 是唯一漏绑面。settleAiCost（ai-cost-governance.ts :56-59）按预留行捕获单价结算·**与预留走 7 参/9 参口无关——预留绑死后结算自动随行·settle/dispatched/release/unknown 四件原样零字节零触（rev2 定谳：③只绑预留·「结算切 text settle」表述全卷废除）**。

### 红事实 C：G7 回退估算对图片数组取 .length（AC-F13）

model-client.ts :198-200：带图时 `rendered.userContent` 是**数组**（text 段+N 个 image_url 段）；:650 G7 回退估算 `Math.ceil((rendered.system.length + rendered.userContent.length) / 4)` 把**数组元素数**当**字符长度**——带图请求回退估算塌缩到 `Math.max(64, …)` 下限，G7 预留（:674-681 reserveFor）系统性低估。`context?.ok === true` 主路径走 plan.inputTokens 不受影响；该回退仅在 costPolicy 缺席时生效——**AC-F13 :79 定谳「只影响 G7 测试路径」·故定 P3 小项**。修法=数组形取拼接字符量（如对 userContent 各段 text/URL 字段求字符和·或复用 :259 imageDescriptorTokens 形）·无图字符串形 `.length` 恒等（零位移负证臂）。

### 红事实 D：进程内限流/熔断残留（MODEL-OP-02 收编后的死代码+死告警+死 env+陈旧 SSOT）

0120 已把并发/熔断收编为 invoke() 内共享权威（0.1 #19 两 main.ts 官宣注释），但残留五层未清：**①代码两件**（rate-limit-model.ts 162 行（rev2 E1 勘误）+circuit-breaker.ts 131 行·生产零接线亲证：`rg "circuitBreaker\(|rateLimitedModel\("` 非 test 命中=零·仅 index.ts 导出与 interview-service.ts :205-206/:216-217 注释）**②metric 面**（metrics.ts :66/:74/:122-123 breaker 键+基线播种）**③死告警**（alert.rules.yml :102-105 watch 一个生产恒 0 的序列·increase>0 恒假=永不触发也不该触发）**④死 env**（compose.prod.yml :36-37+worker.env.example :119-121+compose.ha.yml :69-70+api.env.example :48-49·main 已不读·rev2 补全=§0.1 #18/#19/#21/#22）**⑤陈旧 SSOT**（current-runtime-truth.md :118 后半把死 env 记为活旋钮/:123-125 段「各自使用进程内 admission」等两句+两 use-case 文件引用）。breaker.proof.ts 整卷与 model-cost-governance.proof.ts rateLimited 臂/ metrics.proof breaker 断言面为残留专属测试。**零行为影响确认**：删除集全部为「生产不可达面」（无接线→无运行时行为）+「恒假告警」+「死配置样例」；共享权威决策码（`model_circuit_open`/`model_circuit_half_open`·errors/invoke :240）属 0120 面**零触**。

### §1-修法（issues-final :319 原文为修法权威：「上报真实 model 与 cached/cost；RAG 预留改为 0083 风格的 revision 绑定；删除残留实现」——四件）

**① Langfuse model 字段改真实 model 名**（红事实 A）：

- `ModelCallSpan.model?: string` additive（trace.ts :15-29·沿 promptVersion 同形可选标量位·脱敏铁律不破——受控模型名是标量非内容）；
- invoke.ts span 闭包（:668-671）增 `model` 位：**源优先序=裁决项①**——(a) provider 回显 `actualModel`（G7 臂在手）优先，缺省 `plan.cost?.model`（与 claim :706 同源同值·受控 profile 域），再缺省 undefined（prepare 拒绝等无模型名臂·**cached 臂处置=裁决项⑤**——rev2 勘误：invoke.ts :713 处 `plan.cost?.model` 在作用域·零读取可得）——**推荐**（归因最真·值域受控）(b) 仅 `plan.cost?.model`（跳过回显·实现最简）；
- langfuse-v5.ts :173 改 `model: safeName(span.model ?? span.service, 'unknown')`——**span.model 缺省臂 fallback service 名=现状降级路径保留（幂等命中/拒绝臂零回归）**；:172 span **名称**（`meetwise.model.<service>`）零字节零触（看板分组键稳定·§3-7）；
- **safeName 改写注记（rev2 登记·席2-N1）**：langfuse-v5.ts :61-64 safeName 把非 `[a-zA-Z0-9_.-]`（**含 `/` 与 `:`**）改写为 `_`·截 96——真名含此类字符时 Langfuse 侧所见=归一形；**若裁决②(c) 中选（Langfuse 侧定价自算）·Langfuse 定价表须按 safeName 归一后的名注册**（登记注记·操作面归 §3-6 Langfuse 侧外部零触）。

**② cached/cost 字段 additive**（沿 cost1 `cachedInputTokensOf` 已落观测面·缺席≠零铁律）：

- `ModelCallSpan.cachedInputTokens?: number` additive+span 闭包透传 `usage?.cachedInputTokens`（ModelUsage 位 cost1 已落·invoke.ts **:74**·rev2 勘误：原引 :59-66 系 estimateInputTokens 注释段）；
- langfuse-v5.ts :174 usageDetails 增挂 **`input_cached`** 键（键名沿 @langfuse/core 5.10.0 SDK PricingTierCondition 文档原文例证「input_cached」·Langfuse 缓存 token 约定键）——**仅 span.cachedInputTokens !== undefined 时挂**（undefined=字段缺席→键不出现；显式 0=挂 0——两态分开沿 cost1 铁律·Ban 静默归零）；
- **成本上报形=裁决项②**：(a) metadata 增 `settledCostMicroCny` 标量（invoke 账本结算权威值·**OK 臂 :1039-1071 settledCost 在终局 ok span 发射前已就绪**——:1039 声明/:1047 settleAiTextCost 赋值/:1067-1070 settledMicroCny=settledCost 随 fee 记录落账·终局 ok span=**:1097**·零汇率换算·**推荐**·rev2 勘误：原引 :942-969 系 known_executed 失败臂——:976/:980 span exhausted/schema_retry 非 ok 臂）(b) Langfuse costDetails/calculatedTotalCost 显式成本（USD 语义+价格表引入·重）(c) 不显式报成本·仅靠 ① 真模型名让 Langfuse 侧定价自算（本仓零码但依赖外部配置）；
- **管道形如实申明（rev2 登记·席2-N8）**：②(a) 落地须 **InvokeSpanFn 扩参**（invoke.ts **:542** 签名 `(attempt, outcome, latencyMs, usage?)` 现无 settledCost 形参）·span 调用点 invoke.ts 内 rg 实测 **19 处**（:678…:1097·其中 :916-:1097 结算臂段 9 处）——触面按此估·非「仅 metadata 一行」形；
- **脱敏面零扩**：新增两标量皆数值/受控名·metadata 白名单形制（:67-84）原样 additive。

**③ RAG 预留改 0083 风格 revision 绑定**（红事实 B·rev2 定谳：**只绑预留·settle 零字节**）：

- **绑定过程选型=裁决项③**：(a) **复用 0083 现成 9 参口**（`ai_cost_reserve_text_scoped`·GRANT app_role 在案 0083:146）——budgetedQbankEmbedding 预留切 `reserveAiTextCost`，`maxOutputTokens=0`（embedding 无输出·0083:35 校验 `p_input_tokens+p_output_tokens≥1` 容忍 output=0）·**settleAiCost 原样零字节**（settle 按预留行捕获单价结算·与预留 7 参/9 参口无关·rev2 定谳：原「+结算切 text settle」表述废除——其与红事实 B「四件零触」/§3-4/§5 Ban 自相矛盾）·**零新迁移·推荐**（0083 形制全文复用·binding_mismatch/price_missing 语义白得）(b) 新建 0083 风格 embedding 专属预留函数（迁移 0182·五件套同 0083 形——input-only 语义更显式但新触面新迁移）；
- `AiCostReservationInput` 侧：reserveAiCost 7 参旧口**零动零删**（历史迁移兼容面·0083 :128-130 已示范 REVOKE 纪律归后继另议·本刀只切 RAG 调用方）；
- **决策映射**：`binding_mismatch`→`RagCostError('rag_cost_binding_mismatch')` 确定性拒绝（同 invocationId 换 revision=配置漂移·fail-closed 拒重放·**绝不静默按新价放行**——正是本刀要封死面）；`price_missing`→启动期 configureRagCostGovernance :75-77 对表断言已保正常路径零新增拒绝面·运行期仍兜 RagCostError 确定性码（如实登记臂）；
- **发布序注记（rev2 登记·席2-N2）**：先码后价——旧 7 参口创建的预留在新码+切换后 cfg.priceRevision 下同键重放≠捕获 revision→`binding_mismatch` fail-closed（0083:52-56 语义）·**正是本刀封死行为**：换价/换 revision 须在新码就位后执行·防部署窗口内重放被确定性拒绝误判为事故；
- **settle 金额恒等约束**：绑 revision 后同输入同 revision 同价——结算数值语义零变化（Ban 计费语义改动·§5）；observe 模式（:106-109）零触。

**④ 进程内限流/熔断残留清理**（红事实 D·零行为影响确认在案）：

- **删两件**：rate-limit-model.ts（162 行·rev2 勘误）+circuit-breaker.ts（131 行）整文件；index.ts :196-201 中**删 5 行=:196/:197/:198/:200/:201**（**:199 failoverModel 活导出零字节零触**·rev2 共识勘误·Ban 见 §5）；metrics.ts :66 注释/:74 METRIC 键/:122-123 基线播种两行；
- **删专属测试+gate**：breaker.proof.ts 整卷+gate 两行（根 package.json :447 `breaker:prove`+packages/ai-runtime/package.json :18 `prove:breaker`·rev2 勘误·两名分写勿混）+model-cost-governance.proof.ts rateLimited 臂（:10 import+:120-133）+metrics.proof.ts breaker 断言面（**rev2 勘误重圈**：:11/:17 legacy gauge 字面量零触勿删·:25-31/:32-33/:50/:53-54 混排原位编辑保 refund/jobs·:34-35 纯 breaker 随删——逐行形见 §0.1 #16）——**断言适配如实登记不洗**；
- **删死告警+白名单行**：alert.rules.yml :102-105+alerts-lint.mjs :28-29 注释行与白名单行（alerts-lint 自身门重跑原值）；
- **死 env 清理幅度=裁决项④**：(a) compose.prod.yml :36-37+worker.env.example :119-121+compose.ha.yml :69-70+api.env.example :48-49 四处一并删（残留清干净·**推荐**·rev2 补全文件清单=§0.1 #18/#19/#21/#22）(b) 留 env 样例只删代码（保守·但死样例继续误导部署）；
- **SSOT 随批更新（docs:check 绿门要求·措辞最小·rev2 N5 句簇圈界）**：current-runtime-truth.md **:118 后半句簇**删 MODEL_MAX_CONCURRENT/MODEL_RPM 活旋钮表述+**「当前模型路由边界」段（:123 标题）:125 两句**（「当前的 default/fast 文本 client 各自使用进程内 admission」+「因此 MODEL_MAX_CONCURRENT/MODEL_RPM 不是所有百炼能力共享的全局上限」）一并改共享权威事实；model-invocation-reliability.md :35/interview-question-bank-reliability-security.md :195/:333 文件引用随批改指（共享权威/历史归档）；interview-service.ts :205-206/:216-217 注释零字节保留（禁令语义仍真——模块既删禁令自满足·**不改注释免扩触面**）；errors/index.ts :5 注释零字节（历史沿革叙述非引用）；
- **共享权威零触**：0120/model-admission.ts/invoke admit 相位/`model_circuit_open` 系决策码全零字节（§3-1）。

**零计费语义改动总纲**：settle/release/dispatched/unknown 四件管道、价格本写入（:66-77）、预算检查、结算金额计算全零字节——③只把「选哪行价」从隐式 latest 显式为配置 revision，同输入同 revision 分币不变。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **新 proof（`prove:ag24-langfuse-model`·scripted tracer/recordingTracer+fixture·隔离 PG 仅裁决③臂需·est live=0）**：
   - **model 真名断言**：带 costPolicy 的 invoke→span.model=受控模型名（=plan.cost?.model 对表）→langfuse generation `model` 字段=真名（**≠service 名负证**）；G7 臂 actualModel 在手时=回显值（裁决①(a)）；prepare 拒绝臂→span.model undefined→generation model=service fallback（现状降级零回归臂）·**cached 臂按裁决⑤走（⑤(b) 中选则改断言 span.model=plan.cost?.model——rev2 勘误：:713 处 plan.cost?.model 零读可得）**；
   - **cached 三态断言**：usage.cachedInputTokens=值→usageDetails.input_cached=值；显式 0→挂 0；undefined→**键不存在**（≠0·cost1 铁律钉）；metadata 无 prompt 原文/答案键（脱敏负证）+promptVersion 行原值（AG-19 面零位移）；
   - **cost 标量断言**（裁决②(a)）：终局 ok span（:1097）metadata.settledCostMicroCny=账本结算值对表；中间 outcome 臂=缺省不挂；
   - **RAG revision 绑定断言**（隔离 PG·0083 口）：enforce 预留后 ai_cost_reservation.price_revision=cfg.priceRevision（**≠NULL 负证**）；同键换 revision replay→binding_mismatch→RagCostError 确定性拒绝；价格本缺行→price_missing 臂；**结算金额恒等对照臂**（同输入同 revision·绑前后 reserved/settled microCny 逐分相等·settleAiCost 零触原值）；observe 模式零触臂；
   - **G7 回退估算断言**：图片数组形→回退估算=拼接字符量/4（**≠数组元素数负证**·塌缩 64 下限负证）；无图字符串形→修正前后恒等（零位移）；reserveFor 消费值随动对表·**含第三消费点 model-client.ts :710**（usage 缺席 fallback `inputTokens: promptTokens ?? costPolicy?.maxInputTokens ?? estimatedInputTokens`——:650 修正后数组形该值随动·rev2 补入断言面）；
   - **残留删除断言**：全场 `rg "rateLimitedModel|circuitBreaker"` 生产面零命中（docs/历史卷引用豁免名单如实登记）；metrics `render()` 无 `model_circuit_breaker_open_total` 序列；alerts-lint 白名单对表无该行且门绿；gate 清单无 `breaker:prove`（根 package.json）且无 `prove:breaker`（ai-runtime package.json·rev2 勘误两名分写）。
2. **既有门回归**：`model-usage-cache-observe`（cost1 面·:524-528/:713/:935/:1025 零触原值）+**ai-runtime 聚合门 `prove`**（packages/ai-runtime/package.json **:14**·首段 test/runtime-kernel.proof.ts·rev2 勘误：原引 `model:prove` 门全仓不存在 rg EXIT=1）——**语义翻转申明（rev2·席2-N4）**：runtime-kernel.proof.ts **:227** span 键集钉死断言+**:246** metadata 键集钉死断言+**:247-248**「model 字段仍=service 名（AG-24 面零位移）」三处既有断言本刀后**须翻转**（span 键集加 model/cachedInputTokens·model 断言改真名）——**这是语义翻转非纯 additive·如实登记**+`model-op02:prove`（共享权威原值）+`rag-cost:prove`（db ai-cost）+`rag-cost-config:prove`+`rag-cost-runtime:prove`+worker `prove:model-cost`（rateLimited 臂删后原值臂全绿）全 EXIT 原值；`metrics:prove` 适配臂如实登记不洗；**`provider-egress:prove`（根 package.json :36·经 scripts/provider-egress-inventory.mjs :129 读 docker/compose.prod.yml+docker/env/worker.env.example——死 env 删后原值绿·rev2 补）+`env-schema:prove`（根 :445·rev2 补）**；`prove:model-cost-metrics`（worker）基线同红承登纪律照 ag19 §9-2-3 先例（qbank-release-sweep b20ee350 既存面·blob `89913f128d13` 恒等亲证·非本刀面零字节）如实重跑登记不修。
3. **迁移门**：裁决③(b) → `migrate:prove`+`drift:prove`（链含 0182·零漂移）；③(a) → 链原值零新迁移。
4. **docs:check** EXIT=0（SSOT 随批更新后恒绿）+ **typecheck** `turbo typecheck` 全绿。

## §3 范围外（边界清单·越界即 FAIL）

1. **共享准入/熔断权威本体零触**：0120 迁移/model-admission.ts/invoke admit 相位/`model_circuit_open|model_circuit_half_open` 决策码——AG-01（准入拒绝去终态化）与成本轨⑤ AG-08（熔断键按端点）另刀面；本刀④只删被收编的进程内残留。
2. **byteEstimate/估算器本体零触**：G7 :650 只修 userContent 数组 `.length` 一处语义——AG-12 CJK 加权估算器/AG-11 估算结算对齐（EG-B2）零触。
3. **ai_model_fee_ledger 对账/unknown 清算**（EG-B3/EG-B1）另议；reserveAiCost 7 参旧口不 REVOKE 不删（历史迁移兼容·0083 REVOKE 纪律推广归后继）。
4. **计费语义零触**：settle 金额管道/价格本写入/预算检查零字节（§1-③ 恒等约束）。
5. **AG-19 promptVersion 面零触**：langfuse-v5 :76-77/invoke registryPromptVersion/model-invocation.prompt_version 全零字节。
6. **Langfuse 侧外部操作零触**：模型定价表配置/看板搭建=Langfuse 项目设置（非本仓交付物·裁决②(c) 中选时的 safeName 归一注册注记见 §1-①）；trace span **名称**（`meetwise.model.<service>`）零字节。
7. **est live=0**：零真实模型外呼·零生产操作·零 secrets（§6）。

## §4 依赖

- **零硬前置刀**：四子项全部就地可修。上游已落并在基线：AG-19（promptVersion 面·互认零触）/ag-cost1（cachedInputTokensOf 观测面·本刀②沿其出席性语义）/MODEL-OP-02（0120 共享权威·本刀④前提）。正交面：AG-01/AG-08（共享权威演进·零文件交点）·成本轨②③④（0177 面+估算器·零交点）·先落后落互不阻·照 §0 重 pin。
- **下游**：成本轨⑤（AG-08 熔断键按端点）以共享权威为面·与本刀残留删除正交（删的是死代码非权威）；Langfuse 成本看板消费本刀真名+cached+cost 数据·为数据消费面非交付物；EG-B4 双轨封死后·RAG 与文本两账面同遵 0083 原则。

## §5 Ban 列表 + pins（沿 ag19/ag-cost1 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 动共享准入/熔断权威本体（0120/model-admission.ts/invoke admit 相位/决策码零字节·§3-1）；**Ban 删 index.ts :199 failoverModel 活导出行**（interview-service.ts:9 import+interview-service.ts:227 `failoverModel([primary, backup])` 主链+model-cost-governance.proof.ts:10 消费——删则 import 丢名编译红·I6 同形事故·rev2 共识增补）；Ban 把 cachedInputTokens 缺席记 0/usageDetails 缺席挂 0（缺席≠零沿 cost1·undefined=键不挂）；Ban usageDetails 自由键名（cached 键=SDK 约定 `input_cached`·禁自造）；Ban span 带自由字符串 model（值域⊆受控策略模型名∪G7 供应商回显∪service fallback·禁调用方注入）；Ban metadata 增非标量（脱敏铁律 :4·prompt 原文/简历/答案绝不外流）；Ban 改 RAG 结算/release/dispatched/unknown 语义与金额管道（③只绑预留·settleAiCost 零字节·结算数值恒等约束）；Ban binding_mismatch 静默按新价放行（换 revision replay 必须 fail-closed 确定性拒绝）；Ban 顺手修 byteEstimate/CJK/AG-11/AG-14 口径（§3-2）；Ban 动 trace span 名称与 AG-19 promptVersion 面（§3-5/§3-6）；Ban 删共享权威断言或放松 model-op02 门（残留删除只删残留专属臂·权威面臂原值）；Ban 真实模型外呼（est live=0·scripted+隔离 PG 形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/隔离真迁移 PG·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=scripted model/recordingTracer+fixture usage 载荷+隔离真迁移 PG（仅③绑定臂·`assertIsolatedTestTarget` 护栏沿 0119/ag19 先例门形）；回归门=既有 prove 原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag24-langfuse-model-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove·rev2 修订后复扫仍零命中）。五类标记词不复抄卷内（避免自匹配·沿 ag19/ag-cost1 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（若裁决③(b)·迁移号 0182 全场空闲重证随立项核验）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①span.model 源优先序**：(a) G7 `actualModel`（供应商回显）优先→缺省 `plan.cost?.model`（与 claim :706 同源）→再缺省 undefined→Langfuse fallback service 名（归因最真·值域受控·**推荐**）(b) 仅 `plan.cost?.model`（实现最简·G7 回显不进 span）。
- **②成本上报形**：(a) metadata 标量 `settledCostMicroCny`（账本权威值·零汇率换算·终局 ok span（:1097）发射前 settledCost 已就绪·OK 臂 :1039-1071 亲证·**推荐**·rev2 勘误：原引 :942-969 系 known_executed 失败臂）(b) Langfuse costDetails/calculatedTotalCost 显式 USD 成本（价格表+汇率语义引入·重）(c) 不显式报成本·靠 ① 真模型名让 Langfuse 侧定价自算（本仓零码·依赖外部配置非闭环·若中选·safeName 归一注册注记见 §1-①）。
- **③RAG 绑定过程选型**：(a) 复用 0083 现成 9 参 `ai_cost_reserve_text_scoped` **只绑预留**（maxOutputTokens=0·GRANT 在案 0083:146·零新迁移·binding_mismatch/price_missing 语义白得·**settleAiCost 原样零字节**·**推荐**·rev2 定谳删原「+text settle」表述）(b) 新建 0083 风格 embedding 专属预留函数（迁移 0182·input-only 语义显式·新触面新迁移）。
- **④死 env 清理幅度**：(a) compose.prod.yml :36-37+worker.env.example :119-121+compose.ha.yml :69-70+api.env.example :48-49 四处随码一并删（残留清干净·防死样例误导部署·**推荐**·rev2 补全）(b) 只删代码留样例（保守）。
- **⑤cached 臂（幂等命中）model 缺省**：(a) fallback service 名如实登记（零新查询·降级路径现状保留·**推荐**）(b) cached 臂随 `plan.cost?.model` 携带真名（**rev2 勘误重述**：invoke.ts :713 `span(0,'cached',0)` 处 `plan` 就在作用域·`plan.cost?.model` **零读取可得**——原 (b)「cached 臂回读 ai_model_invocation.model」前提失真废除·本题实为「无 result 臂是否随 plan.cost?.model 携带真名」）。

## rev2 勘误席处置摘要（2026-10-13·pre-exec 双审两外席 FAIL findings 全数处置）

修订纪律执行：所有新锚落笔前 Read/awk/rg/git ls-tree 亲证·零虚构锚·除 findings 指明处 §0-§8 零改·STOP=`draft:awaiting_pre_exec_dual` 维持·⛔push·⛔改任何代码·docs-only 恰 1 .md。

| # | finding | 处置 | 落点 |
|---|---|---|---|
| 1 | B-共识1 §1-③(a)「+结算切 text settle」与红事实 B/§3-4/§5 Ban 自相矛盾 | **采纳席2 方案（协调方裁决）**：③只绑预留（7 参→9 参 0083 口）·settleAiCost 原样零字节·「结算切 text settle」全卷删除·红事实 B 机制句同步改写 | §1 红事实 B 尾句/§1-③(a)/§8-③(a)（§3-4 零动·§5 随 #2 同行增补 settleAiCost 零字节） |
| 2 | B-共识2 index.ts :199 failoverModel 活导出误入删除面 | **采纳**：改「删 5 行=:196/:197/:198/:200/:201·:199 零字节零触」+§5 增 Ban（消费点三处全亲证：interview-service.ts:9/:227·model-cost-governance.proof.ts:10） | §0.1 #11/§1-④/§5 Ban |
| 3 | 席1-B1 0035:68 ORDER BY 不存在（0035 全文 54 行） | **采纳（双 pin）**：0034:29 现行函数体（0034 OR REPLACE 取代 0033·:1-3 头注自证）+0033:115 原件；GRANT :49-51→**:50**；顺证 0035:14-21 scoped 口委托链 | §0.1 #7 |
| 4 | 席1-B3 settle 消歧 | **并案共识1**（同上） | 同 #1 |
| 5 | 席1-E1 rate-limit-model.ts 162 行非 163 | **采纳**：实测 `wc -l`=162·全卷替换（**实测 4 处非 finding 所记 3 处**·全改） | §0.1 #9/§0.2 表/红事实 D/§1-④ |
| 6 | 席1-E2 内层门名 breaker:prove vs prove:breaker 混写 | **采纳**：根 package.json:447=`breaker:prove`·ai-runtime package.json:18=`prove:breaker` 分写（两处亲证） | §0.1 #15/§1-④/§2-1 |
| 7 | 席1-E3 `model:prove` 门全仓不存在 | **采纳**：rg 全仓 EXIT=1·改 ai-runtime 聚合门 `prove`（package.json:14·首段 test/runtime-kernel.proof.ts） | §2-2 |
| 8 | 席1-E4 invoke.ts :59-66→:74 | **采纳**：:59-66 实为 estimateInputTokens 注释段·cachedInputTokens 恰在 :74 | §1-② |
| 9 | 席1-E5 settledCost :942-969 系失败臂 | **采纳**：改 OK 臂 :1039-1071（:1039 声明/:1047 赋值/:1067-1070 消费）+终局 ok span :1097；:942-969 实为 known_executed 失败臂（:976/:980 span） | §1-②(a)/§8-②(a) |
| 10 | 席1-E6 worker.env.example 注释 :118/键值 :119-120/:121 空行 | **复测否证·零文本改动**：Read+awk 双工具实测 :118=`WORKER_INTERVIEW_GLOBAL_INFLIGHT`（活旋钮）/:119 注释/:120-121 键值/:122 空行——**现锚 :119-121 恒等正确**·finding 数字整体偏 1·若照改将误删活键·仅在 #19 加防误删注记·**遗留争议如实上报** | §0.1 #19（仅加注）/卷尾争议登记 |
| 11 | 席1-E7 0083 :66-72/:101-123 ±2-3 行微差 | **采纳（亲证实 pin）**：price_missing 块=查价 :67-68+臂 :69-72（块 :66-72）·binding_matches 实起 :103（:101-102 注释） | §0.1 #8 |
| 12 | 席2-B3 死 env 漏 compose.ha.yml:69-70 与 api.env.example:48-49 | **采纳**：增锚 #21/#22（blob cea9c4d30ae0/c303ddb08320 亲证）+裁决④两处选项清单补齐+红事实 D ④死 env 面补全 | §0.1 #21/#22/红事实 D/§1-④/§8-④ |
| 13 | 席2-B4 metrics.proof 臂行号误钉（:11/:17 legacy gauge 零触·:26/:54 混排须原位编辑） | **采纳（按亲证重圈）**：:11/:17 legacy gauge 字面量零触勿删·:25-31/:32-33/:50/:53-54 混排原位编辑保 refund/jobs·:34-35 纯 breaker 随删 | §0.1 #16/§1-④ |
| 14 | 席2-E1 红事实 B「在途预留/结算按新价入账」不成立 | **采纳**：机制句改写=新预留按 latest 隐式选价（0034:29·0033:114-115）与配置 revision 脱钩·在途预留/结算读捕获值（0033:113-134·:161·rag-cost-governance.ts:59 自证）·修法方向不变 | §1 红事实 B（全段） |
| 15 | 席2-E2 裁决⑤假两难（:713 处 plan.cost?.model 零读可得） | **采纳**：⑤(b) 重述为「无 result 臂是否随 plan.cost?.model 携带真名」·「回读账本」前提废除·§1-①/§2-1 cached 臂口径随动 | §8-⑤/§1-①/§2-1 |
| 16 | 席2-E3 §2-1 G7 断言补 :710 第三消费点 | **采纳（入断言面）**：model-client.ts:710 usage 缺席 fallback inputTokens=estimatedInputTokens 亲证·:650 修正后随动 | §2-1 G7 断言 |
| 17 | 席2-E4 §2-2 回归门补 provider-egress:prove 与 env-schema:prove | **采纳**：provider-egress:prove（根 :36·inventory 脚本 :129 读两 env 面）+env-schema:prove（根 :445）亲证补入 | §2-2 |
| 18 | 席2-N1 safeName 改写含 / 与 : 的 id | **采纳（登记注记）**：②(c) 中选时 Langfuse 定价表须按 safeName 归一名注册 | §1-①注记/§3-6/§8-②(c) |
| 19 | 席2-N2 发布序注记：先码后价 | **采纳（登记注记）**：binding_mismatch fail-closed=本刀封死行为·换价须新码就位后执行 | §1-③注记 |
| 20 | 席2-N4 runtime-kernel.proof :227/:246/:247-248 既有断言须翻转 | **采纳（语义翻转申明）**：§2-2 点名三断言翻转·非纯 additive | §2-2 |
| 21 | 席2-N5 current-runtime-truth.md 陈旧句簇圈界 | **采纳**：:118 后半+「当前模型路由边界」段（:123 标题）:125 两句一并圈入更新范围·防 EXEC 自由发挥 | §0.1 #20/红事实 D ⑤/§1-④ |
| 22 | 席2-N8 ②(a) 管道形如实申明 | **采纳（实测收窄登记）**：InvokeSpanFn 扩参（:542 签名亲证）·span 调用点 rg 实测 **19 处**（:678…:1097·其中 :916-:1097 结算臂段 9 处=finding「约 9」实测定位） | §1-②申明 |

**复测差异登记（finding 数字 vs 亲测）**：席1-E1「三处」实为 4 处（全改）；席2-N8「约 9 个」实测全卷 19 处·结算臂段恰 9 处（两数并登）；席1-E6 否证（见 #10·唯一遗留争议）。

## §9 EXEC 附记（2026-10-13·EXEC 席施工收官随翻·§0-§8 原文零改·裁决行使/门表/自检全呈报·⛔push）

**并线+重 pin**：merge `4f8b7402`（--no-ff·双亲 `915000bb`+`626ac3cc`·零冲突·主线两笔=`b7dcce89` SSOT 收口+`626ac3cc` gitleaks 治理）。§0.1 blob 22 锚并线后逐条 `git ls-tree` 对表=**22/22 恒等零漂**（无重锚无勘误注需求）。随卷两条协调方授权复审 P2 登记性勘误已落：§0.1 #11「七行」→「六行」；处置表 #1 括注改「§3-4 零动·§5 随 #2 同行增补 settleAiCost 零字节」。

**裁决项①-⑤行使落值（四项按推荐行使+⑤(b)（§8-⑤ 卷内合法选项·非推荐项·如实呈报）·逐项落点）**：

- **①(a) 行使**（actualModel→plan.cost?.model→undefined→Langfuse 侧 safeName(service) 降级）：`trace.ts` ModelCallSpan 增 `model?/cachedInputTokens?/settledCostMicroCny` 三可选标量（脱敏铁律不破·注释在位）；`invoke.ts` :542 InvokeSpanFn 扩可选参 `extra?: InvokeSpanExtra { model?; settledCostMicroCny? }`·span 闭包 `model: extra?.model ?? spanCostModel`（spanCostModel=plan 绑定后捕获·**与 claim 相位同源同值**·cost 身份 claim 后冻结不可换轨故全 invocation 恒真；prepare 声明臂在 plan 绑定前发射→undefined→现状降级零回归）·19 调用点中**仅终局 ok 臂 :1097 携值** `{ model: result.actualModel, settledCostMicroCny: policy ? settledCost : undefined }`（结算臂段其余 8 处 extra 缺省零字节·「触面按 9 处估」如实落窄）·cached 臂 :713 **零改零读携真名**（闭包捕获=裁决⑤(b) 行使）。
- **②(a) 行使**（metadata.settledCostMicroCny 账本权威值）：`langfuse-v5.ts` metadata 白名单增 `settledCostMicroCny: span.settledCostMicroCny ?? null`（缺省=null 占位沿 promptVersion 同形·缺省≠零）；usageDetails 增 **`input_cached`** 条件挂键（`span.cachedInputTokens !== undefined` 时挂·undefined=键不出现·显式 0=挂 0）；:173 `model: safeName(span.model ?? span.service, 'unknown')`；span **名称** `meetwise.model.<safeName(service)>` 零字节（源钉断言在证）。
- **③(a) 行使**（复用 0083 九参口只绑预留）：`apps/worker/src/rag-cost-governance.ts` 预留 `reserveAiCost`(7 参)→`reserveAiTextCost`(9 参 0083 口)·`priceRevision: cfg.priceRevision!`·`maxOutputTokens: 0`（embedding 无输出·0083 input+output≥1 容忍）；settleAiCost/release/dispatched/unknown 四件+价格本写入+预算检查**零字节**（git diff 亲证）；`binding_mismatch`→`rag_cost_binding_mismatch`/`price_missing`→`rag_cost_price_missing` 确定性拒绝由既有 `rag_cost_${decision}` 通用映射自然承载（注释登记 fail-closed 语义·绝不静默按新价放行）。
- **④(a) 行使**（四处死 env 全删+残留清干净）：两残留件整删 `circuit-breaker.ts`(131 行)+`rate-limit-model.ts`(162 行)+`breaker.proof.ts`(138 行)；index.ts :196-201 删 5 行**保 :199 failoverModel 活导出**（零字节·新 proof 断言在证）；metrics.ts :66 注释/:74 METRIC 键/:122-123 基线播种；gate 两行（根 package.json `breaker:prove`+ai-runtime `prove:breaker`）；alert.rules.yml ModelCircuitBreakerOpen 完整告警块（**实为 :102-111**·§0 锚 :102-105 系 expr 行微差·整块删除防 YAML 残臂）+alerts-lint.mjs :28-29 注释与白名单行；死 env 四处（compose.prod.yml :36-37/compose.ha.yml :69-70/worker.env.example :119-121/api.env.example :48-49·**:118 WORKER_INTERVIEW_GLOBAL_INFLIGHT 活键保留**负证在证）；SSOT 三文件随批（current-runtime-truth.md :118 后半+:125 两句改共享权威事实·model-invocation-reliability.md :35+interview-question-bank-reliability-security.md :195/:333 改指 model-admission.ts）；interview-service.ts :205-206/:216-217 注释与 errors/index.ts :5 **零字节保留**。
- **语义翻转（§2-2 清单全翻·非 additive 如实登记）**：runtime-kernel.proof :227 span 键集（+model/cachedInputTokens/settledCostMicroCny 三标量位）+:246 metadata 键集（+settledCostMicroCny）+:247-248（「model 字段仍=service 名」→「AG-24 翻转：成本标量逐字透传·model 真名走 generation 顶层字段」）；同段新增 AG-24 断言臂五条（裁决①(a) 回显优先/无回显=plan.cost?.model 对表/裁决⑤(b) cached 臂真名+非结算臂缺省不挂/prepare 拒绝臂降级零回归/settledCostMicroCny=账本 500 micro 对表·价格本 seeded 沿 model-cost-governance 先例）。

**新 proof（§2-1 `prove:ag24-langfuse-model`·20 断言全绿·协调方门矩阵未单列、按「§2 门表全跑」口径行使·呈报）**：`packages/ai-runtime/test/ag24-langfuse-model.proof.ts`——①Langfuse 映射面（成本标量两态/脱敏负证/model 真名与 input_cached 与 span 名称三源钉/invoke 闭包三透传+签名扩参源钉）②G7 :650 数组形修+**:710 第三消费点随动**断言（fetch-stub 捕获 wire body 实算：带图=各段拼接字符量/4·≠数组元素数旧公式·≠64 塌缩；无图字符串形恒等零位移）③残留清理六面源证（两残留件不在树/导出撤五留一/metrics 键与基线序列零命中/门名两撤+新门在/死告警白名单撤/四处死 env 撤+活键保留/共享权威零触负证）。断言面分工呈报：span 三档真名/cached 在手/cost 对表臂在 runtime-kernel 可观测段（PG 载荷），Langfuse 映射/G7/残留面在新 proof——两面分工不双维护。

**既有 proof 适配（compile-forced/翻转登记·不洗）**：metrics.proof（:26-35/:50/:53-54 原位编辑保 refund/jobs·:11/:17 legacy gauge 零触·照 §0.1 #16 重圈）；model-cost-governance.proof（:10 import 去 rateLimitedModel 保 failoverModel+:115-140 RPM 臂整删=§0.1 #17+**:178-190 faultGate 臂去 rateLimitedModel 包裹**（该臂第二消费点卷未点名·删模块后 compile-forced·语义保持=畸形 cost policy fail-fast+零外呼·如实登记））；model-usage-cache-observe.proof :170 计数钉 1→**3**（词面三处=型面一处+闭包透传行键值两处·语义翻转登记）；ag19-prompt-version.proof :298-299 源钉翻转（「AG-24 面零位移」→「AG-24 已落面」·AG-19 promptVersion 语义零位移·门 EXIT=0 亲证）。

**门矩阵 EXIT 全表（17 门·收据=ai-docs/delivery/receipts/ag24-langfuse-model/）**：

| # | 门 | EXIT | 备注 |
|---|---|---|---|
| 1 | ai-runtime 聚合 prove（首段 runtime-kernel+claim-join-orphan+diag-honesty+**末段 ag24 新 proof**） | **0** | 81 PASS·净库单轮（01）·聚合链末段 additive=门收紧非放松 |
| 2 | model-op02:prove（隔离 runner） | **0** | 25 PASS·LOCAL_ISOLATED_PROOF_RECEIPT 在案（02） |
| 3 | metrics:prove | **0** | 适配后全绿（03） |
| 4 | rag-cost:prove（db ai-cost） | 1 | **既存环境绑定红**：`destructive_proof_requires_e2e_isolated`（云隔离靶门·本机无云凭据·守卫先于一切 proof 逻辑·本刀对 db ai-cost proof 零字节零触）（04） |
| 5 | rag-cost-config:prove | **0** | 启动门原值（05） |
| 6 | rag-cost-runtime:prove | 1 | **既存基线红·B 侧收据+A 侧机制/叙述证据**：runMigrations 账本调和（清单须覆盖账本全前缀）与 ≥0033 过滤链互斥·空库断 0011 `ai_invocation_trace`·base 版 proof 同错（一次性容器两形均试·内联探针实证=A 侧叙述·无独立原始收据件）（06）·**绑定臂行为臂级收据（06b·post 勘误补登）**：一次性容器全链 183 迁移后复跑 8 臂 PASS（price_revision=cfg/binding_mismatch/price_missing/200 micro 恒等/observe 零触/同 revision 兼容重放=rag_cost_settled） |
| 7 | prove:model-usage-cache-observe | **0** | 28 PASS·计数钉 1→3 语义翻转登记（07） |
| 8 | breaker:prove（根）/prove:breaker（ai-runtime） | 已删 | rg 零命中+新 proof 断言在证（收据 01 §③） |
| 9 | worker prove:model-cost | **0** | 10 PASS（09） |
| 10 | worker prove:model-cost-metrics | 1 | **既存基线红**：qbank-release-sweep.ts:79 TransformError（§2-2 预判承登·零触）（10） |
| 11 | ai-runtime prove:model-cost | 1 | **既存基线红·B 侧收据+A 侧机制/叙述证据（08b 为叙述件）**：base 净库同红「RPM 排队超时」+「迟到 lease 自释放」两臂·本刀删 RPM 臂后余既存 lateAdmission 臂一红=非本刀回归（08/08b） |
| 12 | ag19-prompt-version:prove（隔离 runner） | **0** | 47 PASS·源钉翻转后门值零变亲证（11） |
| 13 | provider-egress:prove | 1 | **既存基线红**：5 adapter_consumer_unregistered+4 environment_reference_not_found（`r4-p-*` 失效 env 引用）+4 environment_reference_source_invalid+32 environment_reference_unregistered+1 transport_source_unregistered·合计 46 行均既存不在本刀 diff（席2 复核口径「约 18 unregistered」系近似·以收据 12 原始行计数为准）·本刀新文件 consumer+4 env 引用已按 test-fixture 形注册入 manifest·本刀条目零错误（12） |
| 14 | env-schema:prove | **0** | 22 断言（13） |
| 15 | turbo typecheck --force | **0** | 3 任务（14）·ai-runtime/worker 无 typecheck 任务·EXEC 补跑裸 tsc A/B：21=21、1=1 **零新增**（本刀两处新类型错即改：model-client :655 `'text' in part` 收窄）·post 勘误席复跑补收据（17·tip 侧 ai-runtime=21/worker=1 与 A/B 计数恒等·worker 红单=qbank-release-sweep.ts:79 既存） |
| 16 | docs:check | **0** | manifest 随批后复扫仍绿（15） |
| 17 | alerts:lint | **0** | 24 规则·白名单 0·原值（16） |

**markers 五类**：五类之一（任务占位词类）1 命中=`interview-question-bank-reliability-security.md` :383 既存叙述句（「安全真实模型评测仍在该占位态」原文·本刀 diff 未触该行·词面沿 i6-239 组装形此处不复抄防自匹配）·其余四类 0 命中·零新增。

**est live=0**：全 proof=scripted model/fetch-stub/隔离容器（model-op02+ag19 走 run-e2e-isolated·收据 `.tmp/isolated-proof-receipts/` 两笔）·零真实 provider 外呼·零 secrets·零消耗·pins 十一值零翻（脚注 actualSpendCny=null 同源）。

**陷阱自检 13 条**：①span.model 值域受控（⊆受控策略模型名∪G7 供应商回显∪service fallback·闭包仅取 extra（invoke 内部 actualModel）∪spanCostModel·禁调用方注入）②缺席≠零两态分开（input_cached 条件挂键+settledCostMicroCny null 占位·负证断言在证）③usageDetails 键名=SDK 约定 `input_cached` 禁自造④index.ts :199 failoverModel 活导出零字节保留（消费点 interview-service.ts:9/:227+proof :10 在证）⑤settle/dispatched/release/unknown 四件+settleAiCost 零字节（git diff 亲证）⑥binding_mismatch fail-closed 不静默放行（0083 replay 判序先于 status 短路·绑定臂实测 rag_cost_binding_mismatch·收据 06b）⑦共享权威零触（0120/model-admission.ts/invoke admit 相位/model_circuit_* 决策码零字节·负证断言在证）⑧AG-19 promptVersion 面零触（langfuse-v5 :76-77/registryPromptVersion/metadata.promptVersion 行原值·ag19 门 47 PASS）⑨span 名称 meetwise.model.<service> 零字节（源钉在证）⑩计费语义零改（结算金额恒等臂 200 micro 对表·价格本写入/预算检查零字节·绑定臂实测·收据 06b）⑪脱敏铁律零扩（三新增标量皆数值/受控名·metadata 白名单形制 additive·负证在证）⑫interview-service 注释与 errors/index.ts :5 零字节保留（禁令语义仍真·免扩触面）⑬est live=0（零真实外呼·零 secrets·零生产操作）。

**偏离任务书清单（全呈报）**：①新 proof+门接线落地（§2-1 点名·协调方矩阵未单列·按「§2 门表全跑」行使）②聚合 prove 末段 additive（收紧）③四处既有 proof 语义适配（metrics/模型费用 proof 双臂/计数钉/ag19 源钉·各自登记）④faultGate 臂去 rateLimitedModel 包裹（卷未点名的第二消费点·compile-forced·语义保持）⑤alert.rules 删除块 :102-111（§0 锚 :102-105 微差勘误·整块防残臂）⑥provider-egress manifest 注册本刀新文件一条 consumer+四条 env test-fixture（登记纪律）⑦五处基线红承登（rag-cost:prove/rag-cost-runtime:prove/provider-egress:prove/model-cost-metrics/ai-runtime model-cost·A/B 或机制证据）⑧本地测试基建动作（dev PG 清 3 张史前遗留表+全链迁移+app_role schema USAGE 恢复+一次性容器起拆·非代码非 SSOT）⑨metrics.proof 段注释随臂更新。

**post 勘误席处置摘要（2026-10-13·post-prove 双审席1 FAIL 证据链措辞 E1-E4+席2 E2/N5 全数处置·零码动 docs+receipts only·STOP 维持 `executed:awaiting_post_prove_dual` 不翻）**：

| # | finding | 处置 | 落点 |
|---|---|---|---|
| E1（P1） | 自检⑥⑩ 称「绑定臂实测」但收据 06 红于 runMigrations 先于一切臂=无臂级收据 | **补真收据**：一次性容器（pgvector/pgvector:pg16·run-e2e-isolated 同形）全链 183 迁移后复跑绑定臂 8 臂 PASS EXIT=0（含同 revision 兼容重放=rag_cost_settled 增补对照臂）；探针=临时 harness 不入卷·与被测文件唯一机制差异=先全链迁移再复刻臂（≥0033 过滤与账本调和互斥=06 红因本身） | receipts/06b-rag-binding-arms-verified.log·自检⑥⑩·门表 row 6 |
| E2（P2） | §9 头/尾注「五项/五件全按卷推荐行使」不实（⑤(b) 非推荐项） | **措辞勘误**：改「四项按推荐行使+⑤(b)（§8-⑤ 卷内合法选项·非推荐项·如实呈报）」/尾注「按推荐行使·唯①内 cached 臂携⑤(b)」 | §9 裁决落值头·卷尾 exec 注 |
| E3（P2） | 门表 row 6/row 11「A/B 亲证」言过其实（A 侧系机制/叙述证据·08b 为叙述件非原始收据） | **措辞勘误**：改「B 侧收据+A 侧机制/叙述证据（08b 为叙述件）」·row 6 并附 06b 臂级收据 | 门表 row 6/row 11 |
| E4（P2） | 裸 tsc A/B（21=21/1=1）无收据件 | **补收据**：post 勘误席 tip 侧复跑 ai-runtime=21/worker=1 与 A/B 计数恒等·原始输出落卷 | receipts/17-bare-tsc-ab-rerun.log·门表 row 15 |
| 席2-E2（P2） | 门 12（provider-egress·门表 row 13）红面描述不全 | **红面补全**：+4 environment_reference_source_invalid+32 environment_reference_unregistered+1 transport_source_unregistered（席2 近似记「约 18」·以收据 12 原始行 32 行为准·合计 46 行）·均既存不在本刀 diff | 门表 row 13 |
| 席2-N5（P3） | §9 笔误 settledMicroCny | **勘误**→settledCostMicroCny（trace.ts:43 真名在证·§1 内同形字样属 §0-§8 零改保护不触） | §9 ①落值·自检② |

随本摘要 receipts 目录 17 件→**19 件**（06b+17·门表 row 15 与卷尾注计数随动）·门值零翻·代码零字节。

**STOP（post-prove）· `executed:awaiting_post_prove_dual` · alone≠dual**：EXEC 施工+随翻落卷即停·待 post-prove 双审两外席·Ban self-approve·双审后并线序遵协调方。

---

*AG-24 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · rev2 双审 findings 全数处置 · 基线 `feat/mysql-schema-skeleton` @`849a0f19517b` · 分支 `line/ag24-langfuse-model` · 工作树 `meetwise-ag24` · 蓝本=issues-final AG-24 :36/:312-320（:314 部分成立定谳·:319 修法权威·#72/#172/#210）+ EXPERT-REVIEWS §六 :54 EG-B4+§七 :67+:73 + review-log AC-F22 :88/AC-F13 :79 + ag-cost1 卷（cachedInputTokensOf 已落·裁决②「AG-24 归后继」授权面）· 范围=①Langfuse model 真名②cached/cost additive③RAG 预留 0083 revision 绑定（rev2 定谳：只绑预留·settle 零字节）④进程内限流/熔断残留清理（零行为影响确认在案）· 零共享权威触面·零计费语义改动·est live=0 · pins 十一值照抄 · markers=0 · ⛔push 待 pre-exec 双审两外席（Ban self-approve · alone≠dual · Dual PASS ≠ 开工）*

*AG-24 REQUEST **exec** · 2026-10-13 · EXEC 席施工收官随翻（rev2 双审 BOTH PASS+协调方明示授权·⛔push·禁动主线）· **并线**：merge `4f8b7402` --no-ff（双亲 `915000bb`+`626ac3cc`·零冲突·§0 blob 22 锚重 pin 22/22 恒等零漂·两条协调方授权 P2 登记性勘误落卷）· **施工=五件裁决按推荐行使·唯①内 cached 臂携⑤(b)（§8-⑤ 卷内合法选项·非推荐项·如实呈报）**（①span.model 真名归因=actualModel→plan.cost?.model→service 降级+InvokeSpanFn 扩参+cached 臂零读取携真名②settledCostMicroCny metadata 标量+input_cached 条件挂键③RAG 预留切 0083 九参口绑 cfg.priceRevision·settle 四件零字节·binding_mismatch fail-closed④两残留件 293 行+死告警+死 env 四处+gate 两名+SSOT 三文件清干净·:199 failoverModel 零字节保留⑤语义翻转四处 proof 适配+新 proof `prove:ag24-langfuse-model` 20 断言）· **门矩阵 17 门逐门 EXIT 收据**（11 绿 5 既存基线红 A/B 或机制证据承登·1 已删在证·收据=ai-docs/delivery/receipts/ag24-langfuse-model/ 19 件（06b+17 为 post 勘误席补登））· markers 五类零新增（1 既存叙述句注明）· docs:check EXIT=0·turbo typecheck --force EXIT=0+裸 tsc A/B 零新增·est live=0·pins 十一值零翻·陷阱自检 13 条全过·偏离清单九条全呈报（§9）· 停止=**executed:awaiting_post_prove_dual**（待 post-prove 双审两外席·alone≠dual·Ban self-approve）*
