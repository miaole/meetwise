# PASS — G-R4-5 / FUNNEL coveredCount Batch2b 02B wire · post-prove · mw-rag-route

**Verdict**: **PASS**（独立重跑 2×EXIT=0 · coveredCount **3→4** · 02B **covered** · `productionConsumerWired=true` 有实证 · Ban invent · Ban wash Batch2）  
**Expert**: `mw-rag-route`（独立重跑 + 实证；**alone≠dual** · **Ban自批** · **Ban forge peer**）  
**Date**: 2026-09-23 (~09:56 PT)  
**Tip / HEAD**: `824e072d92016f45645f29f7e951cebc049fe4d2` · branch `feat/mysql-schema-skeleton` · **MATCH**  
**Path**: `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch2b-02b-wire-post-prove-mw-rag-route.md`  
**Pair**: `…-post-prove-mw-e2e-ha.md`（本专家**未写/未改/未 stage** · **ZERO peer touched** · alone≠dual）  
**Harness**: `harness/g-r4-5-funnel-covered-count-batch2b-02b-wire.md` 仍为 **`executed:awaiting_post_prove_dual`**（本审**不翻** `post_prove_dual_pass` · Ban self-nail）  
**Claimed outcome honesty**: coveredCount **3→4** · **02B covered** · `productionConsumerWired=true` · 02A/03/04 **covered** retained · product flags **仍 false** · `releaseEvidence=false` · ≠HA · Dual PASS ≠ product closed

---

## 1. Tip 核验

| 项 | 值 |
|----|----|
| 期望 tip | `824e072` / full `824e072d92016f45645f29f7e951cebc049fe4d2` |
| `git -C /workspace/meetwise rev-parse HEAD` | `824e072d92016f45645f29f7e951cebc049fe4d2` |
| branch | `feat/mysql-schema-skeleton` |
| commit subject | `feat(g-r4-5): FUNNEL coveredCount Batch2b 02B wire under authorize (awaiting_post_prove_dual)` |
| 结果 | **MATCH** · 非 BLOCKED |

---

## 2. 独立重跑（本专家现场执行 · Ban idle claim · Ban wash）

| CMD | EXIT | 现场读法 |
|-----|------|----------|
| `pnpm r4-funnel-covered-count-batch2b-02b-wire:prove` | **0** | Batch2b honest emit · coveredCount=**4** · 02A=**true** · 02B=**true** · `productionConsumerWired=true` · 03/04 retained · product flags **false** · `batch2bOnly=true` · `coveredCountInvented=false` · `releaseEvidence=false` · harness 仍 `executed:awaiting_post_prove_dual` · Ban invent · Ban self-nail dual_pass |
| `pnpm r4-eg2-funnel-covered:prove` | **0** | EG2 Batch1+Batch2+Batch2b-aware · coveredCount matches assessors **got=4 expect=4** · 02A/02B **covered** · 03/04 retained covered · 05…08 **not_covered** · 01 ≠ invent covered · `inventCovered=false` · `releaseEvidence=false` |

**Ban**：未用 Batch2 tip `0a980e6` / prove `5593226`（coveredCount **3** · 02B **not_covered**）洗成「本刀早就是 4」；未把 EXIT=0 洗成 R4/FUNNEL/G-R4-5 product closed；未 idle 宣称 EXIT 而不重跑。

---

## 3. Live matrix / JSON（VERIFY · Ban invent）

来源（本轮独立 prove 写出 / 核对）：

- `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch2b-02b-wire-evidence.json`
- `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch2b-02b-wire-prove.md`
- `receipts/2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json`
- `rag-funnel-01-08-covered-matrix.md`

### Batch2b evidence pins

| Pin | Live | Honest |
|-----|------|--------|
| `kind` | `FunnelCoveredCountBatch2b02BWireEvidence` | Batch2bOnly |
| `batch2bOnly` | **true** | 本刀范围钉 |
| matrix `coveredCount` | **4** | **3→4** · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B |
| `batch2bCoveredCount` | **1** | 本刀仅抬 02B |
| `coveredIds` | `RAG-FUNNEL-02A`, `RAG-FUNNEL-02B` | 02A retained + 02B 本刀真盖 |
| `funnel02ACovered` | **true** | retained |
| `funnel02BCovered` | **true** | matches assessor · **非 invent** |
| `funnel02BRefuseReason` | **null** | 相对 Batch2 refuse 已清除 |
| `productionConsumerWired` | **true** | assessor + receipt 双钉 |
| `coveredCountInvented` | **false** | 非伪造计数 |
| `r4ProductClosed` | **false** | **本刀不翻** · R4 STILL OPEN |
| `funnelProductClosed` | **false** | **本刀不翻** · FUNNEL STILL OPEN |
| `gR45Closed` | **false** | **本刀不翻** · G-R4-5 STILL OPEN |
| `ms3EqualsR4Closed` | **false** | **Ban MS3=R4** |
| `releaseEvidence` | **false** | **≠HA** |

### EG2 matrix live

| ID | Status | Note |
|----|--------|------|
| `RAG-FUNNEL-01A` | `source_sealed` | ≠ invent covered |
| `RAG-FUNNEL-01` | `product_surfaces_true` | ≠ invent covered |
| `RAG-FUNNEL-02A` | **`covered`** | Batch2 retained |
| `RAG-FUNNEL-02B` | **`covered`** | Batch2b wire · `productionConsumerWired=true` |
| `RAG-FUNNEL-03` | **`covered`** | Batch1 retained |
| `RAG-FUNNEL-04` | **`covered`** | Batch1 retained |
| `RAG-FUNNEL-05`…`08` | `not_covered` | **Ban** claim all 01-08 covered |
| matrix `coveredCount` | **4** | inventCovered=**false** · releaseEvidence=**false** |

---

## 4. Wire 实证（`resolveEmbeddingCompute` production consumer · Ban invent）

相对 Batch2 refuse `production_consumer_not_wired_worker_or_generation`（tip `0a980e6` / prove `5593226` · coveredCount **3** · 02B **not_covered**），本刀在代码侧可见生产消费缝：

| 位点 | 实证 |
|------|------|
| `apps/worker/src/qbank-generation.ts` | import `resolveEmbeddingCompute` · 注释标明 **Production consumer** · 运行时 `await resolveEmbeddingCompute(pool, …)` |
| `apps/worker/src/main.ts` | qbank 启动路径经 `resolveQbankEmbeddingComputeSeams` / `ensureActiveQbankGeneration(..., computeResolved?.seams)` · 注释钉 RAG-FUNNEL-02B durable compute cache production consumer |
| Batch2 assessor（被 Batch2b reuse） | `productionConsumerWired` 现为 **true**（main+gen 源码含 `resolveEmbeddingCompute(` 调用） |
| Batch2b evidence `funnel02BAssessor` | hmac / resolveDurableFill / claimFillAndValidate / distinctFromRetrieval / dbExportsComputeCache / **productionConsumerWired** 全 **true** |

→ `isFunnel02BCovered` **true** · refuse=null · matrix row **covered** · coveredCount **4** · **非假盖章 / 非 invent**。

若无 `productionConsumerWired=true` 却报 02B covered 或 coveredCount=4 → 本审会 **FAIL**；本案 **否**。

---

## 5. 02A / 03 / 04 retained（Ban wash）

| ID | Status | Note |
|----|--------|------|
| `RAG-FUNNEL-02A` | **covered** | Batch2 tip `0a980e6` retained · **≠ wash** into invent-only 02B |
| `RAG-FUNNEL-03` | **covered** | Batch1 tip `5519078` retained |
| `RAG-FUNNEL-04` | **covered** | Batch1 tip `5519078` retained |

**Ban wash Batch2**：承认 prior 钉 coveredCount **3** / 02B **not_covered** / refuse `production_consumer_not_wired_worker_or_generation` · 本刀 **新 wire** 后诚实抬到 4 · **不是**把 `0a980e6`/`5593226` 改写成「早就 4」。

---

## 6. Product flags still false · R4/FUNNEL/G-R4-5 STILL OPEN

| Flag | Live | Ruling |
|------|------|--------|
| `r4ProductClosed` | **false** | **本刀不翻** · R4 product **STILL OPEN** |
| `funnelProductClosed` | **false** | **本刀不翻** · FUNNEL product **STILL OPEN** |
| `gR45Closed` | **false** | **本刀不翻** · G-R4-5 **STILL OPEN** |
| `ms3EqualsR4Closed` | **false** | **Ban MS3=R4** |
| harness status | **`executed:awaiting_post_prove_dual`** | 本审**不翻** · Ban self-nail `post_prove_dual_pass` |

**Ban claim**：本刀 Dual PASS ≠ R4/FUNNEL/G-R4-5 product closed · ≠假关题域 · ≠HA · `releaseEvidence` 保持 **false**。

---

## 7. Ban wash · Dual≠next · alone≠dual · Ban self-nail

- **Ban wash** Batch2 tip `0a980e6` / prove `5593226`（coveredCount **3** · 02B not_covered）进「本刀无 wire 也算 4」  
- **Ban wash** Batch1 tip `5519078` / prove `bd15172` · product-close `1c2ed8c`/`139dac9` · EG3 `7be1a55`/`5b3c854` · rem/SSOT/EXPLICIT · R1 · EG3 evidence 进 invent / product closed  
- **Ban MS3=R4** · **Ban invent coveredCount** · **Ban假关** R4/FUNNEL/G-R4-5  
- **Dual PASS ≠ next knife auto-authorize** · Dual PASS ≠ product closed  
- **alone≠dual**：本文件仅为 `mw-rag-route` 单方；pair `mw-e2e-ha` 须独立；**Ban自批** · **Ban forge peer** · **ZERO peer touched**  
- Harness **保持** `executed:awaiting_post_prove_dual` · **Ban self-nail** `post_prove_dual_pass`  
- **≠HA** · `releaseEvidence=false` · `batch2bOnly=true`

---

## 8. Blockers

**无**（对本刀 Batch2b 02B wire post-prove **PASS** 而言）。

非阻塞提醒（非 FAIL · 非本审翻 harness）：

- R4/FUNNEL/G-R4-5 product **仍 OPEN** · Dual PASS 后仍不得自动授权下一把 / 不得假关  
- RAG-FUNNEL-05…08 仍 **not_covered** · Ban claim 全矩阵 covered  
- Harness 仍 awaiting；翻 `post_prove_dual_pass` 须双方独立 PASS 后由流程钉 · **Ban** 本专家自钉  
- Key×3 O3 honesty_red 按 harness **非阻塞**

---

## 9. PASS 条件核对

| 条件 | 结果 |
|------|------|
| tip match `824e072…` on `feat/mysql-schema-skeleton` | **是** |
| 2× prove EXIT=0（本专家独立重跑） | **是** · batch2b=**0** · eg2=**0** |
| live coveredCount=**4**（3→4）· 02B covered · 02A/03/04 retained | **是** |
| `productionConsumerWired=true` 有代码+assessor+receipt 实证 | **是** |
| product flags 仍 false（r4/funnel/gR45） | **是** |
| `batch2bOnly=true` · `releaseEvidence=false` · ≠HA · Ban MS3=R4 | **是** |
| 未 invent coveredCount · 未 wash Batch2 · 未 claim product closed | **是** |
| 未写 peer `…-mw-e2e-ha.md` | **是** · **ZERO peer touched** |
| 未翻 harness → `post_prove_dual_pass` | **是** · Ban self-nail |

**Verdict = PASS**（mw-rag-route alone · coveredCount=4 · 02B covered · productionConsumerWired · ≠ dual 闭环 · pair 须独立 · Dual≠next · product STILL OPEN）。

---

## 10. Report 摘要（父代理回传用）

| 项 | 值 |
|----|-----|
| Verdict | **PASS** |
| HEAD | `824e072d92016f45645f29f7e951cebc049fe4d2` |
| Path | `ai-docs/delivery/reviews/REQUEST-2026-09-23-g-r4-5-funnel-covered-count-batch2b-02b-wire-post-prove-mw-rag-route.md` |
| 2×EXIT | batch2b:**0** · eg2:**0** |
| coveredCount | **4**（live · 3→4 · Ban invent） |
| 02A / 02B | **covered** / **covered**（`productionConsumerWired=true`） |
| 03 / 04 | **covered** / **covered**（retained） |
| productionConsumerWired | **true** |
| product flags | `r4ProductClosed=false` · `funnelProductClosed=false` · `gR45Closed=false` |
| releaseEvidence / ≠HA | **false** / **≠HA** |
| ZERO peer touched | **是** |
| harness | 仍 `executed:awaiting_post_prove_dual`（未翻 · Ban self-nail） |
| blockers | **无** |

---

*mw-rag-route · post-prove · G-R4-5 / FUNNEL coveredCount Batch2b 02B wire · 2026-09-23 ~09:56 PT · HEAD 824e072 · EXIT 0+0 · coveredCount=4（3→4）· RAG-FUNNEL-02B covered · productionConsumerWired=true · 02A/03/04 retained · r4/funnel/gR45 flags false · batch2bOnly · releaseEvidence=false · harness awaiting_post_prove_dual · alone≠dual · Ban自批 · Ban peer forge · Ban invent · Ban wash Batch2 0a980e6/5593226 · Ban MS3=R4 · Ban self-nail · Dual≠next · R4/FUNNEL/G-R4-5 STILL OPEN · ≠HA*
