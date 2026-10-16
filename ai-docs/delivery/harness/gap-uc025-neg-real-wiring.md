# Harness — **GAP-UC025-NEG-01 real wiring**（刀 B'' · docs-only REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban coding · Ban prove · Ban push）

**Status**: **`draft:awaiting_pre_exec_dual`** · docs spec only · this document is not coding permission, not a proof edit, and not a prove run · a later pre-exec dual PASS is still not coding permission — coding starts only on explicit coordinator authorization after the pre-exec dual · Ban self-approve
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-03（刀 B'' REQUEST issued by coordinator）
**Base / written at**: `origin/feat/mysql-schema-skeleton` **`f3cf84c`** / full `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`（B' FINAL `76d2bc3` / `76d2bc3fb5fb15b5a08aa5f769fc19cfa6a09a77` 之后 · not a prove tip）
**Knife**: **GAP-UC025-NEG-01 real wiring**（B'' — B' `76d2bc3` 只钉门锁 ≠ 接线授权；本刀申请授权真接线）
**Gap id**: **`GAP-UC025-NEG-01`**（stays **OPEN** until its own post-prove dual · B' 门锁保留）
**Row**: **`UC-E2E-025`** NEG column only · row stays **gap**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual pending · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs spec only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · Ban widen · Ban push

## One-line

B' `76d2bc3` nailed the docs lock (`pnpm uc025:nhp-neg:prove` STAYS EXIT 1 until real wiring) but did **not** wire the product and did **not** authorize wiring. This REQUEST asks for the real wiring knife: interview begin **真接入** quiz artifact（`acceptsQuiz` 真路径）and stale quiz **真拒绝**（`realStaleReject` 真路径）— real code on the real HTTP path, not a stub, not a boolean flipped to true, and **not** a wash of the proof. The prove contract: **EXIT 1 before wiring · expected honest EXIT 0 after real wiring** · EXIT 0 ≠ covered ≠ nail ≠ SSOT flip. `GAP-UC025-NEG-01` stays OPEN and the `UC-E2E-025` row stays **gap** even after a green prove, until the covered criterion is met through its own dual-reviewed lift. Not UC-018. Not UC-052. Not UC-004. Not FAULT / BOUND / ADV.

## Why the prove is EXIT 1 today（read from source · facts copied, not invented）

Proof: `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（wired as `pnpm uc025:nhp-neg:prove` at root `package.json:148`). It reads **real product source** and computes two gates:

1. **`acceptsQuiz`** = `/quiz-id|quizId|sourceQuiz|source_quiz/` tested against the `begin(...)` signatures of:
   - `apps/api/src/modules/interview/interview.controller.ts` — `begin(@Param('id') id, @Req() req, @Headers('resume-id') resumeId)` → no quiz artifact identifier.
   - `apps/api/src/modules/interview/interview.service.ts` — `begin(principal, id, resumeId, requestId?)` → no quiz artifact identifier.
   - Result today: **false**. Interview begin takes no quiz artifact.
2. **`realStaleReject`** = `STALE_THROW_RE`（`throw new HttpException({ ... error: 'stale_quiz' | 'quiz_expired' | 'quiz_stale' | 'quiz_artifact_expired' | 'expired_quiz_input' ... })`）tested against the first **4500 chars** of `interview.service.ts` from `begin(principal`. The begin body today throws `missing_resume_id` / `invalid_resume_id` / `not_found_or_forbidden` / `interview_not_active` / `interview_resume_binding_conflict` / `legacy_resume_reference_unavailable` / `interview_resume_binding_unavailable` — none of them a stale-quiz error. Result today: **false**.

Supporting non-gating readings (printed, not part of the EXIT 0 gate): `packages/db/migrations/0007_resume_quiz.sql` `resume_quiz` has **no** `expires_at` / `fresh_until` / `stale_after` column (`resume_quiz_expiry_column=false`); `packages/contracts/src/index.ts` has no stale token (`contracts_stale_token=false`).

EXIT 0 branch requires `acceptsQuiz && realReject` — both regexes hit **real product source**. That is exactly why washing green by flipping booleans or editing the proof regexes is forbidden and detectable.

Prior evidence: receipt `receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md` records EXIT 1 at code `0271ee4`（`acceptsQuiz=false · realStaleReject=false`）. B' FINAL `76d2bc3` + harness `harness/gap-uc025-neg-product-wiring.md` locked EXIT 1 until real wiring.

## Real wiring scope（哪些文件/函数真改 — 授权后的 coding 范围）

Minimal real-path scope. Anything beyond this scope needs its own REQUEST（Ban widen）.

| # | File · function | Real change（真路径） |
|---|-----------------|----------------------|
| 1 | `apps/api/src/modules/interview/interview.controller.ts` · `begin()` | Accept the source quiz artifact identifier on the real HTTP surface（e.g. `@Headers('quiz-id')` / body `sourceQuiz` — implementer picks, contract says: a real request field flows into the service call）and pass it through to `InterviewService.begin`. This is what makes the proof's gate 1 hit **by real code**. |
| 2 | `apps/api/src/modules/interview/interview.service.ts` · `begin(principal, id, resumeId, ...)` | Resolve the presented quiz artifact owner-scoped (RLS / `owner_user_id` check, mirroring `quiz.service.ts` access shape), verify the artifact is `ready` and **fresh**, and on stale/expired **throw a real `HttpException`** with error token `stale_quiz`（or one of the proof-accepted tokens）and a real HTTP status（`CONFLICT`/`GONE`），inside the begin body **early — before entitlement reservation and queue write**（a stale input must not consume quota）. Must sit within the first 4500 chars of the `begin(principal` region (it naturally does if placed at the top of begin). This is what makes gate 2 hit **by real code**. A begin request **without** a quiz artifact keeps today's resume-only semantics — this knife does not make quiz mandatory（that would be a widen）. |
| 3 | `packages/db/migrations/0007_resume_quiz.sql`（or a new non-destructive migration + `sql/20_resume_quiz.sql` mirror, per that file's own mirror rule） | Add the freshness anchor the real check compares against（e.g. `expires_at timestamptz` on `resume_quiz`）— non-destructive, no DROP. Today the artifact table has no expiry column, so a real stale check has nothing honest to compare; writing the anchor where the artifact becomes `ready`（quiz worker / `quiz.service.ts`）is part of the real path. Hardcoding `now() + N` inside interview.service at read time is **not** the anchor and is wash-adjacent — reject as stub. |
| 4 | `packages/contracts/src/index.ts`（optional, non-gating） | Register the stale-quiz error token so the HTTP mapping is typed. Optional because the proof does not gate on it; honest wiring usually wants it. |

Explicitly **not** in scope: `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（the proof is the ruler — Ban edit）; any SSOT/matrix file; UC-018 / UC-052 / UC-004 / flake rows; FAULT / BOUND / ADV cases; the older `pnpm uc025:stale-quiz-expiry:prove` pin and its harness.

## acceptsQuiz / realStaleReject — 真路径定义（what counts as real）

- **`acceptsQuiz` 真路径**: a real HTTP input of the begin endpoint carries a quiz artifact identifier, is parsed by the controller, and is consumed by the service on the live code path (owner-scoped read of the `resume_quiz` row). NOT real: a `quizId` parameter that is parsed but never read, a header constant-folded away, a string inserted only to match the regex.
- **`realStaleReject` 真路径**: when the presented artifact is stale/expired against the persisted freshness anchor, `begin` throws a real `HttpException` with a stale-quiz error token and a real status, on the path a real request reaches. NOT real: a throw behind a dead flag, a boolean flipped to true, an error code string placed where it can never execute, editing the regex to accept anything.
- **Ban stub · Ban boolean wash · Ban proof edit**: `acceptsQuiz` / `realStaleReject` are computed by the proof from source. Nobody "sets" them. The only honest route to EXIT 0 is the real product code above.

## Prove EXIT contract

| Phase | CMD | Expected EXIT | Meaning |
|-------|-----|---------------|---------|
| Before real wiring（today · until coding lands） | `pnpm uc025:nhp-neg:prove` | **1** | Unwired mark. Honest. Not a product refusal, not covered. |
| After real wiring lands（coding authorized by coordinator after pre-exec dual PASS + implemented） | `pnpm uc025:nhp-neg:prove` | **0（expected honest）** | Both real paths exist. `case pass ≠ covered ≠ nail ≠ FAULT/BOUND/ADV`. Receipt records the actual EXIT; no pre-claiming. |

- The proof file must produce this flip **unmodified**. If the coding knife finds EXIT 0 requires editing the proof, the wiring is not real — stop and report; do not edit the proof.
- An honest EXIT 0 does **not** close GAP-UC025-NEG-01 and does **not** touch the matrix. Close requires the post-prove dual on its own; covered requires the row's covered criterion（FAULT / BOUND / ADV stay not-run）.
- The older `pnpm uc025:stale-quiz-expiry:prove` mark-red EXIT 0 stays a different pin and is never this case passing.

## NEG 用例迁移说明（NHP-025-NEG-01）

- Today: the NEG case is proven only as an **unwired mark**（EXIT 1 receipt at `0271ee4`）on top of the older static mark-red pin（`uc025:stale-quiz-expiry:prove` EXIT 0 with G-GAP markers — a different pin, stays as-is）.
- After real wiring: the same proof command migrates from unwired mark to a **real HTTP-path rejection proof**: begin presenting a stale quiz artifact → real stale-quiz `HttpException`; begin without a quiz artifact → today's behavior unchanged. One command, one contract, two honest phases; the receipt per phase is the evidence.
- Matrix UC-E2E-025 §1.0.1 NEG row stays **gap** in both phases; only its evidence line changes after a real EXIT 0 + post-prove dual（and even then via the row's own rules, not this REQUEST）.

## Receipt 落点

- Wiring prove receipt: `ai-docs/delivery/receipts/uc-e2e-025-nhp/2026-10-<D>-uc025-nhp-neg-real-wiring-prove.md`（dated at run time）— records CMD, actual EXIT, code SHA / runner SHA, printed `acceptsQuiz` / `realStaleReject` values, row-still-gap note, pins.
- Post-prove dual（new files, never overwrite the pre-exec stubs）: `reviews/REQUEST-2026-10-<D>-gap-uc025-neg-real-wiring-post-mw-rag-route.md` · `reviews/REQUEST-2026-10-<D>-gap-uc025-neg-real-wiring-post-mw-e2e-ha.md`.
- Pre-exec dual lands by appending to this knife's two REQUEST stubs（PENDING stubs are appended to, not rewritten — precedent: the 2026-10-02 stubs).

## Ban list

1. Ban coding in this REQUEST turn（docs only）. Ban prove runs in this turn. Ban push.
2. Ban editing `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` — regexes, booleans, or output. **Ban 仅靠改 proof 正则/布尔洗绿.**
3. Ban stub / dead-flag throw / string-insert-to-match-regex / boolean flipped to true — any of these is wash-green even if the prove prints EXIT 0.
4. Ban covered · Ban SSOT edit · Ban turning red into green · Ban writing `coveredCount ≠ 8`. `GAP-UC025-NEG-01` stays OPEN until its own post-prove dual; `UC-E2E-025` row stays **gap** until the covered criterion is honestly met.
5. Ban touching UC-018（stays partial）· UC-052（stays partial）· UC-004 · the `GAP-PRIV-AUTHZ-PROVE-FLAKE` row.
6. Ban FAULT / BOUND / ADV scope creep.
7. Ban secrets / `.env*` · Ban force-push · Ban self-approve · alone ≠ dual · dual PASS ≠ coding ≠ nail ≠ covered.
8. Ban widening the begin contract (e.g. making the quiz artifact mandatory) beyond the minimal real-path scope above.
9. Ban claiming the older `uc025:stale-quiz-expiry:prove` EXIT 0 as this case passing.

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · row stays gap · STOP

*Harness · GAP-UC025-NEG-01 real wiring · draft:awaiting_pre_exec_dual · EXIT 契约:前 1 后 0 · not coding permission · Ban proof edit · STOP*
