# 审查归档 — R4 / G4 **REAL-WIRE**（真接线 inventory · **不接线**）· mw-e2e-ha

**日期**：2026-09-16（PT；本审只读 ~04:54 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**不采信**实现方自报；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md`  
**配对**：`REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md` · 前序域审 `2026-09-16-r4-real-wire-mw-rag-route.md`（**不替代**本域）  
**前序边界**：`2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`（**pass** · 仅 honesty 复跑绿 + **仍不接线**）  
**结论**：**pass**（仅 **§6c inventory 诚实 + 本刀正确不接线 / await PREREQ**；**pre-exec**）  
**批准范围**：**仅**登记「最小诚实 wire 库存 W1–W6 + 假绿/阻塞表 + NHP-R4 六列不升格 + **同意本刀不 coding / 不 prove 绿关**」  
**不批**：**开工接线 / coding** · REAL-WIRE prove 绿关 · **R4 关闭** · G4 关闭 · 题域已隔离 · wrong_track=0 · full P-WIRE · 生产 dispatch·recheck 已接线 · covered · HA · `releaseEvidence=true` · sole cutover · flip default · open DELETE · 把 FOLLOW honesty dual-pass 写成可接线批准 · 把北星「已生效」写成非happy / REAL-WIRE prove 笼统开跑 · P-FAKEPLAN  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **本审未改仓库、未跑任何 prove** · **P-WIRE=partial only** · **接线仍无** · **R4 仍开** · HEAD `639134f`

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | harness §6c / status §7 / eval §7 = inventory + **await dual · 不接线** | **成立** |
| S2 | intended wire W1–W6 写清且标 **未实施**；≠ 宣称已接线 | **成立**（§6c.1） |
| S3 | 假绿风险含 P-FAKEPLAN / FOLLOW≠可接线 / 调用点≠R4关 | **成立**（§6c.2） |
| S4 | 产品阻塞表：P-PLANNER（主）· P-FAKEPLAN · P-R2 · P-R1 · P-META · P-WT0 | **成立**（§6c.3） |
| S5 | NHP-R4 六列相对 FOLLOW **无升格**；**零 covered** | **成立**（见 §3） |
| S6 | FOLLOW post-prove dual-pass **不得**自动批准本刀 coding / R4 关 | **成立**（显式钉；本审同意） |
| S7 | REAL-WIRE prove = `not_run:pre_dual_review`；Worker **仍零** dispatch | **成立**（静态旁证） |
| S8 | sole allowlist **不**因本切片扩面 | **成立**（恰 5） |
| S9 | 北星「已生效」≠ 非happy / REAL-WIRE prove 笼统开跑 | **成立** |
| S10 | 通过前禁 code / prove；实现方未自批 pass | **成立**；**本审亦未跑 prove、未改码** |

→ 上述为 **REAL-WIRE inventory 文档闸 + 正确不接线** 成功标准；**不是** 接线实现授权，**更不是** R4 关闭条件。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承：inventory · 不接线 · 非关 R4 · 非 covered·HA · await dual before code/prove | **属实**；本审独立签核，**非**实现方自批 |
| 实现方本刀 **未改** `apps/worker/src`；**未跑** REAL-WIRE prove | **属实**（eval §7.3 `not_run:pre_dual_review` + 静态零调用） |
| FOLLOW post-prove dual-pass ≠ 本刀 coding / R4 关授权 | **属实**（前序批准范围仅 honesty+仍不接线；status §7 / harness §6c / REQUEST Q2 同钉） |
| P-WIRE = partial only；dispatch/recheck/planner 仍无 | **属实**（status P4/P9 + 静态 `rg`） |
| harness/status/eval/matrix/m4/GAP-RAG-04 同钉 NOT closed | **属实**（抽样交叉） |
| mw-rag-route 前序 REAL-WIRE pass（inventory + 不接线） | **不替代**本域；本审独立；结论方向一致 |

对照源：`harness/r4-domain-isolation.md` §6c · `r4-domain-isolation-status.md` §7 · `eval/r4-domain-isolation.eval.md` §7 · `non-happy-path-perf-load-case-matrix.md` §1.5 · `e2e-requirement-coverage-matrix.md` GAP-RAG-04 · `north-star-hard-gates.md` 文首 · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` · `scripts/run-e2e-isolated.mjs` SOLE set · 前序 `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md` · 配对 `2026-09-16-r4-real-wire-mw-rag-route.md`

---

## 2. 对抗：范围 / fail-closed / 偷关 R4 / 与 FOLLOW 边界

### 2.1 范围是否过宽？

| 检查 | 裁定 |
|------|------|
| 本刀是否把「真接线评估」偷写成「已授权 coding」？ | **否** — REQUEST/harness/status/eval 均钉 **不接线**；建议批准范围仅 inventory + await PREREQ |
| W1–W6 是否冒充已落地？ | **否** — 每步「现状」钉未实施 / Worker 零调用 / 无生产组装器 |
| 是否借 REAL-WIRE 名扩 sole / flip / DELETE / HA？ | **否** — 显式禁；sole 恰 5、未扩 |
| inventory 是否过宽到「关 R4 全集」？ | **否** — 明确 G-R4-1/G-R4-2/P-WT0 仍挡关闸；接线≠ADV关≠R4关 |

**本审**：范围 **未过宽**；送审立场是 **停刀不接线**，不是冲绿接线计划。

### 2.2 是否缺 fail-closed？

| 检查 | 裁定 |
|------|------|
| 缺 snapshot | 现网 **G-R2-5** 已 closed；intended W5 钉真接线后仍须 fail-closed（禁回 unscoped） |
| `recheck_failed` | 合同意图钉不回退兄弟叶 / unscoped；生产现 **无** recheck（FAULT 仍 gap）— inventory **诚实**，未假宣称已有 |
| P-FAKEPLAN | **显式禁止**主叶硬塞 `RetrievalPlan`；本刀对策=不接线 |
| 无 planner 时是否偷偷接 dispatch？ | **否** — P-PLANNER 主挡；实现方裁定停 REQUEST |

**本审**：fail-closed 叙事 **齐**；缺的是生产 recheck 观测（正确标 gap，非假绿）。

### 2.3 是否偷关 R4 / 假 covered？

| 风险说法 | 裁定 |
|---------|------|
| 「REAL-WIRE REQUEST / inventory 齐 = R4 关 / 题域已隔离」 | **假绿 / 禁** — 全文 NOT closed；本审 **不批** |
| 「FOLLOW post-prove dual-pass = 可真接线 / 可 coding」 | **假绿 / 禁** — FOLLOW 仅 honesty+仍不接线；须本刀新批且本刀 **批的是不接线** |
| 「W1–W6 写了 = full P-WIRE / dispatch 已齐」 | **假绿** — intended ≠ implemented；Worker 零调用 |
| 「rag04 / g4-dispatch-recheck-prereq 历史绿 = REAL-WIRE 齐」 | **假绿** — prove-shell / **未接线** 钉 |
| 「partial P-WIRE + inventory = wrong_track=0 / covered」 | **假绿** — ADV 仍 gap/blocked；六列零 covered |
| 「北星已生效 = REAL-WIRE prove 笼统开跑」 | **假绿** — 文档闸；本刀 prove=`not_run` |
| 「本 pass = 允许开工接线」 | **禁** — 见 §5：本 pass **明确不批 coding** |

**本审结论**：送审材料 **未**偷关 R4 / 未假 covered；对抗面在 **叙事外推**（把 inventory pass 读成接线批准）。批准范围钉死即可控。

### 2.4 与前序 honesty 切片边界

| 切片 | 批准了什么 | 未批准什么 |
|------|------------|------------|
| FOLLOW post-prove | honesty 六 CMD 复跑绿 + **仍不接线** | R4关 · full wire · coding 真接线 |
| **本刀 REAL-WIRE** | inventory 诚实 + **继续不接线** + await PREREQ | **开工接线** · REAL-WIRE prove 绿关 · R4关 |

边界 **清晰**：FOLLOW 绿 **不得**冒充本刀接线批准；本刀 pass **亦不得**冒充接线实现授权。

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

任一行 covered？ **否** — 相对 FOLLOW **无升格**。

**sole allowlist（独立）**：恰 **5** — `wiring` / `ping` / `qdrant-backed` / `vectorstore-adapter` / `vectorstore-qdrant`；**无** g4 / r4 / dispatch / real-wire 入表。

**静态接线（独立 · 无 prove）**：

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **零**调用（仅注释否定） |
| `InterviewPlannerOutput` → retrieve/dispatch | Worker src **零** |
| P-WIRE | **partial only**（主叶 scope + G-R2-5；**无** full dispatch/recheck） |
| G-R4-1 | **仍 gap**（full wire / per-turn leaf） |
| G-R4-2 / wrong_track=0 | **未证**（ADV gap/blocked） |

---

## 4. REQUEST 六问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / 生产 dispatch 已接线？ | **否**。REQUEST/harness/status/eval/matrix 均自钉否定；本审未检出冒充 |
| 2 | FOLLOW post-prove dual-pass 是否 **不得**自动批准本刀 coding 或 R4 关闭？ | **同意 · 不得**。FOLLOW≠本刀；本刀亦 **不批 coding / 不批 R4关** |
| 3 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。恰 5；未扩 |
| 4 | 硬闸「已生效」是否被误写成「非happy prove / REAL-WIRE prove 已授权笼统开跑」？（期望：否） | **否**。文首/REQUEST 钉文档闸；本刀 prove=`not_run` |
| 5 | NHP-R4 六列是否仍均为 case-only/partial/gap/blind，**零 covered**？ | **是**（见 §3） |
| 6 | 是否同意实现方裁定：产品风险高 → 停在 REQUEST / await dual / **不接线**，而非假接线冲绿？ | **同意**。P-PLANNER 主挡 + P-FAKEPLAN 禁令未解前，接线会逼假绿 |

---

## 5. 接线裁定（本刀 · 核心）

| 选项 | 裁定 |
|------|------|
| inventory + 假绿/阻塞/NHP 诚实登记 | **批准（本刀 pass 范围）** |
| **继续不接线**（不改 Worker 生产路径） | **是（本刀批准）** |
| **允许开工接线 / coding** | **否** |
| 有条件现在接线 | **否** — P-PLANNER 未落地前禁止；将来须 **新** REQUEST + 双审（见配对域规则；本域同钉） |
| 批 R4 / full P-WIRE / wrong_track=0 关闸 | **否** |
| 跑 REAL-WIRE prove 作本刀绿关 | **否**（`not_run:pre_dual_review`；通过前禁 prove） |

### 将来有条件接线（**非本刀授权** · 仅规则钉）

仅当 P-PLANNER 等阻塞解除后，可开 **新** REQUEST 谈 coding；仍须：真 per-turn planner→完整 `RetrievalPlan`（含 generationId/recipeId）· 禁 P-FAKEPLAN · 保留 G-R2-5 · 单独 wrong_track=0（ADV）· **接线绿 ≠ R4 关** · 另刀 prove + 双域 post · 仍 ≠HA · `releaseEvidence=false`。  
**本审 pass ≠ 该新刀已批。**

---

## 6. 阻塞栏（关 R4 / 宣称接线齐 / 本刀开工接线）

| 阻塞项 | 现状 | 挡什么 |
|--------|------|--------|
| **P-PLANNER** | Worker 无 per-turn `InterviewPlannerOutput`→retrieve | **挡本刀 coding**（主） |
| **P-FAKEPLAN** | 主叶硬塞 plan = 假绿 | **挡假接线** |
| **G-R4-1** | 无 full dispatch/recheck / per-turn leaf | 挡 full P-WIRE / R4关 |
| **G-R4-2 / P-WT0** | wrong_track=0 未证；ADV gap/blocked | 挡 R4关（接线≠ADV关） |
| **P-R2 overall** | wire 齐；overall NOT closed / ≠ 路由已生效 | 挡关闸并列 |
| **P-R1 / P-META** | 仍开 | 挡 R4 关闸 PREREQ |
| **NHP FAULT/PERF/LOAD** | gap/blind | 挡假 covered / 假发布 SLO |
| **sole / HA / releaseEvidence** | allowlist 恰5；Not HA；false | 挡切流/发布叙事 |

上述 **阻塞本刀开工接线与宣称 R4关**；**不**阻塞本「inventory + 正确不接线」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（REAL-WIRE **inventory 诚实 + 本刀正确不接线**） |
| **是否允许开工接线** | **否** |
| **批准** | 仅登记：§6c 库存 + 阻塞/假绿表 + NHP 不升格 + 同意停刀不接线 |
| **不批** | coding · REAL-WIRE prove 绿关 · R4/G4 关 · 题域已隔离 · wrong_track=0 · full wire · covered · HA · releaseEvidence=true |
| **假绿风险** | **中（叙事外推）** — 文档诚实；主要风险：把「REAL-WIRE pass / FOLLOW 绿」误读成可接线或 R4关。严格限制批准范围即可控 |
| **与 FOLLOW** | 前序 honesty pass 仍有效且边界清晰；**二者叠加仍 ≠** 接线批准 / ≠ R4关 |

### Nit（非阻塞）

- 配对 `mw-rag-route` 已 pass（inventory + 不接线）；本域独立确认，结论一致，**不互相替代**。
- eval §7.1 勾选为实现方自认；本审以独立交叉为准，**不**把勾选当专家签核。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA** · **≠ covered**
- [x] 本审 **只读** · **未改仓库** · **未跑 prove**
- [x] **R4 仍开** · **≠ 题域已隔离** · **≠ wrong_track=0**
- [x] **接线状态：dispatch 仍无 · recheck 仍无 · planner 仍无** · P-WIRE=partial only
- [x] FOLLOW honesty 绿 **不**冒充可接线批准
- [x] 本 pass **不**批开工接线 / coding
- [x] 北星「已生效」**≠** 笼统 prove / ≠ R4关
- [x] NHP-R4 六列 **零 covered** · 相对 FOLLOW 无升格
- [x] sole allowlist **未**扩
- [x] 批准范围仅 **inventory + 正确不接线**；**不批** R4关

---

## 9. 结论与回传摘要

- **裁定：pass**（R4-REAL-WIRE · inventory 诚实 + **本刀正确不接线**）
- **是否允许开工接线：否**
- **阻塞栏**：P-PLANNER（主）· P-FAKEPLAN · G-R4-1 · G-R4-2/wrong_track=0 · P-R2/P-R1/P-META · NHP gap/blind
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-mw-e2e-ha.md`（覆盖 `REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md`）
- **假绿风险**：中（叙事外推：inventory/FOLLOW pass → 误读为接线批准或 R4关）；批准范围钉死则可控
- **硬钉**：`releaseEvidence=false` · ≠HA · ≠covered · R4仍开 · 接线仍无 · HEAD `639134f`

对照：`REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md` · `harness/r4-domain-isolation.md` §6c · `r4-domain-isolation-status.md` §7 · `eval/r4-domain-isolation.eval.md` §7 · case-matrix §1.5 · `north-star-hard-gates.md` · 前序 FOLLOW post-prove · 配对 `2026-09-16-r4-real-wire-mw-rag-route.md`

---

*mw-e2e-ha · R4-REAL-WIRE pre-exec · 2026-09-16 ~04:54 PT · releaseEvidence=false · ≠HA · 不批开工接线*
