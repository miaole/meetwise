# W0–W8 workflow status（PG-retained parallel track · SSOT）

**Date**: 2026-09-17 (~01:33 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban secrets · Ban self-approve  
**Authority**: meetwise — Postgres (+pgvector + PostgresSaver) retained · MySQL/Qdrant cutover **STOPPED** · Dual PASS ≠ authorize coding · F8/W1 parallel OK

| Knife | Intent | Status | Harness |
|-------|--------|--------|---------|
| **W0** | PG retained (+pgvector + PostgresSaver); stop MySQL/Qdrant cutover | **`post_prove_dual_pass`** · dual on `0c95883` · wake provisional overlay after dual (not user hard pin · no wake re-dual) | `harness/pg-retained-checkpoint-postgres-saver.md` |
| **W1** | PG redundant/obsolete table inventory · **ZERO deletes** | REQUEST-ready / not_run:pre_dual (committed) | `harness/w1-pg-redundant-table-inventory.md` |
| **W1b** | Later merge/retire migrations · batch prove | **NOT open** · Dual PASS on W1 ≠ authorize | — |
| **W2** | Resource sizing receipts · 2c4g vs 4c8g under PG(+pgvector+PostgresSaver) | **OPEN** · REQUEST-ready / not_run:pre_dual | `harness/w2-resource-sizing-receipts.md` |
| **W3** | INT-TRANSCRIPT-01 fact-root + public DELETE=503 freeze docs gate | **OPEN** · REQUEST-ready / not_run:pre_dual | `harness/w3-int-transcript-delete-503-freeze.md` |
| **W4** | R2 close-auth REQUEST prep (authorize checklist / receipt) | **`post_prove_dual_pass`** · docs-only · dual on `25833fc` (e2e-ha+rag) · **R2 still NOT closed** · ≠ verbal route-effective · Dual PASS ≠ authorize coding / SSOT flip | `harness/w4-r2-close-authorize-receipt.md` |
| **W5…W8** | Subsequent schema/stack hygiene (TBD · separate REQUEST) | **NOT claimed closed here** · W5 may be REQUEST-open elsewhere · Ban fold into R2 closed | — |

**Honesty (W0)**: Dual reviews against knife SHA / HEAD **`0c95883`**. Later tip may include provisional Postgres LISTEN/NOTIFY wake preference overlay (e.g. `32d0724`) — **wake = provisional overlay after dual** · **not a user hard pin** · **does not require wake-patch re-dual**. Redis still orthogonal / not STOPPED. Docs close ≠ coding auth · `releaseEvidence=false` · ≠HA · MySQL/Qdrant STOPPED.

**Honesty (W4)**: Dual PASS closes **W4 docs checklist prep only**. **R2 is NOT closed** · routing **not** claimed effective · R2 status SSOT **not** flipped · later real coding (R2 SSOT flip) needs **separate REQUEST**. Dual PASS ≠ fake R2 close · `releaseEvidence=false`.

**Hard pins**: Dual PASS ≠ authorize coding · Ban self-approve · PG retained · MySQL/Qdrant STOPPED · F8 parallel noted · Ban claiming HA / W8 closed · may retest W2 after W1b · Ban forge on W3 · **Ban claiming R2 closed from W4**.

**North-star pointer**: `north-star-ha.md` (one-line overlay).

---

*W0–W8 SSOT · 2026-09-17 (~01:33 PT) · W0 post_prove_dual_pass · W4 post_prove_dual_pass (R2 NOT closed) · releaseEvidence=false · ≠HA · ≠suite · maximize parallel · Dual PASS ≠ coding*
