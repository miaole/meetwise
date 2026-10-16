# Harness — NHP Batch3 · 第三批 FAULT/BOUND（+ R4 NEG/FAULT honesty · scoped · **post_prove_dual_pass · honesty only**）

**状态**：**`post_prove_dual_pass`** · 7× CMD 新鲜 EXIT=0 · post-prove 双域独立审均 **pass** · **仅 honesty/partial** · **仍 ≠ covered**  
**日期**：2026-09-16（~19:20 PT · post-prove 双域 pass）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/容量绿** · **≠ R2/R4 closed** · **≠ 路由已生效** · **≠ PERF SLO** · **≠ planner leaf 已关** · **≠ wrong_track=0** · **≠ ADV covered**  
**硬闸**：`north-star-hard-gates.md` **已生效（文档闸）** · 矩阵双域文档闸 **已 pass** · Batch1+Batch2 = **`post_prove_dual_pass`** · Batch3 RECHECK 双域 **pass** · 本批执行授权已用 · post-prove 双域 **pass** · **仅 honesty/partial** · 仍 **≠ covered**
**专家（RECHECK 双域已 pass）**：`mw-e2e-ha` + `mw-rag-route`（本批含 **NHP-R4-NEG-01** + **NHP-R4-FAULT-01** → rag-route 仍配对；**无** MODEL-OP live 子集 → **不**并列 `mw-model-op`）  
**对照全表**：`delivery/non-happy-path-perf-load-case-matrix.md`  
**对照父 harness**：`harness/non-happy-path-perf-load-matrix.md`  
**对照 eval**：`eval/nhp-batch3-fault-bound.eval.md`  
**RECHECK 双审收据**：`reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md` · **pass**；`reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md` · **pass**
**对照 Batch1**：`harness/nhp-batch1-neg-perf.md`（**post_prove_dual_pass** · 7 IDs **不重复**）  
**对照 Batch2**：`harness/nhp-batch2-neg-fault.md`（**post_prove_dual_pass** · 7 IDs **不重复**）  
**MODEL_API_KEY**：本批 **不要求**；实测 **Key-unset**（仅 `process.env` 探测；**未读** `.env*`）；**禁止**发明 Key / 硬跑 live isolated；**禁止**把 `e2e:isolated` 当绿关  
**R4 旁注**：本批仅纳入 **NHP-R4-NEG-01** + **NHP-R4-FAULT-01**（honesty / gap-seam）；**≠** R4 closed · **≠** planner leaf · **≠** wrong_track ADV covered · **不开** R4 编码 / **不改** R4 wire · **本刀未触** REAL-WIRE 改动

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 本刀目标 | 交付 Batch3 7 CMD 的冻结与诚实读法；post-prove 双域 **pass**；状态 **`post_prove_dual_pass`**；仅 honesty/partial；仍 **≠ covered** |
| 本刀禁止 | 把 7× prove EXIT=0 / `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove **作绿关**；实现方自签 `reviews/` pass |
| 假绿禁令 | partial / honesty-pin / EXIT=0 **≠** covered；post-prove dual pass **≠** covered；R4-FAULT FLIPPED CALL_SITES≥1 **仍 ≠** R4 closed / ≠ wrong_track=0 / ≠ ADV；LOAD/PERF-CLOUD/HA/UI-pay/cloud-kill **不在本批 runnable** |
| 自批 | 实现方 **禁止**自签 `reviews/` pass（含本批执行） |
| 抬升 | 即便本批 7× EXIT=0 且 dual pass：**仍** `releaseEvidence=false`；**禁止**抬 covered / R4 closed / HA / LOAD 绿 / wrong_track ADV covered |

---

## 1. Batch3 用例集（7 IDs）· CMD+EXIT（post-prove 双审回执）

> 选型：第三批高价值 **FAULT / BOUND**（+ R4 NEG/FAULT honesty）；优先仍 blind/partial 且有既有 prove 锚；**可本地 isolated / 无云 Key**。  
> **不含** Batch1+Batch2 已做 14 IDs；**不含** LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV **作本批 runnable**（可注 deferred honesty）。  
> **不含** NHP-015-FAULT runnable（矩阵无既有 prove 锚 → deferred）。

| # | Case ID | 列 | 旗 | CMD | EXIT | EXIT 诚实读法 |
|---|---------|----|----|-----|------|---------------|
| 1 | **NHP-015-BOUND-01** | BOUND | **partial** | `pnpm uc015:ingest-failures:prove` | **0** | F2/F3 0 字节 / 超大 413 入口拒；**≠** OCR FAULT；**≠** LOAD；fixture=pgvector → green-risk/R5 |
| 2 | **NHP-011-FAULT-01** | FAULT | **partial** | `pnpm uc011:report-refund:prove` | **0** | 面试失败→released+额度净 0（DB 口径）；**≠** refund complete；**≠** UI-pay |
| 3 | **NHP-017-BOUND-01** | BOUND | **partial** | `pnpm uc017:orphan:prove` | **0** | sweeper 幂等 / 重复扫无二次副作用；**≠** LOAD_worker；**≠** e2e:isolated |
| 4 | **NHP-019-NEG-01** | NEG | **partial** | `pnpm uc019:report-regenerate:prove` | **0** | quarantine regen 404/可解释 GAP 钉（DB）；**≠** 019 covered；**≠** regen 幂等键已落 |
| 5 | **NHP-033-BOUND-01** | BOUND | **partial**/gap(PERF) | `pnpm uc033:cross-user-authz:prove` | **0** | X10 burst 稳定拒；**≠** 容量 SLO；**≠** 七类 ADV 齐 |
| 6 | **NHP-R4-NEG-01** | NEG | **partial**/honesty | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | 缺/非法 snapshot → degraded denial；禁 unscoped；**≠** R4 closed；**≠** 路由已生效 |
| 7 | **NHP-R4-FAULT-01** | FAULT | **gap**/honesty | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED（CALL_SITES=1≥1 / wire present）** · recheck seam honesty only；**仍 ≠ R4 closed** · **≠ wrong_track=0** · **≠ ADV covered**；**本刀不改 wire** |

**合计**：7 case IDs。**零 covered** 写回；**not_run ≠ covered**；**EXIT=0 ≠ covered**。  
**CMD 核验**：与根 `package.json` 一致（2026-09-16 核验）。  
**HEAD**：`639134f` 工作树。

**显式排除（Batch1 已做 · 勿重开）**：NHP-001-NEG-01 · NHP-001-PERF-api-01 · NHP-015-NEG-01 · NHP-050-NEG-01 · NHP-033-NEG-01 · NHP-R2-NEG-01 · NHP-R2-FAULT-01。

**显式排除（Batch2 已做 · 勿重开）**：NHP-002-BOUND-01 · NHP-010-FAULT-01 · NHP-011-NEG-01 · NHP-017-FAULT-01 · NHP-018-NEG-01 · NHP-019-FAULT-01 · NHP-R4-BOUND-01。

---

## 2. 命令冻结（post-prove 执行回执 · 双审均 pass）

```bash
cd /workspace/meetwise
# Batch3 · post_prove_dual_pass · honesty only · 7× EXIT=0
pnpm uc015:ingest-failures:prove              # EXIT=0 · NHP-015-BOUND-01 · F2/F3 BOUND ≠ OCR FAULT/LOAD
pnpm uc011:report-refund:prove                # EXIT=0 · NHP-011-FAULT-01 · DB released 口径 ≠ refund complete / ≠ UI-pay
pnpm uc017:orphan:prove                       # EXIT=0 · NHP-017-BOUND-01 · sweeper 幂等 ≠ LOAD
pnpm uc019:report-regenerate:prove            # EXIT=0 · NHP-019-NEG-01 · quarantine regen GAP ≠ 019 covered
pnpm uc033:cross-user-authz:prove             # EXIT=0 · NHP-033-BOUND-01 · X10 burst ≠ PERF/LOAD SLO
pnpm g-r2-5-retrieve-fail-closed:prove        # EXIT=0 · NHP-R4-NEG-01 · snapshot missing honesty ≠ R4 closed
pnpm g4-dispatch-recheck-prereq:prove         # EXIT=0 · NHP-R4-FAULT-01 · FLIPPED CALL_SITES≥1 · seam honesty ≠ R4 closed ≠ wrong_track=0 ≠ ADV
# 仍禁：pnpm e2e:isolated / verify:e2e-performance / 云 TC / HA prove / LOAD_* / PERF-CLOUD
# 仍禁：mysql-stack:r4-domain-isolation:prove 作 ADV covered；R4 REAL-WIRE / 改 wire
```

| 本刀状态 | 值 |
|----------|-----|
| 执行旗 | **`post_prove_dual_pass`**（7× EXIT=0；post-prove 双域独立审均 pass；仅 honesty/partial） |
| Key | `process.env` 探测：**unset**；**不读** `.env*` |
| 夹具 | 经 `run-e2e-isolated` 的条目默认 pgvector → **green-risk / R5**（即使 EXIT=0） |
| 实现方自批 | **禁止**；post-prove reviews/ 已由专家独立写，双域均 pass |
| 日志 | `.tmp/nhp-batch3-post-prove-ha-rerun/cmd{1..7}.{log,exit}` · 以独立 review 收据为准 |

### 2.1 显式不跑 / 禁止冒充（本批 deferred）

| CMD / 动作 | 为何禁（本刀 / 本批） |
|------------|----------------------|
| `pnpm e2e:isolated` / `e2e:ui:isolated` | 需 Key；happy-only 假绿；≠ Batch3 FAULT/BOUND covered |
| `pnpm verify:e2e-performance` / PERF-CLOUD | 本批无 PERF runnable；禁 SLO 绿 |
| 任意 LOAD_* / 云 kill / HA fault-inject / UI-pay | **deferred**；禁容量/HA/支付拒绿 |
| `mysql-stack:r4-domain-isolation:prove` 作 ADV covered | **deferred honesty only**；wrong_track **≠** covered |
| NHP-015-FAULT OCR 宕 | **无既有 prove 锚** → deferred；禁硬编假绿 |
| 改 R4 wire / REAL-WIRE / Meridian | **硬禁**；本刀不触 |
| 把本批 EXIT=0 回写 covered / R4 closed | **假绿** |
| Batch1/2 14 IDs 复跑当 Batch3 绿 | **禁** |

### 2.2 执行环境注记（诚实 · 非绿关）

本刀已完成授权范围内 7× prove 复跑并记录 EXIT=0；Docker OK，Key-unset（仅 env 探测；**未读** `.env*`）。该注记 **≠** 基础设施已 HA / ≠ sole-stack。
**共享锚**：部分 CMD 曾服务 Batch1/2 **不同 case ID**（例：`uc015`→Batch1 NEG；`uc017`→Batch2 FAULT；`g-r2-5`→Batch1 R2-FAULT）。本批冻结的是 **新 case ID / 新分面**；即便 EXIT=0：**仍 ≠ covered**；**≠** 把旧批 dual pass 读成本批已 covered。

---

## 3. 盲区 / gap 诚实（本批边界）

| 项 | 读法 |
|----|------|
| NHP-015-BOUND-01 | F2/F3 BOUND partial ≠ OCR FAULT / ≠ LOAD |
| NHP-015-FAULT-01 | **deferred**（无 prove 锚）；禁 runnable 冒充 |
| NHP-011-FAULT-01 | DB released 口径 partial ≠ refund 全闭环 / ≠ UI-pay / ≠ 011-BOUND 另刀 |
| NHP-011-BOUND-01 | **deferred**（本批优先 FAULT；BOUND 可后续） |
| NHP-017-BOUND-01 | sweeper 幂等 partial ≠ LOAD_worker |
| NHP-019-NEG-01 | quarantine GAP partial ≠ 019 covered / ≠ BOUND 幂等齐 |
| NHP-033-BOUND-01 | X10 ≠ PERF/LOAD SLO；七类 ADV **仍未齐** |
| NHP-R4-NEG-01 | snapshot missing honesty ≠ R4 closed ≠ 路由已生效 |
| NHP-R4-FAULT-01 | FLIPPED CALL_SITES=1（post-REAL-WIRE-IMPL）· recheck seam honesty only；**仍 ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV covered**；本刀不改 wire |
| NHP-R4-ADV-01 / wrong_track | **deferred honesty**；**禁** ADV covered |
| LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill | **deferred**；禁宣称产能 / HA / 支付拒 |

---

## 4. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| Batch3 EXIT=0 = 已 covered | **假阳**；状态 = **`post_prove_dual_pass`**，仅 honesty/partial |
| Batch1/2 `post_prove_dual_pass` = Batch3 covered | **否**；仅前置对照 |
| 共享 CMD 曾 EXIT=0 | 服务**旧 case ID**；**≠** 本批 covered |
| `g4-dispatch-recheck-prereq` 绿 | **FLIPPED** CALL_SITES=1 honesty；**仍 ≠** R4 closed / ≠ wrong_track=0 / ≠ ADV covered |
| `g-r2-5` 绿 | degraded denial honesty；**≠** R4 closed / ≠ 路由已生效 |
| X10 / 413 EXIT=0 | 单点 BOUND；**≠** LOAD / PERF SLO |
| 本批绿 = 非快乐路径全家 covered | **假阳** |
| releaseEvidence=false 可抬 HA | **否** · **≠HA** |

---

## 5. REQUEST 指针

**Pre-exec / RECHECK（双域 pass · 已完成执行授权 · ≠ 本批抬 covered）**：

- `reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md` · **pass**
- `reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md` · **pass**
- RECHECK 为 pre-exec 文档闸；本批执行授权已使用

**Post-prove 双审回执（本批状态依据 · honesty only）**：

- `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）**
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` · **pass（honesty only）**

- **无** `mw-model-op` REQUEST（本批无 MODEL-OP live classify 子集；**不要**加 MODEL-OP live）

**对照（已过 · ≠ 本批抬升）**：

- Batch1 / Batch2 harness/eval/slice = **`post_prove_dual_pass`**（honesty only）
- **不**把 Batch1/2 pass 读成 Batch3 covered

---

## 6. 仍禁止的抬升

1. 本批 7× CMD 已完成且双域 post-prove 均 pass；该状态**仍禁**抬 covered / R4 closed / planner leaf / HA / `releaseEvidence=true` / LOAD 绿 / wrong_track ADV covered。  
2. 实现方 **不**自签 pass。  
4. **仍** `releaseEvidence=false` · ≠HA · EXIT=0 **≠** covered · FLIPPED **≠** R4 closed。  
5. **不改** R4 wire；**不读** `.env*`；**不开** Meridian。

---

*Harness · NHP Batch3 FAULT/BOUND · 2026-09-16 ~19:20 PT · post_prove_dual_pass（honesty only）· R4-FAULT FLIPPED CALL_SITES=1 · releaseEvidence=false · ≠HA · ≠ covered*
