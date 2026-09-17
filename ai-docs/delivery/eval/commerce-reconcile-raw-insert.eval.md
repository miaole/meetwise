# Eval — Knife **commerce-reconcile raw INSERT / missing `interviewId`**（**`REQUEST-ready / not_run:pre_dual`**）

**Date**: 2026-09-17 (~00:44 PT)
**run-status**: **`REQUEST-ready / not_run:pre_dual`** · prove **not run** · await pre-exec dual
**releaseEvidence=false** · **≠ suite green** · **≠ HA** · **Ban forge** · **Ban self-approve**
**Harness**: `ai-docs/delivery/harness/commerce-reconcile-raw-insert.md`
**Slice**: `ai-docs/delivery/commerce-reconcile-raw-insert.slice.md`

## 1. Purpose

Pre-exec expert evaluation of the latent B-side seed risk in `apps/worker/test/commerce-reconcile.proof.ts:150-154`. The eval must distinguish a raw fixture insert from the real route prerequisite and must not turn a missing identifier into a nullable or fabricated success.

## 2. Eval cases

| ID | Eval point | Expected ruling | Status |
|---|---|---|---|
| E1 | Raw `job_posting` INSERT precedes invite/start | It is a latent bypass of semantic revision/classification and needs explicit review | **not run** |
| E2 | Missing-route start result | `interview_ineligible_route` / absent `interviewId` is a fail-closed path, not a valid reservation input | **not run** |
| E3 | Future seed prerequisite | Use real create/semantic-revision/rule-classify → invite → start flow | **not run** |
| E4 | Reservation input | Call `reserveEntitlement` only after asserting a genuine non-empty `interviewId` | **not run** |
| E5 | Anti-forge | No direct `route_decided`/`rule_decided` INSERT, fabricated decision, or fabricated interview ID | **not run** |
| E6 | Evidence level | No prove, suite, HA, R5, G6, or release claim from this docs prep | **met (docs)** |

## 3. Frozen execution record

| CMD / action | Expected | Actual |
|---|---|---|
| Read source anchors `:150-154` | identify raw seed and reserve path | **documented; no code changed** |
| `pnpm -C apps/worker prove:commerce-reconcile` | defer until dual + authorization | **`not_run:pre_dual`** |
| Expert pair | independent pre-exec review | **REQUEST drafted; await dual** |

## 4. Expert questions

1. Does the raw `job_posting` INSERT bypass the route prerequisite and expose a missing-`interviewId` path before reservation?
2. Is the correct future contract real semantic revision + rule classification + start, with no forged `route_decided`/`rule_decided` state?
3. Should reservation be forbidden until a non-empty returned `interviewId` is asserted?
4. Do the reviewers agree this is a docs-only REQUEST, with no coding/prove authorization and no self-approve?
5. Do the reviewers retain **releaseEvidence=false**, **≠ suite green**, and **≠ HA**?

## 5. Fake-green checklist

- [ ] Did not call the raw INSERT path fixed or safe.
- [ ] Did not claim current `commerce-reconcile` proof EXIT=0.
- [ ] Did not forge route state, semantic revision, or `interviewId`.
- [ ] Did not treat a future local green as suite green or HA.
- [ ] Kept `releaseEvidence=false`; no secrets, `.env*`, or invented key.
- [ ] Implementer did not write an expert pass; pair remains independent.

*Eval · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · await dual*
