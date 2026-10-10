# REQUEST — **#204 GROWTH-GEN 成长链接通刀**（审计 P0 断链 · 报告成功→服务端自动产评估+学习计划+职业路径 · 前端只读 · docs-only 起草）

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（docs-only 起草 · Ban coding · Ban prove 执行 · Ban self-approve · alone ≠ dual · 不代签 peer）
**Line**: **GROWTH-GEN**（产品战役 LEDGER 批 1 · `product-campaign-LEDGER.md:29`「GROWTH-GEN 刀（服务端后台作业自动产评估+学习+职业路径·幂等）」· SOP W2 评分卡域队列「#204（服务端自动评估）」· 硬依赖 #40 已由 SCORE-WRITER S1 兑现大半）
**Base tip**: `3c3406bd`（`origin/feat/mysql-schema-skeleton` 2026-10-10 fetch 实测 · worktree `/Users/miaole/Desktop/golucky/meetwise-line-grow201` 分支 `line/growth-gen` · 本文全部 file:line 于本 worktree **亲读复核**）
**Author**: `mw-grow201-draft`（REQUEST 起草席 · 实现不自批）
**Date**: 2026-10-10
**依据**: ①`/Users/miaole/Documents/Meetwise产品审计-更正版/issues-master.md:145`（#204 审计原文）②`fix-roadmap.md:62,70`（批 1 修法+验收）③`product-campaign-LEDGER.md:29,91,105`（批 1 排期+新-#275 并入）④SCORE-WRITER S1 现状（`extrev-score-writer-REQUEST.md` S1 EXEC 登记节 + 主线 `interview.service.ts:413-424`/`score-writer.ts` 亲证已落）⑤S2 在飞交叠（`origin/line/extrev-score-writer` tip `8e9ee663`=S1 nail · S2 EXEC 在飞）

---

## §0 立靶（审计原文 + 主线现状对账 + S2 交叠声明 · 本席逐条亲验 @3c3406bd）

**审计原文**（issues-master 更正版 :145 · P0 · 产品偏差 · 已核实（全仓 grep）；「生产恒空」为推论未起服务）：

> 成长链（评估→学习计划→职业路径→成长曲线）的生成接口生产无人调用：Web 只发 GET，worker 不写 assessment_report；POST 自身又因无评分卡必返 409 no_scorable_cards。报告三区块、/growth、Dashboard 恒空，弱项偏置恒为 no-op。……修法：**报告生成成功后由服务端同一后台作业自动产出评估+学习计划+职业路径，前端只读**。

复核备注（同行）：「修 #40 后仍需单独接通 #204」——独立缺口，P0 保留（分报告 A 采纳）。

**现状对账（@3c3406bd 本 worktree 亲验 · 三段）**：

- **① 409 前提已解除大半（SCORE S1 已落主线亲证）**：`apps/api/src/modules/interview/interview.service.ts:413-424`（D2 `createScoreRequestForSubmission` 与 0092 账本同事务原子·亲读在主线）+ `apps/worker/src/score-writer.ts:60-105`（D4 写卡步 `writeScoreCardAfterProjection`·亲读）+ `apps/worker/test/interview.proof.ts:294`（卡数断言 `score_card 行数=已答（ledger 提交）题数`·29 断言 EXIT=0）——`origin/feat/mysql-schema-skeleton` 含 S1 nail `fe412948`（`git branch -r --contains` 亲证）。⇒ 有评分卡路径（0092 ledger 家族）上 `listScorableScoreCards` 非空，`interview-assessment.ts:27` 的 409 `no_scorable_cards` 不再必然触发。**诚实面**：明文 /turn 家族（图驱动主路径）0126 双写围栏下结构性零 score_request/零卡（interview.proof.ts:198-201 断言在卷·S1 收据声明「过渡形状非回归」）——该家族上自动评估同样空集跳过，**非本刀回归**（归 SCORE 域/0126 面，§7 Non-claims 登记）。
- **② 断链主体=触发链缺失（本席独立复证，与审计「已核实」一致）**：
  - **Web 只发 GET——grep 亲证**：三区块取数 `apps/web/app/report/[id]/page.tsx:227`（`serverGet('/interview/'+id+'/assessment')`）、`:260`（learning-plan）、`:300`（career-path）全部 serverGet；全 web POST 面 grep（auth-actions/settings/privacy/recruiter/resume/quiz/roles/speak-stream）**零** assessment/learning-plan/career-path POST 调用。
  - **worker 不写 assessment_report——全文亲读**：`apps/worker/src/report-worker.ts:53-59`（tx2 finalize）只做 `markReportReady`+`appendEvent('report_ready')`+`insertNotification` 三件事，零成长链写入；成功路径后即返回 `'ready'`。
  - **POST 端点齐备但无人触**：`interview.controller.ts:201-205,213-217,232-236` 三对 POST/GET 全在；`generateAssessmentFor`（interview-assessment.ts:18-47·fail-closed 409）零生产调用方。
  - **连锁恒空面逐点亲读**：三区块 `report/[id]/page.tsx:229`（`dims.length===0 → return null`——零数据即整段消失）、`/growth` 鼓励态 `growth/page.tsx:57-74`（`points.length<2` 恒走「再完成一场」占位·真数据源 `serverGet('/profile/growth')` → `profile.service.ts:62-76` 读 `assessment_report status='ready'` 恒零行）、Dashboard `dashboard/page.tsx:82-84`（`ov.avgScore==null → 「尚无评分」」空环·读面 `profile.service.ts:40` score_card 均分）、弱项偏置 no-op `packages/db/src/memory-store.ts:49-58`（`historicalWeakDimensions` 只读投影 assessment_report gap=true 维度——无行恒 `[]`）→ `apps/worker/src/adaptive-interview-service.ts:187-192`（`biasByPastWeakness` 空集→稳定分区恒等——机制在产但输入恒空）。
- **③ SCORE S2 在飞交叠声明（先刀·SOP 交叠规则）**：S2（读侧切换：`interview-assessment.ts:10,33-34` `deriveAssessment`→`deriveScoreCardAssessment`（`packages/domain/src/scoring-aggregation.ts:124-147`·亲读：无 gap/evidence/weaknesses 成员）+ rev2 D5 裁定「INSERT 前派生 gap/weaknesses+形状冻结 {dimension,score,gap,evidence}」+ 去 `interview.proof.ts:316` loadSummary 桩）EXEC 在飞于 `line/extrev-score-writer`（S1 nail `8e9ee663` 已在该分支·主线未含 S2——主线 `interview-assessment.ts:10` 仍 import `deriveAssessment` 亲证）。**本刀与 S2 在 `interview-assessment.ts` 交叠**：S2 切换**聚合器内核**（怎么算）；本刀接通**触发链**（谁调用）。划界与 rebase 义务见 §2 首条。

## §1 范围（建议切片 S1/S2 + #275 文案 + #187 裁定 · 设计点 D1-D3 待双审定值）

**目标**（roadmap:62 逐字）：「报告生成成功后由后台作业**服务端自动**产出评估 + 学习计划 + 职业路径（新 job 类型 + 幂等键，单独标 L）；前端只读」。验收锚（roadmap:70 + LEDGER:29）：**面完→三区块非空→/growth 出点**。

1. **S1 触发链主体：report-worker 成功钩子 → 依次生成评估→学习计划→职业路径**：
   - **挂点**：`drainReportsOnce` tx2 成功路径（report-worker.ts:53-59·`markReportReady` ok 且非 stale 之后）。钩子为**生产组合的默认依赖**（沿 `deps.loadSummary` 注入形制·report-worker.ts:13-25 先例），非可选开关——审计教训同源：「写了机制却无人调度」（report-worker.ts:1-5 文件头自认）。
   - **D1 触发形制（双审裁 A/B）**：**形 A（推荐·紧邻事务）**——tx2 提交后、同一 drain 内紧邻 1-3 个独立事务依次生成；幂等键=三表现有 `(owner_user_id, interview_id)` UNIQUE（`0001_baseline.sql:345,386,436` 亲读·upsert `version+1`，与 ai_report 幂等键（:237 `uq_report_interview`）同键域天然对齐——roadmap:71 风险注记「需与报告重试的幂等键对齐」由此兑现）；**失败不回滚报告**：任一段 catch→错误日志+计数（结构化计数器，供观测面），后续依赖段跳过（评估失败→学习/职业无源自然跳过），报告已 ready 状态不动——**「尽力而为」语义明示**：crash 窗口（tx2 提交后、生成完成前进程死）下三区块暂缺，无自动重试，POST 端点保留为手动补口；残留窗口如实登记收据。**形 B（roadmap 原文形·新 job 类型）**——growth job 行（新表或复用 job 面）report ready 时 enqueue、worker drain，at-least-once 重试语义强但加表/加 job 类型/加迁移。**推荐 A 起步**（简化优先：三 upsert 天然幂等已够；审计修法语「同一后台作业」在报告 drain 内即满足），B 为双审裁量升级项。
   - **D1 子点（时序竞态·双审裁）**：`report_ready` 事件在 tx2 内（report-worker.ts:56），形 A 生成在 tx2 后——SSE 客户端收到事件即 RSC 取数可能先于三表落库（ms 级窗口）→ 区块暂缺、刷新后可见（非死胡同·报告主体已在）。可接受则登记；不可接受则生成序置于 appendEvent 之前仍同 tx2（SAVEPOINT 隔离失败）——由双审裁。
   - **D2 生成逻辑复用形制（双审裁 a/b/c·推荐 a）**：worker **禁 import apps/api**（grep 亲证 `apps/worker/src` 零 apps/api 引用先例）。**(a) 共享单源（推荐）**：三段生成核心（读卡→derive→upsert）自 `interview-assessment.ts`/`interview-learning.ts`/`interview.service.ts` 提至共享层（建议 `@meetwise/db`，纯派生仍在 `@meetwise/domain` 不动），错误语义改 plain `{code}`；API 端点改薄委托，**HTTP 信封字节原样**（409 `no_scorable_cards`/409 `assessment_required`/404 `not_found`/409 `insufficient_evidence` 映射留在 API 侧）；worker 调同一函数——单源防两份 INSERT 漂移。**(b) worker 侧独立实现**（~30 行 SQL 复制）——拒：两份写入真相必漂移。**(c) API 面自触发**（报告完成回调进 API）——拒：违审计「服务端同一后台作业」且引入 API↔worker 反向耦合。**注意 (a) 迁 `interview-assessment.ts`/`interview-learning.ts` 与 SCORE S2 同文件 → 后落者 rebase（§2）**。
   - **D3 职业路径生成形制（P3 #187 简化裁定·本席裁定+双审可否决）**：worker 侧新代码走**单事务 upsert**（`deriveCareerPath` 纯函数（`packages/domain/src/career.ts:9-19`·零模型零 IO）+ `career_path` ON CONFLICT upsert——即审计 #187 建议形「可简化为单事务 upsert」），**不复制** API 侧 AiGraphRun 状态机（interview.service.ts:660-732·pre/begin/commitSuccess 最多 3 事务+advisory xact lock+租约·#187 亲读定谳「零模型纯函数包整套状态机=过度设计」）。**简化优先在新面兑现**：API 侧状态机本刀**零触**（对外契约冻结在案 interview.service.ts:661-664 注释；拆不拆归 5E 批量清理刀——审计修法「核心空缺（#204/#40）补齐前**不再加厚**」）。**观测面分叉如实登记**：`ai_graph_run(career-path)` 行仅在 API 路径产生，worker 自动路径不产生（该表为观测面非读面，`career_path` 表是唯一读真相）。若双审裁观测一致优先，则 worker 改复用 `runCareerPathGraph`+worker 侧 ledger 实现（career-path.ts:55-70·注入形已支持）——D3 终值归双审。
   - **生成序**：评估（`listScorableScoreCards`（`packages/db/src/scoring-aggregation.ts` 读面）→ derive → upsert `assessment_report` status='ready'）→ 学习计划（读评估 dimensions → `deriveLearningPlan`（learning.ts:8-18·gap 维度→items）→ upsert）→ 职业路径（读 overall+weaknesses → `deriveCareerPath` → upsert）。聚合器内核（derive 切换+gap 派生）**归 SCORE S2**——本刀复用其切换后产物，rebase 序内自动继承。
2. **S2（本刀）弱项偏置自动生效验证——可能零代码改动**：评估自动落库后 `historicalWeakDimensions`（memory-store.ts:49-58·只读投影）自动非空 → `pastWeakDimensions`（memory-service.ts:31-33）→ `biasByPastWeakness`（adaptive-interview-service.ts:187-192·弱项稳定前移）整链自动活。断链根因本就只是 assessment_report 无行——S1 落地即通，**prove 断言兑现（§4），无代码改动预期**；若 prove 暴露链路缺陷（如 owner 谓词错位）才最小修复并如实登记。
3. **新-#275 growth 文案修正**（LEDGER:105「随 #204 GROWTH-GEN 前端文案」）：`apps/web/app/growth/page.tsx:67`「完成模拟面试**并生成评估**,即可开始记录能力演进。」——「并生成评估」指向不存在的用户操作，改自动语义（如「完成模拟面试后，系统会自动生成评估并记录能力演进」）。一行文案，本刀唯一前端改动。
4. **P3 #187 简化裁定**（并入 D3，裁定=新面单事务 upsert+API 侧零触待 5E；见上）。

## §2 非范围（划界防双改/扩权 · 交叠归先刀）

- **SCORE S2 读侧切换归先刀 `line/extrev-score-writer`**（SOP 交叠规则：同 file 两刀并行，后落者 rebase + 互引先刀 commit；SCORE-WRITER×EVIDENCE-DELIVERY 于 interview-report.ts 已有先例条款）：S2 切 `interview-assessment.ts:10,24,27,33-34` 聚合器内核（deriveScoreCardAssessment+D5 gap/weaknesses 派生+形状冻结）+ 去 interview.proof.ts:316 loadSummary 桩。**本刀只接触发链/迁壳，不切内核；EXEC 期谁后落主线谁 rebase，共享函数签名变更须互引先刀 commit**。
- **前端只读零改**：三区块 RSC（report/[id]/page.tsx:226-335）、/growth（growth/page.tsx:39-74）、Dashboard 取数渲染零改动（除 §1.3 一行文案）；**不加「生成评估」按钮/客户端触发**（与审计修法「前端只读」相反）；SSE 面零触（`assessment_unavailable` 终态集等既有语义原样）。
- **#205/#206 弱项衰减/回灌归 WEAKNESS-LOOP 刀**（LEDGER:56·批 2·🔒#204）：`historicalWeakDimensions` 时间衰减/最近 N 场（#206）、学习计划回灌再练/专项面（#205/#252）、学习项「去练」交互（#214）——本刀只验证偏置**生效**，不改出题偏置逻辑本体（biasByPastWeakness 零触）。
- **#229 报告重试归另刀**（LEDGER:28·W2 队列内下一刀）：sweepReports/requeueFailedReport/quarantined 手动重试/频控/零扣费 proof——本刀尽力而为失败语义**不碰**报告重试机制（重试后报告再 ready 时钩子自然再跑·幂等键兜底零重复）。
- **零迁移**（形 A 下）：三表 UNIQUE 既有（0001:345,386,436）、幂等不需新列、零新表；**唯若双审裁形 B（新 job 类型）才需迁移（0155 起编号·expand-only·lock_timeout）**——形 B 与迁移方案一并归双审定值，未经裁定禁落迁移。
- **#40 E2E 归 SCORE 域**：interview.proof.ts:316 loadSummary 桩去留、明文 /turn 家族供卡（0126 面）、`#20` begin→完成→报告真实全链验收——均归 SCORE S2/S3 收口，本刀 prove 复用 ②b ledger 家族供卡形制、**不去桩不改 SCORE 域断言**。
- **弱项偏置出题逻辑本体零触**（adaptive-interview-service.ts planCompetencies/biasByPastWeakness 原样）；**memory 写面零触**（recordAskedQuestions 等原样）。
- **零 G7 面 · 零 SSOT 编辑**（backlog/matrix/checklist/queue/issues-master 状态行·nail 期归协调方）；**零 RLS/授权根/asPrincipal 语义改动**。

## §3 逐条改动清单（file:line 全亲读 @3c3406bd）

| # | 面 | 锚点（亲读） | 改动 | 备注 |
|---|---|---|---|---|
| 1 | 挂点 | `apps/worker/src/report-worker.ts:53-59`（tx2 finalize·:13-25 deps 形制） | tx2 成功后（形 A）追加 growth-gen 步：默认生产实现+prove 可注入故障 deps | 审计教训：机制必须真被调度 |
| 2 | 生成核心共享（D2a） | `interview-assessment.ts:18-47`、`interview-learning.ts:15-28`、`interview.service.ts:667-683`（career pre 段读写） | 三段核心提共享层（读卡/derive/upsert·plain code 错误）；API 薄委托信封字节原样；worker 调同函数 | **交叠 SCORE S2·后落 rebase** |
| 3 | 评估段 | `scoring-aggregation.ts`（listScorableScoreCards 读面）+ `0001:336-347`（assessment_report DDL/UNIQUE:345） | 读卡→derive→upsert `status='ready', dimensions, overall`（version+1） | 聚合器内核归 S2 |
| 4 | 学习段 | `packages/domain/src/learning.ts:8-18` + `0001:378-387`（UNIQUE:386） | 评估 dimensions→deriveLearningPlan→upsert items | 需评估先行 |
| 5 | 职业段 | `packages/domain/src/career.ts:9-19` + `0001:427-437`（UNIQUE:436）+ `ai-graphs/src/career-path.ts:55-70`（备用） | 单事务 upsert（D3 裁定·#187 建议形）；备选复用 runCareerPathGraph+worker ledger | ai_graph_run 分叉登记 |
| 6 | 失败语义 | report-worker 钩子内 | 逐段 try/catch→结构化日志+计数器；报告态不动；依赖段跳过 | 尽力而为·crash 窗口收据登记 |
| 7 | 弱项偏置验证 | `memory-store.ts:49-58` + `adaptive-interview-service.ts:179-192` | 预期零代码；prove 断言链（§4.S2） | 缺陷暴露才最小修 |
| 8 | 文案 #275 | `apps/web/app/growth/page.tsx:67` | 「并生成评估」→自动语义一行 | 本刀唯一 web 改动 |
| 9 | prove | `apps/worker/test/interview.proof.ts`（③ 段后新增 ③a） | §4 断言族；键形制（扩既有 vs 独立双注册）归双审 | 优先扩既有键 |

## §4 Prove（隔离库 · SCORE S1 interview:prove 形制参照扩展 · est live=0）

- **主证（优先扩 `pnpm interview:prove`——沿「扩既有 prove 禁另立假门」惯例；若双审裁独立键则照惯例双注册根 package.json+run-e2e-isolated.mjs target 表）**，interview.proof.ts 新增「③a 成长链自动生成」段（SCORE 域 ①-③ 断言原样不动）：
  1. **fixture**：沿 ②b IID2 形制独立面试（IID3）供卡——`publishRubricAndIssueContract`+`submitInterviewAnswer`+`writeScoreCardAfterProjection`（interview.proof.ts:216-241 先例）；**hint 取值钉死产出 gap 维度**（如两题 hint=59 → 卡总分 [0,0] → 维度分 0 < GAP=60 → gap=true；对照 ②b 既有 [50,0,100,100] 均分 63 不 gap，故须独立面试+定向 hint——维度分/overall 对 `aggregateScores`/`deriveAssessment` 语义为纯函数可预期）。
  2. `enqueueReport`（report.ts:14-21）→ `drainReportsOnce`（生产 deps·钩子为默认实现非注入桩）→ 断言：
     - `assessment_report` 行：`status='ready'`、dimensions 非空、overall 非空（**三区块之一**）；
     - `learning_plan` 行：items 非空且 gap 维度→topic 在列（priority high·score<40）（**之二**）；
     - `career_path` 行：readiness/level/milestones 非空（weaknesses 非空 → 含「补短板」里程碑）（**之三**）；
     - **/growth 出点**：以 `profile.service.growth` 同一 SQL 谓词取行 → `toGrowthRow`+`deriveGrowth`（domain 单一真相映射·profile.service.ts:68-74 同源）→ `points.length===1`；
     - **弱项偏置非 no-op（S2 断言链）**：`historicalWeakDimensions(c, owner)` 返回含该弱项维度 → `biasByPastWeakness` 语义断言（弱项前移·非弱项原序——adaptive-interview-service.ts:191 稳定分区）；
     - **幂等**：重放钩子（或再 drain）→ 三表行数各=1（UNIQUE+version+1·零重复）；
     - **尽力而为**：注入职业段失败 deps → 报告仍 `ready`、评估+学习仍在、失败计数+1、无异常上抛；
     - （可选）Dashboard 读面：`profile.overview` avgScore 非 null（score_card 已有卡即非空·S1 已落·非本刀增量必断）。
  3. 期望 **EXIT=0** + 断言计数如实宣布；SCORE 域既有断言（含 :316 桩）零改动零回归。
- **est live 预算如实**：全 `scriptedModelClient`（interview.proof.ts:43-48 先例）——三段 derive 为 domain 纯函数零模型调用、报告段沿既有 scripted generate → **est live=0**、0 Key 值接触、`actualSpendCny=null`；本刀无 live 模型段（若双审裁加，按 ≤25 CNY 双计入账规则另批，默认禁）。attempts 一次优先，Ban retry-to-green。
- **辅证**：typecheck 全绿（既有 `pnpm typecheck` 或仓内等价键）。

## §5 Ban

Ban 迁移（形 A 零迁移·三表 UNIQUE 既有；形 B 及其迁移未经双审裁定禁落）· Ban 前端加生成按钮/任何客户端触发调用（前端只读）· Ban 触 SCORE S2 聚合器切换面（interview-assessment.ts 内核 derive 切换/gap 派生/:316 桩去留——归先刀·本刀后落 rebase）· Ban 改弱项偏置出题逻辑本体（biasByPastWeakness/planCompetencies 原样）· Ban 弱项衰减/最近 N 场（#206）与学习回灌/再练交互（#205/#214/#252——WEAKNESS-LOOP 域）· Ban 报告重试机制（#229 sweep/requeue/频控/退额 proof）· Ban 拆 API 侧 career-path AiGraphRun 状态机（#187 归 5E·契约冻结·本刀只在新面用简化形）· Ban 把「尽力而为」叙事成三区块保证（crash 窗口/生成失败=区块暂缺如实）· Ban 删/弱化 409 fail-closed 语义（no_scorable_cards/assessment_required 信封原样）· Ban SSOT 编辑（backlog/matrix/checklist/queue/issues-master 状态行·nail 期归协调方）· Ban secrets/`.env*`（Key name-only）· Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿叙事 · Ban push 冒充执行（docs-only 起草期）· Ban G7 面/车道/live 套件 · Ban Meridian · Ban buy cloud。

## §6 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §7 Non-claims

本刀 ≠ 成长链产品闭环（弱项衰减 #206/学习回灌再练 #205/#252/入口 #214 归 WEAKNESS-LOOP）；≠ 三区块保证（尽力而为：生成失败/crash 窗口→区块暂缺，POST 手动补口仍在，报告不受连累）；≠ #40 E2E（真实 loadSummary 桩去留/明文 /turn 家族供卡/`#20` 全链验收归 SCORE S2/S3 域）；≠ 评分质量/校准已证（derive 确定性聚合·质量归 eval 面）；明文 /turn 家族（0126 过渡窗）下自动评估空集跳过=承 S1 既有形状非本刀回归；三区块非空断言过 ≠ UC-E2E-004 covered（矩阵行归矩阵流程）；E2E 绿 ≠ HA ≠ releaseEvidence；S2 弱项偏置验证过 ≠ 偏置有效性/反 confirmation-bias 已评估（机制设计面已在产在案）。

## §8 STOP

本 REQUEST 为 docs-only 起草，**不授权 coding/prove 执行/实跑/push**。下一步：预执行双审（`awaiting_pre_exec_dual`·建议 e2e-ha + model-op 双域——worker 作业/幂等/尽力而为诚实面/断言族归前者·事务边界/预算/交叠序归后者）BOTH Verdict: PASS → meetwise 授权 EXEC（含 D1 形 A/B、D2 a/b/c、D3 简化裁定终值与切片表裁定）→ coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

## 附：切片建议（供双审裁 · 序依赖 S1→S2 · 每片独立收据）

| 切片 | 触碰面 | 内容 | 关键验收 | est live |
|---|---|---|---|---|
| **S1（本刀）** | §3.1-6（worker+共享层+API 薄委托） | report-worker 成功钩子+三段生成（共享单源 D2a·幂等=表级 UNIQUE·尽力而为日志计数） | interview:prove ③a：三区块非空+/growth 出点/幂等/失败不连累报告 | 0（scripted seam） |
| **S2（本刀）** | §3.7-8（预期零代码+一行文案） | 弱项偏置自动生效验证（prove 断言链）+ #275 文案 | historicalWeakDimensions 非空+bias 分区断言；文案改自动语义 | 0 |

切片理由：S2 预期零代码（纯 prove+一行 web 文案），独立收据便于「链路已通」与「偏置生效」分口验收；若 prove 暴露 S2 缺陷则升级为最小修复片。**整刀直落（不切）亦为可选项**——由预执行双审裁定；命名消歧：本刀 S1/S2 ≠ SCORE-WRITER S1/S2（§0③ 交叠声明在案）。

---

*REQUEST stub · #204 GROWTH-GEN · Line GROWTH-GEN · mw-grow201-draft · 2026-10-10 · PENDING awaiting pre-exec dual · alone ≠ dual · Ban push · STOP*
