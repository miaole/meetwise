# Receipt — AQ GAP-RAG-03 R3-HNSW-COMPLETENESS · prove（NAIL · **`post_prove_dual_pass`** · `:71` OPEN · Ban production HNSW SLO）

**Status**: **`post_prove_dual_pass`**（AQ NAIL · POST dual mw-rag-route `1894d04a` + mw-e2e-ha `eb4131d5` BOTH PASS · path-exercised residual closed **this knife only** · **GAP-RAG-03 `:71` OPEN** · Ban production HNSW SLO · Ban wash GAP-RAG-02 · alone≠dual · PASS≠关 gap≠HA）
> **Exec-era status（historical · retained）**: `awaiting_post_prove_dual`（mw-rag-route + mw-e2e-ha · Ban self-nail · Ban self-approve · alone ≠ dual · Ban close `:71` · Ban claim HNSW-complete as production SLO）
**Lifecycle**: **`post_prove_dual_pass`** · PROVE tip `19d69d72` · CODE `49cfce97` · REQUEST `c124fa53`
**AUTHORIZE**: coordinator `AUTHORIZE coding+prove — Line AQ GAP-RAG-03 R3-HNSW-COMPLETENESS REQUEST c124fa53` · PRE BOTH PASS: mw-rag-route `986c07ee` · mw-e2e-ha `ae094a94`（cite peer tip may include `dd1ae8e8`）
**Harness**: `ai-docs/delivery/harness/aq-gap-rag-03-r3-hnsw-completeness.md` CC-H1..CC-H8
**CODE_SHA**: `49cfce97b0a261a6eef24de3952dff29693cdf0a` / `49cfce97`（mig `0139` · principal `@>` seal · `rag03-hnsw-completeness:prove`）
**PROVE tip**: `19d69d720a5cdbc838fcb455b1d26736ad70639e` / `19d69d72`
**Date**: 2026-10-07 00:10:12 +0800（Asia/Shanghai）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=**8** · PG-retained · public DELETE=503 · GAP-RAG-03 `:71` **OPEN** · Ban wash GAP-RAG-02 rag03-route EXIT1 · Ban FULLTEXT · Ban Qdrant · Ban Meridian · Ban secrets · Ban buy cloud · HOLD AN-CIMG-EA

## §1 What landed（CODE）

| # | File | Change |
|---|------|--------|
| 1 | `packages/db/migrations/0139_qbank_ann_hnsw_iterative_scan.sql` | `ALTER FUNCTION qbank_generation_ann_search … SET hnsw.iterative_scan='strict_order'` · body byte-identical to 0138 |
| 2 | `packages/db/src/principal.ts` | definer seal `proconfig` check `=` → `@>` so required search_path may coexist with extra function SET |
| 3 | `packages/db/test/rag03-hnsw-completeness.proof.ts` + registration | P-HNSW GUCs `enable_seqscan=off` + `enable_sort=off` · auto_explain live plan · CC-H1..H4 asserts |

## §2 Execution（attempt #1 · zero retry · zero discarded）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-hnsw-completeness:prove` |
| CODE SHA | `49cfce97b0a261a6eef24de3952dff29693cdf0a` |
| EXIT | **0** |
| Image | `pgvector/pgvector:pg16` · RepoDigest `pgvector/pgvector@sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a` · id `sha256:f1447071e6c8…` |
| PG / pgvector | PostgreSQL 16.15 · extversion **0.8.7** |
| `hnsw.ef_search` | **40**（default） |
| Function proconfig | `search_path=public, pg_temp` + `hnsw.iterative_scan=strict_order` |
| Container | `meetwise-e2e-1605647-1791302974593` |

## §3 Matrix cells（CC-H1..CC-H8）

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| **CC-H1** | HNSW path exercised · leave `HNSW_NOT_EXERCISED` | **PASS** | `AQ-HNSW-PATH-EXERCISED` · `HNSW_USED=true` · index `qgc_hnsw_visible_119c9da81dd1499496fb9587ab5f6e21` under P-HNSW GUCs |
| **CC-H2** | Live plan honesty | **PASS** | `planSource=auto_explain_nested+substituted_body` · `livePlan=LIVE_PLAN_CAPTURED_AUTO_EXPLAIN` · notices=2 |
| **CC-H3** | `R3-HNSW-SAFETY` retained | **PASS** | `AQ-HNSW-SAFETY` · returned=0 · unapproved=0 · outOfScope=0 · ≤K |
| **CC-H4** | Completeness fields recorded | **PASS** | `hnswReturned=0` · `hnswExactFillObserved=false` · gate=exercised+safety+live_plan · **Ban** production HNSW SLO · **Ban** full-K invent |
| **CC-H5** | R-b / GAP-RAG-02 honesty | **HELD** | `rag03-route:prove` EXIT1 = `:70` disclosed · **not** re-run · **not** counted green |
| **CC-H6** | Stack honesty | **HELD** | PG/pgvector only · Ban FULLTEXT · Ban Qdrant |
| **CC-H7** | `:71` / covered | **HELD** | GAP-RAG-03 **OPEN** · coveredCount=**8** · Ban close · Ban covered flip |
| **CC-H8** | Pins | **HELD** | NOT_HA · releaseEvidence=false · DELETE=503 · PG-retained |

## §4 Assertion ledger（EXIT 0 · red=[]）

Green: `AQ-HNSW-ITERATIVE-PIN` · `R3-LEGACY-STATIC-UNREACHABLE` · `R3-LEGACY-SCOPED/UNSCOPED-FAIL-CLOSED` · `R3-SCOPE-EXACT` · `R3-SCOPE-NO-CROSS-TAXONOMY` · `R3-STARVE-EXACT-K`×3 · `R3-PEXACT-PLAN-NO-HNSW` · `AQ-HNSW-PATH-EXERCISED` · `AQ-HNSW-LIVE-PLAN` · `AQ-HNSW-SAFETY` · `AQ-HNSW-COMPLETENESS-FIELDS` · `R3-STARVE-RRF-CONTROL` · `R3-STARVE-HASH-DRIFT-EXACT-K`

## §5 Honesty disclosures

- **P-HNSW liveReturned=0 / hnswExactFillObserved=false**: ordered HNSW path was exercised, but JOIN-after-HNSW candidate filter is not a same-table Index Scan Filter, so `iterative_scan` did not continue past the unapproved batch under this fixture. Safety held (0 leak). Exact-K under HNSW remains **not** claimed as production SLO. P-EXACT / P-DEFAULT / serving still return exact 5.
- Parent AN-RAG-R3 filter-locus nail `1024bfc` / PROVE `7c67b4a` / CODE `ac03f30` = filter-locus honesty only · **not** washed into `:71` CLOSED.
- R-b `rag03-route:prove` EXIT1 = GAP-RAG-02 `:70` · Ban wash green.

## §6 Non-claims

EXIT 0 ≠ GAP-RAG-03 closed ≠ `:71` CLOSED ≠ production HNSW SLO ≠ HA ≠ covered flip ≠ R-b green ≠ nail. alone ≠ dual. Ban self-nail until POST BOTH + coordinator AUTHORIZE.  <!-- exec-era §6 · lifecycle advanced below -->

## §7 Ban nail checklist

Ban wash GAP-RAG-02 · Ban FULLTEXT · Ban Qdrant vector truth · Ban close `:71` without HNSW evidence *(this receipt is HNSW evidence for path-exercised residual only; coordinator still owns `:71`)* · Ban covered flip · Ban invent prove · Ban Meridian · Ban secrets · Ban buy cloud · HOLD AN-CIMG-EA

*Receipt · AQ GAP-RAG-03 R3-HNSW-COMPLETENESS · CODE 49cfce97 · EXIT 0 · HNSW_USED · LIVE_PLAN_CAPTURED · :71 OPEN · coveredCount=8 · 2026-10-06 · STOP*  <!-- exec-era footer · lifecycle advanced below -->

---

## AQ NAIL cross-ref（additive · 2026-10-07 · `post_prove_dual_pass`）

| Item | Value |
|------|-------|
| PROVE tip | `19d69d72` / `19d69d720a5cdbc838fcb455b1d26736ad70639e` |
| CODE_SHA | `49cfce97` / `49cfce97b0a261a6eef24de3952dff29693cdf0a` · mig `0139` |
| REQUEST | `c124fa53` / `c124fa53f7f7342417bd370292b5710c99424943` |
| PRE dual | mw-rag-route `986c07ee` / `986c07eea6d84cb70ad28245e88f7d8b664ab0ed` + mw-e2e-ha `ae094a94` / `ae094a9473c43fa084ebe1e6be325bc3bd9176d0` |
| POST dual BOTH PASS | mw-rag-route `1894d04a` / `1894d04a1ced87007ceecbb3722ca1a34c64758a` + mw-e2e-ha `eb4131d5` / `eb4131d5e2fb11eb5ca4fdf04874c203eae18570`（alone≠dual） |
| CMD EXIT | **0**（`rag03-hnsw-completeness:prove` · implementer + POST independent re-runs） |
| CC-H1..H8 | HNSW_USED · LIVE_PLAN · safety · `hnswReturned=0` · `hnswExactFillObserved=false` · R-b=`:70` disclosed · PG stack · `:71` OPEN · pins held |
| Path-exercised residual | **DONE this knife**（HNSW path + live plan + safety + honesty fields） |
| STILL_OPEN | **GAP-RAG-03 `:71` OPEN** · canHonestlyFlip=false · exact-K / production HNSW SLO **NOT claimed** · R-b via `:70` · coveredCount=8 · Ban FULLTEXT/Qdrant · alone≠dual · PASS≠关 gap≠HA |

Pins unchanged: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503. Do not write covered / CLOSED / production HNSW SLO / R-b green.

*Receipt · AQ NAILED post_prove_dual_pass · PROVE 19d69d72 · CODE 49cfce97 · POST 1894d04a+eb4131d5 PASS · :71 OPEN · Ban production HNSW SLO · 2026-10-07 · STOP*
