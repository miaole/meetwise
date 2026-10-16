# BILL1-TOPIC-FIELDS REQUEST（billing 战役 P1 起草刀 · 0170 题目表补话题 + 0171 question_usage_ledger 消耗归集 + clarify_cause 透传 + usage_missing 打标行 ledger 衔接 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。

**席位**：billing 战役 P1 起草席（billing-redesign 蓝本 rev1 nail 收官（merge `925b6cfc`·LEDGER 刀位图行刷新 `09768397`）后实施刀首卷·INDEX 第七节定谳「P1 字段迁移（0170/0171 纯加列）=可立即并行面」承接·协调方常设 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `09768397`（`09768397dbe19b07715988a70498f3f4273245de`·主线 tip·`git log -1` 实测·billing-rev nail 后 SSOT commit·零码面——开工首测 `4978f729` 后主线前移三 commit 全 docs·`git diff --name-only 4978f729..HEAD` 排除 ai-docs 后为空亲证·**基线按落卷时 tip 重钉**·§0.2-1）。分支 `line/bill1-topic-fields`·工作树 `meetwise-bill1`（`git worktree add ../meetwise-bill1 -b line/bill1-topic-fields` 本起草席已立·建前 `git worktree list` 无 bill1 树+`git branch --list "*bill1*"` 空输出+`rg -l "bill1-topic-fields" ai-docs/` 零命中三查亲证·HEAD 落 `09768397` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：蓝本两层+议题卷全部精读引用——①`ai-docs/delivery/billing-redesign/README.md`（blob `cd4c060f`·**rev1 定稿 532 行**·rev `1a332e5e` 已并主线 merge `925b6cfc`）**§6.1 0170 题目表补话题 `:276-286`**（三列 SQL 草案+topic_id 填充语义「主问题填自己的 question_id，追问和澄清填主问题的。旧行为空 = 不按话题计费」+ask_mode 源+clarify_cause「需要 assess 返回一个原因字段」）+ **§6.2 0171 question_usage_ledger `:288-309`**（消耗归集表草案 SQL 全列「只做成本侧和审计，不参与默认方案定价；§3.13 明细列表数据源之一」+相对原稿更正（删 attempt_no/system_retry/replay/billable）+RLS ENABLE+FORCE+owner 策略+**只授 SELECT、INSERT**）+ §6.5 函数表 recordUsage 行（写归集行·PK 冲突忽略）+ §6.6 接入点（decide.ts/generate-question.ts 写 topic_id/ask_mode·adaptive-interview-service 透传 clarify_cause）+ §7 改动影响范围（0170/0171 迁移行+P1 行 `:413`）；②同目录 `LANDING-INDEX.md`（blob `0694ff22`·70 行）：**第七节验证定谳 `:41-47`**（**迁移新号定谳 0170-0173 `:43`**——0152-0155 全被占·重号先例在案「勿再添重号」+AG×billing 交叠矩阵 `:46`「**可立即并行面**=…+P1 字段迁移（0170/0171 纯加列）+影子计量挂 invoke trace 区（:358-364·同文件异区）」+硬前置=刀 B（F15 折叠）**已兑现**）+ **第十二节用户裁决落值 `:50-57`**（四裁决：默认方案采纳/方案②按比例/异常收口全建议包/扩张包）+ **第十三节追加裁决 `:60-63`**（两扩权·积分明细列表必做升 P1 面 `:63`·数据源=entitlement_consumption+topic_charge+question_usage_ledger 三账本）+ **第十四节 rev1 落卷 `:66-70`**（仍开放面仅余话题定义认可+封顶终值）；③`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c`）：**AG-14 `:202-211`**（F15 同案·usage 三口径——刀 B 已折叠落主线·本刀只做打标行进 0171 ledger 的衔接）+ **AG-39 `:478-487`**（qbank 表无 org/租户字段=另刀领地·本刀只加 topic 维度）+ **AG-40 `:489-496`**（C 端检索双轨——已由 `634eb645` QBANK-CORPUS 修复·本刀零触检索）。

## §0 现状锚（起草席亲读·base `09768397`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list` 建前 21 树实测（主仓+5e/aga/agb/agc/agd/age/agf/authz/billrev/blite/cost1/cost2/e2sc/i263/i6/entpay/parity2/qsec/ttlwire）——**无 bill1 树**（billrev=蓝本 rev 席树·零交叠）。
- `git branch --list "*bill1*"` 建前空输出——**无同名分支**。
- `rg -l "bill1-topic-fields" ai-docs/` **零命中**（harness 188 卷无同名刀卷；billing-redesign 两件+ai-capability-review 四件系蓝本登记卷非刀卷）。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`09768397`）

| 文件 | blob（8 hex·括号全 40 hex） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0021_interview_question_identity.sql` | `c9060761`（`c906076199239673384b701acbea91ca1b4e189f`） | **interview_question 现形 `:6-22`**：列=owner_user_id/interview_id/question_id/state_version/turn/question/competency/qkind/status/answer_id/answer_hash/created_at/answered_at——**无 topic/父题/ask_mode/clarify_cause 列**；PK `(owner_user_id,interview_id,question_id)` `:20`·uq_interview_question_open（partial·status IN issued/queued）`:24`·**GRANT SELECT,INSERT,UPDATE `:26`+RLS ENABLE+FORCE+p_owner 策略 `:27-32`**（0171 RLS/GRANT 形制范本） |
| `packages/db/migrations/0037_ai_model_invocation_durable_claim.sql` | `9916a37e`（`9916a37e6ae104bc5481c5d333686de1ec0d83a9`） | idempotency_key `:9`·**PK `(owner_user_id,idempotency_key)` `:26`**（ledger PK 同形=崩溃重放天然去重·蓝本 §6.2 更正行） |
| `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a`（`1922910a79daf5c8c4059b4faa4d37293acba969`） | estimate_input_tokens 补列头注 `:5`·identity-immutable 注 `:9`（ledger estimate 列的现 tip 证据面） |
| `packages/db/migrations/0174_ag06_settled_failed_usage_source.sql` | `e7097491`（`e709749121263c38caed227e6cc12030b83fb575`） | **刀 B 产物=主线现 max 迁移**：ai_model_invocation.usage_source 列 CHECK `('usage_missing')`（NULL=真实 usage）——本刀 usage_missing 打标行 ledger 衔接的唯一上游面（零再触·只读消费） |
| `packages/ai-graphs/src/adaptive-interview/nodes/decide.ts` | `b7e12ae0`（`b7e12ae028a55f899923a64e1e8533c782fc68d5`·36 行亲读） | **clarify 臂 `:7-25`**（route 只携 competency/difficulty/qkind——**无 mode**·`:17-24`）·decideNext+rememberDecision `:26-27`（action.mode 落 mind.lastDecision）·**route 返回 `:28-35`**（两臂同无 mode——修法③扩携点） |
| `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `7c614e49`（`7c614e495abe8a1a4abee95fc62b2dca2c417309`·111 行亲读） | **issueQuestionId `:10-12`**（`q-v${stateVersion}-t${turn}-c${clarifyAttempts}`）·clarify 复用原题零模型调用 `:54-57`·failClosed `:14-26`（刀 F 领地·零触）·**pending 构造 `:90-109`（questionId 发射 `:93`）——topic_id 派生点** |
| `packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts` | `aeba291f`（`aeba291f3ccbff4f37ce2c8d04aa6ddf9b3bf8b9`·181 行亲读） | isNonAnswer 图侧确定性 `:46`·**两因合流点 `:47-52`**（`:50` `nonAnswer: deterministicNonAnswer \|\| relevant === false`——答非所问与引文核验失败同形）·**clarify 臂 `:52-90`**（clarify 指令 `:57-65`——cause 流转目标）·unresolved 臂 `:92-113` |
| `packages/ai-graphs/src/adaptive-interview/state.ts` | `b8c4d2c0`（`b8c4d2c0d4bb27d8cbf9dcd0f55842a3ac13385a`） | transcript `:156`·route `:157`·clarify 指令 `:161`·pending `:162`（topicMainQuestionId 新字段 additive 位）——C14 边界：identifier/枚举与 questionId 同类可 checkpoint·facts/原文禁入 |
| `packages/domain/src/adaptive-interview.ts` | `5ceedd2d`（`5ceedd2d42183bd8cca0dc3f15ba4774f2426522`） | **ask action `mode: 'probe' \| 'pivot'` `:90`**（ask_mode 源·蓝本锚零漂亲证）·MAX_CLARIFY=1 `:155`·TurnVerdict `:313`·classifyTurn `:315-321`（nonAnswer→clarify `:319`）·markClarify `:323-326`（clarifyAttempts+1·turn+1——**澄清/追问都发新 question_id 的机制根**） |
| `apps/worker/src/adaptive-interview-service.ts` | `001ec000`（`001ec000649f291e90ad6feb18a8361cf2d75c66`·577 行亲读） | plan 键 `${threadId}:plan` `:276`·attempt≠0 拒+ask 键 `:337-342`·初诊键 `:444/:446`（**只有 turn 无 question_id**）·re-roll 键 `:452`（`:gr{k}`）/:492（`:r{k}`）·**assess `:528-573`**：剥离后非作答 `:534`·eval 键 `${threadId}:eval:q:${questionId}:v:${stateVersion}:t:${turn}` `:539-547`·**quote_repair_exhausted→relevant=false `:550-552`**（rev1 载 `:551` ±1 吻合）·unscored `:553`·**relevant=false 返回无 cause 字段 `:569-572`**（rev1 载 `:567-572` 吻合） |
| `apps/worker/src/interview-service.ts` | `bee3c139`（`bee3c139648d6e0a880ce8abed8e06e5fc86ddb3`） | baseIdempotencyKey `:141`·invokeEvaluationOnce `:164-165`（evaluationIdempotencyKey 按答案摘要派生——usage 挂点③的键源） |
| `apps/worker/src/adaptive-lifecycle.ts` | `5cfce9be`（`5cfce9be32c866782019bc37b565bfb57b60c5bb`） | **persistAndEmitQuestion `:212-230`（persistInterviewQuestion 调用 `:214`）**·answer 投影下一题 persist `:341`——两 persist 点均**在收尾三分支区 `:442-488`（rev1 重锚·刀 E/P3 冲突区）之外**（`:230`/`:341` < `:442` 亲读核）；question_ready 事件 additive 可选字段先例=`:223-229` plannedTurns（#256 形制 A） |
| `packages/db/src/interview/interview-question.ts` | `627182c3`（`627182c31f311363ce834f085fd1ea2a079f8484`·132 行亲读） | **persistInterviewQuestion `:42-63`**（INSERT `:46-48` ON CONFLICT DO NOTHING+identity conflict 抛 `question_identity_conflict` `:52-62`——扩列同形点·崩溃重放幂等不变）·claimInterviewAnswer `:69-96`·markInterviewAnswerApplied `:112-123`（零触） |
| `packages/db/src/model-op/ai-cost-governance.ts` | `1efb8d96`（`1efb8d969cf38aa2a7542dda6abae632db3cc1b5`） | **settleAiTextCost `:61-65`**（成本侧 db 写函数形制范本——recordUsage 同文件族同形：SQL 函数调用面+类型化返回） |
| `packages/db/src/model-op/model-invocation.ts` | `165eeefd`（`165eeefd6fbeb6f21152333dd82a1ac667a97460`） | completeModelInvocation 第 10 参 usageSource（刀 B 面·零触只读） |
| `packages/ai-runtime/src/invoke.ts` | `eda87ce0`（`eda87ce0044a894c573da3dabfe5062ed6b00a1d`） | usageSource 类型 `:53-56`·validUsage `:365`·settle 透传 `:857/:884/:936/:990`——**刀 B 领地全貌·本刀零触** |
| `packages/ai-runtime/src/model-client.ts` | `c4827e8d`（`c4827e8d72f85c24df3967a4ce8f1b6a41b29483`） | **usage_missing 打标 `:698-717`**（字段缺失按上限补齐+`:715` usageSource='usage_missing'·绝不按 0）——AG-14 折叠已落主线实证（零再触） |
| `apps/worker/test/interview.proof.ts` | `645ec783`（`645ec7839f2a1aed9ba7efe09d4f36713bbc4665`） | 头注 `:1-5`（**run-e2e-isolated 完整版本化迁移**=隔离库真迁移链形制+MemorySaver+scriptedModelClient·禁影子 schema）·**ConsumerDeps 注入形 `:95-104`**（新 proof 住地形）·dispatchTick 驱动 `:110/:152` |
| `packages/db/test/migrate.proof.ts` | `d3162013`（`d31620137f479ac8de30691c2dc3ef1e1df2d53c`） | migrate:prove 本体（刀 B rev2 §0.3-6 教训：**迁移面改动必跑并入门表**） |
| 根 `package.json` | —（grep 亲证） | interview:prove `:250`·migrate:prove `:317`·drift:prove `:425`·adaptive-flow:prove `:492`（回归门注册名） |
| 蓝本两件+议题卷（只读引用） | README `cd4c060f` / LANDING-INDEX `0694ff22` / issues-final `dac7f58c` | 见卷首立项出处行锚 |

### 0.2 漂移登记（蓝本锚=意见书 rev1 `1a332e5e`（对齐 tip `133acba6`）→ 落卷 tip `09768397`·结论零变·EXEC 重 pin 时同协议处理）

1. **主线 tip 会话内前移+基线重钉**：起草开工首测 `4978f729`（LEDGER 批3 收官）→ 落卷前实测 **`09768397`**（billing-rev nail merge `925b6cfc`+checklist `1b7c00ae`+LEDGER 刀位图刷新 `09768397`·三 commit 全 docs 零码面亲证）——本卷基线按落卷时 tip 重钉 @`09768397`·§0.1 全 blob 以新 HEAD 亲算（码面 blob 与 `4978f729` 逐位恒等·`git diff --name-only` 排除 ai-docs 后为空）。
2. **蓝本以 rev1 为权威**：起草初读 README 系 rev 前版（472 行·迁移号 0152-0155 草案）→ rev1 `1a332e5e` 已并主线=532 行定稿（迁移草案重排 0170-0173+§6.1 clarify_cause 锚更新 `:551,567-572`+§7 P1 行含积分明细列表）——本卷 §6.1-§6.2/§7 全按 rev1 引用；INDEX 含第七节验证定谳+十二/十三/十四节。
3. **迁移编号链登记（本节承题）**：INDEX 七 `:43` 定谳 **0170-0173=billing 战役自用**（0170 题目表补话题/0171 question_usage_ledger/0172 topic_charge+interview 计费列/0173 tf_ 触发器改写）——实测主线 `0170-0173` 空闲·max=**0174**（刀 B `0174_ag06_settled_failed_usage_source` 已并主线）·0175=刀 C（`line/ag-c-requeue` @`114f7189` 在飞未并线·协调方编号分配「billing 0170-0173/刀B 0174/刀C 0175」在案）——**本刀占用 0170+0171·0172/0173 留 P3 结算刀**·0176 起顺延·勿添重号。
4. **AG-39/AG-40 关联现状 pin**：AG-39（qbank 迁移 0013/0029/0031 无 org_id/tenant·issues-final `:478-487`）=qbank-acl 另刀领地——本刀只加 topic 维度**不加任何 org/租户维度**（interview_question 现无 org 列亦非本刀范围）；AG-40（C 端检索双轨·`:489-496`）已由 `634eb645`（QBANK-CORPUS EXEC·已并主线）修复——本刀零触检索（cragRetrieve/localRetrieve/qbank 检索面零改）。
5. **蓝本行锚漂移（结论零变）**：decide.ts rev1 载 `:17-24`（澄清分支）→ 现位 `:7-25` 臂整体/`:17-24` route 返回（零语义漂）；generate-question `:88-92`（issues-final 载）→ 现 **`:10-12`**（issueQuestionId）/**`:89-93`**（questionId 发射）；`adaptive-interview.ts:90`（mode）**零漂**亲证；adaptive-interview-service rev1 载 `:551,567-572` → 现位 `:550-552`/`:569-572`（±1 吻合）；issues-final blob `dac7f58c` 与刀 B/C 立项时零漂。
6. **F15=AG-14 已由刀 B 折叠落主线**：0174 usage_source 列+model-client `:698-717` 打标（字段缺失按上限补齐绝不按 0）+invoke `:53-56` 类型/`:884`/`:990` 透传——usage 三口径在解析层已收口；**本刀零再触 F15**·唯一关联触点=「usage_missing 打标行进 0171 ledger」的衔接面（ledger usage_source='missing' 映射·§1-修法⑦）。

## §1 红事实（机制链现 tip 重 pin·全 @`09768397` 实测·源=billing-redesign README §1.3/§6.1-§6.2+issues-final AG-14/39/40）

### 1.1 话题维度缺失链：一道题=一串 question_id·成本归集只能拆字符串

逐行链（现 tip 行号）：①出题幂等键 `${threadId}:ask:t${turn}:0` **只有 turn 无 question_id**（`:446`·attempt≠0 直接拒绝 `:337-342`·re-roll 键 `:452`/`:492` 亦只到 turn）——模型调用账面无法直连题目行；②**澄清和追问都发新 question_id**：issueQuestionId `:10-12`=`q-v${stateVersion}-t${turn}-c${clarifyAttempts}`·stateVersion 每次 +1、澄清时 turn 也 +1（markClarify `:323-326`）——一个话题（主问题+追问+澄清）在系统里是**一串 question_id**；③interview_question 表无话题/父题列（0021 `:6-22` 亲读）——按话题归集（蓝本默认方案计费单位）与按题目审计在今天**只能拆字符串+turn 反查**（蓝本 §1.3 定谳原文）。④规划/评分键面：plan `${threadId}:plan` `:276`·eval 带 questionId `:539-547`——三调用点键形异构，无统一 topic 维度。

### 1.2 澄清双因不可分：relevant=false, score=0 在图中同形（蓝本风险 H）

evaluate-answer **合流点 `:50`**：`nonAnswer: deterministicNonAnswer || relevant === false`——①**用户答非所问**（图侧确定性 isNonAnswer `:46`·assess 内剥离后非作答 `:534`）与②**引文核验失败**（assess `:550-552` `quote_repair_exhausted`→relevant=false「评分证据无法逐字核验」）在图中完全同形（TurnVerdict clarify `:319`·score=0/relevant=false）——均消耗每题唯一一次澄清机会。**clarify_cause 无源字段**：assess 返回形状 `:569-572` 只有 score/evidence/relevant/hasHook/dispositions（蓝本 §6.1 修法原文「需要 assess 返回一个原因字段」）。影子计量（P2）与 P3「系统出错话题不收钱」都依赖此区分——本刀立字段与透传，不改任何判定语义。

### 1.3 关联现状定界（AG-39/AG-40/F15 三案零纠缠）

①**AG-39**（表无 org 字段·issues-final `:478-487`）=qbank-acl 另刀——本刀只加 topic 维度；②**AG-40**（C 端检索双轨）已由 `634eb645` 修复并主线——本刀零触检索；③**AG-14/F15** 三口径已由刀 B 折叠落主线（0174+model-client `:698-717`+invoke `:53-56`）——usage_missing 打标行在 ai_model_invocation 已落位，**本刀只做「打标行进 0171 ledger」衔接**（§1-修法⑦）。

### 1.4 usage 现面（0171 列适配基座·蓝本 §6.2 草案为底按现 tip 适配）

ai_model_invocation：PK `(owner_user_id,idempotency_key)`（0037 `:26`·**崩溃重放天然去重**）·input_tokens/output_tokens（0037）·estimate_input_tokens（0119 `:5`/`:9`·identity-immutable）·usage_source（0174：NULL=供应商真实 usage/'usage_missing'=打标）。蓝本 §6.2 草案 usage_source 四值 `('provider','estimate','missing','not_applicable')` 与 0174 单值短码的映射如实登记：**ledger 行 usage_source='missing' ↔ 上游打标行 'usage_missing'**（同义·词汇差异非冲突）。

### 1-修法七件（严格按蓝本 §6.1-§6.2 草案+§6.6 接入点·改造面=两新迁移+decide/generate-question/evaluate-answer/state/assess/persist/recordUsage·零结算语义零检索触）

- **① 新迁移 0170（纯加列）**：`ALTER TABLE interview_question ADD COLUMN topic_id text / ask_mode text CHECK (ask_mode IN ('pivot','probe','clarify')) / clarify_cause text CHECK (clarify_cause IS NULL OR clarify_cause IN ('non_answer','quote_unverifiable'))`（蓝本 §6.1 SQL 草案逐字为底）+索引（**形状=裁决项①**：蓝本草案 `CREATE INDEX ix_iq_topic ON interview_question(owner_user_id, interview_id, topic_id)`·推荐 partial `WHERE topic_id IS NOT NULL`——旧行为空不入索引）。历史迁移 0001-0174 零字节。
- **② 新迁移 0171（新表）**：`CREATE TABLE question_usage_ledger`（蓝本 §6.2 SQL 草案为底·列按现 tip usage 面适配=§1.4：owner_user_id/invocation_key/interview_id/question_id/topic_id/operation_id/cause 九值 CHECK（system_ask/system_score/system_plan/retrieval/report/generation_failed/unknown/admission_rejected/user_answer）/answer_len/meter_version/input_tokens/output_tokens/estimate_input_tokens/usage_source 四值 CHECK/created_at·**PK(owner_user_id,invocation_key) 沿 0037 :26 同形**）+RLS ENABLE+FORCE+p_owner 策略（0021 `:27-32` 形制范本）+**只授 SELECT,INSERT**（0021 `:26` GRANT 形撤 UPDATE——归集表只增不改）。
- **③ decide.ts 写 ask_mode**（蓝本 §6.6 接入点）：route 扩 mode——非澄清臂 `:28-35` 携 action.mode（domain `:90` 'probe'|'pivot'）·澄清臂 `:17-24` 携 'clarify'——纯枚举标识符入图 state（C14 边界=与 questionId 同类 identifier·非 facts 非原文）。
- **④ generate-question 写 topic_id**（蓝本 §6.6 接入点）：pending 构造 `:90-109` 派生——pivot 主问题 topic_id=**新发 questionId 自己**+state 增 `topicMainQuestionId`（纯标识符·state.ts `:157-162` additive 形）；probe/clarify 臂=**继承主问题 id**；澄清重发 `:54-57` 零模型调用面 topic_id 同继承。旧行为空=不按话题计费语义保留（零回填）。
- **⑤ assess 透传 clarify_cause**（蓝本 §6.1 修法原文）：assess 返回形状扩**纯附加 cause 字段**（`:550-552` quote_repair_exhausted→'quote_unverifiable'）；图侧 deterministicNonAnswer 臂（`:46`）直派 'non_answer'——两源在合流点 `:50` 拆分后随 clarify 指令（`:57-65`）流转至 pending。**cause 字段纯附加：relevant/score/evidence/dispositions 既有值逐位不变·两因判定语义零变**（源字段形状=裁决项③）。
- **⑥ persist 接线**：interview-question.ts persistInterviewQuestion `:42-63` 扩三列写入（INSERT `:46-48`+identity conflict 检查 `:52-62` 同形扩·ON CONFLICT DO NOTHING 幂等不变）·adaptive-lifecycle 两 persist 点（`:214`/`:341`）透传 pending 新字段——均在收尾三分支区 `:442-488`（刀 E/P3 冲突区）之外·question_ready 事件 additive 可选字段沿 `:223-229` plannedTurns（#256 形制 A）先例。
- **⑦ recordUsage+worker 归集**（蓝本 §6.5 recordUsage 行+§6.6 接入点）：db 侧 recordUsage（INSERT … ON CONFLICT DO NOTHING·PK 冲突忽略——蓝本 §6.5 原文·形制沿 settleAiTextCost `:61-65` 同文件族）+worker 挂点（**=裁决项②**·推荐 adaptive-interview-service 三调用点：plan `:276`/ask `:444-526`（idempotencyKey 变量现成·含 re-roll 终值）/assess `:539-547`（eval 键）——失败臂同写入 cause='generation_failed'/'unknown'/'admission_rejected'）·**ai-runtime 零触**；usage_missing 衔接：上游打标行（0174）对应 ledger 行 usage_source='missing'（§1.4 映射）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof**（住地 `apps/worker/test/bill1-topic-fields.proof.ts`·门名 `prove:bill1-topic-fields`·沿 interview.proof `:1-5` 头注+`:95-104` ConsumerDeps 注入形+scriptedModelClient 假体·**隔离库真迁移链**=run-e2e-isolated 完整版本化迁移 0001→0171 全链 applied·沿 G7FIX-4R `62747d74` proof/entpay 0-c 隔离库先例）：①**迁移臂**：0170 三列在场+CHECK 拒非法值（ask_mode 第四值/clarify_cause 非空第三值 INSERT→23514）+索引在场；0171 PK/RLS FORCE（他 owner 读零行）+app_role 仅 SELECT/INSERT（UPDATE/DELETE→42501 拒·migrate.proof privilege 断言形）；②**topic_id 填充臂**：pivot 主问题行 topic_id=自己 question_id·probe 追问行=主问题 id·clarify 重发行=主问题 id+ask_mode='clarify'；③**clarify_cause 双因臂**：非作答→'non_answer'·引文核验失败→'quote_unverifiable'（**score/relevant/evidence 既有值逐位零变负臂**）；④**usage 账本臂**：plan/ask/eval 三调用各落一行·同键崩溃重放零重复（PK 去重）·usage_missing 打标行 usage_source='missing'·失败臂 cause 正确；⑤**旧行兼容臂**：0170 前存量行 topic_id IS NULL（零回填·不按话题计费语义保留）。
2. **零行为回归（出题/评分既有门原值）**：interview:prove（root `:250`·blob `645ec783`）+adaptive-flow:prove（`:492`）+reaper:prove 既有臂零翻 EXIT=0——出题/评分/生命周期行为语义零变（mode/topic/cause 全系纯附加字段）。
3. **迁移纪律**：git diff 历史迁移 0001-0174 **零字节**+恰两新文件 0170/0171+`sql/` 影子面零改+**migrate:prove（root `:317`·`d3162013`）入本刀门表 EXIT=0**（刀 B rev2 教训：迁移面改动必跑）+drift:prove（`:425`）EXIT=0。
4. **typecheck**：turbo typecheck（ai-graphs/worker/db 触面包）EXIT=0。

## §3 范围外（边界清单·越界即 FAIL）

1. **0172/0173 结算面=后刀（P3 结算刀）**：topic_charge/interview 计费列（billing_mode/billing_cap_units）/tf_ 触发器改写/closeTopic/confirmConsumptionUnits/commerce 收口/放弃·sweep·出题失败结算（蓝本 §6.3-§6.4/§7·骑 AG 稳定失败语义之上）——本刀零触。
2. **影子计量=P2 刀**（以本刀 0170/0171 字段为输入·挂 invoke trace 区 `:358-364` 同文件异区·INDEX 七 `:46` 在案）。
3. **F15/AG-14=刀 B 已折叠**（0174 在主线）——usage 结算口径零再触·打标值只读消费。
4. **AG-39 org/租户字段**（qbank-acl 另刀）；**AG-40 C 端检索面**（`634eb645` 已修·零触）。
5. **§3.13 积分明细列表 API+前端**（rev1 升 P1 面·INDEX 十三 `:63`）=P1 姊妹面后刀——其数据源之一 question_usage_ledger 本刀只落表（topic_charge 未落·明细页待 P3 后）；API/前端/e2e 产品面零触。
6. **计费行为语义零变更**：billing_mode 默认 per_session 语义零触·本刀无任何扣费/退款行为变更；§11-2 话题定义认可+封顶终值=用户决策项（rev1 §14 仍开放面）——本刀按蓝本默认话题定义（§3.1：主问题+同能力追问+澄清）施工·若裁决变更由后刀适配。
7. **共享 SSOT 只读零改**（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign 两件/ai-capability-review 四件+INDEX）——本卷不自建 SSOT 行·行翻面权归协调方。
8. est live=0（§6）。

## §4 依赖

**零未决硬依赖·可立即并行**（INDEX 七 `:46` 定谳「P1 字段迁移（0170/0171 纯加列）=可立即并行面」）：①硬前置刀 B（F15 折叠=步②直接消费）**已兑现**（0174 已并主线·§0.2-6）；②刀 E（AG-10 守卫）/刀 F（出题失败终局）两项硬前置系 **P3 同函数区**（adaptive-lifecycle `:442-488`）冲突——本刀两 persist 点（`:214`/`:341`）在该区之外·零冲突；③**软交叠如实登记**：刀 A（崩溃续跑·`line/ag-a-resume` 在飞未并线）与本刀同触 adaptive-lifecycle.ts（异区）·刀 F 与本刀同触 generate-question.ts（failClosed `:14-26` 区 vs pending 构造 `:90-109` 区·异区）——沿「先落者为准·后到者 §0 重 pin」惯例互认；刀 C（requeue·consumer/jobs 面）零文件交点；④**下游**：P2 影子刀（输入=本刀 topic 维度+ledger 形）→P3 结算刀（0172/0173 续编号）→§3.13 明细列表（0171 为三账本数据源之一）。

## §5 Ban 列表 + pins（沿 ag-b/ag-c 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/billing-redesign README+LANDING-INDEX/ai-capability-review 四件+INDEX——行与统计只读引用·本刀不自建 SSOT 行·行翻面权归协调方）；**Ban 触 0172/0173 结算面**（topic_charge/billing_mode/tf_ 触发器/closeTopic/commerce 收口=P3 领地）；**Ban 影子计量出手**（P2 领地）；**Ban 计费/结算行为语义变更**（本刀纯加列+纯附加字段·零行为变更）；**Ban 触 C 端检索面**（AG-40 已修 `634eb645`·cragRetrieve/localRetrieve/qbank 检索零改）；**Ban org/租户字段出手**（AG-39 另刀）；**Ban F15/usage 结算口径再动**（刀 B 已折叠·model-client/invoke 零触·打标值只读消费）；**Ban 历史迁移字节改**（0001-0174 零字节+`sql/` 影子零改·新迁移铁律）；**Ban 评分语义外改**（assess cause 字段纯附加·relevant/score/evidence/dispositions 既有值逐位不变·两因判定零变）；Ban 触其他工作树（aga~agf/billrev 等在飞机）；Ban 伪造已问/已验来源；Ban 新 env 闸/新配置面/新定时器；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全隔离库真迁移链+假体·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=隔离库真迁移链（run-e2e-isolated 本地临时 PostgreSQL·零生产 DSN/零生产 Key/零凭据落盘）+scriptedModelClient 假体；typecheck/migrate:prove/drift:prove=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/bill1-topic-fields-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts 形留执行席收据·五类标记词不复抄卷内——避免自匹配·沿 authz-harden/ttl-wire/ag-b/ag-c 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（billing-redesign rev1+INDEX 第七/十二/十三/十四节系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 六条漂移登记如实在案·主线 tip 再前移照 §0.2-1 协议重钉）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：蓝本边界与现码冲突即停上报（现 tip 重 pin 已核对零冲突——§0.2 六条漂移全系登记性·蓝本 rev1 锚与现码 ±1 行内吻合）。

**待双审/EXEC 裁决项**：①**索引形状**（推荐=蓝本列序 partial `WHERE topic_id IS NOT NULL`——旧行为空不入索引·逐话题聚合/明细查询面覆盖 vs 蓝本草案全行索引 vs 影子期看查询面再定暂不加）；②**recordUsage 挂点**（推荐=worker 侧 adaptive-interview-service 三调用点（plan/ask/assess·键变量现成·失败臂同写）·ai-runtime 零触 vs invoke 关口可选 interview 上下文参数——后者动 ai-runtime 契约面·16 操作调用方全查）；③**clarify_cause 源字段**（推荐=assess 返回显式 cause 字段（蓝本 §6.1 原文）+图侧 deterministicNonAnswer 直派·两源合一流经 evaluate-answer `:50` 拆分 vs 消费面从 evidence 字符串派生（脆弱·不推荐））。

---

*BILL1-TOPIC-FIELDS REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`09768397`（主线 tip·git log -1 实测·会话内前移重钉·§0.2-1）· 分支 `line/bill1-topic-fields` · 工作树 `meetwise-bill1`（git worktree add 本起草席立·建前 worktree list 21 树+branch 双查+rg 三查不存在）· 立项出处=billing-redesign README rev1（blob `cd4c060f`·532 行·§6.1 `:276-286`/§6.2 `:288-309`/§6.5-§6.6/§7 P1 `:413`）+LANDING-INDEX（blob `0694ff22`·七 `:41-47` 迁移号 0170-0173 定谳+交叠矩阵+十二/十三/十四节裁决）+issues-final（blob `dac7f58c`·AG-14 `:202-211`/AG-39 `:478-487`/AG-40 `:489-496`）· 防重三查过· §0 blob 锚表 21 行 ls-tree 亲算+§0.2 漂移六条如实登记（tip 4978f729→09768397 会话内前移全 docs/rev1 蓝本换轨/编号链 0170+0171 本刀·0172-0173 留 P3/AG-39 另刀 AG-40 已修 634eb645/蓝本锚 ±1 吻合/F15 刀 B 已折叠）· 红事实四链现 tip 重 pin（话题维度缺失=ask 键只到 turn+澄清追问发新 question_id+表无 topic 列/澄清双因 :50 合流无 cause 源字段/AG-39·40·F15 三案定界/usage 现面=0171 列适配基座）· 修法七件（0170 三列+索引/0171 归集表 RLS 只授 SELECT,INSERT/decide 写 ask_mode/generate-question 写 topic_id 主问题=自己·追问澄清=主问题 id/assess 透传 cause/persist 两点接线/recordUsage 归集+usage_missing='missing' 衔接）· 断言候选四条（隔离库真迁移链五臂新 proof/出题评分既有门原值/迁移纪律+migrate:prove 入门表/typecheck）· est live=0 · pins 十一值照抄 · markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

---

## §9 EXEC 附记（随翻·append 保史·§0-§8 原文零改·2026-10-12）

**Status 翻面（append）**：**`executed:awaiting_post_prove_dual`**——EXEC 施工+随翻完成·全门绿·⛔push·待 post-prove 双审两外席（alone≠dual·Ban self-approve）。

### §9-1 并线重 pin（§8-③ 照本节协议行使）

- **并线**：`git merge feat/mysql-schema-skeleton` @`8603dc65`→merge commit `0d4a13ca`（09768397..8603dc65 恰 7 笔=AG-C 链 e410cf31/539e2b46/5be1d213/114f7189/928b2612/477f589a/8603dc65）·**零冲突**（本支恰 1 .md 零码动·主线码面触 interview-consumer/interview-jobs/0175/run-e2e-isolated/package 零交本刀七件面）。
- **0170/0171 避撞双席亲证**：`git ls-tree feat/mysql-schema-skeleton packages/db/migrations/ | grep -cE "017[01]_"`=0（主线全树零占）·主线 max=**0175**（刀 C `0175_interview_job_next_attempt_at` 已并主线·§0.2-3「在飞未并线」登记就此过时如实更新）·0176 起顺延勿添重号。
- **§0.1 blob 锚 19 行全量复核**：merge 后 HEAD 逐文件 `git ls-tree` 亲算——**19/19 blob 零漂**（码面 0021/0037/0119/0174/decide/generate-question/evaluate-answer/state/domain/service/interview-service/lifecycle/interview-question/ai-cost-governance/model-invocation/invoke/model-client/interview.proof/migrate.proof 全零漂）。

### §9-2 勘误注（登记级·结论零变）

- **E1（席2 勘误落实·evaluate-answer.ts 行锚诚实更锚）**：§0.1 载 `isNonAnswer :46`/两因合流点 `:47-52`（`:50`）/clarify 臂 `:52-90`（指令 `:57-65`）/unresolved 臂 `:92-113` 系**旧版行锚**——现 tip（blob `aeba291f` 零漂·181 行亲读）诚实更锚=**isNonAnswer `:55`/两因合流 `:99-102`（合流行 `:101` `nonAnswer: deterministicNonAnswer || relevant === false`）/clarify 臂 `:103-133`（指令 `:108-116` 区）/unresolved 臂 `:134-155`**。§1.2 与 §1-修法⑤ 内「合流点 `:50`」同源随更 `:101`（机制结论零变：两因在 classifyTurn 输入处同形，本刀在合流点拆分显式 cause）。
- **E2（0175 并线更新）**：§0.2-3 载「0175=刀 C 在飞未并线」→ 现已并主线（merge `928b2612`·blob `ac234d44`）——§0.2-3 编号链登记以本节为准：billing 占 0170+0171·0174=刀 B·0175=刀 C 已落·0172/0173 留 P3 结算刀·0176 起顺延。
- **E3（新 proof 门名对漂后注册名单重 pin）**：门名=`bill1-topic-fields:prove`（root package.json `:263`）+`bill1-topic-fields:prove:raw`+worker `prove:bill1-topic-fields`（`:21`）——run-e2e-isolated.mjs 注册名单**恰四点 additive**（isolatedReceiptSources 条目/worker prove 白名单行/命令映射臂/migrateWithRecovery 名单行），沿 AG-C 白名单**只增不清**（既有条目逐字节零改·post-drift 名单亲读后插入）。

### §9-3 §8 三裁决行使（按推荐）

1. **裁决项①索引形状=推荐行使**：`ix_iq_topic(owner_user_id, interview_id, topic_id) WHERE topic_id IS NOT NULL`——蓝本列序+partial 谓词（旧行为空不入索引·逐话题聚合/明细查询面覆盖）。
2. **裁决项②recordUsage 挂点=推荐行使**：worker 侧 `adaptive-interview-service` 三调用点——plan（`${threadId}:plan` 键提变量零串变）/ask（`generate()` 包装罩初诊 `:0`+`:gr{k}`+`:r{k}` 全体键）/assess（`primaryIdempotencyKey` 实发键=答案摘要派生面）+失败臂同写（`usageCauseForInvokeError`：MODEL-OP-02 零外呼拒绝族 model_circuit_*/concurrency/budget→`admission_rejected`·余→`generation_failed`；eval 失败臂→`unknown`）——**ai-runtime 零触**；usage 列不二次记账：`recordUsage`（`packages/db/src/model-op/question-usage-ledger.ts`）按 invocation_key 从 `ai_model_invocation` 单语句 LEFT JOIN 归集复制（`usage_missing`→`missing`·tokens NULL→`provider`/`estimate`/`not_applicable` 判定式§1.4 映射）；危机触发短路臂（零外呼）不入账；归集写 fail-soft（蓝本 §6.2 成本侧不参与定价·写失败仅 stderr 观测零业务阻断）。
3. **裁决项③clarify_cause 源字段=推荐行使**：assess 返回显式 `clarifyCause` 字段（`:550-552` quote_repair_exhausted→`quote_unverifiable`·`:534` 剥离后非作答第三源→`non_answer`·纯附加既有值逐位不变）+图侧 `deterministicNonAnswer`（`:55`）合流点（`:101`）拆分直派 `non_answer`；模型判跑题（relevant=false 无钉因）cause 缺省 undefined→列 NULL。

### §9-4 断言门 EXIT 全表（终态代码亲跑·est live=0 全假体/隔离库零生产 DSN 零 Key 零外呼）

1. `bill1-topic-fields:prove` **28/28 PASS EXIT=0**（五臂：①迁移臂 0170 三列+CHECK 负臂 23514×2+ix_iq_topic partial+0171 PK/RLS FORCE/app_role 仅 SELECT,INSERT+UPDATE/DELETE 42501 live 负臂+跨 owner RLS 零行；②topic_id 填充 pivot=自己/probe=主问题 id/clarify=主问题 id+ask_mode='clarify'（全链 scripted·隔离库真迁移链 175 applied）；③clarify_cause 双因 non_answer/quote_unverifiable+既有 score=50 逐位零变负臂+澄清事件 payload 六键零泄漏；④usage 账本 plan/ask/eval 落行+PK 去重重放 false+usage_missing→'missing'+provider/estimate/not_applicable 四值映射+失败臂 generation_failed；⑤旧行三列 NULL 零回填）。
2. `interview:prove` **57/57 EXIT=0**（原值）；`adaptive-flow:prove` **EXIT=0**（原值）；`reaper:prove` **28/28 EXIT=0**（原值）——出题/评分/生命周期行为语义零变（mode/topic/cause 全系纯附加字段）。
3. `migrate:prove` **EXIT=0**（真迁移链含 0170/0171）；`drift:prove` **EXIT=0**。
4. turbo typecheck **3/3 EXIT=0**（--force 全真跑）+worker 裸 tsc **46=既存基线零新错**（触面文件唯一预存错 adaptive-lifecycle :189 系基线在案项·本刀零新增）。
5. 迁移纪律：`git diff` 历史迁移 0001-0175 **零字节**+恰两新文件 0170/0171+`sql/` 影子面零改+runner `node --check` EXIT=0。
6. `docs:check` **EXIT=0**（80 文件+2012 扫描）；markers **零命中**（改动集新增 190 行五类标记词族扫描零命中·词族不复抄卷内）。
7. est live=0 收据：新 proof=隔离库临时 PostgreSQL（run-e2e-isolated 完整版本化迁移·零生产 DSN）+scriptedModelClient 假体+上游 usage 行经生产形 claim/dispatch/complete 函数铸造（0088 state guard 禁直插）；零模型真实外呼·零 secrets 落盘·零消耗（pins 脚注 `actualSpendCny=null` 同源）。

### §9-5 陷阱自检（13 条）

①历史迁移 0001-0175 零字节（git diff 亲证）✓；②0170/0171 避撞（并线前后双查零占·编号链 E2 更新）✓；③零行为变更（出题/评分/生命周期三门原值+billing_mode/tf_/topic_charge/commerce 结算面零触）✓；④旧行 topic_id 空=不按话题计费语义保留（存量行 NULL 零回填臂+identity conflict 对 NULL/undefined 恒等·qbank-miss 既有 caller 零改兼容）✓；⑤F15 零再触（model-client/invoke/0174 零字节零行改·打标值只读消费=recordUsage 归集映射唯一触点）✓；⑥越面自查（触面=两迁移+db index/ledger/persist+ai-graphs 四件+worker 三件+runner/package 注册——SSOT/账本/检索面 cragRetrieve/localRetrieve/qbank/org 字段/env 闸/定时器/依赖包全零触·他工作树零触）✓；⑦pins 十一值照抄零翻（actualSpendCny=null 维持）✓；⑧状态行 append `executed:awaiting_post_prove_dual`（§0-§8 原文零改）✓；⑨回滚=列不用/停写（蓝本 §7 回滚栏原语义·0170/0171 纯加列新表零破坏性）✓；⑩停止条件未触发（蓝本边界与现码零冲突·唯一漂移=evaluate-answer 行锚已按席2 勘误诚实更锚 E1）✓；⑪双审链如实载（pre-exec 双审 BOTH PASS+协调方常设 loop 授权=开工条款·post-prove 双审在途）✓；⑫markers=0+docs:check EXIT=0（卫生门双绿）✓；⑬est live=0 逐 prove 零外呼口径（假体+隔离库）✓。

*EXEC 席随翻 · 2026-10-12 · merge `0d4a13ca`（并线）→ 施工 commit 本卷 · §0-§8 原文零改 · ⛔push · 待 post-prove 双审两外席 · alone≠dual · Dual PASS ≠ merge*
