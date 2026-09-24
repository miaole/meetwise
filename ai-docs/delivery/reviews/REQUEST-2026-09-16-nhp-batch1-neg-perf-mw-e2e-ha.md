# REQUEST — NHP Batch1 NEG+PERF（第一批 scoped）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~04:50 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ 全量 E2E 已齐**  
**配对**：`REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify 子集）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· 矩阵双域文档闸已 pass · **本 REQUEST ≠ 已授权开跑 prove**  
**本刀**：**停在 harness/REQUEST**；**未跑**任何 prove

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/nhp-batch1-neg-perf.slice.md` | 切片索引 |
| `delivery/harness/nhp-batch1-neg-perf.md` | Batch1 CMD/EXIT 冻结；**未跑** |
| `delivery/eval/nhp-batch1-neg-perf.eval.md` | 评测笔记；延期清单 |
| `delivery/non-happy-path-perf-load-case-matrix.md` | 用例全表 SSOT |
| `delivery/harness/non-happy-path-perf-load-matrix.md` | 父 harness |
| `delivery/e2e-requirement-coverage-matrix.md` §0.5 / §1.0 | 强制列 + 盲区 |
| `delivery/north-star-hard-gates.md` | 硬闸（文档闸已生效 ≠ prove 笼统开跑） |
| 前序矩阵审 | `reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（文档闸 pass；仍禁笼统 prove） |

---

## 切片立场

本刀是矩阵文档闸通过后的 **第一条授权批次路径**：只交付 **Batch1（7 case IDs）** 的 harness/eval/REQUEST，供独立专家审。  
**未**执行 prove；**未**升 covered；**未**宣称 LOAD/PERF SLO/HA。

不得冒充：

- 非快乐路径全家已执行 / covered / family green  
- PERF P95 / 线上 SLO / LOAD 产能已证  
- UC-001 主链 NEG 已进 full.e2e covered  
- DELETE 擦除已闭环 / R2 路由已生效（RAG 交配对域）  
- `releaseEvidence=true` / HA  
- 「硬闸已生效」= 「本批 prove 已自动授权」

---

## Batch1 范围（请核对选型）

| Case ID | CMD（双审后） | EXIT=0 读法 |
|---------|---------------|-------------|
| NHP-001-NEG-01 | `pnpm neg:auth` | 鉴权负路径旁证；≠ 001 covered |
| NHP-001-PERF-api-01 | `pnpm uc001:live-blocked:prove`（Key unset） | blocked honesty；≠ PERF SLO |
| NHP-015-NEG-01 | `pnpm uc015:ingest-failures:prove` | ingest NEG partial；≠ LOAD |
| NHP-050-NEG-01 | `pnpm privacy-erasure:http:prove` | DELETE=503 pin；≠ 删除闭环 |
| NHP-033-NEG-01 | `pnpm uc033:cross-user-authz:prove` | 跨用户 NEG partial；≠ 七类齐 / ≠ SLO |
| NHP-R2-NEG-01 | `pnpm r2-classify-job-route-prereq:prove` | （配对域主审）≠ R2 关 |
| NHP-R2-FAULT-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | （配对域主审）≠ R2/R4 关 |

**延期（本批外）**：全部 LOAD、PERF_web、PERF-CLOUD、HA、001-FAULT、015-FAULT/BOUND 点名扩面、R4/R5/RAG-LOAD、MODEL-OP live。

---

## 请专家复核（文档审 · 本刀不要求复跑 prove）

1. Batch1 是否足够小且高价值（NEG + 一条 PERF honesty），且 **可无云 Key** 谈执行？  
2. PERF 是否被错误写成容量/P95 已证（期望：**否**；仅 Key-unset blocked pin）？  
3. EXIT=0 读法是否处处钉 `≠ covered` / honesty-pin / partial？  
4. 是否错误把矩阵文档闸 pass 或硬闸生效读成「已授权开跑本批 prove」？（期望：**否**；须本双审 + 后续执行授权）  
5. 实现方是否越权跑了 prove / 回写 covered？（期望：**否**）  
6. LOAD/HA/云是否被偷渡进本批绿叙事？（期望：**否**）

---

## 请专家回答（结论落 reviews/）

1. 本 Batch1 范围与 CMD 冻结是否可接受为 **第一批执行前基线**？  
2. 是否同意：**在双审通过前不得开始本批 prove**？  
3. 双审通过后，开跑是否仍须 meetwise-core（或等价）**另发执行授权** + CMD+EXIT 回执？  
4. 阻塞项（若有）是什么？  
5. 是否需要扩/缩 case ID 列表？

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / PERF SLO / 001 全 NEG 齐。  
- **await dual before prove**；本刀零 prove。

---

*REQUEST · mw-e2e-ha · NHP Batch1 NEG+PERF · 2026-09-16 ~04:50 PT · releaseEvidence=false · ≠HA*
