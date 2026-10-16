# Harness — Knife **F1** · wrong_track **production-surface remaining**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-16 (~23:27 PT)  
**releaseEvidence=false** · **≠HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production fully closed** · **≠ flip default** · **≠ open DELETE** · **≠ suite green**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS** · post-prove dual **PASS** · expert re-run prove EXIT=0 · raw EXIT=1）  
**Parent**: `harness/r4-domain-isolation.md` · `r4-domain-isolation-status.md` §13  
**Slice**: `../r4-f1-wrong-track-prod-surface.slice.md`  
**Eval**: `../eval/r4-f1-wrong-track-prod-surface.eval.md`  
**Authority**: meetwise — F1 pre-exec dual PASS + coding+prove + **post-prove dual PASS** → harness **`post_prove_dual_pass`** · **no self-approve** · EXIT=0 ≠ R4 closed ≠ prod fully closed · **sole 恰 5**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Production-path wrong_track=0 **remaining** after LIVE_PG ADV honesty dual + NHP covered（THIS case）: call-path / deploy-surface / cache-replay / observability |
| **What this knife is not** | Not R4 close · not LIVE_PG re-run alone · not NHP covered elevation · not HA · not MAIN sole∩scor · **not** production wrong_track=0 **fully** closed |
| **Prior LIVE_PG** | `r4-wrong-track-adv-live-pg` = `post_prove_dual_pass`（**honesty only**）· **LIVE_PG dual ≠ prod closed** |
| **Prior NHP covered** | `nhp-r4-adv-covered-path` = **`post_prove_dual_pass`**（NHP-R4-ADV-01 covered · THIS case）· **NHP covered dual ≠ this knife** · **NHP covered ≠ F1 alone** |
| **Prior MAIN** | sole∩scor-00 = `post_prove_dual_pass`（honesty only）· **done** · ≠ R5 retired ≠ R4 closed |
| **R4?** | **Still NOT closed.** Ban claiming R4 closed / 题域已隔离. |
| **Now** | Coding+prove **executed** · post-prove dual **PASS** · status **`post_prove_dual_pass`** · `releaseEvidence=false` · **≠** production wrong_track=0 fully closed |

---

## 1. Scope（production-surface remaining）

| Gap class | Intent | Implemented |
|-----------|--------|-------------|
| **PS1** | Prod call-path / deploy-surface: main injects `trackLocal`; production NODE_ENV refuses missing-trackLocal compat fallback（fail-closed `track_local_required`） | **yes** · consumer + `productionRequiresTrackLocal` |
| **PS2** | Observability / fail-closed: `rag_retrieval_total{mode=track_local}` on wrong_track / recheck / cache-replay / snapshot-missing; cache-replay map still fail-closed | **yes** · `classifyTrackLocalOutcome` + `observeTrackLocalRetrieval` on `retrieveVia` |
| **PS3** | Honest pin: production wrong_track=0 remaining ≠ R4 closed（P-R1 / P-R2 / P-META / P-FIX still open）· LIVE_PG ≠ prod closed · NHP covered ≠ this knife | **yes** · harness/eval/status pins |

**Companions**: NEG/FAULT/BOUND NHP-R4-* **do not** auto-promote. NHP-R4-ADV-01 covered stays THIS case only.

---

## 2. Acceptance（A1–A6）

| ID | Criterion | Now |
|----|-----------|-----|
| **A1** | Harness names production-surface remaining ≠ LIVE_PG honesty ≠ NHP covered | **met（docs）** |
| **A2** | Hard pins: ≠ R4 closed · LIVE_PG dual ≠ prod closed · NHP covered dual ≠ this knife · `releaseEvidence=false` · ≠ HA | **met（docs+prove+dual）** |
| **A3** | Prove CMD frozen · executed · post-prove dual PASS | **`post_prove_dual_pass`** |
| **A4** | Coding gate: MAIN + NHP-ADV + F1 pre-exec dual + authorize | **satisfied** |
| **A5** | Dual REQUEST pair · no self-approve · post-prove dual PASS | **post-prove dual PASS** |
| **A6** | F1 may precede F2 · neither claims R4 closed | **met** · F1 closed this knife · F2 still open |

### CMD

| CMD | Role | Status |
|-----|------|--------|
| **`pnpm r4-wrong-track-prod-surface:prove`** | Production-surface remaining prove（isolated PG） | **EXIT=0**（expert re-run · true isolated PG） |
| **`pnpm r4-wrong-track-prod-surface:prove:raw`** | no-PG fail-closed | **EXIT=1**（expert re-run · skip≠pass） |
| Prior `pnpm r4-wrong-track-adv-live-pg:prove` | LIVE_PG honesty 旁证（spawned） | **≠ this knife alone** · **LIVE_PG ≠ prod closed** |
| Prior `pnpm nhp-r4-adv-covered:prove` | Covered path（≠ this knife） | **NHP covered ≠ F1 alone** |

---

## 3. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-16-r4-f1-wrong-track-prod-surface-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-16-r4-f1-wrong-track-prod-surface-mw-rag-route.md` | **pass** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-e2e-ha.md` | **pass** · prove=0 · raw=1 |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md` | **pass** · prove=0 · raw=1 |

---

## 4. Hard pins

- **≠ R4 closed** · **≠ 题域已隔离**  
- **LIVE_PG dual ≠ prod closed**  
- **NHP covered dual ≠ this knife** · **NHP covered ≠ F1 alone**  
- **EXIT=0 ≠ production wrong_track=0 fully closed ≠ HA ≠ suite green**  
- **≠ HA** · `releaseEvidence=false` · no self-approve  
- sole allowlist **恰 5 未翻** · no flip default · no open DELETE  
- P-R1 / P-R2 / P-META / P-FIX **仍开** · F2 still **`not_run:pre_dual`**

---

## 5. Code anchors

| Path | Role |
|------|------|
| `apps/worker/src/qbank-track-local-retrieve.ts` | `classifyTrackLocalOutcome` · `observeTrackLocalRetrieval` · retrieveVia observes |
| `apps/worker/src/interview-consumer.ts` | production `track_local_required` fail-closed |
| `apps/worker/src/production-config.ts` | `productionRequiresTrackLocal` |
| `packages/ai-runtime/src/metrics.ts` | track_local baseline outcomes |
| `apps/worker/test/r4-wrong-track-prod-surface.proof.ts` | **this knife prove** |

---

*Harness · F1 wrong_track prod-surface · 2026-09-16 ~23:27 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ prod fully closed · sole 恰 5*
