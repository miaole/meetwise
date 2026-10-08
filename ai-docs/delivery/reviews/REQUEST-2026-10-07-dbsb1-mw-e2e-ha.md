# REQUEST — **DBSB-1 src 样板收敛刀**（runAs / job-claim 泛型 / withSavepoint + r4 退役协同）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Knife**: `harness/dbsb1-src-boiler-convergence.md` · slice `dbsb1-src-boiler-convergence.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-src-boiler` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBSB**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|---|---|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false** |
| `actualSpendCny` | **null** |

## 请审什么（mw-e2e-ha · prove 诚实/回归面/隔离与协同纪律 · Ban 假绿）

Line DBSB · 请审 REQUEST（harness §1–§10）：

1. **诚实面**：增益 claim 是否克制（纯债务清偿 · 无性能/可用性声明 · 「worker 生产包瘦身归 B3」不入本刀验收）；口径差（台账 14 份 vs 亲核 11 · 30 文件/58% vs 31 文件/45.8% · §1.5）是否如实标注且 EXEC 勘误闭环；`asRagControlExecutor`/`asScoringWorkerPrincipal` 生产调用点为 0（亲核 §1.1）这类不利/中性事实是否如实入档。
2. **等价证明的 prove 化**（§6）：P1（current_user/GUC/ROLLBACK/连接回收）+ P3（SQL 文本快照逐字符相等 + 行为断言）+ P4（23505/主动回滚/幂等重放）是否足以证明「零行为漂移」；P5 静态门（`SET LOCAL ROLE` site 数=1 · wrapper 单行委托断言 · 三 jobs 模块无内联 claim SQL）是否可证；快照等价若因模板字符串空白差不可达，降级路径（语义等价+行为断言）是否已预授权。
3. **回归面清点**：族复跑 22 项是否覆盖全部受影响运行时——principal 族 10 项（privacy-authorization/tenant-enforcement/uc052×4/四角色 prove）+ worker 2 项（pool-role-leak/checkpoint-privacy-erasure）+ job 队列 6 项 + SAVEPOINT 面 4 项；有无漏网（如 `prove:owner-drain-order`、`prove:job-wakeup`、`prove:drain`、api 侧 neg-commerce 等消费 claim/renew 面的 prove 是否应纳入）。
4. **r4 协同纪律**（§5）：B3=物理文件夹化 / 本刀=退役评估+别名保全的分工是否可执行；让位五条（本刀永不碰 r4 路径与 import · package.json prove 段本刀只读 · 双向绝不同时写 · 时序冲突顺延）是否足以防 W2 批次互踩；P6 别名解析断言在 B3 先落/后落两种序下的条件分支是否闭合。
5. **隔离与安全**：prove 走 `assertIsolatedTestTarget` + 增量迁移；Ban secrets/真实数据；收敛零 SQL 文件变更（案B 不动表）与 Ban 历史迁移（0001–0143）双保险是否可验证。
6. **状态冻结**：pins 全保留（coveredCount=8 不变 · g7SuiteGreen=false · DELETE=503）· 不关任何 e2e 门 · 不改共享 SSOT · r4 零位移（本刀面）。
7. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · Ban self-approve。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D6 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-e2e-ha · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
