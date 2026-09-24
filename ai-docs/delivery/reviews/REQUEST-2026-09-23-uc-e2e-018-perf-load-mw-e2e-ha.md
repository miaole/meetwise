# REQUEST — **UC-E2E-018 PERF/LOAD · GAP-UC018-PERF-LOAD · NHP-018-PERF-01 + NHP-018-LOAD-01** · pre-exec · mw-e2e-ha

**Expert**: `mw-e2e-ha`（this receipt only · **Ban** sign peer `mw-rag-route`）  
**Pair**: `REQUEST-2026-09-23-uc-e2e-018-perf-load-mw-rag-route.md`（peer writes · alone≠dual）  
**Knife**: `harness/uc-e2e-018-perf-load.md` · slice `uc-e2e-018-perf-load.slice.md`  
**Date**: 2026-09-23 (~19:40 PT)  
**Role**: adversarial PRE-EXEC dual · **docs gate ONLY** · **Ban coding** · **Ban run perf/load prove** · **Ban** authorize execution beyond this verdict · **Ban** modify harness/slice/matrix product · overwrite coordinator stub only

---

## 0. Verdict（top）

| Field | Ruling |
|-------|--------|
| **Verdict** | **PASS** |
| **阻塞项 blockers** | **无阻塞**（sampled below · case-only pre-exec adequate · weaknesses → conditions for post-prove/partial，非本刀 blocker） |
| **tip MATCH** | **YES exact** · HEAD `30943dfcc890c5b7f9f62dc38c7584f4eda0f0dd` == REQUEST tip `30943df` |
| **parent / nail** | parent `24d350f` docs-only typo **YES** · nail `0b7a218` ancestor **YES** · `24d350f` ancestor of tip **YES** |
| **24d350f docs-only** | **PASS** · +1/−1 `harness/uc-e2e-018-user-abandon.md` only |
| **30943df scope** | **docs/harness/slice/matrix/NHP/stubs only** · **no** product code · **no** `package.json` script wire · plan `pnpm uc018:perf-load:prove` named-only（Ban coding this open · expected deferred） |
| **authorizeCoding** | **false** |
| **authorizeProve** | **false** |
| **elevate PERF/LOAD → partial this open** | **false** · Ban |
| **claimUc018Covered / §1.1** | **false** · stays **partial** · `canHonestlyFlip` remains **false** this open |
| **alone≠dual** | **YES** · Ban sign rag-route |
| **Dual PASS ≠** | coding · covered · PERF/LOAD **partial** · §1.1 flip · next knife · nail |

**Explicit**: Do NOT authorize coding · Do NOT run `uc018:perf-load:prove` · Do NOT elevate PERF/LOAD to **partial** · Do NOT flip §1.1 covered · Do NOT invent covered / 假绿 / 假关 · Do NOT claim production capacity / HA · Do NOT post-hoc retune · Do NOT n/a-dodge · Do NOT skip to UC-011 · Do NOT wash ADV/SOLE/reassess/D2b/HA into covered · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban peer forge.

---

## 1. CMD|EXIT（recorded）

| CMD | EXIT |
|-----|------|
| `git fetch origin` | **0** |
| `git rev-parse HEAD` → `30943dfcc890c5b7f9f62dc38c7584f4eda0f0dd` | **0** |
| tip MATCH exact vs `30943df…eda0f0dd` | **0** / **MATCH** |
| `git merge-base --is-ancestor 30943df HEAD` | **0**（is ancestor；兼 exact tip） |
| `git merge-base --is-ancestor 0b7a218 24d350f` | **0** |
| `git merge-base --is-ancestor 24d350f 30943df` | **0** |
| `git show --stat 24d350f` | **0** · 1 file · +1/−1 |
| `git diff 0b7a218 24d350f --stat` / `--numstat` | **0** · `1 1 harness/uc-e2e-018-user-abandon.md` |
| `git diff 24d350f 30943df --stat` / `--numstat` | **0** · 8 files under `ai-docs/delivery/**` · +258/−13 · **no** product / `package.json` |
| `git check-ignore -v .tmp/x.json` | **0** · `.gitignore:15:.tmp/` |
| `git check-ignore -v .tmp/uc018-perf-load-receipts/nhp-018-perf-01.json` | **0** · ignored |
| `git pull --rebase origin feat/mysql-schema-skeleton`（pre-commit） | **0** · Already up to date |
| `rg uc018:perf-load package.json` | **0** · **no match**（script not wired · expected Ban coding） |

Branch: `feat/mysql-schema-skeleton` · remote `origin/feat/mysql-schema-skeleton` · repo `/workspace/meetwise` · **Meridian never touched** · **`.env*` never read**.

---

## 2. Findings · must-verify 1–5

### (1) Tip / checkout / ancestry

| Check | Result |
|-------|--------|
| HEAD contains / equals `30943df` | **TIP_MATCH=exact** |
| Parent `24d350f` | present · subject `docs(e2e): fix UC018 reassess nail parent harness typo` · author `meetwise-core` |
| Nail `0b7a218` ancestor of parent | **YES** |
| Parent ancestor of tip | **YES** |

### (2) Diff honesty

| Diff | Verdict |
|------|---------|
| `0b7a218..24d350f` | **docs-only PASS** · sole file `ai-docs/delivery/harness/uc-e2e-018-user-abandon.md` · **+1/−1** · no product/script/test |
| `24d350f..30943df` | **harness/slice/docs/NHP/matrix/review-stubs ONLY** · files: `e2e-covered-path-backlog.md` · `e2e-requirement-coverage-matrix.md` · `harness/uc-e2e-018-perf-load.md` · `harness/uc-e2e-018-user-abandon.md` · `non-happy-path-perf-load-case-matrix.md` · dual REQUEST stubs · `uc-e2e-018-perf-load.slice.md` · **no** apps/packages product · **no** `package.json` change · plan CMD named, not wired（unreviewed product change = **none**；deferred wire = condition at coding phase，非本 open blocker） |

### (3) Harness / slice / matrix / declared shapes

| Item | Observed | Ruling |
|------|----------|--------|
| Harness | `ai-docs/delivery/harness/uc-e2e-018-perf-load.md` · `draft:awaiting_pre_exec_dual` · §1b frozen thresholds | **PASS** for case-only |
| Slice | `ai-docs/delivery/uc-e2e-018-perf-load.slice.md` · mirrors harness · L0 only | **PASS** |
| Matrix §0.5 / §1.0 | `:47–58` PERF/LOAD mandatory · ban n/a capacity dodge · `:75` `case-only` = registered not executed | **PASS** cite |
| UC-018 §1.0.1 ~`:115` | NEG/FAULT/BOUND/ADV **partial** · PERF/LOAD REQUEST OPEN · NHP case-only · Ban elevate partial this open · **canHonestlyFlip=false** refuse was PERF/LOAD blind | **PASS** honesty |
| §1.0.2 ~`:141` | PERF_api **blind→case-only**（NHP-018-PERF-01）· LOAD_worker **blind→case-only**（NHP-018-LOAD-01）· PERF_web n/a with Ban n/a-dodge api/worker | **PASS** |
| §1.1 ~`:173` | UC-E2E-018 stays **partial** · coveredCount **8** retained | **PASS** |
| NHP matrix `:67–68` | NHP-018-PERF-01 / LOAD-01 registered with same shapes/thresholds | **PASS** |
| Declared | PERF: N=100 c=10 abandon · p50≤250 · p95≤750 · p99≤1500 · err≤0.5% · LOAD: N=50 c=20 abandon+release+graph · no double-release · no stuck · err≤1% · caps ≤2 vCPU/4GiB · local isolated · plan `pnpm uc018:perf-load:prove` · this open **blind→case-only only** | **MATCH declared** |
| `testing/e2e-performance-evidence.md` | local ms/RPS = single-dev regression · ≠ online SLO · ≠ capacity · ≠ HA · `.tmp` receipts `releaseEvidence=false` | **PASS** cite |
| `e2e-directory-contract.md` | path `ai-docs/testing/conventions/e2e-directory-contract.md` · static helpers ≠ live PERF · not blocking this docs gate | noted · N/A as blocker |

### (4) Adversarial judgment（a–d）

#### (a) Thresholds frozen BEFORE run · ban post-hoc?

**YES.** Harness §1b title「FROZEN now · Ban post-hoc retune」· A5 · stance row Ban post-hoc retune / Ban n/a dodge · slice mirrors. Thresholds + shapes + caps declared in REQUEST tip **before** any prove. **PASS**.

#### (b) Adequate for later PERF/LOAD **partial**?（critical · not rubber-stamp）

| Weakness | Severity for **case-only pre-exec** | Severity for later **partial lift** |
|----------|-------------------------------------|-------------------------------------|
| **N=100 → p99 ≈ 1 sample**（nearest-rank p99 of 100 ≈ worst 1）· statistically weak | **non-blocking condition** | **CONDITION** before partial：document percentile method；recommend ≥3 repeats or honesty note that p99 is worst-of-N；optional larger N later knife — **not** invent FAIL now |
| Warmup / discard first k | unspecified | **CONDITION** · coding must declare warmup policy frozen |
| Repeat runs / variance | unspecified | **CONDITION** · at least record single-run honesty or require multi-run median-of-p95 |
| Percentile method（nearest-rank vs interpolation） | unspecified | **CONDITION** · freeze in prove script + receipt field |
| Latency client-side e2e wall clock | implied POST abandon · not explicit | **CONDITION** · measure client e2e；state clock source |
| Failure / timeout definition · timeouts as errors? | error_rate given · timeout-as-error **not** explicit | **CONDITION** · timeouts/connect fails **count as errors** · hard request timeout frozen |
| Resource-cap enforcement evidence（docker/cgroup） | caps **declared** · enforcement method absent | **CONDITION** · receipt must show how ≤2vCPU/4GiB enforced（compose limits / cgroup / documented host pin） |
| LOAD invariants：DB-level no double-release / zero stuck after drain / idempotency | outcome words present · assertion method thin | **CONDITION** · prove must assert DB post-drain（reservation count / release uniqueness / graph terminal）not log-only |

**Ruling**: weaknesses are **real** but appropriate as **conditions for any PERF/LOAD partial / post-prove PASS**, **not** blockers for registering **case-only** with frozen thresholds. Blocking case-only for N=100 p99 weakness would invent a blocker this open does not claim to close. Ban 假绿 · Ban n/a dodge · Ban rubber-stamp partial later without these conditions.

#### (c) Receipt path ruling

| Fact | Evidence |
|------|----------|
| `.tmp/` gitignored | `git check-ignore -v .tmp/x.json` → `.gitignore:15:.tmp/` EXIT=0 |
| Harness receipt paths | **only** `.tmp/uc018-perf-load-receipts/nhp-018-perf-01.json` + `…/nhp-018-load-01.json` |
| Tracked mirror required? | **Harness does NOT yet require** committed tracked path |

**Ruling（mw-e2e-ha）**:
- Raw `.tmp/` alone is **insufficient** for post-prove / partial honesty（gitignore → unreviewable / forgeable locally）.
- **Rule**: prove MUST **also** commit redacted receipts under tracked path e.g. `ai-docs/delivery/receipts/uc018-perf-load/*.json`（no secrets / tokens / hostnames-with-creds / env dumps）.
- **Required fields**（minimum）: `gitSha` · `command` · `envCaps`（≤2vCPU/4GiB + how enforced）· `N` · `concurrency` · raw per-request latency **or** histogram · `p50`/`p95`/`p99` + **percentileMethod** · `errorCount`/`errorRate` · `timeoutCount`（timeouts∈errors）· `startedAt`/`endedAt`（PT or ISO+zone）· `machineInfo`（CPU/mem class · OS）· LOAD: `doubleReleaseCount=0` · `stuckReservationCount=0` · drain assertion method · `releaseEvidence=false` · `claimProductionHA=false`.
- Harness today: **missing tracked-path requirement** → **CONDITION**（must be added in AUTHORIZED coding before/with prove · verified at post-prove dual）· **not** case-only blocker（this open does not elevate partial / does not claim prove green）.

#### (d) Honesty pins in harness

| Statement | Present? |
|-----------|----------|
| local PERF/LOAD ≠ production capacity ≠ HA | **YES** · stance + §1b cite e2e-performance-evidence |
| PERF/LOAD partial ≠ UC covered | **YES** · repeated · elevate rule |
| §1.1 stays **partial** this open | **YES** |
| `canHonestlyFlip` stays **false** this open | **YES**（reassess refuse retained · this open ≠ covered-lift） |
| Ban elevate PERF/LOAD to partial this open | **YES** |

**PASS** on (d).

### (5) Pins retained

| Pin | Value | Status |
|-----|-------|--------|
| `haStatus` | **NOT_HA** | retained |
| `releaseEvidence` | **false** | retained |
| `claimProductionHA` | **false** | retained |
| `coveredCount` | **8** | retained |
| `gR45Closed` | **true** | retained |
| `ms3EqualsR4Closed` | **false** | retained |

Dual PASS ≠ coding ≠ covered ≠ nail ≠ next knife · alone ≠ dual · **Ban** sign for peers（`mw-rag-route` etc）.

---

## 3. 阻塞项 · conditions

### 阻塞项 blockers（本刀 case-only pre-exec）

**无阻塞。**

Sampled: tip exact MATCH · `24d350f` docs-only +1/−1 · `30943df` docs/harness only · thresholds frozen + ban post-hoc · matrix blind→case-only only · §1.1 partial · pins · local≠prod≠HA · PERF/LOAD≠covered · canHonestlyFlip false this open · no product/`package.json` sneak · no prove run claimed.

### Conditions（must be met **before any** PERF/LOAD **partial** lift / post-prove PASS）

1. Freeze **percentileMethod** + client-side e2e latency clock + **timeouts count as errors** + hard request timeout in prove script.  
2. Document **warmup** + whether single-run or multi-run；honest note that **N=100 p99 ≈ worst-1**（or raise N / repeats in same knife under authorize）.  
3. **Resource-cap enforcement evidence** in receipt（docker/cgroup/compose limits），not declaration-only.  
4. LOAD：**DB-level** post-drain assertions — `doubleReleaseCount=0` · `stuckReservationCount=0` · graph safe-terminate / idempotency — not log-only.  
5. **Tracked receipt path** `ai-docs/delivery/receipts/uc018-perf-load/*.json` with required fields §2(c) · redact secrets · `.tmp/` may remain working copy.  
6. Wire `pnpm uc018:perf-load:prove` only under AUTHORIZED coding · EXIT=0 **only if** §1b met · Ban post-hoc retune · Ban invent green · Ban claim production capacity / HA · Ban wash into §1.1 covered · covered-lift = **separate later knife**.

---

## 4. Receipt-path ruling（summary）

`.tmp/` **gitignored**（verified）. Harness currently names **only** `.tmp/…` → **does not** yet require tracked mirror → **CONDITION** for partial/post-prove，**not** case-only blocker. Required tracked path + field list：见 §2(c).

---

## 5. Pins · non-claims

- `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`  
- `coveredCount=8` · `gR45Closed=true` · `ms3EqualsR4Closed=false`  
- §1.1 UC-E2E-018 **partial** · PERF/LOAD **case-only** only · Ban elevate partial this open  
- Ban invent covered · Ban假绿 · Ban假关 · Ban skip UC-011 · Ban Meridian · Ban `.env*`  
- This PASS alone ≠ dual · Ban sign `mw-rag-route`

---

## 6. Verdict

| | |
|--|--|
| **verdict** | **PASS** |
| **tip MATCH** | **exact** `30943df` / `30943dfcc890c5b7f9f62dc38c7584f4eda0f0dd` |
| **24d350f** | **docs-only PASS** |
| **blockers** | **无阻塞** |
| **conditions** | §3 · mandatory before PERF/LOAD partial |
| **receipt-path** | tracked mirror **CONDITION**（harness lacks it today） |
| **authorizeCoding / Prove / partial elevate** | **false / false / false** |

*mw-e2e-ha · PRE-EXEC · UC-E2E-018 PERF/LOAD · 2026-09-23 (~19:40 PT) · Ban peer-sign · Ban coding · Ban prove · Ban elevate partial · Ban invent covered*
