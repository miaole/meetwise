# Harness — G7-A′ · **live Key×3** hard-run（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）

**Status**: **`post_prove_dual_pass:honesty_red_key_set`**（Key **set** · EXIT **1/1/1** · post-prove dual **BOTH PASS** · honesty of red-with-Key-set · **≠** suite/family green）  
**Date**: 2026-09-16 ~23:57 PT · pre-exec dual **pass** · trio **executed** EXIT **1/1/1** · post-prove dual **BOTH PASS** · **no invent Key** · **never paste Key** · **no re-run**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed** · **≠ 题域已隔离** · **sole ≠ retired** · **R5-MARKED-RED independent of Key** · **Key set ≠ auto green** · **A unset honesty retained** · **chromium missing = separate prereq knife**  
**Experts**: `mw-e2e-ha` + `mw-rag-route`（pre-exec **pass** · post-prove **BOTH PASS**）  
**Slice**: `../g7-key-live-x3.slice.md`  
**Eval**: `../eval/g7-key-live-x3.eval.md`  
**Parent / prior**: G7-A Key-blocked×3 honesty · `harness/g7-key-blocked-x3-honesty.md`（**`post_change_dual_pass` · honesty for unset era · retained**）  
**Cross-link**: A′ live path executed with authorized Key loader · **A remains the unset-era honesty pin**（not deleted · not rewritten as green）  
**Complement**: `harness/g6-e2e-iso-blocked.md` · K3 G6 backlog cite · whitelist / inventory  
**Later A″**: `harness/g7-key-x3-rerun.md`（`post_prove_dual_pass:honesty_red` · dual on `e697c81` · fresh Key×3 row · **this A′ historical honesty_red_key_set retained** · **not** rewritten green）  
**Authority**: meetwise — Live Key×3 executed · post-prove dual **BOTH PASS** · **no self-approve** · **no re-run**

---

## 0. Stance（先读）

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | Live Key×3 family hard-run after pre-exec dual + meetwise execute authorize：`pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance` |
| **What this knife is not** | Not auto-green · not suite green · not G6 closed · not R2/R4 closed · not HA · not sole cutover · not product code · not chromium-prereq knife |
| **Prior A（Key-blocked×3）** | **`post_change_dual_pass` honesty** for **Key unset** era · remains valid unset-era pin · **not rewritten green** |
| **Key set** | **≠ auto green ≠ covered ≠ SLO/LOAD met ≠ HA** · presence alone **does not** close G6 · **≠** R2/R4/G6 closed |
| **EXIT=0** | **≠ suite green ≠ R2/R4/G6 closed ≠ family covered ≠ HA**（this run EXIT=**1/1/1**） |
| **This execute shell** | Name-only presence probe：**`NEW_SHELL_STATUS=set`** · authorized loader only · **no invent Key** · **no read `.env*`** · **never print value** |
| **Gate** | pre-exec dual **pass** ⇒ executed · post-prove dual **BOTH PASS** · status **`post_prove_dual_pass:honesty_red_key_set`** · ban invent success / invent Key · **no re-run** |
| **chromium missing** | Playwright binary missing on UI iso = **separate prereq knife** · **≠** this knife green · **≠** covered |

---

## 1. Exact scripts（from root `package.json` · 2026-09-16）

| CMD | Exact script | Underlying |
|-----|--------------|------------|
| **`pnpm e2e:isolated`** | `node scripts/run-e2e-isolated.mjs e2e:prove` | → `e2e:prove` = `node scripts/run-e2e.mjs`（LIVE HTTP · needs Key） |
| **`pnpm e2e:ui:isolated`** | `node scripts/run-e2e-isolated.mjs e2e:ui` | → `e2e:ui` = `node scripts/run-e2e-ui.mjs`（LIVE UI · needs Key） |
| **`pnpm verify:e2e-performance`** | `node scripts/run-e2e-performance-suite.mjs` | multi-step suite（includes `e2e:isolated` / `e2e:ui:isolated` / `performance:e2e:isolated` + mark-red leaves） |

---

## 2. EXECUTE receipts（2026-09-16 ~23:50–23:53 PT · repo root · Key **set** · **no re-run**）

**Presence probe（name only · never print value · never read `.env*`）**：`NEW_SHELL_STATUS=set`  
**Loader**：`source /home/box/.meetwise-secrets/load-model-api-key.sh`（ONLY authorized path）  
**Fail-closed discipline**: did **not** invent Key · did **not** paste Key · did **not** claim suite green · **Key set ≠ auto green** · **no re-run** after dual

| CMD | EXIT | Honesty read |
|-----|------|--------------|
| `pnpm e2e:isolated` | **1** | **fail** · Key **set** this shell · isolation **R5-MARKED-RED** pgvector-legacy · receipt `outcome=failed` `failureClass=api` · **≠ family green** · **≠ G6 closed** · **≠ covered** · **≠ sole** · R5 **independent of Key** |
| `pnpm e2e:ui:isolated` | **1** | **fail** · Key **set** · **R5-MARKED-RED** · Playwright chromium missing（`browserType.launch: Executable doesn't exist`）· `E2E_FAILURE class=frontend code=client_exited` · 18 failed · **≠ UI covered** · **≠ family green** · **chromium missing = separate prereq knife** |
| `pnpm verify:e2e-performance` | **1** | **fail** · suite stopped at HTTP full E2E（`e2e_performance_suite_failed:HTTP full E2E:exit=1`）· web build + migrate proofs EXIT=0 earlier · **suite EXIT≠0** · **≠ SLO** · **≠ LOAD** · **≠ HA** · **≠ suite green** |

**Receipt dir**：`.tmp/g7-key-live-x3-rerun-20260917-065057/`  
**LOCAL_E2E_RECEIPT（HTTP）**：`.tmp/e2e-receipts/2026-09-17T06-51-18-174Z-1282731-a5f210c1-2854-4cd9-8d6c-8f0c8ef94f8b.json`（`outcome=failed` · `failureClass=api` · `releaseEvidence=false`）  
**Suite receipt**：`.tmp/e2e-receipts/2026-09-17T06-51-54-323Z-1285055.json`（`failure=e2e_performance_suite_failed:HTTP full E2E:exit=1`）  
**Nested HTTP inside suite**：`.tmp/e2e-receipts/2026-09-17T06-53-11-853Z-1286447-fa61601d-9151-40c4-886d-deecad9b2fc4.json`

**NHP observed**: BOUND（Key set ≠ auto green）· R5（pgvector-legacy mark-red on iso · **independent of Key**）· PARTIAL（0/3 CMD green → no family covered）· G6 still **OPEN** · A unset-era honesty **retained** · UI blocked on missing Playwright browser binary（**separate prereq knife** · ≠ covered）

---

## 3. Inventory · Key / fixture honesty

| CMD | Key? | Fixture honesty | Honest post-run read |
|-----|------|-----------------|----------------------|
| `e2e:isolated` | **required** · **set** this shell | default isolation still **pgvector-legacy** → **R5 green-risk** | EXIT=1 · `failureClass=api` · ≠ covered · ≠ G6 closed · ≠ sole cutover · R5 **independent of Key** |
| `e2e:ui:isolated` | **required** · **set** this shell | same R5 risk + missing Playwright chromium | EXIT=1 · `client_exited` · ≠ UI covered · chromium = **separate prereq knife** |
| `verify:e2e-performance` | suite includes Key-gated steps | mark-red / R5 leaves inside suite | EXIT=1 · ≠ SLO ≠ LOAD ≠ HA ≠ suite green |

**Presence discipline**（every artefact）：

- Probe **only** shell name presence · **never** print / log / echo value · **never** read `.env*` · **never** paste Key · **never** commit secrets  
- This execute shell：**set** via authorized loader → still **honest red** receipts above · **no invent Key**  
- Key set ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA ≠ R2/R4/G6 closed

---

## 4. Acceptance（post-prove dual BOTH PASS · honesty of red-with-Key-set）

| ID | Criterion | False green if… |
|----|-----------|-----------------|
| **L1** | Trio CMDs exact names from `package.json` · all three **executed** | Invent alternate script names / soft-skip trio |
| **L2** | Status **`post_prove_dual_pass:honesty_red_key_set`** · EXIT table **1/1/1** exact · Key **set** · dual BOTH PASS | Narrate trio/suite green · claim covered |
| **L3** | **Key set ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** | Narrate “Key landed = family green” |
| **L4** | **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed** · here all EXIT=**1** | Collapse any EXIT → closed gates |
| **L5** | Non-happy recorded（R5 mark-red · api fail · UI client_exited · suite fail） | Happy-only narrative / invent success |
| **L6** | Gate：pre-exec dual pass ⇒ executed · post-prove dual **BOTH PASS** · no self-approve · **no re-run** | Implementer-authored suite green / confirmatory re-run as green |
| **L7** | Supersedes/unblocks **live path** of A · A unset-era honesty **retained** | Delete A / rewrite A as green |
| **L8** | `releaseEvidence=false` · never commit secrets · never paste Key · **no invent Key** | `releaseEvidence=true` / Key in docs |
| **L9** | **chromium missing = separate prereq knife** · **R5-MARKED-RED independent of Key** | Fold chromium/R5 into Key-set green or this-knife covered |

---

## 5. NHP columns（required · non-happy · ban fake-green）

| Col | This execute | False green if… |
|-----|--------------|-----------------|
| **NEG** | No family/suite green claimed despite Key set | Skip-as-pass / invent EXIT=0 |
| **FAULT** | No invent Key / no `.env*` / no Key in logs/docs | Soft-fail secrets |
| **BOUND** | Key **set** this shell → still EXIT=1（≠ auto green） | Treat Key-present as family green |
| **ADV** | No self-approve · post-prove dual **BOTH PASS**（honesty only） | Implementer-authored suite green |
| **PERF** | `verify:e2e-performance` EXIT=1 · ≠ **SLO** | Call suite green = online SLO |
| **LOAD** | suite / burst ≠ **LOAD capacity** | Call LOAD met |
| **PARTIAL** | all three EXIT=1 · ≠ family covered | One step green → trio covered |
| **R5** | **R5-MARKED-RED** on iso · **independent of Key** · ≠ sole / ≠ G6 closed | Call R5 retired / Key-cleared |
| **G6** | G6 / BUG-E2E-ISO **still OPEN** | Key live authorize = G6 closed |
| **chromium** | missing binary = **separate prereq knife** | Call UI covered / fold into this knife green |

---

## 6. CMD（frozen · **executed** · **no re-run**）

| CMD | EXIT | Run | Honest read |
|-----|------|-----|-------------|
| `pnpm e2e:isolated` | **1** | **executed** ~23:50–23:51 PT | R5-MARKED-RED · `failureClass=api` · ≠ G6 closed · R5 **independent of Key** |
| `pnpm e2e:ui:isolated` | **1** | **executed** ~23:51 PT | R5 + Playwright missing · `client_exited` · ≠ UI covered · chromium = **separate prereq knife** |
| `pnpm verify:e2e-performance` | **1** | **executed** ~23:51–23:53 PT | suite fail at HTTP E2E · ≠ SLO/LOAD/HA/suite green |
| Post-prove dual | — | **BOTH PASS** | `reviews/2026-09-16-g7-key-live-x3-post-prove-mw-{e2e-ha,rag-route}.md` · honesty of red-with-Key-set · **≠** suite/family green |

```bash
# Executed 2026-09-16 ~23:50–23:53 PT (receipts above) · DO NOT re-run:
# source /home/box/.meetwise-secrets/load-model-api-key.sh
# if [ -n "${MODEL_API_KEY:-}" ]; then echo NEW_SHELL_STATUS=set; else echo NEW_SHELL_STATUS=unset; fi
# → NEW_SHELL_STATUS=set
# pnpm e2e:isolated ; echo "CMD=pnpm e2e:isolated EXIT=$?"
# pnpm e2e:ui:isolated ; echo "CMD=pnpm e2e:ui:isolated EXIT=$?"
# pnpm verify:e2e-performance ; echo "CMD=pnpm verify:e2e-performance EXIT=$?"
```

---

## 7. Dual targets

| Stage | Expert | Path | Status |
|-------|--------|------|--------|
| pre-exec review | `mw-e2e-ha` | `reviews/2026-09-16-g7-key-live-x3-mw-e2e-ha.md` | **pass** |
| pre-exec review | `mw-rag-route` | `reviews/2026-09-16-g7-key-live-x3-mw-rag-route.md` | **pass** |
| post-prove REQUEST | `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g7-key-live-x3-post-prove-mw-e2e-ha.md` | Key-set refresh · **covered by review** |
| post-prove REQUEST | `mw-rag-route` | `reviews/REQUEST-2026-09-16-g7-key-live-x3-post-prove-mw-rag-route.md` | Key-set refresh · **covered by review** |
| post-prove review | `mw-e2e-ha` | `reviews/2026-09-16-g7-key-live-x3-post-prove-mw-e2e-ha.md` | **pass**（honesty of red-with-Key-set） |
| post-prove review | `mw-rag-route` | `reviews/2026-09-16-g7-key-live-x3-post-prove-mw-rag-route.md` | **pass**（honesty of red-with-Key-set） |

**Gate**: meetwise — status **`post_prove_dual_pass:honesty_red_key_set`** · EXIT **1/1/1** · Key **set** · post-prove dual **BOTH PASS** · **≠** suite/family green · **≠** G6 closed · **no self-approve** · **no re-run**.

---

## Hard pins（every artefact）

- **≠ suite green ≠ covered ≠ SLO/LOAD ≠ HA ≠ R2/R4/G6 closed**
- **Key set ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA**
- **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**（this run：all EXIT=**1**）
- **R5-MARKED-RED** pgvector-legacy **independent of Key** · sole ≠ retired · G6 OPEN
- **A unset honesty retained** · A′ live path ≠ family green
- **`releaseEvidence=false`**
- **chromium missing = separate prereq knife**
- **no invent Key** · never paste Key · never read `.env*` · never commit secrets
- **non-happy cases required** · **no inventing success without receipts** · **no re-run**
- Status **`post_prove_dual_pass:honesty_red_key_set`** · **≠** suite/family green · **≠** G6 closed · **≠** covered

---

*Harness · G7-A′ live Key×3 · 2026-09-16 ~23:57 PT · post_prove_dual_pass:honesty_red_key_set · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA · ≠ covered · ≠ suite/family green · G6 OPEN · R5-MARKED-RED independent · A unset honesty retained · chromium missing = separate prereq knife · no invent Key · no re-run*
