# REQUEST — G7 Local Full-Suite Execution Plan（docs+REQUEST）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:20 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ 0 BUG 已证** · **≠ controlPlaneClosed** · **≠ suite green** · **零 suite run**  
**配对**：`REQUEST-2026-09-16-g7-full-suite-plan-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本刀 **不**送审（无 MODEL-OP live 子集）  
**硬闸**：G1–G7 **已生效（policy）**；G7 suite 仍 **`not_run`**；**本 REQUEST ≠ 已授权开跑全量套件**  
**本刀**：停在 harness/slice/eval/REQUEST；suite 状态 = **`not_run:pre_dual_review`** / **RECHECK-ready**（B1 对齐后）  
**条件阻塞审据**：`reviews/2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`（**conditional** · B1）  
**RECHECK**：`REQUEST-2026-09-16-g7-full-suite-plan-RECHECK-mw-e2e-ha.md`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/g7-full-suite-plan.slice.md` | 切片索引 |
| `delivery/harness/local-full-suite-verification.md` | **执行计划 harness**（prereqs · inventory · CMD 冻结 · 假绿禁令） |
| `delivery/eval/g7-full-suite-plan.eval.md` | 评测笔记 |
| `delivery/north-star-hard-gates.md` **G7** | 门禁 SSOT（已生效 ≠ 套件已绿） |
| `delivery/harness/e2e-full-suite.inventory.md` | 全量家族命令构成 |
| `delivery/non-happy-path-perf-load-case-matrix.md` | NHP 全表 · Batch1/2/3 |
| `delivery/nhp-batch1-neg-perf.slice.md` 等 | Batch1/2 = post_prove_dual_pass（honesty）；Batch3 = **`executed:awaiting_post_prove_dual`**（EXIT=0 ≠ covered ≠ G7 绿） |
| `delivery/harness/ha-track.skeleton.md` · `ha-track.multi-instance.md` | HA probes · **honesty-not-HA** |
| 前序 G7 生效审 | `reviews/2026-09-16-north-star-g7-local-full-suite-mw-e2e-ha.md`（文档闸；**≠** exec 授权） |

---

## 切片立场

本刀在 **G7 门禁已生效** 之后，交付 **本地全量套件执行计划**（如何站起 sole-stack、跑全部 cases/UCs 含非快乐六列、CMD 冻结、诚实钉、假绿禁令），供独立专家文档双审。  
**未**开跑套件；**未**宣称 suite green / HA / 0 BUG / `releaseEvidence=true`。

不得冒充：

- G7 全套已跑通 / suite green / 全量 E2E 已齐 / 交付已成功  
- 「G7 已生效」= 「已授权开跑」或「已证 0 BUG / 100% HA」  
- HA probe / skeleton / 本地 dual = 生产 HA  
- Batch1/2 post_prove = covered / G7 收据齐  
- 刀绿 / dual pass / 单 prove EXIT=0 = 成功  

---

## 请专家复核（文档审 · **零 suite run**）

1. 执行计划是否足够定义：**全栈 prereqs**（compose/sole-stack）+ **禁 `.env*`**？  
2. Inventory 是否覆盖：Batch1/2/3 · UC e2e · R2/R4 proves · HA probes（**honesty-not-HA**）· inventory 宽家族？  
3. 是否处处钉 **G7 effective ≠ suite green** · **≠ 0 BUG** · **≠ HA** · `releaseEvidence=false`？  
4. CMD 冻结表是否全部 `not_run` / 注释，且无暗示本刀已跑？  
5. 退出标准（全栈 + 全 cases/UCs + CMD+EXIT 收据 + 双域独立审）是否可接受为 G7 收据门槛？  
6. 是否错误把「G7 已生效」读成「已授权开跑全量套件」？（期望：**否**）  
7. 实现方是否越权跑套件 / 改 Worker / 读 `.env*` / 自批 pass？（期望：**否**）  
8. HA 是否被偷渡成「G7 绿 = HA」？（期望：**否**；仅 honesty-not-HA）

---

## 请专家回答（结论落 reviews/）

1. 本执行计划是否可接受为 **G7 开跑前基线（plan-only）**？  
2. 是否同意：**双审通过前不得开始全量套件执行**？  
3. 双审通过后，开跑是否仍须 meetwise-core（或等价）**另发执行授权** + 全量 CMD+EXIT 回执？  
4. 阻塞项（若有）是什么？  
5. Inventory 是否需扩/缩（例：Batch3 已 = `executed:awaiting_post_prove_dual` 且须钉 ≠ G7 绿、或 HA 探针必须另册）？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass；**不是** suite 开跑授权。  
- 不宣称 suite green / covered / HA / 0 BUG / `releaseEvidence=true` / controlPlaneClosed。  
- **await dual before any suite run**；本刀零 suite run。  
- 实现方 **不**自写 pass reviews。  
- **未**改 Worker；**未**读 `.env*`；**未** commit。

---

*REQUEST · mw-e2e-ha · G7 full-suite plan · 2026-09-16 ~19:20 PT（B1 对齐注 ~19:30）· RECHECK-ready · suite not_run · Batch3=executed:awaiting_post_prove_dual ≠ G7 green · releaseEvidence=false · ≠HA*
