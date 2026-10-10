# RECHECK Review — G7 Full-Suite Plan（B1 Batch3 对齐 + ADV deferred · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读 · **零 suite run**）  
**结论**：**pass**（限：e2e-ha **conditional B1** 与本域前序 Q3 过期钉 **已对齐**；ADV deferred 行 **保留满意**；计划仍 **plan-only**）  
**硬钉**：**零 suite run** · **G7 policy ≠ suite green** · **Batch3 EXIT=0 ≠ covered ≠ automatic G7 绿** · **≠ R2/R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** · **releaseEvidence=false** · **≠HA** · **不改 R4 wire**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 RECHECK REQUEST：`REQUEST-2026-09-16-g7-full-suite-plan-RECHECK-mw-rag-route.md`  
前序本域：`2026-09-16-g7-full-suite-plan-mw-rag-route.md`（pass · Q3 B3=pre_dual **现已更正**）

## 专家确认

| # | 问 | 答 |
|---|----|----|
| 1 | Batch3 计划钉 = `executed:awaiting_post_prove_dual`，EXIT=0 ≠ covered ≠ automatic G7 green？ | **接受**（更新前序 Q3）。 |
| 2 | ADV deferred nit（`r4-wrong-track-adv:prove`）仍满意？ | **是**（§4 显式 DEFERRED；wire≠ADV≠R4 closed；≠ covered / ≠ suite green）。 |
| 3 | 不得借本刀开跑全量 / 改 R4 wire；dual ≠ exec authorize；R2/R4 EXIT=0 ≠ closed？ | **仍同意**。 |
| 4 | releaseEvidence=false · ≠HA · 零 suite run · 无 model-op？ | **仍可接受**。 |

## 核验摘要

| 文件 | 裁定 |
|------|------|
| harness §2.1 Batch3 行 + B1 硬句 | `executed:awaiting_post_prove_dual`；假绿禁令齐 |
| harness §4 | `# pnpm r4-wrong-track-adv:prove` DEFERRED 行 **在** |
| slice / eval | 同步 RECHECK-ready |
| G7 suite 本刀 | 全 CMD 仍 **not_run**；零 suite run |

## 批准范围

**批**：B1 状态对齐闭合；ADV deferred 保留；plan-only 基线维持。  

**不批**：suite 开跑、suite green、把 Batch3/ADV EXIT=0 并入 G7 绿、R2/R4 关、wrong_track=0、ADV covered、HA、`releaseEvidence=true`、改 R4 wire。

## 非宣称

禁止：suite green、covered、R2/R4 closed、wrong_track=0、ADV covered、HA、0 BUG、controlPlaneClosed、本 RECHECK = exec authorize。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-full-suite-plan-RECHECK-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-full-suite-plan-RECHECK-mw-rag-route.md`
- 前序：`2026-09-16-g7-full-suite-plan-mw-rag-route.md`（Q3 过期 → **本 RECHECK 更正**）
- HEAD：`639134f`
