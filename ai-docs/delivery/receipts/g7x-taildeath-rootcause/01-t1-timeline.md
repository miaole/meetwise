# Receipt 01 — T-1 · CMD1 api 面尾段死亡定向判别 run（G7X EXEC · `pnpm e2e:isolated` ×1 + sidecar 冻结投影 + N1-N5 读数 · EXIT=1 class=api 40363ms · 全窗 37 tick · 判读表四臂三值落字）

**Line**: G7X · **Date**: 2026-10-08（UTC）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-taildeath` · branch `line/g7k-taildeath-rootcause`（rebase 后 tip=`fe218b7a` · REQUEST 孪生 `83234709` + erratum `979a85e4`）· **实跑 code SHA**: `979a85e4796624b28e41bc184d05733c04756ca9`（工作树内容 · tracked 树 run 前后零改机检）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run e2e:isolated`（wiring `package.json:278` blob `0afb3bd2` · = `node scripts/run-e2e-isolated.mjs e2e:prove`）· sidecar 先起：`node .tmp/g7x-sidecar.mjs`（.tmp/ 不入 git · 监测 wrapper stdout tee `.tmp/g7x-cmd1.log`） |
| EXIT | **1**（machine receipt `.tmp/e2e-receipts/2026-10-08T02-04-31-524Z-32687-94402b6f-217c-43c4-b0ba-cde7c1197915.json`：outcome=failed · exitCode=1 · **failureClass=api** · **durationMs=40363** · assertionCount=null · startedAt `02:03:51.161Z` → finishedAt `02:04:31.524Z` · reviewLedger=2 capability skip（image_ocr_unavailable / voice_unavailable · 常规）· `sourceDigests["e2e/full.e2e.ts"]=sha256 f55f57f3…` 与本树 `shasum -a 256` 亲算全等（另 interview.ts `e5104073…` / sse.ts `fcb01f2e…` / run-e2e.mjs `926fdf7d…` 三枚亲算全等）· migrations applied=142 latest=0142） |
| 时间戳（UTC） | sidecar 启动 02:03:50.858 → 端口行命中 02:03:53.883（`meetwise-e2e-32687-…` on 127.0.0.1:64331）→ 连入 02:03:54.901 → receipt 02:03:51.161 → 02:04:31.524 · **判别 run 恰 1 次（T-1）· T-2 未触发** |
| 实跑 SHA | `979a85e4`（run 前后 tracked 树零改 `git status --porcelain` 非 untracked=0 双测 · 三钉 blob 前后全等：`run-e2e-isolated.mjs`=`13dbfc43` · `full.e2e.ts`=`7d65d0f3` · `model-operation-registry.ts`=`63af556f` 两轮亲算全等） |
| Key presence（name-only） | `MODEL_API_KEY=set`（`. ~/.meetwise-secrets/load-model-api-key.sh` source · 进程环境）· `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（**OB-3** 与 G7W 同口径 · 如实登记）· `.env*` 全程 ABSENT（run 前后各测） |
| 关键输出 | `E2E_FAILURE_CLASS class=api` · `ISOLATED_POSTGRES_OUTPUT_WITHHELD container=… state_bytes=217 logs_bytes=0` · **40363ms 落在卷簇**（G7S 38428 / G7U CMD1 40560 / G7U CMD3 37904 / G7W 38013 / G7W-post 41843 → 37.9–41.8s） |
| 预算 | **live=7 次（DB 账本实测读数非计数器**：`ai_model_invocation` succeeded 5 + failed 2 · n2 面 tick-25 起恒定）≤ ≤10/run 口径 · 总 7 ≤ 20 · **`actualSpendCny=null`** |

## EXEC 表名纠偏登记（C-HA-1 先例 · N1 → N1b）

- **纠偏内容**：harness §1.3-C N1 声明的 `assessment_report`（@`0001_baseline.sql:336` · B 端 assessment 面）**不是**报告 job 面——报告舱壁持久 job 表实为 **`ai_report`**（@`0001_baseline.sql:224` · status CHECK `queued/running/ready/failed/quarantined` · attempts/next_attempt_at/last_error 列 · `packages/db/src/report.ts` 全文件亲读：enqueueReport/claimReport/markReportReady/markReportFailed/sweepReports/getReport 全部操作 `ai_report`；`interview.service.ts:672` report() 经 `getReport` 读的也是 `ai_report`）。
- **纠偏执行**：N1 照声明原样跑（全程 `ok:[]` 空读=合法读数 · 该表在本旅程未被行使）；增设 **N1b** 纠偏槽位 `SELECT status, attempts, count(*), max(last_error) AS max_err FROM ai_report GROUP BY 1, 2`（与冻结投影 q1 读 `interview_job.last_error` 同面 · SELECT-only · 非内容列）。纠偏在收据与 SUMMARY 双落字；冻结投影白名单本体零触碰（G7W 9 查询逐字承卷）。

## sidecar 机制执行（G7W 机制原样 + OB-2 兜底兑现）

- 冻结投影 9 查询逐字 + 附加 10 槽位（N1 declared + N1b corrected + N2 by-service + N3 event kinds + N4a-d 段标记 + N5 pg_stat_activity 聚合）· 周期 1000ms（EXEC 定值）· **37 tick 全窗**（02:03:54.901 → 02:04:30.927 · receipt 终点前 0.60s 仍有成功快照）· 逐查询 ok/error 纪律：tick-1-2 迁移在途 relation ERROR 如实记 · **tick-3 起零残余 error（19 查询全 ok 至 run 终）→ 无仪器缺口**。
- **OB-2 兜底兑现**：`client.on('error')` 于 02:04:31.315 捕获 `Connection terminated unexpectedly`（容器拆除瞬间）优雅收边——无 G7W 式 exit 1 伪影；拆除后 10 连接失败自停（02:04:40.938）。
- **withhold 零触碰**：探针只读 DB（SELECT-only · Ban payload/output/content/query 列）、与子进程 stdio 零接触、case 名/断言原文零回读。
- **仪器边界如实登记（EXEC 亲读新证）**：api/worker 由内层 `scripts/run-e2e.mjs:89` 以 `stdio:['ignore','pipe','pipe']` 起、输出进 byte-count 尾随缓冲，仅 `E2E_PROCESS_OUTPUT_WITHHELD process=… chunks=… bytes=…` 摘要上屏（run-e2e.mjs:80-92 亲读 · 原文「raw output never enters terminal/CI logs」）——harness §1.3-D 设想的「后端日志尾随」在契约内**只有字节计数面**（本 run `logs_bytes=0`）；H-T3 判读按 harness 预案由 pg_stat_activity+DB 行面+窗长形状承担（该预案原文已预写此边界）。

## DB 时间线（ndjson 快照关键读数 · 逐 tick 原文在 `.tmp/g7x-sidecar/snapshots.ndjson` 不入 git）

| 时刻（UTC） | tick | 读数 |
|---|---|---|
| 02:04:04.893 | 11 | 旅程起：`interview` created=1+abandoned=1（负路径壳+主驱动）· start job ×2 · `ai_report`=0 行 |
| 02:04:10–19 | 17–26 | answer job ×4 依次 done（10/12/16/19 秒）· `ai_model_invocation` succeeded 增至 5（最后一枚 done=02:04:17）· failed=2（schema_validation_failed · 02:04:07 止 · **只记不判=P2 面**） |
| 02:04:19.910 | 26 | **主面试 completed** + `session_concluded` 事件落账 + **`ai_report` 首现=`failed/att=1/err="score_aggregate_empty"`**（conclude 同事务 enqueue 后 ≤5s 调度拍内 attempt-1 已失败——`loadSummary` 在模型调用前抛出，**generate 未运行 · 零报告模型调用**） |
| 02:04:24.921 | 31 | `ai_report`=`failed/att=2`（退避 `2^attempts` 秒重排后 attempt-2 再失败 · 同 err） |
| 02:04:29.927 | 36 | **`ai_report`=`quarantined/att=3`**（MAX_REPORT_ATTEMPTS=3 烧尽 · sweep 隔离）+ **`report_unavailable` 事件落账**（终态族·设计内无死胡同出口） |
| 02:04:30.927 | 37 | 末成功快照：`idle/ClientRead` 18→15（终态后驱动 SSE 断开面 · 拆除前兆）· **第三 interview=0 · start job 恒 2 · `job_application`=0 · N4（job_posting/resume_quiz/quiz_job/resume_diagnosis）全 0** |
| 02:04:31.315/31.524 | — | 容器拆除（client error 事件）· receipt finishedAt · **EXIT=1 class=api** |

**窗分解**：conclude（~02:04:19.4）→ 进程退出 = **~12.2s**；终态事件可读（≤02:04:29.9）→ 退出 = **≤2.0s 末段**；末段内**零 step-7/7a 落库伪迹**（第三 interview / start#3 / quiz / diagnosis / job_posting 全零至最后快照）。

## 码面机制链（本席亲读 @`fe218b7a` · 收据证据链）

1. **报告链确定性时钟**：`adaptive-lifecycle.ts:341/:353` conclude 同事务 `enqueueReport` → `report.ts` MAX_REPORT_ATTEMPTS=3（:10）· markReportFailed 退避 `next_attempt_at = now()+2^attempts 秒`（:53）· sweep 重排未超限 failed、隔离超限（:74-84）→ `report-worker.ts:63-68` sweep 后对被隔离面试发 `report_unavailable` 事件。调度拍=5s（`main.ts:462` `WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5000 · `:488`）→ **3 attempts ×（5s 拍 + 2s/4s 退避）≈ 10-12s 恒定尾段钟**——与在卷簇（G7S/G7U/G7W/G7X 五 run 的 37.9-41.8s = 旅程 ~26-29s + 报告链 ~10-12s + 末段 ~2s）构成一致。
2. **`score_aggregate_empty` 根**：`main.ts` reportWorkerDeps `loadSummary`（亲读注释「无卡 → scores 空(aggregateScores 空集会抛 score_aggregate_empty,报告走 unavailable,绝不回退 legacy 分数)」）——本旅程主面试**零可计分 ScoreCard** → attempt 在 generate 前抛出。**设计内故障注入 `E2E_REPORT_FAIL_ALL=1`（run-e2e.mjs:124 亲读 · main.ts:128-185 post-provider 抛 `e2e_forced_report_post_provider_failure`）从未启用**（generate 未达 · n2 零报告 service 行为证）——主面试报告经 **score 聚合空集路径**（非注入路径）落到同一 `report_unavailable` 设计终态。
3. **末段抛点收敛（多读数联合 · 「与 X 一致」≠「X 已证」）**：终态后驱动自 mainLoop 返回 → `full.e2e.ts:198` 解构 → `:199/:200` 平凡通过 → **`:201-203` 出处审查断言**：`provenance.identities.length === questions`——码面算术：`reviewInterviewProvenance`（`interview.ts:210` 亲读）对 **question_ready 与 clarification_needed 逐事件均 push identity**，而驱动 `questions` 计数器仅对 question_ready `++`（`interview.ts:304` 亲读）；本 run 事件面实测 **question_ready=3 + clarification_needed=2 → identities=5 ≠ questions=3 → 恒 False → A() fail-fast**（`assert.ts:12-16` 亲读：emit 分类账行 + `process.exit(1)` · 无第三参默认 class='api' → 与 receipt failureClass=api 一致）。时间线吻合（终态可读 ≤02:04:29.9 → SSE hold-and-tail ≤2s 内拾取 → 返回即抛 → exit 02:04:31.5）；step-7/7a 零伪迹与「抛点在 :201-203、step 7 从未执行」一致。**精确断言行 stderr 契约内不可回读**——定谳措辞=「与 :201-203 在含澄清轮次下的恒 False **一致**」（多读数联合：事件面算术 + 时间线 + 零伪迹 + fail-fast 类面），非「已证」。

## 四臂三值判读（harness §1.2 判读表 · Ban 归一 · 四臂全落字）

| 臂 | 三值 | 依据（读数 → 臂内子判据） |
|---|---|---|
| **H-T1 报告段（report/worker 重试链）** | **命中（尾段时钟面）** | 尾段 ~12.2s = 报告舱壁 3 attempts 重试烧尽（n1b tick 26/31/36 跃迁 + n3 tick-36 report_unavailable）· 确定性钟解释在卷 duration 簇构成 · **范围限定：报告链是尾段「时钟」非「抛点」——抛点在终态后末段（≤2.0s）；报告链自身失败根=score_aggregate_empty 零可计分卡（非注入路径）** |
| **H-T2 B-side/review 段断言或等待超时** | **削弱** | N4 段标记全零（job_posting/resume_quiz/quiz_job/resume_diagnosis=0 至末快照）· 第三 interview/`job_application`=0 → B-side/review 段未达；「等待」面按设计完成（report_unavailable=设计内终态族 · 420s deadline 未触发）；step-7 断言若执行按 DB 状态（quarantined≠ready）应通过——抛点上游于 B-side/review 段 |
| **H-T3 第三 interview 创建前资源/顺序/锁池** | **削弱** | n5 pg_stat_activity 37 tick：**零 Lock/LWLock 等待、零长事务签名**（恒 1 active 后台族 + idle/ClientRead 17-18 平稳）· 无池耗尽 · 18→15 降=终态后 SSE 断开伪影非争用 · 7a POST 未达产生任何伪迹（资源冲突无发生面）；仪器边界如实记（api 原始日志契约内不可达 · 见上） |
| **H-T4 harness 自身尾段伪红** | **命中-候选（伪红面）** | 非拆除/非挂起：报告链确定性 pacing + 拆除仅在子进程退出后 + sidecar 全窗健康；**末段抛点与 driver 自有断言 `:201-203` 的语义恒 False 一致**（identities 计 clarification ask vs questions 仅计 question_ready —— harness 面断言语义 · 即在卷已登记 C-MO-P3/「旧红③」同名断言面）→ 「红由测试代码语义产生、非产品运行时故障」的伪红候选成立（一致级 · stderr 契约内不可回读 · 定谳权归协调方） |

## 表外读数登记（判读表未覆盖 → 回协调方 · Ban 就地 reinterpret）

1. **`E2E_REPORT_FAIL_ALL=1` 注入路径未启用而由 `score_aggregate_empty` 实际承载报告失败**（§码面机制链 2）——7a 设计预期（report_unavailable+quarantined）经非设计路径达成；「主面试（practice 直创、未绑岗）是否本就零可计分 ScoreCard（→ 报告 unavailable 为旅程设计内常态）vs ScoreCard 本应产出（scoring 面缺陷）」——裁定权归协调方（本席零主张）。
2. **精确断言行确认**：stderr/case 名 withhold 契约内不可回读——`:201-203` 定位以「一致」级入卷；如需「已证」级须契约裁定（回读或 driver 侧结构化埋点）——归协调方（沿 G7W CO-HA-3 同族）。

## 反例分支与 T-2 裁定（预注册三分支逐一核验 · 均 false → T-2 未跑）

- (i) 仪器窗口错失：**false**（37 tick 全窗 · 末快照距终点 0.60s · 零仪器缺口）；(ii) N5 瞬态细采样必要：**false**（pg 面平稳充足 · 无瞬态待捕）；(iii) 判读表未覆盖值域需第二样本：**false**（末段抛点为 withhold 契约面边界，第二次同体 run 无新信息面——沿 G7W「CMD3 内层=CMD1 同体无备选」先例）。**判别 run 总数=1 · 零 retry-to-green 通道 · EXIT=1 为预期红 retained 原值记账（不冲销 G7U 真测 1/1/1）**。

---
*Receipt 01 · G7X T-1 · 2026-10-08 · CMD1 ×1 EXIT=1 class=api 40363ms（簇内）· sidecar 冻结投影+N1-N5（N1b `ai_report` 纠偏 C-HA-1 先例双落字）37 tick 全窗 · 尾段 ~12.2s=报告舱壁 score_aggregate_empty ×3 烧尽确定性钟（非挂起非拆除非锁争用）· 终态 report_unavailable 后 ≤2.0s 末段抛点与 `full.e2e.ts:201-203` 断言恒 False 一致（identities=5 vs questions=3 · 码面算术+时间线+零伪迹多读数联合 · 一致≠已证）· 四臂 H-T1 命中(时钟面)/H-T2 削弱/H-T3 削弱/H-T4 命中-候选(伪红) · 表外两项回协调方 · T-2 未触发 · live=7 · `actualSpendCny=null` · STOP*
