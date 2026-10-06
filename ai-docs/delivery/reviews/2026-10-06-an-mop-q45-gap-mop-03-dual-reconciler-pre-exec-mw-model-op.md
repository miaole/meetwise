# Line AN-MOP-Q45 · GAP-MOP-03 dual reconciler Q4/Q5 same-column honesty · PRE-EXEC · mw-model-op

**Role**: independent reviewer `mw-model-op` (alone ≠ dual · peer `mw-e2e-ha`)
**Date**: 2026-10-06 ~20:15 CST (Asia/Shanghai · UTC+8)
**Branch**: `feat/mysql-schema-skeleton`
**Worktree**: `/workspace/meetwise-mwmodelop-an-mop-q45` (fresh · Ban live · Ban `.env*` read · Ban Meridian · **NO coding** · Ban overwrite stubs)
**REQUEST**: `d26976171ddfa0678b4a42a003fe48a706e9d20e` (= tip at fetch)
**Parent**: `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`
**Harness**: `ai-docs/delivery/harness/gap-mop-03-dual-reconciler-q45-honesty.md`
**Slice**: `ai-docs/delivery/gap-mop-03-dual-reconciler-q45-honesty.slice.md`
**Stub**: `ai-docs/delivery/reviews/REQUEST-2026-10-06-gap-mop-03-dual-reconciler-q45-honesty-mw-model-op.md` (PENDING · not overwritten)
**Note**: `run-e2e.mjs` / `run-e2e-ui.mjs` auto-load ROOT `.env` — not applicable this turn (docs only · Zero CMD)

## 1. Docs-only confirmation

| Check | Result |
|-------|--------|
| `git diff --name-status d269761^..d269761` | **4 `.md` only** |
| Paths | harness · slice · REQUEST mw-model-op · REQUEST mw-e2e-ha |
| code / script / package / lockfile / workflow / migration | **none** |
| matrix / backlog / checklist edit | **none** (backlog `:76` read-only cite) |

**Ruling**: REQUEST is **docs-only**.

## 2. Code-reality check (dual reconciler · “同列”)

### Writers (both exist · both wired)

| Reconciler | Entry | Persistence | Concurrency / lock |
|------------|-------|-------------|-------------------|
| **model-invocation-reconcile** | `apps/worker/src/model-invocation-reconcile.ts` · `runModelInvocationReconciler` · tick `modelInvocationReconcileTick` · wired `apps/worker/src/main.ts:677` | Terminalizes stale **dispatching→unknown** via `reconcileStaleModelInvocations` (`packages/db/src/model-invocation.ts:167–190`) + freezes matching cost rows `markAiCostsUnknownForModelReconcile` in same principal txn (`model-invocation-reconcile.ts:70–81`) | Candidates locked with **`FOR UPDATE SKIP LOCKED`** (comment `:67–68` · db helper) · age window fail-closed `:35k–3.6M` |
| **usageCalibrationReconciler** | `apps/worker/src/usage-calibration-reconcile.ts` · `runUsageCalibrationReconciler` · tick `usageCalibrationReconcileTick` · wired `main.ts:678–680` | Domain `reconcileUsageCalibration` (`packages/ai-runtime/src/usage-calibration-reconciler.ts:103–169`) → **INSERT-only** `ai_usage_calibration` + `ai_usage_calibration_observation` (`packages/db/src/usage-calibration.ts:7` CAS note · `:72` · `:102`) | Versioned insert-only + batch idempotency · no UPDATE/DELETE of factors |

### Shared SQL column / last-writer-wins?

**No.** The two reconcilers write **orthogonal** surfaces:

- Invocation reconciler mutates **model-invocation / AI-cost** terminalization state (stale dispatch freeze).
- Usage calibration reconciler appends **calibration observations + versioned factors** (insert-only history).

There is **no** shared updatable column where last-writer-wins can clobber across the two jobs. Cross-reconciler “race” is **not** a same-row overwrite hazard; each has its own intra-reconciler concurrency story (SKIP LOCKED vs insert-only idempotent batches).

### What harness “同列” means (matches code + backlog)

Harness / backlog `:76` **同列** = **Q4/Q5 acceptance co-requirement** (both proves must be recorded side-by-side; single green ≠ dual gate closed) — **not** “two writers UPDATE the same SQL column.”

Harness description **matches** that reading:

- Names both jobs correctly (`model-invocation-reconcile` + `usageCalibrationReconciler`).
- Does **not** invent a false shared-column CAS / clobber narrative.
- Does **not** omit a writer — both are present and worker-wired (`main.ts:677–680`).
- Related SSOT cite W5 + MODEL-OP-wire as honesty/wiring history · Ban masquerade ✓.

**If a later coding knife assumed SQL same-column dual-writer clobber → that would be a misread of this gap** (see C-MO-AN-1).

### PG LISTEN / Redis

| Mechanism | Cite | Harness alignment |
|-----------|------|-------------------|
| PG LISTEN channel `meetwise_worker_wakeup_v1` | `packages/db/src/worker-job-wakeup.ts:15` · `job-wakeup-listener.ts:108` · `main.ts` NOTIFY comment `:458+` | Harness **PG LISTEN retained** · Ban delete ✓ |
| Redis Streams wakeup | additive · default off · `main.ts:640–666` · “never replaces the PG LISTEN session” | Harness **Ban Redis cutover** · Redis deferred ≠ STOPPED ✓ |

Commerce reconciler (`runCommerceReconciler`) is a **separate** money-face loop — not part of GAP-MOP-03 Q4/Q5 pair · Ban conflate with payment/entitlement (Line Z) or G7 NDJSON cap.

## 3. Honesty rulings

| Rule | Ruling |
|------|--------|
| GAP-MOP-03 recorded **OPEN** · Ban self-write `post_prove_dual_pass` | **PASS** — backlog `:76` cite · harness §4 |
| Proposed path falsifiable | **PASS for this docs knife** — AUTHORIZE path = dual CMD `model-invocation-reconcile:prove` **and** `model-op00-usage-reconciler:prove` co-recorded · EXIT0 ≠ MODEL-OP/SLO/cutover · optional `worker-wakeup:prove` PG-only · Ban Redis wakeup as cutover · Ban single-green close (harness §3) |
| Ban Redis cutover · PG LISTEN retained | **PASS** — doc + code |
| Ban MODEL-OP-00 / MODEL-OP closed / cost-SLO closed | **PASS** |
| Ban g7SuiteGreen=true / G7 green | **PASS** (not claimed) |
| actualSpendCny | N/A this docs turn · Ban invent spend restated |
| ≠ payment/entitlement ledger · ≠ G7 NDJSON | **PASS** |
| Erratum 3424dc1 / 82981ff | Not in this REQUEST (G7 tech-role erratum) · **non-applicable** · SHAs resolve if cited elsewhere |
| Cited SHAs/lines | parent `4c93dc5` resolves · backlog `:76` accurate · W5/wiring harness paths exist |
| Pins exact | **NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **gR45Closed=true** · **coveredCount=8** · **ms3EqualsR4Closed=false** · **PG-retained** |
| HA / R1 closed / A3 / MODEL-OP-00 closed | **none claimed** |

## 4. Blockers / non-blockers / conditions

### Blockers

**None.** Harness does not mis-describe dual writers as SQL same-column clobber; “同列” honesty gate is accurate; GAP stays OPEN; Ban Redis / Ban MODEL-OP closed / PG LISTEN retained hold.

### Non-blockers

1. English title “same-column” can be misread as SQL column — Chinese/backlog sense is **acceptance co-column**; CONDITION C-MO-AN-1 freezes the reading.
2. Harness does not add a new cross-reconciler race prove (N/A for shared SQL column); each reconciler’s own concurrency remains owned by existing proves.
3. Sibling AN wave files out of scope · Ban touch.

### Conditions (C-MO-AN-n · for later coding/prove · Ban coding now)

| ID | Condition |
|----|-----------|
| **C-MO-AN-1** | **同列 = Q4/Q5 co-prove gate**, not “two UPDATEs to one SQL column.” Ban AUTHORIZE a “single-owner column / CAS merge” product knife **unless** new evidence shows a real shared mutable column (today’s code does not). |
| **C-MO-AN-2** | AUTHORIZE prove receipt must record **both** `pnpm model-invocation-reconcile:prove` **and** `pnpm model-op00-usage-reconciler:prove` with EXIT codes + code SHA · **EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ cutover ≠ HA ≠ suite**. Single EXIT0 insufficient. |
| **C-MO-AN-3** | PG LISTEN `meetwise_worker_wakeup_v1` **retained** · Redis Streams wakeup stays additive/default-off · Ban cutover claim · Ban delete LISTEN. Optional `pnpm worker-wakeup:prove` = PG path only · Ban Redis wakeup prove as cutover evidence. |
| **C-MO-AN-4** | Intra-reconciler concurrency retained: invocation **SKIP LOCKED** · calibration **insert-only + batch idempotency** · Ban weakening either under “同列” narrative. |
| **C-MO-AN-5** | Ban conflate with Line Z payment/entitlement ledger · Ban G7 NDJSON run-cap / `g7SuiteGreen=true` · `actualSpendCny` console-only else **null** · Ban invent spend. |
| **C-MO-AN-6** | Closing GAP-MOP-03 requires prove + dual + coordinator AUTHORIZE · Ban self-write `post_prove_dual_pass` · closed-as-wired/honesty ≠ MODEL-OP domain closed / #102 cutover. |
| **C-MO-AN-7** | Any live/ui re-run later: presence-only confirm ROOT `.env` absent or use isolated prove paths that do not auto-load secrets (`run-e2e*.mjs` warning). |

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE=503 · PG LISTEN retained · Ban Redis cutover · Ban MODEL-OP closed · GAP-MOP-03 OPEN

## Honesty footer

PASS ≠ coding · alone ≠ dual · Dual PASS ≠ AUTHORIZE ≠ prove ≠ nail ≠ MODEL-OP closed · Ban fake green · Ban Meridian · Ban live · Ban secrets

Verdict: PASS
