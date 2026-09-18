# Harness — **R2 real close / SSOT flip**（prove + standing authorize · executed）

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~19:40 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **R2 structural CLOSED**（classify→bind→snapshot→refuse/allow + dual+authorize+prove）· **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ verbal route-effective** · **≠ controlPlaneClosed** · **Ban false green** · sole **恰 5** 不扩  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** on `c3092c1` · standing authorize coding+prove · **Ban self-write `post_prove_dual_pass`**)  
**Note**: **≠ W4** — W4 (`harness/w4-r2-close-authorize-receipt.md`) already **`post_prove_dual_pass`** with checklist only；this knife **executed** the real-close / SSOT flip under standing authorize  
**Slice**: `../r2-ssot-flip-real-close.slice.md`  
**Eval**: `../eval/r2-ssot-flip-real-close.eval.md`  
**Authority**: meetwise — standing authorize after dual on REQUEST `c3092c1` · SSOT flip + prove · PG+pgvector+PostgresSaver retained · Ban secrets · No force  
**Honesty**: Dual PASS ≠ authorize coding（satisfied via standing authorize）· SSOT flipped · prove recorded in receipt · **await post-prove dual** · **do NOT self-write `post_prove_dual_pass`**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Authorized SSOT flip + prove for R2 real close / structural close honesty |
| **What this knife is not** | **Not** W4 · **not** verbal 生效· **not** R1/R4/FUNNEL close · **not** HA/suite · **not** controlPlaneClosed |
| **R2 after flip+prove?** | **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL |
| **Now** | **`executed:awaiting_post_prove_dual`** · Ban self-write post_prove_dual_pass |

---

## 1. Contra — SSOT flipped（was await_authorize）

| Artifact | Path | Honesty now |
|----------|------|-------------|
| Status SSOT | `harness/r2-classify-job-route-status.md` | **flipped** · structural CLOSED · await retired |
| Parent harness | `harness/r2-classify-job-route.md` | **flipped** |
| P-HARNESS / G-R2-8 | `harness/r2-p-harness-agree.md` | **authorized + flipped** |
| Remaining gates | `r2-remaining-gates.inventory.md` | **refreshed** remaining-after |
| Eval (parent) | `eval/r2-classify-job-route.eval.md` | **aligned** |
| m4 §R2 · GAP-RAG-02 | `m4-rag-hard-gates.md` · `gap-bug-backlog.md` | **aligned** |
| W4 prior | `harness/w4-r2-close-authorize-receipt.md` | **≠ this knife** · checklist only |

---

## 2. Checklist executed

| # | Gate | This execute |
|---|------|--------------|
| P1–P2 | P-LIVE + P-HARNESS dual cited | yes |
| P3 | W4 A1–A8 acknowledged · ≠ W4 | yes |
| P4 | ≠ verbal route-effective | pinned |
| P5 | Prove CMD table | see §3 + receipt |
| P6 | SSOT flip targets | **flipped** |
| P7 | Remaining-after R1→R4/FUNNEL | pinned |
| P8 | releaseEvidence=false · ≠HA · Ban false green | pinned |
| P9 | Standing authorize after dual | **yes** |
| P10 | No fake close on Dual PASS alone | satisfied |

---

## 3. Prove CMD（run under authorize · see receipt）

| CMD | Expected EXIT | Honest read |
|-----|---------------|-------------|
| `pnpm r2-p-live-route-effective:prove` | **0** | ≠ verbal 生效 |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL |
| `pnpm r2-p-fake-route-classify:prove` | **0** | ≠ verbal 生效 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | retrieve-side · ≠ R4 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | ≠ R4 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 doc gate |

Receipt: `../receipts/2026-09-17-r2-ssot-flip-real-close-prove.md`

---

## 4. SSOT flip target list（executed）

| Target | Now |
|--------|-----|
| `harness/r2-classify-job-route-status.md` | **flipped** |
| `harness/r2-classify-job-route.md` | **flipped** |
| `harness/r2-p-harness-agree.md` | **flipped** |
| `r2-remaining-gates.inventory.md` | **flipped** |
| `eval/r2-classify-job-route.eval.md` | **flipped** |
| `m4-rag-hard-gates.md` §R2 · GAP-RAG-02 | **flipped** |

---

## 5. Pins

1. **≠ W4**  
2. **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL  
3. **≠ verbal route-effective**  
4. Dual PASS ≠ authorize coding（standing authorize used）· Ban self-approve / Ban self-write post_prove_dual_pass  
5. `releaseEvidence=false` · ≠HA · ≠suite · ≠ controlPlaneClosed · Ban false green · Ban false close 题域/FUNNEL/R4  
6. sole **恰 5** 不扩 · PG retained · Ban secrets · No force  
7. Order remaining-after: **R1 → R4/FUNNEL** · Live Key/G7/R5 orthogonal  

---

## 6. Dual receipts + post-prove REQUEST

| Phase | Expert | Path |
|-------|--------|------|
| pre-exec | `mw-e2e-ha` | `../reviews/2026-09-17-r2-ssot-flip-real-close-mw-e2e-ha.md` **pass** |
| pre-exec | `mw-rag-route` | `../reviews/2026-09-17-r2-ssot-flip-real-close-mw-rag-route.md` **pass** |
| post-prove REQUEST | `mw-e2e-ha` | `../reviews/REQUEST-2026-09-17-r2-ssot-flip-real-close-post-prove-mw-e2e-ha.md` |
| post-prove REQUEST | `mw-rag-route` | `../reviews/REQUEST-2026-09-17-r2-ssot-flip-real-close-post-prove-mw-rag-route.md` |

---

## 7. CMD

| CMD | Status |
|-----|--------|
| SSOT flip + prove | **`executed:awaiting_post_prove_dual`** · **Ban** self-write `post_prove_dual_pass` |

---

## 8. Non-claims

Not verbal 生效 · not HA · not suite · not controlPlaneClosed · not R1/R4/FUNNEL/题域 closed · not post_prove_dual_pass（await experts）· Ban false green · `releaseEvidence=false` · sole 恰5

---

*Harness · R2 real close / SSOT flip · 2026-09-17 (~19:40 PT) · executed:awaiting_post_prove_dual · ≠ W4 · R2 structural CLOSED · R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL · releaseEvidence=false · ≠HA · ≠suite · Ban false green · Ban self-write post_prove_dual_pass*
