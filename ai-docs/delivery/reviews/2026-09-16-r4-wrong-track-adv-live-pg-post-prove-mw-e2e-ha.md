# 审查归档 — R4 **wrong_track=0 ADV · LIVE_PG** **post-prove** · mw-e2e-ha

**日期**：2026-09-16（PT；本审独立复跑 ~19:38–19:39 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-r4-wrong-track-adv-live-pg-mw-e2e-ha.md`（**pass** · LIVE_PG 验收门文档闸；当时零 prove）  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`（**不替代**本域；须独立签；本审不等待其完成）  
**结论**：**pass**（仅 **LIVE_PG post-prove 诚实绿**：真 PG · `retrieveViaDispatchTrackLocal` · L1–L4 + 无 PG EXIT≠0 · LIVE_PG_GAP 仍开直至 dual · NHP-R4-ADV-01 **partial**/honesty-pin ≠ covered）  
**批准范围**：**仅**「`pnpm r4-wrong-track-adv-live-pg:prove` 专家复跑 EXIT=0 + 无 PG raw EXIT≠0（skip≠pass）+ 真击中 isolated PG（非 in-memory）+ sole=5 未翻 + default stack 未翻 + LIVE_PG_GAP 诚实仍开 + ≠ R4 关 / ≠ covered / ≠ HA」——**不批 R4 关** / LIVE_PG_GAP dual-closed / 题域已隔离 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / open DELETE / 把 LIVE_PG 绿写成 R4关或 covered / unit ADV 冒充本刀  
**硬钉**：`releaseEvidence=false` · **≠HA / Not HA** · **≠ covered** · **Green ≠ R4 closed ≠ LIVE_PG_GAP closed ≠ suite green ≠ HA ≠ covered** · **unit ADV ≠ LIVE_PG knife** · **LIVE_PG EXIT=0 ≠ R4 closed ≠ LIVE_PG_GAP dual-closed** · **pass ≠ 关闸** · **≠ sole cutover / flip default / open DELETE** · **拒绝实现方自批** · HEAD `639134f`（实现在工作树；本审未改仓）

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | 独立复跑 `pnpm r4-wrong-track-adv-live-pg:prove`，附 CMD+EXIT；真击中 PG（非 in-memory 假绿） | **成立**（§2；EXIT=0；`mode=isolated`；OK 行含 retrieveVia / LIVE_PG_GAP open until dual） |
| S2 | 无 PG 诚实：EXIT≠0 · LIVE_PG_GAP（skip≠pass） | **成立**（§2；raw unset PG → EXIT=1；打印 LIVE_PG_GAP） |
| S3 | L1–L4 诚实（真 PG · retrieveVia · A3 live · fail-closed） | **成立**（§3；prove 全 PASS） |
| S4 | 未错误冒充完整 E2E / HA / covered / R4 关 | **成立**（§4） |
| S5 | LIVE_PG_GAP **仍开**直至 dual（EXIT=0 ≠ gap dual-closed） | **成立**（status §11；OK 行；honesty summary） |
| S6 | unit ADV ≠ 本刀 LIVE_PG | **成立**（L6；双 proof 文件分立） |
| S7 | NHP-R4-ADV-01 **不得** covered（仍 partial/honesty-pin） | **成立**（matrix §1.5） |
| S8 | sole allowlist 恰 5；未 flip `E2E_ISOLATION_STACK` default；未 open DELETE | **成立**（sole=5；default=`pgvector-legacy`） |
| S9 | 实现方未自批；须配对 `mw-rag-route` 独立 | **成立**（本文件=独立签；配对 REQUEST 仍待审） |
| S10 | **pass ≠ 关闸**；本绿 ≠ R4 closed ≠ LIVE_PG_GAP dual-closed | **成立**（硬钉全文） |

→ 上述为 **LIVE_PG post-prove 诚实** 成功标准；**不是** R4 关闭，**不是** LIVE_PG_GAP dual 已关（须双域齐），**不是** HA / covered / 题域已隔离。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm r4-wrong-track-adv-live-pg:prove` EXIT=0（eval ~19:37 PT） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2） |
| 无 PG → EXIT≠0 · LIVE_PG_GAP（skip≠pass） | **属实**；本审独立复跑 raw unset → **EXIT=1** |
| 切片立场：LIVE_PG 绿 ≠ HA / ≠ R4 关 / ≠ covered / ≠ LIVE_PG_GAP dual-closed | **属实**（REQUEST + harness + eval + slice + prove OK/honesty） |
| LIVE_PG_GAP 仍开直至 dual；NHP-R4-ADV-01 partial/honesty-pin | **属实**（status §11；matrix §1.5） |
| sole 不扩；default 不翻；R4 仍 NOT closed | **属实**（SOLE 恰 5；default=pgvector-legacy；status §11） |
| `releaseEvidence=false` · Not HA · await post-prove dual · 禁止自批 | **属实**；本文件为独立签核，**非**实现方自批 |
| 配对 rag-route REQUEST | **待审**；**不替代**本域；dual = 两域齐 |

对照源：REQUEST post-prove · `harness/r4-wrong-track-adv-live-pg.md` · `eval/r4-wrong-track-adv-live-pg.eval.md` · `r4-wrong-track-adv-live-pg.slice.md` · `harness/r4-domain-isolation-status.md` §11 · matrix §1.5 · `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` · `scripts/run-e2e-isolated.mjs` SOLE · 前序 pre-exec `2026-09-16-r4-wrong-track-adv-live-pg-mw-e2e-ha.md` · 本审 `.tmp/r4-wrong-track-adv-live-pg-post-prove-ha-rerun-20260916/`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~19:38–19:39 PT · HEAD `639134f` + 工作树实现）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm r4-wrong-track-adv-live-pg:prove` | **0** | 真击中 **isolated PG**（`E2E_ISOLATED=1` · host `127.0.0.1` · `mode=isolated`）；经 `retrieveViaDispatchTrackLocal`；L1–L8 PASS；**≠ covered**；**≠ R4 closed**；**LIVE_PG_GAP open until dual**；`releaseEvidence=false` |
| 2 | `env -u DATABASE_URL -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u E2E_ISOLATED -u E2E_TEST_TARGET_TOKEN -u PGSSLMODE pnpm r4-wrong-track-adv-live-pg:prove:raw` | **1** | 无 PG → 立即 `LIVE_PG_GAP` + `skip ≠ pass` + 拒 in-memory 假绿；**skip≠pass** 诚实成立 |

**未跑（禁）**：HA 绿关 · flip default · open DELETE · `e2e:isolated` 全套当本刀关闸 · 把本绿当 R4 / LIVE_PG_GAP dual 关闸 · unit `r4-wrong-track-adv:prove` 冒充本刀。

### 2.1 With-PG 收据

路径：`.tmp/r4-wrong-track-adv-live-pg-post-prove-ha-rerun-20260916/with-pg-prove.log`  
- 复跑窗口 ≈ **19:38 PT**（PDT）  
- 宿主：`run-e2e-isolated.mjs` → isolated PostgreSQL on `127.0.0.1`（pgvector-legacy fixture；**≠** sole-stack truth）  
- 关键行：`LIVE_PG target mode=isolated (real Postgres required; skip≠pass)`  
- OK 行（专家观测）：  
  `OK  r4-wrong-track-adv-live-pg prove (LIVE_PG hit; retrieveVia; wrong_track=0 ADV surfaces; fail-closed; LIVE_PG_GAP open until dual; ≠ covered; ≠ R4 closed; releaseEvidence=false)`  
- honesty summary 明示：`LIVE_PG path truly hit Postgres: mode=isolated · CALL_SITES=1`；`Exercised: retrieveViaDispatchTrackLocal`；`LIVE_PG_GAP remains OPEN until post-prove dual`；`NHP-R4-ADV-01: partial/honesty-pin`；`unit ADV ≠ this LIVE_PG knife`。

→ **确认：非 in-memory 假绿**；真 PG + 生产接线 `retrieveViaDispatchTrackLocal`。

### 2.2 No-PG 收据

路径：`.tmp/r4-wrong-track-adv-live-pg-post-prove-ha-rerun-20260916/no-pg-prove.log`  
- 复跑窗口 ≈ **19:39 PT**（PDT）  
- 打印：`LIVE_PG_GAP: real Postgres required… skip ≠ pass — refusing fake-green with in-memory-only.`  
- `ELIFECYCLE` exit code **1** → 管道 `EXIT=1`  
- 读法：无 PG **不得** skip-as-pass；本刀 fail-closed 诚实。

---

## 3. 源码 / 静态抽查：retrieveVia / L1–L4 / sole / default / matrix

| 维度 | 本审结果 |
|------|----------|
| 真 PG | **是** — isolated fixture；`mode=isolated`；attest PASS |
| `retrieveViaDispatchTrackLocal` | **在** — `apps/worker/src/qbank-track-local-retrieve.ts` export；prove L2–L4 全经此路径 |
| CALL_SITES | honesty summary：`CALL_SITES=1`；L1 static wire PASS |
| L2 wrong_track=0 live | **PASS** — 仅 nodejs_q1；零 java |
| L3 A3 live | **PASS** — cache poison · forged/missing · metadata_hash · unknown taxonomy · stale checkpoint · concurrent job change；均 fail-closed degraded |
| L4 fail-closed / G-R2-5 / 禁 P-FAKEPLAN | **PASS** — null snapshot → `route_snapshot_missing`；禁 unscoped / legacy_unrouted；非法 planner → degraded |
| unit ADV ≠ 本刀 | **硬钉** — 分立 `r4-wrong-track-adv.proof.ts`（unit+map）vs `r4-wrong-track-adv-live-pg.proof.ts`（LIVE_PG） |
| SOLE_WIRING_ALLOWLIST | 恰 **5**：`wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant`；**无** r4 / live-pg 入表 |
| `E2E_ISOLATION_STACK` default | **未翻** — 仍 `rawIsolationStack \|\| LEGACY_STACK` → `pgvector-legacy` |
| open DELETE | **未开**（本刀未引入；runner 无本刀 open-DELETE 路径） |
| NHP-R4-ADV-01 | **partial**/honesty-pin；**≠ covered**（matrix §1.5；LIVE_PG_GAP 仍开直至 dual） |
| status §11 | LIVE_PG=`executed:awaiting_post_prove_dual`；**LIVE_PG_GAP 仍开**直至 dual；R4 **仍 NOT closed** |
| `releaseEvidence=true` 宣称 | **无** |

→ **LIVE_PG 实现+prove 状态：真 PG · retrieveVia · L1–L4 绿 · 无 PG 诚实失败。**  
→ **LIVE_PG EXIT=0 ≠ R4 closed ≠ LIVE_PG_GAP dual-closed ≠ covered ≠ HA。**  
→ **pass ≠ 关闸。**

---

## 4. 对抗：LIVE_PG 绿偷写成 R4关 / HA / covered / LIVE_PG_GAP dual-closed

| 风险说法 | 裁定 |
|---------|------|
| 「`r4-wrong-track-adv-live-pg:prove` EXIT=0 = R4 已关 / 题域已隔离」 | **假绿 / 禁** — OK 行 + status §11 + L8 均钉 NOT closed；本审 **不批**；**pass ≠ 关闸** |
| 「EXIT=0 = LIVE_PG_GAP dual-closed」 | **假绿 / 禁** — gap **仍开直至 dual**；单域本审 ≠ dual |
| 「EXIT=0 = NHP-R4-ADV-01 covered」 | **假绿 / 禁** — 仅 **partial**/honesty-pin |
| 「unit ADV / `r4-wrong-track-adv:prove` = 本刀 LIVE_PG」 | **假绿 / 禁** — unit ≠ LIVE_PG knife |
| 「in-memory / skip = 绿」 | **假绿 / 禁** — 无 PG EXIT=1 已证 |
| 「rag04 / pgvector fixture 绿 = Worker retrieveVia LIVE_PG covered」 | **假绿 / 禁** — L5；本刀 = Worker retrieveVia + PG |
| 「本绿 = covered / HA / `releaseEvidence=true`」 | **假绿** — 全文 `releaseEvidence=false` · Not HA |
| 「本绿 = sole cutover / flip default / open DELETE」 | **假绿 / 禁** — sole 仍 5；default 未翻 |
| 「实现方 REQUEST/eval 自报绿 = 专家 pass」 | **禁** — 本文件为独立签核；**拒绝实现方自批** |
| 「本域 pass = dual 齐 / gap 可关」 | **禁** — 须配对 `mw-rag-route` 独立 post-prove；本审 **不**代关 dual |

**本审结论**：送审材料与 prove NOTE **未**把 LIVE_PG 绿升格为 R4关 / HA / covered / LIVE_PG_GAP dual-closed；对抗面在 **叙事外推**。文档与独立复跑诚实。批准范围钉死即可控。

### NHP-R4（独立 · matrix §1.5 · **不升格 covered**）

| 列 | 旗（本审核验） |
|----|----------------|
| **NHP-R4-ADV-01** | **partial**/honesty-pin（LIVE_PG prove EXIT=0 旁证；**≠ covered**；**≠ R4 closed**；**LIVE_PG_GAP 仍开直至 dual**；unit+map ≠ full live Worker+PG） |
| companions NEG/FAULT/BOUND/PERF/LOAD | **未**因本刀升 covered（本审抽查 ADV 行；禁升格） |
| 任一行因本刀 → covered？ | **否** |

status §11：`题域隔离 NOT closed` · LIVE_PG=`executed:awaiting_post_prove_dual` · next=**await post-prove dual** · LIVE_PG_GAP **仍开**。

---

## 5. REQUEST Q1–Q8（mw-e2e-ha · post-prove · 对抗答）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 请独立复跑 `pnpm r4-wrong-track-adv-live-pg:prove`，附 CMD+EXIT；确认真击中 PG（非 in-memory 假绿）？ | **是**。CMD=`pnpm r4-wrong-track-adv-live-pg:prove`；EXIT=**0**；`mode=isolated`；真 PG + `retrieveViaDispatchTrackLocal`；OK 行含 LIVE_PG hit。 |
| 2 | L1–L4 是否诚实？无 PG 时是否 fail（非 skip-as-pass）？ | **是**。L1–L4 prove 全 PASS；无 PG raw CMD 见 §2 → EXIT=**1** + `LIVE_PG_GAP` + `skip ≠ pass`。 |
| 3 | 是否未错误冒充完整 E2E / HA / covered / R4 关？ | **是（未冒充）**。全文钉 `releaseEvidence=false` · ≠HA · ≠ covered · ≠ R4 closed。 |
| 4 | LIVE_PG_GAP 是否仍开直至 dual？ | **是**。status §11 + OK/honesty；EXIT=0 ≠ gap dual-closed；须双域齐。 |
| 5 | unit ADV ≠ 本刀？ | **是**。unit+map ≠ LIVE_PG；双 proof 分立；L6 硬钉。 |
| 6 | NHP-R4-ADV-01 是否不得 covered？ | **是**。仍 **partial**/honesty-pin；**零 covered** 升格。 |
| 7 | sole allowlist / default stack 是否未被本刀偷翻？（期望：未翻） | **未翻**。sole 恰 **5**；default 仍 `pgvector-legacy`；无 open DELETE。 |
| 8 | 实现方是否自批？（期望：**否**） | **否**。仅 REQUEST/eval；无实现方 pass review；本文件为 `mw-e2e-ha` 独立对抗审。 |

---

## 6. Blockers

| ID | 项 | 挡本刀 post-prove pass？ | 挡 LIVE_PG_GAP dual-closed / R4 关？ |
|----|-----|--------------------------|-------------------------------------|
| — | 本刀 LIVE_PG post-prove 诚实 | **无阻塞** | — |
| **B-DUAL** | 配对 `mw-rag-route` 须齐 | 本域可独立 pass；**dual = 两域齐** | **是**（gap dual-close 条件） |
| **B-GAP** | LIVE_PG_GAP dual-closed | **否**（本审明确 **不**关 gap） | **是**（仍开直至 dual） |
| **B-COVERED** | NHP-R4-ADV-01 covered | **否** | 仍 **partial**；禁本刀升格 |
| **P-R1/P-R2/P-META/P-FIX** | R4 关闸并列 | **否** | 挡 **R4 closed**（即使 dual 后 LIVE_PG 绿） |

→ **本刀 LIVE_PG post-prove 诚实：无阻塞。**  
→ **LIVE_PG_GAP 仍开直至 post-prove dual**；本域 pass **≠** dual 齐 **≠** gap 关。  
→ **R4 仍开**；**pass ≠ 关闸**。

---

## 7. 结论摘要

| 项 | 值 |
|----|-----|
| **Verdict** | **pass** |
| **Scope** | **仅** LIVE_PG **post-prove 诚实**（真 PG + retrieveVia + 无 PG fail）；**≠** R4 closed · **≠** LIVE_PG_GAP dual-closed · **≠** HA · **≠** covered |
| **With-PG** | `pnpm r4-wrong-track-adv-live-pg:prove` → **EXIT=0** · `mode=isolated` |
| **No-PG** | `… pnpm r4-wrong-track-adv-live-pg:prove:raw`（unset PG*） → **EXIT=1** · LIVE_PG_GAP |
| **unit ADV ≠ LIVE_PG** | **硬钉** |
| **LIVE_PG_GAP** | **仍开直至 dual** |
| **R4** | **仍 NOT closed** |
| **NHP-R4-ADV-01** | **仍 partial**/honesty-pin；**零 covered** |
| **sole allowlist** | **恰 5 · 未扩** |
| **default stack** | **未翻**（仍 pgvector-legacy） |
| **releaseEvidence** | **false** · **≠HA** |
| **pass ≠ 关闸** | **硬钉** |
| **Blockers（本刀诚实）** | **无阻塞**（dual / gap / R4 仍外挡） |
| **Sign** | `mw-e2e-ha` |
| **配对** | `mw-rag-route`（须独立；不替代本域） |

---

## 8. 非宣称（再钉）

- **不**宣称 LIVE_PG_GAP dual-closed / R4 closed / 题域已隔离 / NHP-R4-ADV-01 covered / HA / `releaseEvidence=true`  
- **不**宣称 unit ADV 已覆盖本刀；**不**宣称完整 E2E / suite green  
- **不**宣称本域 pass = dual 齐 / 可关 gap  
- **不**宣称 sole cutover / flip default / open DELETE  
- 实现方 **禁止自批**；本文件为 `mw-e2e-ha` 独立对抗审  
- **Green ≠ R4 closed ≠ LIVE_PG_GAP closed ≠ suite green ≠ HA ≠ covered**  
- **pass ≠ 关闸**

---

## 9. 硬钉勾选

- [x] `releaseEvidence=false` · **≠HA / Not HA** · **≠ covered**
- [x] **Green ≠ R4 closed ≠ LIVE_PG_GAP closed ≠ suite green ≠ HA ≠ covered**
- [x] **unit ADV ≠ LIVE_PG knife**
- [x] **LIVE_PG_GAP 仍开直至 dual**（EXIT=0 ≠ gap dual-closed）
- [x] **pass ≠ 关闸** · **≠ R4 closed** · **≠ 题域已隔离**
- [x] **NHP-R4-ADV-01 仍 partial**/honesty-pin（零 covered）
- [x] sole allowlist **恰 5 · 未扩**；default **未翻**；**≠ open DELETE**
- [x] 独立 With-PG EXIT=0（真 PG · retrieveVia）+ No-PG EXIT=1（skip≠pass）
- [x] **拒绝实现方自批**；配对 rag **不替代**本域
- [x] 批准范围仅 **LIVE_PG post-prove 诚实**；**不批** R4关 / HA / covered / LIVE_PG_GAP dual-closed

---

## 10. 回传摘要

- **路径**：`ai-docs/delivery/reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`
- **Verdict+scope**：**pass** · scope = **LIVE_PG post-prove 诚实 only**（≠ R4 closed · ≠ LIVE_PG_GAP dual-closed · ≠ HA · ≠ covered）
- **With-PG**：`pnpm r4-wrong-track-adv-live-pg:prove` → **EXIT=0**（`mode=isolated` · retrieveVia · OK 含 LIVE_PG_GAP open until dual）
- **No-PG**：`env -u DATABASE_URL -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u E2E_ISOLATED -u E2E_TEST_TARGET_TOKEN -u PGSSLMODE pnpm r4-wrong-track-adv-live-pg:prove:raw` → **EXIT=1**（LIVE_PG_GAP · skip≠pass）
- **Blockers（本刀诚实）**：**无阻塞**（**B-DUAL** 仍挡 gap dual-close；R4 并列 PREREQ 仍开）
- **确认**：LIVE_PG_GAP **仍开直至 dual** · sole=**5** · `releaseEvidence=false` · **≠HA** · **pass ≠ 关闸**

对照：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md` · harness/eval/slice · status §11 · matrix §1.5 · 前序 pre-exec · 配对 REQUEST（rag）

---

*Review · mw-e2e-ha · R4 wrong_track ADV LIVE_PG · POST-PROVE 诚实 · 2026-09-16 ~19:39 PT · pass（scope=LIVE_PG post-prove honesty only）· releaseEvidence=false · ≠HA · unit ADV≠LIVE_PG · LIVE_PG_GAP open until dual · R4 still open · ADV partial · sole=5 · default unflipped · pass≠关闸 · HEAD `639134f`*
