# Slice — **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · 产品修复刀**（Line P · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · backlog `:355` stays OPEN · row stays gap）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base**: `origin/feat/mysql-schema-skeleton` · `a778255c8a600304001207a514621323e77da3d2`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve

## One-line

C'' 刀（`GAP-UC004-FAIL-A3` fault prove）实证的真实产品缺陷：`packages/db/src/principal.ts:837-850` pg Pool 创建处**零 `pool.on('error')` 监听**——连接断（`pg_terminate_backend` 等）时 `pool.emit('error')` 无监听器 → uncaughtException → **API 进程整体崩溃**（无 HTTP 降级、子进程 exit 1、stderr `Emitted 'error' event on Client`；证据链：receipt `2026-10-03-gap-uc004-fault-real-evidence-prove.md` + dual `aafdffbe`/`4d8dc5d` + nail `a27e384`）。本刀（Line P）为其求**修复方案授权**（池级 `error` 监听，fail-closed：只防 uncaught crash、不吞错、不伪装成功；候选 A 观测型 / B +指标 / C +重建联动，双审裁决）与**回归 prove 契约**（复用 FI-1 注入复跑 `uc004:career-path-fault:prove`：不崩 + HTTP 可观测 + F2/F3 净变 0；attempt 级预期 1→0，全量 EXIT 如实记录）。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-principal-pool-error-listener-fix.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-05-gap-principal-pool-error-listener-fix-mw-privacy-int.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-principal-pool-error-listener-fix-mw-e2e-ha.md` |

## Scope / Not

只做 backlog `gap-bug-backlog.md:355` **GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER**（P1 OPEN）的产品修复 REQUEST。修复面仅 `packages/db/src/principal.ts` pool 错误处理（+ `packages/db/test/` 必要测试）；Ban 借刀改其他 outbound 主链；Ban 关闭 C-PERF-TEARDOWN（backlog `:35`，prove 基建层同族不同 scope，M 线已钉，Ban 互借）；Ban invent「已修复 HA」叙事（haStatus=NOT_HA 不变）。Not A3 关闭刀：`UC-E2E-004` FAULT 列 / `NHP-004-FAULT-01` **stays gap**（C'' `a27e384` 原钉），A3 关闭仍走 C'' 自己的 post-prove dual + 协调方授权路径。

诚实条款：prove 复跑后 FI-3 仍结构性不可达 → 全量 EXIT 大概率仍 1，attempt 级转绿与全量 EXIT 两种结果都如实落 receipt（`ai-docs/delivery/receipts/`）。Ban 修 prove 迁就产品、Ban 改断言洗绿、Ban 把 EXIT1 记成 flake。gap 行（backlog `:355`）在 fix + prove + post-prove dual + 协调方 nail 授权前 **stays OPEN**。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban covered · Ban 翻任何 SSOT 行 · Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件 · Ban 借刀改其他 outbound 主链 · Ban 关闭 C-PERF-TEARDOWN · Ban invent「已修复 HA」· Ban 吞错/伪装成功/全局 uncaughtException 兜底 · Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503.

*Slice · GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER · pool error listener fix · awaiting_pre_exec_dual · OPEN · STOP*
