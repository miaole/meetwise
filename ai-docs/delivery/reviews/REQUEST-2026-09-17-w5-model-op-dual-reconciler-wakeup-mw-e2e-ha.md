# REQUEST — **W5** · MODEL-OP dual reconciler + wakeup honesty（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:25 PT)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ reconciler cutover** · **≠ wakeup cutover**  
**Pair**: `REQUEST-2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-rag-route.md`  
**Hard**: meetwise — docs-only dual-reconciler + wakeup honesty · **prod keep PG LISTEN/NOTIFY provisional** · **Redis wake deferred** · Ban forge SLO green · zero coding / zero prove · Dual PASS ≠ authorize coding · Ban self-approve · PG+pgvector+PostgresSaver retained · note `mw-model-op` optional later for domain cutover REQUEST

---

## Contra

| File | Role |
|------|------|
| `harness/w5-model-op-dual-reconciler-wakeup.md` | Canonical harness（inventory · pins · Ban SLO） |
| `w5-model-op-dual-reconciler-wakeup.slice.md` | Slice index |
| `eval/w5-model-op-dual-reconciler-wakeup.eval.md` | Pre-exec eval |
| `m3-queue-wakeup-selection.md` | Q1–Q5 selection · 不切生产 wakeup |
| `harness/redis-streams-wakeup.prototype.md` | Additive Redis prototype · PG LISTEN retained |
| `gap-bug-backlog.md` GAP-MOP-01/03 · BUG-NOTIFY-REC | Open honesty |
| Parallel | PG-retained · F8 · commerce · W4 R2 close-auth |

---

## Stance（E2E-HA）

1. Docs-only honesty: dual reconciler ≠ cutover · wakeup ≠ Redis production  
2. Prod path remains **PG LISTEN/NOTIFY provisional** · Ban remove without authorize  
3. Redis wake deferred · Ban forge SLO / HA / suite from prototype or prior prove EXIT  
4. Control-plane: Dual PASS ≠ authorize coding · ≠ `releaseEvidence=true`  
5. **`not_run:pre_dual`** · zero coding  

---

## Please answer

1. Agree dual reconciler faces 同列 · docs/prove EXIT ≠ reconciler已接/已切?  
2. Agree prod wakeup stays PG LISTEN/NOTIFY provisional · Ban deleting listener from this knife?  
3. Agree Redis wake deferred · ≠ cutover authorized · separately evaluable under PG-retained?  
4. Agree Ban forge SLO / capacity / latency / HA / suite green?  
5. Agree `releaseEvidence=false` · Dual PASS ≠ authorize coding · zero coding · Ban self-approve · PG retained · `mw-model-op` optional later?  

Please write the conclusion to `reviews/`（e.g. `2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not reconciler/wakeup cutover · not SLO · not HA · not suite · Dual PASS ≠ authorize coding

---

*REQUEST · mw-e2e-ha · W5 dual reconciler + wakeup · 2026-09-17 (~01:25 PT) · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠suite · Ban forge SLO · Dual PASS ≠ authorize coding · zero coding · Ban self-approve*
