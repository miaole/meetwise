# REQUEST — Knife **F8** · **MS3 standard deploy product handoff**（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**；**Dual PASS ≠ authorize coding**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~01:07 PT)（after F7 `post_prove_dual_pass`）  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-e2e-ha.md`  
**Hard**: F7 = **`post_prove_dual_pass`**（MS2 served · `fullFacetsServed=true` · HEAD `cedda0d` · **MS1 true** · **MS3 still false** · **G-R4-5 STILL OPEN** · ≠ FUNNEL-01/R4 closed · Ban forge）· F8 coding still needs **own pre-exec dual + authorize** · **Dual PASS ≠ authorize coding** · **MS1/MS2 stay true** · **MS3 stays false until authorized** · **G-R4-5 STILL OPEN until MS3 done** · even after MS3 **may still not close FUNNEL alone** if other gates remain · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ G-R4-5 closed from docs** · **≠ forge MetadataReviewReceipt / deploy handoff** · **≠ flip without authorize** · **no** model-op · no self-approve · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban claiming G-R4-5 closed** · **Ban forge serving** · **Ban self-approve of F8**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f8-p-meta-ms3-deploy-product.md` | **本刀** acceptance stub · M1–M6 |
| `r4-f8-p-meta-ms3-deploy-product.slice.md` | Slice index |
| `eval/r4-f8-p-meta-ms3-deploy-product.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META inventory · G-R4-5 · FUNNEL-01 |
| `harness/r4-domain-isolation-status.md` **G-R4-5 / MS3** / §13 | F7 dual-closed · F8 REQUEST-ready · MS3 still open |
| `m4-rag-hard-gates.md` §R4 / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · prove 绿 ≠ closed · other gates may remain |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | MS1–MS3 · `standardDeployProductHandoff=false` |
| Prior F7 | `harness/r4-f7-p-meta-ms2-facets-product.md` · **`post_prove_dual_pass`** · MS2 served · G-R4-5 STILL OPEN · HEAD `cedda0d` |
| Prior F6 | `harness/r4-f6-p-meta-ms1-product-wire.md` · **`post_prove_dual_pass`** · MS1 wired |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Parallel | `g7-ui-live-rerun-after-chromium` · **does not block** |

---

## Stance（rag-route）

F7 honesty dual **confirmed** MS2 product facets：`facetsServedOnProductPath` = required · `fullFacetsServed=true` · **≠ forge** · **`standardDeployProductHandoff=false`** · **FUNNEL-01 still open** · **G-R4-5 still open**. meetwise 授权 **draft** F8 REQUEST（next clearest remaining = **MS3 standard deploy product handoff**）:

1. **MS3**：land standard / combo-root product deploy handoff evidence — still false after F7  
2. Experts = `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`  
3. Closing MS3 alone **≠ R4 closed / ≠ 题域已隔离** · may close G-R4-5 product surface · **FUNNEL may still remain open** if other gates remain（wrong_track / R1 / production）  
4. **MS1/MS2 pins** stay true · **MS3** stays false until authorized  
5. Planned CMD `pnpm r4-p-meta-ms3-deploy-product:prove` = **`not_run:pre_dual`** · **not implemented**  
6. **Coding gate**：MAIN + NHP-ADV + F1–**F7 `post_prove_dual_pass`**；F8 still needs **own pre-exec dual + authorize** · **Dual PASS ≠ authorize coding**  
7. **G-R4-3** = parallel remaining — **not preferred** · **Ban flip without authorize**  
8. **禁宣称 R4 closed / 题域已隔离 / R1 closed / FUNNEL-01 closed / G-R4-5 closed from docs / forge serving / flip without authorize**  
9. Parallel UI Live re-run **does not block / substitute** F8

This prep: **zero code · zero prove · zero flip · zero Live**.

---

## Please answer

1. harness M1–M6 是否诚实登记 **MS3 standard deploy product handoff**（G-R4-5 / MS3），且 ≠ FUNNEL-01 closed / ≠ forge serving？  
2. 是否同意：**本刀无 coding / 无 prove / 无 flip / 无 Live**，仅 harness + slice + eval + REQUEST？  
3. 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？  
4. 是否同意：**R4 仍 NOT closed**；F7 dual ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ 题域已隔离；G-R4-5 STILL OPEN until MS3；即使 MS3 落地 FUNNEL 仍可能因其他闸门保持开？  
5. 是否同意：MS1/MS2 stay true · MS3 stays false until authorized · coding gate = MAIN + NHP-ADV + F1–F7 dual done · 仍须 **F8 pre-exec dual + authorize** · **Dual PASS ≠ authorize coding** / forge / flip？  
6. 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green / **Ban claiming R4/FUNNEL/G-R4-5 closed** / **Ban forge** / **Ban flip without authorize** / **Ban self-approve**？  
7. 是否同意：G-R4-3 仍开且 = **not preferred** next · parallel UI Live **不**阻塞本刀？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f8-p-meta-ms3-deploy-product-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 prove；**未**改 Worker / serving / forge receipt / deploy handoff  
- 不宣称 FUNNEL-01 / R1 / R4 / G-R4-5 / 题域已隔离 closed  
- **await dual send**；coding/prove/flip 另授权且受 coding gate 约束 · **Dual PASS ≠ authorize coding**

---

*REQUEST · mw-rag-route · F8 MS3 deploy product · 2026-09-17 (~01:07 PT) · REQUEST-ready / not_run:pre_dual · F7=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ G-R4-5 closed · MS1 true · MS2 fullFacetsServed=true · MS3 still false · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Dual PASS ≠ authorize coding · Ban R4/FUNNEL/G-R4-5 closed · Ban forge · Ban flip without authorize · Ban self-approve*
