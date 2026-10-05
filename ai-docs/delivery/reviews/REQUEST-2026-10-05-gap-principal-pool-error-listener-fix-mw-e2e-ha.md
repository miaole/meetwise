# REQUEST — **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

C'' 刀 post-prove dual（`4d8dc5d`）钉明：FI-1（pg 池无 error 监听 → 连接断即进程崩溃）为真实产品可用性缺陷，修复须独立产品刀 + 授权。本刀（Line P）即该 REQUEST：`packages/db/src/principal.ts:837-850` `createPool()` 补池级 `error` 监听（fail-closed）+ 回归 prove 契约。请审：

1. **修复面收敛（e2e/可用性边界）**：仅 `createPool()` 工厂内挂监听（+ `packages/db/test/` 必要测试）；Ban 借刀改其他 outbound 主链（HTTP client / ai-graphs / qdrant / redis 等）；Ban 全局 `uncaughtException`/`unhandledRejection` 兜底；Ban 改 `createPool` 现有连接参数（statement_timeout=15000ms 等为 C'' FI-2 实测口径的一部分，不得动）。
2. **fail-closed**：监听只防 uncaught crash、不吞错误——请求路径仍按原语义失败（统一 500 信封）；Ban 伪装成功、Ban 自动重试、Ban 候选 C 型重建/降级联动（除非双审给出强理由）。
3. **prove 回归契约**：复用 C'' FI-1 注入手法（锁占位 + `pg_terminate_backend` 杀 INSERT backend）复跑 `uc004:career-path-fault:prove`：修复后同一注入 **API 进程不崩**（无 exit_code=1）**且有 HTTP 层可观测响应**（5xx 或降级，**按真实行为断言**——预期与 FI-2 同形 500 `{"error":"internal_error"}`，实测为准，Ban 编造）+ F2 无半写（SQL rows=0 + GET 404 双证）+ F3 账本净变 0（before/after 实测快照）+ `graph_run_rows=0`。
4. **EXIT 诚实契约**：attempt 级预期 `ATTEMPT-2-FI1-CONNECTION-BREAK` exit **1 → 0**；全量 EXIT 是否转 0 按 C'' 原契约裁决——**FI-3 结构性不可达不变**（同步 derive、无图接线），全量 EXIT 大概率仍 1；两种结果如实落 receipt。**Ban 修 prove 迁就产品、Ban 改既有断言语义洗绿、Ban 把 EXIT1 记成 flake**；prove 层首选零改动复跑，若需把「child 存活」升为显式断言行（如 `FI1-CHILD-SURVIVES`）属工具层最小增量，须明示并交双审裁。
5. **隔离惯例**：复跑沿用 `scripts/run-e2e-isolated.mjs` 三层包装 + per-run 随机容器 + 动态端口 + loopback/nonce attestation（同 C'' C-1 条款）；attempts 全记录 · one-shot · Ban retry-to-green · machine receipts 落 `.tmp/isolated-proof-receipts/`。
6. **边界互不借**：**Ban 关闭 C-PERF-TEARDOWN**（backlog `:35`，prove 基建层，M 线已钉——同族不同 scope）；**Ban invent「已修复 HA」**：本刀是单实例崩溃边界修复（可用性卫生），不是 HA、不是 multi-instance，`haStatus=NOT_HA` 与 `releaseEvidence=false` 不变。

Row `UC-E2E-004` FAULT column stays gap. Case `NHP-004-FAULT-01` stays gap（A3 关闭仍走 C'' 自己的 post-prove dual + 协调方授权路径，本刀不关 A3）。Backlog `GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER` stays **OPEN**. **Ban covered**. **Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件**（UC-052 stays partial）。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 coding；implementer 不自批。Dual PASS ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*
