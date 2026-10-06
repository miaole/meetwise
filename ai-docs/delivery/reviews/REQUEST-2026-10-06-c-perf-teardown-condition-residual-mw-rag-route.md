# REQUEST — **C-PERF-TEARDOWN CONDITION residual · container-reachability honest evidence**（可达 → 复现/根因台账 · 不可达 → blocked 台账 · CONDITION stays OPEN）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 请审什么（mw-rag-route · 账目保全 / host-class 正交性 / 局部性 · Ban 互借）

Line AE · 承接 Line S NAIL `54a7437`（prove `e8c63a9` · EXIT 0/0/0 · CONDITION OPEN）+ blocked ledger `44154aa`（container-reachability · 3× EXIT=1 ECONNREFUSED）。请审：

1. **账目保全**：attempt1@`b29c191` EXIT=1 · Line S `e8c63a9` 0/0/0 · `44154aa` 7 attempts（4 env + 3 正式 EXIT=1）三段是否原样引用、零改写、零删减。
2. **host-class 矩阵**：Linux 原生 docker vs Docker Desktop VM 下 `--network=host` 语义差异（`capped-child :111/:141`）能否解释 Line S 0/0/0 与 `44154aa` 1/1/1 并存；矩阵 = 解释 ≠ 根因证实。
3. **正交性**：阈值 miss / latency EXIT 与 teardown 条件正交；Ban 把阈值 EXIT=0 外推为 SLA / capacity；PERF/LOAD stays local partial · capacityRepresentative=false。
4. **Ban 互借**：C-IMAGE-DIGEST（同族旧 harness）· GAP-PRIV-AUTHZ-PROVE-FLAKE（另一 ECONNREFUSED 族 · Line AH 只读）· GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER（CLOSED-fixed · 同族不同 scope）。
5. **新开 harness 的理由**：旧 `gap-perf-teardown-rootcause-fix.md` 已封存 `post_prove_dual_pass`；新文件避免改写历史与混 C-IMAGE-DIGEST —— 是否成立。
6. **Ban close / Ban invent green / Ban Branch B invention** · UC-018 行不动 · coveredCount=8 · Ban SSOT flip。
7. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban self-approve。

C-PERF-TEARDOWN stays **CONDITION OPEN**. attempt1 @ `b29c191` **EXIT=1 retained**. **Ban close** · **Ban wash attempt1** · **Ban Branch B invention** · **Ban invent green** · coveredCount=8.

本 stub 不授权 coding / prove / push / buy cloud；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · STOP*
