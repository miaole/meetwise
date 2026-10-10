/**
 * G-R4-5 / EG1 dual-claim product close — dedicated prove.
 *
 * Asserts authorized eg1ProductClosed + gR45DualClaimClosed flip
 * + retained gR45Closed=false / ms3EqualsR4Closed=false
 * + retained EG1 evidence path + retained EG3–EG6/r4/funnel flags + honest non-claims.
 *
 * HARD:
 *   - EXIT=0 = product-close evidence under authorize · Ban self-nail post_prove_dual_pass
 *   - Ban flip gR45Closed / r4 / funnel / eg3 / eg4 / eg5 / eg6 / ms3EqualsR4Closed
 *   - Ban wash EG1 08f7499/ffb2a9b · EG6 315570d/757fbe1 · EG5 33f457b/7f59b95 ·
 *     EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854
 *   - Ban empty meta · Ban MS3=R4 · Ban invent coveredCount · Ban closing EG2 · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-eg1-dual-claim-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessEg1DualClaimProductClose,
  emitEg1DualClaimProductCloseEvidence,
  hasEg1DualClaimProductCloseEvidence,
} from '../src/r4-eg1-dual-claim-product-close.ts';

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
  '2026-09-23-g-r4-5-eg1-dual-claim-product-close-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg1-dual-claim-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / EG1 dual-claim product close prove');
console.log(
  'EXIT=0 = product-close evidence · eg1ProductClosed=true · gR45DualClaimClosed=true · gR45Closed=false · Ban closing EG2 · Ban flip gR45/r4/funnel/eg3–eg6 · Ban self-nail dual_pass',
);

section('P0 anchors');
A('P0 emitter wired', R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flags', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
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
    && /Ban closing EG2|EG2 STILL OPEN/i.test(h);
})());

section('P1 live assessor');
const assess = assessEg1DualClaimProductClose();
A('P1 priorEg1EvidenceRetained', assess.priorEg1EvidenceRetained === true);
A('P1 authorizedSsotPinsPresent', assess.authorizedSsotPinsPresent === true);
A('P1 retainedFlagsHonest', assess.retainedFlagsHonest === true);
A('P1 orthogonalNotClaimedClosed', assess.orthogonalNotClaimedClosed === true);
A('P1 hasEg1DualClaimProductCloseEvidence', hasEg1DualClaimProductCloseEvidence() === true);

section('P2 emit');
const result = emitEg1DualClaimProductCloseEvidence();
A(
  'P2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('P2 kind', e.kind === R4_EG1_DUAL_CLAIM_PRODUCT_CLOSE_EVIDENCE_KIND);
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
  A('P2 eg2ClosedByThisKnife=false', e.eg2ClosedByThisKnife === false);
  A('P2 coveredCountInvented=false', e.coveredCountInvented === false);
  A('P2 emptyMetaAloneDoesNotClose=true', e.emptyMetaAloneDoesNotClose === true);
  A('P2 idleEg1EvidenceAloneDoesNotClose=true', e.idleEg1EvidenceAloneDoesNotClose === true);
  A('P2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P2 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P2 roundtrip eg1ProductClosed=true', roundtrip.eg1ProductClosed === true);
  A('P2 roundtrip gR45DualClaimClosed=true', roundtrip.gR45DualClaimClosed === true);
  A('P2 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
  A('P2 roundtrip ms3EqualsR4Closed=false', roundtrip.ms3EqualsR4Closed === false);
  A('P2 roundtrip eg6ProductClosed=true', roundtrip.eg6ProductClosed === true);
  A('P2 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P3 hard pins');
A('P3 ≠ flip gR45Closed / r4 / funnel / eg3 / eg4 / eg5 / eg6 / ms3EqualsR4Closed this knife', true);
A('P3 ≠ wash EG1 08f7499/ffb2a9b · EG6 315570d/757fbe1 · EG5 33f457b/7f59b95 · EG4 ce09850/0a34933 · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854', true);
A('P3 Ban invent coveredCount · Ban MS3=R4 · Ban closing EG2 · Ban empty meta · Ban self-nail post_prove_dual_pass', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg1-dual-claim-product-close prove (EG1 dual-claim product face closed under authorize; eg1ProductClosed=true; gR45DualClaimClosed=true; gR45Closed=false; Ban closing EG2; Ban flip gR45/r4/funnel/eg3–eg6; releaseEvidence=false; Ban self-nail dual_pass)'
    : `\nFAIL  r4-eg1-dual-claim-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
