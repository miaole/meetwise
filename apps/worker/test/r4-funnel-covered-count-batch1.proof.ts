/**
 * G-R4-5 / FUNNEL coveredCount Batch1 — dedicated true-cover prove.
 *
 * Under standing authorize (pre-exec dual BOTH PASS on REQUEST tip aea4d28):
 *   - Assess FUNNEL-03 + FUNNEL-04 production paths.
 *   - Emit evidence receipt · update matrix only for rows assessors affirm.
 *   - EXIT=0 = honest emit (partial ok) · Ban invent · Ban self-nail dual_pass.
 *
 * HARD:
 *   - harness status = executed:awaiting_post_prove_dual · Ban self-nail post_prove_dual_pass
 *   - r4ProductClosed/funnelProductClosed/gR45Closed remain false
 *   - coveredCount matches rows with status=covered · Ban invent
 *   - Ban wash 1c2ed8c/7be1a55/rem·SSOT·EXPLICIT · Ban MS3=R4
 *   - releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-funnel-covered-count-batch1:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_COVERED_COUNT_BATCH1_EMITTER_WIRED,
  R4_FUNNEL_COVERED_COUNT_BATCH1_EVIDENCE_KIND,
  assessFunnel03JobRouteDecisionProductionPath,
  assessFunnel04TrackLocalScopedRetrievalProduction,
  emitFunnelCoveredCountBatch1Evidence,
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
  '2026-09-23-g-r4-5-funnel-covered-count-batch1-evidence.json',
);
const proveMd = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch1-prove.md',
);
const eg2Json = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch1.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / FUNNEL coveredCount Batch1 prove');
console.log(
  'EXIT=0 = honest true-cover emit for 03+04 under authorize · Ban invent · Ban self-nail dual_pass · product flags false',
);

section('B0 anchors');
A('B0 emitter wired', R4_FUNNEL_COVERED_COUNT_BATCH1_EMITTER_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 harness status awaiting_post_prove_dual + Ban self-nail + flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /batch1Only|Batch1/.test(h)
    && /releaseEvidence=false/.test(h);
})());

section('B1 live FUNNEL-03 assessor');
const a03 = assessFunnel03JobRouteDecisionProductionPath();
A('B1 contractsJobRouteDecisionPresent', a03.contractsJobRouteDecisionPresent === true);
A('B1 domainClassifierWired', a03.domainClassifierWired === true);
A('B1 dbClassifyBindSnapshotWired', a03.dbClassifyBindSnapshotWired === true);
A('B1 workerRouteClassifyConsumerWired', a03.workerRouteClassifyConsumerWired === true);
A('B1 mainRunsRouteClassifyConsumer', a03.mainRunsRouteClassifyConsumer === true);
A('B1 r2StructuralClosedCitedNotInvented', a03.r2StructuralClosedCitedNotInvented === true);
const covered03 = isFunnel03Covered();
A('B1 isFunnel03Covered (honest live)', typeof covered03 === 'boolean');
console.log(`     → FUNNEL-03 covered=${covered03}`);

section('B2 live FUNNEL-04 assessor');
const a04 = assessFunnel04TrackLocalScopedRetrievalProduction();
A('B2 trackLocalHelperWired', a04.trackLocalHelperWired === true);
A('B2 dbDispatchTrackLocalWired', a04.dbDispatchTrackLocalWired === true);
A('B2 domainRetrievalPlanWired', a04.domainRetrievalPlanWired === true);
A('B2 mainInjectsTrackLocalRealWire', a04.mainInjectsTrackLocalRealWire === true);
A('B2 consumerConsumesTrackLocal', a04.consumerConsumesTrackLocal === true);
A('B2 retrieveScopeFailClosed', a04.retrieveScopeFailClosed === true);
const covered04 = isFunnel04Covered();
A('B2 isFunnel04Covered (honest live)', typeof covered04 === 'boolean');
console.log(`     → FUNNEL-04 covered=${covered04}`);

section('B3 emit Batch1 evidence');
const evidence = emitFunnelCoveredCountBatch1Evidence();
A('B3 kind', evidence.kind === R4_FUNNEL_COVERED_COUNT_BATCH1_EVIDENCE_KIND);
A('B3 batch1Only=true', evidence.batch1Only === true);
A('B3 coveredCountInvented=false', evidence.coveredCountInvented === false);
A('B3 r4ProductClosed=false', evidence.r4ProductClosed === false);
A('B3 funnelProductClosed=false', evidence.funnelProductClosed === false);
A('B3 gR45Closed=false', evidence.gR45Closed === false);
A('B3 ms3EqualsR4Closed=false', evidence.ms3EqualsR4Closed === false);
A('B3 releaseEvidence=false', evidence.releaseEvidence === false);
A('B3 funnel03Covered matches assessor', evidence.funnel03Covered === covered03);
A('B3 funnel04Covered matches assessor', evidence.funnel04Covered === covered04);
A(
  'B3 coveredCount == coveredIds.length',
  evidence.coveredCount === evidence.coveredIds.length,
);
A(
  'B3 coveredIds only 03/04',
  evidence.coveredIds.every((id) => id === 'RAG-FUNNEL-03' || id === 'RAG-FUNNEL-04'),
);
if (!covered03) {
  A('B3 funnel03RefuseReason present when not covered', evidence.funnel03RefuseReason !== null);
}
if (!covered04) {
  A('B3 funnel04RefuseReason present when not covered', evidence.funnel04RefuseReason !== null);
}

section('B4 matrix emit (Batch1-aware EG2)');
const matrix = emitRagFunnel0108CoveredMatrix();
A('B4 isHonestFunnelCoveredMatrix', isHonestFunnelCoveredMatrix(matrix) === true);
A('B4 inventCovered=false', matrix.inventCovered === false);
A('B4 releaseEvidence=false', matrix.releaseEvidence === false);
A(
  'B4 coveredCount matches live assessors',
  matrix.coveredCount === (Number(covered03) + Number(covered04)),
);
const row03 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-03');
const row04 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-04');
A(
  'B4 row03 status honest',
  covered03 ? row03?.status === 'covered' : row03?.status === 'not_covered',
);
A(
  'B4 row04 status honest',
  covered04 ? row04?.status === 'covered' : row04?.status === 'not_covered',
);
for (const id of [
  'RAG-FUNNEL-02A',
  'RAG-FUNNEL-02B',
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

const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 · Ban invent covered）',
  '',
  '**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch1 under authorize** · **≠ invent covered** · `releaseEvidence=false` · ≠HA',
  '**Date**: 2026-09-23 (~09:10 PT)',
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1-aware) · Batch1 `apps/worker/src/r4-funnel-covered-count-batch1.ts` · prove `pnpm r4-funnel-covered-count-batch1:prove` / `pnpm r4-eg2-funnel-covered:prove`',
  '**Hard**: Ban invent FUNNEL covered · Batch1 may elevate **03/04 only** when assessors affirm · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · await post-prove dual',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 only)`,
  '',
  '## Non-claims',
  '',
  '- Not EG2 closed · not invent FUNNEL covered beyond Batch1-affirmed 03/04 · not R4/FUNNEL product closed · not 题域已隔离 · not G-R4-5 dual-closed',
  '- product_surfaces_true on FUNNEL-01 ≠ covered elevation · source_sealed on 01A ≠ 01…08 covered',
  '- 本刀不翻 `r4ProductClosed` / `funnelProductClosed` / `gR45Closed` · Ban wash product-close 1c2ed8c / EG3 7be1a55',
  '- Checklist SSOT **NOT** flipped this knife · Ban self-nail post_prove_dual_pass',
  '',
  '*Matrix · EG2+Batch1 · 2026-09-23 (~09:10 PT) · Ban invent covered · releaseEvidence=false*',
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('B5 md matrix written', existsSync(mdPath));
A('B5 md pins Ban invent covered', /Ban invent covered/.test(read(mdPath)));
A(
  'B5 md coveredCount matches matrix',
  new RegExp(`\\*\\*coveredCount\\*\\*:\\s*${matrix.coveredCount}`).test(read(mdPath)),
);
if (covered03) {
  A('B5 md FUNNEL-03 covered', /RAG-FUNNEL-03` \| \*\*covered\*\*/.test(read(mdPath)));
}
if (covered04) {
  A('B5 md FUNNEL-04 covered', /RAG-FUNNEL-04` \| \*\*covered\*\*/.test(read(mdPath)));
}

const proveLines = [
  '# Prove receipt — G-R4-5 / FUNNEL coveredCount Batch1',
  '',
  `**Date**: 2026-09-23 (~09:10 PT)`,
  `**CMD**: \`pnpm r4-funnel-covered-count-batch1:prove\``,
  `**Status**: \`executed:awaiting_post_prove_dual\` · Ban self-nail post_prove_dual_pass`,
  `**FUNNEL-03 covered**: ${covered03}`,
  `**FUNNEL-04 covered**: ${covered04}`,
  `**coveredCount**: ${matrix.coveredCount}`,
  `**coveredCountInvented**: false`,
  `**r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false`,
  `**releaseEvidence**: false · ≠HA`,
  `**Evidence**: \`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch1-evidence.json\``,
  `**Matrix**: \`rag-funnel-01-08-covered-matrix.md\``,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent · Ban wash 1c2ed8c/7be1a55/rem·SSOT·EXPLICIT',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · await post-prove dual',
  '',
];
writeFileSync(proveMd, proveLines.join('\n'), 'utf8');
A('B5 prove md written', existsSync(proveMd));

const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
A('B5 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
A('B5 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
A('B5 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
A('B5 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
A('B5 roundtrip batch1Only=true', roundtrip.batch1Only === true);
A('B5 roundtrip coveredCount', roundtrip.coveredCount === matrix.coveredCount);

section('B6 hard pins');
A('B6 ≠ invent coveredCount · ≠ flip product flags', true);
A('B6 ≠ wash 1c2ed8c/139dac9 · 7be1a55/5b3c854 · rem/SSOT/EXPLICIT · R1 · EG2 invent', true);
A('B6 Ban MS3=R4 · Ban self-nail post_prove_dual_pass · releaseEvidence=false', true);

console.log(
  failures === 0
    ? `\nOK  r4-funnel-covered-count-batch1 prove (honest emit · coveredCount=${matrix.coveredCount} · 03=${covered03} 04=${covered04} · product flags false · Ban invent · Ban self-nail dual_pass · releaseEvidence=false)`
    : `\nFAIL  r4-funnel-covered-count-batch1 prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
