# Slice — **DBTF-1** · 触发器函数族收敛刀（公共函数库 + 版本 diff 对齐证明 · REQUEST 阶段）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST 完成 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-privacy-int`（pre-exec 双审 · Ban self-approve · Dual PASS ≠ 开工 · 须 meetwise 明示授权）
**Parent tip**: `48dee7a2`（branch `line/db-trigfam`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/db-trigfam-unify.slice.md` |
| REQUEST（harness） | `ai-docs/delivery/harness/db-trigfam-unify.md` |
| Dual stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbtf1-mw-model-op.md` |
| Dual stub · privacy-int | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbtf1-mw-privacy-int.md` |

## One-line scope

DB 触发器/SQL 函数族债务收敛 REQUEST：0144 建公共函数库单一真相源（public `tf_` 前缀 · 案 B）+ Tier-1 四族终端薄壳换体（状态机 0028/0046/0051/0082 · ai_cost 0033/0034/0035/0036/0083 · ann_search 0029/0067/0106/0138+0139 · definer ×5 · erasure ×3 · gateway ×3）+ `interview_derived_score(stream_key)` 公式抽出（休眠预注册 · 不接线）+ 表驱动状态机（0082 语义 · 规则表）+ P1–P7 版本 diff 对齐 prove（终端行为=库行为 · 100 挂接点 catalog 全等 · partial_confirmed 张力保形）· Ban 历史迁移字节/挂接点/RLS/幂等键/secrets/封印。

## Hard pins

- pins 全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban 历史迁移 0001–0143 任何字节改动**（append-only · 重贴副本永久留档）
- **Ban 触发器挂接点零变例外不许**（100 处表/列/时机/函数名全零变 · 0144 零触发器语句）
- **Ban RLS / 幂等键 / secrets / principal.ts 封印三处** · **Ban GAP-COMM-PARTIAL-PAIR 未裁先动**（0046:162-166 逐字节保形）· **Ban 0082 校准冻结解除**
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `packages/db/migrations/0144_db_trigfam_unify.sql`：`tf_` 库成员（REVOKE FROM PUBLIC · 非 SD）+ Tier-1 终端函数同签名薄壳换体（名/schema/签名/SD/search_path/ACL/owner 全保形）+ `interview_derived_score(p_stream_key text)`（0051 公式 · 休眠）+ `job_application_transition_rule` 种子表（0082 迁移闭包 · `ON CONFLICT DO NOTHING`）+ 演进规则库头注释
2. `packages/db/test/db-trigfam-unify.proof.ts` + `db-trigfam:prove` script（P1 catalog 对齐 · P2 状态机回归+partial_confirmed 保形 · P3 公式对齐 · P4 伴族回归 · P5 既有 prove 复跑七项 · P6 静态契约门 · P7 库形状门）
3. 零产品码改动（principal.ts/调用面六处零改）
4. post-prove 双审 → meetwise 授权 nail（台账行 GAP-DEBT-DB-TRIGFAM CLOSED）

## Decision points（双审裁定）

D1 库布局案 A `_shared` vs 案 B public `tf_` 前缀（建议 B）· D2 状态机 U 统一=0082 vs K 按 era 差异化（建议 U）· D3 Tier-2 长尾 41 名只立账不换体（建议确认）· D4 ai_cost 弃用旧签原样保留（建议确认）· D5 derived_score 单参 vs 双参（建议先单参）· D6 规则表引入（建议确认）· D7 P5 复跑清单足量性（model-op 裁）· D8 张力保形断言入 P2（建议确认）。

## Non-claims

≠HA · ≠suite green · ≠性能量化 · ≠历史文件清理 · ≠RLS/ACL/SD/签名/封印变更 · ≠GAP-COMM-PARTIAL-PAIR 裁决 · ≠0082 冻结解除 · ≠SCOR 交付 · ≠coding authorized · ≠覆盖任何 e2e 门（coveredCount=8 不变）。
