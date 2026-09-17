# Harness — G7-A · Key-blocked×3 family honesty（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）

> **Cross-link（2026-09-16 ~23:33 PT）**：Live hard-run path **superseded/unblocked** by **G7-A′ live Key×3** — `harness/g7-key-live-x3.md` · slice `g7-key-live-x3.slice.md` · status **`post_prove_dual_pass:honesty_red`** · EXIT table **1/1/1**（execute shell `MODEL_API_KEY=unset` · fail-closed · **no invent Key**）· post-prove dual **BOTH PASS**（honesty of red）`reviews/2026-09-16-g7-key-live-x3-post-prove-mw-{e2e-ha,rag-route}.md`.  
> **This file (A) remains the Key-unset era honesty pin**（`post_change_dual_pass` · blocked while unset · no invent Key）. A′ does **not** rewrite A as green · **A unset honesty retained**. Hard pins retained：≠ suite green ≠ covered ≠ SLO/LOAD ≠ HA ≠ R2/R4/G6 closed · Key unset = blocker for live green · `releaseEvidence=false` · no invent Key · no re-run.


**Status**: **`post_change_dual_pass`**（honesty only）  
**Date**: 2026-09-16 ~19:53 PT · pre-exec dual **pass** · docs pin landed · post-change dual **pass** both domains · **no live e2e** · **no invent Key**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4 closed** · **≠ 题域已隔离** · **sole ≠ retired** · **G6 OPEN** · **Key-blocked live still blocked**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`  
**Parent**: G7 post-suite dual **pass** → honesty knives · **≠ verification success**  
**Slice**: `../g7-honesty-knives.slice.md`  
**Complement**: K3（backlog cite）· `harness/g6-e2e-iso-blocked.md`  
**No self-approve** · **dual before any docs pin change** · **no invent Key** · **no hard-run live without Key**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| Problem | G7 recorded **3× blocked**（`MODEL_API_KEY` unset）for live/perf family — must stay **honest blocked**；forbidden to narrate as green / skip-as-pass |
| Goal | Doc-gate + REQUEST that **pins** Key-unset → continue honest **blocked**；forbid fake green；forbid hard-run live without Key；**REQUEST→dual before any docs pin change** |
| Not | Provision Key · hard-run `e2e:isolated` / UI / perf · claim family covered / G6 closed / suite green |
| After dual | Docs pin edits only under authorize；live hard-run needs **Key + separate authorize** |

---

## 1. Inventory（G7 receipt）

| CMD | G7 status | Honest read |
|-----|-----------|-------------|
| `pnpm e2e:isolated` | **blocked** | Key unset · ≠ family green · if run would still be pgvector→R5 risk |
| `pnpm e2e:ui:isolated` | **blocked** | Key unset · ≠ UI covered |
| `pnpm verify:e2e-performance` | **blocked** | Key unset · ≠ SLO · ≠ LOAD · ≠ HA |

---

## 2. Acceptance（docs-gate · pre-dual）

| ID | Criterion | False green if… |
|----|-----------|------------------|
| **B1** | All three remain **blocked** while Key unset | Narrate blocked = pass / suite green |
| **B2** | Ban invent Key / read `.env*` / hard-run live without Key | Soft-skip live as EXIT=0 |
| **B3** | Docs pin change only after **dual** | Implementer self-edits whitelist to drop blocked |
| **B4** | G6 / BUG-E2E-ISO **still OPEN**（cite knife K3 separate） | This gate closes G6 |
| **B5** | CMD `not_run:pre_dual`（no prove / no live this prep） | Run isolated/perf now |

---

## 3. CMD（frozen）

| CMD | Expected | Run now | Honest read |
|-----|----------|---------|-------------|
| `pnpm e2e:isolated` | **blocked**（no Key） | **`not_run:no_key`（honest blocked）** | ≠ family green · **DO NOT hard-run** |
| `pnpm e2e:ui:isolated` | **blocked** | **`not_run:no_key`（honest blocked）** | ≠ UI covered · **DO NOT hard-run** |
| `pnpm verify:e2e-performance` | **blocked** | **`not_run:no_key`（honest blocked）** | ≠ SLO/LOAD/HA · **DO NOT hard-run** |
| `pnpm g6-e2e-iso-blocked:prove` | 0 after K3 cite | owned by K3 | cite ≠ G6 closed |

---

## 4. NHP columns

| Col | Note |
|-----|------|
| NEG | blocked → claim green |
| FAULT | invent Key / strip blocked pin without dual |
| BOUND | Key-unset boundary |
| ADV | Self-approve |
| PERF/LOAD | **blocked/blind** until Key+authorize |

---

## 5. Dual targets

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-key-blocked-x3-mw-e2e-ha.md` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-key-blocked-x3-mw-rag-route.md` |

---

## Hard pins

- EXIT=0 later ≠ covered ≠ suite green ≠ HA  
- no Key → blocked · `releaseEvidence=false` · no self-approve · dual before docs pin change  

*Harness · G7-A Key-blocked×3 · 2026-09-16 ~19:38 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*

---

## 6. Docs pin landed（2026-09-16 ~19:48 PT · meetwise authorize）

| Pin | Ruling |
|-----|--------|
| `pnpm e2e:isolated` | **blocked** while `MODEL_API_KEY` unset · ≠ family green · ≠ covered · no invent Key · **no hard-run** |
| `pnpm e2e:ui:isolated` | **blocked** · ≠ UI covered · **no hard-run** |
| `pnpm verify:e2e-performance` | **blocked** · ≠ SLO · ≠ LOAD · ≠ HA · **no hard-run** |
| G6 / BUG-E2E-ISO | **still OPEN**（K3 cite separate；cite ≠ G6 closed ≠ R5 retired） |
| Defaults / allowlist | **NOT flipped**（this knife） |
| Live | Needs **real Key + separate authorize**；even then fixture default pgvector → **R5 green-risk ≠ sole cutover** |
| Dual | pre-exec `reviews/2026-09-16-g7-key-blocked-x3-mw-{e2e-ha,rag-route}.md` **pass** · post-change dual **pass** · **no self-approve** |

### Post-change dual（both domains **pass** · honesty only）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/2026-09-16-g7-key-blocked-x3-post-change-mw-e2e-ha.md` | **pass** · Key-unset blocked honesty |
| `mw-rag-route` | `reviews/2026-09-16-g7-key-blocked-x3-post-change-mw-rag-route.md` | **pass** · Key-unset blocked honesty |

**Status writeback**: **`post_change_dual_pass`** · Key unset → 3× still **blocked** · **≠** family/suite green · **≠** HA · **G6 OPEN** · live hard-run still **blocked** until Key+authorize

**Hard pins retained**: ≠ R2/R4 closed ≠ suite green ≠ HA ≠ 题域已隔离 · sole ≠ retired · G6 OPEN · `releaseEvidence=false` · Key-blocked live still blocked · no invent Key · no hard-run

*Harness · G7-A Key-blocked×3 · 2026-09-16 ~19:53 PT · post_change_dual_pass · releaseEvidence=false · ≠HA · ≠ family green · G6 OPEN*
