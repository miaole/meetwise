# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 + Batch2b + Batch3 + Batch3b + Batch4 goal · Ban invent covered）

**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch3b post_prove_dual_pass** · **Batch4 REQUEST opened** (goal: true-cover 07+08 · baseline coveredCount **still 6** · 07/08 **still not_covered** · Ban invent · Ban invent coveredCount=8 · Ban elevate this open · Ban docs-only fake cover · if not achievable later → not_covered+refuse) · coveredCount **6** · 05/06 **covered** · 07/08 **not_covered** · **≠ invent covered** · `releaseEvidence=false` · ≠HA
**Date**: 2026-09-23 (~11:00 PT)
**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b+Batch3+Batch3b-aware) · Batch3b `apps/worker/src/r4-funnel-covered-count-batch3b-05-06-wire.ts` · prove `pnpm r4-funnel-covered-count-batch3b-05-06-wire:prove` / `pnpm r4-eg2-funnel-covered:prove`
**Hard**: Ban invent FUNNEL covered · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** · Batch3/Batch3b may elevate **05/06** when productionConsumerWired affirmed · Batch4 may elevate **07/08** only under authorize when true-cover evidenced · Ban invent coveredCount=8 · Ban elevating **07/08 this open** · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · post_prove_dual_pass · Ban second knife

| ID | Status | Basis |
|----|--------|-------|
| `RAG-FUNNEL-01A` | **source_sealed** | 01A source seal + qbank-handoff-closure prove inventory (checklist [x] · releaseEvidence=false) |
| `RAG-FUNNEL-01` | **product_surfaces_true** | MS1+MS2+MS3 product surfaces true (F6/F7/F8) · dual-claim evidence path ≠ invent covered · checklist 01 still [ ] until authorized SSOT |
| `RAG-FUNNEL-02A` | **covered** | Batch2 true-cover: immutable generation/projection + canonical embedding recipe evidenced (qbankEmbeddingRecipe fields + ensureActiveQbankGeneration + db projection + main immutable path + track-local projection consume + recipe query identity) · Ban invent |
| `RAG-FUNNEL-02B` | **covered** | Batch2/Batch2b true-cover: durable embedding compute cache evidenced (HMAC cache identity + resolve/claim/validate + db export + production consumer wiring) · Ban invent |
| `RAG-FUNNEL-03` | **covered** | Batch1 true-cover: JobRouteDecision production path evidenced (contracts+domain+db+route-classify consumer+main · R2 structural CLOSED cited ≠ invent) · Ban invent |
| `RAG-FUNNEL-04` | **covered** | Batch1 true-cover: track-local scoped retrieval production evidenced (helper+db+domain+REAL-WIRE main inject+consumer+fail-closed scope · cite EG3 ≠ wash) · Ban invent |
| `RAG-FUNNEL-05` | **covered** | Batch3b true-cover (wire): same-leaf LLM generation on clean miss evidenced (domain QuestionPlan + db dispatchQbankMissGeneration + clean no_eligible_in_scope gate + no QBank pollution/score-excluded + production consumer wiring) · Ban invent |
| `RAG-FUNNEL-06` | **covered** | Batch3b true-cover (wire): route-scope cache/provenance/revoke evidenced (domain digest + retrieval/singleflight keys + durable negative cache + epoch supersede + hit revalidate + distinct from embedding compute + production consumer wiring) · Ban invent |
| `RAG-FUNNEL-07` | **not_covered** | free-text allowlisted scope funnel not evidenced · Ban invent covered |
| `RAG-FUNNEL-08` | **not_covered** | production-equivalent eval matrix not evidenced · Ban invent covered |

**coveredCount**: 6 (honest · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 when affirmed)

## Batch3b result（under authorize · Ban invent · Ban docs-only fake cover）

- **RAG-FUNNEL-05**: **covered** · productionConsumerWired=true (worker retrieve → dispatchQbankMissGeneration)
- **RAG-FUNNEL-06**: **covered** · productionConsumerWired=true (worker retrieve → route-scope cache APIs)
- **batch3bOnly**: true · **coveredCountInvented**: false
- **Expect**: coveredCount 4→6 if both affirmed · else keep 4 or 5 · this emit coveredCount=**6**


## Batch4 REQUEST goal（docs only · this open · Ban elevate）

- **Knife**: G-R4-5 / FUNNEL coveredCount Batch4（07+08 true-cover） · true-cover **only** `RAG-FUNNEL-07` + `RAG-FUNNEL-08`
- **07 target**: free-text allowlisted scope funnel · UC-RAG-FUNNEL-07 · rules→light model→clarification · only suggests allowlisted track · no read/tool grant · cite refuse `free-text allowlisted scope funnel not evidenced`
- **08 target**: production-equivalent eval matrix · UC-RAG-FUNNEL-08 · multi-lang/fullstack/ambiguity/injection · per-leaf Recall@K · wrong-track=0 · P95/成本阈值 · release receipts · cite refuse `production-equivalent eval matrix not evidenced`
- **Baseline (unchanged this open)**: coveredCount **6** · 02A/02B/03/04/05/06 **covered** · 07/08 **not_covered**
- **Expect later under authorize**: coveredCount **6→8** if both affirmed · else honest keep **6** or **7** / refuse · **Ban invent coveredCount=8** · **Ban docs-only fake cover** · if not achievable → **not_covered + refuse**
- **Ban**: invent coveredCount · invent coveredCount=8 · elevate 07/08 this open · flip product flags · wash Batch3b tip `85be7ad` / prove `9aa1be4` · wash Batch3 tip `bd3a800` / prove `e468de9` into invent/product-closed
- Harness: `harness/g-r4-5-funnel-covered-count-batch4.md` · status `REQUEST-ready / not_run:pre_dual`

## Non-claims

- Not product close · not gR45Closed · Ban invent · Ban docs-only fake cover · Ban wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55
- Ban MS3=R4 · Ban wash this dual_pass into product closed · Ban invent 07/08 this open · Ban invent coveredCount=8 · Ban invent · Ban second knife · Ban wash Batch3b 85be7ad/9aa1be4 / Batch3 bd3a800 into product-closed

*Matrix · EG2+Batch1+Batch2+Batch2b+Batch3b · Batch4 REQUEST goal noted · 2026-09-23 (~11:00 PT) · coveredCount=6 · 07/08 still not_covered · Ban invent covered · Ban invent coveredCount=8 · Ban elevate 07/08 this open · Ban docs-only fake cover · releaseEvidence=false · Batch3b post_prove_dual_pass retained*
