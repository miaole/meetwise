# TSC-GATE-1 — e2e/ 全域 tsc 覆盖盘点刀（C1/C2 前置·零修复纯盘点）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `7ad2b3e2` · 分支 `line/tsc-gate-survey` · 立项依据 = E2EFAIL-1 nail forward 登记（e2e/ 全域零 tsc 覆盖缺口：root tsconfig 仅 paths 无 include·e2e/ 无自有 tsconfig·tsx transpile-only TS2304 级断链无门可抓——emitE2EFailure 断链存活根因）+ NEXT-NODE-BEST-PRACTICES C1/C2。

## 1. 手段（纯盘点·零修复·零产品码）
1. **盘点**：临时 e2e/tsconfig.json（extends root·include e2e/**/*·noEmit·不入 git——/tmp 或 worktree 用后即删）跑 `tsc --noEmit` 全量错数+错型分布（TS2304 断链/TS2345 型不配/TS7006 隐式 any 等）逐类统计；
2. **错样抽核**：每类抽 ≥3 例亲读（真断链 vs 严格模式噪声——distinction 决定门禁形态：strict 全开 vs 渐进收紧）；
3. **门禁设计建议**（产出=修复分批 REQUEST 的输入·零实施）：错数清零路径估算（分批批次/优先级：断链类优先沿 E2EFAIL-1 先例）/门禁挂点建议（static guards vs 独立 script vs CI）。

## 2. Ban
零产品码·零源码改动（临时 tsconfig 用后即删或 /tmp）·恰 1 次盘点跑·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 3. 验收
全量错数+错型分布报告+每类 ≥3 例抽核+门禁设计建议+收据 `ai-docs/delivery/receipts/tscgate-survey/`。

## 4. Non-claims
本刀 ≠ 门禁落地 ≠ 任何修复 ≠ C1/C2 勾销（盘点=前置供料）。
