# 评测笔记 — NHP Batch2 · 第二批 NEG/FAULT/BOUND（scoped · eval-first）

**日期**：2026-09-16（~08:05 PT · post-prove 双审回执）  
**run-status**：**`post_prove_dual_pass`**（7× CMD **已跑**新鲜 EXIT；两个 post-prove 专家审查均 **pass**；**仅 honesty/partial**）  
**releaseEvidence=false** · **≠HA** · **case-only / partial / honesty-pin ≠ covered** · **EXIT=0 ≠ covered**  
**对照 harness**：`ai-docs/delivery/harness/nhp-batch2-neg-fault.md`  
**对照全表**：`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`  
**对照父矩阵闸**：`reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域文档闸 **pass**；**≠** prove 笼统授权）  
**对照 Batch1**：`eval/nhp-batch1-neg-perf.eval.md` · **`post_prove_dual_pass`**（IDs **不重叠**）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）  
**专家范围**：`mw-e2e-ha` + `mw-rag-route`（R4-BOUND 在批 → rag-route 配对；**无** model-op）

**Post-prove 双审回执（honesty only）**：

- `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）**
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md` · **pass（honesty only）**

**Pre-exec dual-pass 收据**：

- `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md` · **pass**
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md` · **pass**

**Post-prove REQUEST（本刀 · 已由上述双审收束；实现方不写 pass）**：

- `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md`
- `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`

---

## 1. 用途

在矩阵双域文档闸已齐、硬闸文档闸已生效、Batch1 已 `post_prove_dual_pass`、本批 pre-exec dual 已 pass、meetwise-core 已授权本批 CMD 的前提下，登记 **第二批执行切片** 的新鲜 CMD+EXIT 与诚实读法，并记录两份 post-prove 独立审查均 **pass**；**仅 honesty/partial**，**禁止**抬 covered / R2 / R4 / HA / planner leaf。

---

## 2. Batch2 case ID 列表

| Case ID | 列 | 旗 | 备注 |
|---------|----|----|------|
| NHP-002-BOUND-01 | BOUND | partial | `uc002:lease:prove`；lease 竞态 ≠ 002 covered |
| NHP-010-FAULT-01 | FAULT | partial | `uc010:sse-resume:prove`；SSE/LED ≠ SLO |
| NHP-011-NEG-01 | NEG | partial | `uc011:report-refund:http:prove`；≠ refund complete |
| NHP-017-FAULT-01 | FAULT | partial | `uc017:orphan:prove`；≠ LOAD |
| NHP-018-NEG-01 | NEG | partial | `uc018:abandon:http:prove`；≠ 018 covered |
| NHP-019-FAULT-01 | FAULT | partial | `uc019:report-regenerate:http:prove`；并发 ≠ covered |
| NHP-R4-BOUND-01 | BOUND | partial/honesty | `g4-production-scoped-retrieve:prove`；≠ R4 closed / ≠ planner leaf |

**排除（Batch1）**：NHP-001-NEG-01 · NHP-001-PERF-api-01 · NHP-015-NEG-01 · NHP-050-NEG-01 · NHP-033-NEG-01 · NHP-R2-NEG-01 · NHP-R2-FAULT-01。

---

## 3. 执行记录（本环境 · ~08:00 PT · HEAD `639134f` · Docker OK · Key-unset）

| CMD / 动作 | 期望 | 实测 EXIT | 读法 |
|------------|------|-----------|------|
| `pnpm uc002:lease:prove` | partial honesty | **0** | lease L1–L3 CAS partial ≠ 002 covered |
| `pnpm uc010:sse-resume:prove` | partial honesty | **0** | SSE/LED + R-mid partial ≠ SLO |
| `pnpm uc011:report-refund:http:prove` | partial honesty | **0** | quarantine 误退拒 + refund 口 404 GAP ≠ refund complete |
| `pnpm uc017:orphan:prove` | partial honesty | **0** | orphan reserved→released ≠ LOAD |
| `pnpm uc018:abandon:http:prove` | partial honesty | **0** | abandon 后复活拒 ≠ 018 covered |
| `pnpm uc019:report-regenerate:http:prove` | partial honesty | **0** | retry∥quarantine honesty ≠ 019 covered |
| `pnpm g4-production-scoped-retrieve:prove` | honesty pin | **0** | 主叶 scoped ≠ R4 closed / ≠ planner leaf |
| `e2e:isolated` / `verify:e2e-performance` / LOAD / 云 / HA / UI-pay | — | **未跑**（禁） | deferred / blocked |
| 实现方自签 post-prove pass | — | **未做**（禁） | 双域专家已独立审并回写 pass；实现方未代签 |
| 任意 covered / R4 closed 写回 | — | **未做**（禁） | EXIT=0 ≠ covered |

**环境注记**：Docker 已可用；首轮 7× 新鲜 EXIT=0，无需再启 dockerd。**不**读 `.env*`。日志：`.tmp/nhp-batch2-neg-fault-exits/cmd{1..7}.log`。

---

## 4. 延期（deferred · 明确不在 Batch2 runnable）

| 延期项 | 原因 |
|--------|------|
| 全部 `NHP-*-LOAD-*` / `NHP-LOAD-WORKER-SUITE` | 禁容量绿；本批 orphan ≠ LOAD |
| `NHP-PERF-*` / PERF-CLOUD / `verify:e2e-performance` | 本批无 PERF runnable |
| HA / 云 kill / UI-pay / wrong_track ADV | gap/out-of-scope 或 ADV 扩面；禁偷渡 |
| NHP-R4-NEG/FAULT/ADV/PERF · R5 PERF · RAG-LOAD | 本批仅 R4-BOUND honesty |
| Batch1 7 IDs | 已 `post_prove_dual_pass`；勿重开当 Batch2 |
| MODEL-OP live classify | 非本批；故无 mw-model-op REQUEST |

---

## 5. 审查记录（专家已回写 · 非实现方自勾 pass）

- [ ] 未宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / R4 closed / planner leaf 关  
- [ ] 7 IDs 与 Batch1 **无重叠**；CMD 与 package.json 一致  
- [ ] 实现方 EXIT 表与独立复跑一致（请自行复跑并附 CMD+EXIT）  
- [ ] R4-BOUND 诚实钉 ≠ R4 closed / ≠ planner leaf  
- [ ] LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV 标 deferred  
- [ ] 未跑禁令 CMD（`e2e:isolated` / `verify:e2e-performance` / 云 / HA）  
- [x] 实现方仅写 REQUEST；**未**自签 post-prove pass
- [x] `mw-e2e-ha` 与 `mw-rag-route` post-prove reviews 均已独立回写 **pass**；结论仅 honesty/partial

---

*Eval note · NHP Batch2 · 2026-09-16 ~08:05 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ covered*
