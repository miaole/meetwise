# Harness — **MODEL-OP real reconciler wiring**（coding REQUEST · ≠ W5 docs close）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 (~19:30 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ MODEL-OP fake green** · **≠ reconciler/wakeup cutover claimed** · **≠ coding authorized this prep** · **Ban false green** · **Dual PASS ≠ coding**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**not yet dual-sent** · **Ban self-approve** · **Dual PASS ≠ authorize coding this prep** · **zero coding this turn**）  
**Note**: `mw-model-op` optional later for domain cutover honesty · not required on this REQUEST pair  
**Slice**: `../model-op-real-reconciler-wiring.slice.md`  
**Eval**: `../eval/model-op-real-reconciler-wiring.eval.md`  
**Authority**: meetwise — **real dual-reconciler / wakeup coding REQUEST** · **≠ W5 docs-only close** · prod **PG LISTEN/NOTIFY provisional** · **Redis deferred** · PG retained  
**Honesty**: W5 dual on `25833fc` = docs honesty only · real wiring needs **this separate REQUEST** · this turn = REQUEST open only · **zero coding**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | REQUEST-ready **coding** knife: after dual+authorize, implement/wire dual reconciler + wakeup honesty path under PG-retained · **≠** re-closing W5 docs |
| **What this knife is not** | **Not** W5 docs close redo · **not** Redis cutover · **not** claiming MODEL-OP / SLO / HA green · **not** coding **this turn** · **not** removing PG LISTEN · **not** MySQL/Qdrant reopen |
| **W5 relationship** | W5 = docs honesty **`post_prove_dual_pass`** · **≠** coding auth · this knife = the **separate coding REQUEST** W5 pointed at |
| **Prod wakeup** | Keep **PG LISTEN/NOTIFY** (`meetwise_worker_wakeup_v1`) **provisional** |
| **Redis wake** | **Deferred** · orthogonal · **not STOPPED** · Ban cutover claim here |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · zero coding · Ban self-approve |

---

## 1. Prior inventory（W5 + M3 · pointers）

| Artifact | Honesty |
|----------|---------|
| W5 harness/slice/eval | Docs closed · ≠ MODEL-OP fake green · coding needs separate REQUEST (**this**) |
| M3 selection | Selection only · 不切生产 wakeup · 不宣称 reconciler 已接/已切 |
| `model-invocation-reconcile` | Prove possible · ≠ production cutover |
| `usageCalibrationReconciler` / model-op00 | 同列 · ≠ 已接生产主链 |
| `job-wakeup-listener` + NOTIFY | **Provisional prod keep** |
| Redis Streams prototype | Flag-off · deferred cutover · not STOPPED |
| GAP-MOP-01…03 / BUG-NOTIFY-REC | Still open honesty · Ban SLO forge |

---

## 2. Planned coding scope（AFTER dual + authorize only · **not this turn**）

| Face | Planned work (future) | Hard ban |
|------|----------------------|----------|
| Dual reconciler | Wire/integrate invocation reconcile + usage-calibration reconciler on worker path with honest prove | Ban forge SLO · Ban claim cutover without evidence |
| Wakeup | Keep PG LISTEN/NOTIFY provisional; improve reconcile coverage for lossy NOTIFY | Ban delete PG listener · Ban Redis-only force |
| Redis | Remain deferred / additive flag-off | Ban Redis cutover claim |
| Evidence | `releaseEvidence=false` until separate authorize | Ban HA/suite green |

**This prep**: document scope + REQUEST only · **zero application coding** · **zero prove as close**.

---

## 3. Pins (must survive dual)

1. **≠ W5 docs close** · this is separate coding REQUEST  
2. Prod wakeup = **PG LISTEN/NOTIFY provisional** · Ban remove without authorize  
3. **Redis wake deferred** · not STOPPED · ≠ cutover this knife  
4. Dual reconciler 同列 · wiring green ≠ MODEL-OP fake green ≠ SLO ≠ cutover claimed without evidence  
5. **Dual PASS ≠ authorize coding this prep** · Ban self-approve · **zero coding this turn**  
6. Later coding only after dual PASS **and** explicit authorize · Ban false green  
7. `releaseEvidence=false` · ≠HA · ≠suite · PG retained · MySQL/Qdrant STOPPED  
8. Ban secrets / `.env*`

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`not_run:pre_dual`** · **zero coding this turn** |
| Planned after authorize (not run now) | `pnpm model-invocation-reconcile:prove` · `pnpm model-op00-usage-reconciler:prove` · `pnpm worker-wakeup:prove` — **Ban** treating prior EXIT as MODEL-OP closed / this knife green |
| Redis prove (reference) | `pnpm worker-wakeup-redis:prove` — deferred · ≠ cutover |

---

## 5. Non-claims

Not W5 redo · not coding this turn · not Redis cutover · not SLO/MODEL-OP fake green · Dual PASS ≠ authorize coding this prep · Ban false green · Ban self-approve · `releaseEvidence=false`

---

*Harness · MODEL-OP real reconciler wiring · 2026-09-17 (~19:30 PT) · REQUEST-ready / not_run:pre_dual · ≠ W5 docs close · PG LISTEN provisional · Redis deferred · Ban false green · releaseEvidence=false · ≠HA · Dual PASS ≠ authorize coding · zero coding this turn · Ban self-approve*
