# REQUEST — **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-privacy-int`（`packages/db/src/principal.ts` 属隐私/授权根域）
**Knife**: `harness/gap-principal-pool-error-listener-fix.md` · slice `gap-principal-pool-error-listener-fix.slice.md`
**Parent tip**: `a778255`（full `a778255c8a600304001207a514621323e77da3d2` · origin/feat/mysql-schema-skeleton）
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

## 请审什么（mw-privacy-int 视角）

C'' 刀 prove FI-1 实证：`packages/db/src/principal.ts:837-850` `createPool()` 零 `pool.on('error')` 监听 → 连接断即 uncaughtException → API 进程整体崩溃（receipt `2026-10-03-gap-uc004-fault-real-evidence-prove.md` + dual `aafdffbe`/`4d8dc5d` + nail `a27e384`；backlog `:355` P1 OPEN）。本刀 REQUEST 为该缺陷求修复授权与回归 prove 契约。请审：

1. **修复面收敛**：只在 `createPool()` 工厂内挂 pool 级 `error` 监听（+ `packages/db/test/` 必要测试）；Ban 在调用点散改、Ban 借刀改其他 outbound 主链、Ban 加全局 `uncaughtException`/`unhandledRejection` 兜底、Ban 改 `createPool` 现有连接参数。
2. **fail-closed 铁律（隐私/授权根域核心关切）**：监听**只防 uncaught crash，不吞错误**——请求路径错误（含 `asPrincipal` / `asPrivacyWorkerPrincipal` / `asPrivacyWorkerExecutor` 事务内错误）仍按原语义失败（统一 500 `internal_error` 信封），Ban 把连接断伪装成成功、Ban 静默重试、Ban 200-假成功；Ban 候选 C 型「重建/降级联动」把故障伪装成自愈（fail-open），除非双审给出强理由。
3. **日志/指标脱敏**：本文件同域存在 `rebindDatabaseLogin`（角色名/密码校验）与 GUC `app.principal_user` 绑定——监听日志/计数 Ban 含 connectionString、密码、SQL 绑定参数、principal 值；pg 侧错误消息本身可记。
4. **GUC/角色语义零改动**：`SET LOCAL ROLE` / `set_config('app.principal_user', …, true)` / 专用 executor 登录隔离（privacy_worker_executor vs app_role）原样；监听不得触碰事务路径。
5. **修复方案候选裁决**：A 观测型（error 级结构化日志）/ B（A + `pool_error_total` 计数）/ C（B + 重建联动，默认不推荐）——按候选表与 fail-closed 铁律裁决；日志级别、计数维度、是否重建为待裁项。
6. **prove 契约**：复用 C'' FI-1 注入（`pg_terminate_backend`）复跑 `uc004:career-path-fault:prove`——不崩 + HTTP 层可观测（按真实行为断言）+ F2 无半写 + F3 账本净变 0 + `graph_run_rows=0`；attempts 全记录、one-shot、Ban retry-to-green、Ban 改断言洗绿。

Row `UC-E2E-004` FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap. Backlog `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` stays **OPEN**（fix + prove + post-prove dual + 协调方 nail 授权前不翻行）。**Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。**Ban 关闭 C-PERF-TEARDOWN**（prove 基建层，M 线已钉，同族不同 scope）。**Ban invent「已修复 HA」**（NOT_HA 不变）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查段 — `mw-privacy-int`（append-only · 2026-10-05）

**被审对象**: `587b128`（full `587b128c1ff0c918dd015db73d5377a317eee21e` · `docs(privacy): REQUEST GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER fix (pre_dual)` · origin/feat/mysql-schema-skeleton 祖先；其上 tip=`d89aaf3`）。
**审查 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-p-privacy-int` · branch `rv/p-privacy-int`（本刀全部 git 写操作仅在此 worktree · 禁 push）。
**本段性质**: **docs gate only** · 单侧 PRE-EXEC 审查（**alone ≠ dual** · 不代签 `mw-e2e-ha`）· Ban coding / Ban prove 执行 / Ban 改共享 SSOT / implementer 不自批 · 本 PASS ≠ coding 授权 ≠ prove ≠ nail。

### 检查表（全部命令实证 · 可复现）

| # | 项 | 命令/证据 | 结果 |
|---|----|-----------|------|
| 1 | worktree + 祖先链 | `git worktree add /Users/miaole/Desktop/golucky/meetwise-rv-p-privacy-int -b rv/p-privacy-int origin/feat/mysql-schema-skeleton`（HEAD=`d89aaf3`）；`git merge-base --is-ancestor 587b128 origin/feat/mysql-schema-skeleton` → 真 | PASS |
| 2 | docs-only 触碰面 | `git show --numstat 587b128` = 恰 4 个新增 .md（slice +33 · harness +93 · mw-e2e-ha stub +40 · 本 stub +40），+206/−0，`--name-status` 全 `A`；零删除、零改写；`git diff-tree --name-only \| grep -v '\.md$'` 空 | PASS |
| 3 | SSOT/backlog/UC/代码零触碰 | `git diff-tree --no-commit-id --name-only -r 587b128` 对 backlog / coverage-matrix / execution-master-checklist / `*.ts` / `*.mjs` / `.env*` 零命中；backlog `gap-bug-backlog.md:355` 现场复核仍 **OPEN**（P1）；C-PERF-TEARDOWN（`:35`）原样未碰 | PASS |
| 4 | 4 文档自 `587b128` 起未漂移 | `git diff --stat 587b128 origin/feat/mysql-schema-skeleton -- <本刀 4 文件>` = 空（tip 上后续 `fa55a28`/`d89aaf3` 均不触碰本刀文件）→ 本段 append 锚点与被审 commit 对齐 | PASS |
| 5 | 缺陷现状源码复核（只读） | `packages/db/src/principal.ts:837-849` `createPool()` = 直接 `return new Pool({…})`，无任何 `error` 监听；全文件 grep `on('error')` / `uncaughtException` / `unhandledRejection` = 0 命中（独立复跑，与 post-prove dual `4d8dc5d` 的 grep 口径一致）；`new Pool(` 在 packages 非测试源码中**唯一**构造点即 `:838` → harness「工厂层一处修复覆盖全部池」主张成立 | PASS |
| 6 | 域内授权根语义在场（stub §4 对应现状） | `rebindDatabaseLogin` `:795` · `asPrincipal` `:861`（`SET LOCAL ROLE app_role` `:865` + `set_config('app.principal_user',$1,true)` `:866`）· `asPrivacyWorkerPrincipal` `:878`（`privacy_worker_executor` `:882`）· `asPrivacyWorkerExecutor` `:891`（`:895`）——GUC/角色/executor 登录隔离均实位，铁律 5「零改动」要求可执行、可机检 | PASS |
| 7 | 连接参数钉 | `principal.ts:844` `statement_timeout: PG_STATEMENT_TIMEOUT_MS ?? 15000` 与 mw-e2e-ha stub「C'' FI-2 实测口径不得动」一致；`idle_in_transaction_session_timeout`/`connectionTimeoutMillis`/`idleTimeoutMillis` `:845-847` 在场 → 铁律 5 禁改清单明确可验 | PASS |
| 8 | 证据链核验 | receipt `receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md` §2 L32（ATTEMPT-2-FI1-CONNECTION-BREAK exit=1、崩溃帧）/ §4 L77（「修复属产品工作须另刀授权（Ban invent fix）」）/ 附录 L109（stderr `Emitted 'error' event on Client instance` 全帧）逐点在案；dual `aafdffbe`（mw-rag-route）+ `4d8dc5d`（mw-e2e-ha）、nail `a27e384`、parent tip `a778255` 均 `git log` 实证在场 | PASS |
| 9 | Pins 原值 | 4 文档 pins 行逐字比对 = haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · DELETE=**503**；backlog `:355` OPEN / row stays gap 措辞在 slice `:3,:25`、harness `:70-72`、双 stub 尾段一致 | PASS |
| 10 | 边界与诚实条款完整性 | harness Ban 列表 `:74-83` 逐项在场（其他 outbound 主链 / C-PERF-TEARDOWN 不互借 / UC-018/052/025 / covered / 全局兜底 / 洗绿三禁 / self-approve）；prove 契约 `:55-66` 含「按真实行为断言」+「FI-3 结构性不可达 → 全量 EXIT 大概率仍 1，两种结果如实落 receipt」诚实条款；`FI1-CHILD-SURVIVES` 升级项已内建双审前置 | PASS |

### 候选裁决倾向（隐私/授权根视角 · 供双审合裁，非单方授权）

- **A（观测型 log）**：**可过**。最小面、纯观测、零授权面触碰；唯一强制项 = 脱敏（见 C-3）。
- **B（A + `pool_error_total` 计数）**：**本侧倾向 B**。计数不触碰 GUC/角色/事务路径，不构成授权面弱化，并对 terminate 类攻击性/故障性断连提供聚合观测；**约束**：计数维度仅 pool 用途（api / worker / listen / migrate 等基建标签），**Ban** 以 `principal_user` / 租户 / connectionString / SQL 形态作维度。若执行方求再收面，A 亦可接受。
- **C（B + 重建/降级联动）**：**默认否**。重建虽不改 `SET LOCAL ROLE` 事务级语义，但「降级标志」路径极易被下游叙述为健康证明/自愈 = **fail-open**，从授权根视角引入新的可用性叙事面且超出最小修复面。除非双审各自给出书面强理由，执行层选 C = 本域 FAIL。
- **铁律重申（任一违反 = 执行层 FAIL）**：监听只防 uncaught crash、不吞错、不伪装成功、不静默重试；Ban 全局 `uncaughtException`/`unhandledRejection` 兜底；Ban 改 `createPool` 连接参数与 GUC/角色语义；Ban 把「有监听」叙述为「连接可靠/自愈」。

### Fail-trigger audit（本 PASS 翻 FAIL 的触发条件）

- **FT-1** 执行 commit 触碰 `createPool()` 错误处理以外的 `principal.ts` 面（查询路径 / `asPrincipal` 族 / `rebindDatabaseLogin` / 其他 outbound 主链），或在调用点散改而非工厂内一处。
- **FT-2** 监听吞错/转成功/静默重试/200-假成功，或新增全局 `uncaughtException`/`unhandledRejection` 兜底。
- **FT-3** 改 `createPool` 连接参数（`statement_timeout=15000` 等）或 GUC/角色语义（`SET LOCAL ROLE` / `app.principal_user` / `privacy_worker_executor` 登录隔离）。
- **FT-4** 日志/指标含 connectionString、密码、SQL 绑定参数、principal 值，或计数维度含租户/主体标识。
- **FT-5** 选 C（重建/降级联动）而无双审书面强理由。
- **FT-6** 翻 backlog `:355`、关 C-PERF-TEARDOWN、碰 UC-018/052/025、改 coveredCount=8、编造「已修复 HA」、动任何共享 SSOT。
- **FT-7** prove 层改既有断言语义 / retry-to-green / 把 EXIT1 记成 flake / 修 prove 迁就产品 / 把 FI-3 不可达洗绿。

### Blockers

无（none）。

### Conditions（本 PASS 附带）

- **C-1 alone ≠ dual**：本段为 `mw-privacy-int` 单侧 PRE-EXEC docs gate；`mw-e2e-ha` stub 仍 PENDING，其独立签发前本刀不构成 dual PASS，协调方不得据此授权 coding。
- **C-2 候选合裁**：A/B 可行（本侧倾向 B）；C 默认否，须双审书面强理由方可放行，否则执行审 FAIL。日志级别（error 定档）与计数暴露面由执行层按本侧约束落地。
- **C-3 脱敏强制**：监听日志/指标 Ban connectionString / 密码 / SQL 绑定参数 / principal 值 / 租户标识；pg 侧错误消息文本（如 `Connection terminated unexpectedly`）可记。
- **C-4 prove 零改动优先**：首选零改动复跑 `pnpm uc004:career-path-fault:prove`（三层隔离壳不变）；若需把 child 存活升为显式断言行（`FI1-CHILD-SURVIVES`），属工具层最小增量，须在本 REQUEST 范围内明示并交双审裁，Ban 动既有断言语义；attempt 级 `ATTEMPT-2-FI1-CONNECTION-BREAK` 1→0 与全量 EXIT（FI-3 结构性不可达 → 大概率仍 1）两种结果都如实落 receipt。
- **C-5 行冻结延续**：backlog `:355` 翻行前置 = fix 落地 + prove 复跑 + post-prove dual PASS + 协调方 nail 授权，四者缺一不可；`UC-E2E-004` FAULT / `NHP-004-FAULT-01` / A3 stays gap（C'' `a27e384` 原钉），本刀不关 A3；C-PERF-TEARDOWN 不互借。
- **C-6 测试面收敛**：随 fix 授权的测试仅 `packages/db/test/` pool error listener proof（拟 `pool-error-listener.proof.ts`），断言口径 = 进程不崩 · 错误被观测 · 池后续可用 · 请求路径错误语义不变；Ban 借测试面改其他模块。

### 三行中文摘要

1. `587b128` docs-only（恰 4 新增 .md、+206/−0，SSOT/backlog/UC/代码零触碰），缺陷链实证闭环：`principal.ts:837-849` 现状零 `error` 监听且 `new Pool(` 为全仓唯一构造点，backlog `:355` OPEN、receipt FI-1 三段 + dual `aafdffbe`/`4d8dc5d` + nail `a27e384` 全部在场，4 文档 pins 与原值逐字一致。
2. 候选裁决倾向：本侧倾向 B（A+`pool_error_total`，维度仅 pool 用途、Ban 主体/租户/连接串维度），A 可接受，C 默认否（重建/降级联动有 fail-open 与「自愈叙事」风险，须双审书面强理由）；fail-closed 铁律（不吞错/不伪装成功/Ban 全局兜底/Ban 改连接参数与 GUC/角色语义）与 prove 诚实契约（attempt 1→0、全量 EXIT 如实、Ban 洗绿）全数在案。
3. 无 Blockers；附 C-1~C-6（alone ≠ dual 不代签 mw-e2e-ha、候选合裁、脱敏强制、prove 零改动优先、行冻结四前置、测试面收敛）；本 PASS 不授权 coding/prove，backlog `:355` stays OPEN，`mw-privacy-int` 单侧 PRE-EXEC PASS。

Verdict: PASS

---

# POST-PROVE DUAL REVIEW — GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复刀复验 · mw-privacy-int

**Status**: POST-PROVE dual（产品修复刀复验）· mw-privacy-int 独立签署（alone ≠ dual · 不代签 mw-e2e-ha）
**被审 tip**: `1751122`（full `1751122ba7cd5ba78bf43309b47fd01c050ca36a` · branch `line/p-pool-error-listener` · 执行 worktree `/Users/miaole/Desktop/golucky/meetwise-line-p`）
**授权链**: REQUEST docs `65d3a24` → pre-exec dual PASS（mw-privacy-int `83bb162` C-1~C-6 + mw-e2e-ha `9d97de2` C-1~C-8）→ fix `56fc1ea` → prove `1751122` → 本 POST-PROVE dual
**审查 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-pp-privacy-int` · branch `rv/pp-privacy-int`（git 写操作仅在此独立 worktree）
**复现环境（本审自建）**: one-shot `pgvector/pgvector:pg16` @ `127.0.0.1:55391`（用后即毁）· pnpm frozen-lockfile · `DATABASE_URL` 注入本审新造凭据（`rvproof_secret_2026`）作负样本 · 复现后容器与临时脚本全部清除

## §A 包完整性（`git diff 65d3a24 1751122` 全清单核证）

恰 4 文件、零多触：

| 文件 | 变化 | 归属 commit |
|---|---|---|
| `packages/db/src/principal.ts` | M +86/−1 | `56fc1ea` |
| `packages/db/test/pool-error-listener.proof.ts` | A +135 | `56fc1ea` |
| `apps/api/test/uc-e2e-004-career-path-fault.proof.ts` | M +20/−3 | `1751122` |
| `ai-docs/delivery/receipts/2026-10-05-gap-principal-pool-error-listener-fix-prove.md` | A +147 | `1751122` |

- `apps/worker/src/cloud-smoke-runner.ts` **零 diff**（本侧 C-2 / e2e-ha C-2 Ban 触碰项核销；唯一旁路站点 `:47` 自带 `on('error')` 原样）。
- SSOT / backlog 零 diff；其他 outbound 主链零 diff。
- `principal.ts` 恰 3 hunks：`PoolOverrides` 接口 + `createPool()` 工厂体内；`asPrincipal` 族 / `rebindDatabaseLogin` / `resolveSsl` / 查询路径零触碰（FT-1 未触发）。
- 全仓 `new Pool(` 构造点 grep 恒为 2（`principal.ts:909` 工厂 + 未触碰的 `cloud-smoke-runner.ts:47` 旁路）——工厂外零新增池构造。

## §B 机制断言独立复核（对照锁定源码 pg@8.22.0 / pg-pool@3.14.0 逐行）

| 实现方声称 | 独立核验 | 结果 |
|---|---|---|
| pg-pool@3.14.0 `_acquireClient` checkout 时 `client.removeListener('error', idleListener)` | `pg-pool/index.js` `_acquireClient` 内该行实证 | 属实 |
| pg@8.22.0 `_handleErrorEvent`（:412-419）对 checked-out client 先 `_errorAllQueries(err)` 后 `this.emit('error', err)` | `pg/lib/client.js` 逐行实证 | 属实 |
| pg-pool 全库 pool 级 error 发射仅 1 处（`makeIdleListener` idle 重发） | grep 实证仅 `pool.emit('error', err, client)`，且重发**同一 error 对象** | 属实 |

## §C 域核心四审（隐私/授权根）

**C-I 零吞错（FT-2）**：`observePoolError` 纯只读（Map 计数 + 单行 JSON 日志）——不重连、不重建池、不重试、不设降级标志、不调 `pool.end`；全文件零 `uncaughtException`/`unhandledRejection` 注册（grep 实证，仅注释提及）。pg 在 `_handleErrorEvent` 中先 `_errorAllQueries(err)`（请求路径 reject → 统一 500 `internal_error`）**后** emit('error')——per-client 监听挂在 emit 侧，语义上不可能改写 reject 路径；db proof `POOL-ERROR-ACTIVE-QUERY-STILL-REJECTS` PASS（本审独立复现）。**错误处理语义零改变。**

**C-II 脱敏（C-3）**：日志恰 5 键 `{event,purpose,count,error_name,error_message}`（`POOL-ERROR-LOG-FIVE-KEYS-ONLY` 独立复现 PASS）；`purpose` 白名单正则 `^[a-z0-9_-]{1,64}$`，非法标签在触碰任何连接配置前 fail-closed（`database_pool_purpose_invalid`，复现 PASS）；负样本断言用**环境真实 DATABASE_URL 密码子串**（≥4 字符过滤）+ `postgresql://` 全串子串双查——本审以新造密码独立复跑 `POOL-ERROR-LOG-NO-SECRETS` PASS，**负样本真实有效非摆设**；无 SQL 文本、无 principal/租户维度（计数 Map 仅 purpose 键，`POOL-ERROR-COUNTER-DIMENSION-ISOLATED` PASS）。pg 侧错误文本（如 `Connection terminated unexpectedly`）按 C-3 明示可记。

**C-III 授权根零弱化（FT-3）**：diff 逐行核——`Pool` 构造参数块（connectionString/ssl/max/statement_timeout/connectionTimeoutMillis/idleTimeoutMillis）全部为上下文行零改动；`purpose` 字段从未传入 Pool 构造器（grep 实证仅作 observer 标签）；GUC `app.principal_user` / `SET LOCAL ROLE` / `privacy_worker_executor` 登录隔离 / RLS 零触碰。**附证**：本审复现首次误将 `DATABASE_URL` 与 `PGPASSWORD` 同设，被预存 fail-closed 守卫 `database_url_conflicts_with_pg_components` 当场拒绝——配置面 fail-closed 纪律在位。

**C-IV 计数去重**：WeakSet 按 error **对象身份**去重。idle 断连：client 观测先记（WeakSet.add + count++）→ pool 侧 `makeIdleListener` 重发同一对象 → 早退；checked-out 断连：仅 client 观测（idleListener 已被移除）→ 每起断连恰 1 记录。db proof 2 起注入断连 counter=**2**（本审独立复现 `counter=pool-error-proof:2 default:0`）。残留说明：非 Error 实例发射绕过 WeakSet（按次计数），pg 当前在这些路径恒发 Error 实例，可接受（§G P-3）。

## §D prove 复核

- **演进披露核实（receipt §1 账目 #1-#2）**：本审以**独立负对照**（仅池级监听 + checked-out 断连注入）复现 v1 不足——崩溃帧与 receipt 逐字同形：`Emitted 'error' event on Client instance at Client._handleErrorEvent (pg/lib/client.js:417:10)`，`PROCESS_SURVIVED_V1` 未到达（进程死于 uncaughtException）。**池级监听确不覆盖 C'' FI-1 崩溃路径；v2 的 `pool.on('connect')` per-client 观测是必要修复延伸，非 scope creep。**
- **attempts 台账**：4 条全在（CONTROL:0 / FI-2:0 / **FI-1:0** / FI-3:1 UNREACHABLE），`one_shot=true retry_to_green=false`；v1→v2 演进如实入账（各自一次性运行，非 retry-to-green）。
- **FI-1 前后对照**（receipt §4）：`transport_closed`+崩溃 → 500 `internal_error`+`still_running`；F2 rows=0 / GET 404 / F3 净变 0 / graph_run_rows=0 全保持，无回归。
- **`FI1-CHILD-SURVIVES` 为加严增量**：由 `Promise.race([api.done, sleep(5000)])` 实测推导（零假设），计入 exit 合取 `f1 && f2a && f2b && f3 && noFake && childSurvives`——观察项升断言行，加严不减；既有断言语义零改动（F1 等强三要素原文通过）。符合本侧 C-4 与 e2e-ha C-5 双授权。
- **全量 EXIT=1 与 FI-3 一致性**：UNREACHABLE 锚点本树逐字核证——`apps/api/src/modules/interview/interview.service.ts:768` `generateCareerPath(principal: string, id: string) {`（同步 derive）与 `:783` `deriveCareerPath(overall, weaknesses)`，与 GAP 行引用一致；EXIT=1 诚实保留，未记 flake、未翻任何 SSOT 行。
- **evidence 字段** `pool_error_log_seen` / `pool_error_log_line` 为非断言通道（不影响 EXIT），承载的日志行本身已脱敏（5 键）。

## §E 条件裁决（本侧 pre-exec C-1~C-6 逐条）

| 条件 | 裁决 | 依据 |
|---|---|---|
| C-1 alone ≠ dual | **PASS（已闭合）** | pre-exec dual 由 `83bb162`（本侧）+ `9d97de2`（mw-e2e-ha）构成，双签在树可证；本段为 POST-PROVE 独立签署，不代签、不改写 peer 结论 |
| C-2 候选合裁=B 且 C 零实现 | **PASS** | 落地 = B（池级 + per-client 观测，同 `observePoolError`）；候选 C（重建/降级联动）零实现（全 diff 无 rebuild/retry/degrade/pool.end）；计数维度仅 purpose，Ban 维度（principal/租户/连接串/SQL 形态）零出现 |
| C-3 脱敏强制 | **PASS** | §C-II：恰 5 键、正则白名单 fail-closed、真实负样本独立复现、pg 错误文本按明示可记 |
| C-4 prove 零改动优先 + CHILD-SURVIVES 升级 + attempt 1→0 + 全量如实 | **PASS** | 既有断言零改动即过（实测 500 `internal_error`）；CHILD-SURVIVES 为双授权最小增量（实测推导、加严）；attempt 级 FI-1 **1→0**；全量 EXIT=1 如实保留 FI-3 gap |
| C-5 行冻结（四前置未满足前不翻行） | **PASS（冻结保持）** | 四前置 = fix ✓ + prove 复跑 ✓ + post-prove dual（本段）✓ + **协调方 nail 授权 ✗（未发生）**→ backlog `:355` stays OPEN；`UC-E2E-004` FAULT / `NHP-004-FAULT-01` / A3 stays gap；C-PERF-TEARDOWN 未触碰；SSOT 零 diff |
| C-6 测试面仅 db/test | **PASS（附 C-4 让位说明）** | fix 随附测试恰为 `packages/db/test/pool-error-listener.proof.ts`，四断言轴（进程不崩/错误被观测/池后续可用/请求路径语义不变）全数在位；prove 文件 +20/−3 非借道改测试面，系 C-4 预留的 CHILD-SURVIVES 工具层最小增量（双审裁、REQUEST 范围内明示、receipt §3 披露、零既有断言语义改动） |

**FT-1~FT-7 全量未触发。**

## §E2 演进裁决（主动披露的实现演进 v1→v2）

**接受（ACCEPTED）**。依据：
1. **必要性**（运行时 + 源码双证，§B/§D）：池级监听对 checked-out client 的 emit 无监听可依，本审负对照复现同形崩溃帧；v2 per-client 观测为修复 FI-1 的必要条件。
2. **在授权面内**：仍在 `createPool()` 一处、零调用点改动、全仓池构造点恒为 2；`pool.on('connect')` 每 client 恰触发一次，零监听累积。
3. **诚实**：receipt §1 账目 #1（v1 崩溃）与 §6 条件 3 披露在案；v1/v2 各自一次性运行，非 retry-to-green。
4. **零新增授权风险**：observer 保持只读；WeakSet 去重保 1 断连=1 记录；日志/计数面与 B 候选原契约一致。

## §F Blockers

无（none）。

## §G Conditions（本 PASS 附带 · 非阻断）

- **P-1 purpose 布线**：现有调用点未传 `purpose`（记 `'default'`）——观测标签运维布线为后续项；Ban 叙述为 principal/租户标注，Ban 以「已有分维度观测」升格任何行。
- **P-2 行冻结延续**：backlog `:355` 翻行须协调方 nail 授权（四前置之四）；本 PASS 不翻任何行、不关 A3、不置 covered、不碰 UC-018/052/025。
- **P-3 非 Error 发射**：非 Error 实例路径绕过 WeakSet 去重（按次计数）。pg 当前恒发 Error 实例；若 pg 升级改变该行为须复评。非阻断。
- **P-4 error_message 边界**：pg 错误文本可含网络层 endpoint（host:port），按 C-3「pg 侧错误文本可记」放行；凭据/连接串仍 Ban（负样本断言常驻）。

## 三行中文摘要

1. 包完整性实证：65d3a24→1751122 恰 4 文件（principal.ts 工厂内 + db proof 新测试 + prove 增量 + receipt），cloud-smoke-runner/SSOT/其他主链零 diff；pg@8.22.0 `_handleErrorEvent` 先 `_errorAllQueries` 后 emit、pg-pool `_acquireClient` checkout 移除 idleListener、pool.emit('error') 全库仅 makeIdleListener 重发同对象——机制声称逐条对锁定源码核证属实。
2. 域核心四审全过：observer 纯只读零吞错（请求路径仍 reject→500，无全局兜底、候选 C 零实现）；日志恰 5 键 + purpose 正则白名单 + 真实密码负样本（本审以新造凭据独立复现 EXIT=0 12/12 PASS、counter=2:2 去重、维度隔离）；授权根零弱化（Pool 参数全为上下文行、purpose 不入构造器、GUC/角色/RLS 零触碰，预存 fail-closed 守卫在位）；per-client 演进经独立负对照证实为必要（v1 同形崩溃帧复现）且在授权面内。
3. C-1~C-6 逐条 PASS（C-6 附 C-4 让位说明）；attempts=4 全台账、FI-1 attempt 1→0、`FI1-CHILD-SURVIVES` 加严增量（实测推导计入 exit 合取）、全量 EXIT=1 诚实保留 FI-3 gap（interview.service.ts:768/:783 锚点本树核证）；无 Blockers，行冻结保持——backlog :355 翻行待协调方 nail 授权，本 POST-PROVE dual PASS。

Verdict: PASS
