# REQUEST — G7 · **Key×3 re-run**（**post-prove**）→ mw-rag-route

**Status**: **`REQUEST / awaiting`**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-17 ~19:37 PT  
**Knife status**: **`executed:awaiting_post_prove_dual`** · frozen trio **re-executed** with Key **set** · EXIT **1/1/1** · **no invent / paste Key** · **no read `.env*`** · **no commit secrets**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ sole cutover** · **≠ R5 retired** · **≠ suite green** · **≠ R2/R4/G6 closed** · **Key set ≠ auto green**  
**Pair**: `REQUEST-2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md`  
**Hard**: Key present ≠ auto green ≠ covered ≠ SLO/LOAD met ≠ HA · EXIT=0 ≠ suite green ≠ R2/R4/G6 closed · R5 green-risk / sole ≠ retired / G6 OPEN retained · non-happy required · no inventing success without receipts · NEVER commit secrets; never paste Key · A unset-era + A′ historical honesty retained · **Ban implementer self-writing `post_prove_dual_pass`**

---

## Contra

| File | Role |
|------|------|
| `receipts/2026-09-17-g7-key-x3-rerun.md` | CMD+EXIT receipt · **`executed:awaiting_post_prove_dual`** |
| `harness/g7-key-live-x3.md` / `eval/g7-key-live-x3.eval.md` | Prior A′ · historical · **retained** |
| `harness/g7-key-blocked-x3-honesty.md` | Prior A unset-era · **retained** |
| `harness/g6-e2e-iso-blocked.md` | G6 **OPEN** · R5 risk |
| sole / R5 pins | sole ≠ retired · default pgvector → R5 green-risk |
| Receipt dir | `.tmp/g7-key-x3-rerun-20260917/` |

---

## Post-prove CMD+EXIT（实现方 · 2026-09-17 ~19:29–19:37 PT · 待专家复核）

**Presence probe（name only）**：`NEW_SHELL_STATUS=set` · authorized loader · **no invent Key** · never print value

| CMD | EXIT | RAG / sole / R5 诚实读法 |
|-----|------|--------------------------|
| **`pnpm e2e:isolated`** | **1** | Key **set** but still fail · **R5-MARKED-RED** pgvector-legacy · `failureClass=api` · ≠ RAG migrated · ≠ sole-stack · ≠ R5 retired · ≠ G6 closed |
| **`pnpm e2e:ui:isolated`** | **1** | Key **set** · same R5 risk · chromium **ran** · `client_exited` · **14 failed** · ≠ UI covered · ≠ sole cutover |
| **`pnpm verify:e2e-performance`** | **1** | suite fail at HTTP E2E · mark-red/R5 leaves retained · **≠ SLO** · **≠ LOAD** · **≠ HA** · **≠ suite green** · ≠ RAG migrated |

---

## Please answer（Q1–Q5）

1. Agree EXIT **1/1/1** with Key **set** retains **R5 green-risk / sole ≠ retired / G6 OPEN**（no uplift from Key presence alone）？  
2. Agree **Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** and **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**（here EXIT≠0 anyway）？  
3. Agree authorized Key loader only · **no invent Key** · **no read `.env*`** · A/A′ historical honesty **retained**？  
4. Agree `verify:e2e-performance` EXIT=1 still embeds mark-red / R5 leaves narrative · ≠ RAG migrated？  
5. Confirm post-prove dual required · ban self-approve / suite green / covered uplift / sole cutover claim · ban implementer flip to `post_prove_dual_pass`？

Please write the conclusion to `reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-rag-route.md`. **Ban** implementer writing pass.

---

## Non-claims

- Not pass · not family/suite green · not G6 closed · not R5 retired · not sole cutover · not R2/R4 closed · not SLO/LOAD/HA · not `releaseEvidence=true` · not auto-green from Key set · not `post_prove_dual_pass`（awaiting）

---

*REQUEST · mw-rag-route · G7 Key×3 re-run post-prove · 2026-09-17 ~19:37 PT · executed:awaiting_post_prove_dual · EXIT 1/1/1 · NEW_SHELL_STATUS=set · releaseEvidence=false · ≠HA*
