# G7FIX-5 — driver 臂回改刀（G7FIX-4 产品面落地后的 e2e 契约对齐）

**状态**：**`exec:awaiting_post_prove_dual`**（EXEC 已落 mw-core · 蓝本 = REQUEST rev2 `f3b28343` · 原状态 `draft_rev2:awaiting_pre_exec_dual` · 收敛式回改恰 3 处 `e2e/full.e2e.ts` **+2/−6（≤8 硬门 ✓·apps/packages src 零 diff 亲证）**· 恰 1 run `pnpm e2e:isolated` **EXIT=0 原值**（passed · 80706ms · assertionCount=74 · RUN1 UTC 窗 2026-10-09T08:46:52Z→08:48:14Z · 容器 37461 用后即焚）· **四元组 =（terminal=assessment_unavailable · status=200 · outcome=assessment_unavailable · replayed:false[断言过] · reason=generation_duplicate_question）⇒ §2 三向之「绿全程」臂 ⇒ CMD1 收口材料完备 + `:107` 材料进一步 + trio 全景重跑就绪**· G7FIX-4 kind 翻转 driver 可见级亲证（G7FIX-3 同位=interview_unavailable → 本 run=assessment_unavailable）· 恢复通路端到端亲证（retry 200/started/新 interviewId=mark-then-recover 可达）· sidecar v3 双计 21≤25 · 链 145+21=166≤200 · `[7a-diag]` grep=0 armed 延续 · **r1Closed=false 仍在 SSOT（本刀非翻转·注记兑现）**· 收据 `ai-docs/delivery/receipts/g7fix5-arm-rework/`（9 文件）· 单 run 绿≠恒绿（G7TRIO 臂3 教训）· STOP awaiting post-prove dual · Ban self-approve · 判读结论附协调方） · base = 主线 tip · 分支 `line/g7fix5-arm-rework` · 立项依据 = G7FIX-4 nail（产品面 finalize 契约增补落地·generation 族对称标记+mark-then-recover 恢复通路·G7FIX-3 driver 409 臂必然转红——产品面已改为 200+assessment_unavailable 正向面）+ G7FIX-4 post-dual 席2 trio 就绪度终评（臂回改=唯一 trio 阻塞·形状已由 prove 钉死·改动极小）。

## 1. 修法（仅 e2e/full.e2e.ts driver 臂·≤8 行·零产品码）
G7FIX-4 产品面落地后 generation 族 SSE kind **已翻转为 assessment_unavailable**（bound 场景恒 updated·adaptive-lifecycle.ts:65·exec-receipt §2 自证「零 interview_unavailable」）→ driver 落**既有 scorelessBound 臂**（:404/:407/:413-420 已载正确形状）——409 臂=**死分支**（interview_unavailable 残余语义=unbound⇒finalize 409·recruiter.ts:202/206）【rev2·席2 臂靶错位纠正】。收敛式回改：
1. **:404 scorelessBound 并入 `|| terminal === 'interview_unavailable'`**（防御性契约钉——残余 unbound 面触发时仍走此臂非落 :406 死支）；
2. **:407 统一面补 `finalized.replayed === false` 断言**（活路 replayed:false 失钉补入——G7FIX-4 prove 钉死形状）；
3. **:421-422 删 interview_unavailable 卡死 else-if 臂**（in_progress 卡死面在 G7FIX-4 对称标记后结构性不可达——死支移除·非掩盖）；
4. :412/:418 两 NDJSON 行在 cand/retry 块内**逐行保留**。
- 7a 探针+post-M7 窗截获+NDJSON 常驻面全部保留（armed 延续）。
- r1Closed=false 仍在 SSOT（G7FIX-4 曾用十一值·本刀沿 G7FIX-3 十值形——非翻转·收据注记）。

## 2. 验证
恰 1 run `pnpm e2e:isolated`（sidecar v3·est ≤25 含 boundLoop 全程·链 145+≤25≤200）：三向——**绿全程** ⇒ CMD1 收口材料完备+`:107` 材料进一步+trio 全景重跑就绪；**红于后续新死点** ⇒ armed 探针收材料·如实登记下一定靶；**红于此臂** ⇒ 修法面错再裁。禁洗绿禁重跑至绿。**r1Closed=false 仍在 SSOT 注记入收据。**

## 3. Ban
零产品码（apps/packages src 零 diff——G7FIX-4 产品面已落主线·本刀纯 driver 契约对齐）·full.e2e.ts ≤8 行仅 driver 臂段·helpers/wrapper/解析器零触碰·禁松 provenance 门·7a 探针/post-M7 窗/NDJSON 常驻全保留·Key name-only·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 4. 验收
diff ≤8 行亲证+恰 1 run EXIT 原值+NDJSON/sidecar 收据+三向判读+收据 `ai-docs/delivery/receipts/g7fix5-arm-rework/`。

## 5. Non-claims
本刀 ≠ G7 收官 ≠ :107 关闭 ≠ g7SuiteGreen 翻转（=trio 全景后 SSOT 刀）·臂回改=driver 对产品面已落事实的契约对齐·非掩盖。
