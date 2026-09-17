# Eval — G7 · **UI Live re-run after chromium**（**`post_prove_dual_pass:honesty_red`**）

**Date**: 2026-09-17 ~00:21 PT  
**run-status**: **`post_prove_dual_pass:honesty_red`** · Live `e2e:ui:isolated` **EXIT=1** · NEW_SHELL_STATUS=**set** · chromium **ran** · post-prove dual **BOTH PASS**（honesty of red-with-chromium+Key）· **no invent Key** · **no re-run** · **no self-approve**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **Key set ≠ UI green** · **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **A′ honesty_red retained** · **sole 恰 5** · **R5 SEPARATE** · **Ban fake green**  
**Harness**: `ai-docs/delivery/harness/g7-ui-live-rerun-after-chromium.md`  
**Slice**: `ai-docs/delivery/g7-ui-live-rerun-after-chromium.slice.md`  
**Receipt**: `ai-docs/delivery/receipts/2026-09-17-g7-ui-live-rerun-after-chromium.md`  
**Prior CR**: `harness/g7-chromium-ui-runner-prereq.md` · **`post_prove_dual_pass`** · Live **`not_run:this_knife`** on CR  
**Prior A′**: `harness/g7-key-live-x3.md` · UI EXIT=1 · honesty_red **retained**  
**Dual**: pre-exec **pass** · execute **done** · post-prove **BOTH PASS**

**Pre-exec reviews（pass）**：

- `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-e2e-ha.md`
- `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-mw-rag-route.md`

**Post-prove reviews（BOTH PASS · honesty of red-with-chromium+Key）**：

- `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md`
- `reviews/2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`

**Post-prove REQUEST**：

- `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-17-g7-ui-live-rerun-after-chromium-post-prove-mw-rag-route.md`

---

## 1. Purpose

Expert **post-prove** checklist **closed** for authorized **`pnpm e2e:ui:isolated`** re-run after chromium dual-closed.  
**Ban**: treating CR install/smoke / chromium ran as UI green · inventing Key · claiming suite/G6/R5/HA green · rewriting A′ honesty_red without fresh receipts · expanding sole beyond 恰 5 · fake green · self-approve.

---

## 2. Execution record（executed · EXIT=1 · no re-run）

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| CR post-prove dual | BOTH PASS | **BOTH PASS** | runner-prereq honesty only · **≠** UI green |
| A′ prior UI | honesty_red | EXIT=**1** · chromium miss · Key set | **retained** |
| Key inject | authorized loader only | **set** · name-only | `source …/load-model-api-key.sh` · **no invent Key** |
| NEW_SHELL_STATUS probe | name only | **set** | never print value · Key set ≠ UI green |
| `pnpm e2e:ui:isolated` | after dual+authorize | **EXIT=1** | 14 failed / 4 passed / 4 skipped · chromium **ran** · R5-MARKED-RED · `client_exited` |
| Pre-exec dual | pass | **pass** | e2e-ha + rag-route |
| Post-prove dual | pass（honesty of red） | **BOTH PASS** | honesty of red-with-chromium+Key · **≠** UI green |
| Implementer self-sign / invent green | **ban** | **not done** | Ban fake green |

---

## 3. Eval cases ↔ harness

| ID | Eval point | Close G6? | Close R5? | UI green? |
|----|------------|-----------|-----------|-----------|
| E1 / UI-A | Scope = `e2e:ui:isolated` only after CR dual-closed · executed | 否 | 否 | **否**（EXIT=1） |
| E2 / UI-B | Key loader + NEW_SHELL_STATUS=set · no invent Key | 否 | 否 | 否 |
| E3 / UI-C | EXIT=1 honesty · Ban fake green · EXIT≠0 ≠ suite/G6/R5/HA | 否 | 否 | **否** |
| E4 / UI-D | chromium ≠ UI green · A′ retained · R5 SEPARATE · sole 恰 5 | 否 | 否 | 否 |
| E5 | Experts = e2e-ha + rag-route only（no model-op） | n/a | n/a | n/a |
| E6 | Live executed · post-prove dual BOTH PASS · status honesty_red | n/a | n/a | 否 |
| E7 | `releaseEvidence=false` · Ban suite/G6/R5/UI/HA green | 否 | 否 | 否 |

---

## 4. Fake-green checklist（post-prove · **PASS retained**）

- [x] Did not treat CR install/smoke / `post_prove_dual_pass` as UI green  
- [x] Did not treat chromium **ran** as UI green（EXIT still 1）  
- [x] Did not rewrite A′ honesty_red Key-set UI to green  
- [x] Did not invent Key / read `.env*` / claim suite/G6/R5/HA green  
- [x] Did not fold R5 / sole / G6 / suite close into this UI-only knife  
- [x] Agree sole 恰 5 · R5 SEPARATE · `releaseEvidence=false` · Ban fake green  
- [x] Agree Key inject path = authorized loader only · NEW_SHELL_STATUS name-only  
- [x] Agree no model-op · no self-approve · post-prove dual BOTH PASS · **no re-run**

---

## 5. Expert confirm（post-prove · **PASS**）

1. Confirm EXIT：**NEW_SHELL_STATUS=set** · **`pnpm e2e:ui:isolated` EXIT=1** · **≠** UI/suite/G6/R5/HA green？ → **yes**  
2. Agree **chromium prereq ≠ UI green** · **chromium ran ≠ UI green** · **Key set ≠ UI green**？ → **yes**  
3. Agree **A′ honesty_red retained** · do **not** rewrite historical chromium-miss red → green？ → **yes**  
4. Agree **R5 SEPARATE** · sole 恰 5 · G6 OPEN · this knife ≠ full trio · `releaseEvidence=false` · no invent Key？ → **yes**  
5. Agree status **`post_prove_dual_pass:honesty_red`** · no self-approve · **no re-run**？ → **yes**

---

## 6. Gate（meetwise · post-prove dual BOTH PASS）

1. Pre-exec dual **pass**（both domains）✅  
2. ⇒ **may execute**（meetwise authorize · UI Live）✅  
3. Record fresh CMD+EXIT（incl. non-happy）✅ — EXIT=**1** · Key **set** · chromium **ran**  
4. ⇒ **post-prove dual** ✅ — both **pass**（honesty of red-with-chromium+Key）· status **`post_prove_dual_pass:honesty_red`**  
5. Ban invent success / invent Key · `releaseEvidence=false` ✅ · **no re-run** ✅

---

*Eval · G7 UI Live re-run after chromium · 2026-09-17 (~00:21 PT) · post_prove_dual_pass:honesty_red · EXIT=1 · NEW_SHELL_STATUS=set · chromium ran · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ UI green · Key set ≠ UI green · chromium ≠ UI green · A′ honesty_red retained · sole 恰 5 · R5 SEPARATE · Ban fake green · no invent Key · no re-run*
