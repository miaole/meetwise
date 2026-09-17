# Harness — **W4** · R2 close-auth REQUEST prep（authorize checklist / receipt）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:25 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ R2 closed** · **≠ verbal route-effective** · **≠ controlPlaneClosed** · **≠ R1 closed** · **≠ R4 / FUNNEL dual-closed**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec REQUEST pair · **not yet dual-sent** · **zero coding / zero prove** · **Ban self-approve** · **Dual PASS ≠ authorize coding**）  
**Note**: `mw-model-op` **not** on this REQUEST pair — domain may need model-op **later** if live-Key / MODEL-OP binding honesty is folded in; **not** required for this docs-only close-auth prep  
**Slice**: `../w4-r2-close-authorize-receipt.slice.md`  
**Eval**: `../eval/w4-r2-close-authorize-receipt.eval.md`  
**Authority**: meetwise — docs-only **separate authorize list** for R2 close prep · Ban claiming R2 closed · order after authorize track: **R1 → R4/FUNNEL** · F8 MS3 **may merge** this track **after** its post-prove · PG+pgvector+PostgresSaver retained

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST prep: inventory R2 remaining open gates + write a **separate authorize checklist / receipt** for a *future* R2 close-auth decision · pin order **R2-auth → R1 → R4/FUNNEL** · note F8 MS3 merge-after-post-prove |
| **What this knife is not** | **Not** coding · **not** prove · **not** SSOT silent flip · **not** claiming R2 closed · **not** verbal「路由已生效」 · **not** R1/R4/FUNNEL close · **not** F8 post-prove self-approve · **not** HA/suite |
| **R2 closed after Dual PASS here?** | **NO** — Dual PASS ≠ authorize coding · **Ban** claiming R2 closed from this knife |
| **Separate authorize** | This knife **drafts** the authorize list only · actual close/SSOT flip needs a **later separate authorize** (not self-serve) |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · Ban self-approve |

---

## 1. Honest inventory — existing R2 harness / status（2026-09-17）

| Artifact | Path | Honest status |
|----------|------|---------------|
| Parent harness | `harness/r2-classify-job-route.md` | R2 product wire track · **R2 NOT closed** |
| Status SSOT | `harness/r2-classify-job-route-status.md` | P-MODEL…P-FAKE CLOSED · G-R2-5 retrieve-side CLOSED · P-LIVE dual receipts pass · P-HARNESS `pre_exec_dual_pass` / `await_authorize` · **≠ verbal 生效** |
| Remaining gates inventory | `delivery/r2-remaining-gates.inventory.md` | **`pre_exec_dual_pass` / `await_authorize`** · R2 NOT closed · G-R2-8 named remaining |
| P-HARNESS / G-R2-8 | `harness/r2-p-harness-agree.md` | **`pre_exec_dual_pass` / `await_authorize`** · dual reviews **pass** · SSOT/prove **await separate authorize** · **forbids** self-declaring R2 closed |
| P-HARNESS dual reviews | `reviews/2026-09-16-r2-p-harness-agree-mw-{rag-route,e2e-ha}.md` | both **pass** |
| P-LIVE dual reviews | `reviews/2026-09-16-r2-p-live-route-effective-mw-{model-op,rag-route}.md` | both **pass** · structural only |
| G7-K1 lifecycle | `harness/g7-k1-r2-p-live-status-lifecycle.md` | lifecycle pin: dual → harness agree → **await authorize** · ≠ verbal |
| GAP-RAG-02 | `gap-bug-backlog.md` | R2 still NOT closed · await separate authorize |
| F8 MS3 (parallel) | `harness/r4-f8-p-meta-ms3-deploy-product.md` | **`executed:awaiting_post_prove_dual`** · may **merge** R2 close-auth track **after** post-prove · **Ban** folding F8 green into R2 closed |

### Product / wire gates (G-R2-*) honesty

| Gate | Honesty | Blocks R2 close-auth? |
|------|---------|------------------------|
| G-R2-1…G-R2-6 | **closed** (dual-passed / retrieve-side as prior) | No (wire done; overall still open) |
| G-R2-7 P-LIVE | **dual-passed structural receipt** · ≠ verbal 生效 | Partial — receipt yes; close-auth still needed |
| **G-R2-8 P-HARNESS** | **`pre_exec_dual_pass` / `await_authorize`** | **Yes** — named remaining control-plane gate |
| Verbal / narrative 路由已生效 | **open (forbidden)** | Honesty pin only |
| Live Key invoke | **open / not claimed** | Optional later · **not** required for structural close-auth list |
| R1 tech-role fail-closed | **open** (separate) | **After** R2-auth in recommended order |
| R4 / FUNNEL / G-R4-5 | **open** (F8 awaiting post-prove dual) | **After** R1 in recommended order |
| R5 rag03 fixture | **open** | Must not be used as route-effective proof |
| G7 Local Full-Suite | **draft · not effective** | ≠ R2 close |

**Headline**: R2 is **NOT closed**. Highest-value remaining control-plane step is **separate authorize** after P-HARNESS dual (already pass). This W4 knife **only documents** that checklist — it does **not** perform or claim the authorize.

---

## 2. Separate authorize checklist（draft · not executed）

| # | Authorize item | Must be true before any "R2 closed" claim | This knife |
|---|----------------|-------------------------------------------|------------|
| A1 | P-LIVE dual receipts cited (both domains pass) | yes | inventory only |
| A2 | P-HARNESS dual receipts cited (both domains pass) | yes | inventory only |
| A3 | Explicit **≠ verbal route-effective** pin survives | yes | pinned |
| A4 | SSOT pointer flip plan (status · parent harness · eval · m4 §R2 · GAP-RAG-02) gated on authorize | yes | drafted · **not flipped** |
| A5 | Remaining-after list: Live Key optional · **R1 next** · R5 fixture · **R4/FUNNEL after R1** · G7 draft | yes | §3 |
| A6 | F8 MS3 merge rule: may join this track **only after** F8 `post_prove_dual_pass` · Ban using F8 EXIT=0 as R2 closed | yes | pinned |
| A7 | `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ authorize coding · Ban self-approve | yes | pinned |
| A8 | **No** coding / prove run as fake close | yes | `not_run:pre_dual` |

**Ban**: implementer must **not** write pass · must **not** flip SSOT · must **not** claim R2 closed · must **not** treat Dual PASS on W4 as coding authorize.

---

## 3. Recommended order after R2-auth

| Order | Track | Note |
|-------|-------|------|
| 1 | **R2 close-auth** (this prep → later separate authorize) | Still open · Ban claiming closed here |
| 2 | **R1** tech-role fail-closed | Separate knife · depends on route honesty |
| 3 | **R4 / FUNNEL** (incl. F8 MS3 after post-prove) | F8 may **merge** into close-auth narrative **after** post-prove dual · still ≠ R4 closed alone |
| — | Live Key / G7 / R5 | Orthogonal or later · Ban folding into R2 closed |

---

## 4. Pins (must survive dual)

1. **R2 NOT closed** · Ban claiming R2 closed from this knife / Dual PASS  
2. **≠ verbal route-effective** · structural receipt ≠ 路由已生效  
3. Separate authorize list is **draft only** · Dual PASS ≠ authorize coding · Ban self-approve  
4. Order: R2-auth → R1 → R4/FUNNEL · F8 MS3 merge-after-post-prove only  
5. `releaseEvidence=false` · ≠HA · ≠suite green · ≠ controlPlaneClosed  
6. Zero coding · zero prove · PG+pgvector+PostgresSaver retained  
7. `mw-model-op` optional later · not on this REQUEST pair  

---

## 5. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · **no prove script** · zero coding |

---

## 6. Non-claims

Not pass · not R2 closed · not verbal 生效 · not coding authorized · not SSOT flipped · not R1/R4/FUNNEL closed · not F8 post-prove self-approve · not HA · not suite · Dual PASS ≠ authorize coding

---

*Harness · W4 R2 close-auth REQUEST prep · 2026-09-17 (~01:25 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · R2 NOT closed · Ban claim R2 closed · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
