# G7P-6 — 7a 间歇定靶刀（fail-interview last_error 一次定谳）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev1 席1 FAIL 三处方：stream_key 代 interview_id+reason 代 error+ORDER BY seq DESC+diag try/catch 防自伤） · base = 主线 `02d35a01` · 分支 `line/g7-7a-diag` · 立项依据 = G7TRIO nail（CMD1 红=步 7a fail-interview 一击终态·interview-consumer.ts:93/:384·候选谱=单发模型外发瞬时错误>resume reference gate 误阴>fence_lost>role_route·席2 处方：红 run exit 前补抓 interview_job last_error 一次定谳）。

## 1. 手段（仅 full.e2e.ts driver 面·≤10 行·零产品码）
步 7a 兜底段（:236 era failLoop 面·现树锚亲测）红时（terminal=interview_unavailable 且 failIv 在手）exit 前补抓：直连 PG（G7FIX-1 同 createRequire pg 契约复用）【rev2·席1 三处方落实】：
1. `SELECT status, attempts, last_error FROM interview_job WHERE interview_id=$1 ORDER BY seq DESC`（failed 行置前）；
2. `SELECT kind, payload->>'reason' AS reason FROM interview_event WHERE stream_key=$1 ORDER BY seq DESC LIMIT 5`（**stream_key 代 interview_id**——interview_event 无 interview_id 列〔0001:38-46·键=stream_key〕·**reason 代 error**〔终态 payload 键=reason/provenance·interview-consumer.ts:93〕）；
3. 补抓段整体 try/catch——diag_failed 亦如实落盘（防补抓自身异常改写红面 class 污染 ledger）。任一红 run 即定谳 last_error。
- 附评估项（不落码）：transient 模型类错误 job 级 requeue 评估意见入收据（一击终态=间歇红结构放大器·产品面归协调方另裁）。

## 2. 判读（last_error 驱动）
- `model_*`/timeout 类 ⇒ 单发瞬时错误 ⇒ 修复刀=requeue 语义（产品面另裁）或 driver 容忍重试；
- `resume_reference`/`resume_reference_gate` ⇒ gate 误阴 ⇒ 定靶 gate 判定；
- `fence_lost` ⇒ 双中面；`role_route` ⇒ fail-closed 面；其他 ⇒ 如实登记。
恰 1 run（pnpm e2e:isolated）·三向（红+last_error 到手定谳/绿=间歇未现如实登记再跑预算·沿恰一次纪律需预注册：本刀允许至多 3 run 内 1 红即收〔间歇面特例·预注册〕/全绿 3 run=间歇未现登记）。

## 3. Ban
零产品码·≤10 行仅 7a 红时补抓段·Key name-only·est live ≤25/run·链累计 107+·硬帽 200·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤10 行+run 收据（EXIT+NDJSON+last_error 定谳或全绿登记）+收据 `ai-docs/delivery/receipts/g7p6-7a-diag/`。

## 5. Non-claims
本刀 ≠ 修复 ≠ 7A-DOWNGRADE 关行（定谳材料归其修复刀）≠ trio 收官。
