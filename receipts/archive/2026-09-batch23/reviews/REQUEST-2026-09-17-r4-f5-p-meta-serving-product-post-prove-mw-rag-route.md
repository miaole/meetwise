# REQUEST — Knife **F5** · **P-META serving product remaining** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~00:22 PT · post-prove)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-e2e-ha.md`  
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
| `harness/r4-domain-isolation.md` §2 / §6c.3 · **G-R4-5** | P-META inventory · FUNNEL-01 still open |
| `harness/r4-domain-isolation-status.md` §13 | F5 awaiting post-prove · MS1–MS3 still false · G-R4-5 STILL OPEN · G-R4-3 STILL OPEN |
| `m4-rag-hard-gates.md` §R4 / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · prove 绿 ≠ closed |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | Product remaining classifiers |
| `apps/worker/test/r4-p-meta-serving-product.proof.ts` | F5 prove |
| Prior F4 | **`post_prove_dual_pass`** · G-R4-3 STILL OPEN · ≠ R1 closed · ≠ flip |
| Prior F3 | **`post_prove_dual_pass`** · MS1–MS3 still false · G-R4-5 STILL OPEN · ≠ FUNNEL-01 closed |

---

## Stance（rag-route）

F5 = **serving product remaining**（≠ F3 honesty re-run alone · ≠ forge · ≠ FUNNEL-01 closed）：

1. **MS1** — product serving contract named · routed product consumer **still false**  
2. **MS2** — product facet plan pinned · served-on-path **empty**  
3. **MS3** — product deploy checklist named · standard deploy evidence **still false** · local 01A ≠ standard  
4. **MS4** — 01A ≠ 01 · ≠ R4/FUNNEL/R1 closed · sole 恰 5 · Ban forge · G-R4-3 parallel open · no flip  
5. Closing MS product remaining **alone ≠ R4 closed / ≠ 题域已隔离**（P-R1 / wrong_track 并列）  
6. CMD `pnpm r4-p-meta-serving-product:prove` **EXIT=0** · **MS1–MS3 still false** · **G-R4-5 STILL OPEN**

**EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ HA**.  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-serving-product:prove`** | **0** | product progress named · MS1–MS3 still false · ≠ FUNNEL-01/R4 关 |
| spawn `pnpm r4-p-meta-serving:prove` | **0** | F3 旁证 ≠ FUNNEL-01 closed |

**禁**：forge serving · claim FUNNEL-01/R4/R1 closed · flip · invent Key · self-approve.

---

## Please answer

1. 独立复跑 `pnpm r4-p-meta-serving-product:prove`，附 CMD+EXIT。  
2. MS1–MS4 / product remaining 是否诚实（named progress · MS still false · ≠ forge）？  
3. EXIT=0 是否仍钉 **≠ FUNNEL-01 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ R1 closed / ≠ HA / ≠ suite green / ≠ knife product-done**？  
4. 01A ≠ 01 是否仍成立？F3 dual ≠ FUNNEL-01 closed？F4 dual ≠ R1 closed / flip？  
5. harness/status/eval 是否偷写成 FUNNEL-01/R4 closed / MS product-done / forge OK？（期望：**否**）  
6. sole 恰 5？`releaseEvidence=false`？no model-op？G-R4-5 / G-R4-3 STILL OPEN？  
7. G-R4-3 / P-R1 是否仍 parallel open（not this F5）？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f5-p-meta-serving-product-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- 不宣称 FUNNEL-01 / R1 / R4 / 题域已隔离 closed · HA · MS product-done · forge OK  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · F5 P-META serving product post-prove · 2026-09-17 ~00:22 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠FUNNEL-01 closed · ≠R4 closed · MS1–MS3 still false · G-R4-5 STILL OPEN · Ban forge · awaiting dual*
