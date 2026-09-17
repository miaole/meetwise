# Harness — G7-K2 · `mysql-stack:r4-domain-isolation` **sole-cutover doc pin**

**Status**: **`post_prove_dual_pass`**（honesty only）  
**Date**: 2026-09-16 ~19:53 PT · pre-exec dual **pass** · prove EXIT=0 · post-prove dual **pass** both domains  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 covered** · **≠ suite green** · **≠ R2 closed** · **sole ≠ retired** · **G6 OPEN**  
**Experts**: `mw-rag-route` + `mw-e2e-ha`  
**Parent**: G7 post-suite dual **pass** → honesty knives · **≠ verification success**  
**Slice**: `../g7-honesty-knives.slice.md`  
**No self-approve** · **dual before any code/prove** · **docs/status pins first**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| Problem | G7: `pnpm mysql-stack:r4-domain-isolation:prove` **EXIT=1** — status must pin **≠ sole cutover**（harness evidence may already pin；status drift） |
| Goal | **Document/status pin alignment** for sole-cutover honesty；still **≠ R4 closed** · **≠ wrong_track=0 covered** · **≠ 题域已隔离** |
| Not | Wire ADV · claim sole cutover done · flip defaults · suite green |
| After dual | Separate authorize before status edit / prove re-run |

---

## 1. Contra

| Path | Role |
|------|------|
| `receipts/2026-09-16-g7-full-suite-run.md` §3 | EXIT=1 row |
| `harness/r4-domain-isolation-status.md` | Status（must gain/keep **≠ sole cutover** pin） |
| `harness/r4-domain-isolation.md` | Parent harness（evidence may already pin ≠ sole cutover） |
| `scripts/mysql-stack.r4-domain-isolation.proof.mjs` | FAIL: `status: must pin ≠ sole cutover` |
| R4 REAL-WIRE / ADV / LIVE_PG | wire/ADV honesty ≠ R4 closed · LIVE_PG_GAP open |

---

## 2. Acceptance（docs-first）

| ID | Criterion | False green if… |
|----|-----------|-----------------|
| **S1** | Status SSOT explicitly pins **≠ sole cutover** / **≠ cutover** | Status silent → prove EXIT=1 ignored |
| **S2** | Pin coexists with **题域隔离 NOT closed** · **≠ wrong_track=0 covered** | Pin → claim R4 / 题域已隔离 |
| **S3** | Fix path = status/doc align first；no prove-flip without dual | Silent script weaken |
| **S4** | CMD `not_run:pre_dual` | Prove this prep |
| **S5** | scor-00/R5 fixture debt **out of this knife**（see B4 inventory pointer） | Fold scor green into R4 close |

---

## 3. CMD（frozen）

| CMD | Expected later | Run now | Honest read |
|-----|----------------|---------|-------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | 0（after authorize+status pin） | **0**（2026-09-16 ~19:50 PT） | ≠ sole cutover pin landed · ≠ 题域已隔离 · ≠ R4 closed |
| `pnpm g4-dispatch-recheck-prereq:prove` | 0 | **`not_run:pre_dual`** | ≠ R4 closed |
| `pnpm r4-wrong-track-adv:prove` | 0 | **`not_run:pre_dual`** | ≠ wrong_track=0 covered |

---

## 4. NHP columns

| Col | Note |
|-----|------|
| NEG | Claim 题域已隔离 / sole cutover from doc pin alone |
| FAULT | Remove pin to force EXIT=0 |
| BOUND | conn/static prove ≠ ADV covered |
| ADV | Self-approve |
| PERF/LOAD | **blind** |

---

## 5. Dual targets

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-e2e-ha.md` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-rag-route.md` |

---

## Hard pins

- EXIT=0 later ≠ covered ≠ R4 closed ≠ suite green ≠ HA  
- `releaseEvidence=false` · no self-approve · dual before any code/prove  

*Harness · G7-K2 · 2026-09-16 ~19:38 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*

---

## 6. Executed（2026-09-16 ~19:50 PT）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | status pins **≠ sole cutover** · **≠** sole cutover done · **≠** R4 closed · **≠** 题域已隔离 |
| Docs | landed | `harness/r4-domain-isolation-status.md` explicit **≠ sole cutover** |

**Hard pins retained**: EXIT=0 ≠ covered ≠ R4 closed ≠ suite green ≠ HA · ≠ 题域已隔离 · ≠ R2 closed · sole ≠ retired · G6 OPEN · `releaseEvidence=false` · no self-approve · scor-00 out of knife

### Post-prove dual（both domains **pass** · honesty only）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-e2e-ha.md` | **pass** · EXIT=0 independent |
| `mw-rag-route` | `reviews/2026-09-16-g7-k2-r4-sole-cutover-doc-pin-post-prove-mw-rag-route.md` | **pass** · EXIT=0 independent |

**Status writeback**: **`post_prove_dual_pass`** · dual-closed honesty **≠** sole cutover done · **≠** R4 closed · **≠** 题域已隔离 · **≠** suite green · **≠** HA

*Harness · G7-K2 · 2026-09-16 ~19:53 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ 题域已隔离*
