# Harness — commerce-reconcile raw `INSERT` / missing `interviewId` latent-risk knife

**Status**: **`executed:awaiting_post_prove_dual`**
**Date**: 2026-09-17 (~00:57 PT)
**Scope**: B-side seed in `apps/worker/test/commerce-reconcile.proof.ts` aligned to real createJob → rule-classify → invite → start → reserve(real interviewId).
**Experts**: `mw-e2e-ha` + `mw-rag-route` · post-prove REQUEST pair drafted · **Ban self-approve**
**releaseEvidence=false** · **EXIT=0 ≠ suite green ≠ R5/G6/HA** · **Ban forge**

## 1. Close-so-far receipt (implementer; not expert pass)

| Item | Receipt |
|---|---|
| Pre-exec dual | `reviews/2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` + `…-mw-rag-route.md` → **pass** (docs gate) |
| Authorize | meetwise standing · implement + prove |
| Fix | B-side seed: `createJob` → `classifyJobRoute` (rule) → invite → start → assert non-empty `interviewId` → `reserveEntitlement` |
| CMD | `pnpm commerce-reconcile:prove` → **EXIT=0** |
| Post-prove REQUEST | drafted · status remains **awaiting_post_prove_dual** (no self-approve) |

## 2. Root cause / fix (same class as adaptive-life B)

Raw `job_posting` INSERT skipped semantic revision / classify → `startApplicationInterview` returned `interview_ineligible_route` without `interviewId` → `reserveEntitlement(undefined)` hit `idempotency_key` NOT NULL (or `idempotency_key_required` guard). Honest minimal fix: real R2 prerequisite path; **no** forged `route_decided` / fabricated interview ID. `packages/db` empty-key guard from adaptive-life remains; production routing/qbank/FUNNEL untouched (RAG orthogonal).

## 3. Acceptance

| ID | Criterion | Status |
|---|---|---|
| M1 | Raw INSERT path removed from B-side seed | **met (code)** |
| M2 | Missing `interviewId` fail-closed (assert before reserve) | **met (code)** |
| M3 | Real classify/start + non-empty `interviewId` | **met (code + EXIT=0)** |
| M4 | Ban forge | **met** |
| M5 | Experts independent; no self-approve | **REQUEST drafted** |
| M6 | Prove run; `releaseEvidence=false` | **`executed:awaiting_post_prove_dual` · EXIT=0** |

## 4. Frozen command (executed)

| CMD | Status |
|---|---|
| `pnpm commerce-reconcile:prove` (= isolated `pnpm -C apps/worker prove:commerce-reconcile`) | **EXIT=0** · 2026-09-17 ~00:57 PT |

## 5. Hard pins / non-claims

- **Ban forge** · **Ban self-approve post_prove_dual_pass**
- **releaseEvidence=false** · **EXIT=0 ≠ suite green ≠ R5/G6/HA**
- No R5/G6/release or production claims; RAG orthogonal (no production routing/qbank/FUNNEL edits)
- No `.env*` / secrets read or committed; test-only `RAG_JOB_ROUTE_INPUT_HASH_KEY` literal (non-production)

## 6. Anchors

- Source: `apps/worker/test/commerce-reconcile.proof.ts` §⑦
- Precedent: `harness/adaptive-life-idempotency-ci-fix.md` / commit `21672ab`
- Post-prove REQUEST: `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md` + `…-mw-rag-route.md`

*Harness · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:57 PT · executed:awaiting_post_prove_dual · EXIT=0 · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · Ban self-approve*
