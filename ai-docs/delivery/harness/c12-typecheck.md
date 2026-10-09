# C1/C2 — turbo typecheck 按包点亮刀（NEXT-NODE C1 lint 门 + C2 tsc --noEmit 进 CI 含 e2e/）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落 @ `e1190c96`：web+contracts 两包 typecheck script 点亮 · 零产品码 src diff · 三验收门全 EXIT=0 + e2e-platform:check EXIT=0 · turbo dry=json 选择面恰两包亲证 · 收据 `ai-docs/delivery/receipts/c12-typecheck/00-exec-receipt.md` · erratum：未点亮实为 9 包（config/db-mysql 非标准面未计红）· STOP awaiting post-prove dual · Ban self-approve；前态 `draft_rev2:awaiting_pre_exec_dual`（rev2 席1 FAIL 三处方：e2e 不点亮收窄 web+contracts 两包先行·七包排除清单补列·turbo dry=json 判据·C2 不勾销改「三域就绪 CI 另刀后方勾销」）） · base = 主线 tip · 分支 `line/c1c2-typecheck` · 立项依据 = TSC-GATE-1 nail C1/C2 落地路径终评可行（turbo.json:6 typecheck 任务空挂全库零实现·apps include 模式可复制·e2e 域先行红面最小·NEXT-NODE-BEST-PRACTICES.md C1 ❌ C2 ❌）+ TSCGATE-2 rev2 e2e 域先行门禁先例。

## 1. 修法（按包渐进点亮·零逻辑变更·零产品码 src 修改）
- **e2e 包：不点亮**（rev2·席1 FAIL 处方——TSCGATE-2 rev2 仅 REQUEST rev2 无 EXEC·e2e 域亲测 10 错首日红）——**收窄为 web+contracts 两包先行**，e2e 待 TSCGATE-2 EXEC 落地后补刀；
- **apps/web**：web=0 错实测 → tsconfig.json include src 加 `typecheck` script（`tsc --noEmit`）→ turbo 点亮；
- **packages/contracts**：contracts=0 错实测 → 同法点亮；
- **apps/packages 其余七包**（api 26/worker 41/db 20/ai-runtime 15/domain 26/qdrant-store 2/ai-graphs 4）：**不点亮**（首日红实测·rev2 补列 qdrant-store+ai-graphs）——本刀 Non-claims 显式排除·后续修复刀逐包解锁；
- **turbo.json**：typecheck 任务 dependsOn ^build 确认（turbo.json:6）·产出 `turbo run typecheck --dry=json` 过滤 `command≠<NONEXISTENT>` 亲证选择面恰已点亮包（web+contracts）；
- **C1 lint 门**：仓内无 lint 配置——本刀**不立项 lint**（C1 维持 ❌·lint 需独立设计刀）。

## 2. 验收
已点亮包各 `tsc --noEmit` EXIT=0·turbo dry-run 选择面亲证·未点亮包零触碰·零产品码 src 零 diff·e2e-platform:check EXIT=0·收据 `ai-docs/delivery/receipts/c12-typecheck/`。

## 3. Ban
零逻辑变更·零产品码 src diff·apps/packages 未点亮包零新增 script·CI 零接线（c12 门禁点亮=本刀 scope·CI 接线另刀）·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 4. Non-claims
本刀 ≠ C1 lint 门 ≠ apps/packages 全量点亮 ≠ 修复 ≠ G7 面。**C2 不勾销**（web+contracts 两域 tsc 门就绪但 CI 接线另刀·三域就绪后方勾销）·C1 维持 ❌。
