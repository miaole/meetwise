# REQUEST — G4 dispatch/recheck honesty PREREQ（fail-closed · 未接线）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ sole cutover** · **≠ production dispatch wire**

## 对照

- `ai-docs/delivery/harness/r4-domain-isolation.md`（P-WIRE full / dispatch+recheck）
- `ai-docs/delivery/harness/r4-domain-isolation-status.md`（P9 · G-R4-1）
- `ai-docs/delivery/eval/r4-domain-isolation.eval.md`
- `packages/db/src/qbank-track-local-retrieval.ts`（合同 seam：`dispatchTrackLocalRetrieval` + recheck）
- `apps/worker/src/main.ts` · `interview-consumer.ts` · `qbank-retrieve-scope.ts`（**仍无** dispatch 调用）
- 前序双审：`reviews/2026-09-10-g4-production-scoped-retrieve-mw-rag-route.md`（partial P-WIRE pass ≠ full wire）
- GAP-RAG-04 · `m4-rag-hard-gates.md` §R4

## 切片立场（实现方自认）

本刀 **不**把 `dispatchTrackLocalRetrieval` / recheck 接进生产 Worker。  
产品阻塞 → **honesty PREREQ + fail-closed**（禁止假绿宣称已接线 / 关 R4）：

| 阻塞 | 事实 |
|------|------|
| **P-PLANNER** | Worker 图无 per-turn `InterviewPlannerOutput` → `RetrievalPlan` 消费路径 |
| **P-R2** | `apps/` 无 `classifyJobRoute(` → 多数 job 无 snapshot |
| **P-FAILCLOSED** | 缺 snapshot 仍 unscoped（改 fail-closed 会打爆 legacy 面试，须 R2 先齐） |
| **P-FAKEPLAN** | 用主叶硬造 `RetrievalPlan`（无 generation/recipe/planner difficulty）= 假绿 |

合同 seam + `rag04-track-local:prove` **仍在**；≠ Worker 已消费。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0**（partial 仍在；≠ full） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 请专家回答

1. Worker `src` 是否 **零** `dispatchTrackLocalRetrieval(` 调用，且合同 seam / recheck 仍完整？  
2. 本刀是否正确选择 **honesty PREREQ + fail-closed**（因 P-PLANNER/P-R2/P-FAILCLOSED），而非假接线？  
3. 是否同意 **保持 R4 NOT closed**，禁止把本绿 / rag04 绿写成 full wire / wrong_track=0 / 题域已隔离？  
4. G-R4-1 / P-WIRE full 关闭条件（dispatch+recheck+缺 snapshot fail-closed+per-turn leaf）是否仍正确未宣称达成？

## 非宣称（实现方自认）

- 不宣称生产 `dispatchTrackLocalRetrieval` / recheck 已接线  
- 不宣称 R4 / 题域隔离已关 · 不宣称 wrong_track=0  
- 不把 partial P-WIRE 升格为 full P-WIRE  
- 不切 qbank / 向量真相 / flip default / HA / `releaseEvidence=true`  
- 本 REQUEST **不是** pass 结论
