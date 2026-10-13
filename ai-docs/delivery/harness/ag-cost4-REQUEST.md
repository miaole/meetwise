# AG-COST4 — 成本轨第④步：AG-11 三件套+补收 EG-B2（双等值点 `≤` 镜像 + settle 放宽/行内扩 `overage` 标记 + 预留传参 `LEAST(max, refine(estimate))`）+ parity-b2 静态钉同批（B 席六步之④ · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停零码动·本刀恰 1 .md。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push · est live=0 · markers=0）

**席位**：meetwise 战役 AG 成本轨第④步起草席（AG-11 三件套+补收 EG-B2 · EXPERT-REVIEWS §七 成本轨 B 席六步之 **④**「④AG-11 三件套+补收（EG-B2 一并）」——①止血+观测已 nail `6f2ed876`、②迁移 dfcadd9e 收官（0177+水位线+合并 max+保留期）、③AG-12 估算器+claim 冻结缝已 nail `9d69a5b1`（0184 在链）·**④=队列下一刀**·系 **#48/#49 收口硬前置**（批 2 侦察席定谳）·与失败语义轨六刀（全收官）零文件交集）。
**基线**：`feat/mysql-schema-skeleton` @ **`e1cb1110`**（本工作树 tip·merge(bill4) 收官 merge·合并后迁移链深 **185**·commit 头注原文亲证「迁移链纪律 0184 先于 0185 落地·合并后链深 185」）。**起草窗口主线前移披露**：本席建树时点 tip=`f0147886`（AG-COST3 nail 收官随翻笔）→ 起草中途前移至 `e1cb1110`（bill4 积分明细列表 nail 并线·`git diff --stat f0147886 e1cb1110` 恰 14 文件 bill4/commerce 面+新迁移 0185·**§0.1 十九锚中十八 blob 两 tip 逐字节恒等**·唯一漂移 `packages/db/src/index.ts` `6f07a09e824f`→`7c9c00ed414c`（bill4 删导出使行移 :216→:221·语义零变）**已照新 tip 重 pin**）。分支 `line/ag-cost4` · 工作树 `meetwise-cost4`（`git worktree add` 初建误落 `origin/main` `c4244470`——`git fetch --all` 网络失败（`RPC failed; curl 16 Error in the HTTP2 framing layer`）致远端跟踪陈旧·本席 `reset --hard f0147886`→复核后再 `reset --hard e1cb1110` 两次修正·树净 `git status --short` 零输出亲证·与主线 tip 树恒等）。
**防重双对表（亲证 @`e1cb1110`）**：`rg -il "ag-cost4" ai-docs/ packages apps` → 零命中（仅本卷）；`ls ai-docs/delivery/harness/ | grep cost4` → 零同名刀卷（cost1/cost2/cost3 卷在案为前驱非冲突）；`ls packages/db/migrations | sort` 链顶=**0185**（0186/0187 主线未占未写·0188/0189=5B-MIG/S4b 拟占见 §0.3-1）→ **本刀迁移号 0190 起**（EXEC 立项日按主线链顶顺延登记·`scripts/check-migration-version-uniqueness.mjs` 终裁）。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/EXPERT-REVIEWS.md` **§七 :67 成本轨④（修法权威：「④AG-11 三件套+补收（EG-B2 一并）」）** + **§三 :20-25 AG-11 修法事故修正**（:21 两条挡死不变量「①0036 `ai_cost_settle_text` 的 `actual>reserved` 异常→估算误差变 AG-06 式幽灵预留（比现状更糟）；②0083:44-58 重放 binding_mismatch」+:22「AG-12 是前置」〔已由 ③/0184 消解〕+:23「正确形状=三件套+补收」+:24 件①件②原文+:25「预留传参改 `LEAST(max, refine(estimate))`·估算器版本+因子版本随 claim 冻结（防重放漂移）·parity-b2 静态钉需同批更新」——冻结半 **已由 0184 落地**〔§0.2 亲证〕·LEAST 半+静态钉半=本刀）+ **§六 :52 EG-B2**（P2·「`ai_cost_actual_exceeds_reservation` 是所有估算修法共用地雷（见三）」）②同目录 `issues-final.md` AG-11 总览 **:23** + 详情 **:169-178**（复核结论 :171「成立（已核实；放大倍数取决于部署 env）」·file:line **:174**「packages/ai-runtime/src/invoke.ts:742-746；packages/db/migrations/0088_*.sql:162（r.input_tokens_reserved=h.max_input_tokens）、**:550**；apps/worker/src/model-cost-governance.ts:102-106」·触发例 :175「MAX_INPUT_TOKENS=64k 时，一次只有几百 token 的报告调用也冻结 64k 的额度」·用户影响 :176「并发一高，月度预算就被虚占，提前触发 budget_exhausted，之后经 AG-01 变成面试失败」·修法 **:177**「预留改为 min(上限, 派发前估算)（估算本身是上界）；或者按 operation 分别配置上限。触发器的等值约束要一起改」）③同目录 `review-log.md` AC-F3 **:69**（P2 成立·「invoke.ts:742-746；0088:162」）④同目录 `LANDING-INDEX.md` §四 **:35**（「成本侧（AG-08/11/12/14+#48 观测）」刀队列）⑤前序三刀卷：`ag-cost1-bleed-observe-REQUEST.md`（§3-2 明示「AG-11 三件套+补收/AG-12/AG-14 皆后继·本刀零触」=本刀授权面）+ `ag-cost2-migrate-REQUEST.md`（§3-3 明示 AG-11 三件套零触·其 §4「下游：成本③…非闸」链序）+ `ag-cost3-REQUEST.md`（已 nail `9d69a5b1`·其 §3-1「④AG-11 三件套+补收=后继刀·invoke reserve 相位与 0088 guard 等值行零字节·本刀只落其前置」=**本刀正是该后继**·其 §0.3-3 亲证「④面（reserve 相位 :820+/:842 + 0088 :162 等值谓词 + LEAST(max, refine) 传参）零触」的让位兑现）⑥形制沿 `ag-cost3-REQUEST.md` / `ag-cost2-migrate-REQUEST.md`（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `e1cb1110`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚表（@`e1cb1110`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/invoke.ts` | `030d273b1dd0` | **件③主触面+件②消费面**：:710-738 invokeClaimPhase（:716-728 claim 调用·:722 estimateInputTokens·**:726-727 estimatorVersion/calibrationFactorVersion=0184 冻结缝已落·本刀零触**）· :837-903 invokeReserveAndDispatchPhase（**:858-871 reserve 块·:862 `maxInputTokens: policy.maxInputTokens`=AG-11 红点**·:865-870 非 reserved/held → `cost_${decision}` 拒绝分流·:872 markModelInvocationDispatched·:875 markAiCostDispatched）· :905-1119 invokeExecuteAndSettlePhase（**:963/:1064 settleAiTextCost 恰两调用点**·:982-995/:1093-1108 settle 抛错 catch→`markAiCostUnknown('settlement_or_record_failed')`→预留冻结=EG-B2 幽灵预留传导链·:1043-1046 underEstimated 违约 metric 先例）· :415-428 validUsage · :348-364 costPolicyBinding（**本刀零触·digest 摘要集零变**） |
| 2 | `packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql` | `cbc07c09e1aa` | **等值谓词双点原体**：:55-189 `ai_model_invocation_state_guard()`（:191-194 trigger `tr_ai_model_invocation_state_guard`·**:162 `AND r.input_tokens_reserved=h.max_input_tokens`**·:163 输出侧等值行）· :480-580 `ai_model_transition_dispatched_scoped(text,text,uuid,text)`（**:550 同谓词**·:556 `ai_model_dispatch_cost_reservation_binding_mismatch` 异常·两查分立形：缺预留→`_required`/绑定漂移→`_binding_mismatch`）——`git ls-tree` 全迁移链亲证 :480 函数自 0088 后零改写 |
| 3 | `packages/db/migrations/0184_ag12_estimator_claim_freeze.sql` | `5a89d95d0b6c` | **件①镜像底本（state guard 现行体）**：:73 `CREATE OR REPLACE FUNCTION ai_model_invocation_state_guard()`（0181 identity-immutable+0184 两冻结列比较行全在体内·**:184 输入等值谓词/:185 输出等值谓词**）· :219+ claim 函数 19 参（**本刀零触**）· :60-71 两冻结列 CHECK/因子表前缀 CHECK（零触） |
| 4 | `packages/db/migrations/0036_ai_text_cost_governance.sql` | `68770a261035` | **件②主触面（settle 严点）**：:101 `CREATE OR REPLACE FUNCTION ai_cost_settle_text(...)` 5 参·**:118-120 token 侧 raise `ai_cost_actual_exceeds_reservation`**（actual>reserved 任一侧）·**:124-126 金额侧同码 raise**（actual_cost>reserved_micro_cny）·:128-135 月度结转（reserved−=全额/settled+=actual_cost）·:177-179 `ai_cost_settle_text_scoped` wrapper（调穿）·:183-188 REVOKE/GRANT 块（**签名零变则零重发**） |
| 5 | `packages/db/migrations/0083_ai_text_cost_price_revision_binding.sql` | `fe6d5de12862` | **重放绑定防线（保留零触）**：:8 `ai_cost_reserve_text` 9 参现行体·:46-58 重放块（**:54-56 `prior.input_tokens_reserved <> p_input_tokens OR prior.output_tokens_reserved <> p_output_tokens` → `binding_mismatch`**·provider/model/region/priceRevision 同判）——EXPERT §三 :21②「0083:44-58 重放 binding_mismatch」实测块 :46-58 |
| 6 | `packages/db/migrations/0033_ai_cost_governance.sql` | `2cce40191d81` | reservation DDL：:38 `CREATE TABLE ai_cost_reservation`·:51 status CHECK 五值（'reserved','dispatching','settled','released','unknown'）·:52 `reason_code text`（无 CHECK·自由形）·:18-19 input/output_tokens_actual 列（0036 :14-19 加列亲证） |
| 7 | `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a79da` | :27-33 `ai_model_invocation.estimate_input_tokens` 列+CHECK（NULL 或 BETWEEN 1 AND 2000000）——claim 冻结值域下界 ≥1=件③ LEAST 结果下界依据 |
| 8 | `packages/db/migrations/0185_gateway_billing_ledger_payer.sql` | `022016586394` | 链顶现状（bill4·**本刀零触**·号位顺延基·链深 185 亲证） |
| 9 | `packages/db/src/model-op/ai-cost-governance.ts` | `1efb8d969cf3` | db wrapper：:24-29 `AiTextCostReservationInput`（maxInputTokens/maxOutputTokens 字段名系历史语义·喂 `p_input_tokens`）·:41-49 `reserveAiTextCost`（$8=reserved input·**本刀 SQL wrapper 零字节·LEAST 在调用方**）·:61-66 `settleAiTextCost`（:64 调 `ai_cost_settle_text_scoped`·**裁决项②(a) 时返回形扩 overage**） |
| 10 | `packages/db/src/model-op/model-invocation.ts` | `1d8acb7f650f` | 派发 wrapper：:131-139 `markModelInvocationDispatched`（**:135 调 `ai_model_transition_dispatched_scoped`=:550 等值点产线在用的实证**）·:102-128 claimModelInvocation 19 参（零触） |
| 11 | `packages/ai-runtime/src/model-client.ts` | `bef16cbdc2a1` | **refine(estimate) 供给面（零触）**：:252 planContextBudget·:279-283 estimateTokens 分派（:281 v1→byteEstimate/v2→cjkWeightedEstimate·**:283 `policy.calibration ? refineEstimate(raw, …) : raw`=蓝本 refine(estimate) 的 exact 载体**）·:643/:662/:894 三调用点·prepare 返回 `estimateInputTokens: context?.ok === true ? context.plan.inputTokens : undefined` |
| 12 | `packages/ai-runtime/src/usage-reconciliation.ts` | `9f6b5faea5bd` | :222-226 `refineEstimate`（:226 `Math.ceil(calibration.factor * estimateInputTokens)`·上界语义）·:29 KNOWN_ESTIMATOR_VERSIONS 双枚举（0184 面·零触） |
| 13 | `packages/ai-runtime/src/context-budget.ts` | `45c3c3431527` | :138-146 estimateContextTokens 分派（零触·③交付面背景） |
| 14 | `packages/ai-runtime/src/usage-calibration-reconciler.ts` | `1b29b126e54c` | :88 `resolveLatestCalibratedFactor`——**生产零调用维持面（⑥面·本刀零字节）**：全仓 rg 恰 8 处命中=定义 :88+导出 index.ts :85+worker reconcile.ts :37 注释+两 proof 引用（§0.2 亲证） |
| 15 | `apps/worker/src/model-cost-governance.ts` | `f777c642ac88` | issues-final :174 第三锚：:97-126 endpoint()（:102-106 maxInputTokens/maxOutputTokens/contextWindow/safetyMargin env 解析·**本刀零触**——静态上限语义保留·件③在 reserve 相位取 LEAST 非改上限）·:121-123 env 估算器双值门（③交付·零触） |
| 16 | `apps/worker/test/model-op00-db-state.proof.ts` | `073627b6da71` | **静态钉（同批更新面）**：恰 **19 个 `A(` 臂**（rg 实测）·:140-176 binding-drift 臂（reservation provider 漂移→`ai_model_dispatch_cost_reservation_binding_mismatch`·:158 断言）·:178-193 同键重放漂移臂（`logical_node_binding_mismatch`）·:195-240 raw-binding 臂（forged permit+price 漂移→trigger `ai_model_dispatch_cost_reservation_required`）——**三臂漂移维度均系 provider/price 非 token 界·≤ 改形后原值保持绿**·本刀**新增** ≤ 语义臂（§2-1④） |
| 17 | `packages/ai-runtime/src/metrics.ts` | `db3e79c8c43b` | 裁决项②授权面：:72-104 METRIC 单真源（:90 modelCostDecisions/:91 modelCostSettledMicroCny 先例）·:119-146 registerBaselineMetrics 基线预注册（:145 decision 标签枚举形）·:4 低基数 label 纪律 |
| 18 | `packages/db/src/index.ts` | `7c9c00ed414c` | db 导出面（:221 cost 族导出行·bill4 后新位）——裁决项②(a) wrapper 返回形变更经此面零新增导出 |
| 19 | `packages/ai-runtime/src/index.ts` | `e6ecc64ef778` | ai-runtime 导出面（:85 reconciler 族）——本刀零新增导出（blob 恒等纪律） |

### 0.2 漂移登记（复核快照=issues-final/review-log 引行 → 现树 `e1cb1110`·全亲读重 pin）

| 快照锚 | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| issues-final :174「invoke.ts:742-746」 | :858-871（GODFN-1a 相位化搬移后·:862 `maxInputTokens: policy.maxInputTokens` 机制原值） | 行号大漂·机制原值 |
| EXPERT §三 :24「新迁移 `CREATE OR REPLACE FUNCTION ai_model_invocation_state_guard()` 逐字镜像 0088 仅 :162 等值谓词改 `≤`」 | **勘误级补全（裁决项④承重事实）**：等值谓词在两处——0184 :73 现行 guard 体 :184（=0088 :162 同行）**且** `ai_model_transition_dispatched_scoped` 0088 :550（`model-invocation.ts:135` wrapper 产线在用亲证）——**单改 :162 则 LEAST 预留在 :550 先 raise `ai_model_dispatch_cost_reservation_binding_mismatch`·预留改革死在派发**；issues-final :174 原文自含 「:550」·故双点同批改 ≤ 系蓝本 :174 已列面的落实非扩权 | 蓝本字面欠完备·:174 列面已含·判读=双点同批 |
| EXPERT §三 :25「估算器版本+因子版本随 claim 冻结（防重放漂移）」 | **已由 0184 落地**（invoke :726-727 传参+0184 两列 identity-immutable+0119 :27-33 estimate_input_tokens 列·`rg "estimator_version" packages/db/migrations` 恰 0184 命中） | 前置已消解·本刀零迁移义务·只消费 |
| EXPERT §三 :21②「0083:44-58 重放 binding_mismatch」 | 0083 :46-58（谓词 :54-56·`IF FOUND` :46 起） | 块界微漂·机制原值 |
| cost1 :62「resolveLatestCalibratedFactor 生产零调用恰三处」 | `rg -n "resolveLatestCalibratedFactor" packages apps`（-g '*.ts'）恰 8 处：定义 usage-calibration-reconciler.ts :88 + ai-runtime index.ts :85 导出 + worker reconcile.ts :37 注释 + ai-runtime proof 4 处 + worker windowing proof import/调用 :35/:347——**apps 生产调用零**（proof 侧非生产） | 结论不变·⑥面零触维持 |
| 快照未列 0184/0185 | 0184=③交付在链（5a89d95d0b6c）·0185=bill4 在链（022016586394）·链深 185 | 补 pin |

### 0.3 现势并发登记（强制）

1. **主线前移+迁移号占用图**：起草窗口 `f0147886`→`e1cb1110`（merge(bill4)·恰 14 文件 bill4/commerce 面+0185·§0.1 十九锚十八 blob 恒等·db/src/index.ts 重 pin）。链顶=**0185**·0186/0187 主线未占未写·**0188/0189=5B-MIG（`line/batch5b-mig`）/S4b（`line/tokstream-s4b`）拟占**（协调方分配指令·两支线迁移目录零实落亲证：`git ls-tree` 各顶 0181/0184）→ **本刀迁移号 0190 起**；EXEC 立项日按主线链顶顺延登记（若 0186-0189 有实落/让位变化·find 实测顺延·`check-migration-version-uniqueness` 终裁）；本刀计划恰 1 新迁移（件①+件② SQL 同卷多节·沿 0184 多节先例）·裁决行使若拆件自 0190 连续顺延并随卷登记。**非纯代码刀**（含迁移）。
2. **跨轨/同族交点**：⑤AG-08 熔断键按端点=队列下一刀（现无在飞支线·本刀与其零文件冲突预期：AG-08 面=breaker/admission 键·本刀面=reserve/settle SQL+invoke reserve 相位一行）；⑥回灌接线（resolveLatestCalibratedFactor→policy.calibration 生产 setter）+显式缓存（nonce 围栏渲染结构·EXPERT :73）=后继·本刀零触；EG-B1 unknown ageing=失败语义轨面零触；AG-24 已收官并线（model-client :650 区 blob 已随其变更——本刀 model-client 零字节·§0.1 #11 为现树新 blob）；EG-B3 fee ledger 对账/EG-B4 RAG embedding 旧轨双轨=范围外（§3）。**共享 SSOT 四件**（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review）零触（刀位图翻面权归协调方）。
3. **本刀与 ③ 交付的承重关系（如实链）**：③ 落 claim 冻结缝（0184 estimator_version/calibration_factor_version + 0119 estimate_input_tokens 三列 identity-immutable）=EXPERT §三 :25 冻结半已承接——本刀件③ reserve 相位取 `plan.estimateInputTokens` 与 claim 冻结值**同源同值**（同一 plan 对象同相位算得·:722 claim 落库/:862 reserve 取用）；**0083 :46-58 binding_mismatch fail-closed 语义保留不放松**（同键重放携新 token 信封=0083 头注「must not present a newly configured envelope」原义·漂移防线库级兜底）——防重放漂移=冻结审计（0184）+binding fail-closed（0083）双层，非 reserve 值放松。

## §1 红事实 + 修法

### 红事实 A：预留静态 max+双等值锁死（issues-final AG-11 :169-178·现 pin 全亲证）

| 面 | 锚（@`e1cb1110` 实测） | 事实 |
|---|---|---|
| 预留直传上限 | `invoke.ts:862` `maxInputTokens: policy.maxInputTokens`（:859-863 reserveAiTextCost 调用·:24-29 wrapper 字段喂 `p_input_tokens`） | 一次几百 token 的调用也冻结 max_input_tokens 全额（issues-final :175 触发例原值）——并发下月度预算虚占→budget_exhausted 提前（:176） |
| 等值锁点一（trigger） | 0184 :73 现行 guard 体 **:184** `AND r.input_tokens_reserved=h.max_input_tokens`（=0088 :162 同行·:191-194 trigger `tr_ai_model_invocation_state_guard` BEFORE INSERT OR UPDATE） | claimed→dispatching 翻转时预留≠header 上限即 raise `ai_model_dispatch_cost_reservation_required`——「结构上改不了」（issues-final :169 标题原话） |
| 等值锁点二（transition 函数） | 0088 **:550** 同谓词（`ai_model_transition_dispatched_scoped` 内·:556 raise `_binding_mismatch`·`model-invocation.ts:135` wrapper 产线在用） | 第二道同值锁·先于 trigger 执行（函数体先查后 UPDATE）——**仅改 :184/:162 则 LEAST 预留死在 :550**（§0.2 勘误级补全·裁决项④） |
| 上限本身不改 | `model-cost-governance.ts:102-106`（env 解析静态上限·:106 三和≤窗口校验） | issues-final :177 修法「min(上限, 派发前估算) **或者** 按 operation 分别配置上限」——本刀取 **min 形**（第一半·③估算器已备）；按端点配额形不采（env 面爆炸·且 ③ 后估算已可信） |

### 红事实 B：超预留地雷（EG-B2·补收义务·现 pin 全亲证）

| 面 | 锚（@`e1cb1110` 实测） | 事实 |
|---|---|---|
| settle 双 raise | `0036:118-120`（actual_input>reserved 或 actual_output>reserved 任一）+ `:124-126`（actual_cost>reserved_micro_cny）——同码 `ai_cost_actual_exceeds_reservation`（ERRCODE check_violation） | 预留一旦改小（LEAST），供应商真实 token 超估算即撞 raise——「所有估算修法共用地雷」（EXPERT :52 EG-B2 原话） |
| 幽灵预留传导链 | `invoke.ts:963/:1064` settle 调用 → :982-995/:1093-1108 catch → `markAiCostUnknown('settlement_or_record_failed')` → 0033 :51 status 锁五值（settled 不可达） | raise 后钱冻结在 unknown·既不 settled 也难 release——**比现状更糟的 AG-06 式幽灵预留**（EXPERT §三 :21①原话）——件②必须与件①③同刀（「补收（EG-B2 一并）」§七 :67 的「一并」义） |
| header 上限真值源 | 0085 :42-43 `ai_model_logical_node_header.max_input_tokens/max_output_tokens`（BETWEEN 1 AND 1000000·billed 行双非空 :52 CHECK）·claim 时冻结（0088 :202+ 注册函数） | 「settle 放宽为 `actual ≤ header max`」（EXPERT §三 :24）的边界真值=header 冻结上限非 env 现值——封顶语义有库级锚 |
| 重放绑定防线 | 0083 :46-58（:54-56 token 信封等值比较→`binding_mismatch`） | 同键重放携不同预留值→fail-closed——**本刀保留**（§0.3-3·双层防漂移） |

### §1-修法（EXPERT §七 :67 成本轨④原文为修法权威「④AG-11 三件套+补收（EG-B2 一并）」·§三 :24-25 三件套逐件+issues-final :177 修法第一半「min(上限, 派发前估算)」。迁移 **0190 起**+TS 增量·历史迁移 0001-0185 零字节。本刀含恰 1 新迁移）

**件① 双等值点 `≤` 镜像（新迁移 0190·两函数 CREATE OR REPLACE·签名零变故零 DROP 零 REVOKE/GRANT 重发）**：

- **guard 镜像**：`CREATE OR REPLACE FUNCTION ai_model_invocation_state_guard()` 以 **0184 :73 现行体为逐字镜像底**（0179 claimed→claimed 释放守卫+0181 prompt_version+0184 estimator/factor 两冻结列 identity-immutable 比较行**全数保留原值**）·**仅 :184 等值谓词改 `AND r.input_tokens_reserved<=h.max_input_tokens`**·:185 输出侧等值行 `r.output_tokens_reserved=h.max_output_tokens` **逐字保留**（输出无估算·等值语义不放松）——EXPERT §三 :24「逐字镜像 0088 仅 :162 等值谓词改 `≤`（触发器自动生效）」逐字执行·镜像底取现行体（0088 原体缺 0179/0181/0184 增量·照抄原体会静默回退三刀交付=Ban 面 §5）。
- **transition 镜像**：`CREATE OR REPLACE FUNCTION ai_model_transition_dispatched_scoped(text,text,uuid,text)` 以 **0088 :480 现行体为逐字镜像底**·**仅 :550 等值谓词改 `<=`**·其余逐字保留（含 :527-537 缺预留→`_required` 与 :539-556 绑定漂移→`_binding_mismatch` 两查分立形·provider/model/region/price_revision 等值四行原值）——§0.2 勘误级补全落实（蓝本 :24 字面仅点名 guard·:550 系 issues-final :174 已列面·单改 guard 必死派发亲证于 §1 红事实 A 第三行）。
- 同迁移落 `ALTER TABLE ai_cost_reservation ADD COLUMN IF NOT EXISTS overage boolean NOT NULL DEFAULT false`（件②标记列·additive·0036 :14-19 加列同形先例）。

**件② settle 放宽+行内扩+overage 标记（同迁移 0190·`ai_cost_settle_text` CREATE OR REPLACE·5 参签名零变故 REVOKE/GRANT 零重发·`ai_cost_settle_text_scoped` wrapper 零字节调穿）**：

- **保留原值**：:102-105 入参校验/:107-109 找不到行 raise `ai_cost_reservation_missing`/:110 已 settled 幂等返回/:111 非 dispatching raise `ai_cost_settle_invalid_state`/:128-135 月度结转 UPDATE 形/:136-140 行终态 UPDATE 形——全部逐字保留。
- **放宽形（恰两处 raise 的替形）**：`:118-120` 与 `:124-126` 两 raise 替换为**header 封顶放宽**——函数内解析 header 冻结上限（join 链：`ai_cost_reservation r` → `ai_model_invocation i ON i.owner_user_id=r.request_owner_user_id AND i.idempotency_key=r.idempotency_key AND i.cost_scope_id=r.scope_id` → `ai_model_logical_node_header h ON h.owner_user_id=i.owner_user_id AND h.logical_node_key_digest=i.logical_node_key_digest`·**defensive**：invocation/header 缺行→COALESCE 退回 reservation 自身预留值=现严格语义·fail-closed 不扩权）；actual_input/actual_output 任一侧 ≤ 对侧 header 上限时**放行结算**：actual_cost 重算后若超原预留→**行内扩**（`input_tokens_reserved=input_tokens_actual`/output 同形/`reserved_micro_cny=actual_cost`/`overage=true` 同 UPDATE 落定·0036 :136-140 行 UPDATE 扩形）·月度结转照原形（reserved−=原预留/settled+=actual_cost·**月限超额不拒绝**——「钱已花·拒绝搁浅账本」EXPERT §三 :24 原话·只落 overage 标记）；**actual 超 header 上限仍 raise `ai_cost_actual_exceeds_reservation` 原码**（封顶语义=蓝本「settle 放宽为 `actual ≤ header max`」的 `≤` 边·库级防线不撤）。
- **告警载体（裁决项②）**：(a) 推荐——db wrapper `settleAiTextCost` 返回形 `{ microCny: number; overage: boolean }`（SQL 侧 `ai_cost_settle_text_scoped` 返回加列·两 invoke 调用点 :963/:1064 解构）+ `metrics.ts` METRIC 新增 `model_cost_settle_overage_total` 计数器+registerBaselineMetrics 基线预注册（:119-146 形·:4 低基数纪律·零 owner/PII label）——「预算月检查只告警不拒绝」的告警面闭环；(b) 仅 DB overage 列（最小面·告警靠库侧轮询·无 metric）。两形均保「不拒绝」铁律·绝不静默选一。

**件③ 预留传参改 `LEAST(max, refine(estimate))`（TS·invoke.ts reserve 相位恰一行·SQL reserve 零字节）**：

- `invoke.ts:862` `maxInputTokens: policy.maxInputTokens` → **`maxInputTokens: Math.min(policy.maxInputTokens, plan.estimateInputTokens ?? policy.maxInputTokens)`**——`refine(estimate)` 的 exact 载体=`plan.estimateInputTokens`（model-client prepare :643 区返回·planContextBudget :283 已套 calibration refineEstimate·同相位与 claim 冻结值 :722 同源同值·§0.3-3）；`?? policy.maxInputTokens` 缺省回退=现行为（非预算 seam/scripted model 无估算时零漂·0036 `p_input_tokens>=0` 与 `p_input+p_output>=1` 域约束由 maxOutputTokens≥1 恒满足·估算值域下界 ≥1 由 0119 :33 CHECK 背书）。
- **SQL reserve 零字节**：`ai_cost_reserve_text`（0083 :8 现行体）/`ai_cost_reserve_text_scoped`/wrapper `reserveAiTextCost`（ai-cost-governance.ts :41-49）**零字节**——LEAST 在调用方算得后照常传值；0083 :46-58 重放 binding fail-closed 语义**原值保留**（同键重放携漂移信封仍 `binding_mismatch`→invoke :865-870 `cost_binding_mismatch` 拒绝·双层防漂移第二层）。
- **digest 摘要集零变**：costPolicyBinding（invoke :348-364）零字节——LEAST 是 reserve 相位派生量非绑定身份·requestDigest 不含预留值（含 policy 上限 :356 原值）。
- **静态钉同批（EXPERT §三 :25「parity-b2 静态钉需同批更新」落实）**：e2e 对账账本面零漂亲证（`rg "model_cost|reserveAiTextCost|settled" e2e/full.e2e.ts e2e/helpers/` 零命中·floors 无本刀触面）→ `e2e-parity:check` 作为**零漂门**原值跑（非改形面）；**真正同批更新的静态钉**=`model-op00-db-state.proof.ts`（§0.1 #16）——既有 19 臂中 binding 三臂（:140-176/:178-193/:195-240·漂移维度均系 provider/price 非 token 界）**原值保持**·新增 ≤ 语义臂（§2-1④）·改写面仅限新增·收据登记。

### 用户口径钉子（⛔ 不得更改）

「**凡是调用大模型的面都必须有合理的处理（缓存/计量/降级）**」——本刀承载其**计量半的钱账诚实面**：预留不再按静态上限虚占（件③·估多少占多少·上界封顶）+结算不再因估算误差搁浅成幽灵预留（件②·钱已花必落账+超额显式打标告警）+库级等值锁不再把「按需预留」判非法（件①·双点 ≤ 镜像）。缓存半=①#48 观测（已落 nail `6f2ed876`）+⑥显式缓存（后继）；降级半=CTX-02 trimOrder/rejected 显式拒绝（已落·零触）。三半之外（监控/预算政策/熔断）各有在案机制·本刀不越权代管。

## §2 验收断言候选（prove 全假体·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **迁移+放宽 proof（隔离库真迁移链·沿 cost2 ucal-windowing/cost3 ag12-estimator-freeze 形·新 proof 件）**：①guard ≤ 正臂——fixture claim+header（max_input=10000）+reserve input=600 → `markModelInvocationDispatched` ok=true·invocation=dispatching·slot 在位（=件①件③联合通路）；②identity-immutable 回归臂——claim 后 UPDATE estimator_version/calibration_factor_version/prompt_version 任一 → `ai_model_invocation_identity_immutable`（三刀交付零回退显式锁）；③输出侧等值保留臂——output_tokens_reserved≠header max_output → 仍 raise（不放松显式锁）；④binding 身份臂原值——provider/price_revision 漂移 reservation → `_binding_mismatch`/`_required` 双异常臂照 model-op00 形各一（身份等值四行零放松显式锁）；⑤settle 五相——(α) actual≤预留 → overage=false 常态结算；(β) 预留<actual≤header max → settled+行内扩断言（input_tokens_reserved=actual+reserved_micro_cny=actual_cost）+`overage=true`+月度 reserved 全额释放/settled=actual_cost；(γ) actual>header max → raise `ai_cost_actual_exceeds_reservation`（封顶不破）；(δ) header/invocation 缺行 defensive → 现严格语义（COALESCE fail-closed）；(ε) 月限超额场景 → 结算成功不拒绝+overage=true（「只告警不拒绝」显式锁）；⑥重放防线原值——同键重放携同信封 → `held`·携异信封 → `binding_mismatch`（0083 零放松）；⑦`ai_cost_settle_text_scoped` wrapper 幂等调穿（已 settled 二次调用返回同额）。
2. **invoke 相位 proof（scripted model·零外呼）**：①LEAST 通路——estimate<max 的 plan → reservation 行 `input_tokens_reserved=LEAST` 值断言（fixture 隔离库直查）；②零漂回退——estimateInputTokens=undefined 的 scripted seam → 预留=max 原值；③overage 端到端——供应商 usage>估算·≤max → settled 绿+overage 可读+（裁决②(a) 时）metric 计数断言；④costPolicyBinding 零字节断言（blob 对 §0.1 #1 内 :348-364 区）+requestDigest 不含预留值断言。
3. **静态钉/既有门回归原值**：`prove:model-op00-db-state`（19 既有臂原值全绿+新增 ≤ 臂·收据登记）·`ai-cost-governance.proof`（embedding 旧轨 6 臂原值·零触面）·`migrate:prove`（:406 trigger 存在臂+:340-342 reserve 签名特权臂原值——本刀零 DROP 零签名变更·断言面零重钉预期·若实测需重钉如实登记原因）·`prove:ag12-estimator-freeze`（37 臂）·`prove:ucal-windowing`（38 臂·**0176 号位陈旧钉 1 臂基线同红**沿 cost3 §9 口径如实登记不洗）·`prove:model-usage-cache-observe`（28 臂）·`prove:usage-calibration-bleed`（cost3 收官口径 26 运行臂）·`e2e-parity:check` EXIT=0（零漂门）·`check-migration-version-uniqueness`（0190 唯一）·`turbo typecheck` 3/3·`docs:check` EXIT=0（cap 2064·scanned 实测）。数字口径以 EXEC 立项日 rg 实测为准·**偏差熔断**：恰数锚（reserve 调用点=1/settle 调用点=2/等值谓词=2/0036 raise=2/19 既有臂）实测≠登记值即停（§8）。

## §3 范围外（边界清单·越界即 FAIL）

1. **⑤AG-08 熔断键按端点**（成本轨下一刀）：breaker/admission 键面零字节——本刀 reserve/settle 面与其零交集。
2. **⑥回灌接线+显式缓存**：`resolveLatestCalibratedFactor` 生产接线零字节（:88 blob 恒等·生产零调用维持）·policy.calibration 生产 setter 零新增·nonce 围栏渲染结构零触。
3. **EG-B1 unknown ageing 对账器**（失败语义轨面）/ **EG-B3 fee ledger 对账** / **EG-B4 RAG embedding 旧轨**（reserveAiCost latest-price 双轨）：零触——本刀 settle 放宽恰 `ai_cost_settle_text` 一族·embedding `ai_cost_settle`（0033 :159-167 严点）**零字节**。
4. **#48/#49 收口结论**：本刀=其硬前置的施工刀·收口判定与观测结论零翻。
5. **价格本/预算政策零改**：零新价格行·ai_cost_budget_policy/月限语义零字节·0036 :81 reserve 期 budget_exhausted 检查原值（本刀只放宽 settle 侧·reserve 期闸门不动）。
6. **claim 冻结缝零触**：0184 两列+0119 estimate 列+claim 函数 19 参签名+`model-invocation.ts`/`invoke.ts` claim 相位（:716-728）零字节。
7. **历史迁移零字节**：0001-0185 已落文件逐字节不变（0185 blob 恒等对 §0.1 #8）·0186-0189 号位不 claim（0188/0189=5B-MIG/S4b 拟占·§0.3-1）·本刀恰 1 新迁移 0190。
8. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖

**前三刀已收官非闸**：①（nail `6f2ed876` 止血+观测）②（0177 窗口化+合并 max+保留期）③（nail `9d69a5b1`·估算器 v2+claim 冻结缝 0184）——本刀件③的 `refine(estimate)` 输入与 §0.3-3 冻结消费面即 ③ 交付；**EXPERT §三 :22「AG-12 是前置」已消解**。**与失败语义轨零文件交集**（六刀全收官·AG-D 0179 已并线）。**下游**：⑤AG-08（并行不阻）·⑥视③数据定回灌/显式缓存·**#48/#49 收口=本刀后的判定面**（批 2 侦察席定谳「收口硬前置=成本轨④」）。**与 bill4 零语义交叠**（0185 gateway billing ledger payer 面·本刀零触）。

## §5 Ban 列表 + pins（沿 cost1/cost2/cost3 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·成本轨刀位行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源；**本刀增补**：Ban 输出侧谓词放松（`r.output_tokens_reserved=h.max_output_tokens` 等值逐字保留·无估算面不扩权）；Ban header 封顶突破（actual>header max 仍 raise `ai_cost_actual_exceeds_reservation`·库级防线不撤）；Ban guard 镜像照抄 0088 原体（镜像底=0184 :73 现行体·0179/0181/0184 增量比较行全保留·照抄原体=静默回退三刀交付）；Ban transition 函数零改（仅改 guard 即落派发死锁·§0.2/§1 红事实 A）；Ban 动 0083 重放绑定语义（:46-58 fail-closed 原值·双层防漂移第二层）；Ban 动 SQL reserve 族（ai_cost_reserve_text/scoped/wrapper 零字节·LEAST 在调用方）；Ban 动 claim 冻结缝（0184/0119/claim 相位零字节·§3-6）；Ban settle 期月限拒绝回潮（overage 结算绝不因月限 raise）；Ban 0036 reserve 期 budget_exhausted 检查改动（§3-5）；Ban 动 embedding 结算严点（ai_cost_settle 0033 零字节·EG-B4 面）；Ban 批量回改存量行（overage/行内扩只对新 settle 生效·已 settled/released/unknown 存量行零 UPDATE·无数据回填迁移）；Ban requestDigest 摘要集变化（costPolicyBinding 零字节）；Ban 接线回灌（resolveLatestCalibratedFactor 生产调用零新增）；Ban 静态上限 env 面改动（model-cost-governance.ts 零字节·issues-final :177 修法取 min 形非配额形）；Ban claim 0186-0189 号位（§0.3-1）·Ban 改历史迁移（0001-0185 零字节·blob 恒等对 §0.1）；Ban 删/改既有 proof 臂语义（新增臂外零改写·migrate.proof 零重钉预期·若实测必须重钉如实登记原因并保持强度不减）；Ban 真实模型外呼（est live=0·fixture/隔离库形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/隔离库 fixture·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①迁移+放宽 proof=隔离 PG 真迁移链+fixture 断言（零外呼·零生产库）；②invoke 相位 proof=scripted model fixture+隔离库直查（零真实 provider）；③回归门=既有 prove 原值重跑。prove 全 假体/静态/隔离库·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-cost4-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 cost1/cost2/cost3 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 用户口径 + 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·迁移号照 §0.3-1 实测顺延）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**停止条件（四类·命中即停并回报协调方·绝不带病续刀）**：

- **现场漂移**：EXEC 立项 §0 重 pin 时恰数锚实测偏离（reserve 调用点≠1/settle 调用点≠2/等值谓词≠2/0036 raise≠2/model-op00 既有臂≠19/链顶≠§0.3-1 登记值）·或 blob 漂移超出「结论不变只更行号」判读——停·重 pin 复核后请示。
- **机制不满足**：billed 派发行存在无 header 绑定的实证（BINDING-001 破口→件② COALESCE fail-closed 面失真）·或 OR REPLACE 撞「cannot change」类签名/返回形冲突（transition/guard/settle 三函数任一被 §0 未登记的在飞迁移改写过）——停·呈报。
- **越界需要**：修法行使中发现必须动 0083 语义/价格本/claim 冻结缝/EG-B1/回灌接线才能达成验收——停·绝不越界顺手做·呈报裁决。
- **验收红不可修**：§2 门矩阵既有臂基线红超出已登记项（0176 号位臂）·或新增臂两轮修复不绿且根因在本刀改动面外——停·如实登记上报不洗不 retry-to-green。

**待双审/EXEC 裁决项**：

- **①transition 函数同批（§0.2 勘误级补全·件①范围）**：(a) guard(:184)+transition(:550) **双点同批 `≤` 镜像**（issues-final :174 原文含 :550·单改 guard 则 LEAST 预留死在 :550 派发 raise·机械实证 §1 红事实 A——**推荐**）；(b) 仅 guard 字面（蓝本 :24 字面·必现派发死锁——呈报仅供完整性·绝不静默采 (b)）。
- **②overage 告警载体（件②授权面）**：(a) wrapper `settleAiTextCost` 返回形扩 `{ microCny, overage }`+METRIC `model_cost_settle_overage_total`+基线预注册（告警面闭环·metrics 单真源先例 :90-91·**推荐**）；(b) 仅 DB overage 列（最小刀面·告警靠库侧观测·无 metric 载体）。附带：metric 命名与 label 集（§1-件② 草案形为准·零 owner/PII）。
- **③预留下限语义（件③授权面）**：(a) `LEAST(max, estimate)`·estimate 缺失回退 max（`??` 形·非预算 seam/scripted 零漂·**推荐**）；(b) billable 面 estimate 缺失即确定性拒绝（面扩大·全部 scripted/旧 seam 臂红·违背 v1 缺省零漂纪律——呈报完整性）。
- **④settle header 上限解析形（件②授权面）**：(a) 函数内 join+COALESCE fail-closed·签名 5 参零变（REVOKE/GRANT/migrate.proof 零连锁·**推荐**）；(b) 加参显式传 header max（签名变→wrapper+两调用点+migrate.proof 连锁重钉·多面无增益）。

---

*AG-COST4 REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`e1cb1110`（起草窗口自 `f0147886` 前移一笔 merge(bill4)·恰 14 文件+0185·十九锚十八 blob 恒等·db/src/index.ts 重 pin）· 分支 `line/ag-cost4` · 工作树 `meetwise-cost4` · 蓝本=EXPERT-REVIEWS §七 :67 成本轨④（修法权威）+§三 :20-25（AG-11 修法事故修正·:25 冻结半已由 0184 消解·LEAST 半+parity-b2 静态钉半=本刀）+§六 :52 EG-B2 + issues-final AG-11 :23/:169-178（:174 file:line 含 :550 双点）+ review-log AC-F3 :69 + LANDING-INDEX :35 + cost1/cost2/cost3 三卷（授权面承接·③ §3-1 让位兑现）· 范围=件①双等值点 `≤` 镜像（guard 0184 现行体 :184+transition 0088 :550·输出侧等值保留）+件② settle 放宽（header 封顶+行内扩+overage 标记列+月限只告警）+件③ reserve 传参 `LEAST(max, refine(estimate))`（invoke :862 恰一行·SQL reserve 零字节·0083 binding 原值）+model-op00 静态钉新增臂 · 不含=⑤熔断键/⑥回灌+显式缓存/EG-B1/EG-B3/EG-B4/价格本/claim 冻结缝/存量行回改 · 迁移号 **0190 起**（链顶 0185·0188/0189=5B-MIG/S4b 拟占·EXEC 立项日顺延登记）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
