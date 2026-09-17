# Eval — NHP-R4-ADV-01 **covered path**（**`post_prove_dual_pass`**）

**Date**: 2026-09-16 (~19:57 PT)  
**run-status**: **`post_prove_dual_pass`**  
**releaseEvidence=false** · **Not HA** · **matrix NHP-R4-ADV-01 = covered（THIS case only）** · **covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0** · **LIVE_PG dual = separate honesty**  
**Harness**: `ai-docs/delivery/harness/nhp-r4-adv-covered-path.md`  
**Slice**: `ai-docs/delivery/nhp-r4-adv-covered-path.slice.md`  
**Parent**: `harness/r4-domain-isolation-status.md` §12  
**Matrix**: `non-happy-path-perf-load-case-matrix.md` · NHP-R4-ADV-01（**covered** · THIS case only）  
**Dual**: pre-exec **PASS** · prove EXIT=0 · raw EXIT=1 · **post-prove dual PASS**（e2e-ha + rag-route · prove=0 · raw=1）· meetwise authorize elevate · implementer did not self-approve

---

## 1. Purpose

Expert checklist closed for the **covered-path** knife after coding+prove+**post-prove dual**.  
**Ban**: treating this covered elevation as **R4 closed** / **题域已隔离** / **production wrong_track=0** / HA / suite green.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Pre-exec dual（e2e-ha + rag-route） | pass | **pass** | docs gate only；≠ coding alone |
| meetwise authorize coding+prove | yes | **yes** | separate authorize |
| `pnpm nhp-r4-adv-covered:prove` | 0（真 PG） | **EXIT=0** | C1–C4 composition；≠ R4 closed |
| `pnpm nhp-r4-adv-covered:prove:raw`（no-PG） | EXIT≠0 | **EXIT=1** | skip≠pass |
| Spawn `pnpm r4-wrong-track-adv:prove` | 0 旁证 | **0** | honesty ≠ R4 close |
| Spawn `pnpm r4-wrong-track-adv-live-pg:prove` | 0 旁证 | **0** | LIVE_PG = separate honesty |
| Post-prove · mw-e2e-ha | pass · prove=0 · raw=1 | **pass** | `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md` |
| Post-prove · mw-rag-route | pass · prove=0 · raw=1 | **pass** | `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md` |
| meetwise authorize elevate NHP-R4-ADV-01 → covered | yes（THIS case only） | **yes** | companions not elevated |
| Implementer self-sign pass | **ban** | **not done** | experts wrote post-prove reviews/ |

Receipt（isolated · implementer）: `.tmp/isolated-proof-receipts/2026-09-17T02-52-05-665Z-1076540-15e17976-93ba-40ce-81bf-4ca628cf83db.json` · `release_evidence=false`  
Expert re-runs recorded in post-prove reviews（~19:54 PT）.

---

## 3. Eval cases ↔ harness（close R4? always no）

| ID | Eval point | Close R4? | Elevate covered? |
|----|------------|-----------|------------------|
| E1 | C1 cross-domain wrong_track=0 on live wired path（via LIVE_PG spawn） | 否 | **yes（dual+authorize · THIS case）** |
| E2 | C2 A3 adversary surfaces（LIVE_PG L3 + unit A3） | 否 | **yes（same）** |
| E3 | C3 G-R2-5 / ban P-FAKEPLAN / ban unscoped | 否 | **yes（same）** |
| E4 | C4 matrix pin: **NHP-R4-ADV-01 covered** after dual | 否 | **yes（THIS case only）** |
| E5 | LIVE_PG `post_prove_dual_pass` = separate honesty（explicit） | 否 | n/a（not a matrix row elevate） |
| E6 | ≠ wrong_track=0 production closed · ≠ HA · `releaseEvidence=false` | 否 | n/a |
| E7 | CMD `pnpm nhp-r4-adv-covered:prove` EXIT=0 · raw=1 recorded | 否 | prerequisite |
| E8 | Post-prove dual both pass · no self-approve | 否 | gate met |

---

## 4. Fake-green checklist（review · closed）

- [x] Did not treat ADV honesty dual alone as covered  
- [x] Did not treat LIVE_PG prove/dual alone as covered path done  
- [x] Elevated **only** NHP-R4-ADV-01 → covered（companions unchanged）  
- [x] Did not claim R4 closed / 题域已隔离 / production wrong_track=0 closed  
- [x] Did not treat EXIT=0 alone as HA / suite green  
- [x] Did not self-approve pass  
- [x] `releaseEvidence=false` · Not HA retained · sole allowlist 恰 5 未翻  
- [x] Did not touch sole∩scor-00  

---

## 5. Expert confirm（post-prove summary · closed）

1. Agree C1–C4 composition prove is honest（LIVE_PG+unit+C4 pins）? **yes（dual）**  
2. Agree LIVE_PG ADV `post_prove_dual_pass` = separate honesty? **yes**  
3. Agree NHP-R4-ADV-01 may elevate **partial→covered** after **post-prove dual** + meetwise authorize（THIS case only）? **yes**  
4. Agree covered ≠ R4 closed · ≠ wrong_track=0 production closed · ≠ 题域已隔离 · ≠ HA? **yes**  
5. Agree EXIT=0 ≠ HA alone · no self-approve · `releaseEvidence=false` · sole 恰 5? **yes**

---

*Eval · NHP-R4-ADV covered path · 2026-09-16 (~19:57 PT) · post_prove_dual_pass · NHP-R4-ADV-01 covered（THIS case only）· releaseEvidence=false · ≠HA · ≠ R4 closed · R4 open*
