# Harness — **MODEL-OP real reconciler wiring**（coding REQUEST · ≠ W5 docs close）

**Status**: **`post_prove_dual_pass`**（**prep/docs gate only**）  
**Date**: 2026-09-17 (~19:42 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ MODEL-OP fake green** · **≠ reconciler/wakeup cutover claimed** · **≠ already wired** · **Ban false green** · **Dual prep ≠ already wired**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · **Ban self-approve** · Dual prep ≠ already wired · prep Dual PASS ≠ claim reconciler wired）  
**Note**: `mw-model-op` optional later for domain cutover honesty · not required on this REQUEST pair  
**Slice**: `../model-op-real-reconciler-wiring.slice.md`  
**Eval**: `../eval/model-op-real-reconciler-wiring.eval.md`  
**Authority**: meetwise — **real dual-reconciler / wakeup coding REQUEST** · **≠ W5 docs close** · prod **PG LISTEN/NOTIFY provisional** · **Redis deferred** · PG retained  
**Honesty**: Dual reviews against knife SHA **`0137f39`**. Prep/docs gate close only · **Dual prep ≠ already wired** · W5 dual on `25833fc` = docs honesty only · **≠ W5 masquerade** · coding/wiring needs **standing authorize** (separate from this prep Dual) · `releaseEvidence=false`

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-model-op-real-reconciler-wiring-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `../reviews/2026-09-17-model-op-real-reconciler-wiring-mw-rag-route.md` | **pass** |

Dual knife SHA: **`0137f39b23e97adf1d6d1a956afa37133d0f6ee5`** (short **`0137f39`**). Prep/docs gate only — **≠** already wired · **≠** W5 redo · **≠** Redis cutover · **≠** MODEL-OP fake green · **≠** HA/suite · `releaseEvidence=false`.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Coding REQUEST knife: after dual+**standing authorize**, implement/wire dual reconciler + wakeup honesty path under PG-retained · **≠** re-closing W5 docs |
| **What this knife is not** | **Not** W5 docs close redo · **not** Redis cutover · **not** claiming MODEL-OP / SLO / HA green · **not** claiming already wired from prep Dual · **not** removing PG LISTEN · **not** MySQL/Qdrant reopen |
| **W5 relationship** | W5 = docs honesty **`post_prove_dual_pass`** · **≠** coding auth · this knife = the **separate coding REQUEST** W5 pointed at · **≠ W5 masquerade** |
| **Prod wakeup** | Keep **PG LISTEN/NOTIFY** (`meetwise_worker_wakeup_v1`) **provisional** |
| **Redis wake** | **Deferred** · orthogonal · **not STOPPED** · Ban cutover claim here |
| **Now** | **`post_prove_dual_pass`** · **prep/docs gate only** · Dual prep ≠ already wired · Ban self-approve · Ban false green |

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

## 2. Planned coding scope（AFTER standing authorize · **not claimed by prep Dual**）

| Face | Planned work | Hard ban |
|------|--------------|----------|
| Dual reconciler | Wire/integrate invocation reconcile + usage-calibration reconciler on worker path with honest prove | Ban forge SLO · Ban claim cutover without evidence · Ban claim already wired from prep Dual |
| Wakeup | Keep PG LISTEN/NOTIFY provisional; improve reconcile coverage for lossy NOTIFY | Ban delete PG listener · Ban Redis-only force |
| Redis | Remain deferred / additive flag-off | Ban Redis cutover claim · Ban claim STOPPED removed incorrectly |
| Evidence | `releaseEvidence=false` until separate authorize | Ban HA/suite green |

**Prep Dual**: documents scope + REQUEST honesty · **Dual prep ≠ already wired**.

---

## 3. Pins (must survive dual + coding)

1. **≠ W5 docs close / ≠ W5 masquerade** · this is separate coding REQUEST  
2. Prod wakeup = **PG LISTEN/NOTIFY provisional** · Ban remove without authorize  
3. **Redis wake deferred** · not STOPPED · ≠ cutover this knife  
4. Dual reconciler 同列 · wiring green ≠ MODEL-OP fake green ≠ SLO ≠ cutover claimed without evidence  
5. **Dual prep ≠ already wired** · prep Dual PASS ≠ claim reconciler already wired · Ban self-approve  
6. Coding only after dual PASS **and** explicit/standing authorize · Ban false green  
7. `releaseEvidence=false` · ≠HA · ≠suite · PG retained · MySQL/Qdrant STOPPED  
8. Ban secrets / `.env*`

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual (prep gate) | **`post_prove_dual_pass`** · receipts archived · knife SHA **`0137f39`** · Dual prep ≠ already wired |
| Planned after standing authorize | `pnpm model-invocation-reconcile:prove` · `pnpm model-op00-usage-reconciler:prove` · `pnpm worker-wakeup:prove` — **Ban** treating prior EXIT as MODEL-OP closed / this knife green / already wired from prep Dual |
| Redis prove (reference) | `pnpm worker-wakeup-redis:prove` — deferred · ≠ cutover |

---

## 5. Non-claims

Not W5 redo · not already wired from prep Dual · not Redis cutover · not SLO/MODEL-OP fake green · Dual prep ≠ already wired · Ban false green · Ban self-approve · `releaseEvidence=false` · ≠HA

---

*Harness · MODEL-OP real reconciler wiring · 2026-09-17 (~19:42 PT) · post_prove_dual_pass · prep/docs gate only · dual on 0137f39 · ≠ W5 masquerade · Dual prep ≠ already wired · PG LISTEN provisional · Redis deferred · Ban false green · releaseEvidence=false · ≠HA · Ban self-approve*
