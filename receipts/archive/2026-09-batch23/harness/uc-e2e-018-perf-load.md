# Harness — **UC-E2E-018 PERF/LOAD**（`GAP-UC018-PERF-LOAD` · **NHP-018-PERF-01** + **NHP-018-LOAD-01** · AUTHORIZED nail · **`post_prove_dual_pass`** · **GAP CLOSED** · NHP PERF+LOAD **partial** · §1.0 PERF/LOAD **partial** THIS UC only · §1.1 stays **partial** · **PERF/LOAD partial ≠ UC covered** · Ban invent covered · Ban flip §1.1 covered · Ban claim production capacity / HA · Ban wash ADV/SOLE/reassess into covered · Ban skip to UC-011 · Ban MySQL/Qdrant cutover · Ban claim suite green / HA / R5 retired globally · Ban second knife · Ban next REQUEST）

**Status**: **`post_prove_dual_pass`**（AUTHORIZED coding+prove + post-prove dual BOTH PASS · `GAP-UC018-PERF-LOAD` **CLOSED** · **NHP-018-PERF-01** + **NHP-018-LOAD-01** **partial** · matrix §1.0 PERF/LOAD **partial** THIS UC only · §1.1 stays **partial** · **PERF/LOAD partial ≠ UC covered** · Ban invent covered · Ban假关 · Ban claim production capacity/HA · Dual PASS ≠ invent covered · Dual PASS ≠ next knife · STOP）
**Date**: 2026-09-23 (~20:00 PT)
**Prove tip**: **`b29c191`** / full `b29c191543dfbe7c1afa4278c550340a3339f295`（`feat(e2e): UC018 PERF/LOAD prove + elevate case-only→partial` · Method freeze Step A **`8c7ee0c`** / full `8c7ee0c1532e04467296dccb1797520124fbebce` **is ancestor**）
**Post-prove dual（evidence of record）**:
| Expert | Tip short / full | Receipt | Verdict |
|--------|------------------|---------|---------|
| `mw-e2e-ha` | **`1745bee`** / `1745bee67d6d2023509dfc685b48d37db1eaa78e` · correction append **`bdf921e`** / `bdf921ef3117486ec917b93b1d3429217b923a1d`（retract #3 「仍计算」· PASS stands） | `../reviews/REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-e2e-ha.md` | **PASS** |
| `mw-rag-route` | **`37c89dc`** / `37c89dc6ebd483e133137311cee343b4e1297894` · correction **`e33dd63`** / `e33dd63f91fd60dd7523e1f8a12c8dd5111c419a`（canHonestlyFlip = constant false） | `../reviews/REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-rag-route.md` | **PASS** |
**Evidence of record = reviewers' independent runs at `b29c191`**（cite numbers below）· implementer tracked receipts under `ai-docs/delivery/receipts/uc018-perf-load/` carry `gitSha=8c7ee0c` from an **uncommitted runner** at run time → **implementer pre-commit runs · not evidence of record**（retained · do not delete · see receipt README）
**Base / parent tip**: sits on reassess nail **`0b7a218`** / full `0b7a218d6e32b7461aa7ce85e03e7f805f1aac06`（`GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · **at prove tip `5cddb53`** · **canHonestlyFlip was computed** · refuse then：**PERF/LOAD blind** · **must remain ancestor**）· ADV **`27dd6ae`** · covered-lift **`abfbbc0`** · SOLE **`aa968b1`** · UI **`1990b12`** · TTL **`d698282`** · GRAPH **`08650ea`** · FULL-E2E **`c36b032`** · waiting_user CLOSED · HA D2b **`7fddebe`** CLOSED · Ban reopen · Ban wash · branch `feat/mysql-schema-skeleton`（historical · Ban MySQL cutover）
**Knife name**: **UC-E2E-018 PERF/LOAD · GAP-UC018-PERF-LOAD · NHP-018-PERF-01 + NHP-018-LOAD-01**（THIS UC · PERF+LOAD columns only · **GAP CLOSED** · **NOT** invent covered · **NOT** wash PERF/LOAD partial into covered · Ban skip to UC-011 · Ban second knife · Ban next REQUEST）
**Critical stack pin**: `adr-postgres-retained.md` · retained sole = **Postgres (+pgvector + PostgresSaver)** · **Ban** MySQL business cutover · **Ban** Qdrant-as-required-vector · PG-retained · STOPPED R5 cutover harnesses remain STOPPED
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ UC-E2E-018 covered** · **≠ R5 retired globally** · Ban假绿 · Ban invent covered · Ban forge receipts · Ban flip `releaseEvidence` · Ban flip §1.1 to **covered** · Ban wash SOLE/UI/TTL/GRAPH/FULL-E2E/HTTP/covered-lift/ADV/reassess/D2b/HA/PERF alone into UC covered · Dual PASS ≠ invent covered · Dual PASS ≠ next knife · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban second knife · Ban next REQUEST · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6 / r4 / funnel **retained** · prior nails **`post_prove_dual_pass`** **retained**
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec BOTH PASS · `64cc57c` / `4964dc2` · post-prove BOTH PASS · `1745bee`+`bdf921e` / `37c89dc`+`e33dd63` · Ban自批 · Dual PASS ≠ next knife）
**Must cite**: prove tip **`b29c191`** · Step A **`8c7ee0c`** · post-prove **`1745bee`** / **`37c89dc`**+**`e33dd63`** · Method freeze thresholds unchanged · `testing/e2e-performance-evidence.md` · `adr-postgres-retained.md` · matrix §0.5/§1.0 · §1.1 **partial** · P0-8 · Ban invent covered · Ban claim production capacity / HA · Ban skip to UC-011
**Slice**: `../uc-e2e-018-perf-load.slice.md`
**Parent harness（honesty touch）**: `harness/uc-e2e-018-user-abandon.md` — name **PERF/LOAD post_prove_dual_pass** · GAP CLOSED · NHP PERF+LOAD **partial** · §1.1 stays **partial** · Ban invent covered · Ban skip to UC-011
**Authority**: meetwise — AUTHORIZED nail for **UC-E2E-018 PERF/LOAD · GAP-UC018-PERF-LOAD** · status `post_prove_dual_pass` · Ban secrets / `.env*` · Meridian banned · No force-push · Ban Cloud Agent · Ban invent covered · Ban flip §1.1 · Ban second knife · Ban next REQUEST
**Honesty**: AUTHORIZED nail · status `post_prove_dual_pass` · `GAP-UC018-PERF-LOAD` **CLOSED** · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **partial** · §1.0 PERF/LOAD **partial** THIS UC only · §1.1 **partial** · **PERF/LOAD partial ≠ covered** · local PERF/LOAD ≠ capacity ≠ HA · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · STOP · no next REQUEST

---

## Dual receipts（named · recorded）

| Expert | Receipt path | Status |
|--------|--------------|--------|
| pre-exec `mw-e2e-ha` | `../reviews/REQUEST-2026-09-23-uc-e2e-018-perf-load-mw-e2e-ha.md` | **PASS** · tip **`64cc57c`** |
| pre-exec `mw-rag-route` | `../reviews/REQUEST-2026-09-23-uc-e2e-018-perf-load-mw-rag-route.md` | **PASS** · tip **`4964dc2`**（subject template `PASS\|FAIL` quirk · body PASS） |
| post-prove `mw-e2e-ha` | `../reviews/REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-e2e-ha.md` | **PASS** · tip **`1745bee`** · correction **`bdf921e`** · prove tip **`b29c191`** |
| post-prove `mw-rag-route` | `../reviews/REQUEST-2026-09-23-uc-e2e-018-perf-load-post-prove-mw-rag-route.md` | **PASS** · tip **`37c89dc`** · correction **`e33dd63`** · prove tip **`b29c191`** |

**Note**: post-prove dual BOTH PASS · nail tip = this commit · Dual PASS ≠ UC-E2E-018 covered · Dual PASS ≠ §1.1 flip · Dual PASS ≠ invent covered · Dual PASS ≠ next knife · Ban自批.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | AUTHORIZED coding+prove + post-prove dual BOTH PASS + AUTHORIZED nail for **UC-E2E-018 PERF/LOAD · GAP-UC018-PERF-LOAD · NHP-018-PERF-01 + NHP-018-LOAD-01** · elevate §1.0 PERF/LOAD **case-only→partial**（THIS UC only）· **GAP CLOSED** · status **`post_prove_dual_pass`** · STOP |
| **What this knife is not** | **Not** invent covered · **not** flip §1.1 covered · **not** claim production capacity / HA · **not** wash PERF/LOAD into covered · **not** skip to UC-011 · **not** MySQL/Qdrant cutover · **not** suite green / R5 retired globally · **not** a covered-lift knife（separate later）· **not** next REQUEST |
| **NHP-018-PERF-01** | PERF · api · **partial** · post_prove_dual_pass · Ban wash into §1.1 covered |
| **NHP-018-LOAD-01** | LOAD · worker/api taxonomy · **partial** · measured path = capped API（release+graph safe-terminate inside capped API）· **`workerCapEnforced=false`**（no separately capped worker）· Ban wash into covered |
| **PERF/LOAD partial ≠ UC covered** | **YES** · §1.1 stays **partial** · Ban wash |
| **local ≠ capacity ≠ HA** | **YES** · cite `testing/e2e-performance-evidence.md` · p99 at N=100 statistically weak（disclosed）· Ban claimProductionHA |
| **haStatus / releaseEvidence / claimProductionHA** | **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · Ban flip |
| **Matrix / UC covered** | UC-E2E-018 §1.1 stays **partial** · Ban invent covered · Ban假关 · covered-lift = separate later knife |
| **Now** | **`post_prove_dual_pass`** · GAP CLOSED · NHP PERF+LOAD **partial** · §1.0 PERF/LOAD **partial** · §1.1 **partial** · Ban invent covered · STOP · no next REQUEST |

---

## 1. Nail record · HARD pins（AUTHORIZED）

### 1.0 Status · GAP · columns

| Pin | Value |
|-----|-------|
| Status | **`post_prove_dual_pass`** |
| GAP-UC018-PERF-LOAD | **CLOSED** |
| NHP-018-PERF-01 | **partial** |
| NHP-018-LOAD-01 | **partial** |
| §1.0 PERF/LOAD | **partial** THIS UC only |
| §1.1 UC-E2E-018 | stays **partial** · Ban flip |
| PERF/LOAD partial ≠ UC covered | **YES** |

### 1.1 Evidence of record（reviewers · `b29c191`）

**Evidence of record = reviewers' independent runs at `b29c191`**（mw-e2e-ha `1745bee`；mw-rag-route `37c89dc` + correction `e33dd63`）.

#### mw-e2e-ha independent · tip `1745bee` · HEAD=`b29c191` · EXIT=0 · caps NanoCpus=2e9 Memory=4GiB

| Facet | Run | p50 | p95 | p99 | err | dbl/stuck | passed |
|-------|-----|-----|-----|-----|-----|-----------|--------|
| PERF | 1 | 22.850 | 64.109 | 114.877 | 0 | — | true |
| PERF | 2 | 18.024 | 52.366 | 64.672 | 0 | — | true |
| PERF | 3 | 18.139 | 43.579 | 68.583 | 0 | — | true |
| LOAD | 1–3 | — | — | — | 0 | 0 / 0 | true |

#### mw-rag-route independent · tip `37c89dc`（+`e33dd63`）· HEAD=`b29c191` · EXIT=0 · caps same

| Facet | Run | p50 | p95 | p99 | err | dbl/stuck | passed |
|-------|-----|-----|-----|-----|-----|-----------|--------|
| PERF | 1 | 22.6 | 66.5 | 93.7 | 0 | — | true |
| PERF | 2 | 20.2 | 41.9 | 61.7 | 0 | — | true |
| PERF | 3 | 20.2 | 45.1 | 76.3 | 0 | — | true |
| LOAD | 1–3 | — | — | — | 0 | 0 / 0 | true |

### 1.2 Implementer receipts · **not evidence of record**

Tracked mirrors `ai-docs/delivery/receipts/uc018-perf-load/*` · `gitSha=8c7ee0c…` · **implementer pre-commit runs · not evidence of record**（runner was uncommitted at implementer run · landed in tip `b29c191`）· **retained · do not delete** · label file `receipts/uc018-perf-load/README.md`. Elevate eligibility rests on tip code + dual re-run at `b29c191`.

### 1.3 Cap pin · `workerCapEnforced=false`

| Pin | Value |
|-----|-------|
| **workerCapEnforced** | **`false`** |
| Meaning | No separately capped `apps/worker` container |
| Measured surface | Release + graph safe-terminate execute **inside the capped API container**（+ capped isolated PG）via `abandonInterviewAndRelease` · Promise `workers` = client concurrency only |
| Caps | Docker `--cpus=2 --memory=4g` · NanoCpus=2e9 · Memory=4GiB on **PG + API** · `enforced=true` for measured surface |
| Ban | Ban claim separate worker was capped · Ban elevate to capacity/HA |

### 1.4 Regression pin · `canHonestlyFlip` at `b29c191` = **constant-false no-flip guard · not an assessment**

| Fact | Record |
|------|--------|
| At reassess prove **`5cddb53`** | `let canHonestlyFlip = true` then set `false` on failing columns · **was a real computable assessment** · refuse then：**PERF/LOAD blind** · nail `0b7a218` honest non-flip assessment is about **that** tip |
| At prove tip **`b29c191`** | `scripts/uc-e2e-018-covered-lift-reassess.proof.mjs` changed so `canHonestlyFlip` is initialised **`false`** and **never set `true`** · unconditional hard refuse `reassess-knife-refuses-§1.1-flip` · true-branch unreachable |
| Ruling | At `b29c191`，`canHonestlyFlip` is a **constant-false no-flip guard, not an assessment** |
| Ban | **Ban** citing it as 「assessed, cannot flip」 / 「经计算得出的不可翻转」 / 「still computes from matrix」 |
| Corrections | mw-rag-route `e33dd63` + mw-e2e-ha `bdf921e` retract earlier 「仍计算」wording · PASS stands |

### 1.5 Carried condition（blocks later covered-lift / §1.1 flip）

Any later covered-lift or §1.1 flip knife **must first** restore a **real computable six-column evaluator** that **can return `true`**, with a **written criterion** for when a column counts as covered, and **pass dual**；otherwise that knife **FAIL**s. Ban wash constant-false into 「已评估不可翻」. Ban invent covered from PERF/LOAD partial alone.

### 1.6 Other hard pins retained

| Pin | Value |
|-----|-------|
| local PERF/LOAD ≠ capacity ≠ HA | **YES** |
| p99 at N=100 | statistically weak（nearest-rank ≈ single near-worst sample）· disclosed |
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| PG-retained | **YES** · Ban MySQL/Qdrant cutover |
| Thresholds vs freeze / `30943df` | **UNCHANGED** · PERF N=100 c=10 p50≤250 p95≤750 p99≤1500 err≤0.5% · LOAD N=50 c=20 err≤1% no-dbl no-stuck |

---

## 2. Acceptance（nail recorded）

| # | Gap | This nail |
|---|-----|-----------|
| **A1** | Pre-exec dual BOTH PASS | **PASS** · `64cc57c` + `4964dc2` |
| **A2** | Register NHP PERF+LOAD | **DONE** · elevated **partial** |
| **A3** | Matrix §1.0 PERF/LOAD honesty | **DONE** · **partial** THIS UC only · §1.1 stays **partial** |
| **A4** | `pnpm uc018:perf-load:prove` EXIT=0 | **DONE** · prove tip `b29c191` · dual re-run EXIT=0 |
| **A5** | Thresholds frozen · Ban post-hoc retune | **HOLD** · Method freeze `8c7ee0c` ancestor |
| **A6** | Non-claims / Ban wash | Hard-pinned · see §1 |
| **A7** | Retain priors + PG-retained | Retained |
| **A8** | Lifecycle → STOP | **PASS** · post-prove dual BOTH PASS · nail this commit · STOP · no next REQUEST |
| **A9** | Out of scope | Invent covered · §1.1 flip · capacity/HA · skip UC-011 · MySQL/Qdrant · Meridian · Cloud Agent · secrets · next REQUEST · covered-lift knife |

---

## 3. Method freeze（retained · Ban post-hoc retune）

Step A **`8c7ee0c`** · nearest-rank · client hrtime · timeout 10s=error · warmup 10 excluded · 3 runs all-must-pass · p99 weakness disclosed · caps Docker `--cpus=2 --memory=4g` · N/c/thresholds UNCHANGED from REQUEST.

---

## 4. Prove CMD（executed · dual re-run PASS）

```bash
pnpm uc018:perf-load:prove  # EXIT=0 at b29c191 · dual independent re-runs EXIT=0
```

Family CMDs cite prior EXIT=0 · retained.

---

## 5. Lifecycle（nail recorded · STOP）

| Phase | This nail |
|-------|-----------|
| L0 REQUEST | DONE · tip `30943df` |
| L1 Pre-exec dual | DONE · `64cc57c` / `4964dc2` |
| L2 AUTHORIZED coding+prove | DONE · Step A `8c7ee0c` · prove tip `b29c191` · elevate PERF/LOAD **partial** |
| L3 awaiting_post_prove | superseded |
| L4 post-prove dual | BOTH PASS · `1745bee`(+`bdf921e`) / `37c89dc`(+`e33dd63`) |
| L5 AUTHORIZED nail → `post_prove_dual_pass` → STOP | **current** · `GAP-UC018-PERF-LOAD` **CLOSED** · §1.1 stays **partial** · Ban invent covered · Ban next REQUEST |

---

## 6. Hard retain

- **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`**
- **`gR45Closed=true`** · **coveredCount=8** · **`ms3EqualsR4Closed=false`**
- Matrix §1.1 UC-E2E-018 **partial** · Ban假关 · Ban invent covered
- §1.0 PERF/LOAD **partial**（THIS UC only）· **≠** UC covered · Ban claim production capacity
- **workerCapEnforced=false** · release+safe-terminate inside capped API
- **canHonestlyFlip @ b29c191** = constant-false no-flip guard · **not** an assessment · Ban 「assessed, cannot flip」
- Carried condition：later covered-lift / §1.1 flip must restore computable six-column evaluator that can return true + written covered criterion + dual PASS · else FAIL
- Retained sole = **Postgres (+pgvector + PostgresSaver)** · Ban MySQL/Qdrant cutover
- Evidence of record = dual independent runs at `b29c191` · implementer receipts = **not evidence of record**
- Prior nails reassess/`0b7a218` · ADV/`27dd6ae` · covered-lift/`abfbbc0` · SOLE/`aa968b1` · UI/TTL/GRAPH/FULL-E2E · D2b/`7fddebe` **retained**

---

*Harness · UC-E2E-018 PERF/LOAD · GAP-UC018-PERF-LOAD · NHP-018-PERF-01 + NHP-018-LOAD-01 · 2026-09-23 (~20:00 PT) · post_prove_dual_pass · GAP CLOSED · prove tip b29c191 · Step A 8c7ee0c · post-prove dual 1745bee(+bdf921e)/37c89dc(+e33dd63) · evidence of record = dual runs · implementer receipts not evidence of record · NHP PERF+LOAD partial · §1.0 PERF/LOAD partial · §1.1 partial · workerCapEnforced=false · canHonestlyFlip@b29c191 constant-false no-flip guard not assessment · local ≠ capacity ≠ HA · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount 8 · ms3EqualsR4Closed=false · PG-retained · Ban invent covered · Ban skip to UC-011 · Ban next REQUEST · STOP*
