# Harness — NHP Batch2 · 第二批 NEG/FAULT/BOUND（scoped · **post_prove_dual_pass**）

**状态**：`post_prove_dual_pass` · 7× CMD **已跑**（本环境新鲜 EXIT）· 两个 post-prove 独立审查均 **pass** · **仍 ≠ covered**  
**日期**：2026-09-16（~08:05 PT · post-prove 双审回执）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/容量绿** · **≠ R2/R4 closed** · **≠ 路由已生效** · **≠ PERF SLO** · **≠ planner leaf 已关**  
**硬闸**：`north-star-hard-gates.md` **已生效（文档闸）** · 矩阵双域文档闸 **已 pass** · Batch1 = **`post_prove_dual_pass`**（≠ 本批自动授权）· 本批 pre-exec dual **已 pass** + meetwise-core 执行授权 → **仅本批 CMD**  
**专家（post-prove 双审已回写）**：`mw-e2e-ha` + `mw-rag-route`（本批含 **NHP-R4-BOUND-01** → rag-route 仍配对；**无** MODEL-OP live 子集 → **不**并列 `mw-model-op`）  
**对照全表**：`delivery/non-happy-path-perf-load-case-matrix.md`  
**对照父 harness**：`harness/non-happy-path-perf-load-matrix.md`  
**对照 eval**：`eval/nhp-batch2-neg-fault.eval.md`  
**对照 Batch1**：`harness/nhp-batch1-neg-perf.md`（**post_prove_dual_pass** · 7 IDs **不重复**）  
**MODEL_API_KEY**：本批 **不要求**；实测 **Key-unset**（仅 `process.env` 探测；**未读** `.env*`）；**禁止**发明 Key / 硬跑 live isolated；**禁止**把 `e2e:isolated` 当绿关  
**R4 旁注**：本批仅纳入 **NHP-R4-BOUND-01**（主叶 scoped honesty）；**≠** R4 closed · **≠** planner leaf · **不开** R4 编码 / 不接线 ADV · **本批未改 R4 wire**

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 本刀目标 | 按 harness 冻结 7 CMD 跑出新鲜 EXIT 回执；完成 post-prove 双独立审并回写 `post_prove_dual_pass`；仍 **≠ covered** |
| 本刀禁止 | `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove **作绿关**；实现方自签 `reviews/` pass |
| 假绿禁令 | partial / honesty-pin / EXIT=0 **≠** covered；LOAD/PERF-CLOUD/HA/UI-pay/cloud-kill/wrong_track ADV **不在本批 runnable**；EXIT=0 **≠** R4 closed / ≠ planner leaf |
| 自批 | 实现方 **禁止**自签 `reviews/` pass（含本批 post-prove） |
| 抬升 | 本批 dual pass 后：**仍** `releaseEvidence=false`；**禁止**抬 covered / R4 closed / HA / LOAD 绿 |

---

## 1. Batch2 用例集（7 IDs）· 新鲜 CMD+EXIT（~08:00 PT）

> 选型：第二批高价值 **NEG / FAULT / BOUND**（+ 一条 R4 BOUND honesty）；优先 `partial`；**可本地 isolated / 无云 Key**。  
> **不含** Batch1 已做 7 IDs；**不含** LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV 作本批 runnable（可注 deferred）。

| # | Case ID | 列 | 旗 | CMD | EXIT | EXIT 诚实读法 |
|---|---------|----|----|-----|------|---------------|
| 1 | **NHP-002-BOUND-01** | BOUND | **partial** | `pnpm uc002:lease:prove` | **0** | lease 竞态 L1–L3 CAS partial；**≠** 002 covered / ≠ HTTP dual-session / Playwright |
| 2 | **NHP-010-FAULT-01** | FAULT | **partial** | `pnpm uc010:sse-resume:prove` | **0** | SSE/LED resume + R-mid live-tail partial；**≠** SLO / ≠ full.e2e / ≠ 跨副本 |
| 3 | **NHP-011-NEG-01** | NEG | **partial** | `pnpm uc011:report-refund:http:prove` | **0** | quarantine 误退拒 + H5 refund 口 404 GAP；**≠** refund complete / ≠ UI-pay |
| 4 | **NHP-017-FAULT-01** | FAULT | **partial** | `pnpm uc017:orphan:prove` | **0** | orphan reserved→released + sweeper partial；**≠** LOAD / ≠ e2e:isolated |
| 5 | **NHP-018-NEG-01** | NEG | **partial** | `pnpm uc018:abandon:http:prove` | **0** | abandon 后复活拒 + waiting_user partial；**≠** 018 covered / ≠ GRAPH/TTL/FULL-E2E |
| 6 | **NHP-019-FAULT-01** | FAULT | **partial** | `pnpm uc019:report-regenerate:http:prove` | **0** | retry∥quarantine / release 并发 honesty；**≠** 019 covered / ≠ regen 幂等键已落 |
| 7 | **NHP-R4-BOUND-01** | BOUND | **partial**/honesty | `pnpm g4-production-scoped-retrieve:prove` | **0** | 主叶 scoped + missing-snapshot fail-closed honesty；**≠** R4 closed / ≠ planner leaf / ≠ wrong_track=0 |

**合计**：7 case IDs。**零 covered** 写回；**executed ≠ covered**；**EXIT=0 ≠ covered**。  
**CMD 核验**：与根 `package.json` 一致。

**显式排除（Batch1 已做 · 勿重开）**：NHP-001-NEG-01 · NHP-001-PERF-api-01 · NHP-015-NEG-01 · NHP-050-NEG-01 · NHP-033-NEG-01 · NHP-R2-NEG-01 · NHP-R2-FAULT-01。

---

## 2. 命令冻结（已执行 · 回执）

```bash
cd /workspace/meetwise
pnpm uc002:lease:prove                         # EXIT=0 · NHP-002-BOUND-01 · lease 竞态 partial ≠ 002 covered
pnpm uc010:sse-resume:prove                    # EXIT=0 · NHP-010-FAULT-01 · SSE/LED resume partial ≠ SLO
pnpm uc011:report-refund:http:prove            # EXIT=0 · NHP-011-NEG-01 · quarantine 误退拒 ≠ refund complete
pnpm uc017:orphan:prove                        # EXIT=0 · NHP-017-FAULT-01 · orphan reserved→released ≠ LOAD
pnpm uc018:abandon:http:prove                  # EXIT=0 · NHP-018-NEG-01 · abandon 后复活拒 ≠ 018 covered
pnpm uc019:report-regenerate:http:prove        # EXIT=0 · NHP-019-FAULT-01 · retry∥release 并发 ≠ covered
pnpm g4-production-scoped-retrieve:prove       # EXIT=0 · NHP-R4-BOUND-01 · 主叶 scoped honesty ≠ R4 closed / ≠ planner leaf
# 仍禁：pnpm e2e:isolated / verify:e2e-performance / 云 TC / HA prove / LOAD_* / PERF-CLOUD
```

| 本刀状态 | 值 |
|----------|-----|
| 执行旗 | **`post_prove_dual_pass`**（原 `executed:awaiting_post_prove_dual` / `pre_exec_dual_pass` / `await_exec_authorize` 已清） |
| Key | `process.env` 探测：**unset**；**不读** `.env*` |
| 夹具 | 经 `run-e2e-isolated` 的条目默认 pgvector → **green-risk / R5**（即使 EXIT=0） |
| 实现方自批 | **禁止**；post-prove reviews/ 由专家独立写 |
| 日志（可选） | `.tmp/nhp-batch2-neg-fault-exits/cmd{1..7}.log`（噪声；以本表 EXIT 为准） |

### 2.1 显式不跑 / 禁止冒充（本批 deferred）

| CMD / 动作 | 为何禁（本刀 / 本批） |
|------------|----------------------|
| `pnpm e2e:isolated` / `e2e:ui:isolated` | 需 Key；happy-only 假绿；≠ Batch2 NEG/FAULT covered |
| `pnpm verify:e2e-performance` / PERF-CLOUD | 本批无 PERF runnable；禁 SLO 绿 |
| 任意 LOAD_* / 云 kill / HA fault-inject / UI-pay | **deferred**；禁容量/HA/支付拒绿 |
| wrong_track ADV / R4 ADV | **deferred**；本批仅 R4-BOUND honesty |
| 把本批 EXIT=0 回写 covered / R4 closed / planner leaf 关 | **假绿** |
| Batch1 7 IDs 复跑当 Batch2 绿 | **禁**；Batch1 已 `post_prove_dual_pass`，≠ 本批抬升 |

### 2.2 执行环境注记（诚实 · 非绿关）

本环境 Docker 已可用（`docker info` OK）；7× isolated/worker prove **首轮新鲜 EXIT=0**，无需再启 dockerd。Key-unset。该注记 **≠** 基础设施已 HA / ≠ sole-stack。

---

## 3. 盲区 / gap 诚实（本批边界）

| 项 | 读法 |
|----|------|
| NHP-002-BOUND-01 | lease prove partial ≠ 002 主链 / 跨设备 covered |
| NHP-010-FAULT-01 | SSE resume partial ≠ 流式 SLO / ≠ 002-FAULT 跨副本 |
| NHP-011-NEG-01 | http quarantine 误退 partial ≠ refund 全闭环 / ≠ UI-pay |
| NHP-017-FAULT-01 | orphan sweeper partial ≠ LOAD_worker / ≠ 容量 |
| NHP-018-NEG-01 | abandon 复活拒 partial ≠ 018 全家 covered |
| NHP-019-FAULT-01 | regen∥release 并发 partial ≠ 019 covered / ≠ LOAD |
| NHP-R4-BOUND-01 | 主叶 scoped only honesty ≠ R4 closed ≠ planner leaf ≠ wrong_track=0 |
| LOAD / PERF-CLOUD / HA / UI-pay / cloud-kill / wrong_track ADV | **deferred**；禁宣称产能 / HA / 支付拒 / ADV 齐 |

---

## 4. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| Batch2 7× EXIT=0 | **executed** honesty；仍 **≠** covered / family green |
| `g4-production-scoped-retrieve` EXIT=0 | 主叶 scoped honesty；**≠** R4 closed / ≠ planner leaf |
| `uc011` / `uc018` / `uc019` http EXIT=0 | partial NEG/FAULT；**≠** refund/abandon/regen 全家齐 |
| `uc002` / `uc010` / `uc017` EXIT=0 | BOUND/FAULT partial；**≠** 002 covered / SLO / LOAD |
| Batch1/Batch2 `post_prove_dual_pass` | **仅限各批 honesty/partial 收据**；**≠** covered / R2 / R4 / HA |
| `post_prove_dual_pass` | 双域专家 post-prove 均 **pass**；**仅 honesty/partial**；**≠** covered / R2 / R4 / HA；实现方 **不**自签 pass |
| 本批绿 = 非快乐路径全家 covered | **假阳** |

---

## 5. REQUEST 指针

**Pre-exec（已过 · dual pass · ≠ 自动绿关）**：

- `reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md`
- `reviews/2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md` · **pass**
- `reviews/2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md` · **pass**

**Post-prove（本刀 · `post_prove_dual_pass` · 双独立审均 pass · 实现方不写 pass）**：

- `reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）**
- `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md` · **pass（honesty only）**

- **无** `mw-model-op` REQUEST（本批无 MODEL-OP live classify 子集；**不要**加 MODEL-OP live）

**Batch1（对照 · 已过）**：

- Batch1 harness/eval/slice = **`post_prove_dual_pass`**
- **不**把 Batch1 pass 读成 Batch2 covered

---

## 6. 仍禁止的抬升（即使已 dual pass）

1. `mw-e2e-ha` + `mw-rag-route` 已**独立**复跑/审本批 post-prove REQUEST 并均 pass；该 pass **不**扩大批准范围到 LOAD/HA/R4 closed。  
2. 专家写入 `reviews/`（实现方 **不**自签 pass）。  
3. 即便 dual pass：**仍禁**抬 covered / R4 closed / planner leaf 关 / HA / `releaseEvidence=true` / LOAD 绿（无另据）。  
4. **仍** `releaseEvidence=false` · ≠HA · ≠ LOAD 绿 · EXIT=0 **≠** covered。  
5. 本刀状态为 **`post_prove_dual_pass`**，依据两份专家独立 post-prove 收据；仍仅 honesty/partial，**≠** covered / R2 / R4 / HA。

---

*Harness · NHP Batch2 NEG/FAULT/BOUND · 2026-09-16 ~08:05 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ covered*
