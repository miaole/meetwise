# 告警运行手册（alerting-runbook · HA-5 · R-47 日志面轻量闭环）

**范围声明**：本手册覆盖 HA-5 事件目录（`scripts/alerts/event-catalog.json` = 机读唯一真源）的日志面告警。
指标面（`docker/monitoring/alert.rules.yml`，`- alert:` 实数 **25 条**：api SLO 6 + worker/RAG/模型/费用 18 + MonitoringWatchdog 1）
归 Prometheus 常驻栈（S15 买云后刀）启用；本手册只覆盖其盲区：进程 stderr、compose 一次性任务、宿主磁盘水位——皆 `up` 指标抓不到的面。

## 1. 告警分层口径（逐字对齐 observability-strategy.md §5 :112-116）

| 级别 | 含义 | 触发例 | 响应 |
|---|---|---|---|
| **Page（呼叫）** | 触碰"零丢失/可恢复"红线 | 结算滞留>5min;幂等重复扣减>0;waiting_user 无 checkpoint | 立即,带 `threadId`/`traceId` 直达上下文 |
| **Ticket（工单）** | 降级在发生但未丢数据 | 模型降级率升高;重试计数升;报告失败率升 | 工作时间排查供给/容量 |
| **Trend（趋势）** | 产品/质量观察 | 押题完成率、复训率、token 成本漂移 | 周期复盘,不打扰 on-call |

告警必须可**一键下钻**：每条带日志样本行 → 对应码面/账本锚（本文各事件小节「下钻」栏）。无法下钻的告警 = 噪音。

## 2. 检查脚本使用说明（scripts/alerts/check-alerts.mjs · 非 daemon 单遍即退）

```bash
node scripts/alerts/check-alerts.mjs                 # 实栈三路扫描（compose logs/ps + 宿主 df）
node scripts/alerts/check-alerts.mjs --sandbox       # 沙箱 env-file + 三 -f（沿 ha-status --sandbox 同形）
node scripts/alerts/check-alerts.mjs --since 24h     # 日志窗（默认 env CHECK_ALERTS_SINCE 或 24h）
node scripts/alerts/check-alerts.mjs --offline --log-file s1.log --ps-file ps.json --df-file df.txt
                                                     # 无 docker 注入缝（CI/本地样本）
node scripts/alerts/check-alerts.mjs --report        # 评估降级输出·恒 EXIT=0
```

- **EXIT 语义（fail-closed）**：存在未决（非白名单）Page/Ticket 告警 → `EXIT=1`；干净 → `0`；`--report` 恒 `0`；
  live 模式输入源失效（docker 不可用）→ `1`（无法证明干净 = 不干净）。
- **收据**：`receipts/ha-5/check-alerts.receipt.json`（机器可读·alerts/suppressed/源状态/EXIT 全账）。
- **白名单**：`scripts/alerts/alert-whitelist.json`——每条目必含 `event + reason + expires`（ISO 到期日）；
  无到期日条目 = 结构非法（`pnpm alerts:lint` 拒绝）；到期后同事件自动重新告警（白名单不是永久豁免）。
- **事件目录**：`scripts/alerts/event-catalog.json`——唯一真源；matcher 双形（json 精确 event 名 / regex 文本行）+
  compose_exit（compose ps ExitCode）+ df_watermark（宿主 df 水位）。改事件先改目录，目录由 `pnpm alerts:lint` 机检防腐化。
- **scan-window 边界（诚实限度）**：脚本只扫窗口内日志——窗外日志若被 docker 日志轮转清掉即扫不到；
  EXIT=0 ≠ 「窗口外无告警」，仅 = 「窗口内可证干净」。

## 3. 事件处置手册（目录九事件 · 每条 severity + 响应动作 + 下钻锚）

<a id="ev-db_pool_error"></a>
### 3.1 db_pool_error —— Ticket

- **matcher**：JSON `{"event":"db_pool_error"}`（发射点 `packages/db/src/principal.ts:896` · dedupe 后逐连接中断一条）。
- **含义**：连接池观测到底层连接错误（purpose 维度计数）。数据零丢失：路由/CAS/重试既有机械兜底。
- **响应（Ticket·工作时间）**：排查供给/容量——单发=网络抖动；burst=DB 实例重启/连接上限/网络分区。
- **下钻**：样本行 `purpose`/`error_name`/`error_message` → `packages/db/src/principal.ts:886-897`（observePoolError）→ R-22 DB 韧性线（LEDGER :130·后刀）。

<a id="ev-worker_drain_timeout"></a>
### 3.2 worker_drain_timeout —— Ticket

- **matcher**：文本行 `worker_drain_timeout signal=`（发射点 `apps/worker/src/main.ts:787` · key=value 文本形·零改码兼容）。
- **含义**：worker 收到停止信号后排排水超预算（`WORKER_DRAIN_TIMEOUT_MS` 默认 30s），在飞 job 被强制收尾——reaper 随后接管重领（零丢失）。
- **响应（Ticket·工作时间）**：确认 deploy/重启窗口是否解释；非窗口出现=在飞 job 异常滞长，查 `in_flight` job 列表与对应 interview/report/quiz 状态。
- **下钻**：样本行 `in_flight` job_ref → `apps/worker/src/main.ts:780-800`（drain 链）→ HA-2 已 nail 面（`ai-docs/delivery/harness/ha-2-graceful-REQUEST.md`）。

<a id="ev-api_drain_timeout"></a>
### 3.3 api_drain_timeout —— Ticket

- **matcher**：文本行 `api_drain_timeout`（发射点 `apps/api/src/main.ts:82` · 文本形）。
- **含义**：api 停机排水超预算，在飞请求按 deadline 裁决退出（exit 0）；SSE 客户端凭账本 Last-Event-ID 重放恢复（零丢失靠既有重放机械）。
- **响应（Ticket·工作时间）**：同 3.2——先对 deploy 窗；非窗口出现查排水期滞留路由与连接注册表。
- **下钻**：`apps/api/src/main.ts:76-90`（shutdown 链）→ HA-2 卷。

<a id="ev-reaper_takeover"></a>
### 3.4 reaper_takeover —— Ticket

- **matcher**：JSON `{"event":"reaper_takeover"}`（发射点三处·sweep requeue 成功路径：
  `packages/db/src/interview/interview-jobs.ts:269`（kind=interview·租约过期接管）
  / `packages/db/src/report/report.ts:86`（kind=report·failed 退避重排——该臂 WHERE 只筛 failed 不涉租约，故 `prev_lease_expired:false`；
  报告的租约过期接管面是同函数隔离臂 quarantined，非 requeue，本刀零触）
  / `packages/db/src/jobs/quiz-jobs.ts:88`（kind=quiz·租约过期接管））。
- **含义**：「worker 崩了但系统自愈了」——孤儿 job 被周期 sweep 重领。单发=自愈成功；**短窗重复=worker 反复崩**，升级排查。
- **响应（Ticket·工作时间）**：拿 `job_ref`（聚合计数形 `requeued:<count>`·不含租户标识）对照容器重启记录（`docker ps -a`/RestartCount）；
  频发则查 worker OOM/panic 与 `interview reap failed`（`apps/worker/src/interview-consumer.ts:439`）失败侧日志。
- **下钻**：`packages/db/src/interview/interview-jobs.ts:252-270`（sweepStuckInterviewJobs——状态翻转与租约过期判定同一条原子 UPDATE）。

<a id="ev-migrate_failed"></a>
### 3.5 migrate_failed —— Page

- **matcher**：compose_exit `service=migrate` Exit 非 0（`docker compose ps -a`；一次性任务 `restart:"no"`·`docker/compose.prod.yml:223-237`）。
- **含义**：迁移失败 → worker `depends_on: service_completed_successfully` 被阻断（`compose.prod.yml:246-248`）→ 新副本无法启动 = 可用性红线，立即响应。
- **响应（Page·立即）**：`docker compose -f docker/compose.prod.yml logs migrate` 看失败迁移号；修复后重跑 migrate；
  deploy 窗的单次失败重跑成功属一次性事件——在白名单登记该窗口并给到期日，而不是改码面。
- **下钻**：`packages/db/src/migrations/`（失败号对应迁移）+ `apps/worker/src/cost-configure.ts`（第二段命令）。

<a id="ev-disk_enospc"></a>
### 3.6 disk_enospc —— Page

- **matcher**：文本行 `ENOSPC|No space left on device`（任意容器 stderr；观测点 `scripts/alerts/check-alerts.mjs:180`）。
- **含义**：某容器已写盘失败——日志/审计/账本写入开始丢，触碰零丢失红线，立即响应。
- **响应（Page·立即）**：宿主 `df -h` 定位盘；清理 docker 日志/镜像/卷；确认 db/redis 卷健康；事后按 §4 给宿主盘扩容（S15 运维刀）。
- **下钻**：样本行前缀的容器名 → 该容器最近写路径；已知风险面见 §4（json-file 无界）。

<a id="ev-disk_watermark"></a>
### 3.7 disk_watermark —— Ticket

- **matcher**：宿主 `df -P /` 使用率 ≥ 阈值（默认 85%；`scripts/alerts/check-alerts.mjs:189`·单机视角探针·零码动）。
- **含义**：磁盘写满前置预警——3.6 的提前量。
- **响应（Ticket·工作时间）**：清理 docker build 缓存/旧镜像/过期日志；核对备份占用（R-26 归 HA-4 线）；必要时扩盘。
- **限度**：`disk_watermark` 只观测宿主单机视角，≠ 容器内磁盘视图 ≠ 云盘水位（S15）。

<a id="ev-generation_progress_write_failed"></a>
### 3.8 generation_progress_write_failed —— Trend

- **matcher**：JSON `{"event":"generation_progress_write_failed"}`（发射点 `apps/worker/src/generation-progress.ts:58` · best-effort 旁路）。
- **含义**：SSE 进度写失败（码面头部纪律自认「进度不是健康信号」`generation-progress.ts:11`）——业务路径绝不被打断。
- **响应（Trend·周期复盘）**：复盘 streamKey/kind/errorName 分布；持续集中=Redis/网络面退化前兆，评估是否升级 Ticket。

<a id="ev-ai_trace_persist_failed"></a>
### 3.9 ai_trace_persist_failed —— Trend

- **matcher**：JSON `{"event":"ai_trace_persist_failed"}`（发射点 `packages/ai-runtime/src/invoke.ts:388` · best-effort 旁路）。
- **含义**：trace 持久化失败。**注意**：事件含 P0001 幂等命中正常重放形态（`apps/api/test/uc-e2e-028-nhp-fault.proof.ts:220-224` 亲证）——直接 Page/Ticket 必噪音化。
- **响应（Trend·周期复盘）**：复盘 errorName/pgCode 分布（P0001 占比高=正常重放）；非 P0001 集中出现才评估升级 Ticket。

## 4. 与 Prometheus 栈的分工声明 + 已知风险登记

- **分工**：指标面（`docker/monitoring/alert.rules.yml` 25 条 + `prometheus.yml` 抓 api:8787/worker:9091）待 S15 常驻化后启用；
  本手册日志面补其三个盲区：进程 stderr（ENOSPC 类）、compose 一次性任务（migrate Exit——`up` 指标不覆盖 `restart:"no"` 任务）、宿主磁盘水位。
- **本刀 ≠ 告警闭环全量**：常驻评估 / Alertmanager 路由 / 通知通道 / 值班链路一律未实现、未占位。

## 5. S15 边界登记（买云后刀 · 本刀只登记不实现）

1. Prometheus / Alertmanager / Grafana 常驻化（`docker/compose.monitoring.yml` 独立手动起 → 常驻；compose.prod.yml:329「单机 4G 预览不常驻 Prometheus」现状裁决由 S15 翻转）。
2. `docker/monitoring/alertmanager.yml` receivers 真实化（现为三空壳 `default`/`critical`/`watchdog` :46-58——webhook/值班通道零密钥占位）。
3. 通知链路（webhook/钉钉/邮件/值班电话）= S15；本刀零实现零占位配置。
4. docker `logging:` 块 / json-file 轮转策略：`docker/compose.prod.yml` 无任何 logging 块 = 宿主 json-file 无界——**已知风险**（ENOSPC 面 · §3.6/§3.7 是其探测兜底），处置归 S15 运维刀。
5. 云盘水位 / 容器内磁盘视图 / 多机拓扑告警 = S15（本刀 df 探针仅宿主单机视角）。

## 6. 首批外登记（排除亦登记·不沉默缺席）

- `apps/worker/src/interview-consumer.ts:225`（`reservation lease renew failed`·文本形失败日志，性质同 :439 `interview reap failed`）= **首批外**：零改兼容口径，不列首批 matcher 断言面（REQUEST rev2 §1 W1①）。
- `apps/worker/smoke/cloud-readiness.ts:15`（`cloud_connectivity_receipt`·同族 `apps/worker/smoke/cloud-test-serial.ts:12` `cloud_test_serial_receipt`）= **非事件**（烟测工具收据形）——不入目录不入事件普查（REQUEST rev2 §1 W1①）。
