# W0–W8 workflow status（PG-retained parallel track · SSOT）

**Date**: 2026-09-17 (~01:47 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban secrets · Ban self-approve  
**Authority**: meetwise — Postgres (+pgvector + PostgresSaver) retained · MySQL/Qdrant cutover **STOPPED** · Dual PASS ≠ authorize coding · F8/W1 parallel OK

| Knife | Intent | Status | Harness |
|-------|--------|--------|---------|
| **W0** | PG retained (+pgvector + PostgresSaver); stop MySQL/Qdrant cutover | **`post_prove_dual_pass`** · dual on `0c95883` · wake provisional overlay after dual (not user hard pin · no wake re-dual) | `harness/pg-retained-checkpoint-postgres-saver.md` |
| **W1** | PG redundant/obsolete table inventory · **ZERO deletes** | **`post_prove_dual_pass`** · dual on `675269c` (e2e-ha+rag) · formal receipt · **≠ W1b** · ZERO DROP · hypotheses ≠ deletes · HARD RETAIN non-DROP-able | `harness/w1-pg-redundant-table-inventory.md` |
| **W1b** | PG redundant retire/trace batches · **ZERO DROP** · docs/trace only | **`REQUEST-ready / not_run:pre_dual`** · Dual PASS on W1 ≠ auto-auth coding · **no delete batch** · ≠DROP · Dual PASS≠coding | `harness/w1b-pg-redundant-retire-batches.md` |
| **W2** | Resource sizing receipts · 2c4g vs 4c8g under PG(+pgvector+PostgresSaver) | **`post_prove_dual_pass`** · dual on `3463e9e` · **sizing ≠ HA / capacity green** · Dual PASS ≠ fake capacity · Dual PASS ≠ coding | `harness/w2-resource-sizing-receipts.md` |
| **W3** | INT-TRANSCRIPT-01 fact-root + public DELETE=503 freeze docs gate | **`post_prove_dual_pass`** · dual on `3463e9e` · **DELETE=503 freeze** · Ban open DELETE · INT-TRANSCRIPT-01 still frozen/honest · Dual PASS ≠ coding | `harness/w3-int-transcript-delete-503-freeze.md` |
| **W4** | R2 close-auth REQUEST prep (authorize checklist / receipt) | **`post_prove_dual_pass`** · docs-only · dual on `25833fc` (e2e-ha+rag) · **R2 still NOT closed** · ≠ verbal route-effective · Dual PASS ≠ authorize coding / SSOT flip | `harness/w4-r2-close-authorize-receipt.md` |
| **W5** | MODEL-OP dual reconciler + wakeup honesty (docs only) | **`post_prove_dual_pass`** · dual on `25833fc` · **docs closed** · **≠ MODEL-OP fake green** · Dual PASS ≠ coding | `harness/w5-model-op-dual-reconciler-wakeup.md` |
| **W6** | P0-CB + SCOR honesty inventory (docs REQUEST prep) | **`post_prove_dual_pass`** · dual on `a6ca9e3` (e2e-ha+rag) · **W3 DELETE=503 freeze remains** · ≠ P0-CB/SCOR product-complete · Ban B-side ranking · Dual PASS ≠ coding | `harness/w6-p0-cb-scor-honesty.md` |
| **W7** | E2E/NHP matrix gap-close plan (docs REQUEST prep) | **`post_prove_dual_pass`** · dual on `b709753` (e2e-ha+rag) · **Ban covered without EXIT** · **Ban false green** · Dual PASS ≠ coding · Dual PASS ≠ fake-close matrix | `harness/w7-e2e-nhp-matrix-gap-close.md` |
| **W8** | Subsequent schema/stack hygiene (TBD · separate REQUEST) | **NOT open** | — |

**Honesty (W0)**: Close commit **`5c2bf9a`** · status **`post_prove_dual_pass`** (dual reviews against knife SHA / HEAD **`0c95883`**). Later tip may include provisional Postgres LISTEN/NOTIFY wake preference overlay (e.g. `32d0724`) — **wake = provisional overlay after dual** · **not a user hard pin** · **does not require wake-patch re-dual**. Redis still orthogonal / not STOPPED. Docs close ≠ coding auth · `releaseEvidence=false` · ≠HA · MySQL/Qdrant STOPPED. **Not**「W0 in dual」.

**Honesty (W1)**: Dual reviews against knife SHA **`675269c`** (e2e-ha + rag). Docs close **`post_prove_dual_pass` only**. Formal inventory receipt `receipts/w1-pg-redundant-table-inventory.md` · D-01…D-07 = **hypotheses / later W1b REQUEST candidates only** · **≠** deletion approval list · **ZERO DROP / zero table deletes** · HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **non-DROP-able** · **Dual PASS ≠ authorize W1b** · Ban self-approve · `releaseEvidence=false` · ≠HA.

**Honesty (W1b)**: REQUEST open only · status **`REQUEST-ready / not_run:pre_dual`**. Batches from W1 formal receipt D-01…D-07: **Batch A docs-only** (D-03, D-04, D-05, D-06) · **Batch B trace-first** (D-01, D-02, D-07) · **no delete batch authorized** · **ZERO DROP / ZERO guessed deletes** · HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **FORBIDDEN** in any delete batch · `proposed_next` **never** `drop-now` · Ban inventing DROP targets not in W1 receipt · **Dual PASS on W1 ≠ auto-auth W1b coding** · Dual PASS on W1b (later) ≠ DROP/coding · zero migrations this open · Ban self-approve · `releaseEvidence=false` · ≠HA.

**Honesty (W2)**: Dual reviews against knife SHA **`3463e9e`** (e2e-ha + rag). Docs close **`post_prove_dual_pass` only**. **sizing ≠ HA / capacity green** · **Dual PASS ≠ fake capacity** · 2c4g vs 4c8g under PG+pgvector+PostgresSaver · measured compose later needs separate REQUEST · may retest after W1b · `releaseEvidence=false`.

**Honesty (W3)**: Dual reviews against knife SHA **`3463e9e`** (e2e-ha + rag). Docs freeze **`post_prove_dual_pass` only**. **DELETE=503 freeze** · **Ban open DELETE** · **INT-TRANSCRIPT-01 still frozen/honest** · Ban forge · Dual PASS ≠ authorize coding / DELETE release / 01 cutover · `releaseEvidence=false`.

**Honesty (W4)**: Dual PASS closes **W4 docs checklist prep only**. **R2 is NOT closed** · routing **not** claimed effective · R2 status SSOT **not** flipped · later real coding (R2 SSOT flip) needs **separate REQUEST**. Dual PASS ≠ fake R2 close · `releaseEvidence=false`.

**Honesty (W5)**: Dual reviews against knife SHA **`25833fc`** (e2e-ha + rag). **W5 docs closed** as `post_prove_dual_pass`. **MODEL-OP not falsely green** — dual reconciler / wakeup cutover / SLO still open; PG LISTEN/NOTIFY provisional retained; Redis wake deferred / orthogonal · **not STOPPED**. Real reconciler wiring needs **separate REQUEST**. Docs close ≠ coding auth · `releaseEvidence=false` · ≠HA · Ban self-approve.


**Honesty (W6)**: Dual reviews against knife SHA **`a6ca9e3`** (e2e-ha + rag). Docs close **`post_prove_dual_pass` only**. Docs-only P0-CB + SCOR honesty inventory. **Depends on privacy/INT** · **W3 DELETE=503 freeze remains** · INT-TRANSCRIPT-01 still frozen · Ban claiming SCOR-01…08 / P0-CB product-complete · Ban B-side ranking / auto-decision · Dual PASS ≠ authorize coding · Ban self-approve · `releaseEvidence=false` · ≠HA.

**Honesty (W7)**: Dual reviews against knife SHA **`b709753`** (e2e-ha + rag). Docs close **`post_prove_dual_pass` only**. Docs-only E2E/NHP matrix gap-close **plan** · points at existing matrices/backlog/batches · **Ban claiming covered without EXIT** · **Ban false green** · **Dual PASS ≠ authorize coding** · **Dual PASS ≠ fake-close matrix** · ≠ matrix all covered · ≠ G7 suite green · Ban self-approve · `releaseEvidence=false` · ≠HA · ≠suite.

**Hard pins**: Dual PASS ≠ authorize coding · Ban self-approve · PG retained · MySQL/Qdrant STOPPED · F8 parallel noted · Ban claiming HA / W8 closed · **W1 Dual PASS ≠ W1b coding** · **W1b REQUEST-ready / not_run:pre_dual · ZERO DROP · no delete batch · Dual PASS≠coding · HARD RETAIN forbidden in delete** · **W2 sizing ≠ HA / capacity green** · Dual PASS ≠ fake capacity · may retest W2 after W1b · **W3 DELETE=503 freeze** · Ban open DELETE · INT-TRANSCRIPT-01 still frozen · Ban forge on W3 · **Ban claiming R2 closed from W4** · **Ban MODEL-OP fake green from W5 docs close** · **W6 Ban SCOR/P0-CB closed · W3 DELETE=503 freeze remains** · **W7 Ban covered without EXIT · Ban false green · Dual PASS ≠ fake-close matrix**.

**North-star pointer**: `north-star-ha.md` (one-line overlay).

---

*W0–W8 SSOT · 2026-09-17 (~01:47 PT) · W0–W7 post_prove_dual_pass · W1b OPEN REQUEST-ready / not_run:pre_dual · W8 not open · W3 DELETE=503 freeze remains · Ban covered without EXIT · Ban false green · ZERO DROP · releaseEvidence=false · ≠HA · ≠suite · maximize parallel · Dual PASS ≠ coding*
