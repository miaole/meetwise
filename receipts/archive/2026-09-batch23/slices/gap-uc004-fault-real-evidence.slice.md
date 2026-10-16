# Slice — **GAP-UC004-FAIL-A3 · FAULT real evidence**（docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · row stays gap · A3 is not closed）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-03
**Base**: `origin/feat/mysql-schema-skeleton` · `f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban invent a fix · Ban self-approve

## One-line

C' FINAL `0652a08` 只钉「FAULT 仍 gap」。本刀为 **`GAP-UC004-FAIL-A3`** / **`NHP-004-FAULT-01`** 求**可复现故障注入真证据**：注入点 FI-1 连接断 / FI-2 依赖超时 / FI-3 图失败状态机（预期不可达 → 诚实 EXIT1 保持 gap）。**不是**把 `uc004:career-path` mark-red EXIT0 当作 A3 关闭——现有 prove 是静态盘点，零运行时 FAULT 证据。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc004-fault-real-evidence.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-03-gap-uc004-fault-real-evidence-mw-rag-route.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-03-gap-uc004-fault-real-evidence-mw-e2e-ha.md` |

## Scope / Not

只做 UC-004 FAULT 列的故障注入 prove REQUEST。Not UC-018。Not UC-052。Not UC-025。不碰 `GAP-UC004-E2E-MAIN` / `GAP-UC004-GRAPH` / `GAP-UC004-GROWTH-A1A2` / `GAP-UC004-UNCERTAINTY`。不发明验收标准（A3 口径以 `e2e-scenarios.md` E-gen-fail / TC-E2E-004-fail 原文为准）。

诚实条款：若真实故障注入做不出/关不了（尤其 FI-3 图失败状态机本树无接线），**保持 gap**、如实落 receipt（`receipts/2026-10-03-gap-uc004-fault-real-evidence-prove.md`）。Ban invent fix。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban covered · Ban 翻任何 SSOT 行 · Ban 碰 UC-018 / UC-052 / UC-025 任何行/文件 · Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503.

*Slice · GAP-UC004-FAIL-A3 · NHP-004-FAULT-01 · fault real evidence · awaiting_pre_exec_dual · gap · STOP*
