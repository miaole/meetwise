# G3 BEGIN-GUARD — 开始守卫与进度显示刀（#260+#261+#161+#256显示面 · 批1 残留 G3 组 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `g3-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding）
**Rev2**（2026-10-10 · 合并落卷席 `g3-rev2` · docs-only · append-only）：预执行双审回卷＝席1 **PASS**（六条随 EXEC）＋席2 **FAIL 窄面**（R1-R4）· 协调方裁定：W4 M 题裁**形制 A**（附席2 R1+R2 勘误落卷）· W1④ quiz/diagnosis **保留**（双席同裁）。正文改动仅限〔rev2·勘误注记〕插入（原文零删除零改写），rev2 处方全量落卷见 §9；STOP 流转见卷尾状态行 `draft_rev2:pre_exec_dual`。
**Date**: 2026-10-10
**审计项**: 蓝本 `batch-residual-plan.md` G3 行（:88）＝#260+#261+#161+#256显示面（M 体量·批1 残留）· 对应 LEDGER 行 :34/#161、:40/#256、:41/#260、:42/#261
**Base**: `feat/mysql-schema-skeleton` @`df12a054`（ENTPAY 片2 nail）· 分支 `line/g3-begin-guard`（工作树 `meetwise-g3`）
**蓝本可及性注记**：issues-master.md / fix-roadmap.md 均不在本仓树上（全机检索 0 命中）——蓝本 G3 行转引的锚行号 **#161(:272)/#256(:292)/#260(:296)/#261(:438) 本席无法逐行复核**，本档以蓝本 G3 行原文 + LEDGER 四行原文 + 实树代码亲读为三重锚（漂±如实记于 §0，EXEC 立项前协调方可回补 issues-master 原文行）。
**Honesty**: 全部涉案码 file:line 起草席亲读 @df12a054；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（纯前端显示面+可选 worker 发射字段，零模型外呼零消耗）。

---

## §0 立靶（四条逐项亲读 · 漂±全录）

| 条 | 蓝本原文（G3 行 :88 / 清点表誊录） | 代码锚（蓝本→实读·漂） | 亲读实证 @df12a054 |
|---|---|---|---|
| **#260** | 「interviews/page.tsx 开始表单与放弃重来下拉均 `resumes.map` 全量无可用性过滤（解析失败/删除处理中仍可选）」 | interviews/page.tsx（**零漂**）·:91-93 重来下拉、:125-127 开始下拉 | 两处下拉确为 `resumes.map` 全量渲染，零过滤；数据源 ：39 `serverGet('/resume')`→:44 `parsedResumes.data.resumes`；重来表单门 ：81 `resumes.length > 0` 与默认值 :88/:122 均取**未过滤**首项。简历状态枚举=lib/resume/display.ts（uploaded/ingesting/ingested/failed/erasure_fenced/erased 六态）。服务端唯一可用谓词=`status='ingested'`：interview.service.ts:183（bind UPDATE 谓词）+:186-187（miss→409 `interview_resume_binding_unavailable`）——**不可用简历选中后必 409 回列表**，UI 全量列出=教用户白点。同形先例：jobs/page.tsx:50 `.filter((r) => r.status === 'ingested')`。**同病邻面（蓝本未列·本席新证）**：quiz/page.tsx:82、diagnosis/page.tsx:84 同 `resumes.map` 全量；其 begin 服务端谓词同＝ingested（quiz.service.ts:42-45、diagnosis.service.ts:44-47→409 `resume_not_found_or_not_ready`）。空态分支现状 ：110 `resumes.length === 0 →「还没有简历」`——过滤后若 ingested=0 而 resumes>0，该文案失真（须新臂） |
| **#261** | 「无『余额 N』展示、无『本次消耗 1』确认；pricing/faq 口径文案未对齐」（🔒#228·TRIAL-GRANT 已 nail `b4882af4` 前置解锁） | commerce 端点（**零漂**）·pricing/faq（**零漂**） | 读端点已在：GET `/commerce/entitlement`（commerce.controller.ts:47-51）→ `{availableUnits}`（commerce.service.ts:161-164→packages/db/src/commerce/commerce.ts:396）。扣费权威值：interview.service.ts:229-231 `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)`＝**1.0/场**（quiz.service.ts:56、diagnosis.service.ts:59 同 1.0；常量未契约化，字面散落三处）。#228 解锁亲证：b4882af4 **是 df12a054 祖先**（merge-base 实测），0154 trial 桶注册同事务发放（packages/db/migrations/0154_trial_bucket_grant.sql:15-16 partial unique + gateway_auth_signup 扩展）。Web 消费现状：**生产码 0 命中**（仅 e2e-ui/uc018-abandon.spec.ts:47-53 断言用）；dashboard/page.tsx 零额度展示（grep 0 命中）。口径冲突实锚：pricing/page.tsx:37「若你在其他页面看到练习次数或额度字段，它们**仅表示界面或开发流程状态**」——真读数上屏后该句失真；faq/page.tsx:34 同族（「页面中的额度信息仅用于展示」）。分码面：S2-C6 企业不足=409 `enterprise_insufficient_balance`（interview.service.ts:233）已在片2 落，**C 端余额显示归本刀**（蓝本 G3 行原文「开始按钮旁『本次消耗 1』+余额 N 展示」）；402 行文案 action-error.ts:26-34 零改。LEDGER :42 位置栏「Dashboard/开始按钮旁」——本刀只做开始按钮旁（Dashboard 面见 §2.7） |
| **#161** | 「view-model connecting 分支仍静态『正在建立连接…』不读 generationProgress；浏览器级测试缺」（SSE-RESILIENCE §2.4 显式非范围·本刀承接） | view-model.ts:89-90（**零漂**） | :89-90 `case 'connecting': return { message: '正在建立连接…', … }` 静态。进度信号面已全在（SSE-RESILIENCE/TOKSTREAM 已落）：interview-state.ts:89-90 非 generation_* 业务事件到达才清进度态、:155-156 `generation_progress` 入 `applyGenerationProgress`——**connecting 期 generation_* 事件到达时 phase 仍 connecting、进度态已维护**（进度帧不改 phase=红线，generation-progress.ts:3-5 头注）。消费先例：同文件 answered 臂 view-model.ts:101-107 `generationProgressLabel(v.generationProgress)` 缺帧兜底形。段名表 generation-progress.ts:24-29〔rev2 微漂②：实读 GENERATION_STAGE_LABELS=:20-24→§9 微漂账〕（retrieve/generate/validate→「检索素材/模型生成/接地校验」）。测试缺口亲证：e2e-ui 六 spec〔rev2 R4 勘误：实为**七** spec（所列七名全数实存·`ls apps/web/e2e-ui/*.spec.ts`=7）→§9 R4〕（golden/online-public/recruiting-bound/screenshots/stream-window/uc018-abandon/voice-duplex）grep `connecting|正在建立` = **0 命中**；web-logic.proof.ts 仅逻辑级（:242/:404/:419-426），无 connecting 进度渲染断言 |
| **#256 显示面** | 「『第 N 题/预计 M 题』进度显示+≥N 题提前结束出报告（提前结束🔒D3 待决·本刀只做显示不做提前结束）」 | business-events.ts:24-30（**零漂**）·InterviewPanel（**零漂**） | 「第 N 题」客户端可得：`question_ready` data 携 `turn`（business-events.ts:24-30 optional；worker 发射 adaptive-lifecycle.ts:214-217/:368-371 实带）；`InterviewView.turns`（interview-state.ts:34-35〔rev2 微漂①：`turns` 字段实读=:42（:34-35 为 interface 起行区）→§9 微漂账〕）。**「预计 M 题」服务端今天零发射**：全树 grep `total_questions|planned|question_count|maxQuestions`（api/worker/contracts/web 生产码）=0；`session_concluded` payload 仅 `{concludeReason:{code,turn,citedCompetencies}}`（contracts/src/index.ts:104-110）。M 的诚实源=decideNext 软预算：决策上下文已携 `maxTurns/absoluteMaxTurns`（adaptive-lifecycle.ts:94-96→:124 入 initMind〔rev2 R2 勘误：:94-96 为 deps 决策上下文声明/:124 为 initMind 入参——是图初始化输入，**非发射点作用域可读源**，「已在手」表述撤销；数据源改钉 `snap.values.mind.maxTurns`（state.ts:136-137 mind 通道·domain :57「raise 后已是新值」）·发射点取值路径见 §9 R2〕），且软预算**可上调**（adaptive-interview.ts:396-401 `SOFT_BUDGET_RAISE_STEP`，mind.maxTurns 达即 raise 封顶 absolute〔rev2 微漂③：上调块实读=domain adaptive-interview.ts :400-404（if@:400/min@:401/赋值@:402）·裁定记 :398-402 再漂 +2·以实读为准→§9 微漂账〕）——「预计 M」必须措辞为约数可调，不得承诺。面板现状：InterviewPanel.tsx 无任何题数进度行（grep `第.*题` = 0）。提前结束/`session_concluded` 语义=🔒D3 非范围，信号 conclude 通道既有（view-model.ts:9-14/30-32）本刀零触碰 |

**靶心一句话**：用户在开始面试时被迫从一堆不可用简历里选（选中即 409 白点一场）、开始前不知道要花多少额度花了还不知道剩多少、首题等待只见一句死文案、全程不知道进行到第几题——四件事同属「开始守卫+进度诚实」用户面，本刀一并收口。

---

## §1 范围（四件逐条 · EXEC 依此实现）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 简历下拉可用性过滤（#260）** | interviews/page.tsx:81,88,91-93,110-114,122,125-127 | ① 新增纯函数 `isEligibleResume(r: ResumeRef): boolean`（唯一谓词 `r.status === 'ingested'`，落 lib/resume/display.ts 或新 lib/resume/eligible.ts——单源，禁三页各写一份）；② interviews 页两下拉（开始 :125-127 / 放弃后重来 :91-93）均改渲染**过滤后列表**；:81 重来表单门与 :88/:122 `defaultValue={…[0]?.id}` 同步改用过滤后列表；③ **空态三臂**：ingested=0 且 resumes=0 → 既有「还没有简历」逐字不变；ingested=0 且 resumes>0 → 新臂「简历暂不可用（解析中/失败/删除处理中），先去简历页处理」带 /resume 链接（**不解释围栏细节**，只述状态）；ingested≥1 → 表单照旧；④ **quiz/diagnosis 同病同修**（quiz/page.tsx:82、diagnosis/page.tsx:84 换同一 helper 过滤+同形空态臂）——三页同谓词同病，本刀一并收口（蓝本 #260 未点名 quiz/diagnosis，本席以同谓词实证扩充，双审可裁保留或剔除，剔除则回退仅 interviews 面零残留〔rev2 裁定①：**保留**（双席同裁）——canonical 更正版 issues-master :296 原文点名「面试页/**押题页**列出全部简历」，保留非扩充；LEDGER :41 「置灰」措辞 superseded 见 §9·微漂⑤〕）。服务端 begin 守卫（interview/quiz/diagnosis service）**零改**——本刀只管 UI 列表面，create/begin 过滤 F1 已收口 |
| **W2 余额 N+本次消耗 1（#261）** | interviews/page.tsx:104-139（开始表单 Card） | ① RSC 内 `serverGet('/commerce/entitlement')`（沿 ：38/:39 同鉴权形；401 由 serverGet 内建 redirect 兜；网络失败返 null）；② 开始按钮旁（:135 SubmitButton 前）渲染「余额 N · 本次消耗 1 次额度」——N=availableUnits 取整显示，读取失败（null）→ **整行不渲染**（降级零假数，禁显示「余额 —」类伪读数）；③ 诚实措辞：预览环境沿 pricing 口径加一句注记「预览环境额度仅展示，不构成购买」（与 pricing/faq 对齐，不新增承诺文案）；④ **pricing/faq 口径对齐**：pricing/page.tsx:37「仅表示界面或开发流程状态」改为反映真读数（如「其他页面的额度读数来自你的账户实时查询；预览环境不提供支付、购买或退款」），faq/page.tsx:34 同族微调——**两页其余免责句逐字保留**〔rev2 裁定③：措辞**去「实时」**（上例句改为非实时口径，§7「≠实时余额保证」Non-claim 对齐）；终稿边界=只动两处假读数短语——pricing:37「仅表示界面或开发流程状态」/faq:34「仅用于展示」；两尾段免责句**逐字保留**＝pricing:37 尾「不构成可购买服务、报价或销售要约」/faq:34 尾「不构成销售要约」；EXEC 按边界起草·post-prove 按「免责句逐字保留」判收→§9〕；⑤ 余额不足（N<1）**只做静态提示不拦提交**（服务端 402 才是权威，`insufficient_entitlement` 402 行文案 action-error.ts:26-34 零改零绕）——文案「余额不足，开始将无法预留」级中性提示，禁购买入口禁倒计时恐吓。quiz/diagnosis 开始面的余额/消耗展示=非范围（§2.8）。Dashboard 余额面=非范围（§2.7） |
| **W3 connecting 真进度提示（#161）** | view-model.ts:89-90 | connecting 臂读 `generationProgressLabel(v.generationProgress)`（沿 answered 臂 :101-107 同形）：有进度帧 → `正在建立连接…（AI 生成中 · 检索素材 · 已 N 秒）`形；**缺帧/未到首帧 → 既有静态文案逐字兜底**（「正在建立连接…」，不空转不编造）。红线零改：进度帧不改 phase、不触发 reconnecting/degraded（generation-progress.ts:3-5 红线照抄）；R-B 思考隐私（只显段名/时长/token 计数，零思考原文）照抄。**浏览器级测试补缺**：e2e-ui 新增断言（沿 stream-window.spec.ts 注入流形制）：connecting 期推 generation_progress 帧 → 面板渲染进度文案；推 question_ready → 进度消失、题面渲染；零进度帧流 → 静态文案逐字。web-logic.proof.ts 增对应逻辑级 section（三臂断言） |
| **W4 「第 N 题/预计 M 题」显示（#256 显示面）** | InterviewPanel.tsx（当前题区域一处）+ contracts + adaptive-lifecycle | 「第 N 题」（客户端纯派生）：N=`view.questionIdentity?.turn`，缺失降级 `view.turns.length`；追问（followUp）不增 N（同主题深度，如实口径：按主题计不按轮次计）。**「预计 M 题」两形制提请双审裁定（二选一）**〔rev2 裁定②：**形制 A**（附席2 R1+R2 勘误·落卷见 §9）〕：**形制 A（推荐·诚实约数）**：worker `question_ready` data 增 optional `plannedTurns`（=发射点决策上下文既有 mind 软预算，adaptive-lifecycle.ts:94-96 已在手、:214-217/:368-371 两发射点加一字段；business-events.ts:24-30 schema 加 optional 同名字段——旧流缺字段零破坏〔rev2 R2 勘误：**「:94-96 已在手」撤销**——数据源改钉 `snap.values.mind.maxTurns`（state.ts:136-37 mind 通道·domain :57 已含 raise 后现值）；发射点取值路径＝start 经 adaptive-lifecycle.ts **:252/:262** 调用方传参、answer 于 **:305** 作用域直读；管道义务＝PendingQuestion 投影（ai-graphs state.ts:60）增 optional `plannedTurns` 于 reducer 处填充（decide.ts:10/:27 `rememberDecision`→nextSoft）·web 侧=interview-state.ts InterviewView 增 `plannedTurns?: number` + :95-101 candidate 读入（选定理由见 §9 R1）→§9〕），面板渲染「第 N 题 / 预计约 M 题（自适应，可能调整）」，plannedTurns 缺失 → 只显「第 N 题」；**形制 B（最小面）**：本刀只显「第 N 题」，M 留待 D3 决后随提前结束刀一并落。两形制均 est live=0；A 触 worker 发射+contracts（零语义变更，纯 additive 可选字段），B 零服务端触碰。渲染位置=面板当前题头部**一处**（不逐题历史重复）；新增纯函数（如 `interviewProgressBadge(view)` 于 lib/interview/）承载派生逻辑进 proof，InterviewPanel 薄渲染。**提前结束出报告🔒D3 零触碰**：session_concluded 语义、≥N 题出报告、conclude 文案（view-model.ts:9-14）全部原样 |

---

## §2 非范围（全列 · 越界即废）

1. **提前结束出报告（#256 另半·🔒D3 待决）**——`session_concluded` 触发语义、≥N 题出报告、conclude reason 文案族零触碰（view-model.ts:9-14/:30-32 原样）。
2. **评分语义/报告语义**——得分、band、report.overall、#218 B 端定性输出全非本刀。
3. **企业侧（ENTPAY 片3）**——`enterprise_insufficient_balance` 卡片触面、修法⑥费用文案、知情窗打磨（I1 组）全非本刀；jobs 页 B 端支付文案面（action-error.ts:74-100 S2-C6 已收口）零改。
4. **#59 错误映射族 / #209 空题退额**——G4 FAILURE-PATH 刀承载，本刀零触 action-error.ts 既有行（仅 pricing/faq 静态页文案按 W2④ 微调）。
5. **服务端 begin/create 守卫与扣费路径**——reserveEntitlement 调用面、1.0 常量、`insufficient_entitlement` 402 映射、F1 三过滤全零改；1.0 提共享常量（跨 packages/db 契约化）不在本刀。
6. **进度健康语义**——进度帧不改 phase/不触发重连降级红线（generation-progress.ts:3-5）零改；不做「连接健康」新承诺。
7. **Dashboard 余额展示**——LEDGER :42 位置栏虽提「Dashboard/」，蓝本 G3 行锚文本=「开始按钮旁」；dashboard 面归后继小刀，本刀零触 dashboard/page.tsx。
8. **quiz/diagnosis 开始面的余额/消耗确认**——W2 只落 interviews 页；quiz/diagnosis 同形余额展示列后继（若双审裁 W1 的 quiz/diagnosis 下拉面剔除，同此回退纪律）。
9. 顺带非范围：#127/#58/#66 SSE 面 ·#255 transcript 恢复面（EVID 后继）·#232 列表面（G2）·#254 横幅入口（G2）·简历上传/解析流程本身 · 语音面。
10. **〔rev2 R3 勘误注记·非「非范围」声明·明示属本刀〕**：`apps/web/app/api/interview/[id]/events/route.ts` **STRESS_ID 门内**（:12 定义/:50 `id===STRESS_ID && E2E_UI_STRESS==='1'` 双门）e2e-guard-only 扩 generation_progress 帧＋零帧变体**属本刀范围**（W3 浏览器级断言注入源）；上列「服务端零改」各项（:5 扣费/begin 守卫面等）不覆盖此 e2e 注入面，门外生产代理路径（:58 起 fetch 透传）零触碰。

---

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读）→ 目标 |
|---|---|---|
| C1 | `apps/web/lib/resume/display.ts`（或新增 `eligible.ts`） | 新增 `isEligibleResume`（唯一谓词 ingested）+（W1④ 用）空态文案纯函数；三页共用单源 |
| C2 | `interviews/page.tsx:81,88,91-93,110-114,122,125-127` | 数据源 ：44 后加 `const eligibleResumes = resumes.filter(isEligibleResume)`（形沿 jobs/page.tsx:50）；两下拉、:81 门、:88/:122 默认值、:110 空态三臂全切 eligible 面 literary 不变的零字污染（ingested≥1 时页面字节等价） |
| C3 | `quiz/page.tsx:82` · `diagnosis/page.tsx:84` | 同 C2 形：filter + 空态臂（双审可裁剔除，剔除=本行撤销） |
| C4 | `interviews/page.tsx:104-139` | RSC `serverGet('/commerce/entitlement')` + `{availableUnits}` 解析（zod safeParse，形状漂移→null 同降级）；开始按钮旁余额/消耗行 + N<1 中性提示；null 降级整行不渲染 |
| C5 | `apps/web/app/pricing/page.tsx:37` · `apps/web/app/faq/page.tsx:34` | 口径句按 W2④ 微调（真读数如实+保留不购买免责）；两页其余逐字不动 |
| C6 | `apps/web/lib/view-model.ts:89-90` | connecting 臂接 `generationProgressLabel`（缺帧回静态逐字）；Display 形状零变更（message 字符串拼装，isDeadEnd 不变量 :136-140 零破坏——message 恒非空） |
| C7 | `apps/web/lib/interview/`（新增纯函数）+ `InterviewPanel.tsx` | `interviewProgressBadge(view)`（N 派生+M 形制按双审裁定）+ 面板当前题头部一处渲染；M=形制 A 时 contracts `question_ready.data.plannedTurns?: int` + business-events.ts:24-30 schema 同步 + adaptive-lifecycle.ts:214-217/:368-371 发射补字段〔rev2 R1+R4 勘误：①+码面 `apps/web/lib/stream/interview-state.ts`——InterviewView 增 `plannedTurns?: number`（:38 `questionIdentity`/:42 `turns` 相邻）+ question_ready 臂 :95-101 candidate 类型与赋值各加一处，**二择一选定 InterviewView 面**（QuestionIdentity=:37 fail-closed 提交令牌且 :102 流入 turns 历史，塞显示面预算值会扩令牌契约·InterviewView=渲染投影最小面·理由全录 §9 R1）；②「contracts `question_ready.data`」幻锚撤销——contracts:1196 注记 SSE 不入 apiContract，schema 唯一面=web 侧 business-events.ts:24-30 + worker 发射 payload 补字段，apiContract 零触碰→§9〕 |
| C8 | `apps/web/test/web-logic.proof.ts` + `apps/web/e2e-ui/`（新 spec 或并入 golden.spec.ts） | proof 新增 section：isEligibleResume 六态表、connecting 三臂、progressBadge 派生（含 plannedTurns 缺失降级）；e2e-ui 浏览器级：W3 三臂 + W4 面板渲染断言（沿 stream-window.spec.ts 注入流形制）〔rev2 R3 落卷：①+码面 `apps/web/app/api/interview/[id]/events/route.ts`——STRESS_ID 门内（:50）e2e-guard-only 扩 generation_progress/零帧变体，§2 第 10 条明示属本刀；**二择一选定 STRESS 钩子扩**（非新 spec page.route mock）：STRESS 流走真实 SSE 代理→BusinessEvent 判别→interview-state reducer→面板 DOM 全管线（stream-window.spec.ts:18 既有消费形），page.route 会旁路本路由且需测试内重写 SSE 组帧=第二实现漂移面；浏览器断言落槽=stream-window.spec.ts；②断言落槽写死：W1/W2 断言=web-logic.proof.ts **纯函数级**＋页面组合层缺口登记（nail 时入 coverage-matrix）、pricing/faq 文案断言=public-copy.proof.mjs→§9〕 |

---

## §4 prove 判据（EXEC 必须全过 · 全部注入式确定性 · 不碰真网络）

1. **W1 过滤**：isEligibleResume 六态逐态断言（唯 ingested=true）；interviews 页 RSC 逻辑面：resumes=[ingested,failed,erasure_fenced] → 下拉仅含 ingested、默认值=ingested 首 id；ingested=0 且 resumes>0 → 新空态臂文案断言；ingested=0 且 resumes=0 → 「还没有简历」逐字。quiz/diagnosis 同表（若保留 W1④〔rev2 裁定①：保留·本句条件解除〕）〔rev2 R3 落槽：本条断言落槽写死＝web-logic.proof.ts **纯函数级**；页面组合层（RSC 数据面/表单门/下拉渲染）为 proof 盲区→缺口登记 coverage-matrix（nail 时）→§9〕。
2. **W2 余额**：entitlement mock `{availableUnits:3}` → 「余额 3 · 本次消耗 1 次额度」渲染断言；`{availableUnits:0}` → 中性不足提示断言（提交按钮仍 enabled）；fetch null/形状漂移 → 整行不渲染断言；pricing/faq 文案 diff 逐行断言（免责句逐字保留〔rev2 裁定③：post-prove 判收硬项＝两尾段免责句「不构成可购买服务、报价或销售要约」/「不构成销售要约」逐字保留〕）〔rev2 R3 落槽：余额三态/isEligibleResume 断言落槽=web-logic.proof.ts 纯函数级；pricing/faq 文案断言落槽=**public-copy.proof.mjs**（prove:public-copy 管道）→§9〕。
3. **W3 connecting**：注入流 connecting 期推 `generation_progress{stage:'retrieve',elapsedMs:3000}` → message 含「AI 生成中 · 检索素材 · 已 3 秒」；推 `question_ready` → 进度清除题面渲染；零进度帧流 → 「正在建立连接…」逐字；`isDeadEnd` 全相零违例（既有不变量 section 零回归）。
4. **W4 进度徽标**：turn=2+plannedTurns=5 → 「第 2 题 / 预计约 5 题」；turn 缺失降级 turns.length；plannedTurns 缺失 → 只显「第 N 题」（形制 A〔rev2 裁定②：形制 A 已裁·本条全部生效〕）；追问 turn 不增 N 口径断言。（形制 B 则 M 断言行撤销。）
5. **既有零回归**：`pnpm --filter @meetwise/web prove`（web-logic 全量既有 section 全绿）+ `typecheck` 零新增错 + prove:public-copy 零新增违例；api/worker 侧若形制 A 触碰：api/worker prove 矩阵涉面如实列跑/未跑账（contracts additive 字段=旧消费者零破坏断言）。红项逐条基线对账禁 skip-as-pass。
6. 全部收据（EXIT、PASS/FAIL 计数、基线对照）入 EXEC 记账 + receipts，attempts 全账 Ban retry-to-green。

---

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 提前结束/D3 语义任何触碰**（session_concluded/≥N 题出报告/conclude 文案族）· Ban 扣费路径与 1.0 常量改动（reserveEntitlement 调用面/402 映射/interview·quiz·diagnosis service begin 守卫零改）· **Ban 过滤谓词漂移**（唯一可用=ingested，禁自造第二谓词/白名单）· Ban 谎报资金变动（余额读取失败禁伪读数；不足禁拦提交禁购买入口——服务端 402 权威不可被 UI 前置仿冒）· Ban 围栏细节泄漏进文案（erasure_fenced 只不列不解释）· Ban 进度=健康语义混淆（进度帧不改 phase 红线）· Ban「预计 M 题」承诺化措辞（必须约数+可调注记）· Ban Dashboard/jobs/ENTPAY 面越界 · Ban location.reload 引入 · Ban 服务端 begin 守卫触碰（UI 列表面 only）· Ban secrets/Key 入库 · Ban SSOT 无关触碰（e2e-requirement-coverage-matrix/gap-bug-backlog 只在 nail 时改）。

---

## §6 pins（十一值照抄总档 §6·零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503（interview-data 面仍 503 关闭·原值行代码块内零改）· `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）

---

## §7 Non-claims

本刀 ≠ 提前结束出报告（D3 未决）≠ 评分/报告语义任何变更 ≠ 企业支付面（片3/I1）≠ 服务端守卫增强（服务端谓词早已在，本刀只把 UI 列表面拉齐到服务端既有语义）；「余额 N」=渲染时点读数 ≠ 实时余额保证 ≠ 可购买承诺（预览环境仍零支付，pricing/faq 口径随落）；「本次消耗 1」=当前扣费常量如实转述（权威=interview.service.ts:229-231 的 1.0，非新承诺非新计价）；「第 N 题」按主题序号口径 ≠ 轮次/追问总数口径；「预计约 M 题」=自适应软预算约数 ≠ 承诺题数 ≠ 题数上限；connecting 进度提示 = 生成进展转述 ≠ 连接健康保证（进度非健康信号红线不变）；余额不足提示 ≠ 拦截 ≠ 支付引导；prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

---

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。三处待双审裁定项：①W1④ quiz/diagnosis 下拉面保留或剔除（本席推荐保留：同谓词同病实证）；②W4 M 题形制 A/B（本席推荐 A：字段既有数据源、additive 零破坏）；③W2④ pricing/faq 口径句措辞终稿。〔rev2：三项**均已裁定闭项**——①保留·②形制 A（附 R1/R2 勘误）·③措辞边界（去「实时」·免责句逐字保留）——全量落卷见 §9；STOP 流转 `draft_rev2:pre_exec_dual` 见卷尾〕。任何越 §2 非范围冲动 = 停手上报，不借机修。

---

## §9 rev2 双审合并落卷（append-only · 2026-10-10 · 落卷席 `g3-rev2` · docs-only · 零码动）

**双审回卷**：席1 **PASS**（六条随 EXEC）＋席2 **FAIL 窄面**（R1-R4，全部窄于 §1/§3 已列面，无范围外新增面）。**协调方裁定**：W4 M 题＝**形制 A**（附席2 R1+R2 勘误落卷）· W1④ quiz/diagnosis＝**保留**（双席同裁）。正文改动仅限〔rev2·勘误注记〕插入，v1 原文零删除零改写；本节为 8 条处方全量落卷，全部锚点经本席 @52e7b1eb 实读复核。

### 席2 R1 —— W4 形制 A 码面补列（interview-state.ts · 二择一写死）
- **新增码面**：`apps/web/lib/stream/interview-state.ts`。
- **写死选定：InterviewView 增 optional `plannedTurns?: number` ＋ question_ready 臂 :95-101 candidate 读入**（candidate 类型行 :95 加一成员、赋值于 :101 相邻一处；字段落位与 :38 `questionIdentity`/:42 `turns` 相邻）。**选择理由（席1 管道义务分析）**：QuestionIdentity 是 fail-closed 提交令牌（:37 头注「缺失时 UI 不得提交旧 turn body」）且 :102 流入 `turns[]` 历史——塞入显示面预算值会扩令牌契约、污染逐题历史、有被并入身份比较的漂移风险；InterviewView 是纯渲染投影，optional 缺失即降级（只显「第 N 题」），最小面＝2-3 行＋proof 一节。
- 正文落点：§1 W4 行〔rev2 R2 勘误注记〕＋§3 C7 行〔rev2 R1+R4 注记〕。

### 席2 R2 —— M 数据源勘误（「:94-96 已在手」撤销）
- **撤销**：`adaptive-lifecycle.ts:94-96 已在手`——实读 :94 `maxTurns?: number` 为 AdaptiveLifecycleDeps 决策上下文声明、:124 为 initMind 入参：是**图初始化输入**，非两发射点作用域可读源。
- **改钉数据源**：`snap.values.mind.maxTurns`——`packages/ai-graphs/src/adaptive-interview/state.ts:136-137` `AdaptiveInterviewState` mind 通道（`snap.values?.mind` 与既有 `snap.values?.pending`（lifecycle :44-46）同取值形）；`packages/domain/src/adaptive-interview.ts:57` `maxTurns: number; // 当前软预算(raise 后已是新值)`＝**已含 raise 后现值**（raise 臂 :400-404 赋 `view = { ...mind, maxTurns: raised }`）。
- **两发射点取值路径**（实读 @52e7b1eb）：start＝`apps/worker/src/adaptive-lifecycle.ts:252` `const pending = pendingQuestion(snap)` → **:262** `persistAndEmitQuestion(d, pending)` 调用方传参；answer＝**:305** `const next = pendingQuestion(snap)` 作用域直读 → :368-371 appendEvent 补一字段。
- **管道义务（席1）**：PendingQuestion 投影（`state.ts:60` `export interface PendingQuestion`）增 optional `plannedTurns`，**于 reducer 处填充（nextSoft）**＝decide.ts:10/:27 `rememberDecision(state.mind, action)` 产出 mind（`maxTurns=nextSoft`·domain :378-385）；generate-question.ts:92 构造 pending 时自 `state.mind` 带入即得，两发射点经既有 `pending`/`next` 零额外管道直达。
- 正文落点：§0 #256 行＋§1 W4 行勘误注记。

### 席2 R3 —— C8 码面补列 ＋ 断言落槽写死
- **C8 补列**：`apps/web/app/api/interview/[id]/events/route.ts`——STRESS_ID 门内（:12 `const STRESS_ID`／:50 `if (id === STRESS_ID && process.env.E2E_UI_STRESS === '1')` 双门）e2e-guard-only 扩 generation_progress 帧＋零帧变体；§2 第 10 条已明示该面属本刀。
- **二择一写死：STRESS 钩子扩**（非新 spec page.route mock）。理由：STRESS 流（`e2eStressStream` :20·stream-window.spec.ts:18 既有消费形 `?duplicateFrames=1`）走真实同源 SSE 代理→BusinessEvent 判别→interview-state reducer→rAF 桥→InterviewPanel DOM **全管线**，保真度高于 page.route（后者旁路本路由，须在测试内重写 SSE 组帧＝第二实现漂移面）；零新增生产路由、门内注入面 e2e-guard-only。浏览器断言落槽＝stream-window.spec.ts（STRESS 源属主·W3 三臂/W4 面板断言）。
- **断言落槽写死**：W1/W2 断言＝`apps/web/test/web-logic.proof.ts` **纯函数级**（isEligibleResume 六态表/entitlement 三态/文案纯函数）＋**页面组合层缺口登记**（RSC 数据面/表单门/下拉渲染为 proof 盲区→nail 时入 e2e-requirement-coverage-matrix）；pricing/faq 文案断言＝**public-copy.proof.mjs**（prove:public-copy 管道）。
- 正文落点：§3 C8 行＋§2 第 10 条＋§4.1/§4.2 落槽注记。

### 席2 R4 —— 微勘三条
- **C7 contracts 幻锚撤销**：contracts:1196 注记「SSE 事件流 …非 JSON 响应，不入 apiContract（对齐 interview events）」——question_ready 增量字段的 schema 唯一面＝`apps/web/lib/stream/business-events.ts:24-30`（web 判别联合，:24-30 实读吻合）＋worker 发射 payload 补字段；apiContract（packages/contracts/src/index.ts）零触碰。
- **「六 spec」→七**：`ls apps/web/e2e-ui/*.spec.ts`＝7（golden/online-public/recruiting-bound/screenshots/stream-window/uc018-abandon/voice-duplex），正文「六」为笔误（所列名单本身七名全对）。
- **generation-progress 行号 ±2** 漠记入 §0 微漂账（实读 :20-24，见下）。

### 席1 六条（随 EXEC 携带 · 裁定落卷）
1. **裁定①（W1④ quiz/diagnosis 保留·双席同裁）**：canonical 更正版 issues-master :296 原文点名「面试页/**押题页**列出全部简历（含『解析失败』『删除处理中』）」——蓝本原文已含押题面，保留非扩充；diagnosis 面为起草席同谓词亲证扩充、一并保留。**LEDGER :41 #260 行指标列「不可用简历置灰」措辞由本裁定 superseded**（本刀＝过滤不列、非置灰；canonical :296 原文「按可用性过滤或置灰」两可，刀裁取过滤）——supersession 注记记账于本节，LEDGER 文件本身零改（nail 时对账）。
2. **裁定②（形制 A＋管道义务）**：已由 R1/R2 落卷（上）。
3. **裁定③（pricing/faq 措辞去「实时」）**：终稿边界＝**只动两处假读数短语**——pricing:37「仅表示界面或开发流程状态」／faq:34「仅用于展示」（实读两行原文吻合；示例句「来自你的账户实时查询」**去「实时」**、与 §7「≠实时余额保证」Non-claim 对齐）；**两尾段免责句逐字保留**＝pricing:37 尾「不构成可购买服务、报价或销售要约」／faq:34 尾「不构成销售要约」。EXEC 按边界起草；post-prove 按「免责句逐字保留」判收（diff 逐行断言·§4.2）。
4. **蓝本回补条款**：canonical＝**更正版** issues-master（机外 `~/Documents/Meetwise产品审计-更正版/issues-master.md`）——:272/#161、:292/#256、:296/#260、:438/#261 **四引线唯一命中**；三份并存（更正版／`Meetwise产品审计`／`Meetwise学习与审查/01-成品文档`）同行号实测互斥（副本2 :272=表头/:292=分隔行/:296=#223/:438=#269；副本3 :272=#71/:292=#38/:296=#52/:438=空）。EXEC 记账/receipt 附录须附**四条 issue 原文全行＋蓝本 G3 行原文**（`batch-residual-plan.md:88`·meetwise-line-entpay 工作树实读：G3=BEGIN-GUARD 进度刀·四引线 #260(:296)/#261(:438)/#161(:272)/#256(:292)）；协调方考虑更正版两文件（issues-master.md/fix-roadmap.md）入库 ai-docs/（快照注记·防三份并存行号漂移）。
5. **微漂 5 条**入 §0 尾记账（见下）。
6. 头部 Rev2 横幅＋卷尾状态行（STOP 流转）。

### §0 尾·微漂记账（5 条·@52e7b1eb 实读·漂±全录）
1. `InterviewView.turns` 实读＝interview-state.ts:**:42**（正文记 :34-35 为 interface 起行区）。
2. 段名表 GENERATION_STAGE_LABELS 实读＝generation-progress.ts:**:20-24**（正文记 :24-29·-4）。
3. 软预算上调块实读＝domain adaptive-interview.ts **:400-404**（裁定记 :398-402·再漂 +2·以实读为准漠记；SOFT_BUDGET_RAISE_STEP 定义=:102）。
4. e2e-ui spec 数＝**七**（正文「六」笔误·R4 勘误）；随附漠记：contracts session_concluded payload 实读 :107-110（正文记 :104-110·±3）。
5. LEDGER :41 #260 行「置灰」措辞 superseded（裁定①·注记记账于上·LEDGER 文件零改）。

### rev2 后流转
STOP 由 `draft:awaiting_pre_exec_dual` 流转 **`draft_rev2:pre_exec_dual`**——待复审确认后协调方行使 EXEC 授权；EXEC 依 §1（含 rev2 勘误注记）＋§5 Ban 实现，三处裁定项均已闭；EXEC 不得改本节处方，漂移回 REQUEST 补审。

---

`draft_rev2:pre_exec_dual`（席1 PASS+席2 FAIL 窄面处方 8 条落卷·裁定=形制 A 附 R1/R2·待复审确认后协调方行使 EXEC 授权）

`executed:awaiting_post_prove_dual`（EXEC `g3-exec` @`line/g3-begin-guard` rebase 后落码·2026-10-10 · 协调方明示授权后依 §1 含 rev2 勘误实现：W1 三页过滤+空态三臂/W2 余额行+pricing·faq 口径句/W3 connecting 真进度/W4 形制 A 全管道/C8 STRESS 变体族·八处方全兑现·断言落槽 web-logic 纯函数级 285 PASS/0 FAIL+public-copy TC-PUBLIC-COPY-G3 PASS·免责尾句逐字保留·门禁亲跑 neg:interview 97/97+interview:prove 54+adaptive-life:prove 42+ai-graphs 2 键+web/api typecheck 全 EXIT=0·prove:public-copy EXIT=1=预存红 E8 基线对账同点同抛零触碰·微漂⑥⑦⑧入收据漂移表（⑥=turn 0 基→显示 1 基勘误·§4.4 按勘误口径断言·⑦=?duplicateFrames 死通路→变体 id 族双门·⑧=行号漠记）·§4.4/§4.2 判收请对账微漂⑥与裁定③·提前结束/D3/评分语义/服务端守卫/扣费路径/402 文案/contracts 零触碰·零迁移·est live=0 · 收据 `ai-docs/delivery/receipts/g3-begin-guard/`（EXEC 报告+EXIT 表+漂移表+蓝本回补附录+三证据卷）·⛔push · alone≠dual）

---

## nail 落卷（2026-10-10 · post-prove 双席 BOTH PASS）

**双审结果**：席1（实现语义/形制 A 链）+席2（用户旅程/回归）互盲复核 BOTH PASS。形制 A 全链 7 环亲读闭环（PendingQuestion :76 additive→reducer :105 自 decide 后 mind.maxTurns 填充（R2 勘误兑现）→两发射点 :218/:374→business-events :31 optional→InterviewView :48（R1 写死案）→progress-badge 纯派生→canAnswer 门控一处渲染）·微漂⑥ 勘误双实证接受（服务端 turn 0 基→显示 1 基·原公式两臂恒差 1 会显「第 0 题」幻影）·W1 三页过滤唯一谓词单源+空态三臂·W2 余额三形状+免责尾句逐字保留（public-copy TC-PUBLIC-COPY-G3 判收 PASS）·W3 connecting 三臂+isDeadEnd 零违例·六门禁双席独立复现（web 285/97/54/42/public-copy 9✓+E8 预存独立实证）。merge 落主线 @01ee59bf+截断修复 @3b827fb2（dual-keep 正则非贪婪切分缺陷→行级切片重建·web prove 298 全绿·G3 四 section 完整性亲证）。

**nail 时随卷**：①D-rcpt 账面勘误（收据称 G3 五 section 34 断言·实测 4 section 29 PASS·总量 285/298 真仅措辞虚高）②组合层 DOM 缺口入 coverage-matrix ③e2e-ui 两新测试随卷待 runner 栈复跑。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·merge @01ee59bf+修复 @3b827fb2·#260/#261/#161/#256 显示面四条款正式解除·批1 残 9→5·markers=0·est live=0）。
