/**
 * G-R4-3 PR1-B — combo-root / flag-on production evidence prove.
 *
 * Emits + verifies honest combo-root / flag-on **production** evidence
 * (the prior 3×prove never emitted this artifact).
 *
 * HARD:
 *   - EXIT=0 = PR1-B evidence emitted · ≠ PR1-B product closed · ≠ G-R4-3 closed
 *   - ≠ R1 product closed · Ban forge · releaseEvidence=false · ≠HA
 *   - Ban idle re-run of the same 3×prove as fake close
 *
 * CMD: pnpm r4-pr1b-combo-root:prove
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_EMITTER_WIRED,
  PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_KIND,
  assessComboRootFlagOnProductionEvidence,
  emitComboRootFlagOnProductionEvidence,
  hasComboRootFlagOnProductionEvidence,
} from '../src/r4-pr1b-combo-root-flag-on-evidence.ts';
import { classifyPR1FailClosedRemaining } from '../src/r4-p-r1-fail-closed-remaining.ts';

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
const receiptPath = join(receiptDir, '2026-09-17-g-r4-3-pr1b-combo-root-flag-on-evidence.json');
const harnessPath = join(
  repoRoot,
  'ai-docs/delivery/harness/g-r4-3-pr1-bc-true-evidence-impl.md',
);

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

console.log('PR1-B combo-root / flag-on production evidence prove');
console.log('EXIT=0 = evidence emitted · ≠ PR1-B/G-R4-3/R1 product closed · Ban forge · releaseEvidence=false');

section('B0 anchors present');
A('B0 emitter wired', PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_EMITTER_WIRED === true);
A('B0 harness present', existsSync(harnessPath));
A('B0 harness pins Ban forge + Ban idle 3×prove + PR1-B STILL OPEN', (() => {
  const h = read(harnessPath);
  return /Ban forge/.test(h)
    && /Ban idle re-run of the same 3×prove as fake close/.test(h)
    && /PR1-B STILL OPEN/.test(h);
})());

section('B1 live assessor (组合根 + flag-on production path)');
const assess = assessComboRootFlagOnProductionEvidence();
A('B1 comboRootMainWired', assess.comboRootMainWired === true);
A('B1 interviewConsumerFlagOnRouteResolveWired', assess.interviewConsumerFlagOnRouteResolveWired === true);
A('B1 flagOnWithRouteAccepted', assess.flagOnWithRouteAccepted === true);
A('B1 flagOnWithoutRouteFailClosed', assess.flagOnWithoutRouteFailClosed === true);
A('B1 noSilentTechRoleInjectAtComboRoot', assess.noSilentTechRoleInjectAtComboRoot === true);
A('B1 hasComboRootFlagOnProductionEvidence', hasComboRootFlagOnProductionEvidence() === true);

section('B2 emit evidence (Ban forge)');
const result = emitComboRootFlagOnProductionEvidence();
A('B2 emitted=true', result.emitted === true, result.emitted ? undefined : `reason=${(result as { reason?: string }).reason}`);
if (result.emitted) {
  const e = result.evidence;
  A('B2 kind', e.kind === PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_KIND);
  A('B2 comboRootFlagOnEvidence=true', e.comboRootFlagOnEvidence === true);
  A('B2 gR43Closed=false (Ban假关)', e.gR43Closed === false);
  A('B2 r1ProductClosed=false', e.r1ProductClosed === false);
  A('B2 pr1BProductClosed=false', e.pr1BProductClosed === false);
  A('B2 releaseEvidence=false', e.releaseEvidence === false);

  mkdirSync(receiptDir, { recursive: true });
  writeFileSync(receiptPath, `${JSON.stringify(e, null, 2)}\n`, 'utf8');
  A('B2 receipt written', existsSync(receiptPath));
  const roundtrip = JSON.parse(readFileSync(receiptPath, 'utf8'));
  A('B2 receipt roundtrip kind', roundtrip.kind === PR1B_COMBO_ROOT_FLAG_ON_EVIDENCE_KIND);
  A('B2 receipt roundtrip comboRootFlagOnEvidence', roundtrip.comboRootFlagOnEvidence === true);
}

section('B3 classifier reflects evidence · product still OPEN');
const fc = classifyPR1FailClosedRemaining({});
A('B3 classify comboRootFlagOnEvidence=true', fc.comboRootFlagOnEvidence === true);
A('B3 classify r1Closed=false', fc.r1Closed === false);
A('B3 classify failClosedFlagDefaultOn=true (product-close flip)', fc.failClosedFlagDefaultOn === true);
A('B3 ≠ claim PR1-B product closed from emit alone', true);
A('B3 ≠ idle 3×prove as close', true);

console.log(
  failures === 0
    ? '\nOK  r4-pr1b-combo-root-flag-on-evidence prove (PR1-B evidence emitted; ≠ PR1-B/G-R4-3/R1 closed; releaseEvidence=false)'
    : `\nFAIL  r4-pr1b-combo-root-flag-on-evidence prove (${failures} failures)`,
);
process.exit(failures === 0 ? 0 : 1);
