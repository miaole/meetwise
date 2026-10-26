# MOP01 REQUEST — GAP-MOP-01 `:74` + BUG-NOTIFY-REC `:101` 合并侦察起草卷·缺口收口最小面（一行一 case·零 invent covered·零 live key）·docs-only·PG LISTEN retained·STOP=closed

**Status**: **`closed`**（2026-10-26 协调方收官翻面·post-prove 双审两外席会签=席1 两具名 case 独立亲跑 EXIT=0+receipt+门四项·席2 P2×2 零 P0/P1·判词面=侦察起草卷落主线 PR #134 merge `f2ad7ee2c` 对 HEAD `git merge-base --is-ancestor` 祖先亲证 EXIT=0·`gap-bug-backlog.md:74`/`:101` 两行 OPEN 值不动（行翻面权归协调方·本卷只收官不翻行）·§9-post 同卷——前值 **`executed:awaiting_post_prove_dual`** 史录保留：EXEC 行使落卷即停·两具名 case 行使回执=§9-EXEC·alone≠dual·零 coding 零模型外呼零 Key 加载·零 SSOT 行改动·Ban self-approve·Ban self-nail `post_prove_dual_pass`）

**席位**：GAP-MOP-01/BUG-NOTIFY-REC 合并侦察起草（侦察+起草双责·派单 brief 授权·残余队列 Phase 5 MOP 行）。
**基线**：`origin/main` @ `38f6e7d78`（`38f6e7d78d29b263b29b43e5fc3fae2a8e3f591d`·fetch 后 origin tip 同指亲证·`git rev-parse origin/main` 亲跑）· 分支 `line/mop01-draft`（建前 `git branch --list "line/mop01*"` 恰 1 命中=`line/mop01-knife` 旧立卷线·非本席·本席分支恰增 1）· 工作树 `../meetwise-mop01`（`git worktree add ../meetwise-mop01 -b line/mop01-draft origin/main` 亲立·HEAD 落 `38f6e7d78` 亲证）。
**必读清单（pre-exec 双审逐件亲读·显式路径）**：`ai-docs/delivery/gap-bug-backlog.md`（`:74` GAP-MOP-01 行 + `:84` MOP01 立卷登记注 + `:101` BUG-NOTIFY-REC 行 + `:20` INFLIGHT:redis-wakeup-wip 行·只读）→ `ai-docs/delivery/harness/gap-mop-01-wakeup-notify-rec.md`（2026-10-07 立卷卷·§2a 诚实清单+§2b 切流包内容定义·本卷全部沿承不重复立法）→ `ai-docs/delivery/harness/redis-streams-wakeup.prototype.md`（wakeup 旁路原型 harness·CMD 表）→ `ai-docs/delivery/m3-redis-wakeup-prototype.md`（原型交付说明）→ `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（`:37-38` Phase 5 MOP 队列行·只读）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（`:214` REDIS-WAKEUP 行·只读）→ `ai-docs/delivery/harness/reconcile-retry-REQUEST.md`（§0-§8 形制范本）→ 涉事码面 `packages/db/src/jobs/worker-job-wakeup.ts`/`apps/worker/src/job-wakeup-listener.ts`/`apps/worker/src/worker-job-wakeup-redis.ts`/`apps/worker/src/main.ts`/`apps/worker/src/drain-loop.ts`/`packages/db/migrations/0084_worker_job_wakeup_notifications.sql`/`packages/db/migrations/0133_job_route_pending_worker_wakeup.sql`/两 prove/conn-stack proof。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①backlog `:74` GAP-MOP-01 行（P0·OPEN·「切流须 wakeup prove + 周期 reconcile；本绿 ≠ 已迁」）；②backlog `:101` BUG-NOTIFY-REC 行（P0·OPEN·「reconcile 未在 sole stack 证明 → 漏唤醒窗口」·处方「Redis Streams hint + **强制** periodic reconcile」）；③backlog `:84` MOP01 立卷登记注（「GAP-MOP-01 / BUG-NOTIFY-REC 保持 OPEN——立卷≠关闭」·「真实 Redis cutover 须未来授权 REQUEST 同过 MOP03 六门 + 本立卷切流包内容」·Ban Redis cutover / Ban MODEL-OP closed / Ban 两头漂移）；④残余队列 `:37-38` Phase 5 MOP 行（「GAP-MOP-01/BUG-NOTIFY-REC · GAP-MOP-02 claim」——GAP-MOP-02 claim 本卷**不认领**·独立行另刀）；⑤派单 brief（合并侦察起草·修法=缺口收口最小面·一行一 case·零 invent covered·零 live key·STOP=draft）；⑥结构范本=出处必读清单各卷。

## §0 现状锚（亲读亲算 @`38f6e7d78`·file:line+blob 逐条 rg/sed/Read/`git hash-object` 实测·**pre-exec/EXEC 照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **29** 树实测（多席并飞·树数漂移为常态；不变式=恰一 `line/mop01-draft` 树·本席亲证唯一）；`git branch --list "line/mop01*"` 恰 2 命中=`line/mop01-knife`（旧立卷线·tip `b95313a9f`·非 origin/main 祖先·内容已随并线入主线）+ `line/mop01-draft`（本席）。
- `ls ai-docs/delivery/harness/ | grep mop01-REQUEST` 建前**零命中**→落卷后唯一同名卷=本卷；同名近邻 `gap-mop-01-wakeup-notify-rec.md` 为 2026-10-07 立卷卷（executed 形态·本卷沿承其§2b 不重复立法）。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷 docs-only 零产品触面·唯一落件=本卷 .md；届时若任一在飞分支已存在同名卷或对 `:74`/`:101` 两行有翻面动→触停止条件「现场漂移」停手上报。
- 本卷**零产品码改动·零注册行改动·零迁移**——`package.json`/`apps/worker/package.json`/migrations 全部只读引用。

### 0.1 blob 锚表（`git hash-object` 亲算 @`38f6e7d78`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `packages/db/src/jobs/worker-job-wakeup.ts` | `7a46fc9b`（35 行） | **`:1-12` 头注「lossy, commit-delivered hint only…Production still uses LISTEN/NOTIFY until an independent cutover is approved…defaults off (0)」（`:74`/`:101` 语义自证面）·`:15-16` channel=`meetwise_worker_wakeup_v1`/payload=`wake`·`:18-23` Redis stream/group/field 常量（「Not production cutover」原注）·`:30-35` notifyWorkerJobWakeup=pg_notify 固定 wake** |
| `apps/worker/src/job-wakeup-listener.ts` | `fc18131d`（157 行） | **`:1-7` 头注「deliberately lossy, broadcast hints…periodic reconciliation covers every disconnect and missed-notification window」·`:108` LISTEN·`:110-114` LISTEN 先于 reconcile+连上即 onWake（漏窗收口注释原句）·`:126-127` ready()/snapshot()** |
| `apps/worker/src/worker-job-wakeup-redis.ts` | `5432cb17`（202 行） | **`:1-12` 头注 HARD 门「Does not replace or disable the production PostgreSQL LISTEN / pg_notify path…defaults off (0)…zero behavior change」·`:21-22` 两 env 名·`:49-53` flag gate（仅 `'1'/'true'/'on'` 显式真值开）·`:70-83` XADD MAXLEN~1000·`:85-97` BUSYGROUP 幂等建组·`:107-135` XREADGROUP 消费+ACK·`:152-157` flag 关=no-op listener** |
| `apps/worker/src/main.ts` | `03bca620`（871 行） | **`:505-509` bounded scan 注释+`WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5s（界 1s..60s）·`:680-689` PG listener 无条件启动+wake 五 loop（report/interview/quiz/diagnosis/routeClassify）·`:690-719` Redis additive 接线（`:698` URL 缺失→skip 且 PG 不动·`:713` enabled 日志「additive; PG LISTEN still active」·`:715-716` 连接失败→PG only）·`:787` readiness 要求 jobWakeupListener.ready()·`:853-855` 停机序·`:868` 启动日志「bounded reconciliation」** |
| `apps/worker/src/drain-loop.ts` | `5e5e2cb3`（247 行） | **`:9-10` wake() 边沿合并不重叠 tick 不携作业数据·`:97-99` interval 臂 `setTimeout(finish, intervalMs)`·`:130` 无通知也按 intervalMs 兜底 tick（waitForWakeOrInterval）——「既有周期兜底扫描实存」的代码载体** |
| `apps/worker/src/model-invocation-reconcile.ts` | `7877f309`（145 行） | **`:142` 30s cadence 缺省（Q4 reconciler 周期臂·经 runDrainLoop）** |
| `apps/worker/src/usage-calibration-reconcile.ts` | `707272a4`（115 行） | **Q5 臂=缺省停/启用 1d（§9-rev3 P1-1 改写）：`USAGE_CALIBRATION_ENABLED` 缺省 false（`:66-73` resolve）→`main.ts:736-738` 不起循环；启用时经 runDrainLoop 周期臂·间隔经旋钮缺省 `86_400_000`=1d（`:46-48` 缺省/下界/上界）；60s 仅 `:113-114` 函数签名缺省参·生产接线从不使用（`main.ts:737-738` 条件起·`:738` 显式传旋钮值）——AG-07（`0fca36548`·立卷基线后落地）语义变更·§0.3 第 3 条漂移登记** |
| `apps/worker/test/job-wakeup-listener.proof.ts` | `bd1f4223`（83 行） | **`:47` LISTEN 成功后立即请求一次 reconcile·`:51` 错 channel/payload 不唤醒·`:56` 断线重连并 reconcile·`:62` stop 后迟到通知不唤醒·`:76-78` 对 0084 四触发器+固定 payload 静态钉（`worker-wakeup:prove` 旧 CMD 的主体·「与 prove 断言一致」≠「触发器行为已证」）** |
| `apps/worker/test/worker-job-wakeup-redis.proof.ts` | `2d85181c`（68 行） | **`:26-28` flag 默认关/`0`关/`1`开·`:30` 缺省 `redis://127.0.0.1:63809`（本地夹具·零凭据）·`:35-48` 本地发/收一条 wake·`:63`「PG LISTEN path not exercised/disabled」** |
| `scripts/mysql-stack.redis-wakeup.proof.mjs` | `d05f44db`（10 行） | **conn-stack forwarder 头注「NEVER LIVE · NEVER prove-shell · NEVER covered · releaseEvidence=false · 连通绿 ≠ E2E」** |
| `scripts/conn-stack/mysql-stack.redis-wakeup.proof.mjs` | `ed736bd4`（201 行） | **`:27` CANONICAL_CMD=`pnpm worker-wakeup-redis:prove`·`:28` REDIS_PORT=63809（`:18-25` 系路径常量行）·静态钉 harness/module/listener/main/常量/liveProof/两 package.json 路径存在面** |
| `packages/db/migrations/0084_worker_job_wakeup_notifications.sql` | `9eb6fe38`（48 行） | **`:2-4` 头注「NOTIFY is deliberately not a durable queue: listener reconnect/reconciliation remains mandatory」·`:14` pg_notify 固定 wake·`:23/:30/:37/:44` interview_job/quiz_job/diagnosis_job/ai_report 四 queued 触发器** |
| `packages/db/migrations/0133_job_route_pending_worker_wakeup.sql` | `9380e6f9`（33 行） | **`:12-20` route_pending 触发函数+pg_notify 固定 wake·`:28-33` job_semantic_revision 触发器** |
| `ai-docs/delivery/gap-bug-backlog.md` | `7ede9fb7`（936 行） | **`:74` GAP-MOP-01 行（P0·OPEN）·`:84` MOP01 立卷登记注（OPEN 保持+Ban 两头漂移+Ban Redis cutover+Ban MODEL-OP closed）·`:101` BUG-NOTIFY-REC 行（P0·OPEN）·`:20` INFLIGHT:redis-wakeup-wip 行**（本卷零改·翻面权归协调方） |
| `ai-docs/delivery/harness/gap-mop-01-wakeup-notify-rec.md` | `81003646`（143 行） | **立卷卷（executed 形态）·§2a 诚实清单（lossy hint·既有周期兜底扫描实存→漏唤醒=有界延迟窗·强制 periodic reconcile 未在 sole stack 证明）·§2b 切流包内容定义五件（flag 审后开/保留 reconcile/wakeup prove/旧 prove 处置/本绿≠已迁）** |
| `ai-docs/delivery/harness/redis-streams-wakeup.prototype.md` | `c521a103`（42 行） | **CMD 表 `pnpm worker-wakeup-redis:prove` 期望 EXIT=0·非目标「Q4 双 reconciler 门仍挡切流·不自批 cutover」** |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `788423b1`（519 行） | **`:214` REDIS-WAKEUP 行=`partial`（「flag 默认关；≠ 生产切流；GAP-MOP-01」）·`:488` Line AN-MOP-Q45 GAP-MOP-03 nail 行（Q4/Q5 EXIT 0/0 口径·GAP-MOP-03 stays OPEN·Ban Redis cutover）**（零改） |
| `package.json` | `5bdf3111`（692 行） | **`:486` `drain:prove`→worker `prove:drain`·`:498` `worker-wakeup:prove`（旧）→worker `prove:job-wakeup`·`:613` `worker-wakeup-redis:prove`→conn-stack forwarder** |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `87c812d9`（54 行） | **`:37-38` Phase 5 MOP 队列行（GAP-MOP-01/BUG-NOTIFY-REC·GAP-MOP-02 claim）** |

### 0.2 派单 brief 核实登记（结论零变·如实精化）

1. brief「先验未闭」——**核实成立**：`:74`/`:101` 两行 OPEN 原文逐字在卷（§0.1 行 14 锚）；矩阵 `:214` REDIS-WAKEUP=`partial` 无翻面；`:84` 立卷注明文「保持 OPEN——立卷≠关闭」→ 本卷按侦察起草继续·非翻面候选。
2. brief「两缺口语义（model-op 通知记录面）」——**核实成立且同域**：两行 owner 列均=model-op；语义链同一（§1）——生产通知面=PG LISTEN/NOTIFY lossy hint（`worker-job-wakeup.ts:1-12` 自证）·Streams 侧=flag 关 additive 原型（`worker-job-wakeup-redis.ts:1-12` HARD 门自证）·兜底面=周期 reconcile 实存但 sole stack 证明缺（`gap-mop-01-wakeup-notify-rec.md` §2a 口径沿承）。
3. brief「一行一 case」——**落实为 §1-修法件①②**：每行恰一具名 case（行 evidence-cell 原文为据·零新增注册行·零新造 CMD）。
4. brief「零 live key」——**核实可达**：两具名 case 全部 conn-only/确定性/本地夹具（`:63809` 本地 compose·零凭据·worker-job-wakeup-redis.proof `:30` 缺省 URL 即本地）；本卷 est live=0·零 `.env*`·零 Key 值入树入据。

### 0.3 行号漂移登记（append-only 口径沿立卷 OB-1 先例）

- BUG-NOTIFY-REC 行：立卷基线（2026-10-07 @`4804c3dc`）`:95` → 本基线 `:101`（+6 漂移·同一行条目·立卷登记注 `:84` 所引 `:95` 为彼时行号）——pre-exec/EXEC 引用一律按届时 backlog 实测行号·Ban 按旧号寻行。
- 立卷 §2a 所引码面行号（旧基线：`main.ts:641-642/:646-648/:458-461/:462`·`drain-loop.ts:14/:31/:52`·`usage-calibration-reconcile.ts:63` 等）在本基线已漂移——本卷 §0.1 以 `38f6e7d78` 重钉为准（结论不变仅行号移：bounded scan 注释现 `main.ts:505-509`·interval 臂现 `drain-loop.ts:97-99`/`:130`·Q5 周期臂现 `usage-calibration-reconcile.ts:113-114`）。
- AG-07 语义变更（§9-rev3 P1-1 补登·「行号移只更锚·语义变即停」之语义变如实登记例）：Q5 周期臂在立卷基线（2026-10-07 @`4804c3dc`）为活缺省 60s——彼时 `main.ts:680` 无参调用 `runUsageCalibrationReconciler(pool)`（届树亲证）；本基线（`38f6e7d78`）AG-07（`0fca36548`·`merge-base --is-ancestor` 亲证=本基线祖先·非 `4804c3dc` 祖先=立卷基线后落地）以 env 双旋钮取代 60s 硬编码：`USAGE_CALIBRATION_ENABLED` 缺省 false→不起循环（`main.ts:736-738`）·启用经 `USAGE_CALIBRATION_INTERVAL_MS` 缺省 `86_400_000`=1d（`usage-calibration-reconcile.ts:46-48`）·60s 降级为 `:113-114` 函数签名缺省参（生产接线 `main.ts:738` 显式传旋钮值·从不触达）——rev2 及前文「Q5 缺省 60s 周期臂」系未计入 AG-07 的事实错误·§0.1 行 7+§1.2 周期兜底 bullet 已随 P1-1 改写；结论面不变（周期兜底实存=drain-loop 5s bounded scan 主承载·「漏唤醒=有界延迟窗」口径零移·两行 OPEN 语义零移）。

## §1 红事实（两缺口合并机制链·全部亲证 @`38f6e7d78`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 生产通知面（谁发/谁听）

- **发**：DB 触发器 4+1（0084 对 interview_job/quiz_job/diagnosis_job/ai_report 的 queued transition `:23/:30/:37/:44` + 0133 对 job_semantic_revision route_pending `:28-33`）经 `pg_notify('meetwise_worker_wakeup_v1','wake')`（0084 `:14`·0133 `:20`）；api 侧组合根 `notifyWorkerJobWakeup`（`recruiter.service.ts:33/:65/:94`·创建/重试 job 后补发）。
- **听**：worker 组合根无条件启动专用 LISTEN session（`main.ts:680-689`·独占连接 max=1·wake 边沿合流到五 consumer loop）——重连退避/LISTEN 先于 reconcile/迟到通知不唤醒由 `job-wakeup-listener.ts` 承载·deterministic prove 在卷（`bd1f4223`）。
- **语义**：lossy、commit-delivered hint only·不携 owner/job/user/PII（`worker-job-wakeup.ts:1-4`·0084 `:2-4`「listener reconnect/reconciliation remains mandatory」）——即 `:74`「Q1」与 `:101`「lossy NOTIFY」的代码自证面。

### 1.2 既有兜底/prove 面（「既有周期兜底扫描实存」的实现与旁证）

- **周期兜底**：drain-loop interval 臂（`drain-loop.ts:97-99`/`:130`）——零通知也按 `WORKER_JOB_RECONCILE_INTERVAL_MS`（默认 5s·界 1s..60s·`main.ts:505-509`）周期 tick 认领；listener 断连窗口由同周期覆盖（`job-wakeup-listener.ts:1-7` 头注自证）；双 reconciler 周期臂=Q4 30s（`main.ts:727` 无条件起·`model-invocation-reconcile.ts:142` 缺省参）·Q5 缺省停/启用 1d（`USAGE_CALIBRATION_ENABLED` 缺省 false→`main.ts:736-738` 不起循环·启用经旋钮缺省 `86_400_000`=1d——AG-07 `0fca36548` 取代 60s 硬编码·§0.3 第 3 条·§9-rev3 P1-1）；readiness 挂钩 `main.ts:787`（listener 连败翻假·不假健康）。
- **确定性旁证在卷**：`pnpm drain:prove`（`package.json:486`·drain-loop 周期/看门狗/合流确定性 prove）——**旁证≠sole stack 证明**：`:101` 缺的是「强制 periodic reconcile 在 sole stack（迁栈后栈面）的证明路径」，in-repo PG 侧确定性 prove 不能代答（未证明 ≠ 不存在·两头都 Ban·`:84` 原文）。
- **Streams 旁路**：flag 关 additive 原型全套在树（§0.1 行 3/4/9/10/15 锚）·`pnpm worker-wakeup-redis:prove` conn-only EXIT=0 形在 harness CMD 表（`c521a103`）·矩阵 `:214`=`partial`。——**判据边界注（§9-rev R2）**：`publishWorkerJobWakeup` 全仓零生产调用方（`worker-job-wakeup-redis.ts:70` 导出·唯一调用方=redis proof `:38`）·生产 Streams 面仅消费侧接线（`main.ts:690-719`）·发布面属切流包未来交付物 · prove 用 `:prove` 后缀流/组非生产拓扑（proof `:31-32`）· 无断连窗持久性断言——防未来切流 REQUEST 读窄「唯一主判据」（§1-修法件① 同注）。
- **双 reconciler prove**：Q4 `pnpm model-invocation-reconcile:prove` + Q5 `pnpm model-op00-usage-reconciler:prove` 同 SHA EXIT 0/0 口径已由 Line AN-MOP-Q45 nail（矩阵 `:488`）建立——但该 nail 明文 GAP-MOP-03 stays OPEN·Ban Redis cutover；**「双 reconciler prove EXIT 0/0」≠「`:101` 已闭」**。**判据边界注（§9-rev3 P2-2·R2 同型·件② 同文）**：两 prove 均 tick/域级直接调用——Q4=`modelInvocationReconcileTick` 直调（proof `:378` 起）·Q5=域函数 `reconcileUsageCalibration` 直调（proof `:134` 起）·不启进程·不经 runDrainLoop 周期臂——「同 SHA EXIT 0/0」证 tick/域级语义+隔离 PG 真实性·不证周期臂真触发·不证 sole stack 接线。

### 1.3 缺口语义分解与否决（本节=否决裁决·五臂全否·唯存活面=本卷 docs 起草）

- **(a) 现在切流/开 flag——否决**：`worker-job-wakeup-redis.ts:1-12` HARD 门+`:84`「真实 Redis cutover 须未来授权 REQUEST 同过 MOP03 六门 + 本立卷切流包内容」+ 矩阵 `:488` Ban Redis cutover——flag 开启动作=cutover 本体（立卷 §2b-1 原文）·本卷零 flag 操作。
- **(b) 宣称已闭/发明 covered——否决**：两行 OPEN 保持；「本绿 ≠ 已迁」（`:74` 原文）·conn-only 绿 ≠ E2E（forwarder `d05f44db` 头注）·prove 绿 ≠ 行闭（全仓口径）——矩阵/backlog 零改·翻面权归协调方。
- **(c) 借机实现 reconciler/触 GAP-MOP-03 域——否决**：reconciler 实现/接线属 GAP-MOP-03 域（立卷 §2b-2「本刀只钉 wakeup 侧须『保留』·不认领 reconciler 实现」）·Q4/Q5 已有 nail 口径·本卷零实现零重跑。
- **(d) live key/真实凭据——否决**：两具名 case 全 conn-only/本地/确定性（§0.2-4）——Ban `.env*`·Ban 任何 Key 值入树·Ban 对生产 Redis/PG 的真外呼。
- **(e) 提前标红旧 `worker-wakeup:prove`——否决**：`:74`/`:101` 处方原文均系「（迁栈）后标红」——迁栈动作属未来切流包；现在标红=自造红·现在摘除=触生产路径·两向皆越界（旧 prove 现状绿且其静态钉与 0084 现树恒等·本卷零改）。
- **唯存活面**：docs-only 合并侦察起草（本卷）——把两行语义、码面锚、行→case 映射与随包义务清单在现 tip 钉定为 draft·交 pre-exec 双审与协调方裁 EXEC。

## §1-修法（缺口收口最小面·一行一 case·docs-only 零行为变更）

- **件①（GAP-MOP-01 `:74` → 恰一 case）**：wakeup 切流 case = **`pnpm worker-wakeup-redis:prove`**（harness `redis-streams-wakeup.prototype.md` CMD 表同名行·conn-stack forwarder 承载·静态钉+本地 `:63809` 发/收一条 wake·零凭据）——未来授权切流 REQUEST 的 evidence-cell 具名 wakeup 侧主判据**候选** case（conn-only 形）。**行使前置（§9-rev R3）**：须 `docker compose -f docker/compose.mysql-local.yml up -d redis`——`:63809` 为 **Redis**（勘误派单 brief「`:63809` PG」误标·compose `:30` `63809:6379` 亲证）·EXEC 期容器依赖预登。随包义务（沿承 §2b-1/-2/-4/-5 四件·本卷不执行）：flag `MEETWISE_WAKEUP_REDIS_STREAMS` 审后开 · 保留 reconcile · 旧 `worker-wakeup:prove` 标红或换夹具 · 「本绿 ≠ 已迁」随包输出 · **第五件（§2b-3·补于 §9-rev R1）**：切流 wakeup prove 仍属未来授权 REQUEST 自带（立卷 §5「不命名·不授权」沿承）——本件=行→case 映射钉定，非其替代、非排他。**判据边界注（§9-rev R2）**：`publishWorkerJobWakeup` 全仓零生产调用方·生产 Streams 面仅消费侧接线 `main.ts:690-719`·发布面属切流包未来交付物·prove 用 `:prove` 后缀流/组非生产拓扑·无断连窗持久性断言（§1.2 同注详）；本 case 仅 helper 级发/收（`publishWorkerJobWakeup`+`consumeWorkerJobWakeupOnce`·redis proof `:38`/`:41` 亲证）·不行使生产消费循环 `startWorkerJobWakeupRedisListener`（`main.ts:690-719`）（§9-rev3 P2-3 补句）——防未来切流 REQUEST 读窄「唯一主判据」。
- **件②（BUG-NOTIFY-REC `:101` → 恰一 case）**：双 reconciler prove case = **Q4 `pnpm model-invocation-reconcile:prove` + Q5 `pnpm model-op00-usage-reconciler:prove` 同 SHA EXIT 0/0**（一行一 case·双半同门·沿矩阵 `:488` nail 口径）——该行 evidence-cell 具名 case。**行使前置（§9-rev R4）**：须隔离 PG runner（`assertIsolatedTestTarget` 容器 nonce·零模型 Key）。随包义务：**强制** periodic reconcile 在 sole stack 的证明路径（立卷 §2b-2 沿承·实现属 GAP-MOP-03 域·本卷零实现）。现状旁证（非关闭依据）：`pnpm drain:prove` 周期臂确定性 prove+`main.ts:505-509` bounded scan+listener proof `:110-114`——漏唤醒=有界延迟窗实存·「未证明 ≠ 不存在」两侧均 Ban（`:84` Ban 两头漂移逐字沿承）。**判据边界注（§9-rev3 P2-2·R2 同型）**：两 prove 均 tick/域级直接调用——Q4=直接 `modelInvocationReconcileTick` 调用（`apps/worker/test/model-invocation-reconcile.proof.ts:378` 起·亲证）·Q5=域函数 `reconcileUsageCalibration` 直接调用（`packages/ai-runtime/test/usage-calibration-reconciler.proof.ts:134` 起·亲证）——不启进程·不经 `runDrainLoop` 周期臂；「同 SHA EXIT 0/0」证 tick/域级语义+隔离 PG 真实性·**不证周期臂真触发、不证 sole stack 接线**——R2 同型注补齐·消解件①/件② 判据边界注不对称。
- **件③（本卷自身=侦察交付）**：两行语义合并登记（§1）+ 19 件码面/doc 锚 blob 重钉（§0.1）+ 行号漂移登记（§0.3）+ 否决清单（§1.3）。
- **零 invent covered**：两行 OPEN 不动·REDIS-WAKEUP=`partial` 不动·coveredCount 口径零触·任何 case 映射都**不**写成 covered/已闭——映射只回答「届时拿哪条 CMD 验哪行」·不回答「已验」。
- **零 live key**：全卷零 `.env*`·零凭据·零生产外呼·est live=0（§6）。

## §2 验收断言（pre-exec 双审核对单基面·docs-only 门矩阵·**数字口径以届树实跑实测为准**）

1. **先验未闭复核**：届时 backlog `:74`/`:101` 两行仍 OPEN（任一行翻面→本卷作废停报·翻面候选移交协调方）；矩阵 REDIS-WAKEUP 仍 partial。
2. **锚重 pin**：对届时 tip 全量重算 §0.1（行号漂移如实改锚·结论不变只更行号·blob 漂移且语义受疑→触停止条件「现场漂移」）。
3. **diff 面机检**：`git diff --numstat <base>` 恰 **1** tracked 路径=本卷 `ai-docs/delivery/harness/mop01-REQUEST.md`——多任何 tracked 路径即停（越界需要类）。
4. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·届树实测受管文件数 ≤ cap **2354**（`public-text-policy.mjs:110` sanction 口径·基线 2343 本树亲跑·本卷 +1 预期 2344·>2354 红停上报·cap 上抬权归协调方）。
5. **markers 五类零命中**：本卷 .md 五类标记词 grep 零命中（词族沿 i6-239 门口径·词面不复抄卷内防自指·命令与回执随 pre-exec 留痕）。
6. **零 SSOT 零码面**：`git diff --name-only <base>` 对 backlog/matrix/queue/package.json/migrations/src 全零触（件①②为卷内钉定·不落注册行不改码）。
7. **est live=0 复核**：零实跑零模型外呼零 Key 加载（起草 turn 同·§6 承）。
8. **卫生**：`pnpm install --frozen-lockfile`（若双审要求）EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录。

## §3 范围外（边界清单·越界即 FAIL）

1. 零产品码零注册行零迁移零 SSOT 改（§2-6 机检面）。
2. 零 flag 操作·零标红/换夹具执行·零 reconcile 实现（§1.3 (a)(c)(e) 否决沿承）。
3. 零 prove 执行（本卷零 `pnpm *:prove` 实跑义务——所有 CMD 引用均为「届时判据钉定」非「本卷已验」）。
4. GAP-MOP-02 claim 不认领（队列 `:38` 同行另一项·独立行另刀）·GAP-MOP-03 域零触。
5. 立卷卷 `gap-mop-01-wakeup-notify-rec.md` 零改（append-only 归其自身链）。

## §4 依赖

**①上游已满足**：立卷卷（`:84` 登记·切流包内容五件已立法）·Streams 原型全套在树（flag 关）·两 prove+conn-stack forwarder+harness CMD 表在树·双 reconciler nail 口径在矩阵 `:488`。**②无同文件并发**：唯一落件=本卷新文件·§0.0 在飞复核规则 EXEC 日必做。**③下游**：未来授权 wakeup 切流 REQUEST（须同过 MOP03 六门+立卷切流包内容+本卷件①② case 判据）·两行翻面权归协调方。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban self-approve（pre-exec 双审两独立外席·alone≠dual）；Ban Redis cutover/flag 开启（§1.3-a）；Ban MODEL-OP closed claim（`:84` 沿承）；Ban 两头漂移——既不许写「已修复/无窗口」也不许宣称既有扫描可闭 `:101`（`:84` 原文）；Ban invent covered/CLOSED（§1.3-b）；Ban 触 GAP-MOP-03 reconciler 域（§1.3-c）；Ban `.env*`/Key 值入树入据/live 外呼（§1.3-d）；Ban 提前标红或摘除旧 `worker-wakeup:prove`（§1.3-e）；Ban 改共享 SSOT（backlog/matrix/queue 只读·翻面权归协调方）；Ban 新造 prove CMD/注册行（一行一 case 均用在卷 CMD）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（现新红→如实登记升级）。

**pins（零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（PG LISTEN 无条件保留·`main.ts:680-689`）· 公开 DELETE=503 · actualSpendCny=null · g7SuiteGreen=false · r1Closed=false。

## §6 est live=0（起草 turn·pre-exec/EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗；全部锚=静态亲读+`git hash-object`；全卷零 `.env*`。

## §7 markers=0（卫生声明）

本卷改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草亲核·回执随 pre-exec 留痕·五类词不复抄卷内防自匹配——沿卷族 §7 同形制）。

## §8 STOP

**STOP=closed（2026-10-26 收官翻面·协调方翻面权行使·三处同值：Status 头含 H1 短形/本节/§9-post·前值 `executed:awaiting_post_prove_dual` 史录保留见 §9-EXEC 与下文原句） · alone≠dual · 原执行期句史录：EXEC 行使已按协调方授权落卷（两具名 case 回执+门矩阵=§9-EXEC）· post-prove 双审两独立外席未签→已会签（§9-post）·Ban self-nail `post_prove_dual_pass`· 本 commit 不预 claim 任何后续 EXIT。** 开工三条款：①pre-exec 双审两独立外席 **BOTH PASS 落卷**；②协调方明示授权（committed SHA 重钉）；③立项不得改 §1.3 否决五臂与 §5 Ban/pins 与 §1-修法件①②③映射（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（§0.3 漂移登记法·行号移只更锚·语义变即停）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 `:74`/`:101` 任一行已翻面·或 §0.1 任一锚 blob 漂移且语义受疑（flag 门/PG 无条件保留/lossy 语义三锚变·harness CMD 表除名·forwarder 处置变）→停·重 pin 回炉。
- **机制不满足**：两行语义与本卷 §1 分解不符（如发现 flag 已默认开·或 PG listener 已非无条件启动）→诊断被证伪→停·如实升级协调方。
- **越界需要**：诉求超出 docs-only 恰 1 件落件（需动码/动注册行/动 SSOT/动 flag/动旧 prove）→停·另刀或协调方裁决（§1.3 五否决沿承）。
- **验收红不可修**：§2 任一门红且根因不在本卷交付面（docs:check>cap/markers 命中/外来 tracked 路径）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9-rev rev1 修订登记（pre-exec 双审第一轮两席收敛=席1 FAIL P1×1+席2 PASS P2×4·纯文面·逐条落点·append-only·落卷即停·STOP 维持 `draft:awaiting_pre_exec_dual`·回炉重派双审第二轮）

- **R1（P1·席1·件① 非替代声明）**：①「wakeup 侧唯一主判据 case」→「evidence-cell 具名 wakeup 侧主判据**候选** case（conn-only 形）」（落点：件① 判据句）；②随包义务补第五件「§2b-3 切流 wakeup prove 仍属未来授权 REQUEST 自带（立卷 §5『不命名·不授权』沿承）——本件=行→case 映射钉定，非其替代、非排他」（落点：件① 随包义务清单末·立卷 §2b-3「不命名不授权」+§5 计划表「不命名 · 不授权」两处原文亲证）；③「沿立卷 §2b 逐字沿承」→「沿承 §2b-1/-2/-4/-5 四件」（落点：件① 随包义务括注·原四清单项恰对应 §2b-1 flag 审后开/§2b-2 保留 reconcile/§2b-4 旧 prove 处置/§2b-5 本绿≠已迁）。修订实质：防未来切流 REQUEST 将本卷行→case 映射误读为对 §2b-3 prove 义务的替代或排他命名——prove 义务归属不因本卷映射而移转。
- **R2（P2-1·席2·判据边界注）**：补注 `publishWorkerJobWakeup` 全仓零生产调用方（`worker-job-wakeup-redis.ts:70` 导出·全仓唯一调用方=redis proof `:38`·rg 亲证）·生产 Streams 面仅消费侧接线 `main.ts:690-719` · 发布面属切流包未来交付物 · prove 用 `:prove` 后缀流/组非生产拓扑（proof `:31-32` 亲证）· 无断连窗持久性断言——防未来切流 REQUEST 读窄「唯一主判据」（落点：§1.2 Streams 旁路 bullet 末+件① 尾注·两处同文）。
- **R3（P2-2·席2·件① 行使前置）**：件① 加行使前置一行「须 `docker compose -f docker/compose.mysql-local.yml up -d redis`」——`:63809` 为 **Redis**（勘误派单 brief「`:63809` PG」误标·`docker/compose.mysql-local.yml:30` `63809:6379`+`:25-26` redis service 亲证）·EXEC 期容器依赖预登（落点：件① 行使前置句）。
- **R4（P2-3·席2·件② 行使前置）**：件② 加行使前置一行「须隔离 PG runner（`assertIsolatedTestTarget` 容器 nonce·零模型 Key）」（Q4 `model-invocation-reconcile.proof.ts:108`+Q5 `usage-calibration-reconciler.proof.ts:97` assertIsolatedTestTarget 亲证·隔离 runner 容器 nonce 形 `run-e2e-isolated.mjs:2766` 亲证）（落点：件② 行使前置句）。
- **R5（P2-4·席2·锚勘误三处）**：①§0.1 conn-stack 行锚 `:18`/`:19`→**`:27`/`:28`**（CANONICAL_CMD/REDIS_PORT 实位亲证·`:18-25` 系路径常量行）；②件③「20 件」→**19 件**（§0.1 表实数 19 行亲点）；③§0.2-1「行 13」→**行 14**（`gap-bug-backlog.md` 在 §0.1 表第 14 行）。
- **门复跑（rev 落卷 turn·本席亲跑）**：markers 五类标记词零命中（词面运行时组装防自指·沿 i6-239 门口径·命令与回执随双审留痕）·docs:check EXIT=0 scanned **2344**≤cap **2354**（§2-4 口径·零新增受管文件）·diff 面恰 1 tracked=本卷 .md·est live=0·STOP 维持 `draft:awaiting_pre_exec_dual`·rev 后回炉重派 pre-exec 双审第二轮·翻面权归协调方。

## §9-rev2 rev2 修订登记（两席合并清单 rev 回路再落卷·rev2 席对届树逐位亲证·append 注记形·上文 §0-§8+§9-rev 零字洗·rev2 落卷 2026-10-26）

- **落卷形**：席1 FAIL P1×1+席2 PASS P2×4 两席合并清单 rev 回路再落卷——五件修订（R1-R5 同面）逐条届树亲证**全数已在卷**（body 落定笔=§9-rev rev1 @`667c2cb9a`·本笔逐位复验兑现·零新增文面修正·§0-§8+§9-rev 一字不洗·仅 append 本节登记逐条落点与门复跑回执）。rev2 后回炉重派 pre-exec 双审第二轮·alone≠dual·Ban self-approve。
- **rev2-1（席1 P1·件① 非替代声明三子项）**：①判据句已在卷=「未来授权切流 REQUEST 的 evidence-cell 具名 wakeup 侧主判据**候选** case（conn-only 形）」（落点：§1-修法件① 判据句·「候选」届树 `:81` 亲读·正文判据句零排他词面·「唯一主判据」仅存于判据边界注作防读窄对象与 rev 登记引文）；②随包义务第五件已在卷=「**第五件（§2b-3·补于 §9-rev R1）**：切流 wakeup prove 仍属未来授权 REQUEST 自带（立卷 §5「不命名·不授权」沿承）——本件=行→case 映射钉定，非其替代、非排他」（落点：件① 随包义务清单末）；③随包义务括注已在卷=「沿承 §2b-1/-2/-4/-5 四件·本卷不执行」四件式（落点：件① 括注·四清单项恰对 §2b-1 flag 审后开/§2b-2 保留 reconcile/§2b-4 旧 prove 处置/§2b-5 本绿≠已迁·第五件随清单末即「见上」之所在）。
- **rev2-2（席2 P2-1·判据边界注两处同文）**：§1.2 Streams 旁路 bullet 末+件① 尾注两处在卷——`publishWorkerJobWakeup` 全仓零生产调用方（rev2 届树 rg 亲证：`worker-job-wakeup-redis.ts:70` 导出·调用面仅 redis proof `:38`+conn-stack 静态钉 regex 字面 `:119` 非调用）·生产 Streams 面仅消费侧接线 `main.ts:690-719`（届树亲读=纯 listener 接线零 publish 触点）·发布面属切流包未来交付物·prove 用 `:prove` 后缀流/组非生产拓扑（proof `:31-32` 届树亲读）·无断连窗持久性断言——防未来切流 REQUEST 读窄「唯一主判据」（落点：§1.2 bullet 末+件① 尾注·两处同文）。
- **rev2-3（席2 P2-2·件① 行使前置）**：已在卷=「须 `docker compose -f docker/compose.mysql-local.yml up -d redis`」——`:63809` 为 **Redis**（rev2 届树亲证 compose `:25-26` redis service+`:30` `63809:6379`·勘误派单 brief「`:63809` PG」误标）（落点：件① 行使前置句）。
- **rev2-4（席2 P2-3·件② 行使前置）**：已在卷=「须隔离 PG runner（`assertIsolatedTestTarget` 容器 nonce·零模型 Key）」（rev2 届树亲证 Q4 `apps/worker/test/model-invocation-reconcile.proof.ts:108`+Q5 `packages/ai-runtime/test/usage-calibration-reconciler.proof.ts:97` 两处 `await assertIsolatedTestTarget(pool)`·Q5 路径全称补登=rev2 精化·行号与 rev1 R4 引用恰等）（落点：件② 行使前置句）。
- **rev2-5（席2 P2-4·锚勘误三处）**：①§0.1 conn-stack 行锚=`:27` CANONICAL_CMD=`pnpm worker-wakeup-redis:prove`/`:28` REDIS_PORT=63809（届树亲读恰等·`:18-25` 系路径常量行）；②件③=「19 件」（§0.1 表届树实数 19 行亲点）；③§0.2-1=「行 14」（§0.1 表第 14 行=`gap-bug-backlog.md` 行届树亲证）——三处全数兑现。
- **门复跑（rev2 落卷 turn·本席亲跑）**：markers 五类标记词零命中（词面运行时组装防自指·沿 i6-239/ha-4 门口径·命令与回执随双审留痕）·docs:check EXIT=0 scanned **2344**≤cap **2354**（§2-4 口径·本笔 append 零新增受管文件）·本笔工作树 diff 恰 1 tracked=本卷 .md（仅 §9-rev2 append）·est live=0（本 turn 零实跑零模型外呼零 Key 加载·锚=静态亲读+script grep）·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻（Status 头/§8/本节）·rev2 后回炉重派 pre-exec 双审第二轮·翻面权归协调方。

## §9-rev3 rev3 修订登记（rev2 后双审第二轮收敛=席1 PASS+席2 FAIL P1×1（Q5 周期臂事实错误）+P2×3→rev 回路·纯文面·逐条落点·append-only·落卷即停·STOP 维持 `draft:awaiting_pre_exec_dual`·rev3 后回炉重派双审第三轮·窄域=席2 P1 落点复验）

- **落卷形**：席2 第二轮 FAIL 清单（P1×1+P2×3）逐条落点落卷——P1-1 系 body 事实改写（本 rev 唯一正文修正面·其余 P2 为边界注 append）；§9-rev/§9-rev2 历史登记零字洗（届树口径沿承·本笔 §0.3 插行使 rev2 所引「届树 `:81`」现漂至 `:82`·历史登记按彼时届树读）。rev3 后回炉重派 pre-exec 双审第三轮·alone≠dual·Ban self-approve。
- **rev3-1（席2 P1-1·Q5 周期臂事实改写·body 修正）**：本基线 §0.1 行 7/§1.2「Q5 缺省 60s 周期臂」系事实错误——AG-07（`0fca36548`）已以 env 双旋钮取代 60s 硬编码（届树五件亲证：①`USAGE_CALIBRATION_ENABLED` 缺省 false=`usage-calibration-reconcile.ts:68`；②旋钮缺省/下界/上界=`86_400_000`/`60_000`/`604_800_000`=`:46-48`；③60s 仅 `:113-114` 函数签名缺省参；④Q4 无条件起=`main.ts:727`（`resolveModelInvocationReconcileConfig` 无 enabled 开关亲证）；⑤`merge-base --is-ancestor` 亲跑=`0fca36548`∈`38f6e7d78`·`0fca36548`∉`4804c3dc`→「立卷基线后落地」成立）→改写为「缺省 USAGE_CALIBRATION_ENABLED=false→`main.ts:736-738` 不起循环；启用时经旋钮缺省 `86_400_000`=1d；60s 仅函数签名缺省参·生产接线从不使用」（落点：§0.1 行 7+§1.2 周期兜底 bullet 两处）；机理=旧基线（`4804c3dc`）`main.ts:680` 无参调用彼时 60s 是活缺省（届树亲证）·现 `main.ts:737-738` 条件起·`:738` 显式传旋钮值（派单文面「`:737` 显式传旋钮值」届树复检=显式传参在 `:738`·`:737` 系 enabled 条件行→按亲证落 `:737-738`/`:738`）；§0.3 补漂移登记第 3 条（AG-07 语义变更如实登记·结论面不变·落点：§0.3 末条）。
- **rev3-2（席2 P2-2·件② R2 同型判据边界注）**：两 prove 均 tick/域级直接调用——Q4=直接 `modelInvocationReconcileTick` 调用（`apps/worker/test/model-invocation-reconcile.proof.ts:378` 起·亲证）·Q5=域函数 `reconcileUsageCalibration` 直接调用（`packages/ai-runtime/test/usage-calibration-reconciler.proof.ts:134` 起·亲证）——不启进程·不经 runDrainLoop 周期臂；「同 SHA EXIT 0/0」证 tick/域级语义+隔离 PG 真实性·**不证周期臂真触发、不证 sole stack 接线**（落点：件② 尾注+§1.2 双 reconciler prove bullet 末·两处同文=R2 同型）——消解件①/件② 判据边界注不对称。
- **rev3-3（席2 P2-3·件① 判据边界注补句）**：本 case 仅 helper 级发/收（`publishWorkerJobWakeup` proof `:38`+`consumeWorkerJobWakeupOnce` proof `:41` 亲证）·不行使生产消费循环 `startWorkerJobWakeupRedisListener`（`main.ts:690-719`）（落点：件① 判据边界注内·「无断连窗持久性断言」后）。
- **rev3-4（席2 P2-1「§0.1 表行 4 `:787`→`:786`」——复核不成立·驳回不落）**：届树逐位亲证 `jobWakeupListener.ready()` 在 `main.ts:787`（`grep -n`+`awk NR` 双证·`:786`=`&& routeClassifyLoop.ready()` 行）；`main.ts` blob=`03bca620`/871 行于 `38f6e7d78`/`909d6d7a9`/`origin/main` 三树同值（`git rev-parse` 亲跑·`38f6e7d78..origin/main` 五笔对 main.ts/usage-calibration-reconcile.ts 零 diff）；行 4 其余八锚（`:505-509`/`:680-689`/`:690-719`/`:698`/`:713`/`:715-716`/`:853-855`/`:868`）逐位复核全对→「`:787`→`:786`」系误报（疑零起算视口差）·锚维持 `:787` 零改——§2-2「锚以届树实测为准」+§5 Ban 伪造已验来源纪律优先于清单文面·本驳回随第三轮窄域复审交两外席裁断。
- **门复跑（rev3 落卷 turn·本席亲跑）**：markers 五类标记词零命中（词面运行时组装防自指·`scripts/i6-239-gates.proof.mjs:151-163` 同源·命令与回执随双审留痕）·docs:check EXIT=0 scanned **2344**≤cap **2354**（§2-4 口径·本笔改写+append 零新增受管文件）·本笔工作树 diff 恰 1 tracked=本卷 .md（§0.1 行 7+§1.2 两 bullet+§0.3 一条+件①② 尾注+本节 append）·est live=0（本 turn 零实跑零模型外呼零 Key 加载·锚=静态亲读+grep/awk/`git rev-parse`/`git merge-base`）·STOP 维持 `draft:awaiting_pre_exec_dual` 三处同值零翻（Status 头/§8/本节）·rev3 后回炉重派 pre-exec 双审第三轮·窄域=席2 P1（rev3-1）落点复验+rev3-4 驳回裁断·alone≠dual·Ban self-approve·翻面权归协调方。

## §9-EXEC EXEC 行使登记（pre-exec 双审双 PASS 放行·协调方授权 EXEC·两具名 case 行使+门矩阵八门亲跑·append-only·落卷即停·STOP 翻面 `executed:awaiting_post_prove_dual`·post-prove 双审未签·alone≠dual·Ban self-approve）

- **落卷形**：EXEC 席按 §1-修法件①② 行使两具名 case（行使前置容器依赖按 §9-rev R3/R4 预登兑现）+§2 门矩阵八门亲跑（EXIT 原值随卷）+STOP 三处翻面（Status 头/§8/本节）+commit。§0-§8+§9-rev/§9-rev2/§9-rev3 历史登记零字洗·仅 Status 头翻面+§8 STOP 值翻面+append 本节·届树基线=`d8ec6db5ce3e537093c5afb178a86fd117549664`（行使全程零产品码零注册行触面·Q4/Q5 两跑间 `git status --porcelain` 零条目=同 SHA 同树）。
- **件① 行使回执（EXIT 原值）**：行使前置亲跑——派单 CMD `docker compose -f docker/compose.mysql-local.yml up -d redis` 语义由 `docker-compose -f docker/compose.mysql-local.yml up -d redis` 承载（standalone 5.6.1·compose v2 插件本机缺位如实登记·同 `-f` 同 service 同语义）**EXIT=0**·容器 `meetwise-redis-mysql-local` Up·`:63809` PING=PONG 亲证（镜像 `redis:7-alpine` 因 VM 内 docker.io registry DNS 不可达·经 `docker.m.daocloud.io/library/redis:7-alpine` mirror 拉取后本地同 tag·compose 面零改·零卷面语义影响·环境依赖事实如实登记）；`pnpm worker-wakeup-redis:prove` 亲跑 **EXIT=0**（尾行 `CMD=pnpm worker-wakeup-redis:prove EXIT=0` 原值）——静态钉 28 断言全 PASS·`:63809` PING 经 docker exec fallback=PONG（host redis-cli ENOENT·脚本内建 fallback 如实登记）·live helper 臂 EXIT=0：flag 三态（缺省关/`0`关/`1`开）+XADD 一条 wake+XREADGROUP 恰一条消费+空 PEL 窗零重复+「PG LISTEN path not exercised/disabled」。**判据边界注随卷沿承**：本 case 仅 helper 级发/收非生产拓扑·evidence-cell 主判据**候选**非替代·§2b-3 不命名不授权沿承·「连通绿 ≠ E2E」随包。
- **件② 行使回执（EXIT 0/0 同 SHA 原值）**：Q4 `pnpm model-invocation-reconcile:prove` **EXIT=0**（隔离 PG runner·receipt `.tmp/isolated-proof-receipts/2026-10-26T12-13-34-732Z-60490-e9d017a2-9eb6-4539-aac7-76baa9011d72.json` release_evidence=false·`assertIsolatedTestTarget` 容器 nonce 亲证·✓「模型派发后对账：冻结未知、幂等、并发与 RLS 全部通过」）；Q5 根注册 CMD `pnpm model-op00-usage-reconciler:prove` **EXIT=0**（receipt `.tmp/isolated-proof-receipts/2026-10-26T12-13-49-425Z-61631-0da3c2e1-5301-4def-ad6f-7e383911d0b8.json` 同形·✓「usage 对账校准 reconciler 全七类矩阵通过」）——派单文「usage-calibration-reconciler:prove」=packages/ai-runtime 内层 script 名（`prove:usage-calibration-reconciler`·根 `package.json:245-246` forwarder 链亲证）·与卷面 CMD 同一 prove 两名如实登记。**判据边界注随卷沿承**：两 prove 均 tick/域级直调·不证周期臂真触发·不证 sole stack 接线·「EXIT 0/0 同 SHA」≠「`:101` 已闭」。
- **门矩阵八门亲跑（EXIT 原值·本席亲跑）**：①先验未闭复核=backlog blob `7ede9fb7`+矩阵 blob `788423b1` 对届 tip 恒等（`git hash-object` 亲算）·`:74`/`:101` 零 CLOSED 词面零翻面·REDIS-WAKEUP=`partial` 零翻；②七件锚 blob 对届 tip 逐位重 pin 全对=`7a46fc9b`(lossy 语义)/`fc18131d`(listener)/`5432cb17`(flag 门)/`03bca620`(PG 无条件保留)/`c521a103`(CMD 表)/`d05f44db`+`ed736bd4`(forwarder 两件)——§0.1 全 19 件附全量重算**零漂**；③diff 面机检=本笔落卷后 `git diff --numstat` 恰 **1** tracked=本卷 .md（落卷后 commit 前亲跑回执）；④docs:check=**EXIT=0** scanned **2344**≤cap **2354**（本笔 append 零新增受管文件·落卷后复跑）；⑤markers=五类标记词零命中 **EXIT=0**（i6-239 同源词面运行时组装）；⑥零 SSOT 零码面=`git diff --name-only` 对 backlog/matrix/queue/package.json/migrations/src 全零触；⑦est live=0=零模型外呼零 Key 加载零生产触面·`.env*` ABSENT 双向记录（盘面 glob 零命中+`git ls-files` 零条目；容器依赖=§9-rev R3/R4 预登行使面非 live 面）；⑧卫生=`pnpm install --frozen-lockfile` **EXIT=0** 零 lockfile 改（`git diff -- pnpm-lock.yaml` 零输出）。
- **STOP 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`** 三处（Status 头含 H1 短形 `STOP=` 标记/§8/本节）——两行 OPEN 翻面权仍归协调方·本绿 ≠ 已迁·Ban self-nail `post_prove_dual_pass`·Ban push/force-push（git 写只本 worktree commit）·commit 净消息=`test(worker): Redis 旁路连通与双 reconciler 隔离行使——缺口收口收据`。

## §9-post post-prove 双审收官登记（2026-10-26 · post 双审两外席会签 · 协调方翻面权行使 · append-only · **STOP 翻面 `closed`** 三处同值：Status 头含 H1 短形/§8/本节）

- **席1 post-prove PASS**：两具名 case 独立亲跑（件① REDIS 旁路连通 case·件② Q4/Q5 双 reconciler 隔离 case·非承 EXEC 读数）各 **EXIT=0**+隔离 receipt 在卷（`.tmp/isolated-proof-receipts/` 届时戳文件）+门四项独立复跑同值（markers 零命中/docs:check 届值≤cap/§8 四停止条件逐条核未触发/diff 面恰本卷 .md）——零 P0/P1。
- **席2 post-prove PASS**：P2×2（两观察项不阻塞）**零 P0/P1**——§1.3 五否决零违反亲证+`gap-bug-backlog.md:74`/`:101` 两行 OPEN 值核验不动+§5 Ban/pins 十一值零翻。
- **判词面落主线亲证**：本卷侦察起草面=主线承载 PR #134 merge `f2ad7ee2c` 对 HEAD `git merge-base --is-ancestor` 祖先亲证 EXIT=0；gap-bug-backlog `:84` 承接注记随协调方收官笔同卷落（两行 OPEN 值不动）。
- **收官动作**：本卷 STOP 三处翻 `closed`·est live=0·pins 零翻·markers=0·零码面零 SSOT 行改动维持。
