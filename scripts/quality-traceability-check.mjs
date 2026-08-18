/**
 * Static traceability-manifest validator.
 *
 * Deliberately does NOT execute tests, accept attestations, upload evidence,
 * or decide releases.  Those need the separately specified trusted receiver.
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const COVERAGE_KINDS = Object.freeze([
  'normal', 'exception', 'special', 'escape', 'concurrency', 'complex', 'tricky',
]);
export const ENVIRONMENT_CLASSES = Object.freeze([
  'local-deterministic', 'browser', 'real-model', 'cloud', 'manual',
]);
export const RISK_LEVELS = Object.freeze(['P0', 'P1', 'P2']);
export const FLOW_REFS = Object.freeze(['main', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6']);

const SOURCE_EXTENSIONS = new Set(['.mjs', '.cjs', '.js', '.ts', '.tsx', '.mts', '.cts']);
const TC_PATTERN = /\bTC-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\b/g;
const UC_PATTERN = /\bUC-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+\b/g;
const ACCEPTANCE_PATTERN = /<!--\s*acceptance:\s*([A-Za-z0-9.-]+)\s*-->/g;
// Group identifiers describe a test family; only their explicit main/E* cases
// are executable leaves.  Keeping this distinction here prevents a chapter
// heading from silently inflating the planned/unmapped leaf baseline.
const CLOUD_GROUP_PATTERN = /^(?:TC-CLOUD-0[1-4]|TC-CLOUD-TEST(?:-00[1-3])?)$/;
const SHA256_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;
const MAX_DOC_FILES = 512;
const MAX_DOC_BYTES = 1_048_576;
const MAX_DOC_DEPTH = 32;
const ALLOWED_SOURCE_PREFIXES = ['apps/', 'e2e/', 'packages/', 'scripts/', 'tests/'];
const ALLOWED_THRESHOLD_PREFIXES = ['ai-docs/testing/'];
const TOP_LEVEL_KEYS = new Set(['schemaVersion', 'cases', 'bindings', 'profiles', 'requiredLeafTcIds']);
const PROFILE_KEYS = new Set([
  'profileId', 'attestationConstraints', 'minimumSamples', 'minimumConsecutiveRuns', 'maxEvidenceAgeHours', 'thresholdPath', 'thresholdDigest',
]);
const ATTESTATION_CONSTRAINT_KEYS = new Set(['runnerClass', 'environmentClass']);
const CASE_KEYS = new Set([
  'tcId', 'ucIds', 'flowRef', 'lifecycle', 'coverageKinds', 'acceptanceRefs', 'invariants', 'risk', 'requiredProfiles',
]);
const BINDING_KEYS = new Set([
  'bindingId', 'tcId', 'role', 'runnerId', 'selector', 'sourceFiles', 'coveredSourceGlobs', 'fixtureDigests', 'requiredEnvironmentClass', 'assertionIds',
]);
const STATIC_RUNNERS = new Map([
  ['node-traceability-proof', {
    sources: new Set([
      'scripts/quality-traceability-check.mjs',
      'scripts/quality-traceability.proof.mjs',
    ]),
    assertions: new Map([
      ['TC-quality-01-main', 'validate-manifest'],
      ['TC-quality-01-E1', 'reject-duplicate'],
      ['TC-quality-01-E2', 'reject-primary-conflict'],
      ['TC-quality-01-E3', 'reject-untrusted-binding'],
      ['TC-quality-01-E4', 'reject-invalid-assertions'],
      ['TC-quality-01-E5', 'reject-profile-mismatch'],
      ['TC-quality-01-E6', 'reject-path-escape'],
      ['TC-quality-02-main', 'inventory-is-honest'],
      ['TC-quality-02-E1', 'deduplicate-inventory'],
      ['TC-quality-02-E2', 'reject-multiple-primary'],
      ['TC-quality-02-E3', 'reject-orphan-case'],
      ['TC-quality-02-E4', 'inventory-orphan-report'],
      ['TC-quality-02-E5', 'reject-profile-downgrade'],
      ['TC-quality-02-E6', 'reject-unmapped-release'],
    ]),
  }],
  ['node-governance-proof', {
    sources: new Set([
      'scripts/quality-governance-base-guard.mjs',
      'scripts/quality-governance-base-guard.proof.mjs',
      'scripts/quality-governance-check.mjs',
      'scripts/quality-governance.proof.mjs',
    ]),
    assertions: new Map([
      ['TC-quality-03-main', 'validate-governance-index'],
      ['TC-quality-03-E1', 'reject-record-duplicate'],
      ['TC-quality-03-E2', 'reject-successor-conflict'],
      ['TC-quality-03-E3', 'reject-path-escape'],
      ['TC-quality-03-E4', 'reject-incomplete-governance'],
      ['TC-quality-03-E5', 'reject-release-evidence-claim'],
      ['TC-quality-03-E6', 'reject-scope-drift'],
    ]),
  }],
  ['node-public-text-policy-proof', {
    sources: new Set([
      'scripts/ai-docs/public-text-policy.mjs',
      'scripts/ai-docs/public-text-policy.proof.mjs',
    ]),
    assertions: new Map([
      ['TC-quality-04-main', 'reject-external-project-attribution'],
      ['TC-quality-04-E1', 'deterministic-repeat-scan'],
      ['TC-quality-04-E2', 'isolated-concurrent-scan'],
      ['TC-quality-04-E3', 'reject-path-escape'],
      ['TC-quality-04-E4', 'fail-closed-read-errors'],
      ['TC-quality-04-E5', 'reject-unknown-attribution'],
      ['TC-quality-04-E6', 'allow-legitimate-terms'],
    ]),
  }],
]);
const STATIC_INVARIANTS = new Set(['allowlist', 'cas', 'event-log', 'idempotency']);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function docFiles(directory, repoRoot) {
  const files = [];
  const errors = [];
  const visitedDirectories = new Set();
  let rootStat;
  try { rootStat = lstatSync(directory); }
  catch (error) {
    return {
      files,
      errors: [error?.code === 'ENOENT'
        ? `documentation_root_missing:${directory}`
        : `documentation_unreadable:${directory}`],
    };
  }
  if (rootStat.isSymbolicLink()) return { files, errors: [`documentation_symlink_forbidden:${directory}`] };
  let root;
  let realRepoRoot;
  try {
    root = realpathSync(directory);
    realRepoRoot = realpathSync(repoRoot);
  } catch { return { files, errors: [`documentation_unreadable:${directory}`] }; }
  const rootRel = relative(realRepoRoot, root);
  if (rootRel.startsWith(`..${sep}`) || rootRel === '..' || isAbsolute(rootRel)) {
    return { files, errors: [`documentation_path_escape:${directory}`] };
  }
  const visit = (path, depth) => {
    if (depth > MAX_DOC_DEPTH) {
      errors.push(`documentation_depth_exceeded:${path}`);
      return;
    }
    let stat;
    try { stat = lstatSync(path); }
    catch { errors.push(`documentation_unreadable:${path}`); return; }
    if (stat.isSymbolicLink()) {
      errors.push(`documentation_symlink_forbidden:${path}`);
      return;
    }
    let canonical;
    try { canonical = realpathSync(path); }
    catch { errors.push(`documentation_unreadable:${path}`); return; }
    const rel = relative(root, canonical);
    if (rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) {
      errors.push(`documentation_path_escape:${path}`);
      return;
    }
    if (stat.isDirectory()) {
      if (visitedDirectories.has(canonical)) return;
      visitedDirectories.add(canonical);
      let entries;
      try { entries = readdirSync(canonical); }
      catch { errors.push(`documentation_unreadable:${path}`); return; }
      for (const entry of entries) {
        if (files.length >= MAX_DOC_FILES) {
          errors.push(`documentation_file_limit_exceeded:${directory}`);
          return;
        }
        visit(resolve(canonical, entry), depth + 1);
      }
      return;
    }
    if (!stat.isFile() || !canonical.endsWith('.md')) return;
    if (stat.size > MAX_DOC_BYTES) {
      errors.push(`documentation_file_too_large:${path}`);
      return;
    }
    files.push(canonical);
  };
  visit(root, 0);
  return { files, errors: sortedUnique(errors) };
}

function extractIds(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => match[0]);
}

function extractAcceptanceRefs(text) {
  return [...text.matchAll(ACCEPTANCE_PATTERN)].map((match) => match[1]);
}

function pathInside(repoRoot, candidate) {
  if (!nonEmptyString(candidate) || isAbsolute(candidate) || candidate.includes('\0') || candidate.includes('://')) return false;
  const resolved = resolve(repoRoot, candidate);
  if (!existsSync(resolved)) return false;
  const realRoot = realpathSync(repoRoot);
  const realCandidate = realpathSync(resolved);
  const rel = relative(realRoot, realCandidate);
  if (rel === '' || rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) return false;
  if (!lstatSync(realCandidate).isFile()) return false;
  const normalized = rel.split(sep).join('/');
  return ALLOWED_SOURCE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function versionedFileInside(repoRoot, candidate, prefixes) {
  if (!nonEmptyString(candidate) || isAbsolute(candidate) || candidate.includes('\0') || candidate.includes('://')) return false;
  const resolved = resolve(repoRoot, candidate);
  if (!existsSync(resolved)) return false;
  let sourceStat;
  try { sourceStat = lstatSync(resolved); }
  catch { return false; }
  if (sourceStat.isSymbolicLink() || !sourceStat.isFile()) return false;
  const realRoot = realpathSync(repoRoot);
  const realCandidate = realpathSync(resolved);
  const rel = relative(realRoot, realCandidate);
  if (rel === '' || rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) return false;
  const normalized = rel.split(sep).join('/');
  return prefixes.some((prefix) => normalized.startsWith(prefix));
}

function sha256File(repoRoot, relativePath) {
  return `sha256:${createHash('sha256').update(readFileSync(resolve(repoRoot, relativePath))).digest('hex')}`;
}

export function globMatchesPath(glob, candidate) {
  let expression = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*') {
      if (glob[i + 1] === '*') {
        expression += '.*';
        i += 1;
      } else expression += '[^/]*';
    } else if (char === '?') expression += '[^/]';
    else expression += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  }
  return new RegExp(`${expression}$`).test(candidate.split(sep).join('/'));
}

function addError(errors, code, detail) {
  errors.push(`${code}:${detail}`);
}

function hasExactKeys(object, allowed) {
  return Object.keys(object).length === allowed.size && Object.keys(object).every((key) => allowed.has(key));
}

function validateSelector(selector, tcId) {
  return isPlainObject(selector)
    && hasExactKeys(selector, new Set(['caseId']))
    && selector.caseId === tcId;
}

/**
 * Validate static, Git-versioned definitions.  This is intentionally pure:
 * there is no command string, no shell execution, and no evidence ingestion.
 */
export function validateTraceabilityManifest(manifest, {
  repoRoot,
  knownUcIds = new Set(),
  documentedTcIds = new Set(),
  documentedLeaves = documentedTcIds,
  documentedAcceptanceRefs = new Set(),
  documentationErrors = [],
} = {}) {
  const errors = [];
  if (!isPlainObject(manifest)) return { valid: false, errors: ['manifest_not_object'], stats: {} };
  if (!hasExactKeys(manifest, TOP_LEVEL_KEYS)) addError(errors, 'manifest_fields_invalid', 'top_level');
  if (manifest.schemaVersion !== 1) addError(errors, 'schema_version_invalid', String(manifest.schemaVersion));
  for (const key of ['cases', 'bindings', 'profiles']) {
    if (!Array.isArray(manifest[key])) addError(errors, 'array_missing', key);
  }
  if (!Array.isArray(manifest.requiredLeafTcIds)) addError(errors, 'array_missing', 'requiredLeafTcIds');
  if (errors.length) return { valid: false, errors, stats: {} };

  const caseById = new Map();
  const profileById = new Map();
  const bindingById = new Map();
  const primaryCount = new Map();
  const coverageByUc = new Map();
  const requiredLeafTcIds = new Set();
  for (const tcId of manifest.requiredLeafTcIds ?? []) {
    if (!nonEmptyString(tcId) || requiredLeafTcIds.has(tcId)) addError(errors, 'required_leaf_invalid', String(tcId));
    requiredLeafTcIds.add(tcId);
  }
  for (const documentError of documentationErrors) addError(errors, 'documentation_invalid', documentError);

  for (const profile of manifest.profiles) {
    if (!isPlainObject(profile) || !nonEmptyString(profile.profileId)) {
      addError(errors, 'profile_invalid', JSON.stringify(profile));
      continue;
    }
    if (!hasExactKeys(profile, PROFILE_KEYS)) addError(errors, 'profile_fields_invalid', profile.profileId);
    if (profileById.has(profile.profileId)) addError(errors, 'profile_duplicate', profile.profileId);
    profileById.set(profile.profileId, profile);
    const constraints = profile.attestationConstraints;
    if (!isPlainObject(constraints) || !hasExactKeys(constraints, ATTESTATION_CONSTRAINT_KEYS) || !nonEmptyString(constraints.runnerClass)
      || !ENVIRONMENT_CLASSES.includes(constraints.environmentClass)) {
      addError(errors, 'profile_attestation_constraints_invalid', profile.profileId);
    }
    for (const key of ['minimumSamples', 'minimumConsecutiveRuns', 'maxEvidenceAgeHours']) {
      if (!Number.isInteger(profile[key]) || profile[key] < 1) addError(errors, 'profile_number_invalid', `${profile.profileId}:${key}`);
    }
    if (!versionedFileInside(repoRoot, profile.thresholdPath, ALLOWED_THRESHOLD_PREFIXES)) {
      addError(errors, 'profile_threshold_path_invalid', profile.profileId);
    } else if (!nonEmptyString(profile.thresholdDigest) || !SHA256_DIGEST_PATTERN.test(profile.thresholdDigest)) {
      addError(errors, 'profile_threshold_digest_invalid', profile.profileId);
    } else if (sha256File(repoRoot, profile.thresholdPath) !== profile.thresholdDigest) {
      addError(errors, 'profile_threshold_digest_mismatch', profile.profileId);
    }
  }

  for (const definition of manifest.cases) {
    if (!isPlainObject(definition) || !nonEmptyString(definition.tcId)) {
      addError(errors, 'case_invalid', JSON.stringify(definition));
      continue;
    }
    const { tcId } = definition;
    if (!hasExactKeys(definition, CASE_KEYS)) addError(errors, 'case_fields_invalid', tcId);
    if (caseById.has(tcId)) addError(errors, 'case_duplicate', tcId);
    caseById.set(tcId, definition);
    if (documentedTcIds.size && !documentedTcIds.has(tcId)) addError(errors, 'case_not_documented', tcId);
    if (!Array.isArray(definition.ucIds) || definition.ucIds.length === 0) addError(errors, 'case_uc_missing', tcId);
    for (const ucId of definition.ucIds ?? []) {
      if (!nonEmptyString(ucId) || (knownUcIds.size && !knownUcIds.has(ucId))) addError(errors, 'case_uc_unknown', `${tcId}:${ucId}`);
    }
    if (!FLOW_REFS.includes(definition.flowRef)) addError(errors, 'case_flow_invalid', tcId);
    if (!['group', 'leaf'].includes(definition.lifecycle)) addError(errors, 'case_lifecycle_invalid', tcId);
    if (definition.lifecycle === 'group' && (definition.requiredProfiles?.length || definition.flowRef !== 'main')) {
      addError(errors, 'group_not_executable', tcId);
    }
    if (!Array.isArray(definition.coverageKinds) || definition.coverageKinds.length === 0
      || definition.coverageKinds.some((kind) => !COVERAGE_KINDS.includes(kind))) {
      addError(errors, 'case_coverage_invalid', tcId);
    }
    if (!Array.isArray(definition.acceptanceRefs) || definition.acceptanceRefs.length === 0) addError(errors, 'case_acceptance_missing', tcId);
    for (const acceptanceRef of definition.acceptanceRefs ?? []) {
      if (!nonEmptyString(acceptanceRef) || (documentedAcceptanceRefs.size && !documentedAcceptanceRefs.has(acceptanceRef))) {
        addError(errors, 'case_acceptance_unknown', `${tcId}:${acceptanceRef}`);
      }
    }
    if (!Array.isArray(definition.invariants) || definition.invariants.length === 0
      || definition.invariants.some((invariant) => !nonEmptyString(invariant) || !STATIC_INVARIANTS.has(invariant))) {
      addError(errors, 'case_invariants_invalid', tcId);
    }
    if (!RISK_LEVELS.includes(definition.risk)) addError(errors, 'case_risk_invalid', tcId);
    if (!Array.isArray(definition.requiredProfiles) || definition.requiredProfiles.length === 0) addError(errors, 'case_profiles_missing', tcId);
    for (const profileId of definition.requiredProfiles ?? []) {
      if (!profileById.has(profileId)) addError(errors, 'case_profile_unknown', `${tcId}:${profileId}`);
    }
    if (definition.lifecycle === 'leaf') {
      for (const ucId of definition.ucIds ?? []) {
        const kinds = coverageByUc.get(ucId) ?? new Set();
        for (const kind of definition.coverageKinds ?? []) kinds.add(kind);
        coverageByUc.set(ucId, kinds);
      }
    }
  }

  for (const binding of manifest.bindings) {
    if (!isPlainObject(binding) || !nonEmptyString(binding.bindingId)) {
      addError(errors, 'binding_invalid', JSON.stringify(binding));
      continue;
    }
    const { bindingId, tcId } = binding;
    if (!hasExactKeys(binding, BINDING_KEYS)) addError(errors, 'binding_fields_invalid', bindingId);
    if (bindingById.has(bindingId)) addError(errors, 'binding_duplicate', bindingId);
    bindingById.set(bindingId, binding);
    const definition = caseById.get(tcId);
    if (!definition) {
      addError(errors, 'binding_case_unknown', `${bindingId}:${tcId}`);
      continue;
    }
    if (definition.lifecycle !== 'leaf') addError(errors, 'binding_group_forbidden', bindingId);
    if (!['primary', 'supporting'].includes(binding.role)) addError(errors, 'binding_role_invalid', bindingId);
    if (binding.role === 'primary') primaryCount.set(tcId, (primaryCount.get(tcId) ?? 0) + 1);
    const runner = STATIC_RUNNERS.get(binding.runnerId);
    if (!runner) addError(errors, 'binding_runner_invalid', bindingId);
    if (!validateSelector(binding.selector, tcId)) addError(errors, 'binding_selector_invalid', bindingId);
    if (!Array.isArray(binding.sourceFiles) || binding.sourceFiles.length === 0) addError(errors, 'binding_source_missing', bindingId);
    for (const source of binding.sourceFiles ?? []) {
      if (!pathInside(repoRoot, source) || !SOURCE_EXTENSIONS.has(extname(source))) {
        addError(errors, 'binding_source_invalid', `${bindingId}:${source}`);
      }
    }
    if (runner) {
      const sources = new Set(binding.sourceFiles ?? []);
      if (sources.size !== runner.sources.size || [...runner.sources].some((source) => !sources.has(source))) {
        addError(errors, 'binding_runner_sources_invalid', bindingId);
      }
    }
    if (!Array.isArray(binding.coveredSourceGlobs) || binding.coveredSourceGlobs.length === 0
      || binding.coveredSourceGlobs.some((glob) => !nonEmptyString(glob) || glob.includes('..') || glob.startsWith('/') || glob.includes('://'))) {
      addError(errors, 'binding_covered_sources_invalid', bindingId);
    }
    if (!Array.isArray(binding.fixtureDigests) || binding.fixtureDigests.some((digest) => !nonEmptyString(digest) || !SHA256_DIGEST_PATTERN.test(digest))) {
      addError(errors, 'binding_fixture_digests_invalid', bindingId);
    }
    const everySourceCovered = (binding.sourceFiles ?? []).every((source) =>
      (binding.coveredSourceGlobs ?? []).some((glob) => globMatchesPath(glob, source)));
    if (Array.isArray(binding.coveredSourceGlobs) && !everySourceCovered) {
      addError(errors, 'binding_covered_sources_unmatched', bindingId);
    }
    if (!ENVIRONMENT_CLASSES.includes(binding.requiredEnvironmentClass)) addError(errors, 'binding_environment_invalid', bindingId);
    if (!Array.isArray(binding.assertionIds) || binding.assertionIds.length === 0
      || binding.assertionIds.some((assertion) => !nonEmptyString(assertion))
      || new Set(binding.assertionIds).size !== binding.assertionIds.length
      || (runner
        && (binding.assertionIds.length !== 1 || binding.assertionIds[0] !== runner.assertions.get(tcId)))) {
      addError(errors, 'binding_assertions_invalid', bindingId);
    }
    for (const profileId of definition.requiredProfiles ?? []) {
      const profile = profileById.get(profileId);
      if (profile && profile.attestationConstraints?.environmentClass !== binding.requiredEnvironmentClass) {
        addError(errors, 'binding_profile_environment_mismatch', `${bindingId}:${profileId}`);
      }
    }
  }

  for (const [tcId, definition] of caseById) {
    if (definition.lifecycle === 'leaf' && primaryCount.get(tcId) !== 1) {
      addError(errors, 'case_primary_count_invalid', `${tcId}:${primaryCount.get(tcId) ?? 0}`);
    }
  }
  for (const tcId of requiredLeafTcIds) {
    const definition = caseById.get(tcId);
    if (!documentedLeaves.has(tcId) || !definition || definition.lifecycle !== 'leaf') {
      addError(errors, 'required_leaf_unmapped', tcId);
    }
  }
  for (const definition of caseById.values()) {
    if (definition.lifecycle === 'leaf' && !requiredLeafTcIds.has(definition.tcId)) {
      addError(errors, 'manifest_leaf_not_required', definition.tcId);
    }
  }
  for (const definition of caseById.values()) {
    if (!['P0', 'P1'].includes(definition.risk)) continue;
    for (const ucId of definition.ucIds ?? []) {
      const missing = COVERAGE_KINDS.filter((kind) => !(coverageByUc.get(ucId) ?? new Set()).has(kind));
      if (missing.length) addError(errors, 'uc_coverage_missing', `${ucId}:${missing.join(',')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: sortedUnique(errors),
    stats: {
      caseCount: caseById.size,
      leafCount: [...caseById.values()].filter((item) => item.lifecycle === 'leaf').length,
      groupCount: [...caseById.values()].filter((item) => item.lifecycle === 'group').length,
      bindingCount: bindingById.size,
      profileCount: profileById.size,
      requiredLeafCount: requiredLeafTcIds.size,
    },
  };
}

export function collectDocumentedTraceability(repoRoot, options = {}) {
  const documentationRoots = options.documentationRoots ?? [
    resolve(repoRoot, 'ai-docs/requirements/use-cases'),
    resolve(repoRoot, 'ai-docs/testing'),
  ];
  const tcIds = new Set();
  const ucIds = new Set();
  const acceptanceRefs = new Set();
  const errors = [];
  for (const root of documentationRoots) {
    const scan = docFiles(root, repoRoot);
    errors.push(...scan.errors);
    for (const file of scan.files) {
      let content;
      try { content = readFileSync(file, 'utf8'); }
      catch { errors.push(`documentation_unreadable:${file}`); continue; }
      for (const tcId of extractIds(content, TC_PATTERN)) tcIds.add(tcId);
      for (const ucId of extractIds(content, UC_PATTERN)) ucIds.add(ucId);
      for (const acceptanceRef of extractAcceptanceRefs(content)) acceptanceRefs.add(acceptanceRef);
    }
  }
  const groups = new Set([...tcIds].filter((id) => CLOUD_GROUP_PATTERN.test(id)));
  const leaves = new Set([...tcIds].filter((id) => !groups.has(id)));
  return { tcIds, ucIds, acceptanceRefs, groups, leaves, errors: sortedUnique(errors) };
}

export function traceabilityInventory(manifest, documented) {
  const mappedLeaves = new Set((manifest.cases ?? [])
    .filter((definition) => definition.lifecycle === 'leaf')
    .map((definition) => definition.tcId)
    .filter((tcId) => documented.leaves.has(tcId)));
  const unmappedLeaves = sortedUnique([...documented.leaves].filter((tcId) => !mappedLeaves.has(tcId)));
  const orphanManifestCases = sortedUnique((manifest.cases ?? [])
    .map((definition) => definition.tcId)
    .filter((tcId) => !documented.tcIds.has(tcId)));
  const requiredLeafTcIds = new Set(manifest.requiredLeafTcIds ?? []);
  const requiredMappedLeafCount = [...requiredLeafTcIds].filter((tcId) => mappedLeaves.has(tcId)).length;
  const requiredGap = sortedUnique([...requiredLeafTcIds].filter((tcId) => !mappedLeaves.has(tcId)));
  return {
    documented: { tcCount: documented.tcIds.size, groupCount: documented.groups.size, leafCount: documented.leaves.size, ucCount: documented.ucIds.size },
    mappedLeafCount: mappedLeaves.size,
    unmappedLeafCount: unmappedLeaves.length,
    requiredLeafCount: requiredLeafTcIds.size,
    requiredMappedLeafCount,
    requiredGap,
    unmappedLeaves,
    orphanManifestCases,
  };
}

function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(scriptDir, '..');
  const manifestPath = resolve(repoRoot, 'ai-docs/testing/traceability-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const documented = collectDocumentedTraceability(repoRoot);
  const validation = validateTraceabilityManifest(manifest, {
    repoRoot,
    knownUcIds: documented.ucIds,
    documentedTcIds: documented.tcIds,
    documentedLeaves: documented.leaves,
    documentedAcceptanceRefs: documented.acceptanceRefs,
    documentationErrors: documented.errors,
  });
  const inventory = traceabilityInventory(manifest, documented);
  const includeDetails = process.argv.includes('--details');
  const output = includeDetails
    ? inventory
    : {
      ...inventory,
      unmappedLeaves: undefined,
      unmappedLeafPreview: inventory.unmappedLeaves.slice(0, 20),
      orphanManifestCases: inventory.orphanManifestCases,
    };
  console.log(JSON.stringify({ kind: 'static_traceability_inventory', validation, inventory: output }, null, 2));
  if (!validation.valid) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
