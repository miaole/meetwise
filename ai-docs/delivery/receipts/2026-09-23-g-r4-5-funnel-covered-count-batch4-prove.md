# Prove — G-R4-5 / FUNNEL coveredCount Batch4（07+08 true-cover）

**Status**: `post_prove_dual_pass` · prior `executed:awaiting_post_prove_dual` recorded · Ban invent · Ban invent coveredCount=8 · product flags false
**Date**: 2026-09-23 (~11:17 PT)
**CMD**: `pnpm r4-funnel-covered-count-batch4:prove` + `pnpm r4-eg2-funnel-covered:prove`
**coveredCount**: **7** (before Batch4 baseline **6** · expect 6→8 if both affirmed · Ban invent coveredCount=8)
- **RAG-FUNNEL-07**: **covered** · productionConsumerWired=true
- **RAG-FUNNEL-08**: **not_covered** · refuse `production-equivalent eval matrix not evidenced`
- **02A/02B/03/04/05/06**: covered retained
- **r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false
- **releaseEvidence**: false · **batch4Only**: true · **coveredCountInvented**: false

## Wire evidence

- 07 call site: `apps/worker/src/free-text-route-funnel.ts` → `createFreeTextScopeRevision(` + `classifyFreeTextScope(` · main binds `runFreeTextAllowlistedScopeFunnel` (request-path · suggest allowlisted track only · no retrieval grant)
- 08: production-equivalent eval matrix · elevate only when release receipts + per-leaf Recall@K + wrong-track=0 + P95/cost thresholds bound · local fake/demo alone ≠ passed (UC Alternate)
- Ban docs-only fake cover · real import+invoke like Batch3b

**Evidence**: `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4-evidence.json`
**Matrix**: `rag-funnel-01-08-covered-matrix.md`

## Non-claims

- Not product close · not gR45Closed · Ban invent coveredCount=8 · Ban wash Batch3b 85be7ad/9aa1be4 · Batch3 bd3a800/e468de9 · Batch2b · Batch2 · Batch1 · product-close · EG3
- Ban MS3=R4 · Ban wash this dual_pass into product closed · Ban invent coveredCount=8 · Ban invent · Ban second knife · Ban opening 08 wire/eval
