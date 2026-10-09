# G7FIX-4 — 产品面 finalize 契约增补刀（generation 族对称标记+恢复通路）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev2 双席处方合并：席1 mark-first 同事务+事件分流对齐+零 migration 证·席2 双触点 :385+:431 手术式+resume 恒等镜像+prove 键修正 replayed:false+e2e 后验键拆出） · base = 主线 `c17804a5` · 分支 `line/g7fix4-contract` · 立项依据 = G7FIX-3 nail 席2 代码级闭合（generation 族 adaptive-lifecycle.ts:47-58 直发 interview_unavailable **不标 application**→finalize 409 cannot_finalize→driver 卡死面·job 失败族 consumer.ts:89-95 对称标记→finalize 200 正向可重试——两族不对称精确到行）。

## 1. 修法（产品面·零 e2e 改）
1. **generation 族对称标记**：`writeGenerationUnavailable`（adaptive-lifecycle.ts:47-58）内增 `markApplicationAssessmentUnavailable`（对齐 consumer.ts:89 先例·bound application 存在时）——**置于 failInterviewAndRelease 之后同事务同 client**（席1：i.status='failed' AND ja.status='in_progress' AND attempt 匹配才命中·'unbound' C 侧舱壁/'stale' 防 old worker 双闸原样）；使 generation 族与 job 失败族 B 端终态对称（finalize 走 assessment_unavailable 200 正向面·消卡死死路）·**对齐 consumer.ts:91-95 事件分流**（updated/replayed→assessment_unavailable·unbound→interview_unavailable——SSE/报告消费面已证两 kind 同终态零破坏〔席1 亲证 interview.controller.ts:261+interview-report.ts:24〕）；
2. **恢复通路（rev2·席2 双触点手术式）**：
   a. recruiter.ts:385 放行**严格限**绑定 interview status='failed'（FOR UPDATE 行锁 :366 下验证）+ **resume 恒等镜像**（resumeId==row.resume_id·对齐 :393 assessment_unavailable 面守卫）——无条件 IN 加宽引双活禁；
   b. **:431 UPDATE 守卫同事务手术加宽**（席2 处方1 第二触点）：`status IN ('invited','assessment_unavailable')` → 加 `'in_progress'`（仅当 :385 已验 failed 时可达——禁无条件加宽防双活面试）——否则修 :385 只是把 binding_invalid 死路换成 application_start_conflict 死路（:435 throw）；
3. **产品语义预审条款**：两改动均为「失败→正向可重试终态」语义（对称化非放宽·assessment_unavailable 本就是产品正向终态·席2 亲证 adaptive-lifecycle.ts:359-361 原注释「visible, retryable terminal」+额度释放退款 commerce.ts:198-206+不伪造 0 分 recruiter.ts:232）·**臂回改归属同步（G7FIX-3 §5）**：产品面落地后 G7FIX-3 driver 臂同步回改归协调方（臂形状按席2：200+assessment_unavailable+retry started 非 completed）。

## 2. prove【rev2·席2 处方2/3】
api/worker 触面 prove 键全绿或 base≡red·**新增**：
- generation 族失败后 application 状态断言（assessment_unavailable 对称标记）；
- **in_progress+failed 卡死态→startApplicationInterview 新 attempt 成功**断言（attempt+1·旧 interview 保 failed·resume 恒等·:431 加宽面——席2 处方2 缺键补入）；
- finalize 面断言：**200 + outcome='assessment_unavailable' + replayed:false**（recruiter.ts:205·applications.service.ts:85-89——rev1 误写 replayed:true 系 completed 面专有·席2 亲证）；
- **「driver 臂回改后 e2e:isolated 恰 1 run 绿」拆出为本刀外协调方后验键**（席2 处方3：否则恰 1 run 禁重跑与 Ban 零 e2e 改互斥卡死·generation 族间歇触发若先于臂回改即红白烧预算）·臂回改形状=**200+outcome='assessment_unavailable'+cand assessment_unavailable/score NULL+retry started 新 id**（非 completed+整数分）·attempts 全账。

## 3. Ban
零 e2e 改（driver 臂回改归协调方后续）·migrations/SSOT 零触·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual·est live ≤25。

## 4. 验收
diff 面+prove 全键+attempts+收据 `ai-docs/delivery/receipts/g7fix4-contract/`。

## 5. Non-claims
本刀 ≠ duplicate re-roll 根因刀（另立）≠ G7 收官 ≠ trio（trio 再跑另立）。
