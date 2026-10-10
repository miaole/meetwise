# GODFN-1a · attempts 台账 + prove 终态（EXEC 复跑收口态 · 22 键全终态）

**状态**：`exec:awaiting_post_prove_dual`（拆解完成 · 22 键全终态：17 键 EXIT=0 + 5 键 base≡red 配对零回归 · 零 retry-to-green · Ban self-approve · post-prove 双审待协调方）
**Date**：2026-10-09 · EXEC 席 mw-core · worktree `meetwise-line-godfn1a` · branch `line/godfn-1a-invoke`
**基点**：REQUEST rev2 `737c0f24`（唯一蓝本：设计 `godfn-decompose.md` @`37705a3e` + 薄壳 `godfn-1a-exec.md`）· 分支历史：`6c31811a`（拆解+停刀台账）→ `cb029f8b`（cherry-pick RCPT-1 EXEC `873ca3f1` · 协调方裁决处方 α 变体）→ 本收口 commit
**Pins 十值逐字承卷**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false**（trio 红·Ban flip） · r1Closed=false ·（表外沿注）actualSpendCny=null · GAP-DEBT-BE-GODFN P1 OPEN 保持

---

## 0. 裁决执行记录（协调方 2026-10-09 · M1/M2/trio 三项）

- **M1**：59 断源雷已被 RCPT-1 刀修复（双审 BOTH PASS · nail c63cc36b · EXEC `873ca3f1` · 主线 e75833da 已收账）。处方=α 变体免新刀：本 worktree cherry-pick `873ca3f1` → commit **`cb029f8b`**（冲突 1 处=RCPT-1 harness 文件 DU·按忠实取全解决；runner 本体干净并入·与 873ca3f1 版本 `git diff` 空=逐字节全等）→ 断源清零亲证（receipt-map 441 源 / **missing 0**）→ M1 键各恰一次重跑。
- **M2**：interview-dispatch-pg 远程云 PG=Ban buy cloud 域 → **base≡red 配对登记收案**（不修不豁免 · 设计 §5 门覆盖 · HC-GAP-001 既有口径）。
- **trio**：M1 解除后三键照跑（chromium 沿 2026-09-17 获批 prereq 刀同法 `pnpm -C apps/web exec playwright install chromium` 重装 · Key 经授权 loader `~/.meetwise-secrets/load-model-api-key.sh` 注入 name-only 零回显 · `G7_FREETIER_REPROVE=1` G7P 同口径 · est ≤25/run 链记账）。
- **1d 冻结**：维持至本刀收口（post-dual+nail）。

## 1. 拆解本体（不变 · 复述要点）

- 唯一触面 `packages/ai-runtime/src/invoke.ts` · blob **`6668eff7` → `28d0d7a7`**（774→932 行）· runner blob 经批准演进 `ee762a8ca62c → 85ef4808`（=RCPT-1 EXEC `873ca3f1` 版本·逐字节全等·三钉面由协调方裁决+RCPT-1 双审批账，非本刀发起触碰）。
- 行界对照：主函数 invoke **:403-447** 只编排；相位 1 `invokeResolveAndPreparePhase` **:549-599**（原 :404-461）；相位 2 `invokeClaimPhase` **:601-624**（原 :463-482）；相位 3 `invokeAdmitPhase` **:626-719**（原 :487-570）；相位 4 `invokeReserveAndDispatchPhase` **:721-785**（原 :572-629）；相位 5 `invokeExecuteAndSettlePhase` **:787-932**（原 :631-773）；`prepareModelPlan` **:532-547**（原 ：429-441 闭包外提）。
- :1-402 字节零触碰；导出面签名零变；index.ts:9-10 与四调用方零触碰；跨相位状态全显式参数对象；typecheck strict 下 invoke.ts 零错（3 处 domain 预存错与本刀无关已登记）。
- 已披露纯外观差：相位签名类型化后 `leaseToken!`/`plan!` 冗余 `!` 去除（`settledUsage!`/`value!` 原样保留）。

## 2. prove 终态（§5.1 22 键 · 逐键终态 · 全 EXIT 亲测）

### 2.1 EXIT=0（17 键）

| # | 键 | 载体 | EXIT | 亲测读数 |
|---|---|---|---|---|
| 1 | ai-runtime `prove:breaker` | 直跑 | 0 | 全 PASS |
| 2 | ai-runtime `prove:failover` | 直跑 | 0 | 全 PASS |
| 3 | ai-runtime `prove:usage-estimate-threading` | 直跑 | 0 | 全 PASS |
| 4 | worker `prove:interview-dispatch` | 直跑 | 0 | fairness unit |
| 5 | worker `prove:adaptive-grounding` | 直跑 | 0 | |
| 6 | worker `prove:adaptive-offtopic` | 直跑 | 0 | |
| 7 | worker `prove:adaptive-chaos` | 直跑 | 0 | 96 场景 |
| 8 | worker `prove:adaptive-latency` | runner `adaptive-latency:prove` | 0 | |
| 9 | worker `prove:adaptive-flow` | runner `:raw` | 0 | 真 deps 接线端到端 |
| 10 | worker `prove:adaptive-life` | runner `:raw` | 0 | 生命周期 |
| 11 | ai-runtime `prove:claim-join-orphan` | runner `runtime:claim-join:prove:raw` | **0（M1 重跑·恰一次）** | 5 PASS+收据落盘 |
| 12 | ai-runtime `prove:model-cost` | runner `model-cost:prove:raw` | **0（M1）** | 11 PASS |
| 13 | ai-runtime `prove:estimate-threading-invoke` | runner `:raw` | **0（M1）** | 4 PASS |
| 14 | ai-runtime `prove:failover-price-policy` | runner `:raw` | **0（M1）** | 8 PASS |
| 15 | ai-runtime `prove:usage-calibration-reconciler` | runner `model-op00-usage-reconciler:prove:raw` | **0（M1）** | 28 PASS |
| 16 | ai-runtime `prove:model-op02` | runner `model-op02:prove:raw` | **0（M1）** | 24 PASS |
| 17 | worker `prove:adaptive-degrade` | runner `:raw` | **0（M1）** | 11 PASS |

### 2.2 base≡red 配对零回归（5 键 · 设计 §5「EXIT=0 或 base 同红零回归」）

| # | 键 | head 实测 | base(737c0f24) 实测 | 判 |
|---|---|---|---|---|
| 18 | worker `prove:adaptive-consumer` | runner `:raw` EXIT=1 · 证明体 `4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN UNKNOWN` · **收据层已绿**（RCPT-1 后收据落盘 exit=1 诚实在卷） | 同签名 `4/4 child_exit_nonzero` | **证明体预存红 · base≡head 逐字节同类配对**（M1 重跑恰一次·非 retry） |
| 19 | worker `prove:interview-dispatch-pg` | 直跑 EXIT=1 `interview_dispatch_prove_requires_remote_postgres` | 同类同错 | **远程云门 · 裁决收案**（M2 · Ban buy cloud） |
| 20 | root `e2e:isolated` | EXIT=1 · `class=api` · 账本 15 reservation/14 release/**14 call** · 141s | EXIT=1 · `class=api` · **15/14/14** · 140s | **trio 配对**（stderr withhold 契约内可观测面全等 · G7P-4 同族红：达模型面 · G7 线所有 · 零归因） |
| 21 | root `e2e:ui:isolated` | EXIT=1 · `class=frontend code=client_exited` · 账本 5/4/**4** · 232s | EXIT=1 · 同类 `frontend client_exited` · **5/4/4** · 233s | **trio 配对** |
| 22 | root `verify:e2e-performance` | EXIT=1 · `e2e_performance_suite_failed:HTTP full E2E:exit=1`（步 1 即红）· 账本 15/14/**14** · 171s | EXIT=1 · 同错误行 · **15/14/14** · 171s | **trio 配对**（内部首步=同一 e2e:isolated 旅程红） |

**零回归总判**：head 全部红均可 base 同类配对；head 绿 17 键含 invoke 全状态机直证（claim/admit/reserve/settle/breaker/cost 双层）。`g7SuiteGreen=false` 维持（trio 红=G7P 线所有旅程红家族 · 本刀零归因零修复）。

### 2.3 live 记账（G7P 同口径 · 双计=call 行 · dispatching 不计 · Key name-only）

| run | 树 | 键 | live 实账 | est |
|---|---|---|---|---|
| t1 | head | e2e:isolated | **14**（qwen3.8-flash · evidenceClass=free_quota_wiring_only · estimatedCostCny=0） | ≤25 ✓ |
| t2 | head | e2e:ui:isolated | **4** | ≤25 ✓ |
| t3 | head | verify:e2e-performance | **14**（步 1 旅程） | ≤25 ✓ |
| t4 | base | e2e:isolated | **14** | ≤25 ✓ |
| t5 | base | e2e:ui:isolated | **4** | ≤25 ✓ |
| t6 | base | verify:e2e-performance | **14** | ≤25 ✓ |

链记账：G7P 系现行 **14** + 本刀 6 run 实账 **64** = 链累计 **78** ≪ 硬帽 200 · **actualSpendCny=null**（free-tier wiring 口径 · 无计价数据源 · Ban invented spend）· 账本 NDJSON：head `.tmp/g7-ledgers/g7-{46371…,52447…,59405…}` / base `…-base/.tmp/g7-ledgers/g7-{60943…}`（gitignored · 路径登记不随卷）。

## 3. attempts 全账（续 · a1-a22 见停刀版台账 · git 历史 `6c31811a` 在卷）

| # | 键/run | EXIT | 定性 |
|---|---|---|---|
| a23 | cherry-pick `873ca3f1` | n/a | 裁决处方执行 · 冲突 1 处（DU harness 文件）忠实取全 · runner 与上游逐字节全等 |
| a24-a30 | M1 七键重跑（claim-join/model-cost/estimate-threading/failover-price-policy/usage-calibration/model-op02/adaptive-degrade） | 0×7 | **恰一次·首跑即绿**（收据层修复生效·证明体原绿） |
| a31 | adaptive-consumer 重跑（恰一次） | 1 | 证明体预存红同签名·收据层转绿·**base≡head 配对**已立 · 非 retry-to-green（无翻绿） |
| a32 | trio t1 head e2e:isolated | 1 | G7 旅程红家族（class=api·live 14） |
| a33 | trio t2 head e2e:ui:isolated | 1 | frontend client_exited·live 4 |
| a34 | trio t3 head verify:e2e-performance | 1 | 步 1 HTTP full E2E 红·live 14 |
| a35-a37 | trio t4-t6 base 三键 | 1/1/1 | **base≡head 三配对成立**（签名+账本+时长全等族） |

零「红→绿 retry」attempt；所有红为 base≡red 结构性预存（G7 旅程 / 远程云门 / adaptive-consumer 证明体），零归因本刀。

## 4. 禁触面与边界核验（收口态）

- 三钉：`interview.service.ts` / `text-endpoint-config.ts` 本刀零 diff；`run-e2e-isolated.mjs` 本刀唯一 delta=`cb029f8b`（协调方裁决批准的 RCPT-1 修复搬移·非本刀发起）。
- §7.3 1d 面（voice.ts :453 / model-client.ts :517）零触碰 · 零迁移 · 零 SSOT/backlog 翻转 · 「1a 先于 1d」序维持（1d 冻结至本刀 post-dual+nail）。
- 四调用方 + index.ts:9-10 唯一出口零触碰 · `invoke` 导出面签名零变。
- Key 全程 name-only（零键值回显入日志/收据）· `.env*` 全程 ABSENT 零创建零读取 · 秘密门 `check-staged-secrets` 过（6c31811a 提交时亲证）。

## 5. 残留登记（零静默丢弃）

- **adaptive-consumer 证明体红**（4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN · base≡head 同类）：非本刀范围（worker adaptive consumer 域 · 非收据层）· 建议协调方另立刀或挂账；本刀如实收案于 §2.2#18。
- **G7 旅程红**（trio 三键 · base≡head 配对）：G7P 线所有 · POST7B/`:107`/G7P-5 探针继续 · `g7SuiteGreen=false` 维持。
- base worktree `~/Desktop/golucky/meetwise-line-godfn1a-base`（737c0f24）留待 post-dual 席复核配对证据，处置权归协调方。

---

*GODFN-1a EXEC 收口台账 · 2026-10-09 · 22 键全终态（17 绿 + 5 base≡red 配对）· 零 retry-to-green · push 后 STOP awaiting_post_prove_dual · Ban self-approve · alone ≠ dual · actualSpendCny=null · 链累计 78 ≪ 200*
