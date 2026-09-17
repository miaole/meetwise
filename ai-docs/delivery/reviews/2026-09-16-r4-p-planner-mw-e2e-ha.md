# 审查归档 — R4 **P-PLANNER**（acceptance gate · **不 coding / 不 prove**）· mw-e2e-ha

**日期**：2026-09-16（PT；本审只读 ~05:13 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**不采信**实现方自报；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-p-planner-mw-e2e-ha.md`  
**配对**：`REQUEST-2026-09-16-r4-p-planner-mw-rag-route.md`（**待审 / 不替代**本域）  
**前序边界**：`2026-09-16-r4-real-wire-mw-e2e-ha.md`（**pass** · inventory + **正确不接线**）· `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`（honesty + **仍不接线**）  
**结论**：**pass**（仅 **P-PLANNER 验收门文档闸诚实 + 本刀正确不 coding / 不 prove**；**pre-exec**）  
**批准范围**：**仅**同意 harness/eval/slice 够格当 true-planner 验收门；同意本刀零代码/零 prove；同意 **P-FAKEPLAN 禁令**；同意 **R4 仍 NOT closed**；同意 follow-on 须完整 plan 字段 + G-R2-5 + wrong_track=0 单独；**允许谈** planner 实现（设计对齐验收标准）  
**不批**：Worker coding / prove 绿关（须 **另** authorize REQUEST + 双域 + prove）· R4 关闭 · 题域已隔离 · wrong_track=0 · full P-WIRE · planner 已落地 · covered · HA · `releaseEvidence=true` · sole cutover · flip default · open DELETE · P-FAKEPLAN · 把本 pass / REAL-WIRE / FOLLOW 写成自动 coding 授权或 R4 关  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **本审未改仓库、未跑任何 prove** · **接线仍无** · **R4 仍开** · HEAD `639134f`

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | harness / eval / slice / 双 REQUEST 齐；状态 `REQUEST-ready` / `not_run:pre_dual_review` | **成立** |
| S2 | 「true planner」标准含：per-turn `InterviewPlannerOutput` → `validatePlannerOutput` → 完整 `RetrievalPlan`（**含 generationId/recipeId**） | **成立**（harness §1.1 T1–T3；可对 domain 类型核验） |
| S3 | **P-FAKEPLAN 禁令**显式（主叶硬塞 / 缺 generation·recipe = 假绿） | **成立**（§0 / T4 / §5 / REQUEST Q4；**未漏禁**） |
| S4 | **G-R2-5 保留**；planner 失败不打开 unscoped | **成立**（T6） |
| S5 | **wire ≠ R4 closed**；wrong_track=0 单独；本刀 ≠ 关 R4 | **成立**（T7 / 全文钉；**未偷关**） |
| S6 | gap 库存诚实：Worker 零 dispatch；无 per-turn planner→retrieve；无生产组装器 | **成立**（独立静态旁证，见 §3） |
| S7 | CMD 冻结 `not_run:pre_dual_review`；本刀 **未跑** prove；**未改** Worker | **成立**（eval §2 + 本审零 prove） |
| S8 | coding/prove **forbidden** until dual + **separate authorize**；本刀 dual pass **≠** 自动 coding | **成立**（harness §0 / §8 / REQUEST Q10） |
| S9 | NHP-R4 六列 **不升格 covered**；相对 REAL-WIRE/FOLLOW 无升格 | **成立**（matrix §1.5；见 §3） |
| S10 | sole allowlist **不**因本切片扩面；北星「已生效」≠ 笼统 prove 开跑 | **成立**（sole 恰 5；prove=`not_run`） |
| S11 | 与 REAL-WIRE / FOLLOW 边界清晰：仍正确不接线；P-PLANNER = 主挡验收门 | **成立**（见 §2.4） |

→ 上述为 **P-PLANNER 验收门文档闸** 成功标准；**不是** Worker 实现授权，**更不是** R4 关闭条件。  
→ **可核验性**：本刀成功标准均为文档存在性 + 禁令完整性 + 静态 gap 旁证 + 旗标不升格；将来实现刀须另对照 T1–T7 / 新 prove / 双域 post。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承：验收门文档 · 不 coding/prove · 非关 R4 · 非 planner 已落地 · await dual | **属实**；本审独立签核，**非**实现方自批 |
| harness 定义 true-planner + gap + 冻结 CMD + 假绿标红 | **属实且够格**当验收门（见 §2） |
| 实现方本刀 **未改** `apps/worker/src`；**未跑** P-PLANNER prove | **属实**（eval `not_run` + 本审未跑；静态仍零 dispatch） |
| REAL-WIRE dual pass = correctly NOT wiring；本刀 = 其主挡 PREREQ 文档闸 | **属实**（前序 e2e-ha REAL-WIRE pass；status §8 next=P-PLANNER） |
| FOLLOW honesty 仍不接线；≠ 本刀 coding 授权 | **属实** |
| 父轨 §6d / status §8 指针与本刀一致 | **属实** |
| mw-rag-route 配对 REQUEST | **待审**；**不替代**本域；本审独立 |

对照源：`harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · `r4-p-planner.slice.md` · `harness/r4-domain-isolation.md` §6c/§6d · `r4-domain-isolation-status.md` §7–§8 · `non-happy-path-perf-load-case-matrix.md` §1.5 · `packages/domain/src/{job-route-classifier,qbank-track-local-retrieval}.ts` · `packages/db/src/qbank-track-local-retrieval.ts` · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` · `scripts/run-e2e-isolated.mjs` SOLE set · 前序 REAL-WIRE / FOLLOW reviews · 配对 REQUEST（rag）

---

## 2. 对抗：漏禁 P-FAKEPLAN / 偷关 R4 / 成功标准 / 边界

### 2.1 是否漏禁 P-FAKEPLAN？

| 检查 | 裁定 |
|------|------|
| harness 是否显式禁止主叶硬塞 `RetrievalPlan`（无 planner / generationId / recipeId）？ | **是** — §0 表、T4、§1.2、§5 假绿表、§8 建议批准范围 |
| eval / slice / REQUEST 是否同钉？ | **是** — E4 / 硬钉 / Q4 |
| 完整字段（含 generationId/recipeId）是否进入验收标准？ | **是** — T3；与 `validateRetrievalPlan` 合同一致（domain 独立核） |
| 是否存在「stub id 冲 full wire」逃逸口？ | **否** — 标红为假绿；禁令并列 P-FAKEPLAN |

**本审**：**未漏禁** P-FAKEPLAN；禁令强度足够挡假接线叙事。

### 2.2 是否偷关 R4？

| 风险说法 | 裁定 |
|---------|------|
| 「P-PLANNER harness / REQUEST 齐 = R4 关 / 题域已隔离」 | **假绿 / 禁** — 全文 NOT closed；E1–E11 一律「关闭 R4？否」 |
| 「本刀 dual pass = planner 已落地 / P-PLANNER 已关」 | **假绿 / 禁** — 本刀 = 验收门文档 only |
| 「本刀 dual pass = 自动授权 Worker coding」 | **假绿 / 禁** — 须 **separate authorize**；本审批「可谈」≠ 批「可改 Worker」 |
| 「g4-dispatch-recheck-prereq 绿 / 建议 CMD 名 = planner 已齐」 | **假绿 / 禁** — 旁证缺席钉；CMD 冻结未跑 |
| 「REAL-WIRE / FOLLOW pass = 可接线 / 可 coding」 | **假绿 / 禁** — 批的是正确不接线 |
| 「planner/unit 绿将来 = wrong_track=0 / R4 关」 | **假绿 / 禁** — wire ≠ R4 closed；ADV 另证 |
| 「NHP Batch1 / 本刀 = NHP-R4 covered」 | **假绿 / 禁** — 六列零 covered |

**本审结论**：送审材料 **未**偷关 R4；对抗面在 **叙事外推**（把验收门 pass 读成实现落地 / coding 批准 / R4 关）。批准范围钉死即可控。

### 2.3 成功标准是否可核验？

| 层 | 可核验性 | 本审 |
|----|----------|------|
| **本刀（文档闸）** | 文件存在 · 状态钉 · 禁令/标准条文 · 静态 gap 旁证 · NHP/sole 旗 · prove=`not_run` | **可核验**（本审已独立勾） |
| **将来实现刀（非本刀）** | T1–T7 + validate* + 禁 P-FAKEPLAN + 保留 G-R2-5 + 另 prove + 双域 post；仍 ≠ R4 关 | **标准写清**；落地须另刀核验 |
| 模糊点？ | 「谈实现」vs「authorize coding」须语义分离 | **本审钉死**：pass → 可谈；coding/prove → 另 authorize |

### 2.4 与 REAL-WIRE / FOLLOW 边界

| 切片 | 批准了什么 | 未批准什么 |
|------|------------|------------|
| FOLLOW post-prove | honesty 复跑绿 + **仍不接线** | R4关 · full wire · coding 真接线 |
| REAL-WIRE | inventory 诚实 + **继续不接线** + await PREREQ | 开工接线 · REAL-WIRE prove 绿关 · R4关 |
| **本刀 P-PLANNER** | **验收门文档**诚实 + 本刀 **不 coding/prove** + **可谈**实现设计 | Worker coding/prove 绿关 · R4关 · planner 已落地 |

边界 **清晰**：三者叠加仍 = **正确不接线**；P-PLANNER 实现落地仍须 **新** authorize；接线绿仍 ≠ R4 关。

---

## 3. NHP-R4 / sole / 静态旁证（无 prove）

| 列 | Case | 旗 | covered？ |
|----|------|-----|-----------|
| NEG | NHP-R4-NEG-01 | **partial** | **否** |
| FAULT | NHP-R4-FAULT-01 | **gap**/blind | **否** |
| BOUND | NHP-R4-BOUND-01 | **partial**/honesty | **否** |
| ADV | NHP-R4-ADV-01 | **gap**/blocked | **否** |
| PERF | NHP-R4-PERF-01 | **blind** | **否** |
| LOAD | NHP-RAG-LOAD-01 | **blind** | **否** |

任一行 covered？ **否** — 相对 REAL-WIRE/FOLLOW **无升格**。

**sole allowlist（独立）**：恰 **5** — `wiring` / `ping` / `qdrant-backed` / `vectorstore-adapter` / `vectorstore-qdrant`；**无** g4 / r4 / planner / p-planner 入表。

**静态 gap（独立 · 无 prove）**：

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **零**调用（仅注释否定） |
| `InterviewPlannerOutput` → retrieve/dispatch | Worker src **零** |
| domain `InterviewPlannerOutput` / `validatePlannerOutput` | **存在**（合同锚；≠ 已生产消费） |
| domain `RetrievalPlan` + generationId/recipeId + `validateRetrievalPlan` | **存在** |
| db `dispatchTrackLocalRetrieval` | **合同 seam 在**；未生产消费 |
| 生产 planner prove 绿路径 | **无**可宣称路径（诚实） |

---

## 4. REQUEST 十问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / planner 已生产接线？ | **否**。全文自钉否定；本审未检出冒充 |
| 2 | harness 是否够格当 P-PLANNER 验收门（文档闸；非实现刀）？ | **是 · 够格**（标准+gap+冻结CMD+假绿标红齐） |
| 3 | 是否同意：本刀无 coding / 无 prove？ | **同意** |
| 4 | 是否同意：P-FAKEPLAN 禁令仍必须？ | **同意 · 必须**（未漏禁） |
| 5 | 是否同意：R4 仍 NOT closed；本刀 dual ≠ 关 R4？ | **同意** |
| 6 | 是否同意：follow-on wire 仍须完整 plan 字段 + G-R2-5 + wrong_track=0 单独，接线绿 ≠ R4 关？ | **同意** |
| 7 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。恰 5；未扩 |
| 8 | 硬闸「已生效」是否被误写成非happy / P-PLANNER prove 笼统开跑？（期望：否） | **否**。文档闸；prove=`not_run` |
| 9 | NHP-R4 / NHP Batch1 是否仍不得因本刀升 covered？ | **同意 · 不得升**；六列零 covered |
| 10 | 是否同意：本刀 dual pass 不自动授权 Worker coding（须 separate authorize）？ | **同意**；本审仅批 **可谈** 实现，**不批**改仓/prove |

---

## 5. 实现 / coding 裁定（本刀 · 核心）

| 选项 | 裁定 |
|------|------|
| harness 够格当 P-PLANNER 验收门 | **是（本刀 pass 范围）** |
| 本刀零 coding / 零 prove | **是（批准）** |
| **允许谈** planner 实现（对齐 T1–T7 / 禁 P-FAKEPLAN） | **是** |
| **允许开工 Worker coding / prove 绿关** | **否** — 须 **新** authorize REQUEST + 双域 + prove |
| 批 R4 / planner 已落地 / wrong_track=0 / full P-WIRE | **否** |
| 把 REAL-WIRE / FOLLOW / 本 pass 写成自动 coding 授权 | **否** |

### 将来有条件谈落地（**非本刀授权改仓** · 仅规则钉）

另开 authorize 后仍须：真 per-turn planner→完整 `RetrievalPlan`（含 generationId/recipeId）· 禁 P-FAKEPLAN · 保留 G-R2-5 · 单独 wrong_track=0（ADV）· **接线绿 ≠ R4 关** · 另刀 prove + 双域 post · 仍 ≠HA · `releaseEvidence=false`。  
**本审 pass ≠ 该 authorize 已批；≠ 实现已落地。**

---

## 6. 阻塞栏

| 阻塞项 | 现状 | 挡什么 |
|--------|------|--------|
| **P-PLANNER（实现）** | 验收门文档可过；Worker 路径仍缺 | **挡 coding 直至另 authorize**；挡宣称 planner 已齐 |
| **P-FAKEPLAN** | 禁令仍在 | **挡假接线** |
| **G-R4-1** | 无 full dispatch/recheck / per-turn leaf | 挡 full P-WIRE / R4关 |
| **G-R4-2 / P-WT0** | wrong_track=0 未证；ADV gap/blocked | 挡 R4关（接线≠ADV关） |
| **P-R2 / P-R1 / P-META** | 仍开（并列） | 挡 R4 关闸全集 |
| **NHP FAULT/PERF/LOAD** | gap/blind | 挡假 covered |
| **sole / HA / releaseEvidence** | allowlist 恰5；Not HA；false | 挡切流/发布叙事 |
| **配对 mw-rag-route** | 本刀 REQUEST 仍待审 | 挡「单域当双域」；**不替代** |

上述 **阻塞 Worker coding 宣称与 R4关**；**不**阻塞本「验收门文档闸」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（P-PLANNER **验收门文档闸诚实 + 本刀正确不 coding/prove**） |
| **是否允许谈 coding / planner 实现** | **是（仅谈）** |
| **是否允许开工 Worker coding / prove** | **否**（须另 authorize） |
| **批准** | harness 够格；零 code/prove；P-FAKEPLAN 禁令；R4 仍开；follow-on 规则；可谈实现设计 |
| **不批** | Worker 改仓 · prove 绿关 · R4/G4 关 · planner 已落地 · covered · HA · releaseEvidence=true |
| **假绿风险** | **中（叙事外推）** — 文档诚实；主风险：把「P-PLANNER pass / REAL-WIRE·FOLLOW 绿」误读成可 coding、planner 已齐或 R4关。批准范围钉死即可控 |
| **与 REAL-WIRE/FOLLOW** | 边界清晰；三者叠加仍 ≠ 接线批准 / ≠ R4关 |

### Nit（非阻塞）

- eval §4 勾选为实现方自认占位；本审以独立交叉为准，**不**把勾选当专家签核。
- 建议未来 CMD 名（`r4-p-planner-*:prove`）仅为示意；**未建 / 未跑 / 未宣称绿**。
- 配对 `mw-rag-route` 仍待审；本域独立 pass **不替代**双域齐。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA** · **≠ covered**
- [x] 本审 **只读** · **未改仓库** · **未跑 prove**
- [x] **R4 仍开** · **≠ 题域已隔离** · **≠ wrong_track=0**
- [x] **P-FAKEPLAN 禁令未漏** · 完整 plan 字段（含 generationId/recipeId）入标准
- [x] **接线状态：dispatch 仍无 · recheck 仍无 · planner 仍无** · P-WIRE=partial only
- [x] REAL-WIRE / FOLLOW 绿 **不**冒充可接线 / 可 coding
- [x] 本 pass **批可谈**实现 · **不批** Worker coding/prove
- [x] 北星「已生效」**≠** 笼统 prove / ≠ R4关
- [x] NHP-R4 六列 **零 covered** · 无升格
- [x] sole allowlist **未**扩
- [x] 批准范围仅 **验收门文档闸**；**不批** R4关

---

## 9. 结论与回传摘要

- **裁定：pass**（R4 P-PLANNER · 验收门文档闸诚实 + **本刀正确不 coding/prove**）
- **是否允许谈 coding：是（仅谈实现设计）**；**是否允许开工改仓/prove：否**（须另 authorize + 双域 + prove；仍 ≠R4关）
- **阻塞栏**：P-PLANNER 实现仍缺 · P-FAKEPLAN · G-R4-1 · G-R4-2/wrong_track=0 · P-R2/P-R1/P-META · NHP gap/blind · 配对 rag 待审（不替代）
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-r4-p-planner-mw-e2e-ha.md`（覆盖 `REQUEST-2026-09-16-r4-p-planner-mw-e2e-ha.md`）
- **假绿风险**：中（叙事外推：验收门/REAL-WIRE/FOLLOW pass → 误读为可 coding、planner 已齐或 R4关）；批准范围钉死则可控
- **硬钉**：`releaseEvidence=false` · ≠HA · ≠covered · R4仍开 · 接线仍无 · HEAD `639134f`

对照：`REQUEST-2026-09-16-r4-p-planner-mw-e2e-ha.md` · `harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · `r4-p-planner.slice.md` · `harness/r4-domain-isolation.md` §6c/§6d · status §8 · matrix §1.5 · 前序 REAL-WIRE/FOLLOW · 配对 REQUEST（rag）

---

*mw-e2e-ha · R4 P-PLANNER pre-exec · 2026-09-16 ~05:13 PT · releaseEvidence=false · ≠HA · 批可谈 · 不批改仓/prove · ≠R4关*
