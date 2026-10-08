# G7FIX-1 — driver route_decided 轮询等待刀（G7 api 红修复）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev1 双席 FAIL 三处方：形态改判 G7U 同形 SELECT-only DB 轮询〔GET 端点不可达+直查假前提撤〕·判别读数改同 SELECT 通道·基座复原〔主线已补收 c0bd2f4d=02b34474·worktree cherry-pick 同〕·锚点 :338·四向补基座臂） · base = **主线 `02b34474`（rev2 重钉——含 G7P-4 consent 截获面补收 c0bd2f4d·fs/bootId 定义在卷·worktree 已 cherry-pick 同 commit）** · 分支 `line/g7-route-wait` · 立项依据 = G7P-5 nail 定谳（409 interview_ineligible_route=结构性时序错位：route 决策由 worker classify consumer ≈4s 排空·driver apply→start ≈1-3s 零等待·fail-closed 产品门系设计非缺陷）。

## 1. 修法（仅 e2e/full.e2e.ts driver 面·≤15 行·零产品码）【rev2·双席 FAIL 处方落实】
1. **G7U 同形 SELECT-only DB 轮询（唯一正解形态·席1/席2 双证）**：start 步（**锚 :338**——rev1 :342 系 G7P-5 as-ran 树行号漂移勘误）前插入直连 PG 轮询——runner 已注入 PG* env 契约（run-e2e-isolated.mjs :2144-2149/:2469·G7U recruiting-bound.spec.ts:88-141 同构先例协调方已授权）——`createRequire('pg')` SELECT `job_route_decision WHERE job_id=$1 AND route_outcome='route_decided'`（cap 60s/周期 1s·沿 G7U :75-76·超时诚实 FAIL）。
2. **判别读数=同一 SELECT 通道**：cap 耗尽时读 `job_semantic_revision.status` 区 **route_pending**（时序面·本刀域）vs **route_unresolved**（G7S sticky 族·转 classify 质量面另刀）——409 body 无判别字段（applications.service.ts:46-50 静态两字段·席2 亲证）删「经 409 body」旧文。
3. 基线复原授权（席1/席2 共同）：rev1 起草时主线缺 G7P-4 consent 面（26ad1b65/c0bd2f4d 非祖先）致 :338/:339/:350 fs/bootId 零定义=任何 run 必 ReferenceError——**本刀 worktree 已 cherry-pick c0bd2f4d 修复基座**（不占 15 行·独立勘误登记）+主线已同步补收（02b34474·协调方操作）。
4. 产品码/服务端门序/start 重试语义零触碰（P-API pin Ban API 内联 classify）。

## 2. 验证（两步走）
恰 1 run：`pnpm e2e:isolated`（sidecar v2·est ≤25 含 boundLoop 增量 ≈19-21 实账兑现·链累计 0+0+14+N 起算·硬帽 200）。**四向**：
- **绿（主旅程越过 start 死点推进或全程绿）** ⇒ 修复生效 ⇒ trio 再跑评估（另立 SSOT 刀）+`:107` 收口材料完备；
- **红于 start 之后新死点** ⇒ 如实登记归下一定靶刀（POST7B 窗或其他）；
- **cap 耗尽仍红于 start**：判别读数 route_pending ⇒ 诚实 FAIL 如实登记（classify 时延超 60s 罕见面）；route_unresolved ⇒ **G7S classify 质量面复发** ⇒ 转另刀；
- **截获面自伤崩溃**（ReferenceError 等基座面）⇒ 基座勘误臂（rev2 已修复基座·此臂兜残余）。
四向如实禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零改）·full.e2e.ts 改 ≤15 行且仅 start 前置段·helpers/wrapper/解析器零触碰·禁松门禁（断言终态仍 200 started）·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤15 行亲证（基座复原单独计）+恰 1 run EXIT 原值+NDJSON/sidecar 收据+判别读数+四向判读+收据 `ai-docs/delivery/receipts/g7fix1-route-wait/`。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ g7SuiteGreen 翻转 ≠ `:107` 关闭（收口材料归 SSOT 刀）≠ 产品面残余（真实用户 0-2s 窗归协调方另裁）。
