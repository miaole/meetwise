# 审查归档 — NHP Batch1 NEG+PERF（执行前切片）· mw-e2e-ha

**日期**：2026-09-16（~04:53 PT）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；**不采信**实现方自批；本审**未跑**任何 nhp/neg/perf prove）  
**送审**：`reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`  
**配对**：`REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md` + 已落结论 `2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`（**pass**；冲突取更严）  
**结论**：**pass**（**执行前文档闸 / 第一批执行前基线**；见 §0）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/PERF SLO** · **本审未跑 prove**  
**开跑**：双域文档闸现已齐 → **仅允许谈**本批 prove；**开跑仍须 meetwise-core（或等价）另发执行授权** + 逐 CMD **新** EXIT 回执；旧 `.tmp` 收据**不得**冒充本批绿关

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（执行前基线可接受；假绿禁令与 EXIT 读法诚实） |
| Batch1 范围（7 IDs · ≤8）是否可接受 | **是**（NEG 为主 + 一条 PERF honesty；无云 Key；LOAD/HA/云 deferred） |
| 是否允许**谈**本批 prove | **是**（本域 pass + 配对 rag-route 已 pass；无更严冲突） |
| 是否允许**开跑**本批 prove | **否（默认）** — 须 meetwise-core / 执行刀**另发**授权；授权后按 harness §2 CMD 跑并回执；仍 ≠covered |
| EXIT=0 是否 = covered | **否** — 处处钉 honesty-pin / partial / case-only / blocked ≠ covered |
| 是否批 covered / HA / `releaseEvidence=true` / LOAD·PERF SLO / R2 关 | **否** |
| 本审是否执行 prove | **否（禁止）** |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md` |
| REQUEST（配对） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md` |
| Slice | `ai-docs/delivery/nhp-batch1-neg-perf.slice.md` |
| Harness | `ai-docs/delivery/harness/nhp-batch1-neg-perf.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch1-neg-perf.eval.md` |
| 用例全表 SSOT | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` |
| 父 harness | `ai-docs/delivery/harness/non-happy-path-perf-load-matrix.md` |
| 前序矩阵闸 | `reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域文档闸 **pass**；仍禁笼统 prove） |
| 个案 harness（抽核） | `uc-e2e-015-…` · `uc-e2e-033-…` · `privacy-erasure-http-503-pin` · `r2-classify-job-route` |
| 配对结论 | `reviews/2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`（**pass**） |
| 仓库根 | `/workspace/meetwise` → `/workspace/projects/meetwise` · HEAD `639134f` |

**执行旗核验**：harness/eval/REQUEST/slice 均为 `not_run:pre_dual_review` / 「本刀未跑」；未见本刀把行升 `covered`。本审**未**执行任何 Batch1 CMD。

---

## 2. 逐 case 核验

| Case ID | 矩阵旗 | CMD（冻结） | 定义完备？ | 与旗一致？ | EXIT=0 读法钉死？ | 本审裁定 | 缺口 / 假阳面 |
|---------|--------|-------------|------------|------------|-------------------|----------|---------------|
| **NHP-001-NEG-01** | case-only | `pnpm neg:auth` | **部分** | **是**（保持 case-only） | **是**（≠ 001 主链 NEG covered） | **可纳入** | 矩阵写「无额度/**鉴权**开面」；CMD 仅鉴权旁证，**无额度/开面拒**。禁止把 EXIT=0 写成 001-NEG 齐或升 partial→covered |
| **NHP-001-PERF-api-01** | case-only / blind | `pnpm uc001:live-blocked:prove`（Key unset） | **对本批成功标准完备**（honesty） | **是** | **是**（blocked honesty ≠ P95/SLO） | **可纳入** | 矩阵结构期望=可复现 P95；本批**故意**只跑 Key-unset pin。回写须仍 **case-only/blind**；禁升 PERF partial/covered |
| **NHP-015-NEG-01** | partial | `pnpm uc015:ingest-failures:prove` | **是**（F1–F5+无扣费） | **是** | **是**（≠ OCR FAULT / ≠ LOAD / ≠ 015 covered） | **可纳入** | isolated→pgvector **R5 green-risk**；015-FAULT/LOAD 仍 deferred |
| **NHP-050-NEG-01** | partial / honesty-pin | `pnpm privacy-erasure:http:prove` | **是**（DELETE=503 合同） | **是** | **是**（≠ 删除闭环） | **可纳入** | 预览 202 ≠ 生产 SLO；禁 erasure complete 叙事 |
| **NHP-033-NEG-01** | partial | `pnpm uc033:cross-user-authz:prove` | **是**（跨用户 404/403） | **是** | **是**（≠ 七类 ADV 齐；X10 ≠ PERF/LOAD SLO） | **可纳入** | A3 live worker / 七类竞态仍 GAP；R5 green-risk |
| **NHP-R2-NEG-01** | partial | `pnpm r2-classify-job-route-prereq:prove` | **是**（合同/wire 旁证；主审 rag-route） | **是** | **是**（≠ R2 closed / ≠ 路由已生效） | **可纳入**（本域对照） | 多为静态/源码合同钉；历史 dual / `.tmp` r2 收据 ≠ 本批新绿关 |
| **NHP-R2-FAULT-01** | partial | `pnpm g-r2-5-retrieve-fail-closed:prove` | **是**（缺 snapshot → degraded） | **是** | **是**（≠ R2/R4 closed） | **可纳入**（本域对照） | retrieve-side only；≠ unscoped 已禁于生产全路径宣称 |

**合计**：7/7 可纳入第一批执行前基线；**零**行批准升 `covered`。

---

## 3. REQUEST 六问（专家复核）

| # | 问 | 答 |
|---|----|-----|
| 1 | Batch1 是否足够小且高价值，且可无云 Key 谈执行？ | **是**。7≤8；NEG 高价值 + 一条 PERF honesty；CMDs 均不要求 MODEL_API_KEY / 云授权 |
| 2 | PERF 是否被错误写成容量/P95 已证？ | **否**。处处钉 blocked honesty ≠ SLO / ≠ `verify:e2e-performance` |
| 3 | EXIT=0 是否处处钉 ≠ covered / honesty / partial？ | **是**（harness §1/§4 + eval + REQUEST 一致） |
| 4 | 是否把矩阵文档闸 pass / 硬闸生效误读为已授权开跑？ | **否（文档未误读）**；本审亦钉：文档闸 ≠ 执行授权 |
| 5 | 实现方是否越权跑 prove / 回写 covered？ | **未见本刀越权**（`not_run:pre_dual_review`；无 covered 回写迹象） |
| 6 | LOAD/HA/云是否偷渡进本批绿叙事？ | **否**（明确 deferred） |

---

## 4. 专家五答（请专家回答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 范围与 CMD 冻结是否可接受为第一批执行前基线？ | **可接受** |
| 2 | 双审通过前不得开始本批 prove？ | **同意**（本刀时点：双审现齐 → 转「谈执行」；仍禁无授权开跑） |
| 3 | 双审通过后开跑是否仍须另发执行授权 + CMD+EXIT？ | **是** — meetwise-core（或等价）显式授权；逐 CMD **新**收据；禁复用历史 `.tmp` |
| 4 | 阻塞项？ | **无硬阻塞**（见 §5 立场钉 / nit） |
| 5 | 是否扩/缩 case ID？ | **维持 7**。不扩 LOAD/FAULT/BOUND/云/HA；不缩 RAG 两行（配对域已接受） |

---

## 5. 立场钉与 nit（不单独升 block）

| ID | 级别 | 项 |
|----|------|-----|
| B0 | **立场钉** | 任意未来 EXIT=0：`≠ covered` · `≠ HA` · `releaseEvidence=false` · ≠ family green · ≠ LOAD/PERF SLO · ≠ R2/R4 关 |
| B1 | **立场钉** | 开跑须 **另发执行授权**；本审 pass + rag-route pass **≠** 已授权执行 |
| B2 | **立场钉** | 禁把旧 prove / `.tmp/r4-follow-*` / 历史 privacy 日志回写为本批绿关；须本批授权下 **新** CMD+EXIT |
| N1 | **nit** | `NHP-001-NEG-01`：额度/开面面未进 CMD — 回写保持 **case-only**；勿宣称 001 主链 NEG 齐 |
| N2 | **nit** | `NHP-001-PERF-api-01`：P95 仍 blind — 回写保持 **case-only/blind**；勿因 live-blocked 绿升 PERF |
| N3 | **nit** | 经 `run-e2e-isolated` 的 015/033/050：**R5 green-risk** 即使 EXIT=0 |
| N4 | **对照** | RAG 两行主审已为 rag-route **pass**；本域不代签 R2 overall / 路由已生效 |

---

## 6. 假阳风险（对抗摘要）

| 若有人说… | 正确读法 |
|-----------|----------|
| Batch1 REQUEST/harness 存在或本审 pass | 仅执行前基线；**未跑** / **未授权开跑** |
| 双审 pass | 允许**谈** prove；≠ 已跑绿 / ≠ covered |
| `neg:auth` EXIT=0 | 鉴权旁证；≠ 001 额度/开面 NEG covered |
| `uc001:live-blocked` EXIT=0 | blocked honesty；≠ API P95 / ≠ live covered |
| `uc015` / `uc033` EXIT=0 | partial；≠ LOAD / ≠ 七类齐 / ≠ UC covered |
| `privacy-erasure:http` EXIT=0 | DELETE=503 pin；≠ 删除闭环 |
| `r2-prereq` / `g-r2-5` EXIT=0 | 合同/fail-closed；≠ 路由已生效 / ≠ R2·R4 关 |
| 本批绿 = 非快乐路径全家 covered | **假阳** |
| 矩阵/硬闸文档闸 pass = 本批已授权 | **假阳** |

---

## 7. 裁定

| 项 | 值 |
|----|-----|
| **结论** | **pass** |
| **是否允许谈本批 prove** | **是**（双域齐） |
| **是否允许开跑本批 prove** | **否**，直至 meetwise-core（或等价）**另发执行授权**；授权后 CMD+EXIT；仍 ≠covered / ≠HA / `releaseEvidence=false` |
| **批准范围** | 承认 Batch1 7 IDs + CMD/EXIT 诚实读法为**第一批执行前基线**；假绿禁令诚实；无 LOAD/HA/云偷渡 |
| **不批** | covered、HA、`releaseEvidence=true`、PERF SLO、LOAD 绿、001 主链 NEG 齐、删除闭环、R2/R4 关、无授权开跑、历史收据冒充本批 |

---

## 收据

- 专家：`mw-e2e-ha`
- 覆盖 REQUEST：`ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`
- 本结论：`ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`
- 配对：`ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`（pass）
- **本审未跑 prove**（硬钉遵守）
- HEAD：`639134f`
- 时刻：2026-09-16 ~04:53 PT · `releaseEvidence=false` · ≠HA

---

*Review · NHP Batch1 NEG+PERF · mw-e2e-ha · 2026-09-16 ~04:53 PT · pass · 谈执行≠开跑 · releaseEvidence=false · ≠HA*
