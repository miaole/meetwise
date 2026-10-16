# 审查归档 — NHP Batch2 NEG/FAULT/BOUND（执行前切片）· mw-e2e-ha

**日期**：2026-09-16（~05:23 PT）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；**不采信**实现方自批；本审**未跑**任何 prove / e2e / load）  
**送审**：`reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`  
**配对**：`REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md`（**仅 REQUEST · 配对结论尚未落库**；冲突取更严；**不采信代替**）  
**结论**：**pass**（**执行前文档闸 / 第二批执行前基线**；见 §0）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/PERF SLO** · **≠ R2/R4 closed** · **≠ planner leaf** · **本审未跑 prove**  
**开跑**：**否** — 双审通过前禁 prove；本域 pass **≠** 双域齐；即便双域齐，开跑仍须 meetwise-core（或等价）**另发执行授权** + 逐 CMD **新** EXIT 回执；历史 / FOLLOW / Batch1 收据**不得**冒充本批绿关

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（执行前基线可接受；假绿禁令与 EXIT 读法诚实；零 prove） |
| Batch2 范围（7 IDs · NEG/FAULT/BOUND + R4-BOUND honesty）是否可接受 | **是**（高价值 partial；可无云 Key 谈；LOAD/HA/云/UI-pay/wrong_track ADV deferred） |
| 与 Batch1 7 IDs 是否无重叠 | **是**（Batch1 = 001-NEG / 001-PERF-api / 015-NEG / 050-NEG / 033-NEG / R2-NEG / R2-FAULT） |
| 是否允许**谈**本批 prove | **条件谈** — 本域同意纳入议程；**须配对 `mw-rag-route` 独立 pass 且无更严冲突**后才可「双域谈」；配对结论**尚未**落库 → **现时不得以双域齐为由开议程** |
| 是否允许**开跑**本批 prove | **否（硬）** — 双审前零 prove；双审后仍须 meetwise-core 另授权 + CMD+EXIT；本审 pass ≠ 授权 |
| EXIT=0 是否 = covered / R2·R4 关 / SLO / LOAD / HA | **否** — 处处钉 partial / honesty ≠ covered；`releaseEvidence=false` |
| 是否批 covered / HA / `releaseEvidence=true` / LOAD·PERF SLO / R4 closed / planner leaf | **否** |
| 本审是否执行 prove | **否（禁止）** |
| model-op 是否须并列 | **否**（本批无 MODEL-OP live 子集；不强制加） |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md` |
| REQUEST（配对） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md` |
| Slice | `ai-docs/delivery/nhp-batch2-neg-fault.slice.md` |
| Harness | `ai-docs/delivery/harness/nhp-batch2-neg-fault.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch2-neg-fault.eval.md` |
| 用例全表 SSOT | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` §1.1/§1.2/§1.5 · §3.1 Batch2 指针 |
| 父 harness | `ai-docs/delivery/harness/non-happy-path-perf-load-matrix.md` |
| 覆盖矩阵抽核 | `e2e-requirement-coverage-matrix.md` UC-002/010/011/017/018/019 · GAP-RAG-04 |
| Batch1 对照 | `nhp-batch1-neg-perf.slice.md` = **`post_prove_dual_pass`**（≠ 本批授权） |
| 前序矩阵闸 | `reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域文档闸 **pass**；仍禁笼统 prove） |
| CMD 静态核 | 根 `package.json`：7× 脚本名均存在（本审只读核对；**未跑**） |
| 仓库根 | `/workspace/meetwise` → `/workspace/projects/meetwise` · HEAD `639134f` |

**执行旗核验**：slice / harness / eval / REQUEST / 矩阵 §3.1 均为 `REQUEST-ready` / `not_run:pre_dual_review` / 「零 prove」；未见本刀把行升 `covered`。本审**未**执行任何 Batch2 CMD，亦未读 `.env*`。

---

## 2. 逐 case 核验

| Case ID | 矩阵旗 | CMD（冻结） | 定义完备？ | 与旗一致？ | EXIT=0 读法钉死？ | 本审裁定 | 缺口 / 假阳面 |
|---------|--------|-------------|------------|------------|-------------------|----------|---------------|
| **NHP-002-BOUND-01** | partial | `pnpm uc002:lease:prove` | **是**（lease 竞态双 holder → 单胜出+可解释拒） | **是** | **是**（≠ 002 covered / ≠ 跨设备全家 / ≠ HTTP lease mouth） | **可纳入** | 覆盖矩阵仍缺 HTTP lease mouth + full.e2e 双设备；`uc010` 旁证 ≠ 002；isolated→pgvector **R5 green-risk** |
| **NHP-010-FAULT-01** | partial | `pnpm uc010:sse-resume:prove` | **是**（断 SSE→LED / R-mid；无双扣） | **是** | **是**（≠ 流式 SLO / ≠ 002-FAULT 跨副本） | **可纳入** | 缺 full.e2e mid-interview / A3 kill / UI / 跨副本；历史 09-10 EXIT=0 **≠** 本批新绿关；R5 green-risk |
| **NHP-011-NEG-01** | partial | `pnpm uc011:report-refund:http:prove` | **是**（quarantine 后误退 → confirmed 不退） | **是** | **是**（≠ refund complete / ≠ UI-pay / ≠ refund-callback 齐） | **可纳入** | 矩阵锚点曾写「uc011 http/prove」泛称；harness 已钉精确脚本（package.json 已核）；refund-callback / wallet / balance-ui 仍 GAP |
| **NHP-017-FAULT-01** | partial | `pnpm uc017:orphan:prove` | **是**（begin-fail 孤儿 reserved→sweeper→released） | **是** | **是**（≠ LOAD_worker / ≠ 容量） | **可纳入** | HTTP/SSE 注入未进 `e2e:isolated`；017-LOAD 仍 deferred；禁 orphan EXIT=0 = 产能绿 |
| **NHP-018-NEG-01** | partial | `pnpm uc018:abandon:http:prove` | **是**（abandon 后复活拒；∉进行中） | **是** | **是**（≠ 018 covered / ≠ TTL/UI/full.e2e） | **可纳入** | 矩阵锚点「uc018 http」泛称 → harness 精确 `abandon:http`；历史收据 ≠ 本批；R5 green-risk |
| **NHP-019-FAULT-01** | partial | `pnpm uc019:report-regenerate:http:prove` | **是**（retry∥release 无 released∧regen 非法组合） | **是** | **是**（≠ 019 covered / ≠ LOAD / ≠ regenerateAttempt 齐） | **可纳入** | 矩阵锚点「uc019 prove」泛称 → harness 精确 http 脚本；regenerateAttempt / quarantine regen 出口 / demand-path 仍 GAP |
| **NHP-R4-BOUND-01** | partial/honesty | `pnpm g4-production-scoped-retrieve:prove` | **是**（有 snapshot 仅主叶 scoped；非 planner leaf） | **是** | **是**（≠ R4 closed / ≠ planner leaf / ≠ full dispatch / ≠ wrong_track=0） | **可纳入**（**配对域主审**） | 矩阵锚点写「qbank-retrieve-scope；FOLLOW §6b」（源/节指针）≠ 精确 CMD；harness 钉 `g4-production-scoped-retrieve` **正确**。FOLLOW 已有历史 EXIT=0（~04:47 PT）**不得**自动当 Batch2 绿关；R4 ADV/NEG/FAULT/PERF / R5 / RAG-LOAD **deferred** |

**合计**：7/7 可纳入第二批执行前基线；**零**行批准升 `covered`；**零**行批准 R4/planner 关。

**CMD 静态核验（只读）**：`uc002:lease:prove` · `uc010:sse-resume:prove` · `uc011:report-refund:http:prove` · `uc017:orphan:prove` · `uc018:abandon:http:prove` · `uc019:report-regenerate:http:prove` · `g4-production-scoped-retrieve:prove` 均在根 `package.json` 存在。前 6 条经 `run-e2e-isolated` → 默认 pgvector **green-risk / R5**（即便将来 EXIT=0）。

---

## 3. REQUEST 六问（专家复核）

| # | 问 | 答 |
|---|----|-----|
| 1 | Batch2 是否足够小且高价值（NEG/FAULT/BOUND + 一条 R4 BOUND honesty），且可无云 Key 谈执行？ | **是**。7 IDs；无云 Key / 无 MODEL_API_KEY 要求；LOAD/HA/云 deferred |
| 2 | 是否与 Batch1 7 IDs 无重叠？ | **是** |
| 3 | EXIT=0 读法是否处处钉 ≠ covered / partial / honesty？ | **是**（harness §1/§3/§4 + eval + REQUEST + slice 一致） |
| 4 | 是否错误把矩阵文档闸 pass / Batch1 post_prove_dual_pass / 硬闸生效读成「已授权开跑本批 prove」？ | **否（文档未误读）**；本审亦钉：上述均 ≠ 本批 prove 授权 |
| 5 | 实现方是否越权跑 prove / 回写 covered？ | **未见本刀越权**（`not_run:pre_dual_review`；无 covered 回写迹象；本审零 prove） |
| 6 | LOAD/HA/云/UI-pay/wrong_track ADV 是否被偷渡进本批绿叙事？ | **否**（明确 deferred；假绿表钉死） |

---

## 4. 专家五答（请专家回答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 本 Batch2 范围与 CMD 冻结是否可接受为第二批执行前基线？ | **可接受** |
| 2 | 是否同意：在双审通过前不得开始本批 prove？ | **同意（硬）** |
| 3 | 双审通过后，开跑是否仍须 meetwise-core（或等价）另发执行授权 + CMD+EXIT 回执？ | **是（硬）**；旧收据 / FOLLOW G4 / Batch1 dual-pass **均不可**代替 |
| 4 | 阻塞项（若有）是什么？ | **无硬阻塞**（本域文档闸）。**软钉 N1–N3** 见 §5；**配对 rag-route 结论未落** → 现时不得宣称双域齐 / 不得开跑 |
| 5 | 是否需要扩/缩 case ID 列表？ | **否** — 保持 7；不扩 LOAD/HA/ADV/PERF-CLOUD；不缩 R4-BOUND（须配对域主审） |

---

## 5. 软钉 / 假阳风险（非硬 block）

| ID | 项 | 读法 |
|----|-----|------|
| **N1** | 矩阵「既有锚点」对 011/018/019/R4 为泛称或源指针 | Batch2 harness **已**钉精确 `pnpm` 脚本；**不**阻塞本批。建议后续矩阵锚点与 harness CMD 字面对齐（非本刀必改） |
| **N2** | 历史 EXIT=0（覆盖矩阵 09-10；FOLLOW `g4-production-scoped-retrieve` ~04:47 PT；父 harness 既有 0） | **≠** Batch2 executed；授权后须**新** CMD+EXIT；禁拿旧绿关当本批 pass |
| **N3** | Batch1 `post_prove_dual_pass` / 矩阵文档闸 pass / 硬闸文档闸生效 / 本审 pass | **均 ≠** 本批 prove 已授权；双审前零 prove；双审后仍须另授权 |
| **假阳** | 7× 将来 EXIT=0 = 非快乐路径全家 covered / family green | **假阳** — 仅 Batch2 honesty/partial executed |
| **假阳** | `g4-…` EXIT=0 = R4 closed / planner leaf 关 / wrong_track=0 | **假阳** — 主叶 scoped only |
| **假阳** | `uc011`/`uc018`/`uc019` http EXIT=0 = refund/abandon/regen 全家齐 | **假阳** — partial NEG/FAULT |
| **假阳** | `uc002`/`uc010`/`uc017` EXIT=0 = 002 covered / SSE SLO / LOAD | **假阳** |
| **假阳** | isolated pgvector EXIT=0 = sole-stack / R5 退役 | **假阳** — green-risk / R5 |
| **假阳** | 本域单方 pass = 可开跑 / 可代替 rag-route | **假阳** — 须双域；不采信代替 |

---

## 6. 批准范围 / 不批

| | |
|--|--|
| **批准范围** | 承认 Batch2（7 IDs）harness/eval/REQUEST/slice 为 **第二批执行前文档基线**；CMD 冻结与 EXIT 诚实读法可接受；与 Batch1 无重叠；未偷渡 LOAD/HA/云/ADV runnable |
| **不批** | 本刀 prove 绿关；单方/现时开跑；covered；HA；`releaseEvidence=true`；LOAD/PERF SLO；R2/R4 closed；planner leaf 关；路由已生效；family green；把历史/FOLLOW/Batch1 收据当本批绿关 |
| **下一步** | 等待 `mw-rag-route` 独立写 `reviews/2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md`；双域均 pass 且无更严冲突后，**仅允许谈**；开跑须 meetwise-core 另授权 + 注释块 CMD 解冻执行 + 新 EXIT 回执 |

---

## 7. 硬钉（回传用）

- **结论**：**pass**（执行前文档闸 / 第二批基线）  
- **是否允许开跑**：**否**（双审前禁；双审后仍须另授权 + CMD+EXIT）  
- **是否允许谈 prove**：**条件谈**（本域 OK；配对 rag-route 结论未落 → 现时不可宣称双域齐）  
- **逐 case 缺口**：见 §2 末列（002 lease mouth/跨设备；010 跨副本/SLO；011 refund-callback；017≠LOAD；018 full.e2e/TTL；019 regenerateAttempt；R4≠closed/planner）  
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`  
- **假阳风险**：EXIT=0≠covered；历史绿≠本批；G4 scoped≠R4 关；Batch1/矩阵闸≠本批授权；isolated=R5 green-risk；本域≠代替配对  
- **本审零 prove** · `releaseEvidence=false` · ≠HA · ≠ covered

---

*Review · mw-e2e-ha · NHP Batch2 NEG/FAULT/BOUND · 2026-09-16 ~05:23 PT · pass（pre-exec） · 禁开跑 · releaseEvidence=false · ≠HA · ≠ covered · 零 prove*
