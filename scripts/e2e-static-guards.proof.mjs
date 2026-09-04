import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertNoFakeServiceFlags, enabledFakeServiceFlags } from './e2e-fake-service-flags.mjs';
import {
  REQUIRED_E2E_RUNNER_PATHS,
  REQUIRED_EVIDENCE_HELPER_PATHS,
  evaluateE2eStaticGuards,
  scanE2eStaticGuards,
} from './e2e-static-guards.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const guardScript = join(repoRoot, 'scripts/e2e-static-guards.mjs');

function readRepo(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function currentSources() {
  const sources = { 'scripts/e2e-fake-service-flags.mjs': readRepo('scripts/e2e-fake-service-flags.mjs') };
  for (const path of REQUIRED_E2E_RUNNER_PATHS) sources[path] = readRepo(path);
  for (const path of REQUIRED_EVIDENCE_HELPER_PATHS) sources[path] = readRepo(path);
  return sources;
}

function expectError(result, prefix) {
  assert.equal(result.valid, false, `expected ${prefix} to fail`);
  assert.ok(result.errors.some((error) => error.startsWith(prefix)), `missing ${prefix}: ${result.errors.join(', ')}`);
  assert.equal(result.releaseEvidence, false);
}

function writeTree(root, files) {
  for (const [relativePath, source] of Object.entries(files)) {
    const target = join(root, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, source, 'utf8');
  }
}

function captureGuard(repo) {
  return new Promise((resolveProcess) => {
    let output = '';
    const child = spawn(process.execPath, [guardScript, repo], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] });
    const append = (chunk) => { output += chunk.toString('utf8'); };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('exit', (code) => resolveProcess({ code: code ?? 1, output }));
  });
}

const checks = {
  'TC-TEST-GUARD-001-main': () => {
    const result = scanE2eStaticGuards({ repoRoot });
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.releaseEvidence, false);
    assert.ok(result.stats.runnerCount >= REQUIRED_E2E_RUNNER_PATHS.length);
    assert.equal(result.stats.helperCount, REQUIRED_EVIDENCE_HELPER_PATHS.length);
    assert.equal(result.stats.requiredFlagCount, 9);
  },
  'TC-TEST-GUARD-001-evaluate-current': () => {
    const result = evaluateE2eStaticGuards({ sources: currentSources() });
    assert.equal(result.valid, true, result.errors.join('\n'));
    assert.equal(result.releaseEvidence, false);
  },
  'TC-TEST-GUARD-002-missing-import': () => {
    const sources = currentSources();
    sources['scripts/run-e2e.mjs'] = sources['scripts/run-e2e.mjs']
      .replace("import { assertNoFakeServiceFlags } from './e2e-fake-service-flags.mjs';\n", '')
      .replace('assertNoFakeServiceFlags(env);\n', '');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_import_missing:scripts/run-e2e.mjs');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_call_missing:scripts/run-e2e.mjs');
  },
  'TC-TEST-GUARD-002-commented-call': () => {
    const sources = currentSources();
    sources['scripts/run-e2e.mjs'] = sources['scripts/run-e2e.mjs']
      .replace('assertNoFakeServiceFlags(env);', '// assertNoFakeServiceFlags(env);');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_call_missing:scripts/run-e2e.mjs');
  },
  'TC-TEST-GUARD-002-multi-import': () => {
    const sources = currentSources();
    sources['scripts/run-e2e.mjs'] = sources['scripts/run-e2e.mjs']
      .replace(
        "import { assertNoFakeServiceFlags } from './e2e-fake-service-flags.mjs';",
        "import { enabledFakeServiceFlags, assertNoFakeServiceFlags } from './e2e-fake-service-flags.mjs';",
      );
    const result = evaluateE2eStaticGuards({ sources });
    assert.equal(result.valid, true, result.errors.join('\n'));
  },
  'TC-TEST-GUARD-003-unlisted-flag': () => {
    const sources = currentSources();
    sources['scripts/e2e-fake-service-flags.mjs'] = sources['scripts/e2e-fake-service-flags.mjs'].replace("  'EMBED_FAKE',\n", '');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_flag_unlisted:EMBED_FAKE');
  },
  'TC-TEST-GUARD-004-missing-helper-fail-closed': () => {
    const sources = currentSources();
    delete sources['scripts/withheld-output.mjs'];
    expectError(evaluateE2eStaticGuards({ sources }), 'helper_missing:scripts/withheld-output.mjs');
  },
  'TC-TEST-GUARD-005-isolated-live-targets': () => {
    const sources = currentSources();
    sources['scripts/run-e2e-isolated.mjs'] = sources['scripts/run-e2e-isolated.mjs']
      .replace("const LIVE_E2E_TARGETS = new Set(['e2e:prove', 'e2e:ui', 'performance:e2e']);\n", 'const LIVE_E2E_TARGETS = new Set([]);\n')
      .replace('if (LIVE_E2E_TARGETS.has(target)) assertNoFakeServiceFlags(inheritedEnv);\n', '');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_call_missing:scripts/run-e2e-isolated.mjs');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_live_gate_missing:scripts/run-e2e-isolated.mjs');
    expectError(evaluateE2eStaticGuards({ sources }), 'fake_service_live_target_missing:scripts/run-e2e-isolated.mjs:e2e:prove');
  },
  'TC-TEST-GUARD-006-receipt-contract': () => {
    const sources = currentSources();
    sources['scripts/local-e2e-receipt.mjs'] = sources['scripts/local-e2e-receipt.mjs']
      .replaceAll("dataHandling: 'no_output_prompt_answer_token_endpoint_or_connection_string_persisted'", "dataHandling: 'raw_output_allowed'");
    expectError(evaluateE2eStaticGuards({ sources }), 'receipt_data_handling_missing:scripts/local-e2e-receipt.mjs');
  },
  'TC-TEST-GUARD-007-secret-never-echoed': async () => {
    const secret = ['sk-', 'live_', 'abcdefghijklmnopqrstuv'].join('');
    const fixture = mkdtempSync(join(tmpdir(), 'meetwise-e2e-static-guards-'));
    try {
      const files = {
        'scripts/e2e-fake-service-flags.mjs': readRepo('scripts/e2e-fake-service-flags.mjs'),
      };
      for (const path of REQUIRED_E2E_RUNNER_PATHS) files[path] = readRepo(path);
      for (const path of REQUIRED_EVIDENCE_HELPER_PATHS) files[path] = readRepo(path);
      files['e2e/helpers/http.ts'] = `${readRepo('e2e/helpers/http.ts')}\nexport const leaked = '${secret}';\n`;
      writeTree(fixture, files);
      const result = scanE2eStaticGuards({ repoRoot: fixture });
      expectError(result, 'credential_pattern:e2e/helpers/http.ts:sk_style_api_key');
      assert.ok(!JSON.stringify(result).includes(secret), 'secret echoed in result');
      const captured = await captureGuard(fixture);
      assert.notEqual(captured.code, 0);
      assert.ok(!captured.output.includes(secret), 'secret echoed in CLI output');
      assert.match(captured.output, /credential_pattern:e2e\/helpers\/http\.ts:sk_style_api_key/);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-TEST-GUARD-008-missing-root-fail-closed': () => {
    const result = scanE2eStaticGuards({ repoRoot: join(repoRoot, '.tmp', 'missing-e2e-static-guards-root') });
    expectError(result, 'root_missing');
  },
  'TC-TEST-GUARD-009-invalid-evaluate-input': () => {
    expectError(evaluateE2eStaticGuards({}), 'scan_input_invalid');
  },
  'TC-TEST-GUARD-010-runtime-flags': () => {
    assert.deepEqual(enabledFakeServiceFlags({ EMBED_FAKE: '1', RERANK_FAKE: 'true', VOICE_FAKE: '0' }), ['EMBED_FAKE', 'RERANK_FAKE']);
    assert.throws(
      () => assertNoFakeServiceFlags({ MODEL_TEST_TRANSPORT_OVERRIDES: '1' }),
      /fake_service_mode_forbidden:MODEL_TEST_TRANSPORT_OVERRIDES/,
    );
    assert.throws(
      () => assertNoFakeServiceFlags({ DASHSCOPE_TEST_TRANSPORT_OVERRIDES: '1' }),
      /fake_service_mode_forbidden:DASHSCOPE_TEST_TRANSPORT_OVERRIDES/,
    );
    assert.doesNotThrow(() => assertNoFakeServiceFlags({ VOICE_FAKE: '0', OCR_FAKE: 'false', E2E_FAKE_MODEL: '' }));
  },
  'TC-TEST-GUARD-011-named-secret-assignment': () => {
    const sources = currentSources();
    sources['e2e/helpers/http.ts'] += "\nexport const PAY_SECRET = 'abcdefghijklmnop';\n";
    expectError(evaluateE2eStaticGuards({ sources }), 'credential_pattern:e2e/helpers/http.ts:named_secret_assignment');
    assert.ok(!JSON.stringify(evaluateE2eStaticGuards({ sources })).includes('abcdefghijklmnop'), 'secret echoed in result');
  },
  'TC-TEST-GUARD-012-discovered-helper': async () => {
    const secret = ['sk-', 'live_', 'zyxwvutsrqponmlkjihg'].join('');
    const fixture = mkdtempSync(join(tmpdir(), 'meetwise-e2e-static-helpers-'));
    try {
      const files = { 'scripts/e2e-fake-service-flags.mjs': readRepo('scripts/e2e-fake-service-flags.mjs') };
      for (const path of REQUIRED_E2E_RUNNER_PATHS) files[path] = readRepo(path);
      for (const path of REQUIRED_EVIDENCE_HELPER_PATHS) files[path] = readRepo(path);
      files['e2e/helpers/extra-log.ts'] = `export const leaked = '${secret}';\n`;
      writeTree(fixture, files);
      const result = scanE2eStaticGuards({ repoRoot: fixture });
      expectError(result, 'credential_pattern:e2e/helpers/extra-log.ts:sk_style_api_key');
      assert.ok(!JSON.stringify(result).includes(secret), 'secret echoed in result');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
};

for (const [id, check] of Object.entries(checks)) {
  await check();
  console.log(`✓ ${id}`);
}
console.log(`e2e static guards proof passed: selected=${Object.keys(checks).length}/${Object.keys(checks).length}; releaseEvidence=false`);
