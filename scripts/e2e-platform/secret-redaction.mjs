/**
 * Static secret/PII redaction for E2E helpers and runners.
 * Does not execute tests; it fails closed on log-site patterns.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;

const SCAN_FILES = [
  'e2e/full.e2e.ts',
  'e2e/performance.e2e.ts',
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-ui.mjs',
  'scripts/run-e2e-isolated.mjs',
  'scripts/run-performance-e2e.mjs',
];

const SENSITIVE = 'token|Authorization|audioBase64|contentBase64|MODEL_API_KEY|PAY_PROVIDER_SECRET|AUTH_SECRET';
const LOG_LEAK = new RegExp(`console\\.(log|error|warn|info)\\([^\\n]*\\b(${SENSITIVE})\\b`);

const RUNNER_WITHHOLD = [
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-ui.mjs',
  'scripts/run-e2e-isolated.mjs',
];

function listHelpers(root) {
  const dir = join(root, 'e2e/helpers');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.proof.ts'))
    .map((name) => `e2e/helpers/${name}`);
}

export function checkSecretRedaction(root = ROOT) {
  const errors = [];
  const files = [...SCAN_FILES, ...listHelpers(root)];
  for (const rel of files) {
    const path = join(root, rel);
    if (!existsSync(path) || !statSync(path).isFile()) {
      errors.push(`missing:${rel}`);
      continue;
    }
    const source = readFileSync(path, 'utf8');
    const lines = source.split('\n');
    lines.forEach((line, index) => {
      if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) return;
      if (LOG_LEAK.test(line)) errors.push(`${rel}:${index + 1}:log_leaks_secret`);
    });
  }
  for (const rel of RUNNER_WITHHOLD) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    const source = readFileSync(path, 'utf8');
    if (!source.includes('E2E_PROCESS_OUTPUT_WITHHELD') && !source.includes('withheldOutputSummary') && !source.includes('label_bytes=')) {
      errors.push(`${rel}:child_output_must_be_withheld_as_byte_counts`);
    }
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('secret-redaction.mjs')) {
  const errors = checkSecretRedaction();
  if (errors.length) {
    console.error('e2e-platform secret-redaction failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PASS e2e-platform secret-redaction');
}
