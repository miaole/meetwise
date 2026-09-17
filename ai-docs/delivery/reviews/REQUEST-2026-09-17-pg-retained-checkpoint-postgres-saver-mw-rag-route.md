# REQUEST — **PG-retained** · Postgres (+pgvector + PostgresSaver)（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~01:15 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ MySQL sole relational** · **≠ Qdrant sole vector** · **≠ RAG cutover** · **≠ R4 closed**  
**Pair**: `REQUEST-2026-09-17-pg-retained-checkpoint-postgres-saver-mw-e2e-ha.md`  
**Hard**: meetwise 2026-09-17 — vector stays **pgvector** · Ban Qdrant-as-required sole vector · Ban MySQL sole relational · PostgresSaver stays · Redis wake orthogonal · R1–R4 product gates **not** closed by this docs pin · **F8 untouched** · **zero coding / zero prove** · Dual PASS ≠ authorize coding · Ban self-approve

---

## Contra

| File | Role |
|------|------|
| `harness/pg-retained-checkpoint-postgres-saver.md` | Canonical harness（resource sizing · STOPPED Qdrant inventory） |
| `pg-retained-checkpoint-postgres-saver.slice.md` | Slice index |
| `eval/pg-retained-checkpoint-postgres-saver.eval.md` | Pre-exec eval |
| `adr-postgres-retained.md` | Successor ADR |
| `adr-mysql-qdrant-local.md` | Partial supersession（relational+vector） |
| `m4-rag-hard-gates.md` | R1–R4 product gates remain；stack/Qdrant-required claims superseded |
| Parallel **untouched** | F8 MS3 · R4 meta product knives · commerce · egress |

---

## Stance（rag-route）

1. Docs-only: **pgvector retained** as vector truth · Qdrant vector cutover **STOPPED**  
2. Does **not** close R1/R2/R3/R4 / FUNNEL-01 · only stops MySQL/Qdrant *cutover* direction  
3. Resource sizing is planning envelope · ≠HA · ≠suite · ≠ retrieve quality proof  
4. Redis wake orthogonal  
5. **`not_run:pre_dual`** · Dual PASS ≠ authorize coding  

---

## Please answer

1. Agree vector truth stays **Postgres pgvector** · Ban Qdrant-required sole vector / replace-pgvector cutover?  
2. Agree STOPPED Qdrant inventory（m4/m5/qdrant-* / g1 / r5 retirement sole claims）is correct honesty · history kept?  
3. Agree this pin **≠** R4 closed · **≠** FUNNEL-01 closed · **≠** RAG quality green?  
4. Agree ADR mysql vector-cutover claims superseded · successor ADR ok?  
5. Agree resource sizing ≠ capacity / HA / suite proof?  
6. Agree Redis wake still separately evaluable · F8 untouched · `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-pg-retained-checkpoint-postgres-saver-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not R4/FUNNEL closed · not Qdrant cutover · not MySQL cutover · not HA · not suite · Dual PASS ≠ authorize coding

---

*REQUEST · mw-rag-route · PG-retained · 2026-09-17 (~01:15 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · ≠R4 closed · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
