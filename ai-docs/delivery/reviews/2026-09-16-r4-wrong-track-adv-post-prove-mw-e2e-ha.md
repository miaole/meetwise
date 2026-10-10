# 审查归档 — R4 **wrong_track=0 ADV** **post-prove** · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~19:19 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md`（**pass** · ADV 验收门文档闸；当时禁 coding/prove）  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md`（**不替代**本域；本审独立写）  
**结论**：**pass**（仅 **ADV post-prove 诚实绿**：wired CALL_SITES=1 + wrong_track assert + A3 unit+map + fail-closed + LIVE_PG_GAP 诚实 + NHP-R4-ADV-01 **partial**/honesty-pin）  
**批准范围**：**仅**「`pnpm r4-wrong-track-adv:prove` 专家复跑 EXIT=0 + 静态 CALL_SITES=1 + assert/enforce/A3/fail-closed 在 + LIVE_PG_GAP 诚实保留 + ADV=partial/honesty-pin ≠ covered + sole=5 + R4 仍开」——**不批 R4 关** / 题域已隔离 / covered / HA / `releaseEvidence=true` / full live Worker+PG ADV 已关 / sole cutover / flip default / open DELETE / 把 ADV 绿写成 R4关或 covered  
**硬钉**：`releaseEvidence=false` · **≠HA / Not HA** · **≠ covered** · **ADV prove 绿 ≠ R4 closed ≠ 题域已隔离 ≠ covered** · **wire 绿 ≠ ADV closed** · **LIVE_PG_GAP ≠ full live ADV closed** · **≠ sole cutover / flip default / open DELETE** · **拒绝实现方自批** · HEAD `639134f`（实现在工作树；本审未改仓）

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | 独立复跑 `pnpm r4-wrong-track-adv:prove`，附 CMD+EXIT | **成立**（§2；EXIT=0；OK 行含 LIVE_PG_GAP / ≠ covered / ≠ R4 closed） |
| S2 | A1–A4 对抗面诚实（wired + wrong_track=0 assert + A3 + fail-closed） | **成立**（§3；prove A1–A4 全 PASS + 源码抽查） |
| S3 | LIVE_PG_GAP **不得**被写成 full live ADV 已关 | **成立**（harness/prove/status 诚实钉；§4） |
| S4 | NHP-R4-ADV-01 **仅** partial/honesty-pin；**零 covered** | **成立**（matrix §1.5；§4） |
| S5 | companions NEG/FAULT/BOUND/PERF/LOAD **未**因本刀升 covered | **成立**（§4） |
| S6 | sole allowlist **未**因本刀扩面（期望仍恰 5） | **成立**（恰 5） |
| S7 | R4 status **仍 NOT closed**；ADV prove 绿 ≠ R4 关 / ≠ HA / ≠ covered | **成立**（status §10；本审硬钉） |
| S8 | 无 HA / `releaseEvidence=true` 宣称；拒绝实现方自批 | **成立** |

→ 上述为 **ADV post-prove 诚实** 成功标准；**不是** R4 关闭条件，**不是** HA / covered / full live Worker+PG ADV 已关，**不是** 题域已隔离。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm r4-wrong-track-adv:prove` EXIT=0（~19:15 PT） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2；两次） |
| 切片立场：ADV 绿 ≠ HA / ≠ R4 关 / ≠ covered / ≠ full live PG ADV 已关 | **属实**（REQUEST + harness + eval + slice + prove OK 行） |
| LIVE_PG_GAP 诚实；NHP-R4-ADV-01 partial/honesty-pin | **属实**（matrix §1.5；status §10；prove honesty summary） |
| sole 不扩；R4 仍 NOT closed | **属实**（SOLE 恰 5；status §10） |
| `releaseEvidence=false` · Not HA · await post-prove dual · 禁止自批 | **属实**；本文件为独立签核，**非**实现方自批 |
| 配对 rag-route REQUEST | **待审或不替代**；本域独立 |

对照源：REQUEST post-prove · `harness/r4-wrong-track-adv.md` · `eval/r4-wrong-track-adv.eval.md` · `r4-wrong-track-adv.slice.md` · `harness/r4-domain-isolation-status.md` §10 · matrix §1.5 · `apps/worker/test/r4-wrong-track-adv.proof.ts` · `apps/worker/src/qbank-track-local-retrieve.ts` · `packages/domain/src/qbank-track-local-retrieval.ts` · `scripts/run-e2e-isolated.mjs` SOLE · 前序 `2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md` · 本审 `.tmp/r4-wrong-track-adv-post-prove-ha-rerun-20260916/`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~19:19 PT · HEAD `639134f` + 工作树实现）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm r4-wrong-track-adv:prove` | **0** | CALL_SITES=1；wrong_track assert；A3 surfaces unit+map；fail-closed；LIVE_PG_GAP honesty；**≠ covered**；**≠ R4 closed**；`releaseEvidence=false` |

**未跑（禁）**：HA 绿关 · flip default · open DELETE · `e2e:isolated` 当本刀关闸 · 把本绿当 R4 关闸。

收据：`.tmp/r4-wrong-track-adv-post-prove-ha-rerun-20260916/prove-rerun.log`  
- 复跑窗口 ≈ **19:19 PT**（PDT）  
- OK 行（专家观测，与实现方宣称一致，**但仍为独立复跑**）：  
  `OK  r4-wrong-track-adv prove (wired path CALL_SITES=1; wrong_track assert; A3 surfaces unit+map; fail-closed; LIVE_PG_GAP honesty; ≠ covered; ≠ R4 closed; releaseEvidence=false)`  
- prove 末尾 honesty summary 明示：LIVE_PG_GAP 未关；NHP-R4-ADV-01 partial/honesty-pin；wire green ≠ ADV closed；ADV EXIT=0 ≠ R4 closed。

---

## 3. 源码抽查：CALL_SITES / wrong_track assert / A3 / fail-closed / sole

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **CALL_SITES=1** — 唯一点：`apps/worker/src/qbank-track-local-retrieve.ts` ≈ L163 |
| Domain assert hooks | **在**：`countWrongTrackHits` / `assertWrongTrackZero` / `R4_WRONG_TRACK_RECHECK_REASONS` / `isFailClosedWrongTrackRecheckReason`（`packages/domain/src/qbank-track-local-retrieval.ts`） |
| Worker enforce / map | **在**：`enforceWrongTrackZeroOnServed` / `mapRecheckFailedToRefs` / `scoredRefsFromDispatch`（recheck_failed → degraded；unknown 亦 fail-closed） |
| A3 对抗面 | prove A3：**PASS**（forged/missing metadata · unknown taxonomy · concurrent job change · stale checkpoint · cache replay · 全 `R4_WRONG_TRACK_RECHECK_REASONS` catalog mapped）— **unit+map ≠ full live Worker+PG** |
| A4 fail-closed / G-R2-5 / P-FAKEPLAN | **保留**：缺 snapshot → `route_snapshot_missing`；recheck_failed → degraded；禁 unscoped / sibling / `question_ready`；assemble 缺 generation/recipe → fail |
| SOLE_WIRING_ALLOWLIST | 恰 **5**：`sole-stack:wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant`；**无** r4 / adv / wrong-track 入表 |
| `releaseEvidence=true` 宣称 | **无**（仅假绿表/禁令中作为禁止项出现） |

→ **ADV 实现刀状态：CALL_SITES=1 · assert/enforce 在 · A3 unit+map 绿 · fail-closed 在**。  
→ **ADV prove 绿 ≠ R4 closed ≠ covered ≠ full live Worker+PG ADV 已关**。  
→ **wire 绿 ≠ ADV closed**（A6 仍硬钉）。

---

## 4. 对抗：ADV 绿偷写成 R4关 / HA / covered / full live PG ADV 已关

| 风险说法 | 裁定 |
|---------|------|
| 「`r4-wrong-track-adv:prove` EXIT=0 = R4 已关 / 题域已隔离」 | **假绿 / 禁** — OK 行 + status §10 + A8 均钉 NOT closed；本审 **不批** |
| 「ADV EXIT=0 = NHP-R4-ADV-01 covered」 | **假绿 / 禁** — 仅 **partial**/honesty-pin；零 covered 升格 |
| 「LIVE_PG_GAP 可假装 full live Worker+PG ADV 已关」 | **假绿 / 禁** — harness/prove/status 诚实钉保留 |
| 「wire / CALL_SITES=1 = ADV closed」 | **假绿 / 禁** — wire ≠ ADV closed（A6） |
| 「rag04 绿 = Worker retrieveVia ADV 全关」 | **假绿 / 禁** — 旁证 ≠ 本刀 covered |
| 「本绿 = covered / HA / `releaseEvidence=true`」 | **假绿** — 全文 `releaseEvidence=false` · Not HA |
| 「本绿 = sole cutover / flip default / open DELETE」 | **假绿 / 禁** — sole 仍 5；本审未跑 flip/DELETE |
| 「实现方 REQUEST/harness 自报绿 = 专家 pass」 | **禁** — 本文件为独立签核；**拒绝实现方自批** |
| 「companions NEG/FAULT/BOUND/PERF/LOAD 因 ADV 升 covered」 | **否** — 见下表；**零 covered** |

**本审结论**：送审材料与 prove NOTE **未**把 ADV 绿升格为 R4关 / HA / covered / full live PG ADV 已关；对抗面在 **叙事外推**。文档与静态证据诚实。批准范围钉死即可控。

### NHP-R4（独立 · matrix §1.5 · **不升格 covered**）

| 列 | 旗（本审核验） |
|----|----------------|
| NHP-R4-NEG-01 | **partial**（≠ covered） |
| NHP-R4-FAULT-01 | **gap**/honesty（≠ covered；仍 ≠ R4 / ≠ wrong_track=0 / ≠ ADV covered） |
| NHP-R4-BOUND-01 | **partial**/honesty（≠ covered） |
| **NHP-R4-ADV-01** | **partial**/honesty-pin（prove EXIT=0 旁证；**≠ covered**；**≠ R4 closed**；wire ≠ ADV closed；LIVE_PG_GAP） |
| NHP-R4-PERF-01 | **blind** |
| NHP-RAG-LOAD-01（R4 LOAD） | **blind** |
| 任一行 covered？ | **否** |

status §10：`题域隔离 NOT closed` · ADV=`implemented:awaiting_post_prove_dual` · next=**ADV await post-prove dual** · LIVE_PG_GAP 未关。

---

## 5. REQUEST Q1–Q10（mw-e2e-ha · post-prove · 对抗答）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / full live Worker+PG ADV 已关？ | **否**（未冒充）。全文钉 `releaseEvidence=false` · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG_GAP。 |
| 2 | 独立复跑 EXIT 是否为 0，且读法仍 ≠ covered / ≠ R4 关？ | **是**。EXIT=**0**；OK 行显式 ≠ covered / ≠ R4 closed；本审读法同。 |
| 3 | A1–A4 是否够格作 ADV 实现刀（非仅文档）且 wire ≠ ADV closed？ | **是**。实现+prove（assert/enforce/map + CALL_SITES=1）；A6 硬钉 **wire ≠ ADV closed**。 |
| 4 | LIVE_PG_GAP 是否诚实保留？ | **是**。harness/prove/status 均钉 full live Worker+PG ADV **未**关。 |
| 5 | NHP-R4-ADV-01 是否仅 partial/honesty-pin（**不得** covered）？ | **是**。matrix = **partial**/honesty-pin；**零 covered**。 |
| 6 | companions NEG/FAULT/BOUND/PERF/LOAD 是否未因本刀升 covered？ | **是**。均未升 covered（partial / gap/honesty / blind）。 |
| 7 | sole allowlist 是否仍恰 5、未扩？ | **是**。恰 **5**；未扩。 |
| 8 | G7 draft ≠ success？ | **同意**（本刀未宣称 G7 success；draft ≠ success）。 |
| 9 | 本绿是否不得自动批准 R4 关闭？ | **同意**。ADV prove 绿 **≠** R4 closed；并列 P-R1/P-R2/P-META/P-FIX / LIVE_PG_GAP 仍挡。 |
| 10 | 禁 flip default / open DELETE / HA？ | **同意**；且 `releaseEvidence=false` · Not HA。 |

---

## 6. 阻塞栏

**对本刀「post-prove ADV prove 诚实」批准范围：无阻塞。**

抽查已覆盖：主 CMD EXIT=0 · CALL_SITES=1 · wrong_track assert/enforce · A3 unit+map · fail-closed · LIVE_PG_GAP 诚实 · ADV=partial/honesty-pin · companions 零 covered · sole=5 · R4 NOT closed · `releaseEvidence=false` · ≠HA。

| 仍挡（**非本刀范围** · 关 R4 / 宣称 covered / full live ADV / HA） | 现状 |
|--------|------|
| **LIVE_PG_GAP / G-R4-2** | full live Worker+PG ADV（cache poison / 并发改岗 / metadata 篡改经 retrieveVia）**未**关 |
| **NHP-R4-ADV-01 covered** | 仅 partial/honesty-pin；**禁**升 covered |
| **P-R1 / P-R2 overall / P-META / P-FIX** | 仍开（并列；挡 R4 closed） |
| **NHP FAULT/PERF/LOAD** | gap/blind；**零 covered** |
| **sole / HA / releaseEvidence** | allowlist 恰5；Not HA；false |
| **配对 mw-rag-route post-prove** | 不替代本域；双域齐另计 |

上述 **阻塞宣称 R4关 / covered / full live ADV 已关 / HA**；**不**阻塞本「ADV post-prove 诚实」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（R4 wrong_track=0 ADV · **post-prove 诚实**） |
| **批准** | 仅：专家复跑 EXIT=0；CALL_SITES=1；assert/enforce/A3/fail-closed 在；LIVE_PG_GAP 诚实；ADV=partial/honesty-pin ≠ covered；同意 ADV 绿 ≠ R4关 / ≠ covered / ≠ full live PG ADV 已关 |
| **不批** | R4 关 · 题域已隔离 · covered · HA · `releaseEvidence=true` · full live Worker+PG ADV 已关 · sole cutover · flip default · open DELETE · 实现方自批 |
| **假绿风险** | **中（叙事外推）** — 文档诚实；主风险：把 ADV EXIT=0 / partial 误读为 covered 或 R4关或 full live ADV 已关。批准范围钉死则可控 |

### Nit（非阻塞）

- matrix `NHP-R4-FAULT-01` 仍为 gap/honesty（相对 wire FLIPPED 合理）；**未**借 ADV 升 covered。
- status 文首/§9–§10 已钉 ADV implemented:awaiting_post_prove_dual + R4 NOT closed — 以 §10 为准。
- 配对 `mw-rag-route` post-prove **不替代**本域；本审不等待。
- 实现落在工作树（HEAD 仍 `639134f`）；本审未 commit、未改码。
- `enforceWrongTrackZeroOnServed` 在 served 主路径上主要作 annotated-hit 钩子（prove unit 覆盖）；生产 served 主依赖 db `recheckHitsAtLeaf` + `scoredRefsFromDispatch` fail-closed — **不**据此宣称 full live ADV 已关。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **≠HA / Not HA** · **≠ covered**
- [x] **ADV prove 绿 ≠ R4 closed ≠ 题域已隔离 ≠ covered**
- [x] **wire 绿 ≠ ADV closed**
- [x] **LIVE_PG_GAP 诚实保留**（≠ full live Worker+PG ADV closed）
- [x] **NHP-R4-ADV-01 仅 partial/honesty-pin**（零 covered 升格）
- [x] companions NEG/FAULT/BOUND/PERF/LOAD **零 covered**
- [x] **≠ sole cutover / flip default / open DELETE**
- [x] **拒绝实现方自批**
- [x] 本审 **独立复跑** prove · 未采信实现方 EXIT
- [x] CALL_SITES=**1**（`qbank-track-local-retrieve.ts`）
- [x] wrong_track assert + A3 + fail-closed **仍成立**
- [x] R4 **仍开** · sole allowlist **恰 5 · 未扩**
- [x] 批准范围仅 **ADV post-prove 诚实**；**不批** R4关 / HA / covered / full live PG ADV 已关
- [x] 配对 rag **不替代**本域

---

## 9. 结论与回传摘要

- **裁定：pass**（R4 wrong_track=0 ADV · **post-prove 诚实**）
- **批准范围：仅** ADV post-prove honesty；**NOT** R4 closed · **NOT** HA · **NOT** covered · **NOT** full live Worker+PG ADV closed · **NOT** 题域已隔离
- **CMD+EXIT**：`pnpm r4-wrong-track-adv:prove` → **0**（~19:19 PT · 专家独立复跑）
- **OK 行**：`OK  r4-wrong-track-adv prove (wired path CALL_SITES=1; wrong_track assert; A3 surfaces unit+map; fail-closed; LIVE_PG_GAP honesty; ≠ covered; ≠ R4 closed; releaseEvidence=false)`
- **CALL_SITES=1** @ `apps/worker/src/qbank-track-local-retrieve.ts`
- **阻塞（本刀范围）**：无阻塞
- **确认**：LIVE_PG_GAP 诚实 · ADV=partial/honesty-pin · sole=5 · R4 仍开 · `releaseEvidence=false` · ≠HA
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`
- **硬钉**：`releaseEvidence=false` · ≠HA · ADV 绿 ≠ R4关 · LIVE_PG_GAP · sole=5 · HEAD `639134f`

对照：`REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md` · `harness/r4-wrong-track-adv.md` · status §10 · matrix §1.5 · 前序 pre-exec `2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md` · 配对 REQUEST（rag）

---

*mw-e2e-ha · R4 wrong_track=0 ADV post-prove · 2026-09-16 ~19:19 PT · releaseEvidence=false · ≠HA · 批 ADV prove 诚实 · 不批 R4关 / covered / full live PG ADV 已关 · sole=5 · HEAD `639134f`*
