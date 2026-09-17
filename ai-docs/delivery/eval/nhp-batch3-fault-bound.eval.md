# 评测笔记 — NHP Batch3 · 第三批 FAULT/BOUND（+ R4 NEG/FAULT honesty · scoped · eval-first）

**日期**：2026-09-16（~19:20 PT · post-prove 双审回执）  
**run-status**：**`post_prove_dual_pass`**（7× 新鲜 EXIT=0；post-prove 双域独立审均 **pass**；**仅 honesty/partial**；**仍 ≠ covered**）  
**releaseEvidence=false** · **≠HA** · **case-only / partial / honesty-pin / EXIT=0 ≠ covered**  
**对照 harness**：`ai-docs/delivery/harness/nhp-batch3-fault-bound.md`  
**对照全表**：`ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`  
**对照父矩阵闸**：`reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域文档闸 **pass**；**≠** prove 笼统授权）  
**对照 Batch1**：`eval/nhp-batch1-neg-perf.eval.md` · **`post_prove_dual_pass`**（IDs **不重叠**）  
**对照 Batch2**：`eval/nhp-batch2-neg-fault.eval.md` · **`post_prove_dual_pass`**（IDs **不重叠**）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）  
**专家范围**：`mw-e2e-ha` + `mw-rag-route`（R4-NEG + R4-FAULT 在批 → rag-route 配对；**无** model-op）  
**HEAD**：`639134f`

**Post-prove 双审回执（本刀 · honesty only · 实现方不自签）**：

- `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）**
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` · **pass（honesty only）**

**Pre-exec / RECHECK（对照 · 已 pass；不抬 covered）**：


**RECHECK 双审收据（均 pass；仅 pre-exec 文档闸）**：

- `…-nhp-batch3-fault-bound-mw-e2e-ha.md` / `…-mw-rag-route.md`
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md` · **pass**

---

## 1. 用途

在矩阵双域文档闸已齐、硬闸文档闸已生效、Batch1+Batch2 已 `post_prove_dual_pass`（honesty ≠ covered）、本批 RECHECK 双域 pass、执行授权已用且 7× CMD EXIT=0 的前提下，登记 **第三批执行切片** 的新鲜收据与诚实读法；post-prove 双域独立 review 均 **pass**；**禁止**实现方自签 pass；**禁止**抬 covered / R2 / R4 / HA / planner leaf / wrong_track ADV covered。

---

## 2. Batch3 case ID 列表

| Case ID | 列 | 旗 | 备注 |
|---------|----|----|------|
| NHP-015-BOUND-01 | BOUND | partial | `uc015:ingest-failures:prove`；F2/F3 ≠ OCR FAULT/LOAD |
| NHP-011-FAULT-01 | FAULT | partial | `uc011:report-refund:prove`（DB）；≠ refund complete / ≠ UI-pay |
| NHP-017-BOUND-01 | BOUND | partial | `uc017:orphan:prove`；sweeper 幂等 ≠ LOAD |
| NHP-019-NEG-01 | NEG | partial | `uc019:report-regenerate:prove`（DB）；quarantine GAP ≠ covered |
| NHP-033-BOUND-01 | BOUND | partial/gap(PERF) | `uc033:cross-user-authz:prove`；X10 ≠ SLO |
| NHP-R4-NEG-01 | NEG | partial/honesty | `g-r2-5-retrieve-fail-closed:prove`；≠ R4 closed |
| NHP-R4-FAULT-01 | FAULT | gap/honesty | `g4-dispatch-recheck-prereq:prove`；**FLIPPED（CALL_SITES=1≥1）** · seam honesty only；**仍 ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered** |

**排除（Batch1）**：NHP-001-NEG-01 · NHP-001-PERF-api-01 · NHP-015-NEG-01 · NHP-050-NEG-01 · NHP-033-NEG-01 · NHP-R2-NEG-01 · NHP-R2-FAULT-01。

**排除（Batch2）**：NHP-002-BOUND-01 · NHP-010-FAULT-01 · NHP-011-NEG-01 · NHP-017-FAULT-01 · NHP-018-NEG-01 · NHP-019-FAULT-01 · NHP-R4-BOUND-01。

---

## 3. 执行记录（本刀 · 7× 新鲜 EXIT · ~19:20 PT）

| CMD / 动作 | 期望 | 实测 EXIT | 读法 |
|------------|------|-----------|------|
| `pnpm uc015:ingest-failures:prove` | BOUND honesty | **0** | F2/F3 BOUND；≠ OCR FAULT/LOAD；pgvector → green-risk/R5 |
| `pnpm uc011:report-refund:prove` | FAULT honesty | **0** | 失败→released DB；≠ refund complete / ≠ UI-pay |
| `pnpm uc017:orphan:prove` | BOUND honesty | **0** | sweeper 幂等；≠ LOAD |
| `pnpm uc019:report-regenerate:prove` | NEG honesty | **0** | quarantine regen GAP；≠ 019 covered |
| `pnpm uc033:cross-user-authz:prove` | BOUND honesty | **0** | X10 burst；≠ PERF/LOAD SLO；七类未齐 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | R4-NEG honesty | **0** | snapshot missing fail-closed；≠ R4 closed / ≠ 路由已生效 |
| `pnpm g4-dispatch-recheck-prereq:prove` | R4-FAULT FLIPPED honesty | **0** | FLIPPED CALL_SITES=1；仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV；**不改 wire** |
| `e2e:isolated` / `verify:e2e-performance` / LOAD / 云 / HA / UI-pay | — | **未跑**（禁） | deferred / blocked |
| `mysql-stack:r4-domain-isolation:prove` 作 ADV covered | — | **未跑**（禁） | wrong_track deferred honesty |
| 实现方自签 pass / 任意 covered 写回 | — | **未做**（禁） | EXIT=0 ≠ covered |
| 读 `.env*` / 改 R4 wire / Meridian | — | **未做**（禁） | 硬禁 |

**环境注记**：本刀已完成授权范围内 7× prove 复跑并记录 EXIT=0；Docker OK，Key-unset（仅 env 探测；**未读** `.env*`）。**不**把该注记读作 HA / sole-stack。

---

## 4. 延期（deferred · 明确不在 Batch3 runnable）

| 延期项 | 原因 |
|--------|------|
| 全部 `NHP-*-LOAD-*` / `NHP-LOAD-WORKER-SUITE` | 禁容量绿 |
| `NHP-PERF-*` / PERF-CLOUD / `verify:e2e-performance` | 本批无 PERF runnable；X10 ≠ SLO |
| HA / 云 kill / UI-pay | gap/out-of-scope；禁偷渡 |
| NHP-015-FAULT-01（OCR 宕） | **无既有 prove 锚**；禁硬编 |
| NHP-011-BOUND-01 | 本批优先 FAULT；BOUND 可后续 |
| NHP-R4-ADV-01 / wrong_track ADV | **deferred honesty**；**≠** ADV covered |
| NHP-R4-BOUND-01 / R4 PERF / R5 PERF / RAG-LOAD | Batch2 已 BOUND；其余 deferred |
| Batch1+Batch2 14 IDs | 已 `post_prove_dual_pass`；勿重开当 Batch3 |
| MODEL-OP live classify | 非本批；故无 mw-model-op REQUEST |
| R4 REAL-WIRE / 改 wire | **硬禁**（本刀未改） |

---

## 5. 审查记录（post-prove 双域 pass · 非实现方自勾 pass）

- [x] 未宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / R4 closed / planner leaf 关 / wrong_track=0
- [x] 7 IDs 与 Batch1+Batch2 **无重叠**；CMD 与 package.json 一致  
- [x] R4-NEG honesty ≠ R4 closed；R4-FAULT = FLIPPED CALL_SITES≥1 · 仍 ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV covered  
- [x] LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV / 015-FAULT 标 deferred  
- [x] 未跑禁令 CMD（`e2e:isolated` 等）  
- [x] 实现方仅写 post-prove REQUEST + EXIT 表；专家双域 review **均 pass**；实现方**未**自签 pass

---

*Eval note · NHP Batch3 · 2026-09-16 ~19:20 PT · post_prove_dual_pass（honesty only）· 7× EXIT=0 · R4-FAULT FLIPPED CALL_SITES=1 · releaseEvidence=false · ≠HA · ≠ covered*
