# REQUEST — **DBHY-1 GAP-DEBT-DB-HYGIENE 卫生刀**（死表/sql/ 退役/分区生命周期/jsonb 路线图）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-model-op`
**Knife**: `harness/dbhy1-db-hygiene.md` · slice `dbhy1-db-hygiene.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-hygiene` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBHY**（债行 `gap-bug-backlog.md:878` 首刀 · W1/W1b 预告的 separate retire knife）

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

## 请审什么（mw-model-op · schema/migration/SQL 正确性 · Ban 假绿）

Line DBHY · 债行在卷（GAP-DEBT-DB-HYGIENE · P1 · 多刀）。请审 REQUEST（harness §1–§10）：

1. **死表审计真伪**（§1.1）：`app_setting`（0002/0003 示范进产·业务代码零引用·仅 migrate.proof 冒烟）与 `consumption_record`（0001·零生产写入·仅 3 处测试 count+1 处测试 INSERT+primitives.sql 自建副本）的检索口径是否可信；幂等真身=`entitlement_consumption`（0001:109 同形唯一键·commerce.ts 生产写）认定是否成立。
2. **D1/D2 两案**（§2）：建议双双 drop（案A/A'·新迁移 0144·历史迁移一字不动）；`consumption_record` 测试改造清单（runtime-kernel INSERT 改真表·两 count 断言改 `entitlement_consumption`·dbid1.proof:38 删行·primitives.sql 豁免）是否完备、`entitlement_consumption` 是否真有所需列（若无需改断言对象·EXEC 时核）。
3. **sql/ 退役**（§3）：单刀一步（15 处消费方+删目录+删 drift:prove）vs 两步冻结——从 schema 治理角度裁定 D3；「20_resume_quiz 内容由 0007+0135 承载·只声明不新增 DDL」是否成立（drift 门长期绿=migrations 超集的前提）；ai-runtime×6 改迁移前缀后断言面更真（01_schema 镜像缺 ai_cost 族表）的说法是否属实。
4. **qbank 清理例程设计**（§4）：`qbank_release_retired_generation_storage` 三重守卫（retired/failed · 非 active 指针 · `source_epoch < 当前 corpus_epoch` 回滚窗口已死判据）+ DETACH+DROP（绕 `trg_qbank_generation_chunk_only_building` 行触发器·HNSW 随表落）+ `storage_released_at` 幂等门 + 元数据行永不抹——设计是否有隐藏破坏（如 DETACH 与并发检索/RLS/权限面的交互）；D4 本刀落函数 vs 仅留卷。
5. **G-R4-5 闭面关系**（§4.2）：不碰检索四函数/active 代/serving scope/cache epoch——确认无重开路径。
6. **jsonb 路线图**（§6）：只立规范+四列 DEPRECATED COMMENT（0144 内）·拆表另刀·P1 先行 `interview.questions`（生产零写入·唯一读点 transcript:737）——边界是否得当。
7. **prove 契约**（§5）：P1 catalog+静态 grep · P2 checksum 链 · P3 退役后 grep 0 loader · P4 fresh deploy **runner 实测**（空库→loadMigrations→runMigrations·schema_migrations 计数·expires_at/0019 四项回归·死表缺席）· P5 清理例程正负门（active 代 ann_search 不变）· P6 COMMENT——断言集是否足以证明「退役后单真相+无破坏」。
8. **硬 Ban 面**（§7）：历史迁移改写/触发器族/自动调度/MySQL 叙事/secrets——确认无越界。
9. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留 · Ban retry-to-green。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D5 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-model-op · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
