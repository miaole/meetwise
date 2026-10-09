# C1/C2 — turbo typecheck 按包点亮刀（NEXT-NODE C1 lint 门 + C2 tsc --noEmit 进 CI 含 e2e/）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 tip · 分支 `line/c1c2-typecheck` · 立项依据 = TSC-GATE-1 nail C1/C2 落地路径终评可行（turbo.json:6 typecheck 任务空挂全库零实现·apps include 模式可复制·e2e 域先行红面最小·NEXT-NODE-BEST-PRACTICES.md C1 ❌ C2 ❌）+ TSCGATE-2 rev2 e2e 域先行门禁先例。

## 1. 修法（按包渐进点亮·零逻辑变更·零产品码 src 修改）
- **e2e 包**：TSCGATE-2 已落地 e2e 域 tsc 清零（先行红面最小）——本刀确认其 tsconfig.e2e.json 正式化在卷并接通 turbo；
- **apps/web**：web=0 错实测 → tsconfig.json include src 加 `typecheck` script（`tsc --noEmit`）→ turbo 点亮；
- **packages/contracts**：contracts=0 错实测 → 同法点亮；
- **apps/packages 其余五包**（api 26/worker 41/db 20/ai-runtime 15/domain 26）：**不点亮**（首日红·godfn-1d 台账在卷）——本刀 Non-claims 显式排除·后续修复刀逐包解锁；
- **turbo.json**：typecheck 任务 dependsOn ^build 确认（:25 已声明）·产出 `turbo run typecheck --dry-run` 亲证选择面恰已点亮包；
- **C1 lint 门**：仓内无 lint 配置——本刀**不立项 lint**（C1 维持 ❌·lint 需独立设计刀）。

## 2. 验收
已点亮包各 `tsc --noEmit` EXIT=0·turbo dry-run 选择面亲证·未点亮包零触碰·零产品码 src 零 diff·e2e-platform:check EXIT=0·收据 `ai-docs/delivery/receipts/c12-typecheck/`。

## 3. Ban
零逻辑变更·零产品码 src diff·apps/packages 未点亮包零新增 script·CI 零接线（c12 门禁点亮=本刀 scope·CI 接线另刀）·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 4. Non-claims
本刀 ≠ C1 lint 门 ≠ apps/packages 全量点亮 ≠ 修复 ≠ G7 面。C1/C2 在 NEXT-NODE-BEST-PRACTICES.md 中 C2 可勾销（e2e+web+contracts 三域 tsc 门已落·turbo 接线在卷）·C1 维持 ❌。
