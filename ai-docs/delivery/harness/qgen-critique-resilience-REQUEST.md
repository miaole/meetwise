# QGEN-CRITIQUE-RESILIENCE REQUEST（出题批判韧性修复刀 · 修法两件=模板旁路闭合+图级批判门降格可恢复 · 恰 2 产品文件 +44/−0 · 零迁移零 DDL 零 SSOT 行）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷 · ⛔push · ⛔merge 主线 · ⛔改产品码=docs-only 起草卷·修法两件以逐处定稿码形载卷待 EXEC 施工） · base = 主线 `feat/mysql-schema-skeleton` @ `0c94d1ec`（全 hex `0c94d1ec5dbeb67fade0c9fb5cb40c096f6ee9e1`·fetch 后 origin tip=qpl nail 波 tip 同指亲证零漂） · 分支 `line/qgen-critique-resilience` · 工作树 `meetwise-qcr`（`git worktree add ../meetwise-qcr -b line/qgen-critique-resilience` 本起草席已立·`git worktree list` 恰一本树在册）。

**席位**：QGEN-CRITIQUE-RESILIENCE 出题批判韧性修复刀起草席（**G7K 诊断排程刀 2·鉴别刀定谳后的修复主刀** · 协调方派单 brief：QGEN-CRITIQUE-DISCRIMINATOR 鉴别刀混合岔定谳后授权本刀范围=**①+② 产品韧性两件**；③ 环境协议修复另刀 iso-dotenv **在飞·本刀零触**；④ 提示词回滚**不适用已裁**·本刀沿裁零翻案 · docs-only 起草卷 · ⛔push · ⛔改产品码）。

**立项出处（不自建 SSOT 行——行翻面权归协调方）**：① 协调方派单令（QGEN-CRITIQUE-RESILIENCE 修复主刀·G7K 诊断排程刀 2 排程·鉴别席定谳后授权·范围 ①+② 两件如上）；② **鉴别刀定谳转录**（QGEN-CRITIQUE-DISCRIMINATOR 混合岔·§1.2 全文转录+本席码面逐段亲证补链）；③ 先例形三钉=`62747d74`（g7fix4-reroll S1·MAX_DUPLICATE_REROLL=2 有界换题）+`b29d861d`（AG-F 刀F EXEC·四类族 re-roll+耗尽换 competency+unscored 0 分继续·MAX_COMPETENCY_EXHAUST_SWITCH=2）+`2af10f74`（AG-F nail·五裁决行使在卷）——本刀两件全部沿既有帽/键/族/收据形制行使，零新机制发明。

---

## §0 现状锚（起草席亲读·base `0c94d1ec`·file:line 逐条 Read/rg/git ls-tree 实测·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（起草前实测）

- `git worktree list`：恰 `meetwise-qcr` 一本树在册（本席建树后实测）；`git branch --list line/qgen-critique-resilience`：恰本席分支一条。
- `rg -l "qgen-critique-resilience-REQUEST" ai-docs/`：**EXIT=1 零命中**（建卷前实测）——**零同名卷**。→ 停止条件未触发·可落卷。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`0c94d1ec`）

| # | 文件 | blob（全 hex） | 关键行锚 |
|---|---|---|---|
| 1 | `apps/worker/src/adaptive-interview-service.ts`（753 行·**修法① 落点**） | `373c403283e47342e884465666e390e9de57d1a4` | `:9` import 行（critiqueQuestion/unavailableGeneration/approvedTemplateGeneration/QUESTION_GENERATION_REROLL_FAMILY 全已在作用域·**本刀零 import 增删**）；`:25` QUESTION_OPERATION_ID；`:31` MAX_DUPLICATE_REROLL=2；`:43` MAX_ERROR_REROLL=2；`:49` MAX_GROUNDED_REFS_RETRY=2；`:262` PLANNER_DEFAULT_COMPETENCIES 三件套；`:320-345` planCompetencies（`:338-344` 规划失败优雅降级默认集·面试仍开=**planner 死路径**）；`:395` retrieveAndGenerate seam 签名（`asked` 第 7 参·`d.competencyKeywords` `:394`）；`:417-422` attempt≠0 闸（`:420` idempotencyKey=`${threadId}:ask:t${turn}:0` 形·**本刀件① failure 形沿同形**）；`:432-444` **模板早退块（件① 改面·13 行→30 行）**——`:435` approvedTemplateGeneration 固定模板回退；`:452-458` rollTurn/rollSeq 计数复位+初诊键（本早退在其**之前**=键计数零消费）；`:599-612` AG-F 族内 re-roll 环（`:600` seamCritique 定义=critiqueQuestion(q, competency, asked ?? [], keywords)）；`:613-622` error 分类判死臂；`:623-633` critique 耗尽 → `business_invalid` 判死形（provenance origin/errorCode/invokeError 同形·**件① failure 形同构源**）；`:640-676` wasAsked 跨会话判重+MAX_DUPLICATE_REROLL 有界换题（`:675-676` duplicate_question 终面）；`:683-685` modelGeneration 成功形 |
| 2 | `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`（181 行·**修法② 落点**） | `8a97f9c94077be24b4723ad1d40eba5fb6ab6a73` | `:7` `type QuestionGenerationProvenance` import（**零 import 增删**）；`:21` MAX_COMPETENCY_EXHAUST_SWITCH=2；`:24-29` nextCompetencyAfter（planner 序顺延·末位/缺席=null）；`:31-43` failClosed（concluded:true+degraded+pending:null）；`:63-65` effectiveKind 降级（grounded 且 !resumeProfileAvailable → fundamental）；`:90-92` seam 调用（`asked=state.transcript.map(q)` :83）；`:93-114` **AG-F 族失败换序臂**（`:100` 族+帽判定·`:103-110` 换序返回形·degraded reason=`'question_competency_exhausted'` `:107`）；`:115` critiqueQuestion 图级终闸；`:116-127` **批判门单发终场臂（件② 改面·12 行→39 行·:115 零触）**——`:120-126` failClosed+provenance 三键形（origin/errorCode/invokeError+operationId/idempotencyKey）；`:149-179` 成功形（`:173-174` competencyExhaustions 归零·「连续」语义只跨失败链存活） |
| 3 | `packages/ai-graphs/src/adaptive-interview/graph.ts`（67 行·**零触·引用锚**） | `6cdcc122a7992d38f54fd24f32ed0c5927044236` | `:43-54` genQuestion 条件边——`:50-52` pending→awaitAnswer / `!concluded && route && route!=='conclude'` → **genQuestion 回环**（AG-F 修法② 既有臂·件② 换序返回形经此回环重出题·recursionLimit+节点帽双层防放大·零图包改动） |
| 4 | `packages/domain/src/question-generation.ts`（**零触·单源锚**） | `31079959865bacd725a64cd886be30e6f0baca19` | `:28-33` QUESTION_GENERATION_REROLL_FAMILY=**['schema_invalid','provider_malformed','business_invalid','external_outcome_unknown']**（`business_invalid` **在族内**=件①/件② 换序臂可达的充要通道；`duplicate_question` **族外**=g7fix4 钉死终面·:25 注释原文）；`:74-85` classifyQuestionGenerationError；`:87-96` unavailableGeneration（origin='unavailable'+errorCode）；`:98-110` approvedTemplateGeneration（origin='approved_template'·success 形） |
| 5 | `packages/domain/src/question-critique.ts`（27 行·**零触·单源锚**） | `92b7d6e3d2f8dd81b9de58af7c2371d2ec78776c` | `:13-27` critiqueQuestion 四 issue 确定性纯函数——`too_short`(<8) `:21` / **`duplicate`（归一化精确判重 vs asked·`:22` norm 等值）** / `leading` `:23` / `off_competency` `:25`；零模型零 IO |
| 6 | `packages/domain/src/adaptive-interview.ts`（**零触**） | `b4c5fb161b5022dd27ba1c4084b06ca246260353` | `:354` `if (c.depthProbed === 0) return 'grounded'`——**每 competency 首问确定性选 grounded**（红链触发条件①） |
| 7 | `apps/worker/src/memory-service.ts`（**零触**） | `d01ce6c88ab8e018da11eb42d7c8a6d370b6b443` | `:12-14` wasAsked（episodeSeen·归一化精确匹配·判重唯一真相）；`:20-26` recordAskedQuestions（conclude 落 episode 写入源） |
| 8 | `apps/worker/src/interview-consumer.ts`（**零触·调用方锚**） | `27ddbcf1b0e93f254a5c7be9acb0950828c85364` | `:466-556` buildAdaptiveDeps 供给链（`:506` resumeProfileAvailable 判定·`:556` `admitted.ok && admitted.resumeProfileAvailable ? facts : []`——**loader 剥 profile → facts 空 = 红链触发条件②**） |
| 9 | `packages/ai-graphs/src/adaptive-interview/state.ts`（**零触**） | `411e700e513567a3d865a410af07e6c98b260d0c` | `:214` degraded `{reason,turn}` 通道（rg 全仓 `question_competency_exhausted` 消费面**仅 generate-question.ts:107 自身**·零外部消费者=件② 沿用零新词面机证）；`:220-223` competencyExhaustions 连续耗尽计数（纯数字控制字段·checkpoint 安全） |
| 10 | `apps/worker/test/ag-f-reroll.proof.ts` / `g7fix4-reroll.proof.ts` / `interview.proof.ts`（**测试件载体锚**） | `866b4108…` / `c9982ab8…` / `645ec783…` | ag-f-reroll 47 臂（§A 族 17+§B 换序 10+§C unscored 7+§D 负证 4+§E 保守 3·isolated runner）；g7fix4-reroll 25 臂；interview 57 PASS——§2 门矩阵受影响面/neg 面基线 |

### 0.2 锚勘误

无（本卷首版·全部行号 @`0c94d1ec` 实测·无先行卷可勘）。

---

## §1 修法两件（恰 2 产品文件·净 +44/−0·逐处定稿·EXEC 照抄施工）

**总量裁定**：件① `apps/worker/src/adaptive-interview-service.ts` :432-444 现块 13 行 → 定稿块 30 行（**+17/−0**）；件② `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` :116-127 现块 12 行 → 定稿块 39 行（**+27/−0**；`:115` critiqueQuestion 调用行零触）。合计 **+44/−0**·恰 2 产品文件·零新文件·零 import 增删（两文件所需符号全在既有作用域·§0.1-1/2 `:9`/`:7` 机证）·零迁移零 DDL 零域包零图包接线改动（件② 在 ai-graphs 包内既有文件既有函数体）。

### §1-件① 模板旁路闭合（主修·`adaptive-interview-service.ts` :432-444 整块替换）

**现码（13 行·@`0c94d1ec` 逐字）**：

```ts
      if (kind === 'grounded' && groundedFacts.length === 0) {
        // 无可用选定事实(未授权/画像无事实/全被选择器过滤)→ 既有固定模板回退,零模型调用;
        // 模板文案与既有逐字一致(:107 无授权版 / :109 授权版),模板本身零改。
        return withDeficitOut(approvedTemplateGeneration(
          d.resumeProfileAvailable
            // Do not repeat a resume fact: the question is checkpointed, sent by
            // interrupt/SSE, recorded in events and later normalized into an
            // episode.  The candidate can choose which authorized experience to
            // discuss without that original fact becoming a second data copy.
            ? `请结合你简历中一段与「${competency}」相关的真实经历，说明你的做法、关键取舍和验证结果。`
            : `请结合你的实际经验，说明在「${competency}」方面你会如何做关键取舍，并如何验证结果。`,
        ));
      }
```

**定稿（30 行·模板文本逐字节零改·仅提出变量+前置批判门）**：

```ts
      if (kind === 'grounded' && groundedFacts.length === 0) {
        // 无可用选定事实(未授权/画像无事实/全被选择器过滤)→ 既有固定模板回退,零模型调用;
        // 模板文案与既有逐字一致(:107 无授权版 / :109 授权版),模板本身零改。
        const groundedTemplate = d.resumeProfileAvailable
          // Do not repeat a resume fact: the question is checkpointed, sent by
          // interrupt/SSE, recorded in events and later normalized into an
          // episode.  The candidate can choose which authorized experience to
          // discuss without that original fact becoming a second data copy.
          ? `请结合你简历中一段与「${competency}」相关的真实经历，说明你的做法、关键取舍和验证结果。`
          : `请结合你的实际经验，说明在「${competency}」方面你会如何做关键取舍，并如何验证结果。`;
        // QGEN-CRITIQUE-RESILIENCE(件① 模板旁路闭合):本早退位处 seamCritique(:600/:623)/wasAsked
        // 判重(:640-676)/`:r{k}` re-roll 环**之前**——模板对同 competency 确定性同文,同文二次到达
        // (上一题经本臂旁路入面后 unscored 0 分继续(AG-F 修法③)→ decide 复问同能力)必然撞 asked
        // 判重。出面前过既有确定性批判门(asked 判重+seamCritique 复检=critiqueQuestion 同一纯函数
        // 调用,duplicate/too_short/leading/off_competency 四 issue 全检·零模型零 IO):命中 → 不返回
        // 模板,交族内 failure 形(business_invalid ∈ QUESTION_GENERATION_REROLL_FAMILY·provenance
        // 与 seam critique 耗尽臂 :623-633 同形)→ 图节点既有 AG-F 换 competency 臂(generate-question
        // :100-112)帽内换序继续,单发终场只留帽满/无序可换。idempotencyKey 取 `:0` 初诊形(本臂零
        // invoke 零键消费·纯 provenance 审计元数据,沿 :420 attempt_replay 臂同形)。pass 路(首问/
        // 换序后新能力)模板文本与 provenance 逐字节零变。图级批判门(件②)保留=直接 deps 注入面/
        // scripted deps 纵深防御,本臂闭合后生产 worker deps 链不再向图供给 critique 必拒题面。
        if (!critiqueQuestion(groundedTemplate, competency, asked ?? [], d.competencyKeywords ?? {}).ok) {
          return unavailableGeneration('business_invalid', {
            operationId: QUESTION_OPERATION_ID,
            idempotencyKey: `${d.threadId}:ask:t${turn}:0`,
            invokeError: 'question_critique_failed',
          });
        }
        return withDeficitOut(approvedTemplateGeneration(groundedTemplate));
      }
```

**语义定稿**：命中面（同 competency 模板二次到达·asked 判重 duplicate issue 命中为主）不返回模板——交 `business_invalid` 族内 failure 形 → 图节点 `:100-112` 既有换序臂（帽内）顺延 planner 序下一 competency → 新能力首问 grounded → 本臂模板（异能力名·异文）过门 → 面试继续。pass 面（首问/换序后新能力）行为逐字节恒等（模板文本/origin='approved_template'/sources=[]/无 reroll 键消费）。**不查 wasAsked（跨会话 DB 判重）定界**：本臂为链路死兜底快路径（零模型零 IO 语义保形），跨会话模板重复非鉴别定谳红根面，加 IO 依赖反使兜底路径新增 duplicate_check_failed 判死面——登记范围外（§3），既有主链 wasAsked 面零触。

### §1-件② 图级批判门降格可恢复（`generate-question.ts` :116-127 整块替换·:115 零触）

**现码（:115 一行+改面 12 行·@`0c94d1ec` 逐字）**：

```ts
      const critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      // A critique miss used to invent a same-competency shell and emit it as
      // question_ready.  That silently fabricates interview content after a
      // provider or quality failure.  Fail-closed: no pending, no invented stem.
      if (!critique.ok) {
        return failClosed(state, {
          origin: 'unavailable',
          errorCode: 'business_invalid',
          invokeError: 'question_critique_failed',
          operationId: generated.provenance.operationId,
          idempotencyKey: generated.provenance.idempotencyKey,
        }, 'generation_business_invalid');
      }
```

**定稿（:115 零触·改面 12 行→39 行）**：

```ts
      const critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      // A critique miss used to invent a same-competency shell and emit it as
      // question_ready.  That silently fabricates interview content after a
      // provider or quality failure.  Fail-closed: no pending, no invented stem.
      if (!critique.ok) {
        // QGEN-CRITIQUE-RESILIENCE(件② 图级批判门降格可恢复):批判门拒绝语义零弱化——坏题面永不入
        // pending、永不因重试被接受(此处=换 competency 重试**新 attempt**,非接受坏题;反伪造批判门
        // 零弱化)。provenance 三键形(origin/errorCode/invokeError+operationId/idempotencyKey)原样
        // 保全,换序与终场两臂共用同一收据(终场形状与既有逐字节同形)。
        const critiqueProvenance: QuestionGenerationProvenance = {
          origin: 'unavailable',
          errorCode: 'business_invalid',
          invokeError: 'question_critique_failed',
          operationId: generated.provenance.operationId,
          idempotencyKey: generated.provenance.idempotencyKey,
        };
        // 沿 AG-F 换序臂(:100-112 修法②)与 62747d74/b29d861d MAX=2 先例形:帽内(MAX_COMPETENCY_
        // EXHAUST_SWITCH=2)且 planner 序(deps.competencies 声明序)有序可换 → 顺延下一 competency
        // 重新出题(concluded 禁置——Ban 列表只在真终场置位;degraded reason 沿既有 token
        // 'question_competency_exhausted' 零新词面·全仓消费面零扩(§0.1-9 机证),批判面特异性由
        // generationProvenance.invokeError='question_critique_failed' 承载可审计);帽满/无序可换 →
        // 既有单发终场 failClosed 原样(全序耗尽才真终场,assessment_unavailable 形状字节不变)。
        // 回环沿 graph.ts genQuestion 条件边既有 genQuestion 臂,recursionLimit+连续帽双层防放大;
        // 出题成功 → competencyExhaustions 归零(:173-174 既有面零触,「连续」语义只跨失败链存活)。
        const exhaustedBefore = state.competencyExhaustions ?? 0;
        if (exhaustedBefore < MAX_COMPETENCY_EXHAUST_SWITCH) {
          const nextCompetency = nextCompetencyAfter(deps.competencies, route.competency);
          if (nextCompetency) {
            return {
              stateVersion: state.stateVersion + 1,
              route: { competency: nextCompetency, difficulty: route.difficulty, qkind: effectiveKind },
              pending: null,
              degraded: { reason: 'question_competency_exhausted', turn },
              generationProvenance: critiqueProvenance,
              competencyExhaustions: exhaustedBefore + 1,
            };
          }
        }
        return failClosed(state, critiqueProvenance, 'generation_business_invalid');
      }
```

**语义定稿**：换序返回形与既有族失败换序臂（`:103-110`）逐字段同构（stateVersion+1/route 顺延+qkind=effectiveKind/pending:null/degraded 沿既有 token/generationProvenance/competencyExhaustions+1）——差异仅二：provenance 取 `critiqueProvenance`（三键形保全·非 generated.provenance——generated 此处为 success 形）、触发条件为批判门拒绝非族 failure。终场面（帽满/无序可换）`failClosed(state, critiqueProvenance, 'generation_business_invalid')` 与既有逐字节同形。clarify 分支（:78-81）零触（批判门本不在其路径）。

### §1.2 归因（鉴别刀 QGEN-CRITIQUE-DISCRIMINATOR 定谳转录·混合岔·起草席码面逐段亲证补链）

**定谳原文转录**：红根=环境链路死（loader 方式 b 剥 profile/model→deepseek 端点×dashscope Key 401→planner 死→:435 固定模板回退）×树 b29d861d（unscored 0 分继续不终场→链路死面试改道二次出题）→q2 字节级重发→图级 duplicate 批判门单发终场（generate-question.ts :120-126 臂·provenance 三键形）。混合岔两半：③ 环境协议修复（loader 方式 b/iso-dotenv）**另刀在飞**=本刀范围外；①+② 产品韧性两件=本刀范围（协调方授权）。

**本席码面五段补链亲证（全 @`0c94d1ec`·Read 逐行）**：

1. **环境链路死段（③域·转录不施工）**：loader 方式 b 剥 profile/model → 端点×Key 错配 401 → `planCompetencies`（:320-345）invoke 失败 → `:341-344` 优雅降级 PLANNER_DEFAULT_COMPETENCIES 三件套（`项目经验/技术深度/问题解决`+behavioral 槽·面试仍开）→ 每 competency 首问 `depthProbed===0` 确定性选 `qkind='grounded'`（§0.1-6 :354）。
2. **:435 旁路段**：profile 被剥 → `resumeProfileAvailable`/`resumeFacts` 供给链断（§0.1-8 :506/:556）→ `groundedFacts.length===0` → :432-444 早退返回固定模板 **success 形**（origin='approved_template'）——位处 seamCritique（:600/:623）/wasAsked（:640-676）/`:r{k}` re-roll 环**之前**=三设施全旁路。
3. **二次出题段（树 b29d861d 语义）**：AG-F 修法③ unscored 0 分**继续不终场** → decide 复问同 competency（depth 仍未进）→ 首问仍 grounded → :435 再次命中 → 同文模板二次发射（模板对同 competency 确定性同文=**字节级重发**）。
4. **图级批判门段**：genQuestion :115 `critiqueQuestion(模板, competency, asked=[q1 同文], keywords)` → `duplicate` issue（question-critique.ts :22 归一化精确等值命中）→ :119-127 `failClosed` **单发终场**（concluded:true·provenance 三键形 origin='unavailable'/errorCode='business_invalid'/invokeError='question_critique_failed'）→ 链路死面试以 `generation_business_invalid` 提前收场（assessment_unavailable 形状）。
5. **修复映射**：件① 闭合段 2（旁路不再放行必拒题面·命中交族内 failure 形→既有换序臂）；件② 降格段 4（批判门拒绝帽内可恢复·单发终场只留帽满/无序可换）——两件独立成刀面、合成双保险（件① 闭生产 worker deps 链·件② 守直接 deps 注入/scripted 面）。

### §1.3 否决（三裁·已裁面零翻案·EXEC/双审不得复活）

1. **④ 提示词回滚=已裁不适用**（鉴别席裁·本刀沿裁）：模板/提示词文本**逐字节零改**（件① 定稿仅提出变量+前置门·两段模板文案与现码逐字节同文）——回滚不解决「确定性同文×判重」结构面，且 approved template 文案有独立审计源。
2. **单发终场全保留=Ban**（若 :119-127 维持无条件 failClosed）：环境链路死（③在飞未落）×unscored 继续（已并主线）组合下，链路死面试 q2 字节级重发即整场判死=**产品必挂面**——故批判门必须降格为「帽内可恢复」。反之**帽满/无序可换/族外失败（provider_timeout/provider_not_configured/duplicate_question/attempt_replay_forbidden/generation_unavailable）的单发终场全保留**=真终场语义零弱化（§2-neg 断言面）。
3. **无帽无限 re-roll=Ban**（成本失控）：本刀两件全部在既有帽内行使——件① 经图节点 MAX_COMPETENCY_EXHAUST_SWITCH=2 连续帽（第 3 个连续耗尽 competency 到达即真终场）；件② 同帽同口径。零新循环面零新计数器（competencyExhaustions 既有控制字段·成功归零既有语义零触）·recursionLimit 双层防放大（graph.ts :48-49 注释既有）。

---

## §2 门矩阵（EXEC 落码后全表行使·本席 docs-only 起草卷零施工·受影响面 prove+neg 基线值见 §0.1-10）

| 门 | 键 | 基线（@`0c94d1ec` 先例值） | EXEC 预期 |
|---|---|---|---|
| 受影响 prove | `prove:interview`（interview.proof.ts） | 57 PASS EXIT=0（`6ca9f361` 门全表先例） | EXIT=0 零弱化 |
| 受影响 prove | `prove:adaptive-flow` / `prove:adaptive-life` / `prove:adaptive-degrade` | 5 / 43 / 11 PASS（b29d861d 门全表·degrade 11 含超时臂适配在卷） | 原值 EXIT=0 |
| 受影响 prove | `prove:g7fix4-reroll` / `prove:ag-f-reroll`（isolated runner） | 25 / 47 PASS（62747d74/b29d861d+`2af10f74` 门全表） | 原值 EXIT=0（键空间/耗尽判死/事件键零位移） |
| 新臂 prove（测试件） | 件①：a) :435 旁路 asked 判重命中 → business_invalid failure 形+provenance 三键（operationId=`:0` 形/invokeError=question_critique_failed）；b) 图换序臂接管（帽内换 competency 继续·concluded 禁置）；c) pass 路模板文本与 provenance 逐字节零变（首问/换序后新能力两面） | 无（新断言） | 全绿·归测试件（ag-f-reroll.proof.ts 增臂或新 proof 文件·测试面另计不占 2 产品文件额） |
| 新臂 prove（测试件） | 件②：a) 图级 critique 拒 → 帽内换序（route 顺延+competencyExhaustions=1+degraded reason 既有 token+critiqueProvenance 三键形+concluded 未置）；b) 帽满（=2 再拒）→ failClosed 原形逐字节；c) 无序可换（末位 competency）→ failClosed 原形；d) 换序后出题成功 → competencyExhaustions 归零 | 无（新断言） | 全绿 |
| neg 零弱化 | 族外失败原形判死（timeout/not_configured/duplicate_question/attempt_replay_forbidden/generation_unavailable）；wasAsked 判重唯一真相（归一化精确·零语义/向量）；critiqueQuestion 四 issue 零触；attempt 闸 :417-422 字节零改；键空间 `:0`/`:gr{k}`/`:r{k}` 零新键形；seam 族 re-roll/dup re-roll 既有臂零位移 | g7fix4 §4.3c+ag-f §A-E 既有断言 | 全部原值保持 |
| typecheck | `turbo typecheck --force` | 8/8 0 cached EXIT=0（e2e-stress 门全表先例） | EXIT=0 零新增 |
| lint | root/web/api 三值 | 5235 / 601 / 1421 贴线恒等 | 恒等 EXIT=0 |
| docs:check | `pnpm docs:check` | EXIT=0·2161 ≤ cap 2176（余 15·本树亲跑） | EXIT=0·+本卷 1 件=2162 ≤ 2176 |
| markers | 改动集五类标记词直扫（四标记词+冲突标记·词面运行时组装防自指·本卷自笔避词面沿 e2e-stress 门⑧先例） | 零命中 | 零命中亲证 |
| diff 面 | `git diff --stat` 对 base | — | **恰 2 产品文件**（adaptive-interview-service.ts +17/−0·generate-question.ts +27/−0·净 +44/−0 容差 ±10 行如实登记）+测试件（测试面）·零迁移零 DDL 零域包零 SSOT 四卷零锁文件零 package.json |

**STOP=`draft:awaiting_pre_exec_dual`**（本卷第一处）——pre-exec 双审 BOTH PASS + 协调方 EXEC 授权前：零施工、零 push、零主线并线。

## §3 范围外（零触清单）

③ 环境协议修复（loader 方式 b/iso-dotenv）**另刀在飞**——本刀零触 env/loader/端点/Key 面；wasAsked 跨会话判重在 ：435 兜底臂的接入（§1-件① 定界定界理由在卷）登记后刀候选；`0046` 混合 unscored 放松（AG-F STILL OPEN 既有）零触；模板/提示词文案面（§1.3-①）零触。

## §5 pins（十一值照抄零翻·沿 g7fix4/AG-F 卷形）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false —— 脚注：actualSpendCny=null（est live=0：全 scripted/隔离容器零外呼·零 Key 值接触）。

## §8 停止条件

1. **基线漂移**：`0c94d1ec` 后主线前移 → EXEC 工序1 并线重 pin（merge-tree 预演+实跑·§0 锚逐条复测·结论不变只更行号·漂移如实登记）。
2. **受影响门基线红**：§2 任一基线门在 EXEC 树 EXIT≠0 且非本刀 hunk 所致 → 停·报协调方（非本刀红根不就地修·沿先例承登）。
3. **修法面破约束**：落码 diff 超「恰 2 产品文件」或净行漂出 +44±10 窗、或域单源（QUESTION_GENERATION_REROLL_FAMILY/critiqueQuestion/QUESTION_GENERATION_ERROR_CODES）在 EXEC 时点被他刀改形 → 停·rev 重审归因链。
4. **双审否决**：pre-exec 双审任一席 FAIL → 停·按处方 rev（append-only 勘误·零洗卷）。

**STOP=`draft:awaiting_pre_exec_dual`**（本卷第二处=§2 尾·第三处=本行）——起草卷终态：待 pre-exec 双审。

## Non-claims

本卷 ≠ 施工（docs-only·产品码零触）≠ ③ 环境协议定谳或修复（另刀在飞·本卷仅转录鉴别定谳）≠ 鉴别刀行翻面（SSOT 行翻面权归协调方·本卷不自建 SSOT 行）≠ 帽/族/键/收据任一单源改动（全沿既有形制行使）≠ 单发终场废除（帽满/无序可换/族外失败终场全保留）≠ g7SuiteGreen 翻转 ≠ trio 翻绿。alone ≠ dual。
