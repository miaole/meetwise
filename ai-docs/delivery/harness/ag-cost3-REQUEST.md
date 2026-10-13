# AG-COST3 — 成本轨第③步：AG-12 CJK 加权估算器（estimator v2）+ claim 冻结参数（estimator 版本/因子版本随 claim 落库）+ 配对 per-row 估算器归因（B 席六步之③ · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual` · STOP=awaiting pre-exec 双审两外席（alone≠dual · Ban self-approve）· ⛔push · est live=0 · markers=0**（起草席落卷即停·docs-only 恰 1 .md 零码动。预执行双审两外席 BOTH PASS 落卷 + 协调方明示授权方可开工；EXEC 立项不得改 §1 修法清单与 §5 Ban/pins（改则回炉重审）· Dual PASS ≠ 开工）

**席位**：meetwise 战役 AG 成本轨第③步起草席（AG-12 CJK 加权估算器 + claim 冻结参数 · EXPERT-REVIEWS §七 成本轨 B 席六步之 **③**——①止血+观测已 nail `6f2ed876`、②迁移四件套已 nail 收官（0177+水位线+合并 max·LEDGER 刀位图行）·③=队列下一刀·**④AG-11 三件套的前置**（§三 :22「AG-12 是前置（byteEstimate 现状下 CJK 长输入 min=max 零改善）」·无 ③ 则 ④ 的 `LEAST(max, refine(estimate))` 恒等 max 零改善——此前置关系是本刀「估算器+冻结参数」两件同刀的承重理由））。
**基线**：`feat/mysql-schema-skeleton` @ `849a0f19`（本工作树 tip·`git log -1` 实测=docs(ssot) BILL3 话题结算 nail 收官登记笔·2026-10-13）。起草窗口主线已前移至 `94b8519b`（merge-base=849a0f19 亲证·`git diff --stat 849a0f19 94b8519b` 恰 1 文件 `product-campaign-LEDGER.md` 28+/21− **纯 docs 零码面**·§0.1 全部 code blob 两 tip 逐字节不变）。分支 `line/ag-cost3` · 工作树 `meetwise-cost3`（建树前已存在·`git worktree list` 亲证 27 树含本树 @`849a0f19 [line/ag-cost3]`·树净 `git status --short` 零输出亲证）。
**防重双对表（亲证）**：`rg -il "ag-cost3|cjk-weighted" ai-docs/ packages apps` → `ag-cost3` 零命中·`cjk-weighted` 全仓零命中（仅既有 `context-budget.proof.ts:57` 对 **v1** 的 CJK 字节断言·非本刀名）；`ls ai-docs/delivery/harness/ | grep cost3` → 零同名刀卷（cost1/cost2 卷在案为前驱非冲突）；`ls packages/db/migrations | sort` 本树顶=**0181**（0182/0183 全树零占·**AG-39 卷 `ag39-org-qbank-REQUEST.md` :52 已 declare 拟占 0182+0183** 且明示「0184 起顺延·勿添重号」）→ **本刀迁移号 0184 起**（EXEC 立项时 find 实测顺延·`scripts/check-migration-version-uniqueness.mjs` 终裁）。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-12 总览 **:24**（P2·上下文）+ 详情 **:180-189**（复核结论 :181「成立（已核实；本次用 Qwen2.5 tokenizer 实测 interviewer.ask 的 system：2245 字节 / 606 token）」·file:line :183「model-client.ts:170-178（byteEstimate）、:242-252；apps 内 rg \`calibration:\` 无赋值」·触发例子 :184「2 万字中文简历事实估算约 6 万 token，实际约 1.5 万」·用户影响 :185「长简历、长作答会被误判超预算而失败；同时放大 AG-11 的预留虚占」·修法 :186「**改用 CJK 加权估算器（如中文 1.0 token/字、ASCII 字节/3）**，或者把对账因子按 model 回灌到 policy.calibration（planContextBudget 已经支持）」=本刀修法权威·回灌半归⑥不本刀）②同目录 `EXPERT-REVIEWS.md` **§七 :67 成本轨③（修法权威：「③AG-12 CJK 加权估算器（claim 冻结参数）」）** + **§三 :22**（AG-12 系 ④ 前置）+ **§三 :25**（「预留传参改 LEAST(max, refine(estimate))·**估算器版本+因子版本随 claim 冻结（防重放漂移）**」——冻结子句即本刀②件蓝本·LEAST 预留改革面归④不本刀）+ **§四 :37**（usage_missing 打标行被校准配对剔除=AG-12 因子假样本防护·**已由 0174 落地亲证**）③同目录 `review-log.md` AC-F4 **:70**（P2 成立·实测约 3.7 倍）+ AI-04 **:15**（估算半 P2·2245 字节/606 token）④同目录 `LANDING-INDEX.md` §四 **:35**（「成本侧（AG-08/11/12/14+#48 观测）」刀队列）⑤前序两刀卷：`ag-cost1-bleed-observe-REQUEST.md`（①止血+观测·nail `6f2ed876`·其 §3-2 明示「AG-12 CJK 估算器与回灌（⑥视③数据定）」归后继=本刀）+ `ag-cost2-migrate-REQUEST.md`（②迁移四件套·其 §3-1 明示「AG-12 CJK 加权估算器（成本轨③）：utf8-bytes-v1 估算语义零触」=本刀授权面·其 §4「成本③以本刀窗口化对账产出的干净因子链为输入·非闸」）⑥**AG-24 卷**（`meetwise-ag24` 树 `ag24-langfuse-model-REQUEST.md`·draft 落卷 `d508becc`·Ban 明示「顺手修 byteEstimate/CJK/AG-11/AG-14 口径」=本刀面·互认见 §0.3-2）⑦形制沿 `ag-cost2-migrate-REQUEST.md` / `ag-d-admission-REQUEST.md`（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `849a0f19`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚表（@`849a0f19`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/usage-reconciliation.ts` | `3567750fecec` | **件①注册面+件③消费面**：:27 `KNOWN_ESTIMATOR_VERSIONS = ['utf8-bytes-v1']` 单元素 · :41-44 注释「估算器版本，与 estimateInputTokens 的来源版本严格绑定；未知版本 fail-closed」· :112-114 isKnownEstimatorVersion · :121-132 validateObservation（:122 未知/不一致→`usage_estimator_unknown`）· :144-150 buildFactorVersion（estimator 入哈希）· :159-217 reconcileUsage · :220-225 refineEstimate · :31 CALIBRATION_ALGORITHM_VERSION='calibration-v1' · :33 DEFAULT_SAFETY_MARGIN=0.10 · :37 MAX_INPUT_TOKEN_BOUND=2_000_000 |
| 2 | `packages/ai-runtime/src/model-client.ts` | `c4827e8d72f8` | **件①主触面**：:171-178 `byteEstimate`=Buffer.byteLength(value,'utf8') · :75 `RenderedContextBudgetPlan.estimator: 'utf8-bytes-v1'` 字面量类型 · :218 planContextBudget · **:233 门 `policy.contextEstimator !== 'utf8-bytes-v1'` → model_context_policy_invalid** · :241-247 estimateTokens（:244 raw=byteEstimate(text) 硬编码·:246 policy.calibration ? refineEstimate : raw）· :275 plan.estimator=policy.contextEstimator · :606/:610 与 :625/:701/:712、:851/:853/:1022-1024（planContextBudget 三调用点·estimateInputTokens 流向 ModelUsage/plan）· :650 G7 回退估算（**AG-24 子项④面·零触**） |
| 3 | `packages/ai-runtime/src/context-budget.ts` | `33ed0e74a286` | **件①副触面（CTX-02）**：:137-145 estimateContextTokens（:138 isKnownEstimatorVersion fail-closed · **:143 raw=byteEstimate(value) 硬编码——estimator 参数被校验但不参与分派** · :144 calibration?refineEstimate:raw）· :78-80 policy.estimator/calibration · :218 componentTokens 走 estimateContextTokens · :57（proof 侧）「单 CJK 字符 = 3 字节估算」v1 断言在案 |
| 4 | `packages/ai-runtime/src/invoke.ts` | `23a6d071c4c6` | **件② TS 接线面**：:114 `contextEstimator?: 'utf8-bytes-v1'` 字面量类型 · :127-133 policy.calibration/calibrationBoundModel（G7 面·已落·零触）· :139-156 ModelCallPlan.estimateInputTokens（:151 注释「在 claim 时落 ai_model_invocation.estimate_input_tokens（P1），覆盖全 outcome」）· :348-364 costPolicyBinding（**:359 contextEstimator 已入 digest 绑定**·calibration 不入）· :697-719 invokeClaimPhase（:703-711 claimModelInvocation 调用·:709 estimateInputTokens: plan.estimateInputTokens·:710 promptVersion）· :820+ 相位 4/5 reserve+dispatch（:842 reserveAiTextCost=**④面·零触**）· :434-439 persistTrace 注释「估算无法事后重算(原始 prompt 因隐私只落 digest)，故必须此刻落库」 |
| 5 | `apps/worker/src/model-cost-governance.ts` | `68f5b7a1cb93` | **件① env 门**：:121 `contextEstimator: required(env, \`${prefix}_CONTEXT_ESTIMATOR\`, /^utf8-bytes-v1$/) as 'utf8-bytes-v1'`——正则锁死单值·env 缺失即 `model_cost_invalid_*` 启动失败 · :97-124 endpoint()（MODEL_PRIMARY/MODEL_FAST/MODEL_BACKUP/MODEL_FAST_BACKUP 四前缀各一份）· :127-167 resolveModelCostGovernance |
| 6 | `packages/ai-runtime/src/usage-calibration-reconciler.ts` | `a1f64d975d92` | **件③主触面**：:85-91 resolveLatestCalibratedFactor（estimator 参数化·**生产零调用**·⑥面零触）· :110 `input.estimator ?? 'utf8-bytes-v1'` blanket 缺省 · :123-132 观测构造**按 input.estimator 整组盖章**（非行自带）· :133 reconcileUsage({estimator}) · :228/:244-253 加窗路径同形 blanket · :93-102 groupByServiceModel 二元组 (service,model) · :225-311 reconcileUsageCalibrationWindowed（AG-COST2 加窗路径） |
| 7 | `packages/db/src/model-op/usage-calibration.ts` | `1e9ae9f2d60d` | **件③ wrapper 面**：:20-28 `UsageCalibrationPair` **无 estimator 字段** · :41-56 listUsageCalibrationPairs 走 v1 函数 · :63-80 listUsageCalibrationPairsSince 走 v2 函数（两 SELECT 列集均无 estimator）· :190-206 latestUsageCalibrationFactor（estimator 作 WHERE 等值参·零触） |
| 8 | `apps/worker/src/usage-calibration-reconcile.ts` | `707272a40b2f` | 生产调度侧（AG-COST1 旋钮 :41-74 缺省关停 + :82-110 tick 走 windowed :97 `{ owner, batch }` **不传 estimator**）· :113-115 runUsageCalibrationReconciler 默认参 60_000 原值 |
| 9 | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` | `4e75fae7746e` | :306 assertCalibrationModelMatch（calibration↔model 绑定 fail-closed·**G7 面零触**） |
| 10 | `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a79da` | **冻结先例+配对 v1 底本**：:25-33 estimate_input_tokens 列+CHECK(1..2000000) · :72 state guard identity-immutable 行 · :175/:195 claim 函数升 16 参（p_estimate_input_tokens）· :438-473 ai_usage_calibration_pairs_scoped(text) 单参配对函数（**返回列无 estimator 维**） |
| 11 | `packages/db/migrations/0174_ag06_settled_failed_usage_source.sql` | `e70974912126` | **AG-14 配对剔除现行体**：:22-29 usage_source 列+CHECK · :112-150 配对函数 v1 镜像（:143 `AND i.usage_source IS DISTINCT FROM 'usage_missing'` 打标剔除）——EXPERT §四 :37「不污染 AG-12 因子假样本」的落地载体（AG-B 刀·已并线） |
| 12 | `packages/db/migrations/0177_usage_calibration_ag07_windowing.sql` | `e1a95296d107` | **配对 v2 底本**：:49-89 ai_usage_calibration_pairs_scoped_v2(text,timestamptz)（0119/0174 体镜像+p_since 窗）· :113 gateway_usage_calibration_owners_v2 · :137 watermark_floor（AG-COST2 面·本刀镜像基·零触其语义） |
| 13 | `packages/db/migrations/0181_ag19_prompt_version_column.sql` | `617f65be5e17` | **件②迁移形制权威（claim 冻结四件套先例）**：:16-22 prompt_version 列+CHECK · :28-74 state guard CREATE OR REPLACE 加 identity-immutable 比较行（:64 `OLD.prompt_version IS DISTINCT FROM NEW.prompt_version`）· :173-195 claim 函数 DROP 16 参+CREATE 17 参（:218 入参校验·:260-266 INSERT 列集扩）· 头注「claim 时冻结的观测事实…绝不允许事后篡改」 |
| 14 | `packages/ai-runtime/src/index.ts` | `621c83ff9a5d` | 导出面（:65 estimator 族导出·:85 reconciler 族导出）——件①新原语导出走此面 |
| 15 | `packages/db/src/index.ts` | `6f07a09e824f` | db 导出面——wrapper 增量导出走此面 |

### 0.2 漂移登记（复核快照 `2fab7946` → 现树 `849a0f19`·全亲读重 pin）

| 复核快照锚 | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| issues-final :183「model-client.ts:170-178（byteEstimate）、:242-252」 | :171-178 byteEstimate 函数体恒等（`return Buffer.byteLength(value, 'utf8')` :178）· :233 contextEstimator 门 + :243-247 estimateTokens（cost1/TOKSTREAM 插行使行号后移·机制原值） | 行号微漂·结论不变 |
| issues-final :183「apps 内 rg \`calibration:\` 无赋值」 | `rg -n "calibration:" --type ts apps packages`（去 proof/test）生产面恰两处：usage-reconciliation.ts :93/:201/:220（类型/局部/形参）+ context-budget.ts :209（opts 透传）——**生产 setter 恒零**·G7 测试面例外（g7 卷在案） | **回灌缺口原值成立**（⑥面） |
| 快照未列 KNOWN_ESTIMATOR_VERSIONS | :27 `['utf8-bytes-v1']` 单元素 · `rg -c KNOWN_ESTIMATOR_VERSIONS` 恰 usage-reconciliation.ts×3/index.ts×1/context-budget.ts×1 | 补 pin |
| EXPERT §四 :37「打标行被校准配对剔除」系修法（快照时未落） | **已落**：0174 :112-150 配对 v1 现行体含 :143 usage_missing 剔除（AG-B `616d8ef3` 已并主线）·本刀镜像基=0174 现行体非 0119 原体 | **前置已消解**（本刀假样本防护零新增义务·只须镜像不回退） |
| 快照未列加窗路径 | 0177 :49-89 配对 v2 + reconciler :225-311 windowed 路径（AG-COST2 已收官） | 本刀件③镜像底本=**v1+v2 双函数现行体** |
| cost1 :62「resolveLatestCalibratedFactor 生产零调用恰三处」 | 现树 `rg -n "resolveLatestCalibratedFactor"` 恰：定义 usage-calibration-reconciler.ts:85 + 导出 index.ts:85 + 消费仅 proof/注释（worker reconcile.ts:37 注释、windowing proof :330）·**apps 生产调用零** | 结论不变·**回灌接线归⑥**（本刀零触） |

### 0.3 现势并发登记（强制）

1. **主线前移**：基线 `849a0f19` → 主线 tip `94b8519b` 恰 1 笔 `docs(ledger)`（刀位图 billing P3 行勘误·单 .md 28+/21−·`git diff --stat` 亲证）——本刀 §0.1 全部 code blob 两 tip 逐字节不变。**迁移号占用图**：本树顶=0181·AG-39 卷（:52）已 declare **0182+0183**→ 本刀 **0184 起**；若 EXEC 立项时 0182/0183 已实落或 AG-39 让位变化，find 实测顺延·uniqueness 门终裁；本刀若需多迁移（裁决项③/④行使结果导致拆件）自 0184 连续顺延并随卷登记。
2. **AG-24 并发（同基线 `849a0f19`·其卷 `d508becc` docs-only 落卷·draft:awaiting_pre_exec_dual）**：cost1 裁决②行使记录明示「Langfuse usageDetails.cached 不增挂·AG-24 model 名面仍归后继」——**该面已由 AG-24 卷认领**（其 §1-② usageDetails 增挂 `input_cached`·仅 cachedInputTokens 非 undefined 挂）·**本刀 langfuse-v5.ts/trace.ts 零字节**；AG-24 卷 Ban 明示「顺手修 byteEstimate/CJK/AG-11/AG-14 口径（§3-2）」=本刀面——**两卷互认零冲突**。**model-client.ts 共租**：AG-24 动 renderPrompt userContent 图像数组面/G7 回退估算 :650/span 面消费；本刀动 byteEstimate 原语区 :171-178+planContextBudget :233/:243-247+:75 类型——同文件不同区·互不为前置·先落者为准后到者照 §0 重 pin（沿 cost1 §0.3-2/AG-D 卷同形制）。
3. **跨轨交点**：④AG-11 三件套（invoke reserve 相位 :820+/:842 reserveAiTextCost + 0088 :162 等值谓词 + LEAST(max, refine) 传参）=后继刀·本刀零触——本刀件②落冻结缝正是 ④ 的前置输入；⑥回灌接线（resolveLatestCalibratedFactor→policy.calibration 生产 setter）+显式缓存（nonce 围栏渲染结构）=后继·本刀零触；EG-B1 unknown ageing（与状态机同批·失败语义轨面）零触。**digest 恒等披露**：contextEstimator 已入 costPolicyBinding（invoke :359）→任一端点翻 v2 该端点全部 request digest 变（幂等缓存身份换代）——此为裁决项②「缺省不翻」推荐案的承重事实·如实呈报。

## §1 红事实 + 修法

### 红事实 A：估算器单腿+v2 零位（issues-final AG-12 :180-189·现 pin 全亲证）

| 面 | 锚（@`849a0f19` 实测） | 事实 |
|---|---|---|
| 3.7× 高估 | `model-client.ts:171-178` byteEstimate=逐字节计数 · review-log :15/:70 实测 interviewer.ask system=2245 字节/606 token（≈3.7×）· issues-final :184 触发例（2 万字中文≈6 万假 token vs 实 1.5 万） | CJK 每 UTF-8 字符 3 字节全按字节计·真实 ~0.27 token/字节——高估非推断系 tokenizer 实测 |
| 误判超预算 | `model-client.ts:269-270`（inputTokens>maxInputTokens→`model_context_budget_exceeded`）· :233 门 | 高估直接进拒绝判定——长简历/长作答被误拒·并放大 ④ 的预留虚占（:185 用户影响原值） |
| v2 零位 | `usage-reconciliation.ts:27` 单元素枚举 · **:143（context-budget）与 :244（model-client）两处 raw 原语硬编码 byteEstimate——estimator 参数被校验（:138/:233）但不参与分派** | 即便手工注入 v2 字符串也会被 :138 throw `context_estimator_unknown`/:233 `model_context_policy_invalid` fail-closed 拒绝——**v2 必须走「注册+分派」两件·缺一不可** |
| env 锁死 | `model-cost-governance.ts:121` 正则 `/^utf8-bytes-v1$/`（四 endpoint 前缀各一） | 运维无任何旋钮可选第二估算器·改必发版 |

### 红事实 B：claim 冻结参数缺口（EXPERT §三 :25「估算器版本+因子版本随 claim 冻结（防重放漂移）」现零承载）

| 面 | 锚（@`849a0f19` 实测） | 事实 |
|---|---|---|
| claim 只冻结数值不冻结来源版本 | 0119 :25-33（estimate_input_tokens 列）+ 0119 :195/0181 :195（claim 函数现 17 参）+ invoke :709（estimateInputTokens 传参）· **ai_model_invocation 无 estimator_version/calibration_factor_version 列**（`rg "estimator_version" packages/db` EXIT=1 零命中） | estimate 的**数值**在 claim 落库（identity-immutable）·但**由哪个估算器/哪版因子算得**事后不可知——persistTrace :434-435 自证「估算无法事后重算（原始 prompt 因隐私只落 digest），故必须此刻落库」·版本同理必须此刻落 |
| 配对函数无 estimator 维 | 0119 :438-473（v1 返回 7 列）· 0174 :112-150（v1 现行体 7 列+剔除谓词）· 0177 :49-89（v2 同 7 列+窗）· db wrapper :43-44/:68-69 SELECT 同 7 列 | 配对行不带估算器版本 |
| blanket 盖章（v2 上线即混算） | `usage-calibration-reconciler.ts:110`（input.estimator 缺省 v1）· :123-132/:244-253（整组 observations 按单一 input.estimator 盖章）· :93-102 分组二元组 (service,model) · usage-reconciliation :41-44「估算器版本与 estimateInputTokens 的来源版本严格绑定」 | 一旦端点翻 v2，同一 (service,model) 组内 v1 旧行与 v2 新行被盖同一章混入同一因子——字节口径与 CJK 口径比率不可比·因子语义损坏；validateObservation :122 因行内无真值可比而**无法发现** |
| 冻结缝的账本位 | 0088 claim INSERT（0181 :260-266 现行列集）+ state guard identity-immutable（0181 :52-74 现行比较行集） | 冻结=「落列+immuable+claim 写入」三件（0181 四件套先例全齐）·缺位即无冻结可言 |

### §1-修法（EXPERT §七 :67 成本轨③原文为修法权威「③AG-12 CJK 加权估算器（claim 冻结参数）」·issues-final :186 修法第一半「改用 CJK 加权估算器（如中文 1.0 token/字、ASCII 字节/3）」·第二半「因子回灌 policy.calibration」归⑥；EXPERT §三 :25 冻结子句为件②蓝本·其 LEAST 预留改革半归④。迁移 0184 起+代码增量·历史迁移 0001-0181 零字节）

**件① CJK 加权估算器 v2（注册+分派两件·v1 零漂）**：

- **注册**：`usage-reconciliation.ts:27` `KNOWN_ESTIMATOR_VERSIONS` 增第二版本号（候选名 `cjk-weighted-v1`·**终值=裁决项①附带**）——:28 EstimatorVersion/:112 isKnownEstimatorVersion/:122 validateObservation/buildFactorVersion :147 链路全部自动生效（单真源枚举）；:117-119 注释「未来登记第二个估算器时这里应区分 mismatch/unknown」的**语义修订不本刀**（:122 现行行为零变·只扩枚举）。
- **新原语**：`cjkWeightedEstimate(value: string): number`——权重形=issues-final :186 原文例「中文 1.0 token/字、ASCII 字节/3」：逐码点，CJK 表意/假名/谚文区段（区段集终值=裁决项①授权面·呈报集=U+2E80–U+9FFF∪U+F900–FAFF∪U+FF00–FFEF 全角形）计 1.0·其余码点按其 UTF-8 字节数 /3；全串 Σ 后 ceil·非空串结果 ≥1·空串 0（与 estimateContextTokens :142 空串短路口径一致）。**住地=裁决项①附带**：候选 (a) model-client.ts byteEstimate 侧（沿「四原语复用」commentary 先例·context-budget 反向 import 已存在）/(b) usage-reconciliation 纯模块（其 :4「自包含不 import model-client」注释须如实修订·依赖方向不变）。**诚实边界（写死）**：v2 是「分script加权保守估算」非绝对上界承诺（v1 的 bytes≥tokens 恒等式不跨版本外推）——低估防护由既有三网承接：refineEstimate 校准因子（观测上界）+ safetyMargin + underEstimated 显式打标（:190-193 绝不静默）+ AG-14 usage_missing 剔除（0174）保因子样本洁净。
- **分派**：`context-budget.ts:137-145` estimateContextTokens 按 estimator 版本分派 raw 原语（v1→byteEstimate **恒等**·v2→新原语·:138 未知版本 throw 原值）·:144 refineEstimate 精化链零变；`model-client.ts:233` 门放宽为枚举属员判断（非法版本仍 `model_context_policy_invalid` fail-closed）·:243-247 estimateTokens 同步分派·:75 `RenderedContextBudgetPlan.estimator` 字面量类型放宽为版本 union；`invoke.ts:114` ModelCostPolicy.contextEstimator 类型同步 union；`model-cost-governance.ts:121` 正则放宽为双值枚举（`/^(utf8-bytes-v1|cjk-weighted-v1)$/`·值域与 KNOWN_ESTIMATOR_VERSIONS 单真源对齐·**禁自由字符串**·required() 缺失即启动失败原值保留·cast 随 union 更新）。
- **v1 零漂铁律**：byteEstimate 原语/单 CJK=3 字节（context-budget.proof :57 既有臂）/全部 v1 既有断言原值——缺省路径（env 仍 v1）生产行为逐字节零变。

**件② claim 冻结参数（迁移 0184·0181 四件套同形逐字先例）**：

- ① `ai_model_invocation` 加两观测列：`estimator_version text NULL`（CHECK：NULL 或 IN 已注册枚举两值——沿 0174 :29 短码枚举 CHECK 形·新估算器须再迁移扩枚举）+ `calibration_factor_version text NULL`（CHECK：NULL 或 `^[A-Za-z0-9.:_-]{1,160}$` 宽松形·容 `<estimator>.<algo>.<64hex>` 实形——**落 NULL 缝**：生产 policy.calibration 现无 setter（§0.2 亲证）·⑥回灌接线后始有值·**本刀不接线**）。
- ② state guard identity-immutable 加两行比较（`OLD.estimator_version IS DISTINCT FROM NEW.estimator_version` + factor_version 同形·0181 :52-74 CREATE OR REPLACE additive 形·其余比较零放松）——「claim 后不可改」=防重放漂移的库级承重。
- ③ claim 函数 DROP 17 参签名+CREATE 19 参（p_estimator_version text·p_calibration_factor_version text·末位·0181 :177-178 DROP+CREATE 先例——CREATE OR REPLACE 不能改参数个数）·入参校验沿 0181 :218 同族（长度/字符域）·claim INSERT 列集扩两列（:260-266 同形）。
- ④ TS 接线：db `claimModelInvocation` wrapper 参数两增量·`invoke.ts:703-711` 传 `estimatorVersion: plan.cost?.contextEstimator ?? null` + `calibrationFactorVersion: plan.cost?.calibration?.factorVersion ?? null`（与 :708 maxOutputTokens 同位可选链·无 policy/无 calibration 臂落 NULL）；**requestDigest 摘要集零变**（calibration/factor 版本是观测标签非语义输入·沿 0181 头注「版本是观测标签非语义输入」先例·contextEstimator 本就在 :359 binding 内零新增）。
- **全 outcome 落库不等成功**（0119 :5-8/0181 头注先例）：版本标签随 claim 冻结·覆盖 success/schema-失败/business-失败/unknown 全 outcome——件③对账按行归因的真值来源。

**件③ 配对/对账 per-row 估算器归因（同迁移 0184+TS·红事实 B 第三行的根除）**：

- 配对函数 **v1+v2 各 DROP+CREATE** 加返回列 `estimator_version text`（值=`COALESCE(i.estimator_version, 'utf8-bytes-v1')`——列 Nullable·旧行 NULL 的真值=「历史全部系 v1 字节估算」·COALESCE 让 v1/v2 双函数对存量行即出正确归因）：v1 以 **0174 :112-150 现行体**为镜像底（含 :143 usage_missing 剔除谓词逐字保留）·v2 以 **0177 :49-89 现行体**为镜像底（含 p_since 窗逐字保留）——signature 变更故 DROP+CREATE（0181 :177 先例）·SECURITY DEFINER/search_path/GRANT 形逐字保留。
- db wrapper：两 SELECT 列集+`UsageCalibrationPair` 增 `estimator: string`（usage-calibration.ts :41-56/:63-80·String() 投影同形）。
- reconciler：`groupByServiceModel`→**三元组 (service, model, estimator)** 分组（:93-102）·每组内 estimator 天然齐性·observations 按行自带 estimator 构造（:123-132/:244-253 摆脱 blanket 盖章）·`ReconcileUsageCalibrationInput.estimator` 语义修订为**可选过滤**（缺省=全部已注册估算器组各自对账·显式传入=只对账该估算器组·未知值仍 :111 fail-closed）——`reconcileUsage` 调用形不变（组内齐性由分组保证）·`usage-calibration-reconciler.proof` 既有 28 臂中 blanket-estimator 相关臂照 §0 协议改写重钉（断言强度不减·沿 cost2 §0.4 ⑤两臂改写先例）·其余原值。worker tick :97 `{ owner, batch }` **零触**（不传 estimator=全组对账）·resolveLatestCalibratedFactor :85-91 零字节（已按 estimator 参数化·生产零调用维持）。

### 用户口径钉子（⛔ 不得更改）

「**凡是调用大模型的面都必须有合理的处理（缓存/计量/降级）**」——本刀承载其**计量**半（估算器 v2+claim 冻结参数+因子归因洁净）；缓存半=成本①#48 三端点观测（已落 nail `6f2ed876`）+⑥显式缓存（后继·nonce 围栏渲染结构改造前置）；降级半=CTX-02 trimOrder 确定性降级/rejected 显式拒绝（已落·本刀零触）。三半之外的面（监控/预算/熔断）各有在案机制·本刀不越权代管。

## §2 验收断言候选（prove 全假体·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **估算器 proof（纯函数·零 DB 零外呼·新 proof 件）**：①v2 权重形——纯 CJK 串=N×1.0·纯 ASCII 串=ceil(bytes/3)·混合串两肩相加·空串 0·非空 ≥1·全角/假名区段臂（裁决项①落定值断言）；②v1 零漂——byteEstimate 同输入同输出·`estimateContextTokens(x,'utf8-bytes-v1')` 与改前逐值恒等（含 context-budget.proof :57 单 CJK=3 字节原值臂）；③分派/fail-closed——estimateContextTokens 与 planContextBudget 对 v2 正分派·对未注册版本仍 throw `context_estimator_unknown`/`model_context_policy_invalid`；④refineEstimate 套 v2 估算链（ceil(factor×estimate)·上界语义注释口径不变）；⑤env 门——model-cost-governance endpoint() 对双值各受理·第三值/空值 throw `model_cost_invalid_*`（四前缀各一臂）。
2. **冻结+归因迁移 proof（隔离库真迁移链·沿 cost2 ucal-windowing proof 形·新 proof 件或扩臂）**：①列在场+CHECK 负臂（estimator_version 第三值 INSERT→23514·factor_version 越形→23514·NULL 合法）；②identity-immutable 负臂——claim 后 UPDATE 两列任一→`ai_model_invocation_identity_immutable`；③claim 函数 19 参往返——claim 写入 estimator_version/factor_version→行值断言·NULL 臂（无 policy）落 NULL；④配对 v1+v2 各带 estimator_version——存量旧行（NULL）→'utf8-bytes-v1' COALESCE 断言·新行原值透传断言·**0174 usage_missing 剔除谓词原值保留臂**+**0177 p_since 窗原值保留臂**；⑤对账归因——同 owner 造 v1/v2 混合配对→分组建各自因子（两 estimator 各一条 factor 行·互不混算）·observation.estimator 逐行自带断言·input.estimator 过滤语义断言；⑥GRANT/SECURITY DEFINER 纪律断言（REVOKE PUBLIC+GRANT app_role·沿 0174 :149-150 形）。
3. **既有门回归原值**：`prove:usage-reconciliation`（15 臂）·`prove:usage-estimate-threading`（6 臂）·`prove:context-budget`（49 臂）·`prove:model-usage-cache-observe`（28 臂）·`prove:usage-calibration-reconciler`（28 臂·blanket 相关臂按 §1-件③ 改写重钉·收据登记）·worker `prove:usage-calibration-bleed`（26 臂）+`prove:usage-calibration-windowing`（38 臂）·`migrate:prove`·`check-migration-version-uniqueness`（0184 唯一）·`turbo typecheck` 3/3·`docs:check` EXIT=0。基线同红族（DB 门 database_target_missing 族等）如实登记不洗（沿 cost1/cost2 口径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **④AG-11 三件套+补收（成本轨④）**：`LEAST(max, refine(estimate))` 预留传参·0088 :162 等值谓词改 ≤·settle 放宽 actual≤max+overage 标记·预算月检查改告警·parity-b2 静态钉同批更新——invoke reserve 相位（:820+/:842）与 0088 guard 等值行零字节·本刀只落其前置（估算器+冻结缝）。
2. **⑥回灌接线+显式缓存**：resolveLatestCalibratedFactor 生产接线零字节（:85-91 blob 恒等·生产零调用维持）·policy.calibration 生产 setter 零新增·nonce 围栏渲染结构（EXPERT :73「显式缓存前置=改渲染结构」）零触——calibration_factor_version 列落 NULL 缝非接线。
3. **⑤AG-08 熔断键按端点 / EG-B1 unknown ageing / AG-14 收口面**：零触（0174 既有剔除谓词逐字保留即全部 AG-14 义务）。
4. **AG-24 已认领面**：langfuse-v5.ts/trace.ts 零字节（usageDetails.input_cached/model 真名/cost 上报）·model-client :650 G7 回退估算数组修零触（AG-24 子项④）。
5. **计费语义零改**：settleAiTextCost/reserveAiTextCost/validUsage（invoke :415-428）/价格行/0088 等值触发器零字节·est live=0 面外零生产操作。
6. **历史迁移零字节**：0001-0181 已落文件逐字节不变（含 0119/0174/0177/0181 四镜像底本——本刀只 DROP+CREATE 新函数体·旧函数由新迁移替换系「不回改旧卷文件」语义内的 CREATE·0119/0174/0177/0181 文件本身零字节）·0182/0183（AG-39 已 declare）号位不 claim。
7. **worker 其他循环零触**（commerce/model-invocation/gauge/privacy/vector/stub/qbank-sweep/retention）·tick 调用形零改·旋钮缺省关停零翻转。
8. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖

**前序两刀已收官非闸**：①（nail `6f2ed876`·旋钮缺省关停+观测已落）与②（0177 窗口化+合并 max+保留期）在基线内——本刀件③镜像底本（v1 现行体 0174+v2 现行体 0177）与 reconciler 加窗路径即其交付。**④AG-11 系本刀下游**（EXPERT §三 :22 前置关系·④ 以本刀 v2 估算+冻结缝为输入·非本刀阻于④）。**与失败语义轨零文件交集**（六刀全收官·0174 已并线为镜像底本）。**与 AG-24 零硬依赖**（§0.3-2 互认·同文件不同区·先落后落互不阻·照 §0 重 pin）。**迁移号**：0184 起（AG-39 已 declare 0182+0183·§0.3-1·EXEC 实测顺延·uniqueness 门终裁）。**下游**：⑥视③数据定回灌/显式缓存（本刀 v2+归因洁净=其数据前提）·#48 收口待观测数据。

## §5 Ban 列表 + pins（沿 cost1/cost2/authz 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·成本轨刀位行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源；**本刀增补**：Ban 改 v1 估算语义（byteEstimate 原语与全部 v1 既有断言恒等·缺省生产行为零变——issues-final :186 是「改用」的**能力交付**非「缺省翻转」·翻转=裁决项②运维决策）；Ban 修 usage-reconciliation :117-119 注释预告的 mismatch/unknown 二分语义（:122 现行行为零变·只扩枚举）；Ban claim 冻结两列外的第三列/改 0088 状态宇宙（0181 四件套同形纪律·identity-immutable 只 additive）；Ban requestDigest 摘要集变化（版本是观测标签非语义输入·0181 先例）；Ban 接线回灌（resolveLatestCalibratedFactor 生产调用零新增·§3-2）；Ban 动 ④ 面（reserve 相位/0088 :162 等值谓词/LEAST 传参/parity-b2 静态钉）；Ban 动 AG-24 面（langfuse-v5/trace/:650 G7 回退估算·§3-4）；Ban 配对函数谓词放松（0174 usage_missing 剔除+0177 窗谓词逐字保留·只增列不改滤）；Ban blanket 盖章残留（v2 上线前必须 per-row 归因先行·否则混算损坏因子——件③与件①同刀不可拆的承重理由）；Ban env 自由字符串估算器名（值域=KNOWN_ESTIMATOR_VERSIONS 枚举对齐）；Ban 改历史迁移文件（0001-0181 零字节·blob 恒等对 §0.1）·Ban claim 0182/0183 号位（AG-39 已 declare）；Ban 删/改既有 proof 臂语义（改写重钉仅限 §1-件③ 点名面·收据登记·强度不减）；Ban 真实模型外呼（est live=0·fixture/隔离库形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/隔离库 fixture·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①估算器 proof=纯函数 fixture 断言（零 DB 零外呼）；②迁移/归因 proof=隔离 PG 真迁移链+fixture 断言（零外呼·零生产库）；③回归门=既有 prove 原值重跑。prove 全 假体/静态/隔离库·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-cost3-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 cost1/cost2/diag 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 用户口径

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·迁移号照 §0.3-1 实测顺延）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：

- **①估算器版本号/权重/住地（件①授权面细化）**：(a) 版本号 `cjk-weighted-v1`·权重=issues-final :186 原文例形（CJK 表意/假名/谚文区段 1.0 token/码点·其余码点 UTF-8 字节/3·全串 ceil·非空 ≥1）·住地=model-client.ts byteEstimate 侧——**推荐**（原文例形逐字·原语与消费方同文件沿四原语复用先例）；(b) 其他权重变体/住地 usage-reconciliation 纯模块（依赖方向反向·须如实修订其 :4 自包含注释）——两形均保「注册+分派+fail-closed」三件·绝不静默选一。
- **②缺省上线口径（件① rollout·digest 恒等披露为承重事实）**：(a) 全部 endpoint 缺省仍 `utf8-bytes-v1`·v2 为合法 env 值·翻转=运维显式决策（contextEstimator 入 costPolicyBinding invoke :359→翻 v2 该端点全部 request digest 换代·在飞跨发布重放语义须随翻转决策一并裁·**推荐**——沿 cost1 缺省关停/cost2 关停态备码同族「机制先行·翻转显式」纪律）；(b) 某端点缺省即翻 v2（fix 立即生效·digest 换代风险随刀承担·须协调方明示）。
- **③冻结列集（件②范围）**：(a) `estimator_version` + `calibration_factor_version` 两列同批（EXPERT §三 :25「估算器版本+因子版本」逐字·factor 列 NULL 缝至⑥·**推荐**——缝一次成形免二次迁移）；(b) 仅 `estimator_version` 单列（factor 版本随⑥回灌刀再迁移·最小刀面·多一次后续迁移）。
- **④配对函数形态（件③范围）**：(a) v1+v2 各 DROP+CREATE 加 estimator_version 返回列（signature 变更必经·0181 :177 先例·**推荐**）；(b) 新 v3 函数族（函数面增殖·wrapper 加第三读面·v1/v2 归因缺口仍在）——(b) 不根除红事实 B 第三行·呈报仅供完整性。

---

*AG-COST3 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`849a0f19`（主线已前移 `94b8519b` 恰 1 笔 docs(ledger) 零码面·blob 零漂）· 分支 `line/ag-cost3` · 工作树 `meetwise-cost3` · 蓝本=issues-final AG-12 :24/:180-189（修法第一半·回灌半归⑥）+ EXPERT-REVIEWS §七 :67 成本轨③（修法权威）+§三 :22（④前置）/:25（claim 冻结子句=件②蓝本·LEAST 半归④）+§四 :37（AG-14 剔除已落 0174）+ review-log AC-F4 :70/AI-04 :15（3.7× 实测）+ LANDING-INDEX :35 + cost1/cost2 两卷（§3 授权面承接）+ AG-24 卷（互认 Ban 面·同基线并发）· 范围=件①CJK 加权估算器（注册+分派·v1 零漂）+件②claim 冻结参数（0184·0181 四件套同形·estimator_version+calibration_factor_version·digest 零变）+件③配对/对账 per-row 归因（v1+v2 DROP+CREATE 加列·COALESCE 存量归 v1·reconciler 三元组分组）· 不含=回灌/④LEAST 预留/⑤熔断键/显式缓存/AG-24 面/EG-B1 · 迁移号 0184 起（AG-39 占 0182+0183·EXEC 实测顺延）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
