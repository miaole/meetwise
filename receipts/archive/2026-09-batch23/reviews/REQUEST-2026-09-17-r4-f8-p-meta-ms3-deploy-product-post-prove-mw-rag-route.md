# REQUEST — Knife **F8** · **MS3 standard deploy product handoff** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~01:17 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-post-prove-mw-e2e-ha.md`  
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
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 · `standardDeployHandoff=true` |
| Prior F7 | `harness/r4-f7-p-meta-ms2-facets-product.md` · **`post_prove_dual_pass`** |
| Architecture | `ai-docs/architecture/ai/rag-funnel-routing.md` · deploy handoff |

---

## Stance（RAG-route）

F8 landed **real MS3 standard deploy product handoff** on MetadataReviewReceipt product path（≠ close R4 · ≠ forge）：

1. **MS1** pin stays **true**  
2. **MS2** pin stays **true** · plan = served  
3. **MS3** `standardDeployProductHandoff=true` · checklist：`local_01A_handoff_prove` · `combo_root_receipt` · `standard_or_cloud_deploy_receipt` · ≠ forge · `releaseEvidence=false`  
4. Product FUNNEL classifier **true** · **G-R4-5 / FUNNEL dual-claim STILL OPEN**（await dual · other gates may remain）· **MS3 alone ≠ R4/题域 closed**

**EXIT=0 ≠ R4 closed ≠ 题域已隔离 ≠ HA**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-ms3-deploy-product:prove`** | **0** | MS3 landed；MS1/MS2 true；≠ R4/HA；Ban dual-claim |
| spawn F7 MS2 prove | **0** | 旁证 · MS3 now true |

**未跑（禁）**：HA · flip · Live Key · forge serving · claim R4/FUNNEL/G-R4-5 dual-closed · MySQL/Qdrant cutover。  
**Key**：unset。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-ms3-deploy-product:prove`，附 CMD+EXIT。  
2. MS3 handoff 是否诚实 landed on product path（checklist · ≠ forge）· MS1/MS2 true？  
3. EXIT=0 是否仍钉 **≠ R4 / ≠ 题域已隔离 / ≠ R1 / ≠ HA / ≠ suite green**？  
4. Classifiers（F2/F3/F5）是否与 MS3 wire 对齐 · product FUNNEL classifier true · dual-claim仍 STILL OPEN？  
5. harness/status/eval 是否错误写成 `post_prove_dual_pass` / R4 closed？（期望：**否**）  
6. sole 恰 5？`releaseEvidence=false`？no flip？no model-op？  
7. G-R4-3 是否仍 STILL OPEN？MS3 alone ≠ R4 closed？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f8-p-meta-ms3-deploy-product-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 R4 / 题域已隔离 / R1 / HA / FUNNEL/G-R4-5 dual-closed / forge OK  
- **await post-prove dual** · **Ban self-approve `post_prove_dual_pass`**

---

*REQUEST · mw-rag-route · F8 MS3 deploy product post-prove · 2026-09-17 ~01:17 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · MS1 true · MS2 served · MS3 true · G-R4-5/FUNNEL dual-claim STILL OPEN · Ban forge · Ban self-approve · awaiting dual*
