# Harness — **R4/FUNNEL real close**（prove-await-authorize · REQUEST open）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~19:48 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ FUNNEL dual-closed** · **≠ coding authorized** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · coding/prove waits **standing authorize after dual** · **zero coding / zero prove / no SSOT flip yet**）  
**Note**: **≠ honesty knife** — `harness/r4-funnel-remainder-honesty.md` already **`post_prove_dual_pass`** at tip **`42f77c1`** (dual on REQUEST tip **`669bca4`**) · docs honesty only · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · this knife opens the **separate** real close / prove-await-authorize / SSOT-flip REQUEST  
**Slice**: `../r4-funnel-real-close.slice.md`  
**Eval**: `../eval/r4-funnel-real-close.eval.md`  
**Authority**: meetwise — docs-only REQUEST open for **R4/FUNNEL real close** path · Ban claiming R4/FUNNEL closed from Dual PASS or from honesty knife · Ban 假关 · Ban claim MS3 closes R4 · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*`  
**Honesty**: This open = REQUEST prep only · **R4/FUNNEL STILL OPEN** until **prove + dual + explicit close authorize** · **G-R4-5 dual-claim STILL OPEN until evidence** · **MS3 ≠ R4 closed** · **no** SSOT flip in this commit · Dual PASS ≠ authorize coding · **≠** claim closed from honesty knife `42f77c1` / REQUEST tip `669bca4`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST open: **prove-await-authorize lifecycle** for a *future* R4/FUNNEL product real close / SSOT pointer flip · cite existing R4 status + F8 + honesty knife · pin Dual PASS ≠ coding 假关 |
| **What this knife is not** | **Not** the honesty knife (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`) · **not** coding · **not** prove run · **not** SSOT flip now · **not** claiming R4/FUNNEL closed · **not** claiming MS3 closes R4 · **not** claiming G-R4-5 dual-closed · **not** R1/R2 close · **not** HA/suite |
| **R4/FUNNEL closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **Ban 假关** · **R4/FUNNEL STILL OPEN until prove + dual + explicit close authorize** |
| **MS3 ⇒ R4 closed?** | **NO** · **MS3 ≠ R4 closed** · Ban claim closed from F8 / MS3 true |
| **G-R4-5 dual-claim?** | **STILL OPEN until evidence** · F8 `post_prove_dual_pass` · MS1/MS2/MS3 true · product FUNNEL classifier true · dual-claim **still open** · Ban claiming closed from this REQUEST |
| **Coding / prove / SSOT flip** | **Forbidden** on Dual PASS alone · waits **standing authorize after dual** (not self-serve) · then prove · then **post-prove dual** · **only then** SSOT flip |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove · **no SSOT flip** · Ban self-approve · **releaseEvidence=false** |

---

## 1. Contra — existing R4 / F8 / honesty knife（pointers · do not rewrite here）

| Artifact | Path | Honest status (as of open) |
|----------|------|----------------------------|
| **Honesty knife prior (≠ this)** | `harness/r4-funnel-remainder-honesty.md` | **`post_prove_dual_pass`** · dual on **`669bca4`** · tip nail **`42f77c1`** · **docs honesty only** · **R4/FUNNEL product NOT closed** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · pointed at separate real-close REQUEST |
| R4 parent status | `harness/r4-domain-isolation-status.md` §2 G-R4-5 · §13 F8 | **题域隔离 NOT closed** · **G-R4-5 STILL OPEN** · F8 MS3 true · dual-claim STILL OPEN · blocks R4 close |
| F8 MS3 | `harness/r4-f8-p-meta-ms3-deploy-product.md` | **`post_prove_dual_pass`** · MS1/MS2/MS3 true · HEAD `927cfea` · **≠ R4 closed** · **≠ G-R4-5 dual-closed** |
| F7 / F6 | `harness/r4-f7-…` · `harness/r4-f6-…` | MS2 served · MS1 wired · prior `post_prove_dual_pass` · ≠ dual-claim closed |
| Canonical R4 prove | `harness/r4-domain-isolation.md` · `pnpm mysql-stack:r4-domain-isolation:prove` | EXIT=0 = honesty pin · **≠ R4 closed** · **≠ 题域已隔离** |
| m4 §R4 · GAP-RAG-04 | `m4-rag-hard-gates.md` §R4 · `gap-bug-backlog.md` | R4 / FUNNEL close needs dual-claim evidence · **still open** |
| FUNNEL checklist | `execution-master-checklist.md` RAG-FUNNEL-01…08 · `north-star-hard-gates.md` | 01A ≠ 01 · 02…08 open · Ban invent covered |
| Parallel PREREQ honesty | G-R4-1 / G-R4-2 / G-R4-3 (R1) / G-R4-4 (R2) | Still block R4 close · Ban folding into closed |
| Order pin | R1 / R2-SSOT parallel · **R4/FUNNEL real close** | Honesty rem closed · **product still open** |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R4/FUNNEL rem honesty closed · **this REQUEST additive** |

**Headline**: **R4/FUNNEL STILL OPEN**. Honesty knife (`42f77c1` / `669bca4`) reaffirmed dual-claim STILL OPEN only. This knife opens the **real close / prove-await-authorize / SSOT flip** REQUEST — still docs-only at open; flip happens only after **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**.

---

## 2. Prove-await-authorize lifecycle（draft · not executed）

| Phase | Gate | This open |
|-------|------|-----------|
| **L0** | REQUEST pair open · `not_run:pre_dual` | **this commit** |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **await coordinator send** |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding 假关 | **not yet** |
| **L3** | Standing coding + prove under authorize · Ban invent EXIT | **forbidden until L2** |
| **L4** | Post-prove dual · Ban self-write `post_prove_dual_pass` | **forbidden until L3** |
| **L5** | **Only then** SSOT flip · explicit close authorize · Ban 假关 | **forbidden until L4** |

| # | Gate | Must be true before any "R4/FUNNEL closed" / SSOT flip claim | This open |
|---|------|------------------------------------------------------|-----------|
| P1 | Cite honesty knife `r4-funnel-remainder-honesty` · `post_prove_dual_pass` on `669bca4` / tip `42f77c1` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer only |
| P2 | Cite R4 status + F8 · MS3 true · **MS3 ≠ R4 closed** · Ban claim MS3 closes R4 | yes | pointer only |
| P3 | Cite **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claim dual-closed from F8 / honesty | yes | pointer only |
| P4 | Explicit Ban 假关 · Ban claim closed from honesty knife Dual PASS / `42f77c1` / `669bca4` | yes | pinned |
| P5 | Prove CMD table honesty · re-run only under standing authorize | yes | §3 · **not_run** |
| P6 | SSOT flip plan targets listed · **not flipped** | yes | §4 · plan only |
| P7 | Dual-claim / FUNNEL-01…08 evidence path · Ban forge · Ban invent covered | **still open** | must survive |
| P8 | 题域隔离 / wrong_track production / parallel G-R4-* honesty · Ban silent close | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** |

**Ban**: implementer must **not** write R4/FUNNEL pass-close · must **not** flip SSOT · must **not** claim R4 / FUNNEL / G-R4-5 dual-closed · must **not** claim MS3 closes R4 · must **not** treat Dual PASS as coding authorize · must **not** claim closed from honesty knife `42f77c1` / `669bca4`.

---

## 3. Prove CMD honesty（frozen · not run this open）

| CMD | Expected EXIT (if later authorized) | Run status now | Honest read |
|-----|-------------------------------------|----------------|-------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | **`not_run:await_authorize`** | Honesty pin ≠ R4 closed ≠ 题域已隔离 |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | **0** | **`not_run:await_authorize`** | F8 MS3 · **MS3 ≠ R4 closed** · ≠ G-R4-5 dual-closed |
| `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | **`not_run:await_authorize`** | MS2 · ≠ dual-claim closed |
| `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | **`not_run:await_authorize`** | MS1 · ≠ dual-claim closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **`not_run:await_authorize`** | §R4 doc gate · ≠ product close |
| Dual-claim / FUNNEL-01…08 evidence | evidence required | **missing · STILL OPEN** | Ban forge · Ban 假关 · Ban invent covered |
| Docs / SSOT flip edits | n/a | **forbidden until post-prove dual + explicit close authorize** | **no silent flip** |

**Ban**: do not invent prove EXIT · do not run prove as green close before standing authorize · Dual PASS ≠ prove green ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · Ban claim MS3 closes R4.

---

## 4. SSOT flip target list（plan only · not executed）

| Target | Flip intent (after post-prove dual + explicit close authorize) | Now |
|--------|---------------------------------------------------------------|-----|
| `harness/r4-domain-isolation-status.md` §2 G-R4-5 · overall | Align close language honestly if authorize says so | **NOT flipped** · **G-R4-5 STILL OPEN** · **R4/FUNNEL STILL OPEN** |
| `harness/r4-f8-p-meta-ms3-deploy-product.md` · dual-claim | Refresh only with evidence · Ban silent G-R4-5 close | **NOT flipped** |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | Product / backlog honesty | **NOT flipped** |
| `execution-master-checklist.md` RAG-FUNNEL-01…08 · hard gates | Align only with evidence · Ban invent covered | **NOT flipped** |
| `harness/r4-funnel-remainder-honesty.md` | Note real-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this REQUEST open** |
| `north-star-ha.md` | Align only after L5 authorize | **NOT flipped** |

---

## 5. Pins (must survive dual)

1. **≠ honesty knife** — `r4-funnel-remainder-honesty` = docs honesty already `post_prove_dual_pass` (`42f77c1` / dual `669bca4`) · this = **R4/FUNNEL real close REQUEST**  
2. **R4/FUNNEL STILL OPEN** until **prove + dual + explicit close authorize** · Ban claiming closed from Dual PASS or from honesty knife  
3. **MS3 ≠ R4 closed** · Ban claiming MS3 / F8 closes R4  
4. **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claiming dual-closed from F8 / honesty / this REQUEST  
5. **Ban 假关** · **Dual PASS ≠ coding 假关** · coding / prove / SSOT flip waits **standing authorize after dual** · Ban self-approve  
6. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
7. Ban invent prove EXIT / silent flip / invent FUNNEL covered  
8. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed · ≠ 题域已隔离  
9. Zero coding · zero prove · **no SSOT flip yet** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*`  
10. Order: R1-SSOT / R2-SSOT parallel · **R4/FUNNEL real close** · Ban folding R1/R2 into R4 closed · Ban elevating honesty to closed

---

## 6. REQUEST pair

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r4-funnel-real-close-mw-e2e-ha.md` |
| `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r4-funnel-real-close-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · REQUEST open · **no prove** · zero coding · **no SSOT flip** |

---

## 8. Non-claims

REQUEST open only · not pass · not R4 closed · not FUNNEL dual-closed · not G-R4-5 dual-closed · not MS3 closes R4 · not flip authorized · not coding authorized · not SSOT flipped · not honesty knife re-open · not claim closed from `42f77c1` / `669bca4` · not R1/R2 closed · not HA · not suite · Dual PASS ≠ authorize coding · Ban 假关 · Ban false green · `releaseEvidence=false`

---

*Harness · R4/FUNNEL real close · 2026-09-17 (~19:48 PT) · REQUEST-ready / not_run:pre_dual · ≠ honesty knife 42f77c1/669bca4 · R4/FUNNEL STILL OPEN until prove+dual+explicit close auth · MS3 ≠ R4 closed · G-R4-5 dual-claim STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · zero coding · no SSOT flip yet · Ban self-approve*
