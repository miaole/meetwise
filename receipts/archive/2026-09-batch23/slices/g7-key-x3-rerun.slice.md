# Slice — G7 · **Key×3 re-run**（frozen trio · standing authorize）

**Status**: **`post_prove_dual_pass:honesty_red`**（Key **set** · EXIT **1/1/1** · post-prove dual **BOTH PASS** · honesty of red-with-Key-set · **≠** suite/family green）  
**Date**: 2026-09-17 ~19:50 PT  
**Authority**: meetwise standing · Key×3 re-run executed · post-prove dual **BOTH PASS** · **no invent Key** · **no self-approve** · **no re-run** · Dual ≠ coding  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ family green** · **≠ covered** · **≠ SLO** · **≠ LOAD** · **≠ G6 closed** · **≠ R5 closed** · **Key set ≠ suite green** · **Ban假绿** · **R5-MARKED-RED retained** · **G6 STILL OPEN** · **A / A′ honesty retained**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（post-prove **BOTH PASS** · dual on **`e697c81`**）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/g7-key-x3-rerun.slice.md` |
| Harness | `ai-docs/delivery/harness/g7-key-x3-rerun.md` |
| Eval | `ai-docs/delivery/eval/g7-key-x3-rerun.eval.md` |
| Receipt | `receipts/2026-09-17-g7-key-x3-rerun.md` |
| post-prove REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md` |
| post-prove REQUEST · rag-route | `reviews/REQUEST-2026-09-17-g7-key-x3-rerun-post-prove-mw-rag-route.md` |
| post-prove · e2e-ha | `reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md`（**pass**） |
| post-prove · rag-route | `reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-rag-route.md`（**pass**） |
| Prior A | `harness/g7-key-blocked-x3-honesty.md` · unset-era · **retained** |
| Prior A′ | `harness/g7-key-live-x3.md` · `honesty_red_key_set` · **retained** |
| G6 | `harness/g6-e2e-iso-blocked.md` · **G6 STILL OPEN** |

## Exact CMD（frozen trio）+ EXIT

| CMD | EXIT |
|-----|------|
| `pnpm e2e:isolated` | **1**（api / R5-MARKED-RED pgvector-legacy） |
| `pnpm e2e:ui:isolated` | **1**（chromium ran · `状态:ingested` timeout） |
| `pnpm verify:e2e-performance` | **1**（HTTP full E2E fail） |

**Presence**：`NEW_SHELL_STATUS=set` · authorized loader · **no invent Key**

## One-line scope

Standing-authorize Key×3 re-run · EXIT **1/1/1** with Key **set** · post-prove dual **BOTH PASS** → **`post_prove_dual_pass:honesty_red`**. **Key set ≠ suite green** · **Ban假绿** · **R5-MARKED-RED retained** · **G6 STILL OPEN** · **Dual ≠ coding** · A/A′ historical honesty **retained**.

## Gate

1. Standing authorize · Key loader path only ✅  
2. Record fresh CMD+EXIT（1/1/1）✅  
3. ⇒ post-prove dual **BOTH PASS** ✅ · dual on **`e697c81`** · status **`post_prove_dual_pass:honesty_red`**  
4. Ban invent success / invent Key · Ban假绿 · Dual ≠ coding · **no re-run**

## Hard pins

- **Key set ≠ suite green ≠ family green ≠ covered ≠ SLO ≠ LOAD ≠ HA**  
- **≠HA** · **`releaseEvidence=false`**  
- **Ban假绿** · do **NOT** wash EXIT=1 into green  
- **R5-MARKED-RED retained** · **G6 STILL OPEN**  
- **Dual ≠ coding** · Dual PASS ≠ suite green  
- A unset + A′ honesty_red_key_set **retained** · no invent Key · never read `.env*` · Ban secrets

---

*Slice · G7 Key×3 re-run · 2026-09-17 ~19:50 PT · post_prove_dual_pass:honesty_red · dual on e697c81 · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA · Key set ≠ suite green · Ban假绿 · R5-MARKED-RED · G6 STILL OPEN · Dual ≠ coding · no invent Key · no re-run*
