# G7FIX-1 — driver route_decided 轮询等待刀（G7 api 红修复）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `3332fd40` · 分支 `line/g7-route-wait` · 立项依据 = G7P-5 nail 定谳（409 interview_ineligible_route=结构性时序错位：route 决策由 worker classify consumer ≈4s 排空·driver apply→start ≈1-3s 零等待·fail-closed 产品门系设计非缺陷）。

## 1. 修法（仅 e2e/full.e2e.ts driver 面·≤15 行·零产品码）
1. start 步（:342 前）插入 **SELECT-only 轮询等待**：经 api 只读端点或直查不可（driver 走 HTTP）——**采用现有 GET 端点轮询**：轮询 `GET /applications/app1`（或现有 application 状态端点·EXEC 期亲选在卷）直至 route 就绪信号可见；若无线索端点，则 **start 重试形态**（409 interview_ineligible_route 时退避重试恰 ≤3 次·间隔 2s·G7U 同形 cap+超时诚实 FAIL——非松门：断言仍要求最终 200 started）。
2. **前置判别读数**：轮询期间若超 cap，记录 job_semantic_revision.status/route_outcome 判别面（经现有诊断端点或 start 409 body）——区分 pending（时序·本刀修）vs sticky route_unresolved（G7S 族·转 classify 质量面另刀）。
3. 产品码/服务端门序/start 重试语义零触碰（P-API pin Ban API 内联 classify）。

## 2. 验证（两步走）
① **driver 面修复验证**：恰 1 run `pnpm e2e:isolated`（sidecar v2·est ≤25·链累计 0+0+14+N 起算）——预期 CMD1 主旅程越过 start 断言（G7P-5 死点）向深处推进或全程绿；
② 绿向 ⇒ trio 再跑评估（另立 SSOT 刀）+`:107` 收口材料完备；红向（越过 start 后新死点）⇒ 如实登记归下一定靶刀（POST7B 窗或其他）。
恰 1 run·三向判读如实禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零改）·full.e2e.ts 改 ≤15 行且仅 start 前置段·helpers/wrapper/解析器零触碰·禁松门禁（断言终态仍 200 started）·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤15 行亲证+恰 1 run EXIT 原值+NDJSON/sidecar 收据+判别读数+三向判读+收据 `ai-docs/delivery/receipts/g7fix1-route-wait/`。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ g7SuiteGreen 翻转 ≠ `:107` 关闭（收口材料归 SSOT 刀）≠ 产品面残余（真实用户 0-2s 窗归协调方另裁）。
