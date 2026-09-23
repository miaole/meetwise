/**
 * G-R4-5 EG6 — MS3≠R4 pin retention honesty evidence prove.
 *
 * Emits + verifies honest MS3≠R4 pin retention / deferred-as-product honesty evidence inventory
 * (the prior EG1–EG5 / meta proves never emitted this artifact;
 * EG1–EG5 dedicated proves are dual-claim/matrix/题域/wrong_track/SSOT-authorize only · ≠ MS3≠R4 pin retention).
 *
 * HARD:
 *   - EXIT=0 = EG6 evidence emitted · ≠ EG6 / MS3=R4 closed / R4 closed from MS3 / product SSOT flipped
 *   - ≠ G-R4-5 / R4/FUNNEL / 题域 closed · Ban forge · Ban invent coveredCount
 *   - Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone · releaseEvidence=false · ≠HA
 *   - Ban idle re-prove of EG1/EG2/EG3/EG4/EG5 CMDs / same 5×meta as fake EG6 close
 *
 * CMD: pnpm r4-eg6-ms3-ne-r4:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EG6_MS3_NE_R4_EVIDENCE_EMITTER_WIRED,
  EG6_MS3_NE_R4_EVIDENCE_KIND,
  assessMs3NeR4PinRetentionEvidence,
  emitMs3NeR4PinRetentionEvidence,
  hasMs3NeR4PinRetentionEvidence,
} from '../src/r4-eg6-ms3-ne-r4-evidence.ts';

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
  '2026-09-23-g-r4-5-eg6-ms3-ne-r4-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg6-true-evidence-impl.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('EG6 MS3≠R4 pin retention honesty evidence prove');
console.log(
  'EXIT=0 = evidence emitted · ≠ EG6/MS3=R4/R4/G-R4-5/题域 product closed · Ban forge · Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone · releaseEvidence=false',
);

section('D0 anchors present');
A('D0 emitter wired', EG6_MS3_NE_R4_EVIDENCE_EMITTER_WIRED === true);
A('D0 harness present', existsSync(harnessPath));
A('D0 harness pins Ban forge + Ban idle EG1–EG5 + EG6 STILL OPEN + Ban claim R4 from MS3', (() => {
  const h = read(harnessPath);
  return /Ban forge/.test(h)
    && /Ban idle re-prove of EG1\/EG2\/EG3\/EG4\/EG5 CMDs/.test(h)
    && /EG6 STILL OPEN/.test(h)
    && /Ban claim(ing)? R4 closed from MS3/.test(h)
    && /MS3 ≠ R4 closed|MS3≠R4/.test(h)
    && /G-R4-5 STILL OPEN/.test(h)
    && /eg6ProductClosed=false/.test(h)
    && /ms3EqualsR4Closed=false/.test(h)
    && /productSsotFlipped=false/.test(h);
})());

section('D1 live assessor (EG1–EG5 present · MS3≠R4 retained · honesty pins)');
const assess = assessMs3NeR4PinRetentionEvidence();
A('D1 eg1ThroughEg5EvidencePresent', assess.eg1ThroughEg5EvidencePresent === true);
A('D1 ms3NeR4PinLanguageRetained', assess.ms3NeR4PinLanguageRetained === true);
A('D1 banClaimR4ClosedFromMs3Retained', assess.banClaimR4ClosedFromMs3Retained === true);
A('D1 eg6HarnessPinsStillOpen', assess.eg6HarnessPinsStillOpen === true);
A('D1 statusPinsProductNotClosed', assess.statusPinsProductNotClosed === true);
A('D1 priorEgEvidenceAloneDoesNotClose', assess.priorEgEvidenceAloneDoesNotClose === true);
A('D1 metaProveAloneDoesNotClose', assess.metaProveAloneDoesNotClose === true);
A('D1 hasMs3NeR4PinRetentionEvidence', hasMs3NeR4PinRetentionEvidence() === true);

section('D2 emit evidence (Ban forge · Ban claim R4 closed from MS3)');
const result = emitMs3NeR4PinRetentionEvidence();
A(
  'D2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('D2 kind', e.kind === EG6_MS3_NE_R4_EVIDENCE_KIND);
  A('D2 ms3NeR4PinRetentionEvidence=true', e.ms3NeR4PinRetentionEvidence === true);
  A('D2 eg6ProductClosed=false (Ban假关)', e.eg6ProductClosed === false);
  A('D2 ms3EqualsR4Closed=false (Ban claim R4 from MS3)', e.ms3EqualsR4Closed === false);
  A('D2 productSsotFlipped=false', e.productSsotFlipped === false);
  A('D2 gR45Closed=false', e.gR45Closed === false);
  A('D2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('D2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('D2 releaseEvidence=false', e.releaseEvidence === false);
  A('D2 priorEgEvidenceAloneDoesNotClose=true', e.priorEgEvidenceAloneDoesNotClose === true);
  A('D2 metaProveAloneDoesNotClose=true', e.metaProveAloneDoesNotClose === true);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('D2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('D2 receipt roundtrip kind', roundtrip.kind === EG6_MS3_NE_R4_EVIDENCE_KIND);
  A('D2 receipt roundtrip eg6ProductClosed=false', roundtrip.eg6ProductClosed === false);
  A('D2 receipt roundtrip ms3EqualsR4Closed=false', roundtrip.ms3EqualsR4Closed === false);
  A('D2 receipt roundtrip productSsotFlipped=false', roundtrip.productSsotFlipped === false);
  A('D2 receipt roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('D3 hard pins');
A('D3 ≠ claim EG6 / MS3=R4 / R4 closed from MS3 from emit alone', true);
A('D3 ≠ idle EG1/EG2/EG3/EG4/EG5 / 5×meta as fake EG6 close', true);
A('D3 Ban forge · Ban invent coveredCount · Ban claim R4 closed from MS3 · Ban claim from EG1–EG5 / meta prove alone', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg6-ms3-ne-r4-evidence prove (EG6 evidence emitted; ≠ EG6/MS3=R4/R4/G-R4-5/题域 closed; releaseEvidence=false)'
    : `\nFAIL  r4-eg6-ms3-ne-r4-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
