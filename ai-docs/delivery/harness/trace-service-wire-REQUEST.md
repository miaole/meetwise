# TRACE-SERVICE-WIRE REQUEST — ai_invocation_trace.service 透传触点族核读定稿+回补登记刀（批5 盘点 Top5·两同形触点+一回补登记·docs-only 登记卷·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 登记落卷翻面 2026-10-16·前值 `draft:awaiting_pre_exec_dual` 史录·授权链沿 ssd-egress/Q2-VSF 快速链先例=协调方派单令明示授权 EXEC·pre-exec 双审未独立外派如实披露·post-prove 双审两独立外席待派·alone≠dual·est live=0）

**席位**：trace-service-wire REQUEST 起草席（读码定稿+起草双责·协调方派·批5 盘点席 Top5 靶=`#14` 出题/规划/评估/报告 invoke 不传 service·`#216` 押题 invoke 不带 service（诊断带 resume-diagnosis.generate 先例形）——同形 invoke 透传缺 service 两触点族+`#172` trace 写入 fail-open 后无对账回补·丢失即永久丢（登记面））。
**基线**：`feat/mysql-schema-skeleton` @ `5c8e122c`（origin tip 恒等亲证——`git fetch` 后 `origin/feat/mysql-schema-skeleton`=`5c8e122c`·派单下界「origin tip≥5c8e122c」等号成立亲证·主仓 HEAD `93b3db5a` 落后 43 commit 本席未用·分支 `line/trace-service-wire`（`git worktree add ../meetwise-ts -b line/trace-service-wire 5c8e122c` 亲立·HEAD 落 `5c8e122c` 亲证）· 工作树 `meetwise-ts`（主仓仓根同级）· docs:check 基线 **2202≤cap 2208** 本树亲跑 EXIT=0·迁移链 **204 文件头 0204** 亲数）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①批5 盘点席派单 brief（2026-10-16·两同形触点+一回补登记·本卷即其登记载体）；②LEDGER 行语义=`ai-docs/delivery/harness/product-campaign-LEDGER.md:87`（5C 可靠性 52 件开放清单内 `#248/#245/#246/#172/#14/#216 — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）` 在册）+:492 刀位图（5C-SSE-API 子刀行=`#139 掉线唤醒+补偿拉取/#14+#216 五站点 invoke service 补全/#172 trace 丢失率分母`**✅ nail 收官**·`#139/#14/#216/#172 翻面载体（翻面权归协调方核·本刀不宣称关闭）`）；③形制范本 `ai-docs/delivery/harness/uc184-slot-order-REQUEST.md`（§0-§8+trailer 形制·STOP 三条款+四类停止条件+pins 十一值沿承）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git hash-object 实测 @`5c8e122c`·**EXEC 立项（若有）照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git branch --list "line/trace-service-wire*"` 恰 1 命中=本席分支；`git worktree list` 含 `meetwise-ts` 恰 1 树；`ls ai-docs/delivery/harness/ | grep -i trace-service` 建前零命中→落卷后唯一同名卷=本卷。
- **本刀=docs-only 登记卷（§1-修法·零产品码）**：在飞交叠复核对象=§0.1 十一锚文件 Stability（非触面）——任一锚 blob 对届时 tip 漂移→重 pin 改锚非停（本刀零写触·漂移不改结论）；共享 SSOT（LEDGER/checklist/backlog）零写触（§3-4）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`5c8e122c`）

| # | 文件 | blob（8 hex） | 行数 | 关键行锚 |
|---|---|---|---|---|
| 1 | `packages/ai-runtime/src/invoke.ts` | `44340f39` | 1211 | **trace 唯一写入口**：`:490` `async function persistTrace(`→`:502`/`:508` 两条 `INSERT INTO ai_invocation_trace(...service...)`（hasRequestIdColumn 双形·值=`spec.service` 透传·`ON CONFLICT DO NOTHING`）→**`:522` `async function persistTraceBestEffort(`（UC-028 fail-open 旁路）：`:526` `inc(aiTracePersistAttempts)`（丢失率分母）→`:529` `inc(aiTracePersistFailures)`（分子）→`:531-:540` 结构化日志 `ai_trace_persist_failed`（**`service`+`idempotencyKey`+pgCode 留痕=回补定位键**·不放 owner/原文/堆栈）→`:517-:519` 书面声明「失败 trace 的对账重写属 A2 recon 域，本旁路不冒充 recon」；`:1171` fail-open 调用点（事务外·`if (!error)`）；`:794` `claim.action==='cached'` 回放臂（读 `ai_model_claim_invocation_scoped`=ai_model_invocation 面·**非 trace**）；`:320` `registryPromptVersion`（registry 外→undefined→prompt_version NULL）；`:233` `service?: string`（API 契约可选性） |
| 2 | `apps/worker/src/interview-service.ts` | `caba758c` | 370 | 四站点：`:175` invokeEvaluationOnce 评分 invoke→`:181` `service: 'mock-interview.evaluate'`；`:246` quizGenerator 押题 invoke→`:248` `service: 'resume-quiz.generate'`（**#216 靶点**）；`:289` diagnosisGenerator 诊断 invoke→`:290` `service: 'resume-diagnosis.generate'`（**先例形**）；`:348` reportGenerator 报告 invoke→`:350` `service: 'report.generate'`（**#14 报告**） |
| 3 | `apps/worker/src/adaptive-interview-service.ts` | `84b3e584` | 798 | 两站点：`:330` 规划 invoke→`:334` `service: 'planner.competencies'`（**#14 规划**）；`:569` adaptive ask invoke→`:574` `service: 'interviewer.ask'` |
| 4 | `packages/ai-runtime/src/resume-ocr.ts` | `b2c51425` | 148 | `:133` OCR invoke→`:140` `service: 'resume.vision'`（runtime 侧原生先例） |
| 5 | `packages/ai-runtime/src/job-route-classify.ts` | `3b1e7081` | 208 | `:164` 路由 invoke→`:170` `service: JOB_ROUTE_CLASSIFY_PROMPT_SERVICE`（常量形=`packages/domain/src/sealed-job-route-classify-binding.ts:27` `'job.route-classify.v1'`） |
| 6 | `packages/ai-runtime/src/prompts.ts` | `96acf9c3` | 251 | **REGISTRY 八键**（service 枚举单源）：`:62` `job.route-classify.v1`·`:83` `resume-quiz.generate`·`:92` `resume-diagnosis.generate`·`:119` `planner.competencies`·`:151` `interviewer.ask`·`:185` `mock-interview.evaluate`·`:218` `resume.vision`·`:228` `report.generate`；头注①「invoke 按 (owner, idempotencyKey) 命中 ai_invocation_trace 直接返回」系**注释漂移**（实态回放自 ai_model_invocation claim 面·§0.2-4 如实登记） |
| 7 | `packages/ai-runtime/src/qa-tool-layer.ts` | `e68213d9` | 365 | `:350` qa 决策环 `invokeModel({`→`:355` `service: cfg.service`（cfg 契约 `:308` `service: string` 必填）；值域常量 `:45` `QA_SERVICE_GROWTH_ADVISOR='qa.growth-advisor'`·`:46` `QA_SERVICE_RECRUITER_FOLLOWUP='qa.recruiter-followup'`（registry 外·生产调用面未启用·proof 面 stub 直行使） |
| 8 | `packages/ai-runtime/src/search.ts` | `73f2509f` | 128 | `:75` `invokeQueryExpansion(input: { service: 'rag.query_expand'; ... })`（**字面量类型必填**）→`:101-:103` 透传（registry 外） |
| 9 | `packages/ai-runtime/test/ag19-prompt-version.proof.ts` | `4f4fa012` | 393 | **臂 0-b 源级门**（#14/#216 非空断言机检落位）：`:100` 臂头注（生产 src 全部 `await invoke({` 站点清点·域=apps/worker/src+apps/api/src+packages/ai-runtime/src·test/proof 排除）→`:129` 恰 8 站点臂→`:130` 逐站点字面量块含 `service:` 臂（「非空断言源级落位·运行时零 throw·API 契约可选性维持」）→`:132` 五补全值∈`promptVersions()` 键集臂；`:43-:53` EXPECTED 八值对表+`:75-:79` prompts.ts blob 恒等面（=`96acf9c3` 全值 `96acf9c3414f8dd19b781d795f8d04e779e04c5c` 亲等） |
| 10 | `packages/ai-runtime/src/metrics.ts` | `a34c585d` | 187 | `:109` `aiTracePersistFailures: 'ai_trace_persist_failures_total'`（分子）·`:112` `aiTracePersistAttempts: 'ai_trace_persist_attempts_total'`（丢失率分母·9af6bb99 件③）·`:165-:166` 零预填 |
| 11 | `packages/db/migrations/0011_trace_tokens.sql` | `af3ee8f9` | 5 | `:2` `ALTER TABLE ai_invocation_trace ADD COLUMN IF NOT EXISTS service text`（**列源·可空**） |

### 0.2 派单简报漂移登记（结论零变处如实改锚/定性·读码定稿实质漂移两处如实在案）

1. **简报靶面「#14/#216 invoke 不传 service」——读码定稿=两同形触点已闭合（码面无残余）**：`9af6bb99`（`exec(sse-api-family)`·2026-10-16·`git merge-base --is-ancestor` 对 `5c8e122c` 亲证 IS ancestor）件②=五站点恰 5 行 service（`:181` mock-interview.evaluate/`:248` resume-quiz.generate/`:350` report.generate/`:334` planner.competencies/`:574` interviewer.ask·沿 `:290` 诊断先例形·注册表键逐字）+件④=ag19 源级门三臂（锚#9 `:129-:133`·「恰 8 站点逐站点含 service+五值∈注册表」机检恒绿）。批5 盘点 Top5 之 #14/#216 系**盘点快照早于 9af6bb99 并线的滞后项**，非现势缺口——LEDGER :492 sse-api-family 行「✅ nail 收官」+「#14+#216 五站点 service 补全」修法清单同源互证。本刀修法据此定稿=**零产品码登记卷**（§1-修法·候选淘汰 §1.3）。
2. **简报「#216 押题 invoke 不带 service（诊断带 resume-diagnosis.generate）」**：押题面=`interview-service.ts:246` quizGenerator（resume-quiz 图 generate 经 invoke 关口）现带 `:248` `service: 'resume-quiz.generate'`；诊断先例形 `:289/:290` 原样恒等——同上已闭，无独立残余。
3. **简报「#172 fail-open 后无对账回补·丢失即永久丢」——定性成立·残余在案=本刀登记面**：persistTraceBestEffort（锚#1 `:522-:542`）失败臂=分子/分母 metric+结构化日志（`service`+`idempotencyKey`+pgCode 留痕）·**无补写/回放/对账臂**——`:519` 书面声明「失败 trace 的对账重写属 A2 recon 域，本旁路不冒充 recon」·harness 卷 `uc-e2e-028-trace-ledger-fail-open.md:63` 明列「missing-trace **重写队列/标记缺失**+事后对账补写路径+prove」=A2 缺口件（GAP-UC028-RECON 在案）。「永久丢」前提核读：**业务真相/计费/幂等回放面不受损**（claim cached 臂 `:794` 读 `ai_model_claim_invocation_scoped`=ai_model_invocation·非 trace）——丢失面=观测旁路+usage 估算对账样本（persistTrace `:492-:495` estimate 派发前估算仅落 trace·丢失=校准样本缺失）。回补归**后继观测刀**（LEDGER :87 四子刀拆分 OBS 域在案·本刀只登记不落码）。
4. **prompts.ts 头注①注释漂移（零行为·如实登记）**：头注称「invoke 按 (owner, idempotencyKey) 命中 ai_invocation_trace 直接返回,不重打模型(已实现)」——实态回放/去重真相面=ai_model_invocation（claim 函数 SQL `packages/db/src/model-op/model-invocation.ts:105-:107` `FROM ai_model_claim_invocation_scoped(...)`·`action='cached'` 臂 invoke.ts `:794` 亲证）·ai_invocation_trace 生产读路径零命中（`grep "FROM ai_invocation_trace"` 仅 INSERT 面）——注释定性「trace=缓存」与实态「trace=观测旁路」漂移·随本卷登记·**措辞修归文字小刀 Ban 本刀顺手改**（§3-5·docs-only 卷不动产品文件注释域）。
5. **门基线锚题面值口径**：neg:all 六段运行时臂题面 **692**（90+90+91+107+179+135·context-budget-wire EXEC 届时实测追记在卷）·ag19 **50**（47+源级门 3）·interview:prove **64**·静态 `grep -c "A('"` 计数（ag19 34/neg 各段 75-179）系源内调用位点数≠运行时臂数（循环臂展开）——门矩阵一律以运行时 PASS 计数为准·对届时实测熔断（§2 前言）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`。
- 本刀=docs-only 登记卷（§1-修法）·**预期零迁移零 DDL**。EXEC 期（若有续刀）若产生非预期迁移需求→停上报·认领号=对届时主线链顶亲数+在飞分支题面复核后取最小未占号顺延·Ban 抢号。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 service 赋值链唯一写入口+透传形（机制钉死）

- **写入口唯一**：`ai_invocation_trace` 全仓 INSERT 仅 `invoke.ts:502/:508` persistTrace 双形（requestId 列有无分支·`grep -rn "INSERT INTO ai_invocation_trace"` 全仓亲证零第二写入点·UPDATE 零命中）——`service` 列值恒=`spec.service` 透传（invoke.ts `:233` `service?: string` 可选·缺省落 NULL·0011 列源可空）。
- **fail-open 旁路**：persistTrace 经 `persistTraceBestEffort`（`:522`）在自己的 principal 事务内 best-effort 执行（UC-028 A1 已钉契约）——INSERT 失败不回滚已提交的 settle/complete 业务事务、不改写 invoke 成功终态·失败被结构化观测（分子 failures+分母 attempts+单行 JSON 日志）·绝不静默无痕。
- **prompt_version 顺势单源**：AG-19 裁决①(a)——invoke 入口按 `spec.service` 经 `getPrompt` 派生 promptVersion（`:320-:322`·registry 内→注册表 version 常量·registry 外/缺省→undefined→落库 NULL）——**service 缺失=trace.service NULL+prompt_version NULL+metric 标签落 `'(unregistered)'` 三连观测降级**，此即 #14/#216 的实际代价面（已闭）。

### 1.2 透传触点族全清单+service 枚举定稿（读码定稿核心交付）

**生产 invoke 关口十站点全表**（`await invoke({` 8 站点=源级门域内+变量透传 2 站点=门域外·全带 service·逐行亲证）：

| # | 站点 | service 值（定稿） | 值形 | registry | 触点归属 |
|---|---|---|---|---|---|
| 1 | `interview-service.ts:175` 评分 | `mock-interview.evaluate` | 字面量 | 内（v6） | #14 评估 |
| 2 | `interview-service.ts:246` 押题 | `resume-quiz.generate` | 字面量 | 内（v2） | **#216 押题** |
| 3 | `interview-service.ts:289` 诊断 | `resume-diagnosis.generate` | 字面量 | 内（v1） | **先例形** |
| 4 | `interview-service.ts:348` 报告 | `report.generate` | 字面量 | 内（v3） | #14 报告 |
| 5 | `adaptive-interview-service.ts:330` 规划 | `planner.competencies` | 字面量 | 内（v4） | #14 规划 |
| 6 | `adaptive-interview-service.ts:569` ask | `interviewer.ask` | 字面量 | 内（v8） | sse-api-family 件② |
| 7 | `resume-ocr.ts:133` OCR | `resume.vision` | 字面量 | 内（v2） | 原生先例 |
| 8 | `job-route-classify.ts:164` 路由 | `job.route-classify.v1` | domain sealed 常量（`SEALED_JOB_ROUTE_CLASSIFY_PROMPT_CONTRACT`） | 内（p.v2） | 常量形先例 |
| 9 | `qa-tool-layer.ts:350` qa 决策环 | `cfg.service`（`qa.growth-advisor`/`qa.recruiter-followup`） | cfg 契约必填常量（`:45/:46`） | **外**（prompt_version NULL by design） | 门域外·类型面必填 |
| 10 | `search.ts:101` 查询扩展 | `rag.query_expand` | 字面量+字面量类型（`:75`） | **外** | 门域外·类型面必填 |

**service 枚举定稿**：值域=REGISTRY 八键（prompts.ts `:62/:83/:92/:119/:151/:185/:218/:228`·枚举单源）∪ registry 外三值（`qa.growth-advisor`/`qa.recruiter-followup`/`rag.query_expand`·既有面冻结）。**新站点纪律（登记为后继刀约束面）**：新 invoke 站点 service 一律取注册表键（prompt_version 顺势点亮·metric 标签有界）·registry 外新值=越界需登记（AG-19 `'(unregistered)'` 标签面随之膨胀·Ban 静默增面）。
**机检面**：源级门三臂（ag19 锚#9 `:129-:133`）恒锁「`await invoke({` 形站点逐站点含 `service:`」——门 regex 域外两站点（#9/#10）由类型面必填承载（qa cfg `service: string`/search 字面量类型）·覆盖边界如实登记非缺口。

### 1.3 #172 fail-open 现势定性+候选淘汰登记（防 EXEC 期重开）

- **定性（读码定稿）**：trace=可观测旁路+usage 估算对账样本面（`persistTrace :492-:495`「estimate 无法事后重算…必须此刻落库」）·非业务真相非计费面非回放面（§0.2-3 三面剥离亲证）——fail-open 丢失的真实代价=①观测链断点（trace 缺行）②估算↔usage 配对校准样本缺失（校准偏向校验成功样本·`:492-:495` 已知缺口书面在案）。**丢失可定位**：结构化日志带 `idempotencyKey`+`service`+pgCode（`:531-:540`）=回补所需定位键已留痕·丢失率=failures/attempts 可导出（attempts 分母 9af6bb99 件③已落）。
- **候选甲（采纳）=本卷登记定稿（docs-only）**：触点族现势清单+枚举定稿+回补靶面登记（后继观测刀靶=A2 recon：对账回补臂读失败日志/attempts-failures 差值定位→按 ai_model_invocation 真相面回写 trace 缺行或标记缺失+prove·设计裁决权归后继刀派单）——量级微·零产品码·零行为位移。
- **候选乙（否决·Ban）=trace 持久化重构**（persistTrace 迁回事务内/改 fail-closed/trace 表列改造或新表）：UC-028 A1 fail-open 系已钉契约（spec「trace 写入失败不回滚业务事务」·invoke.ts `:1167-:1169` 注释+uc028 双 proof 在卷）——重构=爆炸半径全 invoke 面+违 A1 语义·否决。
- **候选丙（否决·Ban）=#172 最小对账臂落本刀**：A2 recon 系独立缺口件（harness 卷 `:63`「补写队列+对账补写+prove」三件套）·`:519` 书面域界「本旁路不冒充 recon」——最小臂=新增码面（proof+观测设计+回补语义裁决）超 docs-only 卷载·且批5 派单明示「本刀只登记不落码——归后继观测刀」·否决（登记面兑现于 §1.2/§0.2-3）。
- **候选丁（否决·Ban）=给 InvokeSpec.service 加运行时必填 throw 或 registry 外三值立 REGISTRY 项**：源级门已裁「非空断言源级落位=机检非运行时·API 契约可选性维持」（锚#9 `:130` 臂名原文）——运行时 throw=调用面破坏性变更；registry 外三值立注册表项=值域语义改（qa 环/检索扩展非 prompt 注册表语义域）且 zero 收益（prompt_version NULL 本系 AG-19 registry 外既定语义）·否决。

## §1-修法（登记卷·预期恰 1 文件=本卷 .md·零产品码零 proof 零迁移）

- **件①（本卷）**：`ai-docs/delivery/harness/trace-service-wire-REQUEST.md`——§0.1 十一锚 blob 表（届时重 pin 承载）+§1.2 触点族十站点清单+service 枚举定稿+§1.3 候选淘汰+§0.2-3 #172 回补靶面登记（后继观测刀派单靶=A2 recon 缺口件·GAP-UC028-RECON 在案引用）。**本刀不改任何 .ts/.sql/.json 产品与测试文件**——§1.2 定稿内容=对已落码现势（9af6bb99 承载）的书面钉定·非行为变更。
- **件②（无）**：#14/#216 码面零触（§0.2-1/2 已闭·Ban 重复施工）；#172 回补零码（§1.3 候选丙否决）。diff 面预期=**恰 1 tracked .md**（本卷）·多任何 tracked 路径即停（越界需要类）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵·数字口径以实跑实测为准·题面值熔断另注）

1. **ag19-prompt-version:prove（本刀主验收机检·源级门=触点族非空断言载体）**：`pnpm ag19-prompt-version:prove`（root 隔离 wrapper）EXIT=0·题面 **50** 臂（含臂 0-b 三臂 `:129/:130/:132`·熔断=0 容差：实测≠50 即触停止条件「现场漂移」·如实记实测值）。
2. **trace 邻面 proof 三门不回退**：`pnpm metrics:prove` EXIT=0（attempts/failures 常量+零预填臂）+`pnpm uc028:trace-fail-open:prove` EXIT=0（fail-open 旁路契约=候选乙否决的契约承载）+`pnpm uc028:nhp-fault:prove` EXIT=0（题面 45·对届时实测）。
3. **invoke 关口主证明**：`pnpm -C packages/ai-runtime prove` EXIT=0（runtime-kernel+claim-join-orphan+diag-honesty+ag24 四件串联）+`pnpm -C packages/ai-runtime prove:estimate-threading-invoke` EXIT=0（estimate↔usage 对账邻面=trace 校准样本面承载）。
4. **neg:all 六段全绿**：`pnpm neg:all` EXIT=0·总臂题面 **692**（90+90+91+107+179+135·熔断：总≠692 停上报·如实记归因）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
6. **lint 五值恰等**：`pnpm turbo lint` 12 任务全绿 EXIT=0·五贴线预算**恰等零超支**：web `601≤601`+root `5235≤5235`+api `1421≤1421`+worker `954≤954`+ai-runtime `628≤628`（五值沿 context-budget-wire/sse-api-family 卷终值·docs-only 卷应零漂·任一值新增超支或第三贴面出现即停）。
7. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2208**（`scripts/ai-docs/public-text-policy.mjs:104` MAX_FILES=2208 亲证·基线 2202 本树亲跑·本卷落卷后预期 **2203**·**>2208 红停上报**·cap sanction 权归协调方·Ban 自升）。
8. **markers 五类零命中**：本刀改动集（1 .md 本卷）五类标记词 grep 零命中（词面沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄卷内防自匹配·命令与回执入卷）。
9. **diff 面机检**：`git diff --numstat HEAD` 恰 **0 tracked**（docs-only·本卷 .md 系新文件经 commit 入树）·`git show --stat HEAD` 恰 **1** tracked 路径=本卷 .md——多任何 tracked 路径即停（越界需要类）。
10. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（本卷零 proof 执行·est live=0·门矩阵 EXEC 期行使亦全离线·isolated wrapper 口径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品与测试文件零触**：§0.1 十一锚文件（invoke.ts/interview-service.ts/adaptive-interview-service.ts/resume-ocr.ts/job-route-classify.ts/prompts.ts/qa-tool-layer.ts/search.ts/ag19 proof/metrics.ts/0011）blob 前后全等——#14/#216 已闭面（§0.2-1/2）Ban 重复施工 Ban 重排 service 行序 Ban「顺手」改注释。
2. **#172 回补零码**：A2 recon 设计/实现/证明全归后继观测刀（§1.3 候选丙否决承卷）——Ban 本刀落补写队列/回填脚本/标记列。
3. **registry 值域冻结**：REGISTRY 八键+registry 外三值零增零改零删（§1.2 定稿·候选丁否决承卷）——Ban 立 qa/rag 注册表项·Ban 改 `'(unregistered)'` 标签语义。
4. **共享 SSOT 零改**：LEDGER/checklist/backlog/north-star 只读引用——#14/#216/#172 行翻面权归协调方（本刀不宣称关闭）。
5. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级·零 prompt 文本触碰（version 位阶事件零涉）。

## §4 依赖

**①上游已满足**：sse-api-family nail（`9af6bb99`·五站点 service+源级门+attempts 分母·在基线链 is-ancestor 亲证）+AG-19 prompt-version 落库刀（`0119`+ag19 proof·在基线链）+UC-028 fail-open 旁路（invoke.ts `:517-:542`·在基线链）。**②无同文件并发**：本刀 docs-only·§0.1 锚漂=重 pin 非停（§0.0）。**③迁移号**：§0.3 预期零。**④下游**：#14/#216/#172 行翻面归协调方；A2 recon 后继观测刀靶面=本卷 §0.2-3/§1.3 登记为派单输入。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门矩阵 prove 面 EXEC 期恰 1 次·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触 §0.1 十一锚文件与一切产品/测试文件（§3-1·docs-only 卷纪律）；Ban #14/#216 重复施工（§0.2-1/2 已闭·重复加 service 行=diff 面污染）；Ban #172 回补落本刀（§1.3 候选丙）；Ban trace 持久化重构/fail-open 翻改（§1.3 候选乙）；Ban registry 值域增改（§1.3 候选丁/§3-3）；Ban 运行时 service 必填 throw（同候选丁）；Ban 迁移 Ban DDL（§0.3）；Ban 改共享 SSOT（§3-4）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（本卷 docs-only·proof/neg 面零执行·EXEC 期门矩阵行使亦全离线·isolated wrapper 口径沿承）。

## §7 markers=0（卫生声明·亲跑回执）

本刀改动集（本卷 1 .md）五类标记词 grep 零命中（起草席亲跑·五类词面**运行时组装**沿 `scripts/qbank-corpus-gates.prove.mjs:87-:100` 同口径：四词逐字符拼接组装+行首冲突标记正则——**词面绝不复抄入卷防自匹配**·命令与 EXIT 回执随本节留痕：改动集=`git diff --name-only HEAD`∪`git ls-files --others --exclude-standard` 双查·五类词+conflict 零命中 EXIT=0）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual · （EXEC 登记落卷 2026-10-16 翻面·前值 `draft:awaiting_pre_exec_dual` 史录·开工条款①②以协调方快速链派单令承接=明示授权 EXEC·沿 ssd-egress/Q2-VSF 先例·条款③遵守亲证：§1.2 枚举定稿/§1.3 候选淘汰/§5 Ban/pins/§1-修法 docs-only 交付面零改·§9 EXEC 记录在卷）· post-prove 双审两独立外席待派·本 commit 不预 claim 任何 post-prove EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 枚举定稿与 §1.3 候选淘汰结论与 §5 Ban/pins 与 §1-修法 docs-only 交付面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚结论漂移（如源级门三臂被改/八站点 service 值形被改/persistTraceBestEffort 契约被改/REGISTRY 键集增删）·门基线锚漂（ag19≠50/neg 总臂≠692/链头≠届时实测账/docs:check cap≠2208 未经 sanction）→停·重 pin 回炉。
- **机制不满足**：§2 门矩阵任一门红且根因在本卷登记结论（如源级门站点计数≠8=新站点未带 service 落地）→登记结论被证伪→停·如实升级协调方回炉（Ban 就地改登记 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法 docs-only 面（需触产品码/落 A2 回补臂/改 registry 值域）→停·另刀或协调方裁决（§1.3 候选乙/丙/丁否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻 proof 新红/lint 贴面新增超支/docs:check>2208）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（登记卷形·七字段简化·EXEC 席落卷 2026-10-16·STOP 三处翻面→`executed:awaiting_post_prove_dual`）

**① 授权链**：起草落卷 `6bdae07f`（REQUEST 135 行·基线 `feat/mysql-schema-skeleton` @`5c8e122c`）→协调方快速链派单令明示授权 EXEC（沿 `ssd-egress`/`Q2-VSF` 快速链先例·pre-exec 双审两外席未独立外派**如实披露**——开工条款①以快速链先例由派单令承接·条款②成立）→EXEC 本卷。alone≠dual 披露随卷·post-prove 双审两独立外席待派。

**② 并线**：`git fetch` 后 `origin/feat/mysql-schema-skeleton`=`10799a3e`（派单下界「届时 tip≥10799a3e」**等号成立亲证**）→`git merge --no-ff` 落定·**零冲突**（ort 策略·携入 worker-hang-guard 波 8 files/+361/−9·其中产品码面=drain-loop.ts/三 consumer 传参/proof·与本刀 §0.1 十一锚零交叠）。⛔pull --rebase 未用·⛔force push 未用。

**③ EXEC 重 pin（自审①锚）**：§0.1 十一锚 blob 对并线树全量亲算=`git hash-object` 逐文件**十一值全等**（`44340f39`/`caba758c`/`84b3e584`/`b2c51425`/`3b1e7081`/`96acf9c3`/`e68213d9`/`73f2509f`/`4f4fa012`/`a34c585d`/`af3ee8f9`·invoke.ts 1211 行/ag19 proof 393 行恒等）——**零漂移免改锚**。锚点亲证：persistTrace 双 INSERT 恰 `:502`/`:508`（`INSERT INTO ai_invocation_trace(...service...)` hasRequestIdColumn 双形）+`persistTraceBestEffort` `:522-:542`+源级门三臂 ag19 `:129/:130/:132` 恰 8 站点（`interview-service.ts:175/:246/:289/:348`+`adaptive-interview-service.ts:330/:569`+`resume-ocr.ts:133`+`job-route-classify.ts:164`·五补全值 `:181/:248/:290/:350/:334/:574` 注册表键逐字）+`9af6bb99`（sse-api-family EXEC·五站点 service+源级门落码载体）`git merge-base --is-ancestor` 对 HEAD **EXIT=0 祖先亲证**。§0.2-1/2 定谳复核成立：#14/#216 两同形触点码面已闭·无残余。

**④ 交付面（修法=登记形零码）**：本 EXEC 恰两 docs 笔=（a）本卷 §9 EXEC 记录+STOP 三处翻面（`ai-docs/delivery/harness/trace-service-wire-REQUEST.md`·append 注记形·§0-§8 正文零洗）；（b）LEDGER :87 区 #14/#216 相应行消账笔 append（字段⑥）。**零产品码零 proof 零迁移零依赖改**——§1-修法 docs-only 交付面零破·§3-1 十一锚文件 blob 前后全等（③亲证）。

**⑤ 门矩阵（快速链行使面·本卷登记形·ag19/neg/typecheck/lint 等运行时门矩阵按派单令归后继 post-prove 期行使——本 EXEC 未执行任何 prove·est live=0）**：docs:check `node scripts/ai-docs/check-docs.mjs` EXIT=0 **2204≤cap 2208**（并线携入 worker-hang-guard-REQUEST.md 后基线·预期 2203+1 恰等）；markers 五类词+行首冲突标记（**词面绝不复抄入卷防自匹配**·运行时逐字符拼接组装口径沿 `scripts/i6-239-gates.proof.mjs` §2-7 同款）：本卷全文零命中+LEDGER 沿 `10799a3e` 先例改**新增行口径** 0/0（LEDGER 全文含史录词面系既有在卷·非本笔贡献·如实登记口径；首跑红自纠=§9 ⑤ 草稿曾复抄词面入卷·已清出·如实留痕沿「首跑自匹配四命中如实纠」先例）；diff 面=`git diff --numstat HEAD` 恰 **2 tracked 全 .md**（本卷+LEDGER·派单令「恰 1-2 tracked」上界内·其中 LEDGER 系派单令明示消账笔载体·§3-4 共享 SSOT 零改条款对 LEDGER 的只读边界由派单令后位明示消账笔授权破例一次·批表 :213/:216 计数零触·Ban 面其余零犯）；卫生：`.env*` ABSENT·`actualSpendCny=null`·est live=0·零模型外呼。

**⑥ LEDGER 消账笔（落点=`ai-docs/delivery/harness/product-campaign-LEDGER.md:87` 5C 可靠性行 `#248/#245/#246/#172/#14/#216 — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）` 段后 append）**：笔文=「**TRACE-SERVICE-WIRE 登记消账：两触点码面已随 sse-api-family 9af6bb99 落主线·翻面载体亲证（:492 刀位图行 ✅ nail 收官+is-ancestor 对 HEAD EXIT=0+本卷 §9）·批表不计件（消账≠翻面·翻面权归协调方 nail 时行使）**」。批表亲证：:213 批5 行头现值 **85/143**·:216 合计行尾 erratum 现值 **209（77.1%）**——两处**计数零触**（消账≠翻面）。#172 残余（A2 recon 回补臂）登记承接：归后继观测刀（LEDGER :87 四子刀 OBS 域在案·本卷 §0.2-3/§1.3 候选丙登记为派单输入）·本 EXEC 零码。

**⑦ STOP 终态**：三处同值翻面（前值 `draft:awaiting_pre_exec_dual` 史录）→**`executed:awaiting_post_prove_dual`**（Status 行+§8 头+卷尾 trailer 恰三处·沿 worker-hang-guard `f9416486` 三处同值翻面先例）·post-prove 双审两独立外席待派·翻面权归协调方（本刀不宣称关闭）·⛔push。

---

*TRACE-SERVICE-WIRE REQUEST · 2026-10-16 起草落卷 · 2026-10-16 EXEC 登记落卷（§9 七字段·LEDGER :87 消账笔·并线 `10799a3e` 零冲突） · **`executed:awaiting_post_prove_dual`**（EXEC 翻面·前值 `draft:awaiting_pre_exec_dual` 史录·post-prove 双审两独立外席待派·alone≠dual·翻面权归协调方） · base `feat/mysql-schema-skeleton` @`5c8e122c`（origin tip 恒等·派单下界等号成立·EXEC 并线 tip=`10799a3e` 等号成立） · 分支 `line/trace-service-wire` · 工作树 `meetwise-ts` · 读码定稿=ai_invocation_trace.service 唯一写入口（invoke.ts persistTrace :502/:508·spec.service 透传·0011 列源）+生产 invoke 关口十站点全带 service（#14/#216 两同形触点已由 9af6bb99 sse-api-family 件② 落码闭合·源级门三臂机检恒锁·盘点快照滞后如实登记 §0.2-1/2）+service 枚举定稿（REGISTRY 八键∪registry 外三值·新站点一律取注册表键）+#172 fail-open 定性（trace=观测旁路+估算对账样本面·业务真相/计费/回放三面剥离不受损·失败日志 idempotencyKey+service 留痕=回补定位键·A2 recon 回补归后继观测刀·本刀只登记不落码 §1.3 候选丙）· 修法=docs-only 登记卷恰 1 .md（§1-修法·零产品码零迁移）· 门矩阵=ag19 50（源级门主验收）+metrics/uc028 双 proof+runtime-kernel 四件+estimate-threading+neg:all 692 六段+typecheck 8/8+lint 五值恰等 601/5235/1421/954/628+docs:check 2203≤2208（基线 2202 亲跑 EXIT=0）+markers 五类零命中+diff 恰 1 tracked+卫生（.env* ABSENT·actualSpendCny=null·est live=0）· 停止条件四类零触发 · 翻面权归协调方（本刀不宣称关闭） · ⛔push · ⛔force push · STOP*
