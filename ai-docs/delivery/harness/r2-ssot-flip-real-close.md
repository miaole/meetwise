# Harness — **R2 real close / SSOT flip**（prove-await-authorize checklist · REQUEST open）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~19:29 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ R2 closed** · **≠ verbal route-effective** · **≠ controlPlaneClosed** · **≠ coding authorized** · **Ban false green**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · coding waits **standing authorize after dual** · **zero coding / no SSOT flip yet**）  
**Note**: **≠ W4** — W4 (`harness/w4-r2-close-authorize-receipt.md`) already **`post_prove_dual_pass`** with **R2 NOT closed**; this knife opens the **separate** real-close / SSOT-flip REQUEST that W4 pointed at  
**Slice**: `../r2-ssot-flip-real-close.slice.md`  
**Eval**: `../eval/r2-ssot-flip-real-close.eval.md`  
**Authority**: meetwise — docs-only REQUEST open for **R2 real close / SSOT flip** path · Ban claiming R2 closed from Dual PASS · Ban false green · PG+pgvector+PostgresSaver retained  
**Honesty**: This open = REQUEST prep only · **R2 still NOT closed** until **prove + standing authorize** · **no** SSOT flip in this commit · Dual PASS ≠ authorize coding

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST open: **prove-await-authorize checklist** for a *future* R2 real close / SSOT pointer flip · cite existing R2 harness/status SSOT · pin Dual PASS ≠ coding auth |
| **What this knife is not** | **Not** W4 (already closed docs-only) · **not** coding · **not** prove run · **not** SSOT flip now · **not** claiming R2 closed · **not** verbal「路由已生效」 · **not** R1/R4/FUNNEL close · **not** HA/suite |
| **R2 closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **R2 NOT closed until prove + standing authorize** · Ban false green |
| **Coding / SSOT flip** | **Forbidden** on Dual PASS alone · waits **standing authorize after dual** (not self-serve) |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove · **no SSOT flip** · Ban self-approve |

---

## 1. Contra — existing R2 harness / status SSOT（pointers · do not rewrite here）

| Artifact | Path | Honest status (as of open) |
|----------|------|----------------------------|
| Parent harness | `harness/r2-classify-job-route.md` | R2 product wire track · **R2 NOT closed** |
| **Status SSOT** | `harness/r2-classify-job-route-status.md` | P-MODEL…P-FAKE CLOSED · G-R2-5 retrieve-side CLOSED · P-LIVE dual receipts pass · P-HARNESS `pre_exec_dual_pass` / `await_authorize` · **≠ verbal 生效** · **SSOT not flipped** |
| P-HARNESS / G-R2-8 | `harness/r2-p-harness-agree.md` | **`pre_exec_dual_pass` / `await_authorize`** · dual reviews **pass** · SSOT/prove **await separate authorize** |
| Remaining gates inventory | `r2-remaining-gates.inventory.md` | R2 NOT closed · G-R2-8 named remaining |
| W4 close-auth prep | `harness/w4-r2-close-authorize-receipt.md` | **`post_prove_dual_pass`** · dual on `25833fc` · **checklist drafted only** · **≠** R2 closed · **≠** this knife |
| G7-K1 lifecycle | `harness/g7-k1-r2-p-live-status-lifecycle.md` | dual → harness agree → **await authorize** · ≠ verbal |
| Eval (parent) | `eval/r2-classify-job-route.eval.md` | Parent eval · Ban invent EXIT |
| GAP-RAG-02 | `gap-bug-backlog.md` | R2 still NOT closed · await separate authorize |
| m4 §R2 | `m4-rag-hard-gates.md` §R2 | Product gate · R2 still open |
| P-HARNESS dual | `reviews/2026-09-16-r2-p-harness-agree-mw-{rag-route,e2e-ha}.md` | both **pass** |
| P-LIVE dual | `reviews/2026-09-16-r2-p-live-route-effective-mw-{model-op,rag-route}.md` | both **pass** · structural only |
| W0–W8 SSOT | `w0-w8-workflow-status.md` | W4 closed docs-only · this REQUEST additive |

**Headline**: R2 is **NOT closed**. W4 prepared the authorize checklist. This knife opens the **real close / SSOT flip** REQUEST path — still docs-only at open; flip happens only after dual **and** standing authorize **and** prove honesty.

---

## 2. Prove-await-authorize checklist（draft · not executed）

| # | Gate | Must be true before any "R2 closed" / SSOT flip claim | This open |
|---|------|------------------------------------------------------|-----------|
| P1 | P-LIVE dual receipts cited (both domains pass) | yes | pointer only |
| P2 | P-HARNESS dual receipts cited (both domains pass) | yes | pointer only |
| P3 | W4 authorize checklist A1–A8 acknowledged (docs prep closed) | yes | ≠ W4 re-open |
| P4 | Explicit **≠ verbal route-effective** pin survives | yes | pinned |
| P5 | Prove CMD table honesty: prior EXIT=0 ≠ R2 closed · re-run only under standing authorize | yes | §3 · **not_run** |
| P6 | SSOT flip plan targets listed (status · parent harness · eval · m4 §R2 · GAP-RAG-02 · inventory · P-HARNESS) | yes | drafted · **not flipped** |
| P7 | Remaining-after list: Live Key optional · **R1 next** · R5 fixture · **R4/FUNNEL after R1** · G7 ≠ R2 close | yes | pinned |
| P8 | `releaseEvidence=false` · ≠HA · ≠suite · **Ban false green** · Dual PASS ≠ authorize coding · Ban self-approve | yes | pinned |
| P9 | **Standing authorize after dual** before any coding / SSOT edit | yes | **hard** |
| P10 | **No** coding / prove / SSOT flip as fake close on Dual PASS alone | yes | docs open only · **R2 NOT closed** |

**Ban**: implementer must **not** write R2 pass · must **not** flip SSOT · must **not** claim R2 closed · must **not** treat Dual PASS as coding authorize. Real coding (SSOT flip) needs **standing authorize after dual**.

---

## 3. Prove CMD honesty（frozen · not run this open）

| CMD | Expected EXIT (if later authorized) | Run status now | Honest read |
|-----|-------------------------------------|----------------|-------------|
| `pnpm r2-p-live-route-effective:prove` | **0** | **`not_run:await_authorize`** | Prior P-LIVE structural only · ≠ R2 closed |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | **`not_run:await_authorize`** | Must still pin R2 NOT closed until flip authorized |
| `pnpm r2-p-fake-route-classify:prove` | **0** | **`not_run:await_authorize`** | Prior · ≠ verbal 生效 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | **`not_run:await_authorize`** | retrieve-side · ≠ R2 closed |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **`not_run:await_authorize`** | ≠ R4 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **`not_run:await_authorize`** | §R2 doc gate |
| Docs / SSOT flip edits | n/a | **forbidden until standing authorize after dual** | **no silent flip** |

**Ban**: do not invent prove EXIT · do not run prove as green close before standing authorize · Dual PASS ≠ prove green ≠ R2 closed.

---

## 4. SSOT flip target list（plan only · not executed）

| Target | Flip intent (after standing authorize) | Now |
|--------|----------------------------------------|-----|
| `harness/r2-classify-job-route-status.md` | Retire stale await / pin authorized close language honestly | **NOT flipped** |
| `harness/r2-classify-job-route.md` | Align parent harness with authorized close | **NOT flipped** |
| `harness/r2-p-harness-agree.md` | Move off `await_authorize` only if authorize says so | **NOT flipped** |
| `r2-remaining-gates.inventory.md` | Refresh remaining-after honesty | **NOT flipped** |
| `eval/r2-classify-job-route.eval.md` | Align eval language | **NOT flipped** |
| `m4-rag-hard-gates.md` §R2 · GAP-RAG-02 | Product / backlog honesty | **NOT flipped** |

---

## 5. Pins (must survive dual)

1. **≠ W4** — W4 = docs close-auth prep already `post_prove_dual_pass` · this = **real close / SSOT flip REQUEST**  
2. **R2 NOT closed** until **prove + standing authorize** · Ban claiming R2 closed from Dual PASS  
3. **≠ verbal route-effective** · structural receipt ≠ 路由已生效  
4. **Dual PASS ≠ authorize coding** · coding / SSOT flip waits **standing authorize after dual** · Ban self-approve  
5. Point at existing R2 harness/status SSOT · Ban inventing prove EXIT / silent flip  
6. `releaseEvidence=false` · ≠HA · ≠suite green · **Ban false green** · ≠ controlPlaneClosed  
7. Zero coding · zero prove · **no SSOT flip yet** · PG+pgvector+PostgresSaver retained  
8. Order after real close-auth: **R1 → R4/FUNNEL** · Live Key / G7 / R5 orthogonal · Ban folding into R2 closed

---

## 6. REQUEST pair

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r2-ssot-flip-real-close-mw-e2e-ha.md` |
| `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r2-ssot-flip-real-close-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · REQUEST open · **no prove** · zero coding · **no SSOT flip** |

---

## 8. Non-claims

REQUEST open only · not pass · not R2 closed · not verbal 生效 · not coding authorized · not SSOT flipped · not W4 re-open · not R1/R4/FUNNEL closed · not HA · not suite · Dual PASS ≠ authorize coding · Ban false green · `releaseEvidence=false`

---

*Harness · R2 real close / SSOT flip · 2026-09-17 (~19:29 PT) · REQUEST-ready / not_run:pre_dual · ≠ W4 · releaseEvidence=false · ≠HA · ≠suite · R2 NOT closed until prove+authorize · Ban false green · Dual PASS ≠ authorize coding · zero coding · no SSOT flip yet · Ban self-approve*
