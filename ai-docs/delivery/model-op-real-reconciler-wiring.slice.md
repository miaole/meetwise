# Slice — **MODEL-OP real reconciler wiring**（coding+prove · ≠ W5 docs close）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~19:50 PT)  
**Authority**: meetwise — standing authorize after prep dual on `0137f39` · coding+prove SHA_B `6cd621c` · post-prove dual PASS · nail `post_prove_dual_pass` · real dual-reconciler / wakeup wiring · **≠ W5 masquerade** · prod **PG LISTEN/NOTIFY provisional keep** · **Redis wake deferred** · PG+pgvector+PostgresSaver retained  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ MODEL-OP fake green** · **≠ reconciler/wakeup cutover claimed** · **Ban false green**  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · prep dual **PASS** · post-prove dual **PASS** on `6cd621c` · note `mw-model-op` optional later  
**Honesty**: Prep dual on **`0137f39`** · SHA_A **`d92d42b`** · coding+prove **`6cd621c`** · post-prove dual **PASS** · EXIT 0/0/0 · redis not run (deferred) · PG LISTEN retained · Redis deferred · Ban假绿 · Dual PASS ≠ MODEL-OP closed / cutover / SLO / HA

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/model-op-real-reconciler-wiring.slice.md` |
| Harness | `ai-docs/delivery/harness/model-op-real-reconciler-wiring.md` |
| Eval | `ai-docs/delivery/eval/model-op-real-reconciler-wiring.eval.md` |
| Prove receipt | `receipts/2026-09-17-model-op-real-reconciler-wiring-prove.md` |
| Prior W5 docs | `harness/w5-model-op-dual-reconciler-wakeup.md` · **`post_prove_dual_pass`** · ≠ fake green |
| Worker wiring | `apps/worker/src/usage-calibration-reconcile.ts` · `apps/worker/src/main.ts` |
| Gateway enum | `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` · `packages/db/src/gateway-dispatch.ts` |
| W0–W8 SSOT | `w0-w8-workflow-status.md` |
| Prep dual · e2e-ha | `reviews/2026-09-17-model-op-real-reconciler-wiring-mw-e2e-ha.md` → **pass** |
| Prep dual · rag-route | `reviews/2026-09-17-model-op-real-reconciler-wiring-mw-rag-route.md` → **pass** |
| Post-prove · e2e-ha | `reviews/2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-e2e-ha.md` → **pass** |
| Post-prove · rag-route | `reviews/2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md` → **pass** |

## One-line scope

Standing-authorized coding+prove: wire dual reconciler (invocation + usage-calibration) on worker · keep PG LISTEN provisional · Redis deferred · Ban false green / SLO forge · post-prove dual PASS nail · Dual PASS ≠ MODEL-OP closed.

## Hard pins

- **≠ W5 docs close / ≠ W5 masquerade**  
- Prod wakeup = **PG LISTEN/NOTIFY provisional** · Ban remove  
- **Redis wake deferred** · not STOPPED · ≠ cutover  
- Dual reconciler 同列 · prove EXIT ≠ cutover ≠ SLO ≠ MODEL-OP fake green  
- Status = **`post_prove_dual_pass`** · dual on **`6cd621c`** · Dual PASS ≠ MODEL-OP closed / HA / suite  
- `releaseEvidence=false` · ≠HA · ≠suite · Ban false green · PG retained · MySQL/Qdrant STOPPED

## CMD

| CMD | EXIT |
|-----|------|
| `pnpm model-invocation-reconcile:prove` | **0** |
| `pnpm model-op00-usage-reconciler:prove` | **0** |
| `pnpm worker-wakeup:prove` | **0** |
| `pnpm worker-wakeup-redis:prove` | **not run** (deferred) |

---

*Slice · MODEL-OP real reconciler wiring · 2026-09-17 (~19:50 PT) · post_prove_dual_pass · dual on 6cd621c · EXIT 0/0/0 · redis not run (deferred) · ≠ W5 masquerade · PG LISTEN provisional · Redis deferred · Ban假绿 · releaseEvidence=false · ≠HA · ≠ MODEL-OP closed*
