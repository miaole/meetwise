# REQUEST — G7-A′ · **live Key×3** hard-run prep（pre-exec）→ mw-e2e-ha

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~23:16 PT)  
**Knife status**: **`REQUEST-ready / not_run:pre_dual`** · **no live e2e** · **no product code** · **no commit** · **no invent / paste Key** · **no read `.env*`**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ family green** · **≠ suite green** · **≠ SLO** · **≠ LOAD** · **≠ R2/R4/G6 closed**  
**Pair**: `REQUEST-2026-09-16-g7-key-live-x3-mw-rag-route.md`  
**Hard**: Key present ≠ auto green ≠ covered ≠ SLO/LOAD met ≠ HA · EXIT=0 ≠ suite green ≠ R2/R4/G6 closed · non-happy required · no inventing success without receipts · post-prove dual required after run · meetwise pre-auth: dual pass ⇒ may execute; then post-prove dual · NEVER commit secrets; never paste Key

---

## Contra

| File | Role |
|------|------|
| `harness/g7-key-live-x3.md` | Canonical harness（this knife） |
| `g7-key-live-x3.slice.md` | Slice index |
| `eval/g7-key-live-x3.eval.md` | Eval stub · CMD all `not_run:pre_dual` |
| `harness/g7-key-blocked-x3-honesty.md` | Prior **A** · unset-era honesty · **`post_change_dual_pass`** · **superseded for live path only** |
| `g7-honesty-knives.slice.md` | Parent honesty knives · A dual-closed honesty ≠ suite green |
| `harness/g6-e2e-iso-blocked.md` | G6 blocked honesty · G6 **still OPEN** |
| `e2e-live-targets-whitelist.md` / inventory | LIVE Set · trio packaging |

---

## Stance（E2E-HA）

This knife **drafts** pre-exec acceptance for the **live Key×3** family now that Key is available for authorize path:

1. Exact CMDs：`pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance`（from root `package.json`）  
2. **Key present ≠ auto green ≠ covered ≠ SLO/LOAD met ≠ HA**  
3. **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**  
4. Non-happy required（NEG/FAULT/BOUND/ADV/PERF/LOAD/PARTIAL/R5/G6）· ban invent success without receipts  
5. Gate：**pre-exec dual pass ⇒ may execute** · then **post-prove dual** · no self-approve  
6. Cross-link：supersedes/unblocks **live path** of A；A remains honesty for **unset era**（not rewritten green）  
7. This prep：**zero live run · zero product code · zero commit · never paste Key**

Draft-shell presence probe（env name only）：**unset** — still `not_run:pre_dual`；parent assert ≠ auto authorize execute.

---

## Please answer

1. Agree exact trio script names and that live hard-run stays **`not_run:pre_dual`** until dual pass + meetwise execute authorize?  
2. Agree **Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** and **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**?  
3. Agree non-happy columns are required and inventing success without receipts is forbidden?  
4. Agree gate：**dual pass ⇒ may execute；then post-prove dual**；no self-approve；`releaseEvidence=false`？  
5. Agree this supersedes/unblocks **live path** of A while A unset-era honesty is **retained**？  
6. Confirm implementer did **not** run live e2e / paste Key / read `.env*` / commit secrets this prep？

---

## Non-claims

- Not pass · not family/suite green · not G6 closed · not R2/R4 closed · not SLO/LOAD/HA · not sole cutover · not `releaseEvidence=true`

---

*REQUEST · mw-e2e-ha · G7-A′ live Key×3 · 2026-09-16 ~23:16 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*
