# G7FIX-4 — 产品面 finalize 契约增补刀（generation 族对称标记+恢复通路）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `c17804a5` · 分支 `line/g7fix4-contract` · 立项依据 = G7FIX-3 nail 席2 代码级闭合（generation 族 adaptive-lifecycle.ts:47-58 直发 interview_unavailable **不标 application**→finalize 409 cannot_finalize→driver 卡死面·job 失败族 consumer.ts:89-95 对称标记→finalize 200 正向可重试——两族不对称精确到行）。

## 1. 修法（产品面·零 e2e 改）
1. **generation 族对称标记**：`writeGenerationUnavailable`（adaptive-lifecycle.ts:47-58）内增 `markApplicationAssessmentUnavailable`（对齐 consumer.ts:89 先例·bound application 存在时）——使 generation 族与 job 失败族 B 端终态对称（finalize 走 replayed 200 正向面·消卡死死路 recruiter.ts:385 binding_invalid）；
2. **startApplicationInterview 恢复通路**：recruiter.ts:385 binding_invalid 死路放行 in_progress+failed 组合新 attempt（消整族卡死面·含 provider_timeout 等其余 errorCode）；
3. **产品语义预审条款**：两改动均为「失败→正向可重试终态」语义（对称化非放宽·assessment_unavailable 本就是产品正向终态）·e2e driver 臂回改归属同步（G7FIX-3 臂在产品面落地后回改归协调方）。

## 2. prove
api/worker 触面 prove 键全绿或 base≡red·**新增**：generation 族失败后 application 状态断言（assessment_unavailable 对称标记）+finalize 200 replayed+driver 臂回改后 e2e:isolated 恰 1 run 绿·attempts 全账。

## 3. Ban
零 e2e 改（driver 臂回改归协调方后续）·migrations/SSOT 零触·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual·est live ≤25。

## 4. 验收
diff 面+prove 全键+attempts+收据 `ai-docs/delivery/receipts/g7fix4-contract/`。

## 5. Non-claims
本刀 ≠ duplicate re-roll 根因刀（另立）≠ G7 收官 ≠ trio（trio 再跑另立）。
