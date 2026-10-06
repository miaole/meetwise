# Slice — **C-PERF-TEARDOWN · product rootcause fix**（Line AN-PERF-TEAR · `draft:awaiting_pre_exec_dual` · re-PRE rewrite ×2）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST rewrite **×2 re-PRE** · supersedes `553cfc5`（→`110532e`）· cites Re-PRE FAIL `7e97dc3`（B1/B3/B4/Cond）+ PRE FAIL `152b665` · Ban coding until PRE BOTH PASS + AUTHORIZE · CONDITION may stay OPEN）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD local partial · capacityRepresentative=false
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` @ `eae1e19`（ff past `4b06058` · AN-PRIV-EXT / AN-MOP-Q45 ancestors · Ban touch sibling AN · Ban AN-CIMG-EA）
**Prior REQUESTs**: `553cfc5e4ca511b0327b647fcc2b49925828752c`（superseded）· `110532e81f11064e543bc9bc420b67bb2f95ae1e` · **FAIL**: `7e97dc3e500c9471fe50dbdbd3aaee8d6c89e7e9` · `152b665787e02ac6ef350551e599b3823a9fa763`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban self-approve · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push

## One-line

backlog `:35` **C-PERF-TEARDOWN CONDITION OPEN**。rewrite ×2 解除 `7e97dc3` 未清项：**B1①** L3 判定程序 J-1 回溯（attempt1 窗口 12:57:14–12:57:35 +08:00 内无已记录 emit · reemit 不达 `:559` · `state_bytes=29`=`docker_diagnostic_unavailable` 字节数 → 容器诊断前已消失 · L3/L2-self UNDETERMINABLE）+ J-2 前向 `docker events`/进程采样判定表 + J-3 L3-sim；**B1②** attempt1 时序读码：本 run harness teardown 顺序上不能先于崩溃 · 新增 L2-self（`--rm` 自亡自删）；**B3** EXIT 矩阵 PC 3/3 EXIT0 · 每 inject×{MUT,POST} 3/3 EXIT=1+签名 · inject 自身 EXIT0；**B4** (A) `pg_terminate_backend` + (B) `docker restart` + (C) `docker rm -f` 本 run PG **各自**钉 CMD/EXIT/触发点 T1（`LOAD run2:` 后）/MUT/POST；**Cond** `:931` · R2 DB source = 一次性本 run 自有 pg16 容器。B2/B5/B6 钉值保留。runner 行号 @tip 实测 +12 重锚（`:1726` · `:2182` · `:2251-2253`）。**Ban wash attempt1 @ `b29c191`** · **Ban UC-018 covered flip** · CONDITION may stay OPEN。

## Products

| Role | Path |
|------|------|
| Harness | `harness/c-perf-teardown-product-rootcause-fix.md`（rewrite） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-c-perf-teardown-product-rootcause-fix-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-c-perf-teardown-product-rootcause-fix-mw-rag-route.md` |

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 @ `b29c191` · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban product/infra code · Ban commit MUT · Ban invent product loci · Ban Redis cutover · Ban MODEL-OP closed claim · Ban MySQL/Qdrant/FULLTEXT · Ban touch AN-PRIV-EXT/MOP product。

*Slice · C-PERF-TEARDOWN product rootcause fix · AN-PERF-TEAR re-PRE ×2 · supersedes 553cfc5 · FAIL 7e97dc3 + 152b665 · draft:awaiting_pre_exec_dual · STOP*
