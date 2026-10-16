/**
 * Meetwise HTTP E2E directory contract.
 *
 * Locks helpers vs scenarios vs scripts/run-e2e* on this repo's tree.
 * S2: pins contract-doc lanes (LIVE / prove-shell / conn-only),
 * non-UI primary, LIVE whitelist cite, anti mysql-stack LIVE, R5 honesty,
 * and FUTURE allowed layouts (scripts/isolated/, scripts/conn-stack/).
 * S3: scripts/isolated/ is REQUIRED (run-isolated + targets-* thin shims);
 * legacy scripts/run-e2e-isolated.mjs stays required (impl host + package aliases).
 * S4: scripts/conn-stack/ is REQUIRED (mysql-stack.* bodies; legacy scripts/mysql-stack.* = thin forwarders).
 * Do not mass-move e2e/*.e2e.ts or business *.proof.ts here. LIVE Set must not shrink.
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

/**
 * S3 isolated layout — REQUIRED files (thin shims / whitelist modules).
 * Legacy scripts/run-e2e-isolated.mjs remains in REQUIRED_RUNNERS (impl + aliases).
 * S4 conn-stack — REQUIRED dir + mysql-stack.* proof bodies (conn-only forever).
 */
export const FUTURE_ISOLATED_DIR = 'scripts/isolated';
export const FUTURE_ISOLATED_FILES = Object.freeze([
  'scripts/isolated/run-isolated.mjs',
  'scripts/isolated/targets-live-e2e.mjs',
  'scripts/isolated/targets-domain-prove.mjs',
]);
/** @deprecated alias — S3 promotes these to required via checkIsolatedLayoutRequired */
export const REQUIRED_ISOLATED_FILES = FUTURE_ISOLATED_FILES;
export const FUTURE_CONN_STACK_DIR = 'scripts/conn-stack';
/** S4: conn-stack bodies (legacy scripts/mysql-stack.* remain as thin forwarders). */
export const REQUIRED_CONN_STACK_FILES = Object.freeze([
  'scripts/conn-stack/mysql-stack.skeleton.proof.mjs',
  'scripts/conn-stack/mysql-stack.ping.proof.mjs',
  'scripts/conn-stack/mysql-stack.m2-tenant.skeleton.proof.mjs',
  'scripts/conn-stack/mysql-stack.m3-queue.skeleton.proof.mjs',
  'scripts/conn-stack/mysql-stack.m4-rag.skeleton.proof.mjs',
  'scripts/conn-stack/mysql-stack.m5-fixtures.skeleton.proof.mjs',
  'scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs',
  'scripts/conn-stack/mysql-stack.redis-wakeup.proof.mjs',
]);
/** Legacy forwarders — keep mysql-stack:*:prove aliases working without rewriting every cite. */
export const REQUIRED_CONN_STACK_FORWARDERS = Object.freeze([
  'scripts/mysql-stack.skeleton.proof.mjs',
  'scripts/mysql-stack.ping.proof.mjs',
  'scripts/mysql-stack.m2-tenant.skeleton.proof.mjs',
  'scripts/mysql-stack.m3-queue.skeleton.proof.mjs',
  'scripts/mysql-stack.m4-rag.skeleton.proof.mjs',
  'scripts/mysql-stack.m5-fixtures.skeleton.proof.mjs',
  'scripts/mysql-stack.r5-mark-red.proof.mjs',
  'scripts/mysql-stack.redis-wakeup.proof.mjs',
]);

/** Contract MD must encode S2 lane / honesty pins (fail-closed on doc drift). */
export const REQUIRED_CONTRACT_DOC_PINS = Object.freeze([
  [/非 UI|non-UI|HTTP\/SSE/, 'non_ui_primary'],
  [/次要|secondary|LIVE_OPTIONAL_UI/, 'ui_secondary'],
  [/LIVE|主评测/, 'live_lane'],
  [/prove-shell|prove-via-isolated|借壳/, 'prove_shell_lane'],
  [/conn-only/, 'conn_only_lane'],
  [/e2e-live-targets-whitelist/, 'live_whitelist_cite'],
  [/mysql-stack/, 'mentions_mysql_stack'],
  [/BUG-FAKE-CONN/, 'bug_fake_conn'],
  [/BUG-FAKE-R5|pgvector|E2E_PG_IMAGE/, 'r5_honesty'],
  [/scripts\/isolated/, 'allows_future_isolated'],
  [/scripts\/conn-stack/, 'allows_future_conn_stack'],
  [/releaseEvidence=false/, 'release_evidence_false'],
]);

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

export function checkContractDocLanes(repoRoot, pins = REQUIRED_CONTRACT_DOC_PINS) {
  const root = assertRepoRoot(repoRoot);
  const absolute = underRoot(root, REQUIRED_DOC);
  if (!existsSync(absolute)) return [`e2e_directory_contract_missing:${REQUIRED_DOC}`];
  const source = readFileSync(absolute, 'utf8');
  const errors = [];
  if (!Array.isArray(pins) || pins.length < 8) {
    errors.push('e2e_directory_contract_doc_pins_collapsed');
    return errors;
  }
  for (const [re, label] of pins) {
    if (!re.test(source)) errors.push(`e2e_directory_contract_doc_pin_missing:${label}`);
  }
  // Forbid classifying mysql-stack as LIVE primary membership language in the contract doc.
  if (/\|\s*\*\*LIVE\*\*[\s\S]{0,400}?mysql-stack/.test(source) &&
      /mysql-stack[^\n]*LIVE primary|LIVE primary[^\n]*mysql-stack/.test(source)) {
    errors.push('e2e_directory_contract_doc_mysql_stack_as_live');
  }
  return errors;
}

/**
 * Presence shape check for known layout dirs (isolated + conn-stack).
 * After S3/S4 both dirs are also REQUIRED via checkIsolatedLayoutRequired /
 * checkConnStackLayoutRequired — this helper still rejects file/symlink shapes.
 */
export function checkFutureLayoutOptional(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  for (const relDir of [FUTURE_ISOLATED_DIR, FUTURE_CONN_STACK_DIR]) {
    const absolute = underRoot(root, relDir);
    if (!existsSync(absolute)) continue;
    const stat = lstatSync(absolute);
    if (stat.isSymbolicLink()) {
      errors.push(`e2e_directory_contract_future_dir_symlink:${relDir}`);
    } else if (!stat.isDirectory()) {
      errors.push(`e2e_directory_contract_future_dir_not_directory:${relDir}`);
    }
  }
  return errors;
}

/**
 * S3: require scripts/isolated/* thin shims and keep LIVE list honest vs legacy Set.
 */
export function checkIsolatedLayoutRequired(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  const dirAbs = underRoot(root, FUTURE_ISOLATED_DIR);
  if (!existsSync(dirAbs)) {
    errors.push(`e2e_directory_contract_missing_dir:${FUTURE_ISOLATED_DIR}`);
  } else {
    const stat = lstatSync(dirAbs);
    if (stat.isSymbolicLink()) errors.push(`e2e_directory_contract_future_dir_symlink:${FUTURE_ISOLATED_DIR}`);
    else if (!stat.isDirectory()) errors.push(`e2e_directory_contract_future_dir_not_directory:${FUTURE_ISOLATED_DIR}`);
  }
  errors.push(...checkRequiredPaths(root, [...REQUIRED_ISOLATED_FILES]));

  const legacyAbs = underRoot(root, 'scripts/run-e2e-isolated.mjs');
  const targetsAbs = underRoot(root, 'scripts/isolated/targets-live-e2e.mjs');
  const proveAbs = underRoot(root, 'scripts/isolated/targets-domain-prove.mjs');
  if (existsSync(legacyAbs) && existsSync(targetsAbs)) {
    const legacy = readFileSync(legacyAbs, 'utf8');
    const targets = readFileSync(targetsAbs, 'utf8');
    const liveSet = legacy.match(/LIVE_E2E_TARGETS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
    if (!liveSet) {
      errors.push('e2e_directory_contract_live_set_missing:scripts/run-e2e-isolated.mjs');
    } else {
      for (const target of ['e2e:prove', 'e2e:ui', 'performance:e2e']) {
        if (!liveSet[1].includes(`'${target}'`)) {
          errors.push(`e2e_directory_contract_live_set_member_missing:${target}`);
        }
        if (!targets.includes(`'${target}'`)) {
          errors.push(`e2e_directory_contract_targets_live_member_missing:${target}`);
        }
      }
      // mysql-stack / conn-stack are NEVER LIVE (conn-only forever).
      if (/['"]mysql-stack:/.test(liveSet[1]) || /['"]mysql-stack:/.test(targets)) {
        errors.push('e2e_directory_contract_mysql_stack_must_never_be_live');
      }
      if (/['"]conn-stack:/.test(liveSet[1]) || /['"]conn-stack:/.test(targets)) {
        errors.push('e2e_directory_contract_conn_stack_must_never_be_live');
      }
    }
    // Honesty: do not silently shrink documented primary away from HTTP/SSE.
    if (!/LIVE_E2E_PRIMARY[\s\S]*e2e:prove[\s\S]*performance:e2e/.test(targets)
      && !(targets.includes("'e2e:prove'") && targets.includes("'performance:e2e'") && /LIVE_E2E_PRIMARY/.test(targets))) {
      errors.push('e2e_directory_contract_targets_live_primary_incomplete');
    }
  }

  // S3/S4: mysql-stack:* / conn-stack:* is conn-only forever — NEVER prove-shell, NEVER LIVE.
  // Static pins require BOTH literal prefixes in isConnOnlyTarget source (not only runtime).
  if (existsSync(proveAbs)) {
    const prove = readFileSync(proveAbs, 'utf8');
    if (!/function isConnOnlyTarget/.test(prove)
      || !/startsWith\(\s*['"]mysql-stack:['"]\s*\)/.test(prove)) {
      errors.push('e2e_directory_contract_conn_only_mysql_stack_pin_missing');
    }
    // O1 nit follow-up: fail-closed if someone drops the conn-stack: branch from source.
    if (!/startsWith\(\s*['"]conn-stack:['"]\s*\)/.test(prove)) {
      errors.push('e2e_directory_contract_conn_only_conn_stack_pin_missing');
    }
    const proveFn = prove.match(/export function isProveShellTarget\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
    if (!proveFn || !/!isConnOnlyTarget\s*\(/.test(proveFn[1])) {
      errors.push('e2e_directory_contract_prove_shell_must_exclude_conn_only');
    }
    // Narrative pin: callers must not treat prove-shell green as conn-only covered.
    if (!/NEVER prove-shell/i.test(prove) && !/never be classified as LIVE or prove-shell/i.test(prove)) {
      errors.push('e2e_directory_contract_conn_only_never_prove_shell_doc_missing');
    }
  } else {
    errors.push('e2e_directory_contract_missing:scripts/isolated/targets-domain-prove.mjs');
  }
  return errors;
}


/**
 * S4: require scripts/conn-stack/* mysql-stack bodies + legacy forwarders.
 * mysql-stack / conn-stack remain NEVER LIVE / NEVER prove-shell (see isolated pins).
 */
export function checkConnStackLayoutRequired(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  const dirAbs = underRoot(root, FUTURE_CONN_STACK_DIR);
  if (!existsSync(dirAbs)) {
    errors.push(`e2e_directory_contract_missing_dir:${FUTURE_CONN_STACK_DIR}`);
  } else {
    const stat = lstatSync(dirAbs);
    if (stat.isSymbolicLink()) errors.push(`e2e_directory_contract_future_dir_symlink:${FUTURE_CONN_STACK_DIR}`);
    else if (!stat.isDirectory()) errors.push(`e2e_directory_contract_future_dir_not_directory:${FUTURE_CONN_STACK_DIR}`);
  }
  errors.push(...checkRequiredPaths(root, [...REQUIRED_CONN_STACK_FILES]));
  errors.push(...checkRequiredPaths(root, [...REQUIRED_CONN_STACK_FORWARDERS]));

  // Forwarders must point at conn-stack bodies (thin import / spawn), not re-host full bodies.
  for (const rel of REQUIRED_CONN_STACK_FORWARDERS) {
    const abs = underRoot(root, rel);
    if (!existsSync(abs)) continue;
    const src = readFileSync(abs, 'utf8');
    const base = rel.split('/').pop();
    if (!src.includes(`conn-stack/${base}`) && !src.includes(`conn-stack/${base.replace(/'/g, '')}`)) {
      errors.push(`e2e_directory_contract_conn_stack_forwarder_must_delegate:${rel}`);
    }
    // Guard against accidental full-body left at legacy path (heuristic: no long compose/ADR pins).
    if (src.length > 2500) {
      errors.push(`e2e_directory_contract_conn_stack_forwarder_too_large:${rel}`);
    }
  }

  // package.json mysql-stack:*:prove must still resolve (legacy forwarder path OK).
  const pkgPath = underRoot(root, 'package.json');
  if (existsSync(pkgPath)) {
    let pkg;
    try { pkg = JSON.parse(readFileSync(pkgPath, 'utf8')); } catch { pkg = null; }
    if (pkg?.scripts) {
      for (const name of [
        'mysql-stack:skeleton:prove',
        'mysql-stack:ping:prove',
        'mysql-stack:r5-mark-red:prove',
      ]) {
        const cmd = pkg.scripts[name];
        if (typeof cmd !== 'string' || !/mysql-stack\.(skeleton|ping|r5-mark-red)/.test(cmd)) {
          errors.push(`e2e_directory_contract_mysql_stack_alias_missing:${name}`);
        }
      }
    }
  }

  // Conn-only forever pins still enforced via checkIsolatedLayoutRequired (isConnOnlyTarget).
  return errors;
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
    ...checkContractDocLanes(root),
    ...checkFutureLayoutOptional(root),
    ...checkIsolatedLayoutRequired(root),
    ...checkConnStackLayoutRequired(root),
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
  console.log('e2e directory-contract passed: helpers vs scenarios vs run-e2e* + lanes + isolated + conn-stack; releaseEvidence=false');
}
