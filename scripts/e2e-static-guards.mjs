/**
 * Static guards for live E2E runners and evidence/log helpers.
 *
 * 1. Every live E2E runner must import and call assertNoFakeServiceFlags.
 * 2. Evidence/log helpers are scanned for credential-shaped literals.
 *    Findings report path + rule only. Matched secret values are never printed,
 *    persisted, or included in error codes. Missing/unreadable helpers fail closed.
 *
 * This module reads local files only. It does not execute runners, load .env,
 * or claim releaseEvidence.
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_FAKE_SERVICE_FLAG_NAMES = Object.freeze([
  'VOICE_FAKE',
  'OCR_FAKE',
  'E2E_FAKE_MODEL',
  'ASR_FAKE',
  'TTS_FAKE',
  'EMBED_FAKE',
  'RERANK_FAKE',
  'MODEL_TEST_TRANSPORT_OVERRIDES',
  'DASHSCOPE_TEST_TRANSPORT_OVERRIDES',
]);

export const REQUIRED_E2E_RUNNER_PATHS = Object.freeze([
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-ui.mjs',
  'scripts/run-e2e-isolated.mjs',
  'scripts/run-e2e-performance-suite.mjs',
  'scripts/run-performance-e2e.mjs',
  'scripts/capture-screenshots.mjs',
]);

export const REQUIRED_EVIDENCE_HELPER_PATHS = Object.freeze([
  'scripts/e2e-fake-service-flags.mjs',
  'scripts/withheld-output.mjs',
  'scripts/local-e2e-receipt.mjs',
  'scripts/bounded-command.mjs',
  'scripts/run-e2e.mjs',
  'scripts/run-e2e-isolated.mjs',
  'e2e/helpers/assert.ts',
  'e2e/helpers/auth.ts',
  'e2e/helpers/commerce.ts',
  'e2e/helpers/http.ts',
  'e2e/helpers/interview.ts',
  'e2e/helpers/sse.ts',
  'e2e/helpers/voice.ts',
]);

const FLAG_MODULE_PATH = 'scripts/e2e-fake-service-flags.mjs';
const LIVE_ISOLATED_TARGETS = Object.freeze(['e2e:prove', 'e2e:ui', 'performance:e2e']);
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const IMPORT_PATTERN = /import\s*\{[^}]*\bassertNoFakeServiceFlags\b[^}]*\}\s*from\s*['"]\.\/e2e-fake-service-flags\.mjs['"]/;
const CALL_PATTERN = /assertNoFakeServiceFlags\s*\(/;
const WITHHELD_RETURN_PATTERN = /return `\$\{label\}_bytes=\$\{Buffer\.byteLength\(String\(value\)\)\}`/;
const RECEIPT_DATA_HANDLING = 'no_output_prompt_answer_token_endpoint_or_connection_string_persisted';

const CREDENTIAL_RULES = Object.freeze([
  { rule: 'alibaba_access_key_id', pattern: /\bLTAI[A-Za-z0-9]{12,}\b/ },
  { rule: 'aws_access_key_id', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { rule: 'github_token', pattern: /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/ },
  {
    rule: 'sk_style_api_key',
    pattern: /\bsk-(?!example|test|xxx|placeholder|changeme|dummy|fake|your_)[A-Za-z0-9._-]{16,}\b/,
  },
  {
    rule: 'credential_assignment',
    pattern:
      /\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?key|token|password)\s*[:=]\s*['"`](?![A-Za-z0-9._~+\/-]*(?:password|token|test|proof|fixture|dummy|placeholder|example|changeme|replace_me|xxx|your_|-\d{4}))[A-Za-z0-9._~+\/-]{16,}/i,
  },
  {
    rule: 'named_secret_assignment',
    pattern:
      /\b[A-Za-z][A-Za-z0-9_]*(?:_SECRET|_PASSWORD|_TOKEN|_API_KEY)\s*[:=]\s*['"`](?![A-Za-z0-9._~+\/-]*(?:password|token|test|proof|fixture|dummy|placeholder|example|changeme|replace_me|xxx|your_|-\d{4}))[A-Za-z0-9._~+\/-]{16,}/,
  },
]);

function stripJsComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function addError(errors, code, detail) {
  errors.push(`${code}:${detail}`);
}

function safeRelative(repoRoot, file) {
  if (typeof file !== 'string' || file.startsWith('/') || file.includes('\0') || file.includes('..')) return null;
  const resolved = resolve(repoRoot, file);
  const normalized = relative(repoRoot, resolved).split(sep).join('/');
  if (normalized.startsWith('../') || normalized.includes('/node_modules/')) return null;
  return { resolved, normalized };
}

function readWorktreeFile(repoRoot, file, errors) {
  const located = safeRelative(repoRoot, file);
  if (!located) {
    addError(errors, 'path_escape', file);
    return null;
  }
  if (!existsSync(located.resolved)) {
    addError(errors, 'helper_missing', located.normalized);
    return null;
  }
  try {
    const stat = lstatSync(located.resolved);
    if (stat.isSymbolicLink()) {
      addError(errors, 'helper_symlink', located.normalized);
      return null;
    }
    if (!stat.isFile()) {
      addError(errors, 'helper_not_file', located.normalized);
      return null;
    }
    if (stat.size > MAX_FILE_BYTES) {
      addError(errors, 'helper_too_large', located.normalized);
      return null;
    }
    const realRoot = realpathSync(repoRoot);
    const realFile = realpathSync(located.resolved);
    const realRelative = relative(realRoot, realFile).split(sep).join('/');
    if (realRelative.startsWith('../')) {
      addError(errors, 'path_escape', located.normalized);
      return null;
    }
    return { path: located.normalized, source: readFileSync(located.resolved, 'utf8') };
  } catch {
    addError(errors, 'helper_unreadable', located.normalized);
    return null;
  }
}

function listedFakeServiceFlags(source) {
  const block = source.match(/FORBIDDEN_FAKE_SERVICE_FLAGS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
  if (!block) return [];
  return [...block[1].matchAll(/'([A-Z][A-Z0-9_]+)'/g)].map((match) => match[1]);
}

function discoverHelperPaths(repoRoot) {
  const helpersRoot = resolve(repoRoot, 'e2e/helpers');
  const discovered = [];
  if (existsSync(helpersRoot)) {
    for (const name of readdirSync(helpersRoot)) {
      if (/\.proof\.(?:ts|mjs)$/.test(name)) continue;
      if (/\.(?:ts|mjs)$/.test(name)) discovered.push(`e2e/helpers/${name}`);
    }
  }
  return [...new Set([...REQUIRED_EVIDENCE_HELPER_PATHS, ...discovered])].sort();
}

function discoverRunnerPaths(repoRoot) {
  const scriptsRoot = resolve(repoRoot, 'scripts');
  if (!existsSync(scriptsRoot)) return [...REQUIRED_E2E_RUNNER_PATHS];
  const discovered = readdirSync(scriptsRoot)
    .filter((name) => /^(?:run-e2e.*|run-performance-e2e|capture-screenshots)\.mjs$/.test(name))
    .map((name) => `scripts/${name}`);
  return [...new Set([...REQUIRED_E2E_RUNNER_PATHS, ...discovered])].sort();
}

function scanFakeServiceGuards({ repoRoot, readSource, runnerPaths }, errors) {
  const flagFile = readSource(FLAG_MODULE_PATH);
  if (!flagFile) return;
  const listed = listedFakeServiceFlags(flagFile.source);
  if (!listed.includes('VOICE_FAKE')) addError(errors, 'fake_service_flag_list_unreadable', FLAG_MODULE_PATH);
  for (const name of REQUIRED_FAKE_SERVICE_FLAG_NAMES) {
    if (!listed.includes(name)) addError(errors, 'fake_service_flag_unlisted', name);
  }
  if (!/export function assertNoFakeServiceFlags/.test(flagFile.source) || !/fake_service_mode_forbidden/.test(flagFile.source)) {
    addError(errors, 'fake_service_assert_missing', FLAG_MODULE_PATH);
  }

  for (const runnerPath of runnerPaths) {
    const file = readSource(runnerPath);
    if (!file) continue;
    const executable = stripJsComments(file.source);
    if (!IMPORT_PATTERN.test(executable)) addError(errors, 'fake_service_import_missing', runnerPath);
    if (!CALL_PATTERN.test(executable)) addError(errors, 'fake_service_call_missing', runnerPath);
    if (runnerPath === 'scripts/run-e2e-isolated.mjs') {
      const liveSet = executable.match(/LIVE_E2E_TARGETS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
      if (!liveSet) addError(errors, 'fake_service_live_target_set_missing', runnerPath);
      else {
        for (const target of LIVE_ISOLATED_TARGETS) {
          if (!liveSet[1].includes(`'${target}'`)) addError(errors, 'fake_service_live_target_missing', `${runnerPath}:${target}`);
        }
      }
      if (!/LIVE_E2E_TARGETS\.has\(target\)\) assertNoFakeServiceFlags/.test(executable)) {
        addError(errors, 'fake_service_live_gate_missing', runnerPath);
      }
    }
  }
}

function scanSecretRedaction({ readSource, helperPaths }, errors) {
  for (const helperPath of helperPaths) {
    const file = readSource(helperPath);
    if (!file) continue;
    if (helperPath === 'scripts/withheld-output.mjs') {
      if (!WITHHELD_RETURN_PATTERN.test(file.source) || /(?:createHash|digest)\([^)]*value|value\.slice\(/.test(file.source)) {
        addError(errors, 'withheld_output_contract_missing', helperPath);
      }
    }
    if (helperPath === 'scripts/local-e2e-receipt.mjs'
      && (file.source.split(RECEIPT_DATA_HANDLING).length - 1) < 2) {
      addError(errors, 'receipt_data_handling_missing', helperPath);
    }
    if (helperPath === 'scripts/bounded-command.mjs' && !/stderr\.on\('data',\s*\(\)\s*=>\s*\{\}\)/.test(file.source)) {
      addError(errors, 'bounded_command_stderr_retained', helperPath);
    }
    for (const { rule, pattern } of CREDENTIAL_RULES) {
      const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
      if (global.test(file.source)) addError(errors, 'credential_pattern', `${helperPath}:${rule}`);
    }
  }
}

export function evaluateE2eStaticGuards({ sources } = {}) {
  const errors = [];
  if (!isObject(sources)) {
    return { valid: false, errors: ['scan_input_invalid'], releaseEvidence: false };
  }
  const readSource = (path) => {
    if (!Object.hasOwn(sources, path)) {
      addError(errors, 'helper_missing', path);
      return null;
    }
    const source = sources[path];
    if (typeof source !== 'string') {
      addError(errors, 'helper_unreadable', path);
      return null;
    }
    return { path, source };
  };
  const extraRunners = Object.keys(sources).filter((path) => /^(?:scripts\/run-e2e.*|scripts\/run-performance-e2e|scripts\/capture-screenshots)\.mjs$/.test(path));
  scanFakeServiceGuards({
    repoRoot: '',
    readSource,
    runnerPaths: [...new Set([...REQUIRED_E2E_RUNNER_PATHS, ...extraRunners])].sort(),
  }, errors);
  scanSecretRedaction({
    readSource,
    helperPaths: [...new Set([...REQUIRED_EVIDENCE_HELPER_PATHS, ...Object.keys(sources).filter((path) => path.startsWith('e2e/helpers/'))])].sort(),
  }, errors);
  return { valid: errors.length === 0, errors: [...errors].sort(), releaseEvidence: false };
}

export function scanE2eStaticGuards({ repoRoot } = {}) {
  const errors = [];
  if (typeof repoRoot !== 'string' || repoRoot.length === 0) {
    return { valid: false, errors: ['root_missing'], releaseEvidence: false };
  }
  if (!existsSync(repoRoot)) return { valid: false, errors: ['root_missing'], releaseEvidence: false };
  try {
    if (lstatSync(repoRoot).isSymbolicLink()) return { valid: false, errors: ['root_symlink'], releaseEvidence: false };
  } catch {
    return { valid: false, errors: ['root_unreadable'], releaseEvidence: false };
  }

  const runnerPaths = discoverRunnerPaths(repoRoot);
  const helperPaths = discoverHelperPaths(repoRoot);
  const readSource = (path) => readWorktreeFile(repoRoot, path, errors);
  scanFakeServiceGuards({ repoRoot, readSource, runnerPaths }, errors);
  scanSecretRedaction({ readSource, helperPaths }, errors);
  return {
    valid: errors.length === 0,
    errors: [...errors].sort(),
    stats: {
      runnerCount: runnerPaths.length,
      helperCount: helperPaths.length,
      requiredFlagCount: REQUIRED_FAKE_SERVICE_FLAG_NAMES.length,
    },
    releaseEvidence: false,
  };
}

const invokedDirectly = (() => {
  try {
    return resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();

if (invokedDirectly) {
  const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const requestedRoot = process.argv[2];
  const repoRoot = requestedRoot ? resolve(requestedRoot) : defaultRoot;
  const result = scanE2eStaticGuards({ repoRoot });
  if (!result.valid) {
    console.error('E2E static guards failed:');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log(`e2e static guards passed: runners=${result.stats.runnerCount} helpers=${result.stats.helperCount} flags=${result.stats.requiredFlagCount}; releaseEvidence=false`);
}
