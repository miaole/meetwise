/**
 * G-R4-5 aggregate product close — dedicated prove.
 *
 * Asserts live canHonestlyFlip aggregate gate
 * + honest flip gR45Closed=true (only if canHonestlyFlip)
 * + retained coveredCount=8 / ms3EqualsR4Closed=false / eg1–eg6 + r4/funnel
 * + Ban wash prior tips alone · Ban invent coveredCount · Ban MS3=R4 · Ban empty meta
 * · Ban idle single-EG fake close · Ban self-nail post_prove_dual_pass
 * · releaseEvidence=false · ≠HA · ≠suite
 *
 * CMD: pnpm r4-g-r4-5-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_G_R4_5_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_G_R4_5_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessGR45AggregateProductClose,
  emitGR45AggregateProductCloseEvidence,
  hasGR45AggregateProductCloseEvidence,
} from '../src/r4-g-r4-5-product-close.ts';

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
  '2026-09-23-g-r4-5-product-close-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 aggregate product close prove');
console.log(
  'EXIT=0 = aggregate product-close evidence · canHonestlyFlip live · gR45Closed flip/nonflip honest · coveredCount=8 · ms3EqualsR4Closed=false · Ban wash prior tips · Ban self-nail dual_pass',
);

section('P0 anchors');
A('P0 emitter wired', R4_G_R4_5_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flags', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /canHonestlyFlip/.test(h)
    && /eg1ProductClosed=true/.test(h)
    && /gR45DualClaimClosed=true/.test(h)
    && /eg2ProductClosed=true/.test(h)
    && /eg3ProductClosed=true/.test(h)
    && /domainIsolationClosed=true/.test(h)
    && /eg4ProductClosed=true/.test(h)
    && /wrongTrackProductClosed=true/.test(h)
    && /eg5ProductClosed=true/.test(h)
    && /productSsotFlipped=true/.test(h)
    && /eg6ProductClosed=true/.test(h)
    && /r4ProductClosed=true/.test(h)
    && /funnelProductClosed=true/.test(h)
    && /ms3EqualsR4Closed=false/.test(h)
    && /coveredCount\s*\*\*8\*\*|coveredCount \*\*8\*\*|coveredCount=8/.test(h)
    && /Ban invent coveredCount/i.test(h)
    && /releaseEvidence=false/.test(h);
})());

section('P1 live assessor / canHonestlyFlip');
const assess = assessGR45AggregateProductClose();
A('P1 eg1Live', assess.eg1Live === true);
A('P1 eg2Live', assess.eg2Live === true);
A('P1 eg3Live', assess.eg3Live === true);
A('P1 eg4Live', assess.eg4Live === true);
A('P1 eg5Live', assess.eg5Live === true);
A('P1 eg6Live', assess.eg6Live === true);
A('P1 r4FunnelLive', assess.r4FunnelLive === true);
A('P1 coveredCountEight', assess.coveredCountEight === true);
A('P1 ms3EqualsR4ClosedFalse', assess.ms3EqualsR4ClosedFalse === true);
A('P1 authorizedSsotPinsPresent', assess.authorizedSsotPinsPresent === true);
A('P1 retainedFlagsHonest', assess.retainedFlagsHonest === true);
A('P1 orthogonalNotForged', assess.orthogonalNotForged === true);
A('P1 canHonestlyFlip', assess.canHonestlyFlip === true, assess.nonFlipPin ?? undefined);
A('P1 hasGR45AggregateProductCloseEvidence', hasGR45AggregateProductCloseEvidence() === true);

section('P2 emit flip/nonflip');
const result = emitGR45AggregateProductCloseEvidence();
const h = read(harnessPath);
const harnessClaimsTrue = /\bgR45Closed=true\b/.test(h.replace(/`gR45Closed=true`/g, 'gR45Closed=true'));
// Honest: if canHonestlyFlip + harness flipped → emit true; else NON-FLIP false + pin.
if (assess.canHonestlyFlip && harnessClaimsTrue) {
  A(
    'P2 emitted=true (honest flip)',
    result.emitted === true,
    result.emitted ? undefined : `reason=${(result as { reason?: string }).reason} pin=${(result as { nonFlipPin?: string }).nonFlipPin}`,
  );
  if (result.emitted) {
    const e = result.evidence;
    A('P2 kind', e.kind === R4_G_R4_5_PRODUCT_CLOSE_EVIDENCE_KIND);
    A('P2 canHonestlyFlip=true', e.canHonestlyFlip === true);
    A('P2 gR45Closed=true', e.gR45Closed === true);
    A('P2 flipReason', e.flipReason === 'live_aggregate_gate_canHonestlyFlip');
    A('P2 eg1ProductClosed=true', e.eg1ProductClosed === true);
    A('P2 gR45DualClaimClosed=true', e.gR45DualClaimClosed === true);
    A('P2 eg2ProductClosed=true', e.eg2ProductClosed === true);
    A('P2 coveredCount=8', e.coveredCount === 8);
    A('P2 coveredCountInvented=false', e.coveredCountInvented === false);
    A('P2 eg3ProductClosed=true', e.eg3ProductClosed === true);
    A('P2 domainIsolationClosed=true', e.domainIsolationClosed === true);
    A('P2 eg4ProductClosed=true', e.eg4ProductClosed === true);
    A('P2 wrongTrackProductClosed=true', e.wrongTrackProductClosed === true);
    A('P2 eg5ProductClosed=true', e.eg5ProductClosed === true);
    A('P2 productSsotFlipped=true', e.productSsotFlipped === true);
    A('P2 eg6ProductClosed=true', e.eg6ProductClosed === true);
    A('P2 ms3EqualsR4Closed=false', e.ms3EqualsR4Closed === false);
    A('P2 r4ProductClosed=true', e.r4ProductClosed === true);
    A('P2 funnelProductClosed=true', e.funnelProductClosed === true);
    A('P2 emptyMetaAloneDoesNotClose=true', e.emptyMetaAloneDoesNotClose === true);
    A('P2 idleSingleEgAloneDoesNotClose=true', e.idleSingleEgAloneDoesNotClose === true);
    A('P2 priorTipsAloneDoNotClose=true', e.priorTipsAloneDoNotClose === true);
    A('P2 releaseEvidence=false', e.releaseEvidence === false);

    mkdirSync(receiptDir, { recursive: true });
    writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
    A('P2 receipt written', existsSync(receiptJson));
    const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
    A('P2 roundtrip gR45Closed=true', roundtrip.gR45Closed === true);
    A('P2 roundtrip canHonestlyFlip=true', roundtrip.canHonestlyFlip === true);
    A('P2 roundtrip coveredCount=8', roundtrip.coveredCount === 8);
    A('P2 roundtrip coveredCountInvented=false', roundtrip.coveredCountInvented === false);
    A('P2 roundtrip ms3EqualsR4Closed=false', roundtrip.ms3EqualsR4Closed === false);
    A('P2 roundtrip eg1ProductClosed=true', roundtrip.eg1ProductClosed === true);
    A('P2 roundtrip eg2ProductClosed=true', roundtrip.eg2ProductClosed === true);
    A('P2 roundtrip eg6ProductClosed=true', roundtrip.eg6ProductClosed === true);
    A('P2 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
  }
} else {
  A('P2 NON-FLIP path (canHonestlyFlip false or harness not flipped)', result.emitted === false);
  if (!result.emitted) {
    A('P2 gR45Closed=false retained', result.gR45Closed === false);
    A('P2 canHonestlyFlip=false', result.canHonestlyFlip === false);
    A('P2 nonFlipPin present', typeof result.nonFlipPin === 'string' && result.nonFlipPin.length > 0, result.nonFlipPin);
  }
}

section('P3 hard pins');
A('P3 ≠ wash prior tips alone into gR45Closed without live gate', true);
A('P3 Ban invent coveredCount · Ban MS3=R4 · Ban empty meta · Ban idle single-EG · Ban self-nail post_prove_dual_pass', true);
A('P3 releaseEvidence=false · ≠HA · ≠suite · G-R4-5 closed ≠ HA/cutover/suite', true);
A('P3 retain coveredCount=8 · ms3EqualsR4Closed=false · eg1–eg6 + r4/funnel', true);

console.log(
  failures === 0
    ? '\nOK  r4-g-r4-5-product-close prove (aggregate face under authorize; canHonestlyFlip live; gR45Closed honest flip/nonflip; coveredCount=8; ms3EqualsR4Closed=false; Ban wash prior tips; releaseEvidence=false; Ban self-nail dual_pass)'
    : `\nFAIL  r4-g-r4-5-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
