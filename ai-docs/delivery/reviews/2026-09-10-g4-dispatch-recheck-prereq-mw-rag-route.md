# Review — G4 dispatch/recheck honesty PREREQ（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限 honesty PREREQ + fail-closed：**未接线** production）  
**releaseEvidence=false** · Not HA · **R4 仍开** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE**

## 对照

- `harness/r4-domain-isolation.md` / `r4-domain-isolation-status.md` **P9 · G-R4-1**
- `packages/db/src/qbank-track-local-retrieval.ts`（合同 seam）
- `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts`（零 dispatch 调用）
- 前序：`2026-09-10-g4-production-scoped-retrieve-mw-rag-route.md`（partial ≠ full）
- REQUEST：`REQUEST-g4-dispatch-recheck-prereq-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Worker `src` 零 `dispatchTrackLocalRetrieval(`，合同 seam/recheck 仍完整？ | **是**。callSites=0；seam 仍 export `dispatchTrackLocalRetrieval` + recheck → `recheck_failed`；domain `RetrievalPlan` 仍在。 |
| 2 | 是否正确选 honesty PREREQ（非假接线）？ | **是**。P-PLANNER / P-R2（apps 零 `classifyJobRoute(`）/ P-FAILCLOSED（缺 snapshot 仍 unscoped）/ P-FAKEPLAN 阻塞成立；本刀不接线合理。 |
| 3 | 保持 R4 NOT closed；禁 full wire / wrong_track=0 / 题域已隔离？ | **同意**。EXIT=0 = 未接线诚实钉，≠ 已齐。 |
| 4 | G-R4-1 / full P-WIRE 关闭条件仍未宣称达成？ | **是**。status 仍钉 G-R4-1 挡关闸；full = dispatch+recheck+缺 snapshot fail-closed+per-turn leaf **未齐**。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0**（partial 仍在；≠ full） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |
| `pnpm r1-tech-role-fail-closed:prove` | **0** |

## 非宣称

禁止：生产 dispatch/recheck 已接线、full P-WIRE、R4/题域已隔离、wrong_track=0、假绿升格、cutover / HA / `releaseEvidence=true`。
