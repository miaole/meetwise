# REQUEST — **W2** · Resource sizing receipts（2c4g vs 4c8g）（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:21 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ capacity proof** · **≠ MySQL/Qdrant cutover**  
**Pair**: `REQUEST-2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md`  
**Hard**: meetwise W0–W8 — baseline sizing under **Postgres (+pgvector + PostgresSaver)** · **2c4g vs 4c8g** · local/doc sim OK · **≠HA** · may retest after W1b · Dual PASS ≠ authorize coding · Ban self-approve · MySQL/Qdrant STOPPED · F8/W1 parallel · **zero coding / zero prove**

---

## Contra

| File | Role |
|------|------|
| `harness/w2-resource-sizing-receipts.md` | Canonical harness |
| `w2-resource-sizing-receipts.slice.md` | Slice index |
| `eval/w2-resource-sizing-receipts.eval.md` | Pre-exec eval |
| `harness/pg-retained-checkpoint-postgres-saver.md` §2 | Parent W0 sizing envelope |
| `adr-postgres-retained.md` | Retained stack ADR |
| `w0-w8-workflow-status.md` | Parallel W0–W8 SSOT |
| Parallel **noted** | F8 MS3 · W1 inventory · W3 freeze (separate) |

---

## Stance（E2E-HA）

1. Docs-only: baseline sizing **receipts** for **2c4g vs 4c8g** on retained PG stack  
2. Local/doc simulation OK · **≠HA** · ≠suite · ≠ capacity proof  
3. Inherit W0 §2 honesty · deepen into host-class receipt contract  
4. May retest after W1b · Dual PASS ≠ authorize W1b  
5. **`not_run:pre_dual`** · zero coding · Dual PASS ≠ authorize coding  

---

## Please answer

1. Agree W2 scope = sizing receipts under **Postgres (+pgvector + PostgresSaver)** only · Ban MySQL/Qdrant revival?  
2. Agree compare **2c4g vs 4c8g** · local/doc sim OK · Ban HA / multi-AZ narrative?  
3. Agree parent W0 harness §2 is the right sizing envelope to reference?  
4. Agree may retest after W1b · Dual PASS ≠ authorize W1b deletes/migrations?  
5. Agree F8/W1 parallel OK · neither blocks W2 · W2 blocks neither?  
6. Agree `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve · Ban secrets?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w2-resource-sizing-receipts-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not coding authorized · not HA · not suite · not capacity · not cutover · Dual PASS ≠ authorize coding

---

*REQUEST · mw-e2e-ha · W2 · 2026-09-17 (~01:21 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
