import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectDocumentedTraceability,
  traceabilityInventory,
  validateTraceabilityManifest,
} from './quality-traceability-check.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repoRoot, 'ai-docs/testing/traceability-manifest.json');
const documented = collectDocumentedTraceability(repoRoot);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function resultFor(candidate, docs = documented) {
  return validateTraceabilityManifest(candidate, {
    repoRoot,
    knownUcIds: docs.ucIds,
    documentedTcIds: docs.tcIds,
    documentedLeaves: docs.leaves,
    documentedAcceptanceRefs: docs.acceptanceRefs,
    documentationErrors: docs.errors,
  });
}

function expectError(candidate, prefix, docs = documented) {
  const result = resultFor(candidate, docs);
  assert.equal(result.valid, false, `expected ${prefix} to be rejected`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

const checks = {
  'TC-quality-01-main': () => {
    const result = resultFor(manifest);
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.stats.leafCount, 28);
    assert.equal(result.stats.bindingCount, 28);
    assert.equal(result.stats.requiredLeafCount, 28);
    assert.deepEqual(
      [...new Set(manifest.cases
        .filter((item) => item.lifecycle === 'leaf' && item.tcId.startsWith('TC-quality-0'))
        .filter((item) => ['UC-quality-01', 'UC-quality-02'].includes(item.ucIds[0]))
        .map((item) => item.tcId))].sort(),
      Object.keys(checks).sort(),
      'the traceability runner must expose exactly one selectable proof for every traceability TC',
    );
  },
  'TC-quality-01-E1': () => {
    const candidate = clone(manifest);
    candidate.cases.push(clone(candidate.cases[0]));
    expectError(candidate, 'case_duplicate:TC-quality-01-main');
  },
  'TC-quality-01-E2': () => {
    const candidate = clone(manifest);
    candidate.bindings.push({ ...clone(candidate.bindings[0]), bindingId: 'duplicate-primary' });
    expectError(candidate, 'case_primary_count_invalid:TC-quality-01-main:2');
  },
  'TC-quality-01-E3': () => {
    const candidate = clone(manifest);
    candidate.bindings[3].runnerId = 'sh';
    candidate.bindings[3].selector = { caseId: 'TC-quality-01-E3', command: 'curl attacker.example' };
    candidate.bindings[3].sourceFiles = ['https://attacker.example/test.mjs', 'node_modules', 'apps/api/src/main.ts'];
    candidate.bindings[3].assertionIds = ['not-the-registered-assertion'];
    expectError(candidate, 'binding_runner_invalid:quality-01-e3-primary');
    expectError(candidate, 'binding_selector_invalid:quality-01-e3-primary');
    expectError(candidate, 'binding_source_invalid:quality-01-e3-primary:https://attacker.example/test.mjs');
    expectError(candidate, 'binding_source_invalid:quality-01-e3-primary:node_modules');
    expectError(candidate, 'binding_covered_sources_unmatched:quality-01-e3-primary');
    const wrongStaticRunnerSource = clone(manifest);
    wrongStaticRunnerSource.bindings[3].sourceFiles = ['scripts/quality-traceability-check.mjs', 'apps/api/src/main.ts'];
    wrongStaticRunnerSource.bindings[3].coveredSourceGlobs = ['scripts/**/*.mjs', 'apps/**/*.ts'];
    wrongStaticRunnerSource.bindings[3].assertionIds = ['not-the-registered-assertion'];
    expectError(wrongStaticRunnerSource, 'binding_runner_sources_invalid:quality-01-e3-primary');
    expectError(wrongStaticRunnerSource, 'binding_assertions_invalid:quality-01-e3-primary');
  },
  'TC-quality-01-E4': () => {
    const candidate = clone(manifest);
    candidate.bindings[4].assertionIds = [];
    candidate.bindings[4].fixtureDigests = [{}];
    candidate.cases[4].status = 'passed';
    candidate.cases[4].invariants = [{}];
    candidate.profiles[0].thresholdDigest = 'sha256:not-a-digest';
    expectError(candidate, 'binding_assertions_invalid:quality-01-e4-primary');
    expectError(candidate, 'binding_fixture_digests_invalid:quality-01-e4-primary');
    expectError(candidate, 'case_fields_invalid:TC-quality-01-E4');
    expectError(candidate, 'case_invariants_invalid:TC-quality-01-E4');
    expectError(candidate, 'profile_threshold_digest_invalid:pr-local');
  },
  'TC-quality-01-E5': () => {
    const candidate = clone(manifest);
    candidate.bindings[5].requiredEnvironmentClass = 'cloud';
    candidate.profiles[0].thresholdDigest = `sha256:${'0'.repeat(64)}`;
    expectError(candidate, 'binding_profile_environment_mismatch:quality-01-e5-primary:pr-local');
    expectError(candidate, 'profile_threshold_digest_mismatch:pr-local');
  },
  'TC-quality-01-E6': () => {
    const candidate = clone(manifest);
    candidate.bindings[6].sourceFiles = ['../outside/quality-traceability.proof.mjs'];
    candidate.bindings[6].coveredSourceGlobs = ['docs/**/*.md'];
    expectError(candidate, 'binding_source_invalid:quality-01-e6-primary:../outside/quality-traceability.proof.mjs');
    expectError(candidate, 'binding_covered_sources_unmatched:quality-01-e6-primary');
  },
  'TC-quality-02-main': () => {
    const inventory = traceabilityInventory(manifest, documented);
    assert.equal(inventory.mappedLeafCount, 28);
    assert.ok(inventory.unmappedLeafCount > 0, 'static inventory must report unmapped documented TC instead of inventing coverage');
    assert.equal(inventory.orphanManifestCases.length, 0);
  },
  'TC-quality-02-E1': () => {
    const inventory = traceabilityInventory(manifest, documented);
    assert.equal(inventory.documented.tcCount, new Set([...documented.tcIds]).size);
    assert.equal(inventory.documented.leafCount + inventory.documented.groupCount, inventory.documented.tcCount);
    for (const groupId of ['TC-CLOUD-TEST', 'TC-CLOUD-TEST-001', 'TC-CLOUD-TEST-002', 'TC-CLOUD-TEST-003']) {
      assert.ok(documented.groups.has(groupId), `${groupId} must remain a documented group, not a leaf`);
      assert.ok(!documented.leaves.has(groupId), `${groupId} must not inflate the documented leaf inventory`);
    }
  },
  'TC-quality-02-E2': () => {
    const candidate = clone(manifest);
    candidate.bindings.push({ ...clone(candidate.bindings[8]), bindingId: 'quality-02-e1-second-primary', tcId: 'TC-quality-02-E1' });
    expectError(candidate, 'case_primary_count_invalid:TC-quality-02-E1:2');
  },
  'TC-quality-02-E3': () => {
    const candidate = clone(manifest);
    candidate.cases[10].ucIds = ['UC-not-real-99'];
    candidate.cases[10].acceptanceRefs = ['UC-quality-02.acceptance.missing'];
    expectError(candidate, 'case_uc_unknown:TC-quality-02-E3:UC-not-real-99');
    expectError(candidate, 'case_acceptance_unknown:TC-quality-02-E3:UC-quality-02.acceptance.missing');
  },
  'TC-quality-02-E4': () => {
    const candidate = clone(manifest);
    candidate.cases[11].tcId = 'TC-quality-02-E4-rewritten';
    const inventory = traceabilityInventory(candidate, documented);
    assert.ok(inventory.orphanManifestCases.includes('TC-quality-02-E4-rewritten'));
    assert.ok(inventory.unmappedLeaves.includes('TC-quality-02-E4'));
    const fixtureRoot = mkdtempSync(resolve(repoRoot, '.tmp/meetwise-traceability-'));
    const rootLink = `${fixtureRoot}-root-link`;
    const danglingRootLink = `${fixtureRoot}-dangling-root-link`;
    try {
      writeFileSync(resolve(fixtureRoot, 'inside.md'), 'UC-quality-01 TC-quality-01-main');
      symlinkSync(resolve(fixtureRoot, 'inside.md'), resolve(fixtureRoot, 'outside-link.md'));
      const scanned = collectDocumentedTraceability(repoRoot, { documentationRoots: [fixtureRoot] });
      assert.ok(scanned.errors.some((error) => error.startsWith('documentation_symlink_forbidden:')));
      symlinkSync(fixtureRoot, rootLink);
      const rootScanned = collectDocumentedTraceability(repoRoot, { documentationRoots: [rootLink] });
      assert.ok(rootScanned.errors.some((error) => error.startsWith('documentation_symlink_forbidden:')));
      symlinkSync(`${fixtureRoot}-missing`, danglingRootLink);
      const danglingRootScanned = collectDocumentedTraceability(repoRoot, { documentationRoots: [danglingRootLink] });
      assert.ok(danglingRootScanned.errors.some((error) => error.startsWith('documentation_symlink_forbidden:')));
      const missingRootScanned = collectDocumentedTraceability(repoRoot, { documentationRoots: [`${fixtureRoot}-missing-root`] });
      assert.ok(missingRootScanned.errors.some((error) => error.startsWith('documentation_root_missing:')));
    } finally {
      rmSync(rootLink, { recursive: true, force: true });
      rmSync(danglingRootLink, { recursive: true, force: true });
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  },
  'TC-quality-02-E5': () => {
    const candidate = clone(manifest);
    candidate.cases[12].requiredProfiles = ['release-cloud'];
    expectError(candidate, 'case_profile_unknown:TC-quality-02-E5:release-cloud');
  },
  'TC-quality-02-E6': () => {
    const syntheticDocs = {
      tcIds: new Set([...documented.tcIds, 'TC-quality-99-main']),
      ucIds: documented.ucIds,
      groups: documented.groups,
      leaves: new Set([...documented.leaves, 'TC-quality-99-main']),
    };
    const inventory = traceabilityInventory(manifest, syntheticDocs);
    assert.ok(inventory.unmappedLeaves.includes('TC-quality-99-main'));
    assert.equal(inventory.mappedLeafCount, 28, 'an unknown documented TC cannot be counted as mapped');
    const candidate = clone(manifest);
    candidate.requiredLeafTcIds.push('TC-quality-99-main');
    expectError(candidate, 'required_leaf_unmapped:TC-quality-99-main');
  },
};

const selectedIndex = process.argv.indexOf('--case');
const selected = selectedIndex >= 0 ? process.argv[selectedIndex + 1] : undefined;
const selectedChecks = selected ? [[selected, checks[selected]]] : Object.entries(checks);
if (selected && !checks[selected]) throw new Error(`unknown_traceability_case:${selected}`);

for (const [tcId, check] of selectedChecks) {
  check();
  console.log(`✓ ${tcId}`);
}
console.log(`static_preflight_valid: selected=${selectedChecks.length}/${Object.keys(checks).length}; releaseEvidence=false`);
