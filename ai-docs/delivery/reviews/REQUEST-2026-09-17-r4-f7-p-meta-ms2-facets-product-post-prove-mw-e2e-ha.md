# REQUEST — Knife **F7** · **MS2 facets on product path** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~01:00 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ G-R4-5 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ FUNNEL-01/R4/R1/G-R4-5 closed ≠ HA · **MS1 true** · **MS2 served** · **MS3 still false** · **Ban forge serving** · no self-approve · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban self-approve `post_prove_dual_pass`**  
**Prior pre-exec dual（pass）**: `2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md` · `2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`  
**Knife**: `pnpm r4-p-meta-ms2-facets-product:prove`（MS2 facets product）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f7-p-meta-ms2-facets-product.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f7-p-meta-ms2-facets-product.eval.md` | run-status + fake-green checklist |
| `r4-f7-p-meta-ms2-facets-product.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5 / MS2** | R4 **仍 NOT closed**；F7 awaiting post-prove dual · **MS1 true · MS2 served · MS3 still false** · G-R4-5 STILL OPEN |
| `apps/worker/src/r4-p-meta-ms2-facets-product.ts` | **F7 real MS2 product-path facet serve** |
| `apps/worker/test/r4-p-meta-ms2-facets-product.proof.ts` | F7 prove |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | classifiers · MS1 true · MS2 served · MS3 false |
| Prior F6 | `harness/r4-f6-p-meta-ms1-product-wire.md` · **`post_prove_dual_pass`** |
| Prior F5 | `harness/r4-f5-p-meta-serving-product.md` · **`post_prove_dual_pass`** |

---

## Stance（E2E-HA）

F7 landed **real MS2 product-path facet serve**（≠ close FUNNEL-01 · ≠ forge）：

1. **MS1** pin stays **true** · `routedServingProductConsumerWired=true` · contract.wired=true  
2. **MS2** required secondary facets **SERVED** on product path · `facetsServedOnProductPath` = required set · `fullFacetsServed=true` · serve fail-closed · ≠ forge  
3. **MS3** product deploy handoff: checklist **named** · standard deploy evidence **still open** · local 01A ≠ standard/cloud  
4. **MS4** hard pins: 01A ≠ 01 · MS2 alone ≠ FUNNEL/R4/G-R4-5 closed · sole 恰 5 · `releaseEvidence=false` · no model-op · **no P-R1 flip** · G-R4-3 parallel open

**EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ G-R4-5 closed ≠ HA ≠ knife product-done**. **MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-ms2-facets-product:prove`** | **0** | MS2 served；MS1 true；MS3 still false；≠ FUNNEL-01/R4/G-R4-5 关；await dual |
| spawn `pnpm r4-p-meta-ms1-product-wire:prove` | **0** | F6 旁证 · MS2 now true · MS3 still false |
| `:prove:raw` / no-PG isolated | **n/a** | harness **does not** require :raw（no PG） |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · Live Key×3 · forge MetadataReviewReceipt serving · 把本绿写成 FUNNEL-01/R4/G-R4-5 关 / MS product-done。  
**Key**：unset（未 invent MODEL_API_KEY）。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-ms2-facets-product:prove`，附 CMD+EXIT。  
2. MS2 是否诚实 served（`facetsServedOnProductPath` = required · `fullFacetsServed=true` · serve path · ≠ forge）· MS1 **true** · MS3 **still false**？  
3. EXIT=0 是否仍钉 **≠ FUNNEL-01 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ G-R4-5 closed / ≠ HA / ≠ suite green**？  
4. MS2 alone 是否仍钉 **≠ FUNNEL-01/G-R4-5 closed**（MS3 remain）？  
5. harness/status/eval 是否错误把本绿写成 FUNNEL-01/R4/G-R4-5 已关 / `post_prove_dual_pass` / forge OK？（期望：**否** · await dual · MS3 still false）  
6. sole allowlist 是否仍恰 5 未翻？`releaseEvidence=false`？no flip default？  
7. **no** `mw-model-op` 是否仍正确？G-R4-5 / G-R4-3 是否仍 STILL OPEN？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f7-p-meta-ms2-facets-product-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 FUNNEL-01 / R1 / R4 / G-R4-5 closed / 题域已隔离 / HA / MS product-done / forge OK  
- **await post-prove dual** · **Ban self-approve `post_prove_dual_pass`**

---

*REQUEST · mw-e2e-ha · F7 MS2 facets product post-prove · 2026-09-17 ~01:00 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · MS1 true · MS2 served · MS3 still false · G-R4-5 STILL OPEN · Ban forge · Ban self-approve · awaiting dual*
