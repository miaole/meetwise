# Eval — **W1b** · PG redundant retire/trace batches（**`executed:awaiting_post_prove_dual`**）

**Date**: 2026-09-17 (~01:46 PT)  
**run-status**: **`executed:awaiting_post_prove_dual`** · pre-exec dual **PASS** · Batch A+B **executed** · post-prove dual **pending** · **zero DROP** · **Dual PASS on W1 ≠ auto-auth W1b coding** · Ban self-approve · Ban self-write post_prove_dual_pass  
**releaseEvidence=false** · **Not HA** · **≠suite green** · **≠ DROP** · **≠ delete batch** · **≠ MySQL/Qdrant cutover** · **≠ W8**  
**Harness**: `ai-docs/delivery/harness/w1b-pg-redundant-retire-batches.md`  
**Slice**: `ai-docs/delivery/w1b-pg-redundant-retire-batches.slice.md`  
**Parent W1**: `receipts/w1-pg-redundant-table-inventory.md` · dual on **`675269c`**

---

## 1. Purpose

Expert **pre-exec** checklist for W1b batched REQUEST open — docs/trace only.  
**Ban**: DROP/TRUNCATE · delete batch · guessed deletes · inventing DROP targets not in W1 receipt · treating W1 Dual PASS as W1b coding auth · `proposed_next=drop-now` · HARD RETAIN in delete set · migrations/coding · MySQL/Qdrant cutover · claiming HA/suite/W8 · self-approve.

---

## 2. Execution record（pre-dual）

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Parent W1 formal receipt | present · `post_prove_dual_pass` | **present** · dual on **`675269c`** | D-01…D-07 hypotheses only |
| Batch A docs-only | D-03, D-04, D-05, D-06 | **mapped** | document / keep / historical |
| Batch B trace-first | D-01, D-02, D-07 | **mapped** | usage prove before retire proposal |
| Delete batch | none authorized | **none** | explicit Ban |
| DROP / destructive migrate | none | **none** | zero DROP · zero coding |
| HARD RETAIN | forbidden in delete | **pinned** | qbank/pgvector/checkpoints/privacy/hot |
| `proposed_next` | never `drop-now` | **pinned** | keep / document-only / candidate-for-trace |
| REQUEST pair | e2e-ha + rag pre-exec | **PASS** (archived) | post-prove dual pending |
| Coding / migrations / DROP | none | **none** | Batch A docs + Batch B trace only · ZERO DROP |
| W1 Dual PASS | ≠ W1b coding auth | **pinned** | Dual PASS ≠ auto-auth |
| Batch A finalize | D-03…D-06 docs done | **done** | `receipts/w1b-batch-a-docs-finalize.md` |
| Batch B trace | D-01/D-02/D-07 evidence | **done** | `receipts/w1b-batch-b-trace-evidence.md` · keep · no delete flags |
| Status honesty | awaiting_post_prove_dual | **set** | Ban self-write post_prove_dual_pass |

---

## 3. Eval cases（for dual）

| ID | Eval point | Pass means | Dual |
|----|------------|------------|------|
| E1 | Agree W1b open = batched REQUEST from W1 D-01…D-07 · **ZERO DROP** · no delete batch | docs agree | **pre-exec PASS · post-prove pending** |
| E2 | Agree Batch A (D-03…D-06) = docs-only · document successor/mig/history · **not** delete | harness §2 | **pre-exec PASS · post-prove pending** |
| E3 | Agree Batch B (D-01, D-02, D-07) = trace-first · usage prove **before** any retire proposal · still **no DROP** | harness §2 | **pre-exec PASS · post-prove pending** |
| E4 | Agree Dual PASS on **W1 ≠** auto-authorize W1b coding / DROP | hard pin | **pre-exec PASS · post-prove pending** |
| E5 | Agree Dual PASS on **W1b ≠** authorize DROP / coding / merge-retire · separate prove+authorize later | hard pin | **pre-exec PASS · post-prove pending** |
| E6 | Agree HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **FORBIDDEN** in any delete batch · **non-DROP-able** | harness §3 | **pre-exec PASS · post-prove pending** |
| E7 | Agree Ban inventing DROP targets not in W1 receipt · `proposed_next` never `drop-now` · MySQL/Qdrant STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · ≠W8 · zero coding · Ban self-approve | hard pins | **pre-exec PASS · post-prove pending** |

---

## 4. Fake-green checklist（open · must stay honest）

- [ ] Did not authorize DROP / TRUNCATE / destructive migrate  
- [ ] Did not authorize a delete batch  
- [ ] Did not treat W1 Dual PASS as W1b coding / DROP authorize  
- [ ] Did not invent DROP targets outside D-01…D-07  
- [ ] Did not set `proposed_next=drop-now`  
- [ ] Did not place HARD RETAIN into a delete set  
- [ ] Did not claim HA / suite green / releaseEvidence / W8  
- [ ] Did not revive MySQL or Qdrant cutover  
- [ ] Did not implement migrations / coding  
- [ ] Did not self-approve / invent prove EXIT  

---

## 5. Non-claims

REQUEST-ready only · not dual PASS · not DROP · not delete batch · not coding · not migrations · not HA · not suite · Dual PASS on W1 ≠ W1b coding · Dual PASS on W1b (later) ≠ DROP · HARD RETAIN non-deletable · Ban self-approve · `releaseEvidence=false`

---

*Eval · W1b · 2026-09-17 (~01:46 PT) · `executed:awaiting_post_prove_dual` · parent W1 dual on 675269c · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · Dual PASS on W1 ≠ coding · zero coding*
