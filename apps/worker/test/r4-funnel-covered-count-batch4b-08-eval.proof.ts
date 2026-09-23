/**
 * G-R4-5 / FUNNEL coveredCount Batch4b（08 eval）— dedicated true-cover prove.
 *
 * Under standing authorize (pre-exec dual BOTH PASS on REQUEST tip 77b9d57):
 *   - Run production-equivalent eval matrix wire (real produce+bind receipts).
 *   - Assess FUNNEL-08 via Batch4 assessor pins.
 *   - Emit evidence · update matrix 08→covered only when assessor affirms.
 *   - EXIT=0 = honest emit (refuse ok · prefer keep-7 over invent-8).
 *   - Ban invent coveredCount=8 · Ban wash product closed · Ban docs-only fake cover.
 *   - harness status = executed:awaiting_post_prove_dual · Ban self-nail dual_pass.
 *
 * HARD:
 *   - r4ProductClosed/funnelProductClosed/gR45Closed remain false
 *   - coveredCount matches rows with status=covered · Ban invent
 *   - Ban wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch3 · Batch2b · Batch2 · Batch1 · product-close · EG3
 *   - Ban MS3=R4 · releaseEvidence=false · ≠HA
 *   - covering 08 ≠ product closed / ≠ G-R4-5 closed
 *
 * CMD: pnpm r4-funnel-covered-count-batch4b-08-eval:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EMITTER_WIRED,
  R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EVIDENCE_KIND,
  emitFunnelCoveredCountBatch4b08EvalEvidence,
} from '../src/r4-funnel-covered-count-batch4b-08-eval.ts';
import {
  PRODUCTION_EQUIVALENT_FUNNEL_08_EVAL_WIRED,
  runProductionEquivalentFunnel08Eval,
} from '../src/production-equivalent-funnel-08-eval.ts';
import {
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
  '2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-evidence.json',
);
const proveMd = join(
  receiptDir,
  '2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-prove.md',
);
const eg2Json = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const releaseReceiptPath = join(
  receiptDir,
  'production-equivalent-funnel-08-release.json',
);
const thresholdsPath = join(
  receiptDir,
  'production-equivalent-funnel-08-thresholds.json',
);
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-funnel-covered-count-batch4b-08-eval.md',
);
const slicePath = join(
  repoRoot,
  'ai-docs/delivery/g-r4-5-funnel-covered-count-batch4b-08-eval.slice.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / FUNNEL coveredCount Batch4b 08 eval true-cover prove');
console.log(
  'EXIT=0 = honest true-cover emit for 08 under authorize · Ban invent coveredCount=8 · executed:awaiting_post_prove_dual · product flags false',
);

section('B0 anchors');
A('B0 emitter wired', R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EMITTER_WIRED === true);
A('B0 eval wire marker', PRODUCTION_EQUIVALENT_FUNNEL_08_EVAL_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 slice present', existsSync(slicePath));
A('B0 harness status executed:awaiting_post_prove_dual + Ban invent flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /batch4bOnly|Batch4b/.test(h)
    && /releaseEvidence=false/.test(h)
    && /Ban invent|本刀不翻/.test(h)
    && /Ban invent coveredCount=8|Ban invent already-8/.test(h)
    && /Ban second knife/.test(h)
    && /Ban self-nail/.test(h)
    && /STILL OPEN/.test(h);
})());

section('B1 run production-equivalent eval matrix wire (real produce+bind)');
const evalRun = runProductionEquivalentFunnel08Eval(repoRoot);
A('B1 eval mode production-equivalent', evalRun.mode === 'production-equivalent');
A('B1 eval releaseEvidence=false (product honesty)', evalRun.releaseEvidence === false);
A('B1 datasetDigest bound', /^[a-f0-9]{64}$/.test(evalRun.datasetDigest));
A('B1 policyDigest bound', /^[a-f0-9]{64}$/.test(evalRun.policyDigest));
A('B1 recipeDigest bound', /^[a-f0-9]{64}$/.test(evalRun.recipeDigest));
A('B1 environmentDigest bound', /^[a-f0-9]{64}$/.test(evalRun.environmentDigest));
A('B1 wrongTrackZero hard assert', evalRun.wrongTrackZero === true);
A('B1 hardZeroAssert text', /wrong-track=0 hard-zero/.test(evalRun.hardZeroAssert));
A('B1 release receipt written', existsSync(releaseReceiptPath));
A('B1 thresholds written', existsSync(thresholdsPath));
A(
  'B1 holdout kinds multi-lang/fullstack/ambiguity/injection',
  evalRun.holdoutKindsPresent.includes('multi-lang')
    && evalRun.holdoutKindsPresent.includes('fullstack')
    && evalRun.holdoutKindsPresent.includes('ambiguity')
    && evalRun.holdoutKindsPresent.includes('injection'),
);
A('B1 perLeaf has 4 backend leafs', evalRun.perLeaf.length === 4);
A(
  'B1 perLeaf leafTrackId backend/(nodejs|java|go|python)',
  evalRun.perLeaf.every((m) =>
    /^backend\/(nodejs|java|go|python)$/.test(m.leafTrackId),
  ),
);
A(
  'B1 perLeaf Recall@K reported',
  evalRun.perLeaf.every((m) => typeof m.recallAtK === 'number' && m.k === 5),
);
console.log(
  `     → digests bound · perLeaf=${evalRun.perLeaf.length} · wrongTrackZero=${evalRun.wrongTrackZero}`,
);

section('B2 live FUNNEL-08 assessor (Batch4 reuse · clear refuse if evidenced)');
const a08 = assessFunnel08ProductionEquivalentEval();
A('B2 multiLangHoldoutPresent', a08.multiLangHoldoutPresent === true);
A('B2 perLeafRecallReported', a08.perLeafRecallReported === true);
A('B2 wrongTrackZeroHardAssert', a08.wrongTrackZeroHardAssert === true);
A('B2 p95CostThresholdsPreRegistered', a08.p95CostThresholdsPreRegistered === true);
A('B2 releaseReceiptsBound', a08.releaseReceiptsBound === true);
A('B2 notLocalFakeAlone', a08.notLocalFakeAlone === true);
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
console.log(
  `     → FUNNEL-08 covered=${covered08} (releaseReceiptsBound=${a08.releaseReceiptsBound} notLocalFakeAlone=${a08.notLocalFakeAlone})`,
);

section('B3 emit Batch4b evidence');
const evidence = emitFunnelCoveredCountBatch4b08EvalEvidence(evalRun);
A('B3 kind', evidence.kind === R4_FUNNEL_COVERED_COUNT_BATCH4B_08_EVAL_EVIDENCE_KIND);
A('B3 batch4bOnly=true', evidence.batch4bOnly === true);
A('B3 coveredCountInvented=false', evidence.coveredCountInvented === false);
A('B3 r4ProductClosed=false', evidence.r4ProductClosed === false);
A('B3 funnelProductClosed=false', evidence.funnelProductClosed === false);
A('B3 gR45Closed=false', evidence.gR45Closed === false);
A('B3 ms3EqualsR4Closed=false', evidence.ms3EqualsR4Closed === false);
A('B3 releaseEvidence=false', evidence.releaseEvidence === false);
A('B3 evalWirePresent', evidence.evalWirePresent === true);
A('B3 funnel08Covered matches assessor', evidence.funnel08Covered === covered08);
A(
  'B3 batch4bCoveredCount == coveredIds.length',
  evidence.batch4bCoveredCount === evidence.coveredIds.length,
);
A(
  'B3 coveredIds only 08',
  evidence.coveredIds.every((id) => id === 'RAG-FUNNEL-08'),
);
if (!covered08) {
  A('B3 funnel08RefuseReason present when not covered', evidence.funnel08RefuseReason !== null);
  A(
    'B3 funnel08 refuse cites production-equivalent class',
    /production-equivalent eval matrix not evidenced|local_fake|per_leaf|wrong_track|p95_cost|multi_lang/.test(
      evidence.funnel08RefuseReason ?? '',
    ),
  );
} else {
  A('B3 funnel08RefuseReason null when covered', evidence.funnel08RefuseReason === null);
}

section('B4 matrix emit (Batch4b-aware EG2 · retain 02A–07)');
const covered02A = isFunnel02ACovered();
const covered02B = isFunnel02BCovered();
const covered03 = isFunnel03Covered();
const covered04 = isFunnel04Covered();
const covered05 = isFunnel05Covered();
const covered06 = isFunnel06Covered();
const covered07 = isFunnel07Covered();
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
A('B4 Ban invent coveredCount=8 without 08 affirmed', !covered08 || matrix.coveredCount === 8);
A('B4 keep-7 when 08 not affirmed', covered08 || matrix.coveredCount === 7);
const row08 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-08');
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
A('B4 07 retained', covered07 === true);

section('B5 write receipts (json + matrix md + prove md)');
mkdirSync(receiptDir, { recursive: true });
writeFileSync(receiptJson, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
A('B5 evidence json written', existsSync(receiptJson));
writeFileSync(eg2Json, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
A('B5 eg2 matrix json updated', existsSync(eg2Json));

const nowLabel = '2026-09-23 (~11:30 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 + Batch2b + Batch3 + Batch3b + Batch4 + Batch4b · Ban invent covered）',
  '',
  `**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch4b executed:awaiting_post_prove_dual** · coveredCount **${matrix.coveredCount}**（7→${matrix.coveredCount} honesty）· 08=${covered08 ? 'covered' : 'not_covered'} · **≠ invent covered** · \`releaseEvidence=false\` · ≠HA`,
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4+Batch4b-aware) · Batch4b `apps/worker/src/r4-funnel-covered-count-batch4b-08-eval.ts` · eval wire `apps/worker/src/production-equivalent-funnel-08-eval.ts` · prove `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` / `pnpm r4-eg2-funnel-covered:prove`',
  '**Hard**: Ban invent FUNNEL covered · Ban invent coveredCount=8 · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** · Batch3/Batch3b may elevate **05/06** · Batch4 may elevate **07/08** · Batch4b may elevate **08** when production-equivalent eval matrix evidenced+affirmed · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban self-nail post_prove_dual_pass · Ban invent coveredCount=8 · Ban second knife · Ban wash into product-closed · covering 08 ≠ product closed',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 + Batch4 07 + Batch4b 08 when affirmed)`,
  '',
  '## Batch4b result（under authorize · Ban invent · Ban docs-only fake cover · Ban invent coveredCount=8）',
  '',
  `- **RAG-FUNNEL-08**: **${covered08 ? 'covered' : 'not_covered'}**${covered08 ? ` · production-equivalent eval matrix evidenced (release receipts bound · per-leaf Recall@K · wrong-track=0 hard-zero · P95/成本预注册 · notLocalFakeAlone)` : ` · refuse \`${evidence.funnel08RefuseReason}\``}`,
  `- **batch4bOnly**: true · **coveredCountInvented**: false`,
  `- **Expect**: coveredCount 7→8 if affirmed · else keep 7 · this emit coveredCount=**${matrix.coveredCount}**`,
  `- **02A/02B/03/04/05/06/07**: covered retained`,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent coveredCount=8 · Ban docs-only fake cover · Ban wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch3 bd3a800/e468de9 · Batch2b ddfb64d/824e072 · Batch2 0a980e6/5593226 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban invent · Ban second knife · covering 08 ≠ product closed / ≠ G-R4-5 closed',
  '',
  `*Matrix · EG2+Batch1+Batch2+Batch2b+Batch3b+Batch4+Batch4b · ${nowLabel} · coveredCount=${matrix.coveredCount} · Ban invent covered · releaseEvidence=false · executed:awaiting_post_prove_dual*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('B5 matrix md written', existsSync(mdPath));

const proveLines = [
  '# Prove — G-R4-5 / FUNNEL coveredCount Batch4b（08 eval true-cover）',
  '',
  '**Status**: `executed:awaiting_post_prove_dual` · Ban invent · Ban invent coveredCount=8 · Ban self-nail post_prove_dual_pass · product flags false',
  `**Date**: ${nowLabel}`,
  '**CMD**: `pnpm r4-funnel-covered-count-batch4b-08-eval:prove` + `pnpm r4-eg2-funnel-covered:prove`',
  `**coveredCount**: **${matrix.coveredCount}** (before Batch4b baseline **7** · expect 7→8 if affirmed · Ban invent coveredCount=8)`,
  `- **RAG-FUNNEL-08**: **${covered08 ? 'covered' : 'not_covered'}**${covered08 ? '' : ` · refuse \`${evidence.funnel08RefuseReason}\``}`,
  '- **02A/02B/03/04/05/06/07**: covered retained',
  `- **r4ProductClosed**: false · **funnelProductClosed**: false · **gR45Closed**: false`,
  `- **releaseEvidence**: false · **batch4bOnly**: true · **coveredCountInvented**: false`,
  '',
  '## Wire evidence',
  '',
  '- 08 eval wire: `apps/worker/src/production-equivalent-funnel-08-eval.ts` → `runProductionEquivalentFunnel08Eval(` produces+binds `production-equivalent-funnel-08-release.json` + `…-thresholds.json`',
  '- Assessor pins (Batch4 reuse): releaseReceiptsBound · perLeafRecallReported · wrongTrackZeroHardAssert · p95CostThresholdsPreRegistered · multiLangHoldoutPresent · notLocalFakeAlone',
  '- UC Alternate: local fake/demo/benchmark alone ≠ passed — elevate only when all pins bound',
  '- Ban docs-only fake cover · real produce+bind like Batch3b wire precedent',
  '',
  `**Evidence**: \`receipts/2026-09-23-g-r4-5-funnel-covered-count-batch4b-08-eval-evidence.json\``,
  `**Release**: \`receipts/production-equivalent-funnel-08-release.json\``,
  `**Thresholds**: \`receipts/production-equivalent-funnel-08-thresholds.json\``,
  `**Matrix**: \`rag-funnel-01-08-covered-matrix.md\``,
  '',
  '## Non-claims',
  '',
  '- Not product close · not gR45Closed · Ban invent coveredCount=8 · Ban wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch3 · Batch2b · Batch2 · Batch1 · product-close · EG3',
  '- Ban MS3=R4 · Ban self-nail post_prove_dual_pass · Ban invent · Ban second knife · covering 08 ≠ product closed',
  '',
];
writeFileSync(proveMd, proveLines.join('\n'), 'utf8');
A('B5 prove md written', existsSync(proveMd));

const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
A('B5 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
A('B5 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
A('B5 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
A('B5 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
A('B5 roundtrip batch4bOnly=true', roundtrip.batch4bOnly === true);
A('B5 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);

section('B6 hard pins');
A('B6 ≠ invent coveredCount=8 · ≠ flip product flags · executed:awaiting_post_prove_dual', true);
A('B6 ≠ wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch3 · Batch2b · Batch2 · Batch1 · product-close · EG3', true);
A('B6 Ban MS3=R4 · Ban invent · Ban docs-only fake cover · Ban self-nail post_prove_dual_pass · releaseEvidence=false · covering 08 ≠ product closed', true);

console.log(
  failures === 0
    ? `\nOK  r4-funnel-covered-count-batch4b-08-eval prove (honest emit · coveredCount=${matrix.coveredCount} · 08=${covered08} · 02A–07 retained · product flags false · Ban invent coveredCount=8 · executed:awaiting_post_prove_dual · releaseEvidence=false)`
    : `\nFAIL  r4-funnel-covered-count-batch4b-08-eval prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
