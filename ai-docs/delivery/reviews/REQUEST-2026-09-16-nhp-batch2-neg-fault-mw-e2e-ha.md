# REQUEST — NHP Batch2 NEG/FAULT/BOUND（第二批 scoped）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~05:21 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ 全量 E2E 已齐**  
**配对**：`REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify 子集；**不要**加 MODEL-OP live）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· 矩阵双域文档闸已 pass · Batch1 = **post_prove_dual_pass** · **本 REQUEST ≠ 已授权开跑 prove**  
**本刀**：**停在 harness/REQUEST**；**未跑**任何 prove · 状态 = **REQUEST-ready** / **not_run:pre_dual_review**

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/nhp-batch2-neg-fault.slice.md` | 切片索引 |
| `delivery/harness/nhp-batch2-neg-fault.md` | Batch2 CMD 冻结；**未跑**（注释块） |
| `delivery/eval/nhp-batch2-neg-fault.eval.md` | 评测笔记；延期清单 |
| `delivery/non-happy-path-perf-load-case-matrix.md` | 用例全表 SSOT |
| `delivery/harness/non-happy-path-perf-load-matrix.md` | 父 harness |
| `delivery/nhp-batch1-neg-perf.slice.md` / harness | Batch1 = **post_prove_dual_pass**（IDs 不重复） |
| `delivery/e2e-requirement-coverage-matrix.md` §0.5 / §1.0 | 强制列 + 盲区 |
| `delivery/north-star-hard-gates.md` | 硬闸（文档闸已生效 ≠ prove 笼统开跑） |
| 前序矩阵审 | `reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（文档闸 pass；仍禁笼统 prove） |

---

## 切片立场

本刀是 Batch1 `post_prove_dual_pass` 之后的 **第二条授权批次路径**：只交付 **Batch2（7 case IDs · NEG/FAULT/BOUND）** 的 harness/eval/REQUEST，供独立专家审。  
**未**执行 prove；**未**升 covered；**未**宣称 LOAD/PERF SLO/HA/R4 closed。

不得冒充：

- 非快乐路径全家已执行 / covered / family green  
- PERF P95 / 线上 SLO / LOAD 产能已证  
- 002 / 010 / 011 / 017 / 018 / 019 全家 covered  
- refund / abandon / regen / lease / SSE 已闭环齐  
- R4 closed / planner leaf 关（RAG 交配对域）  
- `releaseEvidence=true` / HA  
- 「Batch1 dual pass」或「硬闸已生效」= 「本批 prove 已自动授权」

---

## Batch2 范围（请核对选型）

| Case ID | CMD（双审后才可谈跑） | EXIT=0 读法（若将来跑） |
|---------|----------------------|-------------------------|
| NHP-002-BOUND-01 | `pnpm uc002:lease:prove` | lease 竞态 partial ≠ 002 covered |
| NHP-010-FAULT-01 | `pnpm uc010:sse-resume:prove` | SSE/LED resume partial ≠ SLO |
| NHP-011-NEG-01 | `pnpm uc011:report-refund:http:prove` | quarantine 误退拒 ≠ refund complete |
| NHP-017-FAULT-01 | `pnpm uc017:orphan:prove` | orphan reserved→released ≠ LOAD |
| NHP-018-NEG-01 | `pnpm uc018:abandon:http:prove` | abandon 后复活拒 ≠ 018 covered |
| NHP-019-FAULT-01 | `pnpm uc019:report-regenerate:http:prove` | retry∥release 并发 ≠ covered |
| NHP-R4-BOUND-01 | `pnpm g4-production-scoped-retrieve:prove` | （配对域主审）主叶 scoped honesty ≠ R4 closed / ≠ planner leaf |

**CMD 核验**：`uc011:report-refund:http:prove` 已在根 `package.json` 确认存在（矩阵原文曾写「uc011 http/prove」泛称）。

**排除（Batch1 已做）**：NHP-001-NEG-01 · NHP-001-PERF-api-01 · NHP-015-NEG-01 · NHP-050-NEG-01 · NHP-033-NEG-01 · NHP-R2-NEG-01 · NHP-R2-FAULT-01。

**延期（本批外 · 不可 runnable 冒充）**：全部 LOAD · PERF-CLOUD · HA · UI-pay · cloud-kill · wrong_track ADV · R4 ADV/NEG/FAULT/PERF · R5 · RAG-LOAD · MODEL-OP live。

---

## 请专家复核（文档审 · 本刀不要求复跑 prove）

1. Batch2 是否足够小且高价值（NEG/FAULT/BOUND + 一条 R4 BOUND honesty），且 **可无云 Key** 谈执行？  
2. 是否与 Batch1 7 IDs **无重叠**？  
3. EXIT=0 读法是否处处钉 `≠ covered` / partial / honesty？  
4. 是否错误把矩阵文档闸 pass / Batch1 post_prove_dual_pass / 硬闸生效读成「已授权开跑本批 prove」？（期望：**否**）  
5. 实现方是否越权跑了 prove / 回写 covered？（期望：**否**；本刀零 prove）  
6. LOAD/HA/云/UI-pay/wrong_track ADV 是否被偷渡进本批绿叙事？（期望：**否**）

---

## 请专家回答（结论落 reviews/）

1. 本 Batch2 范围与 CMD 冻结是否可接受为 **第二批执行前基线**？  
2. 是否同意：**在双审通过前不得开始本批 prove**？  
3. 双审通过后，开跑是否仍须 meetwise-core（或等价）**另发执行授权** + CMD+EXIT 回执？  
4. 阻塞项（若有）是什么？  
5. 是否需要扩/缩 case ID 列表？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / PERF SLO / UC 全家齐 / R4 closed。  
- **await dual before prove**；本刀零 prove。  
- 实现方 **不**自写 pass reviews。

---

*REQUEST · mw-e2e-ha · NHP Batch2 NEG/FAULT/BOUND · 2026-09-16 ~05:21 PT · REQUEST-ready · releaseEvidence=false · ≠HA · 零 prove*
