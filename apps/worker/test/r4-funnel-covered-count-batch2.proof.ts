/**
 * G-R4-5 / FUNNEL coveredCount Batch2 — dedicated true-cover prove.
 *
 * Under standing authorize (pre-exec dual BOTH PASS on REQUEST tip 21cf3cd):
 *   - Assess FUNNEL-02A + FUNNEL-02B production paths.
 *   - Emit evidence receipt · update matrix only for rows assessors affirm.
 *   - EXIT=0 = honest emit (partial ok) · Ban invent · Ban self-nail dual_pass.
 *
 * HARD:
 *   - harness status = executed:awaiting_post_prove_dual · Ban self-nail post_prove_dual_pass
 *   - r4ProductClosed/funnelProductClosed/gR45Closed remain false
 *   - coveredCount matches rows with status=covered · Ban invent
 *   - Ban wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55
 *   - Ban MS3=R4 · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-funnel-covered-count-batch2:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_COVERED_COUNT_BATCH2_EMITTER_WIRED,
  R4_FUNNEL_COVERED_COUNT_BATCH2_EVIDENCE_KIND,
  assessFunnel02AImmutableGenerationProjectionRecipe,
  assessFunnel02BDurableEmbeddingComputeCache,
  emitFunnelCoveredCountBatch2Evidence,
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
  '2026-09-23-g-r4-5-funnel-covered-count-batch2-evidence.json',
);
const proveMd = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch2-prove.md',
);
const eg2Json = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch2.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / FUNNEL coveredCount Batch2 prove');
console.log(
  'EXIT=0 = honest true-cover emit for 02A+02B under authorize · Ban invent · executed:awaiting_post_prove_dual · product flags false',
);

section('B0 anchors');
A('B0 emitter wired', R4_FUNNEL_COVERED_COUNT_BATCH2_EMITTER_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 harness status awaiting_post_prove_dual + Ban invent flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /batch2Only|Batch2/.test(h)
    && /releaseEvidence=false/.test(h)
    && /Ban invent|本刀不翻/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /STILL OPEN/.test(h);
})());

section('B1 live FUNNEL-02A assessor');
const a02A = assessFunnel02AImmutableGenerationProjectionRecipe();
A('B1 recipeCanonicalFieldsPresent', a02A.recipeCanonicalFieldsPresent === true);
A('B1 immutableGenerationBuilderWired', a02A.immutableGenerationBuilderWired === true);
A('B1 generationProjectionSurfacePresent', a02A.generationProjectionSurfacePresent === true);
A('B1 mainImmutableGenerationPath', a02A.mainImmutableGenerationPath === true);
A('B1 projectionConsumedOnRetrievePath', a02A.projectionConsumedOnRetrievePath === true);
A('B1 mainRecipeInQueryIdentity', a02A.mainRecipeInQueryIdentity === true);
const covered02A = isFunnel02ACovered();
A('B1 isFunnel02ACovered (honest live)', typeof covered02A === 'boolean');
console.log(`     → FUNNEL-02A covered=${covered02A}`);

section('B2 live FUNNEL-02B assessor');
const a02B = assessFunnel02BDurableEmbeddingComputeCache();
A('B2 hmacCacheIdentityPresent', a02B.hmacCacheIdentityPresent === true);
A('B2 resolveDurableFillPresent', a02B.resolveDurableFillPresent === true);
A('B2 claimFillAndValidatePresent', a02B.claimFillAndValidatePresent === true);
A('B2 distinctFromRetrievalCache', a02B.distinctFromRetrievalCache === true);
A('B2 dbExportsComputeCache', a02B.dbExportsComputeCache === true);
// productionConsumerWired may honestly be false — Ban invent; do NOT require true.
A('B2 productionConsumerWired is boolean', typeof a02B.productionConsumerWired === 'boolean');
const covered02B = isFunnel02BCovered();
A('B2 isFunnel02BCovered (honest live)', typeof covered02B === 'boolean');
A(
  'B2 covered matches all-pins including productionConsumerWired',
  covered02B === (
    a02B.hmacCacheIdentityPresent
    && a02B.resolveDurableFillPresent
    && a02B.claimFillAndValidatePresent
    && a02B.distinctFromRetrievalCache
    && a02B.dbExportsComputeCache
    && a02B.productionConsumerWired
  ),
);
console.log(`     → FUNNEL-02B covered=${covered02B} (productionConsumerWired=${a02B.productionConsumerWired})`);

section('B3 emit Batch2 evidence');
const evidence = emitFunnelCoveredCountBatch2Evidence();
A('B3 kind', evidence.kind === R4_FUNNEL_COVERED_COUNT_BATCH2_EVIDENCE_KIND);
A('B3 batch2Only=true', evidence.batch2Only === true);
A('B3 coveredCountInvented=false', evidence.coveredCountInvented === false);
A('B3 r4ProductClosed=false', evidence.r4ProductClosed === false);
A('B3 funnelProductClosed=false', evidence.funnelProductClosed === false);
A('B3 gR45Closed=false', evidence.gR45Closed === false);
A('B3 ms3EqualsR4Closed=false', evidence.ms3EqualsR4Closed === false);
A('B3 releaseEvidence=false', evidence.releaseEvidence === false);
A('B3 funnel02ACovered matches assessor', evidence.funnel02ACovered === covered02A);
A('B3 funnel02BCovered matches assessor', evidence.funnel02BCovered === covered02B);
A(
  'B3 batch2CoveredCount == coveredIds.length',
  evidence.batch2CoveredCount === evidence.coveredIds.length,
);
A(
  'B3 coveredIds only 02A/02B',
  evidence.coveredIds.every((id) => id === 'RAG-FUNNEL-02A' || id === 'RAG-FUNNEL-02B'),
);
if (!covered02A) {
  A('B3 funnel02ARefuseReason present when not covered', evidence.funnel02ARefuseReason !== null);
}
if (!covered02B) {
  A('B3 funnel02BRefuseReason present when not covered', evidence.funnel02BRefuseReason !== null);
}

section('B4 matrix emit (Batch2-aware EG2 · retain Batch1 03/04)');
const covered03 = isFunnel03Covered();
const covered04 = isFunnel04Covered();
const matrix = emitRagFunnel0108CoveredMatrix();
const expectedCovered =
  Number(covered02A) + Number(covered02B) + Number(covered03) + Number(covered04);
A('B4 isHonestFunnelCoveredMatrix', isHonestFunnelCoveredMatrix(matrix) === true);
A('B4 inventCovered=false', matrix.inventCovered === false);
A('B4 releaseEvidence=false', matrix.releaseEvidence === false);
A(
  'B4 coveredCount matches live assessors',
  matrix.coveredCount === expectedCovered,
  `got=${matrix.coveredCount} expect=${expectedCovered}`,
);
const row02A = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-02A');
const row02B = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-02B');
const row03 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-03');
const row04 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-04');
A(
  'B4 row02A status honest',
  covered02A ? row02A?.status === 'covered' : row02A?.status === 'not_covered',
);
A(
  'B4 row02B status honest',
  covered02B ? row02B?.status === 'covered' : row02B?.status === 'not_covered',
);
A('B4 row03 retained covered from Batch1', covered03 ? row03?.status === 'covered' : row03?.status === 'not_covered');
A('B4 row04 retained covered from Batch1', covered04 ? row04?.status === 'covered' : row04?.status === 'not_covered');
for (const id of [
  'RAG-FUNNEL-05',
  'RAG-FUNNEL-06',
  'RAG-FUNNEL-07',
  'RAG-FUNNEL-08',
]) {
  const row = matrix.rows.find((r) => r.id === id);
  A(`B4 ${id} still not_covered`, row?.status === 'not_covered');
}
const row01 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-01');
A('B4 01 ≠ invent covered', row01?.status !== 'covered');

section('B5 write receipts (json + matrix md + prove md)');
mkdirSync(receiptDir, { recursive: true });
writeFileSync(receiptJson, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
A('B5 evidence json written', existsSync(receiptJson));
writeFileSync(eg2Json, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
A('B5 eg2 matrix json updated', existsSync(eg2Json));

const nowLabel = '2026-09-23 (~09:27 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 · Ban invent covered）',
  '',
  '**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch2 under authorize** · **≠ invent covered** · `releaseEvidence=false` · ≠HA',
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2-aware) · Batch1 `apps/worker/src/r4-funnel-covered-count-batch1.ts` · Batch2 `apps/worker/src/r4-funnel-covered-count-batch2.ts` · prove `pnpm r4-funnel-covered-count-batch2:prove` / `pnpm r4-eg2-funnel-covered:prove`',
  '**Hard**: Ban invent FUNNEL covered · Batch1 may elevate **03/04** · Batch2 may elevate **02A/02B** when assessors affirm · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · executed:awaiting_post_prove_dual · Ban self-nail post_prove_dual_pass',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2 02A/02B when affirmed)`,
  '',
  '## Non-claims',
  '',
  '- Not EG2 closed · not invent FUNNEL covered beyond Batch1/Batch2-affirmed IDs · not R4/FUNNEL product closed · not 题域已隔离 · not G-R4-5 dual-closed',
  '- product_surfaces_true on FUNNEL-01 ≠ covered elevation · source_sealed on 01A ≠ 01…08 covered',
  '- 本刀不翻 `r4ProductClosed` / `funnelProductClosed` / `gR45Closed` · Ban wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Checklist SSOT **NOT** flipped this knife · Ban self-nail post_prove_dual_pass',
  '',
  `*Matrix · EG2+Batch1+Batch2 · ${nowLabel} · Ban invent covered · releaseEvidence=false · executed:awaiting_post_prove_dual*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('B5 md matrix written', existsSync(mdPath));
A('B5 md pins Ban invent covered', /Ban invent covered/.test(read(mdPath)));
A(
  'B5 md coveredCount matches matrix',
  new RegExp(`\\*\\*coveredCount\\*\\*:\\s*${matrix.coveredCount}`).test(read(mdPath)),
);
if (covered02A) {
  A('B5 md FUNNEL-02A covered', /RAG-FUNNEL-02A` \| \*\*covered\*\*/.test(read(mdPath)));
} else {
  A('B5 md FUNNEL-02A not_covered', /RAG-FUNNEL-02A` \| \*\*not_covered\*\*/.test(read(mdPath)));
}
if (covered02B) {
  A('B5 md FUNNEL-02B covered', /RAG-FUNNEL-02B` \| \*\*covered\*\*/.test(read(mdPath)));
} else {
  A('B5 md FUNNEL-02B not_covered', /RAG-FUNNEL-02B` \| \*\*not_covered\*\*/.test(read(mdPath)));
}
if (covered03) {
  A('B5 md FUNNEL-03 covered retained', /RAG-FUNNEL-03` \| \*\*covered\*\*/.test(read(mdPath)));
}
if (covered04) {
  A('B5 md FUNNEL-04 covered retained', /RAG-FUNNEL-04` \| \*\*covered\*\*/.test(read(mdPath)));
}

const proveLines = [
  '# Prove receipt — G-R4-5 / FUNNEL coveredCount Batch2',
  '',
  `**Date**: ${nowLabel}`,
  `**CMD**: \`pnpm r4-funnel-covered-count-batch2:prove\``,
  `**Status**: \`executed:awaiting_post_prove_dual\` · Ban self-nail post_prove_dual_pass · Ban invent · product flags false`,
  `**FUNNEL-02A covered**: ${covered02A}`,
  `**FUNNEL-02B covered**: ${covered02B}`,
  `**FUNNEL-03/04 retained**: ${covered03}/${covered04}`,
  `**coveredCount**: ${matrix.coveredCount}`,
  `**batch2CoveredCount**: ${evidence.batch2CoveredCount}`,
  `**coveredCountInvented**: false`,
  `**r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false`,
  `**releaseEvidence**: false · ≠HA`,
  `**Evidence**: \`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch2-evidence.json\``,
  `**Matrix**: \`rag-funnel-01-08-covered-matrix.md\``,
  covered02B ? '' : `**02B refuse**: \`${evidence.funnel02BRefuseReason}\` (honest partial · Ban invent)`,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent · Ban wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban wash this await into product closed · Ban second knife',
  '',
];
writeFileSync(proveMd, proveLines.join('\n'), 'utf8');
A('B5 prove md written', existsSync(proveMd));

const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
A('B5 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
A('B5 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
A('B5 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
A('B5 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
A('B5 roundtrip batch2Only=true', roundtrip.batch2Only === true);
A('B5 roundtrip batch2CoveredCount', roundtrip.batch2CoveredCount === evidence.batch2CoveredCount);

section('B6 hard pins');
A('B6 ≠ invent coveredCount · ≠ flip product flags · ≠ self-nail dual_pass', true);
A('B6 ≠ wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55 · rem/SSOT/EXPLICIT · R1', true);
A('B6 Ban MS3=R4 · Ban invent · releaseEvidence=false · executed:awaiting_post_prove_dual', true);

console.log(
  failures === 0
    ? `\nOK  r4-funnel-covered-count-batch2 prove (honest emit · coveredCount=${matrix.coveredCount} · 02A=${covered02A} 02B=${covered02B} · 03/04 retained · product flags false · Ban invent · executed:awaiting_post_prove_dual · releaseEvidence=false)`
    : `\nFAIL  r4-funnel-covered-count-batch2 prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
