# Harness — G7 main-track · **sole夹具退役 ⋂ scor-00**

**Status**: **`post_prove_dual_pass`**（honesty only）  
**Date**: 2026-09-16 (~19:50 PT exec · post-prove dual ~19:55–23:14 PT)  
**Authority**: meetwise 定案 — scor-00 **升格并入** sole夹具退役主轨（原 B4 pointer-only **superseded**）· **pre-exec dual PASS** · **post-prove dual PASS**（mw-e2e-ha + mw-rag-route）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R5 retired** · **≠ sole cutover complete** · **≠ G1 flip** · **≠ R4 closed** · **≠ suite green** · **≠ 0 BUG** · **R2/R4 still open** · allowlist **恰 5** · Nest-on-MySQL scor **仍 GAP**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`  
**Parent**: G7 `post_suite_dual_pass`（honesty only）→ honesty knives · **≠ verification success**  
**Slice**: `../g7-honesty-knives.slice.md`  
**Supersedes**: `harness/g7-b4-scor00-sole-fixture-gap.md`（pointer-only → redirect here）  
**Hard**: dual before code/prove（pre-exec + post-prove done）· **no self-approve** · **≠ claim R4/R5 closed** · follow F1 REQUEST dual **OPENED**（coding still needs F1 pre-exec dual + authorize）

---

## 0. Stance（主轨升格 · post_prove_dual_pass）

| Statement | Ruling |
|-----------|--------|
| Why elevate | G7 `scor-00:http:prove` EXIT=1 on **pgvector-legacy** was sole-fixture ∩ scor observability — not scor-product-only |
| Executed（authorized） | Sole honesty path + ban legacy-as-sole-green + fixture seed fix on legacy opt-in · **SOLE_WIRING_ALLOWLIST 恰 5 未扩** · **未 flip** global `E2E_ISOLATION_STACK` default |
| Still ≠ | Suite green · HA · R2/R4 closed · R5 retired · sole cutover claimed · invent Key · open DELETE |
| This status | **`post_prove_dual_pass`**（honesty only）· dual receipts below · **实现方禁止自批** · **≠ R5 retired ≠ sole cutover ≠ G1 flip ≠ R4 closed ≠ suite green** |

---

## 1. Problem inventory（G7 retained / updated）

| ID | Surface | Honesty |
|----|---------|---------|
| **G7-SCOR00-PG-FIXTURE** | Legacy Nest HTTP on pgvector · R5-MARKED-RED banner · fixture now seeds `route_decided`（createJob+rule classify）so 410 prove ≠ conflated with `interview_ineligible_route` debt | legacy EXIT=0 **≠** sole capacity **≠** G7 close alone |
| **G1-DEFAULT-LEGACY** | `E2E_ISOLATION_STACK` default **仍** `pgvector-legacy`（G1 prep · flip NOT open · **本刀未翻默认**） | 本绿 ≠ 默认已切 sole |
| **R5-FAKE-GREEN** | Forbidden: narrate legacy scor green as sole/RAG migrated | **forbid** · banner `[G7-SCOR00-PG-FIXTURE]` |
| **ALLOWLIST-BOUND** | Sole allowlist **恰 5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant）；**scor-00 NOT on allowlist**（禁静默扩） | sole honesty = `scor-00:sole-fixture:prove` standalone（P13-style） |
| **SCOR00-MYSQL-NEST-PREREQ** | Nest scor-00 HTTP body still **PG Client** · sole Nest/MySQL port **GAP** | honest remaining gap · sole prove ≠ Nest-on-MySQL covered |

Contra: `harness/r5-retirement-sole-stack-status.md` · `g1-default-switch-prep.md` · `m5-pgvector-fixture-retirement-plan.md` · `receipts/2026-09-16-g7-full-suite-run.md` · BUG-FAKE-R5 / BUG-SCORE-LEGACY

---

## 2. Acceptance criteria（T1–T6 · exec read）

| ID | Criterion | Exec result | False green if… |
|----|-----------|-------------|------------------|
| **T1** | Isolated 默认真栈 plan → MySQL+Qdrant+Redis（`mysql-qdrant-redis`） | **Pinned** · sole compose reachability via `scor-00:sole-fixture:prove` · **G1 flip NOT done**（honest） | Narrate prep/reachability = flip done |
| **T2** | 去 pgvector-legacy 假绿；legacy opt-in only | **Landed** · `[G7-SCOR00-PG-FIXTURE]` / R5-MARKED-RED on legacy scor path | Silent default legacy = sole truth |
| **T3** | scor-00 在 sole 上可证 | **Path defined** · `pnpm scor-00:sole-fixture:prove` · Nest-on-MySQL = PREREQ GAP | Force Nest HTTP EXIT=0 on sole without port / expand allowlist |
| **T4** | 关 G7 nonzero 诚实钉凭 sole 收据 | **Sole receipts recorded** · post-prove dual **pass** · honesty EXIT≠product close | Honesty EXIT=0 → claim scor closed |
| **T5** | R5 green-risk 诚实钉直至 T1–T3 product sole | **Retained** · ≠ R5 retired | Drop R5 risk label early |
| **T6** | Dual before code/prove | **Pre-exec dual PASS** + **post-prove dual PASS**（both domains · 6 CMD EXIT=0） | Self-approve / skip post-prove |

---

## 3. Workstreams

| WS | Scope | Status |
|----|-------|--------|
| **WS-A** | Dual-approve harness T1–T6 | **Done** · pre-exec dual PASS |
| **WS-B** | Isolated default → sole（global flip） | **NOT done** · G1 flip NOT open · this knife does **not** flip runner default |
| **WS-C** | scor-00 sole path · allowlist policy | **Partial** · standalone sole-fixture prove · **allowlist NOT expanded** · Nest/MySQL port GAP |
| **WS-D** | Re-run G7 scor row · R5 GAP retain · ≠ suite green | **Done（honesty）** · CMD+EXIT below · post-prove dual **pass** · R5 GAP retain · ≠ suite green |

---

## 4. CMD + EXIT（executed · ~19:50–19:54 PT）

| CMD | Role | EXIT | Honest read |
|-----|------|------|-------------|
| `pnpm scor-00:sole-fixture:prove` | sole∩scor honesty / T1–T5 pins + sole reachability | **0** | ≠ R5 retired ≠ Nest-on-MySQL ≠ suite green |
| `pnpm scor-00:http:prove` | Nest HTTP · legacy opt-in · R5-MARKED-RED · `[G7-SCOR00-PG-FIXTURE]` | **0** | legacy EXIT=0 ≠ sole ≠ G7 close alone |
| `pnpm scor-00-honesty:prove` | domain honesty pin | **0** | ≠ product / ≠ G7 close alone |
| `pnpm g1-default-switch:prep:prove` | prep still legacy default | **0** | prep ≠ flip · allowlist 恰 5 |
| `pnpm mysql-stack:r5-mark-red:prove` | R5 mark-red | **0** | marked-red ≠ retired |
| `pnpm e2e-isolation:sole-wiring:prove` | sole allowlist sample | **0** | ≠ default sole · scor still off allowlist |

---

## 5. Files touched（this exec）

- `apps/api/test/scor-00-http-db.proof.ts` — createJob + rule `classifyJobRoute` seed；R5/sole honesty header
- `scripts/g7-scor00-sole-fixture.proof.mjs` — **new** sole-fixture honesty prove
- `scripts/run-e2e-isolated.mjs` — `[G7-SCOR00-PG-FIXTURE]` legacy banner · `[G7-SCOR00-SOLE-PREREQ]` on sole non-allowlist
- `package.json` — `scor-00:sole-fixture:prove`
- this harness · `r5-retirement-sole-stack-status.md` · slice pointer · `gap-bug-backlog.md`（BUG-FAKE-R5 cite r5-mark-red/inventory）
- post-prove REQUEST drafts（mw-e2e-ha + mw-rag-route）

**NOT touched**: SOLE_WIRING_ALLOWLIST（恰 5）· `E2E_ISOLATION_STACK` default · production retrieval default · DELETE · `.env*` · MODEL_API_KEY invent · K1–K3/A

---

## 6. Remaining gaps（honest）

- **R5 not fully retired** · G1 flip NOT open · G2/G3/G5/G6 still open per status  
- **R2/R4 still open**（orthogonal K1/K2）  
- Nest scor-00 on **MySQL sole** = PREREQ  
- Sole allowlist 恰 5（scor 外）  
- Suite green / HA / `releaseEvidence=true` **not claimed**

---

## 7. Dual targets

| Phase | Expert | REQUEST |
|-------|--------|---------|
| Pre-exec（done · pass） | `mw-e2e-ha` / `mw-rag-route` | `reviews/2026-09-16-g7-sole-fixture-retire-scor00-mw-*.md` |
| **Post-prove（pass）** | `mw-e2e-ha` | `reviews/2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-e2e-ha.md` — **pass** · 6 CMD EXIT=0 |
| **Post-prove（pass · fresh rerun）** | `mw-rag-route` | `reviews/2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md` — **pass** · 6 CMD EXIT=0 · fresh rerun ~23:13–23:14 PT |

---

## Hard pins

- EXIT=0 ≠ covered ≠ R2/R4 closed ≠ suite green ≠ HA ≠ R5 retired ≠ sole cutover complete ≠ G1 flip  
- allowlist **恰 5** · Nest-on-MySQL scor **仍 GAP** · `releaseEvidence=false` · **≠HA** · no self-approve  
- **≠** silent allowlist expand · **≠** pgvector-legacy green as sole capacity  
- Follow gate：**OPENED** for F1 REQUEST dual · coding still needs **F1 pre-exec dual + authorize** · **≠** implement F1 here · **≠** R4/R5 closed  

*Harness · G7 sole夹具退役 ⋂ scor-00 · 2026-09-16 ~23:16 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ R5 retired · ≠ sole cutover · ≠ G1 flip · ≠ R4 closed · ≠ suite green*
