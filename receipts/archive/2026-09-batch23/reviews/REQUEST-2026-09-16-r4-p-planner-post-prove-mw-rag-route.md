# REQUEST — R4 **P-PLANNER** **post-prove**（RAG/路由）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~08:00 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`  
**硬闸**：`north-star-hard-gates.md` 已生效 · pre-exec dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ R4 关）**：`2026-09-16-r4-p-planner-mw-rag-route.md` · `2026-09-16-r4-p-planner-mw-e2e-ha.md`  
**本刀**：P-PLANNER 实现 + `pnpm r4-p-planner-unit:prove` **EXIT=0**；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-p-planner.md` | 本刀 harness（implemented + EXIT=0） |
| `eval/r4-p-planner.eval.md` | run-status + 假绿标红 |
| `r4-p-planner.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` | R4 **仍 NOT closed**；P-PLANNER unit 已登记 |
| `packages/domain/src/job-route-classifier.ts` | `planInterviewTurn` |
| `packages/domain/src/qbank-track-local-retrieval.ts` | `buildRetrievalPlanFromPlannerOutput` · `assembleValidatedRetrievalPlan` |
| `apps/worker/src/qbank-planner-retrieval-plan.ts` | helper **未进 retrieve** |
| `apps/worker/src/{interview-consumer,qbank-retrieve-scope}.ts` | **仍** primary-leaf + G-R2-5 |
| `packages/db/src/qbank-track-local-retrieval.ts` | dispatch seam **仍未**被 Worker 消费 |

---

## 切片立场（RAG 域）

本刀落地：

1. per-turn `InterviewPlannerOutput`（`planInterviewTurn`）→ `validatePlannerOutput`  
2. 完整 `RetrievalPlan`（**必含 generationId/recipeId**）→ `validateRetrievalPlan`  
3. fail-closed；**禁** P-FAKEPLAN；**保留** G-R2-5  
4. Worker helper 存在但 **未**接线 retrieve / **未**调用 `dispatchTrackLocalRetrieval`  

**EXIT=0 ≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE**。  
REAL-WIRE = **仍正确不接线**（follow-on）。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · ~08:00 PT）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-planner-unit:prove`** | **0** | T1–T4/T6–T7；≠ R4 关；≠ dispatch 接线 |
| `pnpm g4-dispatch-recheck-prereq:prove`（旁证） | **0** | 仍零 dispatch；无 planner→retrieve |

**未跑（禁）**：REAL-WIRE coding · wrong_track=0 ADV 绿关 R4 · flip default / open DELETE / HA。  
**Key**：unset（未读 `.env*`）。

---

## 请专家回答

1. 请 **独立复跑** `pnpm r4-p-planner-unit:prove`，附 CMD+EXIT。  
2. 是否同意：实现覆盖 T1–T4 / T6–T7，且 **T5（dispatch）仍未接线**？  
3. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ wrong_track=0 / ≠ full P-WIRE**？  
4. harness/status/eval 是否错误把本绿写成 R4 已关或 retrieve 已消费 per-turn plan？（期望：**否**）  
5. 是否同意：**P-FAKEPLAN 禁令** + **G-R2-5 保留** 仍成立？  
6. pre-exec dual + 本绿是否 **不得**自动批准 R4 关闭 / REAL-WIRE？（期望：**不得**）

请将结论写入 `reviews/`（例如 `2026-09-16-r4-p-planner-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R4 closed / wrong_track=0 / full P-WIRE / dispatch 已接线。  
- **await post-prove dual**。  

---

*REQUEST · mw-rag-route · R4 P-PLANNER post-prove · 2026-09-16 ~08:00 PT · releaseEvidence=false · ≠HA · ≠ R4 closed*
