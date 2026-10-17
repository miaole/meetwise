# QUEUE-ENQUEUE-BP 入队背压刀（5C-QUEUE 拆刀排程 Q2 · #117+#5 归槽随裁 · enqueueInterviewJob 零背压闸诊断+三案并陈起草卷 · 择案权归协调方/产品 · STOP=`executed:awaiting_post_prove_dual`）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席翻面 2026-10-16 · 前值 `draft:awaiting_pre_exec_dual`=起草+rev 史录 · 协调方六裁决件已行使（①案A②per-owner③N=3④429⑤预查形默认⑥收紧形采用）· EXEC 落码=单点收口 enqueueInterviewJob+begin/turn 429 映射+隔离库证明件判别臂双向亲证（门矩阵与六裁决件行使记录见 §9 EXEC 记录）· post-prove 双审归后继席 · alone≠dual · Ban self-approve · ⛔push · ⛔merge 主线 · est live=0 · `actualSpendCny=null` · pins 十一值零翻）
**席位**：QUEUE-ENQUEUE-BP 入队背压刀 诊断+两案并陈起草席（协调方派单令 · 5C-QUEUE 拆刀排程 Q2 · #117+#5 归槽随裁 · 承 Q1 queue-shutdown 先例与 G7W 两案并陈先例形 · ⛔push · ⛔merge 主线）。
**基线**：`feat/mysql-schema-skeleton` @ **`3cd159dd`**（fetch 后亲证 origin tip `origin/feat/mysql-schema-skeleton`=`3cd159dd` **恰等派单下界**（≥ 以等号成立）· cap sanction 波 tip · docs:check 2185 ≤ cap 2200 本席本树亲跑）· worktree **`meetwise-q2b`**（仓根同级 · `git worktree add ../meetwise-q2b -b line/queue-enqueue-bp` 本席亲立）· branch **`line/queue-enqueue-bp`**。
**基线 rev 登记（rev P2-4 · rev 席 fetch 亲证）**：origin tip 落卷后推进 **`24b75b17`**（`origin/feat/mysql-schema-skeleton`=`24b75b17` 亲证 · 树恒等 diff 空（`git diff 3cd159dd 24b75b17` 零文件）· `3cd159dd` 祖先亲证（`git merge-base --is-ancestor` EXIT=0））· **EXEC 按 ≥`3cd159dd` 重 pin**（§0 锚对届时 tip 复核沿 §0 前言·blob 恒等则只更行号）。
**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①协调方派单令（5C-QUEUE 诊断席定谳承引：#117 靶=enqueueInterviewJob（interview-jobs.ts:27）零背压闸——interview.service:283/:454 无条件入队·仅扣费前置为隐式约束；#117 需产品裁决（上限值/拒绝语义/维度）·本席三案并陈不择案）；②`ai-docs/delivery/harness/product-campaign-LEDGER.md` `:87` 5C 组标签（「#5/#117/#7/#9 背压」在册未翻 · 本席亲读在卷）；③`ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` `:41` QUEUE-BACKPRESSURE 行（「#117 入队背压」原文在树 · 本席亲读在卷）；④`ai-docs/delivery/execution-master-checklist.md` `:2624` STILL OPEN 行+`:3204`-`:3206`「Line queue-shutdown-phases nail」段（5C-QUEUE 排程谱系 Q1 先例·本席亲读在卷）；⑤issues-master #117/#5 行原文**仓外待补**（协调方持有·沿 Q1 #157/#158 同款登记·不阻起草）；⑥结构范本=`harness/queue-shutdown-phases-REQUEST.md`（Q1 姊妹卷·§0/§1/§1.3/§2/§5/§8 形制承之）+`harness/g7w-tail-contract-ruling-REQUEST.md`（并陈卷先例·择案权归协调方形制承之）。

---

## §0 现状锚（起草席亲证 · 全部 Read/git hash-object/rg 实测 @`3cd159dd` · 后继 pre-exec dual/EXEC 面照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）
**EXEC 重 pin 记录（2026-10-16 EXEC 席·序1 并线 merge `ac2d5fd3` 后树亲算 18 blob）**：#1-#13+#16-#18 十六锚 blob **恒等零漂**（行锚逐条不变）；#14 LEDGER `d4c4b391`→**`98fe3116`**（619→627 行）·#15 checklist `e585e85f`→**`467891cb`**（3242→3278 行）——漂移源=EXEC 序1 并线携 nail 波（obs-family/sse-api-family/api-harden-family/g7w-tail-seg-emit）SSOT 随卷内容·**行锚 `:87`/`:2624`/`:3204`-`:3206` 行号均不变**（亲证）·两锚结论（「在册未翻」/「STILL OPEN」）不变=只更 blob 行·零停止条件。

### 0.0 防重双对表（本 turn 实测）

- `git worktree list`：`meetwise-q2b` 名下**恰 1 树**=本树；`git branch --list "line/queue-enqueue-bp"` 恰 1 命中=本席分支 · 零同名。
- `ls ai-docs/delivery/harness/ | grep queue-enqueue` 落卷前**零命中**（无同名卷）；`harness/queue-shutdown-phases-REQUEST.md`（Q1 先例卷 `c754af43`）在树为不同名姊妹卷——本卷与 Q1 卷名/分支名/域（消费侧收尾序 vs 生产侧入队闸）均不同不重叠。
- 本刀在飞相 stock 面：`line/queue-family` 谱系（Q1 卷 §0.0 登记·旧 origin tip 零独有 commit）与本刀零交叠（§3）。

### 0.1 blob 锚表（`git hash-object` 亲算 8 hex · @`3cd159dd` 亲读）

| # | 文件 | blob | 关键行锚（@`3cd159dd` 亲读） |
|---|------|------|------|
| 1 | `packages/db/src/interview/interview-jobs.ts` | `7ebdff1a`（339 行） | **`:27`-`:96` enqueueInterviewJob 零背压闸正身**：`:34` privacy 闸·`:40`-`:54` parent 引用门·`:67`-`:71` INSERT ON CONFLICT 幂等·`:80`-`:94` 幂等 readback（**闸若置 INSERT 前须显式豁免重放**——§1-修法案A 设计点②）·`:11` LEASE_SECONDS=120·`:15` MAX_INTERVIEW_JOB_ATTEMPTS=5·`:18` INTERVIEW_RETRY_BACKOFF_CAP_SECONDS=300·`:20` DEFAULT_INTERVIEW_PER_OWNER_INFLIGHT=1·`:115`-`:160` claimNextInterviewJob（`:124` per-owner advisory xact lock·`:131`-`:135` 退避时闸·`:136` 同面试串行·`:139` 僵尸兄弟·`:144`-`:149` per-owner inflight cap=unexpired running count<budget）·`:249`-`:257` requeueInterviewJob 退避写·`:262`-`:270` renewInterviewJobLease·`:281`-`:304` sweepStuckInterviewJobs reaper·`:307` 滞留 payload TTL=86_400·`:336` enumerateOwnersWithJobs |
| 2 | `apps/api/src/modules/interview/interview.service.ts` | `42cf316e`（887 行） | **`:283` beginInterviewCore 入队点（kind='start'·seq=0）·`:454` turn 入队点（kind='answer'·seq=turn+1）**·`:31` VOICE_RL={40,0.3}·`:33` TURN_RL={30,0.2}·`:39` MAX_TURN=256·`:102`-`:285` beginInterviewCore（`:122` advisory 锁·`:128` 终态守卫·`:140`-`:178` quiz 三守卫·`:184`-`:216` 简历绑定·`:217`-`:234` begin 幂等·`:241`-`:245` route 供给·**:253`-`:273` 扣费前置 reserveEntitlement/reserveEntitlementForApplication 1.0 单位·不足 402/409 分码**·`:279`-`:282` payload 组装）·`:414`-`:419` begin（`:415`-`:416` 内容安全/preview 双闸·**零速率闸**）·`:422`-`:457` turn（`:427` MAX_TURN 上界·`:430`-`:434` 超长策略·`:435`-`:437` TURN_RL 令牌桶 429·`:442`-`:448` 状态机/privacy/answerable 守卫·`:449` claimInterviewAnswer 幂等）·**turn 全链零 reserveEntitlement** |
| 3 | `apps/worker/src/interview-consumer.ts` | `27ddbcf1` | `:307` claim（budget 显式传入）·`:630` gatewayDispatchOwners('interview')·`:646` fairDrainInterviewOwners（预算缺省注入 `:305` `d.dispatchBudget ?? DEFAULT_INTERVIEW_DISPATCH_BUDGET`）·`:276`-`:296` requeueOrTerminalizeExhausted（attempts≥MAX 终态+退款） |
| 4 | `apps/worker/src/interview-dispatch-fairness.ts` | `34f0144f`（162 行） | `:10`-`:13` DEFAULT_INTERVIEW_DISPATCH_BUDGET={perOwnerInflight:1, globalInflight:4}·`:16` OWNER_LAUNCH_CAP=32·`:18`-`:27` readInterviewDispatchBudget（WORKER_INTERVIEW_PER_OWNER_INFLIGHT 界 1..32·GLOBAL_INFLIGHT 界 1..64） |
| 5 | `apps/api/src/platform/rate-limit.service.ts` | `fce544ff` | `:69`-`:71` isSharedBucketKey（**仅 `:global`/`:ip:` 键落共享表；per-principal 键恒进程内·多实例 ×N 稀释**）·`:101` allow(key,capacity,refillPerSec) 令牌桶 |
| 6 | `apps/api/src/modules/jobs/applications.service.ts` | `e1bf8ff0` | `:53`-`:57` startApplicationInterview 与 beginInterviewCore 合一 asPrincipal 事务（B271 片2 S2-C2·rev P2-4 锚勘误原 `:48`/`:57`）——B 端招聘流第二上游同闸链 |
| 7 | `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae` | `:28`-`:31` POST :id/begin · `:36`-`:39` POST :id/turn |
| 8 | `apps/api/src/modules/jobs/applications.controller.ts` | `e12e76fd` | `:20`-`:25` POST :id/start（B 端上游路由·rev P2-4 锚勘误原 `:21`-`:25`） |
| 9 | `packages/db/migrations/0001_baseline.sql` | `d68f8dd0` | `:253`-`:263` interview_job 表（status ∈ queued/running/done/failed·无 pending 上限列无 TTL）·`:268` ix_ijob_claim(owner_user_id,status,seq,created_at)=**per-owner depth count 索引前缀可支撑** |
| 10 | `packages/db/migrations/0049_resume_reference_foundation.sql` | `7c95a713` | `:34`-`:37` ix_interview_job_resume_reference(owner_user_id,resume_id) partial——**interview_id 单列无专用索引**（per-interview 维度 count 设计点·§1-修法） |
| 11 | `packages/db/src/jobs/quiz-jobs.ts` | `a56a0da4` | `:36`-`:45` claimNextQuizJob——**无 per-owner cap 无 per-owner advisory lock**（对照面） |
| 12 | `packages/db/src/jobs/diagnosis-jobs.ts` | `6868276b` | `:28`-`:37` claimNextDiagnosisJob——同 quiz 无 cap（对照面） |
| 13 | `packages/db/src/report/report.ts` | `c6ccd01c` | `:10` MAX_REPORT_ATTEMPTS=3·`:53`-`:56` 指数退避 2^attempts 封顶 300（AG-04 范本）·`:90` claim 退避时闸——队列族既有闸范本源 |
| 14 | `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `98fe3116`（627 行·EXEC 重 pin·原 `d4c4b391`/619 行） | `:87` 5C 组标签「#5/#117/#7/#9 背压」在册未翻（本刀承登载体·行翻面权归协调方） |
| 15 | `ai-docs/delivery/execution-master-checklist.md` | `467891cb`（3278 行·EXEC 重 pin·原 `e585e85f`/3242 行） | `:2624` STILL OPEN 行 · `:3204`-`:3206`「Line queue-shutdown-phases nail」段（Q1 授权链先例） |
| 16 | `ai-docs/delivery/harness/extreview-fix-campaign-SOP.md` | `eae68fe2`（99 行） | `:41` QUEUE-BACKPRESSURE 行「#117 入队背压」原文 |
| 17 | `ai-docs/delivery/harness/queue-shutdown-phases-REQUEST.md` | `c754af43` | Q1 姊妹卷=本卷形制源（5C-QUEUE 拆刀排程谱系） |
| 18 | `scripts/ai-docs/public-text-policy.mjs` | `841e8666` | `:102` MAX_FILES=2_200（docs cap 现值） |

## §1 归因（红事实 · 诊断四项定稿 · 源级亲证 · 「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 诊断a · enqueueInterviewJob 调用链全图（两调用点·上游触发源·扣费前置语义）

- **调用点① `:283`（kind='start'·seq=0）**：HTTP `POST /interviews/:id/begin`（controller `:28`-`:31`）→ `InterviewService.begin`（`:414`-`:419`·内容安全闸 `:415`+preview 写门 `:416`+owner 提取）→ asPrincipal 单事务 → `beginInterviewCore`（`:102`）闸链序=advisory 锁 `:122` → 终态守卫 `:128` → quiz 三守卫 `:140`-`:178` → 简历绑定守卫 `:184`-`:216` → begin 幂等 `:217`-`:234` → route 供给 `:241`-`:245` → **扣费前置**（`:253`-`:273` reserveEntitlementForApplication 企业桶/reserveEntitlement 候人桶·1.0 单位·不足 402/409 分码）→ `:283` 入队。**第二上游**：`POST /jobs/applications/:id/start`（applications.controller `:21`-`:25`）→ applications.service `:57` 同一事务合流 beginInterviewCore（B 端招聘流·扣费路由同 `:253`-`:256` 分叉）。
- **调用点② `:454`（kind='answer'·seq=turn+1）**：HTTP `POST /interviews/:id/turn`（controller `:36`-`:39`）→ `InterviewService.turn`（`:422`-`:457`）闸链序=内容安全闸 `:423` → MAX_TURN=256 上界 `:427` → 超长作答策略 `:430`-`:434` → TURN_RL 令牌桶 429 `:435`-`:437` → asPrincipal 事务：状态机守卫 `:442`-`:443` → privacy guard `:447` → assertAnswerable `:448`（未 begin 拒·防空壳付费 job）→ claimInterviewAnswer 幂等/hash/时序 `:449`-`:453` → `:454` 入队。
- **扣费前置语义（两臂不对称·如实并陈）**：start 臂=入队**同事务前置预留**（`:253`-`:273`）——入队若 throw → 整事务回滚 → 预留同滚，零悬账零独立补偿面；answer 臂=**零扣费调用**（turn 全链无 reserveEntitlement·评分成本走 worker 侧 AG 预算面）——「扣费前置为隐式约束」仅对 start 臂成立，answer 臂唯一隐式约束=TURN_RL 速率+claimInterviewAnswer 幂等+MAX_TURN 序号上界。派单 brief「仅扣费前置为隐式约束」在 answer 臂勘误为「仅速率/幂等隐式约束」——不改变零背压闸结论（§1.2）。

### 1.2 诊断a 续 · 生产侧零背压闸正身

`enqueueInterviewJob`（interview-jobs.ts `:27`-`:96`）全链闸=privacy fence `:34`+parent 引用门 `:40`-`:54`+双写互斥 `:61`-`:64`+幂等 ON CONFLICT `:67`-`:71`——**零容量检查**：无 queued 深度 count、无入队速率判定、无租约占用判定、无全局 pending 上限。生产侧与消费侧之间唯一耦合=数据库行本身：api（生产者）与 worker（消费者）独立部署，worker 停机/减速窗内 queued 行持续累积而生产侧照常受理。

### 1.3 诊断b · 现有容量约束普查（三面清点+对照面）

- **inflight cap（消费侧·interview 有·quiz/diagnosis 无）**：claim 谓词 `:144`-`:149` count(unexpired running)<budget.perOwnerInflight，缺省 1（`:20`）；生产 budget=WORKER_INTERVIEW_PER_OWNER_INFLIGHT 缺省 1 界 1..32+globalInflight 缺省 4 界 1..64（dispatch-fairness `:18`-`:27`）+per-owner advisory xact lock `:124`（多副本防竞越）+同面试串行 `:136`+僵尸兄弟守卫 `:139`。对照面：quiz-jobs `:36`-`:45`、diagnosis-jobs `:28`-`:37` 均**无** cap 无 owner lock——interview 是三队列唯一有消费侧 cap 者。
- **退避时闸**：requeue 指数退避 next_attempt_at=now()+2^attempts 封顶 300 秒（`:249`-`:257`·report.ts `:53`-`:56` 范本）+claim queued 臂时闸 `:131`-`:135`+attempts≥5 终态化（`:15`+reaper `:281`-`:304`+consumer `:276`-`:296` 统一上限闸）——**约束的是重试频率，不约束新入队**。
- **租约面**：LEASE_SECONDS=120 `:11`+心跳续租 `:262`-`:270`+reaper 两臂+滞留 payload TTL 86400 `:307`——**约束的是运行中行的崩溃回收，不约束 queued 积压**。
- **存储面**：interview_job 无 TTL 清理（done/failed 留存）、无 pending 上限；interview_job 面索引/唯一约束**全枚举五条（rev P2-1 补全·rev 席 @`3cd159dd` 逐条亲读）**：①ix_ijob_claim(owner_user_id,status,seq,created_at)（0001 `:268`·per-owner count 前缀可支撑）②UNIQUE(owner_user_id,interview_id,kind,seq) 幂等键约束（0019 `:68`）③ix_interview_job_resume_reference(owner_user_id,resume_id) partial(resume_id IS NOT NULL)（0049 `:34`）④ix_interview_job_reference_legacy_backfill(created_at,id) partial(reference_schema_version IS NULL)（0055 `:10`）⑤ix_interview_job_v64_resume_epoch(owner_user_id,interview_id,reference_schema_version,resume_privacy_epoch,created_at) partial(reference_schema_version=64)（0064 `:36`·(owner,interview) 前缀）。
- **HTTP 层既有闸**：TURN_RL per-principal 令牌桶（capacity 30/refill 0.2/s `:33`·`:435`-`:437`）+VOICE_RL `:31`+begin **零速率闸**（扣费为唯一刹车）；per-principal 桶进程内不跨实例共享（rate-limit.service `:69`-`:71` 仅 `:global`/`:ip:` 键落共享表·多实例 ×N 稀释）。

### 1.4 无界性实测（三个无界面·背压缺口定量面）

1. **per-owner 深度无绝对上界**：per-interview answer 深度天然 ≤257（**turn∈0..256**·`turn > MAX_TURN` 拒 `:427`·seq=turn+1∈1..257·kind+seq 唯一）+start 1=**258/面上界**（rev P2-2 勘误·原「≤ MAX_TURN=256」记法 off-by-one），但 owner 可开并发面试数仅受余额约束（begin 1.0 单位/场·abandon/fail 退款既有）→ per-owner queued 总深度=并发场数×各场深度，无绝对上限。
2. **cross-owner 总深度无绝对上界**：各 owner 闸互不叠加；worker globalInflight=4 为消费侧速率界，生产侧无对应镜像。
3. **worker 停机窗无界累积**：消费全停时 TURN_RL 0.2/s/principal 持续入队（burst 30）+begin 按余额持续入队——速率闸（既有）只减增速率，不减存量深度。

### 1.5 诊断c · 背压维度候选（三维度可用性评估）

| 维度 | 定义 | 可得性 | 评估 |
|---|---|---|---|
| 深度 | queued 行数（per-owner 或 per-interview） | per-owner count 走 ix_ijob_claim 前缀（0001 `:268` 索引支撑）；per-interview 走 **0064 `:36` v64 partial 前缀可支撑·零补索引可行面**（rev P2-1 勘误·原「无专用索引」作废·五索引全枚举见 §1.3 存储面） | **直 bounds 目标量**（§1.4 三个无界面的公共正身=深度）；worker 停机窗内闸即触发 |
| 速率 | 每秒入队 | HTTP 层现成（RateLimitService `:101`）| 只减增速率不减存量（§1.4-3）；begin 臂全新速率面 |
| 租约占用率 | unexpired running/budget.perOwnerInflight | 复用 claim 同一 count 谓词形状 `:144`-`:149` | 生产 cap=1 → 占用率∈{0,1} **二值退化**（§1-修法案C 论证）；作信号可用作闸不可独立成立 |

## §1-修法（三案并陈 · 推荐案定稿+备选案框架 · 本卷零实施零码动 · 择案权与全部裁决项归协调方/产品）

### 案A · 深度上限（推荐 · 定稿形）

- **【EXEC 裁决激活 · 2026-10-16 协调方六裁决件行使（§8-① 案裁决=EXEC 前置条款兑现·行使记录随 §9 EXEC 记录）】**：①择案=**案A 深度上限**（本定稿形激活·案B 备选框架/案C 降级信号维持并陈史录不激活）；②维度=**per-owner**（ix_ijob_claim(owner_user_id,status,…) 索引前缀现成·0001 `:268`·零迁移可行面）；③**N=3**（per-owner queued 上限·保守缺省·产品可后调——inflight budget=1 时 3 深度留排队余量）；④拒绝语义=**429**（C 端 begin/turn 语义·clients 侧重试友好·沿 TURN_RL 429 `:435`-`:437` 分口·Retry-After 未裁=不落）；⑤重放豁免=**预查形默认**（rev P1-1 完备形·幂等键 (owner,interview,kind,seq) 0019 `:68` 预查存在即跳闸·任意行状态皆豁免·count 形误拒窗已披露不采）；⑥收紧形=**采用**（advisory 收紧覆盖软超窗=N 为硬上限·键串=`meetwise.interview_enqueue.owner:*` **新空间** ≠ claim `:124` 专用键 `meetwise.interview_dispatch.owner:*`）。落码=EXEC 单点收口 `enqueueInterviewJob`（interview-jobs.ts）+错误码映射（interview.service.ts beginInterviewCore/turn catch→429）·判别臂与门值见 §9 EXEC 记录。
- **闸体**：enqueueInterviewJob 同事务 INSERT 前按裁决维度 count(queued) ≥ **N**（待产品裁）→ throw 具名错 `interview_queue_saturated` → HTTP 拒（**429 vs 503 待产品裁**·沿内容安全闸 503 `:325`-`:337` 与 TURN_RL 429 `:435`-`:437` 两先例分口）。两调用点+applications 上游单点收口（闸在 db 层=未来调用者同护）。
- **失败语义红利**：start 臂同事务回滚=预留同滚（§1.1）零悬账零补偿；answer 臂同事务回滚=claim 同滚可安全重试。
- **EXEC 设计点五件**（双审对象）：①维度=per-owner（ix_ijob_claim 前缀现成·0001 `:268`）或 per-interview（**0064 `:36` v64 partial 前缀 (owner_user_id,interview_id) 可支撑·零补索引可行面**·rev P2-1 勘误原「需补索引或 claim 形子查询·10 号锚」作废）待裁；②**幂等重放豁免（rev P1-1：两豁免形不等价·预查形默认）**——`:80`-`:94` readback 在 INSERT 后，闸若裸置 INSERT 前则深度满时重放被误拒（既还 jobId 语义破坏）。两形**不等价**：**幂等键预查形=完备（默认形）**——预查 (owner,interview,kind,seq)（0019 `:68` 幂等键约束）存在即跳闸·任意行状态（queued/running/done/failed 皆豁免）；miss→过闸→INSERT ON CONFLICT 等待→readback，无次序死窗；/**count 排除形=存在误拒窗**——replay-after-done 系设计内流程（interview-question.ts `:104` 'replayed' 臂+service `:455` `replayed:true`·rev 席亲证），重放行非 queued 不在 count 内·他行饱和时重放仍被 `interview_queue_saturated` 误拒=设计点② 要防的 bug 在角落复活——**择 count 形须 EXEC proof 增 done/running 重放臂**；③竞态两并发同拍过闸=N+1 软超限，可沿 claim `:124` 形 per-owner advisory lock 收紧（成本=同 owner 入队串行化·入队低频可承）——**收紧形采用与否=裁决项⑥**（rev P2-3 新设·N 硬/软上限语义：采用=N 为硬上限；不采用=软上限·N+1 瞬时超限如实认列）·**EXEC 键串注记：入队闸 advisory lock 键串须 ≠ `meetwise.interview_dispatch.owner:*`**（claim `:124` 专用键·同键将令入队与 dispatch 互锁串行）；④N 值与 per-owner/per-interview 维度联动（N_owner ≥ N_interview 量级）；⑤错误码三口映射（begin C 端 4xx/5xx·begin B 端 enterprise 分口沿 `:259` 先例·turn 沿 `:437` 形）。
- **利**：直 bounds §1.4 全部三个无界面；拒绝即回滚语义最干净；单点收口成本一次索引化 count。
- **弊**：N 需产品裁（值错=误拒真实用户或形同虚设）；count 增一次查询；重放豁免与竞态收紧增实现复杂度。

### 案B · 速率闸（备选 · 框架形）

- **闸体**：复用 RateLimitService `:101` 令牌桶，键形 `enqueue:${owner}`（或 `interview-enqueue:global` 落共享表），速率 **R**（待产品裁；先例值 TURN_RL=30/0.2 仅作量级参照非提案值）。
- **利**：零新 SQL 查询·基础设施现成·在 reserve 之前拒省预留 churn；对突发 burst 平滑。
- **弊**：**速率≠深度**——worker 停机窗内 R 速率持续入队仍无界累积（§1.4-3·不解决本刀正身只减增速率）；begin 臂全新速率面（今日零）；per-principal 桶进程内多实例 ×N 稀释（5 号锚 `:69`-`:71` 亲证）与既有 TURN_RL 同承；`enqueue:${owner}` 键若改 `:global` 形则跨实例精确但放全局桶表写频。
- **与案A 关系**：可作案A 外层前置廉价闸（组合形），不推荐单独承接本刀目标。

### 案C · 租约占用率闸（降级为信号 · 不作独立闸）

- **闸体假想**：复用租约面 count(unexpired running)≥budget.perOwnerInflight 即拒。
- **否弃论证**：生产 cap=1 → 占用率∈{0,1} 二值退化；占用=1 时拒入队将打断正常流程（start running 中 answer 须可入队排队——同面试串行 `:136` 本就要求 answer 在 start 之后入队等待，拒之=流程死锁面）；占用<1 时永不触发=空闸。**本质是消费侧已有闸的镜像，作入队闸不可独立成立**。
- **降级建议**：(a) 可观测信号——占用率+深度双 gauge 沿 0203 gateway_model_invocation_backlog 双 COUNT 先例（RECONCILE-RETRY #10 裁决(c) 仅可观测化形）；或 (b) 作案A 复合条件（占用=1 AND 深度≥N）缩误拒面。二者均须协调方/产品裁。

### 推荐语与裁决项清单（EXEC 前置）

**推荐=案A 定稿**（直 bounds 目标量+失败语义最干净+单点收口）；案B 备选框架（可组合）；案C 降级信号。**裁决项六件（rev P2-3 后原五件→六件·全部 EXEC 前置·本卷零预支）**：①择案（A/B/C/组合）②阈值 N（案A）或速率 R（案B）③拒绝语义（429 vs 503·Retry-After 有无·错误码文案）④维度（per-owner/per-interview）⑤幂等重放豁免形=**预查形默认（完备形·rev P1-1 落定口径收窄）**——两形不等价注记见设计点②，若逆默认择 count 排除形须认其误拒窗+EXEC proof 增 done/running 重放臂；⑥**收紧形采用与否**（rev P2-3 新设·设计点③·N 硬/软上限语义）。#117+#5 两行归槽随裁=本刀承登面，行翻面权归协调方。
**【六裁决件行使状态（2026-10-16）】**：六件已由协调方全数行使（①案A/②per-owner/③N=3/④429/⑤预查形默认/⑥收紧形采用·逐件值见案A 激活块）——EXEC 前置条款兑现·EXEC 已落卷（§9 EXEC 记录七字段+六裁决件行使记录）。

## §1.3 否决清单（veto · 双审/裁决/EXEC 违反任一即 FAIL）

1. **Ban 本卷实施**：起草卷零码动——interview-jobs.ts/interview.service.ts/applications.service.ts/rate-limit.service.ts/worker 面零触碰（§0.1 锚全部只读）。
2. **Ban 择案**：三案并陈不择案·择案权与六裁决项（rev P2-3 后）归协调方/产品——本卷推荐语非裁定（沿 G7W 并陈先例「择案权归协调方」形制）。
3. **Ban 阈值预支**：N/R/维度/拒绝语义在本卷不定值不预设（裁决项=EXEC 前置·§9）。
4. **Ban 在消费侧解生产侧缺口**：claim cap/退避/租约面既有语义零改（改消费侧不堵生产侧无界入队=域错位）；quiz/diagnosis 无 cap 缺口**另立登记不并入**（对照面只读）。
5. **Ban 顺带改存储面**：done/failed 行 TTL 清理、索引增补均另域另刀（本卷登记设计点不实施）。
6. **Ban 触 SSOT 行本体**：LEDGER `:87`/checklist `:2624`/SOP `:41` 及 backlog 全部行零字节改——行翻面/归槽宣称权归协调方（本卷=承登载体）。
7. **Ban self-approve**（pre-exec dual 归协调方派两独立外席 · alone≠dual）· **Ban retry-to-green/Ban 只留绿 attempt** · **Ban 触 §3 全部域**。

## §2 门矩阵（docs-only 起草卷形 · 每条可独立判定 · 本席落卷期全跑）

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| 1 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线亲跑：2185 managed ≤ cap 2200（`public-text-policy.mjs:102` MAX_FILES=2_200 亲证）· 落卷后预期 2186 ≤ 2200 · 本卷系唯一新增受管件·余量 14） |
| 2 | markers 五类 | 改动集 grep（词族=`scripts/i6-239-gates.proof.mjs:151`-`:163` 运行时组装四词+冲突标记对 · **词面本卷不复抄防自匹配**；i6-239 proof 本体系其刀自scope 恰符门·非通用门——本卷沿 G7W docs-only grep 形不行使该 proof） | **零新增命中**（本席亲跑：四词词族命中 0/0/0/0+冲突标记对命中 0 · 改动集恰 1 .md） |
| 3 | diff 面 | `git diff --numstat HEAD~1 HEAD`（落卷后） | **恰 1 tracked 新件=本卷 .md · +N/−0 纯新增 · 零他 tracked 路径零删改**（SSOT 原文零触机检：LEDGER/checklist/SOP 对 HEAD 零 delta） |

docs-only 边界：本刀零产品码零 spec 零夹具零迁移零占号零锁文件；typecheck/lint/证明体等重门**不在本刀矩阵**（零码刀 · 沿 Q1/G7W docs-only 形制）。EXEC 面（后继工序·非本卷）门=本矩阵三条+按择案结果另立码门矩阵（案A 须含隔离库 proof 幂等重放臂+竞态臂；预算重报随 EXEC REQUEST）。

## §3 范围外（边界清单 · 越界即 FAIL）

1. 产品码全域（§0.1 #1-#13 全部锚文件及其余 apps/packages 面）——只读引用零触碰（EXEC 期按择案另立授权）。
2. quiz/diagnosis 队列域（quiz-jobs.ts/diagnosis-jobs.ts 及其 worker/api 面）——对照面只读；其无 cap 缺口另立登记不并入（§1.3-4）。
3. SSOT 行本体（LEDGER/checklist/backlog/issues-final/SOP 全部行）——零字节改（§1.3-6）。
4. 消费侧语义（claim 谓词/退避/租约/reaper/心跳）与存储面（TTL/索引）——零触（§1.3-4/5）。
5. issues-master 原文（#117/#5 仓外·协调方持有）——零代立零转写（登记指针而已）。
6. 在飞支线（`line/queue-family` 谱系及一切他支）——零代推零改写零复活。

## §4 依赖与迁移号

零新依赖——承重锚全部已在树/在卷（§0.1 十八锚）。**迁移号=零**（docs-only · 现树 max=0204 口径沿 Q1 卷登记 · 本卷不预占任何号）。**EXEC 期预告（不预支）**：若裁决=案A+per-interview 维度 → **0064 `:36` v64 partial 前缀可支撑·零补索引可行面**（rev P2-1 勘误·原「可能需 interview_id 索引（10 号锚）」随五索引全枚举作废）；若裁决=案A per-owner 维度 → 现索引前缀已支撑（9 号锚）零迁移可行面。两臂皆**零迁移可行面**。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写操作只在本 worktree 一次 docs commit）· Ban merge 主线 · Ban coding（零产品码/零脚本/零 spec/零夹具/零迁移）· Ban self-approve（pre-exec dual 归协调方派两独立外席 · alone≠dual）· Ban 择案（§1.3-2）· Ban 阈值预支（§1.3-3）· Ban 消费侧改写（§1.3-4）· Ban 存储面顺带（§1.3-5）· Ban SSOT 行本体触（§1.3-6）· Ban quiz/diagnosis 域并入（§1.3-4）· Ban retry-to-green/Ban 只留绿 attempt · Ban 触 §3 全部域 · Ban Key 物料（`.env*`/值/fingerprint 入树入据）· Ban 预占迁移号。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零调用零消耗）。

## §6 est live=0

本卷零模型真实外呼零 DB 连接零容器：起草 turn 全只读（rg/Read/sed/git hash-object）；落卷期门行使面=docs:check+markers proof+git diff（全本地零外呼）。后继 EXEC 期 est 随择案另报（案A 隔离库 proof 形沿 requeue-backoff.proof 先例零模型外呼；本卷不预支预算）。`actualSpendCny=null`。

## §7 markers=0（卫生声明）

本刀改动集恰 1 .md，五类标记词起草席亲跑 grep 零新增（四词词族 0/0/0/0+冲突标记对 0 · 命令与回执随交付报告；词面不在卷内复抄避免自匹配·i6-239 proof 恰符臂系其刀自scope 非本刀门——沿 G7W 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual`（EXEC 席翻面·2026-10-16 · 前值 `draft:awaiting_pre_exec_dual` 史录 · 本值为卷内三处锚定=①卷头标题行+②本 Status 行+③本节 · 卷尾行不载 STOP 值防多锚漂移 · 沿 G7W 先例「自述三处实测四处」教训预勘误）。** 开工三条款兑现记录：①协调方/产品**案裁决**——**已兑现**（六裁决件全数行使=①案A②per-owner③N=3④429⑤预查形默认⑥收紧形采用·§9 EXEC 记录逐件留痕）；②本卷 pre-exec 双审 BOTH PASS——**已兑现**（双审+rev P1×1+P2×5 全落·`e75d5ef8`）；③EXEC 授权——**已兑现**（协调方派单令随裁决令）。EXEC 已落卷（§9 七字段）· post-prove 双审归后继席 · alone≠dual · Ban self-approve · ⛔push ⛔merge 主线。

**停止条件（四类 · 命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 面对届时 tip 重 pin——`:283`/`:454` 调用点被他刀改写、`:87` 组标签翻面、或 §0 锚漂移超 ±3 且结论受影响 → 停手上报（不得就地改诊断实质）。
2. **机制不满足**：若新读数推翻诊断任一承重环（如两调用点出现他上游、消费侧 cap 语义被改、或幂等 readback 形变使设计点② 失效）→ 停手上报回炉（不得就地改定性）。
3. **越界需要**：执行中若需触 §3 任何域（产品码/quiz/diagnosis 域/SSOT 行本体/在飞支线）→ 停手上报。
4. **验收红不可修**：docs:check/markers/diff 面任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门）。

---

## §9 pre-exec dual 交接（预留 · 本节零 SSOT 触碰）

- **双审对象四件**：§1 诊断四项（调用链全图两臂不对称勘误/零闸正身/容量普查/无界性三面+维度候选表·对照 §0.1 #1-#13 届时 blob 复核）· §1-修法三案利弊与推荐语（**推荐语≠裁定**·三案文本零预设值）· §0 锚保真（#8/#10 两锚 blob 已亲算补 pin=`e12e76fd`/`7c95a713`·届时复核恒等）· 裁决项清单完备性（**rev 后六件**是否穷尽 EXEC 设计面·原五件+⑥收紧形 rev P2-3）。
- **悬决项（归协调方/产品 · 全部 EXEC 前置）**：①择案（案A/B/C/组合·推荐案A 仅作参考）②阈值 N 或速率 R ③拒绝语义（429/503/Retry-After/错误码三口映射）④维度（per-owner/per-interview·涉索引面）⑤幂等重放豁免形=**预查形默认（完备形·rev P1-1 收窄）**——逆默认择 count 排除形须认误拒窗+EXEC proof 增 done/running 重放臂；⑥**收紧形采用与否**（rev P2-3 新设·N 硬/软上限语义）；⑦EXEC 排程与预算（随案另报·原⑥顺延）· #117+#5 归槽宣称与 LEDGER/checklist 行翻面（行翻面权归协调方·本卷零代行）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数+§1 诊断四项系读数登记（原值记账零冲销）——无论后继择何案/何值/何维度，诊断面不因裁决改写。
- **rev 处置摘要（2026-10-16 rev 落卷席 · 席1 agent_e82e93f9 PASS P2×3 + 席2 agent_38d1cbfe FAIL P1×1+P2×5 · 两案并陈卷 draft 态 §8-③ 窗口内 rev 落卷 · 席2 六项全落·本节零 SSOT 触碰）**：
  - **P1-1（唯一阻塞·已解）**：设计点②+裁决项⑤两豁免形不等价披露，**落预查形默认（完备形）**+count 形不等价注记——幂等键预查形=预查 (owner,interview,kind,seq)（0019 `:68`）存在即跳闸·任意行状态，miss→过闸→INSERT ON CONFLICT 等待→readback 无次序死窗；count 排除形=replay-after-done 设计内流程（interview-question.ts `:104` 'replayed' 臂+service `:455` `replayed:true`·rev 席亲证）重放行非 queued 不在 count 内·他行饱和时重放仍被误拒·择之须 EXEC proof 增 done/running 重放臂。落点=§1-修法设计点②+裁决项⑤+§9 悬决项⑤。**注**：⑤口径收窄系 rev 落定（协调方指令·席2 处置），非阈值预支（§1.3-3 Ban 之 N/R/维度/拒绝语义仍零预支零预设）。
  - **P2-1**：索引枚举补五条（0001 `:268`/0019 `:68`/0049 `:34`/0055 `:10`/0064 `:36`·rev 席逐条亲读）·per-interview 维度改「**0064 v64 partial 前缀可支撑·零补索引可行面**」。落点=§1.3 存储面+§1.5 深度行+设计点①+**§4 EXEC 期预告随勘误**（原「可能需 interview_id 索引」作废·两臂皆零迁移可行面）——§0.1 #10 锚「interview_id 单列无专用索引」字面仍真未触。
  - **P2-2**：§1.4-1 深度界改「**answer ≤257（turn∈0..256）+start 1=258/面上界**」（rev 席亲证 `:427` `turn > MAX_TURN` 拒→turn 0..256=257 值·seq=turn+1∈1..257；原「≤ MAX_TURN=256」off-by-one 勘误）。
  - **P2-3**：设计点③+裁决项增⑥「**收紧形采用与否**」（N 硬/软上限语义：采用=硬上限·不采用=N+1 瞬时软超限认列）+**EXEC 键串注记：入队闸 advisory lock 键串 ≠ `meetwise.interview_dispatch.owner:*`**（claim `:124` 专用键亲证·同键=入队与 dispatch 互锁串行）。裁决项五件→六件（:100 清单+§8①+§9 双审对象/悬决项+卷尾计数随更；§9 悬决项原⑥EXEC 排程顺延⑦）。
  - **P2-4**：§0.1 锚 #6 改 `:53`-`:57`、锚 #8 改 `:20`-`:25`（rev 席亲读亲证·blob `e1bf8ff0`/`e12e76fd` 恒等亲算）·基线行加「origin tip 落卷后推进 `24b75b17`」登记（rev 席 fetch 亲证·树恒等 diff 空零文件·`3cd159dd` 祖先亲证 EXIT=0）·EXEC 按 ≥`3cd159dd` 重 pin。
  - **P2-5（勘误登记）**：起草 commit `9a24ad31` 括注「（择案/N/R/拒绝语义 429vs503/维度/重放豁免形）」**六目名目漂移**——同句称「五件」而列六名目（N/R 拆二所致），**卷内（起草时）五件清单为准**（②阈值=N 或 R 单目）；本 rev 后清单为六件系⑥收紧形新设（P2-3），与该括注六目名目无关两事，勿混。
  - **rev 自检（本席亲跑 receipts）**：docs:check **EXIT=0**（2186 managed ≤ cap 2200·落卷前后同值·本卷系唯一改动件零新增件）·markers 五类改动集 grep **零命中**（四词词族 0/0/0/0+冲突标记对 0·词面不在卷内复抄沿 §2/§7 形制）·diff 面=本卷 1 tracked .md（行内修订+§9 append·零他 tracked 路径·SSOT 四卷零触）·STOP 维持原值三处锚不动（值面本 bullet 不复载防第四处锚·沿 §8「自述三处实测四处」预勘误教训）·**rev 落卷后席2 窄域复认方会签+案裁决=EXEC 前置**·⛔push ⛔merge 主线（本 commit 本 worktree append 不洗·零 force 零 rebase）。

---

## §9 EXEC 记录（2026-10-16 · EXEC 席落卷 · 七字段+六裁决件行使记录 · STOP 翻面三处随卷）

**授权链**：起草 `9a24ad31`→rev `e75d5ef8`（P1×1+P2×5 全落·rev 后席2 窄域复认）→pre-exec 双审 BOTH PASS→**协调方六裁决件行使（案裁决=EXEC 前置条款兑现·§8-①）+EXEC 授权随派单令**（六件值见下「六裁决件行使记录」）。EXEC 未改 §1 诊断实质/§3 边界/§5 Ban/pins；§1-修法案A 激活块=裁决值落卷（非预支——值出协调方裁决令）。

**序1 并线**：`git fetch` 后 `origin/feat/mysql-schema-skeleton` tip=`c7995868`（派单下界「tip≥最新」成立=nail 波 tip 亲证）·`git merge-tree --write-tree` 预演 EXIT=0 零冲突先证（本侧恰 1 卷文档 +178 行与 incoming 29 files 零交叠）·`git merge --no-ff origin/feat/mysql-schema-skeleton` 一笔并线=merge commit **`ac2d5fd3`**（实测 ort 零冲突 29 files +1364/−18 全 obs-family/sse-api-family/api-harden-family/g7w-tail-seg-emit 四波卷内容·冲突沿并集解预置未触发·⛔pull --rebase 未用·⛔force push 未用）。

**六裁决件行使记录（协调方 2026-10-16·逐件落卷落码）**：
| # | 裁决项 | 行使值 | 落码落点 |
|---|---|---|---|
| ① | 择案 | **案A 深度上限**（案B/C 维持并陈史录不激活） | interview-jobs.ts 闸体 `:70`-`:91` |
| ② | 维度 | **per-owner**（ix_ijob_claim 前缀现成·零迁移） | count 谓词 `:85`-`:88`（owner_user_id 单维） |
| ③ | 阈值 N | **3**（per-owner queued 上限·保守缺省·产品可后调） | 常量 `MAX_INTERVIEW_PER_OWNER_QUEUED=3` `:25` |
| ④ | 拒绝语义 | **429**（C 端 begin/turn 语义·Retry-After 未裁=不落） | interview.service.ts `:290`-`:291`/`:470`-`:471` catch→429 |
| ⑤ | 重放豁免 | **预查形默认**（rev P1-1 完备形·count 形误拒窗已披露不采） | 幂等键预查 `:80`-`:83`（存在即跳闸·任意行状态） |
| ⑥ | 收紧形 | **采用**（=N 硬上限·键串新空间） | advisory `:79` `meetwise.interview_enqueue.owner:*` ≠ claim `:152` `meetwise.interview_dispatch.owner:*` |

**字段① 门矩阵全表（EXEC 时点·§2 三门+码门·判别链双向亲证）**：

| # | 门 | 判据与结果 | 结论 |
|---|---|---|---|
| 1 | worker interview 面（隔离库·`run-e2e-isolated.mjs interview:prove:raw`） | **改前红**（闸缺位·stash 取证）=3 FAIL「饱和判别臂/per-owner 维度臂/竞态臂」EXIT=1·其余全臂绿零回退；**改后绿**=64 PASS 零 FAIL **EXIT=0**（④ 段 9 新臂全 PASS） | 绿（判别臂改前红→改后绿） |
| 2 | api neg-interview 面（隔离库 HTTP·`run-e2e-isolated.mjs neg:interview`） | **改前红**（最终 fixture·stash 取证）=4 FAIL「turn 429 映射臂/begin 429 映射臂/answer 臂回滚/start 臂回滚」EXIT=1·103 绿；**改后绿**=107/107 全绿 **EXIT=0** | 绿（429 映射+回滚语义双向亲证） |
| 3 | neg:all | `pnpm neg:all` **EXIT=0** 六段 **90/90/91/107/179/135**（interview 102→107=§10 五臂·其余恰等基线） | 绿 |
| 4 | typecheck | `pnpm turbo typecheck --force` **EXIT=0**「8 successful, 8 total / Cached: 0 cached」 | 绿 |
| 5 | lint | `pnpm turbo lint --force` **EXIT=0**「12 successful, 12 total / 0 cached」五值**恰等 pin**：web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（全 0 error·零警告增量） | 绿 |
| 6 | docs:check | `node scripts/ai-docs/check-docs.mjs` **EXIT=0**「scanned **2192** managed worktree files」≤ cap **2200**（余 8·计数谱系 3cd159dd=2185+本卷 1+并线四波 +6=2192 亲算） | 绿 |
| 7 | markers | 改动集五类标记词（词族运行时组装防自匹配·`i6-239-gates.proof.mjs:151`-`:163` 同形）**零命中**（四词词族 0/0/0/0+冲突标记对 0）；i6-239 proof 本体系其刀自scope 不行使（§2 门2 既有登记） | 绿 |
| 8 | diff 面 | porcelain=**恰 5 tracked**：本卷 .md+`interview-jobs.ts`(+28)+`interview.service.ts`(+21/−2)+`neg-interview.proof.ts`(+76/−1)+`interview.proof.ts`(worker·+59/−1)；`apps/web/tsconfig.tsbuildinfo` typecheck 副产物 checkout 复位不计（沿 api-harden R4 先例）；`git diff HEAD -- packages/db/migrations pnpm-lock.yaml`=空（**零迁移零依赖**·链头 0204 零触） | 绿 |
| 9 | 卫生 | `pnpm install --frozen-lockfile`（worktree node_modules 缺席·环境准备）后 lockfile **零字节变**（diff 面亲证）；est live=0（全程隔离容器/进程内·零模型外呼·零 secrets 读用） | 绿 |

**字段② EXIT 原值**：门1 改前 EXIT=1（stdout「✗ 3 项失败」）→改后 EXIT=0（末行「✓ 当前 v64 面试链路全部通过」+PASS 计 64）·门2 改前 EXIT=1（「✗ neg:interview: 4/107 失败」）→改后 EXIT=0（「✓ neg:interview: 107 条负路径用例全绿」）·门3 EXIT=0（六段「条负路径用例全绿」行亲录）·门4 EXIT=0（「Tasks: 8 successful, 8 total / Cached: 0 cached, 8 total」）·门5 EXIT=0（「Tasks: 12 successful, 12 total」+五值 ✖ 计数逐包亲录 0 errors）·门6 EXIT=0（「ai-docs check passed: 80 required files verified; public text policy scanned 2192 managed worktree files」）·门7 MARKER_HITS=0·门8 porcelain 五行亲录·门9 frozen-lockfile 零 delta。

**字段③ 改前改后 PASS 名单 diff（判别链定稿）**：worker 面（分母=merge `ac2d5fd3` 改前 run）only-in-post=④ 段 9 臂由 3 FAIL（饱和判别/per-owner 维度/竞态）转 PASS+既有 55 臂恒等；api 面 only-in-post=§10 五臂由 4 FAIL（turn 429/begin 429/answer 回滚/start 回滚）转 PASS·预查形豁免臂两态双 PASS（改前无闸自然放行/改后闸在场仍放行=豁免语义正证）·既有 102 臂恒等零回退。判别臂「改前红」非单 attempt 留证：fixture 两次工艺修正（见字段⑥-1）后按**最终 fixture stash 取证双向亲证**（Ban 只留绿 attempt 遵守·改前 run 均全量 EXIT=1 落档）。

**字段④ diff numstat**：并线 merge `ac2d5fd3`（零冲突并集·29 files 全四波卷内容非本刀修法面）；EXEC 修法面=5 tracked：本卷 .md（§0 重 pin+案A 激活块+§9 append+STOP 三处翻面）+`packages/db/src/interview/interview-jobs.ts` **+28/−0**+`apps/api/src/modules/interview/interview.service.ts` **+21/−2**+`apps/api/test/neg-interview.proof.ts` **+76/−1**+`apps/worker/test/interview.proof.ts` **+59/−1**；tsbuildinfo 副产物 checkout 不计。

**字段⑤ 重 pin 全表（并线后树 `ac2d5fd3` EXEC 时点）**：§0.1 十八锚亲算——#1-#13+#16-#18 十六 blob **恒等零漂**（interview-jobs.ts `7ebdff1a`/interview.service.ts `42cf316e`/consumer `27ddbcf1`/fairness `34f0144f`/rate-limit `fce544ff`/applications.service `e1bf8ff0`/双 controller `d10db4ae`/`e12e76fd`/0001 `d68f8dd0`/0049 `7c95a713`/quiz `a56a0da4`/diagnosis `6868276b`/report `c6ccd01c`/SOP `eae68fe2`/Q1 卷 `c754af43`/policy `841e8666`）；#14 LEDGER→`98fe3116`+#15 checklist→`467891cb`（漂移源=并线四波 SSOT·`:87`/`:2624`/`:3204`-`:3206` 行锚不变·结论不变）。**修法落码后锚移（字节漂移=本刀自身落码）**：interview-jobs.ts `:27`→`:32`（enqueueInterviewJob·头部常量 +4 行所致）·闸体落点 `:70`-`:91`·dispatch 键 `:124`→`:152`；interview.service.ts begin 入队点 `:283`→`:283`-`:294`（try/catch 包裹·enqueue 调用 `:285`）·turn 入队点 `:454`→`:464`-`:473`（`:466`）——§0.1 锚行号对起草树维持原值记账（读数登记零冲销）·现树锚以本字段为准。

**字段⑥ 偏离清单**：①证明件 fixture 工艺两轮修正（臂面只增不减·零弱化）：neg-interview §10 初稿撞 `uq_interview_question_open`（同面试仅一开题·IV_ACT 开题被既有臂占用）→改独立面试 IV_BPT；再补 `resume_id` 绑定（enqueue parent 门 v64 要求·turn 无 begin 绑定面）+0126 `assert_interview_answer_legacy_plaintext_allowed` 窄复刻 stub（shadow schema 无 `interview_answer_artifact` 面→空集恒放行分支=真实函数同语义·生产 turn payload 恒含 answer 键须过此函数方达 enqueue——既有臂全在 enqueue 前拒故此前从未暴露）；worker 面 fixture 补 start 先行（0064 `interview_job_v64_parent_resume_mismatch` 触发器=answer 须有同面试 start 前置·沿生产链形）。每轮修正后改前红链按最终 fixture 重取（非沿用旧 fixture 红充数）。②worktree `node_modules` 缺席（起草席 docs-only 未装）→`pnpm install --frozen-lockfile` 环境准备（lockfile 零字节变亲证·门8）。③三次隔离 runner 首跑 `isolated_postgres_database_not_ready:boot` 红停→根因=worktree 未装依赖致宿主探针 `ERR_MODULE_NOT_FOUND`（非容器/镜像故障·手动复刻同镜像 3 秒就绪亲证）→②解决后 EXIT=0——红停未绕门·沿 fail-loud。④其余零偏离（修法实质逐字落笔·六裁决值逐件落码·§3 边界全守住·SSOT 行本体零触·quiz/diagnosis 零触·消费侧语义零触）。

**字段⑦ pins 零翻声明**：§5 pins 十一值逐字零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·脚注 actualSpendCny=null）；est live=0 兑现（门1/2/3 隔离容器·其余离线静态/进程内·零模型外呼·零生产操作·零 secrets 读用·零消耗）；⛔push 未犯·⛔force push 未犯·⛔pull --rebase 未犯·#117+#5 行翻面与 LEDGER/checklist 翻面权归协调方（本卷零代行）。

### §9-B STOP 翻面

三处权威 STOP（①卷头标题行+②Status 行+③本节 §8）`draft:awaiting_pre_exec_dual`→**`executed:awaiting_post_prove_dual`**（§0-§8 叙事原文不洗·append+勘正注形·卷尾行不载值沿三处锚定制）——post-prove 双审归后继席（两独立外席·alone≠dual）·⛔push ⛔merge 主线 ⛔force push。

---

*QUEUE-ENQUEUE-BP REQUEST · 2026-10-16 起草 · 状态值见卷头（本卷尾行不另载·三处锚定制）· ⛔push ⛔merge 主线 · alone≠dual · base `feat/mysql-schema-skeleton` @`3cd159dd`（=fetch 后 origin tip 恰等派单下界）· worktree `meetwise-q2b` · branch `line/queue-enqueue-bp`（建前零同名树/同名分支/同名卷三查亲证）· 立项出处=协调方派单令+5C-QUEUE 诊断席定谳+LEDGER `:87` 组标签+extreview SOP `:41`+checklist `:2624`/`:3204`+issues-master 仓外待补（沿 Q1 同款）· 诊断四项=调用链全图（`:283` start 臂扣费前置同事务/`:454` answer 臂零扣费两臂不对称勘误）+零背压闸正身+容量约束普查（inflight cap interview 有 quiz/diagnosis 无+退避时闸+租约面）+无界性三面+背压维度候选表 · 三案并陈=案A 深度上限（推荐·定稿形·五设计点）+案B 速率闸（备选框架）+案C 租约占用率闸（降级信号·否弃论证）· 裁决项六件全 EXEC 前置（rev P2-3 五→六）· 门矩阵=docs:check+markers proof+diff 面三绿（docs-only·起草 receipts 原值记账·rev 复跑 receipts 见 §9 rev 摘要）· 迁移号=零 · est live=0 · pins 十一值照抄 · markers=0 · 停止条件四类全设 · Ban self-approve · pre-exec dual ≠ 开工 · STOP*
