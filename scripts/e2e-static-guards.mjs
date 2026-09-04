/**
 * Static guards for live E2E runners, evidence/log helpers, and AI paths.
 *
 * 1. Every live E2E runner must import and call assertNoFakeServiceFlags.
 * 2. Evidence/log helpers are scanned for credential-shaped literals.
 *    Findings report path + rule only. Matched secret values are never printed,
 *    persisted, or included in error codes. Missing/unreadable helpers fail closed.
 * 3. Unverified AI paths are refused: server-issued question identity, no client
 *    scoring, no forged zero, and docs must say the path is unverified until checked.
 *    Multi-round verify is allowed. A chat summary is not a pass.
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

export const REQUIRED_AI_PATH_FILES = Object.freeze([
  'e2e/helpers/interview.ts',
  'e2e/helpers/e2e-helpers.proof.ts',
  'e2e/full.e2e.ts',
  'ai-docs/skills/testing/ai-provenance.md',
  'ai-docs/skills/testing/honesty-rules.md',
  'ai-docs/skills/testing/SKILL.md',
]);

const REQUIRED_SECRET_SCAN_EXTRA_PATHS = Object.freeze([
  'e2e/full.e2e.ts',
  'e2e/helpers/e2e-helpers.proof.ts',
]);

const AI_PATH_CONTRACTS = Object.freeze([
  {
    path: 'e2e/helpers/interview.ts',
    required: [
      { rule: 'question_identity_export', pattern: /export function questionIdentity\s*\(/ },
      { rule: 'question_identity_throw', pattern: /e2e_question_identity_missing/ },
      { rule: 'server_issued_identity', pattern: /questionIdentityFromEvent\s*\(\s*event\s*\)/ },
      { rule: 'client_does_not_score', pattern: /client does not score/, raw: true },
      { rule: 'never_invent_question', pattern: /Never invent the current question/, raw: true },
    ],
    forbidden: [
      { rule: 'invented_local_question_id', pattern: /questionId\s*[:=]\s*[`'"][^`'"]*\$\{(?:turn|questions|i|n|index)\b/ },
    ],
  },
  {
    path: 'e2e/helpers/e2e-helpers.proof.ts',
    required: [
      { rule: 'identity_missing_proof', pattern: /e2e_question_identity_missing/ },
      { rule: 'question_identity_proof', pattern: /questionIdentity\(/ },
    ],
    forbidden: [],
  },
  {
    path: 'e2e/full.e2e.ts',
    required: [
      { rule: 'interview_helper_import', pattern: /import\s*\{[^}]*\bdriveInterviewToTerminal\b[^}]*\}\s*from\s*['"]\.\/helpers\/interview\.ts['"]/ },
      { rule: 'interview_helper_call', pattern: /await\s+driveInterviewToTerminal\s*\(/ },
      { rule: 'scoreless_bound_null_score', pattern: /if\s*\(\s*scorelessBound\s*\)\s*\{\s*A\(\s*cand\?\.status === 'assessment_unavailable' && cand\.score === null\s*,/ },
    ],
    forbidden: [
      { rule: 'invented_local_question_id', pattern: /questionId\s*[:=]\s*[`'"][^`'"]*\$\{(?:turn|questions|i|n|index)\b/ },
    ],
  },
  {
    path: 'ai-docs/skills/testing/ai-provenance.md',
    required: [
      { rule: 'unverified_ai_path_phrase', pattern: /unverified AI path/, raw: true },
      { rule: 'refuse_unverified_claim', pattern: /未核不得写/, raw: true },
      { rule: 'question_identity_binding', pattern: /questionIdentity/, raw: true },
      { rule: 'multi_round_verify', pattern: /multi-round/, raw: true },
    ],
    forbidden: [],
  },
  {
    path: 'ai-docs/skills/testing/honesty-rules.md',
    required: [
      { rule: 'unverified_ai_path_phrase', pattern: /unverified AI path/, raw: true },
      { rule: 'multi_round_verify', pattern: /multi-round/, raw: true },
      { rule: 'fake_service_forbidden', pattern: /假服务/, raw: true },
      { rule: 'redaction_fail_closed', pattern: /失败即关/, raw: true },
    ],
    forbidden: [],
  },
  {
    path: 'ai-docs/skills/testing/SKILL.md',
    required: [
      { rule: 'unverified_ai_path_phrase', pattern: /unverified AI path/, raw: true },
      { rule: 'multi_round_verify', pattern: /multi-round/, raw: true },
      { rule: 'static_guards_command', pattern: /e2e-static-guards/, raw: true },
    ],
    forbidden: [],
  },
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
  const e2eRoot = resolve(repoRoot, 'e2e');
  if (existsSync(e2eRoot)) {
    for (const name of readdirSync(e2eRoot)) {
      if (/\.e2e\.ts$/.test(name)) discovered.push(`e2e/${name}`);
    }
  }
  return [...new Set([...REQUIRED_EVIDENCE_HELPER_PATHS, ...REQUIRED_SECRET_SCAN_EXTRA_PATHS, ...discovered])].sort();
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

function extractExportedFunction(source, name) {
  const header = source.match(new RegExp(`export(?: async)? function ${name}\\s*\\([^)]*\\)(?:\\s*:\\s*[^{]+)?\\s*\\{`));
  if (!header || header.index === undefined) return null;
  const open = header.index + header[0].length - 1;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return null;
}

function countMatches(source, pattern) {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  return [...source.matchAll(global)].length;
}

function scanInterviewAiPath(executable, errors) {
  if (/\b(?:score|overall)\s*:/.test(executable) || /\[['"']score['"']\]\s*:/.test(executable)) {
    addError(errors, 'unverified_ai_path_trusted', 'e2e/helpers/interview.ts:client_scores_answer');
  }
  const identity = extractExportedFunction(executable, 'questionIdentity');
  if (!identity) {
    addError(errors, 'unverified_ai_path', 'e2e/helpers/interview.ts:question_identity_export');
    return;
  }
  const throwAt = identity.search(/throw new Error\(['"]e2e_question_identity_missing['"]\)/);
  if (throwAt < 0) addError(errors, 'unverified_ai_path', 'e2e/helpers/interview.ts:question_identity_throw');
  if (!/if\s*\(\s*typeof payload\?\.questionId !== 'string'[\s\S]{0,240}throw new Error\(['"]e2e_question_identity_missing['"]\)/.test(identity)) {
    addError(errors, 'unverified_ai_path', 'e2e/helpers/interview.ts:question_identity_guarded_throw');
  }
  const returnAt = identity.search(/return\s*\{\s*questionId:\s*payload\.questionId/);
  if (returnAt < 0) addError(errors, 'unverified_ai_path', 'e2e/helpers/interview.ts:question_identity_return');
  if (throwAt >= 0 && returnAt >= 0 && throwAt > returnAt) {
    addError(errors, 'unverified_ai_path', 'e2e/helpers/interview.ts:question_identity_throw_after_return');
  }
  const drive = extractExportedFunction(executable, 'driveInterviewToTerminal');
  // #60: progress is not identity. The loop must go through questionIdentityFromEvent
  // (which still calls questionIdentity(event.payload) after kind checks).
  if (!drive || countMatches(drive, /questionIdentityFromEvent\s*\(\s*event\s*\)/) < 2) {
    addError(errors, 'unverified_ai_path', 'e2e/helpers/interview.ts:server_issued_identity');
  }
}

function scanFullE2eAiPath(executable, errors) {
  if (countMatches(executable, /await\s+driveInterviewToTerminal\s*\(/) < 3) {
    addError(errors, 'unverified_ai_path', 'e2e/full.e2e.ts:interview_helper_call');
  }
  if (/if\s*\(\s*false\s*\)[\s\S]{0,120}await\s+driveInterviewToTerminal\s*\(/.test(executable)) {
    addError(errors, 'unverified_ai_path', 'e2e/full.e2e.ts:interview_helper_dead_call');
  }
  if (/(?:async\s+)?function driveInterviewToTerminal\s*\(|(?:const|let|var)\s+driveInterviewToTerminal\s*=/.test(executable)) {
    addError(errors, 'unverified_ai_path_trusted', 'e2e/full.e2e.ts:interview_helper_shadow');
  }
  if (/A\(\s*cand\??\.score === 0/.test(executable) || /if\s*\(\s*scorelessBound\s*\)[\s\S]{0,900}cand\??\.score === 0/.test(executable)) {
    addError(errors, 'unverified_ai_path_trusted', 'e2e/full.e2e.ts:forged_zero_score');
  }
}

function scanUnverifiedAiPathGuards({ readSource }, errors) {
  for (const path of REQUIRED_AI_PATH_FILES) {
    const file = readSource(path);
    if (!file) continue;
    const raw = file.source;
    const executable = /\.md$/.test(path) ? raw : stripJsComments(raw);
    const contract = AI_PATH_CONTRACTS.find((item) => item.path === path);
    if (!contract) continue;
    for (const { rule, pattern, raw: useRaw } of contract.required) {
      if (!pattern.test(useRaw ? raw : executable)) addError(errors, 'unverified_ai_path', `${path}:${rule}`);
    }
    for (const { rule, pattern } of contract.forbidden) {
      if (pattern.test(executable)) addError(errors, 'unverified_ai_path_trusted', `${path}:${rule}`);
    }
    if (path === 'e2e/helpers/interview.ts') scanInterviewAiPath(executable, errors);
    if (path === 'e2e/full.e2e.ts') scanFullE2eAiPath(executable, errors);
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
  const extraHelpers = Object.keys(sources).filter((path) => path.startsWith('e2e/helpers/') || /^e2e\/[^/]+\.e2e\.ts$/.test(path));
  scanFakeServiceGuards({
    repoRoot: '',
    readSource,
    runnerPaths: [...new Set([...REQUIRED_E2E_RUNNER_PATHS, ...extraRunners])].sort(),
  }, errors);
  scanSecretRedaction({
    readSource,
    helperPaths: [...new Set([...REQUIRED_EVIDENCE_HELPER_PATHS, ...REQUIRED_SECRET_SCAN_EXTRA_PATHS, ...extraHelpers])].sort(),
  }, errors);
  scanUnverifiedAiPathGuards({ readSource }, errors);
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
  scanUnverifiedAiPathGuards({ readSource }, errors);
  return {
    valid: errors.length === 0,
    errors: [...errors].sort(),
    stats: {
      runnerCount: runnerPaths.length,
      helperCount: helperPaths.length,
      requiredFlagCount: REQUIRED_FAKE_SERVICE_FLAG_NAMES.length,
      aiPathCount: REQUIRED_AI_PATH_FILES.length,
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
  console.log(`e2e static guards passed: runners=${result.stats.runnerCount} helpers=${result.stats.helperCount} flags=${result.stats.requiredFlagCount} aiPaths=${result.stats.aiPathCount}; releaseEvidence=false`);
}
