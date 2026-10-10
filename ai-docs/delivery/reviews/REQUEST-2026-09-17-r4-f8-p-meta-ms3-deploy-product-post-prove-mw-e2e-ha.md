# REQUEST — Knife **F8** · **MS3 standard deploy product handoff** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:17 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ R4/题域/HA closed · **MS1 true** · **MS2 served** · **MS3 true** · product FUNNEL classifier true · **G-R4-5/FUNNEL dual-claim STILL OPEN** · **Ban forge serving** · **Ban self-approve `post_prove_dual_pass`** · **Ban claiming R4/FUNNEL/G-R4-5 dual-closed**  
**Prior pre-exec dual（pass）**: `2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-e2e-ha.md` · `2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-rag-route.md`  
**Knife**: `pnpm r4-p-meta-ms3-deploy-product:prove`（MS3 deploy product）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f8-p-meta-ms3-deploy-product.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f8-p-meta-ms3-deploy-product.eval.md` | run-status + fake-green checklist |
| `r4-f8-p-meta-ms3-deploy-product.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS3** | R4 **仍 NOT closed**；F8 awaiting post-prove dual · **MS1/MS2/MS3 true** · G-R4-5/FUNNEL dual-claim STILL OPEN |
| `apps/worker/src/r4-p-meta-ms3-deploy-product.ts` | **F8 real MS3 standard deploy product handoff** |
| `apps/worker/test/r4-p-meta-ms3-deploy-product.proof.ts` | F8 prove |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | classifiers · MS1/MS2/MS3 true |
| Prior F7 | `harness/r4-f7-p-meta-ms2-facets-product.md` · **`post_prove_dual_pass`** |

---

## Stance（E2E-HA）

F8 landed **real MS3 standard deploy product handoff**（≠ close R4 · ≠ forge）：

1. **MS1** pin stays **true** · `routedServingProductConsumerWired=true` · contract.wired=true  
2. **MS2** pin stays **true** · `fullFacetsServed=true` · facetsServed = required set  
3. **MS3** `standardDeployProductHandoff=true` · checklist completed · handoff fail-closed · `releaseEvidence=false` · ≠ forge  
4. **MS4** hard pins: product FUNNEL classifier true · Ban dual-claim without dual · ≠ R4/题域/HA · sole 恰 5 · no P-R1 flip · G-R4-3 parallel open

**EXIT=0 ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ knife dual-done**. **MS1 true · MS2 served · MS3 true · G-R4-5/FUNNEL dual-claim STILL OPEN**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-ms3-deploy-product:prove`** | **0** | MS3 landed；MS1/MS2 true；product FUNNEL classifier true；≠ R4/HA；await dual |
| spawn `pnpm r4-p-meta-ms2-facets-product:prove` | **0** | F7 旁证 · MS3 now true |
| `:prove:raw` / no-PG isolated | **n/a** | harness **does not** require :raw（no PG） |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · Live Key×3 · forge deploy handoff · 把本绿写成 R4/题域/HA 关 / `post_prove_dual_pass` · MySQL/Qdrant cutover。  
**Key**：unset（未 invent MODEL_API_KEY）。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-ms3-deploy-product:prove`，附 CMD+EXIT。  
2. MS3 是否诚实 landed（`standardDeployProductHandoff=true` · checklist · ≠ forge）· MS1/MS2 **true**？  
3. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ HA / ≠ suite green**？  
4. Product FUNNEL classifier true · 是否仍钉 **G-R4-5/FUNNEL dual-claim STILL OPEN**（Ban claiming dual-closed without dual）？  
5. harness/status/eval 是否错误把本绿写成 `post_prove_dual_pass` / R4 closed / forge OK？（期望：**否** · await dual）  
6. sole allowlist 是否仍恰 5 未翻？`releaseEvidence=false`？no flip default？  
7. **no** `mw-model-op` 是否仍正确？G-R4-3 是否仍 STILL OPEN？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f8-p-meta-ms3-deploy-product-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R4 / 题域已隔离 / R1 / HA / FUNNEL/G-R4-5 dual-closed / forge OK  
- **await post-prove dual** · **Ban self-approve `post_prove_dual_pass`**

---

*REQUEST · mw-e2e-ha · F8 MS3 deploy product post-prove · 2026-09-17 ~01:17 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · MS1 true · MS2 served · MS3 true · G-R4-5/FUNNEL dual-claim STILL OPEN · Ban forge · Ban self-approve · awaiting dual*
