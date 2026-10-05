# Harness — **C-PERF-TEARDOWN 根因刀**（Line S · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · CONDITION stays OPEN）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`377e7fc`** / full `377e7fc4fa1b35b85ebf524b668469caf66de2bc`
**Knife**: **C-PERF-TEARDOWN 根因刀**（Line S · CONDITION OPEN）——PERF-LOAD prove **内部** pg Client unhandled crash 的根因判定 + 复跑验证契约；不是 P 线借刀、不是 UC-018 翻行刀
**Gap id**: **`C-PERF-TEARDOWN`**（backlog `gap-bug-backlog.md:35` · P1 · **CONDITION OPEN** · 本刀不改名、不翻行）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding

## 现状如实陈述（REQUEST 先读证据 · 证据链全引）

PERF-LOAD@`b29c191` 双审复跑：**attempt1=1 · attempt2=0 → FAIL-UNREPRODUCED-ON-FIRST，条件 C-PERF-TEARDOWN 保留**。attempt1 崩溃发生在 **prove 内部**（mid-prove，非 SUMMARY 后 teardown wash）：

- 退出路径：`uc018:perf-load:prove` → `run-e2e-isolated.mjs` → `uc018-perf-load-capped-child.mjs`（child `docker start -a` proof 容器）→ `process.exit(start.status ?? 1)`（`scripts/uc018-perf-load-capped-child.mjs:202-204`）。Unhandled pg Client error ⇒ Node 非零 ⇒ **prove 自身返回 1**——失败在 prove 退出路径**之内**。
- 崩溃帧（correction dual `0d42e2c` §2 `reviews/REQUEST-2026-09-23-uc-e2e-018-receipt-backfill-mw-e2e-ha.md:369-397`，attempt1 log 锚 `:371-380`）：`throw er; // Unhandled 'error' event` · **`Error: Connection terminated unexpectedly`** @ `pg/lib/client.js`（Client 发射）；出现于 run1+run2 `passed=true` 之后、**run3/SUMMARY 之前**（declared runs=3）。
- `fatal: not a git repository …/mw-rv-bf-b29c191` 在 attempt1、attempt2 绿 log、claimed EXIT=0 log 中均出现 → **非**区分性根因。
- RE-REVIEW `07823b5` §5 `:475-481` 保留 open；backlog `:35` 全链登记。

**与 P 线的关系（M 线钉死）**：本缺陷属 **prove 基建层**（pg Client 层 unhandled error）；P 线修掉的产品池缺陷 `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER`（backlog `:359` **CLOSED-fixed**，fix `56fc1ea`）**同族不同 scope，Ban 互借**。P 线修复（池级 + per-client 观测）落地后，**本条件可能已被部分覆盖**——这是本刀第一个要写清并交双审裁定的判定点（见下节）。

## 根因判定（本刀核心 · 两分支都写清 · file:line 实证）

### 判定点：capped-child 内的连接是否走 `createPool()`（P 修复覆盖）？

**判定：YES——prove 进程内全部 pg 连接同源 `createPool()`，P 修复在结构上覆盖 attempt1 崩溃路径（Branch A 成立）。** 证据链：

1. **崩溃进程即 proof 容器内的 `apps/api/test/uc-e2e-018-perf-load.proof.ts`**：capped-child 的 docker create/start 参数即 `node --import @swc-node/register/esm-register test/uc-e2e-018-perf-load.proof.ts`（`scripts/uc018-perf-load-capped-child.mjs:121-127`（run 形态）/ `:136-157`（create 形态）· `:202` `docker start -a`）。capped-child 自身**零 pg 依赖**（全文件仅 docker/spawn/fs，`scripts/uc018-perf-load-capped-child.mjs:1-204`）——崩溃不可能来自 wrapper，只能来自 proof 进程。
2. **proof 进程唯一 pg 面 = `h.pool`**：proof 全部 SQL 走 `h.pool.query(...)` / `asPrincipal(h.pool, ...)`（`apps/api/test/uc-e2e-018-perf-load.proof.ts:152/:193/:232-244/:355/:368/:375`）；`h.pool` 来自 harness `boot()` → `createApp()` → `app.get(DbService)` → `db.pool`（`apps/api/test/_neg-harness.ts:43/:56-58`）。
3. **`db.pool` = `createPool()`**：`apps/api/src/platform/db.service.ts:7` `readonly pool: DbPool = createPool();`——`apps/api/src` 全目录 grep：除该调用点外**零** `new Pool`/`new Client`（pg 驱动仅在 `@meetwise/db` 内部）。
4. **产品 abandon 路径同池**：`interview.service.ts:494-513` `abandon()` → `this.db.asPrincipal(...)` → `abandonInterviewAndRelease`（同池 client）；`ai_graph_run` 安全终止 = 同池直连 SQL CAS（`packages/db/src/commerce.ts:243-251`），**不经** PostgresSaver 独立连接。PERF/LOAD proof 进程不 boot worker（`createApp()` 仅 API；`apps/api/src/main.ts:90` 注释），PostgresSaver 仅存在于 `apps/worker`——且即便 worker 侧也经 `PrincipalBoundCheckpointPool` 包裹 `createPool()` 的 DbPool（`apps/worker/src/checkpoint-principal.ts:128-131`）。
5. **P 修复已在 base tip 树内**：fix `f19ecba`（与 P 线 `56fc1ea` 同 patch，`56fc1ea..f19ecba` diff 零 principal.ts 差异）位于 `377e7fc` 祖先链（11 提交前）；`createPool()` 工厂内现挂两路观测：`pool.on('connect', client => client.on('error', …))`（checked-out client 路径）+ `pool.on('error', …)`（idle 重发路径），WeakSet 按 error 对象身份去重（`packages/db/src/principal.ts:869/:886/:928-931`）。
6. **时间线解释 attempt1 为何崩**：attempt1/2 均跑在 `b29c191`（2026-09-23 backfill 期），**早于** P 修复落地（2026-10-05）。该 SHA 上 `createPool()` **零** `pool.on('error')` 监听（P 线 harness `harness/gap-principal-pool-error-listener-fix.md:14` 原文钉）——pg@8.22.0 `_handleErrorEvent` 对 client `_errorAllQueries` 后恒 `emit('error')`、pg-pool@3.14.0 `makeIdleListener` 对 idle client 重发 `pool.emit('error')`（P 线 receipt §1#2 源码钉 `pg-pool/index.js:349` / `pg/lib/client.js:415-421`），无监听 ⇒ unhandled ⇒ 崩。attempt1 帧形（`pg/lib/client.js` Client 发射 + `Connection terminated unexpectedly`）与 P 线 v1 崩溃帧（P receipt `receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md` §Appendix B 尾注）**逐字同形**。

**结论一句话**：attempt1 的 mid-prove unhandled crash 路径（池/客户端错误发射无监听 → uncaught）在 base tip `377e7fc` 上**已被 P 修复结构性消除**——但这是**读码判定**，须以 committed SHA 复跑实证；本刀因此从「基建修复刀」转为 **Branch A：复跑验证 + CONDITION 关闭证据刀**。

### 残余未覆盖面（诚实披露 · 非本刀崩溃路径）

- `scripts/run-e2e-isolated.mjs:1889-1890` **HOST_SQL_PROBE** 独立 `new Client`（未走 `createPool()`，P 修复不覆盖）：但该探针 (a) 仅在 boot 阶段 `waitForPostgres` 内运行（migrate 前 readiness 探测），(b) 短命（connect→SELECT 1→end，try/finally），(c) 以独立 `node --eval` 子进程运行、退出码被 `capture` 捕获并按 streak 重试——其故障形态是探针重试/失败，**不是** attempt1 的「mid-prove run2 后 proof 进程 unhandled crash」签名。若双审认定须覆盖，修复归 Branch B（见下），**Ban 全局 uncaughtException 兜底**。
- P 线已登记 residual：**P-1** purpose 观测标签未布线（现记 `'default'`）· **P-3** 非 Error 实例发射绕过 WeakSet 去重（pg 现状恒发 Error，pg 升级须复评）（backlog `:359` 原文）。两者不影响崩溃覆盖判定，如实随链携带。

## Quoted from the files

backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN**：「disclosed, not washed, not closed · attempt1 EXIT 1 (pg Client terminated mid-prove) · attempt2 EXIT 0 · PERF/LOAD stays local partial · … e2e · disclosed OPEN · evidence chain: correction dual `0d42e2c` §2 …:369-397 · RE-REVIEW `07823b5` §5 `:475-481` kept open · capped-child `scripts/uc018-perf-load-capped-child.mjs:202-204`」。

correction dual `0d42e2c` §2：「crash **mid-prove**（after run2 of declared runs=3）… Unhandled pg Client error ⇒ Node non-zero ⇒ **prove itself returns 1**. **Not** post-SUMMARY isolator teardown wash — failure is **inside** prove exit path.」「PERF-LOAD@b29c191: FAIL-UNREPRODUCED-ON-FIRST (attempt1=1, attempt2=0) — condition C-PERF-TEARDOWN」。

RE-REVIEW `07823b5` §5：「C-PERF-TEARDOWN **CONDITION** · `README.md:39-41`（`c295731`）records attempt1 EXIT 1（pg Client terminated inside prove）· attempt2 EXIT 0 · "Do not claim the second exit washes the first". Not re-run.」

P 线 backlog `:359`（CLOSED 行 · 互借禁令原文）：「C-PERF-TEARDOWN 不互借（stays OPEN）」。

## 修复方案（两分支 · 执行阶段按双审裁决 · 本 commit 不写码）

| 分支 | 触发条件 | 内容 |
|------|----------|------|
| **A（主计划 · 判定成立）** | 复跑实证读码判定（proof 进程全部 pg 面走 `createPool()`）| **零产品/基建码改**。本刀改为复跑验证 + 关闭证据刀：committed SHA 复跑 PERF-LOAD 多 attempt，实证 mid-prove unhandled crash 不再出现；若期间真实发生连接断，断言其**被观测**（结构化 `db_pool_error` 日志行）且**诚实判 FAIL**（errorRate/missReasons → EXIT=1），而非进程崩溃。关闭证据齐（attempts 全录 + 双审 PASS + 协调方授权）→ C-PERF-TEARDOWN 由协调方 CLOSED |
| **B（备用 · 判定被证伪或双审另有裁决）** | 复跑仍现 unhandled crash（说明存在未走 `createPool()` 的未覆盖面）| 基建层修复：对 `scripts/uc018-perf-load-capped-child.mjs` / `scripts/run-e2e-isolated.mjs` 相关基建面（含 HOST_SQL_PROBE 独立 Client，`run-e2e-isolated.mjs:1889-1890`）挂**同一 fail-closed 观测模式**（或改路由走 `createPool()`），触碰面仅 prove 基建 + 其测试；**Ban 碰产品 `packages/db/src/principal.ts`**（P 线已关）。若落入本分支，根因重新钉（读码判定被证伪本身入 receipt 披露）|

**fail-closed 铁律（两分支共同约束 · 违反任一 = 执行层 FAIL）**：只防 uncaught crash、错误必被观测、**Ban 吞错、Ban 伪装成功、Ban 静默重试、Ban 加全局 `uncaughtException` / `unhandledRejection` 兜底**。观测语义 = 故障观测非健康证明（Ban 把「有监听/复跑绿」叙述为「连接可靠/自愈/HA」）。

## prove 方案（授权后才执行）

- **CMD**：`pnpm uc018:perf-load:prove`（root `package.json:126-127` 三层：runner → `:raw` → capped-child）@ **committed SHA**（执行 worktree coding commit；Branch A 零码改则钉 base tip `377e7fc` 或其后代码 commit）· `pnpm install --frozen-lockfile` · fresh 隔离 PG（`run-e2e-isolated.mjs` per-run 随机容器 + 动态端口 + attestation 惯例不变）· caps 证据经 capped-child 落 `_caps-evidence.json` 不变。
- **多 attempt 契约**：≥3 attempts（每次 = 一次 fresh 隔离 PG 全新 prove，one-shot）；**attempts 全记录**（EXIT + 时间戳 + machine receipt），Ban 弃单、Ban retry-to-green。
- **关闭证据判据（ Branch A）**：全部 attempts (a) 零 `Unhandled 'error' event`、零 mid-prove 进程崩溃；(b) 每次运行至 run3 + `SUMMARY allPass` 行完整到达（无 attempt1 式 mid-prove 中断）；(c) 若真实发生连接断：`{"event":"db_pool_error",…}` 结构化日志可见 + 受影响 run 按 errorRate/missReasons **诚实 FAIL**（或阈值内诚实 PASS）——两种都入账。
- **EXIT 期望（诚实契约）**：run 级阈值判定（p50/p95/p99/err/caps）与 teardown 条件**正交**——阈值未达 → EXIT=1 诚实保留（不是本刀失败条件，也不得洗成条件关闭证据）；**本刀唯一关闭目标 = unhandled crash 不再复现且错误观测路径成立**。若任一 attempt 仍现 attempt1 式 unhandled crash → **EXIT1 诚实保留 C-PERF-TEARDOWN，根因重新钉**（转 Branch B）。
- **receipt 落点**：`ai-docs/delivery/receipts/`（命名随执行日，拟 `2026-10-XX-gap-perf-teardown-rootcause-fix-prove.md`）+ machine receipts 落 `.tmp/`。
- **Ban retry-to-green**：任一 attempt 的 EXIT 如实入账；**Ban 把 attempt1（`b29c191`）洗成 flake**——attempt1 是 P 修复落地前的真实缺陷证据，账目保全；attempt2=0 不洗 attempt1（`README.md:39-41` 原钉口径不变）。

## 行语义（冻结 · 本刀不翻任何行）

- `C-PERF-TEARDOWN` backlog `:35` **stays CONDITION OPEN**：复跑证据 + post-prove dual PASS + **协调方授权**后方可翻 CLOSED；本 REQUEST 及后续执行提交均不翻行（**canHonestlyFlip=false**）。
- **PERF/LOAD stays local partial**（P 线已钉口径）：local ≠ capacity ≠ HA · `capacityRepresentative=false` · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`；PERF/LOAD prove EXIT=0 **不**构成 UC covered、不翻 §1.1、不动 coveredCount=8。
- `C-IMAGE-DIGEST` stays its own CONDITION（backlog `:35` 同行族 · 修复已落待真实 emit 实证）——**Ban 借本刀关闭**。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**（pre-exec dual PASS 后由协调方授权）；**Ban push**。
- **Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed，零触碰）· Ban 借刀改其他 outbound 主链。
- **Ban 互借关闭 C-IMAGE-DIGEST** · Ban 互借 P 线成果宣称本条件「已关闭」（关闭只能由本刀自己的复跑证据 + dual + 协调方产生）。
- **Ban 把 attempt1 洗成 flake** · Ban retry-to-green · Ban 弃 attempt · Ban 改断言洗绿。
- Ban 吞错/伪装成功/静默重试 · **Ban 全局 uncaughtException 兜底** · Ban 观测面发明健康叙事（haStatus=NOT_HA 不变）。
- Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件 · Ban 翻任何 SSOT 行 · Ban covered · Ban secrets / `.env*` · **Ban self-approve（alone ≠ dual）**。

## Scope / Not

只做 `C-PERF-TEARDOWN`（backlog `:35`）的根因判定 + 复跑验证/基建修复 REQUEST。Not P 线借刀（产品池缺陷已 CLOSED-fixed）。Not UC-018 翻行刀。Not HA / capacity / releaseEvidence 刀。不 widen 到其他 backlog 行。执行触碰面（Branch A）：prove 产物 + receipt + docs；（Branch B）：`scripts/uc018-perf-load-capped-child.mjs` / `scripts/run-e2e-isolated.mjs` 相关基建 + 测试；两分支均 **Ban 碰产品**。

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false** · backlog `:35` stays CONDITION OPEN · STOP

*Harness · C-PERF-TEARDOWN · rootcause + re-run/close-evidence knife · awaiting_pre_exec_dual · OPEN · STOP*
