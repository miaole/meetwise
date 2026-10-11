# Slice — G7 · **chromium / UI runner prerequisite**

**Status**: **`post_prove_dual_pass`**（runner-prereq honesty only）  
**Date**: 2026-09-17 ~00:05 PT  
**Authority**: meetwise — pre-exec dual PASS + authorize install+minimal verify · install+smoke **executed** · post-prove dual **BOTH PASS** · **Ban claiming suite/G6/R5/UI green**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ family green** · **Key set ≠ UI green** · **install/start ≠ suite/G6/R5/UI green** · **no invent Key** · **R5 pgvector-legacy SEPARATE** · **A′ honesty_red retained** · **sole 恰 5**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec **pass** · post-prove **BOTH PASS** · **no** model-op · **no self-approve**）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/g7-chromium-ui-runner-prereq.slice.md` |
| Harness | `ai-docs/delivery/harness/g7-chromium-ui-runner-prereq.md` |
| Eval | `ai-docs/delivery/eval/g7-chromium-ui-runner-prereq.eval.md` |
| Receipt | `ai-docs/delivery/receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` · `.tmp/g7-chromium-ui-runner-prereq-20260917/` |
| Install（executed） | `pnpm -C apps/web exec playwright install chromium` · EXIT=**0** |
| Verify（executed） | `playwright --version` EXIT=**0** · chromium.launch smoke EXIT=**0** |
| Live UI | `pnpm e2e:ui:isolated` · **`not_run:this_knife`** |
| REQUEST · e2e-ha（pre-exec） | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md` → review **pass** |
| REQUEST · rag-route（pre-exec） | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md` → review **pass** |
| REQUEST · e2e-ha（post-prove） | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md` |
| REQUEST · rag-route（post-prove） | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md` |
| Post-prove review · e2e-ha | `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md`（**pass**） |
| Post-prove review · rag-route | `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`（**pass**） |
| Prior A′ | `harness/g7-key-live-x3.md` · `post_prove_dual_pass:honesty_red` · UI EXIT=1 chromium miss · **retained** |
| Next knife | `g7-ui-live-rerun-after-chromium.slice.md` · UI Live re-run · **`REQUEST-ready / not_run:pre_dual`** |
| Complement G6 | `harness/g6-e2e-iso-blocked.md` · G6 still OPEN |
| R5 SEPARATE | R5 mark-red / pgvector-legacy / sole-stack knives — **not** closed by this |

## One-line scope

**Playwright chromium installed** + runner launch smoke OK after A′ Key-set UI fail. Status **`post_prove_dual_pass`**（runner-prereq honesty only）· **≠** suite/G6/R5/UI green · Live UI **`not_run:this_knife`** · **R5 SEPARATE** · **A′ honesty_red retained** · **sole 恰 5**.

## CMD+EXIT（honest）

| CMD | EXIT | Read |
|-----|------|------|
| `pnpm -C apps/web exec playwright install chromium` | **0** | binary installed · ≠ UI/suite/G6/R5/HA green |
| `pnpm -C apps/web exec playwright --version` | **0** | `Version 1.61.1` · expert independent **0** |
| chromium.launch smoke（`@playwright/test`） | **0** | runner can start · expert independent **0** · ≠ Live UI green |
| `pnpm e2e:ui:isolated` | **`not_run:this_knife`** | full Live suite deferred → next knife |

## Hard pins

- install/start ≠ suite green ≠ G6 closed ≠ R5 closed ≠ UI green ≠ HA  
- Do **NOT** rewrite Live honesty_red_key_set / A′ to green  
- R5 pgvector-legacy is **SEPARATE** knife — do not claim closed by this  
- `releaseEvidence=false` · no self-approve · **no invent Key** · Live UI not claimed green  
- **sole 恰 5** retained · allowlist not expanded by this knife  
- chromium prereq dual-closed **≠** UI green · next = authorized `e2e:ui:isolated` re-run only

---

*Slice · G7 chromium UI runner prereq · 2026-09-17 ~00:05 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · install/start ≠ suite/G6/R5/UI green · R5 SEPARATE · A′ honesty_red retained · sole 恰 5 · Live UI not_run:this_knife*
