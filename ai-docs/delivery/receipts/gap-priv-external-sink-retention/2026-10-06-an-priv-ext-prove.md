# Receipt — GAP-PRIV-EXTERNAL-SINK-RETENTION · Line AN-PRIV-EXT · prove（`awaiting_post_prove_dual`）

**Status**: **`awaiting_post_prove_dual`**（mw-privacy-int + mw-e2e-ha · opened by parent）· §1 PRE-DECLARE was committed+pushed in the CODE commit **before any run** · §2+ = results
**CODE_SHA**: `9e2abd0` / `9e2abd04083eca464817e35687595c706cbcd2a9`（pushed to `origin/feat/mysql-schema-skeleton` 2026-10-06 ~20:26 CST before attempt A1 · §1 unchanged since）
**AUTHORIZE**: coordinator `AUTHORIZE coding+prove — AN-PRIV-EXT @ REQUEST 59e2189` · PRE BOTH PASS: privacy `fb6fca2` · e2e `512cc5d`（C-1..C-6）
**Implementer**: mw-core（Ban self-nail · Ban self-approve · alone ≠ dual · POST dual opened by parent only）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `gap-bug-backlog.md:64` **OPEN** · canHonestlyFlip=false

## §1 PRE-DECLARE（C-3 / C-4 / C-5）

### Named CMD（C-3）

| Role | CMD | Notes |
|------|-----|-------|
| **Primary（new）** | `pnpm uc052:external-sink-retention:prove` | → `run-e2e-isolated.mjs uc052:external-sink-retention:prove:raw` → `pnpm -C packages/db prove:uc052-external-sink-retention` → `packages/db/test/uc052-external-sink-retention.proof.ts` · isolated real PG · Ban live · MODEL_API_KEY **not loaded** |
| **C-3(c) co-record（same window）** | `pnpm privacy-erasure:http:prove` | DELETE 503 regression via HTTP |
| Regression | `pnpm uc052:internal-erasure:prove` | Line B internals unchanged（**≠ this knife's evidence**） |
| Regression | `pnpm privacy-authorization:prove` | 0091 sanctioned F1 path（external_pending → resolve → completed）must still pass under the 0137 tightened guard · NB GAP-PRIV-AUTHZ-PROVE-FLAKE OPEN（mitigated/cause-unknown）— an EXIT1 here is recorded as-is, not retried |
| Regression | `pnpm uc052:checkpoint-physical:prove` | sibling uc052 guard surface |
| Regression | `pnpm int-transcript-remaining-sinks:prove` | local-only requests still reach `completed`（0137 only touches oss/redis/langfuse targets） |
| **Mutation control** | same primary prove in a scratch worktree = CODE_SHA **minus** `0137_privacy_external_sink_confirmation_guard.sql`（local scratch commit · never pushed） | expected **EXIT≠0**: EXT-NEG-02 / EXT-NEG-02B / EXT-NEG-04 must FAIL on the bare 0091 guard → proves the new red paths are non-vacuous |

### New red paths（C-3 a/b/c · C-4）

| Case | Face | Assert |
|------|------|--------|
| EXT-RP-01 | baseline + **N2** | locals erased · externals `retention_pending` · request `pending_external` · externals carry **no** `external_pending`/`external_confirmed` receipt（retention_pending target ≠ external_pending receipt） |
| EXT-NEG-01 | C-3(a) | externals `retention_pending` → forced `UPDATE … completed` → **55000** `privacy_erasure_request_incomplete_targets` |
| EXT-NEG-02 | C-3(a) | externals **forced `erased` with zero confirmation**（rolled-back txn）→ forced `UPDATE … completed` → **55000** · request ≠ completed |
| EXT-NEG-02B | C-3(a) | same forge via product settler `reassessRequestStatus`（CASE `ELSE 'completed'`）→ **55000** · ≠ completed |
| EXT-NEG-03 | C-3(a) | forced erased + unresolved `external_pending` → **55000** `privacy_erasure_request_external_unresolved` |
| EXT-NEG-04 | **C-4** | direct `privacy_record_deletion_receipt(…,'external_confirmed',…)`（resolved_at NULL）+ forced erased → **55000** — direct write ≠ external purge evidence |
| EXT-NEG-05 | C-3(b) | `privacy_resolve_deletion_receipt` on each external target in today's shape（no `external_pending`）→ **40901** `privacy_authorization_receipt_not_pending` · receipts/target/request unchanged |
| EXT-NEG-06 | C-3(b) | resolve on a direct-written `external_confirmed`（not pending）→ **40901** |
| EXT-POS-01 | C-4 locus | 0091 audit chain `external_pending` → resolve → `external_confirmed`（resolved_at/resolved_by set）works, **but** target stays `retention_pending`, request stays `pending_external`（no confirmer flips externals → ≠ completed） |
| EXT-DEL-01 | C-3(c) | `PrivacyService.eraseInterviewData` → 503 `interview_erasure_authorization_not_available`（+ HTTP prove above） |
| C-CASECOUNT | — | all 10 required cases ran |

Forged states run inside an admin txn that is **always ROLLED BACK**（never persisted）.

### Product change（only what honesty requires）

`packages/db/migrations/0137_privacy_external_sink_confirmation_guard.sql`: `CREATE OR REPLACE assert_privacy_erasure_request_completed_guard()` = 0091 body verbatim **+ one fail-closed clause**: any `oss`/`redis`/`langfuse` target without an `external_confirmed` receipt that went through `privacy_resolve_deletion_receipt`（`resolved_at IS NOT NULL AND resolved_by IS NOT NULL`）→ **55000** `privacy_erasure_request_external_unconfirmed`. Only rejects more `completed`; never enables one. 0091 issuer / record / resolve bodies untouched（frozen）. No external executor, no OSS/Redis/Langfuse calls, DELETE stays 503.

### Attempts（C-5）

- **1 attempt per CMD** at CODE_SHA（Asia/Shanghai timestamps + SHA recorded）· mutation control 1 attempt at scratch SHA.
- **Ban retry-to-green**: any EXIT≠0 is kept and reported as-is; a code fix would mean a new CODE_SHA with the earlier EXIT kept in the ledger（no discard）.
- Docker via `sg docker`（`scripts/with-docker-session.sh` pattern · Ban sudo/chmod）.

### Non-claims（C-6）

EXIT0 ≠ external sinks purged ≠ `completed` ≠ covered ≠ deletion closed ≠ open DELETE ≠ HA. Langfuse ≠ vendor wipe（privacy N1）. `retention_pending` ≠ `external_pending` receipt（N2）. Line B internal nail is **not** washed into external closure. backlog `:64` stays **OPEN** · canHonestlyFlip=false · zero matrix/backlog edit.

## §2 Results（Asia/Shanghai · CST/UTC+8 · all at CODE_SHA `9e2abd0` unless noted · porcelain clean=0 at every start）

| # | CMD | SHA | Start → End（CST） | EXIT |
|---|-----|-----|---------------------|------|
| **A1** | `pnpm uc052:external-sink-retention:prove` | `9e2abd0` | 2026-10-06 20:26:55 → 20:27:07 | **0** |
| C-3(c) | `pnpm privacy-erasure:http:prove` | `9e2abd0` | 20:27:14 → 20:27:57 | **0**（19 pass / 0 fail · DELETE `interview-data` 503 ×2 incl. replay） |
| R1 | `pnpm uc052:internal-erasure:prove` | `9e2abd0` | 20:27:57 → 20:28:09 | **0**（regression only · ≠ this knife's evidence） |
| R2 | `pnpm privacy-authorization:prove` | `9e2abd0` | 20:28:09 → 20:28:21 | **0**（F1 sanctioned `external_pending → resolve → completed` still passes under 0137） |
| R3 | `pnpm uc052:checkpoint-physical:prove` | `9e2abd0` | 20:28:21 → 20:28:34 | **0** |
| R4 | `pnpm int-transcript-remaining-sinks:prove` | `9e2abd0` | 20:28:34 → 20:28:46 | **0**（local-only requests still reach completed） |
| **MUT-1** | same primary prove · scratch `8a571cc`（= `9e2abd0` − `0137` · local only · never pushed） | `8a571cc` | 20:28:59 → 20:29:11 | **1**（`✗ 3 assertion failures`: EXT-NEG-02 / EXT-NEG-02B / EXT-NEG-04 `err=NO_ERROR inTxn=completed`；runner receipt also ENOENT on the removed 0137 path — secondary） |

Every run was attempt #1 for its CMD. Zero retries. Zero discarded runs. Ledger: `attempt-ledger.tsv` · logs: `logs/` · runner local receipts: `prove/*.json`（`class=local_untrusted_isolated_proof_receipt` · releaseEvidence=false · A1 manifest `count=137 latest=0137_…`）. Docker via `scripts/with-docker-session.sh`（`sg docker`）· `env -u MODEL_API_KEY`（key **not loaded**）· Ban live.

### A1 per-case（verbatim from `logs/A1-…log`）

```
PASS  EXT-RP-01 · req=pending_external localsErased=true externalsRp=true externalReceiptKinds=[] (N2: retention_pending target ≠ external_pending receipt)
PASS  EXT-NEG-01 · err=55000:privacy_erasure_request_incomplete_targets req=pending_external
PASS  EXT-NEG-02 · err=55000:privacy_erasure_request_external_unconfirmed inTxn=pending_external after=pending_external forgeRolledBack=true
PASS  EXT-NEG-02B · err=55000:privacy_erasure_request_external_unconfirmed inTxn=pending_external after=pending_external
PASS  EXT-NEG-03 · err=55000:privacy_erasure_request_external_unresolved inTxn=pending_external after=pending_external
PASS  EXT-NEG-06 · resolveErr=40901:privacy_authorization_receipt_not_pending
PASS  EXT-NEG-04 · directExternalConfirmed(resolved_at=NULL)=true err=55000:privacy_erasure_request_external_unconfirmed inTxn=pending_external after=pending_external
PASS  EXT-NEG-05 · errs=[40901,40901,40901] receipts=0->0 req=pending_external externalsRp=true
PASS  EXT-POS-01 · mid=pending_external resolvedKind=external_confirmed audited=true resolveReq=pending_external req=pending_external externalsStillRp=true (no confirmer flips target → ≠ completed)
PASS  EXT-DEL-01 · httpStatus=503 code=interview_erasure_authorization_not_available
PASS  C-CASECOUNT · all 10 present
```

### MUT-1 per-case（bare 0091 guard）

```
FAIL  EXT-NEG-02 · err=NO_ERROR inTxn=completed after=pending_external forgeRolledBack=true
FAIL  EXT-NEG-02B · err=NO_ERROR inTxn=completed after=pending_external
FAIL  EXT-NEG-04 · directExternalConfirmed(resolved_at=NULL)=true err=NO_ERROR inTxn=completed after=pending_external
（other 8 cases PASS identically）
```

## §3 What the red paths found（honest disclosure）

- **Real honesty hole on the bare 0091 guard**（MUT-1）: with externals in today's shape（target `retention_pending`, **no** `external_pending` receipt — N2 confirmed by EXT-RP-01 `externalReceiptKinds=[]`）, flipping the external targets to `erased` with **zero confirmation** let a forced `UPDATE … completed` **and** the product settler `reassessRequestStatus`（CASE `ELSE 'completed'`）reach `completed`; a direct `privacy_record_deletion_receipt(external_confirmed)`（resolved_at NULL）was likewise accepted as if it were a purge. = count-as-erased reachable at DB level. Forged states were inside rolled-back txns（`after=pending_external`）— nothing persisted.
- **Fix（0137 · only what honesty needs）**: guard clause `0137:45-55` — each `oss`/`redis`/`langfuse` target must hold an `external_confirmed` receipt that went through `privacy_resolve_deletion_receipt`（`resolved_at`+`resolved_by` set）else **55000** `privacy_erasure_request_external_unconfirmed`. Fail-closed only; 0091 issuer/record/resolve bodies untouched.
- **C-3(b)**: resolve without `external_pending` → **40901** on all three externals in today's shape（EXT-NEG-05）and on a direct-written `external_confirmed`（EXT-NEG-06）— this held on the bare 0091 too（pre-existing fail-closed; now pinned）.
- **C-4 locus**: EXT-POS-01 shows the 0091 audit chain works（`external_pending` → resolve → `external_confirmed` with resolved_at/resolved_by）but **does not** flip the target nor complete the request — no confirmer exists that turns external targets `erased`, so the honest happy terminal stays `pending_external`.

## §4 Files（CODE commit `9e2abd0`）

| Path | Change |
|------|--------|
| `packages/db/migrations/0137_privacy_external_sink_confirmation_guard.sql` | **new** · guard = 0091 verbatim + external-confirmation clause |
| `packages/db/test/uc052-external-sink-retention.proof.ts` | **new** · 10 required cases + C-CASECOUNT · C-UNCOMMITTED refuse |
| `packages/db/package.json` | +`prove:uc052-external-sink-retention` |
| `package.json` | +`uc052:external-sink-retention:prove` / `:raw` |
| `scripts/run-e2e-isolated.mjs` | additive target registration only（receipt-sources entry +12 lines · dispatch +2 lines · allowlist/migrate lists inline on existing uc052 lines）· zero logic change |
| this receipt（§1 in CODE commit · §2+ + evidence in receipt commit） | docs |

Not touched: matrix · `gap-bug-backlog.md`（`:64` stays OPEN）· checklist · 0091 · 0096 · `privacy.controller.ts`/`privacy.service.ts`（DELETE=503）· PERF-TEAR / RAG-R3 / MOP-Q45 files · `.env*`. `packages/db` tsc = 6 errors before and after（all pre-existing; new proof file adds 0）.

## §5 Row semantics（frozen · C-6）

- backlog `gap-bug-backlog.md:64` **GAP-PRIV-EXTERNAL-SINK-RETENTION stays OPEN** · canHonestlyFlip=**false**（no async external confirmer · no real OSS/Redis/Langfuse purge · Langfuse ≠ vendor wipe）.
- UC-052 / privacy rows stay **partial** · coveredCount=**8** · public DELETE=**503**.
- EXIT0 ≠ external purged ≠ completed ≠ covered ≠ deletion closed ≠ HA · alone ≠ dual · **Ban nail until POST BOTH + AUTHORIZE**.

*Receipt · GAP-PRIV-EXTERNAL-SINK-RETENTION · AN-PRIV-EXT · CODE_SHA 9e2abd0 · A1 EXIT0 · MUT-1 EXIT1 · awaiting_post_prove_dual · Ban nail · STOP*
