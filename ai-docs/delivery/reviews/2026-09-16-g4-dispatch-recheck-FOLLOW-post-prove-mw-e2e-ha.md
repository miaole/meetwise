# 审查归档 — G4/R4 dispatch-recheck FOLLOW **post-prove** · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~04:49 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`（**pass** · 文档闸；当时禁跑；EXIT=0≠R4关）  
**配对**：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md`（**不替代**本域）  
**结论**：**pass**（仅 **FOLLOW honesty 复跑绿 + 仍不接线**）  
**批准范围**：**仅**「六 CMD honesty subset 专家复跑 EXIT=0 + NOTE 钉齐 + 静态仍未接线」——**不批 R4 关** / G4 关 / 题域已隔离 / wrong_track=0 / full P-WIRE / 生产 dispatch·recheck 已接线 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / 把北星「已生效」写成非happy prove 笼统开跑  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **接线仍无** · **R4 仍开** · **P-WIRE=partial only** · HEAD `639134f`

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | 独立复跑 REQUEST 六 CMD，附 CMD+EXIT | **成立**（见 §2；本审 ~04:49 PT） |
| S2 | NOTE / harness / status / eval 钉 EXIT=0 ≠ R4关 / ≠题域已隔离 / ≠dispatch已齐 / ≠wrong_track=0 | **成立** |
| S3 | Worker 仍零 `dispatchTrackLocalRetrieval(`；无生产 recheck | **成立**（见 §3） |
| S4 | 六绿 **未**偷写成 R4关 / full wire / wrong_track=0 / covered / HA | **成立**（见 §4） |
| S5 | NHP-R4 六列（含 LOAD 盲区）仍 case-only/partial/gap/blind，**零 covered** | **成立** |
| S6 | sole allowlist **未**因本切片扩面 | **成立**（恰 5） |
| S7 | 硬闸「已生效」≠ 非happy prove 笼统开跑 / ≠ R4关 | **成立** |
| S8 | pre-exec dual-pass + 本绿 **不得**自动批准 R4 关闭 | **成立**（本审同意 · 不批） |

→ 上述为 **FOLLOW honesty post-prove** 成功标准；**不是** R4 关闭条件。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方六 CMD EXIT=0（HEAD `639134f` · ~04:46–04:47 PT · `.tmp/r4-follow-post-prove-20260916/`） | **不采信自报**；本审 **独立复跑** 同六条，**均 EXIT=0**（见 §2） |
| 切片立场：未接线生产 dispatch/recheck/planner；EXIT=0≠完整E2E/covered/HA/R4关 | **属实**（文档 + 静态 + prove NOTE） |
| `releaseEvidence=false` · Not HA · ≠covered · pass≠R4已关 | **属实**（REQUEST/status/eval/harness/prove OK 行） |
| pre-exec dual pass ≠ R4关 | **属实**；前序明确禁 prove；本审为 **post-prove** 独立域 |
| await post-prove dual / 禁止自批 | **属实**；本文件为独立签核，**非**实现方自批 |

对照源：REQUEST post-prove · harness §5/§6b · status §6/§6.1 · eval §6.3 · case-matrix §1.5 · north-star-hard-gates 文首 · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` · SOLE allowlist · 前序 `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` · 本审 `.tmp/r4-follow-post-prove-ha-rerun-20260916/`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~04:49 PT · HEAD `639134f`）

| # | CMD | EXIT | NOTE 关键钉（摘自本审 log） |
|---|-----|------|---------------------------|
| 1 | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | NO production dispatch/recheck wire；R4 NOT closed；≠ wrong_track=0；releaseEvidence=false |
| 2 | `pnpm g4-production-scoped-retrieve:prove` | **0** | partial P-WIRE；R4 NOT closed；≠ wrong_track=0；releaseEvidence=false |
| 3 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | retrieve-side only；R2 NOT closed；R4 NOT closed；releaseEvidence=false |
| 4 | `pnpm r2-classify-job-route-prereq:prove` | **0** | R2 NOT closed overall；≠ 路由已生效；releaseEvidence=false |
| 5 | `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | 题域隔离 NOT closed；pass≠R4；main/consumer **不**调用 `dispatchTrackLocalRetrieval(` |
| 6 | `pnpm mysql-stack:m4-rag:prove` | **0** | §R4 仍钉 题域隔离 NOT closed；releaseEvidence=false |

**读法钉（本审强制）**：六绿 = honesty 钉 only · **≠** dispatch 已齐 · **≠** 题域已隔离 · **≠** R4 closed · **≠** wrong_track=0 · **≠** full wire · **≠** covered · **≠** HA · `releaseEvidence=false`。

收据目录：`.tmp/r4-follow-post-prove-ha-rerun-20260916/`（START≈11:49:23Z / DONE≈11:49:32Z ≈ **04:49 PT**）。

---

## 3. 源码抽查：接线状态

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval\s*\(` | **零**调用（仅注释否定：main / consumer / qbank-retrieve-scope） |
| `recheckHitsAtLeaf` / `recheck_failed` / 生产 `recheck(` | Worker src **零** |
| `InterviewPlannerOutput` → retrieve/dispatch | Worker src **零** |
| P-WIRE | **partial only**（主叶 scope + G-R2-5 fail-closed；**无** full dispatch/recheck） |
| SOLE_WIRING_ALLOWLIST | 恰 **5**（wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant）；**无** g4/r4/dispatch 入表 |

→ **接线状态：dispatch 仍无 · recheck 仍无 · planner 仍无**。

---

## 4. 对抗：六绿是否偷写成 R4关 / full wire / wrong_track=0

| 风险说法 | 裁定 |
|---------|------|
| 「六 CMD EXIT=0 = R4 已关 / 题域已隔离」 | **假绿 / 禁** — prove NOTE + harness/status/eval 均显式否定；本审 **不批** |
| 「g4-dispatch-recheck-prereq 绿 = dispatch/recheck 已齐 / full wire」 | **假绿** — 本绿 = **未接线** 诚实钉；Worker 零调用 |
| 「g4-production-scoped-retrieve 绿 = wrong_track=0」 | **假绿** — partial ≠ wrong_track=0；NHP-R4-ADV-01 仍 gap/blocked |
| 「G-R2-5 绿 = R4 关 / 路由已生效」 | **假绿** — retrieve-side only；R2 overall NOT closed；≠ R4 |
| 「r2-classify-job-route-prereq 绿 = 路由已生效」 | **假绿** — overall NOT closed |
| 「mysql-stack:r4 / m4-rag 绿 = 题域已隔离 / RAG 切流」 | **假绿** — 静态诚实钉 only |
| 「pre-exec FOLLOW pass + 本绿 = FOLLOW 关闸完成 / 可关 R4」 | **假绿** — 批准范围仅 honesty 复跑绿+仍不接线；**不批 R4关** |
| 「北星硬闸已生效 = 非happy prove 笼统开跑 / covered」 | **假绿** — 文首钉：文档闸；矩阵仍须单独双审 |
| 「本绿 = covered / HA / releaseEvidence=true」 | **假绿** — REQUEST/status/eval/matrix 零 covered；releaseEvidence=false；Not HA |

**本审结论**：送审材料与 prove NOTE **未**把六绿升格为 R4关 / full wire / wrong_track=0；对抗面主要在 **叙事外推**。文档与静态证据诚实。

### NHP-R4（独立）

| 列 | 旗 |
|----|-----|
| NHP-R4-NEG-01 | **partial**（≠ covered） |
| NHP-R4-FAULT-01 | **gap**/blind |
| NHP-R4-BOUND-01 | **partial**/honesty |
| NHP-R4-ADV-01 | **gap**/blocked（wrong_track=0 NOT closed） |
| NHP-R4-PERF-01 | **blind** |
| NHP-RAG-LOAD-01（R4 LOAD） | **blind** |
| 任一行 covered？ | **否** |

---

## 5. REQUEST 六问（mw-e2e-ha · post-prove）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本 post-prove 是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关？ | **否**。REQUEST/harness/status/eval/prove NOTE 均自钉；本审未检出冒充 |
| 2 | EXIT=0 是否在 harness/status/eval 明确标红为 ≠题域已隔离 / ≠dispatch已齐 / ≠wrong_track=0？ | **是**（且本审六条 NOTE 同钉） |
| 3 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。恰 5；未扩 |
| 4 | 硬闸「已生效」是否被误写成「非happy prove 已授权笼统开跑」？（期望：否） | **否**。文首/REQUEST 钉文档闸；≠笼统开跑 ≠R4关 |
| 5 | NHP-R4 六列是否仍均为 case-only/partial/gap/blind，零 covered？ | **是**（见 §4） |
| 6 | pre-exec dual-pass + 本绿是否不得自动批准 R4 关闭或 FOLLOW 关闸完成？ | **同意 · 不得**。本审 **pass** 仅限 honesty 复跑绿+仍不接线；**明确不批 R4关** |

---

## 6. 阻塞栏（关 R4 / 宣称接线齐 · 本审不关）

| 阻塞项 | 现状 |
|--------|------|
| **G-R4-1 full wire** | 无 `dispatchTrackLocalRetrieval` / recheck / per-turn leaf |
| **G-R4-2 wrong_track=0** | NHP-R4-ADV-01 gap/blocked |
| **P-PLANNER** | Worker 无 InterviewPlannerOutput→RetrievalPlan |
| **P-R2 overall** | wire 齐；overall NOT closed / ≠ 路由已生效 |
| **切题库/向量 / sole / HA** | 被 G4 并列门挡住；禁止本绿勾 releaseEvidence |

上述 **阻塞宣称 R4/G4 关**；**不**阻塞本「honesty 复跑绿 + 仍不接线」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（FOLLOW honesty 复跑绿 + 仍不接线） |
| **批准** | 仅登记：专家独立六 CMD EXIT=0 + NOTE 钉齐 + 静态零接线 |
| **不批** | R4 关闭 · G4 关闭 · 题域已隔离 · wrong_track=0 · full wire · covered · HA · releaseEvidence=true |
| **假绿风险** | **中（叙事外推）** — 文档/prove 诚实；主要风险：把「post-prove pass / 六绿」误读成 R4关。严格限制批准范围即可控 |
| **与 pre-exec** | 前序文档闸 pass 仍有效；本审 **补** 复跑收据；二者叠加 **仍 ≠** R4关 |

### Nit（非阻塞）

- 实现方 `.tmp/r4-follow-post-prove-20260916/` 与本审复跑结果一致（均 0）；本审仍以 **独立复跑** 为准，不采信自报 alone。
- eval §6.3 实现方时间戳 ~04:46–04:47 PT；本审 ~04:49 PT — 同 HEAD、同读法。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA** · **≠ covered**
- [x] 本审 **独立复跑** 六 CMD · 均 EXIT=0 · NOTE 钉齐
- [x] **EXIT=0 ≠ R4 closed** · **≠ dispatch/recheck 已齐** · **≠ 题域已隔离** · **≠ wrong_track=0**
- [x] **接线状态：dispatch 仍无 · recheck 仍无**
- [x] **R4 仍开** · **P-WIRE = partial only**
- [x] pre-exec + 本绿 **不**自动清 R4 / **不**批关闸完成
- [x] 北星「已生效」**≠** 笼统 prove / ≠ R4关
- [x] NHP-R4 六列 **零 covered**
- [x] sole allowlist **未**扩
- [x] 批准范围仅 **FOLLOW honesty 复跑绿 + 仍不接线**；**不批** R4关

---

## 9. 结论与回传摘要

- **裁定：pass**（G4/R4 dispatch-recheck FOLLOW **post-prove** · honesty 复跑绿 + 仍不接线）
- **CMD+EXIT**：六条均 **0**（见 §2）
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`（覆盖 `REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`）
- **接线状态**：dispatch **仍无** · recheck **仍无** · planner **仍无** · P-WIRE=partial only
- **R4 状态**：**仍开**（NOT closed；≠ 题域已隔离）
- **假绿风险**：中（叙事外推）；批准范围钉死则可控

对照：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md` · `harness/r4-domain-isolation.md` · `r4-domain-isolation-status.md` · `eval/r4-domain-isolation.eval.md` · case-matrix §1.5 · `north-star-hard-gates.md` · 前序 `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` · `.tmp/r4-follow-post-prove-ha-rerun-20260916/`

---

*mw-e2e-ha · R4/G4 dispatch-recheck FOLLOW post-prove · 2026-09-16 ~04:49 PT · releaseEvidence=false · ≠HA · 不批 R4关*
