/**
 * Meetwise E2E platform gate: directory contract always, core-boundaries by default.
 * --skip-core-boundaries isolates layout failures. Directory contract cannot be skipped.
 * Fail-closed. releaseEvidence=false. Not live E2E.
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkCoreBoundaries } from './core-boundaries.mjs';
import { checkDirectoryContract } from './directory-contract.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = new Set(process.argv.slice(2));
const skipCoreBoundaries = args.has('--skip-core-boundaries');
const unknown = [...args].filter((flag) => flag !== '--skip-core-boundaries');
if (unknown.length) {
  console.error(`e2e_platform_unknown_flag:${unknown.join(',')}`);
  process.exit(2);
}

const directory = checkDirectoryContract(repoRoot);
const boundaries = skipCoreBoundaries
  ? { errors: [], skipped: true, releaseEvidence: false }
  : checkCoreBoundaries(repoRoot);

const errors = [
  ...directory.errors.map((error) => `directory-contract:${error}`),
  ...boundaries.errors.map((error) => `core-boundaries:${error}`),
];

if (errors.length) {
  console.error('e2e-platform check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(JSON.stringify({
  outcome: skipCoreBoundaries ? 'passed_directory_contract_only' : 'passed_directory_contract_and_core_boundaries',
  releaseEvidence: false,
  coreBoundaries: skipCoreBoundaries ? 'skipped' : 'ran',
  directoryErrors: directory.errors.length,
  boundaryErrors: boundaries.errors.length,
}));
