# BILL2-SHADOW-METER REQUEST（billing 战役 P2 起草刀 · 影子计量钩子——topic 关闭/面试收尾写影子计量行 · 只算不扣 · 零扣费零积分零结算 · 话题数分布/计费-成本相关性/封顶 6 实测数据面 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。

**席位**：billing 战役 P2 起草席（billing P1 nail `a1241e90` 收官+SSOT 双登记 `3cd8e63f`/`d6ee387c`「P2 影子计量待立项」承接·LEDGER 刀位图行 `:420` 只读引用·billing-redesign 蓝本 rev 定稿 §7 上线序③影子计量刀·协调方常设 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `d6ee387c`（`d6ee387c647e775e69b2ff38c3145a056874ffe8`·主线 tip·`git log -1` 实测·BILL1 nail 收官 SSOT commit·零码面——开工首测即落卷实测·会话内零前移·**基线按落卷时 tip 重钉**·§0.2-1）。分支 `line/bill2-shadow-meter`·工作树 `meetwise-bill2`（`git worktree add ../meetwise-bill2 -b line/bill2-shadow-meter` 本起草席已立·建前 `git worktree list` 21 树无 bill2 树+`git branch --list "*bill2*"`/`"*shadow*"` 双查空输出+`rg -l "bill2|shadow-meter" ai-docs/` 零命中三查亲证·HEAD 落 `d6ee387c` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：蓝本两层+战役账全部精读引用——①`ai-docs/delivery/billing-redesign/README.md`（blob `cd4c060f`·**rev1 定稿 532 行**·零漂亲证）**§7 上线序 `:411`**「上线顺序：①只加不改（0170–0172·默认 per_session）→②F15→**③影子计量 2 周（只算不扣，看每场话题数分布、计费与成本相关性）**→④0173 上线、巡检告警→…」+**工作量 `:413`**「P2 影子计量 3–4（另 2 周观察）」+**§13 无法核实 #4 `:520`**「每场面试的典型话题数分布、封顶取值是否合适（需影子期数据）」+**§11-3 `:490`** 封顶「初值 6·影子期复核终值（唯一残面开放点）」+§3.3 `:140`（封顶已裁初值 6·按「普通一场的话题数」设）+§9 风险表 `:447`（「话题数被系统拉长→单场封顶；影子期观察话题数分布」）+§3.2 计费规则表 `:127-137`（counted/跳过 0 分/出题失败 0 分/counted_capped——影子行模拟口径）+§5 示例 `:256-268`（Σ/ cap 模拟公式面）+§6.3 `:310-336`（topic_charge 草案列形——影子表 mirror 之源·**0172 本刀不落**）+§3.9 兜底 `:185-187`；②同目录 `LANDING-INDEX.md`（blob `0694ff22`·70 行·零漂亲证）：**第七节验证定谳 `:41-47`**（交叠矩阵 `:46`「可立即并行面=…+影子计量挂 invoke trace 区（:358-364·同文件异区）」——该候选挂点已被 bill1 §8 裁决项②行使实质取代·§0.2-3）+ **第十二节用户裁决落值 `:50-57`**（裁决①「每话题固定 1 分+单场封顶（初值 6·影子期复核）」`:52`·裁决④扩张包+封顶 6 `:55`）+ 第十三节两扩权 `:60-63`+ 第十四节 rev1 落卷 `:66-70`（仍开放面仅余话题定义认可+封顶终值（影子期）`:70`——**本刀=封顶终值裁决的数据供面**）；③`ai-docs/delivery/harness/product-campaign-LEDGER.md`（blob `c0c13fee`）**计费行 `:420`**「P1 nail `a1241e90` 收官…STILL OPEN：0172-0173 结算刀 P3/明细列表 §3.13 姊妹面·**P2 影子计量待立项**」=本卷承接行（只读）；④`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c`·只读）：AG-14/F15（`:202-211`·刀 B 已折叠·usage 口径零再触）。

## §0 现状锚（起草席亲读·base `d6ee387c`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list` 建前 21 树实测（主仓+5e/aga/agb/agc/agd/age/agf/authz/bill1/billrev/blite/cost1/cost2/e2sc/i263/i6/entpay/parity2/qsec/ttlwire）——**无 bill2 树**（bill1 树=`line/bill1-topic-fields` P1 施工树·其刀已 nail 收官·零交叠）。
- `git branch --list "*bill2*"`+`"*shadow*"` 建前双查空输出——**无同名分支**。
- `rg -l "bill2|shadow-meter" ai-docs/` **零命中**（harness 190+ 卷无同名刀卷；billing-redesign 两件系蓝本登记卷非刀卷）。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`d6ee387c`）

| 文件 | blob（8 hex·括号全 40 hex） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0170_interview_question_topic_fields.sql` | `8d57dba1`（`8d57dba1798f861870f6f429547a033d66c26024`） | **P1 产物·主线在卷**：topic_id/ask_mode/clarify_cause 三列 `:19-21`+命名 CHECK 两件 `:23-31`+**ix_iq_topic partial 索引 `:33-34`**（`WHERE topic_id IS NOT NULL`·影子聚合查询的逐话题取数面） |
| `packages/db/migrations/0171_question_usage_ledger.sql` | `0948ef93`（`0948ef93c6ca7b2d91f056cbd2092bb6bfd3592a`） | **P1 产物·主线在卷**：question_usage_ledger 表 `:17-34`（**meter_version `:27`**·PK(owner_user_id,invocation_key) `:33`·usage_source 四值 CHECK `:31`）+**GRANT SELECT,INSERT `:36`**+RLS ENABLE+FORCE `:37-38`+p_owner 策略 `:39-42`（影子表形制范本·若裁决①A） |
| `packages/db/src/model-op/question-usage-ledger.ts` | `94f170a7`（`94f170a7ea9b08e025e148cf652271240a9e5476`·78 行亲读） | **meter_version 预留承诺 `:38-39`**（「计量版本（预留列：P1 恒 NULL，**影子计量刀（P2）起填**」——本刀兑现点）·QuestionUsageLedgerEntry.meterVersion 入参 `:39`/透传 `:74`·recordUsage `:47-78`（INSERT…ON CONFLICT DO NOTHING `:64`·返回新插与否 `:77`）——**函数体零改·影子行复用同形** |
| `packages/db/src/index.ts` | `929d7271`（`929d727199be286fc30bd983d782e1ed65f9e61e`） | recordUsage 导出 `:219`（billing P1 修法⑦ 注记行·新影子 db 函数导出同区 additive） |
| `apps/worker/src/adaptive-interview-service.ts` | `1f1efa9c`（`1f1efa9cebc327005778ee6d50b9a6e5f99cfd55`） | **P1 三挂点**：recordUsageSoft（fail-soft 形·stderr 观测零业务阻断）`:204-207`·usageCauseForInvokeError `:197-201`·plan 挂点 `:322-326`/ask 挂点 `:512-516`/assess 挂点 `:668-675`（`:670` 携 topicId=stableIdentity.topicId·`:667` 危机短路零外呼不入账）——**影子钩子 fail-soft 形制先例** |
| `apps/worker/src/adaptive-lifecycle.ts` | `de3c26a5`（`de3c26a5a3e1d0543ee2399966d3b2ca2cdb1721`·558 行亲读） | **收尾 done 臂 `:475-546`·三分支现位 `:509-541`**（unscored=0∧eligible>0→completeInterviewAndConfirm `:509-511`·unscored=0 零有效→complete+markApplicationNoEligibleScore `:512-532`·混合 unscored→failInterviewAndRelease `:533-541`）+**AG-F 边界注记 `:504-508`**（「混合面 completed+照计 需放松 0046=计费结算语义·归 billing rev 战役」=P3 领地·0046 触发器名 `:506`）——影子钩子挂点=该 done 臂**事务外围**（三分支内部零触） |
| `packages/db/src/interview/interview-question.ts` | `d542ed5c`（`d542ed5cac5db9c83464d9fec2ce4f9bc14a0f5b`） | persistInterviewQuestion `:51`（INSERT 携 topic_id/ask_mode/clarify_cause `:55-59`·identity conflict `:75`）——interview_question 行=影子聚合**主数据源**（0170 三列已持久化） |
| `packages/ai-graphs/src/adaptive-interview/state.ts` | `1c780343`（`1c780343739a28f04c6d71fbcf41542f1bf65c31`） | topicMainQuestionId `:201`（C14 纯标识符·图内话题归集键源） |
| `packages/ai-graphs/src/adaptive-interview/nodes/decide.ts` | `7777aaa2`（`7777aaa25c036b0bdd7ca8be2d467a89ad35c594`） | 澄清臂 mode:'clarify' `:23`·非澄清臂携 action.mode `:35-36`——ask_mode 写入源（P1 修法③产物·影子分类输入） |
| `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `c55e828f`（`c55e828f4c526018c69137b66da9e25a68d54dd2`） | topicId 派生 `:129-140`（pivot=新发 questionId 自己/probe·clarify=主 id/旧 checkpoint=undefined→NULL）——「话题」在系统里的落表语义（影子聚合的分组键语义） |
| `apps/worker/test/bill1-topic-fields.proof.ts` | `e5212b46`（`e5212b46f599db3ee08facfdac91ad2d508c20ee`·441 行） | 头注五臂 `:1-17`（**run-e2e-isolated 完整版本化迁移禁影子 schema** `:5-6`+零外呼 scriptedModelClient `:7-8`）·隔离库真迁移链+ConsumerDeps 注入形+多话题场驱动（pivot/probe/clarify 全链 scripted）——**本刀新 proof 住地形制范本** |
| `apps/worker/package.json` | `a869a261`（`a869a261a6d8a65dc3048d459f5cc440dec8f141`） | prove:bill1-topic-fields `:21`（新门注册同区 additive 行） |
| 根 `package.json` | `09c759be`（`09c759be66e5421650f670b7cf6cd86956216bbb`） | bill1-topic-fields:prove `:267-268`·interview:prove `:255`·migrate:prove `:326`·drift:prove `:434`·docs:check `:8`（门注册/纪律面） |
| `scripts/run-e2e-isolated.mjs` | `91f24742`（`91f24742777593fb79be5c1f046697d6999d8dc0`） | bill1 四点注册先例 `:681-683`（receipt sources）/:1890（白名单）/:2119-2120（命令映射）/:2800（migrate 名单）——**只增不清**（AG-C 先例·E3 教训） |
| `packages/db/src/principal.ts` | `c31cbac0`（`c31cbac08890c49bf42555b136adf43b1b393e1e`） | asPrincipal（影子写面 principal 通道·零新权限面） |
| 蓝本两件+战役账两件（只读引用） | README `cd4c060f` / LANDING-INDEX `0694ff22` / LEDGER `c0c13fee` / issues-final `dac7f58c` | 见卷首立项出处行锚 |

### 0.2 漂移登记（蓝本锚=意见书 rev1 `1a332e5e`（对齐 tip `133acba6`）→ 落卷 tip `d6ee387c`·结论零变·EXEC 重 pin 时同协议处理）

1. **基线钉值**：起草开工首测=落卷实测同值 `d6ee387c`（BILL1 nail SSOT 收官 commit·会话内主线零前移·本卷基线即 @`d6ee387c`·§0.1 全 blob 以该 HEAD 亲算）——EXEC 并线时主线若前移照 §0.2-1 协议重钉（排除 ai-docs 后 diff 为空则 blob 零漂照抄）。
2. **收尾三分支区行锚漂移（结论零变）**：蓝本 rev1/INDEX 载 adaptive-lifecycle `:442-488`（rev1 五 pin 之一）→ 现位 **`:475-541`**（AG-E 报告守卫+AG-F unscored 0 分继续两刀已并主线致后移+三分支间插段；三分支谓词与收口语义零变亲读·AG-F 边界注记 `:504-508` 明载 0046 触发器 `interview_completion_requires_all_answers_scored` 钉死「answer_unscored 在场⇒禁 completed」）——**本刀挂点在收尾事务外围·三分支内部零触**（该注记所指「混合面 completed+照计」语义改写=P3·影子计量按现行语义**照实记录**）。
3. **INDEX 七 `:46` 影子计量候选挂点已被取代**：交叠矩阵载「影子计量挂 invoke trace 区（invoke.ts `:358-364`·同文件异区）」——bill1 §8 裁决项②已行使「worker 侧挂点+recordUsageSoft fail-soft 先例·ai-runtime 零触」并落主线（三挂点 `:322/:512/:668`）——本刀沿 worker 侧同族惯例·**invoke.ts 零触**（其 validUsage 现位 `:365-368` 区·INDEX 锚 ±数行漂移如实登记）。
4. **迁移编号链登记（本节承题）**：INDEX 七 `:43` 定谳 0170-0173=billing 战役自用——实测主线 **0170/0171 已落**（bill1）·**0172/0173 空=留 P3 结算刀**（本刀 Ban 清单钉死零触零创建）·0174（刀 B）/0175（刀 C）/0177（AG-COST2）/0178（AG-E）已并主线·max=**0178**·**本刀若裁决①A（影子表形）出新表则占 `0179`**·0176 缺号如实登记（仓内缺号先例 0164 同形·**顺延不回填·勿添重号**）。
5. **meter_version 预留兑现点**：question-usage-ledger.ts `:38-39` 注释明载「P1 恒 NULL，影子计量刀（P2）起填」——本刀填值（推荐 `'shadow-v1'`）即该预留的**唯一兑现**·recordUsage 函数体零改（meterVersion 入参/透传 `:39`/`:74` 已在场·调用面传值即可）·0171 表 `:27` 列已落·**零迁移即可启用该列**。
6. **bill1 EXEC errata 继承**：bill1-topic-fields:prove 实 **27 臂**（LEDGER `:420` errata「EXEC 28 臂虚报实 27」在案）——本刀既有门原值断言按 27 引；bill1 并线三文件 union 冲突并集解先例（`:420` errata 同行）=本刀并线预检参照。

## §1 红事实（影子计量缺位链·全 @`d6ee387c` 实测·源=billing-redesign README §7/§13-4/§11-3+LEDGER `:420`）

### 1.1 影子计量缺位：三问今天无法回答（蓝本 §7 步③+§13-4 在案）

①**每场话题数分布**——无任何数据面：0170 三列已落但零消费，`SELECT count(DISTINCT topic_id) FROM interview_question WHERE …` 的分布直方图（1/2/3/…/≥6 话题场各占比）今天不存在；②**计费与成本相关性**——0171 ledger 已按 topic_id 归集 tokens 成本，但「若按话题计费将收多少分 vs 实际烧多少 token」的对对面零落点；③**封顶 6 是否合适**——「每场命中封顶的场数占比」零数据（蓝本 §13-4 明载此为无法核实 #4·需影子期数据；§11-3 封顶终值=唯一残面开放点·裁决④「封顶 6」亦以影子期复核为条件）。三问共同前置=**影子计量行落地面**，即本刀。

### 1.2 topic_charge 不存在：计费模拟只能影写·不能真写

0172 topic_charge+interview 计费列（billing_mode/billing_cap_units）**未落**（INDEX 七 `:43` 定谳留 P3·主线 ls 实测 0172/0173 空）——按话题计费的任何落表今天没有合法住地；「只算不扣」（README §7 步③原文）的唯一实现=**独立影子面**（影子表或 metric·不入 topic_charge·不建 0172）·且零 commerce 触面（reserve/confirm/release/sweep 全零调用·entitlement 桶零读写）。

### 1.3 收尾语义现行面：影子计量的计量口径必须照实（不改写）

收尾三分支现位 `:509-541`（complete+confirm/complete+no_eligible/fail+release）+0046 触发器钉死「answer_unscored 在场⇒禁 completed」（AG-F 注记 `:504-508`）——蓝本 §3.2 计费规则（跳过 0 分/出题失败该话题 0 分/unscored 该话题 0 分·已完成话题照收=裁决③）在**现行收尾语义下并未全部生效**（混合 unscored 场仍 fail+release 全退）——影子行必须**按现行语义照实记录**（如实反映 fail+release 场的话题分布）·不做任何语义改写（那归 P3·` :504-508` 注记在案）——影子数据恰是 P3 改写前的实测基线。

### 1.4 数据基座已齐（bill1 产物全在主线）·唯缺影子消费面与写钩子

0170 三列（逐题 topic 维度持久化·`persistInterviewQuestion :51` 写入 `:55-59`）+ix_iq_topic partial `:33-34`（逐话题聚合取数面）+0171 ledger（逐调用成本·topic_id/meter_version/usage 列）+meter_version 预留承诺 `:38-39`（「P2 起填」明文）+recordUsageSoft fail-soft 先例 `:204-207`（归集写失败零业务阻断形）——**聚合输入 100% 在线·缺的恰是：谁在收尾时算、算完写哪、怎么查**（§1-修法三件·住地/形/查询式=§8 三裁决）。

## §1-修法三件（影子计量钩子·严格按蓝本 §7 步③「只算不扣」+§6.3 列形 mirror·零扣费零积分零结算·零 topic_charge 创建）

- **①（裁决项①·若影子表形 A 行使）新迁移 0179 独立影子表**：`CREATE TABLE topic_shadow_meter`（列形 mirror 蓝本 §6.3 topic_charge 草案 `:310-336` 降结算语义——owner_user_id/interview_id/topic_id/answers/status（counted/counted_capped/waived/skipped/failed_release·按 §1.3 现行语义照实）/reason + **观测列**（ask_mode/clarify_cause 摘要/话题内 question 数）+ 场级聚合行（session 行·topics_total/topics_counted/topics_waived/sum_uncapped/cap_value=6/cap_hit boolean + 成本对 input_tokens_sum/output_tokens_sum）+ meter_version='shadow-v1' + created_at·PK 幂等键（崩溃重放零重复）+RLS ENABLE+FORCE+p_owner+**只授 SELECT,INSERT**（0171 `:36-42` 形制范本逐字））——历史迁移 0001-0178 零字节。若 B/C 形行使则本件零迁移（§8 裁决项①）。
- **②收尾影子钩子（worker 侧·fail-soft·沿 recordUsageSoft 先例）**：adaptive-lifecycle 收尾 done 臂（`:475-546`）**事务外围**（收尾三分支 `:509-541` 之后·`recordAskedQuestions :543-545` 同区毗邻·fail-soft catch 同形）聚合写影子行——数据源=interview_question（0170 三列按 owner+interview 聚合·topic 分组判 counted/skipped/waived）+question_usage_ledger LEFT JOIN（tokens 成本对）·聚合 SQL 形=§8 裁决项③；**meter_version 兑现**：同事务对 0171 本场行 `UPDATE … SET meter_version='shadow-v1'`？**否**——0171 只授 SELECT,INSERT（`:36`）·meter_version 兑现走**增量路径**：仅当裁决③选 ledger 写面时经 recordUsage 调用面传 meterVersion（`:39`/:74 已在场·函数体零改）·存量 NULL 行零回填（旧行语义保留·沿 0170 零回填先例）。**零三分支内部触**：三分支谓词/收口函数（completeInterviewAndConfirm/failInterviewAndRelease/markApplication*）/enqueueReport 全零改。
- **③零扣费零积分零结算（铁律面·全件贯穿）**：不建 topic_charge/不落 0172/不动 billing_mode（默认 per_session 语义零触）/不动 0173 触发器（未落·亦不预写）/不动 commerce 收口函数（reserve/confirm/release/sweep/reconcile 全零调用零改）/entitlement 桶与 consumption 行零读写/不放松 0046 触发器——影子写失败仅 stderr 观测零业务阻断（fail-soft·蓝本 §6.2「只做成本侧和审计，不参与定价」同源纪律）·计费行为语义零变更（user 可见面零新增）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof**（住地 `apps/worker/test/bill2-shadow-meter.proof.ts`·门名 `prove:bill2-shadow-meter`+root `bill2-shadow-meter:prove`·沿 bill1 proof `:1-17` 头注形+ConsumerDeps 注入+scriptedModelClient 假体+**隔离库真迁移链**（run-e2e-isolated 完整版本化迁移 0001→0179 全链 applied·禁影子 schema）：①**影子行写入臂**：多话题场（pivot×N+probe 追问+clarify 澄清）收尾后场级行在场·topics_total/counted/waived 分类正确·cap_value=6·meter_version='shadow-v1'；出题失败臂→waived+reason；混合 unscored 场→按现行语义 failed_release 照实记录（§1.3）；②**分布聚合臂**：聚合查询返回分布面（话题数直方图桶+封顶命中场判定+Σ vs cap）与成本对（tokens 合计 vs 模拟计分·相关性两列同行可比）；③**幂等臂**：崩溃重放零重复（PK/幂等键去重·重放=false 沿 recordUsage `:77` 返回形）；④**零扣费负臂（本刀命门）**：影子写前后 entitlement_consumption 行零变（status/units 原值）·topic_charge 关系不存在（`\dt topic_charge` 零行·0172 未落亲证）·reserve/confirm/release 调用数与既有门原值恒等·402/409 分码路径零触；⑤**fail-soft 臂**：影子写注错→收尾主链零阻断（返回值/事件流与不注错逐位恒等·stderr 观测在案）。
2. **零行为回归（既有门原值）**：bill1-topic-fields:prove **27/27**（§0.2-6）+interview:prove（root `:255`·57 臂）+adaptive-life:prove+adaptive-flow:prove+reaper:prove 零翻 EXIT=0——收尾三分支/出题评分/生命周期行为语义零变。
3. **迁移纪律（仅裁决①A 时适用）**：git diff 历史迁移 0001-0178 **零字节**+恰一新文件 0179+`sql/` 影子面零改+**migrate:prove（root `:326`）入本刀门表 EXIT=0**+drift:prove（`:434`）EXIT=0；若 B/C 形（零迁移）则本条改记「零迁移亲证」（git status 恰 1 .md+0 迁移）。
4. **typecheck**：turbo typecheck（worker/db 触面包）EXIT=0。

## §3 范围外（边界清单·越界即 FAIL）

1. **0172/0173 结算面=P3 结算刀**：topic_charge 表/interview 计费列（billing_mode/billing_cap_units/ck_interview_cap）/tf_ 触发器改写（0144 函数体）/closeTopic/confirmConsumptionUnits/completeInterviewAndConfirm 部分结算/放弃·走人·sweep·出题失败收口改结算（蓝本 §6.3-§6.4/§7）——本刀零触零预写零创建（含「影子表 mirror 其列形」亦只是形制引用·非提前落 0172）。
2. **0046 触发器放松（混合 unscored completed+照计）=P3**（adaptive-lifecycle `:504-508` AG-F 注记在案）——影子计量按现行收尾语义照实记录·不做语义改写·不新造判据。
3. **§3.13 积分明细列表 API+前端**（用户/企业双端·三账本=entitlement_consumption+topic_charge+question_usage_ledger·INDEX 十三 `:63`）=姊妹面后刀——**影子表不进三账本**（影子面非用户可见账面·零 UI 零 API 零 e2e 产品面）。
4. **2 周观察期=运营面非码面**：本刀交付=钩子+影子面+聚合查询（数据采集能力）；线上分布读数/封顶终值复核报告/§11-2 话题定义认可材料=观察期产出（P3 立项输入·非本刀验收物）。
5. **扩张包 §3.10-§3.12**（押题/诊断/OCR 积分制+主动追问入口+深度研究 premium）/§3.14 语音·RAG 记账缺口（#72 至少 recordUsage 入账面）/B 端残面 application 幂等（P4）——零触。
6. **F15/AG-14 usage 结算口径零再触**（刀 B 已折叠·0174 在主线·usage 列只读归集）；AG-39 org/租户（另刀）·AG-40 检索面（`634eb645` 已修·零触）。
7. **计费行为语义零变更**：billing_mode 默认 per_session·零扣费零退款零结算零积分变动·user 可见面零新增；ai-runtime/invoke.ts 零触（§0.2-3）。
8. **共享 SSOT 只读零改**（product-campaign-LEDGER `:420` P1 行「P2 影子计量待立项」字样/execution-master-checklist/issues-master/billing-redesign 两件/ai-capability-review 四件+INDEX）——本卷不自建 SSOT 行·行翻面权归协调方。
9. est live=0（§6）。

## §4 依赖

**零未决硬依赖·可立即立项**（LEDGER `:420` 「P2 影子计量待立项」承接+INDEX 七 `:46` 「可立即并行面」在案）：①硬前置=**bill1 已落主线**（merge `a1241e90` 双亲 `528c3221`+`b42c4e6b`·SSOT 双登记 `3cd8e63f`/`d6ee387c`）——0170/0171 两迁移+recordUsage+七件接线全在基线 tip（§0.1 blob 锚亲证）·本刀纯消费其产物零改其面；②AG 稳定失败语义轨（INDEX 四建议序「P2 影子→P3 骑在稳定失败语义之上」）——刀 A-F 全部已并主线（`:504-508` AG-F 注记现位亲证）·前置已兑现；③**下游**：P3 结算刀（0172/0173·输入=本刀 2 周影子数据+封顶终值复核）→§3.13 明细列表；④软交叠如实登记：本刀触面=adaptive-lifecycle done 臂事务外围+packages/db 新影子面+worker 新 proof——主线在飞机（worktree list 其余 20 树）与本刀 conclude 区/迁移号零交点（0179 空号亲证·§0.2-4）。

## §5 Ban 列表 + pins（沿 bill1 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign README+LANDING-INDEX/ai-capability-review 四件+INDEX——行与统计只读引用·本刀不自建 SSOT 行·行翻面权归协调方）；**Ban 触 0172/0173 结算面**（topic_charge 零创建/billing_mode/ck_interview_cap/tf_ 触发器/closeTopic/confirmConsumptionUnits/commerce 收口=P3 领地）；**Ban 扣费扣积分结算出手**（影子计量零扣费零积分零结算·reserve/confirm/release/sweep/reconcile 零调用·entitlement 桶与 consumption 行零读写·402/409 分码路径零触）；**Ban 收尾三分支内部触**（`:509-541` 谓词与收口函数零改·挂点仅事务外围 fail-soft·`:504-508` 语义改写=P3）；**Ban 0046 触发器放松**（「answer_unscored 在场⇒禁 completed」钉死不动·影子行照实记录）；**Ban 计费行为语义变更**（billing_mode 默认 per_session 零触·user 可见面零新增）；**Ban F15/usage 结算口径再动**（刀 B 已折叠·model-client/invoke/0174 零触·usage 列只读消费）；**Ban 历史迁移字节改**（0001-0178 零字节+`sql/` 影子零改·新迁移铁律·0176 缺号不回填·勿添重号）；**Ban 0171 存量行回填**（meter_version 存量 NULL 零回填·只走增量兑现路径·§1-修法②）；Ban 触 C 端检索面（AG-40 已修）·Ban org/租户字段出手（AG-39 另刀）；Ban 触其他工作树（5e/i263/entpay/parity2/qsec/ttlwire 等在飞机）；Ban 伪造已问/已验来源；Ban 新 env 闸/新配置面/新定时器（影子钩子随收尾路径常开 fail-soft·零开关——开关面 `billing.interaction.enabled`=P3 §3.9）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全隔离库真迁移链+假体·零模型外呼·零消耗·影子计量本身零生产操作）

## §6 est live=0

本刀零模型真实外呼：新 proof=隔离库真迁移链（run-e2e-isolated 本地临时 PostgreSQL·零生产 DSN/零生产 Key/零凭据落盘）+scriptedModelClient 假体（沿 bill1 proof `:7-8` 形）；typecheck/migrate:prove/drift:prove=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。**2 周观察期系线上运营面·不入本刀 est live 口径**（§3-4）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/bill2-shadow-meter-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts 形留执行席收据·五类标记词不复抄卷内——避免自匹配·沿 bill1/authz-harden/ttl-wire 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（README §7 步③+§11-3+INDEX 十二/十四节系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 六条漂移登记如实在案·主线 tip 再前移照 §0.2-1 协议重钉）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：蓝本边界与现码冲突即停上报（现 tip 重 pin 已核对零冲突——§0.2 六条漂移全系登记性：收尾区行锚漂移三分支语义零变/INDEX 挂点候选被 bill1 裁决实质取代/编号链 0179 空·蓝本 §7 止③「只算不扣」与现码零抵触）。

**待双审/EXEC 裁决项**：①**影子表形**（推荐 **A=独立影子表新迁移 0179**（`topic_shadow_meter`·mirror §6.3 topic_charge 列形降结算语义+场级聚合观测列·RLS 只授 SELECT,INSERT 沿 0171 `:36-42` 形·PK 幂等·2 周观察期时点快照可回放）vs B=既有观测面复用（0177 观测表族/interview_event kind——零新迁移但语义混杂·封顶/分布观测列无处安放·event 流非查询面）vs C=零写面纯聚合查询（零侵入零迁移·但 2 周观察期无留存快照·分布漂移不可回放·旧行清理即失据））；②**metric 住地/挂点**（推荐=**worker 收尾 done 臂事务外围 fail-soft 钩子**（`:475-546` 区·`recordAskedQuestions :543-545` 毗邻同形·每场恰一行·崩溃重放 PK 幂等·零新定时器）vs 独立巡检任务（reaper 式定时——**违 §5 Ban 新定时器**·如行使须先裁 Ban 例外）vs topic 关闭逐题即时写（pivot 时点逐 topic 写——图内触面深·并发重放面大·不推荐））；③**聚合查询源**（推荐=**interview_question 主源**（0170 topic_id 分组+status/answer 判 counted/skipped/waived·ix_iq_topic `:33-34` 取数面现成）**+question_usage_ledger LEFT JOIN**（tokens 成本对·一次聚合双列同出）vs ledger 单源（缺 skipped/waived 判定面——answer 语义在题目表更全）vs 双源独立交叉核对（一致性好但存储×2·读面×2·不推荐））；附**meter_version 填值**（推荐 `'shadow-v1'`·§0.2-5 预留兑现·存量 NULL 零回填）。

---

*BILL2-SHADOW-METER REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`d6ee387c`（主线 tip·git log -1 实测·开工即落卷零前移）· 分支 `line/bill2-shadow-meter` · 工作树 `meetwise-bill2`（git worktree add 本起草席立·建前 worktree list 21 树+branch 双查+rg 三查不存在）· 立项出处=billing-redesign README rev1（blob `cd4c060f`·532 行·§7 上线序 `:411` 步③影子计量 2 周只算不扣/工作量 `:413`/§13-4 `:520`/§11-3 `:490`/§3.3 `:140`/§6.3 `:310-336` mirror 源）+LANDING-INDEX（blob `0694ff22`·七 `:46`+十二 `:50-57`+十四 `:66-70`）+product-campaign-LEDGER（blob `c0c13fee`·`:420` P1 nail 收官+P2 待立项承接行）+issues-final（blob `dac7f58c`·只读）· 防重三查过· §0 blob 锚表 18 行 ls-tree 亲算+§0.2 漂移六条如实登记（基线零前移/收尾区 `:442-488`→`:475-541` 漂移三分支语义零变/INDEX invoke trace 挂点候选被 bill1 裁决②实质取代/编号链 max=0178·本刀 0179·0176 缺号不回填/meter_version 预留 `:38-39` P2 起填兑现点/bill1 27 臂 errata 继承）· 红事实四链（影子计量缺位三问零数据/topic_charge 不存在只能影写/收尾现行语义照实不改写/数据基座已齐唯缺影子消费面）· 修法三件（0179 影子表若裁决①A/收尾事务外围 fail-soft 钩子+meter_version 增量兑现/零扣费零积分零结算铁律）· 断言候选四条（五臂新 proof 含零扣费负臂+既有门原值 bill1 27/57/迁移纪律条件适用/typecheck）· est live=0 · pins 十一值照抄 · markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

---

## §9 EXEC 附记（随翻·append 保史·§0-§8 原文零改·2026-10-12）

**Status 翻面（append）**：**`executed:awaiting_post_prove_dual`**——EXEC 施工+随翻完成·全门绿·⛔push·待 post-prove 双审两外席（alone≠dual·Ban self-approve）。

**施工落点（恰 10 文件：新 3+改 7）**：新=packages/db/migrations/0179_topic_shadow_meter.sql（127 行·零历史迁移触）+packages/db/src/model-op/topic-shadow-meter.ts（writeTopicShadowMeter/SHADOW_METER_VERSION/SHADOW_METER_CAP·单语句 CTE 聚合）+apps/worker/test/bill2-shadow-meter.proof.ts（44 臂）；改=packages/db/src/index.ts（导出区 additive 4 行）+apps/worker/src/adaptive-lifecycle.ts（import+writeShadowMeterSoft+2 调用点）+apps/worker/src/adaptive-interview-service.ts（import+3 挂点 meterVersion 传值）+apps/worker/package.json+根 package.json+scripts/run-e2e-isolated.mjs（四处注册只增不清沿 AG-C）。

### §9-1 并线重 pin（§8-③ 照本节协议行使）

- **并线**：`git merge feat/mysql-schema-skeleton` @`d31be795`→merge commit `1670f885`（d6ee387c..d31be795 恰 5 笔=qbank-control-sec 链 AG-41/42/43+0176+P5）·**零冲突**（merge-tree 预检 0 冲突标记·实际 merge 零冲突·本支恰 1 .md 零码动）。
- **迁移链重 pin**：主线 0176 已由 qbank-control-sec 补齐（`0176_qbank_control_plane_authz_closeout.sql`·363 行）→链 max=**0178** 零变·**0179 为链上首个空号**·本刀占用（§0.2-4 勘误见 §9-2 E2）。
- **§0.1 blob 锚复核**：施工面 8 件全零漂（adaptive-interview-service `1f1efa9c`/adaptive-lifecycle `de3c26a5`/question-usage-ledger `94f170a7`/db index `929d7271`/interview-question `d542ed5c`/0171 `0948ef93`/bill1 proof `e5212b46`/worker pkg `a869a261`）·**漂移恰 2 件=注册面**：根 package.json `09c759be`→`eac01a19`（qbank-control-sec:prove 两行插入 :371 区）+run-e2e-isolated.mjs `91f24742`→`bb65c7f9`（qbank 四点注册插入）——bill1 四点注册行锚随之后移：:681-683→**:688-700**·:1890→**:1914**·:2119-2120→**:2146-2147**·:2800→**:2827**（结论零变·只增不清沿 AG-C）。

### §9-2 勘误注（登记级·结论零变）

- **E1（基线重钉）**：§0 基线 `d6ee387c`→并线后 `d31be795`（5 笔全系 qbank-control-sec·排除 ai-docs 后码面触 main.ts/qbank-release-sweep/worker 测试/两 pkg/0176/db 测试/runner——与本刀十件面零交·§0.2-1 协议行使）。
- **E2（0176 缺号登记过时）**：§0.2-4「0176 缺号不回填（0164 同形）」→主线已由 qbank-control-sec 补齐 0176——**本刀影子表仍占 0179**（原勘误「本刀若占则 0179」结论零变·勿添重号纪律零变）。
- **E3（收尾区行锚零漂确认）**：§0.1 adaptive-lifecycle `de3c26a5` merge 后零漂亲证→done 臂 `:475-546`/三分支 `:509-541`/AG-F 注记 `:504-508`/recordAskedQuestions `:543-545` 行锚零变（§0.2-2 漂移就此封账）。
- **E4（「出题失败」终态双路径勘误）**：§1-修法②挂点只载 done 臂——施工实测 generation 终态（genQuestion fail-closed→`writeGenerationUnavailable`）在投影事务内 `return`、**不经过 done 臂 conclude 块**——「收尾事务外围」按全路径兑现=**两调用点**（done 臂 `recordAskedQuestions` 毗邻+出题失败 `writeGenerationUnavailable` 提交后·均 fail-soft 同形）；start 臂出题失败（首题前）零 `interview_question` 话题行=诚实零写·不挂钩。现行为如实登记·非语义新增。
- **E5（迁移改号 0179→0180·post 席勘误·零码动 docs-only+迁移文件名改）**：post 审实测本刀原占号 0179 已被主线 AG-D 刀**合法实落**并线（`0179_ag_d_release_refused_claim.sql` @`ccf3e7e7`·本刀 post 席1 据此 FAIL=并线撞号非本刀码面瑕疵）——0180 全场空闲（主线+22 worktree 零占）·**协调方裁定 0180 归本刀**。行使：`git mv` `0179_topic_shadow_meter.sql`→`0180_topic_shadow_meter.sql`+文件内自引改号（首行文件名注+编号行·历史迁移 0001-0178 零字节铁律零变）+runner 注册面本门 sourcePaths 路径串随改（回执写手逐 sourcePath 读文件哈希·旧路径 ENOENT 即门红=迁移文件名自引机械承重·恰 2 行零逻辑零行为）；**门复证 `bill2-shadow-meter:prove` EXIT=0**（44 臂全过+回执落盘·隔离库真迁移链含 0180 在案）。本 REQUEST §0-§8 及 §9 既有行文中 0179 字样全系改号前史录·append 保史零改写；proof/码注释内 0179 字样同=史录（零码动纪律不触）。结论零变：影子表形 A/列集/RLS/幂等键/§9-4 门表全数承继（§9-4「0001→0179」=改号前实测史录）。

### §9-3 §8 三裁决行使（全按卷推荐）

- **①影子表形=A（独立影子表新迁移 0179 `topic_shadow_meter`）**——2 周观察期时点快照可回放（B=event 流非查询面/封顶分布观测列无处安放；C=零留存不可回放·均按卷否决理由）。列集 mirror §6.3 降结算语义：零 units/零 commerce/零 entitlement 列零触发器；status 五值（counted/counted_capped/waived/skipped/failed_release·§1.3 照实）；**行 kind 双型**（topic 行 mirror §6.3 主键三元组+session 行场级聚合观测·幂等键 idem_key PK(owner,interview,idem_key) 沿 0171 :33 同形）；RLS ENABLE+FORCE+p_owner+只授 SELECT,INSERT（0171 :36-42 形制范本逐字）。**列集增补如实登记**：session 行 REQUEST 三计数列（topics_total/counted/waived）外增补 topics_capped/topics_skipped/topics_failed_release 三列（五分类守恒迁移 CHECK 承重·§2-①②分布直方图与 Σ 守恒所需·零结算语义）。
- **②metric 住地/挂点=worker 收尾事务外围 fail-soft 钩子**（recordUsageSoft 先例同族）：`adaptive-lifecycle` writeShadowMeterSoft 两调用点（§9-2 E4 全路径）·零新定时器·每场恰一行·PK 幂等崩溃重放零重复；数据源=裁决③·读面全为收尾事务**提交后**照实终态。
- **③聚合查询源=interview_question 主源+question_usage_ledger LEFT JOIN+interview 终态读面**——单语句 CTE（q 聚合→terminal→ranked（有效作答话题按首题 turn 升序 rn·封顶序）→judged（五分类 CASE）→agg（场级五分类计数+Σ）→tok（tokens 合计））→topic 行+session 行 UNION ALL 一次 INSERT·ON CONFLICT DO NOTHING·返回首写布尔（recordUsage :77 同形）。有效作答判定=answer_evaluated 事件（COALESCE(outcome,'answered')<>'unresolved'·收尾 eligible 谓词同形）——'跳过'/unresolved 不计有效。
- **附 meter_version='shadow-v1'**（`SHADOW_METER_VERSION`）：增量兑现=三挂点调用面传值（plan/ask/eval·含失败臂同 entry）·0171 函数体零改零迁移·存量 NULL 零回填（writer 全文零 UPDATE·42501 live 负臂在 proof）。

### §9-4 门 EXIT 全表（EXEC 亲跑·2026-10-12）

| 门 | EXIT | 数 |
|---|---|---|
| bill2-shadow-meter:prove（新·run-e2e-isolated 隔离库真迁移链 0001→0179） | 0 | 44 PASS·连跑两遍稳定 |
| bill1-topic-fields:prove（回归） | 0 | 27/27 原值（errata 继承） |
| interview:prove（回归） | 0 | 57/57 原值 |
| adaptive-life:prove（lifecycle 触面回归） | 0 | 全过 |
| reaper:prove（回归） | 0 | 全过 |
| migrate:prove | 0 | 全过 |
| drift:prove | 0 | schema 无漂移 |
| turbo typecheck --force | 0 | 3/3·0 cached |
| docs:check | 0 | 80 files+2032 public text |
| runner node --check + 双 package.json JSON parse | 0 | — |
| markers（五类·改动集 9 码件） | 0 | 新增行零命中（`xit\(` 模式命中 runner 既有 `process.exit(` 六处=既有行非本刀新增·如实注） |

### §9-5 陷阱自检 13 条

1. **影子表零扣费负臂**：proof ④——B 场 consumption confirmed+settled=1.00（per_session 既有·非按话题比例 r2(1×1/6)）+影子写落定前后 consumption JSON 逐位恒等 ✓
2. **零 commerce 触面**：改动码面 grep reserve/confirm/release/sweep/reconcile/entitlement 命中仅 2 注释行（铁律注记）·零函数调用零 import ✓
3. **零结算面**：0172/0173 零创建（ls 亲证）·interview 计费列三缺（information_schema 零行）·零 ck_interview_cap 零 tf_ 改写零 billing_mode 出手 ✓
4. **fail-soft**：REVOKE INSERT 注错→F 场 completed+report 照常+事件流与对照场 B 逐键恒等+影子行零写入+stderr `topic_shadow_meter_write_failed` 在案+权限复原 ✓
5. **越面自查**：触面恰十件（§9 落点）·ai-runtime/invoke.ts 零触（§0.2-3）·commerce.ts 零触·收尾三分支内部零触（钩子均事务外围）·共享 SSOT 零改（LEDGER :420 行翻面权归协调方）✓
6. **pins 十一值**：照抄零翻（NOT_HA/false/false/true/8/false/PG-retained/503/false/false/actualSpendCny=null）✓
7. **状态行**：append 翻面 executed:awaiting_post_prove_dual·§0-§8 原文零改 ✓
8. **回滚**：单 commit revert 即全退（新 4 文件随 revert 消失·改 6 面回原 blob）·影子表独立零数据风险 ✓
9. **停止条件**：未触发（§0.2 六条全系登记性·并线零冲突·蓝本 §7 止③「只算不扣」与现码零抵触）✓
10. **历史迁移**：0001-0178 零字节（git diff 亲证·0176 系并线主线带入非本刀新增）+sql/ 零改（git status 零行）+恰一新迁移 0179 ✓
11. **meter_version 存量**：writer 全文零 UPDATE/DELETE 语句（grep=0）·42501 UPDATE/DELETE live 负臂·增量仅调用面传值 ✓
12. **0046**：触发器 `trg_interview_scoring_completion_integrity` 在场断言（proof ④）+混合 unscored 场实证 failed 照实（C 臂）·零放松 ✓
13. **est live=0**：全门 run-e2e-isolated 临时 PG 隔离容器（迁移全链亲跑）+scripted 假体零模型真实外呼+fixture 直写臂零生产触+零 secrets 零消耗（pins 脚注 actualSpendCny=null 同源）✓
