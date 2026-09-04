/**
 * Deterministic proofs for e2e test/assertion parity.
 * Does not execute live E2E and never sets releaseEvidence.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkE2EParity,
  extractParityCalls,
  scanParitySources,
  stripCommentsPreservingStrings,
  validateParityDocuments,
} from './e2e-parity-check.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_OPTS = Object.freeze({ criticalProveScripts: [], includeHelpers: false });

function createFixtureRoot() {
  mkdirSync(resolve(repoRoot, '.tmp'), { recursive: true });
  const fixture = mkdtempSync(resolve(repoRoot, '.tmp/e2e-parity-'));
  mkdirSync(resolve(fixture, 'e2e'), { recursive: true });
  mkdirSync(resolve(fixture, 'scripts'), { recursive: true });
  mkdirSync(resolve(fixture, 'ai-docs/testing'), { recursive: true });
  return fixture;
}

function write(fixture, relativePath, text) {
  const target = resolve(fixture, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text, 'utf8');
}

function sampleSource(extra = '') {
  return [
    "const { A } = { A: (c, m) => { if (!c) throw new Error(m); } };",
    "A(status === 200 && typeof id === 'string', 'create order returns id');",
    extra,
  ].filter(Boolean).join('\n');
}

function fixtureScan(fixture) {
  return scanParitySources(fixture, FIXTURE_OPTS);
}

function baselineFrom(scan) {
  return {
    schemaVersion: 1,
    releaseEvidence: false,
    scope: 'fixture',
    files: scan.files,
  };
}

function emptyAllowlist(entries = []) {
  return { schemaVersion: 1, releaseEvidence: false, entries };
}

function expectError(result, prefix) {
  assert.equal(result.valid, false, `expected ${prefix} to fail, errors=${result.errors.join(',')}`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
}

function allowlistEntry(overrides = {}) {
  const assertion = overrides.removedAssertions?.[0];
  return {
    id: 'E2E-PARITY-20260904-drop-order-id',
    path: 'e2e/full.e2e.ts',
    reason: 'Product retired this HTTP assertion after the contract moved to resume:prove.',
    removedTests: [],
    removedAssertions: assertion ? overrides.removedAssertions : [],
    removedFile: false,
    ...overrides,
  };
}

const checks = {
  'TC-e2e-parity-01-main': () => {
    const result = checkE2EParity(repoRoot);
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.stats.releaseEvidence, false);
    assert.equal(result.stats.fileCount, 7);
    assert.equal(result.stats.testCount, 18);
    assert.equal(result.stats.assertionCount, 137);
    assert.equal(result.stats.allowlistCount, 0);
  },

  'TC-e2e-parity-01-E1': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      write(fixture, 'e2e/full.e2e.ts', "const { A } = { A: () => {} };\nA(true, 'toy leftover');\n");
      const scan = fixtureScan(fixture);
      const first = validateParityDocuments(baseline, emptyAllowlist(), { scan });
      const second = validateParityDocuments(baseline, emptyAllowlist(), { scan });
      expectError(first, 'assertion_removed:e2e/full.e2e.ts:create order returns id');
      assert.deepEqual(first.errors, second.errors);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-01-E2': () => {
    const left = createFixtureRoot();
    const right = createFixtureRoot();
    try {
      write(left, 'e2e/full.e2e.ts', sampleSource());
      write(right, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(scanParitySources(left, FIXTURE_OPTS));
      const weakened = "const { A } = { A: () => {} };\nA(true, 'toy leftover');\n";
      write(left, 'e2e/full.e2e.ts', weakened);
      write(right, 'e2e/full.e2e.ts', weakened);
      const [one, two] = [left, right].map((root) => {
        const scan = scanParitySources(root, FIXTURE_OPTS);
        return validateParityDocuments(baseline, emptyAllowlist(), { scan });
      });
      assert.equal(one.valid, false);
      expectError(one, 'assertion_removed');
      assert.deepEqual(one.errors, two.errors);
      assert.deepEqual([...one.errors].sort(), one.errors);
    } finally {
      rmSync(left, { recursive: true, force: true });
      rmSync(right, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-01-E3': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const scan = fixtureScan(fixture);
      const escaped = baselineFrom(scan);
      escaped.files['../secret.ts'] = {
        testCount: 0,
        assertionCount: 0,
        tests: [],
        assertions: [],
      };
      expectError(validateParityDocuments(escaped, emptyAllowlist(), { scan }), 'baseline_path_invalid:../secret.ts');

      const linked = resolve(fixture, 'e2e/link.e2e.ts');
      symlinkSync(resolve(fixture, 'e2e/full.e2e.ts'), linked);
      const linkedScan = fixtureScan(fixture);
      assert.ok(linkedScan.errors.some((error) => error.startsWith('symlink_forbidden:')), linkedScan.errors.join(','));
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-01-E4': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      const baselinePath = resolve(fixture, 'ai-docs/testing/e2e-parity-baseline.json');
      const allowlistPath = resolve(fixture, 'ai-docs/testing/e2e-parity-allowlist.json');
      write(fixture, 'ai-docs/testing/e2e-parity-baseline.json', JSON.stringify(baseline));
      write(fixture, 'ai-docs/testing/e2e-parity-allowlist.json', JSON.stringify(emptyAllowlist()));
      const beforeBytes = `${readFileSync(baselinePath, 'utf8')}::${readFileSync(allowlistPath, 'utf8')}`;
      write(fixture, 'e2e/full.e2e.ts', '// emptied\n');
      const result = validateParityDocuments(baseline, emptyAllowlist(), { scan: fixtureScan(fixture) });
      expectError(result, 'assertion_removed');
      const afterBytes = `${readFileSync(baselinePath, 'utf8')}::${readFileSync(allowlistPath, 'utf8')}`;
      assert.equal(afterBytes, beforeBytes);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-01-E5': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const result = checkE2EParity(fixture);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some((error) => error.startsWith('baseline_unreadable:')), result.errors.join(','));
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-01-E6': () => {
    const fixture = createFixtureRoot();
    try {
      rmSync(resolve(fixture, 'e2e'), { recursive: true, force: true });
      const emptyScan = fixtureScan(fixture);
      assert.ok(emptyScan.errors.some((error) => error.startsWith('source_empty:e2e')), emptyScan.errors.join(','));
      mkdirSync(resolve(fixture, 'e2e'), { recursive: true });
      write(fixture, 'e2e/huge.e2e.ts', `${'A(true, "x");\n'.repeat(8)}/* ${'z'.repeat(520_000)} */`);
      const huge = fixtureScan(fixture);
      assert.ok(huge.errors.some((error) => error.startsWith('file_too_large:')), huge.errors.join(','));
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-main': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      const removed = baseline.files['e2e/full.e2e.ts'].assertions[0];
      write(fixture, 'e2e/full.e2e.ts', 'const x = 1;\n');
      const result = validateParityDocuments(baseline, emptyAllowlist([allowlistEntry({
        removedAssertions: [removed],
        removedTests: baseline.files['e2e/full.e2e.ts'].tests,
      })]), { scan: fixtureScan(fixture) });
      assert.equal(result.valid, true, result.errors.join('\n'));
      assert.equal(result.stats.releaseEvidence, false);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E1': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      const removed = baseline.files['e2e/full.e2e.ts'].assertions[0];
      const result = validateParityDocuments(baseline, emptyAllowlist([allowlistEntry({
        reason: 'todo',
        removedAssertions: [removed],
      })]), { scan: fixtureScan(fixture) });
      expectError(result, 'allowlist_reason_invalid');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E2': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      const result = validateParityDocuments(baseline, emptyAllowlist([allowlistEntry({
        removedAssertions: [{
          kind: 'A',
          label: 'not in baseline',
          conditionDigest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        }],
      })]), { scan: fixtureScan(fixture) });
      expectError(result, 'allowlist_unknown_assertion');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E3': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      const removed = baseline.files['e2e/full.e2e.ts'].assertions[0];
      const result = validateParityDocuments(baseline, emptyAllowlist([allowlistEntry({
        removedAssertions: [removed],
      })]), { scan: fixtureScan(fixture) });
      expectError(result, 'allowlist_still_present');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E4': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      const removed = baseline.files['e2e/full.e2e.ts'].assertions[0];
      const entry = allowlistEntry({ removedAssertions: [removed] });
      const result = validateParityDocuments(baseline, emptyAllowlist([entry, { ...entry }]), { scan: fixtureScan(fixture) });
      expectError(result, 'allowlist_id_duplicate');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E5': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const baseline = baselineFrom(fixtureScan(fixture));
      write(fixture, 'e2e/full.e2e.ts', [
        "const { A } = { A: (c, m) => { if (!c) throw new Error(m); } };",
        "A(true, 'create order returns id');",
      ].join('\n'));
      const result = validateParityDocuments(baseline, emptyAllowlist(), { scan: fixtureScan(fixture) });
      expectError(result, 'assertion_removed:e2e/full.e2e.ts:create order returns id');
      expectError(result, 'assertion_untracked:e2e/full.e2e.ts:create order returns id');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E6': () => {
    const commented = extractParityCalls([
      '// A(status === 200 && id, "create order returns id");',
      'const text = "A(true, \'not a call\')";',
      "A(ready, 'still required');",
    ].join('\n'));
    assert.equal(commented.assertions.length, 1);
    assert.equal(commented.assertions[0].label, 'still required');
      assert.equal(stripCommentsPreservingStrings('A(1, "x"); // A(2, "y")').includes('A(2'), false);
      const bait = extractParityCalls('const ignore = /A(status === 200, "create order returns id")/;\nA(ready, "live");\n');
      assert.equal(bait.assertions.length, 1);
      assert.equal(bait.assertions[0].label, 'live');
  },

  'TC-e2e-parity-02-E7': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      const previous = baselineFrom(fixtureScan(fixture));
      write(fixture, 'e2e/full.e2e.ts', "const { A } = { A: () => {} };\nA(true, 'toy leftover');\n");
      const shrunk = baselineFrom(fixtureScan(fixture));
      const result = validateParityDocuments(shrunk, emptyAllowlist(), {
        scan: fixtureScan(fixture),
        previousBaseline: previous,
      });
      expectError(result, 'baseline_identity_dropped');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },

  'TC-e2e-parity-02-E8': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'e2e/full.e2e.ts', sampleSource("test('keeps the ledger', () => { A(ok, 'kept'); });"));
      const baseline = baselineFrom(fixtureScan(fixture));
      write(fixture, 'e2e/gone.e2e.ts', 'test("orphan", () => { A(1, "x"); });');
      expectError(validateParityDocuments(baseline, emptyAllowlist(), { scan: fixtureScan(fixture) }), 'file_untracked');
      write(fixture, 'e2e/full.e2e.ts', sampleSource());
      expectError(validateParityDocuments(baseline, emptyAllowlist(), { scan: fixtureScan(fixture) }), 'test_removed');
      const claimed = baselineFrom(fixtureScan(fixture));
      claimed.releaseEvidence = true;
      expectError(validateParityDocuments(claimed, emptyAllowlist(), { scan: fixtureScan(fixture) }), 'release_evidence_claimed');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
};

let failed = 0;
for (const [name, run] of Object.entries(checks)) {
  try {
    run();
    console.log(`PASS e2e-parity: ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL e2e-parity: ${name}`);
    console.error(error);
  }
}

console.log(failed === 0
  ? `PASS e2e-parity proof: ${Object.keys(checks).length} scenarios; releaseEvidence=false`
  : `FAIL e2e-parity proof: ${failed} failed`);
if (failed) process.exitCode = 1;
