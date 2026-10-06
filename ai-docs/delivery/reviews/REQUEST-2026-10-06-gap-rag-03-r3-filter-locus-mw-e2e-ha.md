# REQUEST — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×2 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Rewrite ×2**: **supersedes REQUEST `c71d354`**（`c71d3547744900d4b6a70e64402a6c9baa40f6f6` · itself superseded `4c93dc5`）· cites mw-rag-route Re-PRE FAIL **`0e5c5ed`**（`0e5c5edfb606ec8b7f5ad376e3d45d1d96306d58`）**R3 CRITICAL + R5 + Cond 1–2 addressed** · R1/R2/R4/R6（cleared @0e5c5ed）pins retained · Ban coding · GAP-RAG-03 OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-rag-03-r3-filter-locus.md` · slice `gap-rag-03-r3-filter-locus.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `eae1e19` + AN-PERF-TEAR rewrite ×2 parent（Ban touch AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA / AN-PERF-TEAR files beyond cite）
**Prior REQUESTs**: `c71d3547744900d4b6a70e64402a6c9baa40f6f6`（superseded）· `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（superseded）
**Date**: 2026-10-06
**Line**: **AN-RAG-R3**（wave AN · re-PRE ×2）

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

## 请审什么（mw-e2e-ha · re-PRE ×2 · 仅 `0e5c5ed` 未清项 + 保留项核对）

Line AN-RAG-R3 · GAP-RAG-03 R3 filter-locus。本 stub = **re-PRE rewrite ×2**（supersedes `c71d354` · cites FAIL `0e5c5ed`）。harness = `harness/gap-rag-03-r3-filter-locus.md`。请审：

1. **R3① 修复在本刀编码范围内**（§4.1 C-1）：新 migration（预期 `0138_qbank_ann_candidate_before_limit.sql` · 他线占号则顺延披露）`CREATE OR REPLACE qbank_generation_ann_search` · 签名/`SECURITY DEFINER`/`search_path` 同 `0106:55-61` · candidate JOIN 移入 `ann` CTE（`0106:73` 后）· 位于 `ORDER BY :84` / `LIMIT greatest(k*8,40) :85` **之前** · 外层删 `:89` JOIN · 不新增函数 / manifest 不变。
2. **R3② 期望钉死**（§4.2）：F-STARVE（45 近 in-scope 未批准 · 5 远 in-scope 已批准 · 10 最近越界 · K=5 dense）→ 修复前精确 **0** · 修复后精确 **5**（0 未批准 · 0 越界 · 距离升序）；F-SCOPE 3/3 保留；F-STARVE-RRF 对照 5/5；fixture 不可构造 → `FIXTURE_UNREACHABLE` = FAIL。
3. **R3③ 矛盾消除**（§3）：§2 = ADR 目标态；§3 = tip 现状缺陷 **D-ANN-1**（不再「保留风险」）；修复后两者一致。
4. **R3④ HNSW 定案「显式期望 + EXPLAIN」**（§4.3）：P-EXACT（`enable_indexscan/bitmapscan=off` · EXPLAIN 无 `qgc_hnsw_visible_`）→ 精确 5；P-DEFAULT 记录 `HNSW_USED`；P-HNSW（`enable_seqscan=off` · EXPLAIN 含 HNSW）→ 仅钉安全（0 未批准/0 越界/≤5）· 完整性 = `R3-HNSW-COMPLETENESS` **OPEN** · 不改 `ef_search`/`iterative_scan`。EXPLAIN 作用于 `pg_get_functiondef` 目录函数体。
5. **R3⑤ legacy**（§4.4）：读码更正 —— `activeQbankGeneration`（`qbank-generation-retrieval.ts:114-120`）无 active 即抛错、永不 falsy → `:229-233` 在 tip 为死代码（带 scope 亦不可达）；本刀 C-2 删除该分支 → 结构性不可达；F-LEGACY：修复前 proof EXIT **1**（`R3-LEGACY-STATIC-UNREACHABLE` 红）· 修复后 EXIT **0**。
6. **R5**（§5/§6）：MUT-3 `R3-MUT-CANDIDATE-POST-LIMIT`（JOIN 移回 LIMIT 后 → F-STARVE 0）· MUT-4 `R3-MUT-LEGACY-REACHABLE`（恢复分支 + active 返回 undefined）· MUT-1/2 保留；BASELINE 3/3 EXIT 1 · PC **3/3 EXIT 0** · 每 MUT **3/3 EXIT 1** + 红断言名命中；MUT 仅本地临时、Ban commit、`git diff --exit-code` 0；收据必录 `extversion` · image digest · `hnsw.ef_search` · EXPLAIN JSON。
7. **保留核对**：R1 ADR（PG-only · 否决 Qdrant/post-Top-K/FULLTEXT）· R2 锚点 · R4 CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove` · R6 隔离真 PG+pgvector（`run-e2e-isolated.mjs:1728`）· 回归 `package.json` @tip `:240/:238/:433/:427` EXIT0 · Ban 借绿。

Ban MySQL FULLTEXT · Ban Qdrant cutover · Ban wash R2 as R3 · EXIT0 ≠ R3 closed alone · **GAP-RAG-03 stays OPEN** · coveredCount=8 · 不代签 peer `mw-rag-route` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban invent coveredCount · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code（本轮）· Ban commit MUT · Ban 改 HNSW knobs · Ban touch AN-PRIV-EXT/MOP product · HOLD AN-CIMG-EA · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×2 · supersedes c71d354 · FAIL 0e5c5ed (R3/R5) · Ban coding · GAP-RAG-03 OPEN · awaiting expert re-PRE dual · STOP*

---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `c71d354` · cites FAIL `0e5c5ed`** · R3①–⑤ / R5 / Cond1–2 landed in harness §3/§4.1–§4.4/§5/§6 · R1/R2/R4/R6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · GAP-RAG-03 OPEN · Ban coding · Ban MySQL/Qdrant/FULLTEXT · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史正文原样保留。
