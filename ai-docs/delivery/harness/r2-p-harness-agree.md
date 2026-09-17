# Harness — R2 **P-HARNESS / G-R2-8** (harness agree · control-plane honesty)

**Status**: **`pre_exec_dual_pass` / `await_authorize`**  
**Date**: 2026-09-16 (~19:15 PT)  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R2 closed** · **≠ verbal route-effective** · **≠ R4** · **≠ controlPlaneClosed** · **≠ G7 effective**  
**Experts (pre-exec dual PASS)**: `mw-rag-route` + `mw-e2e-ha`  
**Dual reviews (both pass)**: `ai-docs/delivery/reviews/2026-09-16-r2-p-harness-agree-mw-rag-route.md` · `ai-docs/delivery/reviews/2026-09-16-r2-p-harness-agree-mw-e2e-ha.md`
**Parent**: `harness/r2-classify-job-route.md` · `harness/r2-classify-job-route-status.md` · `eval/r2-classify-job-route.eval.md`  
**Inventory**: `delivery/r2-remaining-gates.inventory.md`  
**Prior**: P-MODEL…P-FAKE dual-passed · G-R2-5 retrieve-side CLOSED · **P-LIVE dual-passed** (both domains pass 2026-09-16) · **P-HARNESS pre-exec dual-passed** · **R2 still NOT closed**

---

## 0. Stance (read first)

| Statement | Ruling |
|-----------|--------|
| What is this knife? | **Docs / control-plane honesty gate**: harness **agree** that P-LIVE dual receipts are enough as **structural** classify→bind→snapshot→refuse/allow evidence; prepare SSOT sync off stale "pending dual" **after separate authorize**; pin verbal ban |
| What is it not? | **Not** coding · **not** prove-run · **not** live Key · **not** R2 close · **not** verbal「路由已生效」 · **not** R4 / G7 |
| R2 closed after this knife's dual? | **Still NO** unless a *later* authorize explicitly closes R2 — this knife **forbids** self-declaring R2 closed even on dual pass |
| Route verbally effective? | **NO** — structural receipt ≠ verbal / control-plane "effective" |
| Success ≠ | Dual pass / docs sync ≠ G7 success · ≠ HA · ≠ `releaseEvidence=true` |

---

## 1. Why this knife (highest-value remaining)

After P-MODEL…P-LIVE dual passes, GAP-RAG-02 / P-LIVE reviews still name **harness agree** as the open R2 gate. SSOT lag ("P-LIVE pending dual") remains **await_authorize**: no silent pointer flip, and no over-claim (someone narrates verbal 生效 from dual alone).

This knife unblocks honesty without false green.

---

## 2. Acceptance criteria (H1–H8)

| ID | Criterion | Pass look like | False green if… |
|----|-----------|----------------|------------------|
| **H1** | Fact: P-LIVE dual receipts exist and conclude **pass** | Cite both review paths | Treat single-domain as dual |
| **H2** | Harness **agrees** Key-unset structural loop is a valid **structural route-effective receipt** | Explicit agree language in harness/status | Equate receipt = verbal 生效 |
| **H3** | SSOT sync plan: status / parent harness / eval / m4 §R2 / GAP-RAG-02 may retire stale "P-LIVE pending dual" **only after** this dual pass **and a separate authorize**; current pointers remain `await_authorize` | Edits gated on dual + authorize | Edit SSOT before authorize / self-pass |
| **H4** | **R2 NOT closed** remains pinned | Hard sentence in all artefacts | Dual pass → claim R2 closed |
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
| `pnpm r2-p-live-route-effective:prove` | **0** (if re-run later) | **`not_run:await_authorize`** | Prior P-LIVE evidence only; ≠ R2 closed |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | **`not_run:await_authorize`** | Must still pin R2 NOT closed |
| `pnpm r2-p-fake-route-classify:prove` | **0** | **`not_run:await_authorize`** | Prior; ≠ verbal 生效 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **`not_run:await_authorize`** | ≠ R4 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | **`not_run:await_authorize`** | ≠ domain isolated |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **`not_run:await_authorize`** | §R2 doc gate |
| Doc-honesty / SSOT sync script | n/a | **no script this knife** | **await_authorize**; docs-only; no prove |

**Ban**: do not add or run a new prove to "close" this knife before separate authorize. Post-dual SSOT edits need **separate authorize** (not self-serve).

---

## 5. NHP / G2–G6 columns (mandatory)

| Col | Case / note | Flag |
|-----|-------------|------|
| **NEG** | Claim R2 closed / verbal 生效 from dual alone → reject | honesty pin (this knife) |
| **FAULT** | SSOT flip/prove before separate authorize → control-plane fault | **await_authorize** until H3 |
| **BOUND** | Structural receipt boundary ≠ live Key ≠ verbal | pin |
| **ADV** | Self-pass / single-domain dual-passed claim | forbidden |
| **PERF** | n/a capacity | **blind** / `not_run` |
| **LOAD** | n/a | **blind** / `not_run` |
| PERF_api / PERF_web / LOAD_worker | — | **blind** |

---

## 6. False-green table

| If someone says… | Ruling |
|------------------|--------|
| P-LIVE dual pass = R2 closed | **False close** |
| P-LIVE dual pass = 路由已生效 / verbal effective | **False green** |
| Harness agree dual = G7 success / HA / releaseEvidence=true | **False green** |
| SSOT flip or prove before separate authorize | **Control-plane fault / forbidden** |
| Edit SSOT to "R2 closed" in this knife | **Forbidden** |
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

*Harness · R2 P-HARNESS / G-R2-8 · 2026-09-16 ~19:15 PT · pre_exec_dual_pass / await_authorize · releaseEvidence=false · R2 NOT closed*
