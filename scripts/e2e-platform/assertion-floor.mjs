/**
 * Never-weaken floors for static assertion / proof-test counts and critical scripts.
 * Runtime interview-loop asserts can be higher; this only counts source sites.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;
const BASELINE_PATH = join(ROOT, 'scripts/e2e-platform/baseline.json');

function countMatches(source, pattern) {
  return [...source.matchAll(new RegExp(pattern, 'gm'))].length;
}

export function checkAssertionFloor(root = ROOT, baselinePath = BASELINE_PATH) {
  const errors = [];
  if (!existsSync(baselinePath)) return ['missing:scripts/e2e-platform/baseline.json'];
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  if (baseline.neverWeaken !== true) errors.push('baseline.neverWeaken must be true');
  if (baseline.schemaVersion !== 1) errors.push('baseline.schemaVersion must be 1');

  for (const [rel, spec] of Object.entries(baseline.floors ?? {})) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      errors.push(`missing:${rel}`);
      continue;
    }
    const actual = countMatches(readFileSync(path, 'utf8'), spec.pattern);
    if (!Number.isInteger(spec.min) || spec.min < 1) {
      errors.push(`${rel}: floor min must be a positive integer`);
      continue;
    }
    if (actual < spec.min) {
      errors.push(`${rel}: assertion/test count ${actual} < floor ${spec.min} (never weaken)`);
    }
  }

  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  for (const name of baseline.requiredPackageScripts ?? []) {
    if (!pkg.scripts?.[name]) errors.push(`package.json missing script:${name}`);
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('assertion-floor.mjs')) {
  const errors = checkAssertionFloor();
  if (errors.length) {
    console.error('e2e-platform assertion-floor failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PASS e2e-platform assertion-floor');
}
