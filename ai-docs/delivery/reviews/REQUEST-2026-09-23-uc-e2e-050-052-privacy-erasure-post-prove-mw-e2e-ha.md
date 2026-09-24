# REQUEST — UC-E2E-050–052 privacy erasure · **POST-PROVE** · mw-e2e-ha

**Expert**: `mw-e2e-ha`（adversarial E2E / isolated-prove · POST-PROVE dual）  
**Pair**: `mw-privacy-int`（**不代签** · alone≠dual）  
**Date**: 2026-09-23 (~20:43 PT)  
**Line**: **B** · knife UC-052 internal authorized erasure  
**Scope**: `/workspace/meetwise` only · branch `feat/mysql-schema-skeleton` · Ban Meridian · Ban `.env*` · Ban product code edits  
**Harness**: `ai-docs/delivery/harness/uc-e2e-050-052-privacy-erasure.md`（r3 @`1f263f7` pre-exec PASS）  
**Prove tip**: `6d6e11bc123eccf78c968e927b79a7e41f2118d6` / `6d6e11b`  
**Receipt tip claimed**: `b0db484975f54195122bce3bba29f4380c270d32` / `b0db484`  
**Step 0 tip**: `4643c02d4a7ca946ae93695ef791195aa212f0f2` / `4643c02`

---

## 0. Verdict（top）

| Key | Value |
|-----|-------|
| **Verdict** | **FAIL** |
| **blockers** | **B1** — committed prove introduces **+25** `tsc` errors in `packages/db/test/uc052-internal-erasure.proof.ts`（baseline `4643c02` = 6 pre-existing · knife = 31 · delta all in this prove）。typecheck regression in committed prove = not green |
| **conditions** | **C-HARNESS-FAULT04** · **C-UNCOMMITTED-GUARD** · **C-FAULT05-LEDGER** · **C-FAULT04-ASSERT-SOFT** · **C-FAULT02-TARGET-IDS**（见 §4） |
| **authorizeNail** | **false** · Ban flip covered · Ban open DELETE |
| **claimUc050051052Covered** | **false** · only UC-052 deletion may move case-only→partial **after dual PASS** · this review = FAIL |
| **openPublicDelete** | **false** · DELETE **503** retained（NEG-01） |
| **haStatus** | **NOT_HA** |
| **releaseEvidence** | **false** |
| **claimProductionHA** | **false** |
| **gR45Closed** | **true** retained |
| **coveredCount** | **8** retained |
| **ms3EqualsR4Closed** | **false** retained |
| **PG-retained** | **true** · stack path = pgvector-legacy via `run-e2e-isolated` · Ban cite R5 MySQL+Qdrant banner as sole-stack truth |
| **alone≠dual** | **true** · privacy-int must rule separately |

**3-line 中文摘要**:
1. 孤立 prove 两次 EXIT=0、用例全绿、共享 runner 未炸其它 prove；但 `tsc -p packages/db` 相对 Step0 新增 25 条全在本刀 prove → **B1 blocker → FAIL**。
2. FAULT-04 真实终态是 `purging`（0096 CASE：locals 仍 pending 优先于 externals retention_pending）；harness L209 写 `pending_external` 过时，应 append-only 修正（**条件**非代码 bug）。
3. pins 全保留；alone≠dual；Ban nail / Ban 开 DELETE / Ban 洗 covered。

---

## 1. Ancestry / commits（Task 1）

| Check | Result | EXIT |
|-------|--------|------|
| `git fetch` | ok | 0 |
| ancestry `4643c02 → 3a60a82 → 285497a → da4f0be → 6d6e11b → b0db484` | all `merge-base --is-ancestor` **0** | 0 |
| all on `origin/feat/mysql-schema-skeleton` | **yes** | 0 |
| `git diff 6d6e11b b0db484 --stat` | **docs/receipts only** · 2 files · +128 | 0 |

### Files per code commit

| SHA | Subject | Files |
|-----|---------|-------|
| `4643c02` | Step 0 lease-takeover proof target set | `packages/db/test/privacy-authorization.proof.ts` (+5) |
| `3a60a82` | UC052 internal erasure + prove | `package.json` · `packages/db/package.json` · `packages/db/src/index.ts` · `packages/db/src/uc052-internal-erasure.ts` · `packages/db/test/uc052-internal-erasure.proof.ts` · `scripts/run-e2e-isolated.mjs` |
| `285497a` | seed ai_graph_run via asPrincipal | prove only |
| `da4f0be` | two-phase begin/attach then authorize purge | src + prove |
| `6d6e11b` | consume in short executor txn | src + prove |
| `b0db484` | docs receipts EXIT=0 | evidence.json + prove.md |

---

## 2. CMD \| EXIT（Task 2 · clean worktrees）

Worktrees: `/workspace/mw-rv-4643c02` @`4643c02` · `/workspace/mw-rv-6d6e11b` @`6d6e11b` · removed after.

| CMD | Where | EXIT | Notes |
|-----|-------|------|-------|
| `pnpm install --frozen-lockfile` | mw-rv-4643c02 | **0** | |
| `pnpm privacy-authorization:prove` | mw-rv-4643c02 | **0** | Step 0 · 52 PASS · lease takeover incl. |
| `pnpm install --frozen-lockfile` | mw-rv-6d6e11b | **0** | |
| `pnpm uc052:internal-erasure:prove` | mw-rv-6d6e11b #1 | **0** | all REQUIRED + C-CASECOUNT PASS · FAULT-04 `req=purging` · FAULT-05 `second=created` · BOUND winners=1 · gitSha=`6d6e11b…` |
| `pnpm uc052:internal-erasure:prove` | mw-rv-6d6e11b #2 stability | **0** | identical case set · stable |
| `pnpm uc018:adv:prove` | mw-rv-6d6e11b | **0** | 76 ADV cases · shared runner edit OK |
| `pnpm uc018:sole:prove` | mw-rv-6d6e11b | **0** | cheap · OK |
| `pnpm privacy-erasure:prove`（old） | mw-rv-6d6e11b | **0** | pass_count=2 · Ban wash as UC052 |
| `pnpm exec tsc -p tsconfig.json --noEmit` | packages/db @`4643c02` | **2** | **6** errors（pre-existing · 0 in uc052） |
| `pnpm exec tsc -p tsconfig.json --noEmit` | packages/db @`6d6e11b` | **2** | **31** errors · **+25 all in `test/uc052-internal-erasure.proof.ts`** · src/uc052 0 |
| `git status --porcelain` | both WTs + main after | **0** | clean（empty） |
| worktree remove ×2 | | **0** | |

### Case results（reviewer re-run #1 · EXIT 0）

| id | result | detail |
|----|--------|--------|
| NHP-050-FAULT-01 | PASS | req=pending_external report=failed event=0 graph=0 · retry→erased |
| NHP-050-FAULT-02 | PASS | replayed=true req=pending_external |
| NHP-050-FAULT-03 | PASS | lateRejected=true req=pending_external |
| NHP-050-FAULT-04 | PASS | claimRejected=true **req=purging** |
| NHP-050-FAULT-05 | PASS | second=**created** req=pending_external · events=0 |
| NHP-050-NEG-02 | PASS | noSnap · forgedNull · counts unchanged |
| NHP-050-NEG-03 | PASS | crossRejected · bEvents=2（SQL intact） |
| NHP-050-BOUND-01 | PASS | winners=1 a=true b=false eventTargets=1 |
| NHP-050-NEG-01 | PASS | httpStatus=503 · app_role EXECUTE begin_checkpoint=false |
| HP-050-01 | PASS | pending_external · locals erased · externals retention_pending · SQL counts 0 |
| C-CASECOUNT | PASS | all present |

---

## 3. Per-condition source review（Task 3 · `git show 6d6e11b:<path>`）

### C-CASECOUNT — **PASS（logic）**
- `REQUIRED_CASES` L28–39 · end assert L443–445：`missing = REQUIRED_CASES.filter(c => !seen.has(c))` · `A('C-CASECOUNT', missing.length===0)` · `failures` → `process.exit(1)`。
- Skip/missing → non-zero EXIT（not print-only）。OK。

### C-SQL-PER-SINK — **PASS（with notes）**
- Admin pool `createPool()` · concrete SQL：
  - `interview_event` count by `stream_key`（proof L119–121）
  - `ai_graph_run` count by `thread_id`（L123–125）
  - report aggregate：`ai_report`+`assessment_report`+`learning_plan`+`learning_progress`+`career_path`+`question_feedback`（L127–137）
- Ledger：FAULT-01 `privacy_deletion_target.status='failed'` + request `pending_external`（L189–194）；HP locals `erased` + externals `retention_pending`（L428–439）。
- **per-sink admin read=0** = **SQL COUNT on real tables**（not API）。NEG-01 is service method throw 503（not HTTP server）+ `has_function_privilege` SQL。
- Printed `perSinkSql.report`（L458）only names `ai_report` — actual assert uses 6-table aggregate（honesty soft）。

### C-ALREADY-ERASED（FAULT-05）— **CONDITION soft**
- L280–296：re-erase may `created` or `refused`；asserts events stay 0 + first request `pending_external`。
- Observed `second=created` → **new request row allowed**；**no** assert on request-count / no duplicate targets across requests。Harness「ledger not duplicated」弱于「no double purge」。见 C-FAULT05-LEDGER。

### C-BOUND-HARDEN — **PASS**
- L385–393：`Promise.all` 两路 `asPrivacyWorkerPrincipal` → 各 `pool.connect()`（`principal.ts` L878–879）= **独立连接**。
- `winners.length === 1 && nTargets === 1` 从 claim 返回 + DB targets。无吞超时。OK。

### C-UNCOMMITTED — **CONDITION**
- proof L174：仅 `git rev-parse HEAD` 打印/`JSON gitSha`。
- Evidence JSON `runnerGitSha=6d6e11b…` 与 prove tip 一致；**无** dirty/`git status --porcelain` refuse guard。见 C-UNCOMMITTED-GUARD。

### C-NON-PG — **PASS**
- HP L430–431：oss/redis/langfuse **must** `status==='retention_pending'`；localsOk 不含它们。Ban counted erased。OK。

### NEG-01 / NEG-02 / NEG-03 — **PASS**
- NEG-01 L396–418：`PrivacyService.eraseInterviewData` → 503 + code `interview_erasure_authorization_not_available` + app_role EXECUTE false。
- NEG-02 L299–321：GUC-only claim refuse · forged JWS null · event count unchanged。
- NEG-03 L324–356：cross-tenant claim refuse · **SQL** `eventCount(ivB)===2`。OK。

### Fail-open hunt
- `rejects()` catch-all：仅负向期望。OK。
- `?? -1` on counts：fail-closed（≠0）。OK。
- 无 `?? true` / `if (!db) return` / env-gated case skip。
- FAULT-01 `failSink` 合成 `UPDATE … status='failed'`（src L210–216）：显式故障注入，非 fail-open。
- FAULT-02 `void targets2`：未比 targetId 集（弱）。见 C-FAULT02-TARGET-IDS。

### Receipts `b0db484` — **PASS redaction**
- evidence.json：无 DSN/token；`dataHandling` 声明；`runnerGitSha`/`cases`/`bound01`/`pins`/`releaseEvidence:false` 齐。OK。

### Shared `run-e2e-isolated.mjs` @`3a60a82`
- Additive only：receipt sources + allowlist + migrate-if + command map for `uc052:internal-erasure:prove:raw`。
- Regression check：uc018:adv / uc018:sole / privacy-erasure:prove / privacy-authorization:prove 均 EXIT 0。OK。

---

## 4. Disclosure rulings（Task 4）

### (1) FAULT-04 ends at `purging` vs harness L209 `pending_external`
- **Ruling**: **`purging` is the correct real terminal** for refuse-mid-flight when locals remain `pending`/`leased`。
- Evidence：0096 L576–583 CASE（`git show 6d6e11b:packages/db/migrations/0096_…`）· mirrored src `reassessRequestStatus` L127–133 · first arm = pending/leased → `purging` **before** retention_pending → `pending_external`。
- Prove assert L275–276：`claimRejected && status !== 'completed' && status !== 'partial_failed'`（**does not** require `pending_external`）· live output `req=purging` · receipt discloses honesty。
- Refuse proved by **`claimRejected=true`**（epoch 99 snapshot vs request epoch 6）。
- **Harness L209 is stale**（「stays pending_external if begin already seeded externals」ignores CASE priority）。**Must append-only correct** harness to FAULT-04 → `purging`。
- **Not a code bug / not masked failure** · **CONDITION = C-HARNESS-FAULT04**（not B-blocker）。Soft follow-up：assert `status === 'purging'` + locals still pending（**C-FAULT04-ASSERT-SOFT**）。

### (2) New tsc errors in prove
- Baseline `4643c02`：6 errors（qbank-handoff×2 · privacy-erasure-preview×1 · domain×3）。
- Knife `6d6e11b`：31 errors · **+25** all `test/uc052-internal-erasure.proof.ts`：
  - Pool passed where `admin: Client`（=`PoolClient`）required（API typing + prove）
  - TS2367 after `status === 'pending_external'` then `!== 'completed'|'partial_failed'`
- src `uc052-internal-erasure.ts`：**0** tsc errors。
- **Ruling**: **BLOCKER B1**（agree with lean：committed prove typecheck regression = not green）。

### (3) checkpoint_rows fence-only
- Disclosed proof L459 + receipt：「fence-only … no physical checkpoint purge this knife」。
- Not in `localsOk` erased set。**CONDITION met / not counted erased**。OK · retain as named honesty。

### (4) Shared runner edit
- Diff additive · sibling proves EXIT 0。**No blocker**。

---

## 5. Blockers / Conditions / Pins / Matrix

### Blockers
| ID | Item |
|----|------|
| **B1** | `tsc -p packages/db` regression **+25** in committed `uc052-internal-erasure.proof.ts`（6→31）。Fix typing（admin: Pool\|Client / DbPool）+ dead comparisons before re-prove / dual re-PASS。 |

### Conditions（non-blocking if B1 fixed；must track）
| ID | Item |
|----|------|
| **C-HARNESS-FAULT04** | Append-only harness L209：FAULT-04 terminal = **`purging`**（0096 CASE）≠ `pending_external` |
| **C-FAULT04-ASSERT-SOFT** | Prefer assert `status==='purging'` + pending locals remain |
| **C-UNCOMMITTED-GUARD** | Prove should refuse dirty worktree（porcelain）for C-UNCOMMITTED |
| **C-FAULT05-LEDGER** | FAULT-05 observed `second=created`；strengthen「no duplicate ledger」or document multi-request OK if no double purge |
| **C-FAULT02-TARGET-IDS** | Compare replay targetId set（currently `void targets2`） |

### Pins（retained）
`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · public DELETE=503 · alone≠dual

### Matrix
- **Only** UC-052 deletion column may move case-only→partial **after dual PASS**（this review FAIL → **no move**）。
- Ban export / UC-050 / UC-051 / covered flip。

---

## 6. Tips（next implementer）

1. Fix **B1** first：widen `admin` to `DbPool`（or accept Pool）in `uc052-internal-erasure.ts` + prove；drop redundant `status !== completed` after `=== pending_external`（or compare via variable typed `string`）。Re-run `pnpm exec tsc -p packages/db --noEmit` · knife file errors must be **0** new。
2. Append-only harness r4 note：FAULT-04 → `purging`；cite 0096 L578 first arm。
3. Optional harden FAULT-05 request-count / FAULT-02 targetIds / dirty-tree guard。
4. Ban self-nail · Ban open DELETE · await privacy-int dual · Ban cite this FAIL as green。

---

*mw-e2e-ha · POST-PROVE · Verdict **FAIL** · B1 tsc · tips above · Ban 代签 privacy-int*
