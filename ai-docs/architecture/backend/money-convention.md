# 钱三轨规范（DBM3-1 冻结 · GAP-DEBT-DB-MONEY3 清偿）

> SSOT：本文件（`id-convention.md` 同级）+ `packages/db/migrations/0149_money_status_constraints.sql`（守卫双落）。
> 判据链：`ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`（硬规则 11）+ postgres skill 第 4 项（status CHECK / 金额单位）。
> 状态：**EXEC 落地**（migration 0149 + `db-money3.proof.ts` EXIT 门 · harness rev2 裁定 D1=案B / D3 / D4 / D6）。

## 1. 三轨映射表（业务量 ↔ 单位 ↔ 表 · 冻结快照 @0149 后）

| 轨 | 业务量 | 单位（列名后缀） | 表.列 | 类型 | 守卫（0149 后） | 判定 |
|----|--------|------------------|-------|------|-----------------|------|
| 轨1 法币 | 订单支付金额 | 分（`*_cents`） | `payment_order.amount_cents` | int（存量豁免 §3） | `ck_payment_order_amount_cents_positive`（>0） | 治理毕 |
| 轨2 权益 | 面试次数额度 | 次 · 2 位小数（`units` 词根） | `payment_order.units` | numeric（案B 护栏 · §3） | `ck_payment_order_units_range`（>0 且 ≤9999999999.99 且 =round(·,2)） | 治理毕 |
| 轨2 权益 | 同上 | 同上 | `entitlement_bucket.units_total/units_reserved/units_consumed` | numeric(12,2) | `>=0`×3 + `ck_bucket_capacity`（0001 既有） | 良 |
| 轨2 权益 | 同上 | 同上 | `entitlement_consumption.units_requested/units_settled` | numeric(12,2) | `units_requested>0`（0001 既有）+ status 枚举 CHECK | 良 |
| 轨2 权益 | 结算入账 | 同上 | `settlement_ledger.units_settled` | numeric(12,2) | `ck_settlement_units_settled_nonneg`（>=0 · 0149 D4） | 治理毕 |
| 轨3 模型成本 | token 计费/预算预留/结算 | 微元（`*_micro_cny`） | `ai_cost_price_book.input/output_micro_cny_per_million` · `ai_cost_budget_policy.monthly_limit_micro_cny` · `ai_cost_budget_month.limit/reserved/settled_micro_cny` · `ai_cost_reservation.*/micro_cny` · `rag_embedding_compute.reserved_micro_cny` · `*_ledger_breaker.settled_micro_cny` | bigint | 全带 `>=0`/`>0` CHECK + 容量不变量（0033 族既有） | 良 · **参照实现** |

**status 枚举面（0149 新增）**：`ai_graph_run.status` 11 值 CHECK（created/active/waiting_user/migrating/paused/quarantined/safe_terminating/safely_terminated/succeeded/completed/failed · D6 全收 · 枚举只增不改）——守卫 `uq_active_run` partial unique 不变量（脏 status 落谓词外=同 (graph,thread) 双活 run 静默失效，此前无闸）。

## 2. 新表规范（一刀冻结）

1. **法币金额**：一律 `bigint` **分单位整数**，列名**必须带单位后缀** `*_cents`（币种入列注释）；禁 float/double/裸 numeric 存法币。
2. **模型成本**：一律 `bigint` 微元 + `*_micro_cny` 后缀（0033 族为参照实现：`>=0` CHECK + 容量不变量样板）。
3. **权益计次**：一律 `numeric(12,2)`（2 位小数锚定 · 与落点 `entitlement_bucket` 对齐）+ `units` 词根 + 语义注释（1.00=一次 · 0.50=降级半次）。
4. **符号守卫强制**：计费额 `CHECK (>0)` · 余额/存量类 `CHECK (>=0)` · 容量型不变量用表级命名 CONSTRAINT（`ck_*` 前缀 · 同 `ck_bucket_capacity` 式）。
5. **status 枚举强制**：状态列一律 `CHECK (status IN (…))` 具名 `ck_<table>_status`；枚举只增不改（增值=新迁移 · 改语义=业务变更须另立项）。
6. **登记制**：任何新钱列/额度列/status 词表接入前须在本表登记单位与守卫——未登记即用 = 违规（fail-closed 在文档层 · 同 `id-convention.md` §3 前缀注册表制）。

## 3. 存量豁免与登记（append-only · 零回填）

- `payment_order.amount_cents` **int 不升 bigint**（D5 豁免）：int 容量 2^31-1 分 ≈ ¥21,474,836/单笔（目录价 9900/24900 · 量级余量充足）；升级=全表 rewrite 违零触碰纪律 → 新表按 §2 用 bigint，本列保留 int + 正数 CHECK。
- `payment_order.units` **保留 numeric（无 typmod）+ 案B 护栏**（D1 裁定 · 两席一致）：`ALTER TYPE numeric(12,2)` 需 rewrite + ACCESS EXCLUSIVE 锁窗 + 存量 typmod 静默舍入风险（若存在 >2 位小数行则改值）→ CHECK-only 逻辑等价（>0 · ≤9999999999.99 · =round(·,2)）零锁零触碰；typmod 硬收敛留 HYGIENE 后续刀评估。
- `succeeded`/`completed` 双终态并存保留（kernel 纪元 vs 服务纪元 · Ban 本刀收敛 · 枚举只增不改的首例体现）。
- `consumption_record` **无 CHECK**（rev2 裁摘除）：GAP-DEBT-DB-HYGIENE 登记「死表在产」，DBHY-1 裁 DROP 先行——两刀对齐，不为将死之表加约束。
- `settlement_ledger.units_settled` 语义 = 落账额（confirm 按比例可为 0）→ `>=0` 而非 `>0`（D4）。
- 其余无 CHECK status 列（interview/memory/ctx/checkpoint 族 · harness §3.3 亲核清单）登记台账，非 MONEY3 行面。

## 4. 22003 落点链（台账证据 · 治理前后）

`payment_order.units`（裸 numeric · 任意值合法）→ 支付回调 `markOrderPaidAndCredit`（`packages/db/src/payment.ts:84`）`INSERT INTO entitlement_bucket(..., units_total)`（numeric(12,2) · 上限 9999999999.99）→ 超 10 位整数值 = SQLSTATE 22003 → 回调事务（CAS+发桶）整体回滚 → 订单永久卡 created · 回调持续 5xx。
**0149 后**：脏 units 在**下单时**即 23514 拒绝（案B 护栏）——炸点前移到写入口，回调链不再可达 22003。

## 5. prove 门（EXIT=0 硬保证）

`pnpm db-money3:prove`（`packages/db/test/db-money3.proof.ts`）：P0 负样本自证（基线态 SAVEPOINT 注入→0149 RAISE→回滚→干净重跑）· P1 catalog 具名断言（含 consumption_record 负门）· P2 负值/脏值 23514（含案B 形态 units=1.005）· P3 三表真实写路径回归（payment_order 全链/entitlement saga/interview_event 幂等）· P4 uq_active_run 不变量+双终态并存 · P5 L1/L2 联动静态门 · P6 0149 语句白名单静态门 · P7 对表勾销块。
