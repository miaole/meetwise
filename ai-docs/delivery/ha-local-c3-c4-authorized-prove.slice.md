# Slice — **HA local C3+C4 authorized-prove**（docs REQUEST · **`REQUEST-ready / not_run:pre_dual`** · local C3 shared + C4 fault-inject evidence receipts under authorize flags）

**Status**: **`REQUEST-ready / not_run:pre_dual`**（实现方预写 · **not yet dual-sent** · **Ban自批 pass** · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · **≠ coding** · **≠ prove** · **≠ claim 阶 C/D green** · **≠ production HA / failover** · **≠ flip `releaseEvidence`** · **≠ wash G-R4-5 `6ded589`/`ba1b8aa` into HA** · **≠ wash skeleton/stub EXIT=0 into HA** · **≠ invent green** · **≠假绿**）  
**Date**: 2026-09-23 (~14:09 PT)  
**Base / HEAD**: G-R4-5 nail **`6ded589`** / full `6ded5896f8f255332b8015999a4d98c6b55158a6` · branch `feat/mysql-schema-skeleton`  
**Authority**: meetwise — docs-only **HA local C3+C4 authorized-prove REQUEST** open · zero coding · zero prove · zero HA claim · Ban假绿 · Ban invent green · Ban forge · Ban claim 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Ban wash G-R4-5 **`6ded589`**/**`ba1b8aa`** into HA · Ban wash skeleton/stub EXIT=0 into HA · Ban secrets / `.env*` · Dual not pinged by implementer · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`**  
**haStatus=NOT_HA** · **releaseEvidence=false** · **claimProductionHA=false** · **≠HA** · **≠suite green** · **≠ production topology** · **≠ 阶 C/D green** · **≠ coding authorized** · Dual PASS ≠ coding · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban自批 HA · Key×3 FreeTier **out of scope** · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6 / r4 / funnel product flags **retained** · `releaseEvidence=false` **retained** · ≠HA  
**Experts**: `mw-e2e-ha` + `mw-rag-route` · pre-exec dual **not_run** · Ban自批 · experts write reviews at named paths · Dual not pinged by implementer

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/ha-local-c3-c4-authorized-prove.slice.md` |
| Harness | `ai-docs/delivery/harness/ha-local-c3-c4-authorized-prove.md` |
| Eval | `ai-docs/delivery/eval/ha-local-c3-c4-authorized-prove.eval.md`（later / experts · **not** this open） |
| Must cite HA ladder | `harness/ha-track.multi-instance.md` · C3 `MEETWISE_HA_SHARED_AUTHORIZED` + C4 `MEETWISE_HA_FAULT_AUTHORIZED` · `MEETWISE_HA_DUAL_AUTHORIZED` · default PREREQ_GAP · `haStatus=NOT_HA` |
| Prior G-R4-5 product close | tip nail **`6ded589`** · prove **`ba1b8aa`** · EXIT **2×0** · `gR45Closed=true` · coveredCount **8** · `ms3EqualsR4Closed=false` · eg1–eg6/r4/funnel **retained** · `releaseEvidence=false` · ≠HA · **retained** · Ban wash into HA |
| Parent / stance | **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · 阶 C/D **STILL NOT GREEN** · production HA **NOT claimed** |
| REQUEST · e2e-ha (named · expert writes) | `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-mw-e2e-ha.md` · **REQUEST-ready / not_run:pre_dual** |
| REQUEST · rag-route (named · expert writes) | `reviews/REQUEST-2026-09-23-ha-local-c3-c4-authorized-prove-mw-rag-route.md` · **REQUEST-ready / not_run:pre_dual** |

## One-line scope

Docs REQUEST open: **HA local C3+C4 authorized-prove** · local evidence receipts for ladder **C3 shared + C4 fault-inject** under explicit env authorize flags（`MEETWISE_HA_DUAL_AUTHORIZED` · `MEETWISE_HA_SHARED_AUTHORIZED` · `MEETWISE_HA_FAULT_AUTHORIZED` · cite `ha-track.multi-instance.md`）· intended later（under authorize）land reproducible CMD+EXIT receipts for `ha:dual:build-image` / `ha:dual:compose-shared` / `ha:prove:shared` / `ha:fault-inject` as applicable · If PREREQ_GAP unavoidable → honest pin GAP · Ban假绿 · do NOT invent green · Ban claim 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Ban wash G-R4-5 `6ded589`/`ba1b8aa` into HA · Ban wash skeleton/stub EXIT=0 into HA · post-prove dual BOTH PASS → nail → STOP · Dual PASS ≠ next knife auto-authorize · Dual PASS ≠ coding · Dual PASS ≠ HA green · Key×3 FreeTier out of scope · retain `gR45Closed=true` / coveredCount **8** / `ms3EqualsR4Closed=false` / eg1–eg6/r4/funnel · **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · zero coding · zero prove · zero HA claim · Dual not pinged by implementer.

## Hard pins

- **`haStatus=NOT_HA`** · **`releaseEvidence=false`** · **`claimProductionHA=false`** · 阶 C/D **STILL NOT GREEN** · production HA **NOT claimed** · ≠ wash G-R4-5 `6ded589`/`ba1b8aa` · ≠ wash skeleton/stub EXIT=0 into HA · Ban invent green · Ban假绿 · Ban claim 阶 C/D green · Ban production HA / failover · Ban flip `releaseEvidence` · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · `gR45Closed=true` **retained** · coveredCount **8** retained · `ms3EqualsR4Closed=false` **retained** · eg1–eg6/r4/funnel **retained** · Ban self-approve · Ban Cloud Agent · Ban Meridian · Ban secrets / `.env*` · Key×3 FreeTier **out of scope** · Dual not pinged by implementer
- Lifecycle: L0 this open · L1–L5 coding/prove/HA-claim **not** executed · post-prove → nail → STOP · no second knife · local receipts ≠ production HA
- Acceptance later: pre-exec dual BOTH PASS → standing authorize → authorized local C3+C4 CMD+EXIT receipts（or honest PREREQ_GAP）→ post-prove dual BOTH PASS → lifecycle nail → STOP · **Ban假绿** · **Ban invent green** · **Ban claim 阶 C/D** · **Ban production HA**

## CMD

| CMD | Status |
|-----|--------|
| docs REQUEST open | **`REQUEST-ready / not_run:pre_dual`** · HA local C3+C4 authorized-prove acceptance · cite `ha-track.multi-instance.md` |
| pre-exec dual | **`not_run:pre_dual`** · Ban自批 · experts write at named paths · Dual not pinged by implementer |
| standing coding / authorize / prove | **`not_run:no_coding_authorize`** · Ban invent green · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Ban假绿 · Ban claim 阶 C/D · Ban production HA |
| planned prove (later) | `pnpm ha:dual:build-image` · `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared` · `MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove` · `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor` · EXIT=0 local ≠ 阶 C/D green ≠ HA · If PREREQ_GAP → honest pin GAP · Ban假绿 |

---

*Slice · HA local C3+C4 authorized-prove · 2026-09-23 (~14:09 PT) · REQUEST-ready / not_run:pre_dual · docs only · base 6ded589 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · cite ha-track.multi-instance.md · gR45Closed=true retained · coveredCount 8 retained · ms3EqualsR4Closed=false retained · eg1–eg6/r4/funnel retained · ≠ wash G-R4-5 6ded589/ba1b8aa into HA · ≠ wash skeleton/stub EXIT=0 into HA · Ban invent green · Ban假绿 · Ban claim 阶 C/D green · Ban production HA/failover · Ban flip releaseEvidence · Dual PASS ≠ coding · Dual PASS ≠ HA green · Dual PASS ≠ next knife auto-authorize · Key×3 FreeTier out of scope · zero coding · zero prove · zero HA claim · Dual not pinged by implementer*
