# 审查归档 — R4 **REAL-WIRE-IMPL** **post-prove** · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~19:10 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-r4-real-wire-impl-mw-e2e-ha.md`（**pass** · 验收门文档闸；当时禁 coding/prove）  
**配对**：`REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`（**不替代**本域；本审独立写）  
**结论**：**pass**（仅 **REAL-WIRE-IMPL 接线 prove 诚实绿 + CALL_SITES=1 + fail-closed 保留**）  
**批准范围**：**仅**「`pnpm r4-real-wire-impl:prove` 专家复跑 EXIT=0 + 旁证 unit/g4-dispatch EXIT=0 + 静态 CALL_SITES=1（`qbank-track-local-retrieve.ts`）+ G-R2-5 / recheck_failed fail-closed / P-FAKEPLAN 禁令仍在」——**不批 R4 关** / 题域已隔离 / wrong_track=0 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / open DELETE / 把接线绿写成 R4关  
**硬钉**：`releaseEvidence=false` · **≠HA / Not HA** · **≠ covered** · **接线绿 ≠ R4 closed ≠ wrong_track=0 ≠ 题域已隔离** · **≠ sole cutover / flip default / open DELETE** · **拒绝实现方自批** · HEAD `639134f`（实现在工作树；本审未改仓）

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | 独立复跑 `pnpm r4-real-wire-impl:prove`，附 CMD+EXIT | **成立**（§2；EXIT=0；CALL_SITES=1） |
| S2 | 旁证 `pnpm r4-p-planner-unit:prove` | **成立**（EXIT=0） |
| S3 | 旁证 `pnpm g4-dispatch-recheck-prereq:prove`（期望 FLIPPED CALL_SITES=1；仍 ≠ R4 关） | **成立**（EXIT=0；FLIPPED） |
| S4 | 独立静态 CALL_SITES；G-R2-5 / recheck_failed / P-FAKEPLAN | **成立**（§3） |
| S5 | sole allowlist **未**因本刀扩面（期望仍 5） | **成立**（恰 5） |
| S6 | R4 status **仍 NOT closed**；NHP-R4 ADV **仍 gap/blocked**；matrix **未**升 covered | **成立**（§4） |
| S7 | 无 HA / `releaseEvidence=true` 宣称 | **成立** |
| S8 | 接线绿 ≠ R4 closed ≠ wrong_track=0；拒绝实现方自批 | **本审钉死** |

→ 上述为 **REAL-WIRE-IMPL post-prove 接线诚实** 成功标准；**不是** R4 关闭条件，**不是** HA / covered / wrong_track=0。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm r4-real-wire-impl:prove` EXIT=0（~19:05 PT · CALL_SITES=1） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2） |
| 实现方旁证 unit / g4-dispatch EXIT=0 | **不采信自报**；本审 **独立复跑均 EXIT=0** |
| 切片立场：接线绿 ≠ HA / ≠ R4 关 / ≠ wrong_track=0 / ≠ covered | **属实**（REQUEST + harness + status + prove OK 行） |
| R4 status 仍 NOT closed；ADV 仍 gap | **属实**（status §9/§10；matrix §1.5） |
| sole 不扩；G-R2-5 / recheck / P-FAKEPLAN 仍成立 | **属实**（源码抽查 §3） |
| `releaseEvidence=false` · Not HA · await post-prove dual · 禁止自批 | **属实**；本文件为独立签核，**非**实现方自批 |
| 配对 rag-route REQUEST | **待审或不替代**；本域独立 |

对照源：REQUEST post-prove · `harness/r4-real-wire-impl.md` · `eval/r4-real-wire-impl.eval.md` · `r4-real-wire-impl.slice.md` · `harness/r4-domain-isolation-status.md` §9–§10 · matrix §1.5 · `apps/worker/src/{qbank-track-local-retrieve,interview-consumer,main,qbank-retrieve-scope}.ts` · `scripts/run-e2e-isolated.mjs` SOLE · 前序 `2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` · 本审 `.tmp/r4-real-wire-impl-post-prove-ha-rerun-20260916/`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~19:10 PT · HEAD `639134f` + 工作树实现）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm r4-real-wire-impl:prove` | **0** | CALL_SITES=1；recheck_failed fail-closed；G-R2-5 intact；no P-FAKEPLAN；**≠** R4 closed；**≠** wrong_track=0；`releaseEvidence=false` |
| 2 | `pnpm r4-p-planner-unit:prove` | **0** | unit 组装合同仍绿；T5 note 承认 REAL-WIRE may wire（callSites=1）；**≠** R4 关 |
| 3 | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED**：CALL_SITES=1≥1；REAL-WIRE consume；**仍** R4 NOT closed；**≠** wrong_track=0 |

**未跑（禁）**：HA 绿关 · wrong_track=0 ADV · flip default · open DELETE · `e2e:isolated` 当本刀关闸。

收据：`.tmp/r4-real-wire-impl-post-prove-ha-rerun-20260916/prove-rerun.log`  
- 复跑窗口 ≈ **19:10 PT**（UTC `2026-09-17T02:10:59Z`）  
- 主 prove OK 行：`OK  r4-real-wire-impl prove (CALL_SITES=1≥1; recheck_failed fail-closed; G-R2-5 intact; no P-FAKEPLAN; ≠ R4 closed; ≠ wrong_track=0; releaseEvidence=false)`  
- g4 OK 行：`OK  g4-dispatch-recheck-prereq prove (FLIPPED: CALL_SITES=1≥1; REAL-WIRE consume; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false)`

---

## 3. 源码抽查：CALL_SITES / fail-closed / sole

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(`（剥注释） | **CALL_SITES=1** — 唯一点：`apps/worker/src/qbank-track-local-retrieve.ts` ≈ L130（`await dispatchTrackLocalRetrieval(`） |
| 调用链 | `main.ts` 注入 `adaptive.trackLocal` → `interview-consumer.ts` 在 `trackLocal` 存在时调 `retrieveViaDispatchTrackLocal` → helper 内 assemble + dispatch |
| G-R2-5 | **保留**：consumer 仍先 `decideRouteSnapshotRetrieve`；缺/非法 snapshot → `route_snapshot_missing`；helper 亦对坏 snapshot 直接 degraded；**无** unscoped 打开 |
| `recheck_failed` | **fail-closed**：`scoredRefsFromDispatch` → `degradedRetrieval('recheck_failed:…')`；注释钉 **不**回退 unscoped / sibling / `question_ready` |
| P-FAKEPLAN | **仍禁**：assemble 用 `activeQbankGeneration` 的 generationId/recipeId；缺则 `generation_unavailable`；**无**主叶硬塞缺 generation/recipe |
| SOLE_WIRING_ALLOWLIST | 恰 **5**：`sole-stack:wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant`；**无** g4 / r4 / real-wire / planner 入表 |
| P-WIRE 读法 | 生产路径 **已** planner→assemble→dispatch→recheck（trackLocal 注入时）；compat 无 trackLocal 仍主叶 scoped；**仍 ≠** wrong_track=0 / ≠ R4 关 |

→ **接线状态：CALL_SITES=1 · recheck fail-closed 映射在 · G-R2-5 在 · P-FAKEPLAN 禁**。  
→ **接线绿 ≠ R4 closed ≠ wrong_track=0**。

---

## 4. 对抗：接线绿偷写成 R4关 / HA / covered / wrong_track=0

| 风险说法 | 裁定 |
|---------|------|
| 「`r4-real-wire-impl:prove` EXIT=0 = R4 已关 / 题域已隔离」 | **假绿 / 禁** — prove OK 行 + status/harness 均钉 NOT closed；本审 **不批** |
| 「CALL_SITES=1 = wrong_track=0 / NHP-R4-ADV 关」 | **假绿 / 禁** — ADV **仍 gap/blocked**；ADV 另刀 |
| 「g4-dispatch-recheck-prereq FLIPPED 绿 = R4 关」 | **假绿** — FLIPPED 只证 CALL_SITES≥1；同 OK 行钉 R4 NOT closed |
| 「本绿 = covered / HA / `releaseEvidence=true`」 | **假绿** — harness/eval/slice/status 全文 `releaseEvidence=false` · Not HA；**无** `releaseEvidence=true` 宣称 |
| 「本绿 = sole cutover / flip default / open DELETE」 | **假绿 / 禁** — sole 仍 5；本审未跑 flip/DELETE |
| 「实现方 REQUEST/harness 自报绿 = 专家 pass」 | **禁** — 本文件为独立签核；**拒绝实现方自批** |
| 「matrix FAULT 文案仍写『生产路径无』可升 covered」 | **否** — 旗仍 **gap**/blind；ADV **gap**/blocked；六列 **零 covered**（见下） |

**本审结论**：送审材料与 prove NOTE **未**把接线绿升格为 R4关 / HA / covered / wrong_track=0；对抗面在 **叙事外推**。文档与静态证据诚实。批准范围钉死即可控。

### NHP-R4（独立 · matrix §1.5 · **不升格 covered**）

| 列 | 旗 |
|----|-----|
| NHP-R4-NEG-01 | **partial**（≠ covered） |
| NHP-R4-FAULT-01 | **gap**/blind（文案略旧「生产路径无」；旗 **未**升 covered） |
| NHP-R4-BOUND-01 | **partial**/honesty（≠ covered） |
| NHP-R4-ADV-01 | **gap**/blocked（wrong_track=0 NOT closed；wire ≠ ADV） |
| NHP-R4-PERF-01 | **blind** |
| NHP-RAG-LOAD-01（R4 LOAD） | **blind** |
| 任一行 covered？ | **否** |

status：`题域隔离 NOT closed` · REAL-WIRE-IMPL=`implemented:awaiting_post_prove_dual` · ADV=`REQUEST-ready` / `not_run:pre_dual`。

---

## 5. REQUEST 七问（mw-e2e-ha · post-prove）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 独立复跑主 prove，附 CMD+EXIT？ | **是**。`pnpm r4-real-wire-impl:prove` **EXIT=0**（~19:10 PT）；旁证 unit **0**、g4-dispatch **0**（FLIPPED） |
| 2 | 是否同意：本绿 **不得**写成 HA / covered / `releaseEvidence=true`？ | **同意** |
| 3 | 是否同意：CALL_SITES≥1 **≠** R4 closed **≠** wrong_track=0？ | **同意**（CALL_SITES=1 已独立核验） |
| 4 | 是否同意：G-R2-5 + recheck_failed fail-closed + P-FAKEPLAN 禁令仍成立？ | **同意**（源码抽查） |
| 5 | NHP-R4 ADV 是否仍 gap/blocked？（期望：**是**） | **是**。仍 **gap**/blocked；未升 covered |
| 6 | sole 是否未因本刀扩面？（期望：**未扩**） | **未扩**。恰 **5** |
| 7 | 是否拒绝实现方自批？ | **拒绝**。本文件为专家独立签核 |

---

## 6. 阻塞栏

**对本刀「post-prove 接线 prove 诚实」批准范围：无阻塞。**

抽查已覆盖：三 CMD EXIT=0 · CALL_SITES=1 · G-R2-5 · recheck_failed fail-closed · P-FAKEPLAN 禁 · sole=5 · R4 NOT closed · ADV gap · `releaseEvidence=false` · ≠HA。

| 仍挡（**非本刀范围** · 关 R4 / 宣称 wrong_track=0 / HA） | 现状 |
|--------|------|
| **G-R4-2 / P-WT0 / NHP-R4-ADV** | wrong_track=0 **未证**；ADV gap/blocked |
| **P-R1 / P-R2 overall / P-META** | 仍开（并列） |
| **NHP FAULT/PERF/LOAD** | gap/blind；**零 covered** |
| **sole / HA / releaseEvidence** | allowlist 恰5；Not HA；false |
| **配对 mw-rag-route post-prove** | 不替代本域；双域齐另计 |

上述 **阻塞宣称 R4关 / wrong_track=0 / HA**；**不**阻塞本「接线 prove 诚实」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（REAL-WIRE-IMPL **post-prove 接线 prove 诚实**） |
| **批准** | 仅：三 CMD 专家复跑 EXIT=0；CALL_SITES=1；G-R2-5 / recheck fail-closed / P-FAKEPLAN 仍在；同意接线绿 ≠ R4关 |
| **不批** | R4 关 · 题域已隔离 · wrong_track=0 · covered · HA · `releaseEvidence=true` · sole cutover · flip default · open DELETE · 实现方自批 |
| **假绿风险** | **中（叙事外推）** — 文档诚实；主风险：把 CALL_SITES=1 / FLIPPED 绿误读为 R4关或 wrong_track=0。批准范围钉死则可控 |

### Nit（非阻塞）

- matrix `NHP-R4-FAULT-01` 仍写「生产路径无」，相对本刀 recheck 映射略旧；旗仍 gap/blind、**未**升 covered。
- status §1 P11（P-PLANNER 历史句）仍含「dispatch 仍零」措辞；§9 / 文首已钉 CALL_SITES≥1 + NOT closed — 以 §9/文首为准。
- 配对 `mw-rag-route` post-prove **不替代**本域；本审不等待。
- 实现落在工作树（HEAD 仍 `639134f`）；本审未 commit、未改码。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **≠HA / Not HA** · **≠ covered**
- [x] **接线绿 ≠ R4 closed ≠ wrong_track=0 ≠ 题域已隔离**
- [x] **≠ sole cutover / flip default / open DELETE**
- [x] **拒绝实现方自批**
- [x] 本审 **独立复跑** 三 prove · 未采信实现方 EXIT
- [x] CALL_SITES=**1**（`qbank-track-local-retrieve.ts`）
- [x] G-R2-5 + recheck_failed fail-closed + P-FAKEPLAN 禁 **仍成立**
- [x] R4 **仍开** · ADV **仍 gap/blocked** · matrix **零 covered**
- [x] sole allowlist **未**扩（恰 5）
- [x] 批准范围仅 **post-prove 接线 prove 诚实**；**不批** R4关 / HA
- [x] 配对 rag **不替代**本域

---

## 9. 结论与回传摘要

- **裁定：pass**（R4 REAL-WIRE-IMPL · **post-prove 接线 prove 诚实**）
- **批准范围：仅** REAL-WIRE-IMPL track 的 post-prove wiring prove honesty；**NOT** R4 closed · **NOT** HA · **NOT** covered
- **CMD+EXIT**：`r4-real-wire-impl:prove`→**0** · `r4-p-planner-unit:prove`→**0** · `g4-dispatch-recheck-prereq:prove`→**0**（FLIPPED）
- **CALL_SITES=1** @ `apps/worker/src/qbank-track-local-retrieve.ts`
- **阻塞（本刀范围）**：无阻塞
- **确认**：R4 仍开 · ADV 仍 gap · sole 未扩 · G-R2-5+recheck+P-FAKEPLAN 仍 hold · `releaseEvidence=false` · ≠HA
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md`
- **硬钉**：`releaseEvidence=false` · ≠HA · 接线绿 ≠ R4关 · HEAD `639134f`

对照：`REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md` · `harness/r4-real-wire-impl.md` · status §9 · matrix §1.5 · 前序 pre-exec `2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` · 配对 REQUEST（rag）

---

*mw-e2e-ha · R4 REAL-WIRE-IMPL post-prove · 2026-09-16 ~19:10 PT · releaseEvidence=false · ≠HA · 批接线 prove 诚实 · 不批 R4关 / wrong_track=0*
