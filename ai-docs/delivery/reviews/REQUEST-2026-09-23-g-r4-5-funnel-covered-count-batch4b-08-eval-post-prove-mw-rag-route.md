# PASS — G-R4-5 / FUNNEL coveredCount Batch4b 08 eval · post-prove · mw-rag-route（诚实 7→8）

**Verdict**: **PASS**（HEAD MATCH · 2×EXIT=0 · coveredCount **7→8** · 08 **covered** · refuse cleared · production-equivalent eval wire · 6 assessor pins 全 true · `notLocalFakeAlone=true` · 02A–07 retained · product flags **false** · covering≠product closed · Ban invent/wash）  
**Expert**: `mw-rag-route`（独立重跑 + 实证；**alone≠dual** · **Ban自批** · **Ban forge peer**）  
**Domain**: RAG-FUNNEL  
**Date**: 2026-09-23 (~11:35 PT)  
**Tip / HEAD**: `0e58386126c4c6bc186685b5526068875e70dbc1` · short `0e58386` · branch `feat/mysql-schema-skeleton` · **MATCH**  
**Path**: `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-post-prove-mw-rag-route.md`  
**Pair**: `…-post-prove-mw-e2e-ha.md`（本专家**未写/未改/未 stage** · **ZERO peer touched** · alone≠dual · peer 文件仍缺席）  
**Harness**: `harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md` 仍为 **`executed:awaiting_post_prove_dual`**（本审**不翻** `post_prove_dual_pass` · Ban self-nail）  
**Claimed outcome honesty**: coveredCount **7→8** · **08 covered** · Batch4 refuse `production-equivalent eval matrix not evidenced` **cleared** · 02A/02B/03/04/05/06/07 **covered** retained · product flags **仍 false** · `releaseEvidence=false` · ≠HA · Dual PASS ≠ product closed · **covering≠product closed**（coveredCount=8 ≠ r4/funnel/gR45 product closed）

---

## 1. Tip 核验

| 项 | 值 |
|----|----|
| 期望 tip | `0e58386` / full `0e58386126c4c6bc186685b5526068875e70dbc1` |
| `git -C /workspace/meetwise rev-parse HEAD` | `0e58386126c4c6bc186685b5526068875e70dbc1` |
| branch | `feat/mysql-schema-skeleton` |
| commit subject | `feat(g-r4-5): FUNNEL coveredCount Batch4b 08 eval under authorize (awaiting_post_prove_dual)` |
| REQUEST tip（历史钉） | `77b9d57`（pre-exec dual BOTH PASS · standing authorize 前提 · 本审承认不重审 pre-exec） |
| 结果 | **MATCH** · 非 BLOCKED |

---

## 2. 独立重跑（本专家现场执行 · Ban idle claim · Ban wash）

| CMD | EXIT | 现场读法 |
|-----|------|----------|
| `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` | **0** | Batch4b honest emit · coveredCount=**8** · 08=**true** · `batch4bCoveredCount=1` · `coveredIds=["RAG-FUNNEL-08"]` · `funnel08RefuseReason=null` · eval mode `production-equivalent` · B2 六钉全 true · 02A–07 retained · product flags **false** · `batch4bOnly=true` · `coveredCountInvented=false` · `releaseEvidence=false` · harness 仍 `executed:awaiting_post_prove_dual` · Ban invent · Ban self-nail dual_pass |
| `pnpm r4-eg2-funnel-covered:prove` | **0** | EG2 Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4+Batch4b-aware · coveredCount matches assessors **got=8 expect=8** · 02A–07 **covered** retained · 08 status matches Batch4/Batch4b assessor **covered** · 01 ≠ invent covered · `inventCovered=false` · `releaseEvidence=false` |

**Ban**：未把 EXIT=0 / coveredCount=8 洗成 R4/FUNNEL/G-R4-5 product closed；未把 coveredCount=8 洗成「product closed」；未用 Batch4 tip `9b8b9a7` / prove `b0f5c50`（当时 08 refuse）洗成本刀假盖章；未 idle 宣称 EXIT 而不重跑；未读 `.env*`；未触 Meridian / Cloud Agent。

---

## 3. Live matrix / JSON（VERIFY · Ban invent）

来源（本轮独立 prove 写出 / 核对）：

- `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-evidence.json`
- `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-prove.md`
- `receipts/production-equivalent-funnel-08-release.json`
- `receipts/production-equivalent-funnel-08-thresholds.json`
- `receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json`（EG2 重跑更新）
- `rag-funnel-01-08-covered-matrix.md`
- harness `harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md`

### Batch4b evidence pins

| Pin | Live | Honest |
|-----|------|--------|
| `kind` | `FunnelCoveredCountBatch4b08EvalEvidence` | Batch4bOnly |
| `batch4bOnly` | **true** | 本刀范围钉 |
| matrix `coveredCount` | **8** | **7→8** · Ban invent · Batch1–4 02A–07 + Batch4b **仅** 08 |
| `batch4bCoveredCount` | **1** | = `coveredIds.length` |
| `coveredIds` | `["RAG-FUNNEL-08"]` | **仅** 08 |
| `funnel08Covered` | **true** | matches assessor · production-equivalent eval matrix |
| `funnel08RefuseReason` | `null` | refuse cleared（原 Batch4 refuse 已清） |
| `evalWirePresent` | **true** | real produce+bind |
| `evalRun.mode` | `production-equivalent` | production-equivalent eval wire |
| `coveredCountInvented` | **false** | 非伪造计数 |
| `r4ProductClosed` | **false** | **本刀不翻** · R4 STILL OPEN · **covering≠product closed** |
| `funnelProductClosed` | **false** | **本刀不翻** · FUNNEL STILL OPEN |
| `gR45Closed` | **false** | **本刀不翻** · G-R4-5 STILL OPEN |
| `ms3EqualsR4Closed` | **false** | **Ban MS3=R4** |
| `releaseEvidence` | **false** | **≠HA** · Dual PASS ≠ product closed |

### FUNNEL-08 assessor 六钉（B2 live）

| Pin | Live | Note |
|-----|------|------|
| `releaseReceiptsBound` | **true** | `production-equivalent-funnel-08-release.json` · dataset/policy/recipe/environment digests bound |
| `perLeafRecallReported` | **true** | perLeaf=4 · leafTrackId backend/(nodejs\|java\|go\|python) · Recall@K |
| `wrongTrackZeroHardAssert` | **true** | wrongTrackZero=true · hard-zero assert text |
| `p95CostThresholdsPreRegistered` | **true** | `production-equivalent-funnel-08-thresholds.json` · P95 + 成本 + 预注册 |
| `multiLangHoldoutPresent` | **true** | multi-lang / fullstack / ambiguity / injection |
| `notLocalFakeAlone` | **true** | 上列全 bound · Ban invent from local fake alone |

→ `isFunnel08Covered=true` · covered matches all-pins including `notLocalFakeAlone` · Ban invent 08 from local fake alone。

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
| `RAG-FUNNEL-07` | **`covered`** | Batch4 retained · Ban wash |
| `RAG-FUNNEL-08` | **`covered`** | Batch4b · production-equivalent eval matrix evidenced |
| matrix `coveredCount` | **8** | inventCovered=**false** · releaseEvidence=**false** · **honest 7→8** |

---

## 4. 08 covered / refuse cleared（诚实 7→8 · Ban invent）

| ID | Meaning | Live | Ruling |
|----|---------|------|--------|
| `RAG-FUNNEL-08` | production-equivalent eval matrix（multi-lang holdout · per-leaf Recall@K · wrong-track=0 · P95/成本预注册 · release receipts bound · notLocalFakeAlone） | **covered** · refuse=`null` · 六钉全 true | true-cover affirmed · Batch4 refuse cleared |
| coveredCount | baseline Batch4 **7** | **8** | **7→8** · Ban invent · `coveredCountInvented=false` |

→ `batch4bCoveredCount=1` · coveredCount **7→8** · **非假盖章 / 非 docs-only fake cover** · eval wire `apps/worker/src/production-equivalent-funnel-08-eval.ts` real produce+bind。

**Hard honesty**：coveredCount=8 **≠** `r4ProductClosed` / `funnelProductClosed` / `gR45Closed` · **covering≠product closed** · claim=false on product flags。

---

## 5. 02A–07 retained（Ban wash Batch4 / priors）

| ID | Status | Note |
|----|--------|------|
| `RAG-FUNNEL-02A` | **covered** | Batch2 tip `0a980e6` retained |
| `RAG-FUNNEL-02B` | **covered** | Batch2b tip `ddfb64d` / prove `824e072` retained |
| `RAG-FUNNEL-03` | **covered** | Batch1 tip `5519078` retained |
| `RAG-FUNNEL-04` | **covered** | Batch1 tip `5519078` retained |
| `RAG-FUNNEL-05` | **covered** | Batch3b tip `85be7ad` / prove `9aa1be4` retained · **≠ wash** |
| `RAG-FUNNEL-06` | **covered** | Batch3b retained · Ban wash |
| `RAG-FUNNEL-07` | **covered** | Batch4 tip `9b8b9a7` / prove `b0f5c50` retained · Ban wash into invent product-closed |

---

## 6. Product flags / Non-claims（强制 false）

| Flag | Live | Ruling |
|------|------|--------|
| `r4ProductClosed` | **false** | R4 STILL OPEN · **本刀不翻** |
| `funnelProductClosed` | **false** | FUNNEL STILL OPEN · **本刀不翻** |
| `gR45Closed` | **false** | G-R4-5 STILL OPEN · **本刀不翻** |
| `ms3EqualsR4Closed` | **false** | Ban MS3=R4 |
| `releaseEvidence` | **false** | ≠HA |
| covering≠product closed | **钉死** | coveredCount=8 / 08 covered **≠** product closed · claim=false |

**Non-claims**：Not product close · not gR45Closed · not invent coveredCount · not docs-only fake cover · not wash Batch4 `9b8b9a7`/`b0f5c50` · Batch3b `85be7ad`/`9aa1be4` · Batch3/Batch2b/Batch2/Batch1/product-close/EG3/rem·SSOT·EXPLICIT · not MS3=R4 · not HA · not suite green · not self-nail `post_prove_dual_pass` · Dual PASS ≠ product closed · Dual PASS ≠ next knife auto-authorize · Ban second knife · Ban Meridian · Ban Cloud Agent · Ban secrets / `.env*`

---

## 7. Harness / Peer / Blockers

| 项 | 状态 |
|----|------|
| Harness status | **`executed:awaiting_post_prove_dual`** · 本审**不翻** |
| Self-nail ban | Ban flip to `post_prove_dual_pass`（本专家 alone≠dual） |
| Peer `…-post-prove-mw-e2e-ha.md` | **ZERO peer** · 未写/未改/未 stage · 文件仍缺席 |
| Blockers | **无**（对本 PASS） |

---

## 8. Verdict gates（对照 GOAL）

| Gate | Result |
|------|--------|
| HEAD = `0e58386126c4c6bc186685b5526068875e70dbc1` | **PASS** |
| 2×EXIT=0（独立重跑） | **PASS** |
| Honest coveredCount **7→8** | **PASS** |
| 08 **covered** + real eval evidence + refuse cleared | **PASS** |
| 6 assessor pins + `notLocalFakeAlone=true` | **PASS** |
| 02A–07 retained covered | **PASS** |
| product flags **false** · covering≠product closed | **PASS** |
| harness 仍 `awaiting_post_prove_dual` · Ban invent/wash/MS3=R4/self-nail | **PASS** |
| ZERO peer | **PASS** |

→ **Verdict: PASS**

---

*Post-prove · mw-rag-route · G-R4-5 / FUNNEL coveredCount Batch4b 08 eval · 2026-09-23 (~11:35 PT) · HEAD 0e58386126c4c6bc186685b5526068875e70dbc1 · REQUEST tip 77b9d57 · 2×EXIT=0 · coveredCount 7→8 · 08 covered · product flags false · covering≠product closed · releaseEvidence=false · ≠HA · harness awaiting_post_prove_dual · Ban self-nail · ZERO peer · alone≠dual · STOP*
