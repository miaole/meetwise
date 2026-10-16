# Line AN-MOP-Q45 · GAP-MOP-03 dual reconciler Q4/Q5 · POST · mw-model-op

**Role**: independent reviewer `mw-model-op` (alone ≠ dual · peer `mw-e2e-ha`)
**Date**: 2026-10-06 ~20:26 CST (Asia/Shanghai · UTC+8)
**Branch**: `feat/mysql-schema-skeleton`
**Worktree**: `/workspace/meetwise-mwmodelop-an-mop-q45-post` (fresh · Ban live · Ban `.env*` read · Ban Meridian · Ban sudo · Ban overwrite stubs/implementer receipts)
**PROVE tip**: `a1f3614408f57b373306df7493a482fde7197019`
**REQUEST**: `d26976171ddfa0678b4a42a003fe48a706e9d20e`
**PRE**: model-op `e2db4bc913b84dabb836b848489562fad9f03b7a` · e2e `66a77eda3b405bbf3aef636d727b8e3564c46ffb`
**Implementer prove receipt**: `ai-docs/delivery/receipts/2026-10-06-an-mop-q45-gap-mop-03-dual-reconciler-q45-honesty-prove.md`
**Conditions**: C-MO-AN-1..7 from PRE

## 1. What `66a77ed` actually is + diff classification

| Claim in implementer receipt | Reality |
|------------------------------|---------|
| `CODE_SHA (prove window) = 66a77ed` | **Mislabel**: `66a77eda3b405bbf3aef636d727b8e3564c46ffb` is **mw-e2e-ha PRE-EXEC review** (1 review md only) · **not** a product/code commit |
| Product churn | **none** from REQUEST → PROVE tip |

### `d269761..66a77ed`

Docs/reviews only (PRE dual halves + sibling REQUEST stub noise). **No** `.ts` / migration / package / lockfile / script / workflow.

### `66a77ed..a1f3614` / tip `a1f3614` alone

Implementer knife docs: harness/slice status → `executed:awaiting_post_prove_dual` + prove receipt + Q4/Q5 isolated JSON archives. Sibling AN-PERF/RAG rewrite docs in broader range — out of scope. **No product-code change.**

### Product-code equivalence to PRE

`git diff --name-only d269761..a1f3614` outside `ai-docs/` = **empty**. SKIP LOCKED / insert-only / LISTEN / Redis-default-off / dual wiring at `main.ts:677–680` **unchanged** vs PRE code-reality review. Proves re-run on tip tree = **code-equivalent** to what PRE reviewed.

**Non-blocker**: receipt should prefer labeling prove window as tip `a1f3614` (docs) + **product tree = REQUEST ancestor / pre-existing wire** · Ban treating `66a77ed` as a feat CODE SHA.

## 2. Prove script review (before re-run)

| CMD | Offline-safe? | Real asserts (not hard-wired)? | What it tests |
|-----|---------------|--------------------------------|---------------|
| `pnpm model-invocation-reconcile:prove` | **Yes** — comment: never calls provider; seeds dispatch + ages + reconcile tick | Yes — `A()` + `process.exit(failures)` | Config fail-closed · ACL/permit · stale **dispatching→unknown** + cost freeze · idempotent re-tick · **双 worker SKIP LOCKED 只终态化一次** · RLS |
| `pnpm model-op00-usage-reconciler:prove` | **Yes** — fake transport + isolated PG | Yes — seven-class matrix | estimate落库全 outcome · `reconcileUsageCalibration` insert-only factors/obs · under_estimate · **同批幂等 ON CONFLICT** · **并发同批双写不重复** · refine/monotonic · fail-closed |
| `pnpm worker-wakeup:prove` | **Yes** — FakeClient lifecycle · no Redis | Yes | LISTEN channel/payload · reconnect · stop · migration wake payload fixed · **PG-unit ≠ Q4/Q5 co-gate** |

## 3. Independent re-run (this review)

**Env**: ROOT `.env` / `.env.local` / `apps/api/.env` **ABSENT** (presence-only) · `MEETWISE_WAKEUP_REDIS_STREAMS` **unset** · provider keys unset · `sg docker` · isolated PG for Q4/Q5.

| Face | CMD | EXIT | Asserts | TS (CST) |
|------|-----|------|---------|----------|
| **Q4** | `pnpm model-invocation-reconcile:prove` | **0** | **17/17** PASS | 20:25:05–20:25:19 |
| **Q5** | `pnpm model-op00-usage-reconciler:prove` | **0** | **28/28** PASS | 20:25:26–20:25:35 |
| Optional wakeup | `pnpm worker-wakeup:prove` | **0** | **10/10** PASS | 20:25:35–20:25:37 |

Matches implementer claim EXIT 0/0 (+ optional wakeup 0). Isolated receipts `releaseEvidence=false`.

## 4. Receipt / gate / C-MO-AN status

| Check | Ruling |
|-------|--------|
| Both EXITs co-recorded one receipt | **PASS** — prove receipt § CMD table Q4+Q5 |
| Single green ≠ dual close (C-MO-AN-2) | **PASS** — honesty restated · both required |
| worker-wakeup PG-unit ≠ co-gate | **PASS** — receipt § optional · C-E2E-3 |
| GAP-MOP-03 OPEN · Ban self-nail / Ban `post_prove_dual_pass` | **PASS** — backlog `:76` untouched · harness awaiting_post_prove_dual |
| Ban MODEL-OP / MODEL-OP-00 / SLO / cutover / HA / suite closed | **PASS** |
| Ban G7 / payment conflation · actualSpendCny=null | **PASS** |
| Pins exact | **NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **gR45Closed=true** · **coveredCount=8** · **ms3EqualsR4Closed=false** · **PG-retained** |
| LISTEN retained · Redis not default-on · no LISTEN removal | **PASS** (no product diff; `main.ts:640–642` retained) |

### C-MO-AN-1..7

| ID | Status |
|----|--------|
| **C-MO-AN-1** 同列=co-prove gate not SQL LWW | **MET** — receipt § 同列 reading · no CAS-merge knife |
| **C-MO-AN-2** dual CMD EXIT co-record · EXIT0≠closed | **MET** — Q4+Q5 EXIT0 same window · Ban closed claims |
| **C-MO-AN-3** PG LISTEN retained · Redis unset/off | **MET** — flag unset this run + re-run · wakeup PG-unit only |
| **C-MO-AN-4** SKIP LOCKED + insert-only not weakened | **MET** — no product churn · Q4 assert 双 worker SKIP LOCKED · Q5 ON CONFLICT / 并发同批 |
| **C-MO-AN-5** Ban payment/G7 conflate · spend null | **MET** |
| **C-MO-AN-6** Ban self-write close · GAP OPEN | **MET** |
| **C-MO-AN-7** `.env` presence-only / isolated prove | **MET** — absent · isolated runner for Q4/Q5 |

## 5. Blockers / non-blockers

### Blockers

**None.**

### Non-blockers

1. **`CODE_SHA=66a77ed` mislabel** — is PRE e2e review SHA; product tree unchanged since REQUEST; tip `a1f3614` is prove-docs commit. Does not overturn EXIT evidence.
2. **No live multi-process cross-reconciler shared-column race** — N/A under C-MO-AN-1 (orthogonal writers). Q4/Q5 each carry their own concurrency asserts (SKIP LOCKED dual-worker · concurrent batch idempotency). Receipt does **not** falsely claim a SQL LWW race closed.
3. `worker-wakeup:prove` is FakeClient unit · not isolated multi-worker NOTIFY E2E — correctly labeled ≠ co-gate.
4. Sibling AN docs in broader ranges — out of scope.

## Honesty footer

PASS ≠ nail ≠ MODEL-OP closed · alone ≠ dual · EXIT0≠SLO≠cutover≠HA≠suite · GAP-MOP-03 OPEN · Ban Redis cutover · PG LISTEN retained · C-MO-AN-1..7 MET

Verdict: PASS
