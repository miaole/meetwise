# Harness — **R4/FUNNEL real close**（prove + standing authorize · **post_prove_dual_pass**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~20:07 PT) · execute ~19:59 PT · post-prove dual BOTH PASS · nail authorized  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ FUNNEL dual-closed** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关** · **Ban self-approve**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** on REQUEST SHA **`842311f`** · standing authorize coding+prove · post-prove dual **BOTH PASS** on prove SHA **`105b264`**)  
**Note**: **≠ honesty knife** — `harness/r4-funnel-remainder-honesty.md` already **`post_prove_dual_pass`** at tip **`42f77c1`** (dual on REQUEST tip **`669bca4`**) · docs honesty only · **R4/FUNNEL product STILL OPEN** · **MS3 ≠ R4 closed** · **G-R4-5 dual-claim STILL OPEN** · this knife = **separate** real close / prove-await-authorize / SSOT-flip path · **SSOT flip NOT executed** (L5 waits **explicit close authorize** · separate REQUEST)  
**Slice**: `../r4-funnel-real-close.slice.md`  
**Eval**: `../eval/r4-funnel-real-close.eval.md`  
**Receipt**: `../receipts/2026-09-17-r4-funnel-real-close-prove.md`  
**Authority**: meetwise — standing authorize **R4/FUNNEL 真关闸 coding+prove** after pre-exec dual on REQUEST **`842311f`** · prove EXIT **5×0** · post-prove dual BOTH PASS · authorized docs nail to `post_prove_dual_pass` · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
**Honesty**: Pre-exec dual PASS ≠ R4 closed · prove EXIT=0 ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · post-prove dual BOTH PASS = prove honesty nail only · **SSOT targets NOT flipped** · Ban 假关 · `releaseEvidence=false` · ≠HA · ≠suite · Ban self-approve · **≠ wash into R4/FUNNEL product closed** · **≠** claim closed from honesty knife `42f77c1` / `669bca4`

---

## Dual receipts (archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-r4-funnel-real-close-mw-e2e-ha.md` | **pass** (docs gate) on REQUEST **`842311f`** |
| `mw-rag-route` | `../reviews/2026-09-17-r4-funnel-real-close-mw-rag-route.md` | **pass** (docs gate) on REQUEST **`842311f`** |
| `mw-e2e-ha` (post-prove) | `../reviews/2026-09-17-r4-funnel-real-close-post-prove-mw-e2e-ha.md` | **pass** on prove SHA **`105b264`** |
| `mw-rag-route` (post-prove) | `../reviews/2026-09-17-r4-funnel-real-close-post-prove-mw-rag-route.md` | **pass** on prove SHA **`105b264`** |

REQUEST stubs (historical): `REQUEST-2026-09-17-r4-funnel-real-close-post-prove-mw-{e2e-ha,rag-route}.md`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Standing-authorized prove + post-prove dual for R4/FUNNEL real close / SSOT flip path · EXIT **5×0** · status **`post_prove_dual_pass`** · **SSOT flip deferred to L5 / explicit close authorize** |
| **What this knife is not** | **Not** the honesty knife (`r4-funnel-remainder-honesty` · `42f77c1` / `669bca4`) · **not** claiming R4/FUNNEL closed · **not** claiming MS3 closes R4 · **not** claiming G-R4-5 dual-closed · **not** R1/R2 close · **not** HA/suite · **not** L5 SSOT flip |
| **R4/FUNNEL closed after prove+dual?** | **NO** — prove green + post-prove dual ≠ R4 closed · Ban 假关 · **R4/FUNNEL STILL OPEN until prove + post-prove dual + explicit close authorize** |
| **MS3 ⇒ R4 closed?** | **NO** · **MS3 ≠ R4 closed** · Ban claim closed from F8 / MS3 true |
| **G-R4-5 dual-claim?** | **STILL OPEN until evidence** · F8 `post_prove_dual_pass` · MS1/MS2/MS3 true · product FUNNEL classifier true · dual-claim **still open** · Ban claiming closed from this nail |
| **SSOT flip this phase?** | **NO** — L5 only after **explicit close authorize** · targets remain **NOT flipped** |
| **Now** | **`post_prove_dual_pass`** · Ban假关 · `releaseEvidence=false` · ≠HA · **R4/FUNNEL STILL OPEN** · **SSOT NOT flipped** |

---

## 1. Contra — existing R4 / F8 / honesty knife（pointers · honesty retained）

| Artifact | Path | Honest status (this nail) |
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
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R4/FUNNEL rem honesty closed · **this knife = post_prove_dual_pass** · **R4/FUNNEL STILL OPEN** · **SSOT NOT flipped** |

**Headline**: **R4/FUNNEL STILL OPEN**. Honesty knife (`42f77c1` / `669bca4`) = docs honesty only. This nail = L3 prove + L4 post-prove dual BOTH PASS · **SSOT flip still forbidden** until L5 **explicit close authorize**.

---

## 2. Prove-await-authorize lifecycle（this nail advances L4）

| Phase | Gate | This nail |
|-------|------|-----------|
| **L0** | REQUEST pair open · `not_run:pre_dual` | done (`842311f`) |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **PASS** on `842311f` |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding 假关 | **yes** — meetwise authorize R4/FUNNEL 真关闸 coding+prove |
| **L3** | Standing coding + prove under authorize · Ban invent EXIT | **done** · prove EXIT **5×0** · **no product SSOT flip** |
| **L4** | Post-prove dual · Ban self-approve | **BOTH PASS** on prove SHA **`105b264`** · authorized nail `post_prove_dual_pass` |
| **L5** | **Only then** SSOT flip · **explicit close authorize** · Ban 假关 | **forbidden until explicit close authorize** · targets **NOT flipped** |

| # | Gate | Must be true before any "R4/FUNNEL closed" / SSOT flip claim | This nail |
|---|------|------------------------------------------------------|-----------|
| P1 | Cite honesty knife `r4-funnel-remainder-honesty` · `post_prove_dual_pass` on `669bca4` / tip `42f77c1` · **≠** this knife · **≠** R4/FUNNEL product closed | yes | pointer retained |
| P2 | Cite R4 status + F8 · MS3 true · **MS3 ≠ R4 closed** · Ban claim MS3 closes R4 | yes | retained |
| P3 | Cite **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claim dual-closed from F8 / honesty | yes | retained |
| P4 | Explicit Ban 假关 · Ban claim closed from honesty knife Dual PASS / `42f77c1` / `669bca4` | yes | pinned |
| P5 | Prove CMD table honesty · re-run under standing authorize | yes | §3 · EXIT **5×0** |
| P6 | SSOT flip plan targets listed · **not flipped until L5** | yes | §4 · **NOT flipped** |
| P7 | Dual-claim / FUNNEL-01…08 evidence path · Ban forge · Ban invent covered | **still open** | Ban forge · Ban 假关 |
| P8 | 题域隔离 / wrong_track production / parallel G-R4-* honesty · Ban silent close | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** · at L4 done · L5 awaits explicit close |

**Ban**: implementer must **not** write R4/FUNNEL pass-close · must **not** flip SSOT this phase · must **not** claim R4 / FUNNEL / G-R4-5 dual-closed · must **not** claim MS3 closes R4 · must **not** claim closed from honesty knife `42f77c1` / `669bca4` · must **not** wash `post_prove_dual_pass` into R4/FUNNEL product closed.

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
| Docs / SSOT flip edits | **NOT flipped** | **forbidden until explicit close authorize** |

Receipt: `../receipts/2026-09-17-r4-funnel-real-close-prove.md` · Prove SHA **`105b264`**

**Ban**: do not invent prove EXIT · Dual PASS ≠ prove green ≠ R4 closed ≠ FUNNEL dual-closed ≠ G-R4-5 dual-closed · prove EXIT=0 ≠ authorize L5 SSOT flip alone · post_prove_dual_pass ≠ R4/FUNNEL product closed · Ban claim MS3 closes R4.

---

## 4. SSOT flip target list（plan retained · **NOT flipped this nail**）

| Target | Flip intent (after explicit close authorize) | Now |
|--------|----------------------------------------------|-----|
| `harness/r4-domain-isolation-status.md` §2 G-R4-5 · overall | Align close language honestly if authorize says so | **NOT flipped** · **G-R4-5 STILL OPEN** · **R4/FUNNEL STILL OPEN** |
| `harness/r4-f8-p-meta-ms3-deploy-product.md` · dual-claim | Refresh only with evidence · Ban silent G-R4-5 close | **NOT flipped** |
| `m4-rag-hard-gates.md` §R4 · GAP-RAG-04 | Product / backlog honesty | **NOT flipped** |
| `execution-master-checklist.md` RAG-FUNNEL-01…08 · hard gates | Align only with evidence · Ban invent covered | **NOT flipped** |
| `harness/r4-funnel-remainder-honesty.md` | Note real-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this knife `post_prove_dual_pass`** · **R4/FUNNEL STILL OPEN** · **SSOT NOT flipped** |
| `north-star-ha.md` | Align only after L5 authorize | **NOT flipped** |

---

## 5. Pins (must survive · Ban wash into R4 closed)

1. **≠ honesty knife** — `r4-funnel-remainder-honesty` = docs honesty already `post_prove_dual_pass` (`42f77c1` / dual `669bca4`) · this = **R4/FUNNEL real close** prove path  
2. **R4/FUNNEL STILL OPEN** until **prove + post-prove dual + explicit close authorize** · Ban claiming closed from Dual PASS / prove EXIT=0 / honesty knife / this `post_prove_dual_pass`  
3. **MS3 ≠ R4 closed** · Ban claiming MS3 / F8 closes R4  
4. **G-R4-5 dual-claim STILL OPEN until evidence** · Ban claiming dual-closed from F8 / honesty / this nail  
5. **Ban 假关** · **Dual PASS ≠ coding 假关** · Ban self-approve · Ban wash dual_pass into product close  
6. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
7. Ban invent prove EXIT / silent flip / invent FUNNEL covered  
8. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed · ≠ 题域已隔离  
9. **SSOT targets NOT flipped this phase** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
10. Status **`post_prove_dual_pass`** = prove honesty dual only · **≠ R4/FUNNEL product closed** · L5 awaits **explicit close authorize**

---

## 6. Dual receipts（archived）

| Phase | Expert | Path | Verdict |
|-------|--------|------|---------|
| pre-exec | `mw-e2e-ha` | `../reviews/2026-09-17-r4-funnel-real-close-mw-e2e-ha.md` | **pass** on `842311f` |
| pre-exec | `mw-rag-route` | `../reviews/2026-09-17-r4-funnel-real-close-mw-rag-route.md` | **pass** on `842311f` |
| post-prove | `mw-e2e-ha` | `../reviews/2026-09-17-r4-funnel-real-close-post-prove-mw-e2e-ha.md` | **pass** on **`105b264`** |
| post-prove | `mw-rag-route` | `../reviews/2026-09-17-r4-funnel-real-close-post-prove-mw-rag-route.md` | **pass** on **`105b264`** |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| standing coding+prove + post-prove dual | **`post_prove_dual_pass`** · dual on prove SHA **`105b264`** · EXIT **5×0** · **SSOT NOT flipped** · **R4/FUNNEL STILL OPEN** · Ban假关 |

---

## 8. Non-claims

Not R4 closed · not FUNNEL dual-closed · not G-R4-5 dual-closed · not MS3 closes R4 · not flip authorized · not SSOT flipped · not honesty knife re-open · not claim closed from `42f77c1` / `669bca4` · not wash `post_prove_dual_pass` into R4/FUNNEL product closed · not R1/R2 closed · not HA · not suite · Dual PASS ≠ authorize L5 · Ban 假关 · Ban false green · Ban self-approve · `releaseEvidence=false`

---

*Harness · R4/FUNNEL real close · 2026-09-17 (~20:07 PT) · post_prove_dual_pass · dual on 105b264 · EXIT 5×0 · ≠ honesty knife 42f77c1/669bca4 · R4/FUNNEL STILL OPEN until prove+post-prove dual+explicit close auth · MS3 ≠ R4 closed · G-R4-5 dual-claim STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · SSOT NOT flipped · Ban self-approve · Ban wash into R4 closed*
