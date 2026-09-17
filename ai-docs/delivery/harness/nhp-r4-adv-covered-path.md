# Harness — NHP-R4-ADV-01 **covered path**（beyond honesty/partial · PARALLEL · **`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**  
**Date**: 2026-09-16 (~19:57 PT)  
**releaseEvidence=false** · **≠HA** · **matrix NHP-R4-ADV-01 = covered（THIS case only）** · **covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0** · **LIVE_PG ADV `post_prove_dual_pass` = separate honesty** · **≠ flip default** · **≠ open DELETE** · **sole allowlist 恰 5 未翻**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec dual **PASS**；**post-prove dual PASS** · prove=0 · raw=1）  
**Parent**: `harness/r4-domain-isolation.md` · `r4-domain-isolation-status.md` §12  
**Slice**: `../nhp-r4-adv-covered-path.slice.md`  
**Eval**: `../eval/nhp-r4-adv-covered-path.eval.md`  
**Authority**: pre-exec dual PASS + meetwise authorize coding+prove + prove EXIT=0 + post-prove dual PASS + meetwise authorize elevate NHP-R4-ADV-01 → covered · **no self-approve**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Implement + prove covered path for NHP-R4-ADV-01 beyond honesty/partial: eval C1–C4 → matrix pin → frozen `pnpm nhp-r4-adv-covered:prove` → **post-prove dual** → matrix **partial→covered（THIS case only）** |
| **What this knife is not** | Not R4 close · not production wrong_track=0 closed · not HA · not suite green · not elevating NEG/FAULT/BOUND companions |
| **Prior ADV honesty** | `r4-wrong-track-adv` = `post_prove_dual_pass`（**ADV honesty only**） |
| **Prior LIVE_PG** | `r4-wrong-track-adv-live-pg` = `post_prove_dual_pass`（honesty only）· **separate honesty** · **≠** this covered elevation alone |
| **LIVE_PG dual** | **LIVE_PG ADV `post_prove_dual_pass` ≠ this covered path done** 仍为独立 honesty 层（硬钉保留；本刀已另以 dual 关闸） |
| **When covered?** | **Now**：pre-exec dual + authorize + prove + **post-prove dual PASS** → matrix **NHP-R4-ADV-01 covered**（meetwise 显式授权 · THIS case only） |
| **Now** | status **`post_prove_dual_pass`** · matrix **NHP-R4-ADV-01 = covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ production wrong_track=0** · **≠HA** · `releaseEvidence=false` |
| **R4?** | **Still NOT closed.** Ban claiming R4 closed. |

---

## 1. Why covered ≠ honesty / LIVE_PG / R4 close

| Layer | What it proves | Why ≠ R4 / production close |
|-------|----------------|------------------------------|
| ADV unit+map honesty | Wired assert + unit/map surfaces | Honesty pin only |
| LIVE_PG full-path | Live Worker+PG via `retrieveViaDispatchTrackLocal` | LIVE_PG_GAP dual receipts landed（honesty）· **separate honesty** |
| **This covered path** | Explicit C1–C4 + matrix registration + frozen covered prove CMD + **post-prove dual** | Elevates NHP-R4-ADV-01 **partial → covered**（THIS case only）· **covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0** |

---

## 2. Covered-path definition（implemented · dual-closed）

### 2.1 Eval cases

| Case ID | Surface | Expectation（structure） | Covered iff… |
|---------|---------|-------------------------|--------------|
| **NHP-R4-ADV-01-C1** | Cross-domain wrong_track inject on live wired retrieve | wrong_track observable count = 0 · fail-closed | Prove green + **post-prove dual** + matrix pin → **met** |
| **NHP-R4-ADV-01-C2** | Cache poison / concurrent track flip / metadata forge-or-miss / unknown class / stale checkpoint | degraded denial · no unscoped / sibling / legacy_unrouted | **met** |
| **NHP-R4-ADV-01-C3** | G-R2-5 retained · P-FAKEPLAN banned | fail-closed retrieve when snapshot missing/illegal | **met** |
| **NHP-R4-ADV-01-C4** | Matrix + harness honesty | Row **covered** · still ≠ R4 closed · ≠ production wrong_track=0 closed · `releaseEvidence=false` · ≠HA · sole 恰 5 | Dual receipts + meetwise elevate |

### 2.2 E2E matrix pin

| Matrix | Action |
|--------|--------|
| `non-happy-path-perf-load-case-matrix.md` · **NHP-R4-ADV-01** | **elevated partial→covered**（THIS case only · post-prove dual + meetwise authorize） |
| Companion NEG/FAULT/BOUND NHP-R4-* | **Do not** auto-promote covered because of this knife · **unchanged** |

### 2.3 Prove CMD（executed · dual-reviewed）

| CMD | Role | EXIT | Honest read |
|-----|------|------|-------------|
| **`pnpm nhp-r4-adv-covered:prove`** | Covered-path prove（C1–C4 composition） | **0** | EXIT=0 ≠ R4 closed ≠ production wrong_track=0 closed ≠ HA；**matrix covered only after dual**（now dual-pass） |
| **`pnpm nhp-r4-adv-covered:prove:raw`**（no-PG） | fail-closed | **1** | skip≠pass |
| `pnpm r4-wrong-track-adv-live-pg:prove` | LIVE_PG 旁证（spawned inside covered） | 0 | LIVE_PG dual = **separate honesty** |
| `pnpm r4-wrong-track-adv:prove` | ADV honesty 旁证（spawned） | 0 | honesty ≠ R4 close |

**Implementation**: `apps/worker/test/nhp-r4-adv-covered.proof.ts` — orchestrates unit ADV + LIVE_PG + C4 honesty pins. Wired via root/worker package scripts + `run-e2e-isolated`（**not** on SOLE allowlist；allowlist **恰 5**）.

---

## 3. Acceptance

| ID | Criterion | False green if… |
|----|-----------|-----------------|
| **C-R1** | Covered path = eval→matrix→CMD（implemented） | Claim R4 closed / suite green |
| **C-R2** | LIVE_PG `post_prove_dual_pass` = separate honesty | Treat LIVE_PG dual as sole covered close |
| **C-R3** | Matrix **NHP-R4-ADV-01 covered** only after post-prove dual + authorize | Elevate other rows / claim production closed |
| **C-R4** | covered ≠ R4 closed · ≠ wrong_track=0 production closed · ≠ 题域已隔离 · ≠ HA | Narrative R4/production close |
| **C-R5** | Prove EXIT=0 · raw EXIT=1 · dual PASS recorded | Invent dual / self-approve |
| **C-R6** | Post-prove dual reviews both **pass** · no self-approve | Implementer writes pass |

---

## 4. NHP columns

| Col | Note |
|-----|------|
| NEG | Companions **unchanged**（not elevated） |
| FAULT | Companions **unchanged** |
| BOUND | Companions **unchanged** |
| ADV | **NHP-R4-ADV-01 = covered**（THIS case only）· ban self-approve · ≠ R4 close |
| PERF/LOAD | **blind** |

---

## 5. Dual targets

| Stage | Expert | Path |
|-------|--------|------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md` · **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md` · **pass** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md` · **pass** · prove=0 · raw=1 |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md` · **pass** · prove=0 · raw=1 |

---

## 6. Hard pins

- LIVE_PG ADV `post_prove_dual_pass` = **separate honesty**（≠ R4 / production close）  
- **covered ≠ R4 closed ≠ 题域已隔离 ≠ production wrong_track=0**  
- EXIT=0 ≠ HA · `releaseEvidence=false` · no self-approve  
- sole allowlist **恰 5 未翻** · no invent MODEL_API_KEY  
- NEG/FAULT/BOUND companions **unchanged**  
- R4 **still open** · **MAIN sole∩scor-00 `post_prove_dual_pass`（done）** · **F1 = `post_prove_dual_pass`**（≠ R4 closed ≠ prod fully closed · NHP covered ≠ F1 alone · sole 恰 5）· **F2 = `not_run:pre_dual`**  
- **≠ suite green** · **≠HA**

---

*Harness · NHP-R4-ADV covered path · 2026-09-16 (~19:57 PT) · post_prove_dual_pass · NHP-R4-ADV-01 covered（THIS case only）· releaseEvidence=false · ≠HA · ≠ R4 closed · R4 open*
