# G7FIX-4 — 产品面 finalize 契约增补刀（generation 族对称标记+恢复通路）

**状态**：`draft_rev3:awaiting_pre_exec_dual`（rev3 席2 自纠：:431 加宽被 0144 终端触发器逐行推翻〔binding_immutable+attempt_mutation_invalid DB 层先拦〕——改 **mark-then-recover 单触点**零 migration 真·rev2 双席处方保留〔mark-first 同事务·resume 恒等·replayed:false 修正·e2e 后验键拆出·事件分流对齐〕） · base = 主线 `c17804a5` · 分支 `line/g7fix4-contract` · 立项依据 = G7FIX-3 nail 席2 代码级闭合（generation 族 adaptive-lifecycle.ts:47-58 直发 interview_unavailable **不标 application**→finalize 409 cannot_finalize→driver 卡死面·job 失败族 consumer.ts:89-95 对称标记→finalize 200 正向可重试——两族不对称精确到行）。

## 1. 修法（产品面·零 e2e 改）
1. **generation 族对称标记**：`writeGenerationUnavailable`（adaptive-lifecycle.ts:47-58）内增 `markApplicationAssessmentUnavailable`（对齐 consumer.ts:89 先例·bound application 存在时）——**置于 failInterviewAndRelease 之后同事务同 client**（席1：i.status='failed' AND ja.status='in_progress' AND attempt 匹配才命中·'unbound' C 侧舱壁/'stale' 防 old worker 双闸原样）；使 generation 族与 job 失败族 B 端终态对称（finalize 走 assessment_unavailable 200 正向面·消卡死死路）·**对齐 consumer.ts:91-95 事件分流**（updated/replayed→assessment_unavailable·unbound→interview_unavailable——SSE/报告消费面已证两 kind 同终态零破坏〔席1 亲证 interview.controller.ts:261+interview-report.ts:24〕）；
2. **恢复通路（rev3·席2 自纠改写：mark-then-recover 单触点）**：
   a. recruiter.ts:385 放行**严格限**绑定 interview status='failed'（FOR UPDATE 行锁 :366 下验证）+ **resume 恒等镜像**（resumeId==row.resume_id·对齐 :393 assessment_unavailable 面守卫）；
   b. **同事务先 mark**（§1.1 in_progress→assessment_unavailable 合法迁移·守卫已验）→ **落回现有 :393-434 恢复通路原样行进**：:431 UPDATE 守卫 `('invited','assessment_unavailable')` **字节零改即命中**·触发器走 assessment_unavailable→in_progress 恢复形（binding_immutable 例外分支 0144:97-98 ✓·attempt+1 形 0144:114-117 ✓·:146-152 恢复守卫 ✓·:157-167 新 interview status='created' ✓）全链零拦——**零 migration 真**；
   c. mark 非 'updated'（锁下不应发生）→ binding_invalid fail-closed；
   d. **rev2 处方1b（:431 加宽）作废**——0144 §2.2 终端体（0082:29-117 逐字迁移·0144:89-91 自证）对 in_progress+failed→新 attempt UPDATE 无条件拦：check1 binding_immutable（0144:96-100）+check2 attempt_mutation_invalid（0144:110-121）——DB 层异常先于 ：435 application_start_conflict，rev2 分析停 WHERE 层少看触发器层（席2 自纠）。
3. **产品语义预审条款**：两改动均为「失败→正向可重试终态」语义（对称化非放宽·assessment_unavailable 本就是产品正向终态·席2 亲证 adaptive-lifecycle.ts:359-361 原注释「visible, retryable terminal」+额度释放退款 commerce.ts:198-206+不伪造 0 分 recruiter.ts:232）·**臂回改归属同步（G7FIX-3 §5）**：产品面落地后 G7FIX-3 driver 臂同步回改归协调方（臂形状按席2：200+assessment_unavailable+retry started 非 completed）。

## 2. prove【rev2·席2 处方2/3】
api/worker 触面 prove 键全绿或 base≡red·**新增**：
- generation 族失败后 application 状态断言（assessment_unavailable 对称标记）；
- **in_progress+failed 卡死态→startApplicationInterview 新 attempt 成功**断言（attempt+1·旧 interview 保 failed·resume 恒等——mark-then-recover 经 assessment_unavailable 恢复形·席2 rev3 去加宽措辞）；
- finalize 面断言：**200 + outcome='assessment_unavailable' + replayed:false**（recruiter.ts:205·applications.service.ts:85-89——rev1 误写 replayed:true 系 completed 面专有·席2 亲证）；
- **「driver 臂回改后 e2e:isolated 恰 1 run 绿」拆出为本刀外协调方后验键**（席2 处方3：否则恰 1 run 禁重跑与 Ban 零 e2e 改互斥卡死·generation 族间歇触发若先于臂回改即红白烧预算）·臂回改形状=**200+outcome='assessment_unavailable'+cand assessment_unavailable/score NULL+retry started 新 id**（非 completed+整数分）·attempts 全账。

## 3. Ban
零 e2e 改（driver 臂回改归协调方后续）·migrations/SSOT 零触·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual·est live ≤25。

## 4. 验收
diff 面+prove 全键+attempts+收据 `ai-docs/delivery/receipts/g7fix4-contract/`。

## 5. Non-claims
本刀 ≠ duplicate re-roll 根因刀（另立）≠ G7 收官 ≠ trio（trio 再跑另立）。
