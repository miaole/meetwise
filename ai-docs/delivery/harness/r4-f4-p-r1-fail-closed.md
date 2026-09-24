# Harness — Knife **F4** · **P-R1 fail-closed remaining**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-17 (~00:08 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · coding+prove **executed** · post-prove dual **PASS** · expert re-run prove **EXIT=0** both domains）  
**Parent**: `harness/r4-domain-isolation.md` §2 / §6c.3 · `r4-domain-isolation-status.md` §13 · **G-R4-3**  
**Slice**: `../r4-f4-p-r1-fail-closed.slice.md`  
**Eval**: `../eval/r4-f4-p-r1-fail-closed.eval.md`  
**Authority**: meetwise — F3 = **`post_prove_dual_pass`**（honesty only · MS1–MS3 still false · G-R4-5/P-META serving **STILL OPEN**）· F4 pre-exec dual **PASS** + authorize coding+prove · prove **EXIT=0** · **post-prove dual PASS**（e2e-ha + rag-route · expert EXIT=0）→ harness **`post_prove_dual_pass`** · **EXIT=0 ≠ R1/R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ flip authorized** · **G-R4-3 STILL OPEN** · **PR1-A true · PR1-B/C false** · **releaseEvidence=false** · **Ban claiming R4 closed** · **Ban claiming R1 closed** · **no flip default**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Honesty / remaining-gap prove for **P-R1**（**G-R4-3** / GAP-RAG-01）：legacy「技术岗」default-on · fail-closed evidence remaining（`MEETWISE_TECH_ROLE_FAIL_CLOSED` default OFF · flag-on combo-root evidence still missing） |
| **What this knife is not** | Not R1 closed · not R4 closed · not 题域已隔离 · not FUNNEL-01 closed · not F2/F3 re-run · not P-META serving product close · **not** flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default · not MODEL-OP · not Live Key |
| **Why F4 = P-R1 fail-closed** | F2 honesty left P-R1 / G-R4-3 **parallel open**；F3 closed P-META **serving honesty** only（G-R4-5 still open）· clearest actionable remaining then = legacy tech-role default-on / fail-closed evidence honesty |
| **r1 prove ≠ R1 closed** | `pnpm r1-tech-role-fail-closed:prove` green = contract 旁证 only · **≠** production no longer depends on legacy default · **≠** flag-on combo-root evidence |
| **Prior F3** | F3 = **`post_prove_dual_pass`** · EXIT=0 ≠ FUNNEL-01/R4 closed · **MS1–MS3 still false** · G-R4-5 **STILL OPEN** |
| **Prior F2** | F2 = **`post_prove_dual_pass`** · P-META/P-R1 product gaps **STILL OPEN** · no flip |
| **MODEL-OP?** | **Not required** for this harness domain → **no** `mw-model-op` REQUEST |
| **Now** | Coding+prove **executed** · prove **EXIT=0** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · **PR1-A true · PR1-B/C false** · **G-R4-3 / P-R1 STILL OPEN** · **no flip default** · **next** = **F5 P-META serving product remaining**（MS1–MS3 / G-R4-5） |

---

## 1. Scope（P-R1 fail-closed remaining · G-R4-3）

| ID | Gap class | Intent this knife（honesty） | Close R4 alone? |
|----|-----------|------------------------------|-----------------|
| **PR1-A** | Legacy「技术岗」default-on | Honesty: default flag **OFF** · production still depends on legacy fallback | **否**（**STILL OPEN** · **true**） |
| **PR1-B** | Fail-closed flag-on evidence | Honesty: flag-on contract unit exists · combo-root evidence **still missing** · **≠** flip default this knife | **否**（**STILL OPEN** · **false**） |
| **PR1-C** | r1 contract 旁证 | Honesty: `r1-tech-role-fail-closed:prove` green **≠** R1 closed | **否**（**false**） |
| **PR1-D** | Hard pins | ≠ R1 closed · ≠ flip default · ≠ R4 closed · `releaseEvidence=false` · sole 恰 5 · G-R4-5 still open parallel | n/a |

**Out of scope this knife**: P-META serving product close（G-R4-5 still open after F3 → **F5**）· F1 wrong_track · sole allowlist · Live Key · **flip `MEETWISE_TECH_ROLE_FAIL_CLOSED` default** · claiming R1/R4 closed.

**Sibling still open**: **G-R4-5 / P-META serving**（F3 honesty dual · MS1–MS3 still false）— **next F5 product remaining**.

---

## 2. Acceptance（M1–M6 · honesty dual met）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names P-R1 fail-closed remaining（PR1-A–D）from G-R4-3 / F2 leftover | **met** |
| **M2** | Hard pins: ≠ R1 closed · ≠ R4 closed · ≠ 题域已隔离 · ≠ flip default · `releaseEvidence=false` · ≠ HA · sole 恰 5 | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Prove CMD frozen · executed · EXIT=0 · expert re-run EXIT=0 | **met** |
| **M5** | Coding gate: F1+F2+F3 dual-closed · F4 pre-exec dual + authorize | **satisfied** |
| **M6** | Dual REQUEST pair · no self-approve · **post-prove dual PASS** | **met** → **`post_prove_dual_pass`** |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-p-r1-fail-closed:prove`** | Honesty / remaining-gap prove for P-R1 fail-closed（PR1-A–D） | **EXIT=0**（implementer ~23:59 PT · expert dual ~00:04 PT） |
| `pnpm r1-tech-role-fail-closed:prove` | Existing R1 contract旁证（spawned） | **EXIT=0** · **≠ R1 closed** |
| Prior `pnpm r4-p-meta-p-r1:prove` | F2 honesty 旁证 | **EXIT=0** · **≠** R1 closed · **≠** this knife alone |

**Note**: harness does **not** require `:prove:raw` / isolated PG（honesty + r1 contract；no PG）. EXIT=0 **≠** R1/R4 closed · **≠** authorize to flip default · **≠** knife product-done.

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-16-r4-f4-p-r1-fail-closed-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-16-r4-f4-p-r1-fail-closed-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted**（no MODEL-OP domain need） |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-e2e-ha.md` | **pass** · expert prove **EXIT=0** |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-f4-p-r1-fail-closed-post-prove-mw-rag-route.md` | **pass** · expert prove **EXIT=0** |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离**  
- **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed**（01A ≠ 01 · G-R4-5 still open after F3）  
- **F3 `post_prove_dual_pass` ≠ FUNNEL-01 closed ≠ R4 closed ≠ knife done** · MS1–MS3 still false  
- **F2 `post_prove_dual_pass` ≠ R1 closed ≠ FUNNEL-01 closed**  
- **EXIT=0 ≠ R1 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ flip authorized ≠ knife done**  
- **P-R1 product gaps STILL OPEN**（**G-R4-3 still open**）· productionDependsOnLegacy=true · comboRootFlagOnEvidence=false · **PR1-A true · PR1-B/C false**  
- **≠ HA** · `releaseEvidence=false` · no self-approve  
- **MAIN / NHP-ADV / F1 / F2 / F3 / F4 all `post_prove_dual_pass`（done）**  
- sole allowlist **恰 5 未翻** · ≠ R5 retired ≠ sole cutover ≠ G1 flip · **no flip default** · no open DELETE  
- no `mw-model-op` REQUEST unless domain need proven  
- **Ban claiming R1 closed** · **Ban claiming R4 closed** · **Ban flipping default this knife**  
- **next** = **F5 P-META serving product remaining**（MS1–MS3 / G-R4-5 · `REQUEST-ready / not_run:pre_dual`）· **≠** FUNNEL-01/R4 closed · **≠** forge serving

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/adaptive-role-resolve.ts` | R1 flag + legacy / fail-closed（default OFF · **no flip this knife**） |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 honesty classifiers（PR1 default OFF · legacy on · aligned） |
| `apps/worker/src/r4-p-r1-fail-closed-remaining.ts` | **this knife** PR1-A–D fail-closed honesty classifiers |
| `apps/worker/test/r4-p-r1-fail-closed.proof.ts` | **this knife** F4 prove |
| `apps/worker/test/r4-p-meta-p-r1.proof.ts` | F2 prove 旁证 |
| `docker/env/worker.env.example` | `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` pin（**unchanged**） |
| `ai-docs/delivery/m4-rag-hard-gates.md` §R1 / GAP-RAG-01 | R1 close conditions |

---

*Harness · F4 P-R1 fail-closed remaining · 2026-09-17 ~00:08 PT · post_prove_dual_pass · prove EXIT=0 · expert dual PASS · F3=`post_prove_dual_pass` · releaseEvidence=false · ≠HA · ≠ R1 closed · ≠ R4 closed · ≠ flip default · PR1-A true · PR1-B/C false · G-R4-3 STILL OPEN · sole 恰 5 · no model-op · Ban R4 closed · Ban R1 closed · next=F5*
