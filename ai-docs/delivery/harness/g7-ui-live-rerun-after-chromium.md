# Harness — G7 · **UI Live re-run after chromium**（`pnpm e2e:ui:isolated` · Key loader path）

**Status**: **`post_prove_dual_pass:honesty_red`**（Key **set** · chromium **ran** · UI EXIT=**1** · post-prove dual **BOTH PASS** · honesty of red-with-chromium+Key · **≠** UI/suite/G6/R5/HA green）  
**Date**: 2026-09-17 ~00:21 PT · pre-exec dual **pass** · Live **executed** EXIT=**1** · post-prove dual **BOTH PASS** · **no invent Key** · **never paste Key** · **no re-run**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ R5 retired** · **≠ UI green** · **≠ family green** · **≠ covered** · **≠ 题域已隔离** · **≠ R2/R4 closed** · **sole ≠ retired** · **sole 恰 5** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **A′ honesty_red retained** · **R5 SEPARATE**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec **pass** · post-prove **BOTH PASS** · **no self-approve**）  
**Prior CR**: `harness/g7-chromium-ui-runner-prereq.md`（**`post_prove_dual_pass`** · version=0 · launch smoke=0 · Live **`not_run:this_knife`** on CR）  
**Prior A′**: `harness/g7-key-live-x3.md`（`post_prove_dual_pass:honesty_red_key_set` · UI EXIT=1 chromium miss · **retained** · **not** rewritten green）  
**Complement**: `harness/g6-e2e-iso-blocked.md`（G6 still OPEN）· R5 mark-red / pgvector-legacy = **SEPARATE**  
**Slice**: `../g7-ui-live-rerun-after-chromium.slice.md`  
**Eval**: `../eval/g7-ui-live-rerun-after-chromium.eval.md`  
**Receipt**: `../receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md`  
**Authority**: meetwise — UI Live executed · post-prove dual **BOTH PASS** · honesty of red-with-chromium+Key only · **no invent Key** · **Ban fake green**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Authorized **Key-loader-path** re-run of **`pnpm e2e:ui:isolated` only** after chromium runner prereq dual-closed · post-prove honesty of **EXIT=1 with chromium present + Key set** |
| **What this knife is not** | Not suite green · not G6 closed · not R5 closed/retired · not HA · not full Key×3 trio · not HTTP `e2e:isolated` · not `verify:e2e-performance` · not chromium reinstall · not product code · **not UI green** |
| **chromium prereq ≠ UI green** | CR `post_prove_dual_pass` = runner-prereq honesty only · **does not** make UI Live green |
| **chromium ran ≠ UI green** | This Live chromium **present & ran** · still EXIT=**1** · **≠** UI green |
| **Key set ≠ UI green** | Presence of Key **does not** imply UI family green · EXIT honesty required |
| **A′ honesty_red retained** | Prior Key-set UI EXIT=1（chromium miss）**not** rewritten green · this knife = **fresh** honesty row（ingest/status fail class） |
| **R5 SEPARATE** | Default iso still **pgvector-legacy** / R5-MARKED-RED · UI Live alone **≠** R5 closed · **≠** sole cutover |
| **sole 恰 5** | Allowlist **恰 5** retained · this knife does **not** expand sole |
| **MODEL-OP?** | **Not required** → **no** `mw-model-op` REQUEST |
| **Now** | **`post_prove_dual_pass:honesty_red`** · Ban fake green · **no re-run** |

---

## 1. Scope（UI Live re-run only）

| ID | Gap class | Intent this knife | Close G6/R5 alone? |
|----|-----------|-------------------|--------------------|
| **UI-A** | Live UI after CR | Run `pnpm e2e:ui:isolated` after chromium binary present | **否** |
| **UI-B** | Key loader discipline | `source …/load-model-api-key.sh` · NEW_SHELL_STATUS name-only · no invent Key | **否** |
| **UI-C** | EXIT honesty | Record EXIT=**1** · Ban fake green · EXIT≠0 ≠ suite/G6/R5/HA | **否** |
| **UI-D** | Hard pins | chromium ≠ UI green · A′ retained · R5 SEPARATE · sole 恰 5 · `releaseEvidence=false` | n/a |

**Out of scope**: full trio · HTTP iso · perf suite · R5 retirement · sole cutover · G1 flip · G6 close · inventing Key · claiming suite/UI green from chromium alone · product coding.

---

## 2. Evidence anchors

| Source | Observation |
|--------|-------------|
| CR post-prove BOTH PASS | `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-{e2e-ha,rag-route}.md` · install/version/smoke **0/0/0** · Live **`not_run:this_knife`** on CR |
| A′ UI row | `harness/g7-key-live-x3.md` §2 · EXIT=**1** · chromium miss · Key set · **honesty_red retained** |
| This Live | `receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md` · EXIT=**1** · NEW_SHELL_STATUS=**set** · 14 failed / 4 passed / 4 skipped · chromium **ran** |
| Raw | `.tmp/g7-ui-live-rerun-after-chromium-20260917-001117/` · `EXIT.txt` · full.log |
| Post-prove BOTH PASS | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-{e2e-ha,rag-route}.md` · **pass**（honesty of red-with-chromium+Key） |
| `package.json` | `"e2e:ui:isolated": "node scripts/run-e2e-isolated.mjs e2e:ui"` |
| Key loader | `/home/box/.meetwise-secrets/load-model-api-key.sh`（ONLY authorized path） |
| G6 / R5 | G6 OPEN · R5 SEPARATE · sole 恰 5 |

---

## 3. Acceptance（post-prove dual BOTH PASS · honesty of red-with-chromium+Key）

| ID | Criterion | Now |
|----|-----------|-----|
| **M1** | Exact CMD = `pnpm e2e:ui:isolated` only（not full trio） | **met** |
| **M2** | Key inject path · NEW_SHELL_STATUS=**set** name-only · no invent Key / no `.env*` | **met** |
| **M3** | Hard pins: chromium ≠ UI green · Key set ≠ UI green · A′ retained · R5 SEPARATE · sole 恰 5 · Ban fake green · `releaseEvidence=false` | **met** |
| **M4** | Experts = e2e-ha + rag-route only（no model-op） | **met** |
| **M5** | Live executed · EXIT=**1** · chromium **ran** · receipts match | **met** |
| **M6** | Gate: pre-exec dual ⇒ execute ⇒ record EXIT ⇒ post-prove dual · no self-approve | **met** → **`post_prove_dual_pass:honesty_red`** |
| **M7** | Ban UI/suite/G6/R5/HA green · Ban rewrite A′ honesty_red → green | **met** |

### CMD（executed · Key set · chromium ran · no re-run）

| CMD | Role | EXIT / Status | Honest read |
|-----|------|---------------|-------------|
| `source /home/box/.meetwise-secrets/load-model-api-key.sh` | Authorized Key inject | executed | ONLY path · never paste Key · never print value |
| NEW_SHELL_STATUS probe（name only） | Presence | **set** | Key set ≠ UI green |
| **`pnpm e2e:ui:isolated`** | Live UI suite | **EXIT=1** | 14 failed / 4 passed / 4 skipped · chromium **ran** · R5-MARKED-RED · `client_exited` · **≠** UI/suite/G6/R5/HA green |
| `pnpm e2e:isolated` / `verify:e2e-performance` | Other trio members | **out of scope** | R5/HTTP/suite remain SEPARATE / prior A′ |

---

## 4. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec | `mw-e2e-ha` | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md` | **pass** |
| pre-exec | `mw-rag-route` | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md` | **pass** |
| model-op | — | — | **omitted** |
| execute | meetwise | receipt + `.tmp/…-001117/` | **executed** · EXIT=**1** · NEW_SHELL_STATUS=**set** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md` | **pass**（honesty of red-with-chromium+Key） |
| post-prove | `mw-rag-route` | `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md` | **pass**（honesty of red-with-chromium+Key） |

---

## 5. Hard pins

- **≠ UI green · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA**  
- **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **Key set ≠ UI green**  
- **EXIT=1 ≠ UI green ≠ suite green ≠ G6 closed ≠ R5 closed ≠ HA**  
- **A′ honesty_red retained** · do **NOT** rewrite historical chromium-miss red → green  
- **R5 isolated still SEPARATE** · UI Live ≠ R5 closed ≠ sole cutover ≠ G1 flip  
- **sole 恰 5** · `releaseEvidence=false` · **no invent Key** · never paste Key · never read `.env*`  
- **Ban fake green** · no self-approve · no `mw-model-op` unless proven need  
- **Ban claiming suite green / G6 closed / R5 closed / UI green / HA**  
- This knife = **UI only**（≠ full trio）· **no re-run**

---

## 6. Execute record（done · no re-run）

```bash
# DONE 2026-09-17 ~00:11–00:17 PT · after pre-exec dual PASS + meetwise authorize
cd /workspace/meetwise
source /home/box/.meetwise-secrets/load-model-api-key.sh
if [ -n "${MODEL_API_KEY:-}" ]; then echo NEW_SHELL_STATUS=set; else echo NEW_SHELL_STATUS=unset; fi
pnpm e2e:ui:isolated ; echo "CMD=pnpm e2e:ui:isolated EXIT=$?"
# → NEW_SHELL_STATUS=set · EXIT=1 · recorded · post-prove dual BOTH PASS
```

**Fail-closed discipline**: did **not** invent Key · did **not** paste Key · did **not** claim UI/suite green · **Key set ≠ UI green** · **chromium ran ≠ UI green** · **no re-run** after dual.

---

*Harness · G7 UI Live re-run after chromium · 2026-09-17 ~00:21 PT · post_prove_dual_pass:honesty_red · EXIT=1 · NEW_SHELL_STATUS=set · chromium ran · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ UI green · Key set ≠ UI green · chromium ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green · no invent Key · no re-run*
