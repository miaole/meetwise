# REQUEST — NHP Batch3 FAULT/BOUND（第三批 scoped）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:15 PT · FAULT FLIPPED honesty 已对齐；见 RECHECK）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ 全量 E2E 已齐**  
**配对**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify 子集；**不要**加 MODEL-OP live）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· 矩阵双域文档闸已 pass · Batch1+Batch2 = **post_prove_dual_pass**（honesty ≠ covered）· **本 REQUEST ≠ 已授权开跑 prove**  
**本刀**：**停在 harness/REQUEST**；**未跑**任何 prove · 状态 = **REQUEST-ready** / **not_run:pre_dual_review**
**RECHECK**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md`（措辞修；对照 rag `changes_requested`）

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/nhp-batch3-fault-bound.slice.md` | 切片索引 |
| `delivery/harness/nhp-batch3-fault-bound.md` | Batch3 CMD 冻结；**未跑**（注释块） |
| `delivery/eval/nhp-batch3-fault-bound.eval.md` | 评测笔记；延期清单 |
| `delivery/non-happy-path-perf-load-case-matrix.md` | 用例全表 SSOT |
| `delivery/harness/non-happy-path-perf-load-matrix.md` | 父 harness |
| `delivery/nhp-batch1-neg-perf.slice.md` / harness | Batch1 = **post_prove_dual_pass**（IDs 不重复） |
| `delivery/nhp-batch2-neg-fault.slice.md` / harness | Batch2 = **post_prove_dual_pass**（IDs 不重复） |
| `delivery/e2e-requirement-coverage-matrix.md` §0.5 / §1.0 | 强制列 + 盲区 |
| `delivery/north-star-hard-gates.md` | 硬闸（文档闸已生效 ≠ prove 笼统开跑） |
| 前序矩阵审 | `reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（文档闸 pass；仍禁笼统 prove） |

---

## 切片立场

本刀是 Batch1+Batch2 `post_prove_dual_pass`（honesty ≠ covered）之后的 **第三条授权批次路径**：只交付 **Batch3（7 case IDs · FAULT/BOUND + R4 NEG/FAULT honesty）** 的 harness/eval/REQUEST，供独立专家审。  
**未**执行 prove；**未**升 covered；**未**宣称 LOAD/PERF SLO/HA/R4 closed/wrong_track ADV covered。

不得冒充：

- 非快乐路径全家已执行 / covered / family green  
- PERF P95 / 线上 SLO / LOAD 产能已证  
- 015 OCR FAULT / 011 refund 全家 / 017 LOAD / 019 covered / 033 七类 ADV 齐  
- R4 closed / planner leaf 关 / wrong_track=0（RAG 交配对域）  
- `releaseEvidence=true` / HA / UI-pay / cloud-kill  
- 「Batch1/2 dual pass」或「硬闸已生效」= 「本批 prove 已自动授权」

---

## Batch3 范围（请核对选型）

| Case ID | CMD（双审后才可谈跑） | EXIT=0 读法（若将来跑） |
|---------|----------------------|-------------------------|
| NHP-015-BOUND-01 | `pnpm uc015:ingest-failures:prove` | F2/F3 BOUND partial ≠ OCR FAULT / ≠ LOAD |
| NHP-011-FAULT-01 | `pnpm uc011:report-refund:prove` | 失败→released DB 口径 ≠ refund complete / ≠ UI-pay |
| NHP-017-BOUND-01 | `pnpm uc017:orphan:prove` | sweeper 幂等 ≠ LOAD |
| NHP-019-NEG-01 | `pnpm uc019:report-regenerate:prove` | quarantine regen GAP ≠ 019 covered |
| NHP-033-BOUND-01 | `pnpm uc033:cross-user-authz:prove` | X10 burst ≠ PERF/LOAD SLO |
| NHP-R4-NEG-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | （配对域主审）snapshot missing honesty ≠ R4 closed |
| NHP-R4-FAULT-01 | `pnpm g4-dispatch-recheck-prereq:prove` | （配对域主审）**FLIPPED（≥1 call site / wire present）** · seam honesty only；**仍 ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** |

**CMD 核验**：上表 7 条均在根 `package.json` 确认存在（2026-09-16）。

**排除（Batch1 已做）**：NHP-001-NEG-01 · NHP-001-PERF-api-01 · NHP-015-NEG-01 · NHP-050-NEG-01 · NHP-033-NEG-01 · NHP-R2-NEG-01 · NHP-R2-FAULT-01。

**排除（Batch2 已做）**：NHP-002-BOUND-01 · NHP-010-FAULT-01 · NHP-011-NEG-01 · NHP-017-FAULT-01 · NHP-018-NEG-01 · NHP-019-FAULT-01 · NHP-R4-BOUND-01。

**延期（本批外 · 不可 runnable 冒充）**：全部 LOAD · PERF-CLOUD · HA · UI-pay · cloud-kill · wrong_track ADV covered · NHP-015-FAULT（无 prove 锚）· NHP-011-BOUND（本批优先 FAULT）· R4 ADV/PERF · R5 · RAG-LOAD · MODEL-OP live · R4 wire 改动。

---

## 请专家复核（文档审 · 本刀不要求复跑 prove）

1. Batch3 是否足够小且高价值（FAULT/BOUND + R4 NEG/FAULT honesty），且 **可无云 Key** 谈执行？  
2. 是否与 Batch1+Batch2 14 IDs **无重叠**？  
3. EXIT=0 / not_run 读法是否处处钉 `≠ covered` / partial / honesty？  
4. 是否错误把矩阵文档闸 pass / Batch1+2 post_prove_dual_pass / 硬闸生效读成「已授权开跑本批 prove」？（期望：**否**）  
5. 实现方是否越权跑了 prove / 回写 covered / 改 R4 wire / 读 `.env*`？（期望：**否**；本刀零 prove）  
6. LOAD/HA/云/UI-pay/wrong_track ADV covered / 015-FAULT 是否被偷渡进本批绿叙事？（期望：**否**）

---

## 请专家回答（结论落 reviews/）

1. 本 Batch3 范围与 CMD 冻结是否可接受为 **第三批执行前基线**？  
2. 是否同意：**在双审通过前不得开始本批 prove**？  
3. 双审通过后，开跑是否仍须 meetwise-core（或等价）**另发执行授权** + CMD+EXIT 回执？  
4. 阻塞项（若有）是什么？  
5. 是否需要扩/缩 case ID 列表（例：是否应纳入 NHP-011-BOUND 或排除共享锚 CMD）？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / PERF SLO / UC 全家齐 / R4 closed / wrong_track=0。  
- **await dual before prove**；本刀零 prove。  
- 实现方 **不**自写 pass reviews。  
- **未**改 R4 wire；**未**读 `.env*`；**未**开 Meridian。

---

*REQUEST · mw-e2e-ha · NHP Batch3 FAULT/BOUND · 2026-09-16 ~19:15 PT · REQUEST-ready · R4-FAULT FLIPPED honesty · releaseEvidence=false · ≠HA · 零 prove*
