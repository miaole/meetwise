# Harness — **UC-E2E-050–052 privacy erasure**（Line B · r3 · `GAP-PRIV-ERASURE-CLOSURE` · public DELETE=503 honesty pin ≠ deletion closure · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Dual experts **`mw-privacy-int` + `mw-e2e-ha`** · **Ban** open public DELETE · **Ban** invent covered · **Ban** wash 503 pin into deletion closed · **Ban** cite Line A / UC-018 evidence · **Ban** MySQL/Qdrant cutover · **Ban** claim suite green / HA）

**Line**: **B**（privacy UC-E2E-050–052 · parallel allowed · **must not** touch Line A files `uc-e2e-018-*` / `scripts/lib/uc-covered-evaluator*` / `uc018*` proves）  
**Revision**: **r3**（2026-09-23 ~20:30 PT · r2 dual: e2e-ha PASS `79d9191`/`dc3e17a` · privacy-int r2 FAIL `bfa1189` — **B1/B2/B3 CLOSED** · new **B4** FAULT-01 `partial_failed` unreachable · Ban coding until dual re-PASS）  
**Status**: **`draft:awaiting_pre_exec_dual`**（r3 修订 · **awaiting dual re-review** · **Ban自批 pass** · Dual PASS ≠ coding · Dual PASS ≠ UC-E2E-050/051/052 covered · Dual PASS ≠ open public DELETE · Dual PASS ≠ next knife auto-authorize · **≠ coding** · **≠ prove** this open · **≠ apply Step 0 now**）  
**Date**: 2026-09-23 (~20:30 PT)  
**Base / parent tip**: REQUEST parent **`f07663a`** / full `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379`（**must remain ancestor**）· L0 tip `cd5a4de` · r2 tip `8fecc3d` · dual tips `dc3e17a`/`79d9191` / `2bbebff`/`bfa1189` · branch `feat/mysql-schema-skeleton`（**historical name only** · Ban MySQL cutover justification）  
**Knife name**: **UC-E2E-050–052 privacy erasure · GAP-PRIV-ERASURE-CLOSURE**（L0 inventory + Step 0 plan + first-knife plan + NHP + prove CMD · **NOT** flip matrix · **NOT** open DELETE · **NOT** claim deletion closed）  
**Critical stack pin（`adr-postgres-retained.md`）**: Retained sole = **Postgres (+pgvector + PostgresSaver)** · **Ban** MySQL business cutover · **Ban** Qdrant-as-required-vector · Ban MemorySaver / stub as deletion-closure evidence · STOPPED R5 cutover harnesses remain STOPPED · **N1**: `run-e2e-isolated.mjs` banner still says MySQL+Qdrant+Redis — **named gap** · Ban cite that banner as stack truth  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ UC-E2E-050/051/052 covered this open** · Ban假绿 · Ban invent covered · Ban假关 · Ban flip `releaseEvidence` · Dual PASS ≠ coding · Dual PASS ≠ covered flip · Dual PASS ≠ open DELETE · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban second knife · Ban self-nail · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · PG-retained  
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（r2: e2e-ha PASS · privacy-int FAIL `bfa1189` B4 only · **r3 awaits dual re-review** · Ban self-approve · coordinator dispatches）  
**Must cite**: `apps/api/src/modules/privacy/privacy.controller.ts` · `privacy.service.ts` · `apps/api/test/privacy-erasure-http.proof.ts` · `harness/privacy-erasure-http-503-pin.md` · `architecture/ai/privacy-deletion-sink-inventory.md` · `architecture/current-runtime-truth.md` · `production-readiness-remediation-register.md` · `harness/w3-int-transcript-delete-503-freeze.md` · `packages/domain/src/privacy-authorization.ts` · `packages/db/test/privacy-authorization.proof.ts`（**RED on this branch**）· migrations `0047`/`0058`/`0075`/`0091`/`0096`/`0125`/`0129` · PR **#104** fixture-only fix · matrix §1.0/§1.1 · NHP-050-NEG-01 · GAP-PRIV-02 · BUG-PRIV-503 · Ban cite Line A  
**Slice**: `../uc-e2e-050-052-privacy-erasure.slice.md`  
**Authority**: meetwise — **docs REQUEST r3 only** · Ban secrets / `.env*` · Meridian banned · No force-push · Ban Cloud Agent · Ban self-approve · Ban coding until dual+authorize · Ban apply Step 0 until dual re-PASS + authorize · Ban messaging dual · Ban MySQL/Qdrant cutover · Ban invent covered · Ban open public DELETE · Ban edit shared SSOT this REQUEST — deltas **to be applied at nail** only  
**Honesty**: docs r3 · status `draft:awaiting_pre_exec_dual` · GAP **OPEN** · public DELETE stays **503** · authz baseline **RED** until Step 0 · happy/FAULT terminal request **`pending_external`** · Ban request `completed` · Ban expect reachable request `partial_failed` this knife · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · Ban coding · Ban prove · Ban flip covered · STOP after push

---

## Revision log（r3 · cumulative · how each dual item is addressed）

| ID | Source | How addressed |
|----|--------|---------------|
| **B1** | privacy-int · **CLOSED** at r2/`bfa1189` | Authz prove **RED** · **Step 0** = PR #104 commit **`f0f52bd`** · exact file `packages/db/test/privacy-authorization.proof.ts`（+5/−0）· hard gate EXIT=0 @ committed SHA before erasure code · **Ban apply Step 0 now** |
| **B2** | privacy-int · **CLOSED** at r2/`bfa1189` | Happy terminal **`pending_external`** · Ban `completed` · externals `retention_pending` · full digest · Ban trim |
| **B3** | privacy-int · **CLOSED** at r2/`bfa1189` | Prove **`pnpm uc052:internal-erasure:prove`** · Ban wash `privacy-erasure:prove` |
| **B4** | privacy-int r2 FAIL `bfa1189` · **r3** | FAULT-01 / §3.1(5) no longer expect request `partial_failed`（unreachable under 0096 CASE）· assert target `failed` + request `pending_external`（≠ `completed`）+ other locals admin read=0 + retry re-claimable · named gap **`GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL`** · Ban `partial_failed` as expected reachable request status this knife |
| **C1–C6** | privacy-int | retained（see §3.4） |
| **C-CASECOUNT** | e2e-ha | requiredCaseIds · skip → non-zero EXIT |
| **C-SQL-PER-SINK** | e2e-ha | Per-sink SQL · FAULT-01 → target `failed` + request **`pending_external`**（≠ `completed`）· **not** `partial_failed` |
| **C-ALREADY-ERASED** | e2e-ha | NHP-050-FAULT-05 · request stays `pending_external` if erasure path already open · Ban expect `partial_failed`/`completed` |
| **C-BOUND-HARDEN** | e2e-ha | BOUND-01 lease |
| **C-UNCOMMITTED** | e2e-ha | receipt committed SHA |
| **C-SCRIPT-NAME** | e2e-ha | = B3 |
| **C-MATRIX-NAIL** | e2e-ha | nail only UC-052 deletion / NHP-050-* |
| **C-NON-PG** | e2e-ha | externals never counted erased |
| **Audit-log retention** | e2e-ha | **GAP-PRIV-AUDIT-RETENTION** |
| **N1** | privacy-int | **GAP-E2E-ISO-BANNER-PG-RETAINED** · not Step 0 |

---

## Dual receipts（named · not edited by implementer）

| Expert | Receipt path | Status（as of r2 open） |
|--------|--------------|------------------------|
| `mw-privacy-int` | `../reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-privacy-int.md` | r2 **FAIL** tip `bfa1189`（B1–B3 CLOSED · **B4** open）· awaits r3 re-review |
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-e2e-ha.md` | **PASS** tip `79d9191`（r2）/ prior `dc3e17a` · CONDITIONS folded |

**Note**: Implementer does **not** edit reviewer receipts · Ban自批 · Dual re-PASS ≠ coding · Dual PASS ≠ open DELETE.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Line B L0 docs r3: inventory + **Step 0**（PR #104 fixture）plan + first knife（internal authorized erasure）+ NHP + prove `uc052:internal-erasure:prove` · terminal `pending_external` |
| **What this knife is not** | **Not** coding/prove/Step 0 apply this open · **not** open public DELETE · **not** flip UC covered · **not** wash http prove / old `privacy-erasure:prove` into closure · **not** claim INT-01 cutover · **not** edit shared SSOT · **not** touch Line A |
| **GAP** | `GAP-PRIV-ERASURE-CLOSURE` **OPEN** |
| **Public DELETE** | **Must stay 503** |
| **Authz baseline** | **RED** on this branch until Step 0 lands EXIT=0 |
| **Request `partial_failed`** | **Unreachable** this knife while externals stay `retention_pending`（0096 CASE）· Ban expect |
| **Now** | **`draft:awaiting_pre_exec_dual`**（r3）· Ban coding · Ban prove · Ban apply Step 0 · STOP after push |

---

## 1. Inventory（read-repo · invent nothing）

### 1.1 Matrix status（quoted · SSOT not edited this tip）

**§1.0**:
> `| UC-E2E-050–052 | **partial** | **gap** | **blind** | **blind** | DELETE=503 honesty-pin ≠ 删除闭环 |`

**§1.1**:
> `| UC-E2E-050–052 | kill-switch / 无 PII / 删除导出 | `privacy-erasure:http:prove`（DELETE=503 pin）；`security:prove`；harness `harness/privacy-erasure-http-503-pin.md` + `eval/privacy-erasure-http-503-pin.eval.md` | **partial** / **blocked** | DELETE 必须 503（GAP-PRIV-02）；**本绿≠产品删除闭环**；导出/完整擦除未放行；非 covered |`

UC meanings: **050** kill-switch · **051** no PII logs · **052** deletion + export.

### 1.2 Public DELETE=503 pin

| Piece | Path | Status |
|-------|------|--------|
| Route | `privacy.controller.ts` `@Delete('interview-data/:id')` → 503 | **real · always 503** |
| Service | `privacy.service.ts` `eraseInterviewData` → `interview_erasure_authorization_not_available` | **real fail-closed** |
| Resume DELETE | `@Delete('resume-data')` → 503 | **real fail-closed** |
| Prove | `pnpm privacy-erasure:http:prove` | **pin** · EXIT=0 = still rejecting · **≠ deletion closed** |
| Harness | `harness/privacy-erasure-http-503-pin.md` | docs pin |

### 1.3 INT-TRANSCRIPT / ledger

INT-TRANSCRIPT-00 local issuer/ledger ◐ · **01 blocked** · W3 freeze · `privacy_deletion_target` / `privacy_deletion_receipt`（0091）real schema · HTTP unwired.

### 1.4 Authorization root — **BASELINE RED on this branch（B1）**

| Piece | Path | Honest status |
|-------|------|---------------|
| Issuer source | `packages/domain/src/privacy-authorization.ts` ES256 `iss=meetwise-privacy-authz-v1` | source exists · **≠ prove green** |
| Ledger | `0091_privacy_authorization_issuer.sql` | schema real · issue fn **does not** JWS-verify |
| Prove | `pnpm privacy-authorization:prove` | **RED · EXIT=1** confirmed on this branch · error **`privacy_authorization_target_drift`** · `privacy_authorization_claim_target` RAISE · fixture `packages/db/test/privacy-authorization.proof.ts` ~L460–466：digest/JWS signs `T()`=3 sinks · live insert only `checkpoint_rows` |
| Crypto prove | `pnpm privacy-authorization:crypto:prove` | domain unit · **≠** DB authz baseline green |
| Non-root | `app.principal_user` | **not** destructive identity |

**Ban**: call `privacy-authorization:prove` **real green** / baseline-passed on this branch until Step 0 EXIT=0 at committed SHA.

### 1.5 Sink receipts

| Class | Examples | Status |
|-------|----------|--------|
| INT interview PG（real purge） | `checkpoint_rows` · `interview_job_payload` · `event` · `report` · `ai_graph_run` · `interview_answer_artifact` | real resolvers · public entry 503 |
| External（seeded same request） | `oss` · `redis` · `langfuse` | begin seeds **`retention_pending`**（0096 L207–215）· **no** async confirmer |
| Placeholder | INT `vector` · `memory_event`/`cache`/`trace` | stub / no target |
| Not closed | `user_memory` · `ai_invocation_trace.output` · backups/PITR | gap |
| MEM/CTX account | 0093/0111/0112/0118/0125 | **out of first knife** · first knife **`purpose=interview_data` only**（N2） |

### 1.6 Existing privacy proves（do not wash）

| Script | Honest read |
|--------|-------------|
| `privacy-erasure:http:prove` | 503 pin · ≠ closure |
| `privacy-erasure:prove` | worker **checkpoint** prove · **≠** this knife · Ban mutual cite |
| `privacy-authorization:prove` | **RED** until Step 0 |
| `privacy-erasure-preview:*` | preview ≠ production |
| `memory-vector-chunk-erasure:prove` | one account sink · out of first knife |
| **`uc052:internal-erasure:prove`** | **THIS knife（plan only · not wired）** |

---

## 2. Step 0 — PR #104 authz fixture fix（plan only · Ban apply now）

**Purpose**: Unblock red authz baseline before any erasure coding.

| Item | Value |
|------|-------|
| PR | **#104** `fix(privacy): align lease-takeover proof target set with digest` · head `fix/privacy-authorization-lease-takeover` |
| **Source commit（exact · not yet on branch）** | **`f0f52bd`** / full `f0f52bd337d1e3876d9432f55fa67c0f4dec9bba` · confirmed by privacy-int `bfa1189` · `git show f0f52bd --stat` = fixture-only |
| **Exact files（fixture/test only）** | **`packages/db/test/privacy-authorization.proof.ts`** only（+5/−0 · insert `oss`/`redis` peer targets to match `T()`=3） |
| Hard gate | After land at committed SHA：`pnpm privacy-authorization:prove` **EXIT=0** · receipt with git SHA · `releaseEvidence=false` |
| Scope Ban | **Ban** product/migration/HTTP changes in Step 0 · fixture/test only |
| N1 | **Not** in Step 0（see §7） |
| When | Coding Step 0 **only after** dual re-PASS on r2 + authorize · **Ban apply now** |

---

## 3. Smallest honest first knife（after Step 0 green）

### 3.1 Choice

**Internal authorized erasure**（**not** public HTTP）:
1. Bound to PrivacyAuthorizationIssuer / 0091 snapshot+lease（**not** Bearer alone · **not** `app.principal_user`）
2. **Purpose = `interview_data` only**（N2）
3. Purge in-scope **local** PG sinks with real resolvers；external `oss`/`redis`/`langfuse` remain `retention_pending`
4. Per-sink ledger rows on `privacy_deletion_target` / `privacy_deletion_receipt`
5. Partial **local** sink failure → failing target `status='failed'`（ledger）· request **≠ `completed`**（actually **`pending_external`** under 0096 CASE · Ban expect `partial_failed`）· other local sinks admin read=0 · retry re-claims failed target → erased · request stays `pending_external`
6. Real PG via `run-e2e-isolated` · Ban MemorySaver/MySQL/Qdrant fixtures

### 3.2 Terminal state pin（B2 · verified）

| Rule | Citation | Ruling |
|------|----------|--------|
| Begin seeds external targets | `0096_int_transcript_remaining_sinks.sql` **L207–215**（also 0058 L217–223）`FOREACH … ['oss','redis','langfuse']` → status **`retention_pending`** | External targets **must** stay `retention_pending` this knife · Ban write `local_erased` / `external_confirmed` without async confirmer |
| Completion guard | `0091_privacy_authorization_issuer.sql` **L516–543** `assert_privacy_erasure_request_completed_guard`：`completed` iff **every** target `status='erased'` AND no `external_pending`/`failed_cleanup` receipts | With retention_pending externals present → **cannot** honest-`completed` |
| Reassess CASE order（exact） | `0096_int_transcript_remaining_sinks.sql` **L576–583**：① `pending`/`leased` → `purging` · ② `external_pending` receipt → `pending_external` · ③ **`retention_pending` target → `pending_external`** · ④ `failed_cleanup` receipt → `partial_failed` · ⑤ `failed` target → `partial_failed` · ⑥ ELSE `completed` | Because begin always seeds oss/redis/langfuse as `retention_pending`（L207–215）, branch ③ fires **before** ④/⑤ → request **`partial_failed` unreachable** this knife |
| Named gap | **`GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL`** | At **request** level cannot distinguish 「external pending」vs「local failed」· truth = **per-target** ledger |
| Digest/JWS | Canonical `target_set_digest` covers **full** (sink, resource_hmac) set including externals | **Ban** trimming targets/digest to shrink scope · scope narrow only at **purge** layer |

**HP-050-01 expectation**: request.status = **`pending_external`** · Ban assert `completed` · Ban assert `partial_failed` · local in-scope sinks erased + admin read=0 · externals `retention_pending`.

**Ban**: expect reachable request-level **`partial_failed`** anywhere in this knife（would require clearing all `retention_pending` externals or changing CASE order — out of scope / Ban trim）.

### 3.3 Which UC(s)

| UC | First knife? |
|----|--------------|
| **UC-E2E-052 deletion** | **YES — primary** |
| UC-052 export | **NO** |
| UC-E2E-050 | **NO** |
| UC-E2E-051 | **NO** |

Public DELETE stays **503**.

### 3.4 Success criteria（C1–C6 + e2e-ha Cx · coding gate）

| ID | Criterion |
|----|-----------|
| **C1** | **No new HTTP route**（incl. internal/admin）· call via worker / dedicated DB role · **no re-GRANT** `privacy_begin_checkpoint_erasure` to `app_role`（0096 L224–227 / 0075 REVOKE retained） |
| **C2** | App-layer **JWS verify before consume** · NEG-02 covers forged / expired / consumed-replay / digest-drift / GUC-only-no-snapshot |
| **C3** / **C-SQL-PER-SINK** | Prove uses **admin** connection · per in-scope sink **SELECT count=0** on physical tables · non-target subject counts unchanged · Ban receipt/`deleted_count` alone · FAULT-01：failed target `status='failed'` · request **`pending_external`**（≠ `completed`）· **not** `partial_failed` |
| **C4** | NHP-050-FAULT-03 fence-revive · NHP-050-FAULT-04 epoch/digest drift mid-flight |
| **C5** | NEG-03 at **DB/claim** level：A snapshot cannot claim B target · B sink counts unchanged |
| **C6** / **C-BOUND-HARDEN** | BOUND-01：0091 lease — unexpired exclusive · expired takeover · old token cannot write receipt · no deadlock · single ledger request · no duplicate targets |
| **C-CASECOUNT** | requiredCaseIds asserted · skip → non-zero EXIT |
| **C-ALREADY-ERASED** | NHP-050-FAULT-05 |
| **C-UNCOMMITTED** | receipts record committed SHA · uncommitted ≠ EOR |
| **C-SCRIPT-NAME** | CMD = `uc052:internal-erasure:prove` only |
| **C-MATRIX-NAIL** | nail only UC-052 deletion / NHP-050-* · Ban export/050/051/covered |
| **C-NON-PG** | redis/oss/langfuse/backups/Qdrant never counted erased |
| **Audit retention** | `GAP-PRIV-AUDIT-RETENTION`：audit/deletion-fact rows may remain · content cleared · Ban claim full erasure of audit · Ban wash into covered |

---

## 4. NHP cases（non-happy first · happy last）

Receipt root（plan）: `ai-docs/delivery/receipts/uc050-052-privacy-erasure/` · tracked · redacted · **Line B** + **committed git SHA**.

| ID | Maps | Command（plan） | Expectation |
|----|------|----------------|-------------|
| **NHP-050-FAULT-01** | C-SQL-PER-SINK · **B4** | `pnpm uc052:internal-erasure:prove` | Failing target `status='failed'` visible in ledger · request **≠ `completed`**（actually **`pending_external`**）· **Ban** expect request `partial_failed` · other local sinks admin SELECT read=0 · on retry failed target re-claimable → becomes `erased` · request stays **`pending_external`** |
| **NHP-050-FAULT-02** | idempotency | same | Second run no double effects · receipts/target ids stable |
| **NHP-050-FAULT-03** | C4 | same | After purge，worker revive write rejected by 0058/0059 fence · admin read still 0 |
| **NHP-050-FAULT-04** | C4 | same | Mid-flight privacy_epoch / digest drift → refuse further purge · request **≠ `completed`**（stays **`pending_external`** if begin already seeded externals）· Ban expect `partial_failed` · no false completed |
| **NHP-050-FAULT-05** | C-ALREADY-ERASED | same | Already-erased subject re-request：idempotent no-op or safe refuse · no double purge · if request row exists stays **`pending_external`** · Ban expect `completed` / `partial_failed` |
| **NHP-050-NEG-02** | C2 | same | Unauthorized：forged/expired/replay/digest-drift/GUC-only → refuse · **zero** side effects |
| **NHP-050-NEG-03** | C5 | same | Cross-tenant at **DB/claim**：A cannot claim B target · B counts unchanged |
| **NHP-050-BOUND-01** | C6 / C-BOUND-HARDEN | same | Concurrent + lease semantics · single winner · no deadlock · single ledger · old token cannot write receipt |
| **NHP-050-NEG-01** | retained pin | `pnpm privacy-erasure:http:prove` | Public DELETE **still 503** |
| **HP-050-01** | B2 happy | `pnpm uc052:internal-erasure:prove` | Authorized internal erase · local sinks admin read=0 · externals `retention_pending` · request **`pending_external`** · Ban `completed` · ≠ public DELETE open · ≠ UC covered |

---

## 5. Prove CMD plan（B3）

| CMD | Role |
|-----|------|
| **`pnpm uc052:internal-erasure:prove`** | THIS knife · `run-e2e-isolated` → raw · EXIT=0 **iff** all §4 NHP + HP hold · C-CASECOUNT · C-SQL-PER-SINK · C-UNCOMMITTED · PG only · Ban MemorySaver/MySQL/Qdrant |
| `pnpm privacy-erasure:http:prove` | retained 503 regression · **≠** this knife |
| `pnpm privacy-erasure:prove` | **different** checkpoint worker prove · **Ban** mutual cite / wash |
| `pnpm privacy-authorization:prove` | Step 0 hard gate · must be EXIT=0 @ committed SHA **before** erasure coding |

---

## 6. What stays gap

- Public **DELETE=503**
- External OSS/Redis/Langfuse async confirm · backups · `user_memory` · `ai_invocation_trace.output` · INT `vector`
- **Export**（UC-052）· **UC-050** · **UC-051** covered claims
- **HA** / `releaseEvidence=true`
- INT-TRANSCRIPT-**01** cutover
- **`GAP-PRIV-AUDIT-RETENTION`**（audit fact retention vs content erasure）
- **`GAP-E2E-ISO-BANNER-PG-RETAINED`**（N1）
- **`GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL`**（B4 · request status masks local fail behind `pending_external`）
- Matrix §1.1 covered / unblock blocked
- Shared SSOT until nail

---

## 7. N1 — isolation banner vs PG-retained ADR

| Item | Value |
|------|-------|
| Location | `scripts/run-e2e-isolated.mjs` **L1606**：`(sole stack = MySQL+Qdrant+Redis)` inside `[R5-MARKED-RED]` warn（also related L5–6 · L1515 · L1542 · L1559 · L1921） |
| Decision | **Named gap** `GAP-E2E-ISO-BANNER-PG-RETAINED` · **not** Step 0 |
| Why not Step 0 | Not trivial banner-only：SOLE_STACK / G3 allowlist semantics still encode MySQL+Qdrant across multiple sites · one-string edit would be dishonest without ADR-aligned SOLE_STACK work |
| Line B rule | Receipts **must not** cite that banner as stack truth · cite `adr-postgres-retained.md` |

---

## 8. Planned SSOT deltas（**nail only** · Ban edit this REQUEST）

| File | Planned at nail |
|------|-----------------|
| `e2e-requirement-coverage-matrix.md` | Honesty：Line B · keep DELETE=503 · **only** UC-052 deletion / NHP-050-* elevate case-only→partial if proved · Ban covered · Ban export/050/051 |
| `gap-bug-backlog.md` | Register Step 0 / GAP-PRIV-ERASURE-CLOSURE facets · retain GAP-PRIV-02 · add GAP-E2E-ISO-BANNER-PG-RETAINED · GAP-PRIV-AUDIT-RETENTION · **GAP-PRIV-REQUEST-STATUS-MASKS-LOCAL-FAIL** |
| `non-happy-path-perf-load-case-matrix.md` | Register FAULT-02…05 / NEG-02/03 / BOUND-01 |
| `e2e-covered-path-backlog.md` | Internal erasure ≠ 050–052 covered |
| `execution-master-checklist.md` | Honesty pointer only · Ban INT-01 / controlPlaneClosed |

---

## 9. Pins（retained）

| Pin | Value |
|-----|-------|
| Line | **B** |
| Revision | **r3** |
| Base SHA | **`f07663a`** / `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379` |
| Status | **`draft:awaiting_pre_exec_dual`** |
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |
| Happy / FAULT request terminal | **`pending_external`** · Ban `completed` · Ban expect reachable `partial_failed` |
| Prove CMD | **`uc052:internal-erasure:prove`** |
| Line A | **untouched** |

---

## 10. Lifecycle

| Phase | This open |
|-------|-----------|
| **L0** | REQUEST open · r3 revision · **current** |
| **L1** | Dual re-review on r3 · awaiting |
| **Step 0** | After dual re-PASS + authorize · PR #104 fixture only · authz EXIT=0 |
| **L2+** | Erasure coding/prove only after Step 0 green + authorize |

STOP after push · no messaging dual · no coding · no Step 0 apply.

---

## Addendum 2026-09-23 PT · post-prove C-HARNESS-FAULT04（append-only · do not rewrite §4 L209）

**Source**: mw-e2e-ha post-prove `088cf51` @ prove tip `6d6e11b`.

| ID | Correction |
|----|------------|
| **NHP-050-FAULT-04** | Real terminal after mid-flight epoch/digest drift **refuse** (locals still `pending`/`leased`, no purge) is request status **`purging`**, not `pending_external`. Cite `0096_int_transcript_remaining_sinks.sql` **L576–583** CASE arm ①：`pending`/`leased` → `purging` **before** arm ③ `retention_pending` → `pending_external`. Externals may already be `retention_pending`; CASE priority still yields **`purging`**. Ban `completed` · Ban `partial_failed`. Prove must assert `status==='purging'` + locals remain `pending` + externals `retention_pending` + claim refused. |

Prior §4 table row L209 text retained for history; this addendum is authoritative for FAULT-04 terminal.

