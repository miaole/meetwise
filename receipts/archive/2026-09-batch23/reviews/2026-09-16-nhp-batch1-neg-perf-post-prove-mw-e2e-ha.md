# 审查归档 — NHP Batch1 NEG+PERF **post-prove** · mw-e2e-ha

**日期**：2026-09-16（~05:04 PT · post-prove 独立复跑）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；**不采信**实现方自报 EXIT；**本审独立复跑** 7 CMD）  
**送审**：`reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`（pass · 可谈 prove · 开跑须授权）  
**配对**：`REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md`（RAG 两行主审 defer；本域仅核对诚实钉；**不采信代替**）  
**结论**：**pass**（见 §0 批准范围硬钉）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/PERF SLO** · **≠ R2/R4 closed** · **≠ erasure complete**

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| 独立复跑 7 CMD 与实现方 EXIT 表 | **一致**（7/7 EXIT=0） |
| EXIT=0 是否 = covered / R2·R4 / SLO / LOAD / HA | **否**（处处诚实钉仍在） |
| harness/slice/eval 是否仍钉 `releaseEvidence=false` + 假绿禁令 | **是** |
| 是否把 pre-exec dual + 本绿自动批「全家 covered」 | **否** |
| 是否跑禁令 CMD（`e2e:isolated` / `verify:e2e-performance` / 云 / HA） | **否**（本审亦未跑） |
| RAG 两行是否 defer 配对 `mw-rag-route` | **是**（本域仅诚实钉核对） |
| **批准范围** | **仅**「本批 honesty/NEG 子集复跑绿」：7× 冻结 CMD 本环境独立复跑 EXIT=0，且读法保持 case-only / partial / honesty-pin / blocked |
| **不批** | covered · family green · `releaseEvidence=true` · PERF SLO · LOAD 绿 · HA · erasure complete · ADV 七类齐 · R2 closed · R4 closed · 路由已生效 · 001 主链 NEG 齐 |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域 post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md` |
| REQUEST（配对 rag-route） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md` |
| 前序 pre-exec 结论 | `reviews/2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`（pass） |
| Slice | `ai-docs/delivery/nhp-batch1-neg-perf.slice.md`（`executed:awaiting_post_prove_dual`） |
| Harness | `ai-docs/delivery/harness/nhp-batch1-neg-perf.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch1-neg-perf.eval.md` |
| 用例全表 SSOT | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（Batch1 行仍 case-only/partial；**未见**升 covered） |
| 独立复跑收据 | `.tmp/nhp-batch1-neg-perf-post-prove-ha-rerun/{cmd,exit}{1..7}.*` |
| 仓库 | `/workspace/meetwise` → `/workspace/projects/meetwise` · HEAD `639134f` |

**Key**：`MODEL_API_KEY` unset（仅 env 探测；**未读** `.env*`）。  
**禁令遵守**：本审未执行 `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove。

---

## 2. 独立复跑 CMD+EXIT（权威 · 不采信自报）

复跑时刻：2026-09-16 ~05:02–05:03 PT · `unset MODEL_API_KEY` · docker 可用 · HEAD `639134f`。

| # | Case ID | CMD | EXIT | 关键 NOTE（本审日志） | 诚实读法（硬钉） |
|---|---------|-----|------|------------------------|------------------|
| 1 | NHP-001-NEG-01 | `pnpm neg:auth` | **0** | `neg:auth: 81 条负路径用例全绿` | **case-only** 鉴权旁证；**≠** UC-001 主链 NEG covered；额度/开面面**未**进本 CMD |
| 2 | NHP-001-PERF-api-01 | `pnpm uc001:live-blocked:prove` | **0** | `STATUS=blocked(无 Key)`；`EXIT=0 = blocked honesty · ≠ live E2E · ≠ covered` | **blocked honesty**；**≠** API P95/SLO；**≠** `verify:e2e-performance`；**≠** live covered |
| 3 | NHP-015-NEG-01 | `pnpm uc015:ingest-failures:prove` | **0** | F1–F5+无扣费绿；`[R5-MARKED-RED] pgvector-legacy`；`release_evidence=false` | **partial**；**≠** OCR FAULT/LOAD；**≠** 015 covered；fixture=pgvector → **R5 green-risk** |
| 4 | NHP-050-NEG-01 | `pnpm privacy-erasure:http:prove` | **0** | `pass_count=19 fail_count=0`；`release_evidence=false`；R5-MARKED-RED | DELETE=503 **honesty-pin**；**≠** erasure complete / 删除闭环 |
| 5 | NHP-033-NEG-01 | `pnpm uc033:cross-user-authz:prove` | **0** | 51 条绿；GAP pins：WORKER-LIVE / CACHE-TRACE / SEVEN-CLASS / FULL-E2E；`EXIT=0≠covered` | **partial**；**≠** ADV 七类齐；X10 **≠** PERF/LOAD SLO；R5 green-risk |
| 6 | NHP-R2-NEG-01 | `pnpm r2-classify-job-route-prereq:prove` | **0** | 日志钉 `R2 NOT closed overall` · `≠ 路由已生效` · `releaseEvidence=false` | 合同/wire 旁证；**≠** R2 closed（**配对域主审**） |
| 7 | NHP-R2-FAULT-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | `retrieve-side only; R2 NOT closed; R4 NOT closed` | fail-closed；**≠** R2/R4 closed（**配对域主审**） |

**对照实现方自报**：7/7 与 REQUEST/harness 表一致（均为 0）。**仍不采信自报作为唯一依据**——本表以本审复跑为准。

**未跑（禁 · 已核对）**：`e2e:isolated` · `verify:e2e-performance` · 云 TC · HA prove。

---

## 3. REQUEST 六问（专家答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 实现方 EXIT 表是否与独立复跑一致？ | **是**（7/7 EXIT=0；见 §2） |
| 2 | 是否有任何 EXIT=0 被错误抬成 covered / PERF SLO / LOAD / HA / erasure complete / 七类齐？ | **否**。slice/harness/eval/REQUEST 与矩阵旗均保持 case-only/partial/honesty-pin/blocked；未见升 `covered` |
| 3 | harness/slice/eval 是否仍钉 `releaseEvidence=false` 与假绿禁令？ | **是**（全文钉；isolated 收据亦 `release_evidence=false`） |
| 4 | 是否错误把 pre-exec dual pass + 本绿自动批准 Batch1「全家 covered」？ | **否**。本审批准范围**仅** honesty/NEG 子集复跑绿；**明确不批**全家 covered |
| 5 | 是否错误跑了禁令 CMD？ | **否**（实现方声明未跑；本审亦未跑） |
| 6 | RAG 两行是否应 defer 至配对 `mw-rag-route`？ | **是**。本域核对：两 CMD EXIT=0 且日志自钉 R2/R4 NOT closed；**不代签** R2 overall / 路由已生效 |

---

## 4. 对抗假阳升格（重点）

| 风险面 | 本审裁定 | 正确读法 |
|--------|----------|----------|
| **001-NEG** `neg:auth` EXIT=0 | **禁升** | 81 条鉴权负路径旁证 = **case-only**；**≠** 001 额度/开面 NEG covered |
| **001-PERF** `uc001:live-blocked` EXIT=0 | **禁升** | Key-unset **blocked honesty**；**≠** P95/SLO；**≠** live covered；矩阵仍 case-only/blind |
| **050 privacy** EXIT=0 | **禁升** | DELETE=503 pin（pass_count=19）；**≠** erasure complete |
| **R2** 两行 EXIT=0 | **禁升**（本域） | 日志自钉 R2/R4 NOT closed；主审 **defer** `mw-rag-route`；**≠** 路由已生效 |
| **015 / 033** isolated EXIT=0 | **禁升** | partial + **R5-MARKED-RED** pgvector；**≠** LOAD / 七类齐 / UC covered |
| pre-exec dual pass + 7×绿 | **禁升** | 仅证明「授权下 honesty/NEG 子集复跑绿」；**≠** Batch1 全家 covered / family green |
| Docker 已启使 isolated 可跑 | **禁升** | 环境注记 **≠** HA / sole-stack |
| 实现方自写 reviews pass | **无效** | 本文件为专家独立审稿；实现方 REQUEST **不是** pass |

---

## 5. 立场钉（继承 + post-prove 强化）

| ID | 级别 | 项 |
|----|------|-----|
| B0 | **立场钉** | 任意本批 EXIT=0：`≠ covered` · `≠ HA` · `releaseEvidence=false` · ≠ family green · ≠ LOAD/PERF SLO · ≠ R2/R4 关 · ≠ erasure complete |
| B1 | **立场钉** | 批准范围**仅**「本批 honesty/NEG 子集复跑绿」；**禁止**借本 pass 宣称 Batch1 / 非快乐路径全家 covered |
| B2 | **立场钉** | RAG 两行结论以配对 `mw-rag-route` post-prove 为准；本域不代签 |
| B3 | **立场钉** | 经 `run-e2e-isolated` 的 015/033/050：即使 EXIT=0 仍 **R5 green-risk** |
| N1 | **nit** | `NHP-001-NEG-01` 额度/开面仍未进 CMD — 回写保持 **case-only** |
| N2 | **nit** | `NHP-001-PERF-api-01` P95 仍 blind — 回写保持 **case-only/blind** |

---

## 6. 裁定

| 项 | 值 |
|----|-----|
| **结论** | **pass** |
| **批准范围** | 本批 **honesty/NEG 子集** 7× 冻结 CMD **独立复跑绿**（EXIT=0），诚实读法与假绿禁令仍钉死 |
| **不批** | covered · family green · `releaseEvidence=true` · PERF SLO · LOAD 绿 · HA · erasure complete · ADV 七类齐 · R2/R4 closed · 路由已生效 · 001 主链 NEG 齐 · 禁令 CMD 冒充绿关 |
| **配对** | RAG 两行 defer `mw-rag-route`；冲突取更严阻塞项 |
| **假阳风险摘要** | 最大风险是把「7× EXIT=0 + 双审 pass」误读为 Batch1/非快乐路径 **covered** 或 PERF/R2/privacy **闭环**——本审明确否决 |

---

## 收据

- 专家：`mw-e2e-ha`
- 覆盖 REQUEST：`ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`
- 本结论：`ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`
- 独立复跑日志：`.tmp/nhp-batch1-neg-perf-post-prove-ha-rerun/`
- 配对 REQUEST：`reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md`（待/或已由配对域写结论；本审不代替）
- HEAD：`639134f`
- 时刻：2026-09-16 ~05:04 PT · `releaseEvidence=false` · ≠HA · ≠ covered

---

*Review · NHP Batch1 NEG+PERF post-prove · mw-e2e-ha · 2026-09-16 ~05:04 PT · pass · 仅 honesty/NEG 子集复跑绿 · releaseEvidence=false · ≠HA · ≠ covered*
