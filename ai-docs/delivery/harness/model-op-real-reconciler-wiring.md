# Harness — **MODEL-OP real reconciler wiring**（coding+prove · ≠ W5 docs close）

**Status**: **`executed:awaiting_post_prove_dual`**  
**Date**: 2026-09-17 (~19:44 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ MODEL-OP fake green** · **≠ reconciler/wakeup cutover claimed** · **≠ W5 masquerade** · **Ban false green**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（prep dual **PASS** on `0137f39` · standing authorize coding+prove · **Ban self-write `post_prove_dual_pass`**)  
**Note**: `mw-model-op` optional later for domain cutover honesty · not required on this REQUEST pair  
**Slice**: `../model-op-real-reconciler-wiring.slice.md`  
**Eval**: `../eval/model-op-real-reconciler-wiring.eval.md`  
**Authority**: meetwise — standing authorize **MODEL-OP-wire** after prep dual on `0137f39` · real dual-reconciler / wakeup wiring · prod **PG LISTEN/NOTIFY provisional** · **Redis deferred** · PG retained  
**Honesty**: Prep dual on **`0137f39`** · coding+prove executed · Dual prep ≠ already wired (satisfied via standing authorize) · **await post-prove dual** · **do NOT self-write `post_prove_dual_pass`** · ≠ W5 masquerade · PG LISTEN retained · Redis deferred · Ban false green · `releaseEvidence=false`

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-model-op-real-reconciler-wiring-mw-e2e-ha.md` | **pass** (prep/docs gate) |
| `mw-rag-route` | `../reviews/2026-09-17-model-op-real-reconciler-wiring-mw-rag-route.md` | **pass** (prep/docs gate) |

Prep dual knife SHA: **`0137f39`**. Prep close SHA_A: **`d92d42b`**.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Standing-authorized coding+prove: wire dual reconciler (invocation + usage-calibration) on worker path · keep PG LISTEN provisional · Redis deferred |
| **What this knife is not** | **Not** W5 docs close redo · **not** Redis cutover · **not** claiming MODEL-OP / SLO / HA green · **not** removing PG LISTEN · **not** MySQL/Qdrant reopen · **not** self-written `post_prove_dual_pass` |
| **W5 relationship** | W5 = docs honesty · **≠** coding auth · this knife = separate coding REQUEST · **≠ W5 masquerade** |
| **Prod wakeup** | Keep **PG LISTEN/NOTIFY** (`meetwise_worker_wakeup_v1`) **provisional** · Ban delete |
| **Redis wake** | **Deferred** · orthogonal · **not STOPPED** · Ban cutover claim · Ban claim STOPPED removed incorrectly |
| **Now** | **`executed:awaiting_post_prove_dual`** · Ban self-write post_prove_dual_pass · Ban false green |

---

## 1. Coding executed（standing authorize）

| Face | Work done | Hard ban retained |
|------|-----------|-------------------|
| Dual reconciler | `runModelInvocationReconciler` retained · **`runUsageCalibrationReconciler`** wired into worker `main.ts` drain/stop/ready · `gateway_usage_calibration_owners` migration **0134** + DB helper | Ban forge SLO · Ban claim MODEL-OP closed / cutover without evidence |
| Wakeup | PG LISTEN path **retained** (`startWorkerJobWakeupListener`) · Redis Streams still flag-off additive | Ban delete PG listener · Ban Redis-only force |
| Redis | Remain deferred / additive flag-off | Ban Redis cutover claim · Ban claim STOPPED removed incorrectly |
| Evidence | `releaseEvidence=false` | Ban HA/suite green |

---

## 2. Pins (must survive post-prove dual)

1. **≠ W5 docs close / ≠ W5 masquerade**  
2. Prod wakeup = **PG LISTEN/NOTIFY provisional** · Ban remove without authorize  
3. **Redis wake deferred** · not STOPPED · ≠ cutover  
4. Dual reconciler 同列 · wiring prove EXIT ≠ MODEL-OP fake green ≠ SLO ≠ cutover claimed  
5. **Ban self-write `post_prove_dual_pass`** · status stays `executed:awaiting_post_prove_dual` until experts  
6. `releaseEvidence=false` · ≠HA · ≠suite · PG retained · MySQL/Qdrant STOPPED  
7. Ban secrets / `.env*`

---

## 3. CMD + EXIT（coding phase · recorded）

| CMD | EXIT | Honesty |
|-----|------|---------|
| `pnpm model-invocation-reconcile:prove` | **0** | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover |
| `pnpm model-op00-usage-reconciler:prove` | **0** | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover |
| `pnpm worker-wakeup:prove` | **0** | PG LISTEN retained · ≠ Redis cutover |
| `pnpm worker-wakeup-redis:prove` | **not run** | deferred · ≠ cutover |

Receipt: `../receipts/2026-09-17-model-op-real-reconciler-wiring-prove.md`

---

## 4. Non-claims

Not W5 redo · not Redis cutover · not SLO/MODEL-OP fake green · not HA/suite · Ban false green · Ban self-write `post_prove_dual_pass` · `releaseEvidence=false` · ≠HA · await post-prove dual

---

*Harness · MODEL-OP real reconciler wiring · 2026-09-17 (~19:44 PT) · executed:awaiting_post_prove_dual · prep dual on 0137f39 · SHA_A d92d42b · ≠ W5 masquerade · PG LISTEN provisional · Redis deferred · Ban false green · releaseEvidence=false · ≠HA · Ban self-write post_prove_dual_pass*
