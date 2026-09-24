# Slice — **UC-E2E-018 ADV**（docs REQUEST · **`draft:awaiting_pre_exec_dual`** · `GAP-UC018-ADV` · `NHP-018-ADV-01` · ADV alone ≠ UC covered · Ban invent covered · Ban wash ADV into covered · Ban flip §1.1 covered · Ban elevate ADV to **partial** this open · Ban claim PERF/LOAD closed · Ban skip to UC-011 · Ban reopen SOLE/UI/TTL/GRAPH/FULL-E2E/covered-lift non-flip · Ban MySQL/Qdrant cutover · Ban claim suite green / HA / R5 retired globally）

**Status**: **`draft:awaiting_pre_exec_dual`**（实现方预写 · **not yet dual-sent** · **Ban自批 pass** · Dual PASS ≠ coding · Dual PASS ≠ UC-E2E-018 covered · Dual PASS ≠ ADV partial · Dual PASS ≠ matrix §1.1 flip · Dual PASS ≠ next knife auto-authorize · **≠ coding** · **≠ prove** · **≠ invent covered** · **≠ wash ADV into covered** · **≠ invent green** · **≠假绿** · **≠假关** · matrix business **partial** retained · §1.0 ADV **blind→case-only** registration only）
**Date**: 2026-09-23 (~18:48 PT)
**Base / parent tip**: covered-lift nail **`abfbbc0`** / full `abfbbc08b592d9276cfcf4d3ba3991d3f5b58306`（`GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip · **canHonestlyFlip=false** · refuse ADV **blind** · matrix **partial** · **≠ UC covered** · Ban invent covered · Ban假关 · **must be ancestor**）· prior SOLE **`aa968b1`** CLOSED · prior UI **`1990b12`** CLOSED · prior TTL **`d698282`** CLOSED · prior GRAPH **`08650ea`** CLOSED · prior FULL-E2E **`c36b032`** CLOSED · prior waiting_user CLOSED · prior HA D2b **`7fddebe`** CLOSED · Ban reopen · Ban wash HA into E2E · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）
**Authority**: meetwise — **docs REQUEST open only** · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Meridian banned · Ban Cloud Agent · Ban self-approve · Ban self-nail · Ban coding until dual+authorize · Ban invent covered · Ban flip §1.1 covered · Ban elevate ADV to partial this open · Ban wash ADV/SOLE/UI/TTL/GRAPH/FULL-E2E/HTTP/covered-lift/D2b/HA into covered · Ban skip to UC-011 · Ban messaging dual reviewers（coordinator dispatches）· **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ UC-E2E-018 covered this open** · Dual PASS ≠ coding · Dual PASS ≠ covered · Dual PASS ≠ ADV partial · Dual PASS ≠ next knife · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban自批 · Key×3 FreeTier **out of scope** · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6 / r4 / funnel product flags **retained** · prior covered-lift **`post_prove_dual_pass`** **retained**（non-flip · Ban reopen）· prior SOLE/UI/TTL/GRAPH/FULL-E2E/D2b **`post_prove_dual_pass`** **retained** · `releaseEvidence=false` **retained** · ≠HA
**Experts**: `mw-e2e-ha` + `mw-rag-route` · pre-exec dual **not yet run** · Ban自批 · experts write reviews at named paths · Dual not pinged by implementer · coordinator dispatches
**Critical stack pin**: `adr-postgres-retained.md` · retained sole = **Postgres (+pgvector + PostgresSaver)** · Ban MySQL business cutover · Ban Qdrant-as-required-vector · STOPPED R5 cutover harnesses · Ban reopen Qdrant-required

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/uc-e2e-018-adv.slice.md` |
| Harness | `ai-docs/delivery/harness/uc-e2e-018-adv.md` |
| Parent UC harness（honesty name ADV REQUEST OPEN · cite covered-lift refuse ADV blind · Ban flip covered） | `harness/uc-e2e-018-user-abandon.md` §1b · Ban rewrite as covered now |
| Covered-lift parent nail（cite · Ban reopen non-flip） | `harness/uc-e2e-018-covered-lift.md` · tip **`abfbbc0`** · refuse ADV blind |
| Eval（plan-in-harness · Ban invent prove green · optional adv.eval later under coding） | `eval/uc-e2e-018-user-abandon.eval.md` |
| Must cite | covered-lift refuse ADV blind · `adr-postgres-retained.md` · matrix UC-E2E-018 **partial** · §1.0 ADV **blind→case-only** · NHP-002-ADV-01 / NHP-011-ADV-01 · abandon HTTP / `uc018:abandon:http:prove` · P0-8 · Ban invent covered · Ban wash ADV into covered · Ban skip to UC-011 |
| NHP case | **NHP-018-ADV-01** in `non-happy-path-perf-load-case-matrix.md` · **blind→case-only** |
| Prior SOLE / UI / TTL / GRAPH / FULL-E2E / D2b | tips **`aa968b1`** / **`1990b12`** / **`d698282`** / **`08650ea`** / **`c36b032`** / **`7fddebe`** · each CLOSED only · Ban wash · Ban reopen |
| Parent / stance | **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · matrix business **partial** · Ban invent covered · Ban flip covered this open · PG-retained sole |
| REQUEST · e2e-ha (named · expert writes) | `reviews/REQUEST-2026-09-23-uc-e2e-018-adv-mw-e2e-ha.md` · **PENDING / draft:awaiting_pre_exec_dual** |
| REQUEST · rag-route (named · expert writes) | `reviews/REQUEST-2026-09-23-uc-e2e-018-adv-mw-rag-route.md` · **PENDING / draft:awaiting_pre_exec_dual** |

## One-line scope

Docs REQUEST open: **UC-E2E-018 ADV · GAP-UC018-ADV · NHP-018-ADV-01** · parent tip **`abfbbc0`**（covered-lift refuse ADV blind）· register abandon adversarial case（replay / tamper body / cross-tenant abandon / forged auth / inject against `POST /api/interview/:id/abandon`）· matrix §1.0 ADV **blind→case-only** · Ban elevate to **partial** this open · intended later（under authorize）`pnpm uc018:adv:prove` EXIT=0 → elevate §1.0 ADV **case-only→partial**（THIS column only）· **ADV alone ≠ UC covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed · Ban skip to UC-011 · pins `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · Ban假绿 · Ban MySQL/Qdrant cutover · Ban claim suite green / HA / R5 retired globally · Lifecycle: REQUEST → pre-exec dual → AUTHORIZED coding+prove → awaiting_post_prove → post-prove dual → AUTHORIZED nail → `post_prove_dual_pass` → STOP · Dual PASS ≠ next knife · Dual PASS ≠ coding · Dual PASS ≠ covered · Dual PASS ≠ ADV partial · Key×3 FreeTier out of scope · retain covered-lift non-flip + SOLE/UI/TTL/GRAPH/FULL-E2E/D2b + `gR45Closed=true` / coveredCount **8** / `ms3EqualsR4Closed=false` / eg1–eg6/r4/funnel · out of scope: invent covered · flip §1.1 · elevate ADV partial this open · claim PERF/LOAD closed · skip to UC-011 · MySQL/Qdrant cutover · Meridian · Cloud Agent · D3 · cloud buy · secrets / `.env*` · zero coding · zero prove · Dual not pinged by implementer.

## Hard pins

- **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · Ban flip · Ban假绿 · Ban invent green · Ban invent covered · Ban假关 · Ban claim UC-E2E-018 covered this open · matrix §1.1 stays **partial** · §1.0 ADV **case-only** only this open · Ban elevate ADV to **partial** until authorize+prove · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban claim PERF/LOAD closed · Ban skip to UC-011 · Ban wash SOLE/`aa968b1` / UI/`1990b12` / TTL/`d698282` / GRAPH/`08650ea` / FULL-E2E/`c36b032` / waiting_user / HTTP/`uc018:abandon:*` / covered-lift/`abfbbc0` / D2b/`7fddebe` / HA into covered · Ban reopen SOLE/UI/TTL/GRAPH/FULL-E2E/covered-lift non-flip/D2b/STOPPED R5 · Dual PASS ≠ coding · Dual PASS ≠ covered · Dual PASS ≠ ADV partial · Dual PASS ≠ next knife · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6/r4/funnel **retained** · prior covered-lift + SOLE + UI + TTL + GRAPH + FULL-E2E + D2b **retained** · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban D3 · Ban cloud buy · Key×3 FreeTier **out of scope** · Dual not pinged by implementer · Ban messaging dual reviewers · parent harness honesty name OPEN only · Ban rewrite covered
- Lifecycle: L0 this open · L1–L5 coding/prove/ADV-elevate **not** executed · REQUEST → pre-exec dual → AUTHORIZED coding+prove → awaiting_post_prove → post-prove dual → AUTHORIZED nail → `post_prove_dual_pass` → STOP · no second knife
- Acceptance later: pre-exec dual BOTH PASS → standing authorize → AUTHORIZED `uc018:adv:prove` + elevate §1.0 ADV case-only→partial（THIS column only）+ retained Family CMDs EXIT=0 → post-prove dual BOTH PASS → lifecycle nail → STOP · **Ban假绿** · **Ban invent covered** · **Ban假关** · **Ban wash ADV alone = covered**

## Scope

| In scope（later under authorize · not this open） | Out of scope |
|--------------------------------------------------|--------------|
| NHP-018-ADV-01 classes prove · `pnpm uc018:adv:prove` · elevate §1.0 ADV **case-only→partial**（THIS column only）· update parent/eval/NHP honesty · retain prior proves · keep hard HA/product pins · Ban wash ADV into §1.1 covered | Invent covered this open · flip §1.1 covered · elevate ADV to partial this open · claim PERF/LOAD closed · skip to UC-011 · MySQL/Qdrant cutover · G1 flip · reopen covered-lift non-flip/`abfbbc0` · reopen SOLE/UI/TTL/GRAPH/FULL-E2E/D2b · reopen STOPPED R5 · HA wash into covered · claim suite green / R5 retired globally · D3 · cloud buy · Meridian · Cloud Agent · secrets / `.env*` · coding+prove this open · messaging dual reviewers · force push · next knife · wash ADV alone into covered |

## Dual receipts（named · not pre-filled）

| Expert | Receipt path | Status |
|--------|--------------|--------|
| `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-adv-mw-e2e-ha.md` | **PENDING / draft:awaiting_pre_exec_dual** |
| `mw-rag-route` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-adv-mw-rag-route.md` | **PENDING / draft:awaiting_pre_exec_dual** |

Implementer does **not** pre-fill pass · Dual **not** pinged by implementer · coordinator dispatches · Ban自批 · Dual PASS ≠ coding · Dual PASS ≠ covered · Dual PASS ≠ ADV partial · Dual PASS ≠ next knife.

## Lifecycle

| Phase | This open |
|-------|-----------|
| L0 REQUEST `draft:awaiting_pre_exec_dual` | **THIS OPEN** · parent `abfbbc0` · docs only · NHP-018-ADV-01 register + prove plan |
| L1 Pre-exec dual | awaiting · Ban自批 · coordinator dispatches |
| L2 AUTHORIZED coding+prove | **blocked** |
| L3–L5 post-prove → nail → STOP | later · elevate §1.0 ADV case-only→partial（THIS column only）**only if** prove EXIT=0 · **ADV alone ≠ covered** · Ban假关 |

## Non-claims

Not UC-E2E-018 covered · not matrix/full-suite covered · not invent covered · not §1.1 flip · not ADV **partial** this open · not PERF/LOAD closed · not MySQL/Qdrant cutover · not G1 flip · not HA/production failover · not release evidence · not R5 retired globally · not a wash of SOLE/UI/TTL/GRAPH/FULL-E2E/covered-lift/D2b/HA/abandon proves · not coding/prove this open · not ADV alone = covered · not skip to UC-011 · not a next knife.

*Slice · UC-E2E-018 ADV · GAP-UC018-ADV · NHP-018-ADV-01 · 2026-09-23 (~18:48 PT) · draft:awaiting_pre_exec_dual · docs only · parent abfbbc0 · covered-lift refuse ADV blind · adr-postgres-retained · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount 8 · ms3EqualsR4Closed=false · ADV alone ≠ covered · matrix business partial · Ban wash ADV/SOLE/UI/TTL/GRAPH/FULL-E2E/HTTP/covered-lift/D2b/HA into covered · Ban skip to UC-011 · Ban coding until dual+authorize · STOP*
