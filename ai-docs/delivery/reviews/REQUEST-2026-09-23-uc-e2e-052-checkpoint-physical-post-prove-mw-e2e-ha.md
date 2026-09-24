# REQUEST — UC-E2E-052 checkpoint physical · **POST-PROVE** · mw-e2e-ha

**Expert**: `mw-e2e-ha`（adversarial E2E / evidence-honesty · POST-PROVE dual）  
**Pair**: `mw-privacy-int`（peer post-prove `118e28f` PASS · **不代签** · alone≠dual）  
**Date**: 2026-09-23 (~21:33 PT)  
**Line**: **B** · knife `GAP-PRIV-CHECKPOINT-FENCE-ONLY`  
**Scope**: `/workspace/meetwise` only · branch `feat/mysql-schema-skeleton` · Ban Meridian · Ban `.env*` · Ban product code edits · touch only this receipt  
**REQUEST**: `41cffea` / full `41cffead31cc032648bfc044d9055dbdbe4ae072`  
**PROVE SHA**: `69de818` / full `69de8180f5f2aa059191f67c32dad89d07bbcbed`（saver pool isolation · **test-only**）  
**Receipt tip（mw-core）**: `c549d20` / full `c549d20f922d542a458676592e3e81fbfe72a179`  
**Related**: `3e42d16`（real PostgresSaver seed+race）· earlier `775710f` · `3b9ab17` · `83537d9` · `e27ad0b`  
**Prior pre-exec**: FAIL `2bc9da9` @`41cffea` · Item1 PASS `61f7fa3` @`e09d56e`（knife conditions still bind）  
**Clean WT**: `/workspace/mw-rv-69de818` @`69de818` · removed after

---

## 0. Verdict（top）

| Key | Value |
|-----|-------|
| **Verdict** | **PASS** |
| **blockers** | **NONE**（knife C-* gates green @`69de818`） |
| **conditions** | **GAP-UC052-POOL-ROLE-LEAK**（product · open）· ambient **GAP-EVAL-PARSER-DETAILS-UNCLOSED**（cite UC-018 facet；非本刀） |
| **authorizeNail** | **false** · Ban invent covered · Ban open DELETE · Ban wash `privacy-erasure:prove` |
| **haStatus** | **NOT_HA** |
| **releaseEvidence** | **false** |
| **claimProductionHA** | **false** |
| **gR45Closed** | **true** |
| **coveredCount** | **8** |
| **ms3EqualsR4Closed** | **false** |
| **Stack** | **PG-retained**（isolated `pgvector-legacy` · Ban cite as sole MySQL+Qdrant truth） |
| **Public DELETE** | **503** retained（NEG-03） |
| **alone≠dual** | **true** · peer PASS 不代签 · PASS≠covered/nail/next knife |

**3-line 中文摘要**:
1. 干净 worktree @`69de818`：三 prove（checkpoint-physical / internal-erasure / privacy-authorization）EXIT=0；tsc=6=baseline；porcelain 空；13/13 case 全绿含 RACE/RACE-TRIGGER。
2. `69de818` **未改 product src**（仅 test 专用 saverPool）；product `PrincipalBoundCheckpointPool` 仍 session `SET ROLE` 无 RESET → 登记 **GAP-UC052-POOL-ROLE-LEAK**（条件，非本刀 blocker）。
3. pins 全保留；cite EXIT=1 仅 UC-018 facet（Line A `17e7654`）；alone≠dual；Ban nail / Ban 开 DELETE / Ban 洗 covered。

---

## 1. Ancestry / commits（Task 1）

| Check | Result |
|-------|--------|
| `git fetch` + on `origin/feat/mysql-schema-skeleton` | **YES** · all cited SHAs ancestors of tip |
| `69de818` product src change? | **NO** · only `packages/db/test/uc052-checkpoint-physical.proof.ts`（+6/−6 · dedicated `saverPool`） |
| `3e42d16` product? | **YES** · `packages/db/src/uc052-checkpoint-physical.ts`（Disclosure-2 seal comments）+ prove rewrite + lock/runner |
| `775710f` | feat · product `uc052-checkpoint-physical.ts` + prove + package scripts |
| `3b9ab17` | tsc widen sink checks · prove only |
| `83537d9` / `e27ad0b` / `c549d20` | docs/receipts only |
| `41cffea` | docs REQUEST + harness + dual stubs |

### Files @`69de818`（name-status）

```
M packages/db/test/uc052-checkpoint-physical.proof.ts
```

Commit message claims “SET ROLE leak” fix — **honest only as test harness isolation**（admin pool vs saver pool）。Product leak remains（§4）。

---

## 2. CMD|EXIT（Task 2 · clean WT @`69de818`）

| CMD | EXIT | Notes |
|-----|------|-------|
| `git fetch` / ancestry / on-origin | **0** | all SHAs on origin |
| `git worktree add … 69de818` | **0** | `/workspace/mw-rv-69de818` |
| `pnpm install --frozen-lockfile` | **0** | |
| `git status --porcelain`（before） | **0** | empty |
| `pnpm uc052:checkpoint-physical:prove` | **0** | 13/13 PASS · `gitSha=69de8180f5f2aa059191f67c32dad89d07bbcbed` · `racePut=refused` · NEG-02 beforeB=afterB={1,1,1} · HP before={1,1,1} after={0,0,0} deleted=3 |
| `pnpm uc052:internal-erasure:prove` | **0** | 11/11 · FAULT-04 `req=purging` · Ban wash as checkpoint knife |
| `pnpm privacy-authorization:prove` | **0** | retry after flake `ECONNREFUSED` #1 EXIT=1 · #2 EXIT=0 |
| `pnpm exec tsc -p tsconfig.json --noEmit`（`packages/db`） | **2** | **6** errors · same baseline method as `3e39c1e` · 0 in uc052-checkpoint-physical |
| `pnpm eval-harness-matrix-cite:prove` | **1** | live 050–052 facets PASS；FAIL only `UC-018 facet[2] legacy=blind conservative=case-only`（ambient · `17e7654` FAULT→case-only · `GAP-EVAL-PARSER-DETAILS-UNCLOSED`） |
| `git status --porcelain`（after） | **0** | empty |
| `git worktree remove` | **0** | |

### Case set vs claims（exact · not ≥）

REQUIRED_CASES（proof L35–48）≡ claimed list：FAULT-01/02/03 · NEG-01/02/03 · BOUND-01 · ZERO · RACE · RACE-TRIGGER · HP-052-CKPT-01 · C-DIGEST-JWS；plus asserted `C-CASECOUNT`（L741–743 `missing.length===0`）。Live JSON all `"pass"`。

Committed evidence @`c549d20`：`runnerGitSha=69de8180f5f2aa059191f67c32dad89d07bbcbed` · matches prove tip。

---

## 3. Per-condition rulings（Task 3 · source cites · Ban trust implementer summary）

### C-SQL-3TABLE — **PASS**

- SQL purge：`0048_checkpoint_physical_erasure.sql` **L429–433**（`checkpoint_writes` / `checkpoint_blobs` / `checkpoints` by `thread_id`）+ residual check；`0078` **L133–137** 同源；TS wrapper `checkpoint-privacy.ts` **L117** `privacy_purge_checkpoint_target`。
- Prove：`ckptCounts` **L105–117** 分表 `count(*)`；`allPositive` **L123–125** 预置 >0；`allZero` **L120–122** 后=0。HP-052-CKPT-01 **L726–728**；NEG-02 **L388+** beforeB=afterB 他主体不变。Live：`before={"checkpoints":1,"blobs":1,"writes":1}` → after 全 0 · **非 vacuous**。

### C-ZERO-CKPT — **PASS**

- `NHP-052-CKPT-ZERO` **L474–491**：无 saver seed · `before` 三表=0 · `deletedCount===0` · target `erased` · `req=pending_external` · Ban `completed`/`partial_failed`。Live：`deleted=0 status=erased req=pending_external`。

### C-REVIVE / C-RACE — **PASS**（soft：无 pg_locks 观测）

- FAULT-02 **L250–294**：purge 后 real `getTuple` empty/threw · `put` refused · counts 仍 0；REVIVED→`process.exit(1)`。
- RACE **L494–610**：third-party `BEGIN` + `SELECT … FOR UPDATE` 三表 **L532–534** → **unawaited** `purgeP` **L536–537** → `sleep(80)` → real `saver.put`/`putWrites` **L547–554** → `COMMIT` → `await purgeP`。**非** `await purge(); await put()` 顺序假赛。Live：`racePut=refused` · `postGet=empty` · `postPut=refused` · after 全 0。
- RACE-TRIGGER **L613–659** 保留：`Promise.allSettled([purgeP, raceWrite])` · Live `purge=fulfilled write=rejected`。
- Soft residual：无 `pg_locks`/`pg_stat_activity` assert；依赖 FOR UPDATE + sleep 启发式——**不升 blocker**（live racePut=refused 支持屏障生效）。

### C-FAULT-CASE / C-LEDGER — **PASS**

- FAULT-01：`failBeforePurge` product **L170–176** 将 target 置 `failed`（claim 后、purge 前 · 非 DELETE 中途抛错）· ledger `failed` · retry `retryFailedCheckpointPhysicalTarget` **L218–247** → erased · 三表 0。Ban 假 `done`/`completed`（`bannedTerminal`）。
- FAULT-03：idempotent re-purge deleted=0 · receipts 计数不变 **L297–325**。
- 请求终态循 0096：happy/fault 观测 `pending_external`（非 `completed`）。

### C-AUTHZ — **PASS**

- 授权链：`runAuthorizedCheckpointPhysicalPurge` **L114–215** begin(privileged)→seal→sign→JWS verify→consume→0091 claim→purge。Ban app_role begin：NEG-01 **L328+** beginRej/forgedRej/bypassRej · `grant=false`。
- NEG-03 **L413–433**：`PrivacyService.eraseInterviewData` → **503** + `interview_erasure_authorization_not_available` · `has_function_privilege(app_role,…)=false`。
- NEG-02：他主体三表计数不变（live beforeB=afterB）。

### C-CASECOUNT / C-PORCELAIN / C-SHA / C-TSC — **PASS**

- Case：exact `REQUIRED_CASES` + `missing.length===0`（L741–743）· skip→会缺 id→FAIL。
- Porcelain：proof **L201–205** dirty→EXIT 1；本角 before/after empty。
- SHA：live `gitSha=69de818…`；tip evidence `runnerGitSha=69de818…` @`c549d20`。
- TSC：`pnpm exec tsc -p tsconfig.json --noEmit` @`packages/db` → **6** errors（qbank-handoff×2 · privacy-erasure-preview×1 · domain×3）· **== baseline 6** · 0 in本刀 prove/src。

### C-NO-DIGEST-TRIM — **PASS**

- `sealCheckpointErasureAuthz` **L79–82** digest over **full** live targets；`C-DIGEST-JWS` **L662–692** asserts 5 sinks（checkpoint_rows + job payload + oss/redis/langfuse）· sealed≡live≡signed · pre seal epoch/digest NULL。Ban 裁剪洗绿。Live `jwsEq=true sinks=checkpoint_rows,interview_job_payload,langfuse,oss,redis`。

### Fail-open / constant-false / verdict-launder hunt

- 无 default-true PASS flags；`A(id,ok)` 以布尔入账；REVIVED 硬 `exit(1)`。
- Ban wash：`privacy-erasure:prove` / internal-erasure EXIT=0 ≠ 本 gap 关（本角独立跑 checkpoint prove）。
- Matrix cite ambient FAIL ≠ launder UC-052（050–052 facets 仍 honesty-pin/gap/blind）。

---

## 4. SET ROLE pool leak（Task 4）

| Surface | Finding |
|---------|---------|
| `69de818` | **test-only**：dedicated `saverPool`（proof **L209–214** / **L773**）避免 `PrincipalBoundCheckpointPool` 污染 admin pool |
| Product | `apps/worker/src/checkpoint-principal.ts` **L51–54**：`SET ROLE app_role` + `set_config(..., false)`（**session**）· `connect()` **无** `RESET ROLE` / 无 release wrapper · pooled client 可泄漏 role+GUC |
| Product grep | `packages/` product src 无额外裸 `SET ROLE`（tests/proofs 多用 `SET LOCAL` in txn） |
| Ruling | **GAP-UC052-POOL-ROLE-LEAK** = **product GAP**（条件 · open）。**非**仅 test-harness。`69de818` **不关闭** product leak。本刀 prove 绿不洗此 GAP。 |

---

## 5. Pins（restated · unchanged）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **public DELETE=503** · **PASS ≠ covered / nail / next knife** · **alone ≠ dual**

---

## 6. Blockers / conditions

| ID | Status |
|----|--------|
| Knife C-SQL-3TABLE … C-NO-DIGEST-TRIM | **PASS**（§3） |
| **GAP-UC052-POOL-ROLE-LEAK** | **OPEN** condition · product `PrincipalBoundCheckpointPool` session SET ROLE without RESET |
| **GAP-EVAL-PARSER-DETAILS-UNCLOSED** | ambient residual（cite UC-018）· **非**本刀 blocker |
| New knife blockers | **NONE** |
| mw-privacy-int dual | peer `118e28f` PASS · **不代签** |

---

Verdict: PASS
