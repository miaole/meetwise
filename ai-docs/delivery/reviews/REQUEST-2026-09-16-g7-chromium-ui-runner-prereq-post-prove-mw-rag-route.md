# REQUEST — G7 · **chromium / UI runner prerequisite**（**post-prove**）→ mw-rag-route

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 ~00:01 PT  
**releaseEvidence=false** · Not HA · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ sole cutover** · **≠ R4 closed** · **≠ 题域已隔离** · **Key set ≠ UI green** · **install ≠ UI green** · **no invent Key**  
**Pair**: `REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md`  
**Hard**: pre-exec dual **pass** · meetwise authorize install+minimal verify · install+smoke **executed** · Live `e2e:ui:isolated` = **`not_run:this_knife`** · **R5 SEPARATE** · **Ban claiming suite/G6/R5/UI green** · **do NOT rewrite A′ honesty_red Key-set to green**  
**前序 pre-exec**：`reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md`（**pass** · docs gate only）

---

## Contra

| File | Role |
|------|------|
| `harness/g7-chromium-ui-runner-prereq.md` | **本刀** · **`executed:awaiting_post_prove_dual`** · M1–M6 · CR-A–D |
| `g7-chromium-ui-runner-prereq.slice.md` | Slice index |
| `eval/g7-chromium-ui-runner-prereq.eval.md` | Post-prove eval |
| `receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` | CMD+EXIT receipt |
| `.tmp/g7-chromium-ui-runner-prereq-20260917/` | raw logs |
| `harness/g7-key-live-x3.md` | A′ UI EXIT=1 chromium miss · honesty_red · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 still OPEN · LIVE UI Set |
| R5 / sole / G1 artefacts | **SEPARATE** — fixture retirement ≠ this install knife |
| A unset-era Key-blocked×3 | complementary · **retained** · not rewritten |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-17 ~00:01 PT · 待专家核对）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm -C apps/web exec playwright install chromium`** | **0** | Chromium binary installed（Playwright v1228）· **≠** UI/suite/G6/R5/HA green |
| `pnpm -C apps/web exec playwright --version` | **0** | `Version 1.61.1` |
| chromium.launch headless smoke（`@playwright/test`） | **0** | runner can start · executable present · **≠** Live UI suite green |
| `pnpm e2e:ui:isolated` | **`not_run:this_knife`** | full Live suite **not** run · authorize = minimal verify |

**CMD note**: Playwright lives under `apps/web`；sanctioned = `pnpm -C apps/web exec playwright …`（root `pnpm exec playwright` → not found）.

---

## Stance（rag-route post-prove）

1. **CR-A**：chromium binary **installed**（EXIT=0）— env gap closed at binary layer only  
2. **CR-B**：**Key set ≠ UI green** — still true；install alone **≠** UI covered  
3. **CR-C**：install authorized + executed after dual PASS + separate authorize  
4. **CR-D**：hard pins · R5 SEPARATE · Ban suite/G6/R5/UI/HA green  
5. Live `e2e:ui:isolated` = **`not_run:this_knife`** — **禁**把 smoke 写成 Live UI green  
6. Closing chromium install **alone ≠** G6 closed / ≠ R5 closed / ≠ suite green / ≠ R4 / ≠ 题域已隔离 / ≠ HA  
7. A′ honesty_red **retained** — **禁** rewrite Live honesty_red_key_set to green  
8. Experts = `mw-rag-route` + `mw-e2e-ha` only — **omit** `mw-model-op`

---

## Please answer（Q1–Q7）

1. harness/eval/slice 是否诚实登记 install+smoke EXIT=0，且 **install ≠ UI green ≠ G6/R5/suite/HA**？  
2. 是否同意：Live `e2e:ui:isolated` = **`not_run:this_knife`**；smoke ≠ Live suite green？  
3. 是否同意：**省略** `mw-model-op` 仍正确？  
4. 是否同意：**G6 仍 OPEN · R5 仍开（SEPARATE）· suite 未绿**；本刀 install 面仍 ≠ 全家关？  
5. 是否同意：A′ honesty_red / Key-set **retained** · **禁** rewrite to green？  
6. 是否同意：保持 `releaseEvidence=false`；禁 invent Key / HA / suite green / **Ban claiming R5 closed by this**？  
7. 是否同意：R5 pgvector-legacy / sole-stack **不**并入本刀（SEPARATE）？

Please write the conclusion to `reviews/2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md`. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass；实现方禁止自批  
- install/start ≠ suite / G6 / R5 / UI green / HA  
- **未**跑 Live `e2e:ui:isolated`；**未** invent Key；**未** rewrite A′ honesty_red  
- await post-prove dual expert reviews

---

*REQUEST · mw-rag-route · G7 chromium UI runner prereq post-prove · 2026-09-17 ~00:01 PT · executed:awaiting_post_prove_dual · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · install ≠ UI green · R5 SEPARATE · no invent Key*
