# HA-5 ALERTING EXEC 收据（R-47 告警闭环日志面轻量闭环 · executed:awaiting_post_prove_dual）

**席**: ha5-exec · **分支**: `line/ha-5-alerting`（工作树 `meetwise-ha5`）· **Date**: 2026-10-10
**Base**: `feat/mysql-schema-skeleton` @`9f6edf8f`（EXEC 起手时 tip 亲证；落卷期间主线推进 h1-thresholds docs-only 链至 `141da56f`）· **rebase 两步全零冲突**：①起手 `git rebase feat/mysql-schema-skeleton` → `Current branch line/ha-5-alerting is up to date.` EXIT=0（当时 tip=9f6edf8f·分支严格领先 2 docs 提交）；②落卷后复 rebase 至新 tip `141da56f` → `Successfully rebased and updated refs/heads/line/ha-5-alerting.` EXIT=0（3 提交干净重放·EXEC 卷新 hash=bb647818·原 54a762e3 未 push 仅本分支自 amend 链）。**漂移表=空表（两次同结论）**：`git diff 9f6edf8f..141da56f --name-only` 仅 h1-thresholds-REQUEST.md / h1-thresholds.md 两件（h1 docs 链）——对本刀全部码锚（packages/db / scripts / docker / ai-docs/observability）diff=0 行·REQUEST §0 全部 file:line 锚复验零漂；rebase 后复跑门禁 alerts:lint EXIT=0 · proof 21/21 EXIT=0 · deploy-check EXIT=0 · 静态边界 vs 新 base CLEAN。
**授权**: 协调方明示 EXEC 授权（rev2 复审 7/7 收口后）
**Diff 实物**: 改 4 文件（3×sweep 各 +1 行 / alerts-lint.mjs +87/-1）+ 新 6 文件（check-alerts.mjs 370 行 / check-alerts-sandbox-smoke.mjs 311 行 / check-alerts.proof.mjs 259 行 / event-catalog.json 84 行 / alert-whitelist.json 5 行 / alerting-runbook.md 133 行）+ REQUEST 状态行 append + 本收据目录。**监控栈四文件 + compose.prod.yml 零触**（机械可证见 §D）。

---

## §A 交付逐条（W1-W4 · file:line 实锚）

### W1 事件目录（C1）＋唯一新码动（C2）

| 件 | 实物 | 锚 |
|---|---|---|
| 事件目录机读唯一真源 | `scripts/alerts/event-catalog.json` | **9 事件**（rev2 纳入两 Trend 全在）：db_pool_error（json 形·severity=Ticket·source packages/db/src/principal.ts:896）/ worker_drain_timeout（regex 文本形·Ticket·apps/worker/src/main.ts:787）/ api_drain_timeout（regex·Ticket·apps/api/src/main.ts:82）/ reaper_takeover（json·Ticket·interview-jobs.ts:269 + report.ts:86 + quiz-jobs.ts:88）/ migrate_failed（compose_exit service=migrate·**Page**·docker/compose.prod.yml:223）/ disk_enospc（regex `ENOSPC\|No space left on device`·**Page**·check-alerts.mjs:180 观测点）/ disk_watermark（df_watermark 85%·Ticket·check-alerts.mjs:189 探针点）/ generation_progress_write_failed（json·**Trend**·generation-progress.ts:58）/ ai_trace_persist_failed（json·**Trend**·invoke.ts:388）。每条含 event/matcher/severity/source 码锚/runbook 锚（`alerting-runbook.md#ev-<event>`） |
| rev2 登记不缺席 | catalog `registered_exclusions` | interview-consumer.ts:225（首批外·文本形失败日志）+ cloud-readiness.ts:15 / cloud-test-serial.ts:12（非事件·烟测收据形）——runbook §6 同步登记 |
| reaper_takeover 唯一新码动 | `packages/db/src/interview/interview-jobs.ts:269` / `report/report.ts:86` / `jobs/quiz-jobs.ts:88` | 各**恰一行** `if (X.rowCount) console.warn(JSON.stringify({ event: 'reaper_takeover', kind, job_ref: \`requeued:<count>\`, prev_lease_expired }))`——沿 principal.ts:896 JSON 形制；**零改 sweep 选取/租约/CAS**（§B 机械证明）。语义注记：interview/quiz 臂 WHERE 含 `lease_expires_at < now()` → `prev_lease_expired:true`；report 臂 requeue WHERE 只筛 `status='failed'`（租约过期接管面=同函数隔离臂 quarantined·非 requeue·本刀零触）→ 如实记 `prev_lease_expired:false`。job_ref=聚合计数形（批量 UPDATE 无 RETURNING·绝不记 owner_user_id 等租户标识·脱敏纪律同 principal.ts:881-884）。rowCount 门控=sweep 重领**成功路径**才发射（REQUEST W1②「接管成功」语义·防周期空转刷屏） |
| 白名单 | `scripts/alerts/alert-whitelist.json` | 结构就绪·entries=[]（当前无已知持续性假阳性——不预造白名单条目；§4.3 白名单通路以构造条目机检证明） |

### W2 判定器（C3-C4）：`scripts/alerts/check-alerts.mjs`

- 三路输入：`compose logs --since --timestamps`（:84-100·JSON/key=value 双形兼容·:175-198 容忍 compose 前缀的 JSON 提取）+ `compose ps --format json --all`（:102-124·compose_exit=State exited 且 ExitCode≠0）+ 宿主 `df -P /`（:126-134·水位解析 :189-196）。
- 注入缝：`--log-file`（可重复）/ `--ps-file` / `--df-file` + `--offline`（缺席源=跳过登记不报错）；无 `--offline` 时源失效 → fail-closed EXIT 1。
- EXIT 语义：未决（非白名单）Page/Ticket → 1；干净 → 0；`--report` 恒 0；**live 源失效 → 1**（无法证明干净=不干净）；目录/白名单不可读 → 1（坏白名单条目不消音·只登记）。
- 白名单防腐化：无到期日/非法日期条目 → 忽略+登记（fail-closed 方向）；过期条目 → 失效=重新告警+登记。
- 收据：`receipts/ha-5/check-alerts.receipt.json`（`--receipt` 可覆盖）·stdout=RECEIPT 块+CMD+EXIT 行（沿 ha-status.mjs :21-26/:203-219 形制）。非 daemon：单遍即退。

### W3 运行手册（C5）：`ai-docs/observability/alerting-runbook.md`

133 行·§1 分层口径逐字对齐 observability-strategy.md:112-116（Page/Ticket/Trend 表格逐字誊录）·§2 脚本使用（窗/白名单/EXIT/收据/scan-window 边界）·§3 九事件×（severity+响应动作+下钻锚）各带 `<a id="ev-<event>">` 锚 · §4 Prometheus 分工声明（25 条指标 rules 归 S15·本面补 stderr/compose 一次性任务/宿主磁盘三盲区）·§5 S15 边界登记五条（含 docker logging 无界已知风险）·§6 首批外登记。

### W4 lint 扩展（C6）：`scripts/alerts-lint.mjs` +87/-1

新增第 4 节（§4.9 载体·rev2 裁决）：4a 目录结构机检（event 名/matcher 形制逐型校验/severity 枚举/source file:line 形/runbook #锚/首批 ≥6）+ 4b 白名单防腐化（event+reason+expires ISO 日期·缺到期日=结构非法）+ 4c runbook 锚解析三断言（文件存在/每条锚 `id="<anchor>"` 解析到实际小节·悬空=失败/S15 登记节标题+Page/Ticket/Trend 词面）。既有 1-3 节与指标白名单（:20-49）与 25 条规则校验逻辑**零改**（diff 纯追加·唯一 -1 行=OK 汇总行加尾）。测试覆盖缝=env `ALERTS_LINT_CATALOG/WHITELIST/RUNBOOK`（默认零改）。

## §B reaper 三处零改核（§4.5）

- grep 实证：三处事件行均在 sweep 函数体内、requeue UPDATE 之后、catch 块之外（proof P5.1：interview-jobs.ts:269 / report.ts:86 / quiz-jobs.ts:88·afterRequeue=true·notInCatch=true·rowCount 门控=true·kind 逐文件对）。
- `git diff 9f6edf8f -- <三文件>`：**+3/-0**（proof P5.2）——纯 ±观测日志行·sweep 选取/租约/CAS 逻辑零改。
- 零回归实证（§4.8·隔离环真 PG·attempt 各 1 次全绿）：`report:prove:raw` EXIT=0（report-bulkhead·sweepReports 全链）/ `report-retry:http:prove:raw` EXIT=0（38 负路径用例）/ `reaper:prove:raw` EXIT=0（Reaper 心跳防误收+双边界 requeue/终结+终态事件+退款+僵尸守卫）/ `quiz:prove:raw` EXIT=0（押题进程接线+G4 #209 滤后鉴别子）/ `prove:interview-dispatch`（无 IO 单元契约）EXIT=0。**未跑列账**：`prove:interview-dispatch-pg`——需 `E2E_CLOUD_ISOLATED=1` 云隔离私网测试环境（proof 文件头自禁本地 docker/loopback·Non per-push CI）＝本环境不可达·如实未跑（same-family 单元契约与 reaper/report/quiz 四真 PG 隔离环已绿覆盖 sweep 族涉面）。

## §C 八组门禁 EXIT 全账

| # | 判据 | 命令 | EXIT |
|---|---|---|---|
| 1 | §4.1-4.5+§4.9 注入式 proof（21 断言：九事件条目逐字段对/双形 matcher/EXIT 三态/白名单翻绿+过期重告/腐化机检四路/reaper 真源/静态边界/fail-closed×2） | `node scripts/alerts/check-alerts.proof.mjs`（ receipts/ha-5/check-alerts.proof.receipt.json） | **0**（21/21） |
| 2 | §4.6 实栈烟测（沙箱零改复用 compose.ha.sandbox.yml 形制·最小栈 ha-pg+migrate·哑凭据 tmpfs 即灭） | `MEETWISE_HA_SANDBOX_AUTHORIZED=1 node scripts/alerts/check-alerts-sandbox-smoke.mjs`（receipts/ha-5/check-alerts-sandbox-smoke.receipt.json） | **0**（9 步全 PASS：migrate ExitCode=0→零 migrate_failed 条目；psql RAISE 发射 db_pool_error JSON 入真实 json-file 日志→compose logs 通路抓到产条目；未决 Ticket→EXIT 1 fail-closed 实栈实证；白名单复跑 EXIT 0） |
| 3 | §4.7 静态边界 | `git diff 9f6edf8f --name-only` ∪ `git status --porcelain` 对照禁触清单 | **0**（监控栈四文件+compose.prod.yml 零出现·proof P6.1 同断言 PASS） |
| 4 | §4.8 既有零回归·lint | `node scripts/alerts-lint.mjs`（=pnpm alerts:lint） | **0**（25 条指标规则零动·事件目录 9+白名单 0+runbook 锚 9 全过） |
| 5 | §4.8 既有零回归·deploy 门禁 | `node scripts/deploy-check.mjs` | **0**（新增文件零误红） |
| 6 | §4.8 sweep 族 prove 矩阵 | `node scripts/run-e2e-isolated.mjs <target>` ×4 + `pnpm -C apps/worker prove:interview-dispatch` | **5×0**（+dispatch-pg 未跑列账§B） |
| 7 | markers | `grep -rn "TODO\|FIXME\|XXX\|PLACEHOLDER\|待填"` 改动/新增面 | **0 命中**（小写 "placeholder"×3 = check-alerts-sandbox-smoke.mjs:146/:159/:167 沿 ha-sandbox.mjs 哑 CA 文头逐字镜像·非标记符·如实注记） |
| 8 | secrets/码面边界 | grep + `git diff` 复核 | **0**（零真实凭据·白名单/目录/收据无敏感主机信息·样本日志脱敏·compose 零 logging 块新增·drain 链/池行为/HA-1 面零触） |

**B6 attempts 全账（Ban retry-to-green）**：attempt1 EXIT=1——migrate Exit=1@3s，根因=宿主 node_modules 缺 linux-arm64 esbuild 二进制（bind-mount 遮蔽镜像内容）；attempt2 EXIT=1——migrate Exit=0 ✓ 但 /proc/1/fd/1 注入 `Permission denied`，根因=docker 默认 cap 集无 SYS_PTRACE（root/su postgres 双向实测同拒·/proc/1/fd/1 魔符号链接解引用被内核拒）；处置=沿 HA-1 EXEC 先例（receipts/ha-1/exec-inventory.md:18）建**不 commit 的本地 .npmrc**（supported-architectures darwin/linux+arm64）+ `pnpm install --frozen-lockfile --force`（18 包·lockfile 零变更）并把注入向量换 postgres 应用层发射（psql RAISE EXCEPTION → 服务器日志 → 真实 json-file 通路）；attempt3 result=OK 但注入步骤判据误绑 psql 退出码（RAISE 预期非零）——判据修正为 compose logs 探针；attempt4 **EXIT=0 全 PASS**（fresh pg·9 步全绿·栈 down -v 全灭）。assertion-fix（P3.1 Trend 列表语义）1 次、argValue 后写覆盖 fix 1 次——均为判定器自身初版缺陷修复后全量重跑·非对红样本反复重试。

## §D 停止条件核查（全否）

- 锚点漂移超容差：**否**——rebase 零重定位；REQUEST 全部 file:line 锚（principal.ts:896/drain 两锚/sweep 三文件/migrate compose 块/observability-strategy:112-116/25 条 rules）EXEC 实读逐一命中；一处既有勘误沿用 rev2 已载（ha-2:73）。
- prove 新增红：**否**——新增 proof 面 21/21 绿·实栈烟测绿·sweep 族隔离环 5 绿。
- 需触监控栈四文件：**否**——机械可证零触（§C#3）；S15 边界只在 runbook 登记未实现。
- 其他越界冲动（alertmanager receiver 真实化/起 Prometheus 常驻/logging 块/pino/通知通道）：**未发生**。

## §E pins 与 Non-claims

pins 十一值零翻转（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE /privacy/interview-data/:id=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）。markers=0 · est live=0（沙箱哑凭据·零外呼·零模型计费）·本刀≠告警闭环全量（常驻评估/通知/值班=S15）≠Prometheus 启用≠结构化日志框架·prove EXIT=0 ≠ DONE（claimDone=false·完成判定走双审+nail）。其他工作树零触（本刀 docker 操作仅 `meetwise-` 沙箱最小栈且 down -v 全灭·15432 回环端口·他树容器零触）。⛔push。
