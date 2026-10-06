# REQUEST — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-rag-03-r3-filter-locus.md` · slice `gap-rag-03-r3-filter-locus.slice.md`
**Parent tip**: `110532e`（full `110532e81f11064e543bc9bc420b67bb2f95ae1e` · not a prove tip）
**Date**: 2026-10-06
**Line**: **AN-RAG-R3**（wave AN）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-rag-route）

1. **R3 门对齐**：与 `m4-rag-hard-gates.md` §4 / backlog `:71` 是否一致（过滤落点 + 词法等价 + Top-K 前硬过滤）。
2. **Ban MySQL FULLTEXT**：假等价关 R3 是否被硬钉；MATCH/AGAINST 不得当通过条件。
3. **Ban Qdrant cutover**：本刀 ADR/prove 不得宣称向量真相已切 / sole-stack 已迁；PG-retained。
4. **与 R2 分界**：GAP-RAG-02 structural CLOSED ≠ R3 closed · Ban wash。
5. **边界**：docs-only · Dual PASS ≠ coding · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban buy cloud。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban wash R2 as R3 · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · STOP*

## PRE-EXEC @4c93dc5 · mw-rag-route

**时间**：2026-10-06 20:18 +08:00
**REQUEST**：`4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（只改 4 个 docs：harness +68、slice +25、两个 stub 各 +45；docs-only，是 origin tip 的祖先）
**审查基**：临时 worktree `/tmp/mwrr-d269761`（detached；源码读于 `d269761`）· 仅本 box · 只读，无 prove · 未读 `.env*` · 无 live 模型调用
**范围**：独立审查，不代签 mw-e2e-ha · alone ≠ dual

### 已满足

- Ban MySQL FULLTEXT / `MATCH … AGAINST` 假等价（harness `:34`、`:56`）；Ban Qdrant cutover 声称（`:35`）；Ban 把 R2 structural CLOSED 洗成 R3 closed（`:36`）。
- backlog `:71` GAP-RAG-03 保持 OPEN，零 SSOT 改动（`:49-51`）；EXIT0 ≠ R3 closed（`:44`）；Pins 保留（`:4`、`:66`）；未声称 covered。

### 阻断项

**R1 · ADR 没有定案，且候选项含 Qdrant，与 PG-only 冲突。** harness `:28` 的候选为「Qdrant payload filter **或** 关系元数据 join」+「Qdrant 全文 **或** 应用 BM25」，并写「PG-retained 下不强制切栈」，把选择推给 PRE（`:42`）。按 `adr-postgres-retained.md:11-12`，Postgres / pgvector 是唯一向量真相，`@meetwise/qdrant-store` 只是历史原型；Qdrant payload filter / 全文属于新增 Qdrant 路径，被 pin 禁止。
**修复**：ADR 只在 PG 内定案。过滤落点 = SECURITY DEFINER SQL 内、`ORDER BY g.embedding <=> p_embedding` / `LIMIT` 之前的 WHERE 谓词（scope + taxonomy + `visible` + 候选批准）。明确否决 Qdrant payload / 全文以及「Top-K 之后再过滤」。词法通道保持 `to_tsvector('simple', qbank_search_terms(…))`（`0106:112-119`）；若要 BM25，也须在 PG 内实现。backlog `:71` 目标文字里的 Qdrant 选项须在 ADR 中书面写明「在 PG-retained 下不采用」。

**R2 · 现状锚点没有行号，且未核到真实代码。** `:22` 只列函数名。已核实的锚点：
- `packages/db/src/qbank-generation-retrieval.ts:60-65`：`setServingScope` 以 SET LOCAL 写两个 GUC。
- 同文件 `:221-275`：`hybridQbankSearch`。其中 `:227` 设 scope；`:229-233` 在无 active generation 时走 `annSearchLegacy`（**不读 scope**）；`:239` 计算候选数 n；`:255-257` RRF 融合后 `slice(0, k)`。
- `packages/db/migrations/0106_qbank_track_local_serving_scope.sql:55-92`：`qbank_generation_ann_search`。scope 谓词 `:74-83` 位于内层 `ORDER BY` `:84` / `LIMIT greatest(k*8,40)` `:85` 之前；但 `qbank_retrieval_candidate`（批准源）JOIN 在 `:88-89`，位于内层 LIMIT **之后**；外层 `LIMIT k` 在 `:91`。
- lexical：`0106:94-131`（scope 谓词 `:120-128`，在 `ORDER BY` `:130` / `LIMIT` `:131` 之前）。
- distances：`0106:134` 起。
- HNSW 部分索引：`0029_qbank_generation_hybrid_retrieval.sql:205`（`USING hnsw (embedding vector_cosine_ops) WHERE visible`）。
- 候选视图：`0068_qbank_content_fact_immutability.sql:111` 起。
**修复**：把以上锚点逐条写入 harness，并以此作为「过滤在 LIMIT K 之前」主张的依据。

**R3 · Top-K 饥饿与旁路未分析，期望值未钉。** 以下三处都可能让结果少于 K 或绕过过滤，REQUEST 均未提及：
- (a) 批准源过滤（candidate JOIN）落在内层 `LIMIT k*8` 之后（`0106:85-91`）。若最近的 ≥40 行来自未批准源，即使存在合规行，结果也会少于 K，且没有信号。
- (b) pgvector HNSW 遇到选择性 WHERE 时是先扫索引、后过滤（受 `hnsw.ef_search` 限制）。scope 很窄时可能静默少于 K。仓库内未见 `ef_search` / `iterative_scan` 设置，fixture 镜像 `pgvector/pgvector:pg16` 也未钉 pgvector 版本。
- (c) legacy 回退 `:229-233` 完全不应用 scope。
**修复**：钉死期望值：
- K=5、scope 内仅 3 行 → 精确返回 3 行，且 0 条越界。
- 最近的 N（>40）行全在 scope 外 / 未批准，合规行距离更远 → 期望返回数按 ADR 设计钉死（保证返回 K，或声明降级并给出精确值）。
- 声明 pgvector 版本，以及 `ef_search` / iterative scan 策略。
- legacy 回退在带 scope 时须 fail-closed，或说明为何不可达，并给出断言。

**R4 · LOOP §3③（`NORTH-STAR-EXECUTION-LOOP.md:81`）：命令与期望 EXIT 未钉。** `:42` 写「具名 R3 hard-filter prove（PRE dual 裁定…）」，没有脚本名、没有 attempts、没有每条命令的期望 EXIT。
**修复**：给出脚本名（例如 `rag03-filter-locus:prove`，经 `run-e2e-isolated.mjs`，按 C4 增量登记）、完整 wrapper 命令、attempts、期望 EXIT 0，以及各变异期望 EXIT≠0。

**R5 · 没有正控、变异与具名回归。**
**修复**：
- 正控：scope 内多行按距离排序返回、数量 = K。
- 变异 1：把 scope 谓词移到 LIMIT 之后（外层包一层再过滤）→ 越界行出现或数量不足 → EXIT≠0，并钉死红断言名。
- 变异 2：删去 taxonomy 谓词 → 跨 taxonomy 行出现 → EXIT≠0。
- 具名回归及期望 EXIT 0：`rag04-track-local:prove`、`rag03-route:prove`、`rag-generation:prove`、`qbank-pipeline:prove`，并写明 Ban 借这些绿当本刀证据。

**R6 · 证据层与隔离依据未声明。**
**修复**：
- 证据层：`run-e2e-isolated.mjs` 隔离真 PG + pgvector（Ban fake DB）；宿主类沿用 Linux-native-Docker-Engine。
- 隔离依据：检索函数都是 SECURITY DEFINER（会绕过 RLS），所以隔离依靠函数体内的显式谓词（active generation、`visible`、scope / taxonomy、批准源）；qbank 是共享题库，不存在 owner 维度，须写明「租户隔离不适用，scope 隔离以显式谓词为准」。若 ADR 认为需要 owner 维度，须给出谓词或 RLS 设计。
- 声明不引入 MySQL / Qdrant / FULLTEXT 代码路径，并加静态断言。

### 结论

上述 6 项阻断未解除前不得进入 coding / prove。GAP-RAG-03（backlog `:71`）保持 OPEN；PG-retained（Postgres / pgvector / PostgresSaver），禁止 MySQL runtime / Qdrant / MemorySaver / FULLTEXT。Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · public DELETE=503。本审不代签 mw-e2e-ha；alone ≠ dual；coding 须双方 PASS 加协调方 AUTHORIZE。

Verdict: FAIL
