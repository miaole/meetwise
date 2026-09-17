# Harness — **W7** · E2E/NHP matrix gap-close plan（docs REQUEST prep）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:46 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ matrix all covered** · **≠ G7 suite green** · **Ban claiming covered without EXIT** · **Ban false green** · **≠ coding authorized** · **Dual PASS ≠ coding / fake-close matrix**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** on knife SHA **`b709753`** · **Ban self-approve** · **Dual PASS ≠ authorize coding / prove / covered promotion / fake-close matrix** · **zero coding / zero prove**）  
**Slice**: `../w7-e2e-nhp-matrix-gap-close.slice.md`  
**Eval**: `../eval/w7-e2e-nhp-matrix-gap-close.eval.md`  
**Authority**: meetwise W0–W8 SSOT — docs-only **gap-close plan** for E2E requirement matrix + NHP case matrix · Dual PASS ≠ authorize coding · ≠ fake-close matrix  
**Honesty**: Dual reviews against knife SHA **`b709753`**. Docs close = plan-gate dual only · **≠** coding · **≠** matrix all covered · **≠** G7 suite green · **≠** HA

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate REQUEST prep: **plan** how to close remaining E2E/NHP matrix gaps by pointing at existing SSOT matrices, backlog, and prior NHP batches — honesty inventory only |
| **What this knife is not** | **Not** coding · **not** prove · **not** running `e2e:isolated` / perf / LOAD as green · **not** flipping rows to `covered` · **not** claiming G7 suite green · **not** HA · **not** fake-close matrix |
| **Covered rule** | **`covered` requires CMD + EXIT=0 + dual/honesty read** · **Ban claiming covered without EXIT** · prior Batch1–3 / NHP-R4-ADV honesty ≠ wholesale matrix covered |
| **False green** | partial / case-only / gap / blind / honesty-pin / not_run / conn-only / blocked **≠** covered · **Ban false green** |
| **Prior batches** | Batch1–3 = `post_prove_dual_pass` honesty/partial only · NHP-R4-ADV-01 = covered **THIS case only** · covered ≠ R4 closed ≠ HA |
| **Now** | **`post_prove_dual_pass`** · docs-only close · zero coding · zero prove · Ban self-approve |

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-w7-e2e-nhp-matrix-gap-close-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `../reviews/2026-09-17-w7-e2e-nhp-matrix-gap-close-mw-rag-route.md` | **pass** |

Dual knife SHA: **`b709753f02665ed3ff9777616e857837fde79ac4`** (short **`b709753`**). Docs close only — **≠** coding authorized · **≠** matrix all covered · **≠** G7 suite green · **≠** fake-close matrix · Ban covered without EXIT · Ban false green.

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

W7 dual **PASS** unlocks **only** agreement on a docs plan. Later separate REQUESTs may:

1. **Inventory** remaining `blind` / `case-only` / `gap` / `partial` rows from both matrices + `e2e-covered-path-backlog.md`  
2. **Batch** next NHP/E2E knives by facet (NEG/FAULT/BOUND/ADV then PERF/LOAD) — no silent covered promotion  
3. **Require** each promotion to `covered`: CMD + EXIT + dual receipt + honesty read (`≠ HA` / `≠ R2/R4` as applicable)  
4. **Keep** out-of-scope explicit (UI-pay / cloud-kill / HA-failover rows already named gap)  
5. **Ban** treating Batch1–3 EXIT=0 or NHP-R4-ADV THIS-case covered as full matrix green  

Provisional plan receipt path (non-authorizing · optional later): `receipts/w7-e2e-nhp-matrix-gap-close-plan.draft.md`.

---

## 3. Pins (must survive dual · still binding after close)

1. **Ban claiming covered without EXIT** (CMD + EXIT=0 + honest dual read)  
2. **Ban false green** · partial/case-only/gap/blind/honesty-pin ≠ covered  
3. Point at existing E2E/NHP matrices + backlog + prior batches · Ban inventing prove EXIT this prep  
4. Prior Batch1–3 = honesty/partial only · NHP-R4-ADV covered = **THIS case only** · ≠ R4 closed ≠ HA  
5. `releaseEvidence=false` · ≠HA · ≠suite · ≠ G7 suite green · Dual PASS ≠ authorize coding · Dual PASS ≠ fake-close matrix · Ban self-approve · zero coding  
6. PG retained · MySQL/Qdrant cutover **STOPPED**  
7. Ban secrets / `.env*`  

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`post_prove_dual_pass`** · dual receipts archived · **no prove script** · zero coding |
| Prior (reference only · not run here) | NHP Batch1–3 / R4-ADV proves · `e2e:isolated` · `verify:e2e-performance` — **Ban** treating prior EXIT as W7 / full-matrix green |

---

## 5. Non-claims

Docs close **`post_prove_dual_pass` only** · not coding authorized · not matrix all covered · not G7 suite green · not HA · not false green · Dual PASS ≠ authorize coding · Dual PASS ≠ fake-close matrix · Ban covered without EXIT · Ban self-approve · `releaseEvidence=false`

---

*Harness · W7 E2E/NHP matrix gap-close · 2026-09-17 (~01:46 PT) · post_prove_dual_pass · dual on b709753 · Ban covered without EXIT · Ban false green · releaseEvidence=false · ≠HA · ≠suite · Dual PASS ≠ authorize coding · Dual PASS ≠ fake-close matrix · zero coding*
