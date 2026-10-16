# Harness — R4 **P-PLANNER**（true per-turn planner · **post_prove_dual_pass · unit only**）

**状态**：`post_prove_dual_pass`（**unit only**）  
**日期**：2026-09-16（~08:10 PT）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）  
**双审专家**：`mw-rag-route` + `mw-e2e-ha`（pre-exec dual **pass**；**post-prove dual pass · unit only**）  
**父轨**：`harness/r4-domain-isolation.md` §6c（W1–W6）· §6d · §6e（REAL-WIRE-IMPL）  
**前序**：R4-REAL-WIRE dual pre-exec **pass** = **correctly NOT wiring** · NHP Batch1 `post_prove_dual_pass`（honesty only；**≠ covered**）· P-PLANNER pre-exec dual **pass** + coding+prove · post-prove dual **pass**

---

## 0. 本刀立场（先读）

| 声明 | 裁定 |
|------|------|
| **本刀是什么** | **实现刀已关（unit）**：true per-turn planner → validated `RetrievalPlan` 组装（T1–T4、T6–T7）+ `pnpm r4-p-planner-unit:prove` EXIT=0 + **post-prove dual pass** |
| **本刀不是什么** | **不是** REAL-WIRE（**未**接线 `dispatchTrackLocalRetrieval` 进 Worker retrieve）；**不是** R4 关闸；**不是** wrong_track=0 |
| **R4 是否已关？** | **否。题域隔离 NOT closed。** |
| **REAL-WIRE？** | **dispatch 仍未接线**；下一刀 = **REAL-WIRE-IMPL**（另 harness · await dual · **零 coding until dual**） |
| **P-FAKEPLAN** | **禁止**：主叶硬塞 `RetrievalPlan`（无 planner / generationId / recipeId）= 假绿（unit prove 钉拒） |
| **G-R2-5** | **保留**：缺 snapshot → `route_snapshot_missing`；planner 失败 **不**打开 unscoped；retrieve 主路径仍 primary-leaf + G-R2-5（直至 REAL-WIRE-IMPL 另授权） |
| **wire ≠ R4 closed** | planner unit 绿 ≠ wrong_track=0 ≠ R4 closed；ADV 须 **单独** prove |
| **证据** | `releaseEvidence=false`；Not HA；禁 flip default / open DELETE |
| **honesty** | Worker helper **存在但未进 retrieve**；`g4-dispatch-recheck-prereq:prove` 仍钉零 dispatch |

---

## 1. 「True planner」验收标准（本刀已落地 · unit · dual-passed）

### 1.1 最小诚实路径（对齐父轨 W1）

| 步 | 要求 | 本刀状态 |
|----|------|----------|
| **T1** | 图内 **per-turn** 产出 `InterviewPlannerOutput` | **已**：`planInterviewTurn`（weighted-deficit leaf + competency/difficulty） |
| **T2** | 经 `validatePlannerOutput` 相对 **当前** route snapshot | **已**：失败 → fail-closed |
| **T3** | 组装完整 `RetrievalPlan`（含 **generationId** · **recipeId**） | **已**：`buildRetrievalPlanFromPlannerOutput` + `assembleValidatedRetrievalPlan` + `validateRetrievalPlan` |
| **T4** | 禁止 P-FAKEPLAN | **已**：缺 generation/recipe / 非法 id → 拒；禁无 planner 硬塞主叶 |
| **T5** | 消费点 `dispatchTrackLocalRetrieval` | **OUT OF SCOPE**（REAL-WIRE-IMPL follow-on；**未接线**） |
| **T6** | 保留 G-R2-5 | **已**：缺/非法 snapshot → `route_snapshot_missing`；retrieve 仍 primary-leaf path |
| **T7** | 关闸边界 | **已钉**：unit 绿 ≠ wrong_track=0 ≠ R4 closed |

### 1.2 非目标（仍排除）

| 非目标 | 原因 |
|--------|------|
| 接线 `dispatchTrackLocalRetrieval` 进 Worker retrieve | REAL-WIRE-IMPL 另刀 |
| 假造 generationId/recipeId stub 冲 full wire | **P-FAKEPLAN** |
| 宣称 R4 / 题域已隔离 / wrong_track=0 | 假绿 |
| 削弱 G-R2-5 / 打开 unscoped | 禁 |
| HA / `releaseEvidence=true` / flip default / open DELETE | 禁 |

---

## 2. 实现库存（诚实 · 2026-09-16 ~08:10 PT）

| # | 项 | 路径 / 状态 |
|---|------|-------------|
| I1 | `planInterviewTurn` | `packages/domain/src/job-route-classifier.ts` |
| I2 | `buildRetrievalPlanFromPlannerOutput` · `assembleValidatedRetrievalPlan` | `packages/domain/src/qbank-track-local-retrieval.ts` |
| I3 | Worker helper（**未进 retrieve**） | `apps/worker/src/qbank-planner-retrieval-plan.ts` |
| I4 | Unit prove | `packages/domain/test/r4-p-planner.proof.ts` · `pnpm r4-p-planner-unit:prove` |
| I5 | Retrieve 主路径 | **仍** `decideRouteSnapshotRetrieve`（primary leaf + G-R2-5） |
| I6 | dispatch | **仍零** `dispatchTrackLocalRetrieval(` in `apps/worker/src` |

**仍开 gap（挡 full P-WIRE / R4）**：

| # | 缺口 | 挡什么 |
|---|------|--------|
| G2 | Worker **零** dispatch 消费 | full P-WIRE |
| G4 | 现 retrieve = 主叶 scope（helper 未接线） | BOUND still partial |
| G5 | wrong_track=0 / NHP-R4-ADV-01 | R4 关闸 |

---

## 3. CMD 表（已跑 · dual 复跑）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm r4-p-planner-unit:prove` | **0** | T1–T4/T6–T7 unit；**≠** Worker retrieve 接线；**≠** R4 关；**≠** wrong_track=0 |
| `pnpm g4-dispatch-recheck-prereq:prove`（旁证） | **0** | 仍钉 **零 dispatch** / 无 planner→retrieve 路径 |

```bash
cd /workspace/meetwise && pnpm r4-p-planner-unit:prove
# EXIT=0 · ~08:00–08:06 PT · ≠ R4 closed
```

| 本刀执行旗 | 值 |
|------------|-----|
| run-status | **`post_prove_dual_pass`**（unit only） |
| Worker retrieve 改动 | **零接线**（仅新增未消费 helper） |
| 实现方自批 | **禁止**（专家独立 reviews 已齐） |

---

## 4. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「unit prove 绿 = R4 关 / wrong_track=0」 | **假绿** |
| 「helper 存在 = retrieve 已用 per-turn planner」 | **假绿** — retrieve 仍主叶 |
| 「可宣称 full P-WIRE」 | **假绿** — dispatch 未接线 |
| 「主叶硬塞 / 缺 generation·recipe = true planner」 | **P-FAKEPLAN** · **禁止** |
| 「post-prove dual pass = REAL-WIRE coding 自动开」 | **假绿** — REAL-WIRE-IMPL 另刀 + dual |
| flip default / open DELETE / HA / `releaseEvidence=true` | **禁止** |

---

## 5. NHP-R4 列（本刀 · **不升格**）

| 列 | Case ID | 旗 | 本刀 |
|----|---------|----|------|
| NEG | NHP-R4-NEG-01 | **partial** | 引 G-R2-5；不改旗 |
| FAULT | NHP-R4-FAULT-01 | **gap**/blind | 无生产 recheck；不改 |
| BOUND | NHP-R4-BOUND-01 | **partial**/honesty | retrieve **仍**主叶；planner 组装已有但未接线 |
| ADV | NHP-R4-ADV-01 | **gap**/blocked | **仍 gap**；planner≠ADV |
| PERF | NHP-R4-PERF-01 | **blind** | blind |
| LOAD | NHP-RAG-LOAD-01 | **blind** | blind |

---

## 6. 代码与文档锚点

| 路径 | 角色 |
|------|------|
| `ai-docs/delivery/harness/r4-p-planner.md` | **本 harness** |
| `ai-docs/delivery/eval/r4-p-planner.eval.md` | 专家评测勾选 |
| `ai-docs/delivery/r4-p-planner.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` | Proven vs GAP |
| `packages/domain/src/job-route-classifier.ts` | `planInterviewTurn` · `InterviewPlannerOutput` |
| `packages/domain/src/qbank-track-local-retrieval.ts` | assemble / validate RetrievalPlan |
| `apps/worker/src/qbank-planner-retrieval-plan.ts` | 未接线 helper |
| `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` | 仍 primary-leaf + G-R2-5 |
| `reviews/2026-09-16-r4-p-planner-post-prove-mw-rag-route.md` | **post-prove · pass**（unit only） |
| `reviews/2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md` | **post-prove · pass**（unit only） |
| `harness/r4-real-wire-impl.md` | **下一刀** REAL-WIRE-IMPL（pre-exec · await dual） |

---

## 7. Dual-review

| 阶段 | 专家 | 路径 | 状态 |
|------|------|------|------|
| pre-exec | `mw-rag-route` | `reviews/2026-09-16-r4-p-planner-mw-rag-route.md` | **pass**（document gate） |
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-16-r4-p-planner-mw-e2e-ha.md` | **pass**（document gate） |
| **post-prove** | `mw-rag-route` | `reviews/2026-09-16-r4-p-planner-post-prove-mw-rag-route.md` | **pass**（unit only；≠ R4 关；≠ dispatch 接线） |
| **post-prove** | `mw-e2e-ha` | `reviews/2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md` | **pass**（unit only；≠ R4 关；≠ dispatch 接线） |

**批准边界（专家已批）**：unit 路径绿；P-FAKEPLAN 禁；G-R2-5 保留；**不**批 R4 关；**不**批 dispatch 接线；**不**批 wrong_track=0。

---

## 8. 非目标 / 禁止宣称

- **不**宣称 R4 closed / 题域已隔离 / wrong_track=0 / full P-WIRE / HA  
- **不**宣称 dispatch 已接线 / retrieve 已消费 per-turn plan  
- `releaseEvidence=false`；**仍 ≠ R4 closed**；dispatch **仍 unwired**  
- 下一刀：**REAL-WIRE-IMPL**（`harness/r4-real-wire-impl.md` · await dual · zero coding until dual）

---

*Harness · R4 P-PLANNER · 2026-09-16 ~08:10 PT · post_prove_dual_pass (unit only) · releaseEvidence=false · ≠HA · ≠ R4 closed · dispatch still unwired*
