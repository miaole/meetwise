# QBANK-PLANNER-HONESTY REQUEST（押题→planner 内容传递 + planner 输出上限/相关性 + 岗位叶子相关性 · #200/#201/#270 · M 体量）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：#批3 残余组 QBANK-PLANNER-HONESTY REQUEST 起草席（北星 loop · AI 质量面 H7 挂账收编 · planner 诚实性域 · M 体量）。
**基线**：`feat/mysql-schema-skeleton` @ `8231b05c`（主线最新 tip·`git log -1` 实测 2026-10-11·merge(h2-qbank-corpus) 题库语料六项修法 nail）。分支 `line/qbank-planner-honesty`·工作树 `meetwise-qp`（`git worktree add ../meetwise-qp -b line/qbank-planner-honesty` 本起草席已立·建前 worktree list 实查不存在）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 三件（#270=:352/#200=:436/#201=:475·原文+证据列+修法列逐字誊录见 §0.1/§1·+#232=:308 可并判读）②LEDGER `product-campaign-LEDGER.md` :247 事件2 裁定逐字（「**#200/#201/#213 盘点定案**：三件全未解决。**#213 即时立项**（`line/diag-honesty`…）；**#200/#201 待 H2 EXEC 落线后立项**（同文件相邻）；**#232 可并 #200、#270 可并 #201**（issues-master :436/:475/:478 三行亲读…）」——H2 已落线（`8231b05c`）·立项前置条件已满足·#213 已由 diag-honesty 刀收编 nail（`83a940c7`）·本刀收余下 #200/#201 及随并 #270/#232 判读面）③H7 挂账行（batch-residual-plan :102 转引 h2 卷 :7 原文「#200/#201/#202/#213 为 AI 质量面·建议 H2/H4 立项时顺手收编」·h2 卷 :123「#200/#201/#213 仍挂账」余二条即本刀）④形制沿 `i3-job-mgmt-REQUEST.md`（meetwise-i3 树 @`0f2ff494`·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `8231b05c`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（强制项·双对表）

- `rg -l "qbank-planner|planner-honesty|#200|#201" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `8231b05c` 实跑）→ 命中 **8 文件**，逐条判定：
  - **命名三撞车（非立项）**：`h2-qbank-corpus-REQUEST.md:64`/`r4-real-wire-impl.md:47`/`r4-p-planner.md:61,:132`——均为 worker helper **文件名** `qbank-planner-retrieval-plan.ts` 子串撞车（H2/R4 既有检索面物·与本刀立项名 qbank-planner-**honesty** 无关）。
  - **数字命中全为挂账/归后刀注记（指向本刀时点·非竞争卷）**：`diag-honesty-REQUEST.md:92`（「#200/#201 仍挂账…不进本刀」）/:127（footer 不并注记）；`h2-qbank-corpus-REQUEST.md:7,:123`（「#200/#201/#213 仍挂账」「待 H2 EXEC 落线后立项」——本刀即其后继）；`g2-report-page-REQUEST.md:39,:75,:87,:93`（#200「各归域刀零触」+uc025「#200 产品面浮出·归域刀」在案）；`h4-weakness-REQUEST.md:18,:71,:90,:91,:96,:104`（#200「归后刀」+#201「本刀只做专项面预算，不做通用 planner 上限·Ban 通用 planner 上限（#201 归后刀）」——本刀即该后刀）；`product-campaign-LEDGER.md:59,:247`（事件2 裁定=本刀授权令）；`TASK-SOP-v2.md:64`（批表行「各归域」）。
  - `execution-master-checklist.md`：`grep -c "qbank-planner\|planner-honesty"` = **0**（exit=1 实测）·数字命中零条。
  - harness/ **无同名卷** `qbank-planner-honesty-REQUEST.md`（ls 全表实测）。→ **停止条件未触发·可建树落卷**。
- 并发预警照 i2-b 卷 :137 同域排程注记形：I3 JOB-MGMT（meetwise-i3·#197 岗位输入进 planner）与本刀 #200-A 同触 interview-consumer/planCompetencies 邻域——详见 §4。

### 0.1 盘点总表（三件+可并判读一件·逐件已解决?/归槽判定·对勘=LEDGER :247 事件2 裁定）

| 件 | issues-master | 已解决? | 实树判定锚（`8231b05c` 实测） | 归槽 |
|---|---|---|---|---|
| #200 | :436 P3 产品偏差「quiz-id 只是 begin 的闸门：Web 从不发该头，sourceQuizId 不落 interview 表，worker 不读押题内容，“押题→面试”没有内容传递」 | **开放**（H2 落线后复测：供给面零变·详见 §0.3） | web 零发头（`interviews/actions.ts:43-45` 仅 resume-id/target-role·`:97-98` focus 变体·全仓 web 零 quiz-id 头）；`source_quiz_id` 全仓 rg **零命中**（service 仅参数用不落表）；worker interview 链零读 `resume_quiz`（仅 quiz-consumer/quiz-lifecycle 生成生命周期面） | **本刀收** |
| #201 | :475 P3 AI能力缺口「planner 输出无条数/长度上限与相关性校验（“3–5 个”只在 prompt），能力名原样拼进 grounded 模板题面」 | **开放** | `adaptive-interview-service.ts:215` schema `z.array(z.string().min(1)).min(1)` 无 max；`:216` businessValidate 仅 empty_plan；`prompts.ts:84` 「提炼 3–5 个」仅 prompt；能力名原样拼面=`prompts.ts:113`（`目标能力:${competency}`）+`:296-297`（grounded 模板）+`:172`（scenario 降级模板）；默认集降级 `:222` | **本刀收** |
| #270 | :352 P2 AI能力缺口「候选人路由静默误判：backend/general 与唯一另一叶并存时直接取该叶，后端简历只因提到“自动化测试”就被静默分到 qa/quality_engineering 题库…不报 409」 | **开放**（#133 rev3 v3 已改面·#270 增量面未落·详见 §0.5） | `candidate-profile-route.ts:74`（qa 表含「自动化测试」泛词）/:77（ai_ml 表）/:138（specific 过滤）/:46-47（「general+唯一 specific 叶 → 取 specific 叶」v3 规则=误判路径本体）；`candidate-route.ts:56-68`（读简历→classify 接线） | **本刀收**（LEDGER :247 裁定并 #201·同域=能力与岗位叶子相关性） |
| #232（可并判读） | :308 P2「押题/诊断 begin 只判 402…押题列表只显示 id 前 12 位；“用这些题去模拟面试 →”不带题」 | **大部落** | begin 非 402 已修（`quiz/actions.ts:18-24` rev2 E2 形「begin 非 2xx…必须回列表带错——禁止带着未预留的空壳进会话页」亲证）；列表投影已落（G2 卷 footer「#232=quiz.service list 扩投影双 LEFT JOIN…P2 全落」nail 记）；残面「不带题」= **#200 本体** | 随 **#200** 裁（LEDGER :247「可并 #200」·修法 A 落地即兑现残面·零独立触） |

**归槽结论**：本刀收编恰 **3 件 = #200/#201/#270**（+ #232 残面随 #200 修法 A 兑现·不作独立件）。三件同属「planner 诚实性」域：#201=planner 输出上限/相关性校验、#270=能力与岗位叶子相关性（LEDGER 裁定并 #201）、#200=押题内容真进 planner（宣称与实现对齐）——共享确定性构件面（relevanceScore/weaknessMatches/保序去重·见 §0.4）。

### 0.2 漂移登记（前置盘点锚 @`899cab1a` vs `8231b05c` 实测·H2-QBANK-CORPUS 落线为主因）

H2 触面清单（`git show 8231b05c --stat` 亲证）：`adaptive-interview-service.ts` ±58 行·`interview-consumer.ts` ±18 行·`routing/candidate-route.ts` ±15 行·迁移 0162/0163·db qbank 族新增。merge 冲突清单亲证 **web/api begin 链零触**（冲突仅 interview-consumer :184 邻域+package.json 异区）。

| 前置锚（899cab1a） | 现锚（8231b05c 实测） |
|---|---|
| `adaptive-interview-service.ts:177` schema min(1) 无 max | `:215`（H2 检索段扩形 +38 行·schema 本体零变） |
| `prompts.ts:72` 「3–5 个」 | `:84`（H2/diag 邻域漂移·文案零变） |
| 能力名原样拼题面 `:101` | 多面：`prompts.ts:113` + `adaptive-interview-service.ts:296-297`（grounded/无授权两模板）+ `:172`（scenario 降级模板） |
| relevanceScore `:94-106` | `:95-106`（漂 1 行·函数体零变） |
| weaknessMatches 阈值 0.5 | `:234-244`（`WEAKNESS_MATCH_THRESHOLD=0.5` `:237`·H4 导出形） |
| 同名去重 domain `:166-168` | `packages/domain/src/adaptive-interview.ts:167-169`（toCompetencySpecs 保序去重 Set 形·E6 修先例） |
| `actions.ts:43-45` web 零发头 | **同位零漂**（H2 零触 web） |
| `interview.controller.ts:25/27` quiz-id 头 | `:21-22`（GAP-UC025-NEG-01 注记）/:29（`@Headers('quiz-id')`） |
| `interview.service.ts:165-230` | `:128-155`（GODFN-1c 三守卫合并单查形·抛序等价 prove 在案）/:374-382（begin wrapper） |
| worker 检索段 | `interview-consumer.ts:278-288`（H2 #202 收编：routeSnapForRetrieve 双轨读源·检索门语义零弱化）——**quiz-id 供给面零变**（job payload 零 quizId 键·§0.3） |
| 迁移「0165 起号」预期 | **主线链下一号实测=0164**（`ls packages/db/migrations` 最新=0163 H2·无 0164 在树·0160 双号预存先例=SOP 先登记者为准）——预期与实测差一位照实登记；本刀默认零迁移（§3-7）·此锚仅 EXEC 若裁迁移时对表起号 |

**重 pin 免责**：本节锚为起草席 base `8231b05c` 一次性亲读；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论；i3 卷 §0.2 同款先例。

### 0.3 #200 实锚（押题→面试零内容传递·H2 落线后复测完成）

- **web 零发头**：`interviews/actions.ts:43-45` begin headers 仅 `{ 'resume-id': resumeId }` + 非空才增 `target-role`（:44 注记「空串不发头=现状字节,#259」）；`:97-98` focus 变体仅 resume-id+focus。全 web 无任何 quiz-id 头（#200 证据列「apps/web/app/interviews/actions.ts:17」旧锚·现 :6 注记同述「POST /interview 创建 → /begin(resume-id 头,可选 target-role 头)启动」）。
- **API 闸门已备（非缺口）**：`interview.controller.ts:21-22` 注记「可选 header quiz-id 携带源押题工件(GAP-UC025-NEG-01 真接线):真收真透传,由 service owner-scoped 消费；不带 quiz-id → 与今日行为完全一致」+ `:29` `@Headers('quiz-id') quizId?`；`interview.service.ts:374-382` begin wrapper asPrincipal owner 透传 sourceQuizId；`:130-155` 守卫块（GODFN-1c 三刀归一单查形）：owner-scoped `SELECT … FROM resume_quiz q … WHERE q.id=$1 AND q.owner_user_id=$2`（`:134-140`·quizScope=buildRequiredOwnerFilter `:127`）·抛序 404 `not_found_or_forbidden`（`:141-142`）→ stale_quiz 409（`:149-151`）→ missing_quiz_expiry（`:153` 起）→ resume_version_mismatch——**owner 范围校验负测锚在此**。
- **三零仍在（缺陷本体）**：①`source_quiz_id` 全仓 rg 零命中——不落 interview 表（守卫消费后即弃）；②job payload 零 quizId 键（`interview-consumer.ts` payload 读面仅 requestId/resumeId/targetRole `:391`/focus `:398` 标量）——worker 收不到押题标识；③worker interview 链零读 `resume_quiz`（rg 亲证：仅 `quiz-consumer.ts:56,:83`/`quiz-lifecycle.ts:30,:65` 生成生命周期面）——**planner 不读押题内容**。
- **文案暗示面**：`QuizPanel.tsx:125` `<Link href="/interviews">用这些题去模拟面试 →</Link>`——链接不带任何 quiz 标识（#232 证据列旧锚 :124 现 :125 漂 1 行）。
- **修法 A 读面已备（零迁移）**：`resume_quiz.questions` 列已在（`quiz-lifecycle.ts:65` `UPDATE resume_quiz SET status='ready', questions=$3…` 写面·表链 0008/0135/0061/0062）；begin 块 `:130-155` 已有同表 owner-scoped SELECT 形先例。
- **H2 落线复测结论**：H2 动的是 worker 检索段（题库语料·qbank_* 族）与 candidate-route 读源，begin 闸门/web 供给/payload 形零触——#200 三零面**零漂移·缺陷本体仍准**。

### 0.4 #201 实锚（planner 输出无上限/无相关性校验）

- **schema 无上限**：`adaptive-interview-service.ts:211-225` planCompetencies——`:215` `schema: z.object({ competencies: z.array(z.string().min(1)).min(1) })`（**min(1) 无 max**·单名亦无长度上限）；`:216` `businessValidate: (v) => (v.competencies.length === 0 ? 'empty_plan' : null)`（唯一校验=空拒）。
- **「3–5 个」只在 prompt**：`prompts.ts:84` planner system「提炼 3–5 个本场要考察的技术能力」——软约束零硬闸。
- **能力名原样拼题面**：`prompts.ts:113` interviewer user base `目标能力:${String(v.competency ?? '')}`；`adaptive-interview-service.ts:296-297` grounded 模板「请结合你简历中一段与「${competency}」相关的真实经历…」/:172 scenario 降级模板同形——**离题/越界能力名直通题面零校验**。
- **默认集兜底先例（验收锚）**：`:221-222` 注记+实现「优雅降级:规划失败 → 用默认能力集,面试仍可开(不因规划抖动整场开不了)」——`const names = 'error' in out ? ['项目经验', '技术深度', '问题解决'] : out.value.competencies;`。
- **可复用确定性构件（修法形制先例·禁 embedding 同源纪律）**：`relevanceScore :95-106`（词元+CJK bigram 纯函数·:232 注记「A-3 生产在用」）；`WEAKNESS_MATCH_THRESHOLD = 0.5 :237` + `weaknessMatches :239-244`（双向取最大≥阈值）；`buildCragPlannerQuery :157-159`（competency 进 CRAG 查询面）；同名保序去重先例=`domain adaptive-interview.ts:167-169`。

### 0.5 #270 实锚（岗位叶子相关性·general+唯一叶静默取叶）

- **规则本体已 v3（#133 rev3 落面·非缺口）**：`candidate-profile-route.ts:6`（「0 次模型外发」）/:15-16/:32/:46-47（「general 结构上不产生歧义：单独命中 → decided backend/general；general+唯一 specific 叶 → 取 specific 叶」）/:128-129/:138（`specific = hits.filter(l => l !== 'backend/general')`）——v3 降级臂=0 叶或 ≥2 specific → backend/general 兜底。
- **#270 增量面=泛词直计叶**：`:74` `'qa/quality_engineering': ['qa', '质量工程', '自动化测试', 'sdet', '测试开发', '测试工程师', '软件测试']`——「自动化测试」泛词命中即计 qa 叶；`:77` ai_ml 表同形。后端简历含「自动化测试」时：backend/general + qa（唯一 specific）并存 → v3 规则**取 qa 叶**（:46-47 语义）→ 候选人被静默分入 qa 题库、无 409 无感知——**即 #270 原文路径·修法列「qa/ai_ml 泛词需上下文才计叶；general+单叶时若该叶为 qa/ai_ml 需更强证据」所向**。
- **上下文化 token 形制先例已在**：`:48` 注记「裸 go/裸 测试/裸 算法 移除，上下文化 token 接管同叶」——同形扩 qa/ai_ml 泛词为 EXEC 实施面。
- **接线锚**：`candidate-route.ts:56-68`（content_sha SELECT → decrypt → `classifyCandidateProfileByRule` → decisionHash 落库）·H2 触本文件 ±15 行为检索双轨读源（`getInterviewRouteSnapshotForAdaptiveRole`·0163 FK 使能）·classify 规则本体零触。
- **展示面随 #259 已备**：#259 target-role 头链已落（`actions.ts:44`）·#270 修法列「面试页展示“本场按 X 方向出题，可修改”（随 #259）」= 纯读 leafTrackId 渲染面（是否本刀入=裁决项④）。
- **回归样本口径**（issues-master :352 备注原话）：「路由回归样本集用合成简历即可，不走 D13 式标注同意流程」。

## §1 修法（定刀界=**一张卷收编三件**·三触面簇·修法列逐字固化·file:line 实锚·EXEC 立项重 pin）

**定刀界裁决**：分裂触发条件（「#200 修法 A 需迁移 + B 纯前端分裂触面」）**不成立**——修法 A 零迁移（questions 列已在·controller 头已在·service 守卫已在·只差 payload 扩一标量+worker 读形）；A/B 为修法列「要么…要么…」**替代项非叠加项**。三件同域一张卷（§0.1 归槽结论）·#232 残面随 #200 零独立触。

### ① 押题内容真进 planner 面（#200 修法列逐字：「要么把押题题目作为 planner 输入，要么改文案不再暗示关联」·#232 残面随此兑现）

- **A 路（推荐）=题面作 planner 输入·零迁移四段接线**：⑴ web 发头：`interviews/actions.ts:43-45` 形补 quiz-id（非空才发·沿 target-role 「空串不发头=现状字节」同纪律；QuizPanel `:125` 入口带 quiz 标识进 /interviews 的传递形=裁决项⑤）→ ⑵ payload 扩标量：`interview.service.ts` startPayload 增 `sourceQuizId`（`:267` enqueueInterviewJob·沿 payload->>'targetRole' `:391`/focus `:398` 标量同形先例·零新表零新列）→ ⑶ worker owner-scoped 读题面：interview-consumer 沿 begin 块 `:134-140` 同表 SELECT 形读 `resume_quiz.questions`（asPrincipal owner 闭包·RLS 承重）→ ⑷ 喂 planner：`planCompetencies :211` 输入组装补押题题面段（prompt data 面·buildData 回退纪律沿 focus v3 先例「对缺省逐字节回退 v2 输出」·组装形=裁决项⑥）。
- **B 路（A 裁不可行时兜底）=文案如实化**：`QuizPanel.tsx:125` 「用这些题去模拟面试 →」删暗示或改如实表述（值=裁决项⑦）——纯前端 5E 级零迁移。
- **A/B 不并做**（修法列原意）·方向=裁决项①。**禁保留无兑现源宣称**（沿 i3 卷 §1-③ 同纪律：A 落地则宣称兑现；B 裁则暗示消除）。
- **Ban 内禀**：begin 守卫抛序与错误码字节零改（`:130-155` GODFN-1c 归一形只作回归·§5）；不带 quiz-id 行为逐字节不变（payload 零新键·守卫块跳过 `:128-129` rag C-6 原语义）。

### ② planner 输出上限/相关性面（#201 修法列逐字：「schema 限 3–5 个、长度上限、与岗位叶子相关性校验」）

- **schema 硬闸**：`:215` `.min(1)` → 限 3–5（`.min(3).max(5)`·值=裁决项②·与 prompt `:84` 「3–5 个」对齐）；单名长度上限（`AskSchema :22` `q.max(2000)` 封顶同形先例·值随裁决项②）。
- **相关性校验**：`:216` businessValidate 扩——能力名与岗位叶子相关性判定（叶子源=路由快照 allocations leafTrackId·`interview-consumer.ts:380` primary 形同源）；**确定性形制复用 §0.4 构件先例**（relevanceScore 词元+CJK bigram/weaknessMatches 阈值形·同文件先例零新依赖）·**禁 embedding/向量召回**（`:232-234` memory lean MVP 注记同源纪律）。
- **兜底纪律（闸门不毁可用性）**：校验拒 → 沿 `:221-222` 优雅降级先例（重试有界→默认集 `['项目经验','技术深度','问题解决']`·面试仍开）——**校验面绝不演变为整场开不了的硬拒**（Ban 见 §5）。

### ③ 岗位叶子相关性面（#270 修法列逐字：「与 #133 同 PR：qa/ai_ml 泛词需上下文才计叶；general+单叶时若该叶为 qa/ai_ml 需更强证据；补回归样本；面试页展示“本场按 X 方向出题，可修改”（随 #259）」·LEDGER :247 裁定并 #201）

- **范围如实注记**：修法列首句「与 #133 同 PR」为审计时点形——#133 rev3 v3 已落主线（§0.5·泛词降级桶/歧义未决臂/`specific` 过滤已在）；本刀收 **#270 增量面**=①qa/ai_ml 泛词上下文化（`:74`/`:77` 表内泛词如「自动化测试」改上下文化 token·沿 `:48` 「裸词移除，上下文化 token 接管同叶」既有形制）②general+单叶且该叶为 qa/ai_ml 的更强证据闸（阈值/证据形=裁决项③）③回归合成简历样本集（§0.5 口径）④展示面（是否本刀入=裁决项④·纯读渲染零新依赖）。
- **确定性铁律**：规则面保持「0 次模型外发」（`:6`）·同输入同决策（C-HA-2）·决策行 hash 链零改（`candidate-route.ts:61-67`）。
- **Ban 内禀**：#133 sticky/409 防御面零触（`:6` 注记「409 防御面保留」）·v3 降级臂语义零弱化（泛词收紧只减误判·不破 0 叶/≥2 叶兜底）。

## §2 验收断言候选（prove/neg 形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **#201 schema 闸断言**：mock 模型输出 6+ 个/单名越限长/空集 → schema/businessValidate 拒面断言；拒后重试→默认集 `:222` 兜底·**面试仍开**断言（构造越界输出·全 mock 不实调 LLM）。
2. **#201 相关性断言**：岗位叶子域外离题能力名被拒/过滤断言（确定性构件同源 prove·阈值与叶子域注入可 gate）；域内能力名零误伤断言（正臂）。
3. **#200-A 接线断言**：带 quiz-id begin → payload 含 sourceQuizId 标量 → worker owner-scoped 读到 `resume_quiz.questions` 题面 → planner 输入组装产物含题面段断言（mock·断言输入组装产物非模型输出）；QuizPanel 入口→头透传链静态源断言（沿 `apps/web` prove 静态先例）。
4. **#200 不带头回归断言（逐字节）**：不带 quiz-id begin → payload 零新键+守卫块跳过+行为与现状一致断言（沿 `:128-129` rag C-6 原语义·prove:begin-guard-merge 抛序等价+计数断言 EXIT 原值）。
5. **#200 owner 范围负测**：他主 quiz-id → 404 `not_found_or_forbidden`（`:141-142`）；stale/未 ready → 409 `stale_quiz`；过期 → stale_quiz（NULL≠过期 C-1 窄保留原语义）——抛序逐字节原值（`neg:interview` 既有断言基线原值·H2 并后复验口径 EXIT=0 102 PASS 为准）。
6. **#270 回归样本断言**：「后端开发 Redis MySQL 自动化测试」类合成简历 → 修法后判定断言（更强证据闸行为随裁决项③·弱证据不静默计 qa/ai_ml 叶）+ 既有 v3 规则回归样本集全绿 EXIT 原值（0 叶/≥2 叶降级臂/语言叶优先序零翻）。
7. **#270 展示面断言（若裁决项④裁入）**：面试页「本场按 X 方向出题，可修改」静态源断言+leafTrackId 读面零回归（#259 target-role 面零触）。
8. **回归面随改随核**：`neg:interview` + worker/ai-runtime/domain 既有 prove 全 EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）；H2 已落面（qbank-corpus:prove 51 PASS/qbank-corpus-retrieve:prove 37 PASS 并后复验口径）零翻零触。
9. markers=0（§7）+ est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **#232 零独立触**：begin 非 402 处理（quiz/actions.ts rev2 E2 已落）与列表投影（G2 nail 已落）均非本刀面；残面「不带题」随 #200 修法兑现·不另立验收项（诊断 actions 同形面若双审判残留·登记后刀不顺手）。
2. **H2 已落六项零触**：qbank-corpus 六修法面（0162 served-ref 表/0163 FK 双轨使能/检索过滤/难度谓词/近重复/seed 扩形）与检索门语义（route_snapshot_missing→deny_external 永不 unscoped·`:278-288`）语义字节零动——只作回归面（§2-8）。
3. **E2E 场景归矩阵刀**：零新增 Playwright 场景（本刀 prove 只认 api/worker/domain prove+web 静态先例形制）；uc025 LIVE 套件零触（G7 面 Ban）。
4. **押题生成链零触**：quiz-consumer/quiz-lifecycle 生成语义零动（本刀只 owner-scoped 读 questions 不改生成/过期/生命周期面）。
5. **#259 target-role 面/#133 v3 本体零触**：target-role 头链（actions.ts:44）与 v3 已落规则（降级臂/语言叶优先序/specific 过滤）语义零改——#270 只做增量面（§1-③）。
6. **embedding/向量召回禁入**：相关性校验走确定性构件先例（§0.4·memory lean MVP 注记同源）——任何向量依赖引入=越界。
7. **默认零迁移**：修法 A 已证零迁移（§1-①）·任何迁移冲动=停手上报回炉（Ban 迁移越权）；EXEC 若协调方裁需迁移则先对表起号（主线链下一号实测 0164·0160 双号预存·SOP 先登记者为准）。
8. **est live=0**：零模型真实外呼（断言全 mock/静态/纯函数·§6）·零生产操作·零 secrets。

## §4 依赖

**零未决硬闸**。①立项前置已满足：LEDGER :247 「#200/#201 待 H2 EXEC 落线后立项」——H2 已 nail 落主线（tip `8231b05c` 亲证·0162/0163 并链复验四键全绿在案）；②供给链构件全在：questions 列/quiz-id 头/begin owner 守卫/leafTrackId 快照/确定性构件先例（§0.3/§0.4 逐锚）；③#213 已由 diag-honesty 刀收编 nail（`83a940c7`）·H7 挂账四件余 #200/#201 即本刀（#202 已随 H2）。**并发面**：I3 JOB-MGMT（meetwise-i3·#197「岗位输入进 planner」）与本刀同触 interview-consumer/planCompetencies 输入组装邻域——若并发派程照 i2-b 卷 :137 同域排程注记与 G4 例登记零重叠（I3=岗位侧输入·本刀=押题侧输入+上限/相关性·行号以 EXEC 时实树重 pin 为准）。

## §5 Ban 列表 + pins（沿 i3 卷 §5 同源·逐字誊 + 本刀面增补）

**Ban 列表**（i3 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀默认零迁移·§3-7·迁移冲动=停手上报）；Ban 触其他工作树；Ban 伪造已问/已验来源（零机制现状不假称既有）；**本刀增补**：Ban 触 H2 已落面与检索门语义（qbank-corpus 六项/0162/0163/route_snapshot_missing→deny_external·§3-2 零回归触）；Ban 改 begin 守卫抛序与错误码字节（GODFN-1c `:130-155` 归一形·只作回归·§2-5）；Ban 不带头行为漂移（不带 quiz-id 逐字节不变·§2-4）；Ban 硬删能力（相关性校验拒→有界重试→默认集兜底·面试仍开——校验面不得演变为整场开不了的硬拒·§1-②）；Ban planner 面伪造押题输入（quiz 题面供给须真实接线·禁 mock 数据进生产路径）；Ban 保留无兑现源宣称（「用这些题去模拟面试」与实现须对齐·§1-①）；Ban embedding/向量召回进相关性校验（确定性构件·§3-6）；Ban 触押题生成链（quiz-consumer/quiz-lifecycle·§3-4）；Ban 无界重试（校验拒重试有界可计数）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 mock·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①#201 闸断言=构造越界输出 mock 断言（§2-1/2·不实调 LLM）②#200-A 接线断言=输入组装产物+静态源断言（§2-3）③#270=合成简历纯函数 prove（0 次模型外发规则面·§2-6）④守卫负测=既有 neg 断言原值复跑（§2-4/5）。prove 全 mock/静态/纯函数·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/qbank-planner-honesty-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 i3/diag 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①#200 方向 A vs B（推荐 A=题面作 planner 输入·零迁移·B=文案如实化为 A 裁不可行时兜底·A/B 不并做）；②#201 上限值（schema min/max 与单名长度上限具体值·推荐 min(3).max(5) 与 prompt「3–5 个」对齐+长度封顶沿 AskSchema 形）；③#270 更强证据闸形（general+单叶为 qa/ai_ml 的证据阈值/上下文窗形·推荐沿上下文化 token 既有形制扩·保持 0 次模型外发）；④#270 展示面是否本刀入（推荐入·纯读 leafTrackId 渲染零新依赖·文案逐字值随裁）；⑤#200-A web 侧传递形（QuizPanel 入口→/interviews 带 quiz 标识→action 发头·query param vs 其他·推荐 query param 沿既有 error 传参形）；⑥押题题面进 planner 的组装形（prompt data 段形/缺省回退纪律沿 focus v3 先例·推荐 data 段+逐字节回退）；⑦B 路文案逐字值（若裁 B）。

---

*QBANK-PLANNER-HONESTY REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`8231b05c` · 分支 `line/qbank-planner-honesty` · 工作树 `meetwise-qp` · 蓝本=更正版 issues-master 三件（#270=:352/#200=:436/#201=:475 原文/证据列/修法列逐字+#232=:308 可并判读）+ LEDGER :247 事件2 裁定（#200/#201 待 H2 落线后立项·#270 并 #201·#232 可并 #200）+ H7 挂账行（h2 卷 :7/:123 转引）· 形制 i3-job-mgmt-REQUEST（meetwise-i3 树 @`0f2ff494`·Ban/pins 同源誊录）· 定刀界=一张卷收编三件（分裂触发条件不成立：修法 A 零迁移·A/B 为替代项）· H2 落线复测完成（三零面零漂移·供给面零变·漂移表 11 处登记）· 迁移起号预期勘误（「0165」预期 vs 主线链下一号实测 0164·照实登记·本刀默认零迁移）· 防重检查过（命名三撞车=qbank-planner-retrieval-plan.ts 文件名子串·数字命中全为挂账/归后刀注记·checklist 零命中·无同名卷）· #232 零独立触随 #200 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
