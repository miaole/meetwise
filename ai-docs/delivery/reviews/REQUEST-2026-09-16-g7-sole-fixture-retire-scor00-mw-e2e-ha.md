# REQUEST — G7 main-track · **sole夹具退役 ⋂ scor-00** → mw-e2e-ha

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~19:43 PT)  
**Knife status**: **`REQUEST-ready / not_run:pre_dual`** · **no prove** · **no coding green-flip**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R5 retired yet** · **≠ sole cutover claimed** · **≠ suite green** · **≠ 0 BUG**  
**Pair**: `REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md`  
**Supersedes**: `REQUEST-2026-09-16-g7-b4-scor00-sole-fixture-gap-mw-e2e-ha.md`（redirect）  
**Hard**: EXIT=0 later ≠ covered ≠ R2/R4 closed ≠ suite green ≠ HA · dual before any code/prove · no self-approve

---

## Contra

- Harness（canonical）：`harness/g7-sole-fixture-retire-scor00.md`
- Slice：`g7-honesty-knives.slice.md`
- R5 / G1：`harness/r5-retirement-sole-stack-status.md` · `g1-default-switch-prep.md` · `m5-pgvector-fixture-retirement-plan.md`
- Receipt：`scor-00:http:prove` EXIT=1（pgvector · `interview_ineligible_route` · R5 green-risk）
- Former B4：`harness/g7-b4-scor00-sole-fixture-gap.md`（**SUPERSEDED**）

---

## Stance（升格主轨）

scor-00 G7 nonzero **不是**单独产品刀：并入 **sole夹具退役**主轨。计划验收（dual 后 + 另授权才可执行）：

1. **Isolated 默认真栈**（MySQL+Qdrant+Redis）  
2. **去 pgvector-legacy 假绿**（legacy opt-in only）  
3. **scor-00 在 sole 上可证**  
4. 关 G7 scor-00 nonzero + **R5 green-risk 诚实钉**（凭 sole 收据，非 honesty-prove  alone）

本 prep：**零 prove · 零翻默认 · 零自批**。

---

## Please answer

1. Agree scor-00 EXIT=1 is correctly elevated into **sole夹具退役 ⋂ scor-00**（not pointer-only B4）?  
2. Agree acceptance **T1–T5**（默认真栈 · 去 legacy 假绿 · scor sole-provable · G7 nonzero close via sole receipts · R5 green-risk pin）?  
3. Agree **G1 prep ≠ flip open**；flip / coding / prove only after dual + **separate authorize**?  
4. Agree `scor-00-honesty:prove` EXIT=0 ≠ close scor-00 / ≠ R5 retired / ≠ suite green?  
5. CMD `not_run:pre_dual`；no self-approve；`releaseEvidence=false`；≠ HA / ≠ R2·R4 closed?

---

## Non-claims

- Not pass · not R5 retired · not default already sole · not suite green · not HA · not covered

*REQUEST · mw-e2e-ha · sole夹具退役 ⋂ scor-00 · 2026-09-16 ~19:43 PT · REQUEST-ready / not_run:pre_dual · releaseEvidence=false · ≠HA*
