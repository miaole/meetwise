# Prove receipt — UC-E2E-050–052 Line B · `uc052:internal-erasure:prove`

**Date**: 2026-09-23 PT  
**Worktree**: `/workspace/meetwise-lineB` (isolated; shared `/workspace/meetwise` untouched)  
**Runner/code tip (committed before prove)**: `6d6e11b` (`6d6e11bc123eccf78c968e927b79a7e41f2118d6`)  
**Step 0 tip**: `4643c02` · file only `packages/db/test/privacy-authorization.proof.ts` · PR #104 `f0f52bd`  
**Evidence JSON**: `receipts/uc050-052-privacy-erasure/2026-09-23-uc052-internal-erasure-evidence.json`  
**Pins**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · public DELETE stays **503** · PG-retained  

## CMD | EXIT

| CMD | EXIT | Notes |
|-----|------|-------|
| `pnpm privacy-authorization:prove` @ `4643c02` | **0** | Step 0 hard gate |
| `pnpm uc052:internal-erasure:prove` @ `6d6e11b` | **0** | run-e2e-isolated · PG/LEGACY · R5-MARKED-RED banner named gap only |

## Case table (none skipped)

| id | result | request status observed |
|----|--------|-------------------------|
| NHP-050-FAULT-01 | pass | pending_external (report=failed → retry → erased) |
| NHP-050-FAULT-02 | pass | pending_external (replayed=true) |
| NHP-050-FAULT-03 | pass | pending_external (fence-revive rejected) |
| NHP-050-FAULT-04 | pass | purging (epoch-drift claim rejected; ≠ completed/partial_failed) |
| NHP-050-FAULT-05 | pass | pending_external (re-erase idempotent; events stay 0) |
| NHP-050-NEG-02 | pass | n/a (forged JWS null; GUC-only claim refuse) |
| NHP-050-NEG-03 | pass | n/a (cross-tenant claim refuse; other subject intact) |
| NHP-050-BOUND-01 | pass | winners=1 · lease exclusive · eventTargets=1 · no deadlock |
| NHP-050-NEG-01 | pass | HTTP 503 · app_role EXECUTE privacy_begin_checkpoint_erasure=false |
| HP-050-01 | pass | pending_external · locals erased · externals retention_pending |
| C-CASECOUNT | pass | all REQUIRED present |

## Per-sink SQL asserts (admin SELECT read=0 after happy / successful local purge)

| sink | assert |
|------|--------|
| event | `SELECT count(*) FROM interview_event WHERE stream_key=$interviewId` → 0 |
| ai_graph_run | `SELECT count(*) FROM ai_graph_run WHERE thread_id=$interviewId` → 0 |
| report | aggregate counts on `ai_report`/`assessment_report`/`learning_plan`/`learning_progress`/`career_path`/`question_feedback` → 0 |
| checkpoint_rows | fence-only at projection begin (no physical checkpoint purge this knife) |
| oss / redis / langfuse | `privacy_deletion_target.status='retention_pending'` (Ban fake non-PG count-as-erased) |

## BOUND-01 evidence

Concurrent `claimAuthorizationTarget` on same event target → **winners=1** (`a=true`,`b=false`) · single event ledger row · 0091 unexpired exclusive lease semantics · no duplicate ledger rows · no deadlock.

## Honesty

- Stack path = **PG/LEGACY** via `run-e2e-isolated` · do **not** cite MySQL+Qdrant R5 banner as sole-stack truth.
- Externals stay `retention_pending` · request terminal **`pending_external`** · Ban `completed` · Ban expect reachable request `partial_failed` (0096 CASE order).
- No new HTTP route · no app_role re-GRANT · migrations 0091/0096 untouched.
- No shared SSOT edits this knife (nail time only).
- Receipts committed **after** prove at runner SHA `6d6e11b`.

*Line B · awaiting dual · Ban self-nail · Ban open DELETE*
