# G7FIX-5 — driver 臂回改刀（G7FIX-4 产品面落地后的 e2e 契约对齐）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 tip · 分支 `line/g7fix5-arm-rework` · 立项依据 = G7FIX-4 nail（产品面 finalize 契约增补落地·generation 族对称标记+mark-then-recover 恢复通路·G7FIX-3 driver 409 臂必然转红——产品面已改为 200+assessment_unavailable 正向面）+ G7FIX-4 post-dual 席2 trio 就绪度终评（臂回改=唯一 trio 阻塞·形状已由 prove 钉死·改动极小）。

## 1. 修法（仅 e2e/full.e2e.ts driver 臂·≤8 行·零产品码）
G7FIX-3 臂（:406-:408 409/interview_unavailable 旧形）回改为：
- interview_unavailable 终态 → finalize 期待 **200 + outcome='assessment_unavailable' + replayed:false**（recruiter.ts:205·applications.service.ts:85-89·G7FIX-4 prove 钉死形状）；
- cand 断言 **assessment_unavailable + score NULL**（非 in_progress 卡死——产品面已对称标记为正向可重试终态）；
- **retry started 新 id 断言保留**（镜像 :416-424 scorelessBound 臂·resume 恒等·attempt+1——恢复通路 mark-then-recover 后走 :393-434 既有通路）。
- 7a 探针+post-M7 窗截获+NDJSON 常驻面全部保留（armed 延续）。

## 2. 验证
恰 1 run `pnpm e2e:isolated`（sidecar v3·est ≤25 含 boundLoop 全程·链 145+≤25≤200）：三向——**绿全程** ⇒ CMD1 收口材料完备+`:107` 材料进一步+trio 全景重跑就绪；**红于后续新死点** ⇒ armed 探针收材料·如实登记下一定靶；**红于此臂** ⇒ 修法面错再裁。禁洗绿禁重跑至绿。

## 3. Ban
零产品码（apps/packages src 零 diff——G7FIX-4 产品面已落主线·本刀纯 driver 契约对齐）·full.e2e.ts ≤8 行仅 driver 臂段·helpers/wrapper/解析器零触碰·禁松 provenance 门·7a 探针/post-M7 窗/NDJSON 常驻全保留·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤8 行亲证+恰 1 run EXIT 原值+NDJSON/sidecar 收据+三向判读+收据 `ai-docs/delivery/receipts/g7fix5-arm-rework/`。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ :107 关闭 ≠ g7SuiteGreen 翻转（=trio 全景后 SSOT 刀）·臂回改=driver 对产品面已落事实的契约对齐·非掩盖。
