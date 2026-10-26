# UC028-E2E REQUEST — UC-E2E-028 E2E 缺口承接刀起草（GAP-UC028-RECON e2e 断言 + GAP-UC028-TRUTH-BLOCK-E2E 对照 + GAP-UC028-INJECT 注入面 · 一刀三 case · 量级 M · 起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷 2026-10-26 · pre-exec 双审两独立外席待派 · alone≠dual · est live=0）

**席位**：UC-E2E-028 E2E 缺口 REQUEST 起草席（读码定稿+修法裁量+起草三责·协调方派单·靶=coverage matrix UC-E2E-028 行三 OPEN GAP 之 E2E 断言面承接）。
**基线**：`main` @ `47dd6be56`（`git fetch` 后 `origin/main`=`47dd6be56d5f3b59ccf5dc0c827b0bdc2e6952de` 恒等亲证·派单下界「origin tip=47dd6be56」成立）·分支 `line/uc028-draft`（`git worktree add ../meetwise-uc028 -b line/uc028-draft` 亲立·HEAD 落 `47dd6be56` 亲证）·工作树 `meetwise-uc028`（主仓仓根同级）·docs:check 基线 **2341≤cap 2346** 本树亲跑 EXIT=0（`node scripts/ai-docs/check-docs.mjs`·cap 锚 `scripts/ai-docs/public-text-policy.mjs:137` `MAX_FILES = 2_346` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①coverage matrix `ai-docs/delivery/e2e-requirement-coverage-matrix.md:127` UC-E2E-028 行（**gap**·「`GAP-UC028-RECON` / `GAP-UC028-TRUTH-BLOCK-E2E` / `GAP-UC028-INJECT` 仍 OPEN（本刀不认领）」）+`:185`/`:276`/`:516-:518` Line X nail 节同旨；②GAP 台账 `ai-docs/delivery/gap-bug-backlog.md:732` 三 GAP 各自 REQUEST 刀登记；③harness 缺口件 `ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md:55-:69` §1b-2/3/4 三件套原文（注入 harness/补写路径+prove/对照 E2E）；④需求锚 `ai-docs/requirements/use-cases/e2e-scenarios.md:548-:570` UC-E2E-028 三 TC（trace-fail/recon/truth-block）；⑤形制范本 `ai-docs/delivery/harness/trace-recon-REQUEST.md`（§0-§8+trailer 形制·STOP 三条款+四类停止条件+pins 沿承）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git hash-object 实测 @`47dd6be56`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表与先验未闭核

- `git branch --list "line/uc028*"` 恰 1 命中=本席分支；`git worktree list` 含 `meetwise-uc028` 恰 1 树；`ls ai-docs/delivery/harness/ | grep uc028` 建前仅 `uc-e2e-028-trace-ledger-fail-open.md`（缺口件非 REQUEST）→落卷后唯一 REQUEST 同名卷=本卷。
- **先验未闭核（简报令第 1 工序）**：三 GAP 现状对 `47dd6be56` 全量复核=**全部仍 OPEN**——matrix `:127`（行 gap+三 GAP OPEN 逐字）+`:516-:518`（Line X nail 节「STILL_OPEN: `GAP-UC028-RECON` / `GAP-UC028-TRUTH-BLOCK-E2E` / `GAP-UC028-INJECT` 仍 OPEN（本刀不认领）」）亲读；`git log --all --grep` 三 GAP 词面零翻面 commit 亲证；老 prove `uc028:trace-fail-open:prove` G-GAP 臂四 GAP 标签 `:172-:185` 仍在（静态库存未更新）——**无翻面候选·不触发「已闭则停」条款·本卷照立**。
- **本刀=docs-only 起草卷（本 commit 恰 1 tracked .md·零产品码零 proof）**：在飞交叠复核对象=§0.1 十四锚 Stability（非触面）——任一锚 blob 对届时 tip 漂移→重 pin 改锚非停（本刀零写触·漂移不改结论）；共享 SSOT（matrix/LEDGER/backlog）零写触（§3-4）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`47dd6be56`）

| # | 文件 | blob（8 hex） | 行数 | 关键行锚 |
|---|---|---|---|---|
| 1 | `packages/ai-runtime/src/invoke.ts` | `f6102433` | 1250 | **真相面+A1 旁路（读码定稿核）**：`:43` 头注「persistTrace 无条件写入」·`:492` `persistTrace(`（INSERT 唯一入口）·`:518-:521` fail-open 旁路 docstring（spec e2e-scenarios UC-E2E-028 A1）·`:524` `persistTraceBestEffort(`·`:529` 自持 principal 事务 best-effort·`:1067`/`:1110`/`:1130`/`:1152`/`:1239` catch 族 `return { error: 'external_outcome_unknown' }`（真相写失败必须阻塞=**fail-closed 保持**）·`:1075`/`:1182` `settleAiTextCost(`（钱真相·settle/complete 事务内）·`:1079`/`:1200` `completeModelInvocation(`（状态真相·`:1201` `model_invocation_complete_state` 卫）·`:1206-:1208` A1 契约注释（trace 拆出事务·INSERT 失败不连坐）·**:1210 `if (!error) await persistTraceBestEffort(`（事务外调用点·仅 validated success 臂）** |
| 2 | `apps/worker/src/trace-recon.ts` | `e6c8be87` | 129 | **missing-trace 重写队列（TRACE-RECON 承接·已落主线核）**：`:40` `resolveTraceReconConfig`（批限越界 startup error）·`:59` `traceReconOwner`（asPrincipal 内反连接+逐键 `aiTraceBackfillScoped`）·`:89` `traceReconTick`（gateway 枚举→逐 owner→`:114-:115` 差集水位重读 `setGauge`·`:120` ownerFailures>0 throw）·`:106` `inc(METRIC.aiTraceReconBackfilled)`·`:125` `runTraceReconReconciler`（30s drainLoop） |
| 3 | `packages/db/migrations/0207_ai_trace_backfill_scoped.sql` | `33e303c3` | 85 | **回补写面**：`:20-:48` `ai_trace_backfill_scoped`（SECURITY DEFINER+`ai_cost_require_request_owner` 卫 `:30`+输入校验 `:31-:34`+九列 `INSERT…SELECT` `:35-:45`+`ON CONFLICT(owner,idempotency_key) DO NOTHING` `:45`=0001 PK 幂等 arbiter）·`:50-:51` ACL（REVOKE PUBLIC/GRANT app_role）·`:55-:77` `gateway_trace_recon_missing_owners`（owner-only 枚举·22023 限值校验 `:62-:64`）·`:79-:80` ACL（GRANT app_gateway_role）·`:83-:85` 非唯一 partial index |
| 4 | `apps/worker/test/trace-recon.proof.ts` | `d69c8a51` | 219 | **recon worker 级 proof（17 断言六臂·RECON 的 prove 半已闭合）**：配置双拒 `:124/:128`+枚举缝 22023 `:132`+丢失注入成立 `:142`+owner-only 枚举 `:144`+回补恰 1 `:149`+**九列逐列恒等 `:150`**+幂等重放三臂 `:157/:159/:160`+非 success 不补 `:173/:175`+principal 卫 `:182`+ACL `:187`+水位归零/counter `:202/:205`+第二 owner `:207` |
| 5 | `apps/api/test/uc-e2e-028-nhp-fault.proof.ts` | `d25b0752` | 333 | **FAIL-OPEN nail（45 断言 F1–F5+ISO+PIN·注入面唯一现成实现）**：`:139-:140` 防御性删 MODEL_API_KEY/DASHSCOPE_API_KEY+`:146-:147` 断言缺席·**:165-:193 DB 层注入 trigger 族（三表三函数独立：`:166-:172` `uc028_trace_inject_fail`（ai_invocation_trace BEFORE INSERT·f1 键 raise P0001）+`:173-:179` 状态真相写必败（ai_model_invocation BEFORE UPDATE succeeded）+`:180-:186` 钱真相写必败（ai_cost_reservation BEFORE UPDATE settled）+`:163-:164` 跨表共函数 42703 教训注**）·`:196-:228` F1（trace 必败→业务不回滚+观测双臂+单行 JSON 日志）·`:230-:263` F2a/F2b（真相写必败→`external_outcome_unknown`+status=unknown+钱账 NULL+零 settled 净变）·`:265-:283` F3 positive control·`:285-:297` F4 幂等/无双扣·`:299-:307` F5（A2 不冒充+RECON/TRUTH-BLOCK/INJECT 仍 open PIN `:307`）·`:309-:319` PIN 四臂（`:310` `if (!error) await persistTraceBestEffort(` 正则+`:313` settle 事务内+`:314` complete+`:318` catch 族语义） |
| 6 | `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` | `0cdd1275` | 208 | **老 prove（设计绊线现态）**：`:46` FAIL_OPEN_WRAP_RE·`:48` RECON_QUEUE_RE·`:52/:68/:91/:113/:138` S1–S5（S3=invoke.ts 词面 doesNotMatch 仍绿系符号名约定·**事实面=队列已在 worker 域（锚#2）语义已过期但机检面不红**；S4=e2e/ 目录零 UC-028 扫描）·**:156 G-GAP refuse 形（`failOpenWired||reconWired||e2eHits` 任一→throw PRODUCT_SURFACE refuse EXIT=0）**——A1 旁路已落（锚#1 `:1210`）→`failOpenWired` 恒真→**本 prove 现态 EXIT=1=设计绊线**（matrix `:185` 「老 prove 零改动翻转 EXIT=1（S2+G-GAP refuse 逐字复现）=设计绊线」·静态库存更新属另刀）·`:172-:185` pinGap 四 GAP 标签（red run 不打印） |
| 7 | `ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md` | `23db6a93` | 116 | **缺口件（本卷靶面定义源）**：`:36-:39` G-GAP-1..4 表·`:43-:51` 明确不测表（三 GAP 对应行）·**:55-:69 §1b 抬 covered 七件——`:61` 件1=A1 旁路（已闭）·`:62` 件2=故障注入 harness（=本刀 case-①靶）·`:63` 件3=missing-trace 重写队列+对账补写路径+prove（队列+prove 已落·**e2e 断言半=本刀 case-②靶**）·`:64` 件4=对照 E2E（=本刀 case-③靶）·`:65` 件5=e2e/*.e2e.ts 或 full.e2e 专段经隔离 HTTP/worker（**不在本刀域·§3-1 如实登记**）** |
| 8 | `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | 648 | **需求锚**：`:548` UC-E2E-028 节·`:552-:556` 主流程三步（trace 失败不回滚→重写队列/标记缺失→事后对账补写）·`:559-:563` 异常流三行（E-trace失败/E-对账补写/**反例守卫=业务真相（钱/状态）写入失败必须阻塞（区别于 trace）不混淆旁路与真相**）·`:565` 验收 A1/A2/A3·`:567-:569` TC-E2E-028-trace-fail/recon/truth-block 三件 |
| 9 | `e2e/full.e2e.ts` | `5aaa9097` | 906 | **e2e 全链面零 UC-028**：grep `UC-E2E-028|uc028` 零命中亲证（`performance.e2e.ts` 同零）·`:6-:7` 头注「运行器仍由 scripts/run-e2e.mjs 强制隔离 + **真实供应商 Key**，禁止假服务开关」——**live Key 纪律=full.e2e 专段不可入本刀（§1.3 丙）** |
| 10 | `apps/worker/src/main.ts` | `03bca620` | 871 | **recon 接线（worker 真符号在位）**：`:36` import trace-recon·`:730` `runTraceReconReconciler` 循环起·`:787` ready 链含 `traceReconLoop.ready()`·`:833` shutdown 登记 `{name:'trace-recon'}` |
| 11 | `packages/ai-runtime/src/metrics.ts` | `277d0e77` | 213 | `:136` `aiTraceReconBackfilled: 'ai_trace_recon_backfilled_total'`·`:137` `aiTraceReconMissing: 'ai_trace_recon_missing'`·`:191-:192` 零预填两行（recon 观测面常量在位·case-② 断言承载） |
| 12 | `packages/db/src/model-op/model-invocation.ts` | `baf09cc4` | 244 | `:216` `aiTraceBackfillScoped` wrapper（scoped 函数 app 侧出面）——伴锚 `packages/db/src/jobs/gateway-dispatch.ts`（`1f752a27`·108 行）`:36` `gatewayTraceReconMissingOwners` + `packages/db/src/index.ts`（`c8185086`·650 行）`:49`/`:237` 双出面 |
| 13 | `package.json`（root） | `5bdf3111` | 692 | **uc028 三组 wrapper 先例**：`:194-:195` `uc028:nhp-fault:prove`/`:raw`·`:210-:211` `uc028:trace-fail-open:prove`/`:raw`·`:233-:234` `trace-recon:prove`/`:raw`——新 wrapper 沿同形；伴锚 lint 五贴线现值：root `:8` 5242·web `apps/web/package.json:7` 601·api `apps/api/package.json:7` 1423·worker `apps/worker/package.json:7` 959·ai-runtime `packages/ai-runtime/package.json:14` 628（§2-7 题面） |
| 14 | `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `0cf6ae18` | 519 | **行状态锚（翻面权归协调方·本卷零写触）**：`:127` UC-E2E-028 行（gap·三 GAP OPEN 逐字）·`:185`/`:276` 行详注（INJECT+RECON+A3 E2E 三缺原文）·`:516-:518` Line X nail 节（STILL_OPEN 三 GAP+EXIT0≠covered+Ban 借后续刀静默改老 proof） |

### 0.2 派单简报核对（结论零变处如实登记·实质漂移零处）

1. **简报「origin/main tip=47dd6be56」**：亲证成立（fetch 后恒等）。
2. **简报「TRACE-RECON 0207 面已落主线核」**：**blob 级成立·commit 谱系如实登记**——主线落位 commit=`ca8d3e467`（`git log -- apps/worker/src/trace-recon.ts` 亲证）·`d278dccce`（feat/mysql-schema-skeleton 谱系原件）**非** `47dd6be56` 的 commit-ancestor（`git merge-base --is-ancestor` EXIT=1 亲证）·但锚#2/锚#3 两文件 blob 对 `d278dccce` 侧 `git ls-tree` **逐字节恒等**（`e6c8be87`/`33e303c3` 亲证）=并线重放形·面无漂移——简报结论（0207 面在主线核）成立，登记谱系细节防 EXEC 期误引 commit 号。
3. **简报「另一 agent 可能已闭部分」**：核毕=三 GAP **零闭合**（§0.0 先验未闭核·四处亲读+全 ref grep）——本卷不触发「已闭改报翻面候选并停」条款。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 三 GAP 各自缺口半（队列/反例/夹具的「码已落·e2e 断言面未落」精确切分）

- **①GAP-UC028-RECON·已落半=队列+worker proof；缺半=e2e 断言链**：重写队列全件在位（锚#2 循环+锚#3 迁移+锚#12 wrapper+锚#10 接线+锚#11 观测常量）且 worker 级 proof 17 断言绿（锚#4）；但「**丢失态→回补→trace 最终一致**」从未与业务终态/额度面在**同 run 连成 e2e 链**（trace-recon proof 自建 seed 丢失态·不经业务 invoke 终态；NHP F5 反向钉「f1 键 trace 仍=0 不补写」）——需求主流程第 2→3 步（锚#8 `:553-:554`）与 A2 验收（`:565`）的集成断言面=零。
- **②GAP-UC028-TRUTH-BLOCK-E2E·已落半=invoke 层反例守卫；缺半=同 run 对照结构**：NHP F2a/F2b 已实证真相写失败必阻塞（15 臂·锚#5），但 F1（trace 失败不阻塞）与 F2（真相失败必阻塞）系**分段顺序执行非对照断言结构**——老 prove pinGap 原文（锚#6 `:180-:183`）「no dedicated E2E contrast that business-truth fail blocks while trace fail must not」的**对照臂**（同 run 双侧布尔并断·防混淆防泛化·锚#8 `:562` 反例守卫行）=零。
- **③GAP-UC028-INJECT·已落半=NHP 内联夹具；缺半=e2e 注入面**：DB 层注入 trigger 族只存在于 NHP 进程内联（锚#5 `:165-:193`）·无可引用「e2e 注入夹具」段；`e2e/*.e2e.ts` 零 UC-028（锚#9 grep+S4 双证）；full.e2e 链受真实供应商 Key 纪律约束（锚#9 `:6-:7`）——harness §1b-2「故障注入 harness」的**可承载断言面**=本刀 case-①。
- **④老 prove 现态=设计绊线 EXIT=1（非本刀可修面）**：A1 旁路落码使 `failOpenWired` 恒真→G-GAP refuse 臂恒红（锚#6 `:156-:170`）；matrix `:516-:518` 明令「静态库存更新属另刀·**Ban 借任何后续刀静默改老 proof**」——本刀 §2 门 5 预登预期 EXIT=1（非红停）·三 GAP 翻面后老 prove 处置归协调方另裁。

### 1.2 修法裁量定稿（一刀三 case·单文件单 prove·零产品码）

**定稿=新 isolated e2e proof 一件（三 case 三段·共用注入夹具）+注册面三件**：

- **case-① INJECT 注入面（GAP-UC028-INJECT 承接·TC-E2E-028-trace-fail e2e 断言）**：注入夹具段=DB 层 scoped trigger 三函数三表形（沿 NHP `:165-:193` 逐形：trace BEFORE INSERT 必败 P0001/状态真相写必败/钱真相写必败·跨表共函数 42703 教训承登=三函数独立）+零产品 seam 冒充+防御性删 live Key 断言缺席（NHP `:139-:147` 形）+ISO 壳断言——注入生效断言=trace count=0 ∧ invoke 返回 value ∧ 业务终态 succeeded ∧ 额度 settled 恰一次 ∧ `ai_trace_persist_failures_total` 计数+单行 JSON 日志不缺席。
- **case-② RECON e2e 断言（GAP-UC028-RECON 承接·TC-E2E-028-recon）**：**同 run 承接 case-① 丢失态**（非自建 seed）→调真 `traceReconTick`（锚#2 真符号·非复刻逻辑）→回补断言=九列逐列恒等（沿 worker proof `:150` 口径：output 含 redacted 标记位+estimate 同源直携）+幂等重放（二次 tick 零新增零漂）+非 success 行不补+水位 gauge 归零+`ai_trace_recon_backfilled_total` 恰 +1——**业务终态/额度面在回补前后零漂**（钱账 settled 值恒等+invocation 恰一行）=丢失→回补→最终一致与业务真相三面同 run 连链（需求主流程 `:553-:554` 两步集成）。
- **case-③ TRUTH-BLOCK 对照（GAP-UC028-TRUTH-BLOCK-E2E 承接·TC-E2E-028-truth-block）**：同注入函数族打真相面两臂（状态写必败/钱写必败）→阻塞断言=invoke 返回 `external_outcome_unknown` ∧ status=unknown ∧ 钱账 settled NULL ∧ 预算零 settled 净变 ∧ catch 族 `settlement_or_record_failed` 收口；**对照臂（本 case 语义核）**=同一 run 内聚合双侧事实成布尔对照断言：「trace 写失败 → 业务 completed ∧ 额度 confirmed」**且**「真相写失败 → 业务不 completed ∧ 钱账不 confirmed」**同时成立**（NHP 的 F1/F2 顺序臂升格为对照结构·防混淆防 fail-open 泛化·锚#8 `:562` 反例守卫行逐字承载）。
- **承载件清单（EXEC 期·越界即停）**：件① `apps/api/test/uc-e2e-028-inject-recon-truthblock.proof.ts`（新·三 case 一文件·沿 NHP 全形：ISO 壳+attempt 台账+`CHECKS/FAIL` 尾行+PIN 产品 diff 边界机检+头注 pins 照抄）；件② root `package.json` wrapper 双行 `uc028:e2e-gap:prove`/`uc028:e2e-gap:prove:raw`（沿锚#13 `:194-:195` 形）；件③ `apps/api/package.json` `prove:uc028-e2e-gap` 行；件④ `scripts/run-e2e-isolated.mjs` runner 注册（沿 `uc028:nhp-fault:prove:raw` 同触点形·EXEC 对届时 runner 结构亲证后落位）。**预期 diff 面=4 tracked 路径·全部∈上列·多任何 tracked 路径即停（越界需要类）**。EXEC 立项不得改本节三 case 定稿与 §1.3 否决结论与 §5 Ban/pins（改则回炉重审）。
- **命名裁量注**：文件名/wrapper 名系非实质裁量·EXEC 对届时形制可微调（登记·语义面=三 case 一文件一 wrapper 不可变）。

### 1.3 否决登记（防 EXEC 期重开·本席简报令三件+读码承袭两件）

- **候选甲（否决·Ban）=invent covered**（发明 covered/宣称三 GAP 已闭/翻 matrix 行或 FAULT 列/写 partial-as-closed）：EXIT0≠covered≠e2e suite green（matrix `:516-:518` 逐字+老 prove NOTE 三行+harness §0 立场表）——翻面权归协调方（EXEC+post-prove 双审后裁决）·**否决**。
- **候选乙（否决·Ban）=retry-to-green**（门矩阵 prove 红后重跑冲销/改断言迁就结果/红面洗 flake）：attempts 全记录·EXIT1 诚实保留（NHP 头注 `:32`+`:325` 逐字承袭）·**否决**。
- **候选丙（否决·Ban）=live key**（领 MODEL_API_KEY/DASHSCOPE_API_KEY 跑 full.e2e 真链/触发真模型外呼）：锚#9 `:6-:7` 真实供应商 Key 纪律+NHP 零 live 形（`:139-:147`）——本刀全离线 fake provider 面·est live=0；full.e2e 专段（harness §1b-5）不在本刀域·**否决**。
- **候选丁（否决·Ban）=触产品码**（改 invoke/settle/complete/trace-recon.ts/0207 函数体/新增迁移/改 runner 既有门）：三 GAP 缺口=**断言面缺非码面缺**（§1.1 切分）·证据刀非修码刀——锚#1/锚#2/锚#3 blob 前后全等为 §2 PIN 门承载·**否决**。
- **候选戊（否决·Ban）=老 prove 静默改**（借本刀更新 S3/S4 词面/G-GAP 臂/删 refuse 形）：matrix `:516-:518` 明令 Ban·静态库存更新归另刀·**否决**。

## §1-修法（EXEC 期交付面·本 commit 零码·恰 1 .md=本卷）

- **本 commit（起草落卷）**：恰 1 tracked `.md`=本卷——零产品码零 proof 零迁移零 runner 改。
- **EXEC 期（立项后）预期交付面（四件·越界即停）**：件① proof 新文件+件② root wrapper 双行+件③ apps/api prove 行+件④ runner 注册（§1.2 承载件清单）。**预期 diff 面=4 tracked 路径·多即停**。

## §2 验收断言（EXEC 期行使·数字口径以实跑实测为准·题面值熔断另注）

1. **uc028:e2e-gap:prove（本刀主验收·EXEC 新建）**：`pnpm uc028:e2e-gap:prove` EXIT=0（isolated wrapper）——三 case 段全绿·臂数以届时 proof 实测为准（熔断=任一断言红·红不重跑冲销·§1.3 乙）。
2. **uc028 邻面 proof 两门不回退**：`pnpm uc028:nhp-fault:prove` EXIT=0（题面 CHECKS=45 FAIL=0·锚#5 grep 计数亲证）+`pnpm trace-recon:prove` EXIT=0（题面 17 断言·锚#4 亲证）。
3. **metrics:prove** EXIT=0（recon 两常量+零预填承载面）。
4. **老 prove 预登（非红停）**：`pnpm uc028:trace-fail-open:prove` 预期 **EXIT=1**（设计绊线·G-GAP refuse 形·§1.1-④）——EXIT=0 反而红停上报（Ban 本刀改老 proof 使其翻绿·§1.3 戊）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径）。
6. **lint 五贴线**：`pnpm turbo lint` 全绿 EXIT=0·五贴线预算**恰等零超支**：web `601≤601`+root `5242≤5242`+api `1423≤1423`+worker `959≤959`+ai-runtime `628≤628`（现值 @`47dd6be56` 亲证锚#13·本刀新增 .ts 面 api 贴线可能漂移——EXEC 对届时实测·任一值新增超支或第三贴面出现即停）。
7. **neg:all 六段全绿**：`pnpm neg:all` EXIT=0·总臂题面 **692**（trace-recon §9-exec 终值承继·对届树实跑复测归 EXEC 立项重 pin·熔断：实测≠题面停上报如实记归因）。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2346**（锚 `scripts/ai-docs/public-text-policy.mjs:137` `MAX_FILES=2_346` 亲证·基线 2341 亲跑·本卷落卷后 2342·EXEC 期 +proof 等 +2~3 逐个计入后 ≤2346·**超 cap 红停上报**·cap sanction 权归协调方·Ban 自升）。
9. **markers 五类零命中**：本刀改动集五类标记词 grep 零命中（词面沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·四词逐字符拼接+行首冲突标记正则——**词面绝不复抄入卷防自匹配**·命令与回执入卷）。
10. **diff 面机检**：本 commit `git show --stat HEAD` 恰 **1** tracked=.md 本卷；EXEC 期 `git show --stat HEAD` tracked∈§1-修法清单（4·多即停）。
11. **PIN 门（proof 内建·沿 NHP `:309-:319` 形）**：产品 diff 边界机检——锚#1（`:1210` 旁路+`:1182/:1200` 真相事务内+catch 族）与锚#2/锚#3 recon 面零字节改（blob 前后全等·§1.3 丁承载）。
12. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（proof 全离线 isolated wrapper 口径·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **e2e/*.e2e.ts 与 full.e2e 专段零触**（harness §1b-5 隔离 HTTP/worker 全链半+§1b-7 sole-stack·live Key 纪律锚#9）：本刀 e2e 断言面=isolated 真 PG+fake provider 面 proof 族·矩阵相应半 OPEN 如实保留·翻面权归协调方。
2. **产品码零触**：invoke.ts/trace-recon.ts/0207/db wrapper/metrics/main.ts 零字节改（§1.3 丁）。
3. **老 prove 零触**：`uc028:trace-fail-open:prove` 设计绊线现态保持（§1.3 戊）。
4. **共享 SSOT 零改**：matrix/LEDGER/backlog/north-star 只读引用——三 GAP 行翻面权归协调方（本刀不宣称关闭·GAP 收口归 EXEC+post-prove 双审后协调方 nail）。
5. **零 live 模型零 CI 改零依赖升级零 prompt 文本触碰**（est live=0 全期）·Ban 触其他工作树。

## §4 依赖

**①上游已满足（基线链亲证在案）**：A1 fail-open 旁路（锚#1 `:518-:529/:1206-:1210`·Line X nail 已落）+TRACE-RECON 全件（锚#2/锚#3/锚#12/锚#10/锚#11·§0.2-2 blob 恒等亲证）+NHP 注入形（锚#5）+worker proof 口径（锚#4）+需求三 TC（锚#8）。**②无同文件并发**：本刀 docs-only·§0.1 锚漂=重 pin 非停（§0.0）；EXEC 期预期触面（apps/api/test 新文件+root/apps.api package.json+run-e2e-isolated.mjs）对在飞分支题面复核。**③无迁移**：链顶零增（0207 已在链·本刀零迁移面）。**④下游**：三 GAP 收口翻面归协调方；本刀 EXEC 交付后 harness §1b-2/3(e2e 断言半)/4 三件具备闭合证据·§1b-5/7 仍 OPEN（§3-1）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.3 乙·门矩阵 prove 面 EXEC 期恰 1 次·红不重跑冲销）；Ban invent covered/翻面（§1.3 甲·翻面权归协调方）；Ban live key/模型外呼（§1.3 丙·est live=0）；Ban 触产品码（§1.3 丁）；Ban 老 prove 静默改（§1.3 戊）；Ban e2e/*.e2e.ts 与 full.e2e 触碰（§3-1）；Ban 共享 SSOT 写触与行翻面宣称（§3-4）；Ban 抢迁移号（本刀零迁移）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（本卷 docs-only·门矩阵行使全离线·isolated wrapper 口径沿承·EXEC 期 proof 亦全离线）。

## §7 markers=0（卫生声明·亲跑回执）

本刀改动集（本卷 1 .md）五类标记词 grep 零命中（起草席亲跑·五类词面**运行时组装**沿 `scripts/i6-239-gates.proof.mjs` §2-7 同口径：四词逐字符拼接组装+行首冲突标记正则——**词面绝不复抄入卷防自匹配**·命令与 EXIT 回执随本节留痕：改动集=`git diff --name-only HEAD`∪`git ls-files --others --exclude-standard` 双查·五类词+conflict 零命中 EXIT=0）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · 起草落卷 2026-10-26 · pre-exec 双审两独立外席待派 · 翻面=执行令明令授权。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 三 case 定稿与 §1.3 否决结论与 §5 Ban/pins 与 §1-修法交付面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（先并届时 sanctioned 主线再全量重 pin·行号漂移如实改锚·结论不变只更行号·§0.0 复核必做·三 GAP 现状对届时 matrix 重核——**任一 GAP 已被他刀闭→本刀对该 GAP 的 case 段降级为回归守卫或停·归协调方裁**）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚结论漂移（如 A1 旁路被翻改/recon 队列被撤/0207 函数体被改/NHP 注入形或老 prove refuse 形被改/lint 贴线 cap 漂移未经 sanction）→停·重 pin 回炉。
- **机制不满足**：§2 门矩阵任一门红且根因在本卷登记结论（如 truth-block 对照语义被证伪=真相写失败未阻塞/recon 回补九列不恒等/注入夹具在隔离壳内不可复现）→登记结论被证伪→停·如实升级协调方回炉（Ban 就地改登记 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法四件面（需触产品码/迁移/e2e/*.e2e.ts/live Key/老 prove）→停·另刀或协调方裁决（§1.3 五候选否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻 proof 新红/lint 贴面新增超支/docs:check>cap/neg:all 实测≠题面）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*UC028-E2E REQUEST · 2026-10-26 起草落卷 · **`draft:awaiting_pre_exec_dual`**（三处同值：Status 头/§8/本卷尾·pre-exec 双审两独立外席待派·alone≠dual） · base `main` @`47dd6be56`（origin tip 恒等·派单下界成立） · 分支 `line/uc028-draft` · 工作树 `meetwise-uc028` · 读码定稿=三 GAP「码已落·e2e 断言面缺」切分（RECON=队列+worker proof 已落而丢失→回补→最终一致同 run e2e 链缺·TRUTH-BLOCK=invoke 层反例已落而同 run 对照结构缺·INJECT=NHP 内联夹具已落而可引用 e2e 注入面缺·老 prove=设计绊线 EXIT=1 现态）· 修法=一刀三 case 单文件单 prove（case-① 注入面+case-② recon 同 run 承接断言+case-③ 真相阻塞对照臂）+注册面三件·零产品码· 门矩阵十二门（主 prove+nhp-fault 45/trace-recon 17 两邻面+metrics+老 prove 预登 EXIT=1 非红停+typecheck 8/8+lint 五贴线 601/5242/1423/959/628+neg:all 692 题面熔断+docs:check≤2346+markers 五类零命中+diff 恰 1 tracked+PIN+卫生）· §1.3 五否决（invent covered/retry-to-green/live key/触产品码/老 prove 静默改）· 停止条件四类零触发 · 翻面权归协调方（本刀不宣称关闭·三 GAP 行翻面归协调方 post-prove 双审后裁决） · ⛔push · ⛔force push · STOP*
