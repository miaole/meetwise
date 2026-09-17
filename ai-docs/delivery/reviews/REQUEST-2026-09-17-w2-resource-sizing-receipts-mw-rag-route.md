# REQUEST — **W2** · Resource sizing receipts（2c4g vs 4c8g）（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~01:21 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ capacity proof** · **≠ RAG quality green** · **≠ Qdrant cutover**  
**Pair**: `REQUEST-2026-09-17-w2-resource-sizing-receipts-mw-e2e-ha.md`  
**Hard**: meetwise W0–W8 — sizing under **pgvector-on-Postgres** retained path · **2c4g vs 4c8g** · Ban Qdrant-as-required vector · Ban treating sizing as retrieve quality · Dual PASS ≠ authorize coding · Ban self-approve · F8/W1 parallel · **zero coding / zero prove**

---

## Contra

| File | Role |
|------|------|
| `harness/w2-resource-sizing-receipts.md` | Canonical harness |
| `w2-resource-sizing-receipts.slice.md` | Slice index |
| `eval/w2-resource-sizing-receipts.eval.md` | Pre-exec eval |
| `harness/pg-retained-checkpoint-postgres-saver.md` §2 | Parent sizing · pgvector co-located |
| `m4-rag-hard-gates.md` | R1–R4 product gates remain · stack cutover STOPPED |
| `w0-w8-workflow-status.md` | Parallel W0–W8 SSOT |
| Parallel **noted** | F8 MS3 · W1 · W3 |

---

## Stance（rag-route）

1. Docs-only: host-class sizing receipts with **pgvector retained** on Postgres  
2. Ban reading 2c4g/4c8g sketches as RAG quality / FUNNEL / R4 closed  
3. Qdrant vector cutover remains STOPPED · sizing ≠ revive cutover  
4. **`not_run:pre_dual`** · Dual PASS ≠ authorize coding  

---

## Please answer

1. Agree vector stays **pgvector on Postgres** · Ban Qdrant-required sole vector in sizing narrative?  
2. Agree 2c4g vs 4c8g receipts ≠ retrieve quality proof · ≠ R4/FUNNEL closed?  
3. Agree W0 §2 co-located PG+pgvector envelope is the right parent?  
4. Agree Dual PASS ≠ authorize coding · Ban self-approve · zero coding?  
5. Agree F8/W1 parallel · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠ capacity?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not R4/FUNNEL closed · not Qdrant cutover · not HA · not suite · Dual PASS ≠ authorize coding

---

*REQUEST · mw-rag-route · W2 · 2026-09-17 (~01:21 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
