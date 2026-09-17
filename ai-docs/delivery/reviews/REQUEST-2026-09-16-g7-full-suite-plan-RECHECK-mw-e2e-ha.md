# RECHECK REQUEST — G7 Full-Suite Plan · 闭合 conditional B1 → mw-e2e-ha

**状态**：**RECHECK / 待复审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:30 PT）  
**对照条件阻塞回执**：`reviews/2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`（**conditional** · **B1** Batch3 状态钉过期）  
**配对**：`REQUEST-2026-09-16-g7-full-suite-plan-RECHECK-mw-rag-route.md`  
**原 REQUEST**：`REQUEST-2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ suite green** · **≠ 0 BUG** · **≠ controlPlaneClosed** · **本刀零 suite run** · **无 model-op**

---

## 阻塞闭合（文档 only · B1）

对照 `2026-09-16-g7-full-suite-plan-mw-e2e-ha.md` §4 **B1**：

| 项 | 修前（过期） | 修后（对齐现场） |
|----|--------------|------------------|
| Batch3 生命周期钉 | `not_run:pre_dual_review` / REQUEST-ready | **`executed:awaiting_post_prove_dual`**（对齐 `harness/nhp-batch3-fault-bound.md` · 7×已跑 · await post-prove dual） |
| G7 读法 | 「未跑」 | **EXIT=0 honesty ≠ covered ≠ 自动并入 G7 绿 ≠ G7 收据齐**；post-prove dual 未闭前不得当全量绿证据 |
| 本计划刀 suite | — | 仍全部 CMD **`not_run:pre_dual_review`** / **零 suite run**（他刀 Batch3 executed **≠** 本刀开跑） |

**重申（硬句）**：**Batch3 EXIT=0 honesty ≠ covered ≠ automatic G7 suite green**。

| 文件 | 改动摘要 |
|------|----------|
| `harness/local-full-suite-verification.md` | §2.1 Batch3 行 + 硬句；§4 注释；假绿表；状态表；RECHECK 指针 |
| `g7-full-suite-plan.slice.md` | Batch3 行 + B1 硬钉 + RECHECK 产物 |
| `eval/g7-full-suite-plan.eval.md` | I1 / 诚实表 / 清单 + RECHECK 指针 |
| 保留 | ADV deferred nit：`# pnpm r4-wrong-track-adv:prove`（wire≠ADV≠R4 closed；≠ covered / ≠ suite green） |

**未做**：任何 suite / prove / e2e / load / HA 开跑 · Worker 改码 · 读 `.env*` · commit · 自批 pass · suite exec authorize。

---

## 请专家确认

1. **B1** 是否已闭合（Batch3 状态钉 = `executed:awaiting_post_prove_dual` + 重申 ≠ covered ≠ 自动并入 G7 绿）？本域可否从 **conditional** → **pass**（仍限 plan-only 文档闸）？  
2. 是否仍同意：**G7 effective ≠ suite green**；本计划 dual/RECHECK pass **≠** suite 开跑授权；仍须 meetwise-core **另发执行授权**？  
3. 是否仍同意：`releaseEvidence=false` · ≠HA · ≠ covered · ≠ 0 BUG · 全量 suite CMDs 仍冻结 `not_run` · **零 suite run**？  
4. 是否仍同意：不阻断并行 R4 ADV / REAL-WIRE；他刀绿 ≠ G7？

---

## 非宣称

- 本 RECHECK **不是** pass · **不是** suite green · **不是** exec authorize  
- **不**把 Batch3 EXIT=0 / `executed:awaiting_post_prove_dual` 读成 covered / G7 齐 / `releaseEvidence=true`  
- 实现方 **禁止自批**；配对域须独立复审

---

*RECHECK REQUEST · mw-e2e-ha · G7 full-suite plan B1 · 2026-09-16 ~19:30 PT · releaseEvidence=false · 零 suite run · Batch3=executed:awaiting_post_prove_dual ≠ G7 green*
