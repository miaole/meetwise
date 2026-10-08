# Slice — **DBHY-1** · GAP-DEBT-DB-HYGIENE 卫生刀（死表/sql/ 退役/分区生命周期/jsonb 路线图 · REQUEST 阶段）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST 完成 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Rev**: **rev2**（双审 FAIL 唯一项修订：sql/ 清单补 _neg-harness 模板路径加载器+build-cloud-test-fc 整目录拷贝+run-e2e-isolated manifest 点名 → 15→18 处·P3 门改全代码面文件名模式 grep·迁移号让位序 0145+0146·consumption_record 让位 DBM3-1 · rev1 = `f4f320cd` · 落卷 mw-core）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · Ban self-approve · Dual PASS ≠ 开工 · 须 meetwise 明示授权）
**Parent tip**: `48dee7a2`（branch `line/db-hygiene`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/dbhy1-db-hygiene.slice.md` |
| REQUEST（harness） | `ai-docs/delivery/harness/dbhy1-db-hygiene.md` |
| Dual stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbhy1-mw-model-op.md` |
| Dual stub · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbhy1-mw-e2e-ha.md` |

## One-line scope

DB 卫生四件套 REQUEST（债行 `gap-bug-backlog.md:878` 首刀）：① 死表 `app_setting`/`consumption_record` 处置两案（建议 drop·测试改查 `entitlement_consumption`·**让位序：DBHY-1 DROP 先行·DBM3-1 摘除该表 CHECK 项——协调方 rev2 裁定两刀一并落**）；② `packages/db/sql/`（25 文件·0019 自述曾致 fresh deploy 炸·十月 bb97e837 仍在双写）退役计划三案（建议单刀一步：**18 处消费方**改 runMigrations——含 rev2 补的 `_neg-harness.ts:61-70` 模板路径整载 22 文件+23（neg 族命脉·可让刀另迁）·`build-cloud-test-fc.mjs:28` 整目录拷贝·`run-e2e-isolated.mjs:155/:176/:188-189` manifest 点名——删目录+drift:prove·内容并入 migrations 声明）；③ qbank retired 代清理例程 `qbank_release_retired_generation_storage`（DETACH+DROP·三重守卫·元数据保留·与 G-R4-5 闭面关系硬声明）；④ jsonb 四老列（interview.questions/assessment_report.dimensions/learning_plan.items/career_path.milestones）只立规范+deprecated 标注·拆表路线图另刀。**迁移号让位序（协调方 rev2 裁定·按 EXEC 就绪序）：DBTF-1 已 EXEC 占 0144 → DBHY-1 顺延 0145+0146（0145 死表域/0146 qbank 域·EXEC 须先与 DBTF-1 0144 汇流）·DBFK-1 0147+0148·DBM3-1 0149**。Prove `dbhy1.proof.ts`：退役后全绿+fresh deploy 重建（runner 实测）+**P3 全代码面文件名模式 grep（堵模板路径盲区）**。Ban 历史迁移改写/G-R4-5 重开/secrets。

## Hard pins

- pins 十值全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban 历史迁移改写**（0001–0143 一字不动·checksum 链不破·处置一律新迁移 0145/0146——让位序 rev2·见 One-line scope）
- **Ban G-R4-5 已闭面重开**（不碰检索四函数/active 代/serving scope·`coveredCount=8` 不重述）
- **Ban secrets** · **Ban 触发器族改动**（TRIGFAM 另刀）· **Ban 自动清理调度** · **Ban MySQL/Qdrant 重开叙事**
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `0145`（死表域·与 DBTF-1 0144 汇流后落号）：死表 DROP/COMMENT（按 D1/D2 裁定）+ sql/→migrations 承载声明头 + 四 jsonb 列 DEPRECATED COMMENT（若 D5=确认）
2. `0146`（qbank 域）：`storage_released_at` 列 + `qbank_release_retired_generation_storage`（若 D4=落）
3. 删 `packages/db/sql/`（25 文件）+ `scripts/schema-drift-check.mjs` + root `drift:prove`（若 D3=B'：sql/ 保留至 neg 迁移另刀·#16 登记留卷）
4. §3.2 **十八处**消费方逐点改造 → `runMigrations` 前缀（validate/ai-runtime×6/neg-bend/uc-e2e-025-bound/uc-e2e-028/rag-demo/qbank-ingest/adaptive-latency/vectorstore + **rev2 补：`_neg-harness.ts` 模板路径整载（neg 族命脉）·`build-cloud-test-fc.mjs:28` 整目录拷贝停运·`run-e2e-isolated.mjs:155/:176/:188-189` manifest 点名替换**）
5. 死面摘除：`migrate.proof.ts` 示范改挂新对象 · `db-id-v7.proof.ts:38` 删行 · `runtime-kernel.proof.ts:78`+两处 count 测试改查 `entitlement_consumption`
6. `packages/db/test/dbhy1.proof.ts` + `dbhy1:prove`（P1–P6 · harness §5 · 含 fresh deploy runner 实测 + P3 全代码面文件名模式 grep）
7. `id-convention.md`/schema 规范：jsonb 边界 + 四列例外登记
8. post-prove 双审 → meetwise 授权 nail → 债行勾销「死表/sql/」项

## Decision points（双审裁定）

D1 app_setting 案A drop（建议）vs 案B 标注 · D2 consumption_record 案A' drop+测试改真表（建议·**让位序 DBM3-1 摘 CHECK——rev2 裁定**）vs 案B' 标注 · D3 sql/ 案A 单刀一步 18 处（建议）vs 案B 两步冻结 vs 案B' neg 族让刀（#16 留另刀·17 处照迁）· D4 qbank 例程本刀落函数 0146（建议）vs 仅设计留卷 · D5 jsonb 仅规范+标注拆表另刀（建议确认）。

## Non-claims

≠HA · ≠suite green · ≠G-R4-5 重开/加成 · ≠W1/W1b/dbid1 闭面重开 · ≠历史迁移改写 · ≠qbank serving 面变更 · ≠MySQL/Qdrant 重开 · ≠jsonb 拆表执行 · ≠自动清理 · ≠coding authorized（coveredCount=8 不变）。
