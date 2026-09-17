# REQUEST — Knife **F4** · **P-R1 fail-closed remaining**（pre-exec）→ mw-e2e-ha

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~23:51 PT)（after F3 `post_prove_dual_pass`）  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ full E2E suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md`  
**Hard**: F3 = **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · G-R4-5/P-META serving **STILL OPEN** · ≠ FUNNEL-01 closed）· F4 coding still needs **own pre-exec dual + authorize** · **≠ R1 closed** · **≠ flip default without authorize** · **no** model-op REQUEST · **zero coding / zero prove this prep** · **Ban claiming R4 closed**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f4-p-r1-fail-closed.md` | Canonical harness（this knife） |
| `r4-f4-p-r1-fail-closed.slice.md` | Slice index |
| `eval/r4-f4-p-r1-fail-closed.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation-status.md` §13 · **G-R4-3** | F3 dual-closed · F4 REQUEST-ready · P-R1 still open |
| `m4-rag-hard-gates.md` §R1 / GAP-RAG-01 | R1 close conditions · prove ≠ closed |
| `apps/worker/src/adaptive-role-resolve.ts` | Flag + legacy「技术岗」（default OFF） |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`** · serving gaps STILL OPEN |
| Prior F2 | `harness/r4-f2-p-meta-p-r1.md` · **`post_prove_dual_pass`** · P-R1 STILL OPEN |
| Sibling F1 | `harness/r4-f1-wrong-track-prod-surface.md` · **`post_prove_dual_pass`** |

---

## Stance（E2E-HA）

This knife **drafts** acceptance for **P-R1 fail-closed remaining**（F2/F3 leftover · **G-R4-3**）:

1. **PR1-A** = legacy「技术岗」default-on honesty remaining（default flag OFF）  
2. **PR1-B** = fail-closed flag-on / combo-root evidence remaining — **≠ flip default this prep**  
3. **PR1-C** = `pnpm r1-tech-role-fail-closed:prove` 旁证 **≠** R1 closed  
4. Experts = e2e-ha + rag-route only — **no** `mw-model-op`  
5. **≠ R4 closed · ≠ 题域已隔离 · ≠ R1 closed** · F3 dual ≠ product close of G-R4-5  
6. **Coding gate**：MAIN + NHP-ADV + F1 + F2 + **F3 dual done**；F4 still needs **own pre-exec dual + authorize**  
7. CMD planned · **`not_run:pre_dual`** · **not implemented**  
8. **G-R4-5 / P-META serving** remains parallel open — **not** this F4 product scope

This prep: **zero prove · zero coding · zero flip · zero self-approve**.

---

## Please answer

1. Agree F4 = P-R1 **fail-closed remaining**（G-R4-3 · PR1-A–D；≠ F2/F3 re-run · ≠ P-META serving knife）?  
2. Agree ≠ R1 closed · ≠ flip default without authorize · ≠ R4 closed · ≠ 题域已隔离?  
3. Agree **no** `mw-model-op` REQUEST is correct for this harness?  
4. Agree F3 = `post_prove_dual_pass` satisfies prior gate，but F4 coding still needs **F4 pre-exec dual + authorize**?  
5. Agree CMD `not_run:pre_dual` · no prove this turn · no self-approve · `releaseEvidence=false` · ≠ HA · sole 恰 5 · **Ban claiming R4 closed**?

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md`）. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not R1 closed · not FUNNEL-01 closed · not R4 closed · not 题域已隔离 · not HA · not F4 coding authorized · not flip default authorized

---

*REQUEST · mw-e2e-ha · F4 P-R1 fail-closed · 2026-09-16 ~23:51 PT · REQUEST-ready / not_run:pre_dual · F3=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ R1 closed · ≠ flip default · R4 open · sole 恰 5 · no model-op · Ban R4 closed*
