# AG-F — 失败语义轨刀 F：AG-02 残面·出题四类单发终场有界 re-roll（EXEC REQUEST）

**Status**: ~~`draft:awaiting_pre_exec_dual`~~ → **`executed:awaiting_post_prove_dual`**（EXEC 施工+随翻落卷·⛔push 待 post-prove 双审。pre-exec 双审两外席 BOTH PASS 落协调方 + 协调方常设 loop 授权后开工；施工随翻见卷末 §9 EXEC 随翻（§0 重 pin 勘误注+五裁决行使+门全表）。Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push）

**席位**：meetwise 战役失败语义轨**刀 F**起草席（AG-02 残面·EXPERT-REVIEWS §七 A 席六刀之第六刀·「骑刀 B+预留上限」）。
**基线**：`feat/mysql-schema-skeleton` @ `2bc4e2bd`（开工 tip·docs(ssot) AG+计费战役刀位图立节·`git log -1` 实测）。分支 `line/ag-f-reroll` · 工作树 `meetwise-agf`（`git worktree add ../meetwise-agf -b line/ag-f-reroll 2bc4e2bd` 仓根同级·本起草席已立·建前亲证：`worktree list` 15 树无 agf·`branch -a` 零同名——仅 `line/g7fix4-reroll-exec` 系 G7FIX-4R 旧执行线与本刀位名无关）。
**防重对表（亲证）**：`rg -n "ag-f" ai-docs/delivery/harness/` → 零命中；`ls ai-docs/delivery/harness/ | grep -i ag-f` → 零同名刀卷（`g7fix4-reroll.md` 系同域先例非同名）。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-02（总览 **:14**·条目 **:70-78**·file:line **:75**·触发例子 **:76**·修法①②③ **:78**）②同目录 `LANDING-INDEX.md` **§二 :17 双席验证定谳**（撞题+grounded-refs 两子面已被 `62747d74`/`202b6c1a` 修复——**残留面=schema 失败/critique 不过/供应商 unknown/评分失败四类单发终场+attempt≠0 禁令**）③同目录 `EXPERT-REVIEWS.md` **§七 :65 刀 F 行（修法权威：schema/critique/business 失败有界 re-roll·复用 62747d74 参数化骨架·耗尽换 competency 不终场·骑刀 B+预留上限）** + **§二-3 :18 重试预留放大**（每 roll 各冻结一份静态 max 预留——上限必须设且与 AG-11 联动）④同目录 `review-log.md` AI-01 **:12** / PF-F-08 **:61** / **:150**（「换幂等键重试」须同换 operation.businessRevision 否则 0085/0130 逻辑节点槽位拒绝）⑤`ai-docs/delivery/harness/product-campaign-LEDGER.md` **:415**（刀 F 待起草骑刀 B）/:411（刀 B 在途）⑥形制沿 `g7fix4-reroll.md`（同域先例·62747d74 REQUEST 全文）+ `ag-cost1-bleed-observe-REQUEST.md`（§0-§8 形制·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `2bc4e2bd`·file:line/blob 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 blob 锚表（@`2bc4e2bd`·`git ls-tree` 实测·12 位短 blob）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `apps/worker/src/adaptive-interview-service.ts` | `001ec000649f` | **re-roll 主触面**：:22 AskSchema / :30 `MAX_DUPLICATE_REROLL=2` / :36 `MAX_GROUNDED_REFS_RETRY=2` / :337-342 attempt≠0 闸 / :423-444 参数化 `generate(idempotencyKey, businessRevision)` 闭包 / :449-465 `:gr{k}` grounded-refs 有界重试 / :466-474 **单发 error 判死臂（四类手术位）** / :481-516 判重 re-roll 循环 / :553 assess unscored 返回 |
| 2 | `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `7c614e495abe` | 图节点判死面：:14-26 failClosed（concluded:true）/ :64-69 failure 闸 / :70-82 **critique 闸（seam 包界外）** |
| 3 | `packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts` | `aeba291f3ccb` | **unscored→concluded 臂 :67-90**（裁决项③面）/ :29-51 answer_artifact 臂（范围外零触） |
| 4 | `packages/ai-graphs/src/adaptive-interview/graph.ts` | `0c0a0dd296f2` | :52 `concluded→'conclude'` 路由（终场消费面·零触背景） |
| 5 | `packages/domain/src/question-generation.ts` | `b87966ce332d` | :6-16 错误码表 / :45-56 classifyQuestionGenerationError / :31-34 provenance `reroll?` 轨迹字段（62747d74 类型级先例·零迁移）/ :58-67 unavailableGeneration |
| 6 | `packages/ai-runtime/src/model-operation-registry.ts` | `63af556fd166` | :243 注释原文「any retry requires a new revision and therefore a new, auditable node」/ :245 resolveModelOperation / :69 question-generation maxDispatches:1 |
| 7 | `packages/ai-runtime/src/invoke.ts` | `647e0aa952f0` | :624 同键 `claim.action==='cached'` 返回原 output（**同键重掷=缓存回放同错**·零码动负证背景） |
| 8 | `packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql` | `cbc07c09e1ab` | :271-273 同 revision 异键→`canonical_invocation_mismatch`（**零迁移**·proof 负证背景） |
| 9 | `packages/db/migrations/0130_model_invocation_same_key_claim_join.sql` | `239a0b19aea4` | :128-150 logical_node 拒绝（:140 `error_code='logical_node_'‖header_decision`） |
| 10 | `packages/db/src/memory/memory-store.ts` | `4ec7fc62da99` | :33-35 normalizeQuestion / :39-44 episodeSeen 精确匹配（判重复检既有闸·每 roll 重过） |
| 11 | `apps/worker/src/interview-service.ts` | `bee3c139648d` | :164 invokeEvaluationOnce / :187 `{status:'failed'}` 臂（unscored 源头·**零触背景**） |
| 12 | `apps/worker/src/adaptive-lifecycle.ts` | `5cfce9be32c8` | :25 generationFailureOf / :49 writeGenerationUnavailable（判死终场消费面·零触背景） |
| 13 | `apps/worker/test/g7fix4-reroll.proof.ts` | `c9982ab8764a` | 既有 reroll proof 25 臂（本刀新 proof 形制蓝本+回归门） |

### 0.2 漂移登记（复核快照 `2fab7946` → 现树 `2bc4e2bd`·全亲读重 pin）

| 复核快照锚（issues-final :75/review-log :150） | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| generate-question.ts :14-26,64-81 | :14-26（failClosed 本体零漂）+ :64-69（invoke+failure 闸）+ :70-82（critique 闸·C14 注释 +1 行） | 微漂·结论不变 |
| adaptive-interview-service.ts :86-91（attempt≠0 拒绝） | **:337-342**（:333-336 注释自证「must never issue another provider request for the same logical node」） | 大漂（RESUME-GROUNDING/qbank/CRAG 增量插入）·结论不变·任务书 :337-344 锚 ±2 在注释区 |
| 同文件 :167-175（错误→unavailable） | :466-474 | 同上 |
| 同文件 :178-187（wasAsked→duplicate 判死） | :481-516——**已被 62747d74 改写为有界 re-roll 循环**（判死收窄至 :515-516 耗尽臂） | 与 LANDING-INDEX §二 :17「撞题子面已修」定谳吻合·本刀**不重写**（§3-1） |
| evaluate-answer.ts :66-89（unscored→concluded） | :67-90 | +1 行·结论不变 |
| 0130 :135-145（同 businessRevision 新键被拒） | :128-150（同区） | 微漂·结论不变 |
| 出题 businessRevision=`${threadId}:ask:t${turn}`（review-log :150 引基线 :151） | :444 `generate(`${d.threadId}:ask:t${turn}:0`, `${d.threadId}:ask:t${turn}`)`（key 带 `:0` 后缀·revision 裸形） | 键形零变·行号漂 |

### 0.3 现势并发登记（强制）

1. **刀 B（AG-06·`line/ag-b-classify`@`2a2fee56`）EXEC 落码修复中未落主线**（LEDGER :411「post 席1 FAIL 已修待重递」）——本刀语义前置（§4）：刀 B 落定前 `external_outcome_unknown` 族边界未定界。两刀**零文件交点**（刀 B=model-client/invoke 分类管道·本刀=worker seam+ai-graphs 节点）·刀 B 落主线时本刀照 §0 重 pin 语义锚。
2. **刀 A（`line/ag-a-resume`@`1df39e6e` REQUEST rev2 在途）/刀 C（rev 0175 在途）**：触 adaptive-lifecycle/interview-consumer 面·与本刀触面（adaptive-interview-service.ts/generate-question.ts/evaluate-answer.ts）零交点亲证。
3. 起草窗口内主线 tip=`2bc4e2bd`（工作树建树时点）·本卷全部 blob/行号即 @该 tip 实取。

## §1 红事实 + 修法

### 红事实 A：四类单发终场链（现 pin @`2bc4e2bd` 全亲证）

| 类型 | 现链（逐段 file:line） |
|---|---|
| **① schema 失败** | 模型输出违 AskSchema（:22 zod）→ invoke 返 `schema_validation_failed` → :466-474 **单发** `unavailableGeneration(classifyQuestionGenerationError(...))`（→`schema_invalid`·question-generation.ts:50）→ 图节点 :67-69 `isQuestionGenerationFailure`→failClosed（:14-26 `concluded:true`）→ graph.ts:52 `conclude` → **整场终场** |
| **② critique 不过** | 图节点 :70-82 `critiqueQuestion` 拒 → failClosed（origin unavailable/business_invalid/`question_critique_failed`）→ `generation_business_invalid` → concluded。**seam 结构性不可见**：critique 在 ai-graphs 节点消费 `state.transcript` asked 集·在 worker seam（retrieveAndGenerate）返回 ok **之后**——62747d74 骨架（全封闭 seam 内）无通路 |
| **③ 供应商 unknown** | classifyQuestionGenerationError `external_outcome_unknown`（question-generation.ts:51）/provider_timeout/malformed 族 → 同 :466-474 **单发** → failClosed → concluded（AG-06 交界：刀 B 落后 HTTP200+usage 确定性输出失败归 settled_failed·族边界收窄见 §4/裁决项④） |
| **④ 评分失败** | assess → invokeEvaluationOnce（interview-service.ts:164·:187 `failed` 臂）→ adaptive-interview-service.ts:553 `{status:'unscored'}` → evaluate-answer.ts :67-90 **unscored 臂 `concluded:true`**+transcript `score:null`。**独立链**（evaluate 侧·与出题骨架零交集） |

四类共果：一次可重掷的模型失败=整场提前终场（failInterviewAndRelease 退款/B 端可重试终态）——前面各轮成本作废·用户看到「莫名其妙结束」（issues-final :76-77）。

### 红事实 B：既有 re-roll 骨架解剖（62747d74 @现树 :423-516·为何不覆盖四类）

1. **参数化骨架本体**：:423-442 `generate(idempotencyKey, businessRevision)` 闭包=一次 invoke（schema :427+businessValidate verbatim/grounded-refs/引文 :428-438 全闸在内）；初诊 :444 键 `:ask:t{turn}:0`+revision `:ask:t{turn}`。
2. **触发面窄（核心缺口）**：re-roll 仅由两个 post-response 确定性检查触发——判重 `wasAsked`（:481-516·`:r{k}` 键+revision·上限 `MAX_DUPLICATE_REROLL=2` :30·耗尽 :515-516 判死）与 grounded-refs 闸（:449-465·`:gr{k}`·上限 2 :36·耗尽回退固定模板不判死）。**:466-474 error 早退臂位于两循环之前**——schema/provider/business 错误根本到不了任何 re-roll（单发直判）。
3. **mid-roll 失败也不 re-roll**：:494-498/:501-504 re-roll 途中 provider/schema/引文失败→立即 classify 判死——有界面只保护「初诊成功但撞题」窄窗。
4. **critique 在包界外**：骨架全封闭 worker seam（G7FIX-4R §2.5）·critique 消费 asked 集与 competencyKeywords 而 seam 签名（competency,difficulty,attempt,turn,_legacyFacts,kind）不含 asked——接入须扩 seam 签名或图侧循环（结构改造点·裁决项⑤）。
5. **evaluate 链正交**：unscored 系 assess/invokeEvaluationOnce/evaluate-answer 节点链——出题骨架零触及。
6. **attempt≠0 禁令（:337-342）**：graph→seam 通道恒 0·任何 re-roll 只能经 seam 内部换键+revision 产生新可审计 logical node（registry :243 契约原文+:69 maxDispatches:1 逐节点）——同键=缓存回放同错（invoke.ts:624）·同 revision 异键=canonical_invocation_mismatch（0088:271-273/0130:128-150）——**键+revision 必须双换**（review-log :150 修法修正）。
7. **provenance 轨迹形制既有**：question-generation.ts:31-34 `reroll?: number` optional（零迁移）·:523-524 成功落轨迹/:515-516 耗尽落轨迹。

### §1-修法（EXPERT §七 :65 原文为修法权威：「schema/critique/business 失败有界 re-roll·复用 62747d74 参数化骨架·耗尽换 competency 不终场——骑刀 B+预留上限」）

**① 四类失败接入既有参数化 re-roll 骨架（generate 侧三类：schema/provider-unknown+business 确定性族）**：

- **:466-474 单发 error 臂改有界 re-roll**：确定性失败族（`schema_validation_failed`/`external_outcome_unknown`/provider_malformed/business:*——族边界=**裁决项④**）命中→同 turn 内复用 :423-442 参数化 `generate` 闭包（**本体零改**）换 `:r{k}` 键+同步 revision 重掷→**每 roll 重过全既有确定性闸**（schema/verbatim/引文/grounded-refs+wasAsked 判重复检·:10 blob 闸）→上限内成功→正常 `modelGeneration`（provenance 落 reroll 轨迹沿 :31-34/:523-524 既有形）；耗尽→交②换 competency 臂（臂不接=维持既有判死形状回归）。
- **上限**：缺省沿既有形制 `MAX_DUPLICATE_REROLL=2`（per-turn 计数·跨 turn 不累计·生成调用总数≤3 含初诊）——值与是否统一总帽=**裁决项①**。
- **键空间纪律**：统一 per-turn roll 计数器·`:r{k}` 单调递增零复用（同键重掷=缓存回放同错 invoke.ts:624·键复用撞 0088 canonical mismatch）——判重 re-roll/`:gr{k}`/四类共键空间共计数的编排=EXEC 细化（保持 `:0` 初诊+`:gr{k}` 既有面零碰撞）。
- **预算帽（专家② :18 联动）**：每 roll=独立 logical node 冻结一份静态 max 预留（0088 等值触发器）——per-turn 生成调用总数帽随裁决项①写死进卷·AG-11 预留改革落地前帽即硬上限（专家原话「3 连重试×64k 自己撞 budget_exhausted 回流 AG-01」）。

**② 耗尽→换 competency 继续≠终场（EXPERT :65 原文）**：

- 本 turn competency 的 re-roll 耗尽→**不 failClosed 整场**→路由推进 planner 序下一 competency 重新生成+degraded/事件轨迹落耗尽事实（可审计）；**全序耗尽才真终场**（既有 `assessment_unavailable` 事件/lifecycle 形状字节不变·:12 blob 零触）。
- **实现位=图侧**（route 属 graph state·seam 不知 planner 序——generate-question 节点或路由边·**ai-graphs 包触面**；G7FIX-4R S1 恰 worker 单包·本刀必跨包·如实登记）。concluded 语义纪律：concluded 只在真终场置位（§5 Ban）。
- 换序策略（顺延形/连续 N competency 耗尽帽防循环放大）=**裁决项②**。

**③ unscored 处理（evaluate-answer :67-90 臂）=裁决项③**：

- **(a) 0 分继续（推荐）**：沿计费裁决「该话题 0 分其余照计」家族先例——unscored 臂改 transcript 落 unscored 轨迹按 0 计（`score:null`→0·outcome:'unscored' 保留·mind 不 ingest 该题证据）+继续 decide——单点评分模型失败不再作废整场·该题不计分其余题照常·**账本计费零触**（该题计分面归 0 系图内后果·非账本操作）。
- **(b) 终场维持**（现状零改·呈报选项）。
- 附注：本项**只改图内后果语义**·不改 invokeEvaluationOnce 键/计费结构、**不 re-invoke 评分模型**（§3-6）；answer_artifact 臂（:29-51·工件缺失非模型失败）零触。

**④ attempt≠0 禁令适配面**：

- **:337-342 禁令本体字节零改**（graph→seam attempt 通道恒 0·G7FIX-4R §2.5「图节点 attempt 契约零触」先例）——四类 re-roll 全走 seam 内部键+revision 双换新 logical node·同 logical node 永不二派发语义不放宽半步。
- 适配仅限：注释/注记面（:333-336 注释旁补 re-roll 键族说明）+provenance 轨迹（`reroll` 既有 optional 字段零迁移零 SSOT）。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **新 proof（apps/worker·`prove:ag-f-reroll`·沿 g7fix4-reroll.proof 形制 `c9982ab8764a`——scripted model+真迁移隔离 PG（createPool/assertIsolatedTestTarget/runMigrations）·est live=0）**：
   - **schema 臂**：初诊 scripted 返 schema 违例→`:r1` 返合法新题→ok ∧ 键/revision=`:r1` ∧ invoke 计数=2 ∧ provenance `reroll=1`；
   - **provider unknown 臂**：初诊 `external_outcome_unknown`→`:r1` 成功（若裁决项④(b) 则本臂改判死形状回归）；
   - **critique 臂**：初诊合法但 critique 拒→re-roll 后过 critique→出题成功（断言位随裁决项⑤实现位落定）；
   - **耗尽换 competency 臂**：恒失败模型→上限耗尽→route 推进下一 competency ∧ `concluded=false` ∧ 耗尽轨迹在 provenance/事件；**全序耗尽臂**：全部 competency 耗尽→`concluded=true` ∧ `assessment_unavailable` 形状回归（generationFailureOf 映射 reason 不变）；
   - **unscored 臂**：evaluate scripted `failed`→按裁决项③落定断言（(a)=transcript unscored 轨迹 score 按 0 ∧ `concluded=false` ∧ 后续 turn 照常推进∧其余题计分照常）；
   - **ledger 契约负证（真迁移 PG）**：re-roll 键族各自独立 logical node 过 resolveModelOperation；同 revision 异键→`logical_node_canonical_invocation_mismatch`（0130:128-150/0088:271-273 DB 层坐实）；同键二掷→缓存回放（invoke.ts:624）禁面；
   - **保守面零位移**：`duplicate_check_failed`/`attempt_replay_forbidden`（attempt=1 臂）/判重 re-roll 既有形状/族外判死原样。
2. **既有 reroll proof 回归**：`prove:g7fix4-reroll` 全 25 臂 EXIT 原值（统一计数不得破坏其键空间/耗尽判死断言）。
3. **evaluate/图既有门回归**：`prove:adaptive-life`+memory.proof+adaptive-degrade（G7FIX-4R neg 三键先例）全绿 EXIT 原值·基线同红如实登记不洗。
4. **typecheck**：`turbo typecheck` 全绿（基线口径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **撞题（`:r{k}` 判重 re-roll）与 grounded-refs（`:gr{k}`）两子面=已修**（`62747d74`/`202b6c1a`·LANDING-INDEX §二 :17 定谳）——本刀只做统一计数共存·**不重写不重键**（既有两循环本体零改或仅计数器接线）。
2. **AG-06 四态分类+unknown 预留清算=刀 B**（`line/ag-b-classify` 在途）——model-client/invoke 分类管道/状态机**零触**。
3. **AG-03 报告 `:a{n}`=刀 E · AG-04 requeue=刀 C · AG-01 准入去终态化=刀 D**——零触。
4. **计费 topic_charge/按比例结算=计费战役**（billing rev 卷）——unscored 裁决 (a) 只改图内计分后果·账本/结算/价格行零字节。
5. **AG-02 修法②避重清单**（本场+近 N 场已问题面入 userData）=上下文供给组（受 README B/C 记忆边界约束）——不本刀。
6. **evaluate 侧 re-invoke/键面**（invokeEvaluationOnce 键结构/quote_repair 语义）——零触（unscored 只改图内后果·不重调评分模型）。
7. **answer_artifact_unavailable 臂**（evaluate-answer :29-51·工件缺失非模型失败）——零触。
8. **est live=0**：零真实模型外呼·零生产操作·零 secrets（§6）。

## §4 依赖

- **刀 B（AG-06 分类）先行=硬前置**（EXPERT :65「骑刀 B」）：四态分类（HTTP200+usage 确定性输出失败→settled_failed·允许换 revision 重试）落定前 `external_outcome_unknown` 族语义未定界·re-roll 族边界（裁决项④）无从裁决。顺序依赖非文件冲突：刀 B=model-client/invoke·本刀=worker seam+ai-graphs 节点——**零文件交点亲证**·刀 B 落主线时本刀 EXEC 立项照 §0 重 pin。
- **预留上限联动（专家② §二 :18）**：每 roll 各冻结一份静态 max 预留——帽值随裁决项①进卷·AG-11 三件套落地前帽即硬上限·本刀不做预留改革。
- **刀 A/C/E 正交**：零文件交点（§0.3-2）·先落者不阻本刀·后到者照 §0 重 pin。
- **下游**：G7FIX-4R S2 残登记（critique 场内 duplicate 面）由本刀 critique 臂自然覆盖·落时登记闭环；执行-master-checklist/LEDGER 状态行随 nail 登记（本刀不动）。

## §5 Ban 列表 + pins（沿 authz/ag-cost1 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban re-roll 出确定性失败族（族边界=裁决项④落定·瞬态网络面不得借 re-roll 无界放大）；Ban 同键二派发/换键不换 revision（账本双换纪律——0088 canonical mismatch/缓存回放同错两死面·`:r{k}` 单调递增零复用）；Ban 每 roll 绕既有确定性闸（schema/verbatim/引文/grounded-refs/判重全闸逐 roll 重过·**验证零放宽只改后果**沿 G7FIX-4R 语义）；Ban concluded 语义滥用（换 competency 继续面禁置 concluded·只在真终场置位）；Ban 触计费/结算语义（各 roll 走既有 cost scope/meter 自动分账零新账面·topic_charge=计费战役）；Ban 触 attempt 通道（:337-342 字节零改·同 logical node 永不二派发）；Ban 触 evaluate 侧模型重调（unscored 裁决面只改图内后果·不 re-invoke 评分模型）；Ban 无帽 re-roll（per-turn 生成调用总数帽进卷·专家② :18 联动）；Ban 真实模型外呼（est live=0·scripted+隔离 PG 形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 scripted 假体/隔离真迁移 PG·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=scripted model+真迁移隔离 PG（`assertIsolatedTestTarget` 护栏·沿 g7fix4-reroll.proof 先例）；回归门=既有 prove 原值重跑。零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-f-reroll-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ag-cost1/diag/authz 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（且刀 B 落主线=§4 硬前置核验）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**。

**待双审/EXEC 裁决项**：

- **①re-roll 上限值**：(a) 沿既有形制每族 `MAX_DUPLICATE_REROLL=2` 同值（per-turn·生成调用总数≤3 含初诊·既有 proof 断言零破坏·**推荐**）(b) 统一 per-turn 总帽（判重/refs/四类所有 roll 共计一帽·如 4——键空间最简但既有 25 臂断言随动）。附带：统一 roll 计数器编排终形（EXEC 细化）。
- **②耗尽换 competency 换序策略**：(a) 顺延 planner 序下一 competency+**连续耗尽帽**（如 2 个 competency 连续耗尽→真终场·防循环放大·**推荐**）(b) 无帽顺延至全序耗尽（模型持续劣化面无界重掷·不推荐）(c) 耗尽即跳过出题仅标记（改变面数契约·不推荐）。附带：换序在图节点 vs 路由边的实现位（EXEC 细化·§1-②）。
- **③unscored 后果**：(a) **0 分继续**（沿计费裁决「该话题 0 分其余照计」家族先例·单点模型失败不作废整场·**推荐**）(b) 终场维持（现状·零改）。呈报二选一。
- **④re-roll 族边界（与刀 B 联动）**：(a) schema/malformed/business 确定性输出族+`external_outcome_unknown` 均入族（LANDING-INDEX 四类文面含 unknown·帽内重掷不放大·**推荐**）(b) 仅确定性输出失败入族·unknown 待刀 B 落后另裁。provider_timeout 入族与否随本项一并裁决。
- **⑤critique 臂实现位**：(a) seam 签名扩 asked 入参+critique 复检收进 worker seam（骨架全集中一处·**推荐**）(b) 图节点有界循环（跨层键管理复杂·图 state 契约感知面大）。

---

## §9 EXEC 随翻（2026-10-12·施工落卷·`executed:awaiting_post_prove_dual`）

### §9.0 并线重 pin（merge `feat/mysql-schema-skeleton` @`378b96e8` → merge commit `986a3531`·零冲突 EXIT=0）

刀 B（AG-06 nail `2a2fee56`·merge `616d8ef3`）+ssot 登记两笔并入。**§0.1 blob 锚表 13 行 `git ls-tree` 新 HEAD 亲算：12 行逐位恒等**（adaptive-interview-service `001ec000649f`·generate-question `7c614e495abe`·evaluate-answer `aeba291f3ccb`·graph `0c0a0dd296f2`·question-generation `b87966ce332d`·registry `63af556fd166`·0130 `239a0b19aea4`·memory-store `4ec7fc62da99`·interview-service `bee3c139648d`·adaptive-lifecycle `5cfce9be32c8`·g7fix4 proof `c9982ab8764a`·0130 同前）；**唯一漂移=invoke.ts（§0.1 #7·刀 B 真触面）**。§0.1 行号锚（:334-336/:337-342/:423-444/:449-465/:466-474/:481-516/:553 等）merge 后施工前逐一亲证零漂。

**§0 勘误注（重 pin+席1/席2 六 errata 随 §0 吸收·逐条实测）**：

1. **invoke.ts blob+行号漂（§0.1 #7·刀 B 并线必然后果）**：`647e0aa952f0`→`eda87ce0044a`（刀 B +95 行）；同键缓存回放负证锚 :624→**:650**（`claim.action==='cached'` 臂原文零变）。零码动负证背景语义不变，新 proof §D 同键二掷臂实测坐实。
2. **0088 短 blob 末位勘误（§0.1 #8）**：卷面 `cbc07c09e1ab`→实测 `cbc07c09e1aa`（起草席誊录笔误·文件内容零变·历史迁移零字节 Ban 面不变）。
3. **§0.3-1 刀 B 状态行过时**：「EXEC 落码修复中未落主线」→**已落主线**（nail `2a2fee56`·merge `616d8ef3`·mainline `378b96e8`）——§4 硬前置满足；`external_outcome_unknown` 族边界已定界：刀 B `known_executed` 交付 `deterministic_output_invalid`/`deterministic_output_truncated` 两码（HTTP 200+usage 在手·invoke.ts :852-907 注明「确定性输出失败·允许换 revision 重试·不重试同 key」）→裁决项④解锁，且该两码经 domain 分类吸收归 `provider_malformed` 族（packages/domain/src/question-generation.ts MALFORMED 正则扩 `deterministic_output_` 前缀——不吸收则落 generation_unavailable 兜底，族边界对刀 B 主交付面失明）。
4. **§0.1 #12 adaptive-lifecycle.ts「零触背景」位序勘误→申报触面**：修法③续流面真实触达——unscored 分支 `question_ready` 同事务续发（:377 分支·SSE 链不断流必需）+done 收口面边界注记（谓词零位移）；「零触背景」升级为申报触面，并发登记见下条。
5. **§0.2 attempt 闸锚位序散文勘误**：卷面「:337-344 锚 ±2 在注释区」实测收窄为精确锚 **:337-342**（注释本体恰 :334-336）——修法④注释适配落点亲证。
6. **§0.2 出题键形行重 pin**：:444 行号 merge 后零漂（`${threadId}:ask:t${turn}:0`+裸 revision·fresh-turn 形零变亲证；施工后该形由统一计数器 fresh-turn 分支逐字节保持，g7fix4 25 臂回归坐实）。

**§0.3 并发登记补一行（刀 D）**：

4. **刀 D（`line/ag-d-admission`@`ffa1fa62`）REQUEST 已落卷（draft:awaiting_pre_exec_dual·零码）**：触面=invoke.ts（案A 三拒绝点+release）+worker 队列/消费面（骑刀 C 硬前置·零图包触）——与本刀触面（adaptive-interview-service/ai-graphs 三文件/domain 分类+lifecycle unscored 投影分支）**零文件交点亲证**；刀 D 落码时本刀已并线在其前，其 EXEC 照 §0 协议重 pin。

**package.json/runner 注册行触面申报（如实计入触面统计）**：worker `apps/worker/package.json` +1 行（`prove:ag-f-reroll`）；根 `package.json` +2 行（`ag-f-reroll:prove`/`:prove:raw`，沿刀 B 双名形）；`scripts/run-e2e-isolated.mjs` 四处 additive 注册（receipt 源清单/允许表/命令映射/PG bootstrap 名单·沿 g7fix4+刀 B 同形）。共 **13 文件 217+/22−**（12 改+1 新 proof）。

### §9.1 五裁决项行使记录（按卷推荐形·全部标注可调）

- **①上限值=(a)**：`MAX_ERROR_REROLL=2` 沿既有判重形制同值（per-turn·初诊+族内 re-roll 单窗 ≤3 含初诊）；每 roll 独立 logical node 各冻结静态 max 预留（0088 等值触发器既有机制·专家 §二-3 :18 帽即硬上限·本刀零预留改革）。**统一 roll 计数器终形（EXEC 细化）**：seam 闭包 `rollTurn/rollSeq`——fresh turn 复位+`:0` 初诊形零变；判重 re-roll/四类族 re-roll/换 competency 再入初诊共键空间 `:r{k}` 单调递增零复用（换序续掷初诊亦续 `:r{k}`，杜绝同键缓存回放/0088 canonical mismatch 双死面）；`:gr{k}` grounded 专闸零碰撞；纯判重路径键形与既有逐位一致（g7fix4 25 臂原值坐实）。*可调：帽值与统一总帽形制（④另一形态 per-turn 一帽）后继可依 AG-11 预留数据重裁。*
- **②耗尽换 competency=(a)**：顺延 planner 序（deps.competencies 声明序）下一 competency+**连续耗尽帽=2**（精确语义：第 3 个连续耗尽的 competency 到达即真终场·帽内至多 2 次换序；成功出题计数归零）。**实现位（EXEC 细化）=图节点+路由边双面**：generate-question 节点持帽计数（state 新增 `competencyExhaustions` 纯数字控制字段·checkpoint 安全）+顺延路由；graph.ts genQuestion 条件边加回环（`pending?awaitAnswer : (!concluded && route 非 conclude ? genQuestion : conclude)`）——**graph.ts「零触背景」张力照 §0 重 pin 消解**（§9.1 本条即重 pin 登记）。换序轨迹落 `degraded{question_competency_exhausted}`+generationProvenance 双审计面；concluded 只在真终场置位（Ban 遵守）。*可调：帽值/换序策略（连续耗尽→跳题仅标记等）后继可重裁。*
- **③unscored=(a) 0 分继续**：evaluate-answer 臂改写——transcript 落 `score:0`+`outcome:'unscored'`+reason 原样（relevant=false·**mind 不 ingest 该题证据**·仅 withCurrent 推进）·concluded 禁置→条件边回 decide 续流；**不 re-invoke 评分模型**（§3-6 零触）·answer_artifact 臂（:29-51）零触。lifecycle 配套最小投影：unscored 分支 `question_ready` 同事务续发（next 在场时·旧行零追加）。**边界发现（如实登记）**：0046 迁移触发器 `interview_completion_requires_all_answers_scored` 在 **DB 层钉死「answer_unscored 事件在场 ⇒ 禁 completed」**（历史迁移零字节 Ban）——混合 unscored 场 conclude 收口仍走既有 fail+release+`assessment_unavailable:evaluation_unscored` 臂（新 proof §C 保守面亲证）；图内续流完整兑现（续流 turn 全部照常计分，实测 4/4 scored 事件）。「混合面 completed 照计」需放松 0046=计费结算语义，**归 billing rev 战役后继，本刀不越界**。*可调：0046 放松面后继随计费战役重裁。*
- **④族边界=(a)**：`schema_invalid`/`provider_malformed`（含刀 B `deterministic_output_*` 吸收）/`business_invalid`/`external_outcome_unknown` 均入族（domain 导出 `QUESTION_GENERATION_REROLL_FAMILY` 单源，seam/节点共用）。**provider_timeout 裁定**：独立码不入族；**运行时现实（如实登记）**：invoke 出口超时统一以 `external_outcome_unknown` 形返（unknown 臂 :916-930·执行超时 reason 只入账面）→超时面实际**随 unknown 入族帽内重掷**——adaptive-degrade 超时臂断言适配（genAborts 1→3·reroll===2·AbortSignal 透传+不发明题核心不变量保留·沿 g7fix4 改写旧断言先例）即此语义的既有门随动，非基线红。族外原判死零位移：provider_not_configured/generation_unavailable/duplicate_question/attempt_replay_forbidden（新 proof §A5/§E 坐实）。*可调：瞬态面是否摘出族（拆 timeout 专码）后继随刀 D/AG-08 重裁。*
- **⑤critique 臂=(a)**：seam 签名扩 `asked` 第 7 参（图节点 transcript 透传·additive 可选既有 scripted deps 零改）+critique 复检收进 worker seam 族循环（拒绝=族内失败帽内重掷·耗尽返 business_invalid+`question_critique_failed` 与图节点既有 provenance 同形 reason 映射不变）；**图节点既有 critique 终闸保留零触**（直接 deps 注入面/纵深防御双保险）。*可调：终闸收并后继可简化（登记后继面）。*

### §9.2 断言门全表（§2 全条+附跑·全亲跑·隔离容器真迁移链 `migrations: applied=172`·est live=0 零模型外呼）

| # | 门 | 命令 | 结果 |
|---|---|---|---|
| 1 | 新 proof（§A 四类族 17 臂+§B 换 competency 10 臂+§C unscored 7 臂+§D 契约负证 4 臂+§E 保守面 3 臂） | `node scripts/run-e2e-isolated.mjs ag-f-reroll:prove:raw` | **EXIT=0·47 PASS/0 FAIL** |
| 2 | 既有 reroll proof 回归（§2-2·25 臂原值） | `… g7fix4-reroll:prove:raw` | **EXIT=0·25 PASS/0 FAIL 原值**（键空间/耗尽判死/事件键零位移） |
| 3 | evaluate/图既有门回归（§2-3） | `… adaptive-life:prove:raw` / `… memory:prove:raw` | **EXIT=0·43 PASS** / **EXIT=0·11 PASS** |
| 3a | 既有门断言适配一处（裁决④a 随动·非基线红） | `… adaptive-degrade:prove:raw` | **EXIT=0·11 PASS**（超时臂 genAborts 1→3 适配·披露见 §9.1-④） |
| 4 | typecheck CI 权威形（§2-4） | `pnpm turbo typecheck --force` | **EXIT=0·3 successful/3 total·0 cached** |
| 5 | typecheck 根 | `pnpm typecheck`（=tsc -p tsconfig.e2e.json） | **EXIT=0** |
| 6 | 附跑（图邻域·路由边/图拓扑随动保险） | `… adaptive-flow:prove:raw` / `… resume-grounding:prove:raw` | **EXIT=0·5 PASS** / **EXIT=0·39 PASS** |
| 7 | markers=0 五门（13 文件改动集） | 冲突/fake-green/门弱化(词界形)/遗留标/secrets | **冲突/弱化/遗留/secrets 四门 EXIT=1 零命中；fake-green 门 4 命中全为 runner 既有反 fake-green 守卫文案行（git diff 零命中亲证·非本刀面）** |

**est live=0 收据**：新 proof 全 scripted model+隔离 PG 真迁移链（`assertIsolatedTestTarget` 护栏·每门独立一次性容器）；零真实模型外呼·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源）。

### §9.3 施工落点（修法四件·file:line 亲算）

| 修法 | 落点 |
|---|---|
| ①四类族有界 re-roll | `apps/worker/src/adaptive-interview-service.ts`：`MAX_ERROR_REROLL=2` 常量+:466-474 单发臂改族循环（generate 闭包 :423-442 本体零改·`:r{k}` 统一计数+revision 双换·每 roll 重过全闸）+critique 复检（⑤a） |
| ②耗尽换 competency | `packages/ai-graphs/…/nodes/generate-question.ts`（帽计数+顺延臂·`MAX_COMPETENCY_EXHAUST_SWITCH=2`）+`graph.ts`（genQuestion 条件边回环）+`state.ts`（`competencyExhaustions` 字段+`asked` seam 参） |
| ③unscored 0 分继续 | `packages/ai-graphs/…/nodes/evaluate-answer.ts`（:67-90 臂改写·concluded 禁置）+`apps/worker/src/adaptive-lifecycle.ts`（unscored 分支 question_ready 续发+done 收口边界注记·谓词零位移） |
| ④attempt 通道字节零改 | `:337-342` 禁令本体字节零改亲证；仅 :334-336 注释旁补 re-roll 键族说明（§1-修法④） |
| 配套 | `packages/domain/src/question-generation.ts`（MALFORMED 吸收刀 B 两码+`QUESTION_GENERATION_REROLL_FAMILY` 导出）+`domain/index.ts`（+1 导出名） |

---

---

*AG-F REQUEST · 2026-10-12 · draft:awaiting_pre_exec_dual → executed:awaiting_post_prove_dual · 基线 `feat/mysql-schema-skeleton` @`2bc4e2bd`（施工并线重 pin @`378b96e8`·merge `986a3531`） · 分支 `line/ag-f-reroll` · 工作树 `meetwise-agf` · 蓝本=issues-final AG-02 :14/:70-78 + LANDING-INDEX §二 :17（残留四类定谳）+ EXPERT-REVIEWS §七 :65（刀 F 行=修法权威·骑刀 B+预留上限）+§二-3 :18 + review-log :12/:61/:150 + LEDGER :415 · 范围=四类单发终场有界 re-roll（同键+revision 双换沿 62747d74 `:r{k}` 先例·耗尽换 competency 不终场）+unscored 图内后果裁决 · 触面=adaptive-interview-service.ts error 臂+generate-question.ts+evaluate-answer.ts+graph.ts（路由边·§9.1-② 重 pin）+state.ts+domain 分类+lifecycle unscored 投影分支（§9.0-4 申报）+worker/root package.json 注册行+runner 四处（§9.0 申报）· 零迁移零计费零 attempt 通道 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push 待 post-prove 双审两外席（Ban self-approve · alone≠dual）*
