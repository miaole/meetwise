# REQUEST — G7 MAIN · sole夹具退役 ⋂ scor-00 **post-prove** → mw-rag-route

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~19:50 PT · post-prove)  
**Knife status**: **`executed:awaiting_post_prove_dual`**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R5 retired** · **≠ sole cutover** · **≠ 题域已隔离** · **≠ R4 closed** · **≠ suite green**  
**Pair**: `REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-e2e-ha.md`  
**Pre-exec dual（pass）**: `2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md` · `…-mw-e2e-ha.md`  
**Hard**: EXIT=0 ≠ covered ≠ R4 closed ≠ suite green ≠ HA · no self-approve · no silent allowlist expand · K2 doc pin ≠ this fixture track

---

## Contra

- Harness / R5 status / G1 prep · BUG-FAKE-R5  
- `SOLE_WIRING_ALLOWLIST` 恰 5 · scor 外 · Nest scor still PG-bound  
- Orthogonal：K2 R4 sole-**cutover doc pin** ≠ 本夹具退役执行

---

## Stance（RAG/R5）

Post-prove must verify：**去 pgvector-legacy 假绿**（scor path）与 **sole 可证路径**（standalone sole-fixture）同时诚实；关闭 G7 scor nonzero **不得**仅挂 legacy Nest EXIT=0 或 honesty EXIT=0；**≠** R5 complete · **≠** R4/题域已隔离.

---

## CMD+EXIT（实现方实测 · 见 harness §4）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm scor-00:sole-fixture:prove` | **0** | sole honesty · ≠ R5 retired ≠ Nest-on-MySQL |
| `pnpm scor-00:http:prove` | **0** | legacy Nest HTTP · R5-MARKED-RED · ≠ sole ≠ G7 close alone |
| `pnpm scor-00-honesty:prove` | **0** | ≠ product close |
| `pnpm g1-default-switch:prep:prove` | **0** | prep ≠ flip · allowlist 恰 5 |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | marked-red ≠ retired |
| `pnpm e2e-isolation:sole-wiring:prove` | **0** | allowlist sample ≠ default sole |


## Please answer

1. From RAG/R5 view：sole-fixture prove + legacy R5 banner 是否满足 T2/T3/T5 诚实（未宣称 R5 retired / sole cutover）？  
2. Confirm allowlist **未**静默扩纳 scor；Nest-on-MySQL PREREQ 仍开.  
3. Confirm default isolation **仍** legacy；本刀 **未** flip.  
4. Confirm **≠ R4 closed / ≠ 题域已隔离**（K2 正交）.  
5. Confirm 实现方未自批；本 REQUEST ≠ pass.

请写入 `reviews/2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md`。

---

## Non-claims

- Not pass · not R5 retired · not sole cutover · not R4 closed · not suite green

*REQUEST · mw-rag-route · sole∩scor-00 post-prove · 2026-09-16 ~19:50 PT · executed:awaiting_post_prove_dual · releaseEvidence=false · ≠HA*
