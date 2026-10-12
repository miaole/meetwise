# 5E GROUP REQUEST（批5 末组 · 文档/清理批量 · issues-master 第5批-E 38 件逐件盘点 + #212 清理面 · 收编 22 整件+2 残面+1 清理面=25 件·§1 修法 26 面（#170 注/码两半拆面·rev2 计数口径如实地） · 簇E 行为面 11 件呈报 · 体量 M-L）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷 2026-10-11·**rev2 回炉补登 2026-10-12**·先盘点后起草·本刀 docs/注释/死代码/卫生一致性批量·起草阶段恰 1 .md 零码动·本 rev2 即回炉重审载体·EXEC 仍待双审。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：#批5 末组 5E 组盘点起草席（北星 loop · 批5 文案/清理域 · 先盘点后起草）。
**基线**：`feat/mysql-schema-skeleton` @ `2f6662ef`（主线最新 tip·`git log -1` 实测 2026-10-11·ptp-archive nail 补记提交·e2e-assert-refresh `2b1f01a5` 已并入）。分支 `line/5e-group`·工作树 `meetwise-5e`（`git worktree add ../meetwise-5e -b line/5e-group` 本起草席已立·建前 `git worktree list` 实查不存在·建后 tip `2f6662ef` 亲证）。
**蓝本**：①审计 issues-master **更正版** `~/Documents/Meetwise产品审计-更正版/issues-master.md` 第5批-E 全 38 行（表头 `:86`=「| 第5批-E 文档/清理 | 38 | 0 |」·38 行行号全图亲证见 §0.1·原文+修法列忠实节要【rev2 如实化·初稿自记「逐字誊录」与实态不符——#64/#74/#85/#121/#39/#30 等要点系节要且 rev2 已补登截去子面】）②LEDGER `product-campaign-LEDGER.md` `:88`（**逐字**：「**5E 文档/清理（38）**：#162 ✅(已回填)·#41 🔒SCORE S3·#26 待 D3·#6/#21/#22/#28/#94/#166/#170/#192/#212/#217/#11 注释/ADR·#27/#60/#128/#148/#149/#154/#162/#165/#167/#174/#187/#210/#121/#126/#132/#39/#85/#63/#64/#65/#62/#101 部分/#1/#8/#12/#19/#130/#2/#5/#121 — 🆕 批量清理刀（W9）」）+:83（「## 批 5A-5E（工程门禁 141 条）」节头）/:96（批5 序「MIG-RUNNER→AUTHZ-HARDEN→CI-WIRING→5C 四子刀→5E 批量」=批5 末位）/:212（批5 水位 4/143 残 139 列 5E 批量）③TASK-SOP-v2 `:85`（「| 5E | CLEANUP 批量 | 38 条文档/死代码/注释 |」）④product-campaign-EXECUTION-SOP `:34`（W9 行「③5E 清单（#21/#22/#28/#94/#166/#170/#187…）」）⑤batch-residual-plan @`ab02d499` `:62`/:77/:102（H7 散件「各归域刀或 5E」三处）+`:111`（I5 行含 #212·**双登记已裁：文档标注面归 I5·清理面归 5E**·§0.3-1）⑥邻卷界线=I3 卷 `:32`（#62 留 5E「一致性小改·非行为缺陷」）+I4 卷 `:29`/:51/:115（#62 留 5E「防面混」+dependency-footprint 漂移归 5E 登记）+growth-gen 卷 `:39`/:43/:89（#187 API 侧状态机拆除「归 5E 批量清理刀」三处明示让渡）+MIG 卷（消费方行「#94→5E」·**立项时点旧态·本卷查重已闭·§0.3-4**）⑦形制沿 `i5-caliber-REQUEST.md` rev2（跨树 @`6ee4a869`·meetwise-i5 树·§0-§8 全·Ban/pins 同源誊录）。

## §0 现状锚（起草席亲读·base `2f6662ef`·file:line 逐条 rg/sed 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 已终局防重检查记录（强制项）

- `rg -l "5E|5e-group" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md`（base `2f6662ef` 实跑）→ 命中 **6 件**逐一核验，**全部为归槽登记面·零刀卷占有**：①`TASK-SOP-v2.md:85`=批5 位图 5E 行（组登记·本刀即其立项载体）；②`product-campaign-LEDGER.md`（:59/:72/:83/:88/:96/:212/:299）=派单登记+水位面；③`product-campaign-EXECUTION-SOP.md:3/:34`=批5 位图 W9 行引 5E 清单；④`i3-job-mgmt-REQUEST.md:32/:112/:149`=#62 留槽 5E 注记（**明示让渡本刀**）；⑤`i4-invite-face-REQUEST.md:29/:31/:51/:115/:153`=#62 留槽+dependency-footprint 漂移归 5E 登记（**明示让渡**）；⑥`growth-gen-REQUEST.md:39/:43/:89`=#187 API 侧拆除归 5E（**明示让渡·§0.3-5**）。
- `execution-master-checklist.md` 对 5E 字样**零命中**（exit=1 实跑亲证）；对 5E 特征件编号（162/166/167/170/192/210/217/187/148/149/154/165/126/132/128/130/121/212）恰 **1 命中=`:2262`**「D3 worker 单事务 upsert+API 零触（#187 不再加厚）」=D 系裁定登记面（growth-gen D3 决议·非刀卷占有·growth-gen 卷 :39 让渡面同源）。
- harness/ **无同名卷**（`ls | grep 5e` 零命中·exit=1 实跑）。
- **邻刀占有逐卷复核**：I3/I4 卷 #62 留槽注记=让渡非占有；I5 卷（`meetwise-i5` @`6ee4a869` rev2 待复审**未并线**）收 #212 **文档标注面**——本刀只收其**清理面**且闸 I5 并线（§0.3-1/§3-5）；MIG 卷（`meetwise-mig`）触 `packages/db/src/migrate*` 与迁移基建——本刀迁移本体零触零交集；AUTHZ 卷（`meetwise-authz`）触 login/上传守卫面——本刀 #64 `auth-actions.ts` 相邻（行级零重叠登记 §4）；CI-WIRING 卷（`meetwise-ciw` 起草时点 @`2f6662ef` 零新提交·rev2 时点已并线 §0.3-7）触 ci.yml/prove 接线——本刀 #74 依赖规则载体若落 lint/depcruise 配置面与其相邻（裁决项⑥连带登记）。→ **停止条件未触发·可落卷**。

### 0.1 盘点总表（第5批-E 38 件逐件·已解决?/归槽判定·三源对勘=issues-master 38 行×LEDGER :88 清单×实树锚实测）

**已闭剔除（2 件·查重坐实）**：

| 件 | issues-master | 已解决判定（实树亲证） |
|---|---|---|
| #94 | :491 P3 文档不符·「health.service 注释称已有 query_timeout，代码中并不存在」 | **已闭（代码侧补齐）**：HA-3 DB 韧性刀 `88c48f61`（R-22·**merge-base --is-ancestor 亲证已入主线**）W1 落 `packages/db/src/principal.ts:964` `query_timeout: Number(process.env.PG_QUERY_TIMEOUT_MS ?? 15000)`+四参配置，该 commit 卷面明记「health.service.ts:18 **注释转真零字改**」；本席亲读 `health.service.ts:16-19` 注释与 `principal.ts:963-964` 代码互洽+`packages/db/test/ha3-pool-resilience.proof.ts` A1 断言在。**剔收**（MIG 卷「#94→5E」消费方行系其立项基线 `ad89c1c5` 时点旧态·§0.3-4 如实登记） |
| #162 | :492 P3 文档不符·「tokstream 设计正文不在 HEAD（只在 origin/line/tokstream-s3-design 分支）」 | **已闭（回填落）**：`ai-docs/delivery/harness/tokstream-s3-design.md` 实存本树（+s2-probe/s4a-REQUEST·tokstream-s4a `546b1c48`/`6aa83c48` 已实施）。与 LEDGER :88「#162 ✅(已回填)」标注一致。**剔收** |

**挂起/备忘（2 件·不收零触）**：

| 件 | issues-master | 判定 |
|---|---|---|
| #26 | :369 P3 技术缺陷·比例结算 ratio<1/partial_confirmed 面试路径死代码 | **挂起待 D3**：LEDGER :88「#26 待 D3」亲读；dep #21/#32 同批。死代码删除=行为面裁决前置（D3 未决）·**本刀零触**（裁决项⑨连带） |
| #32 | :374 P3 技术缺陷·begin 预留 1.0/收尾 ratio=1 单位常量备忘 | **需求备忘件**：修法列自记「**产品决策后集中改常量（单位常量化），不单独修**」——自排除独立修。**不收**（随 D3/产品排期） |

**收编（簇A-D·同域=文档/注释/死代码/卫生/一致性·22 整件+2 残面+1 清理面=25 面）**：

| 件 | issues-master（行号·要点） | 已解决? | 实树判定锚（`2f6662ef` 实测） | 簇 |
|---|---|---|---|---|
| #62 | :381 P3·Server Action 把 jobId/appId 直接拼进路径未编码 | **开放** | `apps/web/app/jobs/actions.ts` **三处裸插值**：`:13` `` `/jobs/${jobId}/apply` ``/`:23` `` `/applications/${appId}/start` ``/`:49` `` `/applications/${appId}/decline` ``；全文件 `encodeURIComponent` **零命中**（rg 实测）。审计旧对照行「:39 interviewId 已编码」**已消**——#227 合一（entpay 片2）删两跳 begin、redirectTo 改 API 生成=锚漂移主因（§0.2） | C |
| #63 | :382 P3·saveSettingsAction 不看响应即 revalidate、lang 无白名单；改密把 400 也报「旧密码不正确」 | **半闭·残面收** | I4 #265 已落（`settings/actions.ts:7` 注释「lang→locale·移除旧通知开关键(白名单见 contracts)」亲证·`365a23b6` 并线）；改密面已显式反馈（`:34-41` 400/401 分码+非 ok 带状态码）；**残面=偏好保存 `:12-16` 仍 `await serverFetch` 后无响应检查即 `revalidatePath('/settings')`**（失败静默假成功） | C |
| #64 | :383 P3·登录/注册表单只判非空、错误文案直接拼后端错误码、fetch 无超时 | **开放** | `apps/web/app/auth-actions.ts:24` `return { error: '失败:' + (body.error ?? res.status) }` 直拼在；fetch 无超时在（`:22` 裸 fetch）；格式/长度提示缺位在（`:18` 仅 `!email || !password` 非空判·blueprint :383 修法列第一段对应面·rev2 补登）；b110 审核制分流已落不改其面。dep #110（B110 已并·本地化映射不消费其产物=相邻非硬闸） | C |
| #126 | :398 P3·startApplicationAction 失败把后端响应体整体打到 web 日志 | **开放** | `jobs/actions.ts:35` `console.error('[application_start_failed]', { status, message: msg, body })` 全量 body 落日志在（锚漂至本行·§0.2） | C |
| #65 | :384 P3·生产路由内置 E2E 压测数据源（__e2e_stream_stress__）仅靠 env 开关 | **开放（且被 G3 加重）** | `apps/web/app/api/interview/[id]/events/route.ts:12-13` STRESS_ID/STRESS_TURNS 仍在生产路由；`:14-16` G3 BEGIN-GUARD 又**新增** e2e-guard-only 变体 id 族=面扩大如实登记。dep #168（AUTHZ 域）相邻非硬闸（§4） | B |
| #74 | :386 P3·ai-runtime 公共入口导出 fakeAsr/fakeTts/fakeEmbedder 等，生产包边界未禁止 | **开放** | `packages/ai-runtime/src/index.ts:139/:140`（fakeAsr/fakeTts 导出）+`:177`（fakeEmbedder 导出）+`:214`（流式 fake 族 fakeStreamingAsr/fakeStreamingTts/disabledStreamingAsr/disabledStreamingTts 导出）+`embedder.ts:76`（fakeEmbedder 本体）全在——blueprint :386 证据列全域·rev2 补全（初稿狭义三枚有漏网风险·§0.2）。dep #168 相邻非硬闸 | B |
| #60 | :380 P3·类型化契约客户端 makeInterviewApi 无生产调用方，UI 用裸 fetch | **开放** | `apps/web/lib/api/client.ts:35` 定义；全仓生产调用零命中（仅 `apps/web/test/web-logic.proof.ts:13/:253` 测试导入）。处置=删或接线=裁决项③ | B |
| #39 | :376 P3·budget_exhausted 死枚举 | **半闭·残面低值** | `packages/domain/src/interview-control-signals.ts:23` 已有诚实化注释「`budget_exhausted` 仅枚举兼容，decideNext 当前不产出」（审计时点后新落·某域刀顺手面）；死枚举本体仍在。残面=枚举清理·**低值可裁**（裁决项⑨） | B |
| #210 | :428 P3·resume_quiz.report.score=min(100,40+20×题数) 与质量无关；schema 不限题数 | **开放** | `packages/ai-graphs/src/resume-quiz.ts:33` 公式逐字在（锚 :31→:33 漂）；处置=删死字段或改质量分+schema 限题数=裁决项④ | B |
| #170 | :494 P3·worker main.ts 过期「骨架/S5 落」注释+无调用方 buildMockInterviewRunner | **开放** | `apps/worker/src/main.ts:7`「真实的队列消费/续跑循环 S5 落」过期注释在（worker 消费循环实已运行）；`:138` `buildMockInterviewRunner` 定义·**全仓调用方零命中**（rg 排除定义文件实测）。S5 面实态表述勘误+死 runner 处置=裁决项连带 | A+B |
| #6 | :484 P3 文档不符·0001 注释称结算下游 STUB 与 commerce.ts「非 stub」矛盾 | **开放（修法面改道）** | `packages/db/migrations/0001_baseline.sql:125`「真实下游结算尚是 STUB,见 commerce.ts reconcile 注释」在——**但迁移本体受 checksum 铁律保护不可改**（`migrate.ts:4`「④ checksum 守卫:已应用的迁移内容变了 → 报错(禁止改历史迁移,防漂移)」+0001:2 自带「**勿改本文件**(改→checksum 漂移报错)」铁注）→ 修法**改道对侧**：`commerce.ts:206`「真正下游结算由 relay 消费者做,见 reconcile 注释」与 reconcile `:475` 实态（真实结算已落·production-backlog :81 code-validated）对齐注释+现役 docs 侧勘误；0001 旧注=铁律豁免如实登记 | A |
| #22 | :487 P3 文档不符·0001 注释自相矛盾（outbox 处说下游 STUB、:138 处说非 relay 占位 stub） | **开放（同 #6 改道）** | `0001_baseline.sql:125` vs `:138` 双注释共存亲证——本体零触（checksum 铁律）·矛盾消解落 commerce.ts 对侧注释+docs 勘误（与 #6 同面顺手） | A |
| #21 | :486 P3 文档不符·commerce.ts 注释称「大余数法」，实现是前 n-1 桶按比例舍入 | **开放** | **同文件自矛盾亲证**：`packages/db/src/commerce/commerce.ts:9` 头注「④ confirm 按比例分账用**大余数法**…杜绝逐桶独立四舍五入」vs `:185` 行注「④ 大余数法：**前 n-1 桶按比例舍入,最后一桶吸收差额**」——头注与实现措辞不符（实现是尾桶吸收差额非经典最大余数法）。修=注释措辞对齐实现（零码动） | A |
| #11 | :485 P3 文档不符·ai_model_invocation DELETE 权限已由 0088 收回，注释/ADR 仍写可 DELETE | **开放·EXEC 重 pin** | `0088_…sql:9-13` 本体已正确（「DELETE has no request-path procedure…never granted」·迁移本体零触）；**残面=外部注释/ADR 侧陈旧陈述定位**——EXEC 立项 rg 全仓重 pin（「DELETE」×ai_model_invocation 组合面） | A |
| #28 | :488 P3 文档不符·ADR-0006 与 dependency-footprint 仍写 BullMQ/pg-boss，实际是 PG 表队列 | **开放** | `ai-docs/architecture/dependency-footprint.md:87`（ioredis「BullMQ 连接」）/:229（「BullMQ 消费」）/:338（「队列 → BullMQ + Outbox（不换 pg-boss）」决策叙事）三处仍在；现行实态=PG 表+SKIP LOCKED 队列。**ADR-0006 文件在树中不存在**（`ai-docs/architecture/adr/` 仅 0015-0020+0022 共 7 件+README·0021 缺号·ls 实测·rev2 如实化）=审计旧锚漂移·ADR 侧残面 EXEC 重 pin（renumber/存废核·§0.2）。I4 卷 :51 另登记 nodemailer 漂移同文件 :99——同刀顺手面连带 | A |
| #166 | :493 P3 文档不符·withGenerationProgress 注释称不留悬挂 timer，实际 sleep 的 setTimeout 未清 | **开放** | `apps/worker/src/generation-progress.ts:145`「settle 即醒（stopped），不留悬挂 timer 拖住进程退出」注释在；其下 `:146` `Promise.race([sleep(...), stopped])`（rev2 锚更正·初稿误 pin :144）——stopped 胜出时 sleep 的 setTimeout 未清除、计时器存活至 MIN_INTERVAL 到期=注释与实现不符（程度轻·注释措辞诚实化或清 timer 二选一=裁决项连带）。dep #164（5C 进度写）相邻 | A |
| #192 | :496 P3 文档不符·persistResumeProfile 注释写「ON CONFLICT DO NOTHING 幂等」，实际代码非然 | **开放·EXEC 重 pin** | 导出链 `packages/db/src/index.ts:101` 在；实现文件与注释面 EXEC 立项重 pin（issues-master 证据列旧锚已漂·浅核未深判如实登记） | A |
| #217 | :498 P3 文档不符·user_memory 表注释/评估表注释说会存 skill/weakness/topic/preference（写侧不符） | **开放（修法面改道）** | `0001_baseline.sql:308-320` user_memory 注释+kind CHECK（'skill','weakness','topic','preference','episode'）在——**迁移本体零触（checksum 铁律·同 #6）**；残面=写侧一致性核+现役 memory 治理面（0093/0112/0116 等后继迁移与 docs）注释诚实化·EXEC 重 pin 写侧 rg | A |
| #212（清理面） | :497 P3 文档不符·blueprint 说 career-path「尚无图文件」且 7 节点图；roadmap 说成长档案等「❌未建」 | **标注面归 I5（在飞）·清理面归本刀（闸 I5 并线）** | I5 卷 rev2（`meetwise-i5` @`6ee4a869`·待复审未并线）§0.1 亲证 `langgraph-blueprint.md:37`「尚无对应图文件」与 `packages/ai-graphs/src/career-path.ts` 实存直接矛盾+`roadmap.md:59-65` Phase 4 ❌未建——I5 收「改『已实现未接线（见 #204）』」标注面；**本刀清理面=I5 标注并线后 blueprint/roadmap 残余一致性核验与清扫**（若标注足额则本面收缩为核验零改=裁决项⑦）。**双登记已裁·本刀不重复收标注面**（§0.3-1）·【rev2：blueprint :37/roadmap :59 勘误已落主线 `8b8e20bc` 亲证——初稿所记「尚无图文件/Phase 4 ❌未建」系起草时点 I5 卷亲证旧态】 | A |
| #154 | :412 P3·评审卫生：apps/api/package.json 全文件重缩进，真实变更仅 3 条 | **开放·低值可裁** | 评审卫生面（历史 diff 噪声）·修复=缩进归窄式微改·价值低（裁决项⑨裁留·浅核未深判如实登记） | D |
| #70 | :385 P3·语音上限三处矛盾：契约 base64≤13.5M、bodyLimit 12MiB、MAX_AUDIO_BYTES 10MB，服务内检查不可达 | **半闭（413 行为面已闭）·残面=常量单源** | `apps/api/src/modules/interview/interview-voice.ts:12` MAX_AUDIO_BYTES=10MB+`:60` 已返回 413 `{error:'audio_too_large'}`（修法列「413 返回 {error:audio_too_large}」**已满足**）；`packages/contracts/src/index.ts:121` `.max(13_500_000)` 在=三值矛盾仍在。残面=三处单源化（取值=裁决项②）。dep #71（5C）相邻非硬闸 | D |
| #85 | :388 P3·「资源 id 非法」不同模块返回不同错误码（404 vs 400），UUID 正则三份各写（rev2 如实·初稿「语义混用」系转述） | **开放·EXEC 重 pin** | 抽测 `apps/api/src/modules/jobs/jobs.service.ts` 404 形在；全模块错误码面 rg 重 pin EXEC 做 | D |
| #121 | :395 P3·反馈 question_index 只校验 ≥0（无 int4 上限、不查题号存在），learning_progress.topic 不对应真实弱项（FK 已由 0148 补）【rev2 补登 topic 子面·初稿截记】 | **开放·EXEC 重 pin** | `packages/contracts/src/index.ts:81` 现仅 nullable int 形（本行非反馈入口面·锚漂）·反馈入口上限/存在性校验 EXEC 重 pin；topic 面=`interview-learning.ts:47`（blueprint :395 证据列）+FK 0148 已补核 EXEC 重 pin | D |
| #30 | :372 P3·begin 输入只在 header（resume-id/quiz-id），注册表无 request、OpenAPI 看不到；OpenAPI 写 200 实际 202 | **开放（H5 后锚漂）** | `apps/api/src/modules/interview/interview.controller.ts:27-30` `@Post(':id/begin')` 仍 header 传参（H5 又加 target-role/focus 两 header=`:29` 五 header 形）——#227 合一未删 begin 端点（B 端 start 与 C 端 begin 两轨）。request DTO 注册+OpenAPI 200→202 勘误 EXEC 重 pin | D |
| #174 | :419 P3·通用错误类放在 @meetwise/db，ai-runtime 多处因此新增对 db 的耦合 | **开放·EXEC 重 pin** | 错误类归属搬迁面（微重构）·浅核未深判如实登记 | D |

**簇E 行为/设计残面（11 件·逐件誊录于组·收编与否=裁决项⑴呈报·本卷 §1 零触）**：

| 件 | issues-master | 现状登记 |
|---|---|---|
| #187 | :426 P3·career-path 零模型纯函数却包整套 ai_graph_run 状态机（过度设计） | **growth-gen 卷 :39/:43/:89 三处明示让渡本刀**（「Ban 拆 API 侧状态机（#187 归 5E·契约冻结）」）·实树 `interview.service.ts:768` C-HA-2 seam+`deriveCareerPath` 冻结签名（`packages/domain/src/career.ts:173-178` growth-gen 新面已落）·API 侧旧状态机仍在=**开放**。拆除=行为等价重构（租约/事务/advisory 锁语义保持）非清理·**呈报归独立小刀或本刀末位子片**（裁决项⑴） |
| #2 | :361 P3·预留租约 1800s 只在 claim/心跳续期，用户思考>30 分钟即被回收面 | 开放（行为面）·浅核：`interview-jobs.ts` 租约面 120s 族与 commerce `DEFAULT_LEASE_SECONDS` 分立·预留 1800s 锚 EXEC 重 pin |
| #27 | :370 P3·interview.status='active' 被读无写地 | 开放（行为面）·写侧 rg 抽测零命中（与审计一致）·EXEC 重 pin |
| #128 | :399 P3·空闲回收兜底裸 UPDATE abandoned 不终止 graph run | 开放（行为面）·EXEC 重 pin |
| #130 | :401 P3·预留续租失败只 console.error 极窄窗口对账误判 | 开放（行为面）·EXEC 重 pin |
| #132 | :402 P3·sse-pump safeWrite 忽略 write() 返回 false（背压） | **开放（亲证加重）**：`apps/api/src/platform/sse-pump.ts:67-70` `try { reply.raw.write(s); return true; }` ——write() 的 false 返回被弃、恒 return true。B5 四件套单源化后此面收敛于此一处=修点集中 |
| #148 | :406 P3·「应用层 tenant 第二层」MySQL 原型 owner 取自 principal | 开放（设计面）·EXEC 重 pin |
| #149 | :407 P3·PG uuidv7() 同毫秒非单调 vs TS 计数器单调口径不一 | 开放（口径面）·`packages/db/src/ids.ts:6`（头注）与 `:43`（uuidV7Hex 注）两处「字典序 = 生成序」表述在（rev2 锚更正·初稿误 pin :8-9）·PG 侧对勘 EXEC 重 pin |
| #165 | :414 P3·进度幂等键写死 attempt 0，重试/重生成同键不添行 | 开放（行为面）·`generation-progress.ts:43-44` attemptKey=invoke idempotencyKey 形在·dep #164（5C）相邻 |
| #167 | :415 P3·前端进度归约无条件替换 attemptKey 乱序旧帧覆盖 | 开放（行为面）·`apps/web/lib/stream/generation-progress.ts` 归约面·dep #165 相邻 |

### 0.2 漂移登记（issues-master 证据列旧锚 vs `2f6662ef` 实测）

| 旧锚 | 现锚（实测）·漂移主因 |
|---|---|
| #62 `jobs/actions.ts:17,27,49（对照 :39）` | `:13/:23/:49` 三处裸插值·**对照行已消**（#227 合一删两跳 begin·redirectTo API 生成） |
| #63 `settings/actions.ts:11-14,35` | 残面 `:12-16`（偏好保存）·改密面 `:34-41` 已显式反馈（半闭）·lang 白名单面已闭（I4 #265） |
| #126 `startApplicationAction` | 日志行现锚 `jobs/actions.ts:35` |
| #30 `interview.controller.ts:21-26` | `:27-30`（H5 加 target-role/focus headers·begin 端点仍存） |
| #210 `resume-quiz.ts:31` | `:33` |
| #65 `route.ts:12-13,20-43,50-56` | `:12-:16`（G3 又加 e2e-guard 变体=面加重） |
| #94 `health.service.ts:16-19` | 行号零漂·**性质变**：代码侧 query_timeout 已落（principal.ts:964·HA3 88c48f61）注释转真=已闭 |
| #39 审计时点锚 | 新面 `interview-control-signals.ts:23` 诚实化注释已落（半闭） |
| #187 `interview.service.ts:649-718` | `:768` C-HA-2 seam 区（growth-gen 落面后漂） |
| #28 `ADR-0006` | **文件在树中不存在**（adr/ 仅 0015-0020+0022 共 7 件+README·0021 缺号·rev2 如实化）·实锚=dependency-footprint.md:87/:229/:338（+I4 卷登记 :99 nodemailer 同文件）·ADR 存废/重编 EXEC 重 pin |
| #70 锚 | `interview-voice.ts:12/:60`+`contracts/index.ts:121`·413 形为已闭半面 |
| #74 `index.ts:139-140,177,214；embedder.ts`（blueprint :386 证据列） | `:139/:140`（fakeAsr/fakeTts）+`:177`（fakeEmbedder 导出）+`:214`（流式 fake 族 fakeStreamingAsr/fakeStreamingTts/disabledStreamingAsr/disabledStreamingTts）+`embedder.ts:76` fakeEmbedder 本体全在——rev2 补登证据列全域（初稿仅记三枚=窄化漏网·§0.1/§1-簇B 同步） |
| #121 `:395` topic 子面 | blueprint 原文含「learning_progress.topic 不对应真实弱项（FK 已由 0148 补）」+修法列「topic 限定为该场弱项」——初稿 §0.1 要点与 §1-簇D 修法两处截去·rev2 补登 |
| LEDGER :88 清单 vs issues-master 38 件 | **清单级出入如实登记**（§0.3-2）：LEDGER 列 44 token/42 唯一 vs 表头 38；含 8 件跨登记（#1/#5/#8/#12/#19/#101=issues-master 第5批-C·#41=第1批·#212=第3批双登记）+漏 4 件真 5E 成员（#30/#32/#70/#74） |
| issues-master 38 行行号 | **零漂亲证**（:361-:428+:484-:498 区段全图·§0.1 逐行引） |

**重 pin 免责**：本节锚为起草席 base `2f6662ef` 一次性亲读（深核 22 件/浅核 9 件如实分标）；EXEC 立项/双审照例全量重 pin，漂移只更行号不改结论（I3/I4/I5 卷同款先例）。

### 0.3 五项分歧/登记如实呈报（终裁建议呈报协调方）

1. **#212 双登记（已裁面执行细则）**：文档标注面归 I5（I5 卷 §0.1-③）；清理面归本刀（任务面既裁）。执行细则呈报：本刀 EXEC 时点若 I5 尚未并线→#212 清理面**挂起不执行**（停止条件：blueprint/roadmap 双改面与 I5 触面重叠风险）；I5 已并线→核验其标注足额性，残余不一致点清扫，标注足额则核验零改收面（裁决项⑦）。【rev2 如实化：blueprint :37 与 roadmap Phase 4 勘误已落主线（tip `8b8e20bc` 亲证·卷面自记「勘误 2026-10-11·#212·I5 口径刀」）——软闸按「I5/CI-WIRING 已并线→核验标注足额」分支协议执行·挂起分支仅留 EXEC 时点回退保险（在飞清册 §0.3-7）】
2. **LEDGER :88 清单出入**：该行 44 token/42 唯一与表头 38 不自洽、含 8 件跨登记+漏 4 件（§0.2 末行）。**本卷以 issues-master 第5批-E 38 行为组成权威**（EXECUTION-SOP :3 上游事实源①序）；LEDGER 归属行刷新归 SSOT 刀·本刀零触 SSOT。
3. **组标签与实触面分歧（沿 I5 先例如实呈报）**：TASK-SOP :85 标「38 条文档/死代码/注释」；issues-master 第5批-E 实为 P3 技术缺陷 27+文档不符 11，其中 11 件为行为/设计残面（簇E）。体量与归刀按本卷三分类如实呈报；本卷收编面收窄至同域簇 A-D（25 件·§1 修法 26 面=#170 注/码两半拆面·rev2 计数口径如实地）。
4. **MIG 卷「#94→5E」旧态**：MIG REQUEST（基线 `ad89c1c5`）消费方行列 #94 归 5E；本卷查重实测 #94 已由 HA3 `88c48f61` 闭（主线祖先亲证）。MIG 卷该行系立项时点旧态·零动作需求·登记呈报（LEDGER 核销归 SSOT 刀）。
5. **growth-gen #187 让渡承接**：growth-gen 卷三处明示「#187 归 5E 批量清理刀·契约冻结」——本卷如实承接登记；但拆除面属行为等价重构非清理域·与簇E 同裁（裁决项⑴）·**不 silently 落弃**。
6. **H7 外延不收**：batch-residual-plan :62/:77/:102+LEDGER :59「各归域刀或 5E」（基线 `2f6662ef` 实锚·rev2 更正·初稿误 pin :299）散件族（#38/#73/#80/#119/#171/#173/#185/#49/#160/#163/#48）——AI 质量/外呼/接线域非文案清理域·**归域刀优先**·本卷不收编（呈报协调方派域刀时顺手核）。
7. **在飞清册刷新（rev2 2026-10-12 时点）**：CI-WIRING（ciw）/E2S2 已并线；i6-239 EXEC 已落卷 `7b6d0f38`；AUTHZ 5A-2 rev2 收口 `8a8633ce`/`ea35b27b`/`74374a01` 在审（主线 `git cat-file` 四枚亲证存在·主题吻合）——§0.0「CI-WIRING @`2f6662ef` 零新提交」等邻刀注记系起草时点（2026-10-11）旧态·EXEC 立项照新树重 pin（I3/I4/I5 卷同款先例）。

## §1 修法（簇A-D 触面簇·修法列逐条固化·file:line 实锚·EXEC 立项重 pin·**簇E 零触**）

### 簇A 文档/注释诚实化（10 面·docs+注释·零行为变更）

- **#21**：`commerce.ts:9` 头注「大余数法」措辞对齐 `:185` 实现实态（「前 n-1 桶按比例舍入+尾桶吸收差额·Σconsume===settled」形·逐字=裁决）——**零码动只改注释**。
- **#6/#22**：`commerce.ts:206` 对侧注释与 reconcile（`:475`）实态对齐（下游真实结算已落形）+production-backlog/commerce-saga docs 勘误连带面；**`packages/db/migrations/` 全目录字节零触**（checksum 铁律·§3-4·0001:125/:138 双注=铁律豁免登记）。
- **#11**：全仓 rg「DELETE」×ai_model_invocation 组合注释/ADR 陈旧陈述勘误（EXEC 重 pin 定位）。
- **#28**：`dependency-footprint.md:87/:229/:338` BullMQ/pg-boss 叙述改现行实态（PG 表+SKIP LOCKED 队列形）+`:99` nodemailer 行（I4 卷 :51 登记面顺手）+ADR 侧存废勘误（EXEC 重 pin）。
- **#170（注释半）**：`main.ts:7`「骨架/S5 落」过期注释按 worker 消费循环实态勘误。
- **#166**：`generation-progress.ts:145` 注释措辞诚实化（或清 timer 改一行·二选一=裁决项连带·倾向注释侧零行为变更）。
- **#192**：persistResumeProfile 注释与实现对齐（EXEC 重 pin）。
- **#217**：写侧一致性核+现役 memory 治理面注释诚实化（迁移本体零触）。
- **#212（清理面）**：I5 并线后 blueprint/roadmap 残余一致性核验清扫（§0.3-1 细则）。

### 簇B 死代码/生产边界卫生（6 面·删或隔离·零行为增益）

- **#65**：`events/route.ts` STRESS/GUARD 数据源移出生产构建或 `NODE_ENV=production` 硬拒绝（二选一=裁决项⑤·G3 e2e 断言消费面连带呈报——e2e 断言随演归并发刀已并 `2b1f01a5`·改动后既有 spec 回归照跑）。
- **#74**：fake 导出族移 `test-support` 子路径导出+生产 import 禁规则（族域=fakeAsr/fakeTts/fakeEmbedder+`index.ts:214` 流式 fake 族 fakeStreamingAsr/fakeStreamingTts/disabledStreaming*+embedder.ts fakeEmbedder 本体=blueprint :386 证据列全域·rev2 补全防狭义三枚漏网；机制=eslint no-restricted-imports / depcruise / 边界 prove 三选一=裁决项⑥·若落 CI 配置面与 CI-WIRING 相邻登记 §4）。
- **#60**：`client.ts:35` makeInterviewApi 处置（删并迁测试自持形 / 接线生产=裁决项③）。
- **#170（代码半）**：`main.ts:138` buildMockInterviewRunner 无调用方处置（删或注明保留理由=裁决项连带）。
- **#39（残）**：budget_exhausted 死枚举清理+文档写清软预算语义（blueprint :376 修法列后段「文档写清软预算语义」·rev2 补全·低值·裁决项⑨）。
- **#210**：resume-quiz 死分处置（删字段或质量化+schema 限题数=裁决项④）。

### 簇C web 请求/日志卫生（4 面·小码改·显式反馈增益）

- **#62**：三处路径 jobId/appId 统一 `encodeURIComponent`（沿同仓既有编码先例形）。
- **#63（残）**：`settings/actions.ts:12-16` 偏好保存补响应检查+失败显式反馈（沿同文件改密 `:34-41` 既有形·I4 #265 白名单面零回归）。
- **#64**：前端格式/长度提示（非空判之外·blueprint :383 修法列第一段·rev2 补登）+错误码本地化映射+「失败:'+」直拼消除+fetch 超时（AbortSignal.timeout 形=裁决）。
- **#126**：`jobs/actions.ts:35` 日志 body 收窄（status/message 保留·body 摘要形=裁决）。

### 簇D 契约/常量/错误码一致性（6 面·小码改/微重构·取值/形=裁决）

- **#70（残）**：三上限单源化（10MB/12MiB/13.5M 三选一=裁决项②·**收紧语义如实呈报**：现网 10-12MiB 间请求行为将变）。
- **#85**：抽公共 UUID 校验（正则三份各写归一·blueprint :388 修法列前段·rev2 补登）+资源 id 错误码归一（404/400 语义表=EXEC 重 pin 后固化）。
- **#121**：反馈 question_index 上限+存在性校验；learning_progress.topic 限定为该场弱项（blueprint :395 修法列后段·rev2 补登）。
- **#30**：begin 输入注册双选项（注册表补 header 参数与 202 响应 or 改 body DTO 并经 ZodValidationPipe=blueprint :372 修法列双选项·归属 §8 裁决项⑫）+OpenAPI 200→202 勘误（五 header 现状形含 H5 新增两枚）。
- **#154**：package.json 缩进归窄（低值·裁决项⑨裁留）。
- **#174**：通用错误类下沉独立 errors 包（`circuit-breaker.ts:8/:57/:123`+`invoke.ts:200` 对 `@meetwise/db` errors 耦合解出·`packages/db/src/errors.ts:14-37` 为搬迁源=blueprint :419 修法列·微重构面·EXEC 重 pin）【rev2 补修法行·初稿 §0.1 收编而 §1 漏修法行=无声落空风险·本行消解】。

## §2 验收断言候选（静态源/docs 断言+既有 prove 回归形制·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **#62 断言**：`jobs/actions.ts` 内 `` `/${` 模板裸插值零残留断言+`encodeURIComponent` 计数≥3 断言（三路径逐一）。
2. **#63 断言**：偏好保存路径响应非 ok 早返回分支存在断言（静态源）+I4 白名单既有面零回归。
3. **#64 断言**：`'失败:' +` 字面量零残留断言+本地化映射表存在断言+fetch 超时设施存在断言+格式/长度提示存在断言（随 rev2 补登第一段）。
4. **#65 断言**：随裁决⑤分支——硬拒绝形：production 分支存在断言；移除形：STRESS_ID 全仓零残留断言+e2e 既有 spec 回归 EXIT 原值。
5. **#74 断言**：`ai-runtime/src/index.ts` fake 导出零残留断言（含 `:214` 流式族+embedder.ts 本体·rev2 全域口径）+test-support 路径存在断言+生产 import 禁规则生效负测断言（越线 import 必红形）。
6. **#60/#170 断言**：随裁决——删形：目标符号全仓零残留断言；留形：注释理由存在断言。
7. **簇A 注释族断言**：commerce.ts `:9`/`:185` 措辞互洽断言（「大余数法」孤用零残留）+`packages/db/migrations/` **diff 空断言**（字节零触·checksum 铁律兑现面）+dependency-footprint BullMQ/pg-boss 零残留断言。
8. **#70 断言**：三处引用同一常量单源断言（rg 计数=1 定义形）+413 {error:audio_too_large} 零回归。
9. **#210 断言**：随裁决④——删形：score 公式零残留；质量化形：新公式断言+schema 限题数断言。
10. **回归面随改随核**：typecheck+`db:prove`+`migrate:prove`+web 既有 prove 全 EXIT 原值·base 同红登记不洗（E5 流程·批前实测基线入收据）；E2E 零新增场景（断言面归矩阵/并发刀）。
11. markers=0（§7）+est live=0（§6）双声明入收据。

## §3 范围外（边界清单·越界即 FAIL）

1. **簇E 11 件零触**（#2/#27/#128/#130/#132/#148/#149/#165/#167/#187+#212 标注面）——行为/设计面归裁决项⑴呈报（#187 growth-gen 让渡面承接登记·不落弃）。
2. **#26/#32 零触**（挂起/D3 前置·比例结算死代码与单位常量集中改归产品决议后）。
3. **#94/#162 零触**（已闭核销登记面 only）。
4. **`packages/db/migrations/` 全目录字节零触**：migrate.ts:4 checksum 守卫铁律+0001:2 勿改铁注——#6/#22/#217 修法面一律改道对侧注释/docs（§1 簇A·迁移冲动=停手上报）。
5. **I5 九件面零触**（#225/#233/#234/#235/#231/#262/#263/#264/#267——zh.json:58-66/dashboard:34/QuizPanel:86 等为 I5 占面·I5 卷 §0.1 亲证位图）；#212 只做清理面且闸 I5 并线（§0.3-1）。
6. **E2E 场景面零新增**（断言随演归矩阵/并发刀·既有 spec 回归照跑）。
7. **SCORE/聚合器面零触**（#40/#41 归 SCORE 域·LEDGER :88「#41 🔒SCORE S3」亲读）。
8. **H5 已并线面零触**（dashboard QUICK_ACTIONS `:38` /roles 行、quiz target-role 面已落 `ad89c1c5`——本刀 #62/#126 触 jobs/actions.ts·#63/#64 触 settings/auth-actions·行级零重叠亲证）。
9. **SSOT 只读**：LEDGER/batch-residual-plan/execution-master-checklist/issues-master/TASK-SOP 行与统计零改（核销/归属刷新归 SSOT 刀）。
10. **est live=0**：零模型真实外呼·零生产操作·零 secrets·零 SMTP。

## §4 依赖

**零未决硬依赖**（批5 末位·LEDGER :96 亲读）。①#94 dep #179（MIG）已消——#94 已闭剔除·MIG 在飞与其零文件交集（migrate* 本体零触）；②#65/#74 dep #168（AUTHZ 域 G7 拒绝）=**相邻非硬闸**（生产构建面/模块边界修法不消费 #168 产物）；③#70 dep #71（5C）=相邻非硬闸（常量单源化独立可落）；④#30 dep #85=**同刀内序**（先 #85 错误码语义表后 #30 OpenAPI 勘误）；⑤#187 dep #204 已闭（H4 🔒）——若裁决⑴收编无前置；⑥#212 清理面=**软闸 I5 并线**（停止条件 §0.3-1）；⑦#165/#167 dep #164（5C 进度写在飞）=簇E 呈报面连带。**并发面**：与 AUTHZ（login/上传面）在 `auth-actions.ts` 相邻——行级零重叠登记（AUTHZ 触 api 侧 login 面为主·EXEC 时点照新树重 pin）；#74 依赖规则若落 CI 配置面与 CI-WIRING 相邻（裁决项⑥连带呈报）；I5/H5 触面已划界（§3-5/§3-8）；docs 面无在飞刀触（I3 卷 :114 明示让渡/I4 卷 :51 登记转本刀）。

## §5 Ban 列表 + pins（沿 I5 卷 §5 同源·逐字誊 + 本刀面增补）

**Ban 列表**（I5 卷 §5 同源逐字誊 + 本刀面增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master/TASK-SOP-v2 行与统计只读引用）；Ban 迁移越权（**`packages/db/migrations/` 全目录字节零触**——checksum 铁律·#6/#22/#217 修法面改道对侧·零新迁移）；Ban 触其他工作树（meetwise-i5/mig/authz/ciw/e2ar/entpay/qp 零触）；Ban 伪造已问/已验来源（浅核 9 件如实标 EXEC 重 pin·Ban 假称深核）；**本刀增补**：Ban 触簇E 11 件任何码面（§3-1·裁决项⑴未决前）；Ban 触 #26/#32（D3 前置·§3-2）；Ban 触 I5 九件占面（zh.json arch 区/dashboard:34/QuizPanel/bend-recruiting 等 I5 位图面·§3-5）；Ban 触 ScoreRing/押题链/planner 语义（I5/QP 占）；Ban 弱化既有产品承诺或安全语义（#70 收紧取值如实呈报不静默·#65 拒绝面 fail-closed 倾向）；Ban 删审计日志面信息至失真（#126 收窄保 status/message·裁决形）；Ban 触 E2E 场景面/新增 Playwright 场景（§3-6）；Ban 触 SCORE 聚合/S2-S3 面（§3-7）；Ban retry-to-green/masking/假绿叙事；Ban secrets/`.env*`（Key name-only）；Ban G7 面/车道/live 套件；Ban Meridian；Ban buy cloud。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全静态/docs·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：全部断言=静态源断言+docs 静态断言+既有 prove 回归（typecheck/db:prove/migrate:prove/web prove EXIT 原值）；零生产操作·零 secrets·零 SMTP·零消耗（pins 脚注 `actualSpendCny=null` 同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草阶段恰 1 .md·`ai-docs/delivery/harness/5e-group-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 I3/I4/I5 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀起草阶段恰 1 .md）。本 rev2（2026-10-12）系双审回炉补登载体——补登后整卷重送双审·EXEC 仍待双审（§8 三条款与裁决项①-⑫维持·pins 十一值零翻）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①簇E 11 件收编与否与归刀（建议独立行为小刀或 5C 后继子刀·#187 growth-gen 让渡面承接形）；②#70 三上限单源取值（10MB/12MiB/13.5M 三选一·收紧语义呈报）；③#60 死客户端删或接线；④#210 死分删或质量化（+schema 限题数随收与否）；⑤#65 生产拒绝形（NODE_ENV 硬拒绝 vs 移出构建·e2e 消费面连带）；⑥#74 依赖规则机制（eslint/depcruise/边界 prove 三选一·CI 配置面连带）；⑦#212 清理面执行时点（I5 并线后核验形·未并线挂起）；⑧子片划分（单刀 vs 簇A-D 分片·沿 5C 四子刀先例）；⑨#39/#154 低值件裁留；⑩#63/#64 反馈文案逐字值；⑪#2262 checklist D 登记行与 #187 归属刷新呈报（SSOT 刀）；⑫#30 修法形二选一（header 参数注册 vs body DTO+ZodValidationPipe·rev2 补明）。

---

*5E GROUP REQUEST · 2026-10-11 起草落卷 · **rev2 回炉补登 2026-10-12（docs-only·恰 1 .md 零码动）** · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`2f6662ef` · 分支 `line/5e-group` · 工作树 `meetwise-5e` · 蓝本=更正版 issues-master 第5批-E 38 行（表头 :86=38/0·行号全图 :361-:498 零漂亲证）+ LEDGER :83/:88/:96/:212 逐字 + TASK-SOP-v2 :85 + EXECUTION-SOP :34 + batch-residual-plan @`ab02d499` :62/:77/:102/:111 + 邻卷界线（I3 :32/I4 :29/:51/:115/growth-gen :39/:43/:89/MIG 消费方行/i5-caliber rev2 #212 面）+ 形制 i5-caliber-REQUEST rev2（跨树 @`6ee4a869`·Ban/pins 同源誊录）· 收编=簇A-D 25 件（22 整件+#63/#39 两残面+#212 清理面·§1 修法 26 面=#170 注/码两半拆面·rev2 计数口径如实地）· 已闭剔除 2=#94（HA3 88c48f61 代码补齐注释转真·主线祖先亲证）/#162（tokstream-s3-design 回填）· 挂起 2=#26（待 D3）/#32（修法列自记不单独修）· 簇E 11 件呈报（行为/设计残面·组标签分歧沿 I5 先例如实）· 防重检查过（rg 命中 6 件全归槽登记·checklist 唯一命中 :2262=D 决登记面·无同名卷·邻刀逐卷零占有）· 关键划界=migrations 目录字节零触（migrate.ts:4 checksum 铁律·0001:2 铁注·#6/#22/#217 修法改道对侧）· 漂移登记 15 行（#62 三裸插值锚·#74 证据列全域补登·#121 topic 子面补登·#28 ADR-0006 文件不存在·LEDGER :88 清单 44token/42 唯一 vs 表头 38 出入等）· est live=0 · pins 十一值照抄零翻 · **rev2 双审处置摘要（全数入卷·零落空）**——**席1 PASS 8 勘误**：①蓝本要点口径「逐字誊录」→「忠实节要」如实化（§0 蓝本①）；②authz「37 文件→32 文件」同款本卷无·零触；③§0.3-7 在飞清册刷新（ciw/e2s2 已并线·i6-239 EXEC 落卷 `7b6d0f38`·authz 5A-2 rev2 收口 `8a8633ce`/`ea35b27b`/`74374a01` 在审·四枚主线亲证）+§0.0 CI-WIRING 旧态标注；④#212 软闸「I5/CI-WIRING 已并线→核验标注足额」分支协议如实化（blueprint :37/roadmap :59 勘误已落主线亲证·§0.3-1/§0.1/§1-簇A 三处）；⑤-⑧#64/#166/#149 行号锚三处更正+漂移行数自记如实地（与席2 勘误并流处置）；**席2 FAIL 3 blocking**：A#121 topic 子面补登（§0.1 要点+§1-簇D 修法+§0.2 补行三处）；B#174 修法行补入 §1-簇D+计数口径如实地（蓝本 :419 修法列·选项 a）；C#64 修法第一段「前端格式/长度提示」补齐（§0.1/§1-簇C/§2 断言三处）；**席2 8 勘误**：①#74 证据列全域补登（index.ts:214 流式 fake 族+embedder.ts·§0.1/§1-簇B/§2/§0.2 补行）；②行号 pin 三处（#64 :22/:24·#166 :146·#149 :6/:43·树内亲证）；③LEDGER「各归域刀或 5E」:299→:59（基线实锚）；④漂移登记行数自记如实地（12→15·含本 rev2 新增两行）；⑤#85「抽公共 UUID 校验」补登+要点如实（正则三份各写）；⑥#39「文档写清软预算语义」补全+#30 双选项归属裁决项⑫；⑦#28 adr 计数如实化（0015-0020+0022 共 7 件·0021 缺号）；⑧（与席1 行号锚并流）。**rev2 本身=回炉重审载体·EXEC 仍待双审** · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
