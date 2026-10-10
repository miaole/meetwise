/**
 * G-R4-5 EG3 — 题域隔离 product-level evidence prove.
 *
 * Emits + verifies honest product-level 题域隔离 evidence inventory
 * (the prior mysql-stack:r4-domain-isolation:prove never emitted this artifact;
 * EG1/EG2 dedicated proves are dual-claim/matrix only · ≠ 题域 product evidence).
 *
 * HARD:
 *   - EXIT=0 = EG3 evidence emitted · ≠ EG3 / 题域 / product closed
 *   - ≠ G-R4-5 / R4/FUNNEL closed · Ban forge · Ban invent coveredCount
 *   - Ban claim 题域已隔离 from meta prove alone · releaseEvidence=false · ≠HA
 *   - Ban idle re-prove of EG1/EG2 CMDs / same 5×meta as fake EG3 close
 *
 * CMD: pnpm r4-eg3-domain-isolation-product:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_EMITTER_WIRED,
  EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_KIND,
  assessDomainIsolationProductEvidence,
  emitDomainIsolationProductEvidence,
  hasDomainIsolationProductEvidence,
} from '../src/r4-eg3-domain-isolation-product-evidence.ts';

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
  '2026-09-23-g-r4-5-eg3-domain-isolation-product-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg3-true-evidence-impl.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('EG3 domain-isolation product evidence prove');
console.log(
  'EXIT=0 = evidence emitted · ≠ EG3/题域/G-R4-5/R4 product closed · Ban forge · Ban claim from meta prove alone · releaseEvidence=false',
);

section('D0 anchors present');
A('D0 emitter wired', EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_EMITTER_WIRED === true);
A('D0 harness present', existsSync(harnessPath));
A('D0 harness pins Ban forge + Ban idle EG1/EG2 + EG3 STILL OPEN', (() => {
  const h = read(harnessPath);
  return /Ban forge/.test(h)
    && /Ban idle re-prove of EG1\/EG2 CMDs/.test(h)
    && /EG3 STILL OPEN/.test(h)
    && /题域 STILL OPEN/.test(h)
    && /Ban claim 题域已隔离 from meta prove alone|Ban claim from `mysql-stack:r4-domain-isolation:prove` alone/.test(h);
})());

section('D1 live assessor (product track-local / scope / honesty pins)');
const assess = assessDomainIsolationProductEvidence();
A('D1 trackLocalRetrieveDispatchWired', assess.trackLocalRetrieveDispatchWired === true);
A('D1 mainInjectsTrackLocal', assess.mainInjectsTrackLocal === true);
A('D1 consumerConsumesTrackLocal', assess.consumerConsumesTrackLocal === true);
A('D1 retrieveScopeFailClosedMissingSnapshot', assess.retrieveScopeFailClosedMissingSnapshot === true);
A('D1 statusPinsDomainIsolationNotClosed', assess.statusPinsDomainIsolationNotClosed === true);
A('D1 metaProveAloneDoesNotClose', assess.metaProveAloneDoesNotClose === true);
A('D1 wrongTrackZeroProductProven=false', assess.wrongTrackZeroProductProven === false);
A('D1 hasDomainIsolationProductEvidence', hasDomainIsolationProductEvidence() === true);

section('D2 emit evidence (Ban forge)');
const result = emitDomainIsolationProductEvidence();
A(
  'D2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('D2 kind', e.kind === EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_KIND);
  A('D2 domainIsolationProductEvidence=true', e.domainIsolationProductEvidence === true);
  A('D2 eg3ProductClosed=false (Ban假关)', e.eg3ProductClosed === false);
  A('D2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('D2 gR45Closed=false', e.gR45Closed === false);
  A('D2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('D2 wrongTrackZeroProductProven=false', e.wrongTrackZeroProductProven === false);
  A('D2 releaseEvidence=false', e.releaseEvidence === false);
  A('D2 metaProveAloneDoesNotClose=true', e.metaProveAloneDoesNotClose === true);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('D2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('D2 receipt roundtrip kind', roundtrip.kind === EG3_DOMAIN_ISOLATION_PRODUCT_EVIDENCE_KIND);
  A('D2 receipt roundtrip eg3ProductClosed=false', roundtrip.eg3ProductClosed === false);
  A('D2 receipt roundtrip domainIsolationClosed=false', roundtrip.domainIsolationClosed === false);
}

section('D3 hard pins');
A('D3 ≠ claim EG3 / 题域 closed from emit alone', true);
A('D3 ≠ idle EG1/EG2 / 5×meta as fake EG3 close', true);
A('D3 Ban forge · Ban invent coveredCount · Ban claim from meta prove alone', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg3-domain-isolation-product-evidence prove (EG3 evidence emitted; ≠ EG3/题域/G-R4-5/R4 closed; releaseEvidence=false)'
    : `\nFAIL  r4-eg3-domain-isolation-product-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
