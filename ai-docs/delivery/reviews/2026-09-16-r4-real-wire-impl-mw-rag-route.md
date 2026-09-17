# Review — R4 **REAL-WIRE-IMPL**（执行前验收门 · 第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读）  
**结论**：**pass**（限：harness/eval/slice 够格当 **REAL-WIRE-IMPL 验收门**；**本刀正确零 coding · 零 prove**；**≠ 批 Worker coding** · **≠ R4 已关** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ full P-WIRE** · **≠ dispatch 已接线**）  
**releaseEvidence=false** · Not HA · **通过前仍禁 coding/prove** · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-real-wire-impl-mw-rag-route.md`  
对照：`harness/r4-real-wire-impl.md` · `eval/r4-real-wire-impl.eval.md` · `r4-real-wire-impl.slice.md` · 父轨 §6c/§6e · status · 前序 REAL-WIRE inventory（correctly NOT wiring）· P-PLANNER post-prove（unit only）  
配对：`mw-e2e-ha`（已独立 pass；**不替代**本域）

## 专家问答（REQUEST Q1–Q8）

| # | 问 | 答 |
|---|----|----|
| 1 | intended wire 是否诚实：planner→validate→assemble（generationId/recipeId）→dispatch→recheck？ | **是**。对齐 W1–W5 / 父轨 W1–W6；与 domain/db 合同一致。 |
| 2 | 本刀无 coding / 无 prove，仅文档？ | **同意**。CMD=`not_run:pre_dual_review`。 |
| 3 | P-FAKEPLAN 禁令必须保留？ | **同意**。主叶硬塞 / 缺 generation·recipe = 假绿。 |
| 4 | G-R2-5 保留；`recheck_failed` fail-closed，不打开 unscoped？ | **同意**（W5–W6）。 |
| 5 | R4 仍 NOT closed；将来接线绿 ≠ wrong_track=0（ADV 单独）？ | **同意**（W7）。 |
| 6 | P-PLANNER post-prove dual（unit only）≠ dispatch 已接线 / full wire 已关？ | **同意**。unit 组装绿 ≠ retrieve 已消费。 |
| 7 | 本刀 dual pass 本身不授权 coding（须 separate authorize）？ | **同意**。meetwise continue 须 dual 齐后 **另发** coding authorize；本 pass ≠ 改仓许可。 |
| 8 | `releaseEvidence=false`；禁 flip / open DELETE / HA？ | **同意**。 |

## 静态旁证（本审 · 零 prove）

| 项 | 裁定 |
|----|------|
| `dispatchTrackLocalRetrieval(` in `apps/worker/src` | **零调用**（仅注释提及） |
| helper `qbank-planner-retrieval-plan.ts` | **存在 · 未进** retrieve 主路径 |
| G-R2-5 script | 根/worker **仍在** |
| NHP-R4 六列 | harness §5 **不升格**；ADV 仍 gap/blocked |

## 批准范围（本审）

**批**：验收门文档完备（W1–W7 + 假绿表）；本刀不 coding/prove；P-FAKEPLAN 禁令；G-R2-5 + recheck fail-closed；R4 仍开；接线绿 ≠ wrong_track=0；P-PLANNER dual ≠ 本刀 coding；本 dual ≠ separate authorize。  

**不批**：Worker wiring、prove 绿关、R4/题域关闸、wrong_track=0、full P-WIRE、dispatch 已接线、covered、HA、`releaseEvidence=true`、P-FAKEPLAN、实现方自批。

## 与前序边界

| 前序 | 读法 |
|------|------|
| REAL-WIRE inventory dual | **correctly NOT wiring**（当时主挡 P-PLANNER）— 本刀 = **打开实现验收门文档**，非翻案偷接 |
| P-PLANNER post-prove dual | **unit only** — 组装合同齐；**仍未**进 retrieve |
| FOLLOW honesty | 仍不接线；≠ 本刀 coding |

## 非宣称

禁止：本刀已接线、R4/题域已隔离、wrong_track=0、full P-WIRE、P-PLANNER dual = 可改仓、本 dual = coding 已批、covered、HA、`releaseEvidence=true`、削弱 G-R2-5、P-FAKEPLAN、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-real-wire-impl-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-mw-rag-route.md`
- HEAD：`639134f`
