# REQUEST — **PG-retained** · Postgres (+pgvector + PostgresSaver)（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:15 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ MySQL sole relational** · **≠ Qdrant sole vector** · **≠ cutover**  
**Pair**: `REQUEST-2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md`  
**Hard**: meetwise 2026-09-17 — **NO** business DB → MySQL · **NO** vector → Qdrant · retained **Postgres (+pgvector + PostgresSaver / RLS / 0043)** · Redis wake **orthogonal** · Ban branch-name MySQL justification · **zero coding / zero prove** · **F8 untouched** · Dual PASS ≠ authorize coding · Ban self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/pg-retained-checkpoint-postgres-saver.md` | Canonical harness（resource sizing §2 · STOPPED inventory §3） |
| `pg-retained-checkpoint-postgres-saver.slice.md` | Slice index |
| `eval/pg-retained-checkpoint-postgres-saver.eval.md` | Pre-exec eval |
| `adr-postgres-retained.md` | Successor ADR |
| `adr-mysql-qdrant-local.md` | Partial supersession（relational+vector） |
| `gap-bug-backlog.md` / `north-star-ha.md` / `north-star-hard-gates.md` | SSOT overlays |
| Parallel **untouched** | F8 MS3 · commerce · egress · R4 meta |

---

## Stance（E2E-HA）

1. Docs-only direction pin: Postgres retained for relational + checkpoint + vector  
2. MySQL schema / sole-relational cutover knives **STOPPED**（history kept）  
3. Qdrant replace-pgvector / sole-vector knives **STOPPED**（history kept）  
4. Resource sizing compares retained vs former MySQL+Qdrant+Redis — **planning envelope only** · ≠HA  
5. Redis wake still separately evaluable  
6. **`not_run:pre_dual`** · zero coding · Dual PASS ≠ authorize coding  

---

## Please answer

1. Agree retained truth = **Postgres (+pgvector + PostgresSaver)** · Ban MySQL business cutover · Ban Qdrant-required vector cutover?  
2. Agree STOPPED inventory in harness §3 is the right honesty set（history kept · F8/redis-wake not canceled）?  
3. Agree ADR mysql relational+vector claims superseded · successor `adr-postgres-retained.md` ok（no false history）?  
4. Agree resource sizing §2 is honest envelope only · ≠HA · ≠suite green · ≠ capacity proof?  
5. Agree Redis wake remains separately evaluable · not authorized here?  
6. Agree `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve · Ban branch-name MySQL justification?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not coding authorized · not HA · not suite green · not MySQL/Qdrant cutover · not Redis wake authorized · not F8 work · Dual PASS ≠ authorize coding

---

*REQUEST · mw-e2e-ha · PG-retained · 2026-09-17 (~01:15 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
