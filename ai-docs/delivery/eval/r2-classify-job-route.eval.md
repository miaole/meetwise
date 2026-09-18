# Eval — R2 `classifyJobRoute`（GAP-RAG-02 · P-LIVE 路由已生效收据）

**releaseEvidence=false** · **Not HA** · **pass ≠ R2 已关 as HA** · **R2 structural CLOSED**（classify→bind→snapshot→refuse/allow + dual+authorize+prove）· **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ 路由已生效** · **≠ verbal 生效** · **≠ 题域已隔离** · **≠ FUNNEL dual-closed** · **≠ controlPlaneClosed** · **≠ suite green** · **P-LIVE CLOSED（dual-passed）** · **P-HARNESS authorized + SSOT flipped**（retired `await_authorize`）· **P-FAKE CLOSED（dual-passed）** · **P-START CLOSED（dual-passed · 真拒启）** · **P-LOOP CLOSED（dual-passed）** · sole **恰 5**  
**对照**：`harness/r2-classify-job-route.md` · `harness/r2-classify-job-route-status.md` · knife `harness/r2-ssot-flip-real-close.md`  
**P-HARNESS reviews (both pass)**: `reviews/2026-09-16-r2-p-harness-agree-mw-{rag-route,e2e-ha}.md`  
**Real-close pre-exec dual (both pass on `c3092c1`)**: `reviews/2026-09-17-r2-ssot-flip-real-close-mw-{e2e-ha,rag-route}.md`  
**Real-close post-prove dual (both pass on `5671982`)**: `reviews/2026-09-17-r2-ssot-flip-real-close-post-prove-mw-{e2e-ha,rag-route}.md` · knife **`post_prove_dual_pass`**

## 1. 可执行断言（prove 覆盖）

| ID | 断言 | 本绿可外推？ |
|----|------|--------------|
| E1 | harness/status/eval/REQUEST/prove 存在 | 否 |
| E2 | 文档钉 R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL / ≠ 路由已生效 / Key-unset / releaseEvidence=false / Not HA；P-LIVE dual 收据齐；structural CLOSED；仍 ≠ 路由已生效；P-FAKE dual-passed | 否 |
| E3 | Inventory I1–I6 + L-*（L-CLASSIFY/BIND/SNAPSHOT/REFUSE/ALLOW） | 否 |
| E4 | Worker sole `classifyJobRoute(` + `createJobRouteModelClassify`；api src **零** classify | 否（≠ HA） |
| E5 | Key-unset：binding fail-closed；rules-unique `modelCalls:0` ALLOW structural | 否 |
| E6 | REFUSE：`interview_ineligible_route` 在 INSERT 前；ALLOW：binding→snapshot→started | 否 |
| E7 | 假绿表禁口头生效 / 规则-only Worker / rag03≠生产生效 | 否 |
| E8 | 前序 P-* dual-passed（含 P-FAKE）；P-LIVE wire；R2 structural CLOSED · R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL | 否（≠ HA） |
| E9 | GAP-RAG-02 / m4 §R2 cite structural close + remaining-after；G4 P-R2 / R4 仍开 · ≠ 伪关 R4 | 否 |
| E10 | REQUEST 非 pass / 禁止自批 | 否 |

## 2. 专家检查清单

- [ ] 未把 bind/snapshot / lazy re-bind / 真拒启 / P-LIVE prove 写成 **路由已生效 / verbal 生效 / HA / suite**
- [ ] 未把 `rag03-route:prove` 绿写成生产路由生效
- [ ] 未把 consumer `getInterviewRouteSnapshot` 读侧写成 verbal 生效
- [ ] 未批准规则-only 假 Worker / 缺 MODEL-OP 旁路（P-FAKE）
- [ ] 未把 P-LIVE prove 绿写成 verbal 生效 / HA（须双审收据 + authorize + prove）
- [ ] 同意 P-LIVE Key-unset structural 够格作 structural close 收据，且 **未**假称 live Key invoke
- [ ] 记录 P-LIVE dual + P-HARNESS dual + standing authorize + SSOT flip；R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL
- [ ] 确认 sole Worker 强制 `createJobRouteModelClassify`；apps 旁路=0；sole **恰 5** 不扩
- [ ] 确认 P-START 真拒启 dual-passed 仍持有；P-FAKE dual-passed 仍持有
- [ ] Ban false close 题域/FUNNEL/R4

## 3. 非宣称

- 不宣称 路由已生效 / verbal 生效 / HA / suite / controlPlaneClosed  
- 不宣称 R1/R4/FUNNEL/题域 关 · wrong_track=0 · covered  
- 不切 qbank/向量 · 不 flip default · 不开 DELETE  
- 本 eval **不是** pass 结论 · **禁止自批**
