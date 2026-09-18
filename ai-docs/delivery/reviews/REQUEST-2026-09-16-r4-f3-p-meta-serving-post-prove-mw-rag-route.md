# REQUEST — Knife **F3** · **P-META serving remaining** **post-prove** → mw-rag-route

**Status**: **REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-rag-route`  
**Date**: 2026-09-16 (~23:50 PT · post-prove)  
**releaseEvidence=false** · Not HA · **≠ R4 closed** · **≠ 题域已隔离** · **≠ R1 closed** · **≠ RAG-FUNNEL-01 closed** · **01A ≠ 01** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE** · **≠ suite green** · **sole 恰 5**  
**Pair**: `REQUEST-2026-09-16-r4-f3-p-meta-serving-post-prove-mw-e2e-ha.md`  
**Hard**: pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ FUNNEL-01/R4 closed · no self-approve · **Ban** forging MetadataReviewReceipt serving / claiming R4 closed  
**Prior pre-exec dual（pass）**: `2026-09-16-r4-f3-p-meta-serving-mw-e2e-ha.md` · `2026-09-16-r4-f3-p-meta-serving-mw-rag-route.md`  
**Knife**: `pnpm r4-p-meta-serving:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## Contra

| File | Role |
|------|------|
| `harness/r4-f3-p-meta-serving.md` | **本刀**（`executed:awaiting_post_prove_dual`） |
| `eval/r4-f3-p-meta-serving.eval.md` | Eval + CMD+EXIT |
| `r4-f3-p-meta-serving.slice.md` | Slice |
| `harness/r4-domain-isolation.md` §2 / §6c.3 | P-META inventory **仍开** |
| `harness/r4-domain-isolation-status.md` **G-R4-5** / §13 | F3 awaiting post-prove · serving gaps STILL OPEN |
| `apps/worker/src/r4-p-meta-serving-remaining.ts` | classifyPMetaServingRemaining / facet inventory |
| `apps/worker/test/r4-p-meta-serving.proof.ts` | Prove body |
| `apps/worker/src/r4-p-meta-p-r1-remaining.ts` | F2 align · serving/facets/deploy **false** |
| `m4-rag-hard-gates.md` / FUNNEL | MetadataReviewReceipt serving close conditions |
| `rules/backend/qbank-control-definer-sealed-manifest.md` | RAG-FUNNEL-01A ≠ 01 |
| `packages/db/src/principal.ts` | `qbank_metadata_review_receipt` 01A table |
| `ai-docs/architecture/ai/rag-funnel-routing.md` | secondary facets inventory |

---

## Stance（rag-route）

F3 = **honesty remaining-gap** for inventory P-META **serving**（**not** closing FUNNEL-01）:

1. **MS1**：`routedServingConsumerWired=false`；worker src **no** product MetadataReviewReceipt serving consumer；**≠ forge**；**01A ≠ 01**  
2. **MS2**：`fullFacetsServed=false`；required secondary facets named（competency/technology/difficulty/seniority/kind/language）；`facetsServedOnRoutedPath=[]`  
3. **MS3**：`standardDeployHandoff=false`；local `qbank-handoff-closure` prove **exists** as 旁证 **≠** standard/cloud deploy receipt  
4. Experts = rag-route + e2e-ha only — **omit** `mw-model-op`  
5. **G-R4-5 still open** after EXIT=0；closing narrative alone ≠ R4 / 题域已隔离  
6. **P-R1 / G-R4-3** remains parallel open — **not** this F3 · **no flip default**  
7. **G-R2-5 / forge retained**；禁假造 MetadataReviewReceipt serving / 假关 FUNNEL-01  

**EXIT=0 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离**.

---

## Post-prove CMD+EXIT（实现方）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-p-meta-serving:prove`** | **0** | MS1–MS4 honesty；await dual |
| `:prove:raw` | **n/a** | harness does not require :raw |

**Key**：unset（未 invent）。**未跑** Live Key×3。

---

## Please answer

1. 请 **独立复跑** `pnpm r4-p-meta-serving:prove`，附 CMD+EXIT。  
2. MS1：01A ≠ 01 · FUNNEL-01 still open · no forged MetadataReviewReceipt serving — 同意？  
3. MS2/MS3：facets inventory named · served empty · standard deploy still open · local 01A ≠ standard deploy — 同意？  
4. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ suite green**？  
5. G-R4-5 / P-META serving 是否仍登记为 **open**？P-R1 / G-R4-3 parallel open？  
6. sole 恰 5 · `releaseEvidence=false` · omit model-op · no flip default 仍正确？  
7. harness/eval/status 是否错误把本绿写成 FUNNEL-01/R4 已关？（期望：**否**）

Please write the conclusion to `reviews/`（e.g. `2026-09-16-r4-f3-p-meta-serving-post-prove-mw-rag-route.md`）. **Ban** implementer writing pass.

---

## Non-claims

- 本 REQUEST **不是** pass  
- **未**关 FUNNEL-01 / R1 / R4 / 题域已隔离  
- **未** flip default · **未** open DELETE · **未**扩 sole allowlist · **未** forge serving  
- **await post-prove dual**

---

*REQUEST · mw-rag-route · F3 P-META serving post-prove · 2026-09-16 ~23:50 PT · prove EXIT=0 · releaseEvidence=false · ≠HA · ≠R4 closed · serving gaps STILL OPEN · awaiting dual*
