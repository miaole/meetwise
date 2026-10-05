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
