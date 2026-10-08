# G7P-2 — wrapper code 截获刀（真实链装载红 vs 旅程红切分）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `251618d5` · 分支 `line/g7-boot-intercept` · 立项依据 = G7P-1 nail 裁定（向④降格采信+环境外推缺口关闭需求·席2 建议被采纳）。

## 1. 目标
在**历史红环境**（主 checkout 真实链）切分 E2EFAIL-1 形状（23.3s/0 行/双计 0）的两拟合解：**装载红**（tsx spawn→full.e2e.ts 模块装载期 throw/超时）vs **旅程红**（装载完成后首测试行前死/旅程中死）——G7P-1 探针（复刻链）无法区分此两面。

## 2. 手段（flag 门控·零产品码·默认关）
1. 新增 `scripts/e2e-boot-trace.mjs`（装载钩子模块）：经 `NODE_OPTIONS="--import ./scripts/e2e-boot-trace.mjs"` 注入——记录三个时间戳到 stderr + `.tmp/e2e-boot-trace.json`：**T1** tsx spawn 完成（process start）、**T2** full.e2e.ts 模块装载完成（module.onLoad 钩子）、**T3** 首测试行执行（首 console/首 fetch 钩子）。装载期异常原样捕获记录后 rethrow（不吞不洗）。
2. `scripts/run-e2e.mjs` 最小接线（env-flag 门控可回退）：仅当 `E2E_BOOT_TRACE=1` 时给 tsx child 附加 NODE_OPTIONS——**默认关零行为变化**（现有收据语义零影响·CI 零触碰）。
3. 跑恰 1 run：`E2E_BOOT_TRACE=1 pnpm e2e:isolated`（真实链主 checkout 环境）。

## 3. 预注册三向判读（EXIT 原值+trace 三戳+既有收据面联判）
- **装载红**：T2 未达（装载期 throw/挂死）⇒ 红因=模块装载面（import 断链类/依赖解析类）⇒ 修复刀定靶装载面；
- **旅程红**：T2 达成但 T3 前死 ⇒ 启动后早期旅程死（signup 前后）⇒ 归旅程段细分刀；
- **旅程中红/绿**：T3 达成 ⇒ 红在旅程深处（对照 review ledger 行数分位）⇒ 归 G7X ①面延续；绿 ⇒ 环境噪声候选增强（结合 G7P-1 冷热数据）。
三向如实入收据禁洗绿禁重跑至绿。

## 4. Ban
零产品码（apps/packages src 零改）· run-e2e.mjs 改动仅 flag 门控默认关（diff ≤10 行）· 既有收据解析器零触碰（trace 走 stderr+独立文件不混 stdout E2E_ 面）· Key 只经进程 env name-only · est live ≤25（同判别 run 口径·sidecar 双计）· pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· 实现不自批 · alone≠dual。

## 5. 验收
trace 三戳收据+EXIT 原值+三向判读结论+flag 关态回归证明（E2E_BOOT_TRACE 未设时 NODE_OPTIONS 零附加·diff 亲证）· 收据 `ai-docs/delivery/receipts/g7p2-boot-intercept/` · node --check 过。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ 根因定谳（=定靶细分）≠ trio 面 ≠ g7SuiteGreen 翻转 · 装载钩子对被测进程的性能扰动如实记（T1-T2 含钩子开销）。
