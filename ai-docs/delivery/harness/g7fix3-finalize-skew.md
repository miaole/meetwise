# G7FIX-3 — finalize 409 skew 裁决刀（driver 契约缺口·材料已足）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `e2834082` · 分支 `line/g7-finalize-skew` · 立项依据 = G7P-6 nail（席2 skew 读至代码行级：**worker 发射不对称**——job 失败族 consumer.ts:78-99 先标 application assessment_unavailable→finalize 200·**generation 失败族 adaptive-lifecycle.ts:46-56 直发 interview_unavailable 不标 application**→finalize 409 cannot_finalize〔recruiter.ts:186-213 not_ready→service:77〕→**driver :404 白名单仅认 assessment_unavailable·:406-407 对其余终态期待 200+completed**——两层事件：主层间歇触发+次层确定性契约缺口）。

## 1. 修法（仅 e2e/full.e2e.ts driver 面·≤12 行·零产品码）
driver :404 scorelessBound 判定旁增 **interview_unavailable 臂**：terminal=interview_unavailable 时按「generation 族失败」预期面处理（不期待 200+completed）——镜像 ：416-420 start 重试恢复臂形态（挂新 interview_unavailable 分支内：诚实 FAIL 或有限恢复·EXEC 期按现树 finalize 语义亲测定型·双审裁）；**产品面 finalize 契约增补（服务端 generation 族正向信号）与 transient requeue 均归协调方另裁不在本刀**。
- 7a 探针+post-M7 窗截获+NDJSON 常驻面全部保留（armed 延续）。

## 2. 验证
恰 1 run `pnpm e2e:isolated`（sidecar v3·est ≤25 含 boundLoop·链 126+≤25 ≤200）：三向——**绿全程** ⇒ CMD1 收口材料完备+`:107` 材料再进一步；**红于此窗后新死点** ⇒ 如实登记下一定靶（armed 探针自动收材料）；**红于 finalize 409 仍未消化** ⇒ 修法面错如实登记再裁。禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零改——**服务端 finalize 契约/generation 族发射语义/worker 面**全部零触碰）·full.e2e.ts ≤12 行仅 driver 契约臂·helpers/wrapper/解析器零触碰·禁松门禁（provenance/白名单语义零弱化——本刀=driver 对既成事实的诚实预期面·非掩盖）·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤12 行亲证+恰 1 run EXIT 原值+NDJSON/sidecar 收据+三向判读+收据 `ai-docs/delivery/receipts/g7fix3-finalize-skew/`。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ :107 关闭 ≠ g7SuiteGreen 翻转 ≠ 产品面 finalize 契约缺陷定性（driver 契约缺口修复=使 e2e 对 generation 族终态诚实·产品面两 worker 失败族 B 端终态不对称归协调方另裁）。
