# REQUEST — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Rewrite**: **supersedes REQUEST `4c93dc5`** · cites mw-rag-route PRE-EXEC FAIL **`5f8096a`**（`5f8096a7cea8ee01787b60d69c6773e444a4a086`）**R1–R6 addressed** · Ban coding · GAP-RAG-03 OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-rag-03-r3-filter-locus.md` · slice `gap-rag-03-r3-filter-locus.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` tip（Ban touch AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA / AN-PERF-TEAR files beyond cite）
**Prior REQUEST**: `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（superseded）
**Date**: 2026-10-06
**Line**: **AN-RAG-R3**（wave AN · re-PRE）

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

## 请审什么（mw-e2e-ha · re-PRE · R1–R6）

Line AN-RAG-R3 · GAP-RAG-03 R3 filter-locus。本 stub = **re-PRE rewrite**（**supersedes `4c93dc5`** · cites FAIL **`5f8096a`** · 解除 R1–R6）。请审：

1. **R1 ADR 定案**：SECURITY DEFINER SQL WHERE **before** `ORDER BY <=>` / `LIMIT` · **否决** Qdrant payload/全文与 post-Top-K · 对齐 PG-only / `adr-postgres-retained`。
2. **R2 行锚**：`qbank-generation-retrieval.ts:60-65/:221-275` · `0106:55-92/:94-131` · `0029:205` · `0068:111+`。
3. **R3 starvation**：K=5 仅 3 in-scope → 恰 3 · 0 越界 · 披露 HNSW post-filter + legacy `:229-233` 无 scope / fail-closed。
4. **R4 LOOP §3③**：CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove` · attempts=3 · EXIT 钉死。
5. **R5 PC+MUT+回归**：正控 =K · MUT post-LIMIT / no-taxonomy EXIT≠0 · `rag04-track-local` / `rag03-route` / `rag-generation` / `qbank-pipeline` EXIT0 · Ban 借绿。
6. **R6 证据**：隔离真 PG+pgvector · SECURITY DEFINER→显式 WHERE 隔离 · Ban MySQL/Qdrant/FULLTEXT 路径。

Pins/SSOT：coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · Ban invent · EXIT0 ≠ R3 closed alone ≠ cutover ≠ HA。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban invent coveredCount · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite · supersedes 4c93dc5 · FAIL 5f8096a R1–R6 · Ban coding · GAP-RAG-03 OPEN · awaiting expert re-PRE dual · STOP*
