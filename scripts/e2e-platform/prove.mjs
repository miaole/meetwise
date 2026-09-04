/**
 * Meetwise E2E platform static guards. Fail closed. Never sets releaseEvidence.
 *
 * `pnpm e2e-platform:prove` is the 5 named guards. Planted-violation proofs of
 * the directory tree live in `pnpm e2e-platform:layout:prove`.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkAssertionFloor } from './assertion-floor.mjs';
import { checkDirectoryContract } from './directory-contract.mjs';
import { checkNoFakeService, scanToyRunner } from './no-fake-service.mjs';
import { checkRunnerDocAlignment, scanDocAlignment } from './runner-doc-alignment.mjs';
import { checkSecretRedaction } from './secret-redaction.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function directoryContractErrors() {
  const found = checkDirectoryContract(ROOT);
  return Array.isArray(found) ? found : (found?.errors ?? []);
}

const checks = [
  ['directory-contract', directoryContractErrors],
  ['no-fake-service', checkNoFakeService],
  ['secret-redaction', checkSecretRedaction],
  ['assertion-floor', checkAssertionFloor],
  ['runner-doc-alignment', checkRunnerDocAlignment],
];

export function runE2EPlatformGuards() {
  const errors = [];
  const toyAlignment = scanDocAlignment('| e2e | Playwright | 用户主链路 |', 'toy.md');
  if (!toyAlignment.length) {
    errors.push('self-check: runner-doc-alignment must reject a Playwright-only e2e row');
  }
  const toyRunner = scanToyRunner('export const env = {};');
  if (!toyRunner.length) {
    errors.push('self-check: no-fake-service must reject a runner that omits fake-service guards');
  }
  const commentOnly = [
    '// VOICE_FAKE OCR_FAKE E2E_FAKE_MODEL',
    "// throw new Error('fake_service_mode_forbidden')",
    "// throw new Error('live_provider_key_missing')",
    "// throw new Error('e2e_isolation_required')",
    'export const env = {};',
  ].join('\n');
  if (!scanToyRunner(commentOnly).length) {
    errors.push('self-check: no-fake-service must reject comment-only fake-service keywords');
  }
  for (const [name, fn] of checks) {
    const found = fn();
    const list = Array.isArray(found) ? found : (found?.errors ?? []);
    for (const error of list) errors.push(`${name}: ${error}`);
  }
  return errors;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const errors = runE2EPlatformGuards();
  if (errors.length) {
    console.error('e2e-platform prove failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PASS e2e-platform prove: 5 guards; releaseEvidence=false; status=draft');
}
