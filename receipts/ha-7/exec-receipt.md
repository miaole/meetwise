# HA-7 · R-24 队列指标 · EXEC 收据（ha7-exec 席）

**Status**: `executed:awaiting_post_prove_dual`（W1-W4 全落 · prove 矩阵 §4 十条亲跑全过 · 停止条件三查未触发 · markers=0（改动集新增行零命中）· est live=0 · ⛔push · Ban self-approve · alone≠dual · prove EXIT=0 ≠ DONE · claimDone=false · 走 post-prove 双审+nail）
**Date**: 2026-10-11
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-ha7` · 分支 `line/ha-7-queue-metrics`（fork = `feat/mysql-schema-skeleton` @`20186718`）

---

## §A rebase 主线 + 漂移表

- `git log -1 feat/mysql-schema-skeleton` 亲证主线 tip = `20186718`（协调方提示「主线已落 HA-3/R-47 EXEC」在本地仓库状态未发生：HA-3 仍在 `line/ha-3-db-resilience` @88c48f61 未并主线，无超前主线 ref 可取）。
- `git rebase feat/mysql-schema-skeleton` → `Current branch line/ha-7-queue-metrics is up to date.` **EXIT=0**（merge-base == tip == `20186718`）。
- **漂移表：空表**（锚点零漂移）——REQUEST §0 全部锚点在 @20186718 实树逐条亲读复核在位：metrics.ts:74-76/63/67-68/71-102/105-147 · main.ts:209-230/237-266/214 · 0042:5-26/45-47 · gateway-dispatch.ts:36-44 · alert.rules.yml:116-123/126-133/136-143 · alerts-lint.mjs:31-33 · metrics.proof.ts:37,52,54 · interview-consumer.ts:8/182/187/442 · quiz-jobs.ts:58 · report-worker.ts:160 · diagnosis 消费侧落点=diagnosis-consumer.ts:51（EXEC 亲读调用链后钉死，见 §B W1②）· check-alerts.mjs:63-65/98/116/146/176/220/27/368 · event-catalog 九事件 · compose.prod.yml:329-330。
- **落卷后补记（§A 追加）**：主线在本席执行期间被并行会话推进（regfix nail 并主线：`feat/mysql-schema-skeleton` tip `20186718`→`dce0708d`）——`git diff 20186718..dce0708d --name-only` ∪ 本刀改动集求交=**零重叠**（regfix 触 api/web/e2e/regfix 收据面·与本刀 13 文件无交），post-prove/nail 阶段 re-rebase 预期零冲突；本刀 commit 按执行序在分叉基 `20186718` 上落卷，不再事后 rebase 翻转 hash（re-rebase 归 nail 阶段按序执行）。

## §B 逐条改动（W1-W4 · file:line 落后实位）

### W1 失败计数序列（唯一新码动·C1+C2）
- **C1** `packages/ai-runtime/src/metrics.ts`：
  - `:77` `jobsFailed: 'worker_jobs_failed_total',`（METRIC 名单 +1·counter 以 _total 收尾沿命名纪律）；`:68` 名单头注 +1 行（counter 语义+四消费端终态臂+sum(increase()) 跨实例口径）；`:66-69` 既有注释零触（**refundFailed 陈旧注释未动**——REQUEST §2.7 零顺手改·勘误已在 §0 登记）。
  - `:113-114` `registerBaselineMetrics` 四队列 0 预填：`for (const queue of ['interview_job','report','quiz_job','diagnosis_job']) m.inc(METRIC.jobsFailed, { queue }, 0)`（沿 :105 预注册纪律·队列序=main.ts:214 JOB_GAUGE_QUEUES 同序）。
- **C2** 四消费端终态失败臂各恰一行 `getMetrics().inc(METRIC.jobsFailed, { queue })`（queue proof Q6.2 机检：每文件恰 1 处·seat 后·guard 内·requeue 邻域零命中·Q6.4 新增码面零触失败判定词面）：
  - interview：`apps/worker/src/interview-consumer.ts:184`（`failClaimedInterviewJob` 内 `markJobFailed` :182 CAS 胜出 + `if (!stillMine) return;` :183 之后——只计本 worker 实际终态化，丢租约 CAS 败不计不双计）。
  - quiz：`apps/worker/src/quiz-consumer.ts:54`（`markQuizJobFailed` :52 seat 后·stillMine guard 内；押题无 requeue 臂）。
  - diagnosis：`apps/worker/src/diagnosis-consumer.ts:53`（`markDiagnosisJobFailed` :51 seat 后·stillMine guard 内）——REQUEST 授权「diagnosis 精确落点 EXEC 亲读调用链后定」：调用链=diagnosis-consumer.ts:51 为 `markDiagnosisJobFailed` 唯一消费侧调用处（与 quiz 同构），落点定于此。
  - report：`apps/worker/src/report-worker.ts:162`（drain 失败臂 `markReportFailed` :161 之后恰一行——计数口径=drain 臂定格即计（含其后被 sweep 重排的重试失败）；重排/隔离判定 sweepReports 零触；failed→quarantined 存量深度仍由 `worker_jobs_dead` gauge 承载）。
  - **零改失败语义**：queue proof Q6.3（消费端 diff +7/-2·新增行仅 inc/注释/import·删除行仅旧 type-import）+ Q6.4（新增码面 markFailed/attempts/quarantin/requeue/UPDATE/WHERE 词面机检零命中）。DB 侧 `markJobFailed/markQuizJobFailed/markDiagnosisJobFailed/markReportFailed/sweepReports/sweepStuck*/requeueFailedReport` 全部零字节。

### W2 check-alerts 扩面（C3+C4·append-only）
- **C3** `scripts/alerts/event-catalog.json`：events 数组**纯追加**三事件（`:77-96` 区段）——`queue_backlog`（metrics_gauge·worker_jobs_queued·>100·Ticket）/`queue_stuck_running`（worker_jobs_running_expired·>5·Ticket）/`queue_dead_letter`（worker_jobs_dead·>10·Page）；source_note 逐条注明对齐锚（alert.rules.yml:116-123/126-133/136-143）。**既有九条目逐字节零动**（git diff 零删除行亲证=queue proof Q5.2；过程如实登记：编辑中曾误吞 `ai_trace_persist_failed` source_note 一「看」字，发现即原字恢复，最终 diff REMOVED_COUNT=0）。
- **C4** `scripts/alerts/check-alerts.mjs`：
  - 第四采集器 `collectMetrics`（`:165-181`）：live 单遍 GET（`WORKER_METRICS_URL` 可覆写·默认 `http://127.0.0.1:${WORKER_METRICS_PORT:-9091}/metrics`·AbortSignal 5s 上限·抓完即退非 daemon）；offline `--metrics-file` 注入缝（`:66` CLI·沿 :63-65 三缝同形）；live 抓取失败=源失效（fail-closed，沿头注 :27「无法证明干净 = 不干净」既有语义·顺带「worker /metrics 不可达」探测信号）；offline 无 `--metrics-file`→skipped 不误红。
  - 第四 matcher 形制 `metrics_gauge`：`:176-229` 助手三件（`parseMetricSeries`/`maxGaugeByQueue`/`gaugeThresholdHits`——Prom 文本 `name{labels} value` 解析·按 queue 标签**逐队列取 max** 评估·严格大于对齐 expr `> N`）；`:228` `matcherHits` 追加第四形分支（形参 +`metricsText`·既有四形分支零动）；`:361` gaugeMatchers 桶 + `:382-386` 逐队列评估循环（每超阈队列一条目·sample 带 `queue/max` 供下钻）。
  - 接线（最小必要）：`:324` `const metrics = await collectMetrics();`+`:329-330` 源状态 note 行（追加）；`:332` `sourceErrors` 聚合 +`metrics.error`（一行必要接线·EXIT 语义本身零动：`:388-390` 未决 Page/Ticket=1/干净=0/--report 恒 0 原样）；verdict `sources.metrics`（`:411`）+ RECEIPT `CMD` 行追加 `--metrics-file` 回显（`:441`）+ 头注「输入三路→四路」（`:10-19`）。
- 既有九事件跑老通路零动：logs/ps/df 三采集器与四 matcher 既有分支零字节（queue proof Q5.1：HA-5 proof 21 断言除 P5.2 预存红外全 PASS，见 §D/§F）。

### W3 runbook（C5）
`ai-docs/observability/alerting-runbook.md`：
- §3 追加三小节（锚 id= `ev-queue_backlog`/`ev-queue_stuck_running`/`ev-queue_dead_letter`·alerts-lint 第 4 节锚解析机检 12/12 过）：3.10 queue_backlog——Ticket（>100·对齐 :116-123·响应=worker 副本/消费循环排查·快照无 for 去抖差异声明·下钻=0042 gateway_job_gauges queued 谓词→四消费端 dispatch 锚 :195/:211/:92/:91）；3.11 queue_stuck_running——Ticket（>5·对齐 :126-133·下钻=running 谓词→四 sweep 锚 :262/:77/:75/:74）；3.12 queue_dead_letter——Page（>10·对齐 :136-143 critical→Page 同层·响应含手动重排 :61 与「新失败 vs 存量累积」判读·下钻=死信谓词逐队列+终态定格锚 :182/:52/:51/:184）。下钻链=告警条目→0042 谓词→消费端码锚（全部 file:line 亲证复核，起草稿内 7 处漂移行号已逐处勘正为实位）。
- §4 追加两条登记：**DLQ 只增不减已知风险**（终态行零 retention→`worker_jobs_dead` 单调累积→>10 长期假噪·处置归 R-51 生命周期后刀/S15 运维刀·本刀零修·归 R-51 后刀不修）；**快照语义 vs Prometheus `for` 去抖差异声明**（不伪装等价·假阳性由白名单承担）。
- §6 追加首批外登记一行（DLQ retention 缺位=已知风险首批外·登记不修）。
- §2 用法块补 `--metrics-file` 注入缝行+EXIT 语义行补 metrics 源失效；§3 标题「目录九事件→十二事件」（必要勘误·否则文档自认 9 与目录 12 漂移）。

### W4 alerts-lint（C6）
`scripts/alerts-lint.mjs`：`:33` KNOWN_METRICS +`"worker_jobs_failed_total"`（+注释：速率告警规则归 S15·R-22 同判——**本刀不加任何 alert.rules 新规则**）；`:241` MATCHER_TYPES +`"metrics_gauge"`（W2③ 第四形制的机检侧同构注册·否则 §4.10 lint 必红——REQUEST W4 字面只列 KNOWN_METRICS 一行，此为本刀对修法口径的最小必要联动，如实登记待双审判）；`:267-270` 第 4 节 metrics_gauge 校验分支（metric 必须在 KNOWN_METRICS 白名单=单一真源防漂移 + threshold 有限正数）。第 1-4 节既有校验逻辑零改（纯 additive）。

### 新增 prove 载体两件（§4 判据的可复跑载体·沿 HA-5 两件形制）
- `scripts/alerts/check-alerts-queue.proof.mjs`（A 组注入式确定性 proof 29 断言·无 docker 依赖）。
- `scripts/alerts/check-alerts-metrics-smoke.mjs`（B.8 实栈烟测·MEETWISE_HA_SANDBOX_AUTHORIZED=1 授权闸沿 HA-5 形）。

## §C prove 十条对账（REQUEST §4·全部亲跑）

| # | 判据 | 载体/命令 | EXIT | 断言 |
|---|---|---|---|---|
| 1 | 阈值三向×四队列（>100/5/10 严格大于·超/恰/欠·三指标×四 queue 各命中） | `node scripts/alerts/check-alerts-queue.proof.mjs` Q1.1-Q1.5 | 0 | 5/5 PASS（T+1→3 事件 count=4·=T→0·T-1→0） |
| 2 | EXIT 语义（Page/Ticket=1/干净=0/--report 恒 0/live 源失效 fail-closed=1/offline skipped 不误红） | 同上 Q2.1-Q2.4 | 0 | 4/4 PASS（live fail-closed 探测信号收据可读·receipt 落 .tmp 不覆写 HA-5 卷） |
| 3 | 多实例 max 去重（60+45 sum=105 会误报→max=60 不报·101+3 报 max=101 非 104） | 同上 Q3.1-Q3.3 | 0 | 3/3 PASS（沿 metrics.ts:68 口径） |
| 4 | 白名单假阳性防（带到期日翻绿/过期重告·新事件同受防腐化约束） | 同上 Q4.1-Q4.3 | 0 | 3/3 PASS |
| 5 | 既有九事件零翻（HA-5 proof 全量+目录 diff 纯追加） | 同上 Q5.1-Q5.3 + `node scripts/alerts/check-alerts.proof.mjs` | 0 / 1（仅 P5.2 预存红·见 §D/§F） | 3/3 PASS（P5.2 预存红基线对账：本刀对三 sweep 文件零字节·worktree 与 pristine 逐行同形 +10/-3） |
| 6 | 新 counter render+C2 emit 真源+diff 形 | 同上 Q6.1-Q6.4 + `pnpm metrics:prove` | 0 | 6/6 PASS（baseline 0 预填/inc 渲染/# TYPE counter·四落点恰一行在终态臂） |
| 7 | runbook 锚机检（3.10-3.12 解析+DLQ 只增不减+快照/for 差异声明）+阈值逐字对齐 | 同上 Q7.1-Q7.3 + `pnpm alerts:lint` | 0 | 3/3 PASS（12 事件 12 锚解析·100/5/10 严格同数·warning→Ticket/critical→Page） |
| 8 | /metrics 真通路实栈（最小 worker→全序列→check-alerts live 评估 RECEIPT·干净栈=EXIT 0） | `MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/alerts/check-alerts-metrics-smoke.mjs` | **0** | 11 步全 PASS（ha-pg/ha-redis healthy·migrate ExitCode=0·worker /metrics 185 行 16/16 序列=三 gauge 12+新 counter 4·live 判定 alerts=0 sourceErrors=[] sources.metrics=`bytes=10049 (live)`·同快照 --metrics-file offline 复评同判 EXIT=0 parity·teardown down -v 全灭） |
| 9 | 静态边界（监控栈四文件/compose.prod.yml/migrations 零出现） | 同上 queue proof Q8.1（git diff 20186718 ∪ status 对照禁触清单） | 0 | 1/1 PASS（migrations=0·含 0042 零改） |
| 10 | 既有零回归（alerts:lint 全绿 25 条+sweep 族对账） | `pnpm alerts:lint`=0；隔离环 prove：`report:prove`/`quiz:prove`/`reaper:prove`/`report-retry:http:prove`(38 负路径)/`interview-dispatch:unit:prove` 全 **EXIT=0**；邻接面 `prove:ha3-metrics-pool-errors` EXIT=0（R-22 渲染链零回触） | 0 | 五族全绿·dispatch-pg 未跑列账=需 E2E_CLOUD_ISOLATED 云隔离环境（沿 HA-5 同款如实列账·同族单元契约+四真 PG 隔离环已覆盖） |

**B.8 口径注记**：REQUEST「全 12 序列（4 队列 ×4 指标）」按三 gauge×4 队列=12 序列理解，新 counter 另 4 队列序列=实际断言 16/16 全覆盖（attempt2 烟测实测 worker 暴露 16 条 queue 序列，语义=「三 gauge+新 counter 全序列」，如实注记）。

## §D attempts 全账（Ban retry-to-green）

| # | 面 | 现象 | 根因 | 处置 |
|---|---|---|---|---|
| 1 | B.8 smoke attempt1 | migrate ExitCode=1（esbuild 平台不符） | 宿主 node_modules（本席为跑 host 侧 proof 新装）仅 darwin-arm64 esbuild，bind mount 盖住镜像路径→容器 linux/arm64 取不到原生件 | 沿仓内 sanctioned recipe（HA-1 收据 + gap-perf review S 线先例）：临时 append `supportedArchitectures`（darwin/linux·arm64）→`pnpm install --frozen-lockfile --force` 补 linux-arm64 可选原生包→**立即还原 yaml**（git diff 零残留·lockfile/package.json 零变更·untracked 环境预备不入 commit·全披露） |
| 2 | queue proof run1 | Q5.1/Q6.4 两断言 FAIL | Q5.1=本 proof 初版把 HA-5 卷 P5.2 误判为新增红（实为预存红·见 §F）；Q6.4=断言自身把注释里「markFailed/requeue」词面误伤 | 改 proof 断言（预存红对账化+码面剥注释），产品码零改 |
| 3 | B.8 smoke attempt2 | 12 序列断言 FAIL（实测 16） | REQUEST「12 序列」=三 gauge×4 队列口径；4 指标×4 队列实为 16 | 断言改 16/16 全覆盖+如实注记（§C B.8 注记） |
| 4 | B.8 smoke attempt3 | judge EXIT=1：sandbox env-file missing | 本 smoke env-file 写 `.tmp/ha7-smoke/`，check-alerts `--sandbox` 按既定路径 `.tmp/ha-sandbox/sandbox.env` 取 | env-file 落回 canonical 路径（check-alerts.mjs 零改） |
| 5 | B.8 smoke attempt4 | genEnvFile ENOENT | canonical 目录未创建 | mkdirSync dirname(ENV_FILE) |
| 6 | B.8 smoke attempt5 | — | — | **EXIT=0 全 PASS**（§C #8） |

产品码（W1-W4 八文件）自首次落码后**零返工**（唯一产品面修正=-event-catalog 误吞一字复原，attempt 于 §B C3 如实登记）。

## §E 停止条件核查 + 零触面

- **停止条件**：①锚点重定位失败——未触发（rebase up-to-date·漂移空表）；②prove 新增红——未触发（唯一红 P5.2 为预存·基线对账归 HA-5 卷，见 §F）。两条件均不成立，继续执行。
- **零触面亲证**（git status/diff 对照）：监控栈四文件（compose.monitoring.yml/prometheus.yml/alert.rules.yml/alertmanager.yml）零触·compose.prod.yml 零触·`packages/db/migrations/*`（含 0042）零触·R-20/21/23 面零触·HA-5 卷（目录既有九事件/三采集器/四 matcher 既有分支/EXIT 语义/check-alerts.proof.mjs/sandbox-smoke.mjs/白名单）零字节·已 nail 五刀面零回触·`interview-jobs.ts/report.ts/quiz-jobs.ts(diagnosis-jobs.ts)` sweep/租约/CAS 零字节（`git diff 20186718 -- <三文件>` 空·queue proof Q5.1 机检）·R-22 渲染链零改（ha3 proof EXIT=0）·`refreshJobGauges`/15s 节奏/WORKER_METRICS_* env 形面零改·api MetricsController 零触·metrics.ts:66 refundFailed 陈旧注释零改。`pnpm-workspace.yaml` 环境预备已还原（git diff 零残留）·其他工作树零触（docker 操作仅本工作树沙箱最小栈且 `down -v` 全灭·无 push 无主线操作）。
- **改动清单**（10 修改+2 新脚本+收据）：metrics.ts · metrics.proof.ts · interview-consumer.ts · quiz-consumer.ts · diagnosis-consumer.ts · report-worker.ts · event-catalog.json · check-alerts.mjs · alerts-lint.mjs · alerting-runbook.md · ha-7-queue-metrics-REQUEST.md（状态行 append-only）· 新增 check-alerts-queue.proof.mjs / check-alerts-metrics-smoke.mjs / receipts/ha-7/*。
- **markers=0**：改动集新增行（180 行 code/doc diff）todo/fixme/xxx/placeholder/待办/待接线 grep **EXIT=1 零命中**（亲证）；新 smoke 文件小写 "placeholder"×3 = HA-5 `check-alerts-sandbox-smoke.mjs` 同位置同三串逐字镜像（哑凭据文件头/heuristic note/哑 CA）——沿 HA-5 EXEC 同款如实注记，非未闭合占位。
- **est live=0**：零模型外呼零计费（worker 价格源=ha-sandbox.invalid 哑值·embedder 哑 Key·沙箱 tmpfs 哑凭据即用即灭）·零生产操作·零 secrets 入库（收据/快照仅哑凭据沙箱指标·无主机敏感信息）。
- **pins 十一值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE /privacy/interview-data/:id=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §F 交后登记（如实披露·待双审裁决）

1. **HA-5 卷 check-alerts.proof.mjs P5.2 = 预存红（非本刀新增）**：其 diff 基 `9f6edf8f` 被主线 h4（#252 focus 进题链·`interview-jobs.ts` additive +7/-3）漂移——`git diff 9f6edf8f 20186718 -- <三文件>` 已同形 **+10/-3**（本刀 base 处即红·本刀对三文件零字节·worktree 与 pristine 逐行同形）。修复=重钉 `ALERTS_PROOF_BASE` 或按新主线重述断言，归 HA-5 卷原刀后席；本刀不越界修（只允许扩不允翻）。本刀 proof Q5.1 已把该红对账化为机检断言（唯一 FAIL=P5.2+零字节归因+同形证据）。
2. **HA-5 卷 check-alerts-sandbox-smoke.mjs step5 语义影响（本刀未重跑该件·如实预警）**：本刀后 live 模式 metrics 源失效=fail-closed 1（REQUEST §1 W2④ 明令），该 smoke 的白名单复跑步（EXIT=0 期望）在「栈无宿主可达 worker /metrics」时将转 1。处方（归 HA-5 卷后刀）：该步显式 `WORKER_METRICS_URL` 指向栈内 worker 或栈内起 worker。本刀零触该文件。
3. **W4 最小联动扩注**：MATCHER_TYPES +metrics_gauge 及其校验分支（§B W4）超出 REQUEST W4 字面一行——为 W2③ 第四形制在机检侧的必要同构注册（否则目录三新事件 lint 必红=§4.10 必红），语义 additive 零翻既有断言，提请双审判。
4. **check-alerts.mjs 最小接线行**（sourceErrors 聚合 +metrics.error 等 5 处，§B C4）——REQUEST C4「收据面扩展」授权范围内的必要接线，既有三采集器/EXIT 语义/RECEIPT 块结构零动。

## §G CMD 复跑清单（他人可复跑·EXIT 原值）

```
git -C <worktree> rebase feat/mysql-schema-skeleton                                   # EXIT=0 up-to-date
pnpm alerts:lint                                                                       # EXIT=0
pnpm metrics:prove                                                                     # EXIT=0
node scripts/alerts/check-alerts-queue.proof.mjs                                       # EXIT=0 (29/29)
MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/alerts/check-alerts-metrics-smoke.mjs    # EXIT=0 (11 步)
node scripts/alerts/check-alerts.proof.mjs                                             # EXIT=1 (仅 P5.2 预存红·§F1)
pnpm report:prove && pnpm quiz:prove && pnpm reaper:prove && pnpm report-retry:http:prove && pnpm interview-dispatch:unit:prove   # 全 EXIT=0
pnpm -C apps/worker prove:ha3-metrics-pool-errors                                      # EXIT=0
```

日志件：`alerts-lint.stdout.log` / `check-alerts-queue.proof.stdout.log` / `check-alerts-metrics-smoke.stdout.log` / `family-prove-exits.log` / `final-gates.log`（本目录）。

---

*HA-7 R-24 EXEC 收据 · 2026-10-11 · ha7-exec 席 · executed:awaiting_post_prove_dual · ⛔push · ⛔动主线 · ⛔触其他工作树 · Ban self-approve · alone≠dual · prove EXIT=0 ≠ DONE*
