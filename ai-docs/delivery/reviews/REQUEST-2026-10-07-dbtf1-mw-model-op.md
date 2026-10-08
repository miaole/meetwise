# REQUEST — **DBTF-1 触发器函数族收敛刀**（公共函数库 + 版本 diff 对齐证明）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-model-op`
**Knife**: `harness/db-trigfam-unify.md` · slice `db-trigfam-unify.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-trigfam` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBTF**

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

## 请审什么（mw-model-op · schema/迁移/SQL 正确性 · Ban 假绿）

Line DBTF · gap-bug-backlog `GAP-DEBT-DB-TRIGFAM` P0（W2 首刀）。请审 REQUEST（harness §0–§8 + 附录 A）：

1. **审计真伪**：423 个 `CREATE OR REPLACE FUNCTION`/55 名 ≥2 份/78 多余份 vs 协调方 419/≈40 的口径差（§1.4）· 四簇版本链与终端判定（§1.2：状态机 0028→0046→0051→0082 · ai_cost 0033→0034→0035→0036→0083 · ann_search 0029→0067→0106→0138+0139 ALTER · definer 0070→…→0089 白名单 4→15 · erasure 0048→0058→0096 · gateway 0040→0128→0132 五臂→六臂）是否与你对 `48dee7a2` 的认知一致。
2. **库布局 D1**：案 A `_shared` schema vs 案 B public `tf_` 前缀——mw-core 建议案 B（零 schema USAGE/ACL 面 · 既有 pinned `search_path` 天然解析 · rag/qbank 封印 schema 警备面不可见）；请从 schema 治理角度裁定。
3. **收敛语义**（§2.2）：Tier-1 终端函数同签名薄壳换体——名/schema/签名/SECURITY DEFINER/pinned search_path/ACL/owner 全保形 · 挂接点零变（0144 零触发器语句）· 演进规则冻结（ALTER 或新名版本化 · Ban 同名重贴 · 0139 先例）是否成立；薄壳委托在触发器路径（per-row）的额外开销是否可接受。
4. **状态机 D2**：0028/0046/0051/0082 语义差异表（§2.3）真伪与完整性 · 方案 U（统一=0082 终端语义+`job_application_transition_rule` 表驱动）vs 方案 K（era 差异化）——mw-core 建议U（fresh 重放本就 0082 · 无旧代消费者）；请裁定并确认差异表无漏轴。
5. **ai_cost 族面**（§1.2-② · D4）：弃用旧签（7 参/4 参/8 参）原样保留不收尸 · 0083 9 参终端（`ai-cost-governance.ts:43` 唯一调用点保形）——是否同意。
6. **prove 契约**（§4）：P1 catalog 全等（100 挂接点+函数元数据 0143 vs 0144 基线差分）· P2 状态机逐轴+异常码逐字 · P3 公式对齐（0051 重放夹具矩阵）· P4 伴族回归 · P5 既有 prove 复跑七项（D7 足量性请你裁）· P6 静态契约门（历史零字节/零 UPDATE/零触发器语句）· P7 库形状门——断言集是否足以证明「终端版行为=公共版行为」。
7. **硬 Ban 面**（§5）：历史字节/挂接点/RLS/幂等键/seals/封印/0082 冻结——确认无越界。
8. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留 · Ban retry-to-green。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D8 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-model-op · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
