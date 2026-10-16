# Harness — **W2** · Resource sizing receipts（2c4g vs 4c8g · PG retained）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:35 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ capacity proof** · **≠ MySQL/Qdrant cutover** · **≠ W1b authorized** · **≠ coding authorized** · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · **Ban self-approve** · **Dual PASS ≠ authorize coding** · **zero coding / zero prove**）  
**Slice**: `../w2-resource-sizing-receipts.slice.md`  
**Eval**: `../eval/w2-resource-sizing-receipts.eval.md`  
**Authority**: meetwise W0–W8 SSOT — **W0** PG retained → **W1** inventory → **W2** this sizing receipts knife → **W3…W8** parallel-noted · Dual PASS ≠ authorize coding  
**Parent pointer**: W0 sizing § = `harness/pg-retained-checkpoint-postgres-saver.md` **§2 Resource sizing** · ADR `adr-postgres-retained.md` · SSOT `w0-w8-workflow-status.md`
**Honesty**: Dual reviews against knife SHA **`3463e9e`**. Docs close ≠ coding auth · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity** · measured compose later needs separate REQUEST.

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-w2-resource-sizing-receipts-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `../reviews/2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md` | **pass** |

Dual SHA: **`3463e9e1af886518ea456a089c52761d3c7ed5a5`** (short **`3463e9e`**). Docs honesty close only · **≠ HA** · **≠ capacity green**.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate + **baseline sizing receipts plan** for **2c4g vs 4c8g** under **Postgres (+pgvector + PostgresSaver)**; local/doc simulation OK |
| **What this knife is not** | **Not** HA prove · **not** suite green · **not** production capacity cert · **not** MySQL/Qdrant cutover · **not** W1b deletes · **not** coding/prove this prep |
| **Compare** | Same retained stack on two host envelopes: **2 vCPU / 4 GiB** vs **4 vCPU / 8 GiB** |
| **Retest** | May **retest after W1b** (schema merge/retire) · separate authorize; Dual PASS here ≠ schedule W1b |
| **Parallel** | F8 MS3 + W1 inventory may run parallel · neither blocks W2 · W2 must not block F8/W1 |
| **Now** | **`post_prove_dual_pass`** · docs-only close · zero coding · zero prove · Dual PASS ≠ authorize coding · sizing ≠ HA / capacity |

---

## 1. Pins (must survive dual)

1. Scope = baseline sizing **receipts** under **Postgres (+pgvector + PostgresSaver)** only  
2. Compare **2c4g** vs **4c8g** · local/doc simulation OK · Ban treating as HA / multi-AZ evidence  
3. Reference W0 harness **§2 Resource sizing** as parent envelope; this knife deepens into host-class receipts  
4. `releaseEvidence=false` · ≠HA · ≠suite green · ≠ capacity proof  
5. Dual PASS ≠ authorize coding · Ban self-approve · zero coding / zero prove this prep  
6. PG retained · MySQL/Qdrant cutover remains **STOPPED**  
7. F8 / W1 parallel noted · Ban blocking either  
8. May retest after W1b · Ban claiming W1b authorized  
9. Ban secrets / `.env*` in commits · Ban claiming HA

---

## 2. Receipt artifact plan (later coding/sim knife · not this prep)

W2 dual (if PASS) unlocks **only** a documented receipt contract. A **later** sim/coding knife may emit read-only receipts such as:

| Field | Purpose |
|-------|---------|
| `host_class` | `2c4g` · `4c8g` |
| `stack` | `postgres+pgvector+PostgresSaver` (fixed) |
| `sim_mode` | `local-doc` · `compose-sketch` · `measured-later` |
| `cpu_sketch` | Planning note under interview-class load (order **10s** sessions · ≠ HA) |
| `ram_sketch` | Working-set vs W0 §2 envelopes · shared_buffers / indexes / checkpoint growth honesty |
| `disk_sketch` | One volume family: tables + WAL + pgvector indexes + checkpoint blobs |
| `ban` | Explicit **≠HA** · ≠suite · ≠production cert · no MySQL/Qdrant revival |

Provisional receipt path (non-authorizing · optional later): `receipts/w2-resource-sizing-2c4g-vs-4c8g.draft.md`.

---

## 3. Method (docs / local simulation · planned)

1. **Inherit** W0 §2 assumptions (single-host / compose class · not multi-AZ · Ban HA narrative)  
2. **Map** 2c4g and 4c8g onto retained PG(+pgvector+PostgresSaver) process family  
3. **Contrast** vs former MySQL+Qdrant+Redis three-process plan only as honesty (cutover STOPPED)  
4. **Defer** measured compose numbers to a later authorized sim knife · this REQUEST is docs gate only  
5. **Retest hook**: after W1b (if ever authorized), re-run sizing under leaner schema — separate REQUEST

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`post_prove_dual_pass`** · dual receipts archived · SHA `3463e9e` · **no prove script** · zero coding |

---

## 5. Non-claims

Docs close **`post_prove_dual_pass` only** · not coding authorized · not HA · not suite green · not capacity proof · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity** · not MySQL/Qdrant cutover · not W1b · not W8 · Dual PASS ≠ authorize coding · F8/W1 not blocked · `releaseEvidence=false`

---

*Harness · W2 resource sizing receipts · 2026-09-17 (~01:35 PT) · post_prove_dual_pass · dual on 3463e9e · releaseEvidence=false · ≠HA · ≠suite · ≠capacity · sizing≠HA · Dual PASS≠fake capacity · 2c4g vs 4c8g · PG+pgvector+PostgresSaver · Dual PASS ≠ authorize coding · zero coding*
