# Harness — **W1b** · PG redundant retire/trace batches（ZERO DROP · REQUEST open）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:40 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ DROP/TRUNCATE** · **≠ delete batch authorized** · **≠ MySQL/Qdrant cutover** · **≠ coding**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **pending** · **Ban self-approve** · **Dual PASS on W1 ≠ auto-auth W1b coding** · **Dual PASS on W1b ≠ authorize DROP / coding**）  
**Slice**: `../w1b-pg-redundant-retire-batches.slice.md`  
**Eval**: `../eval/w1b-pg-redundant-retire-batches.eval.md`  
**Parent W1 formal receipt**: `../receipts/w1-pg-redundant-table-inventory.md`（D-01…D-07 hypotheses · **`post_prove_dual_pass`** · dual on `675269c`）  
**Authority**: meetwise — **W0** PG retained → **W1** inventory closed → **W1b** this REQUEST（docs/trace batches only · **ZERO DROP**) → later retire coding only after **separate** prove + authorize · then **W2…W8**  
**Honesty**: Opening W1b = **batched REQUEST knife** from W1 receipt hypotheses · **not** delete authorize · **not** migrations · **not** coding · `proposed_next` **never** `drop-now`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate REQUEST: batch W1 D-01…D-07 into **docs-only** + **trace-first** workstreams; leave dual REQUEST pair ready |
| **What this knife is not** | **Not** DROP · **not** TRUNCATE · **not** destructive migrate · **not** guessed deletes · **not** MySQL/Qdrant cutover · **not** HA · **not** suite · **not** coding / migrations |
| **Deletes** | **ZERO** this REQUEST · **no delete batch authorized** · any future retire needs **prove + separate authorize** |
| **W1 Dual PASS** | Closes W1 inventory only · **≠** auto-authorize W1b coding / DROP |
| **W1b Dual PASS (if later)** | Docs/trace gate only · **≠** authorize DROP / merge-retire migrations / coding |
| **Retained** | HARD RETAIN (qbank/pgvector/checkpoints/privacy/hot) **FORBIDDEN** in any delete batch · **non-DROP-able** |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero DROP · Ban inventing DROP targets not in W1 receipt |

---

## 1. Parent W1 pin

| Pin | Value |
|-----|-------|
| W1 status | **`post_prove_dual_pass`** · formal receipt |
| W1 dual knife SHA | **`675269c`** (`675269c0999bf1887b3c527f7fc85420e72fd3de`) |
| W1 experts | `mw-e2e-ha` + `mw-rag-route` both **pass** |
| Hypotheses | D-01…D-07 = **candidates for W1b REQUEST only** · ≠ deletion approval |
| Ban from W1 | DROP/TRUNCATE · Dual PASS ≠ W1b authorize · HARD RETAIN non-DROP-able |

---

## 2. Batch table（honesty · ZERO DROP）

| Batch | IDs | Kind | Allowed work this REQUEST | Forbidden |
|-------|-----|------|---------------------------|-----------|
| **A · docs-only** | D-03, D-04, D-05, D-06 | document / keep / historical | Document successor / mig recreate patterns · keep historical MySQL artifacts · keep RAG trust_state honesty | DROP · TRUNCATE · delete batch · invent tables · coding |
| **B · trace-first** | D-01, D-02, D-07 | usage/call-site prove **before** any retire proposal | Static usage/call-site trace plan · inventory legacy role · keep until prove | DROP · TRUNCATE · retire-now · guessed deletes · coding migrations |
| **(none) · delete** | — | **not authorized** | — | Any DROP/delete batch · HARD RETAIN in delete set · `proposed_next=drop-now` |

### Row map (from W1 receipt · unchanged honesty)

| ID | Object / signal | Batch | `proposed_next` (this REQUEST) |
|----|-----------------|-------|--------------------------------|
| D-01 | `retrieval-legacy.ts` · `annSearchLegacy` on `vector_chunk` | **B** | document-only · candidate-for-trace · **never** `drop-now` |
| D-02 | `vector_chunk` vs generation-scoped qbank/rag | **B** | keep generation path · inventory legacy role · **never** `drop-now` |
| D-03 | CTX03+ vs older conversation event shapes | **A** | document successor · **no live DROP** |
| D-04 | Memory governance recreate patterns (0093/0099/0105) | **A** | document · Ban treating mig DROP as delete auth |
| D-05 | RAG `legacy_untrusted` / retired generation trust_state | **A** | keep · document-only |
| D-06 | `packages/db-mysql` / mysql compose | **A** | keep history · **not** PG delete |
| D-07 | Unreferenced-looking names (needs full usage trace) | **B** | keep until coding knife traces · **no DROP** |

**Explicit**: Ban inventing DROP targets not listed in W1 formal receipt D-01…D-07. Ban placing HARD RETAIN objects into any delete batch (there is **no** delete batch).

---

## 3. Pins (must survive dual)

1. **ZERO DROP / ZERO guessed deletes** this REQUEST  
2. **No delete batch authorized** · future retire = prove + **separate** authorize  
3. Dual PASS on **W1 ≠** auto-auth W1b coding  
4. Dual PASS on **W1b ≠** authorize DROP / coding / merge-retire migrations  
5. `proposed_next` **never** `drop-now`  
6. HARD RETAIN (qbank generation / pgvector / checkpoints / privacy / hot) **FORBIDDEN** in any delete batch · **non-DROP-able**  
7. Ban inventing DROP targets outside W1 receipt D-01…D-07  
8. Postgres + pgvector + PostgresSaver retained · MySQL/Qdrant cutover remains **STOPPED**  
9. `releaseEvidence=false` · ≠HA · ≠suite · ≠ claiming W8  
10. Zero migrations / zero coding this REQUEST · Ban secrets · Ban self-approve  

---

## 4. Scope — what dual reviews

| In scope | Out of scope |
|----------|--------------|
| Batch A docs-only honesty for D-03…D-06 | Any DROP / TRUNCATE / destructive SQL |
| Batch B trace-first plan for D-01, D-02, D-07 | Implementing usage-trace coding knife |
| REQUEST pair ready for `mw-e2e-ha` + `mw-rag-route` | Merge-retire migrations |
| Status SSOT update: W1b = REQUEST-ready | HA / suite / releaseEvidence claims |
| Reaffirm HARD RETAIN non-deletable | MySQL/Qdrant cutover revival |
| Ban delete batch · Ban `drop-now` | Guessed table deletes / invented targets |

---

## 5. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`REQUEST-ready / not_run:pre_dual`** · **no prove script** · zero coding · zero DROP |

---

## 6. Non-claims

REQUEST open only · not dual PASS · not DROP authorized · not delete batch · not coding · not migrations · not HA · not suite · not MySQL/Qdrant cutover · not W8 · Dual PASS on W1 ≠ W1b coding auth · Dual PASS on W1b (later) ≠ DROP · HARD RETAIN non-deletable · Ban self-approve · `releaseEvidence=false`

---

*Harness · W1b PG redundant retire/trace batches · 2026-09-17 (~01:40 PT) · REQUEST-ready / not_run:pre_dual · parent W1 post_prove_dual_pass @675269c · releaseEvidence=false · ≠HA · ≠suite · ZERO DROP · no delete batch · Dual PASS on W1 ≠ coding · proposed_next never drop-now · HARD RETAIN forbidden in delete · zero coding*
