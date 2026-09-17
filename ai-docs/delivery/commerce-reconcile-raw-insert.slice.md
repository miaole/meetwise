# Slice — Knife **commerce-reconcile raw INSERT / missing `interviewId`**

**Status**: **`executed:awaiting_post_prove_dual`**
**Date**: 2026-09-17 (~00:57 PT)
**Authority**: meetwise standing · pre-exec dual PASS + implement+prove authorize · B-side seed fix in `apps/worker/test/commerce-reconcile.proof.ts`
**Experts**: `mw-e2e-ha` + `mw-rag-route` · post-prove REQUEST pair drafted · **Ban self-approve**
**releaseEvidence=false** · **EXIT=0 ≠ suite green ≠ R5/G6/HA** · **Ban forge**

## Products

| Role | Path |
|---|---|
| This slice | `ai-docs/delivery/commerce-reconcile-raw-insert.slice.md` |
| Harness | `ai-docs/delivery/harness/commerce-reconcile-raw-insert.md` |
| Eval | `ai-docs/delivery/eval/commerce-reconcile-raw-insert.eval.md` |
| Source | `apps/worker/test/commerce-reconcile.proof.ts` §⑦ |
| Prove | `pnpm commerce-reconcile:prove` · **EXIT=0** |
| Pre-exec reviews | `reviews/2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md` · `…-mw-rag-route.md` |
| Post-prove REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-e2e-ha.md` |
| Post-prove REQUEST · rag-route | `reviews/REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md` |
| Precedent | `harness/adaptive-life-idempotency-ci-fix.md` |

## One-line scope

Replace raw `job_posting` INSERT B-seed with real createJob → rule-classify → invite → start → reserve(real interviewId). Prove EXIT=0; leave post-prove dual open (no self-approve).

## Hard pins

- **executed:awaiting_post_prove_dual** · Ban self-approve `post_prove_dual_pass`
- **Ban forge**: real route classification + real non-empty `interviewId` before reserve
- `releaseEvidence=false` · **EXIT=0 ≠ suite green ≠ R5/G6/HA**
- RAG orthogonal — do not touch production routing / qbank / FUNNEL

## CMD (executed)

| CMD | Status |
|---|---|
| `pnpm commerce-reconcile:prove` | **EXIT=0** |

*Slice · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:57 PT · executed:awaiting_post_prove_dual · EXIT=0 · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · Ban self-approve*
