# Harness — **R1 real close / SSOT flip**（prove-await-authorize · REQUEST open）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~19:47 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R1 STILL OPEN** · **G-R4-3 STILL OPEN** · **≠ R1 closed** · **≠ flip default** · **≠ coding authorized** · **Ban 假关** · **Ban false green** · **Dual PASS ≠ coding 假关**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · coding/prove waits **standing authorize after dual** · **zero coding / zero prove / no SSOT flip yet**）  
**Note**: **≠ docs knife** — `harness/r1-close-authorize-receipt.md` already **`post_prove_dual_pass`** at **`f9119fe`** (dual on **`2316bbc`**) · docs checklist only · **R1 product NOT closed** · **G-R4-3 STILL OPEN** · this knife opens the **separate** real close / prove-await-authorize / SSOT-flip REQUEST  
**Slice**: `../r1-real-close-ssot-flip.slice.md`  
**Eval**: `../eval/r1-real-close-ssot-flip.eval.md`  
**Authority**: meetwise — docs-only REQUEST open for **R1 real close / SSOT flip** path · Ban claiming R1 closed from Dual PASS or from docs knife · Ban 假关 · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*`  
**Honesty**: This open = REQUEST prep only · **R1 STILL OPEN** until **prove + dual + explicit close authorize** · **G-R4-3 STILL OPEN until evidence** · **no** SSOT flip in this commit · Dual PASS ≠ authorize coding · **≠** claim closed from `f9119fe` / `2316bbc`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST open: **prove-await-authorize lifecycle** for a *future* R1 product real close / SSOT pointer flip · cite existing R1 harness + F4 + docs knife · pin Dual PASS ≠ coding 假关 |
| **What this knife is not** | **Not** the docs-only knife (`r1-close-authorize-receipt` · `f9119fe` / `2316bbc`) · **not** coding · **not** prove run · **not** SSOT flip now · **not** claiming R1 closed · **not** flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default · **not** R2/R4/FUNNEL close · **not** HA/suite |
| **R1 closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **Ban 假关** · **R1 STILL OPEN until prove + dual + explicit close authorize** |
| **G-R4-3?** | **STILL OPEN until evidence** · F4 `post_prove_dual_pass` · PR1-A true · **PR1-B/C false** · Ban claiming G-R4-3 closed from this REQUEST |
| **Coding / prove / SSOT flip** | **Forbidden** on Dual PASS alone · waits **standing authorize after dual** (not self-serve) · then prove · then **post-prove dual** · **only then** SSOT flip |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove · **no SSOT flip** · Ban self-approve · **releaseEvidence=false** |

---

## 1. Contra — existing R1 / F4 / docs knife（pointers · do not rewrite here）

| Artifact | Path | Honest status (as of open) |
|----------|------|----------------------------|
| **Docs knife prior (≠ this)** | `harness/r1-close-authorize-receipt.md` | **`post_prove_dual_pass`** · dual on **`2316bbc`** · close commit **`f9119fe`** · **checklist drafted only** · **R1 product NOT closed** · **G-R4-3 STILL OPEN** · pointed at separate real-close REQUEST |
| Canonical R1 prove contract | `harness/r1-tech-role-fail-closed.md` | E1–E9 · **pass ≠ R1 已关** · flag default **off** · legacy 技术岗 still present |
| R1 eval | `eval/r1-tech-role-fail-closed.eval.md` | prove contract only |
| R1 prove CMD | `pnpm r1-tech-role-fail-closed:prove` | Prior EXIT=0 = contract green · **≠ R1 closed** |
| F4 P-R1 remaining | `harness/r4-f4-p-r1-fail-closed.md` | **`post_prove_dual_pass`** · **PR1-A true** · **PR1-B/C false** · **G-R4-3 STILL OPEN** · no flip default |
| R4 parent status | `harness/r4-domain-isolation-status.md` §2 G-R4-3 · §13 F4 | R1 PREREQ **未关** · blocks R4 close |
| m4 §R1 · GAP-RAG-01 | `m4-rag-hard-gates.md` §R1 · `gap-bug-backlog.md` | R1 close needs production no-legacy-default **and** route honesty evidence · **still open** |
| Order pin | W4 / R2-SSOT → **R1** → R4/FUNNEL | R2 structural path parallel · **R1 product still open** |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | R1-close docs knife closed · **this REQUEST additive** |

**Headline**: **R1 STILL OPEN**. Docs knife (`f9119fe` / `2316bbc`) prepared the authorize checklist only. This knife opens the **real close / prove-await-authorize / SSOT flip** REQUEST — still docs-only at open; flip happens only after **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**.

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

| # | Gate | Must be true before any "R1 closed" / SSOT flip claim | This open |
|---|------|------------------------------------------------------|-----------|
| P1 | Cite docs knife `r1-close-authorize-receipt` · `post_prove_dual_pass` on `2316bbc` / `f9119fe` · **≠** this knife · **≠** R1 product closed | yes | pointer only |
| P2 | Cite R1 harness + eval + prove CMD · EXIT=0 ≠ R1 closed | yes | pointer only |
| P3 | Cite F4: PR1-A true · PR1-B/C false · **G-R4-3 STILL OPEN** | yes | pointer only |
| P4 | Explicit Ban 假关 · Ban claim closed from docs knife Dual PASS / `f9119fe` | yes | pinned |
| P5 | Prove CMD table honesty · re-run only under standing authorize | yes | §3 · **not_run** |
| P6 | SSOT flip plan targets listed · **not flipped** | yes | §4 · plan only |
| P7 | Production evidence path for PR1-B (flag-on combo-root) · Ban forge | **still open** | must survive |
| P8 | Default-on / no silent legacy 技术岗 (PR1-C) · Ban flip without authorize | **still open** | Ban flip here |
| P9 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding 假关 · Ban self-approve | yes | pinned |
| P10 | Lifecycle: REQUEST → pre-exec dual → standing coding+prove → post-prove dual → **only then** SSOT flip | yes | **hard** |

**Ban**: implementer must **not** write R1 pass-close · must **not** flip default · must **not** flip SSOT · must **not** claim R1 / G-R4-3 closed · must **not** treat Dual PASS as coding authorize · must **not** claim closed from docs knife `f9119fe` / `2316bbc`.

---

## 3. Prove CMD honesty（frozen · not run this open）

| CMD | Expected EXIT (if later authorized) | Run status now | Honest read |
|-----|-------------------------------------|----------------|-------------|
| `pnpm r1-tech-role-fail-closed:prove` | **0** | **`not_run:await_authorize`** | Contract green ≠ R1 closed · ≠ G-R4-3 closed |
| `pnpm r4-p-r1-fail-closed:prove` | **0** | **`not_run:await_authorize`** | F4 honesty · PR1-B/C still false until evidence |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **`not_run:await_authorize`** | §R1 doc gate · ≠ product close |
| Production / combo-root flag-on evidence (PR1-B) | evidence required | **missing · STILL OPEN** | Ban forge · Ban 假关 |
| Default-on / no-legacy path (PR1-C) | authorize required | **missing · STILL OPEN** | Ban flip without standing authorize |
| Docs / SSOT flip edits | n/a | **forbidden until post-prove dual + explicit close authorize** | **no silent flip** |

**Ban**: do not invent prove EXIT · do not run prove as green close before standing authorize · Dual PASS ≠ prove green ≠ R1 closed ≠ G-R4-3 closed.

---

## 4. SSOT flip target list（plan only · not executed）

| Target | Flip intent (after post-prove dual + explicit close authorize) | Now |
|--------|---------------------------------------------------------------|-----|
| `harness/r1-tech-role-fail-closed.md` | Align close language honestly if authorize says so | **NOT flipped** |
| `harness/r4-f4-p-r1-fail-closed.md` · G-R4-3 | Refresh only with evidence · Ban silent G-R4-3 close | **NOT flipped** · **G-R4-3 STILL OPEN** |
| `harness/r4-domain-isolation-status.md` §2 G-R4-3 | Align parent status honesty | **NOT flipped** |
| `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 | Product / backlog honesty | **NOT flipped** |
| `harness/r1-close-authorize-receipt.md` | Note real-close knife distinct · Ban conflating | **NOT rewritten as product close** |
| `w0-w8-workflow-status.md` | Reflect authorized close only after L5 | **lists this REQUEST open** |

---

## 5. Pins (must survive dual)

1. **≠ docs knife** — `r1-close-authorize-receipt` = docs close-auth prep already `post_prove_dual_pass` (`f9119fe` / dual `2316bbc`) · this = **R1 real close / SSOT flip REQUEST**  
2. **R1 STILL OPEN** until **prove + dual + explicit close authorize** · Ban claiming R1 closed from Dual PASS or from docs knife  
3. **G-R4-3 STILL OPEN until evidence** · PR1-B/C false · Ban claiming G-R4-3 closed  
4. **Ban 假关** · **Dual PASS ≠ coding 假关** · coding / prove / SSOT flip waits **standing authorize after dual** · Ban self-approve  
5. Lifecycle: **REQUEST → pre-exec dual → standing coding+prove → post-prove dual → only then SSOT flip**  
6. Ban flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default without authorize · Ban invent prove EXIT / silent flip  
7. `releaseEvidence=false` · ≠HA · ≠suite green · Ban false green · ≠ controlPlaneClosed  
8. Zero coding · zero prove · **no SSOT flip yet** · PG+pgvector+PostgresSaver retained · Ban secrets / `.env*`  
9. Order: R2-auth/R2-SSOT parallel · **R1 real close** → R4/FUNNEL · Ban folding R4/FUNNEL into R1 closed

---

## 6. REQUEST pair

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r1-real-close-ssot-flip-mw-e2e-ha.md` |
| `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r1-real-close-ssot-flip-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · REQUEST open · **no prove** · zero coding · **no SSOT flip** |

---

## 8. Non-claims

REQUEST open only · not pass · not R1 closed · not G-R4-3 closed · not flip authorized · not coding authorized · not SSOT flipped · not docs knife re-open · not claim closed from `f9119fe` / `2316bbc` · not R2/R4/FUNNEL closed · not HA · not suite · Dual PASS ≠ authorize coding · Ban 假关 · Ban false green · `releaseEvidence=false`

---

*Harness · R1 real close / SSOT flip · 2026-09-17 (~19:47 PT) · REQUEST-ready / not_run:pre_dual · ≠ docs knife f9119fe/2316bbc · R1 STILL OPEN until prove+dual+explicit close auth · G-R4-3 STILL OPEN until evidence · Ban 假关 · Dual PASS ≠ coding 假关 · releaseEvidence=false · ≠HA · ≠suite · zero coding · no SSOT flip yet · Ban self-approve*
