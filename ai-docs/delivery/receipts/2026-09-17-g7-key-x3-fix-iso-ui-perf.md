# Receipt — G7 · **Key×3 fix**（iso / UI / perf · standing authorize · frozen trio）

**Status**: **`executed:awaiting_post_prove_dual`**（**Ban** implementer self-writing `post_prove_dual_pass`）  
**Date**: 2026-09-17 ~20:04–20:17 PT（execute）· receipt ~20:18 PT  
**Authority**: meetwise standing authorize · **G7 Key×3 fix iso/UI/perf coding+prove** · pre-exec dual PASS on REQUEST SHA `8de362c`（docs gate）· Dual PASS ≠ already fixed  
**NEW_SHELL_STATUS**: **set**（authorized `source /home/box/.meetwise-secrets/load-model-api-key.sh` · name-only · **no invent Key** · value **never** printed / echoed / committed）  
**Prove / push SHA**: **`a4e3de5`**（`a4e3de583942fb641acb7cf545709f4124034b86`）  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ family green** · **≠ covered** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed** · **≠ R5 closed** · **Key set ≠ auto green** · **Ban假绿** · **do NOT wash EXIT=1 into green** · **R5-MARKED-RED retained** · **G6 STILL OPEN** · **Dual ≠ coding** · **no invent Key** · **Ban self-approve dual_pass**

## What changed（minimal · honest）

| Area | Change | Honest effect |
|------|--------|---------------|
| UI ingest label | specs assert `解析完成`（was raw `状态:ingested`） | dominant ingested timeout **removed** from UI fail set |
| UI stream stress | interview page enters panel for `__e2e_stream_stress__` when `E2E_UI_STRESS=1` | stream-window chromium+mobile **PASS** |
| UI golden mobile | require **visible** `a[href="/login"]`（open menu if collapsed） | golden mobile **PASS** |
| UI voice | `test.skip` unless `DASHSCOPE_TTS_API_KEY` + `DASHSCOPE_ASR_API_KEY` | honest capability skip · **≠** voice green |
| HTTP E2E OCR/voice | gate on `DASHSCOPE_VISION_API_KEY` / TTS+ASR · **no** `MODEL_API_KEY` copy | capability reviews · **≠** wash |
| Live profile | `scripts/e2e-live-capability-env.mjs` pins `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` when key set & profile unset | stops DeepSeek default vs Bailian key mismatch |
| Interview live path | **unchanged** fail-closed | authorized key → DashScope chat **403 `AllocationQuota.FreeTierOnly`** → `deterministic_refusal` → `generation_provider_not_configured` · **questions=0** |

## CMD+EXIT（frozen trio · this execute）

| # | CMD | EXIT | Elapsed | Honest read |
|---|-----|------|---------|-------------|
| 0 | `source …/load-model-api-key.sh` + NEW_SHELL_STATUS probe | n/a · **set** | — | ONLY authorized path · **Key set ≠ suite/family green** |
| 1 | **`pnpm e2e:isolated`** | **1** | 21s | Key **set** · OCR/voice capability reviews · begin OK · **questions=0** `interview_unavailable` / `generation_provider_not_configured`（live chat **403 FreeTierOnly**）· **R5-MARKED-RED** pgvector-legacy · `failureClass=api` · **≠ family green ≠ G6 closed** |
| 2 | **`pnpm e2e:ui:isolated`** | **1** | 143s | Key **set** · **10 passed / 2 failed / 10 skipped** · stream+golden+screenshots **PASS** · voice **skipped**（no TTS/ASR keys）· **recruiting-bound** chromium+mobile `waitForURL(/interview/iv_…)` timeout（live interview start blocked by same provider quota）· `E2E_FAILURE class=frontend code=client_exited` · **chromium ran ≠ UI green** |
| 3 | **`pnpm verify:e2e-performance`** | **1** | 77s | migrate runner PASSes then **HTTP full E2E** → `e2e_performance_suite_failed:HTTP full E2E:exit=1` · **≠ SLO ≠ LOAD ≠ HA ≠ suite green** |

**EXIT table (frozen trio)**: **1 / 1 / 1**

## Dominant residual reds（not washed）

1. **iso / perf HTTP E2E**: live text chat refused — DashScope `AllocationQuota.FreeTierOnly` on authorized `MODEL_API_KEY`（status-only probe；**never** print key）. Not fixable by inventing credentials or copying text key into vision/ASR/TTS slots.  
2. **UI recruiting-bound**: interview bind URL never appears within 30s — depends on live generation path above.  
3. **R5-MARKED-RED** pgvector-legacy isolation stack · **G6 STILL OPEN**.

## Pins

- **Ban假绿** · EXIT **1/1/1** retained · **Ban claim fixed without EXIT evidence**  
- **Key set ≠ auto green** · FreeTierOnly proves Key-set ≠ suite green  
- Prior A″ honesty_red on `e697c81` **retained**（this knife = fix attempt + fresh prove · **≠** rewrite honesty_red → green）  
- **releaseEvidence=false** · **≠HA** · **≠ suite green**  
- **Ban** self-writing `post_prove_dual_pass` · status stays **`executed:awaiting_post_prove_dual`**  
- `.env*` **not read / not printed** · Key value **never** echoed · **no commit secrets** · Meridian banned · force-push banned

## Artifact paths（local · not committed）

- `.tmp/g7-key-x3-fix-20260917/01-e2e-isolated.log` + `EXIT-01-e2e-isolated.txt`
- `.tmp/g7-key-x3-fix-20260917/02c-e2e-ui-isolated.log` + `EXIT-02-e2e-ui-isolated.txt`
- `.tmp/g7-key-x3-fix-20260917/03-verify-e2e-performance.log` + `EXIT-03-verify-e2e-performance.txt`
- `.tmp/e2e-receipts/2026-09-18T03-13-11-573Z-2254679-58841060-e0b0-4526-8f28-f842c9e25e3b.json`（iso · failed/api · capability OCR/voice）

## Post-prove REQUEST stubs（await experts · Ban self-pass）

| Expert | REQUEST stub |
|--------|----------------|
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-17-g7-key-x3-fix-iso-ui-perf-post-prove-mw-e2e-ha.md` |
| `mw-rag-route` | `reviews/REQUEST-2026-09-17-g7-key-x3-fix-iso-ui-perf-post-prove-mw-rag-route.md` |

**Harness / eval / slice**: `harness/g7-key-x3-fix-iso-ui-perf.md` · `eval/g7-key-x3-fix-iso-ui-perf.eval.md` · `g7-key-x3-fix-iso-ui-perf.slice.md` → status **`executed:awaiting_post_prove_dual`**

---

*Receipt · G7 Key×3 fix iso/UI/perf · 2026-09-17 ~20:04–20:17 PT execute · EXIT 1/1/1 · NEW_SHELL_STATUS=set · executed:awaiting_post_prove_dual · releaseEvidence=false · ≠HA · ≠ suite/family green · Key set ≠ auto green · Ban假绿 · R5-MARKED-RED · G6 STILL OPEN · FreeTierOnly residual · Dual ≠ coding · Ban self-approve dual_pass · no invent Key*
