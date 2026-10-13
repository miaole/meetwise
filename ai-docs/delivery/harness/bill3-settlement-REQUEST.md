# BILL3-SETTLEMENT REQUEST（billing 战役 P3 结算刀 · 0172 topic_charge 话题计费表+interview 计费列 + 0173 tf_ 触发器改写 + closeTopic/confirmConsumptionUnits/completeInterviewAndConfirm/abandon/sweep 改造 + #31 报错 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。

**席位**：billing 战役 P3 起草席（billing rev 定稿双审 BOTH PASS+P1 `a1241e90`/P2 `f3968440` 两 nail 已落主线后实施刀·LEDGER :420 计费行 STILL OPEN「0172-0173 结算刀 P3」承接行·协调方常设 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `aeaf4141`（`aeaf4141ec9566babe4fa0724290c7153f6ed362`·主线 tip·`git log -1` 实测·开工=落卷零前移·BILL2 SSOT 行翻面 commit·零码面）·分支 `line/bill3-settlement`·工作树 `meetwise-bill3`（`git worktree add ../meetwise-bill3 -b line/bill3-settlement` 本起草席已立·HEAD 落 `aeaf4141` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：蓝本两层+BILL1/BILL2 承接链全部精读引用——①`ai-docs/delivery/billing-redesign/README.md`（blob `cd4c060f`·rev1 定稿 532 行）**§6.3 0172 `:310-336`**（ALTER interview 计费三列+ck_interview_cap+CREATE TABLE topic_charge SQL 草案逐行+两更正：cap 非空 CHECK 承重（LEAST 忽略 NULL 静默失效）/counted_capped·waived 恒 0 分）+ **§6.4 0173 `:338-371`**（tf_ 触发器改写草案全文：per_session 分支 0144 原逻辑逐字保留+per_topic_capped 分支方案②比较式+外层 enforce/触发器零改+GRANT EXECUTE 语义保留）+ **§6.5 函数表 `:373-381`**（closeTopic FOR UPDATE 串行化/confirmConsumptionUnits 绝对值部分结算/completeInterviewAndConfirm 按 r2 式允许 partial/abandon·sweep 拆二选一/reserveEntitlement #31 报错/recordUsage=P1 已落）+ **§4 异常分支表 `:233-253` 16 数据行**+ §3.2 计什么 `:127-137`/§3.3 封顶与单位 `:139-142`/§5 示例与舍入同式 `:256-268`/§6.6 接入点 `:383-387`/§7 `:391-413`（P3 结算·触发器·放弃·sweep·出题失败收口 7-10 人日+步④「0173 上线、巡检告警」）；②同目录 `LANDING-INDEX.md`（blob `0694ff22`）：**第七节 `:41-47`**（迁移号 0170-0173 定谳·「0172 topic_charge+interview 计费列/0173 tf_ 触发器改写」逐件在案）+ **第十二节四裁决 `:50-57`**（①话题 1 分+封顶 6 ②方案②按比例 `r2(requested×LEAST(Σ,cap)/cap)`·零存量换算 ③异常收口全建议包 ④扩张包另段）+ 十三 `:60-63`（topic_charge=明细三账本之二）+ 十四 `:66-70`；③`ai-docs/delivery/harness/product-campaign-LEDGER.md` **:420**（P1/P2 双 nail 收官行·STILL OPEN 0172-0173 结算刀 P3）+ `execution-master-checklist.md` Line BILL1/BILL2 nail 段（STILL OPEN 同承接）。

## §0 现状锚（起草席亲读·base `aeaf4141`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list` 建前 22 树实测（主仓+5e/aga~agf/authz/bill1/bill2/billrev/blite/cost1/cost2/e2sc/i263/i6/line-entpay/parity2/qsec/ttlwire）——**无 bill3 树**（bill1/bill2 系已 nail 姊妹刀树·billrev=蓝本 rev 席树·零交叠）。
- `git branch -a --list "*bill3*"` 建前空输出——**无同名分支**。
- `rg -l "bill3" ai-docs/` **零命中**（harness 全卷无同名刀卷；billing-redesign 两件+bill1/bill2 两卷系蓝本/前刀登记卷非本卷撞名）。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`aeaf4141`）

| 文件 | blob（8 hex·括号全 40 hex） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/billing-redesign/README.md` | `cd4c060f`（`cd4c060f875d5a69c604f934779128278aa8d1ec`） | rev1 定稿 532 行·§4 `:233-253`/§5 `:256-268`/§6.3 `:310-336`/§6.4 `:338-371`/§6.5 `:373-381`/§6.6 `:383-387`/§7 `:391-413`（见立项出处行锚） |
| `ai-docs/delivery/billing-redesign/LANDING-INDEX.md` | `0694ff22`（`0694ff22aab6fa35932d587018c00abe13ecbb5c`） | 七 `:41-47`/十二 `:50-57`/十三 `:60-63`/十四 `:66-70` |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（`d68f8dd0e61682603e9cd8fc1c1e8aaaf4965b79`） | entitlement_consumption `:109-123`（units_settled `:115`·status 四值 CHECK `:116-117`·uq(owner,key) `:121`）·settlement_ledger `:138` 区 |
| `packages/db/migrations/0020_commerce_terminal_integrity.sql` | `244acb80`（`244acb808736a82d04ba89cf607ff58b757acd80`） | enforce 原体 `:26-60`·**触发器 `:62-64`**（BEFORE INSERT OR UPDATE OF status ON interview·本刀零改） |
| `packages/db/migrations/0046_application_assessment_recovery.sql` | `c41a9466`（`c41a946638ae0ec22675f7c4186e2a9f2f6542f1`） | **enforce failed 纳入 `:144-173`**（0144 §2.6 注「逐字」底本）·**scoring 完整性触发器 `:118-135`**（answer_unscored 在场禁 completed·RAISE `:130-131`·本刀零放松面） |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | `29afdf46`（`29afdf465985cd7f09e96ead908ce671b2042776`） | **tf_ 现行体 `:365-395`**（SELECT 单列 INTO `:378-381`·completed↔confirmed RAISE `:386-389`·abandoned/failed↔released RAISE `:390-393`·§2.6 注 GAP-COMM-PARTIAL-PAIR `:363-364`）·enforce 外层 `:397-403`·**GRANT EXECUTE tf_ 行 `:411`**（CREATE OR REPLACE 不动 ACL 亲证） |
| `packages/db/migrations/0157_billing_payer_route.sql` | `ae098d61`（`ae098d61b419d0819199b20769c8d0f4a3d3616a`） | payer 路由（B 端企业桶·B 端部分结算同经 gateway_entpay_apply_allocation——本刀结算面零新触 DEFINER 面） |
| `packages/db/migrations/0170_interview_question_topic_fields.sql` | `8d57dba1`（`8d57dba1798f861870f6f429547a033d66c26024`） | P1 已落：topic_id/ask_mode/clarify_cause 三列+ix_iq_topic partial `:33-34`——closeTopic 聚合查询源 |
| `packages/db/migrations/0171_question_usage_ledger.sql` | `0948ef93`（`0948ef93c6ca7b2d91f056cbd2092bb6bfd3592a`） | P1 已落：**RLS+只授 SELECT,INSERT 形制范本 `:36-42`**（GRANT :36·ENABLE/FORCE/p_owner :37-42）——本刀 topic_charge 行权形状母本 |
| `packages/db/migrations/0180_topic_shadow_meter.sql` | `3abb71b2`（`3abb71b227b1c6f8c2c34bf87b127ee8a2a6e19a`） | P2 已落：影子表 mirror §6.3 降结算语义（status 五值观测枚举 :37 区·cap_value=6/cap_hit :47 区·PK(owner,interview,idem_key)）——头注自注「0172/0173 留 P3 结算刀零触零预写」 |
| `packages/db/src/commerce/commerce.ts` | `f5d256df`（`f5d256df4643283bdbb89474f50991d9cf51d7b9`·484 行亲读） | r2 `:34`·reserveEntitlement `:42-94`（**幂等闸 #31 `:54-62`**·insufficient `:87-90`）·reserveEntitlementForApplication `:100-142`（JS 面归一化 `:119-127`）·applyAllocationDelta `:146-158`·confirmConsumption `:167-216`（ratio 闸 `:171`·终态幂等 `:180-181`·**settled=r2(requested×ratio) `:183`**·尾桶吸收差额 `:185-194`·finalStatus `:204`·outbox `:212-214`）·releaseConsumption `:221-241`（already_confirmed `:229`）·**completeInterviewAndConfirm `:251-277`（ratio=1 `:253`·partial 抛错 `:256-257`·CAS `:260-263`）**·failInterviewAndRelease `:286-312`·abandonInterviewAndRelease `:353-399`（release 先行 `:355`·空壳 NOT EXISTS `:362-369`·CAS `:383-386`）·renewReservationLease `:414-422`·commerce 分层注 `:424-425`·**sweepExpiredReservations `:432-452`（单 UPDATE 直置 released `:434-437`·行锁+lease 复核同语句 `:428-431`）**·settleOutbox `:459-476`·reconcile `:480-484`·头注 #21 勘误 `:9`/⑤不静默 `:10` |
| `packages/db/src/commerce/payment.ts` | `364ca9ab`（`364ca9abf94c58110d66070bb9d09df3f42b4670`） | paid 桶 1 单位=1 场·365 天 `:97-101`（裁决②零换算基座） |
| `packages/db/src/recruiting/recruiter.ts` | `c3c94bcd`（`c3c94bcdfb718db9606ec0ab996913dcbe637c31`） | held 守卫 `:553-565` 区·重开再预留 `:592-607` 区（**P4 残面·范围外登记**） |
| `packages/db/src/model-op/question-usage-ledger.ts` | `94f170a7`（`94f170a7ea9b08e025e148cf652271240a9e5476`） | recordUsage `:47`（P1 写入口·类型化入参+SQL 单语句+类型化返回=closeTopic db 侧形制母本） |
| `packages/db/src/model-op/topic-shadow-meter.ts` | `091945a3`（`091945a3a8ce21416a849c9494abe2c62cc72fb8`） | writeTopicShadowMeter 聚合 SQL+SHADOW_METER_CAP=6 `:37`（P2 面·零触·聚合判据形参照） |
| `packages/db/src/index.ts` | `71701779`（`71701779ea8e1a4716c86ae3c903fc37e001cd00`） | commerce 导出 `:72-84`·P1/P2 导出 `:219-225`（closeTopic/confirmConsumptionUnits 导出位） |
| `apps/worker/src/adaptive-lifecycle.ts` | `a0899cba`（`a0899cbac395ac57a29ff4bc9572c975a8ed14a9`·576 行亲读） | generationFailureOf `:27`·writeShadowMeterSoft `:85-97`（P2 钩子零触）·submitAdaptiveAnswerImpl `:329`·出题失败臂 `:479-488`（P2 钩子 `:482`）·**done 块收尾区 `:490-557`**·eligible 计数 `:499-518`·AG-F 注记 `:519-523`·**三分支 `:524-556`**（完成臂 `:524-526`/零有效分臂 `:527-547`/fail+release 臂 `:548-556`）·收尾外围钩子 `:561-563` |
| `apps/worker/src/commerce-reconcile.ts` | `1eef9b95`（`1eef9b9554b5d4af82f12ced15bc3e0f4c97fe6c`） | 走人语义头注 `:8`/`:39`·reconcileOwner `:34-91`·围栏先检 `:48-56`·B 端 failed 臂 `:57-68`·C 端 abandon 臂 `:69-85` |
| `apps/api/src/modules/interview/interview.service.ts` | `a58dcc27`（`a58dcc27c7915a90f3fc3ea6a8bf3b0083f6ffcf`） | **begin 双路 `:253-268`**（预留三元 `:256-258`·catch 分码 402/409 `:259-264`·非 reserved 分码 `:265-268`·蓝本锚零漂） |
| `apps/worker/src/interview-consumer.ts` | `ee3a3028`（`ee3a3028db0db857e855322823389cba17b2d60c`） | renewReservationLease 心跳两调用点 `:357`+`:366`（租约只在 worker 处理时续约·走人/崩溃判据面） |
| `apps/worker/src/adaptive-interview-service.ts` | `7d7a0873`（`7d7a087348cd7f9d22510c2c2d5dcb9adec820f1`） | P1 已落：assess clarifyCause 透传（quote_repair_exhausted→quote_unverifiable）——closeTopic 计费判据的「系统出错 0 分」输入面 |
| `packages/contracts/src/index.ts` | `4f489d31`（`4f489d31fada82d0d0d20e131c2b6d3f23308a62`） | P3 净新增面（蓝本 §6.6/§7 API 行本列）：topicsCounted/topicsCapped 事件 additive 可选字段本刀新增位——rev 勘误删旧稿虚构现状锚（grep packages/contracts/ 事件字段零命中亲证） |
| `apps/worker/test/bill1-topic-fields.proof.ts` | `e5212b46`（`e5212b46f599db3ee08facfdac91ad2d508c20ee`） | 隔离库真迁移链 proof 形制+五臂结构（本刀 proof 母本） |
| `apps/worker/test/bill2-shadow-meter.proof.ts` | `4f540391`（`4f540391d8628b187118d213b7ac691b76905632`） | 44 臂 proof+零扣费负臂形制（本刀反转引用：per_session 负臂=其正向重申） |
| `apps/worker/test/interview.proof.ts` | `645ec783`（`645ec7839f2a1aed9ba7efe09d4f36713bbc4665`） | 头注 `:1-5`（run-e2e-isolated 完整版本化迁移+MemorySaver+scriptedModelClient） |
| `packages/db/test/migrate.proof.ts` | `d3162013`（`d31620137f479ac8de30691c2dc3ef1e1df2d53c`） | migrate:prove 本体（迁移面改动必跑先例） |
| `scripts/run-e2e-isolated.mjs` | `9dd9e84e`（`9dd9e84ec4b50e68dce6e1f22df35d2d9dcb2f12`） | bill1/bill2 四点注册先例 `:705-722`/`:1930`/`:2167-2170`/`:2850` 巨行（只增不清） |
| 根 `package.json` | `2d5eda54`（`2d5eda54797791c2fa96bd3979336f876cd3862e`） | docs:check `:8`·bill1/bill2 门名 `:269-272`（新门名注册位） |
| bill1/bill2 REQUEST（只读引用） | bill1 `fd66331c` / bill2 `5924d5c3` | 本卷形制母本+Ban 领地移交链 |

### 0.2 漂移登记（蓝本锚=rev1 `1a332e5e`（对齐 tip `133acba6`）→ 落卷 tip `aeaf4141`·结论零变·EXEC 重 pin 时同协议处理）

1. **主线 tip 零前移**：起草开工 tip=落卷 tip=`aeaf4141`（`git log -1` 两次实测同值·BILL2 SSOT 行翻面后零新 commit）——EXEC 立项时若前移照本条协议重钉（排除 ai-docs 后为空则只更 hash）。
2. **收尾区行锚漂移 48 行（结论零变）**：蓝本 rev1 载 `adaptive-lifecycle.ts:442-488` → 现位 **`:490-557`**——P1 两 persist 接线+P2 影子钩子（`:85-97` 定义/`:479-488` 出题失败臂/`:561-563` 收尾外围）插入致后移·三分支谓词语义零变亲读（完成臂/零有效分臂/fail 臂）·AG-F 注记现位 `:519-523`。本卷 §1/修法按现位引用。
3. **commerce 锚微漂（±1 内）**：completeInterviewAndConfirm partial 抛错 rev1 载 `:251-257` → 现抛错行 `:256-257`（函数体 `:251-277`）；sweep rev1 表载 `:432-500` 系含 reconcile 全区 → 现拆分 sweep 本体 `:432-452`+reconcile `:480-484`；**#31 `:54-62` 与 begin 双路 `:256-268` 零漂亲证**（两承重锚原位）。
4. **编号链（本节承题）**：0172/0173 留 P3 定谳三处在案（INDEX 七 `:43`·bill1 §9-2 E2·bill2 0180 迁移头注）——主线 max=**0180**（P2 占）·**0181+ 全空闲亲证**（ls+主线 ls-tree 双查零占）·本刀恰占 **0172+0173** 零新增号诉求·0184 起顺延勿添重号。
5. **P2 影子枚举与 §6.3 结算枚举差异如实登记**：影子面 status 五值（counted/counted_capped/waived/skipped/failed_release——照实现行收尾语义）vs 蓝本 §6.3 topic_charge 三值（counted/counted_capped/waived）——影子面 skipped/failed_release 两观测值在结算面的落行形状（waived+reason 或不落行）=**裁决项②**。
6. **AG 失败语义轨六刀全收官**（蓝本 rev1 时「刀 E 批/刀 F 在飞」表述过时·刀 D `ccf3e7e7`/刀 F `b29d861d` 等已并主线）——INDEX 四节「billing P3 骑在稳定失败语义之上」兑现·收尾三分支谓词零位移（`:519-523` 亲证）·本刀零失败语义再分类；续约锚漂移：rev1 载 interview-consumer.ts `:300,309` → 现 **`:357`+`:366`**（两调用点·结论零变）。
7. **蓝本 §6.4 `r2(…)` 系应用侧记法**：SQL 触发器面须以 `round(x::numeric,2)` 同式实现（PG numeric round 与 `Math.round(n×100)/100` 正数域同为 half-away-from-zero）——舍入同式断言入门（§2-①③·蓝本 §5「应用侧与触发器必须用同一公式否则误报」原文的 SQL 落地面）。

## §1 红事实（机制链现 tip 重 pin·全 @`aeaf4141` 实测·源=billing-redesign README §1.1/§4/§6.3-§6.5+issues #229/#31）

### 1.1 结算缺位链：topic_charge 不存在·按场固定 1 分·无话题粒度

逐行链：①**topic_charge 表全场不存在**（migrations 0001-0180 全卷无此表亲证·影子表 0180 头注自注「0172/0173 留 P3 结算刀零触零预写」）——按话题计费（裁决①）无落点；②**按场固定 1 分**：begin 双路 `reserveEntitlement(…, 'mock_interview', 1.0)`（interview.service.ts `:256-258`）·1 单位=1 场（payment.ts `:97-101`）；③**无话题粒度结算**：confirmConsumption 只认 ratio（`:171`·settled=r2(requested×ratio) `:183`）·调用侧恒 ratio=1（completeInterviewAndConfirm `:253`）——P1 已落 topic_id/ask_mode/clarify_cause（0170）与影子计量（0180）后，结算面仍是全有全无或全额，三列输入无消费者。

### 1.2 #229 完成即全额确认链：系统原因提前结束照样全额扣

①出题失败 failClosed 整场结束（generate-question 臂→adaptive-lifecycle 出题失败臂 `:479-488`）·收尾按完成收口全额确认；②零有效分臂同样 `completeInterviewAndConfirm` 全额扣（`:527-531`）；③混合 unscored 走 fail+release 全退（`:548-556`）——**做过的话题与零做过的场同价**；④completeInterviewAndConfirm 固定 ratio=1（`:253`）·遇 partial_confirmed 直接抛错 `interview_settlement_not_fully_confirmed`（`:256-257`）——比例结算在今天结构性不可达（蓝本 §7 依赖行 #229「完成即全额确认」原文）。裁决③已裁：系统原因提前结束=已完成话题照收·该话题 0 分·收尾改「按话题部分结算」。

### 1.3 #31 同键不同 units 静默吞链

reserveEntitlement 幂等闸（`:54-62`）：ON CONFLICT DO NOTHING→rowCount=0→**无条件返回既有 duplicate**（`:59-62`）——同键不同 units 不校验不报错（头注自注「同 key 不同 units 也按既有,不二次扣——掩盖客户端 bug」`::54` 注原文）。蓝本 §4 末行已裁「改成报错（409）」。

### 1.4 触发器配对面与 0046 完整性触发器定界（本刀改什么·不改什么）

①**tf_ 配对触发器**：现行体 0144 `:365-395`（0020 `:26-60` 原体→0046 `:144-173` failed 纳入→0144 搬 `tf_` 函数）——completed 只配 confirmed·abandoned/failed 只配 released；partial_confirmed 配对缺口 GAP-COMM-PARTIAL-PAIR 在册（0144 §2.6 注 `:363-364`）——方案②部分结算必须改此函数（CREATE OR REPLACE·0144 :365 签名·**非** 0020 旧函数体，蓝本 §0-4 复核纠错原文）。外层 enforce_（`:397-403`）与触发器（0020 `:62-64` BEFORE INSERT OR UPDATE OF status）零改。②**0046 scoring 完整性触发器**（`:118-135`）：answer_unscored 在场禁 completed——裁决③评分失败臂终态仍 failed（partial 配对）·completed 面无 unscored 事件·**零放松零冲突亲证**（adaptive-lifecycle `:519-523` AG-F 注记同结论）。③per_session 分支=0144 现行体逐字保留→**默认即旧行为**。

### 1.5 放弃/走人/崩溃收口现行面

①放弃=abandonInterviewAndRelease 只会全退（release 先行 `:355`·空壳支 `:362-369`·CAS `:383-386`）；②走人/崩溃=租约过期 sweepExpiredReservations 单 UPDATE 直置 released（`:434-437`·行锁+lease 复核同语句 `:428-431`）→ reconcileOwner 被扫臂补终态（commerce-reconcile `:46-88`·围栏先检 `:48-56`·B 端 failed 臂 `:57-68`·C 端 abandon 臂 `:69-85`）——裁决③：按已关闭话题结算·不能一律全退。

### 1-修法八件（严格按蓝本 §6.3-§6.5 草案+§6.6 接入点+§4 异常分支表·改造面=两新迁移+tf_ CREATE OR REPLACE+commerce 五函数+worker 接线·begin 双路面零改）

- **① 新迁移 0172（蓝本 §6.3 SQL 逐行为底）**：`ALTER TABLE interview ADD COLUMN billing_mode text NOT NULL DEFAULT 'per_session' CHECK (billing_mode IN ('per_session','per_topic_capped')) / billing_cap_units numeric(12,2) / billing_rule_version text`+`ck_interview_cap`（per_session⇒cap NULL ∨ per_topic_capped⇒cap>0 且 rule_version 非空——§10-11 更正：LEAST(x,NULL) 忽略 NULL 封顶校验静默失效·cap 非空 CHECK 承重）+`CREATE TABLE topic_charge`（owner_user_id/interview_id/topic_id/answers smallint/units numeric(12,2) CHECK (0..3·备选保留默认恒 1)/status 三值 CHECK（counted/counted_capped/waived）/reason 可空/rule_version NOT NULL/created_at·**PK(owner_user_id,interview_id,topic_id)**·CHECK (status='counted' OR units=0)=counted_capped·waived 恒 0 分）+RLS 行权形状=裁决项①（推荐沿 0171 `:36-42` 形）。历史迁移 0001-0180 零字节。
- **② 新迁移 0173（蓝本 §6.4 全文为底）**：`CREATE OR REPLACE FUNCTION tf_interview_consumption_terminal_pair(p_old,p_new)` 整体重写——DECLARE 扩四变量（cs/settled/requested/counted）·SELECT status,units_settled,units_requested INTO（现体 `:378-381` 单列扩形）·**per_session 分支=0144 `:386-393` 两 RAISE 原逻辑逐字保留**·**per_topic_capped 分支**：counted=SUM(units) FILTER (status='counted') FROM topic_charge（同 owner+interview）→counted=0 且 cs≠released⇒zero_usage_requires_release 23514；counted>0 且（cs∉(confirmed,partial_confirmed) 或 settled≠r2(requested×LEAST(counted,cap)/cap)）⇒topic_settled_mismatch 23514·SQL 面 r2=round(x::numeric,2) 同式（§0.2-7）·外层 enforce_/触发器（0020 `:62-64`）零改·GRANT EXECUTE TO PUBLIC 语义 CREATE OR REPLACE 不动 ACL（0144 `:411` 亲证）。0046 完整性触发器零触（§1.4-②）。
- **③ closeTopic 新函数（蓝本 §6.5 行 1）**：**先 `SELECT … FROM entitlement_consumption WHERE owner_user_id=$ AND idempotency_key=interviewId FOR UPDATE` 串行化同场关闭**（两话题并发读到「未封顶」防·§10-12 补充）→聚合话题（0170 topic_id+有效作答·判据与 0180 聚合 SQL 同族）→写 topic_charge·按累计 counted 判 counted/counted_capped（Σ≥cap→0 分 capped）·PK 冲突忽略（ON CONFLICT DO NOTHING·崩溃重放幂等）·db 侧沿 question-usage-ledger.ts `:47` 形制（类型化入参+单语句+类型化返回）·index.ts 导出（`:72-84` 区）。
- **④ confirmConsumptionUnits 新函数（蓝本 §6.5 行 2）**：按绝对值部分结算——units=预留额⇒confirmed·<⇒partial_confirmed·终态幂等（confirmed/partial noop·released 拒·沿 confirmConsumption `:180-181` 语义）·分账复用尾桶吸收差额形（`:185-194`·#21 勘误措辞如实承继）·B 端 payer 路由行经 applyAllocationDelta（`:146-158`）同形·outbox settlement_proposed 照投（`:212-214` 同事务）。
- **⑤ completeInterviewAndConfirm 改造（§6.5 行 3+#229）**：per_topic_capped 下 settled=r2(requested×LEAST(Σ,cap)/cap)（Σ=topic_charge counted 合计·**方案②公式·裁决②**）·**允许 partial_confirmed**（现行 `:256-257` 抛错面在此分支放行）·CAS 收口（`:260-277`）与 per_session 分支原语义零变。
- **⑥ abandonInterviewAndRelease+sweepExpiredReservations 改造（§6.5 行 4+§4 放弃/走人/崩溃三行）**：abandon——per_topic_capped 下 Σ>0 改走部分结算（已关闭话题照收·裁决③）·Σ=0 原全退·空壳支/CAS 零改；sweep——单 UPDATE 直置 released（`:434-437`）拆「结算或释放」二选一：mock_interview 行先按 topic_charge Σ 判（Σ>0→部分结算·Σ=0→release）·非面试 serviceType 原样·行锁+lease 复核原子性（`:428-431`）零放松·挂点形状=**裁决项③**；commerce-reconcile reconcileOwner 被扫臂（`:46-88`）随结算语义衔接·围栏先检（`:48-56`）与 B 端 assessment_unavailable 通路零改。
- **⑦ reserveEntitlement #31 报错改造（§6.5 行 5+§4 末行）**：幂等闸 duplicate 臂（`:59-62`）扩 units 比对——同键不同 units 抛具名错（形状=**裁决项④**）→begin catch 映射 409（蓝本 §4「改成报错（409）」·沿 enterprise_insufficient_balance 分码先例 interview.service.ts `:259-264`）·同键同 units duplicate 原语义零变。
- **⑧ 接线（蓝本 §6.6+§7 worker/对账行）**：closeTopic 挂点=换话题 pivot 关闭上一话题+收尾 done 块关闭尾话题（worker 侧·裁决项②关联）·收尾三分支按 interview.billing_mode 分流（per_session 原路径逐字节零变）·begin 双路零改（1.00 单位=1 场预留·402/409 分码保持·`:256-268` 零触）·begin 落 billing_mode/billing_cap_units/billing_rule_version 三列（flag 开时·cap 初值 6 经行值承载·影子期复核改值零迁移）·事件 additive（topicsCounted/topicsCapped 可选字段=P3 净新增面·蓝本 §6.6/§7 API 行本列）·对账巡检 settled=r2(requested×LEAST(Σ,cap)/cap)（蓝本 §7 对账行·只告警）·改动影响面=蓝本 §7 表 commerce/触发器/worker/测试四行·上线序步④。

### 1.6 异常分支表逐条（蓝本 §4 16 数据行·本表逐条对应——蓝本「invoke 内部重试」行自注不存在/无需处理故不单列·现状锚=本卷 §1·新模式处理=已裁裁决③/②·落点=修法件号）

| 分支 | 现行（锚） | 新模式处理（已裁） | 落点 |
|---|---|---|---|
| 用户点放弃 | 全退（`:353-399`） | 已关闭话题照计·进行中不计 | 修法⑥ |
| 直接走人（租约过期） | sweep 全退+reconcileOwner 补终态（`:432-452`/`:46-88`） | 按已关闭话题结算·不能一律全退 | 修法⑥ |
| 进程崩溃 | 与走人不可区分 | 同上统一·不新增判据（判据归 AG 轨另议） | 修法⑥ |
| 出题失败 | 整场结束·完成全额扣（`:479-488`） | 当前话题 0 分·按已关闭话题结算·全 0 则全退 | 修法⑤⑥+收尾分流 |
| 评分失败（unscored） | 整场失败全退（`:548-556`） | 该话题 0 分·已完成照计·终态仍 failed 配 partial_confirmed | 修法②⑤ |
| 零有效分完成 | 完成并全额扣（`:527-531`） | 全跳过=0 分则全退 | 修法⑤ |
| 引文核验失败补答 | 与答非所问同形 | 默认方案不受影响·clarify_cause 已透传（P1 落） | 零触（输入面已在） |
| 崩溃重放 | 幂等键 PK 去重（0037 `:26`） | topic_charge PK 去重·关闭话题时锁 consumption 行 | 修法③ |
| unknown | 出题 unknown→整场结束·评分 unknown→unscored | 同出题失败/评分失败两行 | 修法⑤⑥ |
| 熔断/准入拒绝 | 未派发即拒 | 不计·若致出题失败按出题失败行 | 零触（AG-D 已落） |
| usage 缺失（F15） | 三口径（刀 B 已折叠） | 不影响积分·成本侧照 0174 打标 | 零触 |
| 报告重试 | 报告不扣费·但完成已全额确认 | 不计·完成判据随本刀改「话题结算」（#229） | 修法⑤ |
| 开场额度不足 | C 402/企业 409（`:259-268`） | 仍按 1.00 单位=1 场预留零改（裁决②）·分码保持 | 零触（修法⑧ Ban 面） |
| 同键不同 units（#31） | 静默返回旧预留（`:54-62`） | 报错（409） | 修法⑦ |
| B 端重开 | 新 interview id→再预留（企业桶） | 企业付费已落（B271）·剩 application 幂等=**P4 残面范围外** | 零触（§3） |

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof**（住地 `apps/worker/test/bill3-settlement.proof.ts`·门名 `bill3-settlement:prove`·沿 bill1/bill2 proof 形制+run-e2e-isolated 四点注册 additive 只增不清·**隔离库真迁移链** 0001→0182 全链 applied）六臂：①**迁移臂**：0172 三列在场+ck_interview_cap 负臂（per_topic_capped 无 rule_version 拒/cap≤0 拒/per_session 带 cap 拒→23514）+topic_charge PK/CHECK 负臂（waived 或 capped 携 units>0 拒/units>3 拒→23514）+RLS FORCE 跨 owner 零行+只授 SELECT,INSERT（UPDATE/DELETE→42501 沿 bill1 形）；0173 函数现形（per_session 原逻辑+per_topic_capped 分支+GRANT 在场）；②**结算臂（方案②公式逐值·蓝本 §5 示例重放）**：2 话题 counted→confirmConsumptionUnits 后 settled=r2(1.00×2/6)=**0.33**·partial_confirmed；8 话题→LEAST 截断→settled=1.00 confirmed（封顶臂）；全跳过→released；尾桶吸收差额守恒（Σconsume===settled）；③**触发器臂**：completed+partial 合法（新模式）·failed+partial（Σ>0）合法·abandoned+partial 合法（放弃照收）·settled 错值⇒topic_settled_mismatch 拒 23514·counted=0+confirmed⇒zero_usage_requires_release 拒·**per_session 回归原值**（completed+reserved 拒/abandoned+confirmed 拒/failed+reserved 拒——0144 现行三臂逐字）；舍入同式臂（0.005 边界·§0.2-7）；④**closeTopic 臂**：同场双话题并发关闭不越封顶（FOR UPDATE 串行化·第二话题判 capped 0 分）+PK 重放幂等（ON CONFLICT 零重复）+Σ 聚合（pivot=自己/probe·clarify=主问题 id 归一话题）；⑤**#31 臂**：同键不同 units 抛具名错（非 duplicate）·同键同 units duplicate 原语义·409 映射面；⑥**零行为变更负臂**：billing_mode=per_session（缺省）全链行为原值——complete 全额 confirmed/abandon 全退/sweep 全退/触发器原判定（bill2 零扣费负臂的反转重申：per_session 面其正向原样）。
2. **既有门回归（原值）**：bill1-topic-fields:prove **27 臂**原值+bill2-shadow-meter:prove **44 臂**原值+interview:prove 57+commerce-reconcile:prove+uc018:abandon 面（放弃断言 per_session 面原值不变即绿·蓝本 §7 测试行参数化留后）+adaptive-life/reaper 原值。
3. **迁移纪律**：git diff 历史迁移 0001-0180 **零字节**+恰两新文件 0172/0173+`sql/` 影子面零改+**migrate:prove 入本刀门表 EXIT=0**+drift:prove EXIT=0。
4. **typecheck**：turbo typecheck --force **3/3** EXIT=0（commerce/worker/api 触面包）。

## §3 范围外（边界清单·越界即 FAIL）

1. **影子计量=P2 已落主线**（0180+writeShadowMeterSoft `:85-97` 零改零再触·meter_version shadow-v1 零翻）——影子期 2 周运营观察+封顶 6 终值复核=运营面非本刀（cap 经 billing_cap_units 行值承载·复核改值零迁移）。
2. **B 端残面=P4 另刀**：application 维度幂等（recruiter.ts `:592-607` 区）+话题报表（蓝本 §3.8/§7 P4 行）——企业桶扣费/409 分码/held 守卫已落零触·本刀 B 端行仅随通用结算面（applyAllocationDelta 同形）走。
3. **积分明细列表 §3.13 API+前端**（GET /billing/ledger+双端明细页+GET /billing/balance）=姊妹面另刀——topic_charge 本刀落表即其数据源之二（三账本=entitlement_consumption+topic_charge+question_usage_ledger）。
4. **扩张包 §3.10-§3.12 另刀**：押题/诊断/OCR 积分制+用户主动追问入口+深度研究 premium（裁决④）。
5. **F15/AG-14=刀 B 已折叠**零再触·usage 口径零动·ai-runtime 零触。
6. **0046 scoring 完整性触发器零放松**（§1.4-② 零冲突亲证）·**历史失败语义零再分类**（AG 轨六刀收官面）·**模型调用面/检索面零触**。
7. **话项定义认可（§11-2）+封顶终值（影子期）=用户开放项**——本刀按 §3.1 默认话题定义（主问题+同能力追问+澄清）+cap 初值 6 施工·若裁决变更由后刀适配。
8. **存量换算零触（裁决②零换算）·灰度放比（§7 步⑥ 5%→100%）=运营面**·共享 SSOT 只读零改（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign 两件——行翻面权归协调方）·est live=0（§6）。

## §4 依赖

**硬前置全兑现·可立即施工**：①P1（0170 三列+0171 归集表+七件接线）已落主线 `a1241e90`——topic_id/ask_mode/clarify_cause=closeTopic 聚合与「系统出错 0 分」判据输入面（DB 列面·事件 additive 字段 topicsCounted/topicsCapped 不在 P1 交付·系 P3 净新增面（蓝本 §6.6/§7 API 行本列））；②P2（0180 影子表+收尾外围 fail-soft 钩子）已落主线 `f3968440`——收尾区现位漂移已登记（§0.2-2）；③AG 失败语义轨六刀全收官（刀 D `ccf3e7e7` 等）=INDEX 四节「billing P3 骑在稳定失败语义之上」兑现；④编号链 0172/0173 留本刀三处在案·0181+ 空闲亲证（§0.2-4）。**下游**：明细列表 §3.13→扩张包→P4 B 端残面→灰度运营步⑥。**软交叠如实登记**：22 在飞树无一触 commerce.ts/0144/adaptive-lifecycle 收尾区（本刀面）——EXEC 并线重 pin 照协议（先落者为准·后到者 §0 重 pin）。

## §5 Ban 列表 + pins（沿 bill1/bill2 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign README+LANDING-INDEX/ai-capability-review 四件+INDEX——行与统计只读引用·本刀不自建 SSOT 行·行翻面权归协调方）；**Ban 触 P1/P2 已落面**（0170/0171/0180 零字节+recordUsage/writeTopicShadowMeter/writeShadowMeterSoft/P2 收尾外围钩子零改零拆·影子期观察面零动）；**Ban 历史迁移字节改**（0001-0180 零字节+`sql/` 影子零改·新迁移铁律·勿添重号）；**Ban 0046 scoring 完整性触发器放松**（`interview_completion_requires_all_answers_scored` 零触——结算配对面改写仅限 0173 tf_ 函数·§1.4-②）；**Ban begin 双路面改**（interview.service.ts `:253-268` 预留形/1.00 单位/402/409 分码零改·裁决②·三列新落仅 additive）；**Ban B 端残面出手**（application 幂等+话题报表=P4）；**Ban 明细列表/扩张包出手**（§3-3/§3-4）；**Ban F15/usage 口径再动**（ai-runtime 零触）；**Ban 计量缺失收 1 分**（已裁 0 分「不确定就不收」·裁决③）；**Ban 话项粒度浮动定价**（v2 轮数/长度公式已废 §3.5 仅存档·恒 1 分/话题）；**Ban 新 env 闸**（billing_mode 列即开关载体·回滚=flag 关·新场 per_session 回按场）；Ban 触其他工作树（aga~agf/bill1/bill2 等在飞机）；Ban 伪造已问/已验来源；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**增补三行（行为承诺·断言入 §2-①⑥）**：①**billing_mode 默认 per_session=零行为变更**——0172 迁移后存量+新场全默认 per_session=旧行为·0173 per_session 分支=0144 原逻辑逐字保留（回滚即恢复 0144 函数体·蓝本 §7 触发器行回滚栏）；②**flag 关闭回按场**（新场 per_session·进行中 per_topic_capped 场按其行值收口=§7 步⑥「进行中面试不切换」）；③**存量桶不换算**（裁决②方案②·1 单位=1 场不变·账本单位恒场单位·「分」为展示与比例概念·零兼容风险）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全隔离库真迁移链+假体·零模型外呼·零真实扣费）

## §6 est live=0

本刀零模型真实外呼：新 proof=隔离库真迁移链（run-e2e-isolated 本地临时 PostgreSQL·零生产 DSN/零生产 Key/零凭据落盘）+scriptedModelClient 假体；typecheck/migrate:prove/drift:prove=本地门——**本刀虽为扣费语义刀·全门隔离容器零真实扣费零真实外呼**·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/bill3-settlement-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 bill1/bill2 receipts 形留执行席收据·五类标记词不复抄卷内——避免自匹配·沿 bill1/bill2/authz 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（billing-redesign rev1+INDEX 第七/十二/十三/十四节+LEDGER :420 承接行系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 七条漂移登记如实在案·主线 tip 再前移照 §0.2-1 协议重钉）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：蓝本边界与现码冲突即停上报（现 tip 重 pin 已核对零冲突——§0.2 七条漂移全系登记性·承重锚 #31 `:54-62`/begin `:256-268`/tf_ `:365-395` 原位零漂）。

**待双审/EXEC 裁决项**：①**topic_charge 行权形状**（推荐=RLS ENABLE+FORCE+p_owner 策略+只授 SELECT,INSERT 沿 0171 `:36-42` 形——计费事实表只增不改·更正走红冲/后行 vs 授 UPDATE 允就地更正）；②**跳过话题落行形状+closeTopic 挂点**（推荐=跳过话题落 waived 行 reason='skipped'（明细可见·与 0180 影子面五值对齐映射·蓝本三值 CHECK 逐字容纳）+closeTopic 挂换话题 pivot 与收尾 done 双挂点 vs 跳过不落行（Σ 缺口·明细断档））；③**sweep 拆分挂点**（推荐=sweepExpiredReservations 内 mock_interview 行按 topic_charge Σ 判定结算或释放——行锁原子性最窄面·flip 前判定时序唯一可行 vs reconcileOwner 层分流（sweep 已 flip·须改 reconcile 返回契约·不推荐））；④**#31 报错形状**（推荐=具名 P0001 `idempotency_units_mismatch`+begin catch 409 映射（沿 enterprise_insufficient_balance 分码先例）vs 23514 沿触发器族——后者与「约束违例」语义混叠·不推荐）。

---

*BILL3-SETTLEMENT REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`aeaf4141`（主线 tip·git log -1 实测·开工=落卷零前移）· 分支 `line/bill3-settlement` · 工作树 `meetwise-bill3`（git worktree add 本起草席立·建前 worktree list 22 树+branch 双查+rg 零命中三查不存在）· 立项出处=billing-redesign README rev1（blob `cd4c060f`·532 行·§4 `:233-253` 16 数据行/§6.3 `:310-336`/§6.4 `:338-371`/§6.5 `:373-381`/§6.6 `:383-387`/§7 `:391-413`）+LANDING-INDEX（blob `0694ff22`·七 `:41-47`/十二 `:50-57` 四裁决/十三 `:60-63`/十四 `:66-70`）+LEDGER `:420` 承接行· 防重三查过· §0 blob 锚表 28 行 ls-tree 亲算+§0.2 漂移七条如实登记（tip 零前移/收尾区 `:442-488`→`:490-557` 漂移 48 行三分支零变/commerce 锚 ±1 内 #31·begin 原位/编号链 0172+0173 本刀·0181+ 空闲/影子五值 vs 结算三值差异=裁决项②/AG 六刀收官+续约锚 `:300,309`→`:357`+`:366`/r2 SQL 面同式登记）· 红事实五链现 tip 重 pin（结算缺位=topic_charge 不存在+按场固定 1 分+无话题粒度消费者/#229 完成即全额确认 ratio=1+partial 抛错结构性不可达/#31 同键不同 units 静默吞/触发器配对面 GAP-COMM-PARTIAL-PAIR+0046 完整性触发器零放松定界/放弃走人崩溃收口现行面）· 修法八件（0172 计费三列+ck_interview_cap+topic_charge/0173 tf_ CREATE OR REPLACE per_session 逐字保留+per_topic_capped 方案②比较式/closeTopic FOR UPDATE 串行化/confirmConsumptionUnits 绝对值部分结算/completeInterviewAndConfirm 允 partial/abandon+sweep 拆二选一/#31 报错 409/接线八面 begin 零改）+异常分支表（蓝本 §4 16 数据行）逐条落点 · 断言候选四条（隔离库真迁移链六臂新 proof 含方案②逐值 0.33/封顶/舍入同式/触发器 per_session 原值回归/既有门 27+44+57 原值/迁移纪律/typecheck）· §3 范围外八条（影子计量 B 端残面明细 UI 扩张包 F15 0046 开放项存量灰度 SSOT）· §4 依赖=P1+P2+AG 六刀全兑现 · est live=0 · pins 十一值照抄 · 增补三行（per_session 零行为变更/flag 关回按场/存量桶零换算）· markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · **rev 勘误席处置（席1 FAIL 一 blocking+四 errata·2026-10-11 全数落改）**：B1 contracts 行虚构现状锚删改三处（§0.1 行/§1-⑧/§4 依赖①——事件 additive 字段系 P3 净新增面·蓝本 §6.6/§7 API 行本列·grep packages/contracts/ 事件字段零命中亲证·旧锚三行实为 DiagnosisList/Entitlement/JobPublicList）+E1 计数勘误（十四行→16 数据行·立项出处/§1.6/卷尾三处同步·蓝本 §4 表 grep 亲数 16 数据行·本卷 §1.6 表 15 行=蓝本「invoke 内部重试」自注不存在不单列）+E2 行锚五组重 pin（0046 触发器 :118-135+RAISE :130-131/0170 ix_iq_topic :33-34/0001 units_settled :115+四值 CHECK :116-117+uq :121/0180 status :37 区+cap_hit :47 区）+E3 续约两调用点 :357+:366（租约结论零变）+E4 reason 可空（蓝本 §6.3 SQL 仅 rule_version NOT NULL）——核心八件修法/断言四条/§8-③ 冻结/STOP/markers/pins 十一值零变*

---

## §9 EXEC 附记（随翻·append 保史·§0-§8 原文零改·2026-10-13）

**Status 翻面（append）**：**`executed:awaiting_post_prove_dual`**——EXEC 施工+随翻完成·全门绿·⛔push·待 post-prove 双审两外席（alone≠dual·Ban self-approve）。

**施工落点（恰 15 文件：新 4+改 10+本卷随翻 1）**：新=packages/db/migrations/0172_topic_charge.sql+0173_tf_interview_consumption_terminal_pair.sql（两新迁移·零历史迁移触）+packages/db/src/commerce/topic-charge.ts（closeTopic/interviewBillingOf/topicCountedUnits/listTopicSettlementMismatches）+apps/worker/test/bill3-settlement.proof.ts（43 断言六臂）；改=packages/db/src/commerce/commerce.ts（#31+confirmConsumptionUnits+complete/fail/abandon/sweep 模式感知拆分+settleOrReleaseForTerminal/terminalReleasedOf）+packages/db/src/index.ts（导出区 additive 两块）+apps/worker/src/adaptive-lifecycle.ts（import+closeTopicForQuestion+pivot 挂点+done 两分支尾挂点）+apps/worker/src/commerce-reconcile.ts（import+巡检 fail-soft 只告警块）+apps/api/src/modules/interview/interview.service.ts（#31 409 catch 一支 additive）+packages/contracts/src/index.ts（SessionConcludedPayload 两可选字段）+apps/worker/test/bill2-shadow-meter.proof.ts（两枚过期负臂随翻·§9-2 E4）+scripts/run-e2e-isolated.mjs（四处注册只增不清·node --check EXIT=0）+根 package.json+apps/worker/package.json（门名各两行/一行）。

### §9-1 并线重 pin（§8-③ 照本节协议行使）

- **并线**：`git merge feat/mysql-schema-skeleton`——**Already up to date**（协调方载「主线 8603dc65+」=锚族表述·实测主线 tip=`aeaf4141`（=起草基线·merge-base=tip=零新笔·`git log HEAD..feat/mysql-schema-skeleton` 空输出亲证）·零冲突预期兑现·无 merge commit。
- **§0 席2 勘误并入后全量重 pin 零漂亲证**（施工前 sed/Read 逐锚）：0001 entitlement_consumption `:109-123`（units_settled `:115`/四值 CHECK `:116-117`/uq `:121`）·0020 enforce 原体 `:26-60`+触发器 `:62-64`·0046 scoring 完整性触发器 `:118-135`+RAISE `:130-131`+enforce failed 纳入 `:144-173`·0144 tf_ 现行体 `:365-395`（SELECT 单列 INTO `:378-381`/completed↔confirmed RAISE `:386-389`/abandoned·failed↔released RAISE `:390-393`/§2.6 注 `:363-364`）+enforce 外层 `:397-403`+GRANT `:411`·0170 ix_iq_topic `:33-34`·0171 RLS `:36-42`·0180 status 五值 `:37` 区+cap_value/cap_hit `:46-47` 区·commerce.ts r2 `:34`/#31 `:54-62`/confirmConsumption `:167-216`（ratio 闸 `:171`/settled `:183`/尾桶 `:185-194`/outbox `:212-214`）/completeInterviewAndConfirm `:251-277`（ratio=1 `:253`/partial 抛错 `:256-257`/CAS `:260-263`）/abandonInterviewAndRelease `:353-399`（release 先行 `:355`/空壳 `:362-369`/CAS `:383-386`）/sweepExpiredReservations `:432-452`（单 UPDATE `:434-437`）·interview.service.ts begin 双路 `:253-268`（预留三元 `:256-258`/catch 分码 `:259-264`）·adaptive-lifecycle 收尾区 `:490-557`/三分支 `:524-556`·interview-consumer.ts 续约两调用点 `:357`+`:366`——**承重锚全部原位零漂·§0.2 七条漂移登记就此封账**。
- **迁移链重 pin**：落卷链 max=**0180**·**0172/0173 全树零占**（ls+主线 ls-tree 双查）·本刀恰占零新增号·0184 起顺延勿添重号（§0.2-4 结论零变）。

### §9-2 勘误注（登记级·结论零变）

- **E1（proof 首臂计数勘误·亲跑承登）**：schema_migrations 版本键=**完整文件名词干**（非数字前缀）——0143/0152/0160 三对「重号」系同前缀不同词干两行并存·真链 applied=**182** 行（migrate-cli 日志同值亲证）·proof 首臂初版按前缀去重 179 误设→已按实跑勘正（`version LIKE '0172%'` 同形）。
- **E2（GRANT 探针勘误·亲跑承登）**：`has_function_privilege('PUBLIC',…)` 系伪角色不可查（42704）→改 `pg_proc p, aclexplode(p.proacl) g … g.grantee=0`（grantee 0=PUBLIC）形·结论零变（GRANT EXECUTE TO PUBLIC 在场 PASS）。
- **E3（bill2 两枚过期负臂随翻）**：bill2 proof ④臂「topic_charge 关系不存在（0172 未落亲证）」与「interview 计费列零新增」两枚负臂的**前提由本刀落地兑现**——按其铁律本体（零扣费零 billing_mode 出手）翻正向重申：「topic_charge 在场而本刀真链场零结算行」+「计费三列缺省恒 per_session/cap·rule_version NULL」·**臂数 44 恒定**·复跑 EXIT=0 原值。P2 码面（0180/topic-shadow-meter.ts/writeShadowMeterSoft）零字节零触。
- **E4（fail 臂纳入「结算或释放」拆分·修法⑥同落点扩充如实登记）**：§1-⑥ 修法清单载 abandon+sweep 两函数——施工实测 0173 per_topic_capped 分支 counted>0 拒 released ⇒ **fail 臂三调用点**（interview-consumer terminalizeUnsettledInterview/adaptive-lifecycle 出题失败与混合 unscored 臂/commerce-reconcile B 端被扫臂）在 capped 面结构性 23514——按裁决③「该话题 0 分·已完成话题照计·终态仍 failed 配 partial_confirmed」（异常分支表行 5 落点=修法②⑤）将 failInterviewAndRelease 纳入共享 helper `settleOrReleaseForTerminal`（abandon/sweep/fail 三终态面同拆分）·**per_session（缺省）面逐字节零变**（⑤-d 臂原值+②-c 触发器三臂原值回归背书）。
- **E5（修法⑧「begin 落三列」本刀不落）**：协调方任务序明载「begin 零改（billing_cap_units 后续刀）」——三列由 0172 additive 落表（DEFAULT per_session·零行为变更）·flag 载体=行值（proof `beginCappedSession` 直写行使）·begin 双路 `:256-268` 预留形/1.00 单位/402/409 分码零触亲证；begin 写列随后续 flag-on 刀。
- **E6（事件 additive 承载如实登记）**：contracts `SessionConcludedPayload` 增 `topicsCounted/topicsCapped` 两可选字段（.strict() 保留=未知键仍拒·可选=旧发射零破坏）·本刀零生产事件流变化（per_topic_capped 场仅隔离 proof 行值直写）·承载接线随 flag-on 刀（§9-2 E5 同刀）·明细消费面=§3-3 姊妹刀读 topic_charge 直查（零事件依赖）。

### §9-3 §8 四裁决行使（全按卷推荐）

- **①topic_charge 行权形状=RLS ENABLE+FORCE+p_owner 策略+只授 SELECT,INSERT**（0171 `:36-42` 形制范本逐字·计费事实表只增不改·更正走红冲/后行）——42501 UPDATE/DELETE 负臂 live 在 proof。
- **②跳过话题落行+closeTopic 挂点=waived 行 reason='skipped'+双挂点**（跳过话题落 waived 行明细可见·三值 CHECK 逐字容纳·与 0180 五值观测映射 skipped→waived+reason）·closeTopic 挂换话题 pivot（answer 投影事务 `next.askMode==='pivot'` 关闭上一话题）+收尾 done 块关闭尾话题（完成臂/零有效分臂两分支·与结算同事务原子）·**fail+release 臂不挂尾话题**=未完成话题 0 分不计（裁决③「已关闭话题照计·进行中不计」·出题失败臂同此零挂）。
- **③sweep 拆分挂点=sweepExpiredReservations 内 mock_interview 行按 topic_charge Σ 判定**——非面试 serviceType 行原「单 UPDATE 直置 released」逐字保留；mock 行 SELECT…FOR UPDATE 先持行锁（判定时点=锁获取·心跳 renew 在锁上排队且其 status='reserved' 谓词使其必输=TOCTOU 由锁封闭）再 Σ>0→方案②公式部分结算/Σ=0→releaseConsumption·行锁+lease 复核原子性零放松（裁决项③「flip 前判定·行锁最窄面」推荐行使）·commerce-reconcile reconcileOwner 被扫臂随共享 helper 自动衔接（围栏先检/B 端 assessment_unavailable 通路零改）。
- **④#31 报错形状=具名错 `idempotency_units_mismatch`+begin catch 409 映射**（沿 enterprise_insufficient_balance 分码先例·23514 与「约束违例」语义混叠按卷否决）·同键同 units duplicate 原语义零变（④臂双面）·全仓四生产调用面（ocr/quiz/mock_interview/diagnosis）唯一键零合法路径影响亲证。

### §9-4 门 EXIT 全表（EXEC 亲跑·2026-10-13·全隔离容器·零模型真实外呼·零真实扣费）

| 门 | EXIT | 数 |
|---|---|---|
| bill3-settlement:prove（新·隔离库真迁移链 applied=182·0172/0173 在账） | 0 | 43 断言全 PASS（⓪迁移 16+①结算 8+②触发器 7+③closeTopic 4+④#31 3+⑤per_session 原值 5） |
| bill1-topic-fields:prove | 0 | 27 原值 |
| bill2-shadow-meter:prove | 0 | 44 原值（两枚随翻臂正向重申·E3） |
| interview:prove | 0 | 57 原值 |
| adaptive-life:prove / reaper:prove | 0 | 43 / 28 原值 |
| uc018:abandon:prove / commerce-reconcile:prove / commerce:prove | 0 | 全 PASS（放弃断言 per_session 面原值） |
| migrate:prove / drift:prove | 0 | 迁移运行器+schema 无漂移 |
| turbo typecheck --force | 0 | 3/3（0 cached·contracts/web/root e2e 三 tsconfig） |
| docs:check | 0 | 80 required+2041 managed |
| markers（改动集新增行五类标记词） | 0 命中 | node --check runner EXIT=0 |
| 历史迁移 0001-0180 零字节 + sql/ 影子面零改 | ✓ | git diff 双查零字节·恰两新文件 0172/0173 |

pins 十一值照抄零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·脚注 actualSpendCny=null）·est live=0（bill3/bill1/bill2/interview/adaptive-life/reaper/uc018/reconcile/commerce/migrate/drift 全门隔离容器+scripted 假体·零生产 DSN/零生产 Key/零凭据落盘·收据=.tmp/isolated-proof-receipts/* release_evidence=false）。

### §9-5 陷阱自检 13 条

1. **0172-0173 避撞**：落卷链 max=0180 亲证·0172/0173 全树零占双查·恰占零新增号·勿添重号纪律零变（0143/0152/0160 重号=同前缀不同词干·E1 勘误登记）。
2. **per_session 逐字保留**：0173 per_session 分支=0144 `:386-393` 两 RAISE 原文逐字（pg_get_functiondef 臂+②-c 触发器三臂原值回归+⑤ 真链四臂原值）——默认即旧行为·回滚=恢复 0144 函数体。
3. **触发器 GRANT 语义**：CREATE OR REPLACE 不动 ACL（aclexplode grantee=0=PUBLIC 臂·E2 勘误承登）·外层 enforce_（0144 `:397-403`）与 0020 触发器零改（trg 在场臂）·0046 scoring 完整性触发器零放松（0046 面零触·bill2 C 臂 mixed-unscored=failed 语义零变背书）。
4. **方案②公式同式**：应用侧 r2(requested×LEAST(Σ,cap)/cap) 与触发器 round(x::numeric,2) 同式（§0.2-7·正数域 half-away 一致）——①-a 0.33 逐值+①-b 封顶 1.00+①-d 0.005 边界 0.01 双面一致臂承重；触发器错值拒臂（0.50≠0.33→23514）反证比较式在场。
5. **closeTopic 锁**：先 entitlement_consumption FOR UPDATE 串行化同场关闭（③-a cap=1 双话题并发恰 1 counted+1 capped）+PK ON CONFLICT DO NOTHING 幂等（③-b 重放 written=false 行数零增）。
6. **partial 允许**：completeInterviewAndConfirm capped 分支允许 partial_confirmed（①-a 0.33 partial+completed 配对通过）；per_session 分支 partial 拒绝原面逐字保留（`interview_settlement_not_fully_confirmed` 原抛错路径零位移）。
7. **#31 报错**：同键不同 units→具名 `idempotency_units_mismatch`（④臂·非 duplicate）·同键同 units→duplicate 原语义（幂等保不重扣零变）·begin catch 409 additive（既有 402/409 分码与预留形零触）。
8. **abandon/sweep 拆**：Σ>0 部分结算（②-d failed+partial/②-e abandoned+partial 合法臂·released 报告值='settled' 诚实区分）/Σ=0 原全退（①-c/⑤-b/⑤-c）·sweep 非面试 serviceType 原单 UPDATE 逐字·行锁+lease 复核零放松。
9. **begin 零改**：interview.service.ts `:253-268` 区仅 catch 加一支 additive（修法⑦明文落点）·预留三元/1.00 单位/402/409 分码逐字零触（E5）。
10. **范围外零触**：P1/P2 已落面（0170/0171/0180/recordUsage/writeTopicShadowMeter/writeShadowMeterSoft）零字节零再触（bill1 27+bill2 44 原值背书）·B 端残面（recruiter.ts application 幂等）/明细列表 §3.13/扩张包/F15/usage 口径/模型调用面/检索面/共享 SSOT 四件+INDEX 只读零改。
11. **pins**：十一值照抄零翻·脚注 actualSpendCny=null 承接（全门隔离容器零真实扣费零消耗）。
12. **状态行**：本卷 Status 翻面 draft:awaiting_pre_exec_dual→**executed:awaiting_post_prove_dual**（本节 append·§0-§8 及头部 Status 史录零改·沿 bill1/bill2 同形）·待 post-prove 双审两外席（alone≠dual·Ban self-approve）。
13. **回滚**：flag 关=行值回 per_session（新场旧行为·进行中 capped 场按其行值收口=§7 步⑥「进行中面试不切换」）·0173 回滚=恢复 0144 函数体（CREATE OR REPLACE 前体在案）·0172 回滚=列不用（默认 per_session 零行为）·topic_charge 停写即止·历史迁移零字节恒真。
