# REQUEST — G7 · **UI Live re-run after chromium**（**post-prove**）→ mw-e2e-ha

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 ~00:17 PT  
**Knife status**: **`executed:awaiting_post_prove_dual`** · `pnpm e2e:ui:isolated` **EXIT=1** · NEW_SHELL_STATUS=**set** · **no invent / paste Key** · **no read `.env*`** · **no commit secrets**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ family green** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **EXIT=1 ≠ UI green** · **A′ honesty_red retained** · **sole 恰 5** · **no invent Key**  
**Pair**: `REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual **pass** · meetwise authorize Live · UI Live **executed** · Exact CMD = **`pnpm e2e:ui:isolated` only**（≠ full trio）· **R5 SEPARATE** · **Ban claiming suite/G6/R5/UI green** · **do NOT rewrite A′ honesty_red_key_set historical red to green**  
**前序 pre-exec**：`reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`（**pass** · docs gate only）

---

## Contra

| File | Role |
|------|------|
| `harness/g7-ui-live-rerun-after-chromium.md` | Canonical harness（**`executed:awaiting_post_prove_dual`**） |
| `g7-ui-live-rerun-after-chromium.slice.md` | Slice index |
| `eval/g7-ui-live-rerun-after-chromium.eval.md` | Post-prove eval · EXIT table |
| `receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md` | CMD+EXIT receipt |
| `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/` | full.log · EXIT.txt |
| `apps/web/test-results/.last-run.json` | Playwright `status=failed` · 14 failedTests |
| `harness/g7-chromium-ui-runner-prereq.md` | Prior CR · **`post_prove_dual_pass`** · ≠ UI green |
| `harness/g7-key-live-x3.md` | A′ honesty_red_key_set · UI EXIT=1 chromium miss · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 still OPEN |
| R5 / sole docs | **SEPARATE** — not this close surface |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-17 ~00:11–00:17 PT · 待专家核对）

**Presence probe（name only · never print value）**：`NEW_SHELL_STATUS=set` · authorized loader · **no invent Key**

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `source /home/box/.meetwise-secrets/load-model-api-key.sh` + NEW_SHELL_STATUS | **set** | ONLY authorized path · **Key set ≠ UI green** |
| **`pnpm e2e:ui:isolated`** | **1** | Live UI **ran** · Playwright chromium **present**（22 tests）· **14 failed / 4 passed / 4 skipped** · `E2E_FAILURE class=frontend code=client_exited` · dominant fail = `状态:ingested` timeout after resume upload · isolation **R5-MARKED-RED** pgvector-legacy · **≠ UI green ≠ suite/G6/R5/HA** |
| `pnpm e2e:isolated` / `verify:e2e-performance` | **out of scope** | this knife = UI only · prior A′ trio honesty separate |

**vs A′**：A′ UI fail class = chromium binary miss · **retained** as historical honesty_red. This run = chromium **ran** but EXIT still **1**（ingest/status）· **does not** rewrite A′ red → green.

**Receipts**：
- `ai-docs/delivery/receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md`
- `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/e2e-ui-isolated-full.log`
- `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/EXIT.txt`
- `apps/web/test-results/.last-run.json` + per-fail dirs under `apps/web/test-results/`

**HEAD**：`db0d513`

---

## Please answer（Q1–Q6）

1. Confirm EXIT table：**NEW_SHELL_STATUS=set** · **`pnpm e2e:ui:isolated` EXIT=1** · and **EXIT≠0 ≠ UI green ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA**?  
2. Agree **chromium prereq ≠ UI green** · chromium **ran** this turn still **≠ UI green**（EXIT=1）?  
3. Agree **A′ honesty_red_key_set retained** · do **not** rewrite historical chromium-miss red to green?  
4. Agree **R5-MARKED-RED** / pgvector-legacy on iso · **R5 SEPARATE** · **G6 still OPEN** · sole 恰 5 · this knife ≠ full trio?  
5. Agree Key inject = authorized loader only · **no invent Key** · never echo/commit Key · `releaseEvidence=false` · Ban fake green?  
6. Confirm implementer did **not** self-approve · **post-prove dual** required（write review；ban implementer-authored pass）?

Please write the conclusion to `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md`. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not suite green · not G6 closed · not R5 closed · not UI green · not HA  
- Key set ≠ UI green · chromium ran ≠ UI green · EXIT=1 ≠ rewrite A′  
- `releaseEvidence=false` · no invent Key · no self-approve

---

*REQUEST · mw-e2e-ha · G7 UI Live re-run after chromium post-prove · 2026-09-17 ~00:17 PT · executed:awaiting_post_prove_dual · EXIT=1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · chromium prereq ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · R5 SEPARATE · sole 恰 5 · Ban fake green · no invent Key*
