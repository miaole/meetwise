# Harness — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter fix + prove**（Line AN-RAG-R3 · docs REQUEST rewrite **×2 re-PRE** · **`draft:awaiting_pre_exec_dual`** · PG-retained · Ban MySQL FULLTEXT · Ban Qdrant cutover）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST rewrite **×2 re-PRE** · supersedes REQUEST `c71d354`（which superseded `4c93dc5`）· cites mw-rag-route Re-PRE FAIL **`0e5c5ed`**（R3 CRITICAL · R5 · Cond 1/2）and PRE-EXEC FAIL `5f8096a`（R1–R6）· Ban coding · Ban prove · Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban self-approve · Ban self-nail · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **GAP-RAG-03 stays OPEN**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` @ `eae1e19`（+ AN-PERF-TEAR rewrite ×2 stacked as parent · Ban touch sibling AN files · Ban re-open AG/AI/AK · HOLD AN-CIMG-EA · Ban touch AN-PRIV-EXT / AN-MOP product）
**Prior REQUESTs**: `c71d3547744900d4b6a70e64402a6c9baa40f6f6`（re-PRE #1 · **superseded by this rewrite ×2**）· `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（superseded）
**FAIL receipts**（retained · 不擦除 · 见 rag stub 历史段）: `0e5c5edfb606ec8b7f5ad376e3d45d1d96306d58`（Re-PRE FAIL @c71d354）· `5f8096a7cea8ee01787b60d69c6773e444a4a086`（PRE-EXEC FAIL @4c93dc5）
**Wave**: Line **AN** REQUEST wave（this = **AN-RAG-R3** re-PRE ×2）
**Experts**: `mw-rag-route` + `mw-e2e-ha`（stubs PENDING re-PRE · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail · Ban buy cloud · status `draft:awaiting_pre_exec_dual`
**Knife**: **GAP-RAG-03（AN-RAG-R3）· R3 过滤落点 ADR + ANN candidate 谓词前移修复（本刀编码范围内）+ legacy 结构性不可达 + Top-K 硬过滤 prove**（PG-only · **禁止 MySQL FULLTEXT** · **Ban Qdrant** · **Ban post-Top-K filter**）
**Gap id**: **`GAP-RAG-03`**（backlog `gap-bug-backlog.md:71` · P0 · **OPEN** · 本 REQUEST 不翻行 · HNSW 完整性残项 `R3-HNSW-COMPLETENESS` 保持 OPEN）
**Related（只读）**: `m4-rag-hard-gates.md` §4 R3 · `adr-postgres-retained.md` · GAP-RAG-02 R2 structural CLOSED（≠ R3 closed）

## Rewrite ×2 note（supersedes `c71d354` · FAIL `0e5c5ed`）

`0e5c5ed` 已解除：**R1 / R2 / R4 / R6** + K=5/仅 3 in-scope→恰 3（本稿原样保留其钉值：§2 ADR、§3 锚点、§5 CMD、§7 证据层）。本稿**新解除**：

| # | `0e5c5ed` 未解除点 | 本稿修订（锚） |
|---|------|------|
| **R3 ①** | ANN candidate JOIN 仍在内层 `LIMIT greatest(k*8,40)` 之后（`0106:85`→`:88-89`）；修复只是「方向」/「授权后」 | §4.1 **编码范围（本刀内 · AUTHORIZE 后）**：新 migration 重写 `qbank_generation_ann_search` 函数体，把 `qbank_retrieval_candidate` JOIN 移入 `ann` CTE、位于 `ORDER BY`/`LIMIT` **之前**（签名/owner/ACL/`search_path` 不变） |
| **R3 ②** | 「最近 40+ 未批准」未钉期望 | §4.2 F-STARVE fixture：45 近 in-scope 未批准 + 5 远 in-scope 已批准 + 10 最近 out-of-scope 已批准 · K=5 dense → **修复前精确 0 行** · **修复后精确 5 行**（全批准 · 0 未批准 · 0 越界 · 距离升序） |
| **R3 ③** | `:43` 与 `:62/:69` 自相矛盾 | §3 改写：`:43`（§2）= ADR **目标态**；§3 = tip **现状缺陷 D-ANN-1**（非「保留风险」）；§4.1 在本刀修复 → 修复后 §2 与源码一致 |
| **R3 ④** | HNSW `ef_search=40` 前移后仍可能 <K；小 fixture 可能不走 HNSW | §4.3 **二选一定案 = 「显式期望 + EXPLAIN」**（不改 `iterative_scan`/`ef_search`）：P-EXACT 计划（EXPLAIN 证明未走 HNSW）→ 精确 5；P-HNSW 强制计划（EXPLAIN 证明走 `qgc_hnsw_visible_*`）→ 仅钉安全（0 未批准 · 0 越界 · ≤5），完整性 = 披露残项 `R3-HNSW-COMPLETENESS`（OPEN）|
| **R3 ⑤** | legacy 带 scope 可达？编码范围？前/后 EXIT | §4.4 **读码更正**：`activeQbankGeneration`（`qbank-generation-retrieval.ts:114-120`）在无 active 时**抛错、永不返回 falsy** → `:229-233` `if (!active)` legacy 分支在 tip 为**死代码**（带 scope 且无 active → 抛 `qbank_active_generation_missing`，不达 legacy）。编码范围（本刀内）= **删除** `:229-233` 死分支，使不可达性结构化；F-LEGACY 前/后 EXIT 钉死 |
| **R5** | 缺「candidate JOIN 移回 LIMIT 后」变异与 legacy 可达性变异；3/3；收据 extversion + EXPLAIN | §6：MUT-3 `R3-MUT-CANDIDATE-POST-LIMIT` · MUT-4 `R3-MUT-LEGACY-REACHABLE` · PC **3/3 EXIT 0** · 每 MUT **3/3 EXIT 1** + 红断言名命中 · 收据必录 `extversion` / image digest / `hnsw.ef_search` / EXPLAIN JSON |

**行号 disclosure**：本稿锚点于 tip `eae1e19` 重核：`qbank-generation-retrieval.ts` / `0106` / `0029` / `0068` 行号未变；根 `package.json` 回归脚本 @tip = `rag03-route:prove :238` · `rag04-track-local:prove :240` · `qbank-pipeline:prove :427` · `rag-generation:prove :433`（`c71d354` 期引 `:431/:425` 已漂移）；`run-e2e-isolated.mjs` 默认镜像 `LEGACY_PG_IMAGE_DEFAULT` @tip `:1728`（`9e2abd0` 后 +12，原 `:1716`）。

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

## 3. R2 · 行号锚点（只读 @ tip `eae1e19` · = **修复前现状**）

| 锚 | file:line | 读法 |
|----|-----------|------|
| Scope GUC | `packages/db/src/qbank-generation-retrieval.ts:60-65` | `setServingScope` → `set_config('app.qbank_serving_scope' / taxonomy, true)` SET LOCAL；`scope===undefined` → 不设（legacy no-filter 语义） |
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
| **C-2** | `packages/db/src/qbank-generation-retrieval.ts:229-233` | **删除** `if (!active) { … annSearchLegacy … }` 死分支（含动态 import）；其余不变 | PRODUCT（TS） |
| **C-3** | 新 proof `packages/db/test/rag03-filter-locus.proof.ts` + `packages/db/package.json` `prove:rag03-filter-locus` + 根 `package.json` `rag03-filter-locus:prove` / `:raw` + `scripts/run-e2e-isolated.mjs` target 注册（同 `rag04-track-local:prove:raw` 三处：`:1262` 依赖表 · `:1450` 列表 · `:2202` migrate 列表，仅追加 target 名） | TEST / HARNESS 注册 |

**Ban**：改 lexical / distances 函数 · 改 `hnsw.ef_search` / `hnsw.iterative_scan` / 索引 · 改 `annSearchLegacy` 本体（`retrieval-legacy.ts`，smoke 直调方 `apps/worker/smoke/rag-demo.ts:61` / `rag-adversarial-pg-eval.ts:146` 无 scope、非 serving 路径，本刀不动）· 引入 MySQL / Qdrant / FULLTEXT · 应用层 post-Top-K 再过滤。

### 4.2 期望值（fixture 钉死 · 每个 attempt 新建）

公共：一个 active generation（recipe 固定）· scope = (`S1`, `T1`) · 嵌入维度同 0029 列定义 · 距离由构造向量精确控制（cos distance 预计算并写入收据）· dense mode（`retrievalMode='dense'` → `n=k`）。

| Fixture | 构成 | K | **修复前（tip · C-1/C-2 未落）** | **修复后（C-1+C-2）** | 断言名 |
|---------|------|---|------------------|------------------|--------|
| **F-SCOPE**（保留 · 已清） | 3 in-scope 已批准 + 20 out-of-scope 已批准（更近） | 5 | 恰 **3** · 0 越界 | 恰 **3** · 0 越界 | `R3-SCOPE-EXACT` |
| **F-STARVE**（「最近 40+ 未批准」） | 45 in-scope **未批准**（`qbank_source.status<>'approved'` → 不在 `qbank_retrieval_candidate`）· dist 0.10–0.54 · 5 in-scope **已批准** · dist 0.60–0.64 · 10 out-of-scope 已批准 · dist 0.01–0.05 | 5 | 精确 **0** 行（内层 LIMIT 40 全为未批准 → candidate JOIN 后为空）· 断言红 | 精确 **5** 行 = 5 个已批准 in-scope ref · 距离升序 · 0 未批准 · 0 越界 | `R3-STARVE-EXACT-K` |
| **F-STARVE-RRF** | 同 F-STARVE · `retrievalMode='rrf'` · query 文本对全部 chunk 无词法命中（lexical 0 行） | 5 | `n=max(40,40)=40` → SQL `k=40` → 内层 LIMIT 320 ≥ 60 行 → **5**（不饥饿 · 对照组） | **5** | `R3-STARVE-RRF-CONTROL` |
| **F-LEGACY**（§4.4） | 无 `qbank_active_generation` 行 + 有 `vector_chunk(kind='qbank')` 行 · scope 已设 | 5 | `hybridQbankSearch` reject `qbank_active_generation_missing` · 0 行（行为 PASS）；静态断言 `qbank-generation-retrieval.ts` 含 `annSearchLegacy` → **红** | reject 同上 · 0 行；静态断言 0 处 → 绿 | `R3-LEGACY-SCOPED-FAIL-CLOSED` · `R3-LEGACY-STATIC-UNREACHABLE` |

上表「修复前/修复后」行数在 **P-EXACT 计划**（§4.3）下为精确值。

**Fixture 可达性**：「未批准」= `qbank_generation_chunk.visible=true`（`0029:143` 独立列）但 ref 不在 `qbank_retrieval_candidate`（`0068:111-124`：`qbank_source.status<>'approved'` 或 content_hash 不一致）；fixture 只经既有 DDL/写入函数构造（Ban 直写绕过 trigger）。若既有约束使该状态不可构造 → 记 `FIXTURE_UNREACHABLE` · 该 attempt FAIL（≠绿 · ≠红断言命中）· 回 PRE 重议，Ban 改 fixture 语义冒充通过。

### 4.3 HNSW 联动（二选一定案 = **显式期望 + EXPLAIN**）

**定案**：本刀**不**启用 `hnsw.iterative_scan`、**不**改 `hnsw.ef_search`（默认 40）、不设 pgvector 版本下限（iterative_scan 需 ≥0.8.0，留作另刀 ADR）。改为对 F-STARVE 在三个计划下各跑一次并以 EXPLAIN 证明计划：

| 计划 | 会话设置（`SET LOCAL` · 同事务） | EXPLAIN 判据（必需） | 返回期望（修复后） |
|------|------------|------------|------------|
| **P-EXACT**（门禁） | `enable_indexscan=off` · `enable_bitmapscan=off` | 计划树**不含** `qgc_hnsw_visible_` | **精确 5**（§4.2）· 硬断言 `R3-STARVE-EXACT-K` |
| **P-DEFAULT**（记录） | 无 | 记录是否含 `qgc_hnsw_visible_`（`HNSW_USED=true/false`） | 若 `HNSW_USED=false` → 精确 5（硬断言）；若 `true` → 按 P-HNSW 判 |
| **P-HNSW**（安全 + 残项披露） | `enable_seqscan=off` | 计划树**含** `Index Scan using qgc_hnsw_visible_*`；若规划器仍不用 → 记 `HNSW_NOT_EXERCISED`（披露 · 不算过 · 不算红） | **硬断言**：0 未批准 · 0 越界 · 行数 ≤5（`R3-HNSW-SAFETY`）；**行数本身不钉**，记录为 `hnswReturned=<n>` → `R3-HNSW-COMPLETENESS` 残项 **OPEN**（Ban 当满 K 宣称） |

EXPLAIN 取法：`EXPLAIN (ANALYZE, FORMAT JSON)` 作用于由 `pg_get_functiondef('qbank_generation_ann_search(text,vector,integer)'::regprocedure)` 取出的**目录内函数体**（参数替换为本 fixture 值 · 隔离库超级用户会话），防止 proof 与已部署函数漂移；JSON 原样写入收据。

### 4.4 Legacy（读码更正 + 编码范围 + 前/后 EXIT）

- **更正 `0e5c5ed` R3③ 前提**：`activeQbankGeneration`（`:114-120`）无 active → **抛错**；`hybridQbankSearch:228` 抛出即退出，`:229` `if (!active)` 永不为真 → `:230-232` legacy **在 tip 已不可达**（含「无 active + 有 scope」）。不可达性目前依赖 `activeQbankGeneration` 的抛错契约，非结构性。
- **编码范围（本刀内）**：C-2 删除死分支 → 结构性不可达（`qbank-generation-retrieval.ts` 内 `annSearchLegacy` 出现次数 = 0）。
- **前/后 EXIT（本 proof 全体）**：修复前（C-3 先落、C-1/C-2 未落）= **EXIT 1**（红：`R3-STARVE-EXACT-K` 得 0≠5 · `R3-LEGACY-STATIC-UNREACHABLE` 得 1≠0；`R3-LEGACY-SCOPED-FAIL-CLOSED` 绿）；修复后 = **EXIT 0**。

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
| **EXIT · 变异（§6）** | 每 MUT **1**（**3/3**）· 且日志 `FAIL  <该 MUT 红断言名>` 命中；仅他断言红 → 该格 FAIL |
| **执行顺序** | C-3 commit → BASELINE×3 → C-1+C-2 commit → PC×3 → MUT-1..4 各×3 → 回归 R-a..R-d 各×1 |
| **Ban** | 「PRE dual 裁定脚本名」含糊措辞 · 本 REQUEST **仅**上表脚本名 |

> 注：本 REQUEST 仍 **Ban coding**；`rag03-filter-locus:prove` 脚本登记属授权后执行面。PRE 审的是契约钉死，不是现在 invent 绿。

## 6. R5 · 正控 · 变异 · 回归 · 收据

**MUT 施加方式**：仅 prove worktree 本地临时编辑（C-1 migration 或 C-2 TS）→ 跑 CMD → `git checkout -- <file>` → `git diff --exit-code` EXIT 0 · **Ban commit MUT**。

| 项 | 施加 | 期望（每次 · 3/3） | 红断言名 |
|----|------|------|------|
| **PC** | 修复后原样 | EXIT **0** · F-SCOPE=3 · F-STARVE（P-EXACT）=5 · F-STARVE-RRF=5 · F-LEGACY reject + 静态 0 · P-HNSW 安全断言绿 | — |
| **MUT-1**（保留） | scope 谓词移到外层 `LIMIT` 之后 | EXIT **1** | `R3-MUT-POST-LIMIT-SCOPE`（经 `R3-SCOPE-EXACT` / `R3-STARVE-EXACT-K` 越界或不足） |
| **MUT-2**（保留） | 删 taxonomy 谓词 | EXIT **1** | `R3-MUT-NO-TAXONOMY` |
| **MUT-3**（新） | C-1 中 candidate JOIN **移回内层 LIMIT 之后**（= `0106:85-91` 原形） | EXIT **1** · F-STARVE（P-EXACT）返回 **0** | `R3-MUT-CANDIDATE-POST-LIMIT`（经 `R3-STARVE-EXACT-K`） |
| **MUT-4**（新 · legacy 可达性） | C-2 处恢复 `if (!active) return annSearchLegacy(…)`，并令 `activeQbankGeneration` 在 `rowCount!==1` 时 `return undefined`（不抛） | EXIT **1** · F-LEGACY 返回 ≥1 未经 scope 的 legacy 行 | `R3-MUT-LEGACY-REACHABLE`（经 `R3-LEGACY-SCOPED-FAIL-CLOSED` + `R3-LEGACY-STATIC-UNREACHABLE`） |
| **回归 R-a** | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag04-track-local:prove`（`package.json:240`） | EXIT **0** | — |
| **回归 R-b** | 同 wrapper `pnpm rag03-route:prove`（`:238`） | EXIT **0** | — |
| **回归 R-c** | 同 wrapper `pnpm rag-generation:prove`（`:433` · 无 scope 调用，验证 legacy-无-scope 语义删除死分支后不受影响） | EXIT **0** | — |
| **回归 R-d** | 同 wrapper `pnpm qbank-pipeline:prove`（`:427`） | EXIT **0** | — |

**Ban** 借 R-a..R-d 绿当本刀 R3 关闭证据 · EXIT0 ≠ R3 closed alone。

**收据必录（每 attempt）**：code SHA · `+08:00` 起止 · 隔离 PG 容器名 + image digest（`docker image inspect` RepoDigests）· `SELECT extversion FROM pg_extension WHERE extname='vector'` · `SHOW hnsw.ef_search`（未设记 `default(40)`）· 三计划 EXPLAIN JSON（§4.3）· `HNSW_USED` / `hnswReturned` · 各 fixture 返回 ref 列表与距离 · 红/绿断言名清单 · EXIT。

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

Not a pass · not run · not fixed · not R3 closed · not HNSW-complete（`R3-HNSW-COMPLETENESS` OPEN）· not cutover · not FULLTEXT equiv · not HA · not `releaseEvidence=true` · not nail · alone ≠ dual · PG-retained · ADR pick ≠ coding landed

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · backlog `:71` OPEN · `R3-HNSW-COMPLETENESS` OPEN · STOP

*Harness · GAP-RAG-03 R3 filter-locus ADR + ANN candidate-before-LIMIT fix + Top-K hard-filter prove · AN-RAG-R3 re-PRE ×2 · supersedes c71d354 (→4c93dc5) · FAIL 0e5c5ed + 5f8096a · R1/R2/R4/R6 retained · R3/R5 closed in draft · 2026-10-06 · draft:awaiting_pre_exec_dual · Ban FULLTEXT · Ban Qdrant cutover · PG-retained · alone ≠ dual · STOP*
