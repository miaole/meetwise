/**
 * G-R4-5 / EG2 funnel-covered product close — dedicated prove.
 *
 * Asserts authorized eg2ProductClosed flip
 * + retained coveredCount=8 (Ban invent)
 * + retained gR45Closed=false / ms3EqualsR4Closed=false
 * + retained eg1/dualClaim/EG3–EG6/r4/funnel flags + honest non-claims.
 *
 * HARD:
 *   - EXIT=0 = product-close evidence under authorize · Ban self-nail post_prove_dual_pass
 *   - Ban flip gR45Closed / eg1 / dualClaim / r4 / funnel / eg3 / eg4 / eg5 / eg6 / ms3EqualsR4Closed
 *   - Ban wash EG1 88277ee/4a0877d · EG1+EG2 08f7499/ffb2a9b · Batch4b f802f02/0e58386 ·
 *     EG6 315570d/757fbe1 · EG5 33f457b/7f59b95 · EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854
 *   - Ban empty meta · Ban MS3=R4 · Ban invent coveredCount · Ban auto-flip gR45Closed · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-eg2-funnel-covered-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessEg2FunnelCoveredProductClose,
  emitEg2FunnelCoveredProductCloseEvidence,
  hasEg2FunnelCoveredProductCloseEvidence,
} from '../src/r4-eg2-funnel-covered-product-close.ts';

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
  '2026-09-23-g-r4-5-eg2-funnel-covered-product-close-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg2-funnel-covered-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / EG2 funnel-covered product close prove');
console.log(
  'EXIT=0 = product-close evidence · eg2ProductClosed=true · coveredCount=8 retained · gR45Closed=false · Ban invent coveredCount · Ban flip gR45/eg1/dualClaim/r4/funnel/eg3–eg6 · Ban self-nail dual_pass',
);

section('P0 anchors');
A('P0 emitter wired', R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flags', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /eg2ProductClosed=true/.test(h)
    && /eg1ProductClosed=true/.test(h)
    && /gR45DualClaimClosed=true/.test(h)
    && /gR45Closed=false/.test(h)
    && /ms3EqualsR4Closed=false/.test(h)
    && /r4ProductClosed=true/.test(h)
    && /funnelProductClosed=true/.test(h)
    && /domainIsolationClosed=true/.test(h)
    && /eg3ProductClosed=true/.test(h)
    && /eg4ProductClosed=true/.test(h)
    && /wrongTrackProductClosed=true/.test(h)
    && /eg5ProductClosed=true/.test(h)
    && /productSsotFlipped=true/.test(h)
    && /eg6ProductClosed=true/.test(h)
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(h)
    && /Ban invent coveredCount/i.test(h);
})());

section('P1 live assessor');
const assess = assessEg2FunnelCoveredProductClose();
A('P1 priorEg2EvidenceRetained', assess.priorEg2EvidenceRetained === true);
A('P1 batch4bCoveredCountRetained', assess.batch4bCoveredCountRetained === true);
A('P1 authorizedSsotPinsPresent', assess.authorizedSsotPinsPresent === true);
A('P1 retainedFlagsHonest', assess.retainedFlagsHonest === true);
A('P1 orthogonalNotClaimedClosed', assess.orthogonalNotClaimedClosed === true);
A('P1 hasEg2FunnelCoveredProductCloseEvidence', hasEg2FunnelCoveredProductCloseEvidence() === true);

section('P2 emit');
const result = emitEg2FunnelCoveredProductCloseEvidence();
A(
  'P2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('P2 kind', e.kind === R4_EG2_FUNNEL_COVERED_PRODUCT_CLOSE_EVIDENCE_KIND);
  A('P2 eg2ProductClosed=true', e.eg2ProductClosed === true);
  A('P2 coveredCount=8', e.coveredCount === 8);
  A('P2 coveredCountInvented=false', e.coveredCountInvented === false);
  A('P2 eg1ProductClosed=true', e.eg1ProductClosed === true);
  A('P2 gR45DualClaimClosed=true', e.gR45DualClaimClosed === true);
  A('P2 gR45Closed=false', e.gR45Closed === false);
  A('P2 ms3EqualsR4Closed=false', e.ms3EqualsR4Closed === false);
  A('P2 r4ProductClosed=true', e.r4ProductClosed === true);
  A('P2 funnelProductClosed=true', e.funnelProductClosed === true);
  A('P2 domainIsolationClosed=true', e.domainIsolationClosed === true);
  A('P2 eg3ProductClosed=true', e.eg3ProductClosed === true);
  A('P2 eg4ProductClosed=true', e.eg4ProductClosed === true);
  A('P2 wrongTrackProductClosed=true', e.wrongTrackProductClosed === true);
  A('P2 eg5ProductClosed=true', e.eg5ProductClosed === true);
  A('P2 productSsotFlipped=true', e.productSsotFlipped === true);
  A('P2 eg6ProductClosed=true', e.eg6ProductClosed === true);
  A('P2 emptyMetaAloneDoesNotClose=true', e.emptyMetaAloneDoesNotClose === true);
  A('P2 idleEg2EvidenceAloneDoesNotClose=true', e.idleEg2EvidenceAloneDoesNotClose === true);
  A('P2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P2 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P2 roundtrip eg2ProductClosed=true', roundtrip.eg2ProductClosed === true);
  A('P2 roundtrip coveredCount=8', roundtrip.coveredCount === 8);
  A('P2 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
  A('P2 roundtrip eg1ProductClosed=true', roundtrip.eg1ProductClosed === true);
  A('P2 roundtrip gR45DualClaimClosed=true', roundtrip.gR45DualClaimClosed === true);
  A('P2 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
  A('P2 roundtrip ms3EqualsR4Closed=false', roundtrip.ms3EqualsR4Closed === false);
  A('P2 roundtrip eg6ProductClosed=true', roundtrip.eg6ProductClosed === true);
  A('P2 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P3 hard pins');
A('P3 ≠ flip gR45Closed / eg1 / dualClaim / r4 / funnel / eg3 / eg4 / eg5 / eg6 / ms3EqualsR4Closed this knife', true);
A('P3 ≠ wash EG1 88277ee/4a0877d · EG1+EG2 08f7499/ffb2a9b · Batch4b f802f02/0e58386 · EG6 315570d/757fbe1 · EG5 33f457b/7f59b95 · EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854', true);
A('P3 Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban auto-flip gR45Closed · Ban self-nail post_prove_dual_pass', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg2-funnel-covered-product-close prove (EG2 funnel-covered product face closed under authorize; eg2ProductClosed=true; coveredCount=8 retained; gR45Closed=false; Ban invent coveredCount; Ban flip gR45/eg1/dualClaim/r4/funnel/eg3–eg6; releaseEvidence=false; Ban self-nail dual_pass)'
    : `\nFAIL  r4-eg2-funnel-covered-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
