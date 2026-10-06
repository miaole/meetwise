# Harness — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove**（Line AN-RAG-R3 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · PG-retained · Ban MySQL FULLTEXT · Ban Qdrant cutover）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove · Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`110532e`** / full `110532e81f11064e543bc9bc420b67bb2f95ae1e`（includes AN-PRIV-EXT + AN-PERF-TEAR REQUEST ancestors · Ban touch sibling AN files · Ban re-open AG/AI/AK · Ban AN-CIMG-EA）
**Wave**: Line **AN** REQUEST wave（this = **AN-RAG-R3**）
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **GAP-RAG-03（AN-RAG-R3）· R3 过滤落点 ADR + Top-K 前硬过滤 prove 轨**（`qbank_serving_scope` + hybrid · 离开纯 `to_tsvector` 叙事须书面定案 · **禁止 MySQL FULLTEXT 冒充** · **Ban Qdrant cutover** this knife · **PG-retained**）
**Gap id**: **`GAP-RAG-03`**（backlog `gap-bug-backlog.md:71` · P0 · OPEN · 本 REQUEST 不翻行）
**Related（只读）**: `m4-rag-hard-gates.md` §4 R3 · `adr-postgres-retained.md` · GAP-RAG-02 R2 structural CLOSED（≠ R3 closed）

## 0. 为何新开文件

`m4-rag-hard-gates.md` §4 已钉 R3 门禁语言（过滤落点 + 词法等价 · 禁 FULLTEXT 假等价）但 **本切片未关** · **不改** `hybridQbankSearch` / 0029/0106 生产 SQL。本刀 docs 开 **R3 过滤落点 ADR 补丁 + Top-K 硬过滤 prove** REQUEST（执行须 PRE BOTH + AUTHORIZE）。**Ban** 用 MySQL FULLTEXT 关 R3 · **Ban** 本刀宣称 Qdrant cutover / 向量真相已切 · **PG-retained**。

## 1. Quoted from the files（只读 · 零改写）

- backlog `:71` **GAP-RAG-03**：「`qbank_serving_scope` + hybrid 过滤落在 PG GUC + `to_tsvector` — **R3**；**禁止 MySQL FULLTEXT 冒充**」· 目标：「定案过滤落点（Qdrant payload / 关系元数据 join）+ 词法等价（Qdrant 全文或应用 BM25）；Top-K 前硬过滤 prove」。
- `m4-rag-hard-gates.md` §4：「hybrid 过滤经 GUC `app.qbank_serving_scope` 在 SECURITY DEFINER SQL **ORDER BY/LIMIT 前**硬过滤；词法通道 = `to_tsvector` + `qbank_search_terms`」·「**禁止用 MySQL FULLTEXT 冒充**原 `to_tsvector` 等价」·「本切片：只定门禁语言；**不改** `hybridQbankSearch` / 0029/0106 生产 SQL」。
- 现状锚（只读）：`packages/db/src/qbank-generation-retrieval.ts` `setServingScope` → `set_config('app.qbank_serving_scope' / …)`；`hybridQbankSearch` 在 dense/lexical/RRF 前调用；mig `0029` / `0106` `to_tsvector('simple', qbank_search_terms(…))`。

## 2. 本刀目标（docs · 授权后）

| Face | 本 REQUEST（拟） | 仍须保留 |
|------|------------------|----------|
| **Filter-locus ADR** | 书面定案：过滤落点选项（Qdrant payload filter **或** 关系元数据 join）+ 词法等价（Qdrant 全文 **或** 应用 BM25）· **PG-retained** 下不强制切栈 | Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover claim |
| **Top-K hard-filter prove** | prove：scope 过滤仍在 Top-K / ORDER BY·LIMIT **前**硬过滤（现 PG 路径或 ADR 选定路径） | EXIT0 ≠ R3 closed alone · ≠ cutover · ≠ HA |
| **Honesty** | R3 stays OPEN until ADR + prove + dual + 协调方授权 | coveredCount=8 · gR45Closed=true retained · ≠ invent |

**明确非目标（Ban）**:

- **Ban MySQL FULLTEXT** / `MATCH … AGAINST` 冒充 `to_tsvector('simple', qbank_search_terms(…))` 假等价关 R3
- **Ban Qdrant cutover** this knife（向量真相切流另门 · M4/M5 / GAP-PRIV-04 正交）
- Ban wash GAP-RAG-02 R2 structural CLOSED 为 R3 closed
- Ban invent coveredCount · Ban flip gR45 / R4/FUNNEL this knife
- Ban buy cloud · Ban Meridian · Ban secrets

## 3. prove 方案（授权后 · Ban live）

- **CMD（拟）**: 具名 R3 hard-filter prove（PRE dual 裁定；可能延伸现有 hybrid/qbank prove · **禁** FULLTEXT 假门）via 隔离壳 · Ban live Key 除非专家钉。
- **期望**: Top-K 前硬过滤可观测 · ADR 落点与实现一致 · FULLTEXT 路径 **不得** 当通过条件。
- **EXIT0** ≠ R3 closed alone · ≠ Qdrant cutover · ≠ HA · coveredCount=8。
- **EXIT1** = 诚实保留；Ban retry-to-green。

## 4. 行语义（冻结）

- backlog `:71` **GAP-RAG-03 stays OPEN** · canHonestlyFlip=false 直至 ADR+prove+dual+协调方。
- PG-retained · Ban MySQL sole relational · Ban Qdrant-as-required-vector this knife。
- 本 REQUEST 零 matrix/backlog/checklist edit。

## 5. Ban 列表

- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）
- **Ban MySQL FULLTEXT fake-equiv** · **Ban Qdrant cutover** · Ban wash R2 as R3
- Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push
- Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 碰 sibling AN 文件 · Ban product/infra code this turn

## 6. Non-claims

Not a pass · not run · not R3 closed · not cutover · not FULLTEXT equiv · not HA · not `releaseEvidence=true` · not nail · alone ≠ dual · PG-retained

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `:71` OPEN · STOP

*Harness · GAP-RAG-03 R3 filter-locus ADR + Top-K hard-filter · AN-RAG-R3 · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban FULLTEXT · Ban Qdrant cutover · PG-retained · alone ≠ dual · STOP*
