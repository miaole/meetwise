# Eval — R2 `classifyJobRoute`（GAP-RAG-02 · P-LIVE 路由已生效收据）

**releaseEvidence=false** · **Not HA** · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ verbal 生效** · **≠ 题域已隔离** · **P-LIVE dual receipts pass; P-HARNESS `pre_exec_dual_pass` / `await_authorize`** · **P-FAKE CLOSED（dual-passed）** · **P-START CLOSED（dual-passed · 真拒启）** · **P-LOOP CLOSED（dual-passed）**  
**对照**：`harness/r2-classify-job-route.md` · `harness/r2-classify-job-route-status.md`
**P-HARNESS reviews (both pass)**: `reviews/2026-09-16-r2-p-harness-agree-mw-rag-route.md` · `reviews/2026-09-16-r2-p-harness-agree-mw-e2e-ha.md`

## 1. 可执行断言（prove 覆盖）

| ID | 断言 | 本绿可外推？ |
|----|------|--------------|
| E1 | harness/status/eval/REQUEST/prove 存在 | 否 |
| E2 | 文档钉 R2 NOT closed / ≠ 路由已生效 / Key-unset / releaseEvidence=false / Not HA；P-LIVE dual 收据齐；仍 ≠ 路由已生效；P-FAKE dual-passed | 否 |
| E3 | Inventory I1–I6 + L-*（L-CLASSIFY/BIND/SNAPSHOT/REFUSE/ALLOW） | 否 |
| E4 | Worker sole `classifyJobRoute(` + `createJobRouteModelClassify`；api src **零** classify | 否（≠ R2 关） |
| E5 | Key-unset：binding fail-closed；rules-unique `modelCalls:0` ALLOW structural | 否 |
| E6 | REFUSE：`interview_ineligible_route` 在 INSERT 前；ALLOW：binding→snapshot→started | 否 |
| E7 | 假绿表禁口头生效 / 规则-only Worker / rag03≠生产生效 | 否 |
| E8 | 前序 P-* dual-passed（含 P-FAKE）；P-LIVE wire；R2 NOT closed overall | 否（≠ R2 关） |
| E9 | GAP-RAG-02 / m4 §R2 / G4 P-R2 仍开 overall（P-LIVE dual / harness） | 否 |
| E10 | REQUEST 非 pass / 禁止自批 | 否 |

## 2. 专家检查清单

- [ ] 未把 bind/snapshot / lazy re-bind / 真拒启 / P-LIVE prove 写成 **R2 已关 / 路由已生效 / verbal 生效**
- [ ] 未把 `rag03-route:prove` 绿写成生产路由生效
- [ ] 未把 consumer `getInterviewRouteSnapshot` 读侧写成 R2 关
- [ ] 未批准规则-only 假 Worker / 缺 MODEL-OP 旁路关 R2（P-FAKE）
- [ ] 未把 P-LIVE prove 绿写成 dual-passed / R2 关 / 路由已生效（须双审收据 + harness gates）
- [ ] 同意 P-LIVE Key-unset structural 够格作「路由已生效收据」候选，且 **未**假称 live Key invoke
- [ ] 记录 P-LIVE dual receipts + P-HARNESS pre-exec dual pass；SSOT/prove await separate authorize，且 R2 overall 仍开
- [ ] 确认 sole Worker 强制 `createJobRouteModelClassify`；apps 旁路=0
- [ ] 确认 P-START 真拒启 dual-passed 仍持有；P-FAKE dual-passed 仍持有

## 3. 非宣称

- 不宣称 R2 closed / 路由已生效 / verbal 生效 / P-LIVE dual-passed  
- 不宣称 R1/R4 关 · wrong_track=0 · covered · HA  
- 不切 qbank/向量 · 不 flip default · 不开 DELETE  
- 本 eval **不是** pass 结论
