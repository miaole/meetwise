# Slice — **UC-E2E-018 COVERED-CRITERION**（`GAP-UC018-COVERED-CRITERION` · written partial→covered criterion + computable six-column evaluator restore plan · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · **Ban** flip UC-018 / §1.1 to **covered** · **Ban** invent covered · **Ban** claim production capacity / HA · **Ban** skip to UC-011 · **Ban** MySQL/Qdrant cutover · **Ban** wash `b29c191` constant-false into 「已评估不可翻」）

**Status**: **`draft:awaiting_pre_exec_dual`**（实现方预写 · **not yet dual-sent** · **Ban自批 pass** · Dual PASS ≠ coding · Dual PASS ≠ UC-E2E-018 covered · Dual PASS ≠ §1.1 flip · Dual PASS ≠ next knife · **≠ coding** · **≠ prove** · matrix §1.1 **partial** retained · this knife = criterion + evaluator plan only · any real flip = separate later knife with dual）
**Date**: 2026-09-23 (~20:04 PT)
**Base / parent tip**: **`f886ea5`** / full `f886ea5961c437587519a5c7a628cc4295b8fb22` · regression pin **`b29c191`**（constant-false no-flip guard · not assessment）· computed tip **`5cddb53`** · reassess nail **`0b7a218`** · ADV **`27dd6ae`** · covered-lift **`abfbbc0`** · SOLE **`aa968b1`** · UI/TTL/GRAPH/FULL-E2E · D2b **`7fddebe`** · Ban reopen · Ban wash · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Meridian banned · Ban Cloud Agent · Ban invent covered · Ban flip §1.1 · Ban coding until dual+authorize · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ UC-E2E-018 covered this open** · Dual PASS ≠ invent covered · Dual PASS ≠ next knife · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · prior nails **retained**
**Experts**: `mw-e2e-ha` + `mw-rag-route` · dual not yet run · Ban自批
**Critical stack pin**: `adr-postgres-retained.md` · retained sole = **Postgres (+pgvector + PostgresSaver)** · Ban MySQL/Qdrant · Ban MemorySaver as covered evidence
**Carried condition**: PERF/LOAD nail §1.5 — later covered-lift / §1.1 flip must restore computable evaluator that can return true + written covered criterion + dual PASS · else FAIL · **this REQUEST is that restore L0**

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/uc-e2e-018-covered-criterion.slice.md` |
| Harness（SSOT criterion + evaluator design） | `ai-docs/delivery/harness/uc-e2e-018-covered-criterion.md` |
| Parent UC harness | `harness/uc-e2e-018-user-abandon.md` |
| PERF/LOAD nail（carried condition + regression pin） | `harness/uc-e2e-018-perf-load.md` |
| Reassess（computed at `5cddb53`） | `harness/uc-e2e-018-covered-lift-reassess.md` |
| Eval | `eval/uc-e2e-018-user-abandon.eval.md` |
| Dual stub · e2e-ha | `reviews/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-e2e-ha.md` · **PENDING** |
| Dual stub · rag-route | `reviews/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-rag-route.md` · **PENDING** |

## One-line scope

Docs REQUEST: freeze **written partial→covered criterion** per NEG/FAULT/BOUND/ADV/PERF/LOAD + UC-level（all six covered AND §1.1 business path AND no open GAP）· design pure `evaluate(input)` at `scripts/lib/uc-covered-evaluator.mjs` · adversarial fixtures · prove plan `pnpm uc018:covered-criterion:prove` · **Hard rule: this knife does NOT flip UC-018/§1.1** · **local isolated PERF/LOAD caps at partial**（capacity-representative env required for PERF/LOAD covered）· expected real-matrix `canHonestlyFlip=false`（expectation）· cite `f886ea5` / `b29c191` / `5cddb53` · pins NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed=true / coveredCount=8 / ms3EqualsR4Closed=false · PG-retained · Ban invent covered · Ban skip to UC-011 · STOP after push.

## Criterion summary（brief · full in harness §1）

| Column | partial→covered requires | Cap / note |
|--------|--------------------------|------------|
| **NEG** | NHP-018-NEG-01 + dedicated prove EXIT=0 @ committed SHA + dual BOTH PASS + real PG/PostgresSaver | keep-partial if case-only / implementer-only / open GAP / stub |
| **FAULT** | NHP-018-FAULT-01 elevated + same evidence bar | today often case-only → keep-partial |
| **BOUND** | named BOUND evidence executed + same bar | keep-partial if happy-path only |
| **ADV** | NHP-018-ADV-01 + same bar | ADV alone ≠ UC covered |
| **PERF** | NHP-018-PERF-01 + same bar **+ capacity-representative env receipt** | **local isolated caps at partial** |
| **LOAD** | NHP-018-LOAD-01 + same bar **+ capacity-representative env receipt** | **local isolated caps at partial** |
| **UC §1.1** | all six `meetsCovered` AND §1.1 business path AND no open GAP · separate covered-lift knife | **Ban this knife flip** |

**Capacity-representative** = declared target env + caps matching sizing SSOT（W2 / W0 §2）+ dual EOR on that env · cite `testing/e2e-performance-evidence.md` §3.

## Evaluator（plan）

- Path: `scripts/lib/uc-covered-evaluator.mjs`
- `evaluate(input) → { canHonestlyFlip, columns: {col: {status, meetsCovered, reasons[]}}, reasons[] }`
- Deterministic · no hardcoded refuse · true branch reachable · reassess prove calls it

## Fixtures（plan）

`FX-ALL-MET`→true · `FX-MISS-{NEG,FAULT,BOUND,ADV,PERF,LOAD}`→false · `FX-OPEN-GAP` · `FX-S11-NOT-MET` · `FX-IMPL-ONLY` · `FX-PERF-LOCAL-ONLY` · + constant-false guard test

## Prove CMD（plan）

`pnpm uc018:covered-criterion:prove` · EXIT=0 iff fixtures hold AND real-matrix computed verdict AND guard passes · Ban matrix flip

## Expected real verdict（expectation）

`canHonestlyFlip=false` · six columns partial≠covered · PERF/LOAD local-only cap · §1.1 stays partial · coveredCount=8

## Hard pins

- Status **`draft:awaiting_pre_exec_dual`** · GAP-UC018-COVERED-CRITERION **OPEN**
- Hard rule: builds/proves evaluator only · **no** UC/§1.1 flip
- Cite `f886ea5` · `b29c191` constant-false · `5cddb53` computed · carried condition
- `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained
- Ban invent covered · Ban wash PERF/LOAD/ADV/SOLE into covered · Ban skip to UC-011 · Ban coding/prove this open · Dual PASS ≠ next knife

## Dual receipts（named · not pre-filled）

| Expert | Receipt path | Status |
|--------|--------------|--------|
| `mw-e2e-ha` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-e2e-ha.md` | **PENDING / draft:awaiting_pre_exec_dual** |
| `mw-rag-route` | `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-018-covered-criterion-mw-rag-route.md` | **PENDING / draft:awaiting_pre_exec_dual** |

## Lifecycle

| Phase | This open |
|-------|-----------|
| L0 REQUEST `draft:awaiting_pre_exec_dual` | **THIS OPEN** · `f886ea5` · docs only |
| L1 Pre-exec dual | awaiting · Ban自批 |
| L2 AUTHORIZED coding+prove | **blocked** · Ban §1.1 flip |
| L3–L5 / covered-lift elevate | **separate later knife** |

## Non-claims

Not UC-E2E-018 covered · not §1.1 flip · not column covered elevate · not production capacity / HA · not MySQL/Qdrant · not cite `canHonestlyFlip@b29c191` as assessed · not a covered-lift knife · not coding/prove this open.

*Slice · UC-E2E-018 COVERED-CRITERION · GAP-UC018-COVERED-CRITERION · 2026-09-23 (~20:04 PT) · draft:awaiting_pre_exec_dual · f886ea5 · b29c191 · 5cddb53 · local PERF/LOAD cap at partial · evaluator scripts/lib/uc-covered-evaluator.mjs · prove pnpm uc018:covered-criterion:prove · expected canHonestlyFlip=false · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount 8 · ms3EqualsR4Closed=false · Ban invent covered · Ban flip §1.1 · Ban skip to UC-011 · STOP after push*
