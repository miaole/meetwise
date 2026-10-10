# REQUEST — Knife **F5** · **P-META serving product remaining** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 (~00:22 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ FUNNEL-01/R4/R1 closed ≠ HA · **MS1–MS3 still false** · **Ban forge serving** · no self-approve · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed**  
**Prior pre-exec dual（pass）**: `2026-09-17-r4-f5-p-meta-serving-product-mw-e2e-ha.md` · `2026-09-17-r4-f5-p-meta-serving-product-mw-rag-route.md`  
**Knife**: `pnpm r4-p-meta-serving-product:prove`（MS1–MS4 product remaining）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f5-p-meta-serving-product.md` | Canonical harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f5-p-meta-serving-product.eval.md` | run-status + fake-green checklist |
| `r4-f5-p-meta-serving-product.slice.md` | Slice index |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-5** | R4 **仍 NOT closed**；F5 awaiting post-prove dual · MS1–MS3 still false · G-R4-5 STILL OPEN |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 product remaining classifiers（contract/plan/checklist named · wired bits still false） |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 serving honesty（aligned · still false） |
| `apps/worker/test/r4-p-meta-serving-product.proof.ts` | F5 prove |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`**（G-R4-3 STILL OPEN · no flip） |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`**（MS1–MS3 still false · G-R4-5 STILL OPEN） |

---

## Stance（E2E-HA）

F5 landed **honest product remaining** for P-META serving（≠ close FUNNEL-01 · ≠ forge）：

1. **MS1** product `MetadataReviewReceipt` serving: contract **named** · consumer **still unwired** · ≠ forge  
2. **MS2** product facets: plan **pinned** · served-on-product-path **empty**  
3. **MS3** product deploy handoff: checklist **named** · standard deploy evidence **still open** · local 01A ≠ standard/cloud  
4. **MS4** hard pins: 01A ≠ 01 · ≠ R4/FUNNEL/R1 closed · sole 恰 5 · `releaseEvidence=false` · no model-op · **no P-R1 flip** · G-R4-3 parallel open

**EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ HA ≠ knife product-done**. **MS1–MS3 still false · G-R4-5 STILL OPEN**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-serving-product:prove`** | **0** | MS1–MS4；product progress named；**MS1–MS3 still false**；≠ FUNNEL-01/R4 关；await dual |
| spawn `pnpm r4-p-meta-serving:prove` | **0** | F3 honesty 旁证 ≠ FUNNEL-01 closed |
| `:prove:raw` / no-PG isolated | **n/a** | harness **does not** require :raw（no PG） |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · Live Key×3 · forge MetadataReviewReceipt serving · 把本绿写成 FUNNEL-01/R4 关 / MS product-done。  
**Key**：unset（未 invent MODEL_API_KEY）。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-serving-product:prove`，附 CMD+EXIT。  
2. MS1–MS4 是否诚实成立（product contract/plan/checklist named · MS1–MS3 **still false** · ≠ forge · no P-R1 flip）？  
3. EXIT=0 是否仍钉 **≠ FUNNEL-01 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ HA / ≠ suite green / ≠ knife product-done**？  
4. F3 `post_prove_dual_pass` 是否仍钉 **≠** FUNNEL-01 closed · G-R4-5 STILL OPEN · F4 dual **≠** R1 closed / flip？  
5. harness/status/eval 是否错误把本绿写成 FUNNEL-01/R4 已关 / MS product-closed / forge OK？（期望：**否** · MS still false）  
6. sole allowlist 是否仍恰 5 未翻？`releaseEvidence=false`？no flip default？  
7. **no** `mw-model-op` 是否仍正确？G-R4-5 / G-R4-3 是否仍 STILL OPEN？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 FUNNEL-01 / R1 / R4 closed / 题域已隔离 / HA / MS product-done / forge OK  
- **await post-prove dual**

---

*REQUEST · mw-e2e-ha · F5 P-META serving product post-prove · 2026-09-17 ~00:22 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · MS1–MS3 still false · G-R4-5 STILL OPEN · Ban forge · awaiting dual*
