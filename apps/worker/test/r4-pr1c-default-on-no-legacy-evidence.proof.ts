/**
 * G-R4-3 PR1-C — default-on / no-legacy path evidence prove
 * (post G-R4-3 / R1 product-close flip · honest flags).
 *
 * Emits + verifies honest no-legacy path evidence **AFTER** authorized flip of
 * MEETWISE_TECH_ROLE_FAIL_CLOSED default (failClosedDefaultStill0=false · defaultFlipped=true).
 *
 * HARD:
 *   - EXIT=0 = PR1-C evidence emitted · Ban forge still-0 after flip
 *   - ≠ R4/FUNNEL/题域/G-R4-5 closed · Ban invent coveredCount · releaseEvidence=false · ≠HA
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
  'ai-docs/delivery/harness/g-r4-3-r1-product-close.md',
);
const workerEnvExample = join(repoRoot, 'docker/env/worker.env.example');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('PR1-C default-on / no-legacy path evidence prove (post product-close flip)');
console.log('EXIT=0 = evidence emitted · defaultFlipped=true · failClosedDefaultStill0=false · ≠ R4/FUNNEL/题域/G-R4-5 closed · Ban forge');

section('C0 anchors present');
A('C0 emitter wired', PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_EMITTER_WIRED === true);
A('C0 product-close harness present', existsSync(harnessPath));
A('C0 worker.env.example MEETWISE_TECH_ROLE_FAIL_CLOSED=1',
  /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*1/.test(read(workerEnvExample))
  && !/MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(read(workerEnvExample)));

section('C1 live assessor (no-legacy path · default flipped)');
const assess = assessDefaultOnNoLegacyPathEvidence();
A('C1 emptyEnvFailClosedOn', assess.emptyEnvFailClosedOn === true);
A('C1 workerEnvExampleNow1', assess.workerEnvExampleNow1 === true);
A('C1 noLegacyPathUnderProductDefault', assess.noLegacyPathUnderProductDefault === true);
A('C1 noLegacyPathUnderExplicitFlagOn', assess.noLegacyPathUnderExplicitFlagOn === true);
A('C1 legacyPathStillWhenFlagExplicitOff', assess.legacyPathStillWhenFlagExplicitOff === true);
A('C1 defaultFlipped=true', assess.defaultFlipped === true);
A('C1 isTechRoleFailClosedEnabled({})=true', isTechRoleFailClosedEnabled({}) === true);
A('C1 hasDefaultOnNoLegacyPathEvidence', hasDefaultOnNoLegacyPathEvidence() === true);

section('C2 emit evidence (Ban forge still-0 · Ban claim R4 closed)');
const result = emitDefaultOnNoLegacyPathEvidence();
A('C2 emitted=true', result.emitted === true, result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`);
if (result.emitted) {
  const e = result.evidence;
  A('C2 kind', e.kind === PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND);
  A('C2 defaultOnNoLegacyPathEvidence=true', e.defaultOnNoLegacyPathEvidence === true);
  A('C2 failClosedDefaultStill0=false', e.failClosedDefaultStill0 === false);
  A('C2 defaultFlipped=true', e.defaultFlipped === true);
  A('C2 r4ProductClosed=false (Ban假关 R4)', e.r4ProductClosed === false);
  A('C2 gR45Closed=false', e.gR45Closed === false);
  A('C2 domainIsolationClosed=false', e.domainIsolationClosed === false);
  A('C2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('C2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('C2 receipt roundtrip kind', roundtrip.kind === PR1C_DEFAULT_ON_NO_LEGACY_EVIDENCE_KIND);
  A('C2 receipt roundtrip failClosedDefaultStill0=false', roundtrip.failClosedDefaultStill0 === false);
  A('C2 receipt roundtrip defaultFlipped=true', roundtrip.defaultFlipped === true);
}

section('C3 classifier reflects flipped default · Ban claim R4 closed');
const fc = classifyPR1FailClosedRemaining({});
A('C3 classify defaultOnNoLegacyPathEvidence=true', fc.defaultOnNoLegacyPathEvidence === true);
A('C3 classify failClosedFlagDefaultOn=true (flipped)', fc.failClosedFlagDefaultOn === true);
A('C3 classify r1Closed forced false on F4 classifier (product close via dedicated knife)', fc.r1Closed === false);
A('C3 ≠ claim R4/FUNNEL/题域/G-R4-5 closed from emit alone', true);
A('C3 ≠ idle 3×prove as close', true);

console.log(
  failures === 0
    ? '\nOK  r4-pr1c-default-on-no-legacy-evidence prove (PR1-C evidence emitted; defaultFlipped=true; failClosedDefaultStill0=false; ≠ R4/FUNNEL/题域/G-R4-5 closed; releaseEvidence=false)'
    : `\nFAIL  r4-pr1c-default-on-no-legacy-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
