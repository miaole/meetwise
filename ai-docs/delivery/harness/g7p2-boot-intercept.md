# G7P-2 — wrapper code 截获刀（真实链装载红 vs 旅程红切分）

**状态**：`exec_done:awaiting_post_prove_dual`（rev2 `064fc37e` EXEC 已毕 2026-10-08：钩子 154 行+run-e2e.mjs diff 7 行默认关门控落树 · 判别 run 恰 1 attempt EXIT=1 class=api **四向向 3 命中**——T1/T2/T3 全达〔装载面 364ms 健康·装载红证伪〕·红点=T3 后 13ms 首断言后紧邻旅程步〔第 2 断言 consent 面〕·零装载类异常码·120s 挂死界未触发 · sidecar v2 双计 0≤est25 · 收据 receipts/g7p2-boot-intercept/00-exec.md）· base = 主线 `251618d5` · 分支 `line/g7-boot-intercept` · 立项依据 = G7P-1 nail 裁定（向④降格采信+环境外推缺口关闭需求·席2 建议被采纳）。

## 1. 目标
在**历史红环境**（主 checkout 真实链）切分 E2EFAIL-1 形状（23.3s/0 行/双计 0）的两拟合解：**装载红**（tsx spawn→full.e2e.ts 模块装载期 throw/超时）vs **旅程红**（装载完成后首测试行前死/旅程中死）——G7P-1 探针（复刻链）无法区分此两面。

## 2. 手段（flag 门控·零产品码·默认关）【rev2·双席六处方合并落实】
1. 新增 `scripts/e2e-boot-trace.mjs`（装载钩子模块）：经 NODE_OPTIONS `--import` 注入（**追加不覆盖**——保留既有 NODE_OPTIONS）——记录三时间戳：**T1** tsx child process start、**T2** full.e2e.ts entry onLoad 触发（**注意 ESM 语义：entry onLoad 在其 14 个静态 import 解析之前触发——T2≠依赖解析完成**）、**T3** 首测试行执行。**逐戳即时落盘**（appendFileSync·SIGKILL 安全非缓冲）+JSON 内嵌 run 身份（pid+启动时刻）+**run 前 unlink 陈旧文件亲证**。**钩子全程自守 try/catch**（钩子自身异常不得制造新红——自守失败=向 0）+终端异常捕获（in-child process.stderr.write 分类 ERR_*（ERR_MODULE_NOT_FOUND/ERR_UNSUPPORTED_DIR_IMPORT/编译类）+uncaughtException/unhandledRejection 记录后原语义 rethrow/exit）。
2. `scripts/run-e2e.mjs` 最小接线（env-flag 门控可回退·追加语义）：仅当 `E2E_BOOT_TRACE=1` 时给 tsx child 的 extraEnv 附加 `--import`（保留既有 NODE_OPTIONS）——**默认关零行为变化**（CI 零触碰·diff ≤10 行）。
3. 跑恰 1 run：`E2E_BOOT_TRACE=1 pnpm e2e:isolated`（真实链主 checkout 环境）。**挂死界预注册（run 前固定）：spawn 后 120s 无 T2 ⇒ 外部 kill ⇒ 判装载红·挂死**（链上无外层超时——run-e2e.mjs :150-154 仅 exit 面·isolated :2157-2183 无 timeoutMs·kill 后 appendFileSync 面仍可回收）。

## 3. 预注册四向判读（EXIT 原值+trace 三戳+既有收据面联判）【rev2】
- **向 0·T1 前死（spawn/注入面崩）**：JSON 零戳或非零 EXIT 快败（node --import 解析失败/tsx cli 断链/钩子自守失败）⇒ **trace 刀自身失败不并入装载红**——修刀后重跑不计重跑至绿（run 未生效）；
- **向 1·装载红**：**T3 未达 且（T2 未达 或 退出前记录到装载类异常码 ERR_*/编译类）**〔rev2 键修正：ESM entry onLoad 先于静态 import 解析——import 断链发生在 T2 之后，旧键「T2 未达」单独不足以判装载红〕或 120s 挂死界命中 ⇒ 红因=模块装载/依赖解析面 ⇒ 修复刀定靶装载面；
- **向 2·旅程红**：T2 达+无装载类异常码+T3 前死 ⇒ 启动后早期旅程死 ⇒ 归旅程段细分刀；
- **向 3·旅程中红/绿**：T3 达 ⇒ 红在旅程深处（对照 ledger 行数分位）⇒ 归 G7X ①面延续；绿 ⇒ 环境噪声候选增强+**G7P-1 环境限制分支残余面（children env MODEL_API_KEY 有/无·MODEL_ENDPOINT_PROFILE 钉值差）逐向记录**。
四向如实入收据禁洗绿禁重跑至绿（向 0 重跑豁免条款除外）。

## 4. Ban
零产品码（apps/packages src 零改）· run-e2e.mjs 改动仅 flag 门控默认关（diff ≤10 行）· 既有收据解析器零触碰（trace 走 stderr+独立文件不混 stdout E2E_ 面）· Key 只经进程 env name-only · est live ≤25（**G7P-1 nail 原裁定 est 0 的上调偏差显式登记**：绿分支跑满 live 套件 est 0 必假·沿判别 run 口径 sidecar 双计·**链累计硬帽 200 沿 CMOP03-F 先例**）· pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· 实现不自批 · alone≠dual。

## 5. 验收
**trace 唯一收据源=`.tmp/e2e-boot-trace.json`**（stderr 份在 isolated 链 :2163 被丢弃=死信——文件份为准·回收步骤：run 后由 EXEC 亲读 JSON 转录收据）+EXIT 原值+四向判读结论+flag 关态回归证明（E2E_BOOT_TRACE 未设时 NODE_OPTIONS 零附加·diff 亲证·不增第二 run）· 收据 `ai-docs/delivery/receipts/g7p2-boot-intercept/` · node --check 过。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ 根因定谳（=定靶细分）≠ trio 面 ≠ g7SuiteGreen 翻转 · 装载钩子对被测进程的性能扰动如实记（T1-T2 含钩子开销）。
