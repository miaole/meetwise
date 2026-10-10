# REQUEST — G7-A′ · **live Key×3** **post-prove** → mw-e2e-ha

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~23:53 PT)  
**Knife status**: **`executed:awaiting_post_prove_dual`** · frozen trio **re-executed** with Key **set** · EXIT **1/1/1** · **no invent / paste Key** · **no read `.env*`** · **no commit secrets**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed**  
**Pair**: `REQUEST-2026-09-16-g7-key-live-x3-post-prove-mw-rag-route.md`  
**前序 pre-exec**：`2026-09-16-g7-key-live-x3-mw-e2e-ha.md`（**pass**）· `2026-09-16-g7-key-live-x3-mw-rag-route.md`（**pass**）  
**Hard**: Key present ≠ auto green ≠ covered ≠ SLO/LOAD met ≠ HA · EXIT=0 ≠ suite green ≠ R2/R4/G6 closed · non-happy required · no inventing success without receipts · post-prove dual required · NEVER commit secrets; never paste Key · A unset-era honesty retained · R5-MARKED-RED retained

---

## Contra

| File | Role |
|------|------|
| `harness/g7-key-live-x3.md` | Canonical harness · **`executed:awaiting_post_prove_dual`** · EXIT table |
| `g7-key-live-x3.slice.md` | Slice index |
| `eval/g7-key-live-x3.eval.md` | Eval · CMD EXIT **1/1/1** · Key **set** |
| `harness/g7-key-blocked-x3-honesty.md` | Prior **A** · unset-era honesty · **`post_change_dual_pass`** · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 blocked honesty · G6 **still OPEN** |
| Pre-exec reviews | both **pass** · authorize execute landed |
| Receipt dir | `.tmp/g7-key-live-x3-rerun-20260917-065057/` |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-16 ~23:50–23:53 PT · 待专家复核）

**Presence probe（name only · never print value）**：`NEW_SHELL_STATUS=set` · authorized loader · **no invent Key** · last4 cite only if already in meetwise msg（WSvY）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm e2e:isolated`** | **1** | **fail** · Key **set** · isolation **R5-MARKED-RED** pgvector-legacy · receipt `outcome=failed` `failureClass=api` · **≠ family green** · **≠ covered** · **≠ G6 closed** |
| **`pnpm e2e:ui:isolated`** | **1** | **fail** · Key **set** · **R5-MARKED-RED** · Playwright chromium missing · `E2E_FAILURE class=frontend code=client_exited` · 18 failed · **≠ UI covered** · **≠ family green** |
| **`pnpm verify:e2e-performance`** | **1** | **fail** · `e2e_performance_suite_failed:HTTP full E2E:exit=1` · earlier web build + migrate proofs EXIT=0 but **suite EXIT≠0** · **≠ SLO** · **≠ LOAD** · **≠ HA** · **≠ suite green** |

**NHP**：BOUND Key-set ≠ auto green · R5 mark-red · PARTIAL 0/3 · G6 OPEN · A unset honesty retained · no Key in logs/docs · UI env gap（Playwright binary）≠ covered

**Receipts**：
- `.tmp/g7-key-live-x3-rerun-20260917-065057/{01,02,03}-*.log` + `EXIT-*.txt`
- `.tmp/e2e-receipts/2026-09-17T06-51-18-174Z-1282731-a5f210c1-2854-4cd9-8d6c-8f0c8ef94f8b.json`
- `.tmp/e2e-receipts/2026-09-17T06-51-54-323Z-1285055.json`
- `.tmp/e2e-receipts/2026-09-17T06-53-11-853Z-1286447-fa61601d-9151-40c4-886d-deecad9b2fc4.json`

---

## Please answer（Q1–Q6）

1. Confirm exact EXIT table **1 / 1 / 1** and that **EXIT≠0 ≠ suite green ≠ family green ≠ covered**（even with Key **set**）？  
2. Agree this shell **`NEW_SHELL_STATUS=set`** via authorized loader only · **Key present ≠ auto green ≠ HA** · **no invent Key**？  
3. Agree **R5-MARKED-RED** / pgvector-legacy on iso runs · **G6 still OPEN** · **≠ sole cutover**？  
4. Agree `verify:e2e-performance` EXIT=1 ≠ SLO ≠ LOAD ≠ HA ≠ suite green？  
5. Agree Prior A unset-era honesty **retained**（not rewritten green）· A′ only executed live path with honest non-happy receipts？  
6. Confirm implementer did **not** invent Key / paste Key / read `.env*` / commit secrets / self-approve · and **post-prove dual** is required（write review；ban implementer-authored pass）？

请写入 `reviews/2026-09-16-g7-key-live-x3-post-prove-mw-e2e-ha.md`（refresh for this Key-set re-run）。**禁止**实现方代写 pass。

---

## Non-claims

- Not pass · not family/suite green · not G6 closed · not R2/R4 closed · not SLO/LOAD/HA · not sole cutover · not `releaseEvidence=true` · not Key invented · not auto-green from Key presence

---

*REQUEST · mw-e2e-ha · G7-A′ live Key×3 post-prove · 2026-09-16 ~23:53 PT · executed:awaiting_post_prove_dual · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA*
