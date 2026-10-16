# Eval — Knife **F1** · wrong_track **production-surface remaining**（**`post_prove_dual_pass`**）

**Date**: 2026-09-16 (~23:27 PT)  
**run-status**: **`post_prove_dual_pass`**  
**releaseEvidence=false** · **Not HA** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production fully closed** · **LIVE_PG dual ≠ prod closed** · **NHP covered dual ≠ this knife** · **NHP covered ≠ F1 alone** · **≠ suite green** · **sole 恰 5**  
**Harness**: `ai-docs/delivery/harness/r4-f1-wrong-track-prod-surface.md`  
**Slice**: `ai-docs/delivery/r4-f1-wrong-track-prod-surface.slice.md`  
**Parent**: `harness/r4-domain-isolation-status.md` §13  
**Dual**: pre-exec **PASS** · prove executed · **post-prove dual PASS**（e2e-ha + rag-route · expert re-run prove EXIT=0 · raw EXIT=1）· no self-approve

---

## 1. Purpose

Expert checklist **closed** for **production-surface remaining** after coding+prove+**post-prove dual**.  
**Ban**: treating F1 EXIT=0 / dual as **R4 closed** / **题域已隔离** / **production wrong_track=0 fully closed** / HA / suite green / LIVE_PG=prod closed / NHP covered=this knife / NHP covered=F1 alone.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Pre-exec dual（e2e-ha + rag-route） | pass | **pass** | docs gate |
| meetwise authorize coding+prove | yes | **yes** | MAIN+NHP-ADV+F1 pre-exec satisfied |
| `pnpm r4-wrong-track-prod-surface:prove` | 0（真 PG） | **EXIT=0**（expert re-run · true isolated PG） | PS1–PS3；≠ R4 closed；≠ prod fully closed |
| `pnpm r4-wrong-track-prod-surface:prove:raw`（no-PG） | EXIT≠0 | **EXIT=1**（expert re-run） | skip≠pass |
| Spawn `pnpm r4-wrong-track-adv:prove` | 0 旁证 | **via prove** | ≠ F1 alone |
| Spawn `pnpm r4-wrong-track-adv-live-pg:prove` | 0 旁证 | **via prove** | LIVE_PG = separate honesty · ≠ prod closed |
| Post-prove · mw-e2e-ha | pass · prove=0 · raw=1 | **pass** | `reviews/2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-e2e-ha.md` |
| Post-prove · mw-rag-route | pass · prove=0 · raw=1 | **pass** | `reviews/2026-09-16-r4-f1-wrong-track-prod-surface-post-prove-mw-rag-route.md` |
| Implementer self-sign pass | **ban** | **not done** | experts wrote post-prove reviews/ |

Receipt（isolated · expert re-run cited）: `.tmp/isolated-proof-receipts/2026-09-17T06-25-23-042Z-1245556-ebd90ae4-719c-48e1-811b-8341ec85abbf.json` · `release_evidence=false` · HEAD `639134f`

---

## 3. Eval cases ↔ harness

| ID | Eval point | Close R4? | Close prod fully? |
|----|------------|-----------|-------------------|
| E1 | PS1 prod call-path: main `trackLocal` + consumer prefers retrieveVia | 否 | 否（remaining honesty） |
| E2 | PS1 deploy-surface: production missing trackLocal → `track_local_required` | 否 | 否 |
| E3 | PS2 observability: `mode=track_local` outcomes on wrong_track/recheck/cache-replay | 否 | 否 |
| E4 | PS2 cache-replay map fail-closed + classifiable | 否 | 否 |
| E5 | PS3 LIVE_PG dual ≠ prod closed · NHP covered ≠ this knife | 否 | n/a |
| E6 | ≠ R4 closed · ≠ HA · `releaseEvidence=false` · P-R1/P-R2/P-META/P-FIX still open | 否 | n/a |
| E7 | CMD prove EXIT=0 · raw EXIT≠0 recorded（expert re-run） | 否 | prerequisite |
| E8 | Post-prove dual both pass · no self-approve | 否 | gate（**met**） |

---

## 4. Fake-green checklist（review · retained）

- [x] Did not treat LIVE_PG dual as prod closed  
- [x] Did not treat NHP covered dual as F1 done / prod fully closed · NHP covered ≠ F1 alone  
- [x] Did not claim R4 closed / 题域已隔离  
- [x] Did not treat EXIT=0 alone as HA / suite green  
- [x] Did not self-approve pass  
- [x] `releaseEvidence=false` · Not HA retained · sole allowlist 恰 5 未翻  
- [x] raw no-PG EXIT≠0（skip≠pass）

---

## 5. Expert confirm（post-prove · **PASS**）

1. Agree PS1–PS3 prove is honest（deploy fail-closed + track_local obs + LIVE_PG 旁证）? → **yes（both domains）**  
2. Agree LIVE_PG ADV `post_prove_dual_pass` ≠ prod closed? → **yes**  
3. Agree NHP covered dual ≠ this knife / ≠ production wrong_track=0 fully closed / ≠ F1 alone? → **yes**  
4. Agree EXIT=0 ≠ R4 closed · ≠ 题域已隔离 · ≠ HA · ≠ suite green? → **yes**  
5. Agree `releaseEvidence=false` · no self-approve · sole 恰 5? → **yes**

---

*Eval · F1 wrong_track prod-surface · 2026-09-16 (~23:27 PT) · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ R4 closed · ≠ prod fully closed · sole 恰 5*
