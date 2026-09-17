# Harness — commerce-reconcile raw `INSERT` / missing `interviewId` latent-risk knife

**Status**: **`REQUEST-ready / not_run:pre_dual`**
**Date**: 2026-09-17 (~00:44 PT)
**Scope**: docs-only pre-exec review of the raw job seed and missing-`interviewId` path in `apps/worker/test/commerce-reconcile.proof.ts`.
**Experts**: `mw-e2e-ha` + `mw-rag-route` · **zero coding / zero prove this prep**
**releaseEvidence=false** · **≠ suite green** · **≠ HA** · **Ban forge** · **Ban self-approve**

## 1. Latent-risk statement

The B-side section currently uses a raw `job_posting` `INSERT` at `apps/worker/test/commerce-reconcile.proof.ts:150`, then calls `inviteCandidate` and `startApplicationInterview` (lines 152–153). This seed can bypass the semantic-revision and route-classification precondition. On the missing-route path, start may return `interview_ineligible_route` without an `interviewId`; the following `reserveEntitlement(..., first.interviewId, ...)` (line 154) then reaches the commerce reservation path without a real interview identifier. This is the same latent shape as the adaptive-life B seed and must be reviewed before any fix is proposed.

This harness records a risk and acceptance contract only. **It does not implement the commerce-reconcile fix and does not claim the current proof is green.**

## 2. Expected future shape (not implemented here)

A future authorized implementation must make the seed follow the real prerequisite path (`createJob` → semantic revision → real rule classification → invite → start), assert a genuine `route_decided`/`rule_decided` result without forging rows, assert a non-empty returned `interviewId`, and reserve only with that real identifier. The schema and fail-closed commerce contract must not be weakened to hide a missing identifier.

## 3. Acceptance for the dual REQUEST

| ID | Criterion | Status now |
|---|---|---|
| M1 | Raw `job_posting` INSERT and subsequent `startApplicationInterview`/reserve path are named as the latent risk | **met (docs)** |
| M2 | Missing `interviewId` is treated as a fail-closed precondition failure, not as a nullable success | **met (docs)** |
| M3 | Future seed contract requires real classify/start and a real non-empty `interviewId` | **met (docs)** |
| M4 | Ban forge: no direct `route_decided` INSERT, fabricated decision, or fabricated interview ID | **met (docs)** |
| M5 | Experts are `mw-e2e-ha` + `mw-rag-route`; no self-approve | **REQUEST drafted** |
| M6 | Prove is frozen but not run; `releaseEvidence=false` | **`not_run:pre_dual`** |

## 4. Frozen command (not run)

| CMD | Status |
|---|---|
| `pnpm -C apps/worker prove:commerce-reconcile` | **`not_run:pre_dual`** · no coding authorized |

## 5. Hard pins / non-claims

- **Ban forge**: do not insert or manufacture `route_decided`, `rule_decided`, semantic revision, or `interviewId` merely to make the proof advance.
- **releaseEvidence=false** · **≠ suite green** · **≠ HA**; a future local EXIT=0 would still be only this knife's proof.
- No R5/G6/release or production claims follow from this REQUEST.
- No `.env*`, secret, credential, or live key is needed or may be read; no key may be invented.
- This prep changes docs only; it does not modify `apps/worker/test/commerce-reconcile.proof.ts` or implement a fix.

## 6. Anchors

- Source: `apps/worker/test/commerce-reconcile.proof.ts:150-154`
- Proof comment / command: `pnpm -C apps/worker prove:commerce-reconcile`
- Adaptive precedent: `harness/adaptive-life-idempotency-ci-fix.md`
- REQUEST pair: `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` and `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md`

*Harness · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · zero coding · await dual*
