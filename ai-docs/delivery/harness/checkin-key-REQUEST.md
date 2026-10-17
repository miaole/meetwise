# CHECKIN-KEY REQUEST — #185 打卡键校验小刀（growth/学习域·批2 H7 挂账残件·三探针零迁移·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷·pre-exec 双审两独立外席待派·alone≠dual·⛔push）

**席位**：meetwise 战役「CHECKIN-KEY 打卡键校验小刀」诊断+起草席（批2 残件盘点 #185·H7 挂账归域刀·协调方派单 brief 2026-10-16·工序=fetch 建支线→读码定稿→起草 REQUEST→markers/docs:check→自检落卷 commit）。
**基线**：`feat/mysql-schema-skeleton` @ `7c602df02`（origin tip 亲证·fetch 后 `git rev-parse origin/feat/mysql-schema-skeleton`=`7c602df02d29c2b8839f9df208f18a6190d6b6ca`·tip commit 2026-10-18 01:56:57 +0800=merge(reserve-renew-fix) nail 波 tip）· 分支 `line/checkin-key`（主仓 `git worktree add ../meetwise-ck -b line/checkin-key origin/feat/mysql-schema-skeleton` 本起草席亲立·**建时即落战役主线 tip 零 reset**·与姊妹卷 session-summary-deepen §0.2-1 先例不同：本席 worktree add 直引 origin ref 无漂移窗口）· 工作树 `meetwise-ck`（仓根同级）。
**前置闭证（派单要件）**：H4 WEAKNESS-LOOP 主体已闭——`git merge-base --is-ancestor 9c4c0f9e HEAD` EXIT=0 本席亲证（nail `9c4c0f9e`=H4 六件 #252/#214/#205/#206/#203/#269 全闭·LEDGER :299 终核条目承）；#121 弱项语义半已落 `interview-learning.ts:46-60`（5E 2026-10-12·文件内注自证）。本刀不重做 H4 面，只收 #185 残面。
**立项出处（批表 #185 行·不自建行）**：
1. **审计总表本体行原文**：issues-master 更正版（`~/Documents/Meetwise产品审计-更正版/issues-master.md` **:425**·仓外上游·逐字）「`| #185 | P3 | 技术缺陷 | 评估/学习/职业路径 | 学习打卡以 topic 文本（能力名）为键且不校验存在性，任意 1–200 字串可写入，且 complete 不要求学习计划存在；… | apps/api/src/modules/interview/interview-learning.ts:35-37,44-47；packages/db/migrations/0019*.sql:37-44 | 仍存在 | 已核实（键/校验缺失）… | 学习项用稳定 item id 作键；complete 时校验 topic 属于当前计划 | #214 | — | 第2批 | … |`」——审计行锚 file:line 系审计快照·现树漂移见 §0.2-1（修法列前半「稳定 item id 作键」=候选甲否决·§1.3）。
2. **批表盘点行原文**：`ai-docs/delivery/harness/batch-residual-plan.md` **:62**（批2 散件族行）「`| #38/#73/#80/#119/#171/#173/#185/#200/#213/#49/#160/#163/#48/#201/#202 | 散件族：…——LEDGER「各归域刀或 5E」 |`」+**:102**（H7 行）「`| H7 | 挂账（不立刀） | #38/#73/#80/#119/#171/#173/#185/#200/#213/#49/#160/#163/#48/#201/#202 | LEDGER「各归域刀或 5E」·…余归 5E/W9 | — |`」。
3. **LEDGER 现状**：`ai-docs/delivery/harness/product-campaign-LEDGER.md` **:59**「`余 #38/#73/#185/#49 🆕 各归域刀或 5E`」+**:210** 批2 行「`残 4：#199（裁后刀·部分面）+H7 挂账 3 件 #38/#73/#185（归 5E/域刀…）`」——本刀=该挂账件之域刀立项起草·行翻面权归协调方。
4. **刀位**：`ai-docs/delivery/harness/TASK-SOP-v2.md` **:64** 杂项行 8「`| 8 | 杂项（#38/#73/#80/#119/#171/#173/#185/#200/#201/#208/#213+#46✅+#48/#49） | 各归域 |`」。
5. **批2 计件**：LEDGER :210 残 4 内 H7 挂账 3 件之一；#38/#73 非本刀（校准联动/ASR 质量·各归其域），#185 唯一本刀收口对象。

**必读清单（EXEC 开工前逐件亲读·显式路径）**：`AGENTS.md`（总则+生成前门禁）·本卷·`apps/api/src/modules/interview/interview-learning.ts` 全文（64 行）·`apps/api/src/modules/interview/interview.service.ts` :795-810·`apps/api/src/modules/interview/interview.controller.ts` :225-235·`packages/contracts/src/index.ts` :178-184 与 :1460-1465·`packages/db/migrations/0019_schema_drift_reconcile.sql` :37-44·`packages/domain/src/learning.ts` 全文·`packages/db/src/growth-generation.ts` :55-70·`apps/worker/src/weakness-backfill.ts` 全文·`apps/worker/src/adaptive-interview-service.ts` :361-379·`apps/api/test/neg-interview.proof.ts` :440-456·`apps/api/test/validate.ts` :464-486·`apps/worker/test/weakness.proof.ts` :105-115·`ai-docs/skills/testing/sop.md`+`ai-docs/skills/testing/fail-closed-gate.md`（P0 测试门）。

## §0 普查定稿（起草席亲读·file:line/blob 逐条 rg/sed/Read/git hash-object 实测 @`7c602df02`·**EXEC 立项照本节对届时 tip 全量重 pin**——基线漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）

### 0.0 防重双对表 + 在飞交叠复核

- `git branch --list "line/checkin-key"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep checkin-key` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠全支线扫描（本席亲跑·对 §1-修法码径·非祖先本地支线顶触检验 @起草时点）**：晚于基线 `7c602df02` 的非祖先支线顶触——`line/db-hotspot`@`e37790e4a`（2026-10-18）**触本刀主文件**：`git diff ce4bfd1d..line/db-hotspot -- apps/api/src/modules/interview/interview-learning.ts` 亲证恰 1 hunk=**#121 探针 SQL 内一行** `interview_privacy_active(ar.interview_id)`→`interview_privacy_active_read(ar.interview_id)`（读分层性能件·b3e5a4890「数据库热点三件」·另携 `interview.service.ts` 与新迁移 `0206_interview_privacy_active_read_tier.sql`）；对本刀三探针插入位（§1-修法 件① 三块=函数尾注区+INSERT 后邻区）**零 hunk 交叠·ort 可自动并**——但同函数编辑事实成立，EXEC 立项日必做复核：db-hotspot 若先并线→基线含 read-tier 形（件① 定稿文本内 #121 探针行照届时树原样·锚随改）·本刀先并线→db-hotspot 并线时其单行改写对并后树重放。任一形态漂移出上述单行改写范围→触 §8 停止条件「现场漂移」停手上报。`line/trace-recon`@`311bfddfd`/`line/lint-cap-step`@`0bef0f53d`/`line/context-budget-wire`@`fe4079a07`/`line/uuid-id-check`@`f7caa2060` 四枝对四码径（interview-learning/interview.service/neg-interview.proof/validate.ts·contracts/migrations 零触）`git diff --name-only` 亲证零命中。**proof 径在飞**：`line/audit-close-batch1`@`0e729c833`/`line/graph-fence`@`5b2f4c39e` 均基线祖先（EXIT=0）非在飞。
- **docs cap 交叠（横切）**：cap 现值 2240 · 基线树 docs:check scanned **2240 恰等零余量**（本席 `node scripts/ai-docs/check-docs.mjs` EXIT=0 亲跑·谱系=checklist :3620 reserve-renew nail 届值「cap 2240 现值 2240 余 0」恒等）——**本卷 +1 必越限**：落卷树 scanned=2241>2240→`PTP_FILE_LIMIT:2241` 红·唯一错误=FILE_LIMIT（policy 扫描 early-return 形·内容侧零涉）·**计数预算红非内容策略红·cap sanction 权归协调方·Ban 自升**·沿 N-19 先例（public-text-policy.mjs :85-88 sanction 注记栈自证「N-19 REQUEST 触顶 PTP_FILE_LIMIT:2233>2232 红停承登·授权随令」cap 2232→2240 随刀 sanction）——本刀同形申请：**cap 2240→2248 sanction 待协调方随令**·sanction 落码前本卷树 docs:check 门维持红停承登态（§2-11/§8 如实载）。EXEC 收据 +1 亦入预算（预期 sanction 后终树 2242≤2248 余 6）。

### 0.1 blob 锚表（`git hash-object` 前 8 位亲算·base=@`7c602df02`）

| # | 文件 | blob | 行数 | 关键行锚（亲读） |
|---|---|---|---|---|
| 1 | `apps/api/src/modules/interview/interview-learning.ts` | `109a1985` | 64 | **打卡主径函数 `completeLearningItemFor` :51-64**（:45-50 #121 注与「如实注」·:52-53 guard·:54-59 #121 弱项探针 SQL=assessment_report gap 维度 btrim 精确·:60 `invalid_topic` 400·:61 `INSERT INTO learning_progress … ON CONFLICT DO NOTHING`·:63 `{done:true}`）；:19-30 generateLearningPlanFor（409 assessment_required 信封先例 :25-27）·:32-43 getLearningPlanFor（**:38 done Set=progress.topic 原文·:39 `done.has(it.topic)` 原文精确匹配=打卡键读回面**） |
| 2 | `apps/api/src/modules/interview/interview.service.ts` | `cf23ed37` | 906 | **:801-806 `completeLearningItem` facade**（:803 `denyPublicPreviewWrite`·:804 `missing_topic` 400·:805 薄委托）·:26 import 三函数 |
| 3 | `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae` | 280 | **:230-233** `@Post(':id/learning-plan/complete')`+`ZodValidationPipe(LearningCompleteDto)` |
| 4 | `packages/contracts/src/index.ts` | `1050feeb` | 1630 | **:181-183** `LearningCompleteDto = z.object({ topic: z.string().min(1).max(200) })`（:181 注释自证「topic 是落库键,1–200 字」=**任意 1-200 字串契约面**）·:1463 apiContract 行（request=LearningCompleteDto） |
| 5 | `packages/db/migrations/0019_schema_drift_reconcile.sql` | `51302acf` | 70 | **:37-44 learning_progress DDL**（topic text NOT NULL 裸列·**PK(owner_user_id,interview_id,topic)·零 FK 零 CHECK**·items 非此表——计划项在 learning_plan.items jsonb 内） |
| 6 | `packages/domain/src/learning.ts` | `49676114` | 17 | **:7-17 `deriveLearningPlan`**（gap 维度→items·:12 `topic: d.dimension` **逐字**=计划项 topic 与评估维度单源同文） |
| 7 | `packages/db/src/growth-generation.ts` | `b575214b` | 89 | **:59-69 `generateLearningPlanCore`**（:61 无评估行→`assessment_required`·:63-67 upsert `ON CONFLICT (owner_user_id,interview_id) DO UPDATE items`） |
| 8 | `apps/worker/src/weakness-backfill.ts` | `8af323cc` | 68 | **:11-13 边界注**「仅勾选『learning_plan 已派生项』」·**:57-63 R7 匹配+INSERT**（:58 `weaknessMatches(g,topic)` 选择器·:60 写入 `topic`（item.topic **trim 后原文**·:56）——worker 径 topic 恒为计划项原文=本刀不变量既成侧证） |
| 9 | `apps/worker/src/adaptive-interview-service.ts` | `84b3e584` | 798 | **:366 `WEAKNESS_MATCH_THRESHOLD=0.5`·:368-374 `weaknessMatches`**（normalizeQuestion 归一精确相等短路→双向 relevanceScore 词元+CJK bigram ≥0.5·确定性零 embedding=#203 语义匹配终形）·:375-379 biasByPastWeakness 消费 |
| 10 | `apps/api/test/neg-interview.proof.ts` | `06f8e249` | 672 | **:442-455 learning 段**（:444-447 计划 POST 409 assessment_required·:448-451 GET 404/越权·**:452-453 complete 缺 topic→400 invalid(zod)**·:454-455 未鉴权 401）——**现树 invalid_topic(#121 400) 臂零条**（rg 全测试面亲证·#121 先例同·如实登记） |
| 11 | `apps/api/test/validate.ts` | `e54ae969` | 695 | **:464-486 growth 打卡主链臂**（:466 无评估先建计划→409·:467 据评估生成→200·:471-472 progress 初始 0·:473-474 动态 topic0=items[0].topic 打卡→**200+done 反映**·:476-477 幂等仍 200·:478 缺 topic 400）——打卡正链唯一承重 proof·**新探针下 topic0∈items 恒存活**（plan 由同源 dims 派生） |
| 12 | `apps/worker/test/weakness.proof.ts` | `1bf021a7` | 260 | **:110 S29 臂**「回灌只写 learning_progress(INSERT INTO learning_plan 零命中=Ban 一次性覆盖写)」——worker 径护面·本刀零触恒等 |

**门基线锚（对届时实测）**：neg:all 六段序=auth commerce resume interview bend input（`apps/api/package.json` :77·root `package.json` :120 `run-e2e-isolated` 隔离 wrapper）——姊妹卷 2026-10-16 载 687 总臂·AG-16 卷载 692·**本刀零新 neg 段臂语义面外无增减·届时亲跑对登记**·api:validate root :99 隔离 wrapper·prove:interview worker package.json :17（姊妹卷 2026-10-16 载 57 臂）·prove:weakness worker :159（26 臂族·S29 在内·届时亲跑）·迁移链 **205 文件头 0205**（`ls packages/db/migrations | wc -l`=205 本席亲数·0205_ai_graph_run_observability_columns 在树·本刀零迁移）·docs:check cap **2240**（`scripts/ai-docs/public-text-policy.mjs` :112 `MAX_FILES = 2_240`·:85-88 sanction 注记栈）·lint 帽值行 root `package.json` :8 `--max-warnings 5240`·lint 届值锚=checklist :3617-3620（reserve-renew nail：root 5240/worker 959 **恰等贴线**·web 601/api 1421/ai-runtime 628/db 1042 全 0 errors）·typecheck 8/8。

### 0.2 口径漂移登记（结论方向零变·如实改正）

1. **审计行锚漂移**：#185 行 file:line（interview-learning.ts:35-37,44-47）系审计时点快照——H4/#121 落码后现树对应区=:51-64（completeLearningItemFor 三段）+:38-39（GET done 读回面）·结论不变只更锚；contracts :165→现 :182 同漂。
2. **「任意 1-200 字串可写」对现树界定**：契约层（:181 DTO）仍任意 1-200 字串放行；应用层 #121 已拦「非本场 ready 评估 gap 维度」（2026-10-12 落）——**残面=键仍 topic 自由文本且存在性只对评估维度不对学习计划**：①complete 不要求 learning_plan 行存在（无计划打卡→行落 learning_progress·GET 读不回=死行·P3 本体）②维度∈当前评估 ∧ ∉计划 items（评估重算后计划陈旧）→仍 200 落死行 ③worker 回灌径写计划项原文（:56 trim）而手动径键语义与其无共同校验单源——三残面共同根=**打卡键无「∈本场计划 items」存在性校验**（本刀修法本体）。
3. **「稳定 item id 作键」修法列与零迁移裁量**：items 系 learning_plan 表 jsonb 数组内嵌（0019 :37-44 区+growth-generation :63-67 upsert 形状冻结·H4 卷「upsert 形状冻结」纪律）——稳定 id 键=表重构或 jsonb 内 id 化+全读回面（GET :37-42/worker :52-64/web 报告页「去练」focus=topic 文本）随迁=**迁移+多径改造**·与派单「零迁移裁量」正面冲突→候选甲否决（§1.3）·审计行括注自承「维度名变化」系推断面（同场重生成输入为不可变 score_card·维度名不变）——残面实害=陈旧计划窗口非命名漂移常态。
4. **btrim 微差边（如实登记·零触面）**：#121 探针 DB 侧 btrim、参数侧原文（:58）；GET done 读回原文精确（:39）；derive topic=d.dimension 原文（learning.ts :12）——维度名含首尾空白时（现实≈0：维度名=score_card competency 名·种子与模型输出无首尾空白）打卡键与计划项文本存在理论失配窗；**本刀不扩去触 GET/derive（行为面冻结）**·三探针 fail-closed 形使失配参数在被 ② 拦截后永不落行（宁拒不错·§1-修法注）。
5. **批表 H7 挂账「不立刀」对本刀**：H7 行原文「挂账（不立刀）…各归域刀或 5E」——本刀=「归域刀」支行使然（派单 brief 明立 CHECKIN-KEY 域刀）·不与「不立刀」冲突（该语指 H7 不设统一大刀·件归各域）·如实澄清。

### 0.3 迁移号登记（预期零迁移）

- 本刀修法=纯应用层校验（三探针 SQL SELECT·零 DDL 零新表零约束）·**零迁移零 schema 变更**。FK 路线否决见 §1.3（jsonb 内嵌不可 FK·FK 即迁移）。EXEC 期若实测产生迁移需求→停（越界需要类）上报。在飞 db-hotspot 0206 系他刀件·不计本刀。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 打卡写入链现形（三段全亲证 @`7c602df02`）

- **① 契约层（任意字串放行面）**：POST `/interview/:id/learning-plan/complete`（controller :230-233）→`ZodValidationPipe(LearningCompleteDto)`→`topic: z.string().min(1).max(200)`（contracts :182）=**任意 1-200 字串过契约**（:181 注释自证「topic 是落库键」）；`learning_progress.topic` 裸 text 列零 FK 零 CHECK（0019 :37-44）=**表层任意字串可写面**（对 app_role INSERT 直通·0096 GRANT 承）。
- **② 应用层（#121 已拦半）**：service :801-806（missing_topic 400→薄委托）→`completeLearningItemFor`（interview-learning :51-64）：guard→**#121 弱项探针**（:54-59 topic 必须=本场 ready assessment_report 某 `gap=true` 维度名·btrim 精确）→`invalid_topic` 400→INSERT（:61）ON CONFLICT DO NOTHING。**探针对象=评估维度非计划 items**：`learning_plan` 行存在性与 topic∈items 两事零校验（rg :51-64 全文亲证零 learning_plan 字样）。
- **③ 读回面（死行不可见）**：GET learning-plan（:32-43）：`done` Set=progress.topic 原文·items 逐项 `done.has(it.topic)`（:38-39）——**progress.topic ∉ items[].topic 的行=永不反映的死行**（进度恒不涨·审计黑面）；worker 回灌径（weakness-backfill :52-64）写 item.topic trim 原文=恒可读回，手动径无此保证=**两写入径键语义无共同校验单源**。complete 成功路径唯一测试承重=validate.ts :473-477（动态取 items[0].topic→200/幂等——正链恒过·负链死行面零臂）。
- **后果链**：无计划打卡（P3 本体·审计行原文「complete 不要求学习计划存在」）→200 落行→GET 无计划 404（:36）→行悬空；评估重算后陈旧计划 items 打卡→200 落行→GET done 恒 false→「打卡了进度不动」。零数据损坏·纯审计/一致性面（P3 定级亲核）。

### 1.2 语义匹配邻项（#203 弱项语义——打卡 topic 对计划 topic 的匹配形态）

- **#203 终形已落（H4 @9c4c0f9e）**：`weaknessMatches`（adaptive-interview-service :368-374·threshold 0.5 :366）=归一化精确相等短路→词元+CJK bigram 双向 relevanceScore 取最大 ≥0.5——**确定性零 embedding**。消费面两口：worker 回灌选择器（weakness-backfill :58 `gaps.some((g)=>weaknessMatches(g,topic))`）+开面偏置 biasByPastWeakness（:375-379）。
- **匹配形态分工（本刀定谳·登记为邻项纪律）**：#203 weaknessMatches=**跨场选择器层**（「哪个弱项命中哪个学习项」·模糊语义域）；打卡键存在性=**本场写键层**（「这个 topic 文本是否是本计划的一项」·精确文本域）——**写键校验不采用 weaknessMatches**（§1.3 候选丙否决：模糊命中多义键+与 GET :39 原文读回/worker :56 原文写入两既成原文语义冲突），沿 #121 探针同形 **btrim 精确**（沿现形·SQL 形逐字同构仅换表/json 路径）。回灌「选择后写计划项原文」事实（:56-60）=本刀不变量「progress.topic ⊆ 本场 items[].topic（trim 域）」的 worker 侧既成侧证；本刀使手动径同归该不变量——**两写入径自此共一校验单源**。
- **Non-claims**：本刀零触 weaknessMatches 本体/阈值/回灌选择器（#203 面全零字节）·零触 memory/偏置消费（:375-379）·「语义弱点去重」等 #203 后继残面不预支（LEDGER #51 残面注记承）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=应用层三探针·零迁移**（§1-修法）：计划在先探针（409 plan_required·信封沿 assessment_required 409 先例形 interview-learning :25-27 亲证）+#121 探针原样零字节+计划项存在性探针（400 invalid_topic·沿 #121 SQL 同形）——沿现形·零迁移·fail-closed·两写入径共单源。
- **候选乙（否决·Ban）=FK/稳定 item id 迁移**：issues-master :425 修法列前半「学习项用稳定 item id 作键」——items 系 jsonb 内嵌不可 FK·id 化=表重构+读回面全迁（GET/worker/web 焦点面）+迁移号占用·与零迁移裁量正面冲突·§0.2-3 承（残面实害=推断面）。
- **候选丙（否决·Ban）=weaknessMatches 语义匹配写键校验**：模糊命中多义（一 topic 可匹配多 item·键歧义）+与 GET 原文读回/worker 原文写入既成语义冲突+确定性测试面爆炸——#203 语义层留选择器域（§1.2 分工）。
- **候选丁（否决·Ban）=打卡域重构**（progress 表重铸/键改 (owner,interview,item_id)/回灌手动径统一改写）：P3 审计面救济不要求域重构·行为面爆炸违最小刀纪律·回灌径已守不变量零需改。
- **候选戊（否决·Ban）=存量死行清洗迁移**：0148 先例「不洗存量数据」（亲证 :56 RAISE EXCEPTION 前置批注）·死行=读不回惰性数据零实害·清洗属后继数据治理面不预支。
- **候选己（否决·登记）=GET done 读回面改 btrim 匹配**：可顺带兜 §0.2-4 微差边·但属 GET 行为面变更（读回语义漂移·零迁移不等于零行为）·收益≈0（现实维度名无首尾空白）→留后继·本刀 fail-closed 已使失配参数不落行。

## §1-修法（恰 4 码/test 路径：1 新 3 改·零迁移·**以下定稿文本 ⛔ 不得更改——EXEC 逐字节照抄·Ban 自由发挥**）

- **编辑顺序纪律**：件①→②→③→④ 依序；或内容锚 rg 定位套用·禁按卷面行号盲套（并线后行号漂移以内容锚为准·db-hotspot 先并线时件① 内 #121 探针行照届时树原样·read-tier 形见 §0.0）。
- **件①（`apps/api/src/modules/interview/interview-learning.ts`·改）**：`completeLearningItemFor` 事务闭包内、guard 之后 #121 探针之前插入计划在先探针；#121 探针块**零字节零触**；INSERT 行之后（:61 后·:63 return 前）插入计划项存在性探针。插入块定稿文本：
```ts
    // #185 CHECKIN-KEY 三探针（应用层校验·零迁移·沿 #121 SQL 现形）：打卡键=本场学习计划项。
    // ① 计划在先——无 learning_plan 行打卡=P3 残面（complete 不要求学习计划存在）→ 409
    //   plan_required（信封沿本文件 assessment_required 409 先例形；手动端点前端未接线·
    //   apps/web 报告页注释自证「手动端点保留不接前端=修法原文二径取一」·零 blast radius）。
    // ② #121 弱项探针原样保留（真实弱项审计面不松·零字节）。
    // ③ 计划项存在性——topic∈本场 learning_plan.items（btrim 精确·与 #121 探针同形）→
    //   400 invalid_topic。匹配形态=btrim 精确（写键=计划项文本原文）；#203 语义匹配
    //   weaknessMatches 留跨场选择器域不用于写键校验（REQUEST §1.2 分工/§1.3 候选丙）。
    //   fail-closed：探针不过即拒，失配参数永不落行（宁拒不错·死行面收口）。
    const plan = await c.query(
      'SELECT 1 FROM learning_plan WHERE owner_user_id=$1 AND interview_id=$2 LIMIT 1', [principal, id]);
    if (plan.rowCount === 0) throw new HttpException({ error: 'plan_required' }, HttpStatus.CONFLICT);
```
```ts
    const inPlan = await c.query(
      `SELECT 1 FROM learning_plan lp, jsonb_array_elements(lp.items) it
       WHERE lp.owner_user_id=$1 AND lp.interview_id=$2
         AND coalesce(btrim(it->>'topic'),'')=$3
       LIMIT 1`, [principal, id, b.topic]);
    if (inPlan.rowCount === 0) throw new HttpException({ error: 'invalid_topic' }, HttpStatus.BAD_REQUEST);
```
（插入位：块一=guard 行后邻区；块二=既有 INSERT 行后邻区·文件头 #121「如实注」之后 append 一行「#185（CHECKIN-KEY 2026-10）三探针承：打卡键收敛为本场 learning_plan.items·两写入径共一校验单源（#121 探针零字节保留）」·append 不洗旧注。）
- **件②（`apps/api/test/neg-interview.proof.ts`·改）**：:453 臂后邻区插入恰 1 臂：
```ts
A('learning-plan/complete 无计划 → 409 plan_required(#185 CHECKIN-KEY)',
  is(await h.post('/interview/IV_ASMT/learning-plan/complete', A_, { topic: '分布式锁' }), 409, 'plan_required'));
```
（IV_ASMT=neg-harness :251 既成夹具·completed 态零 assessment_report 零 learning_plan·探针① 命中路；topic 取夹具问题词面非维度语义·任意 1-200 串等价。`:452-453` 缺 topic 400 zod 臂在其前恒过=契约层零变实证。）
- **件③（`apps/api/test/validate.ts`·改）**：两臂——a) :466 臂（无评估先建计划 409）后邻区插入：
```ts
  r = await postJson('/interview/R1/learning-plan/complete', { 'x-user-id': 'userA' }, { topic: '任意串' }); A('无计划打卡 → 409 plan_required(#185·探针只读零副作用·不染后序 R1 臂)', r.status === 409 && r.body.error === 'plan_required');
```
b) :478 臂（缺 topic 400）后邻区插入：
```ts
  r = await postJson('/interview/ASMT/learning-plan/complete', { 'x-user-id': 'userA' }, { topic: '计划外维度名' }); A('计划存在而 topic∉维度 → 400 invalid_topic(#185·#121 探针原样)', r.status === 400 && r.body.error === 'invalid_topic');
```
（R1=validate 既成夹具（active 无 assessment_report 无 learning_plan·:466 注自证）·探针只读不落行零状态副作用·时序在 :467 计划生成前不染后序臂；臂 b 的 topic 非本场 gap 维度→被零字节保留的 #121 探针拒·**信封契约面钉死**——③ 探针与 ② 在计划同源同文时条件集恒等（§1.2/§0.2-4）、其独立触发面（陈旧计划）无廉价夹具构形·臂 b 钉 400 信封+既有 :473-477 正链 200 钉 ③ 放行面·双面合围·invalid_topic 独立臂零条=**#121 先例同态如实登记**。:473-477 动态 topic0 正链臂零改动恒存活=plan 由同源 dims 派生亲证（learning.ts :12）。）
- **件④（本卷 `.md`·新）**：本 REQUEST。
- **守恒断言**：diff 对届时主线 base 恰 **4 tracked**（件①②③ 3 码/test+件④ 本卷）·多任何 tracked 路径即停；`packages/contracts`/`apps/worker`/`packages/db`/`apps/web` 零字节（#203 面/回灌径/GET/derive/DDL 全零触·§3 承）。

## §2 门矩阵（growth 邻面·EXEC 期亲跑全绿方过·起草 turn 仅跑 ⑪⑫⑬）

| # | 门 | 行使形 | 过线 |
|---|---|---|---|
| 0 | 改前基线 run（恰 1 次） | 件①-③ 路径 blob 对 §0.1 锚恒等亲证+`node scripts/ai-docs/check-docs.mjs` 届值登记 | EXIT=0（cap 红态如实承登·见 ⑪） |
| 1 | growth 正链 proof | `pnpm api:validate`（root :99 隔离 wrapper）——:464-486 段全绿含新 2 臂（件③）·打卡 200/幂等/done 反映恒等 | 0 FAIL |
| 2 | neg 邻段 | `neg:interview`（:442-455 存活+新 plan_required 臂）→并入 ③ | 0 FAIL |
| 3 | neg:all 六段 | `pnpm neg:all`（root :120 隔离 wrapper·auth/commerce/resume/interview/bend/input 序）——neg-input :146-268 complete is4xx/noCrash 臂族恒绿（409∈4xx·信封升格不破 4xx 断言·亲核） | 总臂对届时登记·0 FAIL |
| 4 | worker 回灌邻面 | `pnpm --filter @meetwise/worker prove:weakness`（:159·S29 :110 恒等·worker 零触机械保证） | 对届锚恒等·0 FAIL |
| 5 | interview 邻面 | `pnpm --filter @meetwise/worker prove:interview`（:17·对届锚·零触面） | 对届锚恒等·0 FAIL |
| 6 | migrate:prove | 隔离库真迁移链·**205 头 0205 对届锚**（本刀零迁移·链值届时如实·db-hotspot 若已并线为 206 头 0206 亦如实） | 全 PASS |
| 7 | drift+uniqueness | 届时既定形（exemptions 对届登记） | 零漂移 |
| 8 | typecheck | `pnpm turbo typecheck --force` | 8/8·0 cached |
| 9 | lint 五值贴线 | `pnpm turbo lint` 全任务·届值对 checklist :3617-3620 锚（root 5240/worker 959 **恰等贴线**·web 601/api 1421/ai-runtime 628·届漂以实测为准）·全 0 errors | 贴线零新增 |
| 10 | docs:check | `node scripts/ai-docs/check-docs.mjs`·**≤届 cap**——起草树 2241>2240 红停承登（§0.0·唯一错误=PTP_FILE_LIMIT:2241·内容侧零涉）·**cap 2240→2248 sanction 待协调方随令**·sanction 落码前本门维持红停态（≠EXEC 放行条件·停止条件非验收放宽）·sanction 后预期 2242≤2248 余 6 | ≤届 cap |
| 11 | markers 五类 | 本刀改动集（4 tracked+届时收据）五类标记词 grep 零命中（`scripts/i6-239-gates.proof.mjs` :152-163 运行时组装口径·词面不复抄卷内防自匹配·命令与回执入收据） | 0 hits |
| 12 | diff 面机检+卫生 | `git diff --numstat <base>`（base=届时主线 tip·EXEC 工序 1 并线 merge 第二亲）恰 **4 tracked**=件①②③ 3 码/test+件④ 本卷（多任何 tracked 路径即停）·收据 untracked·`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0 | 恰 4+全绿 |

## §3 范围外（边界清单·越界即 FAIL）

1. **#203 语义面零触**：`weaknessMatches`/`WEAKNESS_MATCH_THRESHOLD`/`relevanceScore`/`biasByPastWeakness`/`weakness-backfill.ts` 全零字节（§1.2 分工承·回灌径既守不变量零需改）。
2. **读回面/派生单源零触**：`getLearningPlanFor`（:32-43 done 读回语义）·`deriveLearningPlan`（domain learning.ts）·`generateLearningPlanCore`（growth-generation :59-69 upsert 形状冻结）全零字节（候选己/乙承）。
3. **契约/前端/DDL 零触**：`packages/contracts`（DTO 1-200 传输界保留·存在性归应用层）·`apps/web`（手动端点本未接线）·`packages/db/migrations`（零迁移·0206 系 db-hotspot 件）全零字节。
4. **#121 面零字节**：弱项探针块与 `invalid_topic` 信封语义原样（件① 块② 恒在其后·宁拒不放宽）·`missing_topic` facade 零字节。
5. **共享 SSOT 零改**：LEDGER/checklist/batch-residual-plan/issues-master/TASK-SOP 只读（批2 残 4 与 H7 挂账行翻面权归协调方·本卷不预翻）。

## §4 依赖

**①上游（已满足·亲证）**：H4 WEAKNESS-LOOP 主体 @`9c4c0f9e` 已在基线（`merge-base --is-ancestor` EXIT=0 本席亲证）·#121 弱项半已落（interview-learning :46-60）——本刀零等待。
**②同文件在飞**：`line/db-hotspot`@`e37790e4a` 触件① 同函数（§0.0 单 hunk 亲证·零 hunk 交叠 ort 可自动并）——EXEC 立项日必做复核·漂超出登记范围即停。
**③迁移号**：§0.3 预期零。
**④横切**：docs cap sanction（§0.0/§2-10）——协调方随令落码·本刀不自升。
**⑤下游**：门矩阵全绿→pre-exec 双审→EXEC→post 双审→nail；批2 残 4→3（#185 出账）+LEDGER :59/:210 行翻面 **均归协调方 nail 波**；#38/#73 挂账余件不受预支。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线（并线归 EXEC 工序·本刀⛔merge主线）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门矩阵任一 prove 恰 1 次·红不重跑冲销·改前基线 run 恰 1 次）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触 §3 边界面（#203 面/GET/derive/worker 回灌/contracts/web/迁移/SSOT）；Ban FK/稳定 id 迁移（候选乙）；Ban 打卡域重构（候选丁）；Ban weaknessMatches 写键校验（候选丙）；Ban 存量死行清洗（候选戊）；Ban GET done 读回面改 btrim（候选己）；Ban cap 自升（§2-10·sanction 权归协调方·红停承登非放宽）；Ban #121 探针字节触碰（件① 块② 前零字节）；Ban 信封语义漂移（plan_required/invalid_topic 两码定稿·Ban 自造第三码）；Ban 自由发挥定稿文本（§1-修法 ⛔ 条款）；Ban 就地归因邻面新红（§2 任一邻门红→如实登记升级·Ban 借机修）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（docs-only 落卷 turn·docs:check/markers 均本地静态；EXEC 期门面全隔离容器+SQL 只读探针·validate/neg 面既有隔离 harness·§2 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词沿 `scripts/i6-239-gates.proof.mjs` :152-163 运行时组装口径·词面不复抄卷内防自匹配——沿 negbend/g7w/session-summary-deepen 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）+**docs cap sanction 随令落码**（2240→2248·§0.0/§2-10· sanction 未落则 ⑩ 门红停态不放行）；③EXEC 立项**不得改 §1 红事实结论与 §5 Ban/pins 与 §1-修法定稿文本面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做——db-hotspot 届时状态首查·§0.2 口径漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时件①-③ 路径 blob 对 §0.1 锚漂移（另席在飞触同文件·db-hotspot 并线=read-tier 单行形预期内改锚·**超范围漂移即停**）·§0.0 复核出新非残枝在飞触面·门基线锚漂（neg 六段序/迁移链头/ cap 值未经 sanction/lint 帽值行）→停·重 pin 回炉。
- **机制不满足**：基线树手工模拟与 §1.1 缺口推定不符（如 learning_plan 行在而探针① 误 409·或 items jsonb 形非 `[{topic}]` 数组致探针③ SQL 不成立）·或件③ 新臂在改前树基线 run 红（=臂写错非修法错）→证伪诊断→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法 4 路径面（需触 contracts/GET/worker/迁移/SSOT/#203 面）→停·另刀或协调方裁决（§1.3 候选乙/丙/丁/戊/己否决沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 第三红/cap sanction 未落）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*CHECKIN-KEY REQUEST · 2026-10-16 起草 · **`draft:awaiting_pre_exec_dual`（起草落卷即停·pre-exec 双审待派·cap sanction 待协调方随令）** · base `feat/mysql-schema-skeleton` @`7c602df02`（origin tip 亲证·fetch 后 rev-parse 双读一致·2026-10-18 01:56:57 +0800·起草时 docs:check 基线 EXIT=0 scanned 2240=cap 2240 恰等零余量本席亲跑·落卷树 2241 红停承登沿 N-19 先例）· 分支 `line/checkin-key` · 工作树 `meetwise-ck`（本起草席亲立·直落 origin tip 零 reset）· 立项出处=issues-master 更正版 :425（#185 行·P3·键自由文本不校验存在+complete 不要求计划存在）+batch-residual-plan :62/:102（H7 挂账）+LEDGER :59/:210（批2 残 4·H7 挂账 3 件之一）+TASK-SOP-v2 :64 杂项行 · 前置=H4 主体 @`9c4c0f9e` 祖先亲证+#121 弱项半已落 · 诊断=三段写入链（契约任意 1-200 放行面/应用层 #121 只对评估维度/读回 done 原文精确=死行不可见）· 修法=候选甲三探针（计划在先 409 plan_required+#121 原样零字节+topic∈items btrim 精确 400 invalid_topic·沿现形零迁移 fail-closed·两写入径共一校验单源）· 恰 4 tracked（1 新 3 改）零迁移 · #203 邻项定谳=weaknessMatches 留跨场选择器域·写键 btrim 精确（候选丙否决）· 候选乙（FK/item id 迁移）丁（域重构）戊（存量清洗）己（GET 改 btrim）否决在卷 · 门矩阵十三门（growth 正链 api:validate+neg:interview+neg:all 六段+prove:weakness/interview 邻面+migrate 链+drift+typecheck 8/8+lint 五值贴线+docs:check≤届 cap+markers+diff 恰 4+卫生）· 迁移预期零 · est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push ⛔merge主线 · STOP*
