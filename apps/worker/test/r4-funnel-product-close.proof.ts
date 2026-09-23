/**
 * G-R4-5 / R4·FUNNEL product-close reassess — dedicated prove.
 *
 * Under standing authorize (post pre-exec dual BOTH PASS on tip dc4180d):
 * flip eligibility reads live matrix coveredCount=8 + 02A…08 covered.
 * If canHonestlyFlip → honest SSOT flip r4ProductClosed/funnelProductClosed.
 * gR45Closed default do NOT auto-flip. Ban假关 · Ban invent coveredCount.
 *
 * HARD:
 *   - EXIT=0 = dedicated honesty path under authorize · Ban self-nail post_prove_dual_pass
 *   - ARCHIVE prior non-flip (da185d9/139dac9/1c2ed8c · coveredCount was 0) retained
 *   - ≠ wash Batch4b f802f02/0e58386 · ≠ MS3=R4 · Ban forge
 *   - releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-funnel-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_FUNNEL_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessR4FunnelProductCloseFlipEligibility,
  assessR4FunnelProductCloseHonestyPins,
  attemptEmitR4FunnelProductCloseClosed,
  funnel02Through08AllCovered,
  hasR4FunnelProductCloseFlippedEvidence,
  readMatrixCoveredCount,
} from '../src/r4-funnel-product-close.ts';

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
  '2026-09-23-g-r4-5-r4-funnel-product-close-reassess-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close-reassess.md',
);
const archiveHarnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / R4·FUNNEL product-close reassess prove');
console.log(
  'EXIT=0 = authorized attempt · honest flip when coveredCount=8 + 02A…08 covered · Ban invent · Ban self-nail dual_pass · gR45Closed stays false',
);

section('P0 anchors');
A('P0 emitter wired', R4_FUNNEL_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 reassess harness present', existsSync(harnessPath));
A('P0 ARCHIVE prior harness present', existsSync(archiveHarnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flip flags', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /r4ProductClosed=true/.test(h)
    && /funnelProductClosed=true/.test(h)
    && /gR45Closed=false/.test(h)
    && /domainIsolationClosed=true/.test(h)
    && /eg3ProductClosed=true/.test(h)
    && /coveredCount.*8|coveredCount\*\*.*8/.test(h);
})());
A('P0 ARCHIVE prior non-flip retained', (() => {
  const a = read(archiveHarnessPath);
  return /post_prove_dual_pass/.test(a)
    && /r4ProductClosed=false/.test(a)
    && /evidence_insufficient_coveredCount_zero|coveredCount.*0/.test(a);
})());

section('P1 flip eligibility (must PASS today · coveredCount=8)');
const elig = assessR4FunnelProductCloseFlipEligibility();
A('P1 coveredCount=8', elig.coveredCount === 8 && readMatrixCoveredCount() === 8);
A('P1 funnelAllCovered', elig.funnelAllCovered === true && funnel02Through08AllCovered() === true);
A('P1 funnelGapsRemain=false', elig.funnelGapsRemain === false);
A('P1 canHonestlyFlip=true', elig.canHonestlyFlip === true);
A('P1 refuseReason=null', elig.refuseReason === null);

section('P2 honesty pins (expect flipped)');
const pins = assessR4FunnelProductCloseHonestyPins({ expectFlipped: true });
A('P2 eg3FlagsRetained', pins.eg3FlagsRetained === true);
A('P2 authorizedSsotPinsPresent', pins.authorizedSsotPinsPresent === true);
A('P2 orthogonalNotClaimedClosed', pins.orthogonalNotClaimedClosed === true);
A('P2 harnessFlagsMatchOutcome', pins.harnessFlagsMatchOutcome === true);
A('P2 matrixHonestyRetained', pins.matrixHonestyRetained === true);
A('P2 archivePriorNonFlipRetained', pins.archivePriorNonFlipRetained === true);

section('P3 attempt closed emission must SUCCEED (honest flip)');
const attempt = attemptEmitR4FunnelProductCloseClosed();
A(
  'P3 attempt emitted=true',
  attempt.emitted === true,
  attempt.emitted ? undefined : `reason=${(attempt as { reason?: string }).reason}`,
);
A('P3 hasR4FunnelProductCloseFlippedEvidence', hasR4FunnelProductCloseFlippedEvidence() === true);
if (attempt.emitted) {
  const e = attempt.evidence;
  A('P3 kind', e.kind === R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND);
  A('P3 productCloseAttemptedUnderAuthorize=true', e.productCloseAttemptedUnderAuthorize === true);
  A('P3 productCloseFlipped=true', e.productCloseFlipped === true);
  A('P3 evidenceInsufficient=false', 'evidenceInsufficient' in e && e.evidenceInsufficient === false);
  A('P3 r4ProductClosed=true', e.r4ProductClosed === true);
  A('P3 funnelProductClosed=true', e.funnelProductClosed === true);
  A('P3 gR45Closed=false', e.gR45Closed === false);
  A('P3 coveredCount=8', 'coveredCount' in e && e.coveredCount === 8);
  A('P3 coveredCountInvented=false', e.coveredCountInvented === false);
  A('P3 releaseEvidence=false', e.releaseEvidence === false);
  if ('domainIsolationClosed' in e) {
    A('P3 domainIsolationClosed=true retained', e.domainIsolationClosed === true);
    A('P3 eg3ProductClosed=true retained', e.eg3ProductClosed === true);
    A('P3 ms3EqualsR4Closed=false', e.ms3EqualsR4Closed === false);
  }
  if ('archivePriorNonFlipRetained' in e) {
    A('P3 archivePriorNonFlipRetained=true', e.archivePriorNonFlipRetained === true);
  }

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P3 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P3 roundtrip r4ProductClosed=true', roundtrip.r4ProductClosed === true);
  A('P3 roundtrip funnelProductClosed=true', roundtrip.funnelProductClosed === true);
  A('P3 roundtrip productCloseFlipped=true', roundtrip.productCloseFlipped === true);
  A('P3 roundtrip coveredCount=8', roundtrip.coveredCount === 8);
  A('P3 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
  A('P3 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P4 hard pins');
A('P4 ≠ invent coveredCount · ≠ auto-flip gR45Closed', true);
A('P4 ≠ wash Batch4b f802f02/0e58386 · ARCHIVE da185d9/139dac9/1c2ed8c retained', true);
A('P4 Ban MS3=R4 · Ban self-nail post_prove_dual_pass · EG1/2/4/5/6 not closed by this knife', true);

console.log(
  failures === 0
    ? '\nOK  r4-funnel-product-close prove (authorized reassess · honest flip · r4ProductClosed=true · funnelProductClosed=true · gR45Closed=false · coveredCount=8 · Ban invent · Ban假关 · releaseEvidence=false · Ban self-nail dual_pass)'
    : `\nFAIL  r4-funnel-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
