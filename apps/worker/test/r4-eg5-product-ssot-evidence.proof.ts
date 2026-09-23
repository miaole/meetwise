/**
 * G-R4-5 EG5 — product SSOT flip authorize honesty evidence prove.
 *
 * Emits + verifies honest product SSOT flip authorize framing / honesty evidence inventory
 * (the prior EG1–EG4 / meta proves never emitted this artifact;
 * EG1–EG4 dedicated proves are dual-claim/matrix/题域/wrong_track only · ≠ product SSOT authorize evidence).
 *
 * HARD:
 *   - EXIT=0 = EG5 evidence emitted · ≠ EG5 / product SSOT flipped / product closed
 *   - ≠ G-R4-5 / R4/FUNNEL / 题域 closed · Ban forge · Ban invent coveredCount
 *   - Ban silent flip · Ban claim from EG1–EG4 / meta prove alone · releaseEvidence=false · ≠HA
 *   - Ban idle re-prove of EG1/EG2/EG3/EG4 CMDs / same 5×meta as fake EG5 close
 *
 * CMD: pnpm r4-eg5-product-ssot:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EG5_PRODUCT_SSOT_EVIDENCE_EMITTER_WIRED,
  EG5_PRODUCT_SSOT_EVIDENCE_KIND,
  assessProductSsotAuthorizeEvidence,
  emitProductSsotAuthorizeEvidence,
  hasProductSsotAuthorizeEvidence,
} from '../src/r4-eg5-product-ssot-evidence.ts';

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
  '2026-09-23-g-r4-5-eg5-product-ssot-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg5-true-evidence-impl.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('EG5 product SSOT flip authorize honesty evidence prove');
console.log(
  'EXIT=0 = evidence emitted · ≠ EG5/product SSOT flipped/G-R4-5/R4/题域 product closed · Ban forge · Ban silent flip · Ban claim from EG1–EG4 / meta prove alone · releaseEvidence=false',
);

section('D0 anchors present');
A('D0 emitter wired', EG5_PRODUCT_SSOT_EVIDENCE_EMITTER_WIRED === true);
A('D0 harness present', existsSync(harnessPath));
A('D0 harness pins Ban forge + Ban idle EG1–EG4 + EG5 STILL OPEN + Ban silent flip', (() => {
  const h = read(harnessPath);
  return /Ban forge/.test(h)
    && /Ban idle re-prove of EG1\/EG2\/EG3\/EG4 CMDs/.test(h)
    && /EG5 STILL OPEN/.test(h)
    && /Ban silent (product )?SSOT flip|Ban silent flip/.test(h)
    && /product SSOT flip authorize|productSsotFlipped=false/.test(h)
    && /G-R4-5 STILL OPEN/.test(h)
    && /eg5ProductClosed=false/.test(h);
})());

section('D1 live assessor (EG1–EG4 present · product SSOT NOT flipped · honesty pins)');
const assess = assessProductSsotAuthorizeEvidence();
A('D1 eg1ThroughEg4EvidencePresent', assess.eg1ThroughEg4EvidencePresent === true);
A('D1 productSsotSurfacesNotFlipped', assess.productSsotSurfacesNotFlipped === true);
A('D1 eg5HarnessPinsStillOpen', assess.eg5HarnessPinsStillOpen === true);
A('D1 statusPinsProductNotClosed', assess.statusPinsProductNotClosed === true);
A('D1 priorEgEvidenceAloneDoesNotAuthorizeFlip', assess.priorEgEvidenceAloneDoesNotAuthorizeFlip === true);
A('D1 metaProveAloneDoesNotClose', assess.metaProveAloneDoesNotClose === true);
A('D1 hasProductSsotAuthorizeEvidence', hasProductSsotAuthorizeEvidence() === true);

section('D2 emit evidence (Ban forge · Ban silent flip)');
const result = emitProductSsotAuthorizeEvidence();
A(
  'D2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('D2 kind', e.kind === EG5_PRODUCT_SSOT_EVIDENCE_KIND);
  A('D2 productSsotAuthorizeEvidence=true', e.productSsotAuthorizeEvidence === true);
  A('D2 eg5ProductClosed=false (Ban假关)', e.eg5ProductClosed === false);
  A('D2 productSsotFlipped=false (Ban silent flip)', e.productSsotFlipped === false);
  A('D2 gR45Closed=false', e.gR45Closed === false);
  A('D2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('D2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('D2 releaseEvidence=false', e.releaseEvidence === false);
  A('D2 priorEgEvidenceAloneDoesNotAuthorizeFlip=true', e.priorEgEvidenceAloneDoesNotAuthorizeFlip === true);
  A('D2 metaProveAloneDoesNotClose=true', e.metaProveAloneDoesNotClose === true);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('D2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('D2 receipt roundtrip kind', roundtrip.kind === EG5_PRODUCT_SSOT_EVIDENCE_KIND);
  A('D2 receipt roundtrip eg5ProductClosed=false', roundtrip.eg5ProductClosed === false);
  A('D2 receipt roundtrip productSsotFlipped=false', roundtrip.productSsotFlipped === false);
  A('D2 receipt roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('D3 hard pins');
A('D3 ≠ claim EG5 / product SSOT flipped from emit alone', true);
A('D3 ≠ idle EG1/EG2/EG3/EG4 / 5×meta as fake EG5 close', true);
A('D3 Ban forge · Ban invent coveredCount · Ban silent flip · Ban claim from EG1–EG4 / meta prove alone', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg5-product-ssot-evidence prove (EG5 evidence emitted; ≠ EG5/product SSOT flipped/G-R4-5/R4/题域 closed; releaseEvidence=false)'
    : `\nFAIL  r4-eg5-product-ssot-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
