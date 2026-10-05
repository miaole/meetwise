# REQUEST — **C-PERF-TEARDOWN 根因刀 · PERF-LOAD teardown 根因判定 + 复跑验证/关闭证据** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-perf-teardown-rootcause-fix.md` · slice `gap-perf-teardown-rootcause-fix.slice.md`
**Parent tip**: `377e7fc`（series open · not a prove tip）
**Date**: 2026-10-05

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| PERF/LOAD | **local partial**（stays） · capacityRepresentative=false |
| `canHonestlyFlip` | **false** |

## 请审什么（mw-e2e-ha 视角）

本刀为 PERF-LOAD@`b29c191` attempt1 的 mid-prove unhandled crash 求根因判定授权与复跑验证契约。请审：

1. **根因判定的可复核性（本刀核心）**：REQUEST 断言「崩溃进程 = docker 容器内 `apps/api/test/uc-e2e-018-perf-load.proof.ts`，其全部 pg 面走 `createPool()`」——请逐条核 file:line：wrapper 零 pg 依赖（`scripts/uc018-perf-load-capped-child.mjs:1-204`，docker 参数 `:121-127`/`:136-157`，exit `:202-204`）；proof 唯一 pg 面 `h.pool`（`uc-e2e-018-perf-load.proof.ts:152/:232-244` 等）← `_neg-harness.ts:43/:56-58` ← `db.service.ts:7` `createPool()`；`apps/api/src` 无独立 `new Pool`/`new Client`；abandon 路径同池 SQL（`interview.service.ts:494-513` · `commerce.ts:243-251`）；P 修复 `f19ecba`（= P 线 `56fc1ea`）在 `377e7fc` 祖先链、工厂观测 `principal.ts:869/:886/:928-931`。**请独立验证判定，Ban 采信实现方读码而不复核**。
2. **时间线一致性**：attempt1/2 @`b29c191`（2026-09-23）早于 P 修复（2026-10-05）→ 该 SHA 上工厂零监听 ⇒ attempt1 崩溃形态（`pg/lib/client.js` Client 发射 · `Connection terminated unexpectedly` · mid-prove run2 后）与 P 线 v1 崩溃帧同形（P receipt §Appendix B）——判定若成立，attempt1 = **已被后续修复覆盖的历史缺陷证据**，但**关闭只能由本刀自己的复跑证据产生**，Ban 用 P 线成果直接宣称关闭（互借禁令 M 线已钉）。
3. **EXIT/关闭证据契约**：复跑 `pnpm uc018:perf-load:prove` @ committed SHA（frozen-lockfile · fresh 隔离 PG）≥3 attempts，one-shot、全记录；关闭判据 = 全 attempts (a) 零 `Unhandled 'error' event`/mid-prove 崩溃 (b) 每次至 run3+`SUMMARY` 完整到达 (c) 若真实连接断：`db_pool_error` 结构化日志可见 + 受影响 run 诚实 FAIL/PASS（errorRate/missReasons 口径）。任一 attempt 仍现 attempt1 式 unhandled crash → **EXIT1 诚实保留 + 根因重新钉（转 Branch B）**；EXIT1 **不记 flake**、Ban retry-to-green、Ban 弃 attempt。
4. **阈值正交性**：run 级阈值判定（p50/p95/p99/err/caps）与 teardown 条件正交——阈值 miss → EXIT=1 诚实保留，既不是本刀失败条件、也 **Ban** 洗成条件关闭证据；反之本刀关闭证据 **Ban** 外推为阈值面转绿。
5. **attempt1 不洗**：attempt1 是 P 修复落地前的真实缺陷证据，账目保全；attempt2=0 不洗 attempt1（`README.md:39-41`「Do not claim the second exit washes the first」原钉）。**Ban 把 attempt1 记成 flake/环境噪声**。
6. **残余披露充分性**：`run-e2e-isolated.mjs:1889-1890` HOST_SQL_PROBE 独立 Client（未走 createPool）+ P 线 residual P-1/P-3 是否已如实随链披露、其「非 attempt1 签名」论证是否成立（boot 期 · 短命 · 独立子进程 · exit 被 capture 捕获重试）。
7. **fail-closed 铁律**：Branch B（若触发）基建观测须只防 uncaught crash、错误必被观测、Ban 吞错/伪装成功/静默重试、**Ban 全局 `uncaughtException`/`unhandledRejection` 兜底**；观测 = 故障观测非健康证明，Ban 发明「连接可靠/自愈」叙事。
8. **行冻结**：backlog `:35` stays CONDITION OPEN（canHonestlyFlip=false）；PERF/LOAD stays local partial；coveredCount=8；Ban 翻任何 SSOT 行；EXIT/复跑结果不自动翻任何行——关闭须 post-prove dual PASS + 协调方授权。

Row `C-PERF-TEARDOWN` stays CONDITION OPEN. **Ban covered** · **Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed）· **Ban 互借关闭 C-IMAGE-DIGEST** · **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件**。**Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail（≠ 条件关闭）。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — `mw-e2e-ha`（adversarial · evidence-honesty）

**Status**: **PASS**（pre-exec dual · docs gate only · 本 PASS 不构成 coding/prove 授权、不构成条件关闭；`alone ≠ dual`——本段仅 mw-e2e-ha 单签，peer `mw-rag-route` stub 仍 PENDING 未签，不代签）
**Date**: 2026-10-05 21:39 +0800 · **Reviewer worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-s-e2e-ha`（branch `rv/s-e2e-ha` @ `feat/mysql-schema-skeleton` tip `1c57bb3`）· **被审 REQUEST**: `3ca9628`（parent `377e7fc` 已验：`git log -1 --format=%P 3ca9628` = `377e7fc…`）
**环境事实（如实记录）**：审查全程以**本地分支**为准（依 dispatch 指令「github 网络不通、origin 陈旧」）；但审查时点实测 `git ls-remote origin refs/heads/feat/mysql-schema-skeleton` **EXIT=0** 且返回 `377e7fc4f…`——origin ref 恰与 REQUEST 申报的 base tip **逐字一致**（本地 tip 链领先 origin 3 个未推 docs 提交）。此实测**支持**而非削弱 base 钉死；不据此翻任何判定。

### 1. 独立复核检查表（全部本机命令 EXIT=0 / grep 实测，非采信实现方读码）

| # | 断言 | 复核命令/锚点 | 结果 |
|---|------|--------------|------|
| 1 | `3ca9628` ∈ tip 链 + docs-only 4 新增 md | `git merge-base --is-ancestor 3ca9628 HEAD` EXIT=0；`git show --name-status 3ca9628` = 4×`A`（.md only）· **零 backlog/SSOT/产品文件触碰** | ✅ |
| 2 | capped-child 零 pg 依赖 | 读 `scripts/uc018-perf-load-capped-child.mjs:1-204` 全文：仅 import `node:child_process/fs/path`；docker run/create 参数 `:121-127`/`:136-157`（命令面 = `node --import @swc-node/register/esm-register test/uc-e2e-018-perf-load.proof.ts`）· `docker start -a` `:202` · `process.exit(start.status ?? 1)` `:204` | ✅ |
| 3 | proof 唯一 pg 面 = `h.pool` | `grep h\.pool apps/api/test/uc-e2e-018-perf-load.proof.ts` = `:152/:181/:193/:232/:236/:239/:355/:368/:375`（全 `h.pool.query`/`asPrincipal(h.pool,…)`）；全文件零 `from 'pg'`/`new Pool`/`new Client`（`mapPool` `:92` 为并发助手非 pg）；`execSync` 仅 `git rev-parse`（`:41`） | ✅ |
| 4 | harness 链 | `apps/api/test/_neg-harness.ts:23` `pool: any` ← `:43 boot()` → `:56 createApp()` → `:57 app.get(DbService)` → `:58 assertIsolatedTestTarget(db.pool)`；harness 全文件零直连 pg | ✅ |
| 5 | `db.pool` = `createPool()` | `apps/api/src/platform/db.service.ts:7` `readonly pool: DbPool = createPool();` | ✅ |
| 6 | `apps/api` 零独立 Pool/Client | `grep -rn "new Pool\|new Client" apps/api/` EXIT=1；`grep -rn "from 'pg'" apps/api/` EXIT=1（test 与 src 均净） | ✅ |
| 7 | packages/db 无模块级池 | `packages/db/src` 仅 `principal.ts` `createPool()` 工厂持 `new Pool`；全包无顶层池实例化（grep EXIT=1） | ✅ |
| 8 | abandon 同池直连 SQL | `apps/api/src/modules/interview/interview.service.ts:494-513` `this.db.asPrincipal` → `abandonInterviewAndRelease(c,…)`（`packages/db/src/commerce.ts:265`，CAS `:243-251`） | ✅ |
| 9 | PostgresSaver 不在 proof 进程 | `apps/api/src` grep saver/ai-graphs 零命中；proof `:10` 仅头注提及；saver 实例化仅在 `apps/worker/src/main.ts:117` 且包 `PrincipalBoundCheckpointPool(pool)`（pool=`createPool()`，`checkpoint-principal.ts:127-131` `underlyingPool` getter） | ✅ |
| 10 | P 修复在祖先链 + 同 patch | `git merge-base --is-ancestor f19ecba 377e7fc` EXIT=0（`f19ecba..377e7fc` 间 10 commit）；`git diff --quiet 56fc1ea f19ecba -- packages/db/src/principal.ts` EXIT=0（逐字节相同） | ✅ |
| 11 | 工厂观测在树 | `packages/db/src/principal.ts:869` WeakSet · `:886 observePoolError`（结构化 `db_pool_error` 五键）· `:928-931` `pool.on('connect')` per-client + `pool.on('error')` | ✅ |
| 12 | 时间线根因（attempt1 何以崩） | `git log -1 b29c191` = 2026-09-23，且 `b29c191` ∈ `f19ecba` 祖先；`git show b29c191:packages/db/src/principal.ts`：`createPool` 在 `:837`、grep `pool.on('error')/('connect')/observePoolError` **零命中**（EXIT=1）——attempt1 时点工厂零监听，与 P 线 harness `gap-principal-pool-error-listener-fix.md:14` 原钉一致 | ✅ |
| 13 | pg 发射语义 | 本仓锁定 pg@8.22.0（`pnpm-workspace.yaml:8`）+ pg-pool@3.14.0（node_modules 实测 version）；`pg/lib/client.js:413-421 _handleErrorEvent`：`_errorAllQueries(err)` 后恒 `this.emit('error', err)`；`pg-pool/index.js:51-62 makeIdleListener` → `pool.emit('error', err, client)`；`_acquireClient` `:335/:344` checkout 移除 idleListener（池级监听不覆盖 checked-out） | ✅ |
| 14 | attempt1 帧 ≈ P 线 v1 帧同形 | attempt1（correction `0d42e2c` §2 `:371-380`）：`throw er; // Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js` Client 发射；P receipt `2026-10-05-gap-principal-pool-error-listener-fix-prove.md:145` v1 失败帧逐字同源（同 error 消息 · 同 Client 发射 · 同 `_handleErrorEvent`）——「同形」论断成立 | ✅ |
| 15 | 崩溃在 prove 内部非 teardown wash | 退出链 `package.json:126-127` 三层实测；runner 尾 `process.exitCode = targetExitCode`（`run-e2e-isolated.mjs:2124`）→ capped-child exit 即 proof 容器 exit；correction §2 实录 run1+run2 `passed=true` 后无 run3/SUMMARY（proof `REPEAT_RUNS=3` `:32` · `SUMMARY` 行 `:467`） | ✅ |
| 16 | 残余披露：HOST_SQL_PROBE | `run-e2e-isolated.mjs:1889-1890` 为该文件**唯一** pg 面（grep `new Client\|from 'pg'` 仅此 2 行）；仅 boot 期（`:1932 waitForPostgres` · `:2090/:2101` post-migrate/pre-prove re-probe）· 短命 try/finally `:1891` · 经 `capture()`（`:1774`）streak 重试（`:1929-1941`），故障形态 = 探针重试/`isolated_postgres_database_not_ready`（被捕获的 Error），**非** attempt1「mid-prove proof 进程 unhandled crash」签名——「非同签名」论证成立 | ✅ |
| 17 | P 线 residual P-1/P-3 如实随链 | backlog `:359` 原文含 P-1（purpose 记 `'default'`）/P-3（非 Error 绕过 WeakSet）——已披露，不影响覆盖判定 | ✅ |
| 18 | 台账锚点 | backlog `:35` C-PERF-TEARDOWN disclosed OPEN · RE-REVIEW `07823b5` 存在（§5 引文与 harness 一致）· 「Do not claim the second exit washes the first」实测在 `ai-docs/delivery/receipts/uc018-receipt-backfill/README.md:39-41`（harness 简写 `README.md:39-41`，referent 经 backlog `:35` 可恢复） | ✅ |
| 19 | 关闭权不预 claim | harness §行语义/§prove 方案：翻 CLOSED 须复跑证据 + **post-prove dual PASS** + **协调方授权**；canHonestlyFlip=false；REQUEST/slice/harness 全文无「已关闭」表述，读码判定明确标注「须复跑实证」 | ✅ |

### 2. 判定复核结论（根因判定独立走查）

**「P 修复已覆盖 attempt1 崩溃路径」= 成立（Branch A 授权转入复跑验证）**。走查路径：崩溃进程 = capped-child 经 `docker start -a` 附着运行的 proof 容器进程（capped-child 本体零 pg，崩溃帧出现于 proof 自身 run1/run2 输出之后）→ proof 进程 pg 面穷举仅 `h.pool`（含 `asPrincipal(h.pool,…)`，abandon/CAS 同池）→ `db.service.ts:7` 单点 `createPool()` → `apps/api` 全域 + `packages/db` 顶层均无第二池/独立 Client → P 修复（`:928-931` 池级+per-client 双路观测）在 base tip 树内对**同一条发射路径**（checked-out client `_handleErrorEvent` 恒发射 + idle 重发，pg@8.22.0/pg-pool@3.14.0 本机源码实测）挂上监听 → unhandled ⇒ uncaught 的机制被结构性消除。attempt1 时点（`b29c191`，2026-09-23）工厂零监听已实测（`git show` grep 零命中），时间线解释自洽。**未发现任何未被 createPool 覆盖且能进入 proof 进程的独立 Client 路径**（HOST_SQL_PROBE 在宿主 runner 进程、boot 期、被捕获重试，非 attempt1 签名）——判定错误（FAIL 依据）不成立。

### 3. Fail-trigger audit（执行层任一命中即 FAIL）

(a) attempts < 3 / 弃单 / retry-to-green / attempt1 洗成 flake； (b) 任一 attempt 复现 attempt1 式 unhandled crash 而未 EXIT1 诚实保留 + 转 Branch B 重新钉根因； (c) 把真实连接断伪装成功/吞错/静默重试/加全局 `uncaughtException`·`unhandledRejection` 兜底； (d) 阈值 miss 洗成条件关闭证据，或本刀关闭证据外推为阈值面转绿； (e) 碰 `packages/db/src/principal.ts` 或任何产品文件/UC-018·052·025·004·014·026 行； (f) 互借关闭 C-IMAGE-DIGEST 或互借 P 线成果宣称本条件 CLOSED； (g) 未做 post-prove dual / 绕过协调方授权擅翻 backlog `:35`； (h) prove 非 committed SHA / 非 frozen-lockfile / 非 fresh 隔离 PG； (i) 把「有监听/复跑绿」叙述成「连接可靠/自愈/HA」（haStatus=NOT_HA 不变）。

### 4. Blockers

**无**（docs gate 层面零 blocker）。

### 5. Conditions（执行层须携带 · 非阻断）

- **C-1（复跑契约刚性）**：≥3 attempts one-shot 全记录（EXIT+时间戳+machine receipt）、frozen-lockfile、fresh 隔离 PG（per-run 随机容器+动态端口+attestation 不变）、committed SHA 钉死；Branch A 零码改时钉 `377e7fc` 或其后代码 commit。
- **C-2（关闭判据三分）**：全 attempts (a) 零 `Unhandled 'error' event`/mid-prove 崩溃 (b) 至 run3+`SUMMARY` 完整到达 (c) 若真实断连：`{"event":"db_pool_error",…}` 可见且受影响 run 按 errorRate/missReasons 诚实 FAIL/PASS 两可入账。
- **C-3（残留面携带）**：HOST_SQL_PROBE（`run-e2e-isolated.mjs:1889-1890`）+ P-1/P-3 如实随 receipt 披露；若执行中被双审认定须覆盖，归 Branch B 且 Ban 全局兜底。
- **C-4（行冻结）**：backlog `:35` stays CONDITION OPEN 至复跑证据 + post-prove dual PASS + 协调方授权三件齐；PERF/LOAD stays local partial · `capacityRepresentative=false` · coveredCount=8 · PERF EXIT=0 不翻 §1.1/不构成 covered。
- **C-5（记录瑕疵随 receipt 更正）**：harness「11 提交前」实测为 10（`f19ecba..377e7fc` rev-list=10）；P 线 receipt 源码钉 `pg-pool/index.js:349` 在本仓锁定副本实为 `_acquireClient:335/removeListener:344`（`makeIdleListener:51-62`）——语义不受影响，执行 receipt 引用时按实测行号更正。

### 6. 三行中文摘要

1. 根因判定独立复核成立：崩溃进程=proof 容器内 proof 进程，pg 面穷举唯一 `h.pool`←`db.service.ts:7 createPool()`，attempt1 时点（`b29c191`）工厂零监听实测确认，P 修复 `f19ecba`（≡`56fc1ea`）在祖先链且 `:928-931` 双路观测同路径覆盖——**Branch A（复跑验证 + 关闭证据刀）授权成立**。
2. REQUEST 未预 claim 关闭（翻 CLOSED 须复跑证据+post-prove dual+协调方授权），attempt1 不洗、Ban retry-to-green、PERF stays local partial、Ban 碰产品 principal.ts、Ban 互借 C-IMAGE-DIGEST 边界全部钉牢；残余（HOST_SQL_PROBE、P-1/P-3）披露如实。
3. PASS（pre-exec dual · docs gate only；alone≠dual：仅 mw-e2e-ha 单签，mw-rag-route stub 仍 PENDING；本 PASS ≠ coding ≠ prove 授权 ≠ 条件关闭）。

Verdict: PASS
