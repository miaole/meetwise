# REQUEST — **UC-E2E-018 PERF/LOAD · GAP-UC018-PERF-LOAD · NHP-018-PERF-01 + NHP-018-LOAD-01** · **post-prove dual** · `mw-e2e-ha`

**Expert**: `mw-e2e-ha`（Meetwise adversarial E2E/HA reviewer · this receipt only · **Ban** sign peer `mw-rag-route`）  
**Pair**: `REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-rag-route.md`（peer · alone≠dual · not forged here）  
**Knife**: `harness/uc-e2e-018-perf-load.md` · status **`executed:awaiting_post_prove_dual`** · Ban self-nail  
**Date**: 2026-09-23 (~19:50–19:54 PT)  
**Role**: adversarial **POST-PROVE** dual · independent re-run at committed tip · Ban rubber-stamp · Ban self-nail · Ban modify product code · Ban Meridian · Ban `.env*`  

---

## 0. Verdict（top）

| Field | Ruling |
|-------|--------|
| **Verdict** | **PASS** |
| **阻塞项 blockers** | **无阻塞**（sampled below · disclosures #1–#3 已裁定为可接受 pin / 已由本会话 re-run 消解 · 非 blocker） |
| **tip MATCH** | **YES exact** · HEAD == prove tip `b29c191543dfbe7c1afa4278c550340a3339f295` |
| **Method freeze ancestor** | `8c7ee0c` **is ancestor** of `b29c191`（`git merge-base --is-ancestor` EXIT=0）· runs after freeze（impl receipt start ~19:46 PT > freeze 19:42:46 PT） |
| **authorizeNail / flip §1.1 / invent covered** | **false** · Dual PASS ≠ nail · ≠ covered · ≠ next knife |
| **elevate PERF/LOAD partial** | **already done at tip**（case-only→partial THIS UC only）· **PERF/LOAD partial ≠ UC covered** · §1.1 stays **partial** · Ban wash |
| **alone≠dual** | **YES** · Ban sign rag-route |
| **local ≠ capacity ≠ HA** | **YES** · Ban claimProductionHA |

**Explicit Ban**: invent covered · flip §1.1 · claim production capacity/HA · wash PERF/LOAD into covered · post-hoc threshold retune · n/a dodge · skip to UC-011 · MySQL/Qdrant cutover · Cloud Agent · Meridian · secrets / `.env*` · self-nail · peer forge · authorize nail this open.

---

## 1. Identity · tip / HEAD · chain

| Key | Value |
|-----|-------|
| **Prove tip（MUST）** | `b29c191543dfbe7c1afa4278c550340a3339f295` / `b29c191` |
| **HEAD at review start** | `b29c191543dfbe7c1afa4278c550340a3339f295` · **MATCH exact** |
| **Tip author** | `meetwise-core <meetwise-core@users.noreply.github.com>` · `feat(e2e): UC018 PERF/LOAD prove + elevate case-only→partial` · 2026-09-23 19:48:10 -0700 |
| **Method freeze Step A** | `8c7ee0c1532e04467296dccb1797520124fbebce` · docs-only · 2026-09-23 19:42:46 -0700 · **ancestor of tip YES** |
| **Pre-exec dual** | `mw-e2e-ha` `64cc57c` PASS · `mw-rag-route` `4964dc2`（subject PASS\|FAIL template quirk · body PASS）· CONDITIONS retained |
| **Reassess nail** | `0b7a218` ancestor · honest non-flip · Ban reopen as covered flip |
| **Branch** | `feat/mysql-schema-skeleton` · `/workspace/meetwise` · historical name only · Ban MySQL cutover |
| **Working tree（tracked source）** | **clean** before my prove re-run |

---

## 2. CMD|EXIT table（every command recorded）

| CMD | EXIT |
|-----|------|
| `git fetch origin` | **0** |
| `git rev-parse HEAD` → `b29c191…3339f295` | **0** |
| tip MATCH exact vs `b29c191` | **0** / **MATCH** |
| `git merge-base --is-ancestor b29c191 HEAD` | **0** |
| `git merge-base --is-ancestor 8c7ee0c b29c191` | **0** |
| `git status`（tracked source clean before prove） | **0** / clean |
| **`pnpm uc018:perf-load:prove`（mw-e2e-ha independent re-run）** | **0** |
| `pnpm uc018:covered-lift-reassess:prove` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |
| `pnpm uc018:covered-lift:prove` | **0** |
| `pnpm uc018:adv:prove` | **0** |
| `pnpm uc018:abandon:prove` | **0** |
| `pnpm uc018:abandon:http:prove` | **0** |
| `pnpm uc018:sole:prove` | **0** |
| `pnpm uc018:graph:prove` | **0** |
| `pnpm uc018:ttl:prove` | **0** |
| `pnpm uc018:abandon:full-e2e:prove` | **0** |
| `pnpm uc018:ui:prove` | **0** |
| secrets `rg` on tracked `receipts/uc018-perf-load/` | **0** / **CLEAN**（no `postgres://` / password / DATABASE_URL / Bearer / API keys） |
| restore tracked receipts after my overwrite（`git checkout -- …`） | **0** · implementer-owned evidence restored · my numbers kept in this review + `/tmp/mw-e2e-ha-uc018-post-prove/` |

---

## 3. Own 3-run numbers（mw-e2e-ha re-run at `b29c191`）

**Caps evidence（my run）**: `enforced=true` · PG `NanoCpus=2000000000` `Memory=4294967296` · API same · method `docker --cpus=2 --memory=4g`  
**My receipt `gitSha`**: `b29c191543dfbe7c1afa4278c550340a3339f295`（≠ implementer tracked `8c7ee0c` — see disclosure #1）  
**SUMMARY**: `allPass=true` · `capsEnforced=true` · EXIT=0

### PERF · NHP-018-PERF-01（N=100 c=10 · thresholds p50≤250 / p95≤750 / p99≤1500 / err≤0.5%）

| Run | p50 (ms) | p95 (ms) | p99 (ms) | err | timeout | passed |
|-----|----------|----------|----------|-----|---------|--------|
| 1 | 22.850 | 64.109 | 114.877 | 0 | 0 | **true** |
| 2 | 18.024 | 52.366 | 64.672 | 0 | 0 | **true** |
| 3 | 18.139 | 43.579 | 68.583 | 0 | 0 | **true** |

### LOAD · NHP-018-LOAD-01（N=50 c=20 · err≤1% · no double-release · no stuck）

| Run | err | doubleRelease | stuckReservation | stuckGraph | passed |
|-----|-----|---------------|------------------|------------|--------|
| 1 | 0 | 0 | 0 | 0 | **true** |
| 2 | 0 | 0 | 0 | 0 | **true** |
| 3 | 0 | 0 | 0 | 0 | **true** |

**一致性**: 与 implementer 声称同向（impl p95 ~47–57ms；我方 p95 ~44–64ms；两侧均远低于阈值 · LOAD dbl/stuck 均为 0）。数值差属机器噪声 · 非阈值操纵。

---

## 4. Findings 1–6

### Finding 1 — Disclosure #1 gitSha vs committed runner（RESOLVED by re-run）

| Item | Ruling |
|------|--------|
| Implementer tracked receipts `gitSha` | `8c7ee0c…`（freeze tip · `git rev-parse HEAD` at their run） |
| Reality | Runner/prove code landed in tip `b29c191` · so receipts SHA ≠ code SHA of elevating commit |
| This session | Re-ran at **clean HEAD=`b29c191`** · my receipts record `gitSha=b29c191…` · EXIT=**0** · 3/3 both facets PASS |
| Ruling **#1** | **DISCLOSED PIN / RESOLVED for post-prove** · not blocker · historical impl receipts retain freeze SHA（honest clock of their HEAD）· **elevate eligibility rests on tip code + this dual re-run** · Ban treat freeze-SHA receipts as “code at 8c7ee0c contained runner” |

### Finding 2 — Disclosure #2 worker cap / where release+safe-terminate execute

| Item | Evidence |
|------|----------|
| Caps enforcement | `run-e2e-isolated.mjs` adds `--cpus 2 --memory 4g` on **PG** when target=`uc018:perf-load:prove:raw` · `uc018-perf-load-capped-child.mjs` wraps prove in Docker **API** container same caps · inspect NanoCpus=2e9 Memory=4GiB |
| LOAD mouth | `POST …/abandon` via Nest `_neg-harness` **inside capped API container** |
| Release + graph safe-terminate | Product path `abandonInterviewAndRelease` in API/service+db · **not** a separate `apps/worker` process · mapPool “workers” = JS concurrency only |
| Harness claim | Explicit：**measured surface = API prove process + isolated PG** · **does NOT** claim a separate worker container was capped |
| Matrix facet | LOAD labeled `worker/api`（taxonomy）· actual execution = API path under cgroup |

| Ruling **#2** | **DISCLOSED PIN acceptable for partial** · `workerCapEnforced=false`（no separate worker container）· **measured abandon+release+graph surface IS capped**（API+PG）· **NOT** a false “worker caps enforced” claim · **NOT** blocker · correctness invariants（dbl-release/stuck）are DB-asserted under that capped API path · Ban elevate to capacity/HA |

### Finding 3 — Disclosure #3 reassess prove still refuses flip

| Item | Evidence |
|------|----------|
| Diff `0b7a218..b29c191` on `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs` | Now **reads** live PERF/LOAD from NHP+matrix（partial/case-only/blind）· still **`let canHonestlyFlip = false`** · pushes `PERF/LOAD partial≠covered` + `reassess-knife-refuses-§1.1-flip` · **not** hardcoded column greens · EXIT still 0 only if refuse retained |
| This session run | EXIT=**0** · columns `NEG=FAULT=BOUND=ADV=PERF=LOAD=partial` · `canHonestlyFlip=false` · refuse=`PERF/LOAD partial ≠ UC covered (matrix §0.5/§1.0 · Ban假关 · covered-lift=separate later knife)` |
| Matrix §1.1 | UC-E2E-018 coverage status still **`partial`** |

**Why `canHonestlyFlip` still false when all six are partial?**  
Per prove logic + matrix §0.5/§1.0：六列 non-blind 是 **必要非充分** · `partial ≠ covered` · reassess knife **hard-refuses** §1.1 flip（covered-lift = **separate later knife**）。即便六列全 partial，§1.1 仍不得自动升 covered。**Refusing is CORRECT** · Ban invent covered。

| Ruling **#3** | **PASS / honest** · modified to report new column state · still refuse flip · computes from matrix+NHP · Ban假关 |

### Finding 4 — Method freeze / thresholds / post-hoc retune

| Check | Result |
|-------|--------|
| `8c7ee0c` ancestor of `b29c191` | **YES** EXIT=0 |
| Receipt timestamps after freeze | **YES**（~19:46 PT > 19:42:46 PT freeze） |
| N/c/thresholds 30943df→b29c191 | **UNCHANGED**：PERF N=100 c=10 p50≤250 p95≤750 p99≤1500 err≤0.5% · LOAD N=50 c=20 err≤1% no-dbl no-stuck |
| Code constants | `PERF={N:100,c:10,p50:250,p95:750,p99:1500,errMax:0.005}` · `LOAD={N:50,c:20,errMax:0.01}` |
| nearest-rank · client hrtime · timeout 10s=error · warmup 10 excluded · 3 runs all-must-pass · p99 weakness disclosed | **Present** in freeze + proof + receipts |
| Post-hoc threshold change | **NONE** · **no blocker** |

### Finding 5 — DB-level post-drain asserts + receipt fields + secrets

| Check | Result |
|-------|--------|
| Double-release SQL | Real query on `entitlement_consumption` grouped by `idempotency_key` · excess rows counted |
| Stuck reservations | `status='reserved'` count on consumption table |
| Stuck graph | `ai_graph_run` status NOT IN (`safely_terminated`,`completed`,`failed`) |
| Not in-memory only | **YES** · `h.pool.query` against isolated PG |
| Required receipt fields | gitSha · command · caps · N · c · rawLatenciesMs · p50/p95/p99 · error/timeout · start/end · machine ·（LOAD）doubleRelease/stuck/sqlChecks |
| Secrets grep tracked mirrors | **CLEAN** |

### Finding 6 — Pins retained

| Pin | Observed |
|-----|----------|
| `haStatus=NOT_HA` | **YES**（harness · receipts · proves） |
| `releaseEvidence=false` | **YES** |
| `claimProductionHA=false` | **YES** |
| `coveredCount=8` | **YES** retained |
| `gR45Closed=true` | **YES** |
| `ms3EqualsR4Closed=false` | **YES** |
| §1.1 UC-E2E-018 | **partial** · Ban flip |
| local PERF/LOAD ≠ capacity ≠ HA | **YES** |
| partial ≠ covered | **YES** |
| alone ≠ dual | **YES** · Ban sign peers |

---

## 5. Rulings on disclosures #1–#3（summary）

| # | Topic | Verdict |
|---|-------|---------|
| **#1** | Receipts `gitSha=8c7ee0c` vs uncommitted-at-run runner | **PIN / RESOLVED** by dual re-run at `b29c191`（my `gitSha=b29c191` · EXIT=0）· not blocker |
| **#2** | Worker cap / LOAD execution locus | **PIN acceptable** · `workerCapEnforced=false`（no separate worker）· release/safe-terminate **inside capped API** · harness does not falsely claim worker container caps · not blocker |
| **#3** | Reassess reads PERF/LOAD partial but refuses flip | **PASS honest** · still matrix-driven · `canHonestlyFlip=false` correct because **partial≠covered** + reassess knife hard-refuse · §1.1 stays partial |

---

## 6. 阻塞项 / sampled

**无阻塞。**

Sampled（non-exhaustive · adversarial）：tip exact · freeze ancestor · thresholds unchanged · nearest-rank+hrtime+timeout=error+warmup+3runs+p99 disclosure · docker NanoCpus/Memory on PG+API · SQL post-drain · secrets clean · required receipt fields · reassess refuse logic · §1.1 partial · pins · family CMD EXIT=0 ×12（含本 prove）· own 3/3 PERF+LOAD PASS。

Residual honesty notes（**not** blockers）：impl tracked receipts still show freeze `gitSha`（historical）· LOAD facet taxonomy says `worker/api` while execution is API-path（disclosed）· harness title still carries some stale “Ban elevate this open” wording while status=`executed:awaiting_post_prove_dual`（lifecycle text debt · not threshold cheat）。

---

## 7. Pins · non-claims（must retain）

- **haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false**
- **coveredCount=8** · **gR45Closed=true** · **ms3EqualsR4Closed=false**
- local PERF/LOAD ≠ capacity ≠ HA · partial ≠ covered · §1.1 stays **partial**
- alone ≠ dual · Ban sign `mw-rag-route` · Dual PASS ≠ nail ≠ invent covered ≠ next knife
- Ban MySQL/Qdrant cutover · PG-retained ADR retained · Ban wash ADV/SOLE/UI/TTL/GRAPH/FULL-E2E/reassess/D2b/HA into covered

---

## 8. Verdict line

**PASS** — UC-E2E-018 PERF/LOAD post-prove（mw-e2e-ha）· tip `b29c191` MATCH · independent prove EXIT=0 · 3/3 PASS · disclosures #1–#3 无阻塞裁定 · pins retained · §1.1 stays partial · Ban self-nail · alone≠dual。

