# AG-C-REQUEUE REQUEST（AG 修复轨·失败语义刀 C · AG-04 consumer 瞬时错误分类 requeue + #4 next_attempt_at 退避 + EG-A2 queued 超限终态 · docs-only 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push·待预执行双审两外席·**Ban self-approve** · **alone≠dual** · **Dual PASS ≠ 开工**）→ **`executed:awaiting_post_prove_dual`**（EXEC 施工+随翻落卷·append 保史·§0-§8 原文零改·断言门全绿·待 post-prove 双审两外席·⛔push·见卷尾 EXEC 附记）。

**席位**：AG 修复轨刀 C 起草席（AG-RESUME 失败语义簇·EXPERT-REVIEWS §七 失败语义轨刀 C 承接·协调方常设 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `b95c9c4b`（主线 tip·`git log -1` 实测·TTL-WIRE 收官 docs commit·零码面）。分支 `line/ag-c-requeue`·工作树 `meetwise-agc`（`git worktree add ../meetwise-agc -b line/ag-c-requeue` 本起草席已立·建前 worktree list + branch 双查实测不存在·HEAD 落 `b95c9c4b` 亲证）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：三层蓝本全部精读引用——①`ai-docs/delivery/ai-capability-review/issues-final.md`（blob `dac7f58c`）AG-04 总览行 `:16` + 详情 `:92-101`（源编号 LG-04/LR-F3·file:line+触发例+修法「consumer 按错误分类处理：PG 连接类、超时类、ECONNRESET 走 requeue，带退避和 attempts 上限（配合 #4）；只有确定性业务错误才终态化」）；②同目录 `EXPERT-REVIEWS.md`（blob `5d446552`）§二-2 `:17`「requeue 上限执行点缺失（AG-04 刀 blocking）」=**修法权威·三件同刀**（①requeue 调用点判 attempts≥MAX→markJobFailed+terminalize ②claim queued 谓词加闸或 reaper 加 queued 超限扫（二选一） ③`next_attempt_at` 列（#4）升硬依赖·报告队列全套范本 report.ts:53/:71-84·2^n 封顶 300s+quarantined+reason `max_attempts_exceeded`·新终态 reason=`retry_exhausted` 入 terminalizeUnsettledInterview 事件分诊）+ §六 `:48` EG-A2（queued 路径无 attempts 终态=本刀验收项）+ §七 `:62` 刀 C 计划行+`:61` 刀 B 定序行+ §五 `:39-41` invoke(null) 四边界（**刀 A 域·本刀不含**）+ §二-3 `:18`（重试预留放大=上限值联动约束）；③同目录 `review-log.md`（blob `ea66a06e`）LG-04 `:23` / LR-F3 `:45`（AG-04 源编号行·interview-consumer.ts:376-387 证）+ LR-F5 `:47`/`:121`（queued requeue 不受 attempts 限制同构佐证·归 AG-29）；④登记行=`ai-docs/delivery/ai-capability-review/LANDING-INDEX.md`（blob `14783e14`）`:32` AG-RESUME 失败语义簇行（AG-04 载「consumer 瞬时错误分类 requeue+退避+attempts 上限」——本卷即该行刀 C 向之起草兑现）。

## §0 现状锚（起草席亲读·base `b95c9c4b`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list` 建前 11 树实测（主仓+5e/aga/authz/blite/e2sc/i263/i6/entpay/parity2/ttlwire）——**无 agc 树**。
- `git branch --list "line/ag-c-requeue"` 建前空输出——**无同名分支**；宽域 `git branch | grep -i "ag"` 命中均系 `line/ag-a-resume`（刀 A）与 `rag*` 子串巧合（RAG 域）·非本刀。
- `rg -l "ag-c-requeue" ai-docs/delivery/harness/` **零命中**；`rg -l "AG-04" ai-docs/delivery/harness/` 4 命中=`r4-domain-isolation.md`/`r4-domain-isolation-status.md`/`r5-retirement-sole-stack-status.md`/`rag04-ssot-align.md`——全系「GAP-R**AG-04**」/「R**AG-04**」子串巧合（RAG 域·登记性命中）·非本刀同名刀卷；`ai-capability-review/` 四件+INDEX 系蓝本登记卷非刀卷。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`b95c9c4b`）

| 文件 | blob（8 hex·括号全 40 hex） | 关键行锚 |
|---|---|---|
| `apps/worker/src/interview-consumer.ts` | `885b5993`（`885b5993b3419b3891e1b9f75dd2b70b7f12a8db`·全 571 行 Read 亲读） | :7 import（`errCode`/`requeueInterviewJob`/`MAX_INTERVIEW_JOB_ATTEMPTS` 等 30 符自 @meetwise/db）·`terminalizeUnsettledInterview` **:146-166**（reason 联合 **:147**=`'job_failed' \| 'worker_died'`·`failInterviewAndRelease` :150 退款·appendEvent :161/:163·dedupe 键 `…:${reason}`）·`failClaimedInterviewJob` **:225-239**（markJobFailed :229·terminalize `'job_failed'` :233）·claim 调用 :249-250（MAX 显传）·privacy-fenced requeue :264·reference gate 确定性终态 :272-277·fence 未取 requeue :490·markJobDone :494·**catch :498-509**（**:502 `errCode(e)==='graph_fence_lost'` 唯一 requeue 白名单→:503 requeue；:508 余一律 failClaimedInterviewJob→:509 'failed'**）·`reapStuckInterviewJobs` :526-540（:531 `'worker_died'`·purgeStale :537）·`interviewDispatchTick` :543·`runInterviewConsumer` :569（**intervalMs=5000=热循环拍长**） |
| `packages/db/src/interview/interview-jobs.ts` | `775a9336`（`775a93361e5db460a6b94a765e346c5c840126bf`·全 314 行 Read 亲读） | **:15 `MAX_INTERVIEW_JOB_ATTEMPTS=5`**（单一真相·claim 与 sweep 共用）·`claimNextInterviewJob` :112-153（**:123 `attempts=attempts+1` 只在 claim 自增**·**:128 谓词 `queued OR (running AND lease_expires_at<now() AND attempts<$4)`——queued 臂零 attempts 闸零时闸**·僵尸兄弟守卫 :132·RETURNING attempts :144/:151）·markJobDone :226-232·markJobFailed :233-236·**`requeueInterviewJob` :239-245**（置 `queued`+lease NULL·**不写退避·不判上限**）·renewInterviewJobLease :250-258·**`sweepStuckInterviewJobs` :266-279**（:270-272 终态=running+expired+attempts≥max·:273-276 requeue=running+expired+attempts<max——**queued 行收割永不触达**）·`enumerateOwnersWithJobs` :311-314（queued 无条件枚举 owner） |
| `packages/db/src/report/report.ts`（范本·只读） | `d20d0baf`（`d20d0baf837c684ba91ee79d3e4ca6990ed0e343`·全 94 行 Read 亲读） | :10 `MAX_REPORT_ATTEMPTS=3`·`markReportFailed` :49-57（**:53 `next_attempt_at = now()+make_interval(secs=>least(power(2,attempts)::int,300))`——2^n 秒封顶 300s 退避范本**）·`requeueFailedReport` :61-66（attempts/next_attempt_at 重置·#229 D2）·`sweepReports` :74-88（:77-81 quarantined=attempts≥max AND (failed OR running expired)·:82-85 requeue=failed AND attempts<max AND **`(next_attempt_at IS NULL OR next_attempt_at<=now())` 退避时闸**） |
| `apps/worker/src/report-worker.ts`（范本·只读） | `76bc751a`（`76bc751ab6ec059e169e7bcdca223718210e0cc8`） | :182-188 quarantined→appendEvent `report_unavailable`·**:188 `{ reason: 'max_attempts_exceeded' }`（超限事件分诊范本）** |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（`d68f8dd0e61682603e9cd8fc1c1e8aaaf4965b79`） | ai_report :224-247（**:231 `next_attempt_at timestamptz` 注释「退避：failed 后到此刻才允许重排」**·ix_report_claimable :239——rev2 E5 勘误：rev1 记「ix_report_claim :247」·全名 `ix_report_claimable`·:247 实为 POLICY `WITH CHECK` 行）·**interview_job :253-268 无 next_attempt_at**·ix_ijob_claim :268（rev2 E5·rev1 记 :269） |
| `packages/db/sql/04_report.sql` / `sql/05_interview_jobs.sql`（影子面·冻结） | `68bad45b` / `f68e2641` | 04:12 同列注释形·05:5-33 interview_job 影子亦无该列·**两文件 git log 仅 initial 两 commit 后零改=冻结面**（proof 头注明示禁影子 schema 伪造通过） |
| `packages/db/migrations/`（目录） | —（ls 实测） | **171 个 .sql**（rev2 席2 勘误 E3·rev1 误记「72 文件」·亲数口径=0001-0169 共 169 号−空号 0164+重号三组各一=171）·**最新 `0169_auth_user_session.sql`**·重号 0143×2+0152×2+0160×2+空号 0164 系历史不改（rev2 E4 补全·rev1 只记 0160 双号）——**新迁移号=0175**（rev2 E1 编号裁定·rev1 记 0170：billing 战役 LANDING-INDEX :43 已公布 0170-0173 自用——billing 定谳 18:14:05→本卷落卷 18:14:26·21 秒竞速·非起草席过错——刀 B EXEC 预定 0174·**协调方裁定编号分配：billing 0170-0173/刀B 0174/刀C 0175**·EXEC 立项复核） |
| `packages/errors/src/index.ts` + `packages/db/src/errors.ts` shim | `d505f0d0`（`d505f0d0d412bac3c49e5d3e0221266bf4126d4a`）/`d4621afb` | errors :30-33 `errCode`（AppError.code ∪ 结构 `.code`·string 才取——**PG SQLSTATE/23505/Object.assign 惯例原生过面**=白名单分类通道） |
| `apps/worker/src/adaptive-lifecycle.ts`（刀 A 域·零触） | `5cfce9be`（`5cfce9be32c866782019bc37b565bfb57b60c5bb`） | :121 `throw Object.assign(new Error('graph_fence_lost'),{code:'graph_fence_lost'})`（**错误标签惯例先例**·本刀只消费其 code 零改此点） |
| `packages/ai-graphs/src/adaptive-interview/graph.ts`（零触） | `0c0a0dd2` | :31-36 addNode×6 零 retryPolicy（AG-04 file:line 佐证·retryPolicy 配置=范围外§3） |
| `packages/db/src/principal.ts` | `c31cbac0` | :947 `statement_timeout: PG_STATEMENT_TIMEOUT_MS ?? 15000`（服务端 GUC·15s→SQLSTATE 57014 触发面） |
| `packages/ai-runtime/src/model-client.ts`（刀 B 域·零触） | `27eb7516` | :734/:877 HTTP 层 transient/deterministic 分诊先例（`status>=500\|\|429\|\|408\|\|425`）——分层对照非本刀分类面 |
| `apps/worker/test/reaper.proof.ts` | `48c690c0`（`48c690c05c99adbc046fe5e9dfdd42f2e845caa6`） | :1-14 头注①-⑦（TOCTOU/不双增/上边界终结+退款/押题同构/僵尸守卫/已结算不发假终态/心跳自停）·**28 臂亲数**（`A(` 计数）——§2-② 回归基线 |
| `apps/worker/test/interview.proof.ts` | `645ec783`（`645ec7839f2a1aed9ba7efe09d4f36713bbc4665`） | :1-5 头注（run-e2e-isolated 完整版本化迁移+MemorySaver+scriptedModelClient·禁影子 schema）·**:95-104 `ConsumerDeps` 注入形**（pool+MemorySaver cp+model+adaptive）=§2-① 新 proof 住地形·:110/:152 dispatchTick 驱动形 |
| `packages/db/src/jobs/quiz-jobs.ts`（范围外·登记） | `a56a0da4` | :44 同构 queued 零闸谓词（EG-A2 同构缺口在押题线亦在·本刀零触只登记§3） |
| `package.json` / `apps/worker/package.json` | `616cf12b` / `107d3d2d` | 根 :248/:257（interview:prove/reaper:prove run-e2e-isolated 注册）·worker :12/:14/:19（prove:flow/prove:interview/prove:reaper） |
| 蓝本三件+登记（只读引用） | issues-final `dac7f58c` / EXPERT-REVIEWS `5d446552` / review-log `ea66a06e` / LANDING-INDEX `14783e14` | 见卷首立项出处行锚 |

### 0.2 漂移登记（蓝本锚=外部只读快照 `2fab7946`/意见书对照 tip `f547444e` → 现 tip `b95c9c4b`·结论零变·EXEC 重 pin 时同协议处理）

1. **catch 锚最大漂移**：issues-final `:97` 载 `interview-consumer.ts:376-387` → 现 **:498-509**（+111·I3/TTL-WIRE 等批次插入所致）；同卷 `:156-169` → 现 :146-166（terminalize）+:225-239（failClaimed）两函数现形。
2. **sweep 锚**：EXPERT-REVIEWS `:17` 载上限判定 `:250-253` → 现 **:270-272**（sweep 整体 :266-279）；claim `:123`/`:128` **零漂**（亲读逐位吻合）。
3. **report 范本锚**：EXPERT `:17` 载 `report.ts:53/:71-84` → :53 **零漂**·sweep 现位 **:74-88**（+3·两 UPDATE 现形）；`max_attempts_exceeded` reason 现位 report-worker.ts:188。
4. **#4 列预设勘误（立项蓝本措辞 vs 实测·如实改述非冲突）**：立项措辞「next_attempt_at 列 0001 已存在零使用」——实测该列 0001 只在 **ai_report**（:231·且**非零使用**：report.ts :53/:63/:85 三处在用=范本本体）；**interview_job 两面（0001 :253-268+sql/05 影子 :5-33）均无此列**→ #4=**真新迁移面**（0175 加列·rev2 E1 编号裁定）·与专家三件零冲突（专家③本就定「列（#4）升硬依赖」隐含新面）。
5. **review-log 佐证锚**：LR-F5 `:47` 载 `interview-jobs.ts:121-147,222` → 现 :112-153（claim）/:226-236（markJob 族·+6）。
6. **蓝本卷 blob 漂移**：issues-final `3fe698fe`（刀 A 立项时）→ 现 `dac7f58c`·LANDING-INDEX `d0fc9d59`→`14783e14`（95576e36 landing-sync 批次）·EXPERT-REVIEWS `5d446552`/review-log `ea66a06e` **零漂**；AG-04 详情现位 :92-101（:16 总览/:395 AG-07 互引）。
7. **graph 锚**：AG-04 file:line 载 `graph.ts:30-57` → 现 addNode :31-36 零语义漂（blob `0c0a0dd2` 与刀 A 亲读版逐位同）。

## §1 红事实（机制链现 tip 重 pin·全 @`b95c9c4b` 实测·源=LG-04/LR-F3（AG-04）+EG-A2（EXPERT §六 :48）+LR-F5 :47 同构佐证）

### 1.1 AG-04 机制链：图运行任何异常→failClaimedInterviewJob→整场终态+退款

逐行链（现 tip 行号）：①图运行中任意异常（`statement_timeout` 15s principal.ts:947→SQLSTATE 57014/PG 主从切换/checkpoint putWrites 失败/瞬时网络）从 lifecycle 抛出 → ②`drainInterviewJobOnce` catch **:498** → ③`:502` `errCode(e)==='graph_fence_lost'` 是唯一 requeue 白名单——其余全部落入 **:508 `failClaimedInterviewJob`** → ④markJobFailed :229（job 即 `failed` 终态·**attempts 在此路径零参与**——:123 的 claim 预算只防租约过期重领·不防主动终态）+ ⑤`terminalizeUnsettledInterview` :233 reason `'job_failed'` → `failInterviewAndRelease` :150 **退额度** + `interview_unavailable`/`assessment_unavailable` 事件 :161/:163 → 整场终态。⑥零分类面=非 fence 异常一律按确定性处理·图侧零 retryPolicy（graph.ts :31-36）。**触发例**（issues-final :98 逐字语义）：putWrites 遇 statement_timeout 15s 或 PG 主从切换 1 秒→面试标 failed 并退额度——基础设施小抖动=C 端重开/B 端重考。

### 1.2 EG-A2+热循环推演：queued 零闸+requeue 无退避+sweep 永不触达 queued

结构缺口三件（现码亲读）：**①claim queued 臂零 attempts 闸零时闸**（:128 `queued` 无条件）·**②`requeueInterviewJob` :239-245 置 queued 不写退避不判上限**·**③sweep :270-276 只收 running+expired——queued 行收割永不触达**（EG-A2「queued 路径无 attempts 终态」EXPERT :48·LR-F5 :47 同构证）。现状触发面窄：catch 仅 fence loss 才 requeue（:502）·fence 丢失由租约交接界定=一次性交接。**照 issues-final :100 修法原文直接实现白名单 requeue（不加专家三件）的推演**：持续瞬时故障（如 PG 慢 5s 即超时）→瞬时→requeue（:503 形）→queued 零闸→下一拍 ≤5s（:569 intervalMs=5000）重领 attempts+1（:123）→再瞬时→requeue→… **5s 一拍无界热循环**（attempts 无界增长·永不终态——job 从不停在 running 故 sweep 永不触达·`enumerateOwnersWithJobs` :311-314 使 owner 恒被枚举恒被 drain·每次重跑整条 lifecycle 模型调用面=重试风暴联动 AG-01/EXPERT 二-3 重试预留放大）。EXPERT :17 原话「照文档原文实现=5s 一拍无界热循环」——**blocking 勘误的立论基础**。

### 1.3 next_attempt_at 现状：报告侧范本在用·面试侧无列（#4=新迁移面）

ai_report 有列（0001:231·report.ts :53 写/:85 读/:63 重置=全套范本）；interview_job 无列（0001 :253-268+sql/05 影子双面确认）——**#4=新迁移面 0175**（沿「历史迁移零字节改+新迁移」铁律·rev2 E1）。

### 1-修法三件（严格按 EXPERT-REVIEWS §二-2 :17·改造面=`interview-consumer.ts`+`interview-jobs.ts`+新迁移 0175 三面·零图触零账本触）

- **① 白名单分类（catch 面）**：catch :498 增 errCode 白名单判定——**白名单=裁决项①**（专家族+现码先例基底线：`graph_fence_lost`（既有 :502 保留）+PG 超时族（SQLSTATE `57014` query_canceled=statement_timeout 面）+PG 连接族（`08xxx` connection_failure/`57P01` admin shutdown 等 SQLSTATE 族）+node socket 层（`ECONNRESET`/`EPIPE`/`ETIMEDOUT`））→ requeue；**余一律维持 :508 failClaimedInterviewJob 确定性终态——现状语义零变零放宽**。分类通道=errCode（errors :30-33 结构 `.code`·PG SQLSTATE 原生过面·标签形沿 adaptive-lifecycle.ts:121 Object.assign code 惯例）。
- **② next_attempt_at 写入+时闸（#4 兑现）**：`requeueInterviewJob` 改造沿 report.ts:53 范本形——requeue 时写 `next_attempt_at=now()+least(power(2,attempts),300)` 秒（**2^n 封顶 300s·报告范本逐字形**·参数=裁决项③）；claim queued 谓词加时闸 `(next_attempt_at IS NULL OR next_attempt_at<=now())`（沿 report.ts:85 时闸形——**注意范本侧时闸在 sweep 重排点·面试侧 requeue 即时·时闸必须落 claim 谓词**）。
- **③ 超限终态（EG-A2 兑现）**：requeue 调用点（catch 白名单臂+既有 :264/:490/:503 诸 requeue 面）判 `attempts>=MAX_INTERVIEW_JOB_ATTEMPTS`（:15·取 `ClaimedInterviewJob.attempts` :104/:151 claim 自增后现值）→ `markJobFailed`+`terminalizeUnsettledInterview`——**新 reason=`retry_exhausted`** 入 :147 联合类型·事件分诊沿 :161/:163（dedupe 键 `interview_unavailable:retry_exhausted`/`assessment_unavailable:retry_exhausted`·终态+退款同拍事务沿 :225-239 既有形）；EG-A2 结构闸：**claim queued 谓词加 attempts 闸 或 reaper 加 queued 超限扫（专家二选一·裁决项④·推荐 claim 谓词——:128 单点=唯一领取通道·与时闸同落点复合·legacy 超限 queued 行兜底）**。上限值=裁决项②（联动 EXPERT 二-3 重试预留放大）。
- **④ 新迁移 0175**（rev2 E1 编号裁定）：`ALTER TABLE interview_job ADD COLUMN next_attempt_at timestamptz`（沿 0001:231 语义注释形）+可能的局部索引（沿 ix_ijob_claim/ix_report_claimable 既有族形·rev2 E5 全名补正·是否加=EXEC 定）；**历史迁移 0001-0169 零字节+sql/ 影子面零改（冻结自证 §0.1）**。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof（沿 interview.proof.ts :1-5 头注+ :95-104 ConsumerDeps 注入形·真隔离 PG 版本化迁移+MemorySaver+scriptedModelClient 假体·注入 errCode 两类错误沿 :121 Object.assign code 惯例）**：①**瞬时臂**（白名单 code 注入·如 57014/ECONNRESET）→断言 job 翻 `queued`+`next_attempt_at` 落值且随 attempts 单调（2^attempts 封顶 300s 形）+claim 时闸未到不领+到点重领 attempts 递增；②**确定性臂**（非白名单 code）→断言 markJobFailed 终态+reason `'job_failed'` 事件（**现状语义零变负臂**）；③**超限臂**（瞬时打到 attempts≥MAX）→断言终态 failed+`retry_exhausted` 事件+退款路径（failInterviewAndRelease）+僵尸兄弟守卫（:132 后续 job 不领）；④**EG-A2 负臂**（queued 且 attempts≥MAX 行连续多拍 claim 零领取——热循环断根）；⑤**退避单调性臂**（多拍 attempts 递增→next_attempt_at 间隔单调不减）。
2. **reaper:prove 回归原值**：28 臂全绿 EXIT=0（`pnpm reaper:prove`·run-e2e-isolated·apps/worker/package.json:19·blob `48c690c0`——reaper 语义面在两闸形下的回归基线）。
3. **typecheck**：turbo typecheck EXIT=0（worker+db+errors 触面包）。
4. **迁移纪律断言**：git diff 历史迁移 0001-0169 **零字节**+恰一新文件 0175+sql/ 影子零改；报告范本面 blob 零改（report.ts `d20d0baf`/report-worker.ts `76bc751a`/04_report.sql `68bad45b`/0001 `d68f8dd0`）——「只加面试侧·范本零触」兑现面。

## §3 范围外（边界清单·越界即 FAIL）

1. **后继/平行刀零触**：AG-01 准入（**刀 D 骑本刀骨架**——claim 谓词/requeue 调用点结构共用但准入语义零触）；AG-05+AG-26 invoke(null) 续跑（**刀 A 域**·aga 树在途·本刀零触 `adaptive-lifecycle.ts`——:121 throw 点零改只消费 code）；AG-06 model-client 分类（**刀 B 域**·:734/:877 HTTP 层零触）；AG-03+EG-A1（刀 E）/AG-02 残面（刀 F）/AG-07 成本轨/账本迁移全零触。
2. **报告队列本身零改**：report.ts/report-worker.ts/04_report.sql/0001 ai_report 段零字节（范本只读引用·§2-④ 断言面）。
3. **LangGraph retryPolicy 配置面**（issues-final :100 后半「纯计算节点可以配 retryPolicy」）=图包独立小刀·本刀零图触。
4. **quiz 队列同构缺口**（quiz-jobs.ts :44）零触只登记（§0.1 锚）——后继刀面。
5. **退避/上限参数值=裁决项非范围**（§8）；API/前端/e2e 产品面零触；共享 SSOT（LEDGER/checklist/issues-master/ai-capability-review 四件+INDEX）只读引用零改（AG-RESUME 行翻面权归协调方）。
6. est live=0（§6）。

## §4 依赖

**①刀 B（AG-06）定序在前**（EXPERT :61「先于一切重试刀（否则重试风暴搅浑验证窗口）」——执行序软约束非代码依赖：本刀分类面在 consumer 层与 model-client 层零文件交叠·可并行起草·EXEC 排期遵定序）；**②#4 列=本刀新迁移面自足**（0175·实测 interview_job 无列 §0.2-4·不依赖他刀不依赖既有列）；**③无迁移编号交点**（最新 0169 实测·新号 **0175**——rev2 E1 编号裁定：billing 0170-0173 已公布自用·刀 B 预定 0174·登记见 §0.1——重号 0143×2+0152×2+0160×2+空号 0164 历史不改·rev2 E4 补全）；**④无同文件并发登记**（建前 11 树实测·interview-consumer.ts/interview-jobs.ts 零他刀登记·aga 树登记面=adaptive-lifecycle.ts 零交叠）；⑤既有 proof 基线现成（reaper 28 臂可复跑）。**下游**：刀 D AG-01 骑本刀 claim/requeue 骨架·EG-A2 闸=刀 D refusal 释放面的前置结构。

## §5 Ban 列表 + pins（沿 ag-a/authz-harden/ci-wiring/ttl-wire 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·AG-RESUME 行翻面权归协调方）；Ban 触其他工作树；Ban 伪造来源；**本刀增补**：**Ban 放宽确定性终态语义**（非白名单一律 :508 终态·现状零变——本刀只把瞬时族从终态中分出）；**Ban 白名单只增不清**（裁决①落定后后续刀只能加不能减——防确定性错误混入重试面造热循环复辟）；Ban 改报告队列范本面（report.ts/report-worker.ts/04_report.sql/0001 ai_report 段零字节·§2-④ 断言）；Ban 历史迁移零字节改（0001-0169·只加 0175 新迁移·rev2 E1 编号裁定）+Ban 影子 sql/ 面改（冻结自证）；Ban 触账本面（model-client.ts/invoke.ts/0085/0088/0120/0130 一切 ai_model_invocation 触面零字节·刀 B-F 领地）；Ban 触 `adaptive-lifecycle.ts`（刀 A 域·:121 只读消费零改）；Ban 触图包 `packages/ai-graphs/**`（retryPolicy=独立小刀）；Ban 触 quiz 队列（同构面后继登记）；Ban 新 env 闸/新定时器/退避参数散落硬编码（集中常量沿 :15 单一真相先例）；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全 MemorySaver+scriptedModelClient 假体/隔离库·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=MemorySaver+scriptedModelClient 脚本假体（沿 interview.proof.ts 既有形）+真实 PG 隔离库（run-e2e-isolated 完整版本化迁移面·需 db:up）；迁移=本地隔离库；typecheck=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-c-requeue-REQUEST.md`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts/05-markers 形留执行席收据）。五类标记词不复抄卷内（避免自匹配·沿 ag-a/authz-harden/ci-wiring/ttl-wire 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（EXPERT-REVIEWS §七 刀 C 计划与 LANDING-INDEX :32 AG-RESUME 行系登记出处·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。**停止条件**：专家三件与现码冲突即停上报——亲读核对**零冲突**（§0.2 七条漂移全登记性·其中 #4 列预设与实测不符处已按实测改述为新迁移面 §0.2-4·非冲突·专家③本就定新面）。

**待双审/EXEC 裁决项**：①**白名单清单**（推荐=四族全集：`graph_fence_lost`+`57014`+PG 连接族 `08xxx/57xxx` SQLSTATE+node socket `ECONNRESET/EPIPE/ETIMEDOUT` vs 最小三件 `graph_fence_lost`+`57014`+`ECONNRESET` 并陈——清单本身即本刀最大语义面·落定后受 §5「只增不清」约束）；②**上限值**（推荐=维持 `MAX_INTERVIEW_JOB_ATTEMPTS=5` 现值单一真相 :15·与重试预留放大（EXPERT 二-3×AG-11 预算联动）复核后维持 vs 降 3 沿报告侧 report.ts:10 并陈）；③**退避参数**（推荐=报告范本逐字 `2^attempts` 秒封顶 300s 零新参数面 report.ts:53 vs 独立面试侧常量并陈）；④**EG-A2 闸落点**（专家明示二选一·推荐=claim queued 谓词复合闸（attempts+next_attempt_at 同落点 :128 单点=唯一领取通道·legacy 超限 queued 行兜底）vs reaper 加 queued 超限扫（:266 sweep 面扩展·reaper:prove 臂扩展面））。

**裁决④选项①后果如实披露（rev2 E2·上推荐语「legacy 超限 queued 行兜底」措辞据此修正理解）**：选项①（claim 谓词单选形）下，存量 queued 且 attempts≥MAX 行被闸**永久挡领且无终态化路径**——sweep 只收 running+expired（:270-276·永不触达 queued）·修法③调用点判限仅在 claimed catch 面触发（滞留 queued 行不入 claim 即永不触）·`enumerateOwnersWithJobs` :311-314 恒枚举恒空查=5s 拍 churn——**「挡领遏制」≠「兜底」**；选项②（reaper queued 扫）才是终态化面。**负臂覆盖注**：断言②-④（=§2-① proof 臂④·EG-A2 负臂）需补滞留行终态断言（若裁选项②）或滞留行存在性披露（若裁选项①）。

---

*AG-C-REQUEUE REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`b95c9c4b`（git log -1 实测）· 分支 `line/ag-c-requeue` · 工作树 `meetwise-agc`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项出处三层蓝本=issues-final AG-04 :16/:92-101（LG-04/LR-F3·#4）+EXPERT-REVIEWS §二-2 :17（修法权威 blocking·三件同刀）+§六 :48（EG-A2）+§七 :61/:62（刀 B 定序+刀 C 计划）+§五 :39-41（刀 A 域·不含）+review-log LG-04 :23/LR-F3 :45/LR-F5 :47+LANDING-INDEX :32（AG-RESUME 行·不自建 SSOT 行）· 防重双对表过（harness 无同名卷·4 命中全系 RAG-04 子串巧合登记性）· 红事实=AG-04 链（catch :498→:502 唯 fence requeue→:508 failClaimed→markJobFailed :229+terminalize :233+退款 :150）+EG-A2 三缺口（claim queued 零闸 :128·requeue 无退避无上限 :239-245·sweep 永不触达 queued :270-276）+热循环推演（5s 拍 :569·照原文实现=无界热循环）+next_attempt_at 双面现状（ai_report 0001:231 范本在用·interview_job 无列=#4 新迁移面 0175）· 修法=专家三件+新迁移（①白名单分类+②范本形退避写入+claim 时闸+③requeue 调用点 attempts≥MAX→retry_exhausted 终态入 :147 联合+EG-A2 闸二选一+④新迁移 0175 历史零字节）· 断言候选四条（新 proof 五臂/reaper 28 臂回归/typecheck/迁移纪律+范本 blob 零改）· est live=0 · pins 十一值照抄 · markers=0（亲跑）· ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

*rev2 · 2026-10-11 · erratum 处置席署名（协调方裁定席2 E1-E5 处置·双审 BOTH PASS 结论零变·本 rev=编号与披露面·docs-only 零码动·恰 1 .md·⛔push）·席2 erratum 全去向——**E1** 迁移号全卷 0170→0175（§0.1 目录锚/§0.2-4/§1.3/§1 修法头/§1-修法④/§2-4/§4-②③/§5 Ban/尾注·rg 复核零残留）：billing 战役 LANDING-INDEX :43 已公布 0170-0173 自用（时间线 billing 定谳 18:14:05→本卷落卷 18:14:26·21 秒竞速·非起草席过错）·刀 B EXEC 预定 0174·**协调方裁定编号分配：billing 0170-0173/刀B 0174/刀C 0175**；**E2** §8 裁决④补选项①后果如实披露段（claim 谓词单选形下存量 queued 且 attempts≥MAX 行永久挡领无终态化路径·「挡领遏制」≠「兜底」·选项② reaper queued 扫才是终态化面·负臂覆盖注随附）；**E3** §0.1「72 文件」→171 个 .sql（ls 亲数·0001-0169 共 169 号−空号 0164+重号三组=171）；**E4** 重号登记补全 0143×2+0152×2+0160×2（0164 空号维持·§0.1+§4-③ 两处）；**E5** 索引锚 ix_report_claimable :239（rev1 记 :247 实为 POLICY `WITH CHECK` 行·全名补正）+ix_ijob_claim :269→:268（§0.1）+§1-修法④ 族形引用全名一致化。§8-③ 冻结条款维持·STOP `draft:awaiting_pre_exec_dual` 维持·markers=0·pins 十一值零翻·Ban self-approve·alone≠dual·Dual PASS ≠ 开工。*

---

## §9 EXEC 附记（2026-10-12·append-only·§0-§8 原文零改·施工+随翻席署名）

**并线重 pin**：`git merge --no-ff feat/mysql-schema-skeleton` → **5be1d213**（主线 @`2bc4e2bd`·b95c9c4b..2bc4e2bd 恰 12 笔 docs+hotfix：ruling a62e8fa3/4fabecc3/133acba6+verify 4fabecc3+landing 9ce11313/9a938854+audit 46439f3b+cost1 链 31df8aa1→…→6f2ed876/bccbd139+I6 hotfix 2629509d+刀位图 2bc4e2bd）·**零冲突**（本支恰 1 .md）·协调方言 a62e8fa3+ 亲证为其祖先。

**§0 重锚勘误（EXEC 亲测·结论零变）**：blob 十八锚 **16 零翻**（consumer `885b5993`/interview-jobs `775a9336`/report 范本 `d20d0baf`/report-worker `76bc751a`/0001 `d68f8dd0`/sql 04 `68bad45b`+05 `f68e2641`/errors 双件 `d505f0d0`+`d4621afb`/adaptive-lifecycle `5cfce9be`/graph `0c0a0dd2`/principal `c31cbac0`/reaper.proof `48c690c0`/interview.proof `645ec783`/quiz-jobs `a56a0da4`/根 package.json `616cf12b` 全同）·**2 笔登记性漂移**：`model-client.ts` 27eb7516→`cd924936`（AG-COST1 观测面落主线·刀 B 域·本刀零触）+`apps/worker/package.json` 107d3d2d→`590734b7`（同批·本刀仅 additive 注册一行）。**行锚全零漂**：consumer 571 行/interview-jobs 314 行/report 94 行逐位亲读吻合（catch :498-509/:502/:503/:508、claim :112-153/:123/:128、sweep :266-279、requeue :239-245、MAX :15、report :53/:85 全在位）。迁移目录 171 个 .sql 最新 0169 维持（billing 仅公布号段未落文件·**0175 占用如裁定**）。

**§8 四裁决行使（EXEC·均标注可调）**：
- **①白名单=按卷推荐四族全集**：`graph_fence_lost`（既有 :502 保留）+PG 超时 `57014`+PG 连接族（SQLSTATE 类 08 前缀·08P01/08S01 等+`57P01/57P02/57P03`）+node socket `ECONNRESET/EPIPE/ETIMEDOUT`——落 `TRANSIENT_INTERVIEW_JOB_ERROR_CODES`（consumer 导出常量·`isTransientInterviewJobError` 纯函数 prove 直行使·受 §5「只增不清」约束）。
- **②上限=按卷推荐维持 `MAX_INTERVIEW_JOB_ATTEMPTS=5`**（:15 单一真相零动·与重试预留放大联动复核留后继）。
- **③退避=按卷推荐报告范本逐字形**：`now()+make_interval(secs=>least(power(2,attempts)::int,$cap))`（report.ts:53 同款语义·attempts 取 UPDATE 前现值=claim 自增后现值）·封顶常量 `INTERVIEW_RETRY_BACKOFF_CAP_SECONDS=300`（interview-jobs.ts :15 邻位单一真相·Ban 散落硬编码履约）。
- **④闸落点=行使②形：reaper queued 超限扫**（协调方按卷推荐②形指令·E2 披露后唯一终态化面·沿 sweep 同构第三臂 `status='queued' AND attempts>=MAX → failed+RETURNING interview_id`→reapStuckInterviewJobs 终态化 reason=`retry_exhausted`+退款·同面试 worker_died 双命中以先到为准）——**非 §8 原推荐①形**（原推荐语「legacy 兜底」已被 E2 证伪）；claim queued 臂只落修法②时闸 `(next_attempt_at IS NULL OR next_attempt_at<=now())`（report.ts:85 形·NULL=立即可领存量零变），**attempts 闸不入 claim（专家二选一履约）**；修法③调用点上限闸罩全部三 requeue 面（:264/:490/catch 白名单臂）。

**落点（码面恰 7 文件·5 改 2 新·加本卷随翻=改动集共 8 文件 401+/17−）**：`packages/db/migrations/0175_interview_job_next_attempt_at.sql`（新·expand-only IF NOT EXISTS·**索引 EXEC 定夺=不加**：claim 走 ix_ijob_claim 前缀+queued/owner 行数少+报告范本亦无该列索引·预防性索引归后继刀）∥`packages/db/src/interview/interview-jobs.ts`（退避常量+claim 时闸+requeue 退避写入+sweep 第三臂·返回面 additive retryExhaustedInterviews）∥`apps/worker/src/interview-consumer.ts`（白名单常量+纯函数+requeueOrTerminalizeExhausted 上限闸罩三调用点+catch 分类+reaper retry_exhausted 臂·reason 联合 +`retry_exhausted`·reapStuckInterviewJobs 返回 {requeued,failed} 形零变）∥`apps/worker/test/requeue-backoff.proof.ts`（新·33 臂）∥root/worker package.json+`scripts/run-e2e-isolated.mjs` 四注册点（watch/命令/白名单/migrate 名单·沿 interview:prove 同形 additive）。

**断言门 EXIT 全表（终态代码亲跑）**：①`requeue-backoff:prove` **33/33 PASS EXIT=0**（五臂=瞬时 requeue 面/确定性零变负臂/时闸+到点重领/超限+退避单调 [2,4,8,16]+封顶 300/EG-A2 滞留行终态化+tick 拍序+幂等·隔离库版本化迁移 172 applied）·②`reaper:prove` **28/28 PASS EXIT=0**（原值）·③`reaper-purge-wire` **14/14 PASS EXIT=0**（相邻回归·TTL-WIRE 置位锚零触绿）·④turbo typecheck **3/3 EXIT=0**+worker tsc 46=既存基线（I6 记 47→46·触面三文件零新错）·⑤`drift:prove` **EXIT=0**（迁移独有方向=非漂移门自述·实跑亲证）·⑥迁移纪律：git diff 0001-0169+sql/ 影子+报告范本面**零字节**·恰一新迁移 0175+`check-migration-version-uniqueness` 172 files violations=0·范本四 blob 亲证零翻·⑦`docs:check` EXIT=0（80 文件+2002 扫描）·⑧markers **EXIT=1**（改动集新增行五类标记词零命中·配方沿 i3 卷 markers-scan 形制·词族不复抄卷内避免自匹配）。

**errata 三条（如实登记·不阻门）**：**X1** requeue-backoff 首跑 29/30 一红——prove 侧断言 conflated 时闸与终态化面（cap 行 attempts=20≥MAX 落 queued 被同拍超限扫正当收割·sweep 记 retry_exhausted:2——时闸只闸领取不豁免终态化=产品行为正确）·修 prove 侧 fixture/断言+增 GID 未超限行臂·**产品码零改**·次跑 33/33（沿 i3 夹具句柄先例如实登记非洗）·**X2** reapStuckInterviewJobs 返回面曾 additive `exhausted` 字段——撤回（TTL-WIRE purge-wire 静态置位锚逐字兼容·幂等断言改由事件数+余额双证）·相邻刀 proof 零触·**X3** 白名单注释 SQLSTATE 类 08 族记法（三连 x 记号）撞标记词扫描假阳性一次——改写「类 08 前缀·08P01/08S01 等」·语义零变。

**收尾声明**：est live=0（全 proof MemorySaver+scriptedModelClient 假体/隔离库即用即灭·零模型外呼零 secrets 零消耗·pins 脚注同源）·pins 十一值照抄零翻转·SSOT/账本/报告范本/adaptive-lifecycle/图包/quiz 队列零触（改动集 7 文件亲证）·§1 修法清单与 §5 Ban/pins 零改（§8-③ 履约）·⛔push（全程零 push）·post-prove 双审两外席待席·alone≠dual。
