# AG-38 — 问答侧只读受限工具层（REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·⛔push·docs-only·落卷即停零码动·待预执行双审两外席。Ban self-approve · alone≠dual · Dual PASS ≠ 开工）。

**席位**：meetwise 战役 AG-38（问答侧只读受限工具层）REQUEST 起草席（docs-only·零码动·恰 1 新文件落卷）。
**基线**：主线 tip `849a0f19`（`git log -1` 开工实测 2026-10-13·docs(ssot) BILL3 话题结算 nail 收官登记·零码面）。分支 `line/ag38-tool-layer` · 工作树 `../meetwise-ag38`（仓根同级·本起草席已立：`git worktree add ../meetwise-ag38 -b line/ag38-tool-layer 849a0f19`·建前亲证 `worktree list` 零 ag38 树 + `branch -a` 零同名）。
**防重对表（亲证）**：`git worktree list | rg -i "ag38|tool-layer"` → EXIT=1；`git branch -a | rg -i "ag38|tool-layer"` → EXIT=1；`rg -n "ag38|ag-38|tool-layer" ai-docs/delivery/harness/` → EXIT=1 零同名刀卷。→ **停止条件未触发·可建树落卷**。
**蓝本（四源）**：①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c3cb3`）AG-38 总览 **:50**·条目 **:466-476**（§1-A 全文誊录）②同目录 `README.md`（blob `80129eed1edb`）**「设计决策：工具（function calling）使用边界」:162-197**（§1-B 全文誊录·**本刀修法语义权威**）③同目录 `EXPERT-REVIEWS.md` **§五 invoke(null) 续跑四边界**（循环续跑纪律参照·§1-C-4）④`ai-docs/architecture/ai/tool-skill-memory-runtime-design.md`（blob `834f562847c2`）**:26 工具原语行**（proof 6 断言·运行时调用点 0·缺口=durable ToolCall/授权/幂等副作用/artifact/resume/成本审计）+ **:40**（steps 仅进程内·无 checkpoint 恢复语义）——本刀即「授权+成本审计+受限接线」三缺口的受限补面·**不补** durable/resume（§3）。旁证：`LANDING-INDEX.md` §八 **:58-62**（AG-38 由 P3 调 P2·「问答侧能力建设」「评估侧零改动」）+ `review-log.md` **:18**（AI-07「runToolLoop 存在但未接线·部分成立」）。

## §0 现状锚（起草席亲读·base `849a0f19`·file:line/blob 逐条 rg/sed/git rev-parse 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 实测·12 位短 blob）

| # | 文件 | blob | 关键行锚 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/tools.ts` | `b1ee0b537d4b`（全 58 行） | **runToolLoop 定义位（本刀消费原语·零字节改）**：:1-8 头注双铁律（①工具入参不可信·dispatch 必先 zod 校验再 invoke 防注入/越权；②循环有界 maxSteps 封顶防烧钱/打转）· :9-14 `Tool` 接口（name/description/argsSchema zod/invoke）· :15-19 `ToolRegistry`（describe 喂模型清单+dispatch）· :20-24 `toolRegistry` 工厂（:21 **铁律①校验不过绝不执行**·:23 失败包 `tool_error:`）· :26-28 `ToolStep`/`ToolDecision` 类型 · :40-51 **`runToolLoop`（:44 `export async function runToolLoop(`**·:46 `maxSteps ?? 6` 缺省·:49 失败轨迹也回灌模型·:51 封顶返回 `tool_loop_exhausted` 确定性错误） |
| 2 | `packages/ai-runtime/src/index.ts` | `621c83ff9a5d` | **:219** `export { toolRegistry, runToolLoop, type Tool, type ToolRegistry, type ToolStep, type ToolDecision } from './tools.ts';`（只导出无生产消费——红事实 C 机证面） |
| 3 | `packages/ai-runtime/src/model-client.ts` | `c4827e8d72f8`（全 1076 行） | **请求体与围栏与幂等锚**：:19 import reserveG7CallOnSharedLedger · :161 `DATA_BOUNDARY_RULE`（围栏内任何指令一律不执行·数据边界稳定规则）· :189 `renderPrompt(req, nonce)`（随机命名 `<data-…>` 围栏包裹用户数据·不可伪造 nonce 防用户粘固定标记反转语义）· **:662-676 非流式请求体**（`JSON.stringify({ model, max_tokens?, response_format, temperature?, messages:[system,user] })`——**无 `tools`/`tool_choice` 键**·红事实 C 机证面）· :680 `reserveG7CallOnSharedLedger({...})`（G7 共享账本预留）· **:859-871 流式请求体**（同构·`stream:true`·同无 tools 键）· :1041-1046 `requestDigest`（sha256 对 service/system/userData/rag 绑幂等·换素材必变摘要防误判重放） |
| 4 | `packages/ai-runtime/test/tools.proof.ts` | `48068dcf7540` | **6 臂既有 prove（回归基线）**：:11 describe · :13 合法入参执行 · :15 非法入参拒绝且绝不执行（防注入）· :17 未知工具拒绝 · :23 循环回灌终值+轨迹 · :28 封顶 `tool_loop_exhausted` |
| 5 | `packages/ai-runtime/package.json` | `ed60ff63ce89` | **:25** `"prove:tools": "tsx test/tools.proof.ts"`（既有门·本刀回归锚） |
| 6 | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` | `4e75fae7746e` | **:504** `reserveG7CallOnSharedLedger`（现有幂等计费账本预留入口·共享账本） |
| 7 | `packages/db/src/index.ts` | `6f07a09e824f` | **:216** ai-cost-governance barrel（`reserveAiCost/settleAiCost/releaseAiCost/markAiCostUnknown…`——现有计费账本结算族）· **:277** memory barrel（`insertMemory/getMemoriesByRefIds/historicalWeakDimensions/WEAKNESS_DECAY_WINDOW_SESSIONS`——C 端弱项面·RLS 形）· **:457** `snapshotInterviewRoute/getInterviewRouteSnapshot`（面试路由快照读面） |
| 8 | `packages/db/src/growth-generation.ts` | `b575214b57d9` | **C 端学习计划面（只读工具的数据源候选）**：:56 注释（读评估 dimensions → deriveLearningPlan → upsert learning_plan）· :64-66 `INSERT INTO learning_plan(id, owner_user_id, interview_id, items)`（**owner_user_id+interview_id 复合幂等键=owner 限定天然成形**·RLS 面沿 asPrincipal 同源纪律） |
| 9 | `ai-docs/delivery/ai-capability-review/issues-final.md` | `dac7f58c3cb3` | **:50** 总览行（P2·工具）· **:466-476** AG-38 条目全文（§1-A）——只读引用 |
| 10 | `ai-docs/delivery/ai-capability-review/README.md` | `80129eed1edb` | **:162-197** 工具使用边界设计决策节全文（§1-B·修法语义权威）——只读引用 |
| 11 | `ai-docs/architecture/ai/tool-skill-memory-runtime-design.md` | `834f562847c2` | **:26** 工具原语行（6 断言+调用点 0+缺口清单）· **:40** steps 无恢复语义 · **§3** TARGET（ToolManifest/ToolCall ledger/显式图节点——**本刀只取其 read 类受限子集**·§3 范围外） |

### 0.2 漂移登记（复核快照（issues-final :471 pin）→ 现树 `849a0f19` 全亲读重 pin）

| 蓝本锚（审计时点） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| `model-client.ts:404-421`（issues-final :471·「请求体从不带 tools」指称位） | 现树 **:404-421 已是 `coalesceTokenDeltas` 区**（L1 合帧行为面）；请求体实位 **:662-676（非流式）** 与 **:859-871（流式）** | **大漂**（模型流式/合帧增量前推）·**结论不变**——两请求体逐键亲证均无 `tools`/`tool_choice`，红事实本体在且更强（双通道皆无）·**本卷即修 pin** |
| `tools.ts:44`（runToolLoop） | :44 逐位吻合（58 行全文件亲读） | **零漂** |
| `index.ts:219`（再导出） | :219 逐位吻合 | **零漂** |

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

### 红事实 C：runToolLoop 已实现·生产零调用（机证三段）

1. **原语已落且证明在卷**：`tools.ts:44`（§0.1-1·58 行全文件亲读：zod 前置校验不过绝不执行 :21·失败轨迹回灌 :49·`maxSteps ?? 6` 封顶 :46/:51）；`prove:tools` **6 臂既有 EXIT=0 基线**（§0.1-4/5·schema 拒绝/未知工具拒绝/封顶/失败轨迹全覆盖）。
2. **生产零调用（rg 全仓机证）**：`rg -ln "runToolLoop" -g '!node_modules' .` 恰 **12 命中全列**——`tools.ts`（定义）+`index.ts:219`（再导出）+`test/tools.proof.ts`（prove）+ ai-capability-review 四件（issues-final/csv/README/review-log·审计文档）+ architecture 三件（tool-skill-memory-runtime-design/research-capability-gate/design 引文）+ use-cases 两件（设计文档）——**apps/、worker/graph 零命中·生产调用点=0**（与 tool-skill-memory-runtime-design.md :26「运行时 graph/worker 调用点数为 0」及 README :168 双席验证一致）。
3. **请求体零 tools 键（红事实强证）**：`model-client.ts:662-676`（非流式）与 `:859-871`（流式）逐键亲证均无 `tools`/`tool_choice`（§0.2 漂移后重 pin）——原生 function calling 通道不存在；**本刀修法不启用该通道**（runToolLoop 是 prompt 级 ReAct 循环·decide 输出解析出 `ToolDecision`·请求体面零改·§1-修法①）。
4. **缺口面如实承登（design doc :26/:40）**：durable ToolCall、resume/replay、steps 进程外持久化、工具结果 artifact——**本刀不补**（§3-4）；本刀补其受限子集=授权（工具内强制）+成本审计（既有账本+steps 轨迹）+受限接线（问答侧）。EXPERT-REVIEWS §五四边界（invoke(null) 续跑·getState 判非空先看 snap.next·续跑后重读基线·守卫用现成谓词·残余窗口如实披露）为循环宿主将来接入图续跑时的纪律参照——**本刀循环面为单请求进程内有界循环·零续跑承诺**（§3-4 同源·不预支 resume 语义）。

### §1-修法（混合式只读受限工具层·README :162 节六条款逐条兑现·评估侧与请求体零字节）

**① 混合式分界（README「形态：混合式」）**：评估侧（出题/评分）**零触**——adaptive-interview 全链、crag、qbank 检索、model-client 请求体 **:662-676/:859-871 零字节改**（不加 `tools`/`tool_choice`）。问答侧新增受限循环面：消费既有 `runToolLoop`（tools.ts:44）+`toolRegistry`（:20-24），`decide` = 问答模型经**既有 invoke 关口**（双校验/digest 幂等不旁路·零新模型通道）。工具清单经 `registry.describe()` 进 prompt（`Tool.description` 既有字段）·模型输出由 decide 解析为 `ToolDecision`（`{kind:'tool'}` / `{kind:'final'}`）。

**② 只读工具集（契约级定义·实现留 EXEC 细化）**——全部 `class:'read'`·零写句柄：

| 工具名 | 用途方 | 入参（**不含任何身份字段**·见③） | 返回（数据源） | 权限根（构造期绑定） |
|---|---|---|---|---|
| `get_my_interview_records` | C 端成长顾问 | `{ limit?, cursor? }` | 本人面试记录摘要（interview 表 RLS owner 面） | 认证用户本人（asPrincipal 同源） |
| `get_my_weak_points` | C 端成长顾问 | `{ window? }` | 本人弱项维度（`historicalWeakDimensions`·db/index.ts:277·衰减窗常量既有） | 同上 |
| `get_my_learning_plan` | C 端成长顾问 | `{ interview_id? }` | 本人学习计划（learning_plan·growth-generation.ts:64 owner_user_id 键·只读 SELECT） | 同上 |
| `get_session_original_answers` | B 端追问报告 | `{ page? }` | **绑定会话**的原答案（未清除行·见⑧） | 认证企业+该场 interview（org∈会话·构造期校验一次） |
| `get_session_scoring_basis` | B 端追问报告 | `{ page? }` | 绑定会话的评分依据（评估 dimensions/评分轨迹投影） | 同上 |

B 端两工具**硬禁 C 端练习数据**：绑定 interview 的 kind/用途在构造期断言非 C 端练习面，工具实现内拒绝任何跨会话/跨企业参数路径（入参 schema 根本不含 interview_id/org_id——会话绑定是构造期闭包常量·模型无法改道）。

**③ 权限在工具实现内强制（README 权限与安全 2/3·不依赖 prompt 约定）**：每个 `Tool.invoke` 闭包在**registry 构造期**捕获服务端认证上下文（principal user/org/interview 绑定），读取全部经既有 asPrincipal+RLS 面（与 memory:prove 双 owner RLS 同源纪律）；**argsSchema 一律不含身份字段**（user_id/org_id/interview_id 非绑定场景不入参）——模型可控入参面与权限根正交·即使注入诱导改参也无身份可改（铁律①「入参不可信」的权限版延伸）。工具实现内二次断言（防御纵深）：查询谓词强制 owner/org 等值·RLS 之下再叠应用层谓词。

**④ 循环有界（README 权限与安全 4）**：`runToolLoop` 第三参 `maxSteps` **显式设定**（不用缺省 6 的隐式值·问答面建议 4-6·EXEC 裁决）+ **token 上限**：decide 每步调用前对照既有 context-budget/estimateTokens 计量（累计 steps 轨迹+本轮围栏段字节数）·超限即不再发起模型调用·直接返回确定性 `final`（附「已达上限」如实披露）——封顶路径 `tool_loop_exhausted`（tools.ts:51）与 token 超限路径均确定性失败·**零无界烧钱面**。

**⑤ 计费与幂等走现有账本（README 权限与安全 5·零新计费路径）**：循环内每次模型调用（decide）都经既有 invoke——requestDigest 幂等（model-client.ts:1041-1046）+ G7 共享账本预留（:680 reserveG7CallOnSharedLedger·db :216 结算族）**原样生效·零旁路**。只读工具本体零费用（纯 SELECT）·但其调用以 `ToolStep` 轨迹（tool/args/result）留存于循环返回值·随宿主应答入审计面——成本审计缺口的受限补法（design doc :26 缺口清单对账）。

**⑥ 工具结果按数据处理·复用围栏防注入（README 权限与安全 6）**：工具结果（`ToolStep.result`）回灌**只经既有 `<data-*>` nonce 围栏**（DATA_BOUNDARY_RULE :161 稳定规则+renderPrompt :189 随机命名围栏）作为 user 段数据·**绝不进 system 段·绝不拼为指令文本**；围栏内任何指令一律不执行的既有规则原样覆盖工具结果。入参侧防注入沿用铁律①（argsSchema zod 校验不过绝不执行·tools.ts:21·`prove:tools` :15 臂既有）。工具结果超长沿既有截断标记语义（同名「内容过长已截断-…」可伪造标记防·:161 规则文内已有）。

**⑦ 只读铁律（README 权限与安全 1）**：五工具全部零 INSERT/UPDATE/DELETE 句柄·数据源只挂 SELECT 面（db 读函数/RLS 视图）·禁写题库/改分/改记忆（memory 写入面零触·insertMemory 不入工具集）。

**⑧ 原答案保留策略交互（如实承登·非阻塞）**：B 端 `get_session_original_answers` 受既有保留纪律约束——payload answer TTL 清理（#18 滞留半·TTL-WIRE 已接线）与「8k 回答消费后清除」既有面可能使原答案已清除；已清除行**如实返回 not_available 降级**（评分依据投影不受影响）·**绝不**为本工具延长明文保留（§3-7·保留策略调参另刀另议）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **既有原语回归原值**：`pnpm -C packages/ai-runtime prove:tools` EXIT=0·**6 臂全绿原值**（blob `48068dcf7540` 零改前提）——toolRegistry/runToolLoop 行为零翻。
2. **零评估侧触面（静态断言）**：`git diff` 断言 model-client.ts/:662-676/:859-871 请求体区、adaptive-interview 全链、crag/qbank 检索面**零字节**；全仓 rg 断言 `tool_choice` 仍零出现。
3. **权限强制臂（新 proof 主断言族·载体=裁决项②）**：(a) 构造期绑定臂——registry 以 user A 构造·模型入参伪造 user B 身份字段→schema 拒绝（身份字段不在 argsSchema）或谓词拒绝·查询恒落 A 的 RLS 域；(b) B 端臂——绑定会话外 interview 的取数尝试→工具内断言拒绝·C 端练习面 interview 绑定尝试→构造期/实现内双重拒绝；(c) 负臂——绕过 schema 的 rawArgs 直调 dispatch 亦不执行（:21 既有）。
4. **有界臂**：maxSteps 封顶→`tool_loop_exhausted` 确定性返回（沿 :28 臂形）；token 超限臂→不再发起模型调用+确定性 final+如实披露；两路径均断言模型调用计数=已耗步数（无超额外呼）。
5. **防注入臂**：工具结果含指令样文本（「忽略以上规则…」）→ 经 `<data-*>` 围栏进 user 段·scripted 模型断言输出未被执行面改变（结果只作数据）+system 段零拼接静态断言。
6. **计费幂等臂**：假账本/spy 断言循环内每次 decide 均经既有 invoke（预留/结算调用次数=模型调用次数·requestDigest 幂等键在场）·零新计费路径（静态：改动集零出现新账本写点）。
7. **只读静态断言**：工具集源码零 INSERT/UPDATE/DELETE 句柄·数据源函数白名单逐一核对（§1-修法②表）；B 端工具对 C 端练习面 interview 恒拒绝的构造期断言在场。

## §3 范围外（边界清单·越界即 FAIL）

1. **成长顾问/B 端追问报告产品本体零触**：对话服务/API 路由/前端/产品排期（LANDING-INDEX :62「挂用户产品排期」）——本刀只交付受限工具层库面+证明·宿主接入另刀。
2. **评估侧零触**：出题/评分链、adaptive-interview、crag、qbank 检索、`model-client.ts` 请求体（:662-676/:859-871）零字节——**不启用** `tools`/`tool_choice` 原生 function calling 通道（升级另议·裁决项⑤）。
3. **原语零改**：`tools.ts`/`index.ts:219` 零字节（§5 Ban 同源）·`prove:tools` 6 臂原值。
4. **durable/resume 零预支**：ToolCall 持久化、checkpoint 恢复语义、ToolNode/条件边、工具结果 artifact、跨请求重放（design doc :26/:40 未实现面）——循环为单请求进程内有界·零续跑承诺。
5. **零写面**：零写副作用工具、零新迁移/DDL/新存储面、memory 写入面零触、题库/评分/记忆零改。
6. **零跨租户打开**：B 端工具不触他企业·不触 C 端练习（硬禁·§1-修法②③）。
7. **保留策略零调参**：TTL purge 值/8k 清除纪律原值（§1-修法⑧ not_available 降级即终态·不为本刀延长明文保留）。
8. **共享 SSOT 零改**：LEDGER/checklist/issues-master/ai-capability-review 四件只读引用（AG-38 行翻面权归协调方）。

## §4 依赖

**零未决硬依赖**：①原语+prove 已落主线（tools.ts/index.ts:219/tools.proof 6 臂·基线树亲证在位）——无前置刀；②幂等计费账本现有（G7 共享账本 :680/:504+db :216 结算族+digest :1041-1046）原样可复用；③数据围栏现有（:161/:189）原样可复用；④数据源读面现有（memory barrel db/index.ts:277·learning_plan growth-generation.ts:64·interview RLS 面）——C/B 端读函数选型属 EXEC 细化非新依赖；⑤无迁移编号交点（零迁移）；⑥下游消费者（成长顾问/B 端追问报告）未开工——本刀为其前置能力·交付后挂产品排期接入·**无在飞刀同文件交**（改动集恰 1 新 .md·零码交点）。

## §5 Ban 列表 + pins（沿 ag37/ag-f/authz 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件行与统计只读引用·AG-38 行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改 `runToolLoop`/`toolRegistry` 原语（tools.ts/index.ts:219 零字节·只新增消费面·prove:tools 6 臂原值零翻）；Ban 触评估侧（出题/评分链·adaptive-interview·crag·qbank 检索零字节·README「面试出题与评分不接」）；Ban 在请求体加 `tools`/`tool_choice`（原生 function calling 通道不启用·§3-2）；Ban 写副作用工具与写句柄（五工具全 read·零 INSERT/UPDATE/DELETE·禁写题库/改分/改记忆）；Ban 身份字段入模型可控入参（argsSchema 零 user_id/org_id/绑定 interview_id——权限根唯一合法位置=registry 构造期闭包绑定）；Ban 依赖 prompt 约定做权限（README 权限 3·权限检查必须写在工具实现内）；Ban 工具结果出围栏（只经 `<data-*>` nonce 围栏进 user 段·禁进 system/禁拼指令文本）；Ban 无界循环（maxSteps 必显式+token 上限必设·缺省 6 不得隐式依赖）；Ban 新计费路径（只走既有 invoke+G7 共享账本+digest 幂等·零旁路零双轨）；Ban B 端工具触 C 端练习数据与他企业数据（硬禁·构造期+实现内双断言）；Ban durable ToolCall/迁移/新存储面/artifact/resume 语义（§3-4）；Ban 为 B 端原答案读取延长明文保留或调 TTL（§3-7·not_available 降级即终态）；Ban 真实模型外呼（est live=0·scripted+假账本形）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/假账本/静态断言·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：权限/有界/防注入/计费各臂=scripted decide 假体+假账本 spy+静态源断言；原语回归=既有 `prove:tools` 6 臂原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag38-tool-layer-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag37/ag-f/authz 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md·⛔push·零其他文件）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①工具层宿主形态**：(a) ai-runtime（或新受限问答面）库级受限循环包装器——构造期绑定身份的 registry 工厂+token 上限包装·products 后续接（**推荐**·与「产品挂排期」解耦·原语零改纯增量）(b) 直接预埋进未来成长顾问服务骨架（产品未立项·空转面）。(a) 落点包名与导出面 EXEC 定。
- **②权限绑定形**：(a) registry **构造期闭包绑定** principal/interview·argsSchema 零身份字段（**推荐**·模型零权限根·铁律①权限版·负臂最简）(b) invoke 时 context 参透传（多一重模型侧参数面·需证 schema 不可旁路）。
- **③工具结果回灌形**：(a) 全量经 `<data-*>` 围栏段进 user 消息（**推荐**·复用 :161/:189 既有语义零发明）(b) 先摘要化再入围栏（多一道加工面·摘要本身需防注入论证·仅当超长实证后再议）。
- **④token 上限计量口**：(a) 复用 context-budget/estimateTokens 事前计量（**推荐**·与既有预算器同源·决定「不再发起调用」时机确定性）(b) provider usage 回填事后累计（滞后一步·存在单步超额窗）。
- **⑤原生 function calling 升级时机**：(a) 本刀不做·保持请求体零 `tools`/`tool_choice`·runToolLoop prompt 级循环即满足 AG-38 修法（**推荐**·评估侧/请求体零触红线不破）(b) model-client 加可选 tools 透传通道（触 §3-2 范围外·需另开 REQUEST 重立）。
- **⑥B 端读函数选型与原答案 not_available 形**：具体 SELECT 面与已清除行返回形（(a) 结构化 `{available:false}` 明示·**推荐** (b) 空列表歧义返)——EXEC 按 §1-修法②⑧细化并如实登记。

---

*AG-38 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · 基线主线 tip `849a0f19`（git log -1 开工实测 2026-10-13）· 分支 `line/ag38-tool-layer` · 工作树 `../meetwise-ag38`（git worktree add 本起草席立·建前 worktree list+branch 双查零同名）· 蓝本=issues-final AG-38 :50/:466-476（全文誊录 §1-A）+ README 工具使用边界 :162-197（全文誊录 §1-B·修法语义权威）+ EXPERT-REVIEWS §五（循环续跑纪律参照）+ tool-skill-memory-runtime-design.md :26/:40（缺口对账：补授权/成本审计/受限接线·不补 durable/resume）+ LANDING-INDEX :58-62 + review-log :18 · 防重三对表过（worktree/branch/harness 零同名）· 红事实机证=rg runToolLoop 全仓 12 命中生产零调用+请求体双通道（:662-676/:859-871）逐键无 tools/tool_choice+prove:tools 6 臂既有 · 漂移登记=model-client :404-421→:662-676/:859-871（结论不变·本卷即修 pin）· 修法=混合式只读受限工具层八条款（评估侧与请求体零字节/五只读工具契约/构造期权限绑定/循环有界双限/既有账本零旁路/围栏防注入/只读铁律/原答案保留交互如实承登）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · 待 pre-exec 双审两外席（Ban self-approve · alone≠dual · Dual PASS ≠ 开工）*
