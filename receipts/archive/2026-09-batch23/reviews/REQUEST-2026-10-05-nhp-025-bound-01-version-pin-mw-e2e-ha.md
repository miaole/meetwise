# REQUEST — **NHP-025-BOUND-01 · UC-025 BOUND version-pin** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/nhp-025-bound-01-version-pin.md` · slice `nhp-025-bound-01-version-pin.slice.md`
**Parent tip**: `6a79946`（full `6a79946ae5bb4b2148e0d63d3b7f66d64a1e51df`）
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

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT · Ban wash B''）

Line W · 选 **BOUND**（非 FAULT）：矩阵 `:125` BOUND gap + P1-8 resumeVersion pin 缺 + scenarios TC-E2E-025-version-mismatch。请审：

1. **选面诚实**：FAULT 无具名场景；BOUND 有明文用例——裁决是否成立。
2. **blind→case/prove**：本 REQUEST 仅 docs 显式化；prove 拟 `uc025:nhp-bound:prove`；口未接线 → EXIT1 保留。
3. **Ban wash B''**：NEG CLOSED（wired）不动；Ban 借 NEG 绿关 BOUND/整行。
4. **Ban 编辑 begin quiz 产品路径**（docs-only 本 turn）。
5. **行 stays gap** · coveredCount=8 · Ban invent covered · Ban SSOT status 翻写。

Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · NHP-025-BOUND-01 · mw-e2e-ha（docs gate only · Ban coding · Ban prove · Ban wash B'' NEG · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-rag-route`）
**Review date**: 2026-10-05
**被审 tip**: `73b9d85`（`73b9d8574844e390180586b82af3b1a128fcbd8b` · docs-only 4 md）
**REQUEST parent cited**: `6a79946`
**Docs-only**: `git show --stat 73b9d85` = harness + slice + REQUEST×2 · 零产品 / 零 scripts / 零 SSOT 行翻转。
**本审未跑**: 零 `uc025:nhp-bound:prove`（脚本尚未存在属预期）· 零 live · 零 `.env*`。

## 检查表

1. **选面 BOUND**：矩阵 UC-E2E-025 NEG CLOSED（wired）· FAULT gap · BOUND gap · ADV blind；P1-8 resumeVersion pin 缺；scenarios 有 TC-E2E-025-version-mismatch。FAULT 无具名场景 → 选 BOUND 成立。
2. **BOUND ≠ NEG wash**：`interview.service.ts` begin 仅 status+expires_at→`stale_quiz`；无 resumeVersion 消费。B'' 关的是 NEG 过期面，不是版本 pin。
3. **blind→case docs-only**：拟 `pnpm uc025:nhp-bound:prove` 未实现；未接线 → 授权后 EXIT1 保留 gap 诚实。Dual PASS ≠ coding ≠ prove ≠ nail。
4. **行 stays gap** · coveredCount=8 · Ban invent covered · Ban 碰 B'' NEG · Ban 编辑 begin quiz 产品路径本 turn。
5. **Pins 原值**：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503。

## Blockers

无。

## Conditions

- **C-1**：alone ≠ dual；须 peer `mw-rag-route` 独立 PASS；不代签。
- **C-2**：Ban coding · Ban prove 执行 · Ban nail · Ban push · Ban 改 `interview.service.ts` begin/quiz。
- **C-3**：Ban wash B'' NEG→BOUND/整行 covered；UC-025 stays gap；coveredCount=8。
- **C-4**：授权后若无 version-pin → EXIT1 保留 BOUND gap；EXIT0 ≠ covered。
- **C-5**：pins 冻结；Ban HA / Ban 假绿。
- **C-6**：NHP 矩阵仅有 NEG-01 行、BOUND 行登记留 nail；陈旧「NEG 未接线」表述只披露不洗。

## 中文三行摘要

1. tip `73b9d85` docs-only；选 BOUND 相对 FAULT 成立；B'' NEG 过期面 ≠ resumeVersion pin。
2. 拟 prove 未落地属预期；行 stays gap · coveredCount=8 · Ban wash NEG。
3. Blockers 无。本 PASS = docs 半签；alone≠dual；≠ coding ≠ nail ≠ HA。

Verdict: PASS
