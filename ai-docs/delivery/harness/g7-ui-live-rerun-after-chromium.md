# Harness — G7 · **UI Live re-run after chromium**（`pnpm e2e:ui:isolated` · Key loader path）

**Status**: **`REQUEST-ready / not_run:pre_dual`**  
**Date**: 2026-09-17 ~00:05 PT · chromium CR **`post_prove_dual_pass`** · this knife = **docs REQUEST draft only** · **zero Live · zero install · zero coding · zero commit**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ family green** · **≠ covered** · **≠ 题域已隔离** · **≠ R2/R4 closed** · **sole ≠ retired** · **sole 恰 5** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **install/start ≠ suite/G6/R5/UI green** · **A′ honesty_red retained**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（REQUEST drafted · **awaiting** pre-exec dual · **no self-approve**）  
**Prior CR**: `harness/g7-chromium-ui-runner-prereq.md`（**`post_prove_dual_pass`** · version=0 · launch smoke=0 · Live **`not_run:this_knife`**）  
**Prior A′**: `harness/g7-key-live-x3.md`（`post_prove_dual_pass:honesty_red` · UI EXIT=1 chromium miss · **retained**）  
**Complement**: `harness/g6-e2e-iso-blocked.md`（G6 still OPEN）· R5 mark-red / pgvector-legacy = **SEPARATE**  
**Slice**: `../g7-ui-live-rerun-after-chromium.slice.md`  
**Eval**: `../eval/g7-ui-live-rerun-after-chromium.eval.md`  
**Authority**: meetwise — draft pre-exec dual for **authorized** UI Live re-run · execute **only after** dual PASS + separate authorize · **no invent Key**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Authorized **Key-loader-path** re-run of **`pnpm e2e:ui:isolated` only** after chromium runner prereq dual-closed |
| **What this knife is not** | Not suite green · not G6 closed · not R5 closed/retired · not HA · not full Key×3 trio · not HTTP `e2e:isolated` · not `verify:e2e-performance` · not chromium reinstall · not product code |
| **chromium prereq ≠ UI green** | CR `post_prove_dual_pass` = runner-prereq honesty only · **does not** make UI Live green |
| **Key set ≠ UI green** | Presence of Key **does not** imply UI family green · EXIT honesty required |
| **A′ honesty_red retained** | Prior Key-set UI EXIT=1（chromium miss）**not** rewritten green · fresh UI receipts supersede only after execute+post-prove |
| **R5 SEPARATE** | Default iso still **pgvector-legacy** / R5-MARKED-RED · UI Live alone **≠** R5 closed · **≠** sole cutover |
| **sole 恰 5** | Allowlist **恰 5** retained · this knife does **not** expand sole |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | **`REQUEST-ready / not_run:pre_dual`** · Ban fake green · **zero Live this prep** |

---

## 1. Scope（UI Live re-run only）

| ID | Gap class | Intent this knife | Close G6/R5 alone? |
|----|-----------|-------------------|--------------------|
| **UI-A** | Live UI deferred on CR knife | Run `pnpm e2e:ui:isolated` after chromium binary present | **否** |
| **UI-B** | Key loader discipline | `source …/load-model-api-key.sh` · NEW_SHELL_STATUS name-only · no invent Key | **否** |
| **UI-C** | EXIT honesty | Record EXIT · Ban fake green · EXIT=0 ≠ suite/G6/R5/HA | **否** |
| **UI-D** | Hard pins | chromium prereq ≠ UI green · A′ retained · R5 SEPARATE · sole 恰 5 · `releaseEvidence=false` | n/a |

**Out of scope**: full trio · HTTP iso · perf suite · R5 retirement · sole cutover · G1 flip · G6 close · inventing Key · claiming suite/UI green from chromium alone · product coding.

---

## 2. Evidence anchors

| Source | Observation |
|--------|-------------|
| CR post-prove BOTH PASS | `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-{e2e-ha,rag-route}.md` · install/version/smoke **0/0/0** · Live **`not_run:this_knife`** |
| A′ UI row | `harness/g7-key-live-x3.md` §2 · EXIT=**1** · chromium missing · Key set · **honesty_red retained** |
| `package.json` | `"e2e:ui:isolated": "node scripts/run-e2e-isolated.mjs e2e:ui"` |
| Key loader | `/home/box/.meetwise-secrets/load-model-api-key.sh`（ONLY authorized path） |
| G6 / R5 | G6 OPEN · R5 SEPARATE · sole 恰 5 |

---

## 3. Acceptance（pre-exec · M1–M7）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Exact CMD = `pnpm e2e:ui:isolated` only（not full trio） | **met（docs）** |
| **M2** | Key inject path documented · NEW_SHELL_STATUS name-only · no invent Key / no `.env*` | **met（docs）** |
| **M3** | Hard pins: chromium prereq ≠ UI green · Key set ≠ UI green · A′ retained · R5 SEPARATE · sole 恰 5 · Ban fake green · `releaseEvidence=false` | **met（docs）** |
| **M4** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M5** | Live run = **`not_run:pre_dual`** until dual PASS + meetwise execute authorize | **met** |
| **M6** | Gate: pre-exec dual ⇒ may execute ⇒ record EXIT ⇒ post-prove dual · no self-approve | **drafted** |
| **M7** | This prep: zero Live · zero install · zero coding · zero commit | **met** |

### CMD（planned · **not_run:pre_dual**）

| CMD | Role | Status | Honest read |
|-----|------|--------|-------------|
| `source /home/box/.meetwise-secrets/load-model-api-key.sh` | Authorized Key inject | **not_run:pre_dual** | ONLY path · never paste Key · never print value |
| NEW_SHELL_STATUS probe（name only） | Presence set/unset | **not_run:pre_dual** | Key set ≠ UI green |
| **`pnpm e2e:ui:isolated`** | Live UI suite | **`not_run:pre_dual`** | EXIT honesty required · Ban fake green |
| `pnpm e2e:isolated` / `verify:e2e-performance` | Other trio members | **out of scope** | R5/HTTP/suite remain SEPARATE / prior A′ |

---

## 4. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md` | **REQUEST drafted · awaiting** |
| pre-exec | `mw-rag-route` | `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md` | **REQUEST drafted · awaiting** |
| model-op | — | — | **omitted** |
| execute | — | after dual PASS + meetwise authorize | **not authorized yet** |
| post-prove | e2e-ha + rag-route | draft after execute | **n/a yet** |

---

## 5. Hard pins

- **chromium prereq ≠ UI green** · **install/start ≠ suite/G6/R5/UI green**  
- **Key set ≠ UI green** · **EXIT=0 ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA**  
- **A′ honesty_red retained** until fresh UI Live receipts + post-prove  
- **R5 isolated still SEPARATE** · UI Live ≠ R5 closed ≠ sole cutover ≠ G1 flip  
- **sole 恰 5** · `releaseEvidence=false` · **no invent Key** · never paste Key · never read `.env*`  
- **Ban fake green** · no self-approve · no `mw-model-op` unless proven need  
- **Ban claiming suite green / G6 closed / R5 closed / UI green / HA** from this prep alone

---

## 6. Execute sketch（after dual + authorize · not now）

```bash
# ONLY after pre-exec dual PASS + meetwise execute authorize
cd /workspace/meetwise
source /home/box/.meetwise-secrets/load-model-api-key.sh
if [ -n "${MODEL_API_KEY:-}" ]; then echo NEW_SHELL_STATUS=set; else echo NEW_SHELL_STATUS=unset; fi
pnpm e2e:ui:isolated ; echo "CMD=pnpm e2e:ui:isolated EXIT=$?"
# record EXIT · non-happy · never print Key · then post-prove dual
```

**Fail-closed**: if NEW_SHELL_STATUS=unset → **do not invent Key** · stop · report blocked.

---

*Harness · G7 UI Live re-run after chromium · 2026-09-17 ~00:05 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · chromium prereq ≠ UI green · Key set ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green · no invent Key*
