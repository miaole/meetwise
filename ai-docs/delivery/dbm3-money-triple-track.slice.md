# Slice — **DBM3-1** · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀（REQUEST 阶段）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST 完成 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · Ban self-approve · Dual PASS ≠ 开工 · 须 meetwise 明示授权）
**Parent tip**: `48dee7a2`（branch `line/db-money3`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/dbm3-money-triple-track.slice.md` |
| REQUEST（harness） | `ai-docs/delivery/harness/dbm3-money-triple-track.md` |
| Dual stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbm3-mw-model-op.md` |
| Dual stub · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbm3-mw-e2e-ha.md` |

## One-line scope

钱三轨治理 REQUEST：`money-convention.md` 规范（三轨映射表 业务量↔单位↔表 + bigint 分单位 + 列名单位后缀 · id-convention 同级）· 新迁移 0144 补正数 CHECK（amount_cents>0 · 前置脏值检测 fail-loud）+ status 枚举 CHECK（ai_graph_run 11 值亲核词表 / consumption_record 镜像孪生 4 值）+ units 升 numeric(12,2) **两案交双审**（案A rewrite 含存量静默舍入风险 / 案B CHECK-only 零触碰）+ interview_event 双重唯一删 0027 约束保 0021 partial（ON CONFLICT 实际 arbiter 亲核 · 联动 drift:prove fixture 对齐 + migrate.proof:307 契约更新）· prove `db-money3.proof.ts` EXIT=0（P0 脏值检测先行 + P2 负值 23514 拒绝 + P3 三表回归 payment_order/entitlement_bucket/interview_event）。

## Hard pins

- pins 全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban 改历史迁移**（0001–0143 一字不动 · 0143 双文件编号只登记）· **Ban 业务语义变更**（枚举不收敛 · succeeded/completed 并存保留）
- **Ban RLS/secrets/触发器面** · **Ban 洗存量数据**（脏行只上报不修）· **Ban 改共享 SSOT**（台账只勾 MONEY3 行）
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `packages/db/migrations/0144_money_status_constraints.sql`：前置脏值检测 DO 块 + `ck_payment_order_amount_cents_positive` + ai_graph_run 11 值枚举 CHECK + consumption_record 4 值枚举 CHECK +（D4）settlement_ledger.units_settled>=0 + `DROP CONSTRAINT uq_interview_event_key_constraint` +（仅 D1 案A）`ALTER COLUMN units TYPE numeric(12,2)`
2. `packages/db/sql/01_schema.sql`：interview_event 表级 `uq_event_key` 约束 → 0021 同形 partial index（drift:prove 方向约束 L1）
3. `packages/db/test/db-money3.proof.ts`（P0–P7 · harness §4）+ wiring 四点（root package.json ×2 · packages/db ×1 · run-e2e-isolated.mjs ×4 注册点含 migrate allowlist L4）
4. `packages/db/test/migrate.proof.ts:307` 断言契约更新（0027 约束存在 → 0144 后终态 · L2）
5. `ai-docs/architecture/backend/money-convention.md`（三轨映射表 + 新表 bigint 分单位规范 + 豁免登记）
6. post-prove 双审 → meetwise 授权 nail → 台账 MONEY3 行勾销

## Decision points（双审裁定）

D1 units 精度案A(ALTER TYPE·rewrite·存量舍入风险须前置证明)/案B(CHECK-only)（建议案B）· D2 consumption_record 枚举镜像 4 值（建议镜像）· D3 删 0027 保 0021（建议正向 · 联动 L1/L2）· D4 settlement_ledger>=0 入刀（建议入）· D5 amount_cents 不升 bigint（建议豁免登记）· D6 枚举 11 值全收词表（建议全收）。

## Non-claims

≠HA · ≠suite green · ≠SLO/性能量化声明 · ≠存量数据修复 · ≠业务语义变更 · ≠RLS/secrets 面 · ≠死表下线（consumption_record 归 HYGIENE）· ≠coding authorized · ≠覆盖任何 e2e 门（coveredCount=8 不变）。
