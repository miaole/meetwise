# REQUEST — Knife **F7** · **MS2 facets on product path**（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~00:55 PT)（after F6 `post_prove_dual_pass`）  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-e2e-ha.md`  
**Hard**: F6 = **`post_prove_dual_pass`**（MS1 wired · **MS2/MS3 still false** · **G-R4-5 STILL OPEN** · ≠ FUNNEL-01/R4 closed · Ban forge）· F7 coding still needs **own pre-exec dual + authorize** · **MS1 stays true** · **MS3 stays false** · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ G-R4-5 closed** · **≠ forge MetadataReviewReceipt serving** · **≠ flip without authorize** · **no** model-op · no self-approve · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban forge serving** · **Ban self-approve of F7**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f7-p-meta-ms2-facets-product.md` | **本刀** acceptance stub · M1–M6 |
| `r4-f7-p-meta-ms2-facets-product.slice.md` | Slice index |
| `eval/r4-f7-p-meta-ms2-facets-product.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META inventory · G-R4-5 · FUNNEL-01 |
| `harness/r4-domain-isolation-status.md` **G-R4-5 / MS2** / §13 | F6 dual-closed · F7 REQUEST-ready · MS2 still open |
| `m4-rag-hard-gates.md` §R4 / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · prove 绿 ≠ closed |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 · facetsServed empty |
| Prior F6 | `harness/r4-f6-p-meta-ms1-product-wire.md` · **`post_prove_dual_pass`** · MS1 wired · G-R4-5 STILL OPEN |
| Prior F5 | `harness/r4-f5-p-meta-serving-product.md` · **`post_prove_dual_pass`** |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Parallel | `g7-ui-live-rerun-after-chromium` · **does not block** |

---

## Stance（rag-route）

F6 honesty dual **confirmed** MS1 product wire：`routedServingProductConsumerWired=true` · contract.wired=true · admit path live · **≠ forge** · **`facetsServedOnProductPath=[]`** · deploy handoff **false** · **FUNNEL-01 still open** · **G-R4-5 still open**. meetwise 授权 **draft** F7 REQUEST（next clearest remaining = **MS2 facets on product path**）:

1. **MS2**：serve required secondary facets on product path — still empty after F6  
2. Experts = `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`  
3. Closing MS2 alone **≠ R4 closed / ≠ 题域已隔离 / ≠ FUNNEL-01 closed / ≠ G-R4-5 closed**（MS3 + P-R1 / wrong_track 并列）  
4. **MS1 pin** stays true · **MS3** stays false this knife  
5. Planned CMD `pnpm r4-p-meta-ms2-facets-product:prove` = **`not_run:pre_dual`** · **not implemented**  
6. **Coding gate**：MAIN + NHP-ADV + F1–**F6 `post_prove_dual_pass`**；F7 still needs **own pre-exec dual + authorize**  
7. **MS3 / G-R4-3** = parallel remaining — **not preferred** · **Ban flip without authorize**  
8. **禁宣称 R4 closed / 题域已隔离 / R1 closed / FUNNEL-01 closed / G-R4-5 closed / forge serving / flip without authorize**  
9. Parallel UI Live re-run **does not block / substitute** F7

This prep: **zero code · zero prove · zero flip · zero Live**.

---

## Please answer

1. harness M1–M6 是否诚实登记 **MS2 facets on product path**（G-R4-5 / MS2），且 ≠ FUNNEL-01 closed / ≠ forge serving？  
2. 是否同意：**本刀无 coding / 无 prove / 无 flip / 无 Live**，仅 harness + slice + eval + REQUEST？  
3. 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？  
4. 是否同意：**R4 仍 NOT closed**；F6 dual ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ 题域已隔离；本刀关齐 MS2 面仍 ≠ FUNNEL-01/R4/G-R4-5 全家关（MS3 remain）？  
5. 是否同意：MS1 stays true · MS3 stays false · coding gate = MAIN + NHP-ADV + F1–F6 dual done · 仍须 **F7 pre-exec dual + authorize** · 本 REQUEST dual **不**自动授权 coding / forge / flip？  
6. 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green / **Ban claiming R4/FUNNEL/G-R4-5 closed** / **Ban forge** / **Ban flip without authorize** / **Ban self-approve**？  
7. 是否同意：MS3 / G-R4-3 仍开且 = **not preferred** next · parallel UI Live **不**阻塞本刀？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f7-p-meta-ms2-facets-product-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 prove；**未**改 Worker / serving / forge receipt  
- 不宣称 FUNNEL-01 / R1 / R4 / G-R4-5 / 题域已隔离 closed  
- **await dual send**；coding/prove/flip 另授权且受 coding gate 约束

---

*REQUEST · mw-rag-route · F7 MS2 facets product · 2026-09-17 ~00:55 PT · REQUEST-ready / not_run:pre_dual · F6=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ G-R4-5 closed · MS1 true · MS2/MS3 still open as scoped · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Ban R4/FUNNEL/G-R4-5 closed · Ban forge · Ban flip without authorize · Ban self-approve*
