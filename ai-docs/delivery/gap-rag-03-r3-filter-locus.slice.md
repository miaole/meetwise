# Slice — **GAP-RAG-03 · R3 filter-locus ADR + ANN candidate-before-LIMIT fix + Top-K hard-filter prove**（Line AN-RAG-R3 · `draft:awaiting_pre_exec_dual` · re-PRE rewrite ×2）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST rewrite **×2 re-PRE** · supersedes `c71d354`（→`4c93dc5`）· cites Re-PRE FAIL `0e5c5ed`（R3/R5）+ PRE FAIL `5f8096a` · Ban coding until PRE BOTH PASS + AUTHORIZE · PG-retained）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` @ `eae1e19` + AN-PERF-TEAR rewrite ×2（parent · Ban touch sibling AN · Ban AN-CIMG-EA）
**Prior REQUESTs**: `c71d3547744900d4b6a70e64402a6c9baa40f6f6`（superseded）· `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d` · **FAIL**: `0e5c5edfb606ec8b7f5ad376e3d45d1d96306d58` · `5f8096a7cea8ee01787b60d69c6773e444a4a086`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban self-approve · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push

## One-line

backlog `:71` **GAP-RAG-03 OPEN**。rewrite ×2 解除 `0e5c5ed` 未清项：**R3①** 编码范围（本刀内 · AUTHORIZE 后）= 新 migration 把 `qbank_retrieval_candidate` JOIN 移入 `qbank_generation_ann_search` 内层 `ORDER BY`/`LIMIT greatest(k*8,40)` **之前**（签名/owner/ACL 不变）；**R3②** F-STARVE（45 近未批准 + 5 远已批准 + 10 越界 · K=5 dense）修复前精确 **0** → 修复后精确 **5**；**R3③** §2=目标态 / §3=现状缺陷 D-ANN-1 · 矛盾消除；**R3④** HNSW 定案「显式期望+EXPLAIN」：P-EXACT 精确 5 · P-HNSW 仅钉安全 · `R3-HNSW-COMPLETENESS` OPEN · 不改 ef_search/iterative_scan；**R3⑤** 读码更正：`activeQbankGeneration` 抛错永不 falsy → legacy `:229-233` 死代码 · 本刀删除使结构不可达 · 前 EXIT1/后 EXIT0；**R5** MUT-3 candidate-post-LIMIT · MUT-4 legacy-reachable · PC 3/3 EXIT0 · MUT 3/3 EXIT1 · 收据 extversion+digest+EXPLAIN。R1/R2/R4/R6 钉值保留。**PG-retained** · Ban MySQL/Qdrant/FULLTEXT · coveredCount=8。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-rag-03-r3-filter-locus.md`（rewrite） |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-gap-rag-03-r3-filter-locus-mw-rag-route.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-gap-rag-03-r3-filter-locus-mw-e2e-ha.md` |

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban wash R2 as R3 · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban product/infra code（本轮）· Ban commit MUT · Ban 改 HNSW knobs · Ban touch AN-PRIV-EXT/MOP product · HOLD AN-CIMG-EA · Ban Redis cutover · Ban MODEL-OP closed claim · GAP-RAG-03 stays OPEN。

*Slice · GAP-RAG-03 R3 filter-locus · AN-RAG-R3 re-PRE ×2 · supersedes c71d354 · FAIL 0e5c5ed + 5f8096a · draft:awaiting_pre_exec_dual · STOP*
