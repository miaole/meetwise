# HA-5 · 告警闭环轻量面（R-47 告警闭环占位——Prometheus 不常驻 · HA 簇中优先 · EXEC REQUEST 起草）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha5-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工** · alone≠dual）
**Date**: 2026-10-10
**审计项**: LEDGER HA 簇 R-47 P1（`ai-docs/delivery/harness/product-campaign-LEDGER.md:133`「告警闭环占位（Prometheus 不常驻）」·HA 门映射「告警」·优先「中」）·R-17 归 HA-1（:128 已 nail）·R-18/R-19 归 HA-2（:129 已 nail）·R-22 DB 韧性后刀（:130）·R-26 备份归 HA-4 线（:131）
**Base**: `feat/mysql-schema-skeleton` @`9f6edf8f`（本席 `git log -1` 亲证主线 tip = `9f6edf8fa92832d4d3e394be8178f9dcbfc9dc0b` docs(ha-1) nail）·分支 `line/ha-5-alerting`（新立工作树 `meetwise-ha5`：`git worktree add ../meetwise-ha5 -b line/ha-5-alerting 9f6edf8f` · 与 `meetwise-ha2/3/4` 同点分叉互不触碰）
**Honesty**: 蓝本与全部涉案码 file:line 起草席亲读（本章 §0 全录，@`9f6edf8f` 实树）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（纯日志扫描+脚本+docs，零 Key 零外呼零模型调用）。
**格式先例**: `ha-1-redundancy-REQUEST.md` / `ha-2-graceful-REQUEST.md`（§0-§8 同构）；`meetwise-ha3` 树当前无 ha-3 起草（本席亲证 `git -C meetwise-ha3 status` 干净@tip `9f6edf8f`·harness 目录无 ha-3-\* 档），故格式沿 ha-1/ha-2。

---

## §0 立靶（蓝本+码面亲读 · file:line 全录）

蓝本锚 `product-campaign-LEDGER.md:133`（HA 簇表 R-47 行）零漂。逐面亲读实证：

| 面 | 锚（亲读） | 现状（誊录+实证） |
|---|---|---|
| **R-47「占位」本体：监控栈骨架已备但不常驻** | `docker/compose.monitoring.yml:12-69` | Prometheus v2.54.1 + Alertmanager v0.27.0 + Grafana（profile `grafana` 可选 :58-59）——**独立 compose 手动起**（文件头注 :2-4「docker compose -f … up -d」），不在 `compose.prod.yml` 服务清单内；`docker/compose.prod.yml:329-330` 注释亲证口径：「Metrics 由独立的 docker/compose.monitoring.yml 抓取（**单机 4G 预览不常驻 Prometheus**）」→ 指标告警面在生产形态下**无人评估**＝闭环断点一 |
| **闭环断点二：接收端全占位** | `docker/monitoring/alertmanager.yml:46-58` | receivers `default`/`critical`/`watchdog` 三者**全部空壳**（无 `webhook_configs`·文件头注 :2 自认「接收端一律留占位注释：不写任何真实 webhook/邮箱/密钥」）→ 即使 Prometheus 常驻，告警发进黑洞 |
| **指标暴露面（真实·已被 rules 引用）** | api `apps/api/src/modules/metrics/metrics.controller.ts:9-11`（`@Controller('metrics') @Get()`）+ `apps/api/src/main.ts:158`（onResponse hook 记 http_requests_total/http_request_duration_ms）；worker `apps/worker/src/main.ts:233-261`（`startMetricsExposition`·`WORKER_METRICS_PORT` 默认 9091·仅 `expose` 私网 `docker/compose.prod.yml:334-336`） | 抓取配置 `docker/monitoring/prometheus.yml:20-38`（api:8787 + worker:9091）；告警规则 `docker/monitoring/alert.rules.yml:13-271` 共 **22 条**（api SLO 6 + worker/模型/RAG/费用 15 + MonitoringWatchdog :264）；防假告警 lint `scripts/alerts-lint.mjs`（指标白名单 :20-49·`package.json:453` `alerts:lint`）；deploy 门禁已查栈结构 `scripts/deploy-check.mjs:10,120-127`（prometheus/alertmanager 声明+镜像钉版+抓 api:8787/worker:9091+禁 host.docker.internal）——**指标面基建完好，只欠常驻+接收端（S15）**〖rev2 勘误（席2）：本行「共 **22 条**（api SLO 6 + worker/模型/RAG/费用 15 + MonitoringWatchdog :264）」为起草席误记——alert.rules.yml 实数 **25 条** `- alert:`（落卷席逐行亲证@5d6dd7de：api SLO 6 条 :18-:71 + worker/RAG/模型/费用 18 条 :84-:251 + MonitoringWatchdog 1 条 :264 实锚）；本档同误记共**五处**（:30/:40/:62/:78 同步注记·处方列三处·实物五处以实物为准）——原文措辞零改·以注记承载〗 |
| **日志面缺口一：结构化事件近零** | `packages/db/src/principal.ts:886-897` | `observePoolError` 是全仓**唯一 JSON 结构化事件**：`console.error(JSON.stringify({ event: 'db_pool_error', purpose, count, error_name, error_message }))`（:896·dedupe `observedPoolErrors` + `poolErrorTotal` 计数）——池 error 的告警原料已就位〖rev2 勘误（席1）：本行「全仓**唯一** JSON 结构化事件」为起草席误记——全仓实为**三个** JSON 结构化事件，db_pool_error 是**唯一直接告警向**；另两锚亲证：`apps/worker/src/generation-progress.ts:57`（`generation_progress_write_failed`·事件名在 :58·进度写失败 best-effort 旁路日志）+ `packages/ai-runtime/src/invoke.ts:387`（`ai_trace_persist_failed`·事件名在 :388·trace 持久化失败旁路日志）——两事件对 alert.rules.yml 与 alerts-lint.mjs 指标白名单**零命中**（rg 亲证@5d6dd7de＝告警双通道皆盲·如实登记）；目录处置见 §1 W1① rev2 注记〗 |
| **日志面缺口二：HA-2 关键事件为 key=value 文本非 JSON** | `apps/worker/src/main.ts:787`（`worker_drain_timeout signal=${signal} in_flight=${inFlight.join(',')}`）·`apps/api/src/main.ts:82`（`deps.error('api_drain_timeout')`） | HA-2 已 nail 的两条 drain 超时事件：console.error 人读文本（key=value 形）。**本刀不改这两处码面**（HA-1/HA-2 已 nail 面零回触），检查脚本解析器须**双形兼容**（JSON 事件形 + key=value 文本形） |
| **日志面缺口三：reaper 接管无成功事件** | 失败侧 `apps/worker/src/interview-consumer.ts:439`（`interview reap failed`）·:225（`reservation lease renew failed`）；接管本体 `packages/db/src/interview/interview-jobs.ts` / `report/report.ts` / `jobs/quiz-jobs.ts`（sweepStuckInterviewJobs/sweepReports 族） | reap **失败**有日志、**接管成功**（sweep 重领孤儿 job）零结构化事件——「worker 崩了但系统自愈了」这一最重要健康信号今天不可观测＝盲区 |
| **日志面缺口四：migrate 失败无告警面** | `docker/compose.prod.yml:223-237`（migrate 服务：migrate-cli.ts + cost-configure.ts · `restart: "no"`）·:246-248（worker `depends_on: migrate: condition: service_completed_successfully`） | migrate 失败信号只在 compose 事件流与容器退出码里（worker 因此不启动）——无任何日志扫描/告警触点；一次性任务（restart:no）也不会被 Prometheus `up` 指标覆盖 |
| **日志面缺口五：ENOSPC 类全盲** | rg 全仓 `ENOSPC|No space left|磁盘` （apps/packages/scripts，@`9f6edf8f`） | 零磁盘水位观测、零 ENOSPC 事件处理；`docker/compose.prod.yml` 无任何 `logging:` 块（rg 零命中）→ docker 默认 json-file driver·宿主盘写满即全线静默故障——恰是「告警闭环」最该兜的底 |
| **日志面缺口六：无统一结构化日志框架** | `ai-docs/observability/observability-strategy.md:117-127`（§6：`@meetwise/observability` pino 包·CI 日志禁词扫描——均**规划未落**） | 全仓 console.\* 人读文本为主体；pino/框架迁移=重刀不在本刀（§2.4） |
| **判定器先例（本刀检查脚本蓝本）** | `scripts/ha/ha-status.mjs:1-50` | HA-1 拓扑判定器：机械判据 fail-closed（不齐 EXIT=1）·`--report` 只评估降级输出不非零·RECEIPT 块+CMD+EXIT 行 stdout·机器可读 JSON 收据落 `receipts/ha-1/ha-status.receipt.json`——本刀 check-alerts 脚本沿同形制 |
| **告警分层策略（既有文档锚）** | `ai-docs/observability/observability-strategy.md:110-118`（§5：Page/Ticket/Trend 三层·「告警必须可一键下钻…无法下钻的告警=噪音」:117） | 本刀事件目录的 severity 与 runbook 链接须落此分层口径（Page/Ticket/Trend），不另造分级 |

**靶心一句话**：R-47 说「告警闭环占位」——指标面骨架（compose.monitoring + 22 条 rules + lint + deploy 门禁）齐而不转（不常驻+接收端空壳=归 S15），日志面则连「占位」都没有：全仓唯一结构化事件是 db_pool_error，drain 超时是文本、reaper 接管/migrate 失败/磁盘写满四类关键事件零可观测。本刀把日志面从零到一落成「事件目录 + 本地检查脚本 + 运行手册」的轻量闭环，Prometheus 常驻一刀不动。〖rev2 勘误（席1+席2 sweep）：本行两处随 §0 勘误同步——「22 条 rules」实数 25 条；「全仓唯一结构化事件是 db_pool_error」实为三个 JSON 结构化事件（唯一直接告警向=db_pool_error·另两锚 generation-progress.ts:57 / invoke.ts:387 见 §0 缺口一行勘误）——原文措辞零改·以注记承载〗

## §1 范围（轻量告警三件 · EXEC 依此实现）

**设计总原则**：Prometheus 不常驻是现状裁决（compose.prod.yml:329）——本刀**尊重并绕开**它：告警原料从「指标抓取」换成「结构化日志+compose 事件+宿主水位」，消费方式从「常驻评估」换成「按需检查脚本」（手动/CI/cron 均可，非 daemon）。零新增依赖（纯 node，沿 alerts-lint.mjs/ha-status.mjs 无依赖先例）。

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 关键事件目录 + 缺口事件补齐（最小码动）** | 事件全景见 §0 六缺口 | ① **事件目录机读文件**（建议 `scripts/alerts/event-catalog.json`·EXEC 可随仓惯例定名）：唯一真源，每事件条目声明 `event` 名 / `matcher`（JSON 事件形=精确 event 名匹配；文本形=正则）/ `severity`（Page/Ticket/Trend 沿 observability-strategy.md:112-116）/ `source`（码锚 file:line）/ `runbook` 锚（W3 文档节锚）。首批事件清单：`db_pool_error`（principal.ts:896·已有）·`worker_drain_timeout`（worker main.ts:787·文本形）·`api_drain_timeout`（api main.ts:82·文本形）·`reaper_takeover`（**新增**·见②）·`migrate_failed`（**compose 事件源·零码动**·读 migrate 容器 Exit 非 0 或其日志尾窗 error）·`disk_enospc`（**模式匹配**·任一日志行含 `ENOSPC`/`No space left` 即中）+ `disk_watermark`（**宿主 df 探针**·阈值默认 85%·零码动）。② **补 `reaper_takeover` 结构化事件**（唯一新码动点）：sweep 重领成功路径（`packages/db/src/interview/interview-jobs.ts`/`report/report.ts`/`jobs/quiz-jobs.ts` 的 sweep 族被 worker 消费侧实际领到孤儿 job 处——EXEC 亲读 sweep 调用链后定精确行）落 `console.warn(JSON.stringify({ event: 'reaper_takeover', kind, job_ref, prev_lease_expired: true, … }))` 沿 principal.ts:896 JSON 先例；**只加一行观测日志，零改 sweep 选取/租约/CAS 语义**。③ 既有 `worker_drain_timeout`/`api_drain_timeout`/`interview reap failed` 文本事件**零改码**，目录以 matcher 声明兼容〖rev2（席1 双盲事件目录处置·二择一裁决=**纳入目录首批**）：首批事件清单增补两条——`generation_progress_write_failed`（severity=**Trend**·码面头部纪律自认「进度不是健康信号」generation-progress.ts:11·只周期复盘不做健康告警）+ `ai_trace_persist_failed`（severity=**Trend**·事件含 P0001 幂等命中正常重放形态〔apps/api/test/uc-e2e-028-nhp-fault.proof.ts:220-224 亲证〕直接 Page/Ticket 必噪音化·复盘看 errorName/pgCode 分布再定是否升 Ticket）；C1「≥6 事件条目」按 **9** 实数同步。顺带登记（席1）：`interview-consumer.ts:225`（`reservation lease renew failed`·文本形失败日志·性质同 :439 reap failed）＝**首批外**（W1③ 零改兼容口径·不列首批 matcher 断言面）；`apps/worker/smoke/cloud-readiness.ts:15`（`cloud_connectivity_receipt`·同族 `apps/worker/smoke/cloud-test-serial.ts:12` `cloud_test_serial_receipt` 落卷席 sweep 补登）＝**非事件**（烟测工具收据形·不入目录不入事件普查）——排除亦登记·不沉默缺席〗 |
| **W2 本地告警检查脚本（判定器）** | 新增 `scripts/alerts/check-alerts.mjs`·形制沿 `scripts/ha/ha-status.mjs:1-50` | ① **输入源三路**：`docker compose -f docker/compose.prod.yml logs --since <窗>`（默认窗 env 可调，建议 24h）+ `docker compose ps`（migrate/核心服务 Exit 态）+ 宿主 `df`（水位）；无 docker 时对 `--log-file <path>` 直读退化（CI/本地样本喂入通道，prove 依赖此注入缝）。② 目录驱动扫描：逐目录事件跑 matcher → 产出**告警清单**（event/severity/first_seen/count/样本行/runbook 锚），stdout 为 RECEIPT 块 + CMD+EXIT 行（沿 ha-status.mjs 形）。③ **白名单假阳性防**：`scripts/alerts/alert-whitelist.json`（每条目=event+窗口理由+到期日——防白名单腐化，无到期日的条目 lint 拒绝）；已知一次性事件（deploy 窗 migrate 单次、重启窗 pool_error burst）不产告警条目。④ **EXIT 语义 fail-closed**：存在未决（非白名单）Page/Ticket 告警 → EXIT 1；干净 → 0；`--report` 模式只评估降级输出恒 0（沿 ha-status.mjs `--report` 先例）；机器可读 JSON 收据落 `receipts/ha-5/check-alerts.receipt.json`。⑤ **非 daemon**：脚本单遍扫完即退，零常驻进程——尊重单机 4G 预览现状 |
| **W3 告警运行手册（文档）** | 新增 `ai-docs/observability/alerting-runbook.md` | ① 事件目录人读面：每事件 severity 分层（Page=触碰零丢失红线立即响应/Ticket=降级在发生工作时间排查/Trend=周期复盘——逐字对齐 observability-strategy.md:112-116）+ 响应动作 + 下钻锚（日志样本行→对应码面/账本，落 :117「可下钻」纪律）。② **与 Prometheus 栈的分工声明**：指标面（alert.rules.yml 22 条）归 S15 常驻后启用；本刀日志面补其盲区（进程 stderr、compose 一次性任务、宿主磁盘——皆 `up` 指标抓不到的面）。③ **S15 边界登记**：Prometheus/Alertmanager/Grafana 常驻化、alertmanager.yml receivers 真实化（webhook/值班通道）、通知链路=买云后刀（本刀 runbook 只登记，不占位实现）。④ 检查脚本使用说明（窗口/白名单/EXIT/收据）〖rev2（席2 勘误+席1 同步）：本行「alert.rules.yml 22 条」实数 **25 条**（§0 勘误同源·原文零改）；runbook 人读面与 §4.9 锚解析断言面同步覆盖 W1① rev2 增补两 Trend 事件〗 |
| **W4（轻·可裁）alerts-lint 扩展** | `scripts/alerts-lint.mjs`（既有 :20-49 指标白名单零动） | 追加事件目录结构校验：每条目必含 event 名/matcher/severity/runbook 锚、白名单条目必含到期日——缺任一即 lint 失败（防目录腐化，同「防假告警」初衷）。**EXEC 可裁**：若目录结构在 W2 脚本内已自校验，本件可并入脚本启动检查，不强制双处实现——二选一，prove 须覆盖「目录腐化可被机检拒绝」断言〖rev2（席2 §4.9 载体二选一裁决）：runbook 锚存在性机检载体选定 **W4 lint 扩展路径**（静态·无 docker 依赖·沿 `package.json:453` alerts:lint 既有入口）；check-alerts 启动自检路径不选——运行时判定器不背文档机检职责；本裁决不改本行原「可裁」条款对目录结构校验落点的留给（见 §4.9）〗 |

## §2 非范围（全列 · 越界即废）

1. **Prometheus/Alertmanager/Grafana 常驻栈与通知链路（S15 买云后刀）**——`docker/compose.monitoring.yml`、`docker/monitoring/prometheus.yml`、`docker/monitoring/alert.rules.yml`、`docker/monitoring/alertmanager.yml` **四文件零触**（含 receivers 真实化、Watchdog 心跳外接、Grafana 面板）。本刀不把它们「修好」，只把边界写进 runbook。
2. **R-22 DB 韧性**（keepAlive/query_timeout/池参数）——后刀（LEDGER :130）。本刀只**读** db_pool_error 事件，不动任何池行为。
3. **R-26 备份/PITR**——HA-4 线（LEDGER :131）互不触碰。
4. **pino/@meetwise/observability 全量日志框架迁移**（observability-strategy.md:117 规划）——重刀，本刀唯一新码动=W1② 一行 reaper_takeover 观测日志；其余日志面零改写。
5. **日志轮转/docker logging driver 配置**——compose.prod.yml `logging:` 块零新增（宿主 json-file 无界风险只在 runbook 登记为已知风险，处置归 S15 运维刀）。
6. **通知通道任何形式**（webhook/钉钉/邮件/值班电话）——零实现零占位配置。
7. 顺带非范围：HA-1 拓扑面（compose.ha\*.yml/ha-status.mjs 本体零改——只沿其形制）、HA-2 关闭链码面（worker/api shutdown 逻辑零回触）、`metricsServer`/MetricsController 指标暴露面、grafana profile。

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `scripts/alerts/event-catalog.json`（新增·名 EXEC 可随仓惯例定） | 事件目录机读唯一真源：≥6 事件条目（db_pool_error / worker_drain_timeout / api_drain_timeout / reaper_takeover / migrate_failed / disk_enospc / disk_watermark），每条目含 event/matcher/severity/source 码锚/runbook 锚（W1①）〖rev2（席1）：首批条目按 W1① rev2 注记增补两条=**9** 条（generation_progress_write_failed / ai_trace_persist_failed·均 Trend）〗 |
| C2 | `packages/db/src/interview/interview-jobs.ts` 或 `report/report.ts` / `jobs/quiz-jobs.ts` sweep 族（**唯一新码动**·W1②） | sweep 重领成功路径补一行 `reaper_takeover` JSON 观测日志（沿 principal.ts:896 形制）；**零改 sweep 选取/租约/CAS 语义**（精确落点 EXEC 亲读调用链后定，落 REQUEST 附记） |
| C3 | `scripts/alerts/check-alerts.mjs`（新增·W2） | 判定器脚本：三路输入（compose logs/ps + df；`--log-file` 退化注入缝）·目录驱动 matcher（JSON 形+文本形双兼容）·白名单消费·RECEIPT 块+CMD+EXIT 行·`--report` 降级·EXIT 语义（未决 Page/Ticket=1·干净=0）·JSON 收据落 `receipts/ha-5/` |
| C4 | `scripts/alerts/alert-whitelist.json`（新增·W2③） | 假阳性白名单：每条目 event+理由+到期日；无到期日条目=结构非法 |
| C5 | `ai-docs/observability/alerting-runbook.md`（新增·W3） | 运行手册：分层口径逐字对齐 observability-strategy.md:112-116 · 每事件响应动作+下钻锚 · Prometheus 栈分工与 S15 边界登记 · 脚本使用说明 · docker logging 无界已知风险登记 |
| C6 | `scripts/alerts-lint.mjs`（既有·W4 可裁） | 追加事件目录+白名单结构校验；既有指标白名单（:20-49）与 22 条规则校验逻辑**零改**〖rev2 勘误（席2）：「22 条」实数 25 条（§0 勘误同源·原文零改）〗 |

## §4 prove 判据（验证矩阵 · EXEC 必须全过）

**A. 注入式确定性 proof（无 docker 依赖·`--log-file` 注入缝喂样本，沿仓内 \*.proof.ts/mjs 形制）**

1. **事件→告警条目断言**：构造样本日志（含全部目录事件各≥1 条）喂脚本——逐事件断言告警清单产出对应条目（event 名/severity/count/样本行逐字段对）；`db_pool_error` 走 JSON 形 matcher、`worker_drain_timeout`/`api_drain_timeout` 走文本形 matcher，**双形各至少一条断言**。
2. **EXIT 语义断言**：样本含未决 Page/Ticket 事件 → EXIT=1；干净样本 → EXIT=0；同一样本 `--report` → 恒 EXIT=0 且清单照出（fail-closed 与 report 降级两语义并存不混淆）。
3. **假阳性防断言**：同一事件进白名单（带到期日）→ 清单零条目、EXIT 翻绿；白名单**过期条目**（到期日已过）→ 必须重新告警（白名单不是永久豁免）。
4. **目录腐化机检断言**：缺 severity / 缺 matcher / 白名单缺到期日——任一构造坏目录 → 机检拒绝（W4 lint 或脚本启动自检，二选一路径断言）。
5. **reaper_takeover 真源断言**：C2 落点 grep 实证事件存在于 sweep 成功路径（非 catch/失败分支）；`git diff` 断言 C2 仅 ±观测日志行、sweep 选取/租约/CAS 逻辑零改。

**B. 实栈烟测（轻·单遍·沿沙箱形制，不要求长跑）**

6. **实容器日志通路**：起最小栈（单 worker 或沙箱形态·**沙箱哑凭据沿 ha-1 沙箱形制·est live=0 铁律**）→ 写一条含 `db_pool_error` JSON 的事件进其日志（或注入 env-gated 触发）→ `docker compose logs --since` 通路下脚本抓到并产条目；migrate 服务 Exit 0 → 零 migrate_failed 条目。〖rev2 备案（席2·防 ha-2 rev2-②/C8 私造载体先例重演）：沙箱载体**零改复用 `docker/compose.ha.sandbox.yml` 形制**（与 §2.7「compose.ha\*.yml 本体零改·只沿其形制」同口径）——EXEC 不得私造清单外 compose 载体〗
7. **静态边界断言**：`git diff 9f6edf8f..HEAD --stat` 断言 `docker/compose.monitoring.yml`、`docker/monitoring/*` 三件、`docker/compose.prod.yml` **零出现在改动清单**（S15 边界机械可证）。
8. **既有零回归**：`pnpm alerts:lint` 全绿（22 条指标规则白名单零动）；`scripts/deploy-check.mjs` 不因新增文件误红；全部收据（EXIT、清单 JSON、耗时）入 EXEC 记账 + `receipts/ha-5/`，Ban retry-to-green。〖rev2（席2 勘误+加宽）：本条「22 条指标规则白名单零动」实数 25 条（§0 勘误同源·原文零改）；回归面加宽至 ha-2 先例口径（ha-2-graceful-REQUEST.md:73「api/worker/web 各 prove 矩阵按仓内现状全量如实记账（跑/未跑列账）；红项逐条基线对账禁 skip-as-pass」〔处方引 :74·落卷席 grep 亲证实锚 :73·以实物为准〕）：至少对 C2 sweep 族相关 prove 跑/未跑如实列账——report-bulkhead（apps/worker/test/report-bulkhead.proof.ts）/ report-retry-http（apps/api/test/report-retry-http.proof.ts）/ interview-dispatch-fairness（apps/worker/test/interview-dispatch-fairness.proof.ts·-pg 变体同族）〗

9. **W3 runbook 锚机检断言（rev2 增补·静态）**：机检断言三件——① `ai-docs/observability/alerting-runbook.md` 文件存在；② 事件目录（C1）每条 runbook 锚解析到 runbook 实际小节（标题锚存在性：锚→小节标题逐一匹配·悬空锚=断言失败）；③ runbook 含 S15 边界登记节与 Page/Ticket/Trend 分层词面（observability-strategy.md:112-116 分层口径的词面机检）。载体=W4 alerts-lint 扩展（二选一裁决见 W4 行 rev2 注记·静态无 docker 依赖）；任一断言失败=lint 失败（防 runbook 与目录漂移）。〖rev2（席2·预执行双审 FAIL 主因修法落卷）：本条纯 docs 机检断言·零码面触碰·不越 §2〗

## §5 Ban

Ban self-approve · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 触碰监控栈四文件**（compose.monitoring.yml/prometheus.yml/alert.rules.yml/alertmanager.yml——S15 边界，越界即废）· **Ban 任何常驻进程/daemon**（本刀检查脚本单遍即退）· Ban 翻转 HA-1/HA-2 已 nail 码面（drain 链/sweep 语义/池行为零改）· Ban 新增 npm 依赖（纯 node 沿 alerts-lint/ha-status 先例）· Ban 通知通道实现或占位配置 · Ban 把本刀宣称为「告警闭环已完成」——本刀=日志面轻量闭环+边界登记，**闭环全量（常驻评估+通知+值班）归 S15**（Non-claims §7 同口径）· Ban secrets/Key 入库（白名单/目录/收据皆不得含真实主机名外的主机敏感信息·样本日志脱敏）· Ban SSOT 无关触碰（LEDGER/backlog 只读引用，nail 时才改）。

## §6 pins（十一值照抄 `harness/entpay-slice2-REQUEST.md:139` 经 ha-1/ha-2 同款 · 零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ 告警闭环全量（常驻评估/Alertmanager 路由/通知/值班= S15）≠ Prometheus 启用 ≠ 监控栈修复（四文件零触）≠ 结构化日志框架落地（pino 迁移=重刀后置）≠ 零告警丢失保证（脚本窗外的日志若被 docker 日志轮转清掉即扫不到——runbook 登记该边界）≠ HA（R-17 归 HA-1 已 nail·本刀不翻 haStatus）· `disk_watermark` df 探针只观测宿主单机视角，≠ 容器内磁盘视图 ≠ 云盘水位（S15）· prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码/compose/监控栈、未跑 prove、无实现自批资格。预执行双审 PASS 后由协调方派 EXEC coding；EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审。任何越 §2 非范围冲动（顺手真实化 alertmanager receiver、起 Prometheus、加 logging 块、动 drain/sweep 语义）= 停手上报，不借机修。

---

## rev2 落卷登记（双席 FAIL 窄面处方合并 · append-only · docs-only 零码动）

**rev2 缘起**：预执行双审席1 三条+席2 三条 FAIL（窄面）·双席一致修法 §1/§5 零需动——本节由落卷席 `ha5-rev2` 合并落卷（改正处行尾 〖rev2〗 注记·原文措辞零改·码面零触·est live=0）。

| # | 席 | 处方 | 落卷处 |
|---|---|---|---|
| 1 | 席1 | §0 缺口一勘误：「全仓唯一 JSON 结构化事件」→全仓**三个** JSON 结构化事件·唯一直接告警向=db_pool_error+补登 generation-progress.ts:57 / invoke.ts:387 两锚（alert.rules+alerts-lint 白名单双通道皆盲·如实登记） | §0 缺口一行行尾注记 |
| 2 | 席1 | 两盲事件目录处置二择一：裁决=**纳入目录首批**（generation_progress_write_failed=Trend·码面自认「进度不是健康信号」generation-progress.ts:11；ai_trace_persist_failed=Trend·P0001 幂等命中正常重放噪音防） | §1 W1① 行+C1 行行尾注记（首批按 9 实数） |
| 3 | 席1 | 顺带登记 interview-consumer.ts:225（reservation lease renew failed）＝首批外·smoke/cloud-readiness.ts:15（cloud_connectivity_receipt）＝非事件（同族 cloud-test-serial.ts:12 落卷席 sweep 补登）——排除亦登记不沉默缺席 | §1 W1① 行行尾注记（同 #2） |
| 4 | 席2 | §4 增补 W3 验收断言=§4.9（runbook 存在+每条目录 runbook 锚解析到实际小节+S15 登记节+Page/Ticket/Trend 分层词面机检）·载体二选一裁决=**W4 lint 扩展** | §4.9（新增）+W4 行行尾注记 |
| 5 | 席2 | §4.8 回归面加宽至 ha-2 先例口径（prove 矩阵全量如实记账·红项基线对账禁 skip-as-pass·C2 sweep 族 report-bulkhead/report-retry-http/interview-dispatch-fairness 跑/未跑列账） | §4.8 行行尾注记 |
| 6 | 席2 | 「22 条」勘误 **25 条**（`- alert:` 实数：api SLO 6+worker/RAG/模型/费用 18+MonitoringWatchdog 1·:264 实锚） | 处方列三处（:20/:40/:78）·落卷席实物 sweep 实数**五处**（:20/:30/:40/:62/:78）——照 ha-2 rev2-③「以实物为准」先例五处全注 |
| 7 | 席2 | B6 沙箱载体备案：零改复用 docker/compose.ha.sandbox.yml 形制·防 EXEC 私造清单外载体（ha-2 rev2-②/C8 先例） | §4.6 行行尾注记 |

**勘误附记（落卷席实物核对）**：① 处方引 ha-2-graceful-REQUEST.md:74——grep 亲证实锚 **:73**（「9. **既有零回归**：api/worker/web 各 prove 矩阵按仓内现状全量如实记账（跑/未跑列账）；红项逐条基线对账禁 skip-as-pass…」）·以实物为准；② 处方引 generation-progress.ts:57 / invoke.ts:387——亲证 =JSON 语句起行（事件名分别在 :58/:388）·锚成立；③「22 条」处方列三处·实物五处·同前例以实物为准。

`draft_rev2:pre_exec_dual`（双席 FAIL 窄面处方 7 条落卷·修法 §1/§5 零需动·待复审确认后协调方行使 EXEC 授权）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席 `ha5-exec` 落卷 @本工作树 `line/ha-5-alerting`·append-only·上行原文零改）——W1 事件目录 9 条（`scripts/alerts/event-catalog.json`·rev2 两 Trend 纳入·首批外/非事件 registered_exclusions 登记不缺席）+唯一新码动=reaper_takeover 三处各恰一行（interview-jobs.ts:269/report.ts:86/quiz-jobs.ts:88·`git diff 9f6edf8f` 实证 +3/-0·sweep 选取/租约/CAS 零改）·W2 `scripts/alerts/check-alerts.mjs`（三路采集+--log-file/--ps-file/--df-file 注入缝+白名单到期防腐化+未决 Page/Ticket=1·干净=0·--report 恒 0·live 源失效 fail-closed=1·收据 receipts/ha-5/）·W3 `ai-docs/observability/alerting-runbook.md`（133 行·分层逐字对齐 observability-strategy.md:112-116·九事件×响应动作×下钻锚·S15 边界登记节）·W4 alerts-lint 第 4 节（目录结构+白名单到期日+§4.9 runbook 锚解析三断言·既有 1-3 节与 25 条规则校验零改 +87/-1）·八组门禁 EXIT 全账：proof 21/21 EXIT=0 · 实栈烟测（沙箱零改复用 compose.ha.sandbox.yml 形制最小栈·migrate Exit 0→零 migrate_failed·psql RAISE 发射 db_pool_error 入真实 json-file 日志经 compose logs 通路抓到·EXIT 语义实栈双向实证）EXIT=0 · 静态边界监控栈四文件+compose.prod.yml 零触 · alerts:lint EXIT=0（25 条零动）· deploy-check EXIT=0 · sweep 族隔离环 prove 5×EXIT=0（report-bulkhead/report-retry-http 38 负路径/reaper/quiz/dispatch-unit·dispatch-pg 未跑列账=需 E2E_CLOUD_ISOLATED 云隔离环境）· markers=0（小写 "placeholder"×3=ha-sandbox.mjs 哑 CA 文头逐字镜像·如实注记）· est live=0 · attempts 全账 4 次（migrate esbuild 平台二进制缺→.npmrc 本地 helper 沿 ha-1 先例不 commit；/proc/1/fd 注入被 docker 默认 cap 拒→postgres 应用层发射向量）· rebase 主线 9f6edf8f 零冲突（主线 tip 实测同点·分支严格领先·漂移表空表）· pins 十一值零翻转 · 收据 receipts/ha-5/（exec-receipt.md+7 件·CMD+EXIT 他人可复跑）· ⛔push ⛔动主线 ⛔触其他工作树 · Ban self-approve · alone≠dual · prove EXIT=0 ≠ DONE（claimDone=false·待 post-prove 双审+nail）
