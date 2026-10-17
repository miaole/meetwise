# PROGRESS-WRITE REQUEST — 生成进度写旁路化小刀（批5 盘点 Top6·两件同域零迁移·#164+#182·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷 2026-10-16·pre-exec 双审两独立外席待派·alone≠dual·est live=0）

**席位**：progress-write REQUEST 起草席（读码定稿+起草双责·协调方派·批5 盘点席 Top6 靶=`#164` 生成进度写在关键路径上且永久落库（每次生成最多 8 行 interview_event）占业务连接池+`#182` 进度写与业务事件共用流级 advisory lock、generation_started 的 await 无超时可反压生成主路径——同域两件零迁移小刀）。
**基线**：`feat/mysql-schema-skeleton` @ `656fc7be`（`git fetch` 后 `origin/feat/mysql-schema-skeleton`=`656fc7be` 恒等·派单下界「origin tip≥656fc7be」等号成立亲证=`git merge-base --is-ancestor origin/feat/mysql-schema-skeleton HEAD` EXIT=0 REMOTE-IS-ANCESTOR 机检·worktree `meetwise-pw` 派单前已建·分支 `line/progress-write`·HEAD=`656fc7be` 亲证=origin tip 零前进零 merge·⛔pull --rebase 未用·⛔force push 未用·docs:check 基线 **2210≤cap 2216** 本树亲跑 EXIT=0·迁移链 **204 文件头 0204** 亲数）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①批5 盘点席派单 brief（2026-10-16·Top6 两件同域零迁移·本卷即其执行载体）；②LEDGER=`ai-docs/delivery/harness/product-campaign-LEDGER.md:87`（5C 可靠性 52 件开放清单内「**#164/#182 进度写**」在册无 ✅·W7 序位 `product-campaign-EXECUTION-SOP.md:32`「#164→#182/#138」）；③审计原文=`~/Documents/Meetwise产品审计-更正版/issues-master.md:273`（#164 P2·修法列「进度写改为不 await/带超时，进度事件设保留期或不落 append-only 表」）+:422（#182 P3·修法列「进度写加超时/不等待」）——本刀取「**不 await**（不等待半）」，「带超时」激进形否决（§1.3 乙）；④形制范本=`trace-service-wire-REQUEST.md`（同批 Top5 先例）+`worker-hang-guard-REQUEST.md`（码刀门矩阵先例·Promise.race 败者计时器纪律先例形）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git rev-parse 实测 @`656fc7be`·**EXEC 立项照本节对届时 tip 再重 pin**——blob 漂移结论不变则只更行号·语义变回炉）

### 0.0 防重双对表

- `git branch --list "line/progress-write*"` 恰 1 命中=本席分支；`git worktree list` 含 `meetwise-pw` 恰 1 树；`ls ai-docs/delivery/harness/ | grep progress-write` 建前零命中→落卷后唯一同名卷=本卷。
- 本刀卷面=docs-only（本 .md·起草即停）；**修法执行面（§1-修法 件①②）归 EXEC 期**——EXEC 触面=恰 2 码文件（`generation-progress.ts`+`tokenstream-progress.proof.ts`·§1-修法）·在飞交叠复核对象=§0.1 十二锚 Stability（任一锚 blob 对届时 tip 漂移→重 pin 改锚非停·语义漂回炉）；共享 SSOT（LEDGER/checklist）本卷零写触（翻面权归协调方）。

### 0.1 blob 锚表（`git rev-parse --short=8 HEAD:<path>` 亲算 @`656fc7be`）

| # | 文件 | blob（8 hex） | 行数 | 本刀触面 |
|---|---|---|---|---|
| 1 | `apps/worker/src/generation-progress.ts` | `fb9490d4` | 164 | **件① 触（唯一产品码改面）**：`:23` MIN_INTERVAL=2000·`:29` MAX_ROWS=6·`:27` 注「家族总行上界=6+2」（**#164 8 行算术源**）·`:35-38` 载荷键白名单·`:56-63` logProgressWriteFailure 结构化失败日志·`:76-82` writeEventRow（asPrincipal 事务+appendEvent）·`:108-164` withGenerationProgress：`:119` inflight 链初始化·`:123-135` writeProgressOnce（progress 帧链入 inflight+catch=**既有 fire-and-forget 纪律**）·**`:137-142` generation_started 头拍 `await writeEventRow(...).catch(...)`（#182 await 无超时位·fn `:157` 在其后）**·`:144-154` heartbeat·`:156-163` finally（`:162` `await Promise.all([inflight,heartbeat])`=「settle 前无在途·终态后又冒进度」防护栏） |
| 2 | `packages/db/src/interview/interview-event.ts` | `880a1dcb` | 43 | **零字节 Ban（advisory lock 共用点亲证锚·#182 半句载体）**：`:16` appendEvent·`:22` `pg_advisory_xact_lock(hashtext($1))` **同 stream 全事件（进度+业务）共用一把流级锁**·`:23-26` event_key 幂等 prior SELECT·`:29-33` `INSERT…SELECT MAX(seq)+1 ON CONFLICT DO NOTHING`（序分配原子性根基） |
| 3 | `apps/worker/src/interview-service.ts` | `caba758c` | 370 | 零字节 Ban（触发面锚）：`:262-264` quizGenerator withGenerationProgress（progressStream=quizId）·`:366-368` reportGenerator 同形（=interviewId） |
| 4 | `apps/worker/src/adaptive-interview-service.ts` | `84b3e584` | 798 | 零字节 Ban（触发面锚）：`:492` interviewer.ask 面 withTokenStream 外包裹+withGenerationProgress（segments=[retrieve,generate,validate]） |
| 5 | `packages/db/src/principal.ts` | `23e5b770` | 2127 | 零字节 Ban（池界锚·否决乙依据）：`:951-952` statement/idle_in_transaction_timeout 缺省 15000·`:953` connectionTimeoutMillis 缺省 5000·`:968` query_timeout 缺省 15000·`:995-1005` asPrincipal（connect→BEGIN→SET ROLE→set_config→fn→COMMIT/ROLLBACK→release=#164「占业务连接池」机制面：每笔进度写独占一池连接一事务） |
| 6 | `apps/worker/test/tokenstream-progress.proof.ts` | `53e88ffe` | 208 | **件② 触（TS-P6 新增臂组）**：`:43` 家族查询·`:117` TS-P1 started 恰 1 行·`:130` 可见时延≤2500ms·`:154` TS-P4 家族总行≤MAX+2·`:162-166` 重放幂等不添行·`:192` **TS-P1 report 面 started 先于业务结果落表（序不变式承重臂·零改）**·既有 **20 臂**（`grep -c "A('"`=18 源位点·两循环展开=20 运行时臂）零改零删 |
| 7 | `apps/web/lib/stream/interview-state.ts` | `04a9741e` | 245 | 零字节 Ban（前端归约锚·非权威承重亲证）：`:116-118` 进度家族四 kind 不触发进度态清除·`:192-196` generation_started/first_token/progress 仅幂等覆盖写 generationProgress **不改 phase**（迟到帧容忍形） |
| 8 | `apps/web/lib/stream/quiz-state.ts` | `1aa2af90` | 178 | 零字节 Ban（否决乙核心证据）：`:75-79` `case 'generation_started': next.phase='generating'` **无终态守卫**——迟到 started 会把 ready 翻回 generating=「终态后又冒进度」必须被 worker 侧 finally 护栏挡住的原因亲证 |
| 9 | `apps/api/src/platform/sse-pump.ts` | `21f52b34` | 208 | 零字节 Ban（重放面锚）：`:130` 全 kind 帧逐行回放·`:132` isTerminal 命中即 `done`（重放停在首终态·终态后行不回放） |
| 10 | `packages/db/migrations/0096_int_transcript_remaining_sinks.sql` | `16657f55` | 597 | 零字节 Ban（保留窗裁量核心证据）：`:255` **`REVOKE DELETE ON interview_event … FROM app_role`**·`:256` DELETE 仅授 privacy_worker_owner·`:286-287` 擦除专用 RLS policy·`:529` 隐私擦除函数整流 DELETE（**全表唯一生产删除路径**=「永久落库」现状亲证） |
| 11 | `apps/worker/src/token-stream.ts` | `3f601319` | 219 | 零字节 Ban（S4b 外包裹层锚·pg_notify 传输态不落表·与持久进度通道正交） |
| 12 | `apps/worker/test/token-stream.proof.ts` | `7913ce76` | 315 | 零字节 Ban（S4b 邻面臂账锚·R2 六臂 fake pool 形） |

### 0.2 现链事实（#164/#182 定谳复核·全部亲证）

1. **进度写现链（写侧）**：三触发面（锚#3×2+锚#4）→`withTokenStream`（S4b·传输态）外包裹→`withGenerationProgress`：头拍 `:138` `await writeEventRow('generation_started')`（**关键路径首闸：模型 fn `:157` 与 heartbeat `:144` 均在其后**）→fn 执行期每 2s 一帧 generation_progress（`:123-135` 链入 inflight+catch·≤6 行·`:150` Promise.race sleep/stopped 纯时间窗）→finally `:162` 等在途写收口后返回→调用方随后写业务终态事件。每帧写=独立 asPrincipal 事务（锚#5 `:995-1005`）占一业务池连接。
2. **advisory lock 共用点（#182 半句·亲证）**：`appendEvent :22` 同 stream `pg_advisory_xact_lock`——progress 帧、generation_started 与 question_ready/quiz_ready/report_ready 等业务事件**同流同锁串行**；锁等待发生在语句执行内→被 `statement_timeout=15s`（锚#5 `:951`）罩住非无限等，但 stress 窗内进度写与业务写互为队头=真实反压面（#182「可反压生成主路径」定谳成立·幅度=池界有界非无限：连接 5s+每语句 15s）。
3. **await 无超时位（#182 主定谳·亲证）**：`:137-142` 头拍 await 无应用级超时——失败已 catch（`:142`·纪律④「写失败 best-effort」失败半已达标）但**时延半未达标**：写慢=生成首拍被进度写闸住（与模块自declared「绝不打断业务生成路径」纪律④时延面相违）·且此刻占住一池连接纯等待。issues-master #182 行锚（interview-event.ts:21/generation-progress.ts:135-141）对现 tip 行号漂移（:21→:22·:135-141→:137-142）·语义零变如实改锚。
4. **8 行永久落库（#164·亲证）**：家族总行上界=6（MAX_ROWS 常量 `:29`）+started/first_token 各 ≤1（event_key 幂等·`:27` 注原文「家族总行上界 = 6+2」）=**≤8 行/生成**；interview_event 现状零清理路径（锚#10：全表唯一生产 DELETE=0096 隐私擦除 `:529`·`:255` 已 REVOKE app_role DELETE）→进度行永久留存=「永久落库」定谳成立；膨胀率=O(生成次数) 非 O(token)——生成频次系产品量级（每次生成=一次模型 job·execution 帽 35s）非无界高频路径。
5. **前端归约两形（修法安全性依据·亲证）**：interview 流迟到进度帧容忍（锚#7 `:192-196` 只覆盖写进度态不改 phase）；quiz 流 started→`phase='generating'` **无终态守卫**（锚#8 `:75-79`）+SSE 重放停于首终态（锚#9 `:132`）→**「started 不晚于业务终态落表」是 live 窗唯一护栏**=worker 侧 finally `:162` 承重，任何修法不得弱化（否决乙核心依据）。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测 **204 文件头 `0204_ai_cost_cached_input_price.sql`**。本刀预期零迁移零 DDL——进度事件 TTL 清理（保留窗后继槽）需 SECURITY DEFINER 函数或新 role grant（锚#10 `:255` REVOKE 亲证 app_role 无 DELETE）=迁移面·**不落本刀**（§1-修法 件③·§1.3 己留槽）。EXEC 期若产生非预期迁移需求→停上报。

## §1 红事实与归因（定谳复核维持·两触点钉死）

- **#164 定谳维持**（关键路径半+永久落库半）：关键路径半=`:138` 头拍 await 闸首拍+每帧独立事务占池（§0.2-1）；永久落库半=§0.2-4。修法列两半「不 await/带超时」+「保留期/不落 append-only 表」——本刀取**不 await 半**（件①）+**保留窗登记留槽**（件③·裁量=保留但轻量化）。
- **#182 定谳维持**：锁共用半=§0.2-2（结构性共用·不拆——否决丙）；await 无超时半=§0.2-3（件① 直修）。
- **两触点**：触点①=`generation-progress.ts:137-142`（头拍 await→fire-and-forget 链入 inflight）；触点②=`tokenstream-progress.proof.ts`（TS-P6 臂组承载修法证明）。advisory lock 共用点（`interview-event.ts:22`）**零触**——共用本身非缺陷，缺陷在进度写把共用锁的等待引入了关键路径（旁路化后进度写不再闸业务首拍）。

## §1-修法（组合案定稿·甲主刀入码+保留窗裁量登记·最小触面=恰 2 码文件 worker 单包）

### 1.0 组合案裁决

**裁决=件①（generation_started 旁路化·不等待形）主刀入码+件②（TS-P6 臂组）证明承载+件③（保留窗·保留但轻量化登记+TTL 留槽）零码裁量。** 理由：#182 直断点=头拍 await；既有 inflight fire-and-forget 纪律（`:123-135`）是模块内**已验证同款机制**——复用它=最小新机件（零新常量零新 Promise.race 零新 timer）；序不变式由既有 finally 承载原样保持（§0.2-5 quiz 流无终态守卫→护栏不得弱化）；保留窗在零迁移约束内无解（§0.2-4 REVOKE 亲证）→登记裁量+留槽是唯一诚实形。

### 1.1 件① generation_started 旁路化（`generation-progress.ts` 唯一产品码改面·零迁移零 env 闸）

- 头拍 `:138-142` `await writeEventRow(...'generation_started'...).catch(log)` 改为**链入既有 inflight**：`inflight = inflight.then(() => writeEventRow(...)).catch((e) => logProgressWriteFailure(...))`——与 progress 帧 `:130-134` 同款纪律同款 catch 同款日志。链入位在 heartbeat 启动前→inflight 链序=started 先于一切 progress 帧（seq 序不变式保持：`interview-event.ts:29-33` MAX+1 分配沿锁获取序）。
- 效果：生成首拍零 DB 等待（模型 fn/heartbeat/withTokenStream 外包裹三层同时解锁）；进度写占池从「关键路径跨度」降为「写入时长本身」；#182「await 无超时」主定谳以**消除该 await** 收口（不等待半·issues-master 修法列原文）。
- **序不变式保持（显式声明·EXEC 断言面）**：finally `:162` 仍等 inflight→started 恒 settle（提交或失败）于 withGenerationProgress 返回之前→业务终态事件（调用方随后写）恒晚于 started 落表——「终态后又冒进度」防原样成立，quiz 流 `phase='generating'` 无终态守卫面（§0.2-5）零暴露。既有注 `:104-106`「fn settle 后保证无在途进度写」语义随件①扩及 started（started 亦入 inflight=护栏覆盖面变宽非变窄）。
- 残面诚实登记：stress 窗 started 写慢时 first_token/progress 帧（独立事务）可先于 started 落表=家族内 seq 倒序窗——非权威家族（铁律①）+前端逐帧独立归约（锚#7 `:192-196`）+终态前护栏不变→可接受；如实登记非缺口。

### 1.2 件② TS-P6 臂组（`tokenstream-progress.proof.ts` 新增·预期 ≥5 臂 EXEC 期定值）

- 正形：慢写 seam（首 connect 延迟注入 proxy pool 形·沿 R2 fake pool 先例）下——①模型 fn 先于 started 行可见起跑（poller 首见时刻对照 seam 时戳）②生成结果照常返回内容无损③started 恰 1 行（幂等不因旁路化破坏）。负形：④写败注入（once-failing pool）→生成成功+结构化失败日志（`generation_progress_write_failed` 捕获形·沿 token-stream.proof R2-d 先例）⑤序不变式=report 面「started 先于业务结果落表」既有臂（`:192`）零改承重+重放幂等臂（TS-P4 段）零改。既有 20 臂零改零删（回归锚·行为向后兼容活体证）。

### 1.3 保留窗裁量（件③·#164 永久落库面·零码随卷登记）

- **裁量=保留但轻量化，本刀不动落库面**。依据三桩：①零迁移纪律（派单明示）+锚#10 `:255` `REVOKE DELETE … FROM app_role` 亲证——worker 侧 TTL sweep 零迁移内不可行（需 SECURITY DEFINER 函数或新 grant=迁移面）；②量级算术=≤8 行/生成（常量断言面 `:29`+TS-P4 臂在钉）×event_key 幂等防重放添行×生成频次产品量级（§0.2-4）→非失控膨胀面；③「不落 append-only 表」半=存储形变翻 D-1 既有裁定（否决丁·见下）。**TTL 修法留槽**（后继独立小刀：SECURITY DEFINER 擦旧函数+保留期常量+既有 sweep loop 接线+prove·设计裁决权归后继刀派单）——本卷登记为派单输入。

## §1.3 修法候选淘汰登记（防 EXEC 期重开）

- **乙（否决）头拍/尾等待加 Promise.race 超时（「带超时」半·WHG 形）**：头拍超时被件①取代（消除 await 优于给 await 计时——零新 timer 零败者泄漏面）；**尾等待（finally `:162`）加 cap 否决**——尾等待系「终态后又冒进度」唯一护栏（§0.2-5：quiz 流 started→generating 无终态守卫+SSE 重停终态）·cap 外迟到 started 经 live 窗达前端=ready→generating 相位回归实害；且尾等待已被池四参界住（锚#5 `:951-953/:968`·5s+15s/语句）非无限等。若后继做超时形，**须先补 web quiz 流终态守卫=跨包面前置件**（留槽顺序绑定·Ban 跳步）。
- **丙（否决）appendEvent 拆锁/进度写独立 stream（「业务事件锁外」形）**：`:22` 流级锁+`:29-33` MAX+1 序分配原子性系全站事件账本根基（四原语③·`packages/db/src/index.ts:6`）——拆锁=序分配竞争账本序损坏；进度写独立 stream=SSE 泵/web 白名单/前端归约/去重点全链改=**事件流重构**（派单否决域明示）。
- **丁（否决）进度写不落库（pg_notify/内存形·「或不落 append-only 表」半）**：翻 TOKSTREAM D-1 既有裁定（interview_event 节流持久写·模块头注 :3）——断线重连重放面丢进度=SSE 恢复语义改+与 S4b token_delta（pg_notify 传输态不落表）通道语义混淆；存储形变系迁移面。留槽不否决其长期合理性（TTL 槽未落前持久写是重放进度的唯一载体）。
- **戊（否决）#138（0143 每行 AFTER INSERT pg_notify 挂最热表）顺手改**：划外件（issues-master :262·deps #164 同域非同刀）——登记划外 Ban 借机修。
- **己（留槽）#165/#167 attemptKey 写死 attempt 0（dep #164）**：5E 簇E 划外登记在案（`5e-behavior-REQUEST.md:31/:82`·依赖 #164 措辞=「非注册硬闸·在飞件」如实知悉）——本刀零触（键形面 `adaptive-interview-service.ts:456` 非本刀触面）·后继刀槽在案·本刀落卷不改变其依赖语义（进度写行为面零变只移时延）。

## §2 验收断言（门矩阵·起草席亲跑面+EXEC 期行使面分开·数字口径以实跑实测为准）

**起草席亲跑基线（本卷落卷值·2026-10-16 本树）**：

1. **typecheck**：`pnpm turbo typecheck --force` **8/8 EXIT=0（0 cached·1m27s）**。
2. **lint**：`pnpm turbo lint --force` **12/12 EXIT=0（0 cached）**·五值恰等零超支：web `601`+root `5235`+api `1421`+worker `954`+ai-runtime `628`（全 0 errors·五值沿 context-budget-wire/sse-api-family 卷终值亲跑复证）。
3. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·基线 **2210≤cap 2216**（`scripts/ai-docs/public-text-policy.mjs:106` MAX_FILES=2_216 亲证）·本卷落卷后预期 **2211**·>2216 红停上报·cap sanction 权归协调方 Ban 自升。
4. **markers**：本刀改动集五类标记词（运行时逐字符组装口径沿 `scripts/i6-239-gates.proof.mjs` §2-7·词面不复抄防自匹配）+全树行首冲突标记严格形 grep 零命中 EXIT=0。
5. **diff 面**：本卷=恰 **1 tracked .md**（本 REQUEST 新件经 commit 入树）——多任何 tracked 路径即停。

**EXEC 期行使面（码刀门矩阵·isolated wrapper 口径·本 commit 零预 claim）**：

- 门A（主验收）`pnpm tokenstream:prove` EXIT=0：既有 20 臂零改全绿+件② TS-P6 臂组（≥5·EXEC 定值）正负双向全绿。
- 门B adaptive 邻面四门（withGenerationProgress 三触发面宿主链）：`adaptive-flow:prove`+`adaptive-life:prove`+`adaptive-consumer:prove`+`adaptive-latency:prove` 全绿 EXIT=0（隔离形·对届时实测）。
- 门C neg：`pnpm neg:all` EXIT=0 六段全绿（题面 692 沿 trace-service-wire 卷·对届时实测熔断另注）。
- 门D web 归约邻面：`pnpm -C apps/web prove` EXIT=0（TOKSTREAM 段 TS-P3 前端渲染断言=锚#7/#8 零触回归锚）。
- 门E typecheck+lint 重跑：8/8+12/12 EXIT=0·五值恰等零超支（件①仅 worker 单包触·贴线预算零漂）。
- 门F docs:check EXIT=0 ≤2216。门G markers 全量重扫零命中。门H diff 面=**恰 3 tracked**（`generation-progress.ts`+`tokenstream-progress.proof.ts`+本卷）·EXEC 并线/SSOT 附加笔按派单令另计·§0.1 其余十锚零触亲证。
- 卫生：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改（本席亲跑 8.9s）·`.env*` ABSENT·零迁移零 DDL 零 env 闸（件① 常量形零新增）·est live=0·`actualSpendCny=null`。

## §3 范围外（边界清单·越界即 FAIL）

1. **§0.1 十锚零字节 Ban**（锚#2-#5/#7-#12）：appendEvent/锁面/池面/web 归约/sse-pump/0096/token-stream 族零触——#182 锁共用半 Ban 拆（否决丙）·Ban「顺手」改注释。
2. **序不变式 Ban 弱化**：finally `:162` 在途等待语义零改（否决乙·§0.2-5 护栏承重）——Ban 对尾等待加任何 cap/skip。
3. **落库面 Ban 触**：零迁移零 DDL（§0.3）·Ban 本刀落 TTL sweep/SECURITY DEFINER/grant（件③留槽）·Ban 改 MAX_ROWS/MIN_INTERVAL 常量值（量级算术 pins）。
4. **#138/#165/#167 零触**（§1.3 戊/己·划外留槽）。
5. **共享 SSOT 零改**：LEDGER/checklist 只读引用——#164/#182 行翻面权归协调方（本刀不宣称关闭）。零 CI/wrapper/runner 改·零依赖升级·零 prompt 文本触碰。

## §4 依赖

**①上游已满足**：TOKSTREAM 阶段1+S4b 落码（触发面三处+token-stream 外包裹·在基线链）·tokstream 设计卷 D-1/T1/D-2 裁定在卷。**②同域在飞**：#138（deps #164）划外零交叠；5E 簇E #165/#167 依赖 #164「在飞件」措辞系 5E 卷 rev2 勘误形（非注册硬闸·`5e-behavior-REQUEST.md:31` 亲读）——本刀落码后其依赖即兑现·彼两件仍归后继刀槽零交叠。**③迁移号**：§0.3 预期零。**④下游**：#164/#182 行翻面归协调方；TTL 留槽（件③）+#165/#167 槽+乙案 web 前置件=本卷登记为后继派单输入。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·⛔merge 主线）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门矩阵 prove 面 EXEC 期恰 1 次·红不重跑冲销）；Ban 翻 pins（§5 值+`actualSpendCny=null` 脚注·零翻转）；Ban 触 §0.1 十锚与一切非 §1-修法 面文件；Ban 弱化 finally 在途等待（否决乙）；Ban 拆流级锁/独立 stream（否决丙）；Ban 不落库形（否决丁）；Ban #138/#165/#167 借机修（§1.3 戊/己）；Ban 本刀落 TTL/迁移（件③留槽）；Ban 改 MAX_ROWS=6/MIN_INTERVAL=2000 常量值；Ban 改共享 SSOT（§3-5）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins**：基线 tip=`656fc7be`（origin tip 恒等·REMOTE-IS-ANCESTOR EXIT=0 亲证）·§0.1 十二 blob 锚（blob 级·EXEC 重 pin 承载）·`GENERATION_PROGRESS_MAX_ROWS=6`·`GENERATION_PROGRESS_MIN_INTERVAL_MS=2000`·家族总行 ≤8/生成·既有 proof 臂账=20 运行时臂·门C 题面 692（对届时实测）·typecheck 8/8·lint 五值 601/5235/1421/954/628·docs cap **2216**（基线 2210·落卷预期 2211）·迁移链 204 头 0204·`actualSpendCny=null`。
- ⛔push（origin 任何 ref）·⛔merge 主线（`feat/mysql-schema-skeleton`）·⛔force push·⛔pull --rebase。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零模型外呼零 Key 加载零生产操作零 secrets 读用·typecheck/lint/docs:check/markers 全离线本地行使·零消耗。EXEC 期门 A-D 系 isolated wrapper 本地 PG·亦零模型外呼零生产操作·est live=0。

## §7 markers=0（卫生声明·亲跑回执）

本刀改动集（本卷 1 .md）五类标记词 grep 零命中（起草席亲跑·五类词面**运行时逐字符拼接组装**沿 `scripts/i6-239-gates.proof.mjs` §2-7 同口径：四词组装+行首冲突标记正则——**词面绝不复抄入卷防自匹配**·命令与 EXIT 回执随本节留痕：改动集=`git diff --name-only HEAD`∪`git ls-files --others --exclude-standard` 双查·五类词+conflict 零命中 EXIT=0）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · pre-exec 双审两独立外席待派·本 commit 不预 claim 任何 EXEC 期 EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**（FAIL 项回炉本卷 rev·append 注记形上文零洗）；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1-修法 组合案裁决与 §1.3 候选淘汰结论与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（blob 漂移结论不变只更行号·语义变回炉·§0.0 复核必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚语义漂移（如 finally 护栏被改/started 写形被改/锁面被拆/0096 REVOKE 被翻/quiz 流终态守卫已补=乙案前置件成立需重裁）·门基线漂（typecheck≠8/lint 五值超支/docs:check cap≠2216 未经 sanction/迁移链头≠届时亲数）→停·重 pin 回炉。
- **机制不满足**：门A 臂组红且根因在件① 修法形（如序不变式破坏=started 晚于业务终态落表实测复现）→登记结论被证伪→停·如实升级协调方回炉（Ban 就地改修法 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法 面（需拆锁/独立 stream/落库形变/TTL 迁移/触 web 归约）→停·另刀或协调方裁决（§1.3 乙丙丁否决沿承·Ban 就地扩面）。
- **验收红不可修**：EXEC 期任一门红且根因不在本刀交付面（邻 proof 新红/adaptive 链新红/neg 六段新红/lint 贴面新增超支/docs:check>2216）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*PROGRESS-WRITE REQUEST · 2026-10-16 起草落卷 · **`draft:awaiting_pre_exec_dual`**（pre-exec 双审两独立外席待派·alone≠dual·翻面权归协调方） · base `feat/mysql-schema-skeleton` @`656fc7be`（origin tip 恒等·派单下界等号成立亲证·REMOTE-IS-ANCESTOR EXIT=0） · 分支 `line/progress-write` · 工作树 `meetwise-pw` · 读码定稿=进度写现链（三触发面→withTokenStream 外包裹→withGenerationProgress：`:137-142` generation_started 头拍 await 无超时=**触点①**·`:123-135` progress 帧既有 inflight fire-and-forget 纪律·`:162` finally 在途等待=「终态后又冒进度」唯一护栏）+advisory lock 共用点（`interview-event.ts:22` 同 stream 全事件一把流级锁·`:29-33` MAX+1 序分配原子性）+8 行永久落库（MAX_ROWS 6+started/first_token·0096 `:255` REVOKE DELETE app_role 亲证=零清理路径现状）+前端归约两形（interview 迟到容忍/quiz started→generating 无终态守卫）· 修法=件① generation_started 旁路化（头拍 await 改链入 inflight·不等待半·序不变式 finally 承载原样保持）+件② tokenstream-progress.proof TS-P6 臂组（≥5 臂·正负双向·既有 20 臂零改）+件③ 保留窗裁量=保留但轻量化（零迁移纪律+REVOKE 亲证→TTL 留槽后继独立刀·量级算术 ≤8 行/生成随卷）· 最小触面=恰 2 码文件 worker 单包+本卷 · 否决=乙 尾等待 Promise.race cap（quiz 流无终态守卫实害·若后继做须先补 web 终态守卫=跨包前置件）+丙 拆锁/独立 stream（事件账本根基+事件流重构）+丁 不落库形（翻 D-1 裁定+重放语义改）+戊 #138 划外+己 #165/#167 留槽 · 门矩阵=typecheck 8/8（亲跑）+lint 五值恰等 601/5235/1421/954/628（亲跑）+docs:check 2210≤2216（亲跑·落卷预期 2211）+markers 零命中+diff 恰 1 tracked .md+EXEC 期 tokenstream 20+TS-P6/adaptive 邻面四门/neg 692/web 归约邻面 · 停止条件四类零触发 · 翻面权归协调方（本刀不宣称关闭） · ⛔push · ⛔merge 主线 · ⛔force push · STOP*
