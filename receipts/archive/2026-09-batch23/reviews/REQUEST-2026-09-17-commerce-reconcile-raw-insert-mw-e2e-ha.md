# REQUEST — Knife **commerce-reconcile raw INSERT / missing `interviewId`**（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；not yet dual-sent）
**Expert**: `mw-e2e-ha`
**Date**: 2026-09-17 (~00:44 PT)
**releaseEvidence=false** · **≠ suite green** · **≠ HA** · **Ban forge** · **Ban self-approve**
**Pair**: `REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md`

---

## Contra

| File | Role |
|---|---|
| `harness/commerce-reconcile-raw-insert.md` | Canonical docs-only harness and latent-risk contract |
| `commerce-reconcile-raw-insert.slice.md` | Slice index |
| `eval/commerce-reconcile-raw-insert.eval.md` | Pre-exec eval cases |
| `apps/worker/test/commerce-reconcile.proof.ts:150-154` | Raw job seed → invite/start → reserve path under review |
| `apps/worker/test/commerce-reconcile.proof.ts:5` | Planned command: `pnpm -C apps/worker prove:commerce-reconcile` |
| Adaptive precedent | `harness/adaptive-life-idempotency-ci-fix.md` |

## Stance (E2E-HA)

This REQUEST asks for independent review of a latent proof-seed risk, not a fix:

1. The raw `job_posting` INSERT can skip semantic revision/classification; start may return no `interviewId`.
2. A reservation must never proceed with a missing identifier; future implementation must assert a real returned ID.
3. **Ban forge**: no fabricated route decision, semantic revision, or interview ID.
4. This turn is docs-only: no coding, no prove, no suite run, no HA claim, no self-approve.
5. Keep **releaseEvidence=false**, **≠ suite green**, and **≠ HA**.

## Please answer

1. Does `apps/worker/test/commerce-reconcile.proof.ts:150-154` expose the raw-INSERT / missing-`interviewId` latent path?
2. Is real semantic revision + rule classification + invite/start the correct future prerequisite, rather than direct decision-row insertion?
3. Should `reserveEntitlement` be reached only after a non-empty real `interviewId` assertion?
4. Do you agree this REQUEST is **`REQUEST-ready / not_run:pre_dual`**, docs only, with no coding/prove authorization?
5. Do you retain **releaseEvidence=false**, **≠ suite green**, **≠ HA**, **Ban forge**, and **Ban self-approve**?

Please write the independent conclusion to `reviews/` (e.g. `2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md`). **Do not** write a pass as implementer.

## Non-claims

- Not pass; not a fix; not coding-authorized.
- No current proof EXIT=0 claim; no suite or HA claim.
- No forged route state or interview ID.
- No secrets or `.env*` access; no invented key.

*REQUEST · mw-e2e-ha · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · zero coding · awaiting dual*
