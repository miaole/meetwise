# 审查归档 — NHP Batch2 NEG+FAULT+BOUND **post-prove** · mw-e2e-ha

**日期**：2026-09-16（~08:05 PT · post-prove 独立复跑）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；**不采信**实现方自报 EXIT；**本审独立复跑** 7 CMD）  
**送审**：`reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`（pass · 开跑否）  
**配对**：`reviews/2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md`（执行前 pass 已落）· post-prove REQUEST `REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`（R4-BOUND 主审 defer；本域仅核对诚实钉；**不采信代替**）  
**结论**：**pass**（见 §0 批准范围硬钉）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/PERF SLO** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ refund/abandon/regen 全家齐**

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| 独立复跑 7 CMD 与实现方 EXIT 表 | **一致**（7/7 EXIT=0） |
| EXIT=0 是否 = covered / R2·R4 / SLO / LOAD / HA | **否**（处处诚实钉仍在；日志自钉 GAP / BLOCKED_FOR_COVERED / R5-MARKED-RED） |
| harness/slice/eval 是否仍钉 `releaseEvidence=false` + 假绿禁令 | **是**（旗仍 `executed:awaiting_post_prove_dual`；**未见**升 covered） |
| 是否把 pre-exec dual pass + 本绿自动批「全家 covered」 | **否** |
| 是否跑禁令 CMD（`e2e:isolated` / `verify:e2e-performance` / 云 / HA） | **否**（本审亦未跑） |
| R4-BOUND 是否 defer 配对 `mw-rag-route` | **是**（本域仅诚实钉核对；**不代签** R4 closed / planner leaf） |
| **批准范围** | **仅**「本批 honesty/partial 复跑绿」：7× 冻结 CMD 本环境独立复跑 EXIT=0，且读法保持 partial / honesty-pin |
| **不批** | covered · family green · `releaseEvidence=true` · PERF SLO · LOAD 绿 · HA · R2/R4 closed · planner leaf · refund complete · 018·019 全家齐 · 002 covered · SSE SLO · sole-stack / R5 退役 |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域 post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` |
| REQUEST（配对 rag-route） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md` |
| 前序 pre-exec（本域） | `reviews/2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`（pass · 开跑否） |
| 前序 pre-exec（配对） | `reviews/2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md`（pass） |
| Slice | `ai-docs/delivery/nhp-batch2-neg-fault.slice.md`（`executed:awaiting_post_prove_dual`） |
| Harness | `ai-docs/delivery/harness/nhp-batch2-neg-fault.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch2-neg-fault.eval.md` |
| 用例全表 / 父 harness | `non-happy-path-perf-load-case-matrix.md` · `harness/non-happy-path-perf-load-matrix.md` |
| 独立复跑收据 | `.tmp/nhp-batch2-post-prove-ha-rerun/cmd{1..7}.{log,exit}` · `run.log` |
| 仓库 | `/workspace/meetwise` → `/workspace/projects/meetwise` · HEAD `639134f` |

**Key**：`MODEL_API_KEY` unset（仅 env 探测；**未读** `.env*`）。  
**禁令遵守**：本审未执行 `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove / LOAD_* / PERF-CLOUD。  
**未碰** Meridian。

---

## 2. 独立复跑 CMD+EXIT（权威 · 不采信自报）

复跑时刻：2026-09-16 ~08:04–08:05 PT · `unset MODEL_API_KEY` · Docker OK · HEAD `639134f`。

| # | Case ID | CMD | EXIT | 关键 NOTE（本审日志） | 诚实读法（硬钉） |
|---|---------|-----|------|------------------------|------------------|
| 1 | NHP-002-BOUND-01 | `pnpm uc002:lease:prove` | **0** | L1–L3 CAS PASS；`BLOCKED_FOR_COVERED: HTTP lease mouth…`；`[R5-MARKED-RED] pgvector-legacy`；`release_evidence=false` | lease L1–L3 **partial**；**≠** 002 covered / ≠ HTTP dual-session / Playwright；R5 green-risk |
| 2 | NHP-010-FAULT-01 | `pnpm uc010:sse-resume:prove` | **0** | R1–R4 + R-mid PASS；GAP pins：FULL-E2E / A3-KILL / UI / CROSS-REPLICA；`EXIT=0≠covered`；R5-MARKED-RED | SSE/LED + R-mid **partial**；**≠** 流式 SLO / ≠ full.e2e / ≠ 跨副本 |
| 3 | NHP-011-NEG-01 | `pnpm uc011:report-refund:http:prove` | **0** | H4/H5：refund 口 404×3；`GAP-UC011-REFUND-CALLBACK` + §1b PREREQ；`EXIT=0 ≠ refund-callback 已实现`；R5-MARKED-RED | quarantine 误退拒 + refund 404 GAP **partial**；**≠** refund complete / ≠ UI-pay |
| 4 | NHP-017-FAULT-01 | `pnpm uc017:orphan:prove` | **0** | O1–O4 PASS；`BLOCKED_FOR_FULL_E2E`；`≠ covered`；R5-MARKED-RED | orphan reserved→released **partial**；**≠** LOAD / ≠ 容量 |
| 5 | NHP-018-NEG-01 | `pnpm uc018:abandon:http:prove` | **0** | abandon 后复活拒 + waiting_user；GAP：GRAPH/TTL/FULL-E2E；`HTTP prove 绿 ≠ 018 covered`；R5-MARKED-RED | abandon 复活拒 **partial**；**≠** 018 covered |
| 6 | NHP-019-FAULT-01 | `pnpm uc019:report-regenerate:http:prove` | **0** | H1–H3 并发 honesty；GAP：REGEN-IDEM-KEY / QUARANTINE-REGEN / DEMAND-PATH；`≠ 019 covered`；R5-MARKED-RED | retry∥quarantine **partial**；**≠** 019 covered / ≠ regen 幂等键已落 |
| 7 | NHP-R4-BOUND-01 | `pnpm g4-production-scoped-retrieve:prove` | **0** | `OK … partial P-WIRE; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false`；harness/status 仍钉 题域隔离 NOT closed | 主叶 scoped honesty；**≠** R4 closed / ≠ planner leaf（**配对域主审**） |

**对照实现方自报**：7/7 与 REQUEST/harness 表一致（均为 0）。**仍不采信自报作为唯一依据**——本表以本审复跑为准。

**未跑（禁 · 已核对）**：`e2e:isolated` · `verify:e2e-performance` · 云 TC · HA prove · LOAD_* · PERF-CLOUD。

---

## 3. REQUEST 六问（专家答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 实现方 EXIT 表是否与独立复跑一致？ | **是**（7/7 EXIT=0；见 §2） |
| 2 | 是否有任何 EXIT=0 被错误抬成 covered / PERF SLO / LOAD / HA / refund complete / 018·019 全家齐？ | **否**。slice/harness/eval/REQUEST 与日志 GAP pins 均保持 partial/honesty；未见升 `covered` |
| 3 | harness/slice/eval 是否仍钉 `releaseEvidence=false` 与假绿禁令？ | **是**（全文钉；isolated 收据亦 `release_evidence=false`；旗仍 awaiting_post_prove_dual） |
| 4 | 是否错误把 pre-exec dual pass + 本绿自动批准 Batch2「全家 covered」？ | **否**。本审批准范围**仅** honesty/partial 复跑绿；**明确不批** covered |
| 5 | 是否错误跑了禁令 CMD？ | **否**（实现方声明未跑；本审亦未跑） |
| 6 | R4-BOUND 一行是否应 defer 至配对 `mw-rag-route`？ | **是**。本域核对：CMD EXIT=0 且日志自钉 R4 NOT closed / ≠ planner / ≠ wrong_track=0；**不代签** R4 overall |

---

## 4. 对抗假阳升格（重点 · R4-BOUND / 011 / 010 / 002）

| 风险面 | 本审裁定 | 正确读法 |
|--------|----------|----------|
| **R4-BOUND** `g4-…` EXIT=0 | **禁升**（本域） | 主叶 scoped + missing-snapshot fail-closed only；日志自钉 **R4 NOT closed**；主审 **defer** `mw-rag-route`；**≠** planner leaf / wrong_track=0 / 路由已生效 |
| **011** refund http EXIT=0 | **禁升** | H5 显式 404 GAP + §1b PREREQ 清单；**≠** refund complete / refund-callback 已实现 / UI-pay |
| **010** sse-resume EXIT=0 | **禁升** | R-mid = HTTP ledger live-tail；GAP FULL-E2E/A3/跨副本；**≠** 流式 SLO / ≠ 002-FAULT 跨副本 |
| **002** lease EXIT=0 | **禁升** | L1–L3 integration CAS only；`BLOCKED_FOR_COVERED`；**≠** 002 covered / HTTP lease mouth / Playwright 双设备 |
| **017** orphan EXIT=0 | **禁升** | sweeper partial；**≠** LOAD_worker / 容量绿 |
| **018 / 019** http EXIT=0 | **禁升** | abandon/regen partial + 明确 GAP pins；**≠** 全家齐 |
| isolated pgvector EXIT=0 | **禁升** | 前 6 条均 `[R5-MARKED-RED]`；**≠** sole-stack / R5 退役 |
| pre-exec dual + 7×绿 | **禁升** | 仅证明「授权下 honesty/partial 复跑绿」；**≠** Batch2 全家 covered / family green |
| Docker 已启使 isolated 可跑 | **禁升** | 环境注记 **≠** HA / sole-stack |
| 实现方自写 reviews pass | **无效** | 本文件为专家独立审稿；实现方 REQUEST **不是** pass |

---

## 5. 立场钉（继承 + post-prove 强化）

| ID | 级别 | 项 |
|----|------|-----|
| B0 | **立场钉** | 任意本批 EXIT=0：`≠ covered` · `≠ HA` · `releaseEvidence=false` · ≠ family green · ≠ LOAD/PERF SLO · ≠ R2/R4 关 · ≠ planner leaf |
| B1 | **立场钉** | 本审 **pass** = 仅批准本批 honesty/partial 复跑绿；**禁止**假阳升格 covered |
| B2 | **立场钉** | R4-BOUND 主审权在 `mw-rag-route`；本域不代签 closed |
| B3 | **立场钉** | 本审单方 pass **≠** 双域 post-prove dual 齐；配对 post-prove 仍待独立落库 |
| N1 | 软钉 | 前 6 CMD fixture=pgvector → 持续 R5 green-risk（即便 EXIT=0） |
| N2 | 软钉 | 011 的 404 GAP 叙事在产品口浮出后须改刀；禁止继续用 GAP 冒充闭环（prove 已自钉 PREREQ-6） |

---

## 6. 批准范围 / 不批

| | |
|--|--|
| **批准范围** | 承认 Batch2（7 IDs）在 HEAD `639134f`、Key-unset、Docker OK 下 **独立复跑 7/7 EXIT=0**；与实现方 EXIT 表一致；诚实读法与 harness/eval/slice 假绿禁令一致；**仅** honesty/partial 复跑绿 |
| **不批** | covered；HA；`releaseEvidence=true`；LOAD/PERF SLO；R2/R4 closed；planner leaf；refund/abandon/regen 全家齐；002 covered；SSE SLO；family green；sole-stack；把本审 pass 读成已升 covered 或代替配对 rag-route post-prove |
| **下一步** | 等待 `mw-rag-route` 独立写 post-prove review；双域均 pass 且无更严冲突后，旗可迁 `post_prove_dual_pass`——**仍** `releaseEvidence=false` · **仍禁**抬 covered |

---

## 7. 硬钉（回传用）

- **结论**：**pass**（仅本批 honesty/partial 复跑绿）  
- **CMD+EXIT**：见 §2（7/7 =0；独立复跑权威）  
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md`  
- **假阳风险**：EXIT=0≠covered；R4 scoped≠R4/planner 关；011 404≠refund complete；010≠SLO；002≠covered；isolated=R5 green-risk；本域≠代替配对；pre-exec+本绿≠全家 covered  
- **本审独立复跑** · `releaseEvidence=false` · ≠HA · ≠ covered · 禁假阳升格

---

*Review · mw-e2e-ha · NHP Batch2 NEG/FAULT/BOUND post-prove · 2026-09-16 ~08:05 PT · pass（honesty/partial 复跑绿 only） · releaseEvidence=false · ≠HA · ≠ covered*
