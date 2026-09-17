# Eval — Knife **commerce-reconcile raw INSERT / missing `interviewId`**（**`executed:awaiting_post_prove_dual`**）

**Date**: 2026-09-17 (~00:57 PT)
**run-status**: **`executed:awaiting_post_prove_dual`** · `pnpm commerce-reconcile:prove` → **EXIT=0** · await post-prove dual
**releaseEvidence=false** · **≠ suite green** · **≠ HA** · **Ban forge** · **Ban self-approve**
**Harness**: `ai-docs/delivery/harness/commerce-reconcile-raw-insert.md`
**Slice**: `ai-docs/delivery/commerce-reconcile-raw-insert.slice.md`

## 1. Purpose

Evaluate the B-side seed fix in `apps/worker/test/commerce-reconcile.proof.ts`: real createJob → rule-classify → invite → start → reserve(real interviewId). Distinguish honest R2 prerequisite from forge; do not elevate EXIT=0 to suite/HA.

## 2. Eval cases

| ID | Eval point | Expected ruling | Status |
|---|---|---|---|
| E1 | Raw `job_posting` INSERT removed from B seed | Seed uses `createJob` (semantic revision) | **PASS (code)** |
| E2 | Missing-route start | Assert non-empty `interviewId`; fail-closed if absent | **PASS (code)** |
| E3 | Seed prerequisite | createJob → rule-classify → invite → start | **PASS (EXIT=0)** |
| E4 | Reservation input | `reserveEntitlement` only after real interviewId | **PASS (EXIT=0)** |
| E5 | Anti-forge | No direct `route_decided`/`rule_decided` INSERT; modelClassify throws | **PASS (code)** |
| E6 | Evidence level | EXIT=0 ≠ suite/HA/R5/G6; releaseEvidence=false | **met (docs)** |

## 3. Frozen execution record

| CMD / action | Expected | Actual |
|---|---|---|
| B-side seed rewrite | createJob + classifyJobRoute rule path | **done** |
| `pnpm commerce-reconcile:prove` | EXIT=0 | **EXIT=0** (~00:57 PT) |
| Expert pair (post-prove) | independent re-run + review | **REQUEST drafted; awaiting_post_prove_dual** |

## 4. Expert questions (post-prove)

1. Independently re-run `pnpm commerce-reconcile:prove` — CMD+EXIT?
2. Is B-side seed honest R2 (createJob → rule-classify → invite → start) without forge?
3. Does EXIT=0 remain **≠ suite green / ≠ R5 / ≠ G6 / ≠ HA / releaseEvidence=false**?
4. Is `RAG_JOB_ROUTE_INPUT_HASH_KEY` test-only non-production (Ban secrets)?

## 5. Fake-green checklist

- [x] Did not forge route state or interviewId
- [x] Did not claim suite green / HA / R5 / G6 from this EXIT=0
- [x] Kept `releaseEvidence=false`; no secrets / `.env*`
- [x] Implementer did not write expert pass; status = awaiting_post_prove_dual
- [x] RAG / production routing / qbank / FUNNEL untouched

*Eval · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:57 PT · executed:awaiting_post_prove_dual · EXIT=0 · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · await post-prove dual*
