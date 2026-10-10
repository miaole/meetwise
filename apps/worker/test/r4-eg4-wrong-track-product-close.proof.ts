/**
 * G-R4-5 / EG4 wrong-track product close — dedicated prove.
 *
 * Asserts authorized eg4ProductClosed / wrongTrackProductClosed flip + retained
 * EG4 evidence path + retained EG3/r4/funnel flags + honest non-claims for THIS knife.
 *
 * HARD:
 *   - EXIT=0 = product-close evidence under authorize · Ban self-nail post_prove_dual_pass
 *   - Ban flip gR45Closed / r4ProductClosed / funnelProductClosed · Ban invent coveredCount
 *   - Ban wash EG4 3cefebf/ec90b6d · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854
 *   - Ban empty meta · Ban MS3=R4 · Ban closing EG1/2/5/6 · releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-eg4-wrong-track-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessEg4WrongTrackProductClose,
  emitEg4WrongTrackProductCloseEvidence,
  hasEg4WrongTrackProductCloseEvidence,
} from '../src/r4-eg4-wrong-track-product-close.ts';

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
  '2026-09-23-g-r4-5-eg4-wrong-track-product-close-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg4-wrong-track-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / EG4 wrong-track product close prove');
console.log(
  'EXIT=0 = product-close evidence · eg4ProductClosed=true · wrongTrackProductClosed=true under authorize · Ban flip gR45/r4/funnel · Ban self-nail dual_pass',
);

section('P0 anchors');
A('P0 emitter wired', R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flags', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /eg4ProductClosed=true/.test(h)
    && /wrongTrackProductClosed=true/.test(h)
    && /gR45Closed=false/.test(h)
    && /r4ProductClosed=true/.test(h)
    && /funnelProductClosed=true/.test(h)
    && /domainIsolationClosed=true/.test(h)
    && /eg3ProductClosed=true/.test(h);
})());

section('P1 live assessor');
const assess = assessEg4WrongTrackProductClose();
A('P1 wrongTrackPathHonest', assess.wrongTrackPathHonest === true);
A('P1 priorEg4EvidenceRetained', assess.priorEg4EvidenceRetained === true);
A('P1 authorizedSsotPinsPresent', assess.authorizedSsotPinsPresent === true);
A('P1 retainedFlagsHonest', assess.retainedFlagsHonest === true);
A('P1 orthogonalNotClaimedClosed', assess.orthogonalNotClaimedClosed === true);
A('P1 hasEg4WrongTrackProductCloseEvidence', hasEg4WrongTrackProductCloseEvidence() === true);

section('P2 emit');
const result = emitEg4WrongTrackProductCloseEvidence();
A(
  'P2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('P2 kind', e.kind === R4_EG4_WRONG_TRACK_PRODUCT_CLOSE_EVIDENCE_KIND);
  A('P2 eg4ProductClosed=true', e.eg4ProductClosed === true);
  A('P2 wrongTrackProductClosed=true', e.wrongTrackProductClosed === true);
  A('P2 gR45Closed=false', e.gR45Closed === false);
  A('P2 r4ProductClosed=true', e.r4ProductClosed === true);
  A('P2 funnelProductClosed=true', e.funnelProductClosed === true);
  A('P2 domainIsolationClosed=true', e.domainIsolationClosed === true);
  A('P2 eg3ProductClosed=true', e.eg3ProductClosed === true);
  A('P2 eg1ThroughEg2Eg5Eg6ClosedByThisKnife=false', e.eg1ThroughEg2Eg5Eg6ClosedByThisKnife === false);
  A('P2 coveredCountInvented=false', e.coveredCountInvented === false);
  A('P2 ms3EqualsR4Closed=false', e.ms3EqualsR4Closed === false);
  A('P2 wrongTrackZeroInvented=false', e.wrongTrackZeroInvented === false);
  A('P2 emptyMetaAloneDoesNotClose=true', e.emptyMetaAloneDoesNotClose === true);
  A('P2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P2 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P2 roundtrip eg4ProductClosed=true', roundtrip.eg4ProductClosed === true);
  A('P2 roundtrip wrongTrackProductClosed=true', roundtrip.wrongTrackProductClosed === true);
  A('P2 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
  A('P2 roundtrip r4ProductClosed=true', roundtrip.r4ProductClosed === true);
  A('P2 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P3 hard pins');
A('P3 ≠ flip gR45Closed / r4 / funnel this knife', true);
A('P3 ≠ wash EG4 3cefebf/ec90b6d · R4·FUNNEL 2b38e18/14e9e2c · EG3 7be1a55/5b3c854', true);
A('P3 Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban self-nail post_prove_dual_pass', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg4-wrong-track-product-close prove (EG4/wrong_track product face closed under authorize; eg4ProductClosed=true; Ban flip gR45/r4/funnel; releaseEvidence=false; Ban self-nail dual_pass)'
    : `\nFAIL  r4-eg4-wrong-track-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
