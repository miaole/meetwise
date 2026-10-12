# AG-COST1 — 成本轨第①步：AG-07 止血开关 + #48 cached_tokens 观测（B 席六步之① ∥ 最小一刀 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：meetwise 战役 AG 成本轨第①步起草席（AG-07 止血开关 + #48 cached_tokens 观测 · EXPERT-REVIEWS §七 成本轨 B 席六步之 **①**——「①与②合并一个发布窗口」的前半·②迁移三件套系后继刀·与失败语义轨 A 席六刀零硬依赖可并行）。
**基线**：`feat/mysql-schema-skeleton` @ `b95c9c4b`（开工建树时点主线 tip·`git log -1` 实测 2026-10-11·docs(ssot) TTL-WIRE nail 登记笔。起草窗口内主线自 `ce021b22` 前移一笔——仅 2 .md 文件·11 个本刀 code blob 两 tip 逐字节不变亲证·§0.3 登记）。分支 `line/ag-cost1-bleed-observe` · 工作树 `meetwise-cost1`（`git worktree add ../meetwise-cost1 -b line/ag-cost1-bleed-observe` 仓根同级·本起草席已立·建前亲证：worktree list 13 树无 cost1·`branch -a | grep -iE "cost|ag7|calib"` 命中仅 cmop03-weak-input-calib/g7v-spec-calib-thirdarm/model-op00-calibration-dispatch 三条**无关旧线**）。
**防重双对表（亲证）**：`rg -n "ag-cost1|止血" ai-docs/delivery/harness/` → 「止血」8 处命中全系 SCOR（gap-scor-p0cb-inventory/e2e-full-suite.inventory）/ERRMSG/DBHY 域**登记性引用**·`ag-cost1` **零命中**·harness 185 卷无同名刀卷；`rg -l "成本轨|失败语义轨|AG-07|cached_tokens" ai-docs/delivery/harness/` → **EXIT=1 零命中**（AG 战役本卷=成本轨首卷）。→ **停止条件未触发·可建树落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-07 详情 **:125-134** + 总览 **:19** + #48/#49 总表引用行 **:550**（「维持 P3；先接 cached_tokens / prompt_cache_hit_tokens 观测再下结论」）②同目录 `EXPERT-REVIEWS.md` **§七 :67 成本轨①（修法权威：env 旋钮·60s 硬编码需发版 ∥ 区分字段缺席≠零）** + **§一 :10**（AG-07 P1→P2 专家裁定·止血零功能代价）+ **:73 缓存结论补强**（DeepSeek 侧先观测正确·补字段缺席≠零细节）③同目录 `review-log.md` AC-F20 **:86** + AC-F1 **:67** + AC-F2 **:68**（DeepSeek 字段名 prompt_cache_hit_tokens 已由官方文档核实）+ §四 **:139-141**（百炼 usage.prompt_tokens_details.cached_tokens / DeepSeek prompt_cache_hit_tokens 外部核对）④形制沿 `authz-harden-REQUEST.md` / `e2e-scene-409-REQUEST.md`（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `b95c9c4b`·file:line 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚表（@`b95c9c4b`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `apps/worker/src/usage-calibration-reconcile.ts` | `d3c8e5438f7e` | **止血主触面**：worker 调度侧（:18-24 hourBatch / :33-60 tick / :63 默认 60_000） |
| 2 | `packages/ai-runtime/src/usage-calibration-reconciler.ts` | `8b7b257bc849` | 域级本体（**零字节**·:79-85 resolveLatestCalibratedFactor 生产零调用 / :103-170 reconcileUsageCalibration 全历史配对·背景） |
| 3 | `apps/worker/src/main.ts` | `00ba4084fbbb` | 调用点（:710 不传参 / :738 ready / :772 drainStops） |
| 4 | `packages/ai-runtime/src/model-client.ts` | `27eb7516591b` | **观测主触面**：usage 解析（非流 :623/:668-670 + 流式 :824/:842/:849-853/:937-939 + onUsage :497/:758） |
| 5 | `packages/ai-runtime/src/invoke.ts` | `68e3c1f41bd3` | ModelUsage 型 :48-58 / settle 消费 :335-347（**零触·不改计费**）/ tracer :574 |
| 6 | `packages/ai-runtime/src/metrics.ts` | `2adc31554c07` | **既有观测 metric 形制**：METRIC 单真源 :72-104 + registerBaselineMetrics 基线预注册 :110-151 |
| 7 | `packages/ai-runtime/src/langfuse-v5.ts` | `35db0c325044` | record() usageDetails 只挂 input/output :166-176（AG-24 model=service 名面·背景·归后继） |
| 8 | `apps/worker/src/model-invocation-reconcile.ts` | `119323b981b5` | **env 旋钮形制先例**：boundedInteger :34-40 + resolveModelInvocationReconcileConfig :42-59（非法值启动失败纪律） |
| 9 | `apps/worker/src/drain-loop.ts` | `2b745935a29b` | runDrainLoop(tick, intervalMs = 5000) :18（间隔机械·止血只改传入值不改循环本体） |
| 10 | `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a79da` | 背景：:399-413 观测表 PK(owner,batch,invocation_idempotency_key) **含 batch** + :438-470 配对函数 ai_usage_calibration_pairs_scoped 单参 owner **无时间窗** |
| 11 | `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` | `8288a57d697e` | 背景：:11-23 gateway_usage_calibration_owners() 枚举**全部**有配对 owner·WHERE 无时间窗 |

### 0.2 漂移登记（复核快照 `2fab7946` → 现树 `b95c9c4b`·全亲读重 pin）

| 复核快照锚 | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| reconcile.ts :61-63（60s） | `:63` `runUsageCalibrationReconciler(pool: DbPool, intervalMs = 60_000)`（:62 注释「默认 60s」原文） | 行号微漂·结论不变 |
| reconciler.ts :103-140（全量配对逐条 INSERT） | `:103-170` 函数体全长亲证·前段 :103-140 逐行仍在（:110 listUsageCalibrationPairs 读全历史·:133-140 insertUsageCalibrationObservation 逐条） | 区间延展·结论不变 |
| model-client.ts :406/:452（只读两字段） | 非流面 `:623`（fetch 类型 `usage?: { prompt_tokens?: number; completion_tokens?: number }`）+ `:668-670`（`inputTokens: j.usage.prompt_tokens ?? 0, outputTokens: j.usage.completion_tokens ?? 0`）·**另增流式面** `:824`/`:842`（两处类型同形）+ `:849-853`（usagePayload+onUsage）+ `:937-939`（终局 usage 同形 `?? 0`） | **红事实在现树更广**（流式解析面系复核快照后接线·两字段口径不变） |
| main.ts 调用点（快照未记行号） | `:710` `runUsageCalibrationReconciler(pool)` **不传 intervalMs** | 补 pin |
| 0119 :399-413/:438-470 | 现树亲证（PK 三列含 batch·:438 起 SECURITY DEFINER 配对函数仅 p_owner_user_id 一参无时间窗） | 不变 |
| 0134 owner 枚举无时间窗 | `:11-23`（`SELECT DISTINCT i.owner_user_id … WHERE estimate_input_tokens IS NOT NULL AND completed_at IS NOT NULL`·无时间谓词） | 不变 |

### 0.3 现势并发登记（强制）

1. **主线前移**：起草窗口内 `ce021b22 → b95c9c4b`（TTL-WIRE nail docs(ssot) 登记笔·`git diff --stat` 恰 2 .md：execution-master-checklist + product-campaign-LEDGER）——本刀 11 个 code blob 两 tip **逐字节不变**亲证（§0.1 表即 @b95c9c4b 实取）·基线取建树时点 tip `b95c9c4b`。
2. **跨轨文件交点**：失败语义轨刀 B（AG-06·model-client dispatchOnce 返回与 parse 之间管道改造）与本刀共享 `model-client.ts` 触面——本刀动 usage 对象**字段读取**（:668-670/:937-939 解析行+类型行）·刀 B 动 catch 管道——同文件不同区·互不为前置（§4）·先落者为准后到者照 §0 重 pin。

## §1 红事实 + 修法

### 红事实 A（AG-07 止血面·现 pin 全亲证）

| 面 | 锚（@`b95c9c4b` 实测） | 事实 |
|---|---|---|
| 60s 硬编码 | `usage-calibration-reconcile.ts:63` `intervalMs = 60_000` 默认参 | **零 env 旋钮**：`rg "USAGE_CALIBRATION" apps packages docker` → **EXIT=1 全仓零命中**（含 docker/env 样例）——改间隔必须发版 |
| 调用不传参 | `main.ts:710` `runUsageCalibrationReconciler(pool)` | 唯一调用点不传 intervalMs·默认 60s 直接生效（:738 ready / :772 drainStops 注册同卷） |
| 每 60s 全 owner 扫描 | `reconcile.ts:33-60` tick→`gatewayUsageCalibrationOwners`（0134:11-23 枚举**全部**有配对 owner·无时间窗） | 曾经调用过的 owner 永久留在枚举集·每分钟全量扫描·随历史线性增长 |
| 每小时全历史重写观测行 | `reconcile.ts:18-24` hourBatch=`cal-YYYYMMDDHH` 每小时新桶 + 0119:399-413 PK(owner,batch,idempotency_key) **含 batch** + reconciler:110 `listUsageCalibrationPairs` 读**全历史**（配对函数 :438-470 无时间窗）→ :133-140 逐条 INSERT | 同一调用每小时换新 batch 桶整行重写（ON CONFLICT DO NOTHING 不去重跨桶行）——机制背景引用·**本刀不改 PK/配对/水位线**（②迁移三件套系后继） |
| 因子纯写不读 | `reconciler.ts:79-85` resolveLatestCalibratedFactor——`rg` 亲证调用面恰三处：定义 :79 + index.ts:84 导出 + `test/usage-calibration-reconciler.proof.ts`（proof 引用）·**apps 生产零调用** | **止血零功能代价**（EXPERT-REVIEWS §一 :10 AG-07 P1→P2 专家裁定依据·AC-F20=review-log:86） |

### 红事实 B（#48 观测面·现 pin 全亲证）

| 面 | 锚（@`b95c9c4b` 实测） | 事实 |
|---|---|---|
| usage 解析只读两字段 | `model-client.ts:623`（非流类型）+ `:668-670`（非流解析 `prompt_tokens ?? 0 / completion_tokens ?? 0`）+ `:824`/`:842`（流式类型）+ `:849-853`（流式 chunk 解析+onUsage 回调）+ `:937-939`（流式终局 `?? 0` 同形） | 解析面**只读 prompt_tokens/completion_tokens** |
| 缓存字段全仓零读取 | `rg "cached_tokens\|prompt_cache_hit\|prompt_tokens_details" --type ts apps packages` → **EXIT=1 零命中**（含 test·验证席已证+本席独立复证） | 三字段名全仓无任何读取/类型/注释痕迹 |
| 三端点字段名（官方文档已核实·review-log §四 :139-141 + AC-F2 :68） | DeepSeek=`prompt_cache_hit_tokens`（默认 profile·text-endpoint-config.ts:73-78 缺省 `deepseek-cn-public`）·百炼=`usage.prompt_tokens_details.cached_tokens`（显式/隐式缓存最少 1024 token）·OpenAI 兼容=`cached_tokens` | **观测产出主要在默认 profile**（百炼 8 前缀实测 172-670 token 全低于 1024 门槛·近零命中·issues-final :550）——观测接线端点无关·产出有偏是现状事实非接线前提 |
| ModelUsage 无缓存位 | `invoke.ts:48-58` `{ inputTokens; outputTokens; estimateInputTokens? }` | 类型面无字段可承载缓存值 |
| 既有观测 metric 形制 | `metrics.ts:72-104` METRIC 单真源（「emit 点、告警 expr、alerts-lint 白名单三方共用同一常量」）+ `:110-151` registerBaselineMetrics 预注册基线 0（「让 Prometheus 一开机即有序列·避免从未 emit=无序列=告警无数据」）+ `:4` label 低基数纪律 | 新 metric 落此形制 |
| Langfuse 面（背景） | `langfuse-v5.ts:166-176` record() usageDetails 只挂 input/output·model 字段填 service 名（AG-24·归后继不本刀） | 裁决项②定是否增挂 |

### §1-修法（EXPERT-REVIEWS §七 :67 成本轨①原文为修法权威：「①AG-07 止血开关（env·60s 硬编码需发版）∥#48 cached_tokens 观测（区分字段缺席≠零）」）

**① 止血开关（worker 调度侧·恰一旋钮面·域级本体零字节）**：

- **两 env**：`USAGE_CALIBRATION_ENABLED` + `USAGE_CALIBRATION_INTERVAL_MS`（默认值取向=**裁决项①**·专家意见「降频到每天或干脆关停」二选一呈报）。
- **形制沿既有先例**（`model-invocation-reconcile.ts:34-40` boundedInteger + `:42-59` resolveModelInvocationReconcileConfig·注释原文「Invalid reconciliation timing is a startup error, not a silent policy change」）：新 `resolveUsageCalibrationReconcileConfig(env)`（住地=usage-calibration-reconcile.ts 或 worker 侧独立 config seam·EXEC 定）——**非法值启动失败**（非有限安全整数/越域/非布尔 → throw 专用 error code·沿 AG-18 同族纪律「env 解析时校验·非法就启动失败」·绝不静默回退默认）。
- **接线**：`main.ts:710` 调用点改传 resolve 结果——ENABLED=false → 不起循环（loop 置 undefined·ready/drainStops 相应短路·沿 `main.ts:711` privacyErasureLoop `?: undefined` 可选循环同款先例）；INTERVAL_MS → `runUsageCalibrationReconciler(pool, intervalMs)`。
- **零触面**：`reconcileUsageCalibration` 域级本体 / usageCalibrationReconcileTick / 0119/0134 迁移 / drain-loop 本体**零字节**（②迁移三件套=后继刀）。

**② cached_tokens 观测（model-client usage 解析 + metric·只观测不改计费）**：

- **三端点字段名兼容读取**：usage 解析增读 `cached_tokens` ∥ `prompt_cache_hit_tokens` ∥ `prompt_tokens_details.cached_tokens`（非流 `:623` 类型 + `:668-670` 解析·流式 `:824`/`:842` 类型 + `:849-853`/`:937-939` 解析 + `onUsage` 回调形 `:497`/`:758` 增可选 cached 位——多字段并存取值序=EXEC 细化·三端点互斥为常态）。
- **缺席≠零铁律**：`ModelUsage`（invoke.ts:48-58）增可选 `cachedInputTokens?: number`——`undefined`=字段**缺席**、`0`=供应商**显式为零**，两态分开打点。**防御目的**（EXPERT-REVIEWS :73）：DeepSeek 改版响应结构时观测以「缺席率跳变」暴露，**绝不静默归零**。
- **metric 落既有观测形制**（metrics.ts 单真源）：METRIC 新增缓存观测 counter 族（形如 `model_usage_cached_input_tokens_total` {service} + 在场性计数 `model_usage_cache_field_presence_total` {service, presence: present_positive|present_zero|absent}——**命名与 label 集=裁决项②附带**·沿 `metrics.ts:4` 低基数纪律「label 只放低基数维度(route/status/outcome)·绝不放 owner/PII/原文」）+ registerBaselineMetrics 预注册基线 0（:110-151 形）。Langfuse 侧是否增挂 `usageDetails.cached`（langfuse-v5.ts:166-176 面）=**裁决项②**。
- **只观测不改计费**：settle/validUsage（invoke.ts:335-347）/预留/结算/价格行**零字节**——价格本无缓存价·#48 定级意见原文「先接 cached_tokens / prompt_cache_hit_tokens 观测**再下结论**」（issues-final :550）。

## §2 验收断言候选（prove 全假体·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **止血三臂（worker 单测/proof 形·零 DB）**：①env 全缺省臂——resolve 返回默认（按裁决项①落定值断言：ENABLED 缺省 false → 不起循环·或 INTERVAL 缺省 → 默认间隔传入 drain-loop）；②非法值臂——`INTERVAL_MS=abc/-1/0.5`、`ENABLED=not-boolean` → resolve **throw 专用 error code**（启动失败·不静默）；③合法臂——合法 INTERVAL → `runUsageCalibrationReconciler` 收到指定 intervalMs（注入/fake timer 断言 tick 间隔）·ENABLED=true → loop 起·ready/drainStops 注册在位·`reconcileUsageCalibration` 本体零字节（blob 对 §0.1 #2）。
2. **观测三形（fixture proof·零外呼）**：fixture 恰三形——①字段在（三端点字段名各一 fixture：`cached_tokens`/`prompt_cache_hit_tokens`/`prompt_tokens_details.cached_tokens`）→ `ModelUsage.cachedInputTokens` 解析值正确+presence=present_positive；②字段**缺席** → `undefined`（**断言 ≠0**）+presence=absent 打点；③字段为 `0` → `0`+presence=present_zero——三态互斥计数断言（metrics registry `render()` 断言形·沿 metrics 既有单测形制）·非流+流式两解析面各跑一遍。
3. **既有门回归原值**：`usage-calibration-reconciler.proof` / model-op 系 prove / ai-runtime 既有 test 全 EXIT 原值·基线同红登记不洗；`MODEL_EVAL_TEMPERATURE` 等 env 解析既有门零回归。
4. **typecheck**：`turbo typecheck` 全绿（3/3·沿 `b95c9c4b` 收据口径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **②迁移三件套系后继刀**（EXPERT-REVIEWS §七 :67 后半·「①与②合并一个发布窗口」的②另卷）：观测表去重+PK 去 batch（0119 零改）·配对/枚举加时间窗+水位线（0134/reconciler:110 零改）·因子 max(old,增量) 合并·90 天保留期——本刀**迁移零字节**。
2. **AG-11 三件套+补收 / AG-12 CJK 估算器与回灌（⑥视③数据定）/ AG-14 usage 结算口径**（invoke.ts:335-347 `?? 0` 面）——皆后继·本刀零触。
3. **价格本零改动**：零新价格行·零缓存价引入·零计费语义变化（§5 增补 Ban）。
4. **显式缓存改造不做**（renderPrompt nonce 围栏渲染结构·EXPERT-REVIEWS :73「显式缓存前置=改渲染结构」归⑥前置换刀）。
5. **AG-19 prompt 版本面 / AG-24 Langfuse model=service 名+成本面不顺手**（裁决项②只定 usageDetails.cached 一处增挂与否）。
6. **域级 reconciler 本体零字节**（usage-calibration-reconciler.ts·§0.1 #2 blob 恒等）·resolveLatestCalibratedFactor 接线（回灌）不在本刀。
7. **其他 worker 循环零触**（commerce/model-invocation/gauge/privacy/vector/stub·main.ts 仅 :710 一行语义改+可选短路）。
8. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖

**零未决硬依赖·与失败语义轨（A 席六刀）可并行**：本刀两触面（usage-calibration-reconcile.ts+main.ts 调用点 ‖ model-client.ts usage 解析+metrics.ts）与刀 A（adaptive-lifecycle）零文件交集；**唯一文件交点=model-client.ts ×刀 B**（AG-06 dispatchOnce 返回与 parse 之间管道）——本刀动 :623/:668-670/:824-853/:937-939 字段读取与类型行·刀 B 动 catch 管道——同文件不同区·互不为前置·先落者为准后到者照 §0 重 pin（刀 B 先落则 parse 行号随管道漂移·结论不变·沿 authz 卷 §4 G4/i2-b 并发登记例）。metrics.ts 无他刀在飞触面。**迁移零字节 → 零迁移号占用**（本刀不 claim 迁移号）。下游：②后继刀以本刀旋钮+观测为输入·非闸。

## §5 Ban 列表 + pins（沿 authz/diag 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改计费语义（settle/validUsage/预留/结算/价格行零字节·只观测·#48 明示先观测再下结论）；Ban 新价格行/引入缓存价（价格本无缓存价）；Ban 动域级本体（reconcileUsageCalibration/tick/0119/0134 迁移零字节·止血只动 worker 调度侧旋钮）；Ban 把字段缺席记 0（缺席≠零铁律·undefined 与 0 分开打点）；Ban 顺手做②迁移三件套（水位线/PK/保留系归后继·§3-1）；Ban 删观测/校准既有 proof（usage-calibration-reconciler.proof 原值原臂）；Ban 真实模型外呼（est live=0·fixture 形）；Ban 顺手改 AG-24 Langfuse model 名面/AG-19 prompt 版本面（裁决项②只定 cached 一处）；Ban env 非法值静默回退（沿 AG-18 同族纪律·非法即启动失败）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/静态·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①止血 proof=纯函数 resolve 注入 env 三臂+fake timer（零 DB 零外呼）；②观测 proof=fixture JSON 三形解析断言+metrics registry 内存断言（零网络零 DB）；③回归门=既有 prove 原值重跑。prove 全 假体/静态·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-cost1-bleed-observe-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/i3/authz 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：

- **①止血默认值取向（专家意见二选一呈报·EXPERT-REVIEWS §一 :10「可配置降频即愈」+issues-final AG-07 修法「先降频到每天一次，或者干脆关掉」）**：(a) `INTERVAL_MS` 默认 `86_400_000`（降频到每天——小时桶 batch 语义下仅 1/24 桶被处理·新观测行量降 96%）；(b) `ENABLED` 默认 `false`（干脆关停——零扫描零新行·止血最彻底·因子纯写不读故零功能代价）；任务书草案另记中间档 `3_600_000`（每小时——每桶恰处理一次·重复扫描降 60× 但**新观测行量不变**·非专家意见面）——三值呈报·(b) 为推荐（与「因子生产零调用」事实自洽·②迁移三件套落地后再启）。
- **②观测打点住地**：(a) 仅 Prometheus metric 面（metrics.ts METRIC+基线预注册·最小刀面·**推荐**）；(b) Prometheus + Langfuse `usageDetails.cached` 一并增挂（langfuse-v5.ts:166-176 record 面·trace/metric 同步扩面沿 AG-19 关联面先例参照·AG-24 model 名面仍归后继）。附带：metric 命名与 label 集终值（§1-② 草案形为准·沿低基数纪律）。

---

*AG-COST1 REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`b95c9c4b`（起草窗口自 `ce021b22` 前移一笔·仅 2 .md·11 code blob 逐字节不变）· 分支 `line/ag-cost1-bleed-observe` · 工作树 `meetwise-cost1` · 蓝本=issues-final AG-07 :125-134/总览 :19/#48 行 :550 + EXPERT-REVIEWS §七 :67 成本轨①（修法权威）+§一 :10（AG-07 P1→P2·止血零功能代价）+:73（缺席≠零防御）+ review-log AC-F20 :86/AC-F1 :67/AC-F2 :68/§四 :139-141（三端点字段名官方文档核实）· 范围=止血+观测最小一刀（①∥②前半·②迁移三件套后继）· 触面=usage-calibration-reconcile.ts+main.ts:710 ‖ model-client.ts usage 解析+metrics.ts · 域级本体/迁移/计费零字节 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
