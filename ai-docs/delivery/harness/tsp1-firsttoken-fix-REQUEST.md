# TSP1-FIRSTTOKEN-FIX REQUEST — tokenstream:prove 恰 1 红臂「TS-P1 ask 面 model_first_token 落表」根因修复刀（红因=H2 #79 scenario 空检索降级早退致夹具零模型调用·断言改形=恰 1 测试文件 1 行夹具改·tsp1-firsttoken-fix 战役·docs-only REQUEST 起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（起草 2026-10-14 · pre-exec 双审 **BOTH PASS 落卷**（席1 `agent_674bdb29`+席2 `agent_1cc4a906` 会签）·协调方明示 EXEC 授权（committed SHA 重钉=`f548a2cb`）·EXEC 并线主线 `51c310d2`（--no-ff 并 `feat/mysql-schema-skeleton` @`5bd92ce8` 零冲突）→§0 全量重 pin 十锚 blob 复算恒等零漂移（席1 P2 随 pin 落锚·只读引用七件 blob 补全）→件① 恰 1 文件 1 行夹具改→tokenstream:prove **20/20 翻绿**（改前必做 run 恰一次 19 PASS/1 FAIL 红名单逐字恒等）→门矩阵十二门全绿→**EXEC 落卷=本 commit（§9 EXEC 记录）·STOP 翻面（nail/行翻面归协调方/主会话批边界·alone≠dual·⛔push）**）

**席位**：tsp1-firsttoken-fix REQUEST 起草席（诊断+起草双责·协调方派·TSP1-FIRSTTOKEN-FIX 基线红根因刀）。
**基线**：`feat/mysql-schema-skeleton` @ `3b32b6c8`（origin tip fetch 后亲证恒等·tokstream-s4b nail 收官 SSOT commit·docs:check 2117≤cap 2120 本树亲跑）· 分支 `line/tsp1-firsttoken-fix`（本起草席 `git worktree add ../meetwise-tsp -b line/tsp1-firsttoken-fix 3b32b6c8` 亲立·HEAD 落 `3b32b6c8` 亲证）· 工作树 `meetwise-tsp`（仓根同级·**node_modules ABSENT 现状亲证——EXEC 工序 0 必做 `pnpm install --frozen-lockfile`**）。
**立项出处**：①协调方派单 brief（2026-10-14·TSP1-FIRSTTOKEN-FIX 战役·tokenstream:prove 恒红恰 1 臂「TS-P1 ask 面 model_first_token 落表」（19 assert 全 PASS·唯此 FAIL）·多波承登基线红指派诊断+起草）；②S4b 卷 §9 红登③ `ai-docs/delivery/harness/tokstream-s4b-REQUEST.md:209`（「tokenstream:prove TS-P1 ask 臂红=REQUEST §9 已登记基线红·红承登·stash A/B 同红同形在案·非并线回归」）；③S4b exec 收据 `receipts/tokstream-s4b/exec-receipt.md:25`（门 8·「唯一红臂 TS-P1 ask 面 model_first_token 落表——stash A/B 基线亲证同红同形（H2 #79 scenario 空检索模板降级后 ask 面零模型调用·proof 自调 noteModelFirstToken seam 无从触发）·非本刀回归·登记不洗」——**S4b 席已作同因归档·本卷独立亲证闭面**）；④ci-wiring2 `86303901` 簇Ⅴ（「tokenstream+db-* 六件实测基线红（stash 对照同红实锤·非本刀面）登记不裁入」）；⑤tip `3b32b6c8` SSOT STILL OPEN（「TS-P1 基线红」在册）。
**结构范本**：`ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8+门矩阵十二门+Ban/pins 形制·本卷全卷沿承）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git 亲证 @`3b32b6c8`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠复核

- `git worktree list` 建后 27 树实测（主仓+既有 25+本 tsp 树）——无第二 tsp1 同名树；`git branch --list "line/tsp1*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg -i "tsp1|firsttoken"` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠预扫（起草席已跑·EXEC 立项日照本协议复扫）**：全 branch 集（除本席支）对唯一触面 `apps/worker/test/tokenstream-progress.proof.ts` 逐一 `git log -1 -- <file>` + `merge-base --is-ancestor` 扫描——唯一非祖先命中=`line/model-token-stream` @`045ded0f`（2026-10-08）·**判定=历史残枝非在飞**：该支=phase-1 原始开发支（tip `10accdae` 同日·较基线超期 5 commit 未并）·其 proof 内容与主线同作 `3acc6fb5` 逐字等效（同题 commit message·主线以等效落卷吸收）·对基线树该文件 diff 恰 +3 行=头注 fake-seam 标注（`86303901` 同款·断言/驱动零差）。复扫翻转（该支对 proof 有新提交或现活信号）→触停止条件「现场漂移」。

### 0.1 blob 锚表（起草席 `git rev-parse 3b32b6c8:<path>` 亲算·EXEC 席 @`51c310d2` 全量复算十值恒等零漂移·席1 P2 随 pin 落锚=只读引用七件 blob 补全入表）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/worker/test/tokenstream-progress.proof.ts` | `7f79c03f`（208 行） | **`:33` 断言器 A()·`:39-47` familyRows（:42-44 同 SQL 查 interview_event 三 kind）·`:73-87` observingDelayedModel fake seam（:79 拦截条件 `req.service === opts.service`·:81 onFirstToken 观察点）·`:97-105` quiz 面 fixture（绿面对照）·`:156` interview 行夹具 INSERT·`:157` askKey=`${IID}:ask:t0:0`·`:159-164` askModel（:162 service='interviewer.ask'/delayMs 3000/firstTokenAtMs 1200·:163 onFirstToken→noteModelFirstToken(stream=IID)）·:168 `localRetrieve: async () => [], webExplore: async () => [],`（**本刀唯一码改行**）·`:171` `deps.retrieveAndGenerate('并发', 2, 0, 0, [], 'scenario')`（kind='scenario'）·`:172` askRows·`:176` TS-P0 ask 臂（PASS）·`:177-178` TS-P1 started+segments 臂（PASS）·`:179` `A('TS-P1 ask 面 model_first_token 落表', askRows.some((r) => r.kind === 'model_first_token'))`（**唯一红臂**）·`:196` TS-P5 allFamily 三流全查** |
| `apps/worker/src/adaptive-interview-service.ts` | `373c4032`（753 行） | **`:18-21` nativeRetrievalFailureToken（仅匹配 embedder/reranker 族）·`:23` AskSchema（q 1-2000+refs 数组）·`:445-447` TOKSTREAM 阶段1 触发面注释·`:461-471` S4b withTokenStream 外包裹+withGenerationProgress 内包裹（attemptKey=initialKey·segments=['retrieve','generate','validate']）·`:473` `const useRetrieval = kind === 'fundamental' \|\| kind === 'scenario'`·`:493-497` H2 #79 scenario 空素材降级早退（:494 `return approvedTemplateGeneration(scenarioDegradeTemplate(competency), …)`·:492 注释自证「零 fail 硬死、绝不静默拿空素材喂模型发明情景题」）·`:543` `model: promptedModel(d.model, 'interviewer.ask', …)`** |
| `apps/worker/src/generation-progress.ts` | `fb9490d4`（164 行） | **`:85-87` 头注自证「未接线观察 seam（unwired：生产调用方零命中——阶段1 仅 fake seam/prove 自调；生产非流式下恒静默，真流式链接线归后继刀）」·`:89-96` noteModelFirstToken（event_key=`generation:${attemptKey}:first-token` 幂等）·`:108-164` withGenerationProgress（:138 generation_started 幂等首写——ask 面该行 PASS 的写点）** |
| `packages/domain/src/crag.ts` | `255c1461`（79 行·只读引用） | **`:11-17` ScoredRef（ref/score/evidence?/availability?）·`:30-41` gradeRetrieval（:34 高分≥0.7→`use_local`·kept=score≥keep 全保留·:32 degraded→deny_external·:35 零命中→fallback_web）·`:76-77` `use_local` 臂 web 恒 `[]`（零 web 探索）** |
| `packages/domain/src/question-generation.ts` | `31079959`（150 行·只读引用） | **`:141-150` resolveCitedSources（:145 knownRefs 空恒 ok·:146 仅「引用了未知 ref」才 fail——citedRefs 空数组恒 ok）** |
| `packages/ai-runtime/src/model-client.ts` | `61471ed4`（1179 行·只读引用） | **`:1131` modelFor（CompletionRequest 携 service 全程绑定）·`:1175-1179` promptedModel（service 字面透传 modelFor）——proof fake seam :79 拦截条件在 ask 面可达的机制证据** |
| `packages/ai-runtime/src/invoke.ts` | `44e137f6`（1204 行·只读引用） | **`:738` sources/retrieval 仅 tracer 记录（零闸·fixture 供素材零旁出新闸面）** |
| `packages/domain/src/grounded-questions.ts` | `d9934dec`（48 行·只读引用） | **`:9` SourceDoc·`:10` GroundedQuestion·`:16-25` isVerbatimCopy（minRun=12 连续子串判抄——本刀夹具 web=[] sources 空不触）·`:31-48` validateGrounded 四门** |
| `packages/domain/src/question-critique.ts` | `92b7d6e3`（27 行·只读引用） | **`:11` QuestionCritique·`:13-27` critiqueQuestion 确定性四门（:21 too_short·:22 duplicate·:23 leading·:25 off_competency）** |
| `apps/worker/src/memory-service.ts` | `d01ce6c8`（35 行·只读引用） | **`:12-14` wasAsked（episode 归一化精确判重只读）·`:20-26` recordAskedQuestions·`:33-35` pastWeakDimensions（历史弱项只读投影）** |

### 0.2 派单 brief 漂移登记（结论零变·如实改锚）

1. **「落表」字面逐字核**：非「落错表」非「写链故障」=**缺行（恰零行）**——写链健康双对照：①quiz 面 `model_first_token` 落表 PASS（同 `writeEventRow`→`appendEvent` 链·`generation-progress.ts:93-95`）；②ask 面 `generation_started` 落表 PASS（同 stream_key=IID·同 :156 privacy 围栏夹具）。「落 interview_event 表」方向正确、败因在**写点从未被触发**（§1.2）。
2. **「19 assert 全 PASS·唯此 FAIL」口径亲证**：起草席隔离 PG 亲跑（§1.1 证据④）——**恰 20 臂=19 PASS+1 FAIL·FAIL 臂名逐字=`TS-P1 ask 面 model_first_token 落表`·EXIT=1**。臂总数熔断基准=恰 20。
3. **与 S4b token 通道（interview_token_ch 双 LISTEN 并集）/ssepush/UC003 关系=零因果·非「该愈未愈」**：S4b 治的是 token_delta 传输通道（`adaptive-interview-service.ts:461-463` 注释自证「pg_notify 不落表」·持久粗进度面零字节零回归）·sse-push 35/35 与 UC003 i18n 均零触本红面；本红在 S4b 之前已存在（§1.1 时间线）·S4b 卷明文「红承登·登记不洗」（出处②③）。ha2-drain C4 臂=另一独立既登基线红·与本刀零涉（Ban 借机修·§5）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**201**·头 `0201_qbank_fusion_owner_rank_org_dedup.sql`（与 tip SSOT「migrate 链 201」恒等）。本刀修法=纯测试夹具一行（§1-修法件①）·**预期零迁移零 DDL**。EXEC 期若实测产生非预期迁移需求→停（越界需要类）上报，认领号沿 negbend §0.3 同款协议（对届时链顶亲数+在飞题面复核后取最小未占号顺延）·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 时间线（回归窗钉死+红证据四重）

- **pre 形（`3acc6fb5`·2026-10-08 proof 诞生·绿基线）**：commit message 亲证「prove TS-P1..P5 fake-seam EXIT=0 (20 PASS, … first-token visibility 88ms)」——ask 面当时 scenario 型直达模型调用面（`:473` useRetrieval 扩 scenario 与 `:493` 降级早退均不存在）→fake seam :79 拦截命中→:163 onFirstToken 触发→落表→:179 绿。
- **post 形（`634eb645`·2026-10-11 h2-qbank-corpus EXEC·adaptive-interview-service.ts +55/-3）**：引入 `scenarioDegradeTemplate`（:184）+scenario 纳入 CRAG（:473）+空素材降级早退（:493-497·H2 #79 裁定）。**`git merge-base --is-ancestor 3acc6fb5 634eb645` YES 亲证=降级在 proof 之后**。proof 文件自诞生唯一后继变更=`86303901` 头注标注 +3 行（断言/驱动/fixture 零字节差·§0.0）→fixture 前提（scenario+双空检索）在 :493 早退面上恒真→**恒红**（非 flaky·确定性）。
- **红证据四重**：①S4b 卷 :209 红登③（出处②）；②S4b exec-receipt :25 同因归档（出处③）；③ci-wiring2 `86303901` 六件基线红登记（出处④）；④**起草席隔离 PG 亲跑 @基线等价树（主树 HEAD `edec8c96`·对 §0.1 四 blob 锚 `git diff --stat 3b32b6c8 edec8c96` 恒等亲证·tsp 树 node_modules ABSENT 故取等价树）**：EXIT=1·19 PASS/1 FAIL·FAIL 臂逐字恒等。精确首次红 commit 未逐臂考古（3acc6fb5..634eb645 窗内其他提交不改变机制现状）——机制存续至今 @`:493-497` 亲证·考古非本刀必需·S4b 承登在案。

### 1.2 红臂根因链（单向因果·每环 file:line 亲证）

1. proof `:171` 驱动 `retrieveAndGenerate('并发', 2, 0, 0, [], 'scenario')`——第 6 参 kind=**'scenario'**；`:168` 夹具 `localRetrieve: async () => []`+`webExplore: async () => []` **双空**。
2. `adaptive-interview-service.ts:473` `useRetrieval = ('scenario'==='fundamental'||'scenario'==='scenario')`=true→`:474-476` 走 `cragRetrieve`→`crag.ts:70` localRetrieve 返回 `[]`→`:35` `gradeRetrieval` 零命中→`fallback_web`·kept=[]→`:76-77` webExplore 返回 `[]`→**local=[] ∧ web=[]**。
3. `:493` `if (kind === 'scenario' && local.length === 0 && web.length === 0)` 恒真→`:494` `return approvedTemplateGeneration(scenarioDegradeTemplate(competency), …)` **提前返回**——`:543` `invoke({model: promptedModel(…)})` 所在 `generate` 闭包**零达**（H2 #79 裁定行为·非缺陷）。
4. 模型调用面零达→proof fake seam `:78-85` `complete()` 零执行（拦截条件 `:79` `req.service==='interviewer.ask'` 本可达——`:543`→`model-client.ts:1175-1179` service 字面透传亲证·**败因纯在「未达」非「不可达」**）→`:81` onFirstToken 零触发→`:163` `noteModelFirstToken(pool, OWNER, IID, …)` 零执行。
5. `generation-progress.ts:85-87` noteModelFirstToken 生产调用方**零命中**（unwired seam·全仓 rg 亲证唯一出参定义处）——IID 名下 model_first_token 行唯一潜在写点即此 fake seam·零触发即零行。
6. `:172` familyRows(IID) 查得行集无 model_first_token→`:179` `askRows.some(…)`=false→**FAIL**。同径 `:177` started 臂绿（`generation-progress.ts:138` generation_started 在 wrapper 进入即写·先于早退）·`:176` TS-P0 绿（模板返回 ok 携题面）——三臂观测与「早退后零模型调用」逐环吻合。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（否决·Ban）=产品修（noteModelFirstToken 生产接线）**：`generation-progress.ts:85-87` 明文「真流式链接线归后继刀」·tokstream-s3-design 同旨——越界另刀；且接线不救本红（早退路径零模型调用·无首 token 可记·语义上就不该有行）。
- **候选乙（否决·Ban）=断言反向改形（改断「降级路径零 model_first_token 行」）**：弱化证明族——ask 面经**真链**（withTokenStream+withGenerationProgress+invoke 包装）落 model_first_token 的能力证明将全仓缺位（quiz 面不经 adaptive 包装·`interview-service.ts` 直调）·且背离预注册「TS-P1 首 token 事件链」语义（token-stream-design.slice.md:58）。
- **候选丙（否决·Ban）=换 kind='behavioral'（一行换词）**：`:473` useRetrieval=false→零 CRAG——ask 面退化为「零检索直生成」·弃 retrieve→generate→validate 全链语义·与既 PASS 的 segments 断言（`:177-178`）所证全链面相违·夹具语义漂移大于必需。
- **候选丁（采纳）=夹具供一条本地检索素材（§1-修法件①）**：零产品码零断言文本零断言数变更·scenario 全链语义保全·确定性翻绿。

## §1-修法（断言改形=夹具修复刀·预期恰 1 测试文件 1 行·零产品码零迁移零断言增删）

- **件①（唯一码改）**：`apps/worker/test/tokenstream-progress.proof.ts` `:168`——
  改前：`    localRetrieve: async () => [], webExplore: async () => [],`
  改后：`    localRetrieve: async () => [{ ref: 'qbank:ts-scenario-1', score: 0.9 }], webExplore: async () => [],`
  （ScoredRef 形=`crag.ts:11-17` 逐字·score 0.9≥high 0.7→`gradeRetrieval`=`use_local` kept 非空→`:76-77` 零 web 探索→`:493` 早退谓词恒假→`:543` 模型调用面直达→fake seam :79 命中→:163 落表→:179 翻绿。旁闸逐核：`nativeRetrievalFailureToken('top=0.90≥0.70:…')`=null（`:18-21` 仅 embedder/reranker 族）；`isVerbatimCopy(q, docs=web=[])` 不触；`resolveCitedSources(knownRefs 非空, citedRefs=[])`=ok（`question-generation.ts:146` 仅未知 ref 才 fail）；AskSchema `:23` q/refs 形合法；invoke sources 仅 tracer 记录（`invoke.ts:738`）。**collateral=零**：IID 面无行数断言（P2/P4 仅 quiz 面 QID）·TS-P5 键白名单不受影响（model_first_token 载荷键 ⊆ ALLOWED·`:195`）·断言文本/断言数恰 20 恒等。**diff 预期=恰 1 文件 1 行改·其余 tracked 树零改**。）
- **件②（prove·恰 1 run 零 retry-to-green+改前必做 run）**：①改前必做 run（恰一次·不计 prove·分母自证）：`pnpm tokenstream:prove`→期望 EXIT=1·恰 19 PASS/1 FAIL·FAIL 臂逐字=`TS-P1 ask 面 model_first_token 落表`（对 §1.1 证据④ 恒等·漂移即触「现场漂移」停）；②改后 prove run（恰一次）：`pnpm tokenstream:prove`→期望 EXIT=0 **恰 20/20 全 PASS**（PASS 名单 diff 对改前分母恰 1 条=`:179` 臂翻绿·出第 2 条即停）。
- **件③（收据）**：`ai-docs/delivery/receipts/tsp1-firsttoken-fix/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后 PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）·untracked 口径（沿 negbend §9-11）。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十二门·数字口径以实跑实测为准+偏差熔断）

1. **tokenstream:prove 恰 20/20**：`pnpm tokenstream:prove` EXIT=0·臂总数恰 20（**熔断=0 容差**：≠20 即停「现场漂移」）·改前改后 PASS 名单 diff 恰 1 条=`:179` 臂（分母=件② 改前必做 run 本树名单）。
2. **s4b-invoke-delta:prove**：`pnpm s4b-invoke-delta:prove` EXIT=0·**12 臂**（基线登记值·下降即停·上升如实登记归因）。
3. **s4b-token-stream:prove**：`pnpm s4b-token-stream:prove` EXIT=0·**17 臂**（同上熔断）。
4. **s4b-delta-arm:prove**：`pnpm s4b-delta-arm:prove` EXIT=0·**21 臂**（同上熔断）。
5. **s4b-web-token-delta:prove**：`pnpm s4b-web-token-delta:prove` EXIT=0·**20 臂**（tip SSOT「四 proof 落值 12/17/21/20」·同上熔断）。
6. **model-client-stream**：`pnpm -C packages/ai-runtime prove:model-client-stream` EXIT=0·**56 PASS**（同上熔断）。
7. **sse-push:notify:prove**：`pnpm sse-push:notify:prove` EXIT=0·**35/35**（S4b 双 LISTEN 三通道并集愈合链·同上熔断）。
8. **migrate 链三门**：`pnpm migrate:prove` EXIT=0·链 **201** 头 `0201`（届值对链顶亲数如实记）；`node scripts/check-migration-version-uniqueness.mjs`→`files=201 violations=0`；`pnpm drift:prove` EXIT=0 零漂移。
9. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（**8/8**·0 cached 口径沿 SSOT）。
10. **lint 恰等**：`pnpm turbo lint` EXIT=0·五值恰等 **root 5235/web 601/api 1421/worker 954/ai-runtime 628**（tip SSOT sanctioned 值·0 errors·任一值上升=红停上报·下降如实登记）。
11. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**≤cap 2120**（基线 2117 本树亲跑·本卷后预估 2118 余 2·**>2120 红停上报**）。
12. **markers+diff 面机检+卫生**：markers 五类（i6-239 §2-7 口径·词面运行时组装防自指）改动集零命中；`git diff --numstat <base>` 恰 2 tracked 路径=件① .ts（1+/1-）+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）；`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（fake seam·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：`adaptive-interview-service.ts`/`generation-progress.ts`/`packages/**` 前后 blob 全等（§0.1 锚表）——含 `:493-497` 降级早退本体（H2 #79 裁定行为·候选甲否决沿承）。
2. **断言本体零触**：`:179` 断言文本/`:176`/`:177-178` 等 20 臂逐字恒等·零增删零重排（候选乙/丙否决沿承·Ban 为绿改断言——本刀改的是**夹具前提**非断言·断言承载的「ask 面能落 model_first_token」预注册语义原样保全）。
3. **S4b 通道面零触**：withTokenStream/onModelDelta/interview_token_ch/sse-push 双 LISTEN/健康门——皆零改（§0.2-3 零因果）。
4. **同簇基线红零触**：ha2-drain C4 臂、db-* 系基线红、web 渲染归 UI 刀、root 5235 sanction 消偿——皆另刀（STILL OPEN 各项·Ban 借机修）。
5. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——tokenstream TS-P1 基线红行翻面权归协调方 nail。
6. **零迁移零 DDL**（§0.3）·零 CI/wrapper/runner 改·零依赖升级。

## §4 依赖

**①上游已满足**：H2 #79 降级（`634eb645` 在链）=红因机制本体（只读对表·非修面对象）；S4b nail（`c102c12e` 并主线·tip `3b32b6c8`）=邻面六门基线值来源。**②无同文件并发**：proof 文件在飞预扫唯一命中=`line/model-token-stream` 已判历史残枝（§0.0·EXEC 立项日复扫）。**③迁移号**：§0.3 预期零。**④下游**：tokenstream:prove 20/20 恢复=「多波承登基线红」清偿前提·行翻面与 nail 排序归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 1 prove run+改前必做 run 恰 1·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触产品码/断言文本/断言数（§3-1/3-2·候选甲/乙/丙否决沿承）；Ban 接线 noteModelFirstToken 生产调用方（tokstream-s3-design 明文后继刀）；Ban 触 S4b 通道面（§3-3）；Ban 同簇基线红借机修（§3-4·ha2-drain C4 等既登红「登记不洗」沿承）；Ban 迁移 Ban DDL（§0.3·需则停上报走认领规则）；Ban 改共享 SSOT（§3-5）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红臂外新红（邻 proof 若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——起草席亲跑仅 tokenstream:prove 诊断一跑（fake seam 零模型外呼·隔离 PG·`actualSpendCny=null`）+docs:check 静态门·零生产操作·零 secrets·零消耗。EXEC 期 prove 同零模型外呼（fake-seam 面·本卷 §2-12 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面沿 i6-239 §2-7 口径·不复抄卷内防自匹配——沿 negbend/g7w 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `executed:awaiting_post_prove_dual`（§9 EXEC 落卷随翻·开工三条款已满足：①pre-exec 双审两外席 BOTH PASS 落卷（席1 `agent_674bdb29`+席2 `agent_1cc4a906` 会签）②协调方明示 EXEC 授权（committed SHA 重钉=`f548a2cb`）③立项零改 §1.2 根因结论/§5 Ban/pins/§1-修法件① 唯一码改面·停止条件四类全数未触（§9 亲证）·码面/门矩阵 EXEC 侧已收口·post 双审两外席待派·nail 与 TS-P1 基线红行翻面权归协调方/主会话批边界 · alone≠dual · ⛔ push）。** 开工三条款（起草卷原文存档）：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 根因结论与 §5 Ban/pins 与 §1-修法件① 唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞复扫必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如 `:473`/`:493-497` 早退面改写/noteModelFirstToken 被生产接线/fake seam 拦截形变更/proof 臂总数≠20/改前必做 run 红名单≠恰此 1 臂/§0.0 复扫残枝判定翻转）→停·重 pin 回炉。
- **机制不满足**：件② 改后 prove run `:179` 臂未翻绿或 quiz 面任臂意外翻红（fixture 供素材致旁闸新红如 unavailableGeneration/schema 闸重试）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法件① 恰 1 文件 1 行夹具面（需触产品码/断言文本/S4b 通道/迁移/同簇面）→停·另刀或协调方裁决（§1.3 候选甲/乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻 proof 新红/lint 值上升/docs:check>2120）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（EXEC 席落卷·2026-10-14·授权链=pre-exec 双审 BOTH PASS（席1 `agent_674bdb29`+席2 `agent_1cc4a906`）+协调方 EXEC 授权（committed SHA 重钉=`f548a2cb`）·收据=件③ `receipts/tsp1-firsttoken-fix/00-exec.md`（untracked·仓根非受管根·路径偏离见下））

**工序与 commit 链**：①工序 0 `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改（node_modules ABSENT 前置申明兑现）→②并主线 `git fetch`（origin tip 亲证=`5bd92ce8` 恒等派单值·`3b32b6c8` 为其祖先 merge-base --is-ancestor YES）→`git merge --no-ff feat/mysql-schema-skeleton`→merge commit **`51c310d2`**（双亲=`f548a2cb`+`5bd92ce8`·ort 策略·**零冲突**：merge-tree 预演冲突标记计数=0·实并零手解·8 文件 393+/6-·触及面与本刀零交·package.json lint 预算行 5224→5235 随主线 sanctioned 携入）→③§0 全量重 pin（十锚 blob 复算全恒等零漂移：proof `7f79c03f`/adaptive `373c4032`/generation-progress `fb9490d4`/crag `255c1461`/question-generation `31079959`/model-client `61471ed4`/invoke `44e137f6`+席1 P2 落锚新增 grounded-questions `d9934dec`/question-critique `92b7d6e3`/memory-service `d01ce6c8`·行号锚 file:line 逐一亲读恒等·§0.0 在飞复扫=`line/model-token-stream` 残枝判定维持非翻转）→④改前必做 run 恰一次→⑤件① 恰 1 文件 1 行夹具改（`:168`·diff numstat 1+/1-）→⑥改后 prove run 恰一次 20/20→⑦门矩阵十二门→⑧本 §9 落卷=EXEC commit。

**改前必做 run（件②①·恰一次不计 prove·`51c310d2` 树）**：`pnpm tokenstream:prove` EXIT=1·**19 PASS/1 FAIL**·红名单恰 `TS-P1 ask 面 model_first_token 落表` 逐字恒等（隔离收据 `.tmp/isolated-proof-receipts/2026-10-14T23-32-01-888Z-*` exit=1）——对 §1.1 证据④ 分母恒等·零现场漂移。

**件① 落点亲证**：`apps/worker/test/tokenstream-progress.proof.ts:168`——`localRetrieve: async () => [],`→`localRetrieve: async () => [{ ref: 'qbank:ts-scenario-1', score: 0.9 }],`（`webExplore: async () => []` 原样保持·ScoredRef 形=`crag.ts:11-17`·qbank-corpus-retrieve.proof :147-161 同款绿先例）·`git diff 51c310d2 --numstat`=恰 2 tracked 路径=本件 .ts（1+/1-）+本卷 .md（重 pin+P3 正字+§8 随翻+§9）·断言 20 臂文本/数恒等。

**门矩阵十二门终值（并线树基 `51c310d2`·EXEC commit 状态实测·全绿）**：

| # | 门 | 实测 | EXIT |
|---|---|---|---|
| 1 | tokenstream:prove | **20/20 全 PASS**·PASS 名单 diff（改前 19 分母本树自证）**恰 1 条**=`:179` 臂翻绿·零第 2 条·SSE 同形可见时延实测 84ms≤2500ms | 0 |
| 2 | s4b-invoke-delta:prove | PASS **12**/FAIL 0（隔离收据 exit=0） | 0 |
| 3 | s4b-token-stream:prove | PASS **17**/FAIL 0（隔离收据 exit=0） | 0 |
| 4 | s4b-delta-arm:prove | PASS **21**/FAIL 0·`✓ delta 臂矩阵全部通过` | 0 |
| 5 | s4b-web-token-delta:prove | PASS **20**/FAIL 0·`✓ web token_delta 矩阵全部通过` | 0 |
| 6 | model-client-stream | PASS **56**/FAIL 0·watchdog 实测=10003ms 总闸实测=1004ms | 0 |
| 7 | sse-push:notify:prove | **35/35**（双 LISTEN 三通道并集愈合链维持·隔离收据 exit=0） | 0 |
| 8 | migrate 链三门 | migrate:prove 全 PASS·链 **201** 头 `0201_qbank_fusion_owner_rank_org_dedup.sql`（merge 零新迁移）；uniqueness `files=201 violations=0 exemptions=0143,0152,0160`；drift:prove `✓ schema 无漂移` | 0 |
| 9 | typecheck | `pnpm turbo typecheck --force`=`Tasks: 8 successful, 8 total`·`Cached: 0 cached, 8 total` | 0 |
| 10 | lint 五值恰等 | 12/12 包全绿全 0 errors·**root `5235`/web `601`/api `1421`/worker `954`/ai-runtime `628` 全恰等**（余包 db 1042/domain 115/contracts 265/ai-graphs 47/qdrant-store 27 恒等随记） | 0 |
| 11 | docs:check | `scanned 2120`≤cap **2120** EXIT=0（**恰贴帽零余量**：2117 基线+本卷 REQUEST 1+merge 携入 admin-disable-evict/ag04-consumer-fix 两 REQUEST=2120·受管根新增件即 2121 PTP_FILE_LIMIT 红——件③ 收据因此落仓根非受管根·见偏离①） | 0 |
| 12 | markers+diff 面机检+卫生 | markers 五类（i6-239 §2-7 门词族·词面运行时组装防自指不复抄）改动集新增行零命中；diff 面=恰 2 tracked 路径（件① .ts 1+/1-+本卷 .md）+收据目录 untracked；frozen-lockfile EXIT=0 零 lockfile 改；根 `.env*` ABSENT（tracked 仅 docker/env/*.env.example 4 件模板既登恒等）；`actualSpendCny=null`·est live=0（fake seam 零模型外呼） | 0 |

**偏离登记（本席如实呈报·Ban 借机修沿承）**：①**件③ 收据路径偏离**：原定 `ai-docs/delivery/receipts/tsp1-firsttoken-fix/00-exec.md` → 实落仓根 `receipts/tsp1-firsttoken-fix/00-exec.md`（untracked 口径不变·七字段照交付）——根因=merge 携入 2 受管新件后 cap 2120 恰贴零余量·受管根落收据实测 `PTP_FILE_LIMIT:2121` 红（本席 A/B 亲证并回滚）；沿 `a76277f9`（evkind-scorecard-fix）「仓根非受管根零 docs:check 增量·untracked 交付」先例。②**席1 P3 三处正字**：本席客观可证仅 1 处（§0.0「复扫翻翻转」→「复扫翻转」·重复字机扫全卷唯一命中）已随 pin 改；余 2 处无席1 评审原文坐标·Ban 臆改未动——待协调方补发坐标或后继落卷。③**重复执行登记（非红冲销·零 retry-to-green）**：s4b-token-stream 误触 1 次 `:raw` 直跑（无隔离壳无收据·无仓库副作用·门证据以隔离壳收据 exit=0+17 臂首跑为准）；s4b-delta-arm 计数复核多跑 1 次（EXIT=0·21 臂恒等）；turbo lint 共 3 跑（全 EXIT=0 五值恒等）。④**多 worktree turbo daemon 风险观察**（沿 `a76277f9` 同族登记）：本树 lint 五值恰等 sanctioned 值+typecheck 8/8 与非污染形态自洽·未动共享 daemon（Ban 触其他工作树）。

**停止条件四类全数未触**（现场漂移=十锚 blob 复算零漂移+§0.0 残枝判定维持+改前红名单恰此 1 臂；机制不满足=`:179` 臂翻绿+quiz/report 面 19 臂零意外红；越界需要=修法恒等件① 恰 1 文件 1 行夹具面；验收红不可修=十二门全绿·cap 贴边经偏离① 合规消解）·**§1.2 根因结论/§5 Ban/pins 十一值/§1-修法件① 唯一码改面零改零翻转**。

**STOP · `executed:awaiting_post_prove_dual` · 码面/门矩阵 EXEC 侧已收口·post 双审两外席待派 · nail 与 TS-P1 基线红行翻面权归协调方/主会话批边界 · alone≠dual · ⛔push**

---

*TSP1-FIRSTTOKEN-FIX REQUEST · 2026-10-14 起草 · **`executed:awaiting_post_prove_dual` @并线树 `51c310d2`（§9 EXEC 记录·门矩阵十二门全绿·tokenstream 20/20 翻绿·post 双审待派·nail/行翻面归协调方）**（起草落卷=docs-only 恰 1 .md·EXEC 落卷=本 commit·⛔push）· base `feat/mysql-schema-skeleton` @`3b32b6c8`（origin tip 亲证）· 分支 `line/tsp1-firsttoken-fix` · 工作树 `meetwise-tsp`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief+S4b 卷 :209 红登③+S4b exec-receipt :25 同因归档+ci-wiring2 `86303901` 六件基线红登记+tip STILL OPEN · 红臂=`apps/worker/test/tokenstream-progress.proof.ts:179`· 根因=**断言过时（fixture 前提被 H2 #79 产品裁决作废）**——`634eb645` 引入 `adaptive-interview-service.ts:493-497` scenario 空检索降级早退（:494·裁定行为非缺陷）·proof `:168` 双空检索夹具+:171 kind='scenario' 恒落早退→`:543` 模型调用面零达→fake seam `:79-81` 零触发→noteModelFirstToken（`generation-progress.ts:89`·生产零调用 unwired seam）零执行→IID 零 model_first_token 行·「落表」字面核=缺行非落错表（quiz 面同写链绿+ask 面 generation_started 同围栏绿双对照）·与 S4b interview_token_ch 双 LISTEN/ssepush/UC003 零因果（S4b 治 token_delta pg_notify 传输态·本红持久面且写点未触发·S4b 前已存在·卷内明文登记不洗）· 修法裁决=**断言改形（候选丁）**：恰 1 测试文件 1 行夹具改（`:168` localRetrieve 供一条 `ScoredRef{ref:'qbank:ts-scenario-1',score:0.9}`→use_local→早退谓词恒假→全链真达模型面）·候选甲（产品接线·后继刀）/乙（反向断言·弱化证明族）/丙（换 kind·弃 CRAG 全链）否决在卷· 断言文本/断言数恰 20 恒等· 门矩阵十二门（tokenstream 20/20+邻面六门 12/17/21/20+56+35/35 不回退+migrate 链 201 三门+typecheck 8/8+lint 五值恰等 root 5235+docs:check≤2120 红停+markers+diff 面机检+卫生）· 迁移预期零（需则链顶顺延认领）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
