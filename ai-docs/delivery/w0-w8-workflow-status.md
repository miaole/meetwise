# W0–W8 workflow status（PG-retained parallel track · SSOT）

**Date**: 2026-09-17 (~01:21 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban secrets · Ban self-approve  
**Authority**: meetwise — Postgres (+pgvector + PostgresSaver) retained · MySQL/Qdrant cutover **STOPPED** · Dual PASS ≠ authorize coding · F8/W1 parallel OK

| Knife | Intent | Status | Harness |
|-------|--------|--------|---------|
| **W0** | PG retained (+pgvector + PostgresSaver); stop MySQL/Qdrant cutover | REQUEST-ready / dual in flight (prior) | `harness/pg-retained-checkpoint-postgres-saver.md` |
| **W1** | PG redundant/obsolete table inventory · **ZERO deletes** | REQUEST-ready / not_run:pre_dual (committed) | `harness/w1-pg-redundant-table-inventory.md` |
| **W1b** | Later merge/retire migrations · batch prove | **NOT open** · Dual PASS on W1 ≠ authorize | — |
| **W2** | Resource sizing receipts · 2c4g vs 4c8g under PG(+pgvector+PostgresSaver) | **OPEN** · REQUEST-ready / not_run:pre_dual | `harness/w2-resource-sizing-receipts.md` |
| **W3** | INT-TRANSCRIPT-01 fact-root + public DELETE=503 freeze docs gate | **OPEN** · REQUEST-ready / not_run:pre_dual | `harness/w3-int-transcript-delete-503-freeze.md` |
| **W4…W8** | Subsequent schema/stack hygiene (TBD · separate REQUEST) | **NOT open** | — |

**Hard pins**: Dual PASS ≠ authorize coding · Ban self-approve · PG retained · MySQL/Qdrant STOPPED · F8 parallel noted · Ban claiming HA / W8 closed · may retest W2 after W1b · Ban forge on W3.

**North-star pointer**: `north-star-ha.md` (one-line overlay).

---

*W0–W8 SSOT · 2026-09-17 (~01:21 PT) · releaseEvidence=false · ≠HA · ≠suite · maximize parallel · zero coding this prep*
