# 审查归档 — Knife **F1** · wrong_track **production-surface remaining** **post-prove** · mw-e2e-ha

**日期**：2026-09-16 ~23:25 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove 第二域；**不采信**实现方自报 EXIT；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`reviews/2026-09-16-r4-f1-wrong-track-prod-surface-mw-e2e-ha.md`（**pass** · 执行前文档闸 only）  
**配对**：`REQUEST-2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md`（**不替代**本域；须独立签）  
**结论**：**pass**（**仅** post-prove honesty：真 PG · PS1–PS3 · with-PG EXIT=0 · no-PG EXIT≠0 · skip≠pass · **≠ R4 closed · ≠ prod wrong_track=0 fully closed · ≠ HA · ≠ suite green** · **await dual / coordinator may advance harness to `post_prove_dual_pass` after both domains land — 本审不代改 harness**）  
**批准范围**：**仅**「`pnpm r4-wrong-track-prod-surface:prove` 专家独立复跑 EXIT=0 + `:prove:raw` 无 PG EXIT≠0 + 真击中 isolated PG + PS1–PS3 诚实 + LIVE_PG dual ≠ prod closed + NHP covered dual ≠ this knife + sole 恰 5 未翻 + `releaseEvidence=false` · ≠HA」——**不批** R4 closed · 题域已隔离 · production wrong_track=0 fully closed · HA · suite green · `releaseEvidence=true` · sole cutover · flip default · open DELETE · 把本绿 / LIVE_PG dual / NHP covered 写成 prod fully closed · 单域本审冒充 dual 齐  
**硬钉**：`releaseEvidence=false` · **≠HA** · **EXIT=0 ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0 fully closed ≠ HA ≠ suite green** · **LIVE_PG dual ≠ prod closed** · **NHP covered dual ≠ this knife** · **sole allowlist 恰 5** · **拒绝实现方自批** · HEAD `639134f` · Key **unset** · 未读 `.env*`

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — NOT R4 closed · NOT 题域已隔离 · NOT production wrong_track=0 fully closed · NOT HA · NOT suite green |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| With-PG `pnpm r4-wrong-track-prod-surface:prove` | **EXIT=0**（真 isolated PG · `mode=isolated`） |
| No-PG `pnpm r4-wrong-track-prod-surface:prove:raw` | **EXIT=1**（`PROD_SURFACE_GAP` · skip≠pass） |
| PS1–PS3 | **诚实成立**（deploy fail-closed · track_local obs · LIVE_PG 旁证 · honesty pins） |
| LIVE_PG ADV `post_prove_dual_pass` | **仍钉 ≠** prod closed |
| NHP covered dual | **仍钉 ≠** this knife / ≠ production wrong_track=0 fully closed |
| R4 / 题域 | **仍 NOT closed / 仍开** |
| 本刀 harness/eval/status | 仍 `executed:awaiting_post_prove_dual`（**未**误写 R4 关 / prod fully closed） |
| `releaseEvidence` | **false** |
| sole allowlist | **恰 5 未翻** |
| HA / suite | **≠HA** · **≠ suite green** |
| Blockers（本域 honesty） | **无阻塞**（配对域独立；coordinator 可在双域齐后推进 harness） |

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| 实现方 `pnpm r4-wrong-track-prod-surface:prove` EXIT=0（eval） | **不采信自报**；本审 **独立复跑 EXIT=0**（§2） |
| 无 PG `:prove:raw` → EXIT≠0（skip≠pass） | **属实**；本审独立复跑 → **EXIT=1** |
| harness/eval `executed:awaiting_post_prove_dual` | **属实**；**未**写成 R4 关 / prod fully closed |
| LIVE_PG dual ≠ prod closed · NHP covered ≠ this knife · EXIT=0 ≠ R4 关 | **属实**（硬钉全文） |
| sole 恰 5 未翻；未 flip default；未 open DELETE | **属实** |
| `releaseEvidence=false` · ≠HA · 禁止自批 · await dual | **属实**；本文件为独立签核 |
| Key unset / 未 invent MODEL_API_KEY / 未读 `.env*` | **属实** |

对照源：REQUEST post-prove · `harness/r4-f1-wrong-track-prod-surface.md` · `eval/r4-f1-wrong-track-prod-surface.eval.md` · `r4-f1-wrong-track-prod-surface.slice.md` · `harness/r4-domain-isolation-status.md` §13 · `apps/worker/src/qbank-track-local-retrieve.ts` · `interview-consumer.ts` · `production-config.ts` · `test/r4-wrong-track-prod-surface.proof.ts` · `scripts/run-e2e-isolated.mjs` SOLE · 前序 pre-exec `2026-09-16-r4-f1-wrong-track-prod-surface-mw-e2e-ha.md`

---

## 2. 独立复跑 CMD+EXIT（本审 · ~23:25 PT · HEAD `639134f`）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | `pnpm r4-wrong-track-prod-surface:prove` | **0** | 真击中 **isolated PG**（`run-e2e-isolated` · host `127.0.0.1:32855` · `mode=isolated`）；PS0–PS3 PASS；spawn unit ADV EXIT=0；spawn LIVE_PG EXIT=0；**≠ R4 closed**；**≠ prod fully closed**；`releaseEvidence=false` |
| 2 | `env -u DATABASE_URL -u PGHOST -u PGPORT -u PGUSER -u PGPASSWORD -u PGDATABASE -u E2E_ISOLATED -u E2E_TEST_TARGET_TOKEN pnpm r4-wrong-track-prod-surface:prove:raw` | **1** | 无 PG → 立即 `PROD_SURFACE_GAP` + `skip ≠ pass` + 拒 in-memory 假绿；**skip≠pass** 诚实成立 |

**未跑（禁）**：HA 绿关 · flip default · open DELETE · 全套 `e2e:isolated` 当本刀关闸 · 把本绿当 R4 关 / prod fully closed。

### 2.1 With-PG 收据（~23:25 PT）

- 宿主：`node scripts/run-e2e-isolated.mjs r4-wrong-track-prod-surface:prove:raw`
- R5 标记：`E2E_ISOLATION_STACK=pgvector-legacy` · `E2E_PG_IMAGE=pgvector/pgvector:pg16`（legacy fixture；**≠** sole-stack truth）
- Isolated PG：`meetwise-e2e-1245556-1789626308102 on 127.0.0.1:32855`
- migrate：`applied=133 skipped=0`
- 首行：`F1 prod-surface LIVE_PG target mode=isolated (real Postgres required; skip≠pass)`
- PS1：main `trackLocal` inject · consumer → `retrieveViaDispatchTrackLocal` · `productionRequiresTrackLocal` · `track_local_required` fail-closed — **all PASS**
- PS2：`classifyTrackLocalOutcome` / `observeTrackLocalRetrieval` · `mode=track_local` metrics · cache-replay map fail-closed — **all PASS**
- PS3：harness/eval/status honesty pins · SOLE not expanded · no invent MODEL_API_KEY — **all PASS**
- Spawn unit ADV：`OK  r4-wrong-track-adv prove … ≠ covered; ≠ R4 closed; releaseEvidence=false` → PASS EXIT=0
- Spawn LIVE_PG：`OK  r4-wrong-track-adv-live-pg prove (LIVE_PG hit; retrieveVia; … ≠ covered; ≠ R4 closed; releaseEvidence=false)` → PASS EXIT=0
- 终行：`OK  r4-wrong-track-prod-surface prove (PS1–PS3; LIVE_PG+unit 旁证; ≠ R4 closed; ≠ prod fully closed; releaseEvidence=false)`
- honesty summary：`PG mode=isolated · unit ADV exit=0 · LIVE_PG exit=0`；`LIVE_PG dual ≠ prod closed · NHP covered ≠ this knife · ≠ R4 closed`；`EXIT=0 ≠ production wrong_track=0 fully closed ≠ R4 closed ≠ HA`
- receipt：`LOCAL_ISOLATED_PROOF_RECEIPT … release_evidence=false`（`.tmp/isolated-proof-receipts/2026-09-17T06-25-23-042Z-1245556-ebd90ae4-719c-48e1-811b-8341ec85abbf.json`）

→ **确认：非 in-memory 假绿**；真 PG + PS1–PS3 + LIVE_PG/unit 旁证。

### 2.2 No-PG 收据（~23:25 PT）

- 打印：`PROD_SURFACE_GAP: real Postgres required for r4-wrong-track-prod-surface prove (PS1 live wired 旁证).` + `skip ≠ pass — refusing fake-green with in-memory-only.`
- `ELIFECYCLE` exit code **1** → **EXIT=1**
- 读法：无 PG **不得** skip-as-pass；本刀 fail-closed 诚实。

---

## 3. REQUEST Q1–Q7（对抗答）

| # | 问题 | 本审答 |
|---|------|--------|
| **Q1** | 独立复跑 prove + raw no-PG？ | **已复跑** — prove **EXIT=0**（真 isolated PG）；raw **EXIT=1**（PROD_SURFACE_GAP · skip≠pass） |
| **Q2** | PS1–PS3 是否诚实成立？ | **是** — PS1 deploy fail-closed `track_local_required` + prod call-path `trackLocal`→`retrieveVia`；PS2 `mode=track_local` obs + cache-replay fail-closed；PS3 LIVE_PG 旁证 + honesty pins |
| **Q3** | LIVE_PG ADV `post_prove_dual_pass` 是否仍钉 ≠ prod closed？ | **是（硬钉）** — LIVE_PG = separate honesty 旁证；spawn ≠ F1 alone ≠ prod closed |
| **Q4** | NHP covered dual 是否仍钉 ≠ this knife / ≠ production wrong_track=0 fully closed？ | **是（硬钉）** — NHP-R4-ADV-01 covered = THIS case only · **≠** F1 · **≠** prod fully closed |
| **Q5** | EXIT=0 是否仍钉 ≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green？ | **是（硬钉）** — status §13 / harness / eval 全文钉死 |
| **Q6** | harness/status/eval 是否错误把本绿写成 R4 已关 / prod fully closed？ | **否** — 仍 `executed:awaiting_post_prove_dual`；硬钉 ≠ R4 closed ≠ prod fully closed |
| **Q7** | sole allowlist 恰 5 未翻 · `releaseEvidence=false`？ | **是** — SOLE 恰 5（`wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant`）；F1 **不在** allowlist；`releaseEvidence=false` |

---

## 4. PS1–PS3 / code anchors 抽查

| 维度 | 本审结果 |
|------|----------|
| 真 PG | **是** — isolated fixture；`mode=isolated` · `127.0.0.1:32855` |
| PS1 call-path | **PASS** — `main.ts` injects `trackLocal`；consumer prefers `retrieveViaDispatchTrackLocal` |
| PS1 deploy-surface | **PASS** — `productionRequiresTrackLocal` + consumer `track_local_required` when production missing trackLocal |
| PS2 observability | **PASS** — `classifyTrackLocalOutcome` / `observeTrackLocalRetrieval` · `rag_retrieval_total{mode=track_local}` on wrong_track / recheck / cache-replay |
| PS2 cache-replay | **PASS** — `scoredRefsFromDispatch` replay recheck_failed → degraded；served → empty；full R4_WRONG_TRACK_RECHECK_REASONS map fail-closed |
| PS3 honesty | **PASS** — harness/eval/status pins；P-R1/P-R2/P-META/P-FIX still open / R4 NOT closed |
| LIVE_PG / unit spawn | **PASS EXIT=0** — 旁证 · **≠** this knife alone |
| SOLE_WIRING_ALLOWLIST | 恰 **5**；**无** `r4-wrong-track-prod-surface` 入表 |
| `E2E_ISOLATION_STACK` default | **未翻** — 仍 legacy `pgvector-legacy` for this prove |
| open DELETE / flip default | **未开 / 未翻** |
| Key / `.env*` | Key **unset**；prove 未 invent `MODEL_API_KEY`；本审未读 `.env*` |

→ **F1 prod-surface prove 诚实绿：真 PG · PS1–PS3 · 无 PG 诚实失败。**  
→ **EXIT=0 ≠ R4 closed ≠ prod fully closed ≠ HA ≠ suite green。**  
→ **await post-prove dual（配对独立）；coordinator 可在双域齐后推进 harness → `post_prove_dual_pass` — 仍 ≠ R4 closed。**

---

## 5. 对抗：EXIT=0 / LIVE_PG / NHP 偷写成 R4关 / prod closed / HA

| 风险说法 | 裁定 |
|---------|------|
| 「`r4-wrong-track-prod-surface:prove` EXIT=0 = R4 closed / 题域已隔离」 | **假绿 / 禁** — EXIT=0 ≠ R4 closed；status §13 NOT closed |
| 「EXIT=0 = production wrong_track=0 fully closed」 | **假绿 / 禁** — F1 = production-surface **remaining** honesty；P-R1/P-R2/P-META/P-FIX 仍开 |
| 「LIVE_PG ADV `post_prove_dual_pass` = prod closed / F1 alone」 | **假绿 / 禁** — LIVE_PG = separate honesty 旁证 |
| 「NHP covered dual = this knife done / prod wrong_track=0 fully closed」 | **假绿 / 禁** — covered = THIS case only · ≠ F1 · ≠ prod fully closed |
| 「EXIT=0 = HA / suite green / `releaseEvidence=true`」 | **假绿 / 禁** — 全文 `releaseEvidence=false` · ≠HA · ≠ suite green |
| 「in-memory / skip = 绿」 | **假绿 / 禁** — 无 PG EXIT=1 已证 |
| 「sole 因本刀扩面 / flip default / open DELETE」 | **假绿 / 禁** — sole 仍 5；default 未翻；无 open DELETE |
| 「实现方 REQUEST/eval 自报绿 = 专家 pass」 | **禁** — 本文件独立签核；**拒绝自批** |
| 「本域 pass = dual 齐 / 已关 R4」 | **禁** — 须配对 `mw-rag-route`；即便 dual 齐亦 **≠ R4 closed** |

**本审结论**：送审材料与 prove OK/honesty **未**把本绿升格为 R4关 / prod fully closed / HA；对抗面在 **叙事外推**。文档与独立复跑诚实。

---

## 6. 签名

**Verdict**: **pass**  
**Scope**: **post-prove honesty only**  
**Expert**: `mw-e2e-ha`  
**CMD+EXIT（本审）**: `pnpm r4-wrong-track-prod-surface:prove` → **0**；`:prove:raw` no-PG → **1**  
**Confirm**: R4 **open** · 题域隔离 **NOT closed** · prod wrong_track=0 **未 fully closed** · LIVE_PG dual **≠** prod closed · NHP covered dual **≠** this knife · `releaseEvidence=false` · **≠HA** · sole 恰 5 · 拒绝自批 · Key unset · 未读 `.env*` · 配对独立 · harness 仍 `awaiting_post_prove_dual`（coordinator 可在双域齐后推进 → `post_prove_dual_pass`；**仍 ≠ R4 closed**）

---

*Review · mw-e2e-ha · F1 wrong_track prod-surface post-prove · 2026-09-16 ~23:25 PT · pass（post-prove honesty only）· prove EXIT=0 · raw EXIT=1 · releaseEvidence=false · ≠HA · R4 open · ≠ prod fully closed*
