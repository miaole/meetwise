# RESERVE-RENEW-FIX REQUEST — 预留续租失败行为面小刀（结构化失败日志+告警事件升格+续租有限重试 · 簇E #130 承接 · **STOP=`draft:awaiting_pre_exec_dual`**）

> 战役 meetwise · 支线 `line/reserve-renew-fix` · 工作树 `meetwise-rrf2` · 起草基线 @origin/feat/mysql-schema-skeleton=`4124c803`（派单下界「fetch 后 origin tip≥最新」以等号成立亲证=fetch 后 `origin/feat/mysql-schema-skeleton` tip·`git rev-parse` 亲算 `4124c803a9f08c9176d0755d23577de485c97b82`）· ⛔push ⛔merge 主线（push/翻面权归协调方）。主仓 worktree 建支线：`git worktree add ../meetwise-rrf2 -b line/reserve-renew-fix origin/feat/mysql-schema-skeleton`。
> 承接链：批5 残件 #130（簇E 行为面·呈报维持）＝「预留续租失败只 console.error·极窄窗口可能被对账当孤儿回收」——本刀即簇E 呈报「归独立行为小刀」的载体卷。修法裁量权随派单令行使（§1-修法·最小面定稿）。

## §0 现状锚（失败面双向锚·起草席亲读+blob 亲算 @`4124c803`·**EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.1 blob 锚表（`git rev-parse 4124c803:<path>` 亲算）

| 文件 | blob @`4124c803` | 本刀触面 |
|---|---|---|
| `apps/worker/src/interview-consumer.ts` | `265798df` | **件①② 触（唯一产品码改面·claim 臂+心跳闭包两发射点）** |
| `scripts/alerts/event-catalog.json` | `d1cea85c` | **件③ 触（events +1+exclusions 升格注记）** |
| `ai-docs/observability/alerting-runbook.md` | `ba3bb613` | **件④ 触（§3.14 新节+头部计数+§6 升格注记）** |
| `apps/worker/package.json` | `d83fbde4` | **件⑤ 触（prove:reserve-renew 注册恰 1 行）** |
| `apps/worker/test/reserve-renew.proof.ts` | （新增） | **件⑤ 新增（静态源+纯函数·零 DB 零模型）** |
| `packages/db/src/commerce/commerce.ts` | `99f6aba6` | **零字节 Ban**（renew/sweep/confirm 语义锚·:36 租约口径 pin） |
| `packages/db/src/interview/interview-jobs.ts` | `fbd43616` | 零字节 Ban（job 租约/reaper 锚·:11 LEASE_SECONDS=120） |
| `apps/worker/src/job-heartbeat.ts` | `ebca2fe1` | **零字节 Ban**（tick 静默吞面 :14-15 锚·件② 为何在 consumer 侧 catch 的承载依据·零字节） |
| `apps/worker/src/commerce-reconcile.ts` | `5ed1b0ed` | 零字节 Ban（对账兜底收口锚·:36 reconcile+:46-87 swept→abandon+事件） |
| `packages/db/src/principal.ts` | `23e5b770` | 零字节 Ban（脱敏纪律锚 :881-884 同形） |
| `apps/worker/test/commerce-reconcile.proof.ts` | `992de581` | 零字节 Ban（门 1 邻面·:94-95 续约正形臂在案） |
| `apps/api/test/neg-commerce.proof.ts` | `23418272` | 零字节 Ban（门 2 邻面 neg） |

### 0.2 失败面事实（file:line 亲证 @`4124c803`）

- **发射面一（claim 时·文本形半盲）**：`interview-consumer.ts:356-360`——领 job 后同拍续预留租约 `renewReservationLease(c, owner, job.interviewId, DEFAULT_LEASE_SECONDS)`，失败臂=`.catch((err) => console.error('reservation lease renew failed', job.interviewId, (err as any)?.code ?? err))`——**仅文本 console.error·零重试·零指标·零告警登记**亲证（:358 注「续约失败不阻断处理(记日志,对账兜底)」=兜底语义自认在案）。`scripts/alerts/event-catalog.json:106-110` `registered_exclusions` 将该文本日志列为**首批外**（「零改兼容口径，不列首批 matcher 断言面」）=告警面缺席自认锚。
- **发射面二（heartbeat 时·全盲）**：`interview-consumer.ts:366-373` 心跳闭包同拍续预留租约（`:368`）——throw 直入 `job-heartbeat.ts:14-15` tick 级 `catch { /* 续租瞬时失败当无事… */ }` 被**静默吞（连 console.error 都没有）**；`false` 返回值忽略（心跳存续以 job 租约+graph fence 为准·设计内·:365 注）。
- **回收面（对账·谓词无复核）**：`commerce-reconcile.ts:36` 每 owner 拍 `reconcile(c, owner)` → `commerce.ts:660-664` → `sweepExpiredReservations`（`commerce.ts:578`）——回收谓词**仅** `status='reserved' AND lease_expires_at < now()`（`:585` 非面试臂直置 released·`:601-630` mock_interview 臂 `FOR UPDATE` 后仅 billing/topic 判定）——**无最近续租/心跳存活性复核**亲证（5E 卷 R3 同款定谳）。
- **业务收口面（兜底现状·健全）**：`commerce-reconcile.ts:46-87`——swept 笔逐条 `abandonInterviewAndRelease`（`:75`·同用户放弃终态口径）+补发 `interview_unavailable`（`:87`·无静默死胡同）；sweep 行锁+lease 复核同语句原子（`commerce.ts:571-577` 注·与 renew 无 TOCTOU）。
- **撞击面（极窄窗口后果）**：活会话预留被误扫 → 该面试收尾 confirm/release 撞 `already_released` 大声失败（`commerce.ts:193`/`:245`「被对账 sweeper 回收过 → 大声失败,绝不静默丢」）+ `interview-consumer.ts:363-364` 注自认「被 commerce reconcile 误扫退款 → 收尾 confirm 撞 already_released 免费交付」。
- **极窄窗口算术（三租约三值亲证）**：预留租约 1800s（`commerce.ts:36` `DEFAULT_LEASE_SECONDS`）·心跳 30s（`job-heartbeat.ts:9` intervalMs 30_000）·job 租约 120s（`interview-jobs.ts:11`）——误扫须「续租失败**持续 ≥1800s** 且会话仍活」≈ ≥60 连拍心跳失败量级=极窄但结构性存在（发射面一 throw 一次即弃拍零自愈+发射面二零观测=窗口内全程不可见）。
- **benign false 臂（处置红线）**：`renewReservationLease` 返回 `false`=已 confirmed/released/重放（0 行·**零 throw**·`commerce.ts:561-564`）——设计内无害（completed+confirmed benign race·`interview-consumer.ts:140-147` 注亲证）**绝不可当失败处置**；throw 才是失败面（assertPrincipal/连接族/超时族）。本刀全部失败处置只挂 throw 臂，false 臂零触。

## §1 归因（失败处置面三缺陷·对账兜底本身健全）

- 缺陷①=**观测面半盲**：claim 臂文本形 console.error（无 event 键不可机检·catalog 首批外排除）+heartbeat 臂全盲（静默吞）——失败既不可告警也不可复盘。
- 缺陷②=**零自愈**：claim 臂单次 throw 即弃拍（该 job 全程不再续预留）——瞬时抖动直接消耗 1800s 余量；heartbeat 臂虽 30s 天然重拍，但两臂合计对「抖动即弃」零挽救。
- 缺陷③=**告警面缺席**：sustained 失败（真会撞误扫的形态）恰是唯一需要 on-call 知晓的形态，而现状排除在目录外。
- 对账兜底链（sweep 原子性+业务收口+already_released 大声失败）**语义健全零缺陷**——本刀不触回收侧（§1.3 否决②）。

## §1-修法（组合案定稿·最小面·裁量行使）

### 1.0 组合案裁决

**裁决=件①（claim 臂有限重试+结构化失败日志）+件②（heartbeat 臂结构化失败日志）+件③（event-catalog 升格正式事件）+件④（runbook 手册节）+件⑤（静态 proof）五件一卷；候选三「续租失败→主动放弃语义」否决（§1.3-1）。** 理由：#130 定谳「只 console.error」的直接断点是「失败不可见+零挽救」——件①②③④ 一刀补齐观测/告警/自愈三环；对账兜底收口语义已健全（无静默死胡同），主动放弃=对健全兜底叠重复终态面。恰 1 产品码文件+2 配置面+1 注册行，worker 侧单触。

### 1.1 五件

- **件① `interview-consumer.ts` claim 臂（:359-360 替换形）**：新增导出常量 `RESERVATION_RENEW_RETRY_DELAYS_MS = [250, 500]`（短退避·总附加 ≤750ms≪池 statement_timeout 15s 面·`principal.ts:947-950` 界）——`renewReservationLease` 尽试仍 throw → 结构化失败日志 `console.error(JSON.stringify({ event: 'reservation_lease_renew_failed', kind: 'interview', interview_ref: job.interviewId, phase: 'claim', error_code: errCode(err) ?? 'err' }))` → 照旧**不阻断处理**（:358 兜底语义零变）。**false 返回值零触**（benign 臂·§0.2 红线）。脱敏纪律：`interview_ref`=不透明 UUID 行引用（非 owner/租户标识·沿 reaper_takeover job_ref 脱敏纪律 `principal.ts:881-884` 同形·绝不记 owner_user_id）。
- **件② `interview-consumer.ts` 心跳闭包（:368 包裹形）**：`renewReservationLease(...)` 包 `.catch` → 同名结构化事件 `phase: 'heartbeat'`——闭包返回值语义零变（job 租约+graph fence governs·`renewInterviewJobLease`/`renewInterviewGraphFence` 零触）。闭包内**不加** sleep 重试：下一拍 30s=天然重试（≪1800s 余量·加 sleep 反撑长租约逐拍延迟）。`job-heartbeat.ts` 零字节（tick catch 兜的是 job 租约面·现状注释如实）。
- **件③ `event-catalog.json`**：`events` 数组 +1 条 `{ event: 'reservation_lease_renew_failed', matchers: [{ type: 'json', field: 'event', value: 'reservation_lease_renew_failed' }], severity: 'Ticket', source: 'apps/worker/src/interview-consumer.ts:<届行号>', runbook: 'ai-docs/observability/alerting-runbook.md#ev-reservation_lease_renew_failed' }`——**severity=Ticket 裁量定稿**：降级在发生（保护退化到对账兜底）但未丢数据（sweep 按 topic 结算或全退+业务收口无静默）=分层口径 Ticket 恰位（沿 :3 分层逐字）；发射面只挂 throw 臂+件① 已滤瞬时抖动 → 噪音有界（正常重放 false 臂零发射·非 ai_trace_persist_failed 噪音形）。`registered_exclusions` 该条 note **append 升格注记**（「已由 RESERVE-RENEW-FIX 升格为正式事件 reservation_lease_renew_failed（promoted·史录零洗）」·条目本体零删）。判定器 `check-alerts.mjs` 目录驱动自动消费零码改（readyz-privacy-wire nail 先例·:269-280 校验 event/matchers/severity 三键由本件满足）。
- **件④ `alerting-runbook.md`**：`:39` 「目录十三事件」→「目录十四事件」；新增 `<a id="ev-reservation_lease_renew_failed"></a>` 锚 §3.14 节（四件套：matcher=JSON 同名/含义=预留续租尽试仍败·保护退化对账兜底·sustained 即误扫前兆/响应 Ticket·查 phase 分布（claim vs heartbeat）+PG 连接族 `db_pool_error` 对照+容器重启记录/下钻=interview-consumer 届行号+commerce.ts sweep 谓词）；§6 首行 append 升格注记（原排除行零删·「升格后本行史录保留」）。
- **件⑤ 新增 `apps/worker/test/reserve-renew.proof.ts`（静态源+纯函数·零 DB 零模型）+ `apps/worker/package.json` `prove:reserve-renew` 注册恰 1 行**：断言面=①件①② 结构化事件字段形（event 名/kind/phase 两值/interview_ref 键在·旧文本原串 `'reservation lease renew failed'` 零残留=neg 判别）+②重试常量在且值=[250,500]+尽试次数=delays.length+1+③benign false 臂零处置（源级：false 不入失败臂）+④catalog 条目（event 名/severity=Ticket/matcher 形/runbook 锚字符串）+⑤runbook 锚 `id="ev-reservation_lease_renew_failed"` 在+「十四事件」+§6 升格注记在+⑥exclusions 升格注记在。臂数 EXEC 期定值（判据 ≥10 臂·neg 判别臂在组内）。

### 1.2 泄漏面/行为位移核（诚实登记）

- 件① 重试附加延迟 ≤750ms 仅在**失败路径**发生（成功路径零位移）；重试期间该 job 尚未开始跑图（claim 后心跳前·无并发副作用）；重试对象是幂等只读 UPDATE（renew 本身幂等·零重复扣费面）。
- 件② catch 仅吞 renew 的 throw——`renewInterviewJobLease`/`renewInterviewGraphFence` 的 throw 仍按现行为直入 tick catch（心跳停/续面零变）；包.catch 后 renew 的 throw 不再触发 tick catch——但 tick catch 对 renew 无任何处置（纯吞）→ 行为位移=零·观测增量=+1 事件。
- 新事件进容器 stderr → check-alerts json matcher 面（docker logs 前缀容忍·沿 principal.ts:896 先例）——零新端点零新依赖零迁移零 env 闸。

## §1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选三（续租失败→主动放弃语义）**：**否决**——`false` 臂=benign 重放/已终态（零 throw·`commerce.ts:561-564`）当失败处置必造假终态+撞 completed+confirmed benign race（`interview-consumer.ts:140-147`）；对账兜底收口已无静默死胡同（`commerce-reconcile.ts:46-87` abandon+事件 exactly-once）→ 主动放弃=重复终态/双退款面·对健全兜底叠收口。
- **预留域重构（sweep 补「最近续租/心跳复核」谓词或新增续租时点列）**：否决——5E R3 已裁**禁新增「最近续租时点」列**（零新迁移维持）；sweep「行锁+lease 复核同语句」原子性零放松纪律（`commerce.ts:571-577`）；跨域面大违最小面。回收侧零字节 Ban。
- **#2 1800s 口径改动（DEFAULT_LEASE_SECONDS 调大/调小）**：否决——#2 系产品决议/簇E 呈报维持（LEDGER :89 剔除登记承登）；口径非根因（根因=失败不可见+零重试·§1）；翻既有缺省=越权。三租约值全部 pin（§5）。
- **ai-runtime METRIC 计数器（metrics.ts 加 reservation renew failed counter）**：留槽不入本刀——5E Ban「#130 指标名自造值（裁决③定值前行）」纪律承登；事件+目录已承载观测面；指标面归后刀（若 5E 裁决③行使时一并落）。
- **无限重试/长退避/跨拍重试状态机**：否决——5E R3「禁无限」承登；heartbeat 30s 天然重拍已是无状态跨拍重试（件② 观测化后即完备）；bounded [250,500]ms 尽试即弃拍=对账兜底语义零变。

## §2 验收断言（门矩阵·起草席亲跑实测 @支线树基线 `4124c803`·EXEC 期重跑为准）

- 门 1 邻面 proof：**`pnpm -C apps/worker prove:commerce-reconcile` EXIT=0**（隔离形·无 DB 目标 fail-loud 零臂执行沿 worker-hang-guard §9.8 先例如实登记·EXEC 有隔离库则全臂含 `:94-95` 续约正形臂）。
- 门 2 邻面 neg：**`pnpm -C apps/api neg:commerce` EXIT=0**（隔离形同上·如实登记）。
- 门 3 新 proof：**`pnpm -C apps/worker prove:reserve-renew` 全绿 EXIT=0**（臂数 ≥10·EXEC 定值·§1.1 件⑤ 六断言面+neg 判别臂在组）。
- 门 4 `turbo typecheck --force` **8/8 EXIT=0（0 cached）**（起草席基线亲跑 20.0s）。
- 门 5 `turbo lint --force` **12/12 EXIT=0（0 cached·root 5235 warnings 0 errors）**（起草席亲跑）。
- 门 6 `docs:check` EXIT=0（基线 **2223**≤届 cap **2232**·+1 本 REQUEST=**2224** 余 8·EXEC 时点以届 sanction 后 cap 为准重验·起草席亲跑）。
- 门 7 markers：本刀改动集全部新增行五类标记词（词表沿 `scripts/i6-239-gates.proof.mjs:154` 运行时组装四词+冲突对·词面不誊防自指）直扫零命中+全树行首冲突标记 `git grep` 锚形扫 EXIT=1 零命中（EXEC 期全量重扫为准）。
- 门 8 diff 面：**恰 8 tracked=4 码/配/证（`interview-consumer.ts`+`event-catalog.json`+`apps/worker/package.json`+`reserve-renew.proof.ts` 新增）+4 docs（本 REQUEST 新+`alerting-runbook.md` 件④+LEDGER 刀位图行+checklist 段）·恰 2 新增文件（proof+REQUEST）·零多零少·Ban 面（§0.1 其余 8 锚）零触亲证**。
- 卫生：`pnpm install --frozen-lockfile` 零 lockfile 改（起草席亲跑 EXIT=0）·`apps/web/tsconfig.tsbuildinfo` 门副产 checkout 回滚（起草席已执行）·est live=0·`actualSpendCny=null`·零迁移零 DDL 零 env 闸。

## §5 Ban 列表 + pins

- Ban：`packages/db/src/commerce/commerce.ts`（`99f6aba6`·renew/sweep/confirm/口径零字节）·`packages/db/src/interview/interview-jobs.ts`（`fbd43616`）·`apps/worker/src/job-heartbeat.ts`（`ebca2fe1`·tick 形零字节）·`apps/worker/src/commerce-reconcile.ts`（`5ed1b0ed`·对账收口零字节）·`packages/db/src/principal.ts`（`23e5b770`）·`apps/worker/src/main.ts`（调用点零改）·`apps/worker/test/commerce-reconcile.proof.ts`（`992de581`·门 1 邻面零字节）·`apps/api/test/neg-commerce.proof.ts`（`23418272`·门 2 邻面零字节）·全部迁移/CI/docker/门脚本·`packages/ai-runtime/src/metrics.ts`（指标面留槽 §1.3-4）。
- pins：基线 tip=`4124c803` · §0.1 十一 blob 锚 · 三租约三值=预留 1800s（`DEFAULT_LEASE_SECONDS`）/心跳 30s/job 租约 120s · `RESERVATION_RENEW_RETRY_DELAYS_MS=[250,500]`（draft 定值·EXEC 期可复查但禁翻「有限短退避+禁无限」语义）· 事件名=`reservation_lease_renew_failed` · severity=`Ticket` · 门 4 typecheck 8/8 · 门 5 lint 12/12（root 5235）· docs cap **2232**（届值·`public-text-policy.mjs:110` MAX_FILES=2_232 亲证）· 基线 docs **2223** · est live=0 · `actualSpendCny=null`。
- ⛔push（origin 任何 ref）· ⛔merge 主线（`feat/mysql-schema-skeleton`）· ⛔force push · ⛔pull --rebase · 翻面权归协调方。

## §8 est live / 预算 + STOP

- est live=0（结构化日志+目录/手册 docs 面+静态 proof·EXEC 期全门=本地 tsx/turbo/eslint/node+静态源读·零模型外呼零 DB 外呼零容器零 Key 加载零 secrets 读用零生产操作）· 0 Key 值 · `actualSpendCny=null` · 零迁移零 env 闸。
- **STOP=`draft:awaiting_pre_exec_dual`（三处同值=本 REQUEST §8+LEDGER 管线「reserve-renew-fix 起草」行+execution-master-checklist「Line reserve-renew-fix」段·pre-exec 双审两独立外席待派·alone≠dual·开工权归协调方）**。
- 开工条款：pre-exec 双审 BOTH PASS 后 EXEC 席按 §0 对届时 tip 重 pin 开工；基线漂移致 §0.2 行号位移，结论不变则只更行号并如实登记。
- 停止条件：①重 pin 时 blob 漂移且语义变（→回炉起草）②门 1/门 2 邻面基线被他刀改动（→熔断呈报·禁 retry-to-green）③届 cap 步进致门 6 判据变（→按届 sanction 后值重验·如实登记）。
- 波序注记：本刀触面 `interview-consumer.ts` 与 WORKER-HANG-GUARD（该刀 §0.1 零字节 Ban 锚）/G7W-DIAG-NEEDLES 两刀呈报面存在同文件交集——平行触改必熔断·并线顺序归协调方裁·后并线刀 §0 对届时 tip 再重 pin。
