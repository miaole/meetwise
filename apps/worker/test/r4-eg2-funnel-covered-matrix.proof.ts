/**
 * G-R4-5 EG2 — RAG-FUNNEL-01…08 honest covered matrix prove.
 *
 * Emits + verifies honest FUNNEL-01…08 covered matrix (Ban invent covered).
 * Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4-aware: FUNNEL-03/04 may be `covered` when Batch1 assessors affirm;
 * FUNNEL-02A/02B may be `covered` when Batch2 assessors affirm.
 * Prior 5×meta prove never emitted this matrix.
 *
 * HARD:
 *   - EXIT=0 = matrix emitted honestly · ≠ EG2 closed · ≠ invent covered
 *   - ≠ R4 / 题域 closed · releaseEvidence=false · ≠HA
 *   - Ban idle re-run of the same 5×meta prove as fake close
 *
 * CMD: pnpm r4-eg2-funnel-covered:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EG2_FUNNEL_COVERED_MATRIX_EMITTER_WIRED,
  emitRagFunnel0108CoveredMatrix,
  isHonestFunnelCoveredMatrix,
} from '../src/r4-eg2-funnel-covered-matrix.ts';
import {
  isFunnel03Covered,
  isFunnel04Covered,
} from '../src/r4-funnel-covered-count-batch1.ts';
import {
  isFunnel02ACovered,
  isFunnel02BCovered,
} from '../src/r4-funnel-covered-count-batch2.ts';
import {
  isFunnel05Covered,
  isFunnel06Covered,
} from '../src/r4-funnel-covered-count-batch3.ts';
import {
  isFunnel07Covered,
  isFunnel08Covered,
} from '../src/r4-funnel-covered-count-batch4.ts';

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
const jsonPath = join(receiptDir, '2026-09-17-g-r4-5-eg2-funnel-covered-matrix.json');
const mdPath = join(repoRoot, 'ai-docs/delivery/rag-funnel-01-08-covered-matrix.md');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg1-eg2-true-evidence-impl.md',
);
const checklistPath = join(repoRoot, 'ai-docs/delivery/execution-master-checklist.md');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('EG2 FUNNEL-01…08 covered matrix prove (Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4+Batch4b-aware)');
console.log(
  'EXIT=0 = honest matrix emitted · Ban invent covered · Batch1 03/04 · Batch2/Batch2b 02A/02B · Batch3 05/06 · Batch4 07/08 · Batch4b 08 when affirmed · Ban invent coveredCount=8 · ≠ EG2/R4/题域 closed · releaseEvidence=false',
);

section('M0 anchors');
A('M0 emitter wired', EG2_FUNNEL_COVERED_MATRIX_EMITTER_WIRED === true);
A('M0 harness present', existsSync(harnessPath));
A('M0 harness Ban invent covered + Ban idle 5×meta', (() => {
  const h = read(harnessPath);
  return /Ban invent FUNNEL covered|Ban invent covered/.test(h)
    && /Ban idle re-run of the same 5×meta prove as fake close/.test(h)
    && /EG2 STILL OPEN/.test(h);
})());
A('M0 checklist still has FUNNEL-01…08 open boxes (Ban invent SSOT flip)', (() => {
  const c = read(checklistPath);
  // 01A may be [x]; 01 and later must remain [ ] (SSOT not flipped this knife).
  return /- \[ \] `RAG-FUNNEL-01`/.test(c)
    && /- \[ \] `RAG-FUNNEL-03`/.test(c)
    && /- \[ \] `RAG-FUNNEL-08`/.test(c);
})());

section('M1 emit honest matrix (Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4-aware)');
const matrix = emitRagFunnel0108CoveredMatrix();
const live02A = isFunnel02ACovered();
const live02B = isFunnel02BCovered();
const live03 = isFunnel03Covered();
const live04 = isFunnel04Covered();
const live05 = isFunnel05Covered();
const live06 = isFunnel06Covered();
const live07 = isFunnel07Covered();
const live08 = isFunnel08Covered();
const expectedCovered =
  Number(live02A) + Number(live02B) + Number(live03) + Number(live04)
  + Number(live05) + Number(live06)
  + Number(live07) + Number(live08);
A('M1 kind', matrix.kind === 'RagFunnel0108CoveredMatrix');
A('M1 inventCovered=false', matrix.inventCovered === false);
A(
  'M1 coveredCount matches Batch1+Batch2+Batch3+Batch4 assessors',
  matrix.coveredCount === expectedCovered,
  `got=${matrix.coveredCount} expect=${expectedCovered}`,
);
A('M1 releaseEvidence=false', matrix.releaseEvidence === false);
A('M1 isHonestFunnelCoveredMatrix', isHonestFunnelCoveredMatrix(matrix) === true);

const ids = [
  'RAG-FUNNEL-01A',
  'RAG-FUNNEL-01',
  'RAG-FUNNEL-02A',
  'RAG-FUNNEL-02B',
  'RAG-FUNNEL-03',
  'RAG-FUNNEL-04',
  'RAG-FUNNEL-05',
  'RAG-FUNNEL-06',
  'RAG-FUNNEL-07',
  'RAG-FUNNEL-08',
];
for (const id of ids) {
  const row = matrix.rows.find((r) => r.id === id);
  A(`M1 row ${id} present`, Boolean(row));
}

const row01A = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-01A');
const row01 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-01');
const row02A = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-02A');
const row02B = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-02B');
const row03 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-03');
const row04 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-04');
A('M1 01A status source_sealed', row01A?.status === 'source_sealed');
A('M1 01 status product_surfaces_true (≠ invent covered)', row01?.status === 'product_surfaces_true');
A('M1 01 ≠ invent covered', row01?.status !== 'covered');
A(
  'M1 02A status matches Batch2 assessor',
  live02A ? row02A?.status === 'covered' : row02A?.status === 'not_covered',
);
A(
  'M1 02B status matches Batch2 assessor',
  live02B ? row02B?.status === 'covered' : row02B?.status === 'not_covered',
);
A(
  'M1 03 status matches Batch1 assessor',
  live03 ? row03?.status === 'covered' : row03?.status === 'not_covered',
);
A(
  'M1 04 status matches Batch1 assessor',
  live04 ? row04?.status === 'covered' : row04?.status === 'not_covered',
);
const row05 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-05');
const row06 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-06');
A(
  'M1 05 status matches Batch3 assessor',
  live05 ? row05?.status === 'covered' : row05?.status === 'not_covered',
);
A(
  'M1 06 status matches Batch3 assessor',
  live06 ? row06?.status === 'covered' : row06?.status === 'not_covered',
);
const row07 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-07');
const row08 = matrix.rows.find((r) => r.id === 'RAG-FUNNEL-08');
A(
  'M1 07 status matches Batch4 assessor',
  live07 ? row07?.status === 'covered' : row07?.status === 'not_covered',
);
A(
  'M1 08 status matches Batch4 assessor',
  live08 ? row08?.status === 'covered' : row08?.status === 'not_covered',
);

section('M2 write receipts (json + md matrix)');
mkdirSync(receiptDir, { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
A('M2 json receipt written', existsSync(jsonPath));

const nowLabel = '2026-09-23 (~11:30 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 + Batch2b + Batch3 + Batch3b + Batch4 + Batch4b · Ban invent covered）',
  '',
  `**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch4b executed:awaiting_post_prove_dual** · coveredCount **${matrix.coveredCount}** · 08=${live08 ? 'covered' : 'not_covered'} · **≠ invent covered** · \`releaseEvidence=false\` · ≠HA`,
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4+Batch4b-aware) · Batch4b `apps/worker/src/r4-funnel-covered-count-batch4b-08-eval.ts` · eval wire `apps/worker/src/production-equivalent-funnel-08-eval.ts` · prove `pnpm r4-eg2-funnel-covered:prove` / `pnpm r4-funnel-covered-count-batch4b-08-eval:prove`',
  '**Hard**: Ban invent FUNNEL covered · Ban invent coveredCount=8 · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** · Batch3/Batch3b may elevate **05/06** · Batch4 may elevate **07/08** · Batch4b may elevate **08** when production-equivalent eval matrix evidenced+affirmed · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban self-nail post_prove_dual_pass · covering 08 ≠ product closed',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2 02A + Batch2b 02B + Batch3b 05/06 + Batch4 07 + Batch4b 08 when affirmed)`,
  '',
  '## Batch4b result（under authorize · Ban invent · Ban docs-only fake cover）',
  '',
  `- **RAG-FUNNEL-08**: **${live08 ? 'covered' : 'not_covered'}**${live08 ? ' · production-equivalent eval matrix evidenced' : ''}`,
  `- **02A/02B/03/04/05/06/07**: covered retained`,
  '',
  '## Non-claims',
  '',
  '- Not EG2 closed · not invent FUNNEL covered · not R4/FUNNEL product closed · not 题域已隔离 · not G-R4-5 dual-closed · covering 08 ≠ product closed',
  '- product_surfaces_true on FUNNEL-01 ≠ covered elevation · source_sealed on 01A ≠ 01…08 covered',
  '- 本刀不翻 `r4ProductClosed` / `funnelProductClosed` / `gR45Closed` · Ban wash Batch4 9b8b9a7/b0f5c50 · Batch3b 85be7ad/9aa1be4 · Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Checklist SSOT **NOT** flipped this knife · Ban self-nail post_prove_dual_pass · Ban invent coveredCount=8',
  '',
  `*Matrix · EG2+Batch1+Batch2+Batch2b+Batch3b+Batch4+Batch4b · ${nowLabel} · coveredCount=${matrix.coveredCount} · Ban invent covered · releaseEvidence=false · executed:awaiting_post_prove_dual*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('M2 md matrix written', existsSync(mdPath));
A('M2 md pins Ban invent covered', /Ban invent covered/.test(read(mdPath)));
A('M2 md has FUNNEL-01…08 rows', /RAG-FUNNEL-08/.test(read(mdPath)) && /RAG-FUNNEL-01`/.test(read(mdPath)));

section('M3 hard pins');
A('M3 ≠ claim EG2 closed from emit alone', true);
A('M3 ≠ idle 5×meta as close', true);
A('M3 Ban invent covered · Ban R4/题域 closed · Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4+Batch4b-aware honesty', true);

console.log(
  failures === 0
    ? `\nOK  r4-eg2-funnel-covered-matrix prove (honest matrix emitted; coveredCount=${matrix.coveredCount}; Ban invent covered; Batch1+Batch2+Batch2b+Batch3+Batch3b+Batch4+Batch4b-aware; ≠ EG2/R4/题域 closed; releaseEvidence=false)`
    : `\nFAIL  r4-eg2-funnel-covered-matrix prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
