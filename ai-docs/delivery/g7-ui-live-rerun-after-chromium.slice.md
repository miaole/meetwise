# Slice — G7 · **UI Live re-run after chromium**（Key loader path · `e2e:ui:isolated` only）

**Status**: **`post_prove_dual_pass:honesty_red`**（Key **set** · chromium **ran** · UI EXIT=**1** · post-prove dual **BOTH PASS** · honesty of red-with-chromium+Key · **≠** UI/suite/G6/R5/HA green）  
**Date**: 2026-09-17 ~00:21 PT  
**Authority**: meetwise — chromium prereq **`post_prove_dual_pass`** · UI Live **executed** EXIT=**1** · post-prove dual **BOTH PASS** · **no invent Key** · **no self-approve** · **no re-run**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **≠ family green** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **A′ honesty_red retained** · **sole 恰 5** · **R5 SEPARATE** · **no invent Key**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec **pass** · post-prove **BOTH PASS**）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/g7-ui-live-rerun-after-chromium.slice.md` |
| Harness | `ai-docs/delivery/harness/g7-ui-live-rerun-after-chromium.md` |
| Eval | `ai-docs/delivery/eval/g7-ui-live-rerun-after-chromium.eval.md` |
| Receipt | `receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md` |
| Pre-exec · e2e-ha | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`（**pass**） |
| Pre-exec · rag-route | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`（**pass**） |
| post-prove REQUEST · e2e-ha | `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md` |
| post-prove REQUEST · rag-route | `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md` |
| post-prove · e2e-ha | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md`（**pass** · honesty of red-with-chromium+Key） |
| post-prove · rag-route | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`（**pass** · honesty of red-with-chromium+Key） |
| Prior CR | `harness/g7-chromium-ui-runner-prereq.md` · **`post_prove_dual_pass`** · Live **`not_run:this_knife`** |
| Prior A′ | `harness/g7-key-live-x3.md` · `post_prove_dual_pass:honesty_red_key_set` · UI EXIT=1 chromium miss · **retained** |
| Parent honesty knives | `g7-honesty-knives.slice.md`（CR dual-closed · UI′ honesty_red） |
| G6 | `harness/g6-e2e-iso-blocked.md` · G6 still OPEN |
| R5 SEPARATE | R5 mark-red / pgvector-legacy / sole-stack — **not** closed by UI Live alone |

## Exact CMD（frozen · this knife only）+ EXIT

| CMD | package.json | EXIT |
|-----|--------------|------|
| `pnpm e2e:ui:isolated` | `node scripts/run-e2e-isolated.mjs e2e:ui` | **1**（2026-09-17 ~00:11–00:17 PT） |

**Not this knife**: `pnpm e2e:isolated` · `pnpm verify:e2e-performance` · full Key×3 trio · R5 isolated prove · chromium reinstall.

**Presence probe（name only）**：`NEW_SHELL_STATUS=set`（authorized `source /home/box/.meetwise-secrets/load-model-api-key.sh`）· **no invent Key** · **never print value**

## One-line scope

After chromium **`post_prove_dual_pass`**, authorized `pnpm e2e:ui:isolated` re-run（Key loader path only）. Live **EXIT=1** · chromium **ran** · Key **set** · post-prove dual **BOTH PASS** → status **`post_prove_dual_pass:honesty_red`**. **chromium ≠ UI green** · **Ban fake green** · **R5 SEPARATE** · **A′ honesty_red retained** · **sole 恰 5**.

## Gate

1. Pre-exec dual（both domains）**pass** ✅  
2. Key inject via authorized loader only · NEW_SHELL_STATUS name-only · record EXIT honesty ✅  
3. ⇒ **post-prove dual** ✅ — both **pass**（honesty of red-with-chromium+Key）· status **`post_prove_dual_pass:honesty_red`**  
4. Ban invent success / invent Key · ban self-approve · **no re-run**

## Hard pins

- **≠ UI green · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA**  
- **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · install/start ≠ suite/G6/R5/UI green  
- **Key set ≠ UI green** · EXIT=1 ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA  
- **A′ honesty_red retained** · do NOT rewrite prior Key-set UI red to green  
- **R5 isolated still SEPARATE** · UI Live EXIT alone ≠ R5 closed / sole cutover  
- **sole 恰 5** · `releaseEvidence=false` · no invent Key · never paste Key · never read `.env*`  
- **Ban fake green** · no self-approve · no model-op unless domain need proven · **no re-run**

---

*Slice · G7 UI Live re-run after chromium · 2026-09-17 ~00:21 PT · post_prove_dual_pass:honesty_red · EXIT=1 · NEW_SHELL_STATUS=set · chromium ran · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ UI green · chromium ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green · no invent Key · no re-run*
