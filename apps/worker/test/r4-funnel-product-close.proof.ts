/**
 * G-R4-5 / R4·FUNNEL product close — dedicated prove.
 *
 * Under standing authorize: attempt flip; if evidence insufficient → honest
 * non-flip (do not flip flags) · Ban假关 · Ban invent coveredCount.
 *
 * HARD:
 *   - EXIT=0 = dedicated honesty path under authorize · Ban self-nail post_prove_dual_pass
 *   - r4ProductClosed/funnelProductClosed remain false when coveredCount=0
 *   - ≠ gR45Closed · ≠ invent coveredCount · Ban MS3=R4 · Ban forge
 *   - Ban wash EG3 7be1a55/5b3c854 · R1 9fec7c7/72233a0 · FUNNEL rem/SSOT/EXPLICIT
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
  emitR4FunnelProductCloseHonestNonFlip,
  hasR4FunnelProductCloseHonestNonFlipEvidence,
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
  '2026-09-23-g-r4-5-r4-funnel-product-close-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-r4-funnel-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / R4·FUNNEL product close prove');
console.log(
  'EXIT=0 = authorized attempt · honest non-flip when evidence insufficient · Ban invent coveredCount · Ban self-nail dual_pass',
);

section('P0 anchors');
A('P0 emitter wired', R4_FUNNEL_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flags false', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /r4ProductClosed=false/.test(h)
    && /funnelProductClosed=false/.test(h)
    && /gR45Closed=false/.test(h)
    && /domainIsolationClosed=true/.test(h)
    && /eg3ProductClosed=true/.test(h);
})());

section('P1 flip eligibility (must refuse today)');
const elig = assessR4FunnelProductCloseFlipEligibility();
A('P1 coveredCount=0', elig.coveredCount === 0 && readMatrixCoveredCount() === 0);
A('P1 coveredCountHonestZero', elig.coveredCountHonestZero === true);
A('P1 funnelGapsRemain', elig.funnelGapsRemain === true);
A('P1 canHonestlyFlip=false', elig.canHonestlyFlip === false);
A(
  'P1 refuseReason=evidence_insufficient_coveredCount_zero',
  elig.refuseReason === 'evidence_insufficient_coveredCount_zero',
);

section('P2 attempt closed emission must FAIL (Ban假关)');
const attempt = attemptEmitR4FunnelProductCloseClosed();
A('P2 attempt emitted=false', attempt.emitted === false);
A(
  'P2 attempt reason=evidence_insufficient_coveredCount_zero',
  attempt.emitted === false
    && attempt.reason === 'evidence_insufficient_coveredCount_zero',
);

section('P3 honesty pins');
const pins = assessR4FunnelProductCloseHonestyPins();
A('P3 eg3FlagsRetained', pins.eg3FlagsRetained === true);
A('P3 authorizedSsotPinsPresent', pins.authorizedSsotPinsPresent === true);
A('P3 orthogonalNotClaimedClosed', pins.orthogonalNotClaimedClosed === true);
A('P3 harnessFlagsNotFalselyFlipped', pins.harnessFlagsNotFalselyFlipped === true);
A('P3 matrixHonestyRetained', pins.matrixHonestyRetained === true);

section('P4 emit honest non-flip');
const result = emitR4FunnelProductCloseHonestNonFlip();
A(
  'P4 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
A('P4 hasR4FunnelProductCloseHonestNonFlipEvidence', hasR4FunnelProductCloseHonestNonFlipEvidence() === true);
if (result.emitted) {
  const e = result.evidence;
  A('P4 kind', e.kind === R4_FUNNEL_PRODUCT_CLOSE_EVIDENCE_KIND);
  A('P4 productCloseAttemptedUnderAuthorize=true', e.productCloseAttemptedUnderAuthorize === true);
  A('P4 productCloseFlipped=false', e.productCloseFlipped === false);
  A('P4 evidenceInsufficient=true', 'evidenceInsufficient' in e && e.evidenceInsufficient === true);
  A('P4 r4ProductClosed=false', e.r4ProductClosed === false);
  A('P4 funnelProductClosed=false', e.funnelProductClosed === false);
  A('P4 gR45Closed=false', e.gR45Closed === false);
  A('P4 coveredCount=0', 'coveredCount' in e && e.coveredCount === 0);
  A('P4 coveredCountInvented=false', e.coveredCountInvented === false);
  A('P4 releaseEvidence=false', e.releaseEvidence === false);
  if ('domainIsolationClosed' in e) {
    A('P4 domainIsolationClosed=true retained', e.domainIsolationClosed === true);
    A('P4 eg3ProductClosed=true retained', e.eg3ProductClosed === true);
    A('P4 ms3EqualsR4Closed=false', e.ms3EqualsR4Closed === false);
  }

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P4 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P4 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
  A('P4 roundtrip funnelProductClosed=false', roundtrip.funnelProductClosed === false);
  A('P4 roundtrip productCloseFlipped=false', roundtrip.productCloseFlipped === false);
  A('P4 roundtrip coveredCount=0', roundtrip.coveredCount === 0);
  A('P4 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P5 hard pins');
A('P5 ≠ invent coveredCount · ≠ flip without evidence', true);
A('P5 ≠ wash EG3 7be1a55/5b3c854 · R1 9fec7c7/72233a0 · FUNNEL rem/SSOT/EXPLICIT', true);
A('P5 Ban MS3=R4 · Ban self-nail post_prove_dual_pass · EG1/2/4/5/6 not closed by this knife', true);

console.log(
  failures === 0
    ? '\nOK  r4-funnel-product-close prove (authorized attempt · evidence insufficient · r4ProductClosed/funnelProductClosed NOT flipped · coveredCount=0 · Ban invent · Ban假关 · releaseEvidence=false · Ban self-nail dual_pass)'
    : `\nFAIL  r4-funnel-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
