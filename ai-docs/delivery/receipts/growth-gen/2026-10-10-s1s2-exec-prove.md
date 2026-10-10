# #204 GROWTH-GEN · S1+S2 EXEC 收据 — 成长链自动生成刀（断链→通）

- 席位：mw-core EXEC（`mw-grow201-exec`）· 2026-10-10
- 工作树：`/Users/miaole/Desktop/golucky/meetwise-line-grow201`（branch `line/growth-gen`）
- 唯一蓝本：`ai-docs/delivery/harness/growth-gen-REQUEST.md`（原基线 tip `9da7ec79` rev2 勘误后）+ 预执行双审 BOTH PASS 裁定（协调方 EXEC 授权转达）：**D1=形 A**（tx2 后紧邻事务·尽力而为·ms 竞态登记接受）· **D2=a 落 @meetwise/db**（domain 仅纯派生）· **D3=worker 单事务 upsert+API 零触+观测分叉登记**。
- **EXEC 期交叠兑现（SOP 交叠规则·本刀=后落者）**：本刀开工时（首 fetch）`origin/line/extrev-score-writer` tip=`8e9ee663`（S1 nail·零 S2 面·`git diff` 亲证 interview-assessment.ts 零改动）→ EXEC 中段该分支前移至 **`19ddcbb4`（SCORE S2 EXEC @11:08 先落）**，协调方 rebase 警示移交（三面：①核心聚合器符号必须换 `deriveScoreCardAssessmentLegacy` ②REQUEST 引 `deriveScoreCardAssessment` 名不符实·拾取 Legacy 形 ③rebase 到其上续 EXEC）。处置：WIP 快照 `6af6946d` 后 **rebase 到 `19ddcbb4`**（15 个 docs/chore 提交干净重放·EXEC 提交 2 文件冲突人工解决），S2 的 #103 聚合器切换承继进本刀共享核心（见 §1）。REQUEST §0③ 交叠条款（后落者 rebase+互引先刀 commit）以此兑现：**先刀 commit=19ddcbb4（互引在案）**。
- 范围：REQUEST §1.S1（触发链主体）+ §1.S2（弱项偏置验证·零代码预期兑现）+ 新-#275 文案。**零迁移**（形 A 三表现有 UNIQUE 兜底）· **零 G7 面**· **零 SSOT 编辑**· **est live=0**（scripted seam·derive 全纯函数·`actualSpendCny=null`·0 Key 值接触）。

## 0. prove 原值（CMD+EXIT·全部在卷日志 `logs/`）

| 键 | CMD | EXIT | 判读 |
|---|---|---|---|
| 主证 | `pnpm interview:prove` | **0**（54 PASS / 0 FAIL） | S2 基线 33 断言 + 本刀 ③a 新增 21 断言全绿；SCORE 域 ①-③ 断言零改动（对 19ddcbb4 的删除面=2 行 import 合并·断言体零触碰亲证） |
| 信封守卫 | `pnpm neg:interview` | **0**（97 条负路径全绿） | **D2 收据补引（双审裁定）**：`neg-interview.proof.ts:384-389` assessment 409 `no_scorable_cards` 族 + `:408-411` learning 409 `assessment_required` + `:420-423` career 409——薄委托后 HTTP 信封字节原样亲证 |
| 辅证 | `pnpm typecheck`（=tsconfig.e2e） | **0** | 仓内既有键；另三包整包 `tsc --noEmit` 对本刀触碰文件零报错（包内其余既有误差文件与本刀零交集·pristine 同形） |
| 回归 spot-check | `pnpm report:prove` | **0** | 报告舱壁（drainReportsOnce 其他调用方）不受 growth 钩子连累 |
| 回归 spot-check | `pnpm adaptive-life:prove` | **0** | adaptive-interview-service.ts（export 关键字面）+ lifecycle 投影面零回归 |

**prove 迭代披露（禁 retry-to-green 核查）**：interview:prove 共 4 跑——①pre-rebase 基线 1 跑红（**rebase 前血统的 adaptive-lifecycle.ts 重复 import=模块加载即死**：`buildAdaptiveDeps` 双声明 SyntaxError·git 亲证该重复 import 在 rebase 前基线树原生存在（resume-grounding 202b6c1a 与 S1 再落 5dba00a2 两行 import 并存）·S2 分支 19ddcbb4 已修——rebase 本身即修复·零生产码额外改动）；②post-rebase 1 跑断言全 PASS 但 receipt 面被拒（本刀扩 sources 表至 34 条>32 上限·`local_isolated_receipt_source_paths_invalid`·纯收据面·删 2 条非核心路径后过）；③最终绿 1 跑；④EXIT 确认 1 跑（③已绿·④为显式 EXIT 捕获确认跑·非 retry-to-green）。typecheck/report/adaptive/neg 各 1 跑绿（日志在卷）。

## 1. D1/D2/D3 落位证据（逐函数 file:line）

| 裁定 | 落位 | 证据 |
|---|---|---|
| **D1 形 A** | `apps/worker/src/report-worker.ts`：`drainReportsOnce` tx2（`markReportReady`+`report_ready` 事件+通知）提交后、返回 `'ready'` 前硬接线 `generateGrowthChain(pool, owner, claim.interviewId, deps.growthFaults)`——**生产默认依赖非可选开关**（审计教训「机制必须真被调度」兑现：主证 ③/③a 段生产 deps drain 亲证钩子真跑）；`growthFaults` 仅 prove 故障注入 seam（沿 `privacyCheck` 可选 seam 先例·文档明示生产恒不提供） | report-worker.ts:31（deps 契约）· :48-77（GrowthGenOutcome/GrowthSegment 型）· :85-152（generateGrowthChain 本体）· :156-166（tx2 后接线+degraded 结构化日志） |
| **D1 尽力而为+计数** | 逐段独立事务 try/catch：失败→`growth_gen_<segment>_failed` 错误日志+`failedCount++`；评估失败→学习/职业无源跳过（学习失败不阻断职业——职业只依赖评估）；零卡→`assessment='skipped'` 空集跳过（非失败）；隐私围栏→`fencedSkipped=true` 整链跳过（fence 先赢·与写卡步 D3 fence 序同语义）；**异常绝不上抛**（drain 结果不受影响·report:prove 回归亲证）；drain 侧 `growth_gen_degraded` 聚合计数日志 | prove 主证日志内 `growth_gen_career_failed ... injected_career_failure` + `growth_gen_degraded {"assessment":"generated","learning":"generated","career":"failed","fencedSkipped":false,"failedCount":1}` 原值在卷 |
| **D1 ms 竞态+crash 窗口（裁定接受·登记）** | `report_ready` 事件在 tx2 内先于 growth 落库——SSE 客户端收事件即取数可能 ms 级先见区块暂缺、刷新后可见（报告主体已在·非死胡同）；crash 窗口（tx2 提交后生成完成前进程死）→ 三区块暂缺·无自动重试·POST 三端点保留为手动补口；报告重试后再 ready 时钩子自然再跑·UNIQUE 幂等键兜底零重复（§2 非范围 #229 不碰） | report-worker.ts:79-84 注释钉死·本节收据登记 |
| **D2 a 共享单源** | 新文件 `packages/db/src/growth-generation.ts`：`generateAssessmentReportCore`（读卡→**deriveScoreCardAssessmentLegacy**→upsert·协调方警示①兑现：S2 #103 切换承继进核心·生产面（API+worker）零 legacy 聚合器调用·S2 rg 门语义承继且更严）/ `generateLearningPlanCore` / `generateCareerPathCore`——纯派生全在 `@meetwise/domain`（learning.ts/career.ts/scoring-honesty.ts 零改动）；错误语义 plain `{code}`；幂等=三表现有 `UNIQUE(owner_user_id,interview_id)` ON CONFLICT `version+1`（0001 baseline 三表 DDL 亲读·与 `uq_report_interview` 同键域对齐·roadmap:76 风险注记兑现）。导出面 `packages/db/src/index.ts` | growth-generation.ts 全文（89 行）·index.ts 再导出块 |
| **D2 a API 薄委托（信封字节原样）** | `interview-assessment.ts` `generateAssessmentFor`→薄委托核心+catch 映射（`not_found_or_forbidden`→404 / `no_scorable_cards`+`score_aggregate_empty`→409 原信封）；`interview-learning.ts` `generateLearningPlanFor`→薄委托+`assessment_required`→409。事务形状原样（单 asPrincipal 包核心）。**信封守卫=neg:interview 97 条全绿**（§0 补引 :384-389/:408-411/:420-423 亲证在卷） | 两文件薄委托体+头注（含 #103 rebase 承继注记） |
| **D3 worker 单事务 upsert（#187 简化裁定）** | 职业段=核心内单事务「读评估→requireTrustedPracticeOverall→deriveCareerPath→upsert」；**不复制** API 侧 AiGraphRun 状态机（interview.service.ts:661-732 **API 零触**·对外契约冻结注释原样）；`ai_graph_run(career-path)` 观测面分叉如实登记：该表行仅在 API 路径产生·worker 自动路径不产生（观测面非读面·career_path 表唯一读真相） | growth-generation.ts `generateCareerPathCore` + 头注分叉声明 |
| **席2 注记①（advisory lock 分叉登记）** | API career 状态机用 `pg_advisory_xact_lock`+lease 三事务串行化；worker 单事务 upsert 无状态机即无 advisory lock 面（UNIQUE upsert 幂等兜底）——**API-vs-worker 锁形分叉如实登记**（收据面·非缺陷：两路对 career_path 的并发终值由 ON CONFLICT 收敛） | 本节登记 |
| **席2 注记②（幂等主形=直接重放钩子）** | prove 幂等断言以 `generateGrowthChain` 导出直调重放为主形（非再 drain——报告已终态无可领 job·再 enqueue 属 #229 面）；三表行数各=1·`version+1`·零重复 | interview.proof.ts ③a「幂等」断言（PASS 在卷） |
| **S2 弱项偏置验证（零代码兑现）** | prove 断言链：`historicalWeakDimensions(c, OWNER)` 含「高并发」（此前恒空→偏置恒 no-op 的断链根因解除）→ `biasByPastWeakness`（**生产函数直行使**）弱项稳定前移·非弱项原序。**出题偏置逻辑本体零改动**：仅加 `export` 关键字（函数体逐字节原样·行内注记 prove 可见性目的） | adaptive-interview-service.ts:189（export）·prove「S2 断链根因解除」「弱项偏置非 no-op」两断言 PASS |
| **#275 文案** | `apps/web/app/growth/page.tsx:67`「完成模拟面试并生成评估,即可开始记录能力演进。」→「完成模拟面试后,系统会自动生成评估并记录能力演进。」（自动语义·一行·本刀唯一 web 改动） | page.tsx:67 |
| **prove 面** | `interview.proof.ts` 新增 ③a 段（21 断言）：IID3 定向 fixture（ledger 家族·两题 v6 档位 below→卡总分 [0,0]→维度 0<GAP=60 gap=true·对照 ③ IID2 [50,0,100,100] 均分 63 不 gap——**hint 钉死产出 gap 维度**经 S2 rebase 适配为 band=below 直供档位同语义）→ 生产 deps drain → 三区块非空（assessment ready+dimensions+overall=0 / learning topic+priority=high / career junior+补短板里程碑含弱项）→ 零卡空集跳过直行使 → /growth 出点（profile.growth 同一 SQL 谓词→toGrowthRow+deriveGrowth 同源·两点在曲线）→ Dashboard avg 非 null（辅）→ 弱项链两断言 → 幂等主形 → IID4 故障注入（drain 带 `growthFaults={career}` → 报告仍 ready·评估+学习在·职业缺位·failedCount=1·无上抛）。**SCORE 域 ①-③ 断言零改动**；③a 的 drain 用 ③ 段同款 `realLoadSummary`（承 S2 去桩纪律·不另立桩） | interview.proof.ts:363-530（③a 段）+ sources 表扩 7 条（receipt 32 上限内） |

## 2. 停止条件核查（五条全未命中）

- (a) **实树 vs D 段锚点**：蓝本 §3 九行锚点逐一亲读对形（report-worker.ts:53-59 挂点/interview-assessment.ts/interview-learning.ts/interview.service.ts:667-683/scoring-aggregation 读面/learning.ts/career.ts/0001 三 UNIQUE/memory-store.ts:49-58/adaptive-interview-service.ts:187-192/growth/page.tsx:67）。**唯一形状漂移=SCORE S2 @19ddcbb4 先落**（§0 交叠处置：rebase 承继+符号拾取 `deriveScoreCardAssessmentLegacy`——协调方警示①②兑现·非锚点不符）。
- (b) **prove 红**：主证/信封/辅证/spot-check 全绿 EXIT=0；迭代披露 §0（4 跑全登记·红仅①rebase 前血统模块加载死（rebase 即修）②receipt 32 上限收据面（本刀 sources 扩条所致·删 2 条后过）·非断言面零 retry-to-green）。
- (c) **SCORE S2 面零触**：对 19ddcbb4 的 interview.proof.ts 删除面仅 2 行 import 合并（断言体零触碰）；prompts/EvalSchema v6/evaluate 侧/score-writer 供源/report 读侧零改；:316 桩（S2 已废）未复活——③a 用 realLoadSummary 同款。
- (d) **迁移零**：`git status` migrations 目录零改动（0152-0154 为本支血统既有·非本刀）；形 A 幂等全靠既有 UNIQUE。
- (e) **live 外呼零**：est live=0（scriptedModelClient·derive 纯函数·直连隔离 db）；`actualSpendCny=null`·0 Key 值接触。

## 3. 残余登记（append-only·非本刀义务）

- **明文 /turn 过渡窗**（0126 围栏·INT-TRANSCRIPT-01 六门）：图家族结构性零卡→报告 fail-closed failed（S2 ③ 亲证）→growth 钩子不达；家族合流后链路自动贯通（承 S1/S2 形状·非本刀回归）。
- **crash 窗口残留**：tx2 后进程死→三区块暂缺无自动重试（POST 手动补口在·UNIQUE 幂等兜底）——尽力而为≠保证（Non-claims 钉死）。
- `fencedSkipped` 路径（隐私围栏竞态整链跳过）代码在案+计数在案·prove 未设围栏面试专项断言（assertInterviewPrivacyActive 原语已有 S1 前证明面；围栏竞态窗口极窄）。
- 存量面试不追溯生成（钩子只在报告 ready 时触发；历史报告无卡/无报告面不动）。
- worker 侧 career `ai_graph_run` 观测分叉（§1 D3 登记）与 API-vs-worker advisory lock 形分叉（席2 注记①）——归 5E 批量清理裁量。
- S2 post-prove 双审在飞（其分支 tip=19ddcbb4 `executed_s2:awaiting_post_prove_dual`）——若其双审产出 S2 勘误触及 interview-assessment.ts/聚合器符号，nail 序内本刀跟随（后落者义务已在案）。

## 4. Pins（十一值照抄·本刀不改口）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector·禁 MySQL/Qdrant 业务切流叙事）· 公开 DELETE /privacy/interview-data/:id=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · r1Closed=false

## 5. Non-claims

本刀 ≠ 成长链产品闭环（弱项衰减 #206/学习回灌 #205/#252/入口 #214 归 WEAKNESS-LOOP）；≠ 三区块保证（尽力而为：生成失败/crash 窗口→区块暂缺·POST 补口仍在·报告不受连累）；≠ #40 E2E（明文 /turn 家族供卡归 SCORE 域·0126 面）；≠ 评分质量/校准已证；三区块非空断言过 ≠ UC-E2E-004 covered；E2E 绿 ≠ HA ≠ releaseEvidence；S2 偏置验证过 ≠ 偏置有效性已评估；本刀 rebase 承继 S2 EXEC 形状 ≠ S2 post-prove 双审已过（其在飞）。

---
*S1+S2 收据 · #204 GROWTH-GEN · mw-grow201-exec · 2026-10-10 · est live=0 · 零迁移 · 后落者 rebase onto 19ddcbb4 · STOP（awaiting post-prove dual）*
