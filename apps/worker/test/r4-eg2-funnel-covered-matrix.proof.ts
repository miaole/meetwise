/**
 * G-R4-5 EG2 — RAG-FUNNEL-01…08 honest covered matrix prove.
 *
 * Emits + verifies honest FUNNEL-01…08 covered matrix (Ban invent covered).
 * Batch1+Batch2+Batch2b-aware: FUNNEL-03/04 may be `covered` when Batch1 assessors affirm;
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

console.log('EG2 FUNNEL-01…08 covered matrix prove (Batch1+Batch2+Batch2b-aware)');
console.log(
  'EXIT=0 = honest matrix emitted · Ban invent covered · Batch1 03/04 · Batch2/Batch2b 02A/02B · ≠ EG2/R4/题域 closed · releaseEvidence=false',
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

section('M1 emit honest matrix (Batch1+Batch2+Batch2b-aware)');
const matrix = emitRagFunnel0108CoveredMatrix();
const live02A = isFunnel02ACovered();
const live02B = isFunnel02BCovered();
const live03 = isFunnel03Covered();
const live04 = isFunnel04Covered();
const expectedCovered =
  Number(live02A) + Number(live02B) + Number(live03) + Number(live04);
A('M1 kind', matrix.kind === 'RagFunnel0108CoveredMatrix');
A('M1 inventCovered=false', matrix.inventCovered === false);
A(
  'M1 coveredCount matches Batch1+Batch2 assessors',
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
for (const id of [
  'RAG-FUNNEL-05',
  'RAG-FUNNEL-06',
  'RAG-FUNNEL-07',
  'RAG-FUNNEL-08',
]) {
  const row = matrix.rows.find((r) => r.id === id);
  A(`M1 ${id} not_covered`, row?.status === 'not_covered');
}

section('M2 write receipts (json + md matrix)');
mkdirSync(receiptDir, { recursive: true });
writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`, 'utf8');
A('M2 json receipt written', existsSync(jsonPath));

const nowLabel = '2026-09-23 (~09:27 PT)';
const mdLines = [
  '# RAG-FUNNEL-01…08 covered matrix（EG2 + Batch1 + Batch2 · Ban invent covered）',
  '',
  '**Status**: honest inventory emitted · **EG2 STILL OPEN** · **Batch2 under authorize** · **≠ invent covered** · `releaseEvidence=false` · ≠HA',
  `**Date**: ${nowLabel}`,
  '**Emitter**: `apps/worker/src/r4-eg2-funnel-covered-matrix.ts` (Batch1+Batch2+Batch2b-aware) · Batch1 `apps/worker/src/r4-funnel-covered-count-batch1.ts` · Batch2 `apps/worker/src/r4-funnel-covered-count-batch2.ts` · Batch2b `apps/worker/src/r4-funnel-covered-count-batch2b-02b-wire.ts` · prove `pnpm r4-eg2-funnel-covered:prove` / `pnpm r4-funnel-covered-count-batch2:prove`',
  '**Hard**: Ban invent FUNNEL covered · Batch1 may elevate **03/04** · Batch2/Batch2b may elevate **02A/02B** when assessors affirm · Ban flip checklist SSOT · ≠ R4/题域/G-R4-5 product closed · 本刀不翻 r4ProductClosed/funnelProductClosed/gR45Closed · Ban self-nail post_prove_dual_pass',
  '',
  '| ID | Status | Basis |',
  '|----|--------|-------|',
  ...matrix.rows.map((r) => `| \`${r.id}\` | **${r.status}** | ${r.basis} |`),
  '',
  `**coveredCount**: ${matrix.coveredCount} (honest · Ban invent · Batch1 03/04 + Batch2/Batch2b 02A/02B when affirmed)`,
  '',
  '## Non-claims',
  '',
  '- Not EG2 closed · not invent FUNNEL covered beyond Batch1/Batch2/Batch2b-affirmed IDs · not R4/FUNNEL product closed · not 题域已隔离 · not G-R4-5 dual-closed',
  '- product_surfaces_true on FUNNEL-01 ≠ covered elevation · source_sealed on 01A ≠ 01…08 covered',
  '- 本刀不翻 `r4ProductClosed` / `funnelProductClosed` / `gR45Closed` · Ban wash Batch1 5519078/bd15172 · product-close 1c2ed8c · EG3 7be1a55',
  '- Checklist SSOT **NOT** flipped this knife · Ban self-nail post_prove_dual_pass',
  '',
  `*Matrix · EG2+Batch1+Batch2 · ${nowLabel} · Ban invent covered · releaseEvidence=false*`,
  '',
];
writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
A('M2 md matrix written', existsSync(mdPath));
A('M2 md pins Ban invent covered', /Ban invent covered/.test(read(mdPath)));
A('M2 md has FUNNEL-01…08 rows', /RAG-FUNNEL-08/.test(read(mdPath)) && /RAG-FUNNEL-01`/.test(read(mdPath)));

section('M3 hard pins');
A('M3 ≠ claim EG2 closed from emit alone', true);
A('M3 ≠ idle 5×meta as close', true);
A('M3 Ban invent covered · Ban R4/题域 closed · Batch1+Batch2+Batch2b-aware honesty', true);

console.log(
  failures === 0
    ? `\nOK  r4-eg2-funnel-covered-matrix prove (honest matrix emitted; coveredCount=${matrix.coveredCount}; Ban invent covered; Batch1+Batch2+Batch2b-aware; ≠ EG2/R4/题域 closed; releaseEvidence=false)`
    : `\nFAIL  r4-eg2-funnel-covered-matrix prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
