/**
 * Optional core-boundary scan for the Meetwise E2E harness.
 *
 * Shared helpers and run-e2e* runners must not embed one-off business
 * narrative that belongs in e2e/*.e2e.ts. Fail-closed. Not live E2E.
 */
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RELEASE_EVIDENCE = false;

/**
 * Tokens taken from the current HTTP scenario story. They must stay in
 * e2e/*.e2e.ts. Do not shorten these to words that helpers/proofs already use
 * as protocol fixtures (for example a single 令牌桶 hash input).
 */
export const ONE_OFF_NARRATIVE_TOKENS = Object.freeze([
  '后端工程师 3 年。负责高并发订单系统',
  '我会用 Redis SETNX 加随机值做分布式锁',
  '请用中文回答，如何设计 Redis 令牌桶限流',
]);

const SCENARIO_IMPORT = /from\s+['"][^'"]*\.e2e(?:\.ts)?['"]/;
const MAIN_ENTRY = /\b(?:async\s+)?function\s+main\s*\(/;

function assertRepoRoot(repoRoot) {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    throw new Error('e2e_core_boundaries_repo_root_missing');
  }
  const resolved = resolve(repoRoot);
  if (!existsSync(resolved) || !lstatSync(resolved).isDirectory()) {
    throw new Error(`e2e_core_boundaries_repo_root_invalid:${repoRoot}`);
  }
  return resolved;
}

function underRoot(repoRoot, relPath) {
  const absolute = resolve(repoRoot, relPath);
  const rel = relative(repoRoot, absolute);
  if (rel.startsWith('..') || rel.includes(`..${sep}`)) {
    throw new Error(`e2e_core_boundaries_path_escape:${relPath}`);
  }
  return absolute;
}

export function scanHelperSource(relPath, source) {
  if (typeof source !== 'string') return [`e2e_core_boundaries_source_unreadable:${relPath}`];
  if (relPath.endsWith('.proof.ts')) return [];
  const errors = [];
  if (SCENARIO_IMPORT.test(source)) errors.push(`e2e_core_boundaries_helper_imports_scenario:${relPath}`);
  if (MAIN_ENTRY.test(source)) errors.push(`e2e_core_boundaries_helper_has_scenario_main:${relPath}`);
  for (const token of ONE_OFF_NARRATIVE_TOKENS) {
    if (source.includes(token)) errors.push(`e2e_core_boundaries_helper_one_off_narrative:${relPath}`);
  }
  return errors;
}

export function scanRunnerSource(relPath, source) {
  if (typeof source !== 'string') return [`e2e_core_boundaries_source_unreadable:${relPath}`];
  const errors = [];
  for (const token of ONE_OFF_NARRATIVE_TOKENS) {
    if (source.includes(token)) errors.push(`e2e_core_boundaries_runner_one_off_narrative:${relPath}`);
  }
  return errors;
}

export function listHelperSources(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const helpersRoot = underRoot(root, 'e2e/helpers');
  if (!existsSync(helpersRoot) || !lstatSync(helpersRoot).isDirectory()) {
    return { errors: ['e2e_core_boundaries_missing:e2e/helpers'], files: [] };
  }
  const files = readdirSync(helpersRoot)
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.e2e.ts'))
    .sort()
    .map((name) => `e2e/helpers/${name}`);
  if (files.length === 0) return { errors: ['e2e_core_boundaries_helpers_empty'], files: [] };
  return { errors: [], files };
}

export function listRunnerSources(repoRoot) {
  const root = assertRepoRoot(repoRoot);
  const scriptsRoot = underRoot(root, 'scripts');
  if (!existsSync(scriptsRoot) || !lstatSync(scriptsRoot).isDirectory()) {
    return { errors: ['e2e_core_boundaries_missing:scripts'], files: [] };
  }
  const files = readdirSync(scriptsRoot)
    .filter((name) => name.startsWith('run-e2e') && name.endsWith('.mjs'))
    .sort()
    .map((name) => `scripts/${name}`);
  files.push('scripts/run-performance-e2e.mjs');
  if (files.length < 2) return { errors: ['e2e_core_boundaries_runners_empty'], files };
  return { errors: [], files };
}

export function checkCoreBoundaries(repoRoot) {
  if (ONE_OFF_NARRATIVE_TOKENS.length < 3) {
    return { errors: ['e2e_core_boundaries_token_list_collapsed'], releaseEvidence: RELEASE_EVIDENCE };
  }
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  const helpers = listHelperSources(root);
  errors.push(...helpers.errors);
  for (const relPath of helpers.files) {
    const absolute = underRoot(root, relPath);
    if (!existsSync(absolute) || lstatSync(absolute).isSymbolicLink()) {
      errors.push(`e2e_core_boundaries_helper_unreadable:${relPath}`);
      continue;
    }
    errors.push(...scanHelperSource(relPath, readFileSync(absolute, 'utf8')));
  }
  const runners = listRunnerSources(root);
  errors.push(...runners.errors);
  for (const relPath of runners.files) {
    const absolute = underRoot(root, relPath);
    if (!existsSync(absolute)) {
      errors.push(`e2e_core_boundaries_missing:${relPath}`);
      continue;
    }
    if (lstatSync(absolute).isSymbolicLink()) {
      errors.push(`e2e_core_boundaries_symlink_forbidden:${relPath}`);
      continue;
    }
    errors.push(...scanRunnerSource(relPath, readFileSync(absolute, 'utf8')));
  }
  return { errors, releaseEvidence: RELEASE_EVIDENCE };
}

function isCli(url) {
  const invoked = process.argv[1];
  return Boolean(invoked) && fileURLToPath(url) === resolve(invoked);
}

if (isCli(import.meta.url)) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const { errors } = checkCoreBoundaries(repoRoot);
  if (errors.length) {
    console.error('e2e core-boundaries failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('e2e core-boundaries passed: helpers/runners have no one-off scenario narrative; releaseEvidence=false');
}
