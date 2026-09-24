# REQUEST — G7 Local Full-Suite Execution Plan（docs+REQUEST）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:20 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ 0 BUG 已证** · **≠ controlPlaneClosed** · **≠ suite green** · **≠ R2/R4 closed** · **零 suite run**  
**配对**：`REQUEST-2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本刀 **不**送审（无 MODEL-OP live 子集；R2 live classify 仅 inventory 指针）  
**硬闸**：G1–G7 **已生效（policy）**；G7 suite 仍 **`not_run`**；**本 REQUEST ≠ 已授权开跑全量套件** · **≠ R4 wire 改动授权**  
**本刀**：停在 harness/slice/eval/REQUEST；suite 状态 = **`not_run:pre_dual_review`** / **RECHECK-ready**（对齐配对域 B1）  
**配对条件阻塞**：`reviews/2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`（**conditional** · B1）  
**RECHECK**：`REQUEST-2026-09-16-g7-full-suite-plan-RECHECK-mw-rag-route.md`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/g7-full-suite-plan.slice.md` | 切片索引 |
| `delivery/harness/local-full-suite-verification.md` | **执行计划 harness**（含 R2/R4 CMD 冻结 · 假绿禁令） |
| `delivery/eval/g7-full-suite-plan.eval.md` | 评测笔记 |
| `delivery/north-star-hard-gates.md` **G7** | 门禁 SSOT（已生效 ≠ 套件已绿） |
| `delivery/non-happy-path-perf-load-case-matrix.md` | NHP-R2-* / NHP-R4-* 行 |
| `harness/r2-*` · `harness/r4-*` · Batch3 R4 NEG/FAULT | RAG 域诚实指针 |
| `harness/r5-retirement-sole-stack-status.md` · qdrant-* | sole-stack / R5 假绿面 |
| `harness/ha-track.*.md` | HA = **honesty-not-HA**（非本域主责，须拒 HA 偷渡） |
| 前序 G7 生效审 | `reviews/2026-09-16-north-star-g7-local-full-suite-mw-rag-route.md` |

---

## 切片立场（RAG 域对抗焦点）

本刀是 **G7 执行计划**文档闸，不是 R2/R4 关闸刀、不是 wire 刀、不是 suite 开跑刀。  
RAG 域须重点核对：计划是否把 R2/R4 proves **正确标为 honesty ≠ closed**；是否禁止用 pgvector/`vectorstore:prove`/mysql-stack 连通绿冒充 sole-stack / RAG covered；是否禁止 HA probe 绿冒充 HA。

不得冒充：

- R2 overall closed / 路由已生效 / R4 closed / wrong_track=0 / ADV covered / planner leaf 关  
- G7 suite green / 0 BUG / `releaseEvidence=true` / 生产 HA  
- 「G7 已生效」= 授权开跑全量套件或改 R4 wire  
- Qdrant opt-in prove = 默认 RAG 已迁 / R5 关  

---

## 请专家复核（文档审 · **零 suite run** · RAG 焦点）

1. R2/R4 CMD 冻结是否处处钉 **≠ R2/R4 closed** · **≠ wrong_track=0** · **≠ ADV covered**？  
2. sole-stack / R5 / pgvector 假绿禁令是否足够（对照 inventory + r5-retirement）？  
3. NHP-R2/R4 与 Batch1–3 指针是否诚实（Batch3 = **`executed:awaiting_post_prove_dual`** · EXIT=0 ≠ covered ≠ G7 绿；Batch1/2 honesty ≠ covered）？  
4. 是否错误把 G7 policy 生效读成 suite 已绿或 R4 可改 wire？（期望：**否**）  
5. HA 段是否保持 **honesty-not-HA**（期望：**是**；拒 HA 偷渡）？  
6. 实现方是否越权跑 prove / 改 Worker/R4 wire / 读 `.env*` / 自批？（期望：**否**）

---

## 请专家回答（结论落 reviews/）

1. 本执行计划（RAG 相关 inventory + 诚实钉）是否可接受为 **G7 开跑前基线（plan-only）**？  
2. 是否同意：**双审通过前不得开始全量套件执行**，且 **不得**借本刀改 R4 wire？  
3. 双审通过后，开跑是否仍须 **另发执行授权** + CMD+EXIT 回执，且 R2/R4 EXIT=0 仍 ≠ closed？  
4. 阻塞项（若有）是什么？  
5. 是否需扩/缩 R2/R4 CMD 列表或加强 wrong_track ADV deferred 钉？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；**不是** suite 开跑授权；**不是** R2/R4 closed。  
- 不宣称 suite green / covered / HA / 0 BUG / `releaseEvidence=true` / controlPlaneClosed / 路由已生效。  
- **await dual before any suite run**；本刀零 suite run。  
- 实现方 **不**自写 pass reviews。  
- **未**改 Worker / R4 wire；**未**读 `.env*`；**未** commit。

---

*REQUEST · mw-rag-route · G7 full-suite plan · 2026-09-16 ~19:20 PT（B1 对齐注 ~19:30）· RECHECK-ready · suite not_run · Batch3=executed:awaiting_post_prove_dual ≠ G7 green · releaseEvidence=false · ≠HA · ≠R2/R4 closed*
