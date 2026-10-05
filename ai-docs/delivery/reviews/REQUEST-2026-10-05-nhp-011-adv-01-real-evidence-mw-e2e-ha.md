# REQUEST — **NHP-011-ADV-01 · UC-011 ADV real evidence** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-011-adv-01-real-evidence.md` · slice `nhp-011-adv-01-real-evidence.slice.md`
**Parent tip**: `6a79946`（full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df` · origin/feat/mysql-schema-skeleton）
**Date**: 2026-10-05

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

Line V · `NHP-011-ADV-01` case-only→real evidence。矩阵 `:117` ADV=gap/case-only；NHP `:58`「产品口缺失 = 仍 gap 执行面」；H4 钉 refund-callback **404**。请审：

1. **一刀一 ADV case**：仅错签（A1）+ 重放（A2）；观察 = 拒 + 无双退；口径锚定 scenarios E3/A3 + NHP-011-ADV-01 原文。
2. **诚实 UNREACHABLE 路径**：口仍 404 → EXIT1 保留 gap；Ban 把 H4/H5 洗成 ADV 真证据；产品口属独立 `GAP-UC011-REFUND-CALLBACK`，Ban 互借关闭。
3. **EXIT0 ≠ covered**：绿也不自动翻 ADV partial / §1.1 covered；须 post-prove dual + 协调方 nail；coveredCount=8；Ban invent covered。
4. **边界**：Ban coding/prove/push 本 stub；Ban 碰 UC-018/052/025/004；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。
5. **证据链：file:line 引文是否与矩阵/NHP/scenarios/H4 一致；attempts 全记录 · Ban retry-to-green · Ban flake**。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · NHP-011-ADV-01 · mw-e2e-ha（docs gate only · Ban coding · Ban prove · Ban 洗 404→ADV · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-model-op`）
**Review date**: 2026-10-05
**被审 tip**: `bb9af74`（`bb9af74b8398a2a8e4bba15f34699775529295c6` · docs-only 4 md）
**Parent cited**: `6a79946`
**Peer alone PASS（不代签）**: origin 上 `587b9e0` mw-model-op pre-exec PASS 存在；本文件仍 alone≠dual 半签。
**本审未跑**: 零 `uc011:adv:prove` · 零 live · 零 `.env*`。

## 检查表

1. **证据链**：矩阵 ADV gap/case-only · NHP「产品口缺失=仍 gap 执行面」· H4 refund-callback **404** · scenarios 错签/重放合同 — 与 harness 一致。
2. **一刀一 ADV**：仅 A1 错签 + A2 重放；观察=拒+无双退。
3. **口仍 404 → EXIT1**：Ban 洗 H4/H5/404 成 ADV 真证据；Ban 互借关 `GAP-UC011-REFUND-CALLBACK`。
4. **EXIT0 ≠ covered** · ADV stays gap/case-only · coveredCount=8 · Ban invent covered。
5. **Pins 原值**全保持。Dual PASS ≠ coding ≠ prove ≠ nail。

## Blockers

无。

## Conditions

- **C-1**：alone ≠ dual；不代签 peer（含已落的 model-op PASS）。
- **C-2**：pins 冻结；ADV stays gap/case-only 直至 post-prove dual + 协调方 nail。
- **C-3**：本 PASS ≠ coding ≠ prove ≠ nail；证明/写码须双签齐 + 协调方授权。
- **C-4**：口 404 → EXIT1 诚实；Ban 洗 404；Ban 互借关产品口缺口。
- **C-5**：EXIT0 ≠ covered ≠ ADV auto-partial；coveredCount=8。
- **C-6**：范围锁 A1+A2 only；Ban UC-018/052/025/004；Ban live/SSOT/HA/假绿/retry-to-green/self-nail。
- **C-7（软）**：scenarios 路径缩写与 E3 行号可在后续 docs 微调，不阻断。

## 中文三行摘要

1. tip `bb9af74` docs-only；ADV case-only→真证据合同清楚；H4 404 前提如实。
2. 口缺则 EXIT1；Ban 洗 covered；EXIT0≠covered · coveredCount=8。
3. Blockers 无。本 PASS = docs 半签；alone≠dual；≠ coding ≠ nail ≠ HA。

Verdict: PASS
