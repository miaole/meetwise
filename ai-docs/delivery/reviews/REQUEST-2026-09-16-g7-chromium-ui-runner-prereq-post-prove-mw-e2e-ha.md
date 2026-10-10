# REQUEST — G7 · **chromium / UI runner prerequisite**（**post-prove**）→ mw-e2e-ha

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 ~00:01 PT  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ family green** · **Key set ≠ UI green** · **install ≠ UI green** · **no invent Key**  
**Pair**: `REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`  
**Hard**: pre-exec dual **pass** · meetwise authorize install+minimal verify · install+smoke **executed** · Live `e2e:ui:isolated` = **`not_run:this_knife`** · **R5 SEPARATE** · **Ban claiming suite/G6/R5/UI green** · **do NOT rewrite A′ honesty_red Key-set to green**  
**前序 pre-exec**：`reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md`（**pass** · docs gate only）

---

## Contra

| File | Role |
|------|------|
| `harness/g7-chromium-ui-runner-prereq.md` | Canonical harness（**`executed:awaiting_post_prove_dual`**） |
| `g7-chromium-ui-runner-prereq.slice.md` | Slice index |
| `eval/g7-chromium-ui-runner-prereq.eval.md` | Post-prove eval |
| `receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` | CMD+EXIT receipt |
| `.tmp/g7-chromium-ui-runner-prereq-20260917/` | install.log · verify-*.log |
| `harness/g7-key-live-x3.md` | A′ honesty_red · UI EXIT=1 chromium miss · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 still OPEN |
| R5 / sole docs | **SEPARATE** — not this close surface |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-17 ~00:01 PT · 待专家核对）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm -C apps/web exec playwright install chromium`** | **0** | Playwright chromium v1228 installed · **≠** UI green · **≠** G6/R5/suite/HA |
| `pnpm -C apps/web exec playwright --version` | **0** | `Version 1.61.1` |
| chromium.launch headless smoke（`@playwright/test`） | **0** | `chromium_launch_smoke_ok` · runner can start · **≠** `e2e:ui:isolated` green |
| `pnpm e2e:ui:isolated` | **`not_run:this_knife`** | authorize = minimal verify only · **no** Live×3 this knife |

**CMD note**: Root `pnpm exec playwright` not found；sanctioned path = `pnpm -C apps/web exec playwright …`（`@playwright/test` under `apps/web`）.

---

## Please answer（Q1–Q6）

1. Agree install EXIT=0 + launch smoke EXIT=0 = **UI runner prereq met**（≠ UI green · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA）?  
2. Agree **Key set ≠ UI green** retained · A′ honesty_red **not** rewritten to green?  
3. Agree Live `e2e:ui:isolated` = **`not_run:this_knife`** is correct under authorize（minimal verify only）?  
4. Agree **R5 pgvector-legacy is SEPARATE** · this knife **must not** claim R5 closed?  
5. Agree **no** invent Key · no self-approve · `releaseEvidence=false` · Ban suite/G6/R5/UI green / HA?  
6. Independent spot-check：re-run `--version` and/or launch smoke EXIT（optional）?

Please write the conclusion to `reviews/2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md`. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not suite green · not G6 closed · not R5 closed · not UI green · not HA  
- install/start ≠ suite/G6/R5/UI green ≠ HA  
- Live honesty_red Key-set **not** rewritten  
- `releaseEvidence=false` · no invent Key · no self-approve

---

*REQUEST · mw-e2e-ha · G7 chromium UI runner prereq post-prove · 2026-09-17 ~00:01 PT · executed:awaiting_post_prove_dual · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · install ≠ UI green · R5 SEPARATE · no invent Key*
