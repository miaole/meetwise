# Harness — **PG-retained** · Postgres (+pgvector + PostgresSaver)

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:15 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ MySQL sole relational** · **≠ Qdrant sole vector** · **≠ cutover authorized**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec REQUEST pair · **not yet dual-sent** · **zero coding / zero prove** · **Ban self-approve** · **Dual PASS ≠ authorize coding**）  
**Slice**: `../pg-retained-checkpoint-postgres-saver.slice.md`  
**Eval**: `../eval/pg-retained-checkpoint-postgres-saver.eval.md`  
**Authority**: meetwise hard ruling 2026-09-17 — **NO** business DB migration to MySQL · **NO** vector cutover to Qdrant · retained = **Postgres (+pgvector + PostgresSaver / RLS / mig 0043)** · provisional production wake preference = continue **Postgres LISTEN/NOTIFY** · Redis wake evaluation deferred per coordinator suggestion only, **pending a user hard sentence** and **not a user hard pin** · Redis wake remains orthogonal / separately evaluable · Ban branch-name justification via `feat/mysql-schema-skeleton`
**Workflow SSOT**: this knife = **W0** · next = **W1** inventory ZERO deletes (`harness/w1-pg-redundant-table-inventory.md`) → later W1b (not open) → W2…W8 (not open)

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only direction pin: Postgres retained for relational + checkpoint + vector; supersede former MySQL+Qdrant sole claims |
| **What this knife is not** | Not coding · not prove · not HA · not suite green · not Redis wake cutover · not F8/R4/commerce work · not deleting historical MySQL/Qdrant artifacts |
| **Relational** | Keep Postgres business tables + RLS · Ban replace-PG-with-MySQL · `packages/db-mysql` / `compose.mysql-local` **not** sole targets |
| **Checkpoint** | Keep **`PostgresSaver`** / Postgres checkpointer · Ban MySQL checkpoint cutover |
| **Vector** | Keep **pgvector** · Ban Qdrant-as-required sole vector / replace-pgvector cutover |
| **ADR** | `adr-mysql-qdrant-local.md` relational+vector claims **superseded** · successor `adr-postgres-retained.md` |
| **Wake path (provisional)** | Production preference is to continue **Postgres LISTEN/NOTIFY**; Redis wake evaluation is deferred per coordinator suggestion only, **pending a user hard sentence** and **not a user hard pin** · Redis wake knives remain separately evaluable and **not STOPPED** |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · Dual PASS ≠ authorize coding |

---

## 1. Pins (must survive dual)

1. Postgres retained · PostgresSaver stays · migration **0043** path retained · RLS not abandoned  
2. MySQL **not** sole relational truth · Ban MySQL business cutover knives  
3. pgvector retained · Qdrant **not** required sole vector · Ban replace-pgvector cutover  
4. ADR `adr-mysql-qdrant-local` relational **and** vector-cutover claims superseded (additive note; no false history)  
5. Qdrant/Redis **orthogonal** framing: Qdrant vector cutover STOPPED; Redis wake remains separately evaluable and **not STOPPED**
6. **Provisional wake preference only**: continue Postgres LISTEN/NOTIFY in production; Redis wake evaluation deferred per coordinator suggestion, **pending a user hard sentence** and **not a user hard pin**
7. `releaseEvidence=false` · ≠HA · ≠suite green
8. Dual PASS ≠ authorize coding · Ban implementing cutover from this docs knife

---

## 2. Resource sizing (honest ranges · assumptions · Ban HA/suite)

Compare **retained** Postgres(+pgvector+PostgresSaver) vs **former plan** MySQL + Qdrant + Redis as *local/dev and small single-host deploy sketches*. These are **planning envelopes**, not capacity proofs.

### Assumptions (must state)

- Single-host / docker-compose class; **not** multi-AZ HA; **not** production load test  
- Interview workload: low–moderate concurrent sessions (order **10s**, not thousands)  
- Embedding dims typical for current pgvector usage; ANN on Postgres HNSW/IVF class indexes  
- Checkpoint rows grow with durable threads; business+vector+checkpoint share one Postgres process family  
- Production wake preference is provisionally the existing Postgres **LISTEN/NOTIFY** path
- Redis wake evaluation is deferred; any Redis process is only a future evaluation envelope, not an authorized production dependency
- Former plan assumed **three** data-plane processes (MySQL + Qdrant + Redis) plus app  
- Numbers below are **rough ranges** for operator planning; **Ban** treating as HA evidence or suite green  

### Envelope table

| Resource | Retained: Postgres (+pgvector + PostgresSaver) | Former plan: MySQL + Qdrant + Redis | Notes |
|----------|-----------------------------------------------|--------------------------------------|-------|
| **Process count (data plane)** | **1** primary DB process; production wake is provisionally Postgres LISTEN/NOTIFY (Redis evaluation deferred) | **3** (MySQL + Qdrant + Redis) | Fewer moving parts locally; Redis wake remains optional/orthogonal and not STOPPED |
| **RAM (dev / laptop compose)** | Postgres **2–8 GiB** working set common; start budget **~4 GiB** for DB+indexes+shared_buffers sketch | MySQL **1–4 GiB** + Qdrant **1–4 GiB** + Redis **256 MiB–1 GiB** → often **~3–9 GiB** combined | Combined former plan can exceed single-PG envelope on small hosts |
| **RAM (small single-host demo)** | Postgres **8–16 GiB** sketch if vectors+checkpoints co-located | MySQL **4–8** + Qdrant **4–8** + Redis **1–2** → **~9–18 GiB** | Co-location trades Qdrant isolation for one larger PG |
| **CPU** | One DB absorbs relational + ANN + checkpoint WAL | Split CPU across 3 services; Qdrant ANN offloads PG | Split ≠ free HA; scheduling/ops cost rises |
| **Disk** | One volume family: tables + WAL + pgvector indexes + checkpoint blobs | Three volume families; vector corpus primarily on Qdrant disk | Backup/restore surfaces: 1 vs 3 |
| **Network hops (retrieve)** | App → Postgres (SQL + ANN) | App → MySQL (meta) + Qdrant (vector) (+ Redis if wake) | Extra hop/consistency surface on former plan |
| **Ops / failure domains** | Single DB failure domain for relational+vector+checkpoint | Partial failure (e.g. Qdrant down, MySQL up) needs explicit degrade | Single domain simpler locally; still **≠HA** |
| **Erasure / privacy sink count** | Relational+vector under Postgres erasure paths already in-tree | Extra Qdrant sink prove required before vector cutover (now STOPPED) | Fewer sinks to prove under retained path |

### Honesty bans

- Ban claiming these ranges prove production capacity, HA, or suite green  
- Ban claiming Redis wake is sized/authorized here  
- Ban presenting the provisional Postgres LISTEN/NOTIFY preference as a user hard pin or claiming user hard-pinned Redis rejection
- Ban using branch name `feat/mysql-schema-skeleton` as MySQL cutover justification  
- Ban treating Dual PASS on this knife as coding authorize for any cutover  

---

## 3. STOPPED inventory (this ruling · history kept)

### MySQL relational cutover (STOPPED)

| Path | Prior status |
|------|----------------|
| `harness/mysql-schema.skeleton.md` | active skeleton · review conditional 2026-09-10 · INFLIGHT:mysql-schema-prove |
| `m2-tenant-authorization-model.md` | design draft · MySQL-era target auth |
| `m2-tenant-prototype-impl.md` | implemented prototype · sole MySQL stack framing |
| `gap-bug-backlog.md` GAP-SCH-01 / INFLIGHT:mysql-schema-prove | inflight schema cutover |
| `adr-mysql-qdrant-local.md` relational sole claims | draft sole MySQL relational |

### Qdrant vector / replace-pgvector cutover (STOPPED)

| Path | Prior status |
|------|----------------|
| `m4-qdrant-prototype-impl.md` | implemented prototype · INFLIGHT:qdrant-store-wip |
| `harness/qdrant-store.prototype.md` | prototype harness |
| `harness/qdrant-vectorstore-adapter.md` | P11 |
| `harness/qdrant-vectorstore-prove.md` | P12 |
| `harness/qdrant-rag-prove.md` / `qdrant-memory-prove.md` | P13 |
| `harness/retrieval-backend-qdrant.md` | P14 · G2 GAP |
| `harness/qdrant-backed-prove-deepen.md` | P10 |
| `harness/qdrant-g5-erasure-ledger.md` / `qdrant-g5-ledger-map.md` / `qdrant-erase-count-honesty.md` | P15/P16 erasure-as-Qdrant-sink |
| `m5-pgvector-fixture-retirement-plan.md` | plan draft R5→sole |
| `harness/g1-default-switch-prep.md` | G1 prep · flip NOT open |
| `harness/r5-pgvector-fixture-mark-red.md` | mark-red toward sole |
| `harness/r5-retirement-sole-stack-status.md` | sole = MySQL+Qdrant+Redis SSOT |
| `m4-rag-hard-gates.md` stack/Qdrant-required claims | gates draft（R1–R4 product gates remain；stack claims superseded） |
| `gap-bug-backlog.md` INFLIGHT:qdrant-store-wip / pr-docs-gates #106/#107 | inflight |

### Explicitly **not** stopped

- F8 MS3 deploy product · commerce · egress · R4 meta / domain-isolation product knives  
- Redis wake (`m3-*` / `m3-redis-wakeup-prototype.md`) — **separately evaluable and not STOPPED**; production preference is provisionally Postgres LISTEN/NOTIFY pending a user hard sentence

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · **no prove script** · zero coding |

---

## 5. Non-claims

Not pass · not coding authorized · not HA · not suite green · not MySQL cutover · not Qdrant vector cutover · not Redis wake authorized or rejected · provisional wake preference only · not F8 touched · Dual PASS ≠ authorize coding

---

*Harness · PG-retained · 2026-09-17 (~01:15 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite green · Postgres+pgvector+PostgresSaver · Ban MySQL/Qdrant cutover · provisional Postgres LISTEN/NOTIFY preference · Redis eval deferred pending user hard sentence · Redis not STOPPED · Dual PASS ≠ authorize coding · zero coding*
