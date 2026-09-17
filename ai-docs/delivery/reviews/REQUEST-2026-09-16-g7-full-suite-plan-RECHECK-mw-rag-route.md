# RECHECK REQUEST — G7 Full-Suite Plan · 知悉/对齐 conditional B1 → mw-rag-route

**状态**：**RECHECK / 待复审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:30 PT）  
**对照配对域条件阻塞**：`reviews/2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`（**conditional** · **B1** Batch3 状态钉过期）  
**本域前序结论**：`reviews/2026-09-16-g7-full-suite-plan-mw-rag-route.md`（**pass** plan-only；Q3 曾写 B3=pre_dual — 现已过期，须对齐）  
**配对**：`REQUEST-2026-09-16-g7-full-suite-plan-RECHECK-mw-e2e-ha.md`  
**原 REQUEST**：`REQUEST-2026-09-16-g7-full-suite-plan-mw-rag-route.md`  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ suite green** · **≠ R2/R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** · **本刀零 suite run** · **无 model-op** · **不改 R4 wire**

---

## 为何送本域 RECHECK

配对 `mw-e2e-ha` 以 **conditional B1** 要求计划文对齐 Batch3 现场状态。实现方已改钉；本域前序 pass 中 Q3「B3 = still pre_dual / not_run」**已过期**，须短确认诚实对齐，冲突取更严。

| 项 | 对齐后 |
|----|--------|
| Batch3 | **`executed:awaiting_post_prove_dual`**（他刀 7×已跑 · await post-prove dual） |
| 硬句 | **EXIT=0 honesty ≠ covered ≠ automatic G7 suite green** · ≠ G7 收据齐 |
| G7 suite 本刀 | 全 CMD 仍 **`not_run`** · **零 suite run** |
| ADV deferred nit（本域 N5） | **保留**：`# pnpm r4-wrong-track-adv:prove` · DEFERRED(ADV) · wire≠ADV≠R4 closed · 即便他刀 EXIT=0 仍 ≠ covered / ≠ suite green |

| 文件 | 改动摘要 |
|------|----------|
| `harness/local-full-suite-verification.md` | Batch3 状态 + 假绿 + ADV deferred 行保留 |
| `g7-full-suite-plan.slice.md` · `eval/g7-full-suite-plan.eval.md` | 同步 B1 + RECHECK 指针 |

**未做**：suite/prove 开跑 · 改 Worker/R4 wire · 读 `.env*` · commit · 自批 · 抬 R2/R4 closed / wrong_track=0 / ADV covered。

---

## 请专家确认

1. 是否接受 Batch3 计划钉改为 **`executed:awaiting_post_prove_dual`**，且 **EXIT=0 ≠ covered ≠ automatic G7 suite green**（更新本域前序 Q3）？  
2. ADV deferred nit（`r4-wrong-track-adv:prove`）是否仍满意保留（wire≠ADV；≠ covered）？  
3. 是否仍同意：双审/RECHECK 前/后均 **不得**借本刀开跑全量套件或改 R4 wire；dual ≠ exec authorize；R2/R4 EXIT=0 仍 ≠ closed？  
4. `releaseEvidence=false` · ≠HA · 零 suite run · 无 model-op — 是否仍可接受？

---

## 非宣称

- 本 RECHECK **不是** pass · **不是** suite green · **不是** R2/R4 closed / wrong_track=0 / ADV covered  
- **不**把 Batch3 / ADV EXIT=0 读成 covered 或 G7 齐  
- 实现方 **禁止自批**；冲突取更严

---

*RECHECK REQUEST · mw-rag-route · G7 full-suite plan B1 align · 2026-09-16 ~19:30 PT · releaseEvidence=false · 零 suite run · Batch3=executed:awaiting_post_prove_dual ≠ G7 green · ADV deferred kept*
