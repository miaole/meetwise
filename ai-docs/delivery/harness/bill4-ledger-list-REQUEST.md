# BILL4-LEDGER-LIST REQUEST（billing 战役 P3 姊妹刀·积分明细列表——C 端用户/B 端企业双端逐笔读面 API（时间/类型/数额/余额快照/来源引用/幂等键/状态）+ 余额面承接 · 纯读为主预期零迁移 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。

**席位**：billing 战役 bill4 明细列表起草席（LEDGER :438 BILL3 收官登记 STILL OPEN 行「明细列表 §3.13 姊妹面」承接行·协调方常设 loop·蓝本裁决面=十三节裁决②+§3.13 升 P1 面）。
**基线**：`feat/mysql-schema-skeleton` @ `94b8519b`（`94b8519b867a23d34c0ec96fd604a60fc8720bed`·主线 tip·`git log -1` 实测 2026-10-13 14:18:20 +0800·「docs(ledger): 刀位图 billing P3 行勘误——fee425cd 已收官」commit·零码面）·分支 `line/bill4-ledger-list`·工作树 `meetwise-bill4`（`git worktree add ../meetwise-bill4 -b line/bill4-ledger-list 94b8519b` 本起草席已立·HEAD 落 `94b8519b` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：蓝本两层+LEDGER 承接链+姊妹刀卷全部精读引用——①`ai-docs/delivery/billing-redesign/README.md`（blob `cd4c060f`·rev1 定稿 532 行）**§3.13 积分明细列表 `:201-204`**（「必做·升 P1 面·已裁·十三节裁决②」·双端各一逐笔可见=时间/场景/扣分/退回/余额·数据源三账本=entitlement_consumption（`0001_baseline.sql:109-122`）+topic_charge（0172 §6.3）+question_usage_ledger（0171 §6.2）·API【推断】`GET /billing/ledger`（分页·用户本人）+企业维度（按 `payer_user_id` 过滤·0157 已落列）+前端明细页+吸收 v1 F11 的余额展示（`GET /billing/balance`）·透明度承诺（§3.4）的账面落点）+ **§3.4 透明度 `:144-147`**（结束逐话题明细承诺）+ **§0 `:27`**（用户扩权原则「凡是调用大模型的面都必须有合理的处理」+扩张包 §3.10–§3.13 明细列表在列）+ **§6.6 接入点 `:383-387`**（**`GET /billing/ledger`（+企业维度·§3.13 积分明细列表·升 P1）**原文+`GET /interviews/:id/charges` 并列在案）+ **§7 `:391-413`**（API 行 `:403` 事件字段/话题明细接口/`GET /billing/ledger`·前端行 `:404` 双端积分明细页·P1 工作量 `:413` 含「积分明细列表（§3.13·升 P1 面）」）+ **§11 三态口径 `:504`**；②同目录 `LANDING-INDEX.md`（blob `0694ff22`）：**第十三节裁决二 `:60-63` 其第 2 则 `:63` 积分明细列表原句**（「必做·升 P1 面」用户裁决落卷原文·全文录入本卷 §8）+ 第七节 `:41-47`（0170-0173 定谳）+ 第十二节 `:50-57` + 十四 `:66-70`（rev1 落卷「§3.13（升 P1·三账本·GET /billing/ledger·吸收 v1 F11）」）；③`ai-docs/delivery/harness/product-campaign-LEDGER.md`（blob `61e66dd3`）**`:438`**（BILL3 收官登记 STILL OPEN：「影子期 2 周运营观察+封顶 6 终值复核+**明细列表 §3.13 姊妹面**+扩张包+0046 混合 unscored 放松」——本卷即该行姊妹面向之起草兑现）+ `:404-434` 刀位图（计费三刀收官 `:419-422`·起草链 `:426-431`·**排期 `:432` AG-39 私有题库**+`:433` AG-38=0182/0183 拟占与 0184 成本③ 拟占的登记出处面）+ `:437`（bill3 收官 merge `fee425cd`·0172/0173 各恰一行·方案②公式）；④姊妹刀卷 `bill3-settlement-REQUEST.md`（blob 现值 `503ccd59` 族·主线在案）**§9-2 E6**（「明细消费面=§3-3 姊妹刀读 topic_charge 直查（零事件依赖）」——本卷读真账直查的承接明文）+ **§3-3**（「积分明细列表 §3.13 API+前端（GET /billing/ledger+双端明细页+GET /billing/balance）=姊妹面另刀——topic_charge 本刀落表即其数据源之二」）。

## §0 现状锚（起草席亲读·base `94b8519b`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list` 建前 28 树实测（主仓+5e/ag19/ag24/ag37/ag38/ag39/aga~agf/authz/bill1/bill2/bill3/billrev/blite/cost1/cost2/e2sc/i263/i6/line-entpay/parity2/qsec/ttlwire）——**无 bill4 树**；落卷复测 30 树（新增本树+`meetwise-cost3` 他刀在飞树·**无第二 bill4 同名树**）。
- 建分支用 `worktree add -b`：建前 `line/bill4-ledger-list` 分支不存在（-b 对既有分支必炸·成功即自证）；落卷复测 `git branch --list "*bill4*"` 恰 1 命中=本席分支。
- `rg -l "bill4" ai-docs/` 建前**零命中**（harness 全卷无同名刀卷·billing-redesign 两件+bill1/bill2/bill3 三卷系蓝本/前刀登记卷非撞名）——落卷后恰 1 命中=本卷。→ **停止条件未触发·树已建卷已落**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`94b8519b`）

| 文件 | blob（8 hex·括号全 40 hex） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/billing-redesign/README.md` | `cd4c060f`（`cd4c060f875d5a69c604f934779128278aa8d1ec`·532 行） | **§3.13 `:201-204`**（裁决段全四行）/§3.4 `:144-147`/§0 扩权行 `:27`/§6.6 `:383-387`（GET /billing/ledger+GET /interviews/:id/charges 并列）/§7 `:391-413`（API 行 `:403`·前端行 `:404`·P1 工作量 `:413`）/§11 三态口径 `:504`——**与 bill3 卷 pin 同 blob 零漂亲证** |
| `ai-docs/delivery/billing-redesign/LANDING-INDEX.md` | `0694ff22`（`0694ff22aab6fa35932d587018c00abe13ecbb5c`·71 行） | 七 `:41-47`/十二 `:50-57`/**十三-2 `:63` 用户裁决原句**/十四 `:66-70`——与 bill3 卷 pin 同 blob 零漂亲证 |
| `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `61e66dd3`（`61e66dd3ccd588b1de3949787905a5949eb21d4`） | 刀位图 `:404-434`（计费 `:419-422`·起草 `:426-431`·**排期 AG-39 `:432`/AG-38 `:433`**·成本轨 ③-⑥ 队列 `:417`）/**BILL3 收官登记 `:435-438`（STILL OPEN 明细列表=`:438`）**/:437（merge `fee425cd` 双亲 0345b467+f4234c92·方案②公式·#31 409） |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（`d68f8dd0e61682603e9cd8fc1c1e8aaaf4965b79`） | entitlement_bucket `:93-105`（kind CHECK `:96`·ck_bucket_capacity `:104`）·ix_bucket_fifo `:106`·**entitlement_consumption `:109-122`**（service_type `:113`·units_requested `:114`·**units_settled `:115`**·**status 四值 CHECK `:116-117`（reserved/confirmed/partial_confirmed/released）**·allocations `:118`·lease_expires_at `:119`·**created_at `:120`**·uq(owner,key) `:121`）·commerce_outbox `:126-134`·**settlement_ledger `:139-147`**（uq_settlement_consumption `:146` exactly-once）·GRANT `:150`·**RLS DO 块 `:152-163`**（四表 ENABLE+FORCE+p_owner=owner_user_id=current_setting('app.principal_user',true)） |
| `packages/db/migrations/0156_enterprise_bucket_billing.sql` | `9ace5b30`（`9ace5b3089641c067e1168688410625e41477e9`） | 形态裁决 :10-12（企业桶=同表 kind 扩值·**owner_user_id=审核通过招聘方**·0001 FIFO/容量全复用）·RLS 口径 :18-22（0001:152-163 在位 fail-closed 断言不重建·企业桶行 owner=招聘方既有 p_owner 天然覆盖） |
| `packages/db/migrations/0157_billing_payer_route.sql` | `ae098d61`（`ae098d61b419d0819199b20769c8d0f4a3d3616a`·173 行） | **形状甲 D-1 裁决 `:6-14`**（consumption 行 owner=候选人+**payer_user_id=招聘方**（job_application.recruiter_user_id 投递时刻固化）·**payer_user_id IS NULL=C 端本人**）·**`ALTER TABLE entitlement_consumption ADD COLUMN payer_user_id` `:26`**·RLS 在位断言 `:41-57`（p_owner 恰一 `:51-55`）·**gateway_entpay_reserve `:65-129`**（SECURITY DEFINER `:69`·owner=principal 派生 `:73`·payer 单跳派生 `:88-93`·insufficient_entitlement P0001 `:124`）·gateway_entpay_apply_allocation `:134` 区 |
| `packages/db/migrations/0170_interview_question_topic_fields.sql` | `8d57dba1`（`8d57dba1798f861870f6f429547a033d66c26024`） | P1 已落：topic_id/ask_mode/clarify_cause 三列 `:19-21`·CHECK 两枚 `:23-31`·ix_iq_topic partial `:33-34` |
| `packages/db/migrations/0171_question_usage_ledger.sql` | `0948ef93`（`0948ef93c6ca7b2d91f056cbd2092bb6bfd3592a`） | P1 已落·**明细数据源之三**：表 `:17-34`（interview_id `:20`/question_id `:21`/topic_id `:22`/operation_id `:23`/**cause 九值 CHECK `:24-25`**（system_ask/system_score/system_plan/retrieval/report/generation_failed/unknown/admission_rejected/user_answer）/usage_source 四值 `:31`/**created_at `:32`**/PK(owner,invocation_key) `:33`）·**GRANT SELECT,INSERT `:36`**·RLS ENABLE+FORCE `:37-38`·p_owner `:39-42` |
| `packages/db/migrations/0172_topic_charge.sql` | `631e1f42`（`631e1f42ff4bde6b7d64597ae113937ec10a71e`） | P3 已落·**明细数据源之二**：interview 计费三列 `:24-26`（**billing_mode NOT NULL DEFAULT 'per_session' `:24`**）·ck_interview_billing_mode `:28-31`·ck_interview_cap `:33-37`·**topic_charge 表 `:39-51`**（answers `:43`/units `:44`/**status 三值 CHECK `:45`（counted/counted_capped/waived）**/reason 可空 `:46`/rule_version `:47`/**created_at `:48`**/PK(owner,interview,topic) `:49`/ck_topic_charge_settled_units（非 counted⇒units=0）`:50`）·GRANT SELECT,INSERT `:53`·RLS `:54-55`·p_owner `:56-59` |
| `packages/db/migrations/0173_tf_interview_consumption_terminal_pair.sql` | `46944f59`（`46944f591a2699fe8cf822c2133dc8460b657a1`·74 行） | P3 已落：tf_ 函数 `:26-74`（per_session 分支 0144 原逻辑逐字 `:50-60`·per_topic_capped 分支方案②比较式 `:62-72`·round(x::numeric,2) `:70`）——明细「状态」语义的 DB 法面（settled 值由触发器钉死=读面免算账） |
| `packages/db/migrations/0180_topic_shadow_meter.sql` | `3abb71b2`（`3abb71b227b1c6f8c2c34bf87b127ee8a2a6e19a`） | P2 已落·**影子边界承重**：头注 `:3-25`（「只算不扣」`:4-5`·**降结算语义=零 units 列零 commerce 列零触发器 `:7-9`**·status 五值观测 `:9-11`）·表 `:27-60`（status 五值 `:37`·cap_value=6 `:46`·cap_hit `:47`·PK(owner,interview,idem_key) `:52`）·RLS `:62-68` |
| `packages/db/migrations/0181_ag19_prompt_version_column.sql` | `617f65be`（`617f65bee17b313578f235776d865913e32b071`） | **主线 max 迁移**（AG-19 prompt_version 观测列·head `:1-8` 亲读）——0182+ 全空闲亲证（`ls packages/db/migrations/ | grep -E "^018[2-9]"` 零命中） |
| `packages/db/src/commerce/commerce.ts` | `855edfcd`（`855edfcd3b3554fda5d81f2caf9ad4592e5ef7d`·**641 行**·bill3 落码后 blob/行号全幅重 pin） | r2 `:36`·reserveEntitlement `:45-105`（#31 units mismatch 抛 `:62-72`·insufficient `:98-101`）·reserveEntitlementForApplication `:116-153`（gateway 调用 `:127-129`）·applyAllocationDelta `:157-169`·confirmConsumption `:178-227`（settled=r2(requested×ratio) `:194`·payerRouted `:200`·outbox `:223-225`）·confirmConsumptionUnits `:235-275`·releaseConsumption `:280-300`·settleOrReleaseForTerminal `:308-322`·terminalReleasedOf `:325-329`（released 三值报告）·completeInterviewAndConfirm `:339-392`（billing 分支 `:345-364`·per_session partial 拒 `:367-372`·CAS `:375-378`）·failInterviewAndRelease `:401-430`·abandonInterviewAndRelease `:471-519`·**availableUnits `:524-531`**（kind 形参只读余额函数·`:521-523` 注=「只读余额读函数·扣费路径零触」先例）·renewReservationLease `:534-542`·sweepExpiredReservations `:555-609`（非面试单 UPDATE `:560-564`·面试拆二选一 `:578-607`）·settleOutbox `:616-633`·reconcile `:637-641` |
| `packages/db/src/commerce/topic-charge.ts` | `fbfa27e5`（`fbfa27e5dfcf6f65363f85b1fad68aabe6f637a`·144 行） | P3 交付：InterviewBilling `:20-24`·interviewBillingOf `:27-41`·topicCountedUnits `:44-49`·closeTopic `:67-108`（模式闸 `:69-72`·FOR UPDATE `:75-78`·聚合 `:81-91`·判定 `:96-98`·**跳过落 waived 行 reason='skipped'（明细可见）`:98`**·落行 `:100-105`）·listTopicSettlementMismatches `:121-144`（**只读巡检形=本刀 db 只读函数形制母本**）·**头注「本文件零 fail-soft：结算面错误升级语义（与影子计量 fail-soft 相反）」`:15`** |
| `packages/db/src/model-op/question-usage-ledger.ts` | `94f170a7`（`94f170a7a9b08e025e148cf652271240a9e5476`·78 行） | P1 写入口：**cause 九值类型 `:16-19`**·usage_source 四值 `:22-23`·QuestionUsageLedgerEntry `:25-42`（invocationKey/interviewId/questionId/topicId/operationId 注释行锚）·recordUsage `:44` 区·头注「fail-soft 由调用方决定·归集写失败绝不阻断面试主链」`:4-6` |
| `packages/db/src/model-op/topic-shadow-meter.ts` | `091945a3`（`091945a38ce21416a849c9494abe2c62cc72fb8`·121 行） | P2 写面（writeTopicShadowMeter+SHADOW_METER_CAP=6）——**全仓读路径亲证仅 worker 写入侧**（rg `topic_shadow_meter` 全 .ts 恰 4 文件：本文件/adaptive-lifecycle/index.ts/bill2 proof·**apps/api 与 apps/web 零命中=影子表零 API 读面**） |
| `packages/db/src/commerce/payment.ts` | `364ca9ab`（`364ca9ab94c58110d66070bb9d09df3f42b4670`） | paid 桶 1 单位=1 场·365 天 `:99-101`·source_order_id 溯源注 `:97-98`（支付获得侧=明细「获得」类的桶入账面·kind 派生 `:96`） |
| `packages/db/src/index.ts` | `6f07a09e`（`6f07a09e24f3748906fb6e1109626624fe3b732`） | commerce 导出两块 `:72-84`·topic-charge 导出 `:88-89`·recordUsage 导出 `:224-225`·shadow 导出 `:229-230`·payment 导出 `:332-333`——本刀新只读函数导出 additive 位 |
| `apps/worker/src/adaptive-lifecycle.ts` | `245fa7c0`（`245fa7c032f5e7053da4e294d189dafd6fc1012`·608 行） | **writeShadowMeterSoft `:93-97`（`void asPrincipal(…).catch(...)`=fail-soft 吞错·影子零阻断）**·出题失败臂挂点 `:508`——影子面 fail-soft 实证（明细列表不复制此语义：读面错误不吞） |
| `apps/api/src/modules/interview/interview.service.ts` | `a98e52b7`（`a98e52b71db6dd726f6e332506cb058f6e456be`·889 行） | begin 双路 `:253-275`（applicationId 三元 `:256-258`·catch 402/409 分码 `:259-263`·#31 409 catch `:264-269`·非 reserved 分码 `:272-275`）——**本刀零触**（Ban 面·预留形/分码逐字零改） |
| `apps/api/src/platform/db.service.ts` | `94e2f9be`（`94e2f9beb39b0ff7260d7d09ae16040709cfb04`） | asPrincipal `:9-11`（RLS 语境事务）·**asGateway `:14-16`（「仅执行版本化固定 SECURITY DEFINER 函数；网关角色没有任何业务表权限」）——B 端 DEFINER 读通路的执行通道** |
| `packages/db/src/principal.ts` | `c31cbac0`（`c31cbac0890c49bf42555b136adf43b1b393e1e`·2123 行） | asPrincipal `SET LOCAL ROLE app_role`+set_config('app.principal_user') `:995-996`·**asGateway `:2114`** |
| `apps/api/src/platform/principal.guard.ts` | `0a3c4840`（`0a3c4840f763f9ff9ffdadf8e39f98007f5789f`·96 行） | `req.principal = tok.uid` `:84`（principal=用户 uid 字符串·本刀双端 API 鉴权入参形） |
| `apps/api/src/modules/commerce/commerce.controller.ts` | `6eaf29b7`（`6eaf29b73844658e8da99cc83ea80d531543746`） | **`@Get('entitlement')` `:63-67`**（PrincipalGuard 挂面先例·余额唯一读端点）·products `:15`·orders 面 `:44-50`·offline-orders `:57-61`·开票面 `:69` 区 |
| `apps/api/src/modules/commerce/commerce.service.ts` | `1fd94126`（`1fd94126fd1adb43c793f30c8a1e64e6b03a10e`） | **entitlement 方法 `:167-175`**（availableUnits 全桶+enterprise 双算·响应 `{availableUnits,enterpriseAvailableUnits}` 只增不改）·**APPROVED_RECRUITER_SQL `:53-55`**（0155 同谓词·app_role 内直调 gateway 门必 42501 `:48` 注·requireApprovedRecruiter 同谓词校验形）·enterpriseProducts 先例 `:66-69` |
| `packages/contracts/src/index.ts` | `7deeccfc`（`7deeccfc0b3d22e0c56e12aa7cead71327a3d7d`） | **Entitlement `:252`**（`{availableUnits, enterpriseAvailableUnits?}`）·P3 additive 注记 `:112`（topicsCounted/topicsCapped 先例形）·openapi operations 注册 `:1419-1420`（getEntitlement path `/commerce/entitlement`）——本刀响应 schema additive 位 |
| `apps/web/app/billing/page.tsx` | `6795697f`（`6795697f6386a812844051d4b5ae2c9d51c1ad8`） | C 端 billing 页现状=**静态「额度说明」**（预览封闭语义 metadata `:3-6`）——明细页 additive 落点（若裁决⑥行使） |
| `apps/web/app/recruiter/billing/page.tsx` | `b07ca6a2`（`b07ca6a26144dcc1c70cb6c489503bfc99cd452`） | B 端充值页（B271 片1）·**BalanceSection `:24-30`**（serverGet `/commerce/entitlement` 读 enterpriseAvailableUnits·**「读时快照非实时余额承诺」`:25-26` 原文=余额口径措辞先例**） |
| 蓝本/前刀卷（只读引用） | bill3 卷+bill1 卷+bill2 卷（主线 harness 在案） | 形制母本+Ban 领地链（bill3 §9-2 E6 姊妹刀承接明文） |

### 0.2 漂移登记（蓝本锚=rev1（对齐 tip `133acba6`）→ 落卷 tip `94b8519b`·结论零变·EXEC 重 pin 时同协议处理）

1. **主线 tip 零前移**：起草开工 tip=落卷 tip=`94b8519b`（`git log -1` 两次实测同值·BILL3 勘误 docs commit 后零新 commit）——EXEC 立项时若前移照本条协议重钉（排除 ai-docs 后为空则只更 hash）。
2. **README/LANDING-INDEX 零漂**：两件 blob `cd4c060f`/`0694ff22` 与 bill3 卷 §0.1 pin **同值亲证**——§3.13 `:201-204`/十三-2 `:63` 原位零漂（bill1→bill3 全程蓝本零再动·本卷直接承用）。
3. **commerce.ts 全幅重 pin（bill3 落码大漂·484→641 行 `f5d256df`→`855edfcd`）**：bill3 卷 §0.1 诸锚在本基线已如实重 pin（本卷 §0.1 即重 pin 结果）——要点：confirmConsumption `:178-227`/confirmConsumptionUnits `:235-275` 双函数并存·completeInterviewAndConfirm partial 抛错面收窄至 per_session 分支 `:367-372`·**新增 availableUnits `:524-531`（B271 片3 只读余额先例）**·sweep 拆分 `:578-607`——**全为读面参照·本刀零触**。
4. **编号链（本节承题·迁移号结论）**：主线 max=**0181**（ag19 `617f65be` 在账·ls 亲证恰 183 文件=LEDGER `:437`「applied=183」链深口径同值·0164 缺号+0152/0160 各两文件同前缀异词干=bill3 §9-2 E1 勘误口径）·**0182-0189 全空闲亲证**（ls+grep 零命中）·协调方排期面（LEDGER `:432-433`/`:417`）：**0182+0183=AG-39 拟占·0184=成本③ 拟占**——**本刀预期零迁移（纯读面）·若 §8 裁决项④（分页索引/物化）行使则占 0185 起**（届时 EXEC 立项对届时 tip 复核实占·零硬编码·勿添重号）。
5. **明细列表数据源「三账本」=蓝本设计推断名·三表现状亲证**（§0.1 三行）：entitlement_consumption（0001 既有）+topic_charge（0172 已落）+question_usage_ledger（0171 已落）——**蓝本 §3.13 只有原则句与 API 名（【推断】标注原文），无表级投影/状态映射/分页/余额快照/B 端通路细案=缺口**（本卷 §8 裁决项①-⑦ 即最小细案）。
6. **影子面读路径亲证（读真账不读影子的现场依据）**：`topic_shadow_meter` 全仓 .ts 恰 4 文件（写面/worker 钩子/db index 导出/bill2 proof）·**apps/api、apps/web 零命中**——影子表今天没有任何读端点；writeShadowMeterSoft（`245fa7c0:93-97`）fail-soft 吞错与 topic-charge.ts `:15` 结算面零 fail-soft 相对——**明细列表=第三种语义：只读面·读超时/读错诚实 5xx 不吞不伪空**（fail-soft 语义不适用于对外账面·裁决项③关联）。
7. **AG 失败语义轨六刀+计费 P1/P2/P3 全收官**（LEDGER `:410-422`）——本刀骑在 0170-0173+0180+八件函数全落主线之上·无在飞硬前置；30 树在飞面（§0.0）无一触本刀读面新增文件（db 新只读文件/api commerce additive/contracts additive——若裁决⑥行使则 web 两页 additive）·EXEC 并线重 pin 照协议（先落者为准·后到者 §0 重 pin）。

## §1 红事实（缺口链·机制链现 tip 重 pin·全 @`94b8519b` 实测·源=billing-redesign README §3.13/:63 裁决+§6.6/§7+bill3 §9-2 E6）

### 1.1 明细列表 API 全域不存在

`rg "ledger" apps/api/src apps/web/app` 四命中全非列表面（interview.service.ts 结算错码串/interview-report.ts/public-preview.ts/ocr-model-client.ts）——**`GET /billing/ledger`（C 端）·企业维度·`GET /billing/balance` 全部未落**（蓝本 §3.13 API 行自标【推断】·§6.6 接入点·§7 API 行 `:403`）；`GET /interviews/:id/charges` 同样零命中（§6.6 并列面·本刀范围外登记 §3-⑧）。**用户裁决「双端逐笔积分变动可见」（十三-2 `:63`）在 API 面零兑现**。

### 1.2 余额读面现状=只有汇总·无逐笔

唯一余额端点=`GET /commerce/entitlement`（controller `:63-67`→service `:167-175`→availableUnits `commerce.ts:524-531`·响应 `{availableUnits, enterpriseAvailableUnits}` B271 片3 双算）——只给当前可用合计；C 端 billing 页=静态「额度说明」（`6795697f:3-6`）·B 端 billing 页=充值+余额挂件（`b07ca6a2:24-30`·「读时快照非实时余额承诺」措辞先例 `:25-26`）——**逐笔变动（获得/消耗/预留/释放/退款）+来源标注（话题计费/模型调用/私有 RAG）在两个端零展示**。

### 1.3 逐笔真账三账本列形已备（数据源成立·读面可行）

①entitlement_consumption（`0001:109-122`）：created_at `:120`/status 四值 `:116-117`/units_requested+units_settled `:114-115`/service_type `:113`/payer_user_id（0157 `:26`）/uq(owner,key) `:121`——场/预留粒度逐笔（扣分=confirmed/partial_confirmed·退回=released·预留中=reserved）；②topic_charge（`0172:39-51`）：created_at `:48`/units/status 三值 `:45`/reason（skipped 明细可见 `:98` topic-charge）/rule_version `:47`——话题粒度逐笔（flag-on 后）；③question_usage_ledger（`0171:17-34`）：invocation_key/interview_id/question_id/topic_id/operation_id/cause 九值 `:24-25`/usage_source 四值 `:31`/created_at `:32`——**来源标注逐笔（模型调用面·话题计费/检索/报告归集）**。RLS 三表全 p_owner FORCE（`0001:152-163`/`0171:37-42`/`0172:54-59`）⇒ **C 端本人直读=RLS 内合法零特权**。

### 1.4 状态词汇映射缺口（用户口径 vs DB 现实·裁决项②）

用户裁决词「settled|reserved|released|failed」——entitlement_consumption 实际四值 **reserved/confirmed/partial_confirmed/released**（`0001:116-117`）·topic_charge 三值 counted/counted_capped/waived（`0172:45`）·question_usage_ledger.cause 含 generation_failed/unknown/admission_rejected（`0171:24-25`）——「settled」↔confirmed+partial_confirmed（units_settled 在账）·「failed」在 consumption 行无字面值（interview.status='failed' 联结面/usage cause 承载）——**映射表必须显式定死·Ban 执行席自由发挥**。

### 1.5 余额快照列不存在（裁决项③）

三账本均无 running-balance 列（`0001`/`0171`/`0172` 全表亲证零 balance 列）；settlement_ledger（`0001:139-147`）只入 confirmed 落账（uq `:146` exactly-once·非逐笔流）；多桶 FIFO（gift/trial/paid/enterprise·到期各异 `:100`）下「逐笔后余额」无唯一口径（可用额≠Σ账本差）——逐笔余额只能（a）读时窗口推导（零迁移·口径须裁决）或（b）补快照列/物化（迁移 0185）或（c）逐笔不给余额·分页头给当前 availableUnits 口径。

### 1.6 B 端企业维度跨 owner（裁决项①·机制承重）

0157 形状甲（`:6-14`）：企业 consumption 行 **owner=候选人**+payer=招聘方；RLS p_owner（`0001:152-163`）⇒ 招聘方会话直 SELECT 候选人行 **RLS 零行**——B 端列表唯一现成通路=受控 SECURITY DEFINER 读函数（0157 gateway_ 族先例 `:65-129`·asGateway「网关角色没有任何业务表权限」`db.service.ts:14-16`·`principal.ts:2114`）+**守卫=payer_user_id=current_setting('app.principal_user') 单跳自证（Ban 入参伪造·0157 :88-93 同源纪律）**；topic_charge/question_usage_ledger **无 payer 列**（`0172`/`0171` 亲证）⇒ B 端话题/归集粒度可见性=补列（迁移）vs DEFINER join vs 本刀只出 consumption 粒度——三选一裁决。

### 1.7 影子面边界（明细列表读真账·不读影子）

topic_shadow_meter（0180）=只算不扣观测表（头注 `:3-11` 零结算语义）·读路径全域零 API（§0.2-6）——**明细列表数据源恒=三真账·影子表零引用**；影子期运营观察（话题分布/封顶终值）与明细列表是两件事（LEDGER `:438` STILL OPEN 并列两项·非同一刀面）。

### 1.8 定价现状=per_session 缺省（列表对零话题行诚实）

billing_mode 缺省 per_session（`0172:24`）·begin 未写列（bill3 §9-2 E5「begin 写列随后续 flag-on 刀」）⇒ 现网 topic_charge 恒零行（隔离 proof 直写除外）——C 端逐笔列表今天能给的=场粒度（consumption）+归集粒度（0171·P1 起已有写入）·话题行只随 flag-on 出现——列表 schema 必须枚举预留（押题/诊断/深度研究=扩张包 §3.10-3.12 未落·枚举零映射行诚实空）。

## §1-修法（读面为主·最小细案六件·全部为 additive 读路径·零写面零结算语义变更）

- **① C 端 `GET /billing/ledger`（用户本人逐笔·RLS 直读）**：db 层新只读函数族（形制母本=availableUnits `:521-531` 只读形+listTopicSettlementMismatches `topic-charge.ts:121-144` 只读 SQL 形）——三真账 UNION 有界投影逐笔行：时间（created_at）/类型（来源映射=裁决项②枚举）/数额（±units：consumption=units_settled 或 units_requested（reserved）/topic_charge=units/usage 行=0 值审计行标注）/来源引用（interview_id/topic_id/invocation_key/idempotency_key 全列）/状态（映射后 settled|reserved|released|failed）/余额快照（口径=裁决项③）；挂点=commerce 模块 additive（新 controller 或并入 commerce.controller——裁决项⑦关联）·PrincipalGuard 同 `:63-67` 先例·asPrincipal RLS 语境直读（零 DEFINER·零特权）。
- **② B 端企业 `GET /billing/ledger`（企业维度·payer 自证）**：新受控 SECURITY DEFINER 只读函数 `gateway_billing_ledger_payer`（0157 gateway_ 形制逐字承袭：SECURITY DEFINER+SET search_path 逐字声明+具名拒绝+REVOKE/GRANT 显式最小 EXECUTE（0156 :318-326 纪律·0155 :114 REVOKE 先例））——守卫=**payer_user_id=current_setting('app.principal_user') 硬谓词**（单跳自证·Ban 任意 payer 入参巡读）·数据源=entitlement_consumption payer 非空行逐笔·经 asGateway 执行（`db.service.ts:14-16`）；API 挂 approved recruiter 门（requireApprovedRecruiter 同谓词 `commerce.service.ts:53-55` 先例）；topic/usage 粒度可见性=**裁决项①（推荐本刀只出 consumption 粒度=零迁移·补列/DEFINER join 并陈）**。
- **③ 余额面承接（v1 F11）**：两案并陈=（a）零新端点·以既有 `GET /commerce/entitlement`（`:63-67`/`:167-175`）为余额面（推荐·零码）vs（b）`GET /billing/balance` 薄别名（contracts Entitlement `:252` 响应形复用）——裁决项⑤。
- **④ 状态映射表+场景枚举（裁决项②落地物·写死进 db 只读函数 SQL/TS 常量·Ban 执行席改表）**：reserved→reserved·confirmed→settled·partial_confirmed→settled（附 settled 差额）·released→released（退回）·interview.status='failed' 联结→failed 标注；场景枚举初值=mock_interview（场）/topic（flag-on 话题行）/usage（模型调用归集行·cause 子标注）/payment（桶获得·payment.ts `:99-101` 溯源）——押题/诊断/OCR/主动追问/深度研究=扩张包枚举预留位（零映射行诚实空·Ban 伪造入账）。
- **⑤ 分页/时间窗/索引（裁决项④）**：推荐 keyset（created_at DESC, id cursor·三账本均有 created_at 亲证 `0001:120`/`0171:32`/`0172:48`）+默认窗 90 天/上限 365 天；既有 API 无分页先例（recruiter/jobs 亲证零 limit/cursor）=新形；**若 keyset 走索引裁决行使→恰一新迁移 0185（(owner_user_id,created_at DESC) 索引三表·0185 空闲亲证 §0.2-4）·若零索引则本刀恰零迁移**——物化视图（逐笔流+余额快照持久化）并陈不推荐（引入第二真相与 0173 触发器钉账面冲突风险·与「读真账」原则相悖）。
- **⑥ 契约与导出（additive 三位）**：packages/contracts 新增 LedgerEntry zod schema+openapi operations 注册（`:1419-1420` 位）·db index.ts 新只读函数导出（`:72-89` 区 additive）——零既有字段零既有端点改动（响应形状只增不改·Entitlement `:252` 先例措辞）；前端明细页与 CSV 导出=**范围外**（§3-⑥/⑦·若用户扩 scope 由裁决项⑥/⑦ 定界后姊妹刀或本刀 EXEC 前追加裁决）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof**（住地 `apps/worker/test/bill4-ledger-list.proof.ts`·门名 `bill4-ledger-list:prove`·沿 bill1/bill2/bill3 proof 形制+run-e2e-isolated 注册 additive 只增不清·**隔离库真迁移链 0001→0181 全链 applied（183 文件名词干·bill3 §9-2 E1 口径）**）臂草案：①**C 端 RLS 直读臂**：asPrincipal(owner) 读 ledger 函数——只回 owner 行（跨用户预置行零泄漏）·三账本 UNION 行形（时间/类型/数额/引用四元/状态映射）逐字段断言；②**映射臂**：confirmed→settled/released→released（退回）/interview failed 联结→failed 标注/topic_charge waived(reason=skipped)→0 值 waived 行·映射表逐值（裁决项②行使后按落值）；③**B 端 DEFINER 臂**：asGateway gateway_billing_ledger_payer——payer=principal 行可见·payer≠principal 预置行零泄漏·入参伪造 payer 被硬谓词无视（Ban 巡读正钉）；④**影子零引用臂**：ledger 函数 SQL 文本 rg 零 `topic_shadow_meter` 引用+真链场影子行存在而 ledger 响应不含影子行；⑤**分页稳定臂**（若裁决④行使）：keyset 翻页无重无漏·窗口外零行；⑥**零行为变更负臂**：本刀落码后 reserve/confirm/release/closeTopic/触发器行为原值（bill1 27+bill2 44+bill3 43 回归背书·本刀不触写面）。
2. **既有门回归（原值）**：bill1-topic-fields:prove **27 臂**+bill2-shadow-meter:prove **44 臂**+bill3-settlement:prove **43 断言**+interview:prove 57+migrate:prove+drift:prove 全 EXIT=0 原值。
3. **迁移纪律**：零迁移裁决⇒恰零新迁移文件+历史 0001-0181 零字节（git diff 亲证）；索引裁决⇒恰一新文件 0185（届时 tip 实占复核 §0.2-4·勿添重号）+migrate:prove EXIT=0。
4. **typecheck+docs**：turbo typecheck --force **3/3** EXIT=0+根 pnpm typecheck EXIT=0+markers 五类亲跑零命中+docs:check EXIT=0（卷内全仓内相对径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **结算写面零触**：reserveEntitlement/confirmConsumption(Units)/releaseConsumption/closeTopic/complete/fail/abandon/sweep/settleOrReleaseForTerminal（`commerce.ts` 全函数族）+0172/0173+topic-charge.ts——bill3 交付面零字节零再触（本刀纯读·读函数只 SELECT）。
2. **begin 双路零触**（interview.service.ts `:253-275` 预留形/1.00 单位/402/409/#31 分码逐字·bill3 §5 Ban 沿承）。
3. **影子计量面零触**：0180/topic-shadow-meter.ts/writeShadowMeterSoft（`:93-97`）零改零拆·影子期 2 周观察+封顶 6 终值复核=运营面（LEDGER `:438` 另两项）——本刀只保证「不读影子」·不动影子。
4. **扩张包零触**（押题/诊断/OCR 积分制+主动追问入口+深度研究 premium §3.10-3.12 未落——明细枚举预留零映射·Ban 伪造场景行）+P4 B 端残面（application 幂等 `recruiter.ts` 区）零触。
5. **F15/usage 口径/模型调用面/0046 零触**（usage 列照 0171 归集原样读·零再折叠）。
6. **前端明细页零触**（`apps/web/app/billing/`+`recruiter/billing/` 页面改动=裁决项⑥定界后姊妹刀或扩 scope 追加裁决·本刀 API 读面为止）。
7. **`GET /interviews/:id/charges`（蓝本 §6.6 并列接入面）零触**——场内话题明细接口另刀（本刀=跨场逐笔列表·非单场话题明细）。
8. **成本侧治理账本零触**（0033/0034/0036/0083 ai_cost 族+ai_model_invocation/ai_invocation_trace 直读=成本对账域·本刀经 0171 归集表读·Ban 越账本）。
9. **共享 SSOT 只读零改**（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign README+LANDING-INDEX——本刀不自建 SSOT 行·LEDGER `:438` 行翻面权归协调方）·est live=0（§6）。

## §4 依赖

**硬前置全兑现·可立即施工**：①P1（0170 三列+0171 归集表+recordUsage）已落主线 `a1241e90`（LEDGER `:420`）——归集行=来源标注数据源；②P2（0180 影子+fail-soft 钩子）已落 `f3968440`（`:421`）——影子边界本卷亲证（§1.7）；③P3（0172/0173+八件函数+topic-charge.ts）已落 `fee425cd`（`:422`/`:437`）——topic_charge=数据源之二·E6 明文「姊妹刀读 topic_charge 直查零事件依赖」；④B271 企业桶/路由/双算（0156/0157/片3 entitlement 双算 `:167-175`）+0155 审核门= B 端通路全部现成先例。**编号链**：0182/0183=AG-39 拟占、0184=成本③ 拟占（LEDGER `:432`/`:417` 协调方排期面）·本刀 0185 起（若索引裁决行使）·预期零迁移（§0.2-4）。**下游**：前端明细页（裁决⑥）→扩张包场景行→灰度运营（§7 步⑥）。**软交叠如实登记**：30 在飞树（§0.0）无一登记本刀新增读面文件——EXEC 并线重 pin 照协议（先落者为准·后到者 §0 重 pin）。

## §5 Ban 列表 + pins（沿 bill1/bill2/bill3 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign README+LANDING-INDEX——行与统计只读引用·本刀不自建 SSOT 行·行翻面权归协调方）；**Ban 写面出手**（commerce 全函数族/0172/0173/topic-charge.ts 零字节·本刀只加只读函数·Ban 任何 INSERT/UPDATE/DELETE 挂读端点）；**Ban 历史迁移字节改**（0001-0181 零字节+`sql/` 镜像面零改·新迁移铁律·勿添重号·0182-0184 他刀拟占勿抢号）；**Ban begin 双路面改**（interview.service.ts `:253-275` 逐字零触）；**Ban 无 payer 守卫的 B 端跨 owner 读**（gateway_billing_ledger_payer 必须 payer=principal 硬谓词单跳自证·Ban 入参巡读/Ban 全表 DEFINER 读/Ban 绕过 asGateway 直连）；**Ban 读影子表作明细数据源**（topic_shadow_meter 零引用·§1.7）；**Ban 明细读面 fail-soft 化**（读错诚实 5xx·Ban 吞错伪空列表——影子 :93-97 fail-soft 形不适用于对外账面）；**Ban 状态映射自由发挥**（映射表=裁决项②行使落值写死·Ban 执行席临场造词）；**Ban 扩张包场景伪造入账**（未落场景枚举零映射行·Ban 假数据）；**Ban 余额口径静默混用**（availableUnits 汇总口径与逐笔推导口径不同形·响应字段必须标注口径来源=裁决项③落值）；**Ban 影子期观察面/封顶终值出手**（LEDGER `:438` 另两项）；**Ban 新 env 闸**；Ban 触其他工作树（aga~agf/bill1-bill3/cost3 等在飞机）；Ban 伪造已读/已验来源；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**门预申明（EXEC 必跑·原样可复制）**：`bill4-ledger-list:prove`（新）·`bill1-topic-fields:prove`·`bill2-shadow-meter:prove`·`bill3-settlement:prove`·`interview:prove`·`migrate:prove`·`drift:prove`·`turbo typecheck --force`·`pnpm typecheck`·markers 五类·`node scripts/ai-docs/check-docs.mjs`——全 EXIT=0（§2 断言基面）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全隔离库真迁移链+假体·零模型外呼·零真实扣费）

## §6 est live=0

本刀零模型真实外呼：新 proof=隔离库真迁移链（run-e2e-isolated 本地临时 PostgreSQL·零生产 DSN/零生产 Key/零凭据落盘）+假体注入；typecheck/migrate:prove/drift:prove/docs:check=本地门——纯读 API 刀·全门隔离容器零真实扣费零真实外呼·零生产操作·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/bill4-ledger-list-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 bill1/bill2/bill3 receipts 形留执行席收据·五类标记词不复抄卷内——避免自匹配·沿 bill3 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 用户裁决口径（原句录入）与待裁决项

### 8.1 用户裁决口径原句（⛔ 不得更改）

- **LANDING-INDEX 十三-2 `:63`（十三节裁决②·逐字）**：「**积分明细列表（必做·升 P1 面）**：用户端与企业端各一——逐笔可见：时间/场景（面试·话题·押题·诊断·深度研究等）/扣分/退回/余额·数据源=entitlement_consumption+topic_charge+question_usage_ledger 三账本·API（GET /billing/ledger+企业维度）+前端明细页·沿蓝本 §3.4 透明度与 v1 F11（GET /billing/balance）吸收。」
- **README §3.13 `:201-204`（rev1 落卷·逐字要点）**：「用户端与企业端**各一**，逐笔可见：时间 / 场景（面试·话题·押题·诊断·深度研究等）/ 扣分 / 退回 / 余额。数据源=三账本……API【推断】：`GET /billing/ledger`（分页·用户本人）+ 企业维度（按 `payer_user_id` 过滤·0157 已落列）；前端明细页；吸收 v1 F11 的余额展示（`GET /billing/balance`）。透明度承诺（§3.4）的账面落点。」
- **README §0 `:27`（扩权原则）**：「凡是调用大模型的面都必须有合理的处理」——零暗面（§3.14 覆盖表·明细列表为扩张包 §3.10–§3.13 之一·升 P1）。
- **本刀派单口径（协调方·逐字）**：逐笔=时间/类型/数额/余额快照/来源引用 interview_id/topic_id/invocation key/幂等键/状态 settled|reserved|released|failed——读面为主，若需补清单物化视图/索引列为裁决项；明细列表读真账不读影子（0180 fail-soft）。

### 8.2 蓝本缺口与本刀最小细案的待裁决项（七项·推荐已并陈）

蓝本 §3.13 仅原则句+API 名（自标【推断】）——以下细案缺口逐项交双审/用户裁决·EXEC 按行使落值施工·**未行使前零施工**：
①**B 端通路与粒度**（推荐=B 端本刀只出 entitlement_consumption 粒度·gateway_billing_ledger_payer payer=principal 硬谓词·零迁移 vs 补 payer_user_id 列至 topic_charge/question_usage_ledger（0185 迁移+写面改动=越 bill3 交付面须另刀）vs DEFINER join job_application（join 链长·筛选面窄）——三选一）；②**状态映射表**（推荐=reserved→reserved/confirmed→settled/partial_confirmed→settled/released→released/interview.status='failed' 联结→failed·topic_charge 三值映射为 0 值子行 vs 仅四主值映射话题行不进列表）；③**余额快照口径**（推荐=逐笔读时窗口推导+响应标注口径来源+「读时快照非实时」承诺沿 `b07ca6a2:25-26` 措辞·零迁移 vs 补 balance_snapshot 列（0185·写面改动越界）vs 逐笔不给余额仅分页头 availableUnits——三选一）；④**分页/时间窗/索引**（推荐=keyset（created_at DESC,id）+默认窗 90 天/上限 365+索引裁决行使则恰 0185 三表 (owner_user_id,created_at DESC)·0185 空闲亲证 vs offset 分页 vs 零索引裸查询·物化视图并陈不推荐（第二真相+与「读真账」相悖））；⑤**余额端点**（推荐=零新端点·以既有 GET /commerce/entitlement 为余额面 vs GET /billing/balance 薄别名）；⑥**前端明细页定界**（推荐=本刀仅 API·前端页姊妹刀 vs 本刀 additive 两页（C 端 billing 页+recruiter/billing 页））；⑦**导出与否**（推荐=本刀不做 CSV 导出·读面 API 即可·导出后刀 vs 本刀 additive 导出端点）。

## §9 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（billing-redesign README §3.13+INDEX 十三-2+LEDGER `:438` 承接行系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1-修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 七条漂移登记如实在案·主线 tip 再前移照 §0.2-1 协议重钉；§8.2 七裁决项须全数行使落值后方可施工·未行使项保持零施工）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件（四类·命中即停上报）**：①**现场漂移**——届时 tip 对 §0 锚漂移（尤其 commerce.ts/interview.service.ts/topic-charge.ts 行锚·bill3 后大漂先例 §0.2-3）照协议重 pin·若结论变化（如三账本列形变动）即停上报；②**机制不满足**——若裁决行使后的读面与 RLS/DEFINER/GRANT 机制冲突（如 gateway 只读函数在 FORCE RLS 下权限面与 0157 写面先例不同形·复刻遇 42501/策略炸）即停上报·Ban 就地放宽权限；③**越界需要**——施工中发现必须触碰结算写面/影子面/begin 双路/扩张包/前端页/0173 语义才能达成 §8 裁决落值·即停上报另裁·Ban 顺手扩面；④**验收红不可修**——既有门（bill1 27/bill2 44/bill3 43/interview 57/migrate/drift/typecheck）回归红且 delta 非本刀改动可归因·即停上报·Ban retry-to-green 掩盖。

---

*BILL4-LEDGER-LIST REQUEST · 2026-10-13 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`94b8519b`（主线 tip·git log -1 实测 2026-10-13 14:18:20 +0800·开工=落卷零前移）· 分支 `line/bill4-ledger-list` · 工作树 `meetwise-bill4`（git worktree add 本起草席立·建前 worktree list 28 树+branch 双查+rg 零命中三查不存在·落卷复测 30 树无第二同名）· 立项出处=billing-redesign README rev1（blob `cd4c060f`·§3.13 `:201-204` 裁决段/§3.4 `:144-147`/§0 `:27` 扩权/§6.6 `:383-387`/§7 `:391-413`/§11 `:504`）+LANDING-INDEX（blob `0694ff22`·十三-2 `:63` 用户裁决原句/七 `:41-47`/十二 `:50-57`/十四 `:66-70`）+LEDGER（blob `61e66dd3`·`:438` STILL OPEN 明细列表承接行/`:404-434` 刀位图/:432-433 排期=0182/0183 AG-39+0184 成本③ 拟占出处）+bill3 卷 §9-2 E6 姊妹刀承接明文 · 防重三查过 · §0 blob 锚表 28 行 ls-tree 亲算（三账本三迁移 0171/0172/0001+0173 触发器+0180 影子+0156/0157 企业面+0181 max 号+commerce.ts 855edfcd 641 行全幅重 pin+topic-charge/question-usage-ledger 写入口+api commerce 面双件+db.service/principal.ts/principal.guard 通道面+contracts+web 两页）+§0.2 漂移七条如实登记（tip 零前移/蓝本两件零漂/commerce 大漂重 pin/编号链 0181 max·0182+ 空闲·本刀预期零迁移·索引裁决则 0185/三账本=蓝本推断名现状亲证/影子读路径零 API 亲证/前置全收官）· 红事实八链（API 全域不存在/余额只有汇总/三账本列形已备 RLS 内合法/状态词汇映射缺口/余额快照列不存在/B 端跨 owner RLS 零行 DEFINER 先例在/影子面边界/per_session 缺省零话题行诚实）· 修法六件（C 端 GET /billing/ledger RLS 直读/B 端 gateway_billing_ledger_payer payer 自证/余额面承接两案/状态映射表写死/分页时间窗索引裁决/契约导出 additive 三位）· 断言候选四条（隔离库六臂新 proof 含 C 端 RLS/B 端 DEFINER/映射/影子零引用/分页/零行为变更负臂+既有门 27+44+43+57 原值/迁移纪律/typecheck docs）· §3 范围外九条（结算写面/begin/影子/扩张包 P4/F15/前端页/interviews charges/成本族/SSOT）· §4 依赖=P1+P2+P3+B271 全兑现·0185 起顺延 · est live=0 · pins 十一值照抄 · 门预申明十一门 · markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · **迁移号结论=预期零迁移（纯读面）；若 §8-④ 索引/物化裁决行使则占 0185 起（0181 主线 max 在账·0182+0183=AG-39 拟占·0184=成本③ 拟占·现全空闲亲证）** · **STOP=draft:awaiting_pre_exec_dual（待 pre-exec 双审两外席·alone≠dual·Ban self-approve·Dual PASS ≠ 开工）***
