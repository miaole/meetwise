# HA-7 · 队列指标收口（R-24 队列指标 + R-50/51 队列深度/生命周期——HA 簇中优先 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha7-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工** · alone≠dual）
**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席 `ha7-exec` 落卷 @本工作树 `line/ha-7-queue-metrics` · append-only · 上行原文零改）——rebase 主线 up-to-date EXIT=0（merge-base==tip==20186718·漂移表空表·协调方所述「主线已落 HA-3/R-47」本地未发生：HA-3 仍在 line/ha-3-db-resilience 未并主线）· W1 `worker_jobs_failed_total{queue}` counter（metrics.ts :77 METRIC+:113-114 四队列 0 预填·emit 四落点=interview-consumer.ts:184/quiz-consumer.ts:54/diagnosis-consumer.ts:53（EXEC 亲读调用链钉死·与 quiz 同构唯一消费侧调用处）/report-worker.ts:162·各恰一行·终态失败臂 stillMine/report-drain 臂·Q6 机检恰一行+码面零触失败语义词面·失败判定/重试上限/quarantine/CAS 零字节）· W2 目录纯追加三事件（queue_backlog/queue_stuck_running/queue_dead_letter·metrics_gauge 形·100/5/10·Ticket/Ticket/Page·既有九条目 git diff 零删除行亲证）+第四采集器 collectMetrics（live 单遍 GET WORKER_METRICS_URL 可覆写+`--metrics-file` 注入缝）+matcher 第四形 metrics_gauge（逐队列 max 去重·严格大于）·EXIT 语义零动（fail-closed live 源失效=1 沿 :27 既有语义·offline skipped 不误红）· W3 runbook §3.10-3.12 三小节（锚机检 12/12·下钻链=0042 谓词→消费端码锚 file:line 亲证）+§4 DLQ 只增不减已知风险登记（归 R-51 不修）+快照 vs for 差异声明（不伪装等价）· W4 KNOWN_METRICS+`worker_jobs_failed_total` 一行（**零加 alert.rules 新规则·R-22 同判**）· prove 矩阵 §4 十条全过亲跑（29 断言 queue proof EXIT=0·阈值三向×四队列/EXIT 四态/max 去重判别样本/白名单翻绿+过期重告/既有九事件零翻/P5.2 预存红基线对账/metrics:prove/lint 12 锚/静态边界 migrations=0）· **B.8 实栈烟测 EXIT=0**（沙箱最小栈 migrate Exit 0→worker-a /metrics 真通路 16/16 序列=三 gauge 12+新 counter 4→check-alerts --sandbox live 对真 /metrics 干净栈 EXIT=0 alerts=0→同快照 --metrics-file offline 复评同判 parity·down -v 全灭）· sweep 族隔离环 5×EXIT=0（report-bulkhead/quiz/reaper/report-retry-http 38 负路径/dispatch-unit）+邻接面 ha3-metrics-pool-errors EXIT=0·dispatch-pg 未跑列账（需 E2E_CLOUD_ISOLATED 云隔离·沿 HA-5 口径）· 收据 `receipts/ha-7/`（exec-receipt.md：漂移空表+W1-W4 逐条 file:line+prove 十条对账+attempts 6 次全账+停止条件三查未触发+交后登记四条·CMD 可复跑）· 环境预备如实披露：宿主补 linux-arm64 原生包沿 sanctioned recipe（临时 supportedArchitectures append→install --force→立即还原·yaml/lockfile/package.json git diff 零残留）· markers=0（改动集 180 新增行词面 grep EXIT=1 零命中·新 smoke "placeholder"×3=HA-5 同件逐字镜像如实注记）· est live=0（沙箱哑凭据·零外呼零计费）· pins 十一值零翻转 · 交后登记：HA-5 卷 proof P5.2 预存红（基 9f6edf8f 被主线 h4 focus 漂移·本刀三 sweep 文件零字节）+HA-5 卷 sandbox-smoke step5 在无宿主可达 /metrics 栈上将转红（W2④ fail-closed 明令的跨刀影响·处方归 HA-5 后刀）+W4 最小联动（MATCHER_TYPES 注册·否则 lint 必红）提请双审判 · ⛔push · ⛔动主线 · ⛔触其他工作树 · Ban self-approve · alone≠dual · prove EXIT=0 ≠ DONE（claimDone=false·走 post-prove 双审+nail）
**Date**: 2026-10-11
**审计项**: LEDGER HA 簇 R-24/R-50/R-51（`ai-docs/delivery/harness/product-campaign-LEDGER.md:134` 合并行「连接预算/PgBouncer/多实例状态/**队列指标**/登录锁定/scrypt/索引/**生命周期**」——R-24=队列指标·R-50/51=队列深度/生命周期，本刀取其队列观测语义·HA 门映射「HA 配套」·优先「中」）·R-47 归 HA-5（:133 **已 nail** @1d477a72）·R-17 归 HA-1（:128 已 nail）·R-18/R-19 归 HA-2（:129 已 nail）·R-22 归 HA-3（:130）·R-26 归 HA-4（:131）
**Base**: `feat/mysql-schema-skeleton` @`20186718`（本席 `git log -1` 亲证主线 tip = `20186718` docs(h3) nail·LEVEL-SCHEME 五档化正式解除）·分支 `line/ha-7-queue-metrics`（新立工作树 `meetwise-ha7`：`git worktree add ../meetwise-ha7 -b line/ha-7-queue-metrics 20186718` · 与 `meetwise-h2q`/`meetwise-regfix`/`meetwise-line-entpay` 同点分叉互不触碰）
**Honesty**: 蓝本与全部涉案码 file:line 起草席亲读（本章 §0 全录，@`20186718` 实树）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（纯 docs+脚本扩展，零 Key 零外呼零模型调用）。
**格式先例**: `ha-5-alerting-REQUEST.md`（§0-§8 同构·`nail:closed` @1d477a72·本刀与 HA-5 同踩 `scripts/alerts/`+`alerts-lint.mjs` 面·append-only 纪律见 §1/§5）·`ha-1`~`ha-4` REQUEST 同族。

---

## §0 立靶（蓝本+码面亲读 · file:line 全录）

蓝本锚 `product-campaign-LEDGER.md:134`（HA 簇表 R-20/21/23/**24**/36/37/44/**50/51** 合并行）零漂。**本刀核心诚实发现：R-24「队列指标」的 Prometheus 序列主体已在树**——四队列深度/租约过期/死信三 gauge ×（emit+接线+暴露+告警规则+lint 白名单+proof）六面俱全；真正缺口是三件：**失败计数序列零**、**check-alerts 队列积压阈值评估零（主缺口）**、**DLQ 生命周期零清理（登记不修）**。逐面亲读实证：

| 面 | 锚（亲读） | 现状（誊录+实证） |
|---|---|---|
| **已落一：三队列 gauge 命名单一真源** | `packages/ai-runtime/src/metrics.ts:74-76` | `jobsQueued: 'worker_jobs_queued'` / `jobsRunningExpired: 'worker_jobs_running_expired'` / `jobsDead: 'worker_jobs_dead'`——emit 点/告警 expr/alerts-lint 白名单三方共用同一常量（:63 注释自证防漂移纪律）；:67-68 明确 gauge=全局绝对值·多实例告警侧 `max()` 去重（切勿 sum 翻倍） |
| **已落二：emit+循环接线** | `apps/worker/src/main.ts:214`（`JOB_GAUGE_QUEUES = ['interview_job', 'report', 'quiz_job', 'diagnosis_job']`）·`:221-230`（`refreshJobGauges`：逐队列 `setGauge` 三值·缺行 0 兜底）·`:714-716`（`gaugeLoop` = `runDrainLoop` 每 `WORKER_GAUGE_INTERVAL_MS` 默认 15000ms 刷三组 gauge；:218「查询失败由 drain-loop 兜底吞掉、下拍重试」） | 四队列 ×（queued/runningExpired/dead）周期刷入进程内注册表——**R-24「四队列深度/租约过期」序列全活** |
| **已落三：DB 聚合源（无表权限网关函数）** | `packages/db/migrations/0042_runtime_observability_gateway.sql:5-26`（`gateway_job_gauges()`：四 UNION ALL——interview_job 谓词 `status='queued'`/`running AND lease_expires_at < clock_timestamp()`/`'failed'`·report 同形但死信=**quarantined**·quiz_job/diagnosis_job 同形；:45-47 REVOKE ALL FROM PUBLIC,app_role + GRANT EXECUTE TO app_gateway_role）·`packages/db/src/jobs/gateway-dispatch.ts:36-44`（`gatewayJobGauges` seam·:35「only aggregate counts, never jobs, users, prompts」） | 队列语义与权限面齐备；死信谓词各队列不同（report 隔离转人工、其余 failed 终态）——main.ts:209-212 头注亲证 |
| **已落四：/metrics 暴露端点（R-22 追加先例在位）** | `apps/worker/src/main.ts:237-266`（`startMetricsExposition`：`WORKER_METRICS_PORT` 默认 9091·host 默认 127.0.0.1 需显式 opt-in 私网 :239-241·:244-249 GET /metrics → `getMetrics().render() + renderPoolErrorsTotalLines()`）·`packages/db/src/principal.ts:885-887`（R-22 `meetwise_db_pool_errors_total` 逐 purpose 0 预填渲染行） | **零新端点即达**：/metrics 已是「注册表渲染 + R-22 计数器行尾追加」双源聚合面——本刀新 counter 沿同 seam 零端点改动 |
| **已落五：Prometheus 侧三条队列告警规则** | `docker/monitoring/alert.rules.yml:116-123`（`WorkerQueueBacklog`：`max(worker_jobs_queued) > 100` for 10m·warning）·`:126-133`（`WorkerStuckRunningJobs`：`max(worker_jobs_running_expired) > 5` for 5m·warning）·`:136-143`（`WorkerDeadLetterBacklog`：`max(worker_jobs_dead) > 10` for 10m·**critical**） | 三阈值（100/5/10）+时长+severity 全部已定——**check-alerts 侧阈值必须逐字对齐这三条**（§1 W2），不得另造第二套数 |
| **已落六：lint 白名单+proof** | `scripts/alerts-lint.mjs:31-33`（三 gauge 全在 `KNOWN_METRICS`）·`packages/ai-runtime/test/metrics.proof.ts:37,52,54`（三 gauge set/render/TYPE 断言全绿在树） | 既有回归基线：本刀扩面不得翻这些断言 |
| **缺口一（码·小）：失败计数 Prometheus 序列零** | rg 全仓 `jobs_failed|jobsFailed|job_failures`（apps/packages/scripts/docker·@`20186718`）=**零命中** | 失败侧现有信号仅三类：①DLQ 终态**存量**深度 `worker_jobs_dead`（已落三）；②文本事件 `interview reap failed`（`apps/worker/src/interview-consumer.ts:439`）；③HA-5 `reaper_takeover` JSON 事件（`interview-jobs.ts:269`/`report.ts:86`/`quiz-jobs.ts:88`）。**失败速率（次/窗）无序列**：DLQ 存量可被人工重排消化（`packages/db/src/report/report.ts:59-63` 手动 requeue 重置 attempts）——重排后 dead 回落，失败流量本身不留痕，`increase()` 类速率告警无原料。counter emit 缝已在手：消费端已 import `getMetrics, METRIC`（`interview-consumer.ts:8`）且有同形先例 `getMetrics().inc(METRIC.refundFailed)`（`:187`/`:442`）〖顺带登记（起草席）：`packages/ai-runtime/src/metrics.ts:66` 注释称 refundFailed「emit 点在 commerce…尚未接线」——`interview-consumer.ts:187`/`:442` 亲证**已接线**，注释为陈旧口径；本刀零改该注释（非队列面·如实登记防后席误判）〗 |
| **缺口二（主缺口·日志通道全盲）：check-alerts 零队列事件+零 metrics 采集** | `scripts/alerts/event-catalog.json`（九事件：db_pool_error/worker_drain_timeout/api_drain_timeout/reaper_takeover/migrate_failed/disk_enospc/disk_watermark/generation_progress_write_failed/ai_trace_persist_failed——**零队列条目**）·`scripts/alerts/check-alerts.mjs:98/116/146`（三采集器 logs/ps/df·`--log-file`/`--ps-file`/`--df-file` 三注入缝 :63-65）·:176（`matcherHits` 四形制 json/regex/compose_exit/df_watermark） | Prometheus **不常驻**是现状裁决（`docker/compose.prod.yml:329-330`「单机 4G 预览不常驻 Prometheus」·R-47 裁决·常驻归 S15）→ **已落五的三条队列规则今日无人评估=纸面告警**；唯一活评估路径 check-alerts 恰不查队列——「队列积压」这一 HA 最核心健康信号在双告警通道中**全盲**＝本刀主靶 |
| **缺口三（生命周期·登记不修）：DLQ 终态行零清理路径** | rg 全仓 `DELETE FROM public.interview_job|quiz_job|diagnosis_job|ai_report` + `retention|cleanup`（migrations+jobs 源·隐私擦除面除外）=零命中 | 四队终态行（failed/quarantined）只进不出：`worker_jobs_dead` 单调累积 → `WorkerDeadLetterBacklog`（>10）终将常响假噪。处置=runbook 已知风险登记 + 归 R-51 生命周期后刀（retention sweep 涉删改语义=重刀不在本刀，§2.8）；本刀只把「死信只增不减」如实写进运行手册 |
| **判定器先例（本刀扩面蓝本）** | `scripts/alerts/check-alerts.mjs:1-370`（HA-5 落卷：非 daemon 单遍即退 :17-27 头注·live 输入源失效 fail-closed=1「无法证明干净 = 不干净」:27·RECEIPT 块+CMD+EXIT 行 :368·白名单到期防腐化 :220）·`scripts/alerts/check-alerts.proof.mjs` + `check-alerts-sandbox-smoke.mjs`（HA-5 既有 proof 面·本刀扩面必须零翻）·`scripts/alerts-lint.mjs` 第 4 节（HA-5 rev2 落卷：目录结构+白名单到期日+runbook 锚解析三断言） | 本刀对 HA-5 已 nail 面**只追加不改**（既有九事件 matcher/EXIT 语义/白名单/收据格式零动），扩四采集器+三事件+一 matcher 形制——append-only 纪律进 §5 Ban |
| **阈值/severity 对齐源（不另造第二套数）** | `alert.rules.yml:116-143`（100/10m·warning｜5/5m·warning｜10/10m·critical）·事件分层口径 `ai-docs/observability/observability-strategy.md:112-116`（Page/Ticket/Trend） | check-alerts 侧映射：queued 积压=**Ticket**、stuck running=**Ticket**、DLQ=**Page**（对齐 alert.rules.yml critical + 目录先例 migrate_failed=Page）；check-alerts 单遍快照**无 `for` 去抖语义**（瞬时超阈即报·假阳性由白名单承担）——差异如实进 runbook，不伪装等价 |

**靶心一句话**：R-24 的「四队列深度/租约过期」Prometheus 序列+三条积压告警规则已在树且六面俱全（命名单一真源/emit/DB 网关//metrics 暴露/alert.rules/lint 白名单/proof），但 Prometheus 不常驻（S15 前置裁决）使这三条规则今日无人评估——唯一活评估通道 check-alerts 零队列事件零 metrics 采集＝积压告警双通道全盲；另失败速率计数器全仓零序列、DLQ 终态行零清理。本刀沿 R-22 先例（`meetwise_db_pool_errors_total` 计数器行尾追加·零新端点）+R-47/HA-5 先例（事件目录+check-alerts 判定器 append-only 扩面），把失败计数补成序列、把队列积压阈值落进 check-alerts、把 DLQ 生命周期风险登记进 runbook——Prometheus 常驻一刀不动。

## §1 范围（三件 · EXEC 依此实现）

**设计总原则**：沿 R-22 先例（principal.ts:885-887 计数器 + main.ts:249 渲染追加 = 零新端点零新面）与 HA-5 先例（目录机读唯一真源+判定器注入缝+白名单防腐）；简化优先（§6 重构原则「右列补齐之前左列不再加厚」）：阈值/分层**逐字复用** alert.rules.yml:116-143 既有裁决，零新参数面。

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 失败计数序列补齐（唯一新码动·最小）** | 缺口一（§0）·emit 缝先例 `interview-consumer.ts:187,442` | ① `packages/ai-runtime/src/metrics.ts` `METRIC` 追加 `jobsFailed: 'worker_jobs_failed_total'`（:71-102 名单单一真源·counter 以 _total 收尾沿命名纪律）；`registerBaselineMetrics` 追加四队列 0 预填（:108-147 同形——`for (const queue of ['interview_job','report','quiz_job','diagnosis_job']) m.inc(METRIC.jobsFailed, { queue }, 0)`，沿 :105「预注册基线序列为 0」纪律防「从未 emit=无序列=告警无数据」）。② emit 落四消费端**终态失败路径**（attempts 耗尽 markFailed/quarantined 定格处·非 requeue 可重试臂）各恰一行 `getMetrics().inc(METRIC.jobsFailed, { queue })`：interview 锚= `interview-consumer.ts:182`（markJobFailed 席点）·quiz 锚= `packages/db/src/jobs/quiz-jobs.ts:58`（markQuizJobFailed）的消费侧调用处 ·report 锚= `apps/worker/src/report-worker.ts:160`（markReportFailed/quarantined 臂）·diagnosis 精确落点 EXEC 亲读调用链后定，落 EXEC 附记。**零改失败判定/重试上限/quarantine/CAS 语义**（沿 HA-5 reaper 三行先例：只加观测行）。③ 标签仅 `queue` 低基数（:64 脱敏纪律：绝无 owner/PII/原文）。 |
| **W2 check-alerts 队列积压评估（主缺口·零新端点零 daemon）** | 缺口二（§0）·沿 HA-5 三采集器+注入缝形制 | ① **catalog 追加三事件**（`scripts/alerts/event-catalog.json` append-only·既有九条目零动）：`queue_backlog`（metrics_gauge 形·指标 `worker_jobs_queued`·阈值 >100·severity=**Ticket**）·`queue_stuck_running`（`worker_jobs_running_expired`·>5·**Ticket**）·`queue_dead_letter`（`worker_jobs_dead`·>10·**Page**）——阈值与 severity 逐字对齐 alert.rules.yml:116-143，目录 description 注明对齐锚。② **第四采集器**：`check-alerts.mjs` 追加 `collectMetrics`（:98/:116/:146 三兄弟同形）——live 模式单遍 GET `http://127.0.0.1:${WORKER_METRICS_PORT:-9091}/metrics`（env `WORKER_METRICS_URL` 可覆写·非 daemon 抓完即退）；offline 注入缝 `--metrics-file <path>`（沿 :63-65 三缝同形·CI/本地样本喂入通道·prove 依赖此缝）。③ **新 matcher 形制 `metrics_gauge`**（:176 `matcherHits` 追加第四形）：解析 Prom 文本行 `name{labels} value`，按 `max by (queue)` 取各队列值逐条评估阈值（沿 metrics.ts:68 多实例 max 去重口径）。④ **EXIT 语义沿用 HA-5 不改**：未决（非白名单）Page/Ticket 告警=1·干净=0·`--report` 恒 0；**live 模式 metrics 源抓取失败=fail-closed 1**（沿 :27「无法证明干净 = 不干净」既有语义·顺带充当「worker /metrics 不可达」探测信号）；offline 无 `--metrics-file`→skipped（沿 :108 logs 同形）。⑤ 既有九事件跑老通路（logs/ps/df）零动，收据落 `receipts/ha-7/`（沿 HA-5 收据形制）。 |
| **W3 runbook 追加+生命周期风险登记（docs）** | `ai-docs/observability/alerting-runbook.md`（§3 九小节现状）·缺口三（§0） | ① §3 追加三小节（3.10-3.12·每节 severity+响应动作+下钻锚沿既有形制·下钻链：告警条目→`gateway_job_gauges()` 0042 谓词→对应队列消费端码锚）；② §4/§6 追加**DLQ 只增不减已知风险登记**（四队终态行零 retention·`WorkerDeadLetterBacklog` 长期假噪风险·处置归 R-51 生命周期后刀/S15 运维刀·本刀零修）；③ 追加 check-alerts 快照语义 vs Prometheus `for` 去抖差异声明（不伪装等价）；④ 分层口径逐字对齐 observability-strategy.md:112-116 不另造（沿 HA-5 byte 级 verbatim 纪律）。 |
| **W4 alerts-lint 白名单追加（一行）** | `scripts/alerts-lint.mjs:31-33` 邻位 | `KNOWN_METRICS` 追加 `"worker_jobs_failed_total"`（防新 expr 引用即失败的一行；本刀**不加任何 alert.rules 新规则**——R-22 先例 db_pool_errors_total 同判：观测原料先行，速率告警规则归 S15 常驻后一并评估）；既有 1-4 节校验逻辑零动，第 4 节目录/白名单/runbook 锚断言自动覆盖 W2 新三事件（锚解析到 W3 小节=悬空锚机检拒绝）。 |

## §2 非范围（全列 · 越界即废）

1. **Prometheus/Alertmanager/Grafana 常驻栈（S15 买云后刀）**——`docker/compose.monitoring.yml`、`docker/monitoring/prometheus.yml`、`docker/monitoring/alert.rules.yml`、`docker/monitoring/alertmanager.yml` **四文件零触**（含：不为新 counter 加速率告警规则、不动既有三条队列规则的阈值/for/severity、Watchdog/接收端/Grafana 面板）。
2. **R-20/R-21/R-23 前刀**（连接预算/PgBouncer/多实例状态——LEDGER :134 同行其余项·各自后刀）。
3. **R-17/R-18/R-19/R-22/R-26/R-47 已 nail 面零回触**：HA-1 拓扑、HA-2 drain 链、HA-3 池韧性（`meetwise_db_pool_errors_total` 渲染链零动）、HA-4 备份、HA-5 目录既有九事件/check-alerts 既有三采集器+EXIT 语义+白名单/`check-alerts.proof.mjs` 既有断言（只允许扩不允翻）。
4. **DLQ retention/生命周期清理（R-51 本体）**——终态行 sweep/归档/DELETE 零实现（重刀涉删改语义，runbook 登记为已知风险即止，§1 W3②）。
5. **`gateway_job_gauges()` SQL 零改**——0042 函数四队列谓词/权限面零动（不加列不加队列不改死信谓词）；DB 侧零新迁移。
6. **队列消费/租约/sweep/CAS/重试上限/quarantine 语义零改**——W1 emit 只在终态失败路径旁挂一行观测，任何失败判定分支不重排。
7. **通知通道任何形式 + pino 日志框架 + `metrics.ts:66` refundFailed 陈旧注释**——零实现零顺手改（注释勘误已 §0 登记，归该面后刀）。
8. 顺带非范围：`refreshJobGauges` 既有三 gauge 语义与 15s 节奏零动、`WORKER_METRICS_*` env 形面零改、api 侧 MetricsController 零触。

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `packages/ai-runtime/src/metrics.ts` | METRIC 名单 +1（jobsFailed）；registerBaselineMetrics 四队列 0 预填 +4 行（W1①） |
| C2 | 四消费端终态失败路径（interview/quiz/report/diagnosis） | 各恰一行 `getMetrics().inc(METRIC.jobsFailed, { queue })`；诊断面精确落点 EXEC 定+附记；失败语义零改（W1②） |
| C3 | `scripts/alerts/event-catalog.json` | 追加三事件条目（queue_backlog/queue_stuck_running/queue_dead_letter·metrics_gauge 形·阈值 100/5/10·Ticket/Ticket/Page·runbook 锚 3.10-3.12）；既有九条目逐字节零动（W2①） |
| C4 | `scripts/alerts/check-alerts.mjs` | 第四采集器 collectMetrics（live GET + `--metrics-file` 缝）+ matcher 形制 metrics_gauge + 收据面扩展；既有三采集器/四 matcher/EXIT 语义/RECEIPT 格式零动（W2②③④） |
| C5 | `ai-docs/observability/alerting-runbook.md` | §3 三小节追加 + DLQ 只增不减已知风险登记 + 快照 vs for 差异声明（W3） |
| C6 | `scripts/alerts-lint.mjs` | KNOWN_METRICS +1 行；第 4 节断言自动覆盖新事件（W4） |

## §4 prove 判据（验证矩阵 · EXEC 必须全过）

**A. 注入式确定性 proof（`--metrics-file` 注入缝喂样本·无 docker 依赖）**

1. **阈值三向×四队列断言**：构造 /metrics 文本样本逐事件断言——`worker_jobs_queued{queue="report"} 101` → queue_backlog 条目产出（queue/severity=Ticket/count 对）；同形 99 → 零条目；恰 100 → 零条目（`>100` 严格大于语义）；三指标 × 四 queue 标签各至少一命中断言。
2. **EXIT 语义断言**：样本含未决 Page/Ticket 队列事件 → EXIT=1；干净样本 → 0；`--report` → 恒 0 且清单照出；live 模式 metrics 源失效（连接拒/读败）→ fail-closed=1；offline 无 `--metrics-file` → skipped 不误红。
3. **多实例 max 去重断言**：同指标两实例行（同 queue 异值）取 max 评估——101 与 3 并存 → 以 101 报，非 sum（沿 metrics.ts:68 口径）。
4. **白名单假阳性防断言**：队列事件进白名单（带到期日）→ 清单零条目；过期条目 → 重新告警（沿 HA-5 既有断言形制·新事件同样受防腐化约束）。
5. **既有九事件零翻断言**：`check-alerts.proof.mjs` 既有断言全量原样通过（扩面零翻 HA-5 卷）；目录既有九条目 `git diff` 逐字节零动。
6. **新 counter render 断言**：`metrics.proof.ts` 追加——四队列 baseline 0 预填行 + `inc` 后 `worker_jobs_failed_total{queue="..."}` 渲染 + `# TYPE ... counter`；emit 点真源断言：C2 四落点 grep 实证在终态失败臂（非 requeue/成功臂）；`git diff` 断言 C2 仅 ±观测行、失败判定/重试/quarantine 逻辑零改。
7. **runbook 锚机检断言**（沿 HA-5 §4.9·载体=alerts-lint 第 4 节既有机制）：三新事件 runbook 锚解析到 3.10-3.12 实际小节；DLQ 已知风险登记节+快照/for 差异声明词面机检。

**B. 实栈烟测（轻·单遍·沙箱哑凭据·est live=0 铁律）**

8. **/metrics 真通路**：沿 `compose.ha.sandbox.yml` 形制零改复用起最小 worker → GET /metrics 含三 gauge+新 counter 全 12 序列（4 队列 ×4 指标）→ check-alerts live 通路对真 /metrics 评估产出 RECEIPT（干净栈=EXIT 0）。
9. **静态边界断言**：`git diff 20186718..HEAD --stat` 断言监控栈四文件、`docker/compose.prod.yml`、`packages/db/migrations/*` 零出现在改动清单。
10. **既有零回归**：`pnpm alerts:lint` 全绿（25 条规则+既有白名单零动）；消费端族 prove 跑/未跑如实列账（`report-bulkhead`/`report-retry-http`/`interview-dispatch-fairness`·红项基线对账禁 skip-as-pass，沿 ha-5 rev2 口径）；全部收据入 EXEC 记账 + `receipts/ha-7/`，Ban retry-to-green。

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 触碰监控栈四文件**（compose.monitoring.yml/prometheus.yml/alert.rules.yml/alertmanager.yml——S15 边界·含不加新告警规则，越界即废）· **Ban 任何常驻进程/daemon**（check-alerts 单遍即退纪律零破）· **Ban 翻转已 nail 面**（HA-5 目录九事件/matcher 四形制既有语义/EXIT 语义/check-alerts.proof 既有断言/既有三 gauge 语义与 15s 节奏/0042 SQL/R-22 渲染链零改——对 HA-5 卷只允许 append-only 扩）· Ban 改失败判定/重试上限/quarantine/CAS/sweep 语义（W1 只挂观测行）· Ban 新增 npm 依赖（纯 node 沿 alerts-lint/check-alerts 先例）· Ban 阈值另造第二套数（100/5/10 逐字对齐 alert.rules.yml:116-143）· Ban 通知通道实现或占位 · Ban DLQ 清理/retention 实现（登记不修）· Ban 把本刀宣称「R-24 已全量闭环/Prometheus 已生效/队列告警闭环已完成」——本刀=失败计数序列补齐+check-alerts 队列评估补盲+风险登记，常驻评估归 S15（Non-claims §7 同口径）· Ban secrets/Key 入库（样本 /metrics 文本脱敏·收据不含真实主机敏感信息）· Ban SSOT 无关触碰（LEDGER/backlog 只读引用，nail 时才改）。

## §6 pins（十一值照抄 `harness/entpay-slice2-REQUEST.md:139` 经 ha-5 同款 · 零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ R-24 全量闭环（Prometheus 侧三 gauge+三规则已在树·其评估常驻归 S15）≠ R-51 生命周期收口（DLQ retention 零修只登记）≠ R-50 队列深度治理（深度口径 0042 既有零改·本刀只补观测消费侧）≠ 告警闭环全量（HA-5 §7 边界同）≠ check-alerts 与 Prometheus 等价（快照无 for 去抖·runbook 如实声明）≠ worker 失败语义加固（只观测不改判定）≠ HA（R-17 归 HA-1 已 nail·本刀不翻 haStatus）· `worker_jobs_failed_total` 为本实例 counter（跨实例告警侧 `sum(increase())`——S15 启用时口径）· prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码/监控栈/目录/脚本、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。任何越 §2 非范围冲动（顺手给新 counter 加告警规则、动三条既有队列规则阈值、实现 DLQ 清理、改 refundFailed 陈旧注释、触 R-20/21/23 面）= 停手上报，不借机修。
