/**
 * Fail-closed directory contract for the HTTP E2E harness.
 * Helpers stay a shared core; scenarios stay in e2e/full.e2e.ts.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;

const REQUIRED_HELPERS = [
  'e2e/helpers/assert.ts',
  'e2e/helpers/auth.ts',
  'e2e/helpers/commerce.ts',
  'e2e/helpers/resume.ts',
  'e2e/helpers/http.ts',
  'e2e/helpers/interview.ts',
  'e2e/helpers/sse.ts',
  'e2e/helpers/voice.ts',
  'e2e/helpers/classify-failure.ts',
];

const REQUIRED_RUNNERS = [
  'e2e/full.e2e.ts',
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-ui.mjs',
  'scripts/run-e2e-isolated.mjs',
  'scripts/run-performance-e2e.mjs',
];

const FORBIDDEN_HELPER_IMPORT = /apps\/(?:web|api)|from\s+['"].*full\.e2e/;

export function checkDirectoryContract(root = ROOT) {
  const errors = [];
  for (const rel of [...REQUIRED_HELPERS, ...REQUIRED_RUNNERS]) {
    if (!existsSync(join(root, rel))) errors.push(`missing:${rel}`);
  }
  for (const rel of REQUIRED_HELPERS) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    const source = readFileSync(path, 'utf8');
    if (FORBIDDEN_HELPER_IMPORT.test(source)) errors.push(`helper_imports_app_or_scenario:${rel}`);
  }
  const runner = existsSync(join(root, 'scripts/run-e2e.mjs'))
    ? readFileSync(join(root, 'scripts/run-e2e.mjs'), 'utf8')
    : '';
  if (runner && !runner.includes('e2e/full.e2e.ts')) {
    errors.push('run-e2e.mjs must launch e2e/full.e2e.ts');
  }
  const scenario = existsSync(join(root, 'e2e/full.e2e.ts'))
    ? readFileSync(join(root, 'e2e/full.e2e.ts'), 'utf8')
    : '';
  if (scenario && !scenario.includes("from './helpers/resume.ts'")) {
    errors.push('e2e/full.e2e.ts must import helpers/resume.ts (no dual-source inline resume HTTP)');
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('directory-contract.mjs')) {
  const errors = checkDirectoryContract();
  if (errors.length) {
    console.error('e2e-platform directory-contract failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PASS e2e-platform directory-contract');
}
