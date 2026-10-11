# Review — G4/R4 dispatch-recheck FOLLOW **post-prove**（第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：honesty subset 复跑收据；**≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ dispatch/recheck 已齐** · **≠ FOLLOW 关闸完成**）  
**releaseEvidence=false** · Not HA

覆盖 REQUEST：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md`  
前序 pre-exec：`2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`（pass · ≠ 本绿升 R4）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | EXIT=0 是否仅 honesty，不得写成 R4 / 题域已隔离 / wrong_track=0 / full P-WIRE？ | **是**。六 prove 均钉否定读法；本审同口径。 |
| 2 | Worker 是否仍正确不接线 `dispatchTrackLocalRetrieval` / planner→`RetrievalPlan`？ | **是**。`apps/worker/src` **零** `dispatchTrackLocalRetrieval(`；prove 钉 `callSites=0`；无 `InterviewPlannerOutput`→retrieve 路径。 |
| 3 | pre-exec dual-pass 是否不得自动升格为 R4 关 / FOLLOW 关闸完成？ | **同意**。pre-exec + 本 post-prove 均只证诚实；产品阻塞（P-PLANNER / P-R2 overall / P-FAKEPLAN / P-WT0）仍挡 full wire。 |
| 4 | 是否保持 R4 NOT closed；`releaseEvidence=false`；禁假绿 covered/HA？ | **同意**。 |
| 5 | NHP-R4-ADV-01 / wrong_track=0 是否仍 gap/blocked？ | **是**。case-matrix 仍 **gap**/blocked；本绿未关 ADV。 |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（NO production dispatch/recheck；≠ R4） |
| `pnpm g4-production-scoped-retrieve:prove` | **0**（partial；≠ wrong_track=0） |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0**（≠ R2/R4 关） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 overall NOT closed；≠ 路由已生效） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（≠ 题域已隔离） |
| `pnpm mysql-stack:m4-rag:prove` | **0**（§R4 NOT closed） |

HEAD：`639134f`

## 仍开（挡 R4）

- full `dispatchTrackLocalRetrieval` + recheck 生产接线  
- per-turn planner → `RetrievalPlan`  
- wrong_track=0 / NHP-R4-ADV-01  
- R2 overall NOT closed（≠ 路由已生效）  
- **题域隔离 NOT closed**

## 非宣称

禁止：R4 closed、题域已隔离、wrong_track=0、full P-WIRE、生产 dispatch/recheck 已齐、FOLLOW 关闸完成、HA、`releaseEvidence=true`、covered、假造 RetrievalPlan、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md`
- HEAD：`639134f`
