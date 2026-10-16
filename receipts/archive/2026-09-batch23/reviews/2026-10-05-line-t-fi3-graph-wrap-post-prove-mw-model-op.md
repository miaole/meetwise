# POST-PROVE review — Line T FI-3 graph-wrap (Candidate A) · mw-model-op

**Reviewer**: `mw-model-op` (MODEL-OP: model dispatch / budget / catalog-invoke / cost SLO / model-invocation + usage ledgers)
**Date**: 2026-10-05 Asia/Shanghai (UTC+8)
**Kind**: POST-PROVE · independent · Ban self-approve · Ban nail · alone ≠ dual
**Tip / receipt under review**: `d9ddb13fa9cc1e505e04d97cde9ad6620dc49b58`
**Product code SHA (feat)**: `0a3c8a8ad16667bd6b140cbb6b02f04d1ce20bf2`
**Prove-tool SHA (FI-3 assertions)**: `b80bf92d4b3dc901a63bdcb585df47c5e7a285bb` (rebased form of implementer `ced3691fb7b269c6b567f9af4510513cb8486c6e`)
**Branch**: `feat/mysql-schema-skeleton`
**Worktree**: `/workspace/meetwise-mwmodelop-lineT-fi3` @ `d9ddb13` (detached → receipt commit)

## What these names are (one line each)

- **FI-3**: GAP-UC004-FI3-GRAPH-WIRING — wire `AiGraphRun(career-path)` so the FAULT prove can observe active→failed (serves gap `GAP-UC004-FAIL-A3` / case `NHP-004-FAULT-01` / row `UC-E2E-004` FAULT; row stays gap).
- **Candidate A**: thin graph-wrap of pure `deriveCareerPath` (single-node LangGraph in `packages/ai-graphs`; zero model SDK) + real create/reuse→succeeded|failed state machine in `generateCareerPath`.
- **A3**: `GAP-UC004-FAIL-A3` — FAULT evidence close for UC-E2E-004; closes only after prove EXIT0 + post-prove dual (mw-e2e-ha + mw-model-op) + coordinator nail. **EXIT0 ≠ A3 closed.**

## SHA relation (verified, not assumed)

| Check | Result |
|-------|--------|
| `git rev-parse 0a3c8a8^{commit}` | `0a3c8a8ad16667bd6b140cbb6b02f04d1ce20bf2` |
| `git diff --stat 0a3c8a8 d9ddb13 -- ':!ai-docs'` | only `apps/api/test/uc-e2e-004-career-path-fault.proof.ts` (+106/−30) — prove tool layer |
| Product blobs identical 0a3c8a8 ↔ d9ddb13 | `career-path.ts`, `ai-graphs/index.ts`, `career-path.proof.ts` (unit), `interview.service.ts`, `apps/api/package.json`, `pnpm-lock.yaml` — same blob SHAs |
| Implementer claimed prove @ `ced3691` | product tree ≡ chain `b80bf92` except Line U docs-only `g7-trio-fresh/*` (out of scope for this review; not touched) |

**Re-run SHA actually used**: `d9ddb13fa9cc1e505e04d97cde9ad6620dc49b58` (includes prove-tool layer; product code ≡ `0a3c8a8`). Offline: all `*_API_KEY` unset before proves; child env deletes `MODEL_API_KEY`/`MODEL_BASE_URL`.

## CMD / EXIT table (this reviewer's re-run)

| # | CMD | SHA | EXIT | Notes |
|---|-----|-----|------|-------|
| 1 | `pnpm -C packages/ai-graphs exec tsx test/career-path.proof.ts` | d9ddb13 (product ≡ 0a3c8a8) | **0** | 33/33 PASS · no DB · zero model |
| 2 | `pnpm uc004:career-path-fault:prove` (via `sg docker`) | d9ddb13 | **0** | attempts=4 all 0 · one-shot · CST 2026-10-05 23:23:51→23:24:29 · isolated PG migrations=135 · ZERO-TRACE start=0 end=0 delta=0 |
| 3 | `node scripts/eval-harness-matrix-cite.proof.mjs` | d9ddb13 | **0** | matrix still lists UC-E2E-004 gap |
| 4 | scratch `/tmp/fi3-fetch-block-scratch.mjs` (not committed) | d9ddb13 | **0** | patched `globalThis.fetch` → `fetchCalls=0` on success+fail graph paths |

ATTEMPTS_LEDGER (re-run): `ATTEMPT-0-CONTROL:0 ATTEMPT-1-FI2-STATEMENT-TIMEOUT:0 ATTEMPT-2-FI1-CONNECTION-BREAK:0 ATTEMPT-3-FI3-GRAPH-FAIL:0` · `retry_to_green=false`

## Rulings 1–7 (+ addendum a/b)

### 1. Zero model / Ban live — PASS
Structural: `packages/ai-graphs/src/career-path.ts` imports only `@langchain/langgraph` + type-only `@meetwise/domain`; package deps = domain + langgraph only (no `@meetwise/ai-runtime`). Dep = injected pure `deriveCareerPath`. Runtime: API child deletes `MODEL_API_KEY`/`MODEL_BASE_URL` (`uc-e2e-004-career-path-fault.proof.ts:174`); reviewer unset all `*_API_KEY` before re-run. Unit purity asserts + scratch fetch interceptor recorded `fetchCalls=0`. Not merely asserted — fail-closed by import graph + key strip + zero outbound in graph file.

### 2. Zero `ai_invocation_trace` — PASS (with vacuity note)
Asserted via real isolated PG `SELECT count(*) FROM ai_invocation_trace` (proof.ts:110) before/after FI-3 and process start/end — observed 0/0/delta=0 on re-run. **Vacuity**: this career-path path never calls `invoke` (sole INSERT sites `packages/ai-runtime/src/invoke.ts:357/:363`); so "zero rows" alone does not prove "would have written if a model ran." Combined with ruling 1 (path cannot reach invoke / fetch), zero is meaningful as "no accidental invoke during prove," not as a substitute for a live-call counter on a model path. Non-gating evidence field — correct.

### 3. Ledger boundary — PASS
FI-3 writes/reads **`ai_graph_run` (career-path fence/state)** and observes **entitlement spend** net-0 (`entitlement_bucket` / consumption / orders). Does **not** write/read G7 NDJSON run-cost ledger (`G7_RUN_COST_LEDGER_PATH` / `readG7SharedLedger` / `reserveG7CallOnSharedLedger`) — zero refs in touched product paths. Does **not** write `ai_invocation_trace` / `model_invocation` / calibrator tables. Receipt §7 correctly separates fence audit (`ai_graph_run` version increments ≠ billing counters) from spend snapshot net-0; career-path D1 non-billable. **No claim** that usageCalibrationReconciler / model-invocation-reconcile is production-cut or that MODEL-OP-00 closed. Coordinator Ledger-1 (G7) vs Ledger-2 (PG invocation) both untouched by this knife.

### 4. Thread-scoped seam — PASS (non-blocker: no concurrent race test)
`selectCareerPathDerive(threadId, failThreadId, derive)` (`career-path.ts:48-51`) is a pure per-call function: exact string match only; otherwise returns **same reference** as input derive. Env target read once per request via `careerPathFailSeamThreadId()` (`interview.service.ts:37-39`) — not a mutable module-level Map that could leak across threads. Unit: SEAM-OTHER-THREAD / PREFIX / SUBSTRING-NO-MATCH. E2E: same API child with CONTROL succeeded + FI-3 failed (sequential). **Non-blocker gap**: no test that fires two concurrent HTTP requests and asserts isolation under race; code shape is still per-invocation keyed by `thread_id`/interview id, not a global mutable seam table.

### 4a. Seam OFF by default — PASS
Evidence:
- `career-path.ts:49-50`: `failThreadId` unset/null/''/whitespace → return original `derive` (same ref).
- `interview.service.ts:37-39`: `NODE_ENV === 'production'` → **always `undefined`** (seam hard-off); else reads `MEETWISE_CAREER_PATH_FAIL_THREAD_ID` (unset → undefined → off).
- Unit SEAM-UNSET/NULL/EMPTY/BLANK-SAME-REF + ZERO-DELTA-OUTPUT-EQUALS-DOMAIN.
Production callers: default path = unmodified `deriveCareerPath` via graph wrap; fail-only when env explicitly set to exact interview id in non-production. Docs authorize this default-off fail-only seam (harness iron rule 6 / C-MO-2).

### 4b. Lockfile / workspace link — PASS (in scope)
`git diff 0a3c8a8^..d9ddb13 -- pnpm-lock.yaml pnpm-workspace.yaml '**/package.json'`:
- `apps/api/package.json`: add `"@meetwise/ai-graphs": "workspace:*"` only.
- `pnpm-lock.yaml`: +3 lines under `importers.apps/api.dependencies` — `'@meetwise/ai-graphs': specifier workspace:* / version link:../../packages/ai-graphs`.
- `pnpm-workspace.yaml`: **unchanged**.
No package named Attention (or similar); no new third-party dep; no worker link; no link outside `/workspace/meetwise`; no outbound main-chain package churn. Workspace link is required for `import '@meetwise/ai-graphs'` under pnpm isolation — authorized by harness touch-surface + receipt disclosure.

### 5. EXIT 0 ≠ A3 closed — PASS
Grepped receipt, harness, slice, REQUEST, and commit messages (`0a3c8a8` / `b80bf92` / `d9ddb13`): repeated explicit **EXIT0 ≠ A3 closed** / row stays gap / awaiting post-prove dual + nail. Prove stdout prints the same note. No wording that A3 / G7 / R1 / MODEL-OP-00 is closed or green from this EXIT0 alone. Assertion PASS lines are per-check labels, not A3/G7 close claims.

### 6. Scope / outbound main chain — PASS
FI-3 product+tool touch set: `packages/ai-graphs/src/career-path.ts` (new), `packages/ai-graphs/src/index.ts` (+2), `apps/api/src/modules/interview/interview.service.ts` (`generateCareerPath` + seam helper only), `packages/ai-graphs/test/career-path.proof.ts` (new), `apps/api/test/uc-e2e-004-career-path-fault.proof.ts`, `apps/api/package.json`, `pnpm-lock.yaml` (+3). **Zero diff** on `packages/ai-runtime/**`, model-client/invoke/G7 guard, `apps/worker/**`, embedder/reranker/voice, `packages/domain/src/career.ts`, `packages/db/src/principal.ts`, migrations. Pre-existing `ai-runtime` import in interview.service (voice types) unchanged by this knife.

### 7. Redaction — PASS
No API keys, key fingerprints, or PII in implementer receipt or this review. Secrets unset for re-run; never read `.env*`.

## Blockers
**None.**

## Non-blockers
1. No concurrent dual-thread HTTP isolation race test for the seam (code is still per-call exact-match; sequential CONTROL/FI-3 evidence exists).
2. `ai_invocation_trace` zero-count is partially vacuous for this path (never writes traces) — mitigated by structural zero-model (ruling 1); kept as non-gating evidence correctly.
3. Static mark-red `pnpm uc004:career-path:prove` now EXIT=1 by design (harness said not this knife) — out of scope; disclosed by implementer.

## Pins (restate)
haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained**

## Explicit non-claims
- ≠ A3 closed · ≠ G7 green · ≠ MODEL-OP-00 closed · ≠ R1 closed · ≠ HA · ≠ covered · ≠ production reconciler cut · ≠ complete career-path graphization (E2E-MAIN/GRAPH/GROWTH/UNCERTAINTY stay open)

## Line U (separate fact only; files not touched)
If Line U is mentioned elsewhere: FreeTierOnly 403 observed at `3424dc1`; fix round that removed it is `82981ff`. Never write `quota-403=82981ff`. This review did not open or edit `ai-docs/delivery/receipts/g7-trio-fresh/`.

## Verdict rationale
Claimed prove re-ran EXIT 0 at tip `d9ddb13` whose product tree matches coordinator code SHA `0a3c8a8` on all FI-3 product paths; zero-model enforced (structure + key strip + fetch scratch); ledger boundary clean; seam default-off and thread-exact; no A3/green over-claim; lockfile = authorized workspace link only; no outbound edits; no leaks. EXIT 0 is valid FI-3 evidence while A3 remains open pending peer post-prove + nail.

Verdict: PASS
