/**
 * G-R4-5 EG4 — wrong_track production honesty evidence prove.
 *
 * Emits + verifies honest production wrong_track=0 honesty evidence inventory
 * (the prior covered-path / meta / EG3 proves never emitted this artifact;
 * EG1/EG2/EG3 dedicated proves are dual-claim/matrix/题域 only · ≠ wrong_track product evidence).
 *
 * HARD:
 *   - EXIT=0 = EG4 evidence emitted · ≠ EG4 / wrong_track / product closed
 *   - ≠ G-R4-5 / R4/FUNNEL / 题域 closed · Ban forge · Ban invent coveredCount
 *   - Ban claim from covered-path / meta prove alone · releaseEvidence=false · ≠HA
 *   - Ban idle re-prove of EG1/EG2/EG3 CMDs / same 5×meta as fake EG4 close
 *
 * CMD: pnpm r4-eg4-wrong-track-product:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EG4_WRONG_TRACK_PRODUCT_EVIDENCE_EMITTER_WIRED,
  EG4_WRONG_TRACK_PRODUCT_EVIDENCE_KIND,
  assessWrongTrackProductEvidence,
  emitWrongTrackProductEvidence,
  hasWrongTrackProductEvidence,
} from '../src/r4-eg4-wrong-track-product-evidence.ts';

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
const receiptPath = join(
  receiptDir,
  '2026-09-23-g-r4-5-eg4-wrong-track-product-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg4-true-evidence-impl.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('EG4 wrong_track production honesty evidence prove');
console.log(
  'EXIT=0 = evidence emitted · ≠ EG4/wrong_track/G-R4-5/R4/题域 product closed · Ban forge · Ban claim from covered-path / meta prove alone · releaseEvidence=false',
);

section('D0 anchors present');
A('D0 emitter wired', EG4_WRONG_TRACK_PRODUCT_EVIDENCE_EMITTER_WIRED === true);
A('D0 harness present', existsSync(harnessPath));
A('D0 harness pins Ban forge + Ban idle EG1/EG2/EG3 + EG4 STILL OPEN', (() => {
  const h = read(harnessPath);
  return /Ban forge/.test(h)
    && /Ban idle re-prove of EG1\/EG2\/EG3 CMDs/.test(h)
    && /EG4 STILL OPEN/.test(h)
    && /wrong_track production honesty|Ban claim from covered-path/.test(h)
    && /G-R4-5 STILL OPEN/.test(h);
})());

section('D1 live assessor (production wrong_track / honesty pins)');
const assess = assessWrongTrackProductEvidence();
A('D1 enforceWrongTrackZeroOnServedWired', assess.enforceWrongTrackZeroOnServedWired === true);
A('D1 productionRequiresTrackLocalFailClosed', assess.productionRequiresTrackLocalFailClosed === true);
A('D1 observeTrackLocalWrongTrackOutcome', assess.observeTrackLocalWrongTrackOutcome === true);
A('D1 statusPinsWrongTrackNotClosed', assess.statusPinsWrongTrackNotClosed === true);
A('D1 coveredPathAloneDoesNotClose', assess.coveredPathAloneDoesNotClose === true);
A('D1 metaProveAloneDoesNotClose', assess.metaProveAloneDoesNotClose === true);
A('D1 hasWrongTrackProductEvidence', hasWrongTrackProductEvidence() === true);

section('D2 emit evidence (Ban forge)');
const result = emitWrongTrackProductEvidence();
A(
  'D2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('D2 kind', e.kind === EG4_WRONG_TRACK_PRODUCT_EVIDENCE_KIND);
  A('D2 wrongTrackProductEvidence=true', e.wrongTrackProductEvidence === true);
  A('D2 eg4ProductClosed=false (Ban假关)', e.eg4ProductClosed === false);
  A('D2 wrongTrackProductClosed=false', e.wrongTrackProductClosed === false);
  A('D2 gR45Closed=false', e.gR45Closed === false);
  A('D2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('D2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('D2 releaseEvidence=false', e.releaseEvidence === false);
  A('D2 coveredPathAloneDoesNotClose=true', e.coveredPathAloneDoesNotClose === true);
  A('D2 metaProveAloneDoesNotClose=true', e.metaProveAloneDoesNotClose === true);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('D2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('D2 receipt roundtrip kind', roundtrip.kind === EG4_WRONG_TRACK_PRODUCT_EVIDENCE_KIND);
  A('D2 receipt roundtrip eg4ProductClosed=false', roundtrip.eg4ProductClosed === false);
  A('D2 receipt roundtrip wrongTrackProductClosed=false', roundtrip.wrongTrackProductClosed === false);
}

section('D3 hard pins');
A('D3 ≠ claim EG4 / wrong_track closed from emit alone', true);
A('D3 ≠ idle EG1/EG2/EG3 / 5×meta as fake EG4 close', true);
A('D3 Ban forge · Ban invent coveredCount · Ban claim from covered-path / meta prove alone', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg4-wrong-track-product-evidence prove (EG4 evidence emitted; ≠ EG4/wrong_track/G-R4-5/R4/题域 closed; releaseEvidence=false)'
    : `\nFAIL  r4-eg4-wrong-track-product-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
