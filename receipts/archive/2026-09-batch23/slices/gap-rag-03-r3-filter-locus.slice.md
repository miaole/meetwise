# Slice — **GAP-RAG-03 · R3 filter-locus ADR + ANN candidate-before-LIMIT fix + Top-K hard-filter prove**（Line AN-RAG-R3 · NAIL · **`post_prove_dual_pass`** · GAP-RAG-03 **OPEN** · R3-HNSW-COMPLETENESS **OPEN** · R-b disclosed GAP-RAG-02 `:70`）

**Status**: **`post_prove_dual_pass`**（AN-RAG-R3 nail · PROVE tip `7c67b4a` · CODE `ac03f30` · C-3 `264e1d7` · mig `0138` · POST dual mw-rag-route `f93d6ad` + mw-e2e-ha `a1de77d` BOTH PASS · PC 0/0/0 · MUT 1/1/1 · R-b EXIT1 pre-existing = GAP-RAG-02 `:70` disclosed · **GAP-RAG-03 stays OPEN** · **R3-HNSW-COMPLETENESS OPEN** · coveredCount=8 · alone≠dual · PASS≠关 gap≠HA）

> **Exec-era status（historical · retained）**: **`awaiting_post_prove_dual`** after prove `7c67b4a` · earlier **`draft:awaiting_pre_exec_dual`** · Verdict **PENDING**（docs REQUEST rewrite **×3 re-PRE** · supersedes `c515a8c`（→`c71d354`→`4c93dc5`）· cites Re-PRE2 PASS-with-Cond `4e16dfa`（**Cond-1 BLOCKING pre-AUTHORIZE** · Cond-2..6）+ Re-PRE FAIL `0e5c5ed`（R3/R5）+ PRE FAIL `5f8096a` · Ban coding until PRE BOTH PASS + AUTHORIZE · PG-retained）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` @ `20da721`（anchors re-verified · `eae1e19..20da721` docs-only）· AN-PERF-TEAR = sibling **Ban touch** · Ban touch sibling AN · HOLD AN-CIMG-EA
**Prior REQUESTs**: `c515a8c08aeb904a2579f0d1d38ec4e93aa183c9`（×2 · superseded）· `c71d3547744900d4b6a70e64402a6c9baa40f6f6`（superseded）· `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d` · **FAIL**: `0e5c5edfb606ec8b7f5ad376e3d45d1d96306d58` · `5f8096a7cea8ee01787b60d69c6773e444a4a086`
**Authority**: meetwise — AUTHORIZE nail AN-RAG-R3 · honesty dual-pass close of this REQUEST knife · **≠** GAP-RAG-03 closed · **≠** HNSW-complete · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push
> Exec-era authority（historical）: L0 docs only · Ban coding · Ban prove · Ban self-approve

## One-line

backlog `:71` **GAP-RAG-03 OPEN**。rewrite ×2 解除 `0e5c5ed` 未清项：**R3①** 编码范围（本刀内 · AUTHORIZE 后）= 新 migration 把 `qbank_retrieval_candidate` JOIN 移入 `qbank_generation_ann_search` 内层 `ORDER BY`/`LIMIT greatest(k*8,40)` **之前**（签名/owner/ACL 不变）；**R3②** F-STARVE（45 近未批准 + 5 远已批准 + 10 越界 · K=5 dense）修复前精确 **0** → 修复后精确 **5**；**R3③** §2=目标态 / §3=现状缺陷 D-ANN-1 · 矛盾消除；**R3④** HNSW 定案「显式期望+EXPLAIN」：P-EXACT 精确 5 · P-HNSW 仅钉安全 · `R3-HNSW-COMPLETENESS` OPEN · 不改 ef_search/iterative_scan；**R3⑤** 读码更正：`activeQbankGeneration` 抛错永不 falsy → legacy `:229-233` 死代码 · 本刀删除使结构不可达 · 前 EXIT1/后 EXIT0；**R5** MUT-3 candidate-post-LIMIT · MUT-4 legacy-reachable · PC 3/3 EXIT0 · MUT 3/3 EXIT1 · 收据 extversion+digest+EXPLAIN。R1/R2/R4/R6 钉值保留。

**×3（Re-PRE2 `4e16dfa` 条件）**：**Cond-1（BLOCKING）** 定案 = C-2 同时把 `qbank-generation-retrieval.ts:113` 文档注释改写为钉死文本（不含 `annSearchLegacy` / `retrieval-legacy`）+ `R3-LEGACY-STATIC-UNREACHABLE` = 全文字面计数（不剥注释 · 不做形态匹配）两 token 各 0；修复前计数更正 **3/1** → 修复后 **0/0**；Ban prove 期间改断言。**Cond-2** 回归 R-e `qbank-integrity-upgrade:prove`（`package.json:429`）EXIT0 + fixture F-LEGACY-NOSCOPE（无 active · 无 scope → reject `qbank_active_generation_missing`）。**Cond-3** R-c = 有 active 的无 scope serving 路径，≠ legacy。**Cond-4** `run-e2e-isolated.mjs` 登记 4 处（`:1262` `:1450` `:1694` 分派 `:2202`）。**Cond-5** MUT-4 只钉 EXIT1 + 红断言名，`legacyReturned` 仅记录。**Cond-6** EXPLAIN = 替换体计划（`planSource=substituted_body`）≠ live 调用计划，硬门禁只看真实调用返回值，`LIVE_PLAN_NOT_CAPTURED` 入收据。**PG-retained** · Ban MySQL/Qdrant/FULLTEXT · coveredCount=8。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-rag-03-r3-filter-locus.md`（rewrite ×3） |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-06-gap-rag-03-r3-filter-locus-mw-rag-route.md`（PRE `d83c561` · POST § `f93d6ad`） |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-06-gap-rag-03-r3-filter-locus-mw-e2e-ha.md`（PRE `eb8fb09`）· POST `reviews/REQUEST-2026-10-06-an-rag-r3-post-mw-e2e-ha.md`（`a1de77d`） |
| Prove receipt | `receipts/gap-rag-03-r3-filter-locus/2026-10-06-an-rag-r3-prove.md` |

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban wash R2 as R3 · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban product/infra code（本轮）· Ban commit MUT · Ban 改 HNSW knobs · Ban touch AN-PRIV-EXT/MOP product · HOLD AN-CIMG-EA · Ban Redis cutover · Ban MODEL-OP closed claim · GAP-RAG-03 stays OPEN。

*Slice · GAP-RAG-03 R3 filter-locus · AN-RAG-R3 re-PRE ×3 · supersedes c515a8c (→c71d354) · Re-PRE2 4e16dfa Cond-1..6 addressed · FAIL 0e5c5ed + 5f8096a · draft:awaiting_pre_exec_dual · STOP*  <!-- exec-era footer · lifecycle advanced below -->

---

## AN-RAG-R3 NAIL lifecycle（`post_prove_dual_pass` · 2026-10-06 · additive）

- REQUEST `8d52138` / `8d52138c609108939f113ef248fad4b4375f9e11` · PRE dual BOTH PASS mw-rag-route `d83c561` / `d83c561a570538cc43ab53bbb3e8faf438518a03` + mw-e2e-ha `eb8fb09` / `eb8fb09d36ec8980fd0b19e1e7bc6008c76a7a9c` · C-3 `264e1d7` / `264e1d709b8aa5318b15905d628f78a63bdfe161` · CODE_SHA（C-1+C-2）`ac03f30` / `ac03f3080a02f5ea863b304908815646f4b3d18c` · mig **`0138_qbank_ann_candidate_before_limit.sql`** · PROVE tip **NAILED TO** `7c67b4a` / `7c67b4aa6b890ec7978c575e1e552e51e081cb98` · POST dual BOTH PASS mw-rag-route **`f93d6ad`** / `f93d6ad30491fb546cb43519a56e18cc908c6980` + mw-e2e-ha **`a1de77d`** / `a1de77dd06efde8285daa2b3f61c87ea077f773f`（alone≠dual）。
- EXIT table @ CODE `ac03f30`（`rag03-filter-locus:prove` · implementer receipt 3/3 · POST independent re-runs agree）: BASELINE @`264e1d7` **1/1/1** · PC **0/0/0** · MUT-1..4 each **1/1/1**（red names hit · MUT-2 mapped `R3-SCOPE-EXACT`+`R3-SCOPE-NO-CROSS-TAXONOMY`）· R-a/R-c/R-d/R-e **0** · **R-b `rag03-route:prove` EXIT 1** = pre-existing（same single assertion `未决岗位 start 不抛、返回 started…` red @ base `70cba94` · @C-3 `264e1d7` · @CODE `ac03f30` · delta 0）→ tracked as **GAP-RAG-02 backlog `:70`**（「现有 `rag03-route:prove` 须换夹具或标红（R5）」）· **disclosed · NOT green · Ban count green · Ban covered flip** · static `annSearchLegacy`/`retrieval-legacy` 3/1 → 0/0。
- **STILL_OPEN**: backlog `:71` **GAP-RAG-03 stays OPEN**（canHonestlyFlip=false）· **`R3-HNSW-COMPLETENESS` OPEN**（P-HNSW post-fix = `HNSW_NOT_EXERCISED` · `planSource=substituted_body` · `LIVE_PLAN_NOT_CAPTURED` · completeness unobserved）· **R-b** EXIT 1 pre-existing = GAP-RAG-02 `:70` OPEN tracking（disclosed · Ban count green · Ban covered flip）· **F-STARVE = defence-in-depth**（production reachability NOT proven · builder fact-set vs approval drift）· **F-STARVE-HASH = superuser `DISABLE TRIGGER USER` simulation · supplementary · non-gating**（≠ §4.2 pinned fixture · disclosed）· Ban MySQL/Qdrant/FULLTEXT · alone≠dual · coveredCount=**8** · PASS ≠ 关 gap ≠ HA。
- Pins unchanged: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503. Do not write covered / CLOSED / HNSW-complete / R-b green.
- AUTHORIZE nail landed · Ban MySQL/Qdrant/FULLTEXT · Ban invent covered · Ban wash R-b green · Ban self-approve · Ban Meridian · Ban secrets · Ban force-push · Ban new knives（quota wind-down）。

*Slice · GAP-RAG-03 R3 filter-locus · AN-RAG-R3 NAIL · post_prove_dual_pass · PROVE 7c67b4a · CODE ac03f30 · C-3 264e1d7 · POST f93d6ad+a1de77d PASS · GAP-RAG-03 OPEN · R3-HNSW-COMPLETENESS OPEN · R-b EXIT1 = GAP-RAG-02 :70 disclosed · alone≠dual · STOP*
