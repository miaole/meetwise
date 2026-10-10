# PASS — G-R4-5 / FUNNEL coveredCount Batch4 · post-prove · mw-rag-route（诚实 partial · 6→7）

**Verdict**: **PASS**（诚实 partial · coveredCount **6→7** · 07 **covered** · 08 **not_covered** + refuse · Ban invent coveredCount=8 · 同 Batch3 honest-partial 模式）  
**Expert**: `mw-rag-route`（独立重跑 + 实证；**alone≠dual** · **Ban自批** · **Ban forge peer**）  
**Domain**: RAG-FUNNEL  
**Date**: 2026-09-23 (~11:13 PT)  
**Tip / HEAD**: `b0f5c5018124f34a937fdfb02dfa47f415d9b07e` · short `b0f5c50` · branch `feat/mysql-schema-skeleton` · **MATCH**  
**Path**: `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch4-post-prove-mw-rag-route.md`  
**Pair**: `…-post-prove-mw-e2e-ha.md`（本专家**未写/未改/未 stage** · **ZERO peer touched** · alone≠dual）  
**Harness**: `harness/g-r4-5-funnel-covered-count-batch4.md` 仍为 **`executed:awaiting_post_prove_dual`**（本审**不翻** `post_prove_dual_pass` · Ban self-nail）  
**Claimed outcome honesty**: **partial** — coveredCount **6→7**（Ban invent=8）· **07 covered** · **08 not_covered** · 02A/02B/03/04/05/06 **covered** retained · product flags **仍 false** · `releaseEvidence=false` · ≠HA · Dual PASS ≠ product closed

---

## 1. Tip 核验

| 项 | 值 |
|----|----|
| 期望 tip | `b0f5c50` / full `b0f5c5018124f34a937fdfb02dfa47f415d9b07e` |
| `git -C /workspace/meetwise rev-parse HEAD` | `b0f5c5018124f34a937fdfb02dfa47f415d9b07e` |
| branch | `feat/mysql-schema-skeleton` |
| commit subject | `feat(g-r4-5): FUNNEL coveredCount Batch4 07+08 under authorize (awaiting_post_prove_dual)` |
| REQUEST tip（历史钉） | `1e8edcd`（standing authorize 前提 · 本审承认不重审 pre-exec） |
| 结果 | **MATCH** · 非 BLOCKED |

---

## 2. 独立重跑（本专家现场执行 · Ban idle claim · Ban wash）

| CMD | EXIT | 现场读法 |
|-----|------|----------|
| `pnpm r4-funnel-covered-count-batch4:prove` | **0** | Batch4 honest emit · coveredCount=**7** · 07=**true** · 08=**false** · `batch4CoveredCount=1` · `coveredIds=["RAG-FUNNEL-07"]` · `funnel07ProductionConsumerWired=true` · 02A/02B/03/04/05/06 retained · product flags **false** · `batch4Only=true` · `coveredCountInvented=false` · `releaseEvidence=false` · harness 仍 `executed:awaiting_post_prove_dual` · Ban invent coveredCount=8 · Ban self-nail dual_pass · 08 refuse=`production-equivalent eval matrix not evidenced` |
| `pnpm r4-eg2-funnel-covered:prove` | **0** | EG2 Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4-aware · coveredCount matches assessors **got=7 expect=7** · 02A–06 **covered** retained · 07 status matches Batch4 assessor **covered** · 08 **not_covered** · 01 ≠ invent covered · `inventCovered=false` · `releaseEvidence=false` |

**Ban**：未把 EXIT=0 洗成 coveredCount=**8** 或 R4/FUNNEL/G-R4-5 product closed；未用 Batch3b tip `85be7ad` / prove `9aa1be4`（coveredCount **6**）洗成「本刀双抬 07+08」；未 idle 宣称 EXIT 而不重跑。

---

## 3. Live matrix / JSON（VERIFY · Ban invent）

来源（本轮独立 prove 写出 / 核对）：

- `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4-evidence.json`
- `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4-prove.md`
- `receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json`
- `rag-funnel-01-08-covered-matrix.md`
- harness `harness/g-r4-5-funnel-covered-count-batch4.md`

### Batch4 evidence pins

| Pin | Live | Honest |
|-----|------|--------|
| `kind` | `FunnelCoveredCountBatch4Evidence` | Batch4Only |
| `batch4Only` | **true** | 本刀范围钉 |
| matrix `coveredCount` | **7** | **6→7** · Ban invent=8 · Batch1–3b 02A–06 + Batch4 **仅** 07 |
| `batch4CoveredCount` | **1** | = `coveredIds.length` |
| `coveredIds` | `["RAG-FUNNEL-07"]` | **不含** 08 |
| `funnel07Covered` | **true** | matches assessor · free-text allowlisted scope funnel |
| `funnel08Covered` | **false** | matches assessor · **honest refuse** |
| `funnel07ProductionConsumerWired` | **true** | 07 covered 前置钉 |
| `funnel07RefuseReason` | `null` | covered |
| `funnel08RefuseReason` | `production-equivalent eval matrix not evidenced` | 与 matrix Basis 一致 |
| `coveredCountInvented` | **false** | 非伪造计数 |
| `r4ProductClosed` | **false** | **本刀不翻** · R4 STILL OPEN |
| `funnelProductClosed` | **false** | **本刀不翻** · FUNNEL STILL OPEN |
| `gR45Closed` | **false** | **本刀不翻** · G-R4-5 STILL OPEN |
| `ms3EqualsR4Closed` | **false** | **Ban MS3=R4** |
| `releaseEvidence` | **false** | **≠HA** |

### Assessor seam pins

| Assessor | Key pins | Covered? |
|----------|----------|----------|
| FUNNEL-07 | domainFreeTextRoutePresent · dbClassifyFreeTextScopePresent · noPrivilegeExpansionPinned · dbExportsFreeTextRoute · **productionConsumerWired=true** · noRetrievalGrantOnFunnel | **true** |
| FUNNEL-08 | multiLangHoldoutPresent=true · perLeafRecallReported=**false** · wrongTrackZeroHardAssert=**false** · p95CostThresholdsPreRegistered=**false** · releaseReceiptsBound=**false** · notLocalFakeAlone=**false** | **false** |

### EG2 matrix live

| ID | Status | Note |
|----|--------|------|
| `RAG-FUNNEL-01A` | `source_sealed` | ≠ invent covered |
| `RAG-FUNNEL-01` | `product_surfaces_true` | ≠ invent covered |
| `RAG-FUNNEL-02A` | **`covered`** | Batch2 retained |
| `RAG-FUNNEL-02B` | **`covered`** | Batch2b retained · Ban wash |
| `RAG-FUNNEL-03` | **`covered`** | Batch1 retained |
| `RAG-FUNNEL-04` | **`covered`** | Batch1 retained |
| `RAG-FUNNEL-05` | **`covered`** | Batch3b retained · Ban wash |
| `RAG-FUNNEL-06` | **`covered`** | Batch3b retained · Ban wash |
| `RAG-FUNNEL-07` | **`covered`** | Batch4 · free-text allowlisted scope funnel · productionConsumerWired=true |
| `RAG-FUNNEL-08` | **`not_covered`** | refuse `production-equivalent eval matrix not evidenced` · Ban invent |
| matrix `coveredCount` | **7** | inventCovered=**false** · releaseEvidence=**false** · **≠8** |

---

## 4. 07 covered / 08 诚实 refuse（Ban invent=8）

| ID | Meaning | Live | Ruling |
|----|---------|------|--------|
| `RAG-FUNNEL-07` | free-text allowlisted scope funnel（rules→light model→clarification · typed allowlisted track · **no** read/tool grant） | **covered** · `productionConsumerWired=true` | true-cover affirmed |
| `RAG-FUNNEL-08` | production-equivalent eval matrix（multi-lang holdout · per-leaf Recall@K · wrong-track=0 · P95/cost · release receipts） | **not_covered** · refuse `production-equivalent eval matrix not evidenced` | **honest refuse** · Ban invent |

→ `batch4CoveredCount=1` · coveredCount **6→7** · **非假盖章 / 非 invent=8**。

若报 coveredCount=8 或 08 covered（在 `releaseReceiptsBound=false` 等钉为 false 时）→ 本审会 **FAIL**；本案 **否**。

模式对齐：Batch3 tip `bd3a800` / prove `e468de9` 曾对 05/06 honest refuse 且 Dual PASS ≠ invent · 本刀 08 同型 partial。

---

## 5. 02A–06 retained（Ban wash Batch3b / priors）

| ID | Status | Note |
|----|--------|------|
| `RAG-FUNNEL-02A` | **covered** | Batch2 tip `0a980e6` retained |
| `RAG-FUNNEL-02B` | **covered** | Batch2b tip `ddfb64d` / prove `824e072` retained |
| `RAG-FUNNEL-03` | **covered** | Batch1 tip `5519078` retained |
| `RAG-FUNNEL-04` | **covered** | Batch1 tip `5519078` retained |
| `RAG-FUNNEL-05` | **covered** | Batch3b tip `85be7ad` / prove `9aa1be4` retained · **≠ wash** into invent 08 |
| `RAG-FUNNEL-06` | **covered** | Batch3b retained · Ban wash |

**Ban wash Batch3b**：承认 prior 钉 coveredCount **6** / 05/06 **covered** · **不是**把 `85be7ad`/`9aa1be4` 改写成「08 也 covered / coveredCount=8」。本刀 baseline=6 · after=7 · honest partial。

---

## 6. Product flags still false · R4/FUNNEL/G-R4-5 STILL OPEN

| Flag | Live | Ruling |
|------|------|--------|
| `r4ProductClosed` | **false** | **本刀不翻** · R4 product **STILL OPEN** |
| `funnelProductClosed` | **false** | **本刀不翻** · FUNNEL product **STILL OPEN** |
| `gR45Closed` | **false** | **本刀不翻** · G-R4-5 **STILL OPEN** |
| `ms3EqualsR4Closed` | **false** | **Ban MS3=R4** |
| harness status | **`executed:awaiting_post_prove_dual`** | 本审**不翻** · Ban self-nail `post_prove_dual_pass` |

**Ban claim**：本刀 Dual PASS ≠ R4/FUNNEL/G-R4-5 product closed · ≠假关 · ≠HA · `releaseEvidence` 保持 **false** · Dual PASS ≠ next knife auto-authorize · Ban second knife。

---

## 7. 非洗非发明核对

| 禁项 | 本审 |
|------|------|
| invent coveredCount=8 | **否** · 诚实 **7** |
| invent 08 covered | **否** · not_covered + refuse 钉 |
| wash Batch3b `85be7ad`/`9aa1be4` | **否** · 承认 baseline=6 · 不洗成双抬 |
| wash Batch3/Batch2b/Batch2/Batch1/product-close/EG3 | **否** |
| MS3=R4 | **否** · `ms3EqualsR4Closed=false` |
| silent nail harness → `post_prove_dual_pass` | **否** · 仍 `awaiting_post_prove_dual` |
| forge peer `…-mw-e2e-ha.md` | **否** · ZERO peer |
| 读 `.env*` / Meridian / Cloud Agent | **否** |

---

## 8. Verdict 理由（PASS · honest partial）

1. HEAD **MATCH** `b0f5c5018124f34a937fdfb02dfa47f415d9b07e`
2. 独立 2× prove **EXIT=0**（batch4 + eg2）
3. coveredCount **6→7 honest** · Ban invent=8
4. 07 **covered** · free-text allowlisted scope funnel · `productionConsumerWired=true`
5. 08 **honestly not_covered** · refuse `production-equivalent eval matrix not evidenced` · 与 JSON/matrix 一致
6. 02A–06 **covered** retained · product flags **false** · `releaseEvidence=false` · ≠HA · harness **未**被本审 self-nail
7. ZERO peer confirmed

**PASS ≠ product closed** · **PASS ≠ coveredCount=8** · 诚实 partial 可 Dual PASS（同 Batch3）。

---

## 9. Blockers

无阻塞本审 PASS 的项。后续（**非本审职责 · Ban second knife**）：

- 若要抬 08：须 production-equivalent eval matrix 实证（per-leaf Recall@K · wrong-track=0 · P95/cost 预登记 · release receipts bound · ≠ local fake alone）· 再 dedicated prove
- product close / `gR45Closed` = **separate knives** · Dual PASS ≠ auto-authorize
- harness nail → `post_prove_dual_pass` 仅在 dual BOTH PASS 后由授权路径执行 · Ban self-nail

---

*mw-rag-route · post-prove · G-R4-5 / FUNNEL coveredCount Batch4 · 2026-09-23 (~11:13 PT) · PASS honest partial · HEAD b0f5c5018124f34a937fdfb02dfa47f415d9b07e · 2×EXIT=0 · coveredCount 6→7 · 07 covered · 08 not_covered · product flags false · harness awaiting_post_prove_dual · ZERO peer · Ban invent=8 · Ban wash · Ban MS3=R4 · Ban self-nail · releaseEvidence=false · ≠HA*
