# REQUEST — R4 **REAL-WIRE-IMPL** **post-prove**（RAG/路由）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:05 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md`  
**硬闸**：`north-star-hard-gates.md` 已生效 · pre-exec dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ R4 关）**：`2026-09-16-r4-real-wire-impl-mw-rag-route.md` · `2026-09-16-r4-real-wire-impl-mw-e2e-ha.md`  
**本刀**：REAL-WIRE-IMPL 实现 + `pnpm r4-real-wire-impl:prove`（及旁证）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-real-wire-impl.md` | 本刀 harness（implemented + CMD+EXIT） |
| `eval/r4-real-wire-impl.eval.md` | run-status + 假绿标红 |
| `r4-real-wire-impl.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` | R4 **仍 NOT closed**；REAL-WIRE-IMPL 已登记 |
| `apps/worker/src/qbank-track-local-retrieve.ts` | **dispatch 调用点** + recheck_failed map |
| `apps/worker/src/interview-consumer.ts` | retrieve 主路径（trackLocal） |
| `apps/worker/src/main.ts` | `adaptive.trackLocal` factory |
| `apps/worker/src/qbank-retrieve-scope.ts` | G-R2-5 decide gate |
| `packages/domain` / `packages/db` | assemble / dispatch seam |

---

## 切片立场（RAG 域）

本刀落地 W1–W7：

1. per-turn `planInterviewTurn` → `InterviewPlannerOutput`  
2. `validatePlannerOutput` / assemble vs current snapshot（fail-closed）  
3. 完整 `RetrievalPlan`（**generationId + recipeId** via `activeQbankGeneration`）  
4. Worker **≥1** `dispatchTrackLocalRetrieval(` call site  
5. `recheck_failed` → **fail-closed**（degraded；无 unscoped / 兄弟叶）  
6. **G-R2-5** 保留（`route_snapshot_missing`）  
7. **禁 P-FAKEPLAN**；接线绿 **≠ R4 closed ≠ wrong_track=0**

**EXIT=0 ≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0**。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · ~19:05 PT）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-real-wire-impl:prove`** | **0** | CALL_SITES=1；fail-closed；≠ R4 关 |
| `pnpm r4-p-planner-unit:prove` | **0** | unit 合同仍绿 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | FLIPPED CALL_SITES=1；≠ R4 关 |

**未跑（禁）**：wrong_track=0 ADV 绿关 R4 · flip default / open DELETE / HA。  
**Key**：unset（未读 `.env*`）。

---

## 请专家回答

1. 请 **独立复跑** `pnpm r4-real-wire-impl:prove`，附 CMD+EXIT；旁证 unit / flipped g4 可选。  
2. CALL_SITES≥1 是否成立，且路径为 planner→assemble→dispatch（**非** P-FAKEPLAN 主叶硬塞）？  
3. `recheck_failed` fail-closed 与 **G-R2-5** 是否仍成立？  
4. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ wrong_track=0**？  
5. harness/status/eval 是否错误把本绿写成 R4 已关？（期望：**否**）  
6. 是否同意 ADV / wrong_track=0 仍为剩余缺口？  
7. pre-exec dual + 本绿是否 **不得**自动批准 R4 关闭？（期望：**不得**）

请将结论写入 `reviews/`（例如 `2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R4 closed / wrong_track=0。  
- **await post-prove dual**。  

---

*REQUEST · mw-rag-route · R4 REAL-WIRE-IMPL post-prove · 2026-09-16 ~19:05 PT · releaseEvidence=false · ≠HA · ≠ R4 closed*
