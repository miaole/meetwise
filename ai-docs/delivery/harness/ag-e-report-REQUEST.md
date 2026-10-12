# AG-E — 失败语义轨刀 E：AG-03 报告重试真实化（`:a{n}` 键+revision 同换+上限 3）+ EG-A1 单调派发序号（blocking 勘误吸收）+ AG-10 守卫同批（eligible=0 不入 doomed report）· EXEC REQUEST

**Status**: `draft:awaiting_pre_exec_dual`（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：meetwise 战役刀 E 起草席（AG-03+EG-A1+AG-10 守卫同批 · EXPERT-REVIEWS §七 失败语义轨 A 席六刀之 **第五刀**·「AG-03+EG-A1（报告单调派发序号+:a{n} 键/revision+手动重试 proof）」·叠加 §七 跨轨硬约束「AG-10 守卫**必须与刀 E 的重试开关同批或先行**」——本卷三事同刀）。
**基线**：`feat/mysql-schema-skeleton` @ `2bc4e2bd`（开工建树时点主线 tip·`git log -1` 实测 2026-10-11·AG+计费战役刀位图立节笔）。分支 `line/ag-e-report` · 工作树 `meetwise-age`（`git worktree add ../meetwise-age -b line/ag-e-report` 仓根同级·本起草席已立·建前亲证：`git worktree list` 19 树无 age·`git branch --list "line/ag-e-report"` 零命中）。
**防重双对表（亲证）**：`ls ai-docs/delivery/harness/ | grep -c "ag-e-report"` → **0**（186 卷无同名刀卷）；`rg -n "ag-e-report" ai-docs/delivery/harness/` → **零命中**。刀 A-F 六支线名零撞（`ag-a-resume`/`ag-b-classify`/`ag-c-requeue`/`ag-d-admission`/`ag-f-reroll` 在册·`ag-e-report` 空）。→ **停止条件未触发·可建树落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-03 详情 **:81-88** + 总览 **:15**；AG-10 详情 **:158-166** + 总览 **:22**（同批守卫的对象条）②同目录 `EXPERT-REVIEWS.md` **§七 :64 刀 E 行**（修法权威：单调派发序号+:a{n} 键/revision+手动重试 proof）+ **§二-1 :15-16 EG-A1（blocking 勘误·本刀吸收为红事实 B/修法①③）** + **§二-3 :18 重试预留放大（刀 E 约束：上限必须设且与 AG-11 预留改革联动）** + **§七 :71 跨轨硬约束（AG-10 守卫同批或先行·否则 doomed report 从烧一次变每次真烧）** + §一 **:11**（AG-10 borderline P1·仅 C 端 unbound 受害）+ §六 **:47**（EG-A1 P2 编排）③同目录 `review-log.md` **LR-F8 :50/:124（P2→P1 上调**·理由原文「报告"失败自动重试/手动重试"是产品明确承诺，现实现完全不生效」）+ **PF-F-12 :65**（AG-10 源编号）④形制沿 `ag-cost1-bleed-observe-REQUEST.md`（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `2bc4e2bd`·file:line 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚表（@`2bc4e2bd`·`git hash-object` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `apps/worker/src/main.ts` | `8ed81327e02d` | **报告键固定点**：:175 `reportGenerator(pool, s.owner!, `${s.interviewId}:report`, model, s.interviewId)(s)`——幂等键**不含 attempt**·全 attempts 同键；:176-186 loadSummary（listScorableScoreCards→scores 空集直通·报告侧 aggregateScores 拒）；:161-172 `e2e_report_fault_invocations` 既有故障注入缝（island E2E·生产拒启） |
| 2 | `apps/worker/src/interview-service.ts` | `bee3c139648d` | **键=revision 同源面+内容校验链**：:335 `reportGenerator(pool, owner, idempotencyKey, model, progressStream?)`；:340 `operation: { id: 'report.narrative.v1', businessRevision: idempotencyKey }`（**revision 与键同一字符串——换键即同换·零额外接线**）；:341-343 `businessValidate` 内 `validateReportContent` 失败→返回码→账本记 failed；:306-310 存档注释：键作 registry businessRevision 派发须满足 `/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/` 否则 `model_operation_revision_invalid` fail-closed |
| 3 | `packages/db/src/report/report.ts` | `d20d0baf837c` | **报告 job 层全套范本（#229 遗产·本刀只换键源不动骨架）**：:10 `MAX_REPORT_ATTEMPTS = 3`；:13-20 enqueueReport（`(owner,interview_id)` 唯一行）；:24-38 claimReport（CAS→running+租约+**attempts++**·租约过期 running 须 attempts<max）；:50-57 markReportFailed（2^attempts 退避封顶 300s）；**:59-66 `requeueFailedReport`（:63 `attempts=0, next_attempt_at=NULL`——#229 D2 已决「全新自动重试预算」·注释 :60 明言「频控在 API 服务层(防成本 DoS)」）**；:74-88 sweepReports（failed<max 重排·≥max 或过期 running→quarantined 终态） |
| 4 | `apps/worker/src/report-worker.ts` | `76bc751ab6ec` | **drain 三事务骨架**：:140-171 `drainReportsOnce`（tx1 :144 claimReport commit→事务外 :156-157 `deps.loadSummary`+`buildReportGraph({generate}).invoke`→失败 :161 markReportFailed→tx2 :165-169 markReportReady CAS(:166)+report_ready 事件(:168)）；`ReportWorkerDeps.generate` 即 main.ts 注入的键闭包——**claim 返回的 attempts 今只进 job 状态机·到不了键** |
| 5 | `apps/worker/src/adaptive-lifecycle.ts` | `5cfce9be32c8` | **收尾区+AG-10 分支**：:443-457 证据计数 SQL（`answer_unscored` 计 unscored·`answer_evaluated` 五字段完整性+outcome≠unresolved+score∈[0,100] 计 eligible）；:458-461 missing→throw `interview_score_evidence_missing`；**:462-465 `unscored===0 && eligible>0` → completeInterviewAndConfirm+enqueueReport**；**:465-479 `unscored===0`（eligible=0）→ :469 completeInterviewAndConfirm（全额确认）→ :470 markApplicationNoEligibleScore → :475-476 `mark==='unbound'`（C 端）→ enqueueReport（doomed）**·bound→assessment_unavailable 事件；:480-488 unscored>0 → failInterviewAndRelease（退款臂·非本刀面） |
| 6 | `packages/db/src/commerce/commerce.ts` | `f5d256df4643` | **结算维度（「不重复扣费」的真锚）**：:251-280 `completeInterviewAndConfirm`（confirmConsumption(…,1)+CAS completed 同事务·幂等重放 `already_completed`）；:286+ `failInterviewAndRelease`（补偿释放）——**报告重试链零触此文件**（report-retry.proof P3 静态锚钉在证） |
| 7 | `packages/ai-runtime/src/invoke.ts` | `647e0aa952f0` | **claim 终态重放相位**：:612-625 `invokeClaimPhase` 循环——:623 execute / **:624 cached（terminal·回放值） / :625 `failed‖unknown`（terminal·`deterministic_refusal`** 不发请求）——同键同 digest 下 failed/unknown 恒终态 |
| 8 | `packages/db/migrations/0130_model_invocation_same_key_claim_join.sql` | `239a0b19aea4` | 终态重放 SQL：:163-164 digest mismatch→failed（`idempotency_key_payload_mismatch`）；**:179-180 `status='failed'`→原样重放 failed**；:183-184 `status='unknown'`→重放 unknown |
| 9 | `apps/api/src/modules/interview/interview-report.ts` | `77a35057c446` | **手动重试入口**：:35-44 `retryReportById`（failed/quarantined→requeueFailedReport :40）——**频控已全链生效**（rev2 勘误·原「全链无频控」系假红事实已撤回）：service `retryReport` 入口 :741-746 `:743 rl.allow`（常量 :36 `REPORT_RETRY_RL`={capacity:3,refillPerSec:3/3600}=3/时/份）超限 :744 429 `report_retry_limited`→:745 转发·本文件 :40 即 `requeueFailedReport` 生产调用面唯一（RL 闸后零旁路）+真令牌桶（platform/rate-limit.service.ts:12-19）+双 proof 在册（红事实 B 附带登记） |
| 10 | `packages/ai-graphs/src/report.ts` | `ae994ab2fd04` | `GenerateReport = (s: InterviewSummary) => …`（:26）——**签名无 attempt 位**（修法①接线缝）·`buildReportGraph({ generate })`（:69） |
| 11 | `packages/domain/src/assessment.ts` | `bb5a4546c689` | :29-35 `aggregateScores`——**:30 空集抛 `score_aggregate_empty`**（AG-10 doomed 的确定性机制：eligible=0→scores=[]→generate 在 invoke **之前**必死·重试同样死） |
| 12 | `packages/db/migrations/0001_baseline.sql` | `d68f8dd0e616` | `ai_report` 表（:224-238）：`attempts int NOT NULL DEFAULT 0`（:230）+`next_attempt_at`（:231）+`uq_report_interview`（:237 一场一份）——**无派发序号列**（修法①裁决项 (a) 的落点） |

### 0.2 漂移登记（蓝本/复核快照锚 → 现树 `2bc4e2bd` 重 pin·全亲读）

| 蓝本锚 | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| issues-final AG-03：`main.ts:173`（report key） | **`:175`** generateLiveReport 键面（:172-175 含 faultInvocations 闭包后移） | +2 行漂·键串原样 `` `${interviewId}:report` ``·结论不变 |
| issues-final AG-03：`invoke.ts:601-623`（claim 终态） | **`:612-625`**（:624 cached / :625 failed‖unknown 皆 terminal） | 区间微漂·三臂语义原样 |
| issues-final AG-03：`interview-service.ts:291-311`（validateReportContent 在 businessValidate 内） | **`:335-344`**（reportGenerator 定义区·:341-343 校验 catch→返回码） | +44 行漂（diagnosis 区插入所致）·校验链原样 |
| EXPERT-REVIEWS §二-1：`report.ts:59-63` **`requeueReportForManualRetry`** 重置 attempts=0 | **`:59-66` 函数名现树为 `requeueFailedReport`**（db 层与 api 层两调用面同名·:63 `attempts=0` 原样） | **函数名漂移**（专家卷记名与现树不一致·语义逐字吻合·本卷以现树名为准） |
| issues-final AG-10：`adaptive-lifecycle.ts:359-372`（eligible=0→confirm+enqueue） | **`:465-479`**（计数 SQL :443-457·三分支 :462-488·unbound enqueue :475-476） | 大幅下移（B 端 markApplicationNoEligibleScore 分支细化插入）·**红事实原样且更精确：仅 `mark==='unbound'` 臂 enqueue** |
| 任务书锚：`adaptive-lifecycle.ts:442-488`（收尾区） | **`:440-492`** 亲证含任务书区间（:489 asPrincipal 收口+:490-492 recordAskedQuestions） | 吻合 |
| issues-final AG-10：`main.ts:175-180` | **`:175-186`**（:176-183 loadSummary scores 空→items 空直通 report 图） | 微漂·空集直通原样（doomed 前半在 domain 侧 :30 才爆） |
| 0130 `:163-164`（digest mismatch）`/:179-180`（failed 重放） | **亲证原值**（:163-164/:179-180·另 :183-184 unknown 重放） | 不变 |

### 0.3 现势并发登记（强制）

1. **六刀在飞**（`git worktree list`+`git log -1` 各支实测 2026-10-11）：刀 A `line/ag-a-resume`@`1df39e6e`（有施工）·**刀 B `line/ag-b-classify`@`2a2fee56`（EXEC 施工毕·含迁移 0174·待 post-prove 双审·未落主线）**·刀 C `line/ag-c-requeue`@`5be1d213`（BOTH PASS 待 EXEC·现仅 .md）·刀 D `line/ag-d-admission`@`2bc4e2bd`（队列·零施工）·刀 F `line/ag-f-reroll`@`2bc4e2bd`（队列·零施工）。主线 tip `2bc4e2bd` 自 AG-COST1 收官（`6f2ed876`）后为纯 docs+hotfix 链。
2. **本刀触面 × 邻刀交点**：本刀动 `report.ts`（键源+requeue 不复位）/`report-worker.ts`（claim→generate 序号穿透）/`main.ts:175`（键构造）/`interview-service.ts:335-344`（签名加 attempt 位）/`adaptive-lifecycle.ts:465-479`（守卫臂）+新迁移一列——**与刀 B（model-client/invoke 管道+0174）同链不同区**（B 的四态分类是本刀前置·§4）；**与刀 C（interview-jobs requeue 闸+next_attempt_at）零文件交集但共享「上限+退避+终态」形制**（report.ts 即 C 的范本·C 动 interview 侧不动 report 侧）；刀 D 动 invoke 准入（0130:203-215 expired-claimed 面本刀零触）。先落者为准后到者照 §0 重 pin。
3. **迁移号位**：主线最新 `0169`；刀 B 已占 `0174`（避撞刀 C/计费轨 `0170-0173`）。本刀若取裁决项①(a) 需一列迁移——**EXEC 立项时按当时迁移台账实占认领号**（候选 `0175` 起·claim 前 `ls packages/db/migrations/` 复核·绝不硬编码本卷号）。

## §1 红事实 + 修法

### 红事实 A（AG-03 重试空转链·现 pin 全亲证·LR-F8 P2→P1 上调理由在案）

| 面 | 锚（@`2bc4e2bd` 实测） | 事实 |
|---|---|---|
| 键固定不含 attempt | `main.ts:175` `` `${s.interviewId}:report` `` + `interview-service.ts:340` `businessRevision: idempotencyKey` | 一场面试全部 attempts（自动 sweep 重排+手动 requeue）共用**同一幂等键=同一 revision=同一 request digest** |
| 终态重放吞掉重试 | `invoke.ts:624-625`（cached/failed/unknown 皆 terminal）+ `0130:179-184`（failed/unknown 原样重放） | 首次失败落账后，后续每次派发 claim 直接返回 failed/unknown·**不发请求**（`deterministic_refusal`） |
| job 层重试机器空转 | `report.ts:24-38`（claimReport attempts++）+ `:74-88`（sweep failed<max 重排·≥max→quarantined）+ `report-worker.ts:140-171`（三事务 drain） | 自动重试把同一失败重放到隔离（quarantined 死路=#229 描述面）·**机器全在·键层冻结=承诺不兑现** |
| 手动重试同空转 | `interview-report.ts:35-44`（retryReportById→requeueFailedReport） | 用户点「重试」→ job 回 queued → claim → 同键同 digest → 原样重放失败 → 再 quarantined |
| 内容校验失败也进死账 | `interview-service.ts:341-343`（validateReportContent 失败→businessValidate 返回码→账本 failed） | 触发例（issues-original）：首报「段落重复」被拒→failed→重试永不发请求。unknown（超时）同样冻结 |

**用户影响**（issues-final :86+review-log LR-F8 :50 上调理由）：产品承诺的「失败自动重试、可手动重试」实际完全不生效——一次失败=报告永远出不来（仅不重复扣费：结算在 interview 维度·见红事实 D）。

### 红事实 B（EG-A1 重置击穿·EXPERT-REVIEWS §二-1 blocking 勘误·本刀红线）

`report.ts:59-66 requeueFailedReport`（专家卷原名 `requeueReportForManualRetry`·现树名漂移见 §0.2）`:63` 把 `attempts` 重置 0——**#229 D2 已决语义：每次手动重试给一轮全新自动重试预算**（`report-retry.proof` P2 明断言此重置·job 层正确）。**推演击穿**：若刀 E 的 `:report:a${n}` 键取 n 自该列——手动重试后 claimReport 再自增 → n 回到 1 → 键 `:a1` 与上一轮 attempt-1 **同键同 digest** → `0130:179-180` 原样重放旧 failed → **AG-03 换形式原样复现**（且烧掉一次「真重试」假象下的零派发）。→ **attempt 源必须与 job 层预算列解耦·取单调独立派发序号**（修法①）·manual retry 只重置 job 层预算（修法③）。
**附带登记（rev2 勘误·席1 blocking B1·假红事实撤回改登）**：`report.ts:60` 注释宣称「频控在 API 服务层(防成本 DoS)」——**为真·频控已全链生效**：`interview.service.ts:36 REPORT_RETRY_RL={capacity:3,refillPerSec:3/3600}`（**3 次/小时/份**）+ `:741-746 retryReport` 入口 `:743 rl.allow` 超限 `:744 429 report_retry_limited` + 真令牌桶（`platform/rate-limit.service.ts:12-19`）+ `requeueFailedReport` 生产调用面唯一（`interview-report.ts:40`←service `:745` RL 闸后零旁路）+ 双 proof 在册（`report-retry.proof:238-239` 静态锚 + `report-retry-http.proof:228-238` H4 第 4 次 429 实跑）——rev1「全链零频控实现」系**假红事实·如实撤回**。**改登：频控已实现（3/时/份）·开放面=S12 阈值待用户追认（常量可调·proof :238 自陈）+单实例内存桶多实例 Redis seam（service 头注自陈）**——重试真实化后手动重试=真烧模型预算的面仍在，本刀**不补频控**（§3-5：S12 阈值追认/多实例 Redis 归计费战役）。

### 红事实 C（AG-10 doomed report·跨轨硬约束同批对象）

| 面 | 锚（@`2bc4e2bd` 实测） | 事实 |
|---|---|---|
| C 端全额确认+doomed 入队 | `adaptive-lifecycle.ts:469` completeInterviewAndConfirm（全额确认 1 额度）→ `:475-476` `mark==='unbound'` → enqueueReport | C 端（无 application 投影）全跳过/unresolved 场：**钱确认了·报告必死** |
| 必死机制在模型之前 | `main.ts:176-186` scores 空集直通 → `domain/assessment.ts:30` `aggregateScores([])` 抛 `score_aggregate_empty` | generate 在 invoke **之前**确定性抛错 → markReportFailed → sweep 重排 → 同样死 → quarantined。「重试」按钮=无效承诺（issues-final :164） |
| B 端不受害 | `:470/:477-478` bound→markApplicationNoEligibleScore 可重试终态+assessment_unavailable 事件 | 专家裁定（§一 :11）维持 P2 borderline P1：**仅 C 端 unbound 受害** |
| 同批硬约束 | EXPERT-REVIEWS **:71**：「AG-10 守卫（eligible=0 不入 doomed report）**必须与刀 E 的重试开关同批或先行**——否则 doomed report 从烧一次变每次真烧」 | 现状偶然被键层冻结兜住成本；重试真实化撤掉这层偶然防线后，任何结构性 doomed 报告=每预算轮真烧 3 次。守卫从源头删除 doomed 类·**本刀同批·非可选** |

### 红事实 D（结算维度·「不重复扣费」的真锚·零触面）

`commerce.ts:251-280`：扣费唯一收口=completeInterviewAndConfirm（confirm 1 额度+CAS completed 同事务·幂等）。报告链（enqueue/claim/generate/重试）**全程零触 reserve/confirm/release**——`report-retry.proof` P3 静态锚钉在证（重试链路四文件非测试调用=0）。→ 换键重试**不引入任何用户面重复扣费**；模型调用成本走预算/预留机制（刀 B 落地后确定性失败按真实 usage 结算）·与用户额度两本账。

### §1-修法（EXPERT-REVIEWS §七 :64 刀 E 行原文为修法权威+§二-1 :15-16 勘误+§二-3 :18 约束+§七 :71 同批硬约束）

**① 单调派发序号（attempt 源·裁决项①）**：attempt 源与 `ai_report.attempts` 解耦·取**单调独立派发序号**·两形呈报：
- **(a) 新列（推荐）**：`ai_report` 增 `dispatch_seq int NOT NULL DEFAULT 0`（迁移一列·§0.3-3 号位）——claimReport 的 CAS UPDATE 同排 `dispatch_seq = dispatch_seq + 1`（与 attempts++ 同语句同租约语义·SKIP LOCKED 下天然无并发双发）·claim 返回值携出 → `ReportWorkerDeps.generate` 穿透（`GenerateReport` 签名 `:26` 增 attempt 位或 `InterviewSummary` 增非模型字段·EXEC 定）→ main.ts 键构造消费。requeueFailedReport **不触此列**。
- **(b) 派发探 max 后缀**：零迁移——派发前 `SELECT max` 探 `ai_model_invocation` 中 `interviewId:report:a{n}` 现存最大 n 取 n+1。缺点：每次派发多一次账本 LIKE 扫描·单调性寄生于账本行存在性（清理/归档策略变化即断源）·claim 与探针两段非原子。呈报裁量·**(a) 为推荐**（单点单调·与既有 CAS 骨架同形）。

**② 键/revision 双换+上限 3（AG-03 主修）**：报告幂等键改 `` `${interviewId}:report:a${n}` ``（n=①之派发序）——`interview-service.ts:340` revision 与键同一字符串·**换键即 revision 同换·零额外接线**（`report.narrative.v1` operation id 不动）；键串仍满足 charset 门（interview-service.ts:306-310 存档约束：uuid 起首字母数字+`:._-` 字符集内·fail-closed 门兜底）。**上限=既有 `MAX_REPORT_ATTEMPTS=3`（report.ts:10）预算轮语义原样**——每轮预算内 dispatch_seq 严格递增（a1,a2,a3）·耗尽 quarantined 终态不变；手动重试开启新一轮预算时序号**继续递增**（a4,a5…）·键空间天然不重访。§二-3 约束吸收：每次重试各冻结一份静态 max 预留（0088 等值触发器）系 AG-11 改革面——本刀**上限既有值不动**（每轮 3 次·不放大）·预留改革联动登记为 AG-11 刀输入（§3-2）。

**③ 手动重试=重置 job 层预算·不重置派发序（EG-A1 主修）**：`requeueFailedReport` 保留 `attempts=0, next_attempt_at=NULL`（#229 D2 语义·`report-retry.proof` P2 断言原样保真）·**新增铁律：任何路径不得复位 dispatch_seq/派发序源**（含未来批量/运营出口）。manual retry 的语义=「给一轮新预算·**换一把新钥匙**」。

**④ AG-10 守卫（同批硬约束·裁决项②）**：`adaptive-lifecycle.ts:465-479` 臂内 `mark==='unbound'` 且 `eligible===0` 时**不再 enqueueReport**（doomed 类源头删除）·改产**确定性「证据不足」报告·零模型调用**：
- **(a) 模板形（推荐）**：同一收尾事务直写 `ai_report` 行为 `ready`·content=确定性模板（如实声明「本场作答均未形成可评分证据·无报告可生成」·零模型零虚构）+ `report_ready` 事件照常（前端无新态）——复用 enqueue 的 `(owner,interview)` 唯一行语义改直写 ready 形（EXEC 细化·模板文案=裁决附带）。
- **(b) 退款形**：eligible=0 的 C 端场不确认额度改补偿释放——**跨结算 CAS 新补偿面**（confirm 已在 :469 先行·须重排为条件确认或事后 release）·复杂度与回归面显著更大。
- 两形呈报·**(a) 为推荐**（「付了钱拿不到任何产出」的诚实呈现面最小化·不动结算状态机）；裁 (b) 则按 §8 授权面内最小实现。**B 端 bound 臂（:470/:477-478）原样零触**；unscored>0 退款臂（:480-488）原样零触。
- **模板住地（附带裁决）**：收尾事务直写 ready 行（本刀推荐·报告管道零新分叉）vs generate 层 scores-空集短路（main.ts/interview-service 加旁路·报告 job 机器空转一轮）——呈报 EXEC 定。

**⑤「不重复扣费在 interview 结算维度」pins 衔接**：本刀**零触** `commerce.ts`（§0.1 #6 blob 恒等）——结算语义、confirmConsumption、releaseConsumption、额度账本全原样；换键重试只改变**模型调用层**的派发真实性·用户额度消耗仍恰一场一次（completeInterviewAndConfirm 幂等收口）。报告链 reserve/confirm/release=0 的静态锚钉（report-retry.proof P3）**原值保留**·本刀 proof 增同形静态门复核。

## §2 验收断言候选（prove 全假体·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **新 proof「失败→重试→新键真调模型」（fake provider/内存账+隔离 PG·invoke 全链或 claim 函数级·EXEC 定深度）**：
   - **AG-03 主臂**：首派发（a1）假体 provider 返回 businessValidate 拒绝（或注错）→ markReportFailed → sweep 重排 → 第二派发断言：claim 动作=`execute`（**非 cached/failed 重放**）+ 假体 provider 调用计数=2（**真调模型**）+ 新账本行键=`{id}:report:a2` ≠ `:a1`。
   - **EG-A1 手动重试臂**：a1 failed 后 `requeueFailedReport`（断言 attempts=0/next_attempt_at=NULL——**job 层语义原样**）→ 再派发断言：键=`:a2`（**绝不为 `:a1`**·派发序跨预算轮单调）+ 旧 failed 行未被重放（provider 计数+1 非账本回放）。
   - **上限臂**：连续 3 次假体失败 → sweep → quarantined 终态（既有形）·键序恰 a1/a2/a3·无 a4 派发。
   - **AG-10 eligible=0 臂**：构造 unscored=0∧eligible=0∧unbound 场收尾 → 断言：**该 interview 名下模型调用行=0**（零模型·含守卫前后）+ 报告行确定性终态（按裁决项②落定形断言：(a) ready+模板 content / (b) 额度释放）+ 无 doomed 重排循环（sweep 零接管）·**B 端 bound 对照臂**（markApplicationNoEligibleScore 终态+assessment_unavailable 事件·零 enqueue）原样。
   - **静态门臂**：键串 charset 门过（`${uuid}:report:a12` 形）；`requeueFailedReport` 源码不含派发序复位（blob/文本断言）；报告链 reserve/confirm/release 非测试调用=0（P3 同形复核）。
2. **既有门回归原值**：`report-retry.proof` P1-P4（含 P2 attempts=0 断言**原样绿**——job 层语义零改的铁证）/ `report-bulkhead.proof`（deps 注入形·prove:report）/ `uc-e2e-019` regenerate db+http 两腿 / `uc-e2e-011` refund 腿——全 EXIT 原值·基线同红登记不洗。刀 B 若已落主线：其 24 臂 proof 同树复跑原值（其 claim 函数签名/0174 面如被本刀迁移连动·随 §0 重 pin 呈报）。
3. **validateReportContent 链回归**：内容校验逐 attempt 独立生效——a2 通过校验即 ready（假体 good content）·a1 校验失败不连坐 a2（新键新账·非 union 重放）。
4. **typecheck**：`turbo typecheck` 全绿（3/3·沿主线收据口径）+ 根 `pnpm typecheck`（CI 权威形·沿刀 B 收据口径）。

## §3 范围外（边界清单·越界即 FAIL）

1. **AG-10 退款形细节**（裁决项②若裁 (b)）：重排 confirm/release 时序之外的一切计费面改造归计费战役；本刀只做同批最小守卫·**不顺势改结算状态机**。
2. **AG-11 预留三件套联动**（§二-3 :18）：重试×静态 max 预留放大面归 AG-11 刀·本刀上限既有值 3 不动·预留零触。
3. **unknown ageing 对账器**（EG-B1·issues AG-03 修法末句「unknown 状态先走 #10 的处置流程」）：unknown 预留清算出口=EG-B1 后继刀·本刀对 unknown 键照换（新键新派发）·**不做 ageing**。
4. **report_unavailable 可重试/不可重试事件分诊细化**（AG-10 修法后半句）：守卫删除 ineligible 类后·其余失败类的终态事件语义细化归刀 F/后继·本刀事件面只动守卫臂。
5. **API 手动重试频控开放面：S12 阈值追认/多实例 Redis 化**（红事实 B 附带·rev2 勘误前提：频控**已实现** 3/时/份——REPORT_RETRY_RL service:36+:741-746 闸+令牌桶 rate-limit.service:12-19+双 proof 在册）：归计费战役·**EXEC 不补建**（已建·零补建面）。
6. **B 端计费/申请投影面**：markApplicationNoEligibleScore/markApplicationAssessmentUnavailable 全原样（blob 恒等目标）·B 端计费=计费战役。
7. **0130 claim 函数语义零字节**：终态重放语义**不动**（本刀=换键绕行非改重放）·`model_operation_revision_invalid` fail-closed 门原样。
8. **interview-jobs 侧 requeue 闸/next_attempt_at**（刀 C 面）：report 侧范本只读·interview 侧零触。
9. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖

**刀 B（AG-06 分类）先行——EXPERT-REVIEWS §七 原文「刀 B…先于一切重试刀（否则重试风暴搅浑验证窗口）」**：B 的四态状态机（known_executed 确定性失败按真实 usage 结算·settled_failed 允许换 revision 重试）是本刀重试真实化的**语义前置**——无 B 则重试把确定性坏输出原样再烧（AI-01 类问题被放大）。B 现状 `line/ag-b-classify`@`2a2fee56` EXEC 毕待 post-prove 未落主线——**本卷基线取主线 `2bc4e2bd`·EXEC 立项时若 B 已落则照 §0 重 pin（invoke/interview-service 触面行号随 B 漂移·结论不变）**。刀 A（lifecycle 续跑）与本刀共享 adaptive-lifecycle.ts（A 动 alreadyApplied 续跑区 :240-317·本刀动收尾守卫区 :465-479·同文件不同区·互不为前置）；刀 C 共享形制参照零文件交集；刀 D 动 invoke 准入面（本刀零触 0130）。**AG-10 守卫同批=本刀内交付·无外部依赖**。下游：刀 F（AG-02 残面 re-roll）复用本刀键形制·非闸。

## §5 Ban 列表 + pins（沿 authz/diag/cost1 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban attempt 源取 `ai_report.attempts`（EG-A1 红线·单调派发序铁律）；Ban 任何路径复位派发序（含 requeue/批量/运营出口——手动重试只重置 job 层预算）；Ban 手动/自动重试不真派发（重试必须新键真调模型·修法目的本身·重放臂=FAIL）；Ban eligible=0 守卫臂调模型（零模型调用铁律·确定性报告）；Ban 触结算维度（commerce.ts 零字节·报告链 reserve/confirm/release=0 锚钉原值）；Ban 改 `MAX_REPORT_ATTEMPTS=3` 与 job 层预算语义（#229 D2 保真·P2 断言原样绿）；Ban 改 0130 终态重放语义（换键绕行非改重放）；Ban 键串越 charset 门（fail-closed 兜底但不许生产路径撞门）；Ban 真实模型外呼（est live=0·prove 全假体）；Ban 顺手做 AG-11 预留改革/EG-B1 ageing/S12 阈值追认与多实例 Redis 频控改造（§3-2/3/5·归后继——rev2 前提勘误：频控已建 3/时/份·禁的是顺手改开放面非补建）；Ban 硬编码迁移号（§0.3-3·claim 前实占复核）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全假体/静态·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①新 proof=假体 provider（内存账/fake model client）+隔离 PG claim 函数级或 invoke 全链（零外网）+ AG-10 臂纯事件/账本构造（零模型定义即可断言调用行=0）；②回归门=既有 prove 原值重跑（report-retry/report-bulkhead/uc-019/uc-011 各自既有形制）；③静态门=源码文本/blob 断言。prove 全 假体/静态·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-e-report-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/cost1/authz 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：

- **①attempt 源形状（EG-A1 勘误的两形呈报）**：(a) `ai_report` 新列 `dispatch_seq`（claim CAS 同语句自增·单点单调·迁移一列·**推荐**）；(b) 派发探 max 后缀（零迁移·LIKE 扫描+账本寄生单调）。附带：序号穿透缝（`GenerateReport` 签名加位 vs `InterviewSummary` 增非模型字段）=EXEC 授权面内细化。
- **②AG-10 守卫形（跨轨硬约束的落地形）**：(a) 确定性模板报告（同批推荐·零模型·如实「证据不足」·收尾事务直写 ready·模板文案=裁决附带）；(b) C 端退款形（补偿释放·跨结算 CAS 面大）。附带：模板住地（lifecycle 收尾事务直写 vs generate 层空集短路）=EXEC 定；B 端 bound 臂与 unscored>0 退款臂两形下均零触。

---

*AG-E REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`2bc4e2bd` · 分支 `line/ag-e-report` · 工作树 `meetwise-age` · 蓝本=issues-final AG-03 :81-88/总览 :15 + AG-10 :158-166/总览 :22 + EXPERT-REVIEWS §七 :64 刀 E 行（修法权威）+§二-1 :15-16 EG-A1（blocking 勘误·函数名现树漂移 requeueFailedReport 如实登记）+§二-3 :18（预留放大约束）+§七 :71（AG-10 守卫同批硬约束）+§一 :11（AG-10 borderline P1）+ review-log LR-F8 :50/:124（P2→P1 上调）+PF-F-12 :65 · 范围=`:report:a{n}` 键/revision 同换+上限 3 + 单调派发序号 + manual retry 只重置 job 层 + AG-10 守卫（eligible=0 零模型·模板 vs 退款=裁决）· 刀 B 先行（分类）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · **rev2（2026-10-11·席1 复核处置·errata 吸收同批落卷）**：blocking B1——rev1 红事实 B 附带登记「全链零频控」系**假红事实·如实撤回**（频控已全链生效：interview.service:36 REPORT_RETRY_RL=3/时/份+:741-746 入口 rl.allow 超限 429 report_retry_limited+rate-limit.service:12-19 真令牌桶+requeueFailedReport 生产调用面唯一 interview-report:40←:745 RL 闸后零旁路+双 proof 在册 report-retry.proof:238-239/report-retry-http.proof:228-238）·改登**开放面=S12 阈值待用户追认（常量可调）+单实例内存桶多实例 Redis seam（service 头注自陈）**→§0.1#9/§1 红事实 B/§3-5/§5 Ban 四处同步（Ban 顺手补频控结论保留·前提改「已建·禁顺手改开放面」）；E1-E4 行号勘误——businessRevision :338→:340·charset 注 :312-322→:306-310·retryReportById :24-33→:35-44·drainReportsOnce :137-166→:140-171（子锚 :156-157/:165-169 微漂如实）→§0.1#2/#4/#9+红事实 A/修法② 同步；**核心三事（AG-03 键双换+EG-A1 单调派发序+AG-10 守卫同批）零改动维持**·§8 冻结维持·STOP 维持·markers=0 复检零命中·pins 十一值零翻*
