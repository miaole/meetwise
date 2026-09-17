# REQUEST — R4 **REAL-WIRE-IMPL**（Worker retrieve 真接线验收门 · **不 coding / 不 prove**）→ mw-e2e-ha

**状态**：**`REQUEST-ready` / `not_run:pre_dual_review`**（REQUEST / 待审；实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（PT · ~08:12）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **本刀 ≠ 完整 E2E** · **≠ dispatch 已接线** · **≠ wrong_track=0** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）· **≠** 非happy prove 笼统开跑 · **≠** 本 REQUEST 自带 coding / 绿关批准  
**配对**：`REQUEST-2026-09-16-r4-real-wire-impl-mw-rag-route.md`

---

## 对照

- `harness/r4-real-wire-impl.md` · `eval/r4-real-wire-impl.eval.md` · `r4-real-wire-impl.slice.md`  
- `harness/r4-domain-isolation.md` §6c / §6e · status  
- `harness/r4-p-planner.md`（P-PLANNER **post_prove_dual_pass · unit only**）  
- `non-happy-path-perf-load-case-matrix.md` §1.5（NHP-R4-* · 零 covered）  
- `e2e-requirement-coverage-matrix.md` GAP-RAG-04  
- `apps/worker/src`（**仍零** `dispatchTrackLocalRetrieval(`；本刀不改）  
- 前序：`2026-09-16-r4-real-wire-mw-e2e-ha.md`（pass · correctly NOT wiring）· P-PLANNER post-prove e2e review（pass · unit only）

---

## 切片立场

meetwise 在 P-PLANNER unit dual 关闭后，授权 **打开** REAL-WIRE-IMPL pre-exec 文档。验收链为 planner output → validate → assemble 完整 `RetrievalPlan`（generationId/recipeId）→ `dispatchTrackLocalRetrieval` → recheck；保留 G-R2-5；禁 P-FAKEPLAN；`recheck_failed` fail-closed。

**不得**冒充：完整 E2E / covered / HA / `releaseEvidence=true` / R4 关 / 题域已隔离 / wrong_track=0 / full wire 已关 / 「已批准 Worker 实现」。

本刀：**未改** Worker；**未跑** prove（`not_run:pre_dual_review`）。

---

## 双审通过前请勿要求实现方 coding / 绿关

| 项 | 本刀 |
|----|------|
| REAL-WIRE-IMPL prove | **not_run:pre_dual_review** |
| Worker planner / dispatch | **仍零接线**（本刀保持） |
| sole allowlist | **不扩** |
| NHP-R4 六列 | **零 covered**（不升格） |
| wrong_track=0 | **ADV 单独** |

coding/prove **forbidden** until dual pass + **separate authorize**。

---

## 请专家回答

1. 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / dispatch 已接线？  
2. harness 是否够格当 REAL-WIRE-IMPL 验收门（非实现刀）？  
3. 是否同意：**本刀无 coding / 无 prove**？  
4. 是否同意：**P-FAKEPLAN 禁令**、完整 generationId/recipeId、G-R2-5 必须保留？  
5. 是否同意：`recheck_failed` 必须 fail-closed，不回退 unscoped？  
6. 是否同意：**R4 仍 NOT closed**；接线绿 ≠ wrong_track=0（ADV 单独）？  
7. sole allowlist 是否因本切片扩面？（期望：**否**）  
8. NHP-R4 是否仍 **不得**因本刀升 covered？  
9. 是否同意：本刀 dual pass **不**自动授权 Worker coding（须 separate authorize）？  
10. 是否同意：禁 flip default / open DELETE / HA？

---

## 非宣称

- 本 REQUEST **不是** pass；实现方禁止自批  
- 不宣称 covered / HA / releaseEvidence=true / sole cutover / flip default / open DELETE  
- 不宣称生产 planner/dispatch 已接线 / R4 closed / 题域已隔离 / wrong_track=0  
- **await dual**；coding/prove 另授权

---

*REQUEST · mw-e2e-ha · R4 REAL-WIRE-IMPL · 2026-09-16 PT · releaseEvidence=false · ≠HA*
