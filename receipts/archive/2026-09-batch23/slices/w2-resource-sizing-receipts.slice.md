# Slice — **W2** · Resource sizing receipts（2c4g vs 4c8g）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:35 PT)  
**Authority**: meetwise — W0 PG retained → W1 inventory → **W2 sizing receipts** · docs only · pre-exec dual **PASS**（SHA `3463e9e`）→ **`post_prove_dual_pass`** · Dual PASS ≠ authorize coding · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity** · zero coding · zero prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban MySQL/Qdrant cutover · Ban claiming capacity / HA  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · dual **PASS** · SHA `3463e9e`

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/w2-resource-sizing-receipts.slice.md` |
| Harness | `ai-docs/delivery/harness/w2-resource-sizing-receipts.md` |
| Eval | `ai-docs/delivery/eval/w2-resource-sizing-receipts.eval.md` |
| Parent W0 sizing § | `harness/pg-retained-checkpoint-postgres-saver.md` §2 |
| W0–W8 SSOT | `w0-w8-workflow-status.md` |
| Review · e2e-ha | `reviews/2026-09-17-w2-resource-sizing-receipts-mw-e2e-ha.md` · **pass** |
| Review · rag-route | `reviews/2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md` · **pass** |

## One-line scope

Baseline sizing receipts for **2c4g vs 4c8g** under **Postgres (+pgvector + PostgresSaver)** — local/doc simulation OK; **≠HA**; **sizing ≠ capacity green**; Dual PASS ≠ fake capacity; may retest after W1b; `post_prove_dual_pass` on `3463e9e`; `releaseEvidence=false`.

## Hard pins

- Dual PASS ≠ authorize coding · **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity** · Ban self-approve · PG retained · MySQL/Qdrant STOPPED · F8/W1 parallel noted · `releaseEvidence=false` · ≠HA · ≠suite · ≠ capacity proof · zero coding  

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`post_prove_dual_pass`** · dual on `3463e9e` · no prove · zero coding |

---

*Slice · W2 · 2026-09-17 (~01:35 PT) · post_prove_dual_pass · dual on 3463e9e · releaseEvidence=false · ≠HA · ≠suite · ≠capacity · sizing≠HA · Dual PASS≠fake capacity · 2c4g vs 4c8g · PG+pgvector+PostgresSaver · Dual PASS ≠ authorize coding · zero coding*
