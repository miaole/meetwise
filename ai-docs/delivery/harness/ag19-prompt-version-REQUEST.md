# AG-19 — prompt 版本观测落库刀：invoke spec 带 promptVersion→ai_model_invocation 新列+trace 附带+metric 标签（EXEC REQUEST）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line AG-19 nail」段 :2507 已载 post-prove 双席 BOTH PASS+nail merge @`6bc982a5`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

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

---

## §9 EXEC 立项与施工随翻（2026-10-11·append 保史·§0-§8 原文零改·授权=预执行双审 BOTH PASS+协调方常设 loop 授权·HEAD=2776baa6 开工）

### §9-0 并线重 pin + §0 勘误注

1. **并线**：`git merge feat/mysql-schema-skeleton` → **Already up to date**（EXIT=0）。实测 merge-base=`aeaf4141ec95`＝主线 FETCH 后 tip＝本刀起草基线三者恒等；协调方任务面「主线 8603dc65+」中 8603dc65 经 `git log aeaf4141..8603dc65` 亲证为其**祖先**（AG-C 链针）——主线 tip 实测=aeaf4141ec95 已含 AG-B/C/E/F/A 全落线+计费/安全·零冲突零新笔。
2. **§0.1 blob 锚表 11 行 `git ls-tree HEAD` 重算逐行恒等**（prompts 8db00e904cba/catalog 4b5dfda49222/model-client c4827e8d72f8/invoke 172637205d73/trace 88f63487f8b1/langfuse-v5 35db0c325044/metrics 2cd9daf00925/model-invocation 13ea678c6af2/0037 9916a37e6ae1/0119 1922910a79da/0088 cbc07c09e1aa）。**协调方预警「model-client/invoke 可能因刀 B/C/E 落主线行锚漂移」未成立**——起草基线即已含全刀线·零行号漂移·§0 全部 file:line 原样承重·零勘误行。
3. **§0.3-1 迁移号全场重证**：主线+全 worktree 迁移 180 件·末位实测 **0180**（任务面「max=0179+」如实顺延一位）→ **0181 为首个空闲号零撞**（`ls packages/db/migrations | grep -c '^0'`=180·末件 0180_topic_shadow_meter.sql）。

### §9-1 落点（改动集恰 13 文件=10 修+2 新（迁移+proof）+本卷 1 .md；零 §3 范围外触面）

| # | 文件 | 改动 |
|---|---|---|
| 1 | `packages/db/migrations/0181_ag19_prompt_version_column.sql`（新） | 四件套同 0119/0130 权威形：①ADD COLUMN prompt_version text+CHECK（NULL 允许 OR 长 1..64·裁决⑤(a)）②state_guard identity-immutable 只增一行比较③claim 函数 DROP 16 参→建 17 参（p_prompt_version+validation 一行沿 p_service \r\n 先例）④claim INSERT 列集扩·REVOKE/GRANT 17 参签名 |
| 2 | `packages/db/src/model-op/model-invocation.ts` | ClaimModelInvocationInput.promptVersion 可选（沿 estimateInputTokens :50 同形）+占位 $16,$17+args 尾插 `input.promptVersion ?? null` |
| 3 | `packages/ai-runtime/src/invoke.ts` | InvokeSpec.promptVersion 可选字段+registryPromptVersion/promptVersionMetricLabels 双 helper+相位 1 派生+span 闭包附带+claim 相位透传+metric emit（每逻辑调用恰一次） |
| 4 | `packages/ai-runtime/src/trace.ts` | ModelCallSpan.promptVersion 可选标量（:4 脱敏铁律原文零动） |
| 5 | `packages/ai-runtime/src/langfuse-v5.ts` | langfuseSafeModelMetadata 增 promptVersion 标量一行（缺省 null·:171 model 字段零字节零触=AG-24 面） |
| 6 | `packages/ai-runtime/src/metrics.ts` | METRIC.modelInvocationPromptVersionTotal+registerBaselineMetrics 播种（promptVersions() 八对+'(unregistered)'/'none' 占位·既有序列零触） |
| 7 | `packages/ai-runtime/test/ag19-prompt-version.proof.ts`（新） | 47 臂（§9-4） |
| 8 | `packages/ai-runtime/test/runtime-kernel.proof.ts` | 两键集断言适配（§9-2-1）+AG-19 null 占位臂 |
| 9 | `packages/db/test/migrate.proof.ts` | :411 claim 签名 pin 16→17 参（§9-2-2·0174 rev2 regprocedure 先例附注在案） |
| 10 | `packages/ai-runtime/package.json` + 根 `package.json` + `scripts/run-e2e-isolated.mjs` | gate 注册四处（prove script/根 gate+raw/sourcePaths/迁移链两名单/命令派发） |

### §9-2 断言适配 + 基线同红承登（如实登记不洗）

1. **runtime-kernel.proof.ts 两键集断言适配**：span 键集 11→12 键（+promptVersion）·Langfuse metadata 键集 11→12 键（+promptVersion）——两断言目的=脱敏（禁 prompt 原文）·版本标量合规·语义不破；并新增「缺省 null 占位+model 字段仍=service 名（AG-24 面零位移）」一臂。
2. **migrate.proof.ts :411 签名 pin 16→17 参**：app_role EXECUTE regprocedure 签名串精确匹配（不吃 DEFAULT·0174 rev2 席1 42883 实证先例原文在案）——claim 升参随动·附注承继该先例形。
3. **基线同红承登（结构性亲证非本刀面·不修不越界）**：`prove:model-cost-metrics` EXIT=1——根因 `apps/worker/src/qbank-release-sweep.ts:79:90` 语法错（`asQbankControlExecutor(` 括号失衡·tsx/esbuild 与 `tsc -p apps/worker` TS1005 同位同证）；本刀 git diff 该文件**零字节零触**·HEAD blob `89913f128d13918e` 与 pristine `git show HEAD` 落盘 esbuild 对照 **EXIT=1 同错复现**——即 **b20ee350（qbank-control-sec 刀）带入的主线既存基线红**（该 proof import worker main.ts 加载即炸·b20ee350 落线后无人重跑本门）。归协调方/原刀处置；本刀按 Ban 范围外零修。

### §9-3 §8 五裁决行使（全部按卷推荐）

- **①=(a)** invoke 入口按 spec.service 经 getPrompt 单源派生缺省填充（调用方零改·八 service 全对表亲证·registry 外→undefined→NULL）；显式 spec.promptVersion 仅 span/DB 生效（调用方观测标签语义）·**绝不进 metric 标签**（有界 Ban 臂亲证）。
- **②=(a)** prompt_version 入 identity-immutable（0119 :72 同位 additive 一行·UPDATE→`ai_model_invocation_identity_immutable` 拒·拒后列值原样臂在案）。
- **③=(a)** 新独立计数器 `model_invocation_prompt_version_total {service, prompt_version}`+基线循环自 promptVersions() 播种——**既有序列零触·prove:metrics/model-usage-cache-observe 断言原值全绿零适配**（裁决③(b) 适配面未发生）。
- **④=(a)** ai_model_invocation.prompt_version 列（零新表·ai_prompt_versions 承诺面维持红事实 B 登记不变）。
- **⑤=(a)** CHECK=长 1..64 任意非空串·NULL 允许（宽松形）；附注：claim 函数层 validation 沿 p_service 先例加 `\r\n` 拒（CHECK 本体维持⑤(a) 原文·registry 值形全兼容·64/65 边界臂亲证）；metric 占位='(unregistered)'/'none' 固定哨（值域有界 Ban 落地面·渲染序列 label 值⊆registry∪哨负证臂在案）。

### §9-4 门全表（全亲跑·est live=0 全 scripted+隔离 PG 零模型外呼零 secrets 零消耗）

| 门 | EXIT | 数 |
|---|---|---|
| `ag19-prompt-version:prove`（新·隔离 PG 全迁移链 applied=181） | 0 | 47 臂全 PASS（注册表/blob 恒定 3+八值透传对表 16+NULL/显式臂 3+全 outcome 落库 4+identity-immutable/CHECK/17 参边界 10+metric 4+trace/Langfuse/脱敏/AG-24 4+digest 零变负证+正控 2+ receipt 落盘） |
| `prove:metrics` | 0 | 断言原值零适配（③(a) 兑现） |
| `prove:model-usage-cache-observe` | 0 | 原值 |
| `prove:diag-honesty-prompt` | 0 | 注册表字节恒等面原值 |
| `migrate:prove`（隔离链含 0181） | 0 | 117 PASS（:411 签名 pin 适配 §9-2-2 外全原值） |
| `drift:prove` | 0 | 迁移独有列不算漂移·零漂 |
| `turbo typecheck` | 0 | 3/3（2 cached 合规） |
| 扩展回归 `runtime:prove:raw`（runtime-kernel+claim-join-orphan+diag 链） | 0 | 适配臂全绿 |
| 扩展回归 `estimate-threading-invoke:prove` | 0 | 原值 |
| 扩展回归 `model-op02:prove` | 0 | 原值 |
| 扩展回归 `ag-d-admission:prove` | 0 | 49 PASS |
| `prove:model-cost-metrics`（worker） | **1** | **基线同红·§9-2-3 承登（b20ee350 主线既存·非本刀面零字节）** |
| `docs:check` | 0 | 80 files+2039 managed |
| markers 五类标记词（13 文件改动集·词面沿 i6-239-gates 组装形不复抄卷内） | 0 命中 | 五类全零 |

### §9-5 陷阱自检（任务面 13 条）

①**0181 迁移纪律**：起号前主线+全 worktree 全场重证 180 件末位 0180→0181 零撞；历史迁移 0001-0180 零字节零触。②**identity-immutable**：0119 :72 同位只增一行·其余 body 与 0119 逐字节一致·0088 既有比较零放松（证明臂：UPDATE→拒+原样）。③**claim 升参向后兼容**：17 参末位 $17 缺省 NULL=16 参旧调用形语义等价（0174 $10 DEFAULT NULL 先例·NULL 臂 execute 亲证；regprocedure 签名断言面随升参适配如实登记）。④**trace additive**：span/metadata 只增可选标量·脱敏铁律 :4 原文零动·prompt 原文负证臂在案。⑤**metric additive**：新独立计数器·既有序列零触·两 metrics 门断言原值全绿。⑥**零 prompts.ts**：git blob sha1 在 proof 内机械对表 8db00e904cba04cf0c3d775719cb3f2937e8f104 恒等。⑦**零评分语义**：rubric/score/温度/模型选择/结算数值管道零触。⑧**零 requestDigest**：digest 零变负证（显式版本相异→digest 恒等）+正控（system 变→digest 变）双臂。⑨**范围外**：§3 七条零触（catalog/@deprecated/AG-24 model 字段/独立表/计费/状态机放松/est live）。⑩**pins**：十一值照抄零翻·脚注 actualSpendCny=null。⑪**状态行**：Status 翻 executed:awaiting_post_prove_dual·§0-§8 原文零改 append 保史。⑫**回滚**：单 commit 承载·revert 即全回（0181 为 additive 列+函数替换·revert 后 17 参 TS seam 与 16 参函数不匹配——回滚须整 commit 同退·如实登记）。⑬**停止条件**：全卷零触发（撞号/撞面/同红均按登记形处置·model-cost-metrics 基线红非本刀面已承登上报）。标记词自检：13 文件改动集五类标记词 grep 零命中（词面组装防自匹配·扫描时点含本卷随翻后复扫在案）。

---

*AG-19 EXEC 版记 · 2026-10-11 · executed:awaiting_post_prove_dual · 分支 `line/ag19-prompt-version`（HEAD=2776baa6 开工·施工未 commit 前门全表亲跑）· 并线 Already up to date（主线 tip=aeaf4141ec95=起草基线·11 blob 恒等·0181 实测首个空闲号）· 修法四件落 12 文件·47 臂新 proof+六门原值绿+三扩展回归绿+基线同红一门承登（qbank-release-sweep b20ee350 主线既存·非本刀面）· est live=0 · pins 十一值零翻 · markers=0 · ⛔push 待 post-prove 双审两外席（Ban self-approve · alone≠dual）*
