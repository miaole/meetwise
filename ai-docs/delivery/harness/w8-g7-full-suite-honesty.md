# Harness — **W8** · G7 full-suite honesty（docs REQUEST prep）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:57 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ full suite pass** · **gates-in-force ≠ suite-green** · **Ban false green** · **Ban claiming HA/suite green from this REQUEST** · **≠ coding authorized** · **Dual PASS ≠ coding**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（REQUEST pair ready · **not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding / prove / suite green / HA** · **zero coding / zero prove / zero suite re-run**）  
**Slice**: `../w8-g7-full-suite-honesty.slice.md`  
**Eval**: `../eval/w8-g7-full-suite-honesty.eval.md`  
**Authority**: meetwise W0–W8 SSOT — docs-only **G7 full-suite honesty** gate · Dual PASS ≠ authorize coding  
**Honesty**: Opening REQUEST only · **≠** suite green · **≠** HA · **≠** 0 BUG · prior `post_suite_dual_pass` ≠ suite green

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate REQUEST prep: reaffirm **G7 gates-in-force ≠ suite-green** honesty by pointing at existing G7 suite / north-star / e2e matrix docs — no re-run, no coding |
| **What this knife is not** | **Not** coding · **not** prove · **not** re-running `e2e:isolated` / UC / R2/R4 / HA probes as green · **not** flipping suite to green · **not** claiming HA / 0 BUG / `releaseEvidence=true` · **not** W1c-delete / DROP |
| **Gates vs suite** | G1–G7 **gates-in-force** (policy) **≠** suite green · prior suite = `post_suite_dual_pass` (honesty only) · **pass ≠ suite green ≠ full suite pass ≠ HA ≠ 0 BUG** |
| **False green** | knife green / dual / prove EXIT=0 / `post_suite_dual_pass` / gates-in-force **≠** suite green · **Ban false green** |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · docs-only open · zero coding · zero prove · Ban self-approve |

---

## Dual receipts (pre-exec)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | REQUEST `../reviews/REQUEST-2026-09-17-w8-g7-full-suite-honesty-mw-e2e-ha.md` | **not_run:pre_dual** |
| `mw-rag-route` | REQUEST `../reviews/REQUEST-2026-09-17-w8-g7-full-suite-honesty-mw-rag-route.md` | **not_run:pre_dual** |

No dual conclusion yet · Ban implementer writing pass · Dual PASS (later) ≠ authorize coding · ≠ suite green · ≠ HA.

---

## 1. Existing docs (pointers · no rewrite)

| Path | Role |
|------|------|
| `north-star-hard-gates.md` **G7** | Gate **已生效** = 门禁强制 · **≠** suite green / full suite pass |
| `north-star-ha.md` | HA north-star · evidence ladder · W0–W8 overlay · G7 pin |
| `g7-full-suite-plan.slice.md` | Existing full-suite plan + executed honesty index |
| `harness/local-full-suite-verification.md` | Canonical local full-suite verification harness |
| `eval/g7-full-suite-plan.eval.md` | Existing suite plan eval |
| `receipts/2026-09-16-g7-full-suite-run.md` | Prior run receipt · 41×0 / 4×nonzero / 3×Key-blocked · **≠ suite green** |
| `reviews/2026-09-16-g7-full-suite-post-run-mw-e2e-ha.md` · `…-mw-rag-route.md` | Post-suite dual **pass** = receipt honesty only · **≠ suite green** |
| `reviews/2026-09-16-north-star-g7-local-full-suite-mw-e2e-ha.md` · `…-mw-rag-route.md` | G7 gate-in-force dual (policy) · **≠ suite green** |
| `e2e-requirement-coverage-matrix.md` | E2E coverage SSOT · Ban invent covered |
| `harness/e2e-full-suite.inventory.md` | Suite inventory honesty |
| `non-happy-path-perf-load-case-matrix.md` | NHP companion matrix |
| `g7-honesty-knives.slice.md` | Prior G7 honesty knives index · **≠** suite green |
| `w0-w8-workflow-status.md` | Parallel W0–W8 SSOT |
| `w7-e2e-nhp-matrix-gap-close.slice.md` | Prior W7 matrix gap-close plan · Ban covered without EXIT |

---

## 2. Honesty outline（docs only · this REQUEST）

W8 REQUEST unlocks **only** agreement to hard-pin:

1. **gates-in-force ≠ suite-green** — G7 policy effective ≠ suite ran-as-green / delivery success  
2. Prior `post_suite_dual_pass` = receipt honesty only · **≠** suite green · **≠** full suite pass · **≠** HA · **≠** 0 BUG  
3. **4×nonzero retained as gaps** · **3×Key-blocked honesty retained** · **R2/R4 still open** (per existing receipt / hard-gates)  
4. Point at existing G7 suite / north-star / e2e matrix docs · Ban inventing new prove EXIT this prep  
5. Ban claiming HA / suite green / `releaseEvidence=true` / controlPlaneClosed from this REQUEST  
6. Dual PASS ≠ authorize coding · Ban self-approve · zero coding · zero suite re-run  

**Explicitly out of scope**: W1c-delete · DROP migrations · schema DROP · MySQL/Qdrant revive · application coding.

---

## 3. Pins (must survive dual)

1. **gates-in-force ≠ suite-green**  
2. **Ban false green** · knife/dual/`post_suite_dual_pass`/EXIT=0 ≠ suite green ≠ HA ≠ 0 BUG  
3. Ban claiming HA / suite green / full suite pass from this REQUEST  
4. Point at existing G7 suite + north-star + e2e matrix docs · Ban inventing prove EXIT  
5. `releaseEvidence=false` · Dual PASS ≠ authorize coding · Ban self-approve · zero coding · zero suite re-run  
6. PG retained · MySQL/Qdrant cutover **STOPPED**  
7. Ban secrets / `.env*`  
8. Ban W1c-delete / DROP content in this knife  

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · REQUEST pair ready · **no prove script** · zero coding · zero suite re-run |
| Prior (reference only · not re-run here) | G7 suite receipt 2026-09-16 · post-suite dual · gate-in-force dual — **Ban** treating prior EXIT / `post_suite_dual_pass` as W8 / suite green |

---

## 5. Non-claims

REQUEST open **`not_run:pre_dual` only** · not dual pass · not coding authorized · not suite green · not HA · not 0 BUG · Dual PASS ≠ authorize coding · Ban false green · Ban claiming HA/suite green from this REQUEST · `releaseEvidence=false`

---

*Harness · W8 G7 full-suite honesty · 2026-09-17 (~01:57 PT) · REQUEST-ready / not_run:pre_dual · gates-in-force ≠ suite-green · Ban false green · releaseEvidence=false · ≠HA · ≠suite · Dual PASS ≠ authorize coding · zero coding*
