# Harness — G7 · **chromium / UI runner prerequisite**（**`post_prove_dual_pass`**）

**Status**: **`post_prove_dual_pass`**（runner-prereq honesty only）  
**Date**: 2026-09-17 ~00:05 PT · pre-exec dual **pass** both domains · meetwise **authorize install+minimal verify** · install+smoke **executed** · post-prove dual **BOTH PASS**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ family green** · **≠ covered** · **≠ 题域已隔离** · **≠ R2/R4 closed** · **sole ≠ retired** · **sole 恰 5** · **Key set ≠ UI green** · **install/start ≠ suite/G6/R5/UI green**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec **pass** · post-prove **BOTH PASS** · **no self-approve**）  
**Parent**: G7-A′ live Key×3 · `harness/g7-key-live-x3.md`（`post_prove_dual_pass:honesty_red` · EXIT **1/1/1** · **retained**）· `harness/g6-e2e-iso-blocked.md`（G6 still OPEN）· R5 mark-red / pgvector-legacy = **SEPARATE knife**  
**Slice**: `../g7-chromium-ui-runner-prereq.slice.md`  
**Eval**: `../eval/g7-chromium-ui-runner-prereq.eval.md`  
**Receipt**: `../receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` · `.tmp/g7-chromium-ui-runner-prereq-20260917/`  
**Next**: `../g7-ui-live-rerun-after-chromium.slice.md` · authorized `pnpm e2e:ui:isolated` re-run · **`REQUEST-ready / not_run:pre_dual`**  
**Authority**: meetwise — **authorized** install + verify runner can start after dual PASS · **full Live×3 / e2e:ui:isolated NOT required this knife** · **no invent Key**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Install Playwright chromium + minimal runner-start verify after A′ Key-set UI fail on missing browser binary |
| **What this knife is not** | Not suite green · not G6 closed · not R5 closed/retired · not HA · not UI green · not family covered · not Live Key re-run · not product code · **not** R5 pgvector-legacy knife（**SEPARATE**） |
| **Key set ≠ UI green** | Presence of Key **does not** imply UI family green；install alone still **≠** UI green |
| **Install/start ≠ suite/G6/R5/UI/HA** | Install EXIT=0 + launch smoke EXIT=0 **≠** suite green · **≠** G6 closed · **≠** R5 closed · **≠** HA · **≠** UI green |
| **R5 SEPARATE** | Default isolation still **pgvector-legacy** / R5-MARKED-RED = **orthogonal** knife · **do not claim R5 closed by this** |
| **A′ honesty_red retained** | Do **NOT** rewrite Live honesty_red_key_set to green |
| **sole 恰 5** | Allowlist **恰 5** retained · this knife does **not** expand sole |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | **`post_prove_dual_pass`** · post-prove BOTH PASS · Live UI still **`not_run:this_knife`** · next knife = UI Live re-run |

---

## 1. Scope（chromium / UI runner prereq）

| ID | Gap class | Intent this knife | Close G6/R5 alone? |
|----|-----------|-------------------|--------------------|
| **CR-A** | Playwright chromium binary missing | Install binary so UI runner can launch | **否** |
| **CR-B** | UI runner prereq inventory | UI LIVE path needs Key **and** browser binary · Key alone insufficient | **否** |
| **CR-C** | Install authorized + executed | Install + minimal smoke after dual PASS + separate authorize | **否** |
| **CR-D** | Hard pins | ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA · Key set ≠ UI green · install/start ≠ UI green · `releaseEvidence=false` · no invent Key · R5 SEPARATE · sole 恰 5 · A′ retained | n/a |

**Out of scope this knife**: closing G6 / BUG-E2E-ISO · closing R5 / retiring pgvector-legacy · sole cutover · G1 flip · inventing Key · Live re-run of trio · product app coding · claiming suite/UI green after install alone.

**Sibling still open（SEPARATE）**:
- **R5** pgvector-legacy / mark-red / sole-stack（**not** closed by this knife）
- **G6** BUG-E2E-ISO（still OPEN · needs sole full re-run + inventory）
- **A′** HTTP `e2e:isolated` api fail + suite fail（orthogonal red faces · not this install knife）
- **Next** UI Live re-run after chromium（separate REQUEST pair · Key loader path · `e2e:ui:isolated` only）

---

## 2. Evidence anchors

| Source | Observation |
|--------|-------------|
| `harness/g7-key-live-x3.md` §2 | Prior A′ `pnpm e2e:ui:isolated` EXIT=**1** · Key **set** · Playwright chromium missing · `client_exited` · 18 failed · ≠ UI covered · **honesty_red retained** |
| Pre-exec dual | `reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md` + `…-mw-rag-route.md` · **pass**（docs gate only） |
| meetwise authorize | Install + verify runner can start · full Live×3 **not** required |
| This receipt | `.tmp/g7-chromium-ui-runner-prereq-20260917/` · `receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` |
| Post-prove dual | `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-{e2e-ha,rag-route}.md` · **BOTH PASS** · version=**0** · launch smoke=**0** · Live **`not_run:this_knife`** |
| `harness/g6-e2e-iso-blocked.md` | UI in LIVE Set · G6 still OPEN；fixture R5 orthogonal |

---

## 3. Acceptance（M1–M6）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Harness names chromium / UI runner prereq remaining（CR-A–D）from A′ Key-set UI EXIT=1 | **met** |
| **M2** | Hard pins: ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA · Key set ≠ UI green · install/start ≠ UI green · `releaseEvidence=false` · no invent Key · R5 SEPARATE · sole 恰 5 · A′ retained | **met** |
| **M3** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M4** | Install / minimal verify CMD **executed** · receipts recorded | **met（executed）** |
| **M5** | Install gate cleared by dual PASS + separate authorize · install+smoke done | **met（authorized+executed）** |
| **M6** | Post-prove dual **BOTH PASS** · no self-approve · Live still **`not_run:this_knife`** | **`post_prove_dual_pass`** |

### CMD（executed · 2026-09-17 ~00:01 PT · expert-verified ~00:04 PT）

| CMD | Role | EXIT | Status / honest read |
|-----|------|------|----------------------|
| **`pnpm -C apps/web exec playwright install chromium`** | Install UI runner browser binary（sanctioned equiv；Playwright under `apps/web`） | **0** | Chromium v1228 installed · **≠** UI green · **≠** G6/R5/suite/HA |
| `pnpm -C apps/web exec playwright --version` | CLI present | **0** | `Version 1.61.1` · experts independent **0** |
| chromium.launch headless smoke（`@playwright/test`） | Runner can start / executable present | **0** | `chromium_launch_smoke_ok` · experts independent **0** · **≠** `e2e:ui:isolated` green |
| `pnpm e2e:ui:isolated` | Full Live UI suite | **`not_run:this_knife`** | Authorize = minimal verify only · **no** Live×3 this knife · deferred to next |
| Prior A′ `pnpm e2e:ui:isolated` | Evidence of chromium miss | EXIT=**1**（Key set · prior） | **≠** UI green · **≠** rewritten to green · **honesty_red retained** |

**Note**: Install EXIT=0 + smoke EXIT=0 **≠** UI green ≠ G6 closed ≠ R5 closed ≠ suite green ≠ HA. Later UI EXIT=0 still **≠** G6 closed（sole full re-run）· still **≠** R5 closed（fixture SEPARATE）.

**CMD note**: Root `pnpm exec playwright` → `Command "playwright" not found`. Project-sanctioned path = `pnpm -C apps/web exec playwright …`（`@playwright/test@1.61.1`）.

---

## 4. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md` → `reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md` | **pass**（docs gate） |
| pre-exec | `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md` → `reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md` | **pass**（docs gate） |
| model-op | — | — | **omitted** |
| post-prove | `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md` → `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md` | **pass** |
| post-prove | `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md` → `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-rag-route.md` | **pass** |

---

## 5. Hard pins

- **install/start ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA ≠ UI green**  
- **Key set ≠ UI green** · **A′ honesty_red retained** · **do NOT rewrite Live honesty_red_key_set to green**  
- **R5 pgvector-legacy is SEPARATE knife** — **do not claim closed by this**  
- **sole 恰 5** · allowlist not expanded  
- `releaseEvidence=false` · no self-approve · **no invent Key** · never paste Key · never read `.env*`  
- **`e2e:ui:isolated` = `not_run:this_knife`** · full Live×3 **not** claimed  
- no `mw-model-op` REQUEST unless domain need proven  
- **Ban claiming suite green / G6 closed / R5 closed / UI green / HA**  
- chromium prereq **`post_prove_dual_pass` ≠ UI green** · next knife drafts authorized Live UI re-run only

---

## 6. Code / runner anchors

| Path | Role |
|------|------|
| `scripts/run-e2e-ui.mjs` | UI runner entry（Playwright） |
| `apps/web/package.json` · `@playwright/test@^1.61.1` | Playwright dependency home |
| `package.json` · `e2e:ui` / `e2e:ui:isolated` | Exact CMD names |
| `~/.cache/ms-playwright/chromium-1228` | Installed chromium（this env） |
| `harness/g7-key-live-x3.md` | Prior honesty_red receipt of chromium miss · **retained** |
| `harness/g6-e2e-iso-blocked.md` | LIVE UI Set · G6 OPEN |
| R5 / sole / G1 docs | **SEPARATE** — not this knife's close surface |
| `g7-ui-live-rerun-after-chromium.*` | **Next** · UI Live re-run REQUEST · Key loader path |

---

## 7. Closed（2026-09-17 ~00:05 PT · post_prove_dual_pass）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm -C apps/web exec playwright install chromium` | **0** | binary installed · **≠** UI/suite/G6/R5/HA green |
| `pnpm -C apps/web exec playwright --version` | **0** | `Version 1.61.1` · experts **0** |
| chromium.launch smoke（`@playwright/test`） | **0** | runner can start · experts **0** · **≠** Live UI suite green |
| `pnpm e2e:ui:isolated` | **`not_run:this_knife`** | deferred → next knife |
| Docs status | updated | harness/eval/slice → **`post_prove_dual_pass`** |
| Post-prove dual | **BOTH PASS** | e2e-ha + rag-route · **no self-approve** |

**Hard pins retained**: install/start ≠ suite green ≠ G6 closed ≠ R5 closed ≠ UI green ≠ HA · Key set ≠ UI green · R5 SEPARATE · A′ honesty_red retained · sole 恰 5 · `releaseEvidence=false` · no invent Key · no self-approve

---

*Harness · G7 chromium / UI runner prereq · 2026-09-17 ~00:05 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · install/start ≠ suite/G6/R5/UI green · R5 SEPARATE · A′ honesty_red retained · sole 恰 5 · no invent Key · Live UI not_run:this_knife*
