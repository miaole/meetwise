# Slice — Knife **commerce-reconcile raw INSERT / missing `interviewId`**

**Status**: **`post_prove_dual_pass`**
**Date**: 2026-09-17 (~01:00 PT)
**Authority**: meetwise standing · pre-exec dual PASS + implement+prove authorize · post-prove dual PASS · B-side seed fix in `apps/worker/test/commerce-reconcile.proof.ts` · HEAD `6cb6f88`
**Experts**: `mw-e2e-ha` + `mw-rag-route` · independent post-prove PASS · expert reruns EXIT=0 · **Ban self-approve of other knives**
**releaseEvidence=false** · **EXIT=0 ≠ suite green ≠ R5 ≠ G6 ≠ HA** · **Ban forge**

## Products

| Role | Path |
|---|---|
| This slice | `ai-docs/delivery/commerce-reconcile-raw-insert.slice.md` |
| Harness | `ai-docs/delivery/harness/commerce-reconcile-raw-insert.md` |
| Eval | `ai-docs/delivery/eval/commerce-reconcile-raw-insert.eval.md` |
| Source | `apps/worker/test/commerce-reconcile.proof.ts` §⑦ |
| Prove | `pnpm commerce-reconcile:prove` · **EXIT=0** |
| Pre-exec reviews | `reviews/2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` · `…-mw-rag-route.md` |
| Post-prove review · e2e-ha | `reviews/2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md` · **pass** |
| Post-prove review · rag-route | `reviews/2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md` · **pass** |
| Precedent | `harness/adaptive-life-idempotency-ci-fix.md` |

## One-line scope

Close the post-prove dual for the B-seed fix: real createJob → rule-classify → invite → start → reserve(real interviewId), with independent expert reruns EXIT=0 at HEAD `6cb6f88`. This closes only this honesty knife.

## Hard pins

- **post_prove_dual_pass** · independent dual PASS · Ban self-approve of other knives
- **Ban forge**: real route classification + real non-empty `interviewId` before reserve
- `releaseEvidence=false` · **EXIT=0 ≠ suite green ≠ R5 ≠ G6 ≠ HA**
- RAG orthogonal — do not touch production routing / qbank / FUNNEL

## CMD (executed)

| CMD | Status |
|---|---|
| `pnpm commerce-reconcile:prove` | **EXIT=0** · implementer + independent expert reruns |
|| Post-prove dual | **PASS** · both experts independently EXIT=0 · HEAD `6cb6f88` |

*Slice · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~01:00 PT · post_prove_dual_pass · independent dual PASS · EXIT=0 · releaseEvidence=false · ≠ suite/R5/G6/HA · Ban forge · Ban self-approve of other knives*
