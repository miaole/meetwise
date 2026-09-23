# Prove — G-R4-5 / FUNNEL coveredCount Batch4b（08 eval true-cover）

**Status**: `executed:awaiting_post_prove_dual` · Ban invent · Ban invent coveredCount=8 · Ban self-nail post_prove_dual_pass · product flags false
**Date**: 2026-09-23 (~11:30 PT)
**CMD**: `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` + `pnpm r4-eg2-funnel-covered:prove`
**coveredCount**: **8** (before Batch4b baseline **7** · expect 7→8 if affirmed · Ban invent coveredCount=8)
- **RAG-FUNNEL-08**: **covered**
- **02A/02B/03/04/05/06/07**: covered retained
- **r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false
- **releaseEvidence**: false · **batch4bOnly**: true · **coveredCountInvented**: false

## Wire evidence

- 08 eval wire: `apps/worker/src/production-equivalent-funnel-08-eval.ts` → `runProductionEquivalentFunnel08Eval(` produces+binds `production-equivalent-funnel-08-release.json` + `…-thresholds.json`
- Assessor pins (Batch4 reuse): releaseReceiptsBound · perLeafRecallReported · wrongTrackZeroHardAssert · p95CostThresholdsPreRegistered · multiLangHoldoutPresent · notLocalFakeAlone
- UC Alternate: local fake/demo/benchmark alone ≠ passed — elevate only when all pins bound
- Ban docs-only fake cover · real produce+bind like Batch3b wire precedent

**Evidence**: `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-evidence.json`
**Release**: `receipts/production-equivalent-funnel-08-release.json`
**Thresholds**: `receipts/production-equivalent-funnel-08-thresholds.json`
**Matrix**: `rag-funnel-01-08-covered-matrix.md`

## Non-claims

- Not product close · not gR45Closed · Ban invent coveredCount=8 · Ban wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch3 · Batch2b · Batch2 · Batch1 · product-close · EG3
- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban invent · Ban second knife · covering 08 ≠ product closed
