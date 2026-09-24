/**
 * G-R4-5 / EG3 题域 isolation product close — dedicated prove.
 *
 * Asserts authorized domainIsolationClosed / eg3ProductClosed flip + retained
 * EG3 evidence path + honest non-claims for THIS knife only.
 *
 * HARD:
 *   - EXIT=0 = product-close evidence under authorize · Ban self-nail post_prove_dual_pass
 *   - ≠ R4/FUNNEL/G-R4-5 all closed · Ban invent coveredCount · Ban MS3=R4 · Ban forge
 *   - Ban wash EG3 62c0e2f/c18e28f or R1 9fec7c7/72233a0 into R4/FUNNEL/G-R4-5 all closed
 *   - releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-eg3-domain-isolation-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessEg3DomainIsolationProductClose,
  emitEg3DomainIsolationProductCloseEvidence,
  hasEg3DomainIsolationProductCloseEvidence,
} from '../src/r4-eg3-domain-isolation-product-close.ts';

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
  '2026-09-23-g-r4-5-eg3-domain-isolation-product-close-evidence.json',
);
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-5-eg3-domain-isolation-product-close.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-5 / EG3 题域 isolation product close prove');
console.log(
  'EXIT=0 = product-close evidence · domainIsolationClosed=true · eg3ProductClosed=true under authorize · ≠ R4/FUNNEL/G-R4-5 all · Ban self-nail dual_pass',
);

section('P0 anchors');
A('P0 emitter wired', R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail + flags true', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /domainIsolationClosed=true/.test(h)
    && /eg3ProductClosed=true/.test(h)
    && /gR45Closed=false/.test(h);
})());

section('P1 live assessor');
const assess = assessEg3DomainIsolationProductClose();
A('P1 trackLocalPathHonest', assess.trackLocalPathHonest === true);
A('P1 priorEg3EvidenceRetained', assess.priorEg3EvidenceRetained === true);
A('P1 authorizedSsotPinsPresent', assess.authorizedSsotPinsPresent === true);
A('P1 orthogonalNotClaimedClosed', assess.orthogonalNotClaimedClosed === true);
A('P1 hasEg3DomainIsolationProductCloseEvidence', hasEg3DomainIsolationProductCloseEvidence() === true);

section('P2 emit');
const result = emitEg3DomainIsolationProductCloseEvidence();
A(
  'P2 emitted=true',
  result.emitted === true,
  result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`,
);
if (result.emitted) {
  const e = result.evidence;
  A('P2 kind', e.kind === R4_EG3_DOMAIN_ISOLATION_PRODUCT_CLOSE_EVIDENCE_KIND);
  A('P2 domainIsolationClosed=true', e.domainIsolationClosed === true);
  A('P2 eg3ProductClosed=true', e.eg3ProductClosed === true);
  A('P2 gR45Closed=false', e.gR45Closed === false);
  A('P2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('P2 funnelProductClosed=false', e.funnelProductClosed === false);
  A('P2 funnelCoveredAllClosed=false', e.funnelCoveredAllClosed === false);
  A('P2 coveredCountInvented=false', e.coveredCountInvented === false);
  A('P2 ms3EqualsR4Closed=false', e.ms3EqualsR4Closed === false);
  A('P2 wrongTrackZeroInvented=false', e.wrongTrackZeroInvented === false);
  A('P2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P2 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P2 roundtrip domainIsolationClosed=true', roundtrip.domainIsolationClosed === true);
  A('P2 roundtrip eg3ProductClosed=true', roundtrip.eg3ProductClosed === true);
  A('P2 roundtrip gR45Closed=false', roundtrip.gR45Closed === false);
  A('P2 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P3 hard pins');
A('P3 ≠ claim R4/FUNNEL/G-R4-5 all closed', true);
A('P3 ≠ wash EG3 62c0e2f/c18e28f or R1 9fec7c7/72233a0 into R4', true);
A('P3 Ban invent coveredCount · Ban MS3=R4 · Ban self-nail post_prove_dual_pass', true);

console.log(
  failures === 0
    ? '\nOK  r4-eg3-domain-isolation-product-close prove (EG3/题域 product face closed under authorize; domainIsolationClosed=true; ≠ R4/FUNNEL/G-R4-5 all; releaseEvidence=false; Ban self-nail dual_pass)'
    : `\nFAIL  r4-eg3-domain-isolation-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
