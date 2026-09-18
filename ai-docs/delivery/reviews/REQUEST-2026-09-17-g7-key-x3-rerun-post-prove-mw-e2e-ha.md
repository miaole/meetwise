# REQUEST — G7 · **Key×3 re-run**（**post-prove**）→ mw-e2e-ha

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 ~19:37 PT  
**Knife status**: **`executed:awaiting_post_prove_dual`** · frozen trio **re-executed** with Key **set** · EXIT **1/1/1** · **no invent / paste Key** · **no read `.env*`** · **no commit secrets**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed** · **Key set ≠ auto green** · **EXIT=0 ≠ suite green**（this run EXIT **1/1/1**）  
**Pair**: `REQUEST-2026-09-17-g7-key-x3-rerun-post-prove-mw-rag-route.md`  
**Hard**: Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA · EXIT=0 ≠ suite green ≠ R2/R4/G6 closed · non-happy required · no inventing success without receipts · post-prove dual required · NEVER commit secrets; never paste Key · A unset-era honesty retained · A′ historical honesty_red_key_set retained · R5-MARKED-RED retained · **Ban implementer self-writing `post_prove_dual_pass`**

---

## Contra

| File | Role |
|------|------|
| `receipts/2026-09-17-g7-key-x3-rerun.md` | CMD+EXIT receipt · **`executed:awaiting_post_prove_dual`** |
| `harness/g7-key-live-x3.md` / `g7-key-live-x3.slice.md` | Prior A′ Key-set honesty_red · historical · **retained** |
| `harness/g7-key-blocked-x3-honesty.md` | Prior A unset-era · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 **still OPEN** |
| `.tmp/g7-key-x3-rerun-20260917/` | full logs + EXIT txts |
| HEAD execute start | `7f6e3bd` |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-17 ~19:29–19:37 PT · 待专家核对）

**Presence probe（name only · never print value）**：`NEW_SHELL_STATUS=set` · authorized loader · **no invent Key**

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| `source …/load-model-api-key.sh` + NEW_SHELL_STATUS | **set** | ONLY authorized path · **Key set ≠ suite/family green** |
| **`pnpm e2e:isolated`** | **1** | Key **set** · **R5-MARKED-RED** pgvector-legacy · `outcome=failed` `failureClass=api` · **≠ family green ≠ covered ≠ G6 closed** |
| **`pnpm e2e:ui:isolated`** | **1** | Key **set** · chromium **ran** · **14 failed / 4 passed / 4 skipped** · `E2E_FAILURE class=frontend code=client_exited` · dominant `状态:ingested` timeout · **≠ UI green** |
| **`pnpm verify:e2e-performance`** | **1** | `e2e_performance_suite_failed:HTTP full E2E:exit=1` · **≠ SLO ≠ LOAD ≠ HA ≠ suite green** |

**NHP**：BOUND Key-set ≠ auto green · R5 mark-red · PARTIAL 0/3 · G6 OPEN · A/A′ historical honesty retained · no Key in logs/docs

**Receipts**：
- `ai-docs/delivery/receipts/2026-09-17-g7-key-x3-rerun.md`
- `.tmp/g7-key-x3-rerun-20260917/{01,02,03}-*.log` + `EXIT-*.txt`
- `.tmp/e2e-receipts/2026-09-18T02-29-59-002Z-2118492-9eddb196-69bb-4e0d-a36c-1f295517e47f.json`
- `.tmp/e2e-receipts/2026-09-18T02-37-14-146Z-2139209-c400f678-4442-4bd0-aca4-73ef9dac751a.json`

---

## Please answer（Q1–Q6）

1. Confirm EXIT table **1 / 1 / 1** and that **EXIT≠0 ≠ suite green ≠ family green ≠ covered**（even with Key **set**）？  
2. Agree this shell **`NEW_SHELL_STATUS=set`** via authorized loader only · **Key present ≠ auto green ≠ HA** · **no invent Key**？  
3. Agree **R5-MARKED-RED** / pgvector-legacy on iso · **G6 still OPEN** · **≠ sole cutover**？  
4. Agree `verify:e2e-performance` EXIT=1 ≠ SLO ≠ LOAD ≠ HA ≠ suite green？  
5. Agree Prior A unset-era + A′ historical honesty_red **retained**（not rewritten green）· this is a **fresh** Key×3 honesty row？  
6. Confirm implementer did **not** invent Key / paste Key / read `.env*` / commit secrets / self-approve · and **post-prove dual** is required（write review；ban implementer-authored pass / ban self-flip to `post_prove_dual_pass`）？

Please write the conclusion to `reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md`. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not family/suite green · not G6 closed · not R2/R4 closed · not SLO/LOAD/HA · not sole cutover · not `releaseEvidence=true` · not Key invented · not auto-green from Key presence · not `post_prove_dual_pass`（awaiting）

---

*REQUEST · mw-e2e-ha · G7 Key×3 re-run post-prove · 2026-09-17 ~19:37 PT · executed:awaiting_post_prove_dual · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA*
