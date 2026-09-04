/**
 * AI output is untrusted by default. Production e2e-platform files and the
 * directory-contract doc must not claim auto-approval or skipped review.
 * Proof files may plant these strings. Fail-closed. releaseEvidence=false.
 */
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RELEASE_EVIDENCE = false;

export const TRUST_SCAN_PATHS = Object.freeze([
  'scripts/e2e-platform/check.mjs',
  'scripts/e2e-platform/core-boundaries.mjs',
  'scripts/e2e-platform/directory-contract.mjs',
  'scripts/e2e-platform/review-loop.mjs',
  'scripts/e2e-platform/review-record.mjs',
  'scripts/e2e-platform/trust-guard.mjs',
  'ai-docs/testing/conventions/e2e-directory-contract.md',
]);

const TRUSTED = 'aiOutputTrusted';
export const FORBIDDEN_TRUST_CLAIMS = Object.freeze([
  `${TRUSTED}: true`,
  `${TRUSTED}:true`,
  `${TRUSTED} = true`,
  'auto-' + 'approved',
  'auto_' + 'approved',
  'trusted ' + 'AI output',
  'AI ' + 'LGTM',
]);

export const REQUIRED_UNTRUSTED_TERMS = Object.freeze([
  'aiOutputTrusted',
  'pending_review',
]);

function assertRepoRoot(repoRoot) {
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    throw new Error('e2e_trust_guard_repo_root_missing');
  }
  const resolved = resolve(repoRoot);
  if (!existsSync(resolved) || !lstatSync(resolved).isDirectory()) {
    throw new Error(`e2e_trust_guard_repo_root_invalid:${repoRoot}`);
  }
  return resolved;
}

function underRoot(repoRoot, relPath) {
  const absolute = resolve(repoRoot, relPath);
  const rel = relative(repoRoot, absolute);
  if (rel.startsWith('..') || rel.includes(`..${sep}`)) {
    throw new Error(`e2e_trust_guard_path_escape:${relPath}`);
  }
  return absolute;
}

export function scanTrustSource(relPath, source) {
  if (typeof source !== 'string') return [`e2e_trust_guard_source_unreadable:${relPath}`];
  if (relPath.endsWith('.proof.mjs') || relPath.endsWith('.proof.ts')) return [];
  const errors = [];
  for (const claim of FORBIDDEN_TRUST_CLAIMS) {
    if (source.includes(claim)) errors.push(`e2e_trust_guard_forbidden_claim:${relPath}:${claim}`);
  }
  return errors;
}

export function checkTrustGuard(repoRoot) {
  if (FORBIDDEN_TRUST_CLAIMS.length < 5 || TRUST_SCAN_PATHS.length < 5) {
    return { errors: ['e2e_trust_guard_allowlist_collapsed'], releaseEvidence: RELEASE_EVIDENCE };
  }
  const root = assertRepoRoot(repoRoot);
  const errors = [];
  let sawUntrustedDefault = false;
  let sawPendingReview = false;
  for (const relPath of TRUST_SCAN_PATHS) {
    const absolute = underRoot(root, relPath);
    if (!existsSync(absolute) || lstatSync(absolute).isSymbolicLink() || !lstatSync(absolute).isFile()) {
      errors.push(`e2e_trust_guard_missing:${relPath}`);
      continue;
    }
    const source = readFileSync(absolute, 'utf8');
    errors.push(...scanTrustSource(relPath, source));
    if (source.includes('aiOutputTrusted: false') || source.includes('aiOutputTrusted = false')) {
      sawUntrustedDefault = true;
    }
    if (source.includes('pending_review')) sawPendingReview = true;
  }
  if (!sawUntrustedDefault) errors.push('e2e_trust_guard_missing_untrusted_default');
  if (!sawPendingReview) errors.push('e2e_trust_guard_missing_pending_review');
  const scanned = TRUST_SCAN_PATHS
    .filter((relPath) => existsSync(underRoot(root, relPath)))
    .map((relPath) => readFileSync(underRoot(root, relPath), 'utf8'))
    .join('\n');
  for (const term of REQUIRED_UNTRUSTED_TERMS) {
    if (!scanned.includes(term)) errors.push(`e2e_trust_guard_missing_term:${term}`);
  }
  return { errors, releaseEvidence: RELEASE_EVIDENCE };
}

function isCli(url) {
  const invoked = process.argv[1];
  return Boolean(invoked) && fileURLToPath(url) === resolve(invoked);
}

if (isCli(import.meta.url)) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const { errors } = checkTrustGuard(repoRoot);
  if (errors.length) {
    console.error('e2e trust-guard failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('e2e trust-guard passed: AI output untrusted by default; review cannot be skipped; releaseEvidence=false');
}
