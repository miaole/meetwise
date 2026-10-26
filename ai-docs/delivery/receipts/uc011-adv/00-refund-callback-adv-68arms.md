# UC-011 ADV 主口隔离收据·68 臂（00·2026-10-26 EXEC tip 行使）

**命令**：`pnpm uc011:refund-callback-adv:prove`（→ `scripts/run-e2e-isolated.mjs uc011:refund-callback-adv:prove:raw` → `pnpm -C apps/api prove:uc011-refund-callback-adv`）
**proof**：`apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts`（blob `c9ba96b69863` 恒等）·主口 `POST /payment/refund-callback`（scenarios :253 字面契约·body 白名单 `{orderId,providerTxn,sig,ts}`）·与 Path A `POST /commerce/webhook/refund/:id` 共用 `refundWebhook` 单管道。
**臂计口径**：真断言 **68**（词边界 `(^|[ (:={,])A\(` 直数 68·裸子串 `'A('` 匹配 74 系含 6 条 `PATH_A(` 误配·非断言）。七类注入 A1–A7 + 新鲜 INV + 跨入口一致性 X + ZREG 组成臂。

## 结果（EXIT 原值）

- **EXIT=0**（首跑绿·未 retry）
- **断言合计： 68 条, 失败 0 条**（INV/A1/A2/A3/A4/A5/A6/A7/X/ZREG 十组 ALL PASS）
- HONESTY 落款（run 原样）：`EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 GAP-UC011-ADV-01 ≠ §1.1 covered · coveredCount=8 不动 · UC-011 stays partial`
- PINS 落款（run 原样）：`haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=202 软删受理(purge_pending) · UC-011 stays partial · ADV stays gap/case-only · GAP-UC011-ADV-01 stays OPEN`

## attempt 台账（逐次如实）

| attempt | 时点（UTC+8 2026-10-26） | EXIT | 臂计 | 隔离 PG | 判定 |
|---------|------|------|------|---------|------|
| #1 | 18:05 区间 | **0** | 68/68 · 失败 0 | `meetwise-e2e-69918-1793037944036` @ 127.0.0.1:32866（`pgvector/pgvector:pg16`） | 首跑绿·收据即本件 |

**ZREG 组成臂口径（§9-rev P2-2）**：ZREG 臂原样子进程重跑冻结 Path A proof（proof :98）·内层读数 `PASS [ZREG] Z mouth 回归（pnpm uc011:refund-callback:prove 内层 proof）EXIT=0（实际 0）`·内层断言 41 条全绿——属本次 68 收据**组成臂**·attempt 台账随本 run 计·**不计独立 attempt**。独立 41 臂收据另立 `01-refund-callback-mouth-41arms.md`。

## 隔离与环境

- 隔离真 PG（colima/docker 亲证 `docker info` ServerVersion=29.5.2 EXIT=0 先行）·`run-e2e-isolated` 允许表在表（`uc011:refund-callback-adv:prove:raw`·scripts/run-e2e-isolated.mjs blob `1fb100ba32aa` 允许行 :2315）
- 零 live provider key·零模型外呼·零 secrets·零生产操作 · est live=0 · actualSpendCny=null
- `LOCAL_ISOLATED_PROOF_RECEIPT` 机器凭条：`.tmp/isolated-proof-receipts/2026-10-26T18-0*Z`（release_evidence=false·untracked 不入 diff 面）

**EXIT0 ≠ covered**：本收据=行为隔离验证 evidence-of-record @EXEC tip·不翻任何行·coveredCount=8 不变·ADV stays gap/case-only·GAP-UC011-ADV-01 stays OPEN。
