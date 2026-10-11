# REQUEST — Knife **F6** · **MS1 MetadataReviewReceipt product wire**（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~00:30 PT)（after F5 `post_prove_dual_pass`）  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-e2e-ha.md`  
**Hard**: F5 = **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · `routedServingProductConsumerWired=false` · G-R4-5 **STILL OPEN** · ≠ FUNNEL-01 closed · Ban forge）· F4 = **`post_prove_dual_pass`**（honesty only · G-R4-3 **STILL OPEN** · ≠ R1 closed · ≠ flip）· F6 coding still needs **own pre-exec dual + authorize** · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ forge MetadataReviewReceipt serving** · **≠ flip without authorize** · **no** model-op · no self-approve · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed** · **Ban forge serving**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f6-p-meta-ms1-product-wire.md` | **本刀** acceptance stub · M1–M6 |
| `r4-f6-p-meta-ms1-product-wire.slice.md` | Slice index |
| `eval/r4-f6-p-meta-ms1-product-wire.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META inventory · G-R4-5 · FUNNEL-01 |
| `harness/r4-domain-isolation-status.md` **G-R4-5 / MS1** / §13 | F5 dual-closed · F6 REQUEST-ready · MS1 still open |
| `m4-rag-hard-gates.md` §R4 / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · prove 绿 ≠ closed |
| `apps/worker/src/r4-p-meta-serving-product-remaining.ts` | F5 MS1–MS3 · consumer still false |
| Prior F5 | `harness/r4-f5-p-meta-serving-product.md` · **`post_prove_dual_pass`** · G-R4-5 STILL OPEN |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`** · G-R4-5 STILL OPEN |
| Parallel | `g7-ui-live-rerun-after-chromium` · **does not block** |

---

## Stance（rag-route）

F5 honesty dual **confirmed** product-remaining：contract/plan/checklist **named** · **`routedServingProductConsumerWired=false`** · facetsServed **empty** · deploy handoff **false** · **FUNNEL-01 still open** · **G-R4-5 still open**. F4 honesty dual **confirmed** P-R1 fail-closed remaining：G-R4-3 **still open** · no flip. meetwise 授权 **draft** F6 REQUEST（next clearest remaining = **MS1 product wire**）:

1. **MS1**：wire real routed `MetadataReviewReceipt` product serving consumer — still open after F5 honesty  
2. Experts = `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`  
3. Closing MS1 alone **≠ R4 closed / ≠ 题域已隔离 / ≠ FUNNEL-01 closed**（MS2/MS3 + P-R1 / wrong_track 并列）  
4. Planned CMD `pnpm r4-p-meta-ms1-product-wire:prove` = **`not_run:pre_dual`** · **not implemented**  
5. **Coding gate**：MAIN + NHP-ADV + F1–**F5 `post_prove_dual_pass`**；F6 still needs **own pre-exec dual + authorize**  
6. **G-R4-3 / P-R1** = parallel remaining after F4 — fail-closed flip = **not preferred** · **Ban flip without authorize**  
7. **禁宣称 R4 closed / 题域已隔离 / R1 closed / FUNNEL-01 closed / forge serving / flip without authorize**  
8. Parallel UI Live re-run **does not block / substitute** F6

This prep: **zero code · zero prove · zero flip · zero Live**.

---

## Please answer

1. harness M1–M6 是否诚实登记 **MS1 MetadataReviewReceipt product wire**（G-R4-5 / MS1），且 ≠ FUNNEL-01 closed / ≠ forge serving？  
2. 是否同意：**本刀无 coding / 无 prove / 无 flip / 无 Live**，仅 harness + slice + eval + REQUEST？  
3. 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？  
4. 是否同意：**R4 仍 NOT closed**；F5 honesty dual ≠ FUNNEL-01 closed ≠ G-R4-5 closed ≠ 题域已隔离；F4 dual ≠ R1 closed；本刀关齐 MS1 面仍 ≠ FUNNEL-01/R4 全家关？  
5. 是否同意：coding gate = MAIN + NHP-ADV + F1–F5 dual done · 仍须 **F6 pre-exec dual + authorize** · 本 REQUEST dual **不**自动授权 coding / forge / flip？  
6. 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green / **Ban claiming R4 closed** / **Ban claiming FUNNEL-01 closed** / **Ban forge** / **Ban flip without authorize**？  
7. 是否同意：G-R4-3 / P-R1 仍开且 fail-closed flip = **not preferred** next · parallel UI Live **不**阻塞本刀？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f6-p-meta-ms1-product-wire-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 prove；**未**改 Worker / serving / forge receipt  
- 不宣称 FUNNEL-01 / R1 / R4 / 题域已隔离 closed  
- **await dual send**；coding/prove/flip 另授权且受 coding gate 约束

---

*REQUEST · mw-rag-route · F6 MS1 product wire · 2026-09-17 ~00:30 PT · REQUEST-ready / not_run:pre_dual · F5=`post_prove_dual_pass` · F4=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ FUNNEL-01 closed · ≠ R4 closed · ≠ R1 closed · MS1 still false · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Ban R4 closed · Ban FUNNEL-01 closed · Ban forge · Ban flip without authorize*
