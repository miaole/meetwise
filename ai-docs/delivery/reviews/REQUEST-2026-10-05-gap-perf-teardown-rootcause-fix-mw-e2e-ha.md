# REQUEST — **C-PERF-TEARDOWN 根因刀 · PERF-LOAD teardown 根因判定 + 复跑验证/关闭证据** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-perf-teardown-rootcause-fix.md` · slice `gap-perf-teardown-rootcause-fix.slice.md`
**Parent tip**: `377e7fc`（series open · not a prove tip）
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
| PERF/LOAD | **local partial**（stays） · capacityRepresentative=false |
| `canHonestlyFlip` | **false** |

## 请审什么（mw-e2e-ha 视角）

本刀为 PERF-LOAD@`b29c191` attempt1 的 mid-prove unhandled crash 求根因判定授权与复跑验证契约。请审：

1. **根因判定的可复核性（本刀核心）**：REQUEST 断言「崩溃进程 = docker 容器内 `apps/api/test/uc-e2e-018-perf-load.proof.ts`，其全部 pg 面走 `createPool()`」——请逐条核 file:line：wrapper 零 pg 依赖（`scripts/uc018-perf-load-capped-child.mjs:1-204`，docker 参数 `:121-127`/`:136-157`，exit `:202-204`）；proof 唯一 pg 面 `h.pool`（`uc-e2e-018-perf-load.proof.ts:152/:232-244` 等）← `_neg-harness.ts:43/:56-58` ← `db.service.ts:7` `createPool()`；`apps/api/src` 无独立 `new Pool`/`new Client`；abandon 路径同池 SQL（`interview.service.ts:494-513` · `commerce.ts:243-251`）；P 修复 `f19ecba`（= P 线 `56fc1ea`）在 `377e7fc` 祖先链、工厂观测 `principal.ts:869/:886/:928-931`。**请独立验证判定，Ban 采信实现方读码而不复核**。
2. **时间线一致性**：attempt1/2 @`b29c191`（2026-09-23）早于 P 修复（2026-10-05）→ 该 SHA 上工厂零监听 ⇒ attempt1 崩溃形态（`pg/lib/client.js` Client 发射 · `Connection terminated unexpectedly` · mid-prove run2 后）与 P 线 v1 崩溃帧同形（P receipt §Appendix B）——判定若成立，attempt1 = **已被后续修复覆盖的历史缺陷证据**，但**关闭只能由本刀自己的复跑证据产生**，Ban 用 P 线成果直接宣称关闭（互借禁令 M 线已钉）。
3. **EXIT/关闭证据契约**：复跑 `pnpm uc018:perf-load:prove` @ committed SHA（frozen-lockfile · fresh 隔离 PG）≥3 attempts，one-shot、全记录；关闭判据 = 全 attempts (a) 零 `Unhandled 'error' event`/mid-prove 崩溃 (b) 每次至 run3+`SUMMARY` 完整到达 (c) 若真实连接断：`db_pool_error` 结构化日志可见 + 受影响 run 诚实 FAIL/PASS（errorRate/missReasons 口径）。任一 attempt 仍现 attempt1 式 unhandled crash → **EXIT1 诚实保留 + 根因重新钉（转 Branch B）**；EXIT1 **不记 flake**、Ban retry-to-green、Ban 弃 attempt。
4. **阈值正交性**：run 级阈值判定（p50/p95/p99/err/caps）与 teardown 条件正交——阈值 miss → EXIT=1 诚实保留，既不是本刀失败条件、也 **Ban** 洗成条件关闭证据；反之本刀关闭证据 **Ban** 外推为阈值面转绿。
5. **attempt1 不洗**：attempt1 是 P 修复落地前的真实缺陷证据，账目保全；attempt2=0 不洗 attempt1（`README.md:39-41`「Do not claim the second exit washes the first」原钉）。**Ban 把 attempt1 记成 flake/环境噪声**。
6. **残余披露充分性**：`run-e2e-isolated.mjs:1889-1890` HOST_SQL_PROBE 独立 Client（未走 createPool）+ P 线 residual P-1/P-3 是否已如实随链披露、其「非 attempt1 签名」论证是否成立（boot 期 · 短命 · 独立子进程 · exit 被 capture 捕获重试）。
7. **fail-closed 铁律**：Branch B（若触发）基建观测须只防 uncaught crash、错误必被观测、Ban 吞错/伪装成功/静默重试、**Ban 全局 `uncaughtException`/`unhandledRejection` 兜底**；观测 = 故障观测非健康证明，Ban 发明「连接可靠/自愈」叙事。
8. **行冻结**：backlog `:35` stays CONDITION OPEN（canHonestlyFlip=false）；PERF/LOAD stays local partial；coveredCount=8；Ban 翻任何 SSOT 行；EXIT/复跑结果不自动翻任何行——关闭须 post-prove dual PASS + 协调方授权。

Row `C-PERF-TEARDOWN` stays CONDITION OPEN. **Ban covered** · **Ban 碰产品 `packages/db/src/principal.ts`**（P 线 CLOSED-fixed）· **Ban 互借关闭 C-IMAGE-DIGEST** · **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件**。**Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail（≠ 条件关闭）。

---

*Stub · awaiting expert pre-exec dual · STOP*
