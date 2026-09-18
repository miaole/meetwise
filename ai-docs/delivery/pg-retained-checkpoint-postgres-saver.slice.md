# Slice — **PG-retained** · Postgres (+pgvector + PostgresSaver)

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:31 PT)  
**Authority**: meetwise — **NO** MySQL business DB cutover · **NO** Qdrant vector cutover · retained **Postgres (+pgvector + PostgresSaver / RLS / 0043)** · provisional production wake preference = **Postgres LISTEN/NOTIFY** · Redis wake evaluation deferred per coordinator suggestion, pending a user hard sentence and not a user hard pin · Redis separately evaluable/not STOPPED · docs only · Dual PASS ≠ authorize coding · zero coding
**releaseEvidence=false** · **≠HA** · **≠suite green** · Ban branch-name MySQL justification  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · pre-exec dual **PASS** (receipts archived)  
**Honesty**: Dual on **`0c95883`** · tip may include provisional wake overlay (e.g. `32d0724`) — **wake = provisional overlay after dual** · not a user hard pin · no wake-patch re-dual required · Redis still orthogonal/not STOPPED

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
| Dual receipt · e2e-ha | `reviews/2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md` → **pass** |
| Dual receipt · rag-route | `reviews/2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md` → **pass** |

## One-line scope

Docs-only pin that relational+checkpoint+vector stay on **Postgres (+pgvector + PostgresSaver)**; stop MySQL/Qdrant cutover knives; include **resource sizing** honesty vs former MySQL+Qdrant+Redis plan.

## Hard pins

- Postgres retained · PostgresSaver stays · pgvector retained · MySQL not sole relational · Qdrant not sole vector · ADR mysql relational+vector superseded · provisional production wake preference = Postgres LISTEN/NOTIFY · Redis eval deferred pending a user hard sentence, not a user hard pin, and Redis not STOPPED · `releaseEvidence=false` · ≠HA · ≠suite · Dual PASS ≠ coding · zero coding · F8 untouched

## CMD

| CMD | Status |
|-----|--------|
| docs dual | **`post_prove_dual_pass`** · receipts: `reviews/2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md` + `…-mw-rag-route.md` → **pass** · no prove · zero coding |

---

*Slice · PG-retained · 2026-09-17 (~01:31 PT) · post_prove_dual_pass · dual on 0c95883 · wake provisional overlay after dual · releaseEvidence=false · ≠HA · ≠suite · Ban cutover · Dual PASS ≠ authorize coding · zero coding*
