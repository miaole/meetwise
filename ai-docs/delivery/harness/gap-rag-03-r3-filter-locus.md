# Harness — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove**（Line AN-RAG-R3 · docs REQUEST rewrite **re-PRE** · **`draft:awaiting_pre_exec_dual`** · PG-retained · Ban MySQL FULLTEXT · Ban Qdrant cutover）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **re-PRE** · supersedes REQUEST `4c93dc5` · cites mw-rag-route PRE-EXEC FAIL `5f8096a` **R1–R6** · Ban coding · Ban prove · Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` tip（includes AN-PERF-TEAR re-PRE as ancestor when stacked · Ban touch sibling AN files · Ban re-open AG/AI/AK · Ban AN-CIMG-EA）
**Prior REQUEST**: `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（pre_dual · **superseded by this re-PRE rewrite**）
**FAIL receipt**（retained · 不擦除）: `5f8096a7cea8ee01787b60d69c6773e444a4a086`（mw-rag-route PRE-EXEC FAIL on `4c93dc5` · R1–R6）
**Wave**: Line **AN** REQUEST wave（this = **AN-RAG-R3** re-PRE）
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **GAP-RAG-03（AN-RAG-R3）· R3 过滤落点 ADR + Top-K 前硬过滤 prove 轨**（`qbank_serving_scope` + hybrid · **PG-only ADR 定案** · **禁止 MySQL FULLTEXT** · **Ban Qdrant cutover / payload / 全文** · **Ban post-Top-K filter**）
**Gap id**: **`GAP-RAG-03`**（backlog `gap-bug-backlog.md:71` · P0 · OPEN · 本 REQUEST 不翻行）
**Related（只读）**: `m4-rag-hard-gates.md` §4 R3 · `adr-postgres-retained.md` · GAP-RAG-02 R2 structural CLOSED（≠ R3 closed）

## Rewrite note（re-PRE · supersedes `4c93dc5` · FAIL `5f8096a` R1–R6）

本稿解除 mw-rag-route PRE-EXEC FAIL `5f8096a` 阻断项 **R1–R6**。rag 与 e2e 均须对本稿 **re-PRE dual**。**不**擦除 FAIL 收据正文。**Ban MySQL FULLTEXT** · **Ban Qdrant cutover** · **Ban wash R2 as R3** · GAP-RAG-03 stays OPEN。

| # | 阻断（`5f8096a`） | 本稿修订 |
|---|------|------|
| **R1** | ADR 未定案 + Qdrant 选项 vs PG-only | §2 **PG-only ADR 定案**：SECURITY DEFINER SQL 内 WHERE **before** `ORDER BY … <=>` / `LIMIT`；**否决** Qdrant payload/全文与 post-Top-K filter |
| **R2** | 无行号锚点 | §3 钉 `qbank-generation-retrieval.ts` + mig `0106` / `0029` / `0068` 行号 |
| **R3** | Top-K starvation 未钉 | §4 钉 K=5/仅 3 in-scope → 恰 3 行 · 0 越界；披露 HNSW post-filter + legacy `:229-233` 无 scope |
| **R4** | CMD/EXIT 未钉 | §5 钉脚本名 / wrapper / attempts / EXIT |
| **R5** | 无 PC/MUT/回归 | §6 正控 + 两变异 + `rag04`/`rag03`/`rag-generation`/`qbank-pipeline` EXIT0 |
| **R6** | 证据层/隔离未声明 | §7 隔离真 PG+pgvector · SECURITY DEFINER 绕过 RLS → 显式 WHERE 隔离 · Ban MySQL/Qdrant/FULLTEXT 路径 |

## 0. 为何新开文件

`m4-rag-hard-gates.md` §4 已钉 R3 门禁语言但 **本切片未关**。本刀 docs 开 **R3 过滤落点 ADR（PG-only 定案）+ Top-K 硬过滤 prove** REQUEST（执行须 PRE BOTH + AUTHORIZE）。**Ban** 用 MySQL FULLTEXT 关 R3 · **Ban** 本刀宣称 Qdrant cutover / 向量真相已切 · **PG-retained**。

## 1. Quoted from the files（只读 · 零改写）

- backlog `:71` **GAP-RAG-03**：「`qbank_serving_scope` + hybrid 过滤落在 PG GUC + `to_tsvector` — **R3**；**禁止 MySQL FULLTEXT 冒充**」· 目标原文含 Qdrant 选项 —— **本 ADR 书面否决**（见 §2 · PG-retained 下不采用）。
- `m4-rag-hard-gates.md` §4：「hybrid 过滤经 GUC `app.qbank_serving_scope` 在 SECURITY DEFINER SQL **ORDER BY/LIMIT 前**硬过滤；词法通道 = `to_tsvector` + `qbank_search_terms`」·「**禁止用 MySQL FULLTEXT 冒充**」·「本切片：只定门禁语言；**不改** `hybridQbankSearch` / 0029/0106 生产 SQL」（本 REQUEST 仍 docs-only；授权后改码另批）。
- `adr-postgres-retained.md:11-12`：Postgres / pgvector = **唯一向量真相**；`@meetwise/qdrant-store` = 历史原型。

## 2. R1 · ADR 定案（PG-only · 书面）

| 面 | **定案（本 REQUEST 钉死 · 非推给 PRE）** | **明确否决** |
|----|------------------------------------------|--------------|
| **过滤落点** | SECURITY DEFINER SQL 函数体内、**`ORDER BY g.embedding <=> p_embedding` / `ORDER BY ts_rank…` 与 `LIMIT` 之前**的 WHERE 谓词（active generation · `visible` · scope GUC · taxonomy GUC · 批准源/`qbank_retrieval_candidate`） | Qdrant payload filter · 应用层 **post-Top-K** 再过滤 · MySQL `MATCH … AGAINST` |
| **词法通道** | 保持 `to_tsvector('simple', qbank_search_terms(…))`（`0106:112-119` 一带）· 若要 BM25 **须在 PG 内** | Qdrant 全文 · MySQL FULLTEXT 假等价 |
| **栈** | **PG-retained**（Postgres / pgvector / PostgresSaver） | Qdrant cutover · MySQL sole relational · MemorySaver · Redis cutover |
| **backlog `:71` 目标中的 Qdrant 选项** | **书面：在 PG-retained 下不采用**（本 ADR 否决） | 不得以 backlog 原文含 Qdrant 为由重开 Qdrant 路径 |

对齐 `adr-postgres-retained.md` · **Ban** 新增 Qdrant 代码路径本刀。

## 3. R2 · 现状行号锚点（只读 @ tip）

| 锚 | file:line | 读法 |
|----|-----------|------|
| Scope GUC | `packages/db/src/qbank-generation-retrieval.ts:60-65` | `setServingScope` → `set_config('app.qbank_serving_scope' / taxonomy, true)` SET LOCAL |
| Hybrid 入口 | 同文件 `:221-275` `hybridQbankSearch` | `:227` set scope · `:229-233` 无 active → **`annSearchLegacy`（不读 scope）** · `:239` n · `:255-257` RRF `slice(0,k)` |
| ANN SQL | `packages/db/migrations/0106_qbank_track_local_serving_scope.sql:55-92` `qbank_generation_ann_search` | scope 谓词 `:74-83` **在** 内层 `ORDER BY` `:84` / `LIMIT greatest(k*8,40)` `:85` **之前**；`qbank_retrieval_candidate` JOIN `:88-89` 在内层 LIMIT **之后**；外层 `LIMIT k` `:91` |
| Lexical SQL | `0106:94-131` | scope `:120-128` 在 `ORDER BY` `:130` / `LIMIT` `:131` **之前**；candidate JOIN 同块 |
| Distances | `0106:134` 起 | 距离回填 |
| HNSW 部分索引 | `0029_qbank_generation_hybrid_retrieval.sql:205` | `USING hnsw (embedding vector_cosine_ops) WHERE visible` |
| 候选视图 | `0068_qbank_content_fact_immutability.sql:111` 起 | `qbank_retrieval_candidate` · `s.status='approved'` |

**主张依据**：「过滤在 LIMIT K 之前」以 ANN/lexical 内层 WHERE（scope/visible）为准；candidate JOIN 在内层 LIMIT 后是 **已知饥饿风险**（§4）。

## 4. R3 · Top-K starvation · 旁路 · 期望值钉死

| 场景 | 期望（钉死） |
|------|--------------|
| **K=5 · scope 内仅 3 行合规** | 精确返回 **3** 行 · **0** 条 out-of-scope |
| **最近 N（>40）全在 scope 外/未批准 · 合规行更远** | 内层 `LIMIT k*8` 后 candidate 可致 **少于 K**（`0106:85-91`）· **诚实声明**：本刀 prove 记录实际返回数；ADR 修复方向 = 将批准源谓词移入内层 LIMIT **之前**（授权后编码）· 在修复前 **不得** 假装保证 K |
| **HNSW post-filter** | pgvector HNSW + 选择性 WHERE = 先索引后过滤（受 `hnsw.ef_search`）· 窄 scope 可静默 <K · fixture `pgvector/pgvector:pg16` · **未钉** 精确 pgvector 小版本 / `ef_search` / iterative_scan → prove 收据披露运行时版本 + 实际返回数 · Ban 静默当满 K |
| **Legacy `:229-233`** | 无 active generation → `annSearchLegacy` **完全不应用 scope** · **fail-closed 期望**：带 scope 的生产路径 **不得** 走 legacy；prove 断言「有 scope 时 active 必存在 / 或 legacy 不可达」· 若可达则 EXIT≠0 |

## 5. R4 · LOOP §3③ · 钉死 CMD / attempts / EXIT

**Primary CMD（钉死）**:

```text
./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove
```

| 项 | 钉死值 |
|----|--------|
| **Script** | `rag03-filter-locus:prove`（**新增** · 经 `run-e2e-isolated.mjs` · C4 增量登记于 `package.json` · 授权后落地；原料理在 `packages/db` proof） |
| **Wrapper** | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL` |
| **Attempts** | **3**（全录 · Ban retry-to-green） |
| **Timestamps** | Asia/Shanghai（+08:00）+ code SHA |
| **EXIT · 正控 / 主路径** | **0** |
| **EXIT · 变异（§6）** | **≠0**（红断言名钉在 proof 内） |
| **Ban** | 「PRE dual 裁定脚本名」含糊措辞 · 本 REQUEST **仅**上表脚本名 |

> 注：本 REQUEST 仍 **Ban coding**；`rag03-filter-locus:prove` 脚本登记属授权后执行面。PRE 审的是契约钉死，不是现在 invent 绿。

## 6. R5 · 正控 · 变异 · 具名回归

| 项 | 钉死 |
|----|------|
| **正控（PC）** | scope 内多行 · 按距离排序 · 返回数 **= K** · 0 越界 · EXIT **0** |
| **变异 1** | 把 scope 谓词移到 LIMIT **之后**（外层再过滤）→ 越界行出现 **或** 数量不足 → EXIT **≠0** · 红断言名拟 `R3-MUT-POST-LIMIT-SCOPE` |
| **变异 2** | 删去 taxonomy 谓词 → 跨 taxonomy 行出现 → EXIT **≠0** · 红断言名拟 `R3-MUT-NO-TAXONOMY` |
| **回归 R-a** | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag04-track-local:prove` → EXIT **0** |
| **回归 R-b** | 同 wrapper `pnpm rag03-route:prove` → EXIT **0** |
| **回归 R-c** | 同 wrapper `pnpm rag-generation:prove` → EXIT **0** |
| **回归 R-d** | 同 wrapper `pnpm qbank-pipeline:prove` → EXIT **0** |

**Ban** 借 R-a..R-d 绿当本刀 R3 关闭证据 · EXIT0 ≠ R3 closed alone。

## 7. R6 · 证据层 · 隔离依据

| 项 | 钉死 |
|----|------|
| **证据层** | `run-e2e-isolated.mjs` **隔离真 PG + pgvector**（`pgvector/pgvector:pg16`）· Ban fake DB |
| **宿主** | Linux-native-Docker-Engine |
| **隔离依据** | 检索函数均为 **SECURITY DEFINER**（绕过 RLS）→ 隔离依靠函数体内 **显式 WHERE**（active generation · `visible` · scope/taxonomy GUC · 批准源）· qbank = 共享题库 · **无 owner 租户维** · 「租户隔离不适用；scope 隔离以显式谓词为准」 |
| **Ban 路径** | **不引入** MySQL / Qdrant / FULLTEXT 代码路径 · 静态断言（授权后 proof）禁止 `MATCH … AGAINST` / qdrant client / mysql runtime 出现在本刀 diff |

## 8. 行语义（冻结）

- backlog `:71` **GAP-RAG-03 stays OPEN** · canHonestlyFlip=false 直至 ADR+prove+dual+协调方。
- PG-retained · Ban MySQL sole relational · Ban Qdrant-as-required-vector this knife。
- 本 REQUEST 零 matrix/backlog/checklist edit。
- EXIT0 ≠ R3 closed alone · ≠ cutover · ≠ HA · coveredCount=8。

## 9. Ban 列表

- Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）
- **Ban MySQL FULLTEXT fake-equiv** · **Ban Qdrant cutover** · Ban wash R2 as R3 · Ban post-Top-K filter 当通过
- Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push
- Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban 碰 sibling AN 文件 · Ban product/infra code this turn
- Ban Redis cutover · Ban MODEL-OP closed claim

## 10. Non-claims

Not a pass · not run · not R3 closed · not cutover · not FULLTEXT equiv · not HA · not `releaseEvidence=true` · not nail · alone ≠ dual · PG-retained · ADR pick ≠ coding landed

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `:71` OPEN · STOP

*Harness · GAP-RAG-03 R3 filter-locus ADR + Top-K hard-filter · AN-RAG-R3 re-PRE · supersedes 4c93dc5 · FAIL 5f8096a R1–R6 · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban FULLTEXT · Ban Qdrant cutover · PG-retained · alone ≠ dual · STOP*
