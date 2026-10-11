# H4 WEAKNESS-LOOP 刀 · EXEC REQUEST（起草稿）

**刀名**: WEAKNESS-LOOP（弱项→再练→专项面→回灌→衰减 闭环）· 分支 `line/h4-weakness` · base 主线 tip `36ded20a`（`feat/mysql-schema-skeleton`·工作树 `/Users/miaole/Desktop/golucky/meetwise-h4`）
**体量**: M-L（batch-residual-plan :99 H4 组）· **本档=docs-only 起草**（`draft:awaiting_pre_exec_dual`·零码动·不授权 coding/prove/push）
**蓝本**: batch-residual-plan.md H4 行（`line/batch1-residual` @`ab02d499` :99·:56 清单级）= #252/#214/#205/#206/#203/#269(+新-#277)·🔒#204 已通；issues-master 更正版（`/Users/miaole/Documents/Meetwise产品审计-更正版/issues-master.md`）#252 原文亲读 + 族行 #214(:287)/#205(:348)/#206(:349)/#269(:443)/#203(:476)/#204(:145)；上游修法列=更正版 fix-roadmap 批2 第 6 条闭环序（fix-roadmap.md:89）+ 验收标准（:97）+ 真实依赖表（:166 `#252|`#204`|技术阻塞|弱项来源 assessment_report`）。
**Honesty（行号漂移登记）**: 派单称 #252 在「:340 区」——更正版实树 #252 在 **:289**（:340 区为 #205/#206 所在「再次面试/AI 能力缺口」段 :348-:349，同族同读）；本档全部锚点以更正版实文件行号 + `line/h4-weakness` @`36ded20a` 生产码面亲读为准（issues-master 原锚 memory-store.ts:44-56 / memory-service.ts:28-31 / report page:276-290 因 DIR-B2 域化与多刀落卷已漂，§1 全部重钉）。

---

## §0 蓝本逐字誊录（禁改写）

### §0.1 issues-master 更正版 #252 原文（:289 全行）

> | #252 | P2 | 产品偏差 | 再次面试 | 弱项→再面试闭环不存在：弱项只读 assessment_report.gap，而无 UI/worker 触发评估生成（#204）→ 恒空，"记忆影响出题"恒为 no-op；开始面试表单只有"选简历"，无重点能力/目标岗位；报告/成长/学习计划无"针对弱项再练"入口 | apps/worker/src/memory-service.ts:28-31；apps/web/app/interviews/page.tsx:71-84；apps/web/app/report/[id]/page.tsx:276-290 | 仍存在 | 已核实（读码+grep） | **报告页"再练这 3 个弱项"→ 带 focus 开 5–8 题专项面；弱项改语义匹配** | #204、#205、#206、#203 | #204 | 第2批 | 九·产品偏差 原 #210（P1） | （2026-10-09 独立复核更正：P1→P2（功能缺失而非阻断）；措辞更正：**"#204 不产生"改为"无 UI/worker 触发评估生成，故 gap 无数据"（domain/assessment.ts:52 生成时确会产出 gap）**。） |

### §0.2 上游修法列（fix-roadmap 批2 第 6 条闭环序 :89 · 验收 :97 · 依赖 :166 · 逐字）

> 6. **闭环**：#252（报告页"再练这 3 个弱项"带 focus 开 5–8 题专项面）→ #205、#214（学习项变"去练"按钮，再练成绩自动勾选）→ #206、#203（弱项时间衰减 + 语义匹配）→ #200（押题题目作为 planner 输入）→ #185、#269。

> 验收标准（节选）：「完成一场有弱项的面试 → 报告页出现"再练"按钮 → 专项面的 planner 能力清单包含该弱项」「出题输入包含上一轮评估摘要（criterion+弱点标签）」。

> 真实有向依赖：`#252（2）| #204 | 技术阻塞 | 弱项来源 assessment_report`。

### §0.3 族行修法（逐条）

- **#214**(:287) 修法：「学习项改为"去练"按钮（带 focus 开专项面），完成由再练成绩自动勾选；补导航入口」——锚 apps/web/components/Nav.tsx:35-42；report page:259-291（:278 图标）；interview.controller.ts:225-230。
- **#205**(:348)：「学习计划/打卡/职业路径不回灌面试：learning_plan、learning_progress 在 worker/ai-graphs/domain 非测试代码零读者，计划是一次性覆盖写的静态模板」·修法：「学习项关联"专项再练"，再练结果自动更新进度与计划」。
- **#206**(:349)：「"历史弱项"永不衰减：查询对全部历史报告 SELECT DISTINCT … gap=true，不看时间；实跑 Redis 先 30 后 92 仍被当弱项」·修法：「按最近 N 场/时间衰减，最新一场达标即移出」。
- **#203**(:476)：「历史弱项偏置用"归一化后字符串完全相等"匹配模型自由生成的能力名，命中率低；判重/弱项按 owner 全局，不分岗位/简历」·修法：「改语义匹配，并按岗位/简历分桶」。
- **#269**(:443)：「成长曲线把不同简历/岗位/能力集合/题数的场次 overall 直接连线算 delta，无可比性约束」·修法：「按岗位/能力集合分组或标注不可比」。
- **新-#277**（product-campaign-LEDGER :107）：「跨场维度曲线画不出（维度名交集小）」·处置（LEDGER 原文）：「#203/#206 修法**验收注记**」——注记面，非独立实现件。

---

## §1 现状盘点（全部 @`36ded20a` 实树亲读·file:line）

### §1.1 弱项链三面通断总览

| 面 | 现状 | 判定 |
|---|---|---|
| **弱项产出面**（assessment 自动生成） | `apps/worker/src/report-worker.ts:163` drainReportsOnce tx2 成功后硬接线 `generateGrowthChain`（:28-29 注记=生产默认非可选开关）→ `packages/db/src/growth-generation.ts:42-58` generateAssessmentReportCore（deriveScoreCardAssessmentLegacy·gap 落 assessment_report.dimensions·零卡 fail-closed no_scorable_cards）→ 学习段 :61-75 / 职业段 :78-95 | **已落·验证件**（GROWTH-GEN @dc7e6daf EXEC → @6a7a3acc nail·merge-base 实证为主线祖先）——#252 症状「恒空」解除 |
| **弱项存储面** | assessment_report.dimensions 为唯一弱项真相（gap 布尔+分数）；`packages/db/src/memory/memory-store.ts:44-59` historicalWeakDimensions=**只读投影**（"只读，不新建信念表" :44-48 注记·interview_privacy_active 过滤已在 R4 落）；user_memory 只存 episode 归一化题面（:9-15 insertMemory·:35-42 episodeSeen）·弱项不入 user_memory | **已落（形状冻结）**·H4 衰减/匹配在**读投影层**做，禁新建信念表 |
| **弱项消费面**（出题偏置） | `apps/worker/src/adaptive-lifecycle.ts:242` planCompetencies 生产调用 → `apps/worker/src/adaptive-interview-service.ts:179` biasByPastWeakness（:189-194 弱项前移稳定分区·:183-188 注记=hint 非硬过滤·难度/confidence 不受影响）·`apps/worker/src/memory-service.ts:26-33` pastWeakDimensions 委托 | **已落·验证件**（#204 S2 直行使）——#252 症状「no-op」解除 |
| **再练入口面** | `apps/web/app/report/[id]/page.tsx:245-281` AssessmentSection 只渲染能力条（:264 AbilityBar em=gap 强调）·**全页 grep「再练」0 命中** | **残**（#252 修法①缺） |
| **focus 进题链面** | begin 链参数面=`apps/api/src/modules/interview/interview.controller.ts:27`（resume-id/quiz-id/target-role 三头·无 focus）→ `interview.service.ts:361-364` begin 六参（无 focus）→ `adaptive-lifecycle.ts:231/:269-271`（role,facts）→ `adaptive-interview-service.ts:169-181` planCompetencies(prompt :174 仅 {role, facts}) | **残**（focus 全链断·5-8 题专项面无预算模式：`packages/domain/src/adaptive-interview.ts:173-180` initMind soft=derivedSoftBudget(competencies) 通用覆盖计划） |
| **学习项「去练」/回灌面** | `report/[id]/page.tsx:283-321` LearningSection 静态图标（:302 CheckSquare/Square·done 只读 learning_progress）·后端 `interview.controller.ts:227-232` POST :id/learning-plan/complete 在、`interview-learning.ts:44-52` completeLearningItemFor 只 INSERT learning_progress·**worker 零读者**（grep apps/worker/src learning_plan|learning_progress=0）·`packages/domain/src/learning.ts:7-19` deriveLearningPlan 模板 action（"目标达到 70 分"）一次性覆盖写（growth-generation.ts:61-75） | **残**（#214 去练缺+前端 0 caller·#205 回灌缺） |
| **衰减面** | `memory-store.ts:49-59` 全史 `SELECT DISTINCT … gap=true` 无时间窗/无达标移出 | **残**（#206 原样·原锚 :44-56 漂至 :49-59） |
| **匹配面** | `adaptive-interview-service.ts:191-193` `weakSet.has(normalizeQuestion(n))` 精确串等（normalizeQuestion 本为题面归一化器 memory-store.ts:29-31·被复用于能力名）·无岗位/简历分桶 | **残**（#203·设计张力见 §3-D1） |
| **成长曲线可比面** | `apps/web/app/growth/page.tsx:77-84` delta=本场 overall−上一场 overall 直连（:79）·GrowthPoint.dims Record 无交集约束（:20）·:142-151 渲染 | **残**（#269+新-#277 注记） |
| **导航面** | `apps/web/components/Nav.tsx:34-45` candidateLinks 含 /growth/:36 无 /diagnosis | **残面**（#214「补导航入口」顺手项·EXEC 裁量） |

### §1.2 #252 原文逐条对照（审计闭环缺口清点）

| #252 原文断言 | 现状 | 缺口判定 |
|---|---|---|
| 「无 UI/worker 触发评估生成 → gap 无数据（恒空）」 | report-worker :163 硬接线自动产评估（GROWTH-GEN） | **已闭**（已落·验证件——双审验 prove 断言件在卷：growth-gen receipts 2026-10-10-s1s2-exec-prove.md §2） |
| 「"记忆影响出题"恒为 no-op」 | biasByPastWeakness 生产直行使（lifecycle :242→service :179） | **已闭**（同上·54 PASS ③a 断言在卷） |
| 「开始面试表单只有"选简历"，无重点能力/目标岗位」 | 目标岗位已落（interviews/page.tsx:133-136 targetRole 输入→actions.ts:33,43-44 头→controller :27）——归 #259/H5 边界；「重点能力」（focus）输入全链无 | **半闭**：目标岗位面归 H5 不重做；**focus 输入面=本刀 R1/R2** |
| 「报告/成长/学习计划无"针对弱项再练"入口」 | 报告页 0 再练入口；学习计划静态图标；成长页只有「开始模拟面试」无 focus 面 | **残=本刀主体 R1/R4** |
| 修法②「弱项改语义匹配」 | 精确串等原样 | **残=本刀 R7**（含协调方范围外冲突旗·§3） |

**审计结论**：#204 前置🔒已通后，#252 闭环缺口收窄为**产品交互闭环五件**（再练入口/focus 喂题/去练+回灌/衰减/语义匹配）+ **成长曲线可比一件**——弱项数据的「产/存/消费」底座三面已由 GROWTH-GEN 落毕并验证，本刀不再重做，只做**验证件引用+回归守卫**。

---

## §2 修法清单（R1-R8·逐条 file:line 固化·EXEC 照单落）

- **R1（#252 修法①·再练入口）**: `apps/web/app/report/[id]/page.tsx:245-281` AssessmentSection gap 维度面（:264 AbilityBar 区）加「再练这 N 个弱项」入口（N=本场 gap 维度数·运行时派生；修法原文「3」为叙述值非硬编码）→ Server Action 携 focus（维度名数组·上限=本场 gap 数）走既有 create+begin 链。入口形态（按钮 vs 卡片区 CTA）由 EXEC 按 G2/G3 报告页先例定，**Ban 新增第三种导航模式**。
- **R2（#252 修法②前半·focus 进题链）**: begin 链五断点逐段接 focus：
  ① `interview.controller.ts:27` 增可选 `focus` 头（沿 target-role 透传形制·空不发头=现状字节）；② `interview.service.ts:361-364` begin 形参扩展（沿 sourceQuizId/targetRole 第 5/6 参先例·进 job payload）；③ `adaptive-lifecycle.ts:231/:269-271` startAdaptiveInterview focus 形参（payload 透传·RLS owner 域内）；④ `adaptive-interview-service.ts:169-181` planCompetencies 增 focus 入参→prompt（:174 'planner.competencies' 增上一轮评估摘要段=criterion+弱点标签·fix-roadmap 验收原文）；⑤ 偏置联动=biasByPastWeakness 前移面在 focus 场景恒命中（focus 名单即弱项名单·语义匹配见 R7）。**硬约束**：focus 只进「考哪些能力」面（hint），**绝不影响难度/信心**（:185-186 反 confirmation-bias 注记为铁律）。
- **R3（5-8 题专项面预算）**: `packages/domain/src/adaptive-interview.ts:173-180` initMind 增专项短预算形（focus 场景 soft 由 focus 能力数派生 5-8 题·absoluteMaxTurns 杀开关照旧 :100-106）——与 #201（planner 通用上限·H7 挂账）分界：**本刀只做专项面预算，不做通用 planner 上限**。软预算上调语义（:400-401 SOFT_BUDGET_RAISE_STEP）在专项模式是否保留=双审裁（D2）。
- **R4（#214·去练）**: `report/[id]/page.tsx:283-321` LearningSection 静态图标（:302）改「去练」按钮（带该学习项 topic=focus 开专项面·复用 R1 action）；完成勾选主径=**R5 自动勾选**（修法原文「完成由再练成绩自动勾选」），completeLearningItem 手动打卡端点（controller :227）保留不接前端（诚实登记：修法原文二径取一·自动为主）。#214「补导航入口」面（Nav.tsx :34-45 /diagnosis 缺）=顺手项，EXEC 裁量随刀落或登记后继。
- **R5（#205·回灌）**: 再练面试评估 ready 后自动回灌：worker 评估段成功后按本场 gap 维度名匹配**历史** learning_plan 学习项落 learning_progress（勾选）·匹配算法随 R7 终形（精确/确定性相似）·worker 读 learning_plan 零读者现状由此接通。**Ban 一次性覆盖写 learning_plan 的语义改动**（growth-generation.ts:61-75 upsert 形状冻结·回灌只写 progress 不重写计划；计划重写面若有→登记残余）。
- **R6（#206·衰减）**: `memory-store.ts:49-59` historicalWeakDimensions 加时间衰减窗：按修法原文口径「最近 N 场窗口/最新一场达标（gap=false）即移出」·窗口 N 取**固定初值**（建议最近 5 场·EXEC 可调）——**不依赖 H1 校准**（见 §3-1）。R4 读面过滤（interview_privacy_active :54）零弱化。
- **R7（#203·语义匹配+分桶）**: `adaptive-interview-service.ts:189-194` 精确串等→**确定性相似度匹配**（仓内先例：同文件 :94-106 relevanceScore 词元+CJK bigram 纯函数·A-3 已生产在用）+「按岗位/简历分桶」面（弱项投影按岗位分桶·historicalWeakDimensions 加岗位过滤参或消费侧过滤）。**设计张力（D1·双审终裁）**：`memory-service.ts:1-7` lean MVP 注记明载「不用 embedding/语义召回/信念库（2 位专家审计砍瘦定稿）」——R7 语义匹配**禁 embedding/向量召回**，取确定性相似度或 planner prompt 侧模型匹配（方案对比表由 EXEC 出·双审判）。**冲突旗（见 §3-2）**：协调方范围外行含「#203」——本任务书按蓝本（batch-residual-plan :56/:99+fix-roadmap :89 均列 #203 于本刀）保留 R7 在列，双审可判整条出刀降级。
- **R8（#269+新-#277·曲线可比）**: `growth/page.tsx:77-84` delta 直连加可比性约束（按修法原文「分组或标注不可比」最小形=标注/分组二择·EXEC 按现有 view-model 面定）；新-#277「跨场维度曲线维度名交集小」按 LEDGER :107 处置=**验收注记**落本刀 prove 卷（非实现件）。

## §2b 判据（验收·落 prove 载体）

1. **fix-roadmap :97 验收原文照抄为主判据**：完成一场有弱项的面试 → 报告页出现「再练」按钮 → 专项面的 planner 能力清单包含该弱项；出题输入包含上一轮评估摘要（criterion+弱点标签）。
2. prove 载体建议：`apps/worker/test/interview.proof.ts` ④a 族（沿 GROWTH-GEN ③a 先例）或新 `weakness.proof.ts`（EXEC 定）·断言族：focus 全链透传（controller→payload→planner prompt）/专项预算 5-8/回灌勾选幂等/衰减窗（达标移出+未达标保留+冷启动恒等）/匹配（同义名命中·异名不误挡）/R8 标注面。
3. 回归守卫：GROWTH-GEN interview:prove 54 PASS 零退化·neg:interview 97 全绿·biasByPastWeakness hint 语义断言原样（:183-188 注记面）·learning-plan 409 assessment_required 信封字节原样（neg:interview :408-411）。
4. est live=0（scripted seam 沙箱域·零外呼新增）。

---

## §3 范围外（协调方钉死 + 起草席登记）

1. **R6 衰减算法若依赖 H1 校准期 → 停手**：H1 阈值决议（@61034dab·h1-thresholds.md :87 R7=最高通过难度线 60 等）辅助常数 R1-R9 中多项为「待校准登记项」（:107/:217·随黄金集离线校准复核）——本刀衰减窗**只取固定初值**，凡 EXEC 发现衰减参数必须取 H1 校准值者，该子项停手登记残余（est live 相应缩面），**不等 H1 校准期**。
2. **押题联动 #200 归后刀**：#200（押题题目作 planner 输入·issues-master :436）= H7 挂账（batch-residual-plan :102「建议 H2/H4 立项时顺手收编」）——**本刀不收编**（fix-roadmap :89 闭环序 #200 在 #203 之后）。**冲突旗**：协调方范围外行「押题联动 #200/#203 归后刀」之「#203」与蓝本（batch-residual-plan :56/:99+fix-roadmap :89 均将 #203 列 H4 主体「衰减+语义匹配」）相抵——本档按蓝本保留 R7，双审终裁：若判 #203 整条出刀，R7 降级为「衰减窗内精确匹配保守面」并整条登记后刀，R2/R5 匹配面同步收窄。#185（职业路径模拟面）同归后刀。
3. #259 S2a/S2b/S3+默认简历+/roles 入口（H5）·目标岗位 UI 已落面零触；#230 押题 target-role 头（H5）；#201/#202（H7 挂账·AI 质量面）；#256 提前结束（🔒D3）；#215/#262 报告逐题/口径面（SCORE/REPORT 域）；偏置有效性评估（≠ 反 confirmation-bias 机制已落·growth-gen Non-claims 原文承继）。
4. 新信念表/向量召回/记忆库重构（memory lean MVP 裁决面·D1 反向 Ban）。

## §4 Ban

Ban 改 GROWTH-GEN 已落三面语义（report-worker :163 硬接线/growth-generation 三核心/信封字节）· Ban 触 biasByPastWeakness 出题偏置**本体语义**（hint/难度隔离铁律 :183-188·R2/R7 只扩入参与匹配算法）· Ban embedding/向量召回进弱项匹配（lean MVP 注记 memory-service.ts:1-7·语义匹配取确定性先例）· Ban 新建信念/弱项持久化表（historicalWeakDimensions 只读投影形状冻结·衰减在读投影层）· Ban 一次性重写 learning_plan 派生语义（R5 只写 progress）· Ban 硬过滤式 focus（focus 只前移/喂 planner·绝不删能力）· Ban 通用 planner 上限（#201 归后刀）· Ban 动 completeLearningItem 端点契约（controller :227 信封原样）· Ban SSOT 编辑（backlog/matrix/checklist/queue/issues-master 状态行归协调方）· Ban secrets/`.env*` · Ban G7 面/live 套件 · Ban self-approve/代签 peer（alone≠dual）· Ban retry-to-green/masking/假绿叙事 · Ban push（本刀全程）· Ban Mermaid/新框架引入 · Ban buy cloud。

## §5 Pins（十一值照抄 · 本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503（supersession 注记：简历/账户轨=202 软删受理沿 UNSTUB-ERASE 现行值·interview-data 面原值不动·NORTH-STAR :36-:46 抄写面照抄）· `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## §6 Non-claims

本刀 ≠ 偏置有效性/反 confirmation-bias 已评估（机制在案·效果归 eval 面）；≠ 评分质量/级别已校准（H1/H3 域）；≠ 「三区块保证」（GROWTH-GEN 尽力而为语义承继）；≠ 押题联动已接（#200 后刀）；≠ 学习计划智能重写（模板派生形状冻结·智能面归后刀）；prove 绿 ≠ HA ≠ releaseEvidence；R7 若双审判出刀 ≠ 本刀语义匹配已落（如实缩面登记）。

## §7 STOP

本 REQUEST 为 **docs-only 起草**（`draft:awaiting_pre_exec_dual`），**不授权 coding/prove 执行/实跑/push**。下一步：预执行双审（建议 e2e-ha + model-op 双域——前端入口/回灌幂等/断言族归前者·focus 链事务边界/预算语义/衰减窗口归后者；**D1 语义匹配方案**与 **§3-2 #203 冲突旗**为双审必裁项）BOTH Verdict: PASS → meetwise 授权 EXEC → coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail。implementer 不自批 · **alone ≠ dual** · **STOP**。

---

*REQUEST stub · H4 WEAKNESS-LOOP · Line h4-weakness · mw-h4-draft · 2026-10-10 · draft:awaiting_pre_exec_dual · base 36ded20a · alone ≠ dual · Ban push · STOP*

---

*REQUEST 状态行 append-only · 2026-10-11 · pre-exec 合并复审 PASS（#203 终裁留本刀·协调方明示授权 EXEC）→ **executed:awaiting_post_prove_dual**（EXEC 落卷：R1-R8 全兑·复审三处方①②③兑现·rebase up-to-date 零重定位（实树核验 mainline tip=36ded20a=merge-base·简报偏差如实登记）·R7 确定性相似度留本刀+分桶降级条款缩面登记（assessment_report 无岗位列·owner 域即桶）·D2 照旧保留登记·prompt planner.competencies v2→v3·门禁八项全绿 EXIT 原值（web:prove+web typecheck+interviews-actions+interview:prove 57 断言逐字节同+neg:interview 97+growth:prove 31 零退化+memory:prove+新增 weakness:prove 73 PASS·web-logic/interviews-actions 全绿零翻）·预存红登记（api prove:role-input 7 checks·B271 区域锚漂移·非本刀·未触）·收据 receipts/h4-weakness/·est live=0·markers=0·pins 十一值零翻转·⛔push·Ban self-approve·alone ≠ dual·Dual PASS ≠ nail）*

---

## post-prove 席1 勘误登记（2026-10-11 · 协调方落卷·不阻语义闭环）

1. **role-input 红计数勘误**：EXEC 账面称 7 FAIL——席1 实树亲跑实为 **8 FAIL**（base=7·本刀 additive focus 第 8 参使 `role-input.proof.ts:48` S3 controller 透传锚由 PASS→FAIL·与已登记 S6 同类陈旧锚·零行为回归）。7→8 增量与 S3 翻转未入 EXEC 收据，本条勘误登记；修锚归 B271 原席（REG-FIX 同域）。
2. **证据件替换**：`receipts/h4-weakness/api-role-input-preexisting-red.log` 内容为 wrong-cwd ENOENT 空跑——预存红结论经席1 base 对照跑（@36ded20a worktree）实证为真（7 FAIL），但该日志不构成证据，真实对照跑日志须替换后方构成收据完整件。

---

## nail 落卷（2026-10-11 · post-prove 双席 BOTH PASS·E4 三勾选 ✓）

**双审结果**：席1（弱项闭环语义·有条件 PASS+勘误 @00cdc8c3）+席2（用户旅程/回归·PASS）互盲复核。R1-R8 全兑现亲读：R1 再练入口（N=gap 运行时派生）+startFocusRetrainAction 双头·R2 focus 五断点全通（prompt v2→v3 缺省逐字节回退·resume-grounding B1/S1-1 复跑绿）·R3 5-8 预算（通用 2-3 分界零触）·R4 去练入口·R5 weakness-backfill 幂等回灌（interview:prove 亲见 weakness_backfill_marked 真链生效）·R6 固定窗 N=5 衰减（只读投影零新表）·R7 语义匹配阈值 0.5（禁 embedding·降级缩面登记）·R8 曲线可比。三处方兑现（①②③断言落槽+web-logic/interviews-actions 全绿零翻）。八套件亲跑全绿（web prove+10/weakness 73/interview 57/neg 97/growth 31/memory/interviews-actions 16）。GROWTH-GEN md5 全同核·SCORE 零字节。merge 落主线 @9c4c0f9e。

**勘误随卷**：role-input 7→8 FAIL（S3 锚 additive 新翻·归 B271 原席 REG-FIX）+证据件空跑替换令·均 @00cdc8c3 登记。

**Status**: `nail:closed`（post-prove 双席 BOTH PASS·E4 三勾选 ✓·merge 落主线 @9c4c0f9e·#252 族弱项闭环正式解除·批2 残 41→40·markers=0·est live=0）。
