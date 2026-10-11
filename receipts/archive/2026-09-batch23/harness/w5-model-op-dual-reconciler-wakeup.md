# Harness — **W5** · MODEL-OP dual reconciler + wakeup honesty

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~01:33 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ reconciler cutover** · **≠ wakeup cutover** · **≠ controlPlaneClosed** · **≠ MODEL-OP closed / fake green**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · **zero coding / zero prove** · **Ban self-approve** · **Dual PASS ≠ authorize coding**）  
**Note**: Prefer consistency with project dual convention (`mw-e2e-ha` + `mw-rag-route`). `mw-model-op` is the natural domain expert for reconciler/wakeup cutover **later** — **not** on this REQUEST pair unless a dedicated model-op REQUEST path is opened; cite GAP-MOP-* / m3 docs for domain honesty  
**Slice**: `../w5-model-op-dual-reconciler-wakeup.slice.md`  
**Eval**: `../eval/w5-model-op-dual-reconciler-wakeup.eval.md`  
**Authority**: meetwise — docs-only dual-reconciler + wakeup honesty · **prod keep PG LISTEN/NOTIFY provisional** · **Redis wake deferred / orthogonal · not STOPPED** · Ban forge SLO green · PG+pgvector+PostgresSaver retained · Dual PASS ≠ authorize coding · **≠ MODEL-OP fake green**  
**Honesty**: Dual reviews against knife SHA **`25833fc`**. Docs close ≠ coding auth · real reconciler wiring needs **separate REQUEST**.

---

## Dual receipts (pre-exec · archived)

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `../reviews/2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `../reviews/2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-rag-route.md` | **pass** |

Dual SHA: **`25833fc93a9e1bb6a2337665bd9648fdb9f8ee1c`** (short **`25833fc`**). Docs honesty close only · **≠ MODEL-OP fake green**.

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Docs-only honesty pin: **dual reconciler** (invocation + usage-calibration) remains an open Q4 gate · **prod wakeup stays PG LISTEN/NOTIFY provisional** · Redis Streams wake is **deferred / separately evaluable / not STOPPED** · Ban forge SLO / capacity green |
| **What this knife is not** | **Not** coding · **not** prove · **not** Redis wake cutover · **not** claiming reconciler已接/已切 · **not** SLO green · **not** HA/suite · **not** MySQL/Qdrant cutover reopen · **not** MODEL-OP closed |
| **Prod wakeup** | Keep **`job-wakeup-listener` + `meetwise_worker_wakeup_v1` LISTEN/NOTIFY** as **provisional production** path · Ban removing PG listener without separate authorize |
| **Redis wake** | **Deferred / orthogonal · not STOPPED** · prototype may remain additive/flag-off · **not** authorized cutover here |
| **Dual reconciler** | `model-invocation-reconcile` **and** `usageCalibrationReconciler` **同列** · connectivity/docs green **≠** cutover · Ban forge SLO from prove EXIT |
| **Now** | **`post_prove_dual_pass`** · docs-only close · zero coding · Dual PASS ≠ authorize coding · **≠ MODEL-OP fake green** |

---

## 1. Honest inventory（existing）

| Artifact | Path | Honest status |
|----------|------|---------------|
| M3 selection | `m3-queue-wakeup-selection.md` | selection draft · **不切生产 wakeup** · **不宣称 reconciler 已接/已切** · Redis Streams 优选（选型）· under PG-retained = orthogonal |
| Redis prototype harness | `harness/redis-streams-wakeup.prototype.md` | additive · flag default off · **PG LISTEN unconditionally retained** · `worker-wakeup-redis:prove` local only · ≠ cutover |
| M3 redis prototype note | `m3-redis-wakeup-prototype.md` | prototype delivery · not production cutover |
| GAP-MOP-01 | `gap-bug-backlog.md` | Prod wakeup still LISTEN/NOTIFY · Redis Streams INFLIGHT prototype · **still separately evaluable under PG-retained** · **not STOPPED** |
| GAP-MOP-02 | claim / advisory | Still PG SKIP LOCKED / `pg_advisory_*` · not this knife |
| GAP-MOP-03 | dual reconciler Q4/Q5 | Both proves 同列 · #102 calib PR INFLIGHT ≠ cutover · **≠ MODEL-OP closed** |
| BUG-NOTIFY-REC | lossy NOTIFY + reconcile not sole-stack proven | Redis hint + **forced** periodic reconcile required before cutover · Ban SLO forge |
| PG-retained | `harness/pg-retained-checkpoint-postgres-saver.md` | Postgres+pgvector+PostgresSaver retained · Redis wake **orthogonal / not STOPPED** · not authorized here |
| #102 | `feat/model-op00-calibration-dispatch` | INFLIGHT:pr-model-op-calib · ≠ Q4 dual-closed · ≠ cutover |

### Dual reconciler faces（Q4）

| Face | Code / prove | Honesty |
|------|--------------|---------|
| model-invocation reconcile | `apps/worker/src/model-invocation-reconcile.ts` · `pnpm model-invocation-reconcile:prove` | Local/structural prove possible · **≠** production cutover · **≠** SLO |
| usageCalibrationReconciler | `packages/ai-runtime` `reconcileUsageCalibration` · `pnpm model-op00-usage-reconciler:prove` | **同列** with above · factor→dispatch / worker loop may still be partial · **≠** 已接生产主链 |
| #102 calibration→dispatch | open PR / branch | INFLIGHT · needs independent review · Ban self-approve cutover |

### Wakeup faces

| Face | Honesty |
|------|---------|
| Prod PG LISTEN/NOTIFY `meetwise_worker_wakeup_v1` | **Provisional keep** · lossy hint · durable truth = job tables + claim/lease + periodic reconcile |
| Redis Streams prototype | Flag-off additive · deferred cutover · Ban claiming production Redis wake · **not STOPPED** |
| Polling fallback | Deferred design · not sole production wake |

---

## 2. Pins (must survive dual)

1. **Prod wakeup = PG LISTEN/NOTIFY provisional keep** · Ban deleting listener / forcing Redis-only without separate authorize  
2. **Redis wake deferred / orthogonal · not STOPPED** · separately evaluable under PG-retained · **not** authorized cutover here  
3. **Dual reconciler 同列** · docs/connectivity/prove EXIT **≠** reconciler已接/已切 · **≠** queue migrated · **≠ MODEL-OP fake green**  
4. **Ban forge SLO green** · Ban capacity / latency / HA claims from this knife or prototype prove  
5. `releaseEvidence=false` · ≠HA · ≠suite green · Dual PASS ≠ authorize coding · Ban self-approve · zero coding  
6. PG+pgvector+PostgresSaver retained · Ban reopening MySQL/Qdrant cutover via wakeup narrative  
7. REQUEST pair = `mw-e2e-ha` + `mw-rag-route` · `mw-model-op` optional later for domain cutover REQUEST  
8. Real coding (reconciler wiring) needs **separate REQUEST** — this close is docs honesty only  

---

## 3. Acceptance（docs honesty only）

| ID | Criterion | Now |
|----|-----------|-----|
| M1 | Dual reconciler honesty table present · 同列 · ≠ cutover | **met (docs)** |
| M2 | Prod PG LISTEN/NOTIFY provisional keep pinned | **met (docs)** |
| M3 | Redis wake deferred · Ban cutover claim · not STOPPED | **met (docs)** |
| M4 | Ban forge SLO green · `releaseEvidence=false` · ≠HA/suite · ≠ MODEL-OP fake green | **met (docs)** |
| M5 | Zero coding / prove · Dual PASS ≠ authorize coding · Ban self-approve | **`post_prove_dual_pass`** · dual PASS both · coding still banned |
| M6 | PG retained hard pin | **met (docs)** |

---

## 4. CMD

| CMD | Status |
|-----|--------|
| docs dual only | **`post_prove_dual_pass`** · receipts archived · dual SHA **`25833fc`** · **no prove script this knife** · zero coding |
| Prior (reference only · not run here) | `pnpm model-invocation-reconcile:prove` · `pnpm model-op00-usage-reconciler:prove` · `pnpm worker-wakeup:prove` · `pnpm worker-wakeup-redis:prove` — **≠** cutover · **≠** SLO · **Ban** treating prior EXIT as MODEL-OP / W5 implementation green |

---

## 5. Non-claims

Not pass-as-implementation · not reconciler cutover · not Redis wake cutover · not SLO green · not HA · not suite · not coding authorized · Dual PASS ≠ authorize coding · not MySQL/Qdrant reopen · **not MODEL-OP closed / fake green**

---

*Harness · W5 MODEL-OP dual reconciler + wakeup honesty · 2026-09-17 (~01:33 PT) · post_prove_dual_pass · dual on 25833fc · releaseEvidence=false · ≠HA · ≠suite · Ban forge SLO · prod PG LISTEN/NOTIFY provisional · Redis wake deferred / not STOPPED · ≠ MODEL-OP fake green · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
