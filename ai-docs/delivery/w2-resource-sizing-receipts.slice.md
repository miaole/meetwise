# Slice — **W2** · Resource sizing receipts（2c4g vs 4c8g）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:21 PT)  
**Authority**: meetwise — W0 PG retained → W1 inventory → **W2 sizing receipts** · docs only · Dual PASS ≠ authorize coding · zero coding · zero prove  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban MySQL/Qdrant cutover · Ban claiming capacity / HA  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · REQUEST drafted · **not yet dual-sent**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/w2-resource-sizing-receipts.slice.md` |
| Harness | `ai-docs/delivery/harness/w2-resource-sizing-receipts.md` |
| Eval | `ai-docs/delivery/eval/w2-resource-sizing-receipts.eval.md` |
| Parent W0 sizing § | `harness/pg-retained-checkpoint-postgres-saver.md` §2 |
| W0–W8 SSOT | `w0-w8-workflow-status.md` |
| REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-w2-resource-sizing-receipts-mw-e2e-ha.md` |
| REQUEST · rag-route | `reviews/REQUEST-2026-09-17-w2-resource-sizing-receipts-mw-rag-route.md` |

## One-line scope

Baseline sizing receipts for **2c4g vs 4c8g** under **Postgres (+pgvector + PostgresSaver)** — local/doc simulation OK; **≠HA**; may retest after W1b; `releaseEvidence=false`.

## Hard pins

- Dual PASS ≠ authorize coding · Ban self-approve · PG retained · MySQL/Qdrant STOPPED · F8/W1 parallel noted · `releaseEvidence=false` · ≠HA · ≠suite · ≠ capacity proof · zero coding  

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · no prove · zero coding |

---

*Slice · W2 · 2026-09-17 (~01:21 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · 2c4g vs 4c8g · Dual PASS ≠ authorize coding · zero coding*
