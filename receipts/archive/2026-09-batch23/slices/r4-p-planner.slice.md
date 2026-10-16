# Slice — R4 **P-PLANNER**（true per-turn planner · post_prove_dual_pass · unit only）

**状态**：**`post_prove_dual_pass`（unit only）**  
**日期**：2026-09-16（~08:10 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **≠ wrong_track=0** · **≠ full P-WIRE**  
**前置**：R4-REAL-WIRE dual **pass** = correctly NOT wiring · P-PLANNER pre-exec dual **pass** · coding+prove · **post-prove dual pass**  
**本刀禁止**：宣称 R4 关 · P-FAKEPLAN · 把 unit dual 写成 dispatch 已接线 / REAL-WIRE coding 自动开

---

## 产物

| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/r4-p-planner.slice.md` |
| Harness | `ai-docs/delivery/harness/r4-p-planner.md` |
| Eval | `ai-docs/delivery/eval/r4-p-planner.eval.md` |
| Domain planner | `packages/domain/src/job-route-classifier.ts`（`planInterviewTurn`） |
| Domain assemble | `packages/domain/src/qbank-track-local-retrieval.ts`（`buildRetrievalPlanFromPlannerOutput` · `assembleValidatedRetrievalPlan`） |
| Worker helper（未接线） | `apps/worker/src/qbank-planner-retrieval-plan.ts` |
| Unit prove | `packages/domain/test/r4-p-planner.proof.ts` |
| CMD | `pnpm r4-p-planner-unit:prove` → **EXIT=0** |
| post-prove · rag | `reviews/2026-09-16-r4-p-planner-post-prove-mw-rag-route.md`（**pass**） |
| post-prove · e2e | `reviews/2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`（**pass**） |
| 父 status | `harness/r4-domain-isolation-status.md` |
| pre-exec dual | `reviews/2026-09-16-r4-p-planner-mw-{rag-route,e2e-ha}.md`（**pass**） |
| 下一刀 | `harness/r4-real-wire-impl.md`（REAL-WIRE-IMPL · await dual） |

## 范围一句话

落地 true per-turn planner → `validatePlannerOutput` → 完整 `RetrievalPlan`（含 generationId/recipeId）→ `validateRetrievalPlan`；fail-closed；禁 P-FAKEPLAN；保留 G-R2-5；unit prove EXIT=0 + **post-prove dual pass**。**不**接线 dispatch；retrieve 仍主叶；**R4 仍 NOT closed**。

## 硬钉

- **`post_prove_dual_pass`（unit only）** — 专家独立 reviews 已齐  
- **R4 仍 NOT closed**；wire ≠ R4 closed；NHP-R4 **不升格 covered**  
- dispatch **仍未**进 Worker retrieve  
- `releaseEvidence=false`

---

*Slice · R4 P-PLANNER · 2026-09-16 ~08:10 PT · post_prove_dual_pass (unit only) · releaseEvidence=false · ≠HA*
