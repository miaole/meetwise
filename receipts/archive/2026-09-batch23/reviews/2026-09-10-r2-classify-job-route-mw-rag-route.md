# Review — R2 classifyJobRoute honesty PREREQ（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限 honesty PREREQ + fail-closed：**未接线** production）  
**releaseEvidence=false** · Not HA · **R2 仍 GAP** · **≠ 路由已生效** · **≠ R4 / 题域已隔离**

## 对照

- `harness/r2-classify-job-route.md` / `r2-classify-job-route-status.md` · eval
- `packages/db/src/job-route-decision.ts`（合同）· `recruiter.ts`（写面）
- `apps/api` / `apps/worker`：**零** `classifyJobRoute(`
- G4：partial P-WIRE / dispatch PREREQ（P-R2 仍阻塞）
- REQUEST：`REQUEST-r2-classify-job-route-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Inventory（revision→classify Worker→bind→snapshot→读侧）是否正确？ | **是**。I1–I6：revision/bind/snapshot **写面在**；I2/I3 classify Worker/API **缺失**；读侧 partial 常因无 snapshot 而 unscoped。 |
| 2 | 是否正确选 honesty PREREQ（非假接线）？ | **是**。P-MODEL（`job_route_classify` 未实施）/ P-WORKER / P-API / P-START / P-FAKE 阻塞成立；本刀不接线合理。 |
| 3 | 保持 R2 NOT closed；禁把写面/rag03 绿写成「路由已生效」？ | **同意**。EXIT=0 = 未接线诚实钉；写面 ≠ 生产 classify 已跑。 |
| 4 | G-R2 关闭条件仍未宣称达成？ | **是**。需 classify 生产调用 + MODEL-OP binding + bind/snapshot 闭环；status/m4/GAP-RAG-02 仍开。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-classify-job-route-prereq:prove` | **0**（apps classify callSites=0） |
| `pnpm g4-production-scoped-retrieve:prove` | **0** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为阻塞） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 非宣称

禁止：生产 `classifyJobRoute` 已接线、路由已生效、R2/R4/题域已隔离、假接线、cutover / HA / `releaseEvidence=true`。
