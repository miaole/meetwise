# REQUEST — **C-PERF-TEARDOWN CONDITION residual · container-reachability honest evidence**（可达 → 复现/根因台账 · 不可达 → blocked 台账 · CONDITION stays OPEN）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/c-perf-teardown-condition-residual.md` · slice `c-perf-teardown-condition-residual.slice.md`
**Parent tip**: `416b6a5`（full `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8` · not a prove tip）
**Date**: 2026-10-06
**Line**: **AE**

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
| C-PERF-TEARDOWN（backlog `:35`） | **CONDITION OPEN**（retained · Ban close） |
| PERF/LOAD | **local partial** · capacityRepresentative=**false** |
| canHonestlyFlip | **false** |
| attempt1 @ `b29c191` | **EXIT=1 retained**（Ban wash） |

## 请审什么（mw-e2e-ha · 签名分界 / attempt 纪律 / 可达性探针 · Ban close · Ban wash attempt1）

Line AE · 承接 Line S NAIL `54a7437`（prove `e8c63a9` · EXIT 0/0/0 · CONDITION OPEN）+ blocked ledger `44154aa`（container-reachability · 3× EXIT=1 ECONNREFUSED）。请审：

1. **签名分界**：attempt1@`b29c191`（mid-prove pg Client unhandled crash）vs `44154aa`（API 容器启动期 `ECONNREFUSED` @ `assertIsolatedTestTarget`）是否被正确判为 **不同 class**；Ban 用 `44154aa` EXIT=1「复现」attempt1 · Ban 用 Line S 0/0/0「关闭」attempt1。
2. **可达性预探针**：`uname` / `docker version` / groups / `docker info` / throwaway `--network=host` → 发布端口连通 —— 是否足以在正式 attempt 前判定 R-A / R-B；docker 组激活仅 `with-docker-session.sh`（Ban sudo/chmod/usermod/setfacl）。
3. **R-A attempt 纪律**：预声明 N（拟 3）· fresh 隔离 PG · 全记录 · Ban retry-to-green · Ban 只留绿；env 层失败（如陈旧 `node_modules`）单独入账不删除。
4. **R-B blocked 台账**：证据链（宿主→端口 OK vs 容器→端口 ECONNREFUSED）是否足以支撑「约束内不可达」；修复方向只列不做；Ban 把 blocked 当关闭理由。
5. **关闭判据冻结**：任何 EXIT=0 组合都不关 backlog `:35`；CONDITION OPEN · canHonestlyFlip=false · PERF/LOAD local partial · capacityRepresentative=false。
6. **Ban Branch B invention**：零改 `uc018-perf-load-capped-child.mjs` / `run-e2e-isolated.mjs` / `isolated-test-target.ts` / 网络拓扑。
7. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail ≠ close；Ban HA · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban 碰 Line AD/AF/AG/AH。

C-PERF-TEARDOWN stays **CONDITION OPEN**. attempt1 @ `b29c191` **EXIT=1 retained**. **Ban close** · **Ban wash attempt1** · **Ban Branch B invention** · **Ban invent green** · coveredCount=8.

本 stub 不授权 coding / prove / push / buy cloud；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · STOP*
