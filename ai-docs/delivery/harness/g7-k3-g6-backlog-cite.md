# Harness — G7-K3 · `g6-e2e-iso-blocked` **backlog cite honesty**

**Status**: **`post_prove_dual_pass`**（honesty only）  
**Date**: 2026-09-16 ~19:53 PT · pre-exec dual **pass** · prove EXIT=0 · post-prove dual **pass** both domains  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **G6 still OPEN** · **≠ family green** · **≠ suite green** · **≠ R2/R4 closed** · **≠ 题域已隔离** · **sole ≠ retired** · **Key-blocked live still blocked**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`  
**Parent**: G7 post-suite dual **pass** → honesty knives · **≠ verification success**  
**Slice**: `../g7-honesty-knives.slice.md`  
**No self-approve** · **dual before any code/prove** · **docs/status pins first**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| Problem | G7: `pnpm g6-e2e-iso-blocked:prove` **EXIT=1** — `gap-bug-backlog.md` must **cite `g6-e2e-iso-blocked`**；Key-unset behavior **PASS** |
| Goal | Align **backlog cite / blocked honesty**；**G6 still OPEN** · **≠ covered** · **no Key → still blocked** |
| Not | Invent Key · hard-run live family · close BUG-E2E-ISO / G6 · suite green |
| After dual | Separate authorize before backlog cite edit / prove re-run |

---

## 1. Contra

| Path | Role |
|------|------|
| `receipts/2026-09-16-g7-full-suite-run.md` §3 | EXIT=1 row |
| `gap-bug-backlog.md` · BUG-E2E-ISO | Must cite `g6-e2e-iso-blocked`（currently missing cite → FAIL） |
| `harness/g6-e2e-iso-blocked.md` | Parent G6 blocked honesty |
| `scripts/g6-e2e-iso-blocked.proof.mjs` | `gap-bug-backlog: must cite g6-e2e-iso-blocked honesty pin` |
| Knife **A** | Key-blocked×3 family（complementary；not this cite） |

---

## 2. Acceptance（docs-first）

| ID | Criterion | False green if… |
|----|-----------|-----------------|
| **C1** | Backlog BUG-E2E-ISO（or linked row）**cites** `g6-e2e-iso-blocked` honesty pin | Cite → claim G6 closed |
| **C2** | **G6 still OPEN** · no Key → family **blocked** remain pinned | Cite → family green |
| **C3** | Fix = backlog cite align；no invent Key | Hard-run live without Key |
| **C4** | CMD `not_run:pre_dual` | Prove this prep |
| **C5** | ≠ covered | Dual pass → covered uplift |

---

## 3. CMD（frozen）

| CMD | Expected later | Run now | Honest read |
|-----|----------------|---------|-------------|
| `pnpm g6-e2e-iso-blocked:prove` | 0（after authorize+cite） | **0**（2026-09-16 ~19:50 PT） | cite landed · ≠ family green · G6 still OPEN |
| `pnpm e2e:isolated` | blocked（no Key） | **`not_run:pre_dual`** | See knife A |
| `pnpm e2e:ui:isolated` | blocked | **`not_run:pre_dual`** | See knife A |
| `pnpm verify:e2e-performance` | blocked | **`not_run:pre_dual`** | See knife A |

---

## 4. NHP columns

| Col | Note |
|-----|------|
| NEG | Cite → claim G6 / BUG-E2E-ISO closed |
| FAULT | Drop cite to silence prove |
| BOUND | Key-unset blocked ≠ live covered |
| ADV | Self-approve |
| PERF/LOAD | **blind** / Key-blocked |

---

## 5. Dual targets

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-k3-g6-backlog-cite-mw-e2e-ha.md` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-k3-g6-backlog-cite-mw-rag-route.md` |

---

## Hard pins

- EXIT=0 later ≠ covered ≠ G6 closed ≠ suite green ≠ HA  
- no Key → still blocked · `releaseEvidence=false` · no self-approve · dual before any code/prove  

*Harness · G7-K3 · 2026-09-16 ~19:38 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*

---

## 6. Executed（2026-09-16 ~19:50 PT）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm g6-e2e-iso-blocked:prove` | **0** | backlog cites `g6-e2e-iso-blocked` · **G6 still OPEN** · cite ≠ G6 closed ≠ R5 retired ≠ family green |
| Docs | landed | `gap-bug-backlog.md` BUG-E2E-ISO cite |
| Live family | **not_run** | Key unset · see knife A · **no invent Key** |

**Hard pins retained**: EXIT=0 ≠ covered ≠ G6 closed ≠ suite green ≠ HA · ≠ R2/R4 closed ≠ 题域已隔离 · sole ≠ retired · no Key → still blocked · `releaseEvidence=false` · no self-approve

### Post-prove dual（both domains **pass** · honesty only）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/2026-09-16-g7-k3-g6-backlog-cite-post-prove-mw-e2e-ha.md` | **pass** · EXIT=0 independent |
| `mw-rag-route` | `reviews/2026-09-16-g7-k3-g6-backlog-cite-post-prove-mw-rag-route.md` | **pass** · EXIT=0 independent |

**Status writeback**: **`post_prove_dual_pass`** · dual-closed honesty · **G6 still OPEN** · cite ≠ G6 closed ≠ R5 retired ≠ family green · **≠** suite green · **≠** HA

*Harness · G7-K3 · 2026-09-16 ~19:53 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · G6 still OPEN*
