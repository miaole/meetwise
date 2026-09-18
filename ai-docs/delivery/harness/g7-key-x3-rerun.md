# Harness — G7 · **Key×3 re-run**（frozen trio · standing authorize · honesty_red）

**Status**: **`post_prove_dual_pass:honesty_red`**（Key **set** · EXIT **1/1/1** · post-prove dual **BOTH PASS** · honesty of red-with-Key-set · **≠** suite/family green）  
**Date**: 2026-09-17 ~19:50 PT · standing authorize execute · trio **re-executed** EXIT **1/1/1** · post-prove dual **BOTH PASS** · **no invent Key** · **never paste Key** · **no re-run**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **sole ≠ retired** · **R5-MARKED-RED retained** · **G6 STILL OPEN** · **Key set ≠ suite green** · **Key set ≠ auto green** · **EXIT=1 ≠ wash to green** · **Ban假绿** · **Dual ≠ coding** · **A unset honesty retained** · **A′ honesty_red_key_set retained**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（post-prove **BOTH PASS** · dual on prove SHA **`e697c81`** · **no self-approve**）  
**Slice**: `../g7-key-x3-rerun.slice.md`  
**Eval**: `../eval/g7-key-x3-rerun.eval.md`  
**Receipt**: `../receipts/2026-09-17-g7-key-x3-rerun.md`  
**Prior A**: `harness/g7-key-blocked-x3-honesty.md`（unset-era · **retained**）  
**Prior A′**: `harness/g7-key-live-x3.md`（`post_prove_dual_pass:honesty_red_key_set` · **historical retained** · **not** rewritten green）  
**Complement**: `harness/g6-e2e-iso-blocked.md`（**G6 STILL OPEN**）· UI′ chromium-ran honesty · R5 mark-red / pgvector-legacy  
**Authority**: meetwise standing · Key×3 re-run · post-prove dual **BOTH PASS** · honesty of red-with-Key-set only · **Ban假绿** · **Dual PASS ≠ suite green ≠ coding**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Fresh standing-authorize re-run of frozen trio：`pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance` · Key **set** · EXIT **1/1/1** · post-prove honesty dual |
| **What this knife is not** | Not suite green · not family green · not G6 closed · not R5 closed/retired · not HA · not sole cutover · not product coding · **not** wash EXIT=1 into green |
| **Key set ≠ suite green** | Presence of Key **does not** invent suite/family/covered/SLO/LOAD/HA green |
| **≠HA** | Dual honesty pass **≠** HA |
| **Ban假绿** | Do **NOT** wash EXIT=1 into green · do **NOT** claim fixed without EXIT |
| **R5-MARKED-RED retained** | pgvector-legacy banner on iso/UI/perf · **independent of Key** · ≠ sole cutover |
| **G6 STILL OPEN** | BUG-E2E-ISO **not** closed by Key×3 red honesty |
| **A / A′ retained** | Prior unset-era + historical Key-set honesty_red **not** rewritten green · this = **fresh** Key×3 honesty row |
| **Dual ≠ coding** | Dual PASS = honesty only · **≠** authorize fix coding |
| **Now** | **`post_prove_dual_pass:honesty_red`** · Ban假绿 · **no re-run** · `releaseEvidence=false` |

---

## 1. Exact scripts（frozen trio）

| CMD | Exact script | EXIT (this re-run) |
|-----|--------------|--------------------|
| **`pnpm e2e:isolated`** | `node scripts/run-e2e-isolated.mjs e2e:prove` | **1** · api / **R5-MARKED-RED** pgvector-legacy |
| **`pnpm e2e:ui:isolated`** | `node scripts/run-e2e-isolated.mjs e2e:ui` | **1** · chromium **ran** · dominant `状态:ingested` timeout · 14 failed / 4 passed / 4 skipped |
| **`pnpm verify:e2e-performance`** | `node scripts/run-e2e-performance-suite.mjs` | **1** · HTTP full E2E fail after migrate PASS |

**Presence probe（name only）**：`NEW_SHELL_STATUS=set` · authorized `source /home/box/.meetwise-secrets/load-model-api-key.sh` · **no invent Key** · **never print value** · **never read `.env*`**

**EXIT table（frozen trio）**: **1 / 1 / 1**

---

## 2. Dual receipts（post-prove · archived）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md` | **pass**（honesty / EXIT 对账 only） |
| `mw-rag-route` | `../reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-rag-route.md` | **pass**（red-with-Key-set honesty only） |

**Prove / dual SHA**: **`e697c81`**（receipt + post-prove REQUESTs · `docs(delivery): record G7 Key×3 re-run receipt + post-prove REQUESTs`）.  
**REQUEST pair（historical）**: `reviews/REQUEST-2026-09-17-g7-key-x3-rerun-post-prove-mw-{e2e-ha,rag-route}.md`

Dual PASS = **honesty of red-with-Key-set** only · **≠** suite green · **≠** HA · **≠** G6/R5 closed · **≠** coding authorize · `releaseEvidence=false`.

---

## 3. Acceptance（post-prove dual BOTH PASS · honesty_red）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Frozen trio CMDs exact · executed under standing authorize | **met** |
| **M2** | Key inject path · NEW_SHELL_STATUS=**set** name-only · no invent Key / no `.env*` | **met** |
| **M3** | EXIT **1/1/1** honesty · Ban假绿 · Key set ≠ suite green · ≠HA | **met** |
| **M4** | R5-MARKED-RED retained · G6 STILL OPEN · A/A′ historical retained | **met** |
| **M5** | Experts = e2e-ha + rag-route · dual on `e697c81` BOTH PASS | **met** |
| **M6** | Status **`post_prove_dual_pass:honesty_red`** · Dual ≠ coding · `releaseEvidence=false` | **met** |
| **M7** | Ban wash EXIT=1 → green · Ban claim suite green · Ban secrets leak | **met** |

---

## 4. Evidence anchors

| Source | Observation |
|--------|-------------|
| Receipt | `receipts/2026-09-17-g7-key-x3-rerun.md` · EXIT **1/1/1** · NEW_SHELL_STATUS=**set** |
| Raw | `.tmp/g7-key-x3-rerun-20260917/{01,02,03}-*.log` + `EXIT-*.txt`（local · not committed） |
| e2e JSON | `.tmp/e2e-receipts/2026-09-18T02-29-59-…json` · `…02-37-14-…json` · `…02-35-55-…json` |
| Post-prove BOTH PASS | reviews above · dual on **`e697c81`** |
| G6 | `harness/g6-e2e-iso-blocked.md` · **G6 STILL OPEN** |
| A / A′ | unset + historical Key-set honesty_red **retained** |

---

## 5. Non-claims

Not suite/family green · not covered · not G6 closed · not R5 closed/retired · not sole cutover · not SLO/LOAD/HA · not `releaseEvidence=true` · not Key invent · not wash EXIT=1 → green · Dual PASS ≠ coding · Dual PASS ≠ suite green · A/A′ not rewritten green

---

*Harness · G7 Key×3 re-run · 2026-09-17 ~19:50 PT · post_prove_dual_pass:honesty_red · dual on e697c81 · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA · Key set ≠ suite green · Ban假绿 · R5-MARKED-RED retained · G6 STILL OPEN · Dual ≠ coding · A/A′ retained · no invent Key · no re-run*
