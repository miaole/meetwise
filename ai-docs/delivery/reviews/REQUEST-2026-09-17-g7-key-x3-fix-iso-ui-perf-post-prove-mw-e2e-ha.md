# REQUEST — G7 · **Key×3 fix** iso/UI/perf（**post-prove**）→ mw-e2e-ha

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 ~20:18 PT  
**Knife status**: **`executed:awaiting_post_prove_dual`** · frozen trio **re-executed** with Key **set** · EXIT **1/1/1** · **no invent / paste Key** · **no read `.env*`** · **no commit secrets**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed** · **Key set ≠ auto green** · **EXIT=0 ≠ suite green**（this run EXIT **1/1/1**） · **Ban假绿** · **Ban implementer self-writing `post_prove_dual_pass`**  
**Pair**: `REQUEST-2026-09-17-g7-key-x3-fix-iso-ui-perf-post-prove-mw-rag-route.md`  
**Pre-exec dual**: PASS on REQUEST SHA `8de362c`（docs）· Dual PASS ≠ already fixed · standing authorize for coding+prove **used**

---

## Contra

| File | Role |
|------|------|
| `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` | CMD+EXIT receipt · **`executed:awaiting_post_prove_dual`** |
| `harness/g7-key-x3-fix-iso-ui-perf.md` | fix knife harness · status flipped to awaiting_post_prove_dual |
| `receipts/2026-09-17-g7-key-x3-rerun.md` | Prior A″ honesty_red EXIT 1/1/1 · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 **still OPEN** |
| `.tmp/g7-key-x3-fix-20260917/` | full logs + EXIT txts |

---

## Post-prove CMD+EXIT（实现方 · 待专家核对）

**Presence probe（name only · never print value）**：`NEW_SHELL_STATUS=set` · authorized loader · **no invent Key**

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `source …/load-model-api-key.sh` + NEW_SHELL_STATUS | **set** | ONLY authorized path · **Key set ≠ suite/family green** |
| **`pnpm e2e:isolated`** | **1** | Key **set** · capability OCR/voice reviews · **questions=0** `generation_provider_not_configured` · live DashScope **403 FreeTierOnly** · **R5-MARKED-RED** · `failureClass=api` |
| **`pnpm e2e:ui:isolated`** | **1** | **10 passed / 2 failed / 10 skipped** · ingest/stream/golden fixed · voice skipped · **recruiting-bound** still red（interview URL timeout / same live-gen dependency）· **≠ UI green** |
| **`pnpm verify:e2e-performance`** | **1** | migrate PASS · **HTTP full E2E exit=1** · **≠ SLO ≠ LOAD ≠ HA** |

**EXIT table**: **1 / 1 / 1**

**NHP**：Key-set ≠ auto green · FreeTierOnly residual · R5 mark-red · G6 OPEN · Ban wash EXIT=1 → green · prior A″ honesty retained · no Key in logs/docs · UI partial progress ≠ suite green

Please write the conclusion to `reviews/2026-09-17-g7-key-x3-fix-iso-ui-perf-post-prove-mw-e2e-ha.md`. **Ban** implementer writing pass.

---

*REQUEST · mw-e2e-ha · G7 Key×3 fix post-prove · 2026-09-17 ~20:18 PT · executed:awaiting_post_prove_dual · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA*
