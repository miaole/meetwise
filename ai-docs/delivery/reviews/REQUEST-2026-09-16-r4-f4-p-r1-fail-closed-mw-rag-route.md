# REQUEST — Knife **F4** · **P-R1 fail-closed remaining**（pre-exec）→ mw-rag-route

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写；**禁止自批 pass**；**not yet dual-sent**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~23:51 PT)（after F3 `post_prove_dual_pass`）  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md`  
**Hard**: F3 = **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · G-R4-5 **still open**）· F4 coding still needs **own pre-exec dual + authorize** · **≠ R1 closed** · **≠ flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default without authorize** · **no** model-op · no self-approve · **zero coding / zero prove this prep** · **Ban claiming R4 closed**

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f4-p-r1-fail-closed.md` | **本刀** acceptance stub · M1–M6 |
| `r4-f4-p-r1-fail-closed.slice.md` | Slice index |
| `eval/r4-f4-p-r1-fail-closed.eval.md` | Pre-exec eval stubs |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-R1 inventory · GAP-RAG-01 |
| `harness/r4-domain-isolation-status.md` **G-R4-3** / §13 | F3 dual-closed · F4 REQUEST-ready · R1 PREREQ still open |
| `m4-rag-hard-gates.md` §R1 / GAP-RAG-01 | R1 close conditions · prove 绿 ≠ closed |
| `apps/worker/src/adaptive-role-resolve.ts` | default OFF · legacy「技术岗」 |
| Prior F3 | `harness/r4-f3-p-meta-serving.md` · **`post_prove_dual_pass`** · G-R4-5 STILL OPEN |
| Prior F2 | `harness/r4-f2-p-meta-p-r1.md` · **`post_prove_dual_pass`** · P-R1 STILL OPEN |
| Sibling F1 | `harness/r4-f1-wrong-track-prod-surface.md` · **`post_prove_dual_pass`** |

---

## Stance（rag-route）

F3 honesty dual **confirmed** remaining-gap for serving：MS1–MS3 **still false** · **FUNNEL-01 still open** · **G-R4-5 still open**. F2 left **P-R1 / G-R4-3 parallel open**. meetwise 授权 **draft** F4 REQUEST（next clearest remaining = **P-R1 fail-closed**）:

1. **PR1-A**：legacy「技术岗」default-on honesty — production still depends on legacy fallback（default flag OFF）  
2. **PR1-B**：fail-closed flag-on / combo-root evidence remaining — **禁本 prep flip default**  
3. **PR1-C**：`pnpm r1-tech-role-fail-closed:prove` 旁证 **≠** R1 closed  
4. Experts = `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`  
5. Closing PR1 honesty **alone ≠ R4 closed / ≠ 题域已隔离**（P-META serving / P-R2 / wrong_track 并列）  
6. Planned CMD `pnpm r4-p-r1-fail-closed:prove` = **`not_run:pre_dual`** · **not implemented**  
7. **Coding gate**：MAIN + NHP-ADV + F1 + F2 + **F3 `post_prove_dual_pass`**；F4 still needs **own pre-exec dual + authorize**  
8. **G-R4-5 / P-META serving** = parallel remaining after F3 — **not** this F4 product scope  
9. **禁宣称 R4 closed / 题域已隔离 / R1 closed / FUNNEL-01 closed / flip default**

This prep: **zero code · zero prove · zero flip**.

---

## Please answer

1. harness M1–M6 是否诚实登记 P-R1 **fail-closed remaining**（PR1-A–D · G-R4-3），且 ≠ R1 closed / ≠ flip without authorize？  
2. 是否同意：**本刀无 coding / 无 prove / 无 flip**，仅 harness + slice + eval + REQUEST？  
3. 是否同意：**省略** `mw-model-op` REQUEST（无 MODEL-OP domain need）？  
4. 是否同意：**R4 仍 NOT closed**；F3 honesty dual ≠ FUNNEL-01 closed ≠ 题域已隔离；本刀关齐 R1 面仍 ≠ R4 全家关？  
5. 是否同意：coding gate = MAIN + NHP-ADV + F1 + F2 + F3 dual done · 仍须 **F4 pre-exec dual + authorize** · 本 REQUEST dual **不**自动授权 coding / flip？  
6. 是否同意：保持 `releaseEvidence=false`；sole 恰 5；禁 flip default / open DELETE / HA / suite green / **Ban claiming R4 closed**？  
7. 是否同意：G-R4-5 / P-META serving 仍开且 **不**并入本 F4 product scope（F3 honesty only）？

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- **未**跑 prove；**未**改 Worker / R1 flag default  
- 不宣称 R1 / FUNNEL-01 / R4 / 题域已隔离 closed  
- **await dual send**；coding/prove/flip 另授权且受 coding gate 约束

---

*REQUEST · mw-rag-route · F4 P-R1 fail-closed · 2026-09-16 ~23:51 PT · REQUEST-ready / not_run:pre_dual · F3=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠R1 closed · ≠flip default · ≠R4 closed · sole 恰 5 · no model-op · Ban R4 closed*
