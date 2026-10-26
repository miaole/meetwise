# UC-011 Path A mouth 隔离收据·41 臂（01·2026-10-26 EXEC tip 行使）

**命令**：`pnpm uc011:refund-callback:prove`（→ `scripts/run-e2e-isolated.mjs uc011:refund-callback:prove:raw` → `pnpm -C apps/api prove:uc011-refund-callback-mouth`）
**proof**：`apps/api/test/uc-e2e-011-refund-callback-mouth.proof.ts`（blob `b3301f6273ee` 恒等）·口=`POST /commerce/webhook/refund/:id`（Line Z·`@Post('refund/:id')` · `commerce-webhook.controller.ts` blob `2b9766020ac4` 恒等）·B-1 pins：403 `bad_signature` · 400 `invalid_callback` · 404 `order_not_found`≠mouth-missing · amount DISCLOSED · M1 `refunded` · M2 `already`。

## 结果（EXIT 原值）

- **EXIT=0**（首跑绿·未 retry）
- **断言合计： 41 条, 失败 0 条**（SIG/INV/NF/AMT/M1/M2/M2x 七组 ALL PASS·`^PASS` 直数 41）
- HONESTY 落款（run 原样）：`EXIT0≠covered · ADV not closed · UC-011 stays partial · coveredCount=8 · GAP-UC011-ADV-01 stays OPEN`
- `EXIT=0 — Path A B-1 pins 全命中（41 条）。口=POST /commerce/webhook/refund/:id`

## attempt 台账（逐次如实）

| attempt | 时点（UTC 2026-10-26） | EXIT | 臂计 | 隔离 PG | 判定 |
|---------|------|------|------|---------|------|
| #1 | 18:06 区间 | **0** | 41/41 · 失败 0 | `meetwise-e2e-70235-1793037967867` @ 127.0.0.1:32867（`pgvector/pgvector:pg16`） | 首跑绿·收据即本件 |

（本件为独立完整三层壳行使·与 68 收据 ZREG 组成臂内层读数同值互证 41/41；attempt 各记各 run 不互混。）

## 隔离与环境

- 隔离真 PG（colima/docker）·`run-e2e-isolated` 允许表在表（`uc011:refund-callback:prove:raw`）
- 零 live provider key·零模型外呼·零 secrets·零生产操作 · est live=0 · actualSpendCny=null
- `LOCAL_ISOLATED_PROOF_RECEIPT` 机器凭条：`.tmp/isolated-proof-receipts/2026-10-26T18-06-11-559Z-70235-*.json`（release_evidence=false·untracked 不入 diff 面）

**EXIT0 ≠ covered**：本收据不翻任何行·coveredCount=8 不变·ADV stays gap/case-only。
