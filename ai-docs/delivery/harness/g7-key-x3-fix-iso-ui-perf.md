# Harness — G7 · **Key×3 fix**（iso / UI / perf · REQUEST open · docs only）

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~19:55 PT)  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ fixed** · **≠ coding authorized** · **Ban假绿** · **Ban claim fixed without EXIT** · **Dual PASS ≠ coding** · **Key×3 honesty dual_pass ≠ suite green**  
**Experts (REQUEST pair)**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual PASS · standing authorize used · coding+prove **executed** · **awaiting post-prove dual** · **Ban self-write post_prove_dual_pass**）  
**Prior A″ honesty**: `harness/g7-key-x3-rerun.md` · **`post_prove_dual_pass:honesty_red`** · dual on **`e697c81`** · EXIT **1/1/1** · **retained**（this knife = **fix REQUEST** · **≠** rewrite honesty_red → green）  
**Slice**: `../g7-key-x3-fix-iso-ui-perf.slice.md`  
**Eval**: `../eval/g7-key-x3-fix-iso-ui-perf.eval.md`  
**Authority**: meetwise — docs-only REQUEST open to fix the three Key×3 reds · Ban假绿 · Dual PASS ≠ coding · Ban claim fixed without EXIT · Ban secrets / `.env*`  
**Honesty**: Prior Key×3 honesty dual_pass on `e697c81` **≠** suite green · **≠** already fixed · standing authorize used · coding+prove **executed** · EXIT **1/1/1** · awaiting post-prove dual · **Ban假绿**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only REQUEST open: plan / gate a **future** fix for the three Key×3 reds（iso api+R5 · UI ingest timeout · perf HTTP E2E） |
| **What this knife is not** | **Not** coding · **not** prove · **not** claiming fixed · **not** suite green · **not** G6/R5/HA close · **not** washing honesty_red → green |
| **Prior A″ dual_pass ⇒ fixed?** | **NO** — Key×3 honesty dual_pass ≠ suite green ≠ authorize coding |
| **Dual PASS here ⇒ coding?** | **NO** — Dual PASS ≠ coding · waits **standing authorize after dual** |
| **Claim fixed without EXIT?** | **Ban** · Ban假绿 |
| **Now** | **`executed:awaiting_post_prove_dual`** · zero coding · zero prove · `releaseEvidence=false` |

---

## 1. Three reds（from A″ receipt · honesty retained）

| # | CMD | EXIT (A″) | Dominant fail class | Fix scope this REQUEST points at |
|---|-----|-----------|---------------------|----------------------------------|
| **iso** | `pnpm e2e:isolated` | **1** | `failureClass=api` · **R5-MARKED-RED** pgvector-legacy | api / pgvector-legacy isolation stack honesty + fix path（**≠** sole cutover claim · **G6 STILL OPEN** until evidence） |
| **UI** | `pnpm e2e:ui:isolated` | **1** | dominant `getByText(/状态:ingested/)` timeout · chromium **ran** · frontend `client_exited` | ingest/status UI path · **chromium ran ≠ UI green** · Ban假绿 |
| **perf** | `pnpm verify:e2e-performance` | **1** | migrate PASS then **HTTP full E2E** `exit=1` | HTTP E2E failures nested in perf suite · **≠ SLO ≠ LOAD ≠ HA** |

**Source**: `receipts/2026-09-17-g7-key-x3-rerun.md` · dual reviews on `e697c81` · `.tmp/g7-key-x3-rerun-20260917/`（local）

---

## 2. Lifecycle（draft · not executed）

| Phase | Gate | This open |
|-------|------|-----------|
| **L0** | REQUEST pair open · `executed:awaiting_post_prove_dual` | **this commit** |
| **L1** | Pre-exec dual (`mw-e2e-ha` + `mw-rag-route`) · Ban self-approve | **await coordinator send** |
| **L2** | **Standing authorize** after dual · Dual PASS ≠ coding | **not yet** |
| **L3** | Standing coding + prove（frozen trio re-run）· Ban invent EXIT · Ban假绿 | **forbidden until L2** |
| **L4** | Post-prove dual · Ban self-write `post_prove_dual_pass` · Ban wash EXIT≠0 → green | **forbidden until L3** |

---

## 3. Pins（must survive dual）

1. **Ban假绿** · do **NOT** wash EXIT=1 into green · **Ban claim fixed without EXIT**  
2. **Dual PASS ≠ coding** · Dual PASS ≠ suite green · Dual PASS ≠ G6/R5/HA close  
3. **Key×3 honesty dual_pass ≠ suite green**（prior A″ on `e697c81` retained）  
4. **`releaseEvidence=false`** · **≠HA** · **≠ suite green**  
5. **R5-MARKED-RED** / **G6 STILL OPEN** until evidence · Ban sole cutover claim from this REQUEST alone  
6. Ban invent Key · Ban read `.env*` · Ban commit secrets  
7. Zero coding / zero prove this open · Ban self-approve  
8. Meridian **banned** · force-push **banned**

---

## 4. Prove CMD honesty（frozen · not run this open）

| CMD | Run status now | Honest read |
|-----|----------------|-------------|
| `pnpm e2e:isolated` | **`not_run:await_authorize`** | Prior A″ EXIT=1 · Ban invent green |
| `pnpm e2e:ui:isolated` | **`not_run:await_authorize`** | Prior A″ EXIT=1 · Ban invent green |
| `pnpm verify:e2e-performance` | **`not_run:await_authorize`** | Prior A″ EXIT=1 · Ban invent green |

---

## 5. Non-claims

Not fixed · not coding authorized · not suite/family green · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not `releaseEvidence=true` · Dual PASS ≠ coding · Key×3 honesty dual_pass ≠ suite green · Ban假绿

---

*Harness · G7 Key×3 fix iso/UI/perf · 2026-09-17 (~19:55 PT) · REQUEST-ready / executed:awaiting_post_prove_dual · Ban假绿 · Dual PASS ≠ coding · Key×3 honesty dual_pass ≠ suite green · releaseEvidence=false · ≠HA · ≠ suite green · zero coding · Ban self-approve*


---

## Execute note（2026-09-17 ~20:18 PT）

**Status**: **`executed:awaiting_post_prove_dual`** · frozen trio re-run · EXIT **1 / 1 / 1** · receipt `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` · **Ban** self-write `post_prove_dual_pass` · **Ban假绿** · FreeTierOnly residual on live chat · UI ingest/stream/golden fixes landed but **≠ suite green** · R5/G6 open · `releaseEvidence=false` · ≠HA
