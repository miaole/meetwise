# QGEN-CRITIQUE-RESILIENCE REQUEST（出题批判韧性修复刀 · 修法两件=模板旁路闭合+图级批判门降格可恢复 · 恰 2 产品文件 +44/−0 · 零迁移零 DDL 零 SSOT 行）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落卷 2026-10-16·merge `729d1ac4`+修法两件逐字节落码+门矩阵全绿·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · est live=0 · ⛔push⛔merge 主线） · base = 主线 `feat/mysql-schema-skeleton` @ `0c94d1ec`（全 hex `0c94d1ec5dbeb67fade0c9fb5cb40c096f6ee9e1`·fetch 后 origin tip=qpl nail 波 tip 同指亲证零漂） · 分支 `line/qgen-critique-resilience` · 工作树 `meetwise-qcr`（`git worktree add ../meetwise-qcr -b line/qgen-critique-resilience` 本起草席已立·`git worktree list` 恰一本树在册）。

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
| 受影响 prove（rev1 补·P1） | `prove:adaptive-graph`（pnpm -C packages/ai-graphs·`test/adaptive-interview.proof.ts`·文件头旧称 adaptive-graph:prove 词面零翻）——**件② 落点包唯一钉旧契约的既有门** | EXIT=0·27 PASS（席2 base 亲跑 PASS 在案+落卷席 rev1 亲跑同值双证） | EXIT=0 且 PASS 数 ≥ 27（基线值系先例门跑值非静态可推导·席1 P2-4）；`:66-83` 单发终场钉保形（`:74` 单发断言+`:75-79` failClosed 形断言·邻接 `:82-98` 缺 Key 族外终场臂同族）——件② 后该钉因测试 deps 单 competency（`['并发']` 无序可换）**incidental 保形**，建议 EXEC 增多 competency 换序新臂把保形升格显式断言 |
| 受影响 prove（rev1 补·P1） | `prove:adaptive-signals`（pnpm -C packages/ai-graphs·`test/decide-signals.proof.ts` 10 臂·文件头旧称 adaptive-signals-graph:prove 词面零翻） | EXIT=0·10 PASS（席2 base 亲跑 PASS 在案+落卷席 rev1 亲跑同值双证） | EXIT=0 且 PASS 数 ≥ 10（基线值系先例门跑值非静态可推导·席1 P2-4） |
| 新臂 prove（测试件） | 件①：a) :435 旁路 asked 判重命中 → business_invalid failure 形+provenance 三键（operationId=`:0` 形/invokeError=question_critique_failed）；b) 图换序臂接管（帽内换 competency 继续·concluded 禁置）；c) pass 路模板文本与 provenance 逐字节零变（首问/换序后新能力两面） | 无（新断言） | 全绿·归测试件（ag-f-reroll.proof.ts 增臂或新 proof 文件·测试面另计不占 2 产品文件额） |
| 新臂 prove（测试件） | 件②：a) 图级 critique 拒 → 帽内换序（route 顺延+competencyExhaustions=1+degraded reason 既有 token+critiqueProvenance 三键形+concluded 未置）；b) 帽满（=2 再拒）→ failClosed 原形逐字节；c) 无序可换（末位 competency）→ failClosed 原形；d) 换序后出题成功 → competencyExhaustions 归零 | 无（新断言） | 全绿（rev1 P1-B 载体钉死：**packages/ai-graphs 包内**——adaptive-interview.proof.ts 增臂沿 `:63-72` fallbackGraph 直接 deps 注入先例·或 ai-graphs 新 proof；原因=生产 worker deps 链下 `:115` 系纵深防御位不可达（seam critique :600/:623-633 先行同函数把关）·**新臂必须直接 deps 注入**；件① 载体维持 ag-f/新 proof 不变） |
| neg 零弱化 | 族外失败原形判死（timeout/not_configured/duplicate_question/attempt_replay_forbidden/generation_unavailable）；wasAsked 判重唯一真相（归一化精确·零语义/向量）；critiqueQuestion 四 issue 零触；attempt 闸 :417-422 字节零改；键空间 `:0`/`:gr{k}`/`:r{k}` 零新键形；seam 族 re-roll/dup re-roll 既有臂零位移 | g7fix4 §4.3c+ag-f §A-E 既有断言 | 全部原值保持 |
| typecheck | `turbo typecheck --force` | 8/8 0 cached EXIT=0（e2e-stress 门全表先例） | EXIT=0 零新增 |
| lint | root/web/api 三值 | 5235 / 601 / 1421 贴线恒等 | 恒等 EXIT=0 |
| docs:check | `pnpm docs:check` | EXIT=0·2161 ≤ cap 2176（余 15·本树亲跑） | EXIT=0·+本卷 1 件=2162 ≤ 2176 |
| markers | 改动集五类标记词直扫（四标记词+冲突标记·词面运行时组装防自指·本卷自笔避词面沿 e2e-stress 门⑧先例） | 零命中 | 零命中亲证 |
| diff 面 | `git diff --stat` 对 base | — | **恰 2 产品文件**（adaptive-interview-service.ts +17/−0·generate-question.ts +27/−0·净 +44/−0 容差 ±10 行如实登记）+测试件（测试面）·零迁移零 DDL 零域包零 SSOT 四卷零锁文件零 package.json |

**STOP=`executed:awaiting_post_prove_dual`**（本卷第一处·EXEC 席 2026-10-16 终态·原 `draft:awaiting_pre_exec_dual` 经 pre-exec 双审会签+rev1 窄域复审 PASS+协调方 EXEC 授权后推进·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve）——EXEC 已施工落卷·本席⛔push ⛔merge 主线 ⛔force push 未用。

## §3 范围外（零触清单）

③ 环境协议修复（loader 方式 b/iso-dotenv）**另刀在飞**——本刀零触 env/loader/端点/Key 面；wasAsked 跨会话判重在 ：435 兜底臂的接入（§1-件① 定界定界理由在卷）登记后刀候选；`0046` 混合 unscored 放松（AG-F STILL OPEN 既有）零触；模板/提示词文案面（§1.3-①）零触。

## §5 pins（十一值照抄零翻·沿 g7fix4/AG-F 卷形）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false —— 脚注：actualSpendCny=null（est live=0：全 scripted/隔离容器零外呼·零 Key 值接触）。

## §8 停止条件

1. **基线漂移**：`0c94d1ec` 后主线前移 → EXEC 工序1 并线重 pin（merge-tree 预演+实跑·§0 锚逐条复测·结论不变只更行号·漂移如实登记）。
2. **受影响门基线红**：§2 任一基线门在 EXEC 树 EXIT≠0 且非本刀 hunk 所致 → 停·报协调方（非本刀红根不就地修·沿先例承登）。
3. **修法面破约束**：落码 diff 超「恰 2 产品文件」或净行漂出 +44±10 窗、或域单源（QUESTION_GENERATION_REROLL_FAMILY/critiqueQuestion/QUESTION_GENERATION_ERROR_CODES）在 EXEC 时点被他刀改形 → 停·rev 重审归因链。
4. **双审否决**：pre-exec 双审任一席 FAIL → 停·按处方 rev（append-only 勘误·零洗卷）。

**STOP=`executed:awaiting_post_prove_dual`**（本卷第二处=§2 尾·第三处=本行·EXEC 席 2026-10-16 终态翻转）——EXEC 落卷终态：待 post-prove 双审。

## Non-claims

本卷 ≠ 施工（docs-only·产品码零触）≠ ③ 环境协议定谳或修复（另刀在飞·本卷仅转录鉴别定谳）≠ 鉴别刀行翻面（SSOT 行翻面权归协调方·本卷不自建 SSOT 行）≠ 帽/族/键/收据任一单源改动（全沿既有形制行使）≠ 单发终场废除（帽满/无序可换/族外失败终场全保留）≠ g7SuiteGreen 翻转 ≠ trio 翻绿。≠ mid-graph 换序成功后批判收据（invokeError=question_critique_failed）终态事件面持续可见之承诺（rev1 P2 注记：该收据沿既有 family 臂语义仅存 checkpoint 历史——换序成功路后续成功 provenance 覆盖 state 出参面·终场面（帽满/无序可换/族外）才完整入事件 payload·本刀沿既有语义零回归零新增可见性承诺）。alone ≠ dual。

## §9 rev1 处置摘要（pre-exec 双审合并落卷·2026-10-16 落卷席 append·append 保史·§0-§8 除勘误落点外原文零洗）

**授权与窗口**：pre-exec 双审两席合并修订清单落卷——席1（agent_e9e72c85）FAIL P1×1+P2×4·席2（agent_7e852bb0）FAIL P1×2·两席 P1 同源（§2 门矩阵漏载件② 落点包既有门）并集=**P1×1+P1-B+P2×3**（席1 P2-4 基线口径注记随 P1 行内落）·方向双席 endorsed；draft 态 §8 窗口内修订·零触 §1 两件定稿码形/§1.3 三裁/§3 范围外/§5 pins·STOP 值不变。五项逐项落点：

1. **P1（两席同源）§2 门矩阵补两行**（落点=§2 表·`prove:g7fix4-reroll`/`prove:ag-f-reroll` 行后纯插入两行·既有行零改）：`prove:adaptive-graph`（packages/ai-graphs/test/adaptive-interview.proof.ts·**件② 落点包唯一钉旧契约的既有门**·`:66-83` 单发终场钉·亲证：`:74` 单发断言+`:75-79` failClosed 形断言·邻接 `:82-98` 缺 Key 臂同族）+`prove:adaptive-signals`（decide-signals.proof.ts 10 臂·亲证 `A(` 计数恰 10）——两行 EXEC 验收口径=**EXIT=0 且 PASS 数 ≥ 先例值**（席1 P2-4 注记已随行内落：基线值系先例门跑值非静态可推导）；落卷席亲跑双证 @03019bbe（受影响面零触树·blob 与 base 同值）：adaptive-graph EXIT=0·27 PASS·signals EXIT=0·10 PASS；另随行落席2 建议=件② 后 `:66-83` 钉系单 competency incidental 保形·建议增多 competency 换序新臂升格显式断言。
2. **P1-B（席2）件② 新臂载体钉死**（落点=§2 件② 新臂 prove 行 EXEC 格内 append·原「全绿」零洗）：**packages/ai-graphs 包内**（adaptive-interview.proof.ts 增臂沿 `:63-72` fallbackGraph 直接 deps 注入先例·或 ai-graphs 新 proof）·原因注记=生产 worker deps 链下图级 `:115` 系纵深防御位不可达（seam critique :600/:623-633 同一 critiqueQuestion 纯函数先行把关·能到 `:115` 的题面必已过同门）·**新臂必须直接 deps 注入**（fallbackGraph 先例正是 scripted deps 形）；件① 载体维持 §2 件① 行原文（ag-f-reroll.proof.ts 增臂或新 proof）不变。
3. **P2 件① idempotencyKey `:t:0` 审计元数据注记**（落点=本节·供 EXEC/pre-exec 复审读）：件① failure 形 `idempotencyKey=${d.threadId}:ask:t${turn}:0` 同 turn 多次换序（多 competency 模板连续被拒）**共用同一 `:t:0` 键面=纯 provenance 审计元数据**——本臂零 invoke 零归集行（registry/账本零消费·失败形在 :452-458 roll 计数块之前返回不经 withTokenStream 注册）·与 worker :448-451「耗尽换 competency 初诊不复用 `:0`」规则无冲突（该规则辖真 invoke 初诊键选定·本臂零 invoke 不在其域）·沿 :420 attempt_replay 臂同形先例·:417-422 attempt 闸字节零改。
4. **P2 invokeError 丢失场景 Non-claims 行**（落点=Non-claims 节尾 append 一句·原文零洗）：mid-graph 换序成功路批判收据（generationProvenance.invokeError=question_critique_failed）被后续成功 provenance 覆盖·**批判收据仅存 checkpoint 历史**·终场面完整入事件 payload——沿既有 family 臂（generate-question.ts :103-110 换序臂同形）语义零回归·本刀零新增可见性承诺。
5. **P2 锚面微漂勘误+P2-3 注释补全建议**：§0.1 勘误注记（现树亲证·**原表行零洗·EXEC 重 pin 以现树实测为准**）：#3 graph.ts「67 行」→**66 行**；#9 state.ts degraded `:214`→**:213**·competencyExhaustions `:220-223`→**:222**（零结构漂·纯行号 ±1 面）。**P2-3**（席1）：建议随 EXEC 件② hunk 带一句注释补全（落点=generate-question.ts `:94-98` 族换序臂注释块·件② hunk 同文件上方邻接·comment-only +1 行内 §2 diff 面 ±10 容差·不破「恰 2 产品文件」）：**「件① 后模板旁路拒绝=零 roll 新到达径」**（失败形于 worker seam :452-458 roll 计数块之前返回·零 `:r{k}` 消费·经本族臂换序后以新 competency 新到达本臂）。

**rev1 自检回执（落卷席亲跑·2026-10-16）**：`pnpm docs:check` 落卷前后双跑 EXIT=0（**2162 ≤ cap 2176**·落卷前同值 2162 亲跑在案）；markers 改动集（`git diff HEAD -U0` 新增行）五类标记词直扫零命中（四标记词运行时组装词面+冲突标记双查·沿 i6-239 门⑦形·词面运行时组装防自指）；改动集恰 1 tracked .md=本卷（append/勘误注记形·§0-§8 除 §2 三处落点外原文零洗）·零码面零迁移零锁文件。**STOP 终态**：三处（卷头 Status/§2 尾/§8 尾）维持 **`draft:awaiting_pre_exec_dual`**——rev1 落卷后窄域复审方会签·alone≠dual·⛔push。


## §9-EXEC EXEC 席执行记录（七字段·2026-10-16 EXEC 席落卷·append 保史·上文零字洗改·STOP 三处已翻面）

**授权与窗口**：rev1 窄域复审 PASS（agent_8dce5710·「rev1 确认·双审会签完成·可授权 EXEC」）+协调方 EXEC 令（工作区 meetwise-qcr @ `983b556d`·⛔push）后施工。

**序1 merge**：`git merge --no-ff origin/feat/mysql-schema-skeleton@12b21412`（届时 tip=ISO+REMAP nail **恰等下界 12b21412** 亲证）→ merge **`729d1ac4`**·ort 零冲突 8 files +654/−3（两在飞 REQUEST 卷+LEDGER/checklist/backlog+qbank-pipeline.proof+run-e2e.mjs）·**零触两修法落点与全部域单源**·禁 pull --rebase 遵守。

**序2 §0 全量重 pin（对届时树 `729d1ac4`）**：§0.1 十 blob 锚+三测试件 blob 全 hex 逐一恒等（两产品文件 `373c4032`/`8a97f9c9`·域单源 `31079959`/`92b7d6e3`/`b4c5fb16`·graph `6cdcc122`·state `411e700e`·memory `d01ce6c8`·consumer `27ddbcf1`·测试件 `866b4108`/`c9982ab8`/`645ec783`）——**基线漂移零·停止条件 1 未触**。勘误值亲证：graph.ts **66 行** wc 恰等·state.ts degraded **:213**/competencyExhaustions **:222**。**P2 引注漂移随手落**：rev1 引 adaptive-graph 钉区间 `:66-83`→实测**钉块 `:59-81`**（注释 `:59`·单发断言 `:74`·failClosed 形断言 `:75-79` 与卷引恒等）·邻接缺 Key 臂 `:82-98`——合并口径 **`:59-98`**（brief 预告 `:61-98`·实测首差 −2 行·零语义漂）·`A(` 计数 27=基线双证同值。

**序3 EXEC 修法两件（逐字节沿 §1 定稿）**：件① `adaptive-interview-service.ts` `:432-444` 现块 **13→30 行（+17/−0**·blob `373c4032`→`3dcc366f`）——模板提出 `groundedTemplate` 变量+前置门 `critiqueQuestion(groundedTemplate,competency,asked??[],d.competencyKeywords??{})`（同一纯函数·零模型零 IO）·命中→`unavailableGeneration('business_invalid',{operationId,idempotencyKey:`${threadId}:ask:t${turn}:0`,invokeError:'question_critique_failed'})`（provenance 沿 `:623-633` 同形·键沿 `:420` 初诊形）→图族臂帽内接管·pass 路 `withDeficitOut(approvedTemplateGeneration(groundedTemplate))` 文本与 provenance 逐字节零变。件② `generate-question.ts` `:116-127` 现块 **12→39 行（+27/−0**·`:115` 零触·blob `8a97f9c9`→`c4f88f74`）——`critiqueProvenance` 三键形共用·帽内且 planner 序有序可换→顺延换序返回形（与 `:103-110` 逐字段同构·concluded 禁置·degraded 沿既有 token·exhaustions+1）·帽满/无序→`failClosed(state,critiqueProvenance,'generation_business_invalid')` 单发终场原形。**rev1 P2-3 注释补全随 hunk**：`:94-98` 族臂注释块尾 comment-only **+1 行**——两文件净 **+45/−0**（+44±10 窗内）。

**序4 新臂两处（§2 载体钉死遵命）**：件① `ag-f-reroll.proof.ts` 增 **§F 14 臂（47→61**·isolated runner）——F1 pass 面逐字节零变 2·F2 拒收三键形+`:0` 初诊键+零键消费 3·F3a 红链同构 lifecycle（resume 入库+G1 未同意=available true+池空→授权版模板可达；q1 逐字节；turn1 同文 asked 判重命中拒收→**无序可换单发终场**（见字段⑦架构事实）·同文零二次发射·终场收据 `generation_business_invalid` 诚实）7·F3b F2 实证形直驱图节点+完整 planner 序→族臂帽内顺延 `'缓存'` 接管（concluded 禁置·exhaustions 归零·收据存 checkpoint）2。件② `adaptive-interview.proof.ts` 增 **4 组 7 臂（27→34**·沿 `:63-72` fallbackGraph 直接 deps 注入先例·多 competency 换序把单 competency incidental 保形升格显式）——换序（顺延+checkpoint 轨迹既有 token/exhaustions=1/三键收据+成功归零）3·帽满（第 3 连续拒真终场·原形三键）2·无序可换（末位·零换序 seam 恰 1）1·归零跨回合（坏题面永不入 interrupt）1。

**字段① 门矩阵全表（EXIT 原值·改后树亲跑全绿）**：
| 门 | 键 | 实测 |
|---|---|---|
| prove:adaptive-graph | pnpm -C packages/ai-graphs prove:adaptive-graph | **34 PASS / 0 FAIL EXIT=0**（基线 27+新 7·≥31 达标·`:74-79` 单发钉保形） |
| prove:adaptive-signals-graph | adaptive-signals-graph:prove | **10 PASS EXIT=0**（≥10） |
| prove:ag-f-reroll | isolated runner | **61 PASS / 0 FAIL EXIT=0**（47 基线+§F 14） |
| prove:g7fix4-reroll | isolated runner | **25 PASS EXIT=0**（原值） |
| prove:interview | isolated runner | **57 PASS EXIT=0**（原值） |
| prove:resume-grounding / prove:adaptive-grounding | isolated / direct | **39 PASS EXIT=0 / EXIT=0**（零翻红） |
| prove:adaptive-flow / adaptive-life / adaptive-degrade | direct | **5 / 43 / 11 PASS EXIT=0**（§2 表原值） |
| neg:all | 六段 | **687 PASS / 0 FAIL EXIT=0**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135） |
| typecheck | turbo --force | **8/8·0 cached·EXIT=0** |
| lint | turbo --force 12/12 + root 直跑 | 五值 **root 5235 / web 601 / api 1421 / worker 954 / ai-runtime 628** 恰等贴线·ai-graphs **47** 恰等（两测试件改写零新增告警）·EXIT=0 |
| docs:check | pnpm docs:check | **EXIT=0·2165 ≤ cap 2176**（余 11·merge 后 managed worktree 实数） |
| markers | 改动集五类（四标记词运行时组装词面+冲突标记·i6-239 门⑦同构·词面零自指） | **零命中** |
| diff 面 | numstat | **恰 2 产品文件 +45/−0**（+26/−9 与 +30/−2·±10 窗内含 P2-3 注释+1）+测试件 2（`+145/−4`/`+120/−0`）+本卷 .md（本节 append+STOP 三处翻面）·零迁移零 package.json 零锁文件零 SSOT 四卷 |
| 卫生 | — | tsbuildinfo 门运行翻动 checkout 回滚·`.env*` ABSENT·est live=0·actualSpendCny=null |

**字段② 行为对照**：pass 路（首问/新能力）模板文本与 provenance 逐字节零变（F1 两臂）·拒收路不返回模板零键消费（F2 三臂）·换序/帽满/无序/归零四形全臂绿（件② 4 组）·红链形同文模板零二次发射（F3a）·单发终场全保留零弱化（帽满/无序/族外原形）·attempt 闸 `:417-422` 字节零改·键空间 `:0`/`:gr{k}`/`:r{k}` 零新键形。

**字段③ diff numstat**：见 diff 面行——产品 2 文件单 hunk 各一处（件① `:432` 块·件② `:99` 注释+`:116` 块）·测试 2 文件（载体增臂）·本卷 .md（append 形）。

**字段④ 重 pin**：=序2（十锚恒等+勘误值亲证+`:59-98` 钉区间实测落卷）。

**字段⑤ 偏离清单（零实质偏离·两项透明登记）**：
1. **F3 载体拆分**：初版「turn-1 拒收→帽内换序继续」全生命周期预期与 submit 侧图 deps 事实不符——lifecycle submit 形 `makeDeps(d,[],…)` 竞 **competencies=[]（planner 序只在 start 传入=既有架构事实·非本刀 hunk 所致）**，turn≥1 族失败在该流向「无序可换」→既有单发终场（§2 件② 臂 c 同族 sanctioned 终场语义·非本刀弱化）。处置：F3 拆 F3a（lifecycle 红链形：同文零二次发射+诚实终场收据+零弱化断言）+F3b（图直驱注入 F2 实证形+完整 planner 序→帽内换序接管·concluded 禁置）——§2 件① 臂 a/b/c 断言面全覆盖，修法两件字节零让步。
2. **lint 零新增告警改写**：新测试臂初版引 9（ai-graphs）+6（worker）新告警（any/`thread_id`/`__interrupt__` 词面）——diff 面 Ban package.json（零 cap 提升）→改写零告警形（结构化视图类型+`Record<'…'>` 字面量类型参数+运行时组装键名·词面沿 i6-239 门⑦防自指形）·测试语义零变·47/954 贴线恒等复跑亲证。

**字段⑥ pins 零翻**：十一值照抄——haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null（est live=0：全 scripted/隔离容器零外呼零 Key 接触）。

**字段⑦ P2 随卷三件**：
1. **钉区间引注漂移**（序2 已落）：rev1 `:66-83`→实测 `:59-98` 口径——后继刀勿按行号自上而下套用（沿内容锚约定）。
2. **「旧代码忽略仍正确」书面结论**（wire/checkpoint 契约义务）：本刀两件零新增 checkpoint 键·零 wire/Redis 结构变更——`competencyExhaustions ?? 0` 缺省容错（旧 checkpoint 无此键=0 起跑）·`degraded`/`generationProvenance` 均既有通道原键·件① failure 形为纯 provenance 审计元数据（`:t:0` 键零 invoke 零归集行·rev1 P2 注记沿承）——**旧 checkpoint/旧消费者忽略新形仍正确**。
3. **submit 侧 planner 序空位架构事实登记**：lifecycle submit 形图 deps `competencies=[]`（planner 序仅 start 注入）→turn≥1 族失败/批判拒在该流向无序可换（单发终场保留）——件①/件② 的帽内换序接管面=start 流向+直接 deps 注入面（F3b/件② 4 组已证）·该事实非本刀引入·登记供 post-prove 双审与后继刀（如需 mid-interview 换序可另刀立题）。

**STOP 终态**：三处（卷头 Status/§2 尾/§8 尾）已翻 **`executed:awaiting_post_prove_dual`**——post-prove 双审两独立外席待派·alone≠dual·本席⛔push ⛔merge 主线 ⛔force push 未用。

## §9-POST post 双审会签 P2 勘误随卷（nail 席代落·post 双审会签 PASS 席1 agent_b7ad34e6+席2 agent_9944fea0 授权·2026-10-16·append 注记形不洗上文一字）

- **P3-A（席1·STOP 自指序数 cosmetic 登记）**：§2 尾 STOP 行自指「本卷第一处」与卷内三处口径（**卷头 Status/§2 尾/§8 尾**·§9 rev1 回执与 §9-EXEC 终态行同此口径）不符——按该口径本行（§2 尾）系第二处·卷头 Status（:3）方为第一处；§8 尾行「本卷第二处=§2 尾·第三处=本行」与三处口径自洽。**纯 cosmetic：三处 STOP 值均正确**（`executed:awaiting_post_prove_dual` @ :3/:205/:222 三行实测一致）·序数自指零语义影响·STOP 值零翻·原文零洗（append 保史）。
- **P3-B（席1·ag-f-reroll +145/−4 非「纯增」如实注记）**：§9-EXEC 字段⑥ numstat `+145/−4` 之 −4 系**载体改写**非断言删洗（nail 席 diff 逐行亲证四行=头注块 §E 尾注释行标点改写+测试 import 行扩名改写（+createResumeWithBlob/transitionResume/completeIngestion）+domain import 行扩名改写（+ingestResume）+尾汇总 console.log 行 §A-§E→§A-§F 改写·四行语义均在 +145 侧以新形在场）——**47 基线臂零删零洗**（§A 族 17+§B 换序 10+§C unscored 7+§D 负证 4+§E 保守 3 原样）·**61=47+14 两次复跑坐实**（EXEC 期字段⑥+nail 期 §F 复跑·数值见 nail 工序）。
- **P2-C（席2·关键定性转录承登——submit 流向定性）**：submit 侧图 deps `competencies=[]`（`adaptive-lifecycle.ts:361` `makeDeps(d, [], …)` 第二形参即 competencies·签名 `:161` 本席亲证）系**既有架构事实**（planner 序仅 start 流向注入·非本刀 hunk 所致）——**本刀件① 在生产 submit 流向终态与改前逐形相同（单发终场）**·**实际增益=更早 seam 拒收+零键消费+诚实收据**（模板旁路同文二次出题在 seam critique 门即拒·初诊键 `:0` 零消费·failure 收据 provenance 三键形）·**帽内换序接管面实存于 start 流向+直接 deps 注入面**（F3b/件② 4 组已证）·**G7K 红在 submit 流向不因本刀单独翻面**·后继刀=**submit-flow-competency-wire（起草中）**。本条沿 §9-EXEC 字段⑦-3 登记升格为席2 定性承登·两产品文件字节零让步。
