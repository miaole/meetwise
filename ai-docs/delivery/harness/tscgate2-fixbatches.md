# TSCGATE-2 — e2e tsc 修复四批+门禁点亮刀（C1/C2 落地）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `c17804a5`（**含 E2EFAIL-1 修复补收 3a2a2e2b·B1 已消·残余 10 错**）· 分支 `line/tsc-fix-batches` · 立项依据 = TSC-GATE-1 nail 四批估算（≈15-20 行/6 文件）+ C1/C2 落地路径（turbo.json:6 typecheck 空挂+apps include 模式复制）。

## 1. 修法（四批·零逻辑变更）
- **B2 类型环境**（2 错 TS2304 HeadersInit/RequestInfo·proof.ts:54/:70）：undici-types 直接 import 在默认 pnpm 布局不可解析（席2 实测仅 .pnpm 无顶层 hoist）→ **ambient d.ts 为正选**（e2e/types/undici.d.ts 三行声明）；
- **B3 真型不配**（1 错 TS2322 interview.ts:182 includes-cast 不收窄）：CONCLUDE_REASONS as const 收窄谓词（~2 行）；
- **B4 strict 噪声**（7 错 TS2322×2 捕获组/TS2532×5 二维索引·三文件同构同根）：非空断言或显式守卫（机械 ~10 行）；
- **门禁点亮**：e2e/tsconfig.json 正式化（include **/*·allowJs:true checkJs:false·noEmit·skipLibCheck 继承）+ root script `typecheck:e2e` + **turbo.json typecheck 任务实现**（e2e 包先行·apps/api include 模式复制·godfn-1d 预存红 blast radius 如实评估）。
- **禁降 strict**（run-B 残余 4 含真断链+真型错——降 strict 掩盖可修错误·TSC-GATE-1 立场）。

## 2. 验收
`tsc --noEmit` EXIT=0（e2e 域清零）·`pnpm typecheck:e2e` EXIT=0·static guards EXIT=0·零产品码 src 零 diff·attempts 全账·收据 `ai-docs/delivery/receipts/tscgate2-fixbatches/`。

## 3. Ban
零逻辑变更（型收窄/守卫/环境声明·零行为 diff——tests/纯型面）·e2e/ 外仅 tsconfig/turbo/package.json script·apps/packages src 零 diff·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual·est 0 live。

## 4. Non-claims
本刀 ≠ C1 lint 门 ≠ apps/packages 全量 typecheck 点亮（e2e 先行·按包点亮后续）≠ G7 面。
