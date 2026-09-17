# 审查归档 — G4/R4 dispatch-recheck FOLLOW（honesty recheck · 不接线）· mw-e2e-ha

**日期**：2026-09-16（PT；本审只读 ~04:45 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**不采信**实现方自报；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`  
**配对**：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md` · 前序域审 `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`（**不替代**本域）  
**结论**：**pass**（仅 **FOLLOW honesty recheck / 仍不接线** 文档完备 + 假绿钉齐；**pre-exec**）  
**批准范围**：**仅**登记「相对 09-10 PREREQ 的差距刷新 + NHP-R4 六列诚实旗 + REQUEST 待双审」——**允许后续谈**专家子集复跑 prove（须 **CMD+EXIT**）  
**不批**：**R4 关闭** / **G4 关闭** / 题域已隔离 / wrong_track=0 / full P-WIRE / 生产 dispatch·recheck 已接线 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / 把北星「已生效」写成非happy prove 笼统开跑 / 把 09-10 dual 或 G-R2-5 dual 写成 FOLLOW 已过或 R4 关  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **本审未跑任何 prove**（通过前禁 prove · 禁 `g4-dispatch*` / `r4*` prove）· **P-WIRE=partial only** · **接线仍无** · **R4 仍开**

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | harness §6b 差距盘点（相对 09-10 dual + G-R2-5）诚实 | **成立**（见 §2） |
| S2 | status §6 / eval §6：FOLLOW = await dual · 实测 `not_run:pre_dual_review` | **成立** |
| S3 | NHP-R4 六列均为 case-only/partial/gap/blind，**零 covered** | **成立**（见 §3） |
| S4 | 明确 **仍不接线** full dispatch/recheck；产品阻塞表在位 | **成立** |
| S5 | 硬钉：`releaseEvidence=false` · ≠HA · pass≠R4 关 · ≠题域已隔离 · ≠wrong_track=0 | **成立**（REQUEST/harness/status/eval/m4/GAP 同钉） |
| S6 | **09-10 PREREQ dual / 旧 dual 不自动清本 FOLLOW**；G-R2-5 ≠ R4 关 | **成立**（显式钉；本审同意） |
| S7 | 北星硬闸文首「已生效」（文档闸/协调授权）**≠** 本 FOLLOW 笼统授权 prove / ≠ R4 关 | **成立**（见 §4 Q4） |
| S8 | sole allowlist **不**因本切片扩面 | **成立**（恰 5；无 g4/r4/dispatch） |
| S9 | 通过前 **禁** prove 作绿关；实现方自承 `not_run:pre_dual_review` | **成立**；**本审亦未跑** |

→ 上述为 **honesty FOLLOW 文档闸** 成功标准；**不是** R4 关闭条件。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承 FOLLOW / 未接线 / 非关 R4 / 非 covered·HA / await dual before prove | **属实**；本审独立签核，**非**实现方自批 |
| 前序 `2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md` = honesty PREREQ only | **属实**；批准范围仅 PREREQ 登记；**接线仍无 · R4 仍开** — **不得**冒充 FOLLOW 已过 |
| P-WIRE = partial only | **属实**（对照 status P4/P9 + 静态 `rg`：Worker 零 `dispatchTrackLocalRetrieval(`） |
| 实现方本刀未跑 prove 作绿关 | **属实**（eval §6.3 六 CMD 均为 `not_run:pre_dual_review`） |
| harness/status/eval/matrix/m4/GAP-RAG-04 同钉 NOT closed | **属实**（抽样交叉） |
| mw-rag-route 前序 FOLLOW pass | **不替代**本域；本审独立 |

对照源：`harness/r4-domain-isolation.md` §6b · `r4-domain-isolation-status.md` §6 · `eval/r4-domain-isolation.eval.md` §6 · `non-happy-path-perf-load-case-matrix.md` §1.5 · `north-star-hard-gates.md` 文首 · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` · `apps/worker/test/g4-dispatch-recheck-prereq.proof.ts` · `scripts/run-e2e-isolated.mjs` SOLE set · 前序 `2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md` · `2026-09-16-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md`

---

## 2. 对抗：是否用 09-10 PREREQ / 旧 dual 冒充 FOLLOW 已过

| 风险说法 | 裁定 |
|---------|------|
| 「09-10 `g4-dispatch-recheck-prereq` dual-pass = 本 FOLLOW 已过 / 可自动绿关」 | **假绿 / 禁** — 09-10 仅 **honesty PREREQ**；harness D7 + status §6 + eval §6 + REQUEST Q6 均钉 **须新 REQUEST 再审** |
| 「G-R2-5 dual-pass = dispatch/recheck 齐 / R4 关」 | **假绿** — G-R2-5 仅 retrieve-side 缺 snapshot fail-closed；**≠** full wire / R4 |
| 「R2 wire 已齐 = R4 关 / 路由已生效 / 可接线 full dispatch」 | **假绿** — R2 overall NOT closed；≠ 路由已生效；P-PLANNER 仍挡 |
| 「partial P-WIRE + PREREQ prove 历史绿 = full P-WIRE / wrong_track=0」 | **假绿** — partial ≠ full；零生产 wrong_track 证据 |
| 「合同 seam / rag04 绿 = Worker 已生产 recheck」 | **假绿** — Worker 零调用；seam ≠ 生产消费 |
| 「北星硬闸已生效 = 非happy / g4-dispatch prove 笼统开跑」 | **假绿** — 文首/REQUEST 钉：**文档闸**；矩阵/本 FOLLOW prove 仍须单独双审 + CMD+EXIT |

**本审结论**：送审材料 **未**把 09-10 dual / G-R2-5 升格为 FOLLOW 已过或 R4 关；对抗面主要在 **叙事外推**，文档自身诚实。

---

## 3. 对抗：eval-first / 成功标准 / 假绿钉 / NHP-R4

| 检查 | 结果 |
|------|------|
| eval-first（G3） | **有**：harness §6b → REQUEST → 双审 → 才允许专家复跑；eval §6 故意留空实测 EXIT |
| 成功标准可核验 | **有**：S1–S9（本文 §0）；≠ R4 关闭全集 |
| 假绿标红 | **有**：harness §5 + §6b；eval §4/§6；REQUEST 非宣称；status 硬句 |
| NHP-R4-NEG-01 | **partial**（G-R2-5）；≠ R4 关；**≠ covered** |
| NHP-R4-FAULT-01 | **gap/blind**（无生产 recheck） |
| NHP-R4-BOUND-01 | **partial/honesty**（主叶 only） |
| NHP-R4-ADV-01 | **gap/blocked**（wrong_track=0 NOT closed） |
| NHP-R4-PERF-01 | **blind** |
| NHP-RAG-LOAD-01（R4 LOAD） | **blind** |
| 任一行写 covered？ | **否** — 六列零 covered |

**sole allowlist（独立）**：`SOLE_WIRING_ALLOWLIST` 恰 5：`wiring` / `ping` / `qdrant-backed` / `vectorstore-adapter` / `vectorstore-qdrant`；**无** g4 / r4 / dispatch-recheck 入表。

**静态接线（独立 · 无 prove）**：

| 维度 | 结果 |
|------|------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **零**调用（仅注释否定） |
| `InterviewPlannerOutput` → retrieve/dispatch | **零**命中 worker src |
| `recheckHitsAtLeaf` / `recheck_failed` 生产消费 | Worker src **无**（合同 seam 另处） |
| P-WIRE | **partial only**（主叶 scope + G-R2-5 fail-closed） |

---

## 4. REQUEST 六问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本 FOLLOW 是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关？ | **否**。REQUEST/harness/status/eval/m4/GAP 均自钉未接线 · Not HA · releaseEvidence=false · ≠ covered · R4 NOT closed；未检出冒充完整 E2E |
| 2 | EXIT=0（若复跑）是否被文档明确标红为 **≠ 题域已隔离 / ≠ dispatch 已齐 / ≠ wrong_track=0**？ | **是**。harness §5/§6b.4、status P7/P9、eval、prove NOTE 模板、REQUEST 均显式标红 |
| 3 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。独立核验恰 5；未扩 |
| 4 | 硬闸「已生效」是否被误写成「非happy prove 已授权笼统开跑」？（期望：否） | **否**。REQUEST/harness/status 钉：**文档闸**；矩阵 prove 仍须单独双审。本审接受文首「已生效」作协调授权后的 **文档闸事实**，但硬钉：**≠ 本 FOLLOW 笼统授权 prove · ≠ R4 关 · ≠ covered/HA** |
| 5 | NHP-R4 六列是否均为 case-only/partial/gap/blind，**零 covered**？ | **是**（见 §3） |
| 6 | 09-10 / G-R2-5 dual-pass 是否 **不得**自动批准本 FOLLOW 绿关或 R4 关闭？ | **同意 · 不得**。09-10 = PREREQ only；G-R2-5 = retrieve-side only；均 **≠** FOLLOW 自动放行 / ≠ R4 关 |

---

## 5. 阻塞栏（关 R4 / 宣称接线齐 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（**未宣称达成**） |
|--------|------|---------------------------|
| **G-R4-1 full wire** | scope partial；**无** dispatch/recheck；无 per-turn leaf | full `dispatchTrackLocalRetrieval` + recheck + per-turn planner leaf |
| **G-R4-2 wrong_track=0** | NHP-R4-ADV-01 gap/blocked | 生产读面零跨域证据全集 |
| **P-PLANNER** | Worker 无 `InterviewPlannerOutput`→`RetrievalPlan` | 真 planner 路径（禁假造 plan） |
| **P-R2 overall** | wire 齐；overall NOT closed / ≠ 路由已生效 | R2 harness 关闸 + 双审收据 |
| **P-R1 / P-META / G-R4-6** | 仍开 | 见 GAP-RAG-01 / FUNNEL-01 / R5 |
| **切题库/向量 / sole / HA** | 被 G4 并列门挡住 | R4 + 并列门关闭且双域审；**禁止**本绿勾 releaseEvidence |

**本切片不因上述阻塞而 block「honesty FOLLOW 文档闸」**；上述仅 **阻塞宣称 R4/G4 关 / 题域已隔离 / dispatch·recheck 已齐 / wrong_track=0 / covered / HA**。

---

## 6. 裁定与 prove 边界

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（FOLLOW honesty recheck / 仍不接线 · pre-exec 文档闸） |
| **是否允许后续谈执行 prove** | **是**（双审齐后 · 专家子集 · 须 **CMD+EXIT**；读法见下） |
| **本审是否已跑 / 授权实现方现在跑** | **否** — 通过前禁 prove；实现方保持 `not_run:pre_dual_review` |
| **复跑 EXIT=0 读法** | **≠** R4 关 · **≠** 题域已隔离 · **≠** dispatch 已齐 · **≠** wrong_track=0 · **≠** covered · **≠** HA · `releaseEvidence=false` |
| **登记 CMD（双审后专家 · 非本审执行）** | `g4-dispatch-recheck-prereq:prove` · `g-r2-5-retrieve-fail-closed:prove` · `g4-production-scoped-retrieve:prove` · `mysql-stack:r4-domain-isolation:prove` · `conn-stack:r4-domain-isolation:prove`（均期望 0 · 诚实钉读法） |
| **与 09-10 旧审关系** | 旧审 **仍有效仅限** honesty PREREQ 登记；**不覆盖** FOLLOW 事实表；**不自动清**本 FOLLOW；**不批** R4 关 |
| **假绿风险（残留）** | **中（叙事外推）** — 文档诚实；主要风险：把「FOLLOW pass / 后续 prove 绿 / 北星已生效」误读成 R4 关或 full wire。严格限制批准范围即可控 |

### Nit（非阻塞）

- REQUEST 复跑表含 `conn-stack:r4-domain-isolation:prove`；配对 rag REQUEST 写 `m4-rag:prove` — 子集略不对称，**不**影响本 pass；专家复跑时可两边并跑。
- status/harness 个别处仍写「P-LIVE pending dual」；若 P-LIVE 双域收据已齐，建议统一为「dual 收据齐 · 仍 ≠ 路由已生效」（与矩阵口径）。**不**影响本 FOLLOW pass。

---

## 7. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA** · **≠ covered**
- [x] **本审未跑 prove** · 通过前禁 prove
- [x] **EXIT=0（若日后复跑）≠ R4 closed** · **≠ dispatch/recheck 已齐** · **≠ 题域已隔离**
- [x] **接线状态：dispatch 仍无 · recheck 仍无**（静态 `rg`）
- [x] **R4 仍开** · **P-WIRE = partial only**
- [x] **09-10 PREREQ dual 不自动清本 FOLLOW**
- [x] 北星「已生效」**≠** 本 FOLLOW 笼统授权 prove / ≠ R4 关
- [x] NHP-R4 六列 **零 covered**
- [x] sole allowlist **未**扩
- [x] 批准范围仅 **FOLLOW honesty 文档闸**；**不批**接线完成 / R4 关

---

## 8. 结论与回传摘要

- **裁定：pass**（G4/R4 dispatch-recheck **FOLLOW** · honesty recheck / 仍不接线 · pre-exec）
- **允许开跑 prove？**：**本审当下否**；**双审齐后可谈**专家复跑（须 CMD+EXIT）；仍 **≠R4 关 / ≠HA**
- **阻塞栏**：见 §5（挡关闸宣称，不挡本 honesty 文档闸）
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`（覆盖 `REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`）
- **与 09-10 旧审**：旧 = PREREQ only · 收据范围不变 · **≠** FOLLOW 自动放行 · **≠** R4 关
- **假绿风险**：中（叙事外推）；文档钉齐则可控

对照：`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` · `harness/r4-domain-isolation.md` §6b · `r4-domain-isolation-status.md` §6 · `eval/r4-domain-isolation.eval.md` §6 · case-matrix §1.5 · `north-star-hard-gates.md` · GAP-RAG-04 · m4 §R4 · 前序 `2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md` · `2026-09-16-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md` · 并行 `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`

---

*mw-e2e-ha · R4/G4 dispatch-recheck FOLLOW · 2026-09-16 PT · releaseEvidence=false · ≠HA · 本审未跑 prove*
