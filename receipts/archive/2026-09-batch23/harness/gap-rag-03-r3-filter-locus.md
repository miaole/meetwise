# Harness — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter fix + prove**（Line AN-RAG-R3 · NAIL · **`post_prove_dual_pass`** · GAP-RAG-03 **OPEN** · R3-HNSW-COMPLETENESS **OPEN** · PG-retained · Ban MySQL FULLTEXT · Ban Qdrant cutover）

**Status**: **`post_prove_dual_pass`**（AN-RAG-R3 nail · PROVE tip `7c67b4a` / `7c67b4aa6b890ec7978c575e1e552e51e081cb98` · CODE `ac03f30` / `ac03f3080a02f5ea863b304908815646f4b3d18c` · C-3 `264e1d7` · REQUEST `8d52138` · mig `0138` · POST dual mw-rag-route `f93d6ad` + mw-e2e-ha `a1de77d` BOTH PASS · PC 0/0/0 · MUT 1/1/1 · R-b EXIT1 pre-existing = GAP-RAG-02 `:70` disclosed · **GAP-RAG-03 stays OPEN** · **R3-HNSW-COMPLETENESS OPEN** · coveredCount=8 · alone≠dual · PASS≠关 gap≠HA）

> **Exec-era status（historical · retained）**: **`awaiting_post_prove_dual`** after prove addendum §11 · earlier **`draft:awaiting_pre_exec_dual`** · Verdict **PENDING**（L0 docs REQUEST rewrite **×3 re-PRE** · supersedes REQUEST ×2 `c515a8c`（→`c71d354`→`4c93dc5`）· cites mw-rag-route Re-PRE2 PASS-with-Cond **`4e16dfa`**（**Cond-1 BLOCKING pre-AUTHORIZE** · Cond-2..6）· Re-PRE FAIL **`0e5c5ed`**（R3 CRITICAL · R5）· PRE-EXEC FAIL `5f8096a`（R1–R6）· Ban coding · Ban prove · Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban self-approve · Ban self-nail · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **GAP-RAG-03 stays OPEN**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` @ `20da721`（anchors re-verified；`eae1e19..20da721` = 8 docs-only commits，`packages/` `apps/` `scripts/` `package.json` 零改动 · AN-PERF-TEAR = sibling，**Ban touch** · Ban touch sibling AN files · Ban re-open AG/AI/AK · HOLD AN-CIMG-EA · Ban touch AN-PRIV-EXT / AN-MOP product）
**Prior REQUESTs**: `c515a8c08aeb904a2579f0d1d38ec4e93aa183c9`（re-PRE ×2 · **superseded by this rewrite ×3**）· `c71d3547744900d4b6a70e64402a6c9baa40f6f6`（re-PRE #1 · superseded）· `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（superseded）
**Receipts**（retained · 不擦除 · 见 rag stub 历史段）: `4e16dfa8e9b1459b8401514c9d8252d1e7256c87`（Re-PRE2 PASS @c515a8c · alone ≠ dual · Cond-1 must fix pre-AUTHORIZE else = FAIL）· FAIL: `0e5c5edfb606ec8b7f5ad376e3d45d1d96306d58`（Re-PRE FAIL @c71d354）· `5f8096a7cea8ee01787b60d69c6773e444a4a086`（PRE-EXEC FAIL @4c93dc5）
**Wave**: Line **AN** REQUEST wave（this = **AN-RAG-R3** re-PRE ×3）
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — AUTHORIZE nail AN-RAG-R3 · honesty dual-pass close of this REQUEST knife · Ban flip `:71` CLOSED · Ban claim HNSW-complete · status `post_prove_dual_pass` · alone ≠ dual
> Exec-era authority（historical）: docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · status `draft:awaiting_pre_exec_dual`
**Knife**: **GAP-RAG-03（AN-RAG-R3）· R3 过滤落点 ADR + ANN candidate 谓词前移修复（本刀编码范围内）+ legacy 结构性不可达 + Top-K 硬过滤 prove**（PG-only · **禁止 MySQL FULLTEXT** · **Ban Qdrant** · **Ban post-Top-K filter**）
**Gap id**: **`GAP-RAG-03`**（backlog `gap-bug-backlog.md:71` · P0 · **OPEN** · 本 REQUEST 不翻行 · HNSW 完整性残项 `R3-HNSW-COMPLETENESS` 保持 OPEN）
**Related（只读）**: `m4-rag-hard-gates.md` §4 R3 · `adr-postgres-retained.md` · GAP-RAG-02 R2 structural CLOSED（≠ R3 closed）

## Rewrite ×3 note（supersedes `c515a8c` · Re-PRE2 `4e16dfa` Cond-1..6）

`4e16dfa`（mw-rag-route）PASS 但 **Cond-1 BLOCKING**（协调方：AUTHORIZE 前不修 = FAIL）。本稿只改 Cond-1..6 涉及之处；R1–R6 / R3 CRITICAL 既有钉值（C-1 JOIN before LIMIT · F-STARVE 0→5 · HNSW 显式期望+EXPLAIN · MUT-3/MUT-4 · 3/3 · 收据必录）**原样保留**，仅下表所列措辞被取代。

| Cond | `4e16dfa` 条件 | 本稿修订（锚） |
|---|------|------|
| **Cond-1（BLOCKING）** | `R3-LEGACY-STATIC-UNREACHABLE` 断言 0× `annSearchLegacy`，但 C-2 只删 `:229-233`，`:113` 文档注释仍含该标识符（tip 计 3 处 → C-2 后仍 1）→ PC 必红 | **定案 = 方案 A「C-2 同时改写 `:113` 注释」+ 断言为整文件字面计数（不剥注释 · 不做代码形态匹配）**。§4.1 C-2 增 `:113` 注释改写（替换文本逐字钉死，不含禁用 token）；§4.4 新增 **静态断言精确定义**：`annSearchLegacy` 与 `retrieval-legacy` 两 token 在 `packages/db/src/qbank-generation-retrieval.ts` 全文字面出现次数各 = 0；修复前计数更正为 **3 / 1**（`:113` `:231` `:232` / `:231`）→ 修复后 **0 / 0**；MUT-4 恢复分支 → ≥2 / 1 → 红。Ban prove 期间改断言/改计数口径 |
| **Cond-2** | C-1 改 ANN SQL，`qbank-integrity-upgrade:prove` 未入回归；无 active 情形仅有带 scope 断言 | §6 新增回归 **R-e** `qbank-integrity-upgrade:prove`（根 `package.json:429`）EXIT 0；§4.2 新增 fixture **F-LEGACY-NOSCOPE**（无 active · **不设** scope）→ reject `qbank_active_generation_missing` · 0 行 · 断言 `R3-LEGACY-UNSCOPED-FAIL-CLOSED` |
| **Cond-3** | R-c 理由写成「legacy-无-scope」 | §6 R-c 理由更正：`rag-generation:prove`（`:433` → `prove:qbank-generation` · `apps/worker/test/qbank-generation.proof.ts:66`）= **有 active generation 时无 scope 调用 `hybridQbankSearch`**，验证无 scope 的 serving 路径（C-1 后 ANN 结果不回归），**不涉及 legacy** |
| **Cond-4** | `run-e2e-isolated.mjs` 只登记 3 处 | §4.1 C-3 改为 **4 处**：`:1262` 依赖表 · `:1450` target 列表 · **`:1694` 命令分派** · `:2202` migrate 列表 |
| **Cond-5** | MUT-4 期望「返回 ≥1 legacy 行」依赖 legacy RLS / `qbank_visible_ref` 可见性 | §6 MUT-4 只钉 **EXIT 1 + 红断言名命中**；legacy 行数仅记录 `legacyReturned=<n>`（0 亦可，不判） |
| **Cond-6** | EXPLAIN 取的是函数体参数替换后的计划，可能 ≠ 实际调用计划 | §4.3 新增 **EXPLAIN 口径披露**：`planSource=substituted_body` ≠ live call plan；硬门禁只看真实函数调用的返回值；`HNSW_USED` / `HNSW_NOT_EXERCISED` 标为替换体观测；收据记 `LIVE_PLAN_NOT_CAPTURED`；Ban 以替换体计划宣称 live 计划 |

## Rewrite ×2 note（supersedes `c71d354` · FAIL `0e5c5ed`）（历史 · 保留）

`0e5c5ed` 已解除：**R1 / R2 / R4 / R6** + K=5/仅 3 in-scope→恰 3（本稿原样保留其钉值：§2 ADR、§3 锚点、§5 CMD、§7 证据层）。本稿**新解除**：

| # | `0e5c5ed` 未解除点 | 本稿修订（锚） |
|---|------|------|
| **R3 ①** | ANN candidate JOIN 仍在内层 `LIMIT greatest(k*8,40)` 之后（`0106:85`→`:88-89`）；修复只是「方向」/「授权后」 | §4.1 **编码范围（本刀内 · AUTHORIZE 后）**：新 migration 重写 `qbank_generation_ann_search` 函数体，把 `qbank_retrieval_candidate` JOIN 移入 `ann` CTE、位于 `ORDER BY`/`LIMIT` **之前**（签名/owner/ACL/`search_path` 不变） |
| **R3 ②** | 「最近 40+ 未批准」未钉期望 | §4.2 F-STARVE fixture：45 近 in-scope 未批准 + 5 远 in-scope 已批准 + 10 最近 out-of-scope 已批准 · K=5 dense → **修复前精确 0 行** · **修复后精确 5 行**（全批准 · 0 未批准 · 0 越界 · 距离升序） |
| **R3 ③** | `:43` 与 `:62/:69` 自相矛盾 | §3 改写：`:43`（§2）= ADR **目标态**；§3 = tip **现状缺陷 D-ANN-1**（非「保留风险」）；§4.1 在本刀修复 → 修复后 §2 与源码一致 |
| **R3 ④** | HNSW `ef_search=40` 前移后仍可能 <K；小 fixture 可能不走 HNSW | §4.3 **二选一定案 = 「显式期望 + EXPLAIN」**（不改 `iterative_scan`/`ef_search`）：P-EXACT 计划（EXPLAIN 证明未走 HNSW）→ 精确 5；P-HNSW 强制计划（EXPLAIN 证明走 `qgc_hnsw_visible_*`）→ 仅钉安全（0 未批准 · 0 越界 · ≤5），完整性 = 披露残项 `R3-HNSW-COMPLETENESS`（OPEN）|
| **R3 ⑤** | legacy 带 scope 可达？编码范围？前/后 EXIT | §4.4 **读码更正**：`activeQbankGeneration`（`qbank-generation-retrieval.ts:114-120`）在无 active 时**抛错、永不返回 falsy** → `:229-233` `if (!active)` legacy 分支在 tip 为**死代码**（带 scope 且无 active → 抛 `qbank_active_generation_missing`，不达 legacy）。编码范围（本刀内）= **删除** `:229-233` 死分支，使不可达性结构化；F-LEGACY 前/后 EXIT 钉死 |
| **R5** | 缺「candidate JOIN 移回 LIMIT 后」变异与 legacy 可达性变异；3/3；收据 extversion + EXPLAIN | §6：MUT-3 `R3-MUT-CANDIDATE-POST-LIMIT` · MUT-4 `R3-MUT-LEGACY-REACHABLE` · PC **3/3 EXIT 0** · 每 MUT **3/3 EXIT 1** + 红断言名命中 · 收据必录 `extversion` / image digest / `hnsw.ef_search` / EXPLAIN JSON |

**行号 disclosure**：×3 于 tip `20da721` 再核，下列行号全部未变（`eae1e19..20da721` 无源码改动）；×2 于 tip `eae1e19` 重核：`qbank-generation-retrieval.ts` / `0106` / `0029` / `0068` 行号未变；根 `package.json` 回归脚本 @tip = `rag03-route:prove :238` · `rag04-track-local:prove :240` · `qbank-pipeline:prove :427` · `rag-generation:prove :433`（`c71d354` 期引 `:431/:425` 已漂移）；`run-e2e-isolated.mjs` 默认镜像 `LEGACY_PG_IMAGE_DEFAULT` @tip `:1728`（`9e2abd0` 后 +12，原 `:1716`）。

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

## 3. R2 · 行号锚点（只读 @ tip `eae1e19`，×3 于 `20da721` 再核未变 · = **修复前现状**）

| 锚 | file:line | 读法 |
|----|-----------|------|
| Scope GUC | `packages/db/src/qbank-generation-retrieval.ts:60-65` | `setServingScope` → `set_config('app.qbank_serving_scope' / taxonomy, true)` SET LOCAL；`scope===undefined` → 不设（legacy no-filter 语义） |
| Active doc comment | 同文件 `:113` | `` /** Fail-closed：…——legacy `vector_chunk` 调用方必须直接用 `annSearchLegacy`（见 retrieval-store.ts）。 */ `` → **含 `annSearchLegacy` 字面 1 处**（Cond-1：C-2 一并改写） |
| Active pointer | 同文件 `:114-120` `activeQbankGeneration` | 元数据函数缺失 → 抛 `qbank_active_generation_metadata_missing`；`rowCount !== 1` → 抛 `qbank_active_generation_missing`；**永不返回 falsy** |
| Hybrid 入口 | 同文件 `:221-275` `hybridQbankSearch` | `:227` set scope · `:228` active（抛错即退出）· `:229-233` `if (!active)` → `annSearchLegacy`（**死代码**，见 §4.4）· `:239` n · `:240` dense SQL · `:255-257` RRF `slice(0,k)` |
| 生产调用方 | `packages/db/src/qbank-retrieval-cache.ts:276` | → `hybridQbankSearch`；另 `retrieval-store.ts:58-63` `annSearch('qbank')` 亦调用同一 `qbank_generation_ann_search`（修复同覆盖） |
| ANN SQL | `packages/db/migrations/0106_qbank_track_local_serving_scope.sql:55-92` `qbank_generation_ann_search` | scope 谓词 `:74-83` 在内层 `ORDER BY` `:84` / `LIMIT greatest(k*8,40)` `:85` **之前**；**缺陷 D-ANN-1**：`qbank_retrieval_candidate` JOIN `:88-89` 在内层 LIMIT **之后**（post-filter → 饥饿）；外层 `LIMIT k` `:91`；`k` = `least(p_k,50)` `:63` |
| Lexical SQL | `0106:94-131` | candidate JOIN `:116` + scope `:120-128` 均在 `ORDER BY :130` / `LIMIT :131` **之前**（已合规 · 本刀不改） |
| Distances | `0106:134` 起 | 距离回填（不改） |
| HNSW 部分索引 | `0029_qbank_generation_hybrid_retrieval.sql:205`（+ `0066:110` 同式） | `USING hnsw (embedding vector_cosine_ops) WHERE visible` |
| 候选视图 | `0068_qbank_content_fact_immutability.sql:111-124` | `qbank_retrieval_candidate` · `s.status='approved'` + content_hash 一致 |

**一致性（解 `:43` vs `:62/:69` 矛盾）**：§2 = ADR **目标态**（批准源谓词在 LIMIT 前）；本 §3 = tip **现状**，ANN 通道**不满足** §2（D-ANN-1）。D-ANN-1 **不再**作为「已知风险保留」——§4.1 在本刀编码范围内修复；修复后源码与 §2 一致，lexical 通道已一致。

## 4. R3 · 修复范围 · 期望值钉死（CRITICAL）

### 4.1 编码范围（本刀内 · 仅 PRE dual BOTH PASS + 协调方 AUTHORIZE 后）

| # | 文件 | 改动（精确） | Layer |
|---|------|------|------|
| **C-1** | 新 migration `packages/db/migrations/<NNNN>_qbank_ann_candidate_before_limit.sql`（`NNNN` = 编码时下一空号，tip 末号 `0137` → 预期 `0138`；若他线先占则顺延并在收据披露） | `CREATE OR REPLACE FUNCTION qbank_generation_ann_search(text, vector, integer)`：**签名 / `RETURNS` / `LANGUAGE sql STABLE SECURITY DEFINER` / `SET search_path = public, pg_temp` 与 `0106:55-61` 完全相同**；函数体 = `0106:62-91`，唯一变化：`JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id` 移入 `ann` CTE（紧随 `:73` `JOIN qbank_generation_chunk …`），位于 `ORDER BY` / `LIMIT greatest(k*8,40)` **之前**；外层删去 `:89` JOIN，保留 `ORDER BY a.dist LIMIT k`。不新增函数 / 不改 manifest（`QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST` 不变，同 `0106` 头注 `:14-21` 机理） | PRODUCT（SQL） |
| **C-2** | `packages/db/src/qbank-generation-retrieval.ts:229-233` + **`:113`**（Cond-1） | ① **删除** `:229-233` `if (!active) { … annSearchLegacy … }` 死分支（含 `:231` 动态 `import('./retrieval-legacy.ts')`）；② **改写 `:113` 文档注释**为下列逐字文本（仅注释 · 零行为变化 · 不含 `annSearchLegacy` / `retrieval-legacy` 字面）：<br>`` /** Fail-closed：在缺少 generation 元数据函数的 legacy/pre-generation 库上抛 `qbank_active_generation_metadata_missing`，无唯一 active 指针时抛 `qbank_active_generation_missing`，永不返回 `undefined`——非 generation 的 legacy `vector_chunk` 检索只经 retrieval-store.ts 的非 qbank 分支，不经本文件。 */ ``（双反引号 code span 仅为 markdown 包裹，不属于替换文本；替换文本 = 其内首尾空格之间的整行）<br>其余不变（`retrieval-store.ts` 及其 `:57` 注释不动） | PRODUCT（TS） |
| **C-3** | 新 proof `packages/db/test/rag03-filter-locus.proof.ts` + `packages/db/package.json` `prove:rag03-filter-locus` + 根 `package.json` `rag03-filter-locus:prove` / `:raw` + `scripts/run-e2e-isolated.mjs` target `rag03-filter-locus:prove:raw` 注册（同 `rag04-track-local:prove:raw` **四处**（Cond-4）：`:1262` 依赖表（追加条目：runner + 新 proof + `qbank-generation-retrieval.ts` + C-1 migration）· `:1450` target 列表 · **`:1694` 命令分派**（追加 `: target === 'rag03-filter-locus:prove:raw' ? ['pnpm', ['-C', 'packages/db', 'prove:rag03-filter-locus']]`）· `:2202` migrate 列表；仅追加，不改既有条目；漏任一处 → 收据披露并视为 C-3 未落） | TEST / HARNESS 注册 |

**Ban**：改 lexical / distances 函数 · 改 `hnsw.ef_search` / `hnsw.iterative_scan` / 索引 · 改 `annSearchLegacy` 本体（`retrieval-legacy.ts`，smoke 直调方 `apps/worker/smoke/rag-demo.ts:61` / `rag-adversarial-pg-eval.ts:146` 无 scope、非 serving 路径，本刀不动）· 引入 MySQL / Qdrant / FULLTEXT · 应用层 post-Top-K 再过滤。

### 4.2 期望值（fixture 钉死 · 每个 attempt 新建）

公共：一个 active generation（recipe 固定）· scope = (`S1`, `T1`) · 嵌入维度同 0029 列定义 · 距离由构造向量精确控制（cos distance 预计算并写入收据）· dense mode（`retrievalMode='dense'` → `n=k`）。

| Fixture | 构成 | K | **修复前（tip · C-1/C-2 未落）** | **修复后（C-1+C-2）** | 断言名 |
|---------|------|---|------------------|------------------|--------|
| **F-SCOPE**（保留 · 已清） | 3 in-scope 已批准 + 20 out-of-scope 已批准（更近） | 5 | 恰 **3** · 0 越界 | 恰 **3** · 0 越界 | `R3-SCOPE-EXACT` |
| **F-STARVE**（「最近 40+ 未批准」） | 45 in-scope **未批准**（`qbank_source.status<>'approved'` → 不在 `qbank_retrieval_candidate`）· dist 0.10–0.54 · 5 in-scope **已批准** · dist 0.60–0.64 · 10 out-of-scope 已批准 · dist 0.01–0.05 | 5 | 精确 **0** 行（内层 LIMIT 40 全为未批准 → candidate JOIN 后为空）· 断言红 | 精确 **5** 行 = 5 个已批准 in-scope ref · 距离升序 · 0 未批准 · 0 越界 | `R3-STARVE-EXACT-K` |
| **F-STARVE-RRF** | 同 F-STARVE · `retrievalMode='rrf'` · query 文本对全部 chunk 无词法命中（lexical 0 行） | 5 | `n=max(40,40)=40` → SQL `k=40` → 内层 LIMIT 320 ≥ 60 行 → **5**（不饥饿 · 对照组） | **5** | `R3-STARVE-RRF-CONTROL` |
| **F-LEGACY**（§4.4） | 无 `qbank_active_generation` 行 + 有 `vector_chunk(kind='qbank')` 行 · scope 已设 | 5 | `hybridQbankSearch` reject `qbank_active_generation_missing` · 0 行（行为绿） | reject 同上 · 0 行 | `R3-LEGACY-SCOPED-FAIL-CLOSED` |
| **F-LEGACY-NOSCOPE**（新 · Cond-2） | 同 F-LEGACY · **`scope` 不传**（GUC 未设） | 5 | reject `qbank_active_generation_missing` · 0 行（行为绿） | reject 同上 · 0 行 | `R3-LEGACY-UNSCOPED-FAIL-CLOSED` |
| **S-LEGACY-STATIC**（§4.4 · 静态 · 非 DB fixture） | 读 `packages/db/src/qbank-generation-retrieval.ts` 全文 | — | `annSearchLegacy` 计 **3**（`:113` `:231` `:232`）· `retrieval-legacy` 计 **1**（`:231`）→ **红** | **0 / 0** → 绿 | `R3-LEGACY-STATIC-UNREACHABLE` |

上表「修复前/修复后」行数在 **P-EXACT 计划**（§4.3）下为精确值。

**F-LEGACY / F-LEGACY-NOSCOPE 构造顺序**：每 attempt 隔离库全量 migrate 后、**激活任何 generation 之前**先跑；前置断言 `SELECT count(*) FROM qbank_active_generation_metadata()` = 0，否则记 `FIXTURE_UNREACHABLE`（该 attempt FAIL）；两 fixture 各自独立事务。行为断言判据（两者同）= Promise **reject 且 `err.message === 'qbank_active_generation_missing'`** 且未返回任何行；resolve（不论行数）或以他错误 reject → 红。

**Fixture 可达性**：「未批准」= `qbank_generation_chunk.visible=true`（`0029:143` 独立列）但 ref 不在 `qbank_retrieval_candidate`（`0068:111-124`：`qbank_source.status<>'approved'` 或 content_hash 不一致）；fixture 只经既有 DDL/写入函数构造（Ban 直写绕过 trigger）。若既有约束使该状态不可构造 → 记 `FIXTURE_UNREACHABLE` · 该 attempt FAIL（≠绿 · ≠红断言命中）· 回 PRE 重议，Ban 改 fixture 语义冒充通过。

### 4.3 HNSW 联动（二选一定案 = **显式期望 + EXPLAIN**）

**定案**：本刀**不**启用 `hnsw.iterative_scan`、**不**改 `hnsw.ef_search`（默认 40）、不设 pgvector 版本下限（iterative_scan 需 ≥0.8.0，留作另刀 ADR）。改为对 F-STARVE 在三个计划下各跑一次并以 EXPLAIN 证明计划：

| 计划 | 会话设置（`SET LOCAL` · 同事务） | EXPLAIN 判据（必需） | 返回期望（修复后） |
|------|------------|------------|------------|
| **P-EXACT**（门禁） | `enable_indexscan=off` · `enable_bitmapscan=off` | 计划树**不含** `qgc_hnsw_visible_` | **精确 5**（§4.2）· 硬断言 `R3-STARVE-EXACT-K` |
| **P-DEFAULT**（记录） | 无 | 记录是否含 `qgc_hnsw_visible_`（`HNSW_USED=true/false`） | 若 `HNSW_USED=false` → 精确 5（硬断言）；若 `true` → 按 P-HNSW 判 |
| **P-HNSW**（安全 + 残项披露） | `enable_seqscan=off` | 计划树**含** `Index Scan using qgc_hnsw_visible_*`；若规划器仍不用 → 记 `HNSW_NOT_EXERCISED`（披露 · 不算过 · 不算红） | **硬断言**：0 未批准 · 0 越界 · 行数 ≤5（`R3-HNSW-SAFETY`）；**行数本身不钉**，记录为 `hnswReturned=<n>` → `R3-HNSW-COMPLETENESS` 残项 **OPEN**（Ban 当满 K 宣称） |

EXPLAIN 取法：`EXPLAIN (ANALYZE, FORMAT JSON)` 作用于由 `pg_get_functiondef('qbank_generation_ann_search(text,vector,integer)'::regprocedure)` 取出的**目录内函数体**（参数替换为本 fixture 值 · 隔离库超级用户会话），防止 proof 与已部署函数漂移；JSON 原样写入收据。

**EXPLAIN 口径披露（Cond-6 · 必入收据）**：
- 上述 EXPLAIN 是**参数替换后函数体作为独立顶层查询**的计划（`planSource=substituted_body`），**不等于**真实调用 `qbank_generation_ann_search($1,$2,$3)` 时的 live 计划：该函数为 `SECURITY DEFINER`，PG 不内联，函数体在 SQL 函数执行器内以参数形式规划（可能为 generic plan，常量替换版为 custom plan），执行角色亦不同（定义者 vs 超级用户会话）。
- 因此**硬门禁只看真实函数调用的返回值**（经 `hybridQbankSearch` / 直接 `SELECT … FROM qbank_generation_ann_search(…)`，与 EXPLAIN 同一事务、同一 `SET LOCAL`）：P-EXACT 的「精确 5」不依赖 EXPLAIN——`enable_indexscan/enable_bitmapscan=off` 为会话 GUC，同样作用于函数内部规划（函数 `SET` 子句只覆盖 `search_path`），且 HNSW 只能以 index scan 访问；P-HNSW 的 `R3-HNSW-SAFETY`（0 未批准 · 0 越界 · ≤5）与计划无关。
- `HNSW_USED` / `HNSW_NOT_EXERCISED` 一律标为**替换体观测**（收据字段 `planSource=substituted_body`），不得表述为 live 计划证明；本刀不引入 `auto_explain`（不改 PG 配置），收据记 `LIVE_PLAN_NOT_CAPTURED`（披露 · 不算过 · 不算红）。Ban 以替换体 EXPLAIN 宣称 live 调用走/未走 HNSW。

### 4.4 Legacy（读码更正 + 编码范围 + 前/后 EXIT）

- **更正 `0e5c5ed` R3③ 前提**：`activeQbankGeneration`（`:114-120`）无 active → **抛错**；`hybridQbankSearch:228` 抛出即退出，`:229` `if (!active)` 永不为真 → `:230-232` legacy **在 tip 已不可达**（含「无 active + 有 scope」）。不可达性目前依赖 `activeQbankGeneration` 的抛错契约，非结构性。
- **编码范围（本刀内）**：C-2 删除死分支 **并改写 `:113` 注释**（§4.1）→ 结构性不可达，且文件内不再残留该标识符的任何字面。
- **静态断言 `R3-LEGACY-STATIC-UNREACHABLE` 精确定义（Cond-1 定案 · 钉死 · 防误红/误绿）**：
  - 目标文件：仓库根相对路径 `packages/db/src/qbank-generation-retrieval.ts`（proof 以 `fs.readFileSync` 读工作树文件）。
  - 判据：对**全文原始文本**（含注释 · **不剥注释 · 不做 import/调用形态匹配**）做字面子串计数，`annSearchLegacy` 计数 = 0 **且** `retrieval-legacy` 计数 = 0 → 绿；任一 >0 → 红，日志输出 `FAIL  R3-LEGACY-STATIC-UNREACHABLE annSearchLegacy=<n> retrieval-legacy=<m>`。
  - 计数 @tip `20da721`（修复前）：`annSearchLegacy` = **3**（`:113` 注释 · `:231` 解构 · `:232` 调用）· `retrieval-legacy` = **1**（`:231`）→ 红（**更正** ×2 稿 `:111`「得 1≠0」= 误记）。
  - 修复后（C-2 ① 删除 + ② `:113` 改写为钉死文本）：**0 / 0** → 绿。若仅做 ① 未做 ② → `annSearchLegacy=1` → PC 红 = C-2 未完整落地（**不是**断言缺陷，Ban 以放宽断言修复）。
  - MUT-4（恢复分支）：`annSearchLegacy` ≥2 · `retrieval-legacy` = 1 → 红（与是否恢复 `:113` 注释无关）。
  - 选择理由：方案 A（改注释 + 全文字面计数）判据最简单、无正则/语法解析歧义，对注释、字符串、动态 import 一视同仁；未选方案 B（只匹配 import/调用形态），因形态匹配会漏掉别名/间接引用。
  - **Ban** prove 期间改断言 token / 计数口径 / 目标文件来过关；断言定义变更须回 PRE。
- **前/后 EXIT（本 proof 全体）**：修复前（C-3 先落、C-1/C-2 未落）= **EXIT 1**（红：`R3-STARVE-EXACT-K` 得 0≠5 · `R3-LEGACY-STATIC-UNREACHABLE` 得 `annSearchLegacy=3 retrieval-legacy=1`；`R3-LEGACY-SCOPED-FAIL-CLOSED` / `R3-LEGACY-UNSCOPED-FAIL-CLOSED` 绿）；修复后 = **EXIT 0**。

## 5. R4 · LOOP §3③ · 钉死 CMD / attempts / EXIT

**Primary CMD（钉死）**:

```text
./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove
```

| 项 | 钉死值 |
|----|--------|
| **Script** | `rag03-filter-locus:prove`（**新增** · 经 `run-e2e-isolated.mjs` · C4 增量登记于 `package.json` · 授权后落地；原料理在 `packages/db` proof） |
| **Wrapper** | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL` |
| **Attempts** | 每格 **3**（全录 · Ban retry-to-green · Ban 丢/换 attempt）· **通过 = 3/3 命中期望 EXIT** |
| **Timestamps** | Asia/Shanghai（+08:00）+ code SHA |
| **EXIT · BASELINE（修复前 · C-3 only）** | **1**（3/3 · 红断言 = `R3-STARVE-EXACT-K` + `R3-LEGACY-STATIC-UNREACHABLE`） |
| **EXIT · 正控 / 主路径（修复后）** | **0**（**3/3**） |
| **EXIT · 变异（§6）** | 每 MUT **1**（**3/3**）· 且日志 `FAIL  <该 MUT 红断言名>` 命中（「红断言名」= §6 该 MUT 行「经」所列 proof 断言名；`R3-MUT-*` 为收据标签）；仅他断言红 → 该格 FAIL |
| **执行顺序** | C-3 commit → BASELINE×3 → C-1+C-2 commit → PC×3 → MUT-1..4 各×3 → 回归 R-a..R-e 各×1 |
| **Ban** | 「PRE dual 裁定脚本名」含糊措辞 · 本 REQUEST **仅**上表脚本名 |

> 注：本 REQUEST 仍 **Ban coding**；`rag03-filter-locus:prove` 脚本登记属授权后执行面。PRE 审的是契约钉死，不是现在 invent 绿。

## 6. R5 · 正控 · 变异 · 回归 · 收据

**MUT 施加方式**：仅 prove worktree 本地临时编辑（C-1 migration 或 C-2 TS）→ 跑 CMD → `git checkout -- <file>` → `git diff --exit-code` EXIT 0 · **Ban commit MUT**。

| 项 | 施加 | 期望（每次 · 3/3） | 红断言名 |
|----|------|------|------|
| **PC** | 修复后原样 | EXIT **0** · F-SCOPE=3 · F-STARVE（P-EXACT）=5 · F-STARVE-RRF=5 · F-LEGACY / F-LEGACY-NOSCOPE reject `qbank_active_generation_missing` · 静态 `0/0` · P-HNSW 安全断言绿 | — |
| **MUT-1**（保留） | scope 谓词移到外层 `LIMIT` 之后 | EXIT **1** | `R3-MUT-POST-LIMIT-SCOPE`（经 `R3-SCOPE-EXACT` / `R3-STARVE-EXACT-K` 越界或不足） |
| **MUT-2**（保留） | 删 taxonomy 谓词 | EXIT **1** | `R3-MUT-NO-TAXONOMY` |
| **MUT-3**（新） | C-1 中 candidate JOIN **移回内层 LIMIT 之后**（= `0106:85-91` 原形） | EXIT **1** · F-STARVE（P-EXACT）返回 **0** | `R3-MUT-CANDIDATE-POST-LIMIT`（经 `R3-STARVE-EXACT-K`） |
| **MUT-4**（新 · legacy 可达性） | C-2 处恢复 `if (!active) { const { annSearchLegacy } = await import('./retrieval-legacy.ts'); return … }`，并令 `activeQbankGeneration` 在 `rowCount!==1` 时 `return undefined`（不抛） | EXIT **1**（3/3）· **仅钉 EXIT + 红断言名**（Cond-5）；legacy 返回行数**不钉**，仅记录 `legacyReturned=<n>`（受 legacy RLS / `qbank_visible_ref` 可见性影响，0 亦可，不判） | `R3-MUT-LEGACY-REACHABLE`（经 `R3-LEGACY-STATIC-UNREACHABLE`〔`annSearchLegacy`≥2 · 确定〕+ `R3-LEGACY-SCOPED-FAIL-CLOSED` + `R3-LEGACY-UNSCOPED-FAIL-CLOSED`〔不再以 `qbank_active_generation_missing` reject：resolve 任意行数或他错误 reject 均为红 · 确定〕，三者须全部命中） |
| **回归 R-a** | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag04-track-local:prove`（`package.json:240`） | EXIT **0** | — |
| **回归 R-b** | 同 wrapper `pnpm rag03-route:prove`（`:238`） | EXIT **0** | — |
| **回归 R-c** | 同 wrapper `pnpm rag-generation:prove`（`:433` → `prove:qbank-generation` · `qbank-generation.proof.ts:66`：**有 active generation** 时无 scope 调用 `hybridQbankSearch`，验证**无 scope 的 serving 路径**在 C-1 后不回归；**不涉及 legacy**——Cond-3 更正 ×2 稿「legacy-无-scope」误述） | EXIT **0** | — |
| **回归 R-d** | 同 wrapper `pnpm qbank-pipeline:prove`（`:427`） | EXIT **0** | — |
| **回归 R-e**（新 · Cond-2） | 同 wrapper `pnpm qbank-integrity-upgrade:prove`（根 `package.json:429` → `apps/worker prove:qbank-integrity-upgrade`）：`qbank-integrity-upgrade.proof.ts:256/:362` 经 `hybridQbankSearch` 断言 content_hash 漂移的 poisoned ref 被 ANN 排除（= `qbank_retrieval_candidate` 语义，C-1 移动的正是该 JOIN）；且该 proof 以非超级用户 migration role 逐段 migrate，同时验证 C-1 `CREATE OR REPLACE` 在该角色下可应用 | EXIT **0** | — |

**Ban** 借 R-a..R-e 绿当本刀 R3 关闭证据 · EXIT0 ≠ R3 closed alone。

**收据必录（每 attempt）**：code SHA · `+08:00` 起止 · 隔离 PG 容器名 + image digest（`docker image inspect` RepoDigests）· `SELECT extversion FROM pg_extension WHERE extname='vector'` · `SHOW hnsw.ef_search`（未设记 `default(40)`）· 三计划 EXPLAIN JSON（§4.3 · 标 `planSource=substituted_body` · `LIVE_PLAN_NOT_CAPTURED`）· `HNSW_USED` / `hnswReturned` · 静态计数 `annSearchLegacy=<n> retrieval-legacy=<m>` · MUT-4 `legacyReturned=<n>`（仅记录）· 各 fixture 返回 ref 列表与距离 · 红/绿断言名清单 · EXIT。

## 7. R6 · 证据层 · 隔离依据

| 项 | 钉死 |
|----|------|
| **证据层** | `run-e2e-isolated.mjs` **隔离真 PG + pgvector**（`pgvector/pgvector:pg16` · `run-e2e-isolated.mjs:1728`）· Ban fake DB |
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
- Ban re-open AG/AI/AK · HOLD AN-CIMG-EA · Ban 碰 sibling AN 文件 · Ban touch AN-PRIV-EXT/MOP product · Ban product/infra code this turn · Ban commit MUT · Ban 改 HNSW knobs/index
- Ban Redis cutover · Ban MODEL-OP closed claim

## 10. Non-claims

Not a pass · not run · not fixed · not R3 closed · not live-plan proof（EXPLAIN = substituted body）· not HNSW-complete（`R3-HNSW-COMPLETENESS` OPEN）· not cutover · not FULLTEXT equiv · not HA · not `releaseEvidence=true` · not nail · alone ≠ dual · PG-retained · ADR pick ≠ coding landed

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `:71` OPEN · `R3-HNSW-COMPLETENESS` OPEN · STOP

*Harness · GAP-RAG-03 R3 filter-locus ADR + ANN candidate-before-LIMIT fix + Top-K hard-filter prove · AN-RAG-R3 re-PRE ×3 · supersedes c515a8c (→c71d354→4c93dc5) · Re-PRE2 4e16dfa Cond-1 (BLOCKING) + Cond-2..6 addressed · FAIL 0e5c5ed + 5f8096a · R1/R2/R4/R6 retained · R3/R5 retained · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban FULLTEXT · Ban Qdrant cutover · PG-retained · alone ≠ dual · STOP*

## 11. Prove addendum（AUTHORIZE coding+prove · 2026-10-06 · `awaiting_post_prove_dual`）

- AUTHORIZE @ REQUEST rewrite3 `8d52138` after PRE BOTH PASS（rag `d83c561` · e2e `eb8fb09`）+ coordinator FYI NB-1..3。§0–§10 above unchanged（REQUEST text frozen）；the `:113` landed wording follows coordinator NB-2（supersedes the §4.1 C-2 ② pinned text, which misdescribed legacy callers）。
- C-3 `264e1d7` · CODE（C-1+C-2）`ac03f30` · migration **`0138_qbank_ann_candidate_before_limit.sql`**。
- BASELINE **1/1/1** · PC **0/0/0** · MUT-1..4 each **1/1/1**（red names hit）· R-a/R-c/R-d/R-e **0** · R-b **1 = pre-existing at base `70cba94`**（disclosed）· static `3/1 → 0/0`（MUT-4 `2/1`）· pgvector 0.8.7 · ef_search 40 · EXPLAIN `substituted_body` · `LIVE_PLAN_NOT_CAPTURED`。
- Receipt: `receipts/gap-rag-03-r3-filter-locus/2026-10-06-an-rag-r3-prove.md`（F-STARVE construction disclosure · F-STARVE-HASH NB-1 seam · MUT-2 name mapping · R-e rationale corrected）。
- backlog `:71` **GAP-RAG-03 stays OPEN** · `R3-HNSW-COMPLETENESS` **OPEN** · Ban nail until POST BOTH + AUTHORIZE · Ban self-write `post_prove_dual_pass`。

<!-- exec-era §11 retained above · lifecycle advanced below -->

---

## 12. AN-RAG-R3 NAIL lifecycle（`post_prove_dual_pass` · 2026-10-06 · additive）

- Lifecycle on this harness/slice/receipt: **`post_prove_dual_pass`**（docs/SSOT honesty only · zero further product/infra code · §0–§11 unchanged）。
- REQUEST `8d52138` / `8d52138c609108939f113ef248fad4b4375f9e11` · PRE dual BOTH PASS mw-rag-route `d83c561` / `d83c561a570538cc43ab53bbb3e8faf438518a03` + mw-e2e-ha `eb8fb09` / `eb8fb09d36ec8980fd0b19e1e7bc6008c76a7a9c` · C-3 `264e1d7` / `264e1d709b8aa5318b15905d628f78a63bdfe161` · CODE_SHA（C-1+C-2）`ac03f30` / `ac03f3080a02f5ea863b304908815646f4b3d18c` · mig **`0138_qbank_ann_candidate_before_limit.sql`** · PROVE tip **NAILED TO** `7c67b4a` / `7c67b4aa6b890ec7978c575e1e552e51e081cb98` · POST dual BOTH PASS mw-rag-route **`f93d6ad`** / `f93d6ad30491fb546cb43519a56e18cc908c6980` + mw-e2e-ha **`a1de77d`** / `a1de77dd06efde8285daa2b3f61c87ea077f773f`（alone≠dual）。
- EXIT table @ CODE `ac03f30`（`rag03-filter-locus:prove` · implementer receipt 3/3 · POST independent re-runs agree）: BASELINE @`264e1d7` **1/1/1** · PC **0/0/0** · MUT-1..4 each **1/1/1**（red names hit · MUT-2 mapped `R3-SCOPE-EXACT`+`R3-SCOPE-NO-CROSS-TAXONOMY`）· R-a/R-c/R-d/R-e **0** · **R-b `rag03-route:prove` EXIT 1** = pre-existing（same single assertion `未决岗位 start 不抛、返回 started…` red @ base `70cba94` · @C-3 `264e1d7` · @CODE `ac03f30` · delta 0）→ tracked as **GAP-RAG-02 backlog `:70`**（「现有 `rag03-route:prove` 须换夹具或标红（R5）」）· **disclosed · NOT green · Ban count green · Ban covered flip** · static `annSearchLegacy`/`retrieval-legacy` 3/1 → 0/0。
- POST conditions carried: rag `f93d6ad` P-1..P-4（R-b OPEN via `:70` · F-STARVE-HASH supplementary sim · F-STARVE prod reachability unproven · HNSW OPEN）· e2e `a1de77d` NB-1..5（NB-1 `:113` NB-2 wording accepted by both POST as disclosed deviation; F-STARVE-HASH acknowledged non-gating in coordinator AUTHORIZE nail · NB-2 ledger BASE EXIT correction appended at nail · NB-3 R-b separate line · NB-4 static single-file · NB-5 e2e sampled MUT-2/3 ×1）。
- **STILL_OPEN**: backlog `:71` **GAP-RAG-03 stays OPEN**（canHonestlyFlip=false）· **`R3-HNSW-COMPLETENESS` OPEN**（P-HNSW post-fix = `HNSW_NOT_EXERCISED` · `planSource=substituted_body` · `LIVE_PLAN_NOT_CAPTURED` · completeness unobserved）· **R-b** EXIT 1 pre-existing = GAP-RAG-02 `:70` OPEN tracking（disclosed · Ban count green · Ban covered flip）· **F-STARVE = defence-in-depth**（production reachability NOT proven · builder fact-set vs approval drift）· **F-STARVE-HASH = superuser `DISABLE TRIGGER USER` simulation · supplementary · non-gating**（≠ §4.2 pinned fixture · disclosed）· Ban MySQL/Qdrant/FULLTEXT · alone≠dual · coveredCount=**8** · PASS ≠ 关 gap ≠ HA。
- Pins unchanged: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503. Do not write covered / CLOSED / HNSW-complete / R-b green.
- **CITE_EXIT**: `pnpm eval-harness-matrix-cite:prove` @ nail SHA → expected **EXIT 0**（static docs cite · ≠ gap closed · ≠ covered）· actual EXIT in nail commit message.
- Nail tip = 本 commit（推至 `feat/mysql-schema-skeleton`；禁 force push）. This paragraph does **not** flip backlog `:71` to CLOSED · does **not** claim HNSW completeness · does **not** wash R-b green · does **not** flip any UC covered · does **not** touch PERF-TEAR docs（`b5633f0` / `2900c46` retained as written）.

*Harness · GAP-RAG-03 R3 filter-locus · AN-RAG-R3 NAIL · 2026-10-06 · post_prove_dual_pass · PROVE 7c67b4a · CODE ac03f30 · C-3 264e1d7 · mig 0138 · POST f93d6ad+a1de77d PASS · PC 0/0/0 · MUT 1/1/1 · R-b EXIT1 = GAP-RAG-02 :70 disclosed · GAP-RAG-03 OPEN · R3-HNSW-COMPLETENESS OPEN · Ban MySQL/Qdrant/FULLTEXT · alone≠dual · STOP*
