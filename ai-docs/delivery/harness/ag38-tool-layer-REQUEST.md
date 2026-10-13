# AG-38 — 问答侧只读受限工具层（REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（rev1 起草落卷 · **rev2 修订 2026-10-13**：pre-exec 双审两外席 FAIL·勘误席将两席 findings 全数处置（blocking×6/errata×11/note×2·逐条处置见卷尾「rev2 勘误席处置摘要」）·⛔push·docs-only 恰 1 .md·零码动·**STOP 维持**·待预执行双审两外席重审。Ban self-approve · alone≠dual · Dual PASS ≠ 开工）。

**席位**：meetwise 战役 AG-38（问答侧只读受限工具层）REQUEST 起草席（docs-only·零码动·恰 1 新文件落卷）。
**基线**：主线 tip `849a0f19`（`git log -1` 开工实测 2026-10-13·docs(ssot) BILL3 话题结算 nail 收官登记·零码面）。分支 `line/ag38-tool-layer` · 工作树 `../meetwise-ag38`（仓根同级·本起草席已立：`git worktree add ../meetwise-ag38 -b line/ag38-tool-layer 849a0f19`·建前亲证 `worktree list` 零 ag38 树 + `branch -a` 零同名）。**rev2 实测注（勘误席）**：战役主线（`feat/mysql-schema-skeleton`）tip 已前移 `849a0f19`→`94b8519b`（`c4ef2c7f` 刀位图深夜刷新 + `94b8519b` billing P3 行勘误·两笔均 docs(ledger) 仅触 product-campaign-LEDGER.md·零码面·勘误席 git 亲证）——本卷基线引用维持起草时点实测·EXEC 立项重 pin 时照实测登记即可。
**防重对表（亲证）**：`git worktree list | rg -i "ag38|tool-layer"` → EXIT=1；`git branch -a | rg -i "ag38|tool-layer"` → EXIT=1；`rg -n "ag38|ag-38|tool-layer" ai-docs/delivery/harness/` → EXIT=1 零同名刀卷。→ **停止条件未触发·可建树落卷**。
**蓝本（四源）**：①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c3cb3`）AG-38 总览 **:50**·条目 **:466-476**（§1-A 全文誊录）②同目录 `README.md`（blob `80129eed1edb`）**「设计决策：工具（function calling）使用边界」:162-197**（§1-B 全文誊录·**本刀修法语义权威**）③同目录 `EXPERT-REVIEWS.md` **§五 invoke(null) 续跑四边界**（循环续跑纪律参照·§1-C-4）④`ai-docs/architecture/ai/tool-skill-memory-runtime-design.md`（blob `834f562847c2`）**:26 工具原语行**（proof 6 断言·运行时调用点 0·缺口=durable ToolCall/授权/幂等副作用/artifact/resume/成本审计）+ **:40**（steps 仅进程内·无 checkpoint 恢复语义）——本刀即「授权+成本审计+受限接线」三缺口的受限补面·**不补** durable/resume（§3）。旁证：`LANDING-INDEX.md` §八 **:58-62**（AG-38 由 P3 调 P2·「问答侧能力建设」「评估侧零改动」）+ `review-log.md` **:18**（AI-07「runToolLoop 存在但未接线·部分成立」）。

## §0 现状锚（起草席亲读·base `849a0f19`·file:line/blob 逐条 rg/sed/git rev-parse 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号；rev2 勘误席已对 §0.1-1/2/3 与 §0.2 全量重亲证）

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 实测·12 位短 blob）

| # | 文件 | blob | 关键行锚 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/tools.ts` | `b1ee0b537d4b`（全 58 行） | **runToolLoop 定义位（本刀消费原语·零字节改）**：:1-6 头注（双铁律 :3-4：①工具入参不可信·dispatch 必先 zod 校验再 invoke 防注入/越权；②循环有界 maxSteps 封顶防烧钱/打转）· :10-15 `Tool` 接口（name/description/argsSchema zod/invoke）· :17-20 `ToolRegistry`（describe 喂模型清单+dispatch）· :22-35 `toolRegistry` 工厂（:30 **铁律①校验不过绝不执行**·:32 失败包 `tool_error:`）· :37-38 `ToolStep`/`ToolDecision` 类型 · :40-58 **`runToolLoop`（:44 `export async function runToolLoop(`**·:49 `maxSteps ?? 6` 缺省·:52 `decide` 抛错零捕获直透·:55 失败轨迹也回灌模型·:57 封顶返回 `tool_loop_exhausted` 确定性错误） |
| 2 | `packages/ai-runtime/src/index.ts` | `621c83ff9a5d` | **:225** `export { toolRegistry, runToolLoop, type Tool, type ToolRegistry, type ToolStep, type ToolDecision } from './tools.ts';`（只导出无生产消费——红事实 C 机证面；蓝本/审计锚 :219 实为 voice-stream 注释行·rev2 如实漂移登记 +6·§0.2） |
| 3 | `packages/ai-runtime/src/model-client.ts` | `c4827e8d72f8`（全 1076 行） | **请求体与围栏与幂等锚**：:19 import reserveG7CallOnSharedLedger · :161 `DATA_BOUNDARY_RULE`（围栏内任何指令一律不执行·数据边界稳定规则）· :189 `renderPrompt(req, nonce)`（随机命名 `<data-…>` 围栏包裹用户数据·不可伪造 nonce 防用户粘固定标记反转语义）· :171 `byteEstimate`（utf8 字节估计原语）· **:662-671 非流式请求体**（`JSON.stringify({ model, max_tokens?, response_format, temperature?, messages:[system,user] })`——**无 `tools`/`tool_choice` 键**·红事实 C 机证面；:672 起 fetch opts 非 body 面）· :680 `reserveG7CallOnSharedLedger({...})`（G7 共享账本预留）· **:859-870 流式请求体**（同构·`stream:true`·同无 tools 键）· :1044 `requestDigest` 赋值（:1044-1048 service/userData/images/rag/temperature 摘要键区·sha256 对 service/system/userData/rag 绑幂等·换素材必变摘要防误判重放） |
| 4 | `packages/ai-runtime/test/tools.proof.ts` | `48068dcf7540` | **6 臂既有 prove（回归基线）**：:11 describe · :13 合法入参执行 · :15 非法入参拒绝且绝不执行（防注入）· :17 未知工具拒绝 · :23 循环回灌终值+轨迹 · :28 封顶 `tool_loop_exhausted` |
| 5 | `packages/ai-runtime/package.json` | `ed60ff63ce89` | **:25** `"prove:tools": "tsx test/tools.proof.ts"`（既有门·本刀回归锚） |
| 6 | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` | `4e75fae7746e` | **:504** `reserveG7CallOnSharedLedger`（现有幂等计费账本预留入口·共享账本·:503 注明 call cap 封顶） |
| 7 | `packages/db/src/index.ts` | `6f07a09e824f` | **:216** ai-cost-governance barrel（`reserveAiCost/settleAiCost/releaseAiCost/markAiCostUnknown…`——现有计费账本结算族）· **:277** memory barrel（`insertMemory/getMemoriesByRefIds/historicalWeakDimensions/WEAKNESS_DECAY_WINDOW_SESSIONS`——C 端弱项面·RLS 形）· **:457** `snapshotInterviewRoute/getInterviewRouteSnapshot`（面试路由快照读面） |
| 8 | `packages/db/src/growth-generation.ts` | `b575214b57d9` | **C 端学习计划面（只读工具的数据源候选）**：:56 注释（读评估 dimensions → deriveLearningPlan → upsert learning_plan）· :64-66 `INSERT INTO learning_plan(id, owner_user_id, interview_id, items)`（**owner_user_id+interview_id 复合幂等键=owner 限定天然成形**·RLS 面沿 asPrincipal 同源纪律）· **仓内零 learning_plan 读函数**（rg 亲证·读面=EXEC 新增只读 SELECT·§4-④） |
| 9 | `ai-docs/delivery/ai-capability-review/issues-final.md` | `dac7f58c3cb3` | **:50** 总览行（P2·工具）· **:466-476** AG-38 条目全文（§1-A）——只读引用 |
| 10 | `ai-docs/delivery/ai-capability-review/README.md` | `80129eed1edb` | **:162-197** 工具使用边界设计决策节全文（§1-B·修法语义权威）——只读引用 |
| 11 | `ai-docs/architecture/ai/tool-skill-memory-runtime-design.md` | `834f562847c2` | **:26** 工具原语行（6 断言+调用点 0+缺口清单）· **:40** steps 无恢复语义 · **§3** TARGET（ToolManifest/ToolCall ledger/显式图节点——**本刀只取其 read 类受限子集**·§3 范围外） |

### 0.2 漂移登记（复核快照（issues-final :471 pin）→ 现树 `849a0f19` 全亲读重 pin·rev2 勘误席重亲证）

| 蓝本锚（审计时点） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| `model-client.ts:404-421`（issues-final :471·「请求体从不带 tools」指称位） | 现树 **:404-421 已是 `coalesceTokenDeltas` 区**（L1 合帧行为面）；请求体实位 **:662-671（非流式·:672 起 fetch opts）** 与 **:859-870（流式）** | **大漂**（模型流式/合帧增量前推）·**结论不变**——两请求体逐键亲证均无 `tools`/`tool_choice`，红事实本体在且更强（双通道皆无）·**本卷即修 pin** |
| `tools.ts:44`（runToolLoop） | :44 逐位吻合（58 行全文件亲读） | **零漂** |
| `index.ts:219`（再导出） | 现树 **:225**（亲证 `:219` 实为 voice-stream 注释行·voice-stream 导出组插入前推 +6） | **漂移 +6 行·结论不变**——再导出在位·只导出无生产消费·红事实 C 本体在。**rev2 改判**：rev1 误登「零漂·逐位吻合」为假登记·勘误席如实改判漂移登记 |

## §1 红事实 + 修法

### 红事实 A：AG-38 条目全文（issues-final **:466-476**·逐字誊录·只读引用）

> ### AG-38【P2·工具】请求体从不带 tools/tool_choice（没有原生 function calling）；ai-runtime 里的 runToolLoop 有界工具循环只导出，生产零调用。主面试回路用代码前置检索是合理的，但开放问答类场景缺少只读工具层
>
> - **复核结论**：部分成立（“全仓没有工具循环”不准确：runToolLoop 存在但未接线）
> - **交叉印证路数**：1（agent-capability）
> - **源编号**：AI-07
> - **file:line**：packages/ai-runtime/src/model-client.ts:404-421；packages/ai-runtime/src/tools.ts:44；packages/ai-runtime/src/index.ts:219
> - **触发例子**：将来做“成长顾问对话”时，只能把所有上下文一次性塞进 prompt。
> - **用户影响**：目前没有影响，属于能力缺口；成长顾问与 B 端追问报告落地时将成为阻塞缺口。
> - **备注**：（2026-10-12 调级：成长顾问与 B 端追问报告需要只读工具，见 README 工具使用边界）
> - **修法**：混合式——面试出题与评分不接工具（系统按规则检索后喂入）；开放问答基于 runToolLoop 接只读受限工具：C 端成长顾问可查本人面试记录/弱项/学习计划，B 端追问报告可查本企业该场原答案与评分依据；权限在工具内强制（C 端仅本人，B 端仅本企业该场，不得查 C 端练习）；循环设轮数与 token 上限；每次调用走现有幂等与计费账本；工具结果按数据处理并复用数据边界围栏防注入。见 README「设计决策：工具（function calling）使用边界」。
> - **关联审计总表编号**：—

### 红事实 B：README 工具边界节全文（README **:162-197**·逐字誊录·**本刀修法语义权威**）

> ## 设计决策：工具（function calling）使用边界（2026-10-12，设计建议）
>
> > 本节是产品/架构设计建议，**不是**当前代码已落地的行为。用于约束后续工具接线，区分「评估固定流水线」与「开放问答受限工具循环」。
>
> ### 现状（代码）
>
> - `runToolLoop` **已实现**（有界工具循环、失败轨迹可回灌模型），但**生产无调用方**。
> - 定义：`packages/ai-runtime/src/tools.ts:44`（经 `packages/ai-runtime/src/index.ts:219` 再导出）；`rg runToolLoop` 在生产路径仅见定义/导出与测试、设计文档，**无 worker/graph 接线**。
> - 请求体从不带 `tools` / `tool_choice`（见 AG-38）。
>
> ### 该不该接工具
>
> | 场景 | 是否接工具 | 理由 |
> |---|---|---|
> | 面试出题与评分 | **不接** | 公平、可复现、可审计；资料由系统按规则检索后喂入模型，不由模型自选工具 |
> | C 端成长顾问（开放问答） | **接只读工具** | 按需查本人面试记录、弱项、学习计划，避免一次性塞满 prompt |
> | B 端追问报告（开放问答） | **接只读工具** | 按需查本企业该场面试的原答案与评分依据 |
>
> ### 权限与安全（工具内强制）
>
> 1. **只读**：开放问答工具一律只读，禁止写题库/改分/改记忆副作用。
> 2. **按用途限权**：
>    - C 端成长顾问：仅本人数据（本人面试记录、弱项、学习计划）；
>    - B 端追问报告：仅本企业该场面试的原答案与评分依据；
>    - **不得**查 C 端练习数据（B 端工具硬禁止）。
> 3. 权限检查写在**工具实现内**强制执行，不依赖 prompt 约定。
> 4. **循环有界**：轮数上限 + token 上限（复用 `runToolLoop` 的 maxSteps 等机制）。
> 5. **计费与幂等**：每次模型/工具调用走现有幂等与计费账本。
> 6. **防注入**：工具结果按**数据处理**（不可当指令执行），复用现有数据边界围栏。
>
> ### 形态：混合式
>
> - **评估侧**（出题/评分）：固定流水线，系统检索喂入，无 function calling。
> - **问答侧**（成长顾问 / B 端追问报告）：受限只读工具循环。
>
> 见 AG-38（已于 2026-10-12 由 P3 调为 P2）。

（誊录注·rev2：上引 README **:169** 原文在「`rg runToolLoop` 在生产路径…」处含「`<外部只读快照>/meetwise-latest`（落地形式调整·原文本机快照径）」径符括注·本誊录略——非语义面·路径以现树工作树为准。）

### 红事实 C：runToolLoop 已实现·生产零调用（机证三段）

1. **原语已落且证明在卷**：`tools.ts:44`（§0.1-1·58 行全文件亲读：zod 前置校验不过绝不执行 :30·失败轨迹回灌 :55·`maxSteps ?? 6` 缺省 :49·`tool_loop_exhausted` 封顶 :57·decide :52 零捕获直透）；`prove:tools` **6 臂既有 EXIT=0 基线**（§0.1-4/5·schema 拒绝/未知工具拒绝/封顶/失败轨迹全覆盖）。
2. **生产零调用（rg 全仓机证）**：`rg -ln "runToolLoop" -g '!node_modules' .` 恰 **13 文件命中=12 外部+本卷自 1**（rev1 误记 12·rev2 勘误席亲证改口径）——外部 12=代码 3（`tools.ts` 定义 + `index.ts:225` 再导出 + `test/tools.proof.ts`）+ ai-capability-review 五件（issues-final/issues-final.csv/README/review-log/**LANDING-INDEX**·rev1 清单漏 LANDING-INDEX）+ architecture 两件（tool-skill-memory-runtime-design/research-capability-gate）+ use-cases 两件（expert-interview-coach-agent-graph/expert-interview-coach-rag-runtime）+ 本卷 `ag38-tool-layer-REQUEST.md` 自 1（正文 rg 命令自匹配·正常）——**apps/、worker/graph 零命中·生产调用点=0**（与 tool-skill-memory-runtime-design.md :26「运行时 graph/worker 调用点数为 0」及 README :168 双席验证一致）。
3. **请求体零 tools 键（红事实强证）**：`model-client.ts:662-671`（非流式）与 `:859-870`（流式）逐键亲证均无 `tools`/`tool_choice`（§0.2 漂移后重 pin）——原生 function calling 通道不存在；**本刀修法不启用该通道**（runToolLoop 是 prompt 级 ReAct 循环·decide 输出解析出 `ToolDecision`·请求体面零改·§1-修法①）。
4. **缺口面如实承登（design doc :26/:40）**：durable ToolCall、resume/replay、steps 进程外持久化、工具结果 artifact——**本刀不补**（§3-4）；本刀补其受限子集=授权（工具内强制）+成本审计（既有账本+steps 轨迹）+受限接线（问答侧）。EXPERT-REVIEWS §五四边界（invoke(null) 续跑·getState 判非空先看 snap.next·续跑后重读基线·守卫用现成谓词·残余窗口如实披露）为循环宿主将来接入图续跑时的纪律参照——**本刀循环面为单请求进程内有界循环·零续跑承诺**（§3-4 同源·不预支 resume 语义）。

### §1-修法（混合式只读受限工具层·README :162 节六条款逐条兑现·评估侧与请求体零字节）

**① 混合式分界（README「形态：混合式」）**：评估侧（出题/评分）**零触**——adaptive-interview 全链、crag、qbank 检索、model-client 请求体 **:662-671/:859-870 零字节改**（不加 `tools`/`tool_choice`）。问答侧新增受限循环面：消费既有 `runToolLoop`（tools.ts:44）+`toolRegistry`（:22-35），`decide` = 问答模型经**既有 invoke 关口**（双校验/digest 幂等不旁路·零新模型通道）。工具清单经 `registry.describe()` 进 prompt（`Tool.description` 既有字段）·模型输出由 decide 解析为 `ToolDecision`（`{kind:'tool'}` / `{kind:'final'}`）。

**② 只读工具集（契约级定义·实现留 EXEC 细化）**——全部 `class:'read'`·零写句柄：

| 工具名 | 用途方 | 入参（**不含任何身份字段**·见③⑦） | 返回（数据源） | 权限根（构造期绑定） |
|---|---|---|---|---|
| `get_my_interview_records` | C 端成长顾问 | `{ limit?, cursor? }` | 本人面试记录摘要（interview 表 RLS owner 面） | 认证用户本人（asPrincipal 同源） |
| `get_my_weak_points` | C 端成长顾问 | `{ window? }` | 本人弱项维度（`historicalWeakDimensions`·db/index.ts:277·衰减窗常量既有） | 同上 |
| `get_my_learning_plan` | C 端成长顾问 | `{ interview_id? }`（**选择器豁免**·§8-⑦：owner 谓词内数据选择器非权限根） | 本人学习计划（learning_plan·growth-generation.ts:64 owner_user_id 键·只读 SELECT） | 同上 |
| `get_session_original_answers` | B 端追问报告 | `{ page? }` | **绑定会话**的原答案（未清除行·见⑧） | recruiter owner+该场 interview（谓词见②注·构造期校验一次） |
| `get_session_scoring_basis` | B 端追问报告 | `{ page? }` | 绑定会话的评分依据（评估 dimensions/评分轨迹投影） | 同上 |

B 端两工具**硬禁 C 端练习数据**：绑定 interview 的 kind/用途在构造期断言非 C 端练习面，工具实现内拒绝任何跨会话/跨企业参数路径（入参 schema 根本不含 interview_id/org_id——会话绑定是构造期闭包常量·模型无法改道）。**B 端租户谓词（rev2 明示·防 EXEC 发明 org 表）**：schema 无 org 表——B 端租户=recruiter owner（`job_application.recruiter_user_id` 等值·0005 迁移 RLS policy 同源）+ 会话绑定 join（`interview.application_id`→`job_application.id`·0046 迁移同源）→该场 interview·构造期校验一次。**E6 同意门（rev2 增补·双审 findings 行使）**：B 端读候选人评估数据沿既有 E6 同意门 fail-closed——无 `b_qualitative_share` 同意行→`disclosed=false` 未披露态→`not_available`·只回聚合计数既有面·**绝不绕过 `b_*_share` 同意行直读**（recruiter.service.ts:105-130 `gateway_b_qualitative_projection` 同源既有语义·§8-⑥/§1-⑧ 同源承登）。

**③ 权限在工具实现内强制（README 权限与安全 2/3·不依赖 prompt 约定）**：每个 `Tool.invoke` 闭包在**registry 构造期**捕获服务端认证上下文（principal user/recruiter owner/interview 绑定·B 端租户谓词见②注），读取全部经既有 asPrincipal+RLS 面（与 memory:prove 双 owner RLS 同源纪律）；**argsSchema 一律不含身份字段**（user_id/org_id/interview_id 非绑定场景不入参）——模型可控入参面与权限根正交·即使注入诱导改参也无身份可改（铁律①「入参不可信」的权限版延伸）。**选择器豁免（§8-⑦·协调方 rev2 已裁决）**：`get_my_learning_plan` 可选 `interview_id` 系 owner 谓词内**数据选择器、非权限根、不在禁列**——owner 等值谓词强制+proof 负臂断言跨 owner `interview_id` 恒空（§5 Ban 同源措辞）。工具实现内二次断言（防御纵深）：查询谓词强制 owner/租户等值·RLS 之下再叠应用层谓词。

**④ 循环有界（README 权限与安全 4）**：`runToolLoop` 第三参 `maxSteps` **显式设定**（不用缺省 6 的隐式值·显式值裁决归 §8-⑧）+ **token 上限**：decide 每步调用前对照既有 context-budget 计量原语（实名亲证：`estimateContextTokens` context-budget.ts:137 / `planDispatchBudget` :276 / `byteEstimate` model-client.ts:171——rev1 误名 `estimateTokens` 仓内不存在·rev2 更正）计量（累计 steps 轨迹+本轮围栏段字节数）·超限即不再发起模型调用·直接返回确定性 `final`（附「已达上限」如实披露）——封顶路径 `tool_loop_exhausted`（tools.ts:57）与 token 超限路径均确定性失败·**零无界烧钱面**。**decide 失败语义（rev2 增补承登）**：decide 内 invoke 失败=循环**确定性中止**·异常透传宿主 outcome·**零循环内重试·零 requeue 承诺**（tools.ts:52 `decide` 抛错零捕获直透的现状如实承登为语义·沿 invoke 已计费请求不自动重试既有纪律·agent-runtime.md:131/:140 原话「不自动重试/unknown 不自动 failover」）。

**⑤ 计费与幂等走现有账本（README 权限与安全 5·零新计费路径）**：循环内每次模型调用（decide）都经既有 invoke——requestDigest 幂等（model-client.ts:1044）+ G7 共享账本预留（:680 reserveG7CallOnSharedLedger·db :216 结算族）**原样生效·零旁路**。只读工具本体零费用（纯 SELECT）·但其调用以 `ToolStep` 轨迹（tool/args/result）留存于循环返回值·随宿主应答入审计面——成本审计缺口的受限补法（design doc :26 缺口清单对账）。**量化注记（rev2 增补）**：4-6 步循环=每次应答最多 **4-6 笔 G7 预留**（每次 decide 一笔·model-client.ts:680 调用点+g7-freetier-reprove-guard.ts:504 预留入口）——本刀零宿主接入故**零 callCap 变更**·宿主刀接入时扩 callCap 预算（承登非本刀面）。

**⑥ 工具结果按数据处理·复用围栏防注入（README 权限与安全 6）**：工具结果（`ToolStep.result`）回灌**只经既有 `<data-*>` nonce 围栏**（DATA_BOUNDARY_RULE :161 稳定规则+renderPrompt :189 随机命名围栏）作为 user 段数据·**绝不进 system 段·绝不拼为指令文本**；围栏内任何指令一律不执行的既有规则原样覆盖工具结果。入参侧防注入沿用铁律①（argsSchema zod 校验不过绝不执行·tools.ts:30·`prove:tools` :15 臂既有）。工具结果超长沿既有截断标记语义（同名「内容过长已截断-…」可伪造标记防·:161 规则文内已有）。

**⑦ 只读铁律（README 权限与安全 1）**：五工具全部零 INSERT/UPDATE/DELETE 句柄·数据源只挂 SELECT 面（db 读函数/RLS 视图）·禁写题库/改分/改记忆（memory 写入面零触·insertMemory 不入工具集）。

**⑧ 原答案保留策略交互（如实承登·非阻塞）**：B 端 `get_session_original_answers` 受既有保留纪律约束——payload answer TTL 清理（#18 滞留半·TTL-WIRE 已接线）与「8k 回答消费后清除」既有面可能使原答案已清除；已清除行**如实返回 not_available 降级**（评分依据投影不受影响）·**绝不**为本工具延长明文保留（§3-7·保留策略调参另刀另议）。**E6 同意门（rev2 增补）**：B 端读取沿既有同意门 fail-closed——无 `b_qualitative_share` 同意行→`disclosed=false` 未披露态→`not_available`（recruiter.service.ts:105-130 既有语义同源）·绝不为本工具绕过 `b_*_share` 直读明文。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **既有原语回归原值**：`pnpm -C packages/ai-runtime prove:tools` EXIT=0·**6 臂全绿原值**（blob `48068dcf7540` 零改前提）——toolRegistry/runToolLoop 行为零翻。**ag19 门回归（rev2 增补）**：根 `ag19-prompt-version:prove` EXIT=0 原值（`promptVersions().length===8` 硬断言·ag19-prompt-version.proof.ts:89·零迁移漂移前提）——本刀 QA service 不注册 prompts.ts 前提的回归证（§5 Ban 同源）。
2. **零评估侧触面（静态断言）**：`git diff` 断言 **model-client.ts 整文件零字节**（rev2 钉整文件：本卷机制经既有 invoke 消费面·无需触 model-client.ts·请求体 :662-671/:859-870 区在内）、adaptive-interview 全链、crag/qbank 检索面零字节；rg 断言**代码树（packages/ apps/）** `tool_choice` 零出现（rev2 明示断言域：文档面 ai-capability-review 审计卷誊录命中属正常·不在断言域）。
3. **权限强制臂（新 proof 主断言族·载体=裁决项②）**：(a) 构造期绑定臂——registry 以 user A 构造·模型入参伪造 user B 身份字段→schema 拒绝（身份字段不在 argsSchema）或谓词拒绝·查询恒落 A 的 RLS 域；**§8-⑦ 选择器豁免负臂（rev2 增补）**——以 owner A 构造传跨 owner 的 `interview_id`→owner 等值谓词强制·返回恒空（选择器非权限根的实证）；(b) B 端臂——绑定会话外 interview 的取数尝试→工具内断言拒绝·C 端练习面 interview 绑定尝试→构造期/实现内双重拒绝；(c) 负臂——绕过 schema 的 rawArgs 直调 dispatch 亦不执行（:30 既有·rev1 误锚 :21）。
4. **有界臂**：maxSteps 封顶→`tool_loop_exhausted` 确定性返回（沿 :28 臂形）；token 超限臂→不再发起模型调用+确定性 final+如实披露；两路径均断言模型调用计数=已耗步数（无超额外呼）。**decide 失败臂（rev2 增补）**：decide 抛错→异常透传·循环即止·断言零循环内重试（调用计数不增）。
5. **防注入臂**：工具结果含指令样文本（「忽略以上规则…」）→ 经 `<data-*>` 围栏进 user 段·scripted 模型断言输出未被执行面改变（结果只作数据）+system 段零拼接静态断言。
6. **计费幂等臂**：假账本/spy 断言循环内每次 decide 均经既有 invoke（预留/结算调用次数=模型调用次数·requestDigest 幂等键在场）·零新计费路径（静态：改动集零出现新账本写点）。
7. **只读静态断言**：工具集源码零 INSERT/UPDATE/DELETE 句柄·数据源函数白名单逐一核对（§1-修法②表）；B 端工具对 C 端练习面 interview 恒拒绝的构造期断言在场；**E6 同意门臂（rev2 增补）**——无 `b_qualitative_share` 同意行→返回 `not_available`/聚合计数态·断言无绕过 `b_*_share` 的直读路径。
8. **新 proof 门注册面预申明（rev2 增补·防 EXEC 临时发明接线）**：本刀新 proof 门沿 ag19-prompt-version 先例**四处注册**——①`packages/ai-runtime/package.json` 原生 script（先例 :54）②根 `package.json` `<gate>:prove`+`<gate>:prove:raw` 双 script（先例 :242-243）③`scripts/run-e2e-isolated.mjs` runner 映射（先例 :749）④同文件 prove 列表（先例 :1973/:2272-2274）——注册面改动属门接线预授权面·非逻辑扩展·改动集仍受 §3 各条约束。

## §3 范围外（边界清单·越界即 FAIL）

1. **成长顾问/B 端追问报告产品本体零触**：对话服务/API 路由/前端/产品排期（LANDING-INDEX :62「挂用户产品排期」）——本刀只交付受限工具层库面+证明·宿主接入另刀。
2. **评估侧零触**：出题/评分链、adaptive-interview、crag、qbank 检索、`model-client.ts` **整文件**（含请求体 :662-671/:859-870 区）零字节——**不启用** `tools`/`tool_choice` 原生 function calling 通道（升级另议·裁决项⑤）。
3. **原语零改**：`tools.ts`/`index.ts:225` 零字节（§5 Ban 同源）·`prove:tools` 6 臂原值。
4. **durable/resume 零预支**：ToolCall 持久化、checkpoint 恢复语义、ToolNode/条件边、工具结果 artifact、跨请求重放（design doc :26/:40 未实现面）——循环为单请求进程内有界·零续跑承诺。
5. **零写面**：零写副作用工具、零新迁移/DDL/新存储面、memory 写入面零触、题库/评分/记忆零改。
6. **零跨租户打开**：B 端工具不触他企业·不触 C 端练习（硬禁·§1-修法②③）。
7. **保留策略零调参**：TTL purge 值/8k 清除纪律原值（§1-修法⑧ not_available 降级即终态·不为本刀延长明文保留）。
8. **共享 SSOT 零改**：LEDGER/checklist/issues-master/ai-capability-review 四件只读引用（AG-38 行翻面权归协调方）。

## §4 依赖

**零未决硬依赖**：①原语+prove 已落主线（tools.ts/index.ts:225/tools.proof 6 臂·基线树亲证在位）——无前置刀；②幂等计费账本现有（G7 共享账本 :680/:504+db :216 结算族+digest :1044）原样可复用；③数据围栏现有（:161/:189）原样可复用；④数据源=**表/行面现有·缺口读函数=EXEC 新增只读 SELECT（零迁移零 DDL）**（rev2 如实改口）：memory 弱项投影读函数现成（`historicalWeakDimensions` db/index.ts:277）；learning_plan 仅 upsert（growth-generation.ts:64-66·复合幂等键）**仓内零读函数**；C 端面试记录读面现成于 **apps/api 层**（interview.controller.ts :168 列表/:173 详情·服务层同域）**非 db barrel**——读函数落位与 §8-① 宿主形态联动·属 EXEC 细化非新依赖；⑤无迁移编号交点（零迁移·新增只读 SELECT 不占迁移号）；⑥下游消费者（成长顾问/B 端追问报告）未开工——本刀为其前置能力·交付后挂产品排期接入·**无在飞刀同文件交**（rev1 恰 1 新 .md·rev2 仍恰 1 .md 改·零码交点）。

## §5 Ban 列表 + pins（沿 ag37/ag-f/authz 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件行与统计只读引用·AG-38 行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改 `runToolLoop`/`toolRegistry` 原语（tools.ts/index.ts:225 零字节·只新增消费面·prove:tools 6 臂原值零翻）；Ban 触评估侧（出题/评分链·adaptive-interview·crag·qbank 检索零字节·README「面试出题与评分不接」）；Ban 在请求体加 `tools`/`tool_choice`（原生 function calling 通道不启用·§3-2）；Ban 写副作用工具与写句柄（五工具全 read·零 INSERT/UPDATE/DELETE·禁写题库/改分/改记忆）；Ban 身份字段入模型可控入参（argsSchema 零 user_id/org_id/绑定 interview_id——权限根唯一合法位置=registry 构造期闭包绑定；**唯一豁免（协调方 rev2 已裁决·§8-⑦）**：`get_my_learning_plan` 可选 `interview_id` 系 owner 谓词内**数据选择器、非权限根、不在禁列**——owner 等值谓词强制+proof 负臂断言跨 owner interview_id 恒空）；Ban 依赖 prompt 约定做权限（README 权限 3·权限检查必须写在工具实现内）；Ban 工具结果出围栏（只经 `<data-*>` nonce 围栏进 user 段·禁进 system/禁拼指令文本）；Ban 无界循环（maxSteps 必显式+token 上限必设·缺省 6 不得隐式依赖）；Ban 新计费路径（只走既有 invoke+G7 共享账本+digest 幂等·零旁路零双轨）；Ban B 端工具触 C 端练习数据与他企业数据（硬禁·构造期+实现内双断言）；**Ban 绕过 E6 同意门读候选人评估数据（rev2 增补）**（B 端沿既有 `b_qualitative_share` 同意门 fail-closed·无同意行→`disclosed=false`→`not_available`·绝不绕过 `b_*_share` 直读·recruiter.service.ts:105-130 既有语义同源）；**Ban 触 prompts.ts/model-operation-registry（rev2 增补）**（本刀 QA service **不注册**·`promptVersion` 落 NULL（invoke.ts:264-267 `registryPromptVersion` registry 外 service→undefined）·metric 走 `'(unregistered)'/'none'` 固定占位（:279）——纯观测既有语义非缺陷·注册另议）；Ban durable ToolCall/迁移/新存储面/artifact/resume 语义（§3-4）；Ban 为 B 端原答案读取延长明文保留或调 TTL（§3-7·not_available 降级即终态）；Ban 真实模型外呼（est live=0·scripted+假账本形）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/假账本/静态断言·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：权限/有界/防注入/计费各臂=scripted decide 假体+假账本 spy+静态源断言；原语回归=既有 `prove:tools` 6 臂原值重跑（ag19 门回归原值·§2-1）。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag38-tool-layer-REQUEST.md`·rev2 同文件修订仍恰 1 .md）**五类标记词 grep 零命中**（rev2 勘误席修订后复扫自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag37/ag-f/authz 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md·⛔push·零其他文件）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①工具层宿主形态**：(a) ai-runtime（或新受限问答面）库级受限循环包装器——构造期绑定身份的 registry 工厂+token 上限包装·products 后续接（**推荐**·与「产品挂排期」解耦·原语零改纯增量）(b) 直接预埋进未来成长顾问服务骨架（产品未立项·空转面）。(a) 落点包名与导出面 EXEC 定。
- **②权限绑定形**：(a) registry **构造期闭包绑定** principal/interview·argsSchema 零身份字段（**推荐**·模型零权限根·铁律①权限版·负臂最简）(b) invoke 时 context 参透传（多一重模型侧参数面·需证 schema 不可旁路）。
- **③工具结果回灌形**：(a) 全量经 `<data-*>` 围栏段进 user 消息（**推荐**·复用 :161/:189 既有语义零发明）(b) 先摘要化再入围栏（多一道加工面·摘要本身需防注入论证·仅当超长实证后再议）。
- **④token 上限计量口**：(a) 复用 context-budget 事前计量（实名 `estimateContextTokens` context-budget.ts:137/`planDispatchBudget` :276/`byteEstimate` model-client.ts:171·**推荐**·与既有预算器同源·决定「不再发起调用」时机确定性）(b) provider usage 回填事后累计（滞后一步·存在单步超额窗）。
- **⑤原生 function calling 升级时机**：(a) 本刀不做·保持请求体零 `tools`/`tool_choice`·runToolLoop prompt 级循环即满足 AG-38 修法（**推荐**·评估侧/请求体零触红线不破）(b) model-client 加可选 tools 透传通道（触 §3-2 范围外·需另开 REQUEST 重立）。
- **⑥B 端读函数选型与原答案 not_available 形**：具体 SELECT 面与已清除行返回形（(a) 结构化 `{available:false}` 明示·**推荐** (b) 空列表歧义返)——EXEC 按 §1-修法②⑧细化并如实登记。**E6 同意门（rev2 增补·协调方双审 findings 行使）**：B 端读候选人评估数据沿既有 E6 同意门 fail-closed——无 `b_qualitative_share` 同意行→`disclosed=false` 未披露态→`not_available`·只回聚合计数·**绝不绕过 `b_*_share` 同意行直读**（recruiter.service.ts:105-130 `gateway_b_qualitative_projection` 同源既有语义）。
- **⑦learning_plan `interview_id` 选择器豁免（rev2 登记·协调方已裁决行使）**：`get_my_learning_plan` 可选 `interview_id` 系 owner 谓词内**数据选择器、非权限根、不在身份字段禁列**——实现形=SQL 谓词 `owner_user_id` 等值强制+`interview_id` 可选等值过滤·proof 负臂断言跨 owner `interview_id` 恒空（§1-③/§5 Ban 同源措辞·§2-3(a) 臂覆盖）。本项为裁决行使登记·非开放选项。
- **⑧`maxSteps` 显式值（rev2 自 §1-④ 并入·形制一致）**：(a) 4 步 (b) 5 步 (c) 6 步——问答面建议 4-6 区间内 EXEC 裁决并登记；缺省 6 不得隐式依赖（显式传参面不变·tools.ts:49 缺省分支零依赖）。

## rev2 勘误席处置摘要（2026-10-13·pre-exec 双审两外席 FAIL→全数处置·STOP 维持）

计数口径：席1 B×2+E×6、席2 B×4+E×5+N×2·合计 **19 条=blocking×6 / errata×11 / note×2** 全处置（席2-B3 与席1-B2 同源·并案同一裁决行使·仍按两席各计）。所有新锚落笔前 sed/rg/git 亲证（两席行号有 ±1 处以亲证为准·已注）。

| # | findings | 处置 | 落点 |
|---|---|---|---|
| 席1-B1 | index.ts 再导出实位 :225 非 :219（:219 是 voice-stream 注释行）·「零漂·逐位吻合」假登记→如实漂移登记 +6 | §0.1-2 改 **:225** 并注 ：219=voice-stream 注释行；§0.2 第三行改判「漂移 +6·结论不变·rev1 假登记已改判」；§1-C-2、§3-3、§5 Ban、§4-① 同步 :225 | §0.1-2 / §0.2 表三行 / §1-C-2 / §3-3 / §5 / §4-① |
| 席1-B2（=席2-B3） | get_my_learning_plan 入参 `{interview_id?}` 与 §1-③/§5 Ban 三方矛盾→协调方裁决「选择器豁免」 | ③/② 表/Ban 三处明示「C 端可选 interview_id 系 owner 谓词内数据选择器、非权限根、不在禁列；owner 等值谓词强制+proof 负臂断言跨 owner interview_id 恒空」；§8 增裁决项⑦登记行使；§2-3(a) 增豁免负臂 | §1-② 表 / §1-③ / §5 Ban / §8-⑦ / §2-3(a) |
| 席1-E1 | tools.ts 行级锚系统性错位（头注/接口/registry/工厂/校验/tool_error/类型/maxSteps/回灌/封顶） | §0.1-1 全行更正（亲证：头注 :1-6·双铁律 :3-4·Tool :10-15·ToolRegistry :17-20·工厂 :22-35·铁律① :30·tool_error :32·ToolStep/ToolDecision :37-38·maxSteps ?? 6 :49·回灌 :55·tool_loop_exhausted :57·runToolLoop :44 不变）；§1-C-1、§1-①、§1-④、§1-⑥、§2-3(c) 同步 | §0.1-1 / §1-C-1 / §1-① / §1-④ / §1-⑥ / §2-3(c) |
| 席1-E2 | rg runToolLoop 命中 12→13（含 REQUEST 自命中；清单漏 LANDING-INDEX） | §1-C-2 改口径「13 文件命中=12 外部+本卷自 1」·清单补 LANDING-INDEX·architecture 实为两件（亲证） | §1-C-2 / 卷尾 |
| 席1-E3 | 「全仓 rg tool_choice 零出现」域失实 | §2-2 改域为代码树（packages/ apps/ 零出现·rg EXIT=1 亲证）·文档面审计卷+本卷誊录命中属正常不在断言域 | §2-2 |
| 席1-E4 | model-client 区间锚错位 | §0.1-3/§0.2/§1-C-3/§1-①/§3-2 改 :662-671（:672 起 fetch opts）/:859-870；requestDigest 改 :1044 赋值（:1044-1048 键区） | §0.1-3 / §0.2 / §1-C-3 / §1-① / §1-⑤ / §3-2 / §4-② |
| 席1-E5 | §1-B 誊录缺径符括注注记 | §1-B 块引后增誊录注（亲证：括注在 README **:169** 非 ：168·以亲证落笔） | §1-B 誊录注 |
| 席1-E6 | 主线 tip 前移 94b8519b（docs-only） | 基线行+卷尾补实测注：战役主线（feat/mysql-schema-skeleton）tip 849a0f19→94b8519b（c4ef2c7f+94b8519b 两笔 docs(ledger) 仅触 LEDGER·零码面·亲证）·EXEC 立项重 pin 照实测登记 | 基线行 / 卷尾 |
| 席2-B1 | B 端原答案工具缺 E6 同意门承登 | §1-② 注/§1-⑧/§8-⑥ 增「B 端读候选人评估数据沿既有 E6 同意门 fail-closed·无 b_qualitative_share 同意行→disclosed=false→not_available·绝不绕过 b_*_share」（亲证 recruiter.service.ts:105-130·席给 105-126 以亲证扩至 disclosed 判定 :130）；§2-7 增同意门臂；§5 增 Ban 绕同意门 | §1-② / §1-⑧ / §8-⑥ / §2-7 / §5 |
| 席2-B2 | prompts.ts 注册两可+ag19 门冲突 | §5 增「Ban 触 prompts.ts/model-operation-registry（QA service 不注册·promptVersion 落 NULL·metric 走 '(unregistered)' 占位既有语义）」（亲证 invoke.ts:264-267/:279·席给 :267 以亲证区间落笔）；§2-1 增 ag19-prompt-version:prove 回归门（proof :89 `length===8` 亲证） | §5 / §2-1 |
| 席2-B3 | =席1-B2 | 并案·同上裁决行使 | 见席1-B2 行 |
| 席2-B4 | decide 失败语义未规定 | §1-④ 增「decide invoke 失败=循环确定性中止透传 outcome·零循环内重试·零 requeue 承诺」（tools.ts:52 零捕获直透亲证·纪律原话以 agent-runtime.md:131/:140 中文原文落笔）；§1-⑤/§2-4 联动 | §1-④ / §1-⑤ / §2-4 |
| 席2-E3 | §4-④「数据源读面现有」对 learning_plan 不成立 | §4-④ 改口「表/行面现有·缺口读函数=EXEC 新增只读 SELECT（零迁移零 DDL）」；补 C 端面试记录读面在 apps/api 层（interview.controller.ts :168/:173 亲证）非 db barrel；§0.1-8 补「仓内零 learning_plan 读函数」 | §4-④ / §0.1-8 |
| 席2-E4 | 「model-client.ts 零字节」钉整文件 | §2-2/§3-2 钉 **model-client.ts 整文件零字节**（机制无需触它·请求体区在内） | §2-2 / §3-2 |
| 席2-E5 | 「estimateTokens」不存在 | §1-④/§8-④ 实名更正：`estimateContextTokens`（context-budget.ts:137）/`planDispatchBudget`（:276）亲证·`byteEstimate` 亲证实位 model-client.ts:**:171**（席给 ：172 有 ±1·以亲证落笔） | §1-④ / §8-④ |
| 席2-E6 | 「org∈会话」词汇无 schema 对应物 | §1-② 表权限根列与②注明示谓词「B 端租户=recruiter owner（job_application.recruiter_user_id 等值·0005 RLS 同源）+interview.application_id→job_application join（0046 同源）」·防 EXEC 发明 org 表；§1-③ 联动改「recruiter owner」 | §1-② / §1-③ |
| 席2-E7 | 新 proof 门注册面未预申明 | §2 增第 8 条：沿 ag19 先例四处注册预申明（根 package.json :242-243/ai-runtime package.json :54/run-e2e-isolated.mjs :749/:1973·亲证） | §2-8 |
| 席2-N1 | maxSteps 显式值裁决并入 §8（形制一致） | §1-④ 改「显式值裁决归 §8-⑧」；§8 增裁决项⑧（4/5/6 步·建议 4-6 内 EXEC 裁决） | §1-④ / §8-⑧ |
| 席2-N2 | 量化注记：4-6 步=每次应答最多 4-6 笔 G7 预留·宿主接入扩 callCap | §1-⑤ 增量化注记（model-client.ts:680 调用点+g7-freetier-reprove-guard.ts:504 预留入口亲证·本刀零 callCap 变更·宿主刀扩预算承登） | §1-⑤ |

---

*AG-38 REQUEST · 2026-10-13 · **rev2** · draft:awaiting_pre_exec_dual · rev1 基线主线 tip `849a0f19`（git log -1 开工实测 2026-10-13）· rev2 实测注：战役主线（feat/mysql-schema-skeleton）tip 已前移 `94b8519b`（c4ef2c7f+94b8519b 两笔 docs(ledger) 仅触 product-campaign-LEDGER.md·零码面·EXEC 立项重 pin 照实测登记）· 分支 `line/ag38-tool-layer` · 工作树 `../meetwise-ag38`（git worktree add 本起草席立·建前 worktree list+branch 双查零同名）· 蓝本=issues-final AG-38 :50/:466-476（全文誊录 §1-A）+ README 工具使用边界 :162-197（全文誊录 §1-B·修法语义权威·:169 径符括注誊录注）+ EXPERT-REVIEWS §五（循环续跑纪律参照）+ tool-skill-memory-runtime-design.md :26/:40（缺口对账：补授权/成本审计/受限接线·不补 durable/resume）+ LANDING-INDEX :58-62 + review-log :18 · 防重三对表过（worktree/branch/harness 零同名）· 红事实机证=rg runToolLoop 全仓 13 文件命中（12 外部+本卷自 1·LANDING-INDEX 在列）生产零调用+请求体双通道（:662-671/:859-870）逐键无 tools/tool_choice+prove:tools 6 臂既有 · 漂移登记=model-client :404-421→:662-671/:859-870+index.ts :219→:225（+6·:219 实为 voice-stream 注释行·rev1 误登零漂已改判·结论不变）· 修法=混合式只读受限工具层八条款（评估侧与请求体零字节/五只读工具契约/构造期权限绑定/循环有界双限/既有账本零旁路/围栏防注入/只读铁律/原答案保留交互如实承登）+ rev2 增补（E6 同意门承登/decide 失败确定性中止/选择器豁免 §8-⑦/prompts.ts 不注册 Ban/门注册面四处预申明 §2-8/G7 预留量化注记/maxSteps 裁决项 §8-⑧）· est live=0 · pins 十一值照抄 · markers=0 · rev2 勘误席处置摘要见卷尾 · ⛔push · STOP 维持 draft:awaiting_pre_exec_dual·待 pre-exec 双审两外席重审（Ban self-approve · alone≠dual · Dual PASS ≠ 开工）*
