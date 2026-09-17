# Harness — **W7** · E2E/NHP matrix gap-close plan（docs REQUEST prep）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:40 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ matrix all covered** · **≠ G7 suite green** · **Ban claiming covered without EXIT** · **Ban false green** · **≠ coding authorized**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec REQUEST pair · **not yet dual-sent** · **zero coding / zero prove** · **Ban self-approve** · **Dual PASS ≠ authorize coding**）  
**Slice**: `../w7-e2e-nhp-matrix-gap-close.slice.md`  
**Eval**: `../eval/w7-e2e-nhp-matrix-gap-close.eval.md`  
**Authority**: meetwise W0–W8 SSOT — docs-only **gap-close plan** for E2E requirement matrix + NHP case matrix · Dual PASS ≠ authorize coding  

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate REQUEST prep: **plan** how to close remaining E2E/NHP matrix gaps by pointing at existing SSOT matrices, backlog, and prior NHP batches — honesty inventory only |
| **What this knife is not** | **Not** coding · **not** prove · **not** running `e2e:isolated` / perf / LOAD as green · **not** flipping rows to `covered` · **not** claiming G7 suite green · **not** HA |
| **Covered rule** | **`covered` requires CMD + EXIT=0 + dual/honesty read** · **Ban claiming covered without EXIT** · prior Batch1–3 / NHP-R4-ADV honesty ≠ wholesale matrix covered |
| **False green** | partial / case-only / gap / blind / honesty-pin / not_run / conn-only / blocked **≠** covered · **Ban false green** |
| **Prior batches** | Batch1–3 = `post_prove_dual_pass` honesty/partial only · NHP-R4-ADV-01 = covered **THIS case only** · covered ≠ R4 closed ≠ HA |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero prove |

---

## 1. Existing docs (pointers · no rewrite)

| Path | Role |
|------|------|
| `e2e-requirement-coverage-matrix.md` | E2E coverage SSOT · §0.5 NEG/FAULT/BOUND/ADV/PERF/LOAD · Ban invent covered |
| `non-happy-path-perf-load-case-matrix.md` | NHP case IDs · Batch1–3 + R4-ADV pointers · remaining case-only/gap/blind |
| `harness/non-happy-path-perf-load-matrix.md` | NHP harness contract · not_run:pre_dual discipline for unexecuted |
| `eval/non-happy-path-perf-load-matrix.eval.md` | NHP eval notes |
| `e2e-covered-path-backlog.md` | partial→covered still-missing list |
| `e2e-case-inventory.md` · `harness/e2e-full-suite.inventory.md` | Case / suite inventory honesty |
| `nhp-batch1-neg-perf.slice.md` · `nhp-batch2-neg-fault.slice.md` · `nhp-batch3-fault-bound.slice.md` | Prior executed honesty batches |
| `nhp-r4-adv-covered-path.slice.md` | Sole covered-path example · **THIS case only** |
| `north-star-hard-gates.md` | G2/G6 forced columns · G7 gate ≠ suite green |
| `gap-bug-backlog.md` | BUG-E2E-ISO · related fake-green inventory |
| `w0-w8-workflow-status.md` | Parallel W0–W8 SSOT |

---

## 2. Gap-close plan outline（docs only · later knives）

W7 dual (if PASS) unlocks **only** agreement on a docs plan. Later separate REQUESTs may:

1. **Inventory** remaining `blind` / `case-only` / `gap` / `partial` rows from both matrices + `e2e-covered-path-backlog.md`  
2. **Batch** next NHP/E2E knives by facet (NEG/FAULT/BOUND/ADV then PERF/LOAD) — no silent covered promotion  
3. **Require** each promotion to `covered`: CMD + EXIT + dual receipt + honesty read (`≠ HA` / `≠ R2/R4` as applicable)  
4. **Keep** out-of-scope explicit (UI-pay / cloud-kill / HA-failover rows already named gap)  
5. **Ban** treating Batch1–3 EXIT=0 or NHP-R4-ADV THIS-case covered as full matrix green  

Provisional plan receipt path (non-authorizing · optional later): `receipts/w7-e2e-nhp-matrix-gap-close-plan.draft.md`.

---

## 3. Pins (must survive dual)

1. **Ban claiming covered without EXIT** (CMD + EXIT=0 + honest dual read)  
2. **Ban false green** · partial/case-only/gap/blind/honesty-pin ≠ covered  
3. Point at existing E2E/NHP matrices + backlog + prior batches · Ban inventing prove EXIT this prep  
4. Prior Batch1–3 = honesty/partial only · NHP-R4-ADV covered = **THIS case only** · ≠ R4 closed ≠ HA  
5. `releaseEvidence=false` · ≠HA · ≠suite · ≠ G7 suite green · Dual PASS ≠ authorize coding · Ban self-approve · zero coding  
6. PG retained · MySQL/Qdrant cutover **STOPPED**  
7. Ban secrets / `.env*`  

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · **no prove script** · zero coding |
| Prior (reference only · not run here) | NHP Batch1–3 / R4-ADV proves · `e2e:isolated` · `verify:e2e-performance` — **Ban** treating prior EXIT as W7 / full-matrix green |

---

## 5. Non-claims

Not pass · not coding authorized · not matrix all covered · not G7 suite green · not HA · not false green · Dual PASS ≠ authorize coding · Ban covered without EXIT

---

*Harness · W7 E2E/NHP matrix gap-close · 2026-09-17 (~01:40 PT) · REQUEST-ready / not_run:pre_dual · Ban covered without EXIT · Ban false green · releaseEvidence=false · ≠HA · Dual PASS ≠ authorize coding · zero coding*
