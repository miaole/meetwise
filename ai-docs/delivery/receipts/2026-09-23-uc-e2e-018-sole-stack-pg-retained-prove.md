# Prove receipt — UC-E2E-018 sole-stack PG-retained · GAP-UC018-SOLE

**Date**: 2026-09-23 (~18:02–18:06 PT)  
**Branch**: `feat/mysql-schema-skeleton`  
**Knife**: UC-E2E-018 sole-stack PG-retained · §1b #6 only · `GAP-UC018-SOLE`  
**Status after prove**: `executed:awaiting_post_prove_dual` · **Ban self-nail** · **≠ post_prove_dual_pass**  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false**  
**Matrix**: stays **partial** · **≠ UC-E2E-018 covered** · **#6 alone ≠ covered**  
**Critical stack pin**: retained sole = **Postgres (+pgvector + PostgresSaver)** per `adr-postgres-retained.md` · **Ban** MySQL business cutover · **Ban** Qdrant-as-required-vector  
**Ban wash**: MySQL/Qdrant `e2e-isolation:sole-*:prove` / `mysql-stack:*` · UI/`1990b12` / TTL/`d698282` / GRAPH/`08650ea` / FULL-E2E/`c36b032` / HTTP/`uc018:abandon:*` / D2b/`7fddebe` / HA / liveGhaRunUrl into #6 closed / UC covered  
**STOPPED R5**: `harness/r5-retirement-sole-stack-status.md` / `harness/r5-pgvector-fixture-mark-red.md` superseded · Ban reopen · Ban claim R5 retired globally

## Pre-exec dual (retained)

| Expert | Tip | Verdict |
|--------|-----|---------|
| mw-rag-route | `7e29e28` | PASS |
| mw-e2e-ha | `31e7eff` | PASS |
| REQUEST tip | `e6d10c5` | dual BOTH PASS before coding · ancestor of prove tip |

## Deliverable

1. Dedicated static honesty prove `pnpm uc018:sole:prove` → `scripts/uc-e2e-018-sole-stack-pg-retained.proof.mjs`
2. Parent harness §1b #6 → **`GAP-UC018-SOLE` CLOSED** under PG-retained · matrix still **partial** · **#6 alone ≠ covered**
3. Matrix / backlog / eval honesty updated · Ban claim UC covered
4. Cite unit requires `uc018:sole:prove` + PG-retained / GAP-UC018-SOLE
5. Knife harness+slice → `executed:awaiting_post_prove_dual`

## CMD + EXIT (honest)

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | `pnpm uc018:sole:prove` | **0** | dedicated PG-retained sole honesty · closes `GAP-UC018-SOLE` only · **#6 alone ≠ covered** |
| 2 | `pnpm uc018:abandon:prove` | **0** | retained db · ≠ covered |
| 3 | `pnpm uc018:abandon:http:prove` | **0** | retained HTTP · ≠ covered · ≠ sole |
| 4 | `pnpm uc018:abandon:full-e2e:prove` | **0** | retained FULL-E2E · already CLOSED · ≠ covered |
| 5 | `pnpm uc018:graph:prove` | **0** | retained GRAPH · already CLOSED · ≠ covered |
| 6 | `pnpm uc018:ttl:prove` | **0** | retained TTL · already CLOSED · ≠ covered |
| 7 | `pnpm uc018:ui:prove` | **0** | retained UI · already CLOSED · ≠ covered · UI alone ≠ covered |
| 8 | `pnpm eval-harness-matrix-cite:prove` | **0** | cite honesty · UC-E2E-018 **partial** not covered |

## Non-claims

- Ban claim UC-E2E-018 covered / matrix covered / full suite covered
- Ban #6 alone = covered · Ban elevating without separate covered-lift authorize
- Ban Meridian · Cloud Agent · self-nail · D3 / cloud buy
- Ban secrets / `.env*` / test-results staged
- Ban wash MySQL/Qdrant sole-wiring EXIT as this gap
- Ban wash UI/TTL/GRAPH/FULL-E2E/HTTP alone as #6 closed
- Ban claim HA / releaseEvidence=true / R5 retired globally
