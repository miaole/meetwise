# Harness — R2 **P-HARNESS / G-R2-8** (harness agree · control-plane honesty)

**Status**: **`authorized` / SSOT flipped**（retired `await_authorize` · standing authorize after dual on `c3092c1` · real-close knife **`post_prove_dual_pass`** on **`5671982`**)  
**Date**: 2026-09-17 (~19:45 PT) · prior pre-exec dual 2026-09-16 (~19:15 PT)  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ verbal route-effective** · **≠ R4** · **≠ FUNNEL dual-closed** · **≠ controlPlaneClosed** · **≠ suite green** · sole **恰 5**  
**Experts (pre-exec dual PASS)**: `mw-rag-route` + `mw-e2e-ha`  
**Dual reviews (both pass)**: `ai-docs/delivery/reviews/2026-09-16-r2-p-harness-agree-mw-rag-route.md` · `ai-docs/delivery/reviews/2026-09-16-r2-p-harness-agree-mw-e2e-ha.md`  
**Real-close pre-exec dual (both pass on `c3092c1`)**: `reviews/2026-09-17-r2-ssot-flip-real-close-mw-{e2e-ha,rag-route}.md`  
**Real-close post-prove dual (both pass on `5671982`)**: `reviews/2026-09-17-r2-ssot-flip-real-close-post-prove-mw-{e2e-ha,rag-route}.md`  
**Parent**: `harness/r2-classify-job-route.md` · `harness/r2-classify-job-route-status.md` · `eval/r2-classify-job-route.eval.md`  
**Inventory**: `delivery/r2-remaining-gates.inventory.md`  
**Prior**: P-MODEL…P-FAKE dual-passed · G-R2-5 retrieve-side CLOSED · **P-LIVE dual-passed** · **P-HARNESS dual-passed** · **standing authorize → SSOT flip executed**

---

## 0. Stance (read first)

| Statement | Ruling |
|-----------|--------|
| What is this knife? | **Docs / control-plane honesty gate**: harness **agree** that P-LIVE dual receipts are enough as **structural** classify→bind→snapshot→refuse/allow evidence; prepare SSOT sync off stale "pending dual" **after separate authorize**; pin verbal ban |
| What is it not? | **Not** coding · **not** prove-run · **not** live Key · **not** R2 close · **not** verbal 生效 · **not** R4 / G7 |
| R2 closed after authorize+flip? | **R2 structural CLOSED** (classify→bind→snapshot→refuse/allow + dual+authorize+prove). **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL. This knife forbade self-declare before standing authorize. |
| Route verbally effective? | **NO** — structural receipt ≠ verbal / control-plane "effective" |
| Success ≠ | Dual pass / docs sync ≠ G7 success · ≠ HA · ≠ `releaseEvidence=true` |

---

## 1. Why this knife (highest-value remaining)

After P-MODEL…P-LIVE dual passes, G-R2-8 harness agree was the named remaining control-plane gate. Standing authorize after real-close dual on `c3092c1` **retired `await_authorize`** and authorized the SSOT flip. Verbal 生效 remains forbidden.

This knife's honesty path is now **authorized + flipped**; real-close knife awaits post-prove dual.

---

## 2. Acceptance criteria (H1–H8)

| ID | Criterion | Pass look like | False green if… |
|----|-----------|----------------|------------------|
| **H1** | Fact: P-LIVE dual receipts exist and conclude **pass** | Cite both review paths | Treat single-domain as dual |
| **H2** | Harness **agrees** Key-unset structural loop is a valid **structural route-effective receipt** | Explicit agree language in harness/status | Equate receipt = verbal 生效 |
| **H3** | SSOT sync: status / parent harness / eval / m4 §R2 / GAP-RAG-02 retire stale await — **executed** after dual + standing authorize | Edits under standing authorize | Edit SSOT before authorize / self-pass |
| **H4** | **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL remains pinned · structural CLOSED ok | Hard sentence in all artefacts | Dual pass alone → claim verbal/HA close |
| **H5** | **≠ verbal route-effective** remains pinned | Hard sentence | 「路由已生效」 narrative |
| **H6** | Remaining-after list honest (live Key optional later · R1 open · R5 fixture · R4 other track · G7 draft) | Table present | Fold R4/G7 into R2 close |
| **H7** | No coding / no prove this pre-exec | CMD table `not_run:await_authorize` | Run prove as green close |
| **H8** | NHP columns present; no covered uplift | NEG/FAULT/BOUND/ADV/PERF/LOAD | Mark covered / HA |

---

## 3. Inventory of what harness is agreeing to (structural only)

| Face | Already dual-passed? | Harness agree means |
|------|----------------------|---------------------|
| Worker sole classify + MODEL-OP | Yes (P-WORKER/P-FAKE) | Keep |
| API wakeup · zero classify | Yes (P-API) | Keep |
| bind → start lazy re-bind → snapshot | Yes (P-LOOP) | Keep |
| REFUSE before INSERT | Yes (P-START) | Keep |
| retrieve missing snapshot fail-closed | Yes (G-R2-5) | Keep |
| P-LIVE Key-unset refuse/allow prove | Yes (P-LIVE dual) | **Agree as structural receipt** |
| Verbal / marketing "route effective" | **Forbidden** | **Still forbidden** |
| Live Key invoke | Not in scope | Do not invent green |

---

## 4. CMD table (frozen · not run)

| CMD | Expected EXIT | Run status | Honest read |
|-----|---------------|------------|-------------|
| `pnpm r2-p-live-route-effective:prove` | **0** | authorized re-run via real-close knife | ≠ verbal 生效 |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | authorized re-run | pin R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL |
| `pnpm r2-p-fake-route-classify:prove` | **0** | authorized re-run | ≠ verbal 生效 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | optional related | ≠ R4 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | optional related | ≠ domain isolated |
| `pnpm mysql-stack:m4-rag:prove` | **0** | optional related | §R2 doc gate |
| Doc-honesty / SSOT sync | n/a | **executed under standing authorize** | real-close knife `post_prove_dual_pass` on `5671982` |

**Ban**: self-serve flip without standing authorize (already satisfied). Verbal 生效 / HA / suite / controlPlaneClosed / R4/FUNNEL still forbidden.

---

## 5. NHP / G2–G6 columns (mandatory)

| Col | Case / note | Flag |
|-----|-------------|------|
| **NEG** | Claim R2 closed / verbal 生效 from dual alone → reject | honesty pin (this knife) |
| **FAULT** | SSOT flip/prove before separate authorize → control-plane fault | **authorized**; H3 executed |
| **BOUND** | Structural receipt boundary ≠ live Key ≠ verbal | pin |
| **ADV** | Self-pass / single-domain dual-passed claim | forbidden |
| **PERF** | n/a capacity | **blind** / `not_run` |
| **LOAD** | n/a | **blind** / `not_run` |
| PERF_api / PERF_web / LOAD_worker | — | **blind** |

---

## 6. False-green table

| If someone says… | Ruling |
|------------------|--------|
| P-LIVE dual pass alone = verbal 生效 / HA | **False green** |
| P-LIVE dual pass = 路由已生效 / verbal effective | **False green** |
| Harness agree dual = G7 success / HA / releaseEvidence=true | **False green** |
| SSOT flip or prove before separate authorize | **Control-plane fault / forbidden**（now authorized） |
| Claim R4/FUNNEL/HA/suite/controlPlane from this flip | **Forbidden** |
| Live Key missing ⇒ structural receipt invalid | **Over-reject** — P-LIVE intentionally Key-unset |
| R4 REAL-WIRE green ⇒ R2 harness agree | **Wrong track** |

---

## 7. Out of scope

- Coding / Worker / API / prove implementation  
- Live Key provisioning or live model invoke prove  
- Closing R1 / R4 / R5 / G7  
- Flip default · open DELETE · Meridian · `.env*`  
- Interfering with R4 REAL-WIRE-IMPL

---

## 8. Dual-review targets

| Expert | REQUEST | Asks |
|--------|---------|------|
| `mw-rag-route` | `reviews/REQUEST-r2-p-harness-agree-mw-rag-route.md` | H1–H6 route/RAG honesty; R2 still open |
| `mw-e2e-ha` | `reviews/REQUEST-r2-p-harness-agree-mw-e2e-ha.md` | Control-plane / EXIT≠closed / G1–G7; no false green |

Implementer **must not** self-pass.

---

*Harness · R2 P-HARNESS / G-R2-8 · 2026-09-17 ~19:45 PT · authorized / SSOT flipped · releaseEvidence=false · R2 structural CLOSED · R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL*
