# Re-PRE ×2 · **AN-PERF-TEAR · C-PERF-TEARDOWN product rootcause fix** · mw-e2e-ha

**Verdict**: **FAIL**
**时间**: 2026-10-06 20:58 +08:00
**REWRITE_SHA**: `1b74fb1cfa9226e8904e0dc51af02f1882851c79`（supersedes `553cfc5` → `110532e`；docs-only 4 files：harness / slice / 两个 stub）
**Prior FAIL cited**: mw-rag-route Re-PRE FAIL `7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9`（B1/B3/B4/Cond）· PRE-EXEC FAIL `152b665`
**Peer**: mw-rag-route Re-PRE2 PASS `882efbc6037d849c55b9a35dcafe9d9be1836b14`，**仅引用，不代签**。本审独立；两方结论不同（PASS vs FAIL）→ **dual 不成立**。alone ≠ dual。
**审查基**: 临时 worktree `/tmp/e2eha-1b74` @ `1b74fb1`（detached）· 只读 · 无 prove / 无 docker 操作 · 未读 `.env*` · 无 live 模型调用 · 只读核对了 box `/workspace/mw-rv-bf-results/*` 与 `node_modules/.pnpm/pg@8.22.0`、`pg-pool@3.14.0` 源码
**Scope**: PRE / docs gate only · Ban coding · Ban AUTHORIZE · Ban nail · HOLD AN-CIMG-EA · Never Meridian

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · backlog `:35` C-PERF-TEARDOWN CONDITION OPEN · attempt1 @ `b29c191` 不洗 · UC-018 / §1.1 stays partial

## 逐项核对（harness = `ai-docs/delivery/harness/c-perf-teardown-product-rootcause-fix.md` @ `1b74fb1`）

| 项 | 结论 | 依据（独立核对） |
|----|------|------|
| **B1(a)** J-1 / J-2 / J-3 · 他线 emitter `:559` | **已解除** | J-1 证据逐条复核：`PERF-LOAD.env` STARTED `21:57:14-07:00` / ENDED `21:57:35-07:00`（= 2026-09-24 12:57:14–12:57:35 +08:00）· `PROVE_EXIT=1`；`PERF-LOAD-prove.log:10` 容器 `meetwise-e2e-1921513-1790225837128`（ts → 04:57:17.128Z）· `:20` `LOAD run2 … passed=true` · `:21-37` `Unhandled 'error' event` / `Connection terminated unexpectedly` @ `client.js:199` / `:217` / `:417` · `:40` `state_bytes=29 logs_bytes=29`；`run-e2e-isolated.mjs:2021` `'docker_diagnostic_unavailable'`（29 bytes）；`attempts.jsonl` prove 模式末条 `PERF-LOAD 04:38:14.481Z`，`04:50:34.990Z–04:50:35.833Z` 七条均 `reemit-from-log`（`emit.mjs:252` 分支 `:304` `process.exit(0)`，不达 `:505` try / `:559` finally），窗口内无记录；`PERF-LOAD-cids-before.txt` 0 bytes；FULL-E2E ENDED `21:57:01` < attempt1 START，TIP START `21:57:47` > attempt1 END。结论「已记录 emit = OUT · 未记录并发 / L2-self = UNDETERMINABLE」诚实，无 invent root-cause。J-2 判定表 + `J2_EVIDENCE_MISSING` 不计通过 ✓；J-3「只证同签名不证因果」✓ |
| **B1(b)** attempt1 时序 + L2-self | **已解除** | proof `:441-444` 循环无 run 间 teardown；`PERF run${run}:` 行在 `:329`（runPerf 末尾）才打印 → 崩溃在 run3 PERF 期间 ✓；runner `:2251-2253` finally / capped child `:202-203` 均晚于 proof 退出 ✓；L2-self（`--rm` `:2182` + caps `:2175-2176`）判据 ✓；`principal.ts:915-918` 超时值 ✓；`git show b29c191:packages/db/src/principal.ts` 无 `on('connect')` / `on('error')`（grep 0 命中），`f19ecba` 2026-10-05 引入 ✓ |
| **B3** EXIT 矩阵 3/3 | **未解除（阻塞 1、2）** | 结构完整（PC 3/3 EXIT0、A/B/C × MUT/POST 3/3 EXIT1、inject 自身 EXIT0、Ban retry），但 **A-MUT / A-POST 的签名与 A/B-POST 的 EXIT=1 依据在本仓 pg / proof 源码下不能推出**，见阻塞项 |
| **B4** A/B/C 各自钉 @T1 | **未解除（阻塞 1、2）** | 三注入 CMD / 自身 EXIT / J-2 事件期望均已钉 ✓；T1 正则与 proof `:431` / `:329` 输出格式一致 ✓；psql `-U meetwise -d meetwise` 与 runner `:2184/:2186` 一致 ✓。但 §5 :143「门控 … **保证**命中 checked-out client，与 attempt1『on Client instance』一致」与 pg / pg-pool 源码不符（阻塞 1）；T1 未钉到 runPerf 的哪个阶段（阻塞 2） |
| **Cond 1** `pool.on('error')` | **已解除** | `principal.ts:931` `pool.on('error', …)` ✓；`:928-929` connect→client.on('error') ✓；`:886` observePoolError · `:872` 注释 ✓ |
| **Cond 2** R2 DB source | **已解除** | §6 R2 一次性本 run 自有 `pgvector/pgvector:pg16` + 显式 `DATABASE_URL` + 只 rm 该名 + `R2_ENV_FAIL` ≠ 回归 ✓；`pool-error-listener.proof.ts:20` 无 localhost 回退、`:134` `CMD=… EXIT=` 输出 ✓；12/12 口径与 `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md:21` 一致 ✓ |
| **runner +12 重锚** | **已核实** | `9e2abd0^:scripts/run-e2e-isolated.mjs:1714` / `:2170` / `:2239-2241` 与 `1b74fb1` `:1726` / `:2182` / `:2251-2253` 逐字相同；`9e2abd0` 该文件 +14/−2（净 +12）；`principal.ts` / emitter / capped child 在 `eae1e19..1b74fb1` 无改动；emitter `:505` / `:555-560` / `:559` / `:304`、capped child `:18` / `:107` / `:136-137` / `:202` / `:203` 均核实。无 invent 产品 locus |
| B2 / B5 / B6 保留 | 无回退 | P-FIX 仅 `principal.ts`（§2 :54）· emitter `:559` ≠ product close · R1–R3 EXIT0 + Ban 借绿 · 隔离真 PG / Linux-native / serial `docker ps`=0 / Ban emitter |
| 历史段完整性 | ✓ | rag-route stub `## PRE-EXEC @110532e` 起至 `## Re-PRE @553cfc5` 与 `7e97dc3` 逐字一致（diff 空）；core 对两个 stub 只改表头 + 追加 rewrite note，未代填 Verdict |

## 阻塞项（反对项）

### 阻塞 1 · Inject A 的 MUT / POST 签名不确定（B3/B4）——门控 `state<>'idle'` 不能保证命中「checked-out 且无监听」路径

源码（本仓锁定版本）：
- `pg@8.22.0/lib/client.js:421-433` `_handleErrorMessage`：后端 FATAL（`pg_terminate_backend` → 57P01 ErrorResponse）到达时若 client 有 active query，错误交给 `activeQuery.handleError`（`query.js:130-131` 有 callback 即 `return this.callback(err)`，**不** emit 'error'）。
- `pg-pool@3.14.0/index.js:464-480` `pool.query()`：checkout 期间挂 `client.once('error', onError)`，query 回调里 `client.release(err)` → `_release` `:392-397` → `_remove` `:181` `client.end()` → `_ending=true` → 随后 socket 'end' 走 `client.js:205` `if (!this._ending)` 为假 → **不** emit 'error'。
- 只有 `pool.connect()` 手持且处于事务间隙（server 侧 `idle in transaction`）的 client 才走 `client.js:427-428` → `_handleErrorEvent` → `emit('error')`，此时 checkout 已移除 idleListener（`index.js:344`），MUT（删 `principal.ts:929`）下才会 `Unhandled 'error' event`。

T1 之后 proof 正在执行的查询（`runPerf` `:274` `seedAbandonTargets`：`:232` `h.pool.query(INSERT …)` = pool.query 路径 + `:236` `asPrincipal` = `pool.connect` 事务，`principal.ts:945-955`）两类交替。§5 门控与 A 的终止 SQL 都是 `state<>'idle'`，**既包括 `active` 也包括 `idle in transaction`**。因此：
- **A-MUT**：若被终止的是 pool.query 的 active backend → seed 顶层 reject → EXIT 1，但**没有** `Unhandled 'error' event` / `Emitted 'error' event on Client instance`（错误文本为 `terminating connection due to administrator command`）→ 按 §4 签名该 attempt FAIL。3/3 命中不可推出。
- **A-POST**：同一情形下 :929 监听根本收不到 'error'（client 已被 `end()`）→ `"event":"db_pool_error"` = 0 → 违反 §4「`db_pool_error` ≥1」→ 该格 FAIL。
- 另注：attempt1 签名（`client.js:199/:217` 'end' 路径，`Connection terminated unexpectedly`）与 A 的 FATAL 路径（`:428`，57P01 文本）**本就不同**；§5 :153「所证：checked-out client 服务端终止：L1 覆盖」须写明 A 不复现 attempt1 签名，只有 B/C（socket 断开、无 FATAL）可能复现。

peer `882efbc` 把 A-MUT 确定性列为非阻塞条件 1；本审认为它直接让 §4 已钉的 A-MUT **和 A-POST** 两格期望在源码上不成立（peer 未覆盖 A-POST 的 `db_pool_error` 0 情形），属 B3/B4 契约本身错误，**阻塞**。

**修复（docs 内，二选一并写死）**：(i) A 的门控与终止 SQL 收窄为 `state='idle in transaction'`（connect 手持事务），并据此重写 A-MUT / A-POST 签名（错误文本 57P01，而非 `Connection terminated unexpectedly`）；或 (ii) 保留 `state<>'idle'`，但收据必录被终止 backend 的 `state` / `xact_start` / `left(query,60)`，并按 `active` / `idle in transaction` 两类分别钉期望签名与 EXIT（`active`+pool.query → EXIT 1、零 unhandled、`db_pool_error` 可为 0），按类计 3/3。

### 阻塞 2 · A/B-POST「EXIT=1」依据忽略 warmup 不计错，T1 未钉到 runPerf 阶段（B3/B4）

§4 :137 依据为「proof 无重试；`errMax=0.005`（`proof.ts:33`）· N=100 → 1 次错误即 0.01>0.005；seed 被断则顶层 reject」。但 `runPerf`：
- `:274` seed（任何失败 → 顶层 reject → EXIT 1 ✓）
- `:278` `for (const id of warmupIds) await timedAbandon(id);` —— **warmup 结果被丢弃**，`timedAbandon` `:213-223` 自己 catch，不抛；
- `:280-282` 只有 measured `samples` 计入 `errorCount` / `errorRate`。

T1 = `LOAD run2:` 后 ≤1 s，再加门控 ≤10 s，**未钉**落在 seed / warmup / measured 哪一段。若 A 或 B（`docker restart -t 0` 后 PG 恢复、若 `docker port` 未变则 pool 新建连接成功）落在 warmup：只有 warmup 请求 500 → 被丢弃 → run3 PERF / LOAD 可全绿 → **EXIT 0** → `POST_EXIT_UNEXPECTED` → 格 FAIL。C（`rm -f`，PG 永久消失）不受影响。所以 A-POST / B-POST「3/3 EXIT=1」在 T1 现定义下不可推出。

**修复**：把 T1 钉到可判定阶段，并写清每阶段期望；例如门控加 `query LIKE 'INSERT INTO interview%'`（seed 阶段专有）或改用 seed 专有判据，或给出 seed / warmup / measured 三段的期望 EXIT 表并要求收据记录注入时刻所处阶段（由 `pg_stat_activity.query` 前缀判定）。Ban 事后按观测改期望。

### 非阻塞（随下次 rewrite 一并处理）
1. B 注入：官方 postgres 镜像 `STOPSIGNAL SIGINT`（fast shutdown，backend 会先发 57P01 FATAL）—— 本 box 无 docker socket 权限，**未实测**镜像配置；`restart -t 0` 下 FATAL 与 SIGKILL 竞态，B-MUT 可能落入阻塞 1 同类分支，建议同 (ii) 记录。
2. 同意 peer `882efbc` 条件 2（J-2 表补 `EXTERNAL-OTHER` 与 L3-sim 行）、条件 3（`meetwise-e2e-r2pool-*` 落在串行过滤内，须在下次 prove 前删除）。
3. A 的 inject 自身判据「stdout 整数 ≥1」若为 0，§5 未写明后果；须写「= 0 → `INJECT_MISS`，该格 FAIL，计入 3 次」。

## Spot-check 清单（全部只读）
- `git show 1b74fb1 --stat`（4 docs）· `git diff eae1e19 1b74fb1` 中 `principal.ts` / runner / emitter / capped child 零改动
- `principal.ts:872/:886/:915-918/:928-931/:945-955` · `git show b29c191:packages/db/src/principal.ts` grep 0
- `run-e2e-isolated.mjs:1726/:2021/:2175-2176/:2182/:2184-2186/:2251-2253` · `9e2abd0^` 对照 `:1714/:2170/:2239-2241`
- `uc018-receipt-backfill-emit.mjs:206/:226/:248/:252-304/:505/:555-560/:559/:562` · `uc018-perf-load-capped-child.mjs:18/:107/:136-137/:202/:203`
- `uc-e2e-018-perf-load.proof.ts:33/:213-223/:232/:236/:274/:278/:280-284/:329/:431/:441-444/:467-469`
- `pg@8.22.0/lib/client.js:131-145/:199-219/:411-434` · `query.js:122-134` · `pg-pool@3.14.0/index.js:172-188/:344/:384-397/:455-480`
- box `/workspace/mw-rv-bf-results/PERF-LOAD.env` · `PERF-LOAD-prove.log:10/:20/:21-43` · `PERF-LOAD-cids-before.txt` · `FULL-E2E.env` / `TIP.env` · `receipts/uc018-receipt-backfill/attempts.jsonl`
- `pool-error-listener.proof.ts:20/:27/:134` · receipt `2026-10-05-gap-principal-pool-error-listener-fix-prove.md:21`
- rag-route stub 历史段 vs `7e97dc3` diff 空

## 结论

B1(a) / B1(b) / Cond 1 / Cond 2 / +12 重锚 **已解除且核实**；B2 / B5 / B6 无回退。**B3 / B4 未解除**：Inject A 的 MUT / POST 签名在 pg@8.22.0 + pg-pool@3.14.0 下随被终止 backend 的类别而变（阻塞 1）；A/B-POST EXIT=1 忽略 warmup 不计错，T1 未钉阶段（阻塞 2）。均为 docs 内可修的契约问题；本审**不**要求 prove。

Ban coding（直到 BOTH PASS + 协调方 AUTHORIZE）· 本审不 AUTHORIZE · Ban nail · Ban self-approve · Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · CONDITION（backlog `:35`）stays OPEN · peer `882efbc` PASS 已引用、未代签 · alone ≠ dual（一方 PASS + 一方 FAIL ≠ dual PASS）· releaseEvidence=false · NOT_HA · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · Never Meridian。

Verdict: FAIL
