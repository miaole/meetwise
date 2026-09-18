# Harness — **R4/FUNNEL explicit close / SSOT flip**（prove-await-authorize · standing coding+prove · **awaiting post-prove dual**）

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~20:15 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ FUNNEL dual-closed** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关** · **Ban self-write `post_prove_dual_pass`**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** on REQUEST SHA **`133d952`** · standing authorize coding+prove · **Ban self-approve** · **Ban self-write `post_prove_dual_pass`**)  
**Note**: **≠ prove dual_pass knife** — `harness/r4-funnel-real-close.md` already **`post_prove_dual_pass`** at tip **`d994c36`** (dual on prove SHA **`105b264`**) · prove honesty only · **R4/FUNNEL product NOT closed** · **SSOT NOT flipped** · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN** · this knife = **separate** explicit close / SSOT-flip path · **SSOT flip NOT executed this phase** (L5 waits post-prove dual + explicit close authorize) · **≠ honesty knife** (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`)  
**Slice**: `../r4-funnel-explicit-close-ssot-flip.slice.md`  
**Eval**: `../eval/r4-funnel-explicit-close-ssot-flip.eval.md`  
**Receipt**: `../receipts/2026-09-17-r4-funnel-explicit-close-ssot-flip-prove.md`  
**Authority**: meetwise — standing authorize **R4/FUNNEL explicit close / SSOT flip coding+prove** after pre-exec dual on REQUEST **`133d952`** · prove EXIT recorded · **await post-prove dual** · **do NOT self-write `post_prove_dual_pass`** · **SSOT flip STILL DEFERRED to L5** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
**Honesty**: Pre-exec dual PASS ≠ R4 closed · prove EXIT=0 ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · **SSOT targets NOT flipped** · Ban 假关 · Ban wash prove dual_pass `105b264`/`d994c36` into product close · Ban wash honesty knife `42f77c1`/`669bca4` · `releaseEvidence=false` · ≠HA · ≠suite · Ban self-write `post_prove_dual_pass`

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-e2e-ha.md` | **pass** (docs gate) on REQUEST **`133d952`** |
| `mw-rag-route` | `../reviews/2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-rag-route.md` | **pass** (docs gate) on REQUEST **`133d952`** |

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Standing-authorized prove-await path for R4/FUNNEL **explicit close / SSOT flip** · run harness prove CMDs · record EXIT · leave **`executed:awaiting_post_prove_dual`** · **SSOT flip deferred to L5** · cite prove dual_pass knife + honesty knife |
| **What this knife is not** | **Not** the prove dual_pass knife (`r4-funnel-real-close` · `105b264` / `d994c36`) · **not** the honesty knife (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`) · **not** claiming R4/FUNNEL closed · **not** MS3 closes R4 · **not** G-R4-5 dual-closed · **not** R1/R2 close · **not** HA/suite · **not** self-written `post_prove_dual_pass` · **not** SSOT flip this phase |
| **R4/FUNNEL closed after prove EXIT=0?** | **NO** — prove green ≠ R4 closed · Ban 假关 · **R4/FUNNEL STILL OPEN until prove + post-prove dual + explicit close authorize** |
| **Prove dual_pass `105b264` ⇒ R4 closed?** | **NO** · Ban wash prove dual_pass into product close · Ban claim closed from `105b264` / `d994c36` |
| **MS3 ⇒ R4 closed?** | **NO** · **MS3 ≠ R4 closed** |
| **G-R4-5 dual-claim?** | **STILL OPEN until evidence** · Ban claiming dual-closed |
| **SSOT flip this phase?** | **NO** — L5 only after post-prove dual + explicit close authorize · targets remain **NOT flipped** |
| **Now** | **`executed:awaiting_post_prove_dual`** · Ban self-write `post_prove_dual_pass` · `releaseEvidence=false` |

---

## 1. Contra — existing R4 / F8 / prove dual_pass / honesty knife（pointers · honesty retained）

| Artifact | Path | Honest status (this execute) |
|----------|------|------------------------------|
| **Prove dual_pass knife prior (≠ this)** | `harness/r4-funnel-real-close.md` | **`post_prove_dual_pass`** · dual on **`105b264`** · tip nail **`d994c36`** · EXIT **5×0** · prove honesty only · **R4/FUNNEL product NOT closed** · **SSOT NOT flipped** · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN** |
| **Honesty knife prior (≠ this)** | `harness/r4-funnel-remainder-honesty.md` | **`post_prove_dual_pass`** · dual on **`669bca4`** · tip **`42f77c1`** · docs honesty only · **R4/FUNNEL product NOT closed** |
| R4 parent status | `harness/r4-domain-isolation-status.md` §2 G-R4-5 · §13 F8 | **题域隔离 NOT closed** · **G-R4-5 STILL OPEN** · **NOT flipped** |
| F8 MS3 | `harness/r4-f8-p-meta-ms3-deploy-product.md` | **`post_prove_dual_pass`** · MS3 true · **MS3 ≠ R4 closed** · dual-claim STILL OPEN · **NOT flipped** |
| Canonical R4 prove | `harness/r4-domain-isolation.md` | pass ≠ R4 closed · **NOT flipped** |
| m4 §R4 · GAP-RAG-04 | `m4-rag-hard-gates.md` §R4 · `gap-bug-backlog.md` | dual-claim evidence still open · **NOT flipped** |
| FUNNEL checklist | `execution-master-checklist.md` RAG-FUNNEL-01…08 | 01A ≠ 01 · 02…08 open · Ban invent covered · **NOT flipped** |
| Order pin | R1 / R2-SSOT parallel · **R4/FUNNEL explicit close** | Prove dual_pass done · **product still open** |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R4/FUNNEL-SSOT prove dual_pass nailed · **this knife = executed:awaiting_post_prove_dual** |

**Headline**: **R4/FUNNEL STILL OPEN**. Prove dual_pass knife (`105b264` / `d994c36`) = prove honesty only · **SSOT NOT flipped**. Honesty knife (`42f77c1` / `669bca4`) = docs honesty only. This knife = standing-authorized L3 coding+prove for **explicit close / SSOT flip** — **SSOT flip still deferred to L5** after post-prove dual + explicit close authorize.

---

## 2. Prove-await-authorize lifecycle（L3 executed · L4/L5 pending）

| Phase | Gate | This execute |
|-------|------|--------------|
| **L0** | REQUEST pair open · `not_run:pre_dual` | **done** · REQUEST SHA **`133d952`** |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **done** · BOTH **pass** on **`133d952`** |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding 假关 | **done** · meetwise standing authorize R4/FUNNEL explicit-close coding+prove (L3) |
| **L3** | Standing coding + prove under authorize · Ban invent EXIT | **this commit** · EXIT **5×0** · Ban self-write `post_prove_dual_pass` |
| **L4** | Post-prove dual · Ban self-approve | **awaiting** · REQUEST stubs open |
| **L5** | **Only then** SSOT flip · explicit close authorize · Ban 假关 | **forbidden until L4** · **NOT flipped** |

| # | Gate | Must be true before any "R4/FUNNEL closed" / SSOT flip claim | This execute |
|---|------|------------------------------------------------------|--------------|
| P1 | Cite prove dual_pass knife `r4-funnel-real-close` · `post_prove_dual_pass` on `105b264` / tip `d994c36` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer retained |
| P2 | Cite honesty knife `r4-funnel-remainder-honesty` · `42f77c1` / `669bca4` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer retained |
| P3 | Cite F8: MS3 true · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** | yes | pointer retained |
| P4 | Explicit Ban 假关 · Ban claim closed from prove dual_pass `105b264` / `d994c36` or honesty knife | yes | pinned |
| P5 | Prove CMD table honesty · EXIT recorded under standing authorize | yes | §3 · EXIT **5×0** |
| P6 | SSOT flip plan targets listed · **not flipped** | yes | §4 · **NOT flipped** |
| P7 | Dual-claim / FUNNEL-01…08 evidence path · Ban forge | **still open** | must survive |
| P8 | 题域隔离 / wrong_track production honesty · Ban flip without authorize | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve · Ban self-write `post_prove_dual_pass` | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** · L3 done · L4/L5 pending |

**Ban**: implementer must **not** write R4/FUNNEL pass-close · must **not** flip SSOT · must **not** claim R4 / FUNNEL / G-R4-5 dual-closed · must **not** self-write `post_prove_dual_pass` · must **not** claim closed from prove dual_pass `105b264` / `d994c36` · must **not** claim closed from honesty knife `42f77c1` / `669bca4` · must **not** claim MS3 closes R4.

---

## 3. Prove CMD honesty（executed under standing authorize）

| CMD | EXIT | Run status | Honest read |
|-----|------|------------|-------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | **executed** | Honesty pin ≠ R4 closed · ≠ 题域已隔离 |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | **0** | **executed** | F8 MS3 · **MS3 ≠ R4 closed** · **G-R4-5 STILL OPEN** |
| `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | **executed** | MS2 · ≠ dual-claim closed |
| `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | **executed** | MS1 · ≠ dual-claim closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **executed** | §R4 doc gate · ≠ product close |
| Dual-claim / FUNNEL-01…08 evidence | evidence required | **missing · STILL OPEN** | Ban forge · Ban 假关 |
| Docs / SSOT flip edits | n/a | **forbidden until post-prove dual + explicit close authorize** | **no silent flip** |

Receipt: `../receipts/2026-09-17-r4-funnel-explicit-close-ssot-flip-prove.md`

**Ban**: do not invent prove EXIT · Dual PASS ≠ prove green ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · prove EXIT=0 ≠ authorize L5 SSOT flip alone · Ban wash prior prove dual_pass `105b264` into product close.

---

## 4. SSOT flip target list（plan retained · **NOT flipped this execute**）

| Target | Flip intent (after post-prove dual + explicit close authorize) | Now |
|--------|---------------------------------------------------------------|-----|
| `harness/r4-domain-isolation-status.md` §2 G-R4-5 · overall | Align close language honestly if authorize says so | **NOT flipped** · **G-R4-5 STILL OPEN** |
| `harness/r4-f8-p-meta-ms3-deploy-product.md` · dual-claim | Refresh only with evidence · Ban silent G-R4-5 close | **NOT flipped** |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | Product / backlog honesty | **NOT flipped** |
| `execution-master-checklist.md` RAG-FUNNEL-01…08 · hard gates | Align only with evidence · Ban invent covered | **NOT flipped** |
| `harness/r4-funnel-remainder-honesty.md` | Note explicit-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `harness/r4-funnel-real-close.md` | Note explicit-close knife distinct · Ban washing dual_pass into closed | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this knife `executed:awaiting_post_prove_dual`** · **R4/FUNNEL STILL OPEN** |
| `north-star-ha.md` | Align only after L5 authorize | **NOT flipped** |

---

## 5. Pins (must survive post-prove dual)

1. **≠ prove dual_pass knife** — `r4-funnel-real-close` = prove honesty already `post_prove_dual_pass` (`105b264` / tip `d994c36`) · this = **R4/FUNNEL explicit close / SSOT flip** prove-await path · Ban wash `105b264` close  
2. **≠ honesty knife** — `r4-funnel-remainder-honesty` = docs honesty (`42f77c1` / `669bca4`) · **≠** this knife  
3. **R4/FUNNEL STILL OPEN** until **prove + post-prove dual + explicit close authorize** · Ban claiming closed from Dual PASS / prove EXIT=0 / prove dual_pass / honesty knife  
4. **MS3 ≠ R4 closed** · Ban claiming MS3 / F8 closes R4  
5. **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claiming dual-closed  
6. **Ban 假关** · **Dual PASS ≠ coding 假关** · Ban self-approve · **Ban self-write `post_prove_dual_pass`**  
7. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
8. Ban invent prove EXIT / silent flip / invent FUNNEL covered  
9. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed · ≠ 题域已隔离 · **SSOT targets NOT flipped this phase** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
10. Status stays **`executed:awaiting_post_prove_dual`** until experts write post-prove pass · Ban elevating prove dual_pass to closed · **SSOT flip STILL DEFERRED to L5**

---

## 6. REQUEST pair / post-prove stubs

| Phase | Expert | Path |
|-------|--------|------|
| pre-exec REQUEST | `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-e2e-ha.md` |
| pre-exec REQUEST | `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-mw-rag-route.md` |
| post-prove REQUEST | `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-post-prove-mw-e2e-ha.md` |
| post-prove REQUEST | `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r4-funnel-explicit-close-ssot-flip-post-prove-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| standing coding+prove | **`executed:awaiting_post_prove_dual`** · EXIT **5×0** · **SSOT NOT flipped** · Ban self-write `post_prove_dual_pass` |

---

## 8. Non-claims

Not R4 closed · not FUNNEL dual-closed · not G-R4-5 dual-closed · not MS3 closes R4 · not SSOT flipped · not prove dual_pass re-open · not claim closed from `105b264` / `d994c36` · not claim closed from `42f77c1` / `669bca4` · not R1/R2 closed · not HA · not suite · Dual PASS ≠ authorize L5 · Ban 假关 · Ban false green · Ban self-write `post_prove_dual_pass` · `releaseEvidence=false`

---

*Harness · R4/FUNNEL explicit close / SSOT flip · 2026-09-17 (~20:15 PT) · executed:awaiting_post_prove_dual · ≠ prove dual_pass knife 105b264/d994c36 · ≠ honesty knife 42f77c1/669bca4 · R4/FUNNEL STILL OPEN until prove+post-prove dual+explicit close auth · MS3 ≠ R4 closed · G-R4-5 STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · SSOT NOT flipped · Ban self-write post_prove_dual_pass · EXIT 5×0*
