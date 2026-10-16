# REQUEST — **GAP-UC011-REFUND-CALLBACK · product mouth** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc011-refund-callback-product-mouth.md` · slice `gap-uc011-refund-callback-product-mouth.slice.md`
**Parent tip**: `f43bea1`（full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91` · origin/feat/mysql-schema-skeleton）
**Date**: 2026-10-06

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT 契约焦点）

Line Z · `GAP-UC011-REFUND-CALLBACK` 产品口。矩阵 `:117` 缺 refund-callback · partial≠covered；backlog `:463-468` Line V nail 明示两 gap stay OPEN · product mouths = other knife；H4/H5 三口 **404**；scenarios E3/A3 + §1b#1。请审：

1. **一刀一产品口**：Path A = 可测口落地（非 404 + CAS/幂等 · M1 一次退 + M2 重放）**或** Path B = 诚实 ADR 降级；口径锚定 scenarios E3/A3 + §1b#1 原文 · Ban 发明验收。
2. **与 Line V / ADV 隔离**：**Ban wash ADV into covered via this REQUEST**；口绿 ≠ ADV covered ≠ 关 `GAP-UC011-ADV-01`；ADV 重跑属独立后续刀。
3. **EXIT0 ≠ covered**：绿也不自动翻 §1.1 covered；UC-011 stays **partial** 直至独立 covered-lift + dual + nail；coveredCount=8；Ban invent covered。
4. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。
5. **证据链**：file:line 引文是否与矩阵/backlog/scenarios/H4/§1b#1/Line V nail 一致；attempts 全记录 · Ban retry-to-green · Ban flake；404 GAP 叙事在口浮出后须废止（PREREQ-6）。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · GAP-UC011-REFUND-CALLBACK · product mouth · mw-e2e-ha（docs gate only · Ban coding · Ban prove · Ban wash ADV→covered · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-model-op`）
**Review date**: 2026-10-06
**被审 tip**: `bb1721b`（`bb1721bd6b3fdf76d5195a463543a9c3bf841d18` · docs-only REQUEST · parent `f43bea1`）
**Parent cited**: `f43bea1`（`f43bea12fc7f2e28e7bb0052b6a80811eac47e91`）
**Peer**: `mw-model-op` stub PENDING · alone ≠ dual · 不代签
**本审未跑**: 零 product coding · 零 prove · 零 live · 零 `.env*` · 零 SSOT edit

## 检查表

1. **Path A vs Path B**：合同清晰两选一。Path A = 可测口落地（非 404 + CAS/幂等 · M1 一次退 + M2 重放）；Path B = 诚实 ADR 降级。锚定 scenarios E3/A3 + §1b#1 · Ban 发明验收。✓
2. **与 Line V 边界**：不重开 ADV prove；Ban wash ADV into covered via this REQUEST；Ban 互借关 `GAP-UC011-ADV-01`；口绿 ≠ ADV covered；product mouths = 本刀（Line V nail STILL_OPEN 两 gap）。✓
3. **EXIT0 ≠ covered**：绿也不翻 §1.1 covered；UC-011 stays **partial**；coveredCount=**8**；Ban invent covered；Path B 关口 = ADR+dual+nail 仍 ≠ covered。✓
4. **Pins 原值**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503。Ban live/secrets/SSOT edit 本 turn。✓
5. **证据链 spot-check**：矩阵 `:117` 缺 refund-callback · ADV=gap/case-only；backlog `:463-468` / Line V nail 两 gap OPEN · product mouths=other knife；covered-path `:34`/`:45` H5=GAP+PREREQ≠产品口；scenarios `:238`/E3`:248`/A3`:251`/契约`:253`；§1b#1 `:69`；H4 三口 **404**（harness `:37`）。与 REQUEST/harness/slice 一致。✓
6. **alone ≠ dual** · Ban coding · Ban prove · Ban self-approve · Ban self-nail。✓

## Blockers

无。

## Conditions

- **C-1**：alone ≠ dual；不代签 peer（`mw-model-op`）。
- **C-2**：pins 冻结；UC-011 stays partial · ADV stays gap/case-only · coveredCount=8 · Ban invent covered。
- **C-3**：本 PASS ≠ coding ≠ prove ≠ nail；写码/prove 须双签齐 + 协调方授权。
- **C-4**：Ban wash ADV→covered；Ban 互借关 `GAP-UC011-ADV-01`；口绿 ≠ ADV covered。
- **C-5**：EXIT0 ≠ covered ≠ 独立 covered-lift；Path B ADR 仍 ≠ covered。
- **C-6**：范围锁本刀产品口（Path A 或 B）；Ban UC-018/052/025/004；Ban live/SSOT/HA/假绿/retry-to-green/self-nail。
- **C-7（软）**：scenarios 路径缩写 `e2e-scenarios.md`（实为 `requirements/use-cases/`）不阻断。

## 中文三行摘要

1. tip `bb1721b` docs-only；Path A（M1/M2 可测口）与 Path B（ADR 降级）两选一合同清晰；与 Line V ADV 隔离硬钉。
2. EXIT0≠covered · UC-011 stays partial · coveredCount=8 · Ban wash ADV→covered · Ban 互借关 GAP-UC011-ADV-01。
3. Blockers 无。本 PASS = docs 半签；alone≠dual；≠ coding ≠ prove ≠ nail ≠ HA。

Verdict: PASS
