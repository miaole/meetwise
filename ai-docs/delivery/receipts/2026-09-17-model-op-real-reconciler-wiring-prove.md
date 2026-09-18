# Prove receipt — **MODEL-OP real reconciler wiring**

**Date**: 2026-09-17 (~19:44 PT)  
**Knife**: `harness/model-op-real-reconciler-wiring.md`  
**Status after prove**: **`executed:awaiting_post_prove_dual`** · **Ban self-write `post_prove_dual_pass`**  
**Authority**: meetwise standing authorize after prep dual on `0137f39` · SHA_A prep nail `d92d42b`  
**releaseEvidence=false** · **≠HA** · **≠suite** · **≠ SLO** · **≠ MODEL-OP fake green** · **≠ W5 masquerade** · PG LISTEN provisional retained · Redis deferred

---

## CMD + EXIT

| CMD | EXIT | Log (box) | Honesty |
|-----|------|-----------|---------|
| `pnpm model-invocation-reconcile:prove` | **0** | `.tmp/model-op-wire-prove/model-invocation-reconcile.log` | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover |
| `pnpm model-op00-usage-reconciler:prove` | **0** | `.tmp/model-op-wire-prove/model-op00-usage-reconciler.log` | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover |
| `pnpm worker-wakeup:prove` | **0** | `.tmp/model-op-wire-prove/worker-wakeup.log` | PG LISTEN retained · ≠ Redis cutover |
| `pnpm worker-wakeup-redis:prove` | **not run** | — | deferred · ≠ cutover |

All three harness prove CMDs **EXIT=0**. Isolated proof receipts report `release_evidence=false`.

---

## Code surfaces wired

| Surface | Change |
|---------|--------|
| `apps/worker/src/usage-calibration-reconcile.ts` | **new** — worker drain-loop for `reconcileUsageCalibration` |
| `apps/worker/src/main.ts` | import + start + ready + SIGTERM stop + log · **PG LISTEN retained** · Redis Streams still flag-off additive |
| `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` | **new** — `gateway_usage_calibration_owners()` SECURITY DEFINER |
| `packages/db/src/gateway-dispatch.ts` | `gatewayUsageCalibrationOwners` |
| `packages/db/src/index.ts` | export |

---

## Hard pins retained

- ≠ W5 masquerade  
- Dual prep ≠ already wired (coding via standing authorize)  
- PG LISTEN provisional · Ban delete  
- Redis deferred · not STOPPED · ≠ cutover · Ban claim STOPPED removed incorrectly  
- Ban假绿 / SLO forge  
- `releaseEvidence=false` · ≠HA  
- **Do NOT self-write `post_prove_dual_pass`**

---

*Receipt · MODEL-OP-wire prove · 2026-09-17 (~19:44 PT) · EXIT 0/0/0 · releaseEvidence=false · awaiting post-prove dual*
