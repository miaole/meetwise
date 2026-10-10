# REQUEST — **MODEL-OP real reconciler wiring** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~19:44 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠suite green** · **≠ SLO green** · **≠ MODEL-OP fake green** · **≠ W5 masquerade** · **RAG 正交** · Ban false green · Ban 假迁栈  
**Pair**: `REQUEST-2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-e2e-ha.md`  
**Hard**: standing authorize after prep dual on `0137f39` · prove EXIT=0 ≠ MODEL-OP closed ≠ R1/R2/R4/FUNNEL closed · Ban self-approve · Ban secrets · PG+pgvector retained · **≠ W5**  
**Knife**: `harness/model-op-real-reconciler-wiring.md` · status **`executed:awaiting_post_prove_dual`** · **实现方不写** pass review · **Ban self-write `post_prove_dual_pass`**

---

## Contra

| File | Role |
|------|------|
| `harness/model-op-real-reconciler-wiring.md` | Knife harness · `executed:awaiting_post_prove_dual` |
| `receipts/2026-09-17-model-op-real-reconciler-wiring-prove.md` | CMD+EXIT |
| `apps/worker/src/usage-calibration-reconcile.ts` · `main.ts` | Dual reconciler wire · PG LISTEN retained |
| Prep dual | `2026-09-17-model-op-real-reconciler-wiring-mw-rag-route.md` **pass** on `0137f39` |
| RAG gates | `m4-rag-hard-gates.md` · **orthogonal / untouched by this knife claim** |

---

## Stance（RAG-ROUTE）

1. Standing authorize coding+prove after prep dual · **RAG 正交**.  
2. Dual reconciler wiring ≠ R1/R2/R4/FUNNEL closed · ≠ route verbally effective · ≠ retrieve quality green.  
3. Ban 假迁栈 — PG+pgvector+PostgresSaver retained · MySQL/Qdrant STOPPED.  
4. PG LISTEN provisional retained · Redis deferred / not STOPPED.  
5. Knife remains **`executed:awaiting_post_prove_dual`** — **Ban** implementer self-write `post_prove_dual_pass`.

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `pnpm model-invocation-reconcile:prove` | **0** | ≠ MODEL-OP closed · RAG 正交 |
| `pnpm model-op00-usage-reconciler:prove` | **0** | ≠ MODEL-OP closed · RAG 正交 |
| `pnpm worker-wakeup:prove` | **0** | PG LISTEN retained · ≠ Redis cutover |

---

## Please answer

1. 请抽查/复跑至少 `pnpm model-op00-usage-reconciler:prove`，附 CMD+EXIT。  
2. 是否同意 **RAG 正交**（≠ R1/R2/R4/FUNNEL closed · ≠ verbal route · ≠ retrieve quality green）？  
3. 是否同意 Ban 假迁栈 · PG retained · MySQL/Qdrant STOPPED？  
4. 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（未自写 `post_prove_dual_pass`）？  
5. 是否引入 secrets / MODEL-OP fake green / W5 masquerade / HA/suite？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 MODEL-OP closed / R1/R2/R4/FUNNEL closed / Redis cutover / HA / suite  
- **await post-prove dual** · Ban self-write `post_prove_dual_pass` · RAG 正交 · Ban 假迁栈

---

*REQUEST · mw-rag-route · MODEL-OP-wire post-prove · 2026-09-17 ~19:44 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠suite · RAG 正交 · awaiting dual*
