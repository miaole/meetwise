# G4 FAILURE-PATH — 失败路径诚实刀（#59+#209 · 批1 残留 G4 组 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `g4-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding）· **rev2 勘误注记**：预执行双审已落卷（席1 PASS+席2 FAIL 窄面·三裁定全批·处方 10 条并入正文各节·原判定文字零删改）——现行状态行见文尾 `draft_rev2:pre_exec_dual`
**Date**: 2026-10-10
**审计项**: 蓝本 `batch-residual-plan.md` §三 打包表 G4 行（:89）＝#59+#209（M 体量·批1 残留）· 清点表 :28/#59、:30/#209 · 对应 LEDGER 行 :32/#59、:35/#209（LEDGER :207 残 12 同列）
**Base**: `feat/mysql-schema-skeleton` @`9cac8778`（资源治理 docs tip·主线最新）· 分支 `line/g4-failure-path`（工作树 `meetwise-g4`）
**蓝本可及性注记**: issues-master.md / fix-roadmap.md 不在本仓树（沿 G3 REQUEST 同记）；本席亲读 **canonical 更正版副本** `/Users/miaole/Documents/Meetwise产品审计-更正版/issues-master.md`——**#59=:228、#209=:286 与蓝本 G4 行引线逐行命中零漂**；副本互证：该 527 行副本 #257=:293 与蓝本 :293 引线唯一吻合，另两份并存副本（产品审计 493 行 / 学习与审查 494 行）行号互斥不采。全部代码锚行号以实树 @`9cac8778` 亲读为准（EXEC 立项照例重 pin）。**rev2 蓝本注记补行**：`batch-residual-plan.md` 读取来源=工作树 **`meetwise-line-entpay`**（`/Users/miaole/Desktop/golucky/meetwise-line-entpay/ai-docs/delivery/harness/batch-residual-plan.md`·G4 行 :89／清点表 #59 :28、#209 :30——席2 代证逐字命中·落卷席复验零翻）。
**Honesty**: 全部涉案码 file:line 起草席亲读 @`9cac8778`；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（W1 纯前端映射零外呼；W2 空结果/facts 拦截为**减少**注定空转的模型外呼，零新增外呼零消耗）。

---

## §0 立靶（两条款逐项亲读 · 漂±全录）

| 条 | 蓝本原文（G4 行 :89 / 清点表 :28/:30 誊录） | 更正版原文（issues-master 更正版） | 代码锚（蓝本→实读·漂） | 亲读实证 @9cac8778 |
|---|---|---|---|---|
| **#59** | 清点表 :28「InterviewPanel.tsx:248 仍 `j?.message ?? '提交失败,请重试'`——code→文案/动作映射与 API 统一信封未落（410 面已随 #243 落，泛化面仍在）」·G4 行 :89「前端 code→文案/动作映射（401 登录/409 回列表）+API 统一错误信封——410 面已随 #243 落」 | :228「提交失败前端读 j?.message，而 API 错误体多为 {error: code}，只显示泛化文案，401/409 无引导」·建议「前端按 error code 映射文案与动作（401 登录、409 返回列表）；API 统一错误信封」·相关 #88·关联 #243、#251 | InterviewPanel.tsx:248（**零漂**） | :247-248 提交失败臂 `const j = await res.json().catch(...)` → `toast.error(j?.message ?? '提交失败,请重试')`。而服务端错误体={error: code} 无 message：proxy 401 `{error:'unauthorized'}`（apps/web/app/api/interview/[id]/turn/route.ts:13）、400 `missing_idempotency_key`（:16）、上游体透传（:23）；API 面 interview.service.ts:61 `{error:'not_found_or_forbidden'}`、:325 409 `interview_not_active`、:424/:458 409 `interview_answer_submission_conflict`、:66 410 `interview_privacy_fenced`——**`j?.message` 生产面恒 undefined → 恒落泛化兜底，401 无登录引导、409 无回列表动作=审计原文逐字应验**。映射先例已落：`actionErrorMessage(page, status, code)`（apps/web/lib/errors/action-error.ts:78·页域联合 `interviews|quiz|diagnosis|jobs` :17）四页分码+proof 全绿（web-logic.proof.ts:807-837）；410 文案常量 :45「该面试已进入数据删除流程，请新建面试」（#243 F6 已落）——**410 begin 面已收口，残面=提交失败泛化面（同函同病）**。同形邻面（蓝本未点名·本席新证）：:196 语音转写失败臂同读 `j?.message ?? '语音转写失败…'`（403 `consent_required` 已分码 :193-195·503/502 臂文案固定——message 读数同形死读数） |
| **#209** | 清点表 :30「quiz-lifecycle 空题仍 confirmConsumption 全额结算（deliver 段无 0 题/0 grounded 分支）；diagnosis 同构；facts 空无前置拦截」·G4 行 :89「押题 0 题/诊断 groundedCount=0 走失败退额（deliver 事务加空结果分支）+facts 空前置拦截」 | :286「押题过滤后 0 题、诊断 groundedCount=0 时仍全额结算并置 ready；空 facts 简历也照常调模型」·建议「**空结果走失败退额；facts 为空前置拦截**」·相关 #191 | quiz-lifecycle.ts:42-60→实读 :42-61（**微漂+1**）·diagnosis-lifecycle.ts:47-64→实读 :47-66（**微漂+2**） | 押题：quiz-lifecycle.ts:44 `const questions = (out.questions ?? [])` **零空判定** → :50 `confirmConsumption(c, owner, quizId, 1)` 全额结算 → :57 CAS 落 ready——**0 题照扣照交付=审计原文应验**。诊断同构：diagnosis-lifecycle.ts:50 仅拦 `report=null`（`diagnosis_empty_report`），report 非空而 grounded=0 照样 :55 全额 confirm → ready；grounded=0 判定谓词**字段实在**：`DiagnosisReport.groundedCount`（packages/ai-graphs/src/resume-diagnosis.ts:41·finalize :84-85 派生）。facts 面：quiz-lifecycle.ts:26 / diagnosis-lifecycle.ts:32 `ingestResume(resumeRaw).facts` 后**零空检**直奔 :43/:48 `graph.invoke` 调模型。**失败退额家族已在（本刀不自造新协议）**：quiz-consumer.ts:26-60 catch 全套（markQuizJobFailed :52 + resume_quiz 置 failed :55 + `quiz_unavailable` 终态事件 :57 + `releaseConsumption` 退额 :59）；diagnosis-consumer.ts:44-58 同构镜像（:51/:54/:56/:58）；commerce 协议范本 `failInterviewAndRelease`（packages/db/src/commerce/commerce.ts:280 = release+CAS failed 同事务收口）·`releaseConsumption` :215（0157 payerRouted 企业行已 handled :225/:236）·`confirmConsumption` :166（ratio 形参 :167）。**更正版修法=「失败退额」→ release 全退；partial（ratio<1 partial_confirmed）显式弃用**：0 题给 partial=收钱交白卷，仍不诚实（rev2 勘误：本行「payerRouted 企业行已 handled :225/:236」→ 实读 **commerce.ts:224-227**·见本节 rev2 合并尾账④） |

**微漂尾账**：蓝本 quiz 锚 :42-60→实读 :42-61；diagnosis 锚 :47-64→实读 :47-66；InterviewPanel :248 零漂；更正版引线 #59(:228)/#209(:286) 零漂。

**rev2 双审合并微漂尾账（11 条=席1 七＋席2 四·落卷席 2026-10-10 实树逐条复验锚定）**：
- **席2 四条**：① §1③/C2 catch 臂引 :256 → 实读 **:258**（`toast.error('提交未成功，请重试')`；:256 为成功臂 `setAnswer('')`）；② §1② 登录跳转「沿 server.ts:33 同参形」→ 实读 **apps/web/lib/api/server.ts:30**（401→`redirect('/login?expired=1')`）；③ §1⑤ partial 引 :200 → partial_status 判定实读 **commerce.ts:203**（`ratio >= 1 ? 'confirmed' : 'partial_confirmed'`；:200 为 bucket rowcount throw）；④ §0「0157 payerRouted 已 handled :225/:236」→ 实读 **commerce.ts:224-227**（:224 判定／:226 分支／:227 `applyAllocationDelta`；:236 为空行）。
- **席1 七条**（落卷席按产品实锚逐条复验提炼）：⑤ api interview.service.ts :325 409 判定 → 实读 **:326**（`interview_not_active` return 行；:325 为 `answerableError` 签名行）；⑥ §2.5 接地闸引 :262-284 → 实读 **:261-286**（`apps/worker/src/interview-service.ts`·refs :282／数字 :283-284 核心零漂·区间端点外扩）；⑦ §1③ diagnosis binding 引 :34-43 → 实读 **:34-44**（binding 块闭合 `});` 在 :44；quiz 侧 :28-38 含闭合零漂）；⑧ §6 pin privacy.service 引 :68 → :68 为「公开入口保持 503」注记行·503 throw 实读 **:70**（controller :61-62 零漂）；⑨ §0 quiz-consumer「catch 全套 :26-60」→ catch 臂实读 **:36-60**（:26-35 为 drain 前段；具名锚 :52/:55/:57/:59 零漂）；⑩ §2.9「submit 成功臂/幂等键构造 :234-246」→ 成功臂实读 **:255-256**（:234-246 为提交构造面·幂等键头 :243 零漂）；⑪ §2.1「押题列表 quiz/page.tsx:101 简历名时间」→ :101 实读为 `it.id.slice(0, 12)` 截断码·简历名仅在起始表单 select **:83**（`resumeOptionLabel`）。
- **生成器闸补录两行**：`apps/worker/src/interview-service.ts:238`（`businessValidate … 'empty_quiz' / 'blank_question'`）· **:275**（`'empty_diagnosis'`）——既有生成器闸（quiz.proof.ts:27 同口径）；洞 B 断言判据据此鉴别（§4.3 rev2）。
- **洞 B 路径注记**：滤后 0 题=真路径：`packages/ai-graphs/src/resume-quiz.ts:25-30` validate 节点 `refsGroundedInFacts` 逐条滤（scripted items 全幻觉如 `refs:['Go']` → 滤空 `questions:[]`）；诊断 groundedCount=`packages/ai-graphs/src/resume-diagnosis.ts` finalize **:84** `d.sections.reduce(…findings.length)` 求和（:85 落 report）——worker 断言与判据构造须按滤后口径走，非生成器闸路径。

**靶心一句话**：提交失败只见一句万金油「提交失败,请重试」（401 不引登录、409 不指出路）；押题/诊断空结果照扣全额额度还交付空壳 ready；空 facts 简历白烧一次模型外呼——三件事同属「失败路径诚实化」：错了就说出路、空了就退钱、没料就不烧模型。本刀一并收口。

---

## §1 范围（两件 · EXEC 依此实现）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 提交失败分码映射（#59）** | InterviewPanel.tsx:247-252（提交失败臂）·新增纯函数落点 | ① **映射函数落点提请双审裁定（形制 A/B·本席推荐 A）**：**形制 A**＝新 sibling 纯函数 `lib/errors/turn-submit-error.ts` `turnSubmitFeedback(status: number, code: string | null): { text: string; action?: 'login' \| 'back_to_interviews' }`——零 DOM 依赖进 proof，不动既有四页 `ActionErrorPage` 联合与 web-logic.proof 既有断言面；**形制 B**＝action-error.ts 扩页域 `'interview'`——须同步改 proof 全页遍历断言（:807-837），体量+风险均高。② **分码表**（文案能引 action-error.ts 既有常量者引常量单源，其余逐字注明来源）：401/`unauthorized` →「登录已过期，请重新登录」+action `login`（组件侧跳 `/login?expired=1`，沿 server.ts:33 同参形）；409 `interview_not_active` →「该面试已结束」+action `back_to_interviews`（回 /interviews）；409 `interview_answer_submission_conflict` → 防双提交中性文案（作答保留、既有回滚行为 :249 零改）；410 `interview_privacy_fenced` → action-error.ts:45 文案**逐字引常量**+action `back_to_interviews`；503/`public_preview_read_only` →「服务暂不可用」（action-error.ts:48 同文）；未知码/无码/解析失败 → 既有「提交失败,请重试」**逐字兜底**。③ **禁止裸透传 `j?.message`**（:248 撤除——信息泄露面+不友好=审计原文）；网络层 catch 臂（:256「提交未成功，请重试」）文案零改。④ 组件侧：失败臂读 `j?.error` 取 code → `turnSubmitFeedback(res.status, code)` → toast 文案+action 薄执行（action 判定在纯函数、执行在组件，分层进 proof）。⑤ **voice 邻面 :196 收编与否提请双审裁定**（本席推荐收编：同文件同形死读数，撤 `j?.message` 改固定文案逐字兜底，403/503/502 既有分码分支零改；剔除则回退仅 :248 面零残留）。⑥ **「API 统一错误信封」按最小面如实登记**：turn 面 `{error: code}` 信封已事实在（§0 亲证五码），本刀零改 API 错误体形状；全 API 面信封统一改造登记后继（§2.4），非本刀（M 体量红线）。**rev2 落卷注记（勘误＋裁定①②）**：**裁定① 形制 A 批准**——席1 异形分层注记：`turnSubmitFeedback` 返回 `{text,action}` vs `ActionErrorMessage` `{text,href,note}` 属**有意分层**（提交动作型反馈≠页面型错误块），EXEC 证明按 §4 判据对 `turnSubmitFeedback` 单源断言；②勘误：登录跳转「沿 server.ts:33 同参形」→ 实读 **server.ts:30**；③勘误：网络层 catch 臂「:256」→ 实读 **:258**（:256 为成功臂 `setAnswer('')`）；④**裁定② voice :196 收编批准**：同形死读数·撤除零行为变化（:193-195 既有分码分支零改照旧）——C3 由「双审裁定收编时」转**确定项**，§5「不收编则」活口闭合；⑤410 同一性：action-error.ts:45 `INTERVIEW_PRIVACY_FENCED_TEXT` 常量**补 `export`＝非文案行改动·不触 §5 Ban**（值零改）；EXEC 择**「import 单源」**落 §4.1 同一性断言（turn-submit-error.ts 与 proof 导入同一常量） |
| **W2 空结果失败退额+facts 前置拦截（#209）** | quiz-lifecycle.ts:26/:43-50 · diagnosis-lifecycle.ts:32/:48-55 | ① **quiz 空题分支**：deliver 事务内 `confirmConsumption` **之前**（:48 进事务后 :50 confirm 前；或 :44 判定后提前 throw——落点 EXEC 择一，硬约束=必在 confirm 之前）`if (questions.length === 0) throw new Error('quiz_empty_questions')`（稳定码进 job last_error）→ 消费者既有失败路径收口（quiz-consumer.ts:55 置 failed + :57 `quiz_unavailable` + :59 `releaseConsumption` 退额）——**不自造新 release 协议**，与 failInterviewAndRelease 家族（commerce.ts:280）同构对齐：release+CAS 终态+用户可见终态事件三件套。② **诊断空 grounded 分支**：diagnosis-lifecycle.ts:50（`diagnosis_empty_report` 现检）之后 :55 confirm 之前加 `if (report.groundedCount === 0) throw new Error('diagnosis_no_grounded_finding')`（谓词字段=DiagnosisReport.groundedCount·resume-diagnosis.ts:41 亲证）→ diagnosis-consumer.ts:54-58 既有失败路径退额。③ **facts 空前置拦截**：quiz-lifecycle.ts:26 / diagnosis-lifecycle.ts:32 ingest 后、模型 dispatch（:43/:48）**前**加空检 `facts.length === 0 → throw 'quiz_empty_facts' / 'diagnosis_empty_facts'`——省一次注定空转的模型外呼（est live 反向收益）；拦截点在 binding（quiz :28-38 / diagnosis :34-43，行已 `generating`）之后 → 消费者 catch 置 failed+退额，**不留孤儿 created**。④ **0157 企业行一致性**：releaseConsumption 已 handle payerRouted（commerce.ts:225/:236）——企业预留的押题/诊断空结果同走退额；本刀零触 applyAllocationDelta，仅依赖既有函数（无新 SQL 直写桶）。⑤ **partial 显式弃用**：更正版修法=「失败退额」；confirmConsumption 虽支持 ratio<1（:167/:200），0 题收 partial=收钱交白卷仍不诚实——Ban（§5）。**rev2 落卷注记（裁定③）**：throw 落点=**必在 confirm 之前**——quiz=事务内（:48 事务开后、:50 confirm 前）；diagnosis=对称位（:50 `diagnosis_empty_report` 现检后、:53 事务开前）——与「结算/状态机都校验返回值」既有注记同段可读；facts 拦截照本件③原案（binding 后 dispatch 前）零变。勘误：③ binding 引「diagnosis :34-43」→ 实读 **:34-44**（闭合 `});` 在 :44；quiz 侧 :28-38 含闭合零漂）。断言判据钉死见 §4.3 rev2（`last_error` 鉴别子·滤后路径） |

---

## §2 非范围（全列 · 越界即废）

1. **#232/#254/#257**——归 G2 REPORT-PAGE 体验刀（`line/g2-report-page`·协调方口径已 EXEC）；report 页导出/押题列表（quiz/page.tsx:101 简历名时间）/横幅入口三面**零触**。
2. **扣费语义除 W2 空结果退额触发面外零触**——reserveEntitlement 调用面、1.0 常量、`confirmConsumption`/`releaseConsumption`/`failInterviewAndRelease`/`abandonInterviewAndRelease` **函数体（commerce.ts 全域）零改**——本刀只新增调用点不改协议；0157 企业路由/applyAllocationDelta 零触。
3. **#243 已落面**——410 begin 文案行、SSE 410 停转、action-error.ts 既有四页行/文案**零改**（W1 只新增 sibling 或引既有常量）。
4. **API 错误体形状/全 API 面信封统一改造**（W1⑥ 登记后继）——HttpException 形状、transcribe-proxy、interview events route 错误面零改。
5. **诊断接地业务闸与图语义**——interview-service.ts:262-284 refs/数字接地闸、图侧 factuality 过滤强度零改；本刀只在其下游兜底空结果，不上升闸强度。
6. **终态事件消费面**——`quiz_unavailable`/`diagnosis_unavailable` 前端消费与 payload 形状零改（SSE-RESILIENCE 已落）；worker 发射 reason 串新增值域（'quiz_empty_questions' 等）属如实记账非破坏性变更。
7. **G3/G1 域**——#260/#261/#161/#256 显示面（G3）、#42/#43/#41（G1）零触；InterviewPanel 进度徽标/横幅面零触。
8. **语音链路其余面**——:196 收编裁出则全链零触；TTS 面（interview.controller.ts:113-115）零触。
9. 顺带非范围：#229 重试频控、submit 成功臂/幂等键构造（InterviewPanel.tsx:234-246）、#88、#251、#191 主面。

---

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读）→ 目标 |
|---|---|---|
| C1 | `apps/web/lib/errors/turn-submit-error.ts`（新增·形制 A） | `turnSubmitFeedback(status, code)` 纯函数：分码表+action 枚举；零依赖零 DOM；未知码/无码/垃圾输入→兜底形 |
| C2 | `apps/web/components/InterviewPanel.tsx:247-252` | 失败臂读 `j?.error` → `turnSubmitFeedback` → toast+action 薄执行；**:248 裸 `j?.message` 撤除**；回滚/清桥行为（:249-251）零改；catch 臂 :256 文案零改 |
| C3 | `apps/web/components/InterviewPanel.tsx:196`（双审裁定⑤收编时） | voice 臂 `j?.message` 死读数撤除→固定文案逐字兜底；403/503/502 既有分码分支（:193-195）零改 |
| C4 | `apps/worker/src/quiz-lifecycle.ts` | :26 后 facts 空检（`quiz_empty_facts`·位于 binding 后 dispatch 前）；:44 判定/:50 confirm 前空题分支（`quiz_empty_questions`） |
| C5 | `apps/worker/src/diagnosis-lifecycle.ts` | :32 后 facts 空检（`diagnosis_empty_facts` 同 C4 形）；:50 后 :55 前 `report.groundedCount === 0 → 'diagnosis_no_grounded_finding'` |
| C6 | worker 测试面（沿 apps/worker 既有测试矩阵实况落位） | 0 题 → throw 码断言+confirmConsumption 零调用（spy）；facts 空 → 模型 dispatch 零发生断言；诊断 grounded=0 → throw 码+confirm 零调用；消费者既有失败路径测试零回归 |
| C7 | `apps/web/test/web-logic.proof.ts` | 新增 section：turnSubmitFeedback 分码表全行断言（401/409×2/410/503/未知码/无码/垃圾体）+（裁定收编时）voice 兜底文案断言。**rev2**：收编已批（C3 确定项）·新增 section 含两件——①turnSubmitFeedback **纯函数输出断言**（§4.2 rev2·mock res 仅输入叙述）；②**组件源码 read-file 静态接线断言**（`turnSubmitFeedback(` 在失败臂·`j?.message` 零残留·:249-251 回滚三行形·:258 catch 文案逐字）＋「组件行为面无 DOM 载体·静态+人工对账」如实记账 |

---

## §4 prove 判据（EXEC 必须全过 · 全部注入式确定性 · 不碰真网络真模型）

1. **W1 分码表**：turnSubmitFeedback 逐行断言（§1② 表全行，含 410 文案与 action-error.ts:45 常量同一性断言、未知码/无码/垃圾体兜底逐字）。**rev2**：410 同一性断言 EXEC 择**「import 单源」**（proof 导入与 turn-submit-error.ts 导入同一常量引用同一性·常量补 `export` 见 §1② rev2 注记⑤·值零改不触 Ban）。
2. **W1 组件臂**：mock res `{status:401,body:{error:'unauthorized'}}` → 文案+login action 断言；`{status:409,body:{error:'interview_not_active'}}` → 回列表断言；`{status:409,body:{error:'interview_answer_submission_conflict'}}` → 作答保留+回滚行为零回归断言；`{status:410,body:{error:'interview_privacy_fenced'}}` → #243 文案逐字；body 无 error 无 message → 兜底逐字。**rev2 洞 A 勘误（席2 窄面处方①·取代本条断言形制·原行保留存照）**：401/409×2/410/兜底各行改 **`turnSubmitFeedback` 纯函数输出断言**（mock res 仅作输入叙述·形制 A 本意——不做组件端到端 mock 执行）；「作答保留+回滚零回归」改**静态接线断言**：web-logic.proof 新 section 对组件源码 read-file 断言四件——`turnSubmitFeedback(` 在失败臂·`j?.message` 零残留·**:249-251** 回滚三行形仍在·**:258** catch 文案逐字在——并**如实记账「组件行为面无 DOM 载体·静态+人工对账」**。
3. **W2 worker**：graph mock 返回 0 题 → `quiz_empty_questions` throw + confirmConsumption **零调用** spy 断言；facts 空 → dispatch 零发生断言；诊断 `groundedCount:0` → `diagnosis_no_grounded_finding` throw + confirm 零调用；消费者既有失败路径（failed 置态+终态事件+release）零回归。**rev2 洞 B 勘误（席2 窄面处方②·分支鉴别子钉死·原行保留存照）**：0 题判据必须走**滤后路径**（scripted items 全幻觉如 `refs:['Go']` → 图 validate 滤空——`resume-quiz.ts:25-30` 真路径，见 §0 洞 B 路径注记）或**显式图边界 mock**；并断言 `last_error === 'quiz_empty_questions'` / `'diagnosis_no_grounded_finding'`——**非**既有生成器闸 `'empty_quiz'` / `'empty_diagnosis'`（`quiz:empty_quiz` 闸·worker interview-service.ts:238/:275，不得借闸偷过）；「confirm 零调用 spy」放宽为**等效观测断言**（units 不变＋consumed 账零新增——不强制 spy 形制）。
4. **零回归**：`pnpm --filter @meetwise/web prove`（web-logic 全量既有 section 全绿）+ typecheck 零新增错；worker/api 涉面测试如实列跑/未跑账（mock 消耗=0 live）；红项逐条基线对账禁 skip-as-pass。
5. 全部收据（EXIT、PASS/FAIL 计数、基线对照）入 EXEC 记账+receipts，attempts 全账 Ban retry-to-green。

---

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 裸透传 `j?.message` 残留**（:248 必撤；裁定收编则 :196 同撤）· **Ban 改 action-error.ts 既有四页行/文案**（只新增 sibling 或引既有常量）· **Ban 扣费协议改动**（commerce.ts 函数体/1.0 常量/reserve 面/0157 路由/applyAllocationDelta 零触）· **Ban 空结果 partial_confirmed 收尾**（更正版修法=失败退额；ratio<1 滥用=收钱交白卷）· Ban 自造第二套 release 协议（沿消费者既有失败路径，禁新 SQL 直写桶）· Ban 模型 dispatch 新增（facts 拦截=减外呼非增）· Ban 接地闸/图语义上升改造 · Ban API 错误体形状变更 · Ban 终态事件 payload 破坏性变更（reason 值域扩展须如实记账）· Ban G2/G3/G1 域越界（§2.1/2.7）· Ban secrets/Key 入库 · Ban SSOT 无关触碰（e2e-requirement-coverage-matrix/gap-bug-backlog 只在 nail 时改）。**rev2 注记（非解禁）**：action-error.ts:45 `INTERVIEW_PRIVACY_FENCED_TEXT` 常量**补 `export` 关键字＝非文案行改动·不触「Ban 改 action-error.ts 既有四页行/文案」**（值零改·410 同一性走 §4.1「import 单源」）；裁定②已批收编 → 「:196 同撤」转**确定项**，「裁定收编则」分支条件作废（§1⑤/C3）。

---

## §6 pins（十一值照抄总档 §6·零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503（interview-data 面仍 503 关闭·原值行代码块内零改·本席 @9cac8778 亲证 privacy.controller.ts:61-62+service :68）· `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型新增外呼·facts 拦截为减少外呼·est live=0）· **rev2 勘误注记（值零翻转）**：`service :68` 为「公开入口保持 503」注记行·503 throw 实读 **privacy.service.ts:70**（controller :61-62 零漂）

---

## §7 Non-claims

本刀 ≠ API 统一错误信封全面改造（仅 turn 面如实登记+前端分码映射；全 API 面信封统一=登记后继）≠ 接地闸/factuality 强度变更 ≠ 扣费/退费协议变更（release 全部复用既有函数既有语义）≠「提交必成功」「导出必成功」类承诺 ≠ 401 重登后作答现场保留承诺（回登录页→回列表，不做跨登录内容恢复）· `quiz_unavailable`/`diagnosis_unavailable` 终态事件 ≠ 具体失败原因披露（reason 码面向 job last_error 诊断面，前端文案仍分码中性）· 410 引常量=文案单源复用 ≠ 新语义 · 「失败退额」=预留全退（releaseConsumption 既有语义）≠ 现金退款承诺 ≠ 账本外的补偿 · prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

---

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。**待双审裁定项**：①W1① 映射函数落点形制 A/B（本席推荐 A：不搅四页 proof 断言面）；②W1⑤ voice 邻面 :196 收编/剔除（本席推荐收编：同文件同形死读数·体量近零）；③W2① 空题 throw 落点（deliver 事务内 confirm 前 vs invoke 后提前 throw——二择一，硬约束=必在 confirm 之前·本席推荐事务内：与「结算/状态机都校验返回值」既有注记同段可读）。**同文件排程注记**：InterviewPanel.tsx 与 G3（W4 进度徽标）/G2（横幅 :544/:552）三刀并发——行号以 EXEC 时实树重 pin 为准（照例·G3 rev2 已裁定形制 A 触同文件）。任何越 §2 非范围冲动=停手上报，不借机修。**rev2 三裁定落卷（全批·待双审项全部闭合）**：①W1① 形制 A **批准**（附席1 异形分层注记：`turnSubmitFeedback` `{text,action}` vs `ActionErrorMessage` `{text,href,note}` 属有意分层·EXEC 证明按 §4 判据单源断言——细则见 §1 W1 rev2 注记）；②W1⑤ voice :196 **收编批准**（同形死读数·撤除零行为变化·C3 转确定项·§5「不收编则」活口闭合）；③W2① throw 落点=**quiz 事务内 confirm 前（:48 后 :50 前）·diagnosis 对称位（:50 后 :53 事务开前）**·与「结算/状态机都校验返回值」注记同段可读·facts 拦截照 §1③ 原案（binding 后 dispatch 前）——细则见 §1 W2 rev2 注记。

---

*G4 FAILURE-PATH EXEC REQUEST · 2026-10-10 · draft:awaiting_pre_exec_dual · base 主线 `feat/mysql-schema-skeleton` @`9cac8778` · 分支 `line/g4-failure-path`（工作树 `meetwise-g4`）· 依据=batch-residual-plan.md G4 行（:89）+ 更正版 issues-master :228/:286 亲读 + 实树 @9cac8778 全锚亲证 · pins 十一值零翻转 · est live=0 · Dual PASS ≠ 开工 · Ban self-approve · ⛔push*

**draft_rev2:pre_exec_dual**（席1 PASS+席2 FAIL 窄面处方 10 条落卷·三裁定全批·待复审确认后协调方行使 EXEC 授权）

**executed:awaiting_post_prove_dual**（G4 EXEC 落卷 2026-10-10 · 协调方授权后 EXEC 依 rev2 §1 修法口径+§5 Ban 全兑现零漂改：W1=#59 分码映射裁定①形制 A（新 sibling apps/web/lib/errors/turn-submit-error.ts 纯函数·{text,action} 异形分层）+裁定② voice 臂收编（实树 :202·既有 403 分码分支零改）+裸透传撤除（提交臂 :256 接线 turnSubmitFeedback·:258-:259 action 薄执行·j?.message 全文件零残留）+action-error.ts 常量补 export（实树 :47·值零改·410 同一性走 import 单源断言 PASS）/ W2=#209 空结果失败退额裁定③落点全中：quiz 事务内 confirm 前（实树 :56 throw 'quiz_empty_questions'·confirm :57）+diagnosis 对称位（实树 :58 throw 'diagnosis_no_grounded_finding'·事务开 :60 前）+facts 空前置拦截 binding 后 dispatch 前（quiz :42 'quiz_empty_facts'/diagnosis :48 'diagnosis_empty_facts'）→ 消费者既有 catch 三件套收口（release 全退·partial 弃用·commerce.ts 全文件 0 行 diff）/ 断言落槽 §4.2/§4.3 rev2 形：web-logic.proof 新 section 11 断言（纯函数输出 401/409×2/410/503 同文/兜底 + 静态接线 read-file 四件 + 无 DOM 载体记账）·worker 隔离环新 section 滤后路径分支鉴别子（scripted 全幻觉 refs:['Go']→图 validate 滤空→last_error==='quiz_empty_questions'/'diagnosis_no_grounded_finding' 非生成器闸 empty_quiz/empty_diagnosis）+等效观测（units 不变+consumption status='released'）+facts 拦截 dispatch 零发生（ai_invocation_trace=0）· 门禁亲跑 EXIT 原值全绿：web typecheck 0·web prove 0（309/0=基线 298+新增 11·既有断言零删改）·quiz:prove 0（31/0=23+8）·diagnosis:prove 0（43/0=35+8）·neg:interview 0（97/97 原值）/ rebase 主线 af13c627 零冲突·锚点重 pin 29 锚漂移表入收据（G3 刀 +4 行区与 W1 编辑区零重叠实证）·处方 10 条全兑现·**勘误之勘误⑤ EXEC 终验成立**（interview.service.ts 9cac8778→af13c627 零 diff·:325 即 interview_not_active 判定行·rev2 勘误⑤系过度勘误如实入账）/ attempts 全账（web 2: 首跑 1 红=本刀新注释含 token 字面自陷静态接线②·改注释措辞即绿；quiz runner 3: #1 红=夹具未带 typed reference 触 0061 trigger parent_mismatch、#2 红=夹具联系行被 stripPii 掩 '@' 致 facts 非空（tsx 探针实证 phone-only 行 facts=0）·产品码面零红、#3 绿；diagnosis 1: 首跑即绿 43/0；neg 1: 首跑即绿）/ 收据 ai-docs/delivery/receipts/g4-failure-path/（exec-receipt.md+5 份隔离 runner 回执 JSON 含 2 红存照）· markers=0 · est live=0 · pins 十一值零翻转 · 零迁移 · 零 secrets · #232/#254/#257 归 G2 零触 · ⛔push · alone≠dual）

---

## nail 落卷（2026-10-10 · post-prove 双席 BOTH PASS）

**双审结果**：席1（扣费诚实/映射语义）+席2（用户旅程/回归）互盲复核 BOTH PASS。W2 扣费诚实全链亲读（throw 落点事务内 confirm 前·asPrincipal ROLLBACK+rethrow 全回滚·消费者既有三件套零改收口·0157 payerRouted 企业行 applyAllocationDelta 全退·commerce/interview-service 零 diff）·分支鉴别子构造真实（2 非空幻觉 items 物理绕开生成器闸·负向守卫 !includes('empty_quiz')·空 refs=声明维度合法豁免面滤不掉构造要点）·W1 映射面全分码（401/409×2/410 import 单源/503/兜底）+voice :202 收编+j?.message 全文件零残留·四门禁双席独立复跑（web 309/quiz 31/diagnosis 43/neg 97）·既有面零删改（G2 横幅/G3 徽标/ERRMSG-MAP/_action-error export 零翻）。merge 落主线 @891f8c37。

**如实记账**：EXEC 断言拆分计数误（quiz 实 22+9 非 23+8·diagnosis 实 33+10 非 35+8·总数正确非掩蔽·双席各自独立复核后继项）·任务书引文行漂已附漂移表·勘误之勘误⑤ 终验成立（rev2 过度勘误如实入账）。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·merge 落主线 @891f8c37·#59 错误分码+#209 空题退额正式解除·扣费诚实面收口·批1 残 3→1（#255🔒EVIDENCE 管道+#232 尾面已随 G2/G4 收）·markers=0·est live=0）。
