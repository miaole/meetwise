# G7FIX-3 — finalize 409 skew 裁决刀（driver 契约缺口·材料已足）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落 mw-core · RUN 1 EXIT=0 · 四元组=(interview_unavailable,409,缺席,generation_duplicate_question) ⇒ 五桶「臂消化绿」· 收据 `ai-docs/delivery/receipts/g7fix3-finalize-skew/` · 蓝本 = REQUEST rev2 `539393c0`·原状态 `draft_rev2:awaiting_pre_exec_dual`（rev2 双席处方合并：席1 附款 409 cannot_finalize 形状双验禁泛容忍+席2 强制三处方 a4 分支选路/四元组判读/臂回改归属登记） · base = 主线 `e2834082` · 分支 `line/g7-finalize-skew` · 立项依据 = G7P-6 nail（席2 skew 读至代码行级：**worker 发射不对称**——job 失败族 consumer.ts:78-99 先标 application assessment_unavailable→finalize 200·**generation 失败族 adaptive-lifecycle.ts:46-56 直发 interview_unavailable 不标 application**→finalize 409 cannot_finalize〔recruiter.ts:186-213 not_ready→service:77〕→**driver :404 白名单仅认 assessment_unavailable·:406-407 对其余终态期待 200+completed**——两层事件：主层间歇触发+次层确定性契约缺口）。

## 1. 修法（仅 e2e/full.e2e.ts driver 面·≤12 行·零产品码）【rev2·双席处方合并】
1. **finalize 409 臂**：terminal=interview_unavailable 时**显式断言 fail-closed 形状**（fetch finalize → `status===409 && error==='cannot_finalize'` 双验·席1 附款：**禁「非 200 即过」泛容忍**）——「有限恢复」现树不存在已裁（席2：recruiter.ts:385 binding_invalid 亲证·generation 族后 retry 必 409）——**走诚实 FAIL/卡死面显式断言形态**。
2. **a4 分支选路同窗覆盖（席2 强制处方1）**：terminal=interview_unavailable 时 scorelessBound=false → 现 :421-423 else 期待 completed+整数分必红——臂须收窄 else（排除 interview_unavailable）+新 sibling 分支显式断言 **in_progress 卡死面**（application 停 in_progress+interview failed=generation 族既成事实·文档化非接纳）——否则 409 消化后仍红于 :422 且三向无桶。
3. postm7_a3 NDJSON 行增 `terminalPayload?.reason`（席2 处方·≤1 行·:405 常驻面保留）——abandoned sweep（commerce-reconcile.ts:65 同发 interview_unavailable）vs generation 族语义归因判别。
4. **产品面 finalize 契约增补（服务端 generation 族正向信号）与 transient requeue 均归协调方另裁不在本刀**。
- 7a 探针+post-M7 窗截获+NDJSON 常驻面全部保留（armed 延续）。

## 2. 验证
恰 1 run `pnpm e2e:isolated`（sidecar v3·est ≤25 含 boundLoop·链 126+≤25≤200）。**判读按四元组 (terminal,status,outcome,reason) 分类（席2 强制处方2）**：
- **真绿（无 generation 族触发）** ⇒ CMD1 收口材料完备+`:107` 材料进一步；
- **臂消化绿（409 cannot_finalize 双验过+in_progress 卡死面断言过）** ⇒ **不得作收口材料完备声称**（卡死面在账·产品面归协调方）；
- **finalize 200 但 outcome≠completed**（report_ready 面·0082 trigger 亲证另一 skew）⇒ 预存 **0082-skew 新死点**登记≠修法面错；
- **红于此窗后新死点** ⇒ armed 探针自动收材料·如实登记下一定靶；
- **红于 finalize 409 仍未消化** ⇒ 修法面错如实登记再裁。
禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零改——**服务端 finalize 契约/generation 族发射语义/worker 面**全部零触碰）·full.e2e.ts ≤12 行仅 driver 契约臂·helpers/wrapper/解析器零触碰·禁松门禁（provenance/白名单语义零弱化——本刀=driver 对既成事实的诚实预期面·非掩盖）·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤12 行亲证+恰 1 run EXIT 原值+NDJSON/sidecar 收据+**五桶四元组判读**（(terminal,status,outcome,reason) → §2 五桶词汇落账）+收据 `ai-docs/delivery/receipts/g7fix3-finalize-skew/`。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ :107 关闭 ≠ g7SuiteGreen 翻转 ≠ 产品面 finalize 契约缺陷定性（driver 契约缺口修复=使 e2e 对 generation 族终态诚实·产品面两 worker 失败族 B 端终态不对称归协调方另裁）·**臂回改归属登记（席2）：产品面修复（generation 族正向信号/requeue）落地时本臂同步回改归协调方·卡死面显式断言=文档化非接纳**。
