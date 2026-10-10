# Eval — Knife **commerce-reconcile raw INSERT / missing `interviewId`**（**`post_prove_dual_pass`**）

**Date**: 2026-09-17 (~01:00 PT)
**run-status**: **`post_prove_dual_pass`** · `pnpm commerce-reconcile:prove` → **EXIT=0** · independent post-prove dual **PASS** · HEAD `6cb6f88`
**releaseEvidence=false** · **≠ suite green ≠ R5 ≠ G6 ≠ HA** · **Ban forge** · **Ban self-approve of other knives**
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
| `mw-e2e-ha` post-prove review | independent prove + review | **PASS** · EXIT=0 · HEAD `6cb6f88` |
| `mw-rag-route` post-prove review | independent prove + review | **PASS** · EXIT=0 · RAG orthogonal · HEAD `6cb6f88` |
| Harness/slice/eval result | post-prove dual | **`post_prove_dual_pass`** |

## 4. Expert conclusions (post-prove)

1. Independent `pnpm commerce-reconcile:prove` reruns — **EXIT=0** for both experts at HEAD `6cb6f88`.
2. B-side seed is honest R2 (createJob → rule-classify → invite → start → real non-empty `interviewId` → reserve), with **Ban forge** upheld.
3. EXIT=0 remains **≠ suite green / ≠ R5 / ≠ G6 / ≠ HA / releaseEvidence=false**; RAG-route also confirms orthogonality and no FUNNEL/R4 closure claim.
4. No `.env*` / secrets were read or committed; proof-only HMAC literal remains non-production.
5. Implementer did not self-approve; the two post-prove expert reviews are independent and both **pass**.

## 5. Fake-green checklist

- [x] Did not forge route state or interviewId
- [x] Did not claim suite green / HA / R5 / G6 from this EXIT=0
- [x] Kept `releaseEvidence=false`; no secrets / `.env*`
- [x] Implementer did not write expert pass; both post-prove expert reviews independently pass; self-approve of other knives remains banned
- [x] RAG / production routing / qbank / FUNNEL untouched

*Eval · commerce-reconcile raw INSERT / missing interviewId · 2026-09-17 ~01:00 PT · post_prove_dual_pass · independent dual PASS · EXIT=0 · releaseEvidence=false · ≠ suite/R5/G6/HA · Ban forge · Ban self-approve of other knives*
