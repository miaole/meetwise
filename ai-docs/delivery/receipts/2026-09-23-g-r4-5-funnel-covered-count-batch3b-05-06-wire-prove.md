# Prove — G-R4-5 / FUNNEL coveredCount Batch3b（05/06 wire）

**Status**: `post_prove_dual_pass` · prior `executed:awaiting_post_prove_dual` recorded · Ban invent · product flags false
**Date**: 2026-09-23 (~10:55 PT)
**CMD**: `pnpm r4-funnel-covered-count-batch3b-05-06-wire:prove` + `pnpm r4-eg2-funnel-covered:prove`
**coveredCount**: **6** (before Batch3b baseline **4** · expect 4→6 if both affirmed · Ban invent)
- **RAG-FUNNEL-05**: **covered** · productionConsumerWired=true
- **RAG-FUNNEL-06**: **covered** · productionConsumerWired=true
- **02A/02B/03/04**: covered retained
- **07/08**: not_covered (Ban elevate)
- **r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false
- **releaseEvidence**: false · **batch3bOnly**: true · **coveredCountInvented**: false

## Wire evidence

- 05 call site: `apps/worker/src/qbank-track-local-retrieve.ts` → `dispatchQbankMissGeneration(` on clean empty serve (optional missGeneration seams · fail-closed absent)
- 06 call site: same retrieve path → `routeScopeRetrievalCacheKey(` / `readRouteScopeNegativeResult(` / `recordRouteScopeNegativeResult(` / `revalidateRouteScopeCacheHit(`
- Ban docs-only fake cover · real import+invoke like Batch2b

**Evidence**: `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch3b-05-06-wire-evidence.json`
**Matrix**: `rag-funnel-01-08-covered-matrix.md`

## Non-claims

- Not product close · not gR45Closed · Ban invent · Ban wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 · Batch1 · product-close · EG3
- Ban MS3=R4 · Ban wash this dual_pass into product closed · Ban elevating 07/08 · Ban invent · Ban second knife · Ban Batch4 parallel
