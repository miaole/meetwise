# REQUEST — R4 **P-PLANNER**（acceptance gate · **不 coding / 不 prove**）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT · ~05:10）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ planner 已落地** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 本 REQUEST 授权 Worker coding / prove 绿关  
**配对**：`REQUEST-2026-09-16-r4-p-planner-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-p-planner.md` | **本刀** harness · true-planner 标准 · gap · 冻结 CMD |
| `eval/r4-p-planner.eval.md` | 评测勾选 |
| `r4-p-planner.slice.md` | 切片索引 |
| `harness/r4-domain-isolation.md` **§6c / §6d** | W1–W6 · P-PLANNER 指针 |
| `harness/r4-domain-isolation-status.md` | next PREREQ = P-PLANNER |
| `packages/domain/src/job-route-classifier.ts` | `InterviewPlannerOutput` · `validatePlannerOutput` |
| `packages/domain/src/qbank-track-local-retrieval.ts` | `RetrievalPlan` · `validateRetrievalPlan`（generationId/recipeId） |
| `packages/db/src/qbank-track-local-retrieval.ts` | 合同 seam（未生产消费） |
| `apps/worker/src` | **仍零** dispatch；**无** per-turn planner→retrieve |
| 前序 REAL-WIRE dual | `2026-09-16-r4-real-wire-mw-{rag-route,e2e-ha}.md`（**pass · correctly NOT wiring**） |
| NHP Batch1 | `post_prove_dual_pass` · honesty only · **≠ covered** |

---

## 切片立场（实现方自认）

R4-REAL-WIRE dual 已批 **正确不接线**，主挡为 **P-PLANNER**。本刀打开 **P-PLANNER 验收门文档**：

1. 定义将来「true planner」：per-turn `InterviewPlannerOutput` → `validatePlannerOutput` → 完整 `RetrievalPlan`（**必含 generationId/recipeId**）→（将来）`dispatchTrackLocalRetrieval`。  
2. 盘点 gap：Worker 仍无该路径；今日 **无** production planner prove 绿路径可宣称。  
3. **禁** P-FAKEPLAN；**保留** G-R2-5；钉 **wire ≠ R4 closed**；NHP-R4 **不升格**。  
4. **本刀零代码 · 零 prove**；CMD 表冻结为 `not_run:pre_dual_review`。  
5. coding/prove **forbidden** until dual pass + **separate authorize**（本刀 pass ≠ 自动 coding）。

---

## 请专家（双审通过前）**不要**要求实现方开始 Worker planner 实现 / 绿关 prove

| 项 | 本刀 |
|----|------|
| P-PLANNER prove | **not_run:pre_dual_review** |
| Worker 改动 | **零** |
| REAL-WIRE 接线 | **仍正确不接线** |

---

## 请专家回答

1. **harness 是否够格当 P-PLANNER 验收门**（true-planner 标准 + gap + 假绿标红是否诚实完整）？  
2. 是否同意：**本刀无 coding / 无 prove**（仅 harness + eval + slice + REQUEST）？  
3. 是否同意：**P-FAKEPLAN 禁令**（主叶硬塞 / 缺 generation·recipe = 假绿）仍必须？  
4. 是否同意：**R4 保持 NOT closed**；本刀 dual pass ≠ 关 R4 / ≠ 题域已隔离？  
5. 是否同意：follow-on wire 仍须 **完整 plan 字段（含 generationId/recipeId）** + **保留 G-R2-5** + **wrong_track=0 单独**，且 **接线绿 ≠ R4 关**？  
6. 是否同意：本刀 dual pass **本身不**授权 Worker coding（须另开 authorize REQUEST）？  
7. 是否同意：保持 `releaseEvidence=false`；禁 flip default / open DELETE / HA？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**实现 / **未**接线生产 planner→retrieve→dispatch  
- **未**跑 prove；不宣称 planner 已齐 / R4 closed / wrong_track=0 / full P-WIRE  
- 不把 REAL-WIRE / FOLLOW / NHP Batch1 dual 升格为 coding 授权或 covered  
- 不切 qbank / 向量真相 / flip default / open DELETE / HA / `releaseEvidence=true`  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-rag-route · R4 P-PLANNER · 2026-09-16 PT · releaseEvidence=false · ≠HA*
