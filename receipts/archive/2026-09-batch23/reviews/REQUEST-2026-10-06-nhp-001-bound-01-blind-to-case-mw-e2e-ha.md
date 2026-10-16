# REQUEST — **NHP-001-BOUND-01 · UC-001 BOUND blind→case** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-001-bound-01-blind-to-case.md` · slice `nhp-001-bound-01-blind-to-case.slice.md`
**Parent tip**: `94a8b2a`（full `94a8b2aead1b7087115a0ac1af9f790ef2a8f177`）
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

## 请审什么（mw-e2e-ha · BOUND 证据诚实 · Ban fake-green suite · Ban live · Ban live default）

Line AB · 选 NHP-001-BOUND-01（非 ADV / 非 UC-003 / 非 banned UCs）。请审：

1. **选刀**：黄金路径 BOUND（P0）在 Line Y NEG 之后 vs ADV / i18n P1 / 015-FAULT — 裁决是否成立。
2. **B1 合同**：同幂等键重复 begin → 单 ConsumptionRecord / 无双扣；UC-017 旁证 ≠ 本 case 收据。
3. **Ban live** · **Ban live default** · **Ban fake-green suite**（绿 ≠ e2e:isolated suite green / covered）。
4. **EXIT0 ≠ covered** · coveredCount=8 · Ban invent covered · Ban SSOT flip。
5. docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail。
6. 专家对 mw-e2e-ha + mw-rag-route（非 mw-model-op）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · NHP-001-BOUND-01 · mw-e2e-ha（docs gate only · Ban live · Ban live default · Ban fake-green suite · Ban coding · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-rag-route`）
**Review date**: 2026-10-06
**被审 tip**: `c6dd1a6`（`c6dd1a67fc6b6ef4c2dfad0f9a5beff9791d657b` · docs-only 4 md）
**REQUEST parent cited**: `94a8b2a`（`94a8b2aead1b7087115a0ac1af9f790ef2a8f177`）
**Docs-only**: harness + slice + REQUEST×2 · 零产品 · 零 SSOT 翻写。
**本审未跑**: 零 `uc001:nhp-bound:prove` · 零 live · 零 Key · 零 `.env*` · 零 coding。

## 检查表

1. **选刀**：Line AB = NHP-001-BOUND-01（P0-3 黄金路径 BOUND）——成立。矩阵 `:112` BOUND 仍 **blind**/case-only；Line Y NEG 真证据已落（post-prove `3b605ac` · nail `1d3d569`）≠ 本刀；本刀仅 BOUND face · 不洗 NEG / ADV / UC-003 / 015-FAULT。
2. **B1 合同**：同 principal + 同 `idempotency-key` 重复 begin → 至多一条有效 ConsumptionRecord / 无双扣；第二次幂等安全（同 interview / already_* / DO NOTHING 族）。B2：UC-017 旁证 ≠ 本 case 专用收据。合同清晰。
3. **EXIT0 ≠ covered**：拟 `pnpm uc001:nhp-bound:prove` EXIT0 = B1 真证据 ≠ covered ≠ e2e:isolated suite green ≠ trio green ≠ UC-001 covered；coveredCount=8 冻结。
4. **Ban wash**：硬禁 UC-018 / 052 / 025 / 004 / 011；Ban wash UC-017/commerce 旁证成 001 BOUND covered；Ban invent covered · Ban SSOT flip 本 turn。
5. **Ban live · Ban live default · Ban fake-green suite**：拟 prove 隔离壳 · 不加载 MODEL_API_KEY；任何绿不得叙述为 suite/trio/covered。
6. **专家对**：mw-e2e-ha + mw-rag-route（begin/幂等/ConsumptionRecord = api/commerce 开面 · 非 model-op）——成立；不代签 peer。
7. **Pins 原值**全保持：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503。

## Blockers

无。

## Conditions

- **C-1**：alone ≠ dual；须 peer `mw-rag-route` 独立 PASS；不代签。
- **C-2**：pins 冻结；Ban invent covered · coveredCount=8。
- **C-3**：刀选 NHP-001-BOUND-01 BOUND-only；Ban 借刀 018/052/025/004/011 · Ban 洗 Y NEG / ADV / UC-003 / 015-FAULT。
- **C-4**：B1 begin/idempotency 合同保留；B2 UC-017 旁证 ≠ 本 case receipt。
- **C-5**：Ban live · Ban live default · Ban fake-green suite；EXIT0 ≠ covered。
- **C-6**：本 turn docs-only；PASS ≠ coding ≠ prove ≠ nail ≠ HA · Ban self-nail。

## 中文三行摘要

1. tip `c6dd1a6` docs-only；选黄金路径 BOUND blind→case（P0-3）成立；Y NEG（`3b605ac`）已证且与本刀互不替代。
2. B1 同幂等键重复 begin→单 ConsumptionRecord/无双扣 合同清晰；EXIT0≠covered · Ban wash 018/052/025/004/011 · coveredCount=8。
3. Blockers 无。本 PASS = docs 半签；alone≠dual；≠ coding ≠ covered ≠ nail ≠ HA。

Verdict: PASS
