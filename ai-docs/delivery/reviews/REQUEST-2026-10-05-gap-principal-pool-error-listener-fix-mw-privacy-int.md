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
