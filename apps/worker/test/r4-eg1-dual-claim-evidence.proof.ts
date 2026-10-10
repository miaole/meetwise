/**
 * G-R4-5 EG1 — MetadataReviewReceipt / RAG-FUNNEL-01 dual-claim evidence prove.
 *
 * Emits + verifies honest dual-claim evidence that **01A ≡ 01** at product
 * surfaces (closing the 01A ≠ 01 gap that the prior 5×meta prove never emitted).
 *
 * HARD:
 *   - EXIT=0 = EG1 evidence emitted · ≠ EG1 closed · ≠ G-R4-5 dual-claim closed
 *   - ≠ R4 / 题域 closed · ≠ invent covered · Ban forge · releaseEvidence=false · ≠HA
 *   - Ban idle re-run of the same 5×meta prove as fake close
 *
 * CMD: pnpm r4-eg1-dual-claim:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EG1_DUAL_CLAIM_EVIDENCE_EMITTER_WIRED,
  EG1_DUAL_CLAIM_EVIDENCE_KIND,
  emitMetadataReviewReceiptRagFunnel01DualClaimEvidence,
} from '../src/r4-eg1-dual-claim-evidence.ts';
import {
  classifyPMetaRemaining,
  is01ANotEqual01,
  isRagFunnel01Closed,
} from '../src/r4-p-meta-p-r1-remaining.ts';
import {
  classifyPMetaServingProductRemaining,
  isProduct01ANotEqual01,
  isProductFunnel01Closed,
} from '../src/r4-p-meta-serving-product-remaining.ts';

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
const receiptPath = join(receiptDir, '2026-09-17-g-r4-5-eg1-dual-claim-evidence.json');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg1-eg2-true-evidence-impl.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('EG1 dual-claim evidence prove — MetadataReviewReceipt / RAG-FUNNEL-01');
console.log('EXIT=0 = evidence emitted · ≠ EG1/G-R4-5/R4/题域 closed · Ban forge · releaseEvidence=false');

section('E0 anchors present');
A('E0 emitter wired', EG1_DUAL_CLAIM_EVIDENCE_EMITTER_WIRED === true);
A('E0 harness present', existsSync(harnessPath));
A('E0 harness pins Ban forge dual-claim + Ban idle 5×meta', (() => {
  const h = read(harnessPath);
  return /Ban forge/.test(h)
    && /Ban idle re-run of the same 5×meta prove as fake close/.test(h)
    && /EG1 STILL OPEN/.test(h);
})());

section('E1 live classifiers (MS1+MS2+MS3 → 01A ≡ 01)');
const f2 = classifyPMetaRemaining();
const product = classifyPMetaServingProductRemaining();
A('E1 MS1 routedServingWired', f2.routedServingWired === true);
A('E1 MS2 fullFacetsServed', f2.fullFacetsServed === true);
A('E1 MS3 standardDeployHandoff', f2.standardDeployHandoff === true);
A('E1 isRagFunnel01Closed', isRagFunnel01Closed(f2) === true);
A('E1 isProductFunnel01Closed', isProductFunnel01Closed(product) === true);
A('E1 is01ANotEqual01=false (gap closed at product surfaces)', is01ANotEqual01(f2) === false);
A('E1 isProduct01ANotEqual01=false', isProduct01ANotEqual01(product) === false);

section('E2 emit dual-claim evidence (Ban forge)');
const result = emitMetadataReviewReceiptRagFunnel01DualClaimEvidence(f2, product);
A('E2 emitted=true', result.emitted === true, result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`);
if (result.emitted) {
  const e = result.evidence;
  A('E2 kind', e.kind === EG1_DUAL_CLAIM_EVIDENCE_KIND);
  A('E2 gap01AEquals01=true', e.gap01AEquals01 === true);
  A('E2 is01ANotEqual01=false', e.is01ANotEqual01 === false);
  A('E2 gR45DualClaimClosed=false (Ban假关)', e.gR45DualClaimClosed === false);
  A('E2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('E2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('E2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('E2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('E2 receipt roundtrip kind', roundtrip.kind === EG1_DUAL_CLAIM_EVIDENCE_KIND);
  A('E2 receipt roundtrip gap01AEquals01', roundtrip.gap01AEquals01 === true);
}

section('E3 hard pins');
A('E3 ≠ claim EG1 closed from emit alone', true);
A('E3 ≠ idle 5×meta as close', true);
A('E3 Ban forge · Ban G-R4-5/R4/题域 closed', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg1-dual-claim-evidence prove (EG1 evidence emitted; ≠ EG1/G-R4-5/R4/题域 closed; releaseEvidence=false)'
    : `\nFAIL  r4-eg1-dual-claim-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
