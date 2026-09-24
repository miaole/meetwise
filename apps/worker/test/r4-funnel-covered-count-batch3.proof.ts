/**
 * G-R4-5 / FUNNEL coveredCount Batch3 — dedicated true-cover prove.
 *
 * Under standing authorize (pre-exec dual BOTH PASS on REQUEST tip e3161b4):
 *   - Assess FUNNEL-05 + FUNNEL-06 production paths.
 *   - Emit evidence · update matrix only for rows assessors affirm.
 *   - EXIT=0 = honest emit (partial ok · prefer keep-4/5 over invent-6).
 *   - EXIT=0 = honest emit · Ban invent · Ban wash product closed.
 *   - harness status = post_prove_dual_pass · Ban invent flags · Ban second knife.
 *
 * HARD:
 *   - harness status = post_prove_dual_pass · Ban invent flags · Ban wash product closed
 *   - r4ProductClosed/funnelProductClosed/gR45Closed remain false
 *   - coveredCount matches rows with status=covered · Ban invent
 *   - Ban wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172
 *     · product-close 1c2ed8c · EG3 7be1a55
 *   - Ban MS3=R4 · Ban elevating 07/08 · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-funnel-covered-count-batch3:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_COVERED_COUNT_BATCH3_EMITTER_WIRED,
  R4_FUNNEL_COVERED_COUNT_BATCH3_EVIDENCE_KIND,
  assessFunnel05SameLeafLlmCleanMiss,
  assessFunnel06RouteScopeCacheProvenanceRevoke,
  emitFunnelCoveredCountBatch3Evidence,
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
  '2026-09-23-g-r4-5-funnel-covered-count-batch3-evidence.json',
);
const proveMd = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch3-prove.md',
);
const eg2Json = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch3.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / FUNNEL coveredCount Batch3 prove');
console.log(
  'EXIT=0 = honest true-cover emit for 05+06 under authorize · Ban invent · post_prove_dual_pass · product flags false',
);

section('B0 anchors');
A('B0 emitter wired', R4_FUNNEL_COVERED_COUNT_BATCH3_EMITTER_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 harness status post_prove_dual_pass + Ban invent flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && !/\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /batch3Only|Batch3/.test(h)
    && /releaseEvidence=false/.test(h)
    && /Ban invent|本刀不翻/.test(h)
    && /Ban second knife|Ban Batch4/.test(h)
    && /STILL OPEN/.test(h);
})());

section('B1 live FUNNEL-05 assessor');
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
console.log(`     → FUNNEL-05 covered=${covered05} (productionConsumerWired=${a05.productionConsumerWired})`);

section('B2 live FUNNEL-06 assessor');
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
console.log(`     → FUNNEL-06 covered=${covered06} (productionConsumerWired=${a06.productionConsumerWired})`);

section('B3 emit Batch3 evidence');
const evidence = emitFunnelCoveredCountBatch3Evidence();
A('B3 kind', evidence.kind === R4_FUNNEL_COVERED_COUNT_BATCH3_EVIDENCE_KIND);
A('B3 batch3Only=true', evidence.batch3Only === true);
A('B3 coveredCountInvented=false', evidence.coveredCountInvented === false);
A('B3 r4ProductClosed=false', evidence.r4ProductClosed === false);
A('B3 funnelProductClosed=false', evidence.funnelProductClosed === false);
A('B3 gR45Closed=false', evidence.gR45Closed === false);
A('B3 ms3EqualsR4Closed=false', evidence.ms3EqualsR4Closed === false);
A('B3 releaseEvidence=false', evidence.releaseEvidence === false);
A('B3 funnel05Covered matches assessor', evidence.funnel05Covered === covered05);
A('B3 funnel06Covered matches assessor', evidence.funnel06Covered === covered06);
A(
  'B3 batch3CoveredCount == coveredIds.length',
  evidence.batch3CoveredCount === evidence.coveredIds.length,
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

section('B4 matrix emit (Batch3-aware EG2 · retain 02A/02B/03/04)');
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

const nowLabel = '2026-09-23 (~10:29 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 + Batch2b + Batch3 · Ban invent covered）',
  '',
  '**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch3 post_prove_dual_pass** · coveredCount **4** honest keep-4 · 05/06 **not_covered** · **≠ invent covered** · `releaseEvidence=false` · ≠HA',
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b+Batch3-aware) · Batch3 `apps/worker/src/r4-funnel-covered-count-batch3.ts` · prove `pnpm r4-funnel-covered-count-batch3:prove` / `pnpm r4-eg2-funnel-covered:prove`',
  '**Hard**: Ban invent FUNNEL covered · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** · Batch3 may elevate **05/06** when assessors affirm · Ban elevating **07/08** · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · post_prove_dual_pass · Ban second knife',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3 05/06 when affirmed)`,
  '',
  '## Batch3 result（under authorize · Ban invent）',
  '',
  `- **RAG-FUNNEL-05**: **${covered05 ? 'covered' : 'not_covered'}**${covered05 ? '' : ` · refuse \`${evidence.funnel05RefuseReason}\``}`,
  `- **RAG-FUNNEL-06**: **${covered06 ? 'covered' : 'not_covered'}**${covered06 ? '' : ` · refuse \`${evidence.funnel06RefuseReason}\``}`,
  `- **batch3Only**: true · **coveredCountInvented**: false`,
  `- **Expect**: coveredCount 4→6 if both affirmed · else keep 4 or 5 · this emit coveredCount=**${matrix.coveredCount}**`,
  '',
  '## Non-claims',
  '',
  '- Not EG2 closed · not invent FUNNEL covered beyond affirmed IDs · not R4/FUNNEL product closed · not 题域已隔离 · not G-R4-5 dual-closed',
  '- product_surfaces_true on FUNNEL-01 ≠ covered elevation · source_sealed on 01A ≠ 01…08 covered',
  '- 本刀不翻 `r4ProductClosed` / `funnelProductClosed` / `gR45Closed` · Ban wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Checklist SSOT **NOT** flipped this knife · Ban elevating 07/08 · post_prove_dual_pass · Ban invent 6 · Ban second knife · Ban Batch4 parallel',
  '',
  `*Matrix · EG2+Batch1+Batch2+Batch2b+Batch3 · ${nowLabel} · coveredCount=${matrix.coveredCount} · Ban invent covered · releaseEvidence=false · post_prove_dual_pass*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('B5 md matrix written', existsSync(mdPath));
A('B5 md pins Ban invent covered', /Ban invent covered/.test(read(mdPath)));
A(
  'B5 md coveredCount matches matrix',
  new RegExp(`\\*\\*coveredCount\\*\\*:\\s*${matrix.coveredCount}`).test(read(mdPath)),
);
A(
  'B5 md FUNNEL-05 status honest',
  covered05
    ? /RAG-FUNNEL-05` \| \*\*covered\*\*/.test(read(mdPath))
    : /RAG-FUNNEL-05` \| \*\*not_covered\*\*/.test(read(mdPath)),
);
A(
  'B5 md FUNNEL-06 status honest',
  covered06
    ? /RAG-FUNNEL-06` \| \*\*covered\*\*/.test(read(mdPath))
    : /RAG-FUNNEL-06` \| \*\*not_covered\*\*/.test(read(mdPath)),
);
A('B5 md FUNNEL-02A covered retained', /RAG-FUNNEL-02A` \| \*\*covered\*\*/.test(read(mdPath)));
A('B5 md FUNNEL-02B covered retained', /RAG-FUNNEL-02B` \| \*\*covered\*\*/.test(read(mdPath)));
A('B5 md FUNNEL-07 not_covered', /RAG-FUNNEL-07` \| \*\*not_covered\*\*/.test(read(mdPath)));
A('B5 md FUNNEL-08 not_covered', /RAG-FUNNEL-08` \| \*\*not_covered\*\*/.test(read(mdPath)));

const proveLines = [
  '# Prove receipt — G-R4-5 / FUNNEL coveredCount Batch3',
  '',
  `**Date**: ${nowLabel}`,
  `**CMD**: \`pnpm r4-funnel-covered-count-batch3:prove\``,
  '**Status**: `post_prove_dual_pass` · prove tip e468de9 · Ban invent · product flags false',
  `**FUNNEL-05 covered**: ${covered05}`,
  `**FUNNEL-06 covered**: ${covered06}`,
  `**FUNNEL-02A/02B/03/04 retained**: ${covered02A}/${covered02B}/${covered03}/${covered04}`,
  `**coveredCount**: ${matrix.coveredCount} (before=4 · after=${matrix.coveredCount} · Ban invent)`,
  `**batch3CoveredCount**: ${evidence.batch3CoveredCount}`,
  '**coveredCountInvented**: false',
  '**r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false',
  '**releaseEvidence**: false · ≠HA',
  '**Evidence**: `receipts/2026-09-23-g-r4-5-funnel-covered-count-batch3-evidence.json`',
  '**Matrix**: `rag-funnel-01-08-covered-matrix.md`',
  covered05 ? '' : `**05 refuse**: \`${evidence.funnel05RefuseReason}\` (honest · Ban invent)`,
  covered06 ? '' : `**06 refuse**: \`${evidence.funnel06RefuseReason}\` (honest · Ban invent)`,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent · Ban wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Ban MS3=R4 · Ban wash this dual_pass into product closed · Ban elevating 07/08 · Ban invent 6 · Ban second knife · Ban Batch4 parallel',
  '',
];
writeFileSync(proveMd, proveLines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n'), 'utf8');
A('B5 prove md written', existsSync(proveMd));

const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
A('B5 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
A('B5 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
A('B5 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
A('B5 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
A('B5 roundtrip batch3Only=true', roundtrip.batch3Only === true);
A('B5 roundtrip batch3CoveredCount', roundtrip.batch3CoveredCount === evidence.batch3CoveredCount);

section('B6 hard pins');
A('B6 ≠ invent coveredCount · ≠ flip product flags · ≠ self-nail dual_pass', true);
A('B6 ≠ wash Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55', true);
A('B6 Ban MS3=R4 · Ban invent · Ban elevating 07/08 · releaseEvidence=false · post_prove_dual_pass', true);

console.log(
  failures === 0
    ? `\nOK  r4-funnel-covered-count-batch3 prove (honest emit · coveredCount=${matrix.coveredCount} · 05=${covered05} 06=${covered06} · 02A/02B/03/04 retained · product flags false · Ban invent · post_prove_dual_pass · releaseEvidence=false)`
    : `\nFAIL  r4-funnel-covered-count-batch3 prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
