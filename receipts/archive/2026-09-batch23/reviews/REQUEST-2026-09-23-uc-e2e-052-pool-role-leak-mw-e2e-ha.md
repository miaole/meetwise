# REQUEST — **GAP-UC052-POOL-ROLE-LEAK** · pre-exec · mw-e2e-ha

**Status**: **PASS** / `draft:awaiting_pre_exec_dual`（pre-exec filled · Ban自批 coding · alone≠dual · conditions bind）  
**Line**: **B**  
**Expert**: `mw-e2e-ha`  
**Pair**: peer stub（alone ≠ dual · 不代签）  
**Knife**: `harness/uc-e2e-052-pool-role-leak.md` · slice `uc-e2e-052-pool-role-leak.slice.md`  
**Base SHA（REQUEST parent）**: **`913f21d`** / full `913f21d34a427df8cfa85bd73ddaf19f4c7c604b`  
**Date opened**: 2026-09-23 (~21:40 PT)

## Pins（retained · reviewer must not flip）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** retained |
| Ban | invent **covered** · open DELETE · retry-to-green |

## Reviewer checklist（fill on review · not now）

- [ ] Product leak L51–54 honest · fix direction SET LOCAL/RESET  
- [ ] Unsealed claim NEG plan cites 0091 L369–374  
- [ ] Flake: every attempt recorded · Ban retry-to-green  
- [ ] NHP non-happy-first · C-CASECOUNT  
- [ ] Prove CMD unique · no wash checkpoint-physical alone  

*(empty body · Ban PASS filler)*

---

# PRE-EXEC dual · GAP-UC052-POOL-ROLE-LEAK · mw-e2e-ha（docs gate only · Ban prove · Ban product edit · 不代签 mw-privacy-int）

**Reviewer**: `mw-e2e-ha` · **Date**: 2026-09-23 (~21:40 PT)  
**REQUEST tip**: `2a0cc3a` / full `2a0cc3a1b56053803b3a9cdda20173b502a481ce`  
**Nail ancestor**: `913f21d` / full `913f21d34a427df8cfa85bd73ddaf19f4c7c604b`（`git merge-base --is-ancestor` YES）  
**Origin**: on `origin/feat/mysql-schema-skeleton` · docs-only（4 files · harness/slice/dual stubs · +192/−0 · no product）  
**Origin GAP cite**: post-prove receipt `2e743b2` §4 · `apps/worker/src/checkpoint-principal.ts` L51–54  
**Scope**: `/workspace/meetwise` only · Ban Meridian · Ban `.env*` · Ban product code · touch only this receipt  
**alone≠dual**: peer stub PENDING · **不代签** · Pre-exec PASS ≠ coding / covered / nail / next knife

---

## 0. Verdict（top）

| Key | Value |
|-----|-------|
| **Verdict** | **PASS**（binding C-* · Ban coding auth by this alone） |
| **blockers** | **NONE**（docs plan sound under conditions；under-spec closed by C-* not FAIL） |
| **authorizeCoding** | **false** · needs peer `mw-privacy-int` dual + conditions satisfied at prove |
| **haStatus** | **NOT_HA** |
| **releaseEvidence** | **false** |
| **claimProductionHA** | **false** |
| **gR45Closed** | **true** |
| **coveredCount** | **8** |
| **ms3EqualsR4Closed** | **false** |
| **Stack** | **PG-retained** |
| **Public DELETE** | **503** retained |

**3-line 中文摘要**:
1. `2a0cc3a` 为 docs-only、钉 `913f21d` 之后、已上 origin；产品泄漏点 L51–54（session `SET ROLE` + `set_config(...,false)` 无 RESET）诚实，修复方向 SET LOCAL/RESET 可接受。
2. REQUEST 对 bleed 证明过粗（未强制真实 `createPool`/`max=1`/pid 复用/负对照）、unsealed NEG 未拆 NULL epoch/digest 分案、flake 未钉根因与 N 次冷跑账本——全部升为绑定条件，非本轮 docs blocker。
3. pins 全保留；Ban invent covered / 开 DELETE / retry-to-green；alone≠dual；本 PASS ≠ 编码授权。

---

## 1. Tip / ancestry / docs-only（Task 1）

| Check | Result |
|-------|--------|
| `git fetch` · `2a0cc3a` on `origin/feat/mysql-schema-skeleton` | **YES** |
| `913f21d` ancestor of `2a0cc3a` | **YES** |
| `2e743b2` ancestor of `2a0cc3a` | **YES** |
| `git show --stat 2a0cc3a` | 4 files · **ai-docs only** · harness + slice + 2 stubs |
| Product / migrations / scripts in tip? | **NO** |
| Message | `docs(privacy): REQUEST GAP-UC052-POOL-ROLE-LEAK + unsealed NEG + authz flake` · `draft:awaiting_pre_exec_dual` · Ban invent covered · Ban open DELETE · Ban retry-to-green |

**Files @`2a0cc3a`**:
- `ai-docs/delivery/harness/uc-e2e-052-pool-role-leak.md`
- `ai-docs/delivery/uc-e2e-052-pool-role-leak.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-e2e-ha.md`（本 stub）
- `ai-docs/delivery/reviews/REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md`（peer · 不代签）

---

## 2. Product leak honesty（source · Ban trust prose）

### Leak site — **CONFIRMED**

`apps/worker/src/checkpoint-principal.ts` **L47–59** `PrincipalBoundCheckpointPool.connect()`:

- **L51** `SET ROLE app_role`（**session** · not `SET LOCAL`）
- **L52–54** `set_config('app.principal_user'|`checkpoint_thread_id`|`checkpoint_epoch`, $1, **false**)`（**session** GUC · third arg `false`）
- **no** `RESET ROLE` / no release wrapper clearing GUCs · `catch` only `client.release()` then rethrow（L56–58）
- `query()` L62–65：connect → query → `finally { client.release() }` · released client returns to pool **with role+GUCs intact**

### Callers / pool wiring

| Asset | Cite | Note |
|-------|------|------|
| Factory | `apps/worker/src/main.ts` **L102–116** `createCheckpointer` | `createPool({ connectionString })` then `new PrincipalBoundCheckpointPool(pool).asPool()` when `useRuntimeRole` |
| Prod boot | `main.ts` **L436** `createCheckpointer(undefined, true)` | **dedicated** saver pool（≠ main `createPool()` @L401）· still bleeds **within** saver pool reuse |
| Pool max | `packages/db/src/principal.ts` **L837–848** `createPool` | `max: Number(o.max ?? process.env.PGPOOL_MAX ?? 20)` · default **20** · bleed needs `max=1` to force reuse |
| ALS bridge | `withCheckpointAccess` **L25–30** · consumer `interview-consumer.ts` ~L295 | saver API 无 per-query principal → 池门面是唯一桥 |
| Contrast（correct） | `packages/db/src/principal.ts` **L861–870** `asPrincipal` | `BEGIN` + `SET LOCAL ROLE` + `set_config(..., **true**)` + `COMMIT`/`ROLLBACK` + `release` |

### Other product session-scoped sites（grep）

| Site | Scope |
|------|-------|
| `checkpoint-principal.ts` L51–54 | **THIS GAP** · session ROLE + 3 GUCs |
| `packages/db/src/migrate.ts` L270/L280 | `statement_timeout`/`lock_timeout` session · migrate-only · **list as out-of-scope**（not app pool reuse） |
| Other product `SET ROLE` in `apps/*/src` / `packages/db/src`（excl. comments） | **none** besides above · tests/proofs mostly `SET LOCAL` in txn |

**Ruling**: product GAP honest · REQUEST fix direction（`SET LOCAL` inside txn **or** `RESET ROLE` + clear GUCs on release）**acceptable**. If SET LOCAL chosen → bind **C-SET-LOCAL-TXN**（below）because PostgresSaver may hold client across queries without caller BEGIN.

---

## 3. REQUEST vs binding conditions

### C-BLEED-REAL-POOL — **REQUEST partial → BIND**

REQUEST/harness: “reuse pooled connection … no role/config bleed” + NHP-POOL-NEG-01 / POOL-FAULT-01 · **does not** yet demand:

1. **Real factory**: prove must exercise **product** `PrincipalBoundCheckpointPool` over `createPool` from `@meetwise/db`（same path as `createCheckpointer` / prod）· **Ban** hand-made `pg.Client` / fake Pool that skips the façade.
2. **`max=1`** on that pool to force reuse.
3. Assert on **NEXT** checkout: `SELECT current_user, current_setting('app.principal_user', true), current_setting('app.checkpoint_thread_id', true), current_setting('app.checkpoint_epoch', true)` → role/GUCs **reset**（not leftover owner/thread/epoch）.
4. **Same backend pid** across the two checkouts（`SELECT pg_backend_pid()`）· proves reuse · Ban vacuous dual-connection “pass”.
5. **Negative control**: same test against pre-fix（e.g. tip `913f21d` / fix reverted）must EXIT **non-zero** · recorded · else test vacuous.
6. **Error path**: throw mid-transaction / mid-use still leaves no bleed（`SET LOCAL`→ROLLBACK clears；`RESET` on release in `finally`）.
7. Concurrency `max>1` parallel variant：**optional**（NHP-POOL-FAULT-01 may soft-cover）.

**C-SET-LOCAL-TXN**（if fix chooses SET LOCAL）: must be inside explicit `BEGIN..COMMIT` on **same** client；`set_config` third arg **`true`**；Ban session `false`. Grep residual session `SET ROLE`/`set_config(...,false)` product sites → list or close.

### C-UNSEALED-NEG — **REQUEST partial → BIND**

- Harness cites 0091 **L369–374** · verified: `request_epoch IS NULL OR <> snap` → `privacy_authorization_epoch_mismatch`；digest → `privacy_authorization_digest_mismatch`（ERRCODE `42501`）.
- Prior C-DIGEST-JWS（`uc052-checkpoint-physical.proof.ts` **L668–692**）only asserts **pre-seal NULL columns** · **no** claim-before-seal NEG（privacy-int post-prove also noted `NOTE-CKPT-UNSEALED-CLAIM-NEG`）.
- Binding: **three** cases — NULL epoch only · NULL digest only · **both** NULL；each asserts **exact error code/message** **and** no lease row / no target state change（not merely `rejects()` throws）；place in checkpoint prove and/or authz prove per allowlist.

### C-FLAKE-ROOT — **REQUEST direction OK · evidence bar BIND**

- Real first-run cite（mw-e2e-ha post-prove @`69de818`）：receipt `REQUEST-2026-09-23-uc-e2e-052-checkpoint-physical-post-prove-mw-e2e-ha.md` **L74**：`pnpm privacy-authorization:prove` · flake `ECONNREFUSED` · **attempt#1 EXIT=1 · attempt#2 EXIT=0**（retry-to-green wash recorded honestly as flake，not as green）.
- Harness Ban retry-to-green · “record every attempt” · “first-run EXIT=0” — **aligned**.
- Binding:
  - Root cause from **real** first-run log（cite path/line）· fix targets that cause（suspect surface: `scripts/run-e2e-isolated.mjs` `waitForPostgres` L1882–1894 / migrate retry L1901–1907 · or proof boot vs PG ready race — confirm from log，Ban invent）.
  - Proof of fix = **N consecutive fresh runs**（recommend **N≥20** cold/fresh DB each，or ≥10 cold + ≥10 warm）· **machine-emitted ledger** of every attempt + EXIT · **any** failure ⇒ not fixed.
  - Grep harness/prove for retry loops that swallow failures（Ban `|| true` / silent re-run）· `run-e2e-isolated` migrate 2-attempt is infra · must not wash **prove** EXIT.
  - Prefer pre-fix flake reproduction / deterministic trigger；if cannot reproduce → status **`unexplained flake mitigated`** · **Ban** claim **`fixed`**.

### C-CASECOUNT — **BIND tighten**

Harness “skip/missing → EXIT≠0” is weaker than required. Binding: exact expected case list **`==`**（missing **or extra** → EXIT≠0）. Prior uc052 proof L741–743 only checks `missing.length===0` · this knife must also refuse extras.

### C-EXIT-DISCIPLINE — **BIND**

- Prove EXIT propagated（Ban `|| true` · Ban swallowed catch that zeros exit）.
- `runnerCommitSha` / `gitSha` === committed tip under test.
- Porcelain clean before **and** after · **clean separate worktree**.
- `tsc` `packages/db` baseline **6** · **zero new**.

### C-NO-SCOPE-LAUNDER — **REQUEST OK · BIND retain**

Pins + Ban invent covered · Ban open DELETE · public DELETE **503** · coveredCount **8** · prior `uc052:checkpoint-physical:prove` EXIT=0 **≠** this GAP closed · unique CMD `pnpm uc052:pool-role-leak:prove`（name TBD OK if unique）.

---

## 4. Checklist（filled）

- [x] Product leak L51–54 honest · fix direction SET LOCAL/RESET（+ C-SET-LOCAL-TXN if LOCAL）
- [x] Unsealed claim NEG plan cites 0091 L369–374（+ C-UNSEALED-NEG split cases）
- [x] Flake: every attempt recorded · Ban retry-to-green（+ C-FLAKE-ROOT N-run ledger）
- [x] NHP non-happy-first · C-CASECOUNT（exact ==）
- [x] Prove CMD unique · no wash checkpoint-physical alone

---

## 5. Blockers / conditions / pins

| ID | Status |
|----|--------|
| Docs-only tip @`2a0cc3a` · ancestor nail · on origin | **PASS** |
| Product leak honesty | **PASS** |
| Fundamental plan launder（fake-client prove / retry-as-fix） | **NONE** in REQUEST text · gaps → conditions |
| **C-BLEED-REAL-POOL** | **BIND** coding/prove |
| **C-SET-LOCAL-TXN** | **BIND** if SET LOCAL chosen |
| **C-UNSEALED-NEG** | **BIND** |
| **C-FLAKE-ROOT** | **BIND** |
| **C-CASECOUNT** | **BIND**（exact ==） |
| **C-EXIT-DISCIPLINE** | **BIND** |
| **C-NO-SCOPE-LAUNDER** | **BIND** / pins retained |
| Peer `mw-privacy-int` | **不代签** · alone≠dual |
| Coding / nail / covered / next | **NOT** authorized by this PASS |

**Pins restated**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · public DELETE=503 · Ban invent covered · Ban open DELETE · Ban retry-to-green.

**Pre-exec PASS ≠ coding · ≠ covered · ≠ nail · ≠ next knife · alone ≠ dual.**

Verdict: PASS
