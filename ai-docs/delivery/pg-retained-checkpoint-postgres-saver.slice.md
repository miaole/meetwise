# Slice — **PG-retained** · Postgres (+pgvector + PostgresSaver)

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~01:15 PT)  
**Authority**: meetwise — **NO** MySQL business DB cutover · **NO** Qdrant vector cutover · retained **Postgres (+pgvector + PostgresSaver / RLS / 0043)** · Redis wake separately evaluable · docs only · Dual PASS ≠ authorize coding · zero coding  
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban branch-name MySQL justification  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · REQUEST drafted · **not yet dual-sent**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/pg-retained-checkpoint-postgres-saver.slice.md` |
| Harness | `ai-docs/delivery/harness/pg-retained-checkpoint-postgres-saver.md` |
| Eval | `ai-docs/delivery/eval/pg-retained-checkpoint-postgres-saver.eval.md` |
| ADR successor | `ai-docs/delivery/adr-postgres-retained.md` |
| ADR superseded (partial) | `ai-docs/delivery/adr-mysql-qdrant-local.md` |
| REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md` |
| REQUEST · rag-route | `reviews/REQUEST-2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md` |

## One-line scope

Docs-only pin that relational+checkpoint+vector stay on **Postgres (+pgvector + PostgresSaver)**; stop MySQL/Qdrant cutover knives; include **resource sizing** honesty vs former MySQL+Qdrant+Redis plan.

## Hard pins

- Postgres retained · PostgresSaver stays · pgvector retained · MySQL not sole relational · Qdrant not sole vector · ADR mysql relational+vector superseded · Redis orthogonal · `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding · zero coding · F8 untouched  

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`not_run:pre_dual`** · no prove · zero coding |

---

*Slice · PG-retained · 2026-09-17 (~01:15 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · Ban cutover · Dual PASS ≠ authorize coding · zero coding*
