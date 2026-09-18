# Harness — **R1 explicit close / SSOT flip**（prove-await-authorize · REQUEST open）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~20:00 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R1 STILL OPEN** · **G-R4-3 STILL OPEN** · **≠ R1 closed** · **≠ flip default** · **≠ coding authorized** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关** · **Ban self-approve**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · coding/prove/SSOT flip waits **standing authorize after dual** · **zero coding / zero prove / no SSOT flip yet**）  
**Note**: **≠ prove dual_pass knife** — `harness/r1-real-close-ssot-flip.md` already **`post_prove_dual_pass`** at tip **`30d93dc`** (dual on prove SHA **`0deb5fb`**) · prove honesty only · **R1 product NOT closed** · **SSOT NOT flipped** · **G-R4-3 STILL OPEN** · this knife opens the **separate** explicit close / SSOT-flip REQUEST · **≠ docs knife** (`r1-close-authorize-receipt` · `f9119fe` / `2316bbc`)  
**Slice**: `../r1-explicit-close-ssot-flip.slice.md`  
**Eval**: `../eval/r1-explicit-close-ssot-flip.eval.md`  
**Authority**: meetwise — docs-only REQUEST open for **R1 explicit close / SSOT flip** path · Ban claiming R1 closed from Dual PASS or from prove dual_pass knife · Ban 假关 · Ban wash `0deb5fb` / `30d93dc` into product close · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
**Honesty**: This open = REQUEST prep only · **R1 STILL OPEN** until **prove + dual + explicit close authorize** · **G-R4-3 STILL OPEN until evidence** · **no** SSOT flip in this commit · Dual PASS ≠ authorize coding · **≠** claim closed from prove dual_pass knife `0deb5fb` / tip `30d93dc` · **≠** claim closed from docs knife `f9119fe` / `2316bbc`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST open: **prove-await-authorize lifecycle** for *future* R1 **explicit close / SSOT pointer flip** · cite prove dual_pass knife + docs knife · pin Dual PASS ≠ coding 假关 |
| **What this knife is not** | **Not** the prove dual_pass knife (`r1-real-close-ssot-flip` · `0deb5fb` / `30d93dc`) · **not** the docs knife (`r1-close-authorize-receipt` · `f9119fe` / `2316bbc`) · **not** coding · **not** prove run · **not** SSOT flip now · **not** claiming R1 closed · **not** claiming G-R4-3 closed · **not** R2/R4/FUNNEL close · **not** HA/suite |
| **R1 closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **Ban 假关** · **R1 STILL OPEN until prove + dual + explicit close authorize** |
| **Prove dual_pass `0deb5fb` ⇒ R1 closed?** | **NO** · Ban wash prove dual_pass into product close · Ban claim closed from `0deb5fb` / `30d93dc` |
| **G-R4-3?** | **STILL OPEN until evidence** · PR1-A true · **PR1-B/C false** · Ban claiming closed from this REQUEST |
| **Coding / prove / SSOT flip** | **Forbidden** on Dual PASS alone · waits **standing authorize after dual** (not self-serve) · then prove · then **post-prove dual** · **only then** SSOT flip |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove · **no SSOT flip** · Ban self-approve · **releaseEvidence=false** |

---

## 1. Contra — existing R1 / F4 / prove dual_pass / docs knife（pointers · do not rewrite here）

| Artifact | Path | Honest status (as of open) |
|----------|------|----------------------------|
| **Prove dual_pass knife prior (≠ this)** | `harness/r1-real-close-ssot-flip.md` | **`post_prove_dual_pass`** · dual on **`0deb5fb`** · tip nail **`30d93dc`** · EXIT **3×0** · prove honesty only · **R1 product NOT closed** · **SSOT NOT flipped** · **G-R4-3 STILL OPEN** |
| **Docs knife prior (≠ this)** | `harness/r1-close-authorize-receipt.md` | **`post_prove_dual_pass`** · dual on **`2316bbc`** · close **`f9119fe`** · checklist only · **R1 product NOT closed** |
| Canonical R1 prove contract | `harness/r1-tech-role-fail-closed.md` | E1–E9 · **pass ≠ R1 已关** · flag default **off** · **NOT flipped** |
| F4 P-R1 remaining | `harness/r4-f4-p-r1-fail-closed.md` | **`post_prove_dual_pass`** · **PR1-A true** · **PR1-B/C false** · **G-R4-3 STILL OPEN** · no flip default |
| R4 parent status | `harness/r4-domain-isolation-status.md` §2 G-R4-3 · §13 F4 | R1 PREREQ **未关** · blocks R4 close · **NOT flipped** |
| m4 §R1 · GAP-RAG-01 | `m4-rag-hard-gates.md` §R1 · `gap-bug-backlog.md` | R1 close needs production no-legacy-default **and** route honesty evidence · **still open** |
| Order pin | R2-SSOT parallel · **R1 explicit close** → R4/FUNNEL | Prove dual_pass done · **product still open** |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R1-SSOT prove dual_pass nailed · **this REQUEST additive** |

**Headline**: **R1 STILL OPEN**. Prove dual_pass knife (`0deb5fb` / `30d93dc`) = prove honesty only · **SSOT NOT flipped**. Docs knife (`f9119fe` / `2316bbc`) = checklist only. This knife opens the **explicit close / SSOT flip** REQUEST — still docs-only at open; flip happens only after **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**.

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

| # | Gate | Must be true before any "R1 closed" / SSOT flip claim | This open |
|---|------|------------------------------------------------------|-----------|
| P1 | Cite prove dual_pass knife `r1-real-close-ssot-flip` · `post_prove_dual_pass` on `0deb5fb` / tip `30d93dc` · **≠** this knife · **≠** R1 product closed | yes | pointer only |
| P2 | Cite docs knife `r1-close-authorize-receipt` · `f9119fe` / `2316bbc` · **≠** this knife · **≠** R1 product closed | yes | pointer only |
| P3 | Cite F4: PR1-A true · PR1-B/C false · **G-R4-3 STILL OPEN** | yes | pointer only |
| P4 | Explicit Ban 假关 · Ban claim closed from prove dual_pass `0deb5fb` / `30d93dc` or docs knife | yes | pinned |
| P5 | Prove CMD table honesty · re-run only under standing authorize | yes | §3 · **not_run** |
| P6 | SSOT flip plan targets listed · **not flipped** | yes | §4 · plan only |
| P7 | Production evidence path for PR1-B · Ban forge | **still open** | must survive |
| P8 | Default-on / no-legacy (PR1-C) · Ban flip without authorize | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** |

**Ban**: implementer must **not** write R1 pass-close · must **not** flip SSOT · must **not** claim R1 / G-R4-3 closed · must **not** treat Dual PASS as coding authorize · must **not** claim closed from prove dual_pass `0deb5fb` / `30d93dc` · must **not** claim closed from docs knife `f9119fe` / `2316bbc`.

---

## 3. Prove CMD honesty（frozen · not run this open）

| CMD | Expected EXIT (if later authorized) | Run status now | Honest read |
|-----|-------------------------------------|----------------|-------------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | **`not_run:await_authorize`** | Contract green ≠ R1 closed |
| `pnpm r4-p-r1-fail-closed:prove` | **0** | **`not_run:await_authorize`** | F4 honesty · **G-R4-3 STILL OPEN** · PR1-B/C false |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **`not_run:await_authorize`** | §R1 doc gate · ≠ product close |
| Production / combo-root flag-on evidence (PR1-B) | evidence required | **missing · STILL OPEN** | Ban forge · Ban 假关 |
| Default-on / no-legacy path (PR1-C) | evidence required | **missing · STILL OPEN** | Ban flip without standing close authorize |
| Docs / SSOT flip edits | n/a | **forbidden until post-prove dual + explicit close authorize** | **no silent flip** |

**Ban**: do not invent prove EXIT · do not run prove as green close before standing authorize · Dual PASS ≠ prove green ≠ R1 closed ≠ G-R4-3 closed · Ban wash prior prove dual_pass `0deb5fb` into product close.

---

## 4. SSOT flip target list（plan only · not executed）

| Target | Flip intent (after post-prove dual + explicit close authorize) | Now |
|--------|---------------------------------------------------------------|-----|
| `harness/r1-tech-role-fail-closed.md` | Align close language honestly if authorize says so | **NOT flipped** |
| `harness/r4-f4-p-r1-fail-closed.md` · G-R4-3 | Refresh only with evidence · Ban silent G-R4-3 close | **NOT flipped** · **G-R4-3 STILL OPEN** |
| `harness/r4-domain-isolation-status.md` §2 G-R4-3 | Align parent status honesty | **NOT flipped** |
| `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 | Product / backlog honesty | **NOT flipped** |
| `harness/r1-close-authorize-receipt.md` | Note explicit-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `harness/r1-real-close-ssot-flip.md` | Note explicit-close knife distinct · Ban washing dual_pass into closed | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this REQUEST open** |
| `docker/env/worker.env.example` | Ban flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` without authorize | **NOT flipped** (still `0`) |

---

## 5. Pins (must survive dual)

1. **≠ prove dual_pass knife** — `r1-real-close-ssot-flip` = prove honesty already `post_prove_dual_pass` (`0deb5fb` / tip `30d93dc`) · this = **R1 explicit close / SSOT flip REQUEST** · Ban wash `0deb5fb` close  
2. **≠ docs knife** — `r1-close-authorize-receipt` = docs checklist (`f9119fe` / `2316bbc`) · **≠** this knife  
3. **R1 STILL OPEN** until **prove + dual + explicit close authorize** · Ban claiming closed from Dual PASS or from prove dual_pass / docs knife  
4. **G-R4-3 STILL OPEN until evidence** · PR1-B/C false · Ban claiming G-R4-3 closed  
5. **Ban 假关** · **Dual PASS ≠ coding 假关** · coding / prove / SSOT flip waits **standing authorize after dual** · Ban self-approve  
6. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
7. Ban invent prove EXIT / silent flip / flip default without authorize  
8. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed  
9. Zero coding · zero prove · **no SSOT flip yet** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*` · No force-push  
10. Order: R2-SSOT parallel · **R1 explicit close** → R4/FUNNEL · Ban folding R4/FUNNEL into R1 closed · Ban elevating prove dual_pass to closed

---

## 6. REQUEST pair

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r1-explicit-close-ssot-flip-mw-e2e-ha.md` |
| `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r1-explicit-close-ssot-flip-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · REQUEST open · **no prove** · zero coding · **no SSOT flip** |

---

## 8. Non-claims

REQUEST open only · not pass · not R1 closed · not G-R4-3 closed · not flip authorized · not coding authorized · not SSOT flipped · not prove dual_pass re-open · not claim closed from `0deb5fb` / `30d93dc` · not claim closed from `f9119fe` / `2316bbc` · not R2/R4/FUNNEL closed · not HA · not suite · Dual PASS ≠ authorize coding · Ban 假关 · Ban false green · Ban self-approve · `releaseEvidence=false`

---

*Harness · R1 explicit close / SSOT flip · 2026-09-17 (~20:00 PT) · REQUEST-ready / not_run:pre_dual · ≠ prove dual_pass knife 0deb5fb/30d93dc · ≠ docs knife f9119fe/2316bbc · R1 STILL OPEN until prove+dual+explicit close auth · G-R4-3 STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · zero coding · no SSOT flip yet · Ban self-approve*
