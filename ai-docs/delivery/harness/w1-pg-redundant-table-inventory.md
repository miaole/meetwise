# Harness — **W1** · PG redundant/obsolete table inventory（ZERO deletes）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:35 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ W1b deletes authorized** · **≠ DROP/TRUNCATE** · **≠ MySQL/Qdrant cutover**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · **Ban self-approve** · **Dual PASS ≠ authorize W1b deletes / merge-retire migrations** · **zero coding / zero DROP**）  
**Slice**: `../w1-pg-redundant-table-inventory.slice.md`  
**Eval**: `../eval/w1-pg-redundant-table-inventory.eval.md`  
**Formal receipt**: `../receipts/w1-pg-redundant-table-inventory.md`  
**Authority**: meetwise global workflow SSOT — **W0** PG retained (`post_prove_dual_pass` · close **`5c2bf9a`**) → **W1** this inventory (ZERO deletes · **`post_prove_dual_pass`**) → later **W1b** merge/retire migrations (batch prove · **NOT open**) → then **W2…W8** (**not opened** by this close)  
**Parent pointer**: W0 = `harness/pg-retained-checkpoint-postgres-saver.md` · ADR `adr-postgres-retained.md` · W0 status **`post_prove_dual_pass`** at **`5c2bf9a`** (dual on `0c95883`)  
**Honesty**: Dual reviews against knife SHA **`675269c`**. Docs close = inventory gate dual only · **≠** W1b authorize · **≠** DROP · draft/formal D-01…D-07 = hypothesis only

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate + formal inventory receipt: find redundant / obsolete / duplicate / legacy Postgres business tables & columns by reading migrations, `packages/db` schema, and usage references |
| **What this knife is not** | **Not** DROP · **not** TRUNCATE · **not** destructive migrate · **not** W1b coding · **not** MySQL/Qdrant cutover revival · **not** HA · **not** suite green · **not** F8 block |
| **Deletes** | **ZERO** in W1 · Dual PASS on W1 **≠** authorize W1b deletes |
| **Retained** | Postgres + **pgvector** + **PostgresSaver** / RLS / mig path kept · qbank generation / active pgvector = **HARD RETAIN · non-DROP-able** |
| **Parallel** | F8 MS3 may run parallel · **must not block** W1 · W1 must not block F8 |
| **Now** | **`post_prove_dual_pass`** · docs-only close · zero coding · zero DROP · Ban self-approve |

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `../reviews/2026-09-17-w1-pg-redundant-table-inventory-mw-rag-route.md` | **pass** |

Dual knife SHA: **`675269c0999bf1887b3c527f7fc85420e72fd3de`** (short **`675269c`**). Docs close only — **≠** W1b deletes · **≠** DROP authorized · **≠** draft = deletion approval list.

---

## 1. Global workflow SSOT (W0–W8 · brief · do not open W1b / W2–W8 from this close)

| Knife | Intent (honest · brief) | This turn |
|-------|-------------------------|-----------|
| **W0** | PG retained (+pgvector + PostgresSaver); stop MySQL/Qdrant cutover | **`post_prove_dual_pass`** · close **`5c2bf9a`** · dual on `0c95883` |
| **W1** | PG redundant/obsolete table **inventory** · **ZERO deletes** | **`post_prove_dual_pass`** · formal receipt · this harness |
| **W1b** | Later merge/retire migrations · **batch prove** · only after separate authorize | **NOT open** · Dual PASS on W1 ≠ authorize |
| **W2…W8** | Subsequent schema/stack hygiene knives (TBD · separate REQUEST) | **NOT opened by this close** · note only |

Ban claiming W8 / HA from this knife. Ban treating Dual PASS as W1b open.

---

## 2. Pins (must survive dual · still binding after close)

1. Inventory only · **Ban DROP / TRUNCATE / destructive migrate** in W1  
2. Dual PASS ≠ authorize **W1b** deletes / merge-retire migrations · separate authorize + batch prove required later  
3. Postgres + pgvector + PostgresSaver retained · MySQL/Qdrant cutover remains **STOPPED**  
4. `releaseEvidence=false` · ≠HA · ≠suite green · ≠ claiming W8  
5. F8 MS3 parallel OK · neither blocks the other  
6. Zero coding this knife (docs + read-only inventory receipt only)  
7. Ban secrets / `.env*` in commits  
8. Do **not** delete any DB tables in repo, migrations, or live DB from this knife  
9. HARD RETAIN (qbank generation / pgvector / checkpoints / privacy / hot business) **must NOT** become deletable  
10. Draft / formal D-01…D-07 = **hypotheses** · ≠ deletion approval list · Ban self-approve  

---

## 3. Scope — inventory artifact (emitted · formal)

Formal receipt: `receipts/w1-pg-redundant-table-inventory.md` (promoted from draft).

| Artifact field | Purpose |
|----------------|---------|
| `table` / `column` | Identified object |
| `category` | `redundant` · `obsolete` · `duplicate` · `legacy-compat` · `active-keep` · `unknown-needs-trace` |
| `evidence` | Migration id(s) · `packages/db` module · call-site refs · dual-table note |
| `usage_signal` | `hot` · `compat-only` · `migration-only` · `unreferenced-candidate` · `checkpoint/pgvector-retain` |
| `proposed_next` | `keep` · `document-only` · `candidate-for-W1b-review` · **never** `drop-now` |
| `ban` | Explicit **no DROP in W1** · W1b requires separate dual + batch prove |

**Explicit Ban in emitted artifact**: any `DROP` / `TRUNCATE` / destructive SQL · any MySQL/Qdrant cutover revival · any HA/suite claim · marking HARD RETAIN as DROP-able.

Provisional draft (superseded provenance): `receipts/w1-pg-redundant-table-inventory.draft.md`.

---

## 4. Inventory method (read-only)

1. **Migrations**: `packages/db/migrations/` (~133) — create/alter/rename; note historical `DROP TABLE IF EXISTS` inside migrate-up recreate patterns **≠** authorization to delete live business tables now  
2. **SQL baselines**: `packages/db/sql/` (~25 domain SQL files)  
3. **Typed access**: `packages/db/src/**` (incl. `retrieval-legacy.ts` and dual-write / fence modules)  
4. **Usage refs**: apps/worker, apps/api, packages/* call sites (static grep) — later coding knife may deepen; this close does **not** authorize DROP  
5. **Hard retain**: LangGraph checkpoint tables · pgvector / vector stores in active path · generation-scoped qbank+rag · RLS/principal surfaces · privacy/erasure sinks still required  

---

## 5. Provisional candidate buckets (honesty · ≠ delete list)

These are **hypothesis buckets** — **not** a DROP backlog · **not** W1b authorize:

| Bucket | Examples / signals (provisional) | Ruling |
|--------|----------------------------------|--------|
| A · legacy-compat retrieve | `packages/db/src/retrieval-legacy.ts` · `vector_chunk` ANN compat path | Inventory · keep until W1b separate prove |
| B · dual / successor pairs | Older conversation/event vs CTX03+ · memory recall snapshots vs later governance | Document successor · **no DROP** |
| C · RAG control legacy trust | `legacy_untrusted` trust_state / retired generations (0073+) | State machine · not table delete |
| D · MySQL-era artifacts | `packages/db-mysql` · compose mysql | Historical · cutover STOPPED · out of W1 delete scope |
| E · Checkpoint / pgvector / qbank | `checkpoints` / `checkpoint_*` · active pgvector · generation-scoped qbank+rag | **HARD RETAIN · non-DROP-able** |
| F · Hot business | interview / commerce / privacy / qbank serving / job_route_* | **KEEP** unless proven unused |

Ban treating this table as authorize-to-drop.

---

## 6. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`post_prove_dual_pass`** · dual receipts archived · **no prove script** · zero coding · zero DROP |

---

## 7. Non-claims

Docs close **`post_prove_dual_pass` only** · not DROP authorized · not W1b authorized · not HA · not suite green · not MySQL/Qdrant cutover · not W8 · Dual PASS ≠ authorize deletes · draft hypotheses ≠ deletion approval · HARD RETAIN non-deletable · F8 not blocked · F8 not claimed closed · Ban self-approve · `releaseEvidence=false`

---

*Harness · W1 PG redundant table inventory · 2026-09-17 (~01:35 PT) · post_prove_dual_pass · dual on 675269c · W0 post_prove_dual_pass at 5c2bf9a · releaseEvidence=false · ≠HA · ≠suite · ZERO deletes · Ban DROP · Dual PASS ≠ authorize W1b · HARD RETAIN non-DROP-able · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · zero coding*
