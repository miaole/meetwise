# REQUEST — **NHP-025-BOUND-01 · UC-025 BOUND version-pin** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 请审什么（mw-rag-route · quiz/resume 跨图编排 · version-pin 诚实面）

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

## mw-rag-route pre-exec · 2026-10-05T23:36:25+0800

**Status**: pre-exec · docs gate only · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail · 不 coding
**审查对象**: REQUEST `73b9d8574844e390180586b82af3b1a128fcbd8b`（短 `73b9d85`）· harness `nhp-025-bound-01-version-pin.md` · slice `nhp-025-bound-01-version-pin.slice.md`
**origin tip（落笔）**: 见 push 后报告。`73b9d85` 须为 `origin/feat/mysql-schema-skeleton` 祖先。
**NORTH-STAR-EXECUTION-LOOP**: 再 `git grep` origin 仍 **未找到**该文件名。本审门 = `ai-docs/delivery/north-star-hard-gates.md` + 本 harness/slice。
**Peer**: mw-e2e-ha stub 仍 PENDING（只读 · 不改 · 不代签）。

### 检查

1. **docs-only**：`git show --stat 73b9d85` = 4 文件（harness + slice + dual stubs）· 零 `apps/` / `packages/` / proof / package.json。通过。
2. **选面 BOUND 诚实**：矩阵 `:125` BOUND=gap、NEG B'' CLOSED(wired)、FAULT=gap、ADV=blind；P1-8 `:274` 明文缺 resumeVersion pin；scenarios `:340-347` TC-E2E-025-version-mismatch。选 BOUND 不选 FAULT 成立。非 UC-018/052/004。
3. **fail-closed 合同 + 锚点（核 73b9d85 产品树）**：
   - begin / stale 区 `interview.service.ts:192+`；**抛点** `stale_quiz` **409** 在 **`:222`**（`:209` 为注释行，矩阵/harness 写 `:209` 属旁注漂移，**非**发明 throw 行；CONDITION：后续旁注宜钉 `:222`）。
   - 全树 **无** `resumeVersion` / 版本失配比较消费于 interview 产品路径（仅 proof 旁注 `resume_version_mismatch` 作「不得误标」清单）。harness「口未接线 → EXIT1 保留 BOUND gap」诚实。
   - 注入期望：失配 → 可解释拒 + Interview 未入 active + 未扣额度（先于 reserve）。**未**预造具体 error/HTTP——与未接线一致；**条件**：独立 wiring 刀须在改产品前钉死错误码/HTTP，且本 REQUEST **Ban** 编辑 begin quiz 产品路径。
4. **拟 prove**：`pnpm uc025:nhp-bound:prove`；EXIT0 = case 级证据 ≠ covered ≠ 整行；EXIT1 保留 gap。**Ban** wash B'' NEG / **Ban** 把 `uc025:stale-quiz-expiry:prove` 或 NEG EXIT0 洗成 BOUND。FAULT/ADV 仍 not_run/blind。
5. **授权边界**：Non-claims 明钉 not coding · not covered · not product wiring。行 stays gap · coveredCount=8。Pins 全保留（NOT_HA · DELETE=503 · PG-retained · gR45Closed=true · ms3EqualsR4Closed=false）。
6. **协调方旁注**：任务文案曾写「`pnpm uc025:nhp-neg:prove` stays EXIT 1 until wiring」——本 tip 上 B'' 已 CLOSED(wired)，NEG 绿**不得**借洗 BOUND。本计划冻结 NEG、Ban wash，**不**因该旁注冲突而 FAIL。

### 条件

1. Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。alone ≠ dual。
2. 不代签 peer。不碰 B'' NEG / begin 产品路径 / SSOT 行翻转。
3. 旁注 `:209`→抛点 `:222` 漂移披露；不得把注释行当发明锚点洗 FAIL，也不得假装 resumeVersion 已接线。
4. 具体 version-mismatch HTTP/error 须留独立 wiring 刀命名；本 docs 刀不得冒充 covered。

Verdict: PASS
