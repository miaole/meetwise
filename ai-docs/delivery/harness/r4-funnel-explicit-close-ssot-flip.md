# Harness — **R4/FUNNEL explicit close / SSOT flip**（prove-await-authorize · REQUEST open）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~20:10 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ FUNNEL dual-closed** · **≠ coding authorized** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关** · **Ban self-approve**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · coding/prove/SSOT flip waits **standing authorize after dual** · **zero coding / zero prove / no SSOT flip yet**）  
**Note**: **≠ prove dual_pass knife** — `harness/r4-funnel-real-close.md` already **`post_prove_dual_pass`** at tip **`d994c36`** (dual on prove SHA **`105b264`**) · prove honesty only · **R4/FUNNEL product NOT closed** · **SSOT NOT flipped** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · this knife opens the **separate** explicit close / SSOT-flip REQUEST · **≠ honesty knife** (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`)  
**Slice**: `../r4-funnel-explicit-close-ssot-flip.slice.md`  
**Eval**: `../eval/r4-funnel-explicit-close-ssot-flip.eval.md`  
**Authority**: meetwise — docs-only REQUEST open for **R4/FUNNEL explicit close / SSOT flip** path · Ban claiming R4/FUNNEL closed from Dual PASS or from prove dual_pass knife · Ban 假关 · Ban wash `105b264` / `d994c36` into product close · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
**Honesty**: This open = REQUEST prep only · **R4/FUNNEL STILL OPEN** until **prove + dual + explicit close authorize** · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN until evidence** · **no** SSOT flip in this commit · Dual PASS ≠ authorize coding · **≠** claim closed from prove dual_pass knife `105b264` / tip `d994c36` · **≠** claim closed from honesty knife `42f77c1` / `669bca4`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST open: **prove-await-authorize lifecycle** for *future* R4/FUNNEL **explicit close / SSOT pointer flip** · cite prove dual_pass knife + honesty knife · pin Dual PASS ≠ coding 假关 |
| **What this knife is not** | **Not** the prove dual_pass knife (`r4-funnel-real-close` · `105b264` / `d994c36`) · **not** the honesty knife (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`) · **not** coding · **not** prove run · **not** SSOT flip now · **not** claiming R4/FUNNEL closed · **not** claiming MS3 closes R4 · **not** claiming G-R4-5 dual-closed · **not** R1/R2 close · **not** HA/suite |
| **R4/FUNNEL closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **Ban 假关** · **R4/FUNNEL STILL OPEN until prove + dual + explicit close authorize** |
| **Prove dual_pass `105b264` ⇒ R4 closed?** | **NO** · Ban wash prove dual_pass into product close · Ban claim closed from `105b264` / `d994c36` |
| **MS3 ⇒ R4 closed?** | **NO** · **MS3 ≠ R4 closed** |
| **G-R4-5 dual-claim?** | **STILL OPEN until evidence** · Ban claiming closed from this REQUEST |
| **Coding / prove / SSOT flip** | **Forbidden** on Dual PASS alone · waits **standing authorize after dual** (not self-serve) · then prove · then **post-prove dual** · **only then** SSOT flip |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove · **no SSOT flip** · Ban self-approve · **releaseEvidence=false** |

---

## 1. Contra — existing R4 / F8 / prove dual_pass / honesty knife（pointers · do not rewrite here）

| Artifact | Path | Honest status (as of open) |
|----------|------|----------------------------|
| **Prove dual_pass knife prior (≠ this)** | `harness/r4-funnel-real-close.md` | **`post_prove_dual_pass`** · dual on **`105b264`** · tip nail **`d994c36`** · EXIT **5×0** · prove honesty only · **R4/FUNNEL product NOT closed** · **SSOT NOT flipped** · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN** |
| **Honesty knife prior (≠ this)** | `harness/r4-funnel-remainder-honesty.md` | **`post_prove_dual_pass`** · dual on **`669bca4`** · tip **`42f77c1`** · docs honesty only · **R4/FUNNEL product NOT closed** |
| R4 parent status | `harness/r4-domain-isolation-status.md` §2 G-R4-5 · §13 F8 | **题域隔离 NOT closed** · **G-R4-5 STILL OPEN** · **NOT flipped** |
| F8 MS3 | `harness/r4-f8-p-meta-ms3-deploy-product.md` | **`post_prove_dual_pass`** · MS3 true · **MS3 ≠ R4 closed** · dual-claim STILL OPEN |
| Canonical R4 prove | `harness/r4-domain-isolation.md` | pass ≠ R4 closed · **NOT flipped** |
| m4 §R4 · GAP-RAG-04 | `m4-rag-hard-gates.md` §R4 · `gap-bug-backlog.md` | dual-claim evidence still open |
| FUNNEL checklist | `execution-master-checklist.md` RAG-FUNNEL-01…08 | 01A ≠ 01 · 02…08 open · Ban invent covered |
| Order pin | R1 / R2-SSOT parallel · **R4/FUNNEL explicit close** | Prove dual_pass done · **product still open** |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R4/FUNNEL-SSOT prove dual_pass nailed · **this REQUEST additive** |

**Headline**: **R4/FUNNEL STILL OPEN**. Prove dual_pass knife (`105b264` / `d994c36`) = prove honesty only · **SSOT NOT flipped**. Honesty knife (`42f77c1` / `669bca4`) = docs honesty only. This knife opens the **explicit close / SSOT flip** REQUEST — still docs-only at open; flip happens only after **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**.

---

## 2. Prove-await-authorize lifecycle（draft · not executed）

| Phase | Gate | This open |
|-------|------|-----------|
| **L0** | REQUEST pair open · `not_run:pre_dual` | **this commit** |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **await coordinator send** |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding 假关 | **not yet** |
| **L3** | Standing coding + prove under authorize · Ban invent EXIT | **forbidden until L2** |
| **L4** | Post-prove dual · Ban self-approve | **forbidden until L3** |
| **L5** | **Only then** SSOT flip · explicit close authorize · Ban 假关 | **forbidden until L4** |

| # | Gate | Must be true before any "R4/FUNNEL closed" / SSOT flip claim | This open |
|---|------|------------------------------------------------------|-----------|
| P1 | Cite prove dual_pass knife `r4-funnel-real-close` · `post_prove_dual_pass` on `105b264` / tip `d994c36` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer only |
| P2 | Cite honesty knife `r4-funnel-remainder-honesty` · `42f77c1` / `669bca4` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer only |
| P3 | Cite F8: MS3 true · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** | yes | pointer only |
| P4 | Explicit Ban 假关 · Ban claim closed from prove dual_pass `105b264` / `d994c36` or honesty knife | yes | pinned |
| P5 | Prove CMD table honesty · re-run only under standing authorize | yes | §3 · **not_run** |
| P6 | SSOT flip plan targets listed · **not flipped** | yes | §4 · plan only |
| P7 | Dual-claim / FUNNEL-01…08 evidence path · Ban forge | **still open** | must survive |
| P8 | 题域隔离 / wrong_track production honesty · Ban flip without authorize | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** |

**Ban**: implementer must **not** write R4/FUNNEL pass-close · must **not** flip SSOT · must **not** claim R4 / FUNNEL / G-R4-5 dual-closed · must **not** treat Dual PASS as coding authorize · must **not** claim closed from prove dual_pass `105b264` / `d994c36` · must **not** claim closed from honesty knife `42f77c1` / `669bca4` · must **not** claim MS3 closes R4.

---

## 3. Prove CMD honesty（frozen · not run this open）

| CMD | Expected EXIT (if later authorized) | Run status now | Honest read |
|-----|-------------------------------------|----------------|-------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | **`not_run:await_authorize`** | Honesty pin ≠ R4 closed |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | **0** | **`not_run:await_authorize`** | F8 MS3 · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN** |
| `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | **`not_run:await_authorize`** | MS2 · ≠ dual-claim closed |
| `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | **`not_run:await_authorize`** | MS1 · ≠ dual-claim closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **`not_run:await_authorize`** | §R4 doc gate · ≠ product close |
| Dual-claim / FUNNEL-01…08 evidence | evidence required | **missing · STILL OPEN** | Ban forge · Ban 假关 |
| Docs / SSOT flip edits | n/a | **forbidden until post-prove dual + explicit close authorize** | **no silent flip** |

**Ban**: do not invent prove EXIT · Dual PASS ≠ prove green ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · Ban wash prior prove dual_pass `105b264` into product close.

---

## 4. SSOT flip target list（plan retained · **NOT flipped this open**）

| Target | Flip intent (after post-prove dual + explicit close authorize) | Now |
|--------|---------------------------------------------------------------|-----|
| `harness/r4-domain-isolation-status.md` §2 G-R4-5 · overall | Align close language honestly if authorize says so | **NOT flipped** · **G-R4-5 STILL OPEN** |
| `harness/r4-f8-p-meta-ms3-deploy-product.md` · dual-claim | Refresh only with evidence · Ban silent G-R4-5 close | **NOT flipped** |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | Product / backlog honesty | **NOT flipped** |
| `execution-master-checklist.md` RAG-FUNNEL-01…08 · hard gates | Align only with evidence · Ban invent covered | **NOT flipped** |
| `harness/r4-funnel-remainder-honesty.md` | Note explicit-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `harness/r4-funnel-real-close.md` | Note explicit-close knife distinct · Ban washing dual_pass into closed | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this knife `REQUEST-ready / not_run:pre_dual`** · **R4/FUNNEL STILL OPEN** |
| `north-star-ha.md` | Align only after L5 authorize | **NOT flipped** |

---

## 5. Pins (must survive post-prove dual)

1. **≠ prove dual_pass knife** — `r4-funnel-real-close` = prove honesty already `post_prove_dual_pass` (`105b264` / tip `d994c36`) · this = **R4/FUNNEL explicit close / SSOT flip** REQUEST · Ban wash `105b264` close  
2. **≠ honesty knife** — `r4-funnel-remainder-honesty` = docs honesty (`42f77c1` / `669bca4`) · **≠** this knife  
3. **R4/FUNNEL STILL OPEN** until **prove + dual + explicit close authorize** · Ban claiming closed from Dual PASS / prove EXIT=0 / prove dual_pass / honesty knife  
4. **MS3 ≠ R4 closed** · Ban claiming MS3 / F8 closes R4  
5. **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claiming dual-closed  
6. **Ban 假关** · **Dual PASS ≠ coding 假关** · Ban self-approve  
7. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
8. Ban invent prove EXIT / silent flip / invent FUNNEL covered  
9. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed · ≠ 题域已隔离  
10. Status stays **`REQUEST-ready / not_run:pre_dual`** until dual · zero coding · **no SSOT flip yet** · Ban elevating prove dual_pass to closed

---

## 6. REQUEST pair

| Phase | Expert | Path |
|-------|--------|------|
| pre-exec REQUEST | `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-e2e-ha.md` |
| pre-exec REQUEST | `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · REQUEST open · no prove · zero coding · no SSOT flip |

---

## 8. Non-claims

REQUEST open only · not pass · not R4 closed · not FUNNEL dual-closed · not G-R4-5 dual-closed · not MS3 closes R4 · not coding · not HA · not suite · Dual PASS ≠ authorize coding · Ban 假关 · Ban false green · Ban self-approve · `releaseEvidence=false` · no SSOT flip · ≠ prove dual_pass knife `105b264` / `d994c36` · ≠ honesty knife `42f77c1` / `669bca4`

---

*Harness · R4/FUNNEL explicit close / SSOT flip · 2026-09-17 (~20:10 PT) · REQUEST-ready / not_run:pre_dual · ≠ prove dual_pass knife 105b264/d994c36 · ≠ honesty knife 42f77c1/669bca4 · R4/FUNNEL STILL OPEN until prove+dual+explicit close auth · MS3 ≠ R4 closed · G-R4-5 STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · zero coding · no SSOT flip yet · Ban self-approve*
