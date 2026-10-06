# Receipt — GAP-PRIV-EXTERNAL-SINK-RETENTION · Line AN-PRIV-EXT · prove（`awaiting_post_prove_dual`）

**Status**: §1 PRE-DECLARE（committed in the CODE commit **before any run**）· §2+ filled by the follow-up receipt commit
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
