# Harness — G7X · **CMD1 api-face 尾段死亡根因调查刀**（Line G7X · docs REQUEST · `draft:awaiting_pre_exec_dual` · GAP-G7K-API-REDS P1 独立刀 · G7W 定位现象 → 本刀查根因 · 四臂预注册 · ≠ 修复 ≠ 关行 ≠ trio 翻绿）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban 调查/判别实验执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿 · **Ban retry-to-green（每跑有假设+判别读数+反例分支 · 沿 FLK/G7W 预注册先例）** · 根因调查=只读诊断 **Ban 修复（修复按根因结论另刀）** · Ban 碰 withhold 契约（**读 DB 不读 stderr** · wrapper 零 diff）· Ban 碰 `:68`/`:70`/`:71` 已清面 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7X**（**GAP-G7K-API-REDS P1 独立刀** · backlog `:107` `0c6c3287` 登记面 · G7W EXEC 已定位现象，本刀查根因——两刀分工：G7W=甄别「红在哪」，G7X=判因「为什么红」）
**授权链**: G7S 供给面修复（post-dual `d00be55c`/`3e471d62`）→ G7U EXEC 真测 trio **1/1/1**（CMD1 40.6s api 在卷）→ G7U nail `bbc361fa`（GAP-G7K-API-REDS P1 OPEN 预留）→ G7W 甄别刀（REQUEST `93b3c215` → PRE dual BOTH PASS（mw-e2e-ha `1cfb0cdf` + mw-model-op `10e25f38`）→ EXEC 收据 **`a4e49b8a`**（本 tip 祖先亲测）：CMD1 EXIT=1 class=api **38013ms** · 供给链清白 + 尾段死亡定位 + `schema_validation_failed ×2` 表外登记）→ **本 REQUEST（docs-only）→ pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ meetwise 授权 → 调查+判别实验（一次优先）→ post-prove dual BOTH PASS → meetwise 授权 nail**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权 ≠ 根因结论预claim。
**输入事实（G7W 收据在案引用 · 只读 · a4e49b8a 在卷）**：
- **红形态**：iso e2e CMD1 EXIT=1 `failureClass=api` **38013ms**（G7S 38428 / G7U CMD1 40560 / G7U CMD3 内层 37904 同簇 37.9–40.6s）——journey 走到尾段后 **~11-12s DB 静默**（sidecar tick-24→35 零新行零状态迁移 · 末 DB 活动 00:23:05 → receipt 终点 00:23:17.866）后 **uncaught throw**（class=api= `e2e/full.e2e.ts:383-385` `main().catch` 兜底分类 · 非端点定位 · G7W 承卷）。
- **supply chain CLEAN**：`interview_job` 6 行全 done（start ×2 + answer ×4）· attempts=1 · last_error 全 NULL · interview completed=1（G7S 修复生效面已验证）——**Ban 把根因往 supply/route 面归因**（`job_route_decision`/`job_semantic_revision` 零行=route 面未被行使 · 非「通过」是「未达」）。
- **`job_application` 恒 0 行**（35 tick 全程 · C-MO-1/C-HA-1 纠偏后 35/35 ok 合法空读）→ **死于 application face 之前**；J-A4 锚=`job_application`@`0005_job_application.sql:20`。
- **死亡窗收敛**：主面试 completed（tick-24）后、**7a 第三 interview 创建前**——`full.e2e.ts:220` `POST /interview`（failIv）零落行 · start job 恒 2 · `recruiter.ts:132` `applyToJob`（`INSERT INTO job_application` :137-141）亲读锚=步骤 9 未达。死亡窗 ∈ [step 7 `GET /interview/:id/report`（:213）前后， 7a POST /interview 落库前]——窗内机制未知=本刀对象。
- **`schema_validation_failed ×2` @tick10/12**：已被 question-generation MALFORMED 优雅路径吸收（`packages/domain/src/question-generation.ts:39/:46` · `invoke.ts:711-712` 写入方）· 致死性未定——**已另立 P2 独立刀，非本刀范围——Ban 本刀归因它**（本刀四臂设计零引用该读数作归因依据）。
- **正确面参考**：golden（release-candidate 旅程）同 run 正常走完——G7W EXEC 实验一 6 run / 12 golden 执行全绿（`a4e49b8a` Receipt 01 · 同 run 内 · 冷栈+冷 build 条件含）——runner/栈冷启面无同类尾段死亡反例。

**Base**: `origin/feat/mysql-schema-skeleton` **`84bbef23`**（full `84bbef2367b0870d30385d2e107449133876ad60` · 本地 remote-tracking ref 实测=84bbef23 与预期 tip 恰等 · turn 内 fetch 网络间歇堵如实记：`git fetch` connect 失败一次 · tip 以任务给定值+本地 ref 双证承卷 · EXEC 期重钉须重新 fetch）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-taildeath` · branch `line/g7k-taildeath-rootcause`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · trio **OPEN**（G7U 真测 1/1/1 retained）· CMD1 api 红面 **OPEN**（G7W 定位在卷 · 本刀根因面）· **GAP-G7K-API-REDS P1 OPEN**（backlog `:107` 状态行不翻——**本刀只产根因证据，关闭/修复另刀**）· `schema_validation_failed` 致死性 **OPEN**（P2 另刀 · 本刀零触碰）· 残红①（旅程自适应早停 ×2）/旧红③ `full.e2e.ts:203`（C-MO-P3）非本刀零触碰 · `r1Closed=false` · Disclosure-1 OPEN · `techRoleFailClosedOptOutG7Only=true` · **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban 实验执行 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动、零 spec 改动、零 wrapper 改动、零 sidecar 落地**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`84bbef23`；关键码面 blob `git hash-object` 亲算在卷 §1.4）；**(b)** G7W EXEC 收据 3 文件（`ai-docs/delivery/receipts/g7w-golden-api-discriminator/` · commit `a4e49b8a` · 本 tip 祖先 `git merge-base --is-ancestor` EXIT=0 亲测）+ G7W PRE/POST 双审（`1cfb0cdf`/`10e25f38` + rv/g7wp-e2e-ha POST 段）引用；**(c)** G7S/G7U/G7T/F-F committed 收据链机制引用。不发明任何未在案明细；EXEC 期行号按当 tip 重核回填。**根因无论是否定位、无论命中哪臂或零臂命中，如实入收据（Ban 定谳压力 · Ban 就地 reinterpret · Ban 强行单臂归一）。**

## 1. 范围 = 四臂预注册根因调查（沿 FLK/G7W 预注册先例：每臂假设+判别读数+预期 EXIT+反例分支 · Ban retry-to-green）

> **预注册先例**：FLK GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause 刀（每实验假设/判读/反例 · nail @checklist `:1273` `post_prove_dual_pass`）+ G7W 甄别刀（H-G1~G3 / J-A1~A6 · EXEC 忠实兑现）。本刀四臂**多臂并存、不预设单一根因**：单次判别 run 的读数按臂分别落「命中/削弱/不可判」三值，**多臂可同时命中或同时零命中**——Ban 事后择一臂定谳、Ban 判读表外值域就地 reinterpret。

### 1.1 死亡窗码面定性（本席亲读 @`84bbef23` · 亲算 blob §1.4）

尾段旅程结构（`e2e/full.e2e.ts` blob `7d65d0f3` · 与 G7W 时代全等）：主循环 `driveInterviewToTerminal`（`e2e/helpers/interview.ts:286` deadline 默认 `INTERVIEW_TERMINAL_DEADLINE_MS=420_000` :7 · 终态族 :8 `report_ready/report_unavailable/assessment_unavailable/interview_unavailable/error`）→ **step 7**（:212-216）`GET /interview/:id/report` + 2 断言（status 可查 / 与终态自洽）→ **7a**（:218-238）报告失败隔离：第三 interview `POST /interview`（:220）→ begin 复用**同 resume-id**（:223）→ failLoop 期望 `report_unavailable`+`quarantined`（:236-237）→ **7b**（:240-256）quiz/diagnosis 全栈 → **step 8**（:258+）B 端 `job_posting` → **step 9**（:292）`applyToJob`（`recruiter.ts:132` → `INSERT INTO job_application` :137-141）。

服务端面：`GET report`=`interview.service.ts:672` **快读**（有行返 status/content、无行查 interview_event 终态族、真进行中 404）——**不等报告生成**；报告生成走舱壁 `apps/worker/src/report-worker.ts`（blob `06d87f73`）`drainReportsOnce`（:30 tx1 claim → 模型事务外 → tx2 finalize · markReportFailed :49 · 租约 120s 量级 :44 注记）+ `sweepReportsOnce`（:63 重排 failed/隔离 poison-pill → `report_unavailable` 事件 :66-68）。API 无 per-request access log（`apps/api/src/main.ts:22` `logger: false` 亲算 blob `d20dbed0`）——「请求是否到达服务端」不可从日志直读=仪器边界如实记。

**G7W DB 时间线锚**：tick-24（00:23:05）主面试 completed=首現后**零新行**至 tick-35（00:23:16.8）→ 7a 的 `POST /interview` 零落库 → **死亡窗 ∈ [step 7 前后， 7a POST 落库前]**，窗长 ~11-12s 后 uncaught throw。窗内三面（DB 行 / ai_model_invocation / 后端日志）在 G7W 读数中全静默——静默的**原因**即本刀四臂对象。

### 1.2 四臂假设族（预注册 · 判别读数与预期 EXIT 逐臂写清）

---

**H-T1 报告段（report generation / worker 重试链）尾段死亡**

- **机制候选**：主面试 report job 的舱壁生命周期（claim → 模型 → finalize / 失败 → markReportFailed → sweep 重排/隔离链）在尾段卡住、失败或重排；驱动侧 step 7 `GET report` 或与报告状态机交互（终态自洽断言 :216）在报告行 pending/failed 状态组合下抛出未捕获异常。子面 H-T1a=报告行状态异常（pending 卡住/failed）；H-T1b=worker 侧卡死（租约未到 120s 不重排 · 调度静默）；H-T1c=报告 invocation 层失败（模型面 · 但 **Ban 归因 schema_validation_failed=P2 面**——本臂模型面读数仅记录 service/latency/时刻，**不触及 error_code=schema_validation_failed 的归因**）。
- **判别读数**：(i) `assessment_report` 状态分布 + 主面试行 status（新增 SQL 读数 instrument §1.3-N1 · `@0001_baseline.sql:336` status CHECK pending/ready/failed）；(ii) `ai_model_invocation` 按 service×status 分布 + `max(latency_ms)`/`max(completed_at)`（§1.3-N2 · report 叙事 invocation 存在性/时刻/时延——G7W 白名单 q5 只按 service,status,error_code 聚合、无时刻面）；(iii) `interview_event` kind 分布（§1.3-N3 · `report_ready`/`report_unavailable`/`interview_unavailable` 事件面 · Ban payload 列）；(iv) worker 日志尾随（死亡窗内 report worker drain/sweep/报错行 · name-only §1.3-D）；(v) sidecar tick 时间线窗内新行（G7W 读数=零 · 复核面）。
- **预期 EXIT**：判别 run 红 retained（EXIT=1 class=api · duration 落 37.9–40.6s 同簇）≠ 判别失败。命中形状：report 行 pending/failed 或 report 叙事 invocation 缺席/异常时刻 + 窗内 worker 日志活动/报错 → H-T1 置信升。
- **反例分支**：report 行 `ready` + `report_ready` 事件在卷 + report invocation succeeded 且 completed_at 早于死亡窗起点 → H-T1 三子面全削弱（权重移 H-T2/H-T3/H-T4 联合判读 · 如实落字）。

---

**H-T2 B-side/review 段断言或等待超时**

- **机制候选**：step 7 断言对（:215 `报告端点可查` / :216 `报告 status 与终态自洽`）或更后 B-side/review 段（:258+ step 8/9 · review ledger 面）断言失败或等待超时抛出。注记（如实预注册）：G7W DB 读数已示 7a 零落行 → 本臂**先验概率低**，但预注册不预设单一根因——本臂以段标记行收敛读数参与判读。
- **判别读数**：(i) 段标记行收敛链（§1.3-N4）：第三 interview 行（=7a 起）→ `job_posting` 行（=step 8 · `@0004_recruiter.sql:3`）→ `job_application` 行（=step 9 · G7W 已读恒 0）→ `resume_quiz`/`quiz_job`/`resume_diagnosis` 行（=7b · `@0007:5/:17`/`@0008` · 表名 EXEC 按 migrations 实测重核 · 差者按 ok/error 纪律如实记——C-HA-1 先例）；(ii) report 行面 + interview_event 面（与 H-T1 共读 · step 7 断言死因的状态组合形状）；(iii) machine receipt `assertionCount`/reviewLedger 形状（四源交叉）。
- **预期 EXIT**：红 retained。命中形状：任一段标记行 >0（如 `job_posting`>0 而 `job_application`=0）→ 死亡点后移该段（H-T2 升）；或 report 行面呈「step 7 断言必炸」状态组合（如终态 `report_ready` 而 report 行非 ready 的矛盾组合）→ step 7 断言死因（H-T2 子面升）。
- **反例分支**：全部段标记零行 + report/event 面自洽（无矛盾组合）→ H-T2 削弱。

---

**H-T3 第三 interview 创建前资源/顺序问题**

- **机制候选**：7a 的 begin 复用**同 resume-id**（:223）与主面试遗留资源冲突：resume 行/事件流的锁竞争（report worker 事务/租约持有）、API 侧连接池耗尽或慢查询占用、PG 锁等待超时（服务端 5xx/hang）、或主面试收尾写（notification/report finalize/事件 append）与 7a 建面写的顺序依赖未满足。
- **判别读数**：(i) **live 窗采样 `pg_stat_activity`**（§1.3-N5 · 判别 run 期与快照同 tick 聚合 `state/wait_event_type/wait_event/count` · **Ban query 与应用数据列**·最小读面）——锁等待/长事务/空闲事务在死亡窗内的可见性（G7W 无此读数=本刀新增判别维度）；(ii) API 后端日志尾随（all-exceptions filter 输出/池错误/5xx 行 · name-only §1.3-D）；(iii) sidecar tick 时间线：死亡窗起点与 tick-24 的精确间隔——**~11-12s 窗长是否跨 run 恒定**（G7W 38.0s + 在卷簇 37.9/38.4/40.6 的构成分解）；(iv) 仪器边界如实记：API 无 access log（`main.ts:22`）→ 「7a 请求是否到达服务端」不可直读，由 pg_stat_activity+DB 行面+窗长形状联合承担。
- **预期 EXIT**：红 retained。命中形状：窗内 pg_stat_activity 出现锁等待/长事务聚合计数 >0、或 API 日志池/5xx 错误行 → H-T3 升。
- **反例分支**：窗内 DB 连接面全静默（无活动查询、无等待事件）且后端日志零输出 → H-T3 削弱（权重移 H-T4）。

---

**H-T4 测试 harness 自身尾段（teardown/timeout/清理）伪红**

- **机制候选**：驱动侧（harness 面）而非产品面产生死亡：fetch 阻塞后连接层失败（keep-alive 空闲断连重用竞态 · POST 不重试语义）、`e2e/helpers/sse.ts:63` `readSseEvents timeoutMs=1200` abort 语义在尾段的误伤面（自述「short abort 期望内非产品失败」· blob `9bba015d`）、驱动自身等待/清理死锁、或 wrapper 收尾竞态——红为**伪红**（产品无此缺陷 · 修复路由=harness 刀非产品刀）。
- **判别读数**：(i) 窗内三面（DB 行 / pg_stat_activity / 后端日志）**全静默而进程仍死亡** → harness 阻塞面权重升（产品无活动可等、驱动却未推进）；(ii) 时长形状：跨 run 死亡窗长度方差（旅程段 ~26s + 尾段构成分解——**恒定 ~12s 尾窗**指向确定性阻塞点位、随机窗长指向资源/负载面）；(iii) 码面事实：step 7→7a 之间**零 SSE 调用**（:216-220 亲读）——尾段死亡窗内 SSE abort 语义不可达=H-T4 的 sse 子面预注册即带码面界线（若判别读数示死亡在主循环/7a failLoop SSE 面则该子面复活·如实记）；(iv) machine receipt + `E2E_FAILURE_CLASS class=api code=client_uncaught` 四源交叉（兜底分类非定位 · G7W 承卷）；(v) 退出堆栈面=withhold 契约内不可回读（断言原文/case 名回读裁定权归 meetwise）——本刀**不以 stderr 回读为判据**，以三面读数+时长形状承担 H-T4 判别。
- **预期 EXIT**：红 retained。命中形状：三面全静默 + 尾窗恒定 + report/event 面自洽 → H-T4 升（伪红候选成立 · 修复路由=harness 刀）。
- **反例分支**：任一面窗内出现产品侧活动/报错 → H-T4 削弱（产品面在动 · 非纯 harness 阻塞）。

---

**判读总纪律**：单一读数不定谳（「与 X 一致」≠「X 已证」沿 G7R C-MO-2）；主读与旁证必须联合判读；**多臂输出契约**——EXEC 收据按臂落「命中/削弱/不可判」三值+读数依据，多臂并存合法（如 H-T3 锁等待 + H-T1 报告行 pending 可同源），**Ban 强行归一单臂、Ban 未命中臂抹除（四臂全落字含零命中臂）**；判读表未覆盖读数 → 如实回 meetwise（Ban 就地 reinterpret）；逐查询执行状态纪律沿 C-HA-FF-3（查询报错 ≠ 空读 · 仪器错误不得改判/触发补跑）。

### 1.3 仪器（复用 G7W sidecar 方法 · 新增 SQL/日志面读数全部在本段声明 · **冻结投影白名单本体零触碰**）

- **A · G7W sidecar 机制原样复用**（wrapper 零 diff · blob `13dbfc43` 前后全等机检强制）：wrapper stdout tee 至 worktree `.tmp/g7x-cmd1.log`（不入 git）→ sidecar 只读探针监测端口行 `E2E isolated PostgreSQL: … on 127.0.0.1:<PGPORT>`（`run-e2e-isolated.mjs:2310`）→ 宿主 TCP 连隔离 PG（凭据=wrapper 自身固定测试凭据同面 · 非模型 Key）→ 周期轮询（1000ms · EXEC 定值一次成型）→ **ndjson 冻结投影**快照追加 `.tmp/g7x-sidecar/snapshots.ndjson`（时间戳 + 逐查询执行状态 ok/error（含报错摘要）+ 全部 SELECT 行）→ wrapper `finally` 拆容器前最后成功快照即证据。ok/error 逐查询纪律沿 C-HA-FF-3；sidecar 进程挂 `client.on('error')` 兜底（G7W OB-2 仪器改进项 · 本刀 sidecar 为 `.tmp/` 不入 git 脚本非产品码 · 落地时兑现）。
- **B · 冻结投影白名单本体=G7W 9 查询 SELECT-only 族逐字承卷零改**（`interview_job` last_error 主读 + `job_route_decision`/`job_semantic_revision` + `interview` + `ai_model_invocation`(service,status,error_code) + `ai_invocation_trace` 计数 + `route_consumption_event`/`interview_route_snapshot` + **纠偏后 `job_application`**@`0005:20`）——**禁碰本体**；新增读数以**独立附加槽位**（独立编号/独立 SQL 行）并入 sidecar 快照，与冻结投影逐查询状态分开记录、可审计区分。
- **C · 新增 SQL 读数（本 REQUEST 声明 · 全 SELECT-only · Ban `interview_job.payload`/`ai_invocation_trace.output`/`interview_event.payload`/`pg_stat_activity.query` 及一切内容列 · 零写语句）**：
  - **N1** `SELECT status, count(*) FROM assessment_report GROUP BY 1;`（`@0001_baseline.sql:336` · H-T1 主读）
  - **N2** `SELECT service, status, count(*), max(latency_ms), max(completed_at) FROM ai_model_invocation GROUP BY 1, 2;`（`@0037:7` 列锚 · H-T1 重试链/时刻面 · service 列非敏感）
  - **N3** `SELECT kind, count(*) FROM interview_event GROUP BY 1 ORDER BY 2 DESC LIMIT 20;`（`@0001:38` · 事件面 · Ban payload）
  - **N4** `SELECT count(*) FROM job_posting; SELECT count(*) FROM resume_quiz; SELECT count(*) FROM quiz_job; SELECT count(*) FROM resume_diagnosis;`（段标记收敛 · H-T2 · 表名 `@0004:3`/`@0007:5/:17`/`@0008` EXEC 按 migrations 实测重核 · 差者按 ok/error 纪律如实记 · Ban 据报错改判）
  - **N5** `SELECT state, wait_event_type, wait_event, count(*) FROM pg_stat_activity GROUP BY 1, 2, 3;`（**live 窗采样** · 与快照同 tick · H-T3 锁/池面 · Ban query/usename/application_name 列 · 系统视图只读非业务表 · 最小读面声明在此）
- **D · 后端日志尾随**：api+worker 进程输出经 wrapper stdout（spawn inherit 面）tee 至 `.tmp/g7x-cmd1.log` 同窗落点；sidecar/本席对死亡窗内日志行做 **name-only 摘要**（行类型/计数/时刻戳）入收据，**原文留 `.tmp/` 不入 git**（C-HA-4 先例）；api 无 per-request access log（`main.ts:22` logger:false）=仪器边界如实记（H-T3 判读边界已声明）。**Ban 子进程 stderr 回读**（e2e 驱动 stderr 由 wrapper 内存解析 · withhold 契约面零触碰）。
- **E · 定向判别 run 上限 ≤2（判别实验 · 非 retry-to-green）**：
  - **T-1 主判别 run**：`pnpm e2e:isolated` ×1 + 全仪器面（A+B+C+D）。用途=四臂判读表主读数采集。**预期 EXIT=1 class=api（红 retained）≠ 判别失败**——判别成功判据=快照捕获 §1.3 读数（捕获成功 ≠ e2e pass ≠ trio 翻绿）。
  - **T-2 预注册分支 run**：仅当以下三条件之一成立方触发（EXEC 收据预登记触发条件与判别用途后才跑 · **Ban 事后择优**）：(i) T-1 仪器窗口错失/仪器缺口（boot 前崩溃/连续 miss/sidecar 健康性前提破）；(ii) live 窗瞬态需更细采样（N5 tick 收细至 250ms 量级 · EXEC 定值一次成型）；(iii) T-1 读数呈判读表未覆盖值域且 meetwise EXEC 授权面裁定需第二样本。**T-1 红 EXIT 本身不是 T-2 触发条件**；T-2 判别用途须与 T-1 不同面（增量判别 · 非同仪器重跑）。总上限 2 run · 零第三 run 通道。

### 1.4 码面锚（blob 亲算 @`84bbef23`）

| 锚 | file:line | blob | 内容 |
|---|---|---|---|
| 尾段旅程 | `e2e/full.e2e.ts:186-210`（主循环/终态）· `:212-216`（step 7）· `:218-238`（7a 第三 interview · `:220` POST / `:223` 同 resume-id begin）· `:240-256`（7b）· `:258+`（step 8）· `:292`（apply） | `7d65d0f3` | 死亡窗码面区间（与 G7W 时代 blob 全等亲算） |
| class=api 兜底 | `e2e/full.e2e.ts:383-385` | `7d65d0f3` | `main().catch → emitClassifiedE2EFailure(e,{class:'api',code:'client_uncaught'})` |
| 终态驱动 | `e2e/helpers/interview.ts:7`（`INTERVIEW_TERMINAL_DEADLINE_MS=420_000`）· `:8`（终态族）· `:286`（deadline 默认） | `c8e63f41` | deadline 420s ≫ 12s 尾窗 → 终态 deadline 非死因候选的码面依据 |
| SSE abort 语义 | `e2e/helpers/sse.ts:63`（`timeoutMs=1200` 默认）· `:94`（pollTerminal 60s） | `9bba015d` | 「short abort 期望内非产品失败」自述 · H-T4 sse 子面界线 |
| withhold 冻结 | `scripts/run-e2e-isolated.mjs:2088`（stderr 丢弃）· `:2143`（WITHHELD）· `:2310`（PG 端口行） | `13dbfc43` | 与 G7R/G7U/G7W 冻结钉全等——本刀零 diff 机检承重锚 |
| 报告舱壁 | `apps/worker/src/report-worker.ts:30`（drainReportsOnce tx1/模型/tx2）· `:49`（markReportFailed）· `:63-68`（sweep→report_unavailable）· `:44`（120s 租约注记） | `06d87f73` | H-T1 机制面 |
| GET report 快读 | `apps/api/src/modules/interview/interview.service.ts:672` | `fbea8aeb` | 快读不等生成 · 有行返 status/无行查事件/进行中 404 |
| api 无 access log | `apps/api/src/main.ts:22`（`logger: false`） | `d20dbed0` | 仪器边界（H-T3 判读限制）码面依据 |
| applyToJob | `packages/db/src/recruiter.ts:132`（函数）· `:137-141`（INSERT job_application） | `d06b4f49` | application face 写入方（G7W 承卷亲读锚 @tip 重核） |
| schema 读数面 | `packages/db/migrations/0001_baseline.sql:38`（interview_event）· `:336`（assessment_report status CHECK pending/ready/failed）· `0005_job_application.sql:20` · `0037_ai_model_invocation_durable_claim.sql:7`（service/latency_ms/completed_at 列）· `0004_recruiter.sql:3`（job_posting）· `0007_resume_quiz.sql:5/:17`（resume_quiz/quiz_job）· `0008_resume_diagnosis.sql`（resume_diagnosis） | —（migration 锚） | 新增 SQL 读数 N1-N5 的 schema 依据（EXEC 期逐条重核） |
| 已清面 | `packages/ai-runtime/src/model-operation-registry.ts:63-71` | `63af556f` | G7R post-dual 裁决清面——**零触碰** |
| 旧红③ 断言 | `e2e/full.e2e.ts:202-204` | `7d65d0f3` | C-MO-P3 断言语义刀——**本刀零触碰零 diff** |
| wiring | `package.json:278`（`e2e:isolated`） | `0afb3bd2` | T-1/T-2 CMD 入口 |

## 2. 边界（Ban 清单）

1. **Ban 归因 `schema_validation_failed`**：该读数致死性已另立 **P2 独立刀**——本刀四臂设计与判读零引用其作归因依据；N2 读数若现该 error_code 形状 → 如实登记「P2 面读数 · 本刀不归因」转协调方，**Ban 本刀就此定谳**。
2. **Ban 归因 supply/route 面**：G7W CLEAN 在卷（6 job done · last_error 全 NULL · route 面未行使）——四臂设计零 supply/route 臂；读数若与在卷 CLEAN 矛盾 → 显式证伪分支：如实记矛盾 + 回 meetwise，**Ban 扫入基建 catch-all、Ban 就地 reinterpret**（沿 F-F C-MO-P1 纪律）。
3. **Ban retry-to-green**：每跑有假设+判别读数+反例；判别 run 上限 2（T-2 仅预注册分支 · T-1 红 EXIT 非触发条件）；红 EXIT 原值记账不冲销 G7U 真测 1/1/1 台账；Ban flake 记法冲销、Ban 只留绿 attempt、Ban 事后择优。
4. **Ban 自批**：pre-exec 与 post-prove 双审均 mw-e2e-ha + mw-model-op 两席独立 · alone ≠ dual · 本席不代签任何 peer。
5. **Ban 改共享 SSOT / backlog 翻转**：GAP-G7K-API-REDS `:107` P1 OPEN 状态行不翻（`0c6c3287` 登记）；covered 矩阵/north-star-SSOT 零触碰（登记留 nail 阶段）；sibling 归档（G7K/G7R/F-F/G7S/G7T/G7U/G7W 收据 lifecycle）零改写。
6. **Ban 关 GAP-G7K-API-REDS 任何行**：本刀只产根因证据——根因定位 ≠ 关闭 ≠ 修复；关闭/修复另刀走 REQUEST + 双审 + meetwise 授权 nail 全链。
7. **Ban secrets**：模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · **name-only 入卷**）· Ban 值/fingerprint 入 receipt/log/commit · Ban 写任何 `.env*` · DB 直读用容器固定测试凭据（非模型 Key）· `.env*` ABSENT presence 逐 attempt 记录。
8. **Ban 修复 / Ban 碰产品码 / Ban withhold 契约触碰 / Ban 破坏性注入 / Ban masking**：根因调查=只读诊断，修复按结论另刀；`run-e2e-isolated.mjs` 全文件零 diff（blob `13dbfc43` 前后全等机检强制）· **读 DB 不读 stderr** · 断言原文/case 名回读=契约变更裁定权归 meetwise；慢速因子仅限无破坏观测类（采样加密/分段计时）· Ban 清 BUILD_ID/降资源/杀进程复现；Ban 伪造产品不可能状态。

## 3. prove 方案（EXEC 期 · pre-exec dual BOTH PASS + meetwise 授权后方可行）

1. **前置**：pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ **meetwise EXEC 显式授权**（定值面：sidecar 周期/N5 live 采样 tick/T-2 触发分支口径——一次成型 · committed SHA 重钉含重新 fetch）→ 独立 worktree + `pnpm install --frozen-lockfile`（EXIT 记录）。
2. **执行序**：T-1 主判别 run（仪器 A+B+C+D 全开 · §1.3-E）→ 四臂判读表逐臂落字（命中/削弱/不可判 三值 + 读数依据）→ T-2 仅预注册分支触发 → **根因无论是否定位，如实入收据**。
3. **七字段逐 attempt 全记录**：CMD 原文 + EXIT 原值 + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 SHA）+ worktree/branch + 环境探针（`.env*` ABSENT + `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only + sidecar 端口行命中时刻/tick 数/逐查询执行状态含 N1-N5 槽位）+ 判读表归类。`EXIT`/`E2E_FAILURE_CLASS`/machine receipt（`.tmp/e2e-receipts/*.json`）/快照 ndjson 四来源交叉一致才可引用；**全部 attempt 全记录 Ban 删除覆盖**。
4. **机检钉**：committed SHA 处 blob `13dbfc43`（withhold wrapper）/`7d65d0f3`（full.e2e.ts 含旧红③ 断言面）/`63af556f`（`:68-:71` 已清面）EXEC 前后全等机检重跑入收据；漂移即停报 meetwise。
5. **预算与 live 面**：T-1 ≤10 次 live 调用口径（CMD1 全旅程 · G7W live=7 账本实测在卷）· T-2 同口径 → 总 ≤20 ≪ 200；超限即停如实记中止（不洗 not_run）；**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
6. **收据落点**：`ai-docs/delivery/receipts/g7x-taildeath-rootcause/`——per-run 收据 + SUMMARY（四臂三值判读 + 死亡窗机制定谳段/挂起段 + Pins/Retained 原值 + `g7SuiteGreen=false` 保持声明 + 根因结论无论是否定位如实入收据）。evidenceOfRecord/SSOT 登记**留 nail 阶段**。
7. **EXIT 后路由**：根因定位成立 → 修复走对应另刀（报告面→产品刀 · 锁/池/顺序面→产品或基建刀 · harness 伪红→harness 刀 · 各自独立 REQUEST+双审+meetwise 授权）；未定位/矛盾/仪器错失 → 如实回 meetwise，Ban 就地 reinterpret、Ban 私自补跑。

## 4. EXIT 契约（双向）

- **根因定位成立** → 四臂判读收据成立（措辞纪律：「与 X 一致」≠「X 已证」· 单一读数不定谳 · 多臂三值全落字）；**定位 ≠ 修复 ≠ GAP-G7K-API-REDS 关闭 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**——关闭/修复 = 修复刀 REQUEST + 双审 + post-prove dual + meetwise 授权 nail 全链（缺一不可）。
- **未定位/矛盾/仪器错失** → 如实登记 → 回 meetwise；判别 run 红 EXIT 原值记账（预期红 ≠ 失败 · 也**不冲销** G7U 真测 1/1/1 retained 台账）。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim 四臂判读结果。

## 5. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 根因定谳（四臂判读未产生 · 本 turn 只有设计）· not GAP-G7K-API-REDS closed（`:107` P1 OPEN 不翻 · 关闭另刀）· not `schema_validation_failed` 归因/定谳（P2 另刀 · 本刀零触碰）· not supply/route 面重开（G7W CLEAN 承卷）· not trio green（1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator/meetwise authorize · not withhold 契约裁定 · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

---
*Harness · G7X CMD1 api-face 尾段死亡根因调查刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 四臂预注册（H-T1 报告段/worker 重试链 · H-T2 B-side/review 断言或等待 · H-T3 第三 interview 前资源/顺序/锁池 · H-T4 harness 尾段伪红 · 每臂判别读数+预期 EXIT+反例 · 多臂三值 Ban 归一）· 仪器=G7W sidecar 复用（ndjson 冻结投影白名单本体零触碰）+ 新增 SQL 读数 N1-N5（assessment_report/ai_model_invocation 时刻面/interview_event/段标记行/pg_stat_activity live 采样 · 全 SELECT-only Ban 内容列）+ 后端日志尾随 name-only · 定向判别 run ≤2（T-2 仅预注册分支 · 非 retry-to-green）· Ban 归因 schema_validation_failed（P2 另刀）· Ban 归因 supply/route（CLEAN 在卷）· Ban 关 GAP-G7K-API-REDS 行（只产证据）· 读 DB 不读 stderr withhold 零触碰 · 预算 ≤20 ≪ 200 · STOP*
