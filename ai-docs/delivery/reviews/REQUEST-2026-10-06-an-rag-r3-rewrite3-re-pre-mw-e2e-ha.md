# REQUEST — **GAP-RAG-03 · R3 filter-locus** · re-PRE rewrite3 · mw-e2e-ha

**Verdict**: **PASS**
**REWRITE_SHA**: `8d52138c609108939f113ef248fad4b4375f9e11`（short `8d52138` · supersedes `c515a8c`）
**Line**: AN-RAG-R3 · docs gate only · `draft:awaiting_pre_exec_dual`
**Expert**: `mw-e2e-ha` · **Peer**: `mw-rag-route`（cite not co-sign · rewrite3 peer SHA **cite-when-available** · Cond source cite Re-PRE2 `4e16dfa` PASS-with-Cond-1-BLOCKING @`c515a8c` · earlier FAIL `0e5c5ed`）
**alone ≠ dual** · Ban coding until BOTH PASS + coordinator AUTHORIZE · Ban invent covered/HA · Ban nail · Ban buy cloud · Ban PERF-TEAR touch · HOLD AN-CIMG-EA
**Date**: 2026-10-06 21:00 +08:00
**审查基**: worktree `/tmp/mw-e2e-ha-rag-r3-repre3` · REQUEST+harness @`8d52138` · 源码锚点 @ tip `20da721`（`eae1e19..20da721` docs-only · packages/apps/scripts 零改）· 只读 · 无 prove · 未读 `.env*` · 不代签 peer

## Hard pins（frozen · held）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8**（Ban invent） |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503** |
| GAP-RAG-03 | **OPEN** |
| R3-HNSW-COMPLETENESS | **OPEN** |
| g7SuiteGreen | **false** |

## 阻塞项

**无阻塞**

## Cond-1..6（adversarial vs REQUEST @`8d52138` + tip harness/code）

| Cond | 结果 | 核对 |
|------|------|------|
| **Cond-1（BLOCKING）** | **cleared** | tip `qbank-generation-retrieval.ts` 全文字面：`annSearchLegacy`=**3**（`:113` 注释 · `:231` 解构 · `:232` 调用）· `retrieval-legacy`=**1**（`:231`）——与 ×3 更正 3/1 一致（×2 误记 1 已纠）。§4.1 C-2 ② 钉死 `:113` 替换文本 **不含** `annSearchLegacy`/`retrieval-legacy`；§4.4 `R3-LEGACY-STATIC-UNREACHABLE` = 全文字面计数（不剥注释 · 不做形态匹配）→ 修复后须 **0/0**。内存模拟：仅删 `:229-233` → 残 1/0；删+改写 → **0/0**。只做 ① 不做 ② = PC 红（非断言缺陷）。Ban prove 期间改断言。**Prior STOP 因**：`c515a8c` 时 Cond-1 未关（peer `4e16dfa` Cond-1 BLOCKING · `:113` leftover）。 |
| **Cond-2** | **cleared** | §6 **R-e** `pnpm qbank-integrity-upgrade:prove` 根 `package.json:429` 存在 → `apps/worker prove:qbank-integrity-upgrade`；`qbank-integrity-upgrade.proof.ts:256/:362` 经 `hybridQbankSearch` 断言 poisoned/content_hash 漂移 ref 被排除（= candidate JOIN 语义）。§4.2 **F-LEGACY-NOSCOPE**（无 active · 不传 scope）→ reject `qbank_active_generation_missing` · `R3-LEGACY-UNSCOPED-FAIL-CLOSED`。 |
| **Cond-3** | **cleared** | §6 R-c：`rag-generation:prove`（`:433`）→ `qbank-generation.proof.ts:66` = `hybridQbankSearch(…, { … expectedRecipeId })` **无 scope** —— 有 active 的无 scope **serving** 路径，**不涉及 legacy**（×2「legacy-无-scope」误述已纠）。 |
| **Cond-4** | **cleared** | tip `run-e2e-isolated.mjs` 对 `rag04-track-local:prove:raw` 四处模板均在：`:1262` 依赖表 · `:1450` target 列表 · **`:1694` 命令分派** · `:2202` migrate 列表。C-3 要求新 target 四处**追加**（漏任一 = C-3 未落）。 |
| **Cond-5** | **cleared** | §6 MUT-4 只钉 **EXIT 1（3/3）+ 红断言名**（`R3-LEGACY-STATIC-UNREACHABLE`≥2 + `R3-LEGACY-SCOPED-FAIL-CLOSED` + `R3-LEGACY-UNSCOPED-FAIL-CLOSED` 全命中）；`legacyReturned=<n>` 仅记录（0 亦可，不判）。 |
| **Cond-6** | **cleared** | §4.3：`planSource=substituted_body` ≠ live 调用计划（SECURITY DEFINER 不内联）；硬门禁只看真实函数调用返回值；`HNSW_USED`/`HNSW_NOT_EXERCISED` = 替换体观测；收据 `LIVE_PLAN_NOT_CAPTURED`；Ban 以替换体宣称 live。 |

## 保留 R3 CRITICAL（未回退 · spot-check）

- **C-1** JOIN `qbank_retrieval_candidate` 移入 `ann` CTE、位于 `ORDER BY :84` / `LIMIT greatest(k*8,40) :85` **之前**（新 migration 预期 `0138`；tip 末号确为 `0137`）· tip `0106:88-89` 仍在 LIMIT **之后**（D-ANN-1 现状属实 · 编码仅 AUTHORIZE 后）
- **C-2** 删 `:229-233` 死分支 + `:113` 改写 · `activeQbankGeneration :114-120` 抛错永不 falsy（读码更正成立）
- **F-STARVE** 45 近未批准 + 5 远已批准 + 10 越界 · K=5 dense → 修前 **0** / 修后 **5**（dense `n=k` → 内层 LIMIT 40 复算一致）· F-SCOPE=3 · F-STARVE-RRF=5
- **HNSW** 显式期望+EXPLAIN · `R3-HNSW-COMPLETENESS` **OPEN** · 不改 ef_search/iterative_scan
- **MUT-3/MUT-4** · BASELINE 3/3 EXIT1 · PC 3/3 EXIT0 · 每 MUT 3/3 EXIT1 + 红名
- **收据** `extversion` + image digest + `hnsw.ef_search` + EXPLAIN JSON（substituted_body）
- **R4 CMD** `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove`
- **R6** 隔离真 PG+pgvector · `LEGACY_PG_IMAGE_DEFAULT` @`:1728` = `pgvector/pgvector:pg16`
- **Ban** MySQL FULLTEXT / Qdrant cutover / post-Top-K / wash R2 as R3 · EXIT0 ≠ R3 closed alone

## Spot-checked list

1. `8d52138` 存在 · full `8d52138c609108939f113ef248fad4b4375f9e11` · on origin（祖先 of tip `083cce4`）· docs-only（harness+slice+2 stubs）
2. harness/slice Cond-1..6 表与 §4.1/§4.2/§4.3/§4.4/§6 钉值一致
3. tip `annSearchLegacy`/`retrieval-legacy` 整文件计数 **3/1**；`:113` 仍含 leftover（修前）
4. C-2 钉死替换文本 token 泄漏 = 0；删+改写模拟 → 0/0
5. `0106:84-89` candidate JOIN 仍 post-LIMIT（D-ANN-1）
6. `activeQbankGeneration :114-120` 抛错契约
7. `package.json:238/:240/:427/:429/:433` 回归脚本存在
8. `qbank-generation.proof.ts:66` 无 scope serving
9. `qbank-integrity-upgrade.proof.ts:256/:362` hybrid 排除 poisoned
10. `run-e2e-isolated.mjs` 四处 `:1262/:1450/:1694/:2202` + image `:1728`
11. tip migrations 末号 `0137` → 预期 `0138`
12. backlog `:71` GAP-RAG-03 仍 OPEN · pins 未洗 · coveredCount=8 未 invent
13. 未碰 PERF-TEAR / AN-CIMG-EA / product code

## Non-claims / Ban

- **不** AUTHORIZE coding · **不** claim prove 绿 · **不** flip GAP-RAG-03 · **不** close HNSW residual
- Ban coding until **BOTH** experts PASS + coordinator AUTHORIZE
- Ban nail · Ban invent covered/HA · Ban MySQL/Qdrant/FULLTEXT · Ban self-approve
- alone ≠ dual · peer cite not co-signed · releaseEvidence=false · NOT_HA
- EXIT0 ≠ R3 closed alone · ADR pick ≠ coding landed

## 结论

rewrite ×3 已对 peer `4e16dfa` Cond-1（BLOCKING · `:113` leftover + 计数口径）与 Cond-2..6 做对抗可核的 docs 定案；R3 CRITICAL / R1–R6 钉值未回退。本审 = mw-e2e-ha 单方 re-PRE **PASS** · **alone ≠ dual** · rewrite3 peer 结论 **cite-when-available** · **Ban coding** 直至双方。

*mw-e2e-ha · AN-RAG-R3 rewrite3 re-PRE · PASS · REWRITE_SHA 8d52138 · peer mw-rag-route cite-when-available (Cond src 4e16dfa) · alone≠dual · Ban coding · GAP-RAG-03 OPEN · HNSW OPEN · pins held · STOP*
