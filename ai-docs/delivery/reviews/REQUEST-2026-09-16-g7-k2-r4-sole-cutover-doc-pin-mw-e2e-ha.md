# REQUEST — G7-K2 · R4 domain-isolation **sole-cutover doc pin** → mw-e2e-ha

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~19:38 PT)  
**Knife status**: **`REQUEST-ready / not_run:pre_dual`** · **no prove** · **no coding**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 covered** · **≠ suite green**  
**Pair**: `REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-rag-route.md`  
**Hard**: EXIT=0 later ≠ covered ≠ R2/R4 closed ≠ suite green ≠ HA · dual before any code/prove · no self-approve

---

## Contra

- Harness: `harness/g7-k2-r4-sole-cutover-doc-pin.md`
- Slice: `g7-honesty-knives.slice.md`
- Receipt: `receipts/2026-09-16-g7-full-suite-run.md`（`mysql-stack:r4-domain-isolation:prove` EXIT=1）
- Status: `harness/r4-domain-isolation-status.md`（must pin **≠ sole cutover**）
- Proof: `scripts/mysql-stack.r4-domain-isolation.proof.mjs`（FAIL status ≠ sole cutover；harness evidence may PASS）

---

## Stance

Honesty gap = **status doc pin** missing/drifted **≠ sole cutover**. Goal = align status/doc pin. **Still ≠ R4 closed ≠ 题域已隔离 ≠ wrong_track=0 covered.**

---

## Please answer

1. Is EXIT=1 correctly a **sole-cutover status pin** honesty fail（not ADV/wrong_track proof fail）?  
2. Do you agree status must explicitly pin **≠ sole cutover** without claiming R4 / 题域已隔离?  
3. Do you agree **wrong_track=0** remains **not covered** after this knife dual?  
4. Docs/status first；CMD `not_run:pre_dual`；no self-approve；`releaseEvidence=false`；≠ suite green / ≠ HA?

---

## Non-claims

- Not pass · not R4 closed · not 题域已隔离 · not sole cutover · not wrong_track=0 covered · not suite green

*REQUEST · mw-e2e-ha · G7-K2 · 2026-09-16 ~19:38 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*
