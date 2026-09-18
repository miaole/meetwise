# REQUEST — **MODEL-OP real reconciler wiring** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~19:44 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ MODEL-OP fake green** · **≠ W5 masquerade** · Ban false green  
**Pair**: `REQUEST-2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md`  
**Hard**: standing authorize after prep dual on `0137f39` · prove EXIT=0 ≠ MODEL-OP closed ≠ SLO ≠ Redis cutover · Ban self-approve · Ban secrets · PG LISTEN retained · **≠ W5**  
**Knife**: `harness/model-op-real-reconciler-wiring.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`**

---

## Contra

| File | Role |
|------|------|
| `harness/model-op-real-reconciler-wiring.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-model-op-real-reconciler-wiring-prove.md` | CMD+EXIT table |
| `apps/worker/src/usage-calibration-reconcile.ts` | New worker loop |
| `apps/worker/src/main.ts` | Dual reconciler wired · PG LISTEN retained |
| `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` | Gateway owner enum |
| Prep dual | `2026-09-17-model-op-real-reconciler-wiring-mw-e2e-ha.md` **pass** on `0137f39` · SHA_A `d92d42b` |

---

## Stance（E2E-HA）

1. Standing authorize coding+prove after prep dual on `0137f39`.  
2. Dual reconciler 同列：invocation reconciler retained + usage-calibration reconciler **newly wired** into worker.  
3. Prod wakeup = **PG LISTEN/NOTIFY provisional retained** · Redis **deferred / not STOPPED** · Ban delete PG listener · Ban Redis cutover claim.  
4. Prove EXIT=0 ×3 · Ban invent EXIT · Ban false green / MODEL-OP closed / SLO.  
5. Knife remains **`executed:awaiting_post_prove_dual`** until experts write pass — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm model-invocation-reconcile:prove` | **0** | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover |
| `pnpm model-op00-usage-reconciler:prove` | **0** | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover |
| `pnpm worker-wakeup:prove` | **0** | PG LISTEN retained · ≠ Redis cutover |

---

## Please answer

1. 请抽查/复跑至少 `pnpm model-op00-usage-reconciler:prove` + `pnpm worker-wakeup:prove`，附 CMD+EXIT。  
2. usage-calibration worker wiring 是否诚实（drain/stop/ready · gateway enum · ≠ claim MODEL-OP closed）？  
3. PG LISTEN 是否仍保留 · Redis 是否仍 deferred/not STOPPED？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）？  
5. 是否引入 secrets / `.env*` / W5 masquerade / HA/suite/`releaseEvidence=true`？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 MODEL-OP closed / SLO / Redis cutover / HA / suite / W5 redo  
- **await post-prove dual** · Ban self-write `post_prove_dual_pass`

---

*REQUEST · mw-e2e-ha · MODEL-OP-wire post-prove · 2026-09-17 ~19:44 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠suite · awaiting dual*
