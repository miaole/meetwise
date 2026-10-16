# Review — NHP Batch3 FAULT/BOUND（执行前 · RAG 子集 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读 · **零 prove**）  
**结论**：**changes_requested**（RAG 子集选型大体可谈；**阻塞**：NHP-R4-FAULT-01 / 矩阵 SSOT 仍写「生产路径无接线」，与仓库 **REAL-WIRE-IMPL 已 CALL_SITES≥1** 冲突 → **假绿/陈旧诚实钉**；须改钉后再谈 dual pass / 开跑）  
**硬钉**：**双审前禁 prove** · **≠ covered** · **≠ R4 关** · **≠ wrong_track=0** · **≠ 路由已生效** · **releaseEvidence=false** · **≠HA** · **本批刀不改 wire**  
**配对**：mw-e2e-ha · **无** mw-model-op · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`  
对照：`harness/nhp-batch3-fault-bound.md` · `eval/nhp-batch3-fault-bound.eval.md` · `nhp-batch3-fault-bound.slice.md` · 矩阵 §1.5 · `apps/worker/src/qbank-track-local-retrieve.ts` · `test/g4-dispatch-recheck-prereq.proof.ts`（FLIPPED）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 复核1 | 纳入 R4-NEG+FAULT honesty、排除 ADV covered / PERF / R5 / LOAD / 本刀改 wire，可接受？ | **选型可接受**；但 FAULT 诚实读法须先对齐现网（见阻塞）。 |
| 复核2 | EXIT=0 仍钉 ≠ R4 closed / ≠ planner / ≠ 路由已生效 / ≠ wrong_track=0？ | **必须仍钉**；当前 FAULT 行另有「无接线」过期句，须删改。 |
| 复核3 | 是否借用 Batch1/2 / G4 / G-R2-5 / P-PLANNER 自动批本批绿关？ | **否（未借用授权）**；但共享锚 CMD 须标明 **新 case 分面**，且 g4 prove 语义已 FLIPPED。 |
| 复核4 | 须并列 mw-model-op？ | **否**。无 MODEL-OP live。 |
| 复核5 | 双审前禁 prove 绿关复跑 / 禁本刀改 wire？ | **同意**。 |
| 结论1 | RAG 子集可否随 Batch3 进入「谈执行」？ | **条件可谈**：先修 FAULT/矩阵诚实钉；**本审不放行 dual pass**。 |
| 结论2 | 阻塞项？ | **有**（下节）。 |
| 结论3 | 双审通过前继续禁 prove？ | **是**（且本审未通过）。 |

## 阻塞项（须修后再送审 / 再谈 pass）

1. **NHP-R4-FAULT-01 诚实钉过期**  
   - harness §1 行：写「**生产路径无接线**」  
   - 矩阵 §1.5：写「合同 seam 有；**生产路径无**」「REAL-WIRE §6c **仍不接线**」  
   - **现网旁证**（本审静态）：`apps/worker/src/qbank-track-local-retrieve.ts` 已有 `dispatchTrackLocalRetrieval(` 调用；`g4-dispatch-recheck-prereq.proof.ts` 已 **FLIPPED** 断言 CALL_SITES≥1。  
   - **要求**：改写 FAULT EXIT/旗标读法为例如：seam/`recheck_failed` 合同 + FLIPPED CALL_SITES≥1 honesty；**仍 ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV covered**；**本批刀仍禁再改 wire**。不得继续宣称「生产路径无接线」。

2. **共享锚语义**  
   - `g4-dispatch-recheck-prereq:prove` 已不再等于「零调用 PREREQ」。Batch3 FAULT 若仍挂此 CMD，须在 harness/eval 显式写 **FLIPPED 读法**，避免把 EXIT=0 读成「仍未接线」。

**非阻塞（本审同意）**：R4-NEG-01 用 `g-r2-5-retrieve-fail-closed:prove`；排除 ADV covered / R4-BOUND（Batch2）/ PERF / LOAD；无 model-op；Batch3 本刀零 prove / 不改 wire；CMD 名在 package.json 存在。

## 批准范围

**不批**：本批 dual pass、prove 开跑、covered、R4 关、把过期「无接线」当诚实钉。  

**同意方向**（修钉后可再审）：Batch3 纳入 R4-NEG+FAULT honesty；双审前禁 prove；≠R4关；releaseEvidence=false。

## 非宣称

禁止：R4 已关、题域已隔离、wrong_track=0、路由已生效、covered、HA、`releaseEvidence=true`、本刀已接线绿关、实现方自批、生产路径仍「无接线」（与现网不符）。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`
- HEAD：`639134f`
