# UC-011 旧 ADV prove 基线红登记·18 臂（02·2026-10-26 EXEC tip 行使·前提过时定性）

**命令**：`pnpm uc011:adv:prove`（→ `scripts/run-e2e-isolated.mjs uc011:adv:prove:raw` → `pnpm -C apps/api prove:uc011-adv-refund-callback`）
**proof**：`apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts`（blob `888264792e6b` 恒等·Line V honesty-of-red 首注册·18 臂）·INV 腿（:85-:94 区）断言「payment.ts 无 markOrderRefunded / webhook 仅 @Post(pay/:id) 无 refund 路由 / commerce.service 无 refundCallback/refundWebhook」——与现树产品双口（`POST /payment/refund-callback` + Path A `POST /commerce/webhook/refund/:id` → 同一 `refundWebhook` 单管道）**相反**。

## 结果（EXIT 原值·如实登记·不修不洗不 retry）

- **EXIT=1**
- **断言合计： 18 条, 失败 4 条**（INV: 3 FAILED · A1: ALL PASS · A2: 1 FAILED）
- 失败明细（run 原样 GAP-ITEM）：
  - leg=INV assertion="payment.ts 无 markOrderRefunded / refundOrder / applyRefund"
  - leg=INV assertion="webhook 仅 @Post(pay/:id)，无 refund 路由"
  - leg=INV assertion="commerce.service 无 refundCallback / refundWebhook"
  - leg=A2 assertion="首回调可达且非-404（合法退一次的执行面存在）"
- run 原样结语：`GAP-UC011-ADV-01 — 诚实保留 gap（EXIT 1 · 非 flake · 非环境问题）`·`CMD=pnpm uc011:adv:prove EXIT=1`

## 定性（§0.2-4 承续·§1.3-4 否决面遵守）

**前提过时非产品回归**：该 proof 陈旧清单在「口缺失」前提下编写；现 tip 双口在树且 68/68+41/41 隔离收据全绿（本目录 00/01 两件），故此红=**反向证明产品口已落**（其 INV 断言「无 refundWebhook」被现树事实否定）。零产品码改动·零 proof 改断言凑绿·零删除·退役/重锚归另议（§1.3-4）。

## attempt 台账（逐次如实·Ban retry-to-green）

| attempt | 时点（UTC 2026-10-26） | EXIT | 臂计 | 隔离 PG | 判定 |
|---------|------|------|------|---------|------|
| #1 | 18:06 区间 | **1** | 14/18 · 失败 4（INV×3+A2×1） | `meetwise-e2e-70491-1793037979722`（`pgvector/pgvector:pg16`·state/logs 凭条 `ISOLATED_POSTGRES_OUTPUT_WITHHELD`） | 预期基线红·单跑登记·不 retry |

## 隔离与环境

- 隔离真 PG（colima/docker）·`run-e2e-isolated` 允许表在表（`uc011:adv:prove:raw`）
- 零 live provider key·零模型外呼·零 secrets·零生产操作 · est live=0 · actualSpendCny=null
- `LOCAL_ISOLATED_PROOF_RECEIPT` 机器凭条：`.tmp/isolated-proof-receipts/2026-10-26T18-06-23-389Z-70491-*.json`（release_evidence=false·untracked 不入 diff 面）

**EXIT=1 不构成任何门**：本件为诚实登记非门矩阵臂（§2 门 4 仅 68+41 双收据）·coveredCount=8 不变·行状态零翻。
