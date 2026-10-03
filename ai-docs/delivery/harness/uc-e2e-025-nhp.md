# Harness — **UC-E2E-025 NHP**（row id **`UC-E2E-025`** · stale quiz as interview input · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban edit UC-018 / UC-052 rows · Ban invent covered）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Dual PASS ≠ coding · Dual PASS ≠ covered）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~21:00 PT)
**Base / parent tip**: series opened against origin `feat/mysql-schema-skeleton` **`315870e`** / full `315870e502210ac54a4068ac33aeb12721a64766`（`receipt(g7): sync FR2 tipSha in markdown` · historical branch name · Ban MySQL cutover）
**Knife name**: **UC-E2E-025 · next UC NHP**（not UC-E2E-018 · not UC-E2E-052）
**Row id**: **`UC-E2E-025`**
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · public DELETE stays **503** · **gR45Closed=true** retained · coveredCount **8** retained · **ms3EqualsR4Closed=false** retained · PG-retained · this row stays **gap** / **blind** until a later authorized prove · Ban invent covered
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve）
**Authority**: meetwise — docs REQUEST open only · status `draft:awaiting_pre_exec_dual` · Ban secrets / `.env*` · Ban force-push · Ban coding until dual+authorize
**Honesty**: Identification only. This open does not edit `e2e-requirement-coverage-matrix.md`, `gap-bug-backlog.md`, or `execution-master-checklist.md`.

---

## Why this row

Read of `ai-docs/delivery/e2e-requirement-coverage-matrix.md` §1.0.1. Exact row id **`UC-E2E-025`**:

| Column | Status in that row |
|--------|--------------------|
| NEG | **gap** |
| FAULT | **gap** |
| BOUND | **gap** |
| ADV | **blind** |

§1.1 same id: coverage **gap**（产品 reject 未接线 · `pnpm uc025:stale-quiz-expiry:prove` is an honesty pin, ≠ covered）. NHP case anchor `NHP-025-NEG-01` current flag **gap**（`non-happy-path-perf-load-case-matrix.md`）. `e2e-covered-path-backlog.md` 「下一刀顺序」 item 1 is UC-025. Not UC-E2E-018. Not UC-E2E-052.

## Goal

Docs REQUEST for the next NHP on **`UC-E2E-025`** only: stale quiz presented as interview input must be rejected（version mismatch / expiry）, with NEG before any happy path. Existing honesty prove stays a gap pin. This open does not wire product reject and does not flip the row.

## Ban

- Ban edits to the UC-E2E-018 row and the UC-E2E-052 / UC-E2E-050–052 row
- Ban edits to SSOT matrix / gap backlog / execution checklist
- Ban skip-ahead claims that this row is partial or covered
- Ban fake-model pass

## NHP

| Order | Item |
|-------|------|
| 1 NEG | Stale / expired quiz as interview input → reject · `NHP-025-NEG-01` |
| 2 FAULT | Missing expiry field fails closed · Ban treating absent `expires_at` as fresh |
| 3 BOUND | Version mismatch does not start an interview |
| 4 ADV | Replayed quiz id from another user → reject · no leak |
| 5 PERF | Not this knife |
| 6 LOAD | Not this knife |
| HP last | Only after the negatives · still ≠ covered until a later nail |

## Prove plan（after authorize · not this open）

1. Keep `pnpm uc025:stale-quiz-expiry:prove` as the honesty pin（EXIT 0 there ≠ covered）
2. Product reject is a later coding knife, not this REQUEST
3. Do not edit matrix rows

## Dual stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-uc-e2e-025-nhp-mw-e2e-ha.md` | **PENDING** |
| `mw-rag-route` | `reviews/REQUEST-2026-10-02-uc-e2e-025-nhp-mw-rag-route.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · Ban invent covered · STOP after push

*Harness · row UC-E2E-025 · gap/blind · draft:awaiting_pre_exec_dual · Ban 018/052 row edits · STOP*
