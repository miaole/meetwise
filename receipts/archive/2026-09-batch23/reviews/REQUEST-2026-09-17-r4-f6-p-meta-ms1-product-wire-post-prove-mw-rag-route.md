# REQUEST — Knife **F6** · **MS1 MetadataReviewReceipt product wire** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~00:45 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ G-R4-5 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f6-p-meta-ms1-product-wire-post-prove-mw-e2e-ha.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ FUNNEL-01/R4/R1/G-R4-5 closed ≠ HA · **MS1 wired** · **MS2/MS3 still false** · **Ban forge serving** · no self-approve · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban flip without authorize**  
**Prior pre-exec dual（pass）**: `2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-e2e-ha.md` · `2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-rag-route.md`  
**Knife**: `pnpm r4-p-meta-ms1-product-wire:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f6-p-meta-ms1-product-wire.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f6-p-meta-ms1-product-wire.eval.md` | run-status + fake-green checklist |
| `r4-f6-p-meta-ms1-product-wire.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS1** | R4 **仍 NOT closed**；F6 awaiting post-prove dual · **MS1 wired · MS2/MS3 still false** · G-R4-5 STILL OPEN |
| `m4-rag-hard-gates.md` §R4 / GAP-RAG / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · MS1 alone ≠ 01 |
| `apps/worker/src/r4-p-meta-ms1-product-wire.ts` | **F6 real MS1 product serving consumer** |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1 true · MS2/MS3 false · Ban forge |
| `ai-docs/architecture/ai/rag-funnel-routing.md` | secondary facets · serving target |
| Prior F5 / F4 / F3 | all `post_prove_dual_pass` · honesty / named contract · G-R4-3 STILL OPEN |

---

## Stance（RAG-route）

F6 wires **real MS1** routed `MetadataReviewReceipt` product serving consumer after F5 named the contract:

1. **MS1 wired** — `admitMetadataReviewReceiptToProductServing` · marker true · classifiers honest (`routedServingProductConsumerWired=true`) · ≠ forge DB serving facts  
2. **MS2/MS3 still false** — facetsServed empty · standardDeployProductHandoff=false → **FUNNEL-01 / G-R4-5 STILL OPEN**  
3. **01A ≠ 01** · MS1 alone ≠ FUNNEL-01 closed ≠ R4 closed  
4. **no** `mw-model-op` · **no** P-R1 flip · G-R4-3 parallel open · Ban flip without authorize  
5. EXIT=0 ≠ HA ≠ suite green ≠ knife product-done ≠ G-R4-5 closed

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-ms1-product-wire:prove`** | **0** | MS1 wired；MS2/MS3 still false；≠ FUNNEL-01/R4/G-R4-5 关 |
| spawn `pnpm r4-p-meta-serving-product:prove` | **0** | F5 旁证 cascade |

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-ms1-product-wire:prove`，附 CMD+EXIT。  
2. 是否同意 MS1 为 **real product wire**（≠ forge · classifiers honestly true）且 MS2/MS3 **仍开**？  
3. EXIT=0 是否仍钉 **≠ FUNNEL-01 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ G-R4-5 closed**？  
4. 01A ≠ 01 · MS1 alone ≠ FUNNEL-01 是否仍成立？  
5. harness/status/eval 是否误写 FUNNEL-01/R4/G-R4-5 closed / post_prove_dual_pass？（期望：**否**）  
6. sole 恰 5 · `releaseEvidence=false` · no model-op · Ban flip without authorize？  
7. G-R4-3 / P-R1 是否仍 parallel open（not preferred）？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f6-p-meta-ms1-product-wire-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 FUNNEL-01 / R1 / R4 / G-R4-5 closed / 题域已隔离 / HA / forge OK  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · F6 MS1 product wire post-prove · 2026-09-17 ~00:45 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · MS1 wired · MS2/MS3 still false · G-R4-5 STILL OPEN · Ban forge · Ban self-approve · awaiting dual*
