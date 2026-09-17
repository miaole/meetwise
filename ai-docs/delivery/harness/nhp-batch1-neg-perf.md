# Harness — NHP Batch1 · 第一批 NEG+PERF（scoped · **post-prove dual pass**)

**状态**：`post_prove_dual_pass` · 7× CMD **已跑**（本环境新鲜 EXIT）· 两个 post-prove 独立审查均 **pass** · **仍 ≠ covered**  
**日期**：2026-09-16（~05:00 PT · post-prove 回执）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/容量绿** · **≠ R2/R4 closed** · **≠ 路由已生效** · **≠ PERF SLO**  
**硬闸**：`north-star-hard-gates.md` **已生效（文档闸）** · 矩阵双域文档闸 **已 pass** · 本批 **pre-exec dual pass** + meetwise-core 执行授权 → **仅本批 CMD**  
**专家（post-prove 双审）**：`mw-e2e-ha` + `mw-rag-route`（本批 **无** MODEL-OP 子集 → **不**并列 `mw-model-op`）  
**对照全表**：`delivery/non-happy-path-perf-load-case-matrix.md`  
**对照父 harness**：`harness/non-happy-path-perf-load-matrix.md`  
**对照 eval**：`eval/nhp-batch1-neg-perf.eval.md`  
**MODEL_API_KEY**：本批 **不要求**；实测 **Key-unset**（仅 `process.env` 探测；**未读** `.env*`）；**禁止**发明 Key / 硬跑 live isolated  
**R4 旁注**：R4-REAL-WIRE dual pre-exec 已 pass 为 **correctly NOT wiring**（P-PLANNER blocker）· **本批不改 R4 接线 / 不开 R4 编码**

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 本刀目标 | 按 harness 冻结 7 CMD 跑出新鲜 EXIT 回执；回写 executed；完成 post-prove 双审；仍 **≠ covered** |
| 本刀禁止 | `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove **作绿关**；实现方自签 `reviews/` pass |
| 假绿禁令 | partial / case-only / honesty-pin / blocked EXIT=0 **≠** covered；LOAD/容量 **不在本批**；EXIT=0 **≠** R2/R4 关 |
| 自批 | 实现方 **禁止**自签 `reviews/` pass（含本批 post-prove） |
| 抬升 | post-prove 双审已由专家写入 reviews/；仍 `releaseEvidence=false`；**禁止**抬 covered / R2 closed / R4 closed / HA |

---

## 1. Batch1 用例集（7 IDs）· 新鲜 CMD+EXIT（~05:00 PT）

> 选型：高价值 NEG + 一条 PERF_api **诚实/blocked** 钉；优先 `partial`/`case-only`；**可本地 isolated / 无云 Key**。  
> **不含** LOAD / PERF_web / 云 / HA / R4 ADV / R5 PERF。

| # | Case ID | 列 | 旗 | CMD | EXIT | EXIT 诚实读法 |
|---|---------|----|----|-----|------|---------------|
| 1 | **NHP-001-NEG-01** | NEG | **case-only** | `pnpm neg:auth` | **0** | 鉴权负路径旁证（81 条）；**≠** UC-001 主链 NEG covered；主链仍 blind/case-only |
| 2 | **NHP-001-PERF-api-01** | PERF_api | **case-only** / **blind** | `pnpm uc001:live-blocked:prove`（Key **unset**） | **0** | **blocked(无 Key) honesty pin**；**≠** API P95/SLO；**≠** live covered；**≠** `verify:e2e-performance` 绿 |
| 3 | **NHP-015-NEG-01** | NEG | **partial** | `pnpm uc015:ingest-failures:prove` | **0** | 加密/畸形/MIME 拒；无扣费；**≠** OCR FAULT；**≠** LOAD；fixture=pgvector → green-risk/R5 |
| 4 | **NHP-050-NEG-01** | NEG | **partial** / honesty-pin | `pnpm privacy-erasure:http:prove` | **0** | 公开 DELETE **503** pin（pass_count=19）；**≠** 删除闭环 / erasure complete |
| 5 | **NHP-033-NEG-01** | NEG | **partial** | `pnpm uc033:cross-user-authz:prove` | **0** | 跨用户 404/403 partial（51 条）；**≠** 七类 ADV 齐；X10 **≠** PERF/LOAD SLO |
| 6 | **NHP-R2-NEG-01** | NEG | **partial** | `pnpm r2-classify-job-route-prereq:prove` | **0** | fail-closed / ineligible_route 合同；wire 旁证；**≠** R2 closed / **≠** 路由已生效 |
| 7 | **NHP-R2-FAULT-01** | FAULT | **partial** | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | 缺 snapshot → degraded denial；**≠** R2/R4 closed；**≠** unscoped 已禁于生产全路径 |

**合计**：7 case IDs（≤8）。**零 covered** 写回；**executed ≠ covered**。

---

## 2. 命令冻结（已执行 · 回执）

```bash
cd /workspace/meetwise
pnpm neg:auth                                    # EXIT=0
pnpm uc001:live-blocked:prove                    # EXIT=0 · Key-unset blocked honesty
pnpm uc015:ingest-failures:prove                 # EXIT=0 · partial
pnpm privacy-erasure:http:prove                  # EXIT=0 · DELETE=503 pin
pnpm uc033:cross-user-authz:prove                # EXIT=0 · partial
pnpm r2-classify-job-route-prereq:prove          # EXIT=0 · ≠ R2 closed
pnpm g-r2-5-retrieve-fail-closed:prove           # EXIT=0 · ≠ R2/R4 closed
# 仍禁：pnpm e2e:isolated / verify:e2e-performance / 云 TC / HA prove
```

| 本刀状态 | 值 |
|----------|-----|
| 执行旗 | **`post_prove_dual_pass`**（原 `executed:awaiting_post_prove_dual` / `not_run:pre_dual_review` 已清） |
| Key | `process.env` 探测：**unset**；**不读** `.env*` |
| 夹具 | 经 `run-e2e-isolated` 的条目默认 pgvector → **green-risk / R5**（即使 EXIT=0） |
| 实现方自批 | **禁止**；post-prove reviews/ 由专家独立写 |

### 2.1 显式不跑 / 禁止冒充

| CMD / 动作 | 为何禁（本刀 / 本批） |
|------------|----------------------|
| `pnpm e2e:isolated` / `e2e:ui:isolated` | 需 Key；happy-only 假绿风险；≠ Batch1 NEG covered |
| `pnpm verify:e2e-performance` | 历史/编排 ≠ 当前 PERF_api SLO；本批只用 live-blocked honesty |
| 任意 LOAD_* / 云 THR / HA fault-inject | **deferred**；禁容量绿 |
| 把本批 EXIT=0 回写 covered / R2 closed / R4 closed | **假绿**；即使 post-prove 双审 pass 仍禁无据抬升 |

### 2.2 执行环境注记（诚实 · 非绿关）

首轮在无 Docker 环境下，`run-e2e-isolated` 目标曾 `bounded_command_spawn_failed`（EXIT=1）。本环境安装并启动 `docker.io`/`dockerd` 后 **重跑** 得上表新鲜 EXIT=0。该注记 **≠** 基础设施已 HA / ≠ sole-stack。

---

## 3. 盲区 / gap 诚实（本批边界）

| 项 | 读法 |
|----|------|
| NHP-001-NEG-01 | **case-only**；`neg:auth` ≠ 001 开面额度/鉴权全矩阵进 full.e2e |
| NHP-001-PERF-api-01 | **无**可复现 P95 收据；本批仅 Key-unset **blocked pin** |
| NHP-015 OCR FAULT / LOAD | **不在本批**（仍 blind/case-only 于全表） |
| NHP-033 七类 ADV / X10 PERF | **不在本批** |
| NHP-050 FAULT 擦除中途 | **不在本批** |
| R2 overall / 路由已生效 | **仍 NOT closed**；本批 NEG/FAULT prove 绿 ≠ 关 R2 |
| R4 / R5 / RAG-LOAD | **deferred**；R4 不接线 |
| LOAD / PERF_web / PERF-CLOUD / HA | **deferred**；禁宣称产能 |

---

## 4. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| Batch1 7× EXIT=0 | **executed** honesty；**≠** covered / family green |
| `uc001:live-blocked` EXIT=0 | blocked honesty；**≠** PERF SLO |
| `privacy-erasure:http` EXIT=0 | DELETE=503 pin；**≠** 删除闭环 |
| `r2-prereq` / `g-r2-5` EXIT=0 | fail-closed 合同；**≠** 路由已生效 / R2·R4 关 |
| `uc015` / `uc033` / `neg:auth` EXIT=0 | partial / case-only 旁证；**≠** LOAD / 七类齐 / 001 covered |
| post-prove 双审已回写 | **pass 仅限本批 honesty/NEG 子集**；**≠** covered / R2/R4 / HA / SLO / LOAD |
| 本批绿 = 非快乐路径全家 covered | **假阳** |

---

## 5. REQUEST 指针

**Pre-exec（已 dual pass · ≠ 自动绿关）**：

- `reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`
- 结论：`reviews/2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md` · `reviews/2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`

**Post-prove（双审已 pass · 仅限 honesty/NEG 子集 · 实现方禁止自批）**：

- `reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md`
- `reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`
- `reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md`

- **无** `mw-model-op` REQUEST（本批无 MODEL-OP live classify 子集）

---

## 6. 仍禁止的抬升（即使 post-prove 双审 pass）

1. `mw-e2e-ha` + `mw-rag-route` 已**独立**复跑 / 审本批 post-prove REQUEST + EXIT 表；该 pass **不**扩大批准范围。  
2. 专家已写入 `reviews/`（实现方 **不**自签 pass）。  
3. 即便 dual pass：**仍禁**抬 covered / R2 closed / R4 closed / HA / `releaseEvidence=true` / LOAD 绿（无另据）。  
4. **仍** `releaseEvidence=false` · ≠HA · ≠ LOAD 绿 · EXIT=0 **≠** covered。

---

*Harness · NHP Batch1 NEG+PERF · 2026-09-16 ~05:00 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ covered*
