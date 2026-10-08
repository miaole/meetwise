# GODFN-1a · attempts 台账 + prove 终态（EXEC 停刀态 · 雷点在卷）

**状态**：`exec:stopped_prove_mine:awaiting_coordinator_ruling`（拆解本体完成并 typecheck 过 · prove 面遇预存基建雷 · Ban 触三钉 blob 故立即 STOP · 零 push · Ban self-approve）
**Date**：2026-10-09 · EXEC 席 mw-core · worktree `meetwise-line-godfn1a` · branch `line/godfn-1a-invoke`
**基点**：REQUEST rev2 `737c0f24`（唯一蓝本：设计 `godfn-decompose.md` @`37705a3e` + 薄壳 `godfn-1a-exec.md`）
**Pins 十值逐字承卷**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false ·（表外沿注）actualSpendCny=null · GAP-DEBT-BE-GODFN P1 OPEN 保持

---

## 1. 拆解本体（已完成 · 未 push）

- 唯一触面：`packages/ai-runtime/src/invoke.ts` · blob 演进 **`6668eff7` → `28d0d7a7`**（+196/−38 · 文件 774→932 行 · 工作树在卷未 commit→ 本台账同 commit 落卷）。
- 行界对照（拆解前 → 拆解后）：

| 相位 | 拆解前 | 拆解后（新行界） |
|---|---|---|
| 主函数 invoke（只编排） | :403-774 | **:403-447**（签名/jsdoc 零变 · 五次相位调用+terminal 早退） |
| 相位 1 resolve+prepare | :404-461 | `invokeResolveAndPreparePhase` **:549-599** |
| 相位 2 claim | :463-482 | `invokeClaimPhase` **:601-624** |
| 相位 3 admit | :487-570 | `invokeAdmitPhase` **:626-719** |
| 相位 4 reserve+dispatch | :572-629 | `invokeReserveAndDispatchPhase` **:721-785** |
| 相位 5 execute+settle | :631-773 | `invokeExecuteAndSettlePhase` **:787-932** |
| preparePlan 闭包（原 :429-441） | invoke 内 | 模块级 `prepareModelPlan` **:532-547**（spec/executionTimeoutMs 显式传参 · 供相位 1/3） |

- :403 之前（1-402 行 · 含 isHalfOpenFollower :199-201 / releaseSharedAdmissionBestEffort / persistTraceBestEffort / ALS 等）**字节级零触碰**（diff 首 hunk 始于 :403 上下文）。
- 导出面签名零变：`invoke<T>(spec, pool, owner)` + 全部导出 type 原样；`index.ts:9-10` 唯一出口零触碰；四调用方（interview-service / adaptive-interview-service / resume-ocr / job-route-classify）零触碰。
- 跨相位状态经显式参数对象（InvokePrepared/InvokeClaimed/InvokeAdmitted/Invoke*Args）；span 以显式参数传递（不可变函数值，无可变闭包共享态）。
- 已披露的纯外观差：原 `leaseToken!`/`plan!` 冗余非空断言在相位签名类型化（`leaseToken: string`）后去 `!`（语义等价·非行为面）；`settledUsage!`/`value!` 原样保留。
- 禁触面核验：三钉 blob 全等（run-e2e-isolated.mjs `ee762a8ca62c` base≡head · text-endpoint-config.ts 未触 · interview.service.ts 未触）；§7.3 1d 面（voice.ts :453 / model-client.ts :517）未触；零迁移/零 SSOT/零 G7 判定面。
- typecheck：workspace strict 全旗（tsc --noEmit 经 .tmp/godfn1a.tsconfig.json）**invoke.ts 零错误**；仅 3 处 packages/domain 预存错误（adaptive-interview.ts:113 / interview-control-signals.ts:103 / privacy-erasure-preview.ts:159 · 本刀未触 domain · 无 typecheck 门现状下的诚实登记）。

## 2. prove 终态（§5.1 22 键 · 逐键实录 · 全 EXIT 亲测）

**live 实账=0**（全程 MODEL_API_KEY unset · 零 loader 注入 · 零 provider 外呼 · 零 G7 账本行：`.tmp/g7-ledgers/` 空 · 双计口径 0=0+0）· `actualSpendCny=null` · Key name-only（零键值回显）。

### 2.1 绿（EXIT=0 · 10 键）

| 键 | 载体 | EXIT | 备注 |
|---|---|---|---|
| ai-runtime `prove:breaker` | 直跑 | 0 | 全 PASS |
| ai-runtime `prove:failover` | 直跑 | 0 | 全 PASS |
| ai-runtime `prove:usage-estimate-threading` | 直跑 | 0 | 全 PASS |
| ai-runtime `prove:model-op02`→(见 2.2 收据层雷) | — | — | 非绿组 |
| worker `prove:interview-dispatch` | 直跑 | 0 | fairness unit proof |
| worker `prove:adaptive-grounding` | 直跑 | 0 | |
| worker `prove:adaptive-offtopic` | 直跑 | 0 | |
| worker `prove:adaptive-chaos` | 直跑 | 0 | 96 场景矩阵 |
| worker `prove:adaptive-latency` | runner `adaptive-latency:prove` | 0 | 快/质量模型路由断言过 |
| worker `prove:adaptive-flow` | runner `adaptive-flow:prove:raw` | 0 | 真 deps 接线端到端过 |
| worker `prove:adaptive-life` | runner `adaptive-life:prove:raw` | 0 | 生命周期全绿 |

（注：「真模型调用确实发生」系 runner fake-service seam 断言，非 provider 外呼；本刀全程零 Key。）

### 2.2 预存红 · base≡red 零回归（9 键 · 雷点 M1 主断 + M2 远程门）

**M1 · 隔离收据层断源雷（8 键）**：runner `isolatedReceiptSources` 含 **59 个不存在路径**（457 源中 · 17 个 `packages/db/src/<域>/` 域目录类）——E4 微刀 `8beaf0a6`（2026-10-08 · 本线历史内）把 245 处收据源路径文本预指向 dir-structure 线 B1 域目录（`409843b3` **仅存于 `line/dir-structure` 未并入本线**），而 `writeLocalIsolatedReceipt→sourceDigests` 对缺失路径 `readFile` 必抛 ENOENT → `process.exitCode=1`。**证明体与收据层双双解耦定谳：证明体绿 ≠ 命令绿**。修复=改三钉 blob（`ee762a8ca62c` base≡head 全等亲证）→ 本刀 Ban 触 → 立即 STOP。

| 键 | runner 载体 | head 实测 | base(737c0f24) 实测 | 判 |
|---|---|---|---|---|
| `prove:claim-join-orphan` | `runtime:claim-join:prove:raw` | 5 PASS+✓passed+RECEIPT ENOENT → **EXIT=1** | 同形 5 PASS+✓+ENOENT → **EXIT=1** | **base≡head 同类配对** |
| `prove:model-cost` | `model-cost:prove:raw` | 11 PASS+ENOENT → EXIT=1 | （机理同·deterministic） | 预存收据层红 |
| `prove:estimate-threading-invoke` | `estimate-threading-invoke:prove:raw` | 4 PASS+ENOENT → EXIT=1 | 同上 | 同上 |
| `prove:failover-price-policy` | `failover-price-policy:prove:raw` | 8 PASS+ENOENT → EXIT=1 | 同上 | 同上 |
| `prove:usage-calibration-reconciler` | `model-op00-usage-reconciler:prove:raw` | 28 PASS+ENOENT → EXIT=1 | 同上 | 同上 |
| `prove:model-op02` | `model-op02:prove:raw` | 24 PASS+ENOENT → EXIT=1 | 同上 | 同上 |
| worker `prove:adaptive-degrade` | `adaptive-degrade:prove:raw` | 11 PASS+ENOENT → EXIT=1 | 同上 | 同上 |
| worker `prove:adaptive-consumer` | `adaptive-consumer:prove:raw` | `ISOLATED_PROOF_SUMMARY 4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN` + ENOENT → EXIT=1 | **逐字节同类** `4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN` → EXIT=1 | 证明体亦预存红·**base≡head 配对** |

**M2 · 远程云隔离门（1 键）**：worker `prove:interview-dispatch-pg` 须 `E2E_CLOUD_ISOLATED=1` 远程私有 IP PG（本地 Docker/loopback 禁 · Ban buy cloud）——head 与 base 双跑同类确定红 `interview_dispatch_prove_requires_remote_postgres` → **base≡head 配对**（HC-GAP-001 行既有口径：本环境无通过回执）。

### 2.3 未跑（3 键 · trio）

`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` —— **not_run（如实登记·零洗）**：雷点 M1 裁定回协调方在先；trio 虽不在断源收据清单（亲核三目标不在 isolatedReceiptSources），但收据层裁定后树必变，按 est ≤25/run 与 live 链记账纪律不在注定重跑轮烧 live 预算。G7 trio 之红本体为 G7P 线所有（G7P-4：consent 200 干净·死点 F2→F3 双断言窗·live 14），本刀零归因。

## 3. attempts 全账（逐 attempt · 零 retry-to-green · 零洗）

| # | 键 | EXIT | 定性 |
|---|---|---|---|
| a1 | prove:breaker | 0 | 首跑绿 |
| a2 | prove:failover | 0 | 首跑绿 |
| a3 | prove:usage-estimate-threading | 0 | 首跑绿 |
| a4 | runtime:claim-join:prove:raw（head） | 读数失效 | **管道度量缺陷**（`\| tail` 使 EXIT 读 tail）· 输出面 5 PASS+✓+RECEIPT ENOENT · 如实记 invalid-measure 非 retry 洗 |
| a5 | prove:interview-dispatch | 0 | 首跑绿（正确 EXIT 捕获） |
| a6-a8 | prove:adaptive-grounding / -offtopic / -chaos | 0/0/0 | 首跑绿 |
| a9 | adaptive-flow:prove:raw | 0 | 首跑绿 |
| a10 | adaptive-life:prove:raw | 0 | 首跑绿 |
| a11 | runtime:claim-join:prove:raw @base | 1 | **M1 配对左半**（5 PASS+ENOENT） |
| a12 | runtime:claim-join:prove:raw（head 重跑·正确捕获） | 1 | **M1 配对右半**（5 PASS+ENOENT·同类） |
| a13 | prove:interview-dispatch-pg（head） | 1 | **M2 配对右半**（remote gate 确定红） |
| a14 | prove:interview-dispatch-pg（base） | 1 | **M2 配对左半**（同类） |
| a15-a21 | model-cost / estimate-threading-invoke / failover-price-policy / model-op00-usage-reconciler / model-op02 / adaptive-degrade / adaptive-consumer :raw（head） | 1×7 | M1 族实录（PASS 数 11/4/8/28/24/11/0+4F） |
| a22 | adaptive-consumer:prove:raw @base | 1 | M1 族配对左半（4/4 同类） |

零「红→绿 retry」attempt（无一键靠重跑翻绿）；a4 的 EXIT 读数失效以重跑+正确捕获补救并双录。

## 4. 待协调方裁定（M1 处方选项 · 席位不裁）

- **(α) 授权三钉 blob 收据层微刀**（沿 E4 先例：恰 59 路径文本 `packages/db/src/<域>/x` → `packages/db/src/x` · 零逻辑 · 五契约门复验 + 1a 全 22 键 prove 重开轮）——须另立 REQUEST+双审，1a EXEC 在新 base 上复跑；
- **(β) 等 dir-structure 线 B1 并入**后 1a 重开；
- **(γ) 按设计 §5「base 同红零回归」条款采信 M1 九键**（配对证据已全在卷）+ trio 补跑轮。

席 mw-core 不预设。**「1a 先于 1d」序登记**：M1 裁定前 1d 不得开刀（invoke 触面交叉未闭）。

## 5. 顺带登记（零处置）

- base worktree `~/Desktop/golucky/meetwise-line-godfn1a-base`（737c0f24 · 装有 node_modules）——M1/M2 配对取证基建，留存待复审，处置权归协调方。
- 席2 建议随案：E4 与 B1 的「路径文本先行/文件搬移后行」跨线次序缺陷宜在 dir-structure 线 harness 登记 erratum（本刀零动作）。

---

*GODFN-1a EXEC 停刀台账 · 2026-10-09 · 拆解完成+10 键绿+9 键 base≡red 配对+3 键 not_run · 零 push · Ban self-approve · awaiting_coordinator_ruling · actualSpendCny=null · live=0*
