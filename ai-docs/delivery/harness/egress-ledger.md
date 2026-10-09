# EGRESS-1 — provider-egress 清算刀（主线历刀欠账 64 行 ~40 文件 unregistered 收编）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `7ad2b3e2` · 分支 `line/provider-egress-ledger` · 立项依据 = TOKSTREAM-S2 EXEC 遇雷升级（`pnpm provider-egress:prove` 在未动主线树即 EXIT=1——历刀欠账 ~40 文件 env 名提及未申报·64 行；本刀非探针债，系主线基建账）。

## 1. 手段（纯 manifest 申报·零产品码）
逐文件亲读 `provider-egress-inventory.mjs` 报错清单的 ~40 文件：每一处 env 名提及（`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`G7_FREETIER_REPROVE`/`MODEL_ENDPOINT_PROFILE`/`E2E_CLOUD_ISOLATED` 等）按实际语义归 class（manual-live-smoke/manual-evaluation/test-only/infra 等 REQUIRED_CLASSES 闭集内）——manifest environmentReferences 增条目；**禁改任何源码文件**（本刀=记账非行为面）；分类错误（如 test-only 误报 manual-live）由 prove 门断言拦。
- 既有条目零改（含 TOKSTREAM-S2 已申报 2 条——若 base 含其 cherry-pick 则保留）。

## 2. 验收
`pnpm provider-egress:prove` **EXIT=0**（主线首绿）·manifest diff 全量清单（文件→env→class 逐条）·零源码 diff 亲证·node --check·收据 `ai-docs/delivery/receipts/egress-ledger/`。

## 3. Ban
零产品码（apps/packages src 零 diff）·仅 manifest json+本刀 harness·既有条目零改·prove 门断言零改·Key name-only·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual·est 0 live。

## 4. Non-claims
本刀 ≠ env 卫生完成（Runtime env 值轮换/泄漏扫描另域）≠ egress 策略变更（class 归类照实非新政策）。
