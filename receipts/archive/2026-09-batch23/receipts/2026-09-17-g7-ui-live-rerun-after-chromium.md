# Receipt — G7 · **UI Live re-run after chromium** · `pnpm e2e:ui:isolated`

**Date**: 2026-09-17 ~00:11–00:17 PT  
**Authority**: meetwise execute authorize after pre-exec dual PASS  
  - `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`（**pass** · docs gate only）  
  - `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`（**pass** · docs gate only）  
**NEW_SHELL_STATUS**: **set**（authorized `source /home/box/.meetwise-secrets/load-model-api-key.sh` · name-only · **no invent Key** · value never printed）  
**HEAD（execute）**: `db0d513`  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **A′ honesty_red retained** · **R5 SEPARATE** · **sole 恰 5** · **Ban fake green**

## CMD+EXIT

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | `source …/load-model-api-key.sh` + NEW_SHELL_STATUS probe | n/a · **set** | ONLY authorized path · **Key set ≠ UI green** |
| 2 | **`pnpm e2e:ui:isolated`** | **1** | Live UI ran · Playwright chromium **present**（22 tests executed）· **14 failed / 4 passed / 4 skipped** · `E2E_FAILURE class=frontend code=client_exited` · isolation **R5-MARKED-RED** pgvector-legacy · **≠ UI green ≠ suite/G6/R5/HA** |

## Playwright summary（honesty）

- Runner: chromium + mobile projects · **not** “Executable doesn't exist” (A′ chromium-miss era superseded for *this* failure class only)  
- Dominant fail theme: `getByText(/状态:ingested/)` timeout after resume upload（ingest/status not visible within 20s）across golden / recruiting-bound / screenshots-desktop / voice-duplex  
- stream-window: separate `toContainText` fail  
- Passed: protected no-cookie → `/login`（chromium+mobile）· mobile H5 screenshots  
- Skipped: online-public ×4（project skip）

## Pins

- **chromium pass ≠ UI green** — CR install/smoke + this Live still EXIT=**1**  
- **chromium ran ≠ UI green** — binary present & projects executed · still EXIT=**1**  
- **Do NOT rewrite A′ `honesty_red_key_set` historical red to green** — A′ retained; this receipt is a **fresh** UI Live honesty row（EXIT=1 · different fail class）  
- **R5 pgvector-legacy SEPARATE** — banner on iso · UI Live alone ≠ R5 closed ≠ sole cutover  
- **sole 恰 5** · **releaseEvidence=false** · **no invent/echo/commit Key**  
- This knife = **UI only**（not full trio）

## Artifact paths

- `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/e2e-ui-isolated-full.log`
- `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/EXIT.txt`
- `apps/web/test-results/`（per-fail dirs · screenshots + traces · **not** committed）

## Post-prove

**Status**: **`post_prove_dual_pass:honesty_red`** · post-prove dual **BOTH PASS**（honesty of red-with-chromium+Key）· **no self-approve** · **no re-run**

| Expert | Review | Verdict |
|--------|--------|---------|
| `mw-e2e-ha` | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md` | **pass** |
| `mw-rag-route` | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md` | **pass** |

---

*Receipt · G7 UI Live re-run after chromium · 2026-09-17 ~00:17 PT execute · ~00:21 PT post-prove close · EXIT=1 · NEW_SHELL_STATUS=set · post_prove_dual_pass:honesty_red · releaseEvidence=false · ≠HA · ≠ suite/G6/R5/UI green · A′ honesty_red retained · R5 SEPARATE · sole 恰 5 · Ban fake green · no invent Key · no re-run*
