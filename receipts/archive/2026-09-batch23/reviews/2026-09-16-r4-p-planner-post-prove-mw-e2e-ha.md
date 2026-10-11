# 审查归档 — R4 **P-PLANNER** **post-prove** · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~08:06 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-r4-p-planner-mw-e2e-ha.md`（**pass** · 验收门文档闸；**可谈**实现；**不批** coding/prove 绿关 / R4关）  
**配对**：`REQUEST-2026-09-16-r4-p-planner-post-prove-mw-rag-route.md`（**待审 / 不替代**本域）  
**结论**：**pass**（仅 **unit/acceptance 绿 + 仍不接线**）  
**批准范围**：**仅**「`pnpm r4-p-planner-unit:prove` 专家复跑 EXIT=0 + 旁证 `g4-dispatch-recheck-prereq:prove` EXIT=0 + 静态 dispatch 仍零 + retrieve 仍主叶 + P-FAKEPLAN 禁令仍在」——**不批 R4 关** / 题域已隔离 / wrong_track=0 / full P-WIRE / dispatch 已齐 / planner 生产已齐 / retrieve 已消费 per-turn / covered / HA / `releaseEvidence=true` / sole cutover / flip default / open DELETE / 把 unit 绿写成 R4关  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **unit绿 ≠ R4关** · **dispatch 仍零** · **retrieve 仍主叶 + G-R2-5** · **P-FAKEPLAN 禁** · HEAD `639134f`（实现在工作树；本审未改仓）

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | 独立复跑 `pnpm r4-p-planner-unit:prove`，附 CMD+EXIT | **成立**（见 §2；本审 ~08:06 PT · EXIT=0） |
| S2 | 旁证 `pnpm g4-dispatch-recheck-prereq:prove` 若要求则复跑 | **成立**（REQUEST 旁证；本审 EXIT=0） |
| S3 | unit 绿 **≠HA** / **≠ cutover** / **≠ flip default** / **≠ open DELETE** | **同意** |
| S4 | **R4 仍 NOT closed**；dispatch **仍未接线**；retrieve **仍**主叶 | **成立**（见 §3） |
| S5 | status/eval **未**错误抬升 covered / HA / `releaseEvidence=true` | **成立**（见 §4） |
| S6 | follow-on REAL-WIRE 仍须另刀 + wrong_track=0 单独；**接线绿 ≠ R4 关** | **同意** |
| S7 | **P-FAKEPLAN** 禁令仍在；未把主叶硬塞写成 true planner | **成立**（unit T4 PASS + harness/eval 钉） |
| S8 | 批准范围仅 unit/acceptance 绿；**不批** R4关 / dispatch 已齐 / planner 生产已齐 | **本审钉死** |

→ 上述为 **P-PLANNER unit post-prove** 成功标准；**不是** R4 关闭条件，**不是** HA / 端到端隔离，**不是** 生产 planner 已齐。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm r4-p-planner-unit:prove` EXIT=0（~08:00 PT） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2） |
| 实现方旁证 `g4-dispatch-recheck-prereq:prove` EXIT=0 | **不采信自报**；本审 **独立复跑 EXIT=0** |
| 切片立场：unit 绿仅组装合同；≠HA / ≠R4关 / ≠wrong_track=0 / ≠full P-WIRE | **属实**（REQUEST + harness + eval + prove OK 行） |
| Worker retrieve 仍 primary-leaf + G-R2-5；helper **未接线** | **属实**（源码抽查 §3） |
| dispatch 仍零 Worker 消费 | **属实**（`dispatchTrackLocalRetrieval(` 调用点 = **0**） |
| `releaseEvidence=false` · Not HA · ≠covered · await post-prove dual | **属实**；本文件为独立签核，**非**实现方自批 |
| 配对 rag-route REQUEST | **待审**；**不替代**本域 |

对照源：REQUEST post-prove · `harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · `r4-p-planner.slice.md` · `harness/r4-domain-isolation-status.md` §1 P11 / §2 G-R4-1 / §8 · matrix §1.5 · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope,qbank-planner-retrieval-plan}.ts` · `packages/domain/src/{job-route-classifier,qbank-track-local-retrieval}.ts` · SOLE allowlist · 前序 `2026-09-16-r4-p-planner-mw-e2e-ha.md` · 本审 `.tmp/r4-p-planner-post-prove-ha-rerun-20260916/`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~08:06 PT · HEAD `639134f` + 工作树实现）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm r4-p-planner-unit:prove` | **0** | T1–T4/T6–T7 组装合同绿；helper 未进 retrieve；dispatch 仍零；**≠** R4 关；**≠** wrong_track=0；**≠** HA；`releaseEvidence=false` |
| 2 | `pnpm g4-dispatch-recheck-prereq:prove`（旁证） | **0** | **仍零**生产 dispatch/recheck；无 planner→retrieve 路径；R4 NOT closed |

**未跑（禁）**：`e2e:isolated` · HA dual · flip default · open DELETE · R4 ADV wrong_track=0 关闸。

收据：`.tmp/r4-p-planner-post-prove-ha-rerun-20260916/`  
- unit START `2026-09-16T15:06:08Z` ≈ **08:06:08 PT** · DONE `15:06:10Z` ≈ **08:06:10 PT**  
- 旁证 START `15:06:19Z` ≈ **08:06:19 PT** · DONE `15:06:20Z` ≈ **08:06:20 PT**

unit prove OK 行钉（摘自本审 log）：`OK  r4-p-planner-unit prove (T1–T4/T6–T7; assemble+validate; P-FAKEPLAN banned; G-R2-5 kept; dispatch still unwired; ≠ R4 closed; releaseEvidence=false)`。

---

## 3. 源码抽查：dispatch / planner→retrieve 接线状态

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **零**调用（Python 剥注释后 **CALL_SITES=0**；仅注释否定：`main` / `interview-consumer` / `qbank-retrieve-scope`） |
| helper `qbank-planner-retrieval-plan.ts` | **存在**；仅 re-export domain 组装器；文首钉 **NOT wired into retrieve** |
| 其他 Worker src **import** helper？ | **无**（`OTHER_IMPORTS=[]`） |
| retrieve 主路径 | **仍** `decideRouteSnapshotRetrieve`（`interview-consumer.ts:244`）→ 主叶 scope + G-R2-5 fail-closed |
| `InterviewPlannerOutput` → retrieve/dispatch | Worker src **零**生产路径 |
| db `dispatchTrackLocalRetrieval` | **合同 seam 在**（`packages/db`）；生产 Worker **未消费**；test 夹具调用 ≠ 接线 |
| P-WIRE | **partial only**（主叶 + G-R2-5；**无** full dispatch/recheck / per-turn planner leaf） |
| SOLE_WIRING_ALLOWLIST | 恰 **5**（wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant）；**无** g4 / r4 / planner 入表 |

→ **接线状态：dispatch 仍零 · recheck 仍无 · planner 组装未进 retrieve**。  
→ helper 存在 **≠** retrieve 已用 per-turn planner（harness 假绿表已标红；本审独立核验成立）。

---

## 4. 对抗：unit绿偷写成 R4关 / full wire / planner 生产已齐

| 风险说法 | 裁定 |
|---------|------|
| 「`r4-p-planner-unit:prove` EXIT=0 = R4 已关 / 题域已隔离」 | **假绿 / 禁** — unit = 组装合同；status/eval/harness/prove OK 行均钉 NOT closed；本审 **不批** |
| 「unit 绿 = full P-WIRE / dispatch 已齐 / planner 生产已齐」 | **假绿 / 禁** — Worker 零 `dispatchTrackLocalRetrieval(`；helper 未被 retrieve import |
| 「helper / `production-capable seam` = retrieve 已消费 per-turn plan」 | **假绿 / 禁** — 主路径仍 `decideRouteSnapshotRetrieve`；helper 零消费点 |
| 「status G-R4-1『planner 组装已落地』= 生产 planner 已齐」 | **假绿读法** — 落地范围 = domain 组装 + 未消费 helper；同一句钉 **未进 retrieve** / 无 dispatch |
| 「T1『图内 per-turn』已由 unit 证明」 | **过读** — unit 证的是 domain `planInterviewTurn` 形状合同，**不是** 面试图/Worker 主路径已消费；图内接线属 REAL-WIRE |
| 「g4-dispatch-recheck-prereq 绿 = dispatch 已接线」 | **假绿** — 本绿 = **未接线** 诚实钉 |
| 「unit 绿 = wrong_track=0 / NHP-R4-ADV 关」 | **假绿** — ADV 仍 gap/blocked；须另刀 |
| 「本绿 = covered / HA / `releaseEvidence=true` / flip / open DELETE」 | **假绿** — 全文 false / Not HA / 零 covered；本审未跑 e2e/HA/flip/DELETE |
| 「pre-exec P-PLANNER pass + 本绿 = 可关 R4 / 可宣称生产齐」 | **假绿** — 前序仅批文档闸+可谈；本审仅批 unit 绿+仍不接线 |
| 「配对 rag 未出也可单域当双域关闸」 | **禁** — 配对 REQUEST 待审；**不替代**；冲突以阻塞项为准 |

**本审结论**：送审材料与 prove NOTE **未**把 unit 绿升格为 R4关 / full wire / planner 生产已齐；对抗面在 **叙事外推**（尤其「组装已落地 / production-capable / 图内」）。文档与静态证据诚实。批准范围钉死即可控。

### NHP-R4（独立 · 相对 pre-exec **无升格 covered**）

| 列 | 旗 |
|----|-----|
| NHP-R4-NEG-01 | **partial**（≠ covered） |
| NHP-R4-FAULT-01 | **gap**/blind |
| NHP-R4-BOUND-01 | **partial**/honesty（retrieve **仍**主叶） |
| NHP-R4-ADV-01 | **gap**/blocked（wrong_track=0 NOT closed） |
| NHP-R4-PERF-01 | **blind** |
| NHP-RAG-LOAD-01（R4 LOAD） | **blind** |
| 任一行 covered？ | **否** |

---

## 5. REQUEST 五问（mw-e2e-ha · post-prove）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 独立复跑 `pnpm r4-p-planner-unit:prove`，附 CMD+EXIT？ | **是**。`pnpm r4-p-planner-unit:prove` **EXIT=0**（~08:06 PT）；旁证 `pnpm g4-dispatch-recheck-prereq:prove` **EXIT=0** |
| 2 | 是否同意：本绿 **≠HA** / **≠ cutover** / **≠ flip default** / **≠ open DELETE**？ | **同意** |
| 3 | 是否同意：**R4 仍 NOT closed**；dispatch **仍未接线**；retrieve **仍**主叶？ | **同意**（源码独立核验） |
| 4 | status/eval 是否错误抬升为 covered / HA / `releaseEvidence=true`？（期望：否） | **否**。未抬升；run-status=`implemented_unit_prove_exit0` / await dual；`releaseEvidence=false` |
| 5 | 是否同意：follow-on REAL-WIRE 仍须另刀 + wrong_track=0 单独，且 **接线绿 ≠ R4 关**？ | **同意** |

---

## 6. 阻塞栏（关 R4 / 宣称接线齐 / planner 生产已齐 · 本审不关）

| 阻塞项 | 现状 | 挡什么 |
|--------|------|--------|
| **P-PLANNER → retrieve 接线** | unit 组装齐；helper **未**进 retrieve | 挡「planner 生产已齐 / 图内已消费」 |
| **P-FAKEPLAN** | 禁令仍在（unit T4 PASS） | 挡主叶硬塞 / 缺 generation·recipe 假接线 |
| **G-R4-1** | 无 full dispatch/recheck / per-turn leaf 消费 | 挡 full P-WIRE / R4关 |
| **G-R4-2 / P-WT0** | wrong_track=0 未证；ADV gap/blocked | 挡 R4关（接线≠ADV关） |
| **P-R2 / P-R1 / P-META** | 仍开（并列） | 挡 R4 关闸全集 |
| **NHP FAULT/PERF/LOAD** | gap/blind | 挡假 covered |
| **sole / HA / releaseEvidence** | allowlist 恰5；Not HA；false | 挡切流/发布叙事 |
| **配对 mw-rag-route** | post-prove REQUEST **待审** | 挡「单域当双域」；**不替代** |

上述 **阻塞 R4关与生产接线宣称**；**不**阻塞本「unit/acceptance 绿 + 仍不接线」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（P-PLANNER **unit/acceptance 绿 + 仍不接线**） |
| **批准** | 独立复跑 unit EXIT=0；旁证仍零 dispatch；retrieve 仍主叶；P-FAKEPLAN 禁；R4 仍开；REAL-WIRE/wrong_track=0 另刀 |
| **不批** | R4/G4 关 · 题域已隔离 · wrong_track=0 · full P-WIRE · dispatch 已齐 · planner 生产已齐 · retrieve 已消费 per-turn · covered · HA · `releaseEvidence=true` · sole cutover · flip default · open DELETE |
| **假绿风险** | **中（叙事外推）** — 文档与静态诚实；主风险：把 unit 绿 / helper 存在 / 「组装已落地」误读成 R4关、full wire 或生产 planner 已齐。批准范围钉死则可控 |
| **与 pre-exec** | 前序 pass = 文档闸+可谈+不批 coding 绿关；本刀 = 授权后的 unit 绿核验；**叠加仍 ≠ R4关 / ≠ dispatch 已齐** |

### Nit（非阻塞）

- status §1 P9 仍写「无 per-turn planner→RetrievalPlan」作产品阻塞，与 P11「unit 组装已有、未进 retrieve」略旧；方向仍保守（未偷关），建议 REAL-WIRE 刀对齐措辞。
- harness T1「图内 per-turn」相对 unit 交付（domain 函数）偏宽；本审读为 **组装合同**，**不**把 T1 写成图内已接线。
- helper / prove 用词 `production-capable seam` 须始终并列 **NOT wired**；单独抽出即假绿。
- eval §4 勾选为实现方占位（未勾）；本审以独立复跑+源码为准，**不**把勾选当专家签核。
- 配对 `mw-rag-route` post-prove **仍待审**；本域独立 pass **不替代**双域齐。
- 实现落在工作树（HEAD 仍 `639134f`）；本审未 commit、未改仓。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA** · **≠ covered**
- [x] 本审 **独立复跑** unit + 旁证；**未**跑 e2e:isolated / HA / flip / DELETE
- [x] **unit绿 ≠ R4关** · **≠ 题域已隔离** · **≠ wrong_track=0**
- [x] **dispatch 仍零** Worker `dispatchTrackLocalRetrieval(`（CALL_SITES=0）
- [x] retrieve **仍** primary-leaf + G-R2-5；helper **未被** retrieve import
- [x] **P-FAKEPLAN 禁令未漏**（unit T4 PASS）
- [x] NHP-R4 六列 **零 covered** · 无升格
- [x] sole allowlist **未**扩（恰 5）
- [x] 批准范围仅 **unit/acceptance 绿**；**不批** R4关 / dispatch 已齐 / planner 生产已齐
- [x] 配对 rag **不替代**本域

---

## 9. 结论与回传摘要

- **裁定：pass**（R4 P-PLANNER post-prove · **unit/acceptance 绿 + 仍不接线**）
- **CMD+EXIT**：`pnpm r4-p-planner-unit:prove` **EXIT=0**（~08:06:08–08:06:10 PT）；旁证 `pnpm g4-dispatch-recheck-prereq:prove` **EXIT=0**（~08:06:19–08:06:20 PT）
- **dispatch 状态**：Worker src **零** `dispatchTrackLocalRetrieval(`；helper 未被 retrieve 消费
- **R4 状态**：**仍 NOT closed**；题域隔离 NOT closed；wrong_track=0 未证；P-WIRE=partial only
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`（覆盖 `REQUEST-2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`）
- **假绿风险**：中（叙事外推：unit绿 / helper存在 / 「组装已落地」→ 误读为 R4关、full wire、planner 生产已齐）；批准范围钉死则可控
- **硬钉**：`releaseEvidence=false` · ≠HA · ≠covered · unit绿≠R4关 · dispatch仍零 · HEAD `639134f`

对照：`REQUEST-2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md` · `harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · status §8 · matrix §1.5 · 前序 `2026-09-16-r4-p-planner-mw-e2e-ha.md` · 配对 REQUEST（rag）

---

*mw-e2e-ha · R4 P-PLANNER post-prove · 2026-09-16 ~08:06 PT · releaseEvidence=false · ≠HA · 批 unit 绿 · 不批 R4关/dispatch已齐 · ≠ planner 生产已齐*
