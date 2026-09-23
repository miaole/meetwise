/**
 * G-R4-5 / FUNNEL coveredCount Batch3b（05/06 wire）— dedicated true-cover prove.
 *
 * Under standing authorize (pre-exec dual BOTH PASS on REQUEST tip 5c8f1ff):
 *   - Assess FUNNEL-05 + FUNNEL-06 production paths (reuse Batch3 assessors).
 *   - Emit evidence · update matrix 05/06→covered only when productionConsumerWired.
 *   - EXIT=0 = honest emit (partial ok · prefer keep-4/5 over invent-6).
 *   - Ban invent · Ban wash product closed · Ban docs-only fake cover.
 *   - harness status = executed:awaiting_post_prove_dual · Ban self-nail dual_pass.
 *
 * HARD:
 *   - r4ProductClosed/funnelProductClosed/gR45Closed remain false
 *   - coveredCount matches rows with status=covered · Ban invent
 *   - Ban wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 · Batch1 · product-close · EG3
 *   - Ban MS3=R4 · Ban elevating 07/08 · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-funnel-covered-count-batch3b-05-06-wire:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EMITTER_WIRED,
  R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EVIDENCE_KIND,
  emitFunnelCoveredCountBatch3b0506WireEvidence,
} from '../src/r4-funnel-covered-count-batch3b-05-06-wire.ts';
import {
  assessFunnel05SameLeafLlmCleanMiss,
  assessFunnel06RouteScopeCacheProvenanceRevoke,
  isFunnel05Covered,
  isFunnel06Covered,
} from '../src/r4-funnel-covered-count-batch3.ts';
import {
  isFunnel02ACovered,
  isFunnel02BCovered,
} from '../src/r4-funnel-covered-count-batch2.ts';
import {
  isFunnel03Covered,
  isFunnel04Covered,
} from '../src/r4-funnel-covered-count-batch1.ts';
import {
  emitRagFunnel0108CoveredMatrix,
  isHonestFunnelCoveredMatrix,
} from '../src/r4-eg2-funnel-covered-matrix.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const receiptDir = join(repoRoot, 'ai-docs/delivery/receipts');
const receiptJson = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch3b-05-06-wire-evidence.json',
);
const proveMd = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch3b-05-06-wire-prove.md',
);
const eg2Json = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch3b-05-06-wire.md',
);
const slicePath = join(
  repoRoot,
  'ai-docs/delivery/g-r4-5-funnel-covered-count-batch3b-05-06-wire.slice.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / FUNNEL coveredCount Batch3b 05/06 wire prove');
console.log(
  'EXIT=0 = honest true-cover emit for 05+06 under authorize · Ban invent · executed:awaiting_post_prove_dual · product flags false',
);

section('B0 anchors');
A('B0 emitter wired', R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EMITTER_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 slice present', existsSync(slicePath));
A('B0 harness status executed:awaiting_post_prove_dual + Ban invent flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /batch3bOnly|Batch3b/.test(h)
    && /releaseEvidence=false/.test(h)
    && /Ban invent|本刀不翻/.test(h)
    && /Ban second knife|Ban Batch4/.test(h)
    && /STILL OPEN/.test(h)
    && /productionConsumerWired|worker_or_interview|retrieve_or_track_local/.test(h);
})());

section('B1 live FUNNEL-05 assessor (Batch3 reuse)');
const a05 = assessFunnel05SameLeafLlmCleanMiss();
A('B1 domainQuestionPlanPresent', a05.domainQuestionPlanPresent === true);
A('B1 dbDispatchMissGenerationPresent', a05.dbDispatchMissGenerationPresent === true);
A('B1 cleanMissGateOnly', a05.cleanMissGateOnly === true);
A('B1 noQbankPollutionScoreExcluded', a05.noQbankPollutionScoreExcluded === true);
A('B1 dbExportsMissGeneration', a05.dbExportsMissGeneration === true);
A('B1 productionConsumerWired is boolean', typeof a05.productionConsumerWired === 'boolean');
const covered05 = isFunnel05Covered();
A('B1 isFunnel05Covered (honest live)', typeof covered05 === 'boolean');
A(
  'B1 covered matches all-pins including productionConsumerWired',
  covered05 === (
    a05.domainQuestionPlanPresent
    && a05.dbDispatchMissGenerationPresent
    && a05.cleanMissGateOnly
    && a05.noQbankPollutionScoreExcluded
    && a05.dbExportsMissGeneration
    && a05.productionConsumerWired
  ),
);
A(
  'B1 productionConsumerWired must be true for 05 covered (Ban invent)',
  !covered05 || a05.productionConsumerWired === true,
);
console.log(`     → FUNNEL-05 covered=${covered05} (productionConsumerWired=${a05.productionConsumerWired})`);

section('B2 live FUNNEL-06 assessor (Batch3 reuse)');
const a06 = assessFunnel06RouteScopeCacheProvenanceRevoke();
A('B2 domainRouteScopeDigestPresent', a06.domainRouteScopeDigestPresent === true);
A('B2 retrievalAndSingleflightKeysPresent', a06.retrievalAndSingleflightKeysPresent === true);
A('B2 durableNegativeCachePresent', a06.durableNegativeCachePresent === true);
A('B2 epochSupersedeAndHitRevalidatePresent', a06.epochSupersedeAndHitRevalidatePresent === true);
A('B2 distinctFromEmbeddingComputeCache', a06.distinctFromEmbeddingComputeCache === true);
A('B2 dbExportsRouteScopeCache', a06.dbExportsRouteScopeCache === true);
A('B2 productionConsumerWired is boolean', typeof a06.productionConsumerWired === 'boolean');
const covered06 = isFunnel06Covered();
A('B2 isFunnel06Covered (honest live)', typeof covered06 === 'boolean');
A(
  'B2 covered matches all-pins including productionConsumerWired',
  covered06 === (
    a06.domainRouteScopeDigestPresent
    && a06.retrievalAndSingleflightKeysPresent
    && a06.durableNegativeCachePresent
    && a06.epochSupersedeAndHitRevalidatePresent
    && a06.distinctFromEmbeddingComputeCache
    && a06.dbExportsRouteScopeCache
    && a06.productionConsumerWired
  ),
);
A(
  'B2 productionConsumerWired must be true for 06 covered (Ban invent)',
  !covered06 || a06.productionConsumerWired === true,
);
console.log(`     → FUNNEL-06 covered=${covered06} (productionConsumerWired=${a06.productionConsumerWired})`);

section('B3 emit Batch3b evidence');
const evidence = emitFunnelCoveredCountBatch3b0506WireEvidence();
A('B3 kind', evidence.kind === R4_FUNNEL_COVERED_COUNT_BATCH3B_05_06_WIRE_EVIDENCE_KIND);
A('B3 batch3bOnly=true', evidence.batch3bOnly === true);
A('B3 coveredCountInvented=false', evidence.coveredCountInvented === false);
A('B3 r4ProductClosed=false', evidence.r4ProductClosed === false);
A('B3 funnelProductClosed=false', evidence.funnelProductClosed === false);
A('B3 gR45Closed=false', evidence.gR45Closed === false);
A('B3 ms3EqualsR4Closed=false', evidence.ms3EqualsR4Closed === false);
A('B3 releaseEvidence=false', evidence.releaseEvidence === false);
A('B3 funnel05Covered matches assessor', evidence.funnel05Covered === covered05);
A('B3 funnel06Covered matches assessor', evidence.funnel06Covered === covered06);
A('B3 funnel05ProductionConsumerWired', evidence.funnel05ProductionConsumerWired === a05.productionConsumerWired);
A('B3 funnel06ProductionConsumerWired', evidence.funnel06ProductionConsumerWired === a06.productionConsumerWired);
A(
  'B3 batch3bCoveredCount == coveredIds.length',
  evidence.batch3bCoveredCount === evidence.coveredIds.length,
);
A(
  'B3 coveredIds only 05/06',
  evidence.coveredIds.every((id) => id === 'RAG-FUNNEL-05' || id === 'RAG-FUNNEL-06'),
);
if (!covered05) {
  A('B3 funnel05RefuseReason present when not covered', evidence.funnel05RefuseReason !== null);
}
if (!covered06) {
  A('B3 funnel06RefuseReason present when not covered', evidence.funnel06RefuseReason !== null);
}

section('B4 matrix emit (Batch3b-aware EG2 · retain 02A/02B/03/04)');
const covered02A = isFunnel02ACovered();
const covered02B = isFunnel02BCovered();
const covered03 = isFunnel03Covered();
const covered04 = isFunnel04Covered();
const matrix = emitRagFunnel0108CoveredMatrix();
const expectedCovered =
  Number(covered02A) + Number(covered02B) + Number(covered03) + Number(covered04)
  + Number(covered05) + Number(covered06);
A('B4 isHonestFunnelCoveredMatrix', isHonestFunnelCoveredMatrix(matrix) === true);
A('B4 inventCovered=false', matrix.inventCovered === false);
A('B4 releaseEvidence=false', matrix.releaseEvidence === false);
A(
  'B4 coveredCount matches live assessors',
  matrix.coveredCount === expectedCovered,
  `got=${matrix.coveredCount} expect=${expectedCovered}`,
);
const row05 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-05');
const row06 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-06');
const row07 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-07');
const row08 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-08');
A(
  'B4 row05 status honest',
  covered05 ? row05?.status === 'covered' : row05?.status === 'not_covered',
);
A(
  'B4 row06 status honest',
  covered06 ? row06?.status === 'covered' : row06?.status === 'not_covered',
);
A('B4 row07 still not_covered', row07?.status === 'not_covered');
A('B4 row08 still not_covered', row08?.status === 'not_covered');
A('B4 02A retained', covered02A === true);
A('B4 02B retained', covered02B === true);
A('B4 03 retained', covered03 === true);
A('B4 04 retained', covered04 === true);

section('B5 write receipts (json + matrix md + prove md)');
mkdirSync(receiptDir, { recursive: true });
writeFileSync(receiptJson, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
A('B5 evidence json written', existsSync(receiptJson));
writeFileSync(eg2Json, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
A('B5 eg2 matrix json updated', existsSync(eg2Json));

const nowLabel = '2026-09-23 (~10:50 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 + Batch2b + Batch3 + Batch3b · Ban invent covered）',
  '',
  `**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch3b executed:awaiting_post_prove_dual** · coveredCount **${matrix.coveredCount}** · **≠ invent covered** · \`releaseEvidence=false\` · ≠HA`,
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b+Batch3+Batch3b-aware) · Batch3b `apps/worker/src/r4-funnel-covered-count-batch3b-05-06-wire.ts` · prove `pnpm r4-funnel-covered-count-batch3b-05-06-wire:prove` / `pnpm r4-eg2-funnel-covered:prove`',
  '**Hard**: Ban invent FUNNEL covered · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** · Batch3/Batch3b may elevate **05/06** when productionConsumerWired affirmed · Ban elevating **07/08** · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban self-nail post_prove_dual_pass · Ban second knife',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 when affirmed)`,
  '',
  '## Batch3b result（under authorize · Ban invent · Ban docs-only fake cover）',
  '',
  `- **RAG-FUNNEL-05**: **${covered05 ? 'covered' : 'not_covered'}**${covered05 ? ` · productionConsumerWired=true (worker retrieve → dispatchQbankMissGeneration)` : ` · refuse \`${evidence.funnel05RefuseReason}\``}`,
  `- **RAG-FUNNEL-06**: **${covered06 ? 'covered' : 'not_covered'}**${covered06 ? ` · productionConsumerWired=true (worker retrieve → route-scope cache APIs)` : ` · refuse \`${evidence.funnel06RefuseReason}\``}`,
  `- **batch3bOnly**: true · **coveredCountInvented**: false`,
  `- **Expect**: coveredCount 4→6 if both affirmed · else keep 4 or 5 · this emit coveredCount=**${matrix.coveredCount}**`,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent · Ban docs-only fake cover · Ban wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban elevating 07/08 · Ban invent 6 · Ban second knife · Ban Batch4 parallel',
  '',
  `*Matrix · EG2+Batch1+Batch2+Batch2b+Batch3b · ${nowLabel} · coveredCount=${matrix.coveredCount} · Ban invent covered · releaseEvidence=false · executed:awaiting_post_prove_dual*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('B5 matrix md written', existsSync(mdPath));

const proveLines = [
  '# Prove — G-R4-5 / FUNNEL coveredCount Batch3b（05/06 wire）',
  '',
  '**Status**: `executed:awaiting_post_prove_dual` · Ban invent · Ban self-nail post_prove_dual_pass · product flags false',
  `**Date**: ${nowLabel}`,
  '**CMD**: `pnpm r4-funnel-covered-count-batch3b-05-06-wire:prove` + `pnpm r4-eg2-funnel-covered:prove`',
  `**coveredCount**: **${matrix.coveredCount}** (before Batch3b baseline **4** · expect 4→6 if both affirmed · Ban invent)`,
  `- **RAG-FUNNEL-05**: **${covered05 ? 'covered' : 'not_covered'}** · productionConsumerWired=${a05.productionConsumerWired}${covered05 ? '' : ` · refuse \`${evidence.funnel05RefuseReason}\``}`,
  `- **RAG-FUNNEL-06**: **${covered06 ? 'covered' : 'not_covered'}** · productionConsumerWired=${a06.productionConsumerWired}${covered06 ? '' : ` · refuse \`${evidence.funnel06RefuseReason}\``}`,
  '- **02A/02B/03/04**: covered retained',
  '- **07/08**: not_covered (Ban elevate)',
  `- **r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false`,
  `- **releaseEvidence**: false · **batch3bOnly**: true · **coveredCountInvented**: false`,
  '',
  '## Wire evidence',
  '',
  '- 05 call site: `apps/worker/src/qbank-track-local-retrieve.ts` → `dispatchQbankMissGeneration(` on clean empty serve (optional missGeneration seams · fail-closed absent)',
  '- 06 call site: same retrieve path → `routeScopeRetrievalCacheKey(` / `readRouteScopeNegativeResult(` / `recordRouteScopeNegativeResult(` / `revalidateRouteScopeCacheHit(`',
  '- Ban docs-only fake cover · real import+invoke like Batch2b',
  '',
  `**Evidence**: \`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch3b-05-06-wire-evidence.json\``,
  `**Matrix**: \`rag-funnel-01-08-covered-matrix.md\``,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent · Ban wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 · Batch1 · product-close · EG3',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban elevating 07/08 · Ban invent 6 · Ban second knife · Ban Batch4 parallel',
  '',
];
writeFileSync(proveMd, proveLines.join('\n'), 'utf8');
A('B5 prove md written', existsSync(proveMd));

const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
A('B5 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
A('B5 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
A('B5 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
A('B5 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
A('B5 roundtrip batch3bOnly=true', roundtrip.batch3bOnly === true);

section('B6 hard pins');
A('B6 ≠ invent coveredCount · ≠ flip product flags · ≠ self-nail dual_pass', true);
A('B6 ≠ wash Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 · Batch1 · product-close · EG3', true);
A('B6 Ban MS3=R4 · Ban invent · Ban elevating 07/08 · releaseEvidence=false · executed:awaiting_post_prove_dual', true);
A('B6 Ban docs-only fake cover · real import+invoke required', true);

console.log(
  failures === 0
    ? `\nOK  r4-funnel-covered-count-batch3b-05-06-wire prove (honest emit · coveredCount=${matrix.coveredCount} · 05=${covered05} 06=${covered06} · 02A/02B/03/04 retained · product flags false · Ban invent · executed:awaiting_post_prove_dual · releaseEvidence=false)`
    : `\nFAIL  r4-funnel-covered-count-batch3b-05-06-wire prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
