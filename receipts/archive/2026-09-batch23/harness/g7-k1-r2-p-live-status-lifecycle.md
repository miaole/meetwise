# Harness — G7-K1 · `r2-p-live-route-effective` **status lifecycle honesty**

**Status**: **`post_prove_dual_pass`**（honesty only）  
**Date**: 2026-09-16 ~19:53 PT · pre-exec dual **pass** · prove EXIT=0 · post-prove dual **pass** both domains  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2 closed** · **≠ verbal route-effective** · **≠ suite green** · **≠ 0 BUG** · **≠ R4 closed** · **≠ 题域已隔离** · **sole ≠ retired** · **G6 OPEN**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**model-op not required** unless later live MODEL authorize）  
**Parent**: G7 post-suite dual **pass**（收据诚实性 only）→ honesty knives opened · **≠ verification success**  
**Slice**: `../g7-honesty-knives.slice.md`  
**No self-approve** · **dual before any code/prove** · **docs/status pins first**

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| Problem | G7 suite: `pnpm r2-p-live-route-effective:prove` **EXIT=1** due to **status/lifecycle pin**（prove expects `P-LIVE CLOSED pending dual-review` + R2 NOT closed + ≠ verbal 生效）；structural Key-unset checks **PASS** |
| Goal | Define **honest status lifecycle pin fix path**（docs/SSOT align）；still **≠ R2 closed** · **≠ verbal route-effective** |
| Not | Coding to flip prove green · invent live Key · claim 路由已生效 · close R2 · suite green |
| After dual | Still need **separate authorize** before prove re-run / SSOT edit that changes EXIT |

---

## 1. Contra

| Path | Role |
|------|------|
| `receipts/2026-09-16-g7-full-suite-run.md` §3 | EXIT=1 honesty row |
| `harness/r2-classify-job-route-status.md` | Current lifecycle language（dual receipts pass / await authorize） |
| `harness/r2-classify-job-route.md` · `r2-p-harness-agree.md` | Parent R2 / P-HARNESS |
| `apps/worker/test/r2-p-live-route-effective.proof.ts` | Pin: status must match `CLOSED pending dual-review` / `P-LIVE CLOSED` |
| P-LIVE dual | `reviews/2026-09-16-r2-p-live-route-effective-mw-{model-op,rag-route}.md` **pass** |
| P-HARNESS | `pre_exec_dual_pass` / `await_authorize` |

---

## 2. Acceptance（docs-first · pre-dual）

| ID | Criterion | False green if… |
|----|-----------|-----------------|
| **L1** | Name honest lifecycle stages: pending dual → dual receipts pass → harness agree → await authorize → (later) SSOT sync | Collapse to「路由已生效」 |
| **L2** | Prove pin vs status drift **recorded as honesty gap**（EXIT=1 retained until dual+authorize fix） | Skip-as-pass / narrate prior P-LIVE dual as suite green |
| **L3** | Fix path = **docs/status pin alignment first**；code/prove change only after dual | Flip green by silent prove edit without dual |
| **L4** | **R2 NOT closed** · **≠ verbal route-effective** pinned in all artefacts | Dual pass → claim R2 closed / 生效 |
| **L5** | model-op **not** required this knife | Force live MODEL / invent Key |
| **L6** | CMD table frozen `not_run:pre_dual` | Run prove this prep |

---

## 3. CMD（frozen）

| CMD | Expected later | Run now | Honest read |
|-----|----------------|---------|-------------|
| `pnpm r2-p-live-route-effective:prove` | 0（after authorize+fix） | **0**（2026-09-16 ~19:50 PT） | lifecycle pin aligned · ≠ route effective · ≠ R2 closed |
| `pnpm r2-classify-job-route-prereq:prove` | 0 | **`not_run:pre_dual`** | ≠ R2 closed |
| Doc/status sync | n/a | **no edit until dual+authorize** | docs-first |

---

## 4. NHP columns

| Col | Note |
|-----|------|
| NEG | Claim verbal 生效 / R2 closed from lifecycle wording alone |
| FAULT | Edit prove/status to EXIT=0 without dual |
| BOUND | Structural Key-unset receipt ≠ verbal effective |
| ADV | Self-approve dual |
| PERF/LOAD | **blind** |

---

## 5. Dual targets

| Expert | REQUEST |
|--------|---------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-k1-r2-p-live-status-lifecycle-mw-e2e-ha.md` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-k1-r2-p-live-status-lifecycle-mw-rag-route.md` |

---

## Hard pins

- EXIT=0 later ≠ covered ≠ R2 closed ≠ suite green ≠ HA  
- `releaseEvidence=false` · no self-approve · dual before any code/prove  

*Harness · G7-K1 · 2026-09-16 ~19:38 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*

---

## 6. Executed（2026-09-16 ~19:50 PT）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm r2-p-live-route-effective:prove` | **0** | lifecycle pin aligned（P-LIVE CLOSED pending dual-review → dual receipts → await authorize）· **≠** verbal route-effective · **R2 NOT closed** |
| Docs | landed | `harness/r2-classify-job-route-status.md` G7-K1 lifecycle pin |

**Hard pins retained**: EXIT=0 ≠ covered ≠ R2 closed ≠ suite green ≠ HA · ≠ R4 closed ≠ 题域已隔离 · sole ≠ retired · G6 OPEN · `releaseEvidence=false` · no self-approve

### Post-prove dual（both domains **pass** · honesty only）

| Expert | Receipt | Verdict |
|--------|---------|---------|
| `mw-e2e-ha` | `reviews/2026-09-16-g7-k1-r2-p-live-status-lifecycle-post-prove-mw-e2e-ha.md` | **pass** · EXIT=0 independent |
| `mw-rag-route` | `reviews/2026-09-16-g7-k1-r2-p-live-status-lifecycle-post-prove-mw-rag-route.md` | **pass** · EXIT=0 independent |

**Status writeback**: **`post_prove_dual_pass`** · dual-closed honesty **≠** R2 closed · **≠** verbal 生效 · **≠** suite green · **≠** HA

*Harness · G7-K1 · 2026-09-16 ~19:53 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ R2 closed*
