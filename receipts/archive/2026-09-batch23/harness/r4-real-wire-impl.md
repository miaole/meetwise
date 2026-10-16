# Harness — R4 **REAL-WIRE-IMPL**（Worker retrieve 真接线 · **post_prove_dual_pass · wire honesty only**）

**状态**：`post_prove_dual_pass`（**wire honesty only**）  
**日期**：2026-09-16（~19:05 PT）  
**CALL_SITES=1** · **releaseEvidence=false** · **Not HA** · **≠ covered** · **wire 绿 ≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE 已关（ADV/wrong_track 仍开）** · **next=LIVE_PG `post_prove_dual_pass`（honesty only；ADV honesty dual-closed）** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）  
**双审专家**：`mw-rag-route` + `mw-e2e-ha`（**pre-exec dual PASS**；**post-prove dual PASS · wire honesty only**）  
**父轨**：`harness/r4-domain-isolation.md` §6c（W1–W6）· §6e（本刀）  
**前序**：P-PLANNER **`post_prove_dual_pass`（unit only）** · REAL-WIRE-IMPL post-prove dual **pass** · meetwise **authorize coding+prove**

---

## 0. 本刀立场（先读）

| 声明 | 裁定 |
|------|------|
| **本刀是什么** | **实现刀**：Worker retrieve 真接线 — planner output → validate → assemble `RetrievalPlan`（generationId/recipeId）→ `dispatchTrackLocalRetrieval` → recheck |
| **本刀不是什么** | **不是** R4 关闸；**不是** wrong_track=0；**不是** HA / covered |
| **R4 是否已关？** | **否。题域隔离 NOT closed。** |
| **wire 绿 ≠ R4 closed** | 接线绿 **≠** R4 closed · **≠** wrong_track=0（ADV **单独**） |
| **P-FAKEPLAN** | **禁止**：主叶硬塞 / 缺 generationId·recipeId |
| **G-R2-5** | **保留**：缺 snapshot → `route_snapshot_missing`；**不**打开 unscoped |
| **recheck_failed** | **fail-closed**：不回退兄弟叶 / unscoped / legacy_unrouted；不写 question_ready |
| **证据** | `releaseEvidence=false`；Not HA；禁 flip default / open DELETE / 实现方自批 |

---

## 1. 验收标准（W1–W7）· 本刀实现对照

| 步 | 要求 | 本刀实现 |
|----|------|----------|
| **W1** | per-turn `InterviewPlannerOutput`（`planInterviewTurn`） | `assembleValidatedRetrievalPlan` → `planInterviewTurn`（via `retrieveViaDispatchTrackLocal`） |
| **W2** | `validatePlannerOutput` 相对当前 route snapshot | assemble 内 validate；失败 → degraded fail-closed |
| **W3** | 完整 `RetrievalPlan`（**generationId / recipeId**） | `activeQbankGeneration` + assemble；**禁 P-FAKEPLAN** |
| **W4** | Worker 调用 `dispatchTrackLocalRetrieval` | `apps/worker/src/qbank-track-local-retrieve.ts`；consumer 在 `trackLocal` 注入时走此路径；main 注入 factory |
| **W5** | recheck；`recheck_failed` → **fail-closed** | `scoredRefsFromDispatch` → degraded；不回退 unscoped |
| **W6** | 保留 **G-R2-5** | consumer 仍 `decideRouteSnapshotRetrieve`；缺 snapshot → `route_snapshot_missing` |
| **W7** | 关闸边界 | **接线绿 ≠ R4 closed ≠ wrong_track=0**；ADV 另刀 |

---

## 2. 现状库存（接线后）

| # | 项 | 状态 |
|---|------|------|
| I1 | P-PLANNER unit + dual | **`post_prove_dual_pass`（unit only）** — 仍须 EXIT=0 |
| I2 | Worker helper `qbank-planner-retrieval-plan.ts` | 仍导出 assemble；retrieve 消费在 `qbank-track-local-retrieve.ts` |
| I3 | `dispatchTrackLocalRetrieval(` in `apps/worker/src` | **=1**（track-local retrieve helper） |
| I4 | Retrieve 主路径（production） | **planner → assemble → dispatch → recheck**（`adaptive.trackLocal`） |
| I5 | 合同 seam | `packages/db/src/qbank-track-local-retrieval.ts` |
| I6 | Compat/test | 无 `trackLocal` 时仍 primary-leaf scoped `localRetrieve` |

---

## 3. CMD 表（实现方实测）

| CMD | EXIT | 读法 |
|-----|------|------|
| `pnpm r4-real-wire-impl:prove` | **0** | CALL_SITES=1；recheck_failed fail-closed；G-R2-5；≠ R4 closed |
| `pnpm r4-p-planner-unit:prove` | **0** | unit 合同仍绿；≠ R4 关 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED** CALL_SITES=1；≠ R4 关 |

```bash
pnpm r4-real-wire-impl:prove
pnpm r4-p-planner-unit:prove
pnpm g4-dispatch-recheck-prereq:prove
```

| 本刀执行旗 | 值 |
|------------|-----|
| run-status | **`post_prove_dual_pass`（wire honesty only）** |
| Worker 改动 | **有**（retrieve 真接线） |
| 实现方自批 | **禁止** |

---

## 4. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「CALL_SITES≥1 = R4 关 / wrong_track=0」 | **假绿** — ADV 单独；wire ≠ R4 |
| 「本刀 prove 绿 = covered / HA」 | **假绿** — `releaseEvidence=false` |
| 「主叶硬塞 plan = true wire」 | **P-FAKEPLAN** · **禁止** |
| 「recheck_failed 可回退 unscoped」 | **禁止** — fail-closed |
| flip default / open DELETE / HA / `releaseEvidence=true` | **禁止** |

---

## 5. NHP-R4 列（本刀 · **不升格 covered**）

| 列 | Case ID | 旗 | 本刀 |
|----|---------|----|------|
| NEG | NHP-R4-NEG-01 | **partial** | G-R2-5 仍在；不改 covered |
| FAULT | NHP-R4-FAULT-01 | **partial**/gap | 生产路径现有 recheck_failed 映射；≠ covered / ≠ HA |
| BOUND | NHP-R4-BOUND-01 | **partial** | per-turn leaf via planner；不升格 covered |
| ADV | NHP-R4-ADV-01 | **partial**/honesty-pin | ADV honesty dual-closed；LIVE_PG dual honesty landed；≠ covered |
| PERF | NHP-R4-PERF-01 | **blind** | blind |
| LOAD | NHP-RAG-LOAD-01 | **blind** | blind |

---

## 6. 代码与文档锚点

| 路径 | 角色 |
|------|------|
| `ai-docs/delivery/harness/r4-real-wire-impl.md` | **本 harness** |
| `ai-docs/delivery/eval/r4-real-wire-impl.eval.md` | 专家评测勾选 |
| `ai-docs/delivery/r4-real-wire-impl.slice.md` | 切片索引 |
| `apps/worker/src/qbank-track-local-retrieve.ts` | **dispatch 调用点** + fail-closed map |
| `apps/worker/src/interview-consumer.ts` | retrieve 主路径消费 |
| `apps/worker/src/main.ts` | `adaptive.trackLocal` factory |
| `apps/worker/src/qbank-retrieve-scope.ts` | G-R2-5 decide gate |
| `packages/domain` / `packages/db` | planner assemble / dispatch seam |
| `reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-{rag-route,e2e-ha}.md` | **post-prove dual pass（wire honesty only）** |

---

## 7. Dual-review

| 阶段 | 专家 | 路径 | 状态 |
|------|------|------|------|
| pre-exec | `mw-rag-route` | `2026-09-16-r4-real-wire-impl-mw-rag-route.md` | **pass** |
| pre-exec | `mw-e2e-ha` | `2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` | **pass** |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md` | **pass（wire honesty only）** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md` | **pass（wire honesty only）** |

---

## 8. 非目标 / 禁止宣称

- **不**宣称 R4 closed / 题域已隔离 / wrong_track=0 / HA  
- `releaseEvidence=false`；实现方 **禁止自批**；须专家独立写 post-prove reviews  
- ADV / wrong_track=0 = **仍 partial ≠ covered**；LIVE_PG = `post_prove_dual_pass`（honesty only）

---

*Harness · R4 REAL-WIRE-IMPL · 2026-09-16 ~19:45 PT · post_prove_dual_pass（wire honesty only）· CALL_SITES=1 · releaseEvidence=false · ≠HA · ≠ R4 closed · LIVE_PG=post_prove_dual_pass（honesty only）*
