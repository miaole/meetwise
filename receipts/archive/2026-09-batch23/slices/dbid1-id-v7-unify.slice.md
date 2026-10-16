# Slice — **DBID-1** · 数据库 ID 统一优化刀（UUIDv7 渐进收敛 · REQUEST 阶段）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST 完成 · **未授权 EXEC** · zero coding / zero migration / zero prove）  
**Date**: 2026-10-08  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null  
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · Ban self-approve · Dual PASS ≠ 开工 · 须 meetwise 明示授权）  
**Parent tip**: `0fe96fca`（branch `line/db-id-v7-unify`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/dbid1-id-v7-unify.slice.md` |
| REQUEST（harness） | `ai-docs/delivery/harness/dbid1-id-v7-unify.md` |
| Dual stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-08-dbid1-mw-model-op.md` |
| Dual stub · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-08-dbid1-mw-e2e-ha.md` |

## One-line scope

DB 主键三纪元收敛 REQUEST：A 级 55 张 `DEFAULT gen_random_uuid()` 全清单切 `uuidv7()`（零回填·列类型不变）· B 级 `ids.ts` 工厂统一 18 个 `randomUUID()` 生成点（B1 前缀 15 + B2 uuid 显式 3）· C 级 ID 规范+前缀注册表 · Prove `db-id-v7.proof.ts` EXIT=0 · Ban 存量行改写/列类型/FK/RLS/幂等键/触发器。

## Hard pins

- pins 全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban 存量行 ID 改写/回填**（append-only · v4 行与 40 字符 text 行原样保留）
- **Ban 列类型/FK/RLS/权限面变更**（A 级仅 `SET DEFAULT`）
- **Ban 碰 idempotency_key 语义** · **Ban 碰已闭触发器（0020/0046 配对面）** · **Ban 改共享 SSOT** · **Ban secrets**
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `packages/db/migrations/0143_db_id_v7_unify.sql`：`uuidv7()` + `uuidv7_from_parts()`（prove KAT 用）+ 55 条 `ALTER … SET DEFAULT`（清单=harness §2.3）
2. `packages/db/src/ids.ts`：`newEntityId(prefix)`（白名单 fail-closed · `<prefix>_<32hex>` · 同 ms 计数器单调）+ `newUuidV7()`（连字符形态）· `index.ts` 导出
3. 18 替换点：harness §3.2（B1 15 点）+ §3.3（B2 3 点）· 排除面按 §3.4 登记（`qgen-`/裸 uuid text 5 点/非 id token 面）
4. `packages/db/test/db-id-v7.proof.ts` + `package.json` `db-id-v7:prove`（P1–P6 · harness §5）
5. `ai-docs/architecture/backend/id-convention.md`（C 级规范 + 前缀注册表）
6. post-prove 双审 → meetwise 授权 nail

## Decision points（双审裁定）

D1 A 面全 55 vs 最小面（建议全 55）· D2 `qgen-` 排除（建议确认）· D3 裸 uuid→text 5 点残留（建议登记）· D4 32hex 长度修正（建议确认）· D5 B2 并入（建议确认）。

## Non-claims

≠HA · ≠suite green · ≠SLO/性能量化声明 · ≠存量迁移 · ≠coding authorized · ≠覆盖任何 e2e 门（coveredCount=8 不变）。
