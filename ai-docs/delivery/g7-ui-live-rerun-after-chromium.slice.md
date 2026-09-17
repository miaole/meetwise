# Slice — G7 · **UI Live re-run after chromium**（Key loader path · `e2e:ui:isolated` only）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 ~00:05 PT  
**Authority**: meetwise — chromium prereq **`post_prove_dual_pass`** · this knife = **pre-exec REQUEST draft only** · **zero Live · zero install · zero coding · zero commit**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **≠ family green** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **install/start ≠ suite/G6/R5/UI green** · **A′ honesty_red retained** · **sole 恰 5** · **R5 isolated SEPARATE** · **no invent Key**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（**no** model-op · **no self-approve**）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/g7-ui-live-rerun-after-chromium.slice.md` |
| Harness | `ai-docs/delivery/harness/g7-ui-live-rerun-after-chromium.md` |
| Eval | `ai-docs/delivery/eval/g7-ui-live-rerun-after-chromium.eval.md` |
| REQUEST · e2e-ha（pre-exec） | `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md` |
| REQUEST · rag-route（pre-exec） | `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md` |
| Prior CR | `harness/g7-chromium-ui-runner-prereq.md` · **`post_prove_dual_pass`** · Live **`not_run:this_knife`** |
| Prior A′ | `harness/g7-key-live-x3.md` · `post_prove_dual_pass:honesty_red` · UI EXIT=1 chromium miss · **retained** |
| Parent honesty knives | `g7-honesty-knives.slice.md`（CR dual-closed · UI′ this knife） |
| G6 | `harness/g6-e2e-iso-blocked.md` · G6 still OPEN |
| R5 SEPARATE | R5 mark-red / pgvector-legacy / sole-stack — **not** closed by UI Live alone |

## Exact CMD（frozen · this knife only）

| CMD | package.json | Status now |
|-----|--------------|------------|
| `pnpm e2e:ui:isolated` | `node scripts/run-e2e-isolated.mjs e2e:ui` | **`not_run:pre_dual`** |

**Not this knife**: `pnpm e2e:isolated` · `pnpm verify:e2e-performance` · full Key×3 trio · R5 isolated prove · chromium reinstall.

**Key inject（authorized path only · after dual + meetwise execute authorize）**：
```bash
source /home/box/.meetwise-secrets/load-model-api-key.sh
# name-only probe — never print value · never read .env*
if [ -n "${MODEL_API_KEY:-}" ]; then echo NEW_SHELL_STATUS=set; else echo NEW_SHELL_STATUS=unset; fi
pnpm e2e:ui:isolated ; echo "CMD=pnpm e2e:ui:isolated EXIT=$?"
```

## One-line scope

After chromium **`post_prove_dual_pass`**, draft pre-exec dual for **authorized** `pnpm e2e:ui:isolated` re-run（Key loader path only）. Status **`REQUEST-ready / not_run:pre_dual`**. **chromium prereq ≠ UI green** · **Ban fake green** · **R5 SEPARATE** · **A′ honesty_red retained** · **sole 恰 5**.

## Gate

1. Pre-exec dual（both domains）**pass** → meetwise **may execute** UI Live  
2. Key inject via authorized loader only · NEW_SHELL_STATUS name-only probe · record EXIT honesty  
3. ⇒ **post-prove dual** · no self-approve · Ban invent success / invent Key  
4. This prep：**zero Live · zero install · zero coding · zero commit**

## Hard pins

- **chromium prereq ≠ UI green** · install/start ≠ suite/G6/R5/UI green  
- **Key set ≠ UI green** · EXIT=0 ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA  
- **A′ honesty_red retained** · do NOT rewrite prior Key-set UI red to green without fresh receipts  
- **R5 isolated still SEPARATE** · UI Live EXIT alone ≠ R5 closed / sole cutover  
- **sole 恰 5** · `releaseEvidence=false` · no invent Key · never paste Key · never read `.env*`  
- **Ban fake green** · no self-approve · no model-op unless domain need proven

---

*Slice · G7 UI Live re-run after chromium · 2026-09-17 ~00:05 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · chromium prereq ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green · no invent Key*
