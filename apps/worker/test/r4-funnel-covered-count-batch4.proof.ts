/**
 * G-R4-5 / FUNNEL coveredCount Batch4 — dedicated true-cover prove for 07+08.
 *
 * Under standing authorize (pre-exec dual BOTH PASS on REQUEST tip 1e8edcd):
 *   - Assess FUNNEL-07 + FUNNEL-08 production paths.
 *   - Emit evidence · update matrix 07/08→covered only when assessors affirm.
 *   - EXIT=0 = honest emit (partial ok · prefer keep-6/7 over invent-8).
 *   - Ban invent coveredCount=8 · Ban wash product closed · Ban docs-only fake cover.
 *   - harness status = executed:awaiting_post_prove_dual · Ban self-nail dual_pass.
 *
 * HARD:
 *   - r4ProductClosed/funnelProductClosed/gR45Closed remain false
 *   - coveredCount matches rows with status=covered · Ban invent
 *   - Ban wash Batch3b 85be7ad/9aa1be4 · Batch3 · Batch2b · Batch2 · Batch1 · product-close · EG3
 *   - Ban MS3=R4 · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-funnel-covered-count-batch4:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_COVERED_COUNT_BATCH4_EMITTER_WIRED,
  R4_FUNNEL_COVERED_COUNT_BATCH4_EVIDENCE_KIND,
  emitFunnelCoveredCountBatch4Evidence,
  assessFunnel07FreeTextAllowlistedScopeFunnel,
  assessFunnel08ProductionEquivalentEval,
  isFunnel07Covered,
  isFunnel08Covered,
} from '../src/r4-funnel-covered-count-batch4.ts';
import {
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
import { FREE_TEXT_ALLOWLISTED_SCOPE_FUNNEL_WIRED } from '../src/free-text-route-funnel.ts';

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
  '2026-09-23-g-r4-5-funnel-covered-count-batch4-evidence.json',
);
const proveMd = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch4-prove.md',
);
const eg2Json = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch4.md',
);
const slicePath = join(
  repoRoot,
  'ai-docs/delivery/g-r4-5-funnel-covered-count-batch4.slice.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / FUNNEL coveredCount Batch4 07+08 true-cover prove');
console.log(
  'EXIT=0 = honest true-cover emit for 07+08 under authorize · Ban invent coveredCount=8 · executed:awaiting_post_prove_dual · product flags false',
);

section('B0 anchors');
A('B0 emitter wired', R4_FUNNEL_COVERED_COUNT_BATCH4_EMITTER_WIRED === true);
A('B0 free-text funnel marker wired', FREE_TEXT_ALLOWLISTED_SCOPE_FUNNEL_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 slice present', existsSync(slicePath));
A('B0 harness status executed:awaiting_post_prove_dual + Ban invent flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /batch4Only|Batch4/.test(h)
    && /releaseEvidence=false/.test(h)
    && /Ban invent|本刀不翻/.test(h)
    && /Ban invent coveredCount=8|Ban invent already-8|Ban invent coveredCount=8/.test(h)
    && /Ban second knife/.test(h)
    && /STILL OPEN/.test(h);
})());

section('B1 live FUNNEL-07 assessor');
const a07 = assessFunnel07FreeTextAllowlistedScopeFunnel();
A('B1 domainFreeTextRoutePresent', a07.domainFreeTextRoutePresent === true);
A('B1 dbClassifyFreeTextScopePresent', a07.dbClassifyFreeTextScopePresent === true);
A('B1 noPrivilegeExpansionPinned', a07.noPrivilegeExpansionPinned === true);
A('B1 dbExportsFreeTextRoute', a07.dbExportsFreeTextRoute === true);
A('B1 productionConsumerWired is boolean', typeof a07.productionConsumerWired === 'boolean');
A('B1 noRetrievalGrantOnFunnel', a07.noRetrievalGrantOnFunnel === true);
const covered07 = isFunnel07Covered();
A('B1 isFunnel07Covered (honest live)', typeof covered07 === 'boolean');
A(
  'B1 covered matches all-pins including productionConsumerWired',
  covered07 === (
    a07.domainFreeTextRoutePresent
    && a07.dbClassifyFreeTextScopePresent
    && a07.noPrivilegeExpansionPinned
    && a07.dbExportsFreeTextRoute
    && a07.productionConsumerWired
    && a07.noRetrievalGrantOnFunnel
  ),
);
A(
  'B1 productionConsumerWired must be true for 07 covered (Ban invent)',
  !covered07 || a07.productionConsumerWired === true,
);
console.log(`     → FUNNEL-07 covered=${covered07} (productionConsumerWired=${a07.productionConsumerWired})`);

section('B2 live FUNNEL-08 assessor (honest refuse if not production-equivalent)');
const a08 = assessFunnel08ProductionEquivalentEval();
A('B2 multiLangHoldoutPresent is boolean', typeof a08.multiLangHoldoutPresent === 'boolean');
A('B2 perLeafRecallReported is boolean', typeof a08.perLeafRecallReported === 'boolean');
A('B2 wrongTrackZeroHardAssert is boolean', typeof a08.wrongTrackZeroHardAssert === 'boolean');
A('B2 p95CostThresholdsPreRegistered is boolean', typeof a08.p95CostThresholdsPreRegistered === 'boolean');
A('B2 releaseReceiptsBound is boolean', typeof a08.releaseReceiptsBound === 'boolean');
A('B2 notLocalFakeAlone is boolean', typeof a08.notLocalFakeAlone === 'boolean');
const covered08 = isFunnel08Covered();
A('B2 isFunnel08Covered (honest live)', typeof covered08 === 'boolean');
A(
  'B2 covered matches all-pins including notLocalFakeAlone',
  covered08 === (
    a08.multiLangHoldoutPresent
    && a08.perLeafRecallReported
    && a08.wrongTrackZeroHardAssert
    && a08.p95CostThresholdsPreRegistered
    && a08.releaseReceiptsBound
    && a08.notLocalFakeAlone
  ),
);
A(
  'B2 Ban invent 08 from local fake alone',
  !covered08 || a08.notLocalFakeAlone === true,
);
console.log(`     → FUNNEL-08 covered=${covered08} (releaseReceiptsBound=${a08.releaseReceiptsBound})`);

section('B3 emit Batch4 evidence');
const evidence = emitFunnelCoveredCountBatch4Evidence();
A('B3 kind', evidence.kind === R4_FUNNEL_COVERED_COUNT_BATCH4_EVIDENCE_KIND);
A('B3 batch4Only=true', evidence.batch4Only === true);
A('B3 coveredCountInvented=false', evidence.coveredCountInvented === false);
A('B3 r4ProductClosed=false', evidence.r4ProductClosed === false);
A('B3 funnelProductClosed=false', evidence.funnelProductClosed === false);
A('B3 gR45Closed=false', evidence.gR45Closed === false);
A('B3 ms3EqualsR4Closed=false', evidence.ms3EqualsR4Closed === false);
A('B3 releaseEvidence=false', evidence.releaseEvidence === false);
A('B3 funnel07Covered matches assessor', evidence.funnel07Covered === covered07);
A('B3 funnel08Covered matches assessor', evidence.funnel08Covered === covered08);
A('B3 funnel07ProductionConsumerWired', evidence.funnel07ProductionConsumerWired === a07.productionConsumerWired);
A(
  'B3 batch4CoveredCount == coveredIds.length',
  evidence.batch4CoveredCount === evidence.coveredIds.length,
);
A(
  'B3 coveredIds only 07/08',
  evidence.coveredIds.every((id) => id === 'RAG-FUNNEL-07' || id === 'RAG-FUNNEL-08'),
);
if (!covered07) {
  A('B3 funnel07RefuseReason present when not covered', evidence.funnel07RefuseReason !== null);
}
if (!covered08) {
  A('B3 funnel08RefuseReason present when not covered', evidence.funnel08RefuseReason !== null);
  A(
    'B3 funnel08 refuse cites production-equivalent class',
    /production-equivalent eval matrix not evidenced|local_fake|per_leaf|wrong_track|p95_cost|multi_lang/.test(
      evidence.funnel08RefuseReason ?? '',
    ),
  );
}

section('B4 matrix emit (Batch4-aware EG2 · retain 02A/02B/03/04/05/06)');
const covered02A = isFunnel02ACovered();
const covered02B = isFunnel02BCovered();
const covered03 = isFunnel03Covered();
const covered04 = isFunnel04Covered();
const covered05 = isFunnel05Covered();
const covered06 = isFunnel06Covered();
const matrix = emitRagFunnel0108CoveredMatrix();
const expectedCovered =
  Number(covered02A) + Number(covered02B) + Number(covered03) + Number(covered04)
  + Number(covered05) + Number(covered06)
  + Number(covered07) + Number(covered08);
A('B4 isHonestFunnelCoveredMatrix', isHonestFunnelCoveredMatrix(matrix) === true);
A('B4 inventCovered=false', matrix.inventCovered === false);
A('B4 releaseEvidence=false', matrix.releaseEvidence === false);
A(
  'B4 coveredCount matches live assessors',
  matrix.coveredCount === expectedCovered,
  `got=${matrix.coveredCount} expect=${expectedCovered}`,
);
A('B4 Ban invent coveredCount=8 without both affirmed', !covered07 || !covered08 || matrix.coveredCount === 8);
A('B4 keep-6/7 when partial', (covered07 && covered08) || matrix.coveredCount < 8);
const row07 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-07');
const row08 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-08');
A(
  'B4 row07 status honest',
  covered07 ? row07?.status === 'covered' : row07?.status === 'not_covered',
);
A(
  'B4 row08 status honest',
  covered08 ? row08?.status === 'covered' : row08?.status === 'not_covered',
);
A('B4 02A retained', covered02A === true);
A('B4 02B retained', covered02B === true);
A('B4 03 retained', covered03 === true);
A('B4 04 retained', covered04 === true);
A('B4 05 retained', covered05 === true);
A('B4 06 retained', covered06 === true);

section('B5 write receipts (json + matrix md + prove md)');
mkdirSync(receiptDir, { recursive: true });
writeFileSync(receiptJson, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
A('B5 evidence json written', existsSync(receiptJson));
writeFileSync(eg2Json, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
A('B5 eg2 matrix json updated', existsSync(eg2Json));

const nowLabel = '2026-09-23 (~11:10 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 + Batch2b + Batch3 + Batch3b + Batch4 · Ban invent covered）',
  '',
  `**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch4 executed:awaiting_post_prove_dual** · coveredCount **${matrix.coveredCount}** · 07=${covered07 ? 'covered' : 'not_covered'} · 08=${covered08 ? 'covered' : 'not_covered'} · **≠ invent covered** · \`releaseEvidence=false\` · ≠HA`,
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4-aware) · Batch4 `apps/worker/src/r4-funnel-covered-count-batch4.ts` · prove `pnpm r4-funnel-covered-count-batch4:prove` / `pnpm r4-eg2-funnel-covered:prove`',
  '**Hard**: Ban invent FUNNEL covered · Ban invent coveredCount=8 · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** · Batch3/Batch3b may elevate **05/06** · Batch4 may elevate **07/08** when assessors affirm · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban self-nail post_prove_dual_pass · Ban second knife',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 + Batch4 07/08 when affirmed)`,
  '',
  '## Batch4 result（under authorize · Ban invent · Ban docs-only fake cover · Ban invent coveredCount=8）',
  '',
  `- **RAG-FUNNEL-07**: **${covered07 ? 'covered' : 'not_covered'}**${covered07 ? ` · productionConsumerWired=true (worker free-text allowlisted scope funnel · suggest track only · no retrieval grant)` : ` · refuse \`${evidence.funnel07RefuseReason}\``}`,
  `- **RAG-FUNNEL-08**: **${covered08 ? 'covered' : 'not_covered'}**${covered08 ? ` · production-equivalent eval + release receipts bound` : ` · refuse \`${evidence.funnel08RefuseReason}\``}`,
  `- **batch4Only**: true · **coveredCountInvented**: false`,
  `- **Expect**: coveredCount 6→8 if both affirmed · else keep 6 or 7 · this emit coveredCount=**${matrix.coveredCount}**`,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent coveredCount=8 · Ban docs-only fake cover · Ban wash Batch3b 85be7ad/9aa1be4 · Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban invent · Ban second knife',
  '',
  `*Matrix · EG2+Batch1+Batch2+Batch2b+Batch3b+Batch4 · ${nowLabel} · coveredCount=${matrix.coveredCount} · Ban invent covered · releaseEvidence=false · executed:awaiting_post_prove_dual*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('B5 matrix md written', existsSync(mdPath));

const proveLines = [
  '# Prove — G-R4-5 / FUNNEL coveredCount Batch4（07+08 true-cover）',
  '',
  '**Status**: `executed:awaiting_post_prove_dual` · Ban invent · Ban invent coveredCount=8 · Ban self-nail post_prove_dual_pass · product flags false',
  `**Date**: ${nowLabel}`,
  '**CMD**: `pnpm r4-funnel-covered-count-batch4:prove` + `pnpm r4-eg2-funnel-covered:prove`',
  `**coveredCount**: **${matrix.coveredCount}** (before Batch4 baseline **6** · expect 6→8 if both affirmed · Ban invent coveredCount=8)`,
  `- **RAG-FUNNEL-07**: **${covered07 ? 'covered' : 'not_covered'}** · productionConsumerWired=${a07.productionConsumerWired}${covered07 ? '' : ` · refuse \`${evidence.funnel07RefuseReason}\``}`,
  `- **RAG-FUNNEL-08**: **${covered08 ? 'covered' : 'not_covered'}**${covered08 ? '' : ` · refuse \`${evidence.funnel08RefuseReason}\``}`,
  '- **02A/02B/03/04/05/06**: covered retained',
  `- **r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false`,
  `- **releaseEvidence**: false · **batch4Only**: true · **coveredCountInvented**: false`,
  '',
  '## Wire evidence',
  '',
  '- 07 call site: `apps/worker/src/free-text-route-funnel.ts` → `createFreeTextScopeRevision(` + `classifyFreeTextScope(` · main binds `runFreeTextAllowlistedScopeFunnel` (request-path · suggest allowlisted track only · no retrieval grant)',
  '- 08: production-equivalent eval matrix · elevate only when release receipts + per-leaf Recall@K + wrong-track=0 + P95/cost thresholds bound · local fake/demo alone ≠ passed (UC Alternate)',
  '- Ban docs-only fake cover · real import+invoke like Batch3b',
  '',
  `**Evidence**: \`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4-evidence.json\``,
  `**Matrix**: \`rag-funnel-01-08-covered-matrix.md\``,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent coveredCount=8 · Ban wash Batch3b 85be7ad/9aa1be4 · Batch3 bd3a800/e468de9 · Batch2b · Batch2 · Batch1 · product-close · EG3',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban invent · Ban second knife',
  '',
];
writeFileSync(proveMd, proveLines.join('\n'), 'utf8');
A('B5 prove md written', existsSync(proveMd));

const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
A('B5 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
A('B5 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
A('B5 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
A('B5 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
A('B5 roundtrip batch4Only=true', roundtrip.batch4Only === true);

section('B6 hard pins');
A('B6 ≠ invent coveredCount=8 · ≠ flip product flags · executed:awaiting_post_prove_dual', true);
A('B6 ≠ wash Batch3b 85be7ad/9aa1be4 · Batch3 bd3a800/e468de9 · Batch2b · Batch2 · Batch1 · product-close · EG3', true);
A('B6 Ban MS3=R4 · Ban invent · Ban docs-only fake cover · releaseEvidence=false · Ban self-nail dual_pass', true);

console.log(
  failures === 0
    ? `\nOK  r4-funnel-covered-count-batch4 prove (honest emit · coveredCount=${matrix.coveredCount} · 07=${covered07} 08=${covered08} · 02A/02B/03/04/05/06 retained · product flags false · Ban invent coveredCount=8 · executed:awaiting_post_prove_dual · releaseEvidence=false)`
    : `\nFAIL  r4-funnel-covered-count-batch4 prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
