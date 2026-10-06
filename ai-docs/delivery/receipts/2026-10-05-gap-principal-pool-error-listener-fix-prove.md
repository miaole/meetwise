# Receipt — **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复 + 回归 prove**

**Date**: 2026-10-05
**Knife**: Line P 产品修复刀（harness `harness/gap-principal-pool-error-listener-fix.md` · slice `gap-principal-pool-error-listener-fix.slice.md` · REQUEST stubs `reviews/REQUEST-2026-10-05-gap-principal-pool-error-listener-fix-mw-{privacy-int,e2e-ha}.md`）
**授权链**: REQUEST docs `587b128` → pre-exec dual PASS：mw-privacy-int `83bb162`（Candidate B 倾向 · C-1~C-6）+ mw-e2e-ha `9d97de2`（候选 C 拒绝 · C-1~C-8）→ 协调方 standing authorize（§3⑤）coding+prove
**执行 worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-p` · branch `line/p-pool-error-listener`（REQUEST docs commit `65d3a24`，父 `a778255`）
**Prove CMD**: `pnpm uc004:career-path-fault:prove`（三层隔离壳不变：root → `scripts/run-e2e-isolated.mjs uc004:career-path-fault:prove:raw` → apps/api `prove:uc004-career-path-fault`；容器 `meetwise-e2e-91467-1791200838988` @ `127.0.0.1:54520` · migrations applied=**135** · `ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified`）
**实际 EXIT**: prove 全量 **EXIT=1**（诚实保留：FI-3 结构性不可达，C'' 原契约不洗绿）· **attempt 级 `ATTEMPT-2-FI1-CONNECTION-BREAK` 1 → 0（本刀修复目标达成）**
**Machine receipts（.tmp，gitignored）**: `.tmp/isolated-proof-receipts/2026-10-05T11-47-50-276Z-91467-43d65742-2294-4c08-9458-05af4ad296e0.json`（release_evidence=false）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503（原值，零变动）

---

## 1. 运行账目（全披露 · 含失败 attempt）

| # | 项 | 结果 | 说明 |
|---|----|------|------|
| 1 | db proof（修复 v1：仅池级监听） | **EXIT=1 · 进程崩溃** | `packages/db/test/pool-error-listener.proof.ts` 首次运行：idle-client 断开被池级监听观测（12 断言中前 10 项 PASS），**活跃（checked-out）client 断开即崩**——`Unhandled 'error' event on Client instance` @ pg@8.22.0 `client.js:199/417`，与 C'' FI-1 stderr 同形。**执行期实证发现：池级 `'error'` 监听不覆盖 checked-out 路径 = C'' 崩溃的真实路径**。 |
| 2 | 源码钉路径（读 pg-pool@3.14.0 / pg@8.22.0） | — | `pg-pool/index.js:349` `_acquireClient` → `client.removeListener('error', idleListener)`（checkout 时移除池挂的监听）；`pg/lib/client.js:415-421` `_handleErrorEvent` 对 checked-out client `_errorAllQueries(err)` 后仍 `this.emit('error', err)` → 无监听 → uncaught。`pool.emit('error')` 在 pg-pool 全库**仅 1 处**（`makeIdleListener` :62，idle 重发）。 |
| 3 | 修复 v2（工厂内补 per-client 观测） | — | `pool.on('connect')` 给每个新 client 挂常驻 `'error'` 观测（'connect' 每 client 恰好触发一次，零监听累积）；两路观测按 **error 对象身份去重**（WeakSet）→ 每起断连**恰好一次**计数/日志；observer 本体 try/catch 护甲（observer 不得成为它要防的崩溃）。仍在 `createPool()` 一处、零调用点改动。 |
| 4 | db proof（修复 v2） | **EXIT=0（11/11 PASS）**（2026-10-06 docs 更正 · AN-PERF-TEAR rewrite ×6：原写「12/12」为误计；`pool-error-listener.proof.ts` 恰 11 个 `A(` 断言，Appendix B 正文 11 行 `PASS`；运行结果本身未改） | 一次性容器 `pgvector/pgvector:pg16` @ `127.0.0.1:53850`（用后即毁，零破坏性 SQL）；全文见 §Appendix B。 |
| 5 | prove 回归（修复后 · 恰好一次 · one-shot） | **EXIT=1**（attempts：CONTROL **0** · FI-2 **0** · **FI-1 0** · FI-3 1 UNREACHABLE） | 无 retry-to-green；未改既有断言语义。全文见 §Appendix A。 |

## 2. 修复实现摘要（Candidate B · `packages/db/src/principal.ts` `createPool()` 工厂内一处）

- **监听**：`pool.on('error', …)`（idle 重发路径守卫）+ `pool.on('connect', client => client.on('error', …))`（checked-out 路径观测，即 C'' 崩溃路径）。两路同一 `observePoolError(purpose, error)`。
- **日志**（error 级 → stderr，被 prove 子进程 stderr 通道捕获）：单行 JSON，**恰 5 键** `{"event":"db_pool_error","purpose":<池用途>,"count":<该用途累计>,"error_name":<错误名>,"error_message":<pg 错误消息文本>}`。
- **计数**：`pool_error_total` = 进程内 `Map<purpose, number>`，只增不复位；导出只读取数器 `readPoolErrorTotal(purpose)`。**维度仅 pool 用途**（`PoolOverrides.purpose`，正则 `^[a-z0-9_-]{1,64}$` 校验，非法标签 `database_pool_purpose_invalid` fail-closed；Ban principal/租户/连接串/SQL 形态维度）。现有调用点未传 purpose → 记 `'default'`（调用点标注超出本刀触碰面，留待运维布线，不影响缺陷修复）。
- **脱敏证明**：5 键中仅 purpose（白名单正则）/ count（整数）/ error_name+error_message（pg 侧错误文本，dual C-3 明示可记）；无 connectionString、无凭据、无 SQL 文本、无 principal/租户值——db proof `POOL-ERROR-LOG-NO-SECRETS` 用环境中的 DATABASE_URL/密码子串对日志行做负样本断言 PASS。
- **fail-closed**：pg 自身先 `_errorAllQueries`（请求路径 reject → 统一 500 `internal_error`）后 `emit('error')`；observer 只读（日志+计数），不重连、不重建池、不重试、不设降级标志（候选 C 两审否决，未做）；无全局 `uncaughtException`/`unhandledRejection` 兜底；`createPool` 连接参数（statement_timeout=15000 等）与 GUC/角色/RLS 语义零改动（diff 仅 PoolOverrides 增 `purpose?` 观测标签 + 工厂内监听）。
- **触碰面自证**：`packages/db/src/principal.ts`（PoolOverrides + 工厂）+ `packages/db/test/pool-error-listener.proof.ts`（新）+ prove 文件（§3 增量）+ 本 receipt。`apps/worker/src/cloud-smoke-runner.ts` 零触碰；其他 outbound 主链零触碰；SSOT 零触碰。tsc 全量 noEmit：本刀文件零新增错误（仓库预存 6+22 处 strict 报错与本刀无关，均存在于 base `a778255`）。

## 3. prove 断言增量（dual C-4/C-5/C-6 授权 · 零放宽）

- **F1 零改动**：实测行为 = `500 {"error":"internal_error"}`（与 FI-2 同形统一信封）→ 既有断言 `kind==='http' && status>=400 && body.error==='internal_error'`（等强三要素）原样通过，**无需也无改写**。
- **新增断言行 `FI1-CHILD-SURVIVES`**（C-5 批准的加严增量）：由 `api.done` 实际观测推导（`Promise.race([api.done, 5s])` 未决 = 存活），计入 FI-1 attempt exit 合取；既有断言零改动。
- **新增证据字段（非断言、不影响 EXIT）**：`pool_error_log_seen` / `pool_error_log_line`（C-6「错误被观测」stderr 通道）；`detail` 增 `pool_error_observed=`。
- 证明文件头注已钉授权锚（dual `83bb162`+`9d97de2`）与「transport_closed/2xx 计通过=FAIL」不变。

## 4. FI-1 前后对照（C'' run4 @ `e09978d`/nail `a27e384` → 本次 run @ 修复树）

| 观察项 | C''（修复前） | 本次（修复后） |
|--------|--------------|----------------|
| F1 HTTP | **无响应** `transport_closed: UND_ERR_SOCKET` | **500** `{"error":"internal_error"}`（PASS，断言原文不变） |
| API 子进程 | **exit_code=1**（崩溃，stderr `Emitted 'error' event on Client instance`） | **still_running**（`FI1-CHILD-SURVIVES` PASS） |
| 错误被观测 | 崩溃帧即唯一记录 | **结构化日志行**（§5 原文）+ `pool_error_total` 计数 1 |
| F2 SQL rows | 0 | 0（PASS） |
| F2 GET | 不可执行（进程死，ECONNREFUSED） | **404** `{"error":"not_found"}`（PASS） |
| F3 账本 | 净变 0 | 净变 0（before/after 全行快照逐行相等，PASS） |
| graph_run_rows | 0 | 0（PASS） |
| attempt EXIT | **1** | **0** |

FI-2 / CONTROL 与 C'' 逐项同形（CONTROL 200/row=1/net-0；FI-2 durationMs=15012≈15s 超时、500、rows=0、404、net-0、alive）→ 无回归。FI-3 结构性不可达不变（`interview.service.ts:768/:783` 同步 derive，行号相对 C'' 749/764 的偏移来自 base 树其他落刀，本刀未触碰该文件）。

## 5. 错误被观测的证据（C-6 · 原文引用）

API 子进程 stderr（prove EVIDENCE `pool_error_log_line` / `child_stderr_tail` 原文）：

```
{"event":"db_pool_error","purpose":"default","count":1,"error_name":"Error","error_message":"Connection terminated unexpectedly"}
```

db proof 计数侧（进程内 `pool_error_total`）：`counter=pool-error-proof:2 default:0`（2 起注入断连 → 恰好 2 次记录，1 断连=1 记录，去重生效）。

## 6. 条件逐条自评

| 条件 | 自评 | 依据 |
|------|------|------|
| 1. 候选 B（日志+计数，禁候选 C） | **PASS** | §2；C 零实现；计数维度仅 purpose |
| 2. fail-closed（不崩 ∧ 被观测；Ban 吞错/全局兜底/改参数与 GUC） | **PASS** | §2/§5；db proof 双通道断言；diff 面自证 |
| 3. 触碰面（仅 principal.ts createPool + 新测试；Ban 碰 cloud-smoke-runner） | **PASS** | commit 文件清单；`cloud-smoke-runner.ts` 零 diff。**披露**：执行期实证发现池级监听不覆盖 checked-out 崩溃路径（账目 #1-#2），修复延伸为工厂内 `pool.on('connect')` per-client 观测——仍属 `createPool()` 一处、零调用点改动，交 post-prove 双审裁 |
| 4. prove（等强断言 · CHILD-SURVIVES 批准 · FI-1 1→0 · FI-3 不变 · 全台账 · Ban 迁就） | **PASS** | §3/§4；F1 断言零改动即过；attempt 1→0；全量 EXIT=1 如实；恰好一次运行 |
| 5. 行冻结 | **PASS** | backlog `:355`/A3/UC-018/052/025/C-PERF-TEARDOWN/SSOT 零触碰（本提交零 SSOT diff） |
| 6. Pins 原值 | **PASS** | 8 项原值，见头部 |

**遗留披露**：① db proof 首跑崩溃（修复 v1 不足）如实入账（§1#1），其发现驱动修复 v2——非 retry-to-green（v1→v2 是修复演进，各自一次性运行）；② prove 全量 EXIT=1 源于 FI-3 结构性不可达，A3/NHP-004-FAULT-01/backlog `:355` 均不翻行（nail 阶段才动）；③ 现有池 purpose=`default`（调用点标注超触碰面）。

## Verdict

**修复达成 + 回归 prove 实证**：同注入下 API 进程不崩（`FI1-CHILD-SURVIVES`）、HTTP 层可观测降级（500 `internal_error` 信封）、错误被观测（结构化日志+计数，恰好一次）、F2/F3 净变 0 无半写。attempt 级 FI-1 **1→0**；全量 **EXIT=1**（FI-3 结构性不可达，C'' 原契约，诚实保留）。`UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` / A3 **stays gap**；backlog `:355` **stays OPEN**；coveredCount=8；Pins 原值。**STOP — 待 post-prove 双审（mw-privacy-int + mw-e2e-ha）· implementer 不自批 · Ban push · 行翻转须协调方 nail 授权。**

## Appendix A — prove 完整 stdout（逐字 · run @ 修复树 · EXIT=1）

```
UC-E2E-004 career-path FAULT real evidence prove · releaseEvidence=false · Not HA
NOTE: EXIT0 ≠ A3 closed（还须 post-prove dual + 协调方授权）· EXIT1 = 诚实保留 gap · Ban invent fix
NOTE: 与静态 mark-red prove（uc004:career-path:prove EXIT0）互不替代 · attempts one-shot · Ban retry-to-green
ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified
API_CHILD_READY base=http://127.0.0.1:54556
PASS  CONTROL-0-POST-200
PASS  CONTROL-0-SQL-ROW-1
PASS  CONTROL-0-GET-200
PASS  CONTROL-0-LEDGER-NET-0
ATTEMPT 1 id=ATTEMPT-0-CONTROL fault=none(positive control) exit=0 ts=2026-10-05T11:47:29.559Z post=200 sql_rows=1 get=200 ledger_net=0
PASS  FI2-F1-HTTP-EXPLAINABLE
PASS  FI2-F2A-SQL-NO-HALF-WRITE
PASS  FI2-F2B-GET-NO-FAILED-PRODUCT
PASS  FI2-F3-LEDGER-NET-0
PASS  FI2-SERVER-ALIVE-AFTER
ATTEMPT 2 id=ATTEMPT-1-FI2-STATEMENT-TIMEOUT fault=FI-2 dependency timeout (pool statement_timeout=15000ms, SQLSTATE 57014 class) exit=0 ts=2026-10-05T11:47:44.598Z blocked_pid_found=true durationMs=15012 http=500 body={"error":"internal_error"} sql_rows=0 get=404/not_found ledger_net=0 server_alive=true graph_run_rows=0
PASS  FI1-F1-HTTP-EXPLAINABLE
PASS  FI1-F2A-SQL-NO-HALF-WRITE
PASS  FI1-F2B-GET-NO-FAILED-PRODUCT
PASS  FI1-F3-LEDGER-NET-0
PASS  FI1-NO-FAKE-GRAPH-RUN
PASS  FI1-CHILD-SURVIVES
ATTEMPT 3 id=ATTEMPT-2-FI1-CONNECTION-BREAK fault=FI-1 connection break (pg_terminate_backend on INSERT backend) exit=0 ts=2026-10-05T11:47:49.901Z blocked_pid_found=true terminated=true http=500 child=still_running pool_error_observed=true sql_rows=0 get=404/not_found ledger_net=0 graph_run_rows=0
PASS  FI3-UNREACHABLE-RECORDED
ATTEMPT 4 id=ATTEMPT-3-FI3-GRAPH-FAIL fault=FI-3 graph fail state machine (AiGraphRun active→failed) exit=1 ts=2026-10-05T11:47:49.906Z UNREACHABLE — no career-path graph wiring: apps/api/src/modules/interview/interview.service.ts:768 generateCareerPath is sync derive (apps/api/src/modules/interview/interview.service.ts:783 deriveCareerPath call, region graph-wire regex=false); packages/ai-graphs/src/index.ts:0 career export lines=0; packages/ai-graphs/src career files=none; ai_graph_run graph_name='career-path' rows=0 (no fabricated run)
GAP  GAP-UC004-FAIL-A3  FI-3 unreachable: no career-path graph wiring: apps/api/src/modules/interview/interview.service.ts:768 generateCareerPath is sync derive (apps/api/src/modules/interview/interview.service.ts:783 deriveCareerPath call, region graph-wire regex=false); packages/ai-graphs/src/index.ts:0 career export lines=0; packages/ai-graphs/src career files=none; ai_graph_run graph_name='career-path' rows=0 (no fabricated run)

ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=ATTEMPT-0-CONTROL:0 ATTEMPT-1-FI2-STATEMENT-TIMEOUT:0 ATTEMPT-2-FI1-CONNECTION-BREAK:0 ATTEMPT-3-FI3-GRAPH-FAIL:1
GAP  GAP-UC004-FAIL-A3  EXIT=1 honest gap retained: FI-3 unreachable (see ATTEMPT-3 file:line evidence). NHP-004-FAULT-01 stays gap. A3 NOT closed.
NOTE releaseEvidence=false · Not HA · EXIT=1 = 诚实保留 gap（Ban invent fix · Ban 记 flake） · EXIT 值不翻任何 SSOT 行 · A3 关闭须 post-prove dual + 协调方授权
NOTE pnpm uc004:career-path:prove（静态 mark-red EXIT0）≠ 本运行时故障注入证据的替代品
CMD=pnpm uc004:career-path-fault:prove EXIT=1
```

（EVIDENCE 行全量原文见 machine receipt `.tmp/isolated-proof-receipts/2026-10-05T11-47-50-276Z-91467-43d65742-2294-4c08-9458-05af4ad296e0.json` 与 prove 运行日志；ATTEMPT-2 关键 evidence：`{"blocked_pid_found":true,"terminated":true,"f1":{"kind":"http","status":500,"body":{"error":"internal_error"}},"child_exit":"still_running","pool_error_log_seen":true,"pool_error_log_line":"{\"event\":\"db_pool_error\",\"purpose\":\"default\",\"count\":1,\"error_name\":\"Error\",\"error_message\":\"Connection terminated unexpectedly\"}","f2_sql_rows":0,"f2_get":{"status":404,"body":{"error":"not_found"}},"ledger_before":…,"ledger_after":…（bucket/consumption/orders before===after 逐行相等）。）`

## Appendix B — db proof 全文（v2 · EXIT=0 · 11/11 PASS）

> 2026-10-06 docs 更正（AN-PERF-TEAR rewrite ×6 · mw-rag-route POST `4803616` §4 / mw-e2e-ha POST `1d9d3ac` 同认）：本标题原写「12/12」为计数误写；下方原文恰 **11** 行 `PASS`，与 proof 源码 11 个 `A(` 一致。下方日志原文零改动。

```
GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER pool error listener proof · releaseEvidence=false · Not HA
NOTE: 非破坏性注入（客户端侧 socket 断开，同 pool error 发射路径）· 本绿 ≠ 行翻转（nail 前 backlog :355 stays OPEN）
PASS  POOL-PURPOSE-INVALID-REJECTED
{"event":"db_pool_error","purpose":"pool-error-proof","count":1,"error_name":"Error","error_message":"Connection terminated unexpectedly"}
PASS  POOL-ERROR-PROCESS-SURVIVES-IDLE-BREAK
PASS  POOL-ERROR-OBSERVED-COUNTER
PASS  POOL-ERROR-OBSERVED-LOG
PASS  POOL-ERROR-LOG-FIVE-KEYS-ONLY
PASS  POOL-ERROR-LOG-NO-SECRETS
PASS  POOL-ERROR-LOG-PG-MESSAGE-RECORDED
OBSERVED {"event":"db_pool_error","purpose":"pool-error-proof","count":1,"error_name":"Error","error_message":"Connection terminated unexpectedly"}
PASS  POOL-ERROR-COUNTER-DIMENSION-ISOLATED
PASS  POOL-ERROR-POOL-STILL-USABLE
{"event":"db_pool_error","purpose":"pool-error-proof","count":2,"error_name":"Error","error_message":"Connection terminated unexpectedly"}
PASS  POOL-ERROR-ACTIVE-QUERY-STILL-REJECTS
PASS  POOL-ERROR-OBSERVED-COUNTER-ACTIVE-BREAK
ATTEMPTS_LEDGER induced_breaks=2 one_shot=true retry_to_green=false destructive_sql=none counter=pool-error-proof:2 default:0
CMD=pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts EXIT=0
EXIT=0
```

v1 首跑（仅池级监听 · EXIT=1）失败帧（原文）：`Error: Connection terminated unexpectedly at Connection.<anonymous> (…/pg@8.22.0/…/pg/lib/client.js:199:73) … Emitted 'error' event on Client instance at: at Client._handleErrorEvent (…/pg/lib/client.js:417:10) at Connection.<anonymous> (…/pg/lib/client.js:217:16)` —— v1 已过项：`POOL-PURPOSE-INVALID-REJECTED` / `POOL-ERROR-PROCESS-SURVIVES-IDLE-BREAK` / `POOL-ERROR-OBSERVED-COUNTER` / `POOL-ERROR-OBSERVED-LOG` / `POOL-ERROR-LOG-FIVE-KEYS-ONLY` / `POOL-ERROR-LOG-NO-SECRETS` / `POOL-ERROR-LOG-PG-MESSAGE-RECORDED` / `POOL-ERROR-COUNTER-DIMENSION-ISOLATED` / `POOL-ERROR-POOL-STILL-USABLE`（崩溃发生在其后的活跃断连注入）。

*Receipt · GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · fix + regression prove · FI-1 attempt 1→0 · full EXIT=1 honest · OPEN · STOP*
