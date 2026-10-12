# AG-A-RESUME REQUEST（AG 修复轨·失败语义刀 A · AG-05 alreadyApplied invoke(null) 续跑语义 + AG-26 start 续跑同修 + 确定性 proof · 零账本触面）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）。→ **`executed:awaiting_post_prove_dual`**（2026-10-12 EXEC 施工随翻 append 保史：双审 BOTH PASS+协调方常设 loop 授权开工·并线 `999febbf`+施工 commit·五门全绿·§0.3 勘误注+§8 行使记录落卷·⛔push 维持·待 post-prove 双审两外席）。

**席位**：AG 修复轨刀 A 起草席（AG-RESUME 失败语义簇最优先行·EXPERT-REVIEWS §七 失败语义轨刀 A 承接·协调方常设 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `d46cdd21`（主线 tip·`git log -1` 实测 2026-10-12 17:39:27 +0800·AG 复核双专家意见书合成卷落地 commit·零码面）。分支 `line/ag-a-resume`·工作树 `meetwise-aga`（`git worktree add ../meetwise-aga -b line/ag-a-resume` 本起草席已立·建前 worktree list + branch 双查实测不存在·HEAD 落 `d46cdd21` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：三层蓝本全部精读引用——①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `3fe698fe`）AG-05 条目 `:98-107`（file:line+触发例+修法）+ AG-26 条目 `:329-338` + AG-16 条目 `:219-228`（proof 摊刀依据）；②同目录 `EXPERT-REVIEWS.md`（blob `5d446552`）§五 `:39-41`「invoke(null) 续跑四边界」=**修法权威**（A 席 1.4.7 dist 逐行验证）+ §七 `:57-65` 合并修复刀计划（`:60` 刀 A=「AG-05+AG-26+确定性 proof（lifecycle 续跑+getState 重读+MemorySaver 注入崩溃）——零账本触面·最小风险·建立 invoke(null) proof 模板」）+ `:69`（AG-16 proof 摊进各刀系仓内纪律·AG-15 卡死检测=刀 A 伴行观测或独立小刀）；③同目录 `review-log.md`（blob `ea66a06e`）LG-03 `:22` / LR-F1 `:43`（AG-05 源编号行·LangGraph 1.4.7 loop.js:796 + index.js:891 证）+ LG-18 `:37` / LR-F6 `:48`（AG-26 源编号行）+ §四 `:135-137`（推断类结论外部核对表·invoke({) 从 START 重开=成立）；④登记行=`ai-docs/delivery/ai-capability-review/LANDING-INDEX.md`（blob `d0fc9d59`）`:32` AG-RESUME 失败语义簇（最优先）行（载「AG-05（alreadyApplied 时 invoke(null) 续跑）+AG-16 确定性 proof·刀边界以专家评审意见书为准」——本卷即该行刀 A 向之起草兑现）。

## §0 现状锚（起草席亲读·base `d46cdd21`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list`：10 树实测（主仓+5e/authz/blite/e2sc/i263/i6/entpay/parity2/ttlwire）——**无 aga/ag05 树**。
- `git branch --list "line/ag-a-resume"` 空输出——**无同名分支**；宽域 `git branch | grep -iE "ag-a|ag05|aga"` 命中 5 分支全系 `line/rag05-classifier`/`rv/rag05-*`（「rag05」子串巧合·RAG 域·非 AG-05·登记性命中）。
- `rg -l "ag-a-resume" ai-docs/delivery/harness/` EXIT=1 **零命中**；`rg -l "AG-05" ai-docs/delivery/harness/` 恰 1 命中=`gap-rag-05-semantic-classifier.md`（GAP-RAG-05 语义分类器刀·「GAP-RAG-05」串内含「AG-05」子串巧合·非本刀同名卷·登记性）；`ai-capability-review/` 四件+INDEX 系蓝本登记卷非刀卷。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`d46cdd21`）

| 文件 | blob（8 hex·全 40 hex 前缀） | 关键行锚 |
|---|---|---|
| `apps/worker/src/adaptive-lifecycle.ts` | `5cfce9be`（`5cfce9be32c866782019bc37b565bfb57b60c5bb`·全 **505 行有尾随换行**·wc -l=505 亲测——rev2 勘误：rev1 误记「506 行 Read·wc -l=505 系末行无尾随换行」·实测末字节 0x0a·505 行整） | `pendingQuestion()` **:44-47**（蓝本 :42-46 漂移后现位·边界③守卫原语）·`generationFailureOf` :25-42·`writeGenerationUnavailable` :49-79·**start invoke({}) 区 :265-272**（注释 :265-267 自证守卫只覆盖 interrupt 重投面·getState :268·守卫 `if (!pendingQuestion(snap))` :269·`await g.invoke({}, cfg)` :270·重读 :271）·**answer alreadyApplied 区 :309-332**（getState `before` :309·transcript 读 :310·`alreadyApplied` 判定 :311（最后一条 transcript questionId===input.questionId）·`if (!alreadyApplied)` 块 :312-319（pending 校验 :313-315·claim 校验 :316-317·`Command(resume)` invoke :318）·**基线行 `const snap = alreadyApplied ? before : await g.getState(cfg);` :320**·`next = pendingQuestion(snap)` :329·`done = (snap.next?.length ?? 0) === 0` :332）·**question_ready 投影面**：persist :340-350（`if (next)` 门）+ appendEvent :394-399（`if (next)` 门·事件键 `question_ready:${next.questionId}`） |
| `packages/ai-graphs/src/adaptive-interview/graph.ts` | `0c0a0dd2`（`0c0a0dd296f209722479010cb2f816c4c1e6ff51`·全 58 行） | 拓扑注释 :11-17（「plan → decide → genQuestion → (pending ? awaitAnswer(interrupt) : conclude) → evalAnswer → decide*」·「模型调用被隔离在 genQuestion 节点」:15）·装配 :30-57（addNode×6 :31-36·START→plan :37·plan→decide :38·decide 条件边 :39-43·genQuestion 条件边 :44-48·awaitAnswer→evalAnswer :49·evalAnswer 条件边 :50-54·conclude→END :55）·compile({checkpointer, recursionLimit}) :57 |
| `packages/ai-graphs/src/adaptive-interview/nodes/plan.ts` | `2cc9b649` | :8 `mind: initMind(deps.competencies, deps.maxTurns, deps.absoluteMaxTurns, deps.focusWeaknesses)`（AG-26 turn 归零源） |
| `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | `7c614e49` | :65 `retrieveAndGenerate(...)`（模型调用+检索同节点·AG-25 副作用披露面） |
| `packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts` | `aeba291f` | transcript 追加点 :38/:74/:117/:140/:161（evalAnswer superstep 落 transcript 五处投影） |
| `packages/ai-graphs/src/adaptive-interview/state.ts` | `b8c4d2c0` | :156 `transcript: Annotation<Turn[]>({ reducer: (a,b) => a.concat(b), … })`（concat reducer·AG-26 transcript 保留面） |
| `apps/worker/test/adaptive-lifecycle.proof.ts` | `62d465cc`（`62d465cc9a728c50fed55d09ee5d70ff661e1386`·全 **332 行有尾随换行**·wc -l=332 亲测——rev2 勘误：rev1 误记「333 行 Read·wc -l=332 同末行由」·实测末字节 0x0a·332 行整） | 头注 :1-2（「脚本模型(CI)；MemorySaver。 pnpm adaptive-life:prove (需 db:up)」=**proof 形制权威**）·静态 `A(` 臂亲数 40（rev2 口径：运行时断言账 @`2629509d` 热修后实测 **43 PASS**——见 §2-2）·`:57-61` 既有 alreadyApplied 等价重放臂（「crash after checkpoint before event projection/requeue 的等价重放：同 answer identity 只重放投影，不会再次 resume 或二次事件」——只覆盖投影重放·不覆盖图推进=本刀新 proof 的缺口面与扩展基点）·:48/:56 首题/首答臂 |
| `packages/db/src/interview/interview-jobs.ts` | `775a9336` | claim 谓词 :128（`queued OR (running AND lease_expires_at < now() AND attempts < max)`）·`sweepStuckInterviewJobs` :266-278（:271 终态 UPDATE·**:275 running+expired+attempts<max → requeue**——SIGKILL 后 reaper 重排链） |
| `packages/db/src/commerce/commerce.ts` | `f5d256df` | :33 `DEFAULT_LEASE_SECONDS = 1800`（30 分钟 abandoned 链·蓝本 #2 行） |
| `apps/worker/src/commerce-reconcile.ts` | `1eef9b95` | 预留对账回收面（蓝本 #2 行锚 :25-70·非本刀触面） |
| `apps/worker/src/adaptive-interview-service.ts` | `001ec000` | :340/:388/:398 出题幂等键 `${threadId}:ask:t${turn}:0`（AG-26 触发例「turn=0 命中旧 failed 键」面·账本触面零改声明对象） |
| `packages/ai-runtime/src/invoke.ts` | `68e3c1f4` | §2-⑤ 零账本触面断言面（blob 零改） |
| `packages/db/migrations/0130_model_invocation_same_key_claim_join.sql` | `239a0b19` | 同上（failed/unknown 终态重放 :163-164/:179-180·蓝本锚） |
| `packages/db/migrations/0085_ai_model_logical_node_dispatch_slot.sql` | `671c342f` | 同上（逻辑节点槽位·蓝本 §五 :150 锚） |
| `apps/worker/package.json` | `47c40e2d` | :39 `"prove:adaptive-life": "tsx test/adaptive-lifecycle.proof.ts"` 注册 |
| 蓝本三件+登记（只读引用） | issues-final `3fe698fe` / EXPERT-REVIEWS `5d446552` / review-log `ea66a06e` / LANDING-INDEX `d0fc9d59` | 见卷首立项出处行锚 |

**LangGraph dist 锚（@langchain/langgraph 1.4.7·pnpm-workspace.yaml catalogs.langchain 钉版·主树 node_modules 亲读）**：`dist/pregel/index.js:891`（`defaultDurability = config.durability ?? … ?? "async"`——durability 默认 async·与蓝本 loop.js:796/index.js:891 引逐位吻合）·`dist/pregel/loop.js:796`（`doCheckpoint = checkpointer != null && (this.durability !== "exit" || exiting)`——非 exit 模式**每个 superstep 都写 checkpoint**）·`dist/pregel/loop.js:636` `_first`·`:652`/`:709` `EmptyInputError`（:709=**全新 thread 上 invoke(null) 的空输入抛错点**·边界①机证）·`:683-685` 输入分支 `_prepareNextTasks(…, true, …)`+写 INPUT 通道（**非 null 输入丢弃待执行任务并从 START 重开**·AG-26 机制+边界④「派发前窗口」机证）。

### 0.2 预期漂移登记（蓝本锚=外部只读快照 `2fab7946`/意见书对照 tip `f547444e` → 卷基线 tip `d46cdd21`·rev2 补登基线后主线增量两条（:8/:9·至现主线 tip `2629509d`）·结论零变·EXEC 重 pin 时同协议处理）

1. **pendingQuestion 锚**：EXPERT-REVIEWS §五 边界③引「lifecycle :42-46」→ 现 **:44-47**（+2·函数体三行逐字节同形：concluded/generationFailure 守卫+pending ?? interrupts 投影）。
2. **AG-05 三区锚**：issues-final `:103` 载 `:240-251`（alreadyApplied 判定+跳过 invoke）→ 现 **:310-319**；`:258-261`（done 取决 snap.next）→ 现 **:329-332**；`:310-317`（只有存在 next 才发 question_ready）→ 现 **:340-350+ :394-399**（投影事务两段化后的现形）。
3. **AG-26 start 区锚**：issues-final `:334` 载 `:204-208` → 现 **:268-272**（现含 :265-267 守卫注释·注释自证只覆盖 interrupt 重投面）。
4. **路径+行号双漂移**：蓝本 #2 行引 `commerce.ts:26` → 现实径 `packages/db/src/commerce/commerce.ts` **:33**（`DEFAULT_LEASE_SECONDS=1800` 同物）。
5. **出题键锚**：review-log §五 `:150` 载 `adaptive-interview-service.ts:151` → 现 **:340/:388/:398**（`${threadId}:ask:t${turn}:0` 同形）。
6. **续租面锚**：蓝本 #2 行引 `interview-consumer.ts:221-238` → 现 :301（reservation lease renew catch）/:308（`renewInterviewJobLease`）——只在 job 运行期间续租的语义不变·佐证锚非本刀触面。
7. **dist 锚**：review-log §四 `:135-137` 载 loop.js:796/index.js:891/_first 语义 → 现 tip 1.4.7 亲读逐位吻合·另补 :652/:709/:683-685 三处精确行（见 §0.1 末段）。
8. **landing-sync 两批漂移（rev2 补登·基线后主线增量）**：`270a863c`（第二批·AG-39~43 五新案）+`95576e36`（第三批·工具使用边界+AG-38 P3→P2·均 `d46cdd21` 之后主线落卷）——issues-final 行号整体 **+5**（**AG-05 条目 `:98-107`→`:103-112`** 等·blob `3fe698fe`→`dac7f58c`；同批 README/csv/INDEX 重同步：INDEX 增 §七/§八 而 **:32 AG-RESUME 行锚两 tip 逐字节同形不变**·blob `d0fc9d59`→`14783e14` 增节性）；**EXPERT-REVIEWS（`5d446552`）/review-log（`ea66a06e`）零漂**（@`2629509d` ls-tree 亲证）——结论零变·EXEC 重 pin 时 issues-final 系行号照 +5 改锚。
9. **hotfix `2629509d` 一行（rev2 补登·blob 登记更新）**：`apps/worker/src/interview-service.ts` import 行补回 `scoreDispositionFromCodeUnitSpan`（I6 `7b6d0f38` 丢失→刀 A 审席1 隔离复现发现→恰一行补回·blob `240c832a`→`bee3c139`·断裂-修复事实链详见 §2-2）——**刀 A 零触面**（本刀改造面仍恰 `adaptive-lifecycle.ts` 一文件两区·interview-service.ts 不在 §0.1 触面表·§2-⑤ 零账本触面三 blob @`2629509d` ls-tree 亲证恒定）。

### 0.3 EXEC 并线重 pin 勘误注（2026-10-12·EXEC 席·§0-§2 上文原文零改·本节纯 append）

- **并线**：`git merge feat/mysql-schema-skeleton` @主线 tip `616d8ef3` → merge commit `999febbf`·**零冲突**（ort·53 文件 3188+/38−）。**范围勘误**：任务书口径「主线 4c178a4c..2bc4e2bd」——实际 merge 时主线 tip 已前移至 `616d8ef3`（`2bc4e2bd` 后主线续落 AG-COST1 nail 合入 `6f2ed876`+登记两笔、用户裁决三笔、AG-39~43 验证/审计/qbank-acl、刀 B REQUEST `434a57dc`→EXEC `ae478bc6`→rev2 `2a2fee56`→`616d8ef3`）——按分支名现 tip 执行·全部祖先亲证（`git merge-base --is-ancestor`）。**本刀两目标文件主线零漂**：`adaptive-lifecycle.ts` `5cfce9be`（505 行有尾换）/`adaptive-lifecycle.proof.ts` `62d465cc`（332 行有尾换）自 merge-base `d46cdd21` 零 commit 触及——§0.1 行锚全数存活（施工前行号沿用）。
- **§2-⑤ 三 blob 口径（按任务书「本刀 diff 零触」评）**：`invoke.ts` 主线漂 `68e3c1f4`→`eda87ce0`（**E2**：AG-B `ae478bc6` known_executed+cost1 `e6dc3ba7` cachedInputTokens·additive·刀 A 零触）；`0130` `239a0b19`/`0085` `671c342f` 恒定——本刀 diff 对三件零触亲证（receipts `ag-a-resume/06-zero-ledger-touch.log`）。**E1**（席2 勘误）：TTL-WIRE purge 接线（`0e5e1256` interview-consumer.ts :7+:537·`42b3b036` 并线）并线携入——对 AG-05 链零影响：purge 只 terminalize 后清 interview_job 滞留 payload 明文（TTL 面），不触 graph checkpoint/lifecycle 投影/alreadyApplied 判定链任一环。hotfix `2629509d` 恒定零触面。
- **施工后锚（现 tip=施工 commit）**：`adaptive-lifecycle.ts` **530 行**（+25·两区+注释披露）——AG-26 start 区 **:268-282**（守卫 `:275`·invoke(null) `:277`·invoke({}) `:279`）·AG-05 answer 区 **:322-347**（`let snap = before` `:333`·守卫 `:342`·invoke(null) `:343`）·`pendingQuestion` `:44-47`/`generationFailureOf` `:25-42` 锚不变。新 proof `apps/worker/test/adaptive-resume.proof.ts`（306 行）+worker `package.json` `prove:adaptive-resume` :42+root `package.json` `adaptive-resume:prove` :494+runner 三处（source `:248-255`·whitelist `:1826`·migrate `:2724`·命令映射 `:2016-2017`）。

## §1 红事实（机制链现 tip 重 pin·全 @`d46cdd21` 实测·源=LG-03/LR-F1（AG-05）+ LG-18/LR-F6（AG-26））

### 1.1 AG-05 机制链：alreadyApplied 跳过 invoke → 图永不推进 → 30 分钟挂死

逐行链（现 tip 行号）：

1. **每个 superstep 都写 checkpoint**（LangGraph 1.4.7 `dist/pregel/index.js:891` durability 默认 async + `dist/pregel/loop.js:796` 亲读·蓝本已双源核）——evalAnswer superstep 完成即落盘：transcript 已含本题答案评分（`evaluate-answer.ts` 追加点 :38/:74/:117/:140/:161）。
2. **崩溃点**：genQuestion 在等模型时 worker 被 SIGKILL——checkpoint 停在「transcript 含本题·`snap.next=[genQuestion]` 非空·无 interrupt」态（模型调用隔离在 genQuestion=graph.ts:15 注释自证）。
3. **重排**：job 租约过期 → `sweepStuckInterviewJobs`（interview-jobs.ts:275·running+expired+attempts<max → queued）→ 重领 → `submitAdaptiveAnswer` 重入。
4. **alreadyApplied 判定**：`adaptive-lifecycle.ts:311`（最后一条 transcript questionId === input.questionId）→ true → `if (!alreadyApplied)` 块 **:312-319 整块跳过——零 invoke**（`Command(resume)` :318 不执行）。
5. **陈旧快照**：基线行 **:320** `snap = alreadyApplied ? before : …`——snap=before（续跑前快照）·`next = pendingQuestion(snap)` :329 = **undefined**（genQuestion 是待执行 task 非 interrupt·`snap.values.pending` 未写——pendingQuestion :44-47 只认 concluded/pending/interrupts 三态）·`done` :332 = **false**（snap.next 非空）。
6. **双 `if (next)` 门全不进**：persist :340 与 appendEvent :394（question_ready）均以 next 为门 → **question_ready 零发射**·done 块 :433 不进 → job「成功」返回 `{ done:false, nextQuestion:undefined }`——**既不终态也不出题**。
7. **挂死终局**：用户等不到下一题·约 30 分钟（`commerce.ts:33` DEFAULT_LEASE_SECONDS=1800）后预留被对账回收（commerce-reconcile）→ 面试 abandoned（#2 面）·监控零信号（AG-15 面·本刀范围外）。

**触发例**（issues-final `:104` 逐字语义·现 tip 锚重 pin）：evalAnswer 这个 superstep 已写入 checkpoint（transcript 已含本题），genQuestion 在等模型时 worker 被 SIGKILL。reaper 重排后，lifecycle 判定 alreadyApplied，不再 invoke。snap.next=[genQuestion] 非空，所以 done=false，但也不发 question_ready。用户等不到下一题，大约 30 分钟后预留被对账回收，面试变成 abandoned。

### 1.2 AG-26 机制链：start 重投 invoke({}) 从 START 重开 → turn 归零/transcript 保留

`adaptive-lifecycle.ts:269` 守卫 `if (!pendingQuestion(snap))` → `:270` `await g.invoke({}, cfg)`——守卫**只覆盖「已到 awaitAnswer interrupt」的重投面**（:265-267 注释自证：「对 interrupt 中的图再 invoke({}) 会重新从 START 走到 genQuestion……先读 pending，存在则只补业务投影」）。**缺口**：start 崩溃于 genQuestion 中途（无 interrupt·snap.next=[genQuestion] 非空）→ `pendingQuestion(snap)`=undefined → `invoke({})` → LangGraph `_first` 输入分支（loop.js:683-685 亲读）：非 null 输入写 INPUT 通道**并丢弃待执行任务**（`_prepareNextTasks(…, true, …)`）→ 从 START 重跑 → plan 节点 `initMind`（plan.ts:8）把 **turn 归零**而 transcript **保留**（state.ts:156 concat reducer）→ turn=0 出题键 `${threadId}:ask:t0:0`（adaptive-interview-service.ts:340）命中上次 failed → 整场结束（蓝本触发例 :335）。**首题阶段的崩溃不可恢复**。

### 1-修法（严格按 EXPERT-REVIEWS §五 `:41` 四边界逐条·改造面=恰一文件 `apps/worker/src/adaptive-lifecycle.ts` 两区·零节点/零拓扑/零账本触面）

- **① alreadyApplied 分支改造（answer 臂·AG-05）**：alreadyApplied=true 时不再无条件跳过 invoke——以 `before`（:309 既有 getState·边界①「先 getState 判非空」已含）判 **`before.next` 非空且无 pending interrupt**（守卫=现成 `pendingQuestion(before)===undefined`·边界③）→ `await g.invoke(null, cfg)` **续跑到下一个 interrupt**（evalAnswer→decide→genQuestion→awaitAnswer 沿既有拓扑推进·零图改）。alreadyApplied 且 next 空/已有 interrupt 的既有纯重放路径（proof :57-61 臂面）**逐字节保留**——重放零图执行语义不变。
- **② 续跑后重读（基线行改造）**：`:320` 基线 `const snap = alreadyApplied ? before : await g.getState(cfg);` 必须改为**续跑后重读**——alreadyApplied 续跑分支 `snap = await g.getState(cfg)`（新快照）；非续跑的重放分支沿用 before。否则 next/done/投影全用陈旧快照（续跑前 genQuestion 未完成·next=[genQuestion]·done 恒 false——正是 §1.1-5/6 的挂死投影面）。
- **③ 守卫用现成 pendingQuestion()**（:44-47·蓝本 :42-46 漂移后现位）：判定「无 pending interrupt」**零新原语零新函数**——边界③原话「守卫用现成 pendingQuestion()（lifecycle :42-46）」。
- **④ 全新 thread 才 invoke({})（start 臂·AG-26 同修）**：`:269` 守卫改造=无 pending 且 **`snap.next` 非空 → `invoke(null, cfg)` 续跑**（崩溃于 genQuestion 中途的 start 重投不再从 START 重开·不重跑 plan/不归零 turn）；**仅 thread 全新（getState 空态）才 `invoke({}, cfg)`**。守卫形选择=裁决项①。
- **⑤ 残余窗口如实披露（Non-claims·不是全窗口复活）**：崩溃发生在 provider 调用**期间** → invocation 已 dispatching → 120s 后 reconciler 转 unknown（never retries）→ 续跑拿到**确定性 unavailable 快速终态**（generationFailureOf :25-42 既有面接手 → writeGenerationUnavailable :49-79→failInterviewAndRelease）——**本修法把 30 分钟挂死变确定性失败、把派发前窗口变真正续跑**·是正确进步非全窗口复活·后者恰是 pins 要求的行为（EXPERT-REVIEWS §五 :41 逐字语义）。另 AG-25 披露面：续跑 genQuestion 会再做一次检索/进度帧（genQuestion 节点非模型副作用重放）——归后继刀（§3-4）·本刀只披露不修。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof（沿 AG-16 精神摊进本刀·沿仓内既有 proof 形制）**：载体沿 `apps/worker/test/adaptive-lifecycle.proof.ts` 头注形制（:1-2——MemorySaver+scriptedModelClient 脚本模型·真实 PG 隔离库投影面·需 db:up）·注入形=**确定性两段驱动**（沿 :57-61 既有「等价重放」臂直接扩展·裁决项②）：①`startAdaptiveInterview` 跑到首题 ②绕过 lifecycle 投影·直接对图 `invoke(new Command({resume…}), cfg)` 模拟「evalAnswer superstep 已 checkpoint·genQuestion 中途 worker 死」③同 input 再调 `submitAdaptiveAnswer`（=reaper 重排重入）→ 断言：alreadyApplied 路径走 `invoke(null)` 续跑·**图推进到下一 interrupt**（getState next=[awaitAnswer]/pendingQuestion 非空）·**question_ready 发射**（:394-399 面·事件键在卷）·**nextQuestion identity 返回**·evaluate **零重评**（scriptedModel 计数不变·transcript 已含）·ask **+1**（genQuestion 续跑属预期·AG-25 披露）。
2. **既有 adaptive-lifecycle.proof 回归原值（rev2 断言前提对齐·席1 blocking 处置）**：`prove:adaptive-life` **43 PASS/0 FAIL EXIT=0**（**@`2629509d` 亲测**·`pnpm -C apps/worker prove:adaptive-life`·package.json:39·blob 62d465cc——既有臂零翻·新臂裁决后入收据·**卷原标「40 臂全绿」数系旧标·热修后实测 43**）。**断裂-修复事实链（rev2 补登）**：I6 EXEC `7b6d0f38` 重写 import 丢 `scoreDispositionFromCodeUnitSpan`（`apps/worker/src/interview-service.ts` :323 使用点悬空——rev1 基线 `d46cdd21` 上证明实红=断言前提断裂·本工作树 grep 亲证 import 行缺失·该错藏于 worker 直调 tsc 47 红基线）→ 刀 A 双审席1 隔离复现发现 → hotfix `2629509d` 恰一行补回（沿 `50cb3238` 绿形态·blob `240c832a`→`bee3c139`·主线直并）→ 43 PASS/0 FAIL EXIT=0 复证·**tsc 基线 47→46 口径变更随注**（worker 直调形 46 红系既有基线·CI 权威形见 §2-3）。
3. **typecheck（rev2 钉 CI 权威形）**：`turbo typecheck --force` **3/3** 绿+根 `pnpm typecheck` EXIT=0——**勿读作 worker 直调形绿**（worker 包直调 tsc 系 **46 红基线**·既有欠账非本刀面·热修 `2629509d` 后 47→46 口径见 §2-2 事实链）。
4. **AG-26 start 重试路径 proof**（裁决项③是否同刀·推荐同刀）：同注入形——驱动到 genQuestion 中途态（无 interrupt·next 非空）→ 再调 `startAdaptiveInterview` → 断言 `invoke(null)` 续跑**而非从 START 重开**（planner 计数零增·turn 不归零·不重生首题·threadId 出题键不撞旧 failed）。
5. **零账本触面声明**：`git diff` 断言 `packages/ai-runtime/src/invoke.ts`（`68e3c1f4`）/ `0130`（`239a0b19`）/ `0085`（`671c342f`）**blob 零改**——专家定序「刀 A 零账本触面·最小风险」（EXPERT-REVIEWS :60）的兑现面。

## §3 范围外（边界清单·越界即 FAIL）

1. **后继刀零触**：AG-01（准入拒绝）/AG-03+EG-A1（报告键）/AG-04+EG-A2（错误分类+next_attempt_at）/AG-06（model-client 分类）/AG-02 残面=失败语义轨刀 B-F 领地（EXPERT-REVIEWS §七 :61-65 依赖序——刀 B 先于一切重试刀）·报告侧·账本迁移全零触。
2. **AG-15 观测**（卡死检测+ai_graph_run current_node/last_error/checkpoint_id）=**伴行可选小刀或独立**（EXPERT-REVIEWS :69）——本刀不加观测面不新增列。
3. **AG-25 副作用面不修只披露**（§1-修法⑤）：genQuestion 续跑重放的非模型副作用（检索外呼/进度帧）与 AG-09（digest 不稳·LR-F2 在续跑启用后才有触发面）一起归后继刀。
4. **图包零字节**：`packages/ai-graphs/src/adaptive-interview/**`（graph.ts 装配/六节点/state reducer）零改——本刀只改 lifecycle 投影层两区。
5. **API/前端/e2e 产品面零触**；共享 SSOT（LEDGER/checklist/issues-master/ai-capability-review 四件+INDEX）只读引用零改（AG-RESUME 行翻面权归协调方）。
6. est live=0（§6）。

## §4 依赖

**零未决硬依赖**：①零账本触面=专家定序第一刀依据（EXPERT-REVIEWS :60「零账本触面·最小风险·建立 invoke(null) proof 模板」）——无前置刀；②无迁移编号交点（零迁移零 DDL）；③无同文件并发登记面（worktree list 10 树·`adaptive-lifecycle.ts` 零他刀登记）；④既有 proof 基线（adaptive-lifecycle.proof——rev2 重锚热修后基线：**43 PASS/0 FAIL EXIT=0 @`2629509d` 亲测**·卷原标 40 臂数系旧标·断裂-修复事实链见 §2-2）与 LangGraph 1.4.7 catalog 钉版现成可复跑。下游：刀 B-F 骑本刀续跑语义与 invoke(null) proof 模板·LR-F2（AG-09）触发面在本刀后出现——归 AG-09 刀非本刀。

## §5 Ban 列表 + pins（沿 authz-harden/ci-wiring/ttl-wire 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·AG-RESUME 行翻面权归协调方）；Ban 触 `crag.ts` 决策逻辑与 RAG 面（本刀零相关）；Ban 动 embedding 计算面；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 动账本面（`packages/ai-runtime/src/invoke.ts`+`packages/db/migrations/` 0085/0088/0120/0130 及一切 ai_model_invocation 触面零字节·§2-⑤ 断言面·刀 B-F 领地）；Ban 动图包（`packages/ai-graphs/src/adaptive-interview/**` 零字节——节点/拓扑/state reducer/compile 面全零改·本刀只改 lifecycle 投影层）；Ban 动 `model-client.ts`（刀 B 领地）；Ban 全窗口复活出手（残余 dispatching 窗口只披露不修复·边界④语义——后者恰是 pins 要求的行为）；Ban AG-25 副作用缓存/检索拆节点出手（后继刀·本刀只披露）；Ban invoke({) 全新 thread 面回退（全新 thread 仍 `invoke({})`·只改非空 thread 续跑）；Ban 纯重放路径语义变更（:57-61 臂面·重放零图执行不变）；Ban 新增迁移/DDL/env 闸/新配置面/新定时器；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全 MemorySaver+scriptedModelClient 假体/隔离库·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=MemorySaver+scriptedModelClient 脚本假体（沿 :17-24 既有形）+真实 PG 隔离库投影面（`prove:adaptive-life` 需 db:up 既有形）；typecheck=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-a-resume-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts/05-markers 形留执行席收据）。五类标记词不复抄卷内（避免自匹配·沿 authz-harden/ci-wiring/ttl-wire 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（EXPERT-REVIEWS §七 刀 A 计划与 LANDING-INDEX :32 AG-RESUME 行系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：四边界与现码冲突（现 tip 重 pin 已核对零冲突·§0.2 七条漂移全登记性）即停上报。

**待双审/EXEC 裁决项**：①守卫形选择（推荐=单函数形 `pendingQuestion(before)===undefined` 判「无 pending interrupt」·边界③原话零新原语 vs 附加 `snap.next` 数组形判据双条件并陈）；②proof 注入点（推荐=确定性两段驱动形·沿 :57-61 既有等价重放臂扩展·零真进程崩溃 vs 进程内注入抛错形备选）；③AG-26 是否同刀（推荐=同刀——蓝本刀 A 计划原文「AG-05+AG-26+确定性 proof」=同刀·同一续跑语义面·start 臂 proof 并行 §2-4）；④新 proof 住地与门名（沿 `apps/worker/test/` 形制·EXEC 定名沿 prove:adaptive-life 形）。

**EXEC 行使记录（2026-10-12·§8-③ 冻结条款遵守：§1 修法清单与 §5 Ban/pins 零改·四裁决项全按卷推荐形+协调方任务书指令行使）**：①守卫形=**双条件并陈**（单函数形 `pendingQuestion(before)===undefined` 为核+`before.next` 非空为界·`:342`——边界③零新原语）；②proof 注入点=**两形都做**（任务书指令「两形都做：两段驱动+注入抛错」）——形① 两段驱动+模型 seam 注入抛错（`generate-question.ts:65` 无 try/catch 实证=genQuestion 中途 worker 死的确定性进程内注入·**执行面续跑窗口**）+形② MemorySaver+checkpoint 边界注入抛错（genQuestion 已完成·writes 已 putWrites 持久化·下一 checkpoint 未推进即坠=**投影面窗口**·壳内 structuredClone 修正 MemorySaver 按引用存对象别名泄漏以对齐 PostgresSaver 字节冻结语义）；③AG-26 **同刀**·a/b 两面（a=直驱 seam 注入确定复现「无 interrupt·next 非空」执行面·b=checkpoint 注入投影面）；④新 proof 住地=`apps/worker/test/adaptive-resume.proof.ts`（306 行·36 臂）·门名=`prove:adaptive-resume`（worker）+`adaptive-resume:prove`（root·isolated 目标 `ag-a-resume:prove:raw`）。

**残余窗口披露（修法⑤行使·§8 Non-claims 同源）**：①provider 调用期间崩溃→invocation dispatching→120s reconciler→unknown（never retries）→续跑 `invoke(null)` 后 genQuestion fail-closed 落 degraded→既有 `generationFailureOf`→`writeGenerationUnavailable` **确定性 unavailable 快速终态**——30 分钟挂死变确定性失败·非全窗口复活（pins 要求的行为·后段窗口即 dispatching 前崩溃才真正续跑）。②checkpoint 注入形施工中新观测（如实登记·本刀零改既有语义）：该崩溃窗口任务 writes 已 putWrites 持久化（getState pending 已见下一题·next 空）→alreadyApplied 守卫恰以 next 非空为准不越界→走既有纯投影重放路径：同题 identity 补投影+question_ready 发射+既有 done 块收口（next=[]→done=true→interview completed·「先投影下一题再收口」的既有窗口语义归后继刀评估·proof 形② 臂如实钉住）。③AG-25 披露：形① 续跑 genQuestion 重入做一次检索/进度帧（ask+1 实证）——归后继刀。④lifecycle 级 `planCompetencies`（planner）每次 start 重投都重调——系 lifecycle 规划面非图 plan 节点·既有形零改。⑤施工过程两观测如实登记：durability-async 下 decide→genQuestion 边界 put 注入走 fire-and-forget 链致 loop 半续跑坠点态不确定（AG-26 a 面改用 seam 直驱确定复现）·MemorySaver 对象别名泄漏（入库侧 freeze 修正）——均系 proof 方法学选择非边界冲突。

---

*AG-A-RESUME REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`d46cdd21`（git log -1 实测 2026-10-12 17:39:27 +0800）· 分支 `line/ag-a-resume` · 工作树 `meetwise-aga`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处三层蓝本=issues-final AG-05 :98-107/AG-26 :329-338/AG-16 :219-228+EXPERT-REVIEWS §五 :39-41（修法权威）+§七 :60（刀 A 计划）+review-log LG-03 :22/LR-F1 :43/LG-18 :37/LR-F6 :48+LANDING-INDEX :32（AG-RESUME 行·不自建 SSOT 行）· 防重双对表过（harness 无同名卷·rag05 系子串巧合登记性）· 红事实=现 tip 重 pin 机制链七步（alreadyApplied :311→跳过 invoke :312-319→陈旧快照 :320→next undefined :329→done false :332→双 if(next) 门零发射 :340/:394→30min abandoned commerce.ts:33）+AG-26 链（守卫 :269 只覆盖 interrupt 重投·invoke({}) :270 从 START 重开 loop.js:683-685 亲读·initMind turn 归零 plan.ts:8·transcript concat state.ts:156）· 修法=严格四边界（①先 getState 判非空+snap.next 非空且无 pending interrupt→invoke(null) 续跑 ②续跑后重读 snap ③守卫 pendingQuestion() ④全新 thread 才 invoke({}) ⑤残余窗口=确定性 unavailable 快速终态如实披露·30 分钟挂死变确定性失败·非全窗口复活）· 改造面恰一文件两区 · 断言候选五条（新 proof 续跑到下一 interrupt+question_ready 发射+evaluate 零重评/40 臂回归原值/typecheck/AG-26 start proof/零账本触面三 blob）· est live=0 · pins 十一值照抄 · markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

*rev2（2026-10-11·席1 FAIL 处置·docs-only 窄面修订·恰 1 .md 零码动·结论零变·⛔push）——席1 处置摘要：**blocking 1**（§2-2/§4-④ 断言前提对齐：既有 adaptive-lifecycle.proof 断言重锚热修后基线 `prove:adaptive-life` **43 PASS/0 FAIL EXIT=0 @`2629509d` 亲测**·卷原标 40 臂数系旧标·热修后实测 43）+**errata 4**——①§0.1 行数账两处（lifecycle 实 505 行有尾换非「506 无尾换」·proof 实 332 行有尾换非 333·wc -l+末字节 0x0a 亲测）②§2-3 钉 CI 权威形（`turbo typecheck --force` 3/3+根 `pnpm typecheck`·勿读作 worker 直调形绿——直调 46 红基线）③§0.2 漂移补登两条（:8 landing-sync `270a863c`/`95576e36` 致 issues-final +5·AG-05 `:98-107`→`:103-112` 等·EXPERT-REVIEWS/review-log 零漂；:9 hotfix `2629509d` 一行·刀 A 零触面·blob 登记更新）④裁决项②「两段驱动 vs 蓝本 MemorySaver+注入抛错异形」**维持双裁呈现不动**。**hotfix 链**：I6 EXEC `7b6d0f38` 重写 import 丢 `scoreDispositionFromCodeUnitSpan`（interview-service.ts :323 悬空·rev1 基线上证明实红·藏于 tsc 47 红基线）→ 刀 A 审席1 隔离复现发现 → hotfix `2629509d` 恰一行补回（`240c832a`→`bee3c139`·沿 `50cb3238` 绿形态）→ 43 PASS 复证+tsc 基线 47→46 口径随注。§8-③ 冻结条款维持·STOP 维持（`draft:awaiting_pre_exec_dual`·alone≠dual·Dual PASS ≠ 开工）·markers=0 亲跑·pins 十一值零翻。*


*EXEC（2026-10-12·施工随翻·⛔push 维持·待 post-prove 双审两外席·alone≠dual）——**并线**：`999febbf`（merge `feat/mysql-schema-skeleton` @tip `616d8ef3`·零冲突·范围超任务书口径（tip 前移）如实登记·两目标文件主线零漂 `5cfce9be`/`62d465cc`）→**施工**：恰一文件两区（`adaptive-lifecycle.ts` 530 行·AG-05 answer 区 `:322-347` invoke(null)+重读 snap·AG-26 start 区 `:268-282` next 非空 invoke(null)/全新 thread invoke({})）+新 proof `adaptive-resume.proof.ts`（306 行·36 臂·两形都做：形① 两段驱动 seam 抛错=执行面续跑窗口+形② checkpoint 边界注入=投影面窗口·AG-26 a/b 两面）+门注册三处（worker pkg :42/root pkg :494/runner :248-255·:1826·:2724·:2016-2017）。**门全表**（终树亲跑·receipts `ag-a-resume/` 同目录七件）：新 proof 36 PASS/0 FAIL EXIT=0（isolated fresh-DB-per-run·migrations 172）·`prove:adaptive-life` 43 PASS/0 FAIL EXIT=0 原值（rev2 断言前提·含本刀改造）·turbo typecheck --force 3/3 EXIT=0+根 pnpm typecheck EXIT=0（CI 权威形）·worker 直调 tsc **46=基线原值**（本刀文件零新增·`adaptive-lifecycle.ts:189` TS2532 系既有基线内·行号 186→189 系注释增行漂移）·零账本触面三 blob 本刀 diff 零触（invoke.ts 主线漂 `68e3c1f4`→`eda87ce0` 系并线携入·0130/0085 恒定）·markers=0 五门（净增行精 grep 全 EXIT=1·粗 grep 伪命中裁决在卷）·docs:check EXIT=0·est live=0（scriptedModelClient+MemorySaver+隔离库·零外呼）·pins 十一值零翻。**四裁决项行使**（§8 附录）：①双条件并陈 ②两形都做 ③AG-26 同刀 a/b ④adaptive-resume.proof.ts+prove:adaptive-resume。**残余窗口披露**（修法⑤）：dispatching→unknown→确定性 unavailable 非全窗口复活·checkpoint 注入新观测两窗口语义（执行面/投影面·后者既有收口语义如实钉住归后继刀）·AG-25 ask+1 披露·planCompetencies lifecycle 级重投重调既有形。§1 修法清单/§5 Ban/pins 零改（§8-③ 冻结条款遵守）·共享 SSOT 零触（AG-RESUME 行翻面权归协调方）·`git merge-base --is-ancestor` 祖先亲证。*