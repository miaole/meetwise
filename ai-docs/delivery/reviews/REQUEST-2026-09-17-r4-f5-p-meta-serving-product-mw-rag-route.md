# REQUEST — Knife **F5** · **P-META serving product remaining**（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 (~00:08 PT)（after F4 `post_prove_dual_pass`）  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-17-r4-f5-p-meta-serving-product-mw-e2e-ha.md`  
**Hard**: F4 = **`post_prove_dual_pass`**（honesty only · G-R4-3 **still open** · ≠ R1 closed · ≠ flip）· F3 = **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · G-R4-5 **still open**）· F5 coding still needs **own pre-exec dual + authorize** · **≠ FUNNEL-01 closed** · **≠ R4 closed** · **≠ R1 closed** · **≠ forge MetadataReviewReceipt serving** · **≠ flip without authorize** · **no** model-op · no self-approve · **zero coding / zero prove this prep** · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f5-p-meta-serving-product.md` | **本刀** acceptance stub · M1–M6 |
| `r4-f5-p-meta-serving-product.slice.md` | Slice index |
| `eval/r4-f5-p-meta-serving-product.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META inventory · G-R4-5 · FUNNEL-01 |
| `harness/r4-domain-isolation-status.md` **G-R4-5** / §13 | F4 dual-closed · F5 REQUEST-ready · serving still open |
| `m4-rag-hard-gates.md` §R4 / FUNNEL | FUNNEL-01 close conditions · 01A ≠ 01 · prove 绿 ≠ closed |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | F3 MS1–MS3 · still false |
| Prior F4 | `harness/r4-f4-p-r1-fail-closed.md` · **`post_prove_dual_pass`** · G-R4-3 STILL OPEN |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`** · G-R4-5 STILL OPEN |
| Prior F2 | `harness/r4-f2-p-meta-p-r1.md` · **`post_prove_dual_pass`** |
| Sibling F1 | `harness/r4-f1-wrong-track-prod-surface.md` · **`post_prove_dual_pass`** |
| Parallel | `g7-ui-live-rerun-after-chromium` · **does not block** |

---

## Stance（rag-route）

F3 honesty dual **confirmed** remaining-gap for serving：MS1–MS3 **still false** · **FUNNEL-01 still open** · **G-R4-5 still open**. F4 honesty dual **confirmed** P-R1 fail-closed remaining：G-R4-3 **still open** · no flip. meetwise 授权 **draft** F5 REQUEST（next clearest remaining = **P-META serving product**）:

1. **MS1**：routed `MetadataReviewReceipt` serving product consumer — still open after F3 honesty  
2. **MS2**：full secondary facets served-on-path — inventory named · path empty  
3. **MS3**：standard deploy / combo-root handoff — local 01A ≠ standard deploy · **禁本 prep forge serving**  
4. Experts = `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`  
5. Closing MS product remaining **alone ≠ R4 closed / ≠ 题域已隔离**（P-R1 / wrong_track 并列）  
6. Planned CMD `pnpm r4-p-meta-serving-product:prove` = **`not_run:pre_dual`** · **not implemented**  
7. **Coding gate**：MAIN + NHP-ADV + F1 + F2 + F3 + **F4 `post_prove_dual_pass`**；F5 still needs **own pre-exec dual + authorize**  
8. **G-R4-3 / P-R1** = parallel remaining after F4 — **not** this F5 product scope  
9. **禁宣称 R4 closed / 题域已隔离 / R1 closed / FUNNEL-01 closed / forge serving / flip without authorize**  
10. Parallel UI Live re-run **does not block / substitute** F5

This prep: **zero code · zero prove · zero flip · zero Live**.

---

## Please answer

1. harness M1–M6 是否诚实登记 P-META **serving product remaining**（MS1–MS4 · G-R4-5），且 ≠ FUNNEL-01 closed / ≠ forge serving？  
2. 是否同意：**本刀无 coding / 无 prove / 无 flip / 无 Live**，仅 harness + slice + eval + REQUEST？  
3. 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？  
4. 是否同意：**R4 仍 NOT closed**；F3 honesty dual ≠ FUNNEL-01 closed ≠ 题域已隔离；F4 dual ≠ R1 closed；本刀关齐 serving product 面仍 ≠ R4 全家关？  
5. 是否同意：coding gate = MAIN + NHP-ADV + F1–F4 dual done · 仍须 **F5 pre-exec dual + authorize** · 本 REQUEST dual **不**自动授权 coding / forge？  
6. 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green / **Ban claiming R4 closed** / **Ban claiming FUNNEL-01 closed**？  
7. 是否同意：G-R4-3 / P-R1 仍开且 **不**并入本 F5 product scope（F4 honesty only）· parallel UI Live **不**阻塞本刀？

Please write the conclusion to `reviews/`（e.g. `2026-09-17-r4-f5-p-meta-serving-product-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 prove；**未**改 Worker / serving / forge receipt  
- 不宣称 FUNNEL-01 / R1 / R4 / 题域已隔离 closed  
- **await dual send**；coding/prove/flip 另授权且受 coding gate 约束

---

*REQUEST · mw-rag-route · F5 P-META serving product · 2026-09-17 ~00:08 PT · REQUEST-ready / not_run:pre_dual · F4=`post_prove_dual_pass` · F3=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠FUNNEL-01 closed · ≠R4 closed · ≠R1 closed · MS1–MS3 still false · G-R4-5 STILL OPEN · sole 恰 5 · no model-op · zero coding · Ban R4 closed · Ban FUNNEL-01 closed*
