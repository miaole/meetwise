# REQUEST — R4 **REAL-WIRE-IMPL**（Worker retrieve 真接线验收门 · **不 coding / 不 prove**）→ mw-rag-route

**状态**：**`REQUEST-ready` / `not_run:pre_dual_review`**（REQUEST / 待审；实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT · ~08:12）  
**releaseEvidence=false** · Not HA · **pass ≠ R4 已关** · **≠ 题域已隔离** · **≠ dispatch 已接线** · **≠ wrong_track=0** · **≠ full P-WIRE 已关** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 本 REQUEST 授权 Worker coding / prove 绿关  
**配对**：`REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md`

---

## 对照

| 文件 | 角色 |
|------|------|
| `harness/r4-real-wire-impl.md` | **本刀** acceptance · intended wire · fail-closed · 冻结 CMD |
| `eval/r4-real-wire-impl.eval.md` | 评测勾选 |
| `r4-real-wire-impl.slice.md` | 切片索引 |
| `harness/r4-domain-isolation.md` §6c / §6e | W1–W6 inventory · 本刀指针 |
| `harness/r4-domain-isolation-status.md` | next = REAL-WIRE-IMPL await dual |
| `harness/r4-p-planner.md` | P-PLANNER **post_prove_dual_pass（unit only）** |
| `packages/domain/src/job-route-classifier.ts` | planner output + validation |
| `packages/domain/src/qbank-track-local-retrieval.ts` | assemble + `RetrievalPlan` validation |
| `packages/db/src/qbank-track-local-retrieval.ts` | dispatch + recheck seam |
| `apps/worker/src` | **仍零** dispatch；本刀不改 |

---

## 切片立场（实现方自认）

P-PLANNER unit dual 已关；meetwise 授权 **打开** REAL-WIRE 实现刀的 pre-exec 文档。本刀定义将来最小诚实 wire：

1. per-turn planner output → `validatePlannerOutput`（相对当前 snapshot）。  
2. assemble 完整 `RetrievalPlan`（**generationId/recipeId 必含**）+ validate。  
3. Worker retrieve 消费 `dispatchTrackLocalRetrieval` → recheck。  
4. 保留 **G-R2-5**；`recheck_failed` **fail-closed**，不回退兄弟叶 / unscoped / legacy。  
5. **禁 P-FAKEPLAN**。  
6. **接线绿 ≠ R4 closed ≠ wrong_track=0**；ADV 单独。  
7. 本刀 **零代码 · 零 prove**；CMD=`not_run:pre_dual_review`。

---

## 双审通过前请勿要求实现方开始 Worker wiring / 绿关

| 项 | 本刀 |
|----|------|
| REAL-WIRE-IMPL prove | **not_run:pre_dual_review** |
| Worker 改动 | **零** |
| dispatch | **仍未接线** |
| wrong_track ADV | **单独**；本刀不跑 |

coding/prove **forbidden** until dual pass + **separate authorize**。

---

## 请专家回答

1. harness intended wire 是否诚实：planner→validate→assemble（generationId/recipeId）→dispatch→recheck？  
2. 是否同意：**本刀无 coding / 无 prove**，仅 harness + eval + slice + REQUEST？  
3. 是否同意：**P-FAKEPLAN 禁令**必须保留？  
4. 是否同意：**G-R2-5 保留**；`recheck_failed` fail-closed，不打开 unscoped？  
5. 是否同意：**R4 仍 NOT closed**；将来接线绿 ≠ wrong_track=0（ADV 单独）？  
6. 是否同意：P-PLANNER post-prove dual pass（unit only）≠ dispatch 已接线 / full wire 已关？  
7. 是否同意：本刀 dual pass **本身不**授权 coding（须 separate authorize）？  
8. 是否同意：保持 `releaseEvidence=false`；禁 flip default / open DELETE / HA？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**接线生产 planner→retrieve→dispatch→recheck；**未**跑 prove  
- 不宣称 R4 closed / 题域已隔离 / wrong_track=0 / full P-WIRE  
- 不切 qbank / 向量真相 / flip default / open DELETE / HA / `releaseEvidence=true`  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-rag-route · R4 REAL-WIRE-IMPL · 2026-09-16 PT · releaseEvidence=false · ≠HA*
