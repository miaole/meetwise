# Eval — G7 · **chromium / UI runner prerequisite**（**`post_prove_dual_pass`**）

**Date**: 2026-09-17 ~00:05 PT  
**run-status**: **`post_prove_dual_pass`** · install+minimal smoke **executed** · Live `e2e:ui:isolated` **`not_run:this_knife`** · post-prove dual **BOTH PASS** · **no self-approve**  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **Key set ≠ UI green** · **install/start ≠ suite/G6/R5/UI green** · **no invent Key** · **R5 pgvector-legacy SEPARATE** · **A′ honesty_red retained** · **sole 恰 5**  
**Harness**: `ai-docs/delivery/harness/g7-chromium-ui-runner-prereq.md`  
**Slice**: `ai-docs/delivery/g7-chromium-ui-runner-prereq.slice.md`  
**Receipt**: `ai-docs/delivery/receipts/2026-09-17-g7-chromium-ui-runner-prereq.md` · `.tmp/g7-chromium-ui-runner-prereq-20260917/`  
**Prior A′**: `harness/g7-key-live-x3.md` · UI EXIT=1 · chromium missing · Key set · honesty_red **retained**（**not** rewritten to green）  
**Dual**: pre-exec **pass** both · post-prove **BOTH PASS** · no self-approve  
**Next**: `g7-ui-live-rerun-after-chromium.*` · **`REQUEST-ready / not_run:pre_dual`**

---

## 1. Purpose

Expert **post-prove** checklist for **chromium / UI runner prereq** after authorized install + minimal runner-start verify.  
**Ban**: treating install/smoke as UI green · treating install as G6/R5/suite close · rewriting A′ honesty_red Key-set to green · inventing Key · self-approve · claiming R5 closed by this knife · claiming Live suite green without running it · expanding sole beyond 恰 5.

---

## 2. Execution record

| CMD / action | Expected | Actual | Read |
|--------------|----------|--------|------|
| Prior A′ `pnpm e2e:ui:isolated` | honesty of red | EXIT=**1** · Key **set** · chromium missing · `client_exited` | ≠ UI green · **retained** |
| Pre-exec dual（e2e-ha + rag-route） | pass docs gate | **pass** both | ≠ install auto-authorize（needed separate authorize） |
| meetwise authorize install+verify | authorize | **authorized** | minimal verify · Live suite not required |
| `pnpm -C apps/web exec playwright install chromium` | 0 | **0** | binary installed · **≠** UI/suite/G6/R5/HA green |
| `pnpm -C apps/web exec playwright --version` | 0 | **0** · experts independent **0** | `Version 1.61.1` |
| chromium.launch headless smoke（`@playwright/test`） | 0 | **0** · experts independent **0** | runner can start · **≠** Live UI green |
| Live `pnpm e2e:ui:isolated` | n/a this knife | **`not_run:this_knife`** | authorize = minimal verify only |
| Implementer self-sign pass | **ban** | **not done** | experts write reviews/ |
| Post-prove dual | BOTH PASS | **BOTH PASS** | e2e-ha + rag-route · runner-prereq honesty only |

---

## 3. Eval cases ↔ harness

| ID | Eval point | Close G6? | Close R5? | UI green? |
|----|------------|-----------|-----------|-----------|
| E1 / CR-A | Chromium missing → install EXIT=0 | 否 | 否 | 否 |
| E2 / CR-B | Key set ≠ UI green · UI needs Key **and** browser binary | 否 | 否 | 否 |
| E3 / CR-C | Install gated cleared · dual PASS + separate authorize · executed | 否 | 否 | n/a |
| E4 / CR-D | ≠ suite green · ≠ G6 · ≠ R5 · ≠ HA · R5 SEPARATE · no invent Key · install/start ≠ UI green · sole 恰 5 · A′ retained | 否 | 否 | 否 |
| E5 | Experts = e2e-ha + rag-route only（no model-op） | n/a | n/a | n/a |
| E6 | Live suite `not_run:this_knife` · no invent Key · no self-approve | n/a | n/a | 否 |
| E7 | `releaseEvidence=false` · Ban suite/G6/R5/UI green / HA · post-prove BOTH PASS | 否 | 否 | 否 |

---

## 4. Fake-green checklist（post-prove · closed）

- [x] Did not treat install EXIT=0 / smoke EXIT=0 as UI green / suite green / G6 closed  
- [x] Did not rewrite A′ honesty_red / Key-set Live UI to green  
- [x] Did not treat this knife as R5 closed / R5 retired / sole cutover  
- [x] Did not invent Key / read `.env*` / claim Live `e2e:ui:isolated` run this knife  
- [x] Did not invent suite EXIT / self-approve / claim G6 closed  
- [x] Agree R5 pgvector-legacy remains **SEPARATE** open knife  
- [x] `releaseEvidence=false` · ≠HA · no model-op · sole 恰 5  
- [x] Agree install/start ≠ suite green ≠ G6/R5 closed ≠ UI green ≠ HA  
- [x] Post-prove dual BOTH PASS · status **`post_prove_dual_pass`**（runner-prereq honesty only）

---

## 5. Expert confirm（post-prove · BOTH PASS）

1. Agree install EXIT=0 + launch smoke EXIT=0 = **runner prereq met**（≠ UI green · ≠ suite green · ≠ G6 closed · ≠ R5 closed · ≠ HA）? → **YES**（both domains）  
2. Agree **Key set ≠ UI green** retained · A′ honesty_red **not** rewritten? → **YES**  
3. Agree Live `e2e:ui:isolated` = **`not_run:this_knife`** · authorize did **not** require full Live×3? → **YES**  
4. Agree **R5 pgvector-legacy is SEPARATE** · this knife **must not** claim R5 closed? → **YES**  
5. Agree **no** invent Key · no self-approve · `releaseEvidence=false` · Ban suite/G6/R5/UI green / HA · sole 恰 5? → **YES**

---

*Eval · G7 chromium UI runner prereq · 2026-09-17 (~00:05 PT) · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6 closed · ≠ R5 closed · Key set ≠ UI green · install/start ≠ suite/G6/R5/UI green · R5 SEPARATE · A′ honesty_red retained · sole 恰 5 · no invent Key · Live not_run:this_knife*
