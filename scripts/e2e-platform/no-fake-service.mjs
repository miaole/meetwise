/**
 * Runners must fail closed on fake-service flags and isolation bypass.
 * HTTP and UI live runners must also refuse a missing MODEL_API_KEY.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;

const LIVE_RUNNERS = [
  { file: 'scripts/run-e2e.mjs', isolation: 'e2e_isolation_required', requireModelKey: true },
  { file: 'scripts/run-e2e-ui.mjs', isolation: 'e2e_ui_isolation_required', requireModelKey: true },
  { file: 'scripts/run-performance-e2e.mjs', isolation: 'performance_e2e_isolation_required', requireModelKey: false },
];

const FAKE_FLAGS = ['VOICE_FAKE', 'OCR_FAKE', 'E2E_FAKE_MODEL'];

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export function checkNoFakeService(root = ROOT) {
  const errors = [];
  for (const spec of LIVE_RUNNERS) {
    const path = join(root, spec.file);
    if (!existsSync(path)) {
      errors.push(`missing:${spec.file}`);
      continue;
    }
    errors.push(...checkNoFakeServiceFromSource(spec.file, readFileSync(path, 'utf8'), spec.requireModelKey, spec.isolation));
  }
  return errors;
}

export function scanToyRunner(source) {
  return checkNoFakeServiceFromSource('toy', source, true, 'e2e_isolation_required');
}

function checkNoFakeServiceFromSource(file, source, requireModelKey, isolation) {
  const reachable = stripComments(source);
  const errors = [];
  for (const flag of FAKE_FLAGS) {
    if (!reachable.includes(flag)) errors.push(`${file} must reject ${flag} in reachable code (comments do not count)`);
  }
  if (!reachable.includes('fake_service_mode_forbidden')) {
    errors.push(`${file} must throw fake_service_mode_forbidden in reachable code`);
  }
  if (isolation && !reachable.includes(isolation)) {
    errors.push(`${file} must throw ${isolation} in reachable code`);
  }
  if (requireModelKey && !reachable.includes('live_provider_key_missing')) {
    errors.push(`${file} must throw live_provider_key_missing when the provider key is absent`);
  }
  if (requireModelKey && !/MODEL_API_KEY \?\? ['"]{2}\)\.trim\(\)/.test(reachable) && !/String\(env\.MODEL_API_KEY \?\? ['"]{2}\)\.trim\(\)/.test(reachable)) {
    errors.push(`${file} must trim the provider key before accepting it`);
  }
  if (/if\s*\([^)]*MODEL_API_KEY[^)]*\)\s*\{[^}]*process\.exit\(0\)/.test(reachable)) {
    errors.push(`${file} must not skip-as-pass when the provider key is missing`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('no-fake-service.mjs')) {
  const errors = checkNoFakeService();
  if (errors.length) {
    console.error('e2e-platform no-fake-service failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PASS e2e-platform no-fake-service');
}
