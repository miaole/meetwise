# Harness — **UC-E2E-050–052 privacy erasure**（Line B · r2 · `GAP-PRIV-ERASURE-CLOSURE` · public DELETE=503 honesty pin ≠ deletion closure · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Dual experts **`mw-privacy-int` + `mw-e2e-ha`** · **Ban** open public DELETE · **Ban** invent covered · **Ban** wash 503 pin into deletion closed · **Ban** cite Line A / UC-018 evidence · **Ban** MySQL/Qdrant cutover · **Ban** claim suite green / HA）

**Line**: **B**（privacy UC-E2E-050–052 · parallel allowed · **must not** touch Line A files `uc-e2e-018-*` / `scripts/lib/uc-covered-evaluator*` / `uc018*` proves）  
**Revision**: **r2**（2026-09-23 ~20:20 PT · addresses pre-exec dual: mw-e2e-ha PASS `dc3e17a` w/ CONDITIONS · mw-privacy-int FAIL `2bbebff` blockers B1–B3 + C1–C6 · Ban coding until dual re-PASS）  
**Status**: **`draft:awaiting_pre_exec_dual`**（r2 修订 · **awaiting dual re-review** · **Ban自批 pass** · Dual PASS ≠ coding · Dual PASS ≠ UC-E2E-050/051/052 covered · Dual PASS ≠ open public DELETE · Dual PASS ≠ next knife auto-authorize · **≠ coding** · **≠ prove** this open · **≠ apply Step 0 now**）  
**Date**: 2026-09-23 (~20:20 PT)  
**Base / parent tip**: REQUEST parent **`f07663a`** / full `f07663ae6b3279eaa9aa1ec9dca2216a62ff4379`（**must remain ancestor**）· L0 tip `cd5a4de` · dual tips `dc3e17a` / `2bbebff` · branch `feat/mysql-schema-skeleton`（**historical name only** · Ban MySQL cutover justification）  
**Knife name**: **UC-E2E-050–052 privacy erasure · GAP-PRIV-ERASURE-CLOSURE**（L0 inventory + Step 0 plan + first-knife plan + NHP + prove CMD · **NOT** flip matrix · **NOT** open DELETE · **NOT** claim deletion closed）  
**Critical stack pin（`adr-postgres-retained.md`）**: Retained sole = **Postgres (+pgvector + PostgresSaver)** · **Ban** MySQL business cutover · **Ban** Qdrant-as-required-vector · Ban MemorySaver / stub as deletion-closure evidence · STOPPED R5 cutover harnesses remain STOPPED · **N1**: `run-e2e-isolated.mjs` banner still says MySQL+Qdrant+Redis — **named gap** · Ban cite that banner as stack truth  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ UC-E2E-050/051/052 covered this open** · Ban假绿 · Ban invent covered · Ban假关 · Ban flip `releaseEvidence` · Dual PASS ≠ coding · Dual PASS ≠ covered flip · Dual PASS ≠ open DELETE · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban second knife · Ban self-nail · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · PG-retained  
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（pre-exec: e2e-ha PASS `dc3e17a` · privacy-int FAIL `2bbebff` · **r2 awaits dual re-review** · Ban self-approve · coordinator dispatches）  
**Must cite**: `apps/api/src/modules/privacy/privacy.controller.ts` · `privacy.service.ts` · `apps/api/test/privacy-erasure-http.proof.ts` · `harness/privacy-erasure-http-503-pin.md` · `architecture/ai/privacy-deletion-sink-inventory.md` · `architecture/current-runtime-truth.md` · `production-readiness-remediation-register.md` · `harness/w3-int-transcript-delete-503-freeze.md` · `packages/domain/src/privacy-authorization.ts` · `packages/db/test/privacy-authorization.proof.ts`（**RED on this branch**）· migrations `0047`/`0058`/`0075`/`0091`/`0096`/`0125`/`0129` · PR **#104** fixture-only fix · matrix §1.0/§1.1 · NHP-050-NEG-01 · GAP-PRIV-02 · BUG-PRIV-503 · Ban cite Line A  
**Slice**: `../uc-e2e-050-052-privacy-erasure.slice.md`  
**Authority**: meetwise — **docs REQUEST r2 only** · Ban secrets / `.env*` · Meridian banned · No force-push · Ban Cloud Agent · Ban self-approve · Ban coding until dual+authorize · Ban apply Step 0 until dual re-PASS + authorize · Ban messaging dual · Ban MySQL/Qdrant cutover · Ban invent covered · Ban open public DELETE · Ban edit shared SSOT this REQUEST — deltas **to be applied at nail** only  
**Honesty**: docs r2 · status `draft:awaiting_pre_exec_dual` · GAP **OPEN** · public DELETE stays **503** · authz baseline **RED** until Step 0 · happy terminal **`pending_external`** · Ban `completed` · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · Ban coding · Ban prove · Ban flip covered · STOP after push

---

## Revision log（r2 · how each dual item is addressed）

| ID | Source | How addressed in r2 |
|----|--------|---------------------|
| **B1** | privacy-int FAIL | Authz prove marked **RED** · confirmed EXIT=1 `privacy_authorization_target_drift` · **Step 0** = bring PR #104 fixture-only fix · hard gate EXIT=0 @ committed SHA **before** any erasure code · **Ban apply Step 0 now** |
| **B2** | privacy-int FAIL | Happy terminal pinned **`pending_external`** · Ban `completed` · external sinks only `retention_pending` · full canonical digest/JWS · Ban trim targets · cites 0096/0091 file:line |
| **B3** | privacy-int FAIL + e2e-ha C-SCRIPT-NAME | Prove renamed everywhere to **`pnpm uc052:internal-erasure:prove`** · Ban alias to / wash from `privacy-erasure:prove` |
| **C1** | privacy-int | Success criteria: **no new HTTP route** · **no re-GRANT** `privacy_begin_checkpoint_erasure` to `app_role`（0075/0096 REVOKE retained） |
| **C2** | privacy-int | JWS verify **before** consume · NEG-02 subcases: forged / expired / replay-consumed / digest-drift / GUC-only |
| **C3** | privacy-int + C-SQL-PER-SINK | Admin per-sink SELECT read=0 · Ban `deleted_count`/receipt-only evidence |
| **C4** | privacy-int | New **NHP-050-FAULT-03** fence-revive + **NHP-050-FAULT-04** epoch/digest drift |
| **C5** | privacy-int | NEG-03 rewritten at **DB/claim** level（not HTTP 401/403/404） |
| **C6** | privacy-int + C-BOUND-HARDEN | BOUND-01 cites 0091 **lease** semantics（unexpired exclusive · expired takeover · old token cannot write receipt）+ no deadlock / single ledger |
| **C-CASECOUNT** | e2e-ha | Prove asserts requiredCaseIds/count · skip any NHP → non-zero EXIT |
| **C-SQL-PER-SINK** | e2e-ha | Per-sink physical table + SQL + ledger status · FAULT-01 → target `failed` + request `partial_failed` |
| **C-ALREADY-ERASED** | e2e-ha | **NHP-050-FAULT-05** already-erased subject re-request |
| **C-BOUND-HARDEN** | e2e-ha | Mapped into BOUND-01 expectations |
| **C-UNCOMMITTED** | e2e-ha | Receipts record committed git SHA · uncommitted runner ≠ evidence of record |
| **C-SCRIPT-NAME** | e2e-ha | = B3 rename |
| **C-MATRIX-NAIL** | e2e-ha | Nail plan: only UC-052 deletion / NHP-050-* · Ban export/050/051/covered · 503 retained |
| **C-NON-PG** | e2e-ha | Non-PG sinks stay gap · never counted as erased |
| **Audit-log retention** | e2e-ha missing note | **GAP-PRIV-AUDIT-RETENTION** named · deletion facts may retain · content cleared · not first-knife closure · Ban wash into covered |
| **N1** | privacy-int | Banner `scripts/run-e2e-isolated.mjs:1606` · **named gap** `GAP-E2E-ISO-BANNER-PG-RETAINED` · **not** Step 0（not trivial one-line；SOLE_STACK semantics multi-site）· Ban cite as stack truth |

---

## Dual receipts（named · not edited by implementer）

| Expert | Receipt path | Status（as of r2 open） |
|--------|--------------|------------------------|
| `mw-privacy-int` | `../reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-privacy-int.md` | **FAIL** tip `2bbebff` · awaits r2 re-review |
| `mw-e2e-ha` | `../reviews/REQUEST-2026-09-23-uc-e2e-050-052-privacy-erasure-mw-e2e-ha.md` | **PASS** tip `dc3e17a` w/ CONDITIONS · CONDITIONS folded into r2 |

**Note**: Implementer does **not** edit reviewer receipts · Ban自批 · Dual re-PASS ≠ coding · Dual PASS ≠ open DELETE.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Line B L0 docs r2: inventory + **Step 0**（PR #104 fixture）plan + first knife（internal authorized erasure）+ NHP + prove `uc052:internal-erasure:prove` · terminal `pending_external` |
| **What this knife is not** | **Not** coding/prove/Step 0 apply this open · **not** open public DELETE · **not** flip UC covered · **not** wash http prove / old `privacy-erasure:prove` into closure · **not** claim INT-01 cutover · **not** edit shared SSOT · **not** touch Line A |
| **GAP** | `GAP-PRIV-ERASURE-CLOSURE` **OPEN** |
| **Public DELETE** | **Must stay 503** |
| **Authz baseline** | **RED** on this branch until Step 0 lands EXIT=0 |
| **Now** | **`draft:awaiting_pre_exec_dual`**（r2）· Ban coding · Ban prove · Ban apply Step 0 · STOP after push |

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
| External（seeded same request） | `oss` · `redis` · `langfuse` | begin seeds **`retention_pending`**（0096 L207–214）· **no** async confirmer |
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
| PR | **#104** `fix(privacy): align lease-takeover proof target set with digest` · head `fix/privacy-authorization-lease-takeover` · commit `f0f52bd` |
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
5. Partial failure → no false erased/completed · request `partial_failed` · retry resumes
6. Real PG via `run-e2e-isolated` · Ban MemorySaver/MySQL/Qdrant fixtures

### 3.2 Terminal state pin（B2 · verified）

| Rule | Citation | Ruling |
|------|----------|--------|
| Begin seeds external targets | `0096_int_transcript_remaining_sinks.sql` **L207–214**（also 0058 L217–223）`FOREACH … ['oss','redis','langfuse']` → status **`retention_pending`** | External targets **must** stay `retention_pending` this knife · Ban write `local_erased` / `external_confirmed` without async confirmer |
| Completion guard | `0091_privacy_authorization_issuer.sql` **L516–543** `assert_privacy_erasure_request_completed_guard`：`completed` iff **every** target `status='erased'` AND no `external_pending`/`failed_cleanup` receipts | With retention_pending externals present → **cannot** honest-`completed` |
| Reassess path | `0096` L575–583：presence of `retention_pending` / `external_pending` → request **`pending_external`** | First-knife **happy terminal = `pending_external`** |
| Digest/JWS | Canonical `target_set_digest` covers **full** (sink, resource_hmac) set including externals | **Ban** trimming targets/digest to shrink scope · scope narrow only at **purge** layer |

**HP-050-01 expectation**: request.status = **`pending_external`** · Ban assert `completed` · local in-scope sinks erased + admin read=0 · externals `retention_pending`.

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
| **C3** / **C-SQL-PER-SINK** | Prove uses **admin** connection · per in-scope sink **SELECT count=0** on physical tables · non-target subject counts unchanged · Ban receipt/`deleted_count` alone |
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
| **NHP-050-FAULT-01** | C-SQL-PER-SINK | `pnpm uc052:internal-erasure:prove` | One local sink fails → target `failed` · request **`partial_failed`** · **no** false erased/completed · retry resumes |
| **NHP-050-FAULT-02** | idempotency | same | Second run no double effects · receipts/target ids stable |
| **NHP-050-FAULT-03** | C4 | same | After purge，worker revive write rejected by 0058/0059 fence · admin read still 0 |
| **NHP-050-FAULT-04** | C4 | same | Mid-flight privacy_epoch / digest drift → refuse further purge · no false completed |
| **NHP-050-FAULT-05** | C-ALREADY-ERASED | same | Already-erased subject re-request：idempotent no-op or safe refuse · no double purge |
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
| `gap-bug-backlog.md` | Register Step 0 / GAP-PRIV-ERASURE-CLOSURE facets · retain GAP-PRIV-02 · add GAP-E2E-ISO-BANNER-PG-RETAINED · GAP-PRIV-AUDIT-RETENTION |
| `non-happy-path-perf-load-case-matrix.md` | Register FAULT-02…05 / NEG-02/03 / BOUND-01 |
| `e2e-covered-path-backlog.md` | Internal erasure ≠ 050–052 covered |
| `execution-master-checklist.md` | Honesty pointer only · Ban INT-01 / controlPlaneClosed |

---

## 9. Pins（retained）

| Pin | Value |
|-----|-------|
| Line | **B** |
| Revision | **r2** |
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
| Happy terminal | **`pending_external`** · Ban `completed` |
| Prove CMD | **`uc052:internal-erasure:prove`** |
| Line A | **untouched** |

---

## 10. Lifecycle

| Phase | This open |
|-------|-----------|
| **L0** | REQUEST open · r2 revision · **current** |
| **L1** | Dual re-review on r2 · awaiting |
| **Step 0** | After dual re-PASS + authorize · PR #104 fixture only · authz EXIT=0 |
| **L2+** | Erasure coding/prove only after Step 0 green + authorize |

STOP after push · no messaging dual · no coding · no Step 0 apply.
