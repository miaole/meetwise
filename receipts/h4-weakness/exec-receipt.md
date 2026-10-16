# H4 WEAKNESS-LOOP · EXEC 收据（executed:awaiting_post_prove_dual）

**席位**: H4 WEAKNESS-LOOP EXEC（#252 族弱项闭环八残面）· **分支** `line/h4-weakness`（工作树 `/Users/miaole/Desktop/golucky/meetwise-h4`）
**前置**: pre-exec 合并复审 PASS（#203 终裁留本刀=R7 语义匹配保留·确定性相似度·禁 embedding）· 协调方明示授权 EXEC
**base**: `36ded20a`（`feat/mysql-schema-skeleton` tip）→ 本刀 commit 见末行
**诚实声明**: alone ≠ dual · 本收据非 nail · prove EXIT=0 ≠ DONE · ⛔push（全程未 push）

---

## 0. 门禁总账（EXIT 原值·亲跑）

| 门禁 | 基线（改码前） | 落卷后 | 判定 |
|---|---|---|---|
| web:prove（web-logic.proof） | EXIT=0 | EXIT=0 | 全绿零翻 + 新增 H4 处方①②/R8 三 section 10 断言全绿 |
| prove:interviews-actions | EXIT=0 | EXIT=0 | 全绿零翻 |
| apps/web typecheck | EXIT=0 | EXIT=0 | 0 错误 |
| interview:prove | EXIT=0（57 PASS） | EXIT=0（57 PASS） | 断言集逐条 diff **逐字节同一**（零退化） |
| neg:interview | EXIT=0（97 全绿） | EXIT=0（97 全绿） | 零退化 |
| growth:prove（GROWTH-GEN） | EXIT=0（31 PASS） | EXIT=0（31 PASS） | 断言集零退化·growth-generation.ts 零字节改动 |
| memory:prove | EXIT=0 | EXIT=0 | 零退化（R6 衰减窗与既有断言兼容·最新一场口径） |
| **weakness:prove（新增）** | —（新建件） | **EXIT=0（73 PASS）** | R1-R8 断言族全绿·隔离 PG·est live=0 |
| 全仓 8 包 tsc --noEmit（domain/ai-graphs/ai-runtime/db/contracts/api/worker/web） | 预存错误集 | diff **零新增** | 逐包 before/after 错误集 diff 为空 |

原始日志卷侧：`receipts/h4-weakness/*.log`（baseline-gates-EXIT.txt / final-gates-EXIT.txt 逐项 EXIT 原值）。

**预存红登记（非本刀新增·未触）**：`apps/api` `prove:role-input` **7 checks FAIL（EXIT=1）**——根因=B271 片2 `beginInterviewCore` 事务体模块化抽取后，该 proof 的区域锚（`svc.indexOf('begin(principal')`→`turn(principal)`）不再覆盖被搬移的归一化/payload 写面（S5/S6/S8/R1/R2/R3/R5 区域性失配）。本刀改码前基线即红（`api-role-input-preexisting-red.log` 在卷·改动仅本刀 25 文件之外）；该文件零触碰，修复归原席/后刀。附注：本刀将 begin payload 表达式由「三元条件键」改为「显式 if 追加键」（语义等价 additive），role-input S6 所钉旧表达式文本随之失效——已如实在此登记，不构成新增红（该 proof 本就红）。

## 1. rebase 主线（漂移表 ①）

- 协调方简报称「主线在 36ded20a 后落了 HA-3/HA-5/H1/I1 等」——**实树核验**：`feat/mysql-schema-skeleton` tip **= 36ded20a**（HA-3/HA-4/HA-5 等刀均在该 base **之下**为祖先），merge-base = tip → `git rebase feat/mysql-schema-skeleton` **up-to-date 零冲突零重定位**（简报与实树偏差如实登记·memory/report 面无变）。
- 逐锚重定位：REQUEST §1 全部锚点 @36ded20a 实树亲读**零漂移命中**（见 §2 各 file:line）；仅两处结构性注记：
  - REQUEST 锚「interview.service :361-364 begin 六参」= InterviewService.begin 方法（B271 片2 后事务体在模块级 `beginInterviewCore` :80-246）——focus 第 8 形参同时落 begin 方法与 beginInterviewCore（两处都接）。
  - REQUEST 锚「interview-learning.ts :44-52 completeLearningItemFor」实为 :44-48（4 行 INSERT）——零触碰（R4 手动端点契约原样）。
- 复审登记三处（:31-33 新-#277 验收注记行 / :357-361 R2 五断点行 / :45-52 §1.2 审计行）全部按 REQUEST 原文兑现，无再漂移。

## 2. R1-R8 逐条兑现（file:line 落卷定值）

| R | 修法 | 落卷 file:line | 判定 |
|---|---|---|---|
| **R1** | 报告页「再练这 N 个弱项」入口（N=本场 gap 数运行时派生·action 携 focus 走既有 create+begin 链） | `apps/web/app/report/[id]/page.tsx:261-262`（gapDims/gapCount 运行时派生）·`:273-280`（AssessmentSection 卡内 CTA form·按钮逐字「再练这 {gapCount} 个弱项」:279·hidden focus :277）· action=`apps/web/app/interviews/actions.ts:74-103` `startFocusRetrainAction`（resume-id+focus 双头 begin·reused→既有选择面·begin 非 2xx→既有回收空壳带码回列表·零新导航模式）· 简历同场透传：contracts `InterviewView.resume_id` additive（packages/contracts/src/index.ts:76-78）+ api `interview-view.ts:24-26`（行查询原已 SELECT i.resume_id·零新查询） | ✅ |
| **R2** | focus 进题链五断点 | ① controller `interview.controller.ts:29` `@Headers('focus') focus?: string`→begin 8 参透传 :30；② service `interview.service.ts:71-85` `normalizeFocusHeader` :74 白名单归一（JSON 数组/trim/去空/逐名 ≤100/总帽 8/畸形容忍→undefined）+ `beginInterviewCore` :98 第 8 形参 + `InterviewService.begin` :379 链下传 + payload `interview.service.ts:264-266` additive（focus 仅在场写 :266·缺省零新键=现状字节）；③ db `interview-jobs.ts:167-186` `payload->>'focus'` 同门单查读出（:170）+容忍；worker `interview-consumer.ts:29-52` `parseFocusPayload`（同值域白名单·export 供 prove）+ `:392-393` 解析下传 `startAdaptiveInterview(life, role, facts, focus)`；④ lifecycle `adaptive-lifecycle.ts:236` startAdaptiveInterviewImpl 第 4 形参→`planCompetencies(…, focus)` 第 7 实参（:245）+ `makeDeps(…, focus)`（:247/:275-287 export startAdaptiveInterview 第 4 形参 :275）；⑤ prompt `packages/ai-runtime/src/prompts.ts:64-79` `'planner.competencies'` **v2→v3**（:71·注册表纪律「改 prompt=升 version」）：buildData 增「上一轮弱点标签」段（=criterion+弱点标签·fix-roadmap :97 验收原文）·system 明示「仅提示考什么·非难度信号」·**focus 缺省/空数组→段不渲染=v2 输出逐字节**（resume-grounding B1/S1-1 既有逐字节断言守卫·final 跑绿实证） | ✅ |
| **R3** | 专项面 5-8 题预算 | domain `packages/domain/src/adaptive-interview.ts:124-135` `FOCUS_SOFT_BUDGET_MIN=5`(:125)/`FOCUS_SOFT_BUDGET_MAX=8`(:127)/`derivedFocusSoftBudget`(:132·1→5 线性+帽)·`:188-196` initMind 第 4 形参 focusWeaknesses(:188·:194 派生分支)（在场且无显式 maxTurns→专项派生·显式 maxTurns 隔离 E2E 优先级不变·absoluteMaxTurns 杀开关照旧夹紧）· 接线：ai-graphs `state.ts:102-108` AdaptiveDeps.focusWeaknesses + `nodes/plan.ts:7` initMind 第 4 实参 + worker makeDeps/lifecycle 透传 · 通用 2-3 分界（derivedSoftBudget）逐字节零触 · **D2 裁决登记**：软预算上调语义（SOFT_BUDGET_RAISE_STEP）在专项模式**照旧保留**（pre-exec PASS 未载相反裁定→零改动最保守默认）· domain index.ts:169 导出 additive | ✅ |
| **R4** | 学习项「去练」真入口 | `apps/web/app/report/[id]/page.tsx:329-338` LearningSection 未完成项「去练」SubmitButton(:337·hidden focus [it.topic] :335)（`name="focus" value={JSON.stringify([it.topic])}`·复用 R1 同一 action·携同简历 resume-id）；done 项只余打卡图标（勾选主径=R5 自动回灌）；completeLearningItem 手动端点（controller :227-233）**契约原样零触·前端不接**（修法原文二径取一·自动为主·如实登记）· #214「补导航入口」面（Nav /diagnosis）：**EXEC 裁量随刀登记后继**（本刀已新增 /growth 既有面之外的两入口·导航面不扩避免越 #214 原锚范围·残余如实登记） | ✅（Nav 顺手项登记后继） |
| **R5** | 学习计划回灌 | 新件 `apps/worker/src/weakness-backfill.ts`（单源·全件 63 行）：本场 assessment_report gap 维度 × 历史 learning_plan（`interview_id <> 本场` + `interview_privacy_active` 围栏过滤·RLS+显式 owner 双层）→ `weaknessMatches` R7 终形确定性匹配 → `INSERT INTO learning_progress(… ) ON CONFLICT DO NOTHING`（幂等·只写 progress **绝不重写 learning_plan**·Ban 条款照守）· hook=`apps/worker/src/report-worker.ts:108-117`（import :13·generateGrowthChain 评估段成功后紧邻 :113·best-effort try/catch 结构化日志·**GrowthGenOutcome 形状冻结零改**·失败绝不连累成长链）· worker 读 learning_plan 零读者现状由此接通 | ✅ |
| **R6** | 弱项时间衰减 | `packages/db/src/memory/memory-store.ts:49-79` historicalWeakDimensions 固定窗 `WEAKNESS_DECAY_WINDOW_SESSIONS=5`(:53·:54 fn·export additive+db index.ts:246)：最近 N 份 ready+privacy-active 报告（created_at DESC,id DESC tiebreak 确定性）→ 窗内每维度**最新一场** gap 定去留：达标（gap=false）移出 / 未达标保留 / 窗内不再出现=衰减移出 / 冷启动零历史→空数组恒等 · 可选窗参数 additive（prove 直行使）· 固定初值**不依赖 H1 校准**（§3-1 停手条款未触发）· R4 读面过滤（interview_privacy_active）原样在位零弱化 · 只读投影形状冻结（零新表零新持久化） | ✅ |
| **R7** | 语义匹配（#203 终裁留本刀） | `apps/worker/src/adaptive-interview-service.ts:183-215`：`weaknessMatches`（`WEAKNESS_MATCH_THRESHOLD=0.5`:199·fn :201-207·biasByPastWeakness :208 只换命中判定·归一化精确相等短路恒中→relevanceScore 双向取最大≥阈值·**纯确定性禁 embedding/模型/向量召回**·memory lean MVP 注记 memory-service.ts:1-7 照守·relevanceScore :94-106 仓内先例直用）· `biasByPastWeakness` 命中判定由精确串等升级·**稳定分区/只重排/绝不注入/hint 非硬过滤/难度信心隔离逐字节原形** | ✅（分桶降级见 §3） |
| **R8** | 曲线可比 | 新件 `apps/web/lib/growth/comparable.ts`（纯函数单源 `growthDeltaComparable`/`growthDeltaView`：双分∧维度名交集非空才可比）· `apps/web/app/growth/page.tsx:15,81-87,158-164`：timeline delta 改经 growthDeltaView(:84)·不可比（双分但交集空）→ delta 不渲染改中性标注「维度口径不同 · 不可比」(:162·data-testid=delta-not-comparable·前场缺分→与现状一致不渲染)· 新-#277 验收注记=本函数即实现面锚+prove 断言族 H4-8a-d（**注记面非独立实现件·照 LEDGER :107 处置**） | ✅ |

**难度/confidence 隔离铁律（:185-186）零触实证**：prompt v3 明示非难度信号（S18）；initMind focus 只改 maxTurns（difficulty 恒 2/confidence 恒 0·P8）；biasByPastWeakness 只重排（D15-D18）；interview:prove 57 断言逐字节同一（含 bias hint 语义断言原样）。

## 3. 处方兑现 + 降级条款登记

- **处方①**（web-logic.proof :1307-1313 read-file 静态接线先例）：`apps/web/test/web-logic.proof.ts` 新增 section「H4 处方①」四断言（H4-1a 报告页 src 含再练入口+N 运行时派生 / H4-1b 接 startFocusRetrainAction / H4-1c action 携 focus 头 / H4-1d 表单 hidden focus=gap 数组）——**全绿**；同型断言另落 `apps/worker/test/weakness.proof.ts` S19-S22（双落位互为备）。
- **处方②**（LearningSection 去练同形断言）：web-logic.proof「H4 处方②」两断言（H4-2a/H4-2b）+ weakness.proof S23-S24——**全绿**。
- **处方③**（§2b.3 门禁加宽）：web prove + typecheck + interview:prove + neg:interview + growth:prove + **web-logic.proof + interviews-actions.proof 全绿零翻** + 新增 weakness:prove 73 断言亲跑 **EXIT=0 原值**——全部兑现（§0 总账）。
- **#203 终裁落卷**：R7 留本刀·确定性相似度（relevanceScore 先例）·禁 embedding。
- **降级条款登记（协调方预授权）**：R7「按岗位/简历分桶」——assessment_report 无岗位/简历列，分桶需新持久化（零迁移 Ban）→ **缩面登记**：本刀落「owner 域即桶」（RLS owner 过滤原样=租户桶·weakness.proof S34 钉登记面），岗位/简历分桶整条归后刀（code 注记 adaptive-interview-service.ts bias 注记原文）。
- **范围外零越界**：GROWTH-GEN 三面（report-worker :163 硬接线本体/growth-generation.ts/信封字节）零字节改动（growth:prove 31 断言零退化实证）；SCORE/milestoneSimulationPass/#104/#105 面零触碰；#200/#185/#259 S2a-c/#201/#202/#256 后刀未触；completeLearningItem 端点契约原样；零迁移（无新 SQL 文件）·零 secrets（.env* 零触碰）。

## 4. Ban / Pins / Non-claims 自检

- **Ban 自检**：GROWTH-GEN 三面语义零改 ✅·biasByPastWeakness 本体语义（hint/隔离）只扩匹配算法 ✅·embedding/向量召回零引入 ✅（S32 区域零 await/invoke·S33 lean 注记原样）·新信念/弱项持久化表零新建 ✅（衰减/匹配全在读投影层与消费侧）·learning_plan 一次性重写零触 ✅（S29）·硬过滤式 focus 零触 ✅（只前移/喂 planner·D18）·通用 planner 上限零触 ✅（#201 未收编）·completeLearningItem 契约原样 ✅·SSOT 状态行只做 REQUEST 本档 append-only ✅（backlog/issues-master 零触）·retry-to-green/masking 零犯（2 处断言修正=测试期望算术勘误：P3/P7 通用预算基值 6 非 7·D1 dim 字节序，非产品码改绿）✅·push 零执行 ✅·Mermaid/新框架零引入 ✅。
- **Pins 十一值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE /privacy/interview-data/:id=503 · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false（零触碰零叙事）。
- **markers=0**：新增/改动行零占位 marker token（亲 grep 改动集）。
- **est live=0**：scripted seam 沙箱域零外呼新增（weakness.proof 零 Key 零网络·隔离 PG 即用即灭·web prove 纯函数/read-file）·零模型真实调用·零生产操作。
- **Non-claims**：本刀 ≠ 偏置有效性已评估（机制在案·效果归 eval 面）；≠ 评分/级别已校准（H1/H3 域）；≠ 语义匹配模型级语义已落（R7=确定性相似度·非向量语义）；≠ 学习计划智能重写；≠ 分桶已落（降级登记后刀）；prove 绿 ≠ HA ≠ releaseEvidence；alone ≠ dual·awaiting post-prove。

## 5. 触面清单（25 改 + 3 新 = 28 文件）

改：interview.controller.ts · interview.service.ts · interview-view.ts · interviews/actions.ts · report/[id]/page.tsx · growth/page.tsx · web-logic.proof.ts · adaptive-interview-service.ts · adaptive-lifecycle.ts · interview-consumer.ts · memory-service.ts · report-worker.ts · ai-graphs state.ts/plan.ts · ai-runtime prompts.ts · contracts index.ts · db index.ts/interview-jobs.ts/memory-store.ts · domain index.ts/adaptive-interview.ts · scripts/run-e2e-isolated.mjs（weakness 目标 additive 注册·三处）· package.json/worker package.json（脚本注册）。新：weakness-backfill.ts · weakness.proof.ts · web/lib/growth/comparable.ts。收据：receipts/h4-weakness/（9 件）。

*H4 EXEC 收据 · 2026-10-11 · executed:awaiting_post_prove_dual · est live=0 · markers=0 · pins 十一值零翻转 · Ban push · alone ≠ dual*
