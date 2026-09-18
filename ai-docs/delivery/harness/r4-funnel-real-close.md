# Harness — **R4/FUNNEL real close**（prove-await-authorize · standing coding+prove · **awaiting post-prove dual**）

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~19:59 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ FUNNEL dual-closed** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关** · **Ban self-write `post_prove_dual_pass`**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** on REQUEST SHA **`842311f`** · standing authorize coding+prove · **Ban self-approve** · **Ban self-write `post_prove_dual_pass`**)  
**Note**: **≠ honesty knife** — `harness/r4-funnel-remainder-honesty.md` already **`post_prove_dual_pass`** at tip **`42f77c1`** (dual on REQUEST tip **`669bca4`**) · docs honesty only · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · this knife = **separate** real close / prove-await-authorize / SSOT-flip path · **SSOT flip NOT executed this phase** (L5 waits post-prove dual + explicit close authorize)  
**Slice**: `../r4-funnel-real-close.slice.md`  
**Eval**: `../eval/r4-funnel-real-close.eval.md`  
**Receipt**: `../receipts/2026-09-17-r4-funnel-real-close-prove.md`  
**Authority**: meetwise — standing authorize **R4/FUNNEL 真关闸 coding+prove** after pre-exec dual on REQUEST **`842311f`** · prove EXIT recorded · **await post-prove dual** · **do NOT self-write `post_prove_dual_pass`** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
**Honesty**: Pre-exec dual PASS ≠ R4 closed · prove EXIT=0 ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · **SSOT targets NOT flipped** · Ban 假关 · `releaseEvidence=false` · ≠HA · ≠suite · Ban self-write `post_prove_dual_pass` · **≠** claim closed from honesty knife `42f77c1` / `669bca4`

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-r4-funnel-real-close-mw-e2e-ha.md` | **pass** (docs gate) on REQUEST **`842311f`** |
| `mw-rag-route` | `../reviews/2026-09-17-r4-funnel-real-close-mw-rag-route.md` | **pass** (docs gate) on REQUEST **`842311f`** |

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Standing-authorized prove-await path for R4/FUNNEL real close / SSOT flip · run harness prove CMDs · record EXIT · leave **`executed:awaiting_post_prove_dual`** · **SSOT flip deferred to L5** |
| **What this knife is not** | **Not** the honesty knife (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`) · **not** claiming R4/FUNNEL closed · **not** claiming MS3 closes R4 · **not** claiming G-R4-5 dual-closed · **not** R1/R2 close · **not** HA/suite · **not** self-written `post_prove_dual_pass` |
| **R4/FUNNEL closed after prove EXIT=0?** | **NO** — prove green ≠ R4 closed · Ban 假关 · **R4/FUNNEL STILL OPEN until prove + post-prove dual + explicit close authorize** |
| **MS3 ⇒ R4 closed?** | **NO** · **MS3 ≠ R4 closed** · Ban claim closed from F8 / MS3 true |
| **G-R4-5 dual-claim?** | **STILL OPEN until evidence** · F8 `post_prove_dual_pass` · MS1/MS2/MS3 true · product FUNNEL classifier true · dual-claim **still open** · Ban claiming closed from this execute |
| **SSOT flip this phase?** | **NO** — L5 only after post-prove dual + explicit close authorize · targets remain **NOT flipped** |
| **Now** | **`executed:awaiting_post_prove_dual`** · Ban self-write `post_prove_dual_pass` · `releaseEvidence=false` |

---

## 1. Contra — existing R4 / F8 / honesty knife（pointers · honesty retained）

| Artifact | Path | Honest status (this execute) |
|----------|------|------------------------------|
| **Honesty knife prior (≠ this)** | `harness/r4-funnel-remainder-honesty.md` | **`post_prove_dual_pass`** · dual on **`669bca4`** · tip nail **`42f77c1`** · **docs honesty only** · **R4/FUNNEL product NOT closed** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** |
| R4 parent status | `harness/r4-domain-isolation-status.md` §2 G-R4-5 · §13 F8 | **题域隔离 NOT closed** · **G-R4-5 STILL OPEN** · F8 MS3 true · dual-claim STILL OPEN · blocks R4 close · **NOT flipped** |
| F8 MS3 | `harness/r4-f8-p-meta-ms3-deploy-product.md` | **`post_prove_dual_pass`** · MS1/MS2/MS3 true · HEAD `927cfea` · **≠ R4 closed** · **≠ G-R4-5 dual-closed** · **NOT flipped to G-R4-5 closed** |
| F7 / F6 | `harness/r4-f7-…` · `harness/r4-f6-…` | MS2 served · MS1 wired · prior `post_prove_dual_pass` · ≠ dual-claim closed |
| Canonical R4 prove | `harness/r4-domain-isolation.md` · `pnpm mysql-stack:r4-domain-isolation:prove` | this execute **EXIT=0** · honesty pin · **≠ R4 closed** · **≠ 题域已隔离** |
| m4 §R4 · GAP-RAG-04 | `m4-rag-hard-gates.md` §R4 · `gap-bug-backlog.md` | R4 / FUNNEL close needs dual-claim evidence · **still open** · **NOT flipped** |
| FUNNEL checklist | `execution-master-checklist.md` RAG-FUNNEL-01…08 · `north-star-hard-gates.md` | 01A ≠ 01 · 02…08 open · Ban invent covered · **NOT flipped** |
| Parallel PREREQ honesty | G-R4-1 / G-R4-2 / G-R4-3 (R1) / G-R4-4 (R2) | Still block R4 close · Ban folding into closed |
| Order pin | R1 / R2-SSOT parallel · **R4/FUNNEL real close** | Honesty rem closed · **product still open** |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R4/FUNNEL rem honesty closed · **this knife = executed:awaiting_post_prove_dual** |

**Headline**: **R4/FUNNEL STILL OPEN**. Honesty knife (`42f77c1` / `669bca4`) = docs honesty only. This execute = L3 standing coding+prove under authorize · **SSOT flip still forbidden** until L4 post-prove dual + L5 explicit close authorize.

---

## 2. Prove-await-authorize lifecycle（this execute advances L3）

| Phase | Gate | This execute |
|-------|------|--------------|
| **L0** | REQUEST pair open · `not_run:pre_dual` | done (`842311f`) |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **PASS** on `842311f` |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding 假关 | **yes** — meetwise authorize R4/FUNNEL 真关闸 coding+prove |
| **L3** | Standing coding + prove under authorize · Ban invent EXIT | **this commit** · prove EXIT recorded · **no product SSOT flip** |
| **L4** | Post-prove dual · Ban self-write `post_prove_dual_pass` | **awaiting** · REQUEST stubs opened |
| **L5** | **Only then** SSOT flip · explicit close authorize · Ban 假关 | **forbidden until L4** · targets **NOT flipped** |

| # | Gate | Must be true before any "R4/FUNNEL closed" / SSOT flip claim | This execute |
|---|------|------------------------------------------------------|--------------|
| P1 | Cite honesty knife `r4-funnel-remainder-honesty` · `post_prove_dual_pass` on `669bca4` / tip `42f77c1` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer retained |
| P2 | Cite R4 status + F8 · MS3 true · **MS3 ≠ R4 closed** · Ban claim MS3 closes R4 | yes | retained |
| P3 | Cite **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claim dual-closed from F8 / honesty | yes | retained |
| P4 | Explicit Ban 假关 · Ban claim closed from honesty knife Dual PASS / `42f77c1` / `669bca4` | yes | pinned |
| P5 | Prove CMD table honesty · re-run under standing authorize | yes | §3 · EXIT **5×0** |
| P6 | SSOT flip plan targets listed · **not flipped until L5** | yes | §4 · **NOT flipped** |
| P7 | Dual-claim / FUNNEL-01…08 evidence path · Ban forge · Ban invent covered | **still open** | Ban forge · Ban 假关 |
| P8 | 题域隔离 / wrong_track production / parallel G-R4-* honesty · Ban silent close | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve · Ban self-write `post_prove_dual_pass` | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** · at L3→L4 await |

**Ban**: implementer must **not** write R4/FUNNEL pass-close · must **not** flip SSOT this phase · must **not** claim R4 / FUNNEL / G-R4-5 dual-closed · must **not** claim MS3 closes R4 · must **not** self-write `post_prove_dual_pass` · must **not** claim closed from honesty knife `42f77c1` / `669bca4`.

---

## 3. Prove CMD（EXIT 5×0 · see receipt）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | Honesty pin ≠ R4 closed · ≠ 题域已隔离 |
| `pnpm r4-p-meta-ms3-deploy-product:prove` | **0** | F8 MS3 · **MS3 ≠ R4 closed** · ≠ G-R4-5 dual-closed · prove assertion aligned to F8 `post_prove_dual_pass` |
| `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | MS2 · ≠ dual-claim closed |
| `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | MS1 · ≠ dual-claim closed |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R4 doc gate · ≠ product close |
| Dual-claim / FUNNEL-01…08 evidence | **missing · STILL OPEN** | Ban forge · Ban 假关 · Ban invent covered |
| Docs / SSOT flip edits | **NOT flipped** | **forbidden until post-prove dual + explicit close authorize** |

Receipt: `../receipts/2026-09-17-r4-funnel-real-close-prove.md`

**Ban**: do not invent prove EXIT · Dual PASS ≠ prove green ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · prove EXIT=0 ≠ authorize L5 SSOT flip alone · Ban claim MS3 closes R4.

---

## 4. SSOT flip target list（plan retained · **NOT flipped this execute**）

| Target | Flip intent (after post-prove dual + explicit close authorize) | Now |
|--------|---------------------------------------------------------------|-----|
| `harness/r4-domain-isolation-status.md` §2 G-R4-5 · overall | Align close language honestly if authorize says so | **NOT flipped** · **G-R4-5 STILL OPEN** · **R4/FUNNEL STILL OPEN** |
| `harness/r4-f8-p-meta-ms3-deploy-product.md` · dual-claim | Refresh only with evidence · Ban silent G-R4-5 close | **NOT flipped** |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | Product / backlog honesty | **NOT flipped** |
| `execution-master-checklist.md` RAG-FUNNEL-01…08 · hard gates | Align only with evidence · Ban invent covered | **NOT flipped** |
| `harness/r4-funnel-remainder-honesty.md` | Note real-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this knife `executed:awaiting_post_prove_dual`** · **R4/FUNNEL STILL OPEN** |
| `north-star-ha.md` | Align only after L5 authorize | **NOT flipped** |

---

## 5. Pins (must survive post-prove dual)

1. **≠ honesty knife** — `r4-funnel-remainder-honesty` = docs honesty already `post_prove_dual_pass` (`42f77c1` / dual `669bca4`) · this = **R4/FUNNEL real close** prove-await path  
2. **R4/FUNNEL STILL OPEN** until **prove + post-prove dual + explicit close authorize** · Ban claiming closed from Dual PASS / prove EXIT=0 / honesty knife  
3. **MS3 ≠ R4 closed** · Ban claiming MS3 / F8 closes R4  
4. **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claiming dual-closed from F8 / honesty / this execute  
5. **Ban 假关** · **Dual PASS ≠ coding 假关** · Ban self-approve · **Ban self-write `post_prove_dual_pass`**  
6. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
7. Ban invent prove EXIT / silent flip / invent FUNNEL covered  
8. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed · ≠ 题域已隔离  
9. **SSOT targets NOT flipped this phase** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
10. Status stays **`executed:awaiting_post_prove_dual`** until experts write post-prove pass · Ban folding R1/R2 into R4 closed · Ban elevating honesty to closed

---

## 6. REQUEST pair / post-prove stubs

| Phase | Expert | Path |
|-------|--------|------|
| pre-exec REQUEST | `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r4-funnel-real-close-mw-e2e-ha.md` |
| pre-exec REQUEST | `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r4-funnel-real-close-mw-rag-route.md` |
| post-prove REQUEST | `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r4-funnel-real-close-post-prove-mw-e2e-ha.md` |
| post-prove REQUEST | `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r4-funnel-real-close-post-prove-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| standing coding+prove | **`executed:awaiting_post_prove_dual`** · EXIT **5×0** · **SSOT NOT flipped** · Ban self-write `post_prove_dual_pass` |

---

## 8. Non-claims

Not R4 closed · not FUNNEL dual-closed · not G-R4-5 dual-closed · not MS3 closes R4 · not flip authorized · not SSOT flipped · not honesty knife re-open · not claim closed from `42f77c1` / `669bca4` · not R1/R2 closed · not HA · not suite · Dual PASS ≠ authorize L5 · Ban 假关 · Ban false green · Ban self-write `post_prove_dual_pass` · `releaseEvidence=false`

---

*Harness · R4/FUNNEL real close · 2026-09-17 (~19:59 PT) · executed:awaiting_post_prove_dual · ≠ honesty knife 42f77c1/669bca4 · R4/FUNNEL STILL OPEN until prove+post-prove dual+explicit close auth · MS3 ≠ R4 closed · G-R4-5 dual-claim STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · SSOT NOT flipped · Ban self-write post_prove_dual_pass · EXIT 5×0*
