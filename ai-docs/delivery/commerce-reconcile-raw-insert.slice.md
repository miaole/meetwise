# Slice — Knife **commerce-reconcile raw INSERT / missing `interviewId`**

**Status**: **`REQUEST-ready / not_run:pre_dual`**
**Date**: 2026-09-17 (~00:44 PT)
**Authority**: docs-only next knife after adaptive-life `post_prove_dual_pass`; latent B-side seed risk identified in `apps/worker/test/commerce-reconcile.proof.ts` · **zero coding / zero prove this prep**
**Experts**: `mw-e2e-ha` + `mw-rag-route` · REQUEST pair drafted · **await pre-exec dual**
**releaseEvidence=false** · **≠ suite green** · **≠ HA** · **Ban forge** · **Ban self-approve**

## Products

| Role | Path |
|---|---|
| This slice | `ai-docs/delivery/commerce-reconcile-raw-insert.slice.md` |
| Harness | `ai-docs/delivery/harness/commerce-reconcile-raw-insert.md` |
| Eval | `ai-docs/delivery/eval/commerce-reconcile-raw-insert.eval.md` |
| Source | `apps/worker/test/commerce-reconcile.proof.ts:150-154` |
| Planned prove | `pnpm -C apps/worker prove:commerce-reconcile` · **`not_run:pre_dual`** |
| REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` |
| REQUEST · rag-route | `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md` |
| Precedent | `harness/adaptive-life-idempotency-ci-fix.md` |

## One-line scope

Review the latent path where a raw `job_posting` INSERT bypasses semantic revision/classification, `startApplicationInterview` may return no `interviewId`, and reserve is called with that missing identifier. **Docs only**: do not implement the fix, forge route state, or claim the proof green.

## Hard pins

- **REQUEST-ready / not_run:pre_dual** · no coding · no prove · no self-approve.
- **Ban forge**: real route classification and a real non-empty `interviewId` are required before reservation; no fabricated rows or identifiers.
- `releaseEvidence=false` · **≠ suite green** · **≠ HA** · no R5/G6/release claims.
- A future proof EXIT=0, if independently established, would not imply suite green or HA.

## CMD (frozen · not run)

| CMD | Status |
|---|---|
| `pnpm -C apps/worker prove:commerce-reconcile` | **`not_run:pre_dual`** |

*Slice · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · zero coding · await pre-exec dual*
