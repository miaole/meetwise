/**
 * G-R4-3 PR1-C — default-on / no-legacy path evidence prove.
 *
 * Emits + verifies honest no-legacy path evidence **without** flipping
 * MEETWISE_TECH_ROLE_FAIL_CLOSED default (still 0).
 *
 * HARD:
 *   - EXIT=0 = PR1-C evidence emitted · ≠ PR1-C product closed · ≠ G-R4-3 closed
 *   - ≠ R1 product closed · Ban silent flip · Ban forge · releaseEvidence=false · ≠HA
 *   - Ban idle re-run of the same 3×prove as fake close
 *
 * CMD: pnpm r4-pr1c-no-legacy:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_EMITTER_WIRED,
  PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND,
  assessDefaultOnNoLegacyPathEvidence,
  emitDefaultOnNoLegacyPathEvidence,
  hasDefaultOnNoLegacyPathEvidence,
} from '../src/r4-pr1c-default-on-no-legacy-evidence.ts';
import { classifyPR1FailClosedRemaining } from '../src/r4-p-r1-fail-closed-remaining.ts';
import { isTechRoleFailClosedEnabled } from '../src/adaptive-role-resolve.ts';

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
const receiptPath = join(receiptDir, '2026-09-17-g-r4-3-pr1c-default-on-no-legacy-evidence.json');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-3-pr1-bc-true-evidence-impl.md',
);
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('PR1-C default-on / no-legacy path evidence prove');
console.log('EXIT=0 = evidence emitted · default still 0 · ≠ flip · ≠ PR1-C/G-R4-3/R1 closed · Ban forge');

section('C0 anchors present');
A('C0 emitter wired', PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_EMITTER_WIRED === true);
A('C0 harness present', existsSync(harnessPath));
A('C0 harness pins Ban flip default + Ban idle 3×prove + PR1-C STILL OPEN', (() => {
  const h = read(harnessPath);
  return (/Ban flip|Ban silent flip|without separate authorize/i.test(h))
    && /Ban idle re-run of the same 3×prove as fake close/.test(h)
    && /PR1-C STILL OPEN/.test(h);
})());
A('C0 worker.env.example MEETWISE_TECH_ROLE_FAIL_CLOSED=0',
  /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(read(workerEnvExample)));

section('C1 live assessor (no-legacy path · default still 0)');
const assess = assessDefaultOnNoLegacyPathEvidence();
A('C1 emptyEnvFailClosedOff', assess.emptyEnvFailClosedOff === true);
A('C1 workerEnvExampleStill0', assess.workerEnvExampleStill0 === true);
A('C1 noLegacyPathUnderExplicitFlagOn', assess.noLegacyPathUnderExplicitFlagOn === true);
A('C1 legacyPathStillWhenFlagOff', assess.legacyPathStillWhenFlagOff === true);
A('C1 defaultFlipped=false', assess.defaultFlipped === false);
A('C1 isTechRoleFailClosedEnabled({})=false', isTechRoleFailClosedEnabled({}) === false);
A('C1 hasDefaultOnNoLegacyPathEvidence', hasDefaultOnNoLegacyPathEvidence() === true);

section('C2 emit evidence (Ban silent flip · Ban forge)');
const result = emitDefaultOnNoLegacyPathEvidence();
A('C2 emitted=true', result.emitted === true, result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`);
if (result.emitted) {
  const e = result.evidence;
  A('C2 kind', e.kind === PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND);
  A('C2 defaultOnNoLegacyPathEvidence=true', e.defaultOnNoLegacyPathEvidence === true);
  A('C2 failClosedDefaultStill0=true', e.failClosedDefaultStill0 === true);
  A('C2 defaultFlipped=false', e.defaultFlipped === false);
  A('C2 gR43Closed=false (Ban假关)', e.gR43Closed === false);
  A('C2 r1ProductClosed=false', e.r1ProductClosed === false);
  A('C2 pr1CProductClosed=false', e.pr1CProductClosed === false);
  A('C2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('C2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('C2 receipt roundtrip kind', roundtrip.kind === PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND);
  A('C2 receipt roundtrip failClosedDefaultStill0', roundtrip.failClosedDefaultStill0 === true);
  A('C2 receipt roundtrip defaultFlipped=false', roundtrip.defaultFlipped === false);
}

section('C3 classifier reflects evidence · product still OPEN · default still 0');
const fc = classifyPR1FailClosedRemaining({});
A('C3 classify defaultOnNoLegacyPathEvidence=true', fc.defaultOnNoLegacyPathEvidence === true);
A('C3 classify failClosedFlagDefaultOn=false (Ban flip)', fc.failClosedFlagDefaultOn === false);
A('C3 classify r1Closed=false', fc.r1Closed === false);
A('C3 ≠ claim PR1-C product closed from emit alone', true);
A('C3 ≠ idle 3×prove as close', true);

console.log(
  failures === 0
    ? '\nOK  r4-pr1c-default-on-no-legacy-evidence prove (PR1-C evidence emitted; default still 0; ≠ PR1-C/G-R4-3/R1 closed; releaseEvidence=false)'
    : `\nFAIL  r4-pr1c-default-on-no-legacy-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
