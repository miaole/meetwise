# REQUEST — Knife **commerce-reconcile raw INSERT / missing `interviewId`**（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；not yet dual-sent）
**Expert**: `mw-rag-route`
**Date**: 2026-09-17 (~00:44 PT)
**releaseEvidence=false** · **≠ suite green** · **≠ HA** · **Ban forge** · **Ban self-approve**
**Pair**: `REQUEST-2026-09-17-commerce-reconcile-raw-insert-mw-e2e-ha.md`

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

## Stance (rag-route)

This REQUEST checks route-prerequisite honesty at the proof boundary, not production RAG or a code fix:

1. Raw `job_posting` INSERT may bypass semantic revision and route classification, so `startApplicationInterview` can return `interview_ineligible_route` without an `interviewId`.
2. The future seed must use real semantic revision + rule classification → invite → start and consume the returned ID.
3. **Ban forge**: no direct `route_decided`/`rule_decided` insertion, fabricated decision, or fabricated interview ID.
4. This prep is docs-only and **`not_run:pre_dual`**; no prove, coding, suite, or HA claim is authorized.
5. Keep **releaseEvidence=false**, **≠ suite green**, and **≠ HA**; no R5/G6/release inference.

## Please answer

1. Does the raw INSERT bypass the route prerequisite and create a missing-`interviewId` path before commerce reservation?
2. Is real rule classification before start required, with no forged `route_decided`/`rule_decided` row?
3. Should reservation be gated on a real non-empty `interviewId` returned by start?
4. Do you agree the exact planned command is `pnpm -C apps/worker prove:commerce-reconcile`, but it remains **not run** pending dual review and authorization?
5. Do you retain **releaseEvidence=false**, **≠ suite green**, **≠ HA**, **Ban forge**, and **Ban self-approve**?

Please write the independent conclusion to `reviews/` (e.g. `2026-09-17-commerce-reconcile-raw-insert-mw-rag-route.md`). **Do not** write a pass as implementer.

## Non-claims

- Not pass; not RAG-FUNNEL/R4/product close; not a fix; not coding-authorized.
- No current proof EXIT=0 claim; no suite or HA claim.
- No forged route state or interview ID.
- No secrets or `.env*` access; no invented key.

*REQUEST · mw-rag-route · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~00:44 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠ suite green · ≠ HA · Ban forge · zero coding · awaiting dual*
