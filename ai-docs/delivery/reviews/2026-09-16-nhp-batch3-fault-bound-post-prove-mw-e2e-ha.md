# 审查归档 — NHP Batch3 FAULT/BOUND **post-prove** · mw-e2e-ha

**日期**：2026-09-16（~19:20 PT · post-prove 独立复跑）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；**不采信**实现方自报 EXIT；**本审独立复跑** 7 CMD）  
**送审**：`reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md`  
**前序 RECHECK**：`reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md`（**pass** · 执行前文档闸 only · 零 prove）  
**前序 pre-exec**：`reviews/2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md`（conditional → RECHECK 后文档闸清）  
**配对**：`reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`（R4-NEG / R4-FAULT 主审 **defer**；本域仅核对诚实钉；**不采信代替**；须独立写）  
**结论**：**pass**（见 §0 批准范围硬钉）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/PERF SLO** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ wrong_track=0** · **≠ ADV covered** · **≠ refund complete** · **≠ 019 covered**

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass** |
| 独立复跑 7 CMD 与实现方 EXIT 表 | **一致**（7/7 EXIT=0） |
| EXIT=0 是否 = covered / family green / LOAD·PERF SLO / HA | **否**（处处诚实钉仍在；日志自钉 GAP / BLOCKED / R5-MARKED-RED / FLIPPED≠关） |
| FLIPPED CALL_SITES≥1 是否 = R4 closed / wrong_track=0 / ADV covered | **否**（cmd7 自钉 `FLIPPED: CALL_SITES=1≥1; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false`） |
| harness/slice/eval 是否仍钉 `releaseEvidence=false` + 假绿禁令 | **是**（旗仍 `executed:awaiting_post_prove_dual`；**未见**升 covered） |
| 矩阵本批 7 行是否被抬 covered | **否**（仍 **partial** / **gap**/honesty；R4-FAULT 仍 FLIPPED） |
| 是否把 pre-exec/RECHECK dual + 本绿自动批「全家 covered」 | **否** |
| 是否跑禁令 CMD（`e2e:isolated` / `verify:e2e-performance` / 云 / HA / LOAD / PERF-CLOUD / Meridian） | **否**（本审亦未跑） |
| R4-NEG / R4-FAULT 是否 defer 配对 `mw-rag-route` | **是**（本域仅诚实钉核对；**不代签** R4 closed / wrong_track=0 / ADV） |
| 与 Batch1/Batch2 IDs 重叠 regress | **无**（case ID 不重复；共享 CMD ≠ 本批 covered） |
| **批准范围** | **仅**「本批 honesty/partial/gap 复跑绿」：7× 冻结 CMD 本环境独立复跑 EXIT=0，读法保持 partial / honesty-pin / gap |
| **不批** | covered · family green · `releaseEvidence=true` · PERF SLO · LOAD 绿 · HA · R2/R4 closed · planner leaf · wrong_track=0 · ADV covered · refund complete · 019 全家齐 · 把本审代替配对 rag-route |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域 post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md` |
| REQUEST（配对 rag-route） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md` |
| 前序 RECHECK（本域） | `reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md`（pass · 零 prove） |
| Slice | `ai-docs/delivery/nhp-batch3-fault-bound.slice.md`（`executed:awaiting_post_prove_dual`） |
| Harness | `ai-docs/delivery/harness/nhp-batch3-fault-bound.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch3-fault-bound.eval.md` |
| 用例全表 / 父 harness | `non-happy-path-perf-load-case-matrix.md` · `harness/non-happy-path-perf-load-matrix.md` |
| 风格对照 | `reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` |
| 独立复跑收据 | `.tmp/nhp-batch3-post-prove-ha-rerun/cmd{1..7}.{log,exit}` · `run.log` |
| 仓库 | `/workspace/meetwise`（→ `/workspace/projects/meetwise`） · HEAD `639134f` |

**Key**：`MODEL_API_KEY` unset（仅 env 探测；**未读** `.env*`）。  
**禁令遵守**：本审未执行 `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove / LOAD_* / PERF-CLOUD / Meridian。  
**未碰** Meridian。

---

## 2. 独立复跑 CMD+EXIT（权威 · 不采信自报）

复跑时刻：2026-09-16 ~19:19–19:20 PT · `unset MODEL_API_KEY` · Docker OK · HEAD `639134f`。

| # | Case ID | CMD | EXIT | 关键 NOTE（本审日志） | 诚实读法（硬钉） |
|---|---------|-----|------|------------------------|------------------|
| 1 | NHP-015-BOUND-01 | `pnpm uc015:ingest-failures:prove` | **0** | F2/F3 + F1/F4/F5 PASS；`≠covered`；`[R5-MARKED-RED]` pgvector；`release_evidence=false` | F2/F3 BOUND 入口拒 **partial**；**≠** OCR FAULT / ≠ LOAD · R5 green-risk |
| 2 | NHP-011-FAULT-01 | `pnpm uc011:report-refund:prove` | **0** | R1–R4；`GAP-UC011-REFUND-CALLBACK`；`≠ covered`；`Not HA`；`release_evidence=false` | 失败→released DB 口径 **partial**；**≠** refund complete / ≠ UI-pay |
| 3 | NHP-017-BOUND-01 | `pnpm uc017:orphan:prove` | **0** | O1–O4 PASS；`BLOCKED_FOR_FULL_E2E`；`≠ covered`；`release_evidence=false` | sweeper 幂等 **partial**；**≠** LOAD |
| 4 | NHP-019-NEG-01 | `pnpm uc019:report-regenerate:prove` | **0** | G1–G4；`GAP-UC019-QUARANTINE-REGEN` / REGEN-IDEM-KEY；`≠ UC-E2E-019 covered`；`Not HA` | quarantine regen GAP **partial**；**≠** 019 covered |
| 5 | NHP-033-BOUND-01 | `pnpm uc033:cross-user-authz:prove` | **0** | X10 burst all 404；`GAP-UC033-SEVEN-CLASS`；`EXIT=0≠covered`；`release_evidence=false` | X10 burst **partial**/gap(PERF)；**≠** PERF/LOAD SLO · 七类未齐 |
| 6 | NHP-R4-NEG-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | `OK … R2 NOT closed; R4 NOT closed; releaseEvidence=false` | snapshot missing fail-closed **honesty**；**≠** R4 closed（**配对域主审**） |
| 7 | NHP-R4-FAULT-01 | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | `CALL_SITES≥1 … callSites=1`；`OK … FLIPPED: CALL_SITES=1≥1; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` | **FLIPPED CALL_SITES=1** seam honesty；**仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV**（**配对域主审**） |

**对照实现方自报**：7/7 与 REQUEST/harness 表一致（均为 0）。**仍不采信自报作为唯一依据**——本表以本审复跑为准。

**未跑（禁 · 已核对）**：`e2e:isolated` · `verify:e2e-performance` · 云 TC · HA prove · LOAD_* · PERF-CLOUD · Meridian。

---

## 3. REQUEST 七问（专家答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 实现方 EXIT 表是否与独立复跑一致？ | **是**（7/7 EXIT=0；见 §2） |
| 2 | 是否有任何 EXIT=0 被错误抬成 covered / PERF SLO / LOAD / HA / refund complete / 019 全家齐？ | **否**。slice/harness/eval/REQUEST/矩阵行与日志 GAP pins 均保持 partial/honesty/gap；未见升 `covered` |
| 3 | harness/slice/eval 是否仍钉 `releaseEvidence=false` 与假绿禁令？ | **是**（全文钉；isolated 收据亦 `release_evidence=false`；旗仍 awaiting_post_prove_dual） |
| 4 | 是否错误把 pre-exec/RECHECK dual pass + 本绿自动批准 Batch3「全家 covered」？ | **否**。本审批准范围**仅** honesty/partial/gap 复跑绿；**明确不批** covered |
| 5 | 是否错误跑了禁令 CMD？ | **否**（实现方声明未跑；本审亦未跑） |
| 6 | R4-NEG / R4-FAULT 两行是否应 defer 至配对 `mw-rag-route`？ | **是**。本域核对：CMD EXIT=0 且日志自钉 R4 NOT closed / FLIPPED≠wrong_track=0 / ≠ADV；**不代签** R4 overall |
| 7 | FLIPPED CALL_SITES≥1 是否仍钉 **≠ R4 closed ≠ wrong_track=0 ≠ ADV**？ | **是**（harness/slice/eval/矩阵§1.5 + cmd7 自钉一致） |

---

## 4. 对抗假阳升格（重点 · R4-FAULT / R4-NEG / 011 / 019 / 015 / 033）

| 风险面 | 本审裁定 | 正确读法 |
|--------|----------|----------|
| **R4-FAULT** `g4-…` EXIT=0 + FLIPPED CALL_SITES=1 | **禁升**（本域） | wire present / seam honesty only；日志自钉 **R4 NOT closed** · **≠ wrong_track=0**；主审 **defer** `mw-rag-route`；**≠** ADV covered |
| **R4-NEG** `g-r2-5` EXIT=0 | **禁升** | snapshot missing fail-closed only；**≠** R4 closed / ≠ 路由已生效 |
| **011** report-refund EXIT=0 | **禁升** | R4 GAP-REFUND-CALLBACK + §1b PREREQ；**≠** refund complete / UI-pay |
| **019** report-regenerate EXIT=0 | **禁升** | quarantine regen GAP + REGEN-IDEM-KEY；**≠** 019 covered |
| **015** ingest-failures EXIT=0 | **禁升** | F2/F3 BOUND only；R5-MARKED-RED；**≠** OCR FAULT / LOAD |
| **017** orphan EXIT=0 | **禁升** | sweeper 幂等 partial；**≠** LOAD |
| **033** cross-user EXIT=0 | **禁升** | X10 burst≠七类齐 / ≠ PERF·LOAD SLO |
| isolated pgvector EXIT=0 | **禁升** | 前 5 条均 `[R5-MARKED-RED]`；**≠** sole-stack / R5 退役 / HA |
| Batch1/2 `post_prove_dual_pass` | **禁升** | 仅前置对照；**≠** 本批 covered（case ID 不重叠） |
| 共享 CMD 曾服务旧批 | **禁升** | 例 `uc015`→B1 NEG、`uc017`→B2 FAULT、`g-r2-5`→B1 R2-FAULT；**≠** 本批 covered |
| pre-exec/RECHECK dual + 7×绿 | **禁升** | 仅证明「授权下 honesty/partial/gap 复跑绿」；**≠** Batch3 全家 covered / family green |
| Docker 已启使 isolated 可跑 | **禁升** | 环境注记 **≠** HA |
| 实现方自写 reviews pass | **无效** | 本文件为专家独立审稿；实现方 REQUEST **不是** pass |

---

## 5. 文档诚实钉抽核（本审）

| 检查 | 结果 |
|------|------|
| harness/slice/eval `releaseEvidence=false` · ≠HA · ≠ covered | **成立** |
| R4-FAULT 文档 = FLIPPED CALL_SITES≥1 · 仍 ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV | **成立**（无「生产路径无接线」残留主张） |
| 矩阵 7 行状态 | **partial** ×5 + R4-NEG **partial** + R4-FAULT **gap**/honesty；**零 covered 升级** |
| 旗 | slice/harness/eval = `executed:awaiting_post_prove_dual`（仍 ≠ covered） |
| Batch1 IDs vs Batch3 | 无 case ID 重叠（B1：001-NEG/PERF · 015-NEG · 050-NEG · 033-NEG · R2-NEG/FAULT） |
| Batch2 IDs vs Batch3 | 无 case ID 重叠（B2：002-BOUND · 010-FAULT · 011-NEG · 017-FAULT · 018-NEG · 019-FAULT · R4-BOUND） |
| HA / `releaseEvidence=true` 宣称 | **未见** |
| 软观察 N-soft | 矩阵文末 Batch3 登记行仍写 `not_run:pre_dual_review`（相对 harness/slice 的 `executed:awaiting_post_prove_dual` **滞后**）；**不**构成 covered 抬升，**不**挡本审 pass；建议实现方另刀对齐文末旗（非本审范围改文） |

---

## 6. 立场钉（继承 + post-prove 强化）

| ID | 级别 | 项 |
|----|------|-----|
| B0 | **立场钉** | 任意本批 EXIT=0：`≠ covered` · `≠ HA` · `releaseEvidence=false` · ≠ family green · ≠ LOAD/PERF SLO · ≠ R2/R4 关 · ≠ planner leaf · ≠ wrong_track=0 · ≠ ADV covered |
| B1 | **立场钉** | 本审 **pass** = 仅批准本批 honesty/partial/gap 复跑绿；**禁止**假阳升格 covered |
| B2 | **立场钉** | R4-NEG / R4-FAULT 主审权在 `mw-rag-route`；本域不代签 closed / wrong_track=0 / ADV |
| B3 | **立场钉** | **FLIPPED CALL_SITES≥1 ≠ R4 closed ≠ wrong_track=0 ≠ ADV covered** |
| B4 | **立场钉** | 本审单方 pass **≠** 双域 post-prove dual 齐；配对 post-prove 仍待独立落库 |
| B5 | **立场钉** | Batch1/2 post_prove **≠** 本批 covered |
| N1 | 软钉 | 前 5 CMD fixture=pgvector → 持续 R5 green-risk（即便 EXIT=0） |
| N2 | 软钉 | 矩阵文末 Batch3 旗滞后（见 §5）；非阻塞 |

---

## 7. 批准范围 / 不批 / 阻塞

| | |
|--|--|
| **批准范围** | 承认 Batch3（7 IDs）在 HEAD `639134f`、Key-unset、Docker OK 下 **独立复跑 7/7 EXIT=0**；与实现方 EXIT 表一致；诚实读法与 harness/eval/slice/矩阵假绿禁令一致；FLIPPED CALL_SITES=1 仍钉 ≠ R4 关；**仅** honesty/partial/gap 复跑绿 |
| **不批** | covered；HA；`releaseEvidence=true`；LOAD/PERF SLO；R2/R4 closed；planner leaf；wrong_track=0；ADV covered；refund complete；019 全家齐；family green；sole-stack；把本审 pass 读成已升 covered 或代替配对 rag-route post-prove；把 B1/B2 dual 读成本批 covered |
| **阻塞项** | **无阻塞**（本域 post-prove honesty 范围） |
| **下一步** | 等待 `mw-rag-route` 独立写 post-prove review；双域均 pass 且无更严冲突后，旗可迁 `post_prove_dual_pass`——**仍** `releaseEvidence=false` · **仍禁**抬 covered / R4 closed / HA |

---

## 8. 硬钉（回传用）

- **结论**：**pass**（仅本批 honesty/partial/gap 复跑绿 · Batch3 post-prove honesty only）  
- **CMD+EXIT**：见 §2（7/7 =0；独立复跑权威）  
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md`  
- **假阳风险**：EXIT=0≠covered；FLIPPED≠R4关≠wrong_track=0≠ADV；011≠refund complete；019≠covered；015≠OCR/LOAD；033≠SLO；isolated=R5 green-risk；本域≠代替配对；B1/B2≠本批 covered；pre-exec/RECHECK+本绿≠全家 covered  
- **本审独立复跑** · `releaseEvidence=false` · ≠HA · ≠ covered · 零 covered upgrade · 禁假阳升格  
- **Sign**：`mw-e2e-ha`

---

*Review · mw-e2e-ha · NHP Batch3 FAULT/BOUND post-prove · 2026-09-16 ~19:20 PT · pass（honesty/partial/gap 复跑绿 only） · releaseEvidence=false · ≠HA · ≠ covered · FLIPPED≠R4关*
