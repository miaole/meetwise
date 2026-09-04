/**
 * Meetwise HTTP E2E directory contract.
 *
 * Locks helpers vs scenarios vs scripts/run-e2e* on this repo's tree.
 * Does not import another product's domain folders. Not live E2E.
 * releaseEvidence is always false. Any violation exits non-zero.
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RELEASE_EVIDENCE = false;

export const REQUIRED_HELPERS = Object.freeze([
  'e2e/helpers/assert.ts',
  'e2e/helpers/auth.ts',
  'e2e/helpers/commerce.ts',
  'e2e/helpers/resume.ts',
  'e2e/helpers/http.ts',
  'e2e/helpers/interview.ts',
  'e2e/helpers/sse.ts',
  'e2e/helpers/voice.ts',
  'e2e/helpers/classify-failure.ts',
  'e2e/helpers/failure.ts',
  'e2e/helpers/failure-class.mjs',
  'e2e/helpers/e2e-helpers.proof.ts',
]);

export const REQUIRED_SCENARIOS = Object.freeze([
  'e2e/full.e2e.ts',
  'e2e/performance.e2e.ts',
]);

export const REQUIRED_FIXTURES = Object.freeze([
  'e2e/ocr-fixture.ts',
]);

export const REQUIRED_RUNNERS = Object.freeze([
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-isolated.mjs',
  'scripts/run-e2e-ui.mjs',
  'scripts/run-e2e-performance-suite.mjs',
  'scripts/run-performance-e2e.mjs',
]);

export const REQUIRED_DOC = 'ai-docs/testing/conventions/e2e-directory-contract.md';

export const REQUIRED_PLATFORM_FILES = Object.freeze([
  'scripts/e2e-platform/check.mjs',
  'scripts/e2e-platform/core-boundaries.mjs',
  'scripts/e2e-platform/directory-contract.mjs',
  'scripts/e2e-platform/prove.mjs',
  'scripts/e2e-platform/e2e-platform.proof.mjs',
  'scripts/e2e-platform/review-loop.mjs',
  'scripts/e2e-platform/review-record.mjs',
  'scripts/e2e-platform/trust-guard.mjs',
]);

export const REQUIRED_PACKAGE_SCRIPTS = Object.freeze({
  'e2e:prove': 'scripts/run-e2e.mjs',
  'e2e:isolated': 'scripts/run-e2e-isolated.mjs',
  'e2e:ui': 'scripts/run-e2e-ui.mjs',
  'e2e:ui:isolated': 'scripts/run-e2e-isolated.mjs',
  'performance:e2e': 'scripts/run-performance-e2e.mjs',
  'e2e-platform:check': 'scripts/e2e-platform/check.mjs',
  'e2e-platform:prove': 'scripts/e2e-platform/prove.mjs',
  'e2e-platform:layout:prove': 'scripts/e2e-platform/e2e-platform.proof.mjs',
  'e2e-platform:loop': 'scripts/e2e-platform/review-loop.mjs',
});

export const RUNNER_MUST_MENTION = Object.freeze({
  'scripts/run-e2e.mjs': 'e2e/full.e2e.ts',
  'scripts/run-performance-e2e.mjs': 'e2e/performance.e2e.ts',
});

export const ALLOWED_E2E_DIRECTORIES = Object.freeze(['helpers']);
const SCENARIO_FILE = /\.e2e\.ts$/;
const FIXTURE_FILE = /-fixture\.ts$/;
const HELPER_FILE = /(?<!\.e2e)\.(ts|mjs)$/;

function assertRepoRoot(repoRoot) {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    throw new Error('e2e_directory_contract_repo_root_missing');
  }
  const resolved = resolve(repoRoot);
  if (!existsSync(resolved) || !lstatSync(resolved).isDirectory()) {
    throw new Error(`e2e_directory_contract_repo_root_invalid:${repoRoot}`);
  }
  return resolved;
}

function underRoot(repoRoot, relPath) {
  const absolute = resolve(repoRoot, relPath);
  const rel = relative(repoRoot, absolute);
  if (rel.startsWith('..') || rel.includes(`..${sep}`)) {
    throw new Error(`e2e_directory_contract_path_escape:${relPath}`);
  }
  return absolute;
}

export function checkRequiredPaths(repoRoot, paths = [
  ...REQUIRED_HELPERS,
  ...REQUIRED_SCENARIOS,
  ...REQUIRED_FIXTURES,
  ...REQUIRED_RUNNERS,
  ...REQUIRED_PLATFORM_FILES,
  REQUIRED_DOC,
]) {
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  if (!Array.isArray(paths) || paths.length === 0) {
    errors.push('e2e_directory_contract_required_paths_empty');
    return errors;
  }
  for (const relPath of paths) {
    const absolute = underRoot(root, relPath);
    if (!existsSync(absolute)) {
      errors.push(`e2e_directory_contract_missing:${relPath}`);
      continue;
    }
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) errors.push(`e2e_directory_contract_symlink_forbidden:${relPath}`);
    else if (!stat.isFile()) errors.push(`e2e_directory_contract_not_file:${relPath}`);
  }
  return errors;
}

export function inspectE2eLayout(e2eRoot) {
  const errors = [];
  if (typeof e2eRoot !== 'string' || !existsSync(e2eRoot)) {
    return ['e2e_directory_contract_e2e_root_missing'];
  }
  const rootStat = lstatSync(e2eRoot);
  if (rootStat.isSymbolicLink()) return ['e2e_directory_contract_e2e_root_symlink'];
  if (!rootStat.isDirectory()) return ['e2e_directory_contract_e2e_root_not_directory'];

  const canonicalRoot = realpathSync(e2eRoot);
  for (const name of readdirSync(canonicalRoot).sort()) {
    const absolute = join(canonicalRoot, name);
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) {
      errors.push(`e2e_directory_contract_symlink_forbidden:e2e/${name}`);
      continue;
    }
    if (stat.isDirectory()) {
      if (!ALLOWED_E2E_DIRECTORIES.includes(name)) {
        errors.push(`e2e_directory_contract_forbidden_domain_tree:e2e/${name}`);
      }
      continue;
    }
    if (!stat.isFile()) {
      errors.push(`e2e_directory_contract_unexpected_entry:e2e/${name}`);
      continue;
    }
    if (name === 'README.md') continue;
    if (SCENARIO_FILE.test(name) || FIXTURE_FILE.test(name)) continue;
    errors.push(`e2e_directory_contract_unexpected_e2e_file:e2e/${name}`);
  }

  const helpersRoot = join(canonicalRoot, 'helpers');
  if (!existsSync(helpersRoot)) {
    errors.push('e2e_directory_contract_missing:e2e/helpers');
    return errors;
  }
  const helpersStat = lstatSync(helpersRoot);
  if (helpersStat.isSymbolicLink()) {
    errors.push('e2e_directory_contract_symlink_forbidden:e2e/helpers');
    return errors;
  }
  if (!helpersStat.isDirectory()) {
    errors.push('e2e_directory_contract_helpers_not_directory');
    return errors;
  }
  for (const name of readdirSync(helpersRoot).sort()) {
    const absolute = join(helpersRoot, name);
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) {
      errors.push(`e2e_directory_contract_symlink_forbidden:e2e/helpers/${name}`);
      continue;
    }
    if (stat.isDirectory()) {
      errors.push(`e2e_directory_contract_forbidden_helper_subtree:e2e/helpers/${name}`);
      continue;
    }
    if (!stat.isFile() || !HELPER_FILE.test(name) || SCENARIO_FILE.test(name)) {
      errors.push(`e2e_directory_contract_helper_not_shared_module:e2e/helpers/${name}`);
    }
  }
  return errors;
}

export function checkPackageScripts(repoRoot, scripts = REQUIRED_PACKAGE_SCRIPTS) {
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  const pkgPath = underRoot(root, 'package.json');
  if (!existsSync(pkgPath)) {
    errors.push('e2e_directory_contract_missing:package.json');
    return errors;
  }
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    errors.push('e2e_directory_contract_package_json_invalid');
    return errors;
  }
  for (const [name, needle] of Object.entries(scripts)) {
    const command = pkg.scripts?.[name];
    if (typeof command !== 'string' || !command.includes(needle)) {
      errors.push(`e2e_directory_contract_package_script_missing:${name}`);
    }
  }
  return errors;
}

export function checkRunnerMentions(repoRoot, mentions = RUNNER_MUST_MENTION) {
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  for (const [relPath, needle] of Object.entries(mentions)) {
    const absolute = underRoot(root, relPath);
    if (!existsSync(absolute)) {
      errors.push(`e2e_directory_contract_missing:${relPath}`);
      continue;
    }
    const source = readFileSync(absolute, 'utf8');
    if (!source.includes(needle)) {
      errors.push(`e2e_directory_contract_runner_must_spawn_scenario:${relPath}:${needle}`);
    }
  }
  return errors;
}

export function checkScenarioImportsResume(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const absolute = underRoot(root, 'e2e/full.e2e.ts');
  if (!existsSync(absolute)) return ['e2e_directory_contract_missing:e2e/full.e2e.ts'];
  const source = readFileSync(absolute, 'utf8');
  if (!source.includes("from './helpers/resume.ts'")) {
    return ['e2e_directory_contract_scenario_must_import_resume'];
  }
  return [];
}

export function checkDirectoryContract(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  if (REQUIRED_HELPERS.length < 8 || REQUIRED_SCENARIOS.length < 2 || REQUIRED_RUNNERS.length < 5) {
    return {
      errors: ['e2e_directory_contract_allowlist_collapsed'],
      releaseEvidence: RELEASE_EVIDENCE,
    };
  }
  const errors = [
    ...checkRequiredPaths(root),
    ...inspectE2eLayout(underRoot(root, 'e2e')),
    ...checkPackageScripts(root),
    ...checkRunnerMentions(root),
    ...checkRegressionDoesNotNestLoop(root),
    ...checkScenarioImportsResume(root),
  ];
  return { errors, releaseEvidence: RELEASE_EVIDENCE };
}

export function checkRegressionDoesNotNestLoop(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const absolute = underRoot(root, 'scripts/run-post-change-regression.mjs');
  if (!existsSync(absolute)) return ['e2e_directory_contract_missing:scripts/run-post-change-regression.mjs'];
  const source = readFileSync(absolute, 'utf8');
  if (source.includes('e2e-platform:loop')) {
    return ['e2e_directory_contract_loop_nested_in_regression'];
  }
  return [];
}

function isCli(url) {
  const invoked = process.argv[1];
  return Boolean(invoked) && fileURLToPath(url) === resolve(invoked);
}

if (isCli(import.meta.url)) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const { errors } = checkDirectoryContract(repoRoot);
  if (errors.length) {
    console.error('e2e directory-contract failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('e2e directory-contract passed: helpers vs scenarios vs run-e2e*; releaseEvidence=false');
}
