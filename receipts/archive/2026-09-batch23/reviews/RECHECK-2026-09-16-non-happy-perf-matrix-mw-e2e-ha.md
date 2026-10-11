# RECHECK — 非happy+PERF/LOAD 矩阵 B1/B2 + 硬闸 H1–H3 · mw-e2e-ha

**状态**：**RECHECK / 待复审**（实现方；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**对照回执**：`reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（**conditional**）· `reviews/2026-09-16-north-star-hard-gates-mw-e2e-ha.md`（**conditional**）  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **本刀未跑 prove**

## 已修

### 矩阵 B1 — §1.0 ↔ case-matrix 旗对齐（尤其 ADV）

| 行 | 改后 ADV（及相关） |
|----|-------------------|
| UC-E2E-001 | ADV → **blind** / `case-only`（对齐 NHP-001-ADV-01） |
| UC-E2E-002 | ADV → **blind** / `case-only`；FAULT 注明跨副本杀 SSE `case-only` |
| UC-E2E-011 | ADV → **gap** / `case-only`（对齐 NHP-011-ADV-01） |

### 矩阵 B2 — 具名 GAP/out-of-scope

新增 case-matrix §1.7 + §2 标红 + §1.0.1 行：

- `NHP-UI-PAY-NEG-01` — UI 支付拒绝  
- `NHP-CLOUD-KILL-FAULT-01` — 云 kill / 跨 AZ  
- `NHP-HA-FAILOVER-RTO-01` — 多副本 failover · RTO  

### 硬闸 H1 / N1 + H2/H3 钉

| 项 | 改动 |
|----|------|
| H1 | `north-star-hard-gates.md` 文首「硬闸生效」→ **草案 · 待 ≥2 独立域审通过后生效** |
| N1 | G3 步骤 2 列枚举 → **NEG+FAULT+BOUND+ADV+PERF+LOAD** + 分面 |
| H2/H3 | 文首 + §4：第二域未闭不得宣称生效；矩阵 conditional 未闭不得借硬令宣称执行面落地 |

### B3

配对 `mw-rag-route` 措辞 RECHECK 另件：`RECHECK-2026-09-16-non-happy-perf-matrix-mw-rag-route.md`。本域仍 **不单独**开跑 prove。

## 请专家确认

1. B1 旗漂移是否已闭合？  
2. B2 三具名缺口是否足够防「未列=已覆盖」？  
3. 硬闸文首草案钉 + G3 六列是否满足 H1/N1？  
4. 是否仍同意：**B1–B3 + 硬闸双域未齐前禁任何 prove**？

## 非宣称

- 本 RECHECK **不是** pass · 硬闸 **仍未生效** · **未跑任何 prove** · ≠ covered / ≠ HA / `releaseEvidence=false`
