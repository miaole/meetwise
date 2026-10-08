# REQUEST — **DBM3-1 钱三轨 + 约束治理刀**（GAP-DEBT-DB-MONEY3 · 正数 CHECK + status 枚举 + 双重唯一索引删一）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Knife**: `harness/dbm3-money-triple-track.md` · slice `dbm3-money-triple-track.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-money3` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBM3**（台账 gap-bug-backlog.md:877 · P1）

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

## 请审什么（mw-e2e-ha · prove 诚实/回归面/隔离纪律 · Ban 假绿）

Line DBM3 · 请审 REQUEST（harness §1–§8）：

1. **诚实面**：增益 claim 是否克制（仅「DB 层 23514 结构性拒绝 + 22003 前移至下单时 + 每笔事件少一唯一 btree」——无 SLO/压测量化声明）；consumption_record 死表张力（HYGIENE 台账在产登记 · 本刀不判生死 §1.4）与 0143 双文件编号（L3 只登记）这类不利/杂音事实是否如实入档。
2. **prove 契约可执行性**（§4）：P0 脏值检测先行（含**负样本注入自证**——检测器先证明能红才算数）· P2 负值/脏值 23514（及案A 22003 落点回归）· P3 三表写路径真行为回归（payment_order 下单→回调→发桶→幂等重放 / entitlement_bucket saga 容量不变量 / interview_event appendEvent 重复 eventKey 返既有 seq + 无 eventKey 连写）· P4 uq_active_run 23505 fencing——断言集与样本量是否足以证明「约束生效 + 三表零退化」；attempts 全账 + Ban retry-to-green 纪律是否闭环。
3. **回归面清点**：DROP CONSTRAINT 0027 后 appendEvent 全库 45 调用点（qbank-miss/quiz-lifecycle/diagnosis-consumer/SSE 投影族）幂等路径零扰动是否可证（ON CONFLICT arbiter=partial 亲核 interview-event.ts:32）；commerce 回调/退款（payment.ts markOrderPaidAndCredit/markOrderRefunded 红冲链）在正数 CHECK 下行为不变（catalog 全正价亲核）；uc-e2e-011/017/018/019 commerce prove 族回归面。
4. **联动 gate 面**（§1.6）：drift:prove（fixture 对齐 L1）· migrate:prove（:307 契约更新 L2 · checksum 零漂移）· wiring 四注册点（L4 · dbid1 attempt#0 红因=migrate allowlist 漏注册——本刀 checklist 是否已防复发）。
5. **隔离与安全**：prove 走 `assertIsolatedTestTarget` + 增量迁移到 0144（不重跑 baseline DROP 面）· Ban secrets · Ban 真实数据 · 生产脏行只上报不洗（§3.1 豁免面流程）——隔离纪律是否闭环。
6. **风险窗口**（D1 案A 若裁入）：ALTER TYPE 的 ACCESS EXCLUSIVE rewrite 窗口对部署序列/回调路径的影响评估是否充分（mw-core 建议案B 即零此面）；案B CHECK-only 的 round(units,2) 等值断言在 numeric 语义下有无假阴性。
7. **状态冻结**：pins 全保留（coveredCount=8 不变 · g7SuiteGreen=false · DELETE=503）· 本刀不关任何 e2e 门 · 不改共享 SSOT（台账只勾 MONEY3 行）。
8. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · Ban self-approve。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D6 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-e2e-ha · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
