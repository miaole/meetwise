# Slice — **DBM3-1** · GAP-DEBT-DB-MONEY3 钱三轨 + 约束治理刀（REQUEST 阶段）

**Status**: **`rev2:pre_exec_dual_pass`**（双席 PASS + 裁定落卷 · **awaiting meetwise EXEC authorization** · 未编码 / zero migration / zero prove）
**Rev**: **rev2**（双席裁定落卷：D1 案B CHECK-only·D2 consumption_record CHECK 摘除（DBHY-1 DROP 先行）·D3 删 0027 保 0021·D4 入·D6 全收·迁移顺延 0149（DBTF-1=0144/DBHY-1=0145+0146/DBFK-1=0147+0148 让位序）·N1 P0 负样本自证移 0143 基线·N2 措辞勘误 · rev1 = `53e7939f` · 落卷 mw-core）
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

钱三轨治理 REQUEST rev2：`money-convention.md` 规范（三轨映射表 业务量↔单位↔表 + bigint 分单位 + 列名单位后缀 · id-convention 同级）· 新迁移 **0149** 补正数 CHECK（amount_cents>0 · 前置脏值检测 fail-loud）+ `ck_payment_order_units_range`（D1 裁**案B CHECK-only**·零 ALTER TYPE）+ status 枚举 CHECK（ai_graph_run 11 值亲核词表·D6 全收；consumption_record CHECK **rev2 摘除**——DBHY-1 DROP 先行）+ interview_event 双重唯一删 0027 约束保 0021 partial（D3 裁定 · ON CONFLICT 实际 arbiter 亲核 · 联动 drift:prove fixture 对齐 + migrate.proof:307 契约更新）· prove `db-money3.proof.ts` EXIT=0（P0 负样本自证移 0143 基线 SAVEPOINT 形态 + P2 负值 23514 拒绝 + P3 三表回归 payment_order/entitlement_bucket/interview_event）。

## Hard pins

- pins 全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban 改历史迁移**（0001–0143 一字不动 · 0143 双文件编号只登记）· **Ban 业务语义变更**（枚举不收敛 · succeeded/completed 并存保留）
- **Ban RLS/secrets/触发器面** · **Ban 洗存量数据**（脏行只上报不修）· **Ban 改共享 SSOT**（台账只勾 MONEY3 行）
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `packages/db/migrations/0149_money_status_constraints.sql`（rev2 顺延定号）：前置脏值检测 DO 块 + `ck_payment_order_amount_cents_positive` + `ck_payment_order_units_range`（D1 案B）+ ai_graph_run 11 值枚举 CHECK + `ck_settlement_units_settled_nonneg`（D4 裁入）+ `DROP CONSTRAINT uq_interview_event_key_constraint`；consumption_record CHECK **不含**（rev2 摘除）
2. `packages/db/sql/01_schema.sql`：interview_event 表级 `uq_event_key` 约束 → 0021 同形 partial index（drift:prove 方向约束 L1）
3. `packages/db/test/db-money3.proof.ts`（P0–P7 · harness §4）+ wiring 四点（root package.json ×2 · packages/db ×1 · run-e2e-isolated.mjs ×4 注册点含 migrate allowlist L4）
4. `packages/db/test/migrate.proof.ts:307` 断言契约更新（0027 约束存在 → 0149 后终态 · L2）
5. `ai-docs/architecture/backend/money-convention.md`（三轨映射表 + 新表 bigint 分单位规范 + 豁免登记）
6. post-prove 双审 → meetwise 授权 nail → 台账 MONEY3 行勾销

## Decision points（双审裁定）

D1 units 精度（rev2 裁**案B CHECK-only**·案A 登记不做）· D2 consumption_record 枚举（rev2 裁**摘除出刀**——DBHY-1 DROP 先行）· D3 删 0027 保 0021（rev2 确认 · 联动 L1/L2）· D4 settlement_ledger>=0 入刀（rev2 确认）· D5 amount_cents 不升 bigint（豁免登记）· D6 枚举 11 值全收词表（rev2 确认）。

## Non-claims

≠HA · ≠suite green · ≠SLO/性能量化声明 · ≠存量数据修复 · ≠业务语义变更 · ≠RLS/secrets 面 · ≠死表下线（consumption_record 归 HYGIENE）· ≠coding authorized · ≠覆盖任何 e2e 门（coveredCount=8 不变）。
