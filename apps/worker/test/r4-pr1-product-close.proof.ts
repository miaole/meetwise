/**
 * G-R4-3 / R1 product close — dedicated prove.
 *
 * Asserts authorized fail-closed default flip + retained PR1-B/C assessors +
 * honest gR43ProductClosed / r1ProductClosed for THIS knife only.
 *
 * HARD:
 *   - EXIT=0 = product-close evidence under authorize · Ban self-nail post_prove_dual_pass
 *   - ≠ R4/FUNNEL/题域/G-R4-5/EG closed · Ban invent coveredCount · Ban forge
 *   - Ban wash EG6 9b1c83e/3e82f14 or PR1 77c83ce into R4 close
 *   - releaseEvidence=false · ≠HA
 *
 * CMD: pnpm r4-pr1-product-close:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  R4_PR1_PRODUCT_CLOSE_EMITTER_WIRED,
  R4_PR1_PRODUCT_CLOSE_EVIDENCE_KIND,
  assessGR43R1ProductClose,
  emitGR43R1ProductCloseEvidence,
  hasGR43R1ProductCloseEvidence,
} from '../src/r4-pr1-product-close.ts';

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
const receiptJson = join(receiptDir, '2026-09-23-g-r4-3-r1-product-close-evidence.json');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/g-r4-3-r1-product-close.md');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('G-R4-3 / R1 product close prove');
console.log('EXIT=0 = product-close evidence · defaultFlipped=true · gR43/r1 product closed under authorize · ≠ R4/FUNNEL/题域/G-R4-5/EG · Ban self-nail dual_pass');

section('P0 anchors');
A('P0 emitter wired', R4_PR1_PRODUCT_CLOSE_EMITTER_WIRED === true);
A('P0 harness present', existsSync(harnessPath));
A('P0 harness status awaiting_post_prove_dual + Ban self-nail', (() => {
  const h = read(harnessPath);
  return /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /Ban self-nail|Ban自批/.test(h)
    && /defaultFlipped=true/.test(h)
    && /failClosedDefaultStill0=false/.test(h);
})());

section('P1 live assessor');
const assess = assessGR43R1ProductClose();
A('P1 emptyEnvFailClosedOn', assess.emptyEnvFailClosedOn === true);
A('P1 workerEnvExampleNow1', assess.workerEnvExampleNow1 === true);
A('P1 noLegacyUnderProductDefault', assess.noLegacyUnderProductDefault === true);
A('P1 legacyOptOutWhenExplicit0', assess.legacyOptOutWhenExplicit0 === true);
A('P1 comboRootFlagOnEvidenceRetained', assess.comboRootFlagOnEvidenceRetained === true);
A('P1 defaultOnNoLegacyPathEvidenceRetained', assess.defaultOnNoLegacyPathEvidenceRetained === true);
A('P1 authorizedSsotPinsPresent', assess.authorizedSsotPinsPresent === true);
A('P1 defaultFlipped', assess.defaultFlipped === true);
A('P1 orthogonalNotClaimedClosed', assess.orthogonalNotClaimedClosed === true);
A('P1 hasGR43R1ProductCloseEvidence', hasGR43R1ProductCloseEvidence() === true);

section('P2 emit');
const result = emitGR43R1ProductCloseEvidence();
A('P2 emitted=true', result.emitted === true, result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`);
if (result.emitted) {
  const e = result.evidence;
  A('P2 kind', e.kind === R4_PR1_PRODUCT_CLOSE_EVIDENCE_KIND);
  A('P2 failClosedDefaultStill0=false', e.failClosedDefaultStill0 === false);
  A('P2 defaultFlipped=true', e.defaultFlipped === true);
  A('P2 gR43ProductClosed=true', e.gR43ProductClosed === true);
  A('P2 r1ProductClosed=true', e.r1ProductClosed === true);
  A('P2 r4ProductClosed=false', e.r4ProductClosed === false);
  A('P2 funnelProductClosed=false', e.funnelProductClosed === false);
  A('P2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('P2 gR45Closed=false', e.gR45Closed === false);
  A('P2 eg1ThroughEg6Closed=false', e.eg1ThroughEg6Closed === false);
  A('P2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptJson, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('P2 receipt written', existsSync(receiptJson));
  const roundtrip = JSON.parse(readFileSync(receiptJson, 'utf8'));
  A('P2 roundtrip gR43ProductClosed=true', roundtrip.gR43ProductClosed === true);
  A('P2 roundtrip r1ProductClosed=true', roundtrip.r1ProductClosed === true);
  A('P2 roundtrip failClosedDefaultStill0=false', roundtrip.failClosedDefaultStill0 === false);
  A('P2 roundtrip defaultFlipped=true', roundtrip.defaultFlipped === true);
  A('P2 roundtrip r4ProductClosed=false', roundtrip.r4ProductClosed === false);
  A('P2 roundtrip releaseEvidence=false', roundtrip.releaseEvidence === false);
}

section('P3 hard pins');
A('P3 ≠ claim R4/FUNNEL/题域/G-R4-5/EG closed', true);
A('P3 ≠ wash EG6 9b1c83e/3e82f14 or PR1 77c83ce into R4', true);
A('P3 Ban self-nail post_prove_dual_pass', true);

console.log(
  failures === 0
    ? '\nOK  r4-pr1-product-close prove (G-R4-3/R1 product close under authorize; defaultFlipped=true; ≠ R4/FUNNEL/题域/G-R4-5/EG; releaseEvidence=false; Ban self-nail dual_pass)'
    : `\nFAIL  r4-pr1-product-close prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
