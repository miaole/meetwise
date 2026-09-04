/**
 * Closed E2E failure classification ledger.
 *
 * Common harness pattern (Playwright / Cypress / isolated runners): attribute
 * a failed run to one stack layer so operators do not get an opaque
 * "e2e failed". Codes are allowlisted identifiers. This module never accepts
 * or persists secrets, tokens, prompts, answers, or connection strings.
 *
 * Isolated prove receipts keep their own proofSummary.failureClass vocabulary;
 * do not mix that set with this ledger.
 */

export const E2E_FAILURE_CLASSES = Object.freeze([
  'api',
  'worker',
  'db',
  'provider',
  'capability',
  'data_or_permission',
  'frontend',
]);

const OPAQUE_CODES = Object.freeze([
  'e2e',
  'e2e_failed',
  'failed',
  'unknown',
  'error',
  'none',
]);

const CODE_RE = /^[a-z][a-z0-9_]{0,79}$/;

/** JSON-Schema-shaped check for the two-field record. Not a product contract. */
export const E2E_FAILURE_RECORD_SCHEMA = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: ['class', 'code'],
  properties: {
    class: { type: 'string', enum: [...E2E_FAILURE_CLASSES] },
    code: { type: 'string', pattern: CODE_RE.source, not: { enum: [...OPAQUE_CODES] } },
  },
});

export const E2E_FAILURE_LINE_RE = new RegExp(
  `^E2E_FAILURE class=(${E2E_FAILURE_CLASSES.join('|')}) code=([a-z][a-z0-9_]{0,79})$`,
);

/**
 * Known runner / helper prefixes → ledger class.
 * Product-specific secret names are intentionally absent.
 */
const KNOWN_CODE_CLASS = Object.freeze({
  live_provider_key_missing: 'provider',
  fake_service_mode_forbidden: 'provider',
  e2e_live_voice_gateway_exhausted: 'provider',
  voice_gateway_exhausted: 'provider',
  voice_gateway_network: 'provider',
  isolated_postgres_database_not_ready: 'db',
  isolated_postgres_port_unparseable: 'db',
  isolated_e2e_migrate_failed: 'db',
  e2e_api_db_not_ready: 'db',
  e2e_ui_api_db_not_ready: 'db',
  performance_e2e_database_not_ready: 'db',
  e2e_api_not_ready: 'api',
  e2e_api_exited_before_test: 'api',
  e2e_port_invalid: 'api',
  e2e_port_collision: 'api',
  e2e_ui_port_invalid: 'api',
  e2e_ui_port_collision: 'api',
  e2e_client_exited: 'api',
  client_exited: 'api',
  client_uncaught: 'api',
  assertion: 'api',
  performance_e2e_api_exited_before_test: 'api',
  performance_e2e_port_invalid: 'api',
  performance_e2e_port_collision: 'api',
  e2e_worker_exited_before_test: 'worker',
  e2e_worker_not_ready_before_test: 'worker',
  e2e_ui_worker_not_ready_before_test: 'worker',
  interview_terminal_timeout: 'worker',
  performance_e2e_worker_exited_before_test: 'worker',
  performance_e2e_worker_not_ready_before_test: 'worker',
  e2e_auth_failed: 'data_or_permission',
  e2e_token_uid_missing: 'data_or_permission',
  e2e_question_identity_missing: 'data_or_permission',
  auth_failed: 'data_or_permission',
  token_uid_missing: 'data_or_permission',
  question_identity_missing: 'data_or_permission',
  e2e_isolation_required: 'capability',
  e2e_ui_isolation_required: 'capability',
  performance_e2e_isolation_required: 'capability',
  success_without_assertion_summary: 'capability',
  success_with_failure_class: 'capability',
  e2e_ui_web_not_ready: 'frontend',
  e2e_ui_client_exited: 'frontend',
  web_not_ready: 'frontend',
});

export function isE2EFailureClass(value) {
  return E2E_FAILURE_CLASSES.includes(value);
}

export function isOpaqueFailureCode(code) {
  return OPAQUE_CODES.includes(code);
}

export function parseE2EFailureRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('e2e_failure_record_invalid');
  }
  const keys = Object.keys(value);
  if (keys.length !== 2 || !keys.includes('class') || !keys.includes('code')) {
    throw new Error('e2e_failure_record_invalid');
  }
  if (!isE2EFailureClass(value.class)) throw new Error('e2e_failure_class_invalid');
  if (typeof value.code !== 'string' || !CODE_RE.test(value.code)) {
    throw new Error('e2e_failure_code_invalid');
  }
  if (isOpaqueFailureCode(value.code)) throw new Error('e2e_failure_code_opaque');
  return { class: value.class, code: value.code };
}

export function formatE2EFailure(record) {
  const safe = parseE2EFailureRecord(record);
  return `E2E_FAILURE class=${safe.class} code=${safe.code}`;
}

export function parseE2EFailureLine(text) {
  const source = String(text ?? '');
  const match = source.match(E2E_FAILURE_LINE_RE) ?? source.match(new RegExp(E2E_FAILURE_LINE_RE.source, 'm'));
  if (!match) return null;
  try {
    return parseE2EFailureRecord({ class: match[1], code: match[2] });
  } catch {
    return null;
  }
}

export function parseE2EFailure(error) {
  if (error && typeof error === 'object' && error.e2eFailure) {
    try {
      return parseE2EFailureRecord(error.e2eFailure);
    } catch {
      return null;
    }
  }
  const text = error instanceof Error ? error.message : String(error ?? '');
  return parseE2EFailureLine(text);
}

function prefixCode(message) {
  const raw = String(message ?? '').split(':')[0];
  return CODE_RE.test(raw) ? raw : null;
}

function toLedgerCode(prefix) {
  const stripped = prefix.replace(/^(e2e_|e2e_ui_|performance_e2e_)/, '');
  return CODE_RE.test(stripped) && !isOpaqueFailureCode(stripped) ? stripped : prefix;
}

/**
 * Read a tagged error or map a known runner/helper code.
 * Returns null for opaque blobs such as "E2E 失败" — callers must not invent a class.
 */
export function classifyE2EFailure(error) {
  const tagged = parseE2EFailure(error);
  if (tagged) return tagged;
  const text = error instanceof Error ? error.message : String(error ?? '');
  if (/E2E 失败|e2e failed/i.test(text) && !E2E_FAILURE_LINE_RE.test(text)) return null;
  if (/worker_exit/.test(text)) return parseE2EFailureRecord({ class: 'worker', code: 'worker_exited_during_test' });
  if (/api_exit/.test(text)) return parseE2EFailureRecord({ class: 'api', code: 'api_exited_during_test' });
  const prefix = prefixCode(text);
  if (prefix && KNOWN_CODE_CLASS[prefix]) {
    return parseE2EFailureRecord({ class: KNOWN_CODE_CLASS[prefix], code: toLedgerCode(prefix) });
  }
  if (/DB 未就绪|database_not_ready|isolated_postgres|migrate_failed/i.test(text)) {
    return parseE2EFailureRecord({ class: 'db', code: 'database_not_ready' });
  }
  if (/api 未就绪/i.test(text)) return parseE2EFailureRecord({ class: 'api', code: 'api_not_ready' });
  if (/worker/i.test(text) && /not_ready|未就绪/i.test(text)) {
    return parseE2EFailureRecord({ class: 'worker', code: 'worker_not_ready' });
  }
  if (/web 未就绪/i.test(text)) return parseE2EFailureRecord({ class: 'frontend', code: 'web_not_ready' });
  return null;
}

export function tagE2EFailure(failureClass, code, cause) {
  const record = parseE2EFailureRecord({ class: failureClass, code });
  const error = new Error(formatE2EFailure(record));
  error.name = 'E2EFailure';
  error.e2eFailure = record;
  if (cause !== undefined) error.cause = cause;
  return error;
}

export function emitE2EFailure(record) {
  const line = formatE2EFailure(record);
  // stdout: isolated receipt parser (stderr is withheld there).
  // stderr: interactive runner / operator.
  console.log(line);
  console.error(line);
  return line;
}

export function emitClassifiedE2EFailure(error, fallback) {
  const record = classifyE2EFailure(error) ?? parseE2EFailureRecord(fallback);
  return emitE2EFailure(record);
}
