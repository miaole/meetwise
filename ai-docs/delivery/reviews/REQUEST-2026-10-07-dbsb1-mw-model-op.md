# REQUEST — **DBSB-1 src 样板收敛刀**（runAs / job-claim 泛型 / withSavepoint + r4 退役协同）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-model-op`
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

## 请审什么（mw-model-op · src 语义等价/工厂参数化面/漂移复发防线 · Ban 假等价）

Line DBSB · 请审 REQUEST（harness §1–§10）：

1. **runAs 语义等价面**（§1.1/§2）：11 份样板清单是否全（principal.ts 10 + scoring-fact-root 漂移 1 · 台账 14 vs 亲核 11 口径差 §1.5 是否可接受）；「薄别名委托 → 调用点零改动」是否足以证明行为等价（P1 current_user/GUC/ROLLBACK/连接回收断言 + wrapper 体 diff 对照是否闭环）；`opts.principalUser` GUC variant 是否会把 asPrincipal/asPrivacyWorkerPrincipal 与非 GUC variant 的语义面混淆；D3（provisionQbankControlDefiner 特判不收敛）是否同意。
2. **job 工厂参数化面**（§1.2/§3）：interview 独有守卫（advisory xact lock · `interview_privacy_active` 谓词 · 僵尸兄弟守卫 · per-owner inflight 上限 · `payload-'answer'` 擦除）是否真能被 `extraClaimPredicates`/`scrubPayloadOnTerminal` 等参数无损承载——参数化后 SQL 文本快照逐字符等价（P3）是否可达，还是应降级为「语义等价+行为断言」；案B（不动表）vs 案A（多态表+kind 列）取舍（D4）——B 是否会锁死 A（本刀声称不锁死 · §3）。
3. **withSavepoint 形状**（§1.3/§4）：4 实例点最大公约（23505 吞/非 23505 rethrow/RELEASE 次序）+ #3 业务半途回滚 sentinel 通道——util 形状是否会把 payment 退款「红冲不足→conflict」的确定码路径改漂；落点 principal.ts（D5）是否破坏其「无业务依赖事务原语」定位（savepoint 是通用原语还是业务面？）。
4. **prove 覆盖足度**（§6）：P2 导出面冻结（编译期契约+typeof 对拍）能否真挡调用面漂移；族复跑 22 项（principal/角色/job 队列/SAVEPOINT 四族）是否漏了受影响面（如 `prove:interview-dispatch` 非 pg 版、`commerce-reconcile`、`adaptive-*` 队列消费面）。
5. **r4 协同声明**（§5）：本刀 r4 面 docs-only + B3 物理迁 + 让位五条 + 任意先后序皆安全——从模型操作面看是否有 B3/DBSB-1 双写 package.json 的残余冲突；退役评估「可退役集/永续集」判定权归属是否清（standing authorize/SSOT pin 永续面）。
6. **Ban 面**（§7）：RLS/角色供给语义（provision*+assert* 逐字节不动 · 唯一例外 assertRagControlDefinerOwnership 壳委托 D2）/历史迁移/擦除链/secrets——例外面是否应收敛为零。
7. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · Ban self-approve。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D6 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-model-op · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
