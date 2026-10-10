# Receipt — **GAP-UC004-FAIL-A3 / NHP-004-FAULT-01 · FAULT real evidence prove**

**Date**: 2026-10-03
**Prove CMD**: `pnpm uc004:career-path-fault:prove`（三层包装：root `uc004:career-path-fault:prove` → `node scripts/run-e2e-isolated.mjs uc004:career-path-fault:prove:raw` → root `:raw` → `pnpm -C apps/api prove:uc004-career-path-fault` → `apps/api/test/uc-e2e-004-career-path-fault.proof.ts`）
**隔离壳（C-1）**: per-run 随机容器 `meetwise-e2e-<pid>-<ts>` + 动态端口（run4 `127.0.0.1:50369`）；target 已注册 `scripts/run-e2e-isolated.mjs` 支持表（`unsupported_e2e_target` 守卫）+ 迁移白名单（applied=134）+ `isolatedReceiptSources`；`ISOLATED_TARGET_ATTESTATION ok`（loopback + `meetwise.e2e_run_token` nonce 校验，破坏性操作前先行 attestation）。禁共享卷/固定端口 —— 无。
**录制拓扑**: API = 真实 NestJS **子进程**（`node --import @swc-node/register/esm-register src/main.ts`，随机空闲端口）；prove 进程独立存活以便故障杀死 API 后仍能取证；SQL 侧证据 = prove 自有 superuser 直连池。
**实际 EXIT**: **1**（诚实保留 gap · 见下「裁决」）。两次已录入运行 EXIT 均为 1。
**Harness**: `harness/gap-uc004-fault-real-evidence.md` · slice `gap-uc004-fault-real-evidence.slice.md` · REQUEST `reviews/REQUEST-2026-10-03-gap-uc004-fault-real-evidence-mw-{mw-rag-route,mw-e2e-ha}.md`（pre-exec dual BOTH PASS：mw-rag-route `bcc7bed` · mw-e2e-ha `a2da2f1`）
**Machine receipts（.tmp，gitignored，非 release 证据）**: `.tmp/isolated-proof-receipts/2026-10-03T11-52-31-702Z-*.json`（run3）· `2026-10-03T11-57-22-333Z-38319-34752cdf-a4d1-4194-a759-0916b44c80d6.json`（run4）
**Pins**: haStatus=NOT_HA · releaseEvidence=**false** · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE=**503**

---

## 1. 运行账目（全披露 · 含 bootstrap 中断）

| run | 时刻(UTC) | 结果 | 说明 |
|-----|-----------|------|------|
| 1 | 11:46 | **bootstrap 中断**（0 attempts） | 种子会话未设 `app.principal_user` → 迁移 0059 projection fence 触发器（`assessment_report` BEFORE INSERT → `assert_interview_privacy_active`）raise `interview_privacy_fenced`。产品 API 路径不受影响（`asPrincipal` 设 GUC）。修复：种子改专用 client + `set_config('app.principal_user','userA')`（与产品同语义，非产品改动）。 |
| 2 | 11:50 | **bootstrap 中断**（0 attempts） | 实现方脚本工具性 `ReferenceError: dims`（run1 修复引入）。修复。 |
| 3 | 11:52 | **已录入 · EXIT=1** | 首次含注入的完整运行，4 attempts 全记录。事后发现**两处探针（prove 侧）缺陷**：① FI-2 存活探针误期望 control 面试 GET=404（该面试有对照行，合法值 200）→ `FI2-SERVER-ALIVE-AFTER` FAIL 为探针缺陷，非产品现象；② FI-3 将 `packages/ai-graphs/src/index.ts:3` 路线图**注释**行（「…career-path/report 后续按同一注入约定补」）误计为接线 → attempt exit=0 与 unreachable 文本矛盾。**按 C-2 原样保留，未重跑至绿**。 |
| 4 | 11:57 | **已录入 · EXIT=1** | 修复两处探针缺陷 + 增加 `EVIDENCE` 全量落盘（C-3 快照）。产品面观察与 run3 完全一致（可复现）。 |

- `one_shot=true` · `retry_to_green=false`：每次注入 attempt 在其运行内执行且仅执行一次；run3/run4 均 EXIT=1，产物类未变，不存在「重跑至绿」。run1/2 无任何注入 attempt。
- run3 的探针缺陷属 prove 工具层（不改产品、不改 fixture、不改注入语义）；两运行全部 attempt 账目保留如下。

## 2. Run 4 attempts（证据完整版 · 全部原样）

| # | id | 注入 | attempt EXIT | F1（准确 HTTP 状态码+响应体） | F2（SQL 直查 + HTTP GET） | F3（账本 before/after 实测） | 其他 |
|---|----|------|--------------|------------------------------|---------------------------|------------------------------|------|
| 1 | ATTEMPT-0-CONTROL | 无（阳性对照） | **0** | POST=200，body=`{readiness:"需补强后投递",level:"mid",milestones:[…]}` | SQL `career_path` rows=1 · GET=200 | bucket 5.00/0.00/0.00 · consumption [] · orders [] → **净变 0** | 注入点可达（故障可归因） |
| 2 | ATTEMPT-1-FI2-STATEMENT-TIMEOUT | **FI-2 依赖超时**：锁占位 `career_path`（ACCESS EXCLUSIVE），INSERT 被产品自身池配置 `statement_timeout=15000ms`（`packages/db/src/principal.ts` createPool）中止（SQLSTATE 57014 类，非外部 cancel 伪造） | **0** | **500** `{"error":"internal_error"}`（durationMs=15021≈产品 15s 超时；统一脱敏信封，可解释、非 200-假成功） | SQL rows=**0**（无半写）· GET=**404** `{"error":"not_found"}`（GET 不返回失败产物） | 同上快照 before===after → **净变 0**（实测，非 D1 口径假设） | `blocked_pid_found=true` · `server_alive=true` · `graph_run_rows=0` |
| 3 | ATTEMPT-2-FI1-CONNECTION-BREAK | **FI-1 连接断**：锁占位后 `pg_terminate_backend` 杀掉正在执行 INSERT 的后端（blocked_pid 命中，terminated=true） | **1** | **无 HTTP 响应**：`transport_closed: UND_ERR_SOCKET`；**API 子进程 exit_code=1**（崩溃） | SQL rows=**0**（语句级原子，无业务事实污染）· GET 侧 **不可执行**：`unreachable: ECONNREFUSED`（进程已死） | 快照 before===after → **净变 0** | **崩溃根因（实测 stderr）**：`Emitted 'error' event on Client instance … Error: Connection terminated unexpectedly`——pg-pool 3.14 `idleListener` 对任何 client 错误 `pool.emit('error')`，产品池无 `error` 监听器 → uncaughtException 进程退出。`graph_run_rows=0`（无伪造 failed run） |
| 4 | ATTEMPT-3-FI3-GRAPH-FAIL | **FI-3 图失败状态机**：尝试构造 `AiGraphRun(career-path) active→failed` 注入点 | **1（UNREACHABLE）** | —（不可构造，非可观察对象） | — | — | **file:line 证据**：`apps/api/src/modules/interview/interview.service.ts:749` `generateCareerPath` 为同步 derive（`:764` `deriveCareerPath` 调用，区域 graph-wire 正则=false）；`packages/ai-graphs/src/index.ts` 非注释行 career 接线=0（:3 为路线图注释）；`packages/ai-graphs/src` career 图文件=none；`ai_graph_run` `graph_name='career-path'` rows=**0**（Ban 伪造，实测） |

Run 4 全量 stdout（原文，含每 attempt `EVIDENCE` 行的 F1 响应体、F2 双侧值、账本 before/after 逐行快照、子进程崩溃 stderr tail）：

```
（见 §4 附录全文引用）
```

> 附录在本文档末尾 §Appendix，逐字收录 run4 完整 stdout；run3 的 ATTEMPT 行逐字收录于 §3。

## 3. Run 3 attempts（首次录制 · 探针缺陷已标注 · 原样保留）

```
PASS  CONTROL-0-POST-200
PASS  CONTROL-0-SQL-ROW-1
PASS  CONTROL-0-GET-200
PASS  CONTROL-0-LEDGER-NET-0
ATTEMPT 1 id=ATTEMPT-0-CONTROL fault=none(positive control) exit=0 ts=2026-10-03T11:52:15.961Z post=200 sql_rows=1 get=200 ledger_net=0
PASS  FI2-F1-HTTP-EXPLAINABLE
PASS  FI2-F2A-SQL-NO-HALF-WRITE
PASS  FI2-F2B-GET-NO-FAILED-PRODUCT
PASS  FI2-F3-LEDGER-NET-0
FAIL  FI2-SERVER-ALIVE-AFTER        ← 探针缺陷：误期望 IV_CTL GET=404（control 行存在，合法 200）；同 attempt 内 get=404/not_found 已证 500 后服务存活
ATTEMPT 2 id=ATTEMPT-1-FI2-STATEMENT-TIMEOUT fault=FI-2 dependency timeout (pool statement_timeout=15000ms, SQLSTATE 57014 class) exit=1 ts=2026-10-03T11:52:30.989Z blocked_pid_found=true durationMs=15009 http=500 body={"error":"internal_error"} sql_rows=0 get=404/not_found ledger_net=0 server_alive=false graph_run_rows=0
FAIL  FI1-F1-HTTP-EXPLAINABLE
PASS  FI1-F2A-SQL-NO-HALF-WRITE
FAIL  FI1-F2B-GET-NO-FAILED-PRODUCT
PASS  FI1-F3-LEDGER-NET-0
PASS  FI1-NO-FAKE-GRAPH-RUN
ATTEMPT 3 id=ATTEMPT-2-FI1-CONNECTION-BREAK fault=FI-1 connection break (pg_terminate_backend on INSERT backend) exit=1 ts=2026-10-03T11:52:31.291Z blocked_pid_found=true terminated=true http=transport_closed:UND_ERR_SOCKET child=exit_code=1 signal=null sql_rows=0 get=unreachable:ECONNREFUSED ledger_net=0 graph_run_rows=0
PASS  FI3-UNREACHABLE-RECORDED
ATTEMPT 4 id=ATTEMPT-3-FI3-GRAPH-FAIL fault=FI-3 graph fail state machine (AiGraphRun active→failed) exit=0 ts=2026-10-03T11:52:31.295Z REACHED (unexpected on this tree) — no career-path graph wiring: apps/api/src/modules/interview/interview.service.ts:749 generateCareerPath is sync derive (apps/api/src/modules/interview/interview.service.ts:764 deriveCareerPath call, region graph-wire regex=false); packages/ai-graphs/src/index.ts:0 career export lines=1; packages/ai-graphs/src career files=none; ai_graph_run graph_name='career-path' rows=0 (no fabricated run)
                                   ← 探针缺陷：index.ts:3 注释行误计为接线 → attempt exit=0 与 unreachable 文本矛盾；接线证据本身（749/764 同步 derive、0 career 文件、0 graph run）为真
GAP  GAP-UC004-FAIL-A3  EXIT=1 honest gap retained: FI-3 unreachable (see ATTEMPT-3 file:line evidence) + FI-1 degrade not HTTP-explainable as observed (recorded as-is, no retry). NHP-004-FAULT-01 stays gap. A3 NOT closed.
ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=ATTEMPT-0-CONTROL:0 ATTEMPT-1-FI2-STATEMENT-TIMEOUT:1 ATTEMPT-2-FI1-CONNECTION-BREAK:1 ATTEMPT-3-FI3-GRAPH-FAIL:0
CMD=pnpm uc004:career-path-fault:prove EXIT=1
PROVE_EXIT=1
```

Run3 容器 `meetwise-e2e-34430-*` · 动态端口（machine receipt `2026-10-03T11-52-31-702Z-*.json`）。product 面观察（500 internal_error @15s / FI-1 进程崩溃 / ledger 净变 0 / FI-3 不可达）与 run4 一致 → **可复现**。

## 4. Findings（证据 → 语义，Ban invent fix）

1. **FI-2（依赖超时类）**：F1+F2+F3 **全成立**——失败可解释（统一 `{"error":"internal_error"}` 500，无内部泄露）、无假 completed（`career_path` 无本次行、GET 404）、额度/计费账本实测净变 0（bucket 5.00/0.00/0.00，consumption/orders 空，before===after 逐行相等）、进程存活。即：**超时类依赖故障下 A3 的可解释降级+无污染+额度不变已被运行时证据覆盖**。
2. **FI-1（连接断类）**：**A3 降级契约不成立**——单后端终止即令 API 进程崩溃（`Emitted 'error' event on Client` → uncaughtException，exit_code=1），无 HTTP 可解释降级、GET 侧无从谈起。业务事实未被污染（SQL rows=0）、账本净变 0、无伪造 `AiGraphRun=failed`。此为真实可用性/降级缺陷证据；**修复属产品工作，须另刀授权（Ban invent fix）**，本 prove 只记录。
3. **FI-3（图失败状态机）**：**不可达**（见 attempt 4 file:line 证据）。产品为同步 derive，无 career-path 图、无 AiGraphRun 接线、`ai_graph_run` 0 行。按 EXIT 契约铁律：**FI-3 不可达 → 不得 EXIT0 → EXIT1 诚实保留 gap**。
4. **总计**：EXIT=**1**。`UC-E2E-004` FAULT 列、整行与 `NHP-004-FAULT-01` **stays gap**；A3 **NOT closed**；coveredCount=**8** 不变；本 EXIT 不翻任何 SSOT 行（行语义冻结，SSOT 仅 nail 阶段可改）；A3 关闭须 post-prove dual PASS + 协调方授权。
5. `pnpm uc004:career-path:prove`（静态 mark-red EXIT0）与本运行时故障注入证据**互不替代**（C' `0652a08` 原钉保持）。

## Appendix — Run 4 完整 stdout（逐字）

```
UC-E2E-004 career-path FAULT real evidence prove · releaseEvidence=false · Not HA
NOTE: EXIT0 ≠ A3 closed（还须 post-prove dual + 协调方授权）· EXIT1 = 诚实保留 gap · Ban invent fix
NOTE: 与静态 mark-red prove（uc004:career-path:prove EXIT0）互不替代 · attempts one-shot · Ban retry-to-green
ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified
API_CHILD_READY base=http://127.0.0.1:50429
PASS  CONTROL-0-POST-200
PASS  CONTROL-0-SQL-ROW-1
PASS  CONTROL-0-GET-200
PASS  CONTROL-0-LEDGER-NET-0
ATTEMPT 1 id=ATTEMPT-0-CONTROL fault=none(positive control) exit=0 ts=2026-10-03T11:57:06.564Z post=200 sql_rows=1 get=200 ledger_net=0
EVIDENCE ATTEMPT-0-CONTROL {"f1":{"kind":"http","status":200,"body":{"readiness":"需补强后投递","level":"mid","milestones":[{"stage":"补短板","goal":"优先攻克：分布式锁、消息队列"},{"stage":"模拟实战","goal":"完成 3 场达标(≥70)模拟面试"},{"stage":"进阶","goal":"系统项目沉淀 + 深度题复盘"}]}},"f2_get":{"status":200,"body":{"readiness":"需补强后投递","level":"mid","milestones":[{"goal":"优先攻克：分布式锁、消息队列","stage":"补短板"},{"goal":"完成 3 场达标(≥70)模拟面试","stage":"模拟实战"},{"goal":"系统项目沉淀 + 深度题复盘","stage":"进阶"}]}},"ledger_before":{"bucket":[{"id":"5436bcc4-3588-4c49-a670-4cf4ace020b3","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-07-30 11:57:02.840598+00"}],"consumption":[],"orders":[]},"ledger_after":{"bucket":[{"id":"5436bcc4-3588-4c49-a670-4cf4ace020b3","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-07-30 11:57:02.840598+00"}],"consumption":[],"orders":[]}}
PASS  FI2-F1-HTTP-EXPLAINABLE
PASS  FI2-F2A-SQL-NO-HALF-WRITE
PASS  FI2-F2B-GET-NO-FAILED-PRODUCT
PASS  FI2-F3-LEDGER-NET-0
PASS  FI2-SERVER-ALIVE-AFTER
ATTEMPT 2 id=ATTEMPT-1-FI2-STATEMENT-TIMEOUT fault=FI-2 dependency timeout (pool statement_timeout=15000ms, SQLSTATE 57014 class) exit=0 ts=2026-10-03T11:57:21.610Z blocked_pid_found=true durationMs=15021 http=500 body={"error":"internal_error"} sql_rows=0 get=404/not_found ledger_net=0 server_alive=true graph_run_rows=0
EVIDENCE ATTEMPT-1-FI2-STATEMENT-TIMEOUT {"blocked_pid_found":true,"durationMs":15021,"f1":{"kind":"http","status":500,"body":{"error":"internal_error"}},"f2_sql_rows":0,"f2_get":{"status":404,"body":{"error":"not_found"}},"ledger_before":{"bucket":[{"id":"5436bcc4-3588-4c49-a670-4cf4ace020b3","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-07-30 11:57:02.840598+00"}],"consumption":[],"orders":[]},"ledger_after":{"bucket":[{"id":"5436bcc4-3588-4c49-a670-4cf4ace020b3","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-07-30 11:57:02.840598+00"}],"consumption":[],"orders":[]}}
FAIL  FI1-F1-HTTP-EXPLAINABLE
PASS  FI1-F2A-SQL-NO-HALF-WRITE
FAIL  FI1-F2B-GET-NO-FAILED-PRODUCT
PASS  FI1-F3-LEDGER-NET-0
PASS  FI1-NO-FAKE-GRAPH-RUN
ATTEMPT 3 id=ATTEMPT-2-FI1-CONNECTION-BREAK fault=FI-1 connection break (pg_terminate_backend on INSERT backend) exit=1 ts=2026-10-03T11:57:21.931Z blocked_pid_found=true terminated=true http=transport_closed:UND_ERR_SOCKET child=exit_code=1 signal=null sql_rows=0 get=unreachable:ECONNREFUSED ledger_net=0 graph_run_rows=0
EVIDENCE ATTEMPT-2-FI1-CONNECTION-BREAK {"blocked_pid_found":true,"terminated":true,"f1":{"kind":"transport_closed","code":"UND_ERR_SOCKET"},"child_exit":"exit_code=1 signal=null","child_stderr_tail":"ed 'error' event\n      ^\n\nError: Connection terminated unexpectedly\n    at Connection.<anonymous> (/Users/miaole/Desktop/golucky/meetwise-line-c2/node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/client.js:199:73)\n    at Object.onceWrapper (node:events:633:28)\n    at Connection.emit (node:events:519:28)\n    at Socket.<anonymous> (node:net:346:12)\nEmitted 'error' event on Client instance at:\n    at Client._handleErrorEvent (/Users/miaole/Desktop/golucky/meetwise-line-c2/node_modules/.pnpm/pg@8.22.0/node_modules/pg/lib/client.js:417:10)\n …\n\nNode.js v22.22.3\n","f2_sql_rows":0,"f2_get":{"status":"unreachable","body":{"reason":"ECONNREFUSED"}},"ledger_before":{"bucket":[{"id":"5436bcc4-3588-4c49-a670-4cf4ace020b3","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-07-30 11:57:02.840598+00"}],"consumption":[],"orders":[]},"ledger_after":{"bucket":[{"id":"5436bcc4-3588-4c49-a670-4cf4ace020b3","owner_user_id":"userA","kind":"paid","units_total":"5.00","units_reserved":"0.00","units_consumed":"0.00","source_order_id":null,"expires_at":"2027-07-30 11:57:02.840598+00"}],"consumption":[],"orders":[]}}
PASS  FI3-UNREACHABLE-RECORDED
ATTEMPT 4 id=ATTEMPT-3-FI3-GRAPH-FAIL fault=FI-3 graph fail state machine (AiGraphRun active→failed) exit=1 ts=2026-10-03T11:57:21.933Z UNREACHABLE — no career-path graph wiring: apps/api/src/modules/interview/interview.service.ts:749 generateCareerPath is sync derive (apps/api/src/modules/interview/interview.service.ts:764 deriveCareerPath call, region graph-wire regex=false); packages/ai-graphs/src/index.ts:0 career export lines=0; packages/ai-graphs/src career files=none; ai_graph_run graph_name='career-path' rows=0 (no fabricated run)
EVIDENCE ATTEMPT-3-FI3-GRAPH-FAIL {"generateCareerPath_line":749,"deriveCareerPath_line":764,"regionHasGraphWire":false,"careerInIdx":[],"graphFiles":[],"graphRuns":0,"unreachable":true}
GAP  GAP-UC004-FAIL-A3  FI-3 unreachable: no career-path graph wiring: apps/api/src/modules/interview/interview.service.ts:749 generateCareerPath is sync derive (apps/api/src/modules/interview/interview.service.ts:764 deriveCareerPath call, region graph-wire regex=false); packages/ai-graphs/src/index.ts:0 career export lines=0; packages/ai-graphs/src career files=none; ai_graph_run graph_name='career-path' rows=0 (no fabricated run)

ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=ATTEMPT-0-CONTROL:0 ATTEMPT-1-FI2-STATEMENT-TIMEOUT:0 ATTEMPT-2-FI1-CONNECTION-BREAK:1 ATTEMPT-3-FI3-GRAPH-FAIL:1
GAP  GAP-UC004-FAIL-A3  EXIT=1 honest gap retained: FI-3 unreachable (see ATTEMPT-3 file:line evidence) + FI-1 degrade not HTTP-explainable as observed (recorded as-is, no retry). NHP-004-FAULT-01 stays gap. A3 NOT closed.
NOTE releaseEvidence=false · Not HA · EXIT=1 = 诚实保留 gap（Ban invent fix · Ban 记 flake） · EXIT 值不翻任何 SSOT 行 · A3 关闭须 post-prove dual + 协调方授权
NOTE pnpm uc004:career-path:prove（静态 mark-red EXIT0）≠ 本运行时故障注入证据的替代品
CMD=pnpm uc004:career-path-fault:prove EXIT=1
```

（附录对 ATTEMPT-2 stderr tail 做了一处省略号截断以控文档长度；完整 tail 见 run4 `EVIDENCE` 原始行：崩溃帧为 `pg/lib/client.js:199 Connection terminated unexpectedly` → `Emitted 'error' event on Client instance` → uncaught。）

## Verdict

**prove EXIT=1 · gap 诚实保留**：FI-2 超时类真证据成立；FI-1 连接断暴露进程崩溃（降级契约不成立，修复须另刀授权）；FI-3 不可达（无图接线，file:line 已钉）。`UC-E2E-004` FAULT 列与 `NHP-004-FAULT-01` **stays gap**，A3 **not closed**，coveredCount=8，pins 原值。**STOP — 待 post-prove 双审（mw-rag-route + mw-e2e-ha）· implementer 不自批 · Ban push。**

*Receipt · GAP-UC004-FAIL-A3 · NHP-004-FAULT-01 · fault real evidence · EXIT=1 · gap · STOP*
