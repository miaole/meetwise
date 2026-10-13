# AG-19 — prompt 版本观测落库刀：invoke spec 带 promptVersion→ai_model_invocation 新列+trace 附带+metric 标签（EXEC REQUEST）

**Status**: `draft:awaiting_pre_exec_dual`（起草席落卷即停·零码动·恰 1 新 .md。开工须预执行双审两外席 BOTH PASS+协调方明示授权。Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push）

**席位**：meetwise 战役 AG-19 起草席（AI 能力复审 P3·Prompt 面·纯观测增强刀）。
**基线**：`feat/mysql-schema-skeleton` @ `aeaf4141ec95`（开工 tip·`git log -1` 实测·docs(ssot) 计费 P2 行翻面）。分支 `line/ag19-prompt-version` · 工作树 `meetwise-ag19`（`git worktree add ../meetwise-ag19 -b line/ag19-prompt-version aeaf4141ec95` 仓根同级·本起草席已立·建前亲证：`git worktree list | grep ag19` 零命中·`git branch -a | grep -i ag19` 零同名）。
**防重对表（亲证）**：`rg -c "ag19" ai-docs/delivery/harness/` → 零命中；`ls ai-docs/delivery/harness/ | grep -i ag19` → 零同名刀卷。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-19（总览 **:31**·条目 **:257-266**·复核结论 **:259 部分成立——落库/打点缺失属实；"catalog 版本号过时"一项不成立：catalog 已标 @deprecated 且零调用方**·源编号 AC-F8 **:261**·file:line **:262**·触发例子 **:263**·用户影响 **:264**·修法 **:265「invoke spec 带上 promptVersion，写入 ai_model_invocation、trace 和 metric 标签」=本刀修法权威**）②同目录 AG-24 **:312-320**（Langfuse model 字段填 service 名等观测小项——**另刀面·本刀范围外 §3-3**）③形制沿 `ag-f-reroll-REQUEST.md`（§0-§8 形制·Ban/pins 同源誊录见 §5）+ `ag-cost1-bleed-observe-REQUEST.md`（同域观测刀先例）。

## §0 现状锚（起草席亲读·base `aeaf4141ec95`·file:line/blob 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 blob 锚表（@`aeaf4141ec95`·`git ls-tree` 实测·12 位短 blob）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/prompts.ts` | `8db00e904cba` | **版本单一真相源**：:2-3 注释原文「落 ai_prompt_versions:每个 service 的 system 指令带 version,可回放/灰度/审计;改 prompt = 升 version,不动调用方」/ :12 `version: string` 字段 / 八 service 版本行 :44(`job.route-classify.v1` p.v2)/:65(quiz v2)/:74(diag v1)/:101(planner v4)/:132(ask v7)/:166(evaluate v6)/:199(vision v2)/:209(report v3) / :220 getPrompt / :230-232 promptVersions() 导出 |
| 2 | `packages/ai-runtime/src/catalog/index.ts` | `4b5dfda49222` | :13 注释「提示词版本（落 ai_prompt_versions…）」/ :27-34 **resolveBinding `@deprecated` 接真模型由 model-operation-registry 统一解析·零调用方**（AG-19 复核「过时不成立」定谳锚·§3-2 零触） |
| 3 | `packages/ai-runtime/src/model-client.ts` | `c4827e8d72f8` | **version 丢弃点①**：:1073 promptedModel `getPrompt(service, vars)` 取 p 后只取 `p.system`+`p.buildData(vars)`→:1075 `modelFor(client, { service, system, userData, images, rag })`——**version 在 seam 边界被丢弃** / :1043-1063 requestDigest（service/system/userData/images/rag/temperature/costPolicy——无 version·**正确**：版本非语义输入） |
| 4 | `packages/ai-runtime/src/invoke.ts` | `172637205d73` | **version 丢弃点②③**：:166 `InvokeSpec` 无 promptVersion 字段 / :662-669 claim 相位 `claimModelInvocation(c, {...})` 16 参无版本位（estimateInputTokens :668=0119 先例同位） / :629 `tracer.record({...})` 不带版本 / :401-421 persistTrace INSERT ai_invocation_trace（service 列在·无版本列） |
| 5 | `packages/ai-runtime/src/trace.ts` | `88f63487f8b1` | :4 脱敏铁律原文「span 只带标量(service/owner/attempt/outcome/latency),绝不带 prompt 原文/简历/答案」/ :15-27 `ModelCallSpan` 无 promptVersion 字段（service/owner/idempotencyKey/threadId/retrieval/attempt/outcome/latencyMs/sources/inputTokens/outputTokens） |
| 6 | `packages/ai-runtime/src/langfuse-v5.ts` | `35db0c325044` | :67-83 `langfuseSafeModelMetadata`（invocationRef/ownerRef/threadRef/outcome/attempt/latencyMs/tokens 等标量集·无版本位） / :166-171 tracer.record——**:171 `model: safeName(span.service, 'unknown')`=Langfuse model 字段填 service 名（AG-24 面·本刀零触）** |
| 7 | `packages/ai-runtime/src/metrics.ts` | `2cd9daf00925` | **metric 无版本维度**：:109 modelUsageCacheFieldPresence / :144 modelCostDecisions 只带 `{decision}` / :145 modelCostSettledMicroCny 无标签 / :157-162 基线循环 `for (const { service } of promptVersions())` ——**promptVersions() 单源喂 service 基线的既有形制（本刀标签维度同源样板）** |
| 8 | `packages/db/src/model-op/model-invocation.ts` | `13ea678c6af2` | :30-51 `ClaimModelInvocationInput`（:50 `estimateInputTokens?: number` 缺省 NULL 注释原文「缺省（旧 seam 未接预算器）落 NULL」=本刀 promptVersion 同形先例）/ :86-105 claimModelInvocation `SELECT ai_model_claim_invocation_scoped($1…$16)` 16 占位 |
| 9 | `packages/db/migrations/0037_ai_model_invocation_durable_claim.sql` | `9916a37e6ae1` | :7-17 ai_model_invocation 建表列集（service text 在·无 prompt_version） |
| 10 | `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a79da` | **补列先例四件套（本刀 0181 同形蓝本）**：:25-33 `ADD COLUMN estimate_input_tokens integer`+CHECK / :36-72 状态机 trigger 把 estimate 加入 **identity-immutable（claim 后不可改）** / :175-195 claim 函数升 16 参（`p_estimate_input_tokens`）/ :252-259 claim INSERT 列集含 estimate_input_tokens·**全 outcome 落库不等成功**（:5-8 注释） |
| 11 | `packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql` | `cbc07c09e1aa` | ai_model_invocation 受控状态机+identity-immutable 语义根（本刀 additive 扩比较行·禁放松既有比较·§5 Ban） |

### 0.2 漂移登记（复核快照=issues-final :262 所引行号 → 现树 `aeaf4141ec95`·全亲读重 pin）

| 复核快照锚（issues-final :262） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| prompts.ts :2-3（注释承诺落 ai_prompt_versions） | :2-3 | 恒等·零漂 |
| prompts.ts :124-127（版本常量区） | 版本常量区整体下移·八 service 行 :44/:65/:74/:101/:132/:166/:199/:209（#213 diag-honesty resumeDiagnosisSystem 组装器增量） | 行漂·**「版本常量存在但未透传」结论不变** |
| catalog/index.ts :13（promptVersion 注释） | :13（+:27-34 @deprecated 零调用方） | 恒等·「过时不成立」定谳在案 |
| 「rg ai_prompt_versions 只命中注释」 | 全场 4 命中：prompts.ts:3/:229 注释·catalog/index.ts:13 注释·diag-honesty-prompt.proof.ts:48 proof 文案——**零写入方零建表迁移零读方** | 恒等·结论不变 |
| AG-24 引 langfuse-v5.ts :169-171（model 填 service 名） | :166-171（:171 `model: safeName(span.service, 'unknown')` 原文恒等） | 微漂·语义不变（AG-24 面·§3-3 零触） |

### 0.3 现势并发登记（强制）

1. **迁移号**：主线迁移末位=**0180**（`0180_topic_shadow_meter.sql`·计费 P2 nail f3968440 已落）——**0181 为起草窗实测首个空闲号**；EXEC 立项时主线+全 worktree 全场重证（0179 撞号先例·BILL2 勘误在案），撞则改号照 0179→0180 勘误形登记。
2. **AG-F 刀（`line/ag-f-reroll`@`2bc4e2bd` REQUEST executed 在途）**：触面=worker seam（adaptive-interview-service）+ai-graphs 节点+domain 分类+lifecycle 投影——与本刀触面（ai-runtime src 五文件+db 迁移+db model-op 一文件）**零文件交点亲证**；其落主线时本刀照 §0 重 pin。
3. 起草窗口内主线 tip=`aeaf4141ec95`（工作树建树时点）·本卷全部 blob/行号即 @该 tip 实取。

## §1 红事实 + 修法

### 红事实 A：版本常量在册·消费链三断（现 pin @`aeaf4141ec95` 全亲证）

prompts.ts REGISTRY 八 service 各带 version（:0.1 #1），`promptVersions()` :230-232 已导出「供落 ai_prompt_versions / 审计 / 灰度对比」——**但版本到观测终端的管道三处全断**：

| # | 断点 | 现链（逐段 file:line） |
|---|---|---|
| ① | **seam 边界丢弃** | promptedModel :1073 `getPrompt(service, vars)` 取 p→只取 `p.system`+`p.buildData(vars)`→:1075 `modelFor({service, system, userData, images, rag})`——version 不在 CompletionRequest 形内，**出注册表即失明** |
| ② | **落库无位** | InvokeSpec :166 无 promptVersion→claim 相位 :662-669 16 参→`ai_model_claim_invocation_scoped` 16 参（0119:175-195）→ai_model_invocation 列集（0037:7-17+0119 补 estimate）**无 prompt_version**——灰度改 evaluate prompt 后分数分布变化无法按版本归因（issues-final :263-264 触发例子/用户影响逐字在案） |
| ③ | **观测无维** | trace.ts :15-27 span 无版本位→invoke.ts :629 record 不带→Langfuse metadata（langfuse-v5.ts :67-83）无版本标量；metrics.ts :144-162 各序列标签集仅 {decision}/{service, presence}——**版本维度全缺席** |

### 红事实 B：ai_prompt_versions 表零写入方·承诺未兑现

prompts.ts :2-3 注释承诺「落 ai_prompt_versions」+catalog/index.ts :13 注释同——**全场 rg 仅 4 命中（三注释+一 proof 文案）·无建表迁移·无写入方·无读方**（0.2 漂移表第四行亲证）。版本可回放/灰度/审计三承诺在持久层与观测层双缺位。**本刀不建独立表**（落库形=裁决项④：默认 (a) ai_model_invocation.prompt_version 列）。

### 红事实 C：requestDigest 不含 version=正确基线（零位移面）

:1043-1063 requestDigest 摘要 service/system/userData/images/rag/temperature/costPolicy——version 不在其内是**对的**：版本是观测标签非语义输入，system 字节已在 digest 内（改 prompt 必变 digest=幂等/缓存语义自洽）。本刀**不得**把 promptVersion 加进 digest（§5 Ban）——版本元数据参与摘要会使无语义变化的版本标注误伤缓存回放。

### §1-修法（issues-final :265 原文为修法权威：「invoke spec 带上 promptVersion，写入 ai_model_invocation、trace 和 metric 标签」——四件·纯观测增强）

**① InvokeSpec 增可选 `promptVersion?: string` 字段**（invoke.ts :166 InvokeSpec additive·沿 `estimateInputTokens` :65/:153 同形缺省-NULL 纪律）：

- 填充策略=**裁决项①**：(a) invoke 入口按 `spec.service` 经 `getPrompt` 单源派生缺省填充（调用方零改·注册表外 service→undefined→NULL·**推荐**）(b) 各调用方显式传（触面大·泄漏注册表知识）。
- **prompts.ts 内容零改**：REGISTRY 八 service system/buildData/version 值全字节零动（本刀只加观测管道·「改 prompt=升 version」是另一回事）。

**② ai_model_invocation 新列 `prompt_version text NULL`（0181·起草窗首个空闲号实测·EXEC 全场重证）**——沿 0119 estimate 补列先例四件套同形：

- 0181 迁移：`ADD COLUMN IF NOT EXISTS prompt_version text`+CHECK（version 形约束·长 1..64·NULL 允许——约束形=裁决项⑤）；
- claim 函数 16→17 参（0119:175-195 同形升参·`p_prompt_version text`）+claim INSERT 列集扩（0119:252-259 同形）；
- TS 面：`ClaimModelInvocationInput.promptVersion?: string`（model-invocation.ts :30-51 沿 :50 同形）+占位 `$17`（:86-105）；
- identity-immutable 入列=**裁决项②**：(a) 入（claim 后不可改·0119:72 estimate 同形 additive 一行比较·**推荐**——claim 时冻结的观测事实) (b) 不入；
- **requestDigest 零触**（红事实 C·版本不入摘要）；0088 状态机既有比较零放松（§5 Ban）。

**③ trace 附带**：`ModelCallSpan.promptVersion?: string`（trace.ts :15-27 additive）+invoke.ts :629 record 带上+langfuse-v5.ts :67-83 metadata 增 `promptVersion` 标量一行（脱敏铁律不破——版本号是标量非 prompt 内容·:4 铁律原文遵守）；**:171 model 字段（service 名）零字节零触**（AG-24 面·§3-3）。

**④ metric 标签**：载体=**裁决项③**：(a) 新独立计数器（如 `model_invocation_prompt_version_total {service, prompt_version}`）+基线循环随 :157-162 形自 promptVersions() 单源播种（零触既有序列·零断言适配·**推荐**）(b) 既有 modelUsageCacheFieldPresence/modelUsageCachedInputTokens 扩 prompt_version 维度（既有序列 label 集变更·metrics.proof 断言随动）。**标签值域有界**：registry 八 service × 各现行 version（现 8 序列）∪NULL——禁自由字符串进标签（§5 Ban）。

**零评分语义改动**：evaluate/rubric/score/温度/模型选择/计费结算数值语义零触——modelCostSettledMicroCny 计数语义不变（裁决③(b) 才加标签维度·数值管道零动）。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **新 proof（`prove:ag19-prompt-version`·scripted model+真迁移隔离 PG（createPool/assertIsolatedTestTarget/runMigrations 含 0181）·est live=0）**：
   - **promptVersion 透传断言**：invoke（spec.service∈registry）→span/persistTrace 入参 promptVersion 逐 service 八值对表（=getPrompt(service).version 逐字）；registry 外 service（缺省）→undefined→NULL 臂；
   - **DB 列写入断言（真迁移 PG）**：claim 后 `ai_model_invocation.prompt_version`=期望值·**全 outcome 覆盖**（success/schema-失败/business-失败臂沿 0119 全 outcome 先例 :5-8）；缺省 NULL 臂（不传→列 NULL·旧行为字节等价）；identity-immutable 臂（若裁决②a）：claim 后 UPDATE prompt_version→触发器拒绝原样；17 参占位序=列序对表断言；
   - **metric 标签断言**：emit 后裁决③落定序列在案（{service, prompt_version} 对表+基线循环播种零缺失+值域有界负证臂）；
   - **trace/Langfuse 断言**：recordingTracer span.promptVersion 在案；langfuseSafeModelMetadata 增量行在案·**model 字段仍=service 名原样（AG-24 面零位移负证）**；脱敏负证（metadata 无 prompt 原文/简历/答案键）；
   - **digest 零变负证**：同 service 同输入·prompt_version 参与前后 requestDigest 恒等（缓存/幂等语义零位移）。
2. **既有门回归**：`prove:metrics`+`prove:model-usage-cache-observe`+`prove:diag-honesty-prompt`（注册表字节恒定面）+`prove:model-cost-metrics`（worker）全 EXIT 原值——若裁决③(b) 则 metrics 两门断言适配如实登记不洗。
3. **迁移门**：`migrate:prove`+`drift:prove`（真迁移链含 0181·零漂移）EXIT 原值。
4. **typecheck**：`turbo typecheck` 全绿（基线口径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **prompts.ts 内容零改**：REGISTRY 八 service 的 system/buildData/version 值全字节零动（§1-①·改 prompt=升 version 属 prompt 迭代本身·非本刀）。
2. **catalog/index.ts 复活/接线零触**：AG-19 复核定谳「catalog 版本号过时不成立（@deprecated 且零调用方）」（issues-final :259）——resolveBinding 不复活不扩展不删（复活=翻定谳·另议）。
3. **AG-24 面（Langfuse model 字段/cached/cost 上报）零触**：langfuse-v5.ts :171 `model: safeName(span.service, 'unknown')` 字节零动·usageDetails 零动——本刀只加 metadata.promptVersion 标量（AG-24 刀后落时照 §0 重 pin）。
4. **ai_prompt_versions 独立表**：默认零新表（红事实 B 落库形归裁决项④(b)·选则另立触面）。
5. **评分/计费语义零触**：rubric/score/温度表/模型选择/结算数值管道零字节；topic_charge/entitlement=计费战役。
6. **幂等/状态机语义零触**：requestDigest 摘要集零变（红事实 C）；0088/0119/0130 既有比较零放松（identity-immutable 只随裁决②a additive 扩）。
7. **est live=0**：零真实模型外呼·零生产操作·零 secrets（§6）。

## §4 依赖

- **零依赖刀**：无前置刀·无硬前置。上游零；正交面：AG-F（worker seam+ai-graphs+domain）零文件交点亲证（§0.3-2）·先落后落互不阻·照 §0 重 pin；计费 P2 shadow-meter（0180）已落主线·迁移号顺延即可（§0.3-1）。
- **下游**：AG-24（Langfuse model/cached/cost）与本刀同域邻接（langfuse-v5.ts 同文件）——本刀 metadata.promptVersion 一行在其重 pin 范围·如实登记；版本归因看板（成本×版本/质量×版本）为本刀数据消费面·非本刀交付物。

## §5 Ban 列表 + pins（沿 ag-f 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改 prompts.ts 任何字节（REGISTRY 八 service system/buildData/version 值零改——本刀只加观测管道·prompt 迭代本身零触）；Ban 评分语义改动（rubric/score/温度/模型选择零触·**纯观测增强**）；Ban prompt_version 入 requestDigest（版本是观测标签非语义输入——system 字节已承语义变化·入摘要则版本标注误伤缓存/幂等回放）；Ban 动 catalog resolveBinding/@deprecated 面（复活=翻 AG-19「零调用方」定谳）；Ban 动 Langfuse model 字段与 usageDetails（AG-24 刀面·:171 字节零动）；Ban 无界 metric 标签（prompt_version 值域⊆registry 版本集∪NULL·禁自由字符串/调用方注入进标签）；Ban 放松 identity-immutable/状态机既有比较（裁决②a 只 additive 扩一行·0088/0119/0130 既有面零放松）；Ban 建独立 ai_prompt_versions 表（越裁决项④(b) 授权即 FAIL）；Ban 真实模型外呼（est live=0·scripted+隔离 PG 形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/隔离真迁移 PG·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=scripted model+真迁移隔离 PG（`assertIsolatedTestTarget` 护栏·沿 0119 先例门形）；回归门=既有 prove 原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag19-prompt-version-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag-f/ag-cost1 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（迁移号 0181 全场空闲重证随立项核验）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①promptVersion 填充策略**：(a) invoke 入口按 `spec.service` 经 getPrompt 单源派生缺省填充（调用方零改·最小触面·registry 外 service→NULL·**推荐**）(b) 各调用方显式传 `spec.promptVersion`（触面大·注册表知识泄漏到调用方·systemByVars 组装面还得各点重答）。
- **②identity-immutable 入列**：(a) prompt_version 入 claim 后不可改检查（0119:72 estimate 同形 additive 一行·claim 时冻结观测事实·**推荐**）(b) 不入（弱审计·列可后写）。
- **③metric 标签载体**：(a) 新独立计数器 `{service, prompt_version}`+基线循环自 promptVersions() 播种（零触既有序列·零断言适配·**推荐**）(b) 既有 modelUsageCacheFieldPresence/modelUsageCachedInputTokens 扩维度（label 集变更·metrics 两门断言随动）。
- **④落库形**：(a) ai_model_invocation.prompt_version 列（0119 补列先例同形·**推荐**）(b) 兑现 ai_prompt_versions 独立表+写入方（新表新触面·注释承诺全量兑现·另议）。
- **⑤CHECK 约束形**：(a) 长 1..64 任意非空串·NULL 允许（宽松·registry 值形 v*/p.v* 变体兼容·**推荐**）(b) 正则钉形（紧但脆·升 version 命名法变更即迁移）。

---

*AG-19 REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`aeaf4141ec95` · 分支 `line/ag19-prompt-version` · 工作树 `meetwise-ag19` · 蓝本=issues-final AG-19 :31/:257-266（:259 部分成立定谳·:265 修法权威）+ AG-24 :312-320（范围外登记）· 形制沿 ag-f 卷 · 范围=InvokeSpec.promptVersion→ai_model_invocation.prompt_version 新列（0181 沿 0119 estimate 先例四件套）→trace span/metadata 附带→metric 版本标签·纯观测增强 · 零 prompts.ts 内容改动·零评分语义改动·零 requestDigest 零触·Langfuse model 字段零触（AG-24 面）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push 待 pre-exec 双审两外席（Ban self-approve · alone≠dual）*
