# Harness — **HA local C3+C4 authorized-prove**（local evidence receipts · ladder **C3 shared + C4 fault-inject** · under explicit env authorize flags · **`executed:awaiting_post_prove_dual`** · **`haStatus=NOT_HA`** · Ban假绿 · Ban claim 阶 C/D green · Ban production HA / failover · **Ban self-nail `post_prove_dual_pass`**）

**Status**: **`executed:awaiting_post_prove_dual`**（authorized local C3+C4 CMD+EXIT receipts landed · **NOT** `post_prove_dual_pass` · Ban self-nail · STOP for post-prove dual · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · **≠ claim 阶 C/D green** · **≠ production HA / failover** · **≠ flip `releaseEvidence`** · **≠ wash G-R4-5 tip `6ded589`/`ba1b8aa` into HA** · **≠ wash skeleton/stub EXIT=0 into HA** · **≠ invent green**）  
**Date**: 2026-09-23 (~14:20 PT)  
**Base / REQUEST tip**: **`a32da03`** / full `a32da0377a16f311399ad03b0befc973b2866081` · branch `feat/mysql-schema-skeleton`  
**Prove tip**: **`397e787`** / full `397e787897a63fd27747165c5d42defcc9fc432d` · parent **`a32da03`** / full `a32da0377a16f311399ad03b0befc973b2866081`
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ production topology** · **≠ 阶 C/D green** · Ban假绿 · Ban invent green · Ban forge receipts · Ban claim production HA / failover · Ban flip `releaseEvidence` to true · Ban wash G-R4-5 nail **`6ded589`** / prove **`ba1b8aa`** into HA · Ban wash skeleton / stub EXIT=0 into HA · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban second knife · Ban self-nail · Key×3 FreeTier **out of scope** · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6 / r4 / funnel product flags **retained** · `releaseEvidence=false` **retained** · ≠HA  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **BOTH PASS** on REQUEST tip `a32da03` · Ban self-approve · post-prove dual **awaiting** · Ban self-nail）  
**Must cite（HA ladder docs · C3 shared + C4 fault-inject authorize flags）**: `harness/ha-track.multi-instance.md` — C3 local shared path needs `--compose-shared` + `MEETWISE_HA_SHARED_AUTHORIZED`（+ dual compose auth `MEETWISE_HA_DUAL_AUTHORIZED` / image via `ha:dual:build-image`）· C4 local fault-inject needs `MEETWISE_HA_FAULT_AUTHORIZED` · default without auth → **PREREQ_GAP** · **local sharedOk / local fault receipt still `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`** · 本地 C3 Redis/MySQL prove ≠ 阶 C 绿 · 本地 C4 compose kill ≠ 生产 failover · 阶 C/D prove **未绿**  
**Prior G-R4-5 product close（CLOSED prior · retained · ≠ wash into HA）**: `harness/g-r4-5-product-close.md` · **`post_prove_dual_pass`** · tip nail **`6ded589`** · prove tip **`ba1b8aa`** / full `ba1b8aa888f74e997757db700bad2bb1a4b01052` · EXIT **2×0** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` **retained** · eg1–eg6 / r4 / funnel **retained** · `releaseEvidence=false` · ≠HA · **retained** · Ban wash into HA · Ban claim HA from gR45 close  
**Why（cite）**: G-R4-5 aggregate product face closed under authorize at tip **`6ded589`** / prove **`ba1b8aa`** · retained · ≠HA · this knife = **HA local C3 shared + C4 fault-inject authorized-prove receipts** under explicit env authorize flags documented in `harness/ha-track.multi-instance.md` · Ban elevating G-R4-5 closed / skeleton EXIT=0 / stub dual livez alone to HA / 阶 C/D green · Ban invent green · 阶 C/D **STILL NOT GREEN** · production HA **NOT claimed**  
**Slice**: `../ha-local-c3-c4-authorized-prove.slice.md`  
**Eval**: `../eval/ha-local-c3-c4-authorized-prove.eval.md`（experts / later · **not** this prove）  
**Prove receipt**: `../receipts/2026-09-23-ha-local-c3-c4-authorized-prove-prove.md` · evidence JSON `../receipts/2026-09-23-ha-local-c3-c4-authorized-prove-evidence.json`  
**Authority**: meetwise — **AUTHORIZED** HA local C3+C4 coding+prove · Ban secrets / `.env*` · Meridian banned · No force-push · Ban Cloud Agent · Ban self-approve · Ban silent HA claim · Ban self-nail `post_prove_dual_pass` · STOP for post-prove dual  
**Honesty**: Landed reproducible **CMD+EXIT receipts** under authorize for `ha:dual:build-image` / `ha:dual:compose-shared` / `ha:prove:shared` / `ha:fault-inject` · **local EXIT=0 ≠ 阶 C/D green ≠ production HA** · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Ban claim 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Ban wash `6ded589`/`ba1b8aa` · Ban wash skeleton/stub EXIT=0 into HA · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · **Ban self-nail** · STOP

---

## Dual receipts（paths named · experts write）

| Expert | Receipt path | Verdict |
|--------|--------------|---------|
| `mw-e2e-ha` (pre-exec) | `../reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-mw-e2e-ha.md` | **PASS**（pre-exec · tip `a32da03`） |
| `mw-rag-route` (pre-exec) | `../reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-mw-rag-route.md` | **PASS**（pre-exec · tip `a32da03`） |
| post-prove dual | *(not opened this tip)* | **awaiting** · Ban self-nail `post_prove_dual_pass` |

**Note**: Pre-exec dual BOTH PASS authorized coding+prove. This tip lands CMD+EXIT receipts only. Status = **`executed:awaiting_post_prove_dual`**. Dual PASS ≠ HA green ≠ 阶 C/D green ≠ production HA ≠ next knife. **Ban self-nail**.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is now** | Authorized local C3+C4 evidence-receipt prove under env authorize flags · CMD+EXIT landed · status **`executed:awaiting_post_prove_dual`** · STOP for post-prove dual |
| **What this knife is not** | **Not** claiming 阶 C/D green · **not** production HA / failover · **not** flipping `releaseEvidence` · **not** washing G-R4-5 tip `6ded589`/`ba1b8aa` into HA · **not** washing skeleton/stub EXIT=0 into HA · **not** inventing green · **not** cloud buy · **not** production topology · **not** CI HA job · **not** D1–D3 production probe · **not** UC covered-lift · **not** Key×3 FreeTier · **not** next knife auto-authorize · **not** second knife · **not** self-nail `post_prove_dual_pass` |
| **≠ G-R4-5 wash into HA** | **YES** — nail **`6ded589`** · prove **`ba1b8aa`** · `gR45Closed=true` · coveredCount **8** · eg1–eg6/r4/funnel retained · `ms3EqualsR4Closed=false` · `releaseEvidence=false` · ≠HA · **retained** · Ban wash into HA |
| **≠ skeleton/stub EXIT=0 wash into HA** | **YES** — skeleton prove / stub dual livez / stub fault-inject EXIT=0 **≠** HA · Ban wash · this tip uses **authorized** compose-shared + prove:shared + fault-inject paths |
| **haStatus / releaseEvidence / claimProductionHA** | **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · Ban flip · Ban假绿 |
| **阶 C/D** | **STILL NOT GREEN** · 本地 C3/C4 receipts under authorize ≠ 阶 C/D green · Ban claim |
| **Key×3 FreeTier** | **out of scope** |
| **Now** | **`executed:awaiting_post_prove_dual`** · prove landed · Ban self-nail · STOP |

---

## 1. Acceptance · prove landed

| # | Gap | Acceptance | This tip |
|---|-----|------------|----------|
| **A1** | Pre-exec dual | Pre-exec dual `mw-e2e-ha` + `mw-rag-route` **BOTH PASS** on REQUEST tip **before** coding / prove | **PASS** both · tip `a32da03` |
| **A2** | Authorize flags | Explicit env authorize: C3 → `MEETWISE_HA_DUAL_AUTHORIZED` + `MEETWISE_HA_SHARED_AUTHORIZED` + image/`ha:dual:build-image` + `--compose-shared` · C4 → `MEETWISE_HA_FAULT_AUTHORIZED` · Ban secrets / `.env*` · Ban Cloud Agent · Ban Meridian | **used** on this tip |
| **A3** | Reproducible CMD+EXIT receipts | Land CMD+EXIT for build-image / compose-shared / prove:shared / fault-inject · EXIT=0 local ≠ 阶 C/D green ≠ production HA · If PREREQ_GAP → honest pin GAP · Ban假绿 | **landed** · EXIT **4×0** · labels `SHARED_OK` + `FAULT_OK` · GAP pins **none** |
| **A4** | Non-claims / Ban wash | Ban claim 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Ban wash G-R4-5 · Ban wash skeleton/stub · keep `haStatus=NOT_HA` · `claimProductionHA=false` | **retained** |
| **A5** | Retain prior G-R4-5 | Retain `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · eg1–eg6/r4/funnel · `releaseEvidence=false` · ≠HA | **retained** |
| **A6** | Post-prove dual → nail → STOP | post-prove dual BOTH PASS → nail → commit+push → **STOP** · Ban self-nail this tip | **awaiting** · status **`executed:awaiting_post_prove_dual`** · **Ban self-nail** |
| **A7** | Out of scope | cloud buy · production topology · CI HA job · D1–D3 · UC covered-lift · Key×3 FreeTier | **pinned** |

---

## 5. Prove CMD honesty（landed · 2026-09-23 ~14:18–14:20 PT）

| CMD | EXIT | Result | Honest read |
|-----|------|--------|-------------|
| `pnpm ha:dual:build-image` | **0** | `IMAGE_BUILT` | local image · ≠ HA · ≠ 阶 C green |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared` | **0** | `DUAL_COMPOSE_SHARED_UP` | C3 path up · still NOT_HA · ≠ production HA |
| `MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove` | **0** | `SHARED_OK`（`sharedPath=shared_backend_hostpath`） | C3 shared local · still NOT_HA · ≠ 阶 C green · Ban假绿 |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor` | **0** | `COMPOSE_FAULT_SHARED_PARTIAL` / `SHARED_OK_SURVIVOR` | C4 local fault · still NOT_HA · ≠ production failover · Ban假绿 |
| prior skeleton / stub paths | retained | Ban wash into HA | — |

**Prereq**: `docker compose -f docker/compose.mysql-local.yml up -d mysql redis`（sole network `meetwise-mysql-local_default` healthy）before compose-shared.  
**GAP pins**: **none**.  
**Hard**: local EXIT=0 ≠ 阶 C/D green ≠ production HA · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`.

---

## 3. Lifecycle（L3 executed · L4 awaiting）

| Phase | Gate | This tip |
|-------|------|----------|
| **L0** | REQUEST pair open | done · base **`6ded589`** · REQUEST tip **`a32da03`** |
| **L1** | Pre-exec dual | **PASS** both · Ban self-approve |
| **L2** | Standing authorize after dual | **authorized** · Dual PASS ≠ coding · Dual PASS ≠ HA green |
| **L3** | Authorized coding + local C3+C4 receipts | **executed** · EXIT 4×0 · keep `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · 阶 C/D STILL NOT GREEN |
| **L4** | Post-prove dual | **awaiting** · Ban wash into HA / 阶 C/D · Ban self-nail |
| **L5** | Authorized lifecycle nail + STOP | **not_run** · Ban second knife · Ban self-nail |

---

## 4. Pins（must survive · Ban假绿）

1. **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · 阶 C/D **STILL NOT GREEN** · production HA **NOT claimed**  
2. **≠ wash G-R4-5** tip `6ded589` / prove `ba1b8aa` · `gR45Closed=true` retained · coveredCount **8** retained · `ms3EqualsR4Closed=false` retained · eg1–eg6/r4/funnel retained · Ban wash into HA  
3. **≠ wash skeleton/stub EXIT=0 into HA** · Ban invent green  
4. Cite `harness/ha-track.multi-instance.md` authorize flags used this tip  
5. Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Ban second knife · **Ban self-nail `post_prove_dual_pass`**  
6. Out of scope: cloud buy · production topology · CI HA job · D1–D3 · UC covered-lift · Key×3 FreeTier  
7. Status this tip = **`executed:awaiting_post_prove_dual`** · STOP for post-prove dual

---

## 6. Non-claims / Out of scope

- Not claiming 阶 C/D green · not production HA / failover · not flipping `releaseEvidence` · not washing `6ded589`/`ba1b8aa` into HA · not washing skeleton/stub EXIT=0 into HA · not inventing green · not cloud buy · not production topology · not CI HA job · not D1–D3 · not UC covered-lift · not Key×3 FreeTier · not second knife · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Ban假绿 · Ban self-nail · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`**

---

*Harness · HA local C3+C4 authorized-prove · 2026-09-23 (~14:20 PT) · executed:awaiting_post_prove_dual · EXIT 4×0 · SHARED_OK + FAULT_OK local · base a32da03 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · cite harness/ha-track.multi-instance.md · gR45Closed=true retained · coveredCount 8 retained · ms3EqualsR4Closed=false retained · eg1–eg6/r4/funnel retained · ≠ wash G-R4-5 6ded589/ba1b8aa into HA · ≠ wash skeleton/stub EXIT=0 into HA · Ban claim 阶 C/D green · Ban production HA/failover · Ban flip releaseEvidence · Ban invent green · Ban假绿 · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Ban Cloud Agent · Ban Meridian · Ban secrets/.env* · Ban second knife · Ban self-nail post_prove_dual_pass · STOP*
