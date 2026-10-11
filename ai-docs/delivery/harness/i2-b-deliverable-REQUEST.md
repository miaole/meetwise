# I2 B-DELIVERABLE — B 端最小定性交付刀（#218+#271修法④ · 批3 I2 组 · M 体量 · REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `i2-draft` · docs-only 零码动 · Ban self-approve · alone≠dual · 待预执行双审 PASS 后才派 EXEC coding）
**Date**: 2026-10-11
**审计项**: 蓝本 `batch-residual-plan.md` §三 打包表 I2 行（:108·meetwise-line-entpay 树实读）＝#218+#271修法④（M 体量·批3 残留）· 清点表 :71/#218 · 对应 LEDGER 行 :65/#218「🆕 B-DELIVERABLE 刀」+ :209 批3 3/23 残 20 在册
**Base**: `feat/mysql-schema-skeleton` @`36ded20a`（主线最新 tip·本刀工作树 tip）· 分支 `line/i2-b-deliverable`（工作树 `meetwise-i2`）· **上游在位亲证**：`git merge-base --is-ancestor 3af029a9 36ded20a` = true（I1 片3 nail `3af029a9` 已落主线）；G4 EXEC `b70d7d81`、EVIDENCE-DELIVERY EXEC `afb13fcf`/merge `eae56953`/nail `74895b7c` 同为 tip 祖先（逐一 merge-base 亲证）
**蓝本可及性注记**: issues-master.md / fix-roadmap.md / product-audit-report.md 不在本仓树（沿 G3/G4 REQUEST 同记）；本席亲读 **canonical 更正版副本** `/Users/miaole/Documents/Meetwise产品审计-更正版/`。**蓝本勘误（如实登记）**：派单指「issues-master :250 区」——实读该区（:244-256）为 P2 族 #99-#127 行，**#218 主表行实锚 :187**（另有 :104 汇总行 / :115 合并对照行）；派单引语「触发器强制 assessment_unavailable（有意：未校准分数不得成为雇佣排序信号）·候选人被引导继续岗位面试再扣费·招聘方只见 8 位 id 无定性输出」**逐字命中 `product-audit-report.md:103`**（同目录更正版·旅程表行）——两处均为亲读零漂，锚点以本注记为准。修法列亲读：issues-master :187 修法列「区分『已面完·待校准』与『失败』；正常面完的申请不再显示『继续岗位面试』（付费按 #271/D5 企业付费）；交付最小定性输出（能力画像+证据摘录，不出数字）」；#271 :190 修法④「正常面完（0082 hold）不再提供『继续岗位面试』（随 #218）；仅系统失败（evaluation_unscored，预留已释放）允许重试」；fix-roadmap :105「交付最小定性输出（每能力：证据摘录 + 强/中/弱/证据不足，不出数字，候选人同意后可见；证据依赖 #40）」+ :117 风险行「B 端定性输出仍可能被当作雇佣排序信号，必须走 0082 的 calibration release 口径并经法务确认」。全部代码锚行号以实树 @`36ded20a` 亲读为准（EXEC 立项照例重 pin）。
**Honesty**: 全部涉案码 file:line 起草席亲读 @`36ded20a`；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（W1 读侧派生+守卫零新增外呼；W2 定性投影=既有评分事实的读侧投影零模型外呼；W3 文案零外呼）。

---

## §0 立靶（三痛点逐项亲读 · 已落覆盖/残面分账 · 漂±全录）

### §0.1 痛点① assessment_unavailable 触发器面——已落覆盖 vs 残面

**已落（今日在主线·亲证）**：

| 面 | 锚 @36ded20a | 状态 |
|---|---|---|
| 0082 校准 hold 触发器本体（有意设计·未校准分数不得成为雇佣排序信号） | `packages/db/migrations/0082_b_side_score_calibration_hold.sql:9-27`（finalize_bound_job_application_on_interview_completion·in_progress→assessment_unavailable 收口）/ :60-71（状态迁移白名单）/ :97-114（completed 禁止+score 铁闸 `job_application_score_calibration_required` / `job_application_score_immutable_until_calibrated`）/ :123-126（历史清扫） | **在产·本刀零改** |
| G4 #209 空题退额（C 端空结果失败路径诚实化） | EXEC `b70d7d81`（tip 祖先亲证）·`apps/worker/src/quiz-lifecycle.ts:56`（`quiz_empty_questions`·confirm :57 前）/ `apps/worker/src/diagnosis-lifecycle.ts:58`（`diagnosis_no_grounded_finding`） | ✅已落·nail `891f8c37`（G4 REQUEST nail 节） |
| ENTPAY 片2 候选人零扣+start/begin 合一+402 分码 | `apps/api/src/modules/jobs/applications.service.ts:44-65`（S2-C4 合一·:59-61 enterprise_insufficient_balance→402 application_enterprise_pay_unavailable）·`apps/api/src/modules/interview/interview.service.ts:233,:239`（企业不足 409 分码）·`apps/web/app/jobs/actions.ts:25-30`（402 redirect 分码）·`apps/web/lib/jobs/application-start-error.ts:21-30`（『该岗位面试暂不可用，请联系招聘方』） | ✅已落（jobs/actions.ts:39-42 S2-C4 注记亲证） |
| ENTPAY 片3 招聘方卡+余额挂件+对公订单列表+修法⑥文案 | nail `3af029a9`（tip 祖先亲证）·`apps/web/app/jobs/page.tsx:156-157`（修法⑥「本场由企业支付，不消耗你的额度」逐字）·`apps/web/app/recruiter/billing/page.tsx:22-32,:177-178`（企业余额挂件 P3）·`apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx:124-130`（企业支付知情行+『企业额度不足，请充值』P1-b） | ✅已落 |

**残面（本刀靶面）**：

| 残面 | 锚 @36ded20a | 亲读实证 |
|---|---|---|
| 候选人状态文案与失败共用（审计原文第一半句仍应验） | `apps/web/app/jobs/page.tsx:28` | `assessment_unavailable: { text: '评分暂不可用（可重试）', variant: 'destructive' }`——正常面完（hold）与系统失败同标签同 variant，**无「已面完·待校准」/「失败」区分** |
| 招聘方状态文案同病 | `apps/web/lib/recruiter/surface.ts:13,:22-29` | `APPLICATION_STATUS_LABEL` assessment_unavailable='评分暂不可用'（:13）；`recruiterAssessmentLabel` 对 assessment_unavailable 恒返 '评分暂不可用'（:23）、completed='流程已结束 · 不提供数值评分'（:24）——两态无区分 |
| 重试引导无区分（修法④残面·候选人侧） | `apps/web/app/jobs/page.tsx:126-128,:141-148` | `startable = invited || in_progress || assessment_unavailable`（:128·注释 :126-127 自认「额度处理以结算事件为准」但 UI 未读该信号）→ :148 对非 invited 恒渲染『继续岗位面试』——**正常面完（hold）申请人被引导重试=修法④原文逐字应验** |
| 服务端恢复通路无 held/failed 区分 | `packages/db/src/recruiting/recruiter.ts:371,:412-417,:443-457` | `startApplicationInterview` :371 只拦申请态 completed/declined；:412-417 assessment_unavailable 面只查 resume 恒等；:443-457 恢复通路直接建 next attempt——**绑定面试 status='completed'（hold）与 'failed'（系统失败）服务端不区分·UI 拦了 API 仍在** |

### §0.2 痛点② 候选人再扣费引导——已落 vs 剩余引导面

**已落**：候选人零扣（片2 S2-C4 合一·§0.1 表）——「再扣费」主体已从候选人转企业额度；G4 #59 提交失败分码（`apps/web/lib/errors/turn-submit-error.ts` + `apps/web/components/InterviewPanel.tsx:21,:255-256` turnSubmitFeedback 接线·401 登录/409 回列表/410 引常量）——面试中失败引导面已落；企业支付知情文案（片3 修法⑥·jobs/page.tsx:156-157）已落。

**剩余引导面（本刀）**：重试入口本身。区分信号**已在库内**：
- 两终态在 worker 侧可分：`apps/worker/src/adaptive-lifecycle.ts:441-467` 三分支——:441-443 正常完成（unscored=0 且 eligible>0）→ `completeInterviewAndConfirm`+enqueueReport；:444-458 全跳/无可评分（eligible=0）→ complete+`markApplicationNoEligibleScore`（:449·已扣费结算不释放）+事件 `reason='no_eligible_scored_answer'`（:457）；:459-467 系统失败（unscored>0）→ `failInterviewAndRelease`（:463·预留已释放）+`markApplicationAssessmentUnavailable`（:464）+事件 `reason='evaluation_unscored'`（:466）。
- 申请行可派生：`job_application.interview_id` 恒指最新 attempt 绑定面试（recruiting/recruiter.ts:450-457 回写·0082:100-110 允许绑定面试 status ∈ ('failed','completed') 两源）→ **绑定面试 status='completed' ⇒ hold（不可重试）；'failed' ⇒ 系统失败（可重试·预留已释放）**。
- 契约缺位：`packages/contracts/src/index.ts:372-378` MyApplications 仅 {id,job_id,job_title,interview_id,resume_id,status,score,source}——**无终态区分字段**；`packages/db/src/recruiting/recruiter.ts:156-165` listMyApplications SQL 无 interview join 派生列。

### §0.3 痛点③ 招聘方 8 位 id 无定性输出——剩余真缺口=B 端最小定性反馈面

**现状锚 @36ded20a**（8 位 id 显示保持现状·身份显示归 I4 #223·issues-master :450）：
- 列表行：`apps/web/app/recruiter/jobs/[id]/page.tsx:79`（`c.candidate_user_id.slice(0, 8)`）+ :82（`recruiterAssessmentLabel` 一行固定文案）；talent：`apps/web/app/recruiter/talent/page.tsx:103`（同形）。
- 状态页：`apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx:109`（8 位 id）/:116-122（状态徽+评估行）/:131-138（岗位目标能力徽）/:142-152（免责卡「评分暂不可用…不是 0 分」）——**招聘方可见的定性替代输出=零**（审计原文「无任何定性替代输出 → B 端主链零产出」仍应验）。

**数据基础已在（读侧事实·零自造协议）**：
- 评分事实根：`packages/db/migrations/0100_scoring_fact_root.sql:157-186` score_card（:181 coverage 0..1·:184-186 status 含 `b_review_eligible` 终态）/ :197-209 score_card_criterion（:204-206 `disposition` 有限档位 below/meets/exceeds）——**强/中/弱档位即 disposition 三值**（0103 铁律2：below=0/meets=1/exceeds=2·`packages/db/migrations/0103_scoring_deterministic_aggregation.sql:19-21`）。
- 只读读面与角色已授：`packages/db/src/scoring/scoring-aggregation.ts:30-33`（`scoring_list_scorable_score_cards` EXECUTE 授 app_role·owner 作用域 RLS）/:52-60（ScorableScoreCardRow 含 **competency**（冻结 rubric 供给）+coverage+status）；证据形状 :23-31（ScoreEvidenceInput：criterionId+disposition+span+spanDigest——**span 为 canonical answer artifact 字节区间·DB 无明文**·0103:25-27）。
- 写侧守卫已在：`packages/db/migrations/0158_score_card_insert_guard.sql:27`（终态四值并集含 b_review_eligible）·0103:18（模型不得输出自由总分）。
- 岗位能力维度名：`job_posting.competencies`（jobs/[id]/page.tsx:17,:46-50 已在渲染）。
- **隔离墙（真缺口所在）**：score_card 族 RLS=p_owner（0100:189-190/:211-212；app_role 策略 :268-275 owner 作用域）——招聘方 principal **读不到**候选人评分事实；ai_report/assessment_report 同 p_owner（`packages/db/migrations/0001_baseline.sql:224-250,:336-359`）。**B 端定性投影读取路径不存在=本刀主体缺口**。
- 同意门基座：`consent_record`（0001:450-462）+ purpose 枚举校验（`apps/api/src/modules/privacy/privacy.controller.ts:23-26` CONSENT-MIN #82 枚举校验在位·privacy.service.ts:19/:30/:41 三入口）——「候选人同意后可见」缺 purpose 值与候选人侧触面。
- 上游解锁已闭环：🔒#40c（SCORE S2 读侧切换·batch-residual-plan :14「无」）与 🔒#271（片1-3 全落·plan :65「全链收口」）均已解除——I2 无前置锁。

**靶心一句话**：正常面完的申请顶着「评分暂不可用（可重试）」标签被引导再跑一场再扣一次企业额度；招聘方花了一场企业额度的钱只换回一个 8 位 id 和一行「不提供数值评分」——把 hold 终态拆成「已面完·待校准」（不可重试）与「面试失败」（可重试·预留已释放），并给招聘方一个**不出数字、不经同意不出摘录**的最小定性反馈面（能力维度覆盖+强/中/弱/证据不足档位）。

---

## §1 范围（三件 · EXEC 依此实现 · 待双审裁定项全列）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 待校准/失败区分+修法④（候选人侧+契约+服务端守卫）** | contracts/index.ts:372-378 · recruiting/recruiter.ts:156-165,:371,:412-417 · jobs/page.tsx:28,:126-128,:148 | ① **契约派生字段（形制裁定①·本席推荐 a）**：MyApplications 增 `terminalKind?: 'held' \| 'failed' \| null`（held=绑定面试 completed 的 hold 终态·failed=绑定面试 failed 的系统失败终态·其余 null）——**形 a**=API 派生语义字段（不透传 interview 内部态）；**形 b**=透传 `boundInterviewStatus`。② `listMyApplications`（recruiting/recruiter.ts:159-164）SQL 加 `LEFT JOIN interview i ON i.id=a.interview_id` 派生列（status 为 'completed'→held / 'failed'→failed / 其余→null·**零迁移**）。③ jobs/page.tsx:28 STATUS_LABEL 拆两态：assessment_unavailable 按 terminalKind 分流——held→『已面完 · 待校准』类 destructive→neutral 徽、failed→『面试失败 · 可重试』（**文案措辞裁定⑤**·逐字落位归 EXEC 按裁定值）。④ :128 startable 收窄：`assessment_unavailable` 分支仅 `terminalKind==='failed'` 可重试（held 不再渲染重试入口=修法④「正常面完不再提供继续岗位面试」）；:148 按钮标签对应调整。⑤ **服务端守卫（修法④服务侧·防 UI 拦 API 穿）**：recruiting/recruiter.ts:412-417 恢复通路前加绑定面试 status 校验——当前绑定面试 status='completed'（held）→ 返回新拒因（**拒因码裁定⑥**·建议 `application_held_not_retryable`·applications.service.ts:66-79 同区映射 409）；仅 'failed' 放行既有恢复形（:373-410 G7FIX-4 in_progress 面零触）。⑥ **0082 触发器/迁移零改**（§0.1 表）——区分纯读侧派生。 |
| **W2 B 端最小定性反馈面（真缺口主体）** | scoring-aggregation.ts:30-33,:52-60 · 0100:157-209 · jobs/[id]/page.tsx:79,:82 · [applicationId]/page.tsx:116-122 | ① **读取路径（形制裁定②·本席推荐 A）**：**形 A**=新受控 SECURITY DEFINER 函数（照 0159 片3 P2 首选形/0158 守卫形·expand-only 迁移）——入参 (recruiter, application_id)，函数内校验 `job_application.recruiter_user_id=$1`（租户 fail-closed·0 行即空），返回**定性列白名单**：competency、可评分卡数/总题数、criterion 档位聚合（below/meets/exceeds 计数→强/中/弱）、coverage 档位（<1 或非可评分态卡→『证据不足』）——**函数签名无任何数字分列·Ban deterministic_total/score/overall 出参**；**形 B**=完成时 worker 预投影表（新迁移+写路径）——体量+写面均大。② **API 端点**：招聘方域新增定性投影端点（recruiter.controller/service 或 jobs 域·落点 EXEC 定·沿 listJobCandidates recruiter 校验形 recruiting/recruiter.ts:172-176）——仅 application 属主招聘方可读；**候选人未同意（W3③ 门未开）→ 返回未披露态（非空壳假数据）**。③ **渲染落点（裁定③·本席推荐 A）**：**落点 A**=[applicationId]/page.tsx:119-122 评估行下新增定性区（维度名+档位徽·不出数字）+ jobs/[id]/page.tsx:82 评估列文案分流（W1 同步两态）；**落点 B**=仅状态页（列表行零触）。④ **语义红线（fix-roadmap:117 承接入 REQUEST）**：定性面仅**单申请人自身事实投影**——Ban 排序/过滤/跨申请人比较叙事；页面注记「不可用于候选人之间排序比较」（措辞裁定⑤）·证据摘录面**默认不出**（见 W3③ 门）·档位映射**沿用 rubric disposition 三值不自造档位体系**（H3 LEVEL-SCHEME 五档读面零依赖零预支）。⑤ 无评分事实可投影时（如旧 attempt 无卡）如实显示「暂无可复核的评估记录」类中性文案——**Ban 假定性输出**。 |
| **W3 候选人剩余文案/同意门** | jobs/page.tsx:28,:126-157 · privacy.controller.ts:23-26 · [applicationId]/page.tsx:142-152 | ① W1③ 两态文案在候选人侧的诚实化（held 徽下可挂一句「校准完成后与结果一起提供」类中性注记·措辞裁定⑤）；② 修法⑥ 文案（:156-157）与两态共存核对——held 态不再显示重试按钮时该知情行位置随 startable 块自然收敛（**EXEC 核对渲染条件**·零语义改动）；③ **同意门（「候选人同意后可见」）**：新 purpose 值（**命名裁定④**·建议 `b_qualitative_share`）进 privacy.controller.ts:23-26 既有枚举校验白名单（#82 CONSENT-MIN 面·零新校验协议）+候选人侧同意触面（**落点裁定④**：jobs/page.tsx 申请行 vs 报告页·本席推荐 jobs 申请行——与 W1 两态徽同区·候选人对「招聘方将看到什么」有现场语境）+招聘方侧未同意→W2② 未披露态文案；④ 招聘方免责卡（[applicationId]/page.tsx:142-152）与定性区并存核对：「评分暂不可用」行按两态分流（held→待校准语义/failed→失败语义）·「证据不够就不给分」主句零改。 |

**待双审裁定项**：①W1① 字段形制 a/b（本席推荐 a：不向 C 端透传 interview 内部态名）；②W2① 读取路径形 A/形 B（本席推荐 A：零新写路径·读活事实·Ban 面小·迁移仅一枚 DEFINER 函数 expand-only·照片3 P2 先例备零迁移降级形=应用层 owner 校验+现有 app_role owner 作用域读面拼接——降级形若采须双审确认无跨 owner 读缝）；③W2③ 渲染落点 A/B（本席推荐 A）+列表行是否含定性摘要（本席推荐列表行仅文案分流零新查询）；④W3③ 同意 purpose 命名+候选人触面落点；⑤⑤ 两态文案逐字值（候选人徽/招聘方评估列/定性区注记/拒因用户面 message）；⑥W1⑤ 拒因码命名与 HTTP 形（409 建议）。

---

## §2 非范围（全列 · 越界即废）

1. **分数信号解锁/校准发布**——score 数值、deterministicTotal、overall、coverage 数值本身对 B 端永不出（B4 终裁+SCOR 校准 release 前·fix-roadmap:117 风险行红线）；0082 触发器/迁移语义**零改**（§0.1）。
2. **排名/排序/过滤面**——talent 排序语义（recruiting/recruiter.ts:484-498 仍仅 created_at·注释 :481-483 红线在位）、跨申请人比较、按定性档位过滤/排序 UI 零触零加。
3. **#223 身份显示（8 位 id→邮箱/备注）**——归 I4 INVITE-FACE（plan :74·issues-master :450）；本刀 8 位 id 显示保持现状零改。
4. **#219/#220/#258/#197（I3 JOB-MGMT）/ #221/#222/#265（I4）**——零触；#227 start/begin 合一（片2 已落·applications.service.ts:44-65 亲证）零回归触。
5. **企业付费面（片1-3）**——commerce.ts/payment.ts/0156-0159/计费 UI（billing/page.tsx 余额挂件 :177-178 等）零触；402 分码面（application-start-error.ts:21-30）零改（W1 新拒因另行并列表·不动既有映射行）。
6. **C 端报告面**——view-model.ts:117 练习报告横幅、report 页、ai_report 内容形状（{overall,sections}·packages/ai-graphs/src/report.ts:24）零触；EVIDENCE-DELIVERY 已落面（eae56953 线·turn-annotations/AnnotationCard）零触。
7. **评分写侧与模型面**——score-writer/scoring DEFINER 写函数/0158 守卫/rubric 体系零改；本刀零模型外呼零 prompt 触。
8. **H3 LEVEL-SCHEME（#45 族五档读面）**——档位仅映射 disposition 既有三值；五档 scheme/阈值面零依赖零预支。
9. 顺带非范围：#219 后 JD 喂 planner、#256 提前结束（🔒D3）、#232 列表面（G2 已落·零回归触即可）、#259 残片（H5）。

---

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读）→ 目标 |
|---|---|---|
| C1 | `packages/contracts/src/index.ts:372-378` | MyApplications 增派生字段（裁定①形）+zod 校验；JobCandidates（:379-385）同区核对是否镜像派生（裁定③列表行择定时） |
| C2 | `packages/db/src/recruiting/recruiter.ts:156-165` | listMyApplications SQL LEFT JOIN 绑定面试派生 terminalKind（零迁移·owner 谓词零改） |
| C3 | `packages/db/src/recruiting/recruiter.ts:412-417` | 恢复通路前 held 守卫：绑定面试 status='completed' → 新拒因返回（裁定⑥）；'failed' → 既有恢复形零改；:373-410 G7FIX-4 面零触 |
| C4 | `apps/api/src/modules/jobs/applications.service.ts:66-79` | 新拒因→409 HttpException 映射（message 措辞裁定⑤·沿 :67-74 同形） |
| C5 | `apps/web/app/jobs/page.tsx:28,:126-128,:141-158` | STATUS_LABEL 两态分流；startable 收窄 held；按钮标签调整；修法⑥ 知情行渲染条件核对（零语义改） |
| C6 | `apps/web/app/recruiter/jobs/[id]/page.tsx:82` + `apps/web/lib/recruiter/surface.ts:13,:22-29` | 评估列文案按两态分流（surface 函数签名扩参或新纯函数·沿 :22-29 形）；:13 标签表拆分 |
| C7 | 新迁移（裁定②形 A）：受控 DEFINER 定性投影函数 | recruiter 属主校验+定性列白名单出参（Ban 数字分列）·expand-only·grant 仅招聘方读面所需 role·照 0159/0041:107-120 受控形+审计注记 |
| C8 | `apps/api/src/modules/recruiter/*`（或 jobs 域·EXEC 定） | 定性投影端点：属主校验+同意门检查（W3③）+契约 zod（定性-only 形） |
| C9 | `apps/web/app/recruiter/jobs/[id]/applications/[applicationId]/page.tsx:116-152` | 评估行分流+定性区（维度名+档位徽·无同意→未披露态中性文案）；免责卡 :142-152 主句零改分流注记 |
| C10 | `apps/api/src/modules/privacy/privacy.controller.ts:23-26`（+候选人触面 C11） | purpose 白名单增新值（裁定④·#82 枚举校验面扩展·零新协议） |
| C11 | 候选人同意触面（裁定④落点）：`apps/web/app/jobs/page.tsx` 申请行区（推荐） | 同意/撤回开关（沿 privacy 三入口 :18/:26/:33 API）+「招聘方将看到什么」现场语境文案（措辞裁定⑤） |
| C12 | 测试面（沿各仓既有 prove 矩阵实况落位） | web-logic.proof：两态徽/startable 收窄/拒因文案断言；api neg：held start 拒因+定性端点越权（非属主 recruiter/未同意态/他人 application）负路径；db 隔离环：DEFINER 函数属主校验+出参白名单（无数字列断言）+held/failed 派生 SQL 分支 |

---

## §4 prove 判据（EXEC 必须全过 · 全部注入式确定性 · 不碰真网络真模型）

1. **W1 派生**：隔离库三形状断言——绑定面试 completed→held / failed→failed / 进行中→null（C2 SQL·含 attempt+1 恢复后再 hold 的最新绑定口径）；held start → 新拒因 409（C3/C4）；failed start → 既有恢复通路零回归（G7FIX-4 面复跑绿）。
2. **W2 定性投影**：DEFINER 函数断言（隔离库）——属主命中/非属主 0 行/出参列白名单（**无 deterministic_total/score/overall 列**·结构性断言非仅值断言）；档位聚合 below/meets/exceeds→强/中/弱映射逐值；非可评分卡/coverage<1→『证据不足』；未同意→未披露态。API 端点 neg：越权 recruiter/他人 application/未同意三负路径。
3. **W1/W3 前端**：web-logic.proof 新 section——两态徽文案+startable 收窄（held 无重试入口·failed 有）+拒因渲染+同意触面接线（静态接线断言·沿 G4 §4.2 rev2「纯函数输出+read-file 静态」形·无 DOM 载体面如实记账）。
4. **零回归**：`pnpm --filter @meetwise/web prove`+typecheck 零新增错（基线以 EXEC 时实树为准·G4 后 309/0 在册）；api/db/worker 涉面测试如实列跑/未跑账；0082 触发器行为零改断言（既有 db prove 面复跑绿）。
5. 全部收据（EXIT、PASS/FAIL 计数、基线对照、attempts 全账 Ban retry-to-green）入 EXEC 记账+receipts；锚漂移表照 G4 rev2 例（本 REQUEST 锚 @36ded20a·EXEC 时实树重 pin）。

---

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 任何数字评分出参/渲染**（deterministic_total/score/overall/coverage 数值·W2① 白名单外零列）· **Ban 排序/过滤/跨申请人比较用途与叙事**（fix-roadmap:117·含 talent 排序语义触碰）· **Ban 0082 触发器/迁移语义改动**（区分=读侧派生·触发器文件零字节改）· **Ban 新申请状态值**（assessment_unavailable 语义零改·无新 status 枚举）· **Ban 自造档位体系**（仅 rubric disposition 三值映射·H3 五档零预支）· **Ban 假定性输出**（无评分事实→中性未披露态·非空档位假数据）· **Ban 同意门旁路**（未同意→不投影·Ban「列表行可见即视为同意」类推定）· **Ban 身份显示越界**（8 位 id→邮箱/备注归 I4）· **Ban 企业付费/扣费协议触碰**（commerce/payment/0156-0159 零字节）· **Ban C 端报告/横幅面触碰**（view-model/report 页/ai_report 形状）· **Ban 既有 402 分码面改动**（application-start-error.ts 既有行零改·新拒因并列表）· Ban 评分写侧/模型/prompt 零触发 · Ban secrets/Key 入库 · Ban SSOT 无关触碰。

---

## §6 pins（十一值照抄 b271 总档 §6 · 零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503（interview-data 面仍 503 关闭·UNSTUB-ERASE supersession 现值照抄：简历/账户轨=202 软删受理·purgePending=true 恒真直至 S2 逐 sink 回执·物理清除完成禁宣称·原值行代码块内零改）· `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型新增外呼·W2 读侧投影零消耗·est live=0）

---

## §7 Non-claims

本刀 ≠ 分数解锁/校准发布承诺（held 语义=「校准完成后与结果一起提供」类·非时间承诺）≠ 定性面可用于招聘决策的背书（单申请人事实投影·页面明示不可排序比较·法务复核保留 per fix-roadmap:117）≠ 证据摘录默认可见（摘录面=同意门后·本刀仅预留门与未披露态·摘录渲染面若双审裁入则按裁定值·默认不出）≠ 全 B 端产品化（内部预览标注 :15/:45 保留·更新归后续）≠「重试必成功」承诺 ≠ 0082 语义变更 · prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）· est live=0。

---

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。**待双审裁定项**：①W1① 字段形制 a/b（推荐 a）；②W2① 读取路径形 A/B（推荐 A·附零迁移降级形待确认无跨 owner 读缝）；③W2③ 渲染落点 A/B+列表行是否含（推荐 A+列表仅文案分流）；④W3③ 同意 purpose 命名+候选人触面落点（推荐 jobs 申请行区）；⑤两态文案逐字值（候选人徽/招聘方评估列/定性注记/拒因 message）；⑥W1⑤ 拒因码命名与 HTTP 形（推荐 `application_held_not_retryable`·409）。**同域排程注记**：I3 JOB-MGMT（#219 族·recruiter.service/jobs 页域）与 I4 INVITE-FACE（#221 族·同 recruiter 域）与本刀可能并发触同文件——行号以 EXEC 时实树重 pin 为准；jobs/page.tsx 与 W3③ 触面若 G3 后继刀并发照 G4 例登记零重叠。任何越 §2 非范围冲动=停手上报，不借机修。

---

*I2 B-DELIVERABLE REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base 主线 `feat/mysql-schema-skeleton` @`36ded20a` · 分支 `line/i2-b-deliverable`（工作树 `meetwise-i2`）· 依据=batch-residual-plan.md I2 行（:108）+清点表 :71 + 更正版 issues-master :187 主行/:190 #271修法④ + product-audit-report.md:103 引语 + fix-roadmap :105/:117 + LEDGER :65/:209 · 实树 @36ded20a 全锚亲证（含已落覆盖面 G4 b70d7d81/EVIDENCE eae56953/ENTPAY 片3 3af029a9 ancestor 亲证）· pins 十一值照抄零翻转 · est live=0 · Dual PASS ≠ 开工 · Ban self-approve · ⛔push*
