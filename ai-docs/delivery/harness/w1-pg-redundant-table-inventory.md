# Harness — **W1** · PG redundant/obsolete table inventory（ZERO deletes）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:20 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ W1b deletes authorized** · **≠ DROP/TRUNCATE** · **≠ MySQL/Qdrant cutover**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec REQUEST pair · **not yet dual-sent** · **zero coding / zero DROP** · **Ban self-approve** · **Dual PASS ≠ authorize W1b deletes / merge-retire migrations**）  
**Slice**: `../w1-pg-redundant-table-inventory.slice.md`  
**Eval**: `../eval/w1-pg-redundant-table-inventory.eval.md`  
**Authority**: meetwise global workflow SSOT — **W0** PG retained (in dual) → **W1** this inventory (ZERO deletes) → dual → later **W1b** merge/retire migrations (batch prove) → then **W2…W8** (**not opened** this turn)  
**Parent pointer**: W0 = `harness/pg-retained-checkpoint-postgres-saver.md` · ADR `adr-postgres-retained.md`

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-gate + inventory **plan** (and optional read-only draft): find redundant / obsolete / duplicate / legacy Postgres business tables & columns by reading migrations, `packages/db` schema, and usage references |
| **What this knife is not** | **Not** DROP · **not** TRUNCATE · **not** destructive migrate · **not** W1b coding · **not** MySQL/Qdrant cutover revival · **not** HA · **not** suite green · **not** F8 block |
| **Deletes** | **ZERO** in W1 · Dual PASS on W1 **≠** authorize W1b deletes |
| **Retained** | Postgres + **pgvector** + **PostgresSaver** / RLS / mig path kept |
| **Parallel** | F8 MS3 may run parallel · **must not block** W1 · W1 must not block F8 |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · zero DROP |

---

## 1. Global workflow SSOT (W0–W8 · brief · do not open W2–W8)

| Knife | Intent (honest · brief) | This turn |
|-------|-------------------------|-----------|
| **W0** | PG retained (+pgvector + PostgresSaver); stop MySQL/Qdrant cutover | **in dual** / REQUEST-ready (prior knife) |
| **W1** | PG redundant/obsolete table **inventory** · **ZERO deletes** | **OPEN** · docs gate · this harness |
| **W1b** | Later merge/retire migrations · **batch prove** · only after W1 dual + separate authorize | **NOT open** · Dual PASS on W1 ≠ authorize |
| **W2…W8** | Subsequent schema/stack hygiene knives (TBD · separate REQUEST) | **NOT open** · note only |

Ban claiming W8 / HA from this knife. Ban opening W2–W8 work products now.

---

## 2. Pins (must survive dual)

1. Inventory only · **Ban DROP / TRUNCATE / destructive migrate** in W1  
2. Dual PASS ≠ authorize **W1b** deletes / merge-retire migrations · separate authorize + batch prove required later  
3. Postgres + pgvector + PostgresSaver retained · MySQL/Qdrant cutover remains **STOPPED**  
4. `releaseEvidence=false` · ≠HA · ≠suite green · ≠ claiming W8  
5. F8 MS3 parallel OK · neither blocks the other  
6. Zero coding this turn (docs + optional read-only markdown draft only)  
7. Ban secrets / `.env*` in commits  
8. Do **not** delete any DB tables in repo, migrations, or live DB from this knife  

---

## 3. Scope — what later coding knife will emit (artifact plan)

W1 dual (if PASS) unlocks **only** a documented inventory contract. A **later** coding knife (still not W1b deletes) may emit a read-only artifact such as:

| Artifact field | Purpose |
|----------------|---------|
| `table` / `column` | Identified object |
| `category` | `redundant` · `obsolete` · `duplicate` · `legacy-compat` · `active-keep` · `unknown-needs-trace` |
| `evidence` | Migration id(s) · `packages/db` module · call-site refs · dual-table note |
| `usage_signal` | `hot` · `compat-only` · `migration-only` · `unreferenced-candidate` · `checkpoint/pgvector-retain` |
| `proposed_next` | `keep` · `document-only` · `candidate-for-W1b-review` · **never** `drop-now` |
| `ban` | Explicit **no DROP in W1** · W1b requires separate dual + batch prove |

**Explicit Ban in emitted artifact**: any `DROP` / `TRUNCATE` / destructive SQL · any MySQL/Qdrant cutover revival · any HA/suite claim.

Provisional read-only draft (non-authorizing · optional this turn): `receipts/w1-pg-redundant-table-inventory.draft.md`.

---

## 4. Inventory method (read-only · planned)

1. **Migrations**: `packages/db/migrations/` (~133) — create/alter/rename; note historical `DROP TABLE IF EXISTS` inside migrate-up recreate patterns **≠** authorization to delete live business tables now  
2. **SQL baselines**: `packages/db/sql/` (~25 domain SQL files)  
3. **Typed access**: `packages/db/src/**` (incl. `retrieval-legacy.ts` and dual-write / fence modules)  
4. **Usage refs**: apps/worker, apps/api, packages/* call sites (static grep) — later coding knife; this REQUEST turn may only draft categories  
5. **Hard retain**: LangGraph checkpoint tables · pgvector / vector stores in active path · RLS/principal surfaces · privacy/erasure sinks still required  

---

## 5. Provisional candidate buckets (draft honesty · ≠ delete list)

These are **hypothesis buckets** for expert dual — **not** a DROP backlog:

| Bucket | Examples / signals (provisional) | Ruling |
|--------|----------------------------------|--------|
| A · legacy-compat retrieve | `packages/db/src/retrieval-legacy.ts` · `vector_chunk` ANN compat path | Inventory · keep until W1b separate prove |
| B · dual / successor pairs | Older conversation/event vs CTX03+ · memory recall snapshots vs later governance | Document successor · **no DROP** |
| C · RAG control legacy trust | `legacy_untrusted` trust_state / retired generations (0073+) | State machine · not table delete |
| D · MySQL-era artifacts | `packages/db-mysql` · compose mysql | Historical · cutover STOPPED · out of W1 delete scope |
| E · Checkpoint / pgvector | `checkpoints` / `checkpoint_*` · active pgvector paths | **HARD RETAIN** |
| F · Hot business | interview / commerce / privacy / qbank serving / job_route_* | **KEEP** unless proven unused |

Ban treating this table as authorize-to-drop.

---

## 6. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · **no prove script** · zero coding · zero DROP |

---

## 7. Non-claims

Not pass · not coding authorized · not DROP authorized · not W1b authorized · not HA · not suite green · not MySQL/Qdrant cutover · not W8 · Dual PASS ≠ authorize deletes · F8 not blocked · F8 not claimed closed

---

*Harness · W1 PG redundant table inventory · 2026-09-17 (~01:20 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ZERO deletes · Ban DROP · Dual PASS ≠ authorize W1b · PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED · zero coding*
