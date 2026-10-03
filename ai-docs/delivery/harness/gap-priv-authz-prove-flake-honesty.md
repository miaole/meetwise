# Harness — **GAP-PRIV-AUTHZ-PROVE-FLAKE honesty**（root-cause honesty knife · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · gap stays OPEN）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban self-approve · Ban coding · this commit is not coding authorization）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-02 (~22:00 PT)
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`58c0031`** / full `58c003156c3fc69505ecb3daa2e3dad25f4a6dfc`（Line F docs nail · not a prove tip）
**Knife**: **GAP-PRIV-AUTHZ-PROVE-FLAKE honesty**
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog row stays **OPEN** · status **mitigated/cause-unknown**）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban product edits · Ban UC-052 product files

## What the backlog already records

Quoted from `ai-docs/delivery/gap-bug-backlog.md` row `GAP-PRIV-AUTHZ-PROVE-FLAKE`, and repeated by the Line F nail `58c0031` / checklist: the gap stays **OPEN**, **mitigated/cause-unknown** (not fixed). `pnpm privacy-authorization:prove` is not a single root.

- Historical e2e-ha @`69de818` first-run #1 `ECONNREFUSED` EXIT=1 · #2 EXIT=0 retained.
- Ledger v1 @`71ec253` keeps both failures.
- **cold#5** EXIT=1: log `logs/cold-5.log` `Error: connect ECONNREFUSED 127.0.0.1:33047` and `ISOLATED_POSTGRES_OUTPUT_WITHHELD … state_bytes=29 logs_bytes=29`. Review `49ef158` §5 quotes the same `ECONNREFUSED 127.0.0.1:33047`.
- **warm#2** EXIT=1: log `logs/warm-2.log` is SQLSTATE **23505** constraint `interview_pkey` (`Key (id)=(00000000-0000-4000-8000-0000000000a1) already exists`), **not** ECONNREFUSED. Review `49ef158` §5 agrees.
- v2 @`3d0c71e`: **cold_v2 10/10 EXIT 0** and **warm_v2 10/10 EXIT 0**. Those greens are not a root. Two failure classes remain.
- Ban retry-to-green. Ban claim closed or root-caused. Record every attempt EXIT. Do not treat v2 20/20 or a later single green as closing this row.

The exact slash phrase `privacy-authorization:prove / target_drift` is not the flake row. This REQUEST does not import that phrase. The named command in the backlog row is `pnpm privacy-authorization:prove`.

## Ask（honesty knife only）

A later, separately authorized knife may capture the **first-run** failure of `pnpm privacy-authorization:prove` and record that attempt's EXIT **without** looping until a later attempt is green. This open does not run that command, does not add a script, and does not edit `package.json`.

## Ban

- Ban retry-to-green. Ban claiming this gap fixed, closed, or root-caused.
- Ban treating cold_v2 / warm_v2 EXIT 0, or any later single green, as closing the row.
- Ban edits to UC-052 product files, including `apps/worker/src/checkpoint-principal.ts`. UC-052 stays **partial**. Do not flip UC-052. Do not flip UC-018.
- Ban SSOT edits: matrix, backlog, checklist.
- This REQUEST does not authorize coding. Dual PASS later would still not be a close of the gap.

## Review stubs

| Expert | Path | Status |
|--------|------|--------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-02-gap-priv-authz-prove-flake-honesty-mw-privacy-int.md` | **PENDING** |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-02-gap-priv-authz-prove-flake-honesty-mw-e2e-ha.md` | **PENDING** |

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · gap stays OPEN · STOP

*Harness · GAP-PRIV-AUTHZ-PROVE-FLAKE · draft:awaiting_pre_exec_dual · OPEN mitigated/cause-unknown · STOP*
