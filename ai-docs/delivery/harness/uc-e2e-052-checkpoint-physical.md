# Harness — **UC-E2E-052 checkpoint physical purge**（Line B · `GAP-PRIV-CHECKPOINT-FENCE-ONLY` · public DELETE=503 retained · nail · **`post_prove_dual_pass`** · Dual **`mw-privacy-int` + `mw-e2e-ha`** · **Ban** open DELETE · **Ban** invent covered · **Ban** wash `privacy-erasure:prove` alone into this gap closed · **Ban** Line A / Line C · **Ban** MySQL/Qdrant cutover · **Ban** claim suite green / HA）

**Line**: **B**（privacy · next knife after UC-052 internal erasure nail `8602cea` · **must not** touch Line A `uc-e2e-018-*` / Line C G7）  
**Revision**: **r0**（2026-09-23 ~21:00 PT）  
**Status**: **`post_prove_dual_pass`**（nail · prove `69de818` · receipts `c549d20` · dual EOR `118e28f`/`2e743b2` · Ban invent covered · Ban open DELETE · Ban wash into UC covered）  
**Date**: 2026-09-23 (~21:00 PT)  
**Base / parent tip**: **`21780af`** / full `21780af7a098fe7d8116b2be038b8698e15991b3`（**must remain ancestor**）· prior nail `8602cea` · prove tip `3c4847a` · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）  
**Knife name**: **UC-E2E-052 · GAP-PRIV-CHECKPOINT-FENCE-ONLY**（physical purge of LangGraph checkpoint tables on real PG · closes fence-only honesty hole left by UC-052 first knife）  
**Critical stack pin**: `adr-postgres-retained.md` · Ban cite `run-e2e-isolated` MySQL+Qdrant banner as stack truth（`GAP-E2E-ISO-BANNER-PG-RETAINED`）  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · PG-retained · public DELETE **503**  
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（Ban self-approve · coordinator dispatches）  
**Slice**: `../uc-e2e-052-checkpoint-physical.slice.md`  
**Authority**: meetwise — **docs REQUEST r0 only** · Ban secrets / `.env*` · Meridian banned · No force-push · Ban Cloud Agent · Ban coding until dual+authorize · Ban edit shared SSOT this REQUEST — deltas **at nail only**（except Item 1 timing flag below）  
**Honesty**: fence-only `checkpoint_rows` on UC-052 first knife ≠ physical purge · this knife plans physical DELETE of `checkpoint_writes` / `checkpoint_blobs` / `checkpoints` for subject thread on **real PG** · Ban `completed` wash while externals `retention_pending` · Ban invent covered · STOP after push

---

## 0. Item 1 — merged-row correction（SSOT plan · **not applied this commit**）

### Choice: **(a) annotate** the combined §1.0.1 `UC-E2E-050–052` cells

**Justification（repo evidence）**:
- `scripts/eval-harness-matrix-cite.proof.mjs` L19 / L367–368：`rowIds` includes **`UC-E2E-050`** and asserts `both.includes(row)` / matrix substring match. The live matrix id **`UC-E2E-050–052`** already **contains** the substring `UC-E2E-050` — cite stays green without split.
- Same file also cites harness/eval that name `UC-E2E-050–052` explicitly（`privacy-erasure-http-503-pin`）. **Splitting** into `UC-E2E-050` / `051` / `052` would require coordinated updates to cite `rowIds`, harness/eval「对照矩阵行」, NHP `派生` column, and human readers — higher blast radius; no covered-evaluator special-case for this row was found in `scripts/lib/uc-covered-*`.
- Annotation fixes the **overstatement**（FAULT/BOUND partial after `8602cea` looks like 050/051 elevated）for humans while keeping machine cite stable.
- Full **split (b)** remains a valid later SSOT knife **if** coordinator wants machine-unambiguous cells + cite package updates in the same nail.

### Proposed before → after（§1.0.1 exact row text）

**Before（nail `8602cea` current）**:
```
| UC-E2E-050–052 | **partial** | **partial** | **partial** | **blind** | **UC-052 deletion → partial**（`pnpm uc052:internal-erasure:prove` tip `3c4847a` · EOR dual `08d54f8`/`3e39c1e` · receipts `6a4140d`/`b0db484` supporting≠EOR）· NEG/FAULT/BOUND via NHP-050-* · ADV still **blind** · public DELETE **503** retained · Ban UC-050 kill-switch / UC-051 PII / export · **≠ covered** · ≠ deletion闭环 · checkpoint fence-only · externals retention_pending · coveredCount **8** |
```

**After（annotate · proposed）**:
```
| UC-E2E-050–052 | **partial**（**UC-052 deletion only**; 050/051 still gap/honesty-pin） | **partial**（**UC-052 deletion only**; 050/051 still **gap**） | **partial**（**UC-052 deletion only**; 050/051 still **blind**） | **blind** | Aggregate row · **only UC-052 deletion** NEG/FAULT/BOUND partial（prove `3c4847a` · EOR `08d54f8`/`3e39c1e`）· **UC-050 kill-switch** / **UC-051 no-PII** / export **not** elevated · DELETE **503** · **≠ covered** · coveredCount **8** |
```

### SSOT-timing flag（coordinator）

| Default（this REQUEST） | **SSOT-only-at-nail**：annotation applied when **this** knife nails（post_prove_dual_pass）· **Ban** edit matrix in this L0 commit |
| **Alternate** | Coordinator may authorize an **earlier docs-only correction** commit（annotation or split）**before** coding — flag here for explicit choice · Ban silent SSOT mid-flight |

---

## 1. Item 2 — candidate comparison（repo-evaluated）

| Candidate | Scope | Files / migrations likely | Real-PG evidence achievable | Risks | Matrix cells movable |
|-----------|-------|---------------------------|----------------------------|-------|----------------------|
| **UC-050 kill-switch** | Ops/graph safe-terminate escape | New flag/API + `AiGraphRun` path；overlap with UC-018 `safely_terminated` already proved via abandon | Possible on PG for graph status | Product flag surface unclear；easy wash into UC-018 evidence；not smallest residual after 052 deletion | Would target **050** facets still gap — but **not** the named residual of last knife |
| **UC-051 no-PII** | Logs / `ai_invocation_trace` / Langfuse payloads | `invoke.ts` redact · Langfuse runtime · log scanners | Partial（trace.output redacted）on PG；**full log/Langfuse** needs egress or fixtures | External Langfuse；「全日志无 PII」unbounded；hard C-CASECOUNT | 051 honesty — large |
| **GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL** | Make request `partial_failed` reachable when local target `failed` | **Must change** `0096` CASE order（L576–583）and mirror `reassessRequestStatus` | Yes on PG after migration | **Migration change** · dual risk · prior Ban「no 0096 edit unless allowed」· product semantics shift | Honesty fix for FAULT-01 narrative — not a new sink closure |
| **GAP-PRIV-CHECKPOINT-FENCE-ONLY** ⭐ | Physical purge `checkpoint_writes`/`blobs`/`checkpoints` for interview thread after authorized erasure | Reuse `0048`/`0078` `privacy_purge_checkpoint_target` · `packages/db/src/checkpoint-privacy.ts` · **no** app_role re-GRANT of `privacy_begin_checkpoint_erasure`（0096 revoked）· wire/sequence with UC-052 authz | **Yes**：admin `SELECT count(*)=0` on three physical tables + fence/revive refuse · real PG via `run-e2e-isolated` | Ledger/request coupling with externals still `retention_pending`；must not forge `completed`；must not wash standalone `privacy-erasure:prove` as this gap closed | Closes named gap；strengthens **UC-052 deletion** honesty（fence≠physical）· Ban flip 050/051 |

### Chosen: **GAP-PRIV-CHECKPOINT-FENCE-ONLY**（UC-E2E-052 checkpoint physical）

**Why**: Smallest honest residual of the just-nailed knife；primitives already on real PG（`privacy-erasure:prove` / `0048` DELETE L429–433）but **UC-052 path left fence-only**；no external service；no public DELETE；no 0096 CASE migration；non-happy（fault/revive/cross-tenant/lease）fit existing authz；closes a **registered** gap id.

**Ban wash**: Existing `pnpm privacy-erasure:prove` EXIT=0 **≠** this knife closed · must have **unique** prove CMD + receipts under this harness.

---

## 2. Inventory（file:line · plan）

| Asset | Path | Notes |
|-------|------|-------|
| Physical DELETE | `packages/db/migrations/0048_checkpoint_physical_erasure.sql` **L429–433** | `checkpoint_writes` / `checkpoint_blobs` / `checkpoints` |
| Purge fn | same + `0078_privacy_worker_parent_request_guard.sql` · `privacy_purge_checkpoint_target` | worker_executor only |
| Begin fn | `privacy_begin_checkpoint_erasure` · **app_role EXECUTE revoked**（0096） | **Ban** re-GRANT · use privacy_api / provisioned runtime login pattern like worker proof |
| TS wrappers | `packages/db/src/checkpoint-privacy.ts` L72–117 | `beginCheckpointErasure` / `claim` / `purgeCheckpointErasureTarget` |
| Prior UC-052 | `packages/db/src/uc052-internal-erasure.ts` · fence `checkpoint_rows` status=`erased` deleted_count=0 | Does **not** physical-purge |
| Prior prove（≠ this knife） | `apps/worker/test/checkpoint-privacy-erasure.proof.ts` · CMD `privacy-erasure:prove` | Standalone · Ban cite as GAP closed |
| Authz | `0091` issuer/lease/claim · guard **L516–545** | Externals may keep request ≠ `completed` |
| PostgresSaver tables | `checkpoints` / `checkpoint_blobs` / `checkpoint_writes` | Real PG / pgvector-legacy isolation fixture |

---

## 3. NHP cases（non-happy first · happy last）

| ID | Maps | Expectation |
|----|------|-------------|
| **NHP-052-CKPT-FAULT-01** | mid-purge fail / lease lost | target not falsely `erased` · physical counts honest · retry re-claimable |
| **NHP-052-CKPT-FAULT-02** | fence-revive after physical purge | worker/app write to thread rejected · admin physical count stays 0 |
| **NHP-052-CKPT-FAULT-03** | idempotent re-purge | second purge no error storm · counts stay 0 · no duplicate destructive ledger rows |
| **NHP-052-CKPT-NEG-01** | unauthorized / forged JWS / GUC-only | refuse · physical rows intact |
| **NHP-052-CKPT-NEG-02** | cross-tenant claim/purge | A cannot purge B · B counts unchanged |
| **NHP-052-CKPT-NEG-03** | public DELETE | still **503**（pin · no new route） |
| **NHP-052-CKPT-BOUND-01** | concurrent claim | single lease winner · no deadlock |
| **HP-052-CKPT-01** | happy | after authorized path：admin `count=0` on writes+blobs+checkpoints · receipt `local_erased` · request **≠ `completed`** if externals `retention_pending`（expect `pending_external` or honest non-completed） |

**C-CASECOUNT**: skip/missing → EXIT≠0 · no hardcoded pass literals.

---

## 4. Prove CMD plan

| CMD | Role |
|-----|------|
| **`pnpm uc052:checkpoint-physical:prove`** | THIS knife · `run-e2e-isolated` · unique name（no collision with `privacy-erasure:prove` / `uc052:internal-erasure:prove`） |
| `pnpm privacy-erasure:prove` | **different** · Ban mutual wash |
| `pnpm uc052:internal-erasure:prove` | prior knife regression · Ban claim this gap |
| `pnpm privacy-erasure:http:prove` | DELETE=503 retained |

### Success criteria（coding phase · after dual+authorize）
- Run at **committed** runner SHA · worktree `git status --porcelain` empty else EXIT≠0  
- Tracked redacted receipts under `ai-docs/delivery/receipts/uc052-checkpoint-physical/`  
- C-CASECOUNT · per-table SQL assert · zero **new** `tsc -p packages/db` errors vs baseline  
- Ban MemorySaver as evidence · PG/LEGACY path only · Ban cite R5 MySQL banner as truth  

---

## 5. What stays gap

- Public **DELETE=503** · UC-050 kill-switch · UC-051 no-PII · export  
- External oss/redis/langfuse async confirm（`GAP-PRIV-EXTERNAL-SINK-RETENTION`）  
- `GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL`（migration）  
- Audit retention · INT-TRANSCRIPT-01 · vector/Qdrant sink · HA / suite green / covered  

---

## 6. Pins（retained）

| Pin | Value |
|-----|-------|
| Status | **`post_prove_dual_pass`** |
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |
| Ban | invent **covered** · open DELETE · Line A/C · self-nail |

---

## 7. Dual receipts（stubs · Ban implementer fill）

| Expert | Stub |
|--------|------|
| `mw-privacy-int` | `../reviews/REQUEST-2026-09-23-uc-e2e-052-checkpoint-physical-mw-privacy-int.md` |
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-23-uc-e2e-052-checkpoint-physical-mw-e2e-ha.md` |

STOP after push · no messaging dual · no coding · no SSOT edit this tip.

---

## Disclosure 2 — seal `privacy_epoch` + `target_set_digest` after begin（coding note）

**Why seal is required (not a digest wash):**
1. `privacy_begin_checkpoint_erasure` (`packages/db/migrations/0096_int_transcript_remaining_sinks.sql` **L147–218**) creates the request + pending `checkpoint_rows` + externals and sets `status='fenced'` **without** writing `privacy_epoch` or `target_set_digest`.
2. `privacy_authorization_claim_target` (`packages/db/migrations/0091_privacy_authorization_issuer.sql` **L369–383**) fail-closes when `request_epoch`/`request_digest` are NULL or disagree with the consumed snapshot, and re-checks the **live** target-set digest against the sealed digest.
3. Orchestration: `sealCheckpointErasureAuthz` (`packages/db/src/uc052-checkpoint-physical.ts`) computes `canonicalTargetSetDigest` over the **full** live target set (checkpoint_rows + interview_job_payload + oss/redis/langfuse) then UPDATEs both columns; `runAuthorizedCheckpointPhysicalPurge` signs that digest and asserts `signed.targetSetDigest === sealed.targetSetDigest` before issue/verify/consume/0091 claim.

**Ban**: trim sinks to greener digest · Ban invent covered · Ban open DELETE.

---

## Nail evidence（`post_prove_dual_pass`）

| Field | Value |
|-------|-------|
| Prove SHA | **`69de818`** / `69de8180f5f2aa059191f67c32dad89d07bbcbed` |
| Receipts | **`c549d20`** |
| Dual EOR | mw-privacy-int **`118e28f`** · mw-e2e-ha **`2e743b2`** BOTH PASS |
| CMD | `pnpm uc052:checkpoint-physical:prove` EXIT=0 |
| Matrix | §1.0.1 / §1.1 **partial**（UC-052 deletion + checkpoint physical）· **≠ covered** |
| No-revive | **DB fence/trigger**（0047）· FOR UPDATE barrier = **extra stress only** · **NOTE-RACE-REFUSE-VIA-FENCE** |
| Cite known RED | `eval-harness-matrix-cite:prove` EXIT=1（UC-018 facet[2] · Line A · non-blocker） |
| Open follow-ups | `GAP-UC052-POOL-ROLE-LEAK` · `NOTE-CKPT-UNSEALED-CLAIM-NEG` · `GAP-PRIV-AUTHZ-PROVE-FLAKE` |
| Pins | NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 |

