# EVIDENCE-DELIVERY — 逐题评分证据四断口接线刀（criterion 数组随事件/转写带出+报告页退役冒充 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（本 REQUEST 只送审 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 自动开工 · 须 meetwise 明示授权才进 EXEC）
**Date**: 2026-10-07（起草席 mw-eviddel-draft）
**Base**: `origin/feat/mysql-schema-skeleton` @`5e1e7fde` · 分支 `line/evidence-delivery`（工作树 `meetwise-line-eviddel`）
**立项依据**: `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` §接线债审计收编（2026-10-09 归档·EVIDENCE-DELIVERY 产品偏移级·A1+A2+C1 连带）+ EXTREV-7 三铁律（交付/隐私流量/简化优先）。
**Honesty**: 本档全部 file:line 锚点在 `line/evidence-delivery` @`5e1e7fde` 实树亲读验证（worker/api/web/domain/ai-graphs/ai-runtime/db/contracts/CLAUDE.md）；审计誊录锚两处漂移已勘误标注（evaluate-answer.ts 审计锚 :131→实位 :154〔ingestAssessment 调用行·:131 为 unresolved 分支头〕·assessment.ts 审计锚 :57-58→实位 :53〔两固定串·:57-58 为 return 行〕·E 先例±行漂如实记）。SOP 引文逐字誊录字节一致。

---

## §0 立靶依据（SOP 审计定谳引录+四断口双侧证据·逐锚亲验 @`5e1e7fde`）

### 0.1 SOP 引录（逐字·`extreview-fix-campaign-SOP.md:96`）

> **EVIDENCE-DELIVERY（产品偏移级·A1）**：逐题评分证据产出+过闸（prompts.ts:85-101 强制 evidence+quote 逐字引文·interview-service.ts:19-46 双闸）→ 四出口全断（business-events.ts:33-42 无 evidence 字段·adaptive-lifecycle.ts:276-279 事件 payload 不带·interview-report.ts:58-89 transcriptView 不带·报告页 report/[id]/page.tsx:243-252 用维度名冒充题目+assessment.ts:57-58 两固定串冒充点评）——修法=criterion 数组随事件/转写带出+报告页改吃 transcript+evidence。连带 A2（学习计划/职业路径固定句式在「模型生成内容」区呈现·learning.ts:10-20/career.ts:12-18）+C1（evaluateAnswer 生产零调用·#159 同形）。

产品宣称面（承诺与交付断口互证）：`apps/web/app/dashboard/page.tsx:32` 「自适应追问,逐题点评。」+ 报告页标题 `apps/web/app/report/[id]/page.tsx:73` 「逐题点评与成长建议」/:77 「基于本次练习生成的逐题反馈与后续建议。模型生成内容仅供个人复盘…」。

### 0.2 证据真产出真过闸（上游链·双侧亲验）

| 环节 | 锚点（亲读） | 实证 |
|---|---|---|
| 提示词强制 | `packages/ai-runtime/src/prompts.ts:85-101`（'mock-interview.evaluate' v5） | :97「evidence 每条必须是 {"criterion":"评分/判定依据","quote":"从候选人回答中逐字复制的短引文"};quote 必须为回答原文的连续子串」+:98 返回 JSON 契约含 evidence 数组 |
| schema 闸① | `apps/worker/src/interview-service.ts:19-23`（ScoreEvidenceSchema）+:34-46（EvalSchema `evidence: z.array(ScoreEvidenceSchema).min(1).max(6)`+superRefine） | criterion≤240/quote≤500·relevant=false→score 必 0 |
| 业务闸② | `apps/worker/src/interview-service.ts:64-73`（validateEvaluationEvidence） | :67 `answer.includes(item.quote)` 逐字核验不过即 `evidence_quote_not_in_answer`·:68-71 去重 |
| invoke 唯一入口 | `apps/worker/src/interview-service.ts:133-150`（invokeEvaluationOnce） | :142 businessValidate 双闸·:143 storeOutput→persistedEvaluation（:89-94·quote 落 trace 前替换为 span+hash 记录 :80-83） |
| 图生产消费 | `apps/worker/src/adaptive-interview-service.ts:251-258`（assess→invokeEvaluationOnce）→**:268-270** `evidence: out.value.evidence.map((item) => item.criterion)` | **生产真拿到 criterion 数组**（criterion 在 raw/record 两形均在场·:282-284 注释亲证） |
| 写入 mind | `packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts:153-154`（ingestAssessment 调用·**审计锚 :131 勘误→实位 :154**）→ `packages/domain/src/adaptive-interview.ts:195-208`（evidence 累积 slice(-6) 入 competency） | 证据进 mind 但**不进 transcript**（Turn 接口 `packages/ai-graphs/src/adaptive-interview/state.ts:12-32` 无 evidence 成员·:16-21 checkpoint 投影纪律：原文保留/加密/删除权归图外业务存储） |

### 0.3 四出口全断（断口双侧亲验）

| # | 断口 | 供给侧锚点（证据在握处） | 出口侧锚点（断开处） |
|---|---|---|---|
| ① | **SSE 事件 schema** | sse-pump 直通 wire：`apps/api/src/platform/sse-pump.ts:64` `data: ${JSON.stringify(e.payload)}`（payload 全量上 wire·无字段过滤） | `apps/web/lib/stream/business-events.ts:33-42` answer_evaluated zod 成员仅 score/outcome/questionId/stateVersion/turn/answerId/answerHash/competency——**无 evidence 字段**（zod 默认 strip·旧前端静默丢键不报错=断而不崩） |
| ② | **事件账本 payload** | 图 transcript Turn 无 evidence（§0.2 末行）→ lifecycle 拿不到 | `apps/worker/src/adaptive-lifecycle.ts:276-279`（generationFailed 臂）与**:310-313**（主路径）两处 `appendEvent(...,'answer_evaluated',{...})` payload 仅 questionId/stateVersion/answerId/answerHash/turn/score/outcome/competency/question——**不带 evidence**（本地 transcript 结构类型 :252-254 亦无该键） |
| ③ | **转写 API** | interview_event.payload 若带 evidence（②修后）即可读 | `apps/api/src/modules/interview/interview-report.ts:58-92` transcriptView SQL 全量取 payload（:64-79）但投影 :86-89 仅 index/question/competency/score/outcome——**剔 evidence**；且路由 `apps/api/src/modules/interview/interview.controller.ts:195-197` `GET :id/transcript` 在 `apps/web` 全仓 **零调用**（grep 亲证·唯一 transcript 字样命中为语音转写无关面） |
| ④ | **报告页呈现** | dashboard:32 承诺「逐题点评」·报告页 :73/:77 承诺「模型生成内容」 | `apps/web/app/report/[id]/page.tsx:243-253`「逐题点评」区 `dims.map`→AnnotationCard **:249 `question={d.dimension}`（维度名冒充题目）**+:250 `note={d.evidence ?? (d.gap ? '该维度低于达标线(60),建议优先补强。' : '该维度表现达标。')}`——d.evidence 源 `packages/domain/src/assessment.ts:53`（**两固定串 '低于达标线，需加强'/'达标' 冒充点评·审计锚 :57-58 勘误→实位 :53**）·且 deriveAssessment competency 缺失回退 `t.question.slice(0,40)`（:42/:47）同为文本冒充维度名 |

### 0.4 连带债（A2+C1·亲验）

- **A2 成长链固定句式**：`packages/domain/src/learning.ts:7-17`（deriveLearningPlan·:14 action=模板串「针对「X」系统复习 + 练习,目标达到 70 分」）与 `packages/domain/src/career.ts:10-19`（deriveCareerPath·:13 readiness 三固定串·:15-17 milestones 固定句）——经 `apps/api/src/modules/interview/interview-learning.ts:20`/`interview.service.ts:673-674` 落库后在报告页「模型生成内容」框架（:77）下呈现。真数据半（topic/weakness/level 来自真实分数）+固定句半。
- **C1 死接线**：`apps/worker/src/interview-service.ts:270-287` evaluateAnswer **生产零调用**（grep 全仓仅定义+2 测试文件消费：`test/scoring-report-integrity.proof.ts:47/:48/:52/:69/:71/:126/:128`+`test/context-stress.proof.ts:154`）——与 issues-master **#159 同形**（「model_first_token 在生产路径无调用方，proof 由 fake 模型自己调用自己」·issues-master.md:309·处置先例=「删掉或标注未接线」）。自适应主线评分走 assess→invokeEvaluationOnce（§0.2），evaluateAnswer 为遗留旧路径包装。

---

## §1 范围（四切片·S3 带缓行裁定建议）

**交付优先定性**：评分证据已在生产产出+双闸过审（§0.2），本刀零新增模型调用、零评分逻辑变更——纯「把已产出的证据接到用户眼前」，是 EXTREV-7 铁律 1（交付优先）的直落刀。

### S1 evidence 随 answer_evaluated 事件带出（本刀核心·写读同刀）
- 图 transcript 投影增位：Turn 增 `evidence?: string[]`（**criterion 数组·模型判据**；quote 永不入 transcript——state.ts:16-21 投影纪律保持），evaluate-answer.ts answered 分支（:153-171 transcript 块）写入 criterion 数组；clarify/unresolved/unscored 分支沿现状不写（该键缺省）。
- 事件 payload 带出：adaptive-lifecycle.ts 两处 appendEvent（:276-279/:310-313）payload 增 `evidence`（自 last.evidence·缺省省略键）+本地 transcript 结构类型（:253-256）增 `evidence?: string[]`。
- **zod 双端同刀（沿 S3 设计 §F 纪律·`tokstream-s3-design.md:171`「web `business-events.ts` discriminatedUnion 增成员与 api emit 面同刀落地，禁半边注册」）**：`apps/web/lib/stream/business-events.ts:33-42` answer_evaluated data 增 `evidence: z.array(z.string()).max(6).optional()`——**optional 必须**（SSE 断线 catch-up 重放历史事件（sse-pump :73 emit(o.initial.rows)）无 evidence 键·strict 会杀重放解析=历史流 UI 死亡；沿 questionId/turn optional 惯例）。若 EXEC 选择把 payload schema 提升入 `@meetwise/contracts`（单一真相先例 SessionConcludedPayload·contracts/src/index.ts:107-110），contracts+web business-events **同刀落地禁半边**；简化优先建议=web 内联成员（answer_evaluated 现状即内联形制·contracts 提升非必要）。
- 兼容面亲证：B 端资格读 `packages/db/src/recruiter.ts:291-293` 用 `payload ?& ARRAY[...]`（要求列出的键在场·额外键无害）；`isTrustedScoreIdentity`（domain scoring-honesty.ts:104-118）同型键存在性判定——**加键零破坏**。0126 原文围栏（interview-event.ts:20-24 顶层 `answer` 键拒绝）不触——evidence 数组非 answer 键。
- 旧 checkpoint 兼容：Turn 增量为 optional——已持久化 LangGraph checkpoint 反序列化零迁移零回填。

### S2 transcript API 带 evidence+报告页改吃 transcript（④断口修复）
- `interview-report.ts:86-89` 投影增 `evidence`：`Array.isArray(p.evidence) ? p.evidence.filter((x) => typeof x === 'string').slice(0,6) : []`（历史事件无键=空数组·脏值过滤·上限沿 EvalSchema max(6)）。
- 报告页「逐题点评」区（page.tsx:243-253）改数据源：serverGet `/interview/:id/transcript`（controller:195 既有路由·**web 首次接线**），逐 turn 渲染 AnnotationCard——`question=turn.question`（真题目文本·**维度名冒充退役**）·`note=turn.evidence`（真判据·**固定串退役**）·`score=turn.score ?? undefined`（分数权威仍=ScoreCard·无卡 null·SCOR-02 消费迁移纪律 :305-309 保持——payload.score 仍非合法 C 端分数消费者）。
- `assessment.ts:53` 两固定串处置（**旁路优先建议**）：web 唯一读面=page.tsx:250（grep 亲证）——读面退役后 deriveAssessment 停写冒充串（Dimension.evidence 字段退役或写空·EXEC 按 tsc 门收束）；`assessment_report.dimensions` JSONB 旧行残键**零迁移零回填**（读侧已不读）。
- dashboard:32 承诺在 S2 后为真（不改文案）。

### S3 A2 成长链真实化 —— **裁定建议：缓行·登记后继刀 GROWTH-REAL（本刀零触）**
理由（依 EXTREV-7 铁律 3 简化优先+铁律 1 交付优先的权衡）：
1. **改造量=新模型调用链**：learning/career 真实化须新 prompt 服务（prompts.ts 注册位）+invoke 幂等键+落库版本递增+报告消费改型+scripted prove 全套——≥一刀量级，塞进接线刀=扩权（SOP 执行规则 2 禁顺手扩权）。
2. **数据面前置依赖**：真实成长建议应吃逐题 evidence+ScoreCard 面——ScoreCard 现无 writer（B2·归 SCORE-WRITER），现在真实化=在饿死的数据面上建消费端。
3. **简化优先不支持加法**：本刀若碰 learning/career 只能加调用层，恰是铁律 3 要抑制的方向。
后继刀登记建议：**GROWTH-REAL**（A2·依赖 SCORE-WRITER 下游稳定·含 :77「模型生成内容」框架句对模板区的诚实面处置）。本刀 §2 显式钉死零触。

### S4 C1 evaluateAnswer 删除+注释留档（简化优先倾向删除·裁定建议=删除）
- 删 `apps/worker/src/interview-service.ts:270-287` evaluateAnswer（生产零调用·§0.4 亲证·#159 同形处置先例=删）。
- 两测试文件消费面回和：`scoring-report-integrity.proof.ts`+`context-stress.proof.ts` 改直吃 `invokeEvaluationOnce`（同为导出面·断言语义零弱化——幂等/引文核验/降级断言逐条对位迁移）。
- 注释留档：interview-service.ts 评分段头注记 evaluateAnswer 已删（2026-10·EVIDENCE-DELIVERY S4·#159 同形·生产路径=adaptive assess→invokeEvaluationOnce）。
- **接线选项否决理由**：生产唯一评分路径（adaptive graph assess）已直连 invokeEvaluationOnce；再接线 evaluateAnswer=第二入口=反简化。

---

## §2 非范围（交叠面逐条钉死）

1. **SCORE-WRITER 交叠（先立项刀·本刀只读不写）**：评分卡写入面（writeFinalScoreCard/adjudicateScoreCard 接线·issues #40）归 SCORE-WRITER——本刀**零碰** `listScorableScoreCards` 语义/transcriptView :81-82 ScoreCard 读面/assessment 409 no_scorable_cards 语义（interview-assessment.ts:24-27）/main.ts:175-181 loadSummary（B1 competency 丢弃归 SCORE-WRITER·SOP :97）。本刀只接「已产出的评估证据」，不碰评分卡链。
2. **#45 级别判定/scheme/聚合器切换**（LEVEL-SCHEME/SCORE-READ-V2 域）零触。
3. **零迁移（亲验确认）**：evidence 走既有 `interview_event.payload` JSONB（appendEvent `payload: unknown`·db/src/interview-event.ts:16）+既有 transcriptView SQL+既有 web zod——**无新表无新列无新触发器**；Turn/checkpoint optional 增量零回填；assessment_report 旧行残键零清理。
4. **零隐私新增面+交叠声明**：带出的是 **criterion（模型判据·非用户原文）**——quote（作答逐字引文=用户内容）永不出 invoke 边界（interview-service.ts:79-83 落 trace 前替换为 span+quoteSha256·**本刀 Ban 把 quote/evidenceRecords 写入任何事件/转写/payload**）。criterion 随 interview_event 行落库+经 SSE/报告呈现给**作答本人**（guardInterviewPrivacy 围栏内·transcriptView :60/reportView :17 既有 Roster 守卫）。**隐私删除生命周期交叠声明**：evidence 随既有 interview_event 行存续——面试数据擦除面（privacy.controller.ts:51 `DELETE interview-data/:id`·现 503 桩属 UNSTUB-ERASE 域）cutover 后整行同删，**本刀零新增删除面零新增用户原文出口**。
5. **S3 缓行面零触**：learning.ts/career.ts/interview-learning.ts/career 生成链/报告页 :77 框架句/LearningSection/CareerSection 全零字节。
6. **CLAUDE.md SSOT 零触**：`:54` 事件目录句列 kind 不列 payload 字段——本刀给既有 kind 增字段非新增 kind，SSOT 句语义不变（对照 S3 设计 A13 纪律·若审席裁定须登记字段目录则另走文档刀）。
7. **B 端呈现面零触**：recruiter.ts:291 answer_evaluated 读面（加键兼容已亲证 §1）不加呈现消费——B 端证据呈现属后续产品裁定。
8. **报告叙述生成（report.generate）零触**：prompts.ts:111-115/报告节点结构化输入（#50）归 SCORE-WRITER 域。
9. **TOKSTREAM S4c/d 交叠**：web `apps/web/lib/stream/` 仅 business-events.ts answer_evaluated 成员增键——token_delta 成员/interview-stream/interview-state 归约零触（interview-state.ts answer_evaluated 臂 :106-124 零改·S1 只上 wire 不改 UI 状态机）。
10. **实时面试页 UI 零触**：S1=wire/schema 层；逐题证据在面试进行中的即时呈现非本刀面（报告页已承交付）。

---

## §3 逐条改动清单（file:line 现状→目标·全数亲读 @`5e1e7fde`）

| # | 切片 | 文件:行 | 现状（亲读） | 目标 |
|---|---|---|---|---|
| C1 | S1 | `packages/ai-graphs/src/adaptive-interview/state.ts:12-32` | Turn 接口无 evidence 成员（:16-21 投影纪律注释） | 增 `evidence?: string[]`（criterion 判据投影·注明「模型判据非用户原文·quote 永不入 checkpoint/transcript」沿 :16-21 纪律句式） |
| C2 | S1 | `packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts:153-171` | answered 分支 transcript 条目无 evidence（evidence 局部变量 :56-59/:91 在手未投影） | answered 分支 transcript 条目增 `evidence`（criterion 数组直投影）；clarify（:102-128）/unresolved（:131-151）沿现状不写 |
| C3 | S1 | `apps/worker/src/adaptive-lifecycle.ts:252-254` | transcript 本地结构类型无 evidence 键 | 增 `evidence?: string[]` |
| C4 | S1 | `apps/worker/src/adaptive-lifecycle.ts:276-279`（generationFailed 臂） | answer_evaluated payload 7+1 键无 evidence | payload 增 `evidence: last.evidence`（缺省省略键·undefined 不进 JSONB） |
| C5 | S1 | `apps/worker/src/adaptive-lifecycle.ts:310-313`（主路径） | 同上 | 同 C4 |
| C6 | S1 | `apps/web/lib/stream/business-events.ts:33-42` | answer_evaluated data 无 evidence 成员 | 增 `evidence: z.array(z.string()).max(6).optional()`（**与 C4/C5 同刀=写读双端同刀·§F 禁半边注册**；optional=历史事件重放兼容）；contracts 提升为 EXEC 可选（若做·contracts/src/index.ts+web 同刀） |
| C7 | S2 | `apps/api/src/modules/interview/interview-report.ts:86-89` | 投影 5 键剔 evidence | 增 `evidence`（isArray 过滤 string·slice(0,6)·缺键=空数组） |
| C8 | S2 | `apps/web/app/report/[id]/page.tsx:243-253` | 「逐题点评」吃 assessment dimensions：:249 question=维度名·:250 note=固定串回退 | 改吃 serverGet `/interview/:id/transcript`：逐 turn AnnotationCard question=turn.question·note=turn.evidence 判据列表·score=turn.score ?? undefined；能力评估维度条（:234-241 AbilityBar 区）沿 assessment 面不动（维度总览≠逐题点评·语义分离） |
| C9 | S2 | `packages/domain/src/assessment.ts:49-54`（实锚 :53） | Dimension.evidence=两固定串冒充点评 | 停写冒充串（字段退役或空串·EXEC 按 tsc 门收束）；:42/:47 question.slice(0,40) 回退零触（legacy 数据兼容路径非冒充面） |
| C10 | S2 | `apps/web/app/report/[id]/page.tsx:250`（唯一读面·grep 亲证） | d.evidence 消费 | 随 C8 退役；assessment_report 旧行残键零迁移零回填 |
| C11 | S4 | `apps/worker/src/interview-service.ts:270-287` | evaluateAnswer 生产零调用（§0.4） | 删除+段头注释留档（#159 同形·生产路径=adaptive assess→invokeEvaluationOnce:133-150） |
| C12 | S4 | `apps/worker/test/scoring-report-integrity.proof.ts:14/:47/:48/:52/:69/:71/:126/:128`+`test/context-stress.proof.ts:21/:154` | 两文件经 evaluateAnswer 消费 | 改直吃 invokeEvaluationOnce（导出面既有）·断言语义逐条对位零弱化（幂等重放/answer-hash 分键/quote 拒绝/降级 unscored） |
| C13 | prove | 收据 `ai-docs/delivery/receipts/evidence-delivery/`（新增·沿 `receipts/<knife>/` 惯例） | 无 | manifest 沿 run-manifest.json schema（EXIT 原值/attempts 全账/est live=0） |

触碰面收束：`packages/ai-graphs`（state.ts+evaluate-answer.ts）·`apps/worker/src`（adaptive-lifecycle.ts+interview-service.ts）·`apps/web/lib/stream/business-events.ts`+`apps/web/app/report/[id]/page.tsx`·`apps/api/src/modules/interview/interview-report.ts`·`packages/domain/src/assessment.ts`·两 worker 测试文件·收据。apps/web/lib/stream 其余文件/apps/api 其余模块/CLAUDE.md/迁移目录零字节。

---

## §4 prove（scripted ModelClient 全离线·est live=0）

1. **事件 payload 断言（S1 出②）**：worker proof（扩展 `prove:interview` 或新 `evidence-delivery.proof.ts`）——scriptedModelClient 沿 `apps/worker/test/interview.proof.ts:43` 形制（evidence fixture `{criterion:'…',quote:'…'}`·quote 取自 scripted answer 原文子串）跑 adaptive 提交链，断言 `interview_event` answer_evaluated 行 `payload->'evidence'` = criterion 数组（jsonb 逐元素相等）且 `payload ? 'quote'` 为 false（原文禁断言）。
2. **SSE wire 验证（S1 出①）**：web `prove`（web-logic.proof.ts）——构造 `event: answer_evaluated` SSE 文本帧（data=含 evidence 帧过 decodeSSE/toBusinessEvent 解析成功且 evidence 数组保真；**无 evidence 键的历史形状帧仍解析成功**（optional 兼容断言·断线重放不杀））；api 侧 `sse-push-notify.proof.ts`+`last-event-id.proof.ts` 零回归（payload 直通语义 :64 未改）。
3. **报告页组件测试吃 transcript（S2 出④）**：web prove 增纯逻辑断言——transcript turns→逐题点评投影：question=真实题目文本（非维度名·断言不含 dimension 冒充形状）·note=evidence 判据·固定串两值（'低于达标线，需加强'/'达标'）在任何渲染路径零出现；score=null（无卡）时无数值呈现（SCOR-02 纪律）。transcriptView API 出③：api proof（`prove:int-transcript-preview-submit-http` 邻域或 neg harness 扩展）断言响应 turns[].evidence 在场。
4. **既有 prove 零回归**：`neg:interview`（apps/api/package.json:29）·`turn-idempotency:prove`（:32·评分幂等分键面）·`prove:interview`/`prove:flow`（worker·answer_evaluated 计数断言 :142-150 原值）·`adaptive-flow.proof.ts` 族·`prove:scoring-integrity`（apps/worker/package.json:51）+`prove:stress`（:15·C12 回和后全绿）·web `prove`（apps/web/package.json:7）——EXIT 原值如实记，**Ban retry-to-green**。
5. **预算**：全 scripted/fake seam 零模型外呼零 Key 触碰——**est live=0 模型调用**·actualSpendCny=null·收据落 `receipts/evidence-delivery/`。

---

## §5 Ban（全列）+ pins（十一值照抄）

**Ban**：
1. **Ban 半边注册**（S3 设计 §F 纪律誊录：「web `business-events.ts` discriminatedUnion 增成员与 api emit 面同刀落地，禁半边注册」）——C4/C5/C6 必须同刀同 commit。
2. **Ban 原文出闸**：quote 逐字引文/evidenceRecords（span+hash）**永不**写入 interview_event payload/transcript 投影/transcriptView 响应/SSE wire——带出的只有 criterion 判据（interview-service.ts:79-94 脱敏边界不可旁路）。
3. **Ban SCORE-WRITER 面**：评分卡写读链/assessment 409/loadSummary 零改（§2.1）。
4. **Ban retry-to-green / Ban self-approve / alone≠dual**（北星 loop 通例）。
5. **Ban SSOT 触碰**：CLAUDE.md:54 零改（§2.6）。
6. **Ban S3 扩权**：learning/career/:77 框架句零字节（§1.S3 缓行裁定+§2.5）。
7. **Ban 事件键破坏**：answer_evaluated 既有 8 键零删改零改名（B 端 ?& 资格读 recruiter.ts:291+isTrustedScoreIdentity 兼容面只许增键）。
8. **Key name-only**：零 Key 触碰零 live（est live=0）·.env* ABSENT·零 secrets 入库。

**pins（十一值照抄零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）

---

## §6 Non-claims（本刀≠什么）

1. **本刀≠评分体系完成**：评分卡仍无 writer（B2 归 SCORE-WRITER）——transcript 分数列 null-until-ScoreCard 是如实呈现非本刀缺陷；assessment 409 饿死链本刀不解。
2. **本刀≠A2 成长链真实化**：learning/career 模板句仍在（S3 缓行·后继刀 GROWTH-REAL·§1 裁定建议待协调方追认）。
3. **evidence=criterion 判据≠quote 引文**：逐字引文以 span+hash 留 trace 可重验，不随事件/报告带出——「逐题点评」呈现的是模型评分依据短语，非作答原文回显（隐私减面设计·如实宣称）。
4. **报告页改吃 transcript≠报告叙述升级**：report.generate 叙事面（#50 结构化输入）零触。
5. **SSE wire 带 evidence≠实时页即时点评 UI**：interview-state 归约/面试进行页呈现零改（§2.10）。
6. **删除 evaluateAnswer≠评分路径变更**：生产路径自 adaptive 接线起即 assess→invokeEvaluationOnce，本刀只删死壳+回和测试。
7. `releaseEvidence=false`·`actualSpendCny=null`·Dual PASS ≠ 开工授权。

---

## §7 STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual · Ban self-approve。** REQUEST 写完即停零码动；EXEC 须双审 PASS + meetwise 明示授权；S3 缓行裁定与 S4 删除裁定（两处裁量建议）须协调方在预执行双审中追认或改判；Ban retry-to-green。

---

*EVIDENCE-DELIVERY EXEC REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · base `5e1e7fde`（origin/feat/mysql-schema-skeleton）· 分支 `line/evidence-delivery` · 立项=extreview-fix-campaign-SOP.md §接线债审计收编（A1+A2+C1）· pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*
