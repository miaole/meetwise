# Harness — commerce-reconcile raw `INSERT` / missing `interviewId` latent-risk knife

**Status**: **`post_prove_dual_pass`**
**Date**: 2026-09-17 (~01:00 PT)
**Scope**: post-prove honesty for the B-side seed in `apps/worker/test/commerce-reconcile.proof.ts`, aligned to real createJob → rule-classify → invite → start → reserve(real interviewId).
**Experts**: `mw-e2e-ha` + `mw-rag-route` · independent post-prove PASS · **Ban self-approve of other knives**
**releaseEvidence=false** · **EXIT=0 ≠ suite green ≠ R5 ≠ G6 ≠ HA** · **Ban forge**

## 1. Post-prove dual receipt (independent experts)

Both independent post-prove expert reviews passed for the same claimed tip:

- `reviews/2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md` — `mw-e2e-ha` · independent `pnpm commerce-reconcile:prove` → **EXIT=0**
- `reviews/2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md` — `mw-rag-route` · independent `pnpm commerce-reconcile:prove` → **EXIT=0** · RAG orthogonal

Both reviews verify full HEAD **`6cb6f888a6830d5058af9cd2ab121b9a1fe2b05c`** (short **`6cb6f88`**) on `feat/mysql-schema-skeleton`.

| Item | Receipt |
|---|---|
| Pre-exec dual | `reviews/2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` + `…-mw-rag-route.md` → **pass** (docs gate) |
| Implement + prove | B-side seed fix executed; `pnpm commerce-reconcile:prove` → **EXIT=0** |
| Post-prove dual | `mw-e2e-ha` + `mw-rag-route` independently pass; each re-ran prove → **EXIT=0** |
| Result | **`post_prove_dual_pass`** for this knife only; no self-approve of other knives |

## 2. Root cause / fix (same class as adaptive-life B)

Raw `job_posting` INSERT skipped semantic revision / classify → `startApplicationInterview` returned `interview_ineligible_route` without `interviewId` → `reserveEntitlement(undefined)` hit `idempotency_key` NOT NULL (or `idempotency_key_required` guard). Honest minimal fix: real R2 prerequisite path; **no** forged `route_decided` / fabricated interview ID. `packages/db` empty-key guard from adaptive-life remains; production routing/qbank/FUNNEL untouched (RAG orthogonal).

## 3. Acceptance

| ID | Criterion | Status |
|---|---|---|
| M1 | Raw INSERT path removed from B-side seed | **met (code)** |
| M2 | Missing `interviewId` fail-closed (assert before reserve) | **met (code)** |
| M3 | Real classify/start + non-empty `interviewId` | **met (code + EXIT=0)** |
| M4 | Ban forge | **met** |
| M5 | Experts independent; no self-approve | **met (dual PASS)** |
| M6 | Prove run; `releaseEvidence=false` | **`post_prove_dual_pass` · EXIT=0** |

## 4. Frozen command (executed)

| CMD | Status |
|---|---|
| `pnpm commerce-reconcile:prove` (= isolated `pnpm -C apps/worker prove:commerce-reconcile`) | **EXIT=0** · implementer run ~00:57 PT; expert reruns ~00:59 PT |
| Post-prove expert pair | **PASS** · both independent reruns **EXIT=0** · HEAD `6cb6f88` |

## 5. Hard pins / non-claims

- **Ban forge** · **Ban self-approve of other knives**
- **releaseEvidence=false** · **EXIT=0 ≠ suite green ≠ R5 ≠ G6 ≠ HA**
- No R5/G6/release or production claims; RAG orthogonal (no production routing/qbank/FUNNEL edits)
- No `.env*` / secrets read or committed; test-only `RAG_JOB_ROUTE_INPUT_HASH_KEY` literal (non-production)

## 6. Anchors

- Source: `apps/worker/test/commerce-reconcile.proof.ts` §⑦
- Precedent: `harness/adaptive-life-idempotency-ci-fix.md` / commit `21672ab`
- Post-prove receipts: `reviews/2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md` + `…-mw-rag-route.md` (both independent PASS)

*Harness · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~01:00 PT · post_prove_dual_pass · independent dual PASS · EXIT=0 · releaseEvidence=false · ≠ suite/R5/G6/HA · Ban forge · Ban self-approve of other knives*
